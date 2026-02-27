import { geoToSvg } from '../lib/geoUtils';

// ── Types ────────────────────────────────────────────────────────────

export interface PortData {
  id: string;
  name: string;
  country: string;           // ISO 3166-1 alpha-2
  countryName: string;
  coords: [number, number];  // SVG [x, y] via geoToSvg(lon, lat)
  type: 'civilian' | 'military' | 'dual';
  foreignUsers: { country: string; details: string }[];
  source: string;
  sourceLabel: string;
}

// ── Source helpers ────────────────────────────────────────────────────

const WP  = (slug: string) => `https://en.wikipedia.org/wiki/${slug}`;
const WPL = (label: string) => `Wikipedia – ${label}`;

// ── Port data ────────────────────────────────────────────────────────

export const ports: PortData[] = [
  // ═══════════════════════════════════════════════════════════════════
  // KEY MILITARY / FOREIGN-ACCESS PORTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'djibouti',
    name: 'Djibouti',
    country: 'DJ',
    countryName: 'Djibouti',
    coords: geoToSvg(43.15, 11.59),
    type: 'dual',
    foreignUsers: [
      { country: 'US', details: 'Camp Lemonnier — largest permanent US military base in Africa (~4,000 personnel). Supports AFRICOM operations, counter-terrorism, and drone missions across East Africa and the Arabian Peninsula.' },
      { country: 'China', details: 'PLA Support Base (opened 2017) — China\'s first overseas military facility. Houses up to 2,000 troops with pier capable of berthing aircraft carriers and nuclear submarines.' },
      { country: 'France', details: 'Forces françaises stationnées à Djibouti (FFDj) — ~1,450 troops. France\'s largest permanent military base in Africa. Hosts Mirage 2000 fighters and naval vessels.' },
      { country: 'Japan', details: 'JSDF Djibouti Base — Japan\'s only overseas military installation. Approximately 170 JSDF personnel supporting anti-piracy operations in the Gulf of Aden.' },
      { country: 'Italy', details: 'Base Militare Nazionale di Supporto — approximately 300 Italian military personnel supporting anti-piracy and regional security operations.' },
    ],
    source: WP('Djibouti%E2%80%93United_States_relations'),
    sourceLabel: WPL('Djibouti foreign military bases'),
  },
  {
    id: 'port-sudan',
    name: 'Port Sudan',
    country: 'SD',
    countryName: 'Sudan',
    coords: geoToSvg(37.22, 19.62),
    type: 'dual',
    foreignUsers: [
      { country: 'Russia', details: 'Planned naval logistics facility agreed in 2020 under al-Bashir/TMC government. Would allow up to 4 Russian naval vessels simultaneously, including nuclear-powered ships. Status uncertain following 2023 civil war.' },
    ],
    source: WP('Port_Sudan'),
    sourceLabel: WPL('Port Sudan'),
  },
  {
    id: 'berbera',
    name: 'Berbera',
    country: 'SO',
    countryName: 'Somalia (Somaliland)',
    coords: geoToSvg(45.02, 10.44),
    type: 'dual',
    foreignUsers: [
      { country: 'UAE', details: 'DP World 30-year concession to develop and manage Berbera port (signed 2017). UAE established a military base with a 3,400m runway and naval facilities, strategic for Yemen/Red Sea operations.' },
      { country: 'Turkey', details: 'Expressed interest in Somaliland engagement and port access; operates TURKSOM military training base in nearby Mogadishu, Somalia.' },
      { country: 'Ethiopia', details: '19% stake in the Berbera port through DP World deal, providing landlocked Ethiopia critical sea access via the Berbera Corridor.' },
    ],
    source: WP('Port_of_Berbera'),
    sourceLabel: WPL('Port of Berbera'),
  },
  {
    id: 'mombasa',
    name: 'Mombasa',
    country: 'KE',
    countryName: 'Kenya',
    coords: geoToSvg(39.66, -4.04),
    type: 'dual',
    foreignUsers: [
      { country: 'US', details: 'Naval logistics and ship repair agreements. Regular US Navy port calls; cooperation through AFRICOM\'s Combined Joint Task Force – Horn of Africa.' },
      { country: 'UK', details: 'British Army Training Unit Kenya (BATUK) supports operations nearby. Historic Royal Navy port; continued bilateral naval logistics cooperation.' },
      { country: 'China', details: 'Funded and built the Standard Gauge Railway (SGR) connecting Mombasa to Nairobi. Chinese investment in port expansion and container terminal modernization.' },
      { country: 'India', details: 'Expressed interest in East African port logistics for Indian Ocean maritime security and counter-piracy operations.' },
    ],
    source: WP('Port_of_Mombasa'),
    sourceLabel: WPL('Port of Mombasa'),
  },
  {
    id: 'walvis-bay',
    name: 'Walvis Bay',
    country: 'NA',
    countryName: 'Namibia',
    coords: geoToSvg(14.50, -22.96),
    type: 'dual',
    foreignUsers: [
      { country: 'SADC', details: 'Southern African Development Community (SADC) naval cooperation hub. Joint maritime exercises and anti-piracy coordination among SADC member states.' },
    ],
    source: WP('Port_of_Walvis_Bay'),
    sourceLabel: WPL('Port of Walvis Bay'),
  },
  {
    id: 'douala',
    name: 'Douala',
    country: 'CM',
    countryName: 'Cameroon',
    coords: geoToSvg(9.72, 4.06),
    type: 'dual',
    foreignUsers: [
      { country: 'France', details: 'Periodic French naval visits; French military advisors present in Cameroon for bilateral defence cooperation and Gulf of Guinea security.' },
      { country: 'US', details: 'US military cooperation for counter-Boko Haram operations and Gulf of Guinea maritime security training.' },
    ],
    source: WP('Port_of_Douala'),
    sourceLabel: WPL('Port of Douala'),
  },
  {
    id: 'dakhla',
    name: 'Dakhla',
    country: 'MA',
    countryName: 'Morocco',
    coords: geoToSvg(-15.93, 23.71),
    type: 'military',
    foreignUsers: [
      { country: 'US', details: 'Joint military exercises (African Lion). Morocco allows US access in the broader Western Sahara/Atlantic strategic zone.' },
    ],
    source: WP('Dakhla,_Western_Sahara'),
    sourceLabel: WPL('Dakhla'),
  },
  {
    id: 'oran-mers-el-kebir',
    name: 'Oran / Mers El-Kébir',
    country: 'DZ',
    countryName: 'Algeria',
    coords: geoToSvg(-0.63, 35.69),
    type: 'dual',
    foreignUsers: [
      { country: 'Russia', details: 'Russian Navy vessels make regular port calls to Algerian ports. Algeria is Russia\'s largest arms client in Africa; naval cooperation includes joint exercises and logistics visits.' },
    ],
    source: WP('Mers_El_K%C3%A9bir'),
    sourceLabel: WPL('Mers El-Kébir'),
  },
  {
    id: 'tobruk',
    name: 'Tobruk',
    country: 'LY',
    countryName: 'Libya',
    coords: geoToSvg(23.98, 32.08),
    type: 'dual',
    foreignUsers: [
      { country: 'Russia', details: 'Russian naval interest through support of the Libyan National Army (LNA/Haftar). Wagner Group (now Africa Corps) presence in eastern Libya. Potential naval access for Mediterranean operations.' },
    ],
    source: WP('Port_of_Tobruk'),
    sourceLabel: WPL('Port of Tobruk'),
  },
  {
    id: 'assab',
    name: 'Assab',
    country: 'ER',
    countryName: 'Eritrea',
    coords: geoToSvg(42.74, 13.01),
    type: 'military',
    foreignUsers: [
      { country: 'UAE', details: 'Established a military base in 2015 with a deep-water port, air base with 3,500m runway, and troop facilities. Used as a staging ground for the Yemen intervention. Estimated garrison of several hundred troops.' },
    ],
    source: WP('Assab'),
    sourceLabel: WPL('Assab'),
  },
  {
    id: 'obock',
    name: 'Obock',
    country: 'DJ',
    countryName: 'Djibouti',
    coords: geoToSvg(43.29, 11.97),
    type: 'military',
    foreignUsers: [
      { country: 'France', details: 'French naval base and Legion training facility. Part of the broader French military presence in Djibouti (FFDj). Strategic position at the Bab el-Mandeb strait entrance.' },
    ],
    source: WP('Obock'),
    sourceLabel: WPL('Obock'),
  },
  {
    id: 'libreville',
    name: 'Libreville',
    country: 'GA',
    countryName: 'Gabon',
    coords: geoToSvg(9.45, 0.39),
    type: 'dual',
    foreignUsers: [
      { country: 'France', details: 'Éléments français au Gabon (EFG) — approximately 350 French troops stationed near Libreville. One of France\'s permanent bases in Africa, though drawdown announced in 2023–2024.' },
    ],
    source: WP('Libreville'),
    sourceLabel: WPL('Libreville'),
  },
  {
    id: 'port-gentil',
    name: 'Port-Gentil',
    country: 'GA',
    countryName: 'Gabon',
    coords: geoToSvg(8.78, -0.72),
    type: 'dual',
    foreignUsers: [
      { country: 'France', details: 'French military logistical support through the Libreville garrison. Port-Gentil serves as a secondary port for the broader French presence in Gabon.' },
    ],
    source: WP('Port-Gentil'),
    sourceLabel: WPL('Port-Gentil'),
  },

  // ═══════════════════════════════════════════════════════════════════
  // MAJOR CIVILIAN / COMMERCIAL PORTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'durban',
    name: 'Durban',
    country: 'ZA',
    countryName: 'South Africa',
    coords: geoToSvg(31.03, -29.87),
    type: 'civilian',
    foreignUsers: [],
    source: WP('Port_of_Durban'),
    sourceLabel: WPL('Port of Durban'),
  },
  {
    id: 'tangier-med',
    name: 'Tangier Med',
    country: 'MA',
    countryName: 'Morocco',
    coords: geoToSvg(-5.50, 35.89),
    type: 'civilian',
    foreignUsers: [],
    source: WP('Tanger-Med'),
    sourceLabel: WPL('Tangier Med'),
  },
  {
    id: 'port-said',
    name: 'Port Said',
    country: 'EG',
    countryName: 'Egypt',
    coords: geoToSvg(32.30, 31.26),
    type: 'civilian',
    foreignUsers: [],
    source: WP('Port_Said'),
    sourceLabel: WPL('Port Said'),
  },
  {
    id: 'alexandria',
    name: 'Alexandria',
    country: 'EG',
    countryName: 'Egypt',
    coords: geoToSvg(29.92, 31.20),
    type: 'civilian',
    foreignUsers: [],
    source: WP('Port_of_Alexandria'),
    sourceLabel: WPL('Port of Alexandria'),
  },
  {
    id: 'abidjan',
    name: 'Abidjan',
    country: 'CI',
    countryName: "Côte d'Ivoire",
    coords: geoToSvg(-4.02, 5.32),
    type: 'civilian',
    foreignUsers: [],
    source: WP('Port_of_Abidjan'),
    sourceLabel: WPL('Port of Abidjan'),
  },
  {
    id: 'lagos-apapa',
    name: 'Lagos / Apapa',
    country: 'NG',
    countryName: 'Nigeria',
    coords: geoToSvg(3.38, 6.44),
    type: 'civilian',
    foreignUsers: [],
    source: WP('Apapa'),
    sourceLabel: WPL('Lagos / Apapa Port'),
  },
  {
    id: 'dar-es-salaam',
    name: 'Dar es Salaam',
    country: 'TZ',
    countryName: 'Tanzania',
    coords: geoToSvg(39.28, -6.82),
    type: 'civilian',
    foreignUsers: [
      { country: 'China', details: 'Major Chinese investment in port modernization and expansion. China Merchants Port Holdings acquired stakes in port operations. Key terminus of the TAZARA railway and gateway to landlocked hinterland countries.' },
    ],
    source: WP('Port_of_Dar_es_Salaam'),
    sourceLabel: WPL('Port of Dar es Salaam'),
  },
  {
    id: 'maputo',
    name: 'Maputo',
    country: 'MZ',
    countryName: 'Mozambique',
    coords: geoToSvg(32.57, -25.97),
    type: 'civilian',
    foreignUsers: [],
    source: WP('Port_of_Maputo'),
    sourceLabel: WPL('Port of Maputo'),
  },
  {
    id: 'luanda',
    name: 'Luanda',
    country: 'AO',
    countryName: 'Angola',
    coords: geoToSvg(13.23, -8.84),
    type: 'civilian',
    foreignUsers: [
      { country: 'China', details: 'Extensive Chinese investment in Angolan port and rail infrastructure as part of oil-for-infrastructure deals. China International Trust and Investment Corporation (CITIC) involved in port rehabilitation.' },
    ],
    source: WP('Port_of_Luanda'),
    sourceLabel: WPL('Port of Luanda'),
  },
  {
    id: 'dakar',
    name: 'Dakar',
    country: 'SN',
    countryName: 'Senegal',
    coords: geoToSvg(-17.43, 14.69),
    type: 'civilian',
    foreignUsers: [
      { country: 'France', details: 'Former French naval base (closed 2010). Continued bilateral defence cooperation and periodic naval visits. Dakar hosts joint military exercises and serves as a logistics hub for Sahel operations.' },
    ],
    source: WP('Port_of_Dakar'),
    sourceLabel: WPL('Port of Dakar'),
  },
  {
    id: 'lamu',
    name: 'Lamu',
    country: 'KE',
    countryName: 'Kenya',
    coords: geoToSvg(40.90, -2.27),
    type: 'civilian',
    foreignUsers: [
      { country: 'China', details: 'LAPSSET Corridor (Lamu Port–South Sudan–Ethiopia Transport) — flagship Kenyan mega-infrastructure project. China Communications Construction Company (CCCC) was originally involved. First berths operational; full build-out ongoing.' },
    ],
    source: WP('Port_of_Lamu'),
    sourceLabel: WPL('Port of Lamu'),
  },
  {
    id: 'cape-town',
    name: 'Cape Town',
    country: 'ZA',
    countryName: 'South Africa',
    coords: geoToSvg(18.42, -33.92),
    type: 'civilian',
    foreignUsers: [],
    source: WP('Port_of_Cape_Town'),
    sourceLabel: WPL('Port of Cape Town'),
  },
  {
    id: 'tema',
    name: 'Tema',
    country: 'GH',
    countryName: 'Ghana',
    coords: geoToSvg(-0.02, 5.63),
    type: 'civilian',
    foreignUsers: [],
    source: WP('Port_of_Tema'),
    sourceLabel: WPL('Port of Tema'),
  },
  {
    id: 'conakry',
    name: 'Conakry',
    country: 'GN',
    countryName: 'Guinea',
    coords: geoToSvg(-13.71, 9.51),
    type: 'civilian',
    foreignUsers: [
      { country: 'China', details: 'Chinese investment in Conakry port expansion and mineral export infrastructure. Guinea holds the world\'s largest bauxite reserves; Chinese firms (Chinalco, Winning Consortium) have invested heavily in port-connected mining logistics.' },
    ],
    source: WP('Port_of_Conakry'),
    sourceLabel: WPL('Port of Conakry'),
  },
  {
    id: 'beira',
    name: 'Beira',
    country: 'MZ',
    countryName: 'Mozambique',
    coords: geoToSvg(34.87, -19.84),
    type: 'civilian',
    foreignUsers: [],
    source: WP('Port_of_Beira'),
    sourceLabel: WPL('Port of Beira'),
  },
  {
    id: 'nacala',
    name: 'Nacala',
    country: 'MZ',
    countryName: 'Mozambique',
    coords: geoToSvg(40.67, -14.54),
    type: 'civilian',
    foreignUsers: [],
    source: WP('Port_of_Nacala'),
    sourceLabel: WPL('Port of Nacala'),
  },
  {
    id: 'kribi',
    name: 'Kribi',
    country: 'CM',
    countryName: 'Cameroon',
    coords: geoToSvg(9.91, 2.94),
    type: 'civilian',
    foreignUsers: [
      { country: 'China', details: 'Built by China Harbour Engineering Company (CHEC) with Exim Bank financing. Cameroon\'s first deep-water port, designed to handle post-Panamax vessels and serve as a regional hub for Central Africa.' },
    ],
    source: WP('Kribi_Deep_Sea_Port'),
    sourceLabel: WPL('Kribi Deep Sea Port'),
  },
  {
    id: 'lekki',
    name: 'Lekki',
    country: 'NG',
    countryName: 'Nigeria',
    coords: geoToSvg(3.53, 6.43),
    type: 'civilian',
    foreignUsers: [
      { country: 'China', details: 'Lekki Deep Sea Port developed by China Harbour Engineering Company (CHEC) as majority stakeholder (75%). Opened 2023. Nigeria\'s first deep-water port, designed to reduce congestion at Lagos/Apapa.' },
    ],
    source: WP('Lekki_Deep_Sea_Port'),
    sourceLabel: WPL('Lekki Deep Sea Port'),
  },
  {
    id: 'bagamoyo',
    name: 'Bagamoyo',
    country: 'TZ',
    countryName: 'Tanzania',
    coords: geoToSvg(38.90, -6.43),
    type: 'civilian',
    foreignUsers: [
      { country: 'China', details: 'Planned $10 billion mega-port project by China Merchants Holdings. Would have been the largest port in Africa. Project stalled/suspended in 2019 under President Magufuli over terms; status remains uncertain.' },
    ],
    source: WP('Bagamoyo'),
    sourceLabel: WPL('Bagamoyo Port Project'),
  },
];
