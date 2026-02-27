import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Crosshair, AlertTriangle, Clock, RefreshCw, ChevronRight,
  Globe, Shield, Users, Zap, TrendingUp, Radio, Eye, Target, Filter,
  ExternalLink, MapPin, Search, X, Activity, Info, FileText, Lightbulb,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRegion } from '../context/RegionContext';
import { fetchNews, fetchCriticalEvents, type NewsArticle, type NewsTopic } from '../lib/newsApi';
import { assessCountry, THREAT_CONFIG } from '../lib/lageAnalysis';

// ── Severity classification for individual events ──
type Severity = 'FLASH' | 'IMMEDIATE' | 'PRIORITY' | 'ROUTINE';

const SEV_CONFIG: Record<Severity, { color: string; bg: string; border: string; label: string; labelDE: string; pulse: boolean }> = {
  FLASH:     { color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)', label: 'FLASH', labelDE: 'Sofortmeldung', pulse: true },
  IMMEDIATE: { color: '#f97316', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.25)', label: 'IMMEDIATE', labelDE: 'Dringend', pulse: true },
  PRIORITY:  { color: '#eab308', bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.25)',  label: 'PRIORITY', labelDE: 'Priorität', pulse: false },
  ROUTINE:   { color: '#6b7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.25)', label: 'ROUTINE', labelDE: 'Routine', pulse: false },
};

const TOPIC_META: Record<string, { de: string; color: string; icon: React.ReactNode }> = {
  security:     { de: 'Sicherheit', color: '#ef4444', icon: <Shield size={10} /> },
  military:     { de: 'Militär', color: '#f97316', icon: <Crosshair size={10} /> },
  politics:     { de: 'Politik', color: '#a855f7', icon: <Target size={10} /> },
  humanitarian: { de: 'Humanitär', color: '#0ea5e9', icon: <Users size={10} /> },
  economy:      { de: 'Wirtschaft', color: '#10b981', icon: <TrendingUp size={10} /> },
  diplomacy:    { de: 'Diplomatie', color: '#3b82f6', icon: <Globe size={10} /> },
};

function classifyEvent(article: NewsArticle): Severity {
  const isCrit = article.id.startsWith('crit_');
  const hasSecurity = article.topics.includes('security');
  const hasMilitary = article.topics.includes('military');
  const title = article.title.toLowerCase();
  const hasKillWords = /killed|massacre|bombing|explosion|attack|dead|casualt|assassination|ambush/i.test(title);
  if (isCrit && hasKillWords) return 'FLASH';
  if (isCrit || (hasSecurity && hasKillWords)) return 'IMMEDIATE';
  if (hasSecurity || hasMilitary) return 'PRIORITY';
  return 'ROUTINE';
}

// Generate a brief tactical assessment for individual events
function generateEventAssessment(article: NewsArticle & { severity: Severity }, region: any): string {
  const parts: string[] = [];
  const sev = article.severity;
  const title = article.title.toLowerCase();

  // Severity-based opener
  if (sev === 'FLASH') {
    parts.push('Kritisches Einzelereignis mit explizitem Gewaltbezug.');
  } else if (sev === 'IMMEDIATE') {
    parts.push('Dringende Meldung aus dem Krisen-Monitoring.');
  } else if (sev === 'PRIORITY') {
    parts.push('Sicherheits- oder militärrelevante Meldung.');
  } else {
    parts.push('Routinemeldung ohne unmittelbare Eskalationsindikatoren.');
  }

  // Topic-specific assessment
  if (article.topics.includes('security') && article.topics.includes('military')) {
    parts.push('Überlappung von Sicherheits- und Militärthematik deutet auf aktive Kampfhandlungen oder Militäroperationen hin.');
  } else if (article.topics.includes('security')) {
    parts.push('Sicherheitsbezug — kann Terrorismus, Kriminalität oder innerstaatliche Gewalt betreffen.');
  } else if (article.topics.includes('military')) {
    parts.push('Militärbezug — betrifft staatliche Streitkräfte, Rüstung oder Truppenverlegungen.');
  }

  if (article.topics.includes('humanitarian')) {
    parts.push('Humanitäre Dimension — mögliche Auswirkungen auf die Zivilbevölkerung.');
  }

  // Multi-country
  if (article.countries.length > 1) {
    const names = article.countries.map(id => (region.countriesById[id] as any)?.name).filter(Boolean);
    parts.push(`Grenzüberschreitender Bezug (${names.join(', ')}) — regionale Dynamik beachten.`);
  }

  // Keyword-specific
  if (/terrorist|isis|al.?qaeda|boko.?haram|al.?shabaab|jnim|iswap/i.test(title)) {
    parts.push('Bezug zu terroristischer Organisation — nichtstaatliche Bedrohung.');
  }
  if (/coup|putsch/i.test(title)) {
    parts.push('Hinweis auf Umsturzversuch — politische Instabilität.');
  }
  if (/wagner|russia|russian|africa corps/i.test(title)) {
    parts.push('Bezug zu russischer Militärpräsenz — geopolitische Dimension.');
  }

  return parts.join(' ');
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'JETZT';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function formatTime(dateStr: string): string {
  try { return new Date(dateStr).toISOString().replace('T', ' ').slice(0, 16) + 'Z'; }
  catch { return '—'; }
}

function formatDateGroup(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const date = new Date(d); date.setHours(0, 0, 0, 0);
  if (date >= now) return 'HEUTE — ' + d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).toUpperCase();
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  if (date >= yest) return 'GESTERN — ' + d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).toUpperCase();
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).toUpperCase();
}

// ══════════════════════════════════════════════
// TAKTISCHE LAGE — Granular Event Timeline
// ══════════════════════════════════════════════

export default function TaktischeLage() {
  const region = useRegion();
  const { setActiveTab } = useStore();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [criticalArticles, setCriticalArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [sevFilter, setSevFilter] = useState<Severity | null>(null);
  const [topicFilter, setTopicFilter] = useState<NewsTopic | null>(null);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const regionCountries = useMemo(() =>
    Object.values(region.countriesById).sort((a: any, b: any) => a.name.localeCompare(b.name)) as any[],
    [region]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [news, critical] = await Promise.all([
        fetchNews([], [], '7d', 75),
        fetchCriticalEvents(regionCountries.map((c: any) => c.id), '7d'),
      ]);
      setArticles(news);
      setCriticalArticles(critical);
      setLastUpdate(new Date());
    } catch { /* silently handle */ }
    finally { setLoading(false); }
  }, [regionCountries]);

  useEffect(() => { loadData(); }, [loadData]);

  const allEvents = useMemo(() => {
    const combined = [...criticalArticles, ...articles];
    const seen = new Set<string>();
    return combined.filter(a => { if (seen.has(a.url)) return false; seen.add(a.url); return true; })
      .map(a => ({ ...a, severity: classifyEvent(a) }))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [articles, criticalArticles]);

  const filteredEvents = useMemo(() => {
    let result = allEvents;
    if (sevFilter) result = result.filter(e => e.severity === sevFilter);
    if (topicFilter) result = result.filter(e => e.topics.includes(topicFilter));
    if (countryFilter) result = result.filter(e => e.countries.includes(countryFilter));
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(q) || e.source.toLowerCase().includes(q));
    }
    return result;
  }, [allEvents, sevFilter, topicFilter, countryFilter, searchText]);

  const groupedEvents = useMemo(() => {
    const groups: { key: string; label: string; events: typeof filteredEvents }[] = [];
    const seen = new Map<string, typeof filteredEvents>();
    for (const e of filteredEvents) {
      const d = new Date(e.publishedAt); d.setHours(0, 0, 0, 0);
      const key = d.toISOString();
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key)!.push(e);
    }
    for (const [key, events] of seen) groups.push({ key, label: formatDateGroup(events[0].publishedAt), events });
    return groups;
  }, [filteredEvents]);

  const sevCounts = useMemo(() => {
    const counts: Record<Severity, number> = { FLASH: 0, IMMEDIATE: 0, PRIORITY: 0, ROUTINE: 0 };
    for (const e of allEvents) counts[e.severity]++;
    return counts;
  }, [allEvents]);

  const activeCountries = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of filteredEvents) { for (const c of e.countries) counts[c] = (counts[c] ?? 0) + 1; }
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 10)
      .map(([id, count]) => ({ id, count, country: region.countriesById[id] })).filter(d => d.country);
  }, [filteredEvents, region]);

  // Country assessment for sidebar
  const countryAssessment = useMemo(() => {
    if (!countryFilter) return null;
    const name = (region.countriesById[countryFilter] as any)?.name ?? countryFilter;
    return assessCountry([...criticalArticles, ...articles], countryFilter, name);
  }, [countryFilter, criticalArticles, articles, region]);

  const clearFilters = () => { setSevFilter(null); setTopicFilter(null); setCountryFilter(null); setSearchText(''); };
  const hasFilters = sevFilter || topicFilter || countryFilter || searchText.trim();

  return (
    <div className="flex-1 flex bg-main overflow-hidden" style={{ fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace' }}>

      {/* ═══ LEFT: EVENT TIMELINE ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Classification banner */}
        <div className="shrink-0" style={{
          background: 'linear-gradient(90deg, rgba(249,115,22,0.08), transparent, rgba(249,115,22,0.08))',
          borderBottom: '1px solid rgba(249,115,22,0.12)',
        }}>
          <div className="flex items-center justify-center px-6 py-0.5">
            <span className="text-[8px] font-bold tracking-[0.3em] text-orange-400/50">TAKTISCHE LAGE — EINSATZRELEVANT</span>
          </div>
        </div>

        {/* Header */}
        <div className="shrink-0 bg-surface border-b border-theme px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: 'rgba(249,115,22,0.12)', border: '2px solid rgba(249,115,22,0.25)',
            }}>
              <Crosshair size={19} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-[16px] font-black tracking-tight text-main uppercase">Taktische Lage</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-muted tracking-wider">{region.name.toUpperCase()}</span>
                <span className="text-[9px] text-muted">|</span>
                <span className="text-[9px] text-muted flex items-center gap-1">
                  <Clock size={8} /> {lastUpdate ? lastUpdate.toISOString().replace('T', ' ').slice(0, 19) + 'Z' : '—'}
                </span>
                <span className="text-[9px] text-muted">|</span>
                <span className="text-[9px] font-bold" style={{ color: 'var(--accent-400)' }}>{filteredEvents.length} Ereignisse</span>
              </div>
            </div>
            <div className="flex-1" />

            {/* Severity pills */}
            <div className="flex items-center gap-1">
              {(['FLASH', 'IMMEDIATE', 'PRIORITY', 'ROUTINE'] as Severity[]).map(sev => {
                const cfg = SEV_CONFIG[sev];
                const count = sevCounts[sev];
                const active = sevFilter === sev;
                return (
                  <button key={sev} onClick={() => setSevFilter(active ? null : sev)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                    style={active ? { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }
                      : { background: 'var(--card)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                    {cfg.pulse && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.color }} />}
                    {sev}
                    <span className="font-mono" style={{ color: active ? cfg.color : 'var(--muted)' }}>{count}</span>
                  </button>
                );
              })}
            </div>

            <button onClick={() => setShowInfo(!showInfo)}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${showInfo ? 'bg-accent-500/15 border-accent-500/30 text-accent-400' : 'bg-card border-theme text-muted hover:text-main'}`}
              title="Wie wird die Taktische Lage gebildet?">
              <Info size={14} />
            </button>

            <button onClick={() => setShowFilters(f => !f)}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${showFilters ? 'bg-accent-500/15 border-accent-500/30 text-accent-400' : 'bg-card border-theme text-muted'}`}>
              <Filter size={13} />
            </button>

            <button onClick={loadData} disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              style={{ background: 'var(--accent-500)', color: '#fff' }}>
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Laden
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 p-3 rounded-xl bg-card border border-theme anim-fade-up">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-muted uppercase tracking-wider mr-1">Thema:</span>
                  {Object.entries(TOPIC_META).map(([id, meta]) => (
                    <button key={id} onClick={() => setTopicFilter(topicFilter === id as NewsTopic ? null : id as NewsTopic)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold transition-all"
                      style={topicFilter === id ? { background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }
                        : { color: 'var(--muted)', border: '1px solid transparent' }}>
                      {meta.icon} {meta.de}
                    </button>
                  ))}
                </div>
                {countryFilter && (
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Land:</span>
                    <span className="text-[10px] font-bold text-accent-400 flex items-center gap-1">
                      {(region.countriesById[countryFilter] as any)?.flagEmoji} {(region.countriesById[countryFilter] as any)?.name}
                      <button onClick={() => setCountryFilter(null)} className="text-muted hover:text-main"><X size={10} /></button>
                    </span>
                  </div>
                )}
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)}
                    placeholder="Ereignisse durchsuchen..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-main border border-theme text-[10px] text-main outline-none focus:border-accent-500/30 placeholder:text-muted/50" />
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-[9px] font-bold text-red-400 hover:text-red-300 transition-colors">
                    <X size={10} /> Filter zurücksetzen
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Timeline Feed ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">

          {/* Info panel */}
          {showInfo && <TaktInfoPanel onClose={() => setShowInfo(false)} />}

          {loading && allEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="relative">
                <Crosshair size={32} className="text-orange-400 animate-pulse" />
                <div className="absolute inset-0 animate-ping opacity-20"><Crosshair size={32} className="text-orange-400" /></div>
              </div>
              <p className="text-[11px] font-bold text-main uppercase tracking-wider">Taktische Daten werden erfasst...</p>
              <div className="w-48 h-1.5 rounded-full bg-card overflow-hidden">
                <div className="h-full rounded-full animate-loading-bar" style={{ background: 'linear-gradient(90deg, #f97316, #fb923c)', width: '40%' }} />
              </div>
            </div>
          )}

          {groupedEvents.map(group => (
            <div key={group.key}>
              <div className="sticky top-0 z-10 px-5 py-2 flex items-center gap-2" style={{
                background: 'color-mix(in srgb, var(--main) 92%, transparent)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid color-mix(in srgb, var(--border) 40%, transparent)',
              }}>
                <div className="w-2 h-2 rounded-sm bg-orange-400" />
                <span className="text-[10px] font-black text-main tracking-[0.12em]">{group.label}</span>
                <span className="text-[10px] font-mono text-muted">{group.events.length} Ereignisse</span>
                <div className="flex-1 h-px" style={{ background: 'color-mix(in srgb, var(--border) 30%, transparent)' }} />
              </div>

              {group.events.map((event, i) => {
                const sev = SEV_CONFIG[event.severity];
                const isSelected = selectedEvent === event.id;
                const assessment = isSelected ? generateEventAssessment(event, region) : '';

                return (
                  <div key={event.id}
                    onClick={() => setSelectedEvent(isSelected ? null : event.id)}
                    className="group px-5 py-3 border-b cursor-pointer transition-all hover:bg-hover/20 anim-fade-up"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--border) 20%, transparent)',
                      animationDelay: `${Math.min(i, 8) * 30}ms`,
                      background: isSelected ? sev.bg : undefined,
                      boxShadow: isSelected ? `inset 3px 0 0 ${sev.color}` : undefined,
                    }}>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[8px] font-black"
                            style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                            {event.severity === 'FLASH' ? '!!' : event.severity === 'IMMEDIATE' ? '!' : event.severity === 'PRIORITY' ? 'P' : 'R'}
                          </div>
                          {sev.pulse && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse" style={{ background: sev.color, boxShadow: `0 0 6px ${sev.color}` }} />}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded tracking-wider" style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                            {sev.label}
                          </span>
                          <span className="text-[9px] font-mono text-muted">{formatTime(event.publishedAt)}</span>
                          <span className="text-[9px] font-bold text-muted">{event.source}</span>
                          <div className="flex-1" />
                          <span className="text-[9px] font-mono text-muted/50">{timeAgo(event.publishedAt)}</span>
                        </div>

                        <a href={event.url} target="_blank" rel="noopener noreferrer"
                          className="text-[12px] font-bold text-main leading-snug hover:text-accent-400 transition-colors block"
                          style={{ display: '-webkit-box', WebkitLineClamp: isSelected ? 5 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                          onClick={e => e.stopPropagation()}>
                          {event.title}
                        </a>

                        {/* Assessment — shown when expanded */}
                        {isSelected && assessment && (
                          <div className="mt-2.5 p-2.5 rounded-lg anim-fade-up" style={{
                            background: `color-mix(in srgb, ${sev.color} 5%, var(--card))`,
                            border: `1px solid ${sev.border}`,
                          }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Lightbulb size={10} style={{ color: sev.color }} />
                              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: sev.color }}>Taktische Bewertung</span>
                            </div>
                            <p className="text-[10px] text-main/70 leading-relaxed">{assessment}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {event.topics.map(t => {
                            const m = TOPIC_META[t];
                            return m ? (
                              <button key={t} onClick={e => { e.stopPropagation(); setTopicFilter(topicFilter === t ? null : t); }}
                                className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider transition-all hover:scale-105"
                                style={{ background: `${m.color}12`, color: m.color, border: `1px solid ${m.color}20` }}>
                                {m.icon} {m.de}
                              </button>
                            ) : null;
                          })}
                          {event.countries.map(cId => {
                            const c = region.countriesById[cId] as any;
                            return c ? (
                              <button key={cId} onClick={e => { e.stopPropagation(); setCountryFilter(cId); }}
                                className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium transition-all hover:scale-105"
                                style={{ background: 'var(--card)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                                <span className="text-[10px]">{c.flagEmoji}</span> {c.name}
                              </button>
                            ) : null;
                          })}
                          <a href={event.url} target="_blank" rel="noopener noreferrer"
                            className="ml-auto text-muted/30 hover:text-accent-400 transition-colors" onClick={e => e.stopPropagation()}>
                            <ExternalLink size={10} />
                          </a>
                        </div>

                        {event.countries.length > 1 && (
                          <div className="mt-1 flex items-center gap-1 text-[8px] text-muted/40">
                            <Globe size={8} />
                            QUERVERWEIS: {event.countries.map(id => (region.countriesById[id] as any)?.name).filter(Boolean).join(' ↔ ')}
                          </div>
                        )}
                      </div>

                      {event.imageUrl && (
                        <div className="w-20 h-[56px] rounded-lg overflow-hidden shrink-0 self-start border" style={{ borderColor: sev.border }}>
                          <img src={event.imageUrl} alt="" className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {!loading && filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Eye size={28} className="text-muted/30" />
              <p className="text-[12px] font-bold text-muted uppercase tracking-wider">Keine Ereignisse gefunden</p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-[10px] font-bold text-accent-400 hover:text-accent-300 transition-colors">Filter zurücksetzen</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT SIDEBAR ═══ */}
      <div className="hidden lg:flex w-[280px] flex-col bg-surface border-l border-theme overflow-y-auto scrollbar-thin">

        {/* Country Assessment — shown when country filter active */}
        {countryAssessment && (
          <div className="p-4 border-b border-theme">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={12} className="text-orange-400" />
              <span className="text-[10px] font-black text-main uppercase tracking-[0.12em]">LÄNDERBEWERTUNG</span>
            </div>
            <div className="p-3 rounded-lg" style={{
              background: THREAT_CONFIG[countryAssessment.threat.level].bg,
              border: `1px solid ${THREAT_CONFIG[countryAssessment.threat.level].border}`,
            }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{(region.countriesById[countryFilter!] as any)?.flagEmoji}</span>
                <span className="text-[12px] font-bold text-main">{(region.countriesById[countryFilter!] as any)?.name}</span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded ml-auto" style={{
                  background: THREAT_CONFIG[countryAssessment.threat.level].bg,
                  color: THREAT_CONFIG[countryAssessment.threat.level].color,
                }}>{THREAT_CONFIG[countryAssessment.threat.level].labelDE}</span>
              </div>
              <div className="mb-2">
                <div className="flex items-center gap-1 mb-1">
                  <FileText size={9} style={{ color: THREAT_CONFIG[countryAssessment.threat.level].color }} />
                  <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: THREAT_CONFIG[countryAssessment.threat.level].color }}>Begründung</span>
                </div>
                <p className="text-[10px] text-main/70 leading-relaxed">{countryAssessment.countryReasoning}</p>
              </div>
              <div className="pt-2" style={{ borderTop: `1px solid ${THREAT_CONFIG[countryAssessment.threat.level].border}` }}>
                <div className="flex items-center gap-1 mb-1">
                  <Lightbulb size={9} style={{ color: THREAT_CONFIG[countryAssessment.threat.level].color }} />
                  <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: THREAT_CONFIG[countryAssessment.threat.level].color }}>Ableitung</span>
                </div>
                <p className="text-[10px] text-main/50 leading-relaxed">{countryAssessment.countryDerivation}</p>
              </div>

              {/* Zugehörige Meldungen */}
              {countryAssessment.articles.length > 0 && (
                <div className="pt-2 mt-2" style={{ borderTop: `1px solid ${THREAT_CONFIG[countryAssessment.threat.level].border}` }}>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Radio size={9} style={{ color: THREAT_CONFIG[countryAssessment.threat.level].color }} />
                    <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: THREAT_CONFIG[countryAssessment.threat.level].color }}>
                      Meldungen ({countryAssessment.articles.length})
                    </span>
                  </div>
                  <div className="space-y-1 max-h-[250px] overflow-y-auto scrollbar-thin">
                    {countryAssessment.articles.slice(0, 20).map(a => (
                      <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-main/50 hover:bg-main/80 transition-colors block">
                        <span className="text-[8px] font-mono text-muted shrink-0 mt-0.5 w-5">{timeAgo(a.publishedAt)}</span>
                        {a.id.startsWith('crit_') && <AlertTriangle size={8} className="text-red-400 shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] text-main leading-snug block" style={{
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>{a.title}</span>
                          <span className="text-[8px] text-muted">{a.source}</span>
                        </div>
                        <ExternalLink size={8} className="text-muted/20 shrink-0 mt-0.5" />
                      </a>
                    ))}
                    {countryAssessment.articles.length > 20 && (
                      <p className="text-[8px] text-muted/30 text-center py-0.5">+ {countryAssessment.articles.length - 20} weitere</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Severity Breakdown */}
        <div className="p-4 border-b border-theme">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={12} className="text-orange-400" />
            <span className="text-[10px] font-black text-main uppercase tracking-[0.12em]">MELDUNGSLAGE</span>
          </div>
          <div className="space-y-2">
            {(['FLASH', 'IMMEDIATE', 'PRIORITY', 'ROUTINE'] as Severity[]).map(sev => {
              const cfg = SEV_CONFIG[sev];
              const count = sevCounts[sev];
              const maxCount = Math.max(...Object.values(sevCounts), 1);
              return (
                <button key={sev} onClick={() => setSevFilter(sevFilter === sev ? null : sev)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all hover:bg-hover/30"
                  style={sevFilter === sev ? { background: cfg.bg, border: `1px solid ${cfg.border}` } : {}}>
                  <div className="flex items-center gap-1.5 w-24 shrink-0">
                    {cfg.pulse && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.color }} />}
                    <span className="text-[9px] font-black tracking-wider" style={{ color: cfg.color }}>{sev}</span>
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-main overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(count / maxCount) * 100}%`, background: cfg.color }} />
                  </div>
                  <span className="text-[11px] font-black w-6 text-right" style={{ color: cfg.color }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Countries */}
        <div className="p-4 border-b border-theme">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={12} className="text-orange-400" />
            <span className="text-[10px] font-black text-main uppercase tracking-[0.12em]">BETROFFENE LÄNDER</span>
          </div>
          <div className="space-y-1">
            {activeCountries.map((d, i) => (
              <button key={d.id} onClick={() => setCountryFilter(countryFilter === d.id ? null : d.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:bg-hover/30 text-left"
                style={countryFilter === d.id ? { background: 'color-mix(in srgb, var(--accent-500) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-500) 20%, transparent)' } : {}}>
                <span className="text-[9px] font-mono text-muted w-3">{i + 1}</span>
                <span className="text-sm leading-none">{(d.country as any)?.flagEmoji}</span>
                <span className="text-[11px] font-semibold text-main flex-1 truncate">{(d.country as any)?.name}</span>
                <span className="text-[10px] font-mono font-bold text-accent-400">{d.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="p-4 border-b border-theme">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={12} className="text-orange-400" />
            <span className="text-[10px] font-black text-main uppercase tracking-[0.12em]">THEMEN</span>
          </div>
          <div className="space-y-1.5">
            {Object.entries(TOPIC_META).map(([id, meta]) => {
              const count = filteredEvents.filter(e => e.topics.includes(id as NewsTopic)).length;
              const maxCount = Math.max(...Object.entries(TOPIC_META).map(([tid]) => filteredEvents.filter(e => e.topics.includes(tid as NewsTopic)).length), 1);
              return (
                <button key={id} onClick={() => setTopicFilter(topicFilter === id as NewsTopic ? null : id as NewsTopic)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:bg-hover/30"
                  style={topicFilter === id ? { background: `${meta.color}12`, border: `1px solid ${meta.color}20` } : {}}>
                  <span style={{ color: meta.color }}>{meta.icon}</span>
                  <span className="text-[10px] font-bold text-muted w-16 text-left">{meta.de}</span>
                  <div className="flex-1 h-1 rounded-full bg-main overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, background: meta.color }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold w-5 text-right" style={{ color: meta.color }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ChevronRight size={12} className="text-orange-400" />
            <span className="text-[10px] font-black text-main uppercase tracking-[0.12em]">NAVIGATION</span>
          </div>
          <div className="space-y-1.5">
            <button onClick={() => setActiveTab('op-lage')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-theme text-[10px] font-bold text-muted hover:text-main hover:bg-hover/30 transition-all">
              <Shield size={11} /> Zur Operativen Lage
            </button>
            <button onClick={() => setActiveTab('live-intel')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-theme text-[10px] font-bold text-muted hover:text-main hover:bg-hover/30 transition-all">
              <Radio size={11} /> Zum Live Intel Feed
            </button>
          </div>
        </div>

        <div className="mt-auto p-3" style={{ borderTop: '1px solid color-mix(in srgb, var(--border) 30%, transparent)' }}>
          <p className="text-[8px] text-muted/30 text-center tracking-wider uppercase">Taktische Lage — Automatisiert — GDELT</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// TAKTISCHE LAGE INFO PANEL
// ═══════════════════════════════════════════
function TaktInfoPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="mx-5 mt-4 rounded-2xl overflow-hidden anim-fade-up" style={{
      background: 'color-mix(in srgb, var(--accent-500) 3%, var(--card))',
      border: '1px solid color-mix(in srgb, var(--accent-500) 12%, transparent)',
    }}>
      <div className="px-5 py-3 flex items-center gap-2" style={{
        background: 'color-mix(in srgb, var(--accent-500) 6%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--accent-500) 10%, transparent)',
      }}>
        <Info size={14} className="text-accent-400" />
        <span className="text-[13px] font-black text-main tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Wie wird die Taktische Lage gebildet?
        </span>
        <div className="flex-1" />
        <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-muted hover:text-main bg-card border border-theme transition-colors">
          <X size={10} />
        </button>
      </div>

      <div className="p-5 space-y-4 text-[11px] leading-relaxed">

        <TaktInfoBlock title="Ereignis-Klassifizierung (Severity)" icon={<Zap size={12} />}>
          <p>Jedes einzelne Ereignis wird automatisch in eine von vier Dringlichkeitsstufen eingeordnet:</p>
          <div className="mt-2 space-y-1.5">
            {[
              { sev: 'FLASH', color: '#ef4444', rule: 'Meldung aus Krisen-Abfrage UND Gewalt-Keywords im Titel (killed, massacre, bombing, etc.)' },
              { sev: 'IMMEDIATE', color: '#f97316', rule: 'Meldung aus Krisen-Abfrage ODER (Sicherheitsthema + Gewalt-Keywords)' },
              { sev: 'PRIORITY', color: '#eab308', rule: 'Sicherheits- oder Militärthema (ohne explizite Gewalt-Keywords)' },
              { sev: 'ROUTINE', color: '#6b7280', rule: 'Alle anderen Meldungen (Politik, Wirtschaft, Diplomatie, Humanitär)' },
            ].map(s => (
              <div key={s.sev} className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-main">
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ background: `${s.color}15`, color: s.color }}>{s.sev}</span>
                <span className="text-[10px] text-muted/80">{s.rule}</span>
              </div>
            ))}
          </div>
        </TaktInfoBlock>

        <TaktInfoBlock title="Taktische Einzelbewertung" icon={<Lightbulb size={12} />}>
          <p>Bei Klick auf ein Ereignis wird eine <strong>taktische Bewertung</strong> angezeigt. Diese wird regelbasiert generiert und berücksichtigt:</p>
          <ul className="mt-1.5 space-y-1 pl-4">
            <li className="text-muted/80">Dringlichkeitsstufe des Ereignisses (Severity)</li>
            <li className="text-muted/80">Kombination der zugeordneten Themen</li>
            <li className="text-muted/80">Grenzüberschreitende Bezüge (Mehrländer-Meldungen)</li>
            <li className="text-muted/80">Spezifische Akteurs-Nennung (Terrorgruppen, Wagner/Russland)</li>
            <li className="text-muted/80">Art des Ereignisses (Umsturz, Anschlag, Militäroperation)</li>
          </ul>
        </TaktInfoBlock>

        <TaktInfoBlock title="Länderbewertung in der Sidebar" icon={<MapPin size={12} />}>
          <p>Wenn ein Land als Filter ausgewählt wird, erscheint in der Sidebar eine <strong>länderspezifische Bewertung</strong> mit Begründung und Ableitung. Diese nutzt das gleiche Scoring-Modell wie die Operative Lage, angewandt auf die gefilterten Meldungen dieses Landes.</p>
        </TaktInfoBlock>

        <TaktInfoBlock title="Keine KI beteiligt" icon={<Activity size={12} />}>
          <p>Alle Bewertungen, Begründungen und Ableitungen werden <strong>deterministisch und regelbasiert</strong> generiert. Es gibt keine KI/LLM-Komponente. Das System verwendet ausschließlich Keyword-Matching, Zählung, Verhältnisberechnung und vordefinierte Schwellenwerte.</p>
        </TaktInfoBlock>

        <div className="px-3 py-2.5 rounded-xl text-[10px] text-muted/60 leading-relaxed" style={{
          background: 'color-mix(in srgb, var(--accent-500) 3%, transparent)',
          border: '1px solid color-mix(in srgb, var(--border) 30%, transparent)',
        }}>
          <span className="font-bold text-muted">Hinweis:</span> Die Taktische Lage ergänzt die Operative Lage um die Einzelereignis-Ebene. Während die Operative Lage Sektoren und Länder aggregiert bewertet, zeigt die Taktische Lage jedes Ereignis einzeln mit individueller Dringlichkeitsstufe und Bewertung.
        </div>
      </div>
    </div>
  );
}

function TaktInfoBlock({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
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
