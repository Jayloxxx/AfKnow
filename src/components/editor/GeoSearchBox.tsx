import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import type { CanvasTransformState } from './useCanvasTransform';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  boundingbox: [string, string, string, string]; // south, north, west, east
}

interface Props {
  transform: CanvasTransformState;
  geoToSvg: (lon: number, lat: number) => [number, number];
  onPlaceMarker?: (x: number, y: number, label: string) => void;
}

export default function GeoSearchBox({ transform, geoToSvg, onPlaceMarker }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastRequestRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced Nominatim search (300ms + 1s rate limit)
  useEffect(() => {
    if (query.length < 3) { setResults([]); setIsOpen(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const now = Date.now();
      const gap = now - lastRequestRef.current;
      if (gap < 1000) {
        await new Promise(r => setTimeout(r, 1000 - gap));
      }
      lastRequestRef.current = Date.now();
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&accept-language=de,en`,
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const goToResult = useCallback((result: NominatimResult) => {
    const lon = parseFloat(result.lon);
    const lat = parseFloat(result.lat);
    const [svgX, svgY] = geoToSvg(lon, lat);

    // Calculate zoom from bounding box
    const [south, north, west, east] = result.boundingbox.map(Number);
    const [x1] = geoToSvg(west, north);
    const [x2] = geoToSvg(east, south);
    const spanX = Math.abs(x2 - x1);
    const targetZoom = Math.max(2, Math.min(500, 800 / Math.max(spanX, 1)));

    transform.animateTo(svgX, svgY, targetZoom);
    setQuery(result.display_name.split(',')[0]);
    setIsOpen(false);
  }, [geoToSvg, transform]);

  const placeMarkerAtResult = useCallback((result: NominatimResult, e: React.MouseEvent) => {
    e.stopPropagation();
    const [svgX, svgY] = geoToSvg(parseFloat(result.lon), parseFloat(result.lat));
    onPlaceMarker?.(svgX, svgY, result.display_name.split(',')[0]);
    goToResult(result);
  }, [geoToSvg, onPlaceMarker, goToResult]);

  return (
    <div style={{
      position: 'absolute', top: 10, left: 10, zIndex: 50,
      width: focused || isOpen ? 320 : 200,
      transition: 'width 0.2s ease',
    }}>
      {/* Search input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
        borderRadius: isOpen ? '10px 10px 0 0' : 10, padding: '6px 10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        {loading ? <Loader2 size={14} style={{ color: 'var(--accent-hex)', animation: 'spin 1s linear infinite' }} /> : <Search size={14} style={{ color: 'var(--ed-text-muted)' }} />}
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); if (results.length > 0) setIsOpen(true); }}
          onBlur={() => setTimeout(() => { setFocused(false); setIsOpen(false); }, 200)}
          placeholder="Ort suchen..."
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--ed-text)', fontSize: 12, fontFamily: 'var(--font-body)',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={12} style={{ color: 'var(--ed-text-muted)' }} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div style={{
          background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)', borderTop: 'none',
          borderRadius: '0 0 10px 10px', overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          maxHeight: 300, overflowY: 'auto',
        }}>
          {results.map(r => (
            <button
              key={r.place_id}
              onClick={() => goToResult(r)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', border: 'none', cursor: 'pointer',
                background: 'transparent', textAlign: 'left',
                borderBottom: '1px solid var(--ed-border)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--ed-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Search size={11} style={{ color: 'var(--ed-text-dim)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ed-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.display_name.split(',')[0]}
                </div>
                <div style={{ fontSize: 9, color: 'var(--ed-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.display_name.split(',').slice(1, 3).join(',')}
                </div>
              </div>
              {onPlaceMarker && (
                <button
                  onClick={e => placeMarkerAtResult(r, e)}
                  title="Marker setzen"
                  style={{
                    background: 'var(--ed-btn)', border: '1px solid var(--ed-border)',
                    borderRadius: 4, padding: '2px 5px', cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}>
                  <MapPin size={10} style={{ color: 'var(--accent-hex)' }} />
                  <span style={{ fontSize: 9, color: 'var(--ed-text-muted)' }}>Pin</span>
                </button>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
