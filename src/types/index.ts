export type Region = 'North Africa' | 'West Africa' | 'East Africa' | 'Central Africa' | 'Southern Africa';

export type MERegion = 'Levant' | 'Golfstaaten' | 'Mesopotamien' | 'Persisch' | 'Arabische Halbinsel' | 'Erweitert';

export type MapView =
  | 'political' | 'geographic' | 'population' | 'economic' | 'conflict'
  | 'osm' | 'topo' | 'satellite-live' | 'leaflet'
  | 'stadia-dark' | 'stadia-light' | 'stadia-terrain'
  | 'carto-dark' | 'carto-voyager' | 'carto-positron'
  | 'esri-topo' | 'esri-street' | 'esri-ocean'
  | 'hot' | 'sentinel';

export type DetailTab = 'overview' | 'economy' | 'politics' | 'military' | 'actors' | 'conflicts' | 'relations' | 'missions' | 'humanitarian' | 'infrastructure' | 'news';

export interface SourcedText {
  text: string;
  source: string;
  sourceLabel: string;
}

export interface CountryData {
  id: string;
  name: string;
  nameLocal?: string;
  capital: string;
  capitalCoords: [number, number];
  region: Region;
  path: string;
  labelPos: [number, number];
  population: number;
  area: number;
  gdp?: number;
  languages?: string[];
  currency?: string;
  flagEmoji: string;
  details: {
    overview: SourcedText;
    economy: SourcedText;
    politics: SourcedText;
    security: SourcedText;
    humanitarian: SourcedText;
    infrastructure: SourcedText;
  };
  airports: LocationPoint[];
  majorCities: CityPoint[];
  keyFacts?: KeyFact[];
}

export interface LocationPoint {
  name: string;
  coords: [number, number];
  type: 'airport' | 'port' | 'military' | 'custom';
  description?: string;
}

export interface CityPoint {
  name: string;
  coords: [number, number];
  population: number;
  isCapital?: boolean;
}

export interface KeyFact {
  label: string;
  value: string;
  icon?: string;
}

export interface RiverData {
  id: string;
  name: string;
  path: string;
  length: number;
  source: string;
  sourceLabel: string;
  countries: string[];
}

export interface UserMarker {
  id: string;
  name: string;
  coords: [number, number];
  type: string;
  color: string;
  notes?: string;
  countryId?: string;
  userId?: string;
}

export interface SavedMap {
  id: string;
  name: string;
  description?: string;
  elements: MapElement[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface MapElement {
  id: string;
  type: 'country' | 'marker' | 'text' | 'shape' | 'icon' | 'line' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  content?: string;
  style?: Record<string, string>;
  countryId?: string;
  color?: string;
  fontSize?: number;
}

export interface SearchResult {
  type: 'country' | 'city' | 'river' | 'airport';
  id: string;
  name: string;
  subtitle: string;
  countryId?: string;
}

// ── Military & Security Data ──────────────────────────

export interface MilitaryOverview {
  armedForcesName: string;
  founded?: number;
  activePersonnel: number;
  reservePersonnel: number;
  paramilitaryPersonnel?: number;
  militaryBudget: number;
  budgetPercentGDP: number;
  conscription: boolean;
  commanderInChief?: string;
  source: string;
  sourceLabel: string;
}

export interface WeaponSystem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  origin: string;
  status: string;
  notes?: string;
  source: string;
  sourceLabel: string;
}

export interface SecurityActor {
  id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  areas?: string;
  estimatedStrength?: string;
  source: string;
  sourceLabel: string;
}

export interface ArmedConflict {
  id: string;
  name: string;
  parties: string[];
  status: string;
  startYear: number;
  endYear?: number;
  description: string;
  casualties?: string;
  source: string;
  sourceLabel: string;
}

export interface CountryRelation {
  id: string;
  countryId: string;
  countryName: string;
  countryFlag?: string;
  type: string;
  description: string;
  source: string;
  sourceLabel: string;
}

export interface InternationalMission {
  id: string;
  name: string;
  fullName: string;
  organization: 'UN' | 'EU' | 'AU' | 'US' | 'Russland' | 'China' | 'Deutschland' | 'Frankreich' | 'NATO' | 'Sonstige';
  type: string;
  status: string;
  startYear: number;
  endYear?: number;
  personnel?: number;
  description: string;
  countries: string[];
  source: string;
  sourceLabel: string;
}

export interface CountryMilitaryData {
  overview: MilitaryOverview;
  weaponSystems: WeaponSystem[];
  actors: SecurityActor[];
  conflicts: ArmedConflict[];
  relations: CountryRelation[];
  missions: InternationalMission[];
}
