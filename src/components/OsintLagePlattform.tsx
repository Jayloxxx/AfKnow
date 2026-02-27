import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Shield, Clock,
  Globe, Crosshair, Zap, Target, Plus,
  ExternalLink, MapPin, Search, X, Info,
  Anchor, Plane, Rocket, Building2, Users,
  Lightbulb, Star, Calendar,
  Hash, Link2, CheckCircle2,
  CircleDot, History,
  Wifi, WifiOff, RefreshCw,
} from 'lucide-react';
import {
  SAMPLE_EVENTS, SAMPLE_MISSILE_RANGES, SAMPLE_ANALYSIS,
  ACTOR_CONFIG, CATEGORY_CONFIG, CONFIDENCE_CONFIG, VERIFICATION_CONFIG,
  type OsintEvent, type AnalysisNote, type Actor, type EventCategory,
  type ConfidenceLevel, type AssessmentType,
} from '../data/osintData';
import { fetchCriticalEvents } from '../lib/newsApi';
import { convertArticlesToOsintEvents, filterMilitaryRelevant } from '../lib/osintGdeltBridge';
import { fetchLiveForces, STATIC_BASES, type TrackedForce } from '../lib/liveForceTracker';
import {
  useOsintStore, UNIT_TYPE_CONFIG, ARROW_TYPE_CONFIG,
} from '../store/useOsintStore';
import UnitPalette from './osint/UnitPalette';
import ArrowTools from './osint/ArrowTools';

// ═══════════════════════════════════════════════════════════════
// OSINT LAGEPLATTFORM — Interactive Military Intelligence Platform
// ═══════════════════════════════════════════════════════════════

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Custom marker icons ──
function createIcon(color: string, symbol: string, size = 28): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid rgba(255,255,255,0.8);
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:${size * 0.45}px;
      box-shadow:0 2px 8px rgba(0,0,0,0.4), 0 0 12px ${color}60;
      cursor:pointer;
      transition: transform 0.15s;
    " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${symbol}</div>`,
  });
}

function createUnitIcon(color: string, symbol: string): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    html: `<div style="
      width:34px;height:34px;
      background:${color}30;
      border:2px dashed ${color};
      border-radius:6px;
      display:flex;align-items:center;justify-content:center;
      font-size:16px;
      box-shadow:0 2px 12px ${color}40;
      cursor:grab;
      transition: transform 0.15s;
    " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">${symbol}</div>`,
  });
}

function createArrowhead(color: string, angle: number): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `<div style="
      width:0;height:0;
      border-left:6px solid transparent;
      border-right:6px solid transparent;
      border-bottom:12px solid ${color};
      transform:rotate(${angle}deg);
      filter:drop-shadow(0 0 4px ${color}80);
    "></div>`,
  });
}

// ── Map fly-to component ──
function FlyToEvent({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }, [lat, lng, zoom, map]);
  return null;
}

// ── Map click handler component ──
function MapClickHandler() {
  const {
    mode, pendingUnitType, pendingUnitActor,
    addUnit,
    addPendingArrowPoint, pendingArrowPoints, pendingArrowType, pendingArrowActor,
    addArrow, clearPendingArrow,
  } = useOsintStore();

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      if (mode === 'place-unit' && pendingUnitType) {
        const cfg = UNIT_TYPE_CONFIG[pendingUnitType];
        addUnit({
          id: `unit-${Date.now()}`,
          unitType: pendingUnitType,
          label: cfg.nameDE,
          actor: pendingUnitActor,
          lat,
          lng,
          notes: '',
          createdAt: new Date().toISOString(),
        });
        // Stay in placement mode for rapid placement
      }

      if (mode === 'draw-arrow') {
        addPendingArrowPoint([lat, lng]);
      }
    },
    contextmenu(e) {
      // Right-click finishes arrow drawing
      if (mode === 'draw-arrow' && pendingArrowPoints.length >= 2) {
        addArrow({
          id: `arrow-${Date.now()}`,
          arrowType: pendingArrowType,
          actor: pendingArrowActor,
          label: '',
          points: pendingArrowPoints,
          createdAt: new Date().toISOString(),
        });
        clearPendingArrow();
        e.originalEvent.preventDefault();
      }
    },
  });

  return null;
}

// ── Helpers ──
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19) + 'Z';
}
function daysAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Heute';
  if (days === 1) return 'Gestern';
  return `vor ${days} Tagen`;
}

function calcArrowAngle(p1: [number, number], p2: [number, number]): number {
  const dx = p2[1] - p1[1];
  const dy = p2[0] - p1[0];
  return -(Math.atan2(dx, dy) * 180 / Math.PI);
}

// ══════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════

type SidePanel = 'events' | 'forces' | 'analysis' | 'tools' | 'none';
type TimeRange = '7d' | '14d' | '30d' | 'all';

export default function OsintLagePlattform() {
  // ── OSINT Store ──
  const osint = useOsintStore();
  const { mode, customUnits, arrows, pendingArrowPoints, manualEvents } = osint;

  // ── Live data state ──
  const [liveEvents, setLiveEvents] = useState<OsintEvent[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [, setLiveLastFetch] = useState<number | null>(null);
  const [liveCount, setLiveCount] = useState(0);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Live forces state ──
  const [liveForces, setLiveForces] = useState<TrackedForce[]>([]);
  const [forcesLoading, setForcesLoading] = useState(false);
  const [forcesCount, setForcesCount] = useState(0);

  // ── Fetch live events ──
  const fetchLiveData = useCallback(async () => {
    setLiveLoading(true);
    setLiveError(null);
    try {
      const articles = await fetchCriticalEvents([], '7d', undefined, 'mideast');
      const military = filterMilitaryRelevant(articles);
      const converted = convertArticlesToOsintEvents(military);
      setLiveEvents(converted);
      setLiveCount(converted.length);
      setLiveLastFetch(Date.now());
    } catch (err) {
      console.error('Live fetch failed:', err);
      setLiveError('GDELT-Abfrage fehlgeschlagen');
    } finally {
      setLiveLoading(false);
    }
  }, []);

  // ── Fetch live forces ──
  const fetchForceData = useCallback(async () => {
    setForcesLoading(true);
    try {
      const { forces: live } = await fetchLiveForces();
      setLiveForces(live);
      setForcesCount(live.length);
    } catch (err) {
      console.error('Force fetch failed:', err);
    } finally {
      setForcesLoading(false);
    }
  }, []);

  // Auto-fetch on mount + 5min refresh
  useEffect(() => {
    fetchLiveData();
    fetchForceData();
    refreshTimer.current = setInterval(() => {
      fetchLiveData();
      fetchForceData();
    }, 5 * 60 * 1000);
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [fetchLiveData, fetchForceData]);

  // ── Merged events: live + manual + fallback ──
  const allEvents = useMemo(() => {
    const live = liveEvents.length > 0 ? liveEvents : [];
    const manual = manualEvents;
    const fallback = liveEvents.length === 0 && !liveLoading ? SAMPLE_EVENTS : [];
    return [...manual, ...live, ...fallback];
  }, [liveEvents, manualEvents, liveLoading]);

  // ── All forces: live tracked + static bases ──
  const allForces = useMemo(() => {
    return [...liveForces, ...STATIC_BASES];
  }, [liveForces]);

  // ── State ──
  const [analyses] = useState<AnalysisNote[]>(SAMPLE_ANALYSIS);
  const [sidePanel, setSidePanel] = useState<SidePanel>('events');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedForce, setSelectedForce] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [actorFilter, setActorFilter] = useState<Actor | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showTimeline, setShowTimeline] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  // Layer visibility
  const [layers, setLayers] = useState({
    air: true, naval: true, troops: true, missile: true, base: true, proxy: true,
    missileRanges: false, heatmap: false,
  });
  const toggleLayer = (key: keyof typeof layers) => setLayers(l => ({ ...l, [key]: !l[key] }));

  // ── ESC handler ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode !== 'view') {
          osint.setMode('view');
          osint.clearPendingArrow();
          osint.setPendingUnit(null);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, osint]);

  // ── Filtered events ──
  const filteredEvents = useMemo(() => {
    let result = allEvents;

    // Time range
    if (timeRange !== 'all') {
      const days = parseInt(timeRange);
      const cutoff = Date.now() - days * 86400000;
      result = result.filter(e => new Date(e.date).getTime() > cutoff);
    }

    if (actorFilter) result = result.filter(e => e.actor === actorFilter);
    if (categoryFilter) result = result.filter(e => e.category === categoryFilter);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allEvents, timeRange, actorFilter, categoryFilter, searchText]);

  // ── Stats ──
  const stats = useMemo(() => ({
    total: filteredEvents.length,
    confirmed: filteredEvents.filter(e => e.verification === 'confirmed').length,
    highSig: filteredEvents.filter(e => e.strategicSignificance >= 4).length,
    actors: new Set(filteredEvents.map(e => e.actor)).size,
    usaEvents: filteredEvents.filter(e => e.actor === 'usa').length,
    iranEvents: filteredEvents.filter(e => e.actor === 'iran' || e.actor === 'proxy-iran').length,
    live: liveCount,
    units: customUnits.length,
    forces: forcesCount,
  }), [filteredEvents, liveCount, customUnits.length, forcesCount]);

  // ── Timeline data ──
  const timelineData = useMemo(() => {
    const sorted = [...filteredEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(e => ({
      ...e,
      actorCfg: ACTOR_CONFIG[e.actor],
      catCfg: CATEGORY_CONFIG[e.category],
    }));
  }, [filteredEvents]);

  // ── Map markers: only show categories with enabled layers ──
  const visibleEvents = useMemo(() => {
    return filteredEvents.filter(e => {
      if (e.category === 'air' && !layers.air) return false;
      if (e.category === 'naval' && !layers.naval) return false;
      if (e.category === 'troops' && !layers.troops) return false;
      if (e.category === 'missile' && !layers.missile) return false;
      if (e.category === 'base' && !layers.base) return false;
      if (e.category === 'proxy' && !layers.proxy) return false;
      return true;
    });
  }, [filteredEvents, layers]);

  const handleEventClick = useCallback((id: string) => {
    setSelectedEvent(id);
    const evt = allEvents.find(e => e.id === id);
    if (evt) {
      setFlyTarget({ lat: evt.lat, lng: evt.lng, zoom: 7 });
      if (sidePanel !== 'events') setSidePanel('events');
    }
  }, [allEvents, sidePanel]);

  const handleForceClick = useCallback((id: string) => {
    setSelectedForce(id);
    const f = allForces.find(fd => fd.id === id);
    if (f) {
      setFlyTarget({ lat: f.lat, lng: f.lng, zoom: 7 });
      if (sidePanel !== 'forces') setSidePanel('forces');
    }
  }, [allForces, sidePanel]);

  const clearFilters = () => {
    setActorFilter(null);
    setCategoryFilter(null);
    setSearchText('');
    setTimeRange('7d');
  };
  const hasFilters = actorFilter || categoryFilter || searchText.trim() || timeRange !== '7d';

  const selectedEventData = selectedEvent ? allEvents.find(e => e.id === selectedEvent) : null;

  return (
    <div className="flex-1 flex flex-col bg-[#0a0f1a] overflow-hidden" style={{ fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace' }}>

      {/* ═══ CLASSIFICATION BANNER ═══ */}
      <div className="shrink-0" style={{
        background: 'linear-gradient(90deg, rgba(59,130,246,0.06), rgba(239,68,68,0.06), rgba(59,130,246,0.06))',
        borderBottom: '1px solid rgba(59,130,246,0.12)',
      }}>
        <div className="flex items-center justify-center py-0.5 gap-4">
          <span className="text-[8px] font-bold tracking-[0.25em]" style={{ color: 'rgba(59,130,246,0.5)' }}>
            OSINT LAGEPLATTFORM — OFFENE QUELLEN — KEINE VERSCHLUSSSACHE
          </span>
        </div>
      </div>

      {/* ═══ MODE INDICATOR BAR ═══ */}
      {mode !== 'view' && (
        <div className="shrink-0 flex items-center justify-center gap-3 py-1.5 px-4"
          style={{
            background: mode === 'place-unit'
              ? 'linear-gradient(90deg, rgba(34,197,94,0.10), rgba(34,197,94,0.04))'
              : 'linear-gradient(90deg, rgba(249,115,22,0.10), rgba(249,115,22,0.04))',
            borderBottom: `1px solid ${mode === 'place-unit' ? 'rgba(34,197,94,0.25)' : 'rgba(249,115,22,0.25)'}`,
          }}>
          <span className="text-[10px] font-black tracking-[0.2em] uppercase animate-pulse"
            style={{ color: mode === 'place-unit' ? '#22c55e' : '#f97316' }}>
            {mode === 'place-unit' ? '⊕ PLATZIERUNGSMODUS — Klicke auf die Karte' : '→ PFEIL ZEICHNEN — Klicke Punkte, Rechtsklick = Fertig'}
          </span>
          <button onClick={() => { osint.setMode('view'); osint.clearPendingArrow(); osint.setPendingUnit(null); }}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.10)' }}>
            ESC Abbrechen
          </button>
        </div>
      )}

      {/* ═══ HEADER ═══ */}
      <div className="shrink-0 bg-[#0d1321] border-b border-[rgba(255,255,255,0.06)] px-4 py-2.5">
        <div className="flex items-center gap-3">

          {/* Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center relative"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <Globe size={18} className="text-blue-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 animate-pulse"
                style={{ boxShadow: '0 0 6px rgba(74,222,128,0.5)' }} />
            </div>
            <div>
              <h1 className="text-[14px] font-black tracking-tight text-white uppercase">OSINT Lageplattform</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-gray-500 tracking-wider">LIVE INTEL — NAHER OSTEN</span>
                <span className="text-[9px] text-gray-600">|</span>
                {liveLoading ? (
                  <span className="text-[9px] text-yellow-500 flex items-center gap-1">
                    <RefreshCw size={8} className="animate-spin" /> Laden...
                  </span>
                ) : liveError ? (
                  <span className="text-[9px] text-red-400 flex items-center gap-1">
                    <WifiOff size={8} /> {liveError}
                  </span>
                ) : (
                  <span className="text-[9px] text-green-400 flex items-center gap-1">
                    <Wifi size={8} /> {liveCount} Live-Meldungen
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-2 ml-4">
            {[
              { label: 'EREIGNISSE', value: stats.total, color: '#3b82f6', icon: <Hash size={9} /> },
              { label: 'LIVE', value: stats.live, color: '#22c55e', icon: <Wifi size={9} /> },
              { label: 'KRÄFTE', value: stats.forces, color: '#f97316', icon: <Shield size={9} /> },
              { label: 'USA', value: stats.usaEvents, color: '#3b82f6', icon: <span className="text-[8px]">🇺🇸</span> },
              { label: 'IRAN+', value: stats.iranEvents, color: '#ef4444', icon: <span className="text-[8px]">🇮🇷</span> },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md" style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="text-[8px] font-bold text-gray-500 tracking-wider">{s.label}</span>
                <span className="text-[13px] font-black" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* Live refresh button */}
          <button onClick={() => { fetchLiveData(); fetchForceData(); }} disabled={liveLoading || forcesLoading}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[9px] font-bold transition-all"
            style={{ background: 'rgba(34,197,94,0.08)', color: (liveLoading || forcesLoading) ? '#6b7280' : '#22c55e', border: '1px solid rgba(34,197,94,0.20)' }}>
            <RefreshCw size={10} className={(liveLoading || forcesLoading) ? 'animate-spin' : ''} />
            <span className="hidden xl:inline">Refresh</span>
          </button>

          {/* Panel toggles */}
          <div className="flex items-center gap-1">
            {([
              { id: 'events' as SidePanel, label: 'Ereignisse', icon: <MapPin size={12} /> },
              { id: 'forces' as SidePanel, label: 'Kräfte', icon: <Shield size={12} /> },
              { id: 'analysis' as SidePanel, label: 'Analyse', icon: <Lightbulb size={12} /> },
              { id: 'tools' as SidePanel, label: 'Werkzeuge', icon: <Crosshair size={12} /> },
            ]).map(p => (
              <button key={p.id} onClick={() => setSidePanel(sidePanel === p.id ? 'none' : p.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all"
                style={sidePanel === p.id ? {
                  background: p.id === 'tools' ? 'rgba(167,139,250,0.12)' : 'rgba(59,130,246,0.12)',
                  color: p.id === 'tools' ? '#a78bfa' : '#60a5fa',
                  border: `1px solid ${p.id === 'tools' ? 'rgba(167,139,250,0.25)' : 'rgba(59,130,246,0.25)'}`,
                } : {
                  background: 'rgba(255,255,255,0.03)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                {p.icon}
                <span className="hidden xl:inline">{p.label}</span>
              </button>
            ))}
          </div>

          {/* Timeline toggle */}
          <button onClick={() => setShowTimeline(t => !t)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all"
            style={showTimeline ? {
              background: 'rgba(234,179,8,0.12)', color: '#eab308', border: '1px solid rgba(234,179,8,0.25)',
            } : {
              background: 'rgba(255,255,255,0.03)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.06)',
            }}>
            <Calendar size={12} />
            <span className="hidden xl:inline">Timeline</span>
          </button>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LAYER SIDEBAR (narrow) ── */}
        <div className="w-[52px] shrink-0 bg-[#0d1321] border-r border-[rgba(255,255,255,0.06)] flex flex-col items-center py-3 gap-1.5 overflow-y-auto scrollbar-thin">
          <span className="text-[7px] font-bold text-gray-600 tracking-[0.15em] mb-1">LAYER</span>
          {([
            { key: 'air' as keyof typeof layers, icon: <Plane size={14} />, label: 'Luft', color: CATEGORY_CONFIG.air.color },
            { key: 'naval' as keyof typeof layers, icon: <Anchor size={14} />, label: 'Marine', color: CATEGORY_CONFIG.naval.color },
            { key: 'troops' as keyof typeof layers, icon: <Users size={14} />, label: 'Truppen', color: CATEGORY_CONFIG.troops.color },
            { key: 'missile' as keyof typeof layers, icon: <Rocket size={14} />, label: 'Raketen', color: CATEGORY_CONFIG.missile.color },
            { key: 'base' as keyof typeof layers, icon: <Building2 size={14} />, label: 'Basen', color: CATEGORY_CONFIG.base.color },
            { key: 'proxy' as keyof typeof layers, icon: <Zap size={14} />, label: 'Proxy', color: CATEGORY_CONFIG.proxy.color },
          ]).map(l => (
            <button key={l.key} onClick={() => toggleLayer(l.key)}
              className="w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all"
              style={layers[l.key] ? {
                background: `${l.color}15`, border: `1px solid ${l.color}30`, color: l.color,
              } : {
                background: 'transparent', border: '1px solid rgba(255,255,255,0.04)', color: '#374151',
              }}
              title={l.label}>
              {l.icon}
              <span className="text-[6px] font-bold tracking-wider">{l.label.slice(0, 4).toUpperCase()}</span>
            </button>
          ))}

          <div className="w-8 h-px bg-gray-800 my-1" />

          <button onClick={() => toggleLayer('missileRanges')}
            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all"
            style={layers.missileRanges ? {
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444',
            } : {
              background: 'transparent', border: '1px solid rgba(255,255,255,0.04)', color: '#374151',
            }}
            title="Raketenreichweiten">
            <Target size={14} />
            <span className="text-[6px] font-bold tracking-wider">RANGE</span>
          </button>
        </div>

        {/* ── MAP ── */}
        <div className="flex-1 relative">
          <MapContainer
            center={[28.0, 50.0]}
            zoom={5}
            className="w-full h-full"
            style={{ background: '#0a0f1a' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            />

            <MapClickHandler />

            {flyTarget && <FlyToEvent lat={flyTarget.lat} lng={flyTarget.lng} zoom={flyTarget.zoom} />}

            {/* Missile ranges */}
            {layers.missileRanges && SAMPLE_MISSILE_RANGES.map(mr => (
              <Circle key={mr.id}
                center={[mr.lat, mr.lng]}
                radius={mr.rangeKm * 1000}
                pathOptions={{
                  color: ACTOR_CONFIG[mr.actor].color,
                  fillColor: mr.color,
                  fillOpacity: 0.08,
                  weight: 1,
                  dashArray: '8,6',
                  opacity: 0.4,
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <strong>{mr.name}</strong><br />
                    Typ: {mr.type} | Reichweite: {mr.rangeKm}km
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Event markers */}
            {visibleEvents.map(evt => {
              const actorCfg = ACTOR_CONFIG[evt.actor];
              const catCfg = CATEGORY_CONFIG[evt.category];
              const isSelected = selectedEvent === evt.id;
              const isLive = evt.id.startsWith('live-');
              return (
                <Marker key={evt.id}
                  position={[evt.lat, evt.lng]}
                  icon={createIcon(
                    isSelected ? '#ffffff' : actorCfg.color,
                    catCfg.symbol,
                    isSelected ? 36 : isLive ? 24 : 28,
                  )}
                  eventHandlers={{ click: () => handleEventClick(evt.id) }}>
                  <Popup>
                    <div style={{ minWidth: 260, maxWidth: 320 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 16 }}>{actorCfg.flag}</span>
                        <span style={{ fontSize: 16 }}>{catCfg.symbol}</span>
                        <strong style={{ fontSize: 12 }}>{evt.title}</strong>
                      </div>
                      {isLive && (
                        <div style={{ fontSize: 9, color: '#22c55e', fontWeight: 700, marginBottom: 4 }}>
                          LIVE INTEL
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>
                        {formatDateTime(evt.date)} | {evt.location}
                      </div>
                      <div style={{ fontSize: 10, color: '#888', marginBottom: 6, lineHeight: 1.4 }}>
                        {evt.description.slice(0, 200)}...
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 9, padding: '2px 6px', borderRadius: 4,
                          background: CONFIDENCE_CONFIG[evt.confidence].color + '20',
                          color: CONFIDENCE_CONFIG[evt.confidence].color,
                          fontWeight: 700,
                        }}>
                          {evt.confidence} — {CONFIDENCE_CONFIG[evt.confidence].labelDE}
                        </span>
                        <span style={{
                          fontSize: 9, padding: '2px 6px', borderRadius: 4,
                          background: VERIFICATION_CONFIG[evt.verification].bg,
                          color: VERIFICATION_CONFIG[evt.verification].color,
                          fontWeight: 700,
                        }}>
                          {VERIFICATION_CONFIG[evt.verification].labelDE}
                        </span>
                      </div>
                      {evt.sources.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          {evt.sources.map(src => (
                            <a key={src.id} href={src.url} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 9, color: '#60a5fa', display: 'block', marginTop: 2 }}>
                              {src.name} ↗
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Live Force deployment markers */}
            {allForces.filter(f => {
              const cat = f.category;
              if (cat === 'air' && !layers.air) return false;
              if (cat === 'naval' && !layers.naval) return false;
              if (cat === 'troops' && !layers.troops) return false;
              if (cat === 'missile' && !layers.missile) return false;
              if (cat === 'base' && !layers.base) return false;
              if (cat === 'proxy' && !layers.proxy) return false;
              return true;
            }).map(f => {
              const actorCfg = ACTOR_CONFIG[f.actor];
              const isLive = f.id.startsWith('live-force-');
              const confColors = { high: '#22c55e', medium: '#eab308', low: '#6b7280' };
              return (
                <Marker key={f.id}
                  position={[f.lat, f.lng]}
                  icon={createIcon(actorCfg.color, CATEGORY_CONFIG[f.category].symbol, isLive ? 26 : 20)}
                  eventHandlers={{ click: () => handleForceClick(f.id) }}>
                  <Popup>
                    <div style={{ minWidth: 260, maxWidth: 340 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>{actorCfg.flag}</span>
                        <strong style={{ fontSize: 11 }}>{f.unitName}</strong>
                      </div>
                      {isLive && (
                        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                          <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 700 }}>LIVE TRACKING</span>
                          <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: `${confColors[f.confidence]}15`, color: confColors[f.confidence], fontWeight: 700 }}>
                            {f.confidence === 'high' ? 'HOHE KONFIDENZ' : f.confidence === 'medium' ? 'MITTLERE KONFIDENZ' : 'NIEDRIGE KONFIDENZ'}
                          </span>
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: '#666' }}>{f.unitType} | {f.location}</div>
                      <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{f.strength}</div>
                      {f.articles.length > 0 && (
                        <div style={{ marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 4 }}>
                          <div style={{ fontSize: 8, color: '#888', fontWeight: 700, marginBottom: 3 }}>QUELLEN ({f.articles.length}):</div>
                          {f.articles.slice(0, 3).map((a, i) => (
                            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 9, color: '#60a5fa', display: 'block', marginBottom: 2, lineHeight: 1.3 }}>
                              {a.title.slice(0, 80)}{a.title.length > 80 ? '...' : ''} ({a.source}) ↗
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* ═══ CUSTOM UNITS (draggable) ═══ */}
            {customUnits.map(unit => {
              const cfg = UNIT_TYPE_CONFIG[unit.unitType];
              const actorCfg = ACTOR_CONFIG[unit.actor];
              return (
                <Marker key={unit.id}
                  position={[unit.lat, unit.lng]}
                  icon={createUnitIcon(actorCfg.color, cfg.symbol)}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      const pos = marker.getLatLng();
                      osint.updateUnit(unit.id, { lat: pos.lat, lng: pos.lng });
                    },
                    click: () => osint.setSelectedUnitId(unit.id),
                  }}>
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>{cfg.symbol}</span>
                        <span style={{ fontSize: 14 }}>{actorCfg.flag}</span>
                        <strong style={{ fontSize: 12, color: actorCfg.color }}>{unit.label}</strong>
                      </div>
                      <div style={{ fontSize: 10, color: '#666' }}>{cfg.nameDE} | {actorCfg.name}</div>
                      <div style={{ fontSize: 9, color: '#888', marginTop: 2 }}>
                        {unit.lat.toFixed(2)}°N, {unit.lng.toFixed(2)}°E
                      </div>
                      {unit.notes && <div style={{ fontSize: 9, color: '#aaa', marginTop: 4 }}>{unit.notes}</div>}
                      <div style={{ fontSize: 9, color: '#555', marginTop: 4, fontStyle: 'italic' }}>
                        Drag zum Verschieben
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* ═══ WIRKUNGSPFEILE ═══ */}
            {arrows.map(arrow => {
              const cfg = ARROW_TYPE_CONFIG[arrow.arrowType];
              void ACTOR_CONFIG[arrow.actor];
              const lastIdx = arrow.points.length - 1;
              const angle = lastIdx > 0 ? calcArrowAngle(arrow.points[lastIdx - 1], arrow.points[lastIdx]) : 0;
              return (
                <span key={arrow.id}>
                  <Polyline
                    positions={arrow.points}
                    pathOptions={{
                      color: cfg.color,
                      weight: 3,
                      opacity: 0.8,
                      dashArray: cfg.dashArray,
                    }}
                    eventHandlers={{ click: () => osint.setSelectedArrowId(arrow.id) }}
                  />
                  {/* Arrowhead at end */}
                  {arrow.points.length >= 2 && (
                    <Marker
                      position={arrow.points[lastIdx]}
                      icon={createArrowhead(cfg.color, angle)}
                      interactive={false}
                    />
                  )}
                </span>
              );
            })}

            {/* Pending arrow preview */}
            {pendingArrowPoints.length >= 1 && (
              <Polyline
                positions={pendingArrowPoints}
                pathOptions={{
                  color: ARROW_TYPE_CONFIG[osint.pendingArrowType].color,
                  weight: 2,
                  opacity: 0.5,
                  dashArray: '6,6',
                }}
              />
            )}
          </MapContainer>

          {/* Map overlay: Actor legend */}
          <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1 p-2.5 rounded-lg"
            style={{ background: 'rgba(10,15,26,0.85)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
            <span className="text-[8px] font-bold text-gray-500 tracking-[0.15em] mb-0.5">AKTEURE</span>
            {Object.entries(ACTOR_CONFIG).map(([id, cfg]) => (
              <button key={id}
                onClick={() => setActorFilter(actorFilter === id as Actor ? null : id as Actor)}
                className="flex items-center gap-2 px-2 py-1 rounded transition-all text-left"
                style={actorFilter === id ? {
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                } : {
                  border: '1px solid transparent',
                }}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}40` }} />
                <span className="text-[9px] font-bold" style={{ color: actorFilter === id ? cfg.color : '#9ca3af' }}>
                  {cfg.flag} {cfg.name}
                </span>
              </button>
            ))}
          </div>

          {/* Map overlay: Zoom controls */}
          <div className="absolute bottom-4 right-3 z-[1000] flex flex-col gap-1">
            <button onClick={() => setFlyTarget({ lat: 28, lng: 50, zoom: 5 })}
              className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-white transition-all"
              style={{ background: 'rgba(10,15,26,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}
              title="Übersicht">
              <Globe size={14} />
            </button>
          </div>
        </div>

        {/* ═══ SIDE PANEL ═══ */}
        {sidePanel !== 'none' && (
          <div className="w-[380px] shrink-0 bg-[#0d1321] border-l border-[rgba(255,255,255,0.06)] flex flex-col overflow-hidden">

            {/* ── TOOLS PANEL (NEW) ── */}
            {sidePanel === 'tools' && (
              <>
                <div className="shrink-0 p-3 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Crosshair size={13} className="text-purple-400" />
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.1em]">Lage-Werkzeuge</span>
                    <div className="flex-1" />
                    <button onClick={() => setSidePanel('none')}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-white transition-all">
                      <X size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
                  <UnitPalette />
                  <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <ArrowTools />
                </div>
              </>
            )}

            {/* ── EVENTS PANEL ── */}
            {sidePanel === 'events' && (
              <>
                <div className="shrink-0 p-3 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={13} className="text-blue-400" />
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.1em]">Ereignisprotokoll</span>
                    <div className="flex-1" />
                    <button onClick={() => setShowAddEvent(true)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold text-blue-400 transition-all"
                      style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.20)' }}>
                      <Plus size={10} /> Neu
                    </button>
                    <button onClick={() => setSidePanel('none')}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-white transition-all">
                      <X size={12} />
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Time range */}
                    <div className="flex items-center gap-0.5 p-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {(['7d', '14d', '30d', 'all'] as TimeRange[]).map(tr => (
                        <button key={tr} onClick={() => setTimeRange(tr)}
                          className="px-2 py-0.5 rounded text-[8px] font-bold transition-all"
                          style={timeRange === tr ? { background: 'rgba(59,130,246,0.15)', color: '#60a5fa' } : { color: '#6b7280' }}>
                          {tr === 'all' ? 'ALLE' : tr.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {/* Category filter */}
                    <div className="flex items-center gap-0.5">
                      {Object.entries(CATEGORY_CONFIG).slice(0, 6).map(([id, cfg]) => (
                        <button key={id}
                          onClick={() => setCategoryFilter(categoryFilter === id as EventCategory ? null : id as EventCategory)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[10px] transition-all"
                          style={categoryFilter === id ? {
                            background: `${cfg.color}20`, border: `1px solid ${cfg.color}40`,
                          } : {
                            border: '1px solid rgba(255,255,255,0.04)',
                          }}
                          title={cfg.nameDE}>
                          {cfg.symbol}
                        </button>
                      ))}
                    </div>

                    {hasFilters && (
                      <button onClick={clearFilters} className="text-[8px] font-bold text-red-400 hover:text-red-300 transition-colors">
                        <X size={10} />
                      </button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative mt-2">
                    <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)}
                      placeholder="Suchen..."
                      className="w-full pl-7 pr-3 py-1.5 rounded-md text-[10px] text-white placeholder:text-gray-600 outline-none"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
                  </div>
                </div>

                {/* Event list */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  {filteredEvents.length === 0 && (
                    <div className="p-6 text-center">
                      <span className="text-[10px] text-gray-500">
                        {liveLoading ? 'Lade Live-Daten...' : 'Keine Ereignisse gefunden'}
                      </span>
                    </div>
                  )}
                  {filteredEvents.map((evt) => {
                    const actorCfg = ACTOR_CONFIG[evt.actor];
                    const catCfg = CATEGORY_CONFIG[evt.category];
                    const confCfg = CONFIDENCE_CONFIG[evt.confidence];
                    const verCfg = VERIFICATION_CONFIG[evt.verification];
                    const isSelected = selectedEvent === evt.id;
                    const isLive = evt.id.startsWith('live-');

                    return (
                      <div key={evt.id}
                        onClick={() => handleEventClick(evt.id)}
                        className="px-3 py-2.5 border-b cursor-pointer transition-all"
                        style={{
                          borderColor: 'rgba(255,255,255,0.04)',
                          background: isSelected ? `${actorCfg.color}08` : undefined,
                          boxShadow: isSelected ? `inset 3px 0 0 ${actorCfg.color}` : undefined,
                        }}>

                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-[13px]"
                            style={{ background: `${actorCfg.color}15`, border: `1px solid ${actorCfg.color}30` }}>
                            {catCfg.symbol}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {isLive && (
                                <span className="text-[7px] font-black px-1 py-0.5 rounded tracking-wider"
                                  style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                                  LIVE
                                </span>
                              )}
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: actorCfg.bg, color: actorCfg.color }}>{actorCfg.flag} {actorCfg.name}</span>
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${confCfg.color}12`, color: confCfg.color }}>{evt.confidence}</span>
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: verCfg.bg, color: verCfg.color }}>{verCfg.labelDE}</span>
                            </div>
                            <p className="text-[11px] font-bold text-white leading-snug mb-0.5" style={{
                              display: '-webkit-box', WebkitLineClamp: isSelected ? 5 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {evt.title}
                            </p>
                            <div className="flex items-center gap-2 text-[9px] text-gray-500">
                              <span className="flex items-center gap-0.5"><Clock size={8} /> {formatDate(evt.date)}</span>
                              <span className="flex items-center gap-0.5"><MapPin size={8} /> {evt.location}</span>
                            </div>

                            {/* Expanded event detail */}
                            {isSelected && selectedEventData && (
                              <div className="mt-2.5 space-y-2">
                                <p className="text-[10px] text-gray-400 leading-relaxed">{selectedEventData.description}</p>

                                {/* Strategic significance */}
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Strategische Bedeutung:</span>
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(n => (
                                      <Star key={n} size={10}
                                        fill={n <= selectedEventData.strategicSignificance ? '#eab308' : 'transparent'}
                                        className={n <= selectedEventData.strategicSignificance ? 'text-yellow-500' : 'text-gray-700'} />
                                    ))}
                                  </div>
                                </div>

                                {/* Sources */}
                                <div>
                                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                                    <Link2 size={8} /> Quellen ({selectedEventData.sources.length})
                                  </span>
                                  <div className="space-y-1">
                                    {selectedEventData.sources.map(src => (
                                      <div key={src.id} className="flex items-center gap-2 px-2 py-1.5 rounded"
                                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                                          style={{ background: `${CONFIDENCE_CONFIG[src.reliability].color}12`, color: CONFIDENCE_CONFIG[src.reliability].color }}>
                                          {src.reliability}
                                        </span>
                                        <span className="text-[9px] text-gray-400 flex-1 truncate">{src.name}</span>
                                        <span className="text-[8px] text-gray-600 capitalize">{src.type}</span>
                                        <a href={src.url} target="_blank" rel="noopener noreferrer"
                                          className="text-gray-600 hover:text-blue-400 transition-colors" onClick={e => e.stopPropagation()}>
                                          <ExternalLink size={9} />
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Tags */}
                                <div className="flex items-center gap-1 flex-wrap">
                                  {selectedEventData.tags.map(tag => (
                                    <span key={tag} className="text-[8px] font-mono px-1.5 py-0.5 rounded text-gray-500"
                                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                      #{tag}
                                    </span>
                                  ))}
                                </div>

                                {/* Version info */}
                                <div className="flex items-center gap-2 text-[8px] text-gray-600 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                  <History size={8} />
                                  <span>Version {selectedEventData.version}</span>
                                  <span>|</span>
                                  <span>Geändert: {formatDateTime(selectedEventData.lastModified)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── FORCES PANEL (LIVE) ── */}
            {sidePanel === 'forces' && (
              <>
                <div className="shrink-0 p-3 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={13} className="text-green-400" />
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.1em]">Live Kräfteaufwuchs</span>
                    <div className="flex-1" />
                    {forcesLoading && (
                      <span className="text-[9px] text-yellow-500 flex items-center gap-1">
                        <RefreshCw size={9} className="animate-spin" /> Tracking...
                      </span>
                    )}
                    <button onClick={() => setSidePanel('none')}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-white transition-all">
                      <X size={12} />
                    </button>
                  </div>

                  {/* Force summary by actor */}
                  <div className="grid grid-cols-2 gap-2">
                    {(['usa', 'iran'] as Actor[]).map(actor => {
                      const cfg = ACTOR_CONFIG[actor];
                      const actorForces = allForces.filter(f => f.actor === actor || (actor === 'iran' && (f.actor === 'proxy-iran')));
                      const liveCount = actorForces.filter(f => f.id.startsWith('live-force-')).length;
                      return (
                        <div key={actor} className="p-2 rounded-lg" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm">{cfg.flag}</span>
                            <span className="text-[10px] font-black tracking-wider" style={{ color: cfg.color }}>{cfg.name}</span>
                          </div>
                          <div className="text-[18px] font-black" style={{ color: cfg.color }}>{actorForces.length}</div>
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] text-gray-500">Einheiten</span>
                            {liveCount > 0 && (
                              <span className="text-[7px] font-bold px-1 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                                {liveCount} LIVE
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Info hint */}
                  <div className="mt-2 flex items-center gap-1.5 px-2 py-1.5 rounded-md"
                    style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
                    <Info size={9} className="text-blue-400 shrink-0" />
                    <span className="text-[8px] text-blue-300/70">
                      Kräfte werden aus aktuellen GDELT-Meldungen der letzten 7 Tage extrahiert. Positionen basieren auf Artikelkontext.
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  {/* Live tracked forces first */}
                  {liveForces.length > 0 && (
                    <div>
                      <div className="sticky top-0 z-10 px-3 py-1.5 flex items-center gap-2"
                        style={{ background: 'rgba(13,19,33,0.95)', borderBottom: '1px solid rgba(34,197,94,0.25)' }}>
                        <Wifi size={10} className="text-green-400" />
                        <span className="text-[10px] font-black tracking-[0.1em] uppercase text-green-400">LIVE TRACKING</span>
                        <span className="text-[9px] text-gray-500 font-mono">{liveForces.length}</span>
                      </div>
                      {liveForces.map(f => {
                        const actorCfg = ACTOR_CONFIG[f.actor];
                        const catCfg = CATEGORY_CONFIG[f.category];
                        const isSelected = selectedForce === f.id;
                        const confColors = { high: '#22c55e', medium: '#eab308', low: '#6b7280' };
                        const confDE = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' };
                        const statusColors: Record<string, string> = { active: '#22c55e', deploying: '#eab308', withdrawn: '#6b7280', alert: '#ef4444' };
                        const statusDE: Record<string, string> = { active: 'Aktiv', deploying: 'Verlegung', withdrawn: 'Abgezogen', alert: 'Alarmiert' };
                        return (
                          <div key={f.id}
                            onClick={() => handleForceClick(f.id)}
                            className="px-3 py-2.5 border-b cursor-pointer transition-all"
                            style={{
                              borderColor: 'rgba(255,255,255,0.04)',
                              background: isSelected ? `${actorCfg.color}08` : undefined,
                              boxShadow: isSelected ? `inset 3px 0 0 ${actorCfg.color}` : undefined,
                            }}>
                            <div className="flex items-start gap-2">
                              <span className="text-lg mt-0.5">{catCfg.symbol}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                  <span className="text-[8px] font-bold px-1 py-0.5 rounded" style={{ background: actorCfg.bg, color: actorCfg.color }}>{actorCfg.flag}</span>
                                  <span className="text-[11px] font-bold text-white flex-1 min-w-0 truncate">{f.unitName}</span>
                                  <span className="text-[7px] font-bold px-1 py-0.5 rounded shrink-0"
                                    style={{ background: `${confColors[f.confidence]}15`, color: confColors[f.confidence], border: `1px solid ${confColors[f.confidence]}30` }}>
                                    {confDE[f.confidence]}
                                  </span>
                                  <span className="text-[7px] font-bold px-1 py-0.5 rounded shrink-0"
                                    style={{ background: `${statusColors[f.status]}15`, color: statusColors[f.status], border: `1px solid ${statusColors[f.status]}30` }}>
                                    {statusDE[f.status]}
                                  </span>
                                </div>
                                <div className="text-[9px] text-gray-500">{f.unitType}</div>
                                <div className="text-[9px] text-gray-400 mt-0.5 flex items-center gap-1">
                                  <MapPin size={8} /> {f.location}
                                  <span className="text-gray-600 ml-auto">{f.articles.length} Quellen</span>
                                </div>

                                {/* Expanded: show details + source articles */}
                                {isSelected && (
                                  <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-1 text-[9px] text-gray-400">
                                      <Users size={9} /> {f.strength}
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] text-gray-500">
                                      <Calendar size={9} /> Letzte Meldung: {formatDateTime(f.since)}
                                    </div>

                                    {/* Source articles */}
                                    {f.articles.length > 0 && (
                                      <div>
                                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                                          <Link2 size={8} /> Aktuelle Meldungen
                                        </span>
                                        <div className="space-y-1">
                                          {f.articles.slice(0, 5).map((a, i) => (
                                            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                                              onClick={e => e.stopPropagation()}
                                              className="block px-2 py-1.5 rounded transition-all hover:bg-white/[0.03]"
                                              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                              <div className="text-[9px] text-blue-400 leading-snug" style={{
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                              }}>
                                                {a.title}
                                              </div>
                                              <div className="flex items-center gap-2 mt-0.5 text-[7px] text-gray-600">
                                                <span>{a.source}</span>
                                                <span>{formatDate(a.date)}</span>
                                                <ExternalLink size={7} className="ml-auto" />
                                              </div>
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Static bases grouped by actor */}
                  {(['usa', 'iran'] as Actor[]).map(actor => {
                    const bases = STATIC_BASES.filter(f => f.actor === actor);
                    if (bases.length === 0) return null;
                    const cfg = ACTOR_CONFIG[actor];
                    return (
                      <div key={`static-${actor}`}>
                        <div className="sticky top-0 z-10 px-3 py-1.5 flex items-center gap-2"
                          style={{ background: 'rgba(13,19,33,0.95)', borderBottom: `1px solid ${cfg.border}` }}>
                          <Building2 size={10} style={{ color: cfg.color }} />
                          <span className="text-[10px] font-black tracking-[0.1em] uppercase" style={{ color: cfg.color }}>
                            {cfg.flag} Permanente Basen
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono">{bases.length}</span>
                        </div>
                        {bases.map(f => {
                          const catCfg = CATEGORY_CONFIG[f.category];
                          const isSelected = selectedForce === f.id;
                          return (
                            <div key={f.id}
                              onClick={() => handleForceClick(f.id)}
                              className="px-3 py-2 border-b cursor-pointer transition-all"
                              style={{
                                borderColor: 'rgba(255,255,255,0.04)',
                                background: isSelected ? `${cfg.color}06` : undefined,
                                boxShadow: isSelected ? `inset 3px 0 0 ${cfg.color}` : undefined,
                              }}>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{catCfg.symbol}</span>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[10px] font-bold text-white">{f.unitName}</span>
                                  <div className="text-[8px] text-gray-500">{f.unitType} | {f.location}</div>
                                  {isSelected && <div className="text-[8px] text-gray-400 mt-1">{f.strength}</div>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Loading state */}
                  {forcesLoading && liveForces.length === 0 && (
                    <div className="p-6 text-center">
                      <RefreshCw size={16} className="animate-spin text-gray-600 mx-auto mb-2" />
                      <span className="text-[10px] text-gray-500">Lade Live-Kräftedaten aus GDELT...</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── ANALYSIS PANEL ── */}
            {sidePanel === 'analysis' && (
              <>
                <div className="shrink-0 p-3 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={13} className="text-yellow-400" />
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.1em]">Analyse & Bewertung</span>
                    <div className="flex-1" />
                    <button onClick={() => setSidePanel('none')}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-white transition-all">
                      <X size={12} />
                    </button>
                  </div>

                  {/* Assessment type legend */}
                  <div className="flex items-center gap-2">
                    {([
                      { type: 'fact' as AssessmentType, label: 'Fakten', color: '#22c55e' },
                      { type: 'assumption' as AssessmentType, label: 'Annahmen', color: '#eab308' },
                      { type: 'assessment' as AssessmentType, label: 'Bewertungen', color: '#3b82f6' },
                    ]).map(t => (
                      <div key={t.type} className="flex items-center gap-1.5 px-2 py-1 rounded"
                        style={{ background: `${t.color}10`, border: `1px solid ${t.color}20` }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                        <span className="text-[9px] font-bold" style={{ color: t.color }}>{t.label}</span>
                        <span className="text-[9px] font-mono text-gray-500">
                          {analyses.filter(a => a.type === t.type).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  {analyses.map(note => {
                    const typeColors: Record<AssessmentType, string> = { fact: '#22c55e', assumption: '#eab308', assessment: '#3b82f6' };
                    const typeLabels: Record<AssessmentType, string> = { fact: 'FAKT', assumption: 'ANNAHME', assessment: 'BEWERTUNG' };
                    const typeIcons: Record<AssessmentType, React.ReactNode> = {
                      fact: <CheckCircle2 size={10} />,
                      assumption: <CircleDot size={10} />,
                      assessment: <Lightbulb size={10} />,
                    };
                    const color = typeColors[note.type];
                    const isExpanded = expandedAnalysis === note.id;

                    return (
                      <div key={note.id}
                        onClick={() => setExpandedAnalysis(isExpanded ? null : note.id)}
                        className="px-3 py-3 border-b cursor-pointer transition-all hover:bg-white/[0.02]"
                        style={{
                          borderColor: 'rgba(255,255,255,0.04)',
                          boxShadow: isExpanded ? `inset 3px 0 0 ${color}` : undefined,
                          background: isExpanded ? `${color}05` : undefined,
                        }}>

                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded tracking-wider"
                            style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                            {typeIcons[note.type]} {typeLabels[note.type]}
                          </span>
                          {note.scenario && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded text-yellow-500"
                              style={{ background: 'rgba(234,179,8,0.10)', border: '1px solid rgba(234,179,8,0.20)' }}>
                              {note.scenario}
                            </span>
                          )}
                          <span className="text-[8px] text-gray-600 ml-auto">{daysAgo(note.date)}</span>
                        </div>

                        <p className="text-[11px] font-bold text-white leading-snug mb-1">{note.title}</p>

                        <p className="text-[10px] text-gray-400 leading-relaxed" style={!isExpanded ? {
                          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        } : undefined}>
                          {note.content}
                        </p>

                        {isExpanded && (
                          <div className="mt-2 space-y-1.5">
                            {note.relatedEventIds.length > 0 && (
                              <div>
                                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                                  <Link2 size={8} /> Verknüpfte Ereignisse ({note.relatedEventIds.length})
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {note.relatedEventIds.map(eid => {
                                    const evt = allEvents.find(e => e.id === eid);
                                    if (!evt) return null;
                                    return (
                                      <button key={eid}
                                        onClick={e => { e.stopPropagation(); handleEventClick(eid); setSidePanel('events'); }}
                                        className="text-[8px] font-mono px-1.5 py-0.5 rounded text-blue-400 hover:text-blue-300 transition-colors truncate max-w-[200px]"
                                        style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                                        {evt.title.slice(0, 40)}...
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-[8px] text-gray-600 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                              <span>Analyst: {note.author}</span>
                              <span>|</span>
                              <span>{formatDateTime(note.date)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ═══ TIMELINE ═══ */}
      {showTimeline && (
        <div className="shrink-0 border-t border-[rgba(255,255,255,0.06)]" style={{ background: 'rgba(13,19,33,0.95)' }}>
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={11} className="text-yellow-400" />
              <span className="text-[9px] font-black text-white uppercase tracking-[0.12em]">ZEITACHSE — ESKALATIONSÜBERSICHT</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
              <span className="text-[8px] text-gray-500 font-mono">{timelineData.length} Ereignisse</span>
            </div>

            <div className="relative overflow-x-auto scrollbar-thin pb-1">
              <div className="flex items-end gap-0.5 min-w-max" style={{ height: 80 }}>
                {timelineData.map((evt) => {
                  const barHeight = 20 + (evt.strategicSignificance / 5) * 50;
                  const isSelected = selectedEvent === evt.id;
                  const isLive = evt.id.startsWith('live-');
                  return (
                    <button key={evt.id}
                      onClick={() => handleEventClick(evt.id)}
                      className="flex flex-col items-center justify-end transition-all group relative"
                      style={{ height: 80, minWidth: isLive ? 16 : 36 }}
                      title={`${formatDate(evt.date)} — ${evt.title}`}>

                      {/* Tooltip on hover */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="px-2 py-1.5 rounded-md text-left whitespace-nowrap"
                          style={{ background: 'rgba(10,15,26,0.95)', border: '1px solid rgba(255,255,255,0.10)' }}>
                          <p className="text-[8px] font-bold text-white" style={{ maxWidth: 200, whiteSpace: 'normal' }}>{evt.title}</p>
                          <p className="text-[7px] text-gray-500 mt-0.5">{formatDate(evt.date)} | {evt.actorCfg.flag} {evt.actorCfg.name}</p>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="rounded-t transition-all group-hover:opacity-90"
                        style={{
                          width: isSelected ? 28 : isLive ? 10 : 22,
                          height: barHeight,
                          background: `linear-gradient(180deg, ${evt.actorCfg.color}, ${evt.actorCfg.color}60)`,
                          boxShadow: isSelected ? `0 0 12px ${evt.actorCfg.color}40` : undefined,
                          border: isSelected ? `2px solid ${evt.actorCfg.color}` : `1px solid ${evt.actorCfg.color}40`,
                          opacity: isSelected ? 1 : 0.7,
                        }}>
                        {!isLive && <div className="w-full h-full flex items-center justify-center text-[9px]">{evt.catCfg.symbol}</div>}
                      </div>

                      {/* Date label */}
                      {!isLive && (
                        <span className="text-[7px] text-gray-600 mt-0.5 font-mono">
                          {new Date(evt.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Escalation indicator line */}
              <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.3) 50%, rgba(239,68,68,0.6) 100%)' }} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ STATUS BAR ═══ */}
      <div className="shrink-0 flex items-center justify-between px-4 py-1"
        style={{ background: 'rgba(10,15,26,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <span className="text-[7px] tracking-[0.2em] text-gray-600">OSINT LAGEPLATTFORM v2.0</span>
          <span className="text-[7px] text-gray-700">|</span>
          <span className="text-[7px] tracking-[0.15em] text-gray-600">OFFENE QUELLEN — KEINE VERSCHLUSSSACHE</span>
          <span className="text-[7px] text-gray-700">|</span>
          <span className="text-[7px] text-gray-600">
            {liveForces.length} Live-Kräfte | {customUnits.length} Eigene | {arrows.length} Pfeile
          </span>
        </div>
        <div className="flex items-center gap-3">
          {mode !== 'view' && (
            <span className="text-[7px] font-bold tracking-wider animate-pulse"
              style={{ color: mode === 'place-unit' ? '#22c55e' : '#f97316' }}>
              {mode === 'place-unit' ? 'PLATZIERUNG' : 'PFEIL-ZEICHNUNG'}
            </span>
          )}
          <span className="text-[7px] text-gray-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {liveLoading ? 'SYNC...' : 'LIVE'}
          </span>
          <span className="text-[7px] text-gray-600 font-mono">{formatTimestamp()}</span>
        </div>
      </div>

      {/* ═══ ADD EVENT MODAL ═══ */}
      {showAddEvent && <AddEventModal onClose={() => setShowAddEvent(false)} />}
    </div>
  );
}

// ══════════════════════════════════════
// ADD EVENT MODAL
// ══════════════════════════════════════

function AddEventModal({ onClose }: { onClose: () => void }) {
  const { addManualEvent } = useOsintStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState('');
  const [actor, setActor] = useState<Actor>('usa');
  const [category, setCategory] = useState<EventCategory>('air');
  const [confidence, setConfidence] = useState<ConfidenceLevel>('C');
  const [verification, setVerification] = useState<'confirmed' | 'unconfirmed' | 'propaganda'>('unconfirmed');
  const [significance, setSignificance] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sources, setSources] = useState<{ id: string; name: string; url: string }[]>([]);
  const [tags, setTags] = useState('');

  const addSource = () => {
    if (sourceName.trim() && sourceUrl.trim()) {
      setSources(s => [...s, { id: `src-${Date.now()}`, name: sourceName.trim(), url: sourceUrl.trim() }]);
      setSourceName('');
      setSourceUrl('');
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const [latStr, lngStr] = coords.split(',').map(s => s.trim());
    const lat = parseFloat(latStr) || 28.0;
    const lng = parseFloat(lngStr) || 48.0;
    const now = new Date().toISOString();

    addManualEvent({
      id: `manual-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || title.trim(),
      date: dateTime ? new Date(dateTime).toISOString() : now,
      lat,
      lng,
      location: location.trim() || 'Unbekannt',
      actor,
      category,
      confidence,
      verification,
      sources: sources.map(s => ({
        id: s.id,
        name: s.name,
        url: s.url,
        type: 'news' as const,
        reliability: confidence,
      })),
      strategicSignificance: significance,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      version: 1,
      lastModified: now,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-[560px] max-h-[80vh] rounded-xl overflow-hidden flex flex-col"
        style={{ background: '#0d1321', border: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Header */}
        <div className="shrink-0 px-5 py-3 flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)]">
          <Plus size={14} className="text-blue-400" />
          <span className="text-[12px] font-black text-white uppercase tracking-wider">Neues Ereignis erfassen</span>
          <div className="flex-1" />
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <FormField label="Titel">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Kurzbeschreibung des Ereignisses..."
              className="w-full px-3 py-2 rounded-md text-[11px] text-white placeholder:text-gray-600 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </FormField>

          <FormField label="Beschreibung">
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Detaillierte Beschreibung..."
              className="w-full px-3 py-2 rounded-md text-[11px] text-white placeholder:text-gray-600 outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Datum / Uhrzeit">
              <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)}
                className="w-full px-3 py-2 rounded-md text-[11px] text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }} />
            </FormField>
            <FormField label="Ort">
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="z.B. Straße von Hormuz"
                className="w-full px-3 py-2 rounded-md text-[11px] text-white placeholder:text-gray-600 outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Koordinaten (Lat, Lng)">
              <input type="text" value={coords} onChange={e => setCoords(e.target.value)}
                placeholder="z.B. 26.56, 56.25"
                className="w-full px-3 py-2 rounded-md text-[11px] text-white placeholder:text-gray-600 outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </FormField>
            <FormField label="Akteur">
              <select value={actor} onChange={e => setActor(e.target.value as Actor)}
                className="w-full px-3 py-2 rounded-md text-[11px] text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {Object.entries(ACTOR_CONFIG).map(([id, cfg]) => (
                  <option key={id} value={id} style={{ background: '#0d1321' }}>{cfg.flag} {cfg.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Kategorie">
              <select value={category} onChange={e => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 rounded-md text-[11px] text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {Object.entries(CATEGORY_CONFIG).map(([id, cfg]) => (
                  <option key={id} value={id} style={{ background: '#0d1321' }}>{cfg.symbol} {cfg.nameDE}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Confidence">
              <select value={confidence} onChange={e => setConfidence(e.target.value as ConfidenceLevel)}
                className="w-full px-3 py-2 rounded-md text-[11px] text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {Object.entries(CONFIDENCE_CONFIG).map(([id, cfg]) => (
                  <option key={id} value={id} style={{ background: '#0d1321' }}>{id} — {cfg.labelDE}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Verifizierung">
              <select value={verification} onChange={e => setVerification(e.target.value as 'confirmed' | 'unconfirmed' | 'propaganda')}
                className="w-full px-3 py-2 rounded-md text-[11px] text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {Object.entries(VERIFICATION_CONFIG).map(([id, cfg]) => (
                  <option key={id} value={id} style={{ background: '#0d1321' }}>{cfg.labelDE}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Strategische Bedeutung">
            <div className="flex items-center gap-1">
              {([1, 2, 3, 4, 5] as const).map(n => (
                <button key={n} onClick={() => setSignificance(n)}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-bold transition-all"
                  style={n <= significance ? {
                    background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.30)', color: '#eab308',
                  } : {
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280',
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </FormField>

          {/* Source section */}
          <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Link2 size={11} className="text-blue-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Quellen</span>
            </div>
            {sources.length > 0 && (
              <div className="space-y-1 mb-2">
                {sources.map(s => (
                  <div key={s.id} className="flex items-center gap-2 px-2 py-1 rounded text-[9px]"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-gray-400 flex-1 truncate">{s.name}</span>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                      <ExternalLink size={8} />
                    </a>
                    <button onClick={() => setSources(prev => prev.filter(x => x.id !== s.id))} className="text-gray-600 hover:text-red-400">
                      <X size={8} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={sourceName} onChange={e => setSourceName(e.target.value)}
                placeholder="Quellenname"
                className="px-3 py-2 rounded-md text-[10px] text-white placeholder:text-gray-600 outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
                placeholder="URL"
                className="px-3 py-2 rounded-md text-[10px] text-white placeholder:text-gray-600 outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <button onClick={addSource}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-md text-[10px] font-bold text-blue-400 transition-all"
                style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.20)' }}>
                <Plus size={10} /> Hinzufügen
              </button>
            </div>
          </div>

          <FormField label="Tags (Kommagetrennt)">
            <input type="text" value={tags} onChange={e => setTags(e.target.value)}
              placeholder="z.B. carrier-strike-group, hormuz, naval-transit"
              className="w-full px-3 py-2 rounded-md text-[11px] text-white placeholder:text-gray-600 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </FormField>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 flex items-center justify-end gap-2 border-t border-[rgba(255,255,255,0.06)]">
          <button onClick={onClose}
            className="px-4 py-2 rounded-md text-[10px] font-bold text-gray-400 transition-all hover:text-white"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Abbrechen
          </button>
          <button onClick={handleSave}
            className="px-4 py-2 rounded-md text-[10px] font-bold text-white transition-all"
            style={{ background: 'rgba(59,130,246,0.8)', border: '1px solid rgba(59,130,246,0.4)' }}>
            Ereignis speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  );
}
