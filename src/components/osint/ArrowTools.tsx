import { ArrowRight, X, Trash2 } from 'lucide-react';
import {
  useOsintStore, ARROW_TYPE_CONFIG,
  type ArrowType,
} from '../../store/useOsintStore';
import { ACTOR_CONFIG, type Actor } from '../../data/osintData';

export default function ArrowTools() {
  const {
    mode, pendingArrowType, pendingArrowActor, pendingArrowPoints,
    setPendingArrow, clearPendingArrow, addArrow,
    arrows, removeArrow, selectedArrowId, setSelectedArrowId,
  } = useOsintStore();

  const actors: Actor[] = ['usa', 'iran', 'proxy-iran', 'proxy-usa', 'neutral'];

  const finishArrow = () => {
    if (pendingArrowPoints.length >= 2) {
      addArrow({
        id: `arrow-${Date.now()}`,
        arrowType: pendingArrowType,
        actor: pendingArrowActor,
        label: '',
        points: pendingArrowPoints,
        createdAt: new Date().toISOString(),
      });
    }
    clearPendingArrow();
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ArrowRight size={11} className="text-orange-400" />
        <span className="text-[9px] font-black text-white uppercase tracking-[0.1em]">Wirkungspfeile</span>
      </div>

      {/* Actor selector */}
      <div className="flex items-center gap-1 flex-wrap">
        {actors.map(a => {
          const cfg = ACTOR_CONFIG[a];
          return (
            <button key={a}
              onClick={() => setPendingArrow(pendingArrowType, a)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[8px] font-bold transition-all"
              style={pendingArrowActor === a ? {
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
              } : {
                background: 'rgba(255,255,255,0.03)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.06)',
              }}>
              <span>{cfg.flag}</span>
              <span className="hidden xl:inline">{cfg.name}</span>
            </button>
          );
        })}
      </div>

      {/* Arrow type buttons */}
      <div className="grid grid-cols-2 gap-1">
        {(Object.entries(ARROW_TYPE_CONFIG) as [ArrowType, typeof ARROW_TYPE_CONFIG[ArrowType]][]).map(([type, cfg]) => {
          const isActive = mode === 'draw-arrow' && pendingArrowType === type;
          return (
            <button key={type}
              onClick={() => setPendingArrow(type, pendingArrowActor)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-md transition-all"
              style={isActive ? {
                background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, color: cfg.color,
              } : {
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af',
              }}>
              <div className="w-6 h-0.5 rounded" style={{
                background: cfg.color,
                ...(cfg.dashArray ? { backgroundImage: `repeating-linear-gradient(90deg, ${cfg.color} 0px, ${cfg.color} 4px, transparent 4px, transparent 8px)`, background: 'none' } : {}),
              }} />
              <span className="text-[8px] font-bold">{cfg.nameDE}</span>
            </button>
          );
        })}
      </div>

      {/* Drawing state */}
      {mode === 'draw-arrow' && (
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-md"
          style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.20)' }}>
          <span className="text-[9px] font-bold text-orange-400">
            {pendingArrowPoints.length === 0
              ? 'Klicke auf die Karte (Startpunkt)'
              : `${pendingArrowPoints.length} Punkt${pendingArrowPoints.length > 1 ? 'e' : ''} — Klicke weiter oder`}
          </span>
          {pendingArrowPoints.length >= 2 && (
            <button onClick={finishArrow}
              className="px-2 py-0.5 rounded text-[8px] font-bold text-green-400 transition-all"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
              Fertig
            </button>
          )}
          <button onClick={clearPendingArrow}
            className="ml-auto w-5 h-5 rounded flex items-center justify-center text-gray-500 hover:text-red-400 transition-all">
            <X size={10} />
          </button>
        </div>
      )}

      {/* Existing arrows list */}
      {arrows.length > 0 && (
        <div className="mt-1">
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">
            Pfeile ({arrows.length})
          </span>
          <div className="mt-1 space-y-0.5 max-h-[160px] overflow-y-auto scrollbar-thin">
            {arrows.map(arrow => {
              const cfg = ARROW_TYPE_CONFIG[arrow.arrowType];
              const actorCfg = ACTOR_CONFIG[arrow.actor];
              const isSelected = selectedArrowId === arrow.id;
              return (
                <div key={arrow.id}
                  onClick={() => setSelectedArrowId(isSelected ? null : arrow.id)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-all group"
                  style={isSelected ? {
                    background: `${cfg.color}10`, border: `1px solid ${cfg.color}25`,
                  } : {
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                  <div className="w-4 h-0.5 rounded" style={{ background: cfg.color }} />
                  <span className="text-[8px] font-bold" style={{ color: cfg.color }}>{cfg.nameDE}</span>
                  <span className="text-[8px] text-gray-600">{actorCfg.flag}</span>
                  <span className="text-[7px] text-gray-600 ml-auto">{arrow.points.length} Pkt.</span>
                  <button
                    onClick={e => { e.stopPropagation(); removeArrow(arrow.id); }}
                    className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded flex items-center justify-center text-gray-600 hover:text-red-400 transition-all">
                    <Trash2 size={8} />
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
