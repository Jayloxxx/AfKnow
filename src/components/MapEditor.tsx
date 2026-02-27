import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Save, Download, ChevronLeft, ChevronRight, Undo2, Redo2, HelpCircle, Plus, X, Check, AlertTriangle, Crosshair, Layers, ChevronDown, Upload, FileJson, CloudSun, Navigation, Share2, HardDrive, Maximize, Search, Magnet } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRegion } from '../context/RegionContext';
import { useEditorState } from './editor/useEditorState';
import { useCanvasTransform } from './editor/useCanvasTransform';
import { useKeyboardShortcuts } from './editor/useKeyboardShortcuts';
import CountrySelectorPanel from './editor/CountrySelectorPanel';
import EditorCanvas from './editor/EditorCanvas';
import CanvasErrorBoundary from './editor/CanvasErrorBoundary';
import ToolPalette from './editor/ToolPalette';
import PropertiesPanel from './editor/PropertiesPanel';
import LayerPanel from './editor/LayerPanel';
import ISWPanel from './editor/ISWPanel';
import TimelineSlider from './editor/TimelineSlider';
import OnboardingTutorial from './editor/OnboardingTutorial';
import GeoSearchBox from './editor/GeoSearchBox';
import GeoJSONDialog from './editor/GeoJSONDialog';
import TemplateGallery from './editor/TemplateGallery';
import WeatherPanel from './editor/WeatherPanel';
import RoutePanel from './editor/RoutePanel';
import OfflineBanner from './editor/OfflineBanner';
import PredownloadDialog from './editor/PredownloadDialog';
import ShareDialog from './editor/ShareDialog';
import { useRealtimeCollab } from '../hooks/useRealtimeCollab';
import type { RouteResult } from '../lib/routePlanner';
import type { MapTemplate } from './editor/templates';
import type { ToolType, EditorElement, LegendEntry, Faction, Echelon, ConfidenceLevel, TimelinePhase, LayerGroup } from './editor/types';
import { defaultElement } from './editor/types';
import { GRID_OVERLAYS, TOOLS } from './editor/constants';
import { exportToPdf } from '../lib/pdfExport';

export type MapStyle =
  | 'standard' | 'political' | 'military' | 'terrain' | 'satellite' | 'minimal'
  | 'osm' | 'topo' | 'satellite-live' | 'leaflet'
  | 'stadia-dark' | 'stadia-light' | 'stadia-terrain'
  | 'carto-dark' | 'carto-voyager' | 'carto-positron'
  | 'esri-topo' | 'esri-street' | 'esri-ocean'
  | 'hot' | 'sentinel';

type StyleCategory = 'builtin' | 'dark' | 'light' | 'satellite' | 'terrain' | 'specialty';

const STYLE_CATEGORY_LABELS: Record<StyleCategory, string> = {
  builtin: 'Eingebaut',
  dark: 'Dunkel',
  light: 'Hell',
  satellite: 'Satellit',
  terrain: 'Gelände',
  specialty: 'Spezial',
};

export const MAP_STYLES: { id: MapStyle; label: string; category: StyleCategory }[] = [
  // Built-in (SVG-only)
  { id: 'standard',   label: 'Standard',          category: 'builtin' },
  { id: 'political',  label: 'Politisch',         category: 'builtin' },
  { id: 'military',   label: 'Militärisch',       category: 'builtin' },
  { id: 'minimal',    label: 'Minimal',           category: 'builtin' },
  // Dark tile maps
  { id: 'carto-dark',   label: 'CartoDB Dark',    category: 'dark' },
  { id: 'stadia-dark',  label: 'Stadia Dark',     category: 'dark' },
  // Light tile maps
  { id: 'osm',            label: 'OpenStreetMap',   category: 'light' },
  { id: 'carto-positron', label: 'CartoDB Positron', category: 'light' },
  { id: 'carto-voyager',  label: 'CartoDB Voyager',  category: 'light' },
  { id: 'stadia-light',   label: 'Stadia Light',     category: 'light' },
  { id: 'esri-street',    label: 'ESRI Street',      category: 'light' },
  // Satellite
  { id: 'satellite',      label: 'Satellit (SVG)',   category: 'satellite' },
  { id: 'satellite-live', label: 'ESRI Satellit',    category: 'satellite' },
  { id: 'sentinel',       label: 'Sentinel-2 (ESA)', category: 'satellite' },
  // Terrain
  { id: 'terrain',         label: 'Gebirge (SVG)',   category: 'terrain' },
  { id: 'topo',            label: 'OpenTopoMap',     category: 'terrain' },
  { id: 'stadia-terrain',  label: 'Stadia Terrain',  category: 'terrain' },
  { id: 'esri-topo',       label: 'ESRI Topo',       category: 'terrain' },
  // Specialty
  { id: 'esri-ocean', label: 'ESRI Ozean',            category: 'specialty' },
  { id: 'hot',        label: 'Humanitär (HOT)',       category: 'specialty' },
  { id: 'leaflet',    label: 'Leaflet (interaktiv)',   category: 'specialty' },
];

export default function MapEditor() {
  const { addSavedMap, user, clipboardImage, clipboardImageBounds, setClipboardImage, userTemplates, addUserTemplate: _addUserTemplate, removeUserTemplate } = useStore();
  const region = useRegion();
  const state = useEditorState();
  const transform = useCanvasTransform();

  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeColor, setActiveColor] = useState(region.accentHex);
  const [fontSize, setFontSize] = useState(18);
  const [textInput, setTextInput] = useState('');
  const [mapName, setMapName] = useState('Neue Karte');
  const [showOcean, setShowOcean] = useState(true);
  const [showCompass, setShowCompass] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [legendTitle, setLegendTitle] = useState('Legende');
  const [legendEntries, setLegendEntries] = useState<LegendEntry[]>([]);
  const [showTitle, setShowTitle] = useState(false);
  const [mapTitle, setMapTitle] = useState('');
  const [titleColor, setTitleColor] = useState(region.accentHex);
  const [selectorOpen, setSelectorOpen] = useState(true);
  const [transparentBg, setTransparentBg] = useState(false);
  const [militarySymbol, setMilitarySymbol] = useState('infantry');
  const [gridOverlay, setGridOverlay] = useState('none');
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'pdf'>('png');
  const [exportScale, setExportScale] = useState(3);
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  // ─── New Feature States ───
  const [activeFaction, setActiveFaction] = useState<Faction>('friendly');
  const [activeEchelon, setActiveEchelon] = useState<Echelon>('company');
  const [activeConfidence, setActiveConfidence] = useState<ConfidenceLevel>('confirmed');
  const [activeWeaponRange, setActiveWeaponRange] = useState('s300');
  const [showLayerPanel] = useState(true);
  const [layerGroups, setLayerGroups] = useState<LayerGroup[]>([]);
  const [timelinePhases, setTimelinePhases] = useState<TimelinePhase[]>([]);
  const [activePhaseId, setActivePhaseId] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem('afknow-onboarding-done'); } catch { return true; }
  });
  // Map layer toggles
  const [showRivers, setShowRivers] = useState(false);
  const [showCapitals, setShowCapitals] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showAirports, setShowAirports] = useState(false);
  const [showPorts, setShowPorts] = useState(true);
  // Lage Panel
  const [showISWPanel, setShowISWPanel] = useState(false);
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);
  // GeoJSON dialog
  const [showGeoJSONDialog, setShowGeoJSONDialog] = useState<'import' | 'export' | null>(null);
  // PDF export options
  const [pdfPageSize, setPdfPageSize] = useState<'a4' | 'a3'>('a4');
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [pdfClassification, setPdfClassification] = useState('');
  const [coordFormat, setCoordFormat] = useState<import('../lib/geoMeasure').CoordFormat>('dd');
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  // Weather overlay
  const [weatherLayers, setWeatherLayers] = useState<string[]>([]);
  const [weatherOpacity, setWeatherOpacity] = useState(0.5);
  const [showWeatherPanel, setShowWeatherPanel] = useState(false);
  // Route planning
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [routeWaypoints, setRouteWaypoints] = useState<[number, number][]>([]);
  // Offline
  const [showPredownload, setShowPredownload] = useState(false);
  // Collab
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [collabEnabled, setCollabEnabled] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const commandInputRef = useRef<HTMLInputElement | null>(null);
  const collab = useRealtimeCollab({
    mapId: mapName || null,
    userId: user?.id || 'anon',
    userName: user?.email?.split('@')[0] || 'Anonym',
    enabled: collabEnabled,
  });
  // Save confirmation & success toast
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    if (!showSaveSuccess) return;
    const t = setTimeout(() => setShowSaveSuccess(false), 2500);
    return () => clearTimeout(t);
  }, [showSaveSuccess]);

  // ─── Auto-import clipboard image from Explorer clip tool ───
  useEffect(() => {
    if (!clipboardImage) return;
    const bounds = clipboardImageBounds ?? { x: 200, y: 200, w: 400, h: 400 };
    const imgEl: import('./editor/types').EditorElement = {
      id: `el-img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'image',
      x: bounds.x + bounds.w / 2,
      y: bounds.y + bounds.h / 2,
      width: bounds.w,
      height: bounds.h,
      rotation: 0,
      fill: { type: 'solid', color: '#fff', opacity: 1 },
      strokeColor: 'transparent',
      strokeWidth: 0,
      strokeDasharray: '',
      content: 'Kartenausschnitt',
      fontSize: 12,
      fontFamily: 'var(--font-display)',
      fontWeight: '500',
      textAlign: 'center',
      points: [],
      arrowStart: 'none',
      arrowEnd: 'none',
      militarySymbol: '',
      zonePreset: 'neutral',
      faction: 'friendly',
      echelon: 'company',
      confidence: 'confirmed',
      timelinePhase: '',
      weaponRangeId: '',
      imageDataUrl: clipboardImage,
      zIndex: -1, // behind other elements
      locked: false,
      visible: true,
      groupId: '',
    };
    state.addElement(imgEl);
    setClipboardImage(null);
  }, [clipboardImage]); // eslint-disable-line react-hooks/exhaustive-deps

  useKeyboardShortcuts({
    state,
    transform,
    activeTool,
    setActiveTool,
    onSave: () => setShowSaveConfirm(true),
    onExport: () => { setExportFormat('png'); setShowExportPreview(true); },
    onOpenCommandPalette: () => setShowCommandPalette(true),
    onToggleHelp: () => setShowHelp((v) => !v),
    onToggleSnap: () => setSnapToGrid((v) => !v),
  });

  const activeToolDef = useMemo(() => TOOLS.find((t) => t.id === activeTool), [activeTool]);
  const selectionSummary = useMemo(() => {
    if (state.selectedSubRegionId) return 'Sub-Region ausgewählt';
    if (state.selectedCountryId) return 'Land ausgewählt';
    if (state.selectedElementIds.size > 1) return `${state.selectedElementIds.size} Elemente ausgewählt`;
    if (state.selectedElementIds.size === 1) return '1 Element ausgewählt';
    return 'Keine Auswahl';
  }, [state.selectedSubRegionId, state.selectedCountryId, state.selectedElementIds]);

  const fitCanvasToContent = useCallback(() => {
    const svg = transform.svgRef.current;
    if (!svg) return;
    const contentGroup = svg.querySelector('[data-content-group]') as SVGGraphicsElement;
    if (contentGroup) {
      try {
        const box = contentGroup.getBBox();
        if (box.width > 0 && box.height > 0) {
          transform.fitToContent({ minX: box.x, minY: box.y, maxX: box.x + box.width, maxY: box.y + box.height });
          return;
        }
      } catch {
        // Fallback below.
      }
    }
    transform.resetView();
  }, [transform]);

  type CommandAction = {
    id: string;
    label: string;
    section: string;
    shortcut?: string;
    keywords: string[];
    run: () => void;
  };

  const commandActions = useMemo<CommandAction[]>(() => {
    const base: CommandAction[] = [
      { id: 'save', label: 'Karte speichern', section: 'Aktionen', shortcut: 'Ctrl+S', keywords: ['save', 'karte', 'speichern'], run: () => setShowSaveConfirm(true) },
      { id: 'export', label: 'Export öffnen', section: 'Aktionen', shortcut: 'Ctrl+E', keywords: ['export', 'png', 'svg', 'pdf'], run: () => { setExportFormat('png'); setShowExportPreview(true); } },
      { id: 'fit', label: 'Inhalt einpassen', section: 'Ansicht', shortcut: 'F', keywords: ['zoom', 'fit', 'einpassen'], run: fitCanvasToContent },
      { id: 'toggle-snap', label: snapToGrid ? 'Raster-Snapping deaktivieren' : 'Raster-Snapping aktivieren', section: 'Ansicht', shortcut: 'Shift+S', keywords: ['snap', 'grid', 'raster'], run: () => setSnapToGrid(v => !v) },
      { id: 'undo', label: 'Rückgängig', section: 'Bearbeiten', shortcut: 'Ctrl+Z', keywords: ['undo', 'zurueck', 'rückgängig'], run: state.undo },
      { id: 'redo', label: 'Wiederholen', section: 'Bearbeiten', shortcut: 'Ctrl+Y', keywords: ['redo', 'wiederholen'], run: state.redo },
      { id: 'toggle-help', label: showHelp ? 'Hilfe schließen' : 'Hilfe öffnen', section: 'Panels', shortcut: '?', keywords: ['hilfe', 'shortcuts'], run: () => setShowHelp(v => !v) },
      { id: 'toggle-route', label: showRoutePanel ? 'Routenplaner schließen' : 'Routenplaner öffnen', section: 'Panels', keywords: ['route', 'navigation'], run: () => setShowRoutePanel(v => !v) },
      { id: 'toggle-weather', label: showWeatherPanel ? 'Wetterpanel schließen' : 'Wetterpanel öffnen', section: 'Panels', keywords: ['wetter', 'weather', 'overlay'], run: () => setShowWeatherPanel(v => !v) },
      { id: 'toggle-isw', label: showISWPanel ? 'Lage-Panel schließen' : 'Lage-Panel öffnen', section: 'Panels', keywords: ['lage', 'isw', 'panel'], run: () => setShowISWPanel(v => !v) },
      { id: 'toggle-layers', label: showLayerDropdown ? 'Layer-Menü schließen' : 'Layer-Menü öffnen', section: 'Panels', keywords: ['layer', 'ebenen'], run: () => setShowLayerDropdown(v => !v) },
      { id: 'templates', label: 'Vorlagen öffnen', section: 'Inhalte', keywords: ['template', 'vorlage'], run: () => setShowTemplateGallery(true) },
      { id: 'share', label: 'Freigabe öffnen', section: 'Inhalte', keywords: ['share', 'teilen', 'collab'], run: () => { setCollabEnabled(true); setShowShareDialog(true); } },
    ];
    const toolCmds = TOOLS.map((tool) => ({
      id: `tool-${tool.id}`,
      label: `Werkzeug: ${tool.label}`,
      section: 'Werkzeuge',
      shortcut: tool.key.toUpperCase(),
      keywords: [tool.label.toLowerCase(), 'werkzeug', tool.id],
      run: () => setActiveTool(tool.id),
    }));
    return [...base, ...toolCmds];
  }, [fitCanvasToContent, snapToGrid, showHelp, showRoutePanel, showWeatherPanel, showISWPanel, showLayerDropdown, state.undo, state.redo, setActiveTool]);

  const filteredCommandActions = useMemo(() => {
    const q = commandQuery.trim().toLowerCase();
    if (!q) return commandActions;
    return commandActions.filter((action) => (
      action.label.toLowerCase().includes(q) ||
      action.section.toLowerCase().includes(q) ||
      action.keywords.some((k) => k.includes(q))
    ));
  }, [commandActions, commandQuery]);

  useEffect(() => {
    if (!showCommandPalette) return;
    setCommandQuery('');
    const t = setTimeout(() => commandInputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [showCommandPalette]);

  // ─── Legend Management ───
  const addLegendEntry = useCallback(() => {
    setLegendEntries(prev => [...prev, {
      id: `leg-${Date.now()}`,
      label: 'Neuer Eintrag',
      color: region.accentHex,
      symbol: 'rect',
    }]);
  }, []);

  const updateLegendEntry = useCallback((id: string, updates: Partial<LegendEntry>) => {
    setLegendEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const removeLegendEntry = useCallback((id: string) => {
    setLegendEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  // ─── Load Template ───
  const loadTemplate = useCallback((tpl: MapTemplate) => {
    const s = tpl.settings;
    // Apply map settings
    setMapStyle(s.mapStyle as MapStyle);
    setShowOcean(s.showOcean);
    setShowCompass(s.showCompass);
    setShowRivers(s.showRivers);
    setShowCapitals(s.showCapitals);
    setShowLabels(s.showLabels);
    setShowAirports(s.showAirports);
    setShowPorts(s.showPorts);
    setShowLegend(s.showLegend);
    setLegendTitle(s.legendTitle);
    setLegendEntries(s.legendEntries);
    setTimelinePhases(s.timelinePhases);
    setGridOverlay(s.gridOverlay);
    if (s.coordFormat) setCoordFormat(s.coordFormat as import('../lib/geoMeasure').CoordFormat);
    // Apply snapshot (countries, elements)
    state.setCountries(tpl.snapshot.countries);
    state.setElements(tpl.snapshot.elements);
    setShowTemplateGallery(false);
  }, [state]);

  // ─── Export ───
  const handleExport = useCallback((format: 'png' | 'svg', scale = 3) => {
    const svg = transform.svgRef.current;
    if (!svg) return;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('viewBox', '0 0 1000 1100');

    if (transparentBg) {
      clone.querySelectorAll('[data-background]').forEach((el) => el.remove());
    }

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(clone);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const fileName = mapName.replace(/\s+/g, '_');

    if (format === 'svg') {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000 * scale;
      canvas.height = 1100 * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (!transparentBg) {
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--ed-bg').trim() || '#0d1117';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => {
        if (!b) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = `${fileName}.png`;
        a.click();
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [transform.svgRef, transparentBg, mapName]);

  // ─── Save (with PNG thumbnail) ───
  const doSave = useCallback(() => {
    const svg = transform.svgRef.current;

    const countryEls = state.countries.map((cc) => ({
      id: `country-${cc.id}`, type: 'country' as const, x: 0, y: 0,
      countryId: cc.id,
      color: cc.fill.type === 'solid' ? cc.fill.color : '#888',
      content: region.countries.find((c) => c.id === cc.id)?.name || cc.id,
      style: { fillType: cc.fill.type, fillData: JSON.stringify(cc.fill), strokeColor: cc.strokeColor, strokeWidth: String(cc.strokeWidth), strokeDash: cc.strokeDasharray },
    }));
    const elementEls = state.elements.map((el) => ({
      id: el.id, type: el.type as string as 'marker' | 'text' | 'shape' | 'line',
      x: el.x, y: el.y, width: el.width, height: el.height, rotation: el.rotation,
      color: el.strokeColor, content: el.content, fontSize: el.fontSize,
      style: { elementData: JSON.stringify(el) },
    }));

    const saveMap = (thumbnail: string) => {
      addSavedMap({
        id: Date.now().toString(), name: mapName, elements: [...countryEls, ...elementEls],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: user?.id,
        thumbnail,
      });
      setShowSaveConfirm(false);
      setShowSaveSuccess(true);
    };

    // Generate PNG thumbnail from SVG
    if (svg) {
      try {
        const clone = svg.cloneNode(true) as SVGSVGElement;
        clone.setAttribute('viewBox', '0 0 1000 1100');
        clone.setAttribute('width', '400');
        clone.setAttribute('height', '440');
        clone.removeAttribute('style');
        const svgStr = new XMLSerializer().serializeToString(clone);
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 440;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#1a1a2e';
          ctx.fillRect(0, 0, 400, 440);
          ctx.drawImage(img, 0, 0, 400, 440);
          URL.revokeObjectURL(url);
          saveMap(canvas.toDataURL('image/png', 0.85));
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          // Fallback: save SVG as data URI
          saveMap(`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`);
        };
        img.src = url;
      } catch {
        saveMap('');
      }
    } else {
      saveMap('');
    }
  }, [state, mapName, addSavedMap, user, transform.svgRef]);

  return (
    <div style={{ display: 'flex', flex: '1 1 0%', height: '100%', minWidth: 0, overflow: 'hidden', position: 'relative' }}>
      {/* ═══ Left: Country Selector ═══ */}
      {selectorOpen && <CountrySelectorPanel state={state} mapStyle={mapStyle} />}

      {/* ═══ Collapse Toggle ═══ */}
      <button onClick={() => setSelectorOpen(!selectorOpen)}
        style={{
          width: 18, flexShrink: 0, background: 'var(--ed-collapse-bg)', border: 'none',
          borderRight: '1px solid var(--ed-border)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ed-icon-dim)',
        }}>
        {selectorOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* ═══ Center: Canvas + Toolbars ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 0%', minWidth: 0, minHeight: 0, background: 'var(--ed-bg)' }}>
        {/* Top Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '5px 10px', borderBottom: '1px solid var(--ed-border)',
          background: 'var(--ed-toolbar)', flexShrink: 0, gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', flex: 1, minWidth: 0 }}>
            <input value={mapName} onChange={(e) => setMapName(e.target.value)}
              style={{ background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)', borderRadius: 6, padding: '4px 10px', color: 'var(--ed-text)', fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 500, outline: 'none', width: 120, flexShrink: 0 }} />
            <button onClick={state.undo} disabled={!state.canUndo} title="Rückgängig (Ctrl+Z)"
              style={{ ...iconBtnStyle, opacity: state.canUndo ? 1 : 0.25 }}><Undo2 size={14} /></button>
            <button onClick={state.redo} disabled={!state.canRedo} title="Wiederholen (Ctrl+Y)"
              style={{ ...iconBtnStyle, opacity: state.canRedo ? 1 : 0.25 }}><Redo2 size={14} /></button>
            <button onClick={fitCanvasToContent} title="Einpassen (Inhalt optimal einrahmen)"
              style={{ ...iconBtnStyle }}><Maximize size={14} /></button>
            <button
              onClick={() => setShowCommandPalette(true)}
              title="Schnellbefehle (Ctrl/Cmd+K)"
              style={{
                ...iconBtnStyle, width: 'auto', padding: '4px 9px', gap: 5,
                color: showCommandPalette ? 'var(--accent-hex)' : 'var(--ed-icon)',
                background: showCommandPalette ? 'var(--ed-active)' : 'var(--ed-btn)',
              }}>
              <Search size={12} />
              <span style={{ fontSize: 10 }}>Befehle</span>
              <span style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)' }}>Ctrl+K</span>
            </button>
            <div style={{ width: 1, height: 18, background: 'var(--ed-border-strong)', flexShrink: 0 }} />
            {/* Map style */}
            <select value={mapStyle} onChange={(e) => setMapStyle(e.target.value as MapStyle)} title="Kartenstil"
              style={{ background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)', borderRadius: 4, padding: '2px 6px', color: 'var(--ed-text-muted)', fontSize: 10, outline: 'none', cursor: 'pointer', flexShrink: 0 }}>
              {(Object.keys(STYLE_CATEGORY_LABELS) as StyleCategory[]).map(cat => {
                const group = MAP_STYLES.filter(s => s.category === cat);
                if (group.length === 0) return null;
                return (
                  <optgroup key={cat} label={STYLE_CATEGORY_LABELS[cat]}>
                    {group.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </optgroup>
                );
              })}
            </select>
            <select value={gridOverlay} onChange={(e) => setGridOverlay(e.target.value)} title="Raster-Overlay"
              style={{ background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)', borderRadius: 4, padding: '2px 6px', color: 'var(--ed-text-muted)', fontSize: 10, outline: 'none', cursor: 'pointer', flexShrink: 0 }}>
              {GRID_OVERLAYS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
            <select value={coordFormat} onChange={(e) => setCoordFormat(e.target.value as import('../lib/geoMeasure').CoordFormat)} title="Koordinatenformat"
              style={{ background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)', borderRadius: 4, padding: '2px 6px', color: 'var(--ed-text-muted)', fontSize: 10, outline: 'none', cursor: 'pointer', flexShrink: 0 }}>
              <option value="dd">DD</option>
              <option value="dms">DMS</option>
              <option value="utm">UTM</option>
              <option value="mgrs">MGRS</option>
            </select>
            <button onClick={() => setSnapToGrid(v => !v)}
              style={{
                ...iconBtnStyle, width: 'auto', padding: '4px 8px', gap: 4, fontSize: 10,
                background: snapToGrid ? 'var(--ed-active)' : 'var(--ed-btn)',
                color: snapToGrid ? 'var(--accent-hex)' : 'var(--ed-icon)',
              }}
              title={snapToGrid ? 'Raster-Snapping aktiv (Shift+S)' : 'Raster-Snapping inaktiv (Shift+S)'}>
              <Magnet size={12} />
              <span style={{ fontSize: 9 }}>Snap</span>
            </button>
            <div style={{ width: 1, height: 18, background: 'var(--ed-border-strong)', flexShrink: 0 }} />
            {/* Layer dropdown */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setShowLayerDropdown(!showLayerDropdown)}
                style={{
                  ...iconBtnStyle, width: 'auto', padding: '4px 8px', gap: 4, fontSize: 10,
                  background: showLayerDropdown ? 'var(--ed-active)' : 'var(--ed-btn)',
                  color: showLayerDropdown ? 'var(--accent-hex)' : 'var(--ed-icon)',
                }}
                title="Kartenebenen">
                <Layers size={12} />
                <span style={{ fontSize: 9 }}>Ebenen</span>
                <ChevronDown size={10} style={{ opacity: 0.5 }} />
              </button>
              {showLayerDropdown && (<>
                <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowLayerDropdown(false)} />
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50,
                  background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
                  borderRadius: 10, padding: '8px 4px', minWidth: 180,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  display: 'flex', flexDirection: 'column', gap: 1,
                }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--ed-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', fontFamily: 'var(--font-display)' }}>Darstellung</div>
                  <LayerToggle label="Ozean anzeigen" checked={showOcean} onChange={setShowOcean} />
                  <LayerToggle label="Nordpfeil / Kompass" checked={showCompass} onChange={setShowCompass} />
                  <LayerToggle label="Legende anzeigen" checked={showLegend} onChange={setShowLegend} />
                  <LayerToggle label="Titel-Leiste" checked={showTitle} onChange={setShowTitle} />
                  <LayerToggle label="Transparenter Hintergrund" checked={transparentBg} onChange={setTransparentBg} />
                  <div style={{ height: 1, background: 'var(--ed-border)', margin: '4px 8px' }} />
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--ed-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', fontFamily: 'var(--font-display)' }}>Kartendetails</div>
                  <LayerToggle label="Ländernamen" checked={showLabels} onChange={setShowLabels} />
                  <LayerToggle label="Flüsse" checked={showRivers} onChange={setShowRivers} />
                  <LayerToggle label="Hauptstädte" checked={showCapitals} onChange={setShowCapitals} />
                  <LayerToggle label="Häfen" checked={showPorts} onChange={setShowPorts} />
                  <LayerToggle label="Flughäfen" checked={showAirports} onChange={setShowAirports} />
                  <LayerToggle label="Admin-Regionen" checked={state.adminRegionsVisible.size > 0}
                    onChange={(v) => {
                      // Toggle admin regions for all added countries
                      state.countries.forEach(cc => {
                        const isVis = state.adminRegionsVisible.has(cc.id);
                        if (v && !isVis) state.toggleAdminRegions(cc.id);
                        if (!v && isVis) state.toggleAdminRegions(cc.id);
                      });
                    }} />
                  {state.elements.length > 0 && (<>
                    <div style={{ height: 1, background: 'var(--ed-border)', margin: '4px 8px' }} />
                    <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--ed-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', fontFamily: 'var(--font-display)' }}>Elemente ein/aus</div>
                    {(['frontline', 'zone', 'marker', 'military-unit', 'text', 'callout', 'arrow', 'curved-arrow', 'range-circle'] as const).map(typ => {
                      const els = state.elements.filter(e => e.type === typ);
                      if (els.length === 0) return null;
                      const allVisible = els.every(e => e.visible);
                      const label = typ === 'frontline' ? 'Frontlinien' : typ === 'zone' ? 'Zonen' : typ === 'marker' ? 'Marker' :
                        typ === 'military-unit' ? 'Einheiten' : typ === 'text' ? 'Texte' : typ === 'callout' ? 'Callouts' :
                        typ === 'arrow' ? 'Pfeile' : typ === 'curved-arrow' ? 'Kurvenpfeile' : 'Reichweiten';
                      return (
                        <LayerToggle key={typ} label={`${label} (${els.length})`} checked={allVisible}
                          onChange={(v) => els.forEach(e => state.updateElement(e.id, { visible: v }))} />
                      );
                    })}
                  </>)}
                </div>
              </>)}
            </div>
            {/* Weather overlay toggle */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setShowWeatherPanel(!showWeatherPanel)}
                style={{
                  ...iconBtnStyle, width: 'auto', padding: '4px 8px', gap: 4, fontSize: 10,
                  background: showWeatherPanel ? 'var(--ed-active)' : weatherLayers.length > 0 ? 'color-mix(in srgb, #3b82f6 15%, var(--ed-btn))' : 'var(--ed-btn)',
                  color: showWeatherPanel ? 'var(--accent-hex)' : weatherLayers.length > 0 ? '#3b82f6' : 'var(--ed-icon)',
                }}
                title="Wetter-Overlay">
                <CloudSun size={12} />
                <span style={{ fontSize: 9 }}>Wetter</span>
              </button>
              {showWeatherPanel && (<>
                <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowWeatherPanel(false)} />
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50,
                  background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
                  borderRadius: 10, minWidth: 200,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}>
                  <WeatherPanel
                    activeLayers={weatherLayers} setActiveLayers={setWeatherLayers}
                    opacity={weatherOpacity} setOpacity={setWeatherOpacity}
                  />
                </div>
              </>)}
            </div>
            {showLegend && (
              <input value={legendTitle} onChange={(e) => setLegendTitle(e.target.value)} placeholder="Legendentitel"
                style={{ background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)', borderRadius: 4, padding: '2px 8px', color: 'var(--ed-text)', fontSize: 10, outline: 'none', width: 80, flexShrink: 0 }} />
            )}
            {showTitle && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                <input value={mapTitle} onChange={(e) => setMapTitle(e.target.value)} placeholder="Kartentitel..."
                  style={{ background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)', borderRadius: 4, padding: '2px 8px', color: 'var(--ed-text)', fontSize: 10, outline: 'none', width: 140 }} />
                <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)}
                  style={{ width: 20, height: 20, cursor: 'pointer', border: 'none', padding: 0, borderRadius: 3 }} />
              </div>
            )}
            <span style={{
              fontSize: 9, color: 'var(--ed-text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
              border: '1px solid var(--ed-border)', borderRadius: 999, padding: '2px 8px', background: 'var(--ed-btn)',
              marginLeft: 'auto',
            }}>
              {activeToolDef?.label || 'Tool'}
            </span>
            <span style={{
              fontSize: 9, color: 'var(--ed-text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
              border: '1px solid var(--ed-border)', borderRadius: 999, padding: '2px 8px', background: 'var(--ed-btn)',
            }}>
              {selectionSummary}
            </span>
            <span style={{ fontSize: 8, color: 'var(--ed-text-dim)', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {state.countries.length}L · {state.elements.length}E
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button onClick={() => setShowISWPanel(!showISWPanel)}
              style={{
                ...iconBtnStyle,
                background: showISWPanel ? 'linear-gradient(135deg, rgba(220,38,38,0.2), rgba(37,99,235,0.2))' : 'var(--ed-btn)',
                color: showISWPanel ? '#DC2626' : 'var(--ed-icon)',
                border: showISWPanel ? '1px solid rgba(220,38,38,0.3)' : 'none',
                width: 'auto', padding: '4px 8px', gap: 4, fontSize: 10, fontWeight: 600,
                fontFamily: 'var(--font-display)',
              }}
              title="Lage-Werkzeuge">
              <Crosshair size={12} />
              <span style={{ fontSize: 9 }}>Lage</span>
            </button>
            <button onClick={() => setShowHelp(!showHelp)} style={{ ...iconBtnStyle, color: showHelp ? 'var(--accent-hex)' : 'var(--ed-icon)' }} title="Hilfe & Tastenkürzel"><HelpCircle size={14} /></button>
            <button onClick={() => setShowRoutePanel(!showRoutePanel)}
              style={{ ...iconBtnStyle, color: showRoutePanel ? 'var(--accent-hex)' : 'var(--ed-icon)', background: showRoutePanel ? 'var(--ed-active)' : 'var(--ed-btn)' }}
              title="Routenplanung"><Navigation size={12} /></button>
            <button onClick={() => setShowPredownload(true)} style={iconBtnStyle} title="Offline-Karten"><HardDrive size={12} /></button>
            <button onClick={() => { setCollabEnabled(true); setShowShareDialog(true); }}
              style={{ ...iconBtnStyle, color: collab.connected ? '#22c55e' : 'var(--ed-icon)' }}
              title="Teilen & Zusammenarbeit"><Share2 size={12} /></button>
            <button onClick={() => setShowGeoJSONDialog('import')} style={iconBtnStyle} title="GeoJSON importieren"><Upload size={12} /></button>
            <button onClick={() => setShowGeoJSONDialog('export')} style={iconBtnStyle} title="GeoJSON exportieren"><FileJson size={12} /></button>
            <button onClick={() => setShowTemplateGallery(true)} style={exportBtnStyle} title="Kartenvorlage laden"><Layers size={11} /> Vorlage</button>
            <button onClick={() => setShowSaveConfirm(true)} style={goldBtnStyle}><Save size={12} /> Speichern</button>
            <button onClick={() => { setExportFormat('png'); setShowExportPreview(true); }} style={exportBtnStyle}><Download size={11} /> Export</button>
          </div>
        </div>

        {/* Legend Editor Strip */}
        {showLegend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
            borderBottom: '1px solid var(--ed-border)', background: 'var(--ed-toolbar)',
            flexShrink: 0, overflowX: 'auto',
          }}>
            <span style={{ fontSize: 9, color: 'var(--ed-text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legende:</span>
            {legendEntries.map((entry) => (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--ed-input)', borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>
                <input type="color" value={entry.color} onChange={(e) => updateLegendEntry(entry.id, { color: e.target.value })}
                  style={{ width: 14, height: 14, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 2 }} />
                <input value={entry.label} onChange={(e) => updateLegendEntry(entry.id, { label: e.target.value })}
                  style={{ width: 80, background: 'transparent', border: 'none', color: 'var(--ed-text)', fontSize: 10, outline: 'none', padding: '1px 2px' }} />
                <select value={entry.symbol || 'rect'} onChange={(e) => updateLegendEntry(entry.id, { symbol: e.target.value as LegendEntry['symbol'] })}
                  style={{ background: 'transparent', border: 'none', color: 'var(--ed-text-muted)', fontSize: 9, cursor: 'pointer', outline: 'none' }}>
                  <option value="rect">Rechteck</option>
                  <option value="circle">Kreis</option>
                  <option value="line">Linie</option>
                  <option value="pattern">Muster</option>
                </select>
                <button onClick={() => removeLegendEntry(entry.id)} style={{ background: 'none', border: 'none', color: 'var(--ed-text-dim)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <X size={10} />
                </button>
              </div>
            ))}
            <button onClick={addLegendEntry}
              style={{ width: 22, height: 22, borderRadius: 4, border: '1px dashed var(--ed-border-strong)', background: 'transparent', color: 'var(--ed-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              title="Legende hinzufügen">
              <Plus size={11} />
            </button>
            {legendEntries.length === 0 && (
              <span style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontStyle: 'italic' }}>Klicke + um Einträge hinzuzufügen</span>
            )}
          </div>
        )}

        {/* Canvas with geo-search overlay */}
        <div style={{ position: 'relative', flex: '1 1 0%', minWidth: 0, minHeight: 0 }}>
          <GeoSearchBox
            transform={transform}
            geoToSvg={region.geoToSvg}
            onPlaceMarker={(x, y, label) => {
              const el: EditorElement = {
                id: `el-pin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                type: 'marker', x, y, width: 20, height: 20, rotation: 0,
                fill: { type: 'solid', color: activeColor, opacity: 1 },
                strokeColor: '#ffffff', strokeWidth: 1.5, strokeDasharray: '',
                content: label, fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: '600', textAlign: 'center',
                points: [], arrowStart: 'none', arrowEnd: 'none',
                militarySymbol: '', zonePreset: 'controlled', faction: 'neutral', echelon: 'team', confidence: 'confirmed',
                timelinePhase: '', weaponRangeId: '', imageDataUrl: '',
                zIndex: state.elements.length + 1, locked: false, visible: true, groupId: '',
              };
              state.pushSnapshot();
              state.addElement(el);
            }}
          />
          <CanvasErrorBoundary>
            <EditorCanvas
              state={state} transform={transform}
              activeTool={activeTool} setActiveTool={setActiveTool}
              activeColor={activeColor}
              showOcean={showOcean && !transparentBg}
              showCompass={showCompass} showLegend={showLegend} legendTitle={legendTitle}
              legendEntries={legendEntries}
              showTitle={showTitle} mapTitle={mapTitle} titleColor={titleColor}
              gridOverlay={gridOverlay}
              snapToGrid={snapToGrid}
              showRivers={showRivers}
              showCapitals={showCapitals}
              showLabels={showLabels}
              showAirports={showAirports}
              showPorts={showPorts}
              mapStyle={mapStyle}
              textInput={textInput} setTextInput={setTextInput} fontSize={fontSize}
              activeFaction={activeFaction}
              activeEchelon={activeEchelon}
              activeConfidence={activeConfidence}
              activeWeaponRange={activeWeaponRange}
              activePhaseId={activePhaseId}
              timelinePhases={timelinePhases}
              coordFormat={coordFormat}
              weatherLayers={weatherLayers}
              weatherOpacity={weatherOpacity}
              onRouteWaypointAdd={showRoutePanel ? (geo: [number, number]) => setRouteWaypoints(prev => [...prev, geo]) : undefined}
              collabUsers={collab.users}
            />
          </CanvasErrorBoundary>
        </div>

        {/* Timeline Slider */}
        <TimelineSlider
          phases={timelinePhases} setPhases={setTimelinePhases}
          activePhaseId={activePhaseId} setActivePhaseId={setActivePhaseId}
          svgRef={transform.svgRef}
        />

        {/* Bottom Tool Palette */}
        <ToolPalette
          activeTool={activeTool} setActiveTool={setActiveTool}
          activeColor={activeColor} setActiveColor={setActiveColor}
          textInput={textInput} setTextInput={setTextInput}
          fontSize={fontSize} setFontSize={setFontSize}
          militarySymbol={militarySymbol} setMilitarySymbol={setMilitarySymbol}
          activeFaction={activeFaction} setActiveFaction={setActiveFaction}
          activeEchelon={activeEchelon} setActiveEchelon={setActiveEchelon}
          activeConfidence={activeConfidence} setActiveConfidence={setActiveConfidence}
          activeWeaponRange={activeWeaponRange} setActiveWeaponRange={setActiveWeaponRange}
        />
      </div>

      {/* ═══ Right: Properties / Layer / ISW Panel ═══ */}
      {state.selectedCountryId || state.selectedElementIds.size > 0 ? (
        <PropertiesPanel state={state} timelinePhases={timelinePhases} />
      ) : showISWPanel ? (
        <ISWPanel
          state={state}
          activeTool={activeTool} setActiveTool={setActiveTool}
          activeColor={activeColor} setActiveColor={setActiveColor}
          showLegend={showLegend} setShowLegend={setShowLegend}
          legendEntries={legendEntries} setLegendEntries={setLegendEntries}
          setLegendTitle={setLegendTitle}
          activePhaseId={activePhaseId}
          onClose={() => setShowISWPanel(false)}
        />
      ) : (
        showLayerPanel && <LayerPanel state={state} layerGroups={layerGroups} setLayerGroups={setLayerGroups} />
      )}

      {/* ═══ Help Overlay ═══ */}
      {showHelp && (
        <div style={{
          position: 'absolute', top: 50, right: 270, width: 320, maxHeight: 'calc(100% - 80px)',
          background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
          borderRadius: 12, padding: 16, zIndex: 100, overflowY: 'auto',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ed-text)', fontFamily: 'var(--font-display)' }}>Bedienungshilfe</h3>
            <button onClick={() => setShowHelp(false)} style={{ background: 'none', border: 'none', color: 'var(--ed-text-muted)', cursor: 'pointer' }}><X size={14} /></button>
          </div>

          <HelpSection title="Navigation">
            <HelpRow keys="Mausrad" desc="Karte zoomen" />
            <HelpRow keys="Rechtsklick ziehen" desc="Karte bewegen" />
            <HelpRow keys="Mittlere Maus" desc="Karte bewegen" />
            <HelpRow keys="Leertaste halten" desc="Temporär Verschieben-Modus" />
            <HelpRow keys="Alt + Klick" desc="Karte bewegen" />
          </HelpSection>

          <HelpSection title="Werkzeuge">
            {TOOLS.map(t => (
              <HelpRow key={t.id} keys={t.key} desc={t.label} />
            ))}
          </HelpSection>

          <HelpSection title="Bearbeitung">
            <HelpRow keys="Ctrl+Z" desc="Rückgängig" />
            <HelpRow keys="Ctrl+Y" desc="Wiederholen" />
            <HelpRow keys="Ctrl+D" desc="Duplizieren" />
            <HelpRow keys="Ctrl+K" desc="Befehlspalette" />
            <HelpRow keys="Ctrl+S" desc="Karte speichern" />
            <HelpRow keys="Ctrl+E" desc="Export öffnen" />
            <HelpRow keys="Entf" desc="Element löschen" />
            <HelpRow keys="Escape" desc="Auswahl aufheben" />
            <HelpRow keys="?" desc="Hilfe ein/aus" />
            <HelpRow keys="Shift+S" desc="Snap ein/aus" />
            <HelpRow keys="Pfeiltasten" desc="Auswahl verschieben (Shift = 10px)" />
          </HelpSection>

          <HelpSection title="Zeichnen">
            <HelpRow keys="Klick + Ziehen" desc="Rechteck / Ellipse / Linie / Pfeil" />
            <HelpRow keys="Klick" desc="Punkte setzen (Polygon, Zone)" />
            <HelpRow keys="Doppelklick" desc="Form abschließen" />
            <HelpRow keys="Maus halten" desc="Freihand zeichnen" />
          </HelpSection>

          <div style={{ fontSize: 10, color: 'var(--ed-text-dim)', marginTop: 8, lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
            <strong style={{ color: 'var(--ed-text-muted)' }}>Tipp:</strong> Wähle ein Land auf der Karte aus, um es im rechten Panel umzufärben.
            Nutze Vollfarbe, Halbiert, Verlauf oder Muster für professionelle Darstellungen.
          </div>
        </div>
      )}

      {/* ═══ Save Confirmation Dialog ═══ */}
      {showCommandPalette && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.38)', zIndex: 320,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80,
          }}
          onClick={() => setShowCommandPalette(false)}
        >
          <div
            style={{
              width: 700, maxWidth: '92vw', maxHeight: '72vh', overflow: 'hidden',
              background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
              borderRadius: 14, boxShadow: '0 20px 70px rgba(0,0,0,0.45)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: 10, borderBottom: '1px solid var(--ed-border)' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ed-input)',
                border: '1px solid var(--ed-input-border)', borderRadius: 9, padding: '8px 10px',
              }}>
                <Search size={15} style={{ color: 'var(--ed-icon)' }} />
                <input
                  ref={commandInputRef}
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  placeholder="Befehl suchen: Werkzeug wechseln, speichern, exportieren..."
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setShowCommandPalette(false);
                    }
                    if (e.key === 'Enter' && filteredCommandActions[0]) {
                      e.preventDefault();
                      filteredCommandActions[0].run();
                      setShowCommandPalette(false);
                    }
                  }}
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--ed-text)', fontSize: 13, fontFamily: 'var(--font-body)',
                  }}
                />
                <span style={{ fontSize: 10, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)' }}>Esc</span>
              </div>
            </div>
            <div style={{ maxHeight: '58vh', overflowY: 'auto', padding: '6px 8px 10px' }}>
              {filteredCommandActions.length === 0 ? (
                <div style={{ padding: 14, fontSize: 12, color: 'var(--ed-text-dim)' }}>
                  Kein Treffer für "{commandQuery}".
                </div>
              ) : filteredCommandActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.run();
                    setShowCommandPalette(false);
                  }}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    background: index === 0 ? 'var(--ed-active)' : 'transparent',
                    borderRadius: 8, padding: '9px 10px', color: 'var(--ed-text)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{
                      fontSize: 9, color: 'var(--accent-hex)', fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
                    }}>
                      {action.section}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--ed-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {action.label}
                    </span>
                  </div>
                  {action.shortcut && (
                    <kbd style={{
                      fontSize: 10, color: 'var(--ed-text-muted)', background: 'var(--ed-btn)',
                      border: '1px solid var(--ed-border)', borderRadius: 4, padding: '2px 6px',
                      fontFamily: 'var(--font-mono)', flexShrink: 0,
                    }}>
                      {action.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSaveConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowSaveConfirm(false)}>
          <div style={{
            background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
            borderRadius: 14, padding: 24, width: 360, maxWidth: '90vw',
            boxShadow: '0 16px 50px rgba(0,0,0,0.35)', textAlign: 'center',
          }} onClick={(e) => e.stopPropagation()}>
            <AlertTriangle size={32} style={{ color: 'var(--accent-hex)', marginBottom: 12 }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ed-text)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
              Karte speichern?
            </h3>
            <p style={{ fontSize: 12, color: 'var(--ed-text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Die Karte <strong style={{ color: 'var(--ed-text-secondary)' }}>"{mapName}"</strong> wird unter "Meine Karten" gespeichert.
              <br />{state.countries.length} Länder und {state.elements.length} Elemente.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowSaveConfirm(false)}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid var(--ed-border-strong)',
                  background: 'var(--ed-btn)', color: 'var(--ed-text-muted)', fontSize: 12, cursor: 'pointer',
                }}>
                Abbrechen
              </button>
              <button onClick={doSave}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))', color: 'white',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}>
                <Save size={13} /> Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Save Success Toast ═══ */}
      {showSaveSuccess && (
        <div style={{
          position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white',
          padding: '10px 20px', borderRadius: 10, fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8, zIndex: 300,
          boxShadow: '0 6px 24px rgba(34,197,94,0.35)',
          animation: 'fadeUp 0.3s ease',
          fontFamily: 'var(--font-display)',
        }}>
          <Check size={15} /> Karte erfolgreich gespeichert!
        </div>
      )}

      {/* ═══ Onboarding Tutorial ═══ */}
      {showOnboarding && (
        <OnboardingTutorial onComplete={() => {
          setShowOnboarding(false);
          try { localStorage.setItem('afknow-onboarding-done', '1'); } catch {}
        }} />
      )}

      {/* ═══ Export Preview Dialog ═══ */}
      {showExportPreview && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowExportPreview(false)}>
          <div style={{
            background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
            borderRadius: 16, padding: 20, width: 520, maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ed-text)', fontFamily: 'var(--font-display)' }}>
                Karte exportieren
              </h3>
              <button onClick={() => setShowExportPreview(false)} style={{ background: 'none', border: 'none', color: 'var(--ed-text-muted)', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            {/* Preview */}
            <div style={{ aspectRatio: '1000/1100', background: 'var(--ed-bg)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--ed-border)', marginBottom: 16, position: 'relative' }}>
              {transform.svgRef.current && (
                <svg viewBox="0 0 1000 1100" style={{ width: '100%', height: '100%' }}
                  dangerouslySetInnerHTML={{ __html: transform.svgRef.current.innerHTML }} />
              )}
              <div style={{ position: 'absolute', bottom: 6, right: 8, fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)' }}>
                Vorschau
              </div>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Format</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['png', 'svg', 'pdf'] as const).map(f => (
                    <button key={f} onClick={() => setExportFormat(f)}
                      style={{
                        flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                        background: exportFormat === f ? 'var(--ed-active)' : 'var(--ed-btn)',
                        color: exportFormat === f ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
                      }}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {exportFormat === 'png' && (
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    Auflösung: {1000 * exportScale} x {1100 * exportScale}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4].map(s => (
                      <button key={s} onClick={() => setExportScale(s)}
                        style={{
                          flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11,
                          background: exportScale === s ? 'var(--ed-active)' : 'var(--ed-btn)',
                          color: exportScale === s ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
                        }}>
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {exportFormat === 'pdf' && (
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Seite</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(['a4', 'a3'] as const).map(s => (
                        <button key={s} onClick={() => setPdfPageSize(s)}
                          style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: pdfPageSize === s ? 'var(--ed-active)' : 'var(--ed-btn)', color: pdfPageSize === s ? 'var(--accent-hex)' : 'var(--ed-text-muted)' }}>
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Ausrichtung</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {([{ id: 'landscape', l: 'Quer' }, { id: 'portrait', l: 'Hoch' }] as const).map(o => (
                        <button key={o.id} onClick={() => setPdfOrientation(o.id)}
                          style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: pdfOrientation === o.id ? 'var(--ed-active)' : 'var(--ed-btn)', color: pdfOrientation === o.id ? 'var(--accent-hex)' : 'var(--ed-text-muted)' }}>
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {exportFormat !== 'pdf' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, fontSize: 11, color: 'var(--ed-text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={transparentBg} onChange={(e) => setTransparentBg(e.target.checked)} style={{ accentColor: 'var(--accent-hex)' }} />
                  Transparenter Hintergrund
                </label>
              )}
              {exportFormat === 'pdf' && (
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Klassifikation (optional)</span>
                  <select value={pdfClassification} onChange={e => setPdfClassification(e.target.value)}
                    style={{ width: '100%', background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)', borderRadius: 4, padding: '4px 6px', color: 'var(--ed-text)', fontSize: 10, outline: 'none' }}>
                    <option value="">Keine</option>
                    <option value="OFFEN">OFFEN</option>
                    <option value="VS - NUR FÜR DEN DIENSTGEBRAUCH">VS-NfD</option>
                    <option value="VS - VERTRAULICH">VS-VERTRAULICH</option>
                    <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  </select>
                </div>
              )}
            </div>

            <button onClick={() => {
              if (exportFormat === 'pdf') {
                // Generate map image then export PDF
                const svg = transform.svgRef.current;
                if (!svg) return;
                const clone = svg.cloneNode(true) as SVGSVGElement;
                clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                clone.setAttribute('viewBox', '0 0 1000 1100');
                const svgStr = new XMLSerializer().serializeToString(clone);
                const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = 3000; canvas.height = 3300;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;
                  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--ed-bg').trim() || '#0d1117';
                  ctx.fillStyle = bgColor;
                  ctx.fillRect(0, 0, 3000, 3300);
                  ctx.drawImage(img, 0, 0, 3000, 3300);
                  const dataUrl = canvas.toDataURL('image/png', 0.92);
                  exportToPdf({
                    mapImageDataUrl: dataUrl, mapName,
                    legendEntries: legendEntries.map(e => ({ label: e.label, color: e.color, symbol: e.symbol })),
                    legendTitle, pageSize: pdfPageSize, orientation: pdfOrientation,
                    classification: pdfClassification || undefined,
                    showNorthArrow: showCompass, showScaleBar: true, showDate: true,
                    attribution: 'AfKnow Intelligence Platform',
                  });
                  URL.revokeObjectURL(url);
                };
                img.src = url;
                setShowExportPreview(false);
              } else {
                handleExport(exportFormat, exportScale);
                setShowExportPreview(false);
              }
            }}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))', color: 'white',
                fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginTop: 12,
              }}>
              <Download size={14} /> {exportFormat === 'pdf' ? 'PDF herunterladen' : exportFormat === 'png' ? `PNG herunterladen (${exportScale}x)` : 'SVG herunterladen'}
            </button>
          </div>
        </div>
      )}

      {/* GeoJSON Dialog */}
      {showGeoJSONDialog && (
        <GeoJSONDialog
          mode={showGeoJSONDialog}
          onClose={() => setShowGeoJSONDialog(null)}
          onImport={(imported) => {
            imported.forEach(el => state.addElement(el));
            state.pushSnapshot();
          }}
          exportOptions={{
            elements: state.elements,
            svgToGeo: region.svgToGeo,
            mapName: mapName || 'AfKnow Map',
          }}
          geoToSvg={region.geoToSvg}
        />
      )}

      {/* Template Gallery */}
      {showTemplateGallery && (
        <TemplateGallery
          onClose={() => setShowTemplateGallery(false)}
          onSelect={loadTemplate}
          userTemplates={userTemplates}
          onDeleteUserTemplate={removeUserTemplate}
        />
      )}

      {/* Route Panel */}
      {showRoutePanel && (
        <RoutePanel
          waypoints={routeWaypoints}
          setWaypoints={setRouteWaypoints}
          onRouteCalculated={(route: RouteResult) => {
            const svgPoints: [number, number][] = route.geometry.map(([lon, lat]) => region.geoToSvg(lon, lat));
            const el = {
              ...defaultElement('route', svgPoints[0]?.[0] ?? 500, svgPoints[0]?.[1] ?? 550),
              points: svgPoints,
              strokeColor: '#3b82f6',
              strokeWidth: 3,
              content: `${route.distanceKm.toFixed(1)} km`,
              routeWaypoints: routeWaypoints.map(([lon, lat]) => region.geoToSvg(lon, lat) as [number, number]),
              routeProfile: 'car' as const,
              routeDistanceKm: route.distanceKm,
              routeDurationMin: route.durationMinutes,
              routeGeometry: svgPoints,
            };
            state.addElement(el);
          }}
          onClose={() => setShowRoutePanel(false)}
        />
      )}

      {/* Offline Banner */}
      <OfflineBanner onOpenPredownload={() => setShowPredownload(true)} />

      {/* Predownload Dialog */}
      {showPredownload && (
        <PredownloadDialog
          onClose={() => setShowPredownload(false)}
          currentMapStyle={mapStyle}
          svgToGeo={region.svgToGeo}
        />
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <ShareDialog
          onClose={() => setShowShareDialog(false)}
          mapId={mapName || 'unnamed'}
          mapName={mapName}
          connected={collab.connected}
          users={collab.users}
        />
      )}
    </div>
  );
}

// ─── Small UI helpers ───
function LayerToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
        borderRadius: 6, border: 'none', cursor: 'pointer', width: '100%',
        textAlign: 'left', fontSize: 11,
        background: checked ? 'color-mix(in srgb, var(--accent-hex) 8%, transparent)' : 'transparent',
        color: checked ? 'var(--ed-text-secondary)' : 'var(--ed-text-dim)',
        transition: 'all 0.1s',
      }}>
      <div style={{
        width: 14, height: 14, borderRadius: 3, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: checked ? 'var(--accent-hex)' : 'var(--ed-btn)',
        border: checked ? 'none' : '1px solid var(--ed-border-strong)',
      }}>
        {checked && <Check size={9} color="white" strokeWidth={3} />}
      </div>
      {label}
    </button>
  );
}

function HelpSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent-hex)', marginBottom: 4, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</div>
    </div>
  );
}

function HelpRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
      <span style={{ fontSize: 10, color: 'var(--ed-text-secondary)', fontFamily: 'var(--font-body)' }}>{desc}</span>
      <kbd style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ed-text-muted)', background: 'var(--ed-btn)', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--ed-border)' }}>{keys}</kbd>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
  background: 'var(--ed-btn)', color: 'var(--ed-icon)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const goldBtnStyle: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--accent-hex) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-hex) 30%, transparent)',
  borderRadius: 6, padding: '4px 10px', color: 'var(--accent-hex)', fontSize: 11,
  fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
};
const exportBtnStyle: React.CSSProperties = {
  background: 'var(--ed-btn)', border: '1px solid var(--ed-input-border)',
  borderRadius: 6, padding: '4px 10px', color: 'var(--ed-text-muted)', fontSize: 11,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
};
