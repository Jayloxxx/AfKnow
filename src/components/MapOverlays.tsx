import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useRegion } from '../context/RegionContext';
import { mapActors, ACTOR_CATEGORY_CONFIG } from '../data/actors';
import { resourcePoints, pipelines, RESOURCE_CONFIG } from '../data/resources';
import { countryReligions, RELIGION_CONFIG } from '../data/religions';
import { economicAgreements } from '../data/economicAgreements';

export default function MapOverlays({ mapZoom }: { mapZoom: number }) {
  const { showActors, showResources, showReligions, showEconBlocs, selectedEconBloc, setSelectedEconBloc } = useStore();
  const region = useRegion();

  const sz = Math.max(1.5, 3.5 / Math.sqrt(mapZoom));
  const fs = Math.max(2, 4.5 / Math.sqrt(mapZoom));
  const sw = Math.max(0.15, 0.3 / Math.sqrt(mapZoom));

  // (religionMap available for future choropleth use)

  // Active economic bloc
  const activeBloc = useMemo(() => {
    if (!selectedEconBloc) return null;
    return economicAgreements.find(a => a.id === selectedEconBloc) ?? null;
  }, [selectedEconBloc]);

  return (
    <>
      {/* ═══ RELIGION OVERLAY ═══ */}
      {showReligions && countryReligions.map(cr => {
        const country = region.countriesById[cr.countryId];
        if (!country) return null;
        const config = RELIGION_CONFIG[cr.dominant];
        if (!config) return null;
        const pos = country.labelPos;
        return (
          <g key={`rel-${cr.countryId}`}>
            <circle cx={pos[0]} cy={pos[1] + (fs * 1.5)} r={sz * 0.8}
              fill={config.color} opacity={0.7} />
            <text x={pos[0] + sz * 1.5} y={pos[1] + (fs * 1.5) + 1}
              fill={config.color} fontSize={fs * 0.75} fontFamily="var(--font-body)" fontWeight={500} opacity={0.85}
              pointerEvents="none">
              {cr.percentage}% {config.label.split(' ')[0]}
            </text>
          </g>
        );
      })}

      {/* ═══ ECONOMIC BLOCS OVERLAY ═══ */}
      {showEconBlocs && !activeBloc && (
        <g>
          {/* Show legend of blocs as clickable labels - positioned top-left of map */}
          {economicAgreements.slice(0, 8).map((a, i) => (
            <g key={a.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedEconBloc(a.id)}>
              <rect x={15} y={20 + i * 14} width={8} height={8} rx={2} fill={a.color} opacity={0.7} />
              <text x={26} y={27 + i * 14} fill="var(--text)" fontSize={5} fontFamily="var(--font-body)" fontWeight={500} opacity={0.8}>
                {a.shortName} ({a.members.length})
              </text>
            </g>
          ))}
        </g>
      )}

      {showEconBlocs && activeBloc && (
        <g>
          {/* Highlight member countries */}
          {activeBloc.members.map((cId: string) => {
            const country = region.countriesById[cId];
            if (!country) return null;
            const pos = country.labelPos;
            return (
              <circle key={`econ-${cId}`} cx={pos[0]} cy={pos[1]}
                r={sz * 2} fill={activeBloc.color} opacity={0.25} />
            );
          })}
          {/* Back button */}
          <g style={{ cursor: 'pointer' }} onClick={() => setSelectedEconBloc('')}>
            <rect x={15} y={20} width={80} height={12} rx={3} fill="var(--card)" stroke="var(--border)" strokeWidth={0.5} />
            <text x={55} y={28} textAnchor="middle" fill={activeBloc.color} fontSize={5} fontFamily="var(--font-body)" fontWeight={700}>
              {activeBloc.shortName} — {activeBloc.members.length} Mitglieder
            </text>
          </g>
          <g style={{ cursor: 'pointer' }} onClick={() => setSelectedEconBloc('')}>
            <rect x={15} y={34} width={40} height={10} rx={3} fill="var(--card)" stroke="var(--border)" strokeWidth={0.5} />
            <text x={35} y={41} textAnchor="middle" fill="var(--muted)" fontSize={4} fontFamily="var(--font-body)">
              Zurück
            </text>
          </g>
        </g>
      )}

      {/* ═══ RESOURCES OVERLAY ═══ */}
      {showResources && (
        <>
          {/* Pipelines */}
          {pipelines.map(p => {
            const strokeW = Math.max(0.5, 1.5 / Math.sqrt(mapZoom));
            const color = p.type === 'oil' ? '#1a1a1a' : '#0ea5e9';
            const dashArray = p.status === 'operational' ? 'none' :
                              p.status === 'construction' ? `${strokeW * 3} ${strokeW * 2}` :
                              `${strokeW * 1.5} ${strokeW * 2}`;
            const pathD = p.points.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0]} ${pt[1]}`).join(' ');
            return (
              <g key={`pipe-${p.id}`}>
                <path d={pathD} fill="none" stroke={color} strokeWidth={strokeW}
                  strokeDasharray={dashArray} opacity={p.status === 'planned' ? 0.4 : 0.7}
                  strokeLinecap="round" strokeLinejoin="round" />
                {/* Label at midpoint */}
                {p.points.length >= 2 && (
                  <text
                    x={p.points[Math.floor(p.points.length / 2)][0] + 3}
                    y={p.points[Math.floor(p.points.length / 2)][1]}
                    fill={color} fontSize={fs * 0.7} fontFamily="var(--font-body)" fontWeight={500}
                    opacity={0.6} pointerEvents="none">
                    {p.name}
                  </text>
                )}
              </g>
            );
          })}

          {/* Resource Points */}
          {resourcePoints.map(r => {
            const config = RESOURCE_CONFIG[r.type];
            if (!config) return null;
            const isMine = r.type.startsWith('mine_');
            const pointSz = isMine ? sz * 0.9 : sz * 1.1;
            return (
              <g key={`res-${r.id}`}>
                {isMine ? (
                  <polygon
                    points={`${r.coords[0]},${r.coords[1] - pointSz} ${r.coords[0] - pointSz * 0.87},${r.coords[1] + pointSz * 0.5} ${r.coords[0] + pointSz * 0.87},${r.coords[1] + pointSz * 0.5}`}
                    fill={config.color} stroke="rgba(0,0,0,0.3)" strokeWidth={sw} opacity={0.8}
                  />
                ) : (
                  <circle cx={r.coords[0]} cy={r.coords[1]} r={pointSz}
                    fill={config.color} stroke="rgba(0,0,0,0.3)" strokeWidth={sw} opacity={0.8} />
                )}
                <text x={r.coords[0] + pointSz + 2} y={r.coords[1] + 1}
                  fill={config.color} fontSize={fs * 0.75} fontFamily="var(--font-body)" fontWeight={500}
                  opacity={0.7} pointerEvents="none">
                  {r.name}
                </text>
              </g>
            );
          })}
        </>
      )}

      {/* ═══ ACTORS OVERLAY ═══ */}
      {showActors && mapActors.map(actor => {
        const catConfig = ACTOR_CATEGORY_CONFIG[actor.category];
        if (!catConfig) return null;
        return actor.areas.map((area, i) => {
          const actorSz = actor.category === 'terrorist' || actor.category === 'militia' ? sz * 1.2 : sz * 1.0;
          const isPulse = actor.category === 'terrorist' || actor.category === 'pmc';
          return (
            <g key={`actor-${actor.id}-${i}`}>
              {isPulse && (
                <circle cx={area.coords[0]} cy={area.coords[1]} r={actorSz * 2.5}
                  fill="none" stroke={actor.color} strokeWidth={sw * 0.5} opacity={0.2}>
                  <animate attributeName="r" from={actorSz * 1.5} to={actorSz * 3} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {actor.category === 'terrorist' ? (
                <polygon
                  points={`${area.coords[0]},${area.coords[1] - actorSz * 1.2} ${area.coords[0] - actorSz},${area.coords[1] + actorSz * 0.6} ${area.coords[0] + actorSz},${area.coords[1] + actorSz * 0.6}`}
                  fill={actor.color} stroke="rgba(0,0,0,0.4)" strokeWidth={sw}
                />
              ) : actor.category === 'militia' || actor.category === 'rebel' ? (
                <rect
                  x={area.coords[0] - actorSz * 0.7} y={area.coords[1] - actorSz * 0.7}
                  width={actorSz * 1.4} height={actorSz * 1.4}
                  rx={actorSz * 0.2}
                  fill={actor.color} stroke="rgba(0,0,0,0.4)" strokeWidth={sw}
                  transform={`rotate(45 ${area.coords[0]} ${area.coords[1]})`}
                />
              ) : (
                <circle cx={area.coords[0]} cy={area.coords[1]} r={actorSz}
                  fill={actor.color} stroke="rgba(255,255,255,0.5)" strokeWidth={sw} />
              )}
              <text x={area.coords[0] + actorSz + 2} y={area.coords[1] + 1}
                fill={actor.color} fontSize={fs * 0.8} fontFamily="var(--font-body)" fontWeight={600}
                opacity={0.85} pointerEvents="none"
                stroke="rgba(0,0,0,0.5)" strokeWidth={sw * 0.5} paintOrder="stroke">
                {actor.shortName}
              </text>
            </g>
          );
        });
      })}
    </>
  );
}
