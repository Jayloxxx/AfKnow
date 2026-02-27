import type { CountryMilitaryData, WeaponSystem, SecurityActor, ArmedConflict, CountryRelation, InternationalMission } from '../types';

// ── Helper constructors ──────────────────────────

let _id = 1000;
const uid = () => `mil_sahel_${++_id}`;

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

// ═══════════════════════════════════════════════════════════════
// MALI (ML)
// ═══════════════════════════════════════════════════════════════

const ML: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Forces Armées Maliennes (FAMa)',
    founded: 1961,
    activePersonnel: 20000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 4800,
    militaryBudget: 590000000,
    budgetPercentGDP: 3.2,
    conscription: true,
    commanderInChief: 'Übergangspräsident Col. Assimi Goïta',
    source: GFP('mali'),
    sourceLabel: GFP_L('Mali'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-55', 12, 'Russland/Sowjetunion', 'Eingeschränkt', IISS, IISS_L, 'Größtenteils nicht einsatzbereit'),
    ws('Gepanzerte Fahrzeuge', 'BTR-60', 20, 'Russland/Sowjetunion', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'BRDM-2', 50, 'Russland/Sowjetunion', 'Aktiv', IISS, IISS_L, 'Aufklärungsfahrzeuge'),
    ws('Gepanzerte Fahrzeuge', 'Bastion Patsas', 20, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Caiman (MRAP)', 24, 'Südafrika/VAE', 'Aktiv', IISS, IISS_L, 'Minenschutzfahrzeuge'),
    ws('Kampfflugzeuge', 'Su-25 Frogfoot', 6, 'Russland', 'Aktiv', WP('Sukhoi_Su-25'), WP_L('Su-25'), '2023–2024 von Russland geliefert'),
    ws('Kampfhubschrauber', 'Mi-24/35 Hind', 6, 'Russland', 'Aktiv', IISS, IISS_L, 'Mehrere Lieferungen 2022–2024'),
    ws('Transporthubschrauber', 'Mi-171', 4, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Artillerie', 'BM-21 Grad (122mm MRL)', 6, 'Russland/Sowjetunion', 'Aktiv', IISS, IISS_L),
    ws('Drohnen', 'Bayraktar TB2', 4, 'Türkei', 'Aktiv', WP('Bayraktar_TB2'), WP_L('Bayraktar TB2'), 'Seit 2022 im Einsatz'),
  ],
  actors: [
    act('JNIM (Jama\'at Nusrat al-Islam wal-Muslimin)', 'Terrororganisation (Al-Qaida)', 'Al-Qaida-Dachverband im Sahel unter Führung von Iyad Ag Ghali. Vereinigt Ansar Dine, AQIM-Sahara, Katiba Macina und Katiba Mourabitoune. Größte dschihadistische Bedrohung in der Region.', 'Aktiv – expandierend', 'Zentral- und Nordmali, grenzüberschreitend nach Burkina Faso und Niger', '5.000–10.000', WP('Jama%27at_Nasr_al-Islam_wal_Muslimin'), WP_L('JNIM')),
    act('ISGS (Islamischer Staat Sahel)', 'Terrororganisation (IS)', 'Ableger des Islamischen Staates in der Sahel-Region. Operiert im Drei-Länder-Eck Mali-Burkina Faso-Niger (Liptako-Gourma). Rivalität mit JNIM.', 'Aktiv', 'Liptako-Gourma (Grenzregion Mali-Niger-Burkina Faso)', '1.500–3.000', WP('Islamic_State_in_the_Greater_Sahara'), WP_L('ISGS')),
    act('CMA (Coordination des Mouvements de l\'Azawad)', 'Bewaffnete Rebellengruppe (Tuareg)', 'Tuareg-geführte Rebellenkoordination. Unterzeichner des Friedensabkommens von Algier 2015. Seit 2023 wieder im bewaffneten Konflikt mit der FAMa nach Aufkündigung des Abkommens durch die Junta.', 'Aktiv – erneuter Konflikt', 'Nordmali (Kidal, Timbuktu, Gao)', '3.000–5.000', WP('Coordination_of_Movements_of_Azawad'), WP_L('CMA')),
    act('Afrika Corps (ex-Wagner)', 'Private Militärfirma (Russland)', 'Russische Paramilitärs, ehemals Wagner-Gruppe, seit 2024 als Afrika Corps unter GRU-Kontrolle. Unterstützen FAMa bei Operationen, insbesondere in Nordmali. Berichte über Menschenrechtsverletzungen.', 'Aktiv', 'Bamako, Mopti, Timbuktu, Kidal', '1.000–2.000', WP('Africa_Corps_(Russia)'), WP_L('Afrika Corps (Russland)')),
    act('Katiba Macina', 'Terrororganisation (Al-Qaida/JNIM)', 'Fulbe-dominierte dschihadistische Gruppe unter Amadou Koufa. Untergruppe von JNIM. Aktiv in Zentralmali (Mopti-Region), nutzt ethnische Spannungen zwischen Fulbe und Dogon/Bambara.', 'Aktiv', 'Zentralmali (Mopti, Ségou)', '2.000–3.000', WP('Katibat_Macina'), WP_L('Katiba Macina')),
  ],
  conflicts: [
    con('Mali-Krieg', ['FAMa', 'JNIM', 'ISGS', 'CMA', 'Afrika Corps'], 'Aktiv', 2012, undefined, 'Begann 2012 mit Tuareg-Rebellion und dschihadistischer Übernahme Nordmalis. Französische Intervention (Opération Serval 2013). Seit 2020 Militärputsche. Seit 2023 erneute Kämpfe gegen Tuareg nach Aufkündigung des Algier-Abkommens. Wagner/Afrika Corps seit 2021 involviert.', '12.000+ Tote (2012–2024)', WP('Mali_War'), WP_L('Mali-Krieg')),
    con('Tuareg-Rebellion 2023–', ['FAMa / Afrika Corps', 'CMA / CSP-PSD'], 'Aktiv', 2023, undefined, 'Erneuter bewaffneter Konflikt nach Aufkündigung des Algier-Abkommens durch die Junta. FAMa und Afrika Corps eroberten Kidal im November 2023. Tuareg-Rebellen führen Guerillakrieg im Norden fort.', 'Hunderte Tote', WP('2023_Northern_Mali_conflict'), WP_L('Nordmali-Konflikt 2023')),
    con('Dschihadistische Insurgenz in Zentralmali', ['FAMa', 'JNIM (Katiba Macina)', 'Dogon-Milizen'], 'Aktiv', 2015, undefined, 'Ausbreitung dschihadistischer Gewalt in die Mopti- und Ségou-Region. Ethnische Dimension: Fulbe-Hirten vs. Dogon-Bauern. Massaker an Zivilisten durch alle Konfliktparteien.', '5.000+ Tote', WP('Insurgency_in_the_Maghreb'), WP_L('Insurgenz im Maghreb')),
  ],
  relations: [
    rel('RU', 'Russland', '🇷🇺', 'Strategischer Partner', 'Engste militärische Partnerschaft seit 2021. Afrika Corps/Wagner stationiert. Lieferung von Kampfflugzeugen (Su-25), Hubschraubern, gepanzerten Fahrzeugen. Mali Gründungsmitglied der Allianz der Sahelstaaten.', WP('Mali%E2%80%93Russia_relations'), WP_L('Malisch-russische Beziehungen')),
    rel('FR', 'Frankreich', '🇫🇷', 'Ehemaliger Partner – abgebrochen', 'Frankreich intervenierte 2013 militärisch (Opération Serval/Barkhane). Nach Militärputschen 2020/2021 Beziehungsbruch. Französische Truppen 2022 abgezogen. Französischer Botschafter 2022 ausgewiesen.', WP('France%E2%80%93Mali_relations'), WP_L('Französisch-malische Beziehungen')),
    rel('BF', 'Burkina Faso', '🇧🇫', 'Allianz der Sahelstaaten', 'Enge Kooperation seit 2023 innerhalb der Allianz der Sahelstaaten (AES). Gemeinsame Abkehr von Frankreich und ECOWAS. Militärische Zusammenarbeit gegen dschihadistische Gruppen.', WP('Alliance_of_Sahel_States'), WP_L('Allianz der Sahelstaaten')),
    rel('NE', 'Niger', '🇳🇪', 'Allianz der Sahelstaaten', 'Partner in der Allianz der Sahelstaaten seit dem Putsch in Niger im Juli 2023. Gemeinsame Verteidigungsabkommen. Gegenseitige Unterstützung gegen ECOWAS-Sanktionen.', WP('Alliance_of_Sahel_States'), WP_L('Allianz der Sahelstaaten')),
    rel('DZ', 'Algerien', '🇩🇿', 'Vermittler', 'Algerien vermittelte das Friedensabkommen von Algier 2015. Wichtiger Nachbar im Norden. Besorgt über Instabilität und dschihadistischen Spillover. Kritisch gegenüber Wagner-Präsenz.', WP('Algeria%E2%80%93Mali_relations'), WP_L('Algerisch-malische Beziehungen')),
    rel('CN', 'China', '🇨🇳', 'Wirtschaftspartner', 'Wachsende wirtschaftliche Beziehungen. China liefert militärische Ausrüstung und Fahrzeuge. Diplomatische Unterstützung im UN-Sicherheitsrat.', WP('China%E2%80%93Mali_relations'), WP_L('Chinesisch-malische Beziehungen')),
  ],
  missions: [
    mis('MINUSMA', 'UN Multidimensional Integrated Stabilization Mission in Mali', 'UN', 'Friedenssicherung', 'Beendet (2023)', 2013, 2023, 0, 'Größte und gefährlichste UN-Mission. Bis zu 13.000 Soldaten. 310 UN-Tote. Abzug bis Dezember 2023 auf Forderung der malischen Junta.', ['ML'], 'https://minusma.unmissions.org/', 'MINUSMA'),
    mis('EUTM Mali', 'EU Training Mission Mali', 'EU', 'Militärische Ausbildung', 'Beendet (2024)', 2013, 2024, 0, 'EU-Ausbildungsmission für die FAMa. Bis zu 700 Soldaten aus EU-Staaten. Von der malischen Junta 2024 zum Abzug gezwungen.', ['ML'], EU_MISSIONS, EU_MISSIONS_L),
    mis('EUCAP Sahel Mali', 'EU Capacity Building Mission Mali', 'EU', 'Kapazitätsaufbau', 'Beendet (2024)', 2015, 2024, 0, 'EU-Mission zum Aufbau von Polizei- und Sicherheitskapazitäten in Mali. Beendet nach Abzug westlicher Partner.', ['ML'], EU_MISSIONS, EU_MISSIONS_L),
    mis('Opération Serval', 'Opération Serval (Frankreich)', 'Frankreich', 'Militärintervention', 'Beendet', 2013, 2014, 0, 'Französische Militärintervention zur Rückeroberung Nordmalis von dschihadistischen Gruppen. 4.500 französische Soldaten. Übergang in Opération Barkhane.', ['ML'], WP('Op%C3%A9ration_Serval'), WP_L('Opération Serval')),
    mis('Opération Barkhane', 'Opération Barkhane (Frankreich)', 'Frankreich', 'Anti-Terror', 'Beendet (2022)', 2014, 2022, 0, 'Französische Anti-Terror-Operation im Sahel mit Hauptquartier in N\'Djamena. Bis zu 5.100 Soldaten. Abzug aus Mali 2022.', ['ML', 'NE', 'TD', 'BF', 'MR'], WP('Op%C3%A9ration_Barkhane'), WP_L('Opération Barkhane')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// BURKINA FASO (BF)
// ═══════════════════════════════════════════════════════════════

const BF: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Forces Armées Burkinabè (FABF)',
    founded: 1960,
    activePersonnel: 12000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 45000,
    militaryBudget: 440000000,
    budgetPercentGDP: 2.6,
    conscription: true,
    commanderInChief: 'Übergangspräsident Cpt. Ibrahim Traoré',
    source: GFP('burkina-faso'),
    sourceLabel: GFP_L('Burkina Faso'),
  },
  weaponSystems: [
    ws('Gepanzerte Fahrzeuge', 'EE-9 Cascavel', 24, 'Brasilien', 'Aktiv', IISS, IISS_L, 'Spähpanzer'),
    ws('Gepanzerte Fahrzeuge', 'Eland-90', 10, 'Südafrika', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'M3 Panhard', 13, 'Frankreich', 'Eingeschränkt', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'BRDM-2', 4, 'Russland', 'Aktiv', IISS, IISS_L, 'Neu geliefert 2023'),
    ws('Transportflugzeuge', 'C-130H Hercules', 1, 'USA', 'Aktiv', IISS, IISS_L),
    ws('Kampfhubschrauber', 'Mi-24 Hind', 3, 'Russland', 'Aktiv', IISS, IISS_L, 'Geliefert 2023–2024 über Russland'),
    ws('Transporthubschrauber', 'Mi-171', 3, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Drohnen', 'Bayraktar Akıncı / TB2', 6, 'Türkei', 'Aktiv', WP('Bayraktar_TB2'), WP_L('Bayraktar TB2'), 'Seit 2022 für Anti-Terror-Einsätze'),
    ws('Artillerie', 'M1950 155mm Haubitze', 4, 'Frankreich', 'Eingeschränkt', IISS, IISS_L),
  ],
  actors: [
    act('JNIM (Jama\'at Nusrat al-Islam wal-Muslimin)', 'Terrororganisation (Al-Qaida)', 'Al-Qaida-Ableger im Sahel. Dominante dschihadistische Kraft in Burkina Faso. Kontrolliert weite Teile des Nordens und Nordostens. Angriffe auf Zivilisten, Sicherheitskräfte und VDP-Milizen.', 'Aktiv – expandierend', 'Nord-, Ost- und Zentralregionen (Sahel, Est, Centre-Nord, Boucle du Mouhoun)', '5.000–8.000 (gesamt Sahel)', WP('Jama%27at_Nasr_al-Islam_wal_Muslimin'), WP_L('JNIM')),
    act('ISGS (Islamischer Staat Sahel)', 'Terrororganisation (IS)', 'IS-Ableger, aktiv im Osten Burkina Fasos (Grenzregion zu Niger). Angriffe auf Dörfer und Sicherheitskräfte. Rivalität mit JNIM.', 'Aktiv', 'Ostregion (Grenze zu Niger), Sahel-Region', '1.000–2.000', WP('Islamic_State_in_the_Greater_Sahara'), WP_L('ISGS')),
    act('VDP (Volontaires pour la Défense de la Patrie)', 'Staatliche Miliz', 'Freiwillige Bürgerwehr, 2020 per Gesetz geschaffen. Zwei Wochen militärische Grundausbildung. Unterstützen FABF bei Gebietsverteidigung. Berichte über Übergriffe auf Fulbe-Gemeinschaften.', 'Aktiv', 'Landesweit, besonders im Norden und Osten', '40.000–50.000 (geplant 90.000)', WP('Volunteers_for_the_Defense_of_the_Homeland'), WP_L('VDP')),
    act('Ansaroul Islam', 'Terrororganisation (JNIM-affiliiert)', 'Dschihadistische Gruppe unter Ibrahim Malam Dicko (getötet 2017). Später unter Jafar Dicko. Affiliate von JNIM. Aktiv in der Sahel-Region Burkina Fasos.', 'Aktiv (als Teil von JNIM)', 'Sahel-Region (Soum, Oudalan)', '500–1.000', WP('Ansarul_Islam'), WP_L('Ansaroul Islam')),
    act('Afrika Corps (ex-Wagner)', 'Private Militärfirma (Russland)', 'Seit 2024 in Burkina Faso aktiv. Unterstützung des Traoré-Regimes bei Anti-Terror-Operationen. Berichte über wachsende Präsenz in Ouagadougou und im Norden.', 'Aktiv', 'Ouagadougou, nördliche Regionen', '100–300', WP('Africa_Corps_(Russia)'), WP_L('Afrika Corps (Russland)')),
  ],
  conflicts: [
    con('Dschihadistische Insurgenz in Burkina Faso', ['FABF / VDP', 'JNIM', 'ISGS'], 'Aktiv – eskalierend', 2015, undefined, 'Seit 2015 zunehmende dschihadistische Angriffe. Seit 2019 dramatische Eskalation. Ca. 40% des Territoriums nicht unter Regierungskontrolle. Über 2 Millionen Binnenvertriebene. Zwei Militärputsche (2022). Massaker wie Solhan (Juni 2021, 160+ Tote).', '10.000+ Tote (2015–2024), 2 Mio. Vertriebene', WP('Jihadist_insurgency_in_Burkina_Faso'), WP_L('Dschihadistische Insurgenz in Burkina Faso')),
  ],
  relations: [
    rel('RU', 'Russland', '🇷🇺', 'Strategischer Partner', 'Seit Putsch 2022 enge Annäherung. Afrika Corps/Wagner-Präsenz seit 2024. Waffenlieferungen (Mi-24, gepanzerte Fahrzeuge). Traoré bezeichnete Putin als Vorbild.', WP('Burkina_Faso%E2%80%93Russia_relations'), WP_L('Burkinisch-russische Beziehungen')),
    rel('ML', 'Mali', '🇲🇱', 'Allianz der Sahelstaaten', 'Engste Verbündete in der AES. Gemeinsame Abkehr von Frankreich und ECOWAS. Austritt aus ECOWAS 2024. Gemeinsame Grenzoperationen gegen JNIM und ISGS.', WP('Alliance_of_Sahel_States'), WP_L('Allianz der Sahelstaaten')),
    rel('NE', 'Niger', '🇳🇪', 'Allianz der Sahelstaaten', 'Dritter Partner der AES. Gegenseitige Unterstützung bei Militärputschen. Burkina Faso drohte bei ECOWAS-Intervention in Niger mit Krieg.', WP('Alliance_of_Sahel_States'), WP_L('Allianz der Sahelstaaten')),
    rel('FR', 'Frankreich', '🇫🇷', 'Ehemaliger Partner – abgebrochen', 'Französische Truppen (Sabre-Spezialkräfte) 2023 abgezogen. Französischer Botschafter ausgewiesen. Traoré wirft Frankreich Neokolonialismus vor.', WP('Burkina_Faso%E2%80%93France_relations'), WP_L('Burkinisch-französische Beziehungen')),
    rel('TR', 'Türkei', '🇹🇷', 'Waffenlieferant', 'Bayraktar-Drohnenlieferungen seit 2022. Wachsende militärische Partnerschaft. Türkei als alternative Rüstungsquelle.', WP('Burkina_Faso%E2%80%93Turkey_relations'), WP_L('Burkinisch-türkische Beziehungen')),
    rel('CI', 'Côte d\'Ivoire', '🇨🇮', 'Angespannt', 'Diplomatische Spannungen wegen Spillover-Gefahr. Côte d\'Ivoire befürchtet Ausbreitung der Instabilität. Grenzüberschreitende dschihadistische Angriffe seit 2020.', WP('Burkina_Faso%E2%80%93Ivory_Coast_relations'), WP_L('Burkinisch-ivorische Beziehungen')),
  ],
  missions: [
    mis('Afrika Corps in Burkina Faso', 'Russian Africa Corps – Burkina Faso', 'Russland', 'PMC / Militärberatung', 'Aktiv', 2024, undefined, 200, 'Russische Paramilitärs zur Unterstützung des Traoré-Regimes. Ausbildung, Beratung, Kampfeinsätze.', ['BF'], WP('Africa_Corps_(Russia)'), WP_L('Afrika Corps (Russland)')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// NIGER (NE)
// ═══════════════════════════════════════════════════════════════

const NE: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Forces Armées Nigériennes (FAN)',
    founded: 1961,
    activePersonnel: 25000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 5400,
    militaryBudget: 330000000,
    budgetPercentGDP: 2.1,
    conscription: true,
    commanderInChief: 'General Abdourahamane Tchiani (Vorsitzender CNSP)',
    source: GFP('niger'),
    sourceLabel: GFP_L('Niger'),
  },
  weaponSystems: [
    ws('Gepanzerte Fahrzeuge', 'AML-90 / AML-60', 35, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'VBL', 14, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Caiman (MRAP)', 24, 'Südafrika/VAE', 'Aktiv', IISS, IISS_L, 'Minenschutzfahrzeuge'),
    ws('Gepanzerte Fahrzeuge', 'BTR-80', 10, 'Russland', 'Aktiv', IISS, IISS_L, 'Neu beschafft seit 2024'),
    ws('Transportflugzeuge', 'C-130H Hercules', 2, 'USA', 'Aktiv', IISS, IISS_L),
    ws('Leichte Angriffsflugzeuge', 'Cessna 208 (bewaffnet)', 2, 'USA', 'Aktiv', IISS, IISS_L, 'Hellfire-Raketen-fähig, ISR-Einsätze'),
    ws('Transporthubschrauber', 'Mi-171', 3, 'Russland', 'Aktiv', IISS, IISS_L, '2024 geliefert'),
    ws('Drohnen', 'Bayraktar TB2', 6, 'Türkei', 'Aktiv', WP('Bayraktar_TB2'), WP_L('Bayraktar TB2'), 'Intensiver Einsatz gegen Dschihadisten'),
    ws('Artillerie', '105mm Haubitze (diverse)', 12, 'Frankreich', 'Aktiv', IISS, IISS_L),
  ],
  actors: [
    act('JNIM (Jama\'at Nusrat al-Islam wal-Muslimin)', 'Terrororganisation (Al-Qaida)', 'Al-Qaida-Dachverband, aktiv in den westlichen Grenzregionen Nigers (Tillabéri, Tahoua). Angriffe auf Sicherheitskräfte und Dörfer. Grenzüberschreitende Operationen aus Mali.', 'Aktiv', 'Tillabéri, Tahoua (Grenze zu Mali und Burkina Faso)', '1.000–2.000 (in Niger)', WP('Jama%27at_Nasr_al-Islam_wal_Muslimin'), WP_L('JNIM')),
    act('ISGS (Islamischer Staat Sahel)', 'Terrororganisation (IS)', 'IS-Ableger im Drei-Länder-Eck. Seit 2023 verstärkte Aktivitäten nach Abzug französischer und amerikanischer Truppen. Massaker an Zivilisten.', 'Aktiv', 'Tillabéri, Tahoua (Liptako-Gourma)', '1.500–3.000', WP('Islamic_State_in_the_Greater_Sahara'), WP_L('ISGS')),
    act('IS Westafrika / Boko Haram', 'Terrororganisation (IS)', 'ISWAP (Islamic State West Africa Province) und Boko Haram-Splitter operieren in der Region Diffa am Tschadsee. Angriffe auf Dörfer und Militärstützpunkte.', 'Aktiv', 'Diffa-Region (Tschadsee)', '1.000–2.000 (regional)', WP('Islamic_State_%E2%80%93_West_Africa_Province'), WP_L('ISWAP')),
    act('CNSP (Conseil National pour la Sauvegarde de la Patrie)', 'Militärjunta', 'Militärjunta unter General Tchiani. Putsch am 26. Juli 2023 gegen Präsident Bazoum. Übernahme der Macht, Abkehr von westlichen Partnern, Annäherung an Russland.', 'An der Macht', 'Landesweit (Niamey)', 'Gesamte FAN', WP('2023_Nigerien_coup_d%27%C3%A9tat'), WP_L('Militärputsch in Niger 2023')),
  ],
  conflicts: [
    con('Insurgenz im westlichen Niger', ['FAN', 'JNIM', 'ISGS'], 'Aktiv', 2017, undefined, 'Dschihadistische Gewalt in der Tillabéri- und Tahoua-Region. Hunderte Tote pro Jahr. Spillover aus dem Mali-Konflikt. Besonders betroffen: Drei-Länder-Eck (Liptako-Gourma).', '3.000+ Tote', WP('Jihadist_insurgency_in_Niger'), WP_L('Dschihadistische Insurgenz in Niger')),
    con('Tschadsee-Insurgenz (Diffa)', ['FAN', 'MNJTF', 'Boko Haram / ISWAP'], 'Aktiv', 2015, undefined, 'Boko Haram und ISWAP operieren in der Diffa-Region am Tschadsee. Niger beteiligt an der Multinational Joint Task Force (MNJTF). Zehntausende Vertriebene.', '1.000+ Tote in Niger', WP('Boko_Haram_insurgency'), WP_L('Boko-Haram-Aufstand')),
    con('Militärputsch 2023', ['CNSP (Militärjunta)', 'Demokratisch gewählte Regierung Bazoum', 'ECOWAS'], 'Abgeschlossen', 2023, 2023, 'Militärputsch am 26. Juli 2023. General Tchiani stürzt Präsident Bazoum. ECOWAS drohte mit Intervention, setzte Drohung nicht um. Abzug französischer und US-Truppen.', 'Keine größeren Kampfhandlungen', WP('2023_Nigerien_coup_d%27%C3%A9tat'), WP_L('Putsch in Niger 2023')),
  ],
  relations: [
    rel('RU', 'Russland', '🇷🇺', 'Neuer strategischer Partner', 'Seit Putsch 2023 rasante Annäherung. Russische Militärausbilder seit 2024. Waffenlieferungen. Niger erlaubte russische Truppenstationierung. Abkehr vom Westen.', WP('Niger%E2%80%93Russia_relations'), WP_L('Nigerisch-russische Beziehungen')),
    rel('US', 'USA', '🇺🇸', 'Ehemaliger Partner – abgebrochen', 'USA unterhielten Drohnenbasis Air Base 201 in Agadez ($110 Mio.). Abzug aller US-Truppen bis September 2024. Einstellung der Sicherheitskooperation nach dem Putsch.', AFRICOM, AFRICOM_L),
    rel('FR', 'Frankreich', '🇫🇷', 'Ehemaliger Partner – abgebrochen', 'Frankreich hatte 1.500 Soldaten in Niger (Barkhane-Nachfolge). Vollständiger Abzug bis Dezember 2023. Botschafter ausgewiesen. Barkhane-Hub aufgelöst.', WP('France%E2%80%93Niger_relations'), WP_L('Französisch-nigerische Beziehungen')),
    rel('ML', 'Mali', '🇲🇱', 'Allianz der Sahelstaaten', 'Enger Verbündeter in der AES. Gemeinsamer Austritt aus ECOWAS. Mali und Burkina Faso drohten bei ECOWAS-Intervention mit Krieg.', WP('Alliance_of_Sahel_States'), WP_L('Allianz der Sahelstaaten')),
    rel('BF', 'Burkina Faso', '🇧🇫', 'Allianz der Sahelstaaten', 'Dritter AES-Partner. Solidarität der drei Juntas. Gemeinsame Verteidigungsabkommen.', WP('Alliance_of_Sahel_States'), WP_L('Allianz der Sahelstaaten')),
    rel('NG', 'Nigeria', '🇳🇬', 'Angespannt', 'ECOWAS unter nigerianischer Führung drohte mit Militärintervention nach dem Putsch. Spannungen, aber auch gemeinsame Bedrohung durch Boko Haram am Tschadsee. Wirtschaftliche Abhängigkeit Nigers von Nigeria (Stromversorgung).', WP('Niger%E2%80%93Nigeria_relations'), WP_L('Nigerisch-nigerianische Beziehungen')),
  ],
  missions: [
    mis('US Air Base 201 Agadez', 'US Drone Base Agadez', 'US', 'Drohnen-/Luftwaffenbasis', 'Abzug (2024)', 2014, 2024, 0, '$110 Mio. Drohnenbasis. MQ-9 Reaper-Drohnen zur Überwachung der Sahel-Region. Abzug nach Putsch 2023.', ['NE'], AFRICOM, AFRICOM_L),
    mis('EUCAP Sahel Niger', 'EU Capacity Building Mission Niger', 'EU', 'Kapazitätsaufbau', 'Suspendiert', 2012, undefined, 0, 'EU-Mission zum Aufbau von Sicherheitskapazitäten. Nach Putsch 2023 suspendiert.', ['NE'], EU_MISSIONS, EU_MISSIONS_L),
    mis('MNJTF (Niger-Anteil)', 'Multinational Joint Task Force – Niger', 'Sonstige', 'Anti-Terror', 'Aktiv', 2015, undefined, 3000, 'Nigerischer Beitrag zur multinationalen Truppe gegen Boko Haram am Tschadsee. Koordination mit Nigeria, Tschad und Kamerun.', ['NE', 'NG', 'TD', 'CM'], WP('Multinational_Joint_Task_Force'), WP_L('MNJTF')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// TSCHAD (TD)
// ═══════════════════════════════════════════════════════════════

const TD: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Armée Nationale Tchadienne (ANT)',
    founded: 1960,
    activePersonnel: 30000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 9500,
    militaryBudget: 310000000,
    budgetPercentGDP: 2.5,
    conscription: true,
    commanderInChief: 'Präsident Mahamat Idriss Déby',
    source: GFP('chad'),
    sourceLabel: GFP_L('Tschad'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-55', 60, 'Russland/Sowjetunion', 'Eingeschränkt', IISS, IISS_L, 'Zahlreiche nicht einsatzbereit'),
    ws('Gepanzerte Fahrzeuge', 'ERC-90 Sagaie', 50, 'Frankreich', 'Aktiv', IISS, IISS_L, 'Radpanzer mit 90mm-Kanone'),
    ws('Gepanzerte Fahrzeuge', 'AML-90', 30, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'BTR-3E1', 24, 'Ukraine', 'Aktiv', IISS, IISS_L, 'Vor 2022 geliefert'),
    ws('Gepanzerte Fahrzeuge', 'Bastion Patsas', 9, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'Su-25 Frogfoot', 6, 'Russland/Ukraine', 'Eingeschränkt', IISS, IISS_L, 'Einsatzbereitschaft fraglich'),
    ws('Transporthubschrauber', 'Mi-17', 6, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Kampfhubschrauber', 'Mi-24 Hind', 2, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Artillerie', '122mm D-30 Haubitze', 12, 'Russland/Sowjetunion', 'Aktiv', IISS, IISS_L),
    ws('Technische Fahrzeuge', 'Toyota Land Cruiser (technicals)', 500, 'Japan (modifiziert)', 'Aktiv', IISS, IISS_L, 'Rückgrat der tschadischen Streitkräfte – bewaffnete Pick-ups'),
  ],
  actors: [
    act('FACT (Front pour l\'Alternance et la Concorde au Tchad)', 'Bewaffnete Rebellengruppe', 'Tschadische Rebellenbewegung, operiert aus Südlibyen. Verantwortlich für den Angriff im April 2021, bei dem Präsident Idriss Déby getötet wurde. Mahdi Ali (Anführer).', 'Aktiv (geschwächt)', 'Nordtschad, Tibesti, Süd-Libyen', '1.500–3.000', WP('Front_for_Change_and_Concord_in_Chad'), WP_L('FACT')),
    act('Boko Haram / ISWAP', 'Terrororganisation', 'Boko Haram und ISWAP operieren in der Tschadsee-Region. Angriffe auf Dörfer, Fischergemeinden und Militärbasen. Tschad beteiligt sich an der MNJTF.', 'Aktiv', 'Tschadsee-Region (Lac-Provinz)', '2.000–4.000 (regional)', WP('Boko_Haram_insurgency'), WP_L('Boko-Haram-Aufstand')),
    act('UFR (Union des Forces de la Résistance)', 'Bewaffnete Rebellengruppe', 'Zusammenschluss tschadischer Rebellengruppen. Angriff auf N\'Djamena 2008. Seit 2010 formal aufgelöst, aber Fraktionen weiter aktiv.', 'Inaktiv / fragmentiert', 'Nordtschad, Sudan-Grenze', 'Unbekannt', WP('Union_of_Forces_for_Democracy_and_Development'), WP_L('UFR')),
    act('DGSSIE (Präsidialgarde)', 'Staatliche Sicherheitskraft', 'Eliteeinheit und Präsidialgarde der Déby-Familie. Besser ausgerüstet und bezahlt als reguläre Armee. Zaghawa-dominiert. De facto wichtigste militärische Kraft.', 'Aktiv', 'N\'Djamena und strategische Punkte', '5.000–8.000', WP('Chadian_National_Army'), WP_L('Tschadische Armee')),
  ],
  conflicts: [
    con('Tschadsee-Krise', ['ANT', 'MNJTF', 'Boko Haram / ISWAP'], 'Aktiv', 2014, undefined, 'Boko-Haram-Insurgenz in der Tschadsee-Region. Tschad spielt Schlüsselrolle in der MNJTF. Zahlreiche Militäroffensiven. Massive humanitäre Krise.', '2.000+ Tote in Tschad, 400.000 Vertriebene', WP('Boko_Haram_insurgency'), WP_L('Boko-Haram-Aufstand')),
    con('Tschadische Rebellionen (wiederkehrend)', ['ANT / DGSSIE', 'FACT', 'diverse Rebellengruppen'], 'Niedrige Intensität', 2005, undefined, 'Wiederkehrende Rebellionen aus dem Norden (Tibesti) und von Libyen aus. Déby-Regime überleben durch überlegene Militärkraft. FACT-Offensive 2021 tötete Idriss Déby.', 'Tausende Tote über Jahrzehnte', WP('Chadian_Civil_War_(2005%E2%80%932010)'), WP_L('Tschadischer Bürgerkrieg')),
    con('Libyen-Spillover', ['Tschad', 'Libysche Milizen', 'FACT'], 'Latent', 2011, undefined, 'Instabilität in Libyen führt zu Waffenflüssen und Rückzugsräumen für tschadische Rebellen. Tibesti-Region als Transitzone. Tschad intervenierte zeitweise in Libyen.', 'Unbekannt', WP('Chadian%E2%80%93Libyan_conflict'), WP_L('Tschadisch-libyscher Konflikt')),
  ],
  relations: [
    rel('FR', 'Frankreich', '🇫🇷', 'Wichtigster westlicher Verbündeter', 'Frankreich unterhielt größte Militärbasis in Afrika in N\'Djamena (Opération Barkhane-Hub, 1.000+ Soldaten). Tschad kündigte 2024 Verteidigungsabkommen. Frankreich zog Truppen ab. Historisch enge Beziehungen.', WP('Chad%E2%80%93France_relations'), WP_L('Tschadisch-französische Beziehungen')),
    rel('US', 'USA', '🇺🇸', 'Partner (Terrorbekämpfung)', 'US-Spezialkräfte-Ausbilder und Anti-Terror-Kooperation. Tschad erhält US-Militärhilfe. Gemeinsame Übung Flintlock. Tschad als Pfeiler der Sahel-Strategie.', AFRICOM, AFRICOM_L),
    rel('LY', 'Libyen', '🇱🇾', 'Angespannt', 'Historische Rivalität (Aouzou-Streifen). Libysche Instabilität als Sicherheitsrisiko. Tschadische Rebellen nutzen Südlibyen als Rückzugsraum. Tschadische Söldner in Libyen aktiv.', WP('Chad%E2%80%93Libya_relations'), WP_L('Tschadisch-libysche Beziehungen')),
    rel('SD', 'Sudan', '🇸🇩', 'Angespannt (Proxy-Kriege)', 'Historische Proxy-Kriege: Sudan unterstützte tschadische Rebellen, Tschad sudanesische Rebellen. Seit 2023 sudanesischer Bürgerkrieg verschärft Lage. 700.000+ sudanesische Flüchtlinge im Tschad.', WP('Chad%E2%80%93Sudan_relations'), WP_L('Tschadisch-sudanesische Beziehungen')),
    rel('CM', 'Kamerun', '🇨🇲', 'Partner', 'Kooperation in der MNJTF gegen Boko Haram. Gemeinsame Sicherheitsinteressen am Tschadsee. Wirtschaftlicher Transit über Kamerun (Hafen Douala).', WP('Cameroon%E2%80%93Chad_relations'), WP_L('Kamerunisch-tschadische Beziehungen')),
    rel('NE', 'Niger', '🇳🇪', 'Nachbar / Partner', 'Kooperation gegen Boko Haram in der MNJTF. Gemeinsame Grenze am Tschadsee. Tschad nahm ambivalente Haltung zum Niger-Putsch 2023 ein.', WP('Chad%E2%80%93Niger_relations'), WP_L('Tschadisch-nigerische Beziehungen')),
  ],
  missions: [
    mis('MNJTF (Tschad-Anteil)', 'Multinational Joint Task Force – Tschad', 'Sonstige', 'Anti-Terror', 'Aktiv', 2015, undefined, 3000, 'Tschadischer Beitrag zur MNJTF gegen Boko Haram. Tschad stellt mit die kampfstärksten Kontingente.', ['TD', 'NG', 'NE', 'CM'], WP('Multinational_Joint_Task_Force'), WP_L('MNJTF')),
    mis('Opération Barkhane (Hub N\'Djamena)', 'Barkhane Hauptquartier Tschad', 'Frankreich', 'Anti-Terror', 'Beendet (2024)', 2014, 2024, 0, 'N\'Djamena war Hauptquartier von Opération Barkhane. Bis 2024 französische Truppen stationiert. Abzug nach Kündigung des Verteidigungsabkommens durch Tschad.', ['TD'], WP('Op%C3%A9ration_Barkhane'), WP_L('Opération Barkhane')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// KAMERUN (CM)
// ═══════════════════════════════════════════════════════════════

const CM: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Forces Armées Camerounaises (FAC)',
    founded: 1960,
    activePersonnel: 40000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 9000,
    militaryBudget: 500000000,
    budgetPercentGDP: 1.1,
    conscription: false,
    commanderInChief: 'Präsident Paul Biya',
    source: GFP('cameroon'),
    sourceLabel: GFP_L('Kamerun'),
  },
  weaponSystems: [
    ws('Gepanzerte Fahrzeuge', 'PTL02 Assaulter', 18, 'China', 'Aktiv', IISS, IISS_L, 'Radpanzer mit 100mm-Kanone'),
    ws('Gepanzerte Fahrzeuge', 'M8 Greyhound', 8, 'USA', 'Eingeschränkt', IISS, IISS_L, 'Veraltete Spähpanzer'),
    ws('Gepanzerte Fahrzeuge', 'Ferret Scout Car', 12, 'Großbritannien', 'Eingeschränkt', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'WZ-523 / Type 92', 14, 'China', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Bastion Patsas', 12, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Kampfflugzeuge', 'Alpha Jet', 5, 'Frankreich/Deutschland', 'Eingeschränkt', IISS, IISS_L, 'Bodenunterstützung, nur teilweise einsatzbereit'),
    ws('Transportflugzeuge', 'C-130H Hercules', 3, 'USA', 'Aktiv', IISS, IISS_L),
    ws('Kampfhubschrauber', 'Mi-24 SuperHind', 2, 'Russland/Südafrika', 'Aktiv', IISS, IISS_L, 'Modernisiert durch ATE (Südafrika)'),
    ws('Transporthubschrauber', 'SA 342 Gazelle', 4, 'Frankreich', 'Aktiv', IISS, IISS_L, 'Leichte bewaffnete Hubschrauber'),
    ws('Patrouillenboote', 'P48 / Bakassi-Klasse', 6, 'Frankreich/China', 'Aktiv', IISS, IISS_L, 'Küstenschutz und Tschadsee'),
  ],
  actors: [
    act('Ambazonia Defense Forces (ADF)', 'Separatistische Miliz', 'Bewaffneter Arm der anglophonen Separatistenbewegung. Kämpft für Unabhängigkeit der anglophonen Regionen (Northwest, Southwest). Dezentrale Struktur, zahlreiche Splittergruppen (Red Dragons, Ambazonia Restoration Forces).', 'Aktiv', 'Northwest Region, Southwest Region (anglophone Regionen)', '2.000–4.000 (in zahlreichen Gruppen)', WP('Ambazonian_separatist_movement'), WP_L('Ambazonia-Separatismus')),
    act('Boko Haram / ISWAP', 'Terrororganisation', 'Boko Haram und ISWAP operieren in der Extrême-Nord-Region Kameruns. Angriffe auf Dörfer, Entführungen, Selbstmordattentate. Kamerun beteiligt an MNJTF.', 'Aktiv (reduziert)', 'Extrême-Nord (Mayo-Sava, Mayo-Tsanaga, Logone-et-Chari)', '500–1.500 (in Kamerun)', WP('Boko_Haram_insurgency'), WP_L('Boko-Haram-Aufstand')),
    act('BIR (Bataillon d\'Intervention Rapide)', 'Elite-Sicherheitskraft', 'Kamerunische Eliteeinheit unter direktem Befehl des Präsidenten. Von Israel und USA ausgebildet. Hauptkampftruppe gegen Boko Haram und Separatisten. Berichte über Menschenrechtsverletzungen.', 'Aktiv', 'Extrême-Nord, Northwest, Southwest', '5.000+', WP('Rapid_Intervention_Battalion'), WP_L('BIR')),
  ],
  conflicts: [
    con('Anglophone Krise', ['FAC / BIR', 'ADF / Separatisten-Milizen'], 'Aktiv', 2017, undefined, 'Bewaffneter Konflikt in den anglophonen Regionen Kameruns. Begann als friedlicher Protest gegen Marginalisierung, eskalierte 2017 zum bewaffneten Aufstand. Geisterstädte, Schulblockaden, Massaker. 700.000+ Vertriebene.', '6.000+ Tote, 700.000 Vertriebene', WP('Anglophone_Crisis'), WP_L('Anglophone Krise')),
    con('Boko Haram im Extrême-Nord', ['FAC / MNJTF', 'Boko Haram / ISWAP'], 'Aktiv (reduziert)', 2014, undefined, 'Boko-Haram-Insurgenz in der Extrême-Nord-Region. Selbstmordattentate, Überfälle, Entführungen (inkl. Chibok-ähnliche Vorfälle). Kamerunische Armee mit MNJTF-Unterstützung.', '3.000+ Tote, 300.000 Vertriebene', WP('Boko_Haram_insurgency'), WP_L('Boko-Haram-Aufstand')),
  ],
  relations: [
    rel('FR', 'Frankreich', '🇫🇷', 'Historischer Verbündeter', 'Frankreich unterhält kleine Militärpräsenz in Kamerun. Ausbildungskooperation. Diplomatische Unterstützung für Biya-Regime. Waffenlieferungen.', WP('Cameroon%E2%80%93France_relations'), WP_L('Kamerunisch-französische Beziehungen')),
    rel('NG', 'Nigeria', '🇳🇬', 'Partner (Boko Haram / Bakassi)', 'Kooperation gegen Boko Haram in der MNJTF. Bakassi-Halbinsel-Streit 2002 vom IGH zugunsten Kameruns entschieden. Übergabe 2008. Spannungen wegen anglophoner Flüchtlinge.', WP('Cameroon%E2%80%93Nigeria_relations'), WP_L('Kamerunisch-nigerianische Beziehungen')),
    rel('US', 'USA', '🇺🇸', 'Sicherheitspartner', 'US-Ausbildung für kamerunische Truppen (Spezialkräfte, BIR). Militärhilfe für Anti-Terror-Einsätze. Einschränkungen wegen Menschenrechtsverletzungen.', AFRICOM, AFRICOM_L),
    rel('CN', 'China', '🇨🇳', 'Wirtschafts- und Rüstungspartner', 'China liefert Waffen (PTL02, gepanzerte Fahrzeuge). Großprojekte (Hafen Kribi, Infrastruktur). Verschuldungsproblematik.', WP('Cameroon%E2%80%93China_relations'), WP_L('Kamerunisch-chinesische Beziehungen')),
    rel('TD', 'Tschad', '🇹🇩', 'Partner', 'MNJTF-Kooperation gegen Boko Haram. Wirtschaftliche Verbindungen (Tschad nutzt Hafen Douala). Grenzkooperation.', WP('Cameroon%E2%80%93Chad_relations'), WP_L('Kamerunisch-tschadische Beziehungen')),
  ],
  missions: [
    mis('MNJTF (Kamerun-Anteil)', 'Multinational Joint Task Force – Kamerun', 'Sonstige', 'Anti-Terror', 'Aktiv', 2015, undefined, 2650, 'Kamerunischer Beitrag zur MNJTF. MNJTF-Hauptquartier zeitweise in Maroua. Einsatz gegen Boko Haram in der Tschadsee-Region.', ['CM', 'NG', 'TD', 'NE'], WP('Multinational_Joint_Task_Force'), WP_L('MNJTF')),
    mis('UNOCA', 'UN Office for Central Africa', 'UN', 'Politische Mission', 'Aktiv', 2011, undefined, 50, 'UN-Regionalbüro für Zentralafrika in Libreville. Konfliktverhütung, Mediation. Kamerun als Teil des Mandatsgebiets.', ['CM', 'TD', 'CF', 'CG', 'GA', 'GQ', 'ST'], 'https://unoca.unmissions.org/', 'UNOCA'),
  ],
};

// ═══════════════════════════════════════════════════════════════
// ZENTRALAFRIKANISCHE REPUBLIK (CF)
// ═══════════════════════════════════════════════════════════════

const CF: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Forces Armées Centrafricaines (FACA)',
    founded: 1960,
    activePersonnel: 7000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 1000,
    militaryBudget: 50000000,
    budgetPercentGDP: 2.0,
    conscription: true,
    commanderInChief: 'Präsident Faustin-Archange Touadéra',
    source: GFP('central-african-republic'),
    sourceLabel: GFP_L('Zentralafrikanische Republik'),
  },
  weaponSystems: [
    ws('Gepanzerte Fahrzeuge', 'BRDM-2', 10, 'Russland', 'Aktiv', IISS, IISS_L, 'Von Russland / Wagner geliefert'),
    ws('Gepanzerte Fahrzeuge', 'Tiger (MRAP)', 4, 'Russland', 'Aktiv', IISS, IISS_L, 'Russische Minenräumfahrzeuge'),
    ws('Gepanzerte Fahrzeuge', 'BTR-80', 6, 'Russland', 'Aktiv', IISS, IISS_L, 'Neu geliefert seit 2021'),
    ws('Gepanzerte Fahrzeuge', 'Ural-4320 (gepanzert)', 10, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Leichte Waffen', 'AK-47 / AKM (Infanterie)', 5000, 'Russland / diverse', 'Aktiv', IISS, IISS_L, 'Russische Lieferungen trotz UN-Embargo'),
    ws('Transporthubschrauber', 'Mi-8/17', 2, 'Russland', 'Aktiv', IISS, IISS_L, 'Von Wagner/Afrika Corps betrieben'),
    ws('Artillerie', '120mm Mörser', 6, 'Russland / diverse', 'Aktiv', IISS, IISS_L),
  ],
  actors: [
    act('3R (Retour, Réclamation et Réhabilitation)', 'Bewaffnete Gruppe (ex-Séléka)', 'Fulbe-dominierte bewaffnete Gruppe unter Sidiki Abass (getötet 2021) in Nordwest-ZAR. Viehzucht-Schutz, Kontrolle von Transhumanz-Routen. Seit 2021 geschwächt, aber aktiv.', 'Aktiv (geschwächt)', 'Nordwesten (Ouham-Pendé, Nana-Mambéré)', '1.000–2.000', WP('Return,_Reclamation_and_Rehabilitation'), WP_L('3R')),
    act('UPC (Unité pour la Paix en Centrafrique)', 'Bewaffnete Gruppe (ex-Séléka)', 'Ex-Séléka-Fraktion unter Ali Darassa (Fulbe). Kontrolliert Gebiete im Zentrum und Osten. Am Friedensabkommen 2019 beteiligt, aber wiederholt Verstöße.', 'Aktiv', 'Zentral- und Ost-ZAR (Ouaka, Haute-Kotto)', '2.000–3.000', WP('Union_for_Peace_in_Central_Africa'), WP_L('UPC')),
    act('FPRC (Front Populaire pour la Renaissance de la Centrafrique)', 'Bewaffnete Gruppe (ex-Séléka)', 'Stärkste ex-Séléka-Fraktion unter Noureddine Adam (Gula/Runga). Kontrolliert Teile des Nordostens. Zeitweise Allianz mit und gegen andere bewaffnete Gruppen.', 'Aktiv', 'Nordosten (Vakaga, Bamingui-Bangoran)', '2.000–4.000', WP('Popular_Front_for_the_Rebirth_of_the_Central_African_Republic'), WP_L('FPRC')),
    act('Anti-Balaka', 'Bewaffnete Miliz', 'Christlich-animistische Milizen, entstanden als Reaktion auf Séléka 2013. Dezentrale Struktur. Übergriffe auf muslimische Zivilisten. Teils kriminell motiviert.', 'Aktiv (fragmentiert)', 'Süd- und West-ZAR', '3.000–5.000', WP('Anti-balaka'), WP_L('Anti-Balaka')),
    act('CPC (Coalition des Patriotes pour le Changement)', 'Bewaffnete Koalition', 'Breite Rebellenkoalition aus Ex-Séléka und Anti-Balaka-Gruppen. Offensive gegen Bangui im Dezember 2020 / Januar 2021. Von FACA und Wagner zurückgeschlagen.', 'Geschwächt', 'Periphere Gebiete, teils grenzüberschreitend', '5.000–10.000 (auf Höhepunkt)', WP('Coalition_of_Patriots_for_Change'), WP_L('CPC')),
    act('Afrika Corps (ex-Wagner)', 'Private Militärfirma (Russland)', 'Seit 2018 in der ZAR. Wichtigste militärische Stütze des Touadéra-Regimes. Sicherung von Diamanten- und Goldminen. Schwere Menschenrechtsverletzungen dokumentiert (UN-Bericht). Kontrolle über Bergbau und Medien.', 'Aktiv – dominant', 'Bangui, Berengo (Ex-Bokassa-Palast), Bergbaugebiete landesweit', '1.500–2.500', WP('Wagner_Group_in_the_Central_African_Republic'), WP_L('Wagner in der ZAR')),
  ],
  conflicts: [
    con('Bürgerkrieg in der Zentralafrikanischen Republik', ['FACA / Wagner', 'CPC', 'UPC', 'FPRC', '3R', 'Anti-Balaka'], 'Aktiv (reduzierte Intensität)', 2012, undefined, 'Begann 2012 mit Séléka-Rebellion. Séléka stürzte Präsident Bozizé 2013. Gegenoffensive der Anti-Balaka. Seit 2018 Wagner-Präsenz stabilisiert Touadéra-Regime. CPC-Offensive 2020/2021 abgewehrt. Bewaffnete Gruppen kontrollieren weiterhin große Gebiete.', '10.000+ Tote, 1,5 Mio. Vertriebene', WP('Central_African_Republic_Civil_War_(2012%E2%80%93present)'), WP_L('Bürgerkrieg in der ZAR')),
  ],
  relations: [
    rel('RU', 'Russland', '🇷🇺', 'Primärer Sicherheitspartner', 'Wagner/Afrika Corps seit 2018 – wichtigste militärische Stütze des Regimes. Waffenlieferungen trotz UN-Embargo. Diamanten- und Goldabbau als Gegenleistung. Russischer Sonderberater beim Präsidenten.', WP('Central_African_Republic%E2%80%93Russia_relations'), WP_L('Zentralafrikanisch-russische Beziehungen')),
    rel('FR', 'Frankreich', '🇫🇷', 'Marginalisiert', 'Ehemals wichtigster Partner. Opération Sangaris 2013–2016 (2.000 Soldaten). Durch Wagner-Präsenz verdrängt. Französische Ausbilder abgezogen. Diplomatisch marginalisiert.', WP('Central_African_Republic%E2%80%93France_relations'), WP_L('Zentralafrikanisch-französische Beziehungen')),
    rel('CN', 'China', '🇨🇳', 'Wirtschaftspartner', 'Wachsende chinesische Investitionen im Bergbau. Diplomatische Unterstützung im UN-Sicherheitsrat bei Embargo-Fragen.', WP('Central_African_Republic%E2%80%93China_relations'), WP_L('Zentralafrikanisch-chinesische Beziehungen')),
    rel('CD', 'Dem. Rep. Kongo', '🇨🇩', 'Nachbar (Spillover)', 'Grenzüberschreitende bewaffnete Gruppen. LRA-Reste operieren im Grenzgebiet. Flüchtlingsströme in beide Richtungen.', WP('Central_African_Republic%E2%80%93Democratic_Republic_of_the_Congo_relations'), WP_L('ZAR-DRK-Beziehungen')),
    rel('TD', 'Tschad', '🇹🇩', 'Angespannt', 'Tschadische Viehzüchter und Transhumanz als Konfliktfaktor. Tschad intervenierte wiederholt militärisch. Ex-Séléka-Gruppen mit tschadischen und sudanesischen Kämpfern.', WP('Central_African_Republic%E2%80%93Chad_relations'), WP_L('ZAR-Tschad-Beziehungen')),
  ],
  missions: [
    mis('MINUSCA', 'UN Multidimensional Integrated Stabilization Mission in CAR', 'UN', 'Friedenssicherung', 'Aktiv', 2014, undefined, 14400, 'Größte aktive UN-Mission. Ca. 14.400 uniformiertes Personal. Schutz der Zivilbevölkerung, Unterstützung des Friedensprozesses. Spannungen mit Wagner-Kräften.', ['CF'], 'https://minusca.unmissions.org/', 'MINUSCA'),
    mis('EUTM RCA', 'EU Training Mission Central African Republic', 'EU', 'Militärische Ausbildung', 'Aktiv (eingeschränkt)', 2016, undefined, 80, 'EU-Ausbildungsmission für die FACA. Stark eingeschränkt wegen Wagner-Präsenz. EU-Ausbilder weigern sich, mit Wagner ausgebildete Einheiten zu trainieren.', ['CF'], EU_MISSIONS, EU_MISSIONS_L),
    mis('Opération Sangaris', 'Opération Sangaris (Frankreich)', 'Frankreich', 'Militärintervention', 'Beendet', 2013, 2016, 0, 'Französische Militärintervention zum Schutz der Zivilbevölkerung. 2.000 Soldaten. Entwaffnung von Milizen. Abzug 2016.', ['CF'], WP('Op%C3%A9ration_Sangaris'), WP_L('Opération Sangaris')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// MAURETANIEN (MR)
// ═══════════════════════════════════════════════════════════════

const MR: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Forces Armées Mauritaniennes (FAM)',
    founded: 1960,
    activePersonnel: 16000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 5000,
    militaryBudget: 220000000,
    budgetPercentGDP: 2.8,
    conscription: true,
    commanderInChief: 'Präsident Mohamed Ould Ghazouani',
    source: GFP('mauritania'),
    sourceLabel: GFP_L('Mauretanien'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-54/T-55', 35, 'Russland/Sowjetunion', 'Eingeschränkt', IISS, IISS_L, 'Teilweise nicht einsatzbereit'),
    ws('Gepanzerte Fahrzeuge', 'AML-90 / AML-60', 40, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Caiman (MRAP)', 20, 'Südafrika/VAE', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Bastion Patsas', 24, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Aufklärungsflugzeuge', 'Embraer EMB 111 Bandeirante', 2, 'Brasilien', 'Aktiv', IISS, IISS_L, 'Maritimes Überwachungsflugzeug'),
    ws('Transportflugzeuge', 'CASA C-212', 2, 'Spanien', 'Aktiv', IISS, IISS_L),
    ws('Transporthubschrauber', 'Z-9 / Harbin', 4, 'China', 'Aktiv', IISS, IISS_L),
    ws('Patrouillenboote', 'OPV 190 (Adrar-Klasse)', 1, 'China', 'Aktiv', IISS, IISS_L, 'Küstenwache, Fischerei-Überwachung'),
  ],
  actors: [
    act('Al-Qaida im Islamischen Maghreb (AQIM)', 'Terrororganisation', 'AQIM war 2005–2011 in Mauretanien aktiv. Mehrere Anschläge, insbesondere auf französische Touristen. Seit 2011 keine größeren Anschläge dank erfolgreicher Deradikalisierungspolitik und verbesserter Sicherheit.', 'Inaktiv in Mauretanien', 'Ehemals: Nouakchott, Nordosten', 'Unbekannt (regional weiter aktiv)', WP('Al-Qaeda_in_the_Islamic_Maghreb'), WP_L('AQIM')),
  ],
  conflicts: [
    con('Terrorbekämpfung (historisch)', ['FAM', 'AQIM'], 'Inaktiv (erfolgreich eingedämmt)', 2005, 2011, 'Mauretanien war 2005–2011 Ziel von AQIM-Anschlägen. Erfolgreiche Gegenmaßnahmen: Militäroperationen, Deradikalisierung, religiöser Dialog, bessere Grenzüberwachung. Seit 2011 kein größerer Anschlag. Gilt als Erfolgsmodell in der Region.', '30+ Tote (2005–2011)', WP('Insurgency_in_the_Maghreb'), WP_L('Insurgenz im Maghreb')),
  ],
  relations: [
    rel('FR', 'Frankreich', '🇫🇷', 'Partner', 'Historisch enge Beziehungen. Militärische Ausbildungskooperation. Mauritanien war Teil der G5-Sahel-Initiative. Pragmatische Haltung gegenüber französischer Präsenz in der Region.', WP('France%E2%80%93Mauritania_relations'), WP_L('Französisch-mauretanische Beziehungen')),
    rel('US', 'USA', '🇺🇸', 'Partner (Terrorbekämpfung)', 'US-Militärausbildung (Flintlock-Übungen). Anti-Terror-Kooperation. Mauretanien als relativ stabiler Partner in der Sahel-Region.', AFRICOM, AFRICOM_L),
    rel('DZ', 'Algerien', '🇩🇿', 'Nachbar / Partner', 'Grenzüberwachungskooperation. Gemeinsame Sicherheitsinteressen im Sahel. Regelmäßige Konsultationen zu regionaler Stabilität.', WP('Algeria%E2%80%93Mauritania_relations'), WP_L('Algerisch-mauretanische Beziehungen')),
    rel('MA', 'Marokko', '🇲🇦', 'Neutral / Delikat', 'Mauretanien wahrt Neutralität im Westsahara-Konflikt. Wirtschaftliche Beziehungen. Historische Ansprüche Mauretaniens auf die Westsahara (bis 1979 aufgegeben).', WP('Mauritania%E2%80%93Morocco_relations'), WP_L('Mauretanisch-marokkanische Beziehungen')),
    rel('SN', 'Senegal', '🇸🇳', 'Nachbar (delikat)', 'Ethnische Spannungen (Senegal-Fluss-Krise 1989). Handels- und Grenzbeziehungen. Gemeinsame Sicherheitsinteressen.', WP('Mauritania%E2%80%93Senegal_relations'), WP_L('Mauretanisch-senegalesische Beziehungen')),
    rel('ML', 'Mali', '🇲🇱', 'Nachbar (Sicherheitsbedenken)', 'Besorgt über Instabilität in Mali. Verstärkte Grenzüberwachung. Ehemalige G5-Sahel-Partnerschaft. Mauretanien hält Distanz zur AES-Allianz.', WP('Mali%E2%80%93Mauritania_relations'), WP_L('Malisch-mauretanische Beziehungen')),
  ],
  missions: [
    mis('G5 Sahel Force Conjointe (MR)', 'G5 Sahel Joint Force – Mauretanien', 'Sonstige', 'Anti-Terror', 'De facto aufgelöst', 2017, 2023, 0, 'Mauretanischer Beitrag zur G5-Sahel-Eingreiftruppe. Aufgelöst nach Austritt von Mali, Burkina Faso und Niger. Mauretanien als letztes aktives Mitglied.', ['MR', 'ML', 'BF', 'NE', 'TD'], WP('G5_Sahel'), WP_L('G5 Sahel')),
  ],
};

// ═══════════════════════════════════════════════════════════════
// CÔTE D'IVOIRE (CI)
// ═══════════════════════════════════════════════════════════════

const CI: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Forces Armées de Côte d\'Ivoire (FACI)',
    founded: 1960,
    activePersonnel: 25000,
    reservePersonnel: 0,
    paramilitaryPersonnel: 1500,
    militaryBudget: 720000000,
    budgetPercentGDP: 1.1,
    conscription: false,
    commanderInChief: 'Präsident Alassane Ouattara',
    source: GFP('ivory-coast'),
    sourceLabel: GFP_L('Côte d\'Ivoire'),
  },
  weaponSystems: [
    ws('Kampfpanzer', 'T-55', 10, 'Russland/Sowjetunion', 'Eingeschränkt', IISS, IISS_L, 'Minimale Einsatzbereitschaft'),
    ws('Gepanzerte Fahrzeuge', 'AMX-10RC', 10, 'Frankreich', 'Aktiv', IISS, IISS_L, 'Radpanzer mit 105mm-Kanone'),
    ws('Gepanzerte Fahrzeuge', 'Bastion Patsas', 20, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'BTR-80', 10, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Caiman (MRAP)', 16, 'Südafrika/VAE', 'Aktiv', IISS, IISS_L),
    ws('Kampfhubschrauber', 'Mi-24 Hind', 3, 'Belarus/Russland', 'Aktiv', IISS, IISS_L),
    ws('Transporthubschrauber', 'Mi-8/17', 5, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Transportflugzeuge', 'CASA C-295', 1, 'Spanien', 'Aktiv', IISS, IISS_L),
    ws('Patrouillenboote', 'RPB 33', 3, 'Frankreich', 'Aktiv', IISS, IISS_L, 'Küstenwache Abidjan'),
  ],
  actors: [
    act('Ehemalige Forces Nouvelles', 'Ehemalige Rebellenbewegung', 'Rebellenkoalition des Bürgerkriegs 2002–2011 unter Guillaume Soro. Kontrollierten Nordcôte d\'Ivoire. Nach Friedensabkommen in FACI integriert. Soro 2019 ins Exil.', 'Aufgelöst / integriert', 'Ehemals: Nordregion (Bouaké)', 'Aufgelöst (in FACI integriert)', WP('Forces_Nouvelles_de_C%C3%B4te_d%27Ivoire'), WP_L('Forces Nouvelles')),
    act('Dschihadistische Spillover-Bedrohung', 'Terrororganisation (extern)', 'JNIM und ISGS operieren zunehmend an der Nordgrenze. Anschläge in Kafolo (Juni 2020, 14 Soldaten getötet) und Tougbo. Côte d\'Ivoire baut nördliche Verteidigungslinie auf.', 'Aktiv (Spillover)', 'Nordgrenze zu Burkina Faso (Savanes, Zanzan)', 'Extern basiert', WP('Jihadist_insurgency_in_Burkina_Faso'), WP_L('Dschihadistischer Spillover')),
  ],
  conflicts: [
    con('Ivorischer Bürgerkrieg', ['FANCI / Loyalisten', 'Forces Nouvelles', 'FRCI'], 'Beendet', 2002, 2011, 'Bürgerkrieg begann 2002 mit Rebellion im Norden. Teilung des Landes. 2010/2011 Eskalation nach umstrittener Wahl (Gbagbo vs. Ouattara). Französische und UN-Intervention. Ouattara übernahm Macht.', '3.000+ Tote', WP('First_Ivorian_Civil_War'), WP_L('Ivorischer Bürgerkrieg')),
    con('Dschihadistische Grenzangriffe', ['FACI', 'JNIM / ISGS (Spillover aus Burkina Faso)'], 'Aktiv (niedrige Intensität)', 2020, undefined, 'Seit 2020 sporadische dschihadistische Angriffe im Norden. Kafolo-Anschlag Juni 2020 als Wendepunkt. Côte d\'Ivoire stationiert verstärkt Truppen im Norden.', '30+ Tote (Sicherheitskräfte)', WP('Jihadist_insurgency_in_Burkina_Faso'), WP_L('Dschihadistischer Spillover')),
  ],
  relations: [
    rel('FR', 'Frankreich', '🇫🇷', 'Engster Verbündeter', 'Frankreich unterhält 43. BIMA (Bataillon d\'Infanterie de Marine) in Abidjan – größte französische Militärbasis in Westafrika (900 Soldaten). Enge militärische Kooperation. Waffenlieferungen.', WP('43rd_Marine_Infantry_Battalion'), WP_L('43e BIMA')),
    rel('US', 'USA', '🇺🇸', 'Partner (Terrorbekämpfung)', 'US-Ausbildungskooperation und Anti-Terror-Unterstützung. Flintlock-Übungen. Wachsende Bedeutung als stabiler westafrikanischer Partner.', AFRICOM, AFRICOM_L),
    rel('BF', 'Burkina Faso', '🇧🇫', 'Angespannt (Spillover)', 'Besorgt über dschihadistischen Spillover. Grenzgebiet als Konfliktzone. Diplomatische Spannungen wegen Burkinas Abkehr von ECOWAS. Wirtschaftliche Verbindungen bleiben wichtig.', WP('Burkina_Faso%E2%80%93Ivory_Coast_relations'), WP_L('Burkinisch-ivorische Beziehungen')),
    rel('GH', 'Ghana', '🇬🇭', 'Nachbar / Partner', 'Stabile bilaterale Beziehungen. Gemeinsame Grenzüberwachung. Wirtschaftliche Kooperation (Kakao). Ghana ebenfalls besorgt über Sahel-Spillover.', WP('Ghana%E2%80%93Ivory_Coast_relations'), WP_L('Ghanaisch-ivorische Beziehungen')),
    rel('ML', 'Mali', '🇲🇱', 'Angespannt', 'Seit Malis Abkehr von ECOWAS angespannt. Besorgt über Wagner-Präsenz und Destabilisierung. Gemeinsame Geschichte der ECOWAS-Kooperation.', WP('Ivory_Coast%E2%80%93Mali_relations'), WP_L('Ivorisch-malische Beziehungen')),
  ],
  missions: [
    mis('43e BIMA (Frankreich)', '43e Bataillon d\'Infanterie de Marine', 'Frankreich', 'Militärbasis', 'Aktiv', 1961, undefined, 900, 'Größte französische Militärbasis in Westafrika. Standort Port-Bouët (Abidjan). Ausbildung, Logistik, Interventionsfähigkeit. Truppenstärke auf 600 reduziert geplant.', ['CI'], WP('43rd_Marine_Infantry_Battalion'), WP_L('43e BIMA')),
    mis('UNOCI', 'UN Operation in Côte d\'Ivoire', 'UN', 'Friedenssicherung', 'Beendet', 2004, 2017, 0, 'UN-Friedensmission in Côte d\'Ivoire. Bis zu 9.000 Soldaten. Entwaffnung, Wahlüberwachung. Abschluss 2017 nach Stabilisierung.', ['CI'], 'https://www.un.org/en/peacekeeping/missions/unoci/', 'UNOCI'),
  ],
};

// ═══════════════════════════════════════════════════════════════
// SENEGAL (SN)
// ═══════════════════════════════════════════════════════════════

const SN: CountryMilitaryData = {
  overview: {
    armedForcesName: 'Forces Armées Sénégalaises',
    founded: 1960,
    activePersonnel: 20000,
    reservePersonnel: 5000,
    paramilitaryPersonnel: 5000,
    militaryBudget: 480000000,
    budgetPercentGDP: 1.6,
    conscription: true,
    commanderInChief: 'Präsident Bassirou Diomaye Faye',
    source: GFP('senegal'),
    sourceLabel: GFP_L('Senegal'),
  },
  weaponSystems: [
    ws('Gepanzerte Fahrzeuge', 'AML-90 / AML-60', 30, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'M8 Greyhound', 4, 'USA', 'Eingeschränkt', IISS, IISS_L, 'Veraltet'),
    ws('Gepanzerte Fahrzeuge', 'VXB-170', 12, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'Caiman (MRAP)', 12, 'Südafrika/VAE', 'Aktiv', IISS, IISS_L),
    ws('Gepanzerte Fahrzeuge', 'RG-31 Nyala (MRAP)', 12, 'Südafrika', 'Aktiv', IISS, IISS_L, 'US-Lieferung für Friedensmissionen'),
    ws('Aufklärungsflugzeuge', 'Embraer EMB 111', 1, 'Brasilien', 'Aktiv', IISS, IISS_L, 'Seeaufklärung'),
    ws('Transporthubschrauber', 'Mi-17', 3, 'Russland', 'Aktiv', IISS, IISS_L),
    ws('Transporthubschrauber', 'Bell 205 / UH-1H', 4, 'USA', 'Eingeschränkt', IISS, IISS_L),
    ws('Patrouillenboote', 'RPB 20 / Osprey-Klasse', 5, 'Frankreich/USA', 'Aktiv', IISS, IISS_L, 'Marine und Küstenwache'),
    ws('Artillerie', 'M101 105mm Haubitze', 6, 'USA', 'Aktiv', IISS, IISS_L),
  ],
  actors: [
    act('MFDC (Mouvement des Forces Démocratiques de Casamance)', 'Separatistische Rebellengruppe', 'Separatistenbewegung in der Casamance-Region (Südsenegal). Kämpft seit 1982 für Unabhängigkeit. Stark geschwächt und fragmentiert. Mehrere Waffenstillstände. Teilweise kriminelle Aktivitäten (Cannabis-Anbau, Holzschmuggel).', 'Aktiv (stark geschwächt)', 'Casamance (Ziguinchor, Sédhiou, Kolda)', '500–1.000 (fragmentiert)', WP('Movement_of_Democratic_Forces_of_Casamance'), WP_L('MFDC')),
  ],
  conflicts: [
    con('Casamance-Konflikt', ['Senegalesische Streitkräfte', 'MFDC'], 'Aktiv (niedrigste Intensität)', 1982, undefined, 'Längster aktiver Konflikt Westafrikas. Separatismus in der Casamance. Seit 2010er Jahren deutlich reduziert. Friedensgespräche, aber kein umfassendes Abkommen. Landminen als bleibendes Problem.', '5.000+ Tote (über vier Jahrzehnte), stark reduzierte Intensität', WP('Casamance_conflict'), WP_L('Casamance-Konflikt')),
  ],
  relations: [
    rel('FR', 'Frankreich', '🇫🇷', 'Historischer Partner (Neudefinition)', 'Traditionell enge Beziehungen. Frankreich betrieb bis kürzlich Militärbasis in Dakar. Neuer Präsident Faye fordert Neuverhandlung der Partnerschaft auf Augenhöhe. Abzug französischer Truppen angekündigt.', WP('France%E2%80%93Senegal_relations'), WP_L('Französisch-senegalesische Beziehungen')),
    rel('US', 'USA', '🇺🇸', 'Wichtiger Partner', 'Senegal als bevorzugter US-Partner in Westafrika. Flintlock-Übungen. Senegalesische Truppen häufig in UN-Missionen mit US-Unterstützung. Sicherheitskooperation.', AFRICOM, AFRICOM_L),
    rel('GM', 'Gambia', '🇬🇲', 'Enge Beziehungen', 'Gambia vollständig von Senegal umschlossen. Enge wirtschaftliche und sicherheitspolitische Verflechtung. Senegal intervenierte 2017 (ECOWAS) zum Schutz der Demokratie. MFDC-Rebellen nutzen teils gambisches Territorium.', WP('Gambia%E2%80%93Senegal_relations'), WP_L('Gambisch-senegalesische Beziehungen')),
    rel('GW', 'Guinea-Bissau', '🇬🇼', 'Nachbar (MFDC-Rückzugsraum)', 'MFDC-Rebellen nutzen guinea-bissauisches Grenzgebiet als Rückzugsraum. Kooperation bei Grenzüberwachung. Wirtschaftliche Beziehungen.', WP('Guinea-Bissau%E2%80%93Senegal_relations'), WP_L('Guinea-Bissau-senegalesische Beziehungen')),
    rel('MR', 'Mauretanien', '🇲🇷', 'Nachbar (Normalisiert)', 'Nach der Senegal-Fluss-Krise 1989 (ethnische Gewalt) normalisierte Beziehungen. Gemeinsames Gasfeld GTA (Grande Tortue Ahmeyim). Wirtschaftliche Kooperation.', WP('Mauritania%E2%80%93Senegal_relations'), WP_L('Mauretanisch-senegalesische Beziehungen')),
    rel('TR', 'Türkei', '🇹🇷', 'Wachsender Partner', 'Wachsende türkische Militärkooperation. Bayraktar-Drohnen-Interesse. Wirtschaftliche Beziehungen und Infrastrukturprojekte.', WP('Senegal%E2%80%93Turkey_relations'), WP_L('Senegalesisch-türkische Beziehungen')),
  ],
  missions: [
    mis('ECOWAS-Mission Gambia (ECOMIG)', 'ECOWAS Mission in Gambia', 'Sonstige', 'Friedenssicherung', 'Aktiv', 2017, undefined, 800, 'ECOWAS-Mission unter senegalesischer Führung in Gambia. Sicherung des demokratischen Machtwechsels 2017. Senegalesische Truppen bilden Kern.', ['GM', 'SN'], WP('ECOWAS_Military_Intervention_in_the_Gambia'), WP_L('ECOMIG Gambia')),
    mis('MINUSMA (SN-Anteil)', 'Senegalesischer Beitrag zu MINUSMA', 'UN', 'Friedenssicherung', 'Beendet (2023)', 2013, 2023, 0, 'Bedeutender senegalesischer Beitrag zur UN-Mission in Mali. Senegal als einer der größten Truppensteller für UN-Missionen weltweit.', ['ML'], 'https://minusma.unmissions.org/', 'MINUSMA'),
    mis('Senegalesische UN-Beteiligungen', 'Diverse UN-Peacekeeping-Einsätze', 'UN', 'Friedenssicherung', 'Aktiv', 1960, undefined, 2500, 'Senegal ist einer der größten UN-Truppensteller Afrikas. Beteiligt an Missionen in DRK, Darfur, Mali, Côte d\'Ivoire und anderen Ländern.', ['SN', 'CD', 'SD', 'ML', 'CI'], 'https://peacekeeping.un.org/', 'UN Peacekeeping'),
  ],
};

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════

export const militaryDataSahel: Record<string, CountryMilitaryData> = {
  ML, BF, NE, TD, CM, CF, MR, CI, SN,
};
