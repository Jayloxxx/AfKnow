// Equirectangular projection: geographic coords → SVG coordinates
// ViewBox: 0 0 1000 1100
// Covers roughly 18°W to 52°E longitude, 38°N to 35°S latitude

export function geoToSvg(lon: number, lat: number): [number, number] {
  const x = Math.round(50 + (lon + 18) * 13);
  const y = Math.round(30 + (38 - lat) * 14.5);
  return [x, y];
}

export function coordsToPath(coords: [number, number][]): string {
  return coords
    .map(([lon, lat], i) => {
      const [x, y] = geoToSvg(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ') + ' Z';
}

export function coordsToCenter(coords: [number, number][]): [number, number] {
  const sumX = coords.reduce((s, [lon]) => s + lon, 0);
  const sumY = coords.reduce((s, [, lat]) => s + lat, 0);
  return geoToSvg(sumX / coords.length, sumY / coords.length);
}

export function svgToGeo(x: number, y: number): [number, number] {
  const lon = (x - 50) / 13 - 18;
  const lat = 38 - (y - 30) / 14.5;
  return [Math.round(lon * 100) / 100, Math.round(lat * 100) / 100];
}

export function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)}B`;
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(0)}K`;
  return pop.toString();
}

export function formatArea(area: number): string {
  return area.toLocaleString('de-DE') + ' km²';
}
