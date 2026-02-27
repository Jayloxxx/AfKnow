/**
 * Route planning via OSRM public API (snap-to-road).
 */

export type RouteProfile = 'car' | 'foot';

export interface RouteResult {
  geometry: [number, number][]; // [lon, lat][]
  distanceKm: number;
  durationMinutes: number;
  segments: { distanceKm: number; durationMin: number }[];
}

const OSRM_BASE = 'https://router.project-osrm.org';

function profileToOsrm(p: RouteProfile): string {
  switch (p) {
    case 'car': return 'driving';
    case 'foot': return 'foot';
    default: return 'driving';
  }
}

/**
 * Get a route from OSRM between waypoints.
 * @param waypoints Array of [lon, lat] pairs
 * @param profile Routing profile
 */
export async function getRoute(
  waypoints: [number, number][],
  profile: RouteProfile = 'car',
): Promise<RouteResult> {
  if (waypoints.length < 2) throw new Error('Need at least 2 waypoints');

  const coords = waypoints.map(([lon, lat]) => `${lon},${lat}`).join(';');
  const url = `${OSRM_BASE}/route/v1/${profileToOsrm(profile)}/${coords}?overview=full&geometries=geojson&steps=true`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`OSRM error: ${resp.status}`);

  const data = await resp.json();
  if (data.code !== 'Ok' || !data.routes?.[0]) {
    throw new Error(data.message || 'No route found');
  }

  const route = data.routes[0];
  const geometry: [number, number][] = route.geometry.coordinates;
  const distanceKm = route.distance / 1000;
  const durationMinutes = route.duration / 60;

  const segments = route.legs.map((leg: { distance: number; duration: number }) => ({
    distanceKm: leg.distance / 1000,
    durationMin: leg.duration / 60,
  }));

  return { geometry, distanceKm, durationMinutes, segments };
}

/**
 * Convert a route to GPX XML format.
 */
export function routeToGpx(route: RouteResult, name = 'Route'): string {
  const pts = route.geometry
    .map(([lon, lat]) => `      <trkpt lat="${lat}" lon="${lon}" />`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="AfKnow"
  xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${name}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${name}</name>
    <trkseg>
${pts}
    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Download GPX file.
 */
export function downloadGpx(route: RouteResult, name = 'route') {
  const gpx = routeToGpx(route, name);
  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
