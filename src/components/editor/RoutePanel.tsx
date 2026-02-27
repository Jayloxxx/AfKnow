import { useState } from 'react';
import { Navigation, Car, Footprints, Download, Trash2, MapPin, X } from 'lucide-react';
import type { RouteProfile, RouteResult } from '../../lib/routePlanner';
import { getRoute, downloadGpx } from '../../lib/routePlanner';

interface Props {
  waypoints: [number, number][]; // geo coords [lon, lat]
  setWaypoints: (wps: [number, number][]) => void;
  onRouteCalculated: (route: RouteResult) => void;
  onClose: () => void;
}

export default function RoutePanel({ waypoints, setWaypoints, onRouteCalculated, onClose }: Props) {
  const [profile, setProfile] = useState<RouteProfile>('car');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RouteResult | null>(null);

  const calculate = async () => {
    if (waypoints.length < 2) return;
    setLoading(true);
    setError('');
    try {
      const route = await getRoute(waypoints, profile);
      setResult(route);
      onRouteCalculated(route);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Route fehlgeschlagen');
    }
    setLoading(false);
  };

  const removeWaypoint = (idx: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== idx));
  };

  const formatDuration = (min: number) => {
    if (min < 60) return `${Math.round(min)} min`;
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${h}h ${m}min`;
  };

  return (
    <div style={{
      position: 'absolute', top: 8, right: 8, zIndex: 30, width: 260,
      background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
      borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', borderBottom: '1px solid var(--ed-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Navigation size={12} style={{ color: 'var(--accent-hex)' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ed-text)', fontFamily: 'var(--font-display)' }}>
            Routenplanung
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ed-text-muted)', cursor: 'pointer' }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Profile selection */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { id: 'car' as const, label: 'Auto', icon: Car },
            { id: 'foot' as const, label: 'Fuß', icon: Footprints },
          ].map(p => (
            <button key={p.id} onClick={() => setProfile(p.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: profile === p.id ? 'color-mix(in srgb, var(--accent-hex) 20%, transparent)' : 'var(--ed-btn)',
                color: profile === p.id ? 'var(--accent-hex)' : 'var(--ed-text-muted)',
                fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 600,
              }}>
              <p.icon size={11} /> {p.label}
            </button>
          ))}
        </div>

        {/* Waypoints */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--ed-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>
            Wegpunkte
          </div>
          {waypoints.length === 0 && (
            <div style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontStyle: 'italic', padding: '4px 0' }}>
              Klicke auf die Karte um Wegpunkte zu setzen
            </div>
          )}
          {waypoints.map((wp, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '3px 6px',
              background: 'var(--ed-btn)', borderRadius: 4,
            }}>
              <MapPin size={9} style={{ color: i === 0 ? '#22c55e' : i === waypoints.length - 1 ? '#ef4444' : '#3b82f6', flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: 'var(--ed-text-muted)', fontFamily: 'var(--font-mono)', flex: 1 }}>
                {wp[1].toFixed(4)}, {wp[0].toFixed(4)}
              </span>
              <button onClick={() => removeWaypoint(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ed-icon-dim)', padding: 0, display: 'flex' }}>
                <X size={8} />
              </button>
            </div>
          ))}
          <div style={{ fontSize: 8, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)' }}>
            {waypoints.length < 2 ? `Noch ${2 - waypoints.length} Punkt(e) nötig` : `${waypoints.length} Punkte`}
          </div>
        </div>

        {/* Calculate button */}
        <button onClick={calculate} disabled={waypoints.length < 2 || loading}
          style={{
            padding: '6px 10px', borderRadius: 6, border: 'none', cursor: waypoints.length < 2 ? 'not-allowed' : 'pointer',
            background: waypoints.length >= 2 ? 'var(--accent-hex)' : 'var(--ed-btn)',
            color: waypoints.length >= 2 ? '#fff' : 'var(--ed-text-dim)',
            fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)',
            opacity: loading ? 0.6 : 1,
          }}>
          {loading ? 'Berechne...' : 'Route berechnen'}
        </button>

        {error && (
          <div style={{ fontSize: 9, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>{error}</div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            padding: '8px', background: 'color-mix(in srgb, var(--accent-hex) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-hex) 20%, transparent)',
            borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-hex)', fontFamily: 'var(--font-display)' }}>
                {result.distanceKm.toFixed(1)} km
              </span>
              <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {formatDuration(result.durationMinutes)}
              </span>
            </div>
            {result.segments.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {result.segments.map((seg, i) => (
                  <div key={i} style={{ fontSize: 8, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Abschnitt {i + 1}: {seg.distanceKm.toFixed(1)} km · {formatDuration(seg.durationMin)}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => downloadGpx(result, 'afknow-route')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                background: 'var(--ed-btn)', color: 'var(--ed-text-muted)', fontSize: 9,
                fontFamily: 'var(--font-display)',
              }}>
              <Download size={9} /> GPX exportieren
            </button>
          </div>
        )}

        {/* Clear */}
        {waypoints.length > 0 && (
          <button onClick={() => { setWaypoints([]); setResult(null); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
              background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 9,
              fontFamily: 'var(--font-display)',
            }}>
            <Trash2 size={9} /> Route löschen
          </button>
        )}
      </div>
    </div>
  );
}
