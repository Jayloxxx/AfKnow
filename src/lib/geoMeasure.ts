/**
 * Geographic measurement utilities for the AfKnow map editor.
 * Haversine distance, spherical polygon area, bearing, coordinate formats.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — mgrs has no type declarations bundled
import { forward as toMGRSRaw } from 'mgrs';

const R = 6371; // Earth radius in km
const DEG = Math.PI / 180;

/** Haversine distance between two points in km */
export function haversineKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const dLat = (lat2 - lat1) * DEG;
  const dLon = (lon2 - lon1) * DEG;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Total path distance for an array of [lon, lat] coordinates */
export function pathDistanceKm(coords: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineKm(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]);
  }
  return total;
}

/** Segment distances for each leg of a path */
export function segmentDistancesKm(coords: [number, number][]): number[] {
  const segs: number[] = [];
  for (let i = 1; i < coords.length; i++) {
    segs.push(haversineKm(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]));
  }
  return segs;
}

/**
 * Spherical polygon area using the spherical excess formula.
 * coords: array of [lon, lat] in degrees (not closed — function handles closure).
 * Returns area in km².
 */
export function sphericalPolygonAreaKm2(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const n = coords.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lon1 = coords[i][0] * DEG;
    const lat1 = coords[i][1] * DEG;
    const lon2 = coords[j][0] * DEG;
    const lat2 = coords[j][1] * DEG;
    sum += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  return Math.abs(sum) * R * R / 2;
}

/** Initial bearing (azimuth) from point 1 to point 2 in degrees [0, 360) */
export function bearingDeg(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const dLon = (lon2 - lon1) * DEG;
  const y = Math.sin(dLon) * Math.cos(lat2 * DEG);
  const x = Math.cos(lat1 * DEG) * Math.sin(lat2 * DEG) -
    Math.sin(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.cos(dLon);
  const brng = Math.atan2(y, x) / DEG;
  return (brng + 360) % 360;
}

/** Convert bearing degrees to cardinal direction string */
export function bearingToCardinal(deg: number): string {
  const dirs = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// ─── Coordinate Format Converters ───

/** Decimal degrees string */
export function toDD(lon: number, lat: number): string {
  return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
}

/** Degrees, minutes, seconds */
export function toDMS(lon: number, lat: number): string {
  const fmt = (v: number, pos: string, neg: string) => {
    const dir = v >= 0 ? pos : neg;
    v = Math.abs(v);
    const d = Math.floor(v);
    const m = Math.floor((v - d) * 60);
    const s = ((v - d - m / 60) * 3600).toFixed(1);
    return `${d}°${String(m).padStart(2, '0')}'${String(s).padStart(4, '0')}"${dir}`;
  };
  return `${fmt(lat, 'N', 'S')} ${fmt(lon, 'E', 'W')}`;
}

/** UTM zone + easting/northing */
export function toUTM(lon: number, lat: number): string {
  // Simplified UTM conversion
  const zone = Math.floor((lon + 180) / 6) + 1;
  const letter = lat >= 0 ? 'N' : 'S';
  const lonOrigin = (zone - 1) * 6 - 180 + 3;
  const k0 = 0.9996;
  const a = 6378137;
  const f = 1 / 298.257223563;
  const e2 = 2 * f - f * f;
  const e2p = e2 / (1 - e2);
  const latR = lat * DEG;
  const lonR = (lon - lonOrigin) * DEG;
  const N = a / Math.sqrt(1 - e2 * Math.sin(latR) ** 2);
  const T = Math.tan(latR) ** 2;
  const C = e2p * Math.cos(latR) ** 2;
  const A = lonR * Math.cos(latR);
  const M = a * ((1 - e2 / 4 - 3 * e2 * e2 / 64) * latR -
    (3 * e2 / 8 + 3 * e2 * e2 / 32) * Math.sin(2 * latR) +
    (15 * e2 * e2 / 256) * Math.sin(4 * latR));
  const easting = k0 * N * (A + (1 - T + C) * A ** 3 / 6) + 500000;
  const northing = k0 * (M + N * Math.tan(latR) * (A ** 2 / 2 + (5 - T + 9 * C + 4 * C * C) * A ** 4 / 24)) + (lat < 0 ? 10000000 : 0);
  return `${zone}${letter} ${Math.round(easting)}m E ${Math.round(northing)}m N`;
}

/** MGRS grid reference */
export function toMGRS(lon: number, lat: number): string {
  try {
    return toMGRSRaw([lon, lat], 4) as string;
  } catch {
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  }
}

export type CoordFormat = 'dd' | 'dms' | 'utm' | 'mgrs';

export function formatCoord(lon: number, lat: number, format: CoordFormat): string {
  switch (format) {
    case 'dd': return toDD(lon, lat);
    case 'dms': return toDMS(lon, lat);
    case 'utm': return toUTM(lon, lat);
    case 'mgrs': return toMGRS(lon, lat);
  }
}

/** Format a distance for display */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Format an area for display */
export function formatArea(km2: number): string {
  if (km2 < 1) return `${(km2 * 1e6).toFixed(0)} m²`;
  if (km2 < 100) return `${km2.toFixed(1)} km²`;
  return `${Math.round(km2).toLocaleString('de-DE')} km²`;
}
