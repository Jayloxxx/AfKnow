// ═══════════════════════════════════════════════════════════════
// GLOBAL MILITARY COMPARISON DATA
// Sources: IISS Military Balance 2024, GlobalFirepower 2024,
//          SIPRI Arms Transfers, FAS Nuclear Notebook 2024
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────

export interface NuclearStatus {
  hasWeapons: boolean;
  suspected: boolean;
  warheadsEstimate?: number;
  deliverySystems?: string[];
  nptMember: boolean;
  note?: string;
}

export interface MilitaryDoctrine {
  strategicOrientation: string;
  keyAlliances: string[];
  forceProjectionCapability: 'Keine' | 'Begrenzt' | 'Regional' | 'Global';
  asymmetricCapabilities: string[];
  nuclearPosture: string;
}

export interface DefenseIndustry {
  selfSufficiencyRating: number; // 0–100
  keyDomesticSystems: string[];
  majorImportPartners: string[];
  majorExportPartners: string[];
  note: string;
}

export interface CompareWeaponSystem {
  name: string;
  quantity: number;
  origin: string;
  generation?: string;
  status: string;
  notes?: string;
  source: string;
  sourceLabel: string;
}

export interface ForceStructureCategory {
  category: string;
  systems: CompareWeaponSystem[];
  qualityNote?: string;
}

export interface GlobalMilitaryProfile {
  id: string;
  name: string;
  flagEmoji: string;
  region: string;
  activePersonnel: number;
  reservePersonnel: number;
  paramilitaryPersonnel: number;
  militaryBudget: number;
  budgetPercentGDP: number;
  gfpRank: number;
  conscription: boolean;
  conscriptionNote?: string;
  armedForcesName: string;
  nuclear: NuclearStatus;
  doctrine: MilitaryDoctrine;
  industry: DefenseIndustry;
  forceStructure: ForceStructureCategory[];
  overviewSource: string;
  overviewSourceLabel: string;
}

// ── Helpers ────────────────────────────────────────────────────

const IISS = 'https://www.iiss.org/publications/the-military-balance';
const IISS_L = 'IISS Military Balance 2024';
const GFP = (id: string) => `https://www.globalfirepower.com/country-military-strength-detail.php?country_id=${id}`;
const GFP_L = (n: string) => `GlobalFirepower 2024 – ${n}`;
const WP = (slug: string) => `https://en.wikipedia.org/wiki/${slug}`;
const WP_L = (n: string) => `Wikipedia – ${n}`;

function cws(name: string, qty: number, origin: string, status: string, src: string, srcLabel: string, gen?: string, notes?: string): CompareWeaponSystem {
  return { name, quantity: qty, origin, generation: gen, status, notes, source: src, sourceLabel: srcLabel };
}

// ── Country Profiles ──────────────────────────────────────────
// Will be populated below

// ═══════════════════════════════════════════════════════════════
// IRAN
// ═══════════════════════════════════════════════════════════════
const IR: GlobalMilitaryProfile = {
  id: 'IR', name: 'Iran', flagEmoji: '🇮🇷', region: 'Naher Osten',
  activePersonnel: 610000, reservePersonnel: 350000, paramilitaryPersonnel: 220000,
  militaryBudget: 10000000000, budgetPercentGDP: 2.1, gfpRank: 14,
  conscription: true, conscriptionNote: 'Männer, 21 Monate',
  armedForcesName: 'Streitkräfte der Islamischen Republik Iran',
  nuclear: { hasWeapons: false, suspected: true, nptMember: true, note: 'Anreicherung auf 60%, keine bestätigten Waffen (IAEA). „Breakout-Fähigkeit" auf Wochen geschätzt.' },
  doctrine: {
    strategicOrientation: 'Asymmetrische Abschreckung über Proxy-Netzwerk (\"Achse des Widerstands\"), ballistische Raketenstreitkräfte als strategischer Pfeiler, A2/AD in der Straße von Hormuz.',
    keyAlliances: ['Hezbollah', 'Houthis', 'Schiitische Milizen Irak', 'Russland (begrenzt)', 'China (wirtschaftlich)'],
    forceProjectionCapability: 'Regional',
    asymmetricCapabilities: ['Proxy-Netzwerk', 'Ballistische Raketen', 'Drohnenschwärme (Shahed)', 'Cyber-Operationen', 'Schnellboot-Schwärme (IRGCN)', 'Seeminen'],
    nuclearPosture: 'Offiziell ziviles Nuklearprogramm. 60%-Anreicherung ermöglicht schnellen Breakout. Kein bestätigtes Waffenprogramm, aber „nukleare Schwelle" erreicht.',
  },
  industry: {
    selfSufficiencyRating: 55,
    keyDomesticSystems: ['Shahed-136 Drohne', 'Fattah-1 Hyperschall', 'Bavar-373 SAM', 'Karrar UCAV', 'Fateh-Klasse U-Boot', 'Sayyad-4C SAM'],
    majorImportPartners: ['Russland', 'China', 'Nordkorea (hist.)'],
    majorExportPartners: ['Russland (Shahed)', 'Houthis', 'Hezbollah', 'Irak-Milizen'],
    note: 'Sanktionsbedingt hoher Eigenentwicklungsgrad bei Drohnen und Raketen. Qualität bei konventionellen Systemen (Panzer, Jets) deutlich unter westlichem Niveau.',
  },
  forceStructure: [
    { category: 'Landstreitkräfte', qualityNote: 'Quantität vor Qualität. Viele veraltete Systeme, aber modernisierte Eigenentwicklungen.', systems: [
      cws('T-72S / Karrar', 480, 'Russland / Eigenentwicklung', 'Aktiv', IISS, IISS_L, '2./3. Gen', 'Karrar = modernisierter T-72 mit ERA'),
      cws('M60A1 / T-55 / Chieftain', 1200, 'USA/UK/Russland (Vorrevolution)', 'Aktiv (veraltet)', IISS, IISS_L, '1./2. Gen'),
      cws('BMP-2 / Boragh APC', 620, 'Russland / Eigenentwicklung', 'Aktiv', IISS, IISS_L),
      cws('Artillerie (gezogen + SP)', 2300, 'Diverse', 'Aktiv', GFP('iran'), GFP_L('Iran')),
      cws('MLRS (Fajr-5, BM-21)', 1500, 'Eigenentwicklung / Russland', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', qualityNote: 'Veraltet. F-14A aus Vorrevolutionszeit. Wenige einsatzbereite Kampfjets. Fokus liegt auf Drohnen.', systems: [
      cws('F-14A Tomcat', 24, 'USA (1976)', 'Begrenzt einsatzfähig', WP('Islamic_Republic_of_Iran_Air_Force'), WP_L('IRIAF'), '4. Gen', 'Letzte aktive F-14-Flotte weltweit'),
      cws('MiG-29A/UB', 25, 'Russland', 'Aktiv', IISS, IISS_L, '4. Gen'),
      cws('Su-24MK Fencer', 20, 'Russland', 'Aktiv', IISS, IISS_L, '3.+ Gen'),
      cws('F-4E Phantom II', 30, 'USA (Vorrevolution)', 'Begrenzt', IISS, IISS_L, '3. Gen'),
      cws('F-5E/F Tiger II', 40, 'USA (Vorrevolution)', 'Aktiv', IISS, IISS_L, '2. Gen'),
      cws('Shahed-129 / Mohajer-6 UCAV', 200, 'Eigenentwicklung', 'Aktiv', WP('Shahed_129'), WP_L('Shahed-129'), 'ISR/Strike'),
      cws('Shahed-136 Loitering Munition', 1000, 'Eigenentwicklung', 'Aktiv/Export', WP('HESA_Shahed_136'), WP_L('Shahed-136'), 'Kamikaze'),
    ]},
    { category: 'Marine', qualityNote: 'Zweigleisig: IRIN (regulär, Hochsee) + IRGCN (asymmetrisch, Küste). IRGCN dominiert Hormuz mit Schnellbooten.', systems: [
      cws('Kilo-Klasse SSK', 3, 'Russland', 'Aktiv', IISS, IISS_L, 'Diesel-elektrisch'),
      cws('Fateh-Klasse SSK', 1, 'Eigenentwicklung', 'Aktiv', WP('Fateh-class_submarine'), WP_L('Fateh-Klasse')),
      cws('Ghadir-Klasse Midget-Sub', 23, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Küsten-U-Boot'),
      cws('Moudge-Klasse Fregatte', 3, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
      cws('IRGCN Schnellboote', 200, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Asymmetrisch', 'RPG, AShM, Minen'),
    ]},
    { category: 'Raketenstreitkräfte', qualityNote: 'Größtes Raketenarsenal im Nahen Osten. IRGC Aerospace Force kontrolliert alle ballistischen Systeme.', systems: [
      cws('Shahab-3 / Ghadr MRBM', 300, 'Eigenentwicklung', 'Aktiv', WP('Shahab-3'), WP_L('Shahab-3'), 'MRBM, 1.300km'),
      cws('Sejjil-2 MRBM', 50, 'Eigenentwicklung', 'Aktiv', WP('Sejjil'), WP_L('Sejjil'), 'Feststoff, 2.000km'),
      cws('Fattah-1 Hyperschall', 10, 'Eigenentwicklung', 'Neu (2023)', WP('Fattah_(missile)'), WP_L('Fattah'), 'Hypersonisch, 1.400km', 'Manövrierfähiger Gefechtskopf'),
      cws('Kheibar Shekan MRBM', 50, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Feststoff, 2.000km'),
      cws('Soumar / Hoveyzeh LACM', 100, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Marschflugkörper, 1.350km'),
      cws('Bavar-373 SAM', 4, 'Eigenentwicklung', 'Aktiv', WP('Bavar-373'), WP_L('Bavar-373'), 'Langstrecke', 'Iranische S-300-Alternative'),
      cws('S-300PMU-2', 4, 'Russland', 'Aktiv', IISS, IISS_L, 'Langstrecke SAM'),
      cws('3rd Khordad SAM', 8, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Mittelstrecke'),
    ]},
  ],
  overviewSource: GFP('iran'), overviewSourceLabel: GFP_L('Iran'),
};

// ═══════════════════════════════════════════════════════════════
// ISRAEL
// ═══════════════════════════════════════════════════════════════
const IL: GlobalMilitaryProfile = {
  id: 'IL', name: 'Israel', flagEmoji: '🇮🇱', region: 'Naher Osten',
  activePersonnel: 169500, reservePersonnel: 465000, paramilitaryPersonnel: 8000,
  militaryBudget: 23600000000, budgetPercentGDP: 4.5, gfpRank: 17,
  conscription: true, conscriptionNote: 'Männer 32 Mo., Frauen 24 Mo.',
  armedForcesName: 'Israel Defense Forces (צה״ל)',
  nuclear: { hasWeapons: true, suspected: true, warheadsEstimate: 90, deliverySystems: ['Jericho-III ICBM', 'Dolphin-U-Boote (SLCM)', 'F-35I/F-15I'], nptMember: false, note: 'Politik der „nuklearen Ambiguität" (Opacity). Nie offiziell bestätigt. ~90 Sprengköpfe (FAS 2024).' },
  doctrine: {
    strategicOrientation: 'Qualitative Military Edge (QME) über alle Nachbarn. Präventivschlag-Doktrin (Begin-Doktrin). Nachrichtendienstdominierte Kriegführung. Multi-Layer-Raketenabwehr.',
    keyAlliances: ['USA (strategische Partnerschaft)', 'Abraham-Abkommen (UAE, Bahrain, Marokko)', 'NATO-Kooperationspartner', 'Ägypten (Friedensvertrag)', 'Jordanien (Friedensvertrag)'],
    forceProjectionCapability: 'Regional',
    asymmetricCapabilities: ['Cyber (Unit 8200)', 'Intelligence (Mossad/Shin Bet)', 'Gezielte Tötungen', 'Iron Dome / Arrow BMD', 'Satellitenaufklärung (Ofek)'],
    nuclearPosture: 'Opacity-Politik: „Israel wird nicht das erste Land sein, das Atomwaffen im Nahen Osten einführt." De facto Nuklearmacht mit geschätzten 90 Sprengköpfen.',
  },
  industry: {
    selfSufficiencyRating: 75,
    keyDomesticSystems: ['Iron Dome', 'Arrow-3 BMD', 'David\'s Sling', 'Merkava Mk.4', 'Trophy APS', 'Namer APC', 'Hermes 900/450 UAV', 'Spike ATGM', 'Ofek-Satellit'],
    majorImportPartners: ['USA ($3,8 Mrd/Jahr FMF)'],
    majorExportPartners: ['Indien', 'Aserbaidschan', 'Singapur', 'Deutschland', 'Südkorea'],
    note: 'Hochinnovative Rüstungsindustrie (IAI, Rafael, Elbit, IMI). Weltweit führend bei Drohnen, Raketenabwehr, Cyber. ~$12 Mrd Rüstungsexporte/Jahr.',
  },
  forceStructure: [
    { category: 'Landstreitkräfte', qualityNote: 'Qualitativ höchstes Niveau in der Region. Merkava Mk.4 + Trophy APS = kampferprobt.', systems: [
      cws('Merkava Mk.4 / Mk.4 Barak', 460, 'Eigenentwicklung', 'Aktiv', WP('Merkava'), WP_L('Merkava'), '4. Gen', 'Trophy APS, Windbreaker'),
      cws('Merkava Mk.2/3', 600, 'Eigenentwicklung', 'Reserve', IISS, IISS_L, '3. Gen'),
      cws('Namer APC', 200, 'Eigenentwicklung', 'Aktiv', WP('Namer_(APC)'), WP_L('Namer'), 'Schwer gepanzert'),
      cws('M113 / Achzarit', 5000, 'USA / Eigenentwicklung', 'Aktiv/Reserve', IISS, IISS_L),
      cws('Artillerie + MLRS', 1000, 'Diverse', 'Aktiv', GFP('israel'), GFP_L('Israel')),
    ]},
    { category: 'Luftwaffe', qualityNote: 'Kampferprobteste Luftwaffe im Nahen Osten. F-35I Adir mit eigenem EW-System. Langjährige Luftherrschaft.', systems: [
      cws('F-35I Adir', 50, 'USA (modifiziert)', 'Aktiv', WP('Lockheed_Martin_F-35_Lightning_II_Israeli_procurement'), WP_L('F-35I Adir'), '5. Gen', '75 bestellt'),
      cws('F-15I Ra\'am', 25, 'USA', 'Aktiv', IISS, IISS_L, '4.+ Gen', 'Langstrecken-Strike'),
      cws('F-15A/B/C/D Baz', 58, 'USA', 'Aktiv', IISS, IISS_L, '4. Gen'),
      cws('F-16C/D/I Sufa', 175, 'USA', 'Aktiv', IISS, IISS_L, '4. Gen'),
      cws('AH-64D/E Apache', 48, 'USA', 'Aktiv', IISS, IISS_L),
      cws('Hermes 900/450 UAV', 100, 'Eigenentwicklung (Elbit)', 'Aktiv', WP('Elbit_Hermes_900'), WP_L('Hermes 900'), 'ISR/SIGINT'),
    ]},
    { category: 'Marine', qualityNote: 'Kleine aber fähige Marine. Dolphin-U-Boote gelten als nukleare Zweitschlagfähigkeit.', systems: [
      cws('Dolphin-Klasse SSK', 5, 'Deutschland (TKMS)', 'Aktiv', WP('Dolphin-class_submarine'), WP_L('Dolphin-Klasse'), 'AIP-fähig', 'Nuklear-SLCM-Verdacht (Popeye Turbo)'),
      cws('Sa\'ar 6 Korvette', 4, 'Deutschland (TKMS)', 'Aktiv', WP('Sa%27ar_6-class_corvette'), WP_L('Sa\'ar 6'), 'Barak-8 SAM, 32 VLS'),
      cws('Sa\'ar 5 Korvette', 3, 'USA', 'Aktiv', IISS, IISS_L),
      cws('Sa\'ar 4.5 FAC', 8, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Harpoon AShM'),
    ]},
    { category: 'Raketenstreitkräfte', qualityNote: 'Weltweit einzigartige Multi-Layer-Raketenabwehr (Iron Dome → David\'s Sling → Arrow-2/3). Jericho-III als nukleare Abschreckung.', systems: [
      cws('Iron Dome', 10, 'Eigenentwicklung (Rafael)', 'Aktiv', WP('Iron_Dome'), WP_L('Iron Dome'), 'Kurzstrecke', '~90% Abfangrate, Tamir-Interceptor'),
      cws('David\'s Sling', 4, 'Eigenentwicklung (Rafael/Raytheon)', 'Aktiv', WP('David%27s_Sling'), WP_L('David\'s Sling'), 'Mittelstrecke', 'Stunner + SkyCeptor'),
      cws('Arrow-2', 4, 'Eigenentwicklung (IAI/Boeing)', 'Aktiv', WP('Arrow_(missile_family)'), WP_L('Arrow'), 'Exoatmosphärisch'),
      cws('Arrow-3', 2, 'Eigenentwicklung (IAI/Boeing)', 'Aktiv', WP('Arrow_3'), WP_L('Arrow-3'), 'Exoatmosphärisch', 'Hit-to-Kill, Weltraum-Abfang'),
      cws('Jericho-III ICBM', 25, 'Eigenentwicklung', 'Aktiv', WP('Jericho_(missile)'), WP_L('Jericho III'), 'ICBM, 4.800-6.500km', 'Nuklear-fähig'),
    ]},
  ],
  overviewSource: GFP('israel'), overviewSourceLabel: GFP_L('Israel'),
};

// ═══════════════════════════════════════════════════════════════
// SAUDI ARABIA
// ═══════════════════════════════════════════════════════════════
const SA: GlobalMilitaryProfile = {
  id: 'SA', name: 'Saudi-Arabien', flagEmoji: '🇸🇦', region: 'Naher Osten',
  activePersonnel: 257000, reservePersonnel: 25000, paramilitaryPersonnel: 15500,
  militaryBudget: 75800000000, budgetPercentGDP: 6.0, gfpRank: 22,
  conscription: false,
  armedForcesName: 'Saudi Arabian Armed Forces (القوات المسلحة السعودية)',
  nuclear: { hasWeapons: false, suspected: false, nptMember: true, note: 'Kein Nuklearprogramm. Zivile Nuklearambitionen (NEOM). Impliziter US-Schutzschirm.' },
  doctrine: {
    strategicOrientation: 'Koalitionsbasierte Verteidigung mit US-Rückhalt. Fokus auf Luftüberlegenheit und Luftabwehr. Vision 2030: Lokalisierung der Rüstungsindustrie (SAMI).',
    keyAlliances: ['USA (strategischer Partner)', 'GCC', 'Abraham-Abkommen (angestrebt)', 'Ägypten', 'Pakistan (nuklearer Backup?)'],
    forceProjectionCapability: 'Regional',
    asymmetricCapabilities: ['Hohe Kaufkraft für Waffensysteme', 'Wirtschaftlicher Hebel (Öl)'],
    nuclearPosture: 'Kein eigenes Programm. Gerüchte über „Pakistan-Option" (Zugang zu pakistanischen Waffen im Kriegsfall). US-Schutzschirm wird als ausreichend erachtet.',
  },
  industry: {
    selfSufficiencyRating: 8,
    keyDomesticSystems: ['SAMI (Saudi Arabian Military Industries) — im Aufbau'],
    majorImportPartners: ['USA', 'UK', 'Frankreich', 'Spanien', 'Deutschland'],
    majorExportPartners: [],
    note: 'Nahezu vollständig importabhängig. Größter Waffenimporteur weltweit 2019-2023 (SIPRI). Vision-2030-Ziel: 50% Lokalisierung bis 2030.',
  },
  forceStructure: [
    { category: 'Landstreitkräfte', qualityNote: 'Westliche Spitzensysteme, aber begrenzte Kampferfahrung. Jemen-Krieg zeigte operative Schwächen.', systems: [
      cws('M1A2S Abrams', 442, 'USA', 'Aktiv', IISS, IISS_L, '3.+ Gen', 'Saudische Sondervariante'),
      cws('AMX-30S', 290, 'Frankreich', 'Reserve', IISS, IISS_L, '2. Gen'),
      cws('M2A2 Bradley IFV', 400, 'USA', 'Aktiv', IISS, IISS_L),
      cws('LAV-25 / Piranha', 1100, 'Kanada/Schweiz', 'Aktiv', IISS, IISS_L),
      cws('Caesar 155mm SPH', 132, 'Frankreich', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', qualityNote: 'Stärkste Luftwaffe am Golf. F-15SA ist das modernste F-15-Derivat weltweit. Aber Abhängigkeit von US-Wartung.', systems: [
      cws('F-15SA Eagle II', 84, 'USA', 'Aktiv', WP('Boeing_F-15SA'), WP_L('F-15SA'), '4.++ Gen', 'Modernstes F-15-Derivat, AESA Radar'),
      cws('F-15S/C/D Eagle', 70, 'USA', 'Aktiv', IISS, IISS_L, '4. Gen'),
      cws('Eurofighter Typhoon', 72, 'EU (BAE/Airbus)', 'Aktiv', IISS, IISS_L, '4.+ Gen'),
      cws('Tornado IDS', 62, 'EU (Panavia)', 'Aktiv (Auslauf)', IISS, IISS_L, '3.+ Gen'),
      cws('AH-64E Apache', 36, 'USA', 'Aktiv', IISS, IISS_L),
      cws('Wing Loong II UCAV', 12, 'China', 'Aktiv', IISS, IISS_L, 'MALE UCAV'),
    ]},
    { category: 'Marine', qualityNote: 'Im Aufbau. Neue Fregatten aus Spanien (Avante 2200). Bisher kaum Hochsee-Fähigkeit.', systems: [
      cws('Al-Riyadh-Klasse Fregatte', 3, 'Frankreich', 'Aktiv', IISS, IISS_L),
      cws('Avante 2200 Korvette', 5, 'Spanien (Navantia)', 'Zulauf', IISS, IISS_L, 'Neu'),
      cws('Al-Badr FAC', 9, 'USA', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Raketenstreitkräfte', qualityNote: 'Starke Luftabwehr (Patriot + THAAD). DF-3A Altbestand aus China. Keine eigene Raketenproduktion.', systems: [
      cws('Patriot PAC-3 MSE', 16, 'USA', 'Aktiv', WP('MIM-104_Patriot'), WP_L('Patriot'), 'BMD-fähig', '16 Batterien'),
      cws('THAAD', 7, 'USA', 'Aktiv', WP('THAAD'), WP_L('THAAD'), 'Exoatmosphärisch', '7 Launcher'),
      cws('DF-3A (CSS-2) MRBM', 30, 'China (1987)', 'Reserve/Veraltet', IISS, IISS_L, 'MRBM, 2.650km', 'Aus den 1980ern, ggf. durch DF-21 ersetzt'),
    ]},
  ],
  overviewSource: GFP('saudi-arabia'), overviewSourceLabel: GFP_L('Saudi-Arabien'),
};

// ═══════════════════════════════════════════════════════════════
// TURKEY
// ═══════════════════════════════════════════════════════════════
const TR: GlobalMilitaryProfile = {
  id: 'TR', name: 'Türkei', flagEmoji: '🇹🇷', region: 'Naher Osten',
  activePersonnel: 355200, reservePersonnel: 378700, paramilitaryPersonnel: 156800,
  militaryBudget: 25900000000, budgetPercentGDP: 1.4, gfpRank: 8,
  conscription: true, conscriptionNote: 'Männer, 6 Monate (oder 1 Monat + Gebühr)',
  armedForcesName: 'Türkische Streitkräfte (Türk Silahlı Kuvvetleri)',
  nuclear: { hasWeapons: false, suspected: false, nptMember: true, note: 'NATO-Nuklearteilhabe: ~50 US B61-Bomben auf Incirlik AB. Kein eigenes Programm.' },
  doctrine: {
    strategicOrientation: 'Regionale Autonomie bei NATO-Mitgliedschaft. Eigenständige Interventionspolitik (Syrien, Libyen, Kaukasus). Aufbau unabhängiger Rüstungsindustrie als strategisches Kernziel.',
    keyAlliances: ['NATO', 'Aserbaidschan', 'Katar', 'Libyen (GNA)'],
    forceProjectionCapability: 'Regional',
    asymmetricCapabilities: ['Drohnen (Bayraktar TB2/Akıncı)', 'Proxy-Kräfte (SNA in Syrien)', 'Auslandsstützpunkte (Somalia, Katar, Libyen, Aserbaidschan)'],
    nuclearPosture: 'NATO-Nuklearteilhabe. B61-Bomben auf Incirlik, Einsatz durch türkische F-16 im Bündnisfall. Kein eigenes Programm, aber Erdoğan hat Interesse angedeutet.',
  },
  industry: {
    selfSufficiencyRating: 60,
    keyDomesticSystems: ['Bayraktar TB2 UCAV', 'Bayraktar Akıncı UCAV', 'Altay MBT', 'T129 ATAK Helikopter', 'KAAN (TF-X) 5.Gen-Jet', 'HISAR SAM', 'Milgem-Korvette', 'TCG Anadolu LHD'],
    majorImportPartners: ['USA (F-16)', 'Südkorea (K2-Technologie)', 'UK (Triebwerke)'],
    majorExportPartners: ['Ukraine', 'Polen', 'Pakistan', 'Aserbaidschan', 'Äthiopien', 'VAE'],
    note: 'Rasant wachsende Rüstungsindustrie. Baykar-Drohnen sind Exportschlager. KAAN 5.Gen-Jet im Erstflug (2024). Ziel: 75% Eigenversorgung bis 2030.',
  },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('Leopard 2A4', 354, 'Deutschland', 'Aktiv', IISS, IISS_L, '3.+ Gen'),
      cws('M60T Sabra', 170, 'USA/Israel (Upgrade)', 'Aktiv', IISS, IISS_L, '3. Gen'),
      cws('Altay MBT', 10, 'Eigenentwicklung', 'Serienzulauf', WP('Altay_(tank)'), WP_L('Altay'), '4. Gen', 'Basiert auf K2-Technologie'),
      cws('ACV-15 / FNSS', 2800, 'Eigenentwicklung/USA', 'Aktiv', IISS, IISS_L),
      cws('T-155 Fırtına SPH', 350, 'Eigenentwicklung (K9-Basis)', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('F-16C/D Block 50+', 245, 'USA', 'Aktiv', IISS, IISS_L, '4. Gen', 'Block 70 Upgrade genehmigt'),
      cws('F-4E 2020 Terminator', 30, 'USA (Upgrade ISR)', 'Aktiv (Auslauf)', IISS, IISS_L, '3. Gen'),
      cws('KAAN (TF-X)', 0, 'Eigenentwicklung (TAI)', 'Entwicklung', WP('TAI_TF_Kaan'), WP_L('KAAN'), '5. Gen', 'Erstflug Feb. 2024'),
      cws('Bayraktar TB2', 200, 'Eigenentwicklung (Baykar)', 'Aktiv', WP('Bayraktar_TB2'), WP_L('TB2'), 'MALE UCAV', 'Kampferprobt: Syrien, Libyen, Ukraine, Karabach'),
      cws('Bayraktar Akıncı', 24, 'Eigenentwicklung (Baykar)', 'Aktiv', WP('Bayraktar_Akıncı'), WP_L('Akıncı'), 'HALE UCAV', 'AESA-Radar, SOM-Marschflugkörper'),
      cws('T129 ATAK', 59, 'Eigenentwicklung (TAI)', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Marine', systems: [
      cws('TCG Anadolu (LHD)', 1, 'Eigenentwicklung (SEDEF)', 'Aktiv', WP('TCG_Anadolu'), WP_L('TCG Anadolu'), 'Drohnenträger', 'Weltweit erster Drohnenträger (TB3-fähig)'),
      cws('MILGEM Ada-Korvette', 4, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
      cws('I-Klasse Fregatte (MILGEM)', 1, 'Eigenentwicklung', 'Zulauf', WP('Istanbul-class_frigate'), WP_L('Istanbul-Klasse')),
      cws('Type 214 SSK', 6, 'Deutschland (HDW)', 'Aktiv', IISS, IISS_L),
      cws('Preveze-Klasse SSK', 4, 'Deutschland', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Raketenstreitkräfte', systems: [
      cws('S-400 Triumf', 2, 'Russland', 'Aktiv (eingelagert?)', WP('S-400_missile_system'), WP_L('S-400'), 'Langstrecke SAM', 'Führte zu US-Sanktionen (CAATSA)'),
      cws('HISAR-A/O SAM', 12, 'Eigenentwicklung (Aselsan/Roketsan)', 'Aktiv', WP('Hisar_(missile_family)'), WP_L('HISAR'), 'Kurz-/Mittelstrecke'),
      cws('SOM-A/B/J Marschflugkörper', 100, 'Eigenentwicklung (TÜBİTAK)', 'Aktiv', WP('SOM_(missile)'), WP_L('SOM'), '250-500km'),
    ]},
  ],
  overviewSource: GFP('turkey'), overviewSourceLabel: GFP_L('Türkei'),
};

// ═══════════════════════════════════════════════════════════════
// UAE
// ═══════════════════════════════════════════════════════════════
const AE: GlobalMilitaryProfile = {
  id: 'AE', name: 'VAE', flagEmoji: '🇦🇪', region: 'Naher Osten',
  activePersonnel: 63000, reservePersonnel: 0, paramilitaryPersonnel: 0,
  militaryBudget: 22800000000, budgetPercentGDP: 5.7, gfpRank: 36,
  conscription: true, conscriptionNote: 'Männer, 11 Monate (seit 2014)',
  armedForcesName: 'UAE Armed Forces (القوات المسلحة الإماراتية)',
  nuclear: { hasWeapons: false, suspected: false, nptMember: true, note: 'Ziviles AKW (Barakah, 4 Blöcke, koreanisches Design). Kein Waffenprogramm.' },
  doctrine: {
    strategicOrientation: 'Expeditionäre Fähigkeiten weit über Landesgröße. Kleine, hoch-professionelle Armee mit westlicher Ausrüstung. Fokus auf SOF und Luftwaffe.',
    keyAlliances: ['USA', 'Frankreich', 'Abraham-Abkommen (Israel)', 'Saudi-Arabien (GCC)'],
    forceProjectionCapability: 'Regional',
    asymmetricCapabilities: ['SOF (Presidential Guard)', 'Drohnen', 'Cyber', 'Auslandsstützpunkte (Eritrea, Sokotra, Berbera)'],
    nuclearPosture: 'Kein Nuklearprogramm. Zivile Kernenergie (Barakah). US-Sicherheitsgarantien.',
  },
  industry: {
    selfSufficiencyRating: 20,
    keyDomesticSystems: ['EDGE Group (Drohnen, Munition)', 'Rabdan IFV'],
    majorImportPartners: ['USA', 'Frankreich', 'Russland (bis 2022)', 'Südkorea'],
    majorExportPartners: ['Jordanien', 'Ägypten'],
    note: 'EDGE Group wächst rasant. Noch stark importabhängig, aber strategische Investitionen in Drohnen und autonome Systeme.',
  },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('Leclerc MBT', 388, 'Frankreich', 'Aktiv', IISS, IISS_L, '3.+ Gen', 'Kampferprobt Jemen'),
      cws('BMP-3', 700, 'Russland', 'Aktiv', IISS, IISS_L),
      cws('Rabdan IFV', 200, 'Eigenentwicklung/Türkei', 'Zulauf', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('F-16E/F Block 60 Desert Falcon', 55, 'USA', 'Aktiv', IISS, IISS_L, '4.+ Gen', 'AESA-Radar, einzigartiges Modell'),
      cws('Mirage 2000-9', 63, 'Frankreich', 'Aktiv', IISS, IISS_L, '4. Gen'),
      cws('AH-64E Apache', 28, 'USA', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Marine', systems: [
      cws('Baynunah-Korvette', 6, 'Frankreich/Eigenentwicklung', 'Aktiv', IISS, IISS_L),
      cws('Falaj-3 Korvette', 2, 'Eigenentwicklung', 'Zulauf', IISS, IISS_L),
    ]},
    { category: 'Raketenstreitkräfte', systems: [
      cws('Patriot PAC-3', 9, 'USA', 'Aktiv', IISS, IISS_L, 'BMD-fähig'),
      cws('THAAD', 2, 'USA', 'Aktiv', IISS, IISS_L, 'Exoatmosphärisch'),
    ]},
  ],
  overviewSource: GFP('united-arab-emirates'), overviewSourceLabel: GFP_L('VAE'),
};

// ═══════════════════════════════════════════════════════════════
// EGYPT
// ═══════════════════════════════════════════════════════════════
const EG: GlobalMilitaryProfile = {
  id: 'EG', name: 'Ägypten', flagEmoji: '🇪🇬', region: 'Naher Osten / Nordafrika',
  activePersonnel: 438500, reservePersonnel: 479000, paramilitaryPersonnel: 397000,
  militaryBudget: 4640000000, budgetPercentGDP: 1.2, gfpRank: 15,
  conscription: true, conscriptionNote: 'Männer, 12-36 Monate',
  armedForcesName: 'Ägyptische Streitkräfte (القوات المسلحة المصرية)',
  nuclear: { hasWeapons: false, suspected: false, nptMember: true },
  doctrine: {
    strategicOrientation: 'Größte arabische Armee. Dualität: Westliche + russische Systeme. Schwerpunkt auf Sinai-Sicherheit und Suezkanalschutz. Camp-David-Friedensvertrag mit Israel.',
    keyAlliances: ['USA ($1,3 Mrd FMF/Jahr)', 'Saudi-Arabien', 'VAE', 'Frankreich', 'Russland (Rüstung)'],
    forceProjectionCapability: 'Regional',
    asymmetricCapabilities: ['Suezkanal-Kontrolle', 'Zwei Mistral-LHD'],
    nuclearPosture: 'Kein Programm.',
  },
  industry: {
    selfSufficiencyRating: 15,
    keyDomesticSystems: ['M1A1 Abrams (Lizenzfertigung Helwan)', 'Fahd APC'],
    majorImportPartners: ['USA', 'Frankreich', 'Russland', 'Deutschland', 'Italien'],
    majorExportPartners: [],
    note: 'Diversifizierte Beschaffung aus West + Ost. M1A1 Abrams Lizenzbau. Rafale + MiG-29M nebeneinander = logistische Herausforderung.',
  },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('M1A1 Abrams', 1130, 'USA (Lizenz)', 'Aktiv', IISS, IISS_L, '3. Gen', 'Lokale Produktion in Helwan'),
      cws('M60A3 / Ramses II', 1960, 'USA', 'Aktiv (veraltet)', IISS, IISS_L, '2. Gen'),
      cws('M113A2 APC', 2900, 'USA', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('F-16C/D Block 40/52', 218, 'USA', 'Aktiv', IISS, IISS_L, '4. Gen', 'Größte F-16-Flotte in MENA'),
      cws('Dassault Rafale', 54, 'Frankreich', 'Zulauf', IISS, IISS_L, '4.+ Gen', '24 geliefert + 30 bestellt'),
      cws('MiG-29M/M2', 46, 'Russland', 'Aktiv', IISS, IISS_L, '4.+ Gen'),
      cws('Ka-52 Alligator', 46, 'Russland', 'Aktiv', IISS, IISS_L),
      cws('AH-64D Apache', 46, 'USA', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Marine', systems: [
      cws('Mistral-Klasse LHD', 2, 'Frankreich', 'Aktiv', IISS, IISS_L, 'Ex-russische Bestellung'),
      cws('FREMM-Fregatte', 2, 'Frankreich/Italien', 'Aktiv', IISS, IISS_L),
      cws('Type 209/1400mod SSK', 4, 'Deutschland (TKMS)', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Raketenstreitkräfte', systems: [
      cws('S-300VM Antey-2500', 1, 'Russland', 'Aktiv', IISS, IISS_L, 'System/Batterie'),
      cws('Patriot PAC-3', 0, 'USA', 'Angefragt', IISS, IISS_L),
    ]},
  ],
  overviewSource: GFP('egypt'), overviewSourceLabel: GFP_L('Ägypten'),
};

// ═══════════════════════════════════════════════════════════════
// IRAQ
// ═══════════════════════════════════════════════════════════════
const IQ: GlobalMilitaryProfile = {
  id: 'IQ', name: 'Irak', flagEmoji: '🇮🇶', region: 'Naher Osten',
  activePersonnel: 193000, reservePersonnel: 0, paramilitaryPersonnel: 145000,
  militaryBudget: 7300000000, budgetPercentGDP: 3.1, gfpRank: 34,
  conscription: false,
  armedForcesName: 'Irakische Streitkräfte (القوات المسلحة العراقية)',
  nuclear: { hasWeapons: false, suspected: false, nptMember: true },
  doctrine: {
    strategicOrientation: 'Im Wiederaufbau seit ISIS-Niederlage 2017. Balanceakt zwischen US-Einfluss und iranischem PMF-Netzwerk. Fokus auf Counterterrorism.',
    keyAlliances: ['USA (Ausbildung)', 'Iran (PMF/Milizen)', 'NATO Training Mission'],
    forceProjectionCapability: 'Keine',
    asymmetricCapabilities: ['PMF (Hashd al-Shaabi) — teils iranisch kontrolliert', 'CTS (Counter Terrorism Service, US-ausgebildet)'],
    nuclearPosture: 'Kein Programm. Osirak/Tammuz zerstört 1981 (Israel).',
  },
  industry: { selfSufficiencyRating: 2, keyDomesticSystems: [], majorImportPartners: ['USA', 'Russland', 'Südkorea'], majorExportPartners: [], note: 'Vollständig importabhängig. Beschaffung aus USA und Russland parallel.' },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('M1A1M Abrams', 146, 'USA', 'Aktiv', IISS, IISS_L, '3. Gen', 'Viele beschädigt/verloren im ISIS-Krieg'),
      cws('T-72M1', 250, 'Russland', 'Aktiv', IISS, IISS_L, '2. Gen'),
      cws('M113 / BTR-80', 1500, 'USA/Russland', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('F-16C/D Block 52', 34, 'USA', 'Aktiv', IISS, IISS_L, '4. Gen'),
      cws('Su-25 Frogfoot', 12, 'Russland', 'Aktiv', IISS, IISS_L, 'CAS'),
      cws('T-50 Golden Eagle', 24, 'Südkorea', 'Aktiv', IISS, IISS_L, 'Trainer/Light Attack'),
    ]},
    { category: 'Marine', systems: [
      cws('Küstenschutzboote', 15, 'Diverse', 'Aktiv', IISS, IISS_L, 'Küste nur'),
    ]},
    { category: 'Raketenstreitkräfte', systems: [
      cws('HAWK / Avenger SAM', 6, 'USA', 'Aktiv', IISS, IISS_L, 'Veraltet'),
    ]},
  ],
  overviewSource: GFP('iraq'), overviewSourceLabel: GFP_L('Irak'),
};

// ═══════════════════════════════════════════════════════════════
// JORDAN
// ═══════════════════════════════════════════════════════════════
const JO: GlobalMilitaryProfile = {
  id: 'JO', name: 'Jordanien', flagEmoji: '🇯🇴', region: 'Naher Osten',
  activePersonnel: 100500, reservePersonnel: 65000, paramilitaryPersonnel: 15000,
  militaryBudget: 2500000000, budgetPercentGDP: 4.8, gfpRank: 60,
  conscription: false,
  armedForcesName: 'Jordanische Streitkräfte (القوات المسلحة الأردنية)',
  nuclear: { hasWeapons: false, suspected: false, nptMember: true },
  doctrine: {
    strategicOrientation: 'Stabilisierungsfokus. Pufferrolle zwischen Israel, Syrien, Irak. Stark US-unterstützt. Elitäre SOF (KASOTC Ausbildungszentrum).',
    keyAlliances: ['USA (Major Non-NATO Ally)', 'Israel (Friedensvertrag)', 'Saudi-Arabien', 'UK'],
    forceProjectionCapability: 'Begrenzt',
    asymmetricCapabilities: ['SOF (weltweit anerkannt, KASOTC)', 'Grenzschutz (Syrien/Irak)'],
    nuclearPosture: 'Kein Programm.',
  },
  industry: { selfSufficiencyRating: 5, keyDomesticSystems: ['KADDB Fahrzeug-Upgrades'], majorImportPartners: ['USA', 'UK', 'Niederlande'], majorExportPartners: [], note: 'Kleine aber professionelle Streitkräfte. KASOTC ist eines der besten SOF-Trainingszentren weltweit.' },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('Challenger 1 (Al-Hussein)', 390, 'UK', 'Aktiv', IISS, IISS_L, '3. Gen'),
      cws('M60A3', 182, 'USA', 'Aktiv', IISS, IISS_L, '2. Gen'),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('F-16A/B MLU', 60, 'USA/Niederlande/Belgien', 'Aktiv', IISS, IISS_L, '4. Gen'),
      cws('AH-1F Cobra', 25, 'USA', 'Aktiv', IISS, IISS_L),
      cws('UH-60 Black Hawk', 12, 'USA', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Marine', systems: [
      cws('Schnellboote', 5, 'Diverse', 'Aktiv', IISS, IISS_L, 'Aqaba-Küste nur'),
    ]},
    { category: 'Raketenstreitkräfte', systems: [
      cws('HAWK / I-HAWK', 4, 'USA', 'Aktiv', IISS, IISS_L),
    ]},
  ],
  overviewSource: GFP('jordan'), overviewSourceLabel: GFP_L('Jordanien'),
};

// ═══════════════════════════════════════════════════════════════
// NIGERIA
// ═══════════════════════════════════════════════════════════════
const NG: GlobalMilitaryProfile = {
  id: 'NG', name: 'Nigeria', flagEmoji: '🇳🇬', region: 'Westafrika',
  activePersonnel: 223000, reservePersonnel: 0, paramilitaryPersonnel: 80000,
  militaryBudget: 2600000000, budgetPercentGDP: 0.6, gfpRank: 30,
  conscription: false,
  armedForcesName: 'Nigerian Armed Forces',
  nuclear: { hasWeapons: false, suspected: false, nptMember: true },
  doctrine: {
    strategicOrientation: 'Regionale Führungsmacht Westafrikas (ECOWAS). Counterinsurgency gegen Boko Haram/ISWAP im Nordosten. Niger-Delta-Sicherheit.',
    keyAlliances: ['ECOWAS', 'USA (Ausbildung)', 'UK', 'AU'],
    forceProjectionCapability: 'Regional',
    asymmetricCapabilities: ['ECOWAS-Truppensteller', 'Marine (Golf von Guinea Piraterie)'],
    nuclearPosture: 'Kein Programm.',
  },
  industry: { selfSufficiencyRating: 3, keyDomesticSystems: ['Proforce Ara APC (gepanzertes Fahrzeug)'], majorImportPartners: ['China', 'Pakistan', 'Russland', 'Türkei', 'USA'], majorExportPartners: [], note: 'Stark importabhängig. Zunehmend türkische und chinesische Systeme statt westlicher.' },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('T-72M1 / VT-4', 92, 'Russland / China', 'Aktiv', IISS, IISS_L, '2./3. Gen'),
      cws('Vickers Mk.3', 100, 'UK', 'Reserve', IISS, IISS_L, '2. Gen'),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('JF-17 Thunder', 3, 'Pakistan/China', 'Zulauf', IISS, IISS_L, '4. Gen', '3 geliefert, Bestellung für mehr'),
      cws('Super Tucano A-29', 12, 'USA/Brasilien', 'Aktiv', IISS, IISS_L, 'COIN/Light Attack'),
      cws('Wing Loong II UCAV', 6, 'China', 'Aktiv', IISS, IISS_L, 'ISR/Strike'),
      cws('Bayraktar TB2', 6, 'Türkei', 'Aktiv', IISS, IISS_L, 'UCAV'),
    ]},
    { category: 'Marine', systems: [
      cws('Hamilton-Klasse Cutter', 2, 'USA (ex-USCG)', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Raketenstreitkräfte', systems: [
      cws('SA-3 / Rapier', 10, 'Russland/UK', 'Aktiv (veraltet)', IISS, IISS_L),
    ]},
  ],
  overviewSource: GFP('nigeria'), overviewSourceLabel: GFP_L('Nigeria'),
};

// ═══════════════════════════════════════════════════════════════
// ETHIOPIA
// ═══════════════════════════════════════════════════════════════
const ET: GlobalMilitaryProfile = {
  id: 'ET', name: 'Äthiopien', flagEmoji: '🇪🇹', region: 'Ostafrika',
  activePersonnel: 162000, reservePersonnel: 0, paramilitaryPersonnel: 200000,
  militaryBudget: 1000000000, budgetPercentGDP: 0.8, gfpRank: 46,
  conscription: false,
  armedForcesName: 'Ethiopian National Defense Force (ENDF)',
  nuclear: { hasWeapons: false, suspected: false, nptMember: true },
  doctrine: {
    strategicOrientation: 'Größte Armee Ostafrikas. Tigray-Krieg (2020-2022) zeigte Stärken und Schwächen. AU-Peacekeeping-Hauptsteller. Drohnen als Game-Changer.',
    keyAlliances: ['AU', 'China (Rüstung)', 'VAE/Türkei (Drohnen)', 'Eritrea (temporär)'],
    forceProjectionCapability: 'Regional',
    asymmetricCapabilities: ['Drohnen (TB2, Wing Loong)', 'Massenrekrutierung', 'AU Friedensmissionen'],
    nuclearPosture: 'Kein Programm.',
  },
  industry: { selfSufficiencyRating: 2, keyDomesticSystems: [], majorImportPartners: ['China', 'Russland', 'Türkei', 'VAE', 'Ukraine'], majorExportPartners: [], note: 'Vollständig importabhängig. TB2-Drohnen im Tigray-Krieg entscheidend eingesetzt.' },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('T-72B1', 200, 'Russland/Ukraine', 'Aktiv', IISS, IISS_L, '2.+ Gen'),
      cws('BMP-1/2', 350, 'Russland', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('Su-27/Su-30', 18, 'Russland', 'Aktiv', IISS, IISS_L, '4. Gen'),
      cws('Bayraktar TB2', 8, 'Türkei', 'Aktiv', IISS, IISS_L, 'UCAV', 'Entscheidend im Tigray-Krieg'),
      cws('Wing Loong I', 4, 'China', 'Aktiv', IISS, IISS_L, 'UCAV'),
      cws('Mi-24/35 Hind', 20, 'Russland', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Marine', systems: [] },
    { category: 'Raketenstreitkräfte', systems: [
      cws('SA-3 / SA-6', 6, 'Russland', 'Aktiv (veraltet)', IISS, IISS_L),
    ]},
  ],
  overviewSource: GFP('ethiopia'), overviewSourceLabel: GFP_L('Äthiopien'),
};

// ═══════════════════════════════════════════════════════════════
// SOUTH AFRICA
// ═══════════════════════════════════════════════════════════════
const ZA: GlobalMilitaryProfile = {
  id: 'ZA', name: 'Südafrika', flagEmoji: '🇿🇦', region: 'Südliches Afrika',
  activePersonnel: 73000, reservePersonnel: 15000, paramilitaryPersonnel: 0,
  militaryBudget: 3500000000, budgetPercentGDP: 0.8, gfpRank: 33,
  conscription: false,
  armedForcesName: 'South African National Defence Force (SANDF)',
  nuclear: { hasWeapons: false, suspected: false, nptMember: true, note: 'Einziges Land, das Atomwaffen freiwillig aufgab (6 Sprengköpfe, abgebaut 1989-1991).' },
  doctrine: {
    strategicOrientation: 'Post-Apartheid-Umbau führte zu massivem Kapazitätsverlust. AU/SADC-Peacekeeping. Budget-Unterfinanzierung seit 20+ Jahren.',
    keyAlliances: ['SADC', 'AU', 'BRICS'],
    forceProjectionCapability: 'Begrenzt',
    asymmetricCapabilities: ['Rüstungsindustrie (Denel)', 'Peacekeeping-Erfahrung'],
    nuclearPosture: 'Einzige Nation, die Atomwaffen freiwillig aufgab. Aktiver Abrüstungsverfechter.',
  },
  industry: { selfSufficiencyRating: 35, keyDomesticSystems: ['Rooivalk Kampfhubschrauber', 'Ratel IFV', 'G6 Rhino SPH', 'Badger IFV', 'A-Darter AAM', 'Milkor MGL'], majorImportPartners: ['Schweden (Gripen)', 'Deutschland (U-Boote)', 'UK'], majorExportPartners: ['Diverse (Denel-Produkte)'], note: 'Denel in finanzieller Krise. Ehemals weltweit führend bei Artillerie (G6) und Minenfahrzeugen. Gripen-Beschaffung politisch umstritten.' },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('Olifant Mk.2', 172, 'Eigenentwicklung', 'Reserve', IISS, IISS_L, '2. Gen', 'Centurion-basiert'),
      cws('Ratel IFV', 500, 'Eigenentwicklung', 'Aktiv/Reserve', IISS, IISS_L),
      cws('Badger IFV', 80, 'Eigenentwicklung (Patria-Lizenz)', 'Zulauf', IISS, IISS_L),
      cws('G6 Rhino 155mm SPH', 43, 'Eigenentwicklung (Denel)', 'Aktiv', IISS, IISS_L, 'Weltweit geachtet'),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('JAS 39C/D Gripen', 26, 'Schweden (Saab)', 'Aktiv', IISS, IISS_L, '4.+ Gen', 'Nur ~12 flugfähig wegen Budget'),
      cws('Rooivalk CSH', 11, 'Eigenentwicklung (Denel)', 'Aktiv', IISS, IISS_L, 'Kampfhubschrauber'),
    ]},
    { category: 'Marine', systems: [
      cws('Valour-Klasse Fregatte (MEKO A-200)', 4, 'Deutschland (Blohm+Voss)', 'Aktiv', IISS, IISS_L),
      cws('Type 209/1400 SSK', 3, 'Deutschland (HDW)', 'Aktiv', IISS, IISS_L, '1 einsatzbereit'),
    ]},
    { category: 'Raketenstreitkräfte', systems: [
      cws('Umkhonto VL SAM', 32, 'Eigenentwicklung (Denel)', 'Aktiv', IISS, IISS_L, 'Schiffsgestützt'),
    ]},
  ],
  overviewSource: GFP('south-africa'), overviewSourceLabel: GFP_L('Südafrika'),
};

// ═══════════════════════════════════════════════════════════════
// ALGERIA
// ═══════════════════════════════════════════════════════════════
const DZ: GlobalMilitaryProfile = {
  id: 'DZ', name: 'Algerien', flagEmoji: '🇩🇿', region: 'Nordafrika',
  activePersonnel: 130000, reservePersonnel: 150000, paramilitaryPersonnel: 187000,
  militaryBudget: 18300000000, budgetPercentGDP: 9.8, gfpRank: 26,
  conscription: true, conscriptionNote: 'Männer, 12 Monate',
  armedForcesName: 'Nationale Volksarmee (الجيش الوطني الشعبي الجزائري)',
  nuclear: { hasWeapons: false, suspected: false, nptMember: true },
  doctrine: {
    strategicOrientation: 'Russischer Hauptkunde in Afrika. Rivalität mit Marokko (Westsahara). Non-Interventionismus, aber größtes Militärbudget Afrikas.',
    keyAlliances: ['Russland (Hauptwaffenlieferant)', 'China', 'Nicht-Einmischungspolitik'],
    forceProjectionCapability: 'Begrenzt',
    asymmetricCapabilities: ['Große Armee', 'Anti-Terror (Sahel-Grenze)'],
    nuclearPosture: 'Kein Programm. Forschungsreaktor (Es Salam, argentinische Bauart).',
  },
  industry: { selfSufficiencyRating: 8, keyDomesticSystems: ['Fahrzeug-Modernisierungen'], majorImportPartners: ['Russland (70%+)', 'China', 'Deutschland', 'Italien'], majorExportPartners: [], note: 'Zweitgrößter Waffenimporteur Afrikas. Fast ausschließlich russische Systeme. Su-57-Interesse bekundet.' },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('T-90SA', 572, 'Russland', 'Aktiv', IISS, IISS_L, '3.+ Gen', 'Größte T-90-Flotte außerhalb Russlands'),
      cws('T-72M/B', 350, 'Russland', 'Aktiv/Reserve', IISS, IISS_L),
      cws('BMP-2 / BTR-80A', 1000, 'Russland', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('Su-30MKA', 58, 'Russland', 'Aktiv', IISS, IISS_L, '4.+ Gen', 'Modernste Kampfjets in Afrika'),
      cws('MiG-29SMT', 36, 'Russland', 'Aktiv', IISS, IISS_L, '4. Gen'),
      cws('Su-24MK2', 20, 'Russland', 'Aktiv', IISS, IISS_L, 'Bomber'),
      cws('Mi-28NE Night Hunter', 42, 'Russland', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Marine', systems: [
      cws('Kilo-Klasse SSK', 4, 'Russland', 'Aktiv', IISS, IISS_L, 'Klub-S Marschflugkörper'),
      cws('MEKO A-200 Fregatte', 2, 'Deutschland', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Raketenstreitkräfte', systems: [
      cws('S-300PMU-2', 8, 'Russland', 'Aktiv', IISS, IISS_L, 'Langstrecke SAM', '8 Batterien'),
      cws('Buk-M2 SAM', 4, 'Russland', 'Aktiv', IISS, IISS_L, 'Mittelstrecke'),
      cws('Iskander-E (SS-26)', 3, 'Russland', 'Aktiv', IISS, IISS_L, 'Taktische ballistische Rakete, 280km', 'Einziger afrikanischer Betreiber'),
    ]},
  ],
  overviewSource: GFP('algeria'), overviewSourceLabel: GFP_L('Algerien'),
};

// ═══════════════════════════════════════════════════════════════
// MOROCCO
// ═══════════════════════════════════════════════════════════════
const MA: GlobalMilitaryProfile = {
  id: 'MA', name: 'Marokko', flagEmoji: '🇲🇦', region: 'Nordafrika',
  activePersonnel: 195800, reservePersonnel: 150000, paramilitaryPersonnel: 50000,
  militaryBudget: 5400000000, budgetPercentGDP: 4.2, gfpRank: 53,
  conscription: true, conscriptionNote: 'Männer und Frauen, 12 Monate (seit 2019)',
  armedForcesName: 'Forces Armées Royales (القوات المسلحة الملكية)',
  nuclear: { hasWeapons: false, suspected: false, nptMember: true },
  doctrine: {
    strategicOrientation: 'Westsahara-Kontrolle als strategisches Kernziel. US-Hauptalliierter in Nordafrika (MNNA). Rivalität mit Algerien. Abraham-Abkommen mit Israel.',
    keyAlliances: ['USA (MNNA)', 'Israel (Abraham-Abkommen)', 'Frankreich', 'Saudi-Arabien'],
    forceProjectionCapability: 'Begrenzt',
    asymmetricCapabilities: ['Westsahara-Mauer (Sandwall)', 'Drohnen (TB2, Heron)'],
    nuclearPosture: 'Kein Programm.',
  },
  industry: { selfSufficiencyRating: 5, keyDomesticSystems: [], majorImportPartners: ['USA', 'Frankreich', 'Israel', 'Türkei'], majorExportPartners: [], note: 'Massive Modernisierung: M1A2 Abrams bestellt, F-16V genehmigt. Israel-Kooperation bei Drohnen und Cyber.' },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('M1A1 SA Abrams', 222, 'USA', 'Aktiv', IISS, IISS_L, '3. Gen', 'M1A2 SEPv3 bestellt (je nach Quelle)'),
      cws('VT-1A', 150, 'China', 'Aktiv', IISS, IISS_L, '3. Gen'),
      cws('M113 / M577', 600, 'USA', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('F-16C/D Block 52+', 23, 'USA', 'Aktiv', IISS, IISS_L, '4. Gen', '25 F-16V Block 72 bestellt'),
      cws('Mirage F1', 17, 'Frankreich', 'Aktiv (Auslauf)', IISS, IISS_L, '3. Gen'),
      cws('Bayraktar TB2', 13, 'Türkei', 'Aktiv', IISS, IISS_L, 'UCAV'),
      cws('IAI Heron', 4, 'Israel', 'Aktiv', IISS, IISS_L, 'ISR'),
    ]},
    { category: 'Marine', systems: [
      cws('FREMM-Fregatte', 1, 'Frankreich', 'Aktiv', IISS, IISS_L, 'Mohammed VI-Klasse'),
      cws('Sigma-Korvette', 3, 'Niederlande (Damen)', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Raketenstreitkräfte', systems: [
      cws('HAWK / I-HAWK', 6, 'USA', 'Aktiv', IISS, IISS_L),
    ]},
  ],
  overviewSource: GFP('morocco'), overviewSourceLabel: GFP_L('Marokko'),
};

// ═══════════════════════════════════════════════════════════════
// KENYA
// ═══════════════════════════════════════════════════════════════
const KE: GlobalMilitaryProfile = {
  id: 'KE', name: 'Kenia', flagEmoji: '🇰🇪', region: 'Ostafrika',
  activePersonnel: 24100, reservePersonnel: 0, paramilitaryPersonnel: 5000,
  militaryBudget: 1200000000, budgetPercentGDP: 1.1, gfpRank: 77,
  conscription: false,
  armedForcesName: 'Kenya Defence Forces (KDF)',
  nuclear: { hasWeapons: false, suspected: false, nptMember: true },
  doctrine: {
    strategicOrientation: 'Anti-Al-Shabaab (Operation Linda Nchi → AMISOM/ATMIS). US-Partner für Ostafrika-Sicherheit. Marinebasis Mombasa strategisch wichtig.',
    keyAlliances: ['USA', 'UK', 'AU (ATMIS/Somalia)'],
    forceProjectionCapability: 'Begrenzt',
    asymmetricCapabilities: ['COIN-Erfahrung (Somalia)', 'Ranger-Einheiten'],
    nuclearPosture: 'Kein Programm.',
  },
  industry: { selfSufficiencyRating: 1, keyDomesticSystems: [], majorImportPartners: ['USA', 'UK', 'Südafrika', 'Jordanien'], majorExportPartners: [], note: 'Kleine, aber kampferprobte Armee (Somalia-Einsatz seit 2011). Stark von westlicher Ausbildung und Ausrüstung abhängig.' },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('Vickers Mk.3', 76, 'UK', 'Aktiv (veraltet)', IISS, IISS_L, '2. Gen'),
      cws('AML-60/90', 72, 'Frankreich', 'Aktiv', IISS, IISS_L),
      cws('WZ-551 / BTR-80', 100, 'China/Russland', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('F-5E/F Tiger II', 10, 'USA', 'Aktiv (veraltet)', IISS, IISS_L, '2. Gen'),
      cws('MD 500 Defender', 15, 'USA', 'Aktiv', IISS, IISS_L, 'Light Attack'),
    ]},
    { category: 'Marine', systems: [
      cws('Schnellboote / Patrouillenboote', 8, 'Diverse', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Raketenstreitkräfte', systems: [] },
  ],
  overviewSource: GFP('kenya'), overviewSourceLabel: GFP_L('Kenia'),
};

// ═══════════════════════════════════════════════════════════════
// USA
// ═══════════════════════════════════════════════════════════════
const US: GlobalMilitaryProfile = {
  id: 'US', name: 'USA', flagEmoji: '🇺🇸', region: 'Großmacht',
  activePersonnel: 1328000, reservePersonnel: 742000, paramilitaryPersonnel: 0,
  militaryBudget: 916000000000, budgetPercentGDP: 3.5, gfpRank: 1,
  conscription: false,
  armedForcesName: 'United States Armed Forces',
  nuclear: { hasWeapons: true, suspected: false, warheadsEstimate: 5244, deliverySystems: ['Minuteman III ICBM', 'Trident II SLBM', 'B-2/B-52 Bomber', 'F-35A (B61-12)'], nptMember: true, note: '~1.670 strategisch stationiert. Nukleartriade. Modernisierung: Sentinel ICBM, Columbia SSBN, B-21 Raider.' },
  doctrine: {
    strategicOrientation: 'Globale Machtprojektion über 750+ Stützpunkte weltweit. Fähigkeit zu zwei gleichzeitigen Regionalkonflikten. Joint-All-Domain Operations.',
    keyAlliances: ['NATO', 'Five Eyes', 'AUKUS', 'Japan', 'Südkorea', 'Israel', 'Saudi-Arabien', 'GCC'],
    forceProjectionCapability: 'Global',
    asymmetricCapabilities: ['11 Flugzeugträger-Kampfgruppen', 'Cyber Command', 'Space Force', 'SOF/JSOC', 'ISR-Dominanz', 'GPS-Monopol'],
    nuclearPosture: 'Nukleartriade (Land/See/Luft). First-Use nicht ausgeschlossen. Mineman III → Sentinel, Ohio SSBN → Columbia. B61-12 Gravity Bomb. ~5.244 Sprengköpfe.',
  },
  industry: {
    selfSufficiencyRating: 95,
    keyDomesticSystems: ['F-35 Lightning II', 'F-22 Raptor', 'B-21 Raider', 'M1A2 SEPv3 Abrams', 'Arleigh Burke DDG', 'Ford CVN', 'Columbia SSBN', 'Virginia SSN', 'Patriot/THAAD', 'MQ-9 Reaper', 'Javelin ATGM'],
    majorImportPartners: [],
    majorExportPartners: ['Weltweit: 40% der globalen Rüstungsexporte (SIPRI)'],
    note: 'Weltweit größte Rüstungsindustrie: Lockheed Martin, Boeing, Raytheon, Northrop Grumman, General Dynamics. ~$250 Mrd Jahresumsatz. F-35 = größtes Rüstungsprogramm der Geschichte ($1,7 Billionen Lebenszykluskosten).',
  },
  forceStructure: [
    { category: 'Landstreitkräfte', qualityNote: 'Technologisch weltweit führend. Abrams SEPv3 + Trophy APS. Aber Quantität zugunsten High-Tech reduziert.', systems: [
      cws('M1A2 SEPv3 Abrams', 2509, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '3.++ Gen', '~6.000 total inkl. Reserve/M1A1'),
      cws('M2A3/A4 Bradley IFV', 4600, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
      cws('Stryker ICV', 4500, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
      cws('M109A7 Paladin SPH', 580, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
      cws('M142 HIMARS', 500, 'Eigenentwicklung', 'Aktiv', WP('M142_HIMARS'), WP_L('HIMARS'), 'Kampferprobt UA'),
    ]},
    { category: 'Luftwaffe', qualityNote: 'Unangefochtene Luftüberlegenheit. Einzige Armee mit 5th-Gen-Stealth in Masse (F-35 + F-22). ~5.200 Flugzeuge total.', systems: [
      cws('F-35A/B/C Lightning II', 630, 'Eigenentwicklung (LM)', 'Aktiv/Zulauf', WP('Lockheed_Martin_F-35_Lightning_II'), WP_L('F-35'), '5. Gen', '2.456 bestellt für alle Teilstreitkräfte'),
      cws('F-22A Raptor', 186, 'Eigenentwicklung (LM)', 'Aktiv', WP('Lockheed_Martin_F-22_Raptor'), WP_L('F-22'), '5. Gen', 'Luftüberlegenheit, Produktion eingestellt'),
      cws('F-15E/EX Strike Eagle/Eagle II', 218, 'Eigenentwicklung (Boeing)', 'Aktiv', IISS, IISS_L, '4.++ Gen'),
      cws('F-16C/D Fighting Falcon', 936, 'Eigenentwicklung (LM)', 'Aktiv', IISS, IISS_L, '4. Gen'),
      cws('F/A-18E/F Super Hornet', 540, 'Eigenentwicklung (Boeing)', 'Aktiv', IISS, IISS_L, '4.+ Gen', 'Navy/Marines'),
      cws('B-2A Spirit Stealth Bomber', 20, 'Eigenentwicklung (NG)', 'Aktiv', IISS, IISS_L, 'Strategischer Bomber'),
      cws('B-21 Raider', 6, 'Eigenentwicklung (NG)', 'Zulauf', WP('Northrop_Grumman_B-21_Raider'), WP_L('B-21'), '6. Gen Bomber', '100+ geplant'),
      cws('B-52H Stratofortress', 76, 'Eigenentwicklung (Boeing)', 'Aktiv', IISS, IISS_L, 'Strategischer Bomber', 'Im Dienst seit 1955, bis 2050+ geplant'),
      cws('AH-64E Apache', 690, 'Eigenentwicklung (Boeing)', 'Aktiv', IISS, IISS_L),
      cws('MQ-9 Reaper', 300, 'Eigenentwicklung (GA-ASI)', 'Aktiv', IISS, IISS_L, 'MALE UCAV'),
    ]},
    { category: 'Marine', qualityNote: 'Größte Marine der Welt. 11 Supercarrier = mehr als alle anderen Nationen zusammen. 70+ SSN/SSBN.', systems: [
      cws('Nimitz/Ford-Klasse CVN', 11, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Supercarrier', '~90 Flugzeuge pro Träger'),
      cws('Arleigh Burke-Klasse DDG', 73, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Aegis DDG, 96 VLS'),
      cws('Ticonderoga-Klasse CG', 22, 'Eigenentwicklung', 'Aktiv (Auslauf)', IISS, IISS_L, 'Aegis CG, 122 VLS'),
      cws('Virginia-Klasse SSN', 23, 'Eigenentwicklung', 'Aktiv/Zulauf', IISS, IISS_L, 'Block V mit VPM'),
      cws('Los Angeles-Klasse SSN', 28, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
      cws('Ohio-Klasse SSBN', 14, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '4 SSGN + 14 SSBN', 'Je 24 Trident II SLBM (SSBN) / 154 TLAM (SSGN)'),
      cws('America/Wasp-Klasse LHA/LHD', 9, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Amphibisch'),
    ]},
    { category: 'Raketenstreitkräfte', qualityNote: 'Multi-Layer BMD: THAAD, Aegis BMD, Patriot, GMD. Nukleartriade in Modernisierung.', systems: [
      cws('Minuteman III ICBM', 400, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'ICBM, 13.000km', 'Wird durch Sentinel ersetzt'),
      cws('Trident II D5 SLBM', 280, 'Eigenentwicklung (LM)', 'Aktiv', IISS, IISS_L, 'SLBM, 12.000km', 'Ohio-Klasse SSBN'),
      cws('THAAD', 7, 'Eigenentwicklung (LM)', 'Aktiv', IISS, IISS_L, '7 Batterien'),
      cws('Patriot PAC-3 MSE', 60, 'Eigenentwicklung (RTX)', 'Aktiv', IISS, IISS_L, '60+ Batterien'),
      cws('Aegis BMD (SM-3/SM-6)', 40, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Seegestützt', '40+ BMD-fähige Schiffe'),
      cws('Tomahawk TLAM', 4000, 'Eigenentwicklung (RTX)', 'Aktiv', IISS, IISS_L, 'Marschflugkörper, 1.600km'),
    ]},
  ],
  overviewSource: GFP('united-states-of-america'), overviewSourceLabel: GFP_L('USA'),
};

// ═══════════════════════════════════════════════════════════════
// RUSSIA
// ═══════════════════════════════════════════════════════════════
const RU: GlobalMilitaryProfile = {
  id: 'RU', name: 'Russland', flagEmoji: '🇷🇺', region: 'Großmacht',
  activePersonnel: 1320000, reservePersonnel: 250000, paramilitaryPersonnel: 554000,
  militaryBudget: 109000000000, budgetPercentGDP: 6.8, gfpRank: 2,
  conscription: true, conscriptionNote: 'Männer, 12 Monate',
  armedForcesName: 'Streitkräfte der Russischen Föderation (ВС РФ)',
  nuclear: { hasWeapons: true, suspected: false, warheadsEstimate: 5977, deliverySystems: ['RS-28 Sarmat ICBM', 'Topol-M/Yars ICBM', 'Bulawa SLBM', 'Tu-160/Tu-95 Bomber', 'Kinzhal ALBM'], nptMember: true, note: 'Größtes Nukleararsenal weltweit. ~1.674 strategisch stationiert. Modernisierung: Sarmat, Avangard HGV, Poseidon UUV.' },
  doctrine: {
    strategicOrientation: 'Nukleardominanz als Gleichgewicht zu konventioneller Unterlegenheit vs. NATO. „Escalate to de-escalate". A2/AD (Bastionen: Kaliningrad, Krim, Syrien). Hybrid Warfare.',
    keyAlliances: ['OVKS/CSTO', 'China (strategische Partnerschaft)', 'Belarus', 'Syrien', 'Iran (begrenzt)', 'Nordkorea'],
    forceProjectionCapability: 'Global',
    asymmetricCapabilities: ['Nuklearwaffen', 'Cyber/Informationskrieg', 'Wagner/Afrika Korps', 'Hyperschallwaffen (Kinzhal, Avangard, Tsirkon)', 'EW/Elektronische Kriegführung'],
    nuclearPosture: 'Escalate to de-escalate. Nuklearer Ersteinsatz bei existenzieller Bedrohung nicht ausgeschlossen. Taktische Nuklearwaffen (~2.000). Größtes Arsenal weltweit.',
  },
  industry: {
    selfSufficiencyRating: 85,
    keyDomesticSystems: ['Su-57 Felon', 'Su-35S', 'T-14 Armata', 'T-90M Proryv', 'S-400/S-500', 'Kinzhal/Tsirkon Hyperschall', 'Kalibr LACM', 'Borei-A SSBN', 'Yasen-M SSN'],
    majorImportPartners: ['Iran (Shahed-Drohnen)', 'Nordkorea (Munition, ballistische Raketen)'],
    majorExportPartners: ['Indien', 'China', 'Algerien', 'Ägypten', 'Türkei (S-400)'],
    note: 'Ukraine-Krieg zeigt Grenzen: Hohe Verluste an modernem Gerät. Abhängigkeit von westlichen Chips. Produktion hochgefahren aber qualitativ eingeschränkt. Rostec, Almaz-Antey, UAC.',
  },
  forceStructure: [
    { category: 'Landstreitkräfte', qualityNote: 'Massive Verluste in Ukraine (est. 3.000+ Panzer). Aber tiefer Bestand an älteren Systemen. T-14 Armata nie in Serie.', systems: [
      cws('T-90M Proryv', 350, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '3.++ Gen', 'Bestes russisches Serienmodell'),
      cws('T-72B3/B3M', 2000, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '2.++ Gen', 'Rückgrat der Panzertruppen'),
      cws('T-80BVM', 500, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '3. Gen'),
      cws('T-14 Armata', 20, 'Eigenentwicklung', 'Truppenerprobung', WP('T-14_Armata'), WP_L('Armata'), '4. Gen', 'Nie in Massenproduktion gegangen'),
      cws('BMP-3 / BMP-2', 4000, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', qualityNote: 'Su-35S/Su-34 kampferprobt aber verwundbar durch GBAD. Su-57 existiert nur in Kleinstserie (~22).', systems: [
      cws('Su-57 Felon', 22, 'Eigenentwicklung', 'Aktiv', WP('Sukhoi_Su-57'), WP_L('Su-57'), '5. Gen', 'Nur ~22 ausgeliefert, Ziel 76 bis 2028'),
      cws('Su-35S Flanker-E', 110, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '4.++ Gen'),
      cws('Su-34 Fullback', 130, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '4.+ Gen', 'Jagdbomber'),
      cws('Su-30SM/SM2', 120, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '4.+ Gen'),
      cws('MiG-31BM/BSM', 90, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Abfangjäger', 'Kinzhal-Träger'),
      cws('Tu-160M Blackjack', 16, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Strategischer Bomber', 'Modernisiert mit Kh-101'),
      cws('Tu-95MS Bear', 42, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Strategischer Bomber'),
      cws('Ka-52/Mi-28N', 200, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Kampfhubschrauber', 'Hohe Verluste in UA'),
    ]},
    { category: 'Marine', qualityNote: 'Altbestand dominiert. Kuznetsov dauerhaft in Reparatur. Neue SSBNs (Borei-A) und SSNs (Yasen-M) Priorität.', systems: [
      cws('Admiral Kuznetsov CV', 1, 'Eigenentwicklung', 'Instandsetzung', IISS, IISS_L, 'Einziger Träger', 'Seit 2018 in Werft, Zukunft unklar'),
      cws('Kirov/Slava-Klasse Kreuzer', 3, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Moskva versenkt UA 2022'),
      cws('Gorshkov-Klasse Fregatte', 4, 'Eigenentwicklung', 'Aktiv/Zulauf', IISS, IISS_L, 'Tsirkon-Hyperschall'),
      cws('Borei-A SSBN', 5, 'Eigenentwicklung', 'Aktiv/Zulauf', IISS, IISS_L, '16 Bulawa SLBM', 'Ersetzen Typhoon/Delta'),
      cws('Yasen-M SSGN', 4, 'Eigenentwicklung', 'Aktiv/Zulauf', IISS, IISS_L, 'Kalibr/Tsirkon'),
      cws('Kilo/Verbesserte Kilo SSK', 18, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Kalibr LACM'),
    ]},
    { category: 'Raketenstreitkräfte', qualityNote: 'Stärkste Raketenstreitkräfte weltweit neben USA. Hyperschall (Kinzhal, Avangard, Tsirkon) als strategischer Vorteil.', systems: [
      cws('RS-28 Sarmat (Satan II) ICBM', 10, 'Eigenentwicklung', 'Zulauf', WP('RS-28_Sarmat'), WP_L('Sarmat'), 'Schwere ICBM, 18.000km', 'Ersetzen RS-20V Voevoda'),
      cws('Topol-M / Yars ICBM', 170, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'ICBM, 12.000km', 'Mobil + Silo'),
      cws('Avangard HGV', 6, 'Eigenentwicklung', 'Aktiv', WP('Avangard_(hypersonic_glide_vehicle)'), WP_L('Avangard'), 'Hypersonisch, Mach 27', 'Auf UR-100N ICBM'),
      cws('Kinzhal ALBM', 50, 'Eigenentwicklung', 'Aktiv', WP('Kh-47M2_Kinzhal'), WP_L('Kinzhal'), 'Hypersonisch, Mach 10', 'MiG-31-gestützt'),
      cws('Tsirkon Hyperschall-AShM', 30, 'Eigenentwicklung', 'Aktiv', WP('3M22_Zircon'), WP_L('Tsirkon'), 'Mach 9, seegestützt'),
      cws('Kalibr LACM', 500, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Marschflugkörper, 2.500km'),
      cws('S-400 Triumf', 56, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Langstrecke SAM', '56 Batterien'),
      cws('S-500 Prometheus', 2, 'Eigenentwicklung', 'Zulauf', WP('S-500_missile_system'), WP_L('S-500'), 'ABM/Anti-Sat', 'Exoatmosphärische Abfangfähigkeit'),
      cws('Iskander-M (SS-26 Stone)', 180, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Taktisch-ballistisch, 500km'),
    ]},
  ],
  overviewSource: GFP('russia'), overviewSourceLabel: GFP_L('Russland'),
};

// ═══════════════════════════════════════════════════════════════
// CHINA
// ═══════════════════════════════════════════════════════════════
const CN: GlobalMilitaryProfile = {
  id: 'CN', name: 'China', flagEmoji: '🇨🇳', region: 'Großmacht',
  activePersonnel: 2185000, reservePersonnel: 510000, paramilitaryPersonnel: 660000,
  militaryBudget: 225000000000, budgetPercentGDP: 1.5, gfpRank: 3,
  conscription: false, conscriptionNote: 'De jure Wehrpflicht, de facto Freiwilligenarmee',
  armedForcesName: 'Volksbefreiungsarmee (中国人民解放军, PLA)',
  nuclear: { hasWeapons: true, suspected: false, warheadsEstimate: 410, deliverySystems: ['DF-41 ICBM', 'DF-5B ICBM', 'JL-3 SLBM', 'H-6N Bomber', 'DF-27 HGV'], nptMember: true, note: 'Rasante Expansion: ~410 → geschätzt 1.000+ bis 2030 (Pentagon). 350+ neue ICBM-Silos im Bau.' },
  doctrine: {
    strategicOrientation: 'Taiwanstraße als strategischer Brennpunkt. Anti-Access/Area Denial (A2/AD). „Drei Kriegsarten" (Medien, Recht, Psychologie). Modernisierung bis 2035, Weltklasse bis 2049.',
    keyAlliances: ['Russland (strategische Partnerschaft)', 'Pakistan', 'Nordkorea', 'SCO', 'Belt & Road Sicherheit'],
    forceProjectionCapability: 'Regional',
    asymmetricCapabilities: ['DF-21D/DF-26 ASBM (Carrier-Killer)', 'Cyber (PLA SSF)', 'Weltraum (ASAT)', 'Hyperschall (DF-27)', 'Informationskrieg', 'Künstliche Inseln (SCS)'],
    nuclearPosture: 'Erklärte „No First Use"-Politik. Aber Arsenalexpansion wirft Fragen auf. Minimum Deterrence → Credible Minimum Deterrence. ~410 Sprengköpfe, rapide wachsend.',
  },
  industry: {
    selfSufficiencyRating: 80,
    keyDomesticSystems: ['J-20 Mighty Dragon', 'Type 055 Destroyer', 'Fujian CV', 'DF-41 ICBM', 'DF-21D ASBM', 'Type 096 SSBN (Entwicklung)', 'WZ-10 Attack Helo', 'Wing Loong II UCAV', 'TB-001 Twin-Tailed Scorpion'],
    majorImportPartners: ['Russland (Su-35, S-400, Triebwerke)'],
    majorExportPartners: ['Pakistan', 'Bangladesch', 'Myanmar', 'Thailand', 'Nigeria', 'Saudi-Arabien (UAV)'],
    note: 'Zweitgrößte Rüstungsindustrie weltweit. AVIC, NORINCO, CASIC, CSSC. Triebwerkstechnologie (WS-15) aufholend. Schiffbau: 230x Kapazität der USA.',
  },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('Type 99A MBT', 1200, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '3.++ Gen', 'Chinas modernster MBT'),
      cws('Type 96A/B MBT', 2500, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '3. Gen'),
      cws('Type 15 Leichtpanzer', 300, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Für Berggelände/Tibet'),
      cws('ZBD-04A IFV', 2000, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
      cws('PHL-03 / PCL-181 Artillerie', 1500, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', qualityNote: 'J-20 Stealth in wachsender Zahl. Drittgrößte Luftwaffe weltweit. J-35A (Navy Stealth) in Entwicklung.', systems: [
      cws('J-20 Mighty Dragon', 200, 'Eigenentwicklung', 'Aktiv', WP('Chengdu_J-20'), WP_L('J-20'), '5. Gen', 'WS-15 Triebwerk im Zulauf'),
      cws('J-16', 300, 'Eigenentwicklung (Su-30-Basis)', 'Aktiv', IISS, IISS_L, '4.+ Gen'),
      cws('J-10C Vigorous Dragon', 400, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '4. Gen', 'AESA Radar'),
      cws('Su-30MKK / Su-35S', 97, 'Russland', 'Aktiv', IISS, IISS_L, '4.+ Gen'),
      cws('H-6K/N Bomber', 180, 'Eigenentwicklung (Tu-16-Basis)', 'Aktiv', IISS, IISS_L, 'Strategischer Bomber', 'H-6N: Luftbetankungsfähig, DF-21-Träger'),
      cws('WZ-10 / Z-10ME', 130, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
      cws('Wing Loong II / GJ-11 Stealth UCAV', 200, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Marine', qualityNote: 'Größte Marine der Welt nach Schiffszahl (370+). 3 Flugzeugträger. Massenproduktion: ~8 Kriegsschiffe/Jahr.', systems: [
      cws('Fujian (Type 003) CV', 1, 'Eigenentwicklung', 'Erprobung', WP('Chinese_aircraft_carrier_Fujian'), WP_L('Fujian'), 'EMALS-Katapult', '3. Träger, CATOBAR'),
      cws('Shandong / Liaoning CV', 2, 'Eigenentwicklung / Ex-Sowjet', 'Aktiv', IISS, IISS_L, 'STOBAR'),
      cws('Type 055 Renhai-Klasse DDG', 8, 'Eigenentwicklung', 'Aktiv', WP('Type_055_destroyer'), WP_L('Type 055'), '112 VLS', '~13.000t, größter Überwasserkämpfer Asiens'),
      cws('Type 052D Luyang-III DDG', 25, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '64 VLS'),
      cws('Type 094A Jin SSBN', 6, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '12 JL-3 SLBM'),
      cws('Type 093A/B Shang SSN', 6, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
      cws('Type 039A/B Yuan SSK', 17, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'AIP-fähig'),
    ]},
    { category: 'Raketenstreitkräfte', qualityNote: 'PLA Rocket Force (PLARF). DF-21D/DF-26 „Carrier Killer" = einzigartige A2/AD-Fähigkeit. Hyperschall DF-27 im Zulauf.', systems: [
      cws('DF-41 ICBM', 36, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'ICBM, 15.000km, MIRV', 'Mobil, 3-10 MIRV'),
      cws('DF-5B ICBM', 20, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Silo-ICBM, MIRV'),
      cws('DF-26 IRBM (Carrier-Killer)', 200, 'Eigenentwicklung', 'Aktiv', WP('DF-26'), WP_L('DF-26'), 'ASBM/Nuklear-fähig, 4.000km', 'Anti-Ship + Landangriff'),
      cws('DF-21D ASBM', 100, 'Eigenentwicklung', 'Aktiv', WP('DF-21'), WP_L('DF-21D'), 'Anti-Ship-Ballistikrakete, 1.500km'),
      cws('DF-27 HGV', 10, 'Eigenentwicklung', 'Zulauf', IISS, IISS_L, 'Hypersonisch', 'Nachfolger DF-17, konventionell+nuklear'),
      cws('HQ-9B / S-400 SAM', 40, 'Eigenentwicklung/Russland', 'Aktiv', IISS, IISS_L, 'Langstrecke SAM'),
      cws('YJ-21 Hyperschall-AShM', 20, 'Eigenentwicklung', 'Zulauf', IISS, IISS_L, 'Seegestützt, Mach 6+'),
    ]},
  ],
  overviewSource: GFP('china'), overviewSourceLabel: GFP_L('China'),
};

// ═══════════════════════════════════════════════════════════════
// UNITED KINGDOM
// ═══════════════════════════════════════════════════════════════
const GB: GlobalMilitaryProfile = {
  id: 'GB', name: 'Vereinigtes Königreich', flagEmoji: '🇬🇧', region: 'Großmacht',
  activePersonnel: 148500, reservePersonnel: 37000, paramilitaryPersonnel: 0,
  militaryBudget: 68500000000, budgetPercentGDP: 2.3, gfpRank: 6,
  conscription: false,
  armedForcesName: 'British Armed Forces',
  nuclear: { hasWeapons: true, suspected: false, warheadsEstimate: 225, deliverySystems: ['Trident II SLBM (Vanguard SSBN)'], nptMember: true, note: 'Rein seegestützte Abschreckung (CASD). 4 Vanguard SSBN → 4 Dreadnought (ab 2030er). Max. 225 Sprengköpfe (Erhöhung 2021).' },
  doctrine: {
    strategicOrientation: 'Post-Brexit Global Britain. NATO-Kernstaat. Five Eyes Intelligence. Expeditionäre Fähigkeiten mit Carrier Strike Groups. Stützpunkte weltweit.',
    keyAlliances: ['NATO', 'Five Eyes', 'AUKUS', 'USA (Special Relationship)', 'Frankreich (Lancaster House)'],
    forceProjectionCapability: 'Global',
    asymmetricCapabilities: ['GCHQ Cyber/SIGINT', 'SAS/SBS SOF', 'Queen Elizabeth Carrier Strike', 'Übersee-Stützpunkte (Zypern, Diego Garcia, Gibraltar, Falkland)'],
    nuclearPosture: 'Continuous At-Sea Deterrent (CASD). Min. 1 SSBN immer auf Patrouille. Trident II SLBM. Bis zu 225 Sprengköpfe.',
  },
  industry: {
    selfSufficiencyRating: 65,
    keyDomesticSystems: ['Challenger 3 MBT (Upgrade)', 'Type 26 Fregatte', 'Type 31 Fregatte', 'Astute SSN', 'Dreadnought SSBN', 'Tempest 6.Gen-Jet (GCAP)'],
    majorImportPartners: ['USA (F-35B, Apache)', 'EU-Partner (Eurofighter, Meteor)'],
    majorExportPartners: ['Saudi-Arabien', 'Katar', 'Australien', 'Türkei'],
    note: 'BAE Systems = Europas größter Rüstungskonzern. GCAP (Global Combat Air Programme) mit Japan und Italien für 6.Gen-Jet (Tempest-Nachfolger). AUKUS: SSN-Technologie an Australien.',
  },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('Challenger 2 / 3', 227, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '3. Gen', '148 → Challenger 3 Upgrade (RBSL)'),
      cws('Warrior IFV', 380, 'Eigenentwicklung', 'Aktiv (Auslauf)', IISS, IISS_L),
      cws('Ajax IFV', 50, 'Eigenentwicklung (GD)', 'Zulauf (Probleme)', IISS, IISS_L, 'Schwere Verzögerungen'),
      cws('AS-90 Braveheart SPH', 89, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('F-35B Lightning II', 33, 'USA (LM)', 'Aktiv/Zulauf', IISS, IISS_L, '5. Gen', '48 bestellt, STOVL für QE-Carrier'),
      cws('Eurofighter Typhoon FGR.4', 137, 'EU (BAE/Airbus)', 'Aktiv', IISS, IISS_L, '4.+ Gen'),
      cws('AH-64E Apache', 50, 'USA (Boeing)', 'Aktiv', IISS, IISS_L),
      cws('MQ-9B Protector (SkyGuardian)', 16, 'USA (GA-ASI)', 'Zulauf', IISS, IISS_L, 'MALE UCAV'),
    ]},
    { category: 'Marine', qualityNote: '2 QE-Carrier geben UK Carrier Strike Capability zurück. Aber nur 6 Type 45 DDG = kritisch wenige Escorts.', systems: [
      cws('Queen Elizabeth-Klasse CV', 2, 'Eigenentwicklung (BAE)', 'Aktiv', WP('Queen_Elizabeth-class_aircraft_carrier'), WP_L('QE-Klasse'), '65.000t, F-35B'),
      cws('Type 45 Daring DDG', 6, 'Eigenentwicklung (BAE)', 'Aktiv', IISS, IISS_L, 'Sea Viper SAM, 48 VLS'),
      cws('Type 23 Duke Fregatte', 12, 'Eigenentwicklung', 'Aktiv (Auslauf)', IISS, IISS_L, 'Towed Array ASW'),
      cws('Type 26 City-Klasse', 2, 'Eigenentwicklung (BAE)', 'Zulauf', IISS, IISS_L, '8 geplant, ASW-Fregatte'),
      cws('Astute-Klasse SSN', 6, 'Eigenentwicklung (BAE)', 'Aktiv', IISS, IISS_L, 'Tomahawk TLAM'),
      cws('Vanguard-Klasse SSBN', 4, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Trident II, 16 SLBM'),
    ]},
    { category: 'Raketenstreitkräfte', systems: [
      cws('Trident II D5 SLBM', 48, 'USA (LM)', 'Aktiv', IISS, IISS_L, 'SLBM, 12.000km', '4 SSBN × 16 Rohre, ~40 verfügbar'),
      cws('Storm Shadow/SCALP LACM', 200, 'Frankreich/UK', 'Aktiv', IISS, IISS_L, 'Marschflugkörper, 560km'),
      cws('Sky Sabre (CAMM) SAM', 24, 'Eigenentwicklung (MBDA)', 'Aktiv', IISS, IISS_L, 'Kurzstrecke'),
    ]},
  ],
  overviewSource: GFP('united-kingdom'), overviewSourceLabel: GFP_L('UK'),
};

// ═══════════════════════════════════════════════════════════════
// FRANCE
// ═══════════════════════════════════════════════════════════════
const FR: GlobalMilitaryProfile = {
  id: 'FR', name: 'Frankreich', flagEmoji: '🇫🇷', region: 'Großmacht',
  activePersonnel: 205000, reservePersonnel: 38000, paramilitaryPersonnel: 103000,
  militaryBudget: 53600000000, budgetPercentGDP: 1.9, gfpRank: 11,
  conscription: false,
  armedForcesName: 'Forces armées françaises',
  nuclear: { hasWeapons: true, suspected: false, warheadsEstimate: 290, deliverySystems: ['M51 SLBM (Le Triomphant SSBN)', 'ASMP-A (Rafale-gestützt)'], nptMember: true, note: 'Unabhängige Nuklearabschreckung (Force de dissuasion). Einzige EU-Nuklearmacht (post-Brexit). ~290 Sprengköpfe.' },
  doctrine: {
    strategicOrientation: 'Strategische Autonomie. Interventionsfähig: Sahel (Barkhane/Serval), Levante. Permanente Stützpunkte in Afrika, Pazifik, Golf. Einziger EU-Staat mit vollständiger Nukleartriade-Fähigkeit.',
    keyAlliances: ['NATO', 'EU (PESCO)', 'UK (Lancaster House)', 'Frankophone Welt', 'Dschibuti-Stützpunkt'],
    forceProjectionCapability: 'Global',
    asymmetricCapabilities: ['DGSE (Auslandsnachrichtendienst)', 'Fremdenlegion', 'COS (Commandement des Opérations Spéciales)', 'Nukleardyade (See + Luft)'],
    nuclearPosture: 'Force de dissuasion: „Streng ausreichend" (strictement suffisante). Dyade: M51 SLBM + ASMP-A auf Rafale. Keine taktischen Nuklearwaffen. ~290 Sprengköpfe.',
  },
  industry: {
    selfSufficiencyRating: 75,
    keyDomesticSystems: ['Rafale', 'Leclerc MBT', 'FREMM Fregatte', 'Barracuda (Suffren) SSN', 'Charles de Gaulle CVN', 'SCALP/Storm Shadow', 'MILAN/ERYX ATGM', 'Caesar SPH', 'Neuron UCAV-Demonstrator'],
    majorImportPartners: [],
    majorExportPartners: ['Indien (Rafale)', 'Ägypten (Rafale, FREMM)', 'Griechenland (Rafale)', 'VAE', 'Saudi-Arabien'],
    note: 'Dassault, Naval Group, Thales, MBDA, Nexter. Rafale = Exportschlager (Indien, Ägypten, Griechenland, VAE, Indonesien). Nächste Generation: FCAS/SCAF mit Deutschland und Spanien (6. Gen, 2040+).',
  },
  forceStructure: [
    { category: 'Landstreitkräfte', systems: [
      cws('Leclerc MBT', 222, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '3.+ Gen', 'Renoviert (Scorpion-Programm)'),
      cws('VBCI IFV', 630, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Radpanzer'),
      cws('Griffon VBMR', 600, 'Eigenentwicklung', 'Zulauf', IISS, IISS_L, 'Scorpion-Programm', '1.818 bestellt'),
      cws('Jaguar EBRC', 80, 'Eigenentwicklung', 'Zulauf', IISS, IISS_L, 'Scorpion', '300 bestellt, 40mm CTA'),
      cws('Caesar 155mm SPH', 77, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Kampferprobt'),
    ]},
    { category: 'Luftwaffe', systems: [
      cws('Rafale C/B/M', 195, 'Eigenentwicklung (Dassault)', 'Aktiv', WP('Dassault_Rafale'), WP_L('Rafale'), '4.+ Gen', 'AESA RBE2, SPECTRA EW, Omnirole'),
      cws('Mirage 2000-5/D/N', 100, 'Eigenentwicklung', 'Aktiv (Auslauf)', IISS, IISS_L, '4. Gen'),
      cws('Tigre HAD/HAP', 67, 'Eigenentwicklung (Airbus)', 'Aktiv', IISS, IISS_L),
      cws('MQ-9 Reaper Block 5', 14, 'USA (GA-ASI)', 'Aktiv', IISS, IISS_L, 'MALE UCAV'),
    ]},
    { category: 'Marine', qualityNote: 'Einziger nicht-US-Nuklearträger (CDG). Barracuda-SSN ersetzen Rubis-Klasse. AUKUS → Australien bekommt fr. Barracuda-Design nicht.', systems: [
      cws('Charles de Gaulle CVN', 1, 'Eigenentwicklung', 'Aktiv', WP('French_aircraft_carrier_Charles_de_Gaulle'), WP_L('CDG'), 'Nuklear, CATOBAR, Rafale-M'),
      cws('Horizon-Klasse Fregatte', 2, 'Eigenentwicklung/Italien', 'Aktiv', IISS, IISS_L, 'Aster-30 SAM'),
      cws('FREMM Aquitaine-Klasse', 8, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'Multi-Mission, Naval Cruise Missile'),
      cws('Suffren-Klasse (Barracuda) SSN', 3, 'Eigenentwicklung (Naval Group)', 'Aktiv/Zulauf', IISS, IISS_L, '6 geplant, MdCN LACM'),
      cws('Le Triomphant-Klasse SSBN', 4, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, '16 M51 SLBM'),
    ]},
    { category: 'Raketenstreitkräfte', systems: [
      cws('M51 SLBM', 48, 'Eigenentwicklung', 'Aktiv', IISS, IISS_L, 'SLBM, 10.000km, 6-10 MIRV'),
      cws('ASMP-A', 54, 'Eigenentwicklung (MBDA)', 'Aktiv', WP('ASMP'), WP_L('ASMP-A'), 'Nuklearer Marschflugkörper, 500km', 'Rafale-gestützt'),
      cws('SCALP-EG / Storm Shadow', 250, 'Eigenentwicklung (MBDA)', 'Aktiv', IISS, IISS_L, 'Konventioneller Marschflugkörper, 560km'),
      cws('Aster 15/30 SAM', 100, 'Eigenentwicklung (MBDA)', 'Aktiv', IISS, IISS_L, 'Schiffs- und Landgestützt'),
    ]},
  ],
  overviewSource: GFP('france'), overviewSourceLabel: GFP_L('Frankreich'),
};

export const GLOBAL_PROFILES: GlobalMilitaryProfile[] = [
  // Naher Osten
  IR, IL, SA, TR, AE, EG, IQ, JO,
  // Afrika
  NG, ET, ZA, DZ, MA, KE,
  // Großmächte
  US, RU, CN, GB, FR,
];

// ── Lookup map ────────────────────────────────────────────────
export const profileById = (id: string) => GLOBAL_PROFILES.find(p => p.id === id);
