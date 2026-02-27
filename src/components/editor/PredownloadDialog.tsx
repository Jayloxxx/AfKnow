import { useState, useMemo } from 'react';
import { X, Download, HardDrive, Trash2 } from 'lucide-react';
import { predownloadRegion, estimateDownloadSize, clearTileCache } from '../../lib/offlineStorage';
import { TILE_PROVIDERS } from '../../lib/osmTiles';

interface Props {
  onClose: () => void;
  currentMapStyle: string;
  svgToGeo: (x: number, y: number) => [number, number];
}

export default function PredownloadDialog({ onClose, currentMapStyle, svgToGeo }: Props) {
  const [zoomMin, setZoomMin] = useState(4);
  const [zoomMax, setZoomMax] = useState(8);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<{ downloaded: number; failed: number } | null>(null);

  // Approximate the current region bounds (using SVG canvas corners)
  const bounds = useMemo(() => {
    const [lonW, latN] = svgToGeo(0, 0);
    const [lonE, latS] = svgToGeo(1000, 1100);
    return { west: lonW, east: lonE, north: latN, south: latS };
  }, [svgToGeo]);

  const zoomLevels = useMemo(() => {
    const levels: number[] = [];
    for (let z = zoomMin; z <= zoomMax; z++) levels.push(z);
    return levels;
  }, [zoomMin, zoomMax]);

  const estimate = useMemo(() => estimateDownloadSize(bounds, zoomLevels), [bounds, zoomLevels]);

  const tileTemplate = TILE_PROVIDERS[currentMapStyle] || TILE_PROVIDERS['osm'];

  const startDownload = async () => {
    setDownloading(true);
    setProgress({ done: 0, total: estimate.tileCount });
    try {
      const res = await predownloadRegion(bounds, zoomLevels, tileTemplate, (done, total) => {
        setProgress({ done, total });
      });
      setResult(res);
    } catch (e) {
      console.error('Predownload failed:', e);
    }
    setDownloading(false);
  };

  const handleClearCache = async () => {
    await clearTileCache();
    setResult(null);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
        borderRadius: 16, padding: 0, width: 380, maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', borderBottom: '1px solid var(--ed-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HardDrive size={14} style={{ color: 'var(--accent-hex)' }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ed-text)', fontFamily: 'var(--font-display)', margin: 0 }}>
              Offline-Karten
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ed-text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--ed-text-muted)', fontFamily: 'var(--font-display)', lineHeight: 1.5 }}>
            Lade Kartenkacheln für die aktuelle Region vorab herunter, um offline arbeiten zu können.
          </div>

          {/* Zoom range */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-display)', display: 'block', marginBottom: 3 }}>
                Min. Zoom
              </label>
              <input type="range" min={2} max={12} value={zoomMin}
                onChange={e => setZoomMin(Math.min(Number(e.target.value), zoomMax))}
                style={{ width: '100%', accentColor: 'var(--accent-hex)' }} />
              <div style={{ fontSize: 9, color: 'var(--ed-text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{zoomMin}</div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-display)', display: 'block', marginBottom: 3 }}>
                Max. Zoom
              </label>
              <input type="range" min={2} max={12} value={zoomMax}
                onChange={e => setZoomMax(Math.max(Number(e.target.value), zoomMin))}
                style={{ width: '100%', accentColor: 'var(--accent-hex)' }} />
              <div style={{ fontSize: 9, color: 'var(--ed-text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{zoomMax}</div>
            </div>
          </div>

          {/* Estimate */}
          <div style={{
            padding: '8px 12px', background: 'var(--ed-btn)', borderRadius: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 10, color: 'var(--ed-text-muted)', fontFamily: 'var(--font-display)' }}>
              {estimate.tileCount.toLocaleString()} Kacheln
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-hex)', fontFamily: 'var(--font-mono)' }}>
              ~{estimate.estimatedMB} MB
            </span>
          </div>

          {/* Progress */}
          {downloading && (
            <div>
              <div style={{
                height: 6, background: 'var(--ed-border-strong)', borderRadius: 3, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', background: 'var(--accent-hex)', borderRadius: 3,
                  width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%`,
                  transition: 'width 0.2s ease',
                }} />
              </div>
              <div style={{ fontSize: 9, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)', marginTop: 4, textAlign: 'center' }}>
                {progress.done} / {progress.total}
              </div>
            </div>
          )}

          {/* Result */}
          {result && !downloading && (
            <div style={{
              padding: '8px 12px', borderRadius: 8,
              background: result.failed === 0 ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${result.failed === 0 ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
              fontSize: 10, color: result.failed === 0 ? '#22c55e' : '#f59e0b',
              fontFamily: 'var(--font-display)',
            }}>
              {result.downloaded} heruntergeladen{result.failed > 0 ? `, ${result.failed} fehlgeschlagen` : ''}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={startDownload} disabled={downloading}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px', borderRadius: 8, border: 'none', cursor: downloading ? 'not-allowed' : 'pointer',
                background: 'var(--accent-hex)', color: '#fff', fontSize: 11, fontWeight: 700,
                fontFamily: 'var(--font-display)', opacity: downloading ? 0.6 : 1,
              }}>
              <Download size={12} /> {downloading ? 'Lädt...' : 'Herunterladen'}
            </button>
            <button onClick={handleClearCache}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 10,
                fontFamily: 'var(--font-display)', cursor: 'pointer',
              }}>
              <Trash2 size={10} /> Cache leeren
            </button>
          </div>

          <div style={{ fontSize: 8, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)' }}>
            Kartenstil: {currentMapStyle} · Daten: IndexedDB
          </div>
        </div>
      </div>
    </div>
  );
}
