import { useState, useCallback, useRef, useMemo } from 'react';
import type { EditorCountry, EditorElement, EditorSnapshot, EditorSubRegion, Fill } from './types';
import { solidFill } from './types';
import { REGION_COLORS } from './constants';

const MAX_HISTORY = 50;

export function useEditorState() {
  const [countries, setCountries] = useState<EditorCountry[]>([]);
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [subRegions, setSubRegions] = useState<EditorSubRegion[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<Set<string>>(new Set());
  const [selectedSubRegionId, setSelectedSubRegionId] = useState<string | null>(null);
  const [adminRegionsVisible, setAdminRegionsVisible] = useState<Set<string>>(new Set());

  // ─── Undo / Redo ───
  const history = useRef<EditorSnapshot[]>([]);
  const historyIdx = useRef(-1);

  const pushSnapshot = useCallback(() => {
    const snap: EditorSnapshot = {
      countries: structuredClone(countries),
      elements: structuredClone(elements),
      subRegions: structuredClone(subRegions),
    };
    const idx = historyIdx.current + 1;
    history.current = history.current.slice(0, idx);
    history.current.push(snap);
    if (history.current.length > MAX_HISTORY) history.current.shift();
    else historyIdx.current = history.current.length - 1;
  }, [countries, elements, subRegions]);

  const canUndo = historyIdx.current > 0;
  const canRedo = historyIdx.current < history.current.length - 1;

  const undo = useCallback(() => {
    if (historyIdx.current <= 0) return;
    historyIdx.current--;
    const snap = history.current[historyIdx.current];
    setCountries(snap.countries);
    setElements(snap.elements);
    setSubRegions(snap.subRegions ?? []);
  }, []);

  const redo = useCallback(() => {
    if (historyIdx.current >= history.current.length - 1) return;
    historyIdx.current++;
    const snap = history.current[historyIdx.current];
    setCountries(snap.countries);
    setElements(snap.elements);
    setSubRegions(snap.subRegions ?? []);
  }, []);

  // ─── Country Ops ───
  const countryIds = useMemo(() => new Set(countries.map((c) => c.id)), [countries]);

  const addCountries = useCallback((ids: string[], regionMap: Record<string, string>) => {
    pushSnapshot();
    const toAdd: EditorCountry[] = [];
    for (const id of ids) {
      if (countryIds.has(id)) continue;
      const region = regionMap[id] || '';
      toAdd.push({
        id,
        fill: solidFill(REGION_COLORS[region] || '#4A6FA5'),
        strokeColor: 'rgba(255,255,255,0.25)',
        strokeWidth: 0.7,
        strokeDasharray: '',
        labelVisible: true,
        zIndex: 0,
      });
    }
    if (toAdd.length > 0) setCountries((prev) => [...prev, ...toAdd]);
  }, [pushSnapshot, countryIds]);

  const addAllCountries = useCallback((allIds: string[], regionMap: Record<string, string>) => {
    pushSnapshot();
    const toAdd: EditorCountry[] = [];
    for (const id of allIds) {
      if (countryIds.has(id)) continue;
      const region = regionMap[id] || '';
      toAdd.push({
        id,
        fill: solidFill(REGION_COLORS[region] || '#4A6FA5'),
        strokeColor: 'rgba(255,255,255,0.25)',
        strokeWidth: 0.7,
        strokeDasharray: '',
        labelVisible: true,
        zIndex: 0,
      });
    }
    if (toAdd.length > 0) setCountries((prev) => [...prev, ...toAdd]);
  }, [pushSnapshot, countryIds]);

  const removeAllCountries = useCallback(() => {
    pushSnapshot();
    setCountries([]);
  }, [pushSnapshot]);

  const updateCountry = useCallback((id: string, updates: Partial<EditorCountry>) => {
    pushSnapshot();
    setCountries((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, [pushSnapshot]);

  const updateCountryFill = useCallback((id: string, fill: Fill) => {
    pushSnapshot();
    setCountries((prev) => prev.map((c) => (c.id === id ? { ...c, fill } : c)));
  }, [pushSnapshot]);

  const removeCountry = useCallback((id: string) => {
    pushSnapshot();
    setCountries((prev) => prev.filter((c) => c.id !== id));
  }, [pushSnapshot]);

  // ─── Element Ops ───
  const addElement = useCallback((el: EditorElement) => {
    pushSnapshot();
    setElements((prev) => [...prev, el]);
  }, [pushSnapshot]);

  const updateElement = useCallback((id: string, updates: Partial<EditorElement>) => {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const updateElementWithSnapshot = useCallback((id: string, updates: Partial<EditorElement>) => {
    pushSnapshot();
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }, [pushSnapshot]);

  const removeElement = useCallback((id: string) => {
    pushSnapshot();
    setElements((prev) => prev.filter((e) => e.id !== id));
    setSelectedElementIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }, [pushSnapshot]);

  const removeSelected = useCallback(() => {
    if (selectedElementIds.size === 0 && !selectedCountryId) return;
    pushSnapshot();
    if (selectedElementIds.size > 0) {
      setElements((prev) => prev.filter((e) => !selectedElementIds.has(e.id)));
      setSelectedElementIds(new Set());
    }
    if (selectedCountryId) {
      setCountries((prev) => prev.filter((c) => c.id !== selectedCountryId));
      setSelectedCountryId(null);
    }
  }, [pushSnapshot, selectedElementIds, selectedCountryId]);

  const duplicateSelected = useCallback(() => {
    if (selectedElementIds.size === 0) return;
    pushSnapshot();
    const copies: EditorElement[] = [];
    for (const el of elements) {
      if (!selectedElementIds.has(el.id)) continue;
      copies.push({
        ...structuredClone(el),
        id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: el.x + 15,
        y: el.y + 15,
      });
    }
    setElements((prev) => [...prev, ...copies]);
    setSelectedElementIds(new Set(copies.map((c) => c.id)));
  }, [pushSnapshot, selectedElementIds, elements]);

  // ─── Z-Order ───
  const bringForward = useCallback((id: string) => {
    pushSnapshot();
    setElements((prev) => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex((e) => e.id === id);
      if (idx < sorted.length - 1) {
        const z = sorted[idx + 1].zIndex;
        sorted[idx + 1].zIndex = sorted[idx].zIndex;
        sorted[idx].zIndex = z;
      }
      return sorted;
    });
  }, [pushSnapshot]);

  const sendBackward = useCallback((id: string) => {
    pushSnapshot();
    setElements((prev) => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex((e) => e.id === id);
      if (idx > 0) {
        const z = sorted[idx - 1].zIndex;
        sorted[idx - 1].zIndex = sorted[idx].zIndex;
        sorted[idx].zIndex = z;
      }
      return sorted;
    });
  }, [pushSnapshot]);

  // ─── Selection ───
  const selectElement = useCallback((id: string, additive = false) => {
    setSelectedCountryId(null);
    if (additive) {
      setSelectedElementIds((prev) => {
        const n = new Set(prev);
        if (n.has(id)) n.delete(id); else n.add(id);
        return n;
      });
    } else {
      setSelectedElementIds(new Set([id]));
    }
  }, []);

  const selectCountry = useCallback((id: string) => {
    setSelectedElementIds(new Set());
    setSelectedCountryId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElementIds(new Set());
    setSelectedCountryId(null);
    setSelectedSubRegionId(null);
  }, []);

  // ─── Sub-Region Ops ───
  const addSubRegion = useCallback((sr: EditorSubRegion) => {
    pushSnapshot();
    setSubRegions((prev) => [...prev, sr]);
  }, [pushSnapshot]);

  const updateSubRegion = useCallback((id: string, updates: Partial<EditorSubRegion>) => {
    pushSnapshot();
    setSubRegions((prev) => prev.map((sr) => (sr.id === id ? { ...sr, ...updates } : sr)));
  }, [pushSnapshot]);

  const removeSubRegion = useCallback((id: string) => {
    pushSnapshot();
    setSubRegions((prev) => prev.filter((sr) => sr.id !== id));
    if (selectedSubRegionId === id) setSelectedSubRegionId(null);
  }, [pushSnapshot, selectedSubRegionId]);

  const selectSubRegion = useCallback((id: string) => {
    setSelectedElementIds(new Set());
    setSelectedCountryId(null);
    setSelectedSubRegionId(id);
  }, []);

  return {
    countries, elements, countryIds, subRegions,
    selectedCountryId, selectedElementIds, selectedSubRegionId,
    setCountries, setElements,
    addCountries, addAllCountries, removeAllCountries,
    updateCountry, updateCountryFill, removeCountry,
    addElement, updateElement, updateElementWithSnapshot, removeElement,
    removeSelected, duplicateSelected,
    bringForward, sendBackward,
    selectElement, selectCountry, clearSelection,
    addSubRegion, updateSubRegion, removeSubRegion, selectSubRegion,
    adminRegionsVisible, toggleAdminRegions: useCallback((countryId: string) => {
      setAdminRegionsVisible(prev => {
        const next = new Set(prev);
        if (next.has(countryId)) next.delete(countryId); else next.add(countryId);
        return next;
      });
    }, []),
    pushSnapshot, undo, redo, canUndo, canRedo,
  };
}

export type EditorState = ReturnType<typeof useEditorState>;
