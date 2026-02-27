import {
  X, ExternalLink, MapPin, Plus, ChevronRight, Users, Ruler, DollarSign, Languages, Banknote,
  Building2, Plane, Shield, Target, Swords, Handshake, Pencil, Save, Trash2, Globe,
  AlertTriangle, Crosshair, Calendar, Edit3
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useRegion } from '../context/RegionContext';
import { formatPopulation, formatArea } from '../lib/geoUtils';
import { fetchNews, type NewsArticle, type NewsTopic } from '../lib/newsApi';
import type {
  DetailTab, UserMarker, CountryMilitaryData, WeaponSystem, SecurityActor,
  ArmedConflict, CountryRelation, InternationalMission
} from '../types';

// ── Tab config ──────────────────────────

const detailTabs: { id: DetailTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Übersicht', icon: '🌍' },
  { id: 'economy', label: 'Wirtschaft', icon: '💰' },
  { id: 'politics', label: 'Politik', icon: '🏛️' },
  { id: 'military', label: 'Militär', icon: '⚔️' },
  { id: 'actors', label: 'Akteure', icon: '🎯' },
  { id: 'conflicts', label: 'Konflikte', icon: '💥' },
  { id: 'relations', label: 'Beziehungen', icon: '🔗' },
  { id: 'missions', label: 'Missionen', icon: '🇺🇳' },
  { id: 'humanitarian', label: 'Humanitär', icon: '🤝' },
  { id: 'infrastructure', label: 'Infrastruktur', icon: '🏗️' },
  { id: 'news', label: 'Nachrichten', icon: '📰' },
];

const textTabKey: Record<string, string> = {
  overview: 'overview',
  economy: 'economy',
  politics: 'politics',
  military: 'security',
  humanitarian: 'humanitarian',
  infrastructure: 'infrastructure',
};

// ── Helpers ──────────────────────────

function fmtNum(n: number): string {
  return n.toLocaleString('de-DE');
}

function fmtBudget(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)} Mrd.`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)} Mio.`;
  return `$${fmtNum(n)}`;
}

function getThreatClass(type: string): string {
  if (type.includes('Terror')) return 'threat-border-terror';
  if (type.includes('Miliz') || type.includes('Rebellen') || type.includes('Bewaffnet')) return 'threat-border-militia';
  if (type.includes('Regierung')) return 'threat-border-gov';
  if (type.includes('Ausländisch') || type.includes('PMC')) return 'threat-border-foreign';
  return 'threat-border-default';
}

// Relation sort: allies first, rivals last
const REL_ORDER: Record<string, number> = {
  'Enger Verbündeter': 0, 'Verbündeter': 1, 'Strategischer Partner': 2, 'Enger Partner': 3,
  'Partner': 4, 'Sicherheitspartner': 4, 'Historischer Partner': 4, 'Regionaler Partner': 5,
  'Wirtschaftspartner': 5, 'Friedenspartner': 5, 'Wachsender Partner': 6, 'BRICS-Partner': 6,
  'Neutral': 7, 'Kompliziert': 8, 'Komplizierter Partner': 8, 'Angespannt': 9,
  'Nachbar/Rivale': 10, 'Rivale': 11, 'Hauptrivale': 12, 'Feindlich': 13,
};

// ── Badge components ──────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Aktiv': 'bg-red-500/15 text-red-400',
    'Aktiv (geschwächt)': 'bg-orange-500/15 text-orange-400',
    'Aktiv (niedrige Intensität)': 'bg-orange-500/15 text-orange-400',
    'Aktiv (Krieg)': 'bg-red-600/20 text-red-400',
    'Aktiv (Übergang)': 'bg-amber-500/15 text-amber-400',
    'Aktiv (eingeschränkt)': 'bg-amber-500/15 text-amber-400',
    'Geschwächt': 'bg-amber-500/15 text-amber-400',
    'Unterdrückt': 'bg-slate-500/15 text-slate-400',
    'Waffenstillstand': 'bg-blue-500/15 text-blue-400',
    'Waffenstillstand (fragil)': 'bg-blue-500/15 text-blue-400',
    'Eingefroren': 'bg-cyan-500/15 text-cyan-400',
    'Beendet': 'bg-green-500/15 text-green-400',
    'Beendet (2023)': 'bg-green-500/15 text-green-400',
    'Beendet (2024)': 'bg-green-500/15 text-green-400',
    'Diplomatisch angespannt': 'bg-purple-500/15 text-purple-400',
    'Niedrige Intensität': 'bg-amber-500/15 text-amber-400',
    'Geplant': 'bg-slate-500/15 text-slate-400',
    'Suspendiert': 'bg-slate-500/15 text-slate-400',
    'Reduziert': 'bg-amber-500/15 text-amber-400',
    'Abzug': 'bg-blue-500/15 text-blue-400',
    'Abzug (2024)': 'bg-blue-500/15 text-blue-400',
    'Abzug (bis Ende 2024)': 'bg-blue-500/15 text-blue-400',
    'Potenzielle Bedrohung': 'bg-yellow-500/15 text-yellow-400',
    'Externe Bedrohung': 'bg-yellow-500/15 text-yellow-400',
    'Lieferung': 'bg-sky-500/15 text-sky-400',
    'Teilweise aktiv': 'bg-amber-500/15 text-amber-400',
    'Auslaufend': 'bg-slate-500/15 text-slate-400',
    'Bestellt': 'bg-sky-500/15 text-sky-400',
    'Kaum einsatzfähig': 'bg-red-500/15 text-red-300',
  };
  const cls = colors[status] ?? 'bg-slate-500/15 text-slate-400';
  const isDanger = status.includes('Aktiv') && !status.includes('geschwächt') && !status.includes('eingeschränkt');
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap inline-flex items-center gap-1 ${cls}`}>
      {isDanger && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'Terrororganisation': 'bg-red-500/15 text-red-400 border-red-500/20',
    'Miliz': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    'Separatistische Miliz': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    'Separatistische Bewegung': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    'Bewaffnete Gruppen': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'Bewaffnete Bewegung': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'Bewaffnete Kraft': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'Rebellengruppe': 'bg-rose-500/15 text-rose-400 border-rose-500/20',
    'Amharische Miliz': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    'Ethnische Miliz': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    'Diverse Milizen': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    'Regierung': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'Politische Organisation': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    'Politische Opposition': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    'Ausländischer Akteur': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    'Ausländischer Akteur (PMC)': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    'Kriminelle Organisation': 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    'PMC': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    'Separatistische Gruppe': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  };
  const cls = colors[type] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/20';
  return <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium whitespace-nowrap ${cls}`}>{type}</span>;
}

function RelTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'Verbündeter': 'bg-green-500/15 text-green-400',
    'Enger Verbündeter': 'bg-green-500/15 text-green-400',
    'Strategischer Partner': 'bg-emerald-500/15 text-emerald-400',
    'Partner': 'bg-blue-500/15 text-blue-400',
    'Sicherheitspartner': 'bg-blue-500/15 text-blue-400',
    'Historischer Partner': 'bg-blue-500/15 text-blue-400',
    'Regionaler Partner': 'bg-teal-500/15 text-teal-400',
    'Friedenspartner': 'bg-emerald-500/15 text-emerald-400',
    'Friedensstifter': 'bg-emerald-500/15 text-emerald-400',
    'Wachsender Partner': 'bg-sky-500/15 text-sky-400',
    'Wirtschaftspartner': 'bg-cyan-500/15 text-cyan-400',
    'Enger Partner': 'bg-blue-500/15 text-blue-400',
    'BRICS-Partner': 'bg-purple-500/15 text-purple-400',
    'Nachbar/Rivale': 'bg-amber-500/15 text-amber-400',
    'Rivale': 'bg-red-500/15 text-red-400',
    'Hauptrivale': 'bg-red-500/15 text-red-400',
    'Feindlich': 'bg-red-600/20 text-red-400',
    'Angespannt': 'bg-orange-500/15 text-orange-400',
    'Angespannter Nachbar': 'bg-orange-500/15 text-orange-400',
    'Betroffener Nachbar': 'bg-amber-500/15 text-amber-400',
    'Kompliziert': 'bg-amber-500/15 text-amber-400',
    'Komplizierter Partner': 'bg-amber-500/15 text-amber-400',
    'Neutral': 'bg-slate-500/15 text-slate-400',
    'SAF-Verbündeter': 'bg-blue-500/15 text-blue-400',
    'RSF-Unterstützer': 'bg-red-500/15 text-red-400',
    'Verbündeter (GNU)': 'bg-blue-500/15 text-blue-400',
    'Verbündeter (LNA)': 'bg-orange-500/15 text-orange-400',
    'Partner (GNU)': 'bg-blue-500/15 text-blue-400',
    'Partner (angespannt)': 'bg-amber-500/15 text-amber-400',
  };
  const cls = colors[type] ?? 'bg-slate-500/15 text-slate-400';
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${cls}`}>{type}</span>;
}

function OrgBadge({ org }: { org: string }) {
  const colors: Record<string, string> = {
    'UN': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    'EU': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'AU': 'bg-green-500/20 text-green-300 border-green-500/30',
    'US': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'Russland': 'bg-red-500/20 text-red-300 border-red-500/30',
    'China': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    'Deutschland': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'Frankreich': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'NATO': 'bg-blue-600/20 text-blue-300 border-blue-500/30',
    'Sonstige': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };
  const cls = colors[org] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  return <span className={`text-[11px] px-2 py-0.5 rounded-md border font-bold whitespace-nowrap tracking-wide ${cls}`}>{org}</span>;
}

function SourceLink({ source, label }: { source: string; label: string }) {
  return (
    <a href={source} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[10px] text-accent-400 hover:text-accent-300 transition-colors mt-2 opacity-70 hover:opacity-100">
      <ExternalLink size={9} />
      {label}
    </a>
  );
}

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid color-mix(in srgb, var(--accent-500) 15%, transparent)' }}>
      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent-500) 12%, transparent)' }}>
        <span className="text-accent-400">{icon}</span>
      </div>
      <h3 className="text-xs font-bold text-main uppercase tracking-wider font-display">{title}</h3>
      {count !== undefined && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold" style={{ background: 'color-mix(in srgb, var(--accent-500) 10%, transparent)', color: 'var(--accent-400)' }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ── Weapon categories ──────────────────────────

const categoryIcons: Record<string, string> = {
  'Kampfpanzer': '🛡️', 'Gepanzerte Fahrzeuge': '🚛', 'Artillerie': '💣',
  'MLRS': '🚀', 'MLRS/Raketenwerfer': '🚀', 'Kampfflugzeuge': '✈️',
  'Leichte Kampfflugzeuge': '🛩️', 'Transportflugzeuge': '🛫',
  'Hubschrauber': '🚁', 'UAV/Drohnen': '🎮', 'Kriegsschiffe': '🚢',
  'U-Boote': '🔱', 'Flugabwehr': '🎯', 'Raketen': '🚀',
};

// ── Timeline Bar ──────────────────────────

function TimelineBar({ startYear, endYear }: { startYear: number; endYear?: number }) {
  const now = new Date().getFullYear();
  const end = endYear ?? now;
  const span = end - startYear;
  const maxSpan = 50;
  const width = Math.min(100, Math.max(15, (span / maxSpan) * 100));
  const isOngoing = !endYear;

  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[10px] text-muted font-mono shrink-0">{startYear}</span>
      <div className="flex-1 h-[3px] rounded-full bg-card relative overflow-hidden">
        <div
          className="h-full rounded-full relative"
          style={{
            width: `${width}%`,
            background: isOngoing
              ? `linear-gradient(90deg, var(--accent-500), var(--accent-300))`
              : `linear-gradient(90deg, var(--accent-700), var(--accent-500))`,
          }}
        >
          {isOngoing && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full animate-pulse"
              style={{ background: 'var(--accent-400)', boxShadow: '0 0 6px var(--accent-500)' }} />
          )}
        </div>
      </div>
      <span className="text-[10px] font-mono shrink-0" style={{ color: isOngoing ? 'var(--accent-400)' : 'var(--muted)' }}>
        {isOngoing ? 'heute' : endYear}
      </span>
    </div>
  );
}

// ── Inline edit form ──────────────────────────

function InlineForm({ fields, initial, onSave, onCancel }: {
  fields: { key: string; label: string; type?: 'text' | 'number' | 'textarea'; placeholder?: string }[];
  initial: Record<string, any>;
  onSave: (data: Record<string, any>) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState<Record<string, any>>(initial);
  return (
    <div className="p-3 rounded-xl bg-card border border-accent-500/20 space-y-2 anim-fade-up">
      {fields.map(f => (
        <div key={f.key}>
          <label className="text-[10px] text-muted uppercase tracking-wider">{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea value={data[f.key] ?? ''} onChange={e => setData({ ...data, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="w-full px-2 py-1.5 rounded-lg bg-surface border border-theme text-xs text-main outline-none focus:border-accent-500/50 placeholder:text-muted resize-none"
              rows={3} />
          ) : (
            <input type={f.type ?? 'text'} value={data[f.key] ?? ''}
              onChange={e => setData({ ...data, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
              placeholder={f.placeholder}
              className="w-full px-2 py-1.5 rounded-lg bg-surface border border-theme text-xs text-main outline-none focus:border-accent-500/50 placeholder:text-muted" />
          )}
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(data)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-500 text-white text-[11px] font-semibold hover:bg-accent-600 transition-colors">
          <Save size={11} /> Speichern
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-card border border-theme text-[11px] text-muted hover:text-main transition-colors">
          Abbrechen
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COUNTRY NEWS TAB
// ══════════════════════════════════════════════════════════════

const TOPIC_BADGES: Record<string, { label: string; color: string }> = {
  security: { label: 'Sicherheit', color: '#ef4444' },
  politics: { label: 'Politik', color: '#a855f7' },
  military: { label: 'Militär', color: '#f97316' },
  economy: { label: 'Wirtschaft', color: '#10b981' },
  humanitarian: { label: 'Humanitär', color: '#0ea5e9' },
  diplomacy: { label: 'Diplomatie', color: '#3b82f6' },
};

function CountryNewsTab({ countryId, countryName }: { countryId: string; countryName: string }) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicFilter, setTopicFilter] = useState<NewsTopic | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchNews([countryId], [], '7d', 30)
      .then(results => {
        if (!cancelled) {
          setArticles(results);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Fehler beim Laden');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [countryId]);

  const filtered = useMemo(() => {
    if (!topicFilter) return articles;
    return articles.filter(a => a.topics.includes(topicFilter));
  }, [articles, topicFilter]);

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(a => a.topics.forEach(t => { counts[t] = (counts[t] ?? 0) + 1; }));
    return counts;
  }, [articles]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-5 h-5 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
        <span className="text-xs text-muted">Nachrichten für {countryName} laden...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <AlertTriangle size={16} className="text-red-400" />
        <span className="text-xs text-muted">{error}</span>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Globe size={16} className="text-muted" />
        <span className="text-xs text-muted">Keine Nachrichten für {countryName} gefunden</span>
        <span className="text-[10px] text-muted/50">Letzte 7 Tage</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Topic filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setTopicFilter(null)}
          className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all border ${
            !topicFilter ? 'bg-accent-500/15 text-accent-400 border-accent-500/30' : 'bg-card text-muted border-theme hover:text-main'
          }`}
        >
          Alle ({articles.length})
        </button>
        {Object.entries(topicCounts).sort(([,a],[,b]) => b - a).map(([topic, count]) => {
          const badge = TOPIC_BADGES[topic];
          if (!badge) return null;
          const isActive = topicFilter === topic;
          return (
            <button key={topic} onClick={() => setTopicFilter(isActive ? null : topic as NewsTopic)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                isActive ? 'border-current' : 'bg-card border-theme'
              }`}
              style={{ color: isActive ? badge.color : undefined, borderColor: isActive ? `${badge.color}50` : undefined,
                background: isActive ? `${badge.color}15` : undefined }}
            >
              {badge.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Articles list */}
      {filtered.map((article, i) => (
        <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer"
          className={`block p-3 rounded-xl bg-card border border-theme hover:border-accent-500/30 transition-all group anim-fade-up anim-delay-${Math.min(i + 1, 8)}`}>
          <div className="flex items-start gap-2.5">
            {article.imageUrl && (
              <img src={article.imageUrl} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0 bg-surface" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-main leading-snug line-clamp-2 group-hover:text-accent-400 transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-muted font-medium truncate">{article.source}</span>
                <span className="text-[9px] text-muted/50">
                  {new Date(article.publishedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                </span>
                <ExternalLink size={9} className="text-muted/30 group-hover:text-accent-400 transition-colors shrink-0" />
              </div>
              <div className="flex gap-1 mt-1.5">
                {article.topics.slice(0, 3).map(t => {
                  const badge = TOPIC_BADGES[t];
                  return badge ? (
                    <span key={t} className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: badge.color, background: `${badge.color}15` }}>
                      {badge.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </a>
      ))}

      <div className="text-center text-[10px] text-muted/50 pt-2">
        {filtered.length} Artikel · Letzte 7 Tage
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════

export default function CountryPanel() {
  const { selectedCountryId, selectCountry, detailTab, setDetailTab, addMarker, user, customMilitaryData, setCountryMilitaryData, customCountryDetails, addCountryDetailEntry, updateCountryDetailEntry, removeCountryDetailEntry } = useStore();
  const region = useRegion();
  const [showAddMarker, setShowAddMarker] = useState(false);
  const [markerName, setMarkerName] = useState('');
  const [markerType, setMarkerType] = useState('custom');
  const [editMode, setEditMode] = useState(false);
  const [addingSection, setAddingSection] = useState<string | null>(null);
  const [_editingId, setEditingId] = useState<string | null>(null);
  const [addingEntry, setAddingEntry] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entryDraft, setEntryDraft] = useState({ text: '', source: '', sourceLabel: '' });

  const country = selectedCountryId ? region.countriesById[selectedCountryId] : null;

  const milData = useMemo(() => {
    if (!selectedCountryId) return null;
    return customMilitaryData[selectedCountryId] ?? region.getMilitaryData(selectedCountryId);
  }, [selectedCountryId, customMilitaryData]);

  const missions = useMemo(() => {
    if (!selectedCountryId) return [];
    return region.getMissionsForCountry(selectedCountryId);
  }, [selectedCountryId]);

  const sortedRelations = useMemo(() => {
    if (!milData) return [];
    return [...milData.relations].sort((a, b) => (REL_ORDER[a.type] ?? 7) - (REL_ORDER[b.type] ?? 7));
  }, [milData]);

  const saveMilData = useCallback((updated: CountryMilitaryData) => {
    if (!selectedCountryId) return;
    setCountryMilitaryData(selectedCountryId, updated);
    setEditingId(null);
    setAddingSection(null);
  }, [selectedCountryId, setCountryMilitaryData]);

  const handleDeleteItem = useCallback((section: 'weaponSystems' | 'actors' | 'conflicts' | 'relations' | 'missions', id: string) => {
    if (!milData) return;
    const updated = { ...milData, [section]: (milData[section] as any[]).filter((item: any) => item.id !== id) };
    saveMilData(updated);
  }, [milData, saveMilData]);

  if (!selectedCountryId || !country) return null;

  const handleAddMarker = () => {
    if (!markerName.trim()) return;
    const marker: UserMarker = {
      id: Date.now().toString(), name: markerName, coords: country.capitalCoords,
      type: markerType, color: region.accentHex, countryId: country.id, userId: user?.id,
    };
    addMarker(marker);
    setMarkerName('');
    setShowAddMarker(false);
  };

  const getDefaultTextDetail = (tabId: string) => {
    const key = textTabKey[tabId];
    if (!key) return null;
    return (country.details as any)[key] ?? null;
  };

  const getCustomEntries = (tabId: string) => {
    const key = textTabKey[tabId];
    if (!key || !selectedCountryId) return [];
    return customCountryDetails[`${selectedCountryId}:${key}`] ?? [];
  };

  const defaultTextDetail = getDefaultTextDetail(detailTab);
  const customEntries = getCustomEntries(detailTab);
  const isTextTab = !!textTabKey[detailTab];
  const isStructuredTab = ['military', 'actors', 'conflicts', 'relations', 'missions'].includes(detailTab);

  return (
    <div className="w-full lg:w-[460px] h-full bg-surface border-l border-theme flex flex-col overflow-hidden anim-slide-l">

      {/* ═══ HERO HEADER ═══ */}
      <div className="relative shrink-0 overflow-hidden">
        {/* Gradient banner */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, color-mix(in srgb, var(--accent-900) 40%, var(--surface)) 0%, var(--surface) 100%)`,
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--accent-400) 1px, transparent 0)`,
          backgroundSize: '16px 16px',
        }} />

        <div className="relative p-5 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="text-4xl block" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>{country.flagEmoji}</span>
                <div className="absolute -inset-1 rounded-full opacity-20 blur-md" style={{ background: 'var(--accent-500)' }} />
              </div>
              <div>
                <h2 className="font-bold text-xl text-main leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  {country.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-muted">{country.region}</span>
                  {country.nameLocal && <span className="text-[10px] text-muted/50">· {country.nameLocal}</span>}
                </div>
              </div>
            </div>
            <button onClick={() => selectCountry(null)}
              className="w-7 h-7 rounded-lg bg-card/50 border border-theme/50 flex items-center justify-center text-muted hover:text-main hover:bg-card transition-all shrink-0 backdrop-blur-sm">
              <X size={14} />
            </button>
          </div>

          {/* Hero Stats Row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-lg px-2.5 py-2 glow-accent-sm" style={{ background: 'color-mix(in srgb, var(--accent-500) 8%, var(--card))', border: '1px solid color-mix(in srgb, var(--accent-500) 15%, transparent)' }}>
              <MapPin size={10} className="text-accent-400 mb-1" />
              <div className="text-[9px] text-muted leading-tight uppercase tracking-wider">Hauptstadt</div>
              <div className="text-[11px] font-bold text-main mt-0.5 truncate">{country.capital}</div>
            </div>
            <div className="rounded-lg px-2.5 py-2" style={{ background: 'color-mix(in srgb, var(--accent-500) 5%, var(--card))', border: '1px solid color-mix(in srgb, var(--border) 60%, transparent)' }}>
              <Users size={10} className="text-accent-400 mb-1" />
              <div className="text-[9px] text-muted leading-tight uppercase tracking-wider">Bevölkerung</div>
              <div className="text-[11px] font-bold text-main mt-0.5 font-mono">{formatPopulation(country.population)}</div>
            </div>
            <div className="rounded-lg px-2.5 py-2" style={{ background: 'color-mix(in srgb, var(--accent-500) 5%, var(--card))', border: '1px solid color-mix(in srgb, var(--border) 60%, transparent)' }}>
              <Ruler size={10} className="text-accent-400 mb-1" />
              <div className="text-[9px] text-muted leading-tight uppercase tracking-wider">Fläche</div>
              <div className="text-[11px] font-bold text-main mt-0.5 font-mono">{formatArea(country.area)}</div>
            </div>
            {country.gdp ? (
              <div className="rounded-lg px-2.5 py-2" style={{ background: 'color-mix(in srgb, var(--accent-500) 5%, var(--card))', border: '1px solid color-mix(in srgb, var(--border) 60%, transparent)' }}>
                <DollarSign size={10} className="text-accent-400 mb-1" />
                <div className="text-[9px] text-muted leading-tight uppercase tracking-wider">BIP</div>
                <div className="text-[11px] font-bold text-accent-400 mt-0.5 font-mono">${formatPopulation(country.gdp)}</div>
              </div>
            ) : (
              <div className="rounded-lg px-2.5 py-2 opacity-40" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <DollarSign size={10} className="text-muted mb-1" />
                <div className="text-[9px] text-muted leading-tight uppercase tracking-wider">BIP</div>
                <div className="text-[11px] text-muted mt-0.5">k.A.</div>
              </div>
            )}
          </div>

          {/* Language & Currency row */}
          {(country.languages?.length || country.currency) && (
            <div className="flex gap-2 mt-2">
              {country.languages && country.languages.length > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/50 border border-theme/50 flex-1 min-w-0">
                  <Languages size={10} className="text-accent-400 shrink-0" />
                  <span className="text-[10px] text-muted truncate">{country.languages.join(', ')}</span>
                </div>
              )}
              {country.currency && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/50 border border-theme/50 shrink-0">
                  <Banknote size={10} className="text-accent-400" />
                  <span className="text-[10px] text-muted">{country.currency}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ TAB BAR ═══ */}
      <div className="relative shrink-0 border-b border-theme">
        <div className="flex px-2 pt-1 pb-0 overflow-x-auto scrollbar-thin gap-0">
          {detailTabs.map((tab) => {
            const isActive = detailTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setDetailTab(tab.id)}
                className="relative flex items-center gap-1 px-2.5 py-2 text-[11px] font-medium whitespace-nowrap transition-all rounded-t-lg"
                style={{
                  color: isActive ? 'var(--accent-400)' : 'var(--muted)',
                  background: isActive ? 'color-mix(in srgb, var(--accent-500) 8%, transparent)' : 'transparent',
                }}>
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full" style={{
                    background: 'var(--accent-400)',
                    boxShadow: '0 0 8px var(--accent-500)',
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ EDIT MODE TOGGLE ═══ */}
      {isStructuredTab && milData && (
        <div className="flex items-center justify-end px-4 pt-2 shrink-0">
          <button onClick={() => { setEditMode(!editMode); setEditingId(null); setAddingSection(null); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border
              ${editMode
                ? 'bg-accent-500/15 text-accent-400 border-accent-500/30'
                : 'bg-card text-muted hover:text-main border-theme'}`}>
            <Pencil size={11} />
            {editMode ? 'Bearbeitung aktiv' : 'Bearbeiten'}
          </button>
        </div>
      )}

      {/* ═══ DETAIL CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="anim-fade-up" key={detailTab}>

          {/* ── News tab ── */}
          {detailTab === 'news' && (
            <CountryNewsTab countryId={country.id} countryName={country.name} />
          )}

          {/* ── Text-based tabs: default + custom entries ── */}
          {isTextTab && (
            <div className="space-y-4">
              {/* Default text (from data files) — hidden if user has an override */}
              {defaultTextDetail && !customEntries.some(e => e.id.startsWith('default_')) && (
                <div className="space-y-2 group/default">
                  <div className="relative pl-4" style={{ borderLeft: '3px solid color-mix(in srgb, var(--accent-500) 30%, transparent)' }}>
                    <p className="text-sm text-main leading-relaxed drop-cap">{defaultTextDetail.text}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-1 h-1 rounded-full" style={{ background: 'var(--accent-400)' }} />
                    <SourceLink source={defaultTextDetail.source} label={defaultTextDetail.sourceLabel} />
                    <span className="text-[9px] text-muted/40 ml-auto">Standard</span>
                    {user && (
                      <button onClick={() => {
                        setAddingEntry(true);
                        setEntryDraft({ text: defaultTextDetail.text, source: defaultTextDetail.source, sourceLabel: defaultTextDetail.sourceLabel });
                      }}
                        className="opacity-0 group-hover/default:opacity-100 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-muted hover:text-accent-400 bg-card border border-theme hover:border-accent-500/30 transition-all">
                        <Pencil size={10} /> Bearbeiten
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Custom user entries */}
              {customEntries.map((entry, i) => (
                <div key={entry.id} className={`rounded-xl bg-card border border-theme overflow-hidden group anim-fade-up anim-delay-${Math.min(i + 1, 4)}`}>
                  {editingEntryId === entry.id ? (
                    /* Inline edit form */
                    <div className="p-3 space-y-2">
                      <textarea value={entryDraft.text}
                        onChange={(e) => setEntryDraft({ ...entryDraft, text: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-accent-500/20 text-sm text-main outline-none focus:border-accent-500/40 placeholder:text-muted resize-none leading-relaxed"
                        rows={5} />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={entryDraft.source}
                          onChange={(e) => setEntryDraft({ ...entryDraft, source: e.target.value })}
                          placeholder="Quell-URL"
                          className="px-2 py-1.5 rounded-lg bg-surface border border-theme text-xs text-main outline-none focus:border-accent-500/40 placeholder:text-muted" />
                        <input type="text" value={entryDraft.sourceLabel}
                          onChange={(e) => setEntryDraft({ ...entryDraft, sourceLabel: e.target.value })}
                          placeholder="Quellenname"
                          className="px-2 py-1.5 rounded-lg bg-surface border border-theme text-xs text-main outline-none focus:border-accent-500/40 placeholder:text-muted" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => {
                          if (!entryDraft.text.trim() || !selectedCountryId) return;
                          const key = textTabKey[detailTab];
                          if (!key) return;
                          updateCountryDetailEntry(selectedCountryId, key, entry.id, {
                            text: entryDraft.text, source: entryDraft.source, sourceLabel: entryDraft.sourceLabel || 'Eigene Angabe',
                          });
                          setEditingEntryId(null);
                        }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-500 text-white text-[11px] font-semibold hover:bg-accent-600 transition-colors">
                          <Save size={11} /> Speichern
                        </button>
                        <button onClick={() => setEditingEntryId(null)}
                          className="px-3 py-1.5 rounded-lg bg-surface border border-theme text-[11px] text-muted hover:text-main transition-colors">
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display mode */
                    <>
                      <div className="px-3.5 py-3">
                        <p className="text-[13px] text-main leading-relaxed">{entry.text}</p>
                      </div>
                      <div className="px-3.5 py-2 flex items-center gap-3 flex-wrap" style={{
                        background: 'color-mix(in srgb, var(--accent-500) 3%, transparent)',
                        borderTop: '1px solid color-mix(in srgb, var(--border) 30%, transparent)',
                      }}>
                        {entry.source && (
                          <SourceLink source={entry.source} label={entry.sourceLabel || 'Quelle'} />
                        )}
                        <div className="flex items-center gap-1.5 text-[9px] text-muted/50 ml-auto">
                          <Calendar size={8} />
                          <span>{new Date(entry.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          {entry.updatedAt !== entry.createdAt && (
                            <span className="text-muted/30">· bearb. {new Date(entry.updatedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          )}
                        </div>
                        {user && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => {
                              setEditingEntryId(entry.id);
                              setEntryDraft({ text: entry.text, source: entry.source, sourceLabel: entry.sourceLabel });
                            }}
                              className="p-1 rounded text-muted hover:text-accent-400 transition-colors">
                              <Edit3 size={11} />
                            </button>
                            <button onClick={() => {
                              if (!selectedCountryId) return;
                              const key = textTabKey[detailTab];
                              if (!key) return;
                              removeCountryDetailEntry(selectedCountryId, key, entry.id);
                            }}
                              className="p-1 rounded text-muted hover:text-red-400 transition-colors">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add new entry form */}
              {addingEntry ? (
                <div className="rounded-xl bg-card border border-accent-500/20 p-3 space-y-2 anim-fade-up">
                  <div className="text-[10px] text-accent-400 uppercase tracking-wider font-bold mb-1">Neuer Eintrag</div>
                  <textarea value={entryDraft.text}
                    onChange={(e) => setEntryDraft({ ...entryDraft, text: e.target.value })}
                    placeholder="Neuen Text / Info eingeben..."
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-sm text-main outline-none focus:border-accent-500/40 placeholder:text-muted resize-none leading-relaxed"
                    rows={5} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={entryDraft.source}
                      onChange={(e) => setEntryDraft({ ...entryDraft, source: e.target.value })}
                      placeholder="Quell-URL (optional)"
                      className="px-2 py-1.5 rounded-lg bg-surface border border-theme text-xs text-main outline-none focus:border-accent-500/40 placeholder:text-muted" />
                    <input type="text" value={entryDraft.sourceLabel}
                      onChange={(e) => setEntryDraft({ ...entryDraft, sourceLabel: e.target.value })}
                      placeholder="Quellenname"
                      className="px-2 py-1.5 rounded-lg bg-surface border border-theme text-xs text-main outline-none focus:border-accent-500/40 placeholder:text-muted" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      if (!entryDraft.text.trim() || !selectedCountryId) return;
                      const key = textTabKey[detailTab];
                      if (!key) return;
                      const now = new Date().toISOString();
                      const isDefaultEdit = defaultTextDetail && entryDraft.text !== '' &&
                        !customEntries.some(e => e.id.startsWith('default_'));
                      addCountryDetailEntry(selectedCountryId, key, {
                        id: isDefaultEdit ? `default_${selectedCountryId}_${key}` : `entry_${Date.now()}`,
                        text: entryDraft.text,
                        source: entryDraft.source || '',
                        sourceLabel: entryDraft.sourceLabel || 'Eigene Angabe',
                        createdAt: now,
                        updatedAt: now,
                      });
                      setEntryDraft({ text: '', source: '', sourceLabel: '' });
                      setAddingEntry(false);
                    }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-500 text-white text-[11px] font-semibold hover:bg-accent-600 transition-colors">
                      <Save size={11} /> Speichern
                    </button>
                    <button onClick={() => { setAddingEntry(false); setEntryDraft({ text: '', source: '', sourceLabel: '' }); }}
                      className="px-3 py-1.5 rounded-lg bg-card border border-theme text-[11px] text-muted hover:text-main transition-colors">
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : user && (
                <button onClick={() => { setAddingEntry(true); setEntryDraft({ text: '', source: '', sourceLabel: '' }); }}
                  className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 transition-colors font-medium">
                  <Plus size={13} /> Eintrag hinzufügen
                </button>
              )}
            </div>
          )}

          {/* ══ MILITARY TAB ══ */}
          {detailTab === 'military' && milData && (
            <div className="space-y-5 mt-1">
              {/* Overview Card */}
              <div className="rounded-xl overflow-hidden glow-accent-sm" style={{
                background: 'color-mix(in srgb, var(--accent-500) 5%, var(--card))',
                border: '1px solid color-mix(in srgb, var(--accent-500) 15%, transparent)',
              }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{
                  background: 'color-mix(in srgb, var(--accent-500) 8%, transparent)',
                  borderBottom: '1px solid color-mix(in srgb, var(--accent-500) 10%, transparent)',
                }}>
                  <Shield size={14} className="text-accent-400" />
                  <h4 className="text-sm font-bold text-main tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    {milData.overview.armedForcesName}
                  </h4>
                </div>

                <div className="p-4 space-y-4">
                  {/* Hero numbers */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="stat-hero text-main">{fmtNum(milData.overview.activePersonnel)}</div>
                      <div className="text-[9px] text-muted uppercase tracking-wider mt-1">Aktive</div>
                    </div>
                    <div className="text-center">
                      <div className="stat-hero text-main/70">{fmtNum(milData.overview.reservePersonnel)}</div>
                      <div className="text-[9px] text-muted uppercase tracking-wider mt-1">Reserve</div>
                    </div>
                    {milData.overview.paramilitaryPersonnel ? (
                      <div className="text-center">
                        <div className="stat-hero text-main/60">{fmtNum(milData.overview.paramilitaryPersonnel)}</div>
                        <div className="text-[9px] text-muted uppercase tracking-wider mt-1">Paramilitär</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="stat-hero text-accent-400">{fmtBudget(milData.overview.militaryBudget)}</div>
                        <div className="text-[9px] text-muted uppercase tracking-wider mt-1">Budget</div>
                      </div>
                    )}
                  </div>

                  {/* Budget + GDP bar */}
                  <div className="space-y-1.5">
                    {milData.overview.paramilitaryPersonnel && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted">Militärbudget</span>
                        <span className="text-xs font-bold text-accent-400 font-mono">{fmtBudget(milData.overview.militaryBudget)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted">Anteil am BIP</span>
                      <span className="text-xs font-bold text-main font-mono">{milData.overview.budgetPercentGDP}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, milData.overview.budgetPercentGDP * 10)}%`,
                          background: milData.overview.budgetPercentGDP > 5
                            ? 'linear-gradient(90deg, var(--accent-500), #ef4444)'
                            : milData.overview.budgetPercentGDP > 2
                              ? 'linear-gradient(90deg, var(--accent-500), var(--accent-300))'
                              : 'var(--accent-500)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Detail rows */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1" style={{ borderTop: '1px solid color-mix(in srgb, var(--border) 30%, transparent)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted">Wehrpflicht</span>
                      <span className={`text-[11px] font-semibold ${milData.overview.conscription ? 'text-red-400' : 'text-green-400'}`}>
                        {milData.overview.conscription ? 'Ja' : 'Nein'}
                      </span>
                    </div>
                    {milData.overview.founded && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted">Gegründet</span>
                        <span className="text-[11px] font-semibold text-main font-mono">{milData.overview.founded}</span>
                      </div>
                    )}
                  </div>
                  {milData.overview.commanderInChief && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-muted">Oberbefehlshaber:</span>
                      <span className="text-[11px] font-semibold text-main">{milData.overview.commanderInChief}</span>
                    </div>
                  )}
                  <SourceLink source={milData.overview.source} label={milData.overview.sourceLabel} />
                </div>
              </div>

              {/* Weapon Systems */}
              <div>
                <SectionHeader icon={<Crosshair size={12} />} title="Waffensysteme" count={milData.weaponSystems.length} />
                {(() => {
                  const groups: Record<string, WeaponSystem[]> = {};
                  milData.weaponSystems.forEach(w => { (groups[w.category] ??= []).push(w); });
                  return Object.entries(groups).map(([cat, weapons], gi) => (
                    <div key={cat} className={`mb-4 anim-fade-up anim-delay-${Math.min(gi + 1, 8)}`}>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-sm">{categoryIcons[cat] ?? '🔧'}</span>
                        <span className="text-[11px] font-bold text-main uppercase tracking-wider">{cat}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-card border border-theme text-muted font-mono">{weapons.length}</span>
                      </div>
                      <div className="space-y-1">
                        {weapons.map(w => (
                          <div key={w.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card border border-theme group hover:border-accent-500/20 transition-all">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-main truncate">{w.name}</span>
                                <StatusBadge status={w.status} />
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted">
                                  <span className="text-main/70">{w.origin}</span>
                                </span>
                                {w.notes && <span className="text-[10px] text-muted/50 truncate">· {w.notes}</span>}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold text-accent-400 font-mono leading-none">{fmtNum(w.quantity)}</div>
                              <div className="text-[8px] text-muted uppercase tracking-wider">Stk.</div>
                            </div>
                            {editMode && (
                              <button onClick={() => handleDeleteItem('weaponSystems', w.id)}
                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all shrink-0">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}

                {editMode && (
                  addingSection === 'weapons' ? (
                    <InlineForm
                      fields={[
                        { key: 'category', label: 'Kategorie', placeholder: 'z.B. Kampfpanzer' },
                        { key: 'name', label: 'Bezeichnung', placeholder: 'z.B. T-90SA' },
                        { key: 'quantity', label: 'Anzahl', type: 'number', placeholder: '0' },
                        { key: 'origin', label: 'Herkunft', placeholder: 'z.B. Russland' },
                        { key: 'status', label: 'Status', placeholder: 'z.B. Aktiv' },
                        { key: 'notes', label: 'Anmerkungen (optional)', placeholder: '' },
                        { key: 'source', label: 'Quell-URL', placeholder: 'https://...' },
                        { key: 'sourceLabel', label: 'Quellenname', placeholder: 'z.B. IISS Military Balance' },
                      ]}
                      initial={{}}
                      onSave={(d) => {
                        if (!milData || !d.name) return;
                        const ws: WeaponSystem = {
                          id: `user_${Date.now()}`, category: d.category || 'Sonstige', name: d.name,
                          quantity: Number(d.quantity) || 0, origin: d.origin || '', status: d.status || 'Aktiv',
                          notes: d.notes, source: d.source || '', sourceLabel: d.sourceLabel || 'Eigene Angabe',
                        };
                        saveMilData({ ...milData, weaponSystems: [...milData.weaponSystems, ws] });
                      }}
                      onCancel={() => setAddingSection(null)}
                    />
                  ) : (
                    <button onClick={() => setAddingSection('weapons')}
                      className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 transition-colors font-medium mt-2">
                      <Plus size={13} /> Waffensystem hinzufügen
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* ══ ACTORS TAB ══ */}
          {detailTab === 'actors' && milData && (
            <div className="space-y-3">
              <SectionHeader icon={<Target size={12} />} title="Sicherheitsakteure" count={milData.actors.length} />
              {milData.actors.length === 0 && (
                <p className="text-xs text-muted italic px-1">Keine bekannten aktiven Sicherheitsakteure.
                  {editMode && ' Klicken Sie unten, um einen hinzuzufügen.'}</p>
              )}
              {milData.actors.map((a, i) => (
                <div key={a.id}
                  className={`p-3.5 rounded-xl bg-card border border-theme space-y-2 group anim-fade-up anim-delay-${Math.min(i + 1, 8)} ${getThreatClass(a.type)}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-main">{a.name}</span>
                        <TypeBadge type={a.type} />
                        <StatusBadge status={a.status} />
                      </div>
                    </div>
                    {editMode && (
                      <button onClick={() => handleDeleteItem('actors', a.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all shrink-0 mt-0.5">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-main/80 leading-relaxed">{a.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {a.areas && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-theme text-[10px] text-muted">
                        <MapPin size={8} className="text-accent-400" />
                        {a.areas}
                      </div>
                    )}
                    {a.estimatedStrength && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-theme text-[10px] text-muted">
                        <Users size={8} className="text-accent-400" />
                        {a.estimatedStrength}
                      </div>
                    )}
                  </div>
                  <SourceLink source={a.source} label={a.sourceLabel} />
                </div>
              ))}
              {editMode && (
                addingSection === 'actors' ? (
                  <InlineForm
                    fields={[
                      { key: 'name', label: 'Name', placeholder: 'z.B. Boko Haram' },
                      { key: 'type', label: 'Typ', placeholder: 'z.B. Terrororganisation, Miliz, Ausländischer Akteur' },
                      { key: 'status', label: 'Status', placeholder: 'z.B. Aktiv, Geschwächt' },
                      { key: 'description', label: 'Beschreibung', type: 'textarea', placeholder: 'Detaillierte Beschreibung...' },
                      { key: 'areas', label: 'Operationsgebiet', placeholder: 'z.B. Nordost-Nigeria' },
                      { key: 'estimatedStrength', label: 'Geschätzte Stärke', placeholder: 'z.B. 5.000-10.000' },
                      { key: 'source', label: 'Quell-URL', placeholder: 'https://...' },
                      { key: 'sourceLabel', label: 'Quellenname', placeholder: '' },
                    ]}
                    initial={{}}
                    onSave={(d) => {
                      if (!milData || !d.name) return;
                      const actor: SecurityActor = {
                        id: `user_${Date.now()}`, name: d.name, type: d.type || 'Sonstige',
                        description: d.description || '', status: d.status || 'Aktiv',
                        areas: d.areas, estimatedStrength: d.estimatedStrength,
                        source: d.source || '', sourceLabel: d.sourceLabel || 'Eigene Angabe',
                      };
                      saveMilData({ ...milData, actors: [...milData.actors, actor] });
                    }}
                    onCancel={() => setAddingSection(null)}
                  />
                ) : (
                  <button onClick={() => setAddingSection('actors')}
                    className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 transition-colors font-medium">
                    <Plus size={13} /> Akteur hinzufügen
                  </button>
                )
              )}
            </div>
          )}

          {/* ══ CONFLICTS TAB ══ */}
          {detailTab === 'conflicts' && milData && (
            <div className="space-y-3">
              <SectionHeader icon={<Swords size={12} />} title="Konflikte" count={milData.conflicts.length} />
              {milData.conflicts.length === 0 && (
                <p className="text-xs text-muted italic px-1">Keine bekannten aktiven Konflikte.
                  {editMode && ' Klicken Sie unten, um einen hinzuzufügen.'}</p>
              )}
              {milData.conflicts.map((c, i) => (
                <div key={c.id} className={`p-3.5 rounded-xl bg-card border border-theme space-y-2 group anim-fade-up anim-delay-${Math.min(i + 1, 8)}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-main">{c.name}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <TimelineBar startYear={c.startYear} endYear={c.endYear} />
                    </div>
                    {editMode && (
                      <button onClick={() => handleDeleteItem('conflicts', c.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all shrink-0 mt-0.5">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {c.parties.map((p, pi) => (
                      <span key={pi} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: pi === 0
                            ? 'color-mix(in srgb, var(--accent-500) 12%, transparent)'
                            : 'color-mix(in srgb, var(--border) 40%, transparent)',
                          color: pi === 0 ? 'var(--accent-400)' : 'var(--text)',
                          border: `1px solid ${pi === 0 ? 'color-mix(in srgb, var(--accent-500) 20%, transparent)' : 'color-mix(in srgb, var(--border) 60%, transparent)'}`,
                        }}>
                        {p}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-main/80 leading-relaxed">{c.description}</p>
                  {c.casualties && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/8 border border-red-500/15 text-[10px] text-red-400">
                      <AlertTriangle size={10} />
                      <span className="font-medium">{c.casualties}</span>
                    </div>
                  )}
                  <SourceLink source={c.source} label={c.sourceLabel} />
                </div>
              ))}
              {editMode && (
                addingSection === 'conflicts' ? (
                  <InlineForm
                    fields={[
                      { key: 'name', label: 'Konfliktname', placeholder: '' },
                      { key: 'parties', label: 'Konfliktparteien (kommagetrennt)', placeholder: 'z.B. Armee, Rebellengruppe' },
                      { key: 'status', label: 'Status', placeholder: 'z.B. Aktiv, Waffenstillstand, Beendet' },
                      { key: 'startYear', label: 'Beginn (Jahr)', type: 'number', placeholder: '2020' },
                      { key: 'endYear', label: 'Ende (optional)', type: 'number', placeholder: '' },
                      { key: 'description', label: 'Beschreibung', type: 'textarea', placeholder: '' },
                      { key: 'casualties', label: 'Opferzahlen', placeholder: '' },
                      { key: 'source', label: 'Quell-URL', placeholder: 'https://...' },
                      { key: 'sourceLabel', label: 'Quellenname', placeholder: '' },
                    ]}
                    initial={{}}
                    onSave={(d) => {
                      if (!milData || !d.name) return;
                      const conflict: ArmedConflict = {
                        id: `user_${Date.now()}`, name: d.name,
                        parties: (d.parties || '').split(',').map((s: string) => s.trim()).filter(Boolean),
                        status: d.status || 'Aktiv', startYear: Number(d.startYear) || new Date().getFullYear(),
                        endYear: d.endYear ? Number(d.endYear) : undefined, description: d.description || '',
                        casualties: d.casualties, source: d.source || '', sourceLabel: d.sourceLabel || 'Eigene Angabe',
                      };
                      saveMilData({ ...milData, conflicts: [...milData.conflicts, conflict] });
                    }}
                    onCancel={() => setAddingSection(null)}
                  />
                ) : (
                  <button onClick={() => setAddingSection('conflicts')}
                    className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 transition-colors font-medium">
                    <Plus size={13} /> Konflikt hinzufügen
                  </button>
                )
              )}
            </div>
          )}

          {/* ══ RELATIONS TAB ══ */}
          {detailTab === 'relations' && milData && (
            <div className="space-y-3">
              <SectionHeader icon={<Handshake size={12} />} title="Beziehungen" count={milData.relations.length} />
              {milData.relations.length === 0 && (
                <p className="text-xs text-muted italic px-1">Keine Beziehungsdaten verfügbar.
                  {editMode && ' Klicken Sie unten, um eine hinzuzufügen.'}</p>
              )}
              {sortedRelations.map((r, i) => (
                <div key={r.id} className={`p-3.5 rounded-xl bg-card border border-theme space-y-2 group anim-fade-up anim-delay-${Math.min(i + 1, 8)} hover:border-accent-500/20 transition-all`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' }}>{r.countryFlag}</span>
                      <div>
                        <span className="text-sm font-bold text-main block">{r.countryName}</span>
                        <div className="mt-1">
                          <RelTypeBadge type={r.type} />
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <button onClick={() => handleDeleteItem('relations', r.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all shrink-0 mt-0.5">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-main/80 leading-relaxed">{r.description}</p>
                  <SourceLink source={r.source} label={r.sourceLabel} />
                </div>
              ))}
              {editMode && (
                addingSection === 'relations' ? (
                  <InlineForm
                    fields={[
                      { key: 'countryName', label: 'Land', placeholder: 'z.B. USA' },
                      { key: 'countryFlag', label: 'Flagge (Emoji)', placeholder: 'z.B. \uD83C\uDDFA\uD83C\uDDF8' },
                      { key: 'countryId', label: 'Länder-ID', placeholder: 'z.B. US' },
                      { key: 'type', label: 'Beziehungstyp', placeholder: 'z.B. Verbündeter, Partner, Rivale, Angespannt' },
                      { key: 'description', label: 'Beschreibung', type: 'textarea', placeholder: '' },
                      { key: 'source', label: 'Quell-URL', placeholder: 'https://...' },
                      { key: 'sourceLabel', label: 'Quellenname', placeholder: '' },
                    ]}
                    initial={{}}
                    onSave={(d) => {
                      if (!milData || !d.countryName) return;
                      const relation: CountryRelation = {
                        id: `user_${Date.now()}`, countryId: d.countryId || '', countryName: d.countryName,
                        countryFlag: d.countryFlag, type: d.type || 'Neutral', description: d.description || '',
                        source: d.source || '', sourceLabel: d.sourceLabel || 'Eigene Angabe',
                      };
                      saveMilData({ ...milData, relations: [...milData.relations, relation] });
                    }}
                    onCancel={() => setAddingSection(null)}
                  />
                ) : (
                  <button onClick={() => setAddingSection('relations')}
                    className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 transition-colors font-medium">
                    <Plus size={13} /> Beziehung hinzufügen
                  </button>
                )
              )}
            </div>
          )}

          {/* ══ MISSIONS TAB ══ */}
          {detailTab === 'missions' && (
            <div className="space-y-3">
              <SectionHeader icon={<Globe size={12} />} title="Internationale Missionen" count={missions.length} />
              {missions.length === 0 && (
                <p className="text-xs text-muted italic px-1">Keine internationalen Missionen in diesem Land bekannt.
                  {editMode && milData && ' Klicken Sie unten, um eine hinzuzufügen.'}</p>
              )}
              {missions.map((m, i) => (
                <div key={m.id} className={`rounded-xl bg-card border border-theme overflow-hidden group anim-fade-up anim-delay-${Math.min(i + 1, 8)}`}>
                  {/* Mission header bar */}
                  <div className="flex items-center gap-2 px-3.5 py-2.5" style={{
                    background: 'color-mix(in srgb, var(--accent-500) 5%, transparent)',
                    borderBottom: '1px solid color-mix(in srgb, var(--border) 40%, transparent)',
                  }}>
                    <OrgBadge org={m.organization} />
                    <span className="text-sm font-bold text-main flex-1">{m.name}</span>
                    <StatusBadge status={m.status} />
                    {editMode && milData && (
                      <button onClick={() => handleDeleteItem('missions', m.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all shrink-0">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="px-3.5 py-3 space-y-2">
                    <div className="text-[11px] text-muted">{m.fullName}</div>
                    <TimelineBar startYear={m.startYear} endYear={m.endYear} />
                    <div className="flex items-center gap-3 mt-1">
                      {m.type && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-theme text-muted">{m.type}</span>
                      )}
                      {m.personnel && (
                        <span className="flex items-center gap-1 text-[10px] text-muted">
                          <Users size={9} className="text-accent-400" />
                          <span className="font-mono font-bold text-main">{fmtNum(m.personnel)}</span> Personal
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-main/80 leading-relaxed">{m.description}</p>
                    <SourceLink source={m.source} label={m.sourceLabel} />
                  </div>
                </div>
              ))}
              {editMode && milData && (
                addingSection === 'missions' ? (
                  <InlineForm
                    fields={[
                      { key: 'name', label: 'Kürzel', placeholder: 'z.B. MONUSCO' },
                      { key: 'fullName', label: 'Vollständiger Name', placeholder: '' },
                      { key: 'organization', label: 'Organisation', placeholder: 'UN, EU, US, Russland, China, Deutschland, AU, Sonstige' },
                      { key: 'type', label: 'Missionstyp', placeholder: 'z.B. Friedenssicherung, Militärische Ausbildung' },
                      { key: 'status', label: 'Status', placeholder: 'z.B. Aktiv, Beendet' },
                      { key: 'startYear', label: 'Beginn', type: 'number', placeholder: '2020' },
                      { key: 'personnel', label: 'Personal', type: 'number', placeholder: '0' },
                      { key: 'description', label: 'Beschreibung', type: 'textarea', placeholder: '' },
                      { key: 'source', label: 'Quell-URL', placeholder: 'https://...' },
                      { key: 'sourceLabel', label: 'Quellenname', placeholder: '' },
                    ]}
                    initial={{}}
                    onSave={(d) => {
                      if (!milData || !d.name) return;
                      const mission: InternationalMission = {
                        id: `user_${Date.now()}`, name: d.name, fullName: d.fullName || d.name,
                        organization: d.organization || 'Sonstige', type: d.type || '', status: d.status || 'Aktiv',
                        startYear: Number(d.startYear) || new Date().getFullYear(), endYear: undefined,
                        personnel: d.personnel ? Number(d.personnel) : undefined,
                        description: d.description || '', countries: [selectedCountryId],
                        source: d.source || '', sourceLabel: d.sourceLabel || 'Eigene Angabe',
                      };
                      saveMilData({ ...milData, missions: [...milData.missions, mission] });
                    }}
                    onCancel={() => setAddingSection(null)}
                  />
                ) : (
                  <button onClick={() => setAddingSection('missions')}
                    className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 transition-colors font-medium">
                    <Plus size={13} /> Mission hinzufügen
                  </button>
                )
              )}
            </div>
          )}

          {/* No military data notice */}
          {isStructuredTab && !milData && detailTab !== 'missions' && (
            <div className="p-6 rounded-xl text-center space-y-3 mt-2" style={{
              background: 'color-mix(in srgb, var(--accent-500) 3%, var(--card))',
              border: '1px solid color-mix(in srgb, var(--accent-500) 10%, transparent)',
            }}>
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent-500) 8%, transparent)' }}>
                <Shield size={20} className="text-muted" />
              </div>
              <p className="text-xs text-muted">Für dieses Land sind noch keine detaillierten {
                detailTab === 'military' ? 'Militärdaten' :
                detailTab === 'actors' ? 'Akteursdaten' :
                detailTab === 'conflicts' ? 'Konfliktdaten' :
                'Beziehungsdaten'
              } verfügbar.</p>
              <p className="text-[10px] text-muted/60">Aktivieren Sie den Bearbeitungsmodus, um Informationen hinzuzufügen.</p>
            </div>
          )}

          {isStructuredTab && !milData && detailTab !== 'missions' && editMode && (
            <button
              onClick={() => {
                const emptyData: CountryMilitaryData = {
                  overview: {
                    armedForcesName: `Streitkräfte von ${country.name}`,
                    activePersonnel: 0, reservePersonnel: 0, militaryBudget: 0,
                    budgetPercentGDP: 0, conscription: false, source: '', sourceLabel: 'Eigene Angabe',
                  },
                  weaponSystems: [], actors: [], conflicts: [], relations: [], missions: [],
                };
                saveMilData(emptyData);
              }}
              className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 transition-colors font-medium mt-3">
              <Plus size={13} /> Militärdaten für {country.name} anlegen
            </button>
          )}
        </div>

        {/* ── Key Facts (overview only) ── */}
        {country.keyFacts && country.keyFacts.length > 0 && detailTab === 'overview' && (
          <div className="space-y-2">
            <SectionHeader icon={<Target size={11} />} title="Schlüsselfakten" />
            {country.keyFacts.map((fact, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-lg bg-card border border-theme anim-fade-up anim-delay-${Math.min(i + 1, 8)}`}>
                <span className="text-xs text-muted">{fact.label}</span>
                <span className="text-xs font-bold text-main font-mono">{fact.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Cities ── */}
        {!isStructuredTab && (
          <div className="space-y-2">
            <SectionHeader icon={<Building2 size={11} />} title="Größte Städte" count={country.majorCities.length} />
            {country.majorCities.map((city, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-lg bg-card border border-theme anim-fade-up anim-delay-${Math.min(i + 1, 8)} hover:border-accent-500/20 transition-all`}>
                <div className="flex items-center gap-2">
                  {city.isCapital && <span className="w-2 h-2 rounded-full glow-accent-sm" style={{ background: 'var(--accent-400)' }} />}
                  {!city.isCapital && <span className="w-1.5 h-1.5 rounded-full bg-muted/30" />}
                  <span className="text-xs font-medium text-main">{city.name}</span>
                  {city.isCapital && <span className="text-[9px] text-accent-400 uppercase tracking-wider font-bold">Hauptstadt</span>}
                </div>
                <span className="text-xs text-muted font-mono font-bold">{formatPopulation(city.population)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Airports ── */}
        {!isStructuredTab && country.airports.length > 0 && (
          <div className="space-y-2">
            <SectionHeader icon={<Plane size={11} />} title="Flughäfen" count={country.airports.length} />
            {country.airports.map((ap, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-lg bg-card border border-theme anim-fade-up anim-delay-${Math.min(i + 1, 8)}`}>
                <span className="text-xs font-medium text-main">{ap.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase" style={{
                  background: 'color-mix(in srgb, var(--accent-500) 10%, transparent)',
                  color: 'var(--accent-400)',
                  border: '1px solid color-mix(in srgb, var(--accent-500) 15%, transparent)',
                }}>{ap.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Add Marker ── */}
        {!isStructuredTab && (
          <div className="space-y-2">
            <button onClick={() => setShowAddMarker(!showAddMarker)}
              className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 transition-colors font-medium">
              <Plus size={13} /> Standort hinzufügen
              <ChevronRight size={11} className={`transition-transform ${showAddMarker ? 'rotate-90' : ''}`} />
            </button>
            {showAddMarker && (
              <div className="p-3 rounded-xl bg-card border border-theme space-y-2 anim-fade-up">
                <input type="text" value={markerName} onChange={(e) => setMarkerName(e.target.value)} placeholder="Name des Standorts"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-sm text-main outline-none focus:border-accent-500/50 placeholder:text-muted" />
                <select value={markerType} onChange={(e) => setMarkerType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-theme text-sm text-main outline-none focus:border-accent-500/50">
                  <option value="custom">Benutzerdefiniert</option>
                  <option value="airport">Flughafen</option>
                  <option value="port">Hafen</option>
                  <option value="military">Militärisch</option>
                </select>
                <button onClick={handleAddMarker}
                  className="w-full py-2 rounded-lg bg-accent-500 text-white text-xs font-semibold hover:bg-accent-600 transition-colors">
                  Hinzufügen
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
