// OSM-compatible tile calculation utilities for SVG rendering

export interface OsmTile {
  z: number;
  x: number;
  y: number;
  svgX: number;
  svgY: number;
  svgW: number;
  svgH: number;
  url: string;
}

function lon2tileX(lon: number, z: number): number {
  return Math.floor(((lon + 180) / 360) * (1 << z));
}

function lat2tileY(lat: number, z: number): number {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * (1 << z));
}

function tileX2lon(x: number, z: number): number {
  return (x / (1 << z)) * 360 - 180;
}

function tileY2lat(y: number, z: number): number {
  const n = Math.PI - (2 * Math.PI * y) / (1 << z);
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
}

/** Tile URL providers */
export const TILE_PROVIDERS: Record<string, string> = {
  // ── OpenStreetMap ──
  osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  topo: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
  hot: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',

  // ── Stadia Maps (free tier, no key for low volume) ──
  'stadia-dark': 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
  'stadia-light': 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
  'stadia-terrain': 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png',

  // ── CartoDB ──
  'carto-dark': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  'carto-voyager': 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  'carto-positron': 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',

  // ── ESRI ──
  'satellite-live': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  'esri-topo': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  'esri-street': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  'esri-ocean': 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',

  // ── Sentinel-2 (ESA, free, yearly cloud-free composite) ──
  sentinel: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg',
};

/** Projection interface for parameterized tile calculation */
export interface TileProjection {
  geoToSvg: (lon: number, lat: number) => [number, number];
  svgToGeo: (x: number, y: number) => [number, number];
}

/**
 * Compute visible OSM tiles that cover the given SVG viewBox.
 * Tiles are positioned using the provided projection (or defaults to Africa).
 */
export function getVisibleOsmTiles(
  viewBox: { x: number; y: number; w: number; h: number },
  canvasZoom: number,
  tileUrlTemplate: string,
  maxTiles = 500,
  projection?: TileProjection,
): OsmTile[] {
  // Each doubling of canvasZoom = +1 OSM tile zoom level
  // canvasZoom 1 ≈ continent view (z=4), canvasZoom 32768 ≈ street level (z=19)
  const z = Math.max(2, Math.min(19, Math.floor(Math.log2(canvasZoom) + 4)));

  // Inverse projection: SVG coords → lon/lat
  const svgToGeo = projection?.svgToGeo ?? defaultSvgToGeo;
  const geoToSvg = projection?.geoToSvg ?? defaultGeoToSvg;

  const [lonWest, latNorth] = svgToGeo(viewBox.x, viewBox.y);
  const [lonEast, latSouth] = svgToGeo(viewBox.x + viewBox.w, viewBox.y + viewBox.h);

  const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const xMin = lon2tileX(cl(lonWest, -180, 180), z);
  const xMax = lon2tileX(cl(lonEast, -180, 180), z);
  const yMin = lat2tileY(cl(latNorth, -85, 85), z);
  const yMax = lat2tileY(cl(latSouth, -85, 85), z);

  if ((xMax - xMin + 1) * (yMax - yMin + 1) > maxTiles) return [];

  const tiles: OsmTile[] = [];
  const mx = (1 << z) - 1;

  for (let tx = xMin; tx <= xMax; tx++) {
    for (let ty = yMin; ty <= yMax; ty++) {
      if (tx < 0 || tx > mx || ty < 0 || ty > mx) continue;

      const [sx1, sy1] = geoToSvg(tileX2lon(tx, z), tileY2lat(ty, z));
      const [sx2, sy2] = geoToSvg(tileX2lon(tx + 1, z), tileY2lat(ty + 1, z));

      const subdomains = ['a', 'b', 'c'];
      tiles.push({
        z, x: tx, y: ty,
        svgX: sx1, svgY: sy1,
        svgW: sx2 - sx1, svgH: sy2 - sy1,
        url: tileUrlTemplate
          .replace('{z}', String(z))
          .replace('{x}', String(tx))
          .replace('{y}', String(ty))
          .replace('{s}', subdomains[(tx + ty) % 3])
          .replace('{r}', ''),
      });
    }
  }

  return tiles;
}

// Default Africa projection (backwards compatible)
function defaultGeoToSvg(lon: number, lat: number): [number, number] {
  return [50 + (lon + 18) * 13, 30 + (38 - lat) * 14.5];
}

function defaultSvgToGeo(x: number, y: number): [number, number] {
  const lon = (x - 50) / 13 - 18;
  const lat = 38 - (y - 30) / 14.5;
  return [lon, lat];
}
