import { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import type { EditorState } from './useEditorState';
import type { CanvasTransformState } from './useCanvasTransform';
import type { EditorElement, EditorElementType, EditorSubRegion, ToolType, LegendEntry, Measurement, Faction, Echelon, ConfidenceLevel } from './types';
import { defaultElement, solidFill } from './types';
import { ZONE_PRESETS, GRID_OVERLAYS, WEAPON_RANGES, FACTION_COLORS } from './constants';
import { getVisibleOsmTiles, TILE_PROVIDERS } from '../../lib/osmTiles';
import { WEATHER_LAYERS } from '../../lib/weatherTiles';
import { useRegion } from '../../context/RegionContext';
import { useRealMap } from '../../hooks/useRealMap';
import SvgDefs from './SvgDefs';
import MilitarySymbol from './MilitarySymbols';
import InsetMap from './InsetMap';
import { COUNTRY_ADMIN_REGIONS } from '../../data/subRegions';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LEAFLET_TILES: Record<string, { url: string; attribution: string; name: string }> = {
  osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap', name: 'OpenStreetMap' },
  topo: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenTopoMap', name: 'Topographisch' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri', name: 'Satellit' },
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '&copy; CartoDB', name: 'Dunkel' },
  light: { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', attribution: '&copy; CartoDB', name: 'Hell' },
};

import { haversineKm, bearingDeg, bearingToCardinal, sphericalPolygonAreaKm2, pathDistanceKm, segmentDistancesKm, formatDistance, formatArea, formatCoord, type CoordFormat } from '../../lib/geoMeasure';
import ImagePinModal, { compressImage } from './ImagePinModal';
import CollabCursors from './CollabCursors';

/** Convert distance between two SVG points to kilometers using Haversine formula */
function svgDistanceKm(x1: number, y1: number, x2: number, y2: number, svgToGeo: (x: number, y: number) => [number, number]): number {
  const [lon1, lat1] = svgToGeo(x1, y1);
  const [lon2, lat2] = svgToGeo(x2, y2);
  return haversineKm(lon1, lat1, lon2, lat2);
}

function getFillAttr(fill: EditorElement['fill'], id: string, prefix = 'efill'): string {
  return fill.type === 'solid' ? fill.color : `url(#${prefix}-${id})`;
}

function getMarkerEnd(cap: string): string {
  if (cap === 'arrow') return 'url(#mk-arrow)';
  if (cap === 'circle') return 'url(#mk-circle)';
  if (cap === 'diamond') return 'url(#mk-diamond)';
  return '';
}

function getMarkerStart(cap: string): string {
  if (cap === 'arrow') return 'url(#mk-arrow-start)';
  if (cap === 'circle') return 'url(#mk-circle)';
  if (cap === 'diamond') return 'url(#mk-diamond)';
  return '';
}

function pointsToSmoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  if (pts.length === 2) {
    d += ` L${pts[1][0]},${pts[1][1]}`;
    return d;
  }
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${pts[i][0]},${pts[i][1]} ${mx},${my}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${last[0]},${last[1]}`;
  return d;
}

function pointsToCurvedArrow(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]}`;
  if (pts.length === 3) return `M${pts[0][0]},${pts[0][1]} Q${pts[1][0]},${pts[1][1]} ${pts[2][0]},${pts[2][1]}`;
  return `M${pts[0][0]},${pts[0][1]} C${pts[1][0]},${pts[1][1]} ${pts[2][0]},${pts[2][1]} ${pts[3][0]},${pts[3][1]}`;
}

interface Props {
  state: EditorState;
  transform: CanvasTransformState;
  activeTool: ToolType;
  setActiveTool: (t: ToolType) => void;
  activeColor: string;
  showOcean: boolean;
  showCompass: boolean;
  showLegend: boolean;
  legendTitle: string;
  legendEntries: LegendEntry[];
  showTitle: boolean;
  mapTitle: string;
  titleColor: string;
  gridOverlay: string;
  snapToGrid: boolean;
  showRivers: boolean;
  showCapitals: boolean;
  showLabels: boolean;
  showAirports: boolean;
  showPorts: boolean;
  mapStyle: string;
  textInput: string;
  setTextInput: (s: string) => void;
  fontSize: number;
  activeFaction: Faction;
  activeEchelon: Echelon;
  activeConfidence: ConfidenceLevel;
  activeWeaponRange: string;
  activePhaseId: string;
  timelinePhases: import('./types').TimelinePhase[];
  coordFormat: CoordFormat;
  weatherLayers?: string[];
  weatherOpacity?: number;
  onRouteWaypointAdd?: (geoCoord: [number, number]) => void;
  collabUsers?: import('../../hooks/useRealtimeCollab').CollabUser[];
}

// ─── Map Style Color Schemes ───
const MAP_STYLE_COLORS: Record<string, { ocean1: string; ocean2: string; land: string; border: string; text: string; gridStroke: string }> = {
  standard:  { ocean1: 'var(--ed-ocean-start)', ocean2: 'var(--ed-ocean-end)', land: '', border: '', text: '', gridStroke: 'var(--ed-grid-stroke)' },
  political: { ocean1: '#c5d6e8', ocean2: '#b0c4d8', land: '', border: '#ffffff', text: '#1a1a2e', gridStroke: 'rgba(0,0,0,0.05)' },
  military:  { ocean1: '#1a2218', ocean2: '#0f1610', land: '#2a3328', border: '#3a4a38', text: '#8aaa88', gridStroke: 'rgba(120,180,120,0.08)' },
  terrain:   { ocean1: '#2a6498', ocean2: '#1a4870', land: '#6b8c42', border: '#4a6a30', text: '#e8e4d0', gridStroke: 'rgba(200,180,120,0.06)' },
  satellite: { ocean1: '#0a1628', ocean2: '#040c18', land: '#1a3020', border: '#0a1a10', text: '#90b0a0', gridStroke: 'rgba(60,120,180,0.06)' },
  minimal:   { ocean1: '#f0ece4', ocean2: '#e8e2d8', land: '#fafaf8', border: '#d0c8b8', text: '#3a3530', gridStroke: 'rgba(0,0,0,0.04)' },
};

export default function EditorCanvas({
  state, transform, activeTool, setActiveTool, activeColor,
  showOcean, showCompass, showLegend, legendTitle,
  legendEntries, showTitle, mapTitle, titleColor, gridOverlay,
  snapToGrid,
  showRivers, showCapitals, showLabels, showAirports, showPorts, mapStyle,
  textInput, setTextInput, fontSize,
  activeFaction, activeEchelon, activeConfidence, activeWeaponRange, activePhaseId, timelinePhases,
  coordFormat,
  weatherLayers = [],
  weatherOpacity = 0.5,
  onRouteWaypointAdd,
  collabUsers = [],
}: Props) {
  const region = useRegion();
  const { paths: realPaths } = useRealMap(region.id);
  const realPathMap = useMemo(() => {
    const m = new Map<string, { path: string; center: [number, number] }>();
    for (const p of realPaths) m.set(p.id, { path: p.path, center: p.center });
    return m;
  }, [realPaths]);

  // ─── Region lookup + click handler for tile-view countries ───
  const regionMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of region.countries) m[c.id] = c.region;
    return m;
  }, [region.countries]);

  const handleBgCountryClick = useCallback((id: string, e: React.MouseEvent) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    state.addCountries([id], regionMap);
    state.selectCountry(id);
  }, [activeTool, state, regionMap]);

  // ─── Clip-path for tile rendering: only added countries ("extraction" effect) ───
  const addedCountryClipPaths = useMemo(() => {
    return state.countries.map(cc => {
      const entry = realPathMap.get(cc.id);
      const ct = region.countries.find(c => c.id === cc.id);
      const d = entry?.path ?? ct?.path;
      return d ? { id: cc.id, d } : null;
    }).filter(Boolean) as { id: string; d: string }[];
  }, [state.countries, realPathMap]);

  // ─── Drag state (element moving) ───
  const dragRef = useRef<{
    startX: number;
    startY: number;
    items: { id: string; origX: number; origY: number }[];
  } | null>(null);

  // ─── LIVE drawing state (useState for real-time rendering!) ───
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const isDrawing = useRef(false);

  // ─── LIVE point-tool state (polygon, zone, curved-arrow, frontline) ───
  const [tempPoints, setTempPoints] = useState<[number, number][]>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // ─── LIVE drag-to-create state (rect, ellipse, line, arrow) ───
  const [dragCreate, setDragCreate] = useState<{ startX: number; startY: number; curX: number; curY: number } | null>(null);

  // ─── Persistent Measurements ───
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  // ─── Live measure/radius drawing ───
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null);
  const [measureEnd, setMeasureEnd] = useState<{ x: number; y: number } | null>(null);
  const [radiusCenter, setRadiusCenter] = useState<{ x: number; y: number } | null>(null);
  const [radiusEnd, setRadiusEnd] = useState<{ x: number; y: number } | null>(null);

  // Admin Regions toggle from state
  const adminRegionsVisible = state.adminRegionsVisible;

  // ─── Live polygon-area / multi-segment measurement points ───
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  // ─── Image pin preview modal ───
  const [viewingImagePin, setViewingImagePin] = useState<string | null>(null);

  const isPointTool = activeTool === 'polygon' || activeTool === 'zone' || activeTool === 'curved-arrow' || activeTool === 'frontline' || activeTool === 'sub-region' || activeTool === 'supply-route';
  const isDragCreateTool = activeTool === 'rect' || activeTool === 'ellipse' || activeTool === 'line' || activeTool === 'arrow';
  const isMeasureTool = activeTool === 'measure' || activeTool === 'radius' || activeTool === 'polygon-area' || activeTool === 'multi-segment';
  const isClickMeasureTool = activeTool === 'polygon-area' || activeTool === 'multi-segment';

  // ─── Grid overlay config ───
  const gridConfig = useMemo(() => GRID_OVERLAYS.find(g => g.id === gridOverlay), [gridOverlay]);
  const styleColors = MAP_STYLE_COLORS[mapStyle] || MAP_STYLE_COLORS.standard;
  const isTileStyle = !!TILE_PROVIDERS[mapStyle];

  const snapPoint = useCallback((x: number, y: number, altKey = false) => {
    const spacing = gridConfig?.spacing ?? 0;
    if (!snapToGrid || altKey || spacing <= 0) return { x, y };
    return {
      x: Math.round(x / spacing) * spacing,
      y: Math.round(y / spacing) * spacing,
    };
  }, [gridConfig?.spacing, snapToGrid]);

  // ─── OSM Tile layer ───
  const osmTiles = useMemo(() => {
    const tpl = TILE_PROVIDERS[mapStyle];
    if (!tpl) return [];
    const parts = transform.viewBox.split(' ').map(Number);
    return getVisibleOsmTiles({ x: parts[0], y: parts[1], w: parts[2], h: parts[3] }, transform.zoom, tpl, 500, { geoToSvg: region.geoToSvg, svgToGeo: region.svgToGeo });
  }, [mapStyle, transform.viewBox, transform.zoom, region]);

  // ─── Weather tile layers ───
  const weatherTiles = useMemo(() => {
    if (weatherLayers.length === 0) return [];
    const parts = transform.viewBox.split(' ').map(Number);
    const proj = { geoToSvg: region.geoToSvg, svgToGeo: region.svgToGeo };
    return weatherLayers.map(layerId => {
      const layer = WEATHER_LAYERS.find(l => l.id === layerId);
      if (!layer) return { id: layerId, tiles: [] };
      const tiles = getVisibleOsmTiles({ x: parts[0], y: parts[1], w: parts[2], h: parts[3] }, transform.zoom, layer.urlTemplate, 300, proj);
      return { id: layerId, tiles };
    });
  }, [weatherLayers, transform.viewBox, transform.zoom, region]);

  const isLeafletStyle = mapStyle === 'leaflet';

  // ─── Leaflet background map (behind SVG) ───
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  // Initialize / destroy Leaflet when style toggles
  useEffect(() => {
    if (!isLeafletStyle) {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      return;
    }
    if (!leafletContainerRef.current || leafletMapRef.current) return;

    const map = L.map(leafletContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });

    // Default dark tiles
    const defaultTile = LEAFLET_TILES.dark;
    const baseLayer = L.tileLayer(defaultTile.url, { attribution: defaultTile.attribution, maxZoom: 19 });
    baseLayer.addTo(map);

    // Layer switcher
    const baseLayers: Record<string, L.TileLayer> = {};
    for (const [key, cfg] of Object.entries(LEAFLET_TILES)) {
      baseLayers[cfg.name] = key === 'dark' ? baseLayer : L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: 19 });
    }
    L.control.layers(baseLayers, {}, { position: 'topright' }).addTo(map);

    leafletMapRef.current = map;
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [isLeafletStyle]);

  // Sync Leaflet view to SVG viewBox
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !isLeafletStyle) return;

    const vbParts = transform.viewBox.split(' ').map(Number);
    const [vx, vy, vw, vh] = vbParts;

    // Convert SVG corners to geo coordinates
    const [lonTL, latTL] = region.svgToGeo(vx, vy);
    const [lonBR, latBR] = region.svgToGeo(vx + vw, vy + vh);

    // Set Leaflet bounds to match
    const bounds = L.latLngBounds(
      L.latLng(latBR, lonTL), // south-west
      L.latLng(latTL, lonBR), // north-east
    );

    map.invalidateSize();
    map.fitBounds(bounds, { animate: false, padding: [0, 0] });
  }, [transform.viewBox, isLeafletStyle, region]);

  // ─── Mouse Handlers ───
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey) || e.button === 2 || activeTool === 'pan') {
      e.preventDefault();
      transform.startPan(e.clientX, e.clientY);
      return;
    }
    if (e.button !== 0) return;

    const rawPt = transform.screenToSvg(e.clientX, e.clientY);
    const pt = snapPoint(rawPt.x, rawPt.y, e.altKey);

    if (activeTool === 'image-pin') {
      // Open file picker and place image pin at click location
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const dataUrl = await compressImage(file, 1200);
        const el = defaultElement('image-pin', pt.x, pt.y);
        el.imageDataUrl = dataUrl;
        el.width = 40;
        el.height = 40;
        el.fill = solidFill(activeColor, 1);
        el.strokeColor = activeColor;
        el.timelinePhase = activePhaseId;
        state.pushSnapshot();
        state.addElement(el);
      };
      input.click();
      return;
    }
    if (activeTool === 'route' && onRouteWaypointAdd) {
      const [lon, lat] = region.svgToGeo(pt.x, pt.y);
      onRouteWaypointAdd([lon, lat]);
      return;
    }
    if (activeTool === 'measure') {
      setMeasureStart({ x: pt.x, y: pt.y });
      setMeasureEnd({ x: pt.x, y: pt.y });
      return;
    }
    if (activeTool === 'radius') {
      setRadiusCenter({ x: pt.x, y: pt.y });
      setRadiusEnd({ x: pt.x, y: pt.y });
      return;
    }

    if (activeTool === 'freehand') {
      isDrawing.current = true;
      setDrawingPoints([[pt.x, pt.y]]);
      state.pushSnapshot();
      return;
    }

    if (activeTool === 'select') {
      const target = e.target as SVGElement;
      if (target.tagName === 'svg' || target.dataset?.background) {
        state.clearSelection();
      }
      return;
    }

    if (isDragCreateTool) {
      setDragCreate({ startX: pt.x, startY: pt.y, curX: pt.x, curY: pt.y });
      return;
    }

    if (!isPointTool) {
      const el = defaultElement(activeTool as EditorElementType, pt.x, pt.y);
      el.fill = solidFill(activeColor, 1);
      el.strokeColor = activeColor;
      if (activeTool === 'text') {
        if (!textInput.trim()) return;
        el.content = textInput;
        el.fontSize = fontSize;
        setTextInput('');
      }
      if (activeTool === 'marker') el.fill = solidFill(activeColor);
      if (activeTool === 'heatmap-point') {
        el.width = 60;
        el.height = 60;
        el.fill = solidFill(activeColor, 0.4);
      }
      if (activeTool === 'military-unit') {
        el.fill = solidFill(FACTION_COLORS[activeFaction]);
        el.faction = activeFaction;
        el.echelon = activeEchelon;
        el.confidence = activeConfidence;
        el.timelinePhase = activePhaseId;
      }
      if (activeTool === 'range-circle') {
        const weapon = WEAPON_RANGES.find(w => w.id === activeWeaponRange);
        if (weapon) {
          el.type = 'range-circle';
          el.weaponRangeId = weapon.id;
          el.content = `${weapon.label} (${weapon.rangeKm} km)`;
          el.fill = solidFill(weapon.color, 0.08);
          el.strokeColor = weapon.color;
          el.strokeWidth = 1.5;
          el.strokeDasharray = '6 3';
          // Convert km to SVG units using the region's geo projection
          const [lon0, lat0] = region.svgToGeo(pt.x, pt.y);
          const latRad = lat0 * Math.PI / 180;
          const kmPerDegLat = 111.32;
          const kmPerDegLon = 111.32 * Math.cos(latRad);
          const degLat = weapon.rangeKm / kmPerDegLat;
          const degLon = weapon.rangeKm / kmPerDegLon;
          const [svgEdgeX] = region.geoToSvg(lon0 + degLon, lat0);
          const [, svgEdgeY] = region.geoToSvg(lon0, lat0 + degLat);
          const svgRadiusX = Math.abs(svgEdgeX - pt.x);
          const svgRadiusY = Math.abs(svgEdgeY - pt.y);
          el.width = svgRadiusX * 2;
          el.height = svgRadiusY * 2;
          el.timelinePhase = activePhaseId;
        }
      }
      if (activeTool === 'callout') {
        el.content = textInput.trim() || 'Annotation';
        el.fontSize = Math.max(8, fontSize * 0.7);
        el.fill = solidFill(activeColor, 0.9);
        el.strokeColor = activeColor;
        el.strokeWidth = 1;
        // Anchor point offset below-right of box
        el.points = [[pt.x + 80, pt.y + 80]];
        el.width = 160;
        el.height = 60;
        el.textAlign = 'left';
        if (textInput.trim()) setTextInput('');
      }
      if (!el.timelinePhase) el.timelinePhase = activePhaseId;
      state.addElement(el);
      if (activeTool !== 'text' && activeTool !== 'range-circle') setActiveTool('select');
    }
  }, [activeTool, transform, state, activeColor, textInput, fontSize, setTextInput, setActiveTool, isPointTool, isDragCreateTool, activePhaseId, snapPoint, activeFaction, activeEchelon, activeConfidence, activeWeaponRange, onRouteWaypointAdd, region]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (transform.movePan(e.clientX, e.clientY)) return;

    const rawPt = transform.screenToSvg(e.clientX, e.clientY);
    const pt = snapPoint(rawPt.x, rawPt.y, e.altKey);

    // Measure/Radius drag
    if (measureStart && activeTool === 'measure') {
      setMeasureEnd({ x: pt.x, y: pt.y });
      setCursorPos({ x: pt.x, y: pt.y });
      return;
    }
    if (radiusCenter && activeTool === 'radius') {
      setRadiusEnd({ x: pt.x, y: pt.y });
      setCursorPos({ x: pt.x, y: pt.y });
      return;
    }

    if (isDrawing.current) {
      setDrawingPoints((prev) => [...prev, [pt.x, pt.y]]);
      return;
    }

    if (dragCreate) {
      setDragCreate((prev) => {
        if (!prev) return null;
        let curX = pt.x;
        let curY = pt.y;
        const dx = curX - prev.startX;
        const dy = curY - prev.startY;

        if (e.shiftKey && (activeTool === 'rect' || activeTool === 'ellipse')) {
          const size = Math.max(Math.abs(dx), Math.abs(dy));
          curX = prev.startX + Math.sign(dx || 1) * size;
          curY = prev.startY + Math.sign(dy || 1) * size;
        } else if (e.shiftKey && (activeTool === 'line' || activeTool === 'arrow')) {
          const dist = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
          curX = prev.startX + Math.cos(snappedAngle) * dist;
          curY = prev.startY + Math.sin(snappedAngle) * dist;
        }

        return { ...prev, curX, curY };
      });
      return;
    }

    if (dragRef.current) {
      const spacing = gridConfig?.spacing ?? 0;
      let dx = rawPt.x - dragRef.current.startX;
      let dy = rawPt.y - dragRef.current.startY;
      if (snapToGrid && !e.altKey && spacing > 0) {
        dx = Math.round(dx / spacing) * spacing;
        dy = Math.round(dy / spacing) * spacing;
      }
      if (e.shiftKey) {
        if (Math.abs(dx) >= Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      for (const item of dragRef.current.items) {
        state.updateElement(item.id, {
          x: item.origX + dx,
          y: item.origY + dy,
        });
      }
      return;
    }

    if (isPointTool || isDragCreateTool || isMeasureTool || isClickMeasureTool) {
      setCursorPos({ x: pt.x, y: pt.y });
    }
  }, [transform, state, dragCreate, measureStart, radiusCenter, activeTool, isPointTool, isDragCreateTool, isMeasureTool, isClickMeasureTool, snapPoint, gridConfig?.spacing, snapToGrid]);

  const removeMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);

  const clearAllMeasurements = useCallback(() => {
    setMeasurements([]);
  }, []);

  const handleMouseUp = useCallback((_e: React.MouseEvent<SVGSVGElement>) => {
    transform.endPan();

    // Commit live measure to persistent array
    if (measureStart && measureEnd && activeTool === 'measure') {
      const dx = measureEnd.x - measureStart.x;
      const dy = measureEnd.y - measureStart.y;
      if (Math.sqrt(dx * dx + dy * dy) > 3) {
        setMeasurements(prev => [...prev, {
          id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          type: 'measure',
          start: { ...measureStart },
          end: { ...measureEnd },
        }]);
      }
      setMeasureStart(null);
      setMeasureEnd(null);
      return;
    }

    // Commit live radius to persistent array
    if (radiusCenter && radiusEnd && activeTool === 'radius') {
      const dx = radiusEnd.x - radiusCenter.x;
      const dy = radiusEnd.y - radiusCenter.y;
      if (Math.sqrt(dx * dx + dy * dy) > 3) {
        setMeasurements(prev => [...prev, {
          id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          type: 'radius',
          start: { ...radiusCenter },
          end: { ...radiusEnd },
        }]);
      }
      setRadiusCenter(null);
      setRadiusEnd(null);
      return;
    }

    if (isDrawing.current && drawingPoints.length > 2) {
      const raw = drawingPoints;
      const simplified: [number, number][] = [raw[0]];
      for (let i = 1; i < raw.length - 1; i++) {
        if (i % 3 === 0) simplified.push(raw[i]);
      }
      simplified.push(raw[raw.length - 1]);
      const el = defaultElement('freehand', simplified[0][0], simplified[0][1]);
      el.points = simplified;
      el.strokeColor = activeColor;
      el.fill = solidFill('transparent', 0);
      el.strokeWidth = 2;
      el.timelinePhase = activePhaseId;
      state.addElement(el);
    }
    isDrawing.current = false;
    setDrawingPoints([]);

    if (dragCreate) {
      const dx = dragCreate.curX - dragCreate.startX;
      const dy = dragCreate.curY - dragCreate.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        const cx = (dragCreate.startX + dragCreate.curX) / 2;
        const cy = (dragCreate.startY + dragCreate.curY) / 2;

        if (activeTool === 'rect') {
          const el = defaultElement('rect', cx, cy);
          el.width = Math.abs(dx);
          el.height = Math.abs(dy);
          el.fill = solidFill(activeColor, 0.3);
          el.strokeColor = activeColor;
          el.timelinePhase = activePhaseId;
          state.addElement(el);
        } else if (activeTool === 'ellipse') {
          const el = defaultElement('ellipse', cx, cy);
          el.width = Math.abs(dx);
          el.height = Math.abs(dy);
          el.fill = solidFill(activeColor, 0.3);
          el.strokeColor = activeColor;
          el.timelinePhase = activePhaseId;
          state.addElement(el);
        } else if (activeTool === 'line') {
          const el = defaultElement('line', dragCreate.startX, dragCreate.startY);
          el.points = [[dragCreate.startX, dragCreate.startY], [dragCreate.curX, dragCreate.curY]];
          el.strokeColor = activeColor;
          el.fill = solidFill('transparent', 0);
          el.timelinePhase = activePhaseId;
          state.addElement(el);
        } else if (activeTool === 'arrow') {
          const el = defaultElement('arrow', dragCreate.startX, dragCreate.startY);
          el.points = [[dragCreate.startX, dragCreate.startY], [dragCreate.curX, dragCreate.curY]];
          el.strokeColor = activeColor;
          el.arrowEnd = 'arrow';
          el.fill = solidFill('transparent', 0);
          el.timelinePhase = activePhaseId;
          state.addElement(el);
        }
        setActiveTool('select');
      }
      setDragCreate(null);
    }

    if (dragRef.current) dragRef.current = null;
  }, [transform, state, drawingPoints, dragCreate, activeColor, activeTool, setActiveTool, measureStart, measureEnd, radiusCenter, radiusEnd, activePhaseId]);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    // Polygon-area / multi-segment measurement: click adds a point
    if (isClickMeasureTool) {
      const rawPt = transform.screenToSvg(e.clientX, e.clientY);
      const pt = snapPoint(rawPt.x, rawPt.y, e.altKey);
      setMeasurePoints((prev) => [...prev, { x: pt.x, y: pt.y }]);
      return;
    }
    if (!isPointTool) return;
    const rawPt = transform.screenToSvg(e.clientX, e.clientY);
    const pt = snapPoint(rawPt.x, rawPt.y, e.altKey);
    setTempPoints((prev) => [...prev, [pt.x, pt.y]]);
  }, [isPointTool, isClickMeasureTool, transform, snapPoint]);

  const handleDoubleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    // Finalize polygon-area / multi-segment measurement
    if (isClickMeasureTool && measurePoints.length >= 2) {
      e.preventDefault();
      const pts = [...measurePoints];
      const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      setMeasurements(prev => [...prev, {
        id: `${activeTool === 'polygon-area' ? 'pa' : 'ms'}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        type: activeTool as 'polygon-area' | 'multi-segment',
        start: { x: cx, y: cy },
        end: { x: cx, y: cy },
        points: pts,
      }]);
      setMeasurePoints([]);
      return;
    }
    if (!isPointTool || tempPoints.length < 2) return;
    e.preventDefault();

    const pts = tempPoints;
    const firstPt = pts[0];
    const el = defaultElement(activeTool as EditorElementType, firstPt[0], firstPt[1]);
    el.points = pts;
    el.strokeColor = activeColor;

    if (activeTool === 'sub-region') {
      // Create sub-region from polygon points
      const pathD = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ') + ' Z';
      const label = `Region ${(state.subRegions?.length ?? 0) + 1}`;
      // Find which country this region is inside (use first point)
      let countryId = '';
      // Simple: use the first country in the editor
      if (state.countries.length > 0) {
        countryId = state.countries[0].id;
      }
      const sr: EditorSubRegion = {
        id: `sr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        countryId,
        label,
        path: pathD,
        fill: solidFill(activeColor, 0.2),
        strokeColor: activeColor,
        strokeWidth: 1.5,
        strokeDasharray: '4 2',
        labelVisible: true,
      };
      state.addSubRegion(sr);
      setTempPoints([]);
      setActiveTool('select');
      return;
    }

    if (activeTool === 'polygon' || activeTool === 'zone') {
      el.fill = solidFill(activeColor, 0.25);
      if (activeTool === 'zone') {
        // Check if color was set via ISW panel (activeColor differs from default zone preset)
        const zp = ZONE_PRESETS[el.zonePreset];
        const isISWColor = activeColor !== zp.fill && activeColor !== '#D4A74F';
        if (isISWColor) {
          // ISW panel set a custom color — use it instead of the default preset
          el.fill = solidFill(activeColor, 0.25);
          el.strokeColor = activeColor;
          el.content = ''; // User can label it via properties panel
        } else {
          el.fill = solidFill(zp.fill, 0.25);
          el.strokeColor = zp.stroke;
          el.content = zp.label;
        }
      }
    }
    if (activeTool === 'curved-arrow') {
      el.fill = solidFill('transparent', 0);
      el.arrowEnd = 'arrow';
    }
    if (activeTool === 'frontline') {
      el.fill = solidFill('transparent', 0);
      el.strokeWidth = 2.5;
    }
    if (activeTool === 'supply-route') {
      el.fill = solidFill('transparent', 0);
      el.strokeWidth = 2;
      el.strokeDasharray = '8 4 2 4';
      el.content = 'Versorgungslinie';
    }

    el.timelinePhase = activePhaseId;
    state.addElement(el);
    setTempPoints([]);
    setActiveTool('select');
  }, [isPointTool, isClickMeasureTool, activeTool, state, activeColor, setActiveTool, tempPoints, measurePoints, activePhaseId]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleElementMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    const el = state.elements.find((el) => el.id === id);
    if (!el || el.locked) return;
    // Double-click on image-pin → open preview modal
    if (e.detail === 2 && el.type === 'image-pin') {
      setViewingImagePin(id);
      return;
    }
    const alreadySelected = state.selectedElementIds.has(id);
    if (!alreadySelected || e.shiftKey) state.selectElement(id, e.shiftKey);
    state.pushSnapshot();
    const pt = transform.screenToSvg(e.clientX, e.clientY);

    const dragIds = (alreadySelected && !e.shiftKey)
      ? [...state.selectedElementIds]
      : [id];
    const items = dragIds
      .map((dragId) => {
        const target = state.elements.find((it) => it.id === dragId);
        if (!target || target.locked) return null;
        return { id: dragId, origX: target.x, origY: target.y };
      })
      .filter(Boolean) as { id: string; origX: number; origY: number }[];

    if (items.length === 0) return;
    dragRef.current = { startX: pt.x, startY: pt.y, items };
  }, [activeTool, state, transform]);

  const handleCountryClick = useCallback((id: string, e: React.MouseEvent) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    state.selectCountry(id);
  }, [activeTool, state]);



  const sortedElements = useMemo(() => {
    let els = [...state.elements];
    return els.sort((a, b) => a.zIndex - b.zIndex);
  }, [state.elements]);

  // Compute per-element opacity for timeline fade transitions
  const elementPhaseOpacity = useMemo(() => {
    const map = new Map<string, number>();
    if (timelinePhases.length === 0 || !activePhaseId) {
      // No timeline → all elements fully visible
      for (const el of state.elements) map.set(el.id, 1);
    } else {
      for (const el of state.elements) {
        if (!el.timelinePhase) {
          map.set(el.id, 1); // global elements always visible
        } else if (el.timelinePhase === activePhaseId) {
          map.set(el.id, 1); // active phase
        } else {
          map.set(el.id, 0); // other phases hidden
        }
      }
    }
    return map;
  }, [state.elements, timelinePhases.length, activePhaseId]);

  // Countries on canvas for capital/label rendering
  const canvasCountryData = useMemo(() => {
    return state.countries.map(cc => {
      const ct = region.countries.find(c => c.id === cc.id);
      return ct ? { ...cc, data: ct } : null;
    }).filter(Boolean) as (typeof state.countries[0] & { data: typeof region.countries[0] })[];
  }, [state.countries]);

  const cursor = activeTool === 'select' ? 'default' : activeTool === 'pan' ? 'grab' : 'crosshair';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Leaflet background map (behind SVG) */}
      {isLeafletStyle && (
        <>
          <div ref={leafletContainerRef} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }} />
          <style>{`
            .leaflet-control-layers {
              background: var(--ed-overlay-bg, #1a1f2e) !important;
              color: var(--ed-canvas-text, #e4dfd7) !important;
              border: 1px solid var(--ed-overlay-border, #2a2f3e) !important;
              border-radius: 8px !important;
              pointer-events: auto !important;
            }
            .leaflet-control-layers-toggle { width: 28px !important; height: 28px !important; pointer-events: auto !important; }
            .leaflet-control-layers label { color: var(--ed-canvas-text, #e4dfd7) !important; font-size: 11px !important; }
            .leaflet-control-container { pointer-events: none !important; }
            .leaflet-control-container .leaflet-control { pointer-events: auto !important; }
          `}</style>
        </>
      )}
      <svg
        ref={transform.svgRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor, zIndex: 3 }}
        viewBox={transform.viewBox}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onWheel={transform.handleWheel}
        onContextMenu={handleContextMenu}
      >
        <SvgDefs countries={state.countries} elements={state.elements} />


        {/* Map-style-specific ocean gradient */}
        {mapStyle !== 'standard' && (
          <defs>
            <radialGradient id="ed-ocean-style" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor={styleColors.ocean1} />
              <stop offset="100%" stopColor={styleColors.ocean2} />
            </radialGradient>
          </defs>
        )}

        {/* Background — hidden when tiles or Leaflet are active */}
        {showOcean && !isLeafletStyle && !isTileStyle && <rect data-background="true" width="1000" height="1100" fill={mapStyle === 'standard' ? 'url(#ed-ocean)' : 'url(#ed-ocean-style)'} />}
        {!isTileStyle && !isLeafletStyle && <rect data-background="true" width="1000" height="1100" fill="url(#ed-grid)" />}

        {/* ═══ Clip Paths for Tile Styles ═══ */}
        {isTileStyle && (
          <defs>
            {/* Clip to just the user-added countries — "extracted" from the map */}
            <clipPath id="added-region-clip">
              {addedCountryClipPaths.map(c => <path key={c.id} d={c.d} />)}
            </clipPath>
          </defs>
        )}

        {/* ═══ OSM Tile Layer — full canvas when tile style, clipped when countries added ═══ */}
        {osmTiles.length > 0 && (
          <g data-background="true" pointerEvents="none"
            clipPath={addedCountryClipPaths.length > 0 ? 'url(#added-region-clip)' : undefined}>
            {osmTiles.map(t => (
              <image key={`t${t.z}-${t.x}-${t.y}`} href={t.url}
                x={t.svgX} y={t.svgY} width={t.svgW} height={t.svgH}
                preserveAspectRatio="none" />
            ))}
          </g>
        )}

        {/* ═══ Weather Overlay Tiles ═══ */}
        {weatherTiles.map(wl => wl.tiles.length > 0 && (
          <g key={`weather-${wl.id}`} data-background="true" pointerEvents="none" opacity={weatherOpacity}>
            {wl.tiles.map(t => (
              <image key={`w${wl.id}-${t.z}-${t.x}-${t.y}`} href={t.url}
                x={t.svgX} y={t.svgY} width={t.svgW} height={t.svgH}
                preserveAspectRatio="none" />
            ))}
          </g>
        ))}

        {showOcean && !isTileStyle && (
          <g data-background="true">
            {region.oceanLabels.map((lbl, i) => (
              <text key={i} x={lbl.x} y={lbl.y} fill="#4AA3DF" opacity="0.08" fontSize={lbl.fontSize ?? 14} fontFamily="var(--font-display)" fontStyle="italic"
                transform={lbl.rotation ? `rotate(${lbl.rotation}, ${lbl.x}, ${lbl.y})` : undefined}>{lbl.text}</text>
            ))}
          </g>
        )}

        {/* ═══ Grid Overlay ═══ */}
        {gridConfig && gridConfig.spacing > 0 && (
          <g data-background="true" pointerEvents="none">
            {Array.from({ length: Math.ceil(1000 / gridConfig.spacing) + 1 }, (_, i) => i * gridConfig.spacing).map(x => (
              <line key={`gv-${x}`} x1={x} y1={0} x2={x} y2={1100} stroke={gridConfig.color} strokeWidth={0.5} />
            ))}
            {Array.from({ length: Math.ceil(1100 / gridConfig.spacing) + 1 }, (_, i) => i * gridConfig.spacing).map(y => (
              <line key={`gh-${y}`} x1={0} y1={y} x2={1000} y2={y} stroke={gridConfig.color} strokeWidth={0.5} />
            ))}
            {/* MGRS-style labels */}
            {gridConfig.id === 'mgrs' && Array.from({ length: Math.ceil(1000 / gridConfig.spacing) }, (_, i) => i).map(i => (
              <text key={`gl-${i}`} x={i * gridConfig.spacing + 4} y={12} fill={gridConfig.color} fontSize="7" fontFamily="var(--font-mono)" opacity={0.8}>
                {String.fromCharCode(65 + (i % 26))}{Math.floor(i / 26) || ''}
              </text>
            ))}
            {gridConfig.id === 'mgrs' && Array.from({ length: Math.ceil(1100 / gridConfig.spacing) }, (_, i) => i).map(i => (
              <text key={`gn-${i}`} x={4} y={i * gridConfig.spacing + 12} fill={gridConfig.color} fontSize="7" fontFamily="var(--font-mono)" opacity={0.8}>
                {i + 1}
              </text>
            ))}
          </g>
        )}

        {/* ═══ Rivers + Labels ═══ */}
        {showRivers && (
          <g pointerEvents="none">
            <defs>
              {region.rivers.map(r => (
                <path key={`erp-${r.id}`} id={`ed-river-${r.id}`} d={r.path} />
              ))}
            </defs>
            {region.rivers.map(r => (
              <g key={r.id}>
                <path d={r.path} fill="none" stroke="#4AA3DF" strokeWidth={Math.max(0.3, 1.2 / Math.sqrt(transform.zoom))} opacity={0.35} strokeLinecap="round" strokeLinejoin="round" />
                <text opacity={0.35} fill="#4AA3DF" fontSize={Math.max(2, 6 / Math.sqrt(transform.zoom))} fontFamily="var(--font-body)" fontStyle="italic">
                  <textPath href={`#ed-river-${r.id}`} startOffset="40%">{r.name}</textPath>
                </text>
              </g>
            ))}
          </g>
        )}

        {/* ═══ Clickable country outlines on tile views (non-added) ═══ */}
        {isTileStyle && region.countries.map((ct) => {
          if (state.countryIds.has(ct.id)) return null;
          const entry = realPathMap.get(ct.id);
          const svgPath = entry?.path ?? ct.path;
          return (
            <path key={`tile-${ct.id}`} d={svgPath}
              fill="rgba(255,255,255,0.03)" fillOpacity={1}
              stroke="rgba(255,255,255,0.15)" strokeWidth={0.5}
              className={activeTool === 'select' ? 'hover:fill-white/10 hover:stroke-white/40 transition-colors' : ''}
              pointerEvents={activeTool === 'select' ? 'auto' : 'none'}
              onClick={(e) => handleBgCountryClick(ct.id, e)}
              style={{ cursor: activeTool === 'select' ? 'pointer' : undefined }} />
          );
        })}

        {/* ═══ Content group for fitToContent BBox ═══ */}
        <g data-content-group="">
        {/* ═══ Countries (user-added) ═══ */}
        {state.countries.map((cc) => {
          const ct = region.countries.find((c) => c.id === cc.id);
          if (!ct) return null;
          const entry = realPathMap.get(ct.id);
          const svgPath = entry?.path ?? ct.path;
          const center = entry?.center ?? ct.labelPos;
          const isSel = state.selectedCountryId === cc.id;

          if (isTileStyle) {
            // Tile mode: No fill overlay — tiles show through via clip path
            return (
              <g key={cc.id} onClick={(e) => handleCountryClick(cc.id, e)}
                pointerEvents={activeTool === 'select' ? 'auto' : 'none'}
                style={{ cursor: activeTool === 'select' ? 'pointer' : undefined }}>
                <path d={svgPath} fill="transparent"
                  stroke={isSel ? '#FFD700' : cc.strokeColor || 'rgba(255,255,255,0.7)'}
                  strokeWidth={isSel ? 2.5 : Math.max(cc.strokeWidth, 1.2)}
                  strokeDasharray={cc.strokeDasharray} />
                {cc.labelVisible && showLabels && (
                  <text x={center[0]} y={center[1]} textAnchor="middle" dominantBaseline="central"
                    fill="white" fontSize={Math.max(4, 10 / Math.sqrt(Math.max(1, transform.zoom)))} fontFamily="var(--font-body)" fontWeight="600"
                    opacity={0.9} pointerEvents="none"
                    stroke="rgba(0,0,0,0.5)" strokeWidth={Math.max(1, 2.5 / Math.sqrt(Math.max(1, transform.zoom)))} paintOrder="stroke">{ct.name}</text>
                )}
              </g>
            );
          }

          const fillAttr = cc.fill.type === 'solid' ? cc.fill.color : `url(#fill-${cc.id})`;
          return (
            <g key={cc.id} onClick={(e) => handleCountryClick(cc.id, e)}
              pointerEvents={activeTool === 'select' ? 'auto' : 'none'}
              style={{ cursor: activeTool === 'select' ? 'pointer' : undefined }}>
              <path d={svgPath} fill={fillAttr} fillOpacity={cc.fill.opacity}
                stroke={isSel ? '#FFD700' : cc.strokeColor}
                strokeWidth={isSel ? 2.5 : cc.strokeWidth}
                strokeDasharray={cc.strokeDasharray} />
              {cc.labelVisible && showLabels && (
                <text x={center[0]} y={center[1]} textAnchor="middle" dominantBaseline="central"
                  fill="var(--ed-canvas-text)" fontSize={Math.max(4, 10 / Math.sqrt(Math.max(1, transform.zoom)))} fontFamily="var(--font-body)" fontWeight="500"
                  opacity={0.85} pointerEvents="none">{ct.name}</text>
              )}
            </g>
          );
        })}

        {/* ═══ Sub-Regions ═══ */}
        {(state.subRegions ?? []).map((sr) => {
          const isSel = state.selectedSubRegionId === sr.id;
          const fillAttr = sr.fill.type === 'solid' ? sr.fill.color : `url(#fill-sr-${sr.id})`;
          // Compute label position from path center
          const pathPoints = sr.path.match(/[\d.]+[, ][\d.]+/g);
          let cx = 0, cy = 0;
          if (pathPoints) {
            pathPoints.forEach(m => {
              const parts = m.split(/[, ]/);
              cx += parseFloat(parts[0]);
              cy += parseFloat(parts[1]);
            });
            cx /= pathPoints.length;
            cy /= pathPoints.length;
          }
          return (
            <g key={sr.id}
              onClick={(e) => { if (activeTool !== 'select') return; e.stopPropagation(); state.selectSubRegion(sr.id); }}
              style={{ cursor: activeTool === 'select' ? 'pointer' : undefined }}
              pointerEvents={activeTool === 'select' ? 'auto' : 'none'}>
              <path d={sr.path} fill={fillAttr} fillOpacity={sr.fill.opacity ?? 0.2}
                stroke={isSel ? '#FFD700' : sr.strokeColor}
                strokeWidth={isSel ? 2 : sr.strokeWidth}
                strokeDasharray={sr.strokeDasharray} />
              {sr.labelVisible && (
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                  fill="var(--ed-canvas-text)" fontSize={Math.max(3, 8 / Math.sqrt(Math.max(1, transform.zoom)))} fontFamily="var(--font-body)"
                  fontWeight="600" opacity={0.85} pointerEvents="none"
                  stroke="rgba(0,0,0,0.4)" strokeWidth={Math.max(0.5, 2 / Math.sqrt(Math.max(1, transform.zoom)))} paintOrder="stroke">
                  {sr.label}
                </text>
              )}
            </g>
          );
        })}

        {/* ═══ Admin Regions (pre-defined) ═══ */}
        {state.countries.map(cc => {
          if (!adminRegionsVisible.has(cc.id)) return null;
          const regionData = COUNTRY_ADMIN_REGIONS[cc.id];
          if (!regionData) return null;
          return regionData.regions.map(ar => {
            // Convert geo coords to SVG coords
            const svgCoords = ar.coords.map(([lon, lat]) => region.geoToSvg(lon, lat));
            const pathD = svgCoords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ') + ' Z';
            const center = region.geoToSvg(ar.center[0], ar.center[1]);
            return (
              <g key={ar.id} pointerEvents="none">
                <path d={pathD}
                  fill="rgba(255,255,255,0.04)"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={0.8}
                  strokeDasharray="3 2"
                />
                <text x={center[0]} y={center[1]}
                  textAnchor="middle" dominantBaseline="central"
                  fill="var(--ed-canvas-text, white)" fontSize={Math.max(2.5, 6 / Math.sqrt(Math.max(1, transform.zoom)))}
                  fontFamily="var(--font-body)" fontWeight="500"
                  opacity={0.6} pointerEvents="none"
                  stroke="rgba(0,0,0,0.5)" strokeWidth={Math.max(0.4, 1.5 / Math.sqrt(Math.max(1, transform.zoom)))} paintOrder="stroke"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {ar.name}
                </text>
              </g>
            );
          });
        })}

        {/* ═══ Capitals ═══ */}
        {showCapitals && canvasCountryData.map(cc => {
          const capFontSize = Math.max(3, 7 / Math.sqrt(Math.max(1, transform.zoom)));
          const capR = Math.max(1, 3 / Math.sqrt(Math.max(1, transform.zoom)));
          return (
            <g key={`cap-${cc.id}`} pointerEvents="none">
              <circle cx={cc.data.capitalCoords[0]} cy={cc.data.capitalCoords[1]} r={capR}
                fill="#FFD700" stroke="var(--ed-canvas-text)" strokeWidth={Math.max(0.2, 0.5 / Math.sqrt(Math.max(1, transform.zoom)))} opacity={0.85} />
              <text x={cc.data.capitalCoords[0] + capR + 2} y={cc.data.capitalCoords[1] + 1}
                fill="var(--ed-canvas-text)" fontSize={capFontSize} fontFamily="var(--font-body)" fontWeight="500" opacity={0.7}>
                {cc.data.capital}
              </text>
            </g>
          );
        })}

        {/* ═══ Airports ═══ */}
        {showAirports && canvasCountryData.map(cc => {
          const apR = Math.max(0.8, 2 / Math.sqrt(Math.max(1, transform.zoom)));
          const apFs = Math.max(2, 5.5 / Math.sqrt(Math.max(1, transform.zoom)));
          const apSw = Math.max(0.2, 0.8 / Math.sqrt(Math.max(1, transform.zoom)));
          return cc.data.airports.map(ap => (
            <g key={`ap-${cc.id}-${ap.name}`} pointerEvents="none">
              <circle cx={ap.coords[0]} cy={ap.coords[1]} r={apR}
                fill="none" stroke="#06B6D4" strokeWidth={apSw} opacity={0.65} />
              <line x1={ap.coords[0] - apR * 1.5} y1={ap.coords[1]} x2={ap.coords[0] + apR * 1.5} y2={ap.coords[1]}
                stroke="#06B6D4" strokeWidth={apSw * 0.6} opacity={0.5} />
              <line x1={ap.coords[0]} y1={ap.coords[1] - apR * 1.5} x2={ap.coords[0]} y2={ap.coords[1] + apR * 1.5}
                stroke="#06B6D4" strokeWidth={apSw * 0.6} opacity={0.5} />
              <text x={ap.coords[0] + apR + 2} y={ap.coords[1] + 1}
                fill="#06B6D4" fontSize={apFs} fontFamily="var(--font-mono)" opacity={0.55}>
                {ap.name}
              </text>
            </g>
          ));
        })}

        {/* ═══ Ports ═══ */}
        {showPorts && (
          <g pointerEvents="none">
            {region.ports.map(p => {
              const sz = Math.max(0.8, 2.5 / Math.sqrt(transform.zoom));
              const isMil = p.type === 'military' || p.type === 'dual';
              const color = p.type === 'military' ? '#EF4444' : p.type === 'dual' ? '#F59E0B' : '#06B6D4';
              return (
                <g key={`port-${p.id}`}>
                  <circle cx={p.coords[0]} cy={p.coords[1]} r={sz}
                    fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth={Math.max(0.1, 0.3 / Math.sqrt(transform.zoom))} />
                  {isMil && p.foreignUsers.length > 0 && (
                    <circle cx={p.coords[0]} cy={p.coords[1]} r={sz * 1.8}
                      fill="none" stroke={color} strokeWidth={Math.max(0.1, 0.2 / Math.sqrt(transform.zoom))} strokeDasharray={`${sz * 0.8} ${sz * 0.5}`} opacity={0.5} />
                  )}
                  {showLabels && (
                    <text x={p.coords[0] + sz + 1} y={p.coords[1] + 1}
                      fill={color} fontSize={Math.max(1.5, 4.5 / Math.sqrt(transform.zoom))} fontFamily="var(--font-body)" fontWeight={isMil ? 600 : 400} opacity={0.7} dominantBaseline="central">
                      {p.name}{p.foreignUsers.length > 0 ? ` [${p.foreignUsers.map(f => f.country).join(',')}]` : ''}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* ═══ Elements ═══ */}
        {sortedElements.map((el) => {
          const phaseOp = elementPhaseOpacity.get(el.id) ?? 1;
          if (phaseOp <= 0) return null;
          const rendered = renderElement(el, state, handleElementMouseDown, region.accentHex, activeTool, transform.zoom);
          if (!rendered) return null;
          const phaseTag = el.timelinePhase || 'global';
          return (
            <g key={`phase-wrap-${el.id}`} data-phase-wrap={phaseTag} style={{ opacity: phaseOp, transition: 'opacity 0.4s ease' }}>
              {rendered}
            </g>
          );
        })}

        </g>{/* end content-group */}

        {/* ═══ LIVE: Freehand Preview ═══ */}
        {drawingPoints.length > 1 && (
          <path d={pointsToSmoothPath(drawingPoints)} fill="none"
            stroke={activeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            opacity={0.8} pointerEvents="none" />
        )}

        {/* ═══ LIVE: Drag-to-Create Preview ═══ */}
        {dragCreate && (() => {
          const { startX, startY, curX, curY } = dragCreate;
          const cx = (startX + curX) / 2;
          const cy = (startY + curY) / 2;
          const w = Math.abs(curX - startX);
          const h = Math.abs(curY - startY);

          if (activeTool === 'rect') {
            return <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={4}
              fill={activeColor} fillOpacity={0.15} stroke={activeColor} strokeWidth={2}
              strokeDasharray="6 3" pointerEvents="none" />;
          }
          if (activeTool === 'ellipse') {
            return <ellipse cx={cx} cy={cy} rx={w / 2} ry={h / 2}
              fill={activeColor} fillOpacity={0.15} stroke={activeColor} strokeWidth={2}
              strokeDasharray="6 3" pointerEvents="none" />;
          }
          if (activeTool === 'line') {
            return <line x1={startX} y1={startY} x2={curX} y2={curY}
              stroke={activeColor} strokeWidth={2} strokeDasharray="6 3"
              strokeLinecap="round" pointerEvents="none" />;
          }
          if (activeTool === 'arrow') {
            return (
              <g style={{ color: activeColor }} pointerEvents="none">
                <line x1={startX} y1={startY} x2={curX} y2={curY}
                  stroke={activeColor} strokeWidth={2} strokeLinecap="round"
                  markerEnd="url(#mk-arrow)" />
              </g>
            );
          }
          return null;
        })()}

        {/* ═══ LIVE: Point Tool Preview ═══ */}
        {tempPoints.length > 0 && (
          <g pointerEvents="none">
            {(activeTool === 'curved-arrow')
              ? <path d={pointsToCurvedArrow(cursorPos ? [...tempPoints, [cursorPos.x, cursorPos.y]] : tempPoints)}
                  fill="none" stroke={activeColor} strokeWidth={2} strokeDasharray="6 3" opacity={0.7}
                  markerEnd="url(#mk-arrow)" style={{ color: activeColor }} />
              : (activeTool === 'frontline' || activeTool === 'supply-route')
              ? <path d={pointsToSmoothPath(cursorPos ? [...tempPoints, [cursorPos.x, cursorPos.y]] : tempPoints)}
                  fill="none" stroke={activeColor} strokeWidth={activeTool === 'supply-route' ? 2 : 2.5}
                  strokeDasharray={activeTool === 'supply-route' ? '8 4 2 4' : '6 3'} opacity={0.7} />
              : <polygon
                  points={(cursorPos ? [...tempPoints, [cursorPos.x, cursorPos.y]] : tempPoints).map((p) => p.join(',')).join(' ')}
                  fill={activeColor} fillOpacity={0.1}
                  stroke={activeColor} strokeWidth={2} strokeDasharray="6 3" opacity={0.7} />
            }
            {tempPoints.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r={4 / transform.zoom}
                fill={activeColor} stroke="white" strokeWidth={1 / transform.zoom} />
            ))}
            {cursorPos && tempPoints.length > 0 && (
              <line x1={tempPoints[tempPoints.length - 1][0]} y1={tempPoints[tempPoints.length - 1][1]}
                x2={cursorPos.x} y2={cursorPos.y}
                stroke={activeColor} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
            )}
            {tempPoints.length >= 1 && cursorPos && (
              <text x={cursorPos.x + 10 / transform.zoom} y={cursorPos.y - 10 / transform.zoom}
                fill={activeColor} fontSize={10 / transform.zoom} fontFamily="var(--font-mono)" opacity={0.6}>
                {tempPoints.length} Pkt · Doppelklick = fertig
              </text>
            )}
          </g>
        )}

        {/* ═══ Drag-Create Size Hint ═══ */}
        {dragCreate && cursorPos && (
          <text x={dragCreate.curX + 8 / transform.zoom} y={dragCreate.curY - 8 / transform.zoom}
            fill="var(--ed-canvas-text-muted)" fontSize={9 / transform.zoom} fontFamily="var(--font-mono)" pointerEvents="none">
            {Math.round(Math.abs(dragCreate.curX - dragCreate.startX))} × {Math.round(Math.abs(dragCreate.curY - dragCreate.startY))}
          </text>
        )}

        {/* ═══ Persistent Measurements ═══ */}
        {measurements.map((m) => {
          const fs = Math.max(3, 10 / Math.sqrt(transform.zoom));
          const sw = Math.max(0.5, 1.5 / Math.sqrt(transform.zoom));
          const dash = `${4/Math.sqrt(transform.zoom)} ${3/Math.sqrt(transform.zoom)}`;
          const dotR = Math.max(1, 3 / Math.sqrt(transform.zoom));
          const dotSW = Math.max(0.2, 0.5 / Math.sqrt(transform.zoom));
          const xBtnR = Math.max(3, 7 / Math.sqrt(transform.zoom));

          if (m.type === 'measure') {
            const km = svgDistanceKm(m.start.x, m.start.y, m.end.x, m.end.y, region.svgToGeo);
            const label = formatDistance(km);
            const [lon1, lat1] = region.svgToGeo(m.start.x, m.start.y);
            const [lon2, lat2] = region.svgToGeo(m.end.x, m.end.y);
            const brng = bearingDeg(lon1, lat1, lon2, lat2);
            const cardinal = bearingToCardinal(brng);
            const mx = (m.start.x + m.end.x) / 2;
            const my = (m.start.y + m.end.y) / 2;
            return (
              <g key={m.id}>
                <line x1={m.start.x} y1={m.start.y} x2={m.end.x} y2={m.end.y}
                  stroke="#FF6B6B" strokeWidth={sw} strokeDasharray={dash} pointerEvents="none" />
                <circle cx={m.start.x} cy={m.start.y} r={dotR}
                  fill="#FF6B6B" stroke="white" strokeWidth={dotSW} pointerEvents="none" />
                <circle cx={m.end.x} cy={m.end.y} r={dotR}
                  fill="#FF6B6B" stroke="white" strokeWidth={dotSW} pointerEvents="none" />
                <rect x={mx - fs * 4.5} y={my - fs * 1.5} width={fs * 9} height={fs * 3} rx={fs * 0.3}
                  fill="rgba(0,0,0,0.75)" pointerEvents="none" />
                <text x={mx} y={my - fs * 0.3} textAnchor="middle" dominantBaseline="central"
                  fill="#FF6B6B" fontSize={fs} fontFamily="var(--font-mono)" fontWeight="600" pointerEvents="none">
                  {label}
                </text>
                <text x={mx} y={my + fs * 0.9} textAnchor="middle" dominantBaseline="central"
                  fill="#FF9B9B" fontSize={fs * 0.75} fontFamily="var(--font-mono)" fontWeight="500" pointerEvents="none">
                  {brng.toFixed(1)}° {cardinal}
                </text>
                {/* Remove button */}
                <circle cx={m.end.x + xBtnR * 1.5} cy={m.end.y - xBtnR * 1.5} r={xBtnR}
                  fill="rgba(0,0,0,0.65)" stroke="#FF6B6B" strokeWidth={dotSW}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); removeMeasurement(m.id); }} />
                <text x={m.end.x + xBtnR * 1.5} y={m.end.y - xBtnR * 1.5 + xBtnR * 0.15}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#FF6B6B" fontSize={xBtnR * 1.3} fontFamily="var(--font-mono)" fontWeight="700"
                  style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                  x
                </text>
              </g>
            );
          } else if (m.type === 'radius') {
            const km = svgDistanceKm(m.start.x, m.start.y, m.end.x, m.end.y, region.svgToGeo);
            const label = formatDistance(km);
            const dx = m.end.x - m.start.x;
            const dy = m.end.y - m.start.y;
            const svgR = Math.sqrt(dx * dx + dy * dy);
            return (
              <g key={m.id}>
                <circle cx={m.start.x} cy={m.start.y} r={svgR}
                  fill="rgba(100,180,255,0.08)" stroke="#64B4FF" strokeWidth={sw} strokeDasharray={dash} pointerEvents="none" />
                <line x1={m.start.x} y1={m.start.y} x2={m.end.x} y2={m.end.y}
                  stroke="#64B4FF" strokeWidth={Math.max(0.3, 0.8 / Math.sqrt(transform.zoom))} pointerEvents="none" />
                <circle cx={m.start.x} cy={m.start.y} r={Math.max(1, 2.5 / Math.sqrt(transform.zoom))}
                  fill="#64B4FF" stroke="white" strokeWidth={dotSW} pointerEvents="none" />
                <rect x={m.start.x + svgR * 0.05} y={m.start.y - svgR - fs * 2} width={fs * 6} height={fs * 1.6} rx={fs * 0.3}
                  fill="rgba(0,0,0,0.7)" pointerEvents="none" />
                <text x={m.start.x + svgR * 0.05 + fs * 3} y={m.start.y - svgR - fs * 1.2 + fs * 0.15}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#64B4FF" fontSize={fs} fontFamily="var(--font-mono)" fontWeight="600" pointerEvents="none">
                  r = {label}
                </text>
                {/* Remove button */}
                <circle cx={m.start.x + svgR + xBtnR * 1.5} cy={m.start.y} r={xBtnR}
                  fill="rgba(0,0,0,0.65)" stroke="#64B4FF" strokeWidth={dotSW}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); removeMeasurement(m.id); }} />
                <text x={m.start.x + svgR + xBtnR * 1.5} y={m.start.y + xBtnR * 0.15}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#64B4FF" fontSize={xBtnR * 1.3} fontFamily="var(--font-mono)" fontWeight="700"
                  style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                  x
                </text>
              </g>
            );
          } else if (m.type === 'polygon-area' && m.points && m.points.length >= 3) {
            const geoCoords: [number, number][] = m.points.map(p => region.svgToGeo(p.x, p.y) as [number, number]);
            const area = sphericalPolygonAreaKm2(geoCoords);
            const label = formatArea(area);
            const cx = m.points.reduce((s, p) => s + p.x, 0) / m.points.length;
            const cy = m.points.reduce((s, p) => s + p.y, 0) / m.points.length;
            const pathD = m.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ') + ' Z';
            return (
              <g key={m.id}>
                <path d={pathD} fill="rgba(76,217,100,0.1)" stroke="#4CD964" strokeWidth={sw} strokeDasharray={dash} pointerEvents="none" />
                {m.points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={dotR} fill="#4CD964" stroke="white" strokeWidth={dotSW} pointerEvents="none" />
                ))}
                <rect x={cx - fs * 3.5} y={cy - fs * 0.8} width={fs * 7} height={fs * 1.6} rx={fs * 0.3}
                  fill="rgba(0,0,0,0.75)" pointerEvents="none" />
                <text x={cx} y={cy + fs * 0.15} textAnchor="middle" dominantBaseline="central"
                  fill="#4CD964" fontSize={fs} fontFamily="var(--font-mono)" fontWeight="600" pointerEvents="none">
                  {label}
                </text>
                {/* Remove */}
                <circle cx={m.points[0].x + xBtnR * 1.5} cy={m.points[0].y - xBtnR * 1.5} r={xBtnR}
                  fill="rgba(0,0,0,0.65)" stroke="#4CD964" strokeWidth={dotSW}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); removeMeasurement(m.id); }} />
                <text x={m.points[0].x + xBtnR * 1.5} y={m.points[0].y - xBtnR * 1.5 + xBtnR * 0.15}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#4CD964" fontSize={xBtnR * 1.3} fontFamily="var(--font-mono)" fontWeight="700"
                  style={{ cursor: 'pointer', pointerEvents: 'none' }}>x</text>
              </g>
            );
          } else if (m.type === 'multi-segment' && m.points && m.points.length >= 2) {
            const geoCoords: [number, number][] = m.points.map(p => region.svgToGeo(p.x, p.y) as [number, number]);
            const totalKm = pathDistanceKm(geoCoords);
            const segs = segmentDistancesKm(geoCoords);
            const pathD = m.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
            return (
              <g key={m.id}>
                <path d={pathD} fill="none" stroke="#FFD60A" strokeWidth={sw} strokeDasharray={dash} pointerEvents="none" />
                {m.points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={dotR} fill="#FFD60A" stroke="white" strokeWidth={dotSW} pointerEvents="none" />
                ))}
                {/* Segment labels */}
                {segs.map((segKm, i) => {
                  const mx = (m.points![i].x + m.points![i + 1].x) / 2;
                  const my = (m.points![i].y + m.points![i + 1].y) / 2;
                  return (
                    <text key={`seg-${i}`} x={mx} y={my - fs * 0.5} textAnchor="middle" dominantBaseline="central"
                      fill="#FFD60A" fontSize={fs * 0.7} fontFamily="var(--font-mono)" fontWeight="500" pointerEvents="none"
                      stroke="rgba(0,0,0,0.6)" strokeWidth={fs * 0.15} paintOrder="stroke">
                      {formatDistance(segKm)}
                    </text>
                  );
                })}
                {/* Total label at last point */}
                {(() => {
                  const lp = m.points![m.points!.length - 1];
                  return (
                    <>
                      <rect x={lp.x + dotR * 2} y={lp.y - fs * 0.8} width={fs * 7} height={fs * 1.6} rx={fs * 0.3}
                        fill="rgba(0,0,0,0.75)" pointerEvents="none" />
                      <text x={lp.x + dotR * 2 + fs * 3.5} y={lp.y + fs * 0.15} textAnchor="middle" dominantBaseline="central"
                        fill="#FFD60A" fontSize={fs} fontFamily="var(--font-mono)" fontWeight="600" pointerEvents="none">
                        Σ {formatDistance(totalKm)}
                      </text>
                    </>
                  );
                })()}
                {/* Remove */}
                <circle cx={m.points[0].x + xBtnR * 1.5} cy={m.points[0].y - xBtnR * 1.5} r={xBtnR}
                  fill="rgba(0,0,0,0.65)" stroke="#FFD60A" strokeWidth={dotSW}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); removeMeasurement(m.id); }} />
                <text x={m.points[0].x + xBtnR * 1.5} y={m.points[0].y - xBtnR * 1.5 + xBtnR * 0.15}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#FFD60A" fontSize={xBtnR * 1.3} fontFamily="var(--font-mono)" fontWeight="700"
                  style={{ cursor: 'pointer', pointerEvents: 'none' }}>x</text>
              </g>
            );
          }
          return null;
        })}

        {/* ═══ LIVE Measure Preview ═══ */}
        {measureStart && measureEnd && activeTool === 'measure' && (() => {
          const km = svgDistanceKm(measureStart.x, measureStart.y, measureEnd.x, measureEnd.y, region.svgToGeo);
          const [lon1, lat1] = region.svgToGeo(measureStart.x, measureStart.y);
          const [lon2, lat2] = region.svgToGeo(measureEnd.x, measureEnd.y);
          const brng = bearingDeg(lon1, lat1, lon2, lat2);
          const cardinal = bearingToCardinal(brng);
          const mx = (measureStart.x + measureEnd.x) / 2;
          const my = (measureStart.y + measureEnd.y) / 2;
          const fs = Math.max(3, 10 / Math.sqrt(transform.zoom));
          return (
            <g pointerEvents="none">
              <line x1={measureStart.x} y1={measureStart.y} x2={measureEnd.x} y2={measureEnd.y}
                stroke="#FF6B6B" strokeWidth={Math.max(0.5, 1.5 / Math.sqrt(transform.zoom))} strokeDasharray={`${4/Math.sqrt(transform.zoom)} ${3/Math.sqrt(transform.zoom)}`} />
              <circle cx={measureStart.x} cy={measureStart.y} r={Math.max(1, 3 / Math.sqrt(transform.zoom))}
                fill="#FF6B6B" stroke="white" strokeWidth={Math.max(0.2, 0.5 / Math.sqrt(transform.zoom))} />
              <circle cx={measureEnd.x} cy={measureEnd.y} r={Math.max(1, 3 / Math.sqrt(transform.zoom))}
                fill="#FF6B6B" stroke="white" strokeWidth={Math.max(0.2, 0.5 / Math.sqrt(transform.zoom))} />
              <rect x={mx - fs * 4.5} y={my - fs * 1.5} width={fs * 9} height={fs * 3} rx={fs * 0.3}
                fill="rgba(0,0,0,0.75)" />
              <text x={mx} y={my - fs * 0.3} textAnchor="middle" dominantBaseline="central"
                fill="#FF6B6B" fontSize={fs} fontFamily="var(--font-mono)" fontWeight="600">
                {formatDistance(km)}
              </text>
              <text x={mx} y={my + fs * 0.9} textAnchor="middle" dominantBaseline="central"
                fill="#FF9B9B" fontSize={fs * 0.75} fontFamily="var(--font-mono)" fontWeight="500">
                {brng.toFixed(1)}° {cardinal}
              </text>
            </g>
          );
        })()}

        {/* ═══ LIVE Radius Preview ═══ */}
        {radiusCenter && radiusEnd && activeTool === 'radius' && (() => {
          const km = svgDistanceKm(radiusCenter.x, radiusCenter.y, radiusEnd.x, radiusEnd.y, region.svgToGeo);
          const dx = radiusEnd.x - radiusCenter.x;
          const dy = radiusEnd.y - radiusCenter.y;
          const svgR = Math.sqrt(dx * dx + dy * dy);
          const fs = Math.max(3, 10 / Math.sqrt(transform.zoom));
          return (
            <g pointerEvents="none">
              <circle cx={radiusCenter.x} cy={radiusCenter.y} r={svgR}
                fill="rgba(100,180,255,0.08)" stroke="#64B4FF" strokeWidth={Math.max(0.5, 1.5 / Math.sqrt(transform.zoom))} strokeDasharray={`${4/Math.sqrt(transform.zoom)} ${3/Math.sqrt(transform.zoom)}`} />
              <line x1={radiusCenter.x} y1={radiusCenter.y} x2={radiusEnd.x} y2={radiusEnd.y}
                stroke="#64B4FF" strokeWidth={Math.max(0.3, 0.8 / Math.sqrt(transform.zoom))} />
              <circle cx={radiusCenter.x} cy={radiusCenter.y} r={Math.max(1, 2.5 / Math.sqrt(transform.zoom))}
                fill="#64B4FF" stroke="white" strokeWidth={Math.max(0.2, 0.5 / Math.sqrt(transform.zoom))} />
              <rect x={radiusCenter.x + svgR * 0.05} y={radiusCenter.y - svgR - fs * 2} width={fs * 6} height={fs * 1.6} rx={fs * 0.3}
                fill="rgba(0,0,0,0.7)" />
              <text x={radiusCenter.x + svgR * 0.05 + fs * 3} y={radiusCenter.y - svgR - fs * 1.2 + fs * 0.15}
                textAnchor="middle" dominantBaseline="central"
                fill="#64B4FF" fontSize={fs} fontFamily="var(--font-mono)" fontWeight="600">
                r = {km < 1 ? `${Math.round(km * 1000)} m` : km < 100 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`}
              </text>
            </g>
          );
        })()}

        {/* ═══ LIVE Polygon-Area / Multi-Segment Preview ═══ */}
        {isClickMeasureTool && measurePoints.length > 0 && cursorPos && (() => {
          const pts = [...measurePoints, cursorPos];
          const fs = Math.max(3, 10 / Math.sqrt(transform.zoom));
          const dotR = Math.max(1, 3 / Math.sqrt(transform.zoom));
          const dotSW = Math.max(0.2, 0.5 / Math.sqrt(transform.zoom));
          const sw = Math.max(0.5, 1.5 / Math.sqrt(transform.zoom));
          const dashStr = `${4/Math.sqrt(transform.zoom)} ${3/Math.sqrt(transform.zoom)}`;
          const color = activeTool === 'polygon-area' ? '#4CD964' : '#FFD60A';

          if (activeTool === 'polygon-area') {
            const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ') + ' Z';
            const geoCoords: [number, number][] = pts.map(p => region.svgToGeo(p.x, p.y) as [number, number]);
            const area = pts.length >= 3 ? sphericalPolygonAreaKm2(geoCoords) : 0;
            const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
            const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
            return (
              <g pointerEvents="none">
                <path d={pathD} fill="rgba(76,217,100,0.08)" stroke={color} strokeWidth={sw} strokeDasharray={dashStr} />
                {pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={dotR} fill={color} stroke="white" strokeWidth={dotSW} />
                ))}
                {pts.length >= 3 && (
                  <>
                    <rect x={cx - fs * 3.5} y={cy - fs * 0.8} width={fs * 7} height={fs * 1.6} rx={fs * 0.3} fill="rgba(0,0,0,0.7)" />
                    <text x={cx} y={cy + fs * 0.15} textAnchor="middle" dominantBaseline="central"
                      fill={color} fontSize={fs} fontFamily="var(--font-mono)" fontWeight="600">
                      {formatArea(area)}
                    </text>
                  </>
                )}
              </g>
            );
          } else {
            // multi-segment
            const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
            const geoCoords: [number, number][] = pts.map(p => region.svgToGeo(p.x, p.y) as [number, number]);
            const totalKm = pathDistanceKm(geoCoords);
            return (
              <g pointerEvents="none">
                <path d={pathD} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={dashStr} />
                {pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={dotR} fill={color} stroke="white" strokeWidth={dotSW} />
                ))}
                <rect x={cursorPos.x + dotR * 2} y={cursorPos.y - fs * 0.8} width={fs * 7} height={fs * 1.6} rx={fs * 0.3} fill="rgba(0,0,0,0.7)" />
                <text x={cursorPos.x + dotR * 2 + fs * 3.5} y={cursorPos.y + fs * 0.15} textAnchor="middle" dominantBaseline="central"
                  fill={color} fontSize={fs} fontFamily="var(--font-mono)" fontWeight="600">
                  Σ {formatDistance(totalKm)}
                </text>
              </g>
            );
          }
        })()}

        {/* ═══ Selection Box ═══ */}
        {state.selectedElementIds.size === 1 && (() => {
          const el = state.elements.find((e) => state.selectedElementIds.has(e.id));
          if (!el) return null;
          const bx = el.x - (el.width || 20) / 2 - 4;
          const by = el.y - (el.height || 20) / 2 - 4;
          const bw = (el.width || 20) + 8;
          const bh = (el.height || 20) + 8;
          return (
            <rect x={bx} y={by} width={bw} height={bh} rx={2}
              fill="none" stroke="#FFD700" strokeWidth={1} strokeDasharray="4 2"
              pointerEvents="none" opacity={0.6} />
          );
        })()}

        {/* ═══ Compass Rose ═══ */}
        {showCompass && (
          <g transform="translate(940, 70)" opacity="0.6">
            <circle r="24" fill="var(--ed-overlay-bg)" stroke="var(--ed-overlay-border)" strokeWidth="0.5" />
            <line x1="0" y1="18" x2="0" y2="-18" stroke="var(--ed-canvas-text-muted)" strokeWidth="0.8" />
            <line x1="-18" y1="0" x2="18" y2="0" stroke="var(--ed-canvas-text-muted)" strokeWidth="0.4" opacity="0.5" />
            <polygon points="0,-20 -5,-8 0,-11 5,-8" fill={region.accentHex} />
            <polygon points="0,20 -5,8 0,11 5,8" fill="var(--ed-canvas-text-muted)" opacity="0.3" />
            <text y="-26" textAnchor="middle" fill={region.accentHex} fontSize="10" fontWeight="700" fontFamily="var(--font-display)">N</text>
            <text y="34" textAnchor="middle" fill="var(--ed-canvas-text-muted)" fontSize="6" fontFamily="var(--font-mono)">S</text>
            <text x="28" y="3" textAnchor="middle" fill="var(--ed-canvas-text-muted)" fontSize="6" fontFamily="var(--font-mono)">O</text>
            <text x="-28" y="3" textAnchor="middle" fill="var(--ed-canvas-text-muted)" fontSize="6" fontFamily="var(--font-mono)">W</text>
          </g>
        )}

        {/* ═══ Title Bar ═══ */}
        {showTitle && mapTitle && (() => {
          const vb = transform.viewBox.split(' ').map(Number);
          const [vx, , vw] = vb;
          const barH = 45 / transform.zoom;
          const fontSize = Math.max(8, 14 / transform.zoom);
          const py = transform.panY;
          return (
            <g pointerEvents="none">
              <rect x={vx} y={py} width={vw} height={barH} fill={titleColor} />
              <text x={vx + 10 / transform.zoom} y={py + barH * 0.62}
                fill="#fff" fontSize={fontSize} fontWeight="700" fontFamily="var(--font-display)"
                dominantBaseline="central">
                {mapTitle}
              </text>
            </g>
          );
        })()}

        {/* ═══ Legend ═══ */}
        {showLegend && legendEntries.length > 0 && (() => {
          const boxH = 30 + legendEntries.length * 22;
          return (
            <g transform={`translate(30, ${1100 - boxH - 30})`}>
              <rect width="180" height={boxH} rx="6" fill="var(--ed-overlay-bg)" stroke="var(--ed-overlay-border)" strokeWidth="0.5" />
              <text x="12" y="18" fill="var(--ed-canvas-text)" fontSize="9" fontWeight="600" fontFamily="var(--font-display)">{legendTitle}</text>
              <line x1="10" y1="24" x2="170" y2="24" stroke="var(--ed-overlay-border)" strokeWidth="0.5" />
              {legendEntries.map((entry, i) => (
                <g key={entry.id} transform={`translate(12, ${32 + i * 22})`}>
                  {entry.symbol === 'circle' ? (
                    <circle cx={6} cy={6} r={6} fill={entry.color} fillOpacity={0.8} />
                  ) : entry.symbol === 'line' ? (
                    <line x1={0} y1={6} x2={12} y2={6} stroke={entry.color} strokeWidth={2.5} strokeLinecap="round" />
                  ) : entry.symbol === 'pattern' ? (
                    <rect width="12" height="12" rx="2" fill={entry.color} fillOpacity={0.4} stroke={entry.color} strokeWidth={0.5} strokeDasharray="2 1" />
                  ) : (
                    <rect width="12" height="12" rx="2" fill={entry.color} fillOpacity={0.8} />
                  )}
                  <text x="18" y="10" fill="var(--ed-canvas-text-muted)" fontSize="8" fontFamily="var(--font-body)">{entry.label}</text>
                </g>
              ))}
            </g>
          );
        })()}

        {/* ═══ Empty State ═══ */}
        {state.countries.length === 0 && state.elements.length === 0 && (
          <text x="500" y="550" textAnchor="middle" fill="var(--ed-text-dim)" fontSize="16" fontFamily="var(--font-display)">
            Wähle Länder links und klicke &quot;hinzufügen&quot;
          </text>
        )}

        {/* ═══ Crosshair at cursor ═══ */}
        {cursorPos && transform.zoom > 2 && (
          <g pointerEvents="none" opacity={0.25}>
            {(() => {
              const parts = transform.viewBox.split(' ').map(Number);
              return (<>
                <line x1={cursorPos.x} y1={parts[1]} x2={cursorPos.x} y2={parts[1] + parts[3]}
                  stroke="var(--ed-canvas-text-muted)" strokeWidth={0.3 / transform.zoom} strokeDasharray={`${2/transform.zoom} ${3/transform.zoom}`} />
                <line x1={parts[0]} y1={cursorPos.y} x2={parts[0] + parts[2]} y2={cursorPos.y}
                  stroke="var(--ed-canvas-text-muted)" strokeWidth={0.3 / transform.zoom} strokeDasharray={`${2/transform.zoom} ${3/transform.zoom}`} />
              </>);
            })()}
          </g>
        )}
        {/* ═══ Collab Cursors ═══ */}
        {collabUsers.length > 0 && <CollabCursors users={collabUsers} />}
      </svg>

      {/* ═══ Inset Map ═══ */}
      <InsetMap state={state} viewBox={transform.viewBox} zoom={transform.zoom} />

      {/* ═══ Zoom Controls ═══ */}
      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 20 }}>
        <button onClick={transform.zoomIn} style={zoomBtnStyle}>+</button>
        <button onClick={transform.zoomOut} style={zoomBtnStyle}>−</button>
        <button onClick={transform.resetView} style={{ ...zoomBtnStyle, fontSize: 9 }}>1:1</button>
      </div>
      <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 10, fontFamily: 'monospace', color: 'var(--ed-text-muted)', zIndex: 20 }}>
        {transform.zoom >= 1000 ? `${(transform.zoom/1000).toFixed(1)}k` : Math.round(transform.zoom * 100) + '%'}
      </div>
      {snapToGrid && (gridConfig?.spacing ?? 0) > 0 && (
        <div style={{
          position: 'absolute', top: 28, right: 12, fontSize: 9, fontFamily: 'var(--font-mono)',
          color: 'var(--accent-hex)', zIndex: 20, padding: '2px 6px', borderRadius: 6,
          border: '1px solid color-mix(in srgb, var(--accent-hex) 40%, transparent)',
          background: 'color-mix(in srgb, var(--accent-hex) 12%, var(--ed-overlay-bg))',
        }}>
          SNAP {gridConfig?.spacing}
        </div>
      )}

      {/* ═══ Coordinate Display + Copy ═══ */}
      {cursorPos && (() => {
        const [lon, lat] = region.svgToGeo(cursorPos.x, cursorPos.y);
        const latDir = lat >= 0 ? 'N' : 'S';
        const lonDir = lon >= 0 ? 'E' : 'W';
        const coordStr = `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
        return (
          <div style={{ position: 'absolute', bottom: 12, left: 12, padding: '3px 8px', borderRadius: 6, background: 'var(--ed-overlay-bg)', border: '1px solid var(--ed-overlay-border)', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ed-canvas-text-muted)', zIndex: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ pointerEvents: 'none' }}>{coordStr}</span>
            <button onClick={() => navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lon.toFixed(6)}`)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ed-icon-dim)', fontSize: 9, padding: '0 2px' }}
              title="Koordinaten kopieren">📋</button>
          </div>
        );
      })()}

      {/* ═══ Measurements Counter + Clear ═══ */}
      {measurements.length > 0 && (
        <div style={{
          position: 'absolute', top: 8, left: 12, padding: '4px 8px', borderRadius: 6,
          background: 'var(--ed-overlay-bg)', border: '1px solid var(--ed-overlay-border)',
          fontSize: 10, color: 'var(--ed-canvas-text-muted)', zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)',
        }}>
          <span>{measurements.length} Messung{measurements.length > 1 ? 'en' : ''}</span>
          <button onClick={clearAllMeasurements}
            style={{
              background: 'rgba(255,100,100,0.15)', border: '1px solid rgba(255,100,100,0.3)',
              borderRadius: 4, padding: '1px 6px', color: '#FF6B6B', fontSize: 9,
              cursor: 'pointer', fontFamily: 'var(--font-mono)',
            }}>
            Alle entfernen
          </button>
        </div>
      )}

      {/* ═══ Active Phase Indicator ═══ */}
      {timelinePhases.length > 0 && activePhaseId && (() => {
        const phase = timelinePhases.find(p => p.id === activePhaseId);
        if (!phase) return null;
        const hiddenCount = state.elements.filter(el => el.timelinePhase && el.timelinePhase !== activePhaseId).length;
        return (
          <div style={{
            position: 'absolute', top: 8, left: 12, padding: '4px 10px', borderRadius: 6,
            background: 'rgba(0,0,0,0.75)', border: `1px solid ${phase.color}40`,
            backdropFilter: 'blur(4px)', zIndex: 20,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: phase.color, boxShadow: `0 0 6px ${phase.color}60` }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: phase.color, fontFamily: 'var(--font-display)' }}>
              {phase.label}
            </span>
            {hiddenCount > 0 && (
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
                ({hiddenCount} ausgeblendet)
              </span>
            )}
          </div>
        );
      })()}

      {/* ═══ Active Tool Banner ═══ */}
      {activeTool !== 'select' && activeTool !== 'pan' && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          padding: '6px 16px', borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.75))',
          border: `1px solid color-mix(in srgb, ${activeColor} 40%, transparent)`,
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', gap: 10, zIndex: 20,
          boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px color-mix(in srgb, ${activeColor} 15%, transparent)`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: activeColor,
            boxShadow: `0 0 8px ${activeColor}80`,
            animation: 'pulse 1.5s infinite',
          }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'white', fontFamily: 'var(--font-display)' }}>
            {activeTool === 'freehand' ? 'Freihand' :
             activeTool === 'rect' ? 'Rechteck' :
             activeTool === 'ellipse' ? 'Ellipse' :
             activeTool === 'line' ? 'Linie' :
             activeTool === 'arrow' ? 'Pfeil' :
             activeTool === 'curved-arrow' ? 'Kurvenpfeil' :
             activeTool === 'polygon' ? 'Polygon' :
             activeTool === 'zone' ? 'Zone' :
             activeTool === 'frontline' ? 'Frontlinie' :
             activeTool === 'text' ? 'Text' :
             activeTool === 'callout' ? 'Callout' :
             activeTool === 'marker' ? 'Marker' :
             activeTool === 'military-unit' ? 'Mil. Einheit' :
             activeTool === 'range-circle' ? 'Reichweite' :
             activeTool === 'supply-route' ? 'Versorgung' :
             activeTool === 'heatmap-point' ? 'Heatmap' :
             activeTool === 'sub-region' ? 'Sub-Region' :
             activeTool === 'measure' ? 'Messen' :
             activeTool === 'radius' ? 'Radius' :
             activeTool === 'polygon-area' ? 'Fläche' :
             activeTool === 'multi-segment' ? 'Pfad' :
             activeTool === 'image-pin' ? 'Foto-Pin' :
             activeTool === 'route' ? 'Route' :
             activeTool}
          </span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>
            {activeTool === 'freehand' ? 'Maustaste halten & zeichnen' :
             isDragCreateTool ? 'Klick & ziehen (Shift = Achse/Form, Alt = kein Snap)' :
             isPointTool ? 'Klick = Punkt · Doppelklick = fertig' :
             activeTool === 'text' ? (textInput ? 'Klick zum Platzieren' : 'Text unten eingeben') :
             activeTool === 'callout' ? 'Klick zum Platzieren der Callout-Box' :
             (activeTool === 'marker' || activeTool === 'military-unit' || activeTool === 'range-circle' || activeTool === 'heatmap-point' || activeTool === 'image-pin') ? 'Klick zum Platzieren' :
             activeTool === 'route' ? 'Klick = Wegpunkt setzen' :
             isClickMeasureTool ? 'Klick = Punkt · Doppelklick = fertig' :
             isMeasureTool ? 'Klick & ziehen' : ''}
          </span>
          <button onClick={() => { setActiveTool('select'); setMeasurePoints([]); }} title="Abbrechen (ESC)"
            style={{
              padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)',
              fontSize: 9, fontFamily: 'var(--font-mono)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
            ESC
          </button>
        </div>
      )}

      {/* ═══ Image Pin Modal ═══ */}
      {viewingImagePin && (() => {
        const el = state.elements.find(e => e.id === viewingImagePin);
        if (!el) return null;
        return (
          <ImagePinModal
            element={el}
            onClose={() => setViewingImagePin(null)}
            onUpdate={(id, changes) => state.updateElement(id, changes)}
            onDelete={(id) => { state.removeElement(id); setViewingImagePin(null); }}
          />
        );
      })()}

      {/* ═══ Coordinate Display ═══ */}
      {cursorPos && (
        <div style={{
          position: 'absolute', bottom: activeTool !== 'select' && activeTool !== 'pan' ? 44 : 10, left: 10,
          background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '3px 8px',
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.7)',
          pointerEvents: 'none', zIndex: 10,
        }}>
          {formatCoord(...(region.svgToGeo(cursorPos.x, cursorPos.y) as [number, number]), coordFormat)}
        </div>
      )}
    </div>
  );
}

// ─── Element Renderer ───
function renderElement(el: EditorElement, state: EditorState, handleElementMouseDown: (id: string, e: React.MouseEvent) => void, accentHex: string, activeTool: ToolType, zoom = 1) {
  if (!el.visible) return null;
  const isSel = state.selectedElementIds.has(el.id);
  const selStroke = isSel ? '#FFD700' : undefined;
  const selWidth = isSel ? 2.5 : undefined;
  const pe = activeTool === 'select' ? 'auto' as const : 'none' as const;
  const cur = activeTool === 'select' ? 'move' : undefined;
  // Scale factor: elements shrink when zoomed in so they don't cover entire countries
  const zs = 1 / Math.sqrt(Math.max(1, zoom)); // zoom-scale for point elements

  switch (el.type) {
    case 'text':
      return (
        <text key={el.id} x={el.x} y={el.y}
          textAnchor={el.textAlign === 'left' ? 'start' : el.textAlign === 'right' ? 'end' : 'middle'}
          dominantBaseline="central"
          fill={el.fill.type === 'solid' ? el.fill.color : '#fff'}
          fontSize={el.fontSize * zs} fontFamily={el.fontFamily} fontWeight={el.fontWeight}
          transform={el.rotation ? `rotate(${el.rotation}, ${el.x}, ${el.y})` : undefined}
          style={{ cursor: cur }} pointerEvents={pe}
          onMouseDown={(e) => handleElementMouseDown(el.id, e)}>
          {el.content}
        </text>
      );
    case 'callout': {
      const anchor = el.points?.[0] || [el.x + 80, el.y + 80];
      const boxX = el.x;
      const boxY = el.y;
      const boxW = (el.width || 160) * zs;
      const boxH = (el.height || 60) * zs;
      const boxCX = boxX + boxW / 2;
      const boxCY = boxY + boxH / 2;
      const fillColor = el.fill.type === 'solid' ? el.fill.color : '#D4A74F';
      const fillOpacity = el.fill.opacity ?? 0.9;
      const cFs = el.fontSize * zs;
      // Wrap text into lines
      const maxCharsPerLine = Math.max(10, Math.floor(boxW / (cFs * 0.55)));
      const words = el.content.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      for (const word of words) {
        if ((currentLine + ' ' + word).trim().length > maxCharsPerLine && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = currentLine ? currentLine + ' ' + word : word;
        }
      }
      if (currentLine) lines.push(currentLine);

      return (
        <g key={el.id} onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}>
          {/* Connector line from box center to anchor point */}
          <line x1={boxCX} y1={boxCY} x2={anchor[0]} y2={anchor[1]}
            stroke={el.strokeColor} strokeWidth={(el.strokeWidth || 1) * zs} />
          {/* Anchor dot */}
          <circle cx={anchor[0]} cy={anchor[1]} r={3 * zs} fill={el.strokeColor} />
          {/* Box background */}
          <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={3 * zs}
            fill={fillColor} fillOpacity={fillOpacity}
            stroke={selStroke || el.strokeColor} strokeWidth={(selWidth || el.strokeWidth) * zs} />
          {/* Text content */}
          {lines.map((line, i) => (
            <text key={i} x={boxX + 8 * zs} y={boxY + 14 * zs + i * (cFs * 1.2)}
              fill="#fff" fontSize={cFs} fontFamily={el.fontFamily} fontWeight={el.fontWeight}
              dominantBaseline="central">
              {line}
            </text>
          ))}
        </g>
      );
    }
    case 'rect':
      return (
        <g key={el.id} transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation})`}
          onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}>
          <rect x={-el.width / 2} y={-el.height / 2} width={el.width} height={el.height} rx={4}
            fill={getFillAttr(el.fill, el.id)} fillOpacity={el.fill.opacity}
            stroke={selStroke || el.strokeColor} strokeWidth={selWidth || el.strokeWidth}
            strokeDasharray={el.strokeDasharray} />
        </g>
      );
    case 'ellipse':
      return (
        <g key={el.id} transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation})`}
          onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}>
          <ellipse rx={el.width / 2} ry={el.height / 2}
            fill={getFillAttr(el.fill, el.id)} fillOpacity={el.fill.opacity}
            stroke={selStroke || el.strokeColor} strokeWidth={selWidth || el.strokeWidth}
            strokeDasharray={el.strokeDasharray} />
        </g>
      );
    case 'line':
      return (
        <g key={el.id} onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}>
          {el.points.length >= 2 && (
            <line x1={el.points[0][0]} y1={el.points[0][1]} x2={el.points[1][0]} y2={el.points[1][1]}
              stroke={selStroke || el.strokeColor} strokeWidth={selWidth || el.strokeWidth}
              strokeDasharray={el.strokeDasharray} strokeLinecap="round" />
          )}
        </g>
      );
    case 'arrow':
      return (
        <g key={el.id} onMouseDown={(e) => handleElementMouseDown(el.id, e)}
          style={{ cursor: cur, color: el.strokeColor }} pointerEvents={pe}>
          {el.points.length >= 2 && (
            <line x1={el.points[0][0]} y1={el.points[0][1]} x2={el.points[1][0]} y2={el.points[1][1]}
              stroke={selStroke || el.strokeColor} strokeWidth={selWidth || el.strokeWidth}
              strokeLinecap="round"
              markerEnd={getMarkerEnd(el.arrowEnd)} markerStart={getMarkerStart(el.arrowStart)} />
          )}
        </g>
      );
    case 'curved-arrow':
      return (
        <g key={el.id} onMouseDown={(e) => handleElementMouseDown(el.id, e)}
          style={{ cursor: cur, color: el.strokeColor }} pointerEvents={pe}>
          <path d={pointsToCurvedArrow(el.points)} fill="none"
            stroke={selStroke || el.strokeColor} strokeWidth={selWidth || el.strokeWidth}
            strokeLinecap="round"
            markerEnd={getMarkerEnd(el.arrowEnd)} markerStart={getMarkerStart(el.arrowStart)} />
        </g>
      );
    case 'polygon':
    case 'zone': {
      const pts = el.points.map((p) => p.join(',')).join(' ');
      return (
        <g key={el.id} onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}>
          <polygon points={pts}
            fill={getFillAttr(el.fill, el.id)} fillOpacity={el.fill.opacity}
            stroke={selStroke || el.strokeColor} strokeWidth={selWidth || el.strokeWidth}
            strokeDasharray={el.type === 'zone' ? '6 3' : el.strokeDasharray} />
          {el.type === 'zone' && el.content && (() => {
            // Center label in polygon centroid
            const cx = el.points.reduce((s, p) => s + p[0], 0) / (el.points.length || 1);
            const cy = el.points.reduce((s, p) => s + p[1], 0) / (el.points.length || 1);
            return (
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                fill="var(--ed-canvas-text)" fontSize={el.fontSize || 9}
                fontFamily="var(--font-body)" fontWeight="600" opacity={0.8} pointerEvents="none">{el.content}</text>
            );
          })()}
        </g>
      );
    }
    case 'freehand':
      return (
        <g key={el.id} onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}>
          <path d={pointsToSmoothPath(el.points)} fill="none"
            stroke={selStroke || el.strokeColor} strokeWidth={(selWidth || el.strokeWidth) * zs}
            strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case 'frontline': {
      const flSw = (selWidth || el.strokeWidth) * zs;
      const triS = 4 * zs;
      return (
        <g key={el.id} onMouseDown={(e) => handleElementMouseDown(el.id, e)}
          style={{ cursor: cur, color: el.strokeColor }} pointerEvents={pe}>
          <path d={pointsToSmoothPath(el.points)} fill="none"
            stroke={selStroke || el.strokeColor} strokeWidth={flSw}
            strokeLinecap="round" />
          {el.points.map((pt, i) => i > 0 && i < el.points.length - 1 && i % 2 === 0 ? (
            <polygon key={i} points={`${pt[0]-triS},${pt[1]+triS*0.75} ${pt[0]},${pt[1]-triS*1.25} ${pt[0]+triS},${pt[1]+triS*0.75}`}
              fill={el.strokeColor} opacity={0.7} />
          ) : null)}
        </g>
      );
    }
    case 'marker':
      return (
        <g key={el.id} transform={`translate(${el.x}, ${el.y}) scale(${zs})`}
          onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}>
          <path d="M0,-16 C-8,-16 -14,-8 -14,-2 C-14,6 0,16 0,16 C0,16 14,6 14,-2 C14,-8 8,-16 0,-16 Z"
            fill={el.fill.type === 'solid' ? el.fill.color : accentHex}
            stroke={isSel ? '#FFD700' : 'rgba(0,0,0,0.3)'} strokeWidth={isSel ? 2 : 1} />
          <circle cy={-4} r={4} fill="white" fillOpacity={0.4} />
        </g>
      );
    case 'military-unit':
      return (
        <g key={el.id} onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}
          transform={`translate(${el.x * (1 - zs)}, ${el.y * (1 - zs)}) scale(${zs})`}>
          <MilitarySymbol element={el} isSelected={isSel} />
        </g>
      );
    case 'range-circle': {
      const rx = el.width / 2;
      const ry = el.height / 2;
      const weapon = WEAPON_RANGES.find(w => w.id === el.weaponRangeId);
      const rangeColor = weapon?.color || el.strokeColor;
      return (
        <g key={el.id} onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}>
          {/* Outer range ring */}
          <ellipse cx={el.x} cy={el.y} rx={rx} ry={ry}
            fill={rangeColor} fillOpacity={0.06}
            stroke={selStroke || rangeColor} strokeWidth={selWidth || el.strokeWidth}
            strokeDasharray={el.strokeDasharray} />
          {/* Inner rings at 25%, 50%, 75% */}
          <ellipse cx={el.x} cy={el.y} rx={rx * 0.75} ry={ry * 0.75}
            fill="none" stroke={rangeColor} strokeWidth={0.5}
            strokeDasharray="3 4" opacity={0.3} />
          <ellipse cx={el.x} cy={el.y} rx={rx * 0.5} ry={ry * 0.5}
            fill="none" stroke={rangeColor} strokeWidth={0.5}
            strokeDasharray="3 4" opacity={0.25} />
          <ellipse cx={el.x} cy={el.y} rx={rx * 0.25} ry={ry * 0.25}
            fill="none" stroke={rangeColor} strokeWidth={0.5}
            strokeDasharray="2 3" opacity={0.2} />
          {/* Center crosshair */}
          <circle cx={el.x} cy={el.y} r={Math.max(1, 3 * zs)}
            fill={rangeColor} stroke="rgba(0,0,0,0.3)" strokeWidth={0.5 * zs} />
          {/* Label */}
          <g transform={`translate(${el.x}, ${el.y - ry}) scale(${zs})`}>
            <rect x={-40} y={-14} width={80} height={12} rx={3}
              fill="rgba(0,0,0,0.65)" />
            <text x={0} y={-7} textAnchor="middle" dominantBaseline="central"
              fill={rangeColor} fontSize="7" fontFamily="var(--font-mono)" fontWeight="600">
              {el.content || weapon?.label || 'Reichweite'}
            </text>
          </g>
        </g>
      );
    }
    case 'supply-route': {
      const routeColor = el.strokeColor || '#10B981';
      return (
        <g key={el.id} onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}>
          <path d={pointsToSmoothPath(el.points)} fill="none"
            stroke={selStroke || routeColor} strokeWidth={selWidth || el.strokeWidth}
            strokeDasharray="8 4 2 4" strokeLinecap="round" opacity={0.8} />
          {/* Supply node markers along the route */}
          {el.points.filter((_, i) => i % 3 === 0).map((pt, i) => (
            <g key={i}>
              <circle cx={pt[0]} cy={pt[1]} r={Math.max(1.5, 4 * zs)}
                fill={routeColor} fillOpacity={0.3} stroke={routeColor} strokeWidth={Math.max(0.3, 1 * zs)} />
              <circle cx={pt[0]} cy={pt[1]} r={Math.max(0.5, 1.5 * zs)} fill={routeColor} />
            </g>
          ))}
          {el.content && (
            <text x={el.x} y={el.y - 8} textAnchor="middle" fill={routeColor}
              fontSize="7" fontFamily="var(--font-mono)" fontWeight="600" opacity={0.8}
              pointerEvents="none">
              {el.content}
            </text>
          )}
        </g>
      );
    }
    case 'heatmap-point': {
      const heatColor = el.strokeColor || '#EF4444';
      const radius = el.width / 2 || 30;
      return (
        <g key={el.id} onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}>
          <defs>
            <radialGradient id={`heat-${el.id}`}>
              <stop offset="0%" stopColor={heatColor} stopOpacity={0.6} />
              <stop offset="50%" stopColor={heatColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={heatColor} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={el.x} cy={el.y} r={radius}
            fill={`url(#heat-${el.id})`}
            stroke={isSel ? '#FFD700' : 'none'} strokeWidth={isSel ? 1.5 : 0}
            strokeDasharray={isSel ? '4 2' : ''} />
        </g>
      );
    }
    case 'image':
      return (
        <g key={el.id} transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation})`}
          onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}>
          <image
            href={el.imageDataUrl}
            x={-el.width / 2} y={-el.height / 2}
            width={el.width} height={el.height}
            preserveAspectRatio="xMidYMid meet"
            opacity={el.fill.opacity}
          />
          <rect x={-el.width / 2} y={-el.height / 2} width={el.width} height={el.height}
            fill="none"
            stroke={selStroke || 'transparent'} strokeWidth={selWidth || 0}
            strokeDasharray={isSel ? '6 3' : ''} />
        </g>
      );
    case 'image-pin': {
      const pinW = el.width || 30;
      const pinH = el.height || 30;
      const pinColor = el.fill.type === 'solid' ? el.fill.color : '#3B82F6';
      return (
        <g key={el.id} transform={`translate(${el.x}, ${el.y}) scale(${zs})`}
          onMouseDown={(e) => handleElementMouseDown(el.id, e)} style={{ cursor: cur }} pointerEvents={pe}>
          {/* Pin tail */}
          <path d={`M-3,${-pinH * 0.1} L0,${pinH * 0.35} L3,${-pinH * 0.1}`}
            fill={pinColor} opacity={0.9} />
          {/* Pin body (rounded rect) */}
          <rect x={-pinW / 2} y={-pinH / 2 - pinH * 0.1}
            width={pinW} height={pinH}
            rx={4} ry={4}
            fill="#1a1a2e" stroke={pinColor} strokeWidth={2}
            opacity={0.95} />
          {/* Thumbnail image clipped */}
          {el.imageDataUrl && (
            <>
              <clipPath id={`ip-clip-${el.id}`}>
                <rect x={-pinW / 2 + 2} y={-pinH / 2 - pinH * 0.1 + 2}
                  width={pinW - 4} height={pinH - 4} rx={2} ry={2} />
              </clipPath>
              <image
                href={el.imageDataUrl}
                x={-pinW / 2 + 2} y={-pinH / 2 - pinH * 0.1 + 2}
                width={pinW - 4} height={pinH - 4}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#ip-clip-${el.id})`}
              />
            </>
          )}
          {/* Camera icon when no image */}
          {!el.imageDataUrl && (
            <text x={0} y={-pinH * 0.1} textAnchor="middle" dominantBaseline="central"
              fill={pinColor} fontSize={pinW * 0.4} fontFamily="var(--font-mono)">
              📷
            </text>
          )}
          {/* Selection highlight */}
          {isSel && (
            <rect x={-pinW / 2 - 1} y={-pinH / 2 - pinH * 0.1 - 1}
              width={pinW + 2} height={pinH + 2}
              fill="none" stroke="#FFD700" strokeWidth={2} strokeDasharray="6 3" rx={5} />
          )}
          {/* Caption label */}
          {el.content && (
            <text x={0} y={pinH / 2 - pinH * 0.1 + 10}
              textAnchor="middle" dominantBaseline="hanging"
              fill="white" fontSize={8} fontFamily="var(--font-body)" fontWeight="600"
              stroke="rgba(0,0,0,0.6)" strokeWidth={2} paintOrder="stroke">
              {el.content}
            </text>
          )}
        </g>
      );
    }
    case 'route': {
      if (!el.points || el.points.length < 2) return null;
      const pathD = el.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
      return (
        <g key={el.id} onMouseDown={(e) => handleElementMouseDown(el.id, e)}
          style={{ cursor: cur }} pointerEvents={pe}>
          {/* Route shadow */}
          <path d={pathD} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={el.strokeWidth + 2}
            strokeLinecap="round" strokeLinejoin="round" />
          {/* Route line */}
          <path d={pathD} fill="none" stroke={el.strokeColor} strokeWidth={el.strokeWidth}
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={el.strokeDasharray || undefined} />
          {/* Waypoint markers */}
          {el.routeWaypoints?.map((wp, i) => (
            <g key={`rwp-${i}`}>
              <circle cx={wp[0]} cy={wp[1]} r={5}
                fill={i === 0 ? '#22c55e' : i === (el.routeWaypoints!.length - 1) ? '#ef4444' : '#3b82f6'}
                stroke="white" strokeWidth={1.5} />
              <text x={wp[0]} y={wp[1] - 8} textAnchor="middle" dominantBaseline="auto"
                fill="white" fontSize={7} fontFamily="var(--font-mono)" fontWeight={700}
                stroke="rgba(0,0,0,0.6)" strokeWidth={2} paintOrder="stroke">
                {i + 1}
              </text>
            </g>
          ))}
          {/* Distance label at midpoint */}
          {el.content && el.points.length > 1 && (() => {
            const mid = el.points[Math.floor(el.points.length / 2)];
            return (
              <g transform={`translate(${mid[0]}, ${mid[1] - 12})`}>
                <rect x={-30} y={-8} width={60} height={14} rx={3}
                  fill="rgba(0,0,0,0.75)" stroke={el.strokeColor} strokeWidth={0.5} />
                <text x={0} y={0} textAnchor="middle" dominantBaseline="central"
                  fill="white" fontSize={8} fontFamily="var(--font-mono)" fontWeight={600}>
                  {el.content}
                </text>
              </g>
            );
          })()}
          {/* Selection */}
          {isSel && (
            <path d={pathD} fill="none" stroke="#FFD700" strokeWidth={el.strokeWidth + 4}
              strokeLinecap="round" strokeLinejoin="round" opacity={0.3} />
          )}
        </g>
      );
    }
    default:
      return null;
  }
}

const zoomBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6,
  background: 'var(--ed-overlay-bg)', border: '1px solid var(--ed-overlay-border)',
  color: 'var(--ed-canvas-text-muted)', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};
