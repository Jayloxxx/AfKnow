import { useState, useCallback, useRef, useMemo } from 'react';
import { Globe, Search, ZoomIn, ZoomOut, Plus, Check, Trash2 } from 'lucide-react';
import { useRegion } from '../../context/RegionContext';
import { useRealMap } from '../../hooks/useRealMap';
import { getVisibleOsmTiles, TILE_PROVIDERS } from '../../lib/osmTiles';
import { REGION_COLORS } from './constants';
import type { EditorState } from './useEditorState';

interface Props {
  state: EditorState;
  mapStyle: string;
}

export default function CountrySelectorPanel({ state, mapStyle }: Props) {
  const region = useRegion();
  const { paths: realPaths } = useRealMap(region.id);
  const realPathMap = useMemo(() => {
    const m = new Map<string, { path: string; center: [number, number] }>();
    for (const p of realPaths) m.set(p.id, { path: p.path, center: p.center });
    return m;
  }, [realPaths]);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selZoom, setSelZoom] = useState(1);
  const [selPan, setSelPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const regionMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of region.countries) m[c.id] = c.region;
    return m;
  }, [region.countries]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const addSelected = () => {
    const ids = Array.from(selected).filter((id) => !state.countryIds.has(id));
    if (ids.length > 0) {
      state.addCountries(ids, regionMap);
      setSelected(new Set());
    }
  };

  const addAll = () => {
    state.addAllCountries(region.countries.map((c) => c.id), regionMap);
  };

  const isTileStyle = !!TILE_PROVIDERS[mapStyle];

  // ─── OSM tiles for left panel ───
  const selectorTiles = useMemo(() => {
    const tpl = TILE_PROVIDERS[mapStyle];
    if (!tpl) return [];
    let vx = 0, vy = 0, vw = 1000, vh = 1100;
    if (selZoom > 1.5) {
      vw = 1000 / selZoom;
      vh = 1100 / selZoom;
      vx = 500 - vw / 2 - (selPan.x / selZoom);
      vy = 550 - vh / 2 - (selPan.y / selZoom);
    }
    return getVisibleOsmTiles({ x: vx, y: vy, w: vw, h: vh }, selZoom, tpl, 500, { geoToSvg: region.geoToSvg, svgToGeo: region.svgToGeo });
  }, [mapStyle, selZoom, selPan]);

  // ─── Africa clip-path data ───
  const regionClipPaths = useMemo(() => {
    return region.countries.map(ct => {
      const entry = realPathMap.get(ct.id);
      return { id: ct.id, d: entry?.path ?? ct.path };
    });
  }, [realPathMap]);

  // Pan/zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).tagName !== 'path') {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: selPan.x, panY: selPan.y };
    }
  };
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setSelPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    });
  }, [isPanning]);
  const handleMouseUp = useCallback(() => setIsPanning(false), []);
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setSelZoom((z) => Math.max(0.5, Math.min(5, z + (e.deltaY < 0 ? 0.2 : -0.2))));
  }, []);

  return (
    <div className="flex flex-col shrink-0 border-r border-theme bg-surface" style={{ width: 300 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-theme">
        <h2 className="text-xs font-display font-semibold text-main flex items-center gap-1.5">
          <Globe size={14} className="text-accent-400" /> Länder auswählen
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          {state.countryIds.size > 0 && <span className="text-sage-400"><Check size={10} className="inline" /> {state.countryIds.size}</span>}
          {selected.size > 0 && <span className="text-accent-400">{selected.size} gewählt</span>}
        </div>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5 border-b border-theme">
        <div className="relative">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Land suchen..."
            className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-card border border-theme text-xs text-main outline-none focus:border-accent-500/50 placeholder:text-muted" />
        </div>
      </div>

      {/* Zoomable Map */}
      <div className="flex-1 min-h-0 relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ background: 'var(--ed-selector-bg)' }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}>
        <svg viewBox="0 0 1000 1100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet"
          style={{ transform: `scale(${selZoom}) translate(${selPan.x / selZoom}px, ${selPan.y / selZoom}px)`, transformOrigin: 'center center' }}>
          <defs>
            <radialGradient id="sel-ocean" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="var(--ed-ocean-start)" />
              <stop offset="100%" stopColor="var(--ed-ocean-end)" />
            </radialGradient>
            {isTileStyle && (
              <clipPath id="sel-region-clip">
                {regionClipPaths.map(c => <path key={c.id} d={c.d} />)}
              </clipPath>
            )}
          </defs>
          {!isTileStyle && <rect width="1000" height="1100" fill="url(#sel-ocean)" />}
          {!isTileStyle && [0,100,200,300,400,500,600,700,800,900,1000].map(v => <line key={`v${v}`} x1={v} y1="0" x2={v} y2="1100" stroke="var(--ed-selector-grid)" strokeWidth="0.5" />)}
          {!isTileStyle && [0,100,200,300,400,500,600,700,800,900,1000,1100].map(v => <line key={`h${v}`} x1="0" y1={v} x2="1000" y2={v} stroke="var(--ed-selector-grid)" strokeWidth="0.5" />)}

          {/* OSM Tiles (clipped to Africa) */}
          {selectorTiles.length > 0 && (
            <g pointerEvents="none" clipPath="url(#sel-region-clip)">
              {selectorTiles.map(t => (
                <image key={`st${t.z}-${t.x}-${t.y}`} href={t.url}
                  x={t.svgX} y={t.svgY} width={t.svgW} height={t.svgH}
                  preserveAspectRatio="none" />
              ))}
            </g>
          )}

          {region.countries.map((ct) => {
            const entry = realPathMap.get(ct.id);
            const svgPath = entry?.path ?? ct.path;
            const center = entry?.center ?? ct.labelPos;
            const isSel = selected.has(ct.id);
            const isOnCanvas = state.countryIds.has(ct.id);
            const matches = !search || ct.name.toLowerCase().includes(search.toLowerCase());
            return (
              <g key={ct.id} opacity={matches ? 1 : 0.08}>
                <path d={svgPath}
                  fill={isTileStyle ? (isOnCanvas ? '#47B872' : isSel ? region.accentHex : 'transparent') : (isOnCanvas ? '#47B872' : isSel ? region.accentHex : REGION_COLORS[ct.region] || '#4A6FA5')}
                  fillOpacity={isTileStyle ? (isSel || isOnCanvas ? 0.5 : 0) : (isSel || isOnCanvas ? 0.85 : 0.5)}
                  stroke={isSel ? '#FFD700' : isOnCanvas ? '#6EE7A0' : (isTileStyle ? 'rgba(255,255,255,0.3)' : 'var(--ed-selector-grid)')}
                  strokeWidth={isSel ? 3 : isOnCanvas ? 2 : (isTileStyle ? 0.8 : 0.5)}
                  className="cursor-pointer hover:brightness-150 hover:fill-opacity-75 transition-colors duration-100"
                  onClick={(e) => { e.stopPropagation(); toggle(ct.id); }}>
                  <title>{ct.name}{isOnCanvas ? ' ✓' : ''}</title>
                </path>
                {selZoom >= 1.3 && matches && (
                  <text x={center[0]} y={center[1]} textAnchor="middle" dominantBaseline="central" fill="var(--ed-canvas-text)"
                    fontSize={Math.max(6, 9 / selZoom)} fontFamily="var(--font-body)" opacity={0.65} pointerEvents="none" className="select-none">
                    {ct.id}
                  </text>
                )}
              </g>
            );
          })}

          {!isTileStyle && region.oceanLabels.map((lbl, i) => (
            <text key={i} x={lbl.x} y={lbl.y} fill="#4AA3DF" opacity="0.10" fontSize={lbl.fontSize ? Math.round(lbl.fontSize * 0.8) : 12} fontFamily="var(--font-display)" fontStyle="italic"
              transform={lbl.rotation ? `rotate(${lbl.rotation}, ${lbl.x}, ${lbl.y})` : undefined}>{lbl.text}</text>
          ))}
        </svg>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
          <button onClick={() => setSelZoom(z => Math.min(5, z + 0.4))}
            style={{ width: 28, height: 28, borderRadius: 4, background: 'var(--ed-toolbar)', border: '1px solid var(--ed-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ed-icon)', cursor: 'pointer' }}>
            <ZoomIn size={14} />
          </button>
          <button onClick={() => setSelZoom(z => Math.max(0.5, z - 0.4))}
            style={{ width: 28, height: 28, borderRadius: 4, background: 'var(--ed-toolbar)', border: '1px solid var(--ed-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ed-icon)', cursor: 'pointer' }}>
            <ZoomOut size={14} />
          </button>
          <button onClick={() => { setSelZoom(1); setSelPan({ x: 0, y: 0 }); }}
            style={{ width: 28, height: 28, borderRadius: 4, background: 'var(--ed-toolbar)', border: '1px solid var(--ed-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ed-icon)', cursor: 'pointer', fontSize: 9, fontFamily: 'monospace' }}>
            1:1
          </button>
        </div>
        <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, fontFamily: 'monospace', color: 'var(--ed-text-dim)' }}>{Math.round(selZoom * 100)}%</div>
      </div>

      {/* Action bar */}
      <div className="px-2 py-2 border-t border-theme flex items-center gap-1.5">
        <button onClick={addSelected} disabled={selected.size === 0}
          className="flex-1 py-2 rounded-lg bg-accent-500/20 text-accent-400 text-[11px] font-semibold hover:bg-accent-500/30 transition-colors disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-1">
          <Plus size={13} /> {selected.size > 0 ? `${selected.size} hinzufügen` : 'Auswählen'}
        </button>
        <button onClick={addAll} disabled={state.countryIds.size >= region.countries.length}
          className="px-3 py-2 rounded-lg bg-card border border-theme text-[11px] text-muted hover:text-main transition-colors disabled:opacity-20">Alle</button>
        {state.countryIds.size > 0 && (
          <button onClick={state.removeAllCountries} className="px-2 py-2 rounded-lg text-terra-400/60 hover:text-terra-400 hover:bg-terra-500/10 transition-colors" title="Alle entfernen">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
