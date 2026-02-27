// ═══════════════════════════════════════════════════════════════
// GDELT → OSINT Bridge: Converts NewsArticle[] → OsintEvent[]
// ═══════════════════════════════════════════════════════════════

import type { NewsArticle } from './newsApi';
import type {
  OsintEvent, Actor, EventCategory, ConfidenceLevel, Verification,
} from '../data/osintData';

// ── Actor detection keywords ──
const ACTOR_KEYWORDS: { actor: Actor; keywords: string[] }[] = [
  { actor: 'usa', keywords: ['united states', 'usa', 'u.s.', 'pentagon', 'centcom', 'white house', 'biden', 'trump', 'us military', 'us navy', 'us air force', 'american', 'nato', 'uss '] },
  { actor: 'iran', keywords: ['iran', 'tehran', 'irgc', 'khamenei', 'iranian', 'natanz', 'fordow', 'raisi'] },
  { actor: 'proxy-iran', keywords: ['houthi', 'hezbollah', 'kataib', 'ansar allah', 'islamic resistance', 'hamas', 'islamic jihad', 'pmf', 'popular mobilization'] },
  { actor: 'proxy-usa', keywords: ['israel', 'idf', 'netanyahu', 'saudi', 'uae', 'bahrain', 'sdf', 'kurdish forces'] },
];

// ── Category detection keywords ──
const CATEGORY_KEYWORDS: { category: EventCategory; keywords: string[] }[] = [
  { category: 'air', keywords: ['airstrike', 'air strike', 'aircraft', 'bomber', 'fighter jet', 'f-35', 'f-22', 'b-1b', 'drone strike', 'uav', 'air force', 'sortie', 'air raid'] },
  { category: 'naval', keywords: ['navy', 'naval', 'warship', 'destroyer', 'carrier', 'frigate', 'submarine', 'fleet', 'maritime', 'sea', 'shipping', 'vessel', 'tanker seizure', 'ship'] },
  { category: 'missile', keywords: ['missile', 'rocket', 'ballistic', 'cruise missile', 'icbm', 'mrbm', 'patriot', 'thaad', 'iron dome', 'air defense', 'intercept'] },
  { category: 'troops', keywords: ['troops', 'soldiers', 'infantry', 'brigade', 'battalion', 'deployment', 'garrison', 'ground forces', 'army'] },
  { category: 'proxy', keywords: ['proxy', 'militia', 'rebel', 'insurgent', 'guerrilla', 'paramilitary', 'non-state'] },
  { category: 'cyber', keywords: ['cyber', 'hack', 'malware', 'ransomware', 'digital attack', 'cyber operation'] },
  { category: 'diplomacy', keywords: ['diplomacy', 'summit', 'talks', 'negotiation', 'ceasefire', 'treaty', 'sanctions', 'un security council', 'ambassador', 'peace'] },
  { category: 'base', keywords: ['base', 'installation', 'facility', 'airfield', 'port', 'outpost', 'camp'] },
];

// ── Country → approximate center coordinates ──
const COUNTRY_COORDS: Record<string, [number, number]> = {
  IR: [32.43, 53.69], IQ: [33.22, 43.68], SY: [34.80, 38.99], YE: [15.55, 48.52],
  SA: [23.89, 45.08], AE: [23.42, 53.85], IL: [31.05, 34.85], PS: [31.95, 35.23],
  LB: [33.85, 35.86], JO: [30.59, 36.24], KW: [29.31, 47.48], BH: [26.07, 50.55],
  QA: [25.35, 51.18], OM: [21.47, 55.98], TR: [38.96, 35.24], EG: [26.82, 30.80],
  SD: [12.86, 30.22], SO: [5.15, 46.20], DJ: [11.59, 43.15], ER: [15.18, 39.78],
  ET: [9.14, 40.49], LY: [26.34, 17.23],
};

// ── Jitter to prevent marker stacking ──
function jitter(coord: number, range = 0.8): number {
  return coord + (Math.random() - 0.5) * range;
}

// ── Detect actor from text ──
function detectActor(text: string): Actor {
  const lower = text.toLowerCase();
  let best: Actor = 'neutral';
  let bestScore = 0;
  for (const entry of ACTOR_KEYWORDS) {
    const score = entry.keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) { bestScore = score; best = entry.actor; }
  }
  return best;
}

// ── Detect category from text ──
function detectCategory(text: string): EventCategory {
  const lower = text.toLowerCase();
  let best: EventCategory = 'diplomacy';
  let bestScore = 0;
  for (const entry of CATEGORY_KEYWORDS) {
    const score = entry.keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) { bestScore = score; best = entry.category; }
  }
  return best;
}

// ── Derive coordinates from country codes ──
function deriveCoordinates(countries: string[], _text: string): { lat: number; lng: number; location: string } {
  // Try first matching country with known coordinates
  for (const cc of countries) {
    const coords = COUNTRY_COORDS[cc];
    if (coords) {
      return { lat: jitter(coords[0]), lng: jitter(coords[1]), location: cc };
    }
  }
  // Fallback: Middle East center
  return { lat: jitter(28.0, 3), lng: jitter(48.0, 5), location: 'Middle East' };
}

// ── Confidence from source ──
function deriveConfidence(article: NewsArticle): ConfidenceLevel {
  // Articles from critical queries tend to be more significant
  if (article.id.startsWith('crit_')) return 'B';
  // Tier 1 sources
  const tier1 = ['reuters.com', 'bbc.co.uk', 'apnews.com', 'aljazeera.com', 'cnn.com', 'nytimes.com'];
  if (tier1.some(d => article.sourceDomain.includes(d))) return 'B';
  return 'C';
}

// ── Verification ──
function deriveVerification(article: NewsArticle): Verification {
  const lower = article.title.toLowerCase();
  if (lower.includes('unconfirmed') || lower.includes('alleged') || lower.includes('reportedly')) return 'unconfirmed';
  if (lower.includes('claim') || lower.includes('propaganda') || lower.includes('state media')) return 'propaganda';
  return 'unconfirmed'; // GDELT data is inherently single-source
}

// ── Strategic significance ──
function deriveSignificance(text: string): 1 | 2 | 3 | 4 | 5 {
  const lower = text.toLowerCase();
  const highImpact = ['killed', 'dead', 'casualties', 'war', 'invasion', 'nuclear', 'carrier', 'attack on', 'strike', 'intercept', 'shot down', 'sunk', 'seized'];
  const midImpact = ['deployment', 'exercise', 'sanctions', 'tensions', 'warning', 'escalation', 'threat'];
  const highScore = highImpact.filter(kw => lower.includes(kw)).length;
  const midScore = midImpact.filter(kw => lower.includes(kw)).length;
  if (highScore >= 3) return 5;
  if (highScore >= 2) return 4;
  if (highScore >= 1) return 3;
  if (midScore >= 2) return 3;
  if (midScore >= 1) return 2;
  return 1;
}

// ═══════════════════════════════════════════════════
// Main conversion function
// ═══════════════════════════════════════════════════

export function convertArticlesToOsintEvents(articles: NewsArticle[]): OsintEvent[] {
  return articles.map((article) => {
    const fullText = `${article.title} ${article.url}`;
    const actor = detectActor(fullText);
    const category = detectCategory(fullText);
    const { lat, lng, location } = deriveCoordinates(article.countries, fullText);
    const confidence = deriveConfidence(article);
    const verification = deriveVerification(article);
    const significance = deriveSignificance(fullText);

    return {
      id: `live-${article.id}`,
      title: article.title,
      description: `Live-Meldung via GDELT — Quelle: ${article.source}`,
      date: article.publishedAt,
      lat,
      lng,
      location,
      actor,
      category,
      confidence,
      verification,
      sources: [{
        id: `src-${article.id}`,
        name: article.source,
        url: article.url,
        type: 'news' as const,
        reliability: confidence,
      }],
      strategicSignificance: significance,
      tags: ['live-intel', 'gdelt', ...article.topics],
      version: 1,
      lastModified: article.publishedAt,
    };
  });
}

// ── Filter: Only keep militarily relevant articles ──
export function filterMilitaryRelevant(articles: NewsArticle[]): NewsArticle[] {
  const militaryKeywords = [
    'military', 'army', 'navy', 'air force', 'troops', 'missile', 'rocket',
    'airstrike', 'drone', 'attack', 'killed', 'strike', 'war', 'combat',
    'weapon', 'carrier', 'destroyer', 'nuclear', 'sanctions', 'deployment',
    'militia', 'proxy', 'hezbollah', 'houthi', 'hamas', 'irgc', 'centcom',
    'idf', 'intercepted', 'bomb', 'explosive', 'casualties', 'conflict',
    'escalation', 'ceasefire', 'invasion', 'offensive', 'defense',
    'intelligence', 'surveillance', 'reconnaissance',
  ];
  return articles.filter(a => {
    const lower = a.title.toLowerCase();
    return militaryKeywords.some(kw => lower.includes(kw));
  });
}
