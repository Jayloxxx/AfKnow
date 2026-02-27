import type { CountryMilitaryData, WeaponSystem, SecurityActor, ArmedConflict, CountryRelation, InternationalMission } from '../types';

// ── Helper constructors ──────────────────────────

let _id = 2000;
const uid = () => `mil_east_${++_id}`;

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

const WP = (slug: string) => `https://en.wikipedia.org/wiki/${slug}`;
const WP_L = (n: string) => `Wikipedia – ${n}`;
const IISS = 'https://www.iiss.org/publications/the-military-balance';
const IISS_L = 'IISS Military Balance 2024';
const GFP = (id: string) => `https://www.globalfirepower.com/country-military-strength-detail.php?country_id=${id}`;
const GFP_L = (n: string) => `GlobalFirepower – ${n}`;
const EU_MISSIONS = 'https://www.eeas.europa.eu/eeas/missions-and-operations_en';
const EU_MISSIONS_L = 'EEAS – EU Missionen';
const AFRICOM = 'https://www.africom.mil/';
const AFRICOM_L = 'U.S. Africa Command (AFRICOM)';

// ═══════════════════════════════════════════════════════════════
// SOMALIA (SO)
// ═══════════════════════════════════════════════════════════════

const SO: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Somalische Nationalarmee (Ciidanka Xoogga Dalka Soomaaliyeed)',
    founded: 1960,
    activePersonnel: 20000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 15000,
    militaryBudget: 120000000,
    budgetPercentGDP: 1.5,
    conscription: false,
    commanderInChief: 'Präsident Hassan Sheikh Mohamud',
    source: GFP('somalia'),
    sourceLabel: GFP_L('Somalia'),
  },
  weaponSystems: [
    ws('Technicals', 'Toyota Land Cruiser (bewaffnet)', 500, 'Diverse', 'Aktiv', IISS, IISS_L, 'Mit schweren MGs und Rückstoßfreien Geschützen – Rückgrat der SNA'),
    ws('Gepanzerte Fahrzeuge', 'Casspir MRAP', 12, 'Südafrika', 'Aktiv', IISS, IISS_L, 'Über AMISOM/ATMIS bereitgestellt'),
    ws('Gepanzerte Fahrzeuge', 'Otokar Cobra II', 24, 'Türkei', 'Aktiv', WP('Otokar_Cobra_II'), WP_L('Otokar Cobra II'), 'Türkische Militärhilfe'),
    ws('Artillerie', 'M30 107-mm-Mörser', 30, 'Diverse', 'Aktiv', IISS, IISS_L),
    ws('Leichte Waffen', 'AK-47 / M16 / G3', 15000, 'Diverse', 'Aktiv', IISS, IISS_L, 'Gemischte Bestände aus verschiedenen Quellen'),
    ws('Hubschrauber', 'Mi-17', 2, 'Russland', 'Teilweise aktiv', IISS, IISS_L, 'Begrenzte Einsatzfähigkeit'),
    ws('Patrouillenboote', 'Diverse Küstenwache', 6, 'Diverse', 'Teilweise aktiv', WP('Somali_Navy'), WP_L('Somalische Marine'), 'Wiederaufbau der Marine im Gange'),
    ws('UAV/Drohnen', 'Bayraktar TB2', 6, 'Türkei', 'Aktiv', WP('Bayraktar_TB2'), WP_L('Bayraktar TB2'), 'Türkische Lieferung zur Bekämpfung von Al-Shabaab'),
  ],
  actors: [
    act('Al-Shabaab', 'Terrororganisation', 'Al-Qaida-Ableger in Somalia, gegründet 2006. Kontrolliert große ländliche Gebiete in Süd- und Zentralsomalia. Verübt regelmäßig komplexe Anschläge in Mogadischu. Erpresst systematisch „Steuern" von Unternehmen und Bevölkerung. Geschätztes Jahresbudget von über 100 Mio. USD.', 'Aktiv', 'Süd- und Zentralsomalia, grenzüberschreitend nach Kenia', '8.000–12.000', WP('Al-Shabaab_(militant_group)'), WP_L('Al-Shabaab')),
    act('Islamischer Staat Somalia (ISS)', 'Terrororganisation', 'Kleiner IS-Ableger, hauptsächlich in Puntland aktiv. Abspaltung von Al-Shabaab 2015 unter Abdulqadir Mumin. Begrenzte, aber wachsende Fähigkeiten. Rekrutiert lokal und aus dem Ausland.', 'Aktiv', 'Puntland (Bari-Region)', '100–300', WP('Islamic_State_in_Somalia'), WP_L('Islamischer Staat Somalia')),
    act('Clan-Milizen', 'Bewaffnete Gruppen', 'Zahlreiche Clan-basierte Milizen, die in Somalias fragmentiertem Sicherheitsumfeld operieren. Einige kooperieren mit der SNA, andere agieren unabhängig oder gegen die Zentralregierung. Darod, Hawiye, Dir, Rahanweyn als Hauptclans.', 'Aktiv', 'Landesweit', 'Zehntausende', WP('Somali_clan'), WP_L('Somalische Clans')),
    act('Ahlu Sunna Waljama\'a', 'Miliz (Sufi)', 'Sufistische Miliz, die gegen Al-Shabaab kämpft. Zeitweise Verbündeter der Bundesregierung, aber politisch marginalisiert. Vorwiegend aus dem Galgaduud- und Hiraan-Clan.', 'Geschwächt', 'Zentralsomalia (Galgaduud, Hiraan)', '1.000–3.000', WP('Ahlu_Sunna_Waljama%27a'), WP_L('Ahlu Sunna Waljama\'a')),
  ],
  conflicts: [
    con('Somalischer Bürgerkrieg', ['Bundesregierung/SNA', 'Al-Shabaab', 'IS-Somalia', 'Clan-Milizen', 'ATMIS'], 'Aktiv', 1991, undefined, 'Seit 1991 andauernder bewaffneter Konflikt. Nach dem Zusammenbruch der Zentralregierung unter Siad Barre zerfiel Somalia in Clan-Territorien. Seit 2006 Kampf gegen Al-Shabaab. Die AU-Mission AMISOM/ATMIS unterstützt die Bundesregierung. Präsident Hassan Sheikh Mohamud startete 2022 eine Großoffensive gegen Al-Shabaab.', '500.000+ Tote (seit 1991)', WP('Somali_Civil_War'), WP_L('Somalischer Bürgerkrieg')),
    con('Al-Shabaab-Aufstand', ['SNA/ATMIS/US-Kräfte', 'Al-Shabaab'], 'Aktiv', 2006, undefined, 'Islamistischer Aufstand gegen die von der internationalen Gemeinschaft unterstützte Bundesregierung. Al-Shabaab kontrolliert weiterhin große Teile des ländlichen Süd- und Zentralsomalia. Regelmäßige Bombenanschläge in Mogadischu, darunter der verheerende LKW-Bombenanschlag 2017 mit über 500 Toten.', '20.000+ Tote (seit 2006)', WP('Al-Shabaab_insurgency'), WP_L('Al-Shabaab-Aufstand')),
  ],
  relations: [
    rel('US', 'USA', '🇺🇸', 'Sicherheitspartner', 'US-Drohnenangriffe und Spezialkräfteeinsätze gegen Al-Shabaab. Ausbildung der somalischen Eliteeinheit Danab (leichte Infanterie). Über 500 US-Soldaten rotierend stationiert. Wichtigster westlicher Sicherheitspartner.', AFRICOM, AFRICOM_L),
    rel('TR', 'Türkei', '🇹🇷', 'Strategischer Partner', 'Größte türkische Botschaft weltweit in Mogadischu. Militärbasis TURKSOM seit 2017 – bildet somalische Soldaten aus. Lieferung von Bayraktar-TB2-Drohnen und gepanzerten Fahrzeugen. Bedeutende humanitäre Hilfe und Infrastrukturinvestitionen.', WP('Somalia%E2%80%93Turkey_relations'), WP_L('Somalisch-türkische Beziehungen')),
    rel('ET', 'Äthiopien', '🇪🇹', 'Kompliziert', 'Größter Truppensteller für ATMIS (~3.000 Soldaten). Gleichzeitig Spannungen wegen äthiopischem Memorandum of Understanding mit Somaliland (Hafenzugang). Somalia betrachtet dies als Verletzung seiner Souveränität. Historisch schwieriges Verhältnis.', WP('Ethiopia%E2%80%93Somalia_relations'), WP_L('Äthiopisch-somalische Beziehungen')),
    rel('AE', 'VAE', '🇦🇪', 'Wirtschaftspartner', 'Hafeninvestitionen (DP World in Berbera/Somaliland und Bosaso). Militärausbildung. Spannungen mit Mogadischu wegen direkter Vereinbarungen mit Somaliland und Puntland unter Umgehung der Zentralregierung.', WP('Somalia%E2%80%93United_Arab_Emirates_relations'), WP_L('Somalisch-emiratische Beziehungen')),
    rel('KE', 'Kenia', '🇰🇪', 'Sicherheitspartner', 'Wichtiger ATMIS-Truppensteller (~3.600 Soldaten). Gemeinsame Grenze ist Einfallstor für Al-Shabaab (Westgate-Anschlag 2013, Garissa-Massaker 2015). Streit um maritime Grenze (IGH-Urteil 2021 zugunsten Somalias).', WP('Kenya%E2%80%93Somalia_relations'), WP_L('Kenianisch-somalische Beziehungen')),
  ],
  missions: [
    mis('ATMIS', 'African Union Transition Mission in Somalia', 'AU', 'Friedenssicherung/Terrorbekämpfung', 'Aktiv (Abzug geplant)', 2022, undefined, 18500, 'Nachfolgemission von AMISOM. AU-geführte Mission mit Truppen aus Uganda, Kenia, Äthiopien, Dschibuti und Burundi. Schrittweiser Abzug bis Ende 2024 geplant, Übergabe an somalische Sicherheitskräfte.', ['SO'], WP('African_Union_Transition_Mission_in_Somalia'), WP_L('ATMIS')),
    mis('EUTM Somalia', 'EU Training Mission Somalia', 'EU', 'Militärische Ausbildung', 'Aktiv', 2010, undefined, 200, 'EU-Ausbildungsmission für somalische Sicherheitskräfte. Ausbildung in Mogadischu und Uganda. Aufbau von Führungs- und Einsatzfähigkeiten der SNA.', ['SO', 'UG'], EU_MISSIONS, EU_MISSIONS_L),
  ],
};

// ═══════════════════════════════════════════════════════════════
// SOUTH SUDAN (SS)
// ═══════════════════════════════════════════════════════════════

const SS: CountryMilitaryData = {
  overview: {
    armedForcesName: 'South Sudan People\'s Defence Forces (SSPDF)',
    founded: 2011,
    activePersonnel: 185000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 10000,
    militaryBudget: 810000000,
    budgetPercentGDP: 10.0,
    conscription: false,
    commanderInChief: 'Präsident Salva Kiir Mayardit',
    source: GFP('south-sudan'),
    sourceLabel: GFP_L('Südsudan'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-72M1', 110, 'Ukraine/Russland', 'Teilweise aktiv', IISS, IISS_L, 'Aus Sudan übernommen und importiert'),
    ws('Gepanzerte Fahrzeuge', 'BTR-80', 60, 'Russland/Ukraine', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'BMP-2', 30, 'Russland', 'Teilweise aktiv', IISS, IISS_L),
    ws('Artillerie', 'D-30 122mm Haubitze', 50, 'Russland/China', 'Aktiv', IISS, IISS_L),
    ws('MLRS', 'BM-21 Grad', 20, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Hubschrauber', 'Mi-24 Hind', 6, 'Russland', 'Teilweise aktiv', IISS, IISS_L, 'Im Bürgerkrieg eingesetzt'),
    ws('Hubschrauber', 'Mi-17', 10, 'Russland', 'Teilweise aktiv', IISS, IISS_L),
    ws('Leichte Waffen', 'AK-47 / RPG / Mörser', 200000, 'Diverse', 'Aktiv', WP('South_Sudanese_Civil_War'), WP_L('Südsudan Bürgerkrieg'), 'Massive Verbreitung von Kleinwaffen in der Bevölkerung'),
  ],
  actors: [
    act('SSPDF (Regierungstruppen)', 'Staatliche Streitkräfte', 'Streitkräfte unter Präsident Salva Kiir (Dinka-dominiert). Aufgebläht auf ~185.000 Mann, aber schlecht ausgebildet und undiszipliniert. Schwere Menschenrechtsverletzungen dokumentiert. Integration von Oppositionskämpfern gemäß Friedensabkommen 2018 stockt.', 'Aktiv', 'Landesweit', '~185.000', WP('South_Sudan_People%27s_Defence_Forces'), WP_L('SSPDF')),
    act('SPLA-IO (Machar)', 'Bewaffnete Opposition', 'Sudan People\'s Liberation Army – In Opposition unter Riek Machar (Nuer-dominiert). Hauptoppositionskraft im Bürgerkrieg 2013-2018. Gemäß Friedensabkommen 2018 Teil der Übergangsregierung, aber Integration der Kämpfer in vereinte Armee verzögert sich massiv.', 'Teilweise integriert', 'Upper Nile, Jonglei, Unity State', '~40.000', WP('Sudan_People%27s_Liberation_Movement-in-Opposition'), WP_L('SPLA-IO')),
    act('NAS (National Salvation Front)', 'Bewaffnete Opposition', 'National Salvation Front unter Thomas Cirillo (Equatorian). Hat das Friedensabkommen 2018 nicht unterzeichnet. Operiert in den Äquatoria-Regionen. Kämpft gegen Regierung und für Rechte der Equatorian-Bevölkerung.', 'Aktiv', 'Zentral- und West-Äquatoria', '5.000–10.000', WP('National_Salvation_Front_(South_Sudan)'), WP_L('NAS Südsudan')),
    act('Ethnische Milizen', 'Bewaffnete Gruppen', 'Zahlreiche ethnische Milizen (Dinka, Nuer, Murle, Shilluk u.a.). Viehdiebstahl, Land- und Wasserkonflikte. Zunehmend politisiert und instrumentalisiert. Rekrutierung von Kindersoldaten.', 'Aktiv', 'Landesweit, besonders Jonglei, Lakes, Warrap', 'Zehntausende', WP('Ethnic_violence_in_South_Sudan'), WP_L('Ethnische Gewalt in Südsudan')),
  ],
  conflicts: [
    con('Südsudanesischer Bürgerkrieg', ['SSPDF (Kiir)', 'SPLA-IO (Machar)', 'Diverse Milizen'], 'Fragiler Frieden (seit 2018)', 2013, 2018, 'Bürgerkrieg zwischen Präsident Kiir (Dinka) und Vizepräsident Machar (Nuer). Ausgelöst durch politischen Machtkampf im Dezember 2013. Schwere ethnische Säuberungen, Massaker, sexuelle Gewalt. Friedensabkommen R-ARCSS 2018, aber Umsetzung stark verzögert. Wahlen wiederholt verschoben.', '400.000+ Tote, 4 Mio. Vertriebene', WP('South_Sudanese_Civil_War'), WP_L('Südsudanesischer Bürgerkrieg')),
    con('Interkommunale Gewalt', ['Ethnische Milizen (Dinka, Nuer, Murle, Shilluk)'], 'Aktiv', 2011, undefined, 'Andauernde interkommunale Gewalt um Vieh, Land und Wasserressourcen. Massakre mit Hunderten von Toten jährlich. Durch den Bürgerkrieg verschärft. Überschwemmungen und Klimawandel intensivieren Ressourcenkonflikte.', '10.000+ Tote jährlich', WP('Ethnic_violence_in_South_Sudan'), WP_L('Ethnische Gewalt in Südsudan')),
  ],
  relations: [
    rel('UG', 'Uganda', '🇺🇬', 'Verbündeter', 'Uganda unterstützt militärisch Präsident Kiir. UPDF intervenierte 2013-2014 direkt im Bürgerkrieg zugunsten der Regierung. Enge persönliche Beziehung zwischen Museveni und Kiir. Uganda ist wichtigster regionaler Verbündeter.', WP('South_Sudan%E2%80%93Uganda_relations'), WP_L('Südsudanesisch-ugandische Beziehungen')),
    rel('SD', 'Sudan', '🇸🇩', 'Angespannt', 'Ölpipeline-Abhängigkeit: Südsudans Öl muss durch Sudan exportiert werden (Port Sudan). Streit um Transitgebühren und Grenzgebiete (Abyei). Südsudanesischer Bürgerkrieg verursacht Flüchtlingsströme in beide Richtungen.', WP('South_Sudan%E2%80%93Sudan_relations'), WP_L('Südsudanesisch-sudanesische Beziehungen')),
    rel('ET', 'Äthiopien', '🇪🇹', 'IGAD-Vermittler', 'Äthiopien vermittelt über IGAD im südsudanesischen Friedensprozess. Addis Abeba ist Sitz der IGAD und Ort der Friedensverhandlungen. Äthiopischer Bürgerkrieg (Tigray) schwächte zeitweise die Vermittlerrolle.', WP('Ethiopia%E2%80%93South_Sudan_relations'), WP_L('Äthiopisch-südsudanesische Beziehungen')),
    rel('CN', 'China', '🇨🇳', 'Wirtschaftspartner', 'China ist größter ausländischer Investor im Ölsektor Südsudans (CNPC). 75% der Ölproduktion gehen nach China. Peking hat Sondergesandten für den Friedensprozess ernannt. China stellt auch Truppen für UNMISS.', WP('China%E2%80%93South_Sudan_relations'), WP_L('Chinesisch-südsudanesische Beziehungen')),
    rel('US', 'USA', '🇺🇸', 'Enttäuschter Unterstützer', 'USA waren Hauptunterstützer der Unabhängigkeit 2011. Massive Enttäuschung über Bürgerkrieg. Sanktionen gegen Akteure auf beiden Seiten. Größter humanitärer Geber. Drohungen mit Waffenembargo.', WP('South_Sudan%E2%80%93United_States_relations'), WP_L('Südsudanesisch-amerikanische Beziehungen')),
  ],
  missions: [
    mis('UNMISS', 'United Nations Mission in South Sudan', 'UN', 'Friedenssicherung', 'Aktiv', 2011, undefined, 17000, 'UN-Friedensmission mit ~17.000 Soldaten und Polizisten. Schutz der Zivilbevölkerung (über 2 Mio. in UN-Lagern während des Bürgerkriegs). Menschenrechtsmonitoring und Unterstützung des Friedensprozesses.', ['SS'], 'https://unmiss.unmissions.org/', 'UNMISS'),
    mis('CTSAMVM', 'Ceasefire and Transitional Security Arrangements Monitoring and Verification Mechanism', 'AU', 'Waffenstillstandsüberwachung', 'Aktiv', 2015, undefined, 200, 'Gemeinsames Monitoring-Mechanismus zur Überwachung des Waffenstillstands und der Sicherheitsvereinbarungen des R-ARCSS-Friedensabkommens.', ['SS'], WP('Revitalized_Agreement_on_the_Resolution_of_the_Conflict_in_South_Sudan'), WP_L('R-ARCSS')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// UGANDA (UG)
// ═══════════════════════════════════════════════════════════════

const UG: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Uganda People\'s Defence Force (UPDF)',
    founded: 1986,
    activePersonnel: 45000,
    reservePersonnel: 10000,
    paramilitaryPersonnel: 0,
    militaryBudget: 930000000,
    budgetPercentGDP: 2.1,
    conscription: false,
    commanderInChief: 'Präsident Yoweri Museveni',
    source: GFP('uganda'),
    sourceLabel: GFP_L('Uganda'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-72M1', 44, 'Russland/Ukraine', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'BTR-60/BTR-80', 40, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Mamba APC', 52, 'Südafrika', 'Aktiv', IISS, IISS_L, 'Eingesetzt bei AMISOM/ATMIS'),
    ws('Artillerie', 'D-30 122mm Haubitze', 20, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'Su-30MK2', 6, 'Russland', 'Aktiv', WP('Sukhoi_Su-30MKK'), WP_L('Su-30MK2'), 'Modernste Kampfflugzeuge Ostafrikas'),
    ws('Hubschrauber', 'Mi-24/Mi-35', 6, 'Russland', 'Aktiv', IISS, IISS_L, 'Kampfhubschrauber, im Einsatz in Somalia'),
    ws('Hubschrauber', 'Mi-17', 8, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('MLRS', 'BM-21 Grad', 9, 'Russland', 'Aktiv', IISS, IISS_L),
  ],
  actors: [
    act('ADF (Allied Democratic Forces)', 'Terrororganisation (IS-affiliiert)', 'Seit 1996 aktive bewaffnete Gruppe, ursprünglich ugandisch, jetzt primär in der östlichen DRC (Nord-Kivu, Ituri) operierend. Seit 2019 vom IS als „Zentralafrikanische Provinz" (ISCAP) anerkannt. Verantwortlich für Massaker an Zivilisten im Kongo und Bombenanschläge in Kampala (2021).', 'Aktiv', 'Östliche DRC (Nord-Kivu, Ituri), vereinzelt Uganda', '2.000–4.000', WP('Allied_Democratic_Forces'), WP_L('Allied Democratic Forces')),
    act('LRA (Lord\'s Resistance Army)', 'Bewaffnete Rebellengruppe', 'Von Joseph Kony 1987 gegründet. Berüchtigt für Entführungen von Kindern, Verstümmelungen und extreme Brutalität. Durch US-unterstützte UPDF-Operationen seit 2011 massiv geschwächt. Kony auf der Flucht, wahrscheinlich in der ZAR oder dem Sudan. Nur noch wenige hundert Kämpfer.', 'Weitgehend dezimiert', 'ZAR, DRC, Sudan (Reste)', '100–250', WP('Lord%27s_Resistance_Army'), WP_L('Lord\'s Resistance Army')),
  ],
  conflicts: [
    con('ADF-Aufstand (DRC)', ['UPDF', 'FARDC (DRC)', 'MONUSCO', 'ADF/ISCAP'], 'Aktiv', 2013, undefined, 'Uganda führt seit 2021 gemeinsam mit der DRC die Operation Shujaa gegen die ADF in Nord-Kivu und Ituri. Die ADF verübt weiterhin Massaker und Bombenanschläge. IS-Zugehörigkeit (ISCAP) hat die Radikalisierung und internationale Vernetzung verstärkt.', '7.000+ Tote (2017-2024)', WP('Allied_Democratic_Forces_insurgency'), WP_L('ADF-Aufstand')),
    con('Norduganda / LRA-Krieg', ['UPDF', 'LRA (Kony)'], 'Beendet (in Uganda)', 1987, 2006, 'Brutaler Bürgerkrieg in Norduganda. LRA entführte über 30.000 Kinder als Soldaten und Sexsklaven. 1,8 Mio. Binnenvertriebene. 2005-2006 Waffenstillstand, danach LRA aus Uganda verdrängt. Kony-2012-Kampagne machte Konflikt weltweit bekannt.', '100.000+ Tote, 30.000 entführte Kinder', WP('Lord%27s_Resistance_Army_insurgency'), WP_L('LRA-Aufstand')),
  ],
  relations: [
    rel('US', 'USA', '🇺🇸', 'Ambivalent', 'Historische Kooperation bei Terrorbekämpfung (LRA, Al-Shabaab). US-Spezialkräfte halfen bei LRA-Jagd. Massive Verschlechterung seit Anti-Homosexualitäts-Gesetz 2023. Kürzung von Hilfsgeldern und Sanktionen.', WP('Uganda%E2%80%93United_States_relations'), WP_L('Ugandisch-amerikanische Beziehungen')),
    rel('RW', 'Ruanda', '🇷🇼', 'Rivale', 'Ehemalige enge Verbündete (Museveni unterstützte Kagame 1994). Seit 2019 schwere Spannungen: gegenseitige Spionagevorwürfe, Grenzschließung 2019-2022. Rivalität um Einfluss in der östlichen DRC. Beziehungen langsam verbessert.', WP('Rwanda%E2%80%93Uganda_relations'), WP_L('Ruandisch-ugandische Beziehungen')),
    rel('CD', 'DR Kongo', '🇨🇩', 'Sicherheitspartner', 'Gemeinsame Operation Shujaa gegen ADF seit November 2021. UPDF operiert mit kongolesischer Zustimmung in Nord-Kivu und Ituri. Historisch belastet durch ugandische Interventionen in den Kongo-Kriegen (1996-2003).', WP('Democratic_Republic_of_the_Congo%E2%80%93Uganda_relations'), WP_L('Kongolesisch-ugandische Beziehungen')),
    rel('SO', 'Somalia', '🇸🇴', 'ATMIS-Partner', 'Uganda ist größter Truppensteller für AMISOM/ATMIS mit über 6.000 Soldaten in Somalia seit 2007. UPDF-Truppen bilden das Rückgrat der AU-Mission. Uganda hat bedeutende Verluste im Kampf gegen Al-Shabaab erlitten.', WP('African_Union_Transition_Mission_in_Somalia'), WP_L('ATMIS')),
    rel('SS', 'Südsudan', '🇸🇸', 'Verbündeter', 'Enge Unterstützung für Präsident Kiir. UPDF intervenierte 2013-2014 militärisch im südsudanesischen Bürgerkrieg. Wirtschaftliche Verbindungen über Ölexporte (Pipeline-Pläne). Flüchtlinge: über 900.000 Südsudanesen in Uganda.', WP('South_Sudan%E2%80%93Uganda_relations'), WP_L('Südsudanesisch-ugandische Beziehungen')),
  ],
  missions: [
    mis('ATMIS (Uganda)', 'Ugandische ATMIS-Truppen in Somalia', 'AU', 'Friedenssicherung/Terrorbekämpfung', 'Aktiv', 2007, undefined, 6200, 'Uganda stellt das größte Kontingent der AU-Mission in Somalia. UPDF-Truppen seit 2007 im Einsatz (anfangs AMISOM). Verantwortlich für Sektor 1 (Banadir/Mogadischu-Region). Erhebliche Kampferfahrung gegen Al-Shabaab.', ['SO'], WP('African_Union_Transition_Mission_in_Somalia'), WP_L('ATMIS')),
    mis('Operation Shujaa', 'UPDF-FARDC Joint Operations', 'Sonstige', 'Terrorbekämpfung', 'Aktiv', 2021, undefined, 2000, 'Gemeinsame ugandisch-kongolesische Militäroperation gegen die ADF in der östlichen DRC. Einsatz von Artillerie, Luftangriffen und Bodenoperationen. Gemischte Ergebnisse: einige ADF-Lager zerstört, aber Gruppe weiterhin aktiv.', ['UG', 'CD'], WP('Operation_Shujaa'), WP_L('Operation Shujaa')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// RWANDA (RW)
// ═══════════════════════════════════════════════════════════════

const RW: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Rwanda Defence Force (RDF)',
    founded: 1994,
    activePersonnel: 33000,
    reservePersonnel: 2000,
    paramilitaryPersonnel: 2000,
    militaryBudget: 140000000,
    budgetPercentGDP: 1.2,
    conscription: false,
    commanderInChief: 'Präsident Paul Kagame',
    source: GFP('rwanda'),
    sourceLabel: GFP_L('Ruanda'),
  },
  weaponSystems: [
    ws('Gepanzerte Fahrzeuge', 'RG-31 Nyala', 20, 'Südafrika', 'Aktiv', IISS, IISS_L, 'MRAP-Fahrzeuge'),
    ws('Gepanzerte Fahrzeuge', 'AML-90 / AML-60', 16, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Buffalo MRAP', 14, 'Südafrika/USA', 'Aktiv', IISS, IISS_L, 'Für Friedensmissionen'),
    ws('Artillerie', 'D-30 122mm Haubitze', 6, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Hubschrauber', 'Mi-24V Hind', 4, 'Russland', 'Aktiv', IISS, IISS_L, 'Kampfhubschrauber'),
    ws('Hubschrauber', 'Mi-17', 8, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Leichte Kampfflugzeuge', 'Aermacchi SF-260TP', 4, 'Italien', 'Aktiv', IISS, IISS_L, 'Trainings- und leichte Angriffsflugzeuge'),
    ws('Flugabwehr', 'MANPADS (Igla)', 20, 'Russland', 'Aktiv', IISS, IISS_L),
  ],
  actors: [
    act('FDLR (Demokratische Kräfte zur Befreiung Ruandas)', 'Bewaffnete Rebellengruppe', 'Hutu-Miliz in der östlichen DRC, hervorgegangen aus den Resten der Interahamwe und der ehemaligen ruandischen Armee (ex-FAR), die den Völkermord 1994 verübten. Operiert in Nord- und Süd-Kivu. Trotz Schwächung immer noch aktiv. Ruanda nutzt die FDLR-Bedrohung als Rechtfertigung für Interventionen in der DRC.', 'Aktiv (geschwächt)', 'Östliche DRC (Nord-Kivu, Süd-Kivu)', '1.000–2.000', WP('Democratic_Forces_for_the_Liberation_of_Rwanda'), WP_L('FDLR')),
    act('RNC (Rwanda National Congress)', 'Opposition im Exil', 'Von ehemaligen ranghohen Kagame-Vertrauten gegründete Exilopposition (u.a. General Kayumba Nyamwasa). Kigali beschuldigt den RNC der Zusammenarbeit mit FDLR und destabilisierender Aktivitäten. Mitglieder wurden im Ausland Ziel von Anschlägen.', 'Im Exil', 'Südafrika, Europa, USA', 'Unbekannt', WP('Rwanda_National_Congress'), WP_L('Rwanda National Congress')),
    act('M23 (Mouvement du 23 mars)', 'Bewaffnete Rebellengruppe (Proxy)', 'Tutsi-dominierte Rebellengruppe in der östlichen DRC. Von UN-Experten, USA und EU als von Ruanda unterstützt und effektiv kontrolliert eingestuft. 2012 erstmals prominent, 2022 Wiederaufflammen mit massiver Territorialexpansion in Nord-Kivu. De facto ruandische Proxy-Truppe.', 'Aktiv', 'Östliche DRC (Nord-Kivu, um Goma)', '3.000–4.000 (+ RDF-Unterstützung)', WP('March_23_Movement'), WP_L('M23')),
  ],
  conflicts: [
    con('DRC/M23-Krise', ['DRC (FARDC)', 'M23/Ruanda (RDF)', 'FDLR', 'MONUSCO', 'EAC-Truppe'], 'Aktiv', 2022, undefined, 'Wiederaufflammen des M23-Konflikts in Nord-Kivu seit 2022. Ruanda stationiert laut UN-Berichten bis zu 4.000 RDF-Soldaten in der DRC zur Unterstützung der M23. Einnahme großer Gebiete um Goma. Massive humanitäre Krise mit über 6 Mio. Binnenvertriebenen in der gesamten Ost-DRC.', '10.000+ Tote, 6+ Mio. Vertriebene', WP('M23_offensive_(2022%E2%80%93present)'), WP_L('M23-Offensive 2022')),
    con('Völkermord in Ruanda (Nachwirkungen)', ['Ruandische Regierung (RPF)', 'FDLR/Ex-Interahamwe'], 'Nachwirkungen', 1994, 1994, 'Der Völkermord an den Tutsi 1994 (800.000+ Tote in 100 Tagen) prägt Ruandas Sicherheitspolitik bis heute. Die Verfolgung von Génocidaires im Ausland, die FDLR-Bedrohung in der DRC und die innenpolitische Kontrolle werden damit legitimiert.', '800.000+ Tote (1994)', WP('Rwandan_genocide'), WP_L('Völkermord in Ruanda')),
  ],
  relations: [
    rel('US', 'USA', '🇺🇸', 'Angespannt', 'Historisch enge Partnerschaft, aber zunehmende Spannungen wegen ruandischer Intervention in der DRC (M23). USA haben Militärhilfe reduziert und Sanktionen gegen RDF-Offiziere verhängt. Dennoch Zusammenarbeit bei Friedensmissionen.', WP('Rwanda%E2%80%93United_States_relations'), WP_L('Ruandisch-amerikanische Beziehungen')),
    rel('GB', 'Großbritannien', '🇬🇧', 'Partner', 'Commonwealth-Mitglied seit 2009. Umstrittenes Rwanda-Asylabkommen (2022-2024): Großbritannien plante Abschiebung von Asylsuchenden nach Ruanda. Bedeutende Entwicklungshilfe. Kritik an Menschenrechtslage.', WP('Rwanda%E2%80%93United_Kingdom_relations'), WP_L('Ruandisch-britische Beziehungen')),
    rel('FR', 'Frankreich', '🇫🇷', 'Versöhnung', 'Schwer belastete Beziehung wegen französischer Rolle vor und während des Völkermords 1994 (Opération Turquoise). Macron-Bericht 2021 erkannte französisches Versagen an. Annäherung unter Macron und Kagame, Wiederaufnahme diplomatischer Beziehungen.', WP('France%E2%80%93Rwanda_relations'), WP_L('Französisch-ruandische Beziehungen')),
    rel('CD', 'DR Kongo', '🇨🇩', 'Feindlich', 'Schwere Krise wegen M23-Unterstützung. DRC hat diplomatische Beziehungen 2022 abgebrochen. UN-Berichte dokumentieren direkte RDF-Beteiligung in der DRC. Ruanda bestreitet offiziell, beruft sich auf FDLR-Bedrohung. Schlimmste bilaterale Krise seit den Kongo-Kriegen.', WP('Democratic_Republic_of_the_Congo%E2%80%93Rwanda_relations'), WP_L('Kongolesisch-ruandische Beziehungen')),
    rel('UG', 'Uganda', '🇺🇬', 'Verbessert', 'Ehemalige Verbündete, dann schwere Spannungen 2019-2022 (Grenzschließung, Spionagevorwürfe). Konkurrenz um Einfluss in der DRC. Beziehungen seit 2022 langsam verbessert nach Vermittlung durch Angola.', WP('Rwanda%E2%80%93Uganda_relations'), WP_L('Ruandisch-ugandische Beziehungen')),
  ],
  missions: [
    mis('RDF in Mosambik', 'Rwanda Defence Force Deployment Mozambique', 'Sonstige', 'Terrorbekämpfung', 'Aktiv', 2021, undefined, 2500, 'Bilaterale Stationierung von ~2.500 RDF-Soldaten in der Provinz Cabo Delgado (Mosambik) zur Bekämpfung des IS-Ablegers Ansar al-Sunna. Erhebliche Erfolge bei der Rückeroberung von Mocímboa da Praia. Ruanda stärkt damit sein internationales Ansehen.', ['MZ'], WP('Rwandan_military_intervention_in_Mozambique'), WP_L('RDF in Mosambik')),
    mis('RDF in Südsudan (UNMISS)', 'Rwanda UNMISS Contingent', 'UN', 'Friedenssicherung', 'Aktiv', 2014, undefined, 1000, 'Ruandisches Kontingent bei UNMISS. Ruanda ist weltweit einer der größten Truppensteller für UN-Friedensmissionen. Mechanisierte Infanterie und Pioniere.', ['SS'], 'https://unmiss.unmissions.org/', 'UNMISS'),
    mis('RDF in ZAR (MINUSCA)', 'Rwanda MINUSCA Contingent', 'UN', 'Friedenssicherung', 'Aktiv', 2014, undefined, 1370, 'Größtes Kontingent bei MINUSCA. Ruandische Truppen spielen zentrale Rolle beim Schutz der Zivilbevölkerung in der Zentralafrikanischen Republik.', ['CF'], WP('MINUSCA'), WP_L('MINUSCA')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// ERITREA (ER)
// ═══════════════════════════════════════════════════════════════

const ER: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Eritrean Defence Forces (EDF / ሓይልታት ምክልኻል ኤርትራ)',
    founded: 1993,
    activePersonnel: 200000,
    reservePersonnel: 120000,
    paramilitaryPersonnel: 0,
    militaryBudget: 80000000,
    budgetPercentGDP: 3.5,
    conscription: true,
    commanderInChief: 'Präsident Isaias Afwerki',
    source: GFP('eritrea'),
    sourceLabel: GFP_L('Eritrea'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-55', 150, 'Russland/Äthiopien (erbeutet)', 'Teilweise aktiv', IISS, IISS_L, 'Große Bestände, viele in schlechtem Zustand'),
    ws('Gepanzerte Fahrzeuge', 'BTR-60/BTR-70', 40, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'BRDM-2', 25, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Artillerie', 'D-30 122mm / M-46 130mm', 50, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('MLRS', 'BM-21 Grad', 35, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'MiG-29 Fulcrum', 4, 'Russland', 'Fragliche Einsatzfähigkeit', IISS, IISS_L, 'Möglicherweise nicht mehr flugfähig'),
    ws('Kampfflugzeuge', 'Su-27 Flanker', 3, 'Russland', 'Fragliche Einsatzfähigkeit', IISS, IISS_L, 'Begrenzte Ersatzteile'),
    ws('Patrouillenboote', 'Diverse Küstenboote', 15, 'Diverse', 'Aktiv', WP('Eritrean_Navy'), WP_L('Eritreische Marine'), 'Kleine Küstenwache am Roten Meer'),
  ],
  actors: [
    act('ELF-Fraktionen (im Exil)', 'Opposition im Exil', 'Eritreische Befreiungsfront – verschiedene Fraktionen im Exil (Äthiopien, Sudan, Europa). Historisch erste Befreiungsbewegung Eritreas. Seit der Unabhängigkeit 1993 marginalisiert. Keine nennenswerte militärische Kapazität innerhalb Eritreas.', 'Im Exil', 'Äthiopien, Sudan, Europa', 'Gering', WP('Eritrean_Liberation_Front'), WP_L('Eritreische Befreiungsfront')),
    act('Red Sea Afar Democratic Organisation', 'Opposition im Exil', 'Afar-Oppositionsgruppe, die für die Rechte der Afar-Minderheit in Eritrea eintritt. Begrenzte militärische Aktivitäten an der äthiopisch-eritreischen Grenze. Teil der eritreischen Exilopposition.', 'Weitgehend inaktiv', 'Äthiopisch-eritreische Grenzregion', 'Einige Hundert', WP('Red_Sea_Afar_Democratic_Organisation'), WP_L('RSADO')),
  ],
  conflicts: [
    con('Tigray-Krieg (Beteiligung)', ['Äthiopische Streitkräfte (ENDF)', 'Eritreische Streitkräfte (EDF)', 'TPLF/TDF'], 'Beendet (Pretoria-Abkommen 2022)', 2020, 2022, 'Eritrea intervenierte 2020 im äthiopischen Bürgerkrieg in Tigray auf Seiten der Bundesregierung gegen die TPLF. EDF-Truppen verübten schwere Kriegsverbrechen in Tigray (Massaker von Axum). Trotz des Friedensabkommens von Pretoria (Nov. 2022) zogen sich eritreische Truppen nur teilweise zurück.', '600.000+ Tote (gesamt, alle Parteien)', WP('Tigray_War'), WP_L('Tigray-Krieg')),
    con('Eritreisch-äthiopischer Krieg', ['Eritrea', 'Äthiopien'], 'Beendet', 1998, 2000, 'Grenzkrieg mit geschätzten 70.000-100.000 Toten. Ausgelöst durch Grenzstreit um Badme. Friedensabkommen 2000 (Algier), aber „Kalter Frieden" bis 2018. Nobelpreis für Abiy Ahmed für Friedensschluss 2018.', '70.000–100.000 Tote', WP('Eritrean%E2%80%93Ethiopian_War'), WP_L('Eritreisch-äthiopischer Krieg')),
  ],
  relations: [
    rel('ET', 'Äthiopien', '🇪🇹', 'Allianz (seit 2018)', 'Historischer Friedensschluss 2018 (Nobelpreis für Abiy Ahmed). Gemeinsame Militäroperationen in Tigray 2020-2022. Strategische Allianz zwischen Isaias und Abiy, aber Umsetzung des Friedensabkommens stagniert. Grenze zeitweise geöffnet, dann wieder geschlossen.', WP('Eritrea%E2%80%93Ethiopia_relations'), WP_L('Eritreisch-äthiopische Beziehungen')),
    rel('AE', 'VAE / Saudi-Arabien', '🇦🇪', 'Rote-Meer-Allianz', 'Enge Beziehungen zur Golfkoalition. Eritrea stellte Assab-Hafen für emiratische Militäroperationen im Jemen zur Verfügung. Finanzielle Unterstützung aus den Golfstaaten. Strategische Partnerschaft am Roten Meer.', WP('Eritrea%E2%80%93United_Arab_Emirates_relations'), WP_L('Eritreisch-emiratische Beziehungen')),
    rel('RU', 'Russland', '🇷🇺', 'Diplomatischer Unterstützer', 'Russland blockiert Resolutionen gegen Eritrea im UN-Sicherheitsrat. Historische sowjetische Waffenlieferungen. Eritrea enthielt sich bei der UN-Abstimmung zur Verurteilung der russischen Invasion der Ukraine.', WP('Eritrea%E2%80%93Russia_relations'), WP_L('Eritreisch-russische Beziehungen')),
    rel('US', 'USA', '🇺🇸', 'Feindlich', 'Eritrea ist weitgehend isoliert. US-Sanktionen wegen Menschenrechtsverletzungen, Massenkonskripton und Destabilisierung am Horn von Afrika. Eritrea als eines der repressivsten Regime der Welt eingestuft.', WP('Eritrea%E2%80%93United_States_relations'), WP_L('Eritreisch-amerikanische Beziehungen')),
    rel('CN', 'China', '🇨🇳', 'Partner', 'China investiert in eritreische Bergbauprojekte (Bisha-Mine). Diplomatische Unterstützung im UN-Rahmen. Eritrea ist Teil der chinesischen Belt-and-Road-Initiative.', WP('China%E2%80%93Eritrea_relations'), WP_L('Chinesisch-eritreische Beziehungen')),
  ],
  missions: [],
};

// ═══════════════════════════════════════════════════════════════
// DJIBOUTI (DJ)
// ═══════════════════════════════════════════════════════════════

const DJ: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Forces Armées Djiboutiennes (FAD)',
    founded: 1977,
    activePersonnel: 10450,
    reservePersonnel: 0,
    paramilitaryPersonnel: 2500,
    militaryBudget: 70000000,
    budgetPercentGDP: 2.0,
    conscription: false,
    commanderInChief: 'Präsident Ismaïl Omar Guelleh',
    source: GFP('djibouti'),
    sourceLabel: GFP_L('Dschibuti'),
  },
  weaponSystems: [
    ws('Gepanzerte Fahrzeuge', 'VBL (Panhard)', 18, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'BTR-60', 12, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'M1117 Guardian', 12, 'USA', 'Aktiv', IISS, IISS_L, 'US-Sicherheitshilfe'),
    ws('Artillerie', 'D-30 122mm Haubitze', 6, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Patrouillenboote', 'Diverse', 10, 'Diverse', 'Aktiv', WP('Djibouti_Navy'), WP_L('Marine von Dschibuti'), 'Küstenwache und Anti-Piraterie'),
    ws('Hubschrauber', 'AS355 Ecureuil', 2, 'Frankreich', 'Aktiv', IISS, IISS_L, 'Leichte Mehrzweckhubschrauber'),
    ws('Flugabwehr', 'ZU-23-2', 10, 'Russland', 'Aktiv', IISS, IISS_L),
  ],
  actors: [
    act('FRUD (Front pour la Restauration de l\'Unité et de la Démocratie)', 'Ehemalige Rebellengruppe', 'Afar-Rebellenbewegung, gegründet 1991. Führte 1991-1994 einen Bürgerkrieg gegen die Issa-dominierte Regierung. Friedensabkommen 1994 und 2001. Radikaler Flügel (FRUD-armé) weitgehend inaktiv. Politischer Flügel in die Regierung integriert.', 'Weitgehend inaktiv', 'Afar-Regionen im Norden', 'Gering (als bewaffnete Gruppe)', WP('Front_for_the_Restoration_of_Unity_and_Democracy'), WP_L('FRUD')),
  ],
  conflicts: [],
  relations: [
    rel('US', 'USA', '🇺🇸', 'Strategischer Partner', 'Camp Lemonnier: Einzige permanente US-Militärbasis in Afrika mit ~4.000 Soldaten. Jährliche Pacht von ~63 Mio. USD. Basis für Drohnenoperationen, Spezialeinheiten und Antiterroroperationen am Horn von Afrika und im Jemen. US-Präsenz garantiert Dschibutis Sicherheit.', AFRICOM, AFRICOM_L),
    rel('CN', 'China', '🇨🇳', 'Strategischer Partner', 'Erste ausländische Militärbasis Chinas (PLA Support Base, eröffnet 2017). ~2.000 Soldaten. 400m-Pier für Kriegsschiffe. Massive Infrastrukturinvestitionen: Eisenbahn Dschibuti-Addis Abeba (chinesisch finanziert). Hohe Verschuldung gegenüber China.', WP('Chinese_People%27s_Liberation_Army_Support_Base_in_Djibouti'), WP_L('Chinesische Militärbasis Dschibuti')),
    rel('FR', 'Frankreich', '🇫🇷', 'Historischer Partner', 'Größte französische Militärbasis im Ausland: ~1.500 Soldaten (Forces françaises stationnées à Djibouti / FFDj). Ehemalige Kolonialmacht (bis 1977). Kampfhubschrauber, Mirage-Jagdflugzeuge, Fremdenlegion stationiert. Garantiert Dschibutis Souveränität.', WP('French_Armed_Forces_in_Djibouti'), WP_L('Französische Streitkräfte in Dschibuti')),
    rel('JP', 'Japan', '🇯🇵', 'Militärbasis-Partner', 'Japanische JSDF-Basis seit 2011 – erste japanische Militärbasis im Ausland seit dem Zweiten Weltkrieg. ~170 Soldaten. Anti-Piraterie-Operationen im Golf von Aden.', WP('Japan_Self-Defense_Force_Base_Djibouti'), WP_L('JSDF-Basis Dschibuti')),
    rel('IT', 'Italien', '🇮🇹', 'Militärbasis-Partner', 'Italienische Militärbasis (Base Militare Nazionale di Supporto). Ehemalige Kolonialmacht (bis 1896, Einfluss bis 1940er). ~300 Soldaten. Logistik und Ausbildung.', WP('Italian_military_presence_in_Djibouti'), WP_L('Italienische Militärpräsenz in Dschibuti')),
    rel('ET', 'Äthiopien', '🇪🇹', 'Wirtschaftliche Symbiose', 'Äthiopien ist als Binnenstaat auf den Hafen von Dschibuti angewiesen (95% des Außenhandels). Neue chinesisch-finanzierte Eisenbahn verbindet Addis Abeba und Dschibuti-Stadt. Wirtschaftliche Abhängigkeit bestimmt die Beziehung.', WP('Djibouti%E2%80%93Ethiopia_relations'), WP_L('Dschibutisch-äthiopische Beziehungen')),
  ],
  missions: [
    mis('Camp Lemonnier', 'US Military Base Djibouti', 'US', 'Militärbasis', 'Aktiv', 2001, undefined, 4000, 'Einzige permanente US-Militärbasis in Afrika. Drohnenoperationen, Spezialkräfte, Logistik für Ostafrika und Jemen. Basis der Combined Joint Task Force – Horn of Africa (CJTF-HOA).', ['DJ'], AFRICOM, AFRICOM_L),
    mis('PLA Support Base', 'Chinese PLA Support Base Djibouti', 'China', 'Militärbasis', 'Aktiv', 2017, undefined, 2000, 'Erste ausländische Militärbasis Chinas. Offiziell Logistikunterstützung für Anti-Piraterie- und Evakuierungsoperationen. 400m-Pier für Großkampfschiffe.', ['DJ'], WP('Chinese_People%27s_Liberation_Army_Support_Base_in_Djibouti'), WP_L('Chinesische Militärbasis Dschibuti')),
    mis('FFDj', 'Forces françaises stationnées à Djibouti', 'Sonstige', 'Militärbasis', 'Aktiv', 1977, undefined, 1500, 'Größte französische Militärbasis im Ausland. Fremdenlegion (13e DBLE), Kampfhubschrauber, Mirage-Flugzeuge. Garantiert Dschibutis Souveränität und Stabilität in der Region.', ['DJ'], WP('French_Armed_Forces_in_Djibouti'), WP_L('Französische Streitkräfte in Dschibuti')),
    mis('JSDF Djibouti', 'Japan Self-Defense Force Base Djibouti', 'Sonstige', 'Militärbasis', 'Aktiv', 2011, undefined, 170, 'Erste japanische Militärbasis im Ausland seit 1945. Anti-Piraterie-Patrouillen im Golf von Aden. P-3C Orion Seeaufklärer.', ['DJ'], WP('Japan_Self-Defense_Force_Base_Djibouti'), WP_L('JSDF-Basis Dschibuti')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// BURUNDI (BI)
// ═══════════════════════════════════════════════════════════════

const BI: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Force de Défense Nationale du Burundi (FDN)',
    founded: 1962,
    activePersonnel: 30000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 31000,
    militaryBudget: 65000000,
    budgetPercentGDP: 1.8,
    conscription: false,
    commanderInChief: 'Präsident Évariste Ndayishimiye',
    source: GFP('burundi'),
    sourceLabel: GFP_L('Burundi'),
  },
  weaponSystems: [
    ws('Gepanzerte Fahrzeuge', 'BTR-80', 16, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Panhard AML-60/90', 18, 'Frankreich', 'Teilweise aktiv', IISS, IISS_L, 'Ältere Bestände'),
    ws('Gepanzerte Fahrzeuge', 'BRDM-2', 30, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Artillerie', 'D-30 122mm Haubitze', 18, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Mörser', '81mm und 120mm Mörser', 100, 'Diverse', 'Aktiv', IISS, IISS_L),
    ws('Leichte Waffen', 'AK-47 / FAL / G3', 40000, 'Diverse', 'Aktiv', IISS, IISS_L, 'Breite Verbreitung in der Bevölkerung'),
    ws('Hubschrauber', 'Mi-8/Mi-17', 3, 'Russland', 'Teilweise aktiv', IISS, IISS_L),
    ws('Patrouillenboote', 'Vedette (Tanganjikasee)', 4, 'Diverse', 'Aktiv', IISS, IISS_L, 'Patrouillen auf dem Tanganjikasee'),
  ],
  actors: [
    act('RED-Tabara (Résistance pour un État de Droit)', 'Bewaffnete Opposition', 'Bewaffnete Oppositionsgruppe, gegründet 2011. Verübt sporadische Angriffe auf Sicherheitskräfte, insbesondere in der Provinz Bujumbura Rural. Operiert teilweise aus der DRC. Begrenzte militärische Kapazität.', 'Aktiv (gering)', 'Bujumbura Rural, grenzüberschreitend DRC', '500–1.000', WP('RED-Tabara'), WP_L('RED-Tabara')),
    act('CNL (Congrès National pour la Liberté)', 'Politische Opposition', 'Größte Oppositionspartei unter Agathon Rwasa. Ehemaliger FNL-Rebellenführer. Politisch marginalisiert, Vorwürfe der Wahlmanipulation 2020. Keine bewaffnete Aktivität, aber Anhänger werden verfolgt und inhaftiert.', 'Unterdrückt', 'Landesweit', 'Politische Partei', WP('Congress_for_Liberty'), WP_L('CNL')),
    act('Imbonerakure', 'Paramilitärische Jugendmiliz', 'Jugendliga der Regierungspartei CNDD-FDD. De-facto-paramilitärische Kraft, die bei Einschüchterung, Erpressung und politischer Gewalt eingesetzt wird. Von UN als Menschenrechtsverletzter dokumentiert. Schätzungen sprechen von Zehntausenden Mitgliedern.', 'Aktiv', 'Landesweit', '30.000+', WP('Imbonerakure'), WP_L('Imbonerakure')),
  ],
  conflicts: [
    con('Post-2015-Krise', ['Regierung (CNDD-FDD)', 'Opposition (RED-Tabara, FNL-Dissidenten)', 'Imbonerakure'], 'Niedrige Intensität', 2015, undefined, 'Politische Krise nach der umstrittenen dritten Amtszeit von Präsident Nkurunziza 2015. Gescheiterter Putschversuch. Über 1.200 Tote, 400.000 Flüchtlinge. Regierung reagierte mit massiver Repression. Ndayishimiye übernahm 2020, moderate Öffnung, aber Repression hält an.', '1.200+ Tote, 400.000 Flüchtlinge (seit 2015)', WP('Burundian_unrest_(2015%E2%80%93present)'), WP_L('Burundi-Krise 2015')),
    con('Ethnische Spannungen (Hutu/Tutsi)', ['Diverse'], 'Latent', 1962, undefined, 'Tief verwurzelte ethnische Spannungen zwischen Hutu (85%) und Tutsi (14%). Genozid 1972 und 1993, Bürgerkrieg 1993-2005 mit 300.000 Toten. Arusha-Friedensabkommen 2000 sicherte ethnische Machtteilung, die zunehmend untergraben wird.', '300.000+ Tote (Bürgerkrieg 1993-2005)', WP('Burundian_Civil_War'), WP_L('Burundischer Bürgerkrieg')),
  ],
  relations: [
    rel('TZ', 'Tansania', '🇹🇿', 'Enger Verbündeter', 'Tansania ist Burundis wichtigster regionaler Partner. Vermittelte im Arusha-Friedensprozess. Aufnahme burundischer Flüchtlinge. Wirtschaftliche Verbindungen über den Tanganjikasee. Tansania unterstützt Burundis Rückkehr in die internationale Gemeinschaft.', WP('Burundi%E2%80%93Tanzania_relations'), WP_L('Burundisch-tansanische Beziehungen')),
    rel('CD', 'DR Kongo', '🇨🇩', 'Angespannt', 'Grenzspannungen wegen bewaffneter Gruppen (RED-Tabara operiert aus der DRC). Burundi beschuldigt DRC, Rebellen zu dulden. Flüchtlingsströme in beide Richtungen. Kooperation beim Tanganjikasee begrenzt.', WP('Burundi%E2%80%93Democratic_Republic_of_the_Congo_relations'), WP_L('Burundisch-kongolesische Beziehungen')),
    rel('RW', 'Ruanda', '🇷🇼', 'Feindlich', 'Gegenseitige Beschuldigungen der Unterstützung von Rebellengruppen. Burundi wirft Ruanda vor, RED-Tabara zu unterstützen. Ruanda beschuldigt Burundi der Zusammenarbeit mit FDLR. Grenze zeitweise geschlossen. Ethnische Parallelen verschärfen Misstrauen.', WP('Burundi%E2%80%93Rwanda_relations'), WP_L('Burundisch-ruandische Beziehungen')),
    rel('AU', 'Afrikanische Union', '🇺🇳', 'Reintegration', 'Burundi war nach 2015 weitgehend international isoliert. AU drohte mit Friedenstruppe, Burundi lehnte ab. Unter Ndayishimiye schrittweise Reintegration. EU-Sanktionen 2022 aufgehoben. Burundi stellt Truppen für AMISOM/ATMIS in Somalia.', WP('African_Union'), WP_L('Afrikanische Union')),
  ],
  missions: [
    mis('ATMIS (Burundi)', 'Burundische ATMIS-Truppen in Somalia', 'AU', 'Friedenssicherung/Terrorbekämpfung', 'Aktiv', 2007, undefined, 5400, 'Burundi ist einer der größten Truppensteller für AMISOM/ATMIS in Somalia mit ~5.400 Soldaten. Die Friedensmission ist wichtige Einnahmequelle für die burundische Armee (UN-Zulagen).', ['SO'], WP('African_Union_Transition_Mission_in_Somalia'), WP_L('ATMIS')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// MOZAMBIQUE (MZ)
// ═══════════════════════════════════════════════════════════════

const MZ: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Forças Armadas de Defesa de Moçambique (FADM)',
    founded: 1994,
    activePersonnel: 11200,
    reservePersonnel: 0,
    paramilitaryPersonnel: 0,
    militaryBudget: 200000000,
    budgetPercentGDP: 1.1,
    conscription: true,
    commanderInChief: 'Präsident Daniel Chapo',
    source: GFP('mozambique'),
    sourceLabel: GFP_L('Mosambik'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-54/T-55', 60, 'Russland', 'Teilweise aktiv', IISS, IISS_L, 'Viele in schlechtem Zustand'),
    ws('Gepanzerte Fahrzeuge', 'BTR-60', 80, 'Russland', 'Teilweise aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Casspir MRAP', 24, 'Südafrika', 'Aktiv', IISS, IISS_L, 'Neuere Anschaffung für Cabo Delgado'),
    ws('Artillerie', 'BM-21 Grad', 12, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Artillerie', 'D-30 122mm', 12, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Hubschrauber', 'Mi-24 Hind', 2, 'Russland', 'Teilweise aktiv', IISS, IISS_L, 'Im Einsatz in Cabo Delgado'),
    ws('Hubschrauber', 'Mi-8/Mi-17', 5, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Patrouillenboote', 'Diverse', 8, 'Diverse', 'Aktiv', WP('Mozambican_Navy'), WP_L('Mosambikanische Marine'), 'Küstenüberwachung'),
  ],
  actors: [
    act('Ansar al-Sunna / Al-Shabaab Mosambik / IS-Mosambik', 'Terrororganisation (IS-affiliiert)', 'Islamistischer Aufstand in der Provinz Cabo Delgado seit Oktober 2017. Lokal als „Al-Shabaab" bekannt (nicht verwandt mit der somalischen Gruppe). Seit 2019 Treue zum IS (ISCAP – Islamischer Staat Zentralafrikanische Provinz). Enthauptungen, Zerstörung von Dörfern, Vertreibung von über 1 Million Menschen. Angriff auf Palma (März 2021) stoppte TotalEnergies-Gasprojekt ($20 Mrd.).', 'Aktiv', 'Cabo Delgado (Nordmosambik)', '1.000–2.500', WP('Insurgency_in_Cabo_Delgado'), WP_L('Aufstand in Cabo Delgado')),
    act('RENAMO (Resistência Nacional Moçambicana)', 'Ehemalige Rebellengruppe / Opposition', 'Ehemaliger Bürgerkriegsgegner (1977-1992). Friedensabkommen 1992, erneute Militarisierung 2013-2019. Endgültiger Friedensvertrag 2019. Jetzt politische Oppositionspartei unter Ossufo Momade. Ehemalige Kämpfer teilweise in Sicherheitskräfte integriert.', 'Politische Partei (befriedet)', 'Zentral- und Nordmosambik', 'Politische Partei', WP('RENAMO'), WP_L('RENAMO')),
  ],
  conflicts: [
    con('Cabo-Delgado-Aufstand', ['FADM', 'Ruandische RDF', 'SADC (SAMIM)', 'IS-Mosambik/Ansar al-Sunna'], 'Aktiv', 2017, undefined, 'Islamistischer Aufstand in der gasreichen Provinz Cabo Delgado seit Oktober 2017. Über 4.000 Tote, 1 Million Vertriebene. Das TotalEnergies-LNG-Projekt ($20 Mrd.) wurde 2021 nach dem Angriff auf Palma gestoppt. Ruandische und SADC-Truppen haben seit 2021 die Lage teilweise stabilisiert, aber Angriffe gehen in entlegenen Gebieten weiter.', '4.000+ Tote, 1+ Mio. Vertriebene', WP('Insurgency_in_Cabo_Delgado'), WP_L('Cabo-Delgado-Aufstand')),
    con('Politische Krise 2024', ['FRELIMO-Regierung', 'Opposition/Zivilgesellschaft'], 'Aktiv', 2024, undefined, 'Schwere politische Krise nach umstrittenen Wahlen im Oktober 2024. Massenproteste, Polizeigewalt, Hunderte Tote. Oppositionsführer Venâncio Mondlane mobilisiert Millionen. Tiefste politische Krise seit dem Bürgerkrieg.', '200+ Tote (Proteste)', WP('2024_Mozambican_protests'), WP_L('Mosambik-Proteste 2024')),
  ],
  relations: [
    rel('RW', 'Ruanda', '🇷🇼', 'Sicherheitspartner', 'Ruanda stationierte 2021 ca. 2.500 RDF-Soldaten in Cabo Delgado. Erhebliche Erfolge bei der Rückeroberung von Mocímboa da Praia und Stabilisierung der Region. Bilaterales Abkommen, nicht unter SADC-Rahmen. Ruanda nutzt den Einsatz zur internationalen Profilierung.', WP('Rwandan_military_intervention_in_Mozambique'), WP_L('RDF in Mosambik')),
    rel('ZA', 'SADC / Südafrika', '🇿🇦', 'Regionalpartner', 'SADC Mission in Mozambique (SAMIM) seit 2021 mit Truppen aus Südafrika, Tansania, Botswana und anderen. ~2.000 Soldaten. Koordination mit ruandischen Truppen. SADC-Mandat wiederholt verlängert.', WP('SADC_Mission_in_Mozambique'), WP_L('SAMIM')),
    rel('TZ', 'Tansania', '🇹🇿', 'Nachbar/Sicherheitspartner', 'Gemeinsame Grenze im Norden von Cabo Delgado. Aufständische operieren grenzüberschreitend. Tansania stellt Truppen für SAMIM. Flüchtlinge fliehen nach Tansania. Gemeinsame Grenzpatrouillen.', WP('Mozambique%E2%80%93Tanzania_relations'), WP_L('Mosambikanisch-tansanische Beziehungen')),
    rel('FR', 'Frankreich / TotalEnergies', '🇫🇷', 'Wirtschaftspartner', 'TotalEnergies investierte $20 Mrd. in LNG-Projekt in Cabo Delgado (Afungi). Produktion nach Angriff auf Palma 2021 auf unbestimmte Zeit ausgesetzt. Frankreich unterstützt militärische Stabilisierung. Größte einzelne Auslandsinvestition in Afrika.', WP('Mozambique_LNG'), WP_L('Mozambique LNG')),
    rel('US', 'USA', '🇺🇸', 'Sicherheitspartner', 'US-Spezialkräfte (Green Berets) bilden mosambikanische Marines aus. Bereitstellung von Ausrüstung und Aufklärung. USA haben Aufstand in Cabo Delgado als IS-Bedrohung eingestuft. Wachsende militärische Kooperation.', AFRICOM, AFRICOM_L),
  ],
  missions: [
    mis('SAMIM', 'SADC Mission in Mozambique', 'Sonstige', 'Terrorbekämpfung', 'Aktiv', 2021, undefined, 2000, 'SADC-geführte Mission zur Bekämpfung des Aufstands in Cabo Delgado. Truppen aus Südafrika, Tansania, Botswana, Lesotho, Angola und DRC. Operiert parallel zu ruandischen RDF-Truppen.', ['MZ'], WP('SADC_Mission_in_Mozambique'), WP_L('SAMIM')),
    mis('EUTM Mozambique', 'EU Training Mission Mozambique', 'EU', 'Militärische Ausbildung', 'Aktiv', 2021, undefined, 140, 'EU-Ausbildungsmission für mosambikanische Streitkräfte. Fokus auf Ausbildung von Spezialkräften und Logistik zur Bekämpfung des Aufstands in Cabo Delgado.', ['MZ'], EU_MISSIONS, EU_MISSIONS_L),
  ],
};

// ═══════════════════════════════════════════════════════════════
// ANGOLA (AO)
// ═══════════════════════════════════════════════════════════════

const AO: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Forças Armadas Angolanas (FAA)',
    founded: 1991,
    activePersonnel: 107000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 10000,
    militaryBudget: 3200000000,
    budgetPercentGDP: 1.7,
    conscription: true,
    commanderInChief: 'Präsident João Lourenço',
    source: GFP('angola'),
    sourceLabel: GFP_L('Angola'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-72', 22, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Kampfpanzer', 'T-55', 200, 'Russland', 'Teilweise aktiv', IISS, IISS_L, 'Große Bestände aus Bürgerkriegszeiten'),
    ws('Gepanzerte Fahrzeuge', 'BMP-1/BMP-2', 250, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'BTR-60/BTR-80', 170, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'Su-30K', 12, 'Russland', 'Aktiv', WP('Sukhoi_Su-30'), WP_L('Su-30K'), 'Ex-indische Su-30K, 2017 geliefert'),
    ws('Kampfflugzeuge', 'Su-25 Frogfoot', 8, 'Russland', 'Aktiv', IISS, IISS_L, 'Erdkampfflugzeuge'),
    ws('Hubschrauber', 'Mi-24/Mi-35', 15, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Hubschrauber', 'Mi-17', 26, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('MLRS', 'BM-21 Grad', 50, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Kriegsschiffe', 'Fregatte (Projekt 11661E)', 1, 'Russland', 'Inaktiv', IISS, IISS_L, 'Nie vollständig einsatzbereit'),
    ws('Flugabwehr', 'S-300PMU-1', 2, 'Russland', 'Aktiv', WP('S-300_missile_system'), WP_L('S-300'), 'Modernste Flugabwehr in Subsahara-Afrika'),
  ],
  actors: [
    act('FLEC (Frente para a Libertação do Enclave de Cabinda)', 'Separatistenbewegung', 'Separatistenbewegung für die Unabhängigkeit der Öl-reichen Exklave Cabinda (vom angolanischen Festland durch DRC-Territorium getrennt). Gelegentliche Angriffe auf Ölinfrastruktur und Sicherheitskräfte. Stark geschwächt durch militärische Operationen und interne Spaltungen. Mehrere konkurrierende Fraktionen.', 'Gering aktiv', 'Exklave Cabinda', '1.000–1.500', WP('Front_for_the_Liberation_of_the_Enclave_of_Cabinda'), WP_L('FLEC')),
  ],
  conflicts: [
    con('Cabinda-Insurgenz', ['FAA', 'FLEC (Fraktionen)'], 'Niedrige Intensität', 1975, undefined, 'Separatistenbewegung in der Öl-Exklave Cabinda. Cabinda produziert über 50% des angolanischen Öls. FLEC führt sporadische Angriffe, aber massiv geschwächt. 2010 Angriff auf Togo-Nationalmannschaftsbus beim Afrika-Cup machte international Schlagzeilen.', 'Hunderte Tote (über Jahrzehnte)', WP('Cabinda_conflict'), WP_L('Cabinda-Konflikt')),
    con('Angolanischer Bürgerkrieg (Nachwirkungen)', ['MPLA (Regierung)', 'UNITA (Opposition)'], 'Beendet', 1975, 2002, 'Einer der längsten und blutigsten Bürgerkriege Afrikas (1975-2002). MPLA (marxistisch, unterstützt von UdSSR/Kuba) gegen UNITA (Jonas Savimbi, unterstützt von USA/Südafrika). Savimbis Tod 2002 beendete den Krieg. UNITA ist heute Oppositionspartei. Landminen bleiben ein massives Problem.', '500.000–1 Mio. Tote', WP('Angolan_Civil_War'), WP_L('Angolanischer Bürgerkrieg')),
  ],
  relations: [
    rel('CN', 'China', '🇨🇳', 'Strategischer Partner', 'China ist größter Handelspartner und Kreditgeber. Massive Infrastrukturkredite gegen Öllieferungen (Angola-Modell / Oil-for-Infrastructure). Chinesisch gebaute Eisenbahnen, Flughäfen, Wohnungen. Angola ist zweitgrößter Öllieferant Chinas in Afrika.', WP('Angola%E2%80%93China_relations'), WP_L('Angolanisch-chinesische Beziehungen')),
    rel('RU', 'Russland', '🇷🇺', 'Historischer Militärpartner', 'Sowjetunion/Russland war Hauptwaffenlieferant während des Bürgerkriegs und danach. Su-30K, S-300, Mi-35 – Angola hat das stärkste russische Waffenarsenal in Subsahara-Afrika. Militärische Ausbildungskooperation.', WP('Angola%E2%80%93Russia_relations'), WP_L('Angolanisch-russische Beziehungen')),
    rel('US', 'USA', '🇺🇸', 'Ölpartner', 'USA sind bedeutender Ölimporteur aus Angola. Chevron ist größter ausländischer Ölproduzent in Angola (Cabinda). Während des Kalten Krieges unterstützten die USA die UNITA-Rebellen gegen die MPLA-Regierung. Heute pragmatische Wirtschaftsbeziehung.', WP('Angola%E2%80%93United_States_relations'), WP_L('Angolanisch-amerikanische Beziehungen')),
    rel('CD', 'DR Kongo', '🇨🇩', 'Vermittler', 'Angola versucht als regionaler Vermittler in der M23-Krise in der DRC zu agieren (Luanda-Prozess). Präsident Lourenço leitet Vermittlungsbemühungen zwischen DRC und Ruanda. Historische Interventionen in den Kongo-Kriegen. Flüchtlingsströme aus der DRC.', WP('Angola%E2%80%93Democratic_Republic_of_the_Congo_relations'), WP_L('Angolanisch-kongolesische Beziehungen')),
    rel('PT', 'Portugal', '🇵🇹', 'Historische Bindung', 'Ehemalige Kolonialmacht (bis 1975). Gemeinsame Sprache Portugiesisch. Große angolanische Diaspora in Portugal. Wirtschaftliche Verflechtungen, aber Angola strebt stärkere Diversifizierung der Partnerschaften an.', WP('Angola%E2%80%93Portugal_relations'), WP_L('Angolanisch-portugiesische Beziehungen')),
  ],
  missions: [],
};

// ═══════════════════════════════════════════════════════════════
// TUNISIA (TN)
// ═══════════════════════════════════════════════════════════════

const TN: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Tunesische Streitkräfte (Forces Armées Tunisiennes / القوات المسلحة التونسية)',
    founded: 1956,
    activePersonnel: 36000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 12000,
    militaryBudget: 1250000000,
    budgetPercentGDP: 2.5,
    conscription: true,
    commanderInChief: 'Präsident Kais Saied',
    source: GFP('tunisia'),
    sourceLabel: GFP_L('Tunesien'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'M60A3', 84, 'USA', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'M113', 140, 'USA', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Kirpi MRAP', 120, 'Türkei', 'Aktiv', WP('BMC_Kirpi'), WP_L('BMC Kirpi'), 'Für Anti-Terror-Operationen'),
    ws('Kampfflugzeuge', 'F-16C/D Block 52', 8, 'USA', 'Aktiv', WP('General_Dynamics_F-16_Fighting_Falcon'), WP_L('F-16'), 'Lieferung ab 2023 – erste Kampfflugzeuge neuer Generation'),
    ws('Leichte Kampfflugzeuge', 'F-5E/F Tiger II', 12, 'USA', 'Aktiv', IISS, IISS_L, 'Älter, durch F-16 teilweise ersetzt'),
    ws('Hubschrauber', 'UH-60M Black Hawk', 12, 'USA', 'Aktiv', WP('Sikorsky_UH-60_Black_Hawk'), WP_L('UH-60 Black Hawk'), '$245 Mio. US-Deal'),
    ws('Hubschrauber', 'OH-58D Kiowa Warrior', 24, 'USA', 'Aktiv', WP('Bell_OH-58_Kiowa'), WP_L('OH-58D Kiowa'), 'Aufklärung und leichte Bewaffnung'),
    ws('UAV/Drohnen', 'ScanEagle', 6, 'USA', 'Aktiv', WP('Boeing_Insitu_ScanEagle'), WP_L('ScanEagle'), 'Aufklärungsdrohnen für Grenzüberwachung'),
    ws('Patrouillenboote', 'Diverse (inkl. Island-Klasse)', 12, 'USA/Deutschland', 'Aktiv', WP('Tunisian_Navy'), WP_L('Tunesische Marine'), 'Mittelmeerüberwachung und Anti-Migration'),
  ],
  actors: [
    act('AQIM-Reste (Al-Qaida im Islamischen Maghreb)', 'Terrororganisation', 'Reste von Al-Qaida im Islamischen Maghreb, die im tunesisch-algerischen Grenzgebiet (Chaambi-Berge) operieren. Durch intensive Sicherheitsoperationen seit 2013 massiv geschwächt. Sporadische IED-Angriffe auf Sicherheitskräfte.', 'Stark geschwächt', 'Kasserine, Chaambi-Berge (algerische Grenze)', 'Unter 100', WP('Al-Qaeda_in_the_Islamic_Maghreb'), WP_L('AQIM')),
    act('IS-Rückkehrer aus Libyen', 'Terrorbedrohung', 'Tunesien stellte proportional die meisten IS-Kämpfer in Syrien und Libyen. Rückkehrer stellen Sicherheitsrisiko dar. Anschläge auf Bardo-Museum (2015) und Strand von Sousse (2015) durch IS-Anhänger. Sicherheitskräfte haben Netzwerke weitgehend zerschlagen.', 'Unterdrückt', 'Landesweit', 'Einige Hundert (unter Beobachtung)', WP('2015_Bardo_National_Museum_attack'), WP_L('Bardo-Anschlag 2015')),
  ],
  conflicts: [
    con('Chaambi-Berg-Operationen', ['Tunesische Streitkräfte', 'AQIM-Reste / IS-Zellen'], 'Niedrige Intensität', 2012, undefined, 'Militäroperationen in den Chaambi-Bergen an der algerischen Grenze gegen dschihadistische Zellen. Landminen und IED-Angriffe auf Sicherheitskräfte. Zone als Sperrgebiet deklariert. Seit 2018 stark reduzierte Aktivität der Dschihadisten.', 'Hunderte Tote (Sicherheitskräfte und Militante)', WP('Chaambi_Mountains_insurgency'), WP_L('Chaambi-Insurgenz')),
    con('Post-Revolution-Instabilität', ['Diverse politische Akteure'], 'Politische Krise', 2011, undefined, 'Seit der Jasmin-Revolution 2011 (Sturz Ben Alis) anhaltende politische Instabilität. Demokratische Transition unter Druck: Präsident Kais Saied löste 2021 das Parlament auf, regiert per Dekret. Neue Verfassung 2022 stärkt Präsidialmacht. Internationale Kritik an autoritärer Wende.', 'Begrenzt (politische Gewalt)', WP('2021_Tunisian_political_crisis'), WP_L('Tunesische Politische Krise 2021')),
  ],
  relations: [
    rel('US', 'USA', '🇺🇸', 'Major Non-NATO Ally', 'Tunesien ist „Major Non-NATO Ally" (seit 2015). F-16-Lieferung, Black Hawks, Ausbildungsprogramme. Jährliche US-Militärhilfe ~$200 Mio. Gemeinsame Anti-Terror-Operationen. Sorge in Washington über Saieds autoritäre Wende.', WP('Tunisia%E2%80%93United_States_relations'), WP_L('Tunesisch-amerikanische Beziehungen')),
    rel('FR', 'Frankreich', '🇫🇷', 'Historischer Partner', 'Ehemalige Kolonialmacht (bis 1956). Enge wirtschaftliche und kulturelle Verbindungen. Frankophonie-Mitglied. Militärische Kooperation und Ausbildung. Frankreich ist wichtigster europäischer Handelspartner.', WP('France%E2%80%93Tunisia_relations'), WP_L('Französisch-tunesische Beziehungen')),
    rel('DZ', 'Algerien', '🇩🇿', 'Nachbar/Partner', 'Gemeinsame Grenze und Bedrohung durch Dschihadisten (Chaambi-Berge). Algerisch-tunesische Sicherheitskooperation. Gemeinsame Grenzpatrouillen. Algerien ist wichtiger Energielieferant (Erdgas).', WP('Algeria%E2%80%93Tunisia_relations'), WP_L('Algerisch-tunesische Beziehungen')),
    rel('LY', 'Libyen', '🇱🇾', 'Instabiler Nachbar', 'Libyens Instabilität ist größte externe Sicherheitsbedrohung: Waffenschmuggel, IS-Kämpfer, Migrationsrouten. Tunesien hat Grenzbefestigungen errichtet. Über 50.000 libysche Flüchtlinge in Tunesien. Wirtschaftliche Verflechtungen.', WP('Libya%E2%80%93Tunisia_relations'), WP_L('Libysch-tunesische Beziehungen')),
    rel('EU', 'Europäische Union', '🇪🇺', 'Migrationspartner', 'EU-Tunesien-Abkommen 2023 zur Migrationsbekämpfung (Milliardenhilfe gegen Kontrolle der Mittelmeerroute). Tunesien als Transitland für Migration nach Europa. Assoziierungsabkommen seit 1998. Menschenrechtsbedenken wegen Umgang mit Migranten.', WP('European_Union%E2%80%93Tunisia_relations'), WP_L('EU-tunesische Beziehungen')),
  ],
  missions: [],
};

// ═══════════════════════════════════════════════════════════════
// Data Map & Export
// ═══════════════════════════════════════════════════════════════

export const militaryDataEastSouth: Record<string, CountryMilitaryData> = { SO, SS, UG, RW, ER, DJ, BI, MZ, AO, TN };
