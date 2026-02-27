import type { CountryMilitaryData, WeaponSystem, SecurityActor, ArmedConflict, CountryRelation, InternationalMission } from '../types';
import { militaryDataSahel } from './militaryDataSahel';
import { militaryDataEastSouth } from './militaryDataEastSouth';

// ── Helper constructors ──────────────────────────

let _id = 0;
const uid = () => `mil_${++_id}`;

function ws(cat: string, name: string, qty: number, origin: string, status: string, src: string, srcLabel: string, notes?: string): WeaponSystem {
  return { id: uid(), category: cat, name, quantity: qty, origin, status, notes, source: src, sourceLabel: srcLabel };
}

function act(name: string, type: string, desc: string, status: string, areas: string, strength: string, src: string, srcLabel: string): SecurityActor {
  return { id: uid(), name, type, description: desc, status, areas, estimatedStrength: strength, source: src, sourceLabel: srcLabel };
}

function con(name: string, parties: string[], status: string, start: number, end: number | undefined, desc: string, casualties: string, src: string, srcLabel: string): ArmedConflict {
  return { id: uid(), name, parties, status, startYear: start, endYear: end, description: desc, casualties, source: src, sourceLabel: srcLabel };
}

function rel(cId: string, cName: string, flag: string, type: string, desc: string, src: string, srcLabel: string): CountryRelation {
  return { id: uid(), countryId: cId, countryName: cName, countryFlag: flag, type, description: desc, source: src, sourceLabel: srcLabel };
}

function mis(name: string, fullName: string, org: InternationalMission['organization'], type: string, status: string, start: number, end: number | undefined, personnel: number | undefined, desc: string, countries: string[], src: string, srcLabel: string): InternationalMission {
  return { id: uid(), name, fullName, organization: org, type, status, startYear: start, endYear: end, personnel, description: desc, countries, source: src, sourceLabel: srcLabel };
}

// ── Source URL helpers ──

const IISS = 'https://www.iiss.org/publications/the-military-balance';
const IISS_L = 'IISS Military Balance 2024';
const GFP = (id: string) => `https://www.globalfirepower.com/country-military-strength-detail.php?country_id=${id}`;
const GFP_L = (n: string) => `GlobalFirepower – ${n}`;
const WP = (slug: string) => `https://en.wikipedia.org/wiki/${slug}`;
const WP_L = (n: string) => `Wikipedia – ${n}`;
const EU_MISSIONS = 'https://www.eeas.europa.eu/eeas/missions-and-operations_en';
const EU_MISSIONS_L = 'EEAS – EU Missionen';
const AFRICOM = 'https://www.africom.mil/';
const AFRICOM_L = 'U.S. Africa Command (AFRICOM)';
const BMVg = 'https://www.bundeswehr.de/de/einsaetze-bundeswehr';
const BMVg_L = 'Bundeswehr – Einsätze';

// ═══════════════════════════════════════════════════════════════
// EGYPT (EG)
// ═══════════════════════════════════════════════════════════════

const EG: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Ägyptische Streitkräfte (القوات المسلحة المصرية)',
    founded: 1922,
    activePersonnel: 438500,
    reservePersonnel: 479000,
    paramilitaryPersonnel: 397000,
    militaryBudget: 4640000000,
    budgetPercentGDP: 1.2,
    conscription: true,
    commanderInChief: 'Präsident Abdel Fattah el-Sisi',
    source: GFP('egypt'),
    sourceLabel: GFP_L('Ägypten'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'M1A1 Abrams', 1130, 'USA (Lizenzproduktion)', 'Aktiv', IISS, IISS_L, 'Lokale Produktion in Helwan'),
    ws('Kampfpanzer', 'M60A3 / Ramses II', 1960, 'USA', 'Aktiv', IISS, IISS_L, 'Ramses II = modernisierte M60'),
    ws('Gepanzerte Fahrzeuge', 'M113A2', 2900, 'USA', 'Aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'F-16C/D Block 40/52', 218, 'USA', 'Aktiv', WP('General_Dynamics_F-16_Fighting_Falcon'), WP_L('F-16 Fighting Falcon'), 'Größte F-16-Flotte in der MENA-Region'),
    ws('Kampfflugzeuge', 'Dassault Rafale', 54, 'Frankreich', 'Lieferung', WP('Dassault_Rafale'), WP_L('Dassault Rafale'), '24 geliefert + 30 bestellt'),
    ws('Kampfflugzeuge', 'MiG-29M/M2', 46, 'Russland', 'Aktiv', WP('Mikoyan_MiG-29M'), WP_L('MiG-29M')),
    ws('Hubschrauber', 'Ka-52 Alligator', 46, 'Russland', 'Aktiv', WP('Kamov_Ka-52'), WP_L('Ka-52 Alligator')),
    ws('Hubschrauber', 'AH-64D Apache', 46, 'USA', 'Aktiv', IISS, IISS_L),
    ws('Kriegsschiffe', 'Mistral-Klasse (LHD)', 2, 'Frankreich', 'Aktiv', WP('Egyptian_Navy'), WP_L('Egyptian Navy'), 'Ex-russische Bestellung, umgeleitet'),
    ws('Kriegsschiffe', 'FREMM-Fregatte', 2, 'Frankreich/Italien', 'Aktiv', WP('FREMM_multipurpose_frigate'), WP_L('FREMM-Fregatte')),
    ws('U-Boote', 'Type 209/1400mod', 4, 'Deutschland (ThyssenKrupp)', 'Aktiv', IISS, IISS_L),
    ws('Flugabwehr', 'S-300VM Antey-2500', 1, 'Russland', 'Aktiv', WP('S-300VM_missile_system'), WP_L('S-300VM Antey-2500'), '1 Batterie / System'),
  ],
  actors: [
    act('Wilayat Sinai (IS-Sinai)', 'Terrororganisation', 'Ableger des Islamischen Staates auf der Sinai-Halbinsel. Verübt Anschläge auf ägyptische Sicherheitskräfte und Zivilisten. Seit der Operation Sinai 2018 stark geschwächt.', 'Geschwächt', 'Sinai-Halbinsel (Nord-Sinai)', '500–1.000', WP('Sinai_insurgency'), WP_L('Sinai-Insurgenz')),
    act('Muslimbruderschaft', 'Politische Organisation', 'Nach dem Sturz Mursis 2013 als Terrororganisation eingestuft. Führung im Exil (Türkei, Katar). Politisch unterdrückt, aber soziale Basis vorhanden.', 'Unterdrückt', 'Landesweit (Exil-Führung)', 'Unbekannt', WP('Muslim_Brotherhood_in_Egypt'), WP_L('Muslimbruderschaft in Ägypten')),
    act('Hasm-Bewegung (حسم)', 'Terrororganisation', 'Militanter Arm mit Verbindungen zur Muslimbruderschaft. Verübt gezielte Anschläge auf Sicherheitskräfte und Justiz.', 'Geschwächt', 'Kairo, Nil-Delta', '200–500', WP('Hasm_Movement'), WP_L('Hasm-Bewegung')),
  ],
  conflicts: [
    con('Sinai-Insurgenz', ['Ägyptische Streitkräfte', 'Wilayat Sinai (IS)'], 'Aktiv (niedrige Intensität)', 2011, undefined, 'Aufstand islamistischer Militanter auf der Sinai-Halbinsel gegen ägyptische Sicherheitskräfte. Eskalierte nach dem Sturz Mubaraks 2011 und insbesondere nach 2013. Die Operation Sinai 2018 reduzierte die Bedrohung erheblich.', 'Tausende Tote (Kombattanten und Zivilisten)', WP('Sinai_insurgency'), WP_L('Sinai-Insurgenz')),
    con('GERD-Staudamm-Streit', ['Ägypten', 'Äthiopien', 'Sudan'], 'Diplomatisch angespannt', 2011, undefined, 'Streit über den Grand Ethiopian Renaissance Dam (GERD) am Blauen Nil. Ägypten befürchtet gravierende Auswirkungen auf seine Wasserversorgung. Verhandlungen stocken.', 'Kein bewaffneter Konflikt', WP('Grand_Ethiopian_Renaissance_Dam'), WP_L('GERD-Staudamm')),
  ],
  relations: [
    rel('US', 'USA', '🇺🇸', 'Strategischer Partner', 'Zweitgrößter Empfänger US-amerikanischer Militärhilfe ($1,3 Mrd./Jahr). Gemeinsame Militärübung Bright Star. Kooperation bei Terrorbekämpfung und Suezkanal-Sicherheit.', WP('Egypt%E2%80%93United_States_relations'), WP_L('Ägyptisch-amerikanische Beziehungen')),
    rel('SA', 'Saudi-Arabien', '🇸🇦', 'Verbündeter', 'Enge Kooperation seit 2013. Finanzielle Unterstützung, gemeinsame Position gegen Muslimbruderschaft und Iran. Gemeinsame Marineübungen im Roten Meer.', WP('Egypt%E2%80%93Saudi_Arabia_relations'), WP_L('Ägyptisch-saudische Beziehungen')),
    rel('IL', 'Israel', '🇮🇱', 'Friedenspartner', 'Camp-David-Abkommen 1978. Sicherheitskooperation auf dem Sinai. Gemeinsame Bekämpfung von Schmugglernetzwerken in der Sinai-Grenzregion.', WP('Camp_David_Accords'), WP_L('Camp-David-Abkommen')),
    rel('ET', 'Äthiopien', '🇪🇹', 'Angespannt', 'Schwere Spannungen wegen des GERD-Staudamms. Ägypten sieht existenzielle Bedrohung seiner Wasserversorgung (97% aus dem Nil).', WP('Egypt%E2%80%93Ethiopia_relations'), WP_L('Ägyptisch-äthiopische Beziehungen')),
    rel('RU', 'Russland', '🇷🇺', 'Partner', 'Wachsende Militärpartnerschaft: MiG-29M, Ka-52, S-300VM. Geplantes Kernkraftwerk El Dabaa (Rosatom). Diplomatische Zusammenarbeit in Libyen.', WP('Egypt%E2%80%93Russia_relations'), WP_L('Ägyptisch-russische Beziehungen')),
    rel('FR', 'Frankreich', '🇫🇷', 'Partner', 'Großer Waffenlieferant: Rafale, Mistral-LHD, FREMM-Fregatten. Vertiefungsabkommen für maritime Sicherheit im östlichen Mittelmeer.', WP('Egypt%E2%80%93France_relations'), WP_L('Ägyptisch-französische Beziehungen')),
  ],
  missions: [
    mis('MFO', 'Multinational Force and Observers', 'Sonstige', 'Friedenssicherung', 'Aktiv', 1982, undefined, 1150, 'Multinationale Beobachtermission zur Überwachung des Camp-David-Friedensvertrags auf der Sinai-Halbinsel. Beteiligt sind 13 Nationen.', ['EG', 'IL'], 'https://mfo.org/', 'MFO – Multinational Force and Observers'),
  ],
};

// ═══════════════════════════════════════════════════════════════
// NIGERIA (NG)
// ═══════════════════════════════════════════════════════════════

const NG: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Nigerian Armed Forces',
    founded: 1960,
    activePersonnel: 223000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 80000,
    militaryBudget: 2600000000,
    budgetPercentGDP: 0.6,
    conscription: false,
    commanderInChief: 'Präsident Bola Tinubu',
    source: GFP('nigeria'),
    sourceLabel: GFP_L('Nigeria'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-72M1', 77, 'Tschechien/Polen', 'Aktiv', IISS, IISS_L),
    ws('Kampfpanzer', 'Vickers Mk.3', 150, 'Großbritannien', 'Teilweise aktiv', IISS, IISS_L, 'Viele in schlechtem Zustand'),
    ws('Gepanzerte Fahrzeuge', 'BTR-3/BTR-4', 110, 'Ukraine', 'Aktiv', WP('BTR-4'), WP_L('BTR-4')),
    ws('Kampfflugzeuge', 'JF-17 Thunder', 3, 'Pakistan/China', 'Lieferung', WP('CAC/PAC_JF-17_Thunder'), WP_L('JF-17 Thunder'), 'Vertrag über 3 Stück, weitere geplant'),
    ws('Kampfflugzeuge', 'F-7Ni', 12, 'China', 'Aktiv', IISS, IISS_L),
    ws('Leichte Kampfflugzeuge', 'A-29 Super Tucano', 12, 'USA', 'Aktiv', WP('Embraer_EMB_314_Super_Tucano'), WP_L('A-29 Super Tucano'), '$593 Mio. Deal, Lieferung 2021'),
    ws('Leichte Kampfflugzeuge', 'Alpha Jet', 24, 'Frankreich/Deutschland', 'Teilweise aktiv', IISS, IISS_L),
    ws('Hubschrauber', 'Mi-35M', 12, 'Russland', 'Aktiv', WP('Mil_Mi-24'), WP_L('Mi-35M (Mi-24 Variante)')),
    ws('Hubschrauber', 'AW109', 12, 'Italien', 'Aktiv', WP('AgustaWestland_AW109'), WP_L('AW109')),
    ws('UAV/Drohnen', 'CH-3/CH-4', 6, 'China', 'Aktiv', WP('CASC_Rainbow'), WP_L('CASC Rainbow CH-3/CH-4'), 'Bewaffnete MALE-Drohnen'),
    ws('Kriegsschiffe', 'Hamilton-Klasse (Cutter)', 1, 'USA (ex-USCG)', 'Aktiv', WP('Nigerian_Navy'), WP_L('Nigerian Navy')),
  ],
  actors: [
    act('Boko Haram (JAS)', 'Terrororganisation', 'Jama\'atu Ahlis Sunna Lidda\'awati wal-Jihad. Islamistische Terrorgruppe, gegründet 2002 von Mohammed Yusuf. Ziel: Islamischer Staat in Nordnigeria. Verantwortlich für Entführung von Chibok-Mädchen (2014).', 'Aktiv (geschwächt)', 'Borno, Yobe, Adamawa (Nordost-Nigeria)', '5.000–7.000', WP('Boko_Haram_insurgency'), WP_L('Boko-Haram-Aufstand')),
    act('ISWAP (IS Westafrika)', 'Terrororganisation', 'Abspaltung von Boko Haram 2016. Treueid an IS. Stärker organisiert, kontrolliert Gebiete am Tschadsee. Gezielte Angriffe auf Militärbasen.', 'Aktiv', 'Tschadsee-Region, Nordost-Nigeria', '3.000–5.000', WP('Islamic_State_in_West_Africa'), WP_L('ISWAP')),
    act('Banditengruppen (Nordwesten)', 'Bewaffnete Gruppen', 'Lose organisierte kriminelle und ethnische Milizen. Massenentführungen, Viehdiebstahl, Angriffe auf Dörfer. Zunehmende Verbindungen zu dschihadistischen Gruppen.', 'Aktiv', 'Zamfara, Katsina, Kaduna, Sokoto', '30.000+', WP('Nigerian_bandit_conflict'), WP_L('Banditenkonflikt in Nigeria')),
    act('IPOB / ESN', 'Separatistische Miliz', 'Indigenous People of Biafra (IPOB) und Eastern Security Network (ESN). Streben nach Unabhängigkeit für Biafra (Südosten). Bewaffnete Angriffe auf Sicherheitskräfte.', 'Aktiv', 'Südost-Nigeria (Igbo-Staaten)', '10.000+', WP('Indigenous_People_of_Biafra'), WP_L('IPOB')),
  ],
  conflicts: [
    con('Boko-Haram-Aufstand', ['Nigeria (MNJTF)', 'Boko Haram', 'ISWAP'], 'Aktiv', 2009, undefined, 'Bewaffneter Aufstand islamistischer Gruppen im Nordosten Nigerias. Über 350.000 Tote, Millionen Vertriebene. Multinational Joint Task Force (MNJTF) mit Tschad, Kamerun, Niger.', '350.000+ Tote (seit 2009)', WP('Boko_Haram_insurgency'), WP_L('Boko-Haram-Aufstand')),
    con('Banditengewalt im Nordwesten', ['Nigerianische Streitkräfte', 'Bewaffnete Banden', 'Ethnische Milizen'], 'Aktiv', 2011, undefined, 'Eskalation von Banditengewalt, Massenentführungen und ethnischen Konflikten im Nordwesten Nigerias. Militäreinsätze zeigen begrenzte Wirkung.', '10.000+ Tote jährlich', WP('Nigerian_bandit_conflict'), WP_L('Banditenkonflikt in Nigeria')),
  ],
  relations: [
    rel('US', 'USA', '🇺🇸', 'Sicherheitspartner', 'Lieferung von A-29 Super Tucano. Gemeinsame Ausbildungsprogramme. US AFRICOM unterstützt bei Terrorbekämpfung. Spannungen wegen Menschenrechtsfragen.', WP('Nigeria%E2%80%93United_States_relations'), WP_L('Nigerianisch-amerikanische Beziehungen')),
    rel('GB', 'Großbritannien', '🇬🇧', 'Historischer Partner', 'Ehemalige Kolonialmacht. British Military Advisory and Training Team (BMATT). Enge Verteidigungszusammenarbeit, gemeinsame Übungen.', WP('Nigeria%E2%80%93United_Kingdom_relations'), WP_L('Nigerianisch-britische Beziehungen')),
    rel('CN', 'China', '🇨🇳', 'Wachsender Partner', 'Waffenlieferant (CH-3/CH-4 Drohnen, F-7). Infrastrukturinvestitionen (Standard-Gauge-Railway Lagos-Calabar). Belt-and-Road-Partner.', WP('China%E2%80%93Nigeria_relations'), WP_L('Chinesisch-nigerianische Beziehungen')),
    rel('CM', 'Kamerun', '🇨🇲', 'Partner', 'Gemeinsame Grenzoperationen gegen Boko Haram im Rahmen der MNJTF. Kooperation im Golf von Guinea gegen Piraterie.', WP('Multinational_Joint_Task_Force'), WP_L('MNJTF')),
  ],
  missions: [
    mis('MNJTF', 'Multinational Joint Task Force', 'AU', 'Terrorbekämpfung', 'Aktiv', 2015, undefined, 10000, 'Multinationale Truppe gegen Boko Haram und ISWAP mit Nigeria, Tschad, Kamerun, Niger und Benin. Hauptquartier in N\'Djamena.', ['NG', 'TD', 'CM', 'NE', 'BJ'], WP('Multinational_Joint_Task_Force'), WP_L('MNJTF')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// SOUTH AFRICA (ZA)
// ═══════════════════════════════════════════════════════════════

const ZA: CountryMilitaryData = {
  overview: {
    armedForcesName: 'South African National Defence Force (SANDF)',
    founded: 1994,
    activePersonnel: 73000,
    reservePersonnel: 15000,
    paramilitaryPersonnel: 0,
    militaryBudget: 3500000000,
    budgetPercentGDP: 0.7,
    conscription: false,
    commanderInChief: 'Präsident Cyril Ramaphosa',
    source: GFP('south-africa'),
    sourceLabel: GFP_L('Südafrika'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'Olifant Mk.2', 167, 'Südafrika', 'Teilweise aktiv', IISS, IISS_L, 'Eigenentwicklung, basierend auf Centurion'),
    ws('Gepanzerte Fahrzeuge', 'Rooikat-76', 242, 'Südafrika', 'Aktiv', IISS, IISS_L, 'Radpanzer mit 76mm-Kanone'),
    ws('Gepanzerte Fahrzeuge', 'Badger IFV (Patria AMV)', 238, 'Finnland/Südafrika', 'Lieferung', WP('Patria_AMV'), WP_L('Patria AMV / Badger IFV'), 'Projekt Hoefyster'),
    ws('Artillerie', 'G6 Rhino (155mm)', 43, 'Südafrika (Denel)', 'Aktiv', IISS, IISS_L, 'Selbstfahrhaubitze, weltklasse'),
    ws('Kampfflugzeuge', 'JAS 39C/D Gripen', 26, 'Schweden', 'Aktiv', WP('Saab_JAS_39_Gripen'), WP_L('JAS 39 Gripen'), '17 Einsitzer + 9 Doppelsitzer'),
    ws('Hubschrauber', 'Rooivalk CSH-2', 11, 'Südafrika (Denel)', 'Aktiv', WP('Denel_Rooivalk'), WP_L('Rooivalk'), 'Einziger in Afrika entwickelter Kampfhubschrauber'),
    ws('Hubschrauber', 'Oryx (Super Puma)', 39, 'Südafrika/Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Kriegsschiffe', 'Valour-Klasse (MEKO A-200)', 4, 'Deutschland', 'Aktiv', WP('Valour-class_frigate'), WP_L('Valour-Klasse'), 'Mehrzweckfregatten'),
    ws('U-Boote', 'Heroine-Klasse (Type 209)', 3, 'Deutschland', 'Aktiv (eingeschränkt)', IISS, IISS_L, 'Einsatzbereitschaft problematisch'),
  ],
  actors: [
    act('Cape Flats Gangs', 'Kriminelle Organisation', 'Organisierte Gangs in Western Cape (Hard Livings, Americans, etc.). Drogenhandel, Erpressung, Auftragsmorde. Schwerer gesellschaftlicher Schaden.', 'Aktiv', 'Western Cape (Kapstadt)', '100.000+ Mitglieder', WP('Gangs_in_South_Africa'), WP_L('Gangs in Südafrika')),
    act('Taxi-Industrie-Gewalt', 'Bewaffnete Gruppen', 'Gewalttätige Konflikte zwischen rivalisierenden Minibus-Taxi-Verbänden um Routen und Territorium. Regelmäßige Schießereien und Tote.', 'Aktiv', 'KwaZulu-Natal, Gauteng, Western Cape', 'Tausende Beteiligte', WP('Taxi_wars_in_South_Africa'), WP_L('Taxi-Kriege in Südafrika')),
  ],
  conflicts: [
    con('Interne Sicherheitskrise', ['SANDF', 'SAPS', 'Organisierte Kriminalität'], 'Aktiv', 2000, undefined, 'Südafrika hat eine der höchsten Mordraten weltweit (~27.000/Jahr). Organisierte Kriminalität, Ganggewalt und Cash-in-Transit-Überfälle dominieren. Die SANDF unterstützt die Polizei bei Brennpunkten.', '~27.000 Morde/Jahr', WP('Crime_in_South_Africa'), WP_L('Kriminalität in Südafrika')),
  ],
  relations: [
    rel('RU', 'Russland', '🇷🇺', 'BRICS-Partner', 'BRICS-Mitglied. Gemeinsame Marineübungen. Diplomatische Unterstützung. Umstrittene Beziehung wegen Ukraine-Konflikt.', WP('Russia%E2%80%93South_Africa_relations'), WP_L('Russisch-südafrikanische Beziehungen')),
    rel('CN', 'China', '🇨🇳', 'BRICS-Partner', 'BRICS-Gründungsmitglied. Größter Handelspartner. Gemeinsame Marineübungen. Umfangreiche Infrastrukturinvestitionen.', WP('China%E2%80%93South_Africa_relations'), WP_L('Chinesisch-südafrikanische Beziehungen')),
    rel('US', 'USA', '🇺🇸', 'Partner', 'AGOA-Handelsabkommen. Sicherheitskooperation. Spannungen wegen Südafrikas Nicht-Verurteilung von Russlands Ukraine-Invasion.', WP('South_Africa%E2%80%93United_States_relations'), WP_L('Südafrikanisch-amerikanische Beziehungen')),
    rel('MZ', 'Mosambik', '🇲🇿', 'Regionaler Partner', 'SADC-Einsatz in Cabo Delgado gegen Islamisten (SAMIM). Gemeinsame Grenz- und Seeoperationen.', WP('SADC_Mission_in_Mozambique'), WP_L('SAMIM')),
    rel('CD', 'DR Kongo', '🇨🇩', 'Friedensstifter', 'SANDF-Truppen in der SADC-Mission im Osten der DRK (SAMIDRC). Unterstützung der Stabilisierung.', WP('Southern_African_Development_Community'), WP_L('SADC')),
  ],
  missions: [
    mis('SAMIDRC', 'SADC Mission in DRC', 'Sonstige', 'Friedenssicherung', 'Aktiv', 2023, undefined, 2900, 'SADC-Friedensmission im Osten der DR Kongo gegen M23 und andere bewaffnete Gruppen. Südafrika stellt das größte Kontingent.', ['CD'], WP('SADC_Mission_in_the_Democratic_Republic_of_Congo'), WP_L('SAMIDRC')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// ALGERIA (DZ)
// ═══════════════════════════════════════════════════════════════

const DZ: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Nationale Volksarmee (الجيش الوطني الشعبي / ANP)',
    founded: 1962,
    activePersonnel: 280000,
    reservePersonnel: 150000,
    paramilitaryPersonnel: 187000,
    militaryBudget: 10300000000,
    budgetPercentGDP: 5.3,
    conscription: true,
    commanderInChief: 'Präsident Abdelmadjid Tebboune',
    source: GFP('algeria'),
    sourceLabel: GFP_L('Algerien'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-90SA', 572, 'Russland', 'Aktiv', WP('T-90'), WP_L('T-90'), 'Größte T-90-Flotte außerhalb Russlands/Indiens'),
    ws('Kampfpanzer', 'T-72', 300, 'Russland', 'Aktiv/Reserve', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'BMP-2', 690, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Artillerie', '2S19 Msta-S (152mm)', 185, 'Russland', 'Aktiv', WP('2S19_Msta'), WP_L('2S19 Msta-S')),
    ws('MLRS', 'BM-30 Smerch', 18, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'Su-30MKA', 58, 'Russland', 'Aktiv', WP('Sukhoi_Su-30MKA'), WP_L('Su-30MKA'), 'Modernste Kampfflugzeuge der Luftwaffe'),
    ws('Kampfflugzeuge', 'MiG-29SMT', 36, 'Russland', 'Aktiv', WP('Mikoyan_MiG-29SMT'), WP_L('MiG-29SMT')),
    ws('Kampfflugzeuge', 'Su-24M/MK', 32, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'Su-57 (geplant)', 14, 'Russland', 'Bestellt', WP('Sukhoi_Su-57'), WP_L('Su-57 Felon'), 'Erste Su-57-Exportbestellung weltweit (unbestätigt)'),
    ws('Hubschrauber', 'Mi-28N Night Hunter', 42, 'Russland', 'Aktiv', WP('Mil_Mi-28'), WP_L('Mi-28N Night Hunter')),
    ws('U-Boote', 'Kilo-Klasse (Projekt 636)', 6, 'Russland', 'Aktiv', IISS, IISS_L, '4 Kilo + 2 Improved Kilo'),
    ws('Kriegsschiffe', 'MEKO A-200AN Fregatte', 2, 'Deutschland', 'Aktiv', WP('MEKO_A-200'), WP_L('MEKO A-200')),
    ws('Flugabwehr', 'S-300PMU-2', 8, 'Russland', 'Aktiv', WP('S-300_missile_system'), WP_L('S-300PMU-2'), '8 Batterien'),
    ws('Flugabwehr', 'S-400 (geplant)', 2, 'Russland', 'Bestellt', WP('S-400_missile_system'), WP_L('S-400 Triumf'), 'Vertrag über 2 Regimenter'),
    ws('Flugabwehr', 'Pantsir-S1', 38, 'Russland', 'Aktiv', WP('Pantsir_missile_system'), WP_L('Pantsir-S1')),
  ],
  actors: [
    act('AQIM (Al-Qaida im Islamischen Maghreb)', 'Terrororganisation', 'Hervorgegangen aus der algerischen GSPC. Operiert hauptsächlich im Sahel. In Algerien selbst stark geschwächt durch Sicherheitsoperationen.', 'Aktiv (im Sahel) / Geschwächt (in Algerien)', 'Sahel-Region, Südalgerien', '500–1.000', WP('Al-Qaeda_in_the_Islamic_Maghreb'), WP_L('AQIM')),
    act('Rachad-Bewegung', 'Politische Opposition', 'Im Exil operierende islamistische Oppositionsbewegung. Von der algerischen Regierung als terroristisch eingestuft.', 'Aktiv (Exil)', 'Ausland (Großbritannien, Türkei)', 'Unbekannt', WP('Rachad'), WP_L('Rachad')),
  ],
  conflicts: [
    con('Post-Bürgerkrieg-Stabilisierung', ['ANP', 'AQIM-Reste', 'IS-Zellen'], 'Niedrige Intensität', 1991, undefined, 'Der algerische Bürgerkrieg (1991-2002) forderte ca. 200.000 Tote. Seitdem laufende Anti-Terror-Operationen gegen Reste islamistischer Gruppen. Regelmäßige Festnahmen und Operationen.', '200.000+ (Bürgerkrieg)', WP('Algerian_Civil_War'), WP_L('Algerischer Bürgerkrieg')),
    con('Westsahara-Streit (diplomatisch)', ['Algerien/Polisario', 'Marokko'], 'Eingefroren', 1975, undefined, 'Algerien unterstützt die Polisario-Front und beherbergt Sahrawi-Flüchtlinge in Tindouf. Diplomatische Beziehungen zu Marokko 2021 abgebrochen.', 'Kein aktiver Kampf', WP('Western_Sahara_conflict'), WP_L('Westsahara-Konflikt')),
  ],
  relations: [
    rel('RU', 'Russland', '🇷🇺', 'Strategischer Partner', 'Größter Waffenlieferant (ca. 70% aller Rüstungsimporte). T-90, Su-30MKA, Kilo-U-Boote, S-400. Langjährige Beziehungen seit der Sowjetzeit.', WP('Algeria%E2%80%93Russia_relations'), WP_L('Algerisch-russische Beziehungen')),
    rel('MA', 'Marokko', '🇲🇦', 'Rivale', 'Diplomatische Beziehungen seit 2021 abgebrochen. Rivalität um Westsahara, regionale Hegemonie und Einfluss. Grenze seit 1994 geschlossen.', WP('Algeria%E2%80%93Morocco_relations'), WP_L('Algerisch-marokkanische Beziehungen')),
    rel('CN', 'China', '🇨🇳', 'Wirtschaftspartner', 'Wachsende Wirtschaftsbeziehungen. Drittgrößter Waffenlieferant. Belt-and-Road-Kooperation.', WP('Algeria%E2%80%93China_relations'), WP_L('Algerisch-chinesische Beziehungen')),
    rel('FR', 'Frankreich', '🇫🇷', 'Kompliziert', 'Ehemalige Kolonialmacht. Belastete Beziehungen durch koloniales Erbe. Wichtiger Wirtschaftspartner trotz politischer Spannungen.', WP('Algeria%E2%80%93France_relations'), WP_L('Algerisch-französische Beziehungen')),
    rel('TN', 'Tunesien', '🇹🇳', 'Partner', 'Kooperative Nachbarschaft. Gemeinsame Grenzpatrouille. Unterstützung Tunesiens bei Terrorbekämpfung.', WP('Algeria%E2%80%93Tunisia_relations'), WP_L('Algerisch-tunesische Beziehungen')),
  ],
  missions: [],
};

// ═══════════════════════════════════════════════════════════════
// MOROCCO (MA)
// ═══════════════════════════════════════════════════════════════

const MA: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Königliche Streitkräfte Marokkos (القوات المسلحة الملكية / FAR)',
    founded: 1956,
    activePersonnel: 196000,
    reservePersonnel: 150000,
    paramilitaryPersonnel: 50000,
    militaryBudget: 5400000000,
    budgetPercentGDP: 3.8,
    conscription: true,
    commanderInChief: 'König Mohammed VI.',
    source: GFP('morocco'),
    sourceLabel: GFP_L('Marokko'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'M1A1 SA Abrams', 222, 'USA', 'Aktiv', WP('M1_Abrams'), WP_L('M1 Abrams'), 'M1A2-Upgrade geplant'),
    ws('Kampfpanzer', 'T-72B/BV', 136, 'Tschechien/Belarus', 'Aktiv', IISS, IISS_L),
    ws('Kampfpanzer', 'VT-1A', 150, 'China', 'Aktiv', WP('VT-4'), WP_L('VT-1A (Norinco)'), 'Leichtpanzer'),
    ws('Artillerie', 'M109A5 (155mm)', 200, 'USA', 'Aktiv', IISS, IISS_L),
    ws('MLRS', 'HIMARS', 36, 'USA', 'Aktiv', WP('M142_HIMARS'), WP_L('M142 HIMARS'), 'Einziger HIMARS-Nutzer in Afrika'),
    ws('Kampfflugzeuge', 'F-16C/D Block 52+', 48, 'USA', 'Aktiv', WP('General_Dynamics_F-16_Fighting_Falcon'), WP_L('F-16 Fighting Falcon'), 'Modernisiert, weitere F-16V bestellt'),
    ws('Kampfflugzeuge', 'Mirage F1', 27, 'Frankreich', 'Auslaufend', IISS, IISS_L, 'Wird durch F-16V ersetzt'),
    ws('Hubschrauber', 'AH-64D Apache', 24, 'USA', 'Aktiv', WP('Boeing_AH-64_Apache'), WP_L('AH-64 Apache')),
    ws('Hubschrauber', 'CH-47D Chinook', 12, 'USA', 'Aktiv', WP('Boeing_CH-47_Chinook'), WP_L('CH-47 Chinook')),
    ws('UAV/Drohnen', 'Bayraktar TB2', 13, 'Türkei', 'Aktiv', WP('Bayraktar_TB2'), WP_L('Bayraktar TB2')),
    ws('Kriegsschiffe', 'FREMM-Fregatte (Mohammed VI)', 1, 'Frankreich', 'Aktiv', WP('FREMM_multipurpose_frigate'), WP_L('FREMM-Fregatte')),
    ws('Kriegsschiffe', 'Sigma-Klasse Korvette', 3, 'Niederlande', 'Aktiv', WP('Sigma-class_corvette'), WP_L('Sigma-Klasse Korvette')),
  ],
  actors: [
    act('Polisario-Front (SADR)', 'Separatistische Bewegung', 'Sahrauische Befreiungsbewegung, gegründet 1973. Kämpft für die Unabhängigkeit der Westsahara. Regierung im Exil in Tindouf (Algerien). Waffenstillstand 1991, gebrochen 2020.', 'Aktiv', 'Westsahara, Flüchtlingslager Tindouf (Algerien)', '5.000–10.000', WP('Polisario_Front'), WP_L('Polisario-Front')),
  ],
  conflicts: [
    con('Westsahara-Konflikt', ['Marokko (FAR)', 'Polisario-Front (SADR)'], 'Niedrige Intensität', 1975, undefined, 'Marokko kontrolliert den Großteil der Westsahara hinter einer 2.700 km langen Sandmauer (Berme). Der Waffenstillstand von 1991 wurde 2020 durch die Polisario aufgekündigt. USA erkannten 2020 Marokkos Souveränität an.', '16.000+ (Gesamtkonflikt)', WP('Western_Sahara_conflict'), WP_L('Westsahara-Konflikt')),
  ],
  relations: [
    rel('US', 'USA', '🇺🇸', 'Enger Verbündeter', 'Major Non-NATO Ally (seit 2004). Lieferant von F-16, M1 Abrams, Apache, HIMARS. Jährliche Übung African Lion. USA erkannten 2020 Marokkos Westsahara-Souveränität an.', WP('Morocco%E2%80%93United_States_relations'), WP_L('Marokkanisch-amerikanische Beziehungen')),
    rel('FR', 'Frankreich', '🇫🇷', 'Partner (angespannt)', 'Historisch enger Partner. FREMM-Fregatte, Rafale-Gespräche. Seit 2023 zunehmende Spannungen wegen Visapolitik und Westsahara-Positionierung.', WP('France%E2%80%93Morocco_relations'), WP_L('Französisch-marokkanische Beziehungen')),
    rel('IL', 'Israel', '🇮🇱', 'Partner', 'Normalisierung 2020 (Abraham-Abkommen). Beschaffung israelischer Drohnen (Heron, Harop). Cybersicherheitskooperation (NSO/Pegasus-Skandal).', WP('Israel%E2%80%93Morocco_relations'), WP_L('Israelisch-marokkanische Beziehungen')),
    rel('DZ', 'Algerien', '🇩🇿', 'Rivale', 'Hauptrivale. Algerien unterstützt Polisario. Diplomatische Beziehungen 2021 durch Algerien abgebrochen. Wettrüsten in der Region.', WP('Algeria%E2%80%93Morocco_relations'), WP_L('Algerisch-marokkanische Beziehungen')),
    rel('ES', 'Spanien', '🇪🇸', 'Komplizierter Partner', 'Wichtiger Handelspartner. Spannungen wegen Ceuta/Melilla, Migration und Westsahara. Spanien erkannte 2022 Marokkos Autonomieplan an.', WP('Morocco%E2%80%93Spain_relations'), WP_L('Marokkanisch-spanische Beziehungen')),
  ],
  missions: [
    mis('MINURSO', 'UN Mission for the Referendum in Western Sahara', 'UN', 'Friedenssicherung', 'Aktiv', 1991, undefined, 460, 'UN-Mission zur Überwachung des Waffenstillstands in der Westsahara und Vorbereitung eines Referendums (nie durchgeführt). Ca. 230 Militärbeobachter.', ['MA', 'EH'], 'https://minurso.unmissions.org/', 'MINURSO'),
  ],
};

// ═══════════════════════════════════════════════════════════════
// ETHIOPIA (ET)
// ═══════════════════════════════════════════════════════════════

const ET: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Ethiopian National Defence Force (ENDF)',
    founded: 1996,
    activePersonnel: 162000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 0,
    militaryBudget: 1000000000,
    budgetPercentGDP: 0.5,
    conscription: false,
    commanderInChief: 'Premierminister Abiy Ahmed',
    source: GFP('ethiopia'),
    sourceLabel: GFP_L('Äthiopien'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-72B1', 400, 'Russland/Ukraine', 'Aktiv', IISS, IISS_L, 'Kampferprobt im Tigray-Krieg'),
    ws('Gepanzerte Fahrzeuge', 'BMP-1', 350, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Artillerie', 'D-30 (122mm)', 450, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('MLRS', 'BM-21 Grad', 50, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'Su-27SK/UBK', 18, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('UAV/Drohnen', 'Bayraktar TB2', 6, 'Türkei', 'Aktiv', WP('Bayraktar_TB2'), WP_L('Bayraktar TB2'), 'Entscheidend im Tigray-Krieg'),
    ws('UAV/Drohnen', 'Wing Loong II', 4, 'China/VAE', 'Aktiv', WP('Wing_Loong_II'), WP_L('Wing Loong II')),
    ws('Hubschrauber', 'Mi-35M', 18, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Hubschrauber', 'Mi-17', 30, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Flugabwehr', 'Pantsir-S1', 5, 'Russland/VAE', 'Aktiv', WP('Pantsir_missile_system'), WP_L('Pantsir-S1')),
  ],
  actors: [
    act('TPLF (Tigray People\'s Liberation Front)', 'Bewaffnete Bewegung', 'Ehemals regierende Partei Äthiopiens (1991-2018). Führte den Tigray-Krieg 2020-2022. Waffenstillstand von Pretoria im November 2022. Demobilisierung eingeleitet.', 'Waffenstillstand', 'Tigray-Region', '150.000–200.000 (Kriegszeit)', WP('Tigray_People%27s_Liberation_Front'), WP_L('TPLF')),
    act('OLA (Oromo Liberation Army)', 'Rebellengruppe', 'Bewaffneter Arm der OLF. Kämpft für Selbstbestimmung der Oromo. Angriffe auf Zivilisten und Regierungstruppen in Oromia und Amhara.', 'Aktiv', 'Oromia-Region, westliches Äthiopien', '10.000+', WP('Oromo_Liberation_Army'), WP_L('OLA')),
    act('Fano-Miliz', 'Amharische Miliz', 'Bewaffnete amharische Miliz. Kämpfte im Tigray-Krieg auf Seiten der Regierung. Nach dem Waffenstillstand zunehmend gegen die Zentralregierung.', 'Aktiv', 'Amhara-Region', '50.000+', WP('Fano_(militia)'), WP_L('Fano-Miliz')),
    act('Al-Shabaab (Grenzgebiet)', 'Terrororganisation', 'Somalische islamistische Terrorgruppe. Führt gelegentlich Angriffe im Ogaden-Gebiet durch. Hauptbedrohung für die Somali-Region.', 'Aktiv (begrenzt)', 'Somali-Region (Ogaden)', 'Unbekannt', WP('Al-Shabaab_(militant_group)'), WP_L('Al-Shabaab')),
  ],
  conflicts: [
    con('Tigray-Krieg', ['ENDF + Eritrea + Amhara-Milizen', 'TPLF'], 'Waffenstillstand', 2020, 2022, 'Einer der tödlichsten Konflikte des 21. Jahrhunderts. Begann mit TPLF-Angriff auf Nordkommando im November 2020. Pretoria-Abkommen im November 2022 beendete die Kampfhandlungen.', '300.000–600.000 Tote (geschätzt)', WP('Tigray_War'), WP_L('Tigray-Krieg')),
    con('Amhara-Konflikt', ['ENDF', 'Fano-Miliz'], 'Aktiv', 2023, undefined, 'Aufstand amharischer Fano-Milizen gegen die Zentralregierung nach Auflösung regionaler Spezialeinheiten. Ausnahmezustand in Amhara verhängt.', 'Tausende (keine genauen Zahlen)', WP('Fano_insurgency'), WP_L('Fano-Aufstand')),
    con('OLA-Aufstand (Oromia)', ['ENDF', 'OLA'], 'Aktiv', 2018, undefined, 'Bewaffneter Widerstand der OLA gegen die Zentralregierung. Angriffe auf Infrastruktur und Sicherheitskräfte in der Oromia-Region.', 'Tausende Tote', WP('Oromo_conflict'), WP_L('Oromo-Konflikt')),
  ],
  relations: [
    rel('ER', 'Eritrea', '🇪🇷', 'Kompliziert', 'Friedensabkommen 2018 (Nobelpreis für Abiy). Gemeinsamer Krieg in Tigray. Seitdem zunehmende Spannungen wegen eritreischer Truppenpräsenz in Tigray.', WP('Eritrea%E2%80%93Ethiopia_relations'), WP_L('Eritreisch-äthiopische Beziehungen')),
    rel('EG', 'Ägypten', '🇪🇬', 'Angespannt', 'Schwere Spannungen wegen GERD-Staudamm. Ägypten droht implizit mit Militäraktion. Äthiopien hat Stausee 2020 begonnen zu füllen.', WP('Egypt%E2%80%93Ethiopia_relations'), WP_L('Ägyptisch-äthiopische Beziehungen')),
    rel('SO', 'Somalia', '🇸🇴', 'Angespannt', 'Äthiopien hat ein MoU mit Somaliland unterzeichnet (Meerzugang). Somalia sieht dies als Souveränitätsverletzung. Äthiopische Truppen waren jahrelang in Somalia stationiert.', WP('Ethiopia%E2%80%93Somalia_relations'), WP_L('Äthiopisch-somalische Beziehungen')),
    rel('CN', 'China', '🇨🇳', 'Partner', 'Hauptfinanzier der Addis Abeba-Dschibuti-Eisenbahn. Belt-and-Road-Partner. Sitz der AU in chinesisch finanziertem Gebäude.', WP('China%E2%80%93Ethiopia_relations'), WP_L('Chinesisch-äthiopische Beziehungen')),
    rel('TR', 'Türkei', '🇹🇷', 'Wachsender Partner', 'Bayraktar TB2 Drohnen waren entscheidend im Tigray-Krieg. Wachsende wirtschaftliche und militärische Beziehungen.', WP('Ethiopia%E2%80%93Turkey_relations'), WP_L('Äthiopisch-türkische Beziehungen')),
  ],
  missions: [],
};

// ═══════════════════════════════════════════════════════════════
// DR CONGO (CD)
// ═══════════════════════════════════════════════════════════════

const CD: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Forces Armées de la République Démocratique du Congo (FARDC)',
    founded: 2003,
    activePersonnel: 134000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 0,
    militaryBudget: 800000000,
    budgetPercentGDP: 1.2,
    conscription: false,
    commanderInChief: 'Präsident Félix Tshisekedi',
    source: GFP('democratic-republic-of-the-congo'),
    sourceLabel: GFP_L('DR Kongo'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-55', 30, 'Sowjetunion/China', 'Teilweise aktiv', IISS, IISS_L, 'Veraltet, geringe Einsatzbereitschaft'),
    ws('Gepanzerte Fahrzeuge', 'BMP-1', 70, 'Sowjetunion', 'Teilweise aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Ratel 20/90', 50, 'Südafrika', 'Teilweise aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'Su-25', 6, 'Russland/Georgien', 'Aktiv', IISS, IISS_L, 'Geringe Einsatzbereitschaft'),
    ws('Hubschrauber', 'Mi-24/Mi-35', 6, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Hubschrauber', 'Mi-17', 8, 'Russland', 'Aktiv', IISS, IISS_L),
  ],
  actors: [
    act('M23 (Mouvement du 23 Mars)', 'Rebellengruppe', 'Tutsi-dominierte Rebellengruppe, unterstützt von Ruanda. Kontrolliert Gebiete in Nord-Kivu. Rückkehr seit 2022 mit massiver Offensive.', 'Aktiv', 'Nord-Kivu (Masisi, Rutshuru)', '3.000–5.000', WP('March_23_Movement'), WP_L('M23-Bewegung')),
    act('ADF (Allied Democratic Forces)', 'Terrororganisation', 'Ugandische islamistische Gruppe, IS-Affiliierung (ISCAP). Verübt Massaker an Zivilisten in Beni-Territorium. Einer der tödlichsten Akteure im Osten.', 'Aktiv', 'Nord-Kivu (Beni-Territorium)', '2.000–3.000', WP('Allied_Democratic_Forces'), WP_L('ADF')),
    act('CODECO (Coopérative pour le Développement du Congo)', 'Ethnische Miliz', 'Lendu-Miliz in Ituri. Verübt ethnisch motivierte Massaker an Hema und anderen Gruppen. Goldminen als Finanzquelle.', 'Aktiv', 'Ituri', '3.000+', WP('Cooperative_for_the_Development_of_the_Congo'), WP_L('CODECO')),
    act('Mai-Mai-Milizen', 'Diverse Milizen', 'Sammelbegriff für dutzende lokale Selbstverteidigungsmilizen. Ethnisch, politisch und wirtschaftlich motiviert. Oft in Bergbau und Plünderungen involviert.', 'Aktiv', 'Nord-Kivu, Süd-Kivu, Tanganyika, Ituri', '50.000+', WP('Mai-Mai'), WP_L('Mai-Mai')),
    act('Ruanda (RDF) – verdeckte Unterstützung', 'Ausländischer Akteur', 'Ruanda unterstützt nach UN-Berichten die M23-Rebellen mit Truppen, Waffen und Logistik. Ruanda bestreitet jede Beteiligung.', 'Aktiv', 'Nord-Kivu', '3.000–4.000 RDF-Soldaten (UN-Schätzung)', 'https://www.undocs.org/en/S/2024/432', 'UN-Expertengruppe DRK – Bericht 2024'),
  ],
  conflicts: [
    con('Krieg im Osten der DR Kongo', ['FARDC + SAMIDRC', 'M23 + RDF', 'ADF', 'CODECO', 'Mai-Mai'], 'Aktiv', 1996, undefined, 'Chronischer bewaffneter Konflikt im Osten der DRK. Über 100 bewaffnete Gruppen aktiv. M23-Offensive seit 2022 mit Unterstützung Ruandas. MONUSCO-Abzug bis 2024. SAMIDRC als Nachfolgemission.', '6+ Millionen Tote (seit 1996)', WP('Kivu_conflict'), WP_L('Kivu-Konflikt')),
  ],
  relations: [
    rel('RW', 'Ruanda', '🇷🇼', 'Feindlich', 'Schwere Spannungen wegen Ruandas Unterstützung der M23. UN dokumentiert direkte RDF-Beteiligung. Diplomatische Beziehungen stark belastet.', WP('Democratic_Republic_of_the_Congo%E2%80%93Rwanda_relations'), WP_L('DRK-Ruanda-Beziehungen')),
    rel('ZA', 'Südafrika', '🇿🇦', 'Verbündeter', 'Südafrika führt SAMIDRC-Mission im Osten der DRK. 2.900 Soldaten stationiert. Unterstützung gegen M23.', WP('SADC_Mission_in_the_Democratic_Republic_of_Congo'), WP_L('SAMIDRC')),
    rel('UG', 'Uganda', '🇺🇬', 'Komplizierter Partner', 'Gemeinsame Operation Shujaa gegen ADF seit 2021. Gleichzeitig historisch angespanntes Verhältnis wegen Rohstoffinteressen.', WP('Operation_Shujaa'), WP_L('Operation Shujaa')),
    rel('CN', 'China', '🇨🇳', 'Wirtschaftspartner', 'Sicomines-Deal: Infrastruktur gegen Bergbaurechte ($6 Mrd.). China ist Hauptabnehmer von kongolesischem Kobalt.', WP('Sicomines'), WP_L('Sicomines')),
  ],
  missions: [
    mis('MONUSCO', 'UN Organization Stabilization Mission in the DRC', 'UN', 'Friedenssicherung', 'Abzug (bis Ende 2024)', 2010, undefined, 14500, 'Größte und teuerste UN-Friedensmission weltweit. Mandat umfasst Schutz der Zivilbevölkerung, Stabilisierung und Unterstützung der Regierung. Schrittweiser Abzug seit 2024.', ['CD'], 'https://monusco.unmissions.org/', 'MONUSCO'),
    mis('SAMIDRC', 'SADC Mission in the DRC', 'Sonstige', 'Friedensdurchsetzung', 'Aktiv', 2023, undefined, 5000, 'SADC-Einsatztruppe zur Bekämpfung bewaffneter Gruppen im Osten der DRK. Ersetzt teilweise MONUSCO. Kontingente aus Südafrika, Tansania und Malawi.', ['CD'], WP('SADC_Mission_in_the_Democratic_Republic_of_Congo'), WP_L('SAMIDRC')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// KENYA (KE)
// ═══════════════════════════════════════════════════════════════

const KE: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Kenya Defence Forces (KDF)',
    founded: 1963,
    activePersonnel: 24000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 5000,
    militaryBudget: 1100000000,
    budgetPercentGDP: 1.0,
    conscription: false,
    commanderInChief: 'Präsident William Ruto',
    source: GFP('kenya'),
    sourceLabel: GFP_L('Kenia'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'Vickers Mk.3', 76, 'Großbritannien', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'WZ-551', 70, 'China', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Bastion APC', 58, 'Südafrika', 'Aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'F-5E/F Tiger II', 17, 'USA (Jordanien)', 'Aktiv (eingeschränkt)', IISS, IISS_L, 'Alt, Ersatz gesucht'),
    ws('Hubschrauber', 'MD 530F', 33, 'USA', 'Aktiv', WP('MD_Helicopters_MD_500'), WP_L('MD 530F'), 'Leichte Kampfhubschrauber'),
    ws('Hubschrauber', 'Mi-17', 12, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Kriegsschiffe', 'P400-Klasse (Patrouille)', 2, 'Spanien', 'Aktiv', WP('Kenya_Navy'), WP_L('Kenya Navy')),
  ],
  actors: [
    act('Al-Shabaab', 'Terrororganisation', 'Somalische islamistische Terrorgruppe mit Al-Qaida-Verbindung. Verübt regelmäßig Anschläge in Kenia (Westgate 2013, Garissa University 2015, DusitD2 2019). Rekrutiert auch in Kenia.', 'Aktiv', 'Nordost-Kenia (Grenzgebiet Somalia), Küstenregion', '7.000–12.000 (Somalia)', WP('Al-Shabaab_(militant_group)'), WP_L('Al-Shabaab')),
    act('Mombasa Republican Council (MRC)', 'Separatistische Gruppe', 'Separatistenbewegung der Küstenregion. Fordert Unabhängigkeit für die ehemals britische Protektoratszone. Meist gewaltfrei, aber gelegentlich militant.', 'Geschwächt', 'Küstenprovinz (Mombasa)', '500–1.000', WP('Mombasa_Republican_Council'), WP_L('MRC')),
  ],
  conflicts: [
    con('Anti-Al-Shabaab-Operationen (Somalia)', ['KDF / AMISOM / ATMIS', 'Al-Shabaab'], 'Aktiv', 2011, undefined, 'Kenia marschierte 2011 in Somalia ein (Operation Linda Nchi) und ist seitdem Teil der AU-Mission. KDF operiert im Sektor 2 (Jubaland).', '300+ KDF-Verluste', WP('Operation_Linda_Nchi'), WP_L('Operation Linda Nchi')),
  ],
  relations: [
    rel('US', 'USA', '🇺🇸', 'Enger Verbündeter', 'Wichtigster Sicherheitspartner. Camp Lemonnier-Zugang. Jährliche Übungen. $100+ Mio. Militärhilfe. Drohnenoperationen gegen Al-Shabaab.', WP('Kenya%E2%80%93United_States_relations'), WP_L('Kenianisch-amerikanische Beziehungen')),
    rel('GB', 'Großbritannien', '🇬🇧', 'Historischer Partner', 'British Army Training Unit Kenya (BATUK) in Nanyuki. Regelmäßige Ausbildung, Militärhilfe und Übungen.', WP('British_Army_Training_Unit_Kenya'), WP_L('BATUK')),
    rel('SO', 'Somalia', '🇸🇴', 'Kompliziert', 'Militäreinsatz in Somalia seit 2011. Gleichzeitig Grenzstreit über maritime Grenze (ICJ-Urteil 2021 zugunsten Somalias). 750.000 somalische Flüchtlinge in Kenia.', WP('Kenya%E2%80%93Somalia_relations'), WP_L('Kenianisch-somalische Beziehungen')),
    rel('ET', 'Äthiopien', '🇪🇹', 'Partner', 'Kooperative Nachbarschaft. Gemeinsame Sicherheitsinteressen gegen Al-Shabaab. Wirtschaftliche Zusammenarbeit (LAPSSET-Korridor).', WP('Ethiopia%E2%80%93Kenya_relations'), WP_L('Äthiopisch-kenianische Beziehungen')),
  ],
  missions: [
    mis('ATMIS', 'African Union Transition Mission in Somalia', 'AU', 'Friedenssicherung', 'Aktiv (Übergang)', 2022, undefined, 4000, 'Nachfolgemission von AMISOM. Kenia stellt ca. 4.000 Soldaten im Sektor 2 (Jubaland). Schrittweiser Abzug geplant bis 2024/2025.', ['SO'], 'https://atmis-au.org/', 'ATMIS – AU Mission in Somalia'),
  ],
};

// ═══════════════════════════════════════════════════════════════
// SUDAN (SD)
// ═══════════════════════════════════════════════════════════════

const SD: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Sudanesische Streitkräfte (القوات المسلحة السودانية / SAF)',
    founded: 1925,
    activePersonnel: 100000,
    reservePersonnel: 85000,
    paramilitaryPersonnel: 0,
    militaryBudget: 2000000000,
    budgetPercentGDP: 4.0,
    conscription: false,
    commanderInChief: 'General Abdel Fattah al-Burhan',
    source: GFP('sudan'),
    sourceLabel: GFP_L('Sudan'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-72M', 270, 'Russland/China', 'Aktiv (Kriegsverluste)', IISS, IISS_L),
    ws('Kampfpanzer', 'Al-Bashir (Type 96)', 200, 'China', 'Aktiv', WP('Type_96_tank'), WP_L('Type 96 Panzer'), 'Chinesischer Typ 85-IIM/96'),
    ws('Gepanzerte Fahrzeuge', 'BTR-80A', 275, 'Russland/Belarus', 'Aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'Su-24M', 19, 'Russland', 'Aktiv (eingeschränkt)', IISS, IISS_L),
    ws('Kampfflugzeuge', 'MiG-29SE', 12, 'Russland/Belarus', 'Aktiv', IISS, IISS_L),
    ws('Hubschrauber', 'Mi-24V/Mi-35', 20, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('UAV/Drohnen', 'Wing Loong II', 6, 'China/VAE', 'Aktiv', WP('Wing_Loong_II'), WP_L('Wing Loong II'), 'Bewaffnete MALE-Drohne'),
  ],
  actors: [
    act('Rapid Support Forces (RSF)', 'Paramilitärische Kraft', 'Aus den Dschandschawid-Milizen hervorgegangen. Unter Führung von Mohamed Hamdan Dagalo (Hemedti). Seit April 2023 im Krieg gegen die SAF. Kontrolliert große Teile von Khartum und Darfur.', 'Aktiv (Krieg)', 'Khartum, Darfur, Kordofan, Jazira', '100.000+', WP('Sudanese_civil_war_(2023%E2%80%93present)'), WP_L('Sudanesischer Bürgerkrieg')),
    act('SLA/M (Sudan Liberation Movement)', 'Rebellengruppe', 'Darfur-Rebellengruppe unter Abdel Wahid al-Nur. Kontrolliert Jebel Marra im Darfur. Hat sich nicht dem Juba-Friedensabkommen angeschlossen.', 'Aktiv', 'Darfur (Jebel Marra)', '5.000–10.000', WP('Sudan_Liberation_Movement'), WP_L('SLM')),
    act('Wagner-Gruppe / Afrika Corps', 'Ausländischer Akteur (PMC)', 'Russische paramilitärische Gruppe. Unterstützt RSF mit Waffen und Ausbildung über Libyen und Zentralafrika. Gold-Abbau-Interessen im Sudan.', 'Aktiv', 'Darfur, Grenze Libyen/Tschad', 'Unbekannt', WP('Wagner_Group_in_Africa'), WP_L('Wagner-Gruppe in Afrika')),
    act('VAE – externe Unterstützung', 'Ausländischer Akteur', 'Vereinigte Arabische Emirate unterstützen nach Berichten die RSF mit Waffen, Drohnen und Logistik über Tschad. VAE bestreiten dies.', 'Aktiv', 'Extern (über Tschad/Libyen)', 'N/A', 'https://www.un.org/securitycouncil/sanctions/1591/panel-of-experts/reports', 'UN-Expertengruppe Sudan'),
  ],
  conflicts: [
    con('Sudanesischer Bürgerkrieg', ['SAF (al-Burhan)', 'RSF (Hemedti)'], 'Aktiv', 2023, undefined, 'Seit 15. April 2023 tobt ein verheerender Bürgerkrieg zwischen der Armee (SAF) und den Rapid Support Forces (RSF). Begann als Machtkampf, eskalierte zum Krieg mit ethnischer Dimension, besonders in Darfur.', '15.000+ Tote, 8+ Mio. Binnenvertriebene, 1.5+ Mio. Flüchtlinge', WP('Sudanese_civil_war_(2023%E2%80%93present)'), WP_L('Sudanesischer Bürgerkrieg 2023')),
    con('Darfur-Krise (Fortsetzung)', ['RSF', 'Arabische Milizen', 'Nicht-arabische Gruppen'], 'Aktiv', 2003, undefined, 'Der Darfur-Konflikt eskaliert erneut im Rahmen des Bürgerkriegs. Ethnische Säuberungen in West-Darfur (El Geneina). UN spricht von möglichem Genozid.', '300.000+ Tote (seit 2003)', WP('War_in_Darfur'), WP_L('Darfur-Konflikt')),
  ],
  relations: [
    rel('EG', 'Ägypten', '🇪🇬', 'SAF-Verbündeter', 'Ägypten unterstützt die SAF. Gemeinsame Interessen gegen RSF und für Nil-Wasserkooperation. Diplomatische und möglicherweise militärische Unterstützung.', WP('Egypt%E2%80%93Sudan_relations'), WP_L('Ägyptisch-sudanesische Beziehungen')),
    rel('AE', 'VAE', '🇦🇪', 'RSF-Unterstützer', 'VAE unterstützt laut UN-Berichten die RSF. Wirtschaftliche Interessen (Gold, Landwirtschaft). Humanitäre Hilfe als diplomatische Fassade.', 'https://www.un.org/securitycouncil/sanctions/1591', 'UN-Sanktionskomitee Sudan'),
    rel('RU', 'Russland', '🇷🇺', 'Kompliziert', 'Russland hat Beziehungen zu beiden Seiten. Wagner/Afrika Corps unterstützt RSF. Gleichzeitig Waffenlieferungen an SAF. Geplanter Marinestützpunkt in Port Sudan.', WP('Russia%E2%80%93Sudan_relations'), WP_L('Russisch-sudanesische Beziehungen')),
    rel('SS', 'Südsudan', '🇸🇸', 'Angespannter Nachbar', 'Gemeinsame Grenze. Flüchtlingsströme in beide Richtungen. Südsudan versucht zu vermitteln. Ölpipeline durch Sudan für Südsudan lebenswichtig.', WP('South_Sudan%E2%80%93Sudan_relations'), WP_L('Südsudan-Sudan-Beziehungen')),
    rel('TD', 'Tschad', '🇹🇩', 'Betroffener Nachbar', 'Massiver Flüchtlingszustrom nach Tschad (500.000+). Grenze als RSF-Nachschubweg. Tschad versucht neutral zu bleiben.', WP('Chad%E2%80%93Sudan_relations'), WP_L('Tschad-Sudan-Beziehungen')),
  ],
  missions: [
    mis('UNITAMS', 'UN Integrated Transition Assistance Mission in Sudan', 'UN', 'Politische Mission', 'Beendet (2024)', 2021, 2024, 300, 'UN-Mission zur Unterstützung der demokratischen Transition. Nach Ausbruch des Bürgerkriegs 2023 eingeschränkt. Mandat im März 2024 beendet.', ['SD'], 'https://unitams.unmissions.org/', 'UNITAMS'),
  ],
};

// ═══════════════════════════════════════════════════════════════
// LIBYA (LY)
// ═══════════════════════════════════════════════════════════════

const LY: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Fragmentierte Streitkräfte (GNU vs. LNA)',
    founded: 1951,
    activePersonnel: 45000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 60000,
    militaryBudget: 3000000000,
    budgetPercentGDP: 7.0,
    conscription: false,
    commanderInChief: 'Umstritten: PM Dbeibah (GNU) / Marschall Haftar (LNA)',
    source: GFP('libya'),
    sourceLabel: GFP_L('Libyen'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-72 (diverse Varianten)', 200, 'Russland (Erbstücke)', 'Teilweise aktiv', IISS, IISS_L, 'Verteilt auf beide Seiten'),
    ws('Gepanzerte Fahrzeuge', 'BRDM-2/BMP-1', 300, 'Russland (Erbstücke)', 'Teilweise aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'MiG-21 (diverse)', 30, 'Russland', 'Kaum einsatzfähig', IISS, IISS_L, 'Nur LNA-kontrolliert'),
    ws('UAV/Drohnen', 'Bayraktar TB2', 20, 'Türkei', 'Aktiv (GNU)', WP('Bayraktar_TB2'), WP_L('Bayraktar TB2'), 'Geliefert an Regierung in Tripolis'),
    ws('UAV/Drohnen', 'Wing Loong II', 10, 'VAE/China', 'Aktiv (LNA)', WP('Wing_Loong_II'), WP_L('Wing Loong II'), 'Von VAE für Haftar bereitgestellt'),
    ws('Flugabwehr', 'Pantsir-S1', 8, 'Russland/VAE', 'Aktiv (LNA)', WP('Pantsir_missile_system'), WP_L('Pantsir-S1'), 'Über VAE an LNA geliefert'),
  ],
  actors: [
    act('GNU (Government of National Unity)', 'Regierung', 'International anerkannte Regierung in Tripolis unter PM Abdul Hamid Dbeibah. Kontrolliert Westlibyen mit Unterstützung türkischer Milizen.', 'Aktiv', 'Tripolis, Westlibyen', 'Diverse Milizen (50.000+)', WP('Government_of_National_Unity_(Libya)'), WP_L('GNU Libyen')),
    act('LNA (Libyan National Army)', 'Bewaffnete Kraft', 'Armee unter Marschall Khalifa Haftar. Kontrolliert Ostlibyen, Südlibyen und Teile des Südens. Unterstützt von Russland (Wagner), VAE, Ägypten.', 'Aktiv', 'Ostlibyen (Bengasi), Südlibyen', '50.000+', WP('Libyan_National_Army'), WP_L('LNA')),
    act('Wagner-Gruppe / Afrika Corps', 'Ausländischer Akteur (PMC)', 'Russische Paramilitärs unterstützen die LNA. Stationiert in Zentrallibyen (Jufra-Basis) und im Süden. Kontrolle über Ölinfrastruktur und Migrationsrouten.', 'Aktiv', 'Zentrallibyen (Jufra), Fezzan', '1.000–2.000', WP('Wagner_Group_activities_in_Libya'), WP_L('Wagner-Gruppe in Libyen')),
    act('Türkische Militärpräsenz', 'Ausländischer Akteur', 'Türkei unterstützt die GNU militärisch seit 2019. Militärbasis in Misrata. Ausbildung von Milizen. Bayraktar-Drohnen und syrische Söldner.', 'Aktiv', 'Tripolis, Misrata, Westlibyen', '2.000+ türkische Soldaten', WP('Turkish_military_intervention_in_the_Second_Libyan_Civil_War'), WP_L('Türkische Intervention in Libyen')),
  ],
  conflicts: [
    con('Libyscher Bürgerkrieg / Fragmentierung', ['GNU + Türkei', 'LNA + Wagner/Russland/VAE/Ägypten'], 'Waffenstillstand (fragil)', 2011, undefined, 'Seit dem Sturz Gaddafis 2011 ist Libyen fragmentiert. Zweiter Bürgerkrieg 2014-2020. Waffenstillstand 2020. Geplante Wahlen wiederholt verschoben. De-facto-Teilung des Landes.', '25.000+ Tote (seit 2011)', WP('Second_Libyan_Civil_War'), WP_L('Libyscher Bürgerkrieg')),
  ],
  relations: [
    rel('TR', 'Türkei', '🇹🇷', 'Verbündeter (GNU)', 'Militärische Unterstützung der GNU seit 2019. Maritime Abkommen. Bayraktar-Drohnen, Ausbildung, Marinepräsenz.', WP('Libya%E2%80%93Turkey_relations'), WP_L('Libysch-türkische Beziehungen')),
    rel('RU', 'Russland', '🇷🇺', 'Verbündeter (LNA)', 'Wagner/Afrika Corps unterstützt Haftar. Russland strebt Marinestützpunkt in Tobruk an. Waffenlieferungen trotz UN-Embargo.', WP('Libya%E2%80%93Russia_relations'), WP_L('Libysch-russische Beziehungen')),
    rel('EG', 'Ägypten', '🇪🇬', 'Verbündeter (LNA)', 'Ägypten unterstützt Haftar. Gemeinsame Grenze. Sicherheitsinteressen wegen IS und Migration. Drohte 2020 mit Intervention.', WP('Egypt%E2%80%93Libya_relations'), WP_L('Ägyptisch-libysche Beziehungen')),
    rel('AE', 'VAE', '🇦🇪', 'Verbündeter (LNA)', 'VAE liefert Waffen, Drohnen (Wing Loong) und Finanzierung an LNA. Trotz UN-Waffenembargo. Strategische Interessen gegen politischen Islam.', WP('Libyan_civil_war_(2014%E2%80%93present)'), WP_L('Libyscher Bürgerkrieg')),
    rel('IT', 'Italien', '🇮🇹', 'Partner (GNU)', 'Ehemalige Kolonialmacht. Kooperation bei Migrationsbekämpfung. ENI-Ölinteressen. Diplomatische Unterstützung der GNU.', WP('Italy%E2%80%93Libya_relations'), WP_L('Italienisch-libysche Beziehungen')),
  ],
  missions: [
    mis('UNSMIL', 'UN Support Mission in Libya', 'UN', 'Politische Mission', 'Aktiv', 2011, undefined, 200, 'UN-Sondermission zur Unterstützung des politischen Prozesses. Vermittlung zwischen GNU und LNA. Förderung von Wahlen und Waffenstillstand.', ['LY'], 'https://unsmil.unmissions.org/', 'UNSMIL'),
    mis('EUNAVFOR MED Irini', 'EU Naval Force Mediterranean Operation Irini', 'EU', 'Embargo-Überwachung', 'Aktiv', 2020, undefined, 600, 'EU-Marineoperation zur Durchsetzung des UN-Waffenembargos gegen Libyen. Überwachung des Seegebiets, Bekämpfung von Ölschmuggel.', ['LY'], 'https://www.operationirini.eu/', 'EUNAVFOR MED Irini'),
  ],
};

// ═══════════════════════════════════════════════════════════════
// GHANA (GH)
// ═══════════════════════════════════════════════════════════════

const GH: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Ghana Armed Forces (GAF)',
    founded: 1957,
    activePersonnel: 15500,
    reservePersonnel: 0,
    paramilitaryPersonnel: 0,
    militaryBudget: 400000000,
    budgetPercentGDP: 0.5,
    conscription: false,
    commanderInChief: 'Präsident John Mahama',
    source: GFP('ghana'),
    sourceLabel: GFP_L('Ghana'),
  },
  weaponSystems: [
    ws('Gepanzerte Fahrzeuge', 'BRDM-2', 12, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Ratel 20', 6, 'Südafrika', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Otokar Cobra', 10, 'Türkei', 'Aktiv', WP('Otokar_Cobra'), WP_L('Otokar Cobra')),
    ws('Leichte Kampfflugzeuge', 'Aermacchi MB-339', 4, 'Italien', 'Teilweise aktiv', IISS, IISS_L),
    ws('Hubschrauber', 'Mi-171', 4, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Hubschrauber', 'Z-9 (Dauphin)', 4, 'China', 'Aktiv', WP('Harbin_Z-9'), WP_L('Z-9 (Harbin)')),
    ws('Kriegsschiffe', 'PB 57-Klasse', 2, 'Deutschland', 'Aktiv', WP('Ghana_Navy'), WP_L('Ghana Navy')),
  ],
  actors: [
    act('Dschihadistische Bedrohung (extern)', 'Terrororganisation', 'Ghana selbst hat keine aktiven Terrorgruppen. Bedrohung kommt von Sahel-Dschihadisten (JNIM, ISGS), die sich nach Süden in Richtung Küstenstaaten ausbreiten.', 'Potenzielle Bedrohung', 'Nördliche Grenzregionen', 'Externe Gruppen', WP('Islamist_insurgency_in_the_Sahel'), WP_L('Islamistischer Aufstand im Sahel')),
    act('Galamsey-Netzwerke', 'Kriminelle Organisation', 'Illegale Goldabbau-Netzwerke (Galamsey). Verursachen massive Umweltzerstörung, vergiften Wasserquellen. Teilweise mit politischem Schutz. Chinesische und lokale Akteure.', 'Aktiv', 'Ashanti, Western, Eastern Region', 'Zehntausende', WP('Galamsey'), WP_L('Galamsey – Illegaler Goldabbau')),
  ],
  conflicts: [],
  relations: [
    rel('US', 'USA', '🇺🇸', 'Partner', 'US-Militärstützpunkt-Vereinbarung (umstritten). AFRICOM-Kooperation. Ausbildungsprogramme. Ghana ist wichtiger demokratischer Partner in Westafrika.', WP('Ghana%E2%80%93United_States_relations'), WP_L('Ghanaisch-amerikanische Beziehungen')),
    rel('CN', 'China', '🇨🇳', 'Wirtschaftspartner', 'Infrastrukturinvestitionen. Kontroverse um illegalen chinesischen Goldabbau (Galamsey). Wachsende Handelsbeziehungen.', WP('China%E2%80%93Ghana_relations'), WP_L('Chinesisch-ghanaische Beziehungen')),
    rel('GB', 'Großbritannien', '🇬🇧', 'Historischer Partner', 'Ehemalige Kolonialmacht. Commonwealth-Mitglied. Militärausbildung und demokratische Zusammenarbeit.', WP('Ghana%E2%80%93United_Kingdom_relations'), WP_L('Ghanaisch-britische Beziehungen')),
  ],
  missions: [],
};

// ═══════════════════════════════════════════════════════════════
// TANZANIA (TZ)
// ═══════════════════════════════════════════════════════════════

const TZ: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Tanzania People\'s Defence Force (TPDF)',
    founded: 1964,
    activePersonnel: 27000,
    reservePersonnel: 80000,
    paramilitaryPersonnel: 1400,
    militaryBudget: 700000000,
    budgetPercentGDP: 0.9,
    conscription: false,
    commanderInChief: 'Präsidentin Samia Suluhu Hassan',
    source: GFP('tanzania'),
    sourceLabel: GFP_L('Tansania'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'Type 59', 45, 'China', 'Aktiv', IISS, IISS_L),
    ws('Kampfpanzer', 'Type 62', 30, 'China', 'Teilweise aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'BTR-152/BTR-40', 80, 'Russland', 'Teilweise aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'J-7 (MiG-21-Variante)', 10, 'China', 'Aktiv (eingeschränkt)', IISS, IISS_L),
    ws('Hubschrauber', 'Mi-24', 4, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Kriegsschiffe', 'Type 062 (Kanonenboot)', 6, 'China', 'Aktiv', WP('Tanzania_People%27s_Defence_Force'), WP_L('TPDF')),
  ],
  actors: [
    act('ADF/ISCAP (Grenzbedrohung)', 'Terrororganisation', 'IS-affiliierte ADF operiert in der Grenzregion zur DRK. Tansania stellt Truppen für SAMIDRC. Gelegentliche Grenzübertritte.', 'Externe Bedrohung', 'Grenze zur DRK (Kigoma)', 'Extern', WP('Allied_Democratic_Forces'), WP_L('ADF')),
    act('Cabo-Delgado-Aufstand (Mosambik)', 'Terrororganisation', 'Islamistischer Aufstand im angrenzenden Mosambik. Tansanische Grenzprovinz Mtwara betroffen. SADC-Einsatz seit 2021.', 'Externe Bedrohung', 'Grenze Mosambik (Mtwara)', 'Extern', WP('Insurgency_in_Cabo_Delgado'), WP_L('Cabo-Delgado-Aufstand')),
  ],
  conflicts: [],
  relations: [
    rel('CN', 'China', '🇨🇳', 'Enger Partner', 'Hauptwaffenlieferant. Belt-and-Road-Projekte (Bagamoyo-Hafen, SGR-Eisenbahn). Historische Beziehungen seit TAZARA-Eisenbahn (1970er).', WP('China%E2%80%93Tanzania_relations'), WP_L('Chinesisch-tansanische Beziehungen')),
    rel('CD', 'DR Kongo', '🇨🇩', 'Partner', 'Tansanisches Kontingent in SAMIDRC (Osten DRK). Historische UN-Friedenstruppen-Beiträge (MONUSCO).', WP('SADC_Mission_in_the_Democratic_Republic_of_Congo'), WP_L('SAMIDRC')),
    rel('MZ', 'Mosambik', '🇲🇿', 'Regionaler Partner', 'SADC-Unterstützung für Mosambik in Cabo Delgado. Gemeinsame Grenz- und Meeressicherheit.', WP('Mozambique%E2%80%93Tanzania_relations'), WP_L('Mosambikanisch-tansanische Beziehungen')),
    rel('KE', 'Kenia', '🇰🇪', 'Nachbar/Rivale', 'Wirtschaftliche Rivalität in Ostafrika. Gelegentliche Handelsstreitigkeiten. Kooperation in der EAC (East African Community).', WP('Kenya%E2%80%93Tanzania_relations'), WP_L('Kenianisch-tansanische Beziehungen')),
  ],
  missions: [
    mis('SAMIDRC (TZ-Kontingent)', 'SADC Mission in DRC – Tanzania', 'Sonstige', 'Friedenssicherung', 'Aktiv', 2023, undefined, 800, 'Tansanisches Kontingent in der SADC-Mission im Osten der DR Kongo. Operiert gemeinsam mit Südafrika und Malawi.', ['CD'], WP('SADC_Mission_in_the_Democratic_Republic_of_Congo'), WP_L('SAMIDRC')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// International Missions across Africa (kontinent-weit)
// ═══════════════════════════════════════════════════════════════

export const internationalMissionsAfrica: InternationalMission[] = [
  // ── UN Missionen ──
  mis('MINUSMA', 'UN Multidimensional Integrated Stabilization Mission in Mali', 'UN', 'Friedenssicherung', 'Beendet (2023)', 2013, 2023, 13000, 'Größte UN-Friedensmission in Mali. Stabilisierung nach dem Tuareg-Aufstand 2012. Auf Verlangen der malischen Militärjunta 2023 beendet.', ['ML'], 'https://minusma.unmissions.org/', 'MINUSMA'),
  mis('MINUSCA', 'UN Multidimensional Integrated Stabilization Mission in CAR', 'UN', 'Friedenssicherung', 'Aktiv', 2014, undefined, 14400, 'UN-Mission in der Zentralafrikanischen Republik. Schutz der Zivilbevölkerung, Unterstützung des Friedensprozesses. Ca. 14.400 uniformiertes Personal.', ['CF'], 'https://minusca.unmissions.org/', 'MINUSCA'),
  mis('UNMISS', 'UN Mission in South Sudan', 'UN', 'Friedenssicherung', 'Aktiv', 2011, undefined, 17000, 'UN-Mission im Südsudan. Schutz der Zivilbevölkerung, Unterstützung der Friedensvereinbarung. Eine der größten UN-Missionen weltweit.', ['SS'], 'https://unmiss.unmissions.org/', 'UNMISS'),
  mis('MONUSCO', 'UN Organization Stabilization Mission in DRC', 'UN', 'Friedenssicherung', 'Abzug', 2010, undefined, 14500, 'Größte UN-Mission weltweit. Schrittweiser Abzug seit 2024. Schutz der Zivilbevölkerung im Osten der DRK.', ['CD'], 'https://monusco.unmissions.org/', 'MONUSCO'),
  mis('MINURSO', 'UN Mission for the Referendum in Western Sahara', 'UN', 'Friedensbeobachtung', 'Aktiv', 1991, undefined, 460, 'Überwachung des Waffenstillstands in der Westsahara. Referendumsvorbereitung (nie durchgeführt).', ['MA', 'EH'], 'https://minurso.unmissions.org/', 'MINURSO'),
  mis('UNISFA', 'UN Interim Security Force for Abyei', 'UN', 'Friedenssicherung', 'Aktiv', 2011, undefined, 3550, 'UN-Sicherheitstruppe in der umstrittenen Abyei-Region zwischen Sudan und Südsudan.', ['SD', 'SS'], 'https://unisfa.unmissions.org/', 'UNISFA'),
  mis('UNSOM', 'UN Assistance Mission in Somalia', 'UN', 'Politische Mission', 'Aktiv', 2013, undefined, 300, 'Politische UN-Mission zur Unterstützung der somalischen Regierung. Beratung bei Friedens- und Staatsaufbau.', ['SO'], 'https://unsom.unmissions.org/', 'UNSOM'),
  mis('UNOCA', 'UN Office for Central Africa', 'UN', 'Politische Mission', 'Aktiv', 2011, undefined, 50, 'UN-Büro für Zentralafrika. Konfliktverhütung, Mediation, grenzüberschreitende Sicherheit.', ['CM', 'TD', 'CF', 'CG', 'GA', 'GQ', 'ST'], 'https://unoca.unmissions.org/', 'UNOCA'),

  // ── EU Missionen ──
  mis('EUTM Somalia', 'EU Training Mission Somalia', 'EU', 'Militärische Ausbildung', 'Aktiv', 2010, undefined, 200, 'EU-Ausbildungsmission für somalische Sicherheitskräfte. Hauptquartier in Mogadischu. Ausbildung, Beratung und Mentoring.', ['SO'], 'https://www.eutm-somalia.eu/', 'EUTM Somalia'),
  mis('EUTM Mozambique', 'EU Training Mission Mozambique', 'EU', 'Militärische Ausbildung', 'Aktiv', 2021, undefined, 140, 'EU-Ausbildungsmission für mosambikanische Streitkräfte. Fokus auf Bekämpfung des Aufstands in Cabo Delgado.', ['MZ'], EU_MISSIONS, EU_MISSIONS_L),
  mis('EUNAVFOR Atalanta', 'EU Naval Force Somalia – Operation Atalanta', 'EU', 'Maritim', 'Aktiv', 2008, undefined, 1200, 'EU-Marineoperation zur Bekämpfung von Piraterie am Horn von Afrika. Schutz von WFP-Lieferungen. Erweitertes Mandat 2023.', ['SO', 'DJ', 'KE'], 'https://eunavfor.eu/', 'EUNAVFOR Atalanta'),
  mis('EUCAP Somalia', 'EU Capacity Building Mission Somalia', 'EU', 'Kapazitätsaufbau', 'Aktiv', 2012, undefined, 120, 'EU-Mission zum Aufbau maritimer und Polizeikapazitäten in Somalia. Bekämpfung von Piraterie und organisierter Kriminalität.', ['SO'], EU_MISSIONS, EU_MISSIONS_L),
  mis('EUCAP Sahel Niger', 'EU Capacity Building Mission Niger', 'EU', 'Kapazitätsaufbau', 'Suspendiert', 2012, undefined, 130, 'EU-Mission zum Aufbau von Sicherheitskapazitäten in Niger. Nach dem Militärputsch 2023 suspendiert.', ['NE'], EU_MISSIONS, EU_MISSIONS_L),
  mis('EUCAP Sahel Mali', 'EU Capacity Building Mission Mali', 'EU', 'Kapazitätsaufbau', 'Beendet (2024)', 2015, 2024, 0, 'EU-Mission in Mali zur Ausbildung von Polizei und Sicherheitskräften. Von malischer Junta zum Abzug gezwungen.', ['ML'], EU_MISSIONS, EU_MISSIONS_L),
  mis('EUNAVFOR MED Irini', 'EU Naval Force Mediterranean – Irini', 'EU', 'Embargo-Überwachung', 'Aktiv', 2020, undefined, 600, 'EU-Marineoperation zur Durchsetzung des UN-Waffenembargos gegen Libyen. Überwachung des Seeverkehrs.', ['LY'], 'https://www.operationirini.eu/', 'Operation Irini'),
  mis('EUTM RCA', 'EU Training Mission Central African Republic', 'EU', 'Militärische Ausbildung', 'Aktiv', 2016, undefined, 100, 'EU-Ausbildungsmission für die Streitkräfte der Zentralafrikanischen Republik (FACA). Stark eingeschränkt wegen Wagner-Präsenz.', ['CF'], EU_MISSIONS, EU_MISSIONS_L),

  // ── US / AFRICOM ──
  mis('AFRICOM', 'U.S. Africa Command', 'US', 'Militärkommando', 'Aktiv', 2007, undefined, 6000, 'US-Kommando für Afrika. Hauptquartier in Stuttgart (Deutschland). Operationen in 53 afrikanischen Ländern. Fokus auf Terrorbekämpfung, Ausbildung, maritime Sicherheit.', ['DJ', 'KE', 'SO', 'NE', 'NG', 'CM', 'GH'], AFRICOM, AFRICOM_L),
  mis('Camp Lemonnier', 'US Military Base Djibouti', 'US', 'Militärbasis', 'Aktiv', 2001, undefined, 4000, 'Einzige permanente US-Militärbasis in Afrika. Camp Lemonnier in Dschibuti. Drohnenoperationen, Spezialeinheiten, Logistik für Ostafrika und Jemen.', ['DJ'], AFRICOM, AFRICOM_L),
  mis('US SOF in Somalia', 'US Special Operations Forces Somalia', 'US', 'Terrorbekämpfung', 'Aktiv', 2007, undefined, 500, 'US-Spezialkräfte und Drohnenoperationen gegen Al-Shabaab in Somalia. Luftangriffe, Ausbildung somalischer Einheiten (Danab).', ['SO'], AFRICOM, AFRICOM_L),
  mis('US Air Base 201', 'US Drone Base Agadez, Niger', 'US', 'Drohnen-/Luftwaffenbasis', 'Abzug (2024)', 2014, 2024, 800, '$110 Mio. Drohnenbasis in Agadez. Überwachung der Sahel-Region. Nach dem Militärputsch 2023 Abzug erzwungen.', ['NE'], AFRICOM, AFRICOM_L),

  // ── Russland ──
  mis('Afrika Corps (ex-Wagner)', 'Russian Africa Corps', 'Russland', 'PMC / Militärberatung', 'Aktiv', 2017, undefined, 5000, 'Russische Paramilitärs (ehemals Wagner, jetzt Afrika Corps unter GRU). Stationiert in Mali, Burkina Faso, Niger, Zentralafrika, Libyen und Sudan. Regime-Sicherung, Rohstoffzugang.', ['ML', 'BF', 'NE', 'CF', 'LY', 'SD'], WP('Africa_Corps_(Russia)'), WP_L('Afrika Corps (Russland)')),
  mis('Russische Marinepräsenz', 'Russian Naval Facility Port Sudan', 'Russland', 'Marinestützpunkt', 'Geplant', 2020, undefined, 300, 'Geplanter russischer Marinestützpunkt in Port Sudan am Roten Meer. Abkommen 2020 unterzeichnet. Umsetzung durch Bürgerkrieg verzögert.', ['SD'], WP('Russia%E2%80%93Sudan_relations'), WP_L('Russisch-sudanesische Beziehungen')),

  // ── China ──
  mis('PLA Support Base Djibouti', 'Chinese PLA Support Base', 'China', 'Militärbasis', 'Aktiv', 2017, undefined, 2000, 'Erste ausländische Militärbasis Chinas. Logistikunterstützung für Antipiraten-Operationen und Evakuierungen. 400m Pier für Kriegsschiffe.', ['DJ'], WP('Chinese_People%27s_Liberation_Army_Support_Base_in_Djibouti'), WP_L('Chinesische Militärbasis Dschibuti')),
  mis('PLAN Antipiraterie', 'Chinese Navy Anti-Piracy Patrols', 'China', 'Maritim', 'Aktiv', 2008, undefined, 500, 'Chinesische Marine-Patrouillen im Golf von Aden. Seit 2008 regelmäßige Task Forces (2-3 Schiffe). Bis 2024 über 45 Rotationen.', ['SO', 'DJ'], WP('Anti-piracy_measures_in_Somalia'), WP_L('Antipiraterie Somalia')),

  // ── Deutschland ──
  mis('EUTM Mali (DE)', 'Bundeswehr in EUTM Mali', 'Deutschland', 'Militärische Ausbildung', 'Beendet (2024)', 2013, 2024, 0, 'Bundeswehr-Beteiligung an der EU-Ausbildungsmission in Mali. Bis zu 600 Soldaten. Abzug nach Militärputsch und Ende der Mission.', ['ML'], BMVg, BMVg_L),
  mis('MINUSMA (DE)', 'Bundeswehr in MINUSMA', 'Deutschland', 'Friedenssicherung', 'Beendet (2023)', 2013, 2023, 0, 'Bedeutendster Bundeswehr-Einsatz in Afrika. Bis zu 1.100 Soldaten. Aufklärung (CH-53, Tiger-Hubschrauber, Heron-Drohnen). Gefährlichster UN-Einsatz der Bundeswehr.', ['ML'], BMVg, BMVg_L),
  mis('EUTM Somalia (DE)', 'Bundeswehr in EUTM Somalia', 'Deutschland', 'Militärische Ausbildung', 'Aktiv', 2010, undefined, 20, 'Deutsche Beteiligung an der EU-Ausbildungsmission für somalische Sicherheitskräfte.', ['SO'], BMVg, BMVg_L),
  mis('EUNAVFOR Atalanta (DE)', 'Bundeswehr in EUNAVFOR Atalanta', 'Deutschland', 'Maritim', 'Aktiv', 2008, undefined, 100, 'Deutsche Marinebeteiligung an der EU-Anti-Piraterie-Mission am Horn von Afrika. Fregatten, Seefernaufklärer P-3C Orion.', ['SO', 'DJ'], BMVg, BMVg_L),
  mis('Sahel-Engagement (DE)', 'Bundeswehr Sahel', 'Deutschland', 'Beratung / Ausbildung', 'Reduziert', 2017, undefined, 30, 'Bilaterale Sicherheitskooperation im Sahel (Niger, Tschad). Ausbildung, Ertüchtigung. Nach Niger-Putsch 2023 stark eingeschränkt.', ['NE', 'TD'], BMVg, BMVg_L),
];

// ═══════════════════════════════════════════════════════════════
// Data Map & Export
// ═══════════════════════════════════════════════════════════════

const countryMilitaryDataMap: Record<string, CountryMilitaryData> = {
  EG, NG, ZA, DZ, MA, ET, CD, KE, SD, LY, GH, TZ,
  ...militaryDataSahel,
  ...militaryDataEastSouth,
};

/** Returns military data for a country, or null if no detailed data exists */
export function getCountryMilitaryData(countryId: string): CountryMilitaryData | null {
  return countryMilitaryDataMap[countryId] ?? null;
}

/** Returns all international missions that involve a specific country */
export function getMissionsForCountry(countryId: string): InternationalMission[] {
  const countryMissions = countryMilitaryDataMap[countryId]?.missions ?? [];
  const globalMissions = internationalMissionsAfrica.filter(m => m.countries.includes(countryId));
  // Deduplicate by name
  const seen = new Set<string>();
  const all: InternationalMission[] = [];
  for (const m of [...countryMissions, ...globalMissions]) {
    if (!seen.has(m.name)) {
      seen.add(m.name);
      all.push(m);
    }
  }
  return all;
}

export { countryMilitaryDataMap };
