import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';

// ISO numeric → ISO alpha-2 mapping for African countries
const numericToAlpha2: Record<string, string> = {
  '012': 'DZ', '024': 'AO', '204': 'BJ', '072': 'BW', '854': 'BF',
  '108': 'BI', '120': 'CM', '132': 'CV', '140': 'CF', '148': 'TD',
  '174': 'KM', '178': 'CG', '180': 'CD', '262': 'DJ', '818': 'EG',
  '226': 'GQ', '232': 'ER', '748': 'SZ', '231': 'ET', '266': 'GA',
  '270': 'GM', '288': 'GH', '324': 'GN', '624': 'GW', '384': 'CI',
  '404': 'KE', '426': 'LS', '430': 'LR', '434': 'LY', '450': 'MG',
  '454': 'MW', '466': 'ML', '478': 'MR', '480': 'MU', '504': 'MA',
  '508': 'MZ', '516': 'NA', '562': 'NE', '566': 'NG', '646': 'RW',
  '678': 'ST', '686': 'SN', '690': 'SC', '694': 'SL', '706': 'SO',
  '710': 'ZA', '728': 'SS', '729': 'SD', '834': 'TZ', '768': 'TG',
  '788': 'TN', '800': 'UG', '894': 'ZM', '716': 'ZW', '732': 'EH',
};

// Africa country ISO numeric codes for filtering
const africaNumericCodes = new Set(Object.keys(numericToAlpha2));

interface ProjectedCountry {
  id: string; // alpha-2
  path: string;
  center: [number, number];
}

// Equirectangular projection matching our ViewBox 0 0 1000 1100
function projectCoord(lon: number, lat: number): [number, number] {
  const x = 50 + (lon + 18) * 13;
  const y = 30 + (38 - lat) * 14.5;
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
    // Use the largest polygon
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

export function loadAfricaMap(topoData: Topology): ProjectedCountry[] {
  const geoCollection = topoData.objects.countries as GeometryCollection;
  const geojson = feature(topoData, geoCollection);
  const results: ProjectedCountry[] = [];

  for (const feat of geojson.features) {
    const numericId = String(feat.id ?? (feat.properties as Record<string, unknown>)?.id ?? '').padStart(3, '0');
    if (!africaNumericCodes.has(numericId)) continue;

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
