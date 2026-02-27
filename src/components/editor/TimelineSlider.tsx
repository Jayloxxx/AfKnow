import { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, Plus, X, SkipBack, SkipForward, ChevronUp, ChevronDown, Gauge, Download, Image, Film } from 'lucide-react';
import type { TimelinePhase } from './types';
import { exportTimelineAsGif, downloadPngSeries, downloadBlob } from '../../lib/timelineExport';

const SPEED_OPTIONS = [
  { label: '0.5s', ms: 500 },
  { label: '1s', ms: 1000 },
  { label: '2s', ms: 2000 },
  { label: '4s', ms: 4000 },
];

interface Props {
  phases: TimelinePhase[];
  setPhases: React.Dispatch<React.SetStateAction<TimelinePhase[]>>;
  activePhaseId: string;
  setActivePhaseId: (id: string) => void;
  onPhaseChange?: (phaseId: string) => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

const PHASE_COLORS = [
  '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#A855F7',
  '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#8B5CF6',
];

export default function TimelineSlider({ phases, setPhases, activePhaseId, setActivePhaseId, onPhaseChange, svgRef }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [speedMs, setSpeedMs] = useState(2000);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const playInterval = useRef<number | null>(null);

  const activeIdx = phases.findIndex(p => p.id === activePhaseId);

  const addPhase = useCallback(() => {
    const idx = phases.length;
    const newPhase: TimelinePhase = {
      id: `phase-${Date.now()}`,
      label: `Phase ${idx + 1}`,
      timestamp: idx,
      color: PHASE_COLORS[idx % PHASE_COLORS.length],
    };
    setPhases(prev => [...prev, newPhase]);
    setActivePhaseId(newPhase.id);
  }, [phases, setPhases, setActivePhaseId]);

  const removePhase = useCallback((id: string) => {
    setPhases(prev => {
      const next = prev.filter(p => p.id !== id);
      if (activePhaseId === id && next.length > 0) {
        setActivePhaseId(next[0].id);
      }
      return next;
    });
  }, [activePhaseId, setPhases, setActivePhaseId]);

  const updatePhaseLabel = useCallback((id: string, label: string) => {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, label } : p));
  }, [setPhases]);

  const goToPhase = useCallback((idx: number) => {
    if (idx >= 0 && idx < phases.length) {
      setActivePhaseId(phases[idx].id);
      onPhaseChange?.(phases[idx].id);
    }
  }, [phases, setActivePhaseId, onPhaseChange]);

  const goNext = useCallback(() => {
    if (activeIdx < phases.length - 1) goToPhase(activeIdx + 1);
  }, [activeIdx, phases.length, goToPhase]);

  const goPrev = useCallback(() => {
    if (activeIdx > 0) goToPhase(activeIdx - 1);
  }, [activeIdx, goToPhase]);

  // Auto-play
  useEffect(() => {
    if (isPlaying && phases.length > 1) {
      playInterval.current = window.setInterval(() => {
        const idx = phases.findIndex(p => p.id === activePhaseId);
        const nextIdx = (idx + 1) % phases.length;
        const nextId = phases[nextIdx].id;
        setActivePhaseId(nextId);
        onPhaseChange?.(nextId);
      }, speedMs);
    }
    return () => {
      if (playInterval.current) clearInterval(playInterval.current);
    };
  }, [isPlaying, phases, setActivePhaseId, onPhaseChange, speedMs]);

  if (phases.length === 0) {
    return (
      <div style={{
        padding: '4px 12px', borderTop: '1px solid var(--ed-border)',
        background: 'var(--ed-toolbar)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 8, flexShrink: 0,
      }}>
        <button onClick={addPhase} style={{
          padding: '3px 10px', borderRadius: 5, border: '1px dashed var(--ed-border-strong)',
          background: 'transparent', color: 'var(--ed-text-muted)', fontSize: 10,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: 'var(--font-display)',
        }}>
          <Plus size={10} /> Timeline starten
        </button>
      </div>
    );
  }

  return (
    <div style={{
      borderTop: '1px solid var(--ed-border)', background: 'var(--ed-toolbar)',
      flexShrink: 0, overflow: 'hidden',
    }}>
      {/* Collapse toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '3px 10px', borderBottom: collapsed ? 'none' : '1px solid var(--ed-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, color: 'var(--accent-hex)',
            fontFamily: 'var(--font-display)', textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Timeline
          </span>
          <span style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)' }}>
            {activeIdx + 1}/{phases.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={addPhase} style={tinyBtn} title="Phase hinzufugen">
            <Plus size={10} />
          </button>
          <button onClick={() => setCollapsed(!collapsed)} style={tinyBtn}>
            {collapsed ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={goPrev} disabled={activeIdx <= 0} style={{ ...ctrlBtn, opacity: activeIdx <= 0 ? 0.3 : 1 }}>
              <SkipBack size={11} />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} style={{
              ...ctrlBtn,
              background: isPlaying ? 'color-mix(in srgb, var(--accent-hex) 20%, transparent)' : 'var(--ed-btn)',
              color: isPlaying ? 'var(--accent-hex)' : 'var(--ed-icon)',
            }}>
              {isPlaying ? <Pause size={11} /> : <Play size={11} />}
            </button>
            <button onClick={goNext} disabled={activeIdx >= phases.length - 1} style={{ ...ctrlBtn, opacity: activeIdx >= phases.length - 1 ? 0.3 : 1 }}>
              <SkipForward size={11} />
            </button>

            {/* Speed Control */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                style={{ ...ctrlBtn, fontSize: 8, fontFamily: 'var(--font-mono)', width: 'auto', padding: '0 6px', gap: 2 }}
                title="Geschwindigkeit">
                <Gauge size={9} />
                <span>{SPEED_OPTIONS.find(s => s.ms === speedMs)?.label || '2s'}</span>
              </button>
              {showSpeedMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowSpeedMenu(false)} />
                  <div style={{
                    position: 'absolute', bottom: '100%', left: 0, marginBottom: 4,
                    background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
                    borderRadius: 6, overflow: 'hidden', zIndex: 50,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}>
                    {SPEED_OPTIONS.map(s => (
                      <button key={s.ms} onClick={() => { setSpeedMs(s.ms); setShowSpeedMenu(false); }}
                        style={{
                          display: 'block', width: '100%', padding: '4px 12px', border: 'none', cursor: 'pointer',
                          background: speedMs === s.ms ? 'var(--ed-active)' : 'transparent',
                          color: speedMs === s.ms ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
                          fontSize: 10, fontFamily: 'var(--font-mono)', textAlign: 'left',
                        }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Export Control */}
            {svgRef && phases.length > 1 && (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exporting}
                  style={{ ...ctrlBtn, fontSize: 8, fontFamily: 'var(--font-mono)', width: 'auto', padding: '0 6px', gap: 2,
                    opacity: exporting ? 0.5 : 1 }}
                  title="Timeline exportieren">
                  <Download size={9} />
                  <span>{exporting ? '...' : 'Export'}</span>
                </button>
                {showExportMenu && !exporting && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowExportMenu(false)} />
                    <div style={{
                      position: 'absolute', bottom: '100%', left: 0, marginBottom: 4,
                      background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
                      borderRadius: 6, overflow: 'hidden', zIndex: 50,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: 120,
                    }}>
                      <button onClick={async () => {
                        setShowExportMenu(false);
                        if (!svgRef.current) return;
                        setExporting(true);
                        try {
                          await downloadPngSeries(svgRef.current, phases);
                        } catch (e) { console.error('PNG export failed:', e); }
                        setExporting(false);
                      }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 12px',
                          border: 'none', cursor: 'pointer', background: 'transparent',
                          color: 'var(--ed-text-muted)', fontSize: 10, fontFamily: 'var(--font-display)', textAlign: 'left',
                        }}>
                        <Image size={10} /> PNG-Serie
                      </button>
                      <button onClick={async () => {
                        setShowExportMenu(false);
                        if (!svgRef.current) return;
                        setExporting(true);
                        try {
                          const gif = await exportTimelineAsGif(svgRef.current, phases, speedMs);
                          downloadBlob(gif, `timeline-${Date.now()}.gif`);
                        } catch (e) { console.error('GIF export failed:', e); }
                        setExporting(false);
                      }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 12px',
                          border: 'none', cursor: 'pointer', background: 'transparent',
                          color: 'var(--ed-text-muted)', fontSize: 10, fontFamily: 'var(--font-display)', textAlign: 'left',
                        }}>
                        <Film size={10} /> Animiertes GIF
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Phase Track */}
            <div style={{
              flex: 1, height: 28, position: 'relative', display: 'flex',
              alignItems: 'center', marginLeft: 4,
            }}>
              {/* Track line with colored segments */}
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '50%',
                height: 3, background: 'var(--ed-border-strong)', borderRadius: 2,
                transform: 'translateY(-50%)', overflow: 'hidden', display: 'flex',
              }}>
                {phases.length > 1 && phases.map((phase, i) => (
                  <div key={phase.id} style={{
                    flex: 1, height: '100%',
                    background: i <= activeIdx ? phase.color : 'transparent',
                    opacity: i <= activeIdx ? 0.6 : 0,
                    transition: 'opacity 0.3s ease, background 0.3s ease',
                  }} />
                ))}
              </div>
              {/* Phase dots */}
              {phases.map((phase, i) => {
                const isActive = phase.id === activePhaseId;
                const pos = phases.length > 1 ? (i / (phases.length - 1)) * 100 : 50;
                return (
                  <div key={phase.id} style={{
                    position: 'absolute', left: `${pos}%`, top: '50%',
                    transform: 'translate(-50%, -50%)', zIndex: isActive ? 3 : 1,
                    cursor: 'pointer',
                  }} onClick={() => goToPhase(i)}>
                    <div style={{
                      width: isActive ? 14 : 10, height: isActive ? 14 : 10,
                      borderRadius: '50%', background: phase.color,
                      border: isActive ? '2px solid white' : '2px solid var(--ed-border-strong)',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? `0 0 8px ${phase.color}66` : 'none',
                    }} />
                    <span style={{
                      position: 'absolute', top: isActive ? 16 : 12,
                      left: '50%', transform: 'translateX(-50%)',
                      fontSize: 7, whiteSpace: 'nowrap',
                      color: isActive ? 'var(--ed-text)' : 'var(--ed-text-dim)',
                      fontFamily: 'var(--font-mono)', fontWeight: isActive ? 700 : 400,
                    }}>
                      {phase.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase list */}
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 8 }}>
            {phases.map((phase, i) => {
              const isActive = phase.id === activePhaseId;
              return (
                <div key={phase.id} style={{
                  display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px',
                  borderRadius: 4, fontSize: 9, cursor: 'pointer',
                  background: isActive ? `color-mix(in srgb, ${phase.color} 20%, transparent)` : 'var(--ed-btn)',
                  border: isActive ? `1px solid ${phase.color}50` : '1px solid transparent',
                  color: isActive ? phase.color : 'var(--ed-text-muted)',
                }} onClick={() => goToPhase(i)}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    backgroundColor: phase.color,
                  }} />
                  {editingId === phase.id ? (
                    <input
                      autoFocus
                      value={phase.label}
                      onChange={(e) => updatePhaseLabel(phase.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      style={{
                        width: 50, background: 'transparent', border: 'none',
                        color: 'inherit', fontSize: 9, outline: 'none', padding: 0,
                      }}
                    />
                  ) : (
                    <span onDoubleClick={() => setEditingId(phase.id)}>
                      {phase.label}
                    </span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); removePhase(phase.id); }}
                    style={{ ...tinyBtn, marginLeft: 2 }}>
                    <X size={8} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const tinyBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--ed-icon-dim)', display: 'flex', alignItems: 'center', padding: 0,
};

const ctrlBtn: React.CSSProperties = {
  width: 24, height: 24, borderRadius: 5, border: 'none', cursor: 'pointer',
  background: 'var(--ed-btn)', color: 'var(--ed-icon)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
