import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Actor, EventCategory, OsintEvent } from '../data/osintData';

// ── Custom Unit types ──
export type UnitType =
  | 'csg'           // Carrier Strike Group
  | 'fighter-wing'  // Jagdgeschwader
  | 'missile-bat'   // Raketenbatterie
  | 'infantry-bde'  // Infanteriebrigade
  | 'sof'           // Special Operations Forces
  | 'proxy-force'   // Proxy-Kraft
  | 'naval-base'    // Marinebasis
  | 'air-base'      // Luftwaffenbasis
  | 'cyber-unit';   // Cyber-Einheit

export interface CustomUnit {
  id: string;
  unitType: UnitType;
  label: string;
  actor: Actor;
  lat: number;
  lng: number;
  notes: string;
  createdAt: string;
}

export const UNIT_TYPE_CONFIG: Record<UnitType, { name: string; nameDE: string; symbol: string; category: EventCategory }> = {
  'csg':          { name: 'Carrier Strike Group', nameDE: 'Trägerkampfgruppe', symbol: '⚓', category: 'naval' },
  'fighter-wing': { name: 'Fighter Wing', nameDE: 'Jagdgeschwader', symbol: '✈', category: 'air' },
  'missile-bat':  { name: 'Missile Battery', nameDE: 'Raketenbatterie', symbol: '🚀', category: 'missile' },
  'infantry-bde': { name: 'Infantry Brigade', nameDE: 'Infanteriebrigade', symbol: '🪖', category: 'troops' },
  'sof':          { name: 'Special Operations', nameDE: 'Spezialkräfte', symbol: '🎯', category: 'troops' },
  'proxy-force':  { name: 'Proxy Force', nameDE: 'Proxy-Kraft', symbol: '⚡', category: 'proxy' },
  'naval-base':   { name: 'Naval Base', nameDE: 'Marinebasis', symbol: '🏗', category: 'base' },
  'air-base':     { name: 'Air Base', nameDE: 'Luftwaffenbasis', symbol: '🛩', category: 'base' },
  'cyber-unit':   { name: 'Cyber Unit', nameDE: 'Cyber-Einheit', symbol: '💻', category: 'cyber' },
};

// ── Arrow types ──
export type ArrowType = 'attack' | 'movement' | 'supply' | 'retreat';

export interface WirkungsPfeil {
  id: string;
  arrowType: ArrowType;
  actor: Actor;
  label: string;
  points: [number, number][]; // lat/lng pairs
  createdAt: string;
}

export const ARROW_TYPE_CONFIG: Record<ArrowType, { name: string; nameDE: string; color: string; dashArray?: string }> = {
  attack:   { name: 'Attack', nameDE: 'Angriff', color: '#ef4444' },
  movement: { name: 'Movement', nameDE: 'Bewegung', color: '#3b82f6', dashArray: '10,6' },
  supply:   { name: 'Supply', nameDE: 'Versorgung', color: '#22c55e', dashArray: '4,8' },
  retreat:  { name: 'Retreat', nameDE: 'Rückzug', color: '#f97316', dashArray: '6,4' },
};

// ── Interaction modes ──
export type OsintMode = 'view' | 'place-unit' | 'draw-arrow';

interface OsintState {
  // Custom units on map
  customUnits: CustomUnit[];
  addUnit: (unit: CustomUnit) => void;
  updateUnit: (id: string, updates: Partial<CustomUnit>) => void;
  removeUnit: (id: string) => void;

  // Wirkungspfeile
  arrows: WirkungsPfeil[];
  addArrow: (arrow: WirkungsPfeil) => void;
  updateArrow: (id: string, updates: Partial<WirkungsPfeil>) => void;
  removeArrow: (id: string) => void;

  // Manual events added by user
  manualEvents: OsintEvent[];
  addManualEvent: (event: OsintEvent) => void;
  removeManualEvent: (id: string) => void;

  // Interaction mode
  mode: OsintMode;
  setMode: (mode: OsintMode) => void;

  // Pending placement config
  pendingUnitType: UnitType | null;
  pendingUnitActor: Actor;
  setPendingUnit: (type: UnitType | null, actor?: Actor) => void;

  // Pending arrow drawing
  pendingArrowType: ArrowType;
  pendingArrowActor: Actor;
  pendingArrowPoints: [number, number][];
  setPendingArrow: (type: ArrowType, actor?: Actor) => void;
  addPendingArrowPoint: (point: [number, number]) => void;
  clearPendingArrow: () => void;

  // Selected for editing
  selectedUnitId: string | null;
  setSelectedUnitId: (id: string | null) => void;
  selectedArrowId: string | null;
  setSelectedArrowId: (id: string | null) => void;
}

export const useOsintStore = create<OsintState>()(
  persist(
    (set) => ({
      customUnits: [],
      addUnit: (unit) => set((s) => ({ customUnits: [...s.customUnits, unit] })),
      updateUnit: (id, updates) =>
        set((s) => ({ customUnits: s.customUnits.map((u) => (u.id === id ? { ...u, ...updates } : u)) })),
      removeUnit: (id) => set((s) => ({ customUnits: s.customUnits.filter((u) => u.id !== id) })),

      arrows: [],
      addArrow: (arrow) => set((s) => ({ arrows: [...s.arrows, arrow] })),
      updateArrow: (id, updates) =>
        set((s) => ({ arrows: s.arrows.map((a) => (a.id === id ? { ...a, ...updates } : a)) })),
      removeArrow: (id) => set((s) => ({ arrows: s.arrows.filter((a) => a.id !== id) })),

      manualEvents: [],
      addManualEvent: (event) => set((s) => ({ manualEvents: [event, ...s.manualEvents] })),
      removeManualEvent: (id) => set((s) => ({ manualEvents: s.manualEvents.filter((e) => e.id !== id) })),

      mode: 'view',
      setMode: (mode) => set({ mode, pendingArrowPoints: [] }),

      pendingUnitType: null,
      pendingUnitActor: 'usa',
      setPendingUnit: (type, actor) =>
        set((s) => ({
          pendingUnitType: type,
          pendingUnitActor: actor ?? s.pendingUnitActor,
          mode: type ? 'place-unit' : 'view',
        })),

      pendingArrowType: 'attack',
      pendingArrowActor: 'usa',
      pendingArrowPoints: [],
      setPendingArrow: (type, actor) =>
        set((s) => ({
          pendingArrowType: type,
          pendingArrowActor: actor ?? s.pendingArrowActor,
          pendingArrowPoints: [],
          mode: 'draw-arrow',
        })),
      addPendingArrowPoint: (point) =>
        set((s) => ({ pendingArrowPoints: [...s.pendingArrowPoints, point] })),
      clearPendingArrow: () => set({ pendingArrowPoints: [], mode: 'view' }),

      selectedUnitId: null,
      setSelectedUnitId: (id) => set({ selectedUnitId: id }),
      selectedArrowId: null,
      setSelectedArrowId: (id) => set({ selectedArrowId: id }),
    }),
    {
      name: 'osint-lage-storage',
      partialize: (s) => ({
        customUnits: s.customUnits,
        arrows: s.arrows,
        manualEvents: s.manualEvents,
      }),
    }
  )
);
