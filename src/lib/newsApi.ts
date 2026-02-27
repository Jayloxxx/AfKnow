// ── GDELT DOC 2.0 API — Free geopolitical news aggregation ──

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceDomain: string;
  imageUrl?: string;
  publishedAt: string;
  language: string;
  countries: string[];
  topics: NewsTopic[];
}

export type NewsTopic = 'politics' | 'security' | 'economy' | 'humanitarian' | 'military' | 'diplomacy';
export type TimeRange = '24h' | '7d' | '30d';

// ── Conflict Axis / Geopolitische Konfliktachsen ──
export interface ConflictAxis {
  id: string;
  name: string;             // e.g. "USA ↔ Iran"
  nameShort: string;        // e.g. "USA-Iran"
  description: string;      // German description
  actors: string[];         // Key actor names for matching
  keywords: string[];       // Additional keywords
  color: string;            // Display color
  icon: string;             // Emoji icon
  region: RegionId | 'both';
  articles: NewsArticle[];  // Matched articles (populated at runtime)
  intensity: number;        // 0-100 based on article count/recency
}

// ── Region type ──
export type RegionId = 'africa' | 'mideast';

// ── Country search terms ──
const COUNTRY_TERMS: Record<string, string> = {
  DZ: 'Algeria', AO: 'Angola', BJ: 'Benin', BW: 'Botswana', BF: 'Burkina Faso',
  BI: 'Burundi', CM: 'Cameroon', CV: 'Cape Verde', CF: 'Central African Republic',
  TD: 'Chad', KM: 'Comoros', CG: 'Congo', CD: 'Congo', DJ: 'Djibouti',
  EG: 'Egypt', GQ: 'Equatorial Guinea', ER: 'Eritrea', SZ: 'Eswatini',
  ET: 'Ethiopia', GA: 'Gabon', GM: 'Gambia', GH: 'Ghana', GN: 'Guinea',
  GW: 'Guinea-Bissau', CI: 'Ivory Coast', KE: 'Kenya', LS: 'Lesotho',
  LR: 'Liberia', LY: 'Libya', MG: 'Madagascar', MW: 'Malawi', ML: 'Mali',
  MR: 'Mauritania', MU: 'Mauritius', MA: 'Morocco', MZ: 'Mozambique',
  NA: 'Namibia', NE: 'Niger', NG: 'Nigeria', RW: 'Rwanda', ST: 'Sao Tome',
  SN: 'Senegal', SC: 'Seychelles', SL: 'Sierra Leone', SO: 'Somalia',
  ZA: 'South Africa', SS: 'South Sudan', SD: 'Sudan', TZ: 'Tanzania',
  TG: 'Togo', TN: 'Tunisia', UG: 'Uganda', ZM: 'Zambia', ZW: 'Zimbabwe',
  // Middle East
  SA: 'Saudi Arabia', IR: 'Iran', IQ: 'Iraq', SY: 'Syria', YE: 'Yemen',
  JO: 'Jordan', LB: 'Lebanon', IL: 'Israel', PS: 'Palestine', AE: 'UAE',
  QA: 'Qatar', KW: 'Kuwait', BH: 'Bahrain', OM: 'Oman', TR: 'Turkey',
};

// ── Region-specific default queries ──
const REGION_DEFAULT_QUERY: Record<RegionId, string> = {
  africa: '"Africa"',
  mideast: '("Middle East" OR "Gulf" OR "Levant")',
};

const REGION_BROAD_TOPICS: Record<RegionId, string> = {
  africa: '(government OR military OR security OR election OR conflict OR crisis OR economy OR sanctions OR diplomacy OR humanitarian)',
  mideast: '(government OR military OR security OR election OR conflict OR crisis OR economy OR sanctions OR diplomacy OR humanitarian OR nuclear OR drone OR militia OR proxy OR deployment OR weapons OR intelligence OR geopolitical)',
};

// ── Major press source domain boosters (used as additional queries) ──
// These run as separate queries to ensure coverage from top-tier sources
const PRESS_HOUSE_DOMAINS: Record<RegionId, string[]> = {
  africa: [
    'bbc.co.uk', 'reuters.com', 'aljazeera.com', 'france24.com',
    'africanews.com', 'theafricareport.com', 'cnn.com', 'theguardian.com',
    'nytimes.com', 'dw.com', 'rfi.fr',
  ],
  mideast: [
    // Tier 1: Global wire / flagship
    'bbc.co.uk', 'reuters.com', 'aljazeera.com', 'cnn.com',
    'axios.com', 'france24.com', 'theguardian.com', 'nytimes.com',
    'washingtonpost.com', 'apnews.com', 'dw.com',
    // Tier 2: ME-spezialisierte Quellen
    'middleeasteye.net', 'al-monitor.com', 'thenationalnews.com',
    'arabnews.com', 'middleeastmonitor.com',
    // Tier 3: Israel / Iran / Türkei
    'timesofisrael.com', 'jpost.com', 'haaretz.com',
    'iranintl.com', 'dailysabah.com', 'hurriyet.com',
    // Tier 4: Defense / Intelligence-spezialisiert
    'defensenews.com', 'janes.com', 'thedrive.com',
  ],
};

const TOPIC_TERMS: Record<NewsTopic, string[]> = {
  politics: ['election', 'president', 'parliament', 'government', 'political', 'coup', 'protest', 'opposition', 'regime', 'annexation', 'sovereignty', 'referendum'],
  security: ['terrorism', 'attack', 'militant', 'bombing', 'violence', 'extremist', 'kidnapping', 'insurgent', 'assassination', 'airstrike', 'rocket', 'hostage', 'siege', 'casualties'],
  economy: ['economy', 'trade', 'inflation', 'investment', 'oil', 'mining', 'debt', 'GDP', 'OPEC', 'pipeline', 'LNG', 'gas', 'sanctions', 'embargo', 'refinery', 'energy'],
  humanitarian: ['humanitarian', 'refugee', 'famine', 'drought', 'flood', 'displaced', 'hunger', 'epidemic', 'civilian', 'aid', 'UNRWA', 'blockade', 'starvation'],
  military: ['military', 'army', 'defense', 'weapons', 'troops', 'Wagner', 'drone', 'airforce', 'deployment', 'naval', 'carrier', 'CENTCOM', 'IRGC', 'militia', 'proxy', 'convoy', 'F-35', 'missile', 'warship', 'base'],
  diplomacy: ['diplomacy', 'summit', 'treaty', 'sanctions', 'bilateral', 'peace talks', 'ambassador', 'African Union', 'normalization', 'Abraham Accords', 'ceasefire', 'negotiations', 'UN Security Council', 'NATO'],
};

// Reverse lookup
function matchCountries(text: string): string[] {
  const matched: string[] = [];
  const lower = text.toLowerCase();
  for (const [id, term] of Object.entries(COUNTRY_TERMS)) {
    if (lower.includes(term.toLowerCase())) matched.push(id);
  }
  return matched;
}

function matchTopics(text: string): NewsTopic[] {
  const matched: NewsTopic[] = [];
  const lower = text.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_TERMS)) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      matched.push(topic as NewsTopic);
    }
  }
  return matched;
}

// ══════════════════════════════════════════════════
// CONFLICT AXES — Geopolitische Konfliktachsen
// Erkennt große Zusammenhänge in den Meldungen
// ══════════════════════════════════════════════════

const CONFLICT_AXIS_DEFS: Omit<ConflictAxis, 'articles' | 'intensity'>[] = [
  // ── MIDDLE EAST AXES ──
  {
    id: 'usa-iran', name: 'USA ↔ Iran', nameShort: 'USA-Iran',
    description: 'Strategische Rivalität: Nuklearprogramm, Sanktionen, Proxy-Kontrolle, JCPOA-Verhandlungen, CENTCOM vs. IRGC',
    actors: ['United States', 'USA', 'Washington', 'Pentagon', 'Iran', 'Tehran', 'IRGC', 'Quds Force', 'Khamenei', 'CENTCOM'],
    keywords: ['nuclear', 'JCPOA', 'enrichment', 'uranium', 'sanctions', 'maximum pressure', 'strait of hormuz', 'proxy'],
    color: '#ef4444', icon: '🇺🇸⚡🇮🇷', region: 'mideast',
  },
  {
    id: 'israel-hamas', name: 'Israel ↔ Hamas / Gaza', nameShort: 'Israel-Hamas',
    description: 'Gaza-Konflikt: Militäroperationen, Blockade, Waffenstillstandsverhandlungen, Geiseln, humanitäre Krise',
    actors: ['Israel', 'IDF', 'Netanyahu', 'Hamas', 'Gaza', 'Palestine', 'Islamic Jihad'],
    keywords: ['hostage', 'ceasefire', 'blockade', 'ground operation', 'Rafah', 'Khan Younis', 'UNRWA', 'humanitarian corridor', 'two-state'],
    color: '#f97316', icon: '🇮🇱⚔️🇵🇸', region: 'mideast',
  },
  {
    id: 'israel-hezbollah', name: 'Israel ↔ Hezbollah / Libanon', nameShort: 'Israel-Hezbollah',
    description: 'Nordfront: Grenzeskalation, Raketenbeschuss, Hezbollah-Drohnen, UNIFIL, Blauer-Linie-Verletzungen',
    actors: ['Israel', 'Hezbollah', 'Lebanon', 'Nasrallah', 'UNIFIL', 'Litani'],
    keywords: ['northern front', 'blue line', 'rocket', 'anti-tank', 'Iron Dome', 'evacuation', 'south Lebanon'],
    color: '#a855f7', icon: '🇮🇱⚡🇱🇧', region: 'mideast',
  },
  {
    id: 'iran-proxy-axis', name: 'Iran → Proxy-Achse', nameShort: 'Iran-Proxys',
    description: 'Achse des Widerstands: Iran steuert Hezbollah, Hamas, Houthis, PMF/Irak-Milizen, Syrische Verbündete',
    actors: ['Iran', 'IRGC', 'Quds Force', 'Hezbollah', 'Hamas', 'Houthi', 'PMF', 'Kata\'ib Hezbollah', 'Asaib Ahl al-Haq'],
    keywords: ['axis of resistance', 'proxy', 'militia', 'weapons transfer', 'smuggling', 'Tehran', 'corridor'],
    color: '#dc2626', icon: '🇮🇷🕸️', region: 'mideast',
  },
  {
    id: 'saudi-houthi', name: 'Saudi-Arabien ↔ Houthis / Jemen', nameShort: 'Saudi-Houthis',
    description: 'Jemen-Krieg: Houthi-Angriffe, Koalitions-Luftschläge, Rotes Meer-Blockade, Friedensgespräche',
    actors: ['Saudi Arabia', 'Houthi', 'Yemen', 'Ansar Allah', 'MBS', 'coalition'],
    keywords: ['Red Sea', 'Bab el-Mandeb', 'shipping', 'Marib', 'Hodeidah', 'peace talks', 'truce', 'Riyadh agreement'],
    color: '#eab308', icon: '🇸🇦⚔️🇾🇪', region: 'mideast',
  },
  {
    id: 'usa-israel', name: 'USA ↔ Israel (Allianz & Spannungen)', nameShort: 'USA-Israel',
    description: 'Strategische Allianz: Militärhilfe, Iron Dome, politische Spannungen, Siedlungspolitik, Abraham Accords',
    actors: ['United States', 'USA', 'Biden', 'Israel', 'Netanyahu', 'Congress', 'AIPAC'],
    keywords: ['military aid', 'Iron Dome', 'weapons shipment', 'F-35', 'settlement', 'Abraham Accords', 'veto', 'UN Security Council'],
    color: '#3b82f6', icon: '🇺🇸🤝🇮🇱', region: 'mideast',
  },
  {
    id: 'turkey-kurds', name: 'Türkei ↔ Kurden (PKK/SDF)', nameShort: 'Türkei-Kurden',
    description: 'Kurdenkonflikt: PKK-Operationen, SDF in Nordsyrien, türkische Militäroperationen, Nordirak',
    actors: ['Turkey', 'Erdogan', 'PKK', 'SDF', 'YPG', 'Kurdistan', 'Rojava'],
    keywords: ['northern Syria', 'Afrin', 'Operation', 'cross-border', 'northern Iraq', 'Sinjar', 'Kobani'],
    color: '#10b981', icon: '🇹🇷⚔️', region: 'mideast',
  },
  {
    id: 'russia-syria', name: 'Russland → Syrien', nameShort: 'Russland-Syrien',
    description: 'Russische Militärpräsenz: Tartus-Marinebasis, Hmeimim-Luftwaffenbasis, Assad-Unterstützung, Idlib-Front',
    actors: ['Russia', 'Putin', 'Syria', 'Assad', 'Wagner', 'Tartus', 'Hmeimim'],
    keywords: ['Russian military', 'air base', 'naval base', 'Idlib', 'rebel', 'HTS', 'Hayat Tahrir'],
    color: '#6366f1', icon: '🇷🇺→🇸🇾', region: 'mideast',
  },
  {
    id: 'gulf-normalization', name: 'Golf-Normalisierung', nameShort: 'Normalisierung',
    description: 'Abraham Accords & Erweiterung: Saudi-Israel-Normalisierung, UAE-Israel, Bahrain, regionale Neuordnung',
    actors: ['Saudi Arabia', 'Israel', 'UAE', 'Bahrain', 'MBS', 'Netanyahu'],
    keywords: ['normalization', 'Abraham Accords', 'recognition', 'diplomatic ties', 'peace deal', 'trade', 'embassy'],
    color: '#0ea5e9', icon: '🕊️', region: 'mideast',
  },
  {
    id: 'iran-nuclear', name: 'Iran Nuklearprogramm', nameShort: 'Iran-Nuklear',
    description: 'Nukleare Proliferation: Urananreicherung, IAEA-Inspektionen, Breakout-Kapazität, Dimona vs. Natanz',
    actors: ['Iran', 'IAEA', 'Natanz', 'Fordow', 'Arak', 'Dimona'],
    keywords: ['nuclear', 'enrichment', 'uranium', 'centrifuge', 'breakout', 'JCPOA', 'inspection', 'proliferation', 'atomic'],
    color: '#f43f5e', icon: '☢️🇮🇷', region: 'mideast',
  },
  {
    id: 'china-gulf', name: 'China → Golf / Seidenstraße', nameShort: 'China-Golf',
    description: 'Chinas Expansion: BRI/Seidenstraße, Öl-Imports, Djibouti-Basis, Saudi-China-Annäherung, Vermittlung Iran-Saudi',
    actors: ['China', 'Beijing', 'Saudi Arabia', 'Iran', 'UAE', 'Djibouti'],
    keywords: ['Belt and Road', 'BRI', 'silk road', 'oil', 'trade', 'port', 'Gwadar', 'mediation', 'yuan', 'de-dollarization'],
    color: '#ec4899', icon: '🇨🇳→🌍', region: 'mideast',
  },

  // ── AFRICA AXES ──
  {
    id: 'russia-africa', name: 'Russland → Afrika', nameShort: 'Russland-Afrika',
    description: 'Russische Expansion: Wagner/Africa Corps, Militärkooperationen, Anti-Frankreich, Sahel-Juntas',
    actors: ['Russia', 'Putin', 'Wagner', 'Africa Corps', 'Prigozhin', 'Mali', 'Burkina Faso', 'Niger'],
    keywords: ['Wagner', 'Russian military', 'junta', 'coup', 'anti-French', 'ECOWAS', 'Sahel alliance', 'gold', 'mining'],
    color: '#ef4444', icon: '🇷🇺→🌍', region: 'africa',
  },
  {
    id: 'france-sahel', name: 'Frankreich ↔ Sahel-Krise', nameShort: 'Frankreich-Sahel',
    description: 'Französischer Rückzug: Barkhane-Ende, Truppenabzug Mali/Niger/Burkina, Sahel-Juntas vs. Paris',
    actors: ['France', 'Macron', 'Barkhane', 'Takuba', 'Mali', 'Niger', 'Burkina Faso'],
    keywords: ['French troops', 'withdrawal', 'ambassador', 'expelled', 'ECOWAS', 'junta', 'sovereignty'],
    color: '#3b82f6', icon: '🇫🇷⚡🌍', region: 'africa',
  },
  {
    id: 'china-africa', name: 'China → Afrika', nameShort: 'China-Afrika',
    description: 'Chinas Engagement: BRI-Infrastruktur, Schuldendiplomatie, Hafen- und Bergbauinvestitionen',
    actors: ['China', 'Beijing', 'BRI', 'Africa', 'Djibouti'],
    keywords: ['Belt and Road', 'infrastructure', 'debt', 'loan', 'port', 'mining', 'railway', 'investment'],
    color: '#ec4899', icon: '🇨🇳→🌍', region: 'africa',
  },
  {
    id: 'sahel-jihad', name: 'Sahel-Dschihadismus', nameShort: 'Sahel-Terror',
    description: 'Dschihadistische Expansion: JNIM, ISWAP, Boko Haram, al-Shabab — grenzüberschreitende Ausbreitung',
    actors: ['JNIM', 'ISWAP', 'Boko Haram', 'al-Shabab', 'ADF', 'Islamic State'],
    keywords: ['jihadist', 'caliphate', 'Sahel', 'tri-border', 'Liptako-Gourma', 'Lake Chad', 'Cabo Delgado'],
    color: '#dc2626', icon: '⚠️', region: 'africa',
  },
  {
    id: 'sudan-war', name: 'Sudan: RSF ↔ SAF', nameShort: 'Sudan-Krieg',
    description: 'Bürgerkrieg Sudan: RSF (Hemedti) vs. SAF (al-Burhan), Khartoum, Darfur, humanitäre Katastrophe',
    actors: ['Sudan', 'RSF', 'Rapid Support Forces', 'SAF', 'Hemedti', 'Burhan', 'Darfur', 'Khartoum'],
    keywords: ['civil war', 'paramilitary', 'ceasefire', 'Jeddah talks', 'displacement', 'famine', 'El Fasher'],
    color: '#f97316', icon: '🇸🇩⚔️', region: 'africa',
  },
  {
    id: 'ethiopia-tigray', name: 'Äthiopien / Horn von Afrika', nameShort: 'Äthiopien-Horn',
    description: 'Horn von Afrika: Post-Tigray-Dynamik, Abiy Ahmed, Somalia-Hafen-Deal, Eritrea, regionale Spannungen',
    actors: ['Ethiopia', 'Abiy', 'Tigray', 'TPLF', 'Eritrea', 'Afwerki', 'Somalia', 'Somaliland'],
    keywords: ['Pretoria agreement', 'port deal', 'Red Sea', 'Amhara', 'Fano', 'Oromia', 'OLA'],
    color: '#a855f7', icon: '🇪🇹⚡', region: 'africa',
  },
];

// Match articles to conflict axes
export function matchConflictAxes(articles: NewsArticle[], regionId: RegionId): ConflictAxis[] {
  const axes = CONFLICT_AXIS_DEFS
    .filter(a => a.region === regionId || a.region === 'both')
    .map(def => ({ ...def, articles: [] as NewsArticle[], intensity: 0 }));

  for (const article of articles) {
    const lower = `${article.title} ${article.url}`.toLowerCase();
    for (const axis of axes) {
      const actorMatch = axis.actors.some(a => lower.includes(a.toLowerCase()));
      const kwMatch = axis.keywords.some(k => lower.includes(k.toLowerCase()));
      // Need at least one actor match + one keyword, OR two different actor matches
      const actorCount = axis.actors.filter(a => lower.includes(a.toLowerCase())).length;
      if ((actorMatch && kwMatch) || actorCount >= 2) {
        axis.articles.push(article);
      }
    }
  }

  // Calculate intensity (0-100) based on article count and recency
  const now = Date.now();
  for (const axis of axes) {
    if (axis.articles.length === 0) { axis.intensity = 0; continue; }
    const countScore = Math.min(axis.articles.length * 8, 60);
    const recentCount = axis.articles.filter(a => now - new Date(a.publishedAt).getTime() < 24 * 60 * 60 * 1000).length;
    const recencyScore = Math.min(recentCount * 10, 40);
    axis.intensity = Math.min(countScore + recencyScore, 100);
  }

  return axes.filter(a => a.articles.length > 0).sort((a, b) => b.intensity - a.intensity);
}

// Dedicated GDELT queries for conflict axes
const AXIS_QUERIES_MIDEAST = [
  { query: '(USA OR "United States" OR Pentagon OR CENTCOM) (Iran OR IRGC OR "nuclear" OR sanctions OR Tehran)', label: 'USA ↔ Iran' },
  { query: '(Israel OR IDF OR Netanyahu) (Hamas OR Gaza OR "Islamic Jihad" OR hostage OR ceasefire)', label: 'Israel ↔ Hamas' },
  { query: '(Israel OR IDF) (Hezbollah OR Lebanon OR "blue line" OR "northern front")', label: 'Israel ↔ Hezbollah' },
  { query: '(Iran OR IRGC) (proxy OR Hezbollah OR Houthi OR militia OR "weapons transfer" OR "axis of resistance")', label: 'Iran Proxy-Achse' },
  { query: '(Russia OR Wagner) (Syria OR Assad OR Tartus OR Hmeimim)', label: 'Russland → Syrien' },
  { query: '(Turkey OR Erdogan) (PKK OR SDF OR YPG OR Kurdistan OR "northern Syria" OR "northern Iraq")', label: 'Türkei ↔ Kurden' },
];

const AXIS_QUERIES_AFRICA = [
  { query: '(Russia OR Wagner OR "Africa Corps") (Mali OR "Burkina Faso" OR Niger OR Sudan OR Libya) (military OR troops OR coup OR junta)', label: 'Russland → Afrika' },
  { query: '(Sudan OR RSF OR "Rapid Support" OR Hemedti OR Burhan) (war OR battle OR fighting OR ceasefire OR Darfur)', label: 'Sudan-Krieg' },
];

const AXIS_QUERIES_MAP: Record<RegionId, { query: string; label: string }[]> = {
  africa: AXIS_QUERIES_AFRICA,
  mideast: AXIS_QUERIES_MIDEAST,
};

export async function fetchConflictAxisArticles(
  regionId: RegionId,
  timeRange: TimeRange = '7d',
  onProgress?: (step: number, total: number, label: string) => void,
): Promise<NewsArticle[]> {
  const cacheKey = `axes_${regionId}|${timeRange}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < 3 * 60 * 1000) return cached.articles;

  const queries = AXIS_QUERIES_MAP[regionId] ?? [];
  const seen = new Set<string>();
  const allArticles: NewsArticle[] = [];

  for (let qi = 0; qi < queries.length; qi++) {
    if (qi > 0) await new Promise(r => setTimeout(r, 1200));
    onProgress?.(qi + 1, queries.length, queries[qi].label);

    const url = `/api/gdelt/api/v2/doc/doc?query=${encodeURIComponent(queries[qi].query)}&mode=artlist&maxrecords=30&format=json&sort=datedesc&${gdeltTimeParam(timeRange)}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const text = await resp.text();
      const data = safeParseGdelt(text);
      if (!data) continue;
      for (const a of (data.articles ?? [])) {
        if (!a.url || seen.has(a.url)) continue;
        seen.add(a.url);
        const fullText = `${a.title ?? ''} ${a.url ?? ''}`;
        allArticles.push({
          id: `axis_${allArticles.length}_${Date.now()}`,
          title: a.title ?? 'Untitled',
          url: a.url ?? '#',
          source: (a.domain ?? 'unknown').replace(/^www\./, ''),
          sourceDomain: a.domain ?? '',
          imageUrl: a.socialimage || undefined,
          publishedAt: a.seendate ? parseGdeltDate(a.seendate) : new Date().toISOString(),
          language: a.language ?? 'English',
          countries: matchCountries(fullText),
          topics: matchTopics(fullText),
        });
      }
    } catch { /* continue */ }
  }

  allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  cache.set(cacheKey, { articles: allArticles, fetchedAt: Date.now() });
  return allArticles;
}

// ── Cache ──
interface CacheEntry { articles: NewsArticle[]; fetchedAt: number; }
const cache = new Map<string, CacheEntry>();

// ── GDELT date format → ISO ──
function parseGdeltDate(d: string): string {
  try {
    // "20240115T120000Z" → "2024-01-15T12:00:00Z"
    const m = d.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
    return new Date(d).toISOString();
  } catch { return new Date().toISOString(); }
}

// ── GDELT time range → URL param ──
function gdeltTimeParam(timeRange: TimeRange): string {
  // 24h and 7d use timespan (minutes), 30d uses startdatetime/enddatetime
  // GDELT's timespan has a limit around ~10 days, so 30d needs date range
  if (timeRange === '30d') {
    const now = new Date();
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:T]/g, '').slice(0, 14);
    return `startdatetime=${fmt(start)}&enddatetime=${fmt(now)}`;
  }
  const mins: Record<string, number> = { '24h': 1440, '7d': 10080 };
  return `timespan=${mins[timeRange] ?? 10080}`;
}

// Safe JSON parse for GDELT (sometimes returns HTML or malformed JSON)
function safeParseGdelt(text: string): any | null {
  const trimmed = text.trim();
  if (!trimmed || !trimmed.startsWith('{')) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

// ── Main fetch ──
export async function fetchNews(
  countryIds: string[],
  topics: NewsTopic[],
  timeRange: TimeRange,
  maxResults = 75,
  regionId: RegionId = 'africa',
): Promise<NewsArticle[]> {
  // Build a simple, short query
  // If specific countries: use up to 5, otherwise region default
  let queryTerms: string[];
  let useRawCountryQ = false;
  if (countryIds.length > 0 && countryIds.length <= 5) {
    queryTerms = countryIds.map(id => COUNTRY_TERMS[id] || id);
  } else {
    queryTerms = [];
    useRawCountryQ = true;
  }

  // Add topic terms (first keyword per selected topic)
  const topicBoost = topics.length > 0
    ? topics.map(t => TOPIC_TERMS[t][0])
    : [];

  // GDELT syntax: parentheses ONLY around OR'd terms, not single terms
  const countryQ = useRawCountryQ
    ? REGION_DEFAULT_QUERY[regionId]
    : queryTerms.length > 1
      ? `(${queryTerms.map(t => `"${t}"`).join(' OR ')})`
      : `"${queryTerms[0]}"`;
  const topicQ = topicBoost.length > 0
    ? ` (${topicBoost.map(t => `"${t}"`).join(' OR ')})`
    : countryIds.length === 0
      ? ` ${REGION_BROAD_TOPICS[regionId]}`
      : '';
  const query = `${countryQ}${topicQ}`;

  const cacheKey = `${query}|${timeRange}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < 3 * 60 * 1000) return cached.articles;

  const url = `/api/gdelt/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=${maxResults}&format=json&sort=datedesc&${gdeltTimeParam(timeRange)}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`GDELT ${resp.status}`);
    const text = await resp.text();

    const data = safeParseGdelt(text);
    if (!data) {
      console.warn('GDELT returned non-JSON response');
      return cached?.articles ?? [];
    }

    const rawArticles = data.articles ?? [];

    if (!Array.isArray(rawArticles)) {
      console.warn('GDELT articles not an array:', typeof rawArticles);
      return cached?.articles ?? [];
    }

    const articles: NewsArticle[] = rawArticles.map((a: any, i: number) => {
      const fullText = `${a.title ?? ''} ${a.url ?? ''}`;
      return {
        id: `g_${i}_${Date.now()}`,
        title: a.title ?? 'Untitled',
        url: a.url ?? '#',
        source: (a.domain ?? 'unknown').replace(/^www\./, ''),
        sourceDomain: a.domain ?? '',
        imageUrl: a.socialimage || undefined,
        publishedAt: a.seendate ? parseGdeltDate(a.seendate) : new Date().toISOString(),
        language: a.language ?? 'English',
        countries: matchCountries(fullText),
        topics: matchTopics(fullText),
      };
    });

    // Also fetch from major press houses for broader coverage
    const pressHouseDomains = PRESS_HOUSE_DOMAINS[regionId] ?? [];
    if (pressHouseDomains.length > 0 && countryIds.length === 0) {
      // Batch press house queries (3 domains per query to stay within URL limits)
      const batches: string[][] = [];
      for (let i = 0; i < pressHouseDomains.length; i += 3) {
        batches.push(pressHouseDomains.slice(i, i + 3));
      }
      // Run up to 2 batches in parallel for speed
      const pressBatches = batches.slice(0, 2);
      const pressResults = await Promise.allSettled(
        pressBatches.map(async (domains) => {
          await new Promise(r => setTimeout(r, 800)); // stagger for rate limit
          const domainQ = domains.map(d => `domain:${d}`).join(' OR ');
          const pressQuery = `(${domainQ}) ${countryQ}`;
          const pressUrl = `/api/gdelt/api/v2/doc/doc?query=${encodeURIComponent(pressQuery)}&mode=artlist&maxrecords=25&format=json&sort=datedesc&${gdeltTimeParam(timeRange)}`;
          const resp = await fetch(pressUrl);
          if (!resp.ok) return [];
          const text = await resp.text();
          const data = safeParseGdelt(text);
          if (!data) return [];
          return (data.articles ?? []) as any[];
        })
      );
      const seenUrls = new Set(articles.map(a => a.url));
      for (const result of pressResults) {
        if (result.status !== 'fulfilled') continue;
        for (const a of result.value) {
          if (!a.url || seenUrls.has(a.url)) continue;
          seenUrls.add(a.url);
          const fullText = `${a.title ?? ''} ${a.url ?? ''}`;
          articles.push({
            id: `g_press_${articles.length}_${Date.now()}`,
            title: a.title ?? 'Untitled',
            url: a.url ?? '#',
            source: (a.domain ?? 'unknown').replace(/^www\./, ''),
            sourceDomain: a.domain ?? '',
            imageUrl: a.socialimage || undefined,
            publishedAt: a.seendate ? parseGdeltDate(a.seendate) : new Date().toISOString(),
            language: a.language ?? 'English',
            countries: matchCountries(fullText),
            topics: matchTopics(fullText),
          });
        }
      }
      // Re-sort by date after adding press articles
      articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    cache.set(cacheKey, { articles, fetchedAt: Date.now() });
    return articles;
  } catch (err) {
    console.error('GDELT fetch error:', err);
    return cached?.articles ?? [];
  }
}

export function getCountryName(id: string): string {
  return COUNTRY_TERMS[id] ?? id;
}

// ── Dedicated critical events fetch ──
// Runs multiple targeted queries for conflict/crisis events per region

// Keep keywords short to avoid CORS/URL-length issues with GDELT
const CRISIS_KW = '(killed OR attack OR massacre OR bombing OR coup OR terrorist OR militants OR conflict OR crisis OR war OR troops OR rebels)';
const ME_CRISIS_KW = '(killed OR attack OR airstrike OR bombing OR missile OR terrorist OR militants OR conflict OR war OR troops OR drone OR siege OR ceasefire OR hostage OR rockets OR deployment OR offensive OR casualties)';

// Region-specific critical queries
const AF_GEOPO_KW = '(troops OR deployment OR military OR base OR Wagner OR Russia OR China OR France OR AFRICOM OR peacekeeping OR coup OR junta OR weapons)';

const CRITICAL_QUERIES_AFRICA = [
  { query: `"Africa" ${CRISIS_KW}`, label: 'Afrika gesamt' },
  { query: `(Nigeria OR Mali OR "Burkina Faso" OR Niger OR Chad) ${CRISIS_KW}`, label: 'Sahel / Westafrika' },
  { query: `(Sudan OR Somalia OR Ethiopia OR Congo OR Mozambique) ${CRISIS_KW}`, label: 'Ost- / Zentralafrika' },
  { query: `(Libya OR Egypt OR Kenya OR Cameroon OR "South Sudan") ${CRISIS_KW}`, label: 'Nordafrika / Schlüsselstaaten' },
  // NEU: Geopolitische Großlage
  { query: `("Africa" OR Sahel OR "Horn of Africa") ${AF_GEOPO_KW}`, label: 'Truppen / Geopolitik' },
  // NEU: Terrorismus / nichtstaatliche Akteure
  { query: `(Africa OR Sahel OR Somalia OR Nigeria) ("Boko Haram" OR "al-Shabab" OR "Islamic State" OR JNIM OR ISWAP OR ADF)`, label: 'Terrorgruppen / Milizen' },
];

// ME: Geopolitische Keywords für Truppenverlegungen, Proxys, Waffendeals, Intelligence
const ME_GEOPO_KW = '(troops OR deployment OR military OR base OR naval OR aircraft OR weapons OR arms OR shipment OR convoy OR intelligence OR Mossad OR CIA OR CENTCOM OR "5th Fleet" OR carrier OR warship OR F-35 OR THAAD OR "Iron Dome" OR "Abraham Accords")';
const ME_PROXY_KW = '(proxy OR militia OR IRGC OR "Quds Force" OR Hezbollah OR Hamas OR Houthi OR "Islamic Jihad" OR PMF OR SDF OR PKK OR Wagner)';
const ME_ENERGY_KW = '(oil OR gas OR pipeline OR OPEC OR LNG OR "energy" OR "Strait of Hormuz" OR "Suez Canal" OR "Bab el-Mandeb" OR refinery OR sanctions OR embargo)';
const ME_DIPLO_KW = '(normalization OR "Abraham Accords" OR summit OR treaty OR ceasefire OR negotiations OR "peace deal" OR "two-state" OR annexation OR sovereignty)';

const CRITICAL_QUERIES_MIDEAST = [
  // 1. Gesamtlage Nahost
  { query: `("Middle East" OR "Gulf") ${ME_CRISIS_KW}`, label: 'Nahost gesamt' },
  // 2. Gaza / Israel / Palästina — Kernkonflikt
  { query: `(Gaza OR Israel OR Palestine OR "West Bank" OR Hamas OR Hezbollah) ${ME_CRISIS_KW}`, label: 'Gaza / Israel / Palästina' },
  // 3. Syrien / Irak / ISIS-Raum
  { query: `(Syria OR Iraq OR "Islamic State" OR ISIS OR Kurdistan) ${ME_CRISIS_KW}`, label: 'Syrien / Irak / ISIS' },
  // 4. Jemen / Houthis / Rotes Meer
  { query: `(Yemen OR Houthi OR "Saudi Arabia" OR "Red Sea") ${ME_CRISIS_KW}`, label: 'Jemen / Houthis / Rotes Meer' },
  // 5. Iran / Libanon / Proxy-Achse
  { query: `(Iran OR "nuclear" OR "IRGC" OR Lebanon OR Hezbollah) ${ME_CRISIS_KW}`, label: 'Iran / Libanon / Proxy-Achse' },
  // 6. Türkei / Golf-Staaten
  { query: `(Turkey OR Erdogan OR Qatar OR UAE OR Bahrain) ${ME_CRISIS_KW}`, label: 'Türkei / Golf-Staaten' },
  // 7. Truppenverlegungen / Militärische Großlage
  { query: `("Middle East" OR Gulf OR Israel OR Iran OR Syria OR Iraq) ${ME_GEOPO_KW}`, label: 'Truppen / Militär-Großlage' },
  // 8. Proxy-Kriege / Nichtstaatliche Akteure
  { query: `("Middle East" OR Syria OR Iraq OR Yemen OR Lebanon) ${ME_PROXY_KW}`, label: 'Proxys / Milizen' },
  // 9. Energie / Handelsrouten / Wirtschaftliche Dimension
  { query: `("Middle East" OR Gulf OR Iran OR "Saudi Arabia" OR Iraq) ${ME_ENERGY_KW}`, label: 'Energie / Handelsrouten' },
  // 10. Diplomatie / Normalisierung / Friedensprozesse
  { query: `("Middle East" OR Israel OR "Saudi Arabia" OR Iran OR Palestine) ${ME_DIPLO_KW}`, label: 'Diplomatie / Normalisierung' },
];

const CRITICAL_QUERIES_MAP: Record<RegionId, { query: string; label: string }[]> = {
  africa: CRITICAL_QUERIES_AFRICA,
  mideast: CRITICAL_QUERIES_MIDEAST,
};

export function getCriticalQueryLabels(regionId: RegionId = 'africa'): string[] {
  return (CRITICAL_QUERIES_MAP[regionId] ?? CRITICAL_QUERIES_AFRICA).map(q => q.label);
}

export async function fetchCriticalEvents(
  _countryIds: string[],
  timeRange: TimeRange = '7d',
  onProgress?: (step: number, total: number, label: string) => void,
  regionId: RegionId = 'africa',
): Promise<NewsArticle[]> {
  const cacheKey = `critical_${regionId}|${timeRange}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < 2 * 60 * 1000) return cached.articles;

  const queries = CRITICAL_QUERIES_MAP[regionId] ?? CRITICAL_QUERIES_AFRICA;
  const seen = new Set<string>();
  const allArticles: NewsArticle[] = [];
  const total = queries.length;

  try {
    // Run queries sequentially with delay for GDELT rate limit
    for (let qi = 0; qi < total; qi++) {
      if (qi > 0) await new Promise(r => setTimeout(r, 1500));
      onProgress?.(qi + 1, total, queries[qi].label);

      const url = `/api/gdelt/api/v2/doc/doc?query=${encodeURIComponent(queries[qi].query)}&mode=artlist&maxrecords=50&format=json&sort=datedesc&${gdeltTimeParam(timeRange)}`;

      try {
        const resp = await fetch(url);
        if (!resp.ok) continue;
        const text = await resp.text();
        const data = safeParseGdelt(text);
        if (!data) continue;
        const raw = data.articles ?? [];

        for (const a of raw) {
          if (!a.url || seen.has(a.url)) continue;
          seen.add(a.url);
          const fullText = `${a.title ?? ''} ${a.url ?? ''}`;
          allArticles.push({
            id: `crit_${allArticles.length}_${Date.now()}`,
            title: a.title ?? 'Untitled',
            url: a.url ?? '#',
            source: (a.domain ?? 'unknown').replace(/^www\./, ''),
            sourceDomain: a.domain ?? '',
            imageUrl: a.socialimage || undefined,
            publishedAt: a.seendate ? parseGdeltDate(a.seendate) : new Date().toISOString(),
            language: a.language ?? 'English',
            countries: matchCountries(fullText),
            topics: matchTopics(fullText),
          });
        }
      } catch {
        // continue to next query
      }
    }

    // Sort newest first
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    cache.set(cacheKey, { articles: allArticles, fetchedAt: Date.now() });
    return allArticles;
  } catch (err) {
    console.error('fetchCriticalEvents error:', err);
    return cached?.articles ?? [];
  }
}
