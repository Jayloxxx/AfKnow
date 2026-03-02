import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════
// Lagefortschreibung — Real-Time Situation Report Store
// ═══════════════════════════════════════════════════════════════════

export type LagePriority = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type LageCategory = 'military' | 'political' | 'humanitarian' | 'economic' | 'cyber' | 'diplomatic' | 'intelligence' | 'infrastructure';
export type LageViewMode = 'timeline' | 'lanes' | 'tree' | 'cards' | 'matrix';

export interface LageActor {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string; // emoji or icon key
  parentId?: string; // for tree hierarchy
  order: number;
}

export interface LageTag {
  id: string;
  label: string;
  color: string;
}

export interface LageEntry {
  id: string;
  actorId: string;
  category: LageCategory;
  priority: LagePriority;
  title: string;
  content: string; // markdown
  tags: string[];
  linkedEntryIds: string[];
  timestamp: string; // ISO
  updatedAt: string;
  pinned: boolean;
  archived: boolean;
  attachments: { id: string; name: string; type: string; url: string }[];
  location?: string;
  sourceUrl?: string;
  sourceLabel?: string;
}

export interface LageTreeNode {
  id: string;
  label: string;
  parentId: string | null;
  color: string;
  collapsed: boolean;
  entryIds: string[];
  order: number;
}

const DEFAULT_ACTORS: LageActor[] = [
  { id: 'isr', name: 'Israel', shortName: 'ISR', color: '#3b82f6', icon: '🇮🇱', order: 0 },
  { id: 'usa', name: 'USA', shortName: 'USA', color: '#6366f1', icon: '🇺🇸', order: 1 },
  { id: 'irn', name: 'Iran', shortName: 'IRN', color: '#ef4444', icon: '🇮🇷', order: 2 },
  { id: 'rus', name: 'Russland', shortName: 'RUS', color: '#f97316', icon: '🇷🇺', order: 3 },
  { id: 'chn', name: 'China', shortName: 'CHN', color: '#eab308', icon: '🇨🇳', order: 4 },
  { id: 'tur', name: 'Türkei', shortName: 'TUR', color: '#14b8a6', icon: '🇹🇷', order: 5 },
  { id: 'sau', name: 'Saudi-Arabien', shortName: 'SAU', color: '#22c55e', icon: '🇸🇦', order: 6 },
  { id: 'hzb', name: 'Hisbollah', shortName: 'HZB', color: '#a855f7', icon: '⚔️', order: 7 },
  { id: 'hms', name: 'Hamas', shortName: 'HMS', color: '#84cc16', icon: '⚔️', order: 8 },
  { id: 'hth', name: 'Houthi', shortName: 'HTH', color: '#f43f5e', icon: '⚔️', order: 9 },
];

const DEFAULT_TAGS: LageTag[] = [
  { id: 'mil-op', label: 'Militäroperation', color: '#ef4444' },
  { id: 'diplo', label: 'Diplomatie', color: '#3b82f6' },
  { id: 'sanktion', label: 'Sanktion', color: '#f59e0b' },
  { id: 'cyber', label: 'Cyberangriff', color: '#8b5cf6' },
  { id: 'humaid', label: 'Humanitäre Hilfe', color: '#10b981' },
  { id: 'truppenbewegung', label: 'Truppenbewegung', color: '#f97316' },
  { id: 'statement', label: 'Offiz. Statement', color: '#06b6d4' },
  { id: 'eskalation', label: 'Eskalation', color: '#dc2626' },
  { id: 'deeskalation', label: 'Deeskalation', color: '#22c55e' },
  { id: 'analyse', label: 'Analyse', color: '#6366f1' },
];

const SAMPLE_ENTRIES: LageEntry[] = [
  {
    id: 'e1',
    actorId: 'isr',
    category: 'military',
    priority: 'critical',
    title: 'IDF verstärkt Präsenz an Nordgrenze',
    content: '## Lagebericht\n\nNach Raketenangriffen aus dem Südlibanon hat die IDF ihre Truppenpräsenz im nördlichen Grenzgebiet signifikant erhöht.\n\n- 2 zusätzliche Brigaden verlegt\n- Luftraumüberwachung verstärkt\n- Iron Dome Batterien repositioniert',
    tags: ['mil-op', 'truppenbewegung', 'eskalation'],
    linkedEntryIds: ['e2'],
    timestamp: '2025-12-15T08:30:00Z',
    updatedAt: '2025-12-15T14:22:00Z',
    pinned: true,
    archived: false,
    attachments: [],
    location: 'Nordgrenze Israel/Libanon',
    sourceUrl: '',
    sourceLabel: 'IDF Spokesperson',
  },
  {
    id: 'e2',
    actorId: 'hzb',
    category: 'military',
    priority: 'high',
    title: 'Raketenangriff auf Nordisrael',
    content: 'Hisbollah feuert ca. 30 Raketen auf Gebiete in Nordisrael. Mehrere Einschläge in Kiryat Shmona gemeldet.',
    tags: ['mil-op', 'eskalation'],
    linkedEntryIds: ['e1'],
    timestamp: '2025-12-15T06:15:00Z',
    updatedAt: '2025-12-15T06:15:00Z',
    pinned: false,
    archived: false,
    attachments: [],
    location: 'Kiryat Shmona, Israel',
  },
  {
    id: 'e3',
    actorId: 'usa',
    category: 'diplomatic',
    priority: 'high',
    title: 'State Department fordert Deeskalation',
    content: 'Das US-Außenministerium hat beide Seiten zur Deeskalation aufgerufen. Sondergesandter Amos Hochstein wird in die Region entsandt.',
    tags: ['diplo', 'deeskalation', 'statement'],
    linkedEntryIds: ['e1', 'e2'],
    timestamp: '2025-12-15T16:00:00Z',
    updatedAt: '2025-12-15T16:00:00Z',
    pinned: false,
    archived: false,
    attachments: [],
  },
  {
    id: 'e4',
    actorId: 'irn',
    category: 'political',
    priority: 'medium',
    title: 'Teheran warnt vor Vergeltung',
    content: 'Irans Außenminister droht mit „entschiedener Antwort" auf israelische Operationen im Libanon. IRGC-Quds-Kräfte in erhöhter Bereitschaft.',
    tags: ['statement', 'eskalation'],
    linkedEntryIds: ['e1'],
    timestamp: '2025-12-15T18:45:00Z',
    updatedAt: '2025-12-15T18:45:00Z',
    pinned: false,
    archived: false,
    attachments: [],
  },
  {
    id: 'e5',
    actorId: 'rus',
    category: 'diplomatic',
    priority: 'low',
    title: 'Moskau bietet Vermittlung an',
    content: 'Lawrow bietet Russland als Vermittler im Nahostkonflikt an. Kreml betont „ausgewogene Position".',
    tags: ['diplo', 'statement'],
    linkedEntryIds: [],
    timestamp: '2025-12-16T09:00:00Z',
    updatedAt: '2025-12-16T09:00:00Z',
    pinned: false,
    archived: false,
    attachments: [],
  },
  {
    id: 'e6',
    actorId: 'tur',
    category: 'diplomatic',
    priority: 'medium',
    title: 'Erdogan verurteilt israelische Offensive',
    content: 'Präsident Erdogan verurteilt die israelischen Militäroperationen scharf und droht mit Abbruch diplomatischer Beziehungen.',
    tags: ['diplo', 'statement', 'eskalation'],
    linkedEntryIds: ['e1'],
    timestamp: '2025-12-16T11:30:00Z',
    updatedAt: '2025-12-16T11:30:00Z',
    pinned: false,
    archived: false,
    attachments: [],
  },
];

interface LageState {
  // Data
  actors: LageActor[];
  tags: LageTag[];
  entries: LageEntry[];
  treeNodes: LageTreeNode[];

  // UI
  viewMode: LageViewMode;
  selectedEntryId: string | null;
  searchQuery: string;
  filterActors: string[];
  filterCategories: LageCategory[];
  filterPriorities: LagePriority[];
  filterTags: string[];
  showArchived: boolean;
  quickEntryOpen: boolean;
  quickEntryActorId: string;
  timeRange: { start: string; end: string } | null;
  sidebarCollapsed: boolean;
  matrixAxisX: 'actor' | 'category' | 'priority';
  matrixAxisY: 'actor' | 'category' | 'priority';

  // Actions — Entries
  addEntry: (entry: LageEntry) => void;
  updateEntry: (id: string, updates: Partial<LageEntry>) => void;
  removeEntry: (id: string) => void;
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
  linkEntries: (id1: string, id2: string) => void;
  unlinkEntries: (id1: string, id2: string) => void;

  // Actions — Actors
  addActor: (actor: LageActor) => void;
  updateActor: (id: string, updates: Partial<LageActor>) => void;
  removeActor: (id: string) => void;
  reorderActors: (ids: string[]) => void;

  // Actions — Tags
  addTag: (tag: LageTag) => void;
  removeTag: (id: string) => void;

  // Actions — Tree
  addTreeNode: (node: LageTreeNode) => void;
  updateTreeNode: (id: string, updates: Partial<LageTreeNode>) => void;
  removeTreeNode: (id: string) => void;
  toggleTreeCollapse: (id: string) => void;

  // Actions — UI
  setViewMode: (mode: LageViewMode) => void;
  setSelectedEntry: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  toggleFilterActor: (id: string) => void;
  toggleFilterCategory: (cat: LageCategory) => void;
  toggleFilterPriority: (p: LagePriority) => void;
  toggleFilterTag: (id: string) => void;
  clearFilters: () => void;
  setShowArchived: (show: boolean) => void;
  setQuickEntryOpen: (open: boolean) => void;
  setQuickEntryActorId: (id: string) => void;
  setTimeRange: (range: { start: string; end: string } | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMatrixAxis: (axis: 'x' | 'y', value: 'actor' | 'category' | 'priority') => void;
}

export const useLageStore = create<LageState>()(
  persist(
    (set) => ({
      actors: DEFAULT_ACTORS,
      tags: DEFAULT_TAGS,
      entries: SAMPLE_ENTRIES,
      treeNodes: [],

      viewMode: 'lanes',
      selectedEntryId: null,
      searchQuery: '',
      filterActors: [],
      filterCategories: [],
      filterPriorities: [],
      filterTags: [],
      showArchived: false,
      quickEntryOpen: false,
      quickEntryActorId: DEFAULT_ACTORS[0].id,
      timeRange: null,
      sidebarCollapsed: false,
      matrixAxisX: 'actor',
      matrixAxisY: 'category',

      // Entries
      addEntry: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
      updateEntry: (id, updates) => set((s) => ({
        entries: s.entries.map((e) => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e),
      })),
      removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      togglePin: (id) => set((s) => ({
        entries: s.entries.map((e) => e.id === id ? { ...e, pinned: !e.pinned } : e),
      })),
      toggleArchive: (id) => set((s) => ({
        entries: s.entries.map((e) => e.id === id ? { ...e, archived: !e.archived } : e),
      })),
      linkEntries: (id1, id2) => set((s) => ({
        entries: s.entries.map((e) => {
          if (e.id === id1 && !e.linkedEntryIds.includes(id2)) return { ...e, linkedEntryIds: [...e.linkedEntryIds, id2] };
          if (e.id === id2 && !e.linkedEntryIds.includes(id1)) return { ...e, linkedEntryIds: [...e.linkedEntryIds, id1] };
          return e;
        }),
      })),
      unlinkEntries: (id1, id2) => set((s) => ({
        entries: s.entries.map((e) => {
          if (e.id === id1) return { ...e, linkedEntryIds: e.linkedEntryIds.filter((x) => x !== id2) };
          if (e.id === id2) return { ...e, linkedEntryIds: e.linkedEntryIds.filter((x) => x !== id1) };
          return e;
        }),
      })),

      // Actors
      addActor: (actor) => set((s) => ({ actors: [...s.actors, actor] })),
      updateActor: (id, updates) => set((s) => ({
        actors: s.actors.map((a) => a.id === id ? { ...a, ...updates } : a),
      })),
      removeActor: (id) => set((s) => ({ actors: s.actors.filter((a) => a.id !== id) })),
      reorderActors: (ids) => set((s) => ({
        actors: ids.map((id, i) => {
          const a = s.actors.find((x) => x.id === id);
          return a ? { ...a, order: i } : null;
        }).filter(Boolean) as LageActor[],
      })),

      // Tags
      addTag: (tag) => set((s) => ({ tags: [...s.tags, tag] })),
      removeTag: (id) => set((s) => ({ tags: s.tags.filter((t) => t.id !== id) })),

      // Tree
      addTreeNode: (node) => set((s) => ({ treeNodes: [...s.treeNodes, node] })),
      updateTreeNode: (id, updates) => set((s) => ({
        treeNodes: s.treeNodes.map((n) => n.id === id ? { ...n, ...updates } : n),
      })),
      removeTreeNode: (id) => set((s) => ({ treeNodes: s.treeNodes.filter((n) => n.id !== id) })),
      toggleTreeCollapse: (id) => set((s) => ({
        treeNodes: s.treeNodes.map((n) => n.id === id ? { ...n, collapsed: !n.collapsed } : n),
      })),

      // UI
      setViewMode: (mode) => set({ viewMode: mode }),
      setSelectedEntry: (id) => set({ selectedEntryId: id }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      toggleFilterActor: (id) => set((s) => ({
        filterActors: s.filterActors.includes(id) ? s.filterActors.filter((x) => x !== id) : [...s.filterActors, id],
      })),
      toggleFilterCategory: (cat) => set((s) => ({
        filterCategories: s.filterCategories.includes(cat) ? s.filterCategories.filter((x) => x !== cat) : [...s.filterCategories, cat],
      })),
      toggleFilterPriority: (p) => set((s) => ({
        filterPriorities: s.filterPriorities.includes(p) ? s.filterPriorities.filter((x) => x !== p) : [...s.filterPriorities, p],
      })),
      toggleFilterTag: (id) => set((s) => ({
        filterTags: s.filterTags.includes(id) ? s.filterTags.filter((x) => x !== id) : [...s.filterTags, id],
      })),
      clearFilters: () => set({ filterActors: [], filterCategories: [], filterPriorities: [], filterTags: [], timeRange: null }),
      setShowArchived: (show) => set({ showArchived: show }),
      setQuickEntryOpen: (open) => set({ quickEntryOpen: open }),
      setQuickEntryActorId: (id) => set({ quickEntryActorId: id }),
      setTimeRange: (range) => set({ timeRange: range }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMatrixAxis: (axis, value) => set(() =>
        axis === 'x' ? { matrixAxisX: value } : { matrixAxisY: value }
      ),
    }),
    {
      name: 'afknow-lage-storage',
      partialize: (s) => ({
        actors: s.actors,
        tags: s.tags,
        entries: s.entries,
        treeNodes: s.treeNodes,
        viewMode: s.viewMode,
      }),
    }
  )
);

// ═══ Helpers ═══

export const PRIORITY_CONFIG: Record<LagePriority, { label: string; color: string; bg: string }> = {
  critical: { label: 'KRITISCH', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  high: { label: 'HOCH', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  medium: { label: 'MITTEL', color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
  low: { label: 'NIEDRIG', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  info: { label: 'INFO', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

export const CATEGORY_CONFIG: Record<LageCategory, { label: string; icon: string; color: string }> = {
  military: { label: 'Militärisch', icon: '⚔️', color: '#ef4444' },
  political: { label: 'Politisch', icon: '🏛️', color: '#6366f1' },
  humanitarian: { label: 'Humanitär', icon: '🏥', color: '#f59e0b' },
  economic: { label: 'Wirtschaft', icon: '📊', color: '#22c55e' },
  cyber: { label: 'Cyber', icon: '💻', color: '#8b5cf6' },
  diplomatic: { label: 'Diplomatisch', icon: '🤝', color: '#3b82f6' },
  intelligence: { label: 'Nachrichtendienst', icon: '🔍', color: '#f97316' },
  infrastructure: { label: 'Infrastruktur', icon: '🏗️', color: '#06b6d4' },
};
