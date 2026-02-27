// Equirectangular projection for Middle East: geographic coords → SVG coordinates
// ViewBox: 0 0 1000 1100
// Covers roughly 24°E to 76°E longitude, 10°N to 44°N latitude

export function meGeoToSvg(lon: number, lat: number): [number, number] {
  const x = Math.round(50 + (lon - 24) * 17.31);
  const y = Math.round(30 + (44 - lat) * 30.59);
  return [x, y];
}

export function meCoordsToPath(coords: [number, number][]): string {
  return coords
    .map(([lon, lat], i) => {
      const [x, y] = meGeoToSvg(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ') + ' Z';
}

export function meCoordsToCenter(coords: [number, number][]): [number, number] {
  const sumX = coords.reduce((s, [lon]) => s + lon, 0);
  const sumY = coords.reduce((s, [, lat]) => s + lat, 0);
  return meGeoToSvg(sumX / coords.length, sumY / coords.length);
}

export function meSvgToGeo(x: number, y: number): [number, number] {
  const lon = (x - 50) / 17.31 + 24;
  const lat = 44 - (y - 30) / 30.59;
  return [Math.round(lon * 100) / 100, Math.round(lat * 100) / 100];
}
