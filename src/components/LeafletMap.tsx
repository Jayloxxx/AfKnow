import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../store/useStore';
import { useRegion } from '../context/RegionContext';
import { COUNTRY_ADMIN_REGIONS } from '../data/subRegions';

// Fix default marker icons (Leaflet + bundlers issue)
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

// Region center/zoom defaults
const REGION_DEFAULTS: Record<string, { center: [number, number]; zoom: number }> = {
  africa: { center: [2, 20], zoom: 4 },
  mideast: { center: [28, 48], zoom: 4 },
};

const TILE_LAYERS: Record<string, { url: string; attribution: string; name: string }> = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    name: 'OpenStreetMap',
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
    name: 'Topographisch',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    name: 'Satellit',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB',
    name: 'Dunkel',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB',
    name: 'Hell',
  },
};

export default function LeafletMap({ showAdminRegions = false }: { showAdminRegions?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const region = useRegion();
  const {
    selectedCountryId, selectCountry,
    showCapitals, showRivers, showPorts, showLabels,
    theme,
  } = useStore();

  const defaults = REGION_DEFAULTS[region.id] ?? REGION_DEFAULTS.africa;

  // Convert SVG capital coords back to geo coords for markers
  const capitalMarkers = useMemo(() => {
    return region.countries.map(c => {
      const [lon, lat] = region.svgToGeo(c.capitalCoords[0], c.capitalCoords[1]);
      return { id: c.id, name: c.name, capital: c.capital, lat, lon, flagEmoji: c.flagEmoji, population: c.population };
    });
  }, [region]);

  // Convert port coords to geo
  const portMarkers = useMemo(() => {
    return region.ports.map(p => {
      const [lon, lat] = region.svgToGeo(p.coords[0], p.coords[1]);
      return { ...p, lat, lon };
    });
  }, [region]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: defaults.center,
      zoom: defaults.zoom,
      zoomControl: false,
      attributionControl: true,
    });

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default tile layer based on theme
    const defaultTile = theme === 'light' ? 'light' : 'dark';
    const tl = TILE_LAYERS[defaultTile];
    const baseLayer = L.tileLayer(tl.url, { attribution: tl.attribution, maxZoom: 19 });
    baseLayer.addTo(map);

    // Layer control with all tile options
    const baseLayers: Record<string, L.TileLayer> = {};
    for (const [key, cfg] of Object.entries(TILE_LAYERS)) {
      const layer = key === defaultTile ? baseLayer : L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: 19 });
      baseLayers[cfg.name] = layer;
    }
    L.control.layers(baseLayers, {}, { position: 'topright' }).addTo(map);

    // Overlay group for markers
    const lg = L.layerGroup().addTo(map);
    layerGroupRef.current = lg;

    mapRef.current = map;

    // Leaflet needs a tick to measure the container
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when data/settings change
  useEffect(() => {
    const lg = layerGroupRef.current;
    if (!lg) return;
    lg.clearLayers();

    const accentColor = region.accentHex;

    // Country polygons (clickable boundaries)
    region.countries.forEach((c: any) => {
      const points: [number, number][] = [];
      const matches = c.path.match(/[\d.]+[, ][\d.]+/g);
      if (matches) {
        matches.forEach((m: string) => {
          const parts = m.split(/[, ]/);
          const svgX = parseFloat(parts[0]);
          const svgY = parseFloat(parts[1]);
          const [lon, lat] = region.svgToGeo(svgX, svgY);
          points.push([lat, lon]);
        });
      }
      if (points.length < 3) return;

      const isSelected = selectedCountryId === c.id;
      const poly = L.polygon(points, {
        color: isSelected ? accentColor : 'rgba(255,255,255,0.25)',
        weight: isSelected ? 2 : 0.8,
        fillColor: isSelected ? accentColor : 'transparent',
        fillOpacity: isSelected ? 0.15 : 0,
        interactive: true,
      }).addTo(lg);

      poly.on('click', () => selectCountry(c.id === selectedCountryId ? null : c.id));
      poly.on('mouseover', () => {
        if (selectedCountryId !== c.id) {
          poly.setStyle({ fillColor: accentColor, fillOpacity: 0.08, color: 'rgba(255,255,255,0.5)' });
        }
      });
      poly.on('mouseout', () => {
        if (selectedCountryId !== c.id) {
          poly.setStyle({ fillColor: 'transparent', fillOpacity: 0, color: 'rgba(255,255,255,0.25)' });
        }
      });
      poly.bindTooltip(`${c.flagEmoji} ${c.name}`, { sticky: true, className: 'leaflet-custom-tooltip' });
    });

    // Admin regions (if toggled on)
    if (showAdminRegions) {
      region.countries.forEach((c: any) => {
        const regionData = COUNTRY_ADMIN_REGIONS[c.id];
        if (!regionData) return;
        regionData.regions.forEach(ar => {
          const points: [number, number][] = ar.coords.map(([lon, lat]) => [lat, lon]);
          if (points.length < 3) return;
          const poly = L.polygon(points, {
            color: 'rgba(255,255,255,0.35)',
            weight: 1,
            dashArray: '4 3',
            fillColor: 'rgba(255,255,255,0.05)',
            fillOpacity: 0.05,
            interactive: false,
          }).addTo(lg);
          if (showLabels) {
            poly.bindTooltip(ar.name, { permanent: true, direction: 'center', className: 'leaflet-custom-tooltip', offset: [0, 0] });
          }
        });
      });
    }

    // Capital markers
    if (showCapitals) {
      capitalMarkers.forEach(m => {
        const isSelected = selectedCountryId === m.id;
        const icon = L.divIcon({
          className: 'leaflet-capital-marker',
          html: `<div style="
            width:${isSelected ? 14 : 10}px; height:${isSelected ? 14 : 10}px;
            border-radius:50%; background:${isSelected ? accentColor : '#F59E0B'};
            border:2px solid ${isSelected ? '#fff' : 'rgba(0,0,0,0.4)'};
            box-shadow:0 1px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [isSelected ? 14 : 10, isSelected ? 14 : 10],
          iconAnchor: [isSelected ? 7 : 5, isSelected ? 7 : 5],
        });

        const marker = L.marker([m.lat, m.lon], { icon }).addTo(lg);
        marker.on('click', () => selectCountry(m.id === selectedCountryId ? null : m.id));

        if (showLabels) {
          marker.bindTooltip(
            `${m.flagEmoji} <strong>${m.name}</strong><br/>${m.capital} · ${(m.population / 1_000_000).toFixed(1)}M`,
            { direction: 'top', offset: [0, -8], className: 'leaflet-custom-tooltip' }
          );
        }
      });
    }

    // Port markers
    if (showPorts) {
      portMarkers.forEach(p => {
        const isMil = p.type === 'military' || p.type === 'dual';
        const color = p.type === 'military' ? '#EF4444' : p.type === 'dual' ? '#F59E0B' : '#06B6D4';
        const icon = L.divIcon({
          className: 'leaflet-port-marker',
          html: `<div style="
            width:8px; height:8px; border-radius:50%; background:${color};
            border:1.5px solid rgba(0,0,0,0.4);
            ${isMil && p.foreignUsers.length > 0 ? `box-shadow:0 0 0 3px ${color}44, 0 0 0 5px ${color}22;` : ''}
          "></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4],
        });

        const marker = L.marker([p.lat, p.lon], { icon }).addTo(lg);
        if (showLabels) {
          const foreignInfo = p.foreignUsers.length > 0 ? ` [${p.foreignUsers.map((f: any) => f.country).join(', ')}]` : '';
          marker.bindTooltip(`<strong>${p.name}</strong>${foreignInfo}`, { direction: 'top', offset: [0, -6], className: 'leaflet-custom-tooltip' });
        }
      });
    }

    // River paths as polylines
    if (showRivers) {
      region.rivers.forEach(r => {
        // Parse SVG path "M x,y L x,y ..." to extract coordinates and convert to geo
        const points: [number, number][] = [];
        const pathStr = r.path;
        const matches = pathStr.match(/[\d.]+[, ][\d.]+/g);
        if (matches) {
          matches.forEach(m => {
            const parts = m.split(/[, ]/);
            const svgX = parseFloat(parts[0]);
            const svgY = parseFloat(parts[1]);
            const [lon, lat] = region.svgToGeo(svgX, svgY);
            points.push([lat, lon]);
          });
        }
        if (points.length > 1) {
          L.polyline(points, {
            color: '#4AA3DF',
            weight: 2,
            opacity: 0.6,
          }).addTo(lg).bindTooltip(r.name, { sticky: true, className: 'leaflet-custom-tooltip' });
        }
      });
    }
  }, [capitalMarkers, portMarkers, region, showCapitals, showPorts, showRivers, showLabels, selectedCountryId, selectCountry, showAdminRegions]);

  // Fly to selected country
  useEffect(() => {
    if (!mapRef.current || !selectedCountryId) return;
    const m = capitalMarkers.find(c => c.id === selectedCountryId);
    if (m) {
      mapRef.current.flyTo([m.lat, m.lon], 6, { duration: 0.8 });
    }
  }, [selectedCountryId, capitalMarkers]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, isolation: 'isolate' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <style>{`
        .leaflet-custom-tooltip {
          background: var(--surface, #1a1f2e) !important;
          color: var(--text, #e4dfd7) !important;
          border: 1px solid var(--border, #2a2f3e) !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          font-family: var(--font-body) !important;
          font-size: 11px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }
        .leaflet-custom-tooltip::before {
          border-top-color: var(--border, #2a2f3e) !important;
        }
        .leaflet-capital-marker, .leaflet-port-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-layers {
          background: var(--surface, #1a1f2e) !important;
          color: var(--text, #e4dfd7) !important;
          border: 1px solid var(--border, #2a2f3e) !important;
          border-radius: 10px !important;
          z-index: 500 !important;
        }
        .leaflet-control-layers-toggle {
          width: 32px !important;
          height: 32px !important;
        }
        .leaflet-control-layers label {
          color: var(--text, #e4dfd7) !important;
          font-size: 11px !important;
        }
        .leaflet-control-zoom a {
          background: var(--surface, #1a1f2e) !important;
          color: var(--text, #e4dfd7) !important;
          border-color: var(--border, #2a2f3e) !important;
        }
        .leaflet-control-zoom a:hover {
          background: var(--hover, #252a3a) !important;
        }
      `}</style>
    </div>
  );
}
