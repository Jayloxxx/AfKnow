import type { CollabUser } from '../../hooks/useRealtimeCollab';

interface Props {
  users: CollabUser[];
}

export default function CollabCursors({ users }: Props) {
  // Filter out stale cursors (older than 30s)
  const activeCursors = users.filter(u => u.cursor && (Date.now() - u.lastSeen) < 30_000);

  if (activeCursors.length === 0) return null;

  return (
    <g pointerEvents="none">
      {activeCursors.map(user => (
        <g key={user.id} transform={`translate(${user.cursor!.x}, ${user.cursor!.y})`}>
          {/* Cursor arrow */}
          <path
            d="M0,0 L0,14 L4,10 L8,16 L10,15 L6,9 L12,8 Z"
            fill={user.color}
            stroke="white"
            strokeWidth={0.8}
            style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.4))` }}
          />
          {/* Name label */}
          <g transform="translate(14, 12)">
            <rect
              x={-2} y={-7} width={user.name.length * 5.5 + 8} height={12}
              rx={4} fill={user.color}
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}
            />
            <text
              x={2} y={2} fill="white" fontSize={7}
              fontFamily="var(--font-display)" fontWeight={600}
            >
              {user.name}
            </text>
          </g>
        </g>
      ))}
    </g>
  );
}
