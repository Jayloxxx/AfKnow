import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MapView, DetailTab, UserMarker, SavedMap, MapElement, CountryMilitaryData } from '../types';

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Active tab
  activeTab: 'explorer' | 'editor' | 'my-maps' | 'live-intel' | 'op-lage' | 'takt-lage' | 'intel-mosaic' | 'osint-lage' | 'mil-vergleich' | 'knowledge' | 'lage';
  setActiveTab: (tab: 'explorer' | 'editor' | 'my-maps' | 'live-intel' | 'op-lage' | 'takt-lage' | 'intel-mosaic' | 'osint-lage' | 'mil-vergleich' | 'knowledge' | 'lage') => void;

  // Live Intel settings
  intelUpdateInterval: number; // minutes
  setIntelUpdateInterval: (mins: number) => void;

  // Map state
  mapView: MapView;
  setMapView: (view: MapView) => void;
  showRivers: boolean;
  toggleRivers: () => void;
  showCapitals: boolean;
  toggleCapitals: () => void;
  showAirports: boolean;
  toggleAirports: () => void;
  showPorts: boolean;
  togglePorts: () => void;
  showLabels: boolean;
  toggleLabels: () => void;
  showActors: boolean;
  toggleActors: () => void;
  showResources: boolean;
  toggleResources: () => void;
  showReligions: boolean;
  toggleReligions: () => void;
  showEconBlocs: boolean;
  toggleEconBlocs: () => void;
  selectedEconBloc: string;
  setSelectedEconBloc: (id: string) => void;
  mapZoom: number;
  setMapZoom: (z: number) => void;
  mapPan: { x: number; y: number };
  setMapPan: (p: { x: number; y: number }) => void;

  // Selected country
  selectedCountryId: string | null;
  selectCountry: (id: string | null) => void;
  detailTab: DetailTab;
  setDetailTab: (tab: DetailTab) => void;

  // Search
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Auth
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  user: { id: string; email: string } | null;
  setUser: (u: { id: string; email: string } | null) => void;

  // User markers
  userMarkers: UserMarker[];
  addMarker: (m: UserMarker) => void;
  removeMarker: (id: string) => void;
  updateMarker: (id: string, updates: Partial<UserMarker>) => void;

  // Editor
  editorElements: MapElement[];
  setEditorElements: (els: MapElement[]) => void;
  addEditorElement: (el: MapElement) => void;
  updateEditorElement: (id: string, updates: Partial<MapElement>) => void;
  removeEditorElement: (id: string) => void;
  selectedEditorElement: string | null;
  setSelectedEditorElement: (id: string | null) => void;

  // Saved maps
  savedMaps: SavedMap[];
  setSavedMaps: (maps: SavedMap[]) => void;
  addSavedMap: (map: SavedMap) => void;
  removeSavedMap: (id: string) => void;

  // User templates
  userTemplates: import('../components/editor/templates').MapTemplate[];
  addUserTemplate: (tpl: import('../components/editor/templates').MapTemplate) => void;
  removeUserTemplate: (id: string) => void;

  // Clipboard image from explorer clip tool
  clipboardImage: string | null;
  clipboardImageBounds: { x: number; y: number; w: number; h: number } | null;
  setClipboardImage: (dataUrl: string | null, bounds?: { x: number; y: number; w: number; h: number } | null) => void;

  // Export
  exportOpen: boolean;
  setExportOpen: (open: boolean) => void;

  // Highlighted countries (for filtering)
  highlightedCountries: string[];
  setHighlightedCountries: (ids: string[]) => void;

  // Custom military data (user edits/additions)
  customMilitaryData: Record<string, CountryMilitaryData>;
  setCountryMilitaryData: (countryId: string, data: CountryMilitaryData) => void;
  clearCountryMilitaryData: (countryId: string) => void;

  // Custom country details — multiple knowledge entries per country+tab
  customCountryDetails: Record<string, { id: string; text: string; source: string; sourceLabel: string; createdAt: string; updatedAt: string }[]>;
  addCountryDetailEntry: (countryId: string, tabKey: string, entry: { id: string; text: string; source: string; sourceLabel: string; createdAt: string; updatedAt: string }) => void;
  updateCountryDetailEntry: (countryId: string, tabKey: string, entryId: string, updates: { text: string; source: string; sourceLabel: string }) => void;
  removeCountryDetailEntry: (countryId: string, tabKey: string, entryId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.className = `theme-${next}`;
          return { theme: next };
        }),

      activeTab: 'explorer',
      setActiveTab: (tab) => set({ activeTab: tab }),

      intelUpdateInterval: 30,
      setIntelUpdateInterval: (mins) => set({ intelUpdateInterval: mins }),

      mapView: 'political',
      setMapView: (view) => set({ mapView: view }),
      showRivers: true,
      toggleRivers: () => set((s) => ({ showRivers: !s.showRivers })),
      showCapitals: true,
      toggleCapitals: () => set((s) => ({ showCapitals: !s.showCapitals })),
      showAirports: false,
      toggleAirports: () => set((s) => ({ showAirports: !s.showAirports })),
      showPorts: true,
      togglePorts: () => set((s) => ({ showPorts: !s.showPorts })),
      showLabels: true,
      toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
      showActors: false,
      toggleActors: () => set((s) => ({ showActors: !s.showActors })),
      showResources: false,
      toggleResources: () => set((s) => ({ showResources: !s.showResources })),
      showReligions: false,
      toggleReligions: () => set((s) => ({ showReligions: !s.showReligions })),
      showEconBlocs: false,
      toggleEconBlocs: () => set((s) => ({ showEconBlocs: !s.showEconBlocs })),
      selectedEconBloc: '',
      setSelectedEconBloc: (id) => set({ selectedEconBloc: id }),
      mapZoom: 1,
      setMapZoom: (z) => set({ mapZoom: z }),
      mapPan: { x: 0, y: 0 },
      setMapPan: (p) => set({ mapPan: p }),

      selectedCountryId: null,
      selectCountry: (id) => set({ selectedCountryId: id, detailTab: 'overview' }),
      detailTab: 'overview',
      setDetailTab: (tab) => set({ detailTab: tab }),

      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open, searchQuery: open ? '' : '' }),
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      authOpen: false,
      setAuthOpen: (open) => set({ authOpen: open }),
      user: null,
      setUser: (u) => {
        if (u) {
          set({ user: u });
        } else {
          set({
            user: null,
            userMarkers: [],
            savedMaps: [],
            customMilitaryData: {},
            customCountryDetails: {},
            editorElements: [],
            selectedEditorElement: null,
            clipboardImage: null,
            clipboardImageBounds: null,
          });
          try { localStorage.removeItem('afknow-storage'); } catch {}
        }
      },

      userMarkers: [],
      addMarker: (m) => set((s) => ({ userMarkers: [...s.userMarkers, m] })),
      removeMarker: (id) => set((s) => ({ userMarkers: s.userMarkers.filter((m) => m.id !== id) })),
      updateMarker: (id, updates) =>
        set((s) => ({
          userMarkers: s.userMarkers.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      editorElements: [],
      setEditorElements: (els) => set({ editorElements: els }),
      addEditorElement: (el) => set((s) => ({ editorElements: [...s.editorElements, el] })),
      updateEditorElement: (id, updates) =>
        set((s) => ({
          editorElements: s.editorElements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
        })),
      removeEditorElement: (id) =>
        set((s) => ({ editorElements: s.editorElements.filter((el) => el.id !== id) })),
      selectedEditorElement: null,
      setSelectedEditorElement: (id) => set({ selectedEditorElement: id }),

      savedMaps: [],
      setSavedMaps: (maps) => set({ savedMaps: maps }),
      addSavedMap: (map) => set((s) => ({ savedMaps: [...s.savedMaps, map] })),
      removeSavedMap: (id) => set((s) => ({ savedMaps: s.savedMaps.filter((m) => m.id !== id) })),

      userTemplates: [],
      addUserTemplate: (tpl) => set((s) => ({ userTemplates: [...s.userTemplates, tpl] })),
      removeUserTemplate: (id) => set((s) => ({ userTemplates: s.userTemplates.filter((t) => t.id !== id) })),

      clipboardImage: null,
      clipboardImageBounds: null,
      setClipboardImage: (dataUrl, bounds = null) => set({ clipboardImage: dataUrl, clipboardImageBounds: bounds }),

      exportOpen: false,
      setExportOpen: (open) => set({ exportOpen: open }),

      highlightedCountries: [],
      setHighlightedCountries: (ids) => set({ highlightedCountries: ids }),

      customMilitaryData: {},
      setCountryMilitaryData: (countryId, data) =>
        set((s) => ({ customMilitaryData: { ...s.customMilitaryData, [countryId]: data } })),
      clearCountryMilitaryData: (countryId) =>
        set((s) => {
          const next = { ...s.customMilitaryData };
          delete next[countryId];
          return { customMilitaryData: next };
        }),

      customCountryDetails: {},
      addCountryDetailEntry: (countryId, tabKey, entry) =>
        set((s) => {
          const key = `${countryId}:${tabKey}`;
          const existing = s.customCountryDetails[key] ?? [];
          return { customCountryDetails: { ...s.customCountryDetails, [key]: [entry, ...existing] } };
        }),
      updateCountryDetailEntry: (countryId, tabKey, entryId, updates) =>
        set((s) => {
          const key = `${countryId}:${tabKey}`;
          const entries = (s.customCountryDetails[key] ?? []).map((e) =>
            e.id === entryId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          );
          return { customCountryDetails: { ...s.customCountryDetails, [key]: entries } };
        }),
      removeCountryDetailEntry: (countryId, tabKey, entryId) =>
        set((s) => {
          const key = `${countryId}:${tabKey}`;
          const entries = (s.customCountryDetails[key] ?? []).filter((e) => e.id !== entryId);
          const next = { ...s.customCountryDetails };
          if (entries.length === 0) delete next[key];
          else next[key] = entries;
          return { customCountryDetails: next };
        }),
    }),
    {
      name: 'afknow-storage',
      partialize: (s) => ({
        theme: s.theme,
        userMarkers: s.userMarkers,
        savedMaps: s.savedMaps,
        userTemplates: s.userTemplates,
        showRivers: s.showRivers,
        showCapitals: s.showCapitals,
        showPorts: s.showPorts,
        showLabels: s.showLabels,
        customMilitaryData: s.customMilitaryData,
        customCountryDetails: s.customCountryDetails,
      }),
    }
  )
);
