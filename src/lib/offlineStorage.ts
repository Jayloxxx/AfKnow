/**
 * Offline tile caching with IndexedDB.
 * Provides tile cache, region pre-download, and offline detection.
 */

const DB_NAME = 'afknow-tiles';
const DB_VERSION = 1;
const STORE_NAME = 'tiles';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Cache a tile blob in IndexedDB.
 */
export async function cacheTile(url: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, url);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get a cached tile from IndexedDB.
 */
export async function getCachedTile(url: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(url);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Fetch a tile with offline fallback.
 * First tries network, falls back to IndexedDB cache.
 */
export async function fetchTileWithCache(url: string): Promise<string> {
  try {
    const resp = await fetch(url);
    if (resp.ok) {
      const blob = await resp.blob();
      // Cache in background (fire-and-forget)
      cacheTile(url, blob).catch(() => {});
      return URL.createObjectURL(blob);
    }
  } catch {
    // Network failed — try cache
  }

  const cached = await getCachedTile(url);
  if (cached) {
    return URL.createObjectURL(cached);
  }

  throw new Error('Tile not available offline');
}

/**
 * Compute tile coordinates for a geographic region at a given zoom level.
 */
function getTileCoordsForRegion(
  bounds: { west: number; east: number; north: number; south: number },
  z: number,
): { x: number; y: number }[] {
  const lon2x = (lon: number) => Math.floor(((lon + 180) / 360) * (1 << z));
  const lat2y = (lat: number) => {
    const r = (lat * Math.PI) / 180;
    return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * (1 << z));
  };

  const xMin = lon2x(bounds.west);
  const xMax = lon2x(bounds.east);
  const yMin = lat2y(bounds.north);
  const yMax = lat2y(bounds.south);

  const coords: { x: number; y: number }[] = [];
  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      coords.push({ x, y });
    }
  }
  return coords;
}

/**
 * Pre-download tiles for a region at multiple zoom levels.
 */
export async function predownloadRegion(
  bounds: { west: number; east: number; north: number; south: number },
  zoomLevels: number[],
  tileUrlTemplate: string,
  onProgress?: (downloaded: number, total: number) => void,
): Promise<{ downloaded: number; failed: number }> {
  const subdomains = ['a', 'b', 'c'];
  let allTiles: { z: number; x: number; y: number }[] = [];

  for (const z of zoomLevels) {
    const coords = getTileCoordsForRegion(bounds, z);
    allTiles = allTiles.concat(coords.map(c => ({ z, ...c })));
  }

  const total = allTiles.length;
  let downloaded = 0;
  let failed = 0;

  // Download in batches of 6 (browser connection limit)
  const BATCH = 6;
  for (let i = 0; i < allTiles.length; i += BATCH) {
    const batch = allTiles.slice(i, i + BATCH);
    await Promise.all(batch.map(async ({ z, x, y }) => {
      const url = tileUrlTemplate
        .replace('{z}', String(z))
        .replace('{x}', String(x))
        .replace('{y}', String(y))
        .replace('{s}', subdomains[(x + y) % 3])
        .replace('{r}', '');

      try {
        const resp = await fetch(url);
        if (resp.ok) {
          const blob = await resp.blob();
          await cacheTile(url, blob);
          downloaded++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
      onProgress?.(downloaded + failed, total);
    }));
  }

  return { downloaded, failed };
}

/**
 * Estimate storage size for a region download.
 * Average tile size ~15KB for raster tiles.
 */
export function estimateDownloadSize(
  bounds: { west: number; east: number; north: number; south: number },
  zoomLevels: number[],
): { tileCount: number; estimatedMB: number } {
  let tileCount = 0;
  for (const z of zoomLevels) {
    const coords = getTileCoordsForRegion(bounds, z);
    tileCount += coords.length;
  }
  return { tileCount, estimatedMB: Math.round((tileCount * 15) / 1024 * 10) / 10 };
}

/**
 * Clear all cached tiles.
 */
export async function clearTileCache(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Check if the browser is online.
 */
export function isOnline(): boolean {
  return navigator.onLine;
}
