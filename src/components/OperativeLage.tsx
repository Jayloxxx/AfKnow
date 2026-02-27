import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield, AlertTriangle, Activity, Clock, RefreshCw, ChevronDown, ChevronRight,
  Globe, Crosshair, Users, Zap, TrendingUp, Radio, Eye, Target,
  ExternalLink, MapPin, Info, X, FileText, Lightbulb,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRegion } from '../context/RegionContext';
import { fetchNews, fetchCriticalEvents, fetchConflictAxisArticles, matchConflictAxes, type NewsArticle, type RegionId } from '../lib/newsApi';
import {
  assessThreat, assessSector, assessCountry, generateGlobalAssessment,
  THREAT_CONFIG, TOPIC_DE, type CountryAssessment,
} from '../lib/lageAnalysis';

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  security: <Shield size={12} />, military: <Crosshair size={12} />,
  politics: <Target size={12} />, humanitarian: <Users size={12} />,
  economy: <TrendingUp size={12} />, diplomacy: <Globe size={12} />,
};
const TOPIC_COLORS: Record<string, string> = {
  security: '#ef4444', military: '#f97316', politics: '#a855f7',
  humanitarian: '#0ea5e9', economy: '#10b981', diplomacy: '#3b82f6',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'JETZT';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function formatTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19) + 'Z';
}

// Sector definitions per region
const SECTOR_DEFS_AFRICA = [
  { id: 'sahel', name: 'SEKTOR SAHEL', countries: ['ML', 'BF', 'NE', 'TD', 'MR', 'SN', 'GM'] },
  { id: 'west', name: 'SEKTOR WEST', countries: ['NG', 'GH', 'CI', 'GN', 'SL', 'LR', 'TG', 'BJ', 'GW'] },
  { id: 'east', name: 'SEKTOR OST', countries: ['ET', 'SO', 'KE', 'UG', 'RW', 'BI', 'DJ', 'ER', 'TZ', 'SS'] },
  { id: 'central', name: 'SEKTOR ZENTRAL', countries: ['CD', 'CG', 'CM', 'CF', 'GA', 'GQ'] },
  { id: 'north', name: 'SEKTOR NORD', countries: ['EG', 'LY', 'TN', 'DZ', 'MA', 'SD'] },
  { id: 'south', name: 'SEKTOR SÜD', countries: ['ZA', 'MZ', 'ZW', 'ZM', 'MW', 'AO', 'NA', 'BW', 'SZ', 'LS'] },
];

const SECTOR_DEFS_MIDEAST = [
  { id: 'levante', name: 'SEKTOR LEVANTE', countries: ['SY', 'LB', 'JO', 'IL', 'PS'] },
  { id: 'gulf', name: 'SEKTOR GOLF', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'] },
  { id: 'mesopotamia', name: 'SEKTOR MESOPOTAMIEN', countries: ['IQ', 'IR'] },
  { id: 'redSea', name: 'SEKTOR ROTES MEER', countries: ['YE', 'DJ', 'ER', 'SD'] },
  { id: 'turkey', name: 'SEKTOR TÜRKEI / ANATOLIEN', countries: ['TR'] },
  { id: 'northAfrica', name: 'SEKTOR NORDAFRIKA-NAHOST', countries: ['EG', 'LY'] },
];

const SECTOR_DEFS_MAP: Record<string, typeof SECTOR_DEFS_AFRICA> = {
  africa: SECTOR_DEFS_AFRICA,
  mideast: SECTOR_DEFS_MIDEAST,
};

// ══════════════════════════════════════════════
// OPERATIVE LAGE — Command Center Dashboard
// ══════════════════════════════════════════════

export default function OperativeLage() {
  const region = useRegion();
  const { setActiveTab } = useStore();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [criticalArticles, setCriticalArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  const regionId = region.id as RegionId;
  const SECTOR_DEFS = SECTOR_DEFS_MAP[regionId] ?? SECTOR_DEFS_AFRICA;

  const regionCountries = useMemo(() =>
    Object.values(region.countriesById).sort((a: any, b: any) => a.name.localeCompare(b.name)) as any[],
    [region]
  );

  const countryNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of regionCountries) map[c.id] = c.name;
    return map;
  }, [regionCountries]);

  const [axisArticles, setAxisArticles] = useState<NewsArticle[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [news, critical] = await Promise.all([
        fetchNews([], [], '7d', 75, regionId),
        fetchCriticalEvents(regionCountries.map((c: any) => c.id), '7d', undefined, regionId),
      ]);
      setArticles(news);
      setCriticalArticles(critical);
      setLastUpdate(new Date());
      // Load axis articles after main data (separate to avoid rate limit)
      await new Promise(r => setTimeout(r, 2000));
      const axes = await fetchConflictAxisArticles(regionId, '7d');
      setAxisArticles(axes);
    } catch { /* silently handle */ }
    finally { setLoading(false); }
  }, [regionCountries, regionId]);

  useEffect(() => { loadData(); }, [loadData]);

  const allArticles = useMemo(() => [...criticalArticles, ...articles, ...axisArticles], [articles, criticalArticles, axisArticles]);

  // Conflict axes
  const conflictAxes = useMemo(() => matchConflictAxes(allArticles, regionId), [allArticles, regionId]);
  const [expandedAxisOp, setExpandedAxisOp] = useState<string | null>(null);

  // ── Computed assessments ──
  const globalThreat = useMemo(() => assessThreat(allArticles), [allArticles]);

  const sectors = useMemo(() =>
    SECTOR_DEFS.map(sec => assessSector(allArticles, sec.id, sec.name, sec.countries, countryNames)),
    [allArticles, countryNames]
  );

  const globalAssessment = useMemo(() =>
    generateGlobalAssessment(globalThreat, sectors.length, sectors.filter(s => s.articles.length > 0).length, new Set(allArticles.flatMap(a => a.countries)).size),
    [globalThreat, sectors, allArticles]
  );

  const hotspots = useMemo(() => {
    const results: CountryAssessment[] = [];
    for (const c of regionCountries) {
      const assessment = assessCountry(allArticles, c.id, c.name);
      if (assessment.threat.totalCount > 0) results.push(assessment);
    }
    return results.sort((a, b) => b.threat.critCount - a.threat.critCount || b.threat.totalCount - a.threat.totalCount).slice(0, 12);
  }, [allArticles, regionCountries]);

  const topicDist = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of allArticles) { for (const t of a.topics) counts[t] = (counts[t] ?? 0) + 1; }
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [allArticles]);

  const recentCritical = useMemo(() => criticalArticles.slice(0, 8), [criticalArticles]);

  const tConfig = THREAT_CONFIG[globalThreat.level];

  return (
    <div className="flex-1 flex flex-col bg-main overflow-hidden" style={{ fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace' }}>

      {/* ═══ HEADER ═══ */}
      <div className="shrink-0 bg-surface border-b border-theme px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center relative" style={{
              background: tConfig.bg, border: `2px solid ${tConfig.border}`,
            }}>
              <Shield size={22} style={{ color: tConfig.color }} />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{
                background: tConfig.color, boxShadow: `0 0 10px ${tConfig.color}`,
              }} />
            </div>
            <div>
              <h1 className="text-[18px] font-black tracking-tight text-main uppercase">Operative Lagebeurteilung</h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-muted tracking-wider">REGION: {region.name.toUpperCase()}</span>
                <span className="text-[10px] text-muted">|</span>
                <span className="text-[10px] text-muted flex items-center gap-1">
                  <Clock size={9} /> {lastUpdate ? formatTimestamp() : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Global Threat Level */}
          <div className="flex flex-col items-center px-6 py-2 rounded-xl" style={{ background: tConfig.bg, border: `2px solid ${tConfig.border}` }}>
            <span className="text-[9px] font-bold tracking-[0.2em] text-muted uppercase">Bedrohungslage</span>
            <span className="text-[22px] font-black leading-none mt-1" style={{ color: tConfig.color }}>{tConfig.labelDE}</span>
            <span className="text-[9px] tracking-[0.15em] mt-0.5" style={{ color: tConfig.color, opacity: 0.6 }}>THREAT LEVEL: {tConfig.label}</span>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            {[
              { label: 'MELDUNGEN', value: allArticles.length, icon: <Radio size={11} />, color: 'var(--accent-400)' },
              { label: 'KRITISCH', value: criticalArticles.length, icon: <AlertTriangle size={11} />, color: '#ef4444' },
              { label: 'LÄNDER', value: new Set(allArticles.flatMap(a => a.countries)).size, icon: <Globe size={11} />, color: '#3b82f6' },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col items-center px-3 py-2 rounded-lg bg-card border border-theme min-w-[70px]">
                <span className="text-[8px] font-bold tracking-[0.15em] text-muted uppercase flex items-center gap-1">
                  <span style={{ color: stat.color }}>{stat.icon}</span> {stat.label}
                </span>
                <span className="text-[20px] font-black leading-none mt-1" style={{ color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Info button */}
          <button onClick={() => setShowInfo(!showInfo)}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${showInfo ? 'bg-accent-500/15 border-accent-500/30 text-accent-400' : 'bg-card border-theme text-muted hover:text-main'}`}
            title="Wie wird die Operative Lage gebildet?">
            <Info size={16} />
          </button>

          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            style={{ background: 'var(--accent-500)', color: '#fff' }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Aktualisieren
          </button>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">

        {/* ── INFO PANEL ── */}
        {showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}

        <div className="p-6 space-y-6">

          {/* ══ GLOBAL ASSESSMENT ══ */}
          <div className="rounded-xl overflow-hidden" style={{ background: tConfig.bg, border: `1px solid ${tConfig.border}` }}>
            <div className="px-5 py-3 flex items-center gap-2" style={{
              background: `color-mix(in srgb, ${tConfig.color} 8%, transparent)`,
              borderBottom: `1px solid ${tConfig.border}`,
            }}>
              <FileText size={14} style={{ color: tConfig.color }} />
              <span className="text-[11px] font-black tracking-[0.12em] uppercase" style={{ color: tConfig.color }}>
                Gesamtlagebewertung
              </span>
              <span className="text-[9px] text-muted ml-2">Automatisierte Bewertung auf Basis von {allArticles.length} Meldungen</span>
            </div>
            <div className="p-5 space-y-4">
              {/* Summary */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Eye size={11} style={{ color: tConfig.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tConfig.color }}>Begründung</span>
                </div>
                <p className="text-[12px] text-main leading-relaxed">{globalAssessment.summary}</p>
              </div>
              {/* Derivation */}
              <div className="pt-3" style={{ borderTop: `1px solid ${tConfig.border}` }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb size={11} style={{ color: tConfig.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tConfig.color }}>Ableitung</span>
                </div>
                <p className="text-[12px] text-main/80 leading-relaxed">{globalAssessment.derivation}</p>
              </div>
            </div>
          </div>

          {/* ── ROW 1: Sector Overview + Topic Distribution ── */}
          <div className="grid grid-cols-12 gap-5">

            {/* Sector Grid — 8 cols */}
            <div className="col-span-8">
              <SectionHeader icon={<Target size={13} />} title="SEKTORALE LAGEÜBERSICHT" subtitle="Bedrohungsanalyse nach Operationsgebiet" />
              <div className="grid grid-cols-3 gap-3 mt-3">
                {sectors.map(sec => {
                  const cfg = THREAT_CONFIG[sec.threat.level];
                  const isExpanded = expandedSector === sec.id;
                  return (
                    <button key={sec.id} onClick={() => setExpandedSector(isExpanded ? null : sec.id)}
                      className="text-left p-3.5 rounded-xl transition-all hover:scale-[1.01]"
                      style={{
                        background: isExpanded ? cfg.bg : 'var(--card)',
                        border: `1px solid ${isExpanded ? cfg.border : 'var(--border)'}`,
                      }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black tracking-[0.15em] text-main uppercase">{sec.name}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{
                          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                        }}>{cfg.labelDE}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-main overflow-hidden mb-2">
                        <div className="h-full rounded-full transition-all duration-700" style={{
                          width: `${Math.min(100, (sec.articles.length / Math.max(...sectors.map(s => s.articles.length), 1)) * 100)}%`,
                          background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`,
                          boxShadow: `0 0 8px ${cfg.color}40`,
                        }} />
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted">
                        <span>{sec.articles.length} Meldungen</span>
                        {sec.threat.critCount > 0 && <span className="text-red-400 font-bold">{sec.threat.critCount} kritisch</span>}
                      </div>
                      {sec.topCountries.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {sec.topCountries.map(tc => (
                            <span key={tc.id} className="text-[9px] px-1.5 py-0.5 rounded-md bg-main text-muted">
                              {(region.countriesById[tc.id] as any)?.flagEmoji} {countryNames[tc.id]?.slice(0, 10)}
                              <span className="font-bold ml-0.5" style={{ color: cfg.color }}>{tc.count}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-[9px]" style={{ color: cfg.color, opacity: 0.6 }}>
                        {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                        {isExpanded ? 'Einklappen' : 'Begründung & Ableitung'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Expanded sector — Reasoning & Derivation */}
              {expandedSector && (() => {
                const sec = sectors.find(s => s.id === expandedSector);
                if (!sec) return null;
                const cfg = THREAT_CONFIG[sec.threat.level];
                return (
                  <div className="mt-3 rounded-xl overflow-hidden anim-fade-up" style={{ border: `1px solid ${cfg.border}` }}>
                    {/* Sector header */}
                    <div className="px-4 py-2.5 flex items-center gap-2" style={{
                      background: `color-mix(in srgb, ${cfg.color} 10%, var(--card))`,
                      borderBottom: `1px solid ${cfg.border}`,
                    }}>
                      <Eye size={13} style={{ color: cfg.color }} />
                      <span className="text-[11px] font-black tracking-wider uppercase" style={{ color: cfg.color }}>{sec.name} — ANALYSE</span>
                    </div>

                    <div className="p-4 space-y-4" style={{ background: cfg.bg }}>
                      {/* Reasoning */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <FileText size={11} style={{ color: cfg.color }} />
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>Begründung der Bewertung</span>
                        </div>
                        <p className="text-[11px] text-main leading-relaxed mb-2">{sec.sectorReasoning}</p>
                        <ul className="space-y-1.5">
                          {sec.threat.reasoning.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-[11px] text-main/80 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-[5px]" style={{ background: cfg.color, opacity: 0.5 }} />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Derivation */}
                      <div className="pt-3" style={{ borderTop: `1px solid ${cfg.border}` }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Lightbulb size={11} style={{ color: cfg.color }} />
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>Operative Ableitung</span>
                        </div>
                        <p className="text-[11px] text-main/80 leading-relaxed">{sec.sectorDerivation}</p>
                        {sec.threat.derivations.map((d, i) => (
                          <p key={i} className="text-[11px] text-main/60 leading-relaxed mt-1.5 pl-3" style={{ borderLeft: `2px solid ${cfg.border}` }}>{d}</p>
                        ))}
                      </div>

                      {/* Recent articles */}
                      <div className="pt-3" style={{ borderTop: `1px solid ${cfg.border}` }}>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Letzte Meldungen</span>
                        <div className="space-y-1.5 mt-2 max-h-[180px] overflow-y-auto scrollbar-thin">
                          {sec.articles.slice(0, 8).map(a => (
                            <div key={a.id} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-main/50">
                              <span className="text-[9px] font-mono text-muted shrink-0 mt-0.5">{timeAgo(a.publishedAt)}</span>
                              {a.id.startsWith('crit_') && <AlertTriangle size={10} className="text-red-400 shrink-0 mt-0.5" />}
                              <a href={a.url} target="_blank" rel="noopener noreferrer"
                                className="text-[11px] text-main hover:text-accent-400 transition-colors leading-snug flex-1"
                                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {a.title}
                              </a>
                              <span className="text-[9px] text-muted shrink-0">{a.source}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Topic Distribution — 4 cols */}
            <div className="col-span-4 space-y-5">
              <div>
                <SectionHeader icon={<Activity size={13} />} title="THEMENVERTEILUNG" subtitle="Kategoriale Aufschlüsselung" />
                <div className="mt-3 space-y-2">
                  {topicDist.map(([topic, count]) => {
                    const color = TOPIC_COLORS[topic];
                    if (!color) return null;
                    const maxCount = topicDist[0]?.[1] as number || 1;
                    return (
                      <div key={topic} className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5 w-24 shrink-0">
                          <span style={{ color }}>{TOPIC_ICONS[topic]}</span>
                          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{TOPIC_DE[topic]}</span>
                        </div>
                        <div className="flex-1 h-2 rounded-full bg-card overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{
                            width: `${(count / maxCount) * 100}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}88)`,
                          }} />
                        </div>
                        <span className="text-[11px] font-black w-8 text-right" style={{ color }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <SectionHeader icon={<Zap size={13} />} title="LAGEBILD-KENNZAHLEN" subtitle="Operative Metriken" />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { label: 'QUELLEN', value: new Set(allArticles.map(a => a.source)).size, color: 'var(--accent-400)' },
                    { label: 'SEKTOREN AKTIV', value: sectors.filter(s => s.articles.length > 0).length, color: '#f97316' },
                    { label: 'KRIT. LÄNDER', value: hotspots.filter(h => h.threat.level === 'CRITICAL' || h.threat.level === 'HIGH').length, color: '#ef4444' },
                    { label: 'SCORE', value: globalThreat.score.toFixed(0), color: tConfig.color },
                  ].map(m => (
                    <div key={m.label} className="p-2.5 rounded-lg bg-card border border-theme text-center">
                      <div className="text-[8px] font-bold tracking-[0.15em] text-muted uppercase">{m.label}</div>
                      <div className="text-[18px] font-black leading-none mt-1" style={{ color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 2: Hotspot Countries + Critical Timeline ── */}
          <div className="grid grid-cols-12 gap-5">

            {/* Hotspot Countries — 5 cols */}
            <div className="col-span-5">
              <SectionHeader icon={<MapPin size={13} />} title="HOTSPOT-ANALYSE" subtitle="Länder mit Begründung & Ableitung" />
              <div className="mt-3 space-y-1.5">
                {hotspots.map((h, i) => {
                  const cfg = THREAT_CONFIG[h.threat.level];
                  const country = regionCountries.find((c: any) => c.id === h.id) as any;
                  if (!country) return null;
                  const isExpanded = expandedCountry === h.id;

                  return (
                    <div key={h.id}>
                      <button onClick={() => setExpandedCountry(isExpanded ? null : h.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-hover/30 text-left"
                        style={i === 0 ? { background: cfg.bg, border: `1px solid ${cfg.border}` } : { background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <span className="text-[10px] font-mono font-bold text-muted w-4">{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-base leading-none">{country.flagEmoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-bold text-main truncate">{country.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.color }}>{cfg.labelDE}</span>
                            <span className="text-[9px] text-muted">{h.threat.totalCount} Meldungen</span>
                            {h.threat.critCount > 0 && <span className="text-[9px] text-red-400 font-bold">{h.threat.critCount} krit.</span>}
                          </div>
                        </div>
                        <div className="w-16 h-1.5 rounded-full bg-main overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(h.threat.totalCount / (hotspots[0]?.threat.totalCount || 1)) * 100}%`, background: cfg.color }} />
                        </div>
                        {isExpanded ? <ChevronDown size={11} style={{ color: cfg.color }} /> : <ChevronRight size={11} className="text-muted" />}
                      </button>

                      {/* Country Assessment Detail */}
                      {isExpanded && (
                        <div className="ml-7 mt-1.5 p-3 rounded-lg anim-fade-up" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                          <div className="mb-2">
                            <div className="flex items-center gap-1.5 mb-1">
                              <FileText size={10} style={{ color: cfg.color }} />
                              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>Begründung</span>
                            </div>
                            <p className="text-[10px] text-main/80 leading-relaxed">{h.countryReasoning}</p>
                          </div>
                          <div className="pt-2" style={{ borderTop: `1px solid ${cfg.border}` }}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Lightbulb size={10} style={{ color: cfg.color }} />
                              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>Ableitung</span>
                            </div>
                            <p className="text-[10px] text-main/60 leading-relaxed">{h.countryDerivation}</p>
                          </div>
                          {h.dominantTopics.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: `1px solid ${cfg.border}` }}>
                              <span className="text-[8px] text-muted uppercase tracking-wider">Dominant:</span>
                              {h.dominantTopics.map(t => (
                                <span key={t} className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{
                                  background: `${TOPIC_COLORS[t]}15`, color: TOPIC_COLORS[t],
                                }}>{TOPIC_DE[t]}</span>
                              ))}
                            </div>
                          )}

                          {/* Zugehörige Meldungen */}
                          {h.articles.length > 0 && (
                            <div className="pt-2 mt-2" style={{ borderTop: `1px solid ${cfg.border}` }}>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Radio size={10} style={{ color: cfg.color }} />
                                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
                                  Zugrunde liegende Meldungen ({h.articles.length})
                                </span>
                              </div>
                              <div className="space-y-1 max-h-[200px] overflow-y-auto scrollbar-thin">
                                {h.articles.slice(0, 15).map(a => (
                                  <div key={a.id} className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg bg-main/50 group">
                                    <span className="text-[8px] font-mono text-muted shrink-0 mt-0.5 w-6">{timeAgo(a.publishedAt)}</span>
                                    {a.id.startsWith('crit_') && (
                                      <AlertTriangle size={9} className="text-red-400 shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <a href={a.url} target="_blank" rel="noopener noreferrer"
                                        className="text-[10px] text-main hover:text-accent-400 transition-colors leading-snug block"
                                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {a.title}
                                      </a>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[8px] text-muted">{a.source}</span>
                                        {a.topics.slice(0, 2).map(t => (
                                          <span key={t} className="text-[7px] font-bold px-1 py-0.5 rounded" style={{
                                            background: `${TOPIC_COLORS[t]}10`, color: TOPIC_COLORS[t],
                                          }}>{TOPIC_DE[t]}</span>
                                        ))}
                                      </div>
                                    </div>
                                    <a href={a.url} target="_blank" rel="noopener noreferrer"
                                      className="text-muted/20 hover:text-accent-400 transition-colors shrink-0 mt-0.5">
                                      <ExternalLink size={9} />
                                    </a>
                                  </div>
                                ))}
                                {h.articles.length > 15 && (
                                  <p className="text-[9px] text-muted/40 text-center py-1">
                                    + {h.articles.length - 15} weitere Meldungen
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Critical Timeline — 7 cols */}
            <div className="col-span-7">
              <SectionHeader icon={<AlertTriangle size={13} />} title="KRITISCHE EREIGNISSE — ZEITLEISTE" subtitle="Einschneidende Vorfälle in chronologischer Reihenfolge" />
              <div className="mt-3 relative">
                <div className="absolute left-[18px] top-0 bottom-0 w-[2px] rounded-full" style={{
                  background: 'linear-gradient(180deg, #ef4444, rgba(239,68,68,0.1))',
                }} />
                <div className="space-y-1">
                  {recentCritical.map((article, i) => (
                    <div key={article.id} className="flex items-start gap-3 pl-1 anim-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="relative mt-2 shrink-0 z-10">
                        <div className="w-[10px] h-[10px] rounded-full border-2 border-red-500" style={{
                          background: i === 0 ? '#ef4444' : 'var(--main)',
                          boxShadow: i === 0 ? '0 0 10px rgba(239,68,68,0.5)' : undefined,
                        }} />
                        {i === 0 && <div className="absolute inset-0 w-[10px] h-[10px] rounded-full bg-red-500 animate-ping opacity-30" />}
                      </div>
                      <div className="flex-1 px-3 py-2.5 rounded-lg transition-all hover:bg-hover/30" style={{
                        background: i === 0 ? 'rgba(239,68,68,0.06)' : 'var(--card)',
                        border: `1px solid ${i === 0 ? 'rgba(239,68,68,0.15)' : 'var(--border)'}`,
                      }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-mono font-bold text-red-400/60">{timeAgo(article.publishedAt)}</span>
                          <span className="text-[9px] text-muted">·</span>
                          <span className="text-[9px] font-bold text-muted">{article.source}</span>
                          <div className="flex-1" />
                          {article.countries.slice(0, 3).map(cId => {
                            const c = region.countriesById[cId] as any;
                            return c ? <span key={cId} className="text-[9px] px-1.5 py-0.5 rounded bg-main text-muted">{c.flagEmoji} {c.name}</span> : null;
                          })}
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-muted/30 hover:text-red-400 transition-colors">
                            <ExternalLink size={10} />
                          </a>
                        </div>
                        <a href={article.url} target="_blank" rel="noopener noreferrer"
                          className="text-[12px] font-semibold text-main leading-snug hover:text-red-400 transition-colors"
                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {article.title}
                        </a>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {article.topics.slice(0, 3).map(t => (
                            <span key={t} className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                              style={{ background: `${TOPIC_COLORS[t]}15`, color: TOPIC_COLORS[t], border: `1px solid ${TOPIC_COLORS[t]}25` }}>
                              {TOPIC_DE[t]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {criticalArticles.length > 8 && (
                  <button onClick={() => setActiveTab('takt-lage')}
                    className="mt-3 ml-8 flex items-center gap-1.5 text-[10px] font-bold text-accent-400 hover:text-accent-300 transition-colors uppercase tracking-wider">
                    <ChevronRight size={10} /> Alle {criticalArticles.length} Ereignisse in Taktischer Lage
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── ROW 3: GEOPOLITISCHE KONFLIKTACHSEN ── */}
          {conflictAxes.length > 0 && (
            <div>
              <SectionHeader icon={<Globe size={13} />} title="GEOPOLITISCHE KONFLIKTACHSEN" subtitle="Erkannte Dynamiken und Machtkonstellationen" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                {conflictAxes.slice(0, 10).map(axis => {
                  const isExpanded = expandedAxisOp === axis.id;
                  return (
                    <div key={axis.id} className="rounded-xl overflow-hidden transition-all" style={{
                      border: `1px solid color-mix(in srgb, ${axis.color} ${isExpanded ? '25' : '12'}%, transparent)`,
                      background: isExpanded ? `color-mix(in srgb, ${axis.color} 4%, var(--card))` : 'var(--card)',
                    }}>
                      <button onClick={() => setExpandedAxisOp(isExpanded ? null : axis.id)}
                        className="w-full px-3.5 py-3 flex items-center gap-2.5 text-left transition-all hover:bg-hover/20">
                        <div className="w-[3px] self-stretch rounded-full shrink-0" style={{
                          background: `linear-gradient(180deg, ${axis.color}, ${axis.color}44)`,
                        }} />
                        <span className="text-base leading-none shrink-0">{axis.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[12px] font-black text-main uppercase tracking-wide">{axis.nameShort}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{
                              background: axis.intensity > 70 ? 'rgba(239,68,68,0.10)' : axis.intensity > 40 ? 'rgba(249,115,22,0.10)' : 'rgba(59,130,246,0.10)',
                              color: axis.intensity > 70 ? '#ef4444' : axis.intensity > 40 ? '#f97316' : '#3b82f6',
                            }}>
                              {axis.intensity > 70 ? 'HOCH' : axis.intensity > 40 ? 'MITTEL' : 'NIEDRIG'}
                            </span>
                          </div>
                          <p className="text-[9px] text-muted leading-relaxed" style={{
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>{axis.description}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className="text-[16px] font-black font-mono leading-none" style={{ color: axis.color }}>{axis.articles.length}</span>
                          <span className="text-[8px] text-muted uppercase tracking-wider">Meldungen</span>
                        </div>
                        {isExpanded ? <ChevronDown size={11} style={{ color: axis.color }} /> : <ChevronRight size={11} className="text-muted" />}
                      </button>
                      {isExpanded && (
                        <div className="px-3.5 pb-3 border-t space-y-1" style={{ borderColor: `color-mix(in srgb, ${axis.color} 10%, transparent)` }}>
                          <span className="text-[9px] font-bold uppercase tracking-wider block pt-2 pb-1" style={{ color: axis.color }}>Letzte Meldungen</span>
                          <div className="max-h-[200px] overflow-y-auto scrollbar-thin space-y-1">
                            {axis.articles.slice(0, 10).map(a => (
                              <div key={a.id} className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg bg-main/50">
                                <span className="text-[8px] font-mono text-muted shrink-0 mt-0.5 w-6">{timeAgo(a.publishedAt)}</span>
                                {a.id.startsWith('crit_') && <AlertTriangle size={9} className="text-red-400 shrink-0 mt-0.5" />}
                                <a href={a.url} target="_blank" rel="noopener noreferrer"
                                  className="text-[10px] text-main hover:text-accent-400 transition-colors leading-snug flex-1"
                                  style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {a.title}
                                </a>
                                <span className="text-[8px] text-muted shrink-0">{a.source}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className="shrink-0" style={{
        background: 'linear-gradient(90deg, rgba(239,68,68,0.06), transparent, rgba(239,68,68,0.06))',
        borderTop: '1px solid rgba(239,68,68,0.10)',
      }}>
        <div className="flex items-center justify-between px-6 py-1">
          <span className="text-[8px] tracking-[0.2em] text-muted/30">OPERATIVE LAGEBEURTEILUNG — AUTOMATISIERT GENERIERT — KEINE NACHRICHTENDIENSTLICHE BEWERTUNG</span>
          <span className="text-[8px] tracking-[0.2em] text-muted/30">DATENQUELLE: GDELT PROJECT — {lastUpdate ? formatTimestamp() : '—'}</span>
        </div>
      </div>
    </div>
  );
}

// ── Section Header ──
function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent-400" style={{
        background: 'color-mix(in srgb, var(--accent-500) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--accent-500) 20%, transparent)',
      }}>{icon}</div>
      <div>
        <h3 className="text-[11px] font-black text-main uppercase tracking-[0.12em]">{title}</h3>
        <p className="text-[9px] text-muted tracking-wider">{subtitle}</p>
      </div>
      <div className="flex-1 h-px ml-3" style={{ background: 'color-mix(in srgb, var(--border) 40%, transparent)' }} />
    </div>
  );
}

// ═══════════════════════════════════════════
// INFO PANEL — Full transparency explanation
// ═══════════════════════════════════════════
function InfoPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="mx-6 mt-6 rounded-2xl overflow-hidden anim-fade-up" style={{
      background: 'color-mix(in srgb, var(--accent-500) 3%, var(--card))',
      border: '1px solid color-mix(in srgb, var(--accent-500) 12%, transparent)',
    }}>
      <div className="px-5 py-3 flex items-center gap-2" style={{
        background: 'color-mix(in srgb, var(--accent-500) 6%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--accent-500) 10%, transparent)',
      }}>
        <Info size={14} className="text-accent-400" />
        <span className="text-[13px] font-black text-main tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Wie wird die Operative Lage gebildet?
        </span>
        <div className="flex-1" />
        <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-muted hover:text-main bg-card border border-theme transition-colors">
          <X size={10} />
        </button>
      </div>

      <div className="p-5 space-y-5 text-[11px] leading-relaxed">

        <InfoBlock title="Datenquelle" icon={<Globe size={12} />}>
          <p>Alle Daten stammen aus dem <strong>GDELT Project</strong> (Global Database of Events, Language, and Tone) — einer frei zugänglichen, von Google unterstützten Datenbank, die weltweit Nachrichtenquellen in über 100 Sprachen überwacht und alle 15 Minuten aktualisiert.</p>
          <p className="mt-1.5 text-muted/60">Es werden zwei separate API-Abfragen durchgeführt: eine allgemeine Nachrichten-Abfrage (inkl. gezielter Pressehäuser-Abfrage von BBC, Reuters, CNN, Al Jazeera etc.) und eine gezielte Krisen-Abfrage mit Gewalt-Keywords (killed, attack, airstrike, bombing, missile, etc.).</p>
        </InfoBlock>

        <InfoBlock title="Scoring-Modell (Bedrohungsbewertung)" icon={<Activity size={12} />}>
          <p>Jede Meldung erhält einen numerischen Score basierend auf folgenden Faktoren:</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {[
              { label: 'Kritische Meldung (aus Krisen-Abfrage)', score: '+3.0' },
              { label: 'Thema: Sicherheit', score: '+2.0' },
              { label: 'Thema: Militär', score: '+1.5' },
              { label: 'Gewalt-Keywords im Titel', score: '+1.0' },
              { label: 'Thema: Humanitär', score: '+0.5' },
              { label: 'Andere Themen (Politik, Wirtschaft, Diplomatie)', score: '+0.3' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-main">
                <span className="text-[10px] text-muted">{s.label}</span>
                <span className="text-[10px] font-bold font-mono text-accent-400">{s.score}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-muted/60">Die Einzel-Scores werden zu einem Gesamt-Score summiert. Die Schwellenwerte für die Bedrohungsstufen sind:</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {[
              { level: 'KRITISCH', threshold: '≥ 30', color: '#ef4444' },
              { level: 'HOCH', threshold: '≥ 18', color: '#f97316' },
              { level: 'ERHÖHT', threshold: '≥ 10', color: '#eab308' },
              { level: 'BEWACHT', threshold: '≥ 4', color: '#3b82f6' },
              { level: 'NIEDRIG', threshold: '< 4', color: '#22c55e' },
            ].map(t => (
              <div key={t.level} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: `${t.color}10`, border: `1px solid ${t.color}20` }}>
                <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                <span className="text-[10px] font-bold" style={{ color: t.color }}>{t.level}</span>
                <span className="text-[9px] font-mono text-muted">{t.threshold}</span>
              </div>
            ))}
          </div>
        </InfoBlock>

        <InfoBlock title="Begründungs-Generierung" icon={<FileText size={12} />}>
          <p>Begründungen werden <strong>regelbasiert und deterministisch</strong> aus den Daten generiert — <strong>keine KI/LLM beteiligt</strong>. Das System analysiert:</p>
          <ul className="mt-1.5 space-y-1 pl-4">
            <li className="text-muted/80">Meldungsvolumen und -dichte im Berichtszeitraum</li>
            <li className="text-muted/80">Anteil kritischer Ereignisse (aus separater Krisen-Abfrage)</li>
            <li className="text-muted/80">Themenverteilung (Sicherheit, Militär, Politik, Humanitär, etc.)</li>
            <li className="text-muted/80">Spezifische Keywords (Gewalt, Terrorgruppen, Umsturzversuche, Wagner/Russland)</li>
            <li className="text-muted/80">Grenzüberschreitende Dynamiken (Meldungen mit Mehrländer-Bezug)</li>
            <li className="text-muted/80">Quellenvielfalt als Indikator für internationale Aufmerksamkeit</li>
          </ul>
        </InfoBlock>

        <InfoBlock title="Ableitungs-Generierung" icon={<Lightbulb size={12} />}>
          <p>Ableitungen werden ebenfalls <strong>regelbasiert</strong> aus der Datenlage generiert. Sie sollen fundiert, aber nicht alarmistisch sein. Das System prüft:</p>
          <ul className="mt-1.5 space-y-1 pl-4">
            <li className="text-muted/80">Verhältnis Sicherheits-/Militärmeldungen → staatliche vs. nichtstaatliche Akteure</li>
            <li className="text-muted/80">Gleichzeitigkeit von Sicherheits- und Humanitär-Meldungen → Spillover-Effekte</li>
            <li className="text-muted/80">Anteil politischer Meldungen → institutioneller Wandel</li>
            <li className="text-muted/80">Grenzüberschreitende Verweise → regionale Destabilisierung</li>
            <li className="text-muted/80">Nennung spezifischer Akteure (dschihadistische Gruppen, russische Militärpräsenz)</li>
          </ul>
        </InfoBlock>

        <InfoBlock title="Sektorale Analyse" icon={<Target size={12} />}>
          <p>Die Region wird in 6 geographische Sektoren unterteilt (Sahel, West, Ost, Zentral, Nord, Süd). Jeder Sektor erhält eine unabhängige Bewertung basierend auf den Meldungen, die Länder dieses Sektors betreffen. Die Sektorlogik ist identisch zur Länderbewertung.</p>
        </InfoBlock>

        <InfoBlock title="Länderspezifische Analyse" icon={<MapPin size={12} />}>
          <p>Jedes Land wird einzeln bewertet. Die Zuordnung erfolgt durch Keyword-Matching der Ländernamen in Artikeltiteln und URLs. Die Bewertung berücksichtigt Meldungsvolumen, kritische Events, Themenverteilung und Gewaltreferenzen — und generiert daraus eine landesspezifische Begründung und Ableitung.</p>
        </InfoBlock>

        <div className="px-3 py-2.5 rounded-xl text-[10px] text-muted/60 leading-relaxed" style={{
          background: 'color-mix(in srgb, var(--accent-500) 3%, transparent)',
          border: '1px solid color-mix(in srgb, var(--border) 30%, transparent)',
        }}>
          <span className="font-bold text-muted">Wichtiger Hinweis:</span> Diese automatisierte Lagebeurteilung ersetzt keine nachrichtendienstliche Bewertung. Die Themen- und Länderzuordnung basiert auf Keyword-Matching und kann ungenau sein. Die Begründungen und Ableitungen sind algorithmisch generiert — nicht von Analysten verfasst. Für operative Entscheidungen Originalquellen konsultieren.
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-accent-400">{icon}</span>
        <span className="text-[11px] font-bold text-main uppercase tracking-wider">{title}</span>
      </div>
      <div className="text-[11px] text-muted/80 leading-relaxed">{children}</div>
    </div>
  );
}
