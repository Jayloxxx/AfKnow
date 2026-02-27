import { Cloud, Thermometer, Droplets, Wind, Gauge, AlertTriangle } from 'lucide-react';
import { WEATHER_LAYERS, hasWeatherApiKey } from '../../lib/weatherTiles';

const LAYER_ICONS: Record<string, typeof Cloud> = {
  temp: Thermometer,
  precipitation: Droplets,
  wind: Wind,
  clouds: Cloud,
  pressure: Gauge,
};

const LAYER_COLORS: Record<string, string> = {
  temp: '#ef4444',
  precipitation: '#3b82f6',
  wind: '#22c55e',
  clouds: '#94a3b8',
  pressure: '#a855f7',
};

interface Props {
  activeLayers: string[];
  setActiveLayers: (layers: string[]) => void;
  opacity: number;
  setOpacity: (o: number) => void;
}

export default function WeatherPanel({ activeLayers, setActiveLayers, opacity, setOpacity }: Props) {
  const hasKey = hasWeatherApiKey();

  const toggleLayer = (id: string) => {
    if (activeLayers.includes(id)) {
      setActiveLayers(activeLayers.filter(l => l !== id));
    } else {
      setActiveLayers([...activeLayers, id]);
    }
  };

  return (
    <div style={{
      padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{
        fontSize: 9, fontWeight: 700, color: 'var(--accent-hex)',
        fontFamily: 'var(--font-display)', textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        Wetter-Overlay
      </div>

      {!hasKey && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px',
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 6, fontSize: 9, color: '#f59e0b',
          fontFamily: 'var(--font-display)',
        }}>
          <AlertTriangle size={12} />
          <span>VITE_OWM_API_KEY fehlt in .env</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {WEATHER_LAYERS.map(layer => {
          const Icon = LAYER_ICONS[layer.id] || Cloud;
          const color = LAYER_COLORS[layer.id] || '#6b7280';
          const isActive = activeLayers.includes(layer.id);
          return (
            <button key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              disabled={!hasKey}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
                borderRadius: 6, border: isActive ? `1px solid ${color}50` : '1px solid transparent',
                background: isActive ? `color-mix(in srgb, ${color} 12%, transparent)` : 'var(--ed-btn)',
                color: isActive ? color : 'var(--ed-text-muted)', cursor: hasKey ? 'pointer' : 'not-allowed',
                fontSize: 10, fontFamily: 'var(--font-display)', textAlign: 'left',
                opacity: hasKey ? 1 : 0.4,
                transition: 'all 0.15s ease',
              }}>
              <Icon size={12} />
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>

      {activeLayers.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            Deckkraft
          </span>
          <input type="range" min={10} max={90} value={opacity * 100}
            onChange={e => setOpacity(Number(e.target.value) / 100)}
            style={{ flex: 1, accentColor: 'var(--accent-hex)' }} />
          <span style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)', width: 28, textAlign: 'right' }}>
            {Math.round(opacity * 100)}%
          </span>
        </div>
      )}

      <div style={{ fontSize: 8, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)' }}>
        Daten: OpenWeatherMap · Cache: 3h
      </div>
    </div>
  );
}
