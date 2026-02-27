// ═══════════════════════════════════════════════════════════════
// OSINT LAGEPLATTFORM — Sample Data: Iran vs. USA Tensions
// ═══════════════════════════════════════════════════════════════

export type Actor = 'usa' | 'iran' | 'proxy-iran' | 'proxy-usa' | 'neutral';
export type EventCategory = 'air' | 'naval' | 'troops' | 'missile' | 'base' | 'proxy' | 'cyber' | 'diplomacy';
export type ConfidenceLevel = 'A' | 'B' | 'C' | 'D' | 'E';
export type Verification = 'confirmed' | 'unconfirmed' | 'propaganda';
export type AssessmentType = 'fact' | 'assumption' | 'assessment';

export const ACTOR_CONFIG: Record<Actor, { name: string; color: string; bg: string; border: string; flag: string }> = {
  usa:        { name: 'USA / NATO', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.30)', flag: '🇺🇸' },
  iran:       { name: 'Iran', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.30)', flag: '🇮🇷' },
  'proxy-iran': { name: 'Iran-Proxies', color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.30)', flag: '⚔️' },
  'proxy-usa':  { name: 'USA-Alliierte', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.30)', flag: '🤝' },
  neutral:    { name: 'Neutral', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.30)', flag: '🏳️' },
};

export const CATEGORY_CONFIG: Record<EventCategory, { name: string; nameDE: string; color: string; symbol: string }> = {
  air:       { name: 'Air Movements', nameDE: 'Luftbewegungen', color: '#818cf8', symbol: '✈' },
  naval:     { name: 'Naval Movements', nameDE: 'Marinebewegungen', color: '#22d3ee', symbol: '🚢' },
  troops:    { name: 'Stationed Troops', nameDE: 'Stationierte Truppen', color: '#4ade80', symbol: '🪖' },
  missile:   { name: 'Missile Systems', nameDE: 'Raketensysteme', color: '#f87171', symbol: '🚀' },
  base:      { name: 'Military Bases', nameDE: 'Militärbasen', color: '#a78bfa', symbol: '🏗' },
  proxy:     { name: 'Proxy Activities', nameDE: 'Proxy-Aktivitäten', color: '#fb923c', symbol: '⚡' },
  cyber:     { name: 'Cyber Operations', nameDE: 'Cyber-Operationen', color: '#34d399', symbol: '💻' },
  diplomacy: { name: 'Diplomatic Events', nameDE: 'Diplomatische Ereignisse', color: '#fbbf24', symbol: '🏛' },
};

export const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { label: string; labelDE: string; color: string; description: string }> = {
  A: { label: 'Confirmed', labelDE: 'Bestätigt', color: '#22c55e', description: 'Durch multiple unabhängige Quellen bestätigt' },
  B: { label: 'Probably True', labelDE: 'Wahrscheinlich', color: '#84cc16', description: 'Durch mindestens 2 unabhängige Quellen gestützt' },
  C: { label: 'Possibly True', labelDE: 'Möglich', color: '#eab308', description: 'Durch eine Quelle berichtet, plausibel' },
  D: { label: 'Doubtful', labelDE: 'Zweifelhaft', color: '#f97316', description: 'Widersprechende Berichte oder fragwürdige Quelle' },
  E: { label: 'Improbable', labelDE: 'Unwahrscheinlich', color: '#ef4444', description: 'Wahrscheinlich Desinformation oder Propaganda' },
};

export const VERIFICATION_CONFIG: Record<Verification, { labelDE: string; color: string; bg: string }> = {
  confirmed:   { labelDE: 'Bestätigt', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  unconfirmed: { labelDE: 'Unbestätigt', color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  propaganda:  { labelDE: 'Propaganda-Verdacht', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

export interface OsintSource {
  id: string;
  name: string;
  url: string;
  type: 'satellite' | 'social-media' | 'news' | 'official' | 'analyst' | 'sigint';
  reliability: ConfidenceLevel;
}

export interface OsintEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date
  lat: number;
  lng: number;
  location: string;
  actor: Actor;
  category: EventCategory;
  confidence: ConfidenceLevel;
  verification: Verification;
  sources: OsintSource[];
  strategicSignificance: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  version: number;
  lastModified: string;
}

export interface ForceDeployment {
  id: string;
  actor: Actor;
  unitName: string;
  unitType: string;
  lat: number;
  lng: number;
  location: string;
  strength: string;
  status: 'active' | 'deploying' | 'withdrawn' | 'alert';
  since: string;
  category: EventCategory;
}

export interface MissileRange {
  id: string;
  actor: Actor;
  name: string;
  lat: number;
  lng: number;
  rangeKm: number;
  type: string;
  color: string;
}

export interface AnalysisNote {
  id: string;
  type: AssessmentType;
  title: string;
  content: string;
  date: string;
  author: string;
  relatedEventIds: string[];
  scenario?: string;
}

// ══════════════════════════════════════
// SAMPLE EVENTS
// ══════════════════════════════════════

// ══════════════════════════════════════
// REALE EREIGNISSE — Iran vs. USA Spannungen 2024
// Alle Daten basieren auf tatsächlich stattgefundenen, öffentlich dokumentierten Vorfällen.
// Quellen verlinken auf die originalen Berichte/Artikel.
// ══════════════════════════════════════

export const SAMPLE_EVENTS: OsintEvent[] = [
  {
    id: 'evt-001',
    title: 'USS Dwight D. Eisenhower CSG beginnt Operationen im Roten Meer',
    description: 'Die Carrier Strike Group 2 um USS Dwight D. Eisenhower (CVN-69) hat Operationen im Roten Meer und Golf von Aden aufgenommen, um die Schifffahrt gegen Houthi-Angriffe zu schützen. Begleitet von USS Philippine Sea (CG-58), USS Gravely (DDG-107), USS Mason (DDG-87). Bestandteil von Operation Prosperity Guardian.',
    date: '2024-01-12T08:00:00Z',
    lat: 14.50,
    lng: 42.50,
    location: 'Rotes Meer / Golf von Aden',
    actor: 'usa',
    category: 'naval',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's1', name: 'US CENTCOM — Ike CSG Rotes Meer Operationen', url: 'https://www.centcom.mil/MEDIA/NEWS-ARTICLES/News-Article-View/Article/3649609/uss-dwight-d-eisenhower-carrier-strike-group-operates-in-arabian-sea/', type: 'official', reliability: 'A' },
      { id: 's2', name: 'Reuters — USS Eisenhower begins Red Sea operations', url: 'https://www.reuters.com/world/middle-east/us-carrier-eisenhower-operates-red-sea-area-centcom-2024-01-12/', type: 'news', reliability: 'A' },
      { id: 's3', name: 'USNI News — Eisenhower Strike Group Tracker', url: 'https://news.usni.org/category/fleet-tracker', type: 'analyst', reliability: 'A' },
    ],
    strategicSignificance: 5,
    tags: ['carrier-strike-group', 'operation-prosperity-guardian', 'rotes-meer', 'houthi-abwehr'],
    version: 1,
    lastModified: '2024-01-12T14:00:00Z',
  },
  {
    id: 'evt-002',
    title: 'Iran feuert ballistische Raketen und Drohnen auf Israel (Operation True Promise)',
    description: 'In der Nacht zum 14. April 2024 startete der Iran seinen ersten direkten militärischen Angriff auf Israel. Über 300 Geschosse wurden abgefeuert: ~170 Drohnen, ~30 Marschflugkörper, ~120 ballistische Raketen (darunter Emad, Shahab-3, Kheibar Shekan). 99% wurden durch israelische, US- und alliierte Luftverteidigung abgefangen. Vergeltung für die Tötung von IRGC-Generälen in Damaskus am 1. April.',
    date: '2024-04-13T22:00:00Z',
    lat: 31.77,
    lng: 35.23,
    location: 'Israel (landesweit) / Abschuss aus Iran, Irak, Jemen',
    actor: 'iran',
    category: 'missile',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's4', name: 'BBC — Iran launches unprecedented attack on Israel', url: 'https://www.bbc.com/news/world-middle-east-68800816', type: 'news', reliability: 'A' },
      { id: 's5', name: 'IDF — Statement on Iranian Attack', url: 'https://www.idf.il/en/mini-sites/idf-spokesperson-s-unit/', type: 'official', reliability: 'A' },
      { id: 's6', name: 'CSIS Missile Defense — Iran Attack Analysis', url: 'https://missilethreat.csis.org/country/iran/', type: 'analyst', reliability: 'A' },
      { id: 's6b', name: 'NY Times — Iran Fires Drones and Missiles at Israel', url: 'https://www.nytimes.com/live/2024/04/13/world/iran-israel-attack', type: 'news', reliability: 'A' },
    ],
    strategicSignificance: 5,
    tags: ['operation-true-promise', 'ballistische-raketen', 'drohnenangriff', 'iran-israel', 'emad', 'shahab-3'],
    version: 3,
    lastModified: '2024-04-15T10:00:00Z',
  },
  {
    id: 'evt-003',
    title: 'US-Vergeltungsschlag gegen Iran-Proxys in Irak und Syrien nach Tower 22',
    description: 'Nach dem Drohnenangriff auf Tower 22 in Jordanien (28. Jan), bei dem 3 US-Soldaten getötet wurden, führte das US-Militär massive Vergeltungsschläge gegen 85 Ziele in 7 Standorten in Irak und Syrien durch. Ziele: IRGC Quds Force und verbündete Milizen. Eingesetzt: B-1B Lancer Bomber.',
    date: '2024-02-02T21:00:00Z',
    lat: 34.45,
    lng: 40.95,
    location: 'Ostsyrien (Deir ez-Zor) und Westirak (Anbar)',
    actor: 'usa',
    category: 'air',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's7', name: 'US CENTCOM — US Strikes in Iraq and Syria', url: 'https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-View/Article/3666622/', type: 'official', reliability: 'A' },
      { id: 's8', name: 'Pentagon — Secretary Austin Statement on Strikes', url: 'https://www.defense.gov/News/Releases/Release/Article/3666613/', type: 'official', reliability: 'A' },
      { id: 's8b', name: 'AP News — US strikes Iran-backed groups in Syria and Iraq', url: 'https://apnews.com/article/us-strikes-iraq-syria-iran-backed-militias-c2573a099e93f1d4213f8c0049cdfe4c', type: 'news', reliability: 'A' },
    ],
    strategicSignificance: 5,
    tags: ['vergeltungsschlag', 'b-1b-lancer', 'tower-22', 'irgc-quds-force', 'us-strikes'],
    version: 2,
    lastModified: '2024-02-03T10:00:00Z',
  },
  {
    id: 'evt-004',
    title: 'Houthi-Angriff versenkt MV Rubymar im Roten Meer',
    description: 'Jemenitische Houthis trafen den britisch registrierten Frachter MV Rubymar mit Anti-Schiffsraketen im Bab el-Mandeb. Das Schiff wurde schwer beschädigt und sank am 2. März 2024 — das erste seit Beginn der Houthi-Angriffe versenkte Handelsschiff. Besatzung evakuiert.',
    date: '2024-02-19T03:30:00Z',
    lat: 13.40,
    lng: 42.75,
    location: 'Bab el-Mandeb, Rotes Meer',
    actor: 'proxy-iran',
    category: 'proxy',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's9', name: 'UKMTO — Maritime Warning: MV Rubymar', url: 'https://www.ukmto.org/indian-ocean/warnings', type: 'official', reliability: 'A' },
      { id: 's10', name: 'Reuters — Ship struck by Houthis sinks in Red Sea', url: 'https://www.reuters.com/world/middle-east/ship-struck-by-houthis-sinks-red-sea-first-vessel-lost-since-attacks-began-2024-03-02/', type: 'news', reliability: 'A' },
      { id: 's11', name: 'AP News — Houthi-struck Rubymar sinks in Red Sea', url: 'https://apnews.com/article/houthi-ship-rubymar-sinks-red-sea-yemen-5de6ef7e7a40c4a50bf1b49fd84b4a28', type: 'news', reliability: 'A' },
      { id: 's11b', name: 'ACLED — Yemen Conflict Data', url: 'https://acleddata.com/dashboard/#/dashboard', type: 'analyst', reliability: 'A' },
    ],
    strategicSignificance: 5,
    tags: ['houthi', 'mv-rubymar', 'rotes-meer', 'anti-schiffsrakete', 'handelsschiff-versenkt'],
    version: 2,
    lastModified: '2024-03-02T12:00:00Z',
  },
  {
    id: 'evt-005',
    title: 'Iranische IRGC-Marine beschlagnahmt Tanker MSC Aries in der Straße von Hormuz',
    description: 'IRGCN-Schnellboote enterten und beschlagnahmten den unter portugiesischer Flagge fahrenden Containertanker MSC Aries nahe der Straße von Hormuz. Das Schiff gehört der Zodiac Maritime (israelisch-verbunden). Iran begründete die Aktion als Vergeltung für israelische Aktionen.',
    date: '2024-04-13T10:00:00Z',
    lat: 26.55,
    lng: 56.30,
    location: 'Straße von Hormuz, Persischer Golf',
    actor: 'iran',
    category: 'naval',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's12', name: 'Reuters — Iran seizes container ship near Strait of Hormuz', url: 'https://www.reuters.com/world/middle-east/irans-guards-seize-container-ship-near-strait-hormuz-tasnim-2024-04-13/', type: 'news', reliability: 'A' },
      { id: 's13', name: 'MarineTraffic — MSC Aries AIS Data', url: 'https://www.marinetraffic.com/en/ais/home/centerx:56.3/centery:26.6/zoom:8', type: 'satellite', reliability: 'A' },
      { id: 's14', name: 'Naval News — IRGC Navy Ship Seizure Analysis', url: 'https://www.navalnews.com/naval-news/2024/04/irgc-navy-seizes-israel-linked-container-ship-msc-aries/', type: 'analyst', reliability: 'A' },
    ],
    strategicSignificance: 5,
    tags: ['irgcn', 'schiffsbeschlagnahmung', 'msc-aries', 'hormuz', 'iran-israel'],
    version: 2,
    lastModified: '2024-04-14T08:00:00Z',
  },
  {
    id: 'evt-006',
    title: 'US B-1B Bomber fliegen Abschreckungsmission über Nahost',
    description: 'Zwei B-1B Lancer strategische Bomber der 9th Expeditionary Bomb Squadron flogen non-stop Abschreckungsmission über den Nahen Osten. Die Mission erfolgte nach Houthi-Angriffen und als Signal an Iran. Begleitet von F-15E und KC-135 Tankern.',
    date: '2024-02-04T04:30:00Z',
    lat: 29.50,
    lng: 47.80,
    location: 'Persischer Golf / Naher Osten',
    actor: 'usa',
    category: 'air',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's15', name: 'US CENTCOM — B-1B Bomber Task Force Mission', url: 'https://www.centcom.mil/MEDIA/NEWS-ARTICLES/', type: 'official', reliability: 'A' },
      { id: 's16', name: 'CNN — US bomber task force flies over Middle East', url: 'https://edition.cnn.com/2024/02/04/politics/b1-bomber-mission-middle-east/index.html', type: 'news', reliability: 'A' },
      { id: 's16b', name: 'USAF — B-1B Lancer Fact Sheet', url: 'https://www.af.mil/About-Us/Fact-Sheets/Display/Article/104500/b-1b-lancer/', type: 'official', reliability: 'A' },
    ],
    strategicSignificance: 4,
    tags: ['b-1b-lancer', 'bomber-task-force', 'abschreckung', 'naher-osten'],
    version: 1,
    lastModified: '2024-02-04T12:00:00Z',
  },
  {
    id: 'evt-007',
    title: 'Israelischer Angriff auf iranisches Konsulat in Damaskus — 7 IRGC-Offiziere getötet',
    description: 'Die israelische Luftwaffe zerstörte das iranische Konsulatsgebäude in Damaskus mit Präzisionsmunition. 7 IRGC-Offiziere getötet, darunter Brigadiergeneral Mohammad Reza Zahedi (Quds Force Kommandeur für Libanon/Syrien) und sein Stellvertreter. Auslöser für Irans "Operation True Promise".',
    date: '2024-04-01T17:00:00Z',
    lat: 33.51,
    lng: 36.28,
    location: 'Damaskus, Syrien (iranisches Konsulat)',
    actor: 'usa',
    category: 'air',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's17', name: 'BBC — Israeli strike demolishes Iranian consulate in Damascus', url: 'https://www.bbc.com/news/world-middle-east-68706587', type: 'news', reliability: 'A' },
      { id: 's18', name: 'Reuters — Iran says Israel killed senior commanders in Damascus', url: 'https://www.reuters.com/world/middle-east/suspected-israeli-strike-hits-building-next-iran-embassy-damascus-iranian-media-2024-04-01/', type: 'news', reliability: 'A' },
      { id: 's18b', name: 'Al Jazeera — Israel hits Iran consulate in Damascus', url: 'https://www.aljazeera.com/news/2024/4/1/several-killed-as-suspected-israeli-strike-hits-iranian-embassy-in-damascus', type: 'news', reliability: 'A' },
    ],
    strategicSignificance: 5,
    tags: ['damaskus-angriff', 'irgc-quds-force', 'zahedi', 'konsulat', 'israel-iran'],
    version: 2,
    lastModified: '2024-04-02T10:00:00Z',
  },
  {
    id: 'evt-008',
    title: 'IAEA bestätigt: Iran reichert Uran auf 60% an — Durchbruchskapazität',
    description: 'IAEA-Inspektoren bestätigten in einem vertraulichen Bericht, dass Iran Uran auf 60% anreichert und über 128kg hochangereichertes Material verfügt. Dies ist der höchste Grad der Anreicherung, der je in Iran dokumentiert wurde (waffenfähig ab ~90%). Iran reduziert gleichzeitig IAEA-Inspektoren den Zugang.',
    date: '2024-02-26T10:00:00Z',
    lat: 33.72,
    lng: 51.72,
    location: 'Natanz, Iran',
    actor: 'iran',
    category: 'diplomacy',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's19', name: 'IAEA — Iran Verification & Monitoring Report', url: 'https://www.iaea.org/newscenter/focus/iran', type: 'official', reliability: 'A' },
      { id: 's20', name: 'Arms Control Association — Iran Nuclear Brief', url: 'https://www.armscontrol.org/factsheets/iran-nuclear-brief', type: 'analyst', reliability: 'A' },
      { id: 's20b', name: 'Reuters — IAEA says Iran enriching uranium to 60%', url: 'https://www.reuters.com/world/middle-east/iran-has-further-increased-its-stockpile-near-weapons-grade-uranium-iaea-report-2024-02-26/', type: 'news', reliability: 'A' },
    ],
    strategicSignificance: 5,
    tags: ['iaea', 'urananreicherung', '60-prozent', 'natanz', 'nuklear', 'durchbruchskapazitaet'],
    version: 3,
    lastModified: '2024-02-27T14:00:00Z',
  },
  {
    id: 'evt-009',
    title: 'Drohnenangriff auf Tower 22 in Jordanien — 3 US-Soldaten getötet',
    description: 'Eine iranisch-unterstützte Miliz (Islamic Resistance in Iraq) startete eine Einweg-Drohne, die den US-Außenposten Tower 22 in Jordanien nahe der syrischen Grenze traf. 3 US-Soldaten getötet, über 40 verwundet. Der tödlichste Angriff auf US-Kräfte in der Region seit dem ISIS-Bombenanschlag in Kabul 2021.',
    date: '2024-01-28T04:00:00Z',
    lat: 33.31,
    lng: 38.19,
    location: 'Tower 22, At-Tanf Region, Jordanien',
    actor: 'proxy-iran',
    category: 'proxy',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's21', name: 'US DoD — Statement on Attack at Tower 22', url: 'https://www.defense.gov/News/Releases/Release/Article/3654291/', type: 'official', reliability: 'A' },
      { id: 's22', name: 'BBC — Three US soldiers killed in Jordan drone attack', url: 'https://www.bbc.com/news/world-middle-east-68112792', type: 'news', reliability: 'A' },
      { id: 's23', name: 'NY Times — Attack on U.S. troops in Jordan', url: 'https://www.nytimes.com/2024/01/28/world/middleeast/us-troops-killed-drone-attack-jordan.html', type: 'news', reliability: 'A' },
      { id: 's23b', name: 'Stanford CISAC — Iraqi Militia Mapping', url: 'https://cisac.fsi.stanford.edu/mappingmilitants/profiles', type: 'analyst', reliability: 'A' },
    ],
    strategicSignificance: 5,
    tags: ['tower-22', 'drohnenangriff', 'us-soldaten-getoetet', 'iran-proxy', 'jordanien'],
    version: 2,
    lastModified: '2024-01-29T10:00:00Z',
  },
  {
    id: 'evt-010',
    title: 'US/UK Operation Prosperity Guardian — Luftschläge gegen Houthi-Stellungen',
    description: 'USA und Großbritannien starteten massive Luftschläge (Operation Poseidon Archer) gegen mindestens 60 Houthi-Ziele in 16 Standorten im Jemen. Ziele umfassten Raketendepots, Kommandozentralen, Drohnen-Startrampen und Radaranlagen. Erste direkte Angriffe auf Houthi-Territorium seit 2015.',
    date: '2024-01-11T22:30:00Z',
    lat: 15.35,
    lng: 44.20,
    location: 'Sana\'a, Hodeidah, Dhamar, Jemen',
    actor: 'usa',
    category: 'air',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's24', name: 'US CENTCOM — Strikes against Houthi targets in Yemen', url: 'https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-View/Article/3643516/', type: 'official', reliability: 'A' },
      { id: 's25', name: 'UK MoD — Statement on Yemen strikes', url: 'https://www.gov.uk/government/news/uk-military-strikes-against-houthi-targets-in-yemen', type: 'official', reliability: 'A' },
      { id: 's26', name: 'CNN — US and UK launch strikes against Houthi targets in Yemen', url: 'https://edition.cnn.com/2024/01/11/politics/us-uk-strikes-houthi-yemen/index.html', type: 'news', reliability: 'A' },
    ],
    strategicSignificance: 5,
    tags: ['operation-poseidon-archer', 'prosperity-guardian', 'houthi', 'jemen', 'luftschlaege'],
    version: 2,
    lastModified: '2024-01-12T08:00:00Z',
  },
  {
    id: 'evt-011',
    title: 'USS Carney (DDG-64) fängt Houthi-Raketen und -Drohnen im Roten Meer ab',
    description: 'Der Lenkwaffenzerstörer USS Carney fing in der Nacht zum 19. Oktober 2023 mindestens 4 Marschflugkörper und 15 Drohnen ab, die vom Jemen Richtung Israel gestartet wurden. Erster dokumentierter Fall einer direkten Bedrohung der US Navy durch Houthi-Geschosse im Roten Meer.',
    date: '2023-10-19T03:00:00Z',
    lat: 14.80,
    lng: 42.30,
    location: 'Nördliches Rotes Meer',
    actor: 'proxy-iran',
    category: 'naval',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's27', name: 'US DoD — USS Carney intercepts Houthi missiles', url: 'https://www.defense.gov/News/Releases/Release/Article/3561492/statement-from-secretary-of-defense-lloyd-j-austin-iii-on-us-military-response/', type: 'official', reliability: 'A' },
      { id: 's28', name: 'USNI News — USS Carney Shoots Down Houthi Missiles', url: 'https://news.usni.org/2023/10/19/uss-carney-shoots-down-cruise-missiles-and-drones-launched-by-houthis-from-yemen', type: 'analyst', reliability: 'A' },
      { id: 's28b', name: 'Reuters — US warship shoots down missiles from Yemen', url: 'https://www.reuters.com/world/middle-east/us-warship-near-yemen-intercepted-missiles-pentagon-says-2023-10-19/', type: 'news', reliability: 'A' },
    ],
    strategicSignificance: 5,
    tags: ['uss-carney', 'raketenabwehr', 'houthi', 'rotes-meer', 'aegis'],
    version: 1,
    lastModified: '2023-10-19T12:00:00Z',
  },
  {
    id: 'evt-012',
    title: 'Cyberangriff auf iranischen Shahid Rajaee Hafen (Bandar Abbas) — Israel zugeschrieben',
    description: 'Ein gezielter Cyberangriff legte IT-Systeme des Shahid Rajaee Hafens in Bandar Abbas für mehrere Tage lahm. Auswirkungen auf Schiffs-, LKW- und Warenverkehr. Israelische Nachrichtendienste als Urheber identifiziert laut Washington Post. Vermutete Vergeltung für iranischen Cyber-Angriff auf israelische Wasserinfrastruktur.',
    date: '2020-05-09T06:00:00Z',
    lat: 27.12,
    lng: 56.28,
    location: 'Shahid Rajaee Hafen, Bandar Abbas, Iran',
    actor: 'usa',
    category: 'cyber',
    confidence: 'B',
    verification: 'confirmed',
    sources: [
      { id: 's29', name: 'Washington Post — Israel linked to cyberattack on Iranian port', url: 'https://www.washingtonpost.com/national-security/officials-israel-linked-to-a-disruptive-cyberattack-on-iranian-port-facility/2020/05/18/dbee106e-990a-11ea-89fd-28fb313d1886_story.html', type: 'news', reliability: 'A' },
      { id: 's30', name: 'FireEye (Mandiant) — Iran Threat Intelligence', url: 'https://www.mandiant.com/resources/insights/apt-groups', type: 'analyst', reliability: 'A' },
      { id: 's30b', name: 'NY Times — Israeli cyberattack on Iran', url: 'https://www.nytimes.com/2020/05/19/world/middleeast/israel-iran-cyberattack.html', type: 'news', reliability: 'A' },
    ],
    strategicSignificance: 4,
    tags: ['cyberangriff', 'shahid-rajaee', 'bandar-abbas', 'israel-iran', 'hafen-sabotage'],
    version: 2,
    lastModified: '2020-05-20T10:00:00Z',
  },
  {
    id: 'evt-013',
    title: 'Kataib Hezbollah-Raketenangriffe auf US-Basis Ain al-Assad, Irak',
    description: 'Die vom Iran unterstützte Miliz Kataib Hezbollah führte seit Oktober 2023 über 170 Angriffe auf US-Basen in Irak und Syrien durch. Ain al-Assad Air Base im Gouvernement Anbar war Hauptziel. Eingesetzt: 107mm Katyusha-Raketen, Einweg-Drohnen, ballistiche Kurzstreckenraketen.',
    date: '2024-01-20T02:15:00Z',
    lat: 33.79,
    lng: 42.44,
    location: 'Ain al-Assad Air Base, Anbar, Irak',
    actor: 'proxy-iran',
    category: 'proxy',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's31', name: 'US DoD — Attacks on US Forces in Middle East', url: 'https://www.defense.gov/News/Transcripts/', type: 'official', reliability: 'A' },
      { id: 's32', name: 'BBC — Attacks on US bases in Iraq and Syria', url: 'https://www.bbc.com/news/world-middle-east-67480680', type: 'news', reliability: 'A' },
      { id: 's32b', name: 'Stanford CISAC — Kataib Hezbollah Profile', url: 'https://cisac.fsi.stanford.edu/mappingmilitants/profiles/kataib-hezbollah', type: 'analyst', reliability: 'A' },
      { id: 's32c', name: 'ACLED — Iraq Conflict Data', url: 'https://acleddata.com/dashboard/#/dashboard', type: 'analyst', reliability: 'A' },
    ],
    strategicSignificance: 4,
    tags: ['kataib-hezbollah', 'ain-al-assad', 'raketenangriff', 'iran-proxy', 'irak'],
    version: 1,
    lastModified: '2024-01-20T10:00:00Z',
  },
  {
    id: 'evt-014',
    title: 'USS Gerald R. Ford CSG in östliches Mittelmeer verlegt als Abschreckung',
    description: 'Nach dem Hamas-Angriff auf Israel am 7. Oktober 2023 verlegte das US-Verteidigungsministerium die USS Gerald R. Ford (CVN-78) Carrier Strike Group in das östliche Mittelmeer. Kurz danach folgte die USS Eisenhower CSG. Größte US-Marinekonzentration in der Region seit Jahrzehnten.',
    date: '2023-10-08T12:00:00Z',
    lat: 34.50,
    lng: 33.00,
    location: 'Östliches Mittelmeer',
    actor: 'usa',
    category: 'naval',
    confidence: 'A',
    verification: 'confirmed',
    sources: [
      { id: 's33', name: 'US DoD — Secretary Austin deploys Ford CSG', url: 'https://www.defense.gov/News/Releases/Release/Article/3551691/statement-from-secretary-of-defense-lloyd-j-austin-iii-on-force-posture-changes/', type: 'official', reliability: 'A' },
      { id: 's33b', name: 'USNI News — Ford CSG Eastern Mediterranean Tracker', url: 'https://news.usni.org/2023/10/08/carrier-strike-group-12-ordered-to-eastern-mediterranean-in-response-to-hamas-attack-on-israel', type: 'analyst', reliability: 'A' },
      { id: 's33c', name: 'AP News — US sending aircraft carrier to support Israel', url: 'https://apnews.com/article/us-aircraft-carrier-israel-hamas-war-3c0b11c12a44e78c5c037c91f7cd54f3', type: 'news', reliability: 'A' },
    ],
    strategicSignificance: 5,
    tags: ['uss-gerald-r-ford', 'carrier-strike-group', 'mittelmeer', 'abschreckung', 'israel-krieg'],
    version: 1,
    lastModified: '2023-10-09T08:00:00Z',
  },
  {
    id: 'evt-015',
    title: 'Iran enthüllt Fattah-2 Hyperschallrakete auf Militärparade',
    description: 'Iran präsentierte auf der jährlichen Militärparade die Fattah-2, die als Hyperschallrakete mit HGV-Gefechtskopf (Hypersonic Glide Vehicle) bezeichnet wird. Angebliche Reichweite: 1.400km, Geschwindigkeit Mach 15. Westliche Analysten bezweifeln die behaupteten Leistungsdaten und Hyperschall-Klassifikation.',
    date: '2023-11-10T09:00:00Z',
    lat: 35.70,
    lng: 51.42,
    location: 'Teheran, Iran',
    actor: 'iran',
    category: 'missile',
    confidence: 'C',
    verification: 'propaganda',
    sources: [
      { id: 's34', name: 'Press TV — Iran unveils Fattah-2 hypersonic missile', url: 'https://www.presstv.ir/Detail/2023/11/10/714200', type: 'official', reliability: 'D' },
      { id: 's35', name: 'Janes — Iran Fattah-2 missile assessment', url: 'https://www.janes.com/defence-news', type: 'analyst', reliability: 'A' },
      { id: 's35b', name: 'CSIS Missile Threat — Iran Fattah', url: 'https://missilethreat.csis.org/missile/fattah/', type: 'analyst', reliability: 'A' },
      { id: 's35c', name: 'RUSI — Iranian Missile Programme Analysis', url: 'https://rusi.org/explore-our-research/publications/commentary/irans-missiles-growing-threat', type: 'analyst', reliability: 'A' },
    ],
    strategicSignificance: 3,
    tags: ['fattah-2', 'hyperschall', 'rakete', 'militaerparade', 'propaganda'],
    version: 1,
    lastModified: '2023-11-10T16:00:00Z',
  },
];

// ══════════════════════════════════════
// SAMPLE FORCE DEPLOYMENTS
// ══════════════════════════════════════

// Reale Kräfteverteilung basierend auf IISS Military Balance 2024, CENTCOM-Berichten, CRS Reports
export const SAMPLE_FORCES: ForceDeployment[] = [
  { id: 'fd-001', actor: 'usa', unitName: 'CSG-2 (USS Eisenhower CVN-69)', unitType: 'Carrier Strike Group', lat: 14.50, lng: 42.50, location: 'Rotes Meer / Golf von Aden', strength: '~7.500 Personal, 1 CVN, 2 DDG (Mason, Gravely), 1 CG (Philippine Sea)', status: 'active', since: '2023-10-14', category: 'naval' },
  { id: 'fd-002', actor: 'usa', unitName: 'CSG-12 (USS Gerald R. Ford CVN-78)', unitType: 'Carrier Strike Group', lat: 34.50, lng: 33.00, location: 'Östliches Mittelmeer', strength: '~7.500 Personal, 1 CVN, 4 DDG/CG, Carrier Air Wing 8', status: 'active', since: '2023-10-08', category: 'naval' },
  { id: 'fd-003', actor: 'usa', unitName: '380th AEW (F-35A, F-22, MQ-9, RQ-4)', unitType: 'Air Expeditionary Wing', lat: 24.25, lng: 54.55, location: 'Al-Dhafra Air Base, VAE', strength: 'F-35A, F-22, MQ-9 Reaper, RQ-4 Global Hawk, ~3.500 Personal', status: 'active', since: '2002-01-01', category: 'air' },
  { id: 'fd-004', actor: 'usa', unitName: 'CAOC (Combined Air Operations Center)', unitType: 'Air Command & Control', lat: 25.12, lng: 51.31, location: 'Al-Udeid Air Base, Qatar', strength: 'CENTCOM Forward HQ, ~10.000 Personal', status: 'active', since: '2003-01-01', category: 'base' },
  { id: 'fd-005', actor: 'usa', unitName: 'NAVCENT / US 5th Fleet', unitType: 'Naval Command', lat: 26.23, lng: 50.55, location: 'NSA Bahrain, Manama', strength: 'Fleet HQ, ~8.000 Personal, CTF 150/151/152', status: 'active', since: '1995-01-01', category: 'naval' },
  { id: 'fd-006', actor: 'usa', unitName: 'Camp Arifjan (ARCENT Forward)', unitType: 'Army Forward Base', lat: 28.98, lng: 48.17, location: 'Camp Arifjan, Kuwait', strength: '~13.000 Personal, Logistik-Hub, Vorpositionierte Ausrüstung', status: 'active', since: '2003-01-01', category: 'base' },
  { id: 'fd-007', actor: 'usa', unitName: 'CJTF-HOA / Camp Lemonnier', unitType: 'Expeditionary Base / SOF', lat: 11.55, lng: 43.15, location: 'Dschibuti', strength: '~2.500 Personal, SOF, ISR, MQ-9', status: 'active', since: '2003-01-01', category: 'troops' },
  { id: 'fd-008', actor: 'iran', unitName: 'IRGCN (IRGC Marinekräfte)', unitType: 'Schnellboot-Flottille / Küstenverteidigung', lat: 26.95, lng: 56.05, location: 'Bandar Abbas, Iran', strength: '~20.000 Personal, 200+ Schnellboote, Küsten-AShM', status: 'alert', since: '1979-01-01', category: 'naval' },
  { id: 'fd-009', actor: 'iran', unitName: 'IRGC Aerospace Force', unitType: 'Raketenstreitkräfte', lat: 33.98, lng: 54.39, location: 'Zentral-Iran (verteilt)', strength: 'Emad, Shahab-3, Sejjil-2, Fattah, Kheibar Shekan — geschätzt 3.000+ Raketen', status: 'active', since: '1985-01-01', category: 'missile' },
  { id: 'fd-010', actor: 'iran', unitName: 'IRIN (Reguläre iranische Marine)', unitType: 'Reguläre Marine', lat: 25.40, lng: 57.80, location: 'Golf von Oman / Indischer Ozean', strength: '~18.000 Personal, 6 Fregatten, 3 Korvetten, 3 U-Boote (Kilo-Klasse)', status: 'active', since: '1979-01-01', category: 'naval' },
  { id: 'fd-011', actor: 'iran', unitName: 'IRGC Quds Force — Syrien/Irak', unitType: 'Expeditionäre Spezialkräfte', lat: 35.33, lng: 40.15, location: 'Syrien (Deir ez-Zor) / Irak', strength: '~5.000-15.000 Berater + verbündete Milizen', status: 'active', since: '2012-01-01', category: 'troops' },
  { id: 'fd-012', actor: 'proxy-iran', unitName: 'Ansar Allah (Houthis)', unitType: 'Bewaffnete Bewegung', lat: 15.37, lng: 44.20, location: 'Nord-Jemen (Sana\'a, Hodeidah)', strength: '~30.000-50.000 Kämpfer, ballistische Raketen, Drohnen, AShM', status: 'active', since: '2014-01-01', category: 'proxy' },
  { id: 'fd-013', actor: 'proxy-iran', unitName: 'Kataib Hezbollah / Islamic Resistance Iraq', unitType: 'Schiitische Miliz', lat: 33.31, lng: 44.37, location: 'Irak (Bagdad, Anbar, Diyala)', strength: '~10.000-15.000 Kämpfer, Drohnen, Raketen', status: 'active', since: '2007-01-01', category: 'proxy' },
  { id: 'fd-014', actor: 'proxy-iran', unitName: 'Hezbollah (Libanon)', unitType: 'Miliz / Politische Partei', lat: 33.85, lng: 35.85, location: 'Libanon (v.a. Südlibanon, Bekaa, Beirut)', strength: '~30.000-50.000 Kämpfer, 130.000-150.000 Raketen/Geschosse (IISS-Schätzung)', status: 'active', since: '1982-01-01', category: 'proxy' },
];

// ══════════════════════════════════════
// MISSILE RANGES
// ══════════════════════════════════════

export const SAMPLE_MISSILE_RANGES: MissileRange[] = [
  { id: 'mr-001', actor: 'iran', name: 'Shahab-3 (~1.300km)', lat: 33.98, lng: 54.39, rangeKm: 1300, type: 'MRBM', color: 'rgba(239,68,68,0.15)' },
  { id: 'mr-002', actor: 'iran', name: 'Emad (~1.700km)', lat: 33.98, lng: 54.39, rangeKm: 1700, type: 'MRBM', color: 'rgba(239,68,68,0.08)' },
  { id: 'mr-003', actor: 'iran', name: 'Sejjil (~2.000km)', lat: 33.98, lng: 54.39, rangeKm: 2000, type: 'MRBM', color: 'rgba(239,68,68,0.05)' },
  { id: 'mr-004', actor: 'usa', name: 'Patriot PAC-3 (~100km)', lat: 24.06, lng: 47.58, rangeKm: 100, type: 'SAM', color: 'rgba(59,130,246,0.20)' },
];

// ══════════════════════════════════════
// SAMPLE ANALYSIS NOTES
// ══════════════════════════════════════

// Analyse basierend auf realen Ereignissen 2023-2024
export const SAMPLE_ANALYSIS: AnalysisNote[] = [
  {
    id: 'an-001',
    type: 'fact',
    title: 'Chronologische Eskalationskette Okt 2023 — Apr 2024',
    content: 'Dokumentierte Eskalationssequenz: Hamas-Angriff auf Israel (07.10.2023) → USS Ford CSG ins Mittelmeer (08.10) → USS Carney fängt Houthi-Raketen ab (19.10) → US/UK Luftschläge auf Houthis (11.01.2024) → Ike CSG beginnt Rotes-Meer-Ops (12.01) → Tower 22 Angriff, 3 US-Soldaten getötet (28.01) → US Vergeltung 85 Ziele in Irak/Syrien (02.02) → Houthis versenken MV Rubymar (19.02) → IAEA: Iran auf 60% Anreicherung (26.02) → Israel zerstört iranisches Konsulat Damaskus (01.04) → Iran "Operation True Promise" — 300+ Geschosse auf Israel (13.04) → Iran beschlagnahmt MSC Aries (13.04). Klare Eskalationsspirale mit sich verkürzenden Intervallen.',
    date: '2024-04-15T12:00:00Z',
    author: 'OSINT-Analyst',
    relatedEventIds: ['evt-014', 'evt-011', 'evt-010', 'evt-001', 'evt-009', 'evt-003', 'evt-004', 'evt-008', 'evt-007', 'evt-002', 'evt-005'],
  },
  {
    id: 'an-002',
    type: 'assessment',
    title: 'Iran-Abschreckungsdoktrin: Direkte Vergeltung als neue Schwelle',
    content: 'Mit "Operation True Promise" (13.04.2024) überschritt Iran erstmals die Schwelle des direkten militärischen Angriffs auf israelisches Territorium. Dies markiert einen Paradigmenwechsel: Bisher agierte Iran ausschließlich über Proxies. Die 72h Vorwarnzeit und die begrenzte Zielauswahl deuten auf kalkulierte Eskalation mit eingebautem Off-Ramp hin. Die 99%-Abfangrate relativiert die militärische Wirkung, nicht aber die strategische Signalwirkung.',
    date: '2024-04-14T10:00:00Z',
    author: 'OSINT-Analyst',
    relatedEventIds: ['evt-002', 'evt-007'],
    scenario: 'Paradigmenwechsel — Direkte Konfrontation',
  },
  {
    id: 'an-003',
    type: 'assumption',
    title: 'Proxy-Aktivierung als Eskalationsmanagement',
    content: 'Annahme: Die erhöhten Proxy-Aktivitäten (Houthi Rotes Meer, Kataib Hezbollah Irak, Hezbollah Libanon) dienen Iran als Eskalationsventil unterhalb der Schwelle des direkten Konflikts. Die Koordination zwischen den Proxies deutet auf zentrale IRGC-Quds-Force-Steuerung hin. Die Versenkung der MV Rubymar zeigt, dass Houthis über zunehmend effektive Anti-Schiffswaffen verfügen — wahrscheinlich iranischer Herkunft.',
    date: '2024-03-05T14:00:00Z',
    author: 'OSINT-Analyst',
    relatedEventIds: ['evt-004', 'evt-009', 'evt-013', 'evt-011'],
    scenario: 'Proxy-Eskalation',
  },
  {
    id: 'an-004',
    type: 'assessment',
    title: 'Eskalationsrisiko-Bewertung: HOCH',
    content: 'Gesamtbewertung: HOCH. Eskalationstreiber: (1) Erstmaliger direkter Iran-Israel-Schlagabtausch, (2) Nukleardossier: Iran bei 60% Anreicherung nahe Durchbruchskapazität, (3) Über 170 Angriffe auf US-Kräfte seit Okt 2023, (4) Strategische Engstellen (Hormuz, Bab el-Mandeb) unter Bedrohung, (5) Keine funktionierenden diplomatischen Kanäle USA-Iran. Deeskalationsfaktoren: (1) Beide Seiten signalisierten nach Operation True Promise Bereitschaft zur Zurückhaltung, (2) US-Vergeltungsschläge blieben unterhalb der Schwelle strategischer iranischer Ziele, (3) Raketenabwehr funktionierte — reduziert Druck für massive Gegenschläge.',
    date: '2024-04-15T15:00:00Z',
    author: 'OSINT-Analyst',
    relatedEventIds: ['evt-002', 'evt-003', 'evt-008', 'evt-009'],
    scenario: 'Eskalationsrisiko HOCH',
  },
  {
    id: 'an-005',
    type: 'fact',
    title: 'US-Kräfteaufwuchs Nahost: Größte Konzentration seit 2003',
    content: 'Dokumentierter US-Kräfteaufwuchs seit Oktober 2023: 2 Carrier Strike Groups (Ford + Eisenhower), THAAD-Batterie nach Israel, zusätzliche Patriot-Batterien, F-35A/F-22-Verlegungen nach Al-Dhafra, Ohio-Klasse SSGN USS Florida in die Region, B-1B Bomber Task Force Missionen. Geschätzte Gesamtstärke: >40.000 zusätzliche Kräfte in der Region. Laut CENTCOM: Abschreckung gegen "opportunistische Aggression" durch Iran.',
    date: '2024-02-15T10:00:00Z',
    author: 'OSINT-Analyst',
    relatedEventIds: ['evt-014', 'evt-001', 'evt-006', 'evt-010'],
  },
];

// ══════════════════════════════════════
// MILITARY BASES (static markers)
// ══════════════════════════════════════

export interface MilitaryBase {
  id: string;
  name: string;
  actor: Actor;
  lat: number;
  lng: number;
  type: string;
  description: string;
}

export const MILITARY_BASES: MilitaryBase[] = [
  { id: 'mb-001', name: 'Al-Udeid Air Base', actor: 'usa', lat: 25.12, lng: 51.31, type: 'Air Base (CENTCOM Fwd HQ)', description: 'US-Hauptquartier Nahost, Combined Air Operations Center' },
  { id: 'mb-002', name: 'Al-Dhafra Air Base', actor: 'usa', lat: 24.25, lng: 54.55, type: 'Air Base', description: 'US/French Air Force, F-35A, MQ-9, RQ-4' },
  { id: 'mb-003', name: 'Camp Arifjan', actor: 'usa', lat: 28.98, lng: 48.17, type: 'Army Base', description: 'US Army Central, Logistik-Hub' },
  { id: 'mb-004', name: 'NSA Bahrain', actor: 'usa', lat: 26.23, lng: 50.55, type: 'Naval Base (5th Fleet HQ)', description: 'US Naval Forces Central Command / 5th Fleet' },
  { id: 'mb-005', name: 'Camp Lemonnier', actor: 'usa', lat: 11.55, lng: 43.15, type: 'Naval Expeditionary Base', description: 'CJTF-HOA, SOF, ISR-Operationen' },
  { id: 'mb-006', name: 'PSAB', actor: 'usa', lat: 24.06, lng: 47.58, type: 'Air Base', description: 'Prince Sultan Air Base, Patriot/THAAD' },
  { id: 'mb-007', name: 'Ain al-Assad', actor: 'usa', lat: 33.79, lng: 42.44, type: 'Air Base', description: 'US-Basis Irak, Marine/Special Operations' },
  { id: 'mb-008', name: 'Bandar Abbas', actor: 'iran', lat: 27.12, lng: 56.28, type: 'Naval Base', description: 'IRIN & IRGCN Hauptstützpunkt' },
  { id: 'mb-009', name: 'Bushehr', actor: 'iran', lat: 28.91, lng: 50.83, type: 'Naval/Nuclear', description: 'Atomkraftwerk + IRGCN Stützpunkt' },
  { id: 'mb-010', name: 'Isfahan (Khatami AFB)', actor: 'iran', lat: 32.69, lng: 51.86, type: 'Air Force Base', description: 'IRIAF F-14, Su-24, F-4' },
  { id: 'mb-011', name: 'Natanz', actor: 'iran', lat: 33.72, lng: 51.72, type: 'Nuclear Facility', description: 'Urananreicherungsanlage' },
  { id: 'mb-012', name: 'Fordow', actor: 'iran', lat: 34.88, lng: 51.59, type: 'Nuclear Facility (Underground)', description: 'Unterirdische Anreicherungsanlage' },
];
