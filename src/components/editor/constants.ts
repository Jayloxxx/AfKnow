import {
  MousePointer2, Hand, Type, Square, Circle, Minus,
  ArrowUpRight, CornerDownRight, Pentagon, Pencil,
  MapPin, Hexagon, Slash, Shield, Ruler, Target,
  Crosshair, Grid3X3, Route, Flame, AreaChart, Spline, Camera, MessageSquare,
} from 'lucide-react';
import type { ToolType, ZonePreset } from './types';

// ═══════ Tool Definitions ═══════

export interface ToolDef {
  id: ToolType;
  icon: typeof MousePointer2;
  label: string;
  key: string;
  group: 'basic' | 'draw' | 'military' | 'measure';
}

export const TOOLS: ToolDef[] = [
  { id: 'select',        icon: MousePointer2,   label: 'Auswählen',    key: 'V', group: 'basic' },
  { id: 'pan',           icon: Hand,            label: 'Verschieben',  key: 'H', group: 'basic' },
  { id: 'text',          icon: Type,            label: 'Text',         key: 'T', group: 'draw' },
  { id: 'rect',          icon: Square,          label: 'Rechteck',     key: 'R', group: 'draw' },
  { id: 'ellipse',       icon: Circle,          label: 'Ellipse',      key: 'E', group: 'draw' },
  { id: 'line',          icon: Minus,           label: 'Linie',        key: 'L', group: 'draw' },
  { id: 'arrow',         icon: ArrowUpRight,    label: 'Pfeil',        key: 'A', group: 'draw' },
  { id: 'curved-arrow',  icon: CornerDownRight, label: 'Kurvenpfeil',  key: 'K', group: 'draw' },
  { id: 'polygon',       icon: Pentagon,        label: 'Polygon',      key: 'P', group: 'draw' },
  { id: 'freehand',      icon: Pencil,          label: 'Freihand',     key: 'F', group: 'draw' },
  { id: 'marker',        icon: MapPin,          label: 'Marker',       key: 'M', group: 'military' },
  { id: 'zone',          icon: Hexagon,         label: 'Zone',         key: 'Z', group: 'military' },
  { id: 'frontline',     icon: Slash,           label: 'Frontlinie',   key: 'N', group: 'military' },
  { id: 'military-unit', icon: Shield,          label: 'Einheit',      key: 'U', group: 'military' },
  { id: 'range-circle',  icon: Crosshair,       label: 'Reichweite',   key: 'W', group: 'military' },
  { id: 'sub-region',    icon: Grid3X3,         label: 'Sub-Region',   key: 'B', group: 'military' },
  { id: 'supply-route',  icon: Route,           label: 'Versorgung',   key: 'S', group: 'military' },
  { id: 'heatmap-point', icon: Flame,           label: 'Heatmap',      key: 'J', group: 'military' },
  { id: 'callout',      icon: MessageSquare,   label: 'Callout',      key: 'C', group: 'draw' },
  { id: 'image-pin',    icon: Camera,          label: 'Foto-Pin',     key: 'I', group: 'military' },
  { id: 'route',        icon: Route,           label: 'Route',        key: 'G', group: 'military' },
  { id: 'measure',       icon: Ruler,           label: 'Entfernung',   key: 'D', group: 'measure' },
  { id: 'radius',        icon: Target,          label: 'Radius',       key: 'X', group: 'measure' },
  { id: 'polygon-area',  icon: AreaChart,       label: 'Fläche',       key: 'Q', group: 'measure' },
  { id: 'multi-segment', icon: Spline,          label: 'Pfad',         key: 'Y', group: 'measure' },
];

// ═══════ Colors ═══════

export const PRESET_COLORS = [
  '#D4A74F', '#C85A3A', '#47B872', '#3B82F6', '#A855F7',
  '#EC4899', '#EF4444', '#F59E0B', '#06B6D4', '#10B981',
  '#FFFFFF', '#000000', '#6B7280', '#1E3A5F',
];

export const REGION_COLORS: Record<string, string> = {
  'North Africa': '#4A6FA5',
  'West Africa': '#A67C52',
  'East Africa': '#5A9E6F',
  'Central Africa': '#8B63A8',
  'Southern Africa': '#D4924A',
};

// ═══════ Zone Presets ═══════

export interface ZoneStyle {
  fill: string;
  stroke: string;
  pattern?: string;
  label: string;
}

export const ZONE_PRESETS: Record<ZonePreset, ZoneStyle> = {
  controlled: { fill: '#22c55e', stroke: '#16a34a', label: 'Kontrolliert' },
  contested:  { fill: '#f59e0b', stroke: '#d97706', pattern: 'crosshatch', label: 'Umkämpft' },
  hostile:    { fill: '#ef4444', stroke: '#dc2626', pattern: 'stripes', label: 'Feindlich' },
  neutral:    { fill: '#6b7280', stroke: '#4b5563', label: 'Neutral' },
};

// ═══════ Military Symbols ═══════

export type MilitaryCategory = 'personnel' | 'vehicles' | 'air-defense' | 'radar' | 'ships' | 'aircraft' | 'nato' | 'infrastructure';

export const CATEGORY_LABELS: Record<MilitaryCategory, string> = {
  personnel: 'Soldaten',
  vehicles: 'Fahrzeuge',
  'air-defense': 'Luftverteidigung',
  radar: 'Radarsysteme',
  ships: 'Schiffe',
  aircraft: 'Luftfahrzeuge',
  nato: 'NATO-Symbole',
  infrastructure: 'Infrastruktur',
};

export interface MilitarySymbolDef {
  id: string;
  label: string;
  category: MilitaryCategory;
  svgContent: string;
}

export const MILITARY_SYMBOLS: MilitarySymbolDef[] = [
  // ══════════════════════════════════════════════
  //  PERSONNEL — Soldaten & Personen
  // ══════════════════════════════════════════════
  { id: 'soldier', label: 'Soldat', category: 'personnel',
    svgContent: '<circle cx="12" cy="2.8" r="2.2" fill="currentColor"/><rect x="10.2" y="5.3" width="3.6" height="5.2" rx="0.8" fill="currentColor"/><rect x="7.5" y="5.8" width="9" height="1.6" rx="0.7" fill="currentColor"/><path d="M10.2,10.5 L9.2,18.5 L10.8,18.5 L12,14 L13.2,18.5 L14.8,18.5 L13.8,10.5Z" fill="currentColor"/><line x1="16" y1="5.8" x2="18" y2="12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' },
  { id: 'soldier-group', label: 'Infanterietrupp', category: 'personnel',
    svgContent: '<circle cx="5.5" cy="4" r="1.6" fill="currentColor"/><rect x="4.2" y="5.8" width="2.6" height="4" rx="0.5" fill="currentColor"/><path d="M4.2,9.8 L3.6,16.5 L5,16.5 L5.5,12 L6,16.5 L7.4,16.5 L6.8,9.8Z" fill="currentColor"/><circle cx="12" cy="3" r="1.8" fill="currentColor"/><rect x="10.5" y="5" width="3" height="4.2" rx="0.5" fill="currentColor"/><path d="M10.5,9.2 L9.8,16.5 L11.3,16.5 L12,11.5 L12.7,16.5 L14.2,16.5 L13.5,9.2Z" fill="currentColor"/><circle cx="18.5" cy="4" r="1.6" fill="currentColor"/><rect x="17.2" y="5.8" width="2.6" height="4" rx="0.5" fill="currentColor"/><path d="M17.2,9.8 L16.6,16.5 L18,16.5 L18.5,12 L19,16.5 L20.4,16.5 L19.8,9.8Z" fill="currentColor"/>' },
  { id: 'sniper', label: 'Scharfschütze', category: 'personnel',
    svgContent: '<circle cx="5.5" cy="10.5" r="1.8" fill="currentColor"/><ellipse cx="10.5" cy="12" rx="5" ry="2.2" fill="currentColor"/><line x1="15.5" y1="10.5" x2="22.5" y2="8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M5.5,14 L5,18 L7,18 L7.2,14.5Z" fill="currentColor"/><path d="M14.5,14 L15,18 L17,18 L15.5,14Z" fill="currentColor"/>' },
  { id: 'paratrooper', label: 'Fallschirmjäger', category: 'personnel',
    svgContent: '<path d="M4,4 Q12,-1 20,4" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="4" x2="10.5" y2="8" stroke="currentColor" stroke-width="0.7"/><line x1="20" y1="4" x2="13.5" y2="8" stroke="currentColor" stroke-width="0.7"/><line x1="12" y1="0.5" x2="12" y2="8" stroke="currentColor" stroke-width="0.7"/><circle cx="12" cy="9" r="1.5" fill="currentColor"/><rect x="11" y="10.5" width="2" height="3.5" rx="0.4" fill="currentColor"/><path d="M11,14 L10.2,18.5 L11.5,18.5 L12,15.5 L12.5,18.5 L13.8,18.5 L13,14Z" fill="currentColor"/>' },
  { id: 'medic', label: 'Sanitäter', category: 'personnel',
    svgContent: '<circle cx="12" cy="2.8" r="2.2" fill="currentColor"/><rect x="10.2" y="5.3" width="3.6" height="5.2" rx="0.8" fill="currentColor"/><path d="M10.2,10.5 L9.2,18.5 L10.8,18.5 L12,14 L13.2,18.5 L14.8,18.5 L13.8,10.5Z" fill="currentColor"/><rect x="6" y="6.5" width="5" height="3.5" rx="0.5" fill="currentColor" opacity="0.4"/><line x1="8.5" y1="7" x2="8.5" y2="9.5" stroke="currentColor" stroke-width="1.2"/><line x1="7" y1="8.2" x2="10" y2="8.2" stroke="currentColor" stroke-width="1.2"/>' },
  { id: 'officer', label: 'Offizier', category: 'personnel',
    svgContent: '<circle cx="12" cy="2.8" r="2.2" fill="currentColor"/><rect x="9.5" y="0" width="5" height="1.8" rx="0.8" fill="currentColor" opacity="0.5"/><rect x="10.2" y="5.3" width="3.6" height="5.2" rx="0.8" fill="currentColor"/><rect x="7.5" y="5.8" width="9" height="1.6" rx="0.7" fill="currentColor"/><path d="M10.2,10.5 L9.2,18.5 L10.8,18.5 L12,14 L13.2,18.5 L14.8,18.5 L13.8,10.5Z" fill="currentColor"/>' },

  // ══════════════════════════════════════════════
  //  VEHICLES — Fahrzeuge
  // ══════════════════════════════════════════════
  { id: 'tank', label: 'Kampfpanzer', category: 'vehicles',
    svgContent: '<rect x="1" y="13" width="22" height="6" rx="3" fill="currentColor" opacity="0.45"/><circle cx="4.5" cy="16" r="1.8" fill="currentColor" opacity="0.25"/><circle cx="9.5" cy="16" r="1.8" fill="currentColor" opacity="0.25"/><circle cx="14.5" cy="16" r="1.8" fill="currentColor" opacity="0.25"/><circle cx="19.5" cy="16" r="1.8" fill="currentColor" opacity="0.25"/><path d="M3,13 L5,8 L19,8 L21,13Z" fill="currentColor"/><rect x="8.5" y="4.5" width="8.5" height="4" rx="1.5" fill="currentColor"/><rect x="17" y="5.5" width="6" height="1.8" rx="0.7" fill="currentColor"/>' },
  { id: 'apc', label: 'Truppentransporter', category: 'vehicles',
    svgContent: '<rect x="1" y="13" width="22" height="5" rx="2.5" fill="currentColor" opacity="0.45"/><circle cx="4.5" cy="15.5" r="2" fill="currentColor" opacity="0.25"/><circle cx="12" cy="15.5" r="2" fill="currentColor" opacity="0.25"/><circle cx="19.5" cy="15.5" r="2" fill="currentColor" opacity="0.25"/><path d="M2,13 L4,6.5 L20,6.5 L22,13Z" fill="currentColor"/><rect x="5" y="7.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.3"/><rect x="9" y="7.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.3"/><rect x="13" y="7.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>' },
  { id: 'ifv', label: 'Schützenpanzer', category: 'vehicles',
    svgContent: '<rect x="1" y="13" width="22" height="5.5" rx="2.5" fill="currentColor" opacity="0.45"/><circle cx="5" cy="15.8" r="2" fill="currentColor" opacity="0.25"/><circle cx="12" cy="15.8" r="2" fill="currentColor" opacity="0.25"/><circle cx="19" cy="15.8" r="2" fill="currentColor" opacity="0.25"/><path d="M2.5,13 L4,7 L20,7 L21.5,13Z" fill="currentColor"/><rect x="10" y="3.5" width="7" height="4" rx="1" fill="currentColor"/><rect x="17" y="4.5" width="5" height="1.5" rx="0.5" fill="currentColor"/>' },
  { id: 'humvee', label: 'Geländefahrzeug', category: 'vehicles',
    svgContent: '<rect x="3" y="8" width="18" height="6.5" rx="1.2" fill="currentColor"/><rect x="4.5" y="5" width="7.5" height="3.5" rx="1" fill="currentColor"/><circle cx="6.5" cy="16" r="2.5" fill="currentColor"/><circle cx="6.5" cy="16" r="1" fill="currentColor" opacity="0.3"/><circle cx="17.5" cy="16" r="2.5" fill="currentColor"/><circle cx="17.5" cy="16" r="1" fill="currentColor" opacity="0.3"/>' },
  { id: 'truck', label: 'Militär-LKW', category: 'vehicles',
    svgContent: '<rect x="1" y="8" width="13" height="7.5" rx="0.5" fill="currentColor"/><path d="M1,8 L14,8" stroke="currentColor" stroke-width="0.8" opacity="0.4"/><rect x="14.5" y="5.5" width="8" height="10" rx="1" fill="currentColor"/><rect x="15.5" y="6.5" width="6" height="3.5" rx="0.8" fill="currentColor" opacity="0.35"/><circle cx="5" cy="17" r="2.2" fill="currentColor"/><circle cx="11.5" cy="17" r="2.2" fill="currentColor"/><circle cx="19.5" cy="17" r="2.2" fill="currentColor"/>' },
  { id: 'mrap', label: 'MRAP', category: 'vehicles',
    svgContent: '<path d="M4,13 L5,7 L19,7 L20,13Z" fill="currentColor"/><path d="M5,7 L5,5 L12,5 L12,7" fill="currentColor" opacity="0.6"/><rect x="3" y="13" width="18" height="2.5" rx="0.5" fill="currentColor" opacity="0.5"/><circle cx="7" cy="17" r="2.5" fill="currentColor"/><circle cx="7" cy="17" r="1" fill="currentColor" opacity="0.3"/><circle cx="17" cy="17" r="2.5" fill="currentColor"/><circle cx="17" cy="17" r="1" fill="currentColor" opacity="0.3"/>' },

  // ══════════════════════════════════════════════
  //  AIR DEFENSE — Luftverteidigung
  // ══════════════════════════════════════════════
  { id: 'sam', label: 'FlaRak-System', category: 'air-defense',
    svgContent: '<rect x="2" y="13" width="20" height="4.5" rx="1" fill="currentColor" opacity="0.45"/><circle cx="5" cy="18" r="1.5" fill="currentColor" opacity="0.35"/><circle cx="19" cy="18" r="1.5" fill="currentColor" opacity="0.35"/><rect x="5" y="10" width="14" height="3.5" rx="0.5" fill="currentColor"/><path d="M7,10 L9,3.5 L10.5,3.5 L10.5,10Z" fill="currentColor"/><path d="M13.5,10 L13.5,3.5 L15,3.5 L17,10Z" fill="currentColor"/>' },
  { id: 'manpads', label: 'MANPADS', category: 'air-defense',
    svgContent: '<circle cx="8" cy="3" r="1.8" fill="currentColor"/><rect x="6.8" y="5" width="2.4" height="4.5" rx="0.5" fill="currentColor"/><path d="M6.8,9.5 L6,17 L7.3,17 L8,12 L8.7,17 L10,17 L9.2,9.5Z" fill="currentColor"/><rect x="9.5" y="2" width="11" height="2.5" rx="1" fill="currentColor" opacity="0.8"/><circle cx="20" cy="3.2" r="1.2" fill="none" stroke="currentColor" stroke-width="0.8"/>' },
  { id: 'aa-gun', label: 'Flak-Geschütz', category: 'air-defense',
    svgContent: '<rect x="8" y="14" width="8" height="5" rx="0.8" fill="currentColor" opacity="0.45"/><rect x="10" y="10" width="4" height="5" rx="0.5" fill="currentColor"/><rect x="5" y="2" width="2.2" height="9" rx="0.5" fill="currentColor" transform="rotate(-20,6,11)"/><rect x="16.8" y="2" width="2.2" height="9" rx="0.5" fill="currentColor" transform="rotate(20,18,11)"/><circle cx="12" cy="11.5" r="1.5" fill="currentColor" opacity="0.4"/>' },
  { id: 'patriot', label: 'Patriot-Batterie', category: 'air-defense',
    svgContent: '<rect x="2" y="13.5" width="20" height="4.5" rx="1" fill="currentColor" opacity="0.45"/><circle cx="5" cy="18.5" r="1.5" fill="currentColor" opacity="0.35"/><circle cx="19" cy="18.5" r="1.5" fill="currentColor" opacity="0.35"/><rect x="4" y="4.5" width="16" height="9" rx="1" fill="currentColor"/><path d="M5,4.5 L5,2.5 L19,2.5 L19,4.5" fill="currentColor" opacity="0.6"/><rect x="6" y="6" width="4" height="2.5" rx="0.5" fill="currentColor" opacity="0.3"/><rect x="11" y="6" width="4" height="2.5" rx="0.5" fill="currentColor" opacity="0.3"/>' },

  // ══════════════════════════════════════════════
  //  RADAR — Radarsysteme
  // ══════════════════════════════════════════════
  { id: 'radar-dish', label: 'Radarschüssel', category: 'radar',
    svgContent: '<rect x="10.5" y="10" width="3" height="8" fill="currentColor" opacity="0.6"/><rect x="6" y="16.5" width="12" height="2.5" rx="0.5" fill="currentColor"/><path d="M3.5,8 Q12,-0.5 20.5,8" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><circle cx="12" cy="10" r="2" fill="currentColor"/>' },
  { id: 'radar-mobile', label: 'Mobiles Radar', category: 'radar',
    svgContent: '<rect x="2" y="12" width="20" height="5" rx="1" fill="currentColor" opacity="0.45"/><circle cx="5.5" cy="17.5" r="1.5" fill="currentColor" opacity="0.35"/><circle cx="18.5" cy="17.5" r="1.5" fill="currentColor" opacity="0.35"/><rect x="10" y="7.5" width="2" height="5" fill="currentColor" opacity="0.6"/><path d="M5,6 Q10.5,-0.5 17,6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="11" cy="7.5" r="1.5" fill="currentColor"/>' },
  { id: 'radar-tower', label: 'Radarturm', category: 'radar',
    svgContent: '<rect x="10.5" y="5" width="3" height="14" fill="currentColor" opacity="0.6"/><path d="M8,19 L16,19 L14.5,17 L9.5,17Z" fill="currentColor"/><path d="M4.5,3.5 Q12,-3 19.5,3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M7,5 Q12,1 17,5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="5.5" r="1.5" fill="currentColor"/>' },

  // ══════════════════════════════════════════════
  //  SHIPS — Schiffe
  // ══════════════════════════════════════════════
  { id: 'destroyer', label: 'Zerstörer', category: 'ships',
    svgContent: '<path d="M1,11 L3,11 L5.5,7.5 L20,7.5 L23,11 L23,13 L1,13Z" fill="currentColor"/><rect x="9" y="4.5" width="3.5" height="3.5" rx="0.5" fill="currentColor"/><rect x="14" y="5.5" width="2.5" height="2.5" rx="0.3" fill="currentColor"/><line x1="10.8" y1="1.5" x2="10.8" y2="4.5" stroke="currentColor" stroke-width="0.8"/><path d="M1,13 Q12,16.5 23,13" fill="currentColor" opacity="0.25"/>' },
  { id: 'carrier', label: 'Flugzeugträger', category: 'ships',
    svgContent: '<path d="M0.5,9.5 L2,7.5 L22,7.5 L23.5,9.5 L23.5,13 L0.5,13Z" fill="currentColor"/><rect x="2.5" y="5.5" width="19" height="2.5" rx="0.3" fill="currentColor" opacity="0.55"/><rect x="17" y="2.5" width="3" height="5.5" rx="0.5" fill="currentColor"/><path d="M0.5,13 Q12,16.5 23.5,13" fill="currentColor" opacity="0.25"/><path d="M5,6 L7,5 L7,7.5" fill="currentColor" opacity="0.35"/><path d="M10,6 L12,5 L12,7.5" fill="currentColor" opacity="0.35"/>' },
  { id: 'submarine', label: 'U-Boot', category: 'ships',
    svgContent: '<ellipse cx="12" cy="12" rx="11" ry="4.5" fill="currentColor"/><rect x="10" y="6" width="4" height="6.5" rx="1.8" fill="currentColor"/><path d="M10,6.5 L10,4.5 L14,4.5 L14,6.5" fill="none" stroke="currentColor" stroke-width="1"/><line x1="12" y1="4.5" x2="12" y2="2" stroke="currentColor" stroke-width="0.8"/><path d="M22,10 L23.5,12 L22,14" fill="currentColor"/>' },
  { id: 'patrol-boat', label: 'Patrouillenboot', category: 'ships',
    svgContent: '<path d="M2,10.5 L4.5,8.5 L20,8.5 L22,10.5 L22,12.5 L2,12.5Z" fill="currentColor"/><rect x="8.5" y="6" width="5" height="3" rx="0.5" fill="currentColor"/><line x1="11" y1="3.5" x2="11" y2="6" stroke="currentColor" stroke-width="0.8"/><path d="M2,12.5 Q12,15.5 22,12.5" fill="currentColor" opacity="0.25"/>' },
  { id: 'frigate', label: 'Fregatte', category: 'ships',
    svgContent: '<path d="M1,11 L3.5,11 L5.5,7.5 L19.5,7.5 L22.5,11 L23,13 L1,13Z" fill="currentColor"/><rect x="9.5" y="4.5" width="3" height="3.5" rx="0.5" fill="currentColor"/><rect x="14.5" y="5.5" width="2" height="2.5" rx="0.3" fill="currentColor"/><line x1="11" y1="2" x2="11" y2="4.5" stroke="currentColor" stroke-width="0.8"/><path d="M1,13 Q12,16 23,13" fill="currentColor" opacity="0.25"/>' },

  // ══════════════════════════════════════════════
  //  AIRCRAFT — Luftfahrzeuge
  // ══════════════════════════════════════════════
  { id: 'fighter-jet', label: 'Kampfjet', category: 'aircraft',
    svgContent: '<path d="M12,0.5 L13.5,7 L22,11.5 L22,13.5 L13.5,10.5 L13.5,15.5 L17,17.5 L17,18.5 L12,16.5 L7,18.5 L7,17.5 L10.5,15.5 L10.5,10.5 L2,13.5 L2,11.5 L10.5,7Z" fill="currentColor"/>' },
  { id: 'helicopter', label: 'Hubschrauber', category: 'aircraft',
    svgContent: '<line x1="3" y1="3.5" x2="21" y2="3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="11" y="3.5" width="2" height="3" fill="currentColor"/><ellipse cx="14" cy="10.5" rx="6.5" ry="4.2" fill="currentColor"/><path d="M7.5,9 L3,8 L2,6.5 L3.2,6.8 L4,7.8 L7.5,8.5Z" fill="currentColor"/><rect x="1.5" y="5" width="1.5" height="4.5" rx="0.5" fill="currentColor"/><path d="M10,14.2 L9.5,17 L7.5,17" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M18,14.2 L18.5,17 L20.5,17" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' },
  { id: 'attack-helo', label: 'Kampfhubschrauber', category: 'aircraft',
    svgContent: '<line x1="3" y1="3" x2="21" y2="3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><rect x="11" y="3" width="2" height="2.5" fill="currentColor"/><path d="M9.5,5.5 L14.5,5.5 L16,9 L16.5,13 L7.5,13 L8,9Z" fill="currentColor"/><path d="M7.5,8.5 L3.5,7.5 L2.5,6 L3.5,6.5 L4.5,7.5 L7.5,8Z" fill="currentColor"/><rect x="1.5" y="4.5" width="1.2" height="4" rx="0.4" fill="currentColor"/><path d="M8,9.5 L4.5,10.5 L4.5,9 L8,8.5Z" fill="currentColor"/><path d="M16,9.5 L19.5,10.5 L19.5,9 L16,8.5Z" fill="currentColor"/><path d="M10,13 L9.5,16.5 L7.5,16.5" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><path d="M14,13 L14.5,16.5 L16.5,16.5" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>' },
  { id: 'bomber', label: 'Bomber', category: 'aircraft',
    svgContent: '<path d="M12,1 L14,6 L23,10.5 L23,12.5 L14,10 L14,15 L17.5,17 L17.5,18.5 L12,16.5 L6.5,18.5 L6.5,17 L10,15 L10,10 L1,12.5 L1,10.5 L10,6Z" fill="currentColor"/>' },
  { id: 'drone', label: 'Drohne (UAV)', category: 'aircraft',
    svgContent: '<path d="M12,3 L13,7 L19.5,10 L19.5,11.5 L13,9.5 L13,14.5 L16,16 L16,17 L12,15.5 L8,17 L8,16 L11,14.5 L11,9.5 L4.5,11.5 L4.5,10 L11,7Z" fill="currentColor"/><ellipse cx="12" cy="5" rx="1.5" ry="0.6" fill="currentColor" opacity="0.4"/>' },
  { id: 'transport-plane', label: 'Transportflugzeug', category: 'aircraft',
    svgContent: '<path d="M12,1 L14.5,7 L22,11 L22,13 L14.5,10.5 L14.5,15 L18,17 L18,18.5 L12,16 L6,18.5 L6,17 L9.5,15 L9.5,10.5 L2,13 L2,11 L9.5,7Z" fill="currentColor"/><ellipse cx="12" cy="6.5" rx="2.5" ry="5" fill="currentColor" opacity="0.2"/>' },

  // ══════════════════════════════════════════════
  //  NATO — Abstract NATO APP-6 Symbole
  // ══════════════════════════════════════════════
  { id: 'infantry',       label: 'Infanterie',       category: 'nato', svgContent: '<line x1="6" y1="4" x2="18" y2="16" stroke="currentColor" stroke-width="2"/><line x1="18" y1="4" x2="6" y2="16" stroke="currentColor" stroke-width="2"/>' },
  { id: 'armor',          label: 'Panzer',           category: 'nato', svgContent: '<ellipse cx="12" cy="10" rx="7" ry="5" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { id: 'artillery',      label: 'Artillerie',       category: 'nato', svgContent: '<circle cx="12" cy="10" r="3" fill="currentColor"/>' },
  { id: 'mechanized',     label: 'Mechanisiert',     category: 'nato', svgContent: '<ellipse cx="12" cy="10" rx="7" ry="5" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="6" y1="4" x2="18" y2="16" stroke="currentColor" stroke-width="1.2"/><line x1="18" y1="4" x2="6" y2="16" stroke="currentColor" stroke-width="1.2"/>' },
  { id: 'cavalry',        label: 'Kavallerie',       category: 'nato', svgContent: '<line x1="4" y1="16" x2="20" y2="4" stroke="currentColor" stroke-width="2"/>' },
  { id: 'airborne',       label: 'Luftlande',        category: 'nato', svgContent: '<path d="M6,12 Q12,2 18,12" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="6" y1="4" x2="18" y2="16" stroke="currentColor" stroke-width="1.2"/><line x1="18" y1="4" x2="6" y2="16" stroke="currentColor" stroke-width="1.2"/>' },
  { id: 'special-forces', label: 'Spezialkräfte',    category: 'nato', svgContent: '<path d="M8,4 L16,4 M12,4 L12,16 M8,16 L16,16" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { id: 'anti-air',       label: 'Flugabwehr',       category: 'nato', svgContent: '<path d="M12,16 L12,6 M8,4 L12,6 L16,4" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { id: 'missile',        label: 'Raketen',          category: 'nato', svgContent: '<path d="M12,4 L12,14 M9,14 L15,14 M12,14 L12,17" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="4" r="2" fill="currentColor"/>' },
  { id: 'headquarters',   label: 'Hauptquartier',    category: 'nato', svgContent: '<text x="12" y="13" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">HQ</text>' },
  { id: 'command-post',   label: 'Gefechtsstand',    category: 'nato', svgContent: '<text x="12" y="13" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">CP</text>' },
  { id: 'recon',          label: 'Aufklärung',       category: 'nato', svgContent: '<line x1="4" y1="16" x2="20" y2="4" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  { id: 'signals',        label: 'Fernmelder',       category: 'nato', svgContent: '<path d="M6,14 L10,6 L14,14 L18,6" fill="none" stroke="currentColor" stroke-width="1.8"/>' },
  { id: 'engineer',       label: 'Pioniere',         category: 'nato', svgContent: '<text x="12" y="13" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor">E</text>' },
  { id: 'supply',         label: 'Nachschub',        category: 'nato', svgContent: '<circle cx="12" cy="10" r="5" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { id: 'medical-nato',   label: 'Sanitäter',        category: 'nato', svgContent: '<line x1="12" y1="4" x2="12" y2="16" stroke="currentColor" stroke-width="2.5"/><line x1="6" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="2.5"/>' },

  // ══════════════════════════════════════════════
  //  INFRASTRUCTURE
  // ══════════════════════════════════════════════
  { id: 'airbase',        label: 'Flugbasis',        category: 'infrastructure', svgContent: '<path d="M12 4 L8 16 L12 13 L16 16 Z" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  { id: 'naval-base',     label: 'Marinebasis',      category: 'infrastructure', svgContent: '<path d="M12 4 L12 12 M8 14 Q10 10 12 14 Q14 10 16 14" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  { id: 'camp',           label: 'Lager',            category: 'infrastructure', svgContent: '<polygon points="12,4 4,16 20,16" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  { id: 'checkpoint',     label: 'Kontrollpunkt',    category: 'infrastructure', svgContent: '<polygon points="12,3 20,10 12,17 4,10" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  { id: 'fortification',  label: 'Befestigung',      category: 'infrastructure', svgContent: '<rect x="4" y="4" width="16" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="4" cy="4" r="2" fill="currentColor"/><circle cx="20" cy="4" r="2" fill="currentColor"/><circle cx="4" cy="16" r="2" fill="currentColor"/><circle cx="20" cy="16" r="2" fill="currentColor"/>' },
  { id: 'bridge',         label: 'Brücke',           category: 'infrastructure', svgContent: '<path d="M4,14 Q12,4 20,14" fill="none" stroke="currentColor" stroke-width="2"/><line x1="4" y1="14" x2="20" y2="14" stroke="currentColor" stroke-width="1.5"/>' },
  { id: 'minefield',      label: 'Minenfeld',        category: 'infrastructure', svgContent: '<circle cx="8" cy="8" r="2" fill="currentColor"/><circle cx="16" cy="8" r="2" fill="currentColor"/><circle cx="12" cy="14" r="2" fill="currentColor"/><line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/>' },
  { id: 'radar',          label: 'Radar',            category: 'infrastructure', svgContent: '<path d="M12,16 L12,8 M6,6 Q12,0 18,6" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { id: 'explosion',      label: 'Explosion',        category: 'infrastructure', svgContent: '<path d="M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8 Z" fill="none" stroke="currentColor" stroke-width="1.2"/>' },
];

// ═══════ Faction Colors (NATO APP-6) ═══════

export const FACTION_COLORS = {
  friendly: '#3B82F6',
  hostile: '#EF4444',
  neutral: '#22C55E',
  unknown: '#F59E0B',
};

export const FACTION_LABELS: Record<string, string> = {
  friendly: 'Freund',
  hostile: 'Feind',
  neutral: 'Neutral',
  unknown: 'Unbekannt',
};

// ═══════ Echelon Markers (NATO standard) ═══════

export const ECHELON_MARKERS: Record<string, { label: string; symbol: string }> = {
  team: { label: 'Trupp', symbol: '●' },
  squad: { label: 'Gruppe', symbol: '●●' },
  platoon: { label: 'Zug', symbol: '●●●' },
  company: { label: 'Kompanie', symbol: '|' },
  battalion: { label: 'Bataillon', symbol: '||' },
  regiment: { label: 'Regiment', symbol: '|||' },
  brigade: { label: 'Brigade', symbol: 'X' },
  division: { label: 'Division', symbol: 'XX' },
  corps: { label: 'Korps', symbol: 'XXX' },
  army: { label: 'Armee', symbol: 'XXXX' },
  'army-group': { label: 'Heeresgruppe', symbol: 'XXXXX' },
};

export const CONFIDENCE_LABELS: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Bestätigt', color: '#22C55E' },
  probable: { label: 'Wahrscheinlich', color: '#3B82F6' },
  possible: { label: 'Möglich', color: '#F59E0B' },
  doubtful: { label: 'Zweifelhaft', color: '#EF4444' },
};

// ═══════ Weapon Range Presets ═══════

export interface WeaponRangeDef {
  id: string;
  label: string;
  rangeKm: number;
  color: string;
  category: 'sam' | 'artillery' | 'missile' | 'radar' | 'air';
}

export const WEAPON_RANGES: WeaponRangeDef[] = [
  // SAM Systems
  { id: 's300', label: 'S-300', rangeKm: 200, color: '#EF4444', category: 'sam' },
  { id: 's400', label: 'S-400', rangeKm: 400, color: '#DC2626', category: 'sam' },
  { id: 's500', label: 'S-500', rangeKm: 600, color: '#B91C1C', category: 'sam' },
  { id: 'patriot', label: 'Patriot PAC-3', rangeKm: 160, color: '#3B82F6', category: 'sam' },
  { id: 'iris-t', label: 'IRIS-T SLM', rangeKm: 40, color: '#2563EB', category: 'sam' },
  { id: 'nasams', label: 'NASAMS', rangeKm: 25, color: '#1D4ED8', category: 'sam' },
  { id: 'gepard', label: 'Gepard', rangeKm: 4, color: '#60A5FA', category: 'sam' },
  { id: 'buk', label: 'Buk-M2', rangeKm: 50, color: '#F87171', category: 'sam' },
  { id: 'tor', label: 'Tor-M2', rangeKm: 16, color: '#FCA5A5', category: 'sam' },
  { id: 'pantsir', label: 'Pantsir-S1', rangeKm: 20, color: '#FB923C', category: 'sam' },
  // Artillery
  { id: 'himars', label: 'HIMARS (GMLRS)', rangeKm: 80, color: '#22C55E', category: 'artillery' },
  { id: 'himars-atacms', label: 'HIMARS (ATACMS)', rangeKm: 300, color: '#16A34A', category: 'artillery' },
  { id: 'm777', label: 'M777 (155mm)', rangeKm: 40, color: '#4ADE80', category: 'artillery' },
  { id: 'pzh2000', label: 'PzH 2000', rangeKm: 56, color: '#86EFAC', category: 'artillery' },
  { id: 'caesar', label: 'CAESAR', rangeKm: 42, color: '#A7F3D0', category: 'artillery' },
  { id: 'grad', label: 'BM-21 Grad', rangeKm: 40, color: '#FB7185', category: 'artillery' },
  { id: 'smerch', label: 'BM-30 Smerch', rangeKm: 90, color: '#F43F5E', category: 'artillery' },
  // Missiles
  { id: 'iskander', label: 'Iskander-M', rangeKm: 500, color: '#A855F7', category: 'missile' },
  { id: 'kalibr', label: 'Kalibr', rangeKm: 2500, color: '#9333EA', category: 'missile' },
  { id: 'taurus', label: 'Taurus KEPD', rangeKm: 500, color: '#7C3AED', category: 'missile' },
  { id: 'storm-shadow', label: 'Storm Shadow', rangeKm: 560, color: '#8B5CF6', category: 'missile' },
  { id: 'tomahawk', label: 'Tomahawk', rangeKm: 1600, color: '#6366F1', category: 'missile' },
  // Radar
  { id: 'nebo-m', label: 'Nebo-M', rangeKm: 600, color: '#F59E0B', category: 'radar' },
  { id: 'voronezh', label: 'Woronesh', rangeKm: 6000, color: '#D97706', category: 'radar' },
  { id: 'awacs', label: 'AWACS', rangeKm: 400, color: '#FBBF24', category: 'radar' },
  // Air
  { id: 'su35-range', label: 'Su-35 Kampfradius', rangeKm: 1600, color: '#F87171', category: 'air' },
  { id: 'f16-range', label: 'F-16 Kampfradius', rangeKm: 550, color: '#60A5FA', category: 'air' },
  { id: 'bayraktar', label: 'Bayraktar TB2', rangeKm: 150, color: '#34D399', category: 'air' },
];

export const WEAPON_RANGE_CATEGORIES: Record<string, string> = {
  sam: 'Luftverteidigung',
  artillery: 'Artillerie',
  missile: 'Raketen',
  radar: 'Radar',
  air: 'Luftfahrzeuge',
};

// ═══════ Pattern IDs ═══════

export const PATTERN_IDS = ['stripes', 'crosshatch', 'dots', 'diagonal-lines'] as const;

// ═══════ Font Options ═══════

export const FONT_OPTIONS = [
  { id: 'var(--font-display)', label: 'Display' },
  { id: 'var(--font-body)', label: 'Body' },
  { id: 'var(--font-mono)', label: 'Mono' },
  { id: 'serif', label: 'Serif' },
];

// ═══════ Dash Patterns ═══════

export const DASH_PATTERNS = [
  { id: '', label: 'Durchgezogen' },
  { id: '8 4', label: 'Gestrichelt' },
  { id: '3 3', label: 'Gepunktet' },
  { id: '12 4 3 4', label: 'Strich-Punkt' },
];

// ═══════ Grid Overlay Types ═══════

export interface GridOverlayDef {
  id: string;
  label: string;
  spacing: number;
  color: string;
  opacity: number;
}

export const GRID_OVERLAYS: GridOverlayDef[] = [
  { id: 'none', label: 'Kein Raster', spacing: 0, color: '', opacity: 0 },
  { id: 'fine', label: 'Fein (25)', spacing: 25, color: 'rgba(255,255,255,0.06)', opacity: 0.06 },
  { id: 'medium', label: 'Mittel (50)', spacing: 50, color: 'rgba(255,255,255,0.06)', opacity: 0.06 },
  { id: 'coarse', label: 'Grob (100)', spacing: 100, color: 'rgba(255,255,255,0.08)', opacity: 0.08 },
  { id: 'mgrs', label: 'MGRS-Stil', spacing: 100, color: 'rgba(100,180,255,0.1)', opacity: 0.1 },
  { id: 'tactical', label: 'Taktisch', spacing: 50, color: 'rgba(255,200,100,0.06)', opacity: 0.06 },
];

// ═══════ Shape Presets ═══════

export interface ShapePresetDef {
  id: string;
  label: string;
  group: string;
}

export const SHAPE_PRESETS: ShapePresetDef[] = [
  { id: 'rect', label: 'Rechteck', group: 'basic' },
  { id: 'ellipse', label: 'Ellipse', group: 'basic' },
  { id: 'triangle', label: 'Dreieck', group: 'basic' },
  { id: 'star', label: 'Stern', group: 'basic' },
  { id: 'hexagon', label: 'Sechseck', group: 'basic' },
  { id: 'arrow-block', label: 'Blockpfeil', group: 'military' },
  { id: 'flag', label: 'Flagge', group: 'military' },
  { id: 'shield', label: 'Schild', group: 'military' },
];

// ═══════ ISW-Style Map Presets ═══════

export interface ISWFrontlineStyle {
  id: string;
  label: string;
  color: string;
  width: number;
  dash: string;
  description: string;
}

export const ISW_FRONTLINE_STYLES: ISWFrontlineStyle[] = [
  { id: 'side-a', label: 'Partei A — Frontlinie', color: '#DC2626', width: 3, dash: '', description: 'Bestätigte Kontrolllinie Partei A' },
  { id: 'side-b', label: 'Partei B — Frontlinie', color: '#2563EB', width: 3, dash: '', description: 'Bestätigte Kontrolllinie Partei B' },
  { id: 'contested', label: 'Umkämpfte Linie', color: '#F59E0B', width: 2.5, dash: '8 4', description: 'Aktiv umkämpfter Frontabschnitt' },
  { id: 'claimed-advance', label: 'Unbestätigter Vorstoß', color: '#9333EA', width: 2, dash: '4 4', description: 'Nicht bestätigter Geländegewinn' },
  { id: 'ceasefire', label: 'Waffenstillstandslinie', color: '#22C55E', width: 2, dash: '12 4 3 4', description: 'Vereinbarte Demarkation' },
  { id: 'prev-frontline', label: 'Vorherige Frontlinie', color: '#6B7280', width: 1.5, dash: '6 4', description: 'Frühere Position zum Vergleich' },
];

export interface ISWZonePreset {
  id: string;
  label: string;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  pattern?: 'stripes' | 'crosshatch' | 'dots';
  description: string;
}

export const ISW_ZONE_PRESETS: ISWZonePreset[] = [
  { id: 'side-a-control', label: 'Partei A — Kontrolle', fillColor: '#DC2626', fillOpacity: 0.2, strokeColor: '#DC2626', description: 'Kontrolliertes Gebiet Partei A' },
  { id: 'side-b-control', label: 'Partei B — Kontrolle', fillColor: '#2563EB', fillOpacity: 0.2, strokeColor: '#2563EB', description: 'Kontrolliertes Gebiet Partei B' },
  { id: 'side-a-claimed', label: 'Partei A — beansprucht', fillColor: '#991B1B', fillOpacity: 0.15, strokeColor: '#DC2626', pattern: 'stripes', description: 'Beanspruchtes Gebiet (unbestätigt)' },
  { id: 'side-b-claimed', label: 'Partei B — beansprucht', fillColor: '#1E40AF', fillOpacity: 0.15, strokeColor: '#2563EB', pattern: 'stripes', description: 'Beanspruchtes Gebiet (unbestätigt)' },
  { id: 'contested-zone', label: 'Umkämpftes Gebiet', fillColor: '#F59E0B', fillOpacity: 0.15, strokeColor: '#D97706', pattern: 'crosshatch', description: 'Aktiv umkämpftes Territorium' },
  { id: 'buffer-zone', label: 'Pufferzone / DMZ', fillColor: '#22C55E', fillOpacity: 0.1, strokeColor: '#16A34A', pattern: 'dots', description: 'Demilitarisierte/Pufferzone' },
  { id: 'encircled', label: 'Eingeschlossen', fillColor: '#7C3AED', fillOpacity: 0.15, strokeColor: '#6D28D9', pattern: 'crosshatch', description: 'Eingekesseltes Gebiet' },
  { id: 'occupation', label: 'Besetztes Gebiet', fillColor: '#78350F', fillOpacity: 0.2, strokeColor: '#92400E', description: 'Langzeitig besetztes Gebiet' },
];

export interface ISWBattleMarker {
  id: string;
  label: string;
  icon: string; // SVG content
  color: string;
  category: 'ground' | 'air' | 'naval' | 'special';
}

export const ISW_BATTLE_MARKERS: ISWBattleMarker[] = [
  // Ground
  { id: 'ground-assault', label: 'Bodenangriff', category: 'ground', color: '#EF4444',
    icon: '<path d="M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8 Z" fill="currentColor" opacity="0.9"/>' },
  { id: 'artillery-strike', label: 'Artilleriebeschuss', category: 'ground', color: '#F97316',
    icon: '<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/><line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" stroke-width="1.5"/><line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5"/>' },
  { id: 'urban-combat', label: 'Stadtkampf', category: 'ground', color: '#DC2626',
    icon: '<rect x="4" y="8" width="6" height="10" rx="0.5" fill="currentColor" opacity="0.7"/><rect x="14" y="6" width="6" height="12" rx="0.5" fill="currentColor" opacity="0.7"/><rect x="9" y="10" width="6" height="8" rx="0.5" fill="currentColor" opacity="0.5"/><path d="M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8 Z" fill="currentColor" opacity="0.3" transform="scale(0.5) translate(12,0)"/>' },
  { id: 'ied-mine', label: 'IED/Minenfeld', category: 'ground', color: '#B91C1C',
    icon: '<polygon points="12,3 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="12" cy="12" r="3" fill="currentColor"/>' },
  // Air
  { id: 'airstrike', label: 'Luftangriff', category: 'air', color: '#3B82F6',
    icon: '<path d="M12,1 L13.5,7 L22,11.5 L22,13.5 L13.5,10.5 L13.5,15.5 L17,17.5 L17,18.5 L12,16.5 L7,18.5 L7,17.5 L10.5,15.5 L10.5,10.5 L2,13.5 L2,11.5 L10.5,7Z" fill="currentColor"/><line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>' },
  { id: 'drone-strike', label: 'Drohnenangriff', category: 'air', color: '#8B5CF6',
    icon: '<path d="M12,3 L13,7 L19.5,10 L19.5,11.5 L13,9.5 L13,14.5 L16,16 L16,17 L12,15.5 L8,17 L8,16 L11,14.5 L11,9.5 L4.5,11.5 L4.5,10 L11,7Z" fill="currentColor"/><circle cx="12" cy="20" r="2" fill="none" stroke="currentColor" stroke-width="1"/><line x1="12" y1="16" x2="12" y2="18" stroke="currentColor" stroke-width="0.8" stroke-dasharray="1 1"/>' },
  { id: 'missile-strike', label: 'Raketenbeschuss', category: 'air', color: '#E11D48',
    icon: '<path d="M12,1 L14,6 L14,14 L16,17 L12,20 L8,17 L10,14 L10,6 Z" fill="currentColor"/><line x1="8" y1="7" x2="10" y2="6" stroke="currentColor" stroke-width="1.2"/><line x1="16" y1="7" x2="14" y2="6" stroke="currentColor" stroke-width="1.2"/><circle cx="12" cy="21" r="1.5" fill="currentColor" opacity="0.5"/>' },
  // Naval
  { id: 'naval-attack', label: 'Marineangriff', category: 'naval', color: '#0EA5E9',
    icon: '<path d="M4,12 Q8,8 12,12 Q16,16 20,12" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4,16 Q8,12 12,16 Q16,20 20,16" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><path d="M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8 Z" fill="currentColor" opacity="0.3" transform="scale(0.4) translate(18,-2)"/>' },
  { id: 'naval-blockade', label: 'Seeblockade', category: 'naval', color: '#0369A1',
    icon: '<line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2.5"/><line x1="2" y1="8" x2="22" y2="8" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/><line x1="2" y1="16" x2="22" y2="16" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/><line x1="6" y1="10" x2="6" y2="14" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" stroke-width="1.5"/><line x1="18" y1="10" x2="18" y2="14" stroke="currentColor" stroke-width="1.5"/>' },
  // Special
  { id: 'sabotage', label: 'Sabotage/Anschlag', category: 'special', color: '#A855F7',
    icon: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>' },
  { id: 'cyber-attack', label: 'Cyberangriff', category: 'special', color: '#06B6D4',
    icon: '<rect x="5" y="6" width="14" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" stroke-width="1.5"/><path d="M8,9 L10,11 L8,13" fill="none" stroke="currentColor" stroke-width="1.2"/><line x1="12" y1="9" x2="16" y2="9" stroke="currentColor" stroke-width="0.8" opacity="0.5"/><line x1="12" y1="11" x2="15" y2="11" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>' },
  { id: 'humanitarian', label: 'Humanitäres Ereignis', category: 'special', color: '#F43F5E',
    icon: '<line x1="12" y1="4" x2="12" y2="16" stroke="currentColor" stroke-width="3"/><line x1="6" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="3"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
];

export const ISW_BATTLE_CATEGORIES: Record<string, string> = {
  ground: 'Bodenkampf',
  air: 'Luftkampf',
  naval: 'Seekampf',
  special: 'Spezial',
};

export interface ISWMovementArrow {
  id: string;
  label: string;
  color: string;
  width: number;
  dash: string;
  arrowStyle: 'solid' | 'outlined';
  description: string;
}

export const ISW_MOVEMENT_ARROWS: ISWMovementArrow[] = [
  { id: 'advance', label: 'Vorstoß', color: '#DC2626', width: 4, dash: '', arrowStyle: 'solid', description: 'Aktive Offensivbewegung' },
  { id: 'retreat', label: 'Rückzug', color: '#3B82F6', width: 3, dash: '8 4', arrowStyle: 'outlined', description: 'Geordneter Rückzug' },
  { id: 'flanking', label: 'Flankierung', color: '#F59E0B', width: 3, dash: '', arrowStyle: 'solid', description: 'Flankenangriff' },
  { id: 'reinforcement', label: 'Verstärkung', color: '#22C55E', width: 3, dash: '4 4', arrowStyle: 'solid', description: 'Nachschub/Verstärkung' },
  { id: 'probe', label: 'Aufklärungsvorstoß', color: '#8B5CF6', width: 2, dash: '3 3', arrowStyle: 'outlined', description: 'Erkundung/Aufklärung' },
  { id: 'envelopment', label: 'Umfassung', color: '#E11D48', width: 3.5, dash: '', arrowStyle: 'solid', description: 'Doppelte Umfassung' },
  { id: 'supply-line', label: 'Versorgungslinie', color: '#10B981', width: 2, dash: '6 2 2 2', arrowStyle: 'outlined', description: 'Logistik/Nachschub' },
];
