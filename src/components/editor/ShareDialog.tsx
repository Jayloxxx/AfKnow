import { useState, useCallback } from 'react';
import { X, Copy, Check, Users, Globe, Lock } from 'lucide-react';
import type { CollabUser } from '../../hooks/useRealtimeCollab';

interface Props {
  onClose: () => void;
  mapId: string;
  mapName: string;
  connected: boolean;
  users: CollabUser[];
}

export default function ShareDialog({ onClose, mapId, mapName, connected, users }: Props) {
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}?map=${mapId}&share=1`;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
        borderRadius: 16, width: 400, maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', borderBottom: '1px solid var(--ed-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={14} style={{ color: 'var(--accent-hex)' }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ed-text)', fontFamily: 'var(--font-display)', margin: 0 }}>
              Karte teilen
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ed-text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Map name */}
          <div style={{ fontSize: 11, color: 'var(--ed-text)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {mapName || 'Unbenannte Karte'}
          </div>

          {/* Connection status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 10px', borderRadius: 6,
            background: connected ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
            border: `1px solid ${connected ? 'rgba(34,197,94,0.3)' : 'rgba(107,114,128,0.3)'}`,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: connected ? '#22c55e' : '#6b7280',
              boxShadow: connected ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
            }} />
            <span style={{
              fontSize: 10, color: connected ? '#22c55e' : '#6b7280',
              fontFamily: 'var(--font-display)',
            }}>
              {connected ? 'Verbunden — Echtzeit aktiv' : 'Nicht verbunden (Supabase nicht konfiguriert)'}
            </span>
          </div>

          {/* Share link */}
          <div>
            <label style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-display)', display: 'block', marginBottom: 4 }}>
              Link zum Teilen
            </label>
            <div style={{ display: 'flex', gap: 4 }}>
              <input readOnly value={shareUrl}
                style={{
                  flex: 1, padding: '6px 10px', borderRadius: 6,
                  background: 'var(--ed-input)', border: '1px solid var(--ed-input-border)',
                  color: 'var(--ed-text)', fontSize: 10, fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }} />
              <button onClick={copyLink}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
                  borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: copied ? 'rgba(34,197,94,0.2)' : 'var(--accent-hex)',
                  color: copied ? '#22c55e' : '#fff', fontSize: 10, fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                }}>
                {copied ? <><Check size={10} /> Kopiert</> : <><Copy size={10} /> Kopieren</>}
              </button>
            </div>
          </div>

          {/* Permission */}
          <div>
            <label style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-display)', display: 'block', marginBottom: 4 }}>
              Berechtigung
            </label>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setPermission('view')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  padding: '6px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: permission === 'view' ? 'color-mix(in srgb, var(--accent-hex) 20%, transparent)' : 'var(--ed-btn)',
                  color: permission === 'view' ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
                  fontSize: 10, fontFamily: 'var(--font-display)',
                }}>
                <Globe size={10} /> Nur ansehen
              </button>
              <button onClick={() => setPermission('edit')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  padding: '6px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: permission === 'edit' ? 'color-mix(in srgb, var(--accent-hex) 20%, transparent)' : 'var(--ed-btn)',
                  color: permission === 'edit' ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
                  fontSize: 10, fontFamily: 'var(--font-display)',
                }}>
                <Lock size={10} /> Bearbeiten
              </button>
            </div>
          </div>

          {/* Active users */}
          {users.length > 0 && (
            <div>
              <label style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-display)', display: 'block', marginBottom: 4 }}>
                Aktive Benutzer ({users.length})
              </label>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {users.map(u => (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                    borderRadius: 12, background: `${u.color}20`, border: `1px solid ${u.color}40`,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: u.color }} />
                    <span style={{ fontSize: 9, color: u.color, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      {u.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
