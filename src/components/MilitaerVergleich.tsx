import { useState, useMemo } from 'react';
import {
  Swords, ChevronDown, ChevronRight, Shield, Plane, Anchor, Rocket,
  Factory, BookOpen, Users, DollarSign, Award, AtomIcon, Target,
  ExternalLink, Zap, Globe2, BarChart3, ArrowRightLeft,
  Crosshair, Cpu, Radar, AlertTriangle,
  Handshake, Crown, Gauge, Package, ArrowUpRight, ArrowDownLeft,
  Star, CircleDot, Hexagon, Activity, Flame, Waypoints,
} from 'lucide-react';
import {
  GLOBAL_PROFILES,
  type GlobalMilitaryProfile,
  type NuclearStatus,
  type CompareWeaponSystem,
} from '../data/globalMilitaryCompare';

/* ─── Palette ──────────────────────────────────────────────────── */
const PAL = ['#3b82f6', '#f97316', '#10b981', '#c084fc'];

/* ─── Helpers ──────────────────────────────────────────────────── */
const fmt = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)} Mrd`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} Mio`;
  return n.toLocaleString('de-DE');
};
const fmtB = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)} Mrd`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)} Mio`;
  return `$${n.toLocaleString('de-DE')}`;
};

/* ─── Region grouping ──────────────────────────────────────────── */
const REGIONS = [
  { label: 'Naher Osten', ids: ['IR', 'IL', 'SA', 'TR', 'AE', 'EG', 'IQ', 'JO'] },
  { label: 'Afrika', ids: ['NG', 'ET', 'ZA', 'DZ', 'MA', 'KE'] },
  { label: 'Großmächte', ids: ['US', 'RU', 'CN', 'GB', 'FR'] },
];

const PRESETS = [
  { label: 'Iran vs. Israel', ids: ['IR', 'IL'] },
  { label: 'Nahost', ids: ['IR', 'SA', 'TR', 'IL'] },
  { label: 'Großmächte', ids: ['US', 'RU', 'CN'] },
  { label: 'NATO', ids: ['US', 'GB', 'FR', 'TR'] },
  { label: 'Golf', ids: ['SA', 'AE', 'EG'] },
  { label: 'Afrika', ids: ['NG', 'DZ', 'ZA', 'EG'] },
  { label: 'Nuklear', ids: ['US', 'RU', 'CN', 'GB'] },
];

const CAT_ICON: Record<string, typeof Shield> = {
  Landstreitkräfte: Shield,
  Luftwaffe: Plane,
  Marine: Anchor,
  Raketenstreitkräfte: Rocket,
};

const CAT_ACCENT: Record<string, string> = {
  Landstreitkräfte: '#22c55e',
  Luftwaffe: '#38bdf8',
  Marine: '#6366f1',
  Raketenstreitkräfte: '#ef4444',
};

type View = 'compare' | 'dossier';
const byId = (id: string) => GLOBAL_PROFILES.find(p => p.id === id)!;

/* ═══════════════════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════════════════ */
export default function MilitaerVergleich() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['IR', 'IL']);
  const [view, setView] = useState<View>('compare');
  const [dossierId, setDossierId] = useState<string>('IR');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['Landstreitkräfte']));

  const selected = useMemo(
    () => selectedIds.map(byId).filter(Boolean) as GlobalMilitaryProfile[],
    [selectedIds],
  );

  const toggle = (id: string) =>
    setSelectedIds(p =>
      p.includes(id) ? p.filter(x => x !== id) : p.length >= 4 ? p : [...p, id],
    );

  const openDossier = (id: string) => {
    setDossierId(id);
    setView('dossier');
  };

  const toggleCat = (c: string) =>
    setExpandedCats(p => {
      const n = new Set(p);
      n.has(c) ? n.delete(c) : n.add(c);
      return n;
    });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-main">
      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-theme bg-surface">
        <div className="flex items-center h-12 px-5 gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent-500) 15%, transparent)' }}>
            <Swords size={14} className="text-accent-400" />
          </div>
          <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            Militärvergleich
          </span>

          {/* View toggle */}
          <div className="ml-3 flex rounded-lg overflow-hidden border border-theme">
            <button
              onClick={() => setView('compare')}
              className="px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all"
              style={view === 'compare'
                ? { background: 'var(--accent-500)', color: '#fff' }
                : { color: 'var(--muted)' }}
            >
              <ArrowRightLeft size={13} /> Vergleich
            </button>
            <button
              onClick={() => { setView('dossier'); if (!dossierId && selectedIds[0]) setDossierId(selectedIds[0]); }}
              className="px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all"
              style={view === 'dossier'
                ? { background: 'var(--accent-500)', color: '#fff' }
                : { color: 'var(--muted)' }}
            >
              <BookOpen size={13} /> Dossier
            </button>
          </div>

          <div className="flex-1" />
          <span className="text-[10px] hidden sm:block" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            IISS 2024 · GFP · SIPRI · FAS
          </span>
        </div>

        {/* Selector row */}
        <div className="flex items-center gap-2 px-5 pb-2.5 overflow-x-auto scrollbar-thin">
          {PRESETS.map(pr => {
            const active = JSON.stringify([...selectedIds].sort()) === JSON.stringify([...pr.ids].sort());
            return (
              <button
                key={pr.label}
                onClick={() => setSelectedIds(pr.ids.slice(0, 4))}
                className="shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap"
                style={active
                  ? { background: 'var(--accent-500)', color: '#fff' }
                  : { background: 'var(--card)', color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                {pr.label}
              </button>
            );
          })}

          <div className="w-px h-5 shrink-0 mx-1" style={{ background: 'var(--border)' }} />

          {selected.map((p, i) => (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className="shrink-0 flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{ background: `${PAL[i]}15`, color: PAL[i], border: `1.5px solid ${PAL[i]}35` }}
            >
              <span className="text-base leading-none">{p.flagEmoji}</span>
              {p.name}
              <span className="text-[10px] opacity-50" style={{ fontFamily: 'var(--font-mono)' }}>#{p.gfpRank}</span>
            </button>
          ))}

          {/* Add country dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setSelectorOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
              style={{ background: 'var(--card)', color: 'var(--muted)', border: '1px dashed var(--border)' }}
            >
              + Land {selected.length < 4 && `(${selected.length}/4)`}
            </button>

            {selectorOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSelectorOpen(false)} />
                <div
                  className="absolute top-full left-0 mt-1 z-50 rounded-xl border p-3 w-[340px] max-h-[420px] overflow-y-auto scrollbar-thin shadow-2xl"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  {REGIONS.map(r => (
                    <div key={r.label} className="mb-3 last:mb-0">
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
                        {r.label}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {r.ids.map(id => {
                          const p = byId(id);
                          if (!p) return null;
                          const isOn = selectedIds.includes(id);
                          const ci = selectedIds.indexOf(id);
                          return (
                            <button
                              key={id}
                              onClick={() => toggle(id)}
                              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left"
                              style={isOn
                                ? { background: `${PAL[ci]}12`, color: PAL[ci], border: `1px solid ${PAL[ci]}30` }
                                : { color: 'var(--text)', background: 'var(--card)', border: '1px solid var(--border)' }}
                            >
                              <span className="text-lg">{p.flagEmoji}</span>
                              {p.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {selected.length === 0 ? (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--muted)' }}>
            <div className="text-center space-y-3">
              <Swords size={40} className="mx-auto opacity-15" />
              <p className="text-base font-medium">Wähle mindestens ein Land</p>
              <p className="text-sm opacity-60">Klicke auf ein Preset oder wähle Länder manuell</p>
            </div>
          </div>
        ) : view === 'compare' ? (
          <CompareView selected={selected} expanded={expandedCats} toggleCat={toggleCat} onDossier={openDossier} />
        ) : (
          <DossierView profile={byId(dossierId) ?? selected[0]} allSelected={selected} onSwitch={id => setDossierId(id)} />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPARE VIEW
   ═══════════════════════════════════════════════════════════════════ */
function CompareView({
  selected, expanded, toggleCat, onDossier,
}: {
  selected: GlobalMilitaryProfile[];
  expanded: Set<string>;
  toggleCat: (c: string) => void;
  onDossier: (id: string) => void;
}) {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-8">
      {/* ── COUNTRY HERO CARDS ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(selected.length, 4)}, 1fr)` }}>
        {selected.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onDossier(p.id)}
            className="group rounded-2xl border p-5 text-left transition-all hover:scale-[1.01]"
            style={{
              background: `linear-gradient(135deg, ${PAL[i]}08 0%, transparent 60%)`,
              borderColor: `${PAL[i]}25`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{p.flagEmoji}</span>
              <div>
                <div className="text-lg font-bold group-hover:underline" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                  {p.name}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  GFP Rang #{p.gfpRank} · {p.armedForcesName.length > 30 ? p.armedForcesName.slice(0, 28) + '…' : p.armedForcesName}
                </div>
              </div>
            </div>

            {/* Key stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatTile icon={Users} label="Aktive" value={fmt(p.activePersonnel)} color={PAL[i]} />
              <StatTile icon={DollarSign} label="Budget" value={fmtB(p.militaryBudget)} color={PAL[i]} />
              <StatTile icon={Shield} label="Reserve" value={fmt(p.reservePersonnel)} color={PAL[i]} />
              <StatTile icon={BarChart3} label="% BIP" value={`${p.budgetPercentGDP.toFixed(1)}%`} color={PAL[i]} />
            </div>

            {/* Bottom badges */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <NukBadge n={p.nuclear} />
              <ProjBadge level={p.doctrine.forceProjectionCapability} />
              {p.conscription && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: 'rgba(245,158,11,.1)', color: '#fbbf24' }}>
                  <Users size={10} /> Wehrpflicht
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ── COMPARISON BARS ── */}
      <ComparisonBars selected={selected} />

      {/* ── FORCE STRUCTURE ── */}
      <div>
        <SectionHead icon={Crosshair} label="Kräftestruktur" desc="Waffensysteme nach Teilstreitkraft" />
        <div className="space-y-3 mt-5">
          {['Landstreitkräfte', 'Luftwaffe', 'Marine', 'Raketenstreitkräfte'].map(cat => {
            const Icon = CAT_ICON[cat] ?? Shield;
            const accent = CAT_ACCENT[cat] ?? '#94a3b8';
            const isOpen = expanded.has(cat);

            const totals = selected.map(p => {
              const fc = p.forceStructure.find(f => f.category === cat);
              return fc ? fc.systems.reduce((s, sys) => s + sys.quantity, 0) : 0;
            });
            const maxT = Math.max(...totals, 1);

            return (
              <div
                key={cat}
                className="rounded-2xl overflow-hidden border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <button
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center gap-3 px-5 py-4 transition-colors hover:brightness-110"
                  style={{ background: `${accent}06` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
                    <Icon size={16} style={{ color: accent }} />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-bold block" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                      {cat}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                      {cat === 'Landstreitkräfte' && 'Panzer, Schützenpanzer, Artillerie, Raketenwerfer'}
                      {cat === 'Luftwaffe' && 'Kampfjets, Transporter, Helikopter, Drohnen'}
                      {cat === 'Marine' && 'Fregatten, U-Boote, Patrouillenboote, Träger'}
                      {cat === 'Raketenstreitkräfte' && 'Ballistische Raketen, Marschflugkörper, Luftabwehr'}
                    </span>
                  </div>

                  {/* Country totals */}
                  <div className="flex items-center gap-3 mr-2">
                    {selected.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-1.5">
                        <span className="text-base">{p.flagEmoji}</span>
                        <span className="text-sm font-bold" style={{ color: PAL[i], fontFamily: 'var(--font-mono)' }}>
                          {fmt(totals[i])}
                        </span>
                      </div>
                    ))}
                  </div>

                  {isOpen
                    ? <ChevronDown size={18} style={{ color: 'var(--muted)' }} />
                    : <ChevronRight size={18} style={{ color: 'var(--muted)' }} />}
                </button>

                {/* Summary bars */}
                <div className="px-5 pb-4 space-y-2">
                  {selected.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-sm w-8 text-center">{p.flagEmoji}</span>
                      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.04)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(totals[i] / maxT) * 100}%`, background: PAL[i] }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-16 text-right" style={{ color: PAL[i], fontFamily: 'var(--font-mono)' }}>
                        {fmt(totals[i])}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Expanded weapon systems */}
                {isOpen && (
                  <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${selected.length}, 1fr)` }}>
                      {selected.map((p, i) => {
                        const fc = p.forceStructure.find(f => f.category === cat);
                        return (
                          <div
                            key={p.id}
                            className="p-5"
                            style={i > 0 ? { borderLeft: '1px solid var(--border)' } : undefined}
                          >
                            <div className="flex items-center gap-2.5 mb-3">
                              <span className="text-xl">{p.flagEmoji}</span>
                              <span className="text-sm font-bold" style={{ color: PAL[i], fontFamily: 'var(--font-display)' }}>
                                {p.name}
                              </span>
                            </div>

                            {fc?.qualityNote && (
                              <div className="flex items-start gap-2 mb-4 p-2.5 rounded-lg" style={{ background: `${accent}08` }}>
                                <AlertTriangle size={12} className="shrink-0 mt-0.5" style={{ color: accent }} />
                                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                                  {fc.qualityNote}
                                </p>
                              </div>
                            )}

                            <div className="space-y-1">
                              {fc?.systems.map((sys, j) => (
                                <SysRow key={j} sys={sys} color={PAL[i]} accent={accent} />
                              ))}
                              {(!fc || fc.systems.length === 0) && (
                                <p className="text-xs italic py-2" style={{ color: 'var(--muted)' }}>Keine Daten verfügbar</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DOCTRINE & STRATEGY ── */}
      <div>
        <SectionHead icon={BookOpen} label="Doktrin & Strategie" desc="Strategische Ausrichtung, Allianzen und Fähigkeiten" />
        <div className="grid gap-5 mt-5" style={{ gridTemplateColumns: `repeat(${Math.min(selected.length, 2)}, 1fr)` }}>
          {selected.map((p, i) => (
            <DoctrineCard key={p.id} profile={p} color={PAL[i]} />
          ))}
        </div>
      </div>

      {/* ── DEFENSE INDUSTRY ── */}
      <div>
        <SectionHead icon={Factory} label="Rüstungsindustrie" desc="Eigenständigkeit, Schlüsselsysteme und Handelspartner" />
        <div className="grid gap-5 mt-5" style={{ gridTemplateColumns: `repeat(${Math.min(selected.length, 2)}, 1fr)` }}>
          {selected.map((p, i) => (
            <IndustryCard key={p.id} profile={p} color={PAL[i]} />
          ))}
        </div>
      </div>

      {/* Source footer */}
      <div className="flex items-center gap-2 text-[11px] pt-2 pb-6" style={{ color: 'var(--muted)' }}>
        <ExternalLink size={11} />
        Quellen: IISS Military Balance 2024, GlobalFirepower 2024, SIPRI, FAS Nuclear Notebook
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPARISON BARS — visual side-by-side for key metrics
   ═══════════════════════════════════════════════════════════════════ */
function ComparisonBars({ selected }: { selected: GlobalMilitaryProfile[] }) {
  const metrics: { key: string; label: string; icon: typeof Users; extract: (p: GlobalMilitaryProfile) => number; format: (n: number) => string; desc: string }[] = [
    { key: 'active', label: 'Aktive Soldaten', icon: Users, extract: p => p.activePersonnel, format: fmt, desc: 'Aktive Streitkräfte im Dienst' },
    { key: 'reserve', label: 'Reservisten', icon: Shield, extract: p => p.reservePersonnel, format: fmt, desc: 'Ausgebildete Reservekräfte' },
    { key: 'budget', label: 'Militärbudget', icon: DollarSign, extract: p => p.militaryBudget, format: fmtB, desc: 'Jährliche Verteidigungsausgaben' },
    { key: 'gdp', label: 'Budget % BIP', icon: BarChart3, extract: p => p.budgetPercentGDP, format: n => `${n.toFixed(1)}%`, desc: 'Anteil am Bruttoinlandsprodukt' },
    { key: 'para', label: 'Paramilitär', icon: Flame, extract: p => p.paramilitaryPersonnel, format: fmt, desc: 'Paramilitärische Kräfte' },
  ];

  return (
    <div>
      <SectionHead icon={BarChart3} label="Vergleich auf einen Blick" desc="Direkte Gegenüberstellung der wichtigsten Kennzahlen" />
      <div className="mt-5 space-y-4">
        {metrics.map(m => {
          const values = selected.map(p => m.extract(p));
          const maxV = Math.max(...values, 1);
          const Icon = m.icon;

          return (
            <div key={m.key} className="rounded-xl border p-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,.04)' }}>
                  <Icon size={14} style={{ color: 'var(--muted)' }} />
                </div>
                <div>
                  <span className="text-sm font-bold block" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                    {m.label}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{m.desc}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {selected.map((p, i) => {
                  const pct = (values[i] / maxV) * 100;
                  const isMax = values[i] === maxV;
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-lg w-8 text-center">{p.flagEmoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{p.name}</span>
                          <span className="text-sm font-bold" style={{ color: PAL[i], fontFamily: 'var(--font-mono)' }}>
                            {m.format(values[i])}
                            {isMax && selected.length > 1 && (
                              <Crown size={11} className="inline ml-1 -mt-0.5" style={{ color: '#fbbf24' }} />
                            )}
                          </span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.04)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${PAL[i]}cc, ${PAL[i]})` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DOSSIER VIEW — Single country deep-dive
   ═══════════════════════════════════════════════════════════════════ */
function DossierView({
  profile: p,
  allSelected,
  onSwitch,
}: {
  profile: GlobalMilitaryProfile;
  allSelected: GlobalMilitaryProfile[];
  onSwitch: (id: string) => void;
}) {
  const color = PAL[0];

  return (
    <div className="max-w-[960px] mx-auto px-6 py-6 space-y-8">
      {/* Country switcher */}
      {allSelected.length > 1 && (
        <div className="flex items-center gap-2">
          {allSelected.map((c, i) => (
            <button
              key={c.id}
              onClick={() => onSwitch(c.id)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={c.id === p.id
                ? { background: `${PAL[i]}15`, color: PAL[i], border: `1.5px solid ${PAL[i]}35` }
                : { color: 'var(--muted)', border: '1.5px solid transparent', background: 'var(--card)' }}
            >
              <span className="text-lg">{c.flagEmoji}</span> {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Hero Banner */}
      <div
        className="rounded-2xl p-6 border relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}0a 0%, transparent 60%)`, borderColor: `${color}20` }}
      >
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,.5) 39px, rgba(255,255,255,.5) 40px),
                            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,.5) 39px, rgba(255,255,255,.5) 40px)`,
        }} />

        <div className="relative flex items-start gap-5">
          <span className="text-6xl">{p.flagEmoji}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
              {p.name}
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              {p.armedForcesName}
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <DossierStat icon={Award} label="GFP-Rang" value={`#${p.gfpRank}`} color={color} />
              <DossierStat icon={Users} label="Aktive Soldaten" value={fmt(p.activePersonnel)} color={color} />
              <DossierStat icon={Shield} label="Reserve" value={fmt(p.reservePersonnel)} color={color} />
              <DossierStat icon={DollarSign} label="Budget" value={fmtB(p.militaryBudget)} color={color} />
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <NukBadge n={p.nuclear} />
              <ProjBadge level={p.doctrine.forceProjectionCapability} />
              {p.conscription && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{ background: 'rgba(245,158,11,.1)', color: '#fbbf24' }}>
                  <Users size={11} /> Wehrpflicht {p.conscriptionNote && `(${p.conscriptionNote})`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nuclear detail */}
      {(p.nuclear.hasWeapons || p.nuclear.suspected) && p.nuclear.note && (
        <div className="rounded-xl border p-5" style={{
          background: p.nuclear.hasWeapons ? 'rgba(239,68,68,.04)' : 'rgba(249,115,22,.04)',
          borderColor: p.nuclear.hasWeapons ? 'rgba(239,68,68,.15)' : 'rgba(249,115,22,.15)',
        }}>
          <div className="flex items-center gap-2.5 mb-3">
            <AtomIcon size={16} style={{ color: p.nuclear.hasWeapons ? '#f87171' : '#fb923c' }} />
            <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              Nuklearstatus
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', opacity: 0.85 }}>
            {p.nuclear.note}
          </p>
          {p.nuclear.deliverySystems && p.nuclear.deliverySystems.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {p.nuclear.deliverySystems.map(ds => (
                <span key={ds} className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{ background: 'rgba(239,68,68,.08)', color: '#f87171' }}>
                  <Rocket size={10} /> {ds}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Force Structure */}
      <div>
        <SectionHead icon={Crosshair} label="Streitkräfte" desc="Detaillierte Auflistung der Waffensysteme" />
        <div className="mt-5 space-y-4">
          {p.forceStructure.map(fc => {
            const Icon = CAT_ICON[fc.category] ?? Shield;
            const accent = CAT_ACCENT[fc.category] ?? '#94a3b8';
            const total = fc.systems.reduce((s, sys) => s + sys.quantity, 0);

            return (
              <div
                key={fc.category}
                className="rounded-2xl border overflow-hidden"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3 px-5 py-4" style={{ background: `${accent}06` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
                    <Icon size={16} style={{ color: accent }} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                      {fc.category}
                    </span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: accent, fontFamily: 'var(--font-mono)' }}>
                    {fmt(total)} Systeme
                  </span>
                </div>

                {fc.qualityNote && (
                  <div className="mx-5 mt-3 flex items-start gap-2 p-3 rounded-lg" style={{ background: `${accent}08` }}>
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" style={{ color: accent }} />
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{fc.qualityNote}</p>
                  </div>
                )}

                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                    {fc.systems.map((sys, j) => (
                      <SysRow key={j} sys={sys} color={color} accent={accent} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Doctrine */}
      <div>
        <SectionHead icon={BookOpen} label="Doktrin & Strategie" desc="Strategische Ausrichtung und Fähigkeitsprofil" />
        <div className="mt-5">
          <DoctrineCard profile={p} color={color} />
        </div>
      </div>

      {/* Industry */}
      <div>
        <SectionHead icon={Factory} label="Rüstungsindustrie" desc="Eigenständigkeit und Handelspartner" />
        <div className="mt-5">
          <IndustryCard profile={p} color={color} />
        </div>
      </div>

      {/* Source */}
      <div className="flex items-center gap-2 text-[11px] pb-4" style={{ color: 'var(--muted)' }}>
        <ExternalLink size={11} />
        <a href={p.overviewSource} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {p.overviewSourceLabel}
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function SectionHead({ icon: Icon, label, desc }: { icon: typeof Shield; label: string; desc?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent-500) 12%, transparent)' }}>
        <Icon size={16} className="text-accent-400" />
      </div>
      <div className="flex-1">
        <span className="text-sm font-bold block" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          {label}
        </span>
        {desc && <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{desc}</span>}
      </div>
      <div className="flex-1 h-px max-w-[200px]" style={{ background: 'var(--border)' }} />
    </div>
  );
}

function StatTile({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,.02)' }}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} style={{ color: 'var(--muted)' }} />
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{label}</span>
      </div>
      <span className="text-base font-bold" style={{ color, fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

function DossierStat({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)' }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} style={{ color }} />
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{label}</span>
      </div>
      <span className="text-xl font-bold block" style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

function NukBadge({ n }: { n: NuclearStatus }) {
  if (n.hasWeapons && !n.suspected)
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
        style={{ background: 'rgba(239,68,68,.1)', color: '#f87171' }}>
        <AtomIcon size={12} /> {n.warheadsEstimate?.toLocaleString('de-DE')} Sprengköpfe
      </span>
    );
  if (n.suspected)
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
        style={{ background: 'rgba(249,115,22,.1)', color: '#fb923c' }}>
        <AlertTriangle size={11} /> Nuklear vermutet {n.warheadsEstimate ? `(~${n.warheadsEstimate})` : ''}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(34,197,94,.08)', color: '#4ade80' }}>
      <CircleDot size={10} /> Keine Nuklearwaffen
    </span>
  );
}

function ProjBadge({ level }: { level: string }) {
  const m: Record<string, { bg: string; fg: string; icon: typeof Globe2 }> = {
    Keine: { bg: 'rgba(100,116,139,.08)', fg: '#94a3b8', icon: CircleDot },
    Begrenzt: { bg: 'rgba(245,158,11,.08)', fg: '#fbbf24', icon: Target },
    Regional: { bg: 'rgba(59,130,246,.08)', fg: '#60a5fa', icon: Radar },
    Global: { bg: 'rgba(168,85,247,.08)', fg: '#c084fc', icon: Globe2 },
  };
  const s = m[level] ?? m.Keine;
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.fg }}>
      <Icon size={11} /> {level === 'Keine' ? 'Keine Projektion' : `${level}e Projektion`}
    </span>
  );
}

function SysRow({ sys, color, accent }: { sys: CompareWeaponSystem; color: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,.03)' }}>
      <div className="w-1 h-5 rounded-full shrink-0" style={{ background: accent }} />
      <span className="text-xs font-medium flex-1 min-w-0 truncate" style={{ color: 'var(--text)' }}>
        {sys.name}
      </span>
      <span className="text-sm font-bold shrink-0 tabular-nums" style={{ color, fontFamily: 'var(--font-mono)' }}>
        {fmt(sys.quantity)}
      </span>
      <span className="text-[10px] shrink-0 w-[75px] text-right truncate" style={{ color: 'var(--muted)' }}>
        {sys.origin}
      </span>
      {sys.generation && (
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0"
          style={{ background: `${accent}12`, color: accent }}>
          {sys.generation}
        </span>
      )}
    </div>
  );
}

function DoctrineCard({ profile: p, color }: { profile: GlobalMilitaryProfile; color: string }) {
  return (
    <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{p.flagEmoji}</span>
        <div>
          <span className="text-base font-bold block" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            {p.name}
          </span>
          <ProjBadge level={p.doctrine.forceProjectionCapability} />
        </div>
      </div>

      {/* Strategic orientation */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Crosshair size={13} style={{ color }} />
          <FieldLabel>Strategische Ausrichtung</FieldLabel>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', opacity: 0.85 }}>
          {p.doctrine.strategicOrientation}
        </p>
      </div>

      {/* Alliances */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Handshake size={13} style={{ color }} />
          <FieldLabel>Schlüsselallianzen</FieldLabel>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.doctrine.keyAlliances.map(a => (
            <Chip key={a} text={a} bg={`${color}10`} fg={color} icon={Waypoints} />
          ))}
        </div>
      </div>

      {/* Asymmetric */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={13} style={{ color: '#f59e0b' }} />
          <FieldLabel>Asymmetrische Fähigkeiten</FieldLabel>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.doctrine.asymmetricCapabilities.map(a => (
            <Chip key={a} text={a} bg="rgba(255,255,255,.04)" fg="var(--text)" icon={Hexagon} />
          ))}
        </div>
      </div>

      {/* Nuclear posture */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AtomIcon size={13} style={{ color: '#f87171' }} />
          <FieldLabel>Nuklearpostur</FieldLabel>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', opacity: 0.75 }}>
          {p.doctrine.nuclearPosture}
        </p>
      </div>
    </div>
  );
}

function IndustryCard({ profile: p, color }: { profile: GlobalMilitaryProfile; color: string }) {
  return (
    <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{p.flagEmoji}</span>
        <span className="text-base font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          {p.name}
        </span>
      </div>

      {/* Self-sufficiency gauge */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Gauge size={13} style={{ color }} />
          <FieldLabel>Eigenständigkeit</FieldLabel>
          <span className="ml-auto text-xl font-bold" style={{ color, fontFamily: 'var(--font-mono)' }}>
            {p.industry.selfSufficiencyRating}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.04)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${p.industry.selfSufficiencyRating}%`,
              background: `linear-gradient(90deg, ${color}aa, ${color})`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--muted)' }}>
          <span>Importabhängig</span>
          <span>Eigenständig</span>
        </div>
      </div>

      {/* Key domestic systems */}
      {p.industry.keyDomesticSystems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Star size={13} style={{ color }} />
            <FieldLabel>Schlüsselsysteme (Eigenentwicklung)</FieldLabel>
          </div>
          <div className="flex flex-wrap gap-2">
            {p.industry.keyDomesticSystems.map(s => (
              <Chip key={s} text={s} bg={`${color}0c`} fg={color} icon={Cpu} />
            ))}
          </div>
        </div>
      )}

      {/* Import partners */}
      {p.industry.majorImportPartners.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft size={13} style={{ color: '#f87171' }} />
            <FieldLabel>Haupt-Importpartner</FieldLabel>
          </div>
          <div className="flex flex-wrap gap-2">
            {p.industry.majorImportPartners.map(s => (
              <Chip key={s} text={s} bg="rgba(239,68,68,.06)" fg="#f87171" icon={Package} />
            ))}
          </div>
        </div>
      )}

      {/* Export partners */}
      {p.industry.majorExportPartners.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight size={13} style={{ color: '#4ade80' }} />
            <FieldLabel>Haupt-Exportpartner</FieldLabel>
          </div>
          <div className="flex flex-wrap gap-2">
            {p.industry.majorExportPartners.map(s => (
              <Chip key={s} text={s} bg="rgba(34,197,94,.06)" fg="#4ade80" icon={Package} />
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,.02)' }}>
        <Activity size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--muted)' }} />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{p.industry.note}</p>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
      {children}
    </span>
  );
}

function Chip({ text, bg, fg, icon: Icon }: { text: string; bg: string; fg: string; icon?: typeof Shield }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: bg, color: fg }}>
      {Icon && <Icon size={10} />}
      {text}
    </span>
  );
}
