import type { RegionConfig } from '../context/RegionContext';
import { meGeoToSvg, meSvgToGeo } from '../lib/meGeoUtils';
import { loadMEMap } from '../lib/meMapProjection';
import { meRivers } from '../data/me/rivers';
import { mePorts } from '../data/me/ports';

// These will be imported once the data files are ready
// Using lazy initialization to avoid circular dependency issues
let _countries: RegionConfig['countries'] | null = null;
let _countriesById: RegionConfig['countriesById'] | null = null;
let _militaryData: RegionConfig['militaryData'] | null = null;
let _getMilitaryData: RegionConfig['getMilitaryData'] | null = null;
let _getMissionsForCountry: RegionConfig['getMissionsForCountry'] | null = null;

async function ensureData() {
  if (!_countries) {
    const countriesMod = await import('../data/me/countries');
    _countries = countriesMod.meCountries;
    _countriesById = countriesMod.meCountriesById;
  }
  if (!_getMilitaryData) {
    const milMod = await import('../data/me/militaryData');
    _militaryData = milMod.meMilitaryData;
    _getMilitaryData = milMod.getMECountryMilitaryData;
    _getMissionsForCountry = milMod.getMEMissionsForCountry;
  }
}

// Synchronous getter — data must be preloaded via initMideastConfig()
export function getMideastConfig(): RegionConfig {
  return {
    id: 'mideast',
    name: 'MEKnow',
    shortName: 'ME',
    subtitle: 'Nahost verstehen. Wissen, das zählt.',
    platformLabel: 'Middle East Intelligence Platform',
    basePath: '/mideast',

    countries: _countries ?? [],
    countriesById: _countriesById ?? {},
    militaryData: _militaryData ?? {},
    getMilitaryData: _getMilitaryData ?? (() => null),
    getMissionsForCountry: _getMissionsForCountry ?? (() => []),
    rivers: meRivers,
    ports: mePorts,

    geoToSvg: meGeoToSvg,
    svgToGeo: meSvgToGeo,
    viewBox: '0 0 1000 1100',
    loadMap: loadMEMap,

    accentHex: '#10B981',
    accentColorName: 'emerald',
    regionType: 'mideast',
    regions: ['Levant', 'Golfstaaten', 'Mesopotamien', 'Persisch', 'Arabische Halbinsel', 'Erweitert'],
    regionColors: {
      'Levant': '#4A7C59',
      'Golfstaaten': '#3B5998',
      'Mesopotamien': '#8B5E3C',
      'Persisch': '#7B4F8A',
      'Arabische Halbinsel': '#C4803C',
      'Erweitert': '#4A6FA5',
    },

    oceanLabels: [
      { text: 'MITTELMEER', x: 200, y: 80, fontSize: 12 },
      { text: 'ROTES MEER', x: 175, y: 650, rotation: -60, fontSize: 11 },
      { text: 'PERSISCHER GOLF', x: 550, y: 530, rotation: -30, fontSize: 10 },
      { text: 'ARABISCHES MEER', x: 650, y: 850, fontSize: 12 },
      { text: 'KASPISCHES MEER', x: 530, y: 120, fontSize: 10 },
      { text: 'SCHWARZES MEER', x: 280, y: 20, fontSize: 10 },
    ],

    tropicNorthY: Math.round(30 + (44 - 23.5) * 30.59), // Tropic of Cancer
    defaultCountryCount: '20',
  };
}

export async function initMideastConfig(): Promise<RegionConfig> {
  await ensureData();
  return getMideastConfig();
}
