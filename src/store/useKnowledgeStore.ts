import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KBEntry, KBCategory, KBStatus, KBSource, KBCrossLink, KBTimelineEvent, KBImage } from '../data/knowledgeBase';
import type { Scenario, ScenarioAction, CascadeResult } from '../lib/scenarioEngine';

export type KBViewMode = 'entries' | 'network' | 'timeline' | 'compare' | 'heatmap' | 'scenario';

export interface KBNote {
  id: string;
  entryId: string;
  text: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeState {
  // User-added / edited entries (overlay on top of static data)
  userEntries: Record<string, Partial<KBEntry>>;
  customEntries: KBEntry[];

  // Notes
  notes: KBNote[];

  // UI State
  selectedEntryId: string | null;
  searchQuery: string;
  activeCategory: KBCategory | 'all';
  activeStatus: KBStatus | 'all';
  sortBy: 'title' | 'severity' | 'updatedAt' | 'startYear';
  sortDir: 'asc' | 'desc';
  editMode: boolean;
  showTimeline: boolean;
  viewMode: KBViewMode;
  compareIds: [string | null, string | null];

  // Scenario Planner
  savedScenarios: Scenario[];
  scenarioActions: ScenarioAction[];
  cascadeResult: CascadeResult | null;

  // Actions
  selectEntry: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setActiveCategory: (c: KBCategory | 'all') => void;
  setActiveStatus: (s: KBStatus | 'all') => void;
  setSortBy: (s: 'title' | 'severity' | 'updatedAt' | 'startYear') => void;
  toggleSortDir: () => void;
  setEditMode: (on: boolean) => void;
  setShowTimeline: (on: boolean) => void;
  setViewMode: (mode: KBViewMode) => void;
  setCompareIds: (ids: [string | null, string | null]) => void;

  // Scenario actions
  addScenarioAction: (action: ScenarioAction) => void;
  removeScenarioAction: (actionId: string) => void;
  clearScenarioActions: () => void;
  setCascadeResult: (result: CascadeResult | null) => void;
  saveScenario: (name: string, description: string) => void;
  loadScenario: (scenario: Scenario) => void;
  deleteScenario: (scenarioId: string) => void;

  // Notes CRUD
  addNote: (entryId: string, text: string, color?: string) => void;
  updateNote: (noteId: string, text: string) => void;
  removeNote: (noteId: string) => void;
  getNotesForEntry: (entryId: string) => KBNote[];

  // CRUD for custom entries
  addCustomEntry: (entry: KBEntry) => void;
  removeCustomEntry: (id: string) => void;

  // Edit overlay (edits on existing entries)
  updateEntryField: (id: string, field: string, value: unknown) => void;
  addSource: (entryId: string, source: KBSource) => void;
  removeSource: (entryId: string, sourceId: string) => void;
  updateSource: (entryId: string, sourceId: string, updates: Partial<KBSource>) => void;
  addCrossLink: (entryId: string, link: KBCrossLink) => void;
  removeCrossLink: (entryId: string, targetId: string) => void;
  addTimelineEvent: (entryId: string, event: KBTimelineEvent) => void;
  removeTimelineEvent: (entryId: string, date: string) => void;
  addImage: (entryId: string, image: KBImage) => void;
  removeImage: (entryId: string, imageId: string) => void;
}

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set, get) => ({
      userEntries: {},
      customEntries: [],
      notes: [],
      selectedEntryId: null,
      searchQuery: '',
      activeCategory: 'all',
      activeStatus: 'all',
      sortBy: 'severity',
      sortDir: 'desc',
      editMode: false,
      showTimeline: false,
      viewMode: 'entries',
      compareIds: [null, null],
      savedScenarios: [],
      scenarioActions: [],
      cascadeResult: null,

      selectEntry: (id) => set({ selectedEntryId: id }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setActiveCategory: (c) => set({ activeCategory: c }),
      setActiveStatus: (s) => set({ activeStatus: s }),
      setSortBy: (s) => set({ sortBy: s }),
      toggleSortDir: () => set((st) => ({ sortDir: st.sortDir === 'asc' ? 'desc' : 'asc' })),
      setEditMode: (on) => set({ editMode: on }),
      setShowTimeline: (on) => set({ showTimeline: on }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setCompareIds: (ids) => set({ compareIds: ids }),

      // Scenario
      addScenarioAction: (action) => set((s) => ({ scenarioActions: [...s.scenarioActions, action] })),
      removeScenarioAction: (actionId) => set((s) => ({ scenarioActions: s.scenarioActions.filter(a => a.id !== actionId) })),
      clearScenarioActions: () => set({ scenarioActions: [], cascadeResult: null }),
      setCascadeResult: (result) => set({ cascadeResult: result }),
      saveScenario: (name, description) => set((s) => ({
        savedScenarios: [...s.savedScenarios, {
          id: `scenario-${Date.now()}`,
          name, description,
          actions: [...s.scenarioActions],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isTemplate: false,
        }],
      })),
      loadScenario: (scenario) => set({ scenarioActions: [...scenario.actions], cascadeResult: null }),
      deleteScenario: (scenarioId) => set((s) => ({ savedScenarios: s.savedScenarios.filter(sc => sc.id !== scenarioId) })),

      // Notes
      addNote: (entryId, text, color) => set((s) => ({
        notes: [...s.notes, {
          id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          entryId,
          text,
          color: color ?? '#f59e0b',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
      })),
      updateNote: (noteId, text) => set((s) => ({
        notes: s.notes.map((n) => n.id === noteId ? { ...n, text, updatedAt: new Date().toISOString() } : n),
      })),
      removeNote: (noteId) => set((s) => ({
        notes: s.notes.filter((n) => n.id !== noteId),
      })),
      getNotesForEntry: (entryId) => get().notes.filter((n) => n.entryId === entryId),

      addCustomEntry: (entry) => set((s) => ({ customEntries: [entry, ...s.customEntries] })),
      removeCustomEntry: (id) => set((s) => ({
        customEntries: s.customEntries.filter((e) => e.id !== id),
        userEntries: (() => { const next = { ...s.userEntries }; delete next[id]; return next; })(),
      })),

      updateEntryField: (id, field, value) => set((s) => ({
        userEntries: {
          ...s.userEntries,
          [id]: { ...s.userEntries[id], [field]: value, updatedAt: new Date().toISOString().split('T')[0] },
        },
      })),

      addSource: (entryId, source) => set((s) => {
        const existing = s.userEntries[entryId]?.sources ?? [];
        return {
          userEntries: {
            ...s.userEntries,
            [entryId]: { ...s.userEntries[entryId], sources: [...existing, source] },
          },
        };
      }),
      removeSource: (entryId, sourceId) => set((s) => {
        const existing = s.userEntries[entryId]?.sources ?? [];
        return {
          userEntries: {
            ...s.userEntries,
            [entryId]: { ...s.userEntries[entryId], sources: existing.filter((src) => src.id !== sourceId) },
          },
        };
      }),
      updateSource: (entryId, sourceId, updates) => set((s) => {
        const existing = s.userEntries[entryId]?.sources ?? [];
        return {
          userEntries: {
            ...s.userEntries,
            [entryId]: {
              ...s.userEntries[entryId],
              sources: existing.map((src) => src.id === sourceId ? { ...src, ...updates } : src),
            },
          },
        };
      }),

      addCrossLink: (entryId, link) => set((s) => {
        const existing = s.userEntries[entryId]?.crossLinks ?? [];
        return {
          userEntries: {
            ...s.userEntries,
            [entryId]: { ...s.userEntries[entryId], crossLinks: [...existing, link] },
          },
        };
      }),
      removeCrossLink: (entryId, targetId) => set((s) => {
        const existing = s.userEntries[entryId]?.crossLinks ?? [];
        return {
          userEntries: {
            ...s.userEntries,
            [entryId]: { ...s.userEntries[entryId], crossLinks: existing.filter((l) => l.targetId !== targetId) },
          },
        };
      }),

      addTimelineEvent: (entryId, event) => set((s) => {
        const existing = s.userEntries[entryId]?.timeline ?? [];
        return {
          userEntries: {
            ...s.userEntries,
            [entryId]: { ...s.userEntries[entryId], timeline: [...existing, event].sort((a, b) => a.date.localeCompare(b.date)) },
          },
        };
      }),
      removeTimelineEvent: (entryId, date) => set((s) => {
        const existing = s.userEntries[entryId]?.timeline ?? [];
        return {
          userEntries: {
            ...s.userEntries,
            [entryId]: { ...s.userEntries[entryId], timeline: existing.filter((e) => e.date !== date) },
          },
        };
      }),

      addImage: (entryId, image) => set((s) => {
        const existing = s.userEntries[entryId]?.images ?? [];
        return {
          userEntries: {
            ...s.userEntries,
            [entryId]: { ...s.userEntries[entryId], images: [...existing, image] },
          },
        };
      }),
      removeImage: (entryId, imageId) => set((s) => {
        const existing = s.userEntries[entryId]?.images ?? [];
        return {
          userEntries: {
            ...s.userEntries,
            [entryId]: { ...s.userEntries[entryId], images: existing.filter((i) => i.id !== imageId) },
          },
        };
      }),
    }),
    {
      name: 'afknow-knowledge-storage',
      partialize: (s) => ({
        userEntries: s.userEntries,
        customEntries: s.customEntries,
        notes: s.notes,
        savedScenarios: s.savedScenarios,
      }),
    }
  )
);
