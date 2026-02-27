import { useRegion } from '../../context/RegionContext';
import { PRESET_COLORS, DASH_PATTERNS, FONT_OPTIONS, ZONE_PRESETS, MILITARY_SYMBOLS, FACTION_COLORS, FACTION_LABELS, ECHELON_MARKERS, CONFIDENCE_LABELS } from './constants';
import type { EditorState } from './useEditorState';
import type { EditorCountry, EditorElement, EditorSubRegion, Fill, ZonePreset, Faction, Echelon, ConfidenceLevel, TimelinePhase } from './types';
import { COUNTRY_ADMIN_REGIONS } from '../../data/subRegions';
import { solidFill } from './types';
import {
  Copy, ArrowUp, ArrowDown, Lock, Unlock, Trash2, Eye, EyeOff, X,
} from 'lucide-react';

interface Props {
  state: EditorState;
  timelinePhases: TimelinePhase[];
}

// ─── Shared styles (theme-aware) ───
const labelStyle: React.CSSProperties = { fontSize: 10, color: 'var(--ed-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '4px 6px', borderRadius: 4, background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)', color: 'var(--ed-text)', fontSize: 11, outline: 'none' };
const smallBtnStyle: React.CSSProperties = { width: 28, height: 28, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: 'var(--ed-btn)', color: 'var(--ed-icon)' };
const sectionStyle: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid var(--ed-border)' };

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <span style={{ ...labelStyle, marginBottom: 0, minWidth: 40 }}>{label}</span>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1 }}>
        {PRESET_COLORS.slice(0, 10).map((c) => (
          <button key={c} onClick={() => onChange(c)}
            style={{ width: 16, height: 16, borderRadius: 3, border: value === c ? '2px solid var(--ed-text)' : '1px solid var(--ed-input-border)', backgroundColor: c, cursor: 'pointer', padding: 0 }} />
        ))}
      </div>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: 22, height: 22, cursor: 'pointer', borderRadius: 3, border: 'none', padding: 0 }} />
    </div>
  );
}

function FillEditor({ fill, onChange }: { fill: Fill; onChange: (f: Fill) => void }) {
  const types: { id: Fill['type']; label: string }[] = [
    { id: 'solid', label: 'Vollfarbe' },
    { id: 'half', label: 'Halbiert' },
    { id: 'gradient', label: 'Verlauf' },
    { id: 'pattern', label: 'Muster' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
        {types.map((t) => (
          <button key={t.id} onClick={() => {
            if (t.id === fill.type) return;
            const baseColor = fill.type === 'solid' ? fill.color : fill.type === 'half' ? fill.color1 : fill.type === 'gradient' ? fill.color1 : fill.color;
            if (t.id === 'solid') onChange(solidFill(baseColor, fill.opacity));
            else if (t.id === 'half') onChange({ type: 'half', color1: baseColor, color2: '#3B82F6', direction: 'vertical', opacity: fill.opacity });
            else if (t.id === 'gradient') onChange({ type: 'gradient', color1: baseColor, color2: '#3B82F6', angle: 90, opacity: fill.opacity });
            else onChange({ type: 'pattern', patternId: 'stripes', color: baseColor, backgroundColor: 'rgba(0,0,0,0.2)', scale: 1, opacity: fill.opacity });
          }}
            style={{
              flex: 1, padding: '3px 0', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 9,
              background: fill.type === t.id ? 'var(--ed-active)' : 'var(--ed-inactive)',
              color: fill.type === t.id ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {fill.type === 'solid' && (
        <ColorRow label="Farbe" value={fill.color} onChange={(c) => onChange({ ...fill, color: c })} />
      )}
      {fill.type === 'half' && (<>
        <ColorRow label="Farbe 1" value={fill.color1} onChange={(c) => onChange({ ...fill, color1: c })} />
        <ColorRow label="Farbe 2" value={fill.color2} onChange={(c) => onChange({ ...fill, color2: c })} />
        <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
          {(['horizontal', 'vertical', 'diagonal'] as const).map((d) => (
            <button key={d} onClick={() => onChange({ ...fill, direction: d })}
              style={{
                flex: 1, padding: '3px 0', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 9,
                background: fill.direction === d ? 'var(--ed-active)' : 'var(--ed-inactive)',
                color: fill.direction === d ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
              }}>
              {d === 'horizontal' ? 'Horizontal' : d === 'vertical' ? 'Vertikal' : 'Diagonal'}
            </button>
          ))}
        </div>
      </>)}
      {fill.type === 'gradient' && (<>
        <ColorRow label="Von" value={fill.color1} onChange={(c) => onChange({ ...fill, color1: c })} />
        <ColorRow label="Nach" value={fill.color2} onChange={(c) => onChange({ ...fill, color2: c })} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span style={{ ...labelStyle, marginBottom: 0, minWidth: 40 }}>Winkel</span>
          <input type="range" min={0} max={360} value={fill.angle} onChange={(e) => onChange({ ...fill, angle: Number(e.target.value) })}
            style={{ flex: 1, accentColor: 'var(--accent-hex)' }} />
          <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', fontFamily: 'monospace', minWidth: 24 }}>{fill.angle}</span>
        </div>
      </>)}
      {fill.type === 'pattern' && (<>
        <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
          {(['stripes', 'crosshatch', 'dots', 'diagonal-lines'] as const).map((p) => (
            <button key={p} onClick={() => onChange({ ...fill, patternId: p })}
              style={{
                flex: 1, padding: '3px 0', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 8,
                background: fill.patternId === p ? 'var(--ed-active)' : 'var(--ed-inactive)',
                color: fill.patternId === p ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
              }}>
              {p === 'stripes' ? '|||' : p === 'crosshatch' ? 'XXX' : p === 'dots' ? '...' : '///'}
            </button>
          ))}
        </div>
        <ColorRow label="Vordergr." value={fill.color} onChange={(c) => onChange({ ...fill, color: c })} />
        <ColorRow label="Hintergr." value={fill.backgroundColor} onChange={(c) => onChange({ ...fill, backgroundColor: c })} />
      </>)}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span style={{ ...labelStyle, marginBottom: 0, minWidth: 40 }}>Opazit.</span>
        <input type="range" min={0} max={1} step={0.05} value={fill.opacity}
          onChange={(e) => onChange({ ...fill, opacity: Number(e.target.value) } as Fill)}
          style={{ flex: 1, accentColor: 'var(--accent-hex)' }} />
        <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', fontFamily: 'monospace', minWidth: 24 }}>{Math.round(fill.opacity * 100)}%</span>
      </div>
    </div>
  );
}

export default function PropertiesPanel({ state, timelinePhases }: Props) {
  const region = useRegion();
  const hasCountry = !!state.selectedCountryId;
  const hasElement = state.selectedElementIds.size > 0;
  const hasSubRegion = !!state.selectedSubRegionId;
  if (!hasCountry && !hasElement && !hasSubRegion) return null;

  const selectedCountry = hasCountry ? state.countries.find((c) => c.id === state.selectedCountryId) : null;
  const selectedElement = hasElement ? state.elements.find((e) => state.selectedElementIds.has(e.id)) : null;
  const selectedSubRegion = hasSubRegion ? (state.subRegions ?? []).find((sr) => sr.id === state.selectedSubRegionId) : null;
  const countryInfo = selectedCountry ? region.countries.find((c) => c.id === selectedCountry.id) : null;

  const updateC = (updates: Partial<EditorCountry>) => {
    if (selectedCountry) state.updateCountry(selectedCountry.id, updates);
  };
  const updateE = (updates: Partial<EditorElement>) => {
    if (selectedElement) state.updateElementWithSnapshot(selectedElement.id, updates);
  };
  const updateSR = (updates: Partial<EditorSubRegion>) => {
    if (selectedSubRegion) state.updateSubRegion(selectedSubRegion.id, updates);
  };

  return (
    <div style={{
      width: 260, flexShrink: 0, borderLeft: '1px solid var(--ed-border-strong)',
      background: 'var(--ed-panel)', overflowY: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ ...sectionStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ed-text)', fontFamily: 'var(--font-display)' }}>
          {hasSubRegion ? `Sub-Region: ${selectedSubRegion?.label}` : hasCountry ? (countryInfo?.flagEmoji || '') + ' ' + (countryInfo?.name || selectedCountry?.id) : selectedElement?.type.toUpperCase()}
        </span>
        <button onClick={state.clearSelection} style={{ ...smallBtnStyle, width: 20, height: 20 }}><X size={12} /></button>
      </div>

      {/* ═══ Country Properties ═══ */}
      {selectedCountry && (<>
        <div style={sectionStyle}>
          <div style={labelStyle}>Füllung</div>
          <FillEditor fill={selectedCountry.fill} onChange={(f) => state.updateCountryFill(selectedCountry.id, f)} />
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>Rand</div>
          <ColorRow label="Farbe" value={selectedCountry.strokeColor} onChange={(c) => updateC({ strokeColor: c })} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ ...labelStyle, marginBottom: 0, minWidth: 40 }}>Breite</span>
            <input type="range" min={0} max={5} step={0.5} value={selectedCountry.strokeWidth}
              onChange={(e) => updateC({ strokeWidth: Number(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-hex)' }} />
            <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', fontFamily: 'monospace' }}>{selectedCountry.strokeWidth}</span>
          </div>
          <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
            {DASH_PATTERNS.map((d) => (
              <button key={d.id} onClick={() => updateC({ strokeDasharray: d.id })}
                style={{
                  flex: 1, padding: '3px 0', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 8,
                  background: selectedCountry.strokeDasharray === d.id ? 'var(--ed-active)' : 'var(--ed-inactive)',
                  color: selectedCountry.strokeDasharray === d.id ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
                }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div style={sectionStyle}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: 'var(--ed-text-secondary)' }}>
            <input type="checkbox" checked={selectedCountry.labelVisible} onChange={(e) => updateC({ labelVisible: e.target.checked })} style={{ accentColor: 'var(--accent-hex)' }} />
            Beschriftung anzeigen
          </label>
        </div>
        {/* Admin Regions Toggle */}
        {COUNTRY_ADMIN_REGIONS[selectedCountry.id] && (
          <div style={sectionStyle}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: 'var(--ed-text-secondary)' }}>
              <input type="checkbox"
                checked={state.adminRegionsVisible.has(selectedCountry.id)}
                onChange={() => state.toggleAdminRegions(selectedCountry.id)}
                style={{ accentColor: 'var(--accent-hex)' }} />
              Regionen anzeigen
            </label>
            <div style={{ fontSize: 9, color: 'var(--ed-text-dim)', marginTop: 2 }}>
              {COUNTRY_ADMIN_REGIONS[selectedCountry.id].regions.length} Verwaltungsregionen
            </div>
          </div>
        )}
        <div style={{ ...sectionStyle, display: 'flex', gap: 4 }}>
          <button onClick={() => state.removeCountry(selectedCountry.id)}
            style={{ ...smallBtnStyle, flex: 1, color: '#f87171', gap: 4, fontSize: 10, width: 'auto', padding: '4px 8px' }}>
            <Trash2 size={12} /> Entfernen
          </button>
        </div>
      </>)}

      {/* ═══ Element Properties ═══ */}
      {selectedElement && (<>
        <div style={sectionStyle}>
          <div style={labelStyle}>Position</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 9, color: 'var(--ed-text-dim)' }}>X</span>
              <input type="number" value={Math.round(selectedElement.x)} onChange={(e) => updateE({ x: Number(e.target.value) })} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 9, color: 'var(--ed-text-dim)' }}>Y</span>
              <input type="number" value={Math.round(selectedElement.y)} onChange={(e) => updateE({ y: Number(e.target.value) })} style={inputStyle} />
            </div>
          </div>
        </div>

        {(selectedElement.type === 'rect' || selectedElement.type === 'ellipse') && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Größe</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 9, color: 'var(--ed-text-dim)' }}>B</span>
                <input type="number" value={Math.round(selectedElement.width)} onChange={(e) => updateE({ width: Number(e.target.value) })} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 9, color: 'var(--ed-text-dim)' }}>H</span>
                <input type="number" value={Math.round(selectedElement.height)} onChange={(e) => updateE({ height: Number(e.target.value) })} style={inputStyle} />
              </div>
            </div>
          </div>
        )}

        <div style={sectionStyle}>
          <div style={labelStyle}>Drehung</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="range" min={0} max={360} value={selectedElement.rotation} onChange={(e) => updateE({ rotation: Number(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-hex)' }} />
            <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', fontFamily: 'monospace', minWidth: 28 }}>{selectedElement.rotation}</span>
          </div>
        </div>

        {(selectedElement.type === 'rect' || selectedElement.type === 'ellipse' || selectedElement.type === 'polygon' || selectedElement.type === 'zone') && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Füllung</div>
            <FillEditor fill={selectedElement.fill} onChange={(f) => updateE({ fill: f })} />
          </div>
        )}

        <div style={sectionStyle}>
          <div style={labelStyle}>Linie</div>
          <ColorRow label="Farbe" value={selectedElement.strokeColor} onChange={(c) => updateE({ strokeColor: c })} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ ...labelStyle, marginBottom: 0, minWidth: 40 }}>Breite</span>
            <input type="range" min={0.5} max={10} step={0.5} value={selectedElement.strokeWidth}
              onChange={(e) => updateE({ strokeWidth: Number(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-hex)' }} />
            <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', fontFamily: 'monospace' }}>{selectedElement.strokeWidth}</span>
          </div>
          <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
            {DASH_PATTERNS.map((d) => (
              <button key={d.id} onClick={() => updateE({ strokeDasharray: d.id })}
                style={{
                  flex: 1, padding: '3px 0', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 8,
                  background: selectedElement.strokeDasharray === d.id ? 'var(--ed-active)' : 'var(--ed-inactive)',
                  color: selectedElement.strokeDasharray === d.id ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
                }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {(selectedElement.type === 'text' || selectedElement.type === 'callout') && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Text</div>
            <input value={selectedElement.content} onChange={(e) => updateE({ content: e.target.value })} style={{ ...inputStyle, marginBottom: 4 }} />
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              {FONT_OPTIONS.map((f) => (
                <button key={f.id} onClick={() => updateE({ fontFamily: f.id })}
                  style={{
                    flex: 1, padding: '3px 0', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 8,
                    background: selectedElement.fontFamily === f.id ? 'var(--ed-active)' : 'var(--ed-inactive)',
                    color: selectedElement.fontFamily === f.id ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="range" min={8} max={80} value={selectedElement.fontSize} onChange={(e) => updateE({ fontSize: Number(e.target.value) })}
                style={{ flex: 1, accentColor: 'var(--accent-hex)' }} />
              <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', fontFamily: 'monospace' }}>{selectedElement.fontSize}px</span>
            </div>
            <ColorRow label="Farbe" value={selectedElement.fill.type === 'solid' ? selectedElement.fill.color : '#fff'} onChange={(c) => updateE({ fill: solidFill(c, 1) })} />
          </div>
        )}

        {(selectedElement.type === 'arrow' || selectedElement.type === 'curved-arrow') && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Pfeilspitzen</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 9, color: 'var(--ed-text-dim)' }}>Start</span>
                <select value={selectedElement.arrowStart} onChange={(e) => updateE({ arrowStart: e.target.value as EditorElement['arrowStart'] })}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="none">Keine</option>
                  <option value="arrow">Pfeil</option>
                  <option value="circle">Kreis</option>
                  <option value="diamond">Raute</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 9, color: 'var(--ed-text-dim)' }}>Ende</span>
                <select value={selectedElement.arrowEnd} onChange={(e) => updateE({ arrowEnd: e.target.value as EditorElement['arrowEnd'] })}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="none">Keine</option>
                  <option value="arrow">Pfeil</option>
                  <option value="circle">Kreis</option>
                  <option value="diamond">Raute</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedElement.type === 'zone' && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Zone</div>
            <div style={{ display: 'flex', gap: 2 }}>
              {(Object.entries(ZONE_PRESETS) as [ZonePreset, typeof ZONE_PRESETS[ZonePreset]][]).map(([id, zs]) => (
                <button key={id} onClick={() => {
                  updateE({ zonePreset: id, fill: solidFill(zs.fill, 0.25), strokeColor: zs.stroke, content: zs.label });
                }}
                  style={{
                    flex: 1, padding: '4px 0', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 8,
                    background: selectedElement.zonePreset === id ? `${zs.fill}33` : 'var(--ed-inactive)',
                    color: selectedElement.zonePreset === id ? zs.fill : 'var(--ed-text-muted)',
                  }}>
                  {zs.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedElement.type === 'military-unit' && (<>
          <div style={sectionStyle}>
            <div style={labelStyle}>Einheitentyp</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {MILITARY_SYMBOLS.map((s) => (
                <button key={s.id} onClick={() => updateE({ militarySymbol: s.id })}
                  style={{
                    padding: '3px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 9,
                    background: selectedElement.militarySymbol === s.id ? 'var(--ed-active)' : 'var(--ed-inactive)',
                    color: selectedElement.militarySymbol === s.id ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div style={sectionStyle}>
            <div style={labelStyle}>Fraktion (NATO APP-6)</div>
            <div style={{ display: 'flex', gap: 3 }}>
              {(Object.keys(FACTION_COLORS) as Faction[]).map(f => (
                <button key={f} onClick={() => updateE({ faction: f })}
                  style={{
                    flex: 1, padding: '4px 0', borderRadius: 4, border: 'none', cursor: 'pointer',
                    fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                    background: selectedElement.faction === f ? `${FACTION_COLORS[f]}25` : 'var(--ed-inactive)',
                    color: selectedElement.faction === f ? FACTION_COLORS[f] : 'var(--ed-text-muted)',
                    outline: selectedElement.faction === f ? `1px solid ${FACTION_COLORS[f]}50` : 'none',
                  }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: f === 'unknown' ? '50%' : 1,
                    transform: f === 'hostile' ? 'rotate(45deg) scale(0.8)' : undefined,
                    backgroundColor: FACTION_COLORS[f],
                  }} />
                  {FACTION_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
          <div style={sectionStyle}>
            <div style={labelStyle}>Echelon</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {Object.entries(ECHELON_MARKERS).map(([id, m]) => (
                <button key={id} onClick={() => updateE({ echelon: id as Echelon })}
                  style={{
                    padding: '3px 6px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 8,
                    background: selectedElement.echelon === id ? 'var(--ed-active)' : 'var(--ed-inactive)',
                    color: selectedElement.echelon === id ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                  {m.symbol} {m.label}
                </button>
              ))}
            </div>
          </div>
          <div style={sectionStyle}>
            <div style={labelStyle}>Konfidenz</div>
            <div style={{ display: 'flex', gap: 2 }}>
              {(Object.entries(CONFIDENCE_LABELS) as [ConfidenceLevel, { label: string; color: string }][]).map(([id, c]) => (
                <button key={id} onClick={() => updateE({ confidence: id })}
                  style={{
                    flex: 1, padding: '3px 0', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 8,
                    background: selectedElement.confidence === id ? `${c.color}20` : 'var(--ed-inactive)',
                    color: selectedElement.confidence === id ? c.color : 'var(--ed-text-muted)',
                  }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </>)}

        {/* Timeline Phase Assignment */}
        {timelinePhases.length > 0 && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Timeline-Phase</div>
            <select
              value={selectedElement.timelinePhase || ''}
              onChange={(e) => updateE({ timelinePhase: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Alle Phasen (global)</option>
              {timelinePhases.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            {selectedElement.timelinePhase && (
              <div style={{ fontSize: 8, color: 'var(--ed-text-dim)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                Sichtbar nur in: {timelinePhases.find(p => p.id === selectedElement.timelinePhase)?.label || 'Unbekannt'}
              </div>
            )}
          </div>
        )}

        <div style={{ ...sectionStyle, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <button onClick={() => state.duplicateSelected()} style={smallBtnStyle} title="Duplizieren"><Copy size={13} /></button>
          <button onClick={() => state.bringForward(selectedElement.id)} style={smallBtnStyle} title="Nach vorne"><ArrowUp size={13} /></button>
          <button onClick={() => state.sendBackward(selectedElement.id)} style={smallBtnStyle} title="Nach hinten"><ArrowDown size={13} /></button>
          <button onClick={() => updateE({ locked: !selectedElement.locked })} style={smallBtnStyle} title={selectedElement.locked ? 'Entsperren' : 'Sperren'}>
            {selectedElement.locked ? <Lock size={13} /> : <Unlock size={13} />}
          </button>
          <button onClick={() => updateE({ visible: !selectedElement.visible })} style={smallBtnStyle} title={selectedElement.visible ? 'Ausblenden' : 'Einblenden'}>
            {selectedElement.visible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button onClick={() => state.removeElement(selectedElement.id)} style={{ ...smallBtnStyle, color: '#f87171' }} title="Löschen"><Trash2 size={13} /></button>
        </div>
      </>)}

      {/* ═══ SUB-REGION PROPERTIES ═══ */}
      {selectedSubRegion && (<>
        <div style={sectionStyle}>
          <div style={labelStyle}>Label</div>
          <input value={selectedSubRegion.label} onChange={(e) => updateSR({ label: e.target.value })}
            style={inputStyle} />
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>Land-Zuordnung</div>
          <select value={selectedSubRegion.countryId}
            onChange={(e) => updateSR({ countryId: e.target.value })}
            style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Kein Land</option>
            {state.countries.map(c => {
              const ci = region.countries.find(rc => rc.id === c.id);
              return <option key={c.id} value={c.id}>{ci?.flagEmoji} {ci?.name || c.id}</option>;
            })}
          </select>
        </div>
        <div style={sectionStyle}>
          <ColorRow label="Fill" value={selectedSubRegion.fill.type === 'solid' ? selectedSubRegion.fill.color : '#D4A74F'}
            onChange={(c) => updateSR({ fill: solidFill(c, selectedSubRegion.fill.opacity ?? 0.2) })} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ ...labelStyle, marginBottom: 0, minWidth: 40 }}>Opacity</span>
            <input type="range" min={0} max={1} step={0.05} value={selectedSubRegion.fill.opacity ?? 0.2}
              onChange={(e) => updateSR({ fill: { ...selectedSubRegion.fill, opacity: parseFloat(e.target.value) } as any })}
              style={{ flex: 1 }} />
            <span style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)', minWidth: 24 }}>
              {Math.round((selectedSubRegion.fill.opacity ?? 0.2) * 100)}%
            </span>
          </div>
        </div>
        <div style={sectionStyle}>
          <ColorRow label="Rand" value={selectedSubRegion.strokeColor}
            onChange={(c) => updateSR({ strokeColor: c })} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ ...labelStyle, marginBottom: 0, minWidth: 40 }}>Stärke</span>
            <input type="range" min={0.5} max={5} step={0.5} value={selectedSubRegion.strokeWidth}
              onChange={(e) => updateSR({ strokeWidth: parseFloat(e.target.value) })}
              style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
            {['', '4 2', '8 4', '2 2'].map((d, i) => (
              <button key={i} onClick={() => updateSR({ strokeDasharray: d })}
                style={{ ...smallBtnStyle, width: 36, border: selectedSubRegion.strokeDasharray === d ? '1px solid var(--ed-text)' : '1px solid var(--ed-input-border)' }}>
                <svg width={24} height={2}><line x1={0} y1={1} x2={24} y2={1} stroke="var(--ed-icon)" strokeWidth={1.5} strokeDasharray={d || 'none'} /></svg>
              </button>
            ))}
          </div>
        </div>
        <div style={{ ...sectionStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => updateSR({ labelVisible: !selectedSubRegion.labelVisible })} style={smallBtnStyle} title={selectedSubRegion.labelVisible ? 'Label ausblenden' : 'Label einblenden'}>
            {selectedSubRegion.labelVisible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button onClick={() => state.removeSubRegion(selectedSubRegion.id)} style={{ ...smallBtnStyle, color: '#f87171' }} title="Sub-Region löschen"><Trash2 size={13} /></button>
        </div>
      </>)}
    </div>
  );
}
