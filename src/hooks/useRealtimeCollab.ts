/**
 * Real-time collaboration hook using Supabase Realtime.
 * Broadcasts element changes and cursor positions.
 * Gracefully degrades if Supabase is not configured.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

export interface CollabUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  lastSeen: number;
}

export interface CollabChange {
  type: 'add' | 'update' | 'remove';
  elementId: string;
  data?: Record<string, unknown>;
  timestamp: number;
  userId: string;
}

interface UseRealtimeCollabOptions {
  mapId: string | null;
  userId: string;
  userName: string;
  enabled: boolean;
}

const COLLAB_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4'];

export function useRealtimeCollab({ mapId, userId, userName, enabled }: UseRealtimeCollabOptions) {
  const [users, setUsers] = useState<CollabUser[]>([]);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<unknown>(null);

  // Check if Supabase client is available
  const supabaseAvailable = useRef(false);

  useEffect(() => {
    if (!enabled || !mapId) {
      setConnected(false);
      setUsers([]);
      return;
    }

    // Try to dynamically import supabase client
    let cleanup = false;

    (async () => {
      try {
        // Attempt dynamic import — will fail gracefully if not configured
        const { supabase } = await import('../lib/supabaseClient');
        if (cleanup || !supabase) return;

        supabaseAvailable.current = true;
        const channel = supabase.channel(`map:${mapId}`, {
          config: { presence: { key: userId } },
        });

        // Presence tracking
        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const collabUsers: CollabUser[] = [];
          for (const [key, presences] of Object.entries(state)) {
            if (key === userId) continue;
            const p = (presences as Record<string, unknown>[])[0];
            collabUsers.push({
              id: key,
              name: (p?.name as string) || 'Unbekannt',
              color: COLLAB_COLORS[collabUsers.length % COLLAB_COLORS.length],
              cursor: p?.cursor as { x: number; y: number } | undefined,
              lastSeen: Date.now(),
            });
          }
          setUsers(collabUsers);
        });

        // Element change broadcast
        channel.on('broadcast', { event: 'element-change' }, ({ payload }: { payload: unknown }) => {
          // Emit to subscribers via custom event
          window.dispatchEvent(new CustomEvent('collab-change', { detail: payload }));
        });

        // Cursor broadcast
        channel.on('broadcast', { event: 'cursor-move' }, ({ payload }: { payload: { userId: string; cursor: { x: number; y: number } } }) => {
          setUsers(prev => prev.map(u =>
            u.id === payload.userId ? { ...u, cursor: payload.cursor, lastSeen: Date.now() } : u
          ));
        });

        channel.subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            setConnected(true);
            await channel.track({ name: userName, cursor: null });
          }
        });

        channelRef.current = channel;
      } catch {
        // Supabase not available — collab disabled silently
        supabaseAvailable.current = false;
        setConnected(false);
      }
    })();

    return () => {
      cleanup = true;
      if (channelRef.current && supabaseAvailable.current) {
        try {
          (channelRef.current as { unsubscribe: () => void }).unsubscribe();
        } catch {}
      }
      channelRef.current = null;
      setConnected(false);
      setUsers([]);
    };
  }, [enabled, mapId, userId, userName]);

  const broadcastChange = useCallback((change: Omit<CollabChange, 'timestamp' | 'userId'>) => {
    if (!channelRef.current || !connected) return;
    try {
      (channelRef.current as { send: (msg: Record<string, unknown>) => void }).send({
        type: 'broadcast',
        event: 'element-change',
        payload: { ...change, timestamp: Date.now(), userId },
      });
    } catch {}
  }, [connected, userId]);

  const broadcastCursor = useCallback((cursor: { x: number; y: number }) => {
    if (!channelRef.current || !connected) return;
    try {
      (channelRef.current as { send: (msg: Record<string, unknown>) => void }).send({
        type: 'broadcast',
        event: 'cursor-move',
        payload: { userId, cursor },
      });
    } catch {}
  }, [connected, userId]);

  return {
    users,
    connected,
    broadcastChange,
    broadcastCursor,
    available: supabaseAvailable.current,
  };
}
