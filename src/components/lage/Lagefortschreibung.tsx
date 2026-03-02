import { useState, useMemo, useRef, useEffect, type JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, Pin, Archive, Link2, Clock, MapPin,
  ChevronRight, ChevronDown, ExternalLink, Edit3,
  Save, Download, Filter, LayoutGrid, GitBranch,
  Rows3, Calendar, Grid3x3, Copy, Eye,
  Zap, Shield, Crosshair, Globe, BarChart3,
  Laptop, Handshake, Building2, StickyNote,
  FileText
} from 'lucide-react';
import {
  useLageStore,
  PRIORITY_CONFIG, CATEGORY_CONFIG,
  type LageEntry, type LageCategory, type LagePriority, type LageViewMode, type LageActor,
} from '../../store/useLageStore';

// ═══════════════════════════════════════════════════════════════════
// CATEGORY ICONS (Lucide)
// ═══════════════════════════════════════════════════════════════════
const CAT_ICONS: Record<LageCategory, (props: { size: number }) => JSX.Element> = {
  military: ({ size }) => <Crosshair size={size} />,
  political: ({ size }) => <Globe size={size} />,
  humanitarian: ({ size }) => <Shield size={size} />,
  economic: ({ size }) => <BarChart3 size={size} />,
  cyber: ({ size }) => <Laptop size={size} />,
  diplomatic: ({ size }) => <Handshake size={size} />,
  intelligence: ({ size }) => <Eye size={size} />,
  infrastructure: ({ size }) => <Building2 size={size} />,
};

// ═══════════════════════════════════════════════════════════════════
// TIME HELPERS
// ═══════════════════════════════════════════════════════════════════
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Gerade eben';
  if (mins < 60) return `vor ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `vor ${days}d`;
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}



// ═══════════════════════════════════════════════════════════════════
// MARKDOWN-LITE RENDERER
// ═══════════════════════════════════════════════════════════════════
function renderMarkdownLite(md: string): JSX.Element {
  const lines = md.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-0.5 text-sm opacity-80 my-1.5">
          {listItems.map((li, i) => <li key={i}>{li}</li>)}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      flushList();
      elements.push(<h3 key={i} className="text-sm font-bold mt-3 mb-1 uppercase tracking-wider opacity-60">{line.slice(3)}</h3>);
    } else if (line.startsWith('### ')) {
      flushList();
      elements.push(<h4 key={i} className="text-xs font-semibold mt-2 mb-1 opacity-70">{line.slice(4)}</h4>);
    } else if (line.startsWith('- ')) {
      listItems.push(line.slice(2));
    } else if (line.startsWith('**') && line.endsWith('**')) {
      flushList();
      elements.push(<p key={i} className="text-sm font-bold my-1">{line.slice(2, -2)}</p>);
    } else if (line.trim()) {
      flushList();
      const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      elements.push(<p key={i} className="text-sm leading-relaxed opacity-90 my-0.5" dangerouslySetInnerHTML={{ __html: rendered }} />);
    }
  }
  flushList();
  return <div>{elements}</div>;
}

// ═══════════════════════════════════════════════════════════════════
// QUICK ENTRY MODAL
// ═══════════════════════════════════════════════════════════════════
function QuickEntryModal({ onClose }: { onClose: () => void }) {
  const store = useLageStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [actorId, setActorId] = useState(store.quickEntryActorId);
  const [category, setCategory] = useState<LageCategory>('military');
  const [priority, setPriority] = useState<LagePriority>('medium');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [sourceUrl] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    store.addEntry({
      id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actorId,
      category,
      priority,
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      linkedEntryIds: [],
      timestamp: now,
      updatedAt: now,
      pinned: false,
      archived: false,
      attachments: [],
      location: location.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      sourceLabel: sourceLabel.trim() || undefined,
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <Zap size={16} className="text-blue-400" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold">Schnelleintrag</h2>
              <p className="text-xs opacity-50">Ctrl+Enter zum Speichern</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-hover transition-colors"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto lage-scrollbar">
          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel des Eintrags..."
            className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-transparent border focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:opacity-30"
            style={{ borderColor: 'var(--border)' }}
          />

          {/* Actor + Category + Priority row */}
          <div className="flex gap-3 flex-wrap">
            {/* Actor */}
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1 block">Akteur</label>
              <div className="flex flex-wrap gap-1.5">
                {store.actors.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setActorId(a.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: actorId === a.id ? a.color + '25' : 'var(--hover)',
                      color: actorId === a.id ? a.color : undefined,
                      border: actorId === a.id ? `1px solid ${a.color}40` : '1px solid transparent',
                    }}
                  >
                    {a.icon} {a.shortName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1 block">Kategorie</label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CATEGORY_CONFIG) as LageCategory[]).map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const CatIcon = CAT_ICONS[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: category === cat ? cfg.color + '20' : 'var(--hover)',
                      color: category === cat ? cfg.color : undefined,
                      border: category === cat ? `1px solid ${cfg.color}40` : '1px solid transparent',
                    }}
                  >
                    <CatIcon size={12} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1 block">Priorität</label>
            <div className="flex gap-1.5">
              {(Object.keys(PRIORITY_CONFIG) as LagePriority[]).map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                return (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                    style={{
                      background: priority === p ? cfg.bg : 'var(--hover)',
                      color: priority === p ? cfg.color : undefined,
                      border: priority === p ? `1px solid ${cfg.color}40` : '1px solid transparent',
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1 block">Inhalt (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Lagebeschreibung, Analyse, Details..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl text-sm bg-transparent border focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:opacity-30 resize-y font-mono"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1 block">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {store.tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTags((prev) => prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id])}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: selectedTags.includes(t.id) ? t.color + '25' : 'var(--hover)',
                    color: selectedTags.includes(t.id) ? t.color : undefined,
                    border: selectedTags.includes(t.id) ? `1px solid ${t.color}40` : '1px solid transparent',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location + Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1 block">Ort</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                <MapPin size={12} className="opacity-40 shrink-0" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="z.B. Nordgrenze"
                  className="flex-1 bg-transparent text-xs focus:outline-none placeholder:opacity-30"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1 block">Quelle</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                <ExternalLink size={12} className="opacity-40 shrink-0" />
                <input
                  value={sourceLabel}
                  onChange={(e) => setSourceLabel(e.target.value)}
                  placeholder="z.B. Reuters"
                  className="flex-1 bg-transparent text-xs focus:outline-none placeholder:opacity-30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-[10px] opacity-30 font-mono">
            {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium hover:bg-hover transition-colors">
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="px-5 py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-30"
              style={{ background: title.trim() ? '#3b82f6' : undefined }}
            >
              Speichern
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ENTRY DETAIL PANEL
// ═══════════════════════════════════════════════════════════════════
function EntryDetailPanel({ entry, onClose }: { entry: LageEntry; onClose: () => void }) {
  const store = useLageStore();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title);
  const [editContent, setEditContent] = useState(entry.content);
  const actor = store.actors.find((a) => a.id === entry.actorId);
  const pCfg = PRIORITY_CONFIG[entry.priority];
  const cCfg = CATEGORY_CONFIG[entry.category];
  const CatIcon = CAT_ICONS[entry.category];

  const linkedEntries = entry.linkedEntryIds
    .map((id) => store.entries.find((e) => e.id === id))
    .filter(Boolean) as LageEntry[];

  const handleSave = () => {
    store.updateEntry(entry.id, { title: editTitle, content: editContent });
    setEditing(false);
  };

  return (
    <motion.div
      className="h-full flex flex-col overflow-hidden"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 30, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="shrink-0 px-5 py-4 flex items-start justify-between gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {actor && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
                style={{ background: actor.color + '20', color: actor.color }}>
                {actor.icon} {actor.shortName}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
              style={{ background: pCfg.bg, color: pCfg.color }}>
              {pCfg.label}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
              style={{ background: cCfg.color + '15', color: cCfg.color }}>
              <CatIcon size={10} />
              {cCfg.label}
            </span>
          </div>
          {editing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full font-display text-lg font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none py-1"
            />
          ) : (
            <h2 className="font-display text-lg font-bold leading-tight">{entry.title}</h2>
          )}
          <div className="flex items-center gap-3 mt-2 text-[10px] opacity-40 font-mono">
            <span className="flex items-center gap-1"><Clock size={10} />{formatDateTime(entry.timestamp)}</span>
            {entry.location && <span className="flex items-center gap-1"><MapPin size={10} />{entry.location}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {editing ? (
            <button onClick={handleSave} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
              <Save size={14} />
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:bg-hover transition-colors opacity-60 hover:opacity-100">
              <Edit3 size={14} />
            </button>
          )}
          <button onClick={() => store.togglePin(entry.id)} className={`p-2 rounded-lg transition-colors ${entry.pinned ? 'text-amber-400 bg-amber-400/10' : 'opacity-60 hover:opacity-100 hover:bg-hover'}`}>
            <Pin size={14} />
          </button>
          <button onClick={() => store.toggleArchive(entry.id)} className="p-2 rounded-lg hover:bg-hover transition-colors opacity-60 hover:opacity-100">
            <Archive size={14} />
          </button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-hover transition-colors opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 lage-scrollbar">
        {editing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[200px] px-4 py-3 rounded-xl text-sm bg-transparent border focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y font-mono"
            style={{ borderColor: 'var(--border)' }}
          />
        ) : (
          <div className="prose-invert">{renderMarkdownLite(entry.content)}</div>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tid) => {
              const tag = store.tags.find((t) => t.id === tid);
              if (!tag) return null;
              return (
                <span key={tid} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: tag.color + '20', color: tag.color }}>
                  {tag.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Source */}
        {entry.sourceLabel && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--hover)' }}>
            <ExternalLink size={12} className="opacity-50" />
            <span className="opacity-70">Quelle:</span>
            <span className="font-medium">{entry.sourceLabel}</span>
          </div>
        )}

        {/* Linked entries */}
        {linkedEntries.length > 0 && (
          <div>
            <h4 className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-2 flex items-center gap-1.5">
              <Link2 size={10} />Verknüpfte Einträge
            </h4>
            <div className="space-y-1.5">
              {linkedEntries.map((le) => {
                const la = store.actors.find((a) => a.id === le.actorId);
                return (
                  <button
                    key={le.id}
                    onClick={() => store.setSelectedEntry(le.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-hover transition-colors text-xs"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    {la && <span style={{ color: la.color }}>{la.icon}</span>}
                    <span className="font-medium truncate">{le.title}</span>
                    <span className="ml-auto text-[10px] opacity-40">{relativeTime(le.timestamp)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-3 mt-3 text-[10px] opacity-30 font-mono space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
          <p>ID: {entry.id}</p>
          <p>Erstellt: {formatDateTime(entry.timestamp)}</p>
          <p>Aktualisiert: {formatDateTime(entry.updatedAt)}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ENTRY CARD (used across views)
// ═══════════════════════════════════════════════════════════════════
function EntryCard({ entry, compact = false }: { entry: LageEntry; compact?: boolean }) {
  const store = useLageStore();
  const actor = store.actors.find((a) => a.id === entry.actorId);
  const pCfg = PRIORITY_CONFIG[entry.priority];
  const cCfg = CATEGORY_CONFIG[entry.category];
  const isSelected = store.selectedEntryId === entry.id;
  const CatIcon = CAT_ICONS[entry.category];

  return (
    <motion.button
      layout
      onClick={() => store.setSelectedEntry(isSelected ? null : entry.id)}
      className={`w-full text-left rounded-xl transition-all group relative overflow-hidden ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
      style={{
        background: isSelected ? (actor?.color ?? '#3b82f6') + '12' : 'var(--card)',
        border: `1px solid ${isSelected ? (actor?.color ?? '#3b82f6') + '40' : 'var(--border)'}`,
      }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
    >
      {/* Priority indicator line */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: pCfg.color }} />

      {/* Top row */}
      <div className="flex items-center gap-2 mb-1.5">
        {actor && (
          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ background: actor.color + '18', color: actor.color }}>
            {actor.shortName}
          </span>
        )}
        <span className="flex items-center gap-1 text-[10px] font-medium opacity-60"
          style={{ color: cCfg.color }}>
          <CatIcon size={9} />
          {cCfg.label}
        </span>
        <span className="ml-auto text-[10px] opacity-30 font-mono">{relativeTime(entry.timestamp)}</span>
        {entry.pinned && <Pin size={10} className="text-amber-400" />}
      </div>

      {/* Title */}
      <h3 className={`font-display font-bold leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>{entry.title}</h3>

      {/* Preview + tags */}
      {!compact && (
        <>
          <p className="text-xs opacity-50 mt-1 line-clamp-2 leading-relaxed">
            {entry.content.replace(/[#*\-]/g, '').slice(0, 120)}...
          </p>
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.tags.slice(0, 3).map((tid) => {
                const tag = store.tags.find((t) => t.id === tid);
                if (!tag) return null;
                return (
                  <span key={tid} className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider"
                    style={{ background: tag.color + '15', color: tag.color }}>
                    {tag.label}
                  </span>
                );
              })}
              {entry.tags.length > 3 && (
                <span className="px-1.5 py-0.5 rounded text-[8px] opacity-30">+{entry.tags.length - 3}</span>
              )}
            </div>
          )}
        </>
      )}

      {/* Location badge */}
      {entry.location && !compact && (
        <div className="flex items-center gap-1 mt-1.5 text-[10px] opacity-30">
          <MapPin size={9} />{entry.location}
        </div>
      )}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: ACTOR LANES (Swimlanes)
// ═══════════════════════════════════════════════════════════════════
function LanesView({ entries }: { entries: LageEntry[] }) {
  const store = useLageStore();
  const sortedActors = [...store.actors].sort((a, b) => a.order - b.order);
  const actorsWithEntries = sortedActors.filter((a) => entries.some((e) => e.actorId === a.id));

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden lage-scrollbar">
      <div className="flex gap-3 p-4 h-full min-w-max">
        {actorsWithEntries.map((actor) => {
          const actorEntries = entries
            .filter((e) => e.actorId === actor.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          return (
            <div
              key={actor.id}
              className="w-[320px] shrink-0 flex flex-col rounded-2xl overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              {/* Lane Header */}
              <div
                className="shrink-0 px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: `2px solid ${actor.color}40`, background: actor.color + '08' }}
              >
                <span className="text-lg">{actor.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm" style={{ color: actor.color }}>{actor.name}</h3>
                  <span className="text-[10px] opacity-40 font-mono">{actorEntries.length} Einträge</span>
                </div>
                <button
                  onClick={() => { store.setQuickEntryActorId(actor.id); store.setQuickEntryOpen(true); }}
                  className="p-1.5 rounded-lg transition-colors hover:bg-hover"
                  style={{ color: actor.color }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Lane entries */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2 lage-scrollbar">
                <AnimatePresence>
                  {actorEntries.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} />
                  ))}
                </AnimatePresence>
                {actorEntries.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 opacity-20">
                    <StickyNote size={24} />
                    <span className="text-xs mt-2">Keine Einträge</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: TIMELINE
// ═══════════════════════════════════════════════════════════════════
function TimelineView({ entries }: { entries: LageEntry[] }) {
  const store = useLageStore();
  const sorted = [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Group by day
  const grouped = useMemo(() => {
    const groups: Record<string, LageEntry[]> = {};
    for (const e of sorted) {
      const day = new Date(e.timestamp).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      if (!groups[day]) groups[day] = [];
      groups[day].push(e);
    }
    return Object.entries(groups);
  }, [sorted]);

  return (
    <div className="flex-1 overflow-y-auto p-6 lage-scrollbar">
      <div className="max-w-3xl mx-auto relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-[2px]" style={{ background: 'var(--border)' }} />

        {grouped.map(([day, dayEntries]) => (
          <div key={day} className="mb-8">
            {/* Day label */}
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10"
                style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}>
                <Calendar size={16} className="opacity-50" />
              </div>
              <h3 className="font-display text-sm font-bold opacity-60">{day}</h3>
            </div>

            {/* Day entries */}
            <div className="space-y-3 ml-[19px] pl-8 relative">
              {dayEntries.map((entry) => {
                const actor = store.actors.find((a) => a.id === entry.actorId);
                return (
                  <div key={entry.id} className="relative">
                    {/* Dot connector */}
                    <div className="absolute -left-8 top-4 w-4 h-[2px]" style={{ background: actor?.color ?? 'var(--border)' }} />
                    <div className="absolute -left-[13px] top-[11px] w-[10px] h-[10px] rounded-full z-10"
                      style={{ background: actor?.color ?? 'var(--muted)', border: '2px solid var(--surface)' }} />

                    <EntryCard entry={entry} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: TREE / HIERARCHY
// ═══════════════════════════════════════════════════════════════════
function TreeView({ entries }: { entries: LageEntry[] }) {
  const store = useLageStore();
  const [expandedActors, setExpandedActors] = useState<Set<string>>(new Set(store.actors.map((a) => a.id)));
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const toggleActor = (id: string) => {
    setExpandedActors((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCat = (key: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Group: Actor -> Category -> Entries
  const tree = useMemo(() => {
    const map: Record<string, Record<string, LageEntry[]>> = {};
    for (const e of entries) {
      if (!map[e.actorId]) map[e.actorId] = {};
      if (!map[e.actorId][e.category]) map[e.actorId][e.category] = [];
      map[e.actorId][e.category].push(e);
    }
    return map;
  }, [entries]);

  return (
    <div className="flex-1 overflow-y-auto p-6 lage-scrollbar">
      <div className="max-w-4xl mx-auto space-y-2">
        {store.actors.filter((a) => tree[a.id]).map((actor) => {
          const isExpanded = expandedActors.has(actor.id);
          const totalEntries = Object.values(tree[actor.id]).flat().length;

          return (
            <div key={actor.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {/* Actor node */}
              <button
                onClick={() => toggleActor(actor.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-hover transition-colors"
                style={{ background: actor.color + '06' }}
              >
                {isExpanded ? <ChevronDown size={14} style={{ color: actor.color }} /> : <ChevronRight size={14} style={{ color: actor.color }} />}
                <span className="text-lg">{actor.icon}</span>
                <span className="font-display font-bold text-sm" style={{ color: actor.color }}>{actor.name}</span>
                <span className="ml-auto text-[10px] opacity-30 font-mono">{totalEntries} Einträge</span>
              </button>

              {/* Categories */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    {(Object.keys(tree[actor.id]) as LageCategory[]).map((cat) => {
                      const catKey = `${actor.id}-${cat}`;
                      const catExpanded = expandedCats.has(catKey);
                      const catCfg = CATEGORY_CONFIG[cat];
                      const CatIcon = CAT_ICONS[cat];
                      const catEntries = tree[actor.id][cat].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                      return (
                        <div key={cat}>
                          <button
                            onClick={() => toggleCat(catKey)}
                            className="w-full flex items-center gap-3 px-8 py-2 hover:bg-hover transition-colors text-xs"
                          >
                            {catExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            <CatIcon size={12} />
                            <span className="font-medium" style={{ color: catCfg.color }}>{catCfg.label}</span>
                            <span className="opacity-30 font-mono ml-1">{catEntries.length}</span>
                          </button>

                          <AnimatePresence>
                            {catExpanded && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden px-4 pb-2"
                              >
                                <div className="space-y-1.5 pl-8">
                                  {catEntries.map((entry) => (
                                    <EntryCard key={entry.id} entry={entry} compact />
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: CARDS GRID
// ═══════════════════════════════════════════════════════════════════
function CardsView({ entries }: { entries: LageEntry[] }) {
  const sorted = [...entries].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 lage-scrollbar">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <AnimatePresence>
          {sorted.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: MATRIX (Actor × Category)
// ═══════════════════════════════════════════════════════════════════
function MatrixView({ entries }: { entries: LageEntry[] }) {
  const store = useLageStore();
  const actors = store.actors.filter((a) => entries.some((e) => e.actorId === a.id));
  const categories = (Object.keys(CATEGORY_CONFIG) as LageCategory[]).filter((c) => entries.some((e) => e.category === c));

  return (
    <div className="flex-1 overflow-auto p-6 lage-scrollbar">
      <div className="min-w-max">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="p-2 text-left text-[10px] uppercase tracking-widest opacity-40 font-bold sticky left-0 z-10" style={{ background: 'var(--bg)' }}>
                Akteur / Kategorie
              </th>
              {categories.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const CatIcon = CAT_ICONS[cat];
                return (
                  <th key={cat} className="p-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <CatIcon size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {actors.map((actor) => (
              <tr key={actor.id}>
                <td className="p-2 sticky left-0 z-10" style={{ background: 'var(--bg)' }}>
                  <div className="flex items-center gap-2">
                    <span>{actor.icon}</span>
                    <span className="text-xs font-bold" style={{ color: actor.color }}>{actor.shortName}</span>
                  </div>
                </td>
                {categories.map((cat) => {
                  const cellEntries = entries.filter((e) => e.actorId === actor.id && e.category === cat);
                  const maxPriority = cellEntries.length
                    ? cellEntries.reduce((max, e) => {
                        const order = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
                        return order[e.priority] > order[max.priority] ? e : max;
                      })
                    : null;

                  return (
                    <td key={cat} className="p-1.5">
                      {cellEntries.length > 0 ? (
                        <button
                          onClick={() => store.setSelectedEntry(maxPriority!.id)}
                          className="w-full min-w-[100px] px-3 py-2 rounded-lg text-center transition-all hover:scale-105"
                          style={{
                            background: PRIORITY_CONFIG[maxPriority!.priority].bg,
                            border: `1px solid ${PRIORITY_CONFIG[maxPriority!.priority].color}30`,
                          }}
                        >
                          <span className="text-lg font-display font-black" style={{ color: PRIORITY_CONFIG[maxPriority!.priority].color }}>
                            {cellEntries.length}
                          </span>
                          <p className="text-[9px] opacity-50 truncate mt-0.5">{maxPriority!.title}</p>
                        </button>
                      ) : (
                        <div className="w-full min-w-[100px] px-3 py-2 rounded-lg text-center opacity-10">
                          <span className="text-xs">—</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════
function exportAsMarkdown(entries: LageEntry[], actors: LageActor[], tags: { id: string; label: string }[]): string {
  const now = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  let md = `# Lagefortschreibung\n\n> Exportiert: ${now}\n\n---\n\n`;

  // Group by actor
  for (const actor of actors) {
    const actorEntries = entries.filter((e) => e.actorId === actor.id);
    if (actorEntries.length === 0) continue;

    md += `## ${actor.icon} ${actor.name} (${actor.shortName})\n\n`;

    for (const entry of actorEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())) {
      const pCfg = PRIORITY_CONFIG[entry.priority];
      const cCfg = CATEGORY_CONFIG[entry.category];
      const entryTags = entry.tags.map((tid) => tags.find((t) => t.id === tid)?.label).filter(Boolean);

      md += `### ${entry.title}\n\n`;
      md += `| Feld | Wert |\n|---|---|\n`;
      md += `| Priorität | ${pCfg.label} |\n`;
      md += `| Kategorie | ${cCfg.label} |\n`;
      md += `| Zeitstempel | ${formatDateTime(entry.timestamp)} |\n`;
      if (entry.location) md += `| Ort | ${entry.location} |\n`;
      if (entry.sourceLabel) md += `| Quelle | ${entry.sourceLabel} |\n`;
      if (entryTags.length) md += `| Tags | ${entryTags.join(', ')} |\n`;
      md += `\n${entry.content}\n\n---\n\n`;
    }
  }

  return md;
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT: LAGEFORTSCHREIBUNG
// ═══════════════════════════════════════════════════════════════════
export default function Lagefortschreibung() {
  const store = useLageStore();
  const [showExport, setShowExport] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let result = store.entries;
    if (!store.showArchived) result = result.filter((e) => !e.archived);
    if (store.filterActors.length) result = result.filter((e) => store.filterActors.includes(e.actorId));
    if (store.filterCategories.length) result = result.filter((e) => store.filterCategories.includes(e.category));
    if (store.filterPriorities.length) result = result.filter((e) => store.filterPriorities.includes(e.priority));
    if (store.filterTags.length) result = result.filter((e) => e.tags.some((t) => store.filterTags.includes(t)));
    if (store.searchQuery.trim()) {
      const q = store.searchQuery.toLowerCase();
      result = result.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.sourceLabel?.toLowerCase().includes(q)
      );
    }
    if (store.timeRange) {
      const start = new Date(store.timeRange.start).getTime();
      const end = new Date(store.timeRange.end).getTime();
      result = result.filter((e) => {
        const t = new Date(e.timestamp).getTime();
        return t >= start && t <= end;
      });
    }
    return result;
  }, [store.entries, store.showArchived, store.filterActors, store.filterCategories, store.filterPriorities, store.filterTags, store.searchQuery, store.timeRange]);

  const selectedEntry = store.selectedEntryId ? store.entries.find((e) => e.id === store.selectedEntryId) : null;
  const activeFilterCount = store.filterActors.length + store.filterCategories.length + store.filterPriorities.length + store.filterTags.length;

  const VIEW_MODES: { id: LageViewMode; label: string; icon: JSX.Element }[] = [
    { id: 'lanes', label: 'Akteur-Spuren', icon: <Rows3 size={14} /> },
    { id: 'timeline', label: 'Zeitstrahl', icon: <Calendar size={14} /> },
    { id: 'tree', label: 'Baumansicht', icon: <GitBranch size={14} /> },
    { id: 'cards', label: 'Karten', icon: <LayoutGrid size={14} /> },
    { id: 'matrix', label: 'Matrix', icon: <Grid3x3 size={14} /> },
  ];

  const handleExportMarkdown = () => {
    const md = exportAsMarkdown(filteredEntries, store.actors, store.tags);
    downloadFile(md, `lagefortschreibung-${new Date().toISOString().slice(0, 10)}.md`, 'text/markdown;charset=utf-8');
    setShowExport(false);
  };

  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      actors: store.actors,
      tags: store.tags,
      entries: filteredEntries,
    };
    downloadFile(JSON.stringify(data, null, 2), `lagefortschreibung-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    setShowExport(false);
  };

  const handleExportCSV = () => {
    const header = 'Zeitstempel;Akteur;Kategorie;Priorität;Titel;Ort;Quelle;Tags\n';
    const rows = filteredEntries.map((e) => {
      const actor = store.actors.find((a) => a.id === e.actorId);
      const tags = e.tags.map((tid) => store.tags.find((t) => t.id === tid)?.label).filter(Boolean).join(', ');
      return `"${formatDateTime(e.timestamp)}";"${actor?.name ?? ''}";"${CATEGORY_CONFIG[e.category].label}";"${PRIORITY_CONFIG[e.priority].label}";"${e.title}";"${e.location ?? ''}";"${e.sourceLabel ?? ''}";"${tags}"`;
    }).join('\n');
    downloadFile('\uFEFF' + header + rows, `lagefortschreibung-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
    setShowExport(false);
  };

  // Stats
  const stats = useMemo(() => ({
    total: filteredEntries.length,
    critical: filteredEntries.filter((e) => e.priority === 'critical').length,
    high: filteredEntries.filter((e) => e.priority === 'high').length,
    pinned: filteredEntries.filter((e) => e.pinned).length,
    actors: new Set(filteredEntries.map((e) => e.actorId)).size,
  }), [filteredEntries]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* ═══ TOP BAR ═══ */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        {/* Title + Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
            <Zap size={18} className="text-red-400" />
          </div>
          <div>
            <h1 className="font-display text-sm font-black tracking-tight uppercase">Lagefortschreibung</h1>
            <div className="flex items-center gap-3 text-[10px] font-mono opacity-40">
              <span>{stats.total} Einträge</span>
              {stats.critical > 0 && <span className="text-red-400">{stats.critical} kritisch</span>}
              {stats.high > 0 && <span className="text-orange-400">{stats.high} hoch</span>}
              <span>{stats.actors} Akteure</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
            <Search size={13} className="opacity-30 shrink-0" />
            <input
              value={store.searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
              placeholder="Suche in Einträgen..."
              className="flex-1 bg-transparent text-xs focus:outline-none placeholder:opacity-30"
            />
            {store.searchQuery && (
              <button onClick={() => store.setSearchQuery('')} className="p-0.5 rounded hover:bg-hover transition-colors">
                <X size={12} className="opacity-40" />
              </button>
            )}
          </div>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-xl shrink-0" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
          {VIEW_MODES.map((vm) => (
            <button
              key={vm.id}
              onClick={() => store.setViewMode(vm.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${store.viewMode === vm.id ? 'bg-card shadow-sm text-main' : 'text-muted hover:text-main'}`}
              title={vm.label}
            >
              {vm.icon}
              <span className="hidden xl:inline">{vm.label}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Filter */}
          <button
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${filterPanelOpen || activeFilterCount > 0 ? 'bg-blue-500/15 text-blue-400' : 'hover:bg-hover'}`}
            style={{ border: `1px solid ${activeFilterCount > 0 ? 'rgba(59,130,246,0.3)' : 'var(--border)'}` }}
          >
            <Filter size={12} />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[8px]">{activeFilterCount}</span>
            )}
          </button>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-hover"
              style={{ border: '1px solid var(--border)' }}
            >
              <Download size={12} />
              Export
            </button>

            <AnimatePresence>
              {showExport && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-2xl z-50"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <button onClick={handleExportMarkdown} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium hover:bg-hover transition-colors">
                    <FileText size={13} /> Markdown (.md)
                  </button>
                  <button onClick={handleExportJSON} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium hover:bg-hover transition-colors">
                    <Copy size={13} /> JSON (.json)
                  </button>
                  <button onClick={handleExportCSV} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium hover:bg-hover transition-colors">
                    <BarChart3 size={13} /> CSV (.csv)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* New Entry */}
          <button
            onClick={() => store.setQuickEntryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:brightness-110"
            style={{ background: '#ef4444' }}
          >
            <Plus size={12} />
            Neuer Eintrag
          </button>
        </div>
      </div>

      {/* ═══ FILTER BAR (collapsible) ═══ */}
      <AnimatePresence>
        {filterPanelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <div className="px-4 py-3 space-y-3">
              {/* Actors */}
              <div>
                <label className="text-[9px] uppercase tracking-widest opacity-30 font-bold mb-1.5 block">Akteure</label>
                <div className="flex flex-wrap gap-1.5">
                  {store.actors.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => store.toggleFilterActor(a.id)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                      style={{
                        background: store.filterActors.includes(a.id) ? a.color + '25' : 'var(--hover)',
                        color: store.filterActors.includes(a.id) ? a.color : undefined,
                        border: store.filterActors.includes(a.id) ? `1px solid ${a.color}40` : '1px solid transparent',
                      }}
                    >
                      {a.icon} {a.shortName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories + Priorities row */}
              <div className="flex gap-6">
                <div>
                  <label className="text-[9px] uppercase tracking-widest opacity-30 font-bold mb-1.5 block">Kategorien</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(CATEGORY_CONFIG) as LageCategory[]).map((cat) => {
                      const cfg = CATEGORY_CONFIG[cat];
                      return (
                        <button
                          key={cat}
                          onClick={() => store.toggleFilterCategory(cat)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all"
                          style={{
                            background: store.filterCategories.includes(cat) ? cfg.color + '20' : 'var(--hover)',
                            color: store.filterCategories.includes(cat) ? cfg.color : undefined,
                            border: store.filterCategories.includes(cat) ? `1px solid ${cfg.color}40` : '1px solid transparent',
                          }}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-widest opacity-30 font-bold mb-1.5 block">Priorität</label>
                  <div className="flex gap-1.5">
                    {(Object.keys(PRIORITY_CONFIG) as LagePriority[]).map((p) => {
                      const cfg = PRIORITY_CONFIG[p];
                      return (
                        <button
                          key={p}
                          onClick={() => store.toggleFilterPriority(p)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                          style={{
                            background: store.filterPriorities.includes(p) ? cfg.bg : 'var(--hover)',
                            color: store.filterPriorities.includes(p) ? cfg.color : undefined,
                            border: store.filterPriorities.includes(p) ? `1px solid ${cfg.color}40` : '1px solid transparent',
                          }}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[9px] uppercase tracking-widest opacity-30 font-bold mb-1.5 block">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {store.tags.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => store.toggleFilterTag(t.id)}
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all"
                      style={{
                        background: store.filterTags.includes(t.id) ? t.color + '25' : 'var(--hover)',
                        color: store.filterTags.includes(t.id) ? t.color : undefined,
                        border: store.filterTags.includes(t.id) ? `1px solid ${t.color}40` : '1px solid transparent',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={store.clearFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <X size={10} />
                  Alle Filter zurücksetzen ({activeFilterCount})
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {store.viewMode === 'lanes' && <LanesView entries={filteredEntries} />}
          {store.viewMode === 'timeline' && <TimelineView entries={filteredEntries} />}
          {store.viewMode === 'tree' && <TreeView entries={filteredEntries} />}
          {store.viewMode === 'cards' && <CardsView entries={filteredEntries} />}
          {store.viewMode === 'matrix' && <MatrixView entries={filteredEntries} />}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedEntry && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 overflow-hidden"
              style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
            >
              <EntryDetailPanel
                key={selectedEntry.id}
                entry={selectedEntry}
                onClose={() => store.setSelectedEntry(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ BOTTOM STATUS BAR ═══ */}
      <div
        className="shrink-0 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono opacity-40"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-4">
          <span>{filteredEntries.length} von {store.entries.length} Einträgen sichtbar</span>
          {activeFilterCount > 0 && <span className="text-blue-400">{activeFilterCount} Filter aktiv</span>}
        </div>
        <div className="flex items-center gap-4">
          <span>Ansicht: {VIEW_MODES.find((v) => v.id === store.viewMode)?.label}</span>
          <span>Stand: {new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* ═══ QUICK ENTRY MODAL ═══ */}
      <AnimatePresence>
        {store.quickEntryOpen && <QuickEntryModal onClose={() => store.setQuickEntryOpen(false)} />}
      </AnimatePresence>

      {/* ═══ GLOBAL STYLES ═══ */}
      <style>{`
        .lage-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .lage-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .lage-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        .lage-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--muted); }
      `}</style>
    </div>
  );
}
