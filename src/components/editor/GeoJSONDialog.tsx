import { useState, useCallback, useRef } from 'react';
import { Upload, Download, FileJson, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { importGeoJSON, exportToGeoJSON, downloadGeoJSON, type GeoJSONImportResult, type GeoJSONExportOptions } from '../../lib/geojson';
import type { EditorElement } from './types';

interface Props {
  mode: 'import' | 'export';
  onClose: () => void;
  onImport: (elements: EditorElement[]) => void;
  exportOptions: GeoJSONExportOptions;
  geoToSvg: (lon: number, lat: number) => [number, number];
}

export default function GeoJSONDialog({ mode, onClose, onImport, exportOptions, geoToSvg }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<GeoJSONImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((text: string) => {
    try {
      const json = JSON.parse(text);
      if (!json.type || !['FeatureCollection', 'Feature', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'].includes(json.type)) {
        setError('Ungültiges GeoJSON: Kein erkannter GeoJSON-Typ');
        return;
      }
      const res = importGeoJSON(json, geoToSvg);
      setResult(res);
      setError(null);
    } catch (e) {
      setError(`JSON-Parse-Fehler: ${(e as Error).message}`);
    }
  }, [geoToSvg]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => processFile(reader.result as string);
    reader.readAsText(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => processFile(reader.result as string);
    reader.readAsText(file);
  }, [processFile]);

  const handleDoImport = useCallback(() => {
    if (!result) return;
    onImport(result.elements);
    onClose();
  }, [result, onImport, onClose]);

  const handleExport = useCallback(() => {
    const fc = exportToGeoJSON(exportOptions);
    downloadGeoJSON(fc, exportOptions.mapName);
    onClose();
  }, [exportOptions, onClose]);

  const featureCount = exportOptions.elements.filter(e => e.visible).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
        borderRadius: 16, padding: 24, width: 460, maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ed-active)' }}>
              <FileJson size={16} style={{ color: 'var(--accent-hex)' }} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ed-text)', fontFamily: 'var(--font-display)', margin: 0 }}>
              GeoJSON {mode === 'import' ? 'importieren' : 'exportieren'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ed-text-muted)', cursor: 'pointer' }}><X size={16} /></button>
        </div>

        {mode === 'import' ? (
          <>
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent-hex)' : 'var(--ed-border-strong)'}`,
                borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer',
                background: dragOver ? 'rgba(var(--accent-500)/.05)' : 'var(--ed-bg)',
                transition: 'all 0.2s',
              }}
            >
              <Upload size={28} style={{ color: 'var(--ed-text-muted)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 12, color: 'var(--ed-text)', fontWeight: 600, margin: '0 0 4px' }}>
                GeoJSON-Datei hierher ziehen
              </p>
              <p style={{ fontSize: 10, color: 'var(--ed-text-muted)', margin: 0 }}>
                oder klicken zum Auswählen (.geojson, .json)
              </p>
              <input ref={fileRef} type="file" accept=".geojson,.json,application/geo+json,application/json"
                onChange={handleFileSelect} style={{ display: 'none' }} />
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: 10, borderRadius: 8, background: 'rgba(239,68,68,.08)' }}>
                <AlertTriangle size={14} style={{ color: '#f87171' }} />
                <span style={{ fontSize: 11, color: '#f87171' }}>{error}</span>
              </div>
            )}

            {/* Import result preview */}
            {result && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <CheckCircle size={14} style={{ color: '#4ade80' }} />
                  <span style={{ fontSize: 12, color: 'var(--ed-text)', fontWeight: 600 }}>
                    {result.elements.length} Elemente erkannt
                  </span>
                </div>
                {result.warnings.length > 0 && (
                  <div style={{ fontSize: 10, color: '#fbbf24', marginBottom: 8 }}>
                    {result.warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
                  </div>
                )}
                {/* Type breakdown */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(result.elements.reduce((acc, el) => { acc[el.type] = (acc[el.type] || 0) + 1; return acc; }, {} as Record<string, number>))
                    .map(([type, count]) => (
                      <span key={type} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: 'var(--ed-btn)', color: 'var(--ed-text-muted)' }}>
                        {type}: {count}
                      </span>
                    ))}
                </div>

                <button onClick={handleDoImport}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))', color: 'white',
                    fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    marginTop: 16,
                  }}>
                  <Upload size={14} /> {result.elements.length} Elemente importieren
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Export info */}
            <div style={{ padding: 16, borderRadius: 12, background: 'var(--ed-bg)', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ed-text)', marginBottom: 4 }}>
                {featureCount} sichtbare Elemente werden exportiert
              </div>
              <p style={{ fontSize: 10, color: 'var(--ed-text-muted)', margin: 0, lineHeight: 1.5 }}>
                Alle Elemente werden als GeoJSON FeatureCollection exportiert.
                Koordinaten werden automatisch von SVG nach WGS84 (lon/lat) konvertiert.
              </p>
            </div>

            <button onClick={handleExport}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))', color: 'white',
                fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              <Download size={14} /> GeoJSON herunterladen
            </button>
          </>
        )}
      </div>
    </div>
  );
}
