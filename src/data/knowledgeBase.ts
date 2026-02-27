// ═══════════════════════════════════════════════════════════════════
// AfKnow / MEKnow — Knowledge Base Data
// Comprehensive conflict, actor, and historical context entries
// ═══════════════════════════════════════════════════════════════════

export type KBCategory = 'conflict' | 'actor' | 'region' | 'historical' | 'organization' | 'infrastructure' | 'humanitarian';
export type KBStatus = 'active' | 'frozen' | 'resolved' | 'escalating' | 'historical';
export type KBSeverity = 1 | 2 | 3 | 4 | 5;

export interface KBSource {
  id: string;
  label: string;
  url: string;
  type: 'academic' | 'news' | 'think-tank' | 'government' | 'ngo' | 'un' | 'database' | 'primary';
  accessDate: string;
  reliability: 'high' | 'medium' | 'low';
  note?: string;
}

export interface KBCrossLink {
  targetId: string;
  label: string;
  relationship: 'related' | 'cause' | 'effect' | 'actor-in' | 'part-of' | 'successor' | 'predecessor' | 'opposed' | 'allied';
}

export interface KBTimelineEvent {
  date: string;
  title: string;
  description: string;
  sourceId?: string;
}

export interface KBImage {
  id: string;
  url: string;
  caption: string;
  credit: string;
}

export interface KBEntry {
  id: string;
  region: 'africa' | 'mideast' | 'both';
  category: KBCategory;
  title: string;
  subtitle: string;
  summary: string;
  content: string; // Rich markdown content
  status: KBStatus;
  severity: KBSeverity;
  tags: string[];
  countryIds: string[];
  sources: KBSource[];
  crossLinks: KBCrossLink[];
  timeline: KBTimelineEvent[];
  images: KBImage[];
  keyFacts: { label: string; value: string }[];
  parties?: string[];
  startYear?: number;
  endYear?: number;
  casualties?: string;
  displaced?: string;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════
// AFRICA — Knowledge Base Entries
// ═══════════════════════════════════════════════════════════════════

const africaEntries: KBEntry[] = [
  // ─── SAHEL CONFLICTS ───
  {
    id: 'af-sahel-crisis',
    region: 'africa',
    category: 'conflict',
    title: 'Sahelkrise',
    subtitle: 'Dschihadismus, Staatszerfall und Militärputsche in der Sahelzone',
    summary: 'Die Sahelzone erlebt seit 2012 eine eskalierende Sicherheitskrise, getrieben durch dschihadistische Gruppen, ethnische Konflikte, Staatsversagen und klimabedingte Ressourcenknappheit. Militärputsche in Mali (2020/2021), Burkina Faso (2022) und Niger (2023) haben die Lage weiter destabilisiert.',
    content: `## Überblick

Die Sahelkrise ist einer der komplexesten und tödlichsten Konfliktherde der Welt. Seit dem Zusammenbruch Libyens 2011 und der Tuareg-Rebellion in Mali 2012 hat sich die Instabilität über die gesamte Sahelzone ausgebreitet — von Mauretanien bis zum Tschadsee.

## Konfliktdynamiken

### 1. Dschihadistische Expansion
Gruppen wie **JNIM** (Jama'at Nusrat al-Islam wal-Muslimin) und der **Islamische Staat in der Sahara (ISGS/ISSP)** kontrollieren weite Gebiete. Sie nutzen lokale Grievances, ethnische Spannungen und schwache Staatlichkeit aus.

### 2. Ethnische Konflikte
Besonders die Spannungen zwischen Fulani-Hirten und sesshaften Bauerngemeinschaften (Dogon, Bambara, Mossi) sind eskaliert. Dschihadisten instrumentalisieren diese Konflikte systematisch.

### 3. Staatszerfall und Militärcoups
Die Frustration über korrupte Eliten und westliche Militärpräsenz führte zu einer Welle von Militärputschen:
- **Mali:** August 2020 und Mai 2021 (Assimi Goïta)
- **Burkina Faso:** Januar und September 2022 (Ibrahim Traoré)
- **Niger:** Juli 2023 (Abdourahamane Tchiani)
- **Gabun:** August 2023 (Brice Oligui Nguema)

### 4. Externe Akteure
- **Frankreich:** Operation Barkhane (2014–2022), Abzug nach Anti-Frankreich-Stimmung
- **Russland/Afrika-Korps:** Wagner-Söldner (jetzt Afrika-Korps) in Mali, Burkina Faso, Niger
- **USA:** AFRICOM-Operationen, Rückzug aus Niger 2024
- **Türkei:** Wachsende Militärkooperationen
- **China:** Wirtschaftliche Durchdringung

## Humanitäre Lage
- Über **40 Millionen** Menschen von Ernährungsunsicherheit betroffen
- **4,5 Millionen** Binnenvertriebene allein in Burkina Faso, Mali und Niger
- Zusammenbruch des Bildungswesens: >10.000 Schulen geschlossen

## Geopolitische Dimension
Die Sahel-Staaten Mali, Burkina Faso und Niger haben 2023 die **Allianz der Sahelstaaten (AES)** gegründet und sind aus der ECOWAS ausgetreten — ein tektonischer Bruch in der westafrikanischen Architektur.`,
    status: 'escalating',
    severity: 5,
    tags: ['Sahel', 'Dschihadismus', 'Militärputsch', 'Wagner', 'ECOWAS', 'Frankreich', 'Russland', 'Ernährungskrise'],
    countryIds: ['ML', 'BF', 'NE', 'TD', 'MR', 'SN', 'NG'],
    parties: ['JNIM', 'ISGS', 'Mali (Junta)', 'Burkina Faso (Junta)', 'Niger (Junta)', 'Wagner/Afrika-Korps', 'Frankreich', 'ECOWAS'],
    startYear: 2012,
    casualties: '>50.000 Tote seit 2012',
    displaced: '4,5 Mio. Binnenvertriebene',
    sources: [
      { id: 's1', label: 'ACLED – Armed Conflict Location & Event Data', url: 'https://acleddata.com/dashboard/#/dashboard', type: 'database', accessDate: '2025-01', reliability: 'high' },
      { id: 's2', label: 'International Crisis Group – Sahel', url: 'https://www.crisisgroup.org/africa/sahel', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
      { id: 's3', label: 'UNHCR – Sahel Crisis', url: 'https://www.unhcr.org/emergencies/sahel-crisis', type: 'un', accessDate: '2025-01', reliability: 'high' },
      { id: 's4', label: 'Africa Center for Strategic Studies', url: 'https://africacenter.org/spotlight/sahel-security-trends/', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
      { id: 's5', label: 'SWP – Stiftung Wissenschaft und Politik', url: 'https://www.swp-berlin.org/themen/sahel', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-jnim', label: 'JNIM (Hauptakteur)', relationship: 'actor-in' },
      { targetId: 'af-isgs', label: 'ISGS (Hauptakteur)', relationship: 'actor-in' },
      { targetId: 'af-wagner', label: 'Wagner/Afrika-Korps', relationship: 'actor-in' },
      { targetId: 'af-mali-crisis', label: 'Mali-Krise', relationship: 'part-of' },
      { targetId: 'af-burkina-crisis', label: 'Burkina Faso Krise', relationship: 'part-of' },
      { targetId: 'af-libya-fallout', label: 'Libyen-Krise (Ursache)', relationship: 'cause' },
      { targetId: 'af-lake-chad', label: 'Tschadsee-Krise', relationship: 'related' },
      { targetId: 'af-ecowas', label: 'ECOWAS', relationship: 'related' },
      { targetId: 'af-aes', label: 'Allianz der Sahelstaaten', relationship: 'effect' },
    ],
    timeline: [
      { date: '2011-10', title: 'Fall Gaddafis', description: 'Libyens Zusammenbruch setzt Waffen und Kämpfer frei, die in die Sahelzone strömen.' },
      { date: '2012-01', title: 'Tuareg-Rebellion in Nord-Mali', description: 'MNLA beginnt Offensive, dschihadistische Gruppen kapern die Rebellion.' },
      { date: '2012-03', title: 'Putsch in Mali', description: 'Hauptmann Amadou Sanogo stürzt Präsident ATT.' },
      { date: '2013-01', title: 'Opération Serval', description: 'Frankreich interveniert militärisch in Mali gegen Dschihadisten.' },
      { date: '2014-08', title: 'Opération Barkhane', description: 'Frankreich weitet Einsatz auf gesamte Sahelzone aus.' },
      { date: '2017-03', title: 'Gründung JNIM', description: 'Iyad Ag Ghaly vereint mehrere Dschihadisten-Gruppen unter AQIM-Dach.' },
      { date: '2020-08', title: 'Putsch in Mali (1)', description: 'Militär stürzt Präsident IBK nach Massenprotesten.' },
      { date: '2021-05', title: 'Putsch in Mali (2)', description: 'Assimi Goïta übernimmt vollständig die Macht.' },
      { date: '2022-01', title: 'Putsch in Burkina Faso (1)', description: 'Paul-Henri Sandaogo Damiba stürzt Roch Kaboré.' },
      { date: '2022-02', title: 'Barkhane-Abzug aus Mali', description: 'Frankreich beginnt Abzug, Wagner rückt ein.' },
      { date: '2022-09', title: 'Putsch in Burkina Faso (2)', description: 'Ibrahim Traoré stürzt Damiba.' },
      { date: '2023-07', title: 'Putsch in Niger', description: 'Generäle stürzen Präsident Bazoum, ECOWAS droht mit Intervention.' },
      { date: '2023-09', title: 'Gründung AES', description: 'Mali, Burkina Faso und Niger gründen Allianz der Sahelstaaten.' },
      { date: '2024-01', title: 'AES-Austritt aus ECOWAS', description: 'Die drei Sahelstaaten verlassen die westafrikanische Wirtschaftsgemeinschaft.' },
      { date: '2024-04', title: 'US-Abzug aus Niger', description: 'Pentagon kündigt Rückzug der Truppen aus Air Base 201 an.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Betroffene Bevölkerung', value: '~80 Mio.' },
      { label: 'Bewaffnete Gruppen', value: '>20' },
      { label: 'Tote seit 2012', value: '>50.000' },
      { label: 'Binnenvertriebene', value: '~4,5 Mio.' },
      { label: 'Geschlossene Schulen', value: '>10.000' },
      { label: 'Betroffene Länder', value: '7+' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── JNIM ───
  {
    id: 'af-jnim',
    region: 'africa',
    category: 'actor',
    title: 'JNIM — Jama\'at Nusrat al-Islam wal-Muslimin',
    subtitle: 'Al-Qaida-nahe Dachorganisation in der Sahelzone',
    summary: 'JNIM ist die dominierende dschihadistische Dachorganisation in der Sahelzone, gegründet 2017 unter Iyad Ag Ghaly. Sie vereint mehrere Al-Qaida-affiliierte Gruppen und kontrolliert weite Teile Zentralmalis, Nord-Burkina Fasos und Westniger.',
    content: `## Struktur und Führung

**JNIM** (Jamāʿat Nuṣrat al-Islām wal-Muslimīn / Gruppe zur Unterstützung des Islam und der Muslime) wurde am **1. März 2017** gegründet als Zusammenschluss von:
- **AQIM** (Al-Qaida im Islamischen Maghreb)
- **Ansar Dine** (Anhänger des Glaubens)
- **Katiba Macina** (Amadou Koufa)
- **Al-Mourabitoun** (ehem. Mokhtar Belmokhtar)

**Anführer:** Iyad Ag Ghaly (Tuareg aus Kidal, ehem. Rebellenführer)

## Operationsgebiet
JNIM operiert primär in:
- **Zentralmali** (Mopti-Region, Liptako-Gourma-Dreieck)
- **Nord-Burkina Faso** (Sahel, Centre-Nord, Est)
- **Westniger** (Tillabéri, Tahoua)
- Zunehmend in **Nordbenin**, **Nordtogo** und **Nord-Ghana**

## Strategie
JNIM verfolgt eine duale Strategie:
1. **Governance-Ansatz:** Scharia-Gerichtsbarkeit, Schutzversprechen, Schlichtung lokaler Konflikte
2. **Militärische Operationen:** Guerilla-Taktiken, IEDs, Überfälle auf Militärposten
3. **Ethnische Instrumentalisierung:** Rekrutierung unter marginalisierten Fulani-Gemeinschaften

## Stärke und Einnahmen
- Geschätzte **5.000–10.000 Kämpfer**
- Einnahmen durch Zakat-Steuern, Viehhandel, Gold-Schmuggel, Entführungen
- Kontrolle über informelle Goldminen in Mali und Burkina Faso`,
    status: 'active',
    severity: 5,
    tags: ['Al-Qaida', 'Terrorismus', 'Sahel', 'AQIM', 'Iyad Ag Ghaly', 'Fulani', 'Dschihadismus'],
    countryIds: ['ML', 'BF', 'NE', 'BJ', 'TG', 'GH'],
    parties: ['Iyad Ag Ghaly', 'Amadou Koufa', 'AQIM', 'Ansar Dine'],
    startYear: 2017,
    sources: [
      { id: 's1', label: 'Stanford CISAC – JNIM Profile', url: 'https://cisac.fsi.stanford.edu/mappingmilitants/profiles/jnim', type: 'academic', accessDate: '2025-01', reliability: 'high' },
      { id: 's2', label: 'International Crisis Group – JNIM', url: 'https://www.crisisgroup.org/africa/sahel/mali/jnim-negotiations', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
      { id: 's3', label: 'ACLED Data on JNIM Activity', url: 'https://acleddata.com', type: 'database', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise (Kontext)', relationship: 'part-of' },
      { targetId: 'af-isgs', label: 'ISGS (Rivalität)', relationship: 'opposed' },
      { targetId: 'af-mali-crisis', label: 'Mali-Krise', relationship: 'actor-in' },
      { targetId: 'af-burkina-crisis', label: 'Burkina Faso Krise', relationship: 'actor-in' },
      { targetId: 'af-katiba-macina', label: 'Katiba Macina', relationship: 'part-of' },
    ],
    timeline: [
      { date: '2017-03', title: 'Gründung JNIM', description: 'Offizielle Gründung als Dachorganisation durch Iyad Ag Ghaly.' },
      { date: '2017-06', title: 'Angriff auf Bamako-Hotel', description: 'JNIM bekennt sich zu mehreren Anschlägen in Malis Hauptstadt.' },
      { date: '2019-01', title: 'Expansion nach Burkina Faso', description: 'Massive Ausweitung der Operationen in Burkina Fasos Sahel-Region.' },
      { date: '2020', title: 'Friedensverhandlungen (Gerüchte)', description: 'Berichte über indirekte Kontakte zwischen JNIM und malischer Regierung.' },
      { date: '2022', title: 'Expansion nach Benin/Togo', description: 'Erste Angriffe südlich der Sahelzone, in nordbeninischen und -togolesischen Grenzgebieten.' },
      { date: '2024', title: 'Kontrolle über Goldminen', description: 'JNIM kontrolliert informelle Goldminen und erhebt Steuern in weiten Teilen der Sahelzone.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Gründung', value: '1. März 2017' },
      { label: 'Anführer', value: 'Iyad Ag Ghaly' },
      { label: 'Stärke', value: '5.000–10.000' },
      { label: 'Affiliiert mit', value: 'Al-Qaida / AQIM' },
      { label: 'Hauptgebiet', value: 'Liptako-Gourma' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── ISGS ───
  {
    id: 'af-isgs',
    region: 'africa',
    category: 'actor',
    title: 'ISGS/ISSP — Islamischer Staat Sahel',
    subtitle: 'IS-Provinz in der Sahelzone',
    summary: 'Der Islamische Staat in der Sahelprovinz (ehem. ISGS) ist die IS-Filiale in der Sahelzone. Unter Adnan Abu Walid al-Sahraoui und seinen Nachfolgern wurde die Gruppe zur zweitstärksten dschihadistischen Kraft der Region.',
    content: `## Struktur

**ISGS** (Islamic State in the Greater Sahara) wurde 2015 von **Adnan Abu Walid al-Sahraoui** gegründet, als er sich von Al-Mourabitoun löste und dem IS die Treue schwor. 2022 wurde die Gruppe in **ISSP** (Islamic State Sahel Province) umbenannt.

## Operationsgebiet
- **Liptako-Gourma-Dreieck** (Grenzregion Mali-Niger-Burkina Faso)
- **Ménaka-Region** (Nordost-Mali)
- **Tillabéri** (Westniger)
- Zunehmend: **Tschadsee-Region**

## Taktik
- Brutalere Vorgehensweise als JNIM
- Massenexekutionen, gezielte Tötungen von Zivilisten
- Direkte Konkurrenz zu JNIM mit offenen Kämpfen seit 2020

## Bekannte Anschläge
- **2017:** Tongo Tongo Hinterhalt (Niger) — 4 US-Soldaten getötet
- **2020:** Massaker von Toumour (Niger) — >100 Tote
- **2021:** Solhan-Massaker (Burkina Faso) — >160 Tote`,
    status: 'active',
    severity: 5,
    tags: ['IS', 'Islamischer Staat', 'Sahel', 'Terrorismus', 'ISGS', 'Liptako-Gourma'],
    countryIds: ['ML', 'NE', 'BF', 'TD'],
    startYear: 2015,
    sources: [
      { id: 's1', label: 'Stanford CISAC – ISGS Profile', url: 'https://cisac.fsi.stanford.edu/mappingmilitants/profiles/isgs', type: 'academic', accessDate: '2025-01', reliability: 'high' },
      { id: 's2', label: 'UN Security Council – ISGS Report', url: 'https://www.un.org/securitycouncil/sanctions/1267', type: 'un', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise', relationship: 'part-of' },
      { targetId: 'af-jnim', label: 'JNIM (Rivalität)', relationship: 'opposed' },
      { targetId: 'af-lake-chad', label: 'Tschadsee-Krise', relationship: 'related' },
    ],
    timeline: [
      { date: '2015-05', title: 'Gründung ISGS', description: 'Al-Sahraoui schwört dem IS Treue.' },
      { date: '2017-10', title: 'Tongo Tongo', description: 'Hinterhalt auf US/Niger-Patrouille, 4 US-Soldaten getötet.' },
      { date: '2020-01', title: 'ISGS als IS-Provinz anerkannt', description: 'IS-Zentrale akzeptiert ISGS offiziell.' },
      { date: '2021-08', title: 'Tod al-Sahraouris', description: 'Frankreich tötet ISGS-Führer bei Drohnenangriff.' },
      { date: '2022', title: 'Umbenennung in ISSP', description: 'Islamische Staat Sahelprovinz.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Gründung', value: '2015' },
      { label: 'Affiliiert mit', value: 'Islamischer Staat' },
      { label: 'Stärke', value: '3.000–5.000' },
      { label: 'Hauptgebiet', value: 'Liptako-Gourma' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── WAGNER / AFRIKA-KORPS ───
  {
    id: 'af-wagner',
    region: 'both',
    category: 'actor',
    title: 'Wagner-Gruppe / Afrika-Korps',
    subtitle: 'Russische Söldner und staatliche Militärkontraktoren in Afrika',
    summary: 'Die Wagner-Gruppe (nach Prigozhins Tod 2023 in "Afrika-Korps" unter GRU-Kontrolle umstrukturiert) ist in mehreren afrikanischen Ländern aktiv und hat die westliche Militärpräsenz in der Sahelzone weitgehend ersetzt.',
    content: `## Hintergrund

Die **Wagner-Gruppe** begann ihre Afrika-Expansion ab 2017/18 als private Militärfirma unter der Leitung von **Jewgeni Prigozhin**. Nach dem gescheiterten Putschversuch in Russland (Juni 2023) und Prigozhins Tod (August 2023) wurde die Operation unter der Bezeichnung **Afrika-Korps** direkt dem russischen Militärgeheimdienst **GRU** unterstellt.

## Präsenz in Afrika

| Land | Seit | Stärke | Rolle |
|------|------|--------|-------|
| **Mali** | 2021 | ~1.500 | Kampfoperationen, Junta-Sicherung |
| **Burkina Faso** | 2023 | ~300 | Junta-Schutz, Ausbildung |
| **Niger** | 2024 | ~100+ | Militärausbildung |
| **Libyen** | 2019 | ~1.200 | Unterstützung Haftar/LNA |
| **Zentralafrikanische Rep.** | 2018 | ~2.000 | Regierungssicherung, Minenkonzessionen |
| **Sudan** | 2017 | ~500 | Goldminen, RSF-Unterstützung |
| **Mosambik** | 2019 | Abgezogen | Gescheiterter Einsatz gegen Insurgency |

## Geschäftsmodell
- **Sicherheit gegen Ressourcen:** Minenkonzessionen (Gold, Diamanten) als Bezahlung
- **Politischer Einfluss:** Desinformationskampagnen, Junta-Stabilisierung
- **Verdrängung westlicher Präsenz:** Narrative der "Souveränität" und Anti-Kolonialismus

## Menschenrechtsverletzungen
Massive dokumentierte Vorwürfe:
- Massaker in Moura (Mali, 2022): >300 Zivilisten getötet
- Willkürliche Tötungen in der ZAR
- Folter und außergerichtliche Hinrichtungen`,
    status: 'active',
    severity: 4,
    tags: ['Russland', 'Wagner', 'Afrika-Korps', 'PMC', 'Söldner', 'GRU', 'Prigozhin'],
    countryIds: ['ML', 'BF', 'NE', 'LY', 'CF', 'SD', 'MZ'],
    startYear: 2017,
    sources: [
      { id: 's1', label: 'ACSS – Russia\'s Africa Corps', url: 'https://africacenter.org/spotlight/russia-africa-corps/', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
      { id: 's2', label: 'BBC – Wagner in Africa', url: 'https://www.bbc.com/news/world-africa-wagner', type: 'news', accessDate: '2025-01', reliability: 'high' },
      { id: 's3', label: 'UN Human Rights – Moura Massacre', url: 'https://www.ohchr.org/en/press-releases/2023/05/mali-report-moura-massacre', type: 'un', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise', relationship: 'actor-in' },
      { targetId: 'af-mali-crisis', label: 'Mali-Krise', relationship: 'actor-in' },
      { targetId: 'af-libya-conflict', label: 'Libyen-Konflikt', relationship: 'actor-in' },
      { targetId: 'af-sudan-war', label: 'Sudan-Krieg', relationship: 'related' },
      { targetId: 'af-car-crisis', label: 'ZAR-Krise', relationship: 'actor-in' },
    ],
    timeline: [
      { date: '2017', title: 'Erste Kontakte in Sudan', description: 'Wagner beginnt Goldabbau-Kooperation mit Bashir-Regime.' },
      { date: '2018', title: 'Einsatz in der ZAR', description: 'Entsendung nach Bangui zur Regierungssicherung.' },
      { date: '2019', title: 'Einsatz in Libyen', description: 'Unterstützung von General Haftar gegen GNA.' },
      { date: '2021-12', title: 'Ankunft in Mali', description: 'Erste Wagner-Einheiten in Bamako, Frankreich protestiert.' },
      { date: '2022-03', title: 'Moura-Massaker', description: 'Malische Armee und Wagner töten >300 Zivilisten.' },
      { date: '2023-06', title: 'Prigozhin-Meuterei', description: 'Gescheiterter Putschversuch in Russland.' },
      { date: '2023-08', title: 'Tod Prigozhins', description: 'Flugzeugabsturz, Wagner wird zum Afrika-Korps unter GRU.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Aktiv in', value: '7+ Ländern' },
      { label: 'Gesamtstärke Afrika', value: '~5.000–7.000' },
      { label: 'Kontrolle', value: 'GRU (seit 2023)' },
      { label: 'Geschäftsmodell', value: 'Sicherheit ↔ Ressourcen' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── SUDAN WAR ───
  {
    id: 'af-sudan-war',
    region: 'africa',
    category: 'conflict',
    title: 'Sudanesischer Bürgerkrieg (2023–)',
    subtitle: 'Machtkampf zwischen SAF und RSF mit katastrophalen humanitären Folgen',
    summary: 'Seit April 2023 kämpfen die sudanesischen Streitkräfte (SAF) unter General Burhan gegen die Rapid Support Forces (RSF) unter Hemedti in einem der verheerendsten Konflikte Afrikas. Millionen sind auf der Flucht, es gibt Berichte über ethnische Säuberungen in Darfur.',
    content: `## Hintergrund

Der Sudan erlebte nach dem Sturz Omar al-Bashirs (2019) eine kurze demokratische Übergangsphase, die 2021 durch einen Militärputsch endete. Die Spannungen zwischen den beiden Hauptmachthabern — **General Abdel Fattah al-Burhan** (SAF) und **Mohamed Hamdan Dagalo "Hemedti"** (RSF) — eskalierten im April 2023 zum offenen Krieg.

## Konfliktparteien

### SAF (Sudanesische Streitkräfte)
- Unter General **al-Burhan**
- Verfügt über Luftwaffe und schwere Waffen
- Unterstützt durch: Ägypten, Iran, ehemalige Islamisten

### RSF (Rapid Support Forces)
- Unter **Hemedti** (Mohamed Hamdan Dagalo)
- Hervorgegangen aus den Janjaweed-Milizen
- Unterstützt durch: VAE, Wagner/Russland (Gold), tschadische Söldner

## Humanitäre Katastrophe
- **>12 Millionen** Vertriebene (größte Flüchtlingskrise weltweit)
- **>15.000** bestätigte Tote (Dunkelziffer deutlich höher)
- Ethnische Säuberungen in **West-Darfur** durch RSF/arabische Milizen
- Hungersnot in Kordofan und Darfur (IPC Phase 5)
- Zusammenbruch des Gesundheitssystems

## Geopolitische Dimension
Der Konflikt hat massive regionale Auswirkungen:
- **Tschad:** >1 Mio. sudanesische Flüchtlinge
- **Ägypten:** >500.000 Flüchtlinge
- **Südsudan:** Rückkehr von Flüchtlingen destabilisiert
- **Äthiopien:** Waffenschmuggel über Grenzregion
- **VAE vs. Ägypten:** Proxy-Rivalität im Sudan`,
    status: 'escalating',
    severity: 5,
    tags: ['Sudan', 'Bürgerkrieg', 'RSF', 'SAF', 'Darfur', 'Hemedti', 'Burhan', 'Hungersnot'],
    countryIds: ['SD', 'SS', 'TD', 'EG', 'ET', 'ER'],
    parties: ['SAF (Burhan)', 'RSF (Hemedti)', 'Ägypten', 'VAE', 'Iran'],
    startYear: 2023,
    casualties: '>15.000 bestätigt, Dunkelziffer >>50.000',
    displaced: '>12 Mio.',
    sources: [
      { id: 's1', label: 'OCHA – Sudan Crisis', url: 'https://www.unocha.org/sudan', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'ICG – Sudan\'s Catastrophic War', url: 'https://www.crisisgroup.org/africa/horn-africa/sudan', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's3', label: 'Human Rights Watch – Darfur Atrocities', url: 'https://www.hrw.org/tag/sudan', type: 'ngo', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-wagner', label: 'Wagner (RSF-Verbindung)', relationship: 'actor-in' },
      { targetId: 'af-darfur-history', label: 'Darfur-Konflikt (historisch)', relationship: 'predecessor' },
    ],
    timeline: [
      { date: '2019-04', title: 'Sturz Bashirs', description: 'Militär entmachtet Omar al-Bashir nach Massenprotesten.' },
      { date: '2019-08', title: 'Verfassungsdeklaration', description: 'Abkommen über zivil-militärischen Übergangsrat.' },
      { date: '2021-10', title: 'Militärputsch', description: 'Burhan und Hemedti putschen gegen zivile Regierung.' },
      { date: '2023-04-15', title: 'Kriegsausbruch', description: 'Gefechte in Khartum, RSF besetzt Teile der Hauptstadt.' },
      { date: '2023-06', title: 'Massaker in El Geneina', description: 'RSF und arabische Milizen verüben ethnische Säuberungen in West-Darfur.' },
      { date: '2023-11', title: 'Hungersnot-Warnung', description: 'UN warnt vor Hungersnot in mehreren Regionen.' },
      { date: '2024', title: 'SAF-Gegenoffensive', description: 'SAF gewinnt Teile Khartums zurück, Konflikt weitet sich aus.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Kriegsbeginn', value: '15. April 2023' },
      { label: 'Vertriebene', value: '>12 Mio.' },
      { label: 'Hungergefährdete', value: '>25 Mio.' },
      { label: 'Zerstörte Gesundheitseinrichtungen', value: '>70%' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── DRC CONFLICT ───
  {
    id: 'af-drc-east',
    region: 'africa',
    category: 'conflict',
    title: 'Ostkongo-Konflikt',
    subtitle: 'M23, ADF und bewaffnete Gruppen in Nord/Süd-Kivu und Ituri',
    summary: 'Der Osten der DR Kongo leidet seit über 25 Jahren unter bewaffneten Konflikten mit über 120 bewaffneten Gruppen. Die M23-Rebellion (von Ruanda unterstützt) und die IS-affiliierten ADF sind die prominentesten Akteure.',
    content: `## Überblick

Der Ostkongo-Konflikt ist einer der am längsten andauernden und komplexesten Konflikte der Welt. Die Provinzen **Nord-Kivu**, **Süd-Kivu** und **Ituri** sind von massiver Gewalt geprägt, mit über **120 aktiven bewaffneten Gruppen**.

## Hauptkonflikte

### M23-Rebellion
Die **M23** (Mouvement du 23 Mars) ist eine vorwiegend tutsi-kongolesische Miliz, die von **Ruanda** militärisch unterstützt wird. Seit 2022 kontrolliert sie wieder große Teile von Nord-Kivu, einschließlich strategisch wichtiger Städte.

### ADF (Allied Democratic Forces)
Die **ADF** ist eine ugandisch-stämmige Rebellengruppe, die sich dem IS angeschlossen hat (ISCAP). Sie verübt Massaker an Zivilisten in Nord-Kivu und Ituri.

### CODECO und andere Milizen
In Ituri kämpft die **CODECO**-Miliz (Lendu-Ethnie) gegen Hema-Gemeinschaften. Daneben operieren Mai-Mai-Gruppen, FDLR (ruandische Hutu-Miliz) und zahlreiche weitere Fraktionen.

## Ruandas Rolle
Die **UN-Expertengruppe** hat wiederholt dokumentiert, dass Ruanda die M23 mit Truppen, Waffen und Logistik unterstützt. Ruanda bestreitet dies, die Belege sind jedoch überwältigend.

## Ressourcenfluch
Der Ostkongo ist extrem reich an **Coltan, Zinn, Gold und Kobalt**. Die Kontrolle über Minen ist ein zentraler Konflitreiber — bewaffnete Gruppen und staatliche Akteure finanzieren sich durch illegalen Bergbau.`,
    status: 'escalating',
    severity: 5,
    tags: ['DR Kongo', 'M23', 'ADF', 'Ruanda', 'Kivu', 'Coltan', 'Konfliktrohstoffe'],
    countryIds: ['CD', 'RW', 'UG', 'BI'],
    parties: ['M23', 'ADF/ISCAP', 'CODECO', 'FDLR', 'FARDC', 'Ruanda', 'MONUSCO'],
    startYear: 1996,
    casualties: '>6 Mio. seit 1996 (direkt und indirekt)',
    displaced: '>7 Mio. Binnenvertriebene',
    sources: [
      { id: 's1', label: 'UN Group of Experts on DRC', url: 'https://www.un.org/securitycouncil/sanctions/1533/panel-of-experts', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'Kivu Security Tracker', url: 'https://kivusecurity.org', type: 'database', accessDate: '2025-02', reliability: 'high' },
      { id: 's3', label: 'ICG – DR Congo', url: 'https://www.crisisgroup.org/africa/great-lakes/democratic-republic-congo', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-great-lakes-history', label: 'Große-Seen-Region (historisch)', relationship: 'predecessor' },
    ],
    timeline: [
      { date: '1996', title: 'Erster Kongokrieg', description: 'Kabila-Rebellion stürzt Mobutu mit Ruandas/Ugandas Hilfe.' },
      { date: '1998', title: 'Zweiter Kongokrieg', description: '"Afrikas Weltkrieg" mit 9 beteiligten Staaten.' },
      { date: '2012', title: 'M23-Rebellion (1. Phase)', description: 'M23 erobert Goma, wird 2013 besiegt.' },
      { date: '2021', title: 'ADF schließt sich IS an', description: 'ISCAP (IS Central Africa Province) formalisiert.' },
      { date: '2022-10', title: 'M23-Comeback', description: 'M23 erobert erneut weite Teile Nord-Kivus.' },
      { date: '2024', title: 'Eskalation und MONUSCO-Abzug', description: 'UN-Mission beginnt Abzug, M23 kontrolliert strategische Gebiete.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Bewaffnete Gruppen', value: '>120' },
      { label: 'Binnenvertriebene', value: '>7 Mio.' },
      { label: 'Betroffene Provinzen', value: 'Nord-Kivu, Süd-Kivu, Ituri' },
      { label: 'UN-Mission', value: 'MONUSCO (Abzug begonnen)' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── ECOWAS ───
  {
    id: 'af-ecowas',
    region: 'africa',
    category: 'organization',
    title: 'ECOWAS — Westafrikanische Wirtschaftsgemeinschaft',
    subtitle: 'Regionale Organisation in Westafrika unter Druck',
    summary: 'Die ECOWAS, 1975 gegründet, war lange Vorbild für regionale Integration in Afrika. Der Austritt von Mali, Burkina Faso und Niger (2024) und die gescheiterten Interventionsdrohungen haben die Organisation in eine existenzielle Krise gestürzt.',
    content: `## Überblick

Die **ECOWAS** (Economic Community of West African States) wurde 1975 gegründet und umfasst(e) 15 Mitgliedstaaten. Neben wirtschaftlicher Integration hat ECOWAS eine wichtige sicherheitspolitische Rolle — mit einem eigenen Interventionsmechanismus (ECOMOG/ESF).

## Krise seit 2020
Die Militärputsche in Guinea (2021), Mali (2020/21), Burkina Faso (2022) und Niger (2023) haben ECOWAS vor massive Herausforderungen gestellt. Die Organisation drohte Niger mit militärischer Intervention, konnte diese jedoch nicht durchsetzen.

## Allianz der Sahelstaaten (AES)
Mali, Burkina Faso und Niger gründeten 2023 die **AES** als Gegenblock und traten 2024 formal aus der ECOWAS aus.

## Verbleibende Herausforderungen
- Verlust von 3 Mitgliedstaaten
- Schwächung der regionalen Sicherheitsarchitektur
- Wachsender russischer Einfluss in der Sahelzone
- Nigeria als dominierender Akteur mit eigenen Problemen`,
    status: 'active',
    severity: 3,
    tags: ['ECOWAS', 'Westafrika', 'AES', 'regionale Integration', 'ECOMOG'],
    countryIds: ['NG', 'GH', 'SN', 'CI', 'ML', 'BF', 'NE', 'GN', 'GM', 'SL', 'LR', 'TG', 'BJ', 'CV', 'GW'],
    startYear: 1975,
    sources: [
      { id: 's1', label: 'ECOWAS Commission', url: 'https://ecowas.int', type: 'government', accessDate: '2025-01', reliability: 'high' },
      { id: 's2', label: 'ICG – ECOWAS Crisis', url: 'https://www.crisisgroup.org/africa/west-africa/ecowas-future', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise', relationship: 'related' },
      { targetId: 'af-aes', label: 'AES (Gegenblock)', relationship: 'opposed' },
    ],
    timeline: [
      { date: '1975-05', title: 'Gründung ECOWAS', description: 'Vertrag von Lagos.' },
      { date: '1990', title: 'ECOMOG in Liberia', description: 'Erste militärische Intervention.' },
      { date: '2023-07', title: 'Niger-Krise', description: 'ECOWAS droht mit Intervention, scheitert.' },
      { date: '2024-01', title: 'AES-Austritt', description: 'Mali, Burkina Faso, Niger verlassen ECOWAS.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Gründung', value: '1975' },
      { label: 'Mitglieder', value: '12 (von ehem. 15)' },
      { label: 'Sitz', value: 'Abuja, Nigeria' },
      { label: 'Bevölkerung', value: '~400 Mio.' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── BOKO HARAM / LAKE CHAD ───
  {
    id: 'af-lake-chad',
    region: 'africa',
    category: 'conflict',
    title: 'Tschadsee-Krise / Boko Haram',
    subtitle: 'Dschihadistischer Aufstand und humanitäre Katastrophe am Tschadsee',
    summary: 'Seit 2009 terrorisiert Boko Haram (und der abgespaltene ISWAP) die Tschadsee-Region. Der Konflikt hat über 40.000 Tote gefordert und 3,5 Millionen Menschen vertrieben.',
    content: `## Überblick

**Boko Haram** (offiziell JAS — Jama'atu Ahlis Sunna Lidda'awati wal-Jihad) begann 2002 als radikale islamische Sekte in Maiduguri (Nord-Nigeria). Nach der Tötung ihres Gründers **Mohammed Yusuf** durch nigerianische Polizei 2009 radikalisierte sich die Gruppe unter **Abubakar Shekau** zum bewaffneten Kampf.

## Spaltung
2016 spaltete sich die Gruppe in:
- **JAS/Boko Haram** (Shekau-Fraktion, 2021 Shekau durch Selbstmord bei ISWAP-Angriff getötet)
- **ISWAP** (Islamic State West Africa Province, unter Abu Musab al-Barnawi, IS-affiliiert)

## Betroffene Region
- **Nord-Ost-Nigeria:** Borno, Yobe, Adamawa
- **Tschadsee-Region:** Diffa (Niger), Extrême-Nord (Kamerun), Lac (Tschad)

## Internationaler Rahmen
Die **Multinational Joint Task Force (MNJTF)** kämpft mit Truppen aus Nigeria, Niger, Tschad, Kamerun und Benin gegen die Aufständischen.`,
    status: 'active',
    severity: 4,
    tags: ['Boko Haram', 'ISWAP', 'Nigeria', 'Tschadsee', 'Terrorismus', 'Chibok'],
    countryIds: ['NG', 'TD', 'NE', 'CM'],
    parties: ['Boko Haram/JAS', 'ISWAP', 'Nigeria (Militär)', 'MNJTF', 'Tschad', 'Kamerun'],
    startYear: 2009,
    casualties: '>40.000',
    displaced: '~3,5 Mio.',
    sources: [
      { id: 's1', label: 'ICG – Boko Haram', url: 'https://www.crisisgroup.org/africa/west-africa/nigeria/boko-haram', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
      { id: 's2', label: 'ACLED – Nigeria Conflict', url: 'https://acleddata.com/dashboard/#/dashboard', type: 'database', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise', relationship: 'related' },
      { targetId: 'af-isgs', label: 'ISGS (IS-Verbindung)', relationship: 'related' },
    ],
    timeline: [
      { date: '2002', title: 'Gründung', description: 'Mohammed Yusuf gründet die Sekte in Maiduguri.' },
      { date: '2009', title: 'Aufstand beginnt', description: 'Nach Yusufs Tod radikalisiert sich die Gruppe unter Shekau.' },
      { date: '2014-04', title: 'Chibok-Entführung', description: '276 Schulmädchen entführt, weltweite Aufmerksamkeit (#BringBackOurGirls).' },
      { date: '2015', title: 'Treueschwur an IS', description: 'Shekau schwört dem IS Treue, Umbenennung in ISWAP.' },
      { date: '2016', title: 'Spaltung', description: 'IS entmachtet Shekau, ISWAP unter al-Barnawi.' },
      { date: '2021-05', title: 'Tod Shekaus', description: 'Shekau sprengt sich bei ISWAP-Angriff in die Luft.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Beginn', value: '2009' },
      { label: 'Tote', value: '>40.000' },
      { label: 'Vertriebene', value: '~3,5 Mio.' },
      { label: 'Betroffene Staaten', value: '4' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── ETHIOPIA TIGRAY ───
  {
    id: 'af-ethiopia-tigray',
    region: 'africa',
    category: 'conflict',
    title: 'Äthiopien-Tigray-Krieg',
    subtitle: 'Bürgerkrieg in Nordäthiopien 2020–2022',
    summary: 'Der Krieg zwischen der äthiopischen Bundesregierung (mit Eritrea) und der TPLF in Tigray war einer der tödlichsten Konflikte des 21. Jahrhunderts mit geschätzt 300.000–600.000 Toten.',
    content: `## Hintergrund

Die **TPLF** (Tigray People\'s Liberation Front) dominierte Äthiopien von 1991 bis 2018. Premierminister **Abiy Ahmed** (seit 2018, Friedensnobelpreis 2019) marginalisierte die TPLF, die sich in Tigray verschanzte.

## Kriegsverlauf
- **November 2020:** Krieg bricht aus nach TPLF-Angriff auf Nordkommando
- **2020–21:** Äthiopische Armee und eritreische Truppen erobern Tigray
- **Mitte 2021:** TPLF-Gegenoffensive, Rückeroberung Mekkeles
- **2022:** TPLF-Vorstoß Richtung Addis Abeba, dann Rückzug
- **November 2022:** Waffenstillstand von Pretoria

## Opfer
- **300.000–600.000 Tote** (Schätzungen Universität Gent)
- Massenvergewaltigungen als Kriegswaffe
- Ethnische Säuberungen in West-Tigray
- Hungersnot durch Belagerung

## Pretoria-Abkommen
Das Friedensabkommen vom November 2022 beendete die Kampfhandlungen, doch:
- Eritreische Truppen verbleiben in Teilen Tigrays
- West-Tigray bleibt von Amhara-Milizen kontrolliert
- Humanitärer Zugang bleibt eingeschränkt`,
    status: 'frozen',
    severity: 4,
    tags: ['Äthiopien', 'Tigray', 'TPLF', 'Abiy Ahmed', 'Eritrea', 'Bürgerkrieg', 'Pretoria'],
    countryIds: ['ET', 'ER'],
    parties: ['ENDF', 'TPLF', 'Eritrea', 'Amhara-Fano-Milizen'],
    startYear: 2020,
    endYear: 2022,
    casualties: '300.000–600.000',
    displaced: '>2 Mio.',
    sources: [
      { id: 's1', label: 'Universiteit Gent – Tigray Casualty Study', url: 'https://www.ugent.be/ps/conflict-development/research/tigray', type: 'academic', accessDate: '2025-01', reliability: 'high' },
      { id: 's2', label: 'AU – Pretoria Agreement', url: 'https://au.int/en/pressreleases', type: 'government', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-eritrea-profile', label: 'Eritrea (Beteiligter)', relationship: 'actor-in' },
    ],
    timeline: [
      { date: '2018-04', title: 'Abiy Ahmed wird PM', description: 'Reformkurs und Friedensprozess mit Eritrea.' },
      { date: '2020-11-03', title: 'Kriegsausbruch', description: 'TPLF greift Nordkommando an.' },
      { date: '2021-06', title: 'TPLF-Gegenoffensive', description: 'Rückeroberung von Mekelle.' },
      { date: '2022-11-02', title: 'Waffenstillstand', description: 'Pretoria-Abkommen unterzeichnet.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Dauer', value: 'Nov 2020 – Nov 2022' },
      { label: 'Tote', value: '300.000–600.000' },
      { label: 'Vertriebene', value: '>2 Mio.' },
      { label: 'Status', value: 'Waffenstillstand' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── LIBYA ───
  {
    id: 'af-libya-conflict',
    region: 'both',
    category: 'conflict',
    title: 'Libyen-Konflikt',
    subtitle: 'Staatszerfall und Doppelregierung seit 2011',
    summary: 'Libyen ist seit dem NATO-gestützten Sturz Muammar Gaddafis 2011 in einem Zustand des Staatszerfalls. Zwei rivalisierende Regierungen, hunderte Milizen und massive ausländische Einmischung prägen die Lage.',
    content: `## Hintergrund

Der Sturz und die Tötung von **Muammar Gaddafi** im Oktober 2011 nach einer NATO-Intervention hinterließ ein Machtvakuum, das nie gefüllt wurde.

## Zwei Regierungen
- **GNA/GNU** (Government of National Unity) in **Tripolis** unter Abdulhamid Dbeibah
- **HAOR/LNA** (Libyan National Army) unter **General Khalifa Haftar** im Osten mit Basis in Tobruk/Benghazi

## Ausländische Einmischung
- **Türkei:** Unterstützt Tripolis-Regierung mit Truppen und Drohnen
- **Russland/Wagner:** Unterstützt Haftar mit Söldnern
- **VAE, Ägypten, Frankreich:** Unterstützen Haftar
- **Italien:** Wirtschaftliche Interessen, Migrationskontrolle

## Migration
Libyen ist zentraler Transitpunkt für Migration nach Europa. Schwerste Menschenrechtsverletzungen in Internierungslagern sind dokumentiert.

## Ölwirtschaft
Libyen verfügt über Afrikas größte Ölreserven (~48 Mrd. Barrel). Die Kontrolle über Ölanlagen ist ein zentraler Konflikttreiber.`,
    status: 'frozen',
    severity: 4,
    tags: ['Libyen', 'Gaddafi', 'Haftar', 'GNA', 'Öl', 'Migration', 'Tripolis', 'Benghazi'],
    countryIds: ['LY'],
    parties: ['GNU/GNA (Dbeibah)', 'LNA (Haftar)', 'Türkei', 'Russland/Wagner', 'VAE', 'Ägypten'],
    startYear: 2011,
    sources: [
      { id: 's1', label: 'ICG – Libya', url: 'https://www.crisisgroup.org/middle-east-north-africa/north-africa/libya', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
      { id: 's2', label: 'UNSMIL', url: 'https://unsmil.unmissions.org', type: 'un', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise (Folge)', relationship: 'cause' },
      { targetId: 'af-wagner', label: 'Wagner', relationship: 'actor-in' },
    ],
    timeline: [
      { date: '2011-02', title: 'Arabischer Frühling', description: 'Aufstand gegen Gaddafi beginnt.' },
      { date: '2011-10', title: 'Tod Gaddafis', description: 'Gaddafi wird in Sirte getötet.' },
      { date: '2014', title: 'Zweiter Bürgerkrieg', description: 'Operation Dignity (Haftar) vs. Islamisten in Benghazi.' },
      { date: '2019-04', title: 'Haftar-Offensive auf Tripolis', description: 'LNA marschiert auf Hauptstadt.' },
      { date: '2020-06', title: 'Türkische Intervention', description: 'Türkei stoppt Haftar-Offensive.' },
      { date: '2020-10', title: 'Waffenstillstand', description: 'UN-vermittelter Waffenstillstand.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Ölreserven', value: '~48 Mrd. Barrel' },
      { label: 'Bevölkerung', value: '~7 Mio.' },
      { label: 'Regierungen', value: '2 (Tripolis + Osten)' },
      { label: 'UN-Mission', value: 'UNSMIL' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── MOZAMBIQUE INSURGENCY ───
  {
    id: 'af-mozambique-insurgency',
    region: 'africa',
    category: 'conflict',
    title: 'Mosambik-Insurgency (Cabo Delgado)',
    subtitle: 'IS-affiliierte Aufständische in Nordmosambik',
    summary: 'Seit 2017 kämpfen IS-affiliierte Aufständische (lokal „Al-Shabaab" genannt, nicht identisch mit der somalischen Gruppe) in der gasreichen Provinz Cabo Delgado. Der Konflikt hat >5.000 Tote und >1 Mio. Vertriebene gefordert.',
    content: `## Hintergrund

Die Aufständischen in Cabo Delgado werden lokal **Al-Shabaab** oder **Ansar al-Sunna** genannt und sind seit 2019 als **ISCAP** (Islamic State Central Africa Province) mit dem IS affiliiert. Die Wurzeln liegen in sozialer Marginalisierung, religiösem Extremismus und dem Ressourcenfluch durch massive Gasfelder.

## LNG-Projekte
Cabo Delgado beherbergt eines der größten Gasfelder der Welt. TotalEnergies hat 2021 sein $20-Mrd-LNG-Projekt wegen Sicherheitslage auf Eis gelegt.

## Internationale Reaktion
- **Ruanda:** ~2.000 Soldaten seit 2021
- **SADC:** SAMIM-Mission seit 2021
- **EU:** Trainingsmission (EUTM)`,
    status: 'active',
    severity: 3,
    tags: ['Mosambik', 'Cabo Delgado', 'IS', 'LNG', 'Ruanda', 'SADC'],
    countryIds: ['MZ'],
    parties: ['ISCAP/Al-Shabaab', 'FADM', 'Ruanda', 'SADC/SAMIM'],
    startYear: 2017,
    casualties: '>5.000',
    displaced: '>1 Mio.',
    sources: [
      { id: 's1', label: 'ICG – Mozambique', url: 'https://www.crisisgroup.org/africa/southern-africa/mozambique', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-drc-east', label: 'ISCAP (DRC-Verbindung)', relationship: 'related' },
    ],
    timeline: [
      { date: '2017-10', title: 'Erste Angriffe', description: 'Bewaffnete überfallen Polizeistation in Mocímboa da Praia.' },
      { date: '2020-08', title: 'Fall von Mocímboa da Praia', description: 'Aufständische erobern Hafenstadt.' },
      { date: '2021-03', title: 'Angriff auf Palma', description: 'Großangriff nahe TotalEnergies-Anlage, dutzende Tote.' },
      { date: '2021-07', title: 'Ruandische Intervention', description: 'Ruanda entsendet ~2.000 Soldaten.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Beginn', value: '2017' },
      { label: 'Tote', value: '>5.000' },
      { label: 'Vertriebene', value: '>1 Mio.' },
      { label: 'LNG-Investition (pausiert)', value: '$20 Mrd.' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── SOMALIA AL-SHABAAB ───
  {
    id: 'af-somalia',
    region: 'africa',
    category: 'conflict',
    title: 'Somalia-Konflikt / Al-Shabaab',
    subtitle: 'Staatszerfall und dschihadistischer Aufstand am Horn von Afrika',
    summary: 'Somalia ist seit 1991 von Staatszerfall geprägt. Al-Shabaab kontrolliert weite Teile Süd- und Zentralsomalias und verübt regelmäßig Anschläge, auch in Nachbarländern wie Kenia.',
    content: `## Überblick

**Al-Shabaab** (Harakat al-Shabaab al-Mujahideen) ist eine al-Qaida-affiliierte Gruppe, die seit 2006/07 in Somalia aktiv ist. Trotz der AU-Mission **ATMIS** (ehem. AMISOM) und US-Drohnenangriffen kontrolliert Al-Shabaab weite Gebiete.

## Akteure
- **Al-Shabaab:** 7.000–12.000 Kämpfer
- **SNA (Somali National Army)**
- **ATMIS** (AU-Übergangsmission)
- **US AFRICOM:** Drohnenoperationen
- **Clan-Milizen (Macawisley):** Lokale Anti-Shabaab-Bewegung

## Somaliland & Puntland
- **Somaliland:** De facto unabhängig seit 1991, stabil
- **Puntland:** Semi-autonome Region, eigene Sicherheitskräfte`,
    status: 'active',
    severity: 4,
    tags: ['Somalia', 'Al-Shabaab', 'Al-Qaida', 'AMISOM', 'ATMIS', 'Somaliland', 'Horn von Afrika'],
    countryIds: ['SO', 'KE', 'ET', 'DJ'],
    parties: ['Al-Shabaab', 'SNA', 'ATMIS', 'US AFRICOM', 'Macawisley-Milizen'],
    startYear: 2006,
    casualties: '>20.000',
    sources: [
      { id: 's1', label: 'ICG – Somalia', url: 'https://www.crisisgroup.org/africa/horn-africa/somalia', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-ethiopia-tigray', label: 'Äthiopien (ATMIS-Beiträger)', relationship: 'related' },
    ],
    timeline: [
      { date: '1991', title: 'Staatszerfall', description: 'Sturz Siad Barres, Beginn des Bürgerkriegs.' },
      { date: '2006', title: 'Islamic Courts Union', description: 'ICU erobert Mogadischu, äthiopische Intervention.' },
      { date: '2007', title: 'AMISOM-Einsatz', description: 'AU-Friedensmission beginnt.' },
      { date: '2017', title: 'Mogadischu-Anschlag', description: 'Schwerster Terroranschlag: >500 Tote.' },
      { date: '2022', title: 'Anti-Shabaab-Offensive', description: 'Präsident Hassan Sheikh Mohamud startet Offensive.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Al-Shabaab-Stärke', value: '7.000–12.000' },
      { label: 'UN-Einstufung', value: 'Fragile State #1' },
      { label: 'AU-Mission', value: 'ATMIS (Nachfolger AMISOM)' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },
];

// ═══════════════════════════════════════════════════════════════════
// MIDDLE EAST — Knowledge Base Entries
// ═══════════════════════════════════════════════════════════════════

const mideastEntries: KBEntry[] = [
  // ─── ISRAEL-PALESTINE ───
  {
    id: 'me-israel-palestine',
    region: 'mideast',
    category: 'conflict',
    title: 'Israel-Palästina-Konflikt',
    subtitle: 'Besatzung, Widerstand und der Gaza-Krieg 2023/24',
    summary: 'Der Nahostkonflikt zwischen Israel und den Palästinensern dauert seit über 75 Jahren an. Der Hamas-Angriff vom 7. Oktober 2023 und Israels Militäroffensive in Gaza haben die schlimmste Eskalation seit Jahrzehnten ausgelöst.',
    content: `## Historischer Hintergrund

Der Konflikt hat seine Wurzeln in der **zionistischen Siedlungsbewegung** und der **Balfour-Deklaration** (1917). Nach der israelischen Staatsgründung 1948 und der **Nakba** (Vertreibung von ~700.000 Palästinensern) eskalierte der Konflikt über mehrere Kriege.

## Kerndimensionen

### 1. Besatzung
Israel besetzt seit 1967 das **Westjordanland**, **Ost-Jerusalem** und kontrollierte bis 2005 den **Gazastreifen** (seitdem Blockade). Die Siedlungspolitik im Westjordanland wird international als völkerrechtswidrig eingestuft.

### 2. Gaza-Blockade
Seit 2007 unterliegt Gaza einer Land-, See- und Luftblockade durch Israel (und Ägypten), die von der UN als "Freiluftgefängnis" kritisiert wird.

### 3. Zwei-Staaten-Lösung
Seit den Oslo-Abkommen (1993/95) ist eine Zwei-Staaten-Lösung offizielles Ziel der internationalen Gemeinschaft — wird jedoch durch Siedlungsausbau und politische Fragmentierung zunehmend unrealistisch.

## 7. Oktober 2023

Am 7. Oktober 2023 verübte die **Hamas** den schwersten Angriff auf Israel seit 1973:
- **~1.200 Israelis getötet** (Zivilisten und Soldaten)
- **~250 Geiseln** nach Gaza verschleppt
- Angriff auf Kibbuzim, Nova-Festival und Militärposten

## Israels Militäroffensive in Gaza (2023/24)
- Massive Luft- und Bodenoffensive
- **>40.000 Tote** laut palästinensischem Gesundheitsministerium
- Nahezu komplette Zerstörung der Infrastruktur
- **1,9 Mio.** Binnenvertriebene
- Vorwürfe des Genozids vor dem IGH
- Humanitäre Katastrophe: Hungerkrise, Zusammenbruch des Gesundheitssystems

## Regionale Dimension
- **Hisbollah (Libanon):** Grenzgefechte, Eskalation 2024
- **Huthis (Jemen):** Raketenangriffe auf Israel, Schiffsblockade im Roten Meer
- **Iran:** Direkter Raketenangriff auf Israel (April 2024)
- **Westjordanland:** Zunahme von Siedlergewalt und Militäroperationen`,
    status: 'escalating',
    severity: 5,
    tags: ['Israel', 'Palästina', 'Gaza', 'Hamas', 'Westjordanland', 'Besatzung', '7. Oktober', 'IGH'],
    countryIds: ['IL', 'PS'],
    parties: ['Israel (IDF)', 'Hamas', 'Palästinensische Autonomiebehörde', 'Islamischer Jihad', 'Hisbollah', 'Iran'],
    startYear: 1948,
    casualties: '>40.000 (Gaza 2023/24), >100.000 (historisch gesamt)',
    displaced: '1,9 Mio. (Gaza 2023/24)',
    sources: [
      { id: 's1', label: 'UN OCHA – OPT Crisis', url: 'https://www.ochaopt.org', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'ICJ – South Africa v. Israel', url: 'https://www.icj-cij.org/case/192', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's3', label: 'B\'Tselem – Israeli Human Rights Org', url: 'https://www.btselem.org', type: 'ngo', accessDate: '2025-02', reliability: 'high' },
      { id: 's4', label: 'ICG – Israel/Palestine', url: 'https://www.crisisgroup.org/middle-east-north-africa/east-mediterranean-mena/israelpalestine', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-hamas', label: 'Hamas', relationship: 'actor-in' },
      { targetId: 'me-hezbollah', label: 'Hisbollah', relationship: 'related' },
      { targetId: 'me-iran', label: 'Iran (Unterstützer)', relationship: 'related' },
      { targetId: 'me-yemen-houthis', label: 'Huthis (Solidarität)', relationship: 'related' },
    ],
    timeline: [
      { date: '1917', title: 'Balfour-Deklaration', description: 'Britische Zusage einer "jüdischen Heimstätte" in Palästina.' },
      { date: '1948-05', title: 'Staatsgründung Israel / Nakba', description: 'Gründung Israels, Vertreibung von ~700.000 Palästinensern.' },
      { date: '1967-06', title: 'Sechstagekrieg', description: 'Israel erobert Westjordanland, Gaza, Sinai, Golanhöhen.' },
      { date: '1987', title: 'Erste Intifada', description: 'Palästinensischer Volksaufstand.' },
      { date: '1993', title: 'Oslo-Abkommen', description: 'Rahmen für Zwei-Staaten-Lösung.' },
      { date: '2000', title: 'Zweite Intifada', description: 'Gewaltsamer Aufstand, Selbstmordanschläge.' },
      { date: '2005', title: 'Israelischer Abzug aus Gaza', description: 'Rückzug der Siedler und Soldaten.' },
      { date: '2007', title: 'Hamas übernimmt Gaza', description: 'Hamas gewinnt Wahlen 2006, übernimmt 2007 vollständig.' },
      { date: '2023-10-07', title: 'Hamas-Angriff', description: '~1.200 Israelis getötet, ~250 Geiseln genommen.' },
      { date: '2023-10-08', title: 'Beginn der Gaza-Offensive', description: 'Israel beginnt massive Luft- und Bodenoffensive.' },
      { date: '2024-01', title: 'IGH-Verfahren', description: 'Südafrika klagt Israel wegen Völkermord an.' },
      { date: '2024-04', title: 'Iranischer Raketenangriff', description: 'Iran feuert erstmals direkt Raketen auf Israel.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Dauer', value: 'Seit 1948 (76+ Jahre)' },
      { label: 'Tote Gaza 2023/24', value: '>40.000' },
      { label: 'Geiseln (7. Okt)', value: '~250' },
      { label: 'Vertriebene Gaza', value: '1,9 Mio.' },
      { label: 'Siedler Westjordanland', value: '>700.000' },
      { label: 'Bevölkerung Gaza', value: '~2,3 Mio.' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── SYRIA ───
  {
    id: 'me-syria',
    region: 'mideast',
    category: 'conflict',
    title: 'Syrischer Bürgerkrieg',
    subtitle: 'Über ein Jahrzehnt Krieg, Fragmentierung und Proxy-Konflikte',
    summary: 'Der syrische Bürgerkrieg (seit 2011) hat über 500.000 Tote und 13 Millionen Vertriebene gefordert. Syrien ist zwischen dem Assad-Regime, Rebellengruppen, Kurden, IS-Resten und ausländischen Mächten fragmentiert.',
    content: `## Hintergrund

Die Proteste des **Arabischen Frühlings** erreichten Syrien im März 2011. Die brutale Reaktion des **Assad-Regimes** eskalierte zum Bürgerkrieg.

## Konfliktparteien

### Assad-Regime
- Unterstützt durch **Russland** (Luftwaffe seit 2015), **Iran** und **Hisbollah**
- Kontrolliert ~70% des Territoriums

### Opposition
- Diverse Rebellengruppen, von moderat bis islamistisch
- **HTS** (Hay'at Tahrir al-Sham, ehem. al-Nusra) kontrolliert Idlib
- Türkei-unterstützte Fraktionen im Norden

### SDF/Rojava
- Kurdisch geführte **SDF** (Syrian Democratic Forces) kontrolliert den Nordosten
- US-Unterstützung, Türkei betrachtet PYD/YPG als Terroristen

### IS-Reste
- Territorium verloren (2019), aber Schläferzellen aktiv

## Ausländische Militärpräsenz
- **Russland:** Hmeimim (Luftwaffenbasis), Tartus (Marinebasis)
- **Iran:** IRGC, Milizen, Hisbollah
- **Türkei:** Truppen im Norden, Operation Euphrat-Schild/Olivenzweig
- **USA:** ~900 Soldaten im Nordosten (Anti-IS)
- **Israel:** Regelmäßige Luftangriffe auf iranische Ziele

## Humanitäre Lage
- **>500.000 Tote**
- **6,8 Mio.** Binnenvertriebene
- **6,5 Mio.** Flüchtlinge (größte Flüchtlingskrise seit WWII)
- Massiver Einsatz von Chemiewaffen durch Regime (Ghouta 2013, Khan Sheikhoun 2017, Douma 2018)`,
    status: 'frozen',
    severity: 5,
    tags: ['Syrien', 'Bürgerkrieg', 'Assad', 'IS', 'Russland', 'Iran', 'Türkei', 'Kurden', 'SDF', 'Chemiewaffen'],
    countryIds: ['SY'],
    parties: ['Assad-Regime', 'HTS', 'SDF/Rojava', 'IS (Reste)', 'Türkei', 'Russland', 'Iran', 'Hisbollah', 'USA'],
    startYear: 2011,
    casualties: '>500.000',
    displaced: '13 Mio. (6,8 Mio. intern + 6,5 Mio. extern)',
    sources: [
      { id: 's1', label: 'SOHR – Syrian Observatory for Human Rights', url: 'https://www.syriahr.com/en/', type: 'ngo', accessDate: '2025-01', reliability: 'medium' },
      { id: 's2', label: 'ICG – Syria', url: 'https://www.crisisgroup.org/middle-east-north-africa/east-mediterranean-mena/syria', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
      { id: 's3', label: 'OPCW – Chemical Weapons in Syria', url: 'https://www.opcw.org/media-centre/featured-topics/investigation-and-identification-team', type: 'un', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-iran', label: 'Iran (Unterstützer Assads)', relationship: 'actor-in' },
      { targetId: 'me-hezbollah', label: 'Hisbollah (Kämpfer in Syrien)', relationship: 'actor-in' },
      { targetId: 'me-israel-palestine', label: 'Israel (Luftangriffe)', relationship: 'related' },
      { targetId: 'me-turkey', label: 'Türkei (Nordsyrien)', relationship: 'actor-in' },
    ],
    timeline: [
      { date: '2011-03', title: 'Proteste beginnen', description: 'Arabischer Frühling erreicht Syrien, Daraa.' },
      { date: '2013-08', title: 'Ghouta-Chemiewaffenangriff', description: '>1.400 Tote durch Sarin.' },
      { date: '2014-06', title: 'IS ruft Kalifat aus', description: 'Abu Bakr al-Baghdadi in Mossul/Raqqa.' },
      { date: '2015-09', title: 'Russische Intervention', description: 'Putin interveniert militärisch für Assad.' },
      { date: '2016-12', title: 'Fall von Aleppo', description: 'Regime erobert Ost-Aleppo zurück.' },
      { date: '2019-03', title: 'IS verliert letztes Territorium', description: 'SDF erobert Baghuz.' },
      { date: '2020', title: 'Idlib-Offensive', description: 'Regime-Offensive, türkisch-russischer Waffenstillstand.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Tote', value: '>500.000' },
      { label: 'Flüchtlinge', value: '6,5 Mio.' },
      { label: 'Binnenvertriebene', value: '6,8 Mio.' },
      { label: 'Chemiewaffen-Einsätze', value: '>300 (dokumentiert)' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── YEMEN ───
  {
    id: 'me-yemen-houthis',
    region: 'mideast',
    category: 'conflict',
    title: 'Jemen-Krieg / Huthi-Konflikt',
    subtitle: 'Bürgerkrieg, Saudi-Koalition und die schlimmste humanitäre Krise der Welt',
    summary: 'Der Jemen-Krieg dauert seit 2014 an. Die Iran-unterstützten Huthi-Rebellen kontrollieren den Nordwesten, die saudi-geführte Koalition unterstützt die international anerkannte Regierung. Seit 2023 greifen die Huthis zudem Schifffahrt im Roten Meer an.',
    content: `## Hintergrund

Die **Huthi-Bewegung** (Ansar Allah) ist eine zaidisch-schiitische Gruppe aus dem Nordjemen, die seit 2004 intermittierend gegen die Regierung kämpft. 2014 eroberten sie die Hauptstadt Sanaa.

## Saudi-Koalition
Im März 2015 begann eine von **Saudi-Arabien** geführte Koalition (mit VAE, Bahrain, etc.) Luftangriffe gegen die Huthis. Die Koalition wird der systematischen Bombardierung ziviler Infrastruktur beschuldigt.

## Konfliktfraktionen
- **Huthis/Ansar Allah:** Kontrollieren Nordjemen inkl. Sanaa
- **Internationally anerkannte Regierung:** In Aden/Riad
- **STC (Southern Transitional Council):** VAE-unterstützt, will Südjemen-Unabhängigkeit
- **Al-Qaida (AQAP):** Aktiv im Süden/Osten

## Rote-Meer-Krise (seit 2023)
Die Huthis greifen seit November 2023 Handelsschiffe im Roten Meer an — angeblich in Solidarität mit Gaza. Dies bedroht eine der wichtigsten Handelsrouten der Welt (>12% des Welthandels).

## Humanitäre Katastrophe
- **>150.000 Tote** (direkt)
- **>377.000 Tote** (indirekt durch Hunger/Krankheit)
- **21,6 Mio.** auf humanitäre Hilfe angewiesen (80% der Bevölkerung)
- Cholera-Epidemie: >2,5 Mio. Verdachtsfälle`,
    status: 'active',
    severity: 5,
    tags: ['Jemen', 'Huthis', 'Saudi-Arabien', 'Rotes Meer', 'Iran', 'AQAP', 'Hungersnot'],
    countryIds: ['YE', 'SA'],
    parties: ['Huthis/Ansar Allah', 'Saudi-Koalition', 'Regierung Jemen', 'STC', 'AQAP', 'Iran', 'VAE'],
    startYear: 2014,
    casualties: '>377.000 (direkt + indirekt)',
    displaced: '4,5 Mio. intern',
    sources: [
      { id: 's1', label: 'OCHA – Yemen', url: 'https://www.unocha.org/yemen', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'ICG – Yemen', url: 'https://www.crisisgroup.org/middle-east-north-africa/gulf-and-arabian-peninsula/yemen', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-iran', label: 'Iran (Huthi-Unterstützer)', relationship: 'actor-in' },
      { targetId: 'me-israel-palestine', label: 'Gaza-Solidarität (Rotes Meer)', relationship: 'related' },
      { targetId: 'me-saudi', label: 'Saudi-Arabien (Koalitionsführer)', relationship: 'actor-in' },
    ],
    timeline: [
      { date: '2004', title: 'Huthi-Aufstand beginnt', description: 'Erste von sechs Sa\'ada-Kriegen.' },
      { date: '2014-09', title: 'Huthis erobern Sanaa', description: 'Fall der Hauptstadt.' },
      { date: '2015-03', title: 'Saudi-Intervention', description: 'Operation Decisive Storm beginnt.' },
      { date: '2018-12', title: 'Stockholm-Abkommen', description: 'Teilweiser Waffenstillstand für Hodeidah.' },
      { date: '2022-04', title: 'Waffenstillstand', description: 'Sechsmonatiger Waffenstillstand (verlängert, dann ausgelaufen).' },
      { date: '2023-11', title: 'Rote-Meer-Angriffe', description: 'Huthis beginnen Angriffe auf Handelsschiffe.' },
      { date: '2024-01', title: 'US/UK-Luftangriffe', description: 'Westliche Koalition greift Huthi-Stellungen an.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Tote (gesamt)', value: '>377.000' },
      { label: 'Auf Hilfe angewiesen', value: '21,6 Mio.' },
      { label: 'Cholera-Fälle', value: '>2,5 Mio.' },
      { label: 'Rotes-Meer-Angriffe', value: '>100 (seit Nov 2023)' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── IRAN ───
  {
    id: 'me-iran',
    region: 'mideast',
    category: 'actor',
    title: 'Iran — Islamische Republik',
    subtitle: 'Regionalmacht, Achse des Widerstands und Nuklearprogramm',
    summary: 'Iran ist die zentrale Macht der „Achse des Widerstands" gegen Israel und die USA. Durch Proxy-Kräfte (Hisbollah, Hamas, Huthis, irakische Milizen) projiziert Teheran Macht weit über seine Grenzen hinaus.',
    content: `## Geopolitische Rolle

Die **Islamische Republik Iran** (seit 1979) verfolgt eine regionale Hegemonialpolitik, die auf mehreren Säulen basiert:

### 1. Achse des Widerstands (Muqawama)
Irans Netzwerk von Proxy-Kräften:
- **Hisbollah** (Libanon): ~30.000 Kämpfer, >150.000 Raketen
- **Hamas/PIJ** (Gaza): Finanzierung, Waffen, Training
- **Huthis/Ansar Allah** (Jemen): Raketen, Drohnen, Ausbildung
- **PMF/Hashd al-Sha'bi** (Irak): Iran-nahe Milizen
- **Schiitische Milizen** (Syrien): Fatemiyoun, Zeinabiyoun

### 2. Nuklearprogramm
- JCPOA (2015): Nuklearabkommen, von Trump 2018 gekündigt
- Anreicherung auf >60% (waffenfähig ab 90%)
- IAEA: Unzureichende Inspektionsmöglichkeiten

### 3. Drohnen- und Raketenprogramm
- Ballistische Raketen mit >2.000 km Reichweite
- Kampfdrohnen (Shahed-136), auch an Russland geliefert (Ukraine-Krieg)

## Innenpolitik
- Massenproteste 2022 ("Frau, Leben, Freiheit") nach Tod von Mahsa Amini
- Brutale Unterdrückung, >500 Tote
- Wirtschaftskrise durch Sanktionen`,
    status: 'active',
    severity: 4,
    tags: ['Iran', 'IRGC', 'Hisbollah', 'Proxy', 'Nuklear', 'Achse des Widerstands', 'Sanktionen'],
    countryIds: ['IR'],
    parties: ['IRGC', 'Revolutionsführer Khamenei', 'Reformlager'],
    startYear: 1979,
    sources: [
      { id: 's1', label: 'IISS – Iran\'s Networks of Influence', url: 'https://www.iiss.org/research-paper/2019/11/iran-networks-of-influence', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
      { id: 's2', label: 'IAEA – Iran Nuclear Reports', url: 'https://www.iaea.org/newscenter/focus/iran', type: 'un', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-israel-palestine', label: 'Israel (Hauptfeind)', relationship: 'opposed' },
      { targetId: 'me-hezbollah', label: 'Hisbollah', relationship: 'allied' },
      { targetId: 'me-yemen-houthis', label: 'Huthis', relationship: 'allied' },
      { targetId: 'me-syria', label: 'Syrien (Assad-Unterstützung)', relationship: 'allied' },
      { targetId: 'me-iraq', label: 'Irak (Milizen)', relationship: 'allied' },
      { targetId: 'me-saudi', label: 'Saudi-Arabien (Rivalität)', relationship: 'opposed' },
    ],
    timeline: [
      { date: '1979-02', title: 'Islamische Revolution', description: 'Sturz des Schahs, Khomeini übernimmt.' },
      { date: '1980-88', title: 'Iran-Irak-Krieg', description: '8 Jahre Krieg, >1 Mio. Tote.' },
      { date: '2006', title: 'Libanonkrieg', description: 'Hisbollah (Iran-Proxy) gegen Israel.' },
      { date: '2015-07', title: 'JCPOA', description: 'Nuklearabkommen unterzeichnet.' },
      { date: '2018-05', title: 'JCPOA-Ausstieg USA', description: 'Trump kündigt Abkommen, verschärft Sanktionen.' },
      { date: '2020-01', title: 'Tötung Soleimanis', description: 'US-Drohne tötet IRGC-General Qasem Soleimani in Bagdad.' },
      { date: '2022-09', title: 'Mahsa-Amini-Proteste', description: '"Frau, Leben, Freiheit"-Bewegung.' },
      { date: '2024-04', title: 'Direkter Angriff auf Israel', description: 'Erstmals direkte iranische Raketen/Drohnen auf Israel.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Bevölkerung', value: '~88 Mio.' },
      { label: 'IRGC-Stärke', value: '~190.000' },
      { label: 'Proxies gesamt', value: '>200.000 Kämpfer' },
      { label: 'Raketen-Reichweite', value: '>2.000 km' },
      { label: 'Öl-Reserven', value: '4. größte weltweit' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── IRAQ ───
  {
    id: 'me-iraq',
    region: 'mideast',
    category: 'conflict',
    title: 'Irak — Post-IS-Ära und iranischer Einfluss',
    subtitle: 'Zwischen Wiederaufbau, Milizen-Macht und geopolitischer Zerrissenheit',
    summary: 'Nach der Niederlage des IS (2017) kämpft der Irak mit iranisch kontrollierten Milizen, politischer Instabilität, kurdischer Autonomie und dem Erbe von Jahrzehnten des Krieges.',
    content: `## Hintergrund

Der Irak hat seit 1980 vier große Kriege erlebt:
1. **Iran-Irak-Krieg** (1980–88)
2. **Golfkrieg** (1991)
3. **US-Invasion** (2003–2011)
4. **IS-Krieg** (2014–2017)

## Aktuelle Lage

### PMF/Hashd al-Sha'bi
Die **Popular Mobilization Forces** (Volksmobilisierungskräfte) sind ein Dachverband von ~40 Milizen, offiziell Teil der Sicherheitskräfte, de facto aber von Iran kontrolliert. Prominente Gruppen:
- **Kata'ib Hezbollah**
- **Asa'ib Ahl al-Haq**
- **Badr-Organisation**

### Kurdistan-Region
Die **Kurdistan-Region** (KRI) genießt weitreichende Autonomie, ist aber durch interne Rivalitäten (KDP vs. PUK) und Konflikte mit Bagdad geschwächt.

### US-Präsenz
~2.500 US-Soldaten verbleiben im Irak (Anti-IS-Mission). Iran-nahe Milizen greifen regelmäßig US-Basen an.`,
    status: 'active',
    severity: 3,
    tags: ['Irak', 'PMF', 'Milizen', 'Iran', 'Kurdistan', 'IS', 'US-Präsenz'],
    countryIds: ['IQ'],
    parties: ['Irakische Regierung', 'PMF/Hashd', 'KRI (Kurdistan)', 'IS (Reste)', 'USA', 'Iran'],
    startYear: 2003,
    sources: [
      { id: 's1', label: 'ICG – Iraq', url: 'https://www.crisisgroup.org/middle-east-north-africa/gulf-and-arabian-peninsula/iraq', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-iran', label: 'Iran (Milizen-Kontrolle)', relationship: 'related' },
      { targetId: 'me-syria', label: 'Syrien (IS-Verbindung)', relationship: 'related' },
    ],
    timeline: [
      { date: '2003-03', title: 'US-Invasion', description: 'Sturz Saddam Husseins.' },
      { date: '2014-06', title: 'IS erobert Mossul', description: 'Islamischer Staat ruft Kalifat aus.' },
      { date: '2017-07', title: 'Befreiung Mossuls', description: 'Irakische Kräfte erobern Mossul zurück.' },
      { date: '2020-01', title: 'Tötung Soleimanis', description: 'US-Drohnenangriff in Bagdad.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Bevölkerung', value: '~43 Mio.' },
      { label: 'US-Soldaten', value: '~2.500' },
      { label: 'PMF-Milizionäre', value: '~100.000+' },
      { label: 'Ölförderung', value: '~4,5 Mio. b/d' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── HEZBOLLAH ───
  {
    id: 'me-hezbollah',
    region: 'mideast',
    category: 'actor',
    title: 'Hisbollah',
    subtitle: 'Libanesische Schiiten-Miliz und Iran-Proxy',
    summary: 'Die Hisbollah ist eine libanesische schiitische Partei und Miliz, von Iran gegründet und finanziert. Sie verfügt über eine der stärksten nicht-staatlichen Armeen der Welt und ist gleichzeitig politische Kraft im Libanon.',
    content: `## Hintergrund

Die **Hisbollah** (Partei Gottes) wurde 1982 während des libanesischen Bürgerkriegs mit iranischer Hilfe gegründet. Unter **Hassan Nasrallah** (getötet September 2024) wurde sie zur mächtigsten Kraft im Libanon.

## Militärische Kapazität
- **~30.000 aktive Kämpfer** + Reservisten
- **>150.000 Raketen und Geschosse**
- Präzisionsgelenkte Munition
- Erfahrung aus Syrien-Krieg
- Drohnen-Kapazitäten

## Politische Rolle
Die Hisbollah ist Teil der libanesischen Regierung und kontrolliert de facto die Sicherheitspolitik des Landes — ein "Staat im Staat".

## 2024 Eskalation
Nach dem Gaza-Krieg eröffnete die Hisbollah eine "Solidaritätsfront" an der libanesisch-israelischen Grenze. Israel eskalierte im September 2024 massiv (Pager-Angriffe, Tötung Nasrallahs, Bodenoffensive).`,
    status: 'active',
    severity: 4,
    tags: ['Hisbollah', 'Libanon', 'Iran', 'Israel', 'Nasrallah', 'Schiiten', 'Proxy'],
    countryIds: ['LB'],
    parties: ['Hisbollah', 'Iran/IRGC', 'Israel/IDF', 'Libanesische Armee'],
    startYear: 1982,
    sources: [
      { id: 's1', label: 'CSIS – Hezbollah Military Capabilities', url: 'https://www.csis.org/analysis/hezbollah-military-capabilities', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-iran', label: 'Iran (Gründer/Sponsor)', relationship: 'allied' },
      { targetId: 'me-israel-palestine', label: 'Israel (Feind)', relationship: 'opposed' },
      { targetId: 'me-syria', label: 'Syrien (Kampfeinsatz)', relationship: 'actor-in' },
    ],
    timeline: [
      { date: '1982', title: 'Gründung', description: 'Iran gründet Hisbollah im Libanon.' },
      { date: '2000', title: 'Israelischer Abzug aus Südlibanon', description: 'Hisbollah feiert "Befreiung".' },
      { date: '2006-07', title: 'Libanonkrieg', description: '34-tägiger Krieg mit Israel.' },
      { date: '2013', title: 'Syrien-Einsatz', description: 'Hisbollah kämpft für Assad in Syrien.' },
      { date: '2024-09', title: 'Pager-Angriffe', description: 'Israel sabotiert Hisbollah-Kommunikationsgeräte.' },
      { date: '2024-09', title: 'Tötung Nasrallahs', description: 'Israel tötet Hassan Nasrallah bei Luftangriff.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Kämpfer', value: '~30.000' },
      { label: 'Raketen', value: '>150.000' },
      { label: 'Sponsor', value: 'Iran (~700 Mio.$/Jahr)' },
      { label: 'Politische Sitze', value: '13 (Parlament)' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── SAUDI ARABIA ───
  {
    id: 'me-saudi',
    region: 'mideast',
    category: 'actor',
    title: 'Saudi-Arabien',
    subtitle: 'Regionalmacht zwischen Vision 2030, Iran-Rivalität und geopolitischem Wandel',
    summary: 'Saudi-Arabien ist die führende sunnitische Macht am Golf, Hüter der Heiligen Stätten und größter Ölexporteur der OPEC. Unter Kronprinz MBS durchläuft das Königreich einen massiven Transformationsprozess.',
    content: `## Geopolitische Rolle

### Iran-Rivalität
Die **saudi-iranische Rivalität** ist die zentrale Konfliktlinie im Nahen Osten. Beide kämpfen um regionale Hegemonie:
- **Jemen:** Saudi-Koalition vs. Huthis (Iran)
- **Libanon:** Anti-Hisbollah vs. Pro-Hisbollah
- **Irak:** Sunnitische vs. schiitische Machtblöcke
- **Bahrain:** Saudi-Unterstützung gegen schiitische Opposition

### Vision 2030
Kronprinz **Mohammed bin Salman (MBS)** treibt die Diversifizierung weg von Öl:
- NEOM (>$500 Mrd. Megaprojekt)
- Entertainmentindustrie
- Tourismus (Al-Ula)
- Rüstungsindustrie

### Normalisierung
Das Abraham-Abkommen (2020) mit VAE/Bahrain/Israel sollte um Saudi-Arabien erweitert werden, wurde durch den 7. Oktober 2023 unterbrochen. 2023 erfolgte die überraschende saudi-iranische Annäherung (China-vermittelt).`,
    status: 'active',
    severity: 3,
    tags: ['Saudi-Arabien', 'MBS', 'Vision 2030', 'OPEC', 'Iran', 'Jemen', 'Normalisierung'],
    countryIds: ['SA'],
    sources: [
      { id: 's1', label: 'Brookings – Saudi Arabia', url: 'https://www.brookings.edu/topic/saudi-arabia/', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-iran', label: 'Iran (Rivale)', relationship: 'opposed' },
      { targetId: 'me-yemen-houthis', label: 'Jemen-Krieg', relationship: 'actor-in' },
      { targetId: 'me-israel-palestine', label: 'Normalisierung (pausiert)', relationship: 'related' },
    ],
    timeline: [
      { date: '2015-03', title: 'Jemen-Intervention', description: 'Beginn der Militärintervention.' },
      { date: '2016-04', title: 'Vision 2030', description: 'MBS stellt Reformprogramm vor.' },
      { date: '2018-10', title: 'Mord an Khashoggi', description: 'Ermordung des Journalisten im Konsulat Istanbul.' },
      { date: '2020-09', title: 'Abraham-Abkommen', description: 'VAE/Bahrain normalisieren Beziehungen zu Israel.' },
      { date: '2023-03', title: 'Saudi-Iran-Deal', description: 'China vermittelt Wiederaufnahme diplomatischer Beziehungen.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Bevölkerung', value: '~36 Mio.' },
      { label: 'Ölförderung', value: '~10 Mio. b/d' },
      { label: 'Militärbudget', value: '~75 Mrd. $' },
      { label: 'Vision 2030 Invest.', value: '>3,3 Bio. $' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── TURKEY ───
  {
    id: 'me-turkey',
    region: 'mideast',
    category: 'actor',
    title: 'Türkei — Regionale Ambitionen',
    subtitle: 'NATO-Mitglied zwischen Ost und West mit aggressiver Außenpolitik',
    summary: 'Die Türkei unter Erdogan verfolgt eine neo-osmanische Außenpolitik mit Militäroperationen in Syrien, Irak, Libyen und wachsendem Einfluss in der Sahelzone und am Horn von Afrika.',
    content: `## Regionale Militärpräsenz

### Syrien/Nordsyrien
- **Operation Euphrat-Schild** (2016): Gegen IS und YPG
- **Operation Olivenzweig** (2018): Gegen Afrin/YPG
- **Operation Friedensquelle** (2019): Gegen Nordost-Syrien/SDF
- Türkei besetzt Grenzstreifen im Norden

### Irak
- Regelmäßige Operationen gegen PKK in Nordirak
- Militärbasen in der Kurdistan-Region

### Libyen
- Militärische Unterstützung der Tripolis-Regierung (2020)
- Marinabkommen im Mittelmeer

### Afrika
- Wachsende Militärpräsenz: Basis in Somalia (Mogadischu)
- Drohnenexporte (Bayraktar TB2): An Niger, Äthiopien, Marokko, etc.
- Wirtschaftskooperationen in der Sahelzone

### Drohnenindustrie
Die **Bayraktar TB2** hat die türkische Rüstungsindustrie revolutioniert — Exporte an >30 Länder.`,
    status: 'active',
    severity: 3,
    tags: ['Türkei', 'Erdogan', 'NATO', 'Syrien', 'PKK', 'Drohnen', 'Bayraktar', 'Neo-Osmanismus'],
    countryIds: ['TR'],
    sources: [
      { id: 's1', label: 'SWP – Turkey Foreign Policy', url: 'https://www.swp-berlin.org/themen/tuerkei', type: 'think-tank', accessDate: '2025-01', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-syria', label: 'Syrien (Militäroperationen)', relationship: 'actor-in' },
      { targetId: 'af-libya-conflict', label: 'Libyen (Intervention)', relationship: 'actor-in' },
      { targetId: 'af-sahel-crisis', label: 'Sahel (Drohnenexporte)', relationship: 'related' },
    ],
    timeline: [
      { date: '2016-08', title: 'Op. Euphrat-Schild', description: 'Einmarsch in Nordsyrien.' },
      { date: '2018-01', title: 'Op. Olivenzweig', description: 'Eroberung Afrins.' },
      { date: '2020-01', title: 'Libyen-Intervention', description: 'Militärische Unterstützung Tripolis.' },
      { date: '2020', title: 'Bayraktar-Erfolge', description: 'TB2 beweist sich in Libyen und Bergkarabach.' },
    ],
    images: [],
    keyFacts: [
      { label: 'NATO-Mitglied seit', value: '1952' },
      { label: 'Militärpersonal', value: '~425.000' },
      { label: 'Bayraktar-Exportländer', value: '>30' },
      { label: 'Militärbasen (extern)', value: '>10' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },
];

// ═══════════════════════════════════════════════════════════════════
// Export all entries
// ═══════════════════════════════════════════════════════════════════

import { africaExtended, mideastExtended } from './knowledgeBaseExtended';

export const KNOWLEDGE_BASE_ENTRIES: KBEntry[] = [...africaEntries, ...mideastEntries, ...africaExtended, ...mideastExtended];

export function getEntriesForRegion(regionId: 'africa' | 'mideast'): KBEntry[] {
  return KNOWLEDGE_BASE_ENTRIES.filter(e => e.region === regionId || e.region === 'both');
}

export function getEntryById(id: string): KBEntry | undefined {
  return KNOWLEDGE_BASE_ENTRIES.find(e => e.id === id);
}

export const KB_CATEGORY_CONFIG: Record<KBCategory, { label: string; labelPlural: string; color: string; icon: string }> = {
  conflict:       { label: 'Konflikt',       labelPlural: 'Konflikte',        color: '#ef4444', icon: '⚔' },
  actor:          { label: 'Akteur',         labelPlural: 'Akteure',          color: '#8b5cf6', icon: '👤' },
  region:         { label: 'Region',         labelPlural: 'Regionen',         color: '#3b82f6', icon: '🗺' },
  historical:     { label: 'Historisch',     labelPlural: 'Historisch',       color: '#f59e0b', icon: '📜' },
  organization:   { label: 'Organisation',   labelPlural: 'Organisationen',   color: '#22c55e', icon: '🏛' },
  infrastructure: { label: 'Infrastruktur',  labelPlural: 'Infrastruktur',    color: '#06b6d4', icon: '🔧' },
  humanitarian:   { label: 'Humanitär',      labelPlural: 'Humanitäre Lage',  color: '#ec4899', icon: '❤' },
};

export const KB_STATUS_CONFIG: Record<KBStatus, { label: string; color: string }> = {
  active:     { label: 'Aktiv',        color: '#ef4444' },
  escalating: { label: 'Eskalierend',  color: '#dc2626' },
  frozen:     { label: 'Eingefroren',  color: '#3b82f6' },
  resolved:   { label: 'Gelöst',       color: '#22c55e' },
  historical: { label: 'Historisch',   color: '#9ca3af' },
};

export const KB_SEVERITY_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'Gering',     color: '#22c55e' },
  2: { label: 'Moderat',    color: '#84cc16' },
  3: { label: 'Erheblich',  color: '#f59e0b' },
  4: { label: 'Hoch',       color: '#f97316' },
  5: { label: 'Kritisch',   color: '#ef4444' },
};
