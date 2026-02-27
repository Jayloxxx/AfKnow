// ═══════ Fill Types ═══════

export interface SolidFill {
  type: 'solid';
  color: string;
  opacity: number;
}

export interface HalfFill {
  type: 'half';
  color1: string;
  color2: string;
  direction: 'horizontal' | 'vertical' | 'diagonal';
  opacity: number;
}

export interface GradientFill {
  type: 'gradient';
  color1: string;
  color2: string;
  angle: number;
  opacity: number;
}

export interface PatternFill {
  type: 'pattern';
  patternId: 'stripes' | 'crosshatch' | 'dots' | 'diagonal-lines';
  color: string;
  backgroundColor: string;
  scale: number;
  opacity: number;
}

export type Fill = SolidFill | HalfFill | GradientFill | PatternFill;

export function solidFill(color: string, opacity = 0.8): SolidFill {
  return { type: 'solid', color, opacity };
}

// ═══════ Editor Country ═══════

export interface EditorCountry {
  id: string;
  fill: Fill;
  strokeColor: string;
  strokeWidth: number;
  strokeDasharray: string;
  labelVisible: boolean;
  zIndex: number;
}

// ═══════ Editor Element ═══════

export type EditorElementType =
  | 'text' | 'rect' | 'ellipse' | 'line'
  | 'arrow' | 'curved-arrow' | 'polygon' | 'freehand'
  | 'frontline' | 'zone' | 'military-unit' | 'marker'
  | 'range-circle' | 'supply-route' | 'heatmap-point'
  | 'image' | 'image-pin' | 'route' | 'callout';

export type ArrowCap = 'none' | 'arrow' | 'circle' | 'diamond';
export type ZonePreset = 'controlled' | 'contested' | 'hostile' | 'neutral';

// ═══════ NATO APP-6 Factions & Echelons ═══════

export type Faction = 'friendly' | 'hostile' | 'neutral' | 'unknown';
export type Echelon = 'team' | 'squad' | 'platoon' | 'company' | 'battalion' | 'regiment' | 'brigade' | 'division' | 'corps' | 'army' | 'army-group';
export type ConfidenceLevel = 'confirmed' | 'probable' | 'possible' | 'doubtful';

// ═══════ Timeline Phase ═══════

export interface TimelinePhase {
  id: string;
  label: string;
  timestamp: number; // unix ms or phase index
  color: string;
}

// ═══════ Weapon Range Preset ═══════

export interface WeaponRange {
  id: string;
  label: string;
  rangeKm: number;
  color: string;
  category: 'sam' | 'artillery' | 'missile' | 'radar' | 'air';
}

// ═══════ Layer Group ═══════

export interface LayerGroup {
  id: string;
  label: string;
  collapsed: boolean;
  visible: boolean;
  locked: boolean;
  opacity: number;
  elementIds: string[];
}

export interface EditorElement {
  id: string;
  type: EditorElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: Fill;
  strokeColor: string;
  strokeWidth: number;
  strokeDasharray: string;
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  points: [number, number][];
  arrowStart: ArrowCap;
  arrowEnd: ArrowCap;
  militarySymbol: string;
  zonePreset: ZonePreset;
  faction: Faction;
  echelon: Echelon;
  confidence: ConfidenceLevel;
  timelinePhase: string; // phase id
  weaponRangeId: string; // for range circle elements
  imageDataUrl: string; // for image elements (base64 data URL)
  routeWaypoints?: [number, number][]; // SVG coords for route tool
  routeProfile?: 'car' | 'foot';
  routeDistanceKm?: number;
  routeDurationMin?: number;
  routeGeometry?: [number, number][]; // snapped SVG polyline
  zIndex: number;
  locked: boolean;
  visible: boolean;
  groupId: string;
}

export function defaultElement(type: EditorElementType, x: number, y: number): EditorElement {
  return {
    id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, x, y,
    width: type === 'rect' ? 120 : type === 'ellipse' ? 80 : type === 'callout' ? 160 : 0,
    height: type === 'rect' ? 80 : type === 'ellipse' ? 80 : type === 'callout' ? 60 : 0,
    rotation: 0,
    fill: solidFill('#D4A74F', 0.3),
    strokeColor: '#D4A74F',
    strokeWidth: 2,
    strokeDasharray: '',
    content: '',
    fontSize: 18,
    fontFamily: 'var(--font-display)',
    fontWeight: '500',
    textAlign: 'center',
    points: [],
    arrowStart: 'none',
    arrowEnd: 'arrow',
    militarySymbol: 'infantry',
    zonePreset: 'neutral',
    faction: 'friendly',
    echelon: 'company',
    confidence: 'confirmed',
    timelinePhase: '',
    weaponRangeId: '',
    imageDataUrl: '',
    zIndex: 0,
    locked: false,
    visible: true,
    groupId: '',
  };
}

// ═══════ Sub-Region ═══════

export interface EditorSubRegion {
  id: string;
  countryId: string;
  label: string;
  path: string;
  fill: Fill;
  strokeColor: string;
  strokeWidth: number;
  strokeDasharray: string;
  labelVisible: boolean;
}

// ═══════ State Snapshot ═══════

export interface EditorSnapshot {
  countries: EditorCountry[];
  elements: EditorElement[];
  subRegions: EditorSubRegion[];
}

// ═══════ Canvas Transform ═══════

export interface CanvasTransform {
  zoom: number;
  panX: number;
  panY: number;
}

// ═══════ Legend Entry ═══════

export interface LegendEntry {
  id: string;
  label: string;
  color: string;
  symbol?: 'rect' | 'circle' | 'line' | 'pattern';
}

// ═══════ Measurement ═══════

export interface Measurement {
  id: string;
  type: 'measure' | 'radius' | 'polygon-area' | 'multi-segment';
  start: { x: number; y: number };
  end: { x: number; y: number };
  /** For polygon-area and multi-segment: array of {x,y} points */
  points?: { x: number; y: number }[];
}

// ═══════ Tool Type ═══════

export type ToolType =
  | 'select' | 'pan'
  | 'text' | 'rect' | 'ellipse' | 'line'
  | 'arrow' | 'curved-arrow' | 'polygon' | 'freehand'
  | 'marker' | 'zone' | 'frontline' | 'military-unit'
  | 'range-circle' | 'sub-region' | 'supply-route' | 'heatmap-point'
  | 'measure' | 'radius' | 'polygon-area' | 'multi-segment'
  | 'image-pin' | 'route' | 'callout';
