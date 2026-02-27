import { Shield, X, GripVertical } from 'lucide-react';
import { useOsintStore, UNIT_TYPE_CONFIG, type UnitType } from '../../store/useOsintStore';
import { ACTOR_CONFIG, type Actor } from '../../data/osintData';

export default function UnitPalette() {
  const {
    mode, pendingUnitType, pendingUnitActor,
    setPendingUnit, customUnits, removeUnit, setSelectedUnitId, selectedUnitId,
  } = useOsintStore();

  const actors: Actor[] = ['usa', 'iran', 'proxy-iran', 'proxy-usa', 'neutral'];

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield size={11} className="text-green-400" />
        <span className="text-[9px] font-black text-white uppercase tracking-[0.1em]">Einheiten platzieren</span>
      </div>

      {/* Actor selector */}
      <div className="flex items-center gap-1 flex-wrap">
        {actors.map(a => {
          const cfg = ACTOR_CONFIG[a];
          return (
            <button key={a}
              onClick={() => setPendingUnit(pendingUnitType, a)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[8px] font-bold transition-all"
              style={pendingUnitActor === a ? {
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

      {/* Unit type grid */}
      <div className="grid grid-cols-3 gap-1">
        {(Object.entries(UNIT_TYPE_CONFIG) as [UnitType, typeof UNIT_TYPE_CONFIG[UnitType]][]).map(([type, cfg]) => {
          const isActive = mode === 'place-unit' && pendingUnitType === type;
          const actorCfg = ACTOR_CONFIG[pendingUnitActor];
          return (
            <button key={type}
              onClick={() => setPendingUnit(isActive ? null : type, pendingUnitActor)}
              className="flex flex-col items-center gap-1 px-2 py-2 rounded-md text-center transition-all"
              style={isActive ? {
                background: `${actorCfg.color}15`,
                border: `1px solid ${actorCfg.color}30`,
                color: actorCfg.color,
              } : {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#9ca3af',
              }}>
              <span className="text-base">{cfg.symbol}</span>
              <span className="text-[7px] font-bold leading-tight">{cfg.nameDE}</span>
            </button>
          );
        })}
      </div>

      {/* Placed units list */}
      {customUnits.length > 0 && (
        <div className="mt-1">
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">
            Platzierte Einheiten ({customUnits.length})
          </span>
          <div className="mt-1 space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-thin">
            {customUnits.map(unit => {
              const cfg = UNIT_TYPE_CONFIG[unit.unitType];
              const actorCfg = ACTOR_CONFIG[unit.actor];
              const isSelected = selectedUnitId === unit.id;
              return (
                <div key={unit.id}
                  onClick={() => setSelectedUnitId(isSelected ? null : unit.id)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-all group"
                  style={isSelected ? {
                    background: `${actorCfg.color}10`, border: `1px solid ${actorCfg.color}25`,
                  } : {
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                  <GripVertical size={8} className="text-gray-700" />
                  <span className="text-xs">{cfg.symbol}</span>
                  <span className="text-[9px] font-bold flex-1 truncate" style={{ color: actorCfg.color }}>
                    {unit.label || cfg.nameDE}
                  </span>
                  <span className="text-[8px] text-gray-600">{actorCfg.flag}</span>
                  <button
                    onClick={e => { e.stopPropagation(); removeUnit(unit.id); }}
                    className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded flex items-center justify-center text-gray-600 hover:text-red-400 transition-all">
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
