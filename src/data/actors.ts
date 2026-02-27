import { geoToSvg } from '../lib/geoUtils';

export type ActorCategory = 'foreign_military' | 'pmc' | 'terrorist' | 'militia' | 'rebel' | 'igo';

export interface MapActor {
  id: string;
  name: string;
  shortName: string;
  category: ActorCategory;
  origin: string;
  color: string;
  areas: { label: string; coords: [number, number]; countryId?: string; details: string }[];
  source: string;
  sourceLabel: string;
}

export const ACTOR_CATEGORY_CONFIG: Record<ActorCategory, { label: string; color: string; icon: string }> = {
  foreign_military: { label: 'Ausländisches Militär', color: '#3b82f6', icon: '★' },
  pmc:              { label: 'PMC / Söldner',         color: '#a855f7', icon: '⬥' },
  terrorist:        { label: 'Terrororganisation',    color: '#ef4444', icon: '⚠' },
  militia:          { label: 'Miliz',                 color: '#f97316', icon: '◆' },
  rebel:            { label: 'Rebellengruppe',        color: '#eab308', icon: '▲' },
  igo:              { label: 'IGO (UN/AU/EU)',        color: '#22c55e', icon: '●' },
};

export const mapActors: MapActor[] = [
  // ═══ FOREIGN MILITARY ═══
  {
    id: 'us-africom',
    name: 'US AFRICOM',
    shortName: 'USA',
    category: 'foreign_military',
    origin: 'USA',
    color: '#3b82f6',
    areas: [
      { label: 'Camp Lemonnier, Djibouti', coords: geoToSvg(43.15, 11.55), countryId: 'DJ', details: '~4.000 Soldaten, größte US-Basis in Afrika' },
      { label: 'Agadez Drone Base, Niger', coords: geoToSvg(7.99, 16.97), countryId: 'NE', details: 'Air Base 201, Drohnen-Operationen (Status unklar nach Coup 2023)' },
      { label: 'Manda Bay, Kenia', coords: geoToSvg(40.95, -2.26), countryId: 'KE', details: 'Camp Simba, Anti-Al-Shabaab Ops' },
    ],
    source: 'https://en.wikipedia.org/wiki/United_States_Africa_Command',
    sourceLabel: 'Wikipedia – AFRICOM',
  },
  {
    id: 'france-barkhane',
    name: 'Frankreich (ehem. Barkhane)',
    shortName: 'FRA',
    category: 'foreign_military',
    origin: 'Frankreich',
    color: '#2563eb',
    areas: [
      { label: 'N\'Djamena, Tschad', coords: geoToSvg(15.04, 12.13), countryId: 'TD', details: 'Ehem. Barkhane HQ, Abzug angekündigt 2024' },
      { label: 'Djibouti', coords: geoToSvg(43.13, 11.59), countryId: 'DJ', details: '~1.500 Soldaten, FFDj' },
      { label: 'Abidjan, Côte d\'Ivoire', coords: geoToSvg(-4.03, 5.36), countryId: 'CI', details: 'Éléments Français en Côte d\'Ivoire' },
      { label: 'Dakar, Senegal', coords: geoToSvg(-17.47, 14.69), countryId: 'SN', details: 'Éléments Français au Sénégal (Abzug 2025)' },
    ],
    source: 'https://en.wikipedia.org/wiki/Op%C3%A9ration_Barkhane',
    sourceLabel: 'Wikipedia – Barkhane',
  },
  {
    id: 'china-pla',
    name: 'China (PLA)',
    shortName: 'CHN',
    category: 'foreign_military',
    origin: 'China',
    color: '#dc2626',
    areas: [
      { label: 'PLA Support Base Djibouti', coords: geoToSvg(43.09, 11.54), countryId: 'DJ', details: 'Erste überseeische Militärbasis Chinas, seit 2017' },
    ],
    source: 'https://en.wikipedia.org/wiki/Chinese_People%27s_Liberation_Army_Support_Base_in_Djibouti',
    sourceLabel: 'Wikipedia – PLA Djibouti',
  },
  {
    id: 'russia-mil',
    name: 'Russland (Militär)',
    shortName: 'RUS',
    category: 'foreign_military',
    origin: 'Russland',
    color: '#b91c1c',
    areas: [
      { label: 'Port Sudan (angestrebt)', coords: geoToSvg(37.22, 19.62), countryId: 'SD', details: 'Geplante Marinebasis am Roten Meer' },
      { label: 'Tobruk, Libyen', coords: geoToSvg(23.98, 32.08), countryId: 'LY', details: 'Unterstützung LNA/Haftar' },
    ],
    source: 'https://en.wikipedia.org/wiki/Russia%E2%80%93Africa_relations',
    sourceLabel: 'Wikipedia – Russia-Africa',
  },
  {
    id: 'turkiye-mil',
    name: 'Türkei',
    shortName: 'TUR',
    category: 'foreign_military',
    origin: 'Türkei',
    color: '#f43f5e',
    areas: [
      { label: 'Mogadischu, Somalia', coords: geoToSvg(45.34, 2.05), countryId: 'SO', details: 'TURKSOM – größte türkische Auslandsbasis, Ausbildung somalischer Armee' },
      { label: 'Misrata, Libyen', coords: geoToSvg(15.09, 32.38), countryId: 'LY', details: 'Drohnen & Militärberater für GNA/GNU' },
    ],
    source: 'https://en.wikipedia.org/wiki/TURKSOM',
    sourceLabel: 'Wikipedia – TURKSOM',
  },
  {
    id: 'uae-mil',
    name: 'Vereinigte Arabische Emirate',
    shortName: 'UAE',
    category: 'foreign_military',
    origin: 'VAE',
    color: '#0ea5e9',
    areas: [
      { label: 'Assab, Eritrea', coords: geoToSvg(42.74, 13.01), countryId: 'ER', details: 'Militärbasis, Jemen-Operationen' },
      { label: 'Berbera, Somaliland', coords: geoToSvg(45.04, 10.44), countryId: 'SO', details: 'Hafen & Militärstützpunkt' },
    ],
    source: 'https://en.wikipedia.org/wiki/UAE_military_bases',
    sourceLabel: 'Wikipedia – UAE Bases',
  },

  // ═══ PMC / SÖLDNER ═══
  {
    id: 'wagner-africa-corps',
    name: 'Wagner Group / Africa Corps',
    shortName: 'Wagner',
    category: 'pmc',
    origin: 'Russland',
    color: '#7c3aed',
    areas: [
      { label: 'Mali', coords: geoToSvg(-2.0, 14.0), countryId: 'ML', details: '~1.500 Söldner, Anti-Terror + Regimeschutz, seit 2021' },
      { label: 'Burkina Faso', coords: geoToSvg(-1.5, 12.3), countryId: 'BF', details: 'Seit 2023, Unterstützung der Junta' },
      { label: 'Niger', coords: geoToSvg(8.0, 13.5), countryId: 'NE', details: 'Seit Coup 2023, Militärberater' },
      { label: 'Zentralafrikanische Republik', coords: geoToSvg(20.9, 6.6), countryId: 'CF', details: '~2.000, Regimeschutz seit 2018, Menschenrechtsverletzungen dokumentiert' },
      { label: 'Libyen (Ost)', coords: geoToSvg(20.0, 30.0), countryId: 'LY', details: 'Unterstützung LNA/Haftar' },
      { label: 'Sudan', coords: geoToSvg(32.5, 15.5), countryId: 'SD', details: 'Goldabbau, Verbindungen zu RSF (umstritten)' },
      { label: 'Mosambik', coords: geoToSvg(35.0, -15.0), countryId: 'MZ', details: '2019 gescheitert in Cabo Delgado' },
    ],
    source: 'https://en.wikipedia.org/wiki/Wagner_Group',
    sourceLabel: 'Wikipedia – Wagner Group',
  },

  // ═══ TERRORORGANISATIONEN ═══
  {
    id: 'jnim',
    name: 'JNIM (al-Qaida Sahel)',
    shortName: 'JNIM',
    category: 'terrorist',
    origin: 'Mali/Sahel',
    color: '#ef4444',
    areas: [
      { label: 'Nord-Mali / Liptako-Gourma', coords: geoToSvg(-1.0, 15.5), countryId: 'ML', details: 'Hauptoperationsgebiet, Koalition aus AQIM, Ansar Dine, Katiba Macina' },
      { label: 'Nord Burkina Faso', coords: geoToSvg(-1.0, 14.0), countryId: 'BF', details: 'Aktiv in Soum, Oudalan, Yagha' },
      { label: 'West Niger', coords: geoToSvg(3.0, 14.5), countryId: 'NE', details: 'Tillabéri, Tahoua Regionen' },
    ],
    source: 'https://en.wikipedia.org/wiki/Jama%27at_Nasr_al-Islam_wal_Muslimin',
    sourceLabel: 'Wikipedia – JNIM',
  },
  {
    id: 'isgs',
    name: 'ISGS (IS Sahel)',
    shortName: 'ISGS',
    category: 'terrorist',
    origin: 'Sahel',
    color: '#991b1b',
    areas: [
      { label: 'Liptako-Gourma Dreiländereck', coords: geoToSvg(1.0, 14.5), details: 'Mali-Niger-Burkina Grenzregion' },
      { label: 'Nordost-Nigeria / Tschadsee', coords: geoToSvg(13.0, 13.0), countryId: 'NG', details: 'ISWAP-Splittergruppen' },
    ],
    source: 'https://en.wikipedia.org/wiki/Islamic_State_in_the_Greater_Sahara',
    sourceLabel: 'Wikipedia – ISGS',
  },
  {
    id: 'boko-haram',
    name: 'Boko Haram / ISWAP',
    shortName: 'BH',
    category: 'terrorist',
    origin: 'Nigeria',
    color: '#b91c1c',
    areas: [
      { label: 'Borno, Nigeria', coords: geoToSvg(13.1, 11.8), countryId: 'NG', details: 'JAS Kern-Shekau Fraktion + ISWAP' },
      { label: 'Tschadsee-Region', coords: geoToSvg(14.0, 13.2), details: 'Grenzregion Nigeria-Kamerun-Tschad-Niger' },
      { label: 'Diffa, Niger', coords: geoToSvg(12.6, 13.3), countryId: 'NE', details: 'Sporadische Angriffe' },
    ],
    source: 'https://en.wikipedia.org/wiki/Boko_Haram',
    sourceLabel: 'Wikipedia – Boko Haram',
  },
  {
    id: 'al-shabaab',
    name: 'Al-Shabaab',
    shortName: 'AS',
    category: 'terrorist',
    origin: 'Somalia',
    color: '#dc2626',
    areas: [
      { label: 'Süd-/Zentral-Somalia', coords: geoToSvg(44.0, 3.0), countryId: 'SO', details: 'Kontrolle ländlicher Gebiete, Angriffe auf Mogadischu' },
      { label: 'Nordost-Kenia', coords: geoToSvg(40.0, 0.5), countryId: 'KE', details: 'Angriffe in Lamu, Garissa, Mandera' },
      { label: 'Mosambik (IS-Cabo Delgado)', coords: geoToSvg(40.0, -12.0), countryId: 'MZ', details: 'IS-affiliiert, Cabo Delgado Insurgency' },
    ],
    source: 'https://en.wikipedia.org/wiki/Al-Shabaab_(militant_group)',
    sourceLabel: 'Wikipedia – Al-Shabaab',
  },
  {
    id: 'adf',
    name: 'ADF/IS-DRC',
    shortName: 'ADF',
    category: 'terrorist',
    origin: 'DR Kongo',
    color: '#dc2626',
    areas: [
      { label: 'Nord-Kivu, DRC', coords: geoToSvg(29.2, 0.5), countryId: 'CD', details: 'Allied Democratic Forces, IS-Affiliierung, Massaker an Zivilisten' },
    ],
    source: 'https://en.wikipedia.org/wiki/Allied_Democratic_Forces',
    sourceLabel: 'Wikipedia – ADF',
  },

  // ═══ MILIZEN / REBEL ═══
  {
    id: 'rsf',
    name: 'Rapid Support Forces (RSF)',
    shortName: 'RSF',
    category: 'militia',
    origin: 'Sudan',
    color: '#f59e0b',
    areas: [
      { label: 'Khartum, Sudan', coords: geoToSvg(32.56, 15.59), countryId: 'SD', details: 'Stadtkampf seit April 2023' },
      { label: 'Darfur', coords: geoToSvg(25.0, 13.5), countryId: 'SD', details: 'Kontrolle über weite Teile, ethnische Säuberungen dokumentiert' },
      { label: 'Kordofan', coords: geoToSvg(30.0, 12.0), countryId: 'SD', details: 'Vorstoß in Richtung Süden' },
    ],
    source: 'https://en.wikipedia.org/wiki/Rapid_Support_Forces',
    sourceLabel: 'Wikipedia – RSF',
  },
  {
    id: 'm23',
    name: 'M23',
    shortName: 'M23',
    category: 'rebel',
    origin: 'DR Kongo / Ruanda',
    color: '#eab308',
    areas: [
      { label: 'Nord-Kivu, DRC', coords: geoToSvg(29.0, -1.5), countryId: 'CD', details: 'Ruanda-unterstützt, Kontrolle um Goma, seit 2022 Wiederaufflammen' },
    ],
    source: 'https://en.wikipedia.org/wiki/March_23_Movement',
    sourceLabel: 'Wikipedia – M23',
  },

  // ═══ IGO MISSIONEN ═══
  {
    id: 'amisom-atmis',
    name: 'ATMIS (AU Mission Somalia)',
    shortName: 'ATMIS',
    category: 'igo',
    origin: 'Afrikanische Union',
    color: '#22c55e',
    areas: [
      { label: 'Mogadischu & Süd-Somalia', coords: geoToSvg(45.3, 2.0), countryId: 'SO', details: '~19.000 Truppen (Äthiopien, Kenia, Uganda, Burundi, Djibouti), Abzug geplant bis 2024' },
    ],
    source: 'https://en.wikipedia.org/wiki/African_Union_Transition_Mission_in_Somalia',
    sourceLabel: 'Wikipedia – ATMIS',
  },
  {
    id: 'monusco',
    name: 'MONUSCO (UN)',
    shortName: 'MONUSCO',
    category: 'igo',
    origin: 'Vereinte Nationen',
    color: '#16a34a',
    areas: [
      { label: 'Ost-DRC', coords: geoToSvg(28.0, -2.0), countryId: 'CD', details: '~14.000 Peacekeepers, Abzug läuft seit 2024' },
    ],
    source: 'https://en.wikipedia.org/wiki/MONUSCO',
    sourceLabel: 'Wikipedia – MONUSCO',
  },
];
