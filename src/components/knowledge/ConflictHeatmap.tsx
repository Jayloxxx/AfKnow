import { useState, useMemo } from 'react';
import { MapPin, Filter, Info } from 'lucide-react';
import { useRegion } from '../../context/RegionContext';
import {
  getEntriesForRegion, KB_CATEGORY_CONFIG, KB_SEVERITY_CONFIG,
  type KBEntry, type KBCategory,
} from '../../data/knowledgeBase';
import { useKnowledgeStore } from '../../store/useKnowledgeStore';

// Simplified country positions for the heatmap (relative x,y in 0-100 space)
const AFRICA_POSITIONS: Record<string, { x: number; y: number; name: string }> = {
  DZ: { x: 35, y: 15, name: 'Algerien' },
  AO: { x: 38, y: 62, name: 'Angola' },
  BJ: { x: 33, y: 42, name: 'Benin' },
  BW: { x: 46, y: 72, name: 'Botswana' },
  BF: { x: 28, y: 38, name: 'Burkina Faso' },
  BI: { x: 52, y: 56, name: 'Burundi' },
  CM: { x: 38, y: 44, name: 'Kamerun' },
  CF: { x: 43, y: 44, name: 'Zentralafrika' },
  TD: { x: 42, y: 32, name: 'Tschad' },
  CD: { x: 48, y: 56, name: 'DR Kongo' },
  DJ: { x: 62, y: 38, name: 'Dschibuti' },
  EG: { x: 50, y: 14, name: 'Ägypten' },
  GQ: { x: 36, y: 48, name: 'Äquatorialguinea' },
  ER: { x: 58, y: 30, name: 'Eritrea' },
  SZ: { x: 52, y: 76, name: 'Eswatini' },
  ET: { x: 58, y: 38, name: 'Äthiopien' },
  GA: { x: 36, y: 50, name: 'Gabun' },
  GM: { x: 18, y: 36, name: 'Gambia' },
  GH: { x: 30, y: 42, name: 'Ghana' },
  GN: { x: 20, y: 38, name: 'Guinea' },
  GW: { x: 18, y: 38, name: 'Guinea-Bissau' },
  CI: { x: 24, y: 42, name: 'Elfenbeinküste' },
  KE: { x: 58, y: 50, name: 'Kenia' },
  LS: { x: 50, y: 78, name: 'Lesotho' },
  LR: { x: 20, y: 42, name: 'Liberia' },
  LY: { x: 40, y: 14, name: 'Libyen' },
  MG: { x: 66, y: 68, name: 'Madagaskar' },
  MW: { x: 55, y: 64, name: 'Malawi' },
  ML: { x: 26, y: 30, name: 'Mali' },
  MR: { x: 18, y: 26, name: 'Mauretanien' },
  MA: { x: 24, y: 12, name: 'Marokko' },
  MZ: { x: 56, y: 68, name: 'Mosambik' },
  NA: { x: 40, y: 72, name: 'Namibia' },
  NE: { x: 34, y: 30, name: 'Niger' },
  NG: { x: 34, y: 40, name: 'Nigeria' },
  CG: { x: 40, y: 52, name: 'Kongo' },
  RW: { x: 52, y: 54, name: 'Ruanda' },
  SN: { x: 18, y: 34, name: 'Senegal' },
  SL: { x: 18, y: 40, name: 'Sierra Leone' },
  SO: { x: 64, y: 42, name: 'Somalia' },
  ZA: { x: 48, y: 80, name: 'Südafrika' },
  SS: { x: 50, y: 42, name: 'Südsudan' },
  SD: { x: 52, y: 28, name: 'Sudan' },
  TZ: { x: 56, y: 58, name: 'Tansania' },
  TG: { x: 32, y: 42, name: 'Togo' },
  TN: { x: 36, y: 10, name: 'Tunesien' },
  UG: { x: 54, y: 50, name: 'Uganda' },
  ZM: { x: 50, y: 64, name: 'Sambia' },
  ZW: { x: 50, y: 70, name: 'Simbabwe' },
};

const MIDEAST_POSITIONS: Record<string, { x: number; y: number; name: string }> = {
  AF: { x: 82, y: 32, name: 'Afghanistan' },
  BH: { x: 62, y: 55, name: 'Bahrain' },
  CY: { x: 30, y: 25, name: 'Zypern' },
  EG: { x: 22, y: 52, name: 'Ägypten' },
  IR: { x: 70, y: 38, name: 'Iran' },
  IQ: { x: 55, y: 35, name: 'Irak' },
  IL: { x: 32, y: 45, name: 'Israel' },
  JO: { x: 36, y: 45, name: 'Jordanien' },
  KW: { x: 58, y: 48, name: 'Kuwait' },
  LB: { x: 33, y: 35, name: 'Libanon' },
  LY: { x: 15, y: 48, name: 'Libyen' },
  OM: { x: 68, y: 58, name: 'Oman' },
  PK: { x: 85, y: 42, name: 'Pakistan' },
  PS: { x: 32, y: 43, name: 'Palästina' },
  QA: { x: 62, y: 53, name: 'Katar' },
  SA: { x: 52, y: 55, name: 'Saudi-Arabien' },
  SY: { x: 40, y: 30, name: 'Syrien' },
  TR: { x: 38, y: 18, name: 'Türkei' },
  AE: { x: 65, y: 58, name: 'VAE' },
  YE: { x: 55, y: 68, name: 'Jemen' },
  SD: { x: 28, y: 62, name: 'Sudan' },
  SO: { x: 42, y: 75, name: 'Somalia' },
  TN: { x: 12, y: 30, name: 'Tunesien' },
};

export default function ConflictHeatmap() {
  const region = useRegion();
  const store = useKnowledgeStore();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<KBCategory | 'all'>('all');

  const entries = useMemo(() => {
    let all = getEntriesForRegion(region.id);
    if (filterCategory !== 'all') all = all.filter(e => e.category === filterCategory);
    return all;
  }, [region.id, filterCategory]);

  const positions = region.id === 'africa' ? AFRICA_POSITIONS : MIDEAST_POSITIONS;

  // Compute heat per country
  const countryHeat = useMemo(() => {
    const heat: Record<string, { total: number; maxSeverity: number; entries: KBEntry[]; count: number }> = {};
    for (const entry of entries) {
      for (const cid of entry.countryIds) {
        if (!heat[cid]) heat[cid] = { total: 0, maxSeverity: 0, entries: [], count: 0 };
        heat[cid].total += entry.severity;
        heat[cid].maxSeverity = Math.max(heat[cid].maxSeverity, entry.severity);
        heat[cid].entries.push(entry);
        heat[cid].count++;
      }
    }
    return heat;
  }, [entries]);

  const maxHeat = Math.max(1, ...Object.values(countryHeat).map(h => h.total));

  const getHeatColor = (total: number, maxSev: number): string => {
    const intensity = total / maxHeat;
    if (maxSev >= 5) return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`; // red
    if (maxSev >= 4) return `rgba(249, 115, 22, ${0.3 + intensity * 0.7})`; // orange
    if (maxSev >= 3) return `rgba(245, 158, 11, ${0.3 + intensity * 0.7})`; // amber
    if (maxSev >= 2) return `rgba(234, 179, 8, ${0.2 + intensity * 0.5})`; // yellow
    return `rgba(34, 197, 94, ${0.2 + intensity * 0.4})`; // green
  };

  const handleCountryClick = (countryId: string) => {
    const h = countryHeat[countryId];
    if (h && h.entries.length > 0) {
      store.selectEntry(h.entries[0].id);
      store.setViewMode('entries');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-main">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-theme bg-surface">
        <MapPin size={14} style={{ color: region.accentHex }} />
        <h2 className="font-display font-bold text-sm text-main mr-3">Konflikt-Heatmap</h2>

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
        <div className="text-[10px] text-muted font-mono">
          {Object.keys(countryHeat).length} betroffene Länder · {entries.length} Einträge
        </div>
      </div>

      {/* Heatmap */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map area */}
        <div className="flex-1 relative p-6">
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ maxHeight: 'calc(100vh - 160px)' }}>
            {/* Background */}
            <rect width="100" height="100" rx="2" fill="color-mix(in srgb, var(--card) 50%, transparent)" stroke="var(--border)" strokeWidth="0.3" />

            {/* Grid */}
            {Array.from({ length: 10 }, (_, i) => (
              <g key={i}>
                <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="var(--border)" strokeWidth="0.1" strokeOpacity="0.3" />
                <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="var(--border)" strokeWidth="0.1" strokeOpacity="0.3" />
              </g>
            ))}

            {/* Country dots */}
            {Object.entries(positions).map(([cid, pos]) => {
              const heat = countryHeat[cid];
              const hasHeat = heat && heat.total > 0;
              const isHovered = hoveredCountry === cid;
              const baseR = hasHeat ? 1.5 + (heat.total / maxHeat) * 3 : 1;
              const color = hasHeat ? getHeatColor(heat.total, heat.maxSeverity) : 'var(--border)';

              return (
                <g key={cid}>
                  {/* Heat glow */}
                  {hasHeat && (
                    <circle
                      cx={pos.x} cy={pos.y}
                      r={baseR * 2.5}
                      fill={color}
                      opacity={isHovered ? 0.4 : 0.15}
                    />
                  )}
                  {/* Main dot */}
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={isHovered ? baseR * 1.5 : baseR}
                    fill={hasHeat ? color : 'var(--text-muted)'}
                    opacity={hasHeat ? 1 : 0.3}
                    stroke={isHovered ? region.accentHex : 'none'}
                    strokeWidth={0.3}
                    onMouseEnter={() => setHoveredCountry(cid)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => handleCountryClick(cid)}
                    style={{ cursor: hasHeat ? 'pointer' : 'default' }}
                  />
                  {/* Label */}
                  {(isHovered || (hasHeat && heat.total >= maxHeat * 0.4)) && (
                    <text
                      x={pos.x} y={pos.y - baseR - 1.5}
                      textAnchor="middle"
                      fill="var(--text-main)"
                      fontSize={isHovered ? 2.5 : 2}
                      fontFamily="var(--font-display)"
                      fontWeight={isHovered ? '700' : '500'}
                    >
                      {pos.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Region label */}
            <text x="50" y="96" textAnchor="middle" fill="var(--text-muted)" fontSize="2.5" fontFamily="var(--font-display)" fontWeight="700" opacity="0.3">
              {region.name}
            </text>
          </svg>

          {/* Hovered country detail card */}
          {hoveredCountry && countryHeat[hoveredCountry] && (() => {
            const pos = positions[hoveredCountry];
            const heat = countryHeat[hoveredCountry];
            if (!pos || !heat) return null;
            return (
              <div className="absolute z-20 p-3 rounded-xl bg-surface/95 backdrop-blur-sm border border-theme shadow-xl w-56"
                style={{ left: '50%', top: '20px', transform: 'translateX(-50%)' }}>
                <div className="font-display font-bold text-xs text-main mb-1">{pos.name} ({hoveredCountry})</div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="text-center p-1.5 rounded bg-card/50">
                    <div className="text-sm font-bold font-mono" style={{ color: region.accentHex }}>{heat.count}</div>
                    <div className="text-[8px] text-muted">Einträge</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-card/50">
                    <div className="text-sm font-bold font-mono" style={{ color: KB_SEVERITY_CONFIG[heat.maxSeverity as 1|2|3|4|5]?.color ?? '#6b7280' }}>{heat.maxSeverity}</div>
                    <div className="text-[8px] text-muted">Max. Schwere</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-card/50">
                    <div className="text-sm font-bold font-mono text-main">{heat.total}</div>
                    <div className="text-[8px] text-muted">Gesamt</div>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {heat.entries.slice(0, 4).map(e => (
                    <div key={e.id} className="flex items-center gap-1.5 text-[9px]">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: KB_CATEGORY_CONFIG[e.category].color }} />
                      <span className="text-muted truncate">{e.title}</span>
                      <span className="ml-auto font-mono font-bold" style={{ color: KB_SEVERITY_CONFIG[e.severity].color }}>{e.severity}</span>
                    </div>
                  ))}
                  {heat.entries.length > 4 && (
                    <div className="text-[8px] text-muted text-center">+{heat.entries.length - 4} weitere</div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Side panel: ranking */}
        <div className="w-64 shrink-0 border-l border-theme bg-surface overflow-y-auto p-3 space-y-3">
          <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Länder-Ranking</div>

          {Object.entries(countryHeat)
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([cid, heat], i) => {
              const pos = positions[cid];
              return (
                <button
                  key={cid}
                  onClick={() => handleCountryClick(cid)}
                  onMouseEnter={() => setHoveredCountry(cid)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg border border-theme/30 hover:border-theme hover:bg-hover/30 transition-all text-left"
                >
                  <div className="text-[10px] font-mono font-bold text-muted w-5 text-right">#{i + 1}</div>
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                    style={{ background: getHeatColor(heat.total, heat.maxSeverity), color: 'white' }}
                  >
                    {heat.maxSeverity}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-main">{pos?.name ?? cid}</div>
                    <div className="text-[8px] text-muted">{heat.count} Einträge · Summe {heat.total}</div>
                  </div>
                  {/* Mini bar */}
                  <div className="w-12 h-2 rounded-full bg-hover/50 overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${(heat.total / maxHeat) * 100}%`,
                      background: getHeatColor(heat.total, heat.maxSeverity),
                    }} />
                  </div>
                </button>
              );
            })}

          {Object.keys(countryHeat).length === 0 && (
            <div className="text-xs text-muted text-center py-8">Keine Daten verfügbar.</div>
          )}

          {/* Legend */}
          <div className="p-2.5 rounded-xl bg-card/50 border border-theme/50 mt-4">
            <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-2">Schweregrad-Skala</div>
            <div className="space-y-1">
              {([5, 4, 3, 2, 1] as const).map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className="w-4 h-3 rounded" style={{ background: KB_SEVERITY_CONFIG[s].color }} />
                  <span className="text-[9px] text-muted">{s}/5 — {KB_SEVERITY_CONFIG[s].label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-card/50 border border-theme/50 flex items-start gap-1.5">
            <Info size={10} className="text-muted shrink-0 mt-0.5" />
            <span className="text-[9px] text-muted leading-relaxed">
              Größe = kumulative Schwere aller Einträge. Farbe = höchster Schweregrad im Land.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
