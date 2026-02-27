import type { RiverData } from '../../types';
import { meGeoToSvg } from '../../lib/meGeoUtils';

function riverPath(coords: [number, number][]): string {
  return coords
    .map(([lon, lat], i) => {
      const [x, y] = meGeoToSvg(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');
}

export const meRivers: RiverData[] = [
  {
    id: 'euphrates',
    name: 'Euphrat',
    length: 2800,
    countries: ['TR', 'SY', 'IQ'],
    source: 'https://en.wikipedia.org/wiki/Euphrates',
    sourceLabel: 'Wikipedia – Euphrat',
    path: riverPath([
      [39.5, 39.7], [38.5, 38.0], [38.0, 36.8], [38.2, 36.0],
      [38.5, 35.5], [39.0, 35.0], [39.5, 34.5], [40.5, 34.0],
      [41.5, 33.8], [42.5, 33.5], [43.5, 33.0], [44.0, 32.5],
      [44.5, 32.0], [45.0, 31.5], [46.0, 31.0], [47.0, 30.8],
      [47.5, 30.5],
    ]),
  },
  {
    id: 'tigris',
    name: 'Tigris',
    length: 1850,
    countries: ['TR', 'IQ'],
    source: 'https://en.wikipedia.org/wiki/Tigris',
    sourceLabel: 'Wikipedia – Tigris',
    path: riverPath([
      [40.2, 38.4], [41.0, 37.5], [42.0, 37.0], [42.5, 36.5],
      [43.0, 36.0], [43.5, 35.5], [44.0, 35.0], [44.5, 34.5],
      [44.3, 34.0], [44.4, 33.5], [44.4, 33.0], [44.5, 32.5],
      [45.5, 32.0], [46.5, 31.5], [47.0, 31.0], [47.5, 30.5],
    ]),
  },
  {
    id: 'jordan',
    name: 'Jordan',
    length: 251,
    countries: ['SY', 'JO', 'IL', 'PS'],
    source: 'https://en.wikipedia.org/wiki/Jordan_River',
    sourceLabel: 'Wikipedia – Jordan',
    path: riverPath([
      [35.6, 33.3], [35.6, 33.0], [35.6, 32.7], [35.5, 32.5],
      [35.5, 32.0], [35.5, 31.8], [35.5, 31.5],
    ]),
  },
  {
    id: 'karun',
    name: 'Karun',
    length: 950,
    countries: ['IR'],
    source: 'https://en.wikipedia.org/wiki/Karun',
    sourceLabel: 'Wikipedia – Karun',
    path: riverPath([
      [50.0, 32.5], [49.5, 32.3], [49.0, 32.0], [48.8, 31.5],
      [48.5, 31.0], [48.7, 30.5], [49.0, 30.4],
    ]),
  },
  {
    id: 'litani',
    name: 'Litani',
    length: 170,
    countries: ['LB'],
    source: 'https://en.wikipedia.org/wiki/Litani_River',
    sourceLabel: 'Wikipedia – Litani',
    path: riverPath([
      [36.2, 34.0], [35.8, 33.8], [35.5, 33.5], [35.3, 33.3],
    ]),
  },
  {
    id: 'orontes',
    name: 'Orontes',
    length: 571,
    countries: ['LB', 'SY', 'TR'],
    source: 'https://en.wikipedia.org/wiki/Orontes_River',
    sourceLabel: 'Wikipedia – Orontes',
    path: riverPath([
      [36.2, 34.2], [36.3, 34.8], [36.4, 35.3], [36.3, 35.8],
      [36.2, 36.2], [36.0, 36.5],
    ]),
  },
  {
    id: 'helmand',
    name: 'Helmand',
    length: 1150,
    countries: ['AF'],
    source: 'https://en.wikipedia.org/wiki/Helmand_River',
    sourceLabel: 'Wikipedia – Helmand',
    path: riverPath([
      [68.0, 34.5], [67.0, 33.5], [65.5, 32.5], [64.5, 31.5],
      [63.5, 31.0], [62.5, 30.5], [61.5, 31.0],
    ]),
  },
  {
    id: 'indus',
    name: 'Indus',
    length: 3180,
    countries: ['PK'],
    source: 'https://en.wikipedia.org/wiki/Indus_River',
    sourceLabel: 'Wikipedia – Indus',
    path: riverPath([
      [75.5, 35.5], [74.5, 35.0], [73.0, 34.0], [72.0, 33.0],
      [71.5, 32.0], [71.0, 31.0], [70.5, 30.0], [70.0, 29.0],
      [69.5, 28.0], [69.0, 27.0], [68.5, 26.0], [68.0, 25.5],
      [67.5, 24.5],
    ]),
  },
  {
    id: 'nile-me',
    name: 'Nil',
    length: 6650,
    countries: ['EG'],
    source: 'https://en.wikipedia.org/wiki/Nile',
    sourceLabel: 'Wikipedia – Nil',
    path: riverPath([
      [31.4, 31.2], [31.2, 30.0], [31.0, 28.5], [30.8, 27.0],
      [32.5, 25.0], [32.9, 24.0], [33.5, 22.5], [33.0, 20.0],
      [32.5, 18.5], [32.6, 16.5], [33.5, 15.5],
    ]),
  },
  {
    id: 'shatt-al-arab',
    name: 'Schatt al-Arab',
    length: 200,
    countries: ['IQ', 'IR'],
    source: 'https://en.wikipedia.org/wiki/Shatt_al-Arab',
    sourceLabel: 'Wikipedia – Schatt al-Arab',
    path: riverPath([
      [47.5, 30.5], [48.0, 30.3], [48.3, 30.0], [48.5, 29.8],
    ]),
  },
];
