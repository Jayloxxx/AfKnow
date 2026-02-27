import { useState, useMemo, useRef } from 'react';
import { Calendar, Filter, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { useRegion } from '../../context/RegionContext';
import {
  getEntriesForRegion, KB_CATEGORY_CONFIG, KB_STATUS_CONFIG, KB_SEVERITY_CONFIG,
  type KBEntry, type KBCategory,
} from '../../data/knowledgeBase';
import { useKnowledgeStore } from '../../store/useKnowledgeStore';

interface TimelineRow {
  entry: KBEntry;
  events: { date: string; title: string; description: string; x: number }[];
  startX: number;
  endX: number;
  color: string;
}

export default function GlobalTimeline() {
  const region = useRegion();
  const store = useKnowledgeStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const entries = useMemo(() => getEntriesForRegion(region.id), [region.id]);
  const [filterCategory, setFilterCategory] = useState<KBCategory | 'all'>('all');
  const [zoomLevel, setZoomLevel] = useState(1); // pixels per month
  const [hoveredEvent, setHoveredEvent] = useState<{ entry: KBEntry; event: KBEntry['timeline'][0]; x: number; y: number } | null>(null);

  // Compute time range
  const { minYear, maxYear, filteredEntries } = useMemo(() => {
    let filtered = entries.filter(e => e.timeline.length > 0 || e.startYear);
    if (filterCategory !== 'all') {
      filtered = filtered.filter(e => e.category === filterCategory);
    }

    let min = 2100;
    let max = 1900;
    for (const e of filtered) {
      if (e.startYear && e.startYear < min) min = e.startYear;
      if (e.endYear && e.endYear > max) max = e.endYear;
      for (const ev of e.timeline) {
        const year = parseInt(ev.date.slice(0, 4));
        if (year < min) min = year;
        if (year > max) max = year;
      }
    }
    if (min > max) { min = 2000; max = 2025; }
    min = Math.max(1990, min - 1);
    max = Math.min(2026, max + 1);

    return { minYear: min, maxYear: max, filteredEntries: filtered };
  }, [entries, filterCategory]);

  const totalMonths = (maxYear - minYear) * 12;
  const pxPerMonth = 8 * zoomLevel;
  const totalWidth = totalMonths * pxPerMonth;

  const dateToX = (dateStr: string): number => {
    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(5, 7) || '1') - 1;
    return ((year - minYear) * 12 + month) * pxPerMonth;
  };

  // Build rows
  const rows: TimelineRow[] = useMemo(() => {
    return filteredEntries
      .sort((a, b) => (a.startYear ?? 2020) - (b.startYear ?? 2020))
      .map((entry) => {
        const catCfg = KB_CATEGORY_CONFIG[entry.category];
        const events = entry.timeline.map(ev => ({
          ...ev,
          x: dateToX(ev.date),
        }));
        const startX = entry.startYear ? ((entry.startYear - minYear) * 12) * pxPerMonth : (events[0]?.x ?? 0);
        const endX = entry.endYear
          ? ((entry.endYear - minYear) * 12) * pxPerMonth
          : Math.max(startX + 40, events.length > 0 ? events[events.length - 1].x + 20 : startX + 40, ((2025 - minYear) * 12) * pxPerMonth);
        return { entry, events, startX, endX, color: catCfg.color };
      });
  }, [filteredEntries, minYear, pxPerMonth]);

  const handleEntryClick = (id: string) => {
    store.selectEntry(id);
    store.setViewMode('entries');
  };

  const rowHeight = 48;
  const headerHeight = 50;
  const totalHeight = headerHeight + rows.length * rowHeight + 40;

  // Year markers
  const yearMarkers = [];
  for (let y = minYear; y <= maxYear; y++) {
    yearMarkers.push({ year: y, x: (y - minYear) * 12 * pxPerMonth });
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-main">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-theme bg-surface">
        <Calendar size={14} style={{ color: region.accentHex }} />
        <h2 className="font-display font-bold text-sm text-main mr-3">Globale Zeitleiste</h2>

        <div className="flex items-center gap-1">
          <Filter size={11} className="text-muted" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as KBCategory | 'all')}
            className="text-[10px] bg-card border border-theme rounded px-1.5 py-1 text-main"
          >
            <option value="all">Alle Kategorien</option>
            {(Object.keys(KB_CATEGORY_CONFIG) as KBCategory[]).map(cat => (
              <option key={cat} value={cat}>{KB_CATEGORY_CONFIG[cat].label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        <button onClick={() => setZoomLevel(z => Math.min(4, z + 0.3))} className="w-7 h-7 rounded bg-card border border-theme flex items-center justify-center text-muted hover:text-main">
          <ZoomIn size={13} />
        </button>
        <span className="text-[10px] font-mono text-muted w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={() => setZoomLevel(z => Math.max(0.3, z - 0.3))} className="w-7 h-7 rounded bg-card border border-theme flex items-center justify-center text-muted hover:text-main">
          <ZoomOut size={13} />
        </button>
        <button onClick={() => setZoomLevel(1)} className="w-7 h-7 rounded bg-card border border-theme flex items-center justify-center text-muted hover:text-main">
          <Maximize2 size={13} />
        </button>

        <div className="text-[10px] text-muted font-mono ml-2">
          {minYear}–{maxYear} · {filteredEntries.length} Einträge
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left labels */}
        <div className="w-52 shrink-0 border-r border-theme bg-surface overflow-y-auto">
          <div className="h-[50px] border-b border-theme flex items-center px-3">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Eintrag</span>
          </div>
          {rows.map((row) => (
            <button
              key={row.entry.id}
              onClick={() => handleEntryClick(row.entry.id)}
              className="w-full h-[48px] flex items-center gap-2 px-3 border-b border-theme/30 hover:bg-hover/50 transition-colors text-left"
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-main truncate">{row.entry.title}</div>
                <div className="text-[8px] text-muted font-mono">
                  {row.entry.startYear ?? '—'}{row.entry.endYear ? `–${row.entry.endYear}` : row.entry.startYear ? '–heute' : ''}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Scrollable timeline area */}
        <div ref={scrollRef} className="flex-1 overflow-auto relative">
          <div style={{ width: totalWidth + 100, minHeight: totalHeight }} className="relative">
            {/* Year grid */}
            {yearMarkers.map(({ year, x }) => (
              <div key={year} className="absolute top-0" style={{ left: x, height: totalHeight }}>
                <div className="h-[50px] flex items-end pb-1 px-1">
                  <span className="text-[10px] font-mono font-bold" style={{ color: region.accentHex }}>{year}</span>
                </div>
                <div className="w-px h-full bg-theme/20" />
              </div>
            ))}

            {/* Month grid (subtle) */}
            {zoomLevel >= 1.5 && yearMarkers.map(({ year, x }) => (
              Array.from({ length: 11 }, (_, m) => {
                const mx = x + (m + 1) * pxPerMonth;
                return (
                  <div key={`${year}-${m}`} className="absolute top-[50px] w-px bg-theme/8" style={{ left: mx, height: totalHeight - 50 }} />
                );
              })
            ))}

            {/* Rows */}
            {rows.map((row, ri) => {
              const y = headerHeight + ri * rowHeight;
              const statusCfg = KB_STATUS_CONFIG[row.entry.status];
              return (
                <div key={row.entry.id} className="absolute left-0 right-0" style={{ top: y, height: rowHeight }}>
                  {/* Row background */}
                  <div className={`absolute inset-0 ${ri % 2 === 0 ? 'bg-transparent' : 'bg-hover/20'}`} />

                  {/* Duration bar */}
                  <div
                    className="absolute rounded-full cursor-pointer hover:opacity-90 transition-opacity"
                    style={{
                      left: row.startX,
                      width: Math.max(8, row.endX - row.startX),
                      top: 14,
                      height: 20,
                      background: `linear-gradient(90deg, color-mix(in srgb, ${row.color} 25%, transparent), color-mix(in srgb, ${row.color} 12%, transparent))`,
                      borderLeft: `3px solid ${row.color}`,
                    }}
                    onClick={() => handleEntryClick(row.entry.id)}
                  >
                    {/* Severity indicator on bar */}
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-px">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className="w-1 h-2 rounded-sm" style={{
                          background: s <= row.entry.severity ? KB_SEVERITY_CONFIG[row.entry.severity as 1|2|3|4|5].color : 'transparent',
                          opacity: s <= row.entry.severity ? 0.6 : 0,
                        }} />
                      ))}
                    </div>

                    {/* Status dot */}
                    <div className="absolute -right-1 -top-1 w-3 h-3 rounded-full border border-surface" style={{ background: statusCfg.color }} title={statusCfg.label} />
                  </div>

                  {/* Events */}
                  {row.events.map((ev, ei) => (
                    <div
                      key={`${ev.date}-${ei}`}
                      className="absolute cursor-pointer group"
                      style={{ left: ev.x - 4, top: 10 }}
                      onMouseEnter={(e) => setHoveredEvent({ entry: row.entry, event: ev, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHoveredEvent(null)}
                      onClick={() => handleEntryClick(row.entry.id)}
                    >
                      <div
                        className="w-[9px] h-[9px] rounded-full border-2 transition-transform group-hover:scale-150"
                        style={{ borderColor: row.color, background: 'var(--surface)' }}
                      />
                      {/* Tiny stem */}
                      <div className="w-px h-5 mx-auto" style={{ background: `color-mix(in srgb, ${row.color} 40%, transparent)` }} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Tooltip */}
          {hoveredEvent && (
            <div
              className="fixed z-50 p-3 rounded-xl bg-surface/95 backdrop-blur-sm border border-theme shadow-xl w-64 pointer-events-none"
              style={{ left: hoveredEvent.x + 12, top: hoveredEvent.y - 10 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: KB_CATEGORY_CONFIG[hoveredEvent.entry.category].color }} />
                <span className="text-[10px] font-bold text-main">{hoveredEvent.entry.title}</span>
              </div>
              <div className="text-[10px] font-mono font-bold mb-1" style={{ color: region.accentHex }}>
                {hoveredEvent.event.date}
              </div>
              <div className="text-[10px] font-semibold text-main mb-0.5">{hoveredEvent.event.title}</div>
              <p className="text-[9px] text-muted leading-relaxed">{hoveredEvent.event.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-2 border-t border-theme bg-surface">
        <div className="text-[9px] font-bold text-muted uppercase tracking-wider">Kategorien:</div>
        {(Object.keys(KB_CATEGORY_CONFIG) as KBCategory[]).map(cat => (
          <div key={cat} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: KB_CATEGORY_CONFIG[cat].color }} />
            <span className="text-[9px] text-muted">{KB_CATEGORY_CONFIG[cat].label}</span>
          </div>
        ))}
        <div className="flex-1" />
        <div className="text-[9px] text-muted">Klick auf Eintrag → Detail</div>
      </div>
    </div>
  );
}
