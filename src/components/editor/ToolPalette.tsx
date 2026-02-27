import { useState, useRef, useEffect } from 'react';
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

const GROUP_META: Record<string, { label: string }> = {
  basic: { label: 'Basis' },
  draw: { label: 'Zeichnen' },
  military: { label: 'Militär' },
  measure: { label: 'Messen' },
};

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
  const [tooltipInfo, setTooltipInfo] = useState<{ label: string; key: string; rect: DOMRect } | null>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current); };
  }, []);

  const handleToolHover = (label: string, key: string, e: React.MouseEvent) => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    tooltipTimeout.current = setTimeout(() => {
      setTooltipInfo({ label, key, rect });
    }, 350);
  };

  const handleToolLeave = () => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    setTooltipInfo(null);
  };

  const groups = ['basic', 'draw', 'military', 'measure'] as const;

  return (
    <div className="ed-tool-sidebar">
      {/* Tool Groups */}
      <div className="ed-tool-groups">
        {groups.map((group) => {
          const tools = TOOLS.filter((t) => t.group === group);
          const meta = GROUP_META[group];

          return (
            <div key={group} className="ed-tool-group">
              <div className="ed-tool-group-header">
                <span className="ed-tool-group-label">{meta.label}</span>
              </div>
              <div className="ed-tool-group-items">
                {tools.map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTool === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTool(t.id)}
                      onMouseEnter={(e) => handleToolHover(t.label, t.key, e)}
                      onMouseLeave={handleToolLeave}
                      className={`ed-tool-btn${isActive ? ' active' : ''}`}
                    >
                      <Icon size={16} />
                      {isActive && <div className="ed-tool-active-dot" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="ed-tool-divider" />

      {/* Color Picker */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
        <button onClick={() => setShowColorPicker(!showColorPicker)} className="ed-color-trigger" title="Farbe wählen">
          <div className="ed-color-dot" style={{ backgroundColor: activeColor, boxShadow: `0 0 8px ${activeColor}40` }} />
        </button>
        {showColorPicker && (<>
          <div className="ed-overlay-dismiss" onClick={() => setShowColorPicker(false)} />
          <div className="ed-flyout ed-flyout-right" style={{ top: 0 }}>
            <div className="ed-flyout-header">Farbe wählen</div>
            <div className="ed-color-grid">
              {PRESET_COLORS.map((clr) => (
                <button key={clr} onClick={() => { setActiveColor(clr); setShowColorPicker(false); }}
                  className={`ed-color-swatch${activeColor === clr ? ' active' : ''}`}
                  style={{ backgroundColor: clr }} />
              ))}
            </div>
            <input type="color" value={activeColor} onChange={(e) => setActiveColor(e.target.value)}
              className="ed-color-native" />
          </div>
        </>)}
      </div>

      {/* ─── Context Panels ─── */}

      {/* Text Input */}
      {(activeTool === 'text' || activeTool === 'callout') && (
        <div className="ed-ctx-panel">
          <div className="ed-ctx-label">Text</div>
          <input value={textInput} onChange={(e) => setTextInput(e.target.value)}
            placeholder="Text eingeben..."
            className="ed-ctx-input"
            onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()} />
          <div className="ed-ctx-label" style={{ marginTop: 6 }}>Größe: {fontSize}px</div>
          <input type="range" min={8} max={72} value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="ed-ctx-slider" />
        </div>
      )}

      {/* Military Unit Config */}
      {activeTool === 'military-unit' && (
        <div className="ed-ctx-panel">
          <div className="ed-ctx-label">Einheit</div>
          <button onClick={() => setShowSymbolPicker(!showSymbolPicker)} className="ed-ctx-select-btn">
            <MilitarySymbolPreview symbolId={militarySymbol} size={14} color="var(--ed-icon)" />
            <span className="ed-ctx-select-text">
              {MILITARY_SYMBOLS.find((s) => s.id === militarySymbol)?.label || 'Einheit'}
            </span>
          </button>
          {showSymbolPicker && (<>
            <div className="ed-overlay-dismiss" onClick={() => setShowSymbolPicker(false)} />
            <div className="ed-flyout ed-flyout-right" style={{ top: 0 }}>
              {CATEGORY_ORDER.map((cat) => {
                const symbols = MILITARY_SYMBOLS.filter((s) => s.category === cat);
                if (symbols.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="ed-flyout-cat">{CATEGORY_LABELS[cat]}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      {symbols.map((s) => {
                        const isSel = militarySymbol === s.id;
                        return (
                          <button key={s.id}
                            onClick={() => { setMilitarySymbol(s.id); setShowSymbolPicker(false); }}
                            className={`ed-flyout-item${isSel ? ' active' : ''}`}>
                            <MilitarySymbolPreview symbolId={s.id} size={18} color={isSel ? 'var(--accent-hex)' : 'var(--ed-icon)'} />
                            <span className="ed-flyout-item-label">{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>)}

          <div className="ed-ctx-label" style={{ marginTop: 8 }}>Fraktion</div>
          <div className="ed-faction-row">
            {(Object.keys(FACTION_COLORS) as Faction[]).map(f => (
              <button key={f} onClick={() => setActiveFaction(f)} title={FACTION_LABELS[f]}
                className={`ed-faction-btn${activeFaction === f ? ' active' : ''}`}>
                <div className="ed-faction-shape" style={{
                  borderRadius: f === 'hostile' ? 0 : f === 'unknown' ? '50%' : 3,
                  transform: f === 'hostile' ? 'rotate(45deg) scale(0.75)' : undefined,
                  backgroundColor: FACTION_COLORS[f],
                  outline: activeFaction === f ? `2px solid ${FACTION_COLORS[f]}` : 'none',
                  outlineOffset: 2,
                }} />
              </button>
            ))}
          </div>

          <div className="ed-ctx-label" style={{ marginTop: 6 }}>Stufe</div>
          <select value={activeEchelon} onChange={(e) => setActiveEchelon(e.target.value as Echelon)}
            className="ed-ctx-select">
            {Object.entries(ECHELON_MARKERS).map(([id, m]) => (
              <option key={id} value={id}>{m.symbol} {m.label}</option>
            ))}
          </select>

          <div className="ed-ctx-label" style={{ marginTop: 4 }}>Sicherheit</div>
          <select value={activeConfidence} onChange={(e) => setActiveConfidence(e.target.value as ConfidenceLevel)}
            className="ed-ctx-select">
            {Object.entries(CONFIDENCE_LABELS).map(([id, c]) => (
              <option key={id} value={id}>{c.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Weapon Range Picker */}
      {activeTool === 'range-circle' && (
        <div className="ed-ctx-panel">
          <div className="ed-ctx-label">Waffensystem</div>
          <button onClick={() => setShowRangePicker(!showRangePicker)} className="ed-ctx-select-btn">
            <div style={{
              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${WEAPON_RANGES.find(w => w.id === activeWeaponRange)?.color || '#888'}`,
            }} />
            <span className="ed-ctx-select-text">
              {WEAPON_RANGES.find(w => w.id === activeWeaponRange)?.label || 'System'}
            </span>
            <span className="ed-range-km">
              {WEAPON_RANGES.find(w => w.id === activeWeaponRange)?.rangeKm || '?'} km
            </span>
          </button>
          {showRangePicker && (<>
            <div className="ed-overlay-dismiss" onClick={() => setShowRangePicker(false)} />
            <div className="ed-flyout ed-flyout-right" style={{ top: 0 }}>
              {Object.entries(WEAPON_RANGE_CATEGORIES).map(([cat, label]) => {
                const weapons = WEAPON_RANGES.filter(w => w.category === cat);
                if (weapons.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="ed-flyout-cat">{label}</div>
                    {weapons.map(w => {
                      const isSel = activeWeaponRange === w.id;
                      return (
                        <button key={w.id}
                          onClick={() => { setActiveWeaponRange(w.id); setShowRangePicker(false); }}
                          className={`ed-flyout-item${isSel ? ' active' : ''}`}
                          style={{ color: isSel ? w.color : undefined }}>
                          <div style={{
                            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                            border: `2px solid ${w.color}`, background: `${w.color}15`,
                          }} />
                          <span style={{ flex: 1 }}>{w.label}</span>
                          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', opacity: 0.6 }}>{w.rangeKm} km</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>)}
        </div>
      )}

      {/* Tooltip */}
      {tooltipInfo && (
        <div className="ed-tool-tooltip" style={{
          top: tooltipInfo.rect.top + tooltipInfo.rect.height / 2 - 14,
          left: tooltipInfo.rect.right + 10,
        }}>
          <span className="ed-tooltip-name">{tooltipInfo.label}</span>
          <kbd className="ed-tooltip-kbd">{tooltipInfo.key}</kbd>
        </div>
      )}
    </div>
  );
}
