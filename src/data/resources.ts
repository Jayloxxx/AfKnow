import { geoToSvg } from '../lib/geoUtils';

export type ResourceType = 'oilfield' | 'gasfield' | 'pipeline_oil' | 'pipeline_gas' | 'mine_gold' | 'mine_diamond' | 'mine_uranium' | 'mine_cobalt' | 'mine_lithium' | 'mine_other';

export interface ResourcePoint {
  id: string;
  name: string;
  type: ResourceType;
  coords: [number, number];
  countryId: string;
  details: string;
  operator?: string;
  source: string;
  sourceLabel: string;
}

export interface PipelineRoute {
  id: string;
  name: string;
  type: 'oil' | 'gas';
  points: [number, number][];  // SVG coords via geoToSvg
  countries: string[];
  lengthKm: number;
  details: string;
  status: 'operational' | 'construction' | 'planned';
  source: string;
  sourceLabel: string;
}

export const RESOURCE_CONFIG: Record<ResourceType, { label: string; color: string; icon: string }> = {
  oilfield:      { label: 'Ölfeld',        color: '#1a1a1a', icon: '●' },
  gasfield:      { label: 'Gasfeld',       color: '#0ea5e9', icon: '●' },
  pipeline_oil:  { label: 'Öl-Pipeline',   color: '#1a1a1a', icon: '—' },
  pipeline_gas:  { label: 'Gas-Pipeline',  color: '#0ea5e9', icon: '—' },
  mine_gold:     { label: 'Gold',          color: '#eab308', icon: '◆' },
  mine_diamond:  { label: 'Diamant',       color: '#e2e8f0', icon: '◇' },
  mine_uranium:  { label: 'Uran',          color: '#22c55e', icon: '☢' },
  mine_cobalt:   { label: 'Kobalt',        color: '#6366f1', icon: '◆' },
  mine_lithium:  { label: 'Lithium',       color: '#06b6d4', icon: '◆' },
  mine_other:    { label: 'Sonstige Mine', color: '#6b7280', icon: '◆' },
};

export const resourcePoints: ResourcePoint[] = [
  // ═══ ÖLFELDER ═══
  { id: 'nigeria-niger-delta', name: 'Niger Delta', type: 'oilfield', coords: geoToSvg(5.5, 4.8), countryId: 'NG', details: 'Größtes Ölfördergebiet Afrikas, ~2 Mio bpd', operator: 'Shell, TotalEnergies, ENI', source: 'https://en.wikipedia.org/wiki/Niger_Delta', sourceLabel: 'Wikipedia – Niger Delta' },
  { id: 'libya-sirte-basin', name: 'Sirte Basin', type: 'oilfield', coords: geoToSvg(18.0, 29.0), countryId: 'LY', details: 'Hauptfördergebiet Libyens, ~1.2 Mio bpd (wenn stabil)', operator: 'NOC, ENI, TotalEnergies', source: 'https://en.wikipedia.org/wiki/Sirte_Basin', sourceLabel: 'Wikipedia – Sirte Basin' },
  { id: 'algeria-hassi-messaoud', name: 'Hassi Messaoud', type: 'oilfield', coords: geoToSvg(6.05, 31.7), countryId: 'DZ', details: 'Größtes Ölfeld Algeriens', operator: 'Sonatrach', source: 'https://en.wikipedia.org/wiki/Hassi_Messaoud', sourceLabel: 'Wikipedia – Hassi Messaoud' },
  { id: 'angola-offshore', name: 'Angola Offshore', type: 'oilfield', coords: geoToSvg(12.0, -7.0), countryId: 'AO', details: 'Deep-Water Offshore, ~1.1 Mio bpd', operator: 'TotalEnergies, Chevron, BP', source: 'https://en.wikipedia.org/wiki/Oil_industry_in_Angola', sourceLabel: 'Wikipedia – Angola Oil' },
  { id: 'south-sudan-oil', name: 'Upper Nile Ölfelder', type: 'oilfield', coords: geoToSvg(32.5, 9.5), countryId: 'SS', details: '~150.000 bpd, durch Sudan exportiert', operator: 'CNPC, Petronas', source: 'https://en.wikipedia.org/wiki/Petroleum_industry_in_South_Sudan', sourceLabel: 'Wikipedia – South Sudan Oil' },
  { id: 'ghana-jubilee', name: 'Jubilee Field', type: 'oilfield', coords: geoToSvg(-3.1, 4.2), countryId: 'GH', details: 'Offshore, seit 2010, ~100.000 bpd', operator: 'Tullow Oil', source: 'https://en.wikipedia.org/wiki/Jubilee_oil_field', sourceLabel: 'Wikipedia – Jubilee' },
  { id: 'uganda-albertine', name: 'Albertine Graben', type: 'oilfield', coords: geoToSvg(30.5, 1.5), countryId: 'UG', details: 'Geschätzte 6.5 Mrd Barrel, EACOP geplant', operator: 'TotalEnergies, CNOOC', source: 'https://en.wikipedia.org/wiki/Albertine_Graben', sourceLabel: 'Wikipedia – Albertine' },

  // ═══ GASFELDER ═══
  { id: 'algeria-hassi-rmel', name: 'Hassi R\'Mel', type: 'gasfield', coords: geoToSvg(3.27, 32.93), countryId: 'DZ', details: 'Größtes Gasfeld Afrikas', operator: 'Sonatrach', source: 'https://en.wikipedia.org/wiki/Hassi_R%27Mel', sourceLabel: 'Wikipedia – Hassi R\'Mel' },
  { id: 'mozambique-rovuma', name: 'Rovuma Basin', type: 'gasfield', coords: geoToSvg(40.5, -11.0), countryId: 'MZ', details: 'Eines der größten LNG-Projekte weltweit, durch Insurgency verzögert', operator: 'TotalEnergies, ENI, ExxonMobil', source: 'https://en.wikipedia.org/wiki/Mozambique_LNG', sourceLabel: 'Wikipedia – Mozambique LNG' },
  { id: 'egypt-zohr', name: 'Zohr Gasfeld', type: 'gasfield', coords: geoToSvg(31.0, 31.5), countryId: 'EG', details: 'Größtes Gasfeld im Mittelmeer', operator: 'ENI', source: 'https://en.wikipedia.org/wiki/Zohr_gas_field', sourceLabel: 'Wikipedia – Zohr' },
  { id: 'tanzania-offshore', name: 'Tanzania Offshore Gas', type: 'gasfield', coords: geoToSvg(40.0, -9.0), countryId: 'TZ', details: '~57 Tcf entdeckt, LNG-Anlage geplant', operator: 'Equinor, Shell', source: 'https://en.wikipedia.org/wiki/Natural_gas_in_Tanzania', sourceLabel: 'Wikipedia – Tanzania Gas' },
  { id: 'senegal-gta', name: 'Greater Tortue Ahmeyim', type: 'gasfield', coords: geoToSvg(-17.5, 16.0), countryId: 'SN', details: 'Senegal-Mauretanien Grenze, erstes LNG 2024', operator: 'BP, Kosmos Energy', source: 'https://en.wikipedia.org/wiki/Greater_Tortue_Ahmeyim', sourceLabel: 'Wikipedia – GTA' },

  // ═══ MINEN ═══
  { id: 'drc-cobalt', name: 'Katanga Kobalt-Gürtel', type: 'mine_cobalt', coords: geoToSvg(27.0, -11.0), countryId: 'CD', details: '~70% der Welt-Kobaltproduktion, Kinderarbeit-Problematik', operator: 'Glencore, CMOC, Diverse', source: 'https://en.wikipedia.org/wiki/Mining_in_the_Democratic_Republic_of_the_Congo', sourceLabel: 'Wikipedia – DRC Mining' },
  { id: 'drc-coltan', name: 'Kivu Coltan/Tantal', type: 'mine_other', coords: geoToSvg(28.5, -2.0), countryId: 'CD', details: 'Konfliktmineralien, finanziert bewaffnete Gruppen', source: 'https://en.wikipedia.org/wiki/Coltan_mining_in_the_Democratic_Republic_of_the_Congo', sourceLabel: 'Wikipedia – DRC Coltan' },
  { id: 'niger-uranium', name: 'Arlit Uran-Minen', type: 'mine_uranium', coords: geoToSvg(7.38, 18.74), countryId: 'NE', details: 'Orano (ehem. Areva), strategisch für Frankreichs Atomstrom', operator: 'Orano', source: 'https://en.wikipedia.org/wiki/Arlit', sourceLabel: 'Wikipedia – Arlit' },
  { id: 'mali-gold', name: 'Süd-Mali Goldgürtel', type: 'mine_gold', coords: geoToSvg(-7.0, 12.5), countryId: 'ML', details: 'Drittgrößter Goldproduzent Afrikas', operator: 'Barrick, B2Gold', source: 'https://en.wikipedia.org/wiki/Mining_in_Mali', sourceLabel: 'Wikipedia – Mali Mining' },
  { id: 'ghana-gold', name: 'Ashanti Goldgürtel', type: 'mine_gold', coords: geoToSvg(-2.0, 6.0), countryId: 'GH', details: 'Historisches Goldland, größter Produzent Westafrikas', operator: 'Newmont, AngloGold Ashanti', source: 'https://en.wikipedia.org/wiki/Mining_in_Ghana', sourceLabel: 'Wikipedia – Ghana Mining' },
  { id: 'sudan-gold', name: 'Jebel Amir Gold', type: 'mine_gold', coords: geoToSvg(24.5, 14.0), countryId: 'SD', details: 'RSF-kontrollierte Goldminen, Wagner-Verbindungen', source: 'https://en.wikipedia.org/wiki/Mining_industry_of_Sudan', sourceLabel: 'Wikipedia – Sudan Mining' },
  { id: 'sa-diamonds', name: 'Kimberley Diamanten', type: 'mine_diamond', coords: geoToSvg(24.77, -28.73), countryId: 'ZA', details: 'Historisch, De Beers', operator: 'De Beers', source: 'https://en.wikipedia.org/wiki/Kimberley,_Northern_Cape', sourceLabel: 'Wikipedia – Kimberley' },
  { id: 'botswana-diamonds', name: 'Jwaneng/Orapa Diamanten', type: 'mine_diamond', coords: geoToSvg(24.5, -24.5), countryId: 'BW', details: 'Zweitgrößter Diamantenproduzent weltweit', operator: 'De Beers/Debswana', source: 'https://en.wikipedia.org/wiki/Mining_in_Botswana', sourceLabel: 'Wikipedia – Botswana Mining' },
  { id: 'drc-lithium', name: 'Manono Lithium', type: 'mine_lithium', coords: geoToSvg(27.4, -7.3), countryId: 'CD', details: 'Eines der größten Lithiumvorkommen weltweit', operator: 'AVZ Minerals', source: 'https://en.wikipedia.org/wiki/Manono,_Democratic_Republic_of_the_Congo', sourceLabel: 'Wikipedia – Manono' },
  { id: 'zimbabwe-lithium', name: 'Bikita Lithium', type: 'mine_lithium', coords: geoToSvg(31.5, -20.0), countryId: 'ZW', details: 'Wachsende Lithiumproduktion, chinesische Investitionen', operator: 'Sinomine, Zhejiang Huayou', source: 'https://en.wikipedia.org/wiki/Mining_in_Zimbabwe', sourceLabel: 'Wikipedia – Zimbabwe Mining' },
];

export const pipelines: PipelineRoute[] = [
  {
    id: 'transmed',
    name: 'TransMed Pipeline',
    type: 'gas',
    points: [geoToSvg(3.0, 33.0), geoToSvg(5.0, 34.0), geoToSvg(8.0, 36.0), geoToSvg(10.0, 37.5)],
    countries: ['DZ', 'TN'],
    lengthKm: 2475,
    details: 'Algerien → Tunesien → Italien, seit 1983',
    status: 'operational',
    source: 'https://en.wikipedia.org/wiki/TransMed_pipeline',
    sourceLabel: 'Wikipedia – TransMed',
  },
  {
    id: 'medgaz',
    name: 'Medgaz Pipeline',
    type: 'gas',
    points: [geoToSvg(1.0, 36.0), geoToSvg(-1.0, 36.5)],
    countries: ['DZ'],
    lengthKm: 210,
    details: 'Algerien → Spanien direkt, seit 2011',
    status: 'operational',
    source: 'https://en.wikipedia.org/wiki/Medgaz',
    sourceLabel: 'Wikipedia – Medgaz',
  },
  {
    id: 'chad-cameroon',
    name: 'Tschad-Kamerun Pipeline',
    type: 'oil',
    points: [geoToSvg(18.4, 9.5), geoToSvg(15.0, 7.5), geoToSvg(12.0, 5.5), geoToSvg(9.9, 4.0)],
    countries: ['TD', 'CM'],
    lengthKm: 1070,
    details: 'Doba Ölfelder → Kribi Hafen, seit 2003',
    status: 'operational',
    source: 'https://en.wikipedia.org/wiki/Chad%E2%80%93Cameroon_pipeline',
    sourceLabel: 'Wikipedia – Chad-Cameroon',
  },
  {
    id: 'eacop',
    name: 'EACOP (East African Crude Oil Pipeline)',
    type: 'oil',
    points: [geoToSvg(30.5, 1.5), geoToSvg(31.5, -1.0), geoToSvg(33.0, -4.0), geoToSvg(39.3, -6.8)],
    countries: ['UG', 'TZ'],
    lengthKm: 1443,
    details: 'Albertine → Tanga, TotalEnergies, umstritten, im Bau',
    status: 'construction',
    source: 'https://en.wikipedia.org/wiki/East_African_Crude_Oil_Pipeline',
    sourceLabel: 'Wikipedia – EACOP',
  },
  {
    id: 'sumed',
    name: 'SUMED Pipeline',
    type: 'oil',
    points: [geoToSvg(33.0, 29.0), geoToSvg(31.0, 30.0), geoToSvg(29.8, 31.0)],
    countries: ['EG'],
    lengthKm: 320,
    details: 'Ain Sukhna (Rotes Meer) → Sidi Kerir (Mittelmeer), Suez-Alternative',
    status: 'operational',
    source: 'https://en.wikipedia.org/wiki/Sumed_pipeline',
    sourceLabel: 'Wikipedia – SUMED',
  },
  {
    id: 'nigeria-morocco',
    name: 'Nigeria-Marokko Gas Pipeline',
    type: 'gas',
    points: [geoToSvg(3.4, 6.5), geoToSvg(2.0, 9.0), geoToSvg(-5.0, 14.0), geoToSvg(-10.0, 18.0), geoToSvg(-8.0, 28.0), geoToSvg(-6.0, 34.0)],
    countries: ['NG', 'BJ', 'TG', 'GH', 'CI', 'SN', 'MR', 'MA'],
    lengthKm: 5660,
    details: 'Mega-Projekt, geplant, Nigeria → Marokko → Europa',
    status: 'planned',
    source: 'https://en.wikipedia.org/wiki/Nigeria%E2%80%93Morocco_gas_pipeline',
    sourceLabel: 'Wikipedia – Nigeria-Morocco Pipeline',
  },
];
