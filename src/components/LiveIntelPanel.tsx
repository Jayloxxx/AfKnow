import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  RefreshCw, Filter, ExternalLink, Clock, Globe, ChevronDown, X, AlertTriangle,
  Shield, DollarSign, Users, Landmark, Crosshair, Search, Settings2, Radio,
  TrendingUp, Zap, ArrowRight, Info, Database, Cpu, Layers, Eye, Map as MapIcon,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRegion } from '../context/RegionContext';
import { fetchNews, fetchCriticalEvents, fetchConflictAxisArticles, matchConflictAxes, getCriticalQueryLabels, type NewsArticle, type NewsTopic, type TimeRange, type RegionId } from '../lib/newsApi';
import { assessConflictAxis, THREAT_CONFIG } from '../lib/lageAnalysis';

// ── Topic color lookup for map dots ──
const TOPIC_COLORS: Record<string, string> = {
  security: '#ef4444', politics: '#a855f7', military: '#f97316',
  economy: '#10b981', humanitarian: '#0ea5e9', diplomacy: '#3b82f6',
};

// ══════════════════════════════════════════
// INTEL MAP — Heatmap + article highlight
// ══════════════════════════════════════════
function IntelMap({ articles, criticalArticles, selectedArticle, onSelectArticle, region }: {
  articles: NewsArticle[];
  criticalArticles: NewsArticle[];
  selectedArticle: NewsArticle | null;
  onSelectArticle: (a: NewsArticle | null) => void;
  region: any;
}) {
  const allArticles = useMemo(() => [...criticalArticles, ...articles], [articles, criticalArticles]);
  const countries = useMemo(() => Object.values(region.countriesById) as any[], [region]);

  // Count articles per country
  const countryCounts = useMemo(() => {
    const counts: Record<string, { total: number; topics: Record<string, number>; isCritical: boolean }> = {};
    for (const a of allArticles) {
      for (const cId of a.countries) {
        if (!counts[cId]) counts[cId] = { total: 0, topics: {}, isCritical: false };
        counts[cId].total++;
        const topic = a.topics[0] ?? 'other';
        counts[cId].topics[topic] = (counts[cId].topics[topic] ?? 0) + 1;
        if (a.id.startsWith('crit_')) counts[cId].isCritical = true;
      }
    }
    return counts;
  }, [allArticles]);

  const maxCount = useMemo(() => Math.max(...Object.values(countryCounts).map(c => c.total), 1), [countryCounts]);

  // Selected article's countries
  const highlightCountries = useMemo(() => {
    if (!selectedArticle) return new Set<string>();
    return new Set(selectedArticle.countries);
  }, [selectedArticle]);

  // Dominant topic for a country → color
  const countryColor = (cId: string): string => {
    const data = countryCounts[cId];
    if (!data) return 'var(--muted)';
    const topTopic = Object.entries(data.topics).sort(([, a], [, b]) => b - a)[0]?.[0];
    return TOPIC_COLORS[topTopic ?? ''] ?? 'var(--accent-400)';
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{
      background: 'color-mix(in srgb, var(--main) 95%, black)',
    }}>
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(var(--accent-500) 1px, transparent 1px), linear-gradient(90deg, var(--accent-500) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <svg viewBox="0 0 1000 1100" className="w-full h-full max-h-full" preserveAspectRatio="xMidYMid meet">
        {/* Country shapes */}
        {countries.map((c: any) => {
          const data = countryCounts[c.id];
          const isHighlighted = highlightCountries.has(c.id);
          const hasData = !!data;
          const intensity = data ? Math.min(data.total / maxCount, 1) : 0;
          const color = countryColor(c.id);

          return (
            <g key={c.id}>
              {/* Country path */}
              <path
                d={c.path}
                fill={isHighlighted
                  ? color
                  : hasData
                    ? `color-mix(in srgb, ${color} ${Math.round(12 + intensity * 35)}%, var(--card))`
                    : 'color-mix(in srgb, var(--border) 30%, transparent)'
                }
                stroke={isHighlighted ? color : 'color-mix(in srgb, var(--border) 50%, transparent)'}
                strokeWidth={isHighlighted ? 2 : 0.5}
                className="transition-all duration-500"
                style={{
                  filter: isHighlighted ? `drop-shadow(0 0 12px ${color})` : undefined,
                  opacity: isHighlighted ? 1 : selectedArticle ? 0.3 : 1,
                }}
              />

              {/* Highlight pulse ring */}
              {isHighlighted && c.labelPos && (
                <>
                  <circle cx={c.labelPos[0]} cy={c.labelPos[1]} r={22}
                    fill="none" stroke={color} strokeWidth={2} opacity={0.6}>
                    <animate attributeName="r" from="12" to="35" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={c.labelPos[0]} cy={c.labelPos[1]} r={18}
                    fill="none" stroke={color} strokeWidth={1.5} opacity={0.4}>
                    <animate attributeName="r" from="18" to="45" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
            </g>
          );
        })}

        {/* Heatmap dots — sized by article count */}
        {countries.map((c: any) => {
          const data = countryCounts[c.id];
          if (!data || !c.labelPos) return null;
          const isHighlighted = highlightCountries.has(c.id);
          const radius = 4 + Math.sqrt(data.total / maxCount) * 14;
          const color = countryColor(c.id);

          return (
            <g key={`dot_${c.id}`} className="transition-all duration-500" style={{
              opacity: selectedArticle && !isHighlighted ? 0.2 : 1,
            }}>
              {/* Glow */}
              <circle cx={c.labelPos[0]} cy={c.labelPos[1]} r={radius + 4}
                fill={color} opacity={isHighlighted ? 0.25 : 0.08}
                className="transition-all duration-500" />
              {/* Main dot */}
              <circle cx={c.labelPos[0]} cy={c.labelPos[1]} r={radius}
                fill={color}
                opacity={isHighlighted ? 0.9 : 0.5}
                stroke={isHighlighted ? '#fff' : 'none'}
                strokeWidth={isHighlighted ? 1.5 : 0}
                className="transition-all duration-500"
                style={{ filter: isHighlighted ? `drop-shadow(0 0 8px ${color})` : undefined }}
              />
              {/* Count label */}
              {(data.total >= 2 || isHighlighted) && (
                <text x={c.labelPos[0]} y={c.labelPos[1] + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#fff" fontSize={radius > 10 ? 9 : 7} fontWeight="bold"
                  fontFamily="ui-monospace, monospace"
                  className="transition-all duration-500"
                  style={{ opacity: isHighlighted ? 1 : 0.9 }}>
                  {data.total}
                </text>
              )}

              {/* Country name on highlight */}
              {isHighlighted && (
                <text x={c.labelPos[0]} y={c.labelPos[1] - radius - 8}
                  textAnchor="middle" fill={color}
                  fontSize={11} fontWeight="bold" fontFamily="var(--font-display)">
                  {c.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Critical markers — pulsing red triangles */}
        {countries.map((c: any) => {
          const data = countryCounts[c.id];
          if (!data?.isCritical || !c.labelPos) return null;
          const x = c.labelPos[0] + 12;
          const y = c.labelPos[1] - 12;
          return (
            <g key={`crit_${c.id}`}>
              <polygon points={`${x},${y - 6} ${x - 5},${y + 4} ${x + 5},${y + 4}`}
                fill="#ef4444" stroke="#fff" strokeWidth={0.5}>
                <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
              </polygon>
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central"
                fill="#fff" fontSize={6} fontWeight="bold">!</text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 p-2.5 rounded-xl" style={{
        background: 'color-mix(in srgb, var(--card) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        border: '1px solid color-mix(in srgb, var(--border) 40%, transparent)',
      }}>
        <span className="text-[8px] font-bold text-muted uppercase tracking-widest mb-0.5">Themen</span>
        {Object.entries(TOPIC_COLORS).map(([topic, color]) => (
          <div key={topic} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[9px] text-muted capitalize">{
              topic === 'security' ? 'Sicherheit' :
              topic === 'politics' ? 'Politik' :
              topic === 'military' ? 'Militär' :
              topic === 'economy' ? 'Wirtschaft' :
              topic === 'humanitarian' ? 'Humanitär' : 'Diplomatie'
            }</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 mt-1 pt-1" style={{ borderTop: '1px solid color-mix(in srgb, var(--border) 30%, transparent)' }}>
          <polygon className="hidden" />
          <svg width={8} height={8}><polygon points="4,0 0,7 8,7" fill="#ef4444" /></svg>
          <span className="text-[9px] text-red-400">Kritisch</span>
        </div>
      </div>

      {/* Selected article info overlay */}
      {selectedArticle && (
        <div className="absolute top-3 right-3 max-w-[220px] p-3 rounded-xl anim-fade-up" style={{
          background: 'color-mix(in srgb, var(--card) 90%, transparent)',
          backdropFilter: 'blur(12px)',
          border: '1px solid color-mix(in srgb, var(--accent-500) 20%, transparent)',
        }}>
          <button onClick={() => onSelectArticle(null)}
            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-md flex items-center justify-center text-muted hover:text-main transition-colors" style={{
            background: 'color-mix(in srgb, var(--border) 30%, transparent)',
          }}>
            <X size={10} />
          </button>
          <p className="text-[11px] font-semibold text-main leading-snug pr-5" style={{
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{selectedArticle.title}</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{
              background: 'color-mix(in srgb, var(--accent-500) 12%, transparent)', color: 'var(--accent-400)',
            }}>{selectedArticle.source}</span>
            {selectedArticle.countries.map(cId => {
              const co = region.countriesById[cId];
              return co ? (
                <span key={cId} className="text-[9px] font-medium" style={{ color: countryColor(cId) }}>
                  {co.flagEmoji} {co.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Topic config ──
const TOPICS: { id: NewsTopic; label: string; labelShort: string; icon: React.ReactNode; bg: string; text: string; border: string; bar: string }[] = [
  { id: 'security', label: 'Sicherheit', labelShort: 'Sicherheit', icon: <Shield size={13} />, bg: 'rgba(239,68,68,0.10)', text: '#f87171', border: 'rgba(239,68,68,0.20)', bar: '#ef4444' },
  { id: 'politics', label: 'Politik', labelShort: 'Politik', icon: <Landmark size={13} />, bg: 'rgba(168,85,247,0.10)', text: '#c084fc', border: 'rgba(168,85,247,0.20)', bar: '#a855f7' },
  { id: 'military', label: 'Militär', labelShort: 'Militär', icon: <Crosshair size={13} />, bg: 'rgba(249,115,22,0.10)', text: '#fb923c', border: 'rgba(249,115,22,0.20)', bar: '#f97316' },
  { id: 'economy', label: 'Wirtschaft', labelShort: 'Wirtschaft', icon: <DollarSign size={13} />, bg: 'rgba(16,185,129,0.10)', text: '#34d399', border: 'rgba(16,185,129,0.20)', bar: '#10b981' },
  { id: 'humanitarian', label: 'Humanitär', labelShort: 'Humanitär', icon: <Users size={13} />, bg: 'rgba(14,165,233,0.10)', text: '#38bdf8', border: 'rgba(14,165,233,0.20)', bar: '#0ea5e9' },
  { id: 'diplomacy', label: 'Diplomatie', labelShort: 'Diplomatie', icon: <Globe size={13} />, bg: 'rgba(59,130,246,0.10)', text: '#60a5fa', border: 'rgba(59,130,246,0.20)', bar: '#3b82f6' },
];

const TIME_RANGES: { id: TimeRange; label: string }[] = [
  { id: '24h', label: '24h' },
  { id: '7d', label: '7 Tage' },
  { id: '30d', label: '30 Tage' },
];

const INTERVALS = [
  { mins: 5, label: '5m' }, { mins: 15, label: '15m' },
  { mins: 30, label: '30m' }, { mins: 60, label: '1h' }, { mins: 0, label: 'Manuell' },
];

const TRANSLATE_LANGS = [
  { id: '', label: 'Original', flag: '—' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'ar', label: 'العربية', flag: '🇸🇦' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
];

// Free translation via MyMemory API (no key needed, 5000 chars/day)
async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=autodetect|${targetLang}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      // MyMemory returns UPPERCASE when it can't translate — fallback to original
      if (translated === text.toUpperCase()) return text;
      return translated;
    }
    return text;
  } catch {
    return text;
  }
}

function topicMeta(id: string) {
  return TOPICS.find(t => t.id === id);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'gerade';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// ── Mini Bar Chart (CSS only) ──
function MiniBarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div className="space-y-1.5">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-[10px] text-muted w-16 truncate text-right">{d.label}</span>
          <div className="flex-1 h-[6px] rounded-full bg-card overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: maxVal > 0 ? `${Math.max(2, (d.value / maxVal) * 100)}%` : '0%', background: d.color }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-main w-6 text-right">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════

export default function LiveIntelPanel() {
  const region = useRegion();
  const { intelUpdateInterval, setIntelUpdateInterval, selectCountry, setActiveTab } = useStore();

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<NewsTopic[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [translateLang, setTranslateLang] = useState<string>('');  // '' = off, 'de', 'en', 'fr', 'ar'
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [criticalArticles, setCriticalArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCritical, setLoadingCritical] = useState(false);
  const [criticalProgress, setCriticalProgress] = useState<{ step: number; total: number; label: string } | null>(null);
  const [criticalCollapsed, setCriticalCollapsed] = useState(false);
  const [feedCollapsed, setFeedCollapsed] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [axisArticles, setAxisArticles] = useState<NewsArticle[]>([]);
  const [loadingAxes, setLoadingAxes] = useState(false);
  const [axisProgress, setAxisProgress] = useState<{ step: number; total: number; label: string } | null>(null);
  const [axesCollapsed, setAxesCollapsed] = useState(false);
  const [expandedAxis, setExpandedAxis] = useState<string | null>(null);

  const regionCountries = useMemo(() =>
    Object.values(region.countriesById).sort((a, b) => a.name.localeCompare(b.name)),
    [region]
  );

  const regionId = region.id as RegionId;

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = selectedCountries.length > 0 ? selectedCountries : [];
      const results = await fetchNews(ids, selectedTopics, timeRange, 75, regionId);
      setArticles(results);
      setLastFetched(new Date());
      if (results.length === 0) setError('Keine Ergebnisse — versuche andere Filter.');
    } catch {
      setError('Fehler beim Laden der Meldungen.');
    } finally {
      setLoading(false);
    }
  }, [selectedCountries, selectedTopics, timeRange, regionId]);

  // Dedicated critical events fetch — separate from main feed
  const loadCritical = useCallback(async () => {
    setLoadingCritical(true);
    setCriticalProgress(null);
    try {
      const ids = regionCountries.map(c => c.id);
      const results = await fetchCriticalEvents(ids, timeRange, (step, total, label) => {
        setCriticalProgress({ step, total, label });
      }, regionId);
      setCriticalArticles(results);
    } catch (err) {
      console.error('Critical events fetch failed:', err);
    } finally {
      setLoadingCritical(false);
      setCriticalProgress(null);
    }
  }, [regionCountries, timeRange, regionId]);

  // Conflict axis fetch
  const loadAxes = useCallback(async () => {
    setLoadingAxes(true);
    setAxisProgress(null);
    try {
      const results = await fetchConflictAxisArticles(regionId, timeRange, (step, total, label) => {
        setAxisProgress({ step, total, label });
      });
      setAxisArticles(results);
    } catch { /* silently handle */ }
    finally { setLoadingAxes(false); setAxisProgress(null); }
  }, [regionId, timeRange]);

  // Load sequentially: main feed → critical → conflict axes (GDELT rate limit)
  const loadAll = useCallback(async () => {
    await loadArticles();
    await new Promise(r => setTimeout(r, 2000));
    await loadCritical();
    await new Promise(r => setTimeout(r, 2000));
    await loadAxes();
  }, [loadArticles, loadCritical, loadAxes]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (intelUpdateInterval > 0) {
      intervalRef.current = setInterval(loadAll, intelUpdateInterval * 60 * 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [intelUpdateInterval, loadAll]);

  // ── Conflict axes computed from all article pools ──
  const conflictAxes = useMemo(() => {
    const allPool = [...criticalArticles, ...articles, ...axisArticles];
    return matchConflictAxes(allPool, regionId);
  }, [criticalArticles, articles, axisArticles, regionId]);

  // ── Computed ──
  const filtered = useMemo(() => {
    if (!searchText.trim()) return articles;
    const q = searchText.toLowerCase();
    return articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.source.toLowerCase().includes(q)
    );
  }, [articles, searchText]);

  // Topic stats
  const topicStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of TOPICS) counts[t.id] = 0;
    for (const a of filtered) {
      for (const t of a.topics) counts[t] = (counts[t] ?? 0) + 1;
    }
    return TOPICS.map(t => ({ ...t, count: counts[t.id] ?? 0 }));
  }, [filtered]);

  // Top mentioned countries
  const countryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of filtered) {
      for (const c of a.countries) counts[c] = (counts[c] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([id, count]) => ({ id, count, country: region.countriesById[id] }))
      .filter(d => d.country);
  }, [filtered, region]);

  // Date groups
  const grouped = useMemo(() => {
    const groups: { label: string; key: string; items: NewsArticle[] }[] = [];
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const yest = new Date(now); yest.setDate(yest.getDate() - 1);
    const todayArr: NewsArticle[] = [], yestArr: NewsArticle[] = [], olderArr: NewsArticle[] = [];
    for (const a of filtered) {
      const d = new Date(a.publishedAt); d.setHours(0, 0, 0, 0);
      if (d >= now) todayArr.push(a);
      else if (d >= yest) yestArr.push(a);
      else olderArr.push(a);
    }
    if (todayArr.length) groups.push({ label: 'Heute', key: 'today', items: todayArr });
    if (yestArr.length) groups.push({ label: 'Gestern', key: 'yest', items: yestArr });
    if (olderArr.length) groups.push({ label: 'Älter', key: 'older', items: olderArr });
    return groups;
  }, [filtered]);

  const regionCountryIds = useMemo(() => new Set(regionCountries.map(c => c.id)), [regionCountries]);

  const toggleCountry = (id: string) => setSelectedCountries(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);
  const toggleTopic = (t: NewsTopic) => setSelectedTopics(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const goToCountry = (id: string) => { selectCountry(id); setActiveTab('explorer'); };

  return (
    <div className="flex-1 flex bg-main overflow-hidden">

      {/* ═══ LEFT: MAIN FEED ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Header Bar ── */}
        <div className="shrink-0 bg-surface border-b border-theme">
          {/* Top row */}
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-500) 25%, transparent), color-mix(in srgb, var(--accent-700) 15%, transparent))',
                  border: '1px solid color-mix(in srgb, var(--accent-500) 20%, transparent)',
                }}>
                  <Radio size={17} className="text-accent-400" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface" style={{
                  background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                  animation: 'pulse 2s infinite',
                }} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-main tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                  Live Intelligence
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {lastFetched ? (
                    <span className="text-[10px] text-muted flex items-center gap-1">
                      <Clock size={8} /> {timeAgo(lastFetched.toISOString())} aktualisiert
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted">Lädt...</span>
                  )}
                  <span className="text-[10px] text-muted/30">·</span>
                  <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--accent-400)' }}>{filtered.length}</span>
                  <span className="text-[10px] text-muted">Meldungen</span>
                  {criticalArticles.length > 0 && (
                    <>
                      <span className="text-[10px] text-muted/30">·</span>
                      <span className="text-[10px] font-mono font-bold text-red-400">{criticalArticles.length}</span>
                      <span className="text-[10px] text-red-400/60">kritisch</span>
                    </>
                  )}
                  {conflictAxes.length > 0 && (
                    <>
                      <span className="text-[10px] text-muted/30">·</span>
                      <span className="text-[10px] font-mono font-bold text-indigo-400">{conflictAxes.length}</span>
                      <span className="text-[10px] text-indigo-400/60">Achsen</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1" />

            {/* Time range pills */}
            <div className="flex items-center gap-0.5 bg-card rounded-lg p-0.5 border border-theme">
              {TIME_RANGES.map(tr => (
                <button key={tr.id} onClick={() => setTimeRange(tr.id)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                  style={timeRange === tr.id ? {
                    background: 'color-mix(in srgb, var(--accent-500) 18%, transparent)',
                    color: 'var(--accent-400)',
                  } : { color: 'var(--muted)' }}>
                  {tr.label}
                </button>
              ))}
            </div>

            {/* Translate picker */}
            <div className="flex items-center gap-0.5 bg-card rounded-lg p-0.5 border border-theme">
              {TRANSLATE_LANGS.map(lang => (
                <button key={lang.id} onClick={() => { setTranslateLang(lang.id); setTranslations({}); }}
                  className="px-1.5 py-1 rounded-md text-[11px] font-medium transition-all"
                  style={translateLang === lang.id ? {
                    background: 'color-mix(in srgb, var(--accent-500) 18%, transparent)',
                    color: 'var(--accent-400)',
                  } : { color: 'var(--muted)' }}
                  title={lang.label}>
                  {lang.flag}
                </button>
              ))}
            </div>

            <button onClick={() => setShowMap(m => !m)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all"
              style={showMap ? {
                background: 'color-mix(in srgb, var(--accent-500) 15%, transparent)',
                borderColor: 'color-mix(in srgb, var(--accent-500) 30%, transparent)',
                color: 'var(--accent-400)',
              } : {
                background: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--muted)',
              }}>
              <MapIcon size={13} />
              Karte
            </button>
            <button onClick={() => { setShowInfo(!showInfo); if (!showInfo) { setShowSettings(false); setShowFilters(false); } }}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${showInfo ? 'bg-accent-500/15 border-accent-500/30 text-accent-400' : 'bg-card border-theme text-muted hover:text-main'}`}
              title="Wie funktioniert Live Intel?">
              <Info size={14} />
            </button>
            <button onClick={() => setShowSettings(!showSettings)}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${showSettings ? 'bg-accent-500/15 border-accent-500/30 text-accent-400' : 'bg-card border-theme text-muted hover:text-main'}`}>
              <Settings2 size={14} />
            </button>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${showFilters ? 'bg-accent-500/15 border-accent-500/30 text-accent-400' : 'bg-card border-theme text-muted hover:text-main'}`}>
              <Filter size={14} />
            </button>
            <button onClick={loadAll} disabled={loading || loadingCritical}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50"
              style={{ background: 'var(--accent-500)', color: '#fff' }}>
              <RefreshCw size={12} className={loading || loadingCritical ? 'animate-spin' : ''} />
              Laden
            </button>
          </div>

          {/* Settings dropdown */}
          {showSettings && (
            <div className="px-5 pb-3 anim-fade-up">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-theme">
                <span className="text-[10px] text-muted uppercase tracking-wider font-bold">Auto-Update</span>
                <div className="flex gap-1 ml-2">
                  {INTERVALS.map(int => (
                    <button key={int.mins} onClick={() => setIntelUpdateInterval(int.mins)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium transition-all"
                      style={intelUpdateInterval === int.mins ? {
                        background: 'color-mix(in srgb, var(--accent-500) 18%, transparent)',
                        color: 'var(--accent-400)',
                      } : { color: 'var(--muted)' }}>
                      {int.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Info / Transparency panel */}
          {showInfo && (
            <div className="px-5 pb-3 anim-fade-up">
              <div className="rounded-2xl overflow-hidden" style={{
                background: 'color-mix(in srgb, var(--accent-500) 3%, var(--card))',
                border: '1px solid color-mix(in srgb, var(--accent-500) 12%, transparent)',
              }}>
                {/* Header */}
                <div className="px-4 py-3 flex items-center gap-2" style={{
                  background: 'color-mix(in srgb, var(--accent-500) 6%, transparent)',
                  borderBottom: '1px solid color-mix(in srgb, var(--accent-500) 10%, transparent)',
                }}>
                  <Info size={14} className="text-accent-400" />
                  <span className="text-[13px] font-bold text-main" style={{ fontFamily: 'var(--font-display)' }}>
                    Wie funktioniert Live Intelligence?
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  {/* Critical Events */}
                  <InfoBlock
                    icon={<AlertTriangle size={13} />}
                    title="Kritische Lage — Dedizierte Abfragen"
                    items={regionId === 'mideast' ? [
                      'Der Bereich "Kritische Lage" führt 10 separate, spezialisierte API-Abfragen durch — unabhängig vom allgemeinen News-Feed.',
                      'Krisen-Abfragen (6): Nahost gesamt, Gaza/Israel/Palästina, Syrien/Irak/ISIS, Jemen/Houthis/Rotes Meer, Iran/Libanon/Proxy-Achse, Türkei/Golf-Staaten — mit Keywords wie killed, airstrike, bombing, missile, drone, siege, ceasefire, hostage, rockets, deployment, offensive, casualties.',
                      'Truppen & Militär-Großlage: Abfrage zu Truppenverlegungen, Basen, Flottenbewegungen (CENTCOM, 5th Fleet, Carrier, F-35, THAAD, Iron Dome, Abraham Accords).',
                      'Proxy-Kriege & Milizen: Gezielte Suche nach IRGC, Quds Force, Hezbollah, Hamas, Houthis, Islamic Jihad, PMF, SDF, PKK, Wagner.',
                      'Energie & Handelsrouten: Öl, Gas, OPEC, Pipeline, Strait of Hormuz, Suez Canal, Bab el-Mandeb, Sanktionen, Embargo.',
                      'Diplomatie & Normalisierung: Abraham Accords, Ceasefire, Verhandlungen, Zwei-Staaten-Lösung, Annexion, UN-Sicherheitsrat.',
                    ] : [
                      'Der Bereich "Kritische Lage" führt 6 separate, spezialisierte API-Abfragen durch — unabhängig vom allgemeinen News-Feed.',
                      'Krisen-Abfragen (4): Afrika gesamt, Sahel/Westafrika, Ost-/Zentralafrika, Nordafrika/Schlüsselstaaten — mit Keywords wie killed, attack, massacre, coup, bombing, militants.',
                      'Truppen & Geopolitik: Truppenverlegungen, Wagner, Russland, China, Frankreich, AFRICOM, Peacekeeping, Juntas, Waffenlieferungen.',
                      'Terrorgruppen & Milizen: Boko Haram, al-Shabab, Islamic State, JNIM, ISWAP, ADF — gezielte Suche nach nichtstaatlichen Akteuren.',
                      'Abfragen laufen sequenziell mit Rate-Limit-Pausen, um GDELT-Drosselung zu vermeiden.',
                      'Ergebnisse werden nach Datum sortiert — die neuesten Krisen-Events erscheinen zuerst.',
                    ]}
                  />

                  {/* Data Source */}
                  <InfoBlock
                    icon={<Database size={13} />}
                    title="Datenquelle"
                    items={[
                      'Alle Meldungen stammen aus dem GDELT Project (Global Database of Events, Language, and Tone) — einer frei zugänglichen, von Google unterstützten Datenbank.',
                      'GDELT überwacht Nachrichtenquellen weltweit in über 100 Sprachen und aktualisiert alle 15 Minuten.',
                      'Die Daten werden direkt von der GDELT DOC 2.0 API abgerufen — es gibt keine eigene Datenverarbeitung oder -speicherung.',
                    ]}
                  />

                  {/* Topic Classification */}
                  <InfoBlock
                    icon={<Cpu size={13} />}
                    title="Themen-Klassifizierung"
                    items={[
                      'Jede Meldung wird anhand von Schlüsselwörtern im Titel automatisch Themen zugeordnet:',
                    ]}
                  >
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {TOPICS.map(t => (
                        <div key={t.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px]"
                          style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                          <span style={{ color: t.text }}>{t.icon}</span>
                          <span className="font-semibold" style={{ color: t.text }}>{t.label}</span>
                          <span className="text-muted/60 ml-auto truncate text-[9px]">
                            {t.id === 'security' && 'terrorism, attack, militant...'}
                            {t.id === 'politics' && 'election, president, coup...'}
                            {t.id === 'military' && 'army, weapons, troops...'}
                            {t.id === 'economy' && 'trade, inflation, GDP...'}
                            {t.id === 'humanitarian' && 'refugee, famine, aid...'}
                            {t.id === 'diplomacy' && 'summit, treaty, sanctions...'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted/60 mt-2 italic">
                      Hinweis: Eine Meldung kann mehreren Themen gleichzeitig zugeordnet werden. Die Zuordnung basiert auf einfachem Keyword-Matching und ist nicht immer perfekt.
                    </p>
                  </InfoBlock>

                  {/* Country Matching */}
                  <InfoBlock
                    icon={<Globe size={13} />}
                    title="Länder-Erkennung & Querverweise"
                    items={[
                      'Ländernamen werden im Artikeltitel und der URL erkannt und automatisch den entsprechenden Ländern zugeordnet.',
                      'Wenn ein Artikel mehrere Länder erwähnt, wird ein Querverweis angezeigt (z.B. "Nigeria ↔ Niger") — so werden geopolitische Zusammenhänge sichtbar.',
                      'Klick auf ein Länder-Tag springt direkt in den Explorer mit allen Details zu diesem Land.',
                    ]}
                  />

                  {/* Filter System */}
                  <InfoBlock
                    icon={<Layers size={13} />}
                    title="Filter-System"
                    items={[
                      'Zeitraum — Bestimmt den Abfrage-Zeitraum bei GDELT: letzte 24h, 7 Tage oder 30 Tage. Ändert die API-Abfrage.',
                      'Themen-Filter — Klick auf ein Thema (z.B. "Sicherheit") fügt das entsprechende Keyword zur GDELT-Suchabfrage hinzu. So werden nur relevante Artikel geladen.',
                      `Länder-Filter — Wähle 1-5 Länder aus, um die Suche gezielt einzuschränken. Ohne Auswahl wird breit nach ${regionId === 'mideast' ? '"Middle East" / "Gulf" / "Levant"' : '"Africa"'} + geopolitische Keywords gesucht.`,
                      'Textsuche — Filtert die bereits geladenen Meldungen lokal nach Titel oder Quelle. Löst keine neue API-Abfrage aus.',
                      regionId === 'mideast'
                        ? 'Pressehäuser — Zusätzlich werden gezielt Artikel von BBC, Reuters, Al Jazeera, CNN, AXIOS, Guardian, NYT, WaPo, Middle East Eye, Al-Monitor, Times of Israel, Arab News, Haaretz, Iran International u.a. abgefragt.'
                        : 'Pressehäuser — Zusätzlich werden gezielt Artikel von BBC, Reuters, Al Jazeera, France24, Africanews und The Africa Report abgefragt.',
                    ]}
                  />

                  {/* Pipeline */}
                  <InfoBlock
                    icon={<Eye size={13} />}
                    title="Verarbeitungs-Pipeline"
                  >
                    <div className="flex items-center gap-0 mt-2 flex-wrap">
                      {[
                        { step: '1', label: 'GDELT API', desc: 'Abfrage mit Filtern' },
                        { step: '2', label: 'Parsing', desc: 'JSON → Artikel-Objekte' },
                        { step: '3', label: 'Matching', desc: 'Länder & Themen erkennen' },
                        { step: '4', label: 'Cache', desc: '3 Min. Client-Cache' },
                        { step: '5', label: 'Anzeige', desc: 'Gruppiert nach Datum' },
                      ].map((s, i) => (
                        <div key={s.step} className="flex items-center gap-0">
                          <div className="flex flex-col items-center px-2 py-1.5">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                              style={{ background: 'color-mix(in srgb, var(--accent-500) 15%, transparent)', color: 'var(--accent-400)' }}>
                              {s.step}
                            </div>
                            <span className="text-[9px] font-semibold text-main mt-1">{s.label}</span>
                            <span className="text-[8px] text-muted">{s.desc}</span>
                          </div>
                          {i < 4 && (
                            <ArrowRight size={10} className="text-muted/30 shrink-0 -mx-0.5" />
                          )}
                        </div>
                      ))}
                    </div>
                  </InfoBlock>

                  {/* Update cycle */}
                  <InfoBlock
                    icon={<RefreshCw size={13} />}
                    title="Aktualisierungs-Zyklus"
                    items={[
                      `Aktuell: ${intelUpdateInterval > 0 ? `Alle ${intelUpdateInterval} Minuten automatisch` : 'Nur manuell (Auto-Update deaktiviert)'}`,
                      'Ergebnisse werden 3 Minuten im Client-Cache gehalten, um unnötige API-Aufrufe zu vermeiden.',
                      'GDELT selbst aktualisiert seine Datenbank alle 15 Minuten mit neuen Artikeln weltweit.',
                      'Einstellbar über das Zahnrad-Icon: 5m / 15m / 30m / 1h / Manuell.',
                    ]}
                  />

                  {/* Disclaimer */}
                  <div className="px-3 py-2.5 rounded-xl text-[10px] text-muted/70 leading-relaxed" style={{
                    background: 'color-mix(in srgb, var(--accent-500) 3%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--border) 30%, transparent)',
                  }}>
                    <span className="font-bold text-muted">Hinweis zur Genauigkeit:</span> Die automatische Themen- und Länderzuordnung basiert auf Keyword-Matching und kann ungenau sein.
                    Meldungen werden nicht redaktionell geprüft. Für kritische Entscheidungen sollten Originalquellen konsultiert werden.
                    Die Sidebar-Statistiken (Themenverteilung, Top-Erwähnungen, Quellen) werden live aus den aktuell geladenen Meldungen berechnet.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter bar */}
          {showFilters && (
            <div className="px-5 pb-3 space-y-2.5 anim-fade-up">
              {/* Topics row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {TOPICS.map(t => {
                  const active = selectedTopics.includes(t.id);
                  return (
                    <button key={t.id} onClick={() => toggleTopic(t.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all"
                      style={active
                        ? { background: t.bg, color: t.text, borderColor: t.border }
                        : { background: 'var(--card)', color: 'var(--muted)', borderColor: 'var(--border)' }}>
                      {t.icon} {t.labelShort}
                    </button>
                  );
                })}
              </div>

              {/* Countries */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedCountries.length === 0 && (
                  <span className="text-[10px] text-muted italic mr-1">Alle Länder der Region</span>
                )}
                {selectedCountries.map(id => {
                  const c = region.countriesById[id];
                  if (!c) return null;
                  return (
                    <button key={id} onClick={() => toggleCountry(id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all"
                      style={{ background: 'color-mix(in srgb, var(--accent-500) 12%, transparent)', color: 'var(--accent-400)', border: '1px solid color-mix(in srgb, var(--accent-500) 20%, transparent)' }}>
                      {c.flagEmoji} {c.name} <X size={9} />
                    </button>
                  );
                })}
                <button onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-muted hover:text-accent-400 bg-card border border-theme hover:border-accent-500/30 transition-all">
                  <ChevronDown size={10} className={`transition-transform ${showCountryPicker ? 'rotate-180' : ''}`} />
                  Länder wählen
                </button>
              </div>

              {showCountryPicker && (
                <div className="p-2 rounded-xl bg-card border border-theme max-h-40 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-0.5 anim-fade-up scrollbar-thin">
                  {regionCountries.map(c => (
                    <button key={c.id} onClick={() => toggleCountry(c.id)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] text-left transition-all"
                      style={selectedCountries.includes(c.id)
                        ? { background: 'color-mix(in srgb, var(--accent-500) 12%, transparent)', color: 'var(--accent-400)' }
                        : { color: 'var(--text)' }}>
                      <span className="text-xs">{c.flagEmoji}</span>
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <div className="px-5 pb-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)}
                placeholder="Meldungen durchsuchen..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-theme text-xs text-main outline-none focus:border-accent-500/30 placeholder:text-muted" />
            </div>
          </div>
        </div>

        {/* ── Feed ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Loading state — main feed */}
          {loading && articles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                  background: 'color-mix(in srgb, var(--accent-500) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--accent-500) 15%, transparent)',
                }}>
                  <Radio size={28} className="text-accent-400 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-2xl animate-ping opacity-20" style={{ background: 'var(--accent-500)' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-main">Empfange Meldungen...</p>
                <p className="text-[11px] text-muted mt-1">Verbindung mit GDELT Datenbank wird hergestellt</p>
              </div>
              {/* Progress bar */}
              <div className="w-56">
                <div className="h-1.5 rounded-full bg-card overflow-hidden">
                  <div className="h-full rounded-full animate-loading-bar" style={{
                    background: 'linear-gradient(90deg, var(--accent-500), var(--accent-400))',
                    width: '40%',
                  }} />
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                  <span className="text-[10px] text-muted">Allgemeine Nachrichten laden...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error / empty state */}
          {!loading && error && articles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)',
              }}>
                <AlertTriangle size={28} className="text-amber-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-main">{error}</p>
                <p className="text-[11px] text-muted mt-1">Ändere die Filter oder versuche es später erneut.</p>
              </div>
              <button onClick={loadArticles}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                style={{ background: 'var(--accent-500)', color: '#fff' }}>
                <RefreshCw size={12} /> Erneut laden
              </button>
            </div>
          )}

          {/* ═══ CRITICAL REGION EVENTS ═══ */}
          {loadingCritical && criticalArticles.length === 0 && (
            <div className="px-5 py-4" style={{
              background: 'color-mix(in srgb, rgba(239,68,68,0.04) 100%, var(--main))',
              borderBottom: '1px solid rgba(239,68,68,0.08)',
            }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="relative flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="absolute w-4 h-4 rounded-full bg-red-500/20 animate-ping" />
                </div>
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-[0.12em]">Kritische Lage wird analysiert</span>
                <RefreshCw size={11} className="animate-spin text-red-400/40" />
              </div>

              {/* Multi-step progress */}
              <div className="space-y-2">
                {/* Progress bar */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{
                    background: 'linear-gradient(90deg, #ef4444, #f87171)',
                    width: criticalProgress ? `${(criticalProgress.step / criticalProgress.total) * 100}%` : '5%',
                    boxShadow: '0 0 8px rgba(239,68,68,0.4)',
                  }} />
                </div>

                {/* Step indicators */}
                <div className="flex items-center gap-1">
                  {getCriticalQueryLabels(regionId).map((label, i) => {
                    const stepNum = i + 1;
                    const isDone = criticalProgress ? criticalProgress.step > stepNum : false;
                    const isActive = criticalProgress ? criticalProgress.step === stepNum : i === 0;
                    return (
                      <div key={label} className="flex-1 flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-all"
                        style={{
                          background: isActive ? 'rgba(239,68,68,0.08)' : 'transparent',
                          border: isActive ? '1px solid rgba(239,68,68,0.15)' : '1px solid transparent',
                        }}>
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                          style={{
                            background: isDone ? '#ef4444' : isActive ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.06)',
                            color: isDone ? '#fff' : isActive ? '#f87171' : 'rgba(248,113,113,0.3)',
                          }}>
                          {isDone ? '✓' : stepNum}
                        </div>
                        <span className="text-[9px] font-medium truncate" style={{
                          color: isActive ? '#f87171' : isDone ? '#fca5a5' : 'rgba(248,113,113,0.25)',
                        }}>{label}</span>
                        {isActive && <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {criticalProgress && (
                  <p className="text-[10px] text-red-400/40 text-center">
                    Abfrage {criticalProgress.step}/{criticalProgress.total}: {criticalProgress.label}
                  </p>
                )}
              </div>
            </div>
          )}
          {criticalArticles.length > 0 && (
            <div className="relative">
              {/* Subtle red top border glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
                background: 'linear-gradient(90deg, transparent, #ef4444, transparent)',
                opacity: 0.5,
              }} />

              {/* Section header — clickable to collapse */}
              <button onClick={() => setCriticalCollapsed(c => !c)}
                className="sticky top-0 z-20 w-full px-5 py-2.5 flex items-center gap-2.5 cursor-pointer transition-colors hover:bg-red-500/[0.03]" style={{
                background: 'color-mix(in srgb, rgba(239,68,68,0.06) 100%, var(--main))',
                borderBottom: '1px solid rgba(239,68,68,0.12)',
              }}>
                <ChevronDown size={12} className="text-red-400/60 transition-transform" style={{
                  transform: criticalCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                }} />
                <div className="relative flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="absolute w-4 h-4 rounded-full bg-red-500/20 animate-ping" />
                </div>
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-[0.15em]">Kritische Lage</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{
                  background: 'rgba(239,68,68,0.12)', color: '#f87171',
                }}>{criticalArticles.length}</span>
                <span className="text-[10px] text-red-400/40">Einschneidende Ereignisse in der Region</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(239,68,68,0.12)' }} />
              </button>

              {/* Critical articles */}
              {!criticalCollapsed && criticalArticles.slice(0, 20).map((article, i) => {
                const displayTitle = translateLang && translations[article.id] ? translations[article.id] : article.title;
                const isSelected = selectedArticle?.id === article.id;
                return (
                  <div key={`crit_${article.id}`}
                    onClick={() => showMap && setSelectedArticle(isSelected ? null : article)}
                    className={`px-5 py-3 border-b group transition-all hover:bg-red-500/[0.03] anim-fade-up ${showMap ? 'cursor-pointer' : ''}`}
                    style={{
                      borderColor: 'rgba(239,68,68,0.08)',
                      animationDelay: `${i * 50}ms`,
                      background: isSelected ? 'rgba(239,68,68,0.06)' : undefined,
                      boxShadow: isSelected ? 'inset 3px 0 0 #ef4444' : undefined,
                    }}>
                    <div className="flex gap-3">
                      {/* Red accent strip */}
                      <div className="w-[3px] rounded-full shrink-0 self-stretch" style={{
                        background: 'linear-gradient(180deg, #ef4444, #dc2626)',
                        boxShadow: '0 0 6px rgba(239,68,68,0.3)',
                      }} />

                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <a href={article.url} target="_blank" rel="noopener noreferrer"
                          className="text-[13px] font-bold text-main leading-snug hover:text-red-400 transition-colors block"
                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {displayTitle}
                        </a>
                        {translateLang && translations[article.id] && (
                          <div className="text-[9px] text-muted/30 mt-0.5 truncate">{article.title}</div>
                        )}

                        {/* Meta + tags */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{
                            background: 'rgba(239,68,68,0.10)', color: '#f87171',
                          }}>{article.source}</span>
                          <span className="text-[10px] text-muted flex items-center gap-0.5">
                            <Clock size={8} /> {timeAgo(article.publishedAt)}
                          </span>

                          {/* Topic badges */}
                          {article.topics.slice(0, 2).map(t => {
                            const m = topicMeta(t);
                            if (!m) return null;
                            return (
                              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                                style={{ background: m.bg, color: m.text, border: `1px solid ${m.border}` }}>
                                {m.labelShort}
                              </span>
                            );
                          })}

                          {/* Country flags */}
                          {article.countries.filter(id => regionCountryIds.has(id)).map(id => {
                            const c = region.countriesById[id];
                            if (!c) return null;
                            return (
                              <button key={id} onClick={() => goToCountry(id)}
                                className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium transition-all"
                                style={{
                                  background: 'rgba(239,68,68,0.06)', color: '#fca5a5',
                                  border: '1px solid rgba(239,68,68,0.12)',
                                }}>
                                <span className="text-[10px]">{c.flagEmoji}</span> {c.name}
                              </button>
                            );
                          })}

                          <a href={article.url} target="_blank" rel="noopener noreferrer"
                            className="ml-auto text-muted/30 hover:text-red-400 transition-colors">
                            <ExternalLink size={11} />
                          </a>
                        </div>

                        {/* Cross-reference */}
                        {article.countries.length > 1 && (
                          <div className="mt-1 flex items-center gap-1 text-[9px] text-red-400/30">
                            <Globe size={8} />
                            {article.countries.map(id => region.countriesById[id]?.name).filter(Boolean).join(' ↔ ')}
                          </div>
                        )}
                      </div>

                      {/* Image */}
                      {article.imageUrl && (
                        <div className="w-20 h-[60px] rounded-lg overflow-hidden shrink-0 self-start" style={{
                          border: '1px solid rgba(239,68,68,0.15)',
                        }}>
                          <img src={article.imageUrl} alt="" className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Bottom separator */}
              {!criticalCollapsed && (
                <div className="h-[3px]" style={{
                  background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.15), transparent)',
                }} />
              )}
            </div>
          )}

          {/* ═══ KONFLIKTACHSEN / GEOPOLITISCHE DYNAMIKEN ═══ */}
          {loadingAxes && axisArticles.length === 0 && (
            <div className="px-5 py-4" style={{
              background: 'color-mix(in srgb, rgba(99,102,241,0.04) 100%, var(--main))',
              borderBottom: '1px solid rgba(99,102,241,0.08)',
            }}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="relative flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="absolute w-4 h-4 rounded-full bg-indigo-500/20 animate-ping" />
                </div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.12em]">Konfliktachsen werden analysiert</span>
                <RefreshCw size={11} className="animate-spin text-indigo-400/40" />
              </div>
              {axisProgress && (
                <div className="space-y-1.5">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.08)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{
                      background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                      width: `${(axisProgress.step / axisProgress.total) * 100}%`,
                    }} />
                  </div>
                  <p className="text-[10px] text-indigo-400/50 text-center">
                    {axisProgress.step}/{axisProgress.total}: {axisProgress.label}
                  </p>
                </div>
              )}
            </div>
          )}

          {conflictAxes.length > 0 && (
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
                background: 'linear-gradient(90deg, transparent, #6366f1, transparent)', opacity: 0.4,
              }} />

              <button onClick={() => setAxesCollapsed(c => !c)}
                className="sticky top-0 z-20 w-full px-5 py-2.5 flex items-center gap-2.5 cursor-pointer transition-colors hover:bg-indigo-500/[0.03]" style={{
                background: 'color-mix(in srgb, rgba(99,102,241,0.05) 100%, var(--main))',
                borderBottom: '1px solid rgba(99,102,241,0.10)',
              }}>
                <ChevronDown size={12} className="text-indigo-400/60 transition-transform" style={{
                  transform: axesCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                }} />
                <Globe size={13} className="text-indigo-400" />
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.15em]">Geopolitische Konfliktachsen</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{
                  background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                }}>{conflictAxes.length}</span>
                <span className="text-[10px] text-indigo-400/40">Erkannte Dynamiken in der Region</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(99,102,241,0.10)' }} />
              </button>

              {!axesCollapsed && (
                <div className="px-5 py-4 space-y-2.5" style={{
                  background: 'color-mix(in srgb, rgba(99,102,241,0.02) 100%, var(--main))',
                }}>
                  {conflictAxes.map((axis) => {
                    const isExpanded = expandedAxis === axis.id;
                    return (
                      <div key={axis.id} className="rounded-xl overflow-hidden transition-all anim-fade-up" style={{
                        border: `1px solid color-mix(in srgb, ${axis.color} ${isExpanded ? '25' : '12'}%, transparent)`,
                        background: isExpanded
                          ? `color-mix(in srgb, ${axis.color} 4%, var(--card))`
                          : 'var(--card)',
                      }}>
                        <button onClick={() => setExpandedAxis(isExpanded ? null : axis.id)}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left transition-all hover:bg-hover/20">
                          {/* Intensity bar */}
                          <div className="w-1 self-stretch rounded-full shrink-0" style={{
                            background: `linear-gradient(180deg, ${axis.color}, ${axis.color}44)`,
                            boxShadow: axis.intensity > 60 ? `0 0 8px ${axis.color}40` : undefined,
                          }} />

                          {/* Icon */}
                          <span className="text-lg leading-none shrink-0">{axis.icon}</span>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-bold text-main">{axis.name}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{
                                background: `color-mix(in srgb, ${axis.color} 12%, transparent)`,
                                color: axis.color,
                                border: `1px solid color-mix(in srgb, ${axis.color} 20%, transparent)`,
                              }}>
                                {axis.articles.length} Meldungen
                              </span>
                            </div>
                            <p className="text-[10px] text-muted mt-0.5 leading-relaxed" style={{
                              display: '-webkit-box', WebkitLineClamp: isExpanded ? 10 : 1,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>{axis.description}</p>
                          </div>

                          {/* Intensity gauge */}
                          <div className="flex flex-col items-center gap-1 shrink-0 w-14">
                            <div className="w-full h-1.5 rounded-full bg-main overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{
                                width: `${axis.intensity}%`,
                                background: `linear-gradient(90deg, ${axis.color}88, ${axis.color})`,
                                boxShadow: axis.intensity > 70 ? `0 0 6px ${axis.color}` : undefined,
                              }} />
                            </div>
                            <span className="text-[9px] font-mono font-bold" style={{
                              color: axis.intensity > 70 ? axis.color : 'var(--muted)',
                            }}>
                              {axis.intensity > 70 ? 'HOCH' : axis.intensity > 40 ? 'MITTEL' : 'NIEDRIG'}
                            </span>
                          </div>

                          <ChevronDown size={12} className="text-muted transition-transform shrink-0" style={{
                            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          }} />
                        </button>

                        {/* Expanded: Deep Analysis + Articles */}
                        {isExpanded && (() => {
                          const assessment = assessConflictAxis(axis);
                          const tCfg = THREAT_CONFIG[assessment.threatLevel];
                          return (
                            <div className="border-t space-y-0" style={{ borderColor: `color-mix(in srgb, ${axis.color} 10%, transparent)` }}>

                              {/* Threat Level + Situation */}
                              <div className="px-4 py-3" style={{ background: `color-mix(in srgb, ${axis.color} 3%, transparent)` }}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: tCfg.bg, color: tCfg.color, border: `1px solid ${tCfg.border}` }}>
                                    {tCfg.labelDE}
                                  </span>
                                  <Shield size={11} style={{ color: axis.color }} />
                                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: axis.color }}>Lageeinschätzung</span>
                                </div>
                                <p className="text-[11px] text-main leading-relaxed">{assessment.situationText}</p>
                              </div>

                              {/* Geopolitischer Kontext */}
                              <div className="px-4 py-3 border-t" style={{ borderColor: `color-mix(in srgb, ${axis.color} 8%, transparent)` }}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <Globe size={11} style={{ color: axis.color }} />
                                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: axis.color }}>Geopolitischer Kontext</span>
                                </div>
                                <p className="text-[10px] text-muted leading-relaxed">{assessment.contextText}</p>
                              </div>

                              {/* Einordnung */}
                              <div className="px-4 py-3 border-t" style={{ borderColor: `color-mix(in srgb, ${axis.color} 8%, transparent)` }}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <Eye size={11} style={{ color: axis.color }} />
                                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: axis.color }}>Einordnung & Bedeutung</span>
                                </div>
                                <p className="text-[10px] text-main/80 leading-relaxed">{assessment.implicationText}</p>
                              </div>

                              {/* Schlüsselindikatoren */}
                              <div className="px-4 py-3 border-t" style={{ borderColor: `color-mix(in srgb, ${axis.color} 8%, transparent)` }}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <Zap size={11} style={{ color: axis.color }} />
                                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: axis.color }}>Schlüsselindikatoren</span>
                                </div>
                                <div className="space-y-1">
                                  {assessment.keyIndicators.map((ind, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[10px] text-muted/70 leading-relaxed">
                                      <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-[5px]" style={{ background: axis.color, opacity: 0.4 }} />
                                      {ind}
                                    </div>
                                  ))}
                                </div>
                                <p className="text-[9px] text-muted/40 mt-2 italic">{assessment.recentHighlight}</p>
                              </div>

                              {/* Meldungen */}
                              <div className="px-4 py-3 border-t" style={{ borderColor: `color-mix(in srgb, ${axis.color} 8%, transparent)` }}>
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Radio size={11} style={{ color: axis.color }} />
                                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: axis.color }}>
                                    Zugehörige Meldungen ({axis.articles.length})
                                  </span>
                                </div>
                                <div className="max-h-[240px] overflow-y-auto scrollbar-thin space-y-1">
                                  {axis.articles.slice(0, 15).map(article => (
                                    <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer"
                                      className="flex items-start gap-2.5 px-3 py-2 rounded-lg transition-all hover:bg-hover/30 group" style={{
                                        background: 'color-mix(in srgb, var(--main) 50%, transparent)',
                                      }}>
                                      <span className="text-[9px] font-mono text-muted shrink-0 mt-0.5 w-6">{timeAgo(article.publishedAt)}</span>
                                      {article.id.startsWith('crit_') && <AlertTriangle size={10} className="text-red-400 shrink-0 mt-0.5" />}
                                      <div className="flex-1 min-w-0">
                                        <span className="text-[11px] font-medium text-main group-hover:text-accent-400 transition-colors leading-snug block"
                                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                          {article.title}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span className="text-[9px] font-semibold px-1 py-0.5 rounded" style={{
                                            background: `color-mix(in srgb, ${axis.color} 8%, transparent)`, color: axis.color,
                                          }}>{article.source}</span>
                                          {article.topics.slice(0, 2).map(t => {
                                            const m = topicMeta(t);
                                            return m ? (
                                              <span key={t} className="text-[8px] font-bold px-1 py-0.5 rounded"
                                                style={{ background: m.bg, color: m.text }}>{m.labelShort}</span>
                                            ) : null;
                                          })}
                                        </div>
                                      </div>
                                      <ExternalLink size={10} className="text-muted/20 group-hover:text-accent-400 transition-colors shrink-0 mt-1" />
                                    </a>
                                  ))}
                                  {axis.articles.length > 15 && (
                                    <p className="text-[9px] text-muted/30 text-center py-1.5">+ {axis.articles.length - 15} weitere Meldungen</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="h-[2px]" style={{
                background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.12), transparent)',
              }} />
            </div>
          )}

          {/* ═══ GENERAL FEED SECTION ═══ */}
          {filtered.length > 0 && (
            <button onClick={() => setFeedCollapsed(c => !c)}
              className="sticky top-0 z-10 w-full px-5 py-2 flex items-center gap-2 backdrop-blur-md cursor-pointer transition-colors hover:bg-hover/30" style={{
              background: 'color-mix(in srgb, var(--main) 90%, transparent)',
              borderBottom: '1px solid color-mix(in srgb, var(--border) 40%, transparent)',
            }}>
              <ChevronDown size={12} className="text-muted transition-transform" style={{
                transform: feedCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-400)' }} />
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-400)' }}>
                Allgemeine Meldungen
              </span>
              <span className="text-[10px] font-mono text-muted">{filtered.length}</span>
              <div className="flex-1 h-px" style={{ background: 'color-mix(in srgb, var(--border) 25%, transparent)' }} />
            </button>
          )}

          {!feedCollapsed && grouped.map(group => (
            <div key={group.key}>
              <div className="sticky top-0 z-10 px-5 py-2 backdrop-blur-md" style={{
                background: 'color-mix(in srgb, var(--main) 90%, transparent)',
                borderBottom: '1px solid color-mix(in srgb, var(--border) 40%, transparent)',
              }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: group.key === 'today' ? '#22c55e' : group.key === 'yest' ? 'var(--accent-400)' : 'var(--muted)' }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{
                    color: group.key === 'today' ? '#22c55e' : group.key === 'yest' ? 'var(--accent-400)' : 'var(--muted)',
                  }}>{group.label}</span>
                  <span className="text-[10px] text-muted font-mono">{group.items.length}</span>
                  <div className="flex-1 h-px" style={{ background: 'color-mix(in srgb, var(--border) 25%, transparent)' }} />
                </div>
              </div>

              {group.items.map((article, i) => (
                <ArticleCard key={article.id} article={article} region={region} index={i}
                  onCountryClick={goToCountry}
                  translateLang={translateLang}
                  translations={translations}
                  onTranslated={(id, text) => setTranslations(prev => ({ ...prev, [id]: text }))}
                  isSelected={selectedArticle?.id === article.id}
                  onSelect={showMap ? () => setSelectedArticle(selectedArticle?.id === article.id ? null : article) : undefined} />
              ))}
            </div>
          ))}

          {loading && articles.length > 0 && (
            <div className="flex items-center justify-center py-6 gap-2 text-muted">
              <RefreshCw size={13} className="animate-spin text-accent-400" />
              <span className="text-[11px]">Aktualisiere...</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══ CENTER: INTEL MAP ═══ */}
      {showMap && (
        <div className="hidden md:flex flex-col border-l border-theme anim-fade-in" style={{ width: '420px', minWidth: '320px' }}>
          <div className="shrink-0 px-4 py-2.5 flex items-center gap-2 bg-surface border-b border-theme">
            <MapIcon size={13} className="text-accent-400" />
            <span className="text-[11px] font-bold text-main uppercase tracking-wider">Intel Map</span>
            <span className="text-[10px] text-muted ml-1">Meldungs-Heatmap</span>
            <div className="flex-1" />
            <button onClick={() => { setShowMap(false); setSelectedArticle(null); }}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted hover:text-main bg-card border border-theme transition-colors">
              <X size={10} />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <IntelMap
              articles={filtered}
              criticalArticles={criticalArticles}
              selectedArticle={selectedArticle}
              onSelectArticle={setSelectedArticle}
              region={region}
            />
          </div>
        </div>
      )}

      {/* ═══ RIGHT: SIDEBAR — Stats & Charts ═══ */}
      <div className="hidden lg:flex w-[300px] flex-col bg-surface border-l border-theme overflow-y-auto scrollbar-thin">

        {/* Topic Distribution */}
        <div className="p-4 border-b border-theme">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={13} className="text-accent-400" />
            <h3 className="text-[11px] font-bold text-main uppercase tracking-wider">Themenverteilung</h3>
          </div>

          {/* Topic stat cards */}
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {topicStats.slice(0, 6).map(t => (
              <button key={t.id} onClick={() => toggleTopic(t.id)}
                className="relative p-2 rounded-xl text-center transition-all group overflow-hidden"
                style={{
                  background: selectedTopics.includes(t.id) ? t.bg : 'var(--card)',
                  border: `1px solid ${selectedTopics.includes(t.id) ? t.border : 'var(--border)'}`,
                }}>
                <div className="text-lg font-bold font-mono leading-none" style={{ color: t.text }}>{t.count}</div>
                <div className="text-[8px] text-muted uppercase tracking-wider mt-1 truncate">{t.labelShort}</div>
              </button>
            ))}
          </div>

          {/* Topic bar chart */}
          <MiniBarChart
            data={topicStats.map(t => ({ label: t.labelShort, value: t.count, color: t.bar }))}
            maxVal={Math.max(...topicStats.map(t => t.count), 1)}
          />
        </div>

        {/* Most mentioned countries */}
        <div className="p-4 border-b border-theme">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={13} className="text-accent-400" />
            <h3 className="text-[11px] font-bold text-main uppercase tracking-wider">Top Erwähnungen</h3>
          </div>

          {countryStats.length === 0 && (
            <p className="text-[11px] text-muted italic">Keine Länderdaten verfügbar.</p>
          )}

          <div className="space-y-1">
            {countryStats.map((d, i) => (
              <button key={d.id} onClick={() => goToCountry(d.id)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all hover:bg-hover group"
                style={i === 0 ? {
                  background: 'color-mix(in srgb, var(--accent-500) 6%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--accent-500) 12%, transparent)',
                } : undefined}>
                <span className="text-[10px] font-mono font-bold text-muted w-4">{i + 1}</span>
                <span className="text-base leading-none">{d.country!.flagEmoji}</span>
                <span className="text-[12px] font-medium text-main flex-1 text-left truncate">{d.country!.name}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-[4px] rounded-full bg-card overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${(d.count / (countryStats[0]?.count || 1)) * 100}%`,
                      background: i === 0 ? 'var(--accent-400)' : 'var(--muted)',
                    }} />
                  </div>
                  <span className="text-[11px] font-mono font-bold w-5 text-right" style={{ color: i === 0 ? 'var(--accent-400)' : 'var(--text)' }}>{d.count}</span>
                </div>
                <ArrowRight size={10} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Sources breakdown */}
        <div className="p-4 border-b border-theme">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={13} className="text-accent-400" />
            <h3 className="text-[11px] font-bold text-main uppercase tracking-wider">Top Quellen</h3>
          </div>
          <SourcesBreakdown articles={filtered} />
        </div>

        {/* Conflict Axes Summary */}
        {conflictAxes.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Crosshair size={13} className="text-indigo-400" />
              <h3 className="text-[11px] font-bold text-main uppercase tracking-wider">Konfliktachsen</h3>
            </div>
            <div className="space-y-2">
              {conflictAxes.slice(0, 8).map(axis => (
                <button key={axis.id}
                  onClick={() => setExpandedAxis(expandedAxis === axis.id ? null : axis.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:bg-hover/30 text-left"
                  style={{ border: `1px solid color-mix(in srgb, ${axis.color} 12%, transparent)` }}>
                  <span className="text-xs leading-none">{axis.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-main block truncate">{axis.nameShort}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-8 h-1 rounded-full bg-card overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${axis.intensity}%`,
                        background: axis.color,
                      }} />
                    </div>
                    <span className="text-[9px] font-mono font-bold w-4 text-right" style={{ color: axis.color }}>
                      {axis.articles.length}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Article Card ──
function ArticleCard({ article, region, index, onCountryClick, translateLang, translations, onTranslated, isSelected, onSelect }: {
  article: NewsArticle;
  region: any;
  index: number;
  onCountryClick: (id: string) => void;
  translateLang: string;
  translations: Record<string, string>;
  onTranslated: (id: string, text: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const hasImage = !!article.imageUrl;
  const mainTopic = article.topics[0] ? topicMeta(article.topics[0]) : null;
  const [translating, setTranslating] = useState(false);

  // Auto-translate when language changes
  useEffect(() => {
    if (!translateLang || translations[article.id]) return;
    let cancelled = false;
    setTranslating(true);
    translateText(article.title, translateLang).then(translated => {
      if (!cancelled) {
        onTranslated(article.id, translated);
        setTranslating(false);
      }
    });
    return () => { cancelled = true; };
  }, [translateLang, article.id, article.title]);

  const displayTitle = translateLang && translations[article.id] ? translations[article.id] : article.title;

  return (
    <article
      onClick={onSelect}
      className={`group px-5 py-3.5 border-b transition-all hover:bg-hover/30 anim-fade-up ${onSelect ? 'cursor-pointer' : ''}`}
      style={{
        borderColor: 'color-mix(in srgb, var(--border) 25%, transparent)',
        animationDelay: `${Math.min(index, 6) * 40}ms`,
        background: isSelected ? 'color-mix(in srgb, var(--accent-500) 6%, transparent)' : undefined,
        boxShadow: isSelected ? 'inset 3px 0 0 var(--accent-500)' : undefined,
      }}
    >
      <div className="flex gap-3.5">
        {/* Accent strip */}
        <div className="w-[3px] rounded-full shrink-0 self-stretch" style={{
          background: mainTopic ? mainTopic.bar : 'var(--accent-500)',
          opacity: 0.6,
        }} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <a href={article.url} target="_blank" rel="noopener noreferrer"
            className={`text-[13px] font-semibold text-main leading-snug hover:text-accent-400 transition-colors block ${translating ? 'opacity-50' : ''}`}
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {translating ? '...' : displayTitle}
          </a>
          {translateLang && translations[article.id] && (
            <div className="text-[9px] text-muted/40 mt-0.5 truncate" title={article.title}>
              Original: {article.title}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{
              background: 'color-mix(in srgb, var(--accent-500) 8%, transparent)',
              color: 'var(--accent-400)',
            }}>{article.source}</span>
            <span className="text-[10px] text-muted flex items-center gap-0.5">
              <Clock size={8} /> {timeAgo(article.publishedAt)}
            </span>
            <a href={article.url} target="_blank" rel="noopener noreferrer"
              className="ml-auto text-muted/30 hover:text-accent-400 transition-colors">
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {article.topics.map(t => {
              const m = topicMeta(t);
              if (!m) return null;
              return (
                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                  style={{ background: m.bg, color: m.text, border: `1px solid ${m.border}` }}>
                  {m.labelShort}
                </span>
              );
            })}
            {article.countries.map(id => {
              const c = region.countriesById[id];
              if (!c) return null;
              return (
                <button key={id} onClick={() => onCountryClick(id)}
                  className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium transition-all"
                  style={{
                    background: 'var(--card)', color: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}>
                  <span className="text-[10px]">{c.flagEmoji}</span> {c.name}
                </button>
              );
            })}
          </div>

          {/* Cross-references */}
          {article.countries.length > 1 && (
            <div className="mt-1.5 flex items-center gap-1 text-[9px] text-muted/40">
              <Globe size={8} />
              Querverweis: {article.countries.map(id => region.countriesById[id]?.name).filter(Boolean).join(' ↔ ')}
            </div>
          )}
        </div>

        {/* Thumbnail */}
        {hasImage && (
          <div className="w-24 h-[70px] rounded-xl overflow-hidden shrink-0 bg-card border border-theme self-start">
            <img src={article.imageUrl} alt="" className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
      </div>
    </article>
  );
}

// ── Info Block ──
function InfoBlock({ icon, title, items, children }: {
  icon: React.ReactNode; title: string; items?: string[]; children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-accent-400">{icon}</span>
        <span className="text-[11px] font-bold text-main uppercase tracking-wider">{title}</span>
      </div>
      {items && (
        <ul className="space-y-1 pl-5">
          {items.map((item, i) => (
            <li key={i} className="text-[11px] text-muted/80 leading-relaxed relative before:content-[''] before:absolute before:left-[-12px] before:top-[7px] before:w-[4px] before:h-[4px] before:rounded-full"
              style={{ ['--tw-before-bg' as string]: 'var(--accent-500)' }}>
              <span className="absolute -left-3 top-[7px] w-1 h-1 rounded-full" style={{ background: 'var(--accent-500)', opacity: 0.4 }} />
              {item}
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}

// ── Sources breakdown ──
function SourcesBreakdown({ articles }: { articles: NewsArticle[] }) {
  const sources = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of articles) counts[a.source] = (counts[a.source] ?? 0) + 1;
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  }, [articles]);

  if (sources.length === 0) return <p className="text-[11px] text-muted italic">Keine Quellen.</p>;

  const max = sources[0][1];
  return (
    <div className="space-y-1.5">
      {sources.map(([name, count]) => (
        <div key={name} className="flex items-center gap-2">
          <span className="text-[10px] text-muted w-20 truncate text-right" title={name}>{name}</span>
          <div className="flex-1 h-[5px] rounded-full bg-card overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{
              width: `${(count / max) * 100}%`,
              background: 'var(--accent-500)',
              opacity: 0.6,
            }} />
          </div>
          <span className="text-[10px] font-mono font-bold text-main w-5 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}
