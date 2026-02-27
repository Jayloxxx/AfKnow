import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import {
  supabase,
  fetchUserMarkers, upsertMarker, deleteMarker as deleteMarkerDb,
  fetchSavedMaps, upsertSavedMap, deleteSavedMap as deleteSavedMapDb,
  fetchCustomMilData, upsertCustomMilData,
  fetchCustomCountryDetails, upsertCustomCountryDetail, deleteCustomCountryDetail,
  fetchUserSettings, upsertUserSettings,
  type UserSettings, type CountryDetailEntry,
} from '../lib/supabase';
import type { UserMarker, SavedMap, CountryMilitaryData } from '../types';

// Simple debounce
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// Shallow compare arrays of ids
function idsChanged(a: { id: string }[], b: { id: string }[]): boolean {
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return true;
  }
  return false;
}

export function useSupabaseSync() {
  const hydrating = useRef(false);
  const prevMarkers = useRef<UserMarker[]>([]);
  const prevMaps = useRef<SavedMap[]>([]);
  const prevMilData = useRef<Record<string, CountryMilitaryData>>({});
  const prevSettings = useRef<string>('');
  const prevDetails = useRef<Record<string, CountryDetailEntry[]>>({});

  // ── Session restore on mount ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        useStore.getState().setUser({ id: session.user.id, email: session.user.email || '' });
        hydrateFromSupabase(session.user.id);
      }
    });
  }, []);

  // ── Auth state listener ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        useStore.getState().setUser({ id: session.user.id, email: session.user.email || '' });
        hydrateFromSupabase(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        useStore.getState().setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Hydrate store from Supabase ──
  async function hydrateFromSupabase(userId: string) {
    hydrating.current = true;
    try {
      const [markers, maps, milData, settings, details] = await Promise.all([
        fetchUserMarkers(userId),
        fetchSavedMaps(userId),
        fetchCustomMilData(userId),
        fetchUserSettings(userId),
        fetchCustomCountryDetails(userId),
      ]);

      const store = useStore.getState();

      // Markers: Supabase wins, but keep local markers that don't have userId (pre-login)
      const localOnly = store.userMarkers.filter(m => !m.userId);
      const merged = [...markers, ...localOnly];
      store.setSavedMaps(maps.length > 0 ? maps : store.savedMaps);

      // Need to set markers directly — no bulk setter in store, so use internal set
      useStore.setState({ userMarkers: merged });

      // Military data
      if (Object.keys(milData).length > 0) {
        useStore.setState({ customMilitaryData: { ...store.customMilitaryData, ...milData } });
      }

      // Settings
      if (settings) {
        if (settings.theme !== store.theme) {
          document.documentElement.className = `theme-${settings.theme}`;
          useStore.setState({ theme: settings.theme });
        }
        useStore.setState({
          showRivers: settings.showRivers,
          showCapitals: settings.showCapitals,
          showAirports: settings.showAirports,
          showPorts: settings.showPorts,
          showLabels: settings.showLabels,
        });
      }

      // Custom country details
      if (Object.keys(details).length > 0) {
        useStore.setState({ customCountryDetails: { ...store.customCountryDetails, ...details } });
      }

      // Update refs to avoid triggering sync for hydrated data
      prevMarkers.current = useStore.getState().userMarkers;
      prevMaps.current = useStore.getState().savedMaps;
      prevMilData.current = useStore.getState().customMilitaryData;
      prevSettings.current = settingsKey(useStore.getState());
      prevDetails.current = useStore.getState().customCountryDetails;
    } catch (err) {
      console.error('Hydration error:', err);
    } finally {
      hydrating.current = false;
    }
  }

  // ── Store subscription for pushing changes ──
  useEffect(() => {
    const syncMarkers = debounce(async (markers: UserMarker[], userId: string) => {
      // Find added/updated
      const prevIds = new Set(prevMarkers.current.map(m => m.id));
      const currIds = new Set(markers.map(m => m.id));

      // Deleted
      for (const m of prevMarkers.current) {
        if (!currIds.has(m.id)) await deleteMarkerDb(m.id);
      }
      // Added/updated
      for (const m of markers) {
        if (!prevIds.has(m.id)) await upsertMarker(userId, m);
      }
      prevMarkers.current = markers;
    }, 500);

    const syncMaps = debounce(async (maps: SavedMap[], userId: string) => {
      const prevIds = new Set(prevMaps.current.map(m => m.id));
      const currIds = new Set(maps.map(m => m.id));

      for (const m of prevMaps.current) {
        if (!currIds.has(m.id)) await deleteSavedMapDb(m.id);
      }
      for (const m of maps) {
        if (!prevIds.has(m.id) || JSON.stringify(m) !== JSON.stringify(prevMaps.current.find(p => p.id === m.id))) {
          await upsertSavedMap(userId, m);
        }
      }
      prevMaps.current = maps;
    }, 500);

    const syncMilData = debounce(async (milData: Record<string, CountryMilitaryData>, userId: string) => {
      const prevKeys = new Set(Object.keys(prevMilData.current));
      const currKeys = new Set(Object.keys(milData));

      for (const key of currKeys) {
        if (!prevKeys.has(key) || JSON.stringify(milData[key]) !== JSON.stringify(prevMilData.current[key])) {
          await upsertCustomMilData(userId, key, milData[key]);
        }
      }
      prevMilData.current = milData;
    }, 500);

    const syncSettings = debounce(async (state: any, userId: string) => {
      const settings: UserSettings = {
        theme: state.theme,
        showRivers: state.showRivers,
        showCapitals: state.showCapitals,
        showAirports: state.showAirports,
        showPorts: state.showPorts,
        showLabels: state.showLabels,
      };
      await upsertUserSettings(userId, settings);
    }, 1000);

    const syncDetails = debounce(async (details: Record<string, CountryDetailEntry[]>, userId: string) => {
      // Collect all previous entry ids
      const prevEntryIds = new Set<string>();
      for (const entries of Object.values(prevDetails.current)) {
        for (const e of entries) prevEntryIds.add(e.id);
      }
      // Collect all current entry ids
      const currEntryIds = new Set<string>();
      for (const entries of Object.values(details)) {
        for (const e of entries) currEntryIds.add(e.id);
      }
      // Delete removed entries
      for (const id of prevEntryIds) {
        if (!currEntryIds.has(id)) await deleteCustomCountryDetail(id);
      }
      // Upsert new or changed entries
      for (const [key, entries] of Object.entries(details)) {
        const [countryId, tabKey] = key.split(':');
        const prevEntries = prevDetails.current[key] ?? [];
        const prevMap = new Map(prevEntries.map(e => [e.id, e]));
        for (const entry of entries) {
          const prev = prevMap.get(entry.id);
          if (!prev || JSON.stringify(prev) !== JSON.stringify(entry)) {
            await upsertCustomCountryDetail(userId, countryId, tabKey, entry);
          }
        }
      }
      prevDetails.current = details;
    }, 500);

    const unsub = useStore.subscribe((state, prev) => {
      if (hydrating.current || !state.user) return;
      const userId = state.user.id;

      // Markers
      if (state.userMarkers !== prev.userMarkers && idsChanged(state.userMarkers, prevMarkers.current)) {
        syncMarkers(state.userMarkers, userId);
      }

      // Maps
      if (state.savedMaps !== prev.savedMaps) {
        syncMaps(state.savedMaps, userId);
      }

      // Military data
      if (state.customMilitaryData !== prev.customMilitaryData) {
        syncMilData(state.customMilitaryData, userId);
      }

      // Settings
      const currKey = settingsKey(state);
      if (currKey !== prevSettings.current) {
        prevSettings.current = currKey;
        syncSettings(state, userId);
      }

      // Country details
      if (state.customCountryDetails !== prev.customCountryDetails) {
        syncDetails(state.customCountryDetails, userId);
      }
    });

    return unsub;
  }, []);
}

function settingsKey(s: { theme: string; showRivers: boolean; showCapitals: boolean; showAirports: boolean; showPorts: boolean; showLabels: boolean }): string {
  return `${s.theme}|${s.showRivers}|${s.showCapitals}|${s.showAirports}|${s.showPorts}|${s.showLabels}`;
}
