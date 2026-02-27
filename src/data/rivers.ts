import type { RiverData } from '../types';
import { geoToSvg } from '../lib/geoUtils';

function riverPath(coords: [number, number][]): string {
  return coords
    .map(([lon, lat], i) => {
      const [x, y] = geoToSvg(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');
}

export const rivers: RiverData[] = [
  {
    id: 'nile',
    name: 'Nile',
    length: 6650,
    countries: ['EG', 'SD', 'SS', 'UG', 'ET', 'RW', 'BI', 'TZ', 'KE'],
    source: 'https://en.wikipedia.org/wiki/Nile',
    sourceLabel: 'Wikipedia – Nile',
    path: riverPath([
      [31.4, 31.2], [31.2, 30.0], [31.0, 28.5], [30.8, 27.0],
      [32.5, 25.0], [32.9, 24.0], [33.5, 22.5], [33.0, 20.0],
      [32.5, 18.5], [32.6, 16.5], [33.5, 15.5],
    ]),
  },
  {
    id: 'white-nile',
    name: 'White Nile',
    length: 3700,
    countries: ['SD', 'SS', 'UG'],
    source: 'https://en.wikipedia.org/wiki/White_Nile',
    sourceLabel: 'Wikipedia – White Nile',
    path: riverPath([
      [33.5, 15.5], [32.5, 14.0], [32.0, 12.5], [31.6, 10.0],
      [31.5, 7.0], [31.0, 5.0], [32.0, 3.5], [32.5, 2.0],
      [33.0, 0.5],
    ]),
  },
  {
    id: 'blue-nile',
    name: 'Blue Nile',
    length: 1450,
    countries: ['SD', 'ET'],
    source: 'https://en.wikipedia.org/wiki/Blue_Nile',
    sourceLabel: 'Wikipedia – Blue Nile',
    path: riverPath([
      [33.5, 15.5], [34.5, 14.0], [35.0, 13.0], [35.5, 12.0],
      [37.0, 11.5], [37.5, 11.8],
    ]),
  },
  {
    id: 'congo',
    name: 'Congo',
    length: 4700,
    countries: ['CD', 'CG', 'CF', 'ZM', 'AO'],
    source: 'https://en.wikipedia.org/wiki/Congo_River',
    sourceLabel: 'Wikipedia – Congo River',
    path: riverPath([
      [12.4, -6.1], [14.0, -4.3], [16.0, -2.5], [17.5, -1.5],
      [18.5, -0.5], [19.5, 0.5], [20.5, 1.0], [22.0, 1.5],
      [23.5, 1.0], [25.0, 0.5], [26.0, -0.5], [27.5, -2.0],
      [28.0, -3.5], [27.5, -5.0], [26.5, -6.0], [26.0, -8.5],
    ]),
  },
  {
    id: 'niger',
    name: 'Niger',
    length: 4180,
    countries: ['GN', 'ML', 'NE', 'BJ', 'NG'],
    source: 'https://en.wikipedia.org/wiki/Niger_River',
    sourceLabel: 'Wikipedia – Niger River',
    path: riverPath([
      [-11.0, 9.5], [-9.0, 11.0], [-7.0, 13.0], [-5.0, 14.5],
      [-4.0, 16.0], [-2.0, 17.0], [0.0, 17.0], [2.0, 15.5],
      [2.5, 14.0], [4.0, 13.5], [5.0, 12.0], [6.5, 10.0],
      [6.0, 7.5], [5.5, 6.0],
    ]),
  },
  {
    id: 'zambezi',
    name: 'Zambezi',
    length: 2574,
    countries: ['ZM', 'AO', 'NA', 'BW', 'ZW', 'MZ'],
    source: 'https://en.wikipedia.org/wiki/Zambezi',
    sourceLabel: 'Wikipedia – Zambezi',
    path: riverPath([
      [25.5, -12.0], [24.0, -13.5], [23.0, -15.0], [25.0, -15.5],
      [25.8, -17.8], [27.0, -16.5], [28.5, -16.0], [30.0, -15.5],
      [32.5, -16.5], [35.0, -18.0], [36.0, -18.5],
    ]),
  },
  {
    id: 'orange',
    name: 'Orange',
    length: 2200,
    countries: ['ZA', 'LS', 'NA'],
    source: 'https://en.wikipedia.org/wiki/Orange_River',
    sourceLabel: 'Wikipedia – Orange River',
    path: riverPath([
      [28.5, -29.5], [26.5, -29.0], [24.5, -28.5], [22.0, -28.5],
      [20.0, -28.5], [18.5, -28.5], [17.0, -28.8],
    ]),
  },
  {
    id: 'limpopo',
    name: 'Limpopo',
    length: 1750,
    countries: ['ZA', 'BW', 'ZW', 'MZ'],
    source: 'https://en.wikipedia.org/wiki/Limpopo_River',
    sourceLabel: 'Wikipedia – Limpopo River',
    path: riverPath([
      [27.0, -24.0], [28.0, -23.5], [29.5, -23.0], [30.5, -22.5],
      [31.0, -22.5], [32.0, -23.0], [33.0, -24.0], [34.5, -24.5],
    ]),
  },
  {
    id: 'senegal',
    name: 'Senegal',
    length: 1086,
    countries: ['SN', 'MR', 'ML'],
    source: 'https://en.wikipedia.org/wiki/Senegal_River',
    sourceLabel: 'Wikipedia – Senegal River',
    path: riverPath([
      [-16.5, 16.0], [-15.5, 15.5], [-14.0, 15.0], [-12.5, 14.5],
      [-11.5, 13.5], [-10.5, 12.5],
    ]),
  },
  {
    id: 'volta',
    name: 'Volta',
    length: 1600,
    countries: ['GH', 'BF'],
    source: 'https://en.wikipedia.org/wiki/Volta_River',
    sourceLabel: 'Wikipedia – Volta River',
    path: riverPath([
      [0.0, 5.8], [-0.5, 7.0], [-1.0, 8.5], [-1.5, 10.0],
      [-1.0, 11.0], [0.0, 12.5],
    ]),
  },
  {
    id: 'okavango',
    name: 'Okavango',
    length: 1600,
    countries: ['AO', 'NA', 'BW'],
    source: 'https://en.wikipedia.org/wiki/Okavango_River',
    sourceLabel: 'Wikipedia – Okavango River',
    path: riverPath([
      [16.0, -13.0], [18.0, -14.5], [20.0, -17.0], [21.5, -18.5],
      [22.5, -19.5], [22.5, -20.5],
    ]),
  },
  {
    id: 'jubba',
    name: 'Jubba',
    length: 1004,
    countries: ['SO', 'ET'],
    source: 'https://en.wikipedia.org/wiki/Jubba_River',
    sourceLabel: 'Wikipedia – Jubba River',
    path: riverPath([
      [42.5, -0.3], [42.0, 1.0], [42.0, 3.0], [43.0, 5.0],
      [44.0, 7.0],
    ]),
  },
];
