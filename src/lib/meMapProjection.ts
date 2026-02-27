import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';

// ISO numeric → ISO alpha-2 mapping for Middle East countries (20)
const numericToAlpha2: Record<string, string> = {
  '760': 'SY',  // Syria
  '422': 'LB',  // Lebanon
  '400': 'JO',  // Jordan
  '376': 'IL',  // Israel
  '275': 'PS',  // Palestine
  '196': 'CY',  // Cyprus
  '784': 'AE',  // UAE
  '634': 'QA',  // Qatar
  '048': 'BH',  // Bahrain
  '414': 'KW',  // Kuwait
  '368': 'IQ',  // Iraq
  '364': 'IR',  // Iran
  '004': 'AF',  // Afghanistan
  '586': 'PK',  // Pakistan
  '682': 'SA',  // Saudi Arabia
  '512': 'OM',  // Oman
  '887': 'YE',  // Yemen
  '792': 'TR',  // Turkey
  '818': 'EG',  // Egypt
  '434': 'LY',  // Libya
};

// ME country ISO numeric codes for filtering
const meNumericCodes = new Set(Object.keys(numericToAlpha2));

interface ProjectedCountry {
  id: string; // alpha-2
  path: string;
  center: [number, number];
}

// Equirectangular projection matching ME ViewBox 0 0 1000 1100
// 24°E–76°E → x: 50–950, 10°N–44°N → y: 30–1070
function projectCoord(lon: number, lat: number): [number, number] {
  const x = 50 + (lon - 24) * 17.31;
  const y = 30 + (44 - lat) * 30.59;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

function ringToPath(ring: number[][]): string {
  return ring
    .map(([lon, lat], i) => {
      const [x, y] = projectCoord(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ') + 'Z';
}

function geometryToPath(geometry: GeoJSON.Geometry): string {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map(ringToPath).join(' ');
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates
      .map((polygon) => polygon.map(ringToPath).join(' '))
      .join(' ');
  }
  return '';
}

function geometryCenter(geometry: GeoJSON.Geometry): [number, number] {
  let coords: number[][] = [];
  if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    let maxLen = 0;
    for (const poly of geometry.coordinates) {
      if (poly[0].length > maxLen) {
        maxLen = poly[0].length;
        coords = poly[0];
      }
    }
  }
  if (coords.length === 0) return [500, 550];
  const sumLon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const sumLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  return projectCoord(sumLon, sumLat);
}

export function loadMEMap(topoData: Topology): ProjectedCountry[] {
  const geoCollection = topoData.objects.countries as GeometryCollection;
  const geojson = feature(topoData, geoCollection);
  const results: ProjectedCountry[] = [];

  for (const feat of geojson.features) {
    const numericId = String(feat.id ?? (feat.properties as Record<string, unknown>)?.id ?? '').padStart(3, '0');
    if (!meNumericCodes.has(numericId)) continue;

    const alpha2 = numericToAlpha2[numericId];
    if (!alpha2) continue;

    const path = geometryToPath(feat.geometry);
    const center = geometryCenter(feat.geometry);

    if (path) {
      results.push({ id: alpha2, path, center });
    }
  }

  return results;
}

export type { ProjectedCountry };
