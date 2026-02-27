import type { EditorCountry, EditorElement } from './types';

interface Props {
  countries: EditorCountry[];
  elements: EditorElement[];
}

export default function SvgDefs({ countries, elements }: Props) {
  return (
    <defs>
      {/* ═══ Base Patterns ═══ */}
      <pattern id="pat-stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill="var(--pat-bg, transparent)" />
        <line x1="0" y1="0" x2="0" y2="8" stroke="var(--pat-fg, white)" strokeWidth="2.5" />
      </pattern>
      <pattern id="pat-crosshatch" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="var(--pat-bg, transparent)" />
        <line x1="0" y1="0" x2="8" y2="8" stroke="var(--pat-fg, white)" strokeWidth="1" />
        <line x1="8" y1="0" x2="0" y2="8" stroke="var(--pat-fg, white)" strokeWidth="1" />
      </pattern>
      <pattern id="pat-dots" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="var(--pat-bg, transparent)" />
        <circle cx="4" cy="4" r="1.5" fill="var(--pat-fg, white)" />
      </pattern>
      <pattern id="pat-diagonal-lines" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <rect width="6" height="6" fill="var(--pat-bg, transparent)" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--pat-fg, white)" strokeWidth="1.5" />
      </pattern>

      {/* ═══ Arrow Markers ═══ */}
      <marker id="mk-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
        <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
      </marker>
      <marker id="mk-arrow-start" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto" markerUnits="strokeWidth">
        <polygon points="10 0, 0 3.5, 10 7" fill="currentColor" />
      </marker>
      <marker id="mk-circle" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="strokeWidth">
        <circle cx="4" cy="4" r="3" fill="currentColor" />
      </marker>
      <marker id="mk-diamond" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
        <polygon points="5 0, 10 5, 5 10, 0 5" fill="currentColor" />
      </marker>

      {/* ═══ Frontline Marker (teeth) ═══ */}
      <marker id="mk-frontline" markerWidth="8" markerHeight="6" refX="4" refY="6" orient="auto" markerUnits="userSpaceOnUse">
        <polygon points="0,6 4,0 8,6" fill="currentColor" />
      </marker>

      {/* ═══ Ocean Gradients (theme-aware) ═══ */}
      <radialGradient id="ed-ocean" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stopColor="var(--ed-ocean-start)" />
        <stop offset="100%" stopColor="var(--ed-ocean-end)" />
      </radialGradient>
      <pattern id="ed-grid" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="var(--ed-grid-stroke)" strokeWidth="0.5" />
      </pattern>

      {/* ═══ Per-Country Dynamic Fills ═══ */}
      {countries.map((cc) => {
        const { fill } = cc;
        if (fill.type === 'gradient') {
          const rad = (fill.angle * Math.PI) / 180;
          return (
            <linearGradient key={`gf-${cc.id}`} id={`fill-${cc.id}`}
              x1={`${50 - Math.cos(rad) * 50}%`} y1={`${50 + Math.sin(rad) * 50}%`}
              x2={`${50 + Math.cos(rad) * 50}%`} y2={`${50 - Math.sin(rad) * 50}%`}>
              <stop offset="0%" stopColor={fill.color1} />
              <stop offset="100%" stopColor={fill.color2} />
            </linearGradient>
          );
        }
        if (fill.type === 'half') {
          const isH = fill.direction === 'horizontal';
          const isD = fill.direction === 'diagonal';
          return (
            <linearGradient key={`hf-${cc.id}`} id={`fill-${cc.id}`}
              x1="0" y1="0" x2={isH || isD ? '1' : '0'} y2={isH ? '0' : '1'}
              gradientUnits="objectBoundingBox">
              <stop offset="49.9%" stopColor={fill.color1} />
              <stop offset="50.1%" stopColor={fill.color2} />
            </linearGradient>
          );
        }
        if (fill.type === 'pattern') {
          return (
            <pattern key={`pf-${cc.id}`} id={`fill-${cc.id}`}
              width="8" height="8" patternUnits="userSpaceOnUse"
              patternTransform={fill.patternId === 'stripes' ? 'rotate(45)' : fill.patternId === 'diagonal-lines' ? 'rotate(30)' : ''}>
              <rect width="8" height="8" fill={fill.backgroundColor} />
              {fill.patternId === 'stripes' && <line x1="0" y1="0" x2="0" y2="8" stroke={fill.color} strokeWidth="2.5" />}
              {fill.patternId === 'crosshatch' && <>
                <line x1="0" y1="0" x2="8" y2="8" stroke={fill.color} strokeWidth="1" />
                <line x1="8" y1="0" x2="0" y2="8" stroke={fill.color} strokeWidth="1" />
              </>}
              {fill.patternId === 'dots' && <circle cx="4" cy="4" r="1.5" fill={fill.color} />}
              {fill.patternId === 'diagonal-lines' && <line x1="0" y1="0" x2="0" y2="6" stroke={fill.color} strokeWidth="1.5" />}
            </pattern>
          );
        }
        return null;
      })}

      {/* ═══ Per-Element Dynamic Fills ═══ */}
      {elements.map((el) => {
        const { fill } = el;
        if (fill.type === 'gradient') {
          const rad = (fill.angle * Math.PI) / 180;
          return (
            <linearGradient key={`gfe-${el.id}`} id={`efill-${el.id}`}
              x1={`${50 - Math.cos(rad) * 50}%`} y1={`${50 + Math.sin(rad) * 50}%`}
              x2={`${50 + Math.cos(rad) * 50}%`} y2={`${50 - Math.sin(rad) * 50}%`}>
              <stop offset="0%" stopColor={fill.color1} />
              <stop offset="100%" stopColor={fill.color2} />
            </linearGradient>
          );
        }
        if (fill.type === 'half') {
          const isH = fill.direction === 'horizontal';
          const isD = fill.direction === 'diagonal';
          return (
            <linearGradient key={`hfe-${el.id}`} id={`efill-${el.id}`}
              x1="0" y1="0" x2={isH || isD ? '1' : '0'} y2={isH ? '0' : '1'}
              gradientUnits="objectBoundingBox">
              <stop offset="49.9%" stopColor={fill.color1} />
              <stop offset="50.1%" stopColor={fill.color2} />
            </linearGradient>
          );
        }
        return null;
      })}
    </defs>
  );
}
