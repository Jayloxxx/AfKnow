import { useState, useCallback, useRef } from 'react';
import { GripVertical } from 'lucide-react';

interface Props {
  leftLabel: string;
  rightLabel: string;
  width: number;
  height: number;
  children: [React.ReactNode, React.ReactNode]; // [left layer, right layer]
}

export default function SentinelCompareSlider({ leftLabel, rightLabel, width, height, children }: Props) {
  const [splitPos, setSplitPos] = useState(50); // percentage 0-100
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !dragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setSplitPos(pct);
  }, []);

  const handleMouseDown = useCallback(() => {
    dragging.current = true;
    const onMove = (e: MouseEvent) => handleMove(e.clientX);
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [handleMove]);

  return (
    <div ref={containerRef} style={{
      position: 'relative', width, height, overflow: 'hidden',
      borderRadius: 8, border: '1px solid var(--ed-border-strong)',
    }}>
      {/* Left layer (full width, clipped) */}
      <div style={{
        position: 'absolute', inset: 0,
        clipPath: `inset(0 ${100 - splitPos}% 0 0)`,
      }}>
        {children[0]}
      </div>

      {/* Right layer (full width, clipped) */}
      <div style={{
        position: 'absolute', inset: 0,
        clipPath: `inset(0 0 0 ${splitPos}%)`,
      }}>
        {children[1]}
      </div>

      {/* Divider line */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: `${splitPos}%`, transform: 'translateX(-50%)',
        width: 3, background: 'white', zIndex: 10,
        boxShadow: '0 0 8px rgba(0,0,0,0.5)',
      }} />

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute', top: '50%', left: `${splitPos}%`,
          transform: 'translate(-50%, -50%)', zIndex: 11,
          width: 28, height: 28, borderRadius: '50%',
          background: 'white', color: '#1a1a2e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'ew-resize', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>
        <GripVertical size={14} />
      </div>

      {/* Labels */}
      <div style={{
        position: 'absolute', top: 8, left: 8, zIndex: 5,
        padding: '3px 8px', borderRadius: 4,
        background: 'rgba(0,0,0,0.7)', color: 'white',
        fontSize: 9, fontFamily: 'var(--font-display)', fontWeight: 600,
      }}>
        {leftLabel}
      </div>
      <div style={{
        position: 'absolute', top: 8, right: 8, zIndex: 5,
        padding: '3px 8px', borderRadius: 4,
        background: 'rgba(0,0,0,0.7)', color: 'white',
        fontSize: 9, fontFamily: 'var(--font-display)', fontWeight: 600,
      }}>
        {rightLabel}
      </div>
    </div>
  );
}
