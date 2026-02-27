import { createContext, useContext, type ReactNode } from 'react';
import type { CountryData, RiverData, CountryMilitaryData, InternationalMission, Region, MERegion } from '../types';
import type { PortData } from '../data/ports';
import type { ProjectedCountry } from '../lib/mapProjection';

export interface RegionConfig {
  id: 'africa' | 'mideast';
  name: string;            // 'AfKnow' | 'MEKnow'
  shortName: string;       // 'Af' | 'ME'
  subtitle: string;        // platform subtitle
  platformLabel: string;   // 'Africa Intelligence Platform' | 'Middle East Intelligence Platform'
  basePath: string;        // '/africa' | '/mideast'

  // Data
  countries: CountryData[];
  countriesById: Record<string, CountryData>;
  militaryData: Record<string, CountryMilitaryData>;
  getMilitaryData: (countryId: string) => CountryMilitaryData | null;
  getMissionsForCountry: (countryId: string) => InternationalMission[];
  rivers: RiverData[];
  ports: PortData[];

  // Projection
  geoToSvg: (lon: number, lat: number) => [number, number];
  svgToGeo: (x: number, y: number) => [number, number];
  viewBox: string;
  loadMap: (topoData: any) => ProjectedCountry[];

  // Colors
  accentHex: string;         // '#D4A74F' | '#10B981'
  accentColorName: string;   // 'gold' | 'emerald'
  regionType: 'africa' | 'mideast';
  regionColors: Record<string, string>;
  regions: (Region | MERegion)[];

  // Map features
  oceanLabels: { text: string; x: number; y: number; rotation?: number; fontSize?: number }[];
  equatorY?: number;           // y coord of equator line (Africa only)
  tropicNorthY?: number;       // Tropic of Cancer y
  tropicSouthY?: number;       // Tropic of Capricorn y (Africa only)
  defaultCountryCount: string; // '54' | '20'
}

const RegionContext = createContext<RegionConfig | null>(null);

export function RegionProvider({ config, children }: { config: RegionConfig; children: ReactNode }) {
  return (
    <RegionContext.Provider value={config}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion(): RegionConfig {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within a RegionProvider');
  return ctx;
}
