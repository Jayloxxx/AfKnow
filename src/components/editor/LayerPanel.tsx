import { useState, useCallback, useRef } from 'react';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, ChevronDown, ChevronRight,
  GripVertical, FolderPlus, Layers,
} from 'lucide-react';
import type { EditorState } from './useEditorState';
import type { EditorElement, LayerGroup } from './types';
import { useRegion } from '../../context/RegionContext';
import { MILITARY_SYMBOLS } from './constants';

interface Props {
  state: EditorState;
  layerGroups: LayerGroup[];
  setLayerGroups: React.Dispatch<React.SetStateAction<LayerGroup[]>>;
}

const ELEMENT_TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  rect: 'Rechteck',
  ellipse: 'Ellipse',
  line: 'Linie',
  arrow: 'Pfeil',
  'curved-arrow': 'Kurvenpfeil',
  polygon: 'Polygon',
  freehand: 'Freihand',
  frontline: 'Frontlinie',
  zone: 'Zone',
  'military-unit': 'Einheit',
  marker: 'Marker',
  'range-circle': 'Reichweite',
  'supply-route': 'Versorgung',
  'heatmap-point': 'Heatmap',
};

function getElementLabel(el: EditorElement): string {
  if (el.type === 'text' && el.content) return el.content.slice(0, 20);
  if (el.type === 'military-unit') {
    const sym = MILITARY_SYMBOLS.find(s => s.id === el.militarySymbol);
    return sym?.label || 'Einheit';
  }
  if (el.type === 'zone' && el.content) return el.content;
  if (el.type === 'range-circle' && el.content) return el.content;
  return ELEMENT_TYPE_LABELS[el.type] || el.type;
}

function getElementIcon(el: EditorElement): string {
  switch (el.type) {
    case 'text': return 'T';
    case 'rect': return '□';
    case 'ellipse': return '○';
    case 'line': return '─';
    case 'arrow': case 'curved-arrow': return '→';
    case 'polygon': return '⬠';
    case 'freehand': return '~';
    case 'frontline': return '⚔';
    case 'zone': return '◇';
    case 'military-unit': return '⛊';
    case 'marker': return '📍';
    case 'range-circle': return '◎';
    default: return '●';
  }
}

export default function LayerPanel({ state, layerGroups, setLayerGroups }: Props) {
  const region = useRegion();
  const [showCountries, setShowCountries] = useState(true);
  const [showElements, setShowElements] = useState(true);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemRef = useRef<string | null>(null);

  const sortedElements = [...state.elements].sort((a, b) => b.zIndex - a.zIndex);

  const handleDragStart = useCallback((id: string) => {
    dragItemRef.current = id;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);

  const handleDrop = useCallback((targetId: string) => {
    const sourceId = dragItemRef.current;
    if (!sourceId || sourceId === targetId) {
      setDragOverId(null);
      return;
    }
    const srcEl = state.elements.find(e => e.id === sourceId);
    const tgtEl = state.elements.find(e => e.id === targetId);
    if (srcEl && tgtEl) {
      const srcZ = srcEl.zIndex;
      state.updateElement(sourceId, { zIndex: tgtEl.zIndex });
      state.updateElement(targetId, { zIndex: srcZ });
    }
    setDragOverId(null);
    dragItemRef.current = null;
  }, [state]);

  const addGroup = useCallback(() => {
    setLayerGroups(prev => [...prev, {
      id: `grp-${Date.now()}`,
      label: `Gruppe ${prev.length + 1}`,
      collapsed: false,
      visible: true,
      locked: false,
      opacity: 1,
      elementIds: [],
    }]);
  }, [setLayerGroups]);

  const toggleGroupCollapse = useCallback((id: string) => {
    setLayerGroups(prev => prev.map(g => g.id === id ? { ...g, collapsed: !g.collapsed } : g));
  }, [setLayerGroups]);

  const toggleGroupVisibility = useCallback((id: string) => {
    setLayerGroups(prev => prev.map(g => g.id === id ? { ...g, visible: !g.visible } : g));
  }, [setLayerGroups]);

  const removeGroup = useCallback((id: string) => {
    setLayerGroups(prev => prev.filter(g => g.id !== id));
    // Ungroup elements
    state.elements.forEach(el => {
      if (el.groupId === id) state.updateElement(el.id, { groupId: '' });
    });
  }, [setLayerGroups, state]);

  const ungroupedElements = sortedElements.filter(el => !el.groupId || !layerGroups.find(g => g.id === el.groupId));

  return (
    <div style={{
      width: 240, flexShrink: 0, borderLeft: '1px solid var(--ed-border-strong)',
      background: 'var(--ed-panel)', display: 'flex', flexDirection: 'column',
      fontSize: 11, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 10px', borderBottom: '1px solid var(--ed-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Layers size={13} style={{ color: 'var(--accent-hex)' }} />
          <span style={{ fontWeight: 600, color: 'var(--ed-text)', fontFamily: 'var(--font-display)', fontSize: 11 }}>
            Layer
          </span>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={addGroup} title="Neue Gruppe"
            style={{ ...iconBtn, width: 22, height: 22 }}>
            <FolderPlus size={11} />
          </button>
        </div>
      </div>

      {/* Scrollable Layer List */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

        {/* ── Groups ── */}
        {layerGroups.map(group => (
          <div key={group.id}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px',
              borderBottom: '1px solid var(--ed-border)',
              background: 'color-mix(in srgb, var(--accent-hex) 5%, transparent)',
            }}>
              <button onClick={() => toggleGroupCollapse(group.id)} style={tinyBtn}>
                {group.collapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
              </button>
              <span style={{
                flex: 1, fontSize: 10, fontWeight: 600, color: 'var(--ed-text-secondary)',
                fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {group.label}
              </span>
              <button onClick={() => toggleGroupVisibility(group.id)} style={tinyBtn}>
                {group.visible ? <Eye size={10} /> : <EyeOff size={10} />}
              </button>
              <button onClick={() => removeGroup(group.id)} style={{ ...tinyBtn, color: '#f87171' }}>
                <Trash2 size={9} />
              </button>
            </div>
            {!group.collapsed && (
              <div style={{ paddingLeft: 8 }}>
                {sortedElements
                  .filter(el => el.groupId === group.id)
                  .map(el => (
                    <LayerRow
                      key={el.id}
                      el={el}
                      state={state}
                      isDragOver={dragOverId === el.id}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  ))}
                {sortedElements.filter(el => el.groupId === group.id).length === 0 && (
                  <div style={{ padding: '6px 8px', fontSize: 9, color: 'var(--ed-text-dim)', fontStyle: 'italic' }}>
                    Leer - Elemente hierher ziehen
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* ── Elements (ungrouped) ── */}
        <div style={{
          padding: '5px 8px', borderBottom: '1px solid var(--ed-border)',
          display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
        }} onClick={() => setShowElements(!showElements)}>
          {showElements ? <ChevronDown size={10} style={{ color: 'var(--ed-icon)' }} /> : <ChevronRight size={10} style={{ color: 'var(--ed-icon)' }} />}
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ed-text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Elemente ({ungroupedElements.length})
          </span>
        </div>
        {showElements && ungroupedElements.map(el => (
          <LayerRow
            key={el.id}
            el={el}
            state={state}
            isDragOver={dragOverId === el.id}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}

        {/* ── Countries ── */}
        <div style={{
          padding: '5px 8px', borderBottom: '1px solid var(--ed-border)',
          display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
        }} onClick={() => setShowCountries(!showCountries)}>
          {showCountries ? <ChevronDown size={10} style={{ color: 'var(--ed-icon)' }} /> : <ChevronRight size={10} style={{ color: 'var(--ed-icon)' }} />}
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ed-text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Lander ({state.countries.length})
          </span>
        </div>
        {showCountries && state.countries.map(cc => {
          const ct = region.countries.find(c => c.id === cc.id);
          const isSel = state.selectedCountryId === cc.id;
          const fillColor = cc.fill.type === 'solid' ? cc.fill.color : '#888';
          return (
            <div key={cc.id}
              onClick={() => state.selectCountry(cc.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px',
                borderBottom: '1px solid var(--ed-border)',
                background: isSel ? 'var(--ed-active)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}>
              <div style={{
                width: 12, height: 12, borderRadius: 2, flexShrink: 0,
                backgroundColor: fillColor, opacity: cc.fill.opacity,
                border: '1px solid var(--ed-border-strong)',
              }} />
              <span style={{
                flex: 1, fontSize: 10, color: isSel ? 'var(--ed-text)' : 'var(--ed-text-secondary)',
                fontWeight: isSel ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {ct?.flagEmoji || ''} {ct?.name || cc.id}
              </span>
              <button onClick={(e) => { e.stopPropagation(); state.removeCountry(cc.id); }}
                style={{ ...tinyBtn, color: '#f87171', opacity: 0.5 }}>
                <Trash2 size={9} />
              </button>
            </div>
          );
        })}

        {state.countries.length === 0 && state.elements.length === 0 && (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--ed-text-dim)', fontSize: 10 }}>
            Keine Layer vorhanden
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div style={{
        padding: '5px 10px', borderTop: '1px solid var(--ed-border)',
        fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>{state.countries.length} Lander</span>
        <span>{state.elements.length} Elemente</span>
        <span>{layerGroups.length} Gruppen</span>
      </div>
    </div>
  );
}

function LayerRow({ el, state, isDragOver, onDragStart, onDragOver, onDrop }: {
  el: EditorElement;
  state: EditorState;
  isDragOver: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (id: string) => void;
}) {
  const isSel = state.selectedElementIds.has(el.id);
  const color = el.strokeColor || (el.fill.type === 'solid' ? el.fill.color : '#888');

  return (
    <div
      draggable
      onDragStart={() => onDragStart(el.id)}
      onDragOver={(e) => onDragOver(e, el.id)}
      onDrop={() => onDrop(el.id)}
      onClick={() => state.selectElement(el.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
        borderBottom: '1px solid var(--ed-border)',
        background: isSel ? 'var(--ed-active)' : isDragOver ? 'color-mix(in srgb, var(--accent-hex) 10%, transparent)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.1s',
        opacity: el.visible ? 1 : 0.4,
      }}>
      <GripVertical size={9} style={{ color: 'var(--ed-icon-dim)', cursor: 'grab', flexShrink: 0 }} />
      <span style={{
        width: 16, height: 16, borderRadius: 3, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 10, flexShrink: 0,
        background: `color-mix(in srgb, ${color} 20%, transparent)`,
        color: color,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      }}>
        {getElementIcon(el)}
      </span>
      <span style={{
        flex: 1, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: isSel ? 'var(--ed-text)' : 'var(--ed-text-secondary)',
        fontWeight: isSel ? 600 : 400,
      }}>
        {getElementLabel(el)}
      </span>
      <button onClick={(e) => { e.stopPropagation(); state.updateElement(el.id, { visible: !el.visible }); }}
        style={tinyBtn}>
        {el.visible ? <Eye size={9} /> : <EyeOff size={9} />}
      </button>
      <button onClick={(e) => { e.stopPropagation(); state.updateElement(el.id, { locked: !el.locked }); }}
        style={tinyBtn}>
        {el.locked ? <Lock size={9} /> : <Unlock size={9} style={{ opacity: 0.3 }} />}
      </button>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  borderRadius: 4, border: 'none', cursor: 'pointer',
  background: 'var(--ed-btn)', color: 'var(--ed-icon)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const tinyBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--ed-icon-dim)', display: 'flex', alignItems: 'center',
  padding: 0, flexShrink: 0,
};
