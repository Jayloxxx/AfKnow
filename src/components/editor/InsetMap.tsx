import { useState } from 'react';
import { Map as MapIcon, X } from 'lucide-react';
import { useRegion } from '../../context/RegionContext';
import type { EditorState } from './useEditorState';

interface Props {
  state: EditorState;
  viewBox: string; // "panX panY w h"
  zoom: number;
}

const INSET_W = 160;
const INSET_H = 120;

export default function InsetMap({ state, viewBox, zoom }: Props) {
  const [visible, setVisible] = useState(false);
  const region = useRegion();

  // Parse the current viewport from viewBox
  const parts = viewBox.split(' ').map(Number);
  const vpX = parts[0];
  const vpY = parts[1];
  const vpW = parts[2];
  const vpH = parts[3];

  // Compute the full extent of all countries
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  region.countries.forEach(c => {
    const matches = c.path.match(/[\d.]+[, ][\d.]+/g);
    if (matches) {
      matches.forEach(m => {
        const ps = m.split(/[, ]/);
        const x = parseFloat(ps[0]);
        const y = parseFloat(ps[1]);
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      });
    }
  });

  const pad = 20;
  const fullX = minX - pad;
  const fullY = minY - pad;
  const fullW = (maxX - minX) + pad * 2;
  const fullH = (maxY - minY) + pad * 2;

  // Selected countries in the editor (for highlight)
  const editorCountryIds = new Set(state.countries.map(c => c.id));

  if (!visible) {
    return (
      <button onClick={() => setVisible(true)} title="Übersichtskarte"
        style={{
          position: 'absolute', bottom: 50, left: 12, zIndex: 20,
          width: 28, height: 28, borderRadius: 6,
          background: 'var(--ed-overlay-bg)', border: '1px solid var(--ed-overlay-border)',
          color: 'var(--ed-icon)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        <MapIcon size={14} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute', bottom: 50, left: 12, zIndex: 20,
      width: INSET_W, height: INSET_H,
      background: 'var(--ed-overlay-bg)', border: '1px solid var(--ed-overlay-border)',
      borderRadius: 8, overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    }}>
      {/* Close button */}
      <button onClick={() => setVisible(false)}
        style={{
          position: 'absolute', top: 3, right: 3, zIndex: 2,
          width: 16, height: 16, borderRadius: 3,
          background: 'rgba(0,0,0,0.5)', border: 'none', color: 'var(--ed-icon)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        <X size={10} />
      </button>

      {/* Label */}
      <div style={{
        position: 'absolute', top: 3, left: 5, zIndex: 2,
        fontSize: 7, fontWeight: 700, color: 'var(--accent-hex, #D4A74F)',
        fontFamily: 'var(--font-display)', textTransform: 'uppercase',
        letterSpacing: '0.08em', opacity: 0.7,
      }}>
        Übersicht
      </div>

      {/* Mini SVG map */}
      <svg width={INSET_W} height={INSET_H} viewBox={`${fullX} ${fullY} ${fullW} ${fullH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}>

        {/* All countries */}
        {region.countries.map(c => {
          const isInEditor = editorCountryIds.has(c.id);
          const isSelected = state.selectedCountryId === c.id;
          return (
            <path key={c.id} d={c.path}
              fill={isInEditor ? 'var(--accent-hex, #D4A74F)' : 'rgba(255,255,255,0.08)'}
              fillOpacity={isSelected ? 0.6 : isInEditor ? 0.3 : 0.08}
              stroke={isSelected ? '#FFD700' : 'rgba(255,255,255,0.15)'}
              strokeWidth={isSelected ? 1.5 : 0.5}
            />
          );
        })}

        {/* Viewport indicator */}
        {zoom > 1.05 && (
          <rect x={vpX} y={vpY} width={vpW} height={vpH}
            fill="rgba(239, 68, 68, 0.1)"
            stroke="#EF4444" strokeWidth={Math.max(1, fullW / INSET_W)}
            strokeDasharray={`${fullW / INSET_W * 3} ${fullW / INSET_W * 2}`}
          />
        )}
      </svg>
    </div>
  );
}
