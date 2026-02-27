import React from 'react';
import type { EditorElement, Faction, Echelon, ConfidenceLevel } from './types';
import { MILITARY_SYMBOLS, FACTION_COLORS, ECHELON_MARKERS, CONFIDENCE_LABELS } from './constants';
import type { MilitaryCategory } from './constants';

const PICTORIAL_CATEGORIES: MilitaryCategory[] = ['personnel', 'vehicles', 'air-defense', 'radar', 'ships', 'aircraft'];

interface Props {
  element: EditorElement;
  isSelected: boolean;
}

// ── NATO APP-6 Frame shapes by faction ──
function FactionFrame({ faction, w, h, color: _color, isSelected, confidence }: {
  faction: Faction; w: number; h: number; color: string;
  isSelected: boolean; confidence: ConfidenceLevel;
}) {
  const factionColor = FACTION_COLORS[faction];
  const stroke = isSelected ? '#FFD700' : factionColor;
  const strokeW = isSelected ? 2.5 : 1.5;
  const isDashed = confidence === 'possible' || confidence === 'doubtful';
  const dash = isDashed ? '4 2' : undefined;

  switch (faction) {
    case 'friendly':
      // Rectangle frame (NATO standard for friendly)
      return <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={2}
        fill={factionColor} fillOpacity={0.12}
        stroke={stroke} strokeWidth={strokeW} strokeDasharray={dash} />;
    case 'hostile':
      // Diamond frame (NATO standard for hostile)
      return <polygon
        points={`0,${-h / 2 - 4} ${w / 2 + 4},0 0,${h / 2 + 4} ${-w / 2 - 4},0`}
        fill={factionColor} fillOpacity={0.12}
        stroke={stroke} strokeWidth={strokeW} strokeDasharray={dash} />;
    case 'neutral':
      // Square frame (NATO standard for neutral)
      return <rect x={-w / 2} y={-h / 2} width={w} height={h}
        fill={factionColor} fillOpacity={0.12}
        stroke={stroke} strokeWidth={strokeW} strokeDasharray={dash} />;
    case 'unknown':
      // Quatrefoil/clover frame (NATO standard for unknown)
      return <path
        d={`M0,${-h/2-2} C${w/3},${-h/2-2} ${w/2+2},${-h/3} ${w/2+2},0 C${w/2+2},${h/3} ${w/3},${h/2+2} 0,${h/2+2} C${-w/3},${h/2+2} ${-w/2-2},${h/3} ${-w/2-2},0 C${-w/2-2},${-h/3} ${-w/3},${-h/2-2} 0,${-h/2-2}Z`}
        fill={factionColor} fillOpacity={0.12}
        stroke={stroke} strokeWidth={strokeW} strokeDasharray={dash} />;
    default:
      return null;
  }
}

// ── Echelon indicator above symbol ──
function EchelonIndicator({ echelon, y, color }: { echelon: Echelon; y: number; color: string }) {
  const marker = ECHELON_MARKERS[echelon];
  if (!marker) return null;
  const sym = marker.symbol;

  // Draw echelon marks above the frame
  const markY = y - 5;
  const marks: React.JSX.Element[] = [];

  if (sym.includes('X')) {
    // X marks for brigade+
    const count = sym.length;
    const spacing = 7;
    const startX = -(count - 1) * spacing / 2;
    for (let i = 0; i < count; i++) {
      const cx = startX + i * spacing;
      marks.push(
        <g key={i}>
          <line x1={cx - 3} y1={markY - 3} x2={cx + 3} y2={markY + 3} stroke={color} strokeWidth={1.2} />
          <line x1={cx + 3} y1={markY - 3} x2={cx - 3} y2={markY + 3} stroke={color} strokeWidth={1.2} />
        </g>
      );
    }
  } else if (sym.includes('|')) {
    // Vertical bars for company-regiment
    const count = sym.length;
    const spacing = 4;
    const startX = -(count - 1) * spacing / 2;
    for (let i = 0; i < count; i++) {
      marks.push(
        <line key={i} x1={startX + i * spacing} y1={markY - 4}
          x2={startX + i * spacing} y2={markY + 2}
          stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      );
    }
  } else if (sym.includes('●')) {
    // Dots for team/squad/platoon
    const count = sym.split('●').length - 1;
    const spacing = 5;
    const startX = -(count - 1) * spacing / 2;
    for (let i = 0; i < count; i++) {
      marks.push(
        <circle key={i} cx={startX + i * spacing} cy={markY}
          r={1.5} fill={color} />
      );
    }
  }

  return <g>{marks}</g>;
}

// ── Confidence indicator ──
function ConfidenceIndicator({ confidence, x, y }: { confidence: ConfidenceLevel; x: number; y: number }) {
  if (confidence === 'confirmed') return null; // No indicator needed for confirmed
  const cfg = CONFIDENCE_LABELS[confidence];
  return (
    <g>
      <rect x={x - 2} y={y - 5} width={cfg.label.length * 3.8 + 4} height={8} rx={2}
        fill="rgba(0,0,0,0.6)" />
      <text x={x} y={y} fill={cfg.color} fontSize="5" fontFamily="var(--font-mono)"
        fontWeight="600" dominantBaseline="central">
        {confidence === 'probable' ? '?' : confidence === 'possible' ? '??' : '???'}
      </text>
    </g>
  );
}

export default function MilitarySymbol({ element, isSelected }: Props) {
  const sym = MILITARY_SYMBOLS.find((s) => s.id === element.militarySymbol);
  if (!sym) return null;

  const color = element.fill.type === 'solid' ? element.fill.color : FACTION_COLORS[element.faction || 'friendly'];
  const faction = element.faction || 'friendly';
  const echelon = element.echelon || 'company';
  const confidence = element.confidence || 'confirmed';
  const isPictorial = PICTORIAL_CATEGORIES.includes(sym.category);
  const factionColor = FACTION_COLORS[faction];

  // Pictorial symbols: rendered larger, no frame
  const scale = isPictorial ? 2.0 : 1;
  const contentW = 24;
  const contentH = 20;
  const boxW = isPictorial ? contentW * scale : 36;
  const boxH = isPictorial ? contentH * scale : 28;

  return (
    <g transform={`translate(${element.x}, ${element.y}) rotate(${element.rotation})`}>
      {/* NATO APP-6 Faction Frame */}
      <FactionFrame
        faction={faction} w={boxW + 4} h={boxH + 4}
        color={factionColor} isSelected={isSelected}
        confidence={confidence}
      />

      {/* Echelon indicator above frame */}
      <EchelonIndicator echelon={echelon} y={-boxH / 2 - 4} color={factionColor} />

      {/* Confidence indicator */}
      <ConfidenceIndicator confidence={confidence} x={boxW / 2 + 4} y={-boxH / 2 + 2} />

      {/* Pictorial: dashed selection outline */}
      {isPictorial && isSelected && (
        <rect x={-boxW / 2 - 5} y={-boxH / 2 - 5} width={boxW + 10} height={boxH + 10} rx={4}
          fill="none" stroke="#FFD700" strokeWidth={1.5} strokeDasharray="4 2" />
      )}

      {/* Symbol content */}
      <g
        transform={isPictorial
          ? `translate(${-boxW / 2}, ${-boxH / 2}) scale(${scale})`
          : `translate(${-boxW / 2 + 6}, ${-boxH / 2 + 4})`
        }
        dangerouslySetInnerHTML={{ __html: sym.svgContent.replace(/currentColor/g, color) }}
      />

      {/* Faction color stripe at bottom */}
      <rect x={-boxW / 2 - 2} y={boxH / 2 + 2} width={boxW + 4} height={2}
        rx={1} fill={factionColor} opacity={0.6} />

      {/* Label below */}
      {element.content && (
        <text y={boxH / 2 + 14} textAnchor="middle" fill="var(--ed-canvas-text, white)" fontSize="7"
          fontFamily="var(--font-body)" opacity={0.8} pointerEvents="none">
          {element.content}
        </text>
      )}
    </g>
  );
}

// Preview for the tool palette / symbol picker
export function MilitarySymbolPreview({ symbolId, size = 20, color = '#D4A74F' }: { symbolId: string; size?: number; color?: string }) {
  const sym = MILITARY_SYMBOLS.find((s) => s.id === symbolId);
  if (!sym) return null;
  const isPictorial = PICTORIAL_CATEGORIES.includes(sym.category);
  return (
    <svg width={size} height={size} viewBox="0 0 24 20" style={{ flexShrink: 0 }}>
      {!isPictorial && <rect x="0" y="0" width="24" height="20" rx="2" fill="none" stroke={color} strokeWidth="1.5" />}
      <g dangerouslySetInnerHTML={{ __html: sym.svgContent.replace(/currentColor/g, color) }} />
    </svg>
  );
}
