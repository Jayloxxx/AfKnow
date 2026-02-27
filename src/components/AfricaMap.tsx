import { useState, useRef, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, EyeOff, Waves, MapPin, Tag, Plane, Anchor, Grid3X3, Scissors, Check, X, Crosshair, Fuel, BookOpen, Handshake, ChevronDown, Layers } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useStore } from '../store/useStore';
import { useRealMap } from '../hooks/useRealMap';
import { useRegion } from '../context/RegionContext';
import { COUNTRY_ADMIN_REGIONS } from '../data/subRegions';
import { getVisibleOsmTiles, TILE_PROVIDERS } from '../lib/osmTiles';
import LeafletMap from './LeafletMap';
import MapOverlays from './MapOverlays';
import type { MapView, CountryData } from '../types';

type MapViewCategory = 'analysis' | 'light' | 'dark' | 'satellite' | 'terrain' | 'special';

const mapViewCategories: { id: MapViewCategory; label: string }[] = [
  { id: 'analysis', label: 'Analyse' },
  { id: 'light', label: 'Hell' },
  { id: 'dark', label: 'Dunkel' },
  { id: 'satellite', label: 'Satellit' },
  { id: 'terrain', label: 'Gelände' },
  { id: 'special', label: 'Spezial' },
];

const mapViews: { id: MapView; label: string; category: MapViewCategory }[] = [
  // Analysis (SVG-based)
  { id: 'political', label: 'Politisch', category: 'analysis' },
  { id: 'geographic', label: 'Geographisch', category: 'analysis' },
  { id: 'population', label: 'Bevölkerung', category: 'analysis' },
  { id: 'economic', label: 'Wirtschaft', category: 'analysis' },
  { id: 'conflict', label: 'Konflikte', category: 'analysis' },
  // Light tile maps
  { id: 'osm', label: 'OpenStreetMap', category: 'light' },
  { id: 'stadia-light', label: 'Stadia Light', category: 'light' },
  { id: 'carto-positron', label: 'CartoDB Positron', category: 'light' },
  { id: 'carto-voyager', label: 'CartoDB Voyager', category: 'light' },
  { id: 'esri-street', label: 'ESRI Street', category: 'light' },
  // Dark tile maps
  { id: 'stadia-dark', label: 'Stadia Dark', category: 'dark' },
  { id: 'carto-dark', label: 'CartoDB Dark', category: 'dark' },
  // Satellite
  { id: 'satellite-live', label: 'ESRI Satellit', category: 'satellite' },
  { id: 'sentinel', label: 'Sentinel-2 (ESA)', category: 'satellite' },
  // Terrain
  { id: 'topo', label: 'OpenTopoMap', category: 'terrain' },
  { id: 'stadia-terrain', label: 'Stadia Terrain', category: 'terrain' },
  { id: 'esri-topo', label: 'ESRI Topo', category: 'terrain' },
  { id: 'esri-ocean', label: 'ESRI Ozean', category: 'terrain' },
  // Special
  { id: 'hot', label: 'Humanitarian (HOT)', category: 'special' },
  { id: 'leaflet', label: 'Leaflet Interaktiv', category: 'special' },
];


function getPopulationColor(pop: number): string {
  if (pop > 100_000_000) return '#DC2626';
  if (pop > 50_000_000) return '#EA580C';
  if (pop > 20_000_000) return '#D97706';
  if (pop > 10_000_000) return '#CA8A04';
  if (pop > 5_000_000) return '#65A30D';
  return '#22C55E';
}

function getGdpColor(gdp: number | undefined): string {
  if (!gdp) return '#334155';
  if (gdp > 200_000_000_000) return '#16A34A';
  if (gdp > 50_000_000_000) return '#22C55E';
  if (gdp > 20_000_000_000) return '#65A30D';
  if (gdp > 5_000_000_000) return '#CA8A04';
  return '#D97706';
}

function getCountryFill(c: CountryData, view: MapView, rcMap: Record<string, string>): string {
  switch (view) {
    case 'population': return getPopulationColor(c.population);
    case 'economic': return getGdpColor(c.gdp);
    case 'conflict': {
      const secText = c.details.security.text.toLowerCase();
      if (secText.includes('conflict') || secText.includes('terror') || secText.includes('war') || secText.includes('insurg')) return '#DC2626';
      if (secText.includes('tension') || secText.includes('instab') || secText.includes('unrest')) return '#EA580C';
      return '#65A30D';
    }
    default:
      return rcMap[c.region] ?? '#3B5998';
  }
}

export default function AfricaMap() {
  const {
    mapView, setMapView, selectedCountryId, selectCountry,
    showRivers, toggleRivers, showCapitals, toggleCapitals,
    showLabels, toggleLabels, showAirports, toggleAirports,
    showPorts, togglePorts,
    showActors, toggleActors, showResources, toggleResources,
    showReligions, toggleReligions, showEconBlocs, toggleEconBlocs,
    mapZoom, setMapZoom, mapPan, setMapPan,
    userMarkers, highlightedCountries, theme,
    setClipboardImage, setActiveTab,
  } = useStore();

  const region = useRegion();

  const [showAdminRegions, setShowAdminRegions] = useState(false);
  const [showMapViewDropdown, setShowMapViewDropdown] = useState(false);

  // ─── Clip Tool State ───
  const [clipMode, setClipMode] = useState(false);
  const [clipRect, setClipRect] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [isClipping, setIsClipping] = useState(false);
  const clipContainerRef = useRef<HTMLDivElement>(null);

  // Cursor position in SVG coordinates for dynamic coordinate display
  const [cursorSvg, setCursorSvg] = useState<{ x: number; y: number } | null>(null);

  // Load real TopoJSON-based map paths
  const { paths: realPaths } = useRealMap(region.id);
  const realPathMap = useMemo(() => {
    const m = new Map<string, { path: string; center: [number, number] }>();
    for (const p of realPaths) m.set(p.id, { path: p.path, center: p.center });
    return m;
  }, [realPaths]);

  const isLeaflet = mapView === 'leaflet';
  const isTileView = !!TILE_PROVIDERS[mapView];

  // ─── Dynamic viewBox (like editor — enables deep zoom) ───
  const explorerViewBox = useMemo(() => {
    const vw = 1000 / mapZoom;
    const vh = 1100 / mapZoom;
    // mapPan.x/y are now SVG-coordinate offsets from center
    const vx = 500 - vw / 2 + mapPan.x;
    const vy = 550 - vh / 2 + mapPan.y;
    return { str: `${vx} ${vy} ${vw} ${vh}`, x: vx, y: vy, w: vw, h: vh };
  }, [mapZoom, mapPan]);

  // ─── OSM tiles for tile-based views ───
  const osmTiles = useMemo(() => {
    const tpl = TILE_PROVIDERS[mapView];
    if (!tpl) return [];
    return getVisibleOsmTiles({ x: explorerViewBox.x, y: explorerViewBox.y, w: explorerViewBox.w, h: explorerViewBox.h }, mapZoom, tpl, 500, { geoToSvg: region.geoToSvg, svgToGeo: region.svgToGeo });
  }, [mapView, mapZoom, explorerViewBox, region]);

  // ─── Region clip-path data ───
  const regionClipPaths = useMemo(() => {
    return region.countries.map(ct => {
      const real = realPathMap.get(ct.id);
      return { id: ct.id, d: real?.path ?? ct.path };
    });
  }, [realPathMap, region.countries]);

  const visibleCountries = useMemo(() => region.countries, [region.countries]);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    // Progressive: faster scroll when zoomed in deep
    const speed = 0.12 + 0.08 * Math.min(8, Math.log2(Math.max(1, mapZoom)));
    const factor = e.deltaY < 0 ? (1 + speed) : 1 / (1 + speed);
    const newZoom = Math.max(0.5, Math.min(100000, mapZoom * factor));

    // Zoom toward cursor: adjust pan so cursor stays on the same SVG point
    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const vw = 1000 / mapZoom;
      const vh = 1100 / mapZoom;
      const vx = 500 - vw / 2 + mapPan.x;
      const vy = 550 - vh / 2 + mapPan.y;
      // Cursor position in SVG coords
      const cx = vx + ((e.clientX - rect.left) / rect.width) * vw;
      const cy = vy + ((e.clientY - rect.top) / rect.height) * vh;
      // New viewBox size
      const nw = 1000 / newZoom;
      const nh = 1100 / newZoom;
      // Fraction of cursor within old viewBox
      const fx = (cx - vx) / vw;
      const fy = (cy - vy) / vh;
      // New pan so cursor stays at same position
      const nvx = cx - fx * nw;
      const nvy = cy - fy * nh;
      setMapPan({ x: nvx - (500 - nw / 2), y: nvy - (550 - nh / 2) });
    }
    setMapZoom(newZoom);
  }, [mapZoom, mapPan, setMapZoom, setMapPan]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      isPanning.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Track cursor for coordinate display
    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const vw = 1000 / mapZoom;
      const vh = 1100 / mapZoom;
      const vx = 500 - vw / 2 + mapPan.x;
      const vy = 550 - vh / 2 + mapPan.y;
      const sx = vx + ((e.clientX - rect.left) / rect.width) * vw;
      const sy = vy + ((e.clientY - rect.top) / rect.height) * vh;
      setCursorSvg({ x: sx, y: sy });
    }
    if (isPanning.current) {
      if (!svg) return;
      const rect = svg!.getBoundingClientRect();
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const vw = 1000 / mapZoom;
      const vh = 1100 / mapZoom;
      setMapPan({ x: mapPan.x - (dx / rect.width) * vw, y: mapPan.y - (dy / rect.height) * vh });
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  }, [mapPan, mapZoom, setMapPan]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const resetView = () => {
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
  };

  // ─── Clip Tool Handlers ───
  const handleClipMouseDown = useCallback((e: React.MouseEvent) => {
    if (!clipMode) return;
    // If we already have a finished selection (buttons visible),
    // dismiss it on click so user can draw a new one next time
    if (clipRect && !isClipping) {
      setClipRect(null);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const rect = clipContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClipRect({ startX: x, startY: y, endX: x, endY: y });
    setIsClipping(true);
  }, [clipMode, clipRect, isClipping]);

  const handleClipMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isClipping || !clipRect) return;
    const rect = clipContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setClipRect(prev => prev ? { ...prev, endX: e.clientX - rect.left, endY: e.clientY - rect.top } : null);
  }, [isClipping, clipRect]);

  const handleClipMouseUp = useCallback(() => {
    if (!isClipping) return;
    setIsClipping(false);
    // Keep clipRect for confirm/cancel
  }, [isClipping]);

  const handleClipConfirm = useCallback(async () => {
    if (!clipRect || !clipContainerRef.current) return;
    const container = clipContainerRef.current;
    const containerRect = container.getBoundingClientRect();

    const x1 = Math.min(clipRect.startX, clipRect.endX);
    const y1 = Math.min(clipRect.startY, clipRect.endY);
    const x2 = Math.max(clipRect.startX, clipRect.endX);
    const y2 = Math.max(clipRect.startY, clipRect.endY);
    const w = x2 - x1;
    const h = y2 - y1;

    if (w < 20 || h < 20) {
      setClipRect(null);
      setClipMode(false);
      return;
    }

    // Always clean up and navigate — capture is best-effort
    const finish = (croppedUrl?: string) => {
      if (croppedUrl) {
        setClipboardImage(croppedUrl, { x: 200, y: 200, w: Math.min(600, w), h: Math.min(660, h) });
      }
      setClipRect(null);
      setClipMode(false);
      setActiveTab('editor');
    };

    // Helper: crop a full-size data URL to the selection rect
    const cropDataUrl = (dataUrl: string, pixelRatio: number): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = w * pixelRatio;
            canvas.height = h * pixelRatio;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(
              img,
              x1 * pixelRatio, y1 * pixelRatio, w * pixelRatio, h * pixelRatio,
              0, 0, w * pixelRatio, h * pixelRatio
            );
            resolve(canvas.toDataURL('image/png', 0.92));
          } catch (e) { reject(e); }
        };
        img.onerror = reject;
        img.src = dataUrl;
      });
    };

    // Try html-to-image first (most universal)
    try {
      // Temporarily hide the clip overlay for capture
      const overlayEl = container.querySelector('[data-clip-overlay="true"]') as HTMLElement | null;
      if (overlayEl) overlayEl.style.display = 'none';

      const dataUrl = await toPng(container, {
        width: Math.round(containerRect.width),
        height: Math.round(containerRect.height),
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        includeQueryParams: true,
      });

      if (overlayEl) overlayEl.style.display = '';

      const cropped = await cropDataUrl(dataUrl, 2);
      finish(cropped);
      return;
    } catch (err) {
      console.warn('html-to-image failed, trying fallback:', err);
      // Restore overlay visibility
      const overlayEl = container.querySelector('[data-clip-overlay="true"]') as HTMLElement | null;
      if (overlayEl) overlayEl.style.display = '';
    }

    // Fallback: Draw Leaflet tile images onto a canvas manually
    try {
      const fallbackCanvas = document.createElement('canvas');
      const scale = 2;
      fallbackCanvas.width = containerRect.width * scale;
      fallbackCanvas.height = containerRect.height * scale;
      const ctx = fallbackCanvas.getContext('2d')!;
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);

      // Grab all visible <img> tiles from Leaflet
      const tileImages = container.querySelectorAll('.leaflet-tile-loaded');
      let drewAny = false;
      for (const tile of tileImages) {
        if (tile instanceof HTMLImageElement) {
          try {
            const tRect = tile.getBoundingClientRect();
            ctx.drawImage(tile,
              (tRect.left - containerRect.left) * scale,
              (tRect.top - containerRect.top) * scale,
              tRect.width * scale, tRect.height * scale);
            drewAny = true;
          } catch { /* skip tainted */ }
        }
      }

      if (drewAny) {
        const cropped = await cropDataUrl(fallbackCanvas.toDataURL('image/png'), scale);
        finish(cropped);
        return;
      }
    } catch (err) {
      console.warn('Canvas fallback also failed:', err);
    }

    // Last resort: navigate to editor without image
    finish();
  }, [clipRect, setClipboardImage, setActiveTab, isLeaflet]);

  const handleClipCancel = useCallback(() => {
    setClipRect(null);
    setClipMode(false);
  }, []);

  // Compute clip overlay rect
  const clipOverlayRect = clipRect ? {
    x: Math.min(clipRect.startX, clipRect.endX),
    y: Math.min(clipRect.startY, clipRect.endY),
    w: Math.abs(clipRect.endX - clipRect.startX),
    h: Math.abs(clipRect.endY - clipRect.startY),
  } : null;

  return (
    <div ref={clipContainerRef} className="flex-1 relative overflow-hidden bg-main"
         style={{
           backgroundImage: `
             linear-gradient(rgba(74,163,223,0.04) 1px, transparent 1px),
             linear-gradient(90deg, rgba(74,163,223,0.04) 1px, transparent 1px)
           `,
           backgroundSize: '40px 40px',
         }}>
      {/* Map View Selector — compact dropdown */}
      <div className="absolute top-3 left-3 z-[1001]">
        <button
          onClick={() => setShowMapViewDropdown(!showMapViewDropdown)}
          className="bg-surface/95 backdrop-blur-md border border-theme rounded-lg px-3 py-1.5 flex items-center gap-2 hover:bg-hover transition-all"
        >
          <Layers size={12} className="text-accent-400" />
          <span className="text-[11px] font-semibold text-main">
            {mapViews.find(v => v.id === mapView)?.label || 'Karte'}
          </span>
          <ChevronDown size={10} className="text-muted" />
        </button>
        {showMapViewDropdown && (<>
          <div className="fixed inset-0 z-[1000]" onClick={() => setShowMapViewDropdown(false)} />
          <div className="absolute top-full left-0 mt-1 z-[1002] bg-surface/95 backdrop-blur-md border border-theme rounded-xl p-1 min-w-[160px]"
            style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            {mapViewCategories.map((cat) => {
              const views = mapViews.filter(v => v.category === cat.id);
              if (views.length === 0) return null;
              return (
                <div key={cat.id}>
                  <div className="px-2 pt-1.5 pb-0.5 text-[8px] font-bold uppercase tracking-wider text-muted/60"
                    style={{ fontFamily: 'var(--font-display, inherit)' }}>
                    {cat.label}
                  </div>
                  {views.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => { setMapView(v.id); setShowMapViewDropdown(false); }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap w-full text-left ${
                        mapView === v.id ? 'bg-accent-500/20 text-accent-400' : 'text-muted hover:text-main hover:bg-hover'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </>)}
      </div>

      {/* Layer Toggles */}
      <div className={`absolute ${isLeaflet ? 'bottom-4 right-14 z-[400]' : 'top-3 right-3 z-[1001]'} flex flex-col gap-1.5`}>
        <div className="bg-surface/95 backdrop-blur-md border border-theme rounded-xl p-1 flex flex-col gap-0.5">
          {[
            { active: showRivers, toggle: toggleRivers, icon: Waves, label: 'Flüsse' },
            { active: showCapitals, toggle: toggleCapitals, icon: MapPin, label: 'Hauptstädte' },
            { active: showPorts, toggle: togglePorts, icon: Anchor, label: 'Häfen' },
            { active: showAirports, toggle: toggleAirports, icon: Plane, label: 'Flughäfen' },
            { active: showLabels, toggle: toggleLabels, icon: Tag, label: 'Labels' },
            { active: showAdminRegions, toggle: () => setShowAdminRegions(!showAdminRegions), icon: Grid3X3, label: 'Regionen' },
            { active: showActors, toggle: toggleActors, icon: Crosshair, label: 'Akteure' },
            { active: showResources, toggle: toggleResources, icon: Fuel, label: 'Ressourcen' },
            { active: showReligions, toggle: toggleReligions, icon: BookOpen, label: 'Religion' },
            { active: showEconBlocs, toggle: toggleEconBlocs, icon: Handshake, label: 'Wirtschaft' },
          ].map((item) => {
            const LayerIcon = item.icon;
            return (
            <button
              key={item.label}
              onClick={item.toggle}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                item.active ? 'bg-accent-500/15 text-accent-400' : 'text-muted hover:text-main hover:bg-hover'
              }`}
            >
              {item.active ? <LayerIcon size={12} /> : <EyeOff size={12} />}
              {item.label}
            </button>
            );
          })}
        </div>
      </div>

      {/* Zoom Controls — hidden in Leaflet mode (Leaflet has its own) */}
      {!isLeaflet && <div className="absolute bottom-4 right-3 z-[1001] bg-surface/95 backdrop-blur-md border border-theme rounded-xl p-1 flex flex-col gap-0.5">
        <button onClick={() => {
          const speed = 0.3 + 0.2 * Math.min(8, Math.log2(Math.max(1, mapZoom)));
          setMapZoom(Math.min(100000, mapZoom * (1 + speed)));
        }} className="w-8 h-8 rounded-lg hover:bg-hover flex items-center justify-center text-muted hover:text-main transition-colors">
          <ZoomIn size={15} />
        </button>
        <div className="text-center text-[10px] font-mono text-muted py-0.5">
          {mapZoom >= 1000 ? `${(mapZoom/1000).toFixed(1)}k` : Math.round(mapZoom * 100) + '%'}
        </div>
        <button onClick={() => {
          const speed = 0.3 + 0.2 * Math.min(8, Math.log2(Math.max(1, mapZoom)));
          setMapZoom(Math.max(0.5, mapZoom / (1 + speed)));
        }} className="w-8 h-8 rounded-lg hover:bg-hover flex items-center justify-center text-muted hover:text-main transition-colors">
          <ZoomOut size={15} />
        </button>
        <div className="h-px bg-[var(--border)] mx-1" />
        <button onClick={resetView} className="w-8 h-8 rounded-lg hover:bg-hover flex items-center justify-center text-muted hover:text-main transition-colors">
          <RotateCcw size={13} />
        </button>
      </div>}

      {/* Legend for special views */}
      {(mapView === 'population' || mapView === 'economic' || mapView === 'conflict') && (
        <div className="absolute bottom-4 left-3 z-[1001] bg-surface/95 backdrop-blur-md border border-theme rounded-xl p-3">
          <h4 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
            {mapView === 'population' ? 'Bevölkerung' : mapView === 'economic' ? 'BIP' : 'Sicherheitslage'}
          </h4>
          <div className="space-y-1">
            {mapView === 'population' && [
              { color: '#DC2626', label: '> 100M' },
              { color: '#EA580C', label: '50M–100M' },
              { color: '#D97706', label: '20M–50M' },
              { color: '#CA8A04', label: '10M–20M' },
              { color: '#65A30D', label: '5M–10M' },
              { color: '#22C55E', label: '< 5M' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                <span className="text-[10px] text-muted">{label}</span>
              </div>
            ))}
            {mapView === 'economic' && [
              { color: '#16A34A', label: '> $200B' },
              { color: '#22C55E', label: '$50B–$200B' },
              { color: '#65A30D', label: '$20B–$50B' },
              { color: '#CA8A04', label: '$5B–$20B' },
              { color: '#D97706', label: '< $5B' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                <span className="text-[10px] text-muted">{label}</span>
              </div>
            ))}
            {mapView === 'conflict' && [
              { color: '#DC2626', label: 'Aktive Konflikte' },
              { color: '#EA580C', label: 'Spannungen' },
              { color: '#65A30D', label: 'Stabil' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                <span className="text-[10px] text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaflet Map */}
      {isLeaflet && <LeafletMap showAdminRegions={showAdminRegions} />}

      {/* SVG Map — dynamic viewBox for deep zoom */}
      {!isLeaflet && <svg
        ref={svgRef}
        viewBox={explorerViewBox.str}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full select-none"
        style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <radialGradient id="ocean-grad" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor={theme === 'light' ? (mapView === 'geographic' ? '#a8d4f0' : '#c5ddf0') : (mapView === 'geographic' ? '#1a3a5c' : '#111928')} />
            <stop offset="100%" stopColor={theme === 'light' ? (mapView === 'geographic' ? '#87bfdf' : '#aacce0') : (mapView === 'geographic' ? '#0f2438' : '#0a0e18')} />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
          </filter>
          {isTileView && (
            <clipPath id="explorer-region-clip">
              {regionClipPaths.map(c => <path key={c.id} d={c.d} />)}
            </clipPath>
          )}
        </defs>

        {/* Ocean background — always visible (tiles render on top inside country clips) */}
        <rect width="1000" height="1100" fill="url(#ocean-grad)" />

        {/* Lat/Lon Grid lines, equator, tropics, labels – hidden when tiles active */}
        {!isTileView && (
          <>
            <g opacity="0.05" stroke="var(--text, #E4DFD7)">
              {Array.from({ length: 15 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 80} x2="1000" y2={i * 80} strokeWidth="0.4" strokeDasharray="4,8" />
              ))}
              {Array.from({ length: 13 }, (_, i) => (
                <line key={`v${i}`} x1={i * 80} y1="0" x2={i * 80} y2="1100" strokeWidth="0.4" strokeDasharray="4,8" />
              ))}
            </g>

            {region.equatorY != null && (
              <>
                <line x1="0" y1={region.equatorY} x2="1000" y2={region.equatorY} stroke="#4AA3DF" strokeWidth="0.6" opacity="0.2" strokeDasharray="8,4" />
                <text x="15" y={region.equatorY - 3} fill="#4AA3DF" opacity="0.25" fontSize="7" fontFamily="var(--font-mono)">Äquator 0°</text>
              </>
            )}

            {region.tropicNorthY != null && (
              <>
                <line x1="0" y1={region.tropicNorthY} x2="1000" y2={region.tropicNorthY} stroke="#D97706" strokeWidth="0.4" opacity="0.15" strokeDasharray="6,6" />
                <text x="15" y={region.tropicNorthY - 3} fill="#D97706" opacity="0.2" fontSize="6" fontFamily="var(--font-mono)">Wendekreis des Krebses 23.5°N</text>
              </>
            )}

            {region.tropicSouthY != null && (
              <>
                <line x1="0" y1={region.tropicSouthY} x2="1000" y2={region.tropicSouthY} stroke="#D97706" strokeWidth="0.4" opacity="0.15" strokeDasharray="6,6" />
                <text x="15" y={region.tropicSouthY - 3} fill="#D97706" opacity="0.2" fontSize="6" fontFamily="var(--font-mono)">Wendekreis des Steinbocks 23.5°S</text>
              </>
            )}

            {region.oceanLabels.map((lbl, i) => (
              <text key={i} x={lbl.x} y={lbl.y} fill="#4AA3DF" opacity="0.15" fontSize={lbl.fontSize ?? 14} fontFamily="var(--font-display)" fontStyle="italic"
                transform={lbl.rotation ? `rotate(${lbl.rotation}, ${lbl.x}, ${lbl.y})` : undefined}>{lbl.text}</text>
            ))}
          </>
        )}

        {/* North Arrow / Compass Rose */}
        <g transform="translate(940, 70)" opacity="0.5">
          <circle r="22" fill="none" stroke="var(--text, #E4DFD7)" strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="16" x2="0" y2="-16" stroke="var(--text, #E4DFD7)" strokeWidth="0.8" />
          <line x1="-16" y1="0" x2="16" y2="0" stroke="var(--text, #E4DFD7)" strokeWidth="0.4" opacity="0.4" />
          <polygon points="0,-18 -4,-8 0,-10 4,-8" fill={region.accentHex} stroke="none" />
          <polygon points="0,18 -4,8 0,10 4,8" fill="var(--text, #E4DFD7)" opacity="0.3" stroke="none" />
          <text y="-24" textAnchor="middle" fill={region.accentHex} fontSize="9" fontWeight="700" fontFamily="var(--font-display)">N</text>
          <text y="32" textAnchor="middle" fill="var(--text, #E4DFD7)" opacity="0.3" fontSize="6" fontFamily="var(--font-mono)">S</text>
          <text x="26" y="3" textAnchor="middle" fill="var(--text, #E4DFD7)" opacity="0.3" fontSize="6" fontFamily="var(--font-mono)">O</text>
          <text x="-26" y="3" textAnchor="middle" fill="var(--text, #E4DFD7)" opacity="0.3" fontSize="6" fontFamily="var(--font-mono)">W</text>
        </g>

        {/* Scale Bar */}
        <g transform="translate(860, 1060)" opacity="0.4">
          <line x1="0" y1="0" x2="65" y2="0" stroke="var(--text, #E4DFD7)" strokeWidth="1.5" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--text, #E4DFD7)" strokeWidth="1" />
          <line x1="65" y1="-3" x2="65" y2="3" stroke="var(--text, #E4DFD7)" strokeWidth="1" />
          <text x="32" y="10" textAnchor="middle" fill="var(--text, #E4DFD7)" fontSize="6" fontFamily="var(--font-mono)">~500 km</text>
        </g>

        {/* ═══ OSM Tile Layer (clipped to region) ═══ */}
          {osmTiles.length > 0 && (
            <g pointerEvents="none" clipPath="url(#explorer-region-clip)">
              {osmTiles.map(t => (
                <image key={`t${t.z}-${t.x}-${t.y}`} href={t.url}
                  x={t.svgX} y={t.svgY} width={t.svgW} height={t.svgH}
                  preserveAspectRatio="none" />
              ))}
            </g>
          )}

          {/* Country Paths */}
          {visibleCountries.map((c) => {
            const isSelected = selectedCountryId === c.id;
            const isHighlighted = highlightedCountries.length === 0 || highlightedCountries.includes(c.id);
            const fill = isTileView ? 'transparent' : getCountryFill(c, mapView, region.regionColors);
            const real = realPathMap.get(c.id);
            const svgPath = real?.path ?? c.path;

            return (
              <path
                key={c.id}
                d={svgPath}
                className="country-path"
                fill={fill}
                fillOpacity={isTileView ? 0 : (isHighlighted ? (isSelected ? 1 : 0.75) : 0.2)}
                stroke={isSelected ? region.accentHex : (isTileView ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)')}
                strokeWidth={Math.max(0.1, (isSelected ? 2 : (isTileView ? 0.8 : 0.5)) / Math.sqrt(mapZoom))}
                filter={isSelected ? 'url(#glow)' : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  selectCountry(c.id === selectedCountryId ? null : c.id);
                }}
                onMouseEnter={(e) => {
                  const rect = svgRef.current?.getBoundingClientRect();
                  if (rect) {
                    setTooltip({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top - 40,
                      text: `${c.flagEmoji} ${c.name} · ${c.capital}`,
                    });
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}

          {/* Admin Regions */}
          {showAdminRegions && visibleCountries.map((c) => {
            const regionData = COUNTRY_ADMIN_REGIONS[c.id];
            if (!regionData) return null;
            return regionData.regions.map(ar => {
              const svgCoords = ar.coords.map(([lon, lat]) => region.geoToSvg(lon, lat));
              const pathD = svgCoords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ') + ' Z';
              const center = region.geoToSvg(ar.center[0], ar.center[1]);
              return (
                <g key={ar.id} pointerEvents="none">
                  <path d={pathD} fill="rgba(255,255,255,0.03)"
                    stroke="rgba(255,255,255,0.25)" strokeWidth={0.6 / Math.sqrt(mapZoom)}
                    strokeDasharray={`${3 / Math.sqrt(mapZoom)} ${2 / Math.sqrt(mapZoom)}`} />
                  {showLabels && (
                    <text x={center[0]} y={center[1]}
                      textAnchor="middle" dominantBaseline="central"
                      fill="rgba(255,255,255,0.5)" fontSize={Math.max(3, 6 / Math.sqrt(mapZoom))}
                      fontFamily="var(--font-body)" fontWeight="500" pointerEvents="none"
                      stroke="rgba(0,0,0,0.4)" strokeWidth={1.5 / Math.sqrt(mapZoom)} paintOrder="stroke">
                      {ar.name}
                    </text>
                  )}
                </g>
              );
            });
          })}

          {/* Rivers + Labels */}
          {showRivers && region.rivers.map((r) => (
            <g key={r.id}>
              <path
                d={r.path}
                fill="none"
                stroke={mapView === 'geographic' ? '#4AA3DF' : '#2563EB'}
                strokeWidth={Math.max(0.5, 1.2 / Math.sqrt(mapZoom))}
                strokeOpacity={0.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {showLabels && (
                <text opacity={0.45} fill="#4AA3DF" fontSize={Math.max(3, 7 / Math.sqrt(mapZoom))} fontFamily="var(--font-body)" fontStyle="italic" pointerEvents="none">
                  <textPath href={`#river-path-${r.id}`} startOffset="40%">{r.name}</textPath>
                </text>
              )}
            </g>
          ))}
          {/* River paths for textPath references */}
          {showRivers && (
            <defs>
              {region.rivers.map((r) => (
                <path key={`rp-${r.id}`} id={`river-path-${r.id}`} d={r.path} />
              ))}
            </defs>
          )}

          {/* Capital markers */}
          {showLabels && showCapitals && visibleCountries.map((c) => {
            const r = Math.max(1, (selectedCountryId === c.id ? 4 : 2.5) / Math.sqrt(mapZoom));
            return (
            <g key={`cap-${c.id}`}>
              <circle
                cx={c.capitalCoords[0]}
                cy={c.capitalCoords[1]}
                r={r}
                fill={selectedCountryId === c.id ? region.accentHex : '#F59E0B'}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={Math.max(0.15, 0.5 / Math.sqrt(mapZoom))}
              />
              {showLabels && (
                <text
                  x={c.capitalCoords[0] + r + 1}
                  y={c.capitalCoords[1] + 1}
                  dominantBaseline="central"
                  fontSize={Math.max(2, (selectedCountryId === c.id ? 8 : 6) / Math.sqrt(mapZoom))}
                  fontWeight={selectedCountryId === c.id ? 600 : 400}
                  fill={selectedCountryId === c.id ? region.accentHex : '#FFFFFF'}
                  fontFamily="var(--font-body)"
                  stroke="rgba(0,0,0,0.4)" strokeWidth={Math.max(0.1, 0.3 / Math.sqrt(mapZoom))} paintOrder="stroke"
                  pointerEvents="none"
                >
                  {c.capital}
                </text>
              )}
            </g>
            );
          })}

          {/* Airport markers */}
          {showLabels && showAirports && visibleCountries.map((c) =>
            c.airports.map((ap, i) => {
              const sz = Math.max(1, 2 / Math.sqrt(mapZoom));
              return (
              <g key={`ap-${c.id}-${i}`}>
                <rect
                  x={ap.coords[0] - sz}
                  y={ap.coords[1] - sz}
                  width={sz * 2}
                  height={sz * 2}
                  rx={sz * 0.3}
                  fill="#60A5FA"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={Math.max(0.1, 0.3 / Math.sqrt(mapZoom))}
                />
                {showLabels && (
                  <text
                    x={ap.coords[0] + sz + 1}
                    y={ap.coords[1] + 1}
                    dominantBaseline="central"
                    fontSize={Math.max(2, 5 / Math.sqrt(mapZoom))}
                    fill="#93C5FD"
                    fontFamily="var(--font-body)"
                    pointerEvents="none"
                  >
                    {ap.name.length > 15 ? ap.name.slice(0, 15) + '…' : ap.name}
                  </text>
                )}
              </g>
              );
            })
          )}

          {/* Ports */}
          {showLabels && showPorts && region.ports.map((p) => {
            const sz = Math.max(1.5, 3 / Math.sqrt(mapZoom));
            const isMil = p.type === 'military' || p.type === 'dual';
            const color = p.type === 'military' ? '#EF4444' : p.type === 'dual' ? '#F59E0B' : '#06B6D4';
            return (
              <g key={`port-${p.id}`}>
                <circle cx={p.coords[0]} cy={p.coords[1]} r={sz}
                  fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth={Math.max(0.2, 0.4 / Math.sqrt(mapZoom))} />
                {isMil && p.foreignUsers.length > 0 && (
                  <circle cx={p.coords[0]} cy={p.coords[1]} r={sz * 1.8}
                    fill="none" stroke={color} strokeWidth={Math.max(0.15, 0.3 / Math.sqrt(mapZoom))} strokeDasharray={`${sz * 0.8} ${sz * 0.5}`} opacity={0.5} />
                )}
                {showLabels && (
                  <text x={p.coords[0] + sz + 2} y={p.coords[1] + 1}
                    fill={color} fontSize={Math.max(2.5, 5 / Math.sqrt(mapZoom))} fontFamily="var(--font-body)" fontWeight={isMil ? 600 : 400} opacity={0.8}
                    pointerEvents="none">
                    {p.name}{p.foreignUsers.length > 0 ? ` [${p.foreignUsers.map(f => f.country).join(',')}]` : ''}
                  </text>
                )}
              </g>
            );
          })}

          {/* Country labels */}
          {showLabels && visibleCountries.map((c) => {
            const rp = realPathMap.get(c.id);
            const lbl = rp?.center ?? c.labelPos;
            const baseFontSize = c.area > 500000 ? 9 : c.area > 100000 ? 7 : 5;
            const fs = Math.max(2.5, baseFontSize / Math.sqrt(mapZoom));
            // At higher zoom show full name for smaller countries too
            const label = mapZoom > 3 ? c.name : (c.area > 200000 ? c.name : c.id);
            return (
            <text
              key={`label-${c.id}`}
              x={lbl[0]}
              y={lbl[1]}
              textAnchor="middle" dominantBaseline="central"
              fontSize={fs}
              fontWeight={selectedCountryId === c.id ? 700 : 500}
              fontFamily="var(--font-body)"
              fill={selectedCountryId === c.id ? region.accentHex : '#FFFFFF'}
              stroke="rgba(0,0,0,0.35)" strokeWidth={Math.max(0.1, 0.25 / Math.sqrt(mapZoom))} paintOrder="stroke"
              opacity={c.area > 50000 ? 0.85 : 0.6}
              pointerEvents="none"
            >
              {label}
            </text>
            );
          })}

          {/* User markers */}
          {showLabels && userMarkers.map((m) => (
            <g key={m.id}>
              <circle
                cx={m.coords[0]}
                cy={m.coords[1]}
                r={4}
                fill={m.color}
                stroke="white"
                strokeWidth={1}
                filter="url(#shadow)"
              />
              {showLabels && (
                <text
                  x={m.coords[0]}
                  y={m.coords[1] - 7}
                  className="map-label"
                  fontSize={6}
                  fill={m.color}
                  fontWeight={600}
                >
                  {m.name}
                </text>
              )}
            </g>
          ))}

          {/* ═══ Map Overlay Layers (Actors, Resources, Religion, Economy) ═══ */}
          <MapOverlays mapZoom={mapZoom} />

          {/* ═══ Crosshair at cursor ═══ */}
          {cursorSvg && mapZoom > 2 && (
            <g pointerEvents="none" opacity={0.3}>
              <line x1={cursorSvg.x} y1={explorerViewBox.y} x2={cursorSvg.x} y2={explorerViewBox.y + explorerViewBox.h}
                stroke="var(--text, #E4DFD7)" strokeWidth={0.3 / mapZoom} strokeDasharray={`${2/mapZoom} ${3/mapZoom}`} />
              <line x1={explorerViewBox.x} y1={cursorSvg.y} x2={explorerViewBox.x + explorerViewBox.w} y2={cursorSvg.y}
                stroke="var(--text, #E4DFD7)" strokeWidth={0.3 / mapZoom} strokeDasharray={`${2/mapZoom} ${3/mapZoom}`} />
            </g>
          )}
      </svg>}

      {/* ═══ Dynamic Coordinate Display + Copy (SVG mode only) ═══ */}
      {!isLeaflet && cursorSvg && (() => {
        const [lon, lat] = region.svgToGeo(cursorSvg.x, cursorSvg.y);
        const latDir = lat >= 0 ? 'N' : 'S';
        const lonDir = lon >= 0 ? 'E' : 'W';
        return (
          <div className="absolute bottom-3 left-3 z-[1001] px-2 py-1 rounded-lg bg-surface/80 backdrop-blur-sm border border-theme flex items-center gap-2"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
            <span className="pointer-events-none">
              {Math.abs(lat).toFixed(4)}° {latDir} &nbsp; {Math.abs(lon).toFixed(4)}° {lonDir}
              {mapZoom > 1 && <span className="ml-2 opacity-50">z{Math.round(mapZoom * 10) / 10}x</span>}
            </span>
            <button onClick={() => navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lon.toFixed(6)}`)}
              className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ background: 'none', border: 'none', fontSize: 10, padding: 0, lineHeight: 1 }}
              title="Koordinaten kopieren">📋</button>
          </div>
        );
      })()}

      {/* Tooltip (SVG mode only) */}
      {!isLeaflet && tooltip && (
        <div
          className="absolute z-[1002] px-3 py-1.5 bg-surface/95 backdrop-blur-md border border-theme rounded-lg shadow-xl text-xs font-medium text-main pointer-events-none anim-fade-in"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}
        >
          {tooltip.text}
        </div>
      )}

      {/* ═══ Clip / Screenshot Tool Button ═══ */}
      <div className="absolute bottom-4 left-3 z-[1002] flex flex-col gap-1.5">
        <button
          onClick={() => { setClipMode(!clipMode); setClipRect(null); }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all ${
            clipMode
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-surface/95 backdrop-blur-md border border-theme text-muted hover:text-main hover:bg-hover'
          }`}
          title="Ausschnitt aufnehmen & im Editor bearbeiten"
        >
          <Scissors size={13} />
          {clipMode ? 'Ausschnitt aktiv' : 'Ausschnitt'}
        </button>
        {clipMode && !clipRect && (
          <div className="px-3 py-1.5 rounded-lg bg-surface/90 backdrop-blur-sm border border-theme text-[10px] text-muted max-w-[180px]">
            Ziehe ein Rechteck auf der Karte um den gewünschten Bereich auszuwählen
          </div>
        )}
      </div>

      {/* ═══ Clip Mode Overlay ═══ */}
      {clipMode && (
        <div
          data-clip-overlay="true"
          className="absolute inset-0 z-[1003]"
          style={{ cursor: 'crosshair' }}
          onMouseDown={handleClipMouseDown}
          onMouseMove={handleClipMouseMove}
          onMouseUp={handleClipMouseUp}
        >
          {/* Dimmed background outside selection */}
          {clipOverlayRect && clipOverlayRect.w > 2 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <mask id="clip-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect x={clipOverlayRect.x} y={clipOverlayRect.y}
                    width={clipOverlayRect.w} height={clipOverlayRect.h} fill="black" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.45)" mask="url(#clip-mask)" />
              {/* Selection border */}
              <rect x={clipOverlayRect.x} y={clipOverlayRect.y}
                width={clipOverlayRect.w} height={clipOverlayRect.h}
                fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 3" />
              {/* Corner handles */}
              {[[clipOverlayRect.x, clipOverlayRect.y],
                [clipOverlayRect.x + clipOverlayRect.w, clipOverlayRect.y],
                [clipOverlayRect.x, clipOverlayRect.y + clipOverlayRect.h],
                [clipOverlayRect.x + clipOverlayRect.w, clipOverlayRect.y + clipOverlayRect.h]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r={4} fill="#F59E0B" stroke="white" strokeWidth="1.5" />
              ))}
              {/* Size label */}
              <text x={clipOverlayRect.x + clipOverlayRect.w / 2} y={clipOverlayRect.y - 8}
                textAnchor="middle" fill="#F59E0B" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600">
                {Math.round(clipOverlayRect.w)} × {Math.round(clipOverlayRect.h)}
              </text>
            </svg>
          )}

        </div>
      )}

      {/* ═══ Clip Confirm / Cancel — OUTSIDE overlay so clicks always work ═══ */}
      {clipMode && clipOverlayRect && clipOverlayRect.w > 20 && !isClipping && (
        <div
          className="absolute flex gap-2 z-[1004]"
          style={{
            left: clipOverlayRect.x + clipOverlayRect.w / 2,
            top: clipOverlayRect.y + clipOverlayRect.h + 12,
            transform: 'translateX(-50%)',
          }}
        >
          <button onClick={handleClipConfirm}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-colors shadow-lg"
          >
            <Check size={12} /> Im Editor öffnen
          </button>
          <button onClick={handleClipCancel}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-surface/90 border border-theme text-muted hover:text-main transition-colors shadow-lg"
          >
            <X size={12} /> Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}
