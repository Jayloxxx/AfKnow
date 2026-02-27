/**
 * Map template definitions for the AfKnow editor.
 * Built-in templates + user template support.
 */
import type { EditorCountry, EditorElement, EditorSubRegion, LegendEntry, TimelinePhase, LayerGroup } from './types';

export interface MapTemplateSnapshot {
  countries: EditorCountry[];
  elements: EditorElement[];
  subRegions: EditorSubRegion[];
}

export interface MapTemplateSettings {
  mapStyle: string;
  showOcean: boolean;
  showCompass: boolean;
  showRivers: boolean;
  showCapitals: boolean;
  showLabels: boolean;
  showAirports: boolean;
  showPorts: boolean;
  showLegend: boolean;
  legendTitle: string;
  legendEntries: LegendEntry[];
  timelinePhases: TimelinePhase[];
  layerGroups: LayerGroup[];
  gridOverlay: string;
  coordFormat: string;
}

export interface MapTemplate {
  id: string;
  name: string;
  description: string;
  category: 'situation' | 'movement' | 'recon' | 'planning' | 'blank' | 'user';
  snapshot: MapTemplateSnapshot;
  settings: MapTemplateSettings;
  thumbnail?: string; // base64 data URL
  createdAt?: string;
}

export const TEMPLATE_CATEGORY_LABELS: Record<string, string> = {
  situation: 'Lagekarte',
  movement: 'Bewegungskarte',
  recon: 'Aufklärung',
  planning: 'Einsatzplanung',
  blank: 'Leer',
  user: 'Eigene Vorlagen',
};

const defaultSettings: MapTemplateSettings = {
  mapStyle: 'standard',
  showOcean: true,
  showCompass: true,
  showRivers: false,
  showCapitals: true,
  showLabels: true,
  showAirports: false,
  showPorts: false,
  showLegend: false,
  legendTitle: 'Legende',
  legendEntries: [],
  timelinePhases: [],
  layerGroups: [],
  gridOverlay: 'none',
  coordFormat: 'dd',
};

export const BUILTIN_TEMPLATES: MapTemplate[] = [
  {
    id: 'tpl-lagekarte',
    name: 'Neue Lagekarte',
    description: 'Leere Karte mit Legende, Kompass und Kontrollzonen-Presets.',
    category: 'situation',
    snapshot: { countries: [], elements: [], subRegions: [] },
    settings: {
      ...defaultSettings,
      showLegend: true,
      showCompass: true,
      showCapitals: true,
      showLabels: true,
      legendTitle: 'Legende',
      legendEntries: [
        { id: 'leg-ctrl', label: 'Kontrolliert', color: '#22c55e', symbol: 'rect' },
        { id: 'leg-contest', label: 'Umkämpft', color: '#f59e0b', symbol: 'pattern' },
        { id: 'leg-hostile', label: 'Feindlich', color: '#ef4444', symbol: 'rect' },
        { id: 'leg-neutral', label: 'Neutral', color: '#6b7280', symbol: 'rect' },
      ],
    },
  },
  {
    id: 'tpl-bewegung',
    name: 'Bewegungskarte',
    description: '3 Zeitphasen vorbereitet für Truppenbewegungen und Offensiven.',
    category: 'movement',
    snapshot: { countries: [], elements: [], subRegions: [] },
    settings: {
      ...defaultSettings,
      mapStyle: 'military',
      showCompass: true,
      showLegend: true,
      legendTitle: 'Phasen',
      timelinePhases: [
        { id: 'ph-1', label: 'Phase 1 — Aufmarsch', timestamp: 1, color: '#3b82f6' },
        { id: 'ph-2', label: 'Phase 2 — Angriff', timestamp: 2, color: '#ef4444' },
        { id: 'ph-3', label: 'Phase 3 — Konsolidierung', timestamp: 3, color: '#22c55e' },
      ],
      legendEntries: [
        { id: 'leg-ph1', label: 'Phase 1 — Aufmarsch', color: '#3b82f6', symbol: 'line' },
        { id: 'leg-ph2', label: 'Phase 2 — Angriff', color: '#ef4444', symbol: 'line' },
        { id: 'leg-ph3', label: 'Phase 3 — Konsolidierung', color: '#22c55e', symbol: 'line' },
      ],
    },
  },
  {
    id: 'tpl-aufklaerung',
    name: 'Aufklärungskarte',
    description: 'Optimiert für Marker, Zonen und Foto-Pins. MGRS-Koordinaten.',
    category: 'recon',
    snapshot: { countries: [], elements: [], subRegions: [] },
    settings: {
      ...defaultSettings,
      mapStyle: 'carto-dark',
      showCompass: true,
      showLegend: true,
      gridOverlay: 'mgrs',
      coordFormat: 'mgrs',
      legendTitle: 'Aufklärung',
      legendEntries: [
        { id: 'leg-conf', label: 'Bestätigt', color: '#22c55e', symbol: 'circle' },
        { id: 'leg-prob', label: 'Wahrscheinlich', color: '#3b82f6', symbol: 'circle' },
        { id: 'leg-poss', label: 'Möglich', color: '#f59e0b', symbol: 'circle' },
        { id: 'leg-doubt', label: 'Zweifelhaft', color: '#ef4444', symbol: 'circle' },
      ],
    },
  },
  {
    id: 'tpl-einsatz',
    name: 'Einsatzplanung',
    description: 'Taktische Karte mit Routen, Zielen und Zeitplanung.',
    category: 'planning',
    snapshot: { countries: [], elements: [], subRegions: [] },
    settings: {
      ...defaultSettings,
      mapStyle: 'stadia-dark',
      showCompass: true,
      showLegend: true,
      gridOverlay: 'tactical',
      coordFormat: 'utm',
      legendTitle: 'Einsatz',
      timelinePhases: [
        { id: 'ep-prep', label: 'Vorbereitung', timestamp: 1, color: '#f59e0b' },
        { id: 'ep-exec', label: 'Durchführung', timestamp: 2, color: '#ef4444' },
        { id: 'ep-exfil', label: 'Rückzug', timestamp: 3, color: '#22c55e' },
      ],
      legendEntries: [
        { id: 'leg-obj', label: 'Ziel', color: '#ef4444', symbol: 'circle' },
        { id: 'leg-route', label: 'Route', color: '#3b82f6', symbol: 'line' },
        { id: 'leg-rp', label: 'Sammelpunkt', color: '#22c55e', symbol: 'circle' },
      ],
    },
  },
  {
    id: 'tpl-blank',
    name: 'Leere Karte',
    description: 'Minimale Karte ohne Voreinstellungen.',
    category: 'blank',
    snapshot: { countries: [], elements: [], subRegions: [] },
    settings: {
      ...defaultSettings,
      mapStyle: 'osm',
    },
  },
];
