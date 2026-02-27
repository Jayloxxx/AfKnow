import { useState, useMemo } from 'react';
import { ArrowLeftRight, Search, AlertTriangle, Users, Calendar, Tag, BarChart3, Globe, Shield, Clock } from 'lucide-react';
import { useRegion } from '../../context/RegionContext';
import {
  getEntriesForRegion,
  KB_CATEGORY_CONFIG, KB_STATUS_CONFIG, KB_SEVERITY_CONFIG,
  type KBEntry,
} from '../../data/knowledgeBase';
import { useKnowledgeStore } from '../../store/useKnowledgeStore';

function EntrySelector({ entries, selectedId, onSelect, accentHex, label }: {
  entries: KBEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  accentHex: string;
  label: string;
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const selected = selectedId ? entries.find(e => e.id === selectedId) : null;

  const filtered = search
    ? entries.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
    : entries;

  return (
    <div className="relative">
      <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">{label}</div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-card border border-theme hover:border-theme transition-all text-left"
        style={selected ? { borderColor: `color-mix(in srgb, ${accentHex} 40%, transparent)` } : undefined}
      >
        {selected ? (
          <>
            <div className="w-3 h-3 rounded-full" style={{ background: KB_CATEGORY_CONFIG[selected.category].color }} />
            <span className="text-xs font-semibold text-main flex-1 truncate">{selected.title}</span>
          </>
        ) : (
          <span className="text-xs text-muted flex-1">Eintrag auswählen...</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface border border-theme rounded-xl shadow-xl max-h-72 overflow-hidden">
          <div className="p-2 border-b border-theme">
            <div className="relative">
              <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Suchen..."
                className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-card border border-theme text-[10px] text-main focus:outline-none"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-52">
            {filtered.map(e => (
              <button
                key={e.id}
                onClick={() => { onSelect(e.id); setOpen(false); setSearch(''); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-hover/50 transition-colors border-b border-theme/20"
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: KB_CATEGORY_CONFIG[e.category].color }} />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold text-main truncate">{e.title}</div>
                  <div className="text-[8px] text-muted">{KB_CATEGORY_CONFIG[e.category].label} · Schwere {e.severity}/5</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompareColumn({ entry, accentHex }: { entry: KBEntry; accentHex: string }) {
  const catCfg = KB_CATEGORY_CONFIG[entry.category];
  const statusCfg = KB_STATUS_CONFIG[entry.status];
  const sevCfg = KB_SEVERITY_CONFIG[entry.severity];

  return (
    <div className="flex-1 min-w-0 overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
            style={{ background: `color-mix(in srgb, ${catCfg.color} 15%, transparent)`, color: catCfg.color }}>
            {catCfg.label}
          </div>
          <div className="px-2 py-0.5 rounded-md text-[9px] font-semibold flex items-center gap-1"
            style={{ background: `color-mix(in srgb, ${statusCfg.color} 12%, transparent)`, color: statusCfg.color }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusCfg.color }} />
            {statusCfg.label}
          </div>
        </div>
        <h2 className="font-display font-bold text-base text-main leading-tight mb-1">{entry.title}</h2>
        <p className="text-[11px] text-muted leading-relaxed">{entry.subtitle}</p>
      </div>

      {/* Severity */}
      <div className="p-3 rounded-xl bg-card/50 border border-theme/50">
        <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-2">Schweregrad</div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-6 h-8 rounded" style={{
                background: i <= entry.severity ? sevCfg.color : 'var(--border)',
                opacity: i <= entry.severity ? 1 : 0.2,
              }} />
            ))}
          </div>
          <span className="text-sm font-mono font-bold" style={{ color: sevCfg.color }}>{entry.severity}/5</span>
          <span className="text-[10px] font-medium" style={{ color: sevCfg.color }}>{sevCfg.label}</span>
        </div>
      </div>

      {/* Metrics */}
      {(entry.casualties || entry.displaced) && (
        <div className="space-y-1.5">
          {entry.casualties && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/8 border border-red-500/15">
              <AlertTriangle size={12} className="text-red-400 shrink-0" />
              <div>
                <div className="text-[9px] text-red-400/70 font-medium">Opfer</div>
                <div className="text-xs font-bold text-red-400">{entry.casualties}</div>
              </div>
            </div>
          )}
          {entry.displaced && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-orange-500/8 border border-orange-500/15">
              <Users size={12} className="text-orange-400 shrink-0" />
              <div>
                <div className="text-[9px] text-orange-400/70 font-medium">Vertriebene</div>
                <div className="text-xs font-bold text-orange-400">{entry.displaced}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Time */}
      {entry.startYear && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card/50 border border-theme/50">
          <Calendar size={12} style={{ color: accentHex }} />
          <div>
            <div className="text-[9px] text-muted font-medium">Zeitraum</div>
            <div className="text-xs font-bold font-mono" style={{ color: accentHex }}>
              {entry.startYear}{entry.endYear ? `–${entry.endYear}` : '–heute'}
            </div>
          </div>
        </div>
      )}

      {/* Key Facts */}
      {entry.keyFacts.length > 0 && (
        <div>
          <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
            <BarChart3 size={10} /> Kerndaten
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {entry.keyFacts.map(f => (
              <div key={f.label} className="p-2 rounded-lg bg-hover/50 border border-theme/50">
                <div className="text-[8px] text-muted uppercase tracking-wider">{f.label}</div>
                <div className="text-[11px] font-bold font-mono" style={{ color: accentHex }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Countries */}
      <div>
        <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Globe size={10} /> Länder
        </div>
        <div className="flex flex-wrap gap-1">
          {entry.countryIds.map(c => (
            <span key={c} className="px-1.5 py-0.5 rounded bg-card border border-theme/50 text-[9px] font-mono text-muted">{c}</span>
          ))}
        </div>
      </div>

      {/* Parties */}
      {entry.parties && entry.parties.length > 0 && (
        <div>
          <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Shield size={10} /> Konfliktparteien
          </div>
          <div className="space-y-1">
            {entry.parties.map((p, i) => (
              <div key={p} className="flex items-center gap-2 p-1.5 rounded-lg bg-card/50 border border-theme/50 text-[10px] font-medium text-main">
                <div className="w-2 h-2 rounded-full" style={{ background: i < entry.parties!.length / 2 ? '#ef4444' : '#3b82f6' }} />
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      <div>
        <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Tag size={10} /> Tags
        </div>
        <div className="flex flex-wrap gap-1">
          {entry.tags.map(t => (
            <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-card border border-theme/50 text-muted">{t}</span>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-3 rounded-xl bg-card/50 border border-theme/50">
        <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1.5">Zusammenfassung</div>
        <p className="text-[11px] text-main leading-relaxed">{entry.summary}</p>
      </div>

      {/* Timeline events count */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-theme/50">
        <Clock size={11} style={{ color: accentHex }} />
        <span className="text-[10px] text-muted">{entry.timeline.length} Zeitleisten-Ereignisse</span>
        <span className="text-[10px] text-muted ml-auto">{entry.sources.length} Quellen</span>
        <span className="text-[10px] text-muted">{entry.crossLinks.length} Verknüpfungen</span>
      </div>
    </div>
  );
}

export default function CompareMode() {
  const region = useRegion();
  const store = useKnowledgeStore();
  const entries = useMemo(() => getEntriesForRegion(region.id), [region.id]);

  const [leftId, rightId] = store.compareIds;
  const leftEntry = leftId ? entries.find(e => e.id === leftId) ?? null : null;
  const rightEntry = rightId ? entries.find(e => e.id === rightId) ?? null : null;

  const setLeft = (id: string) => store.setCompareIds([id, store.compareIds[1]]);
  const setRight = (id: string) => store.setCompareIds([store.compareIds[0], id]);
  const swap = () => store.setCompareIds([store.compareIds[1], store.compareIds[0]]);

  // Compute comparison highlights
  const highlights = useMemo(() => {
    if (!leftEntry || !rightEntry) return null;
    const sharedTags = leftEntry.tags.filter(t => rightEntry.tags.includes(t));
    const sharedCountries = leftEntry.countryIds.filter(c => rightEntry.countryIds.includes(c));
    const sharedLinks = leftEntry.crossLinks.filter(l => rightEntry.crossLinks.some(r => r.targetId === l.targetId));
    return { sharedTags, sharedCountries, sharedLinks };
  }, [leftEntry, rightEntry]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-main">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3 border-b border-theme bg-surface">
        <ArrowLeftRight size={14} style={{ color: region.accentHex }} />
        <h2 className="font-display font-bold text-sm text-main">Vergleichsmodus</h2>

        <div className="flex-1" />

        {/* Selectors */}
        <div className="flex items-center gap-2">
          <div className="w-56">
            <EntrySelector entries={entries} selectedId={leftId} onSelect={setLeft} accentHex={region.accentHex} label="Eintrag A" />
          </div>
          <button onClick={swap} className="w-8 h-8 rounded-lg bg-card border border-theme flex items-center justify-center text-muted hover:text-main transition-colors mt-5">
            <ArrowLeftRight size={13} />
          </button>
          <div className="w-56">
            <EntrySelector entries={entries} selectedId={rightId} onSelect={setRight} accentHex={region.accentHex} label="Eintrag B" />
          </div>
        </div>
      </div>

      {/* Comparison */}
      {leftEntry && rightEntry ? (
        <div className="flex-1 flex overflow-hidden">
          <CompareColumn entry={leftEntry} accentHex={region.accentHex} />

          {/* Center divider with highlights */}
          <div className="w-52 shrink-0 border-x border-theme bg-surface overflow-y-auto p-3 space-y-3">
            <div className="text-[10px] font-bold text-muted uppercase tracking-wider text-center">Vergleich</div>

            {/* Severity comparison */}
            <div className="p-2.5 rounded-xl bg-card/50 border border-theme/50 text-center">
              <div className="text-[9px] text-muted mb-1">Schweregrad</div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-bold font-mono" style={{ color: KB_SEVERITY_CONFIG[leftEntry.severity].color }}>
                  {leftEntry.severity}
                </span>
                <span className="text-[10px] text-muted">vs</span>
                <span className="text-sm font-bold font-mono" style={{ color: KB_SEVERITY_CONFIG[rightEntry.severity].color }}>
                  {rightEntry.severity}
                </span>
              </div>
              <div className="flex gap-1 mt-2 justify-center">
                <div className="h-2 rounded-full" style={{
                  width: `${leftEntry.severity * 12}px`,
                  background: KB_SEVERITY_CONFIG[leftEntry.severity].color,
                }} />
                <div className="h-2 rounded-full" style={{
                  width: `${rightEntry.severity * 12}px`,
                  background: KB_SEVERITY_CONFIG[rightEntry.severity].color,
                }} />
              </div>
            </div>

            {/* Shared tags */}
            {highlights && highlights.sharedTags.length > 0 && (
              <div className="p-2.5 rounded-xl bg-card/50 border border-theme/50">
                <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1.5 text-center">Gemeinsame Tags</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {highlights.sharedTags.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-[8px] font-medium text-white" style={{ background: region.accentHex }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Shared countries */}
            {highlights && highlights.sharedCountries.length > 0 && (
              <div className="p-2.5 rounded-xl bg-card/50 border border-theme/50">
                <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1.5 text-center">Gemeinsame Länder</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {highlights.sharedCountries.map(c => (
                    <span key={c} className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold" style={{ color: region.accentHex, background: `color-mix(in srgb, ${region.accentHex} 12%, transparent)` }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Shared links */}
            {highlights && highlights.sharedLinks.length > 0 && (
              <div className="p-2.5 rounded-xl bg-card/50 border border-theme/50">
                <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1.5 text-center">Gemeinsame Verknüpfungen</div>
                <div className="space-y-1">
                  {highlights.sharedLinks.map(l => (
                    <div key={l.targetId} className="text-[9px] text-muted text-center">{l.label}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats comparison */}
            <div className="p-2.5 rounded-xl bg-card/50 border border-theme/50">
              <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1.5 text-center">Statistik</div>
              <div className="space-y-2 text-[9px]">
                {[
                  { label: 'Quellen', left: leftEntry.sources.length, right: rightEntry.sources.length },
                  { label: 'Timeline', left: leftEntry.timeline.length, right: rightEntry.timeline.length },
                  { label: 'Links', left: leftEntry.crossLinks.length, right: rightEntry.crossLinks.length },
                  { label: 'Länder', left: leftEntry.countryIds.length, right: rightEntry.countryIds.length },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="font-mono font-bold" style={{ color: row.left > row.right ? region.accentHex : 'var(--text-muted)' }}>{row.left}</span>
                    <span className="text-muted">{row.label}</span>
                    <span className="font-mono font-bold" style={{ color: row.right > row.left ? region.accentHex : 'var(--text-muted)' }}>{row.right}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <CompareColumn entry={rightEntry} accentHex={region.accentHex} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <ArrowLeftRight size={48} className="mx-auto mb-4 opacity-20 text-muted" />
            <h3 className="font-display font-bold text-base text-main mb-2">Einträge vergleichen</h3>
            <p className="text-xs text-muted leading-relaxed">
              Wähle zwei Einträge oben aus, um sie Seite an Seite zu vergleichen.
              Schweregrad, Kerndaten, Konfliktparteien und mehr werden direkt gegenübergestellt.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
