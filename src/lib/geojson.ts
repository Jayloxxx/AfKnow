/**
 * GeoJSON import/export for the AfKnow map editor.
 * Converts between EditorElements (SVG coords) and GeoJSON (lon/lat).
 */
import type { EditorElement } from '../components/editor/types';
import type { Feature, FeatureCollection, Geometry, Point, LineString, Polygon, Position } from 'geojson';

// ─── Export ──────────────────────────────────────────────────────

export interface GeoJSONExportOptions {
  elements: EditorElement[];
  svgToGeo: (x: number, y: number) => [number, number];
  mapName: string;
}

/** Convert all editor elements to a GeoJSON FeatureCollection */
export function exportToGeoJSON(opts: GeoJSONExportOptions): FeatureCollection {
  const { elements, svgToGeo, mapName } = opts;
  const features: Feature[] = [];

  for (const el of elements) {
    if (!el.visible) continue;
    const feat = elementToFeature(el, svgToGeo);
    if (feat) features.push(feat);
  }

  return {
    type: 'FeatureCollection',
    features,
    // @ts-expect-error -- custom metadata
    name: mapName,
  };
}

function svgToGeoP(x: number, y: number, fn: (x: number, y: number) => [number, number]): Position {
  const [lon, lat] = fn(x, y);
  return [lon, lat];
}

function elementToFeature(
  el: EditorElement,
  svgToGeo: (x: number, y: number) => [number, number],
): Feature | null {
  const props: Record<string, unknown> = {
    afknow_type: el.type,
    name: el.content || undefined,
    fill: el.fill ? (el.fill.type === 'solid' ? el.fill.color : el.fill.type === 'half' ? el.fill.color1 : undefined) : undefined,
    'fill-opacity': el.fill?.opacity ?? 1,
    stroke: el.strokeColor || undefined,
    'stroke-width': el.strokeWidth || undefined,
  };
  if (el.faction && el.faction !== 'neutral') props.faction = el.faction;
  if (el.echelon && el.echelon !== 'team') props.echelon = el.echelon;
  if (el.militarySymbol) props.militarySymbol = el.militarySymbol;
  if (el.confidence) props.confidence = el.confidence;

  let geometry: Geometry | null = null;

  switch (el.type) {
    case 'marker':
    case 'military-unit':
    case 'heatmap-point':
    case 'text': {
      const pos = svgToGeoP(el.x, el.y, svgToGeo);
      geometry = { type: 'Point', coordinates: pos } satisfies Point;
      if (el.type === 'text') props['marker-symbol'] = 'text';
      break;
    }

    case 'line':
    case 'arrow':
    case 'curved-arrow':
    case 'freehand':
    case 'frontline':
    case 'supply-route': {
      if (el.points && el.points.length >= 2) {
        const coords = el.points.map(([px, py]) => svgToGeoP(px, py, svgToGeo));
        geometry = { type: 'LineString', coordinates: coords } satisfies LineString;
      } else {
        // Line defined by x,y + width,height (start/end)
        const x1 = el.x - el.width / 2;
        const y1 = el.y - el.height / 2;
        const x2 = el.x + el.width / 2;
        const y2 = el.y + el.height / 2;
        geometry = {
          type: 'LineString',
          coordinates: [svgToGeoP(x1, y1, svgToGeo), svgToGeoP(x2, y2, svgToGeo)],
        } satisfies LineString;
      }
      break;
    }

    case 'polygon':
    case 'zone': {
      if (el.points && el.points.length >= 3) {
        const coords = el.points.map(([px, py]) => svgToGeoP(px, py, svgToGeo));
        coords.push(coords[0]); // close ring
        geometry = { type: 'Polygon', coordinates: [coords] } satisfies Polygon;
      }
      break;
    }

    case 'rect': {
      const hw = el.width / 2;
      const hh = el.height / 2;
      const corners = [
        [el.x - hw, el.y - hh],
        [el.x + hw, el.y - hh],
        [el.x + hw, el.y + hh],
        [el.x - hw, el.y + hh],
        [el.x - hw, el.y - hh], // close ring
      ];
      const coords = corners.map(([cx, cy]) => svgToGeoP(cx, cy, svgToGeo));
      geometry = { type: 'Polygon', coordinates: [coords] } satisfies Polygon;
      break;
    }

    case 'ellipse':
    case 'range-circle': {
      // Approximate as 64-point polygon
      const rx = el.width / 2;
      const ry = el.height / 2;
      const pts: Position[] = [];
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * 2 * Math.PI;
        pts.push(svgToGeoP(el.x + rx * Math.cos(a), el.y + ry * Math.sin(a), svgToGeo));
      }
      geometry = { type: 'Polygon', coordinates: [pts] } satisfies Polygon;
      break;
    }

    default:
      return null;
  }

  if (!geometry) return null;
  return { type: 'Feature', geometry, properties: props };
}

// ─── Import ──────────────────────────────────────────────────────

export interface GeoJSONImportResult {
  elements: EditorElement[];
  warnings: string[];
}

/** Parse GeoJSON and convert to EditorElements */
export function importGeoJSON(
  input: FeatureCollection | Feature | Geometry,
  geoToSvg: (lon: number, lat: number) => [number, number],
): GeoJSONImportResult {
  const warnings: string[] = [];
  const elements: EditorElement[] = [];

  // Normalize to FeatureCollection
  let features: Feature[];
  if (input.type === 'FeatureCollection') {
    features = input.features;
  } else if (input.type === 'Feature') {
    features = [input];
  } else {
    // Raw geometry
    features = [{ type: 'Feature', geometry: input, properties: {} }];
  }

  for (const feat of features) {
    try {
      const els = featureToElements(feat, geoToSvg);
      elements.push(...els);
    } catch (e) {
      warnings.push(`Skipped feature: ${(e as Error).message}`);
    }
  }

  return { elements, warnings };
}

function makeId(): string {
  return `el-geo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function defaultElement(type: EditorElement['type'], x: number, y: number): EditorElement {
  return {
    id: makeId(), type, x, y, width: 20, height: 20, rotation: 0,
    fill: { type: 'solid', color: '#3b82f6', opacity: 0.6 },
    strokeColor: '#3b82f6', strokeWidth: 2, strokeDasharray: '',
    content: '', fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: '500', textAlign: 'center',
    points: [], arrowStart: 'none', arrowEnd: 'none',
    militarySymbol: '', zonePreset: 'controlled', faction: 'neutral', echelon: 'team', confidence: 'confirmed',
    timelinePhase: '', weaponRangeId: '', imageDataUrl: '',
    zIndex: 0, locked: false, visible: true, groupId: '',
  };
}

function featureToElements(
  feat: Feature,
  geoToSvg: (lon: number, lat: number) => [number, number],
): EditorElement[] {
  const g = feat.geometry;
  const p = feat.properties ?? {};
  const name = (p.name ?? p.title ?? p.Name ?? '') as string;
  const fillColor = (p.fill ?? p['marker-color'] ?? p.color ?? '#3b82f6') as string;
  const strokeColor = (p.stroke ?? p['stroke-color'] ?? fillColor) as string;
  const strokeWidth = Number(p['stroke-width'] ?? 2);
  const opacity = Number(p['fill-opacity'] ?? 0.5);

  switch (g.type) {
    case 'Point': {
      const [x, y] = geoToSvg(g.coordinates[0], g.coordinates[1]);
      const el = defaultElement('marker', x, y);
      el.content = name;
      el.fill = { type: 'solid', color: fillColor, opacity: 1 };
      el.strokeColor = strokeColor;
      return [el];
    }

    case 'MultiPoint':
      return g.coordinates.map(coord => {
        const [x, y] = geoToSvg(coord[0], coord[1]);
        const el = defaultElement('marker', x, y);
        el.content = name;
        el.fill = { type: 'solid', color: fillColor, opacity: 1 };
        return el;
      });

    case 'LineString': {
      const pts: [number, number][] = g.coordinates.map(c => geoToSvg(c[0], c[1]));
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      const el = defaultElement('line', cx, cy);
      el.points = pts;
      el.strokeColor = strokeColor;
      el.strokeWidth = strokeWidth;
      el.fill = { type: 'solid', color: 'transparent', opacity: 0 };
      el.content = name;
      return [el];
    }

    case 'MultiLineString':
      return g.coordinates.map(coords => {
        const pts: [number, number][] = coords.map(c => geoToSvg(c[0], c[1]));
        const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
        const el = defaultElement('line', cx, cy);
        el.points = pts;
        el.strokeColor = strokeColor;
        el.strokeWidth = strokeWidth;
        return el;
      });

    case 'Polygon': {
      const ring = g.coordinates[0];
      const pts: [number, number][] = ring.map(c => geoToSvg(c[0], c[1]));
      // Remove closing duplicate
      if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) {
        pts.pop();
      }
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      const el = defaultElement('polygon', cx, cy);
      el.points = pts;
      el.fill = { type: 'solid', color: fillColor, opacity };
      el.strokeColor = strokeColor;
      el.strokeWidth = strokeWidth;
      el.content = name;
      return [el];
    }

    case 'MultiPolygon':
      return g.coordinates.map(poly => {
        const ring = poly[0];
        const pts: [number, number][] = ring.map(c => geoToSvg(c[0], c[1]));
        if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
        const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
        const el = defaultElement('polygon', cx, cy);
        el.points = pts;
        el.fill = { type: 'solid', color: fillColor, opacity };
        el.strokeColor = strokeColor;
        return el;
      });

    case 'GeometryCollection':
      return g.geometries.flatMap(geom =>
        featureToElements({ type: 'Feature', geometry: geom, properties: feat.properties }, geoToSvg),
      );

    default:
      return [];
  }
}

/** Trigger a file download with the given content */
export function downloadGeoJSON(fc: FeatureCollection, filename: string) {
  const json = JSON.stringify(fc, null, 2);
  const blob = new Blob([json], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.geojson') ? filename : `${filename}.geojson`;
  a.click();
  URL.revokeObjectURL(url);
}
