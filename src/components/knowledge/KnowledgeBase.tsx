import { useState, useMemo, useCallback, useRef, type JSX } from 'react';
import {
  Search, BookOpen, ChevronRight, ChevronDown, Clock, ExternalLink,
  Plus, Trash2, Edit3, Save, X, Tag, Link2, Image, ArrowUpDown,
  AlertTriangle, Users, MapPin, Calendar, FileText, Globe, Shield,
  TrendingUp, Crosshair, ChevronUp, BarChart3, Zap, Eye,
  Network, GitBranch, ArrowLeftRight, Map, StickyNote, MessageSquare
} from 'lucide-react';
import { useRegion } from '../../context/RegionContext';
import { useKnowledgeStore, type KBViewMode } from '../../store/useKnowledgeStore';
import {
  getEntriesForRegion, getEntryById,
  KB_CATEGORY_CONFIG, KB_STATUS_CONFIG, KB_SEVERITY_CONFIG,
  KNOWLEDGE_BASE_ENTRIES,
  type KBEntry, type KBCategory, type KBStatus, type KBSource,
} from '../../data/knowledgeBase';
import NetworkGraph from './NetworkGraph';
import GlobalTimeline from './GlobalTimeline';
import CompareMode from './CompareMode';
import ConflictHeatmap from './ConflictHeatmap';
import ScenarioPlanner from './ScenarioPlanner';

// ═══ Helpers ═══
function mergeEntry(base: KBEntry, overlay?: Partial<KBEntry>): KBEntry {
  if (!overlay) return base;
  return {
    ...base,
    ...overlay,
    sources: [...base.sources, ...(overlay.sources ?? [])],
    crossLinks: [...base.crossLinks, ...(overlay.crossLinks ?? [])],
    timeline: [...base.timeline, ...(overlay.timeline ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
    images: [...base.images, ...(overlay.images ?? [])],
  } as KBEntry;
}

// ═══ Category Icon mapper ═══
function CategoryIcon({ cat, size = 14 }: { cat: KBCategory; size?: number }) {
  switch (cat) {
    case 'conflict': return <Crosshair size={size} />;
    case 'actor': return <Users size={size} />;
    case 'region': return <MapPin size={size} />;
    case 'historical': return <Clock size={size} />;
    case 'organization': return <Globe size={size} />;
    case 'infrastructure': return <BarChart3 size={size} />;
    case 'humanitarian': return <Shield size={size} />;
    default: return <FileText size={size} />;
  }
}

// ═══ Status explanation data ═══
const STATUS_CRITERIA: Record<string, { title: string; meaning: string; criteria: string[] }> = {
  active: {
    title: 'Aktiv',
    meaning: 'Ein laufender Konflikt oder Prozess mit aktuellen Kampfhandlungen oder aktiver Gewaltdynamik.',
    criteria: [
      'Bewaffnete Auseinandersetzungen finden regelmäßig statt',
      'Aktive Operationen von Konfliktparteien dokumentiert',
      'Zivilbevölkerung ist unmittelbar betroffen',
      'Keine Waffenstillstandsvereinbarung in Kraft',
      'Laufende internationale Reaktionen (Sanktionen, Missionen)',
    ],
  },
  escalating: {
    title: 'Eskalierend',
    meaning: 'Die Situation verschlechtert sich aktiv — Gewalt, Instabilität oder humanitäre Not nehmen zu.',
    criteria: [
      'Deutliche Zunahme der Gewaltintensität in den letzten 6 Monaten',
      'Neue Akteure oder Fronten eröffnen sich',
      'Territoriale Ausbreitung des Konflikts',
      'Zusammenbruch von Friedensverhandlungen oder Waffenruhen',
      'Steigende Opferzahlen und Vertreibungen',
      'Drohende regionale Spillover-Effekte',
    ],
  },
  frozen: {
    title: 'Eingefroren',
    meaning: 'Ein Konflikt ohne aktive Kampfhandlungen, aber ohne politische Lösung — jederzeit reaktivierbar.',
    criteria: [
      'Waffenstillstand oder de facto Kampfpause in Kraft',
      'Keine wesentlichen Friedensverhandlungen aktiv',
      'Politischer Status quo ist ungeklärt (z.B. umstrittene Gebiete)',
      'Militärische Aufmärsche oder Provokationen möglich',
      'Grundursachen des Konflikts bestehen weiterhin',
    ],
  },
  resolved: {
    title: 'Gelöst',
    meaning: 'Der Konflikt gilt als beendet — durch Friedensabkommen, politische Lösung oder militärische Entscheidung.',
    criteria: [
      'Friedensabkommen unterzeichnet und weitgehend umgesetzt',
      'Keine systematische Gewalt mehr dokumentiert',
      'Politische Übergangsprozesse abgeschlossen oder im Gang',
      'Rückkehr von Vertriebenen eingeleitet',
      'Internationale Anerkennung der Lösung',
    ],
  },
  historical: {
    title: 'Historisch',
    meaning: 'Ein abgeschlossenes Ereignis oder ein Konflikt der Vergangenheit — relevant als Kontext und Ursache heutiger Lagen.',
    criteria: [
      'Konflikt oder Ereignis liegt mehrere Jahre/Jahrzehnte zurück',
      'Keine direkte Gewaltdynamik mehr vorhanden',
      'Historische Bedeutung für aktuelle Konflikte und Strukturen',
      'Dient als Referenzpunkt in der Analyse (z.B. Kolonialgeschichte, Arabischer Frühling)',
      'Nachwirkungen ggf. noch spürbar, aber nicht mehr als aktiver Konflikt',
    ],
  },
};

// ═══ Status badge with info popover ═══
function StatusBadge({ status }: { status: KBStatus }) {
  const cfg = KB_STATUS_CONFIG[status];
  const info = STATUS_CRITERIA[status];
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center gap-1">
      <div
        className="px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1"
        style={{
          background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
          color: cfg.color,
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.color }} />
        {cfg.label}
      </div>
      {/* Info button */}
      <button
        onClick={(e) => { e.stopPropagation(); setInfoOpen(!infoOpen); }}
        className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold transition-all hover:scale-110"
        style={{
          borderColor: `color-mix(in srgb, ${cfg.color} 40%, var(--border))`,
          color: cfg.color,
          background: infoOpen ? `color-mix(in srgb, ${cfg.color} 12%, transparent)` : 'transparent',
        }}
        title="Status-Einstufung erklären"
      >
        i
      </button>

      {infoOpen && info && (
        <>
          <div className="fixed inset-0 z-[998]" onClick={() => setInfoOpen(false)} />
          <div
            className="absolute left-0 top-full mt-2 z-[999] w-80 p-4 rounded-xl border shadow-xl anim-fade-up"
            style={{
              background: 'var(--surface)',
              borderColor: `color-mix(in srgb, ${cfg.color} 30%, var(--border))`,
              boxShadow: `0 8px 32px color-mix(in srgb, ${cfg.color} 8%, rgba(0,0,0,0.3))`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: cfg.color }} />
                <span className="text-xs font-bold" style={{ color: cfg.color }}>Status: {info.title}</span>
              </div>
              <button onClick={() => setInfoOpen(false)} className="text-muted hover:text-main">
                <X size={12} />
              </button>
            </div>

            {/* Meaning */}
            <p className="text-[11px] text-main leading-relaxed mb-3 p-2 rounded-lg" style={{ background: `color-mix(in srgb, ${cfg.color} 6%, transparent)` }}>
              {info.meaning}
            </p>

            {/* Criteria */}
            <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-2">
              Kriterien für diese Einstufung
            </div>
            <div className="space-y-1.5 mb-3">
              {info.criteria.map((c, i) => (
                <div key={i} className="flex gap-2 text-[10px] leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: cfg.color }} />
                  <span className="text-main">{c}</span>
                </div>
              ))}
            </div>

            {/* All statuses overview */}
            <div className="pt-2.5 border-t border-theme/50">
              <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-2">
                Alle Status-Stufen
              </div>
              <div className="space-y-1">
                {(['escalating', 'active', 'frozen', 'resolved', 'historical'] as KBStatus[]).map(s => {
                  const sCfg = KB_STATUS_CONFIG[s];
                  const active = s === status;
                  return (
                    <div
                      key={s}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all"
                      style={active ? {
                        background: `color-mix(in srgb, ${sCfg.color} 10%, transparent)`,
                        borderLeft: `3px solid ${sCfg.color}`,
                      } : { borderLeft: '3px solid transparent' }}
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sCfg.color, opacity: active ? 1 : 0.5 }} />
                      <span className={`text-[10px] font-medium flex-1 ${active ? 'font-bold' : ''}`} style={{ color: active ? sCfg.color : 'var(--text-muted)' }}>
                        {sCfg.label}
                      </span>
                      {active && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `color-mix(in srgb, ${sCfg.color} 15%, transparent)`, color: sCfg.color }}>
                          AKTUELL
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══ Severity explanation data ═══
const SEVERITY_CRITERIA: Record<number, { title: string; criteria: string[] }> = {
  1: {
    title: 'Stufe 1 — Gering',
    criteria: [
      'Sporadische, isolierte Gewalt oder politische Spannungen',
      'Keine systematische Bedrohung der Zivilbevölkerung',
      'Staatliche Strukturen weitgehend intakt',
      'Wenige oder keine Binnenvertriebene',
      'Diplomatische Lösungen greifbar',
    ],
  },
  2: {
    title: 'Stufe 2 — Moderat',
    criteria: [
      'Wiederkehrende Gewaltausbrüche in begrenzten Gebieten',
      'Lokale Vertreibungen (<50.000 Betroffene)',
      'Staatliche Kontrolle in Teilen eingeschränkt',
      'Humanitäre Lage angespannt, aber beherrschbar',
      'Internationale Aufmerksamkeit gering',
    ],
  },
  3: {
    title: 'Stufe 3 — Erheblich',
    criteria: [
      'Regelmäßige bewaffnete Auseinandersetzungen',
      'Signifikante Vertreibungen (>100.000 Betroffene)',
      'Staatliche Kontrolle in mehreren Regionen verloren',
      'Humanitäre Krise mit internationaler Hilfe',
      'Mehrere bewaffnete Akteure aktiv',
    ],
  },
  4: {
    title: 'Stufe 4 — Hoch',
    criteria: [
      'Großflächige, anhaltende Kampfhandlungen',
      'Massive Vertreibungen (>500.000 Betroffene)',
      'Staatlicher Zusammenbruch in weiten Teilen',
      'Schwere humanitäre Notlage, Hungersnot möglich',
      'Regionale Destabilisierung und Spillover-Effekte',
      'Internationale Militärinterventionen',
    ],
  },
  5: {
    title: 'Stufe 5 — Kritisch',
    criteria: [
      'Vollständiger oder nahezu vollständiger Staatszerfall',
      'Massenvertreibungen in Millionenhöhe',
      'Akute Hungersnot und Zusammenbruch der Versorgung',
      'Systematische Gewalt gegen die Zivilbevölkerung',
      'Kriegsverbrechen / Völkerrechtsverletzungen dokumentiert',
      'Geopolitische Großmachtinteressen verwickelt',
      'Keine Friedenslösung in Sicht',
    ],
  },
};

// ═══ Severity bar ═══
function SeverityBar({ severity, showInfo: _showInfo = false }: { severity: number; showInfo?: boolean }) {
  const cfg = KB_SEVERITY_CONFIG[severity];
  const [infoOpen, setInfoOpen] = useState(false);
  const criteria = SEVERITY_CRITERIA[severity];

  return (
    <div className="flex items-center gap-1.5 relative">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-2 h-5 rounded-sm transition-all"
            style={{
              background: i <= severity ? cfg.color : 'var(--border)',
              opacity: i <= severity ? 1 : 0.3,
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-mono font-medium" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
      {/* Info button */}
      <button
        onClick={(e) => { e.stopPropagation(); setInfoOpen(!infoOpen); }}
        className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold transition-all hover:scale-110"
        style={{
          borderColor: `color-mix(in srgb, ${cfg.color} 40%, var(--border))`,
          color: cfg.color,
          background: infoOpen ? `color-mix(in srgb, ${cfg.color} 12%, transparent)` : 'transparent',
        }}
        title="Einstufungskriterien anzeigen"
      >
        i
      </button>

      {/* Info popover */}
      {infoOpen && criteria && (
        <>
          <div className="fixed inset-0 z-[998]" onClick={() => setInfoOpen(false)} />
          <div
            className="absolute left-0 top-full mt-2 z-[999] w-80 p-4 rounded-xl border shadow-xl anim-fade-up"
            style={{
              background: 'var(--surface)',
              borderColor: `color-mix(in srgb, ${cfg.color} 30%, var(--border))`,
              boxShadow: `0 8px 32px color-mix(in srgb, ${cfg.color} 8%, rgba(0,0,0,0.3))`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-2.5 h-6 rounded-sm"
                      style={{
                        background: i <= severity ? cfg.color : 'var(--border)',
                        opacity: i <= severity ? 1 : 0.2,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold" style={{ color: cfg.color }}>{criteria.title}</span>
              </div>
              <button onClick={() => setInfoOpen(false)} className="text-muted hover:text-main">
                <X size={12} />
              </button>
            </div>

            {/* Criteria */}
            <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-2">
              Einstufungskriterien
            </div>
            <div className="space-y-1.5 mb-3">
              {criteria.criteria.map((c, i) => (
                <div key={i} className="flex gap-2 text-[10px] leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: cfg.color }} />
                  <span className="text-main">{c}</span>
                </div>
              ))}
            </div>

            {/* Scale overview */}
            <div className="pt-2.5 border-t border-theme/50">
              <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-2">
                Gesamtskala
              </div>
              <div className="space-y-1">
                {([1, 2, 3, 4, 5] as const).map(s => {
                  const sCfg = KB_SEVERITY_CONFIG[s];
                  const active = s === severity;
                  return (
                    <div
                      key={s}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all"
                      style={active ? {
                        background: `color-mix(in srgb, ${sCfg.color} 10%, transparent)`,
                        borderLeft: `3px solid ${sCfg.color}`,
                      } : { borderLeft: '3px solid transparent' }}
                    >
                      <div className="flex gap-px">
                        {[1, 2, 3, 4, 5].map(j => (
                          <div key={j} className="w-1.5 h-3 rounded-sm" style={{
                            background: j <= s ? sCfg.color : 'var(--border)',
                            opacity: j <= s ? (active ? 1 : 0.5) : 0.15,
                          }} />
                        ))}
                      </div>
                      <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`} style={{ color: active ? sCfg.color : 'var(--text-muted)' }}>
                        {s}/5 — {sCfg.label}
                      </span>
                      {active && (
                        <span className="text-[8px] font-bold ml-auto px-1.5 py-0.5 rounded" style={{ background: `color-mix(in srgb, ${sCfg.color} 15%, transparent)`, color: sCfg.color }}>
                          AKTUELL
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══ Timeline component ═══
function Timeline({ events, accentHex }: { events: KBEntry['timeline']; accentHex: string }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? events : events.slice(0, 6);

  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: `color-mix(in srgb, ${accentHex} 30%, transparent)` }} />
      <div className="space-y-3">
        {shown.map((ev, i) => (
          <div key={ev.date + i} className="flex gap-3 relative anim-fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
            <div
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10"
              style={{
                borderColor: accentHex,
                background: 'var(--card)',
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: accentHex }} />
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-mono font-bold" style={{ color: accentHex }}>
                  {ev.date}
                </span>
                <span className="text-xs font-semibold text-main">{ev.title}</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed mt-0.5">{ev.description}</p>
            </div>
          </div>
        ))}
      </div>
      {events.length > 6 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 ml-8 text-[10px] font-medium flex items-center gap-1 transition-colors"
          style={{ color: accentHex }}
        >
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {expanded ? 'Weniger anzeigen' : `+${events.length - 6} weitere Ereignisse`}
        </button>
      )}
    </div>
  );
}

// ═══ Cross-links ═══
function CrossLinks({ links, onNavigate, accentHex: _accentHex }: {
  links: KBEntry['crossLinks'];
  onNavigate: (id: string) => void;
  accentHex: string;
}) {
  const relationColors: Record<string, string> = {
    related: '#6b7280', cause: '#f59e0b', effect: '#3b82f6', 'actor-in': '#8b5cf6',
    'part-of': '#06b6d4', successor: '#22c55e', predecessor: '#f97316', opposed: '#ef4444', allied: '#10b981',
  };
  const relationLabels: Record<string, string> = {
    related: 'Verwandt', cause: 'Ursache', effect: 'Folge', 'actor-in': 'Akteur in',
    'part-of': 'Teil von', successor: 'Nachfolger', predecessor: 'Vorgänger', opposed: 'Gegner', allied: 'Verbündet',
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {links.map((link) => {
        const target = getEntryById(link.targetId);
        const color = relationColors[link.relationship] ?? '#6b7280';
        return (
          <button
            key={link.targetId}
            onClick={() => target && onNavigate(link.targetId)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-all hover:scale-[1.02]"
            style={{
              background: `color-mix(in srgb, ${color} 10%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
              color: color,
            }}
            title={`${relationLabels[link.relationship]}: ${link.label}`}
          >
            <Link2 size={9} />
            <span className="opacity-60">{relationLabels[link.relationship]}</span>
            <span>{link.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══ Sources list ═══
function SourcesList({ sources, accentHex, editMode, onRemove }: {
  sources: KBSource[];
  accentHex: string;
  editMode: boolean;
  onRemove?: (id: string) => void;
}) {
  const typeIcons: Record<string, string> = {
    academic: '🎓', news: '📰', 'think-tank': '🧠', government: '🏛', ngo: '🤝', un: '🇺🇳', database: '💾', primary: '📋',
  };
  const reliabilityColors: Record<string, string> = { high: '#22c55e', medium: '#f59e0b', low: '#ef4444' };

  return (
    <div className="space-y-1.5">
      {sources.map((src) => (
        <div
          key={src.id}
          className="flex items-start gap-2 p-2 rounded-lg bg-hover/50 border border-theme/50 group"
        >
          <span className="text-sm mt-0.5">{typeIcons[src.type] ?? '📄'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium hover:underline truncate"
                style={{ color: accentHex }}
              >
                {src.label}
              </a>
              <ExternalLink size={9} className="text-muted shrink-0" />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-mono text-muted">{src.accessDate}</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: reliabilityColors[src.reliability] }} />
                <span className="text-[9px] text-muted capitalize">{src.reliability}</span>
              </div>
            </div>
          </div>
          {editMode && onRemove && (
            <button onClick={() => onRemove(src.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══ Key Facts ═══
function KeyFacts({ facts, accentHex }: { facts: KBEntry['keyFacts']; accentHex: string }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {facts.map((f) => (
        <div key={f.label} className="p-2.5 rounded-lg bg-hover/50 border border-theme/50">
          <div className="text-[9px] text-muted uppercase tracking-wider font-medium">{f.label}</div>
          <div className="text-sm font-bold font-mono mt-0.5" style={{ color: accentHex }}>{f.value}</div>
        </div>
      ))}
    </div>
  );
}

// ═══ Sidebar entry card ═══
function EntryCard({ entry, isActive, onClick, accentHex }: {
  entry: KBEntry;
  isActive: boolean;
  onClick: () => void;
  accentHex: string;
}) {
  const catCfg = KB_CATEGORY_CONFIG[entry.category];
  const statusCfg = KB_STATUS_CONFIG[entry.status];

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-xl border transition-all duration-150
        ${isActive
          ? 'shadow-lg'
          : 'border-theme/50 hover:border-theme bg-card/50 hover:bg-card'
        }
      `}
      style={isActive ? {
        background: `color-mix(in srgb, ${accentHex} 8%, var(--card))`,
        borderColor: `color-mix(in srgb, ${accentHex} 35%, transparent)`,
        boxShadow: `0 4px 20px color-mix(in srgb, ${accentHex} 10%, transparent)`,
      } : undefined}
    >
      {/* Top: Category + Status */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
            style={{ background: `color-mix(in srgb, ${catCfg.color} 15%, transparent)`, color: catCfg.color }}
          >
            <CategoryIcon cat={entry.category} size={11} />
          </div>
          <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: catCfg.color }}>
            {catCfg.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.color }} />
          <span className="text-[9px] font-medium" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xs font-bold text-main leading-tight mb-1 line-clamp-2">{entry.title}</h3>

      {/* Subtitle */}
      <p className="text-[10px] text-muted leading-snug line-clamp-2 mb-2">{entry.subtitle}</p>

      {/* Bottom: Severity + Tags */}
      <div className="flex items-center justify-between">
        <SeverityBar severity={entry.severity} />
        <div className="flex items-center gap-1">
          {entry.countryIds.slice(0, 3).map((cid) => (
            <span key={cid} className="text-[9px] font-mono px-1 py-0.5 rounded bg-hover/80 text-muted">{cid}</span>
          ))}
          {entry.countryIds.length > 3 && (
            <span className="text-[9px] font-mono text-muted">+{entry.countryIds.length - 3}</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ═══ Add Source Modal ═══
function AddSourceModal({ onAdd, onClose, accentHex }: {
  onAdd: (source: KBSource) => void;
  onClose: () => void;
  accentHex: string;
}) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<KBSource['type']>('news');
  const [reliability, setReliability] = useState<KBSource['reliability']>('medium');

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-surface border border-theme rounded-2xl p-5 w-[420px] max-w-[90vw] anim-fade-up" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-bold text-sm mb-4">Neue Quelle hinzufügen</h3>
        <div className="space-y-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Quellenname..."
            className="w-full px-3 py-2 rounded-lg bg-card border border-theme text-xs text-main placeholder:text-muted focus:outline-none"
            style={{ borderColor: `color-mix(in srgb, ${accentHex} 30%, var(--border))` }}
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL..."
            className="w-full px-3 py-2 rounded-lg bg-card border border-theme text-xs text-main placeholder:text-muted focus:outline-none"
          />
          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as KBSource['type'])}
              className="flex-1 px-2 py-2 rounded-lg bg-card border border-theme text-xs"
            >
              <option value="academic">Akademisch</option>
              <option value="news">Nachrichten</option>
              <option value="think-tank">Think Tank</option>
              <option value="government">Regierung</option>
              <option value="ngo">NGO</option>
              <option value="un">UN</option>
              <option value="database">Datenbank</option>
              <option value="primary">Primärquelle</option>
            </select>
            <select
              value={reliability}
              onChange={(e) => setReliability(e.target.value as KBSource['reliability'])}
              className="flex-1 px-2 py-2 rounded-lg bg-card border border-theme text-xs"
            >
              <option value="high">Hoch</option>
              <option value="medium">Mittel</option>
              <option value="low">Niedrig</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-muted hover:text-main transition-colors">
            Abbrechen
          </button>
          <button
            onClick={() => {
              if (label && url) {
                onAdd({
                  id: `user-${Date.now()}`,
                  label,
                  url,
                  type,
                  reliability,
                  accessDate: new Date().toISOString().split('T')[0].slice(0, 7),
                });
                onClose();
              }
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-white"
            style={{ background: accentHex }}
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ Add Image Modal ═══
function AddImageModal({ onAdd, onClose, accentHex }: {
  onAdd: (img: KBEntry['images'][0]) => void;
  onClose: () => void;
  accentHex: string;
}) {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [credit, setCredit] = useState('');

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-surface border border-theme rounded-2xl p-5 w-[420px] max-w-[90vw] anim-fade-up" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-bold text-sm mb-4">Bild hinzufügen</h3>
        <div className="space-y-3">
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Bild-URL..."
            className="w-full px-3 py-2 rounded-lg bg-card border border-theme text-xs text-main placeholder:text-muted focus:outline-none"
          />
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Beschreibung..."
            className="w-full px-3 py-2 rounded-lg bg-card border border-theme text-xs text-main placeholder:text-muted focus:outline-none"
          />
          <input
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
            placeholder="Bildquelle/Credit..."
            className="w-full px-3 py-2 rounded-lg bg-card border border-theme text-xs text-main placeholder:text-muted focus:outline-none"
          />
          {imageUrl && (
            <div className="rounded-lg overflow-hidden border border-theme">
              <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-muted hover:text-main transition-colors">
            Abbrechen
          </button>
          <button
            onClick={() => {
              if (imageUrl) {
                onAdd({ id: `img-${Date.now()}`, url: imageUrl, caption, credit });
                onClose();
              }
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-white"
            style={{ background: accentHex }}
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ Conflict map visualization ═══
function ConflictMap({ entry, accentHex }: { entry: KBEntry; accentHex: string }) {
  const parties = entry.parties ?? [];
  if (parties.length < 2) return null;

  const half = Math.ceil(parties.length / 2);
  const left = parties.slice(0, half);
  const right = parties.slice(half);

  return (
    <div className="p-4 rounded-xl bg-hover/30 border border-theme/50">
      <div className="text-[10px] font-medium text-muted uppercase tracking-wider mb-3">Konfliktparteien</div>
      <div className="flex items-center gap-4">
        {/* Left */}
        <div className="flex-1 space-y-1.5">
          {left.map((p) => (
            <div key={p} className="flex items-center gap-2 p-1.5 rounded-lg bg-card border border-theme/50 text-[11px] font-medium text-main">
              <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              {p}
            </div>
          ))}
        </div>

        {/* Center conflict indicator */}
        <div className="flex flex-col items-center gap-1">
          <Zap size={18} style={{ color: accentHex }} />
          <div className="text-[9px] font-mono text-muted">VS</div>
        </div>

        {/* Right */}
        <div className="flex-1 space-y-1.5">
          {right.map((p) => (
            <div key={p} className="flex items-center gap-2 p-1.5 rounded-lg bg-card border border-theme/50 text-[11px] font-medium text-main">
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ Simple Markdown renderer ═══
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableKey = 0;

  const flushTable = () => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(2); // skip separator row
      elements.push(
        <div key={`table-${tableKey++}`} className="overflow-x-auto my-3">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr>
                {header.map((h, i) => (
                  <th key={i} className="text-left px-2 py-1.5 font-semibold border-b border-theme text-main">{h.trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className="border-b border-theme/30 hover:bg-hover/30">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-2 py-1.5 text-muted">{formatInline(cell.trim())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
    inTable = false;
  };

  const formatInline = (text: string): React.ReactNode => {
    // Bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-main">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) inTable = true;
      const cells = line.split('|').filter(Boolean);
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="font-display font-bold text-sm text-main mt-5 mb-2 flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-accent-400" />
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="font-display font-semibold text-xs text-main mt-3 mb-1.5">{line.slice(4)}</h4>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex gap-2 text-[11px] text-muted leading-relaxed ml-2 mb-0.5">
          <span className="text-accent-400 mt-0.5 shrink-0">•</span>
          <span>{formatInline(line.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1] ?? '';
      elements.push(
        <div key={i} className="flex gap-2 text-[11px] text-muted leading-relaxed ml-2 mb-0.5">
          <span className="text-accent-400 font-mono font-bold shrink-0">{num}.</span>
          <span>{formatInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-[11px] text-muted leading-relaxed mb-1">{formatInline(line)}</p>
      );
    }
  }

  if (inTable) flushTable();

  return <>{elements}</>;
}


// ═══ Notes Panel ═══
function NotesPanel({ entryId, accentHex }: { entryId: string; accentHex: string }) {
  const store = useKnowledgeStore();
  const notes = store.notes.filter(n => n.entryId === entryId);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#f59e0b');

  const noteColors = [
    { color: '#f59e0b', label: 'Gelb' },
    { color: '#3b82f6', label: 'Blau' },
    { color: '#22c55e', label: 'Grün' },
    { color: '#ef4444', label: 'Rot' },
    { color: '#8b5cf6', label: 'Lila' },
  ];

  const handleAdd = () => {
    if (!newNote.trim()) return;
    store.addNote(entryId, newNote.trim(), selectedColor);
    setNewNote('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <StickyNote size={13} style={{ color: accentHex }} />
        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Notizen & Anmerkungen</span>
        <span className="text-[10px] font-mono text-muted">({notes.length})</span>
      </div>

      {/* Add note */}
      <div className="p-3 rounded-xl bg-card/50 border border-theme/50">
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Neue Notiz schreiben... (Analyse, Recherche-Hinweise, etc.)"
          className="w-full px-3 py-2 rounded-lg bg-hover/50 border border-theme text-[11px] text-main placeholder:text-muted focus:outline-none resize-none"
          rows={3}
          style={{ borderColor: newNote ? `color-mix(in srgb, ${selectedColor} 50%, var(--border))` : undefined }}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            {noteColors.map(nc => (
              <button
                key={nc.color}
                onClick={() => setSelectedColor(nc.color)}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: nc.color,
                  borderColor: selectedColor === nc.color ? 'white' : 'transparent',
                  transform: selectedColor === nc.color ? 'scale(1.15)' : undefined,
                }}
                title={nc.label}
              />
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={!newNote.trim()}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-medium text-white disabled:opacity-40 transition-all"
            style={{ background: accentHex }}
          >
            <Plus size={10} />
            Notiz hinzufügen
          </button>
        </div>
      </div>

      {/* Existing notes */}
      <div className="space-y-2">
        {notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(note => (
          <div
            key={note.id}
            className="p-3 rounded-xl border transition-all group"
            style={{
              borderColor: `color-mix(in srgb, ${note.color} 25%, var(--border))`,
              background: `color-mix(in srgb, ${note.color} 5%, var(--card))`,
              borderLeftWidth: '3px',
              borderLeftColor: note.color,
            }}
          >
            {editingId === note.id ? (
              <div>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-hover/50 border border-theme text-[11px] text-main focus:outline-none resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end gap-1.5 mt-1.5">
                  <button onClick={() => setEditingId(null)} className="px-2 py-0.5 rounded text-[10px] text-muted hover:text-main">
                    Abbrechen
                  </button>
                  <button
                    onClick={() => { store.updateNote(note.id, editText); setEditingId(null); }}
                    className="px-2 py-0.5 rounded text-[10px] font-medium text-white"
                    style={{ background: accentHex }}
                  >
                    Speichern
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-main leading-relaxed whitespace-pre-wrap">{note.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] font-mono text-muted">
                    {new Date(note.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {note.updatedAt !== note.createdAt && ' (bearbeitet)'}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingId(note.id); setEditText(note.text); }}
                      className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-main"
                    >
                      <Edit3 size={10} />
                    </button>
                    <button
                      onClick={() => store.removeNote(note.id)}
                      className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-red-400"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-4">
          <MessageSquare size={20} className="mx-auto mb-1.5 opacity-20 text-muted" />
          <p className="text-[10px] text-muted">Noch keine Notizen. Füge Analyse-Bemerkungen, Recherche-Hinweise oder persönliche Anmerkungen hinzu.</p>
        </div>
      )}
    </div>
  );
}

// ═══ View Mode Config ═══
const VIEW_MODES: { id: KBViewMode; label: string; icon: typeof BookOpen }[] = [
  { id: 'entries', label: 'Einträge', icon: BookOpen },
  { id: 'network', label: 'Netzwerk', icon: Network },
  { id: 'timeline', label: 'Zeitleiste', icon: GitBranch },
  { id: 'compare', label: 'Vergleich', icon: ArrowLeftRight },
  { id: 'heatmap', label: 'Heatmap', icon: Map },
  { id: 'scenario', label: 'Szenario', icon: Zap },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function KnowledgeBase() {
  const region = useRegion();
  const store = useKnowledgeStore();
  const [addSourceModal, setAddSourceModal] = useState(false);
  const [addImageModal, setAddImageModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detailSection, setDetailSection] = useState<'content' | 'timeline' | 'sources' | 'links' | 'notes'>('content');
  const detailRef = useRef<HTMLDivElement>(null);

  // Merge static + custom entries
  const allEntries = useMemo(() => {
    const staticEntries = getEntriesForRegion(region.id);
    const customForRegion = store.customEntries.filter(
      (e) => e.region === region.id || e.region === 'both'
    );
    return [...staticEntries, ...customForRegion].map((e) =>
      mergeEntry(e, store.userEntries[e.id])
    );
  }, [region.id, store.customEntries, store.userEntries]);

  // Filter & sort
  const filteredEntries = useMemo(() => {
    let result = allEntries;

    // Category filter
    if (store.activeCategory !== 'all') {
      result = result.filter((e) => e.category === store.activeCategory);
    }

    // Status filter
    if (store.activeStatus !== 'all') {
      result = result.filter((e) => e.status === store.activeStatus);
    }

    // Search
    if (store.searchQuery.trim()) {
      const q = store.searchQuery.toLowerCase();
      result = result.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.content.toLowerCase().includes(q) ||
        e.countryIds.some((c) => c.toLowerCase().includes(q)) ||
        (e.parties ?? []).some((p) => p.toLowerCase().includes(q))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (store.sortBy) {
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'severity': cmp = a.severity - b.severity; break;
        case 'updatedAt': cmp = a.updatedAt.localeCompare(b.updatedAt); break;
        case 'startYear': cmp = (a.startYear ?? 0) - (b.startYear ?? 0); break;
      }
      return store.sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [allEntries, store.activeCategory, store.activeStatus, store.searchQuery, store.sortBy, store.sortDir]);

  // Selected entry
  const selectedEntry = useMemo(() => {
    if (!store.selectedEntryId) return null;
    return allEntries.find((e) => e.id === store.selectedEntryId) ?? null;
  }, [store.selectedEntryId, allEntries]);

  // Auto-select first if none
  const handleNavigate = useCallback((id: string) => {
    store.selectEntry(id);
    setDetailSection('content');
    detailRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [store]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allEntries.length };
    for (const e of allEntries) {
      counts[e.category] = (counts[e.category] ?? 0) + 1;
    }
    return counts;
  }, [allEntries]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-main">
      {/* ═══ VIEW MODE SWITCHER ═══ */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-theme bg-surface shrink-0">
        {VIEW_MODES.map(vm => {
          const Icon = vm.icon;
          const active = store.viewMode === vm.id;
          return (
            <button
              key={vm.id}
              onClick={() => store.setViewMode(vm.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                active ? 'text-white shadow-sm' : 'text-muted hover:text-main hover:bg-hover'
              }`}
              style={active ? { background: region.accentHex } : undefined}
            >
              <Icon size={12} />
              {vm.label}
            </button>
          );
        })}
        <div className="flex-1" />
        <span className="text-[9px] font-mono text-muted">{region.name} · Wissensdatenbank</span>
      </div>

      {/* ═══ VIEW CONTENT ═══ */}
      {store.viewMode === 'network' && <NetworkGraph />}
      {store.viewMode === 'timeline' && <GlobalTimeline />}
      {store.viewMode === 'compare' && <CompareMode />}
      {store.viewMode === 'heatmap' && <ConflictHeatmap />}
      {store.viewMode === 'scenario' && <ScenarioPlanner />}

      {store.viewMode === 'entries' && (
      <div className="flex-1 flex overflow-hidden">
      {/* ═══ SIDEBAR ═══ */}
      <div
        className={`flex flex-col border-r border-theme bg-surface transition-all duration-200 ${
          sidebarCollapsed ? 'w-12' : 'w-[340px]'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-theme">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen size={16} style={{ color: region.accentHex }} />
              {!sidebarCollapsed && (
                <h2 className="font-display font-bold text-sm text-main">Wissensdatenbank</h2>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-main transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {!sidebarCollapsed && (
            <>
              {/* Search */}
              <div className="relative mb-2">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={store.searchQuery}
                  onChange={(e) => store.setSearchQuery(e.target.value)}
                  placeholder="Suche in Wissensdatenbank..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-card border border-theme text-xs text-main placeholder:text-muted focus:outline-none transition-colors"
                  style={{ borderColor: store.searchQuery ? region.accentHex : undefined }}
                />
                {store.searchQuery && (
                  <button
                    onClick={() => store.setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-main"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category filters */}
              <div className="flex flex-wrap gap-1 mb-2">
                <button
                  onClick={() => store.setActiveCategory('all')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all ${
                    store.activeCategory === 'all'
                      ? 'text-white'
                      : 'text-muted border-theme/50 hover:border-theme'
                  }`}
                  style={store.activeCategory === 'all' ? {
                    background: region.accentHex,
                    borderColor: region.accentHex,
                  } : undefined}
                >
                  Alle ({categoryCounts.all})
                </button>
                {(Object.keys(KB_CATEGORY_CONFIG) as KBCategory[]).map((cat) => {
                  const cfg = KB_CATEGORY_CONFIG[cat];
                  const count = categoryCounts[cat] ?? 0;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat}
                      onClick={() => store.setActiveCategory(store.activeCategory === cat ? 'all' : cat)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all flex items-center gap-1 ${
                        store.activeCategory === cat
                          ? 'text-white'
                          : 'text-muted border-theme/50 hover:border-theme'
                      }`}
                      style={store.activeCategory === cat ? {
                        background: cfg.color,
                        borderColor: cfg.color,
                      } : undefined}
                    >
                      <CategoryIcon cat={cat} size={9} />
                      {cfg.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1">
                <ArrowUpDown size={10} className="text-muted" />
                <select
                  value={store.sortBy}
                  onChange={(e) => store.setSortBy(e.target.value as typeof store.sortBy)}
                  className="text-[10px] bg-transparent text-muted border-none outline-none cursor-pointer"
                >
                  <option value="severity">Schweregrad</option>
                  <option value="title">Titel</option>
                  <option value="updatedAt">Aktualisiert</option>
                  <option value="startYear">Beginn</option>
                </select>
                <button onClick={() => store.toggleSortDir()} className="text-muted hover:text-main transition-colors">
                  {store.sortDir === 'desc' ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
                </button>
                <div className="flex-1" />
                <span className="text-[10px] text-muted font-mono">{filteredEntries.length} Einträge</span>
              </div>
            </>
          )}
        </div>

        {/* Entry List */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                isActive={store.selectedEntryId === entry.id}
                onClick={() => handleNavigate(entry.id)}
                accentHex={region.accentHex}
              />
            ))}
            {filteredEntries.length === 0 && (
              <div className="text-center py-8 text-muted text-xs">
                <Search size={24} className="mx-auto mb-2 opacity-30" />
                <p>Keine Einträge gefunden.</p>
              </div>
            )}
          </div>
        )}

        {sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto py-2 flex flex-col items-center gap-1.5">
            {(Object.keys(KB_CATEGORY_CONFIG) as KBCategory[]).map((cat) => {
              const cfg = KB_CATEGORY_CONFIG[cat];
              const count = categoryCounts[cat] ?? 0;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    store.setActiveCategory(store.activeCategory === cat ? 'all' : cat);
                    setSidebarCollapsed(false);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-theme/50 transition-all hover:border-theme"
                  style={store.activeCategory === cat ? { background: `color-mix(in srgb, ${cfg.color} 15%, transparent)`, borderColor: cfg.color } : undefined}
                  title={`${cfg.label} (${count})`}
                >
                  <CategoryIcon cat={cat} size={14} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ DETAIL VIEW ═══ */}
      {selectedEntry ? (
        <div ref={detailRef} className="flex-1 overflow-y-auto">
          {/* Hero Header */}
          <div
            className="relative p-6 border-b border-theme"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${KB_CATEGORY_CONFIG[selectedEntry.category].color} 8%, var(--surface)), var(--surface))`,
            }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{
                    background: `color-mix(in srgb, ${KB_CATEGORY_CONFIG[selectedEntry.category].color} 15%, transparent)`,
                    color: KB_CATEGORY_CONFIG[selectedEntry.category].color,
                  }}
                >
                  <CategoryIcon cat={selectedEntry.category} size={10} />
                  {KB_CATEGORY_CONFIG[selectedEntry.category].label}
                </div>
                <StatusBadge status={selectedEntry.status} />
                {selectedEntry.startYear && (
                  <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                    <Calendar size={10} />
                    {selectedEntry.startYear}{selectedEntry.endYear ? `–${selectedEntry.endYear}` : '–heute'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => store.setEditMode(!store.editMode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                    store.editMode ? 'text-white' : 'text-muted border-theme hover:border-theme'
                  }`}
                  style={store.editMode ? { background: region.accentHex, borderColor: region.accentHex } : undefined}
                >
                  {store.editMode ? <Save size={11} /> : <Edit3 size={11} />}
                  {store.editMode ? 'Bearbeitung aktiv' : 'Bearbeiten'}
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display font-bold text-xl text-main leading-tight mb-1.5">{selectedEntry.title}</h1>
            <p className="text-xs text-muted leading-relaxed max-w-2xl">{selectedEntry.subtitle}</p>

            {/* Key metrics row */}
            {(selectedEntry.casualties || selectedEntry.displaced) && (
              <div className="flex items-center gap-4 mt-3">
                {selectedEntry.casualties && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle size={11} className="text-red-400" />
                    <span className="text-[10px] font-medium text-red-400">Opfer: {selectedEntry.casualties}</span>
                  </div>
                )}
                {selectedEntry.displaced && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Users size={11} className="text-orange-400" />
                    <span className="text-[10px] font-medium text-orange-400">Vertriebene: {selectedEntry.displaced}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-3">
              {selectedEntry.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => store.setSearchQuery(tag)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-card border border-theme/50 text-muted hover:text-main transition-colors"
                >
                  <Tag size={8} />
                  {tag}
                </button>
              ))}
            </div>

            {/* Severity */}
            <div className="mt-3">
              <SeverityBar severity={selectedEntry.severity} />
            </div>
          </div>

          {/* Section tabs */}
          <div className="px-6 border-b border-theme bg-surface sticky top-0 z-10">
            <div className="flex gap-0">
              {([
                { id: 'content' as const, label: 'Inhalt', icon: FileText },
                { id: 'timeline' as const, label: 'Chronologie', icon: Clock },
                { id: 'sources' as const, label: `Quellen (${selectedEntry.sources.length})`, icon: Globe },
                { id: 'links' as const, label: `Verknüpfungen (${selectedEntry.crossLinks.length})`, icon: Link2 },
                { id: 'notes' as const, label: `Notizen (${store.notes.filter(n => n.entryId === selectedEntry.id).length})`, icon: StickyNote },
              ]).map((tab) => {
                const Icon = tab.icon;
                const active = detailSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDetailSection(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-medium border-b-2 transition-all ${
                      active ? 'text-main' : 'text-muted border-transparent hover:text-main'
                    }`}
                    style={active ? { borderColor: region.accentHex, color: region.accentHex } : undefined}
                  >
                    <Icon size={12} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section content */}
          <div className="p-6">
            {detailSection === 'content' && (
              <div className="max-w-3xl space-y-5 anim-fade-up">
                {/* Summary box */}
                <div className="p-4 rounded-xl border border-theme bg-card/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                    <Eye size={11} />
                    Zusammenfassung
                  </div>
                  <p className="text-xs text-main leading-relaxed">{selectedEntry.summary}</p>
                </div>

                {/* Key facts */}
                {selectedEntry.keyFacts.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                      <BarChart3 size={11} />
                      Kerndaten
                    </div>
                    <KeyFacts facts={selectedEntry.keyFacts} accentHex={region.accentHex} />
                  </div>
                )}

                {/* Conflict parties visualization */}
                {selectedEntry.category === 'conflict' && selectedEntry.parties && selectedEntry.parties.length >= 2 && (
                  <ConflictMap entry={selectedEntry} accentHex={region.accentHex} />
                )}

                {/* Main content */}
                <div className="prose-custom">
                  <RenderMarkdown text={selectedEntry.content} />
                </div>

                {/* Images */}
                {selectedEntry.images.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                      <Image size={11} />
                      Bilder
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedEntry.images.map((img) => (
                        <div key={img.id} className="rounded-lg overflow-hidden border border-theme group relative">
                          <img src={img.url} alt={img.caption} className="w-full h-40 object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                            <p className="text-[10px] text-white font-medium">{img.caption}</p>
                            <p className="text-[9px] text-white/60">{img.credit}</p>
                          </div>
                          {store.editMode && (
                            <button
                              onClick={() => store.removeImage(selectedEntry.id, img.id)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add image button */}
                {store.editMode && (
                  <button
                    onClick={() => setAddImageModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-theme text-[11px] text-muted hover:text-main hover:border-theme transition-all"
                  >
                    <Image size={12} />
                    Bild hinzufügen
                  </button>
                )}

                {/* Updated info */}
                <div className="text-[9px] text-muted font-mono pt-4 border-t border-theme/50">
                  Zuletzt aktualisiert: {selectedEntry.updatedAt} | Erstellt: {selectedEntry.createdAt}
                </div>
              </div>
            )}

            {detailSection === 'timeline' && (
              <div className="max-w-2xl anim-fade-up">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={14} style={{ color: region.accentHex }} />
                  <h3 className="font-display font-bold text-sm text-main">Chronologie</h3>
                  <span className="text-[10px] font-mono text-muted">({selectedEntry.timeline.length} Ereignisse)</span>
                </div>
                {selectedEntry.timeline.length > 0 ? (
                  <Timeline events={selectedEntry.timeline} accentHex={region.accentHex} />
                ) : (
                  <p className="text-xs text-muted">Keine Timeline-Einträge vorhanden.</p>
                )}
              </div>
            )}

            {detailSection === 'sources' && (
              <div className="max-w-2xl anim-fade-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Globe size={14} style={{ color: region.accentHex }} />
                    <h3 className="font-display font-bold text-sm text-main">Quellen</h3>
                    <span className="text-[10px] font-mono text-muted">({selectedEntry.sources.length})</span>
                  </div>
                  {store.editMode && (
                    <button
                      onClick={() => setAddSourceModal(true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-white"
                      style={{ background: region.accentHex }}
                    >
                      <Plus size={10} />
                      Quelle hinzufügen
                    </button>
                  )}
                </div>
                <SourcesList
                  sources={selectedEntry.sources}
                  accentHex={region.accentHex}
                  editMode={store.editMode}
                  onRemove={(id) => store.removeSource(selectedEntry.id, id)}
                />
                {selectedEntry.sources.length === 0 && (
                  <p className="text-xs text-muted">Keine Quellen vorhanden.</p>
                )}

                {/* Source reliability legend */}
                <div className="mt-4 p-3 rounded-lg bg-card/50 border border-theme/50">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted mb-2">Zuverlässigkeitslegende</div>
                  <div className="flex items-center gap-4">
                    {(['high', 'medium', 'low'] as const).map((r) => (
                      <div key={r} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: r === 'high' ? '#22c55e' : r === 'medium' ? '#f59e0b' : '#ef4444' }} />
                        <span className="text-[10px] text-muted capitalize">{r === 'high' ? 'Hoch' : r === 'medium' ? 'Mittel' : 'Niedrig'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {detailSection === 'links' && (
              <div className="max-w-2xl anim-fade-up">
                <div className="flex items-center gap-2 mb-4">
                  <Link2 size={14} style={{ color: region.accentHex }} />
                  <h3 className="font-display font-bold text-sm text-main">Querverweise & Verknüpfungen</h3>
                </div>

                {selectedEntry.crossLinks.length > 0 ? (
                  <>
                    <CrossLinks
                      links={selectedEntry.crossLinks}
                      onNavigate={handleNavigate}
                      accentHex={region.accentHex}
                    />

                    {/* Relationship diagram */}
                    <div className="mt-6 p-4 rounded-xl bg-card/50 border border-theme/50">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-3">Beziehungsdiagramm</div>
                      <div className="relative flex items-center justify-center min-h-[200px]">
                        {/* Center node */}
                        <div
                          className="relative z-10 px-3 py-2 rounded-xl border-2 text-xs font-bold text-center max-w-[140px]"
                          style={{
                            borderColor: region.accentHex,
                            background: `color-mix(in srgb, ${region.accentHex} 10%, var(--card))`,
                            color: region.accentHex,
                          }}
                        >
                          {selectedEntry.title.length > 30 ? selectedEntry.title.slice(0, 30) + '...' : selectedEntry.title}
                        </div>

                        {/* Connected nodes in a circle */}
                        {selectedEntry.crossLinks.slice(0, 8).map((link, i) => {
                          const total = Math.min(selectedEntry.crossLinks.length, 8);
                          const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
                          const radius = 120;
                          const x = Math.cos(angle) * radius;
                          const y = Math.sin(angle) * radius;
                          const relationColors: Record<string, string> = {
                            related: '#6b7280', cause: '#f59e0b', effect: '#3b82f6', 'actor-in': '#8b5cf6',
                            'part-of': '#06b6d4', successor: '#22c55e', predecessor: '#f97316', opposed: '#ef4444', allied: '#10b981',
                          };
                          const color = relationColors[link.relationship] ?? '#6b7280';

                          return (
                            <div key={link.targetId}>
                              {/* Line */}
                              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                                <line
                                  x1="50%"
                                  y1="50%"
                                  x2={`calc(50% + ${x}px)`}
                                  y2={`calc(50% + ${y}px)`}
                                  stroke={color}
                                  strokeWidth="1"
                                  strokeOpacity="0.4"
                                  strokeDasharray={link.relationship === 'opposed' ? '4,3' : undefined}
                                />
                              </svg>
                              {/* Node */}
                              <button
                                onClick={() => handleNavigate(link.targetId)}
                                className="absolute px-2 py-1 rounded-lg border text-[9px] font-medium text-center max-w-[110px] truncate transition-all hover:scale-105 cursor-pointer"
                                style={{
                                  left: `calc(50% + ${x}px - 55px)`,
                                  top: `calc(50% + ${y}px - 12px)`,
                                  borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                                  background: `color-mix(in srgb, ${color} 8%, var(--card))`,
                                  color: color,
                                }}
                              >
                                {link.label}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Relationship type legend */}
                    <div className="mt-3 p-3 rounded-lg bg-card/50 border border-theme/50">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-muted mb-2">Beziehungstypen</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'related', label: 'Verwandt', color: '#6b7280' },
                          { key: 'cause', label: 'Ursache', color: '#f59e0b' },
                          { key: 'effect', label: 'Folge', color: '#3b82f6' },
                          { key: 'actor-in', label: 'Akteur in', color: '#8b5cf6' },
                          { key: 'part-of', label: 'Teil von', color: '#06b6d4' },
                          { key: 'opposed', label: 'Gegner', color: '#ef4444' },
                          { key: 'allied', label: 'Verbündet', color: '#10b981' },
                        ].map((r) => (
                          <div key={r.key} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                            <span className="text-[10px] text-muted">{r.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted">Keine Querverweise vorhanden.</p>
                )}

                {/* Backlinks */}
                {(() => {
                  const backlinks = KNOWLEDGE_BASE_ENTRIES.filter(
                    (e) => e.crossLinks.some((l) => l.targetId === selectedEntry.id)
                  );
                  if (backlinks.length === 0) return null;
                  return (
                    <div className="mt-6">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                        <TrendingUp size={11} />
                        Rückverweise (dieses Thema wird erwähnt in)
                      </div>
                      <div className="space-y-1">
                        {backlinks.map((bl) => (
                          <button
                            key={bl.id}
                            onClick={() => handleNavigate(bl.id)}
                            className="w-full flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-theme/50 text-left hover:bg-hover/50 transition-all"
                          >
                            <CategoryIcon cat={bl.category} size={12} />
                            <span className="text-[11px] font-medium text-main">{bl.title}</span>
                            <ChevronRight size={11} className="text-muted ml-auto" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Actor Alliance/Opposition Network */}
                {(() => {
                  const alliedLinks = selectedEntry.crossLinks.filter(l => l.relationship === 'allied');
                  const opposedLinks = selectedEntry.crossLinks.filter(l => l.relationship === 'opposed');
                  if (alliedLinks.length === 0 && opposedLinks.length === 0) return null;

                  return (
                    <div className="mt-6 p-4 rounded-xl bg-card/50 border border-theme/50">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                        <Users size={11} />
                        Akteur-Netzwerk: Allianzen & Rivalitäten
                      </div>
                      <div className="flex gap-6">
                        {/* Allied */}
                        {alliedLinks.length > 0 && (
                          <div className="flex-1">
                            <div className="text-[10px] font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-emerald-400" />
                              Verbündete / Unterstützer
                            </div>
                            <div className="space-y-1">
                              {alliedLinks.map((link) => (
                                <button
                                  key={link.targetId}
                                  onClick={() => handleNavigate(link.targetId)}
                                  className="w-full flex items-center gap-2 p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-left hover:bg-emerald-500/10 transition-all"
                                >
                                  <div className="w-1.5 h-6 rounded-full bg-emerald-400" />
                                  <div>
                                    <div className="text-[11px] font-medium text-main">{link.label}</div>
                                    <div className="text-[9px] text-emerald-400/70">Alliiert</div>
                                  </div>
                                  <ChevronRight size={10} className="text-muted ml-auto" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Opposed */}
                        {opposedLinks.length > 0 && (
                          <div className="flex-1">
                            <div className="text-[10px] font-semibold text-red-400 mb-2 flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-400" />
                              Gegner / Rivalen
                            </div>
                            <div className="space-y-1">
                              {opposedLinks.map((link) => (
                                <button
                                  key={link.targetId}
                                  onClick={() => handleNavigate(link.targetId)}
                                  className="w-full flex items-center gap-2 p-2 rounded-lg border border-red-500/20 bg-red-500/5 text-left hover:bg-red-500/10 transition-all"
                                >
                                  <div className="w-1.5 h-6 rounded-full bg-red-400" />
                                  <div>
                                    <div className="text-[11px] font-medium text-main">{link.label}</div>
                                    <div className="text-[9px] text-red-400/70">Gegner</div>
                                  </div>
                                  <ChevronRight size={10} className="text-muted ml-auto" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actor-in links (involved in conflicts/events) */}
                      {(() => {
                        const actorInLinks = selectedEntry.crossLinks.filter(l => l.relationship === 'actor-in');
                        if (actorInLinks.length === 0) return null;
                        return (
                          <div className="mt-3 pt-3 border-t border-theme/30">
                            <div className="text-[10px] font-semibold text-purple-400 mb-2 flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-purple-400" />
                              Beteiligt an
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {actorInLinks.map((link) => (
                                <button
                                  key={link.targetId}
                                  onClick={() => handleNavigate(link.targetId)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-purple-500/20 bg-purple-500/5 text-[10px] font-medium text-purple-400 hover:bg-purple-500/10 transition-all"
                                >
                                  <Crosshair size={9} />
                                  {link.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Cause/Effect chains */}
                      {(() => {
                        const causeLinks = selectedEntry.crossLinks.filter(l => l.relationship === 'cause');
                        const effectLinks = selectedEntry.crossLinks.filter(l => l.relationship === 'effect');
                        if (causeLinks.length === 0 && effectLinks.length === 0) return null;
                        return (
                          <div className="mt-3 pt-3 border-t border-theme/30">
                            <div className="text-[10px] font-semibold text-amber-400 mb-2 flex items-center gap-1">
                              <Zap size={10} />
                              Kausalzusammenhänge
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {causeLinks.map((link) => (
                                <button
                                  key={link.targetId}
                                  onClick={() => handleNavigate(link.targetId)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-500/20 bg-amber-500/5 text-[10px] text-amber-400 hover:bg-amber-500/10 transition-all"
                                >
                                  <span className="font-bold">→</span> Verursacht: {link.label}
                                </button>
                              ))}
                              {effectLinks.map((link) => (
                                <button
                                  key={link.targetId}
                                  onClick={() => handleNavigate(link.targetId)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-blue-500/20 bg-blue-500/5 text-[10px] text-blue-400 hover:bg-blue-500/10 transition-all"
                                >
                                  <span className="font-bold">←</span> Folge von: {link.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            )}

            {detailSection === 'notes' && (
              <div className="max-w-2xl anim-fade-up">
                <NotesPanel entryId={selectedEntry.id} accentHex={region.accentHex} />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20 text-muted" />
            <h2 className="font-display font-bold text-lg text-main mb-2">Wissensdatenbank</h2>
            <p className="text-xs text-muted leading-relaxed mb-4">
              Wähle einen Eintrag aus der Seitenleiste, um detaillierte Informationen zu Konflikten,
              Akteuren, Regionen und historischen Hintergründen zu erhalten.
            </p>
            <div className="flex items-center justify-center gap-3 text-[10px] text-muted">
              <span className="flex items-center gap-1"><Crosshair size={10} /> Konflikte</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Users size={10} /> Akteure</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock size={10} /> Chronologie</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Globe size={10} /> Quellen</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {addSourceModal && selectedEntry && (
        <AddSourceModal
          onAdd={(source) => store.addSource(selectedEntry.id, source)}
          onClose={() => setAddSourceModal(false)}
          accentHex={region.accentHex}
        />
      )}
      {addImageModal && selectedEntry && (
        <AddImageModal
          onAdd={(img) => store.addImage(selectedEntry.id, img)}
          onClose={() => setAddImageModal(false)}
          accentHex={region.accentHex}
        />
      )}
    </div>
      )}
    </div>
  );
}
