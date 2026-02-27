// ═══════════════════════════════════════════════════════════════════
// AfKnow / MEKnow — Knowledge Base EXTENDED Data
// Additional entries: more conflicts, actors, historical, organizations
// ═══════════════════════════════════════════════════════════════════

import type { KBEntry } from './knowledgeBase';

// ═══════════════════════════════════════════════════════════════════
// AFRICA — Extended Entries
// ═══════════════════════════════════════════════════════════════════

export const africaExtended: KBEntry[] = [

  // ─── MALI CRISIS (DETAIL) ───
  {
    id: 'af-mali-crisis',
    region: 'africa',
    category: 'conflict',
    title: 'Mali-Krise',
    subtitle: 'Tuareg-Rebellion, Dschihadismus und Militärjunta seit 2012',
    summary: 'Mali ist das Epizentrum der Sahelkrise. Seit 2012 hat das Land zwei Militärputsche, eine französische Intervention, den Einsatz von Wagner-Söldnern und die Expansion dschihadistischer Gruppen erlebt. Die Junta unter Assimi Goïta hat sich von westlichen Partnern abgewandt und kooperiert mit Russland.',
    content: `## Hintergrund

Mali war nach dem demokratischen Übergang von 1991 lange ein Vorbild für Demokratie in Westafrika. Der Zusammenbruch kam 2012 durch eine Kombination aus:
- **Tuareg-Rebellion** im Norden (MNLA, verstärkt durch Rückkehrer aus Libyen)
- **Dschihadistische Übernahme** (AQIM, Ansar Dine, MUJAO kapern die Rebellion)
- **Militärputsch** in Bamako (März 2012)

## Französische Intervention
**Operation Serval** (Januar 2013) stoppte den dschihadistischen Vormarsch auf Bamako. Die Folgemission **Barkhane** (2014–2022) operierte grenzüberschreitend in der gesamten Sahelzone.

## Friedensabkommen von Algier (2015)
Das Abkommen zwischen Regierung und Tuareg-Rebellen wurde nie vollständig umgesetzt. Die Junta hat es 2024 offiziell aufgekündigt.

## Doppelputsch 2020/2021
- **August 2020:** Oberst Assimi Goïta stürzt Präsident IBK
- **Mai 2021:** Goïta setzt Übergangspräsident ab und übernimmt vollständig
- Versprechen von Wahlen wiederholt gebrochen

## Wagner/Afrika-Korps Einsatz
Seit Dezember 2021 sind russische Söldner in Mali präsent. Das **Moura-Massaker** (März 2022) mit >300 zivilen Opfern wurde von UN-Ermittlern dokumentiert.

## Rückeroberung des Nordens (2023–24)
Die malische Armee und Wagner-Kämpfer eroberten 2023 die Tuareg-Hochburg **Kidal** — ein Wendepunkt, der jedoch zu einer Zersplitterung der Rebellengruppen führte.

## Aktuelle Lage
- JNIM kontrolliert weite Teile Zentralmalis
- ISGS operiert im Norden und Osten
- Ethnische Milizen (Dan Na Ambassagou, Dogon-Selbstverteidigung)
- Zivile Bevölkerung zwischen allen Fronten
- >400.000 Binnenvertriebene`,
    status: 'escalating',
    severity: 5,
    tags: ['Mali', 'Junta', 'Goïta', 'Tuareg', 'MNLA', 'Kidal', 'Barkhane', 'Wagner', 'Moura'],
    countryIds: ['ML'],
    parties: ['Mali (Junta/Goïta)', 'JNIM', 'ISGS', 'Wagner/Afrika-Korps', 'MNLA/CSP-PSD', 'MINUSMA (beendet)'],
    startYear: 2012,
    casualties: '>12.000 seit 2012',
    displaced: '~400.000',
    sources: [
      { id: 's1', label: 'ICG – Mali', url: 'https://www.crisisgroup.org/africa/sahel/mali', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'MINUSMA Final Reports', url: 'https://minusma.unmissions.org', type: 'un', accessDate: '2025-01', reliability: 'high' },
      { id: 's3', label: 'OHCHR – Moura Report', url: 'https://www.ohchr.org/en/press-releases/2023/05/mali-report-moura', type: 'un', accessDate: '2025-01', reliability: 'high' },
      { id: 's4', label: 'ACLED Mali Dashboard', url: 'https://acleddata.com/dashboard/#/dashboard', type: 'database', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise', relationship: 'part-of' },
      { targetId: 'af-jnim', label: 'JNIM', relationship: 'actor-in' },
      { targetId: 'af-isgs', label: 'ISGS', relationship: 'actor-in' },
      { targetId: 'af-wagner', label: 'Wagner/Afrika-Korps', relationship: 'actor-in' },
      { targetId: 'af-aes', label: 'Allianz der Sahelstaaten', relationship: 'related' },
      { targetId: 'af-libya-fallout', label: 'Libyen (Waffenfluss)', relationship: 'cause' },
      { targetId: 'af-minusma', label: 'MINUSMA', relationship: 'related' },
    ],
    timeline: [
      { date: '2012-01', title: 'MNLA-Offensive', description: 'Tuareg-Rebellion im Norden beginnt.' },
      { date: '2012-03', title: 'Putsch', description: 'Hauptmann Sanogo stürzt Präsident ATT.' },
      { date: '2012-06', title: 'Dschihadisten übernehmen', description: 'AQIM, Ansar Dine, MUJAO kontrollieren Nordmali.' },
      { date: '2013-01', title: 'Operation Serval', description: 'Frankreich interveniert.' },
      { date: '2013-04', title: 'MINUSMA', description: 'UN-Stabilisierungsmission beginnt.' },
      { date: '2015-06', title: 'Algier-Abkommen', description: 'Friedensvertrag zwischen Regierung und Rebellenkoalition.' },
      { date: '2020-08', title: 'Erster Putsch', description: 'Militär stürzt Präsident IBK.' },
      { date: '2021-05', title: 'Zweiter Putsch', description: 'Goïta übernimmt vollständig.' },
      { date: '2021-12', title: 'Wagner-Ankunft', description: 'Russische Söldner treffen in Bamako ein.' },
      { date: '2022-02', title: 'Frankreich zieht ab', description: 'Ende von Barkhane in Mali.' },
      { date: '2022-03', title: 'Moura-Massaker', description: '>300 Zivilisten getötet.' },
      { date: '2023-06', title: 'MINUSMA-Ende', description: 'UN-Mission beendet Mandat auf Druck der Junta.' },
      { date: '2023-11', title: 'Fall von Kidal', description: 'Armee/Wagner erobert Tuareg-Hochburg.' },
      { date: '2024-01', title: 'Algier-Abkommen gekündigt', description: 'Junta beendet Friedensabkommen.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Bevölkerung', value: '~22 Mio.' },
      { label: 'Putsche seit 2020', value: '2' },
      { label: 'Wagner-Stärke', value: '~1.500' },
      { label: 'JNIM-Kontrolle', value: '~40% des Territoriums' },
      { label: 'MINUSMA-Opfer', value: '281 (tödlichste UN-Mission)' },
    ],
    createdAt: '2025-01-15',
    updatedAt: '2025-02-20',
  },

  // ─── BURKINA FASO CRISIS ───
  {
    id: 'af-burkina-crisis',
    region: 'africa',
    category: 'conflict',
    title: 'Burkina Faso — Sicherheitskrise',
    subtitle: 'Dschihadismus, zwei Putsche und Staatskollaps',
    summary: 'Burkina Faso ist 2024/25 das am stärksten von dschihadistischer Gewalt betroffene Land der Sahelzone. Über 40% des Territoriums stehen unter Kontrolle bewaffneter Gruppen. Die Junta unter Ibrahim Traoré setzt auf Wagner-Söldner und Volksmilizen.',
    content: `## Hintergrund

Burkina Faso galt lange als relativ stabil. Seit 2016 verschlechterte sich die Sicherheitslage rapide durch ein Übergreifen der Gewalt aus Mali. Beide dschihadistischen Hauptgruppen — **JNIM** und **ISGS** — operieren massiv im Land.

## Doppelputsch 2022
- **Januar 2022:** Lt. Col. Paul-Henri Damiba stürzt Präsident Kaboré
- **September 2022:** Hauptmann Ibrahim Traoré (34 Jahre) stürzt Damiba

## Strategie der Junta
- **Volontaires pour la Défense de la Patrie (VDP):** Bewaffnung von Zivilmilizen
- Wagner/Afrika-Korps seit 2023 für Regimeschutz
- Massenmobilisierung der Jugend
- Anti-französische/pro-russische Narrative

## Humanitäre Lage
- **>2 Millionen** Binnenvertriebene (10% der Bevölkerung!)
- >6.000 Schulen geschlossen
- Ernährungskrise in blockierten Städten
- Systematische Massentötungen durch alle Seiten

## Massaker
- **Karma (2023):** >150 Zivilisten durch Armee/VDP getötet
- **Zaongo (2024):** >200 Zivilisten bei mutmaßlichem Luftangriff
- Regelmäßige JNIM/ISGS-Angriffe auf Dörfer`,
    status: 'escalating',
    severity: 5,
    tags: ['Burkina Faso', 'Traoré', 'VDP', 'JNIM', 'ISGS', 'Putsch', 'Wagner'],
    countryIds: ['BF'],
    parties: ['Burkina Faso (Junta/Traoré)', 'JNIM', 'ISGS', 'VDP-Milizen', 'Wagner'],
    startYear: 2016,
    casualties: '>10.000 seit 2016',
    displaced: '>2 Mio.',
    sources: [
      { id: 's1', label: 'ICG – Burkina Faso', url: 'https://www.crisisgroup.org/africa/sahel/burkina-faso', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'ACLED Burkina Faso', url: 'https://acleddata.com', type: 'database', accessDate: '2025-02', reliability: 'high' },
      { id: 's3', label: 'HRW – Burkina Faso', url: 'https://www.hrw.org/africa/burkina-faso', type: 'ngo', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise', relationship: 'part-of' },
      { targetId: 'af-jnim', label: 'JNIM', relationship: 'actor-in' },
      { targetId: 'af-isgs', label: 'ISGS', relationship: 'actor-in' },
      { targetId: 'af-wagner', label: 'Wagner', relationship: 'actor-in' },
      { targetId: 'af-aes', label: 'AES', relationship: 'related' },
    ],
    timeline: [
      { date: '2016', title: 'Erste Angriffe', description: 'Dschihadistische Anschläge im Norden.' },
      { date: '2019', title: 'Eskalation', description: 'Gewalt breitet sich auf Zentrum und Osten aus.' },
      { date: '2022-01', title: 'Erster Putsch', description: 'Damiba stürzt Kaboré.' },
      { date: '2022-09', title: 'Zweiter Putsch', description: 'Traoré stürzt Damiba.' },
      { date: '2023', title: 'Wagner-Ankunft', description: 'Russische Söldner für Regimeschutz.' },
      { date: '2024', title: '40% unter Kontrolle bewaffneter Gruppen', description: 'JNIM und ISGS kontrollieren weite Teile.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Bevölkerung', value: '~22 Mio.' },
      { label: 'Vertriebene', value: '>2 Mio. (10%)' },
      { label: 'Terroropfer 2023', value: '>8.000' },
      { label: 'Geschlossene Schulen', value: '>6.000' },
      { label: 'Bewaffnete Gruppen', value: 'JNIM, ISGS + VDP' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── ALLIANZ DER SAHELSTAATEN (AES) ───
  {
    id: 'af-aes',
    region: 'africa',
    category: 'organization',
    title: 'AES — Allianz der Sahelstaaten',
    subtitle: 'Militärbündnis der drei Sahel-Juntas gegen ECOWAS und den Westen',
    summary: 'Die AES wurde im September 2023 von den Militärjuntas Malis, Burkina Fasos und Nigers als Verteidigungs- und Wirtschaftsbündnis gegründet. Sie repräsentiert einen tektonischen Bruch in der westafrikanischen Sicherheitsarchitektur.',
    content: `## Gründung und Motivation

Die **Allianz der Sahelstaaten** (Alliance des États du Sahel) wurde am 16. September 2023 in Bamako gegründet als:
- **Verteidigungsbündnis:** Gegenseitige Beistandsklausel
- **Politische Allianz:** Gegen ECOWAS-Interventionsdrohungen
- **Anti-westliches Signal:** Demonstration der Souveränität

## Mitglieder
| Land | Junta-Chef | Putsch |
|------|-----------|--------|
| **Mali** | Col. Assimi Goïta | 2020/2021 |
| **Burkina Faso** | Capt. Ibrahim Traoré | 2022 |
| **Niger** | Gen. Abdourahamane Tchiani | 2023 |

## ECOWAS-Austritt
Am 28. Januar 2024 kündigten alle drei Staaten ihren Austritt aus der ECOWAS an (wirksam Januar 2025). Dies betrifft:
- **70 Mio. Menschen** in den drei Ländern
- Gemeinsame Währung CFA-Franc (Ablösung diskutiert)
- Freizügigkeit von Personen und Waren

## Konföderationsplan
Die drei Juntas planen eine tiefere Integration bis hin zu einer **Konföderation** mit gemeinsamer:
- Verteidigungsstruktur
- Entwicklungsbank
- Investitionsfonds
- Eventuell eigener Währung

## Externe Partner
- **Russland:** Militärkooperation, Wagner/Afrika-Korps
- **Türkei:** Drohnenlieferungen
- **Iran:** Wachsende Kontakte
- **China:** Wirtschaftliche Zusammenarbeit`,
    status: 'active',
    severity: 3,
    tags: ['AES', 'Sahel', 'ECOWAS', 'Junta', 'Konföderation', 'CFA-Franc'],
    countryIds: ['ML', 'BF', 'NE'],
    startYear: 2023,
    sources: [
      { id: 's1', label: 'AES – Charte du Liptako-Gourma', url: 'https://www.diplomatie.gouv.ml/aes', type: 'government', accessDate: '2025-02', reliability: 'medium' },
      { id: 's2', label: 'ACSS – Alliance of Sahel States', url: 'https://africacenter.org/spotlight/alliance-of-sahel-states/', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise', relationship: 'effect' },
      { targetId: 'af-ecowas', label: 'ECOWAS (Gegenstück)', relationship: 'opposed' },
      { targetId: 'af-mali-crisis', label: 'Mali', relationship: 'part-of' },
      { targetId: 'af-burkina-crisis', label: 'Burkina Faso', relationship: 'part-of' },
      { targetId: 'af-niger-crisis', label: 'Niger', relationship: 'part-of' },
    ],
    timeline: [
      { date: '2023-07', title: 'Niger-Putsch', description: 'Dritter Sahel-Putsch löst ECOWAS-Krise aus.' },
      { date: '2023-09-16', title: 'AES-Gründung', description: 'Charta der Allianz in Bamako unterzeichnet.' },
      { date: '2024-01-28', title: 'ECOWAS-Austritt', description: 'Alle drei Staaten kündigen Austritt an.' },
      { date: '2024-07', title: 'Konföderationsplan', description: 'AES-Gipfel beschließt vertiefte Integration.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Gründung', value: '16. September 2023' },
      { label: 'Mitglieder', value: '3 (Mali, BF, Niger)' },
      { label: 'Bevölkerung', value: '~70 Mio.' },
      { label: 'Fläche', value: '~3,2 Mio. km²' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── NIGER CRISIS ───
  {
    id: 'af-niger-crisis',
    region: 'africa',
    category: 'conflict',
    title: 'Niger — Putsch und Sicherheitskrise',
    subtitle: 'Militärputsch 2023, US-Abzug und dschihadistische Bedrohung',
    summary: 'Niger galt als letzter demokratischer Partner des Westens in der Sahelzone, bis der Putsch vom Juli 2023 die geopolitische Landkarte der Region grundlegend veränderte.',
    content: `## Putsch vom 26. Juli 2023

Die Präsidialgarde unter **General Abdourahamane Tchiani** stürzte den demokratisch gewählten Präsidenten **Mohamed Bazoum**. Gründe:
- Unzufriedenheit über Sicherheitslage
- Innermilitärische Rivalitäten
- Sorge vor geplanter Umstrukturierung der Garde

## Internationale Reaktion
- **ECOWAS** drohte mit militärischer Intervention
- **Frankreich** zog Truppen ab (1.500 Soldaten bis Ende 2023)
- **USA** zog Truppen ab (Air Base 201, Agadez) bis 2024
- **Russland** füllte das Vakuum (Militärberater, Wagner)

## Sicherheitslage
Niger ist von mehreren Seiten bedroht:
- **Westen (Tillabéri):** JNIM und ISGS
- **Südosten (Diffa):** Boko Haram/ISWAP
- **Norden:** Schmuggel, Migration, libysche Instabilität

## Strategische Bedeutung
- **Uran:** Niger liefert ~5% des weltweiten Urans (Areva/Orano-Minen)
- **Migration:** Zentrale Transitroute nach Libyen/Europa
- **Militärbasen:** Ehem. US Air Base 201 (Drohnen), franz. Basis`,
    status: 'active',
    severity: 4,
    tags: ['Niger', 'Putsch', 'Tchiani', 'Bazoum', 'Uran', 'Air Base 201', 'ECOWAS'],
    countryIds: ['NE'],
    parties: ['Niger (Junta/Tchiani)', 'JNIM', 'ISGS', 'Boko Haram', 'ECOWAS', 'Frankreich', 'USA', 'Russland'],
    startYear: 2023,
    sources: [
      { id: 's1', label: 'ICG – Niger Coup', url: 'https://www.crisisgroup.org/africa/sahel/niger', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'Reuters – Niger Timeline', url: 'https://www.reuters.com/world/africa/niger/', type: 'news', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise', relationship: 'part-of' },
      { targetId: 'af-aes', label: 'AES', relationship: 'related' },
      { targetId: 'af-ecowas', label: 'ECOWAS', relationship: 'related' },
      { targetId: 'af-lake-chad', label: 'Tschadsee-Krise', relationship: 'related' },
    ],
    timeline: [
      { date: '2021-02', title: 'Bazoum gewählt', description: 'Erste friedliche Machtübergabe in Nigers Geschichte.' },
      { date: '2023-07-26', title: 'Putsch', description: 'Garde stürzt Bazoum, Tchiani übernimmt.' },
      { date: '2023-08', title: 'ECOWAS-Drohung', description: 'Interventionsdrohung, Standoff.' },
      { date: '2023-09', title: 'AES-Gründung', description: 'Niger tritt AES bei.' },
      { date: '2023-12', title: 'Französischer Abzug', description: 'Letzte franz. Soldaten verlassen Niger.' },
      { date: '2024-04', title: 'US-Abzug', description: 'Pentagon kündigt Ende der Militärpräsenz an.' },
      { date: '2024-07', title: 'Russische Militärberater', description: 'Erste russische Ausbilder in Niamey.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Bevölkerung', value: '~26 Mio.' },
      { label: 'Uranproduktion', value: '~5% weltweit' },
      { label: 'HDI-Rang', value: 'Letzter (189/189)' },
      { label: 'Fruchtbarkeitsrate', value: '7,0 (höchste weltweit)' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── DARFUR HISTORICAL ───
  {
    id: 'af-darfur-history',
    region: 'africa',
    category: 'historical',
    title: 'Darfur-Konflikt (2003–2020)',
    subtitle: 'Genozid, Janjaweed und die Wurzeln der heutigen Sudan-Krise',
    summary: 'Der Darfur-Konflikt ab 2003 — oft als erster Genozid des 21. Jahrhunderts bezeichnet — ist die direkte Vorgeschichte des heutigen Sudan-Kriegs. Die Janjaweed-Milizen, Vorläufer der RSF, wurden vom Bashir-Regime gegen die nicht-arabische Bevölkerung eingesetzt.',
    content: `## Hintergrund

Darfur, eine Region im Westen des Sudan, erlebte ab 2003 einen bewaffneten Aufstand nicht-arabischer Gruppen (SLA, JEM) gegen die Marginalisierung durch die Zentralregierung in Khartum.

## Genozid
Präsident **Omar al-Bashir** reagierte mit einer Kampagne ethnischer Säuberung:
- **Janjaweed-Milizen** (arabische Reitermilizen) verübten systematische Massaker
- Dörfer der Fur, Masalit und Zaghawa-Völker zerstört
- Massenvergewaltigungen als Kriegswaffe
- **~300.000 Tote**, **2,5 Mio. Vertriebene**

## ICC-Haftbefehl
2009 erließ der **Internationale Strafgerichtshof** einen Haftbefehl gegen Bashir wegen Völkermordes — der erste gegen einen amtierenden Staatschef.

## UNAMID
Die **AU/UN Hybrid Mission in Darfur** (2007–2020) war eine der größten Friedensmissionen der Geschichte.

## Verbindung zum heutigen Krieg
Die **RSF** unter Hemedti ist die direkte Nachfolgeorganisation der Janjaweed. Die ethnischen Säuberungen in West-Darfur 2023/24 folgen dem gleichen Muster wie 2003.`,
    status: 'historical',
    severity: 5,
    tags: ['Darfur', 'Genozid', 'Bashir', 'Janjaweed', 'ICC', 'UNAMID', 'RSF'],
    countryIds: ['SD'],
    parties: ['Bashir-Regime', 'Janjaweed', 'SLA', 'JEM', 'UNAMID'],
    startYear: 2003,
    endYear: 2020,
    casualties: '~300.000',
    displaced: '2,5 Mio.',
    sources: [
      { id: 's1', label: 'ICC – Bashir Case', url: 'https://www.icc-cpi.int/darfur/albashir', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'UN – Darfur Report', url: 'https://www.un.org/en/preventgenocide/adviser/darfur.shtml', type: 'un', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sudan-war', label: 'Sudan-Krieg 2023 (Nachfolger)', relationship: 'predecessor' },
      { targetId: 'af-au', label: 'Afrikanische Union (UNAMID)', relationship: 'related' },
    ],
    timeline: [
      { date: '2003-02', title: 'Aufstand beginnt', description: 'SLA und JEM greifen Regierungsziele an.' },
      { date: '2003-04', title: 'Janjaweed-Kampagne', description: 'Systematische Angriffe auf Dörfer.' },
      { date: '2004', title: 'Internationale Aufmerksamkeit', description: 'USA bezeichnen Lage als Genozid.' },
      { date: '2007', title: 'UNAMID', description: 'AU/UN Hybridmission beginnt.' },
      { date: '2009-03', title: 'ICC-Haftbefehl', description: 'Haftbefehl gegen Bashir.' },
      { date: '2019', title: 'Sturz Bashirs', description: 'Bashir durch Militär entmachtet.' },
      { date: '2020-12', title: 'UNAMID-Ende', description: 'Mission beendet.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Tote', value: '~300.000' },
      { label: 'Vertriebene', value: '2,5 Mio.' },
      { label: 'ICC-Status', value: 'Haftbefehl Bashir' },
      { label: 'Dauer', value: '2003–2020' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── AFRIKANISCHE UNION ───
  {
    id: 'af-au',
    region: 'africa',
    category: 'organization',
    title: 'Afrikanische Union (AU)',
    subtitle: 'Kontinentale Organisation mit 55 Mitgliedstaaten',
    summary: 'Die AU ist die wichtigste gesamtafrikanische Organisation. Sie spielt eine zentrale Rolle in Friedenssicherung, Mediationsbemühungen und der Agenda 2063 für die wirtschaftliche Integration des Kontinents.',
    content: `## Überblick

Die **Afrikanische Union** wurde 2002 als Nachfolgerin der OAU (Organisation für Afrikanische Einheit, 1963) gegründet. Sitz: **Addis Abeba, Äthiopien**.

## Strukturen
- **Versammlung:** Staats- und Regierungschefs (höchstes Organ)
- **AU-Kommission:** Exekutivorgan (Vorsitzender: Moussa Faki Mahamat)
- **Friedens- und Sicherheitsrat (PSC):** 15 Mitglieder
- **African Standby Force (ASF):** Geplante Eingreiftruppe

## Friedensmissionen
- **AMISOM/ATMIS** (Somalia): Größte AU-Mission
- **UNAMID** (Darfur): AU/UN Hybrid
- **MISCA** (ZAR): 2013-2014
- **SAMIM** (Mosambik): SADC-geführt
- **G5 Sahel Joint Force**: AU-unterstützt

## Herausforderungen
- Finanzierung: Abhängigkeit von externen Gebern (EU, USA, China)
- "Unconstitutional Changes of Government": Putsch-Welle schwächt Norm
- Prinzip "African Solutions for African Problems" vs. Realität
- China hat AU-Hauptquartier gebaut (Spionagevorwürfe 2018)

## Agenda 2063
Langfristige Vision für:
- Kontinentale Freihandelszone (AfCFTA)
- Freier Personenverkehr
- Gemeinsame Verteidigung
- Infrastrukturintegration`,
    status: 'active',
    severity: 2,
    tags: ['AU', 'Afrikanische Union', 'Agenda 2063', 'AfCFTA', 'Friedensmission', 'Addis Abeba'],
    countryIds: ['ET'],
    startYear: 2002,
    sources: [
      { id: 's1', label: 'AU Official', url: 'https://au.int', type: 'government', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'ISS Africa – AU Analysis', url: 'https://issafrica.org/topics/african-union', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-ecowas', label: 'ECOWAS', relationship: 'related' },
      { targetId: 'af-darfur-history', label: 'UNAMID', relationship: 'related' },
      { targetId: 'af-somalia', label: 'AMISOM/ATMIS', relationship: 'related' },
    ],
    timeline: [
      { date: '1963', title: 'OAU gegründet', description: 'Organisation für Afrikanische Einheit.' },
      { date: '2002', title: 'AU gegründet', description: 'Nachfolgerin der OAU.' },
      { date: '2018', title: 'AfCFTA beschlossen', description: 'Afrikanische Freihandelszone.' },
      { date: '2021-01', title: 'AfCFTA Handel beginnt', description: 'Start des freien Handels.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Mitglieder', value: '55' },
      { label: 'Sitz', value: 'Addis Abeba' },
      { label: 'Budget', value: '~$650 Mio.' },
      { label: 'Friedensmissionen', value: '5+ aktiv' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── KATIBA MACINA ───
  {
    id: 'af-katiba-macina',
    region: 'africa',
    category: 'actor',
    title: 'Katiba Macina',
    subtitle: 'Fulani-dschihadistische Gruppe unter Amadou Koufa',
    summary: 'Die Katiba Macina (Teil von JNIM) unter dem Fulani-Prediger Amadou Koufa ist für die massive Expansion des Dschihadismus in Zentralmali und Burkina Faso verantwortlich. Sie instrumentalisiert ethnische Spannungen zwischen Fulani und sesshaften Bauerngemeinschaften.',
    content: `## Hintergrund

**Amadou Koufa** (Amadou Diallo), ein radikaler Fulani-Prediger, gründete die Katiba Macina um 2015. Die Gruppe rekrutiert massiv unter marginalisierten Fulani-Hirtennomaden.

## Strategie
- **Governance:** Scharia-Gerichtsbarkeit in kontrollierten Gebieten
- **Ethnische Mobilisierung:** Fulani-Grievances gegen Dogon/Bambara
- **Parallelstaat:** Steuern, Justiz, Schutzversprechen
- **Taktik:** IEDs, Hinterhalte, gezielte Tötungen

## Operationsgebiet
- **Mopti-Region** (Mali): Kerngebiet
- **Ségou-Region** (Mali)
- **Nord-Burkina Faso:** Massive Expansion
- Zunehmend: Nordsüd-Korridor in Richtung Golf von Guinea

## Ethnische Dimension
Die Gewalt hat eine gefährliche ethnische Dynamik:
- Fulani werden pauschal als Dschihadisten verdächtigt
- Dogon-Selbstverteidigungsmilizen (Dan Na Ambassagou) verüben Vergeltungsmassaker
- Massaker von Ogossagou (2019): >160 Fulani-Zivilisten getötet`,
    status: 'active',
    severity: 4,
    tags: ['Katiba Macina', 'Amadou Koufa', 'Fulani', 'JNIM', 'Mopti', 'Ethnischer Konflikt'],
    countryIds: ['ML', 'BF'],
    parties: ['Amadou Koufa', 'Fulani-Kämpfer', 'JNIM (Dach)'],
    startYear: 2015,
    sources: [
      { id: 's1', label: 'ICG – Katiba Macina', url: 'https://www.crisisgroup.org/africa/sahel/mali/centre-du-mali', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'Combating Terrorism Center – Koufa Profile', url: 'https://ctc.westpoint.edu/katiba-macina/', type: 'academic', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-jnim', label: 'JNIM (Dachorganisation)', relationship: 'part-of' },
      { targetId: 'af-mali-crisis', label: 'Mali-Krise', relationship: 'actor-in' },
      { targetId: 'af-burkina-crisis', label: 'Burkina Faso', relationship: 'actor-in' },
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise', relationship: 'part-of' },
    ],
    timeline: [
      { date: '2015', title: 'Gründung', description: 'Koufa gründet Katiba Macina.' },
      { date: '2017', title: 'Eingliederung in JNIM', description: 'Wird Teil der JNIM-Dachorganisation.' },
      { date: '2018-11', title: '"Tod" Koufas', description: 'Frankreich meldet Koufas Tod — er taucht später wieder auf.' },
      { date: '2019-03', title: 'Ogossagou-Massaker', description: '>160 Fulani von Dogon-Milizen getötet.' },
      { date: '2022', title: 'Expansion Burkina Faso', description: 'Massive Ausweitung nach Süden.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Anführer', value: 'Amadou Koufa' },
      { label: 'Stärke', value: '2.000–4.000' },
      { label: 'Affiliiert', value: 'JNIM / Al-Qaida' },
      { label: 'Kerngebiet', value: 'Mopti, Ségou' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── GREAT LAKES HISTORY ───
  {
    id: 'af-great-lakes-history',
    region: 'africa',
    category: 'historical',
    title: 'Große-Seen-Region — Historischer Kontext',
    subtitle: 'Genozid, Kongokriege und die Wurzeln der heutigen Konflikte',
    summary: 'Die Große-Seen-Region (DR Kongo, Ruanda, Burundi, Uganda) ist seit dem Ruanda-Genozid 1994 und den folgenden Kongokriegen ein Zentrum der Instabilität. Die heutigen Konflikte im Ostkongo sind direkte Folgen dieser Geschichte.',
    content: `## Ruanda-Genozid (1994)

In 100 Tagen (April–Juli 1994) wurden **~800.000 Tutsi und moderate Hutu** von Hutu-Extremisten ermordet. Die internationale Gemeinschaft versagte vollständig.

### Vorgeschichte
- Belgische Kolonialpolitik verstärkte Hutu-Tutsi-Spaltung
- Hutu-Revolution 1959
- Wiederholte Pogrome und Fluchtwellen

### Folgen
- **RPF** (Ruandische Patriotische Front) unter Paul Kagame beendet Genozid
- ~2 Mio. Hutu fliehen in den Osten Kongos (ex-Zaïre)
- **Interahamwe-Milizen** und ex-FAR rüsten sich im Kongo neu auf

## Erster Kongokrieg (1996–97)
- Ruanda und Uganda unterstützen **Laurent-Désiré Kabila** gegen Mobutu
- Kabila marschiert auf Kinshasa, Mobutu wird gestürzt
- Zaïre wird zu DR Kongo

## Zweiter Kongokrieg (1998–2003)
- "Afrikas Weltkrieg" — **9 Staaten** beteiligt
- Ruanda und Uganda gegen Kabila
- Angola, Simbabwe, Namibia für Kabila
- **>5 Mio. Tote** (direkt und indirekt)
- Massiver Ressourcenraub

## Erbe
- **FDLR** (Forces Démocratiques de Libération du Rwanda): Hutu-Miliz im Ostkongo
- **M23:** Von Ruanda unterstützte Tutsi-Rebellen
- Ruandas Sicherheitsdilemma vs. kongolesische Souveränität
- Unverarbeitetes Trauma in der gesamten Region`,
    status: 'historical',
    severity: 5,
    tags: ['Genozid', 'Ruanda', 'Kongo', 'Große Seen', 'Kagame', 'Mobutu', 'FDLR', 'Interahamwe'],
    countryIds: ['RW', 'CD', 'BI', 'UG'],
    parties: ['RPF', 'Interahamwe', 'FDLR', 'Kabila', 'Mobutu', 'Ruanda', 'Uganda', 'Angola'],
    startYear: 1994,
    endYear: 2003,
    casualties: '>6 Mio. (gesamt 1994–2003)',
    displaced: '~4 Mio.',
    sources: [
      { id: 's1', label: 'UN – Rwanda Genocide', url: 'https://www.un.org/en/preventgenocide/rwanda/', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'Mapping Report DRC', url: 'https://www.ohchr.org/en/countries/africa-region/drc-mapping-report', type: 'un', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-drc-east', label: 'Ostkongo-Konflikt (Nachfolger)', relationship: 'cause' },
    ],
    timeline: [
      { date: '1994-04-06', title: 'Flugzeugabschuss', description: 'Präsidenten Ruandas und Burundis getötet.' },
      { date: '1994-04-07', title: 'Genozid beginnt', description: '100 Tage systematischer Mord.' },
      { date: '1994-07', title: 'RPF beendet Genozid', description: 'Kagame übernimmt Macht.' },
      { date: '1996-10', title: 'Erster Kongokrieg', description: 'Kabila marschiert auf Kinshasa.' },
      { date: '1997-05', title: 'Mobutu gestürzt', description: 'Ende von Zaïre.' },
      { date: '1998-08', title: 'Zweiter Kongokrieg', description: 'Beginn von "Afrikas Weltkrieg".' },
      { date: '2003', title: 'Friedensabkommen', description: 'Sun City Accord, Übergangsregierung.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Genozid-Opfer', value: '~800.000' },
      { label: 'Kongokriege-Opfer', value: '>5 Mio.' },
      { label: 'Beteiligte Staaten', value: '9 (2. Kongokrieg)' },
      { label: 'Dauer', value: '1994–2003' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── NIGERIA MULTI-CRISIS ───
  {
    id: 'af-nigeria-crisis',
    region: 'africa',
    category: 'conflict',
    title: 'Nigeria — Multiple Sicherheitskrisen',
    subtitle: 'Boko Haram, Banditen, Biafra-Separatismus und Hirten-Farmer-Konflikte',
    summary: 'Nigeria, Afrikas bevölkerungsreichstes Land, leidet gleichzeitig unter mehreren Sicherheitskrisen: Boko Haram im Nordosten, Banditentum im Nordwesten, Separatismus im Südosten und Hirten-Farmer-Konflikten im Mittelgürtel.',
    content: `## Übersicht der Krisenregionen

### 1. Nordosten: Boko Haram/ISWAP
Dschihadistischer Aufstand seit 2009, >40.000 Tote, >2 Mio. Vertriebene.

### 2. Nordwesten: Banditentum
**"Banditry"** — bewaffnete Gruppen verüben Massenentführungen, Lösegelderpressung und Dorfüberfälle. Besonders betroffen: Zamfara, Kaduna, Katsina, Niger State.
- >10.000 Tote 2021–2024
- Massenentführungen von Schülern (Kaduna, Zamfara)
- Verbindungen zu Fulani-Milizen und zunehmende Islamisierung

### 3. Mittelgürtel: Hirten-Farmer-Konflikte
Konflikte zwischen Fulani-Hirten und Bauerngemeinschaften um Land und Wasser:
- Klimawandel treibt Hirten nach Süden
- >10.000 Tote seit 2010
- Ethnische und religiöse Dimension (Muslim-Fulani vs. christliche Bauern)

### 4. Südosten: IPOB/Biafra
Die **Indigenous People of Biafra (IPOB)** unter Nnamdi Kanu fordern die Unabhängigkeit:
- ESN (Eastern Security Network): Bewaffneter Arm
- "Sit-at-home"-Streiks lähmen Wirtschaft
- Erinnerung an Biafra-Krieg (1967–70, >1 Mio. Tote)

### 5. Niger-Delta: Ölpiraten und Milizen
Militante Gruppen (MEND, Niger Delta Avengers) greifen Ölanlagen an.

## Wirtschaftliche Dimension
Nigeria ist Afrikas größte Volkswirtschaft, aber:
- >40% unter Armutsgrenze
- Massive Jugendarbeitslosigkeit
- Naira-Krise, Inflation >30%
- Abwanderung ("Japa"-Phänomen)`,
    status: 'active',
    severity: 4,
    tags: ['Nigeria', 'Boko Haram', 'Banditen', 'IPOB', 'Biafra', 'Fulani', 'Niger-Delta', 'Öl'],
    countryIds: ['NG'],
    parties: ['Nigeria (Tinubu)', 'Boko Haram', 'ISWAP', 'Banditen', 'IPOB/ESN', 'Fulani-Milizen'],
    startYear: 2009,
    casualties: '>60.000 (alle Konflikte)',
    displaced: '>3 Mio.',
    sources: [
      { id: 's1', label: 'ICG – Nigeria', url: 'https://www.crisisgroup.org/africa/west-africa/nigeria', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'Nigeria Security Tracker (CFR)', url: 'https://www.cfr.org/nigeria/nigeria-security-tracker', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-lake-chad', label: 'Tschadsee-Krise', relationship: 'related' },
      { targetId: 'af-ecowas', label: 'ECOWAS (Nigeria ist Führungsmacht)', relationship: 'related' },
    ],
    timeline: [
      { date: '1967-70', title: 'Biafra-Krieg', description: 'Sezessionskrieg, >1 Mio. Tote.' },
      { date: '2009', title: 'Boko Haram Aufstand', description: 'Beginn der Insurgency.' },
      { date: '2014', title: 'Chibok-Entführung', description: '276 Mädchen entführt.' },
      { date: '2019', title: 'Banditentum eskaliert', description: 'Nordwesten wird neue Krisenregion.' },
      { date: '2020', title: 'Lekki-Massaker', description: '#EndSARS-Proteste, Soldaten schießen auf Demonstranten.' },
      { date: '2023-02', title: 'Wahl Tinubu', description: 'Bola Tinubu wird Präsident.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Bevölkerung', value: '~230 Mio.' },
      { label: 'BIP', value: '>$450 Mrd.' },
      { label: 'Ölförderung', value: '~1,5 Mio. b/d' },
      { label: 'Simultane Konflikte', value: '5+' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── CENTRAL AFRICAN REPUBLIC ───
  {
    id: 'af-car-crisis',
    region: 'africa',
    category: 'conflict',
    title: 'Zentralafrikanische Republik (ZAR)',
    subtitle: 'Chronische Instabilität, bewaffnete Gruppen und Wagner-Präsenz',
    summary: 'Die ZAR ist seit 2013 in einem Bürgerkrieg zwischen der Regierung und einer Vielzahl bewaffneter Gruppen. Wagner/Afrika-Korps ist seit 2018 präsent und hat die Sicherheitslage nur oberflächlich stabilisiert — unter massiven Menschenrechtsverletzungen.',
    content: `## Hintergrund

Die ZAR leidet seit Jahrzehnten unter politischer Instabilität, Coups und bewaffneten Konflikten. 2013 stürzte die Séléka-Koalition (muslimisch) Präsident Bozizé, woraufhin Anti-Balaka-Milizen (christlich/animistisch) einen Rachefeldzug begannen.

## Aktuelle Lage
- **Regierung Touadéra:** Von Wagner gestützt, kontrolliert Hauptstadt und einige Provinzen
- **CPC (Coalition des Patriotes pour le Changement):** Rebellenallianz, kontrolliert >60% des Territoriums
- **Wagner/Afrika-Korps:** ~2.000 Söldner, massive Menschenrechtsverletzungen
- **MINUSCA:** UN-Mission mit ~15.000 Personal

## Ressourcen
- Gold, Diamanten, Uran
- Wagner kontrolliert Minen als Bezahlung
- Holzeinschlag

## Humanitäre Lage
- >3 Mio. auf humanitäre Hilfe angewiesen (über Hälfte der Bevölkerung!)
- >700.000 Binnenvertriebene
- >700.000 Flüchtlinge in Nachbarländern`,
    status: 'active',
    severity: 4,
    tags: ['ZAR', 'Wagner', 'Séléka', 'Anti-Balaka', 'MINUSCA', 'Diamanten', 'Touadéra'],
    countryIds: ['CF'],
    parties: ['Regierung (Touadéra)', 'CPC', 'Wagner/Afrika-Korps', 'ex-Séléka', 'Anti-Balaka', 'MINUSCA'],
    startYear: 2013,
    casualties: '>10.000',
    displaced: '>1,4 Mio.',
    sources: [
      { id: 's1', label: 'ICG – CAR', url: 'https://www.crisisgroup.org/africa/central-africa/central-african-republic', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'MINUSCA', url: 'https://minusca.unmissions.org', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's3', label: 'The Sentry – Wagner in CAR', url: 'https://thesentry.org/reports/car-wagner/', type: 'ngo', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-wagner', label: 'Wagner/Afrika-Korps', relationship: 'actor-in' },
    ],
    timeline: [
      { date: '2013-03', title: 'Séléka-Coup', description: 'Séléka stürzt Bozizé.' },
      { date: '2013-12', title: 'Anti-Balaka-Gewalt', description: 'Religiöse Vergeltungsgewalt eskaliert.' },
      { date: '2014', title: 'MINUSCA', description: 'UN-Friedensmission beginnt.' },
      { date: '2018', title: 'Wagner-Ankunft', description: 'Erste russische Söldner in Bangui.' },
      { date: '2020-12', title: 'CPC-Offensive', description: 'Rebellen marschieren auf Bangui.' },
      { date: '2021', title: 'Wagner stoppt Offensive', description: 'Söldner sichern Hauptstadt.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Bevölkerung', value: '~5,5 Mio.' },
      { label: 'HDI-Rang', value: '188/189' },
      { label: 'Wagner-Stärke', value: '~2.000' },
      { label: 'Auf Hilfe angewiesen', value: '>3 Mio.' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── LIBYA FALLOUT ───
  {
    id: 'af-libya-fallout',
    region: 'africa',
    category: 'historical',
    title: 'Libyens Zusammenbruch — Folgen für Afrika',
    subtitle: 'Wie der Sturz Gaddafis die Sahelzone destabilisierte',
    summary: 'Der NATO-gestützte Sturz Muammar Gaddafis 2011 setzte massive Waffenströme und Kämpfer frei, die die Sahelzone destabilisierten. Libyens Zusammenbruch gilt als Initialzündung der Sahelkrise.',
    content: `## Waffenfluss

Gaddafis Waffenarsenale — eines der größten in Afrika — wurden nach seinem Sturz geplündert:
- **MANPADS** (Boden-Luft-Raketen): ~20.000 ungesichert
- Schwere Waffen, Munition, Sprengstoff
- Fahrzeuge, Kommunikationsausrüstung

Diese Waffen flossen in:
- **Mali** (Tuareg/MNLA, AQIM, Ansar Dine)
- **Niger, Tschad, Sudan**
- **Gaza** (Hamas)
- **Sinai** (Ansar Bayt al-Maqdis)

## Kämpfer-Rückkehr

Tausende Tuareg, die in Gaddafis Armee gedient hatten, kehrten nach Mali und Niger zurück — oft schwer bewaffnet und kampferfahren. Sie bildeten das Rückgrat der MNLA-Rebellion 2012.

## Migrationsrouten

Libyens Zusammenbruch öffnete die zentrale Mittelmeerroute:
- Schleusernetzwerke zwischen Subsahara-Afrika und Europa
- Schwerste Menschenrechtsverletzungen in libyschen Lagern
- >20.000 Tote im Mittelmeer seit 2014

## Gaddafis Afrika-Politik
Gaddafi war ein zentraler Akteur in Afrika:
- Finanzierung von Rebellenbewegungen und Regierungen
- Afrikanische Union: Gaddafi war treibende Kraft
- Stabilisierender Faktor für Tuareg-Gemeinschaften`,
    status: 'historical',
    severity: 4,
    tags: ['Libyen', 'Gaddafi', 'Waffenfluss', 'Sahel', 'MANPADS', 'Tuareg', 'Migration'],
    countryIds: ['LY', 'ML', 'NE', 'TD'],
    startYear: 2011,
    sources: [
      { id: 's1', label: 'UN Panel of Experts on Libya', url: 'https://www.un.org/securitycouncil/sanctions/1970/panel-of-experts', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'Small Arms Survey – Libya', url: 'https://www.smallarmssurvey.org/region/libya', type: 'academic', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise (Folge)', relationship: 'cause' },
      { targetId: 'af-mali-crisis', label: 'Mali-Krise (Folge)', relationship: 'cause' },
      { targetId: 'af-libya-conflict', label: 'Libyen-Konflikt', relationship: 'related' },
    ],
    timeline: [
      { date: '2011-02', title: 'Aufstand in Libyen', description: 'Arabischer Frühling erreicht Libyen.' },
      { date: '2011-03', title: 'NATO-Intervention', description: 'Luftangriffe auf Gaddafi-Truppen.' },
      { date: '2011-10', title: 'Tod Gaddafis', description: 'Gaddafi in Sirte getötet.' },
      { date: '2011-12', title: 'Waffenplünderung', description: 'Massive Arsenale werden geplündert.' },
      { date: '2012-01', title: 'Tuareg-Kämpfer kehren zurück', description: 'Bewaffnete Ex-Soldaten strömen in die Sahelzone.' },
    ],
    images: [],
    keyFacts: [
      { label: 'MANPADS unkontrolliert', value: '~20.000' },
      { label: 'Tuareg-Rückkehrer', value: 'Tausende' },
      { label: 'Betroffene Länder', value: '10+' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── MINUSMA ───
  {
    id: 'af-minusma',
    region: 'africa',
    category: 'organization',
    title: 'MINUSMA — UN-Mission in Mali',
    subtitle: 'Die tödlichste Friedensmission der UN-Geschichte (2013–2023)',
    summary: 'MINUSMA war mit 281 getöteten Blauhelmen die tödlichste UN-Friedensmission der Geschichte. Sie wurde 2023 auf Druck der malischen Junta beendet.',
    content: `## Mandat
Die **MINUSMA** (Mission multidimensionnelle intégrée des Nations Unies pour la stabilisation au Mali) wurde 2013 nach der französischen Intervention eingerichtet.

## Stärke
- ~13.000 Soldaten und Polizisten
- ~1.800 Zivilpersonal
- Hauptquartier: Bamako

## Bilanz
- **281 getötet** (tödlichste UN-Mission)
- Begrenzte Wirkung gegen Dschihadisten (kein robustes Mandat)
- Wichtig für Menschenrechtsmonitoring
- Dokumentierte Moura-Massaker

## Ende
Die Junta forderte 2023 den Abzug. Bis Dezember 2023 verließen die letzten Blauhelme Mali. Der Abzug hinterließ ein Sicherheitsvakuum.`,
    status: 'historical',
    severity: 3,
    tags: ['MINUSMA', 'UN', 'Mali', 'Blauhelme', 'Friedensmission'],
    countryIds: ['ML'],
    startYear: 2013,
    endYear: 2023,
    sources: [
      { id: 's1', label: 'MINUSMA Official', url: 'https://minusma.unmissions.org', type: 'un', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-mali-crisis', label: 'Mali-Krise', relationship: 'related' },
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise', relationship: 'related' },
    ],
    timeline: [
      { date: '2013-04', title: 'Einrichtung', description: 'UN-Sicherheitsrat beschließt Mission.' },
      { date: '2023-06', title: 'Abzug beschlossen', description: 'Junta fordert Ende der Mission.' },
      { date: '2023-12', title: 'Letzter Abzug', description: 'MINUSMA beendet Operationen.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Dauer', value: '2013–2023' },
      { label: 'Getötete', value: '281' },
      { label: 'Stärke', value: '~13.000' },
      { label: 'Status', value: 'Beendet' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── SAHEL HUMANITARIAN ───
  {
    id: 'af-sahel-humanitarian',
    region: 'africa',
    category: 'humanitarian',
    title: 'Humanitäre Krise in der Sahelzone',
    subtitle: 'Hunger, Vertreibung und Klimawandel im Krisengürtel',
    summary: 'Die Sahelzone erlebt eine der schlimmsten humanitären Krisen weltweit. Über 40 Millionen Menschen sind von Ernährungsunsicherheit betroffen, getrieben durch Konflikte, Klimawandel und wirtschaftlichen Zusammenbruch.',
    content: `## Ernährungskrise

Die Sahelzone erlebt regelmäßig schwere Ernährungskrisen:
- **40+ Mio.** Menschen ernährungsunsicher (IPC Phase 3+)
- **12+ Mio.** in akuter Ernährungskrise (IPC Phase 4/5)
- Blockierte Städte: Djibo, Kaya (Burkina Faso) von Hilfe abgeschnitten

## Klimawandel
- Sahel erwärmt sich **1,5x schneller** als globaler Durchschnitt
- Desertifikation: Sahara breitet sich nach Süden aus
- Unregelmäßige Regenfälle zerstören Ernten
- Tschadsee hat 90% seiner Fläche verloren (seit 1960er)

## Vertreibung
- **>8 Mio.** Binnenvertriebene in der Region
- **>2 Mio.** Flüchtlinge in Nachbarländern
- Vertreibungszahlen steigen seit 2019 exponentiell

## Bildungskrise
- **>10.000 Schulen** geschlossen
- **>4 Mio. Kinder** ohne Zugang zu Bildung
- Dschihadisten greifen gezielt Schulen an

## Gesundheit
- Zusammenbruch des Gesundheitssystems in Krisenregionen
- Malaria, Cholera, Meningitis-Ausbrüche
- COVID-19 hat Situation verschärft`,
    status: 'escalating',
    severity: 5,
    tags: ['Sahel', 'Hunger', 'Klimawandel', 'Vertreibung', 'Bildungskrise', 'Tschadsee', 'Desertifikation'],
    countryIds: ['ML', 'BF', 'NE', 'TD', 'MR', 'SN', 'NG'],
    sources: [
      { id: 's1', label: 'OCHA – Sahel', url: 'https://www.unocha.org/sahel', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'WFP – Sahel Hunger', url: 'https://www.wfp.org/emergencies/sahel-emergency', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's3', label: 'IPCC – Africa Chapter', url: 'https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-9/', type: 'academic', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'af-sahel-crisis', label: 'Sahelkrise', relationship: 'related' },
      { targetId: 'af-lake-chad', label: 'Tschadsee', relationship: 'related' },
    ],
    timeline: [
      { date: '2012', title: 'Sahel-Ernährungskrise', description: '18 Mio. bedroht.' },
      { date: '2020', title: 'COVID + Konflikte', description: 'Doppelkrise verschärft Lage.' },
      { date: '2023', title: 'Rekordzahlen', description: '>40 Mio. ernährungsunsicher.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Ernährungsunsicher', value: '>40 Mio.' },
      { label: 'Binnenvertriebene', value: '>8 Mio.' },
      { label: 'Geschlossene Schulen', value: '>10.000' },
      { label: 'Tschadsee-Verlust', value: '90% seit 1960er' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },
];

// ═══════════════════════════════════════════════════════════════════
// MIDDLE EAST — Extended Entries
// ═══════════════════════════════════════════════════════════════════

export const mideastExtended: KBEntry[] = [

  // ─── HAMAS ───
  {
    id: 'me-hamas',
    region: 'mideast',
    category: 'actor',
    title: 'Hamas — Islamische Widerstandsbewegung',
    subtitle: 'Palästinensische islamistische Bewegung und De-facto-Regierung in Gaza',
    summary: 'Hamas kontrolliert seit 2007 den Gazastreifen und ist gleichzeitig politische Partei, Sozialbewegung und bewaffnete Miliz. Der Angriff vom 7. Oktober 2023 veränderte die geopolitische Lage des Nahen Ostens grundlegend.',
    content: `## Gründung und Ideologie

Die **Hamas** (Harakat al-Muqawama al-Islamiyya) wurde 1987 während der Ersten Intifada von **Scheich Ahmed Yassin** als palästinensischer Ableger der Muslimbruderschaft gegründet.

### Ideologie
- Islamischer Widerstand gegen israelische Besatzung
- Ablehnung der Oslo-Abkommen
- Charta 2017: Akzeptanz eines Staates in den Grenzen von 1967, aber keine Anerkennung Israels

## Struktur
- **Politbüro:** Ismail Haniyeh (getötet Juli 2024), Yahya Sinwar (getötet Oktober 2024)
- **Qassam-Brigaden:** Militärischer Arm, ~30.000–40.000 Kämpfer
- **Tunnelsystem:** Hunderte Kilometer unter Gaza
- **Sozialdienste:** Schulen, Krankenhäuser, Wohlfahrt

## Finanzierung
- **Iran:** Hauptfinanzier (~$100 Mio./Jahr vor 7. Oktober)
- **Katar:** Humanitäre Hilfe + politische Unterstützung
- **Türkei:** Politisches Asyl, Unterstützung
- **Steuern und Zölle** in Gaza

## 7. Oktober 2023
Der "Al-Aqsa-Sturm"-Angriff war die größte Einzeloperation in Hamas-Geschichte:
- Durchbruch des Grenzzauns an >30 Stellen
- Angriffe auf Kibbuzim, Militärbasen, Nova-Festival
- ~1.200 Israelis getötet
- ~250 Geiseln genommen

## Militärische Fähigkeiten
- Raketenproduktion (Eigenentwicklung: M-75, J-80, bis 250 km)
- Drohnen (Shehab)
- Anti-Panzer-Waffen
- Scharfschützen und Guerilla-Taktiken
- Umfangreiches Tunnelnetz (Metro)`,
    status: 'active',
    severity: 5,
    tags: ['Hamas', 'Gaza', 'Qassam-Brigaden', '7. Oktober', 'Muslimbruderschaft', 'Tunnel', 'Sinwar'],
    countryIds: ['PS'],
    parties: ['Hamas (Politbüro)', 'Qassam-Brigaden', 'Iran', 'Katar'],
    startYear: 1987,
    sources: [
      { id: 's1', label: 'Stanford CISAC – Hamas', url: 'https://cisac.fsi.stanford.edu/mappingmilitants/profiles/hamas', type: 'academic', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'ICG – Hamas', url: 'https://www.crisisgroup.org/middle-east-north-africa/east-mediterranean-mena/israelpalestine', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's3', label: 'Council on Foreign Relations – Hamas', url: 'https://www.cfr.org/backgrounder/hamas', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-israel-palestine', label: 'Israel-Palästina-Konflikt', relationship: 'actor-in' },
      { targetId: 'me-iran', label: 'Iran (Hauptsponsor)', relationship: 'allied' },
      { targetId: 'me-hezbollah', label: 'Hisbollah (Achse)', relationship: 'allied' },
      { targetId: 'me-muslim-brotherhood', label: 'Muslimbruderschaft', relationship: 'part-of' },
    ],
    timeline: [
      { date: '1987-12', title: 'Gründung Hamas', description: 'Ahmed Yassin gründet Hamas während Erster Intifada.' },
      { date: '2004-03', title: 'Tod Yassins', description: 'Israel tötet Gründer Ahmed Yassin.' },
      { date: '2006-01', title: 'Wahlsieg', description: 'Hamas gewinnt palästinensische Parlamentswahlen.' },
      { date: '2007-06', title: 'Übernahme Gazas', description: 'Hamas übernimmt Kontrolle über Gaza von PA.' },
      { date: '2014-07', title: 'Gaza-Krieg', description: 'Operation Protective Edge, >2.200 Tote.' },
      { date: '2023-10-07', title: 'Al-Aqsa-Sturm', description: 'Beispielloser Angriff auf Israel.' },
      { date: '2024-07', title: 'Tod Haniyehs', description: 'Politbüro-Chef in Teheran getötet.' },
      { date: '2024-10', title: 'Tod Sinwars', description: 'Yahya Sinwar bei IDF-Operation getötet.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Gründung', value: '1987' },
      { label: 'Kämpfer', value: '30.000–40.000 (vor 7. Okt.)' },
      { label: 'Kontrolle', value: 'Gazastreifen (seit 2007)' },
      { label: 'Raketen (geschätzt)', value: '>10.000' },
      { label: 'Tunnelkilometer', value: '>500 km' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── MUSLIMBRUDERSCHAFT ───
  {
    id: 'me-muslim-brotherhood',
    region: 'mideast',
    category: 'actor',
    title: 'Muslimbruderschaft',
    subtitle: 'Älteste und einflussreichste islamistische Bewegung der Welt',
    summary: 'Die 1928 in Ägypten gegründete Muslimbruderschaft hat Ableger in der gesamten islamischen Welt. Ihre Ideologie prägte Hamas, AKP (Türkei), Ennahda (Tunesien) und zahlreiche andere islamistische Bewegungen.',
    content: `## Gründung

Die **Muslimbruderschaft** (Ikhwan al-Muslimin) wurde 1928 von **Hassan al-Banna** in Ismailia (Ägypten) gegründet als Reaktion auf:
- Britische Kolonialherrschaft
- Säkularisierung der türkischen Gesellschaft (Kemalismus)
- Wahrgenommener moralischer Verfall

## Ideologie
- **"Der Islam ist die Lösung"** — Religion als umfassendes Gesellschaftsmodell
- Gradualismus: Islamisierung von unten durch Bildung und Sozialdienste
- Ablehnung von Säkularismus
- Schlüsseldenker: Hassan al-Banna, Sayyid Qutb

## Ableger weltweit
| Land | Organisation | Status |
|------|-------------|--------|
| **Ägypten** | Muslimbruderschaft | Verboten (seit 2013) |
| **Palästina** | Hamas | Regiert Gaza |
| **Jordanien** | IAF | Legal, Opposition |
| **Tunesien** | Ennahda | Legal, geschwächt |
| **Türkei** | AKP-Ideologisch verwandt | Regierungspartei |
| **Syrien** | MB-Syrien | Verboten, Opposition |
| **Kuwait** | Hadas | Legal, Opposition |

## Ägypten: Aufstieg und Fall
- **2011:** Arabischer Frühling bringt MB an die Macht
- **2012:** Mohamed Morsi wird Präsident
- **2013:** Militärputsch durch Sisi, Massaker am Rabaa-Platz (>1.000 Tote)
- Seitdem brutal unterdrückt, Tausende inhaftiert`,
    status: 'active',
    severity: 3,
    tags: ['Muslimbruderschaft', 'Ikhwan', 'Ägypten', 'Politischer Islam', 'Morsi', 'Qutb', 'al-Banna'],
    countryIds: ['EG', 'PS', 'JO', 'TN', 'TR', 'SY'],
    startYear: 1928,
    sources: [
      { id: 's1', label: 'Brookings – Muslim Brotherhood', url: 'https://www.brookings.edu/topic/muslim-brotherhood/', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'CFR – Muslim Brotherhood', url: 'https://www.cfr.org/backgrounder/muslim-brotherhood', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-hamas', label: 'Hamas (Ableger)', relationship: 'related' },
      { targetId: 'me-turkey', label: 'Türkei/AKP', relationship: 'related' },
      { targetId: 'me-arab-spring', label: 'Arabischer Frühling', relationship: 'related' },
    ],
    timeline: [
      { date: '1928', title: 'Gründung', description: 'Hassan al-Banna gründet die Bruderschaft.' },
      { date: '1949', title: 'Ermordung al-Bannas', description: 'Ägyptischer Geheimdienst tötet Gründer.' },
      { date: '1954', title: 'Verbot in Ägypten', description: 'Nasser verbietet die MB.' },
      { date: '1966', title: 'Hinrichtung Qutbs', description: 'Radikaler Ideologe hingerichtet.' },
      { date: '2012-06', title: 'Morsi Präsident', description: 'Erster MB-Präsident Ägyptens.' },
      { date: '2013-07', title: 'Militärputsch', description: 'Sisi stürzt Morsi.' },
      { date: '2013-08', title: 'Rabaa-Massaker', description: '>1.000 Tote bei Räumung.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Gründung', value: '1928' },
      { label: 'Ableger', value: '>20 Länder' },
      { label: 'Motto', value: '"Der Islam ist die Lösung"' },
      { label: 'Status Ägypten', value: 'Verboten/Terrorliste' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── ARAB SPRING ───
  {
    id: 'me-arab-spring',
    region: 'mideast',
    category: 'historical',
    title: 'Arabischer Frühling (2010–2012)',
    subtitle: 'Revolutionswelle, die den Nahen Osten und Nordafrika grundlegend veränderte',
    summary: 'Ausgelöst durch die Selbstverbrennung Mohamed Bouazizis in Tunesien im Dezember 2010, erfasste eine Welle von Protesten und Revolutionen die gesamte arabische Welt. Die Ergebnisse reichen von demokratischem Wandel (Tunesien) bis zu katastrophalen Bürgerkriegen (Syrien, Libyen, Jemen).',
    content: `## Auslöser

Am 17. Dezember 2010 setzte sich der tunesische Straßenhändler **Mohamed Bouazizi** aus Protest gegen Behördenwillkür in Brand. Sein Tod löste die **Jasmin-Revolution** aus.

## Verbreitung

### Regime gestürzt
- **Tunesien:** Ben Ali flieht (Januar 2011)
- **Ägypten:** Mubarak tritt zurück (Februar 2011)
- **Libyen:** Gaddafi gestürzt und getötet (Oktober 2011)
- **Jemen:** Saleh übergibt Macht (Februar 2012)

### Bürgerkriege
- **Syrien:** Proteste eskalieren zum Bürgerkrieg (2011–heute)
- **Libyen:** Staatszerfall nach Gaddafis Sturz
- **Jemen:** Bürgerkrieg ab 2014

### Reformen/Unterdrückung
- **Marokko:** Verfassungsreform
- **Jordanien:** Begrenzte Reformen
- **Bahrain:** Saudi-Intervention gegen schiitische Proteste
- **Saudi-Arabien:** Massive Ausgabenprogramme zur Beschwichtigung

## Bilanz
Der Arabische Frühling hat nur in **Tunesien** zu einem (zeitweilig) demokratischen Übergang geführt. In den meisten Ländern folgte entweder Restauration (Ägypten) oder Chaos (Libyen, Syrien, Jemen).

## Langfristige Auswirkungen
- Delegitimierung autoritärer Ordnung
- Aufstieg und Fall des politischen Islam
- Flüchtlingskrise nach Europa
- Geopolitische Neuordnung der Region
- Zweite Protestwelle 2019 (Sudan, Algerien, Irak, Libanon)`,
    status: 'historical',
    severity: 5,
    tags: ['Arabischer Frühling', 'Revolution', 'Bouazizi', 'Mubarak', 'Tunesien', 'Demokratie'],
    countryIds: ['TN', 'EG', 'LY', 'SY', 'YE', 'BH', 'JO', 'MA'],
    startYear: 2010,
    endYear: 2012,
    sources: [
      { id: 's1', label: 'Brookings – Arab Spring at 10', url: 'https://www.brookings.edu/series/the-arab-spring-at-10/', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'Al Jazeera – Arab Spring Archive', url: 'https://www.aljazeera.com/tag/arab-spring/', type: 'news', accessDate: '2025-02', reliability: 'medium' },
    ],
    crossLinks: [
      { targetId: 'me-syria', label: 'Syrien-Bürgerkrieg', relationship: 'cause' },
      { targetId: 'af-libya-conflict', label: 'Libyen-Konflikt', relationship: 'cause' },
      { targetId: 'me-yemen-houthis', label: 'Jemen-Krieg', relationship: 'cause' },
      { targetId: 'me-muslim-brotherhood', label: 'Muslimbruderschaft', relationship: 'related' },
      { targetId: 'af-libya-fallout', label: 'Libyen → Sahel', relationship: 'cause' },
    ],
    timeline: [
      { date: '2010-12-17', title: 'Bouazizi', description: 'Selbstverbrennung in Sidi Bouzid.' },
      { date: '2011-01-14', title: 'Ben Ali flieht', description: 'Tunesische Revolution.' },
      { date: '2011-02-11', title: 'Mubarak tritt zurück', description: 'Ägyptische Revolution.' },
      { date: '2011-02-15', title: 'Aufstand in Libyen', description: 'Proteste in Benghazi.' },
      { date: '2011-03-15', title: 'Proteste in Syrien', description: 'Daraa-Proteste.' },
      { date: '2011-03-14', title: 'Saudi-Intervention in Bahrain', description: 'GCC-Truppen unterdrücken Proteste.' },
      { date: '2011-10-20', title: 'Tod Gaddafis', description: 'Gaddafi in Sirte getötet.' },
      { date: '2012-06', title: 'Morsi in Ägypten', description: 'Muslimbrüder an der Macht.' },
      { date: '2013-07', title: 'Sisi-Putsch', description: 'Militär stürzt Morsi.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Gestürzte Regime', value: '4' },
      { label: 'Bürgerkriege', value: '3 (Syrien, Libyen, Jemen)' },
      { label: 'Auslöser', value: 'Bouazizi (17.12.2010)' },
      { label: 'Demokratischer Erfolg', value: 'Tunesien (zeitweise)' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── KURDS ───
  {
    id: 'me-kurds',
    region: 'mideast',
    category: 'actor',
    title: 'Kurden — Volk ohne Staat',
    subtitle: '30–40 Millionen Menschen verteilt auf vier Staaten',
    summary: 'Die Kurden sind die größte staatenlose Ethnie der Welt. Verteilt auf die Türkei, Irak, Syrien und Iran kämpfen sie seit Jahrzehnten für Autonomie oder Unabhängigkeit — mit sehr unterschiedlichen Ergebnissen.',
    content: `## Übersicht

Die **Kurden** (30–40 Mio.) leben hauptsächlich in:
- **Türkei:** ~15–20 Mio. (größte Gruppe)
- **Irak:** ~6–8 Mio. (Kurdistan Region)
- **Iran:** ~8–10 Mio.
- **Syrien:** ~2–3 Mio. (Rojava)

## Kurdische Bewegungen

### Türkei: PKK
- **PKK** (Arbeiterpartei Kurdistans): Gegründet 1978 von Abdullah Öcalan
- Guerillakrieg seit 1984, >40.000 Tote
- Öcalan seit 1999 inhaftiert (Imrali-Gefängnis)
- Von Türkei, USA und EU als Terrororganisation gelistet
- Friedensprozess 2013–2015, seitdem erneut Krieg

### Irak: KRG
- **Kurdistan Region Iraq (KRI):** Weitgehende Autonomie seit 1991
- **KDP** (Barzani-Clan) und **PUK** (Talabani-Clan): Rivalisierende Parteien
- Unabhängigkeitsreferendum 2017: 92% Ja, aber von Bagdad/Welt abgelehnt
- Wirtschaftlich abhängig von Öl

### Syrien: Rojava/SDF
- **PYD/YPG** gründeten 2012 de facto autonome Region "Rojava"
- **SDF** (Syrian Democratic Forces): Multi-ethnische Koalition
- Anti-IS-Kampf mit US-Unterstützung
- Türkei betrachtet YPG als PKK-Ableger
- Ständige türkische Militäroperationen

### Iran: PJAK
- **PJAK** (Partei für ein Freies Leben in Kurdistan): PKK-nah
- Brutale Unterdrückung durch iranisches Regime
- Aktiv in Mahsa-Amini-Protesten 2022`,
    status: 'active',
    severity: 4,
    tags: ['Kurden', 'PKK', 'Öcalan', 'Rojava', 'SDF', 'Kurdistan', 'KRG', 'Barzani', 'YPG'],
    countryIds: ['TR', 'IQ', 'SY', 'IR'],
    parties: ['PKK', 'KDP', 'PUK', 'PYD/YPG', 'SDF', 'PJAK'],
    startYear: 1978,
    sources: [
      { id: 's1', label: 'ICG – Kurds', url: 'https://www.crisisgroup.org/middle-east-north-africa/gulf-and-arabian-peninsula/iraq/kurds', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'Brookings – Kurdish Question', url: 'https://www.brookings.edu/topic/kurds/', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-syria', label: 'Syrien (Rojava)', relationship: 'actor-in' },
      { targetId: 'me-turkey', label: 'Türkei (Konflikt)', relationship: 'opposed' },
      { targetId: 'me-iraq', label: 'Irak (KRI)', relationship: 'related' },
      { targetId: 'me-iran', label: 'Iran (PJAK)', relationship: 'opposed' },
    ],
    timeline: [
      { date: '1920', title: 'Vertrag von Sèvres', description: 'Kurdistan-Versprechen, nie umgesetzt.' },
      { date: '1978', title: 'PKK-Gründung', description: 'Öcalan gründet die PKK.' },
      { date: '1984', title: 'PKK-Guerillakrieg', description: 'Beginn des bewaffneten Kampfes.' },
      { date: '1991', title: 'KRI-Autonomie', description: 'Safe Haven im Nordirak nach Golfkrieg.' },
      { date: '1999', title: 'Öcalan verhaftet', description: 'PKK-Führer in Kenia gefasst.' },
      { date: '2012', title: 'Rojava-Autonomie', description: 'Kurden nutzen Syrien-Chaos.' },
      { date: '2014', title: 'Anti-IS-Kampf', description: 'Kurden als Schlüsselkraft gegen IS (Kobane).' },
      { date: '2017-09', title: 'KRI-Referendum', description: '92% für Unabhängigkeit, Bagdad lehnt ab.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Bevölkerung', value: '30–40 Mio.' },
      { label: 'Staaten', value: 'Türkei, Irak, Syrien, Iran' },
      { label: 'PKK-Konflikt Tote', value: '>40.000' },
      { label: 'KRI-Fläche', value: '~40.000 km²' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── IRAN-SAUDI RIVALRY ───
  {
    id: 'me-iran-saudi-rivalry',
    region: 'mideast',
    category: 'conflict',
    title: 'Saudi-Iranische Rivalität',
    subtitle: 'Der Kalte Krieg des Nahen Ostens',
    summary: 'Die Rivalität zwischen Saudi-Arabien und Iran ist die zentrale Konfliktachse des Nahen Ostens. Beide Regionalmächte kämpfen um Hegemonie — durch Proxy-Kriege im Jemen, Libanon, Irak und Syrien.',
    content: `## Dimensionen

### 1. Konfessionell
- **Saudi-Arabien:** Sunnitische Führungsmacht, Hüter der Heiligen Stätten
- **Iran:** Schiitische Regionalmacht, revolutionäre Ideologie
- Instrumentalisierung der Konfession für geopolitische Ziele

### 2. Geopolitisch
- Rivalität um regionale Hegemonie
- Bündnissysteme: Saudi + USA/Israel vs. Iran + Achse des Widerstands
- Wettrüsten am Golf

### 3. Wirtschaftlich
- Ölmarkt: Beide Top-Produzenten (OPEC)
- Sanktionsregime gegen Iran
- Saudi Vision 2030 vs. iranische Isolation

## Proxy-Kriegsschauplätze

| Schauplatz | Saudi-Seite | Iran-Seite |
|-----------|------------|-----------|
| **Jemen** | Koalition + Regierung | Huthis |
| **Libanon** | Anti-Hisbollah | Hisbollah |
| **Irak** | Sunnitische Kräfte | PMF-Milizen |
| **Syrien** | Rebellion | Assad + Milizen |
| **Bahrain** | Al-Khalifa-Regime | Schiitische Opposition |

## China-vermittelter Deal (2023)
Im März 2023 vermittelte **China** überraschend die Wiederaufnahme diplomatischer Beziehungen. Dies signalisierte:
- Chinas wachsende Rolle im Nahen Osten
- Saudische Pragmatik unter MBS
- Iranisches Interesse an Deeskalation
- Relativierung der US-Rolle`,
    status: 'active',
    severity: 4,
    tags: ['Saudi-Arabien', 'Iran', 'Proxy-Krieg', 'Sunniten', 'Schiiten', 'Kalter Krieg', 'China'],
    countryIds: ['SA', 'IR'],
    parties: ['Saudi-Arabien', 'Iran', 'Proxy-Kräfte beider Seiten'],
    startYear: 1979,
    sources: [
      { id: 's1', label: 'IISS – Iran-Saudi Rivalry', url: 'https://www.iiss.org/publications/strategic-dossiers/iran-saudi', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'Brookings – Saudi-Iran', url: 'https://www.brookings.edu/topic/saudi-iran/', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-iran', label: 'Iran', relationship: 'actor-in' },
      { targetId: 'me-saudi', label: 'Saudi-Arabien', relationship: 'actor-in' },
      { targetId: 'me-yemen-houthis', label: 'Jemen (Proxy)', relationship: 'effect' },
      { targetId: 'me-hezbollah', label: 'Libanon (Proxy)', relationship: 'effect' },
      { targetId: 'me-syria', label: 'Syrien (Proxy)', relationship: 'effect' },
      { targetId: 'me-iraq', label: 'Irak (Proxy)', relationship: 'effect' },
    ],
    timeline: [
      { date: '1979', title: 'Islamische Revolution', description: 'Beginn der ideologischen Rivalität.' },
      { date: '1980', title: 'Iran-Irak-Krieg', description: 'Saudi-Arabien unterstützt Irak.' },
      { date: '2003', title: 'Irak-Invasion', description: 'Machtvakuum stärkt Iran.' },
      { date: '2011', title: 'Arabischer Frühling', description: 'Rivalität in Bahrain, Syrien, Jemen.' },
      { date: '2016-01', title: 'Botschaftskrise', description: 'Saudi-Arabien bricht Beziehungen ab.' },
      { date: '2023-03', title: 'China-Deal', description: 'Wiederaufnahme diplomatischer Beziehungen.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Dauer', value: 'Seit 1979' },
      { label: 'Proxy-Schauplätze', value: '5+' },
      { label: 'Vermittler', value: 'China (2023)' },
      { label: 'Dimension', value: 'Konfessionell + Geopolitisch' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── ABRAHAM ACCORDS ───
  {
    id: 'me-abraham-accords',
    region: 'mideast',
    category: 'historical',
    title: 'Abraham-Abkommen',
    subtitle: 'Normalisierung arabisch-israelischer Beziehungen seit 2020',
    summary: 'Die Abraham-Abkommen (2020) zwischen Israel und mehreren arabischen Staaten markierten einen historischen Durchbruch. VAE, Bahrain, Sudan und Marokko normalisierten die Beziehungen zu Israel — eine mögliche saudische Normalisierung wurde durch den 7. Oktober 2023 unterbrochen.',
    content: `## Hintergrund

Die **Abraham-Abkommen** wurden im September 2020 unter Vermittlung der Trump-Administration unterzeichnet.

## Teilnehmer
- **VAE** (15. September 2020): Vollständige Normalisierung
- **Bahrain** (15. September 2020): Normalisierung
- **Sudan** (23. Oktober 2020): Normalisierungserklärung
- **Marokko** (10. Dezember 2020): Normalisierung (Gegenleistung: US-Anerkennung der Westsahara)

## Motivation
- **Gemeinsame Iran-Bedrohung**: Israel und Golfstaaten teilen Feindbild
- **Wirtschaftliche Vorteile**: Tech, Tourismus, Rüstung
- **US-Druck und Anreize**: Waffendeals, Anerkennung Westsahara
- **Palästina marginalisiert**: "Normalisierung ohne Palästinenser-Lösung"

## Auswirkungen des 7. Oktober 2023
- Saudische Normalisierung auf Eis gelegt
- Arabische Öffentlichkeit: Massive Kritik an Normalisierung
- Jordanien und Ägypten: Botschafter zeitweise zurückgezogen
- Bahrain: Botschafter abgezogen

## Saudi-Normalisierung
Die Biden-Administration arbeitete an einem "Mega-Deal": Saudi-Normalisierung mit Israel im Gegenzug für:
- US-Sicherheitsgarantien für Saudi-Arabien
- Zugang zu US-Nukleartechnologie
- Palästinensische Staatlichkeitsschritte
Der 7. Oktober machte dies (vorerst) unmöglich.`,
    status: 'frozen',
    severity: 3,
    tags: ['Abraham-Abkommen', 'Normalisierung', 'Israel', 'VAE', 'Bahrain', 'Marokko', 'Saudi-Arabien'],
    countryIds: ['IL', 'AE', 'BH', 'MA', 'SD'],
    startYear: 2020,
    sources: [
      { id: 's1', label: 'Brookings – Abraham Accords', url: 'https://www.brookings.edu/topic/abraham-accords/', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'USIP – Abraham Accords', url: 'https://www.usip.org/publications/abraham-accords', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-israel-palestine', label: 'Israel-Palästina', relationship: 'related' },
      { targetId: 'me-saudi', label: 'Saudi-Normalisierung (pausiert)', relationship: 'related' },
      { targetId: 'me-iran', label: 'Iran (Gemeinsame Bedrohung)', relationship: 'cause' },
      { targetId: 'me-iran-saudi-rivalry', label: 'Saudi-Iran-Rivalität', relationship: 'related' },
    ],
    timeline: [
      { date: '2020-08-13', title: 'Israel-VAE-Deal', description: 'Trump verkündet Normalisierung.' },
      { date: '2020-09-15', title: 'Unterzeichnung', description: 'VAE und Bahrain unterzeichnen im Weißen Haus.' },
      { date: '2020-10-23', title: 'Sudan', description: 'Sudan normalisiert Beziehungen.' },
      { date: '2020-12-10', title: 'Marokko', description: 'Normalisierung, US erkennt Westsahara an.' },
      { date: '2023-09', title: 'Saudi-Deal-Verhandlungen', description: 'Biden-Administration treibt Mega-Deal voran.' },
      { date: '2023-10-07', title: '7. Oktober', description: 'Hamas-Angriff stoppt Normalisierung.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Unterzeichner', value: '4 arabische Staaten' },
      { label: 'Datum', value: '15. September 2020' },
      { label: 'Vermittler', value: 'USA (Trump)' },
      { label: 'Saudi-Deal', value: 'Pausiert' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── RED SEA CRISIS ───
  {
    id: 'me-red-sea-crisis',
    region: 'mideast',
    category: 'conflict',
    title: 'Rote-Meer-Krise',
    subtitle: 'Huthi-Angriffe auf Handelsschiffe bedrohen globalen Handel',
    summary: 'Seit November 2023 greifen die Huthis systematisch Handelsschiffe im Roten Meer und Golf von Aden an. Dies bedroht eine der wichtigsten Handelsrouten der Welt und hat massive wirtschaftliche Auswirkungen.',
    content: `## Hintergrund

Die Huthis begründen die Angriffe als **Solidaritätsakt mit Gaza** und fordern einen Waffenstillstand. Tatsächlich nutzen sie die Krise zur innenpolitischen Legitimation und regionalen Machtprojektion.

## Angriffsmuster
- **Bab el-Mandeb:** Meerenge zwischen Jemen und Dschibuti (30 km breit)
- Raketen, Drohnen und Schnellboot-Angriffe
- Ziel: Israelische, US-amerikanische und "verbündete" Schiffe
- De facto: Wahllose Angriffe auf internationale Schifffahrt

## Wirtschaftliche Auswirkungen
- **12% des Welthandels** passiert normalerweise das Rote Meer
- **Suez-Kanal-Einnahmen** Ägyptens eingebrochen (~50%)
- Reedereien umfahren Afrika (Kap der Guten Hoffnung)
- **10–14 Tage** zusätzliche Fahrtzeit
- Frachtkosten vervielfacht
- Versicherungsprämien massiv gestiegen

## US/UK-Reaktion
- **Operation Prosperity Guardian:** Multinationale Marine-Koalition
- Direkte Luftangriffe auf Huthi-Stellungen seit Januar 2024
- Bisher begrenzte Wirkung — Huthis greifen weiter an

## Strategische Bedeutung
- Suez-Kanal: ~15% des Welthandels
- Öltanker aus dem Golf
- Glasfaserkabel (Internet) am Meeresgrund
- Militärbasen: USA (Dschibuti), China, Frankreich, Japan`,
    status: 'escalating',
    severity: 4,
    tags: ['Rotes Meer', 'Huthis', 'Suez-Kanal', 'Bab el-Mandeb', 'Schifffahrt', 'Welthandel', 'Dschibuti'],
    countryIds: ['YE', 'DJ', 'EG'],
    parties: ['Huthis/Ansar Allah', 'US Navy', 'UK Royal Navy', 'Operation Prosperity Guardian'],
    startYear: 2023,
    sources: [
      { id: 's1', label: 'IMO – Red Sea Shipping', url: 'https://www.imo.org/en', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'IISS – Houthi Maritime Threat', url: 'https://www.iiss.org/online-analysis/red-sea-crisis', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-yemen-houthis', label: 'Jemen-Krieg', relationship: 'related' },
      { targetId: 'me-israel-palestine', label: 'Gaza (Auslöser)', relationship: 'cause' },
      { targetId: 'me-iran', label: 'Iran (Huthi-Unterstützung)', relationship: 'related' },
    ],
    timeline: [
      { date: '2023-11-19', title: 'Erste Geiselnahme', description: 'Huthis kapern Frachtschiff Galaxy Leader.' },
      { date: '2023-12', title: 'Angriffe eskalieren', description: 'Dutzende Angriffe auf Handelsschiffe.' },
      { date: '2024-01-11', title: 'US/UK-Luftangriffe', description: 'Erste direkte Schläge gegen Huthi-Stellungen.' },
      { date: '2024-02', title: 'Reedereien umrouten', description: 'Maersk, Hapag-Lloyd etc. meiden Rotes Meer.' },
      { date: '2024-03', title: 'Rubymar sinkt', description: 'Erstes durch Huthis versenktes Frachtschiff.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Welthandelsanteil Rotes Meer', value: '~12%' },
      { label: 'Angriffe (seit Nov 2023)', value: '>100' },
      { label: 'Suez-Einbußen Ägyptens', value: '~50%' },
      { label: 'Umweg Afrika', value: '+10–14 Tage' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── LEBANON CRISIS ───
  {
    id: 'me-lebanon-crisis',
    region: 'mideast',
    category: 'conflict',
    title: 'Libanon — Staatsversagen und Mehrfachkrise',
    subtitle: 'Wirtschaftskollaps, politische Paralyse und Hisbollah-Dominanz',
    summary: 'Der Libanon erlebt seit 2019 den schlimmsten Wirtschaftskollaps seiner Geschichte. Kombiniert mit der Hisbollah-Dominanz, der Beirut-Explosion 2020 und der israelischen Eskalation 2024 steht das Land am Rande des Zusammenbruchs.',
    content: `## Wirtschaftskollaps (seit 2019)
- Währung verlor >98% ihres Wertes
- Hyperinflation >200%
- Bankeinlagen eingefroren ("Lebanon's Ponzi Scheme")
- >80% unter Armutsgrenze
- Zusammenbruch der Grundversorgung (Strom, Wasser, Medikamente)

## Beirut-Explosion (4. August 2020)
- **2.750 Tonnen Ammoniumnitrat** explodierten im Hafen
- >220 Tote, >6.500 Verletzte
- Halber Stadtteil zerstört
- Keine Verantwortlichen zur Rechenschaft gezogen

## Konfessionelles System
Der Libanon basiert auf einem konfessionellen Machtteilungssystem:
- Präsident: Maronitischer Christ
- Premier: Sunnitischer Muslim
- Parlamentspräsident: Schiitischer Muslim
- Das System ist dysfunktional und ermöglicht Blockaden

## 2024 Eskalation
- Hisbollah eröffnet "Solidaritätsfront" mit Gaza
- Israel eskaliert ab September 2024 massiv:
  - Pager-Angriffe: Sabotage von Kommunikationsgeräten
  - Tötung Hassan Nasrallahs (27. September 2024)
  - Bodenoffensive im Südlibanon
  - >1.500 Libanesen getötet
  - >1 Mio. Vertriebene`,
    status: 'escalating',
    severity: 4,
    tags: ['Libanon', 'Wirtschaftskollaps', 'Hisbollah', 'Beirut-Explosion', 'Israel', 'Konfessionalismus'],
    countryIds: ['LB'],
    parties: ['Hisbollah', 'Libanesische Armee', 'Israel', 'Politische Blöcke'],
    startYear: 2019,
    sources: [
      { id: 's1', label: 'World Bank – Lebanon Crisis', url: 'https://www.worldbank.org/en/country/lebanon/overview', type: 'un', accessDate: '2025-02', reliability: 'high' },
      { id: 's2', label: 'ICG – Lebanon', url: 'https://www.crisisgroup.org/middle-east-north-africa/east-mediterranean-mena/lebanon', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-hezbollah', label: 'Hisbollah', relationship: 'actor-in' },
      { targetId: 'me-israel-palestine', label: 'Gaza-Eskalation', relationship: 'cause' },
      { targetId: 'me-iran', label: 'Iran (über Hisbollah)', relationship: 'related' },
      { targetId: 'me-syria', label: 'Syrische Flüchtlinge (~1,5 Mio.)', relationship: 'related' },
    ],
    timeline: [
      { date: '2019-10', title: 'Thawra-Proteste', description: 'Massenproteste gegen politische Klasse.' },
      { date: '2020-03', title: 'Staatspleite', description: 'Libanon zahlt erstmals Schulden nicht.' },
      { date: '2020-08-04', title: 'Beirut-Explosion', description: '2.750t Ammoniumnitrat explodieren.' },
      { date: '2022-10', title: 'Kein Präsident', description: 'Libanon über 2 Jahre ohne Staatsoberhaupt.' },
      { date: '2024-09', title: 'Israel-Eskalation', description: 'Pager-Angriffe, Tötung Nasrallahs.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Währungsverlust', value: '>98%' },
      { label: 'Unter Armutsgrenze', value: '>80%' },
      { label: 'Syrische Flüchtlinge', value: '~1,5 Mio.' },
      { label: 'Beirut-Explosion Tote', value: '>220' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },

  // ─── GULF STATES ───
  {
    id: 'me-gulf-states',
    region: 'mideast',
    category: 'region',
    title: 'Golfstaaten (GCC)',
    subtitle: 'Petromonarchien zwischen Modernisierung und Autokratie',
    summary: 'Die sechs Golfstaaten (Saudi-Arabien, VAE, Katar, Kuwait, Bahrain, Oman) bilden den Golf-Kooperationsrat (GCC). Trotz enormen Reichtums stehen sie vor Herausforderungen: Iran-Bedrohung, Post-Öl-Transition, Katar-Blockade und soziale Transformation.',
    content: `## GCC-Mitglieder

| Land | Bevölkerung | BIP/Kopf | Öl-Reserven |
|------|-----------|---------|-------------|
| **Saudi-Arabien** | ~36 Mio. | ~$32.000 | 1. oder 2. weltweit |
| **VAE** | ~10 Mio. | ~$50.000 | 6. weltweit |
| **Katar** | ~3 Mio. | ~$87.000 | 3. Gas weltweit |
| **Kuwait** | ~4,5 Mio. | ~$38.000 | 7. weltweit |
| **Bahrain** | ~1,5 Mio. | ~$29.000 | Gering |
| **Oman** | ~5 Mio. | ~$21.000 | Moderat |

## Katar-Blockade (2017–2021)
Saudi-Arabien, VAE, Bahrain und Ägypten blockierten Katar wegen angeblicher Terror-Unterstützung. 2021 aufgehoben.

## Diversifizierung
- **Saudi Vision 2030:** NEOM, Entertainment, Tourismus
- **VAE:** Dubai als Handels-Hub, Abu Dhabi als Finanzzentrum
- **Katar:** Erdgas-Weltmacht, FIFA 2022

## Arbeitnehmerrechte
Massive Kritik an **Kafala-System** (Arbeitgeberbindung für Migranten). VAE und Katar haben Reformen eingeleitet.

## Militärische Kapazitäten
Die GCC-Staaten gehören zu den größten Rüstungsimporteuren der Welt. Besonders Saudi-Arabien und VAE verfügen über hochmoderne Waffensysteme.`,
    status: 'active',
    severity: 2,
    tags: ['GCC', 'Golfstaaten', 'Öl', 'VAE', 'Katar', 'Kuwait', 'Bahrain', 'Oman', 'Kafala'],
    countryIds: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'],
    startYear: 1981,
    sources: [
      { id: 's1', label: 'Brookings – Gulf States', url: 'https://www.brookings.edu/topic/gulf-states/', type: 'think-tank', accessDate: '2025-02', reliability: 'high' },
    ],
    crossLinks: [
      { targetId: 'me-saudi', label: 'Saudi-Arabien', relationship: 'part-of' },
      { targetId: 'me-iran-saudi-rivalry', label: 'Iran-Rivalität', relationship: 'related' },
      { targetId: 'me-yemen-houthis', label: 'Jemen-Koalition', relationship: 'related' },
    ],
    timeline: [
      { date: '1981', title: 'GCC gegründet', description: 'Reaktion auf Iran-Irak-Krieg.' },
      { date: '2017-06', title: 'Katar-Blockade', description: 'Diplomatische Krise.' },
      { date: '2020-09', title: 'Abraham-Abkommen', description: 'VAE + Bahrain normalisieren mit Israel.' },
      { date: '2021-01', title: 'Blockade aufgehoben', description: 'Al-Ula-Erklärung.' },
    ],
    images: [],
    keyFacts: [
      { label: 'Mitglieder', value: '6' },
      { label: 'Gesamt-BIP', value: '>$2 Bio.' },
      { label: 'Ölreserven', value: '~30% weltweit' },
      { label: 'Rüstungsimporte', value: 'Top 5 weltweit' },
    ],
    createdAt: '2025-02-01',
    updatedAt: '2025-02-20',
  },
];
