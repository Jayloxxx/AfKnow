// ── MOSAIC Intel Engine Types ──────────────────────────

export type IntelCategory = 'security' | 'politics' | 'military' | 'economy' | 'humanitarian' | 'diplomacy' | 'infrastructure' | 'other';

export type VerificationStatus = 'confirmed' | 'verified' | 'plausible' | 'unconfirmed' | 'disputed' | 'disinfo';

export type SourceType = 'twitter' | 'telegram' | 'instagram' | 'facebook' | 'reuters' | 'afp' | 'local_media' | 'acled' | 'gdelt' | 'un_ocha' | 'government' | 'ngo' | 'analyst' | 'manual' | 'other';

export type EventStatus = 'active' | 'monitoring' | 'resolved' | 'archived';

export type TrendDirection = 'escalating' | 'stable' | 'de-escalating';

export type ActorType = 'state' | 'military' | 'militia' | 'terrorist' | 'political_party' | 'ngo' | 'igo' | 'corporation' | 'individual' | 'organization' | 'other';

export type Severity = 1 | 2 | 3 | 4 | 5;

// ── Intel Report ──

export interface IntelReport {
  id: string;
  userId: string;
  title: string;
  content: string;
  sourceType: SourceType;
  sourceName: string;
  sourceUrl: string;
  category: IntelCategory;
  severity: Severity;
  verificationStatus: VerificationStatus;
  region: string;
  countryIds: string[];
  latitude: number | null;
  longitude: number | null;
  locationLabel: string;
  tags: string[];
  analystNotes: string;
  createdAt: string;
  updatedAt: string;
}

// ── Mosaic Event ──

export interface MosaicEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: IntelCategory;
  region: string;
  countryIds: string[];
  status: EventStatus;
  trend: TrendDirection;
  severity: Severity;
  startedAt: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Actor ──

export interface IntelActor {
  id: string;
  userId: string;
  name: string;
  type: ActorType;
  description: string;
  country: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Links ──

export interface IntelEventLink {
  id: string;
  intelReportId: string;
  mosaicEventId: string;
}

export interface ActorEventLink {
  id: string;
  actorId: string;
  mosaicEventId: string;
  role: string;
}

// ── Daily Briefing ──

export interface DailyBriefing {
  id: string;
  userId: string;
  date: string;
  title: string;
  priorityAlerts: string;
  situationUpdates: string;
  trendAnalysis: string;
  mosaicUpdates: string;
  forecast: string;
  createdAt: string;
  updatedAt: string;
}

// ── UI Helpers ──

export const VERIFICATION_CONFIG: Record<VerificationStatus, { label: string; color: string; bg: string }> = {
  confirmed:   { label: 'Confirmed',   color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  verified:    { label: 'Verified',    color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  plausible:   { label: 'Plausible',   color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
  unconfirmed: { label: 'Unconfirmed', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  disputed:    { label: 'Disputed',    color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  disinfo:     { label: 'Disinfo',     color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

export const CATEGORY_CONFIG: Record<IntelCategory, { label: string; color: string }> = {
  security:       { label: 'Sicherheit',     color: '#ef4444' },
  politics:       { label: 'Politik',         color: '#a855f7' },
  military:       { label: 'Militär',         color: '#f97316' },
  economy:        { label: 'Wirtschaft',      color: '#10b981' },
  humanitarian:   { label: 'Humanitär',       color: '#0ea5e9' },
  diplomacy:      { label: 'Diplomatie',      color: '#3b82f6' },
  infrastructure: { label: 'Infrastruktur',   color: '#8b5cf6' },
  other:          { label: 'Sonstiges',       color: '#6b7280' },
};

export const SEVERITY_CONFIG: Record<Severity, { label: string; color: string }> = {
  1: { label: 'Routine',   color: '#6b7280' },
  2: { label: 'Relevant',  color: '#3b82f6' },
  3: { label: 'Wichtig',   color: '#eab308' },
  4: { label: 'Kritisch',  color: '#f97316' },
  5: { label: 'Flash',     color: '#ef4444' },
};

export const TREND_CONFIG: Record<TrendDirection, { label: string; color: string; icon: string }> = {
  escalating:     { label: 'Eskalierend',     color: '#ef4444', icon: '↑' },
  stable:         { label: 'Stabil',          color: '#eab308', icon: '→' },
  'de-escalating': { label: 'De-eskalierend', color: '#22c55e', icon: '↓' },
};

export const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: 'manual', label: 'Manuelle Eingabe' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'reuters', label: 'Reuters' },
  { value: 'afp', label: 'AFP' },
  { value: 'local_media', label: 'Lokale Medien' },
  { value: 'acled', label: 'ACLED' },
  { value: 'gdelt', label: 'GDELT' },
  { value: 'un_ocha', label: 'UN OCHA' },
  { value: 'government', label: 'Regierungsquelle' },
  { value: 'ngo', label: 'NGO' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'other', label: 'Sonstige' },
];
