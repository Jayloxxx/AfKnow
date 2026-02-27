// ══════════════════════════════════════════════════════════════
// LAGE-ANALYSE ENGINE — Regelbasierte Bewertung & Begründung
// Generiert fundierte Begründungen, Ableitungen und Bewertungen
// aus GDELT-Nachrichtendaten. Kein LLM erforderlich.
// ══════════════════════════════════════════════════════════════

import type { NewsArticle, ConflictAxis } from './newsApi';

// ── Types ──
export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'GUARDED' | 'LOW';

export interface ThreatAssessment {
  level: ThreatLevel;
  score: number;
  reasoning: string[];       // Begründung: Warum dieses Level?
  derivations: string[];     // Ableitung: Was lässt sich daraus schließen?
  topicBreakdown: Record<string, number>;
  critCount: number;
  totalCount: number;
}

export interface SectorAssessment {
  id: string;
  name: string;
  countries: string[];
  threat: ThreatAssessment;
  articles: NewsArticle[];
  topCountries: { id: string; count: number; critCount: number }[];
  sectorReasoning: string;   // Gesamtbegründung des Sektors
  sectorDerivation: string;  // Operative Ableitung
}

export interface CountryAssessment {
  id: string;
  threat: ThreatAssessment;
  articles: NewsArticle[];
  dominantTopics: string[];
  countryReasoning: string;
  countryDerivation: string;
}

// ── Threat Level Config ──
export const THREAT_CONFIG: Record<ThreatLevel, { color: string; bg: string; border: string; label: string; labelDE: string }> = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.30)', label: 'CRITICAL', labelDE: 'KRITISCH' },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.30)', label: 'HIGH', labelDE: 'HOCH' },
  ELEVATED: { color: '#eab308', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.30)',  label: 'ELEVATED', labelDE: 'ERHÖHT' },
  GUARDED:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.30)', label: 'GUARDED', labelDE: 'BEWACHT' },
  LOW:      { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.30)',  label: 'LOW', labelDE: 'NIEDRIG' },
};

// ── Topic labels (German) ──
export const TOPIC_DE: Record<string, string> = {
  security: 'Sicherheit', military: 'Militär', politics: 'Politik',
  humanitarian: 'Humanitär', economy: 'Wirtschaft', diplomacy: 'Diplomatie',
};

// ── Scoring ──
// Each article is scored based on:
//  - Critical flag (from GDELT crisis query): +3
//  - Security topic: +2
//  - Military topic: +1.5
//  - Kill/violence keywords in title: +1
//  - Humanitarian: +0.5
//  - Other: +0.3
function scoreArticle(a: NewsArticle): number {
  let s = 0;
  if (a.id.startsWith('crit_')) s += 3;
  if (a.topics.includes('security')) s += 2;
  if (a.topics.includes('military')) s += 1.5;
  if (/killed|massacre|bombing|explosion|attack|dead|casualt|assassination|ambush/i.test(a.title)) s += 1;
  if (a.topics.includes('humanitarian')) s += 0.5;
  if (a.topics.includes('politics') || a.topics.includes('economy') || a.topics.includes('diplomacy')) s += 0.3;
  return s;
}

function scoreToLevel(score: number): ThreatLevel {
  if (score >= 30) return 'CRITICAL';
  if (score >= 18) return 'HIGH';
  if (score >= 10) return 'ELEVATED';
  if (score >= 4) return 'GUARDED';
  return 'LOW';
}

// ── Reasoning Generation ──
// Builds bullet-point reasoning from article data. Purely deterministic.
function generateReasoning(
  articles: NewsArticle[],
  critCount: number,
  topicBreakdown: Record<string, number>,
  _level: ThreatLevel,
  _countryNames?: Record<string, string>,
): string[] {
  const reasons: string[] = [];
  const total = articles.length;

  // 1. Volume assessment
  if (total === 0) {
    reasons.push('Keine relevanten Meldungen im Berichtszeitraum erfasst.');
    return reasons;
  }

  if (total >= 30) {
    reasons.push(`Hohe Meldungsdichte: ${total} Nachrichten im Erfassungszeitraum deuten auf eine dynamische Lage hin.`);
  } else if (total >= 15) {
    reasons.push(`Moderate Meldungsdichte: ${total} erfasste Nachrichten zeigen fortlaufende Aktivität.`);
  } else {
    reasons.push(`Niedrige Meldungsdichte: ${total} Nachrichten im Zeitraum — Lage überwiegend stabil.`);
  }

  // 2. Critical events
  if (critCount > 0) {
    const critPct = Math.round((critCount / total) * 100);
    reasons.push(`${critCount} kritische Ereignisse identifiziert (${critPct}% der Meldungen). Diese stammen aus gezielten Krisen-Abfragen mit Gewalt- und Konflikt-Keywords.`);
  }

  // 3. Topic-based reasoning
  const secCount = topicBreakdown['security'] ?? 0;
  const milCount = topicBreakdown['military'] ?? 0;
  const polCount = topicBreakdown['politics'] ?? 0;
  const humCount = topicBreakdown['humanitarian'] ?? 0;
  const dipCount = topicBreakdown['diplomacy'] ?? 0;

  if (secCount > 0) {
    const secPct = Math.round((secCount / total) * 100);
    reasons.push(`Sicherheitslage: ${secCount} Meldungen (${secPct}%) mit Sicherheitsbezug — umfasst Terrorismus, Anschläge, Entführungen und Aufstände.`);
  }

  if (milCount > 0) {
    const milPct = Math.round((milCount / total) * 100);
    reasons.push(`Militärische Aktivität: ${milCount} Meldungen (${milPct}%) — betrifft Truppenbewegungen, Waffensysteme, Verteidigungspolitik oder bewaffnete Operationen.`);
  }

  if (humCount > 0 && humCount >= total * 0.15) {
    reasons.push(`Humanitäre Dimension: ${humCount} Meldungen zu Flucht, Hunger, Epidemien oder Naturkatastrophen deuten auf Notlagen in der Zivilbevölkerung hin.`);
  }

  if (polCount > 0 && polCount >= total * 0.2) {
    reasons.push(`Politische Instabilität: ${polCount} Meldungen zu Wahlen, Regierungskrisen, Protesten oder Machtwechseln.`);
  }

  if (dipCount > 0 && dipCount >= total * 0.1) {
    reasons.push(`Diplomatische Dynamik: ${dipCount} Meldungen zu Verhandlungen, Sanktionen oder internationalen Beziehungen.`);
  }

  // 4. Keyword-specific reasoning
  const violenceArticles = articles.filter(a => /killed|massacre|dead|casualt/i.test(a.title));
  if (violenceArticles.length > 0) {
    reasons.push(`${violenceArticles.length} Meldung(en) mit expliziten Gewalt-Indikatoren (Tote, Massaker, Opferzahlen) — erhöht die Bewertungsstufe.`);
  }

  const coupArticles = articles.filter(a => /coup|putsch|overthrow|seize power/i.test(a.title));
  if (coupArticles.length > 0) {
    reasons.push(`Hinweise auf Umsturzversuche oder Machtergreifung in ${coupArticles.length} Meldung(en) — hohe politische Brisanz.`);
  }

  const terrorArticles = articles.filter(a => /terrorist|isis|al.?qaeda|boko.?haram|al.?shabaab|jnim|iswap/i.test(a.title));
  if (terrorArticles.length > 0) {
    reasons.push(`${terrorArticles.length} Meldung(en) mit Bezug zu terroristischen Organisationen — indiziert aktive Bedrohung durch nichtstaatliche Akteure.`);
  }

  // 5. Multi-country involvement
  const multiCountryArticles = articles.filter(a => a.countries.length > 1);
  if (multiCountryArticles.length >= 3) {
    reasons.push(`${multiCountryArticles.length} Meldungen mit Mehrländer-Bezug — grenzüberschreitende Dynamiken erkennbar.`);
  }

  return reasons;
}

// ── Derivation Generation ──
// Generates actionable, measured conclusions. Not alarmist, not dismissive.
function generateDerivation(
  articles: NewsArticle[],
  _critCount: number,
  topicBreakdown: Record<string, number>,
  level: ThreatLevel,
  _countryNames?: Record<string, string>,
): string[] {
  const derivations: string[] = [];
  const total = articles.length;
  if (total === 0) {
    derivations.push('Die Datenlage erlaubt keine belastbare Ableitung. Kontinuierliches Monitoring empfohlen.');
    return derivations;
  }

  const secCount = topicBreakdown['security'] ?? 0;
  const milCount = topicBreakdown['military'] ?? 0;
  const humCount = topicBreakdown['humanitarian'] ?? 0;
  const polCount = topicBreakdown['politics'] ?? 0;

  // Overall situation derivation
  if (level === 'CRITICAL') {
    derivations.push('Die Nachrichtenlage deutet auf eine akute Krisensituation hin. Mehrere Indikatoren — hohe Meldungsdichte, kritische Ereignisse und Sicherheitsvorfälle — konvergieren. Erhöhte Aufmerksamkeit und engmaschiges Monitoring sind angezeigt.');
  } else if (level === 'HIGH') {
    derivations.push('Die Lage ist angespannt, aber nicht unkontrolliert. Die Kombination aus Sicherheitsvorfällen und politischer Dynamik erfordert aufmerksame Beobachtung. Eine Eskalation kann nicht ausgeschlossen werden.');
  } else if (level === 'ELEVATED') {
    derivations.push('Die Lage zeigt moderate Spannungen. Einzelne Vorfälle dominieren das Bild, ohne dass eine systemische Krise erkennbar ist. Routinemäßiges Monitoring ist ausreichend.');
  } else if (level === 'GUARDED') {
    derivations.push('Die Lage ist weitgehend stabil mit vereinzelten Vorfällen. Keine Anzeichen für unmittelbare Eskalation. Reguläres Lagebild-Update genügt.');
  } else {
    derivations.push('Keine signifikanten Sicherheitsereignisse registriert. Die Lage wird als stabil bewertet. Grundüberwachung aufrechterhalten.');
  }

  // Specific derivations based on topic mix
  if (secCount > 0 && milCount > 0) {
    const ratio = secCount / Math.max(milCount, 1);
    if (ratio > 2) {
      derivations.push('Das Verhältnis von Sicherheits- zu Militärmeldungen deutet darauf hin, dass nichtstaatliche Gewaltakteure die Dynamik bestimmen, nicht zwischenstaatliche Konflikte.');
    } else if (ratio < 0.8) {
      derivations.push('Überwiegende Militärmeldungen legen nahe, dass staatliche Akteure die Sicherheitslage aktiv gestalten — durch Operationen, Aufrüstung oder Truppenverlegungen.');
    }
  }

  if (humCount > 0 && secCount > 0) {
    derivations.push('Die Gleichzeitigkeit von Sicherheits- und Humanitär-Meldungen kann auf Spillover-Effekte bewaffneter Konflikte auf die Zivilbevölkerung hindeuten.');
  }

  if (polCount >= total * 0.3) {
    derivations.push('Der hohe Anteil politischer Meldungen signalisiert eine Phase institutionellen Wandels oder politischer Umbrüche, die die Sicherheitsarchitektur der Region beeinflussen können.');
  }

  // Cross-border dynamics
  const crossBorder = articles.filter(a => a.countries.length > 1);
  if (crossBorder.length >= 5) {
    derivations.push('Häufige Mehrländer-Verweise deuten auf regionale Verflechtung hin. Krisen in einem Land können Nachbarstaaten destabilisieren — insbesondere durch Flüchtlingsströme, Waffenschmuggel oder grenzüberschreitende Militanz.');
  }

  // Terror group specific
  const terrorGroups = articles.filter(a => /boko.?haram|al.?shabaab|jnim|iswap|isis|aqim/i.test(a.title));
  if (terrorGroups.length >= 2) {
    derivations.push('Die wiederkehrende Nennung dschihadistischer Gruppen weist auf persistente nichtstaatliche Bedrohungen hin. Diese Gruppen nutzen häufig Governance-Defizite und poröse Grenzen aus.');
  }

  // Wagner/Russia
  const wagnerArticles = articles.filter(a => /wagner|russia|africa corps|mercenary|russian/i.test(a.title));
  if (wagnerArticles.length >= 2) {
    derivations.push('Meldungen über russische Militärpräsenz (ehem. Wagner/Africa Corps) deuten auf geopolitische Einflussnahme hin, die die bestehende Sicherheitsarchitektur westlicher Partner herausfordert.');
  }

  return derivations;
}

// ── Main Assessment Function ──
export function assessThreat(articles: NewsArticle[]): ThreatAssessment {
  const total = articles.length;
  const critCount = articles.filter(a => a.id.startsWith('crit_')).length;

  // Topic breakdown
  const topicBreakdown: Record<string, number> = {};
  for (const a of articles) {
    for (const t of a.topics) topicBreakdown[t] = (topicBreakdown[t] ?? 0) + 1;
  }

  // Score
  let score = 0;
  for (const a of articles) score += scoreArticle(a);

  const level = scoreToLevel(score);
  const reasoning = generateReasoning(articles, critCount, topicBreakdown, level);
  const derivations = generateDerivation(articles, critCount, topicBreakdown, level);

  return { level, score, reasoning, derivations, topicBreakdown, critCount, totalCount: total };
}

// ── Country-specific assessment ──
export function assessCountry(
  allArticles: NewsArticle[],
  countryId: string,
  countryName: string,
): CountryAssessment {
  const articles = allArticles.filter(a => a.countries.includes(countryId));
  const threat = assessThreat(articles);

  // Dominant topics
  const sorted = Object.entries(threat.topicBreakdown).sort(([, a], [, b]) => b - a);
  const dominantTopics = sorted.slice(0, 3).map(([t]) => t);

  // Country-specific reasoning
  const reasons: string[] = [];
  if (threat.totalCount === 0) {
    reasons.push(`Für ${countryName} liegen im Berichtszeitraum keine relevanten Meldungen vor.`);
  } else {
    reasons.push(`${countryName}: ${threat.totalCount} Meldung(en) erfasst, davon ${threat.critCount} aus der Krisen-Abfrage.`);

    if (dominantTopics.length > 0) {
      const topicStr = dominantTopics.map(t => TOPIC_DE[t] ?? t).join(', ');
      reasons.push(`Dominierende Themen: ${topicStr}.`);
    }

    const violenceCount = articles.filter(a => /killed|massacre|dead|casualt|attack/i.test(a.title)).length;
    if (violenceCount > 0) {
      reasons.push(`${violenceCount} Meldung(en) mit Gewaltbezug — deutet auf aktive Konfliktsituation.`);
    }

    const sources = new Set(articles.map(a => a.source));
    if (sources.size >= 5) {
      reasons.push(`Breite Medienabdeckung aus ${sources.size} verschiedenen Quellen — Ereignisse haben internationale Aufmerksamkeit.`);
    }
  }

  // Country derivation
  const derivations: string[] = [];
  if (threat.level === 'CRITICAL' || threat.level === 'HIGH') {
    derivations.push(`${countryName} zeigt eine erhöhte Bedrohungslage. Die Meldungslage erfordert verstärkte Beobachtung. Lageentwicklung sollte in kürzeren Intervallen geprüft werden.`);
  } else if (threat.level === 'ELEVATED') {
    derivations.push(`Moderate Spannungen in ${countryName}. Lage ist nicht akut, aber dynamisch. Routineüberwachung beibehalten.`);
  } else {
    derivations.push(`${countryName} zeigt im Berichtszeitraum keine signifikanten Auffälligkeiten. Standardmäßiges Monitoring ausreichend.`);
  }

  // Multi-topic derivation
  if ((threat.topicBreakdown['security'] ?? 0) > 0 && (threat.topicBreakdown['humanitarian'] ?? 0) > 0) {
    derivations.push(`Gleichzeitige Sicherheits- und Humanitär-Meldungen deuten auf eine Situation hin, in der bewaffnete Konflikte direkte Auswirkungen auf die Bevölkerung haben.`);
  }

  return {
    id: countryId,
    threat,
    articles,
    dominantTopics,
    countryReasoning: reasons.join(' '),
    countryDerivation: derivations.join(' '),
  };
}

// ── Sector assessment ──
export function assessSector(
  allArticles: NewsArticle[],
  sectorId: string,
  sectorName: string,
  sectorCountries: string[],
  countryNames: Record<string, string>,
): SectorAssessment {
  const articles = allArticles.filter(a => a.countries.some(c => sectorCountries.includes(c)));
  const threat = assessThreat(articles);

  // Country breakdown within sector
  const countryCounts: Record<string, { count: number; critCount: number }> = {};
  for (const a of articles) {
    for (const c of a.countries) {
      if (sectorCountries.includes(c)) {
        if (!countryCounts[c]) countryCounts[c] = { count: 0, critCount: 0 };
        countryCounts[c].count++;
        if (a.id.startsWith('crit_')) countryCounts[c].critCount++;
      }
    }
  }

  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([id, data]) => ({ id, ...data }));

  // Sector-specific reasoning
  const topCountryNames = topCountries.slice(0, 3).map(tc => countryNames[tc.id] ?? tc.id);
  let sectorReasoning = '';
  if (articles.length === 0) {
    sectorReasoning = `${sectorName}: Keine relevanten Meldungen im Berichtszeitraum. Die Lage im Sektor scheint ruhig.`;
  } else {
    const parts: string[] = [];
    parts.push(`${sectorName}: ${articles.length} Meldung(en) aus ${Object.keys(countryCounts).length} Ländern.`);
    if (topCountryNames.length > 0) {
      parts.push(`Schwerpunktländer: ${topCountryNames.join(', ')}.`);
    }
    if (threat.critCount > 0) {
      parts.push(`${threat.critCount} kritische Ereignisse treiben die Bewertung.`);
    }
    const dominantTopic = Object.entries(threat.topicBreakdown).sort(([, a], [, b]) => b - a)[0];
    if (dominantTopic) {
      parts.push(`Dominantes Thema: ${TOPIC_DE[dominantTopic[0]] ?? dominantTopic[0]} (${dominantTopic[1]} Meldungen).`);
    }
    sectorReasoning = parts.join(' ');
  }

  // Sector derivation
  let sectorDerivation = '';
  if (threat.level === 'CRITICAL' || threat.level === 'HIGH') {
    const hotspotStr = topCountryNames.slice(0, 2).join(' und ');
    sectorDerivation = `Der Sektor erfordert prioritäre Aufmerksamkeit. ${hotspotStr ? `Insbesondere ${hotspotStr} zeig(t/en) Indikatoren für eine sich verschärfende Lage.` : ''} Eine Verschlechterung der Sicherheitslage kann regionale Auswirkungen haben.`;
  } else if (threat.level === 'ELEVATED') {
    sectorDerivation = `Moderate Spannungen im Sektor. Die Situation ist beherrschbar, erfordert aber aufmerksame Beobachtung. Einzelereignisse können die Lage kurzfristig verschärfen.`;
  } else {
    sectorDerivation = `Der Sektor zeigt im Berichtszeitraum keine signifikanten Krisenzeichen. Grundüberwachung aufrechterhalten.`;
  }

  return {
    id: sectorId, name: sectorName, countries: sectorCountries,
    threat, articles, topCountries, sectorReasoning, sectorDerivation,
  };
}

// ── Global assessment text ──
export function generateGlobalAssessment(
  threat: ThreatAssessment,
  sectorCount: number,
  activeSectors: number,
  countryCount: number,
): { summary: string; derivation: string } {
  const { level, totalCount, critCount } = threat;

  let summary = '';
  if (level === 'CRITICAL') {
    summary = `Die Gesamtlage der Region wird als KRITISCH bewertet. ${totalCount} Meldungen, darunter ${critCount} kritische Ereignisse, zeichnen ein Bild aktiver Konflikte und Sicherheitskrisen. ${activeSectors} von ${sectorCount} Sektoren zeigen relevante Aktivität. Die hohe Konzentration von Sicherheits- und Gewaltmeldungen indiziert multiple, teils miteinander verbundene Krisenherde.`;
  } else if (level === 'HIGH') {
    summary = `Die Gesamtlage wird als HOCH eingestuft. ${totalCount} Meldungen wurden erfasst, ${critCount} davon aus gezielten Krisen-Abfragen. Die Sicherheitslage in mehreren Teilregionen ist angespannt, ohne dass eine flächendeckende Krise vorliegt.`;
  } else if (level === 'ELEVATED') {
    summary = `Die Gesamtlage ist ERHÖHT. ${totalCount} Meldungen zeigen punktuelle Spannungen, die Gesamtdynamik bleibt jedoch beherrschbar. ${activeSectors} Sektoren weisen moderate Aktivität auf.`;
  } else {
    summary = `Die Gesamtlage wird als ${THREAT_CONFIG[level].labelDE} bewertet. ${totalCount} Meldungen aus ${countryCount} Ländern — keine akuten Krisensignale. Die Region befindet sich in einer Phase relativer Stabilität.`;
  }

  let derivation = '';
  if (level === 'CRITICAL' || level === 'HIGH') {
    derivation = `Empfehlung: Monitoring-Intervall verkürzen. Sektorale Schwerpunkte identifizieren und dort die taktische Lage vertieft analysieren. Grenzüberschreitende Dynamiken im Auge behalten. Die Ableitung basiert ausschließlich auf Nachrichtenvolumen und -kategorisierung — keine nachrichtendienstliche Bewertung.`;
  } else if (level === 'ELEVATED') {
    derivation = `Empfehlung: Routinemäßiges Monitoring beibehalten. Einzelne Sektoren bei Bedarf vertieft analysieren. Die Datenlage deutet auf eine kontrollierbare Situation hin, die sich jedoch bei externen Schocks verschärfen kann.`;
  } else {
    derivation = `Empfehlung: Routineüberwachung aufrechterhalten. Keine unmittelbaren Maßnahmen erforderlich. Nächste planmäßige Bewertung zum regulären Aktualisierungszeitpunkt.`;
  }

  return { summary, derivation };
}

// ══════════════════════════════════════════════════════════════
// CONFLICT AXIS ANALYSIS — Geopolitische Einordnung
// Generiert Kontext und Einordnungstexte für Konfliktachsen
// ══════════════════════════════════════════════════════════════

export interface AxisAssessment {
  axisId: string;
  threatLevel: ThreatLevel;
  score: number;
  situationText: string;      // Aktuelle Lageeinschätzung
  contextText: string;        // Geopolitischer Kontext / Hintergrund
  implicationText: string;    // Was das bedeutet / Einordnung
  keyIndicators: string[];    // Stichpunkte: Schlüsselindikatoren
  recentHighlight: string;    // Die wichtigste aktuelle Meldung zusammengefasst
}

// Deep context databases for each axis — regelbasiert, kein LLM
const AXIS_CONTEXT: Record<string, {
  background: string;
  escalationFactors: string[];
  deescalationFactors: string[];
  keyActors: string[];
  implications: Record<string, string>; // keyword → implication
}> = {
  'usa-iran': {
    background: 'Die USA-Iran-Rivalität ist die strukturbestimmende Achse des Nahen Ostens seit 1979. Iran verfolgt regionale Hegemonie über ein Netzwerk von Proxy-Kräften (Hezbollah, Hamas, Houthis, irakische Milizen). Die USA halten mit CENTCOM, der 5. Flotte in Bahrain und Partnerschaften mit Israel/Golf-Staaten dagegen.',
    escalationFactors: ['Urananreicherung über 60%', 'Angriffe auf US-Basen im Irak/Syrien', 'Tanker-Beschlagnahmungen in der Straße von Hormuz', 'IRGC-Operationen gegen US-Verbündete', 'Sanktionsverschärfung'],
    deescalationFactors: ['JCPOA-Verhandlungen', 'Gefangenenaustausch', 'Indirekte Gespräche über Oman', 'Chinesische/russische Vermittlung'],
    keyActors: ['CENTCOM', 'IRGC', 'Quds Force', '5th Fleet', 'Mossad', 'State Department'],
    implications: {
      'nuclear': 'Fortschritte im Nuklearprogramm verschieben den Breakout-Zeitraum und erhöhen den Druck auf Israel, präemptiv zu handeln.',
      'sanctions': 'Sanktionsverschärfungen treffen die iranische Wirtschaft, können aber auch Hardliner stärken.',
      'troops': 'Truppenverlegungen signalisieren Abschreckung — können aber auch als Provokation gelesen werden.',
      'drone': 'Drohnenangriffe auf US-Basen durch Iran-gesteuerte Milizen testen die amerikanische Reaktionsschwelle.',
      'carrier': 'Flugzeugträger-Verlegungen in den Golf sind die stärkste Form konventioneller Abschreckung.',
    },
  },
  'israel-hamas': {
    background: 'Der Israel-Hamas-Konflikt hat sich seit Oktober 2023 fundamental gewandelt. Die israelische Bodenoperation in Gaza, die humanitäre Krise und die internationalen Waffenstillstandsverhandlungen bestimmen die regionale Dynamik.',
    escalationFactors: ['Bodenoffensive-Ausweitung', 'Geiseltötungen', 'Humanitäre Blockade', 'Siedlergewalt im Westjordanland', 'Hezbollah-Nordfront-Eskalation'],
    deescalationFactors: ['Geiselabkommen', 'Waffenstillstand', 'Humanitäre Korridore', 'Internationale Vermittlung (Ägypten/Katar)'],
    keyActors: ['IDF', 'Hamas', 'Islamischer Dschihad', 'Ägypten (Vermittler)', 'Katar (Vermittler)', 'UNRWA'],
    implications: {
      'ceasefire': 'Waffenstillstandsverhandlungen sind der Schlüssel — scheitern sie, droht weitere Eskalation auch an der Nordfront.',
      'hostage': 'Geiselsituation ist der politisch sensibelste Faktor in der israelischen Innenpolitik.',
      'Rafah': 'Operationen in Rafah betreffen den letzten Zufluchtsort für über 1 Million Zivilisten.',
      'humanitarian': 'Die humanitäre Lage in Gaza hat direkte Auswirkungen auf die internationale Legitimität der Operation.',
      'settlement': 'Siedlungsaktivitäten im Westjordanland erhöhen die Langzeit-Instabilität parallel zum Gaza-Krieg.',
    },
  },
  'israel-hezbollah': {
    background: 'Die Israel-Hezbollah-Achse an der libanesischen Grenze ist der potentiell gefährlichste Eskalationsvektor im Nahen Osten. Hezbollah verfügt über geschätzt 150.000+ Raketen und Lenkwaffen, die israelische Städte bedrohen.',
    escalationFactors: ['Tötung hochrangiger Hezbollah-Kommandeure', 'Massenraketenbeschuss auf Nordisrael', 'Bodeninfiltration', 'UNIFIL-Zwischenfälle'],
    deescalationFactors: ['Implizite Regeln der Abschreckung', 'UNIFIL-Pufferzone', 'Libanesische Innenpolitik bremst Hezbollah', 'Iranische Zurückhaltung'],
    keyActors: ['Hezbollah', 'IDF Nordkommando', 'UNIFIL', 'Iran (Auftraggeber)', 'Libanesische Regierung'],
    implications: {
      'rocket': 'Raketenbeschuss auf Nordisrael kann zu Massenevakuierungen führen und den Druck auf eine Bodenoperation erhöhen.',
      'drone': 'Hezbollah-Drohnen testen die israelische Luftabwehr und sammeln Aufklärungsdaten.',
      'evacuation': 'Evakuierungen auf beiden Seiten der Grenze signalisieren Vorbereitung auf größere Kampfhandlungen.',
    },
  },
  'iran-proxy-axis': {
    background: 'Irans "Achse des Widerstands" ist ein Netzwerk verbündeter Milizen und Organisationen, die iranische Interessen in der Region durchsetzen. Dieses Netzwerk erstreckt sich von Libanon über Syrien und Irak bis nach Jemen.',
    escalationFactors: ['Koordinierte Multi-Front-Angriffe', 'Waffentransfers (Präzisionsraketen)', 'IRGC-Ausbilder in Konfliktgebieten'],
    deescalationFactors: ['Wirtschaftlicher Druck auf Iran', 'Interne Machtkämpfe innerhalb der Proxys', 'Lokaler Widerstand gegen iranischen Einfluss'],
    keyActors: ['IRGC Quds Force', 'Hezbollah', 'Hamas', 'Houthis', 'Kata\'ib Hezbollah', 'Asaib Ahl al-Haq', 'PMF'],
    implications: {
      'proxy': 'Proxy-Aktivitäten erlauben Iran strategische Tiefe ohne direkte militärische Konfrontation.',
      'weapons': 'Waffentransfers, insbesondere Präzisionsraketen, verändern die militärische Balance grundlegend.',
      'corridor': 'Der "Land-Korridor" Iran-Irak-Syrien-Libanon ist die logistische Lebensader des Netzwerks.',
    },
  },
  'saudi-houthi': {
    background: 'Der Jemen-Konflikt ist der längste aktive Krieg im Nahen Osten. Die Houthis kontrollieren Nordwestjemen inkl. der Hauptstadt Sanaa und haben ihre Fähigkeiten zu Drohnen- und Raketenangriffen auf Saudi-Arabien und die internationale Schifffahrt im Roten Meer massiv ausgebaut.',
    escalationFactors: ['Angriffe auf Schifffahrt im Roten Meer', 'Drohnenangriffe auf Saudi-Infrastruktur', 'Houthi-Offensiven um Marib'],
    deescalationFactors: ['Saudi-Houthi-Friedensgespräche', 'UN-Vermittlung', 'Waffenstillstand-Verlängerungen'],
    keyActors: ['Saudi-Koalition', 'Ansar Allah (Houthis)', 'UAE', 'UN-Sondergesandter', 'US Navy (Rotes Meer)'],
    implications: {
      'Red Sea': 'Houthi-Angriffe auf die Schifffahrt im Roten Meer betreffen 12% des Welthandels und können globale Lieferketten stören.',
      'shipping': 'Umroutungen um das Kap der Guten Hoffnung erhöhen Transportkosten und -zeiten massiv.',
      'Bab el-Mandeb': 'Kontrolle über Bab el-Mandeb ist eine der strategischsten Positionen weltweit.',
    },
  },
  'usa-israel': {
    background: 'Die US-Israel-Allianz ist die engste bilaterale Sicherheitspartnerschaft im Nahen Osten. Die USA liefern jährlich ~$3.8 Mrd. Militärhilfe. Gleichzeitig gibt es wachsende Spannungen über Siedlungspolitik, Gaza-Krieg und regionale Strategie.',
    escalationFactors: ['Waffenlieferungspausen', 'UN-Veto-Enthaltungen', 'Siedlungs-Sanktionen'],
    deescalationFactors: ['Militärhilfe-Pakete', 'Iron Dome Nachschub', 'Abraham Accords Erweiterung'],
    keyActors: ['Pentagon', 'State Department', 'AIPAC', 'Israelische Regierung', 'US-Kongress'],
    implications: {
      'weapons': 'Waffenlieferungsentscheidungen sind das stärkste Signal der US-Unterstützung — oder deren Einschränkung.',
      'F-35': 'F-35-Lieferungen an Israel stärken die qualitative militärische Überlegenheit (QME) in der Region.',
      'veto': 'US-Vetorecht im UN-Sicherheitsrat ist Israels wichtigster diplomatischer Schutzschild.',
      'Abraham': 'Abraham Accords schaffen eine neue Allianzarchitektur: Israel + Golfstaaten als Gegengewicht zu Iran.',
    },
  },
  'turkey-kurds': {
    background: 'Der Türkei-Kurden-Konflikt ist einer der ältesten im Nahen Osten (seit 1984). Die Türkei führt regelmäßig grenzüberschreitende Operationen gegen PKK-Stellungen im Nordirak und SDF/YPG-Gebiete in Nordsyrien durch.',
    escalationFactors: ['Türkische Bodenoffensiven', 'PKK-Anschläge in der Türkei', 'SDF-US-Kooperation (türkische Perspektive)'],
    deescalationFactors: ['Friedensgespräche', 'Anerkennung kurdischer Autonomie', 'US-Vermittlung'],
    keyActors: ['TSK (türk. Streitkräfte)', 'PKK', 'SDF/YPG', 'US-Spezialkräfte (NE-Syrien)', 'KRG (Irak-Kurdistan)'],
    implications: {
      'operation': 'Türkische Militäroperationen destabilisieren Nordsyrien und gefährden den Anti-ISIS-Kampf.',
      'PKK': 'PKK-Anschläge können innenpolitisch genutzt werden, um Militäroperationen zu legitimieren.',
    },
  },
  'russia-syria': {
    background: 'Russland ist seit 2015 militärisch in Syrien präsent mit Marinebasis Tartus und Luftwaffenbasis Hmeimim. Die russische Intervention sicherte das Assad-Regime. Russlands Fokus hat sich teilweise auf die Ukraine verlagert, aber die Basen bleiben strategisch wichtig.',
    escalationFactors: ['Eskalation Idlib-Front', 'Israelische Luftangriffe auf iranische Ziele in Syrien', 'Russisch-türkische Spannungen in Nordsyrien'],
    deescalationFactors: ['Russisch-türkisches Abkommen zu Idlib', 'Arabische Normalisierung mit Assad'],
    keyActors: ['Russische Streitkräfte', 'Assad-Regime', 'HTS (Hayat Tahrir al-Sham)', 'Türkei', 'Iran (in Syrien)'],
    implications: {
      'Tartus': 'Tartus ist Russlands einzige Marinebasis am Mittelmeer — strategisch unersetzbar.',
      'Idlib': 'Idlib bleibt die letzte Rebellenhochburg — eine Offensive hätte massive humanitäre Folgen.',
    },
  },
  'russia-africa': {
    background: 'Russlands Engagement in Afrika über Wagner/Africa Corps ist eine der dynamischsten geopolitischen Entwicklungen. Seit den Sahel-Putschen (Mali 2021, Burkina Faso 2022, Niger 2023) hat Russland Frankreich als dominanten externen Akteur in der Region abgelöst.',
    escalationFactors: ['Neue Militärabkommen', 'Vertreibung westlicher Partner', 'Ressourcen-Deals (Gold, Uran)'],
    deescalationFactors: ['ECOWAS-Druck', 'Zivilgesellschaftlicher Widerstand', 'Wagner-interne Instabilität'],
    keyActors: ['Wagner/Africa Corps', 'Sahel-Juntas', 'ECOWAS', 'Frankreich', 'AFRICOM'],
    implications: {
      'Wagner': 'Wagners Präsenz sichert Juntas ab, liefert aber Menschenrechtsverletzungen als Nebeneffekt.',
      'coup': 'Putsche in der Sahel-Region folgen einem Muster: Anti-französisch, pro-russisch, anti-demokratisch.',
      'gold': 'Ressourcen-Deals (Gold, Uran) finanzieren sowohl Wagner als auch die Juntas.',
    },
  },
  'gulf-normalization': {
    background: 'Die Abraham Accords (2020) zwischen Israel und UAE/Bahrain markieren einen Paradigmenwechsel in der Region. Eine mögliche Saudi-Israel-Normalisierung wäre der größte geopolitische Umbruch seit Jahrzehnten und würde die Machtarchitektur des Nahen Ostens fundamental verändern.',
    escalationFactors: ['Gaza-Krieg blockiert Normalisierung', 'Palästinensischer Widerstand', 'Innenpolitischer Druck in Saudi-Arabien'],
    deescalationFactors: ['Saudi-Israel Geheimverhandlungen', 'Wirtschaftliche Anreize', 'US-Sicherheitsgarantien'],
    keyActors: ['Saudi-Arabien (MBS)', 'Israel', 'UAE', 'USA (Vermittler)', 'Palästinensische Autonomiebehörde'],
    implications: {
      'normalization': 'Saudi-Israel-Normalisierung würde Irans regionale Isolation vertiefen.',
      'Abraham': 'Abraham Accords schaffen einen neuen Sicherheitsverbund gegen iranische Expansion.',
    },
  },
  'iran-nuclear': {
    background: 'Irans Nuklearprogramm ist das destabilisierendste Einzelthema im Nahen Osten. Nach dem US-Ausstieg aus dem JCPOA (2018) hat Iran die Urananreicherung auf 60% hochgefahren — nahe der Waffentauglichkeit (90%). Die Breakout-Zeit wird auf wenige Wochen geschätzt.',
    escalationFactors: ['Anreicherung auf 90%', 'IAEA-Inspektoren-Ausweisung', 'Israelische Drohungen präemptiver Schläge'],
    deescalationFactors: ['Neue JCPOA-Verhandlungen', 'IAEA-Abkommen', 'Back-Channel-Diplomatie'],
    keyActors: ['Iran (AEOI)', 'IAEA', 'Israel (Mossad)', 'USA', 'EU (E3)'],
    implications: {
      'enrichment': 'Jede Steigerung der Anreicherung verkürzt die Breakout-Zeit und erhöht den Handlungsdruck auf Israel/USA.',
      'IAEA': 'Einschränkung der IAEA-Inspektionen ist ein Frühwarnindikator für Eskalation.',
      'breakout': 'Eine nukleare Bewaffnung Irans könnte ein regionales Wettrüsten auslösen (Saudi-Arabien, Türkei, Ägypten).',
    },
  },
  'china-gulf': {
    background: 'China baut seine Präsenz im Nahen Osten systematisch aus — als Gegengewicht zur US-Dominanz. China vermittelte 2023 die Saudi-Iran-Annäherung und importiert >50% seines Öls aus der Golfregion. Die BRI/Seidenstraße schafft Infrastruktur-Abhängigkeiten.',
    escalationFactors: ['Marinebasis-Ausbau Djibouti', 'Waffenverkäufe (Drohnen)', 'De-Dollarisierung des Ölhandels'],
    deescalationFactors: ['Chinas Nicht-Einmischungspolitik', 'Wirtschaftliche Interdependenz mit USA'],
    keyActors: ['China (Xi)', 'Saudi-Arabien', 'Iran', 'UAE', 'Pakistan (Gwadar)'],
    implications: {
      'oil': 'Chinas Abhängigkeit von Golf-Öl macht es zum Stakeholder in regionaler Stabilität.',
      'yuan': 'Ölhandel in Yuan untergräbt das Petrodollar-System — mit globalen Auswirkungen.',
      'mediation': 'Chinas Vermittlerrolle (Saudi-Iran) positioniert es als Alternative zu US-Diplomatie.',
    },
  },
  'sahel-jihad': {
    background: 'Der Sahel ist das Epizentrum des globalen Dschihadismus. JNIM (al-Qaida-Ableger) und ISWAP (IS-Ableger) haben ihre Kontrolle über weite Gebiete in Mali, Burkina Faso und Niger ausgedehnt. Staatliche Sicherheitskräfte sind überfordert, Wagner/Africa Corps füllt das Vakuum teilweise.',
    escalationFactors: ['Territoriale Expansion', 'Massaker an Zivilisten', 'Rekrutierungsoffensiven', 'Küstenstaat-Expansion (Ghana, Togo, Benin)'],
    deescalationFactors: ['Regionale Kooperation', 'Community-Engagement', 'Grenzüberschreitende Operationen'],
    keyActors: ['JNIM', 'ISWAP', 'Sahel-Juntas', 'MINUSMA (abgezogen)', 'Wagner/Africa Corps'],
    implications: {
      'jihadist': 'Dschihadistische Expansion in den Sahel bedroht die Stabilität der gesamten westafrikanischen Küstenregion.',
      'Liptako': 'Das Dreiländereck Liptako-Gourma (Mali-Burkina-Niger) ist das Gravitationszentrum der Gewalt.',
    },
  },
  'sudan-war': {
    background: 'Der Bürgerkrieg im Sudan (seit April 2023) zwischen den regulären Streitkräften (SAF/al-Burhan) und den Rapid Support Forces (RSF/Hemedti) hat die größte Vertreibungskrise weltweit ausgelöst (>10 Mio. Menschen). Darfur erlebt eine Wiederholung der Gräueltaten von 2003.',
    escalationFactors: ['Ausländische Waffenlieferungen (UAE an RSF)', 'Ethnische Säuberungen in Darfur', 'Hungersnot'],
    deescalationFactors: ['Jeddah-Verhandlungen (Saudi/US-vermittelt)', 'AU-Vermittlung', 'Waffenembargo'],
    keyActors: ['SAF (al-Burhan)', 'RSF (Hemedti)', 'UAE', 'Ägypten', 'Saudi-Arabien'],
    implications: {
      'famine': 'Der Sudan steht am Rand einer Hungersnot — mit potentiell Hunderttausenden Todesopfern.',
      'Darfur': 'Die Gräueltaten in Darfur könnten als Völkermord eingestuft werden.',
      'displacement': 'Fluchtbewegungen destabilisieren Nachbarstaaten (Tschad, Südsudan, Ägypten).',
    },
  },
};

/**
 * Generate a deep contextual assessment for a conflict axis.
 * Purely rule-based — matches article keywords against context database.
 */
export function assessConflictAxis(axis: ConflictAxis): AxisAssessment {
  const articles = axis.articles;
  const threat = assessThreat(articles);
  const ctx = AXIS_CONTEXT[axis.id];

  // Situation text
  let situationText = '';
  if (!ctx) {
    situationText = `${axis.name}: ${articles.length} Meldungen erfasst. Intensität: ${axis.intensity > 70 ? 'HOCH' : axis.intensity > 40 ? 'MITTEL' : 'NIEDRIG'}.`;
  } else {
    const parts: string[] = [];
    parts.push(`${axis.name}: ${articles.length} Meldungen im Berichtszeitraum.`);

    if (threat.critCount > 0) {
      parts.push(`Davon ${threat.critCount} kritische Ereignisse aus gezielten Krisen-Abfragen.`);
    }

    // Check for escalation factors
    const lower = articles.map(a => a.title.toLowerCase()).join(' ');
    const activeEscalation = ctx.escalationFactors.filter(f => lower.includes(f.toLowerCase().split(' ')[0]));
    if (activeEscalation.length > 0) {
      parts.push(`Aktive Eskalationsindikatoren: ${activeEscalation.slice(0, 3).join('; ')}.`);
    }

    const activeDeescalation = ctx.deescalationFactors.filter(f => lower.includes(f.toLowerCase().split(' ')[0]));
    if (activeDeescalation.length > 0) {
      parts.push(`Deeskalationssignale: ${activeDeescalation.slice(0, 2).join('; ')}.`);
    }

    situationText = parts.join(' ');
  }

  // Context text (background)
  const contextText = ctx?.background ?? axis.description;

  // Implication text — match keywords in article titles against implication database
  let implicationText = '';
  if (ctx) {
    const lower = articles.map(a => a.title.toLowerCase()).join(' ');
    const matchedImplications: string[] = [];
    for (const [kw, impl] of Object.entries(ctx.implications)) {
      if (lower.includes(kw.toLowerCase())) {
        matchedImplications.push(impl);
      }
    }
    if (matchedImplications.length > 0) {
      implicationText = matchedImplications.slice(0, 3).join(' ');
    } else {
      implicationText = `Die Meldungslage auf der Achse ${axis.name} erfordert ${axis.intensity > 60 ? 'erhöhte Aufmerksamkeit' : 'routinemäßiges Monitoring'}. Keine spezifischen Eskalationsindikatoren erkannt.`;
    }
  } else {
    implicationText = `Für diese Konfliktachse liegen keine vertieften Einordnungsdaten vor. Basismonitoring empfohlen.`;
  }

  // Key indicators
  const keyIndicators: string[] = [];
  const sources = new Set(articles.map(a => a.source));
  keyIndicators.push(`${sources.size} unterschiedliche Quellen — ${sources.size >= 5 ? 'breite internationale Beachtung' : 'begrenzte Medienabdeckung'}`);
  if (threat.critCount > 0) keyIndicators.push(`${threat.critCount} kritische Meldungen aus Krisen-Abfragen`);
  const recent24h = articles.filter(a => Date.now() - new Date(a.publishedAt).getTime() < 24 * 60 * 60 * 1000).length;
  if (recent24h > 0) keyIndicators.push(`${recent24h} Meldung(en) in den letzten 24h — ${recent24h >= 5 ? 'aktive Lage' : 'moderate Aktivität'}`);
  if (ctx?.keyActors) keyIndicators.push(`Schlüsselakteure: ${ctx.keyActors.slice(0, 4).join(', ')}`);

  // Recent highlight — pick the most significant recent article
  const recentHighlight = articles.length > 0
    ? `Neueste Meldung: "${articles[0].title}" (${articles[0].source}, ${timeAgoShort(articles[0].publishedAt)})`
    : 'Keine aktuellen Meldungen.';

  return {
    axisId: axis.id,
    threatLevel: threat.level,
    score: threat.score,
    situationText,
    contextText,
    implicationText,
    keyIndicators,
    recentHighlight,
  };
}

function timeAgoShort(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `vor ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours}h`;
  return `vor ${Math.floor(hours / 24)}d`;
}
