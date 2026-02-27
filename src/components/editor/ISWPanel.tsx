import { useState, useCallback } from 'react';
import {
  Crosshair, Flame, ArrowRight, Shield, Zap,
  ChevronDown, ChevronRight, Target, Navigation,
  FileText, Layers, Wand2, X,
} from 'lucide-react';
import type { EditorState } from './useEditorState';
import type { Faction, Echelon, ToolType, LegendEntry } from './types';
import { defaultElement, solidFill } from './types';
import {
  ISW_FRONTLINE_STYLES, ISW_ZONE_PRESETS, ISW_BATTLE_MARKERS,
  ISW_BATTLE_CATEGORIES, ISW_MOVEMENT_ARROWS, FACTION_COLORS,
  MILITARY_SYMBOLS,
} from './constants';
import type { ISWFrontlineStyle, ISWZonePreset, ISWBattleMarker, ISWMovementArrow } from './constants';
import { useRegion } from '../../context/RegionContext';

interface Props {
  state: EditorState;
  activeTool: ToolType;
  setActiveTool: (t: ToolType) => void;
  activeColor: string;
  setActiveColor: (c: string) => void;
  showLegend: boolean;
  setShowLegend: (v: boolean) => void;
  legendEntries: LegendEntry[];
  setLegendEntries: React.Dispatch<React.SetStateAction<LegendEntry[]>>;
  setLegendTitle: (t: string) => void;
  activePhaseId: string;
  onClose: () => void;
}

type ISWSection = 'parties' | 'frontlines' | 'zones' | 'battles' | 'movements' | 'units' | 'autolegend' | 'mapframe';

const SECTION_CONFIG: { id: ISWSection; label: string; icon: typeof Crosshair }[] = [
  { id: 'parties', label: 'Parteien / Seiten', icon: Target },
  { id: 'frontlines', label: 'Frontlinien', icon: Navigation },
  { id: 'zones', label: 'Kontrollzonen', icon: Shield },
  { id: 'battles', label: 'Kampfmarker', icon: Flame },
  { id: 'movements', label: 'Bewegungspfeile', icon: ArrowRight },
  { id: 'units', label: 'Schnell-Einheiten', icon: Target },
  { id: 'autolegend', label: 'Auto-Legende', icon: FileText },
  { id: 'mapframe', label: 'Kartenkopf', icon: Layers },
];

export default function ISWPanel({
  state, activeTool, setActiveTool, activeColor, setActiveColor,
  showLegend, setShowLegend, legendEntries, setLegendEntries, setLegendTitle,
  activePhaseId, onClose,
}: Props) {
  const region = useRegion();
  const [openSections, setOpenSections] = useState<Set<ISWSection>>(new Set(['parties', 'frontlines', 'zones']));
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  // ─── Customizable Party Names & Colors ───
  const [partyAName, setPartyAName] = useState('Partei A');
  const [partyAColor, setPartyAColor] = useState('#DC2626');
  const [partyBName, setPartyBName] = useState('Partei B');
  const [partyBColor, setPartyBColor] = useState('#2563EB');
  const [mapTitle, setMapTitle] = useState('Lagebericht');
  const [mapDate, setMapDate] = useState(new Date().toISOString().split('T')[0]);
  const [mapClassification, setMapClassification] = useState('OFFEN');
  const [mapSource, setMapSource] = useState('OSINT / Nachrichtendienste');

  const toggleSection = useCallback((id: ISWSection) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // ─── Resolve party colors ───
  const resolveColor = useCallback((color: string) => {
    // Replace default party colors with user-configured ones
    if (color === '#DC2626' || color === '#991B1B') return partyAColor;
    if (color === '#2563EB' || color === '#1E40AF') return partyBColor;
    return color;
  }, [partyAColor, partyBColor]);

  const resolveLabel = useCallback((label: string) => {
    return label.replace('Partei A', partyAName).replace('Partei B', partyBName);
  }, [partyAName, partyBName]);

  // ─── Frontline Quick-Create ───
  const createFrontline = useCallback((style: ISWFrontlineStyle) => {
    setActiveColor(resolveColor(style.color));
    setActiveTool('frontline');
  }, [setActiveColor, setActiveTool, resolveColor]);

  // ─── Zone Quick-Create ───
  const createZone = useCallback((preset: ISWZonePreset) => {
    setActiveColor(resolveColor(preset.fillColor));
    setActiveTool('zone');
  }, [setActiveColor, setActiveTool, resolveColor]);

  // ─── Battle Marker Placement ───
  const placeBattleMarker = useCallback((marker: ISWBattleMarker, x?: number, y?: number) => {
    const cx = x ?? 500;
    const cy = y ?? 550;
    const el = defaultElement('marker', cx, cy);
    el.fill = solidFill(marker.color, 0.9);
    el.strokeColor = marker.color;
    el.content = marker.label;
    // Store marker type in militarySymbol field for rendering
    el.militarySymbol = `isw-${marker.id}`;
    el.timelinePhase = activePhaseId;
    state.addElement(el);
  }, [state, activePhaseId]);

  // ─── Movement Arrow Quick-Create ───
  const createMovementArrow = useCallback((arrow: ISWMovementArrow) => {
    setActiveColor(arrow.color);
    setActiveTool('curved-arrow');
  }, [setActiveColor, setActiveTool]);

  // ─── Quick Unit Placement ───
  const placeQuickUnit = useCallback((symbolId: string, faction: Faction, echelon: Echelon) => {
    const el = defaultElement('military-unit', 500, 550);
    el.militarySymbol = symbolId;
    el.faction = faction;
    el.echelon = echelon;
    el.confidence = 'confirmed';
    el.fill = solidFill(FACTION_COLORS[faction]);
    el.timelinePhase = activePhaseId;
    state.addElement(el);
    setActiveTool('select');
  }, [state, setActiveTool, activePhaseId]);

  // ─── Auto-Legend Generation ───
  const generateAutoLegend = useCallback(() => {
    const entries: LegendEntry[] = [];
    const seen = new Set<string>();

    // Collect zone types
    for (const el of state.elements) {
      if (el.type === 'zone' && el.content && !seen.has(`zone-${el.content}`)) {
        seen.add(`zone-${el.content}`);
        entries.push({
          id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          label: el.content,
          color: el.fill.type === 'solid' ? el.fill.color : el.strokeColor,
          symbol: 'rect',
        });
      }
      if (el.type === 'frontline' && !seen.has(`fl-${el.strokeColor}`)) {
        seen.add(`fl-${el.strokeColor}`);
        // Try to match ISW frontline style
        const flStyle = ISW_FRONTLINE_STYLES.find(s => s.color === el.strokeColor);
        entries.push({
          id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          label: flStyle?.label || 'Frontlinie',
          color: el.strokeColor,
          symbol: 'line',
        });
      }
      if (el.type === 'military-unit' && !seen.has(`unit-${el.faction}-${el.militarySymbol}`)) {
        seen.add(`unit-${el.faction}-${el.militarySymbol}`);
        const sym = MILITARY_SYMBOLS.find(s => s.id === el.militarySymbol);
        entries.push({
          id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          label: `${sym?.label || 'Einheit'} (${el.faction === 'friendly' ? 'Freund' : el.faction === 'hostile' ? 'Feind' : el.faction})`,
          color: FACTION_COLORS[el.faction] || '#888',
          symbol: 'rect',
        });
      }
      if (el.type === 'marker' && el.content && !seen.has(`mk-${el.content}`)) {
        seen.add(`mk-${el.content}`);
        entries.push({
          id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          label: el.content,
          color: el.fill.type === 'solid' ? el.fill.color : el.strokeColor,
          symbol: 'circle',
        });
      }
      if (el.type === 'range-circle' && el.content && !seen.has(`rc-${el.content}`)) {
        seen.add(`rc-${el.content}`);
        entries.push({
          id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          label: el.content,
          color: el.strokeColor,
          symbol: 'circle',
        });
      }
    }

    // Add country colors
    for (const cc of state.countries) {
      const ct = region.countries.find(c => c.id === cc.id);
      if (ct && !seen.has(`country-${cc.id}`)) {
        seen.add(`country-${cc.id}`);
        entries.push({
          id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          label: ct.name,
          color: cc.fill.type === 'solid' ? cc.fill.color : '#888',
          symbol: 'rect',
        });
      }
    }

    setLegendEntries(entries);
    setShowLegend(true);
    setLegendTitle('Legende');
  }, [state, region, setLegendEntries, setShowLegend, setLegendTitle]);

  // ─── Map Frame (Title Block) ───
  const addMapFrame = useCallback(() => {
    // Title
    const titleEl = defaultElement('text', 500, 30);
    titleEl.content = mapTitle;
    titleEl.fontSize = 28;
    titleEl.fontFamily = 'var(--font-display)';
    titleEl.fontWeight = '700';
    titleEl.fill = solidFill('#FFFFFF', 1);
    titleEl.textAlign = 'center';
    state.addElement(titleEl);

    // Date
    const dateEl = defaultElement('text', 500, 52);
    dateEl.content = `Stand: ${new Date(mapDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}`;
    dateEl.fontSize = 12;
    dateEl.fontFamily = 'var(--font-mono)';
    dateEl.fontWeight = '400';
    dateEl.fill = solidFill('#9CA3AF', 1);
    dateEl.textAlign = 'center';
    state.addElement(dateEl);

    // Classification banner top
    const classTopEl = defaultElement('text', 500, 12);
    classTopEl.content = `── ${mapClassification} ──`;
    classTopEl.fontSize = 9;
    classTopEl.fontFamily = 'var(--font-mono)';
    classTopEl.fontWeight = '600';
    classTopEl.fill = solidFill('#EF4444', 1);
    classTopEl.textAlign = 'center';
    state.addElement(classTopEl);

    // Classification banner bottom
    const classBotEl = defaultElement('text', 500, 1088);
    classBotEl.content = `── ${mapClassification} ──`;
    classBotEl.fontSize = 9;
    classBotEl.fontFamily = 'var(--font-mono)';
    classBotEl.fontWeight = '600';
    classBotEl.fill = solidFill('#EF4444', 1);
    classBotEl.textAlign = 'center';
    state.addElement(classBotEl);

    // Source line
    const sourceEl = defaultElement('text', 500, 1074);
    sourceEl.content = `Quellen: ${mapSource}`;
    sourceEl.fontSize = 8;
    sourceEl.fontFamily = 'var(--font-mono)';
    sourceEl.fontWeight = '400';
    sourceEl.fill = solidFill('#6B7280', 1);
    sourceEl.textAlign = 'center';
    state.addElement(sourceEl);
  }, [state, mapTitle, mapDate, mapClassification, mapSource]);

  // ─── Quick-Create ISW Template ───
  const applyTemplate = useCallback((templateId: string) => {
    if (templateId === 'basic-frontline') {
      // Add map frame
      addMapFrame();
      // Generate legend
      generateAutoLegend();
    }
  }, [addMapFrame, generateAutoLegend]);

  return (
    <div style={{
      width: 280, flexShrink: 0, borderLeft: '1px solid var(--ed-border-strong)',
      background: 'var(--ed-panel)', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* ═══ Header ═══ */}
      <div style={{
        padding: '10px 12px', borderBottom: '1px solid var(--ed-border)',
        background: 'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(37,99,235,0.08))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #DC2626, #991B1B)',
            boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
          }}>
            <Crosshair size={14} color="white" />
          </div>
          <div>
            <div style={{
              fontSize: 12, fontWeight: 700, color: 'var(--ed-text)',
              fontFamily: 'var(--font-display)', letterSpacing: '-0.01em',
            }}>
              LAGE-WERKZEUGE
            </div>
            <div style={{
              fontSize: 8, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              Militärische Lagekarte
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 24, height: 24, borderRadius: 4, border: 'none',
          background: 'var(--ed-btn)', color: 'var(--ed-icon-dim)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={12} />
        </button>
      </div>

      {/* ═══ Active Tool Indicator ═══ */}
      {activeTool !== 'select' && activeTool !== 'pan' && (
        <div style={{
          padding: '6px 12px', background: `color-mix(in srgb, ${activeColor} 10%, transparent)`,
          borderBottom: '1px solid var(--ed-border)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: activeColor, animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 10, color: activeColor, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            Werkzeug aktiv: {activeTool}
          </span>
          <button onClick={() => setActiveTool('select')} style={{
            marginLeft: 'auto', fontSize: 8, color: 'var(--ed-text-dim)', background: 'var(--ed-btn)',
            border: 'none', borderRadius: 3, padding: '2px 6px', cursor: 'pointer',
          }}>ESC</button>
        </div>
      )}

      {/* ═══ Scrollable Content ═══ */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {SECTION_CONFIG.map(({ id, label, icon: Icon }) => {
          const isOpen = openSections.has(id);
          return (
            <div key={id}>
              {/* Section Header */}
              <button onClick={() => toggleSection(id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', border: 'none', borderBottom: '1px solid var(--ed-border)',
                background: isOpen ? 'color-mix(in srgb, var(--accent-hex) 4%, transparent)' : 'transparent',
                cursor: 'pointer', textAlign: 'left',
              }}>
                <Icon size={12} style={{ color: isOpen ? 'var(--accent-hex)' : 'var(--ed-icon-dim)', flexShrink: 0 }} />
                <span style={{
                  flex: 1, fontSize: 10, fontWeight: 600, color: isOpen ? 'var(--ed-text)' : 'var(--ed-text-muted)',
                  fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {label}
                </span>
                {isOpen ? <ChevronDown size={10} style={{ color: 'var(--ed-icon-dim)' }} /> : <ChevronRight size={10} style={{ color: 'var(--ed-icon-dim)' }} />}
              </button>

              {/* Section Content */}
              {isOpen && (
                <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--ed-border)' }}>
                  {id === 'parties' && (
                    <PartiesSection
                      partyAName={partyAName} setPartyAName={setPartyAName}
                      partyAColor={partyAColor} setPartyAColor={setPartyAColor}
                      partyBName={partyBName} setPartyBName={setPartyBName}
                      partyBColor={partyBColor} setPartyBColor={setPartyBColor}
                    />
                  )}
                  {id === 'frontlines' && <FrontlineSection createFrontline={createFrontline} hoveredItem={hoveredItem} setHoveredItem={setHoveredItem} resolveColor={resolveColor} resolveLabel={resolveLabel} />}
                  {id === 'zones' && <ZoneSection createZone={createZone} hoveredItem={hoveredItem} setHoveredItem={setHoveredItem} resolveColor={resolveColor} resolveLabel={resolveLabel} />}
                  {id === 'battles' && <BattleSection placeBattleMarker={placeBattleMarker} hoveredItem={hoveredItem} setHoveredItem={setHoveredItem} />}
                  {id === 'movements' && <MovementSection createMovementArrow={createMovementArrow} hoveredItem={hoveredItem} setHoveredItem={setHoveredItem} />}
                  {id === 'units' && <QuickUnitsSection placeQuickUnit={placeQuickUnit} />}
                  {id === 'autolegend' && <AutoLegendSection generateAutoLegend={generateAutoLegend} showLegend={showLegend} legendEntries={legendEntries} />}
                  {id === 'mapframe' && (
                    <MapFrameSection
                      mapTitle={mapTitle} setMapTitle={setMapTitle}
                      mapDate={mapDate} setMapDate={setMapDate}
                      mapClassification={mapClassification} setMapClassification={setMapClassification}
                      mapSource={mapSource} setMapSource={setMapSource}
                      addMapFrame={addMapFrame}
                      applyTemplate={applyTemplate}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ Footer Stats ═══ */}
      <div style={{
        padding: '6px 12px', borderTop: '1px solid var(--ed-border)',
        background: 'var(--ed-toolbar)', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'FL', count: state.elements.filter(e => e.type === 'frontline').length, color: '#EF4444' },
            { label: 'ZN', count: state.elements.filter(e => e.type === 'zone').length, color: '#F59E0B' },
            { label: 'MK', count: state.elements.filter(e => e.type === 'marker').length, color: '#3B82F6' },
            { label: 'EH', count: state.elements.filter(e => e.type === 'military-unit').length, color: '#22C55E' },
          ].map(s => (
            <div key={s.label} style={{
              fontSize: 9, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 3,
              color: s.count > 0 ? s.color : 'var(--ed-text-dim)',
            }}>
              <span style={{ fontWeight: 700 }}>{s.count}</span>
              <span style={{ opacity: 0.7 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════ Sub-Sections ═══════

function PartiesSection({ partyAName, setPartyAName, partyAColor, setPartyAColor, partyBName, setPartyBName, partyBColor, setPartyBColor }: {
  partyAName: string; setPartyAName: (s: string) => void;
  partyAColor: string; setPartyAColor: (s: string) => void;
  partyBName: string; setPartyBName: (s: string) => void;
  partyBColor: string; setPartyBColor: (s: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)' }}>
        Benenne die Konfliktparteien — Farben und Labels passen sich automatisch an
      </div>
      {/* Party A */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="color" value={partyAColor} onChange={e => setPartyAColor(e.target.value)}
          style={{ width: 24, height: 24, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0, background: 'none' }} />
        <input value={partyAName} onChange={e => setPartyAName(e.target.value)}
          placeholder="Partei A"
          style={{ ...fieldInput, flex: 1, borderLeft: `3px solid ${partyAColor}` }} />
      </div>
      {/* Party B */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="color" value={partyBColor} onChange={e => setPartyBColor(e.target.value)}
          style={{ width: 24, height: 24, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0, background: 'none' }} />
        <input value={partyBName} onChange={e => setPartyBName(e.target.value)}
          placeholder="Partei B"
          style={{ ...fieldInput, flex: 1, borderLeft: `3px solid ${partyBColor}` }} />
      </div>
    </div>
  );
}

function FrontlineSection({ createFrontline, hoveredItem, setHoveredItem, resolveColor, resolveLabel }: {
  createFrontline: (s: ISWFrontlineStyle) => void;
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
  resolveColor: (c: string) => string;
  resolveLabel: (l: string) => string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ fontSize: 9, color: 'var(--ed-text-dim)', marginBottom: 2, fontFamily: 'var(--font-mono)' }}>
        Klicke zum Aktivieren, dann zeichne auf der Karte
      </div>
      {ISW_FRONTLINE_STYLES.map(style => {
        const color = resolveColor(style.color);
        const label = resolveLabel(style.label);
        const isHovered = hoveredItem === `fl-${style.id}`;
        return (
          <button key={style.id}
            onClick={() => createFrontline(style)}
            onMouseEnter={() => setHoveredItem(`fl-${style.id}`)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
              borderRadius: 6, border: 'none', cursor: 'pointer', width: '100%',
              textAlign: 'left', transition: 'all 0.12s',
              background: isHovered ? `color-mix(in srgb, ${color} 12%, transparent)` : 'var(--ed-btn)',
            }}>
            {/* Preview line */}
            <svg width={32} height={10} style={{ flexShrink: 0 }}>
              <line x1={2} y1={5} x2={30} y2={5}
                stroke={color} strokeWidth={style.width * 0.7}
                strokeDasharray={style.dash || undefined} strokeLinecap="round" />
            </svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: isHovered ? color : 'var(--ed-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </div>
              {isHovered && (
                <div style={{ fontSize: 8, color: 'var(--ed-text-dim)', marginTop: 1 }}>{resolveLabel(style.description)}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ZoneSection({ createZone, hoveredItem, setHoveredItem, resolveColor, resolveLabel }: {
  createZone: (z: ISWZonePreset) => void;
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
  resolveColor: (c: string) => string;
  resolveLabel: (l: string) => string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ fontSize: 9, color: 'var(--ed-text-dim)', marginBottom: 2, fontFamily: 'var(--font-mono)' }}>
        Klicke zum Aktivieren, zeichne Polygon, Doppelklick = fertig
      </div>
      {ISW_ZONE_PRESETS.map(preset => {
        const fillColor = resolveColor(preset.fillColor);
        const strokeColor = resolveColor(preset.strokeColor);
        const label = resolveLabel(preset.label);
        const isHovered = hoveredItem === `zn-${preset.id}`;
        return (
          <button key={preset.id}
            onClick={() => createZone(preset)}
            onMouseEnter={() => setHoveredItem(`zn-${preset.id}`)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
              borderRadius: 6, border: 'none', cursor: 'pointer', width: '100%',
              textAlign: 'left', transition: 'all 0.12s',
              background: isHovered ? `color-mix(in srgb, ${fillColor} 10%, transparent)` : 'var(--ed-btn)',
            }}>
            {/* Preview swatch */}
            <div style={{
              width: 20, height: 20, borderRadius: 3, flexShrink: 0,
              background: preset.pattern
                ? `repeating-linear-gradient(45deg, ${fillColor}40, ${fillColor}40 2px, transparent 2px, transparent 4px)`
                : `${fillColor}${Math.round(preset.fillOpacity * 255).toString(16).padStart(2, '0')}`,
              border: `1.5px solid ${strokeColor}`,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: isHovered ? strokeColor : 'var(--ed-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </div>
              {isHovered && (
                <div style={{ fontSize: 8, color: 'var(--ed-text-dim)', marginTop: 1 }}>{resolveLabel(preset.description)}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function BattleSection({ placeBattleMarker, hoveredItem, setHoveredItem }: {
  placeBattleMarker: (m: ISWBattleMarker) => void;
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
}) {
  const categories = Object.entries(ISW_BATTLE_CATEGORIES);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 9, color: 'var(--ed-text-dim)', marginBottom: 2, fontFamily: 'var(--font-mono)' }}>
        Klicke zum Platzieren in Kartenmitte (dann verschieben)
      </div>
      {categories.map(([catId, catLabel]) => {
        const markers = ISW_BATTLE_MARKERS.filter(m => m.category === catId);
        if (markers.length === 0) return null;
        return (
          <div key={catId}>
            <div style={{
              fontSize: 8, fontWeight: 700, color: 'var(--ed-text-dim)',
              textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 4px',
              fontFamily: 'var(--font-display)',
            }}>
              {catLabel}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              {markers.map(marker => {
                const isHovered = hoveredItem === `bm-${marker.id}`;
                return (
                  <button key={marker.id}
                    onClick={() => placeBattleMarker(marker)}
                    onMouseEnter={() => setHoveredItem(`bm-${marker.id}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '4px 6px',
                      borderRadius: 5, border: 'none', cursor: 'pointer',
                      transition: 'all 0.12s',
                      background: isHovered ? `color-mix(in srgb, ${marker.color} 15%, transparent)` : 'var(--ed-btn)',
                    }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      <g dangerouslySetInnerHTML={{ __html: marker.icon.replace(/currentColor/g, marker.color) }} />
                    </svg>
                    <span style={{
                      fontSize: 9, color: isHovered ? marker.color : 'var(--ed-text-secondary)',
                      fontWeight: isHovered ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {marker.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MovementSection({ createMovementArrow, hoveredItem, setHoveredItem }: {
  createMovementArrow: (a: ISWMovementArrow) => void;
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ fontSize: 9, color: 'var(--ed-text-dim)', marginBottom: 2, fontFamily: 'var(--font-mono)' }}>
        Klicke zum Aktivieren, setze Punkte, Doppelklick = fertig
      </div>
      {ISW_MOVEMENT_ARROWS.map(arrow => {
        const isHovered = hoveredItem === `mv-${arrow.id}`;
        return (
          <button key={arrow.id}
            onClick={() => createMovementArrow(arrow)}
            onMouseEnter={() => setHoveredItem(`mv-${arrow.id}`)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
              borderRadius: 6, border: 'none', cursor: 'pointer', width: '100%',
              textAlign: 'left', transition: 'all 0.12s',
              background: isHovered ? `color-mix(in srgb, ${arrow.color} 12%, transparent)` : 'var(--ed-btn)',
            }}>
            {/* Preview arrow */}
            <svg width={32} height={14} viewBox="0 0 32 14" style={{ flexShrink: 0 }}>
              <defs>
                <marker id={`isw-arr-${arrow.id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={arrow.color} />
                </marker>
              </defs>
              <line x1={2} y1={7} x2={26} y2={7}
                stroke={arrow.color} strokeWidth={arrow.width * 0.6}
                strokeDasharray={arrow.dash || undefined} strokeLinecap="round"
                markerEnd={`url(#isw-arr-${arrow.id})`} />
            </svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: isHovered ? arrow.color : 'var(--ed-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {arrow.label}
              </div>
              {isHovered && (
                <div style={{ fontSize: 8, color: 'var(--ed-text-dim)', marginTop: 1 }}>{arrow.description}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function QuickUnitsSection({ placeQuickUnit }: {
  placeQuickUnit: (symbolId: string, faction: Faction, echelon: Echelon) => void;
}) {
  const [faction, setFaction] = useState<Faction>('hostile');
  const [echelon, setEchelon] = useState<Echelon>('battalion');

  const quickUnits = [
    { id: 'infantry', label: 'Infanterie' },
    { id: 'armor', label: 'Panzer' },
    { id: 'artillery', label: 'Artillerie' },
    { id: 'mechanized', label: 'Mechanisiert' },
    { id: 'airborne', label: 'Luftlande' },
    { id: 'special-forces', label: 'Spezialkräfte' },
    { id: 'recon', label: 'Aufklärung' },
    { id: 'anti-air', label: 'Flugabwehr' },
    { id: 'headquarters', label: 'HQ' },
    { id: 'missile', label: 'Raketen' },
    { id: 'engineer', label: 'Pioniere' },
    { id: 'supply', label: 'Nachschub' },
  ];

  const factionColor = FACTION_COLORS[faction];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Faction Selector */}
      <div>
        <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--ed-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3, fontFamily: 'var(--font-display)' }}>
          Fraktion
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {(Object.entries(FACTION_COLORS) as [Faction, string][]).map(([f, color]) => (
            <button key={f} onClick={() => setFaction(f)}
              style={{
                flex: 1, padding: '4px 0', borderRadius: 4, border: 'none', cursor: 'pointer',
                fontSize: 8, fontWeight: 600,
                background: faction === f ? `${color}25` : 'var(--ed-btn)',
                color: faction === f ? color : 'var(--ed-text-muted)',
                outline: faction === f ? `1.5px solid ${color}` : 'none',
              }}>
              {f === 'friendly' ? 'Freund' : f === 'hostile' ? 'Feind' : f === 'neutral' ? 'Neutral' : '?'}
            </button>
          ))}
        </div>
      </div>

      {/* Echelon Quick Selector */}
      <div>
        <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--ed-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3, fontFamily: 'var(--font-display)' }}>
          Verbandsebene
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {(['squad', 'platoon', 'company', 'battalion', 'brigade', 'division'] as Echelon[]).map(e => (
            <button key={e} onClick={() => setEchelon(e)}
              style={{
                padding: '3px 6px', borderRadius: 3, border: 'none', cursor: 'pointer',
                fontSize: 8, fontFamily: 'var(--font-mono)',
                background: echelon === e ? 'var(--ed-active)' : 'var(--ed-btn)',
                color: echelon === e ? factionColor : 'var(--ed-text-muted)',
              }}>
              {e === 'squad' ? 'Grp' : e === 'platoon' ? 'Zug' : e === 'company' ? 'Kp' : e === 'battalion' ? 'Btl' : e === 'brigade' ? 'Brig' : 'Div'}
            </button>
          ))}
        </div>
      </div>

      {/* Unit Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
        {quickUnits.map(unit => (
          <button key={unit.id}
            onClick={() => placeQuickUnit(unit.id, faction, echelon)}
            style={{
              padding: '6px 4px', borderRadius: 5, border: 'none', cursor: 'pointer',
              background: 'var(--ed-btn)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3, transition: 'all 0.12s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${factionColor} 12%, transparent)`;
              (e.currentTarget as HTMLElement).style.color = factionColor;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--ed-btn)';
              (e.currentTarget as HTMLElement).style.color = 'var(--ed-text-secondary)';
            }}>
            <svg width={20} height={16} viewBox="0 0 24 20" style={{ flexShrink: 0 }}>
              <rect x="0" y="0" width="24" height="20" rx="2" fill="none"
                stroke={factionColor} strokeWidth="1.5" />
              <g dangerouslySetInnerHTML={{
                __html: MILITARY_SYMBOLS.find(s => s.id === unit.id)?.svgContent.replace(/currentColor/g, factionColor) || ''
              }} />
            </svg>
            <span style={{ fontSize: 7, color: 'var(--ed-text-secondary)', fontWeight: 500, textAlign: 'center', lineHeight: 1.1 }}>
              {unit.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AutoLegendSection({ generateAutoLegend, showLegend, legendEntries }: {
  generateAutoLegend: () => void;
  showLegend: boolean;
  legendEntries: LegendEntry[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)' }}>
        Generiert automatisch eine Legende aus allen platzierten Elementen
      </div>
      <button onClick={generateAutoLegend}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: 6, border: 'none',
          cursor: 'pointer', fontSize: 11, fontWeight: 600,
          background: 'linear-gradient(135deg, var(--accent-hex), color-mix(in srgb, var(--accent-hex) 80%, #000))',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontFamily: 'var(--font-display)',
          boxShadow: '0 2px 8px color-mix(in srgb, var(--accent-hex) 30%, transparent)',
        }}>
        <Wand2 size={13} />
        Legende generieren
      </button>
      {showLegend && legendEntries.length > 0 && (
        <div style={{
          padding: '6px 8px', borderRadius: 6, background: 'var(--ed-btn)',
          border: '1px solid var(--ed-border)',
        }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--ed-text-muted)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
            Aktuelle Legende ({legendEntries.length} Einträge)
          </div>
          {legendEntries.slice(0, 8).map(entry => (
            <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
              <div style={{
                width: 10, height: 10, borderRadius: entry.symbol === 'circle' ? '50%' : 2,
                background: entry.color, flexShrink: 0,
              }} />
              <span style={{ fontSize: 9, color: 'var(--ed-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.label}
              </span>
            </div>
          ))}
          {legendEntries.length > 8 && (
            <div style={{ fontSize: 8, color: 'var(--ed-text-dim)', marginTop: 2 }}>
              +{legendEntries.length - 8} weitere...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MapFrameSection({ mapTitle, setMapTitle, mapDate, setMapDate, mapClassification, setMapClassification, mapSource, setMapSource, addMapFrame, applyTemplate }: {
  mapTitle: string; setMapTitle: (s: string) => void;
  mapDate: string; setMapDate: (s: string) => void;
  mapClassification: string; setMapClassification: (s: string) => void;
  mapSource: string; setMapSource: (s: string) => void;
  addMapFrame: () => void;
  applyTemplate: (id: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div>
        <label style={fieldLabel}>Kartentitel</label>
        <input value={mapTitle} onChange={e => setMapTitle(e.target.value)} style={fieldInput} />
      </div>
      <div>
        <label style={fieldLabel}>Datum</label>
        <input type="date" value={mapDate} onChange={e => setMapDate(e.target.value)} style={fieldInput} />
      </div>
      <div>
        <label style={fieldLabel}>Einstufung</label>
        <select value={mapClassification} onChange={e => setMapClassification(e.target.value)} style={{ ...fieldInput, cursor: 'pointer' }}>
          <option value="OFFEN">OFFEN</option>
          <option value="OSINT">OSINT</option>
        </select>
      </div>
      <div>
        <label style={fieldLabel}>Quellen</label>
        <input value={mapSource} onChange={e => setMapSource(e.target.value)} style={fieldInput} />
      </div>

      <button onClick={addMapFrame}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: 6,
          cursor: 'pointer', fontSize: 11, fontWeight: 600,
          background: 'var(--ed-btn)', color: 'var(--ed-text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          border: '1px solid var(--ed-border-strong)',
        }}>
        <FileText size={13} />
        Kartenkopf einfügen
      </button>

      <div style={{ height: 1, background: 'var(--ed-border)', margin: '2px 0' }} />

      <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--ed-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>
        Schnellvorlage
      </div>
      <button onClick={() => applyTemplate('basic-frontline')}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: 6,
          border: '1px dashed var(--ed-border-strong)', cursor: 'pointer',
          fontSize: 10, color: 'var(--ed-text-muted)',
          background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
        <Zap size={11} />
        Kartenkopf + Auto-Legende
      </button>
    </div>
  );
}

// ─── Shared Styles ───
const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: 9, fontWeight: 600, color: 'var(--ed-text-dim)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2,
  fontFamily: 'var(--font-display)',
};
const fieldInput: React.CSSProperties = {
  width: '100%', padding: '4px 8px', borderRadius: 4,
  background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)',
  color: 'var(--ed-text)', fontSize: 11, outline: 'none',
  fontFamily: 'var(--font-body)',
};
