import { useState, useEffect } from 'react';
import type { Topology } from 'topojson-specification';
import { loadAfricaMap, type ProjectedCountry } from '../lib/mapProjection';
import { loadMEMap } from '../lib/meMapProjection';

// world-atlas 50m – higher resolution for smooth borders
import worldTopo from 'world-atlas/countries-50m.json';

const cachedPaths: Record<string, ProjectedCountry[]> = {};

export function useRealMap(regionId: 'africa' | 'mideast' = 'africa') {
  const [paths, setPaths] = useState<ProjectedCountry[]>(cachedPaths[regionId] ?? []);
  const [ready, setReady] = useState(cachedPaths[regionId] !== undefined);

  useEffect(() => {
    if (cachedPaths[regionId]) {
      setPaths(cachedPaths[regionId]);
      setReady(true);
      return;
    }
    try {
      const loader = regionId === 'mideast' ? loadMEMap : loadAfricaMap;
      const result = loader(worldTopo as unknown as Topology);
      cachedPaths[regionId] = result;
      setPaths(result);
      setReady(true);
    } catch (err) {
      console.error(`Failed to load ${regionId} map data:`, err);
      setReady(true); // fall back to hand-drawn paths
    }
  }, [regionId]);

  return { paths, ready };
}
