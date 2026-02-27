import { useState } from 'react';
import type { ToolType, Faction, Echelon, ConfidenceLevel } from './types';
import { TOOLS, PRESET_COLORS, MILITARY_SYMBOLS, CATEGORY_LABELS, FACTION_COLORS, FACTION_LABELS, ECHELON_MARKERS, CONFIDENCE_LABELS, WEAPON_RANGES, WEAPON_RANGE_CATEGORIES } from './constants';
import type { MilitaryCategory } from './constants';
import { MilitarySymbolPreview } from './MilitarySymbols';

interface Props {
  activeTool: ToolType;
  setActiveTool: (t: ToolType) => void;
  activeColor: string;
  setActiveColor: (c: string) => void;
  textInput: string;
  setTextInput: (s: string) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  militarySymbol: string;
  setMilitarySymbol: (s: string) => void;
  activeFaction: Faction;
  setActiveFaction: (f: Faction) => void;
  activeEchelon: Echelon;
  setActiveEchelon: (e: Echelon) => void;
  activeConfidence: ConfidenceLevel;
  setActiveConfidence: (c: ConfidenceLevel) => void;
  activeWeaponRange: string;
  setActiveWeaponRange: (id: string) => void;
}

const CATEGORY_ORDER: MilitaryCategory[] = [
  'personnel', 'vehicles', 'air-defense', 'radar', 'ships', 'aircraft', 'nato', 'infrastructure',
];

export default function ToolPalette({
  activeTool, setActiveTool, activeColor, setActiveColor,
  textInput, setTextInput, fontSize, setFontSize,
  militarySymbol, setMilitarySymbol,
  activeFaction, setActiveFaction,
  activeEchelon, setActiveEchelon,
  activeConfidence, setActiveConfidence,
  activeWeaponRange, setActiveWeaponRange,
}: Props) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [showRangePicker, setShowRangePicker] = useState(false);

  const groups = ['basic', 'draw', 'military', 'measure'] as const;
  const groupLabels: Record<string, string> = { basic: 'Basis', draw: 'Zeichnen', military: 'Militär', measure: 'Messen' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
      padding: '4px 10px', borderTop: '1px solid var(--ed-border)',
      background: 'var(--ed-toolbar)', flexShrink: 0, flexWrap: 'wrap', position: 'relative',
    }}>
      {groups.map((group, gi) => (
        <div key={group} style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {gi > 0 && <div style={{ width: 1, height: 28, background: 'var(--ed-border)', margin: '0 5px' }} />}
          <span style={{
            fontSize: 7, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 2,
            writingMode: 'vertical-rl', transform: 'rotate(180deg)', lineHeight: 1,
          }}>{groupLabels[group]}</span>
          {TOOLS.filter((t) => t.group === group).map((t) => {
            const Icon = t.icon;
            const isActive = activeTool === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTool(t.id)} title={`${t.label} (${t.key})`}
                style={{
                  width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: isActive ? `1px solid color-mix(in srgb, var(--accent-hex) 50%, transparent)` : '1px solid transparent',
                  cursor: 'pointer',
                  background: isActive ? 'var(--ed-active)' : 'transparent',
                  color: isActive ? 'var(--accent-hex)' : 'var(--ed-icon)',
                  transition: 'all 0.12s',
                  position: 'relative',
                }}>
                <Icon size={14} />
              </button>
            );
          })}
        </div>
      ))}

      <div style={{ width: 1, height: 24, background: 'var(--ed-border)', margin: '0 6px' }} />

      {/* Contextual options */}
      {(activeTool === 'text' || activeTool === 'callout') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Text eingeben..."
            style={{ width: 130, padding: '4px 8px', borderRadius: 6, background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)', color: 'var(--ed-text)', fontSize: 11, outline: 'none' }}
            onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()} />
          <input type="range" min={8} max={72} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
            style={{ width: 60, accentColor: 'var(--accent-hex)' }} />
          <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', fontFamily: 'monospace', minWidth: 20 }}>{fontSize}</span>
        </div>
      )}

      {/* Military Unit: Symbol Picker + Faction + Echelon + Confidence */}
      {activeTool === 'military-unit' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {/* Symbol Picker */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowSymbolPicker(!showSymbolPicker)}
              style={{
                padding: '4px 8px', borderRadius: 6, background: 'var(--ed-input)',
                border: '1px solid var(--ed-input-border)', color: 'var(--ed-text-secondary)',
                fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <MilitarySymbolPreview symbolId={militarySymbol} size={14} color="var(--ed-icon)" />
              {MILITARY_SYMBOLS.find((s) => s.id === militarySymbol)?.label || 'Einheit'}
            </button>

            {showSymbolPicker && (<>
              <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowSymbolPicker(false)} />
              <div style={{
                position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
                borderRadius: 12, padding: 8, zIndex: 50,
                width: 320, maxHeight: 420, overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}>
                {CATEGORY_ORDER.map((cat) => {
                  const symbols = MILITARY_SYMBOLS.filter((s) => s.category === cat);
                  if (symbols.length === 0) return null;
                  return (
                    <div key={cat}>
                      <div style={{
                        fontSize: 9, color: 'var(--ed-text-dim)', padding: '6px 8px 3px',
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                        fontFamily: 'var(--font-display)',
                      }}>
                        {CATEGORY_LABELS[cat]}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        {symbols.map((s) => {
                          const isSel = militarySymbol === s.id;
                          return (
                            <button key={s.id}
                              onClick={() => { setMilitarySymbol(s.id); setShowSymbolPicker(false); }}
                              style={{
                                padding: '4px 6px', borderRadius: 5, border: 'none', cursor: 'pointer',
                                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
                                background: isSel ? 'var(--ed-active)' : 'transparent',
                                color: isSel ? 'var(--accent-hex)' : 'var(--ed-text-secondary)',
                                fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden',
                                transition: 'background 0.1s',
                              }}>
                              <MilitarySymbolPreview
                                symbolId={s.id}
                                size={20}
                                color={isSel ? 'var(--accent-hex)' : 'var(--ed-icon)'}
                              />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>)}
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--ed-border)' }} />

          {/* Faction Selector */}
          <div style={{ display: 'flex', gap: 2 }}>
            {(Object.keys(FACTION_COLORS) as Faction[]).map(f => (
              <button key={f} onClick={() => setActiveFaction(f)} title={FACTION_LABELS[f]}
                style={{
                  width: 24, height: 24, borderRadius: 4, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: activeFaction === f ? `${FACTION_COLORS[f]}30` : 'transparent',
                  outline: activeFaction === f ? `2px solid ${FACTION_COLORS[f]}` : 'none',
                  outlineOffset: -1,
                }}>
                <div style={{
                  width: 10, height: 10,
                  borderRadius: f === 'hostile' ? 0 : f === 'unknown' ? '50%' : 2,
                  transform: f === 'hostile' ? 'rotate(45deg) scale(0.75)' : undefined,
                  backgroundColor: FACTION_COLORS[f],
                }} />
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--ed-border)' }} />

          {/* Echelon Selector */}
          <select value={activeEchelon}
            onChange={(e) => setActiveEchelon(e.target.value as Echelon)}
            style={{
              background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)',
              borderRadius: 4, padding: '2px 4px', color: 'var(--ed-text-muted)',
              fontSize: 9, outline: 'none', cursor: 'pointer',
            }}>
            {Object.entries(ECHELON_MARKERS).map(([id, m]) => (
              <option key={id} value={id}>{m.symbol} {m.label}</option>
            ))}
          </select>

          {/* Confidence Selector */}
          <select value={activeConfidence}
            onChange={(e) => setActiveConfidence(e.target.value as ConfidenceLevel)}
            style={{
              background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)',
              borderRadius: 4, padding: '2px 4px', color: 'var(--ed-text-muted)',
              fontSize: 9, outline: 'none', cursor: 'pointer',
            }}>
            {Object.entries(CONFIDENCE_LABELS).map(([id, c]) => (
              <option key={id} value={id}>{c.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Weapon Range Picker */}
      {activeTool === 'range-circle' && (
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowRangePicker(!showRangePicker)}
            style={{
              padding: '4px 10px', borderRadius: 6, background: 'var(--ed-input)',
              border: '1px solid var(--ed-input-border)', color: 'var(--ed-text-secondary)',
              fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', border: `2px solid ${WEAPON_RANGES.find(w => w.id === activeWeaponRange)?.color || '#888'}`,
              background: 'transparent',
            }} />
            {WEAPON_RANGES.find(w => w.id === activeWeaponRange)?.label || 'Waffensystem'}
            <span style={{ fontSize: 8, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)' }}>
              {WEAPON_RANGES.find(w => w.id === activeWeaponRange)?.rangeKm || '?'} km
            </span>
          </button>

          {showRangePicker && (<>
            <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowRangePicker(false)} />
            <div style={{
              position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
              borderRadius: 12, padding: 8, zIndex: 50,
              width: 300, maxHeight: 400, overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              {Object.entries(WEAPON_RANGE_CATEGORIES).map(([cat, label]) => {
                const weapons = WEAPON_RANGES.filter(w => w.category === cat);
                if (weapons.length === 0) return null;
                return (
                  <div key={cat}>
                    <div style={{
                      fontSize: 9, color: 'var(--ed-text-dim)', padding: '6px 8px 3px',
                      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {label}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {weapons.map(w => {
                        const isSel = activeWeaponRange === w.id;
                        return (
                          <button key={w.id}
                            onClick={() => { setActiveWeaponRange(w.id); setShowRangePicker(false); }}
                            style={{
                              padding: '4px 8px', borderRadius: 5, border: 'none', cursor: 'pointer',
                              textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                              background: isSel ? 'var(--ed-active)' : 'transparent',
                              color: isSel ? w.color : 'var(--ed-text-secondary)',
                              fontSize: 10,
                              transition: 'background 0.1s',
                            }}>
                            <div style={{
                              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                              border: `2px solid ${w.color}`, background: `${w.color}15`,
                            }} />
                            <span style={{ flex: 1 }}>{w.label}</span>
                            <span style={{
                              fontSize: 9, fontFamily: 'var(--font-mono)',
                              color: isSel ? w.color : 'var(--ed-text-dim)',
                            }}>
                              {w.rangeKm} km
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>)}
        </div>
      )}

      {/* Color picker */}
      <button onClick={() => setShowColorPicker(!showColorPicker)} title="Farbe"
        style={{ width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: 'transparent' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--ed-icon-dim)', backgroundColor: activeColor }} />
      </button>

      {showColorPicker && (<>
        <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowColorPicker(false)} />
        <div style={{
          position: 'absolute', bottom: 46, right: 10, background: 'var(--ed-panel)',
          border: '1px solid var(--ed-border-strong)', borderRadius: 12, padding: 12, zIndex: 50,
          display: 'flex', flexWrap: 'wrap', gap: 6, width: 200,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {PRESET_COLORS.map((clr) => (
            <button key={clr} onClick={() => { setActiveColor(clr); setShowColorPicker(false); }}
              style={{
                width: 26, height: 26, borderRadius: 4, cursor: 'pointer',
                border: activeColor === clr ? '2px solid var(--ed-text)' : '2px solid transparent',
                backgroundColor: clr,
              }} />
          ))}
          <input type="color" value={activeColor} onChange={(e) => setActiveColor(e.target.value)}
            style={{ width: '100%', height: 28, cursor: 'pointer', borderRadius: 4 }} />
        </div>
      </>)}
    </div>
  );
}
