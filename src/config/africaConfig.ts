import type { RegionConfig } from '../context/RegionContext';
import { countries, countriesById } from '../data/countries';
import { countryMilitaryDataMap, getCountryMilitaryData, getMissionsForCountry } from '../data/militaryData';
import { rivers } from '../data/rivers';
import { ports } from '../data/ports';
import { geoToSvg, svgToGeo } from '../lib/geoUtils';
import { loadAfricaMap } from '../lib/mapProjection';

export const africaConfig: RegionConfig = {
  id: 'africa',
  name: 'AfKnow',
  shortName: 'Af',
  subtitle: 'Afrika verstehen. Wissen, das zählt.',
  platformLabel: 'Africa Intelligence Platform',
  basePath: '/africa',

  countries,
  countriesById,
  militaryData: countryMilitaryDataMap,
  getMilitaryData: getCountryMilitaryData,
  getMissionsForCountry,
  rivers,
  ports,

  geoToSvg,
  svgToGeo,
  viewBox: '0 0 1000 1100',
  loadMap: loadAfricaMap,

  accentHex: '#D4A74F',
  accentColorName: 'gold',
  regionType: 'africa',
  regions: ['North Africa', 'West Africa', 'East Africa', 'Central Africa', 'Southern Africa'],
  regionColors: {
    'North Africa': '#5B8C6A',
    'West Africa': '#C4803C',
    'East Africa': '#3B7DD8',
    'Central Africa': '#8B5E3C',
    'Southern Africa': '#7B4F8A',
  },

  oceanLabels: [
    { text: 'ATLANTISCHER OZEAN', x: 55, y: 500, rotation: -90, fontSize: 14 },
    { text: 'INDISCHER OZEAN', x: 900, y: 750, rotation: -45, fontSize: 14 },
    { text: 'MITTELMEER', x: 450, y: 30, fontSize: 10 },
    { text: 'GOLF VON GUINEA', x: 220, y: 620, fontSize: 9 },
  ],

  equatorY: Math.round(30 + 38 * 14.5), // 0° latitude
  tropicNorthY: Math.round(30 + (38 - 23.5) * 14.5),  // Tropic of Cancer
  tropicSouthY: Math.round(30 + (38 - (-23.5)) * 14.5), // Tropic of Capricorn
  defaultCountryCount: '54',
};
