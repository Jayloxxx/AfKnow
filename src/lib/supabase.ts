import { createClient } from '@supabase/supabase-js';
import type { UserMarker, SavedMap, CountryMilitaryData } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── User Markers ──────────────────────────

export async function fetchUserMarkers(userId: string): Promise<UserMarker[]> {
  const { data, error } = await supabase
    .from('user_markers')
    .select('*')
    .eq('user_id', userId);
  if (error) { console.error('fetchUserMarkers:', error); return []; }
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    coords: [r.coords[0], r.coords[1]] as [number, number],
    type: r.type,
    color: r.color,
    notes: r.notes,
    countryId: r.country_id,
    userId: r.user_id,
  }));
}

export async function upsertMarker(userId: string, marker: UserMarker) {
  const { error } = await supabase.from('user_markers').upsert({
    id: marker.id,
    user_id: userId,
    name: marker.name,
    coords: marker.coords,
    type: marker.type,
    color: marker.color,
    notes: marker.notes ?? null,
    country_id: marker.countryId ?? null,
  });
  if (error) console.error('upsertMarker:', error);
}

export async function deleteMarker(id: string) {
  const { error } = await supabase.from('user_markers').delete().eq('id', id);
  if (error) console.error('deleteMarker:', error);
}

// ── Saved Maps ──────────────────────────

export async function fetchSavedMaps(userId: string): Promise<SavedMap[]> {
  const { data, error } = await supabase
    .from('saved_maps')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) { console.error('fetchSavedMaps:', error); return []; }
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    elements: r.elements ?? [],
    thumbnail: r.thumbnail,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    userId: r.user_id,
  }));
}

export async function upsertSavedMap(userId: string, map: SavedMap) {
  const { error } = await supabase.from('saved_maps').upsert({
    id: map.id,
    user_id: userId,
    name: map.name,
    description: map.description ?? null,
    elements: map.elements,
    thumbnail: map.thumbnail ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('upsertSavedMap:', error);
}

export async function deleteSavedMap(id: string) {
  const { error } = await supabase.from('saved_maps').delete().eq('id', id);
  if (error) console.error('deleteSavedMap:', error);
}

// ── Custom Military Data ──────────────────────────

export async function fetchCustomMilData(userId: string): Promise<Record<string, CountryMilitaryData>> {
  const { data, error } = await supabase
    .from('custom_military_data')
    .select('*')
    .eq('user_id', userId);
  if (error) { console.error('fetchCustomMilData:', error); return {}; }
  const result: Record<string, CountryMilitaryData> = {};
  for (const r of data ?? []) {
    result[r.country_id] = r.data as CountryMilitaryData;
  }
  return result;
}

export async function upsertCustomMilData(userId: string, countryId: string, milData: CountryMilitaryData) {
  const { error } = await supabase.from('custom_military_data').upsert(
    { user_id: userId, country_id: countryId, data: milData, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,country_id' }
  );
  if (error) console.error('upsertCustomMilData:', error);
}

export async function deleteCustomMilData(userId: string, countryId: string) {
  const { error } = await supabase
    .from('custom_military_data')
    .delete()
    .eq('user_id', userId)
    .eq('country_id', countryId);
  if (error) console.error('deleteCustomMilData:', error);
}

// ── Custom Country Details ──────────────────────────

export interface CountryDetailEntry {
  id: string;
  text: string;
  source: string;
  sourceLabel: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchCustomCountryDetails(userId: string): Promise<Record<string, CountryDetailEntry[]>> {
  const { data, error } = await supabase
    .from('custom_country_details')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchCustomCountryDetails:', error); return {}; }
  const result: Record<string, CountryDetailEntry[]> = {};
  for (const r of data ?? []) {
    const key = `${r.country_id}:${r.tab_key}`;
    (result[key] ??= []).push({
      id: r.id,
      text: r.text,
      source: r.source || '',
      sourceLabel: r.source_label || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
  }
  return result;
}

export async function upsertCustomCountryDetail(userId: string, countryId: string, tabKey: string, entry: CountryDetailEntry) {
  const { error } = await supabase.from('custom_country_details').upsert({
    id: entry.id,
    user_id: userId,
    country_id: countryId,
    tab_key: tabKey,
    text: entry.text,
    source: entry.source,
    source_label: entry.sourceLabel,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  });
  if (error) console.error('upsertCustomCountryDetail:', error);
}

export async function deleteCustomCountryDetail(entryId: string) {
  const { error } = await supabase
    .from('custom_country_details')
    .delete()
    .eq('id', entryId);
  if (error) console.error('deleteCustomCountryDetail:', error);
}

// ── User Settings ──────────────────────────

export interface UserSettings {
  theme: 'dark' | 'light';
  showRivers: boolean;
  showCapitals: boolean;
  showAirports: boolean;
  showPorts: boolean;
  showLabels: boolean;
}

export async function fetchUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return {
    theme: data.theme,
    showRivers: data.show_rivers,
    showCapitals: data.show_capitals,
    showAirports: data.show_airports,
    showPorts: data.show_ports,
    showLabels: data.show_labels,
  };
}

export async function upsertUserSettings(userId: string, settings: UserSettings) {
  const { error } = await supabase.from('user_settings').upsert({
    user_id: userId,
    theme: settings.theme,
    show_rivers: settings.showRivers,
    show_capitals: settings.showCapitals,
    show_airports: settings.showAirports,
    show_ports: settings.showPorts,
    show_labels: settings.showLabels,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('upsertUserSettings:', error);
}

/*
  Supabase SQL Setup - Run this in your Supabase SQL Editor:

  -- User markers
  CREATE TABLE IF NOT EXISTS user_markers (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    coords FLOAT8[] NOT NULL,
    type TEXT DEFAULT 'custom',
    color TEXT DEFAULT '#D4A74F',
    notes TEXT,
    country_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Saved maps
  CREATE TABLE IF NOT EXISTS saved_maps (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    elements JSONB DEFAULT '[]',
    thumbnail TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Custom military data edits
  CREATE TABLE IF NOT EXISTS custom_military_data (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    country_id TEXT NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, country_id)
  );

  -- User settings
  CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    theme TEXT DEFAULT 'dark',
    show_rivers BOOLEAN DEFAULT true,
    show_capitals BOOLEAN DEFAULT true,
    show_airports BOOLEAN DEFAULT false,
    show_ports BOOLEAN DEFAULT true,
    show_labels BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- RLS
  ALTER TABLE user_markers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE saved_maps ENABLE ROW LEVEL SECURITY;
  ALTER TABLE custom_military_data ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "own_markers" ON user_markers FOR ALL USING (auth.uid() = user_id);
  CREATE POLICY "own_maps" ON saved_maps FOR ALL USING (auth.uid() = user_id);
  CREATE POLICY "own_mil_data" ON custom_military_data FOR ALL USING (auth.uid() = user_id);
  CREATE POLICY "own_settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
*/
