// ═══════════════════════════════════════════════════════════════
// LIVE FORCE TRACKER — Tracks real military deployments via GDELT
// Queries for specific military units and deployment patterns,
// extracts positioning data from news articles.
// ═══════════════════════════════════════════════════════════════

import type { NewsArticle } from './newsApi';

// ── Known military unit patterns ──
// Each entry maps keywords → a recognized force unit with metadata
export interface TrackedForce {
  id: string;
  unitName: string;
  unitType: string;
  actor: 'usa' | 'iran' | 'proxy-iran' | 'proxy-usa' | 'neutral';
  category: 'air' | 'naval' | 'troops' | 'missile' | 'base' | 'proxy';
  lat: number;
  lng: number;
  location: string;
  strength: string;
  status: 'active' | 'deploying' | 'withdrawn' | 'alert';
  since: string; // date of most recent article
  articles: { title: string; url: string; source: string; date: string }[];
  confidence: 'high' | 'medium' | 'low';
}

// ── Location extraction patterns ──
// Maps location keywords in article text → approximate coordinates
const LOCATION_PATTERNS: { keywords: string[]; lat: number; lng: number; location: string }[] = [
  // Seas & Waterways
  { keywords: ['red sea'], lat: 16.5, lng: 40.5, location: 'Rotes Meer' },
  { keywords: ['gulf of aden', 'aden'], lat: 12.5, lng: 45.0, location: 'Golf von Aden' },
  { keywords: ['strait of hormuz', 'hormuz'], lat: 26.5, lng: 56.3, location: 'Straße von Hormuz' },
  { keywords: ['persian gulf', 'arabian gulf'], lat: 26.0, lng: 52.0, location: 'Persischer Golf' },
  { keywords: ['gulf of oman'], lat: 24.5, lng: 58.5, location: 'Golf von Oman' },
  { keywords: ['mediterranean', 'eastern med'], lat: 34.0, lng: 32.0, location: 'Östliches Mittelmeer' },
  { keywords: ['suez canal', 'suez'], lat: 30.5, lng: 32.3, location: 'Suezkanal' },
  { keywords: ['bab el-mandeb', 'bab al-mandab', 'mandeb'], lat: 12.6, lng: 43.3, location: 'Bab el-Mandeb' },
  { keywords: ['arabian sea'], lat: 18.0, lng: 62.0, location: 'Arabisches Meer' },
  { keywords: ['indian ocean'], lat: 10.0, lng: 65.0, location: 'Indischer Ozean' },
  // Countries / Regions
  { keywords: ['yemen', 'sanaa', 'hodeida', 'hodeidah'], lat: 15.4, lng: 44.2, location: 'Jemen' },
  { keywords: ['syria', 'damascus', 'deir ez-zor', 'al-tanf'], lat: 34.8, lng: 38.9, location: 'Syrien' },
  { keywords: ['iraq', 'baghdad', 'erbil'], lat: 33.3, lng: 44.4, location: 'Irak' },
  { keywords: ['iran', 'tehran', 'isfahan', 'bandar abbas'], lat: 32.4, lng: 53.7, location: 'Iran' },
  { keywords: ['israel', 'tel aviv', 'haifa'], lat: 31.8, lng: 34.8, location: 'Israel' },
  { keywords: ['lebanon', 'beirut'], lat: 33.9, lng: 35.5, location: 'Libanon' },
  { keywords: ['qatar', 'al udeid', 'al-udeid', 'doha'], lat: 25.1, lng: 51.3, location: 'Qatar (Al-Udeid)' },
  { keywords: ['bahrain', 'manama', 'juffair'], lat: 26.2, lng: 50.6, location: 'Bahrain (5th Fleet)' },
  { keywords: ['uae', 'abu dhabi', 'al dhafra', 'al-dhafra', 'dubai'], lat: 24.3, lng: 54.6, location: 'VAE (Al-Dhafra)' },
  { keywords: ['kuwait', 'camp arifjan', 'ali al salem'], lat: 29.0, lng: 48.2, location: 'Kuwait' },
  { keywords: ['djibouti', 'camp lemonnier'], lat: 11.6, lng: 43.1, location: 'Dschibuti' },
  { keywords: ['saudi arabia', 'riyadh', 'jeddah'], lat: 24.0, lng: 45.0, location: 'Saudi-Arabien' },
  { keywords: ['jordan', 'amman'], lat: 31.9, lng: 35.9, location: 'Jordanien' },
  { keywords: ['egypt', 'cairo', 'sinai'], lat: 26.8, lng: 30.8, location: 'Ägypten' },
  { keywords: ['gaza', 'gaza strip', 'rafah'], lat: 31.4, lng: 34.4, location: 'Gaza' },
  { keywords: ['west bank', 'ramallah', 'nablus', 'jenin'], lat: 31.9, lng: 35.2, location: 'Westjordanland' },
  { keywords: ['south china sea'], lat: 12.0, lng: 114.0, location: 'Südchinesisches Meer' },
  { keywords: ['pacific', 'indo-pacific'], lat: 20.0, lng: 140.0, location: 'Indo-Pazifik' },
  // Specific bases & installations
  { keywords: ['incirlik', 'incirlik air base'], lat: 37.0, lng: 35.4, location: 'Incirlik AB, Türkei' },
  { keywords: ['diego garcia'], lat: -7.3, lng: 72.4, location: 'Diego Garcia (BIOT)' },
  { keywords: ['ramstein'], lat: 49.4, lng: 7.6, location: 'Ramstein AB, Deutschland' },
  { keywords: ['sigonella'], lat: 37.4, lng: 14.9, location: 'NAS Sigonella, Italien' },
  { keywords: ['souda bay', 'crete'], lat: 35.5, lng: 24.1, location: 'Souda Bay, Kreta' },
  { keywords: ['akrotiri'], lat: 34.6, lng: 32.9, location: 'RAF Akrotiri, Zypern' },
  { keywords: ['ali al salem'], lat: 29.3, lng: 47.5, location: 'Ali Al Salem AB, Kuwait' },
  { keywords: ['al asad', 'ain al-assad'], lat: 33.8, lng: 42.4, location: 'Ain al-Assad AB, Irak' },
  { keywords: ['tanf', 'al-tanf'], lat: 33.5, lng: 38.8, location: 'Al-Tanf Garrison, Syrien' },
  { keywords: ['nevatim'], lat: 31.2, lng: 34.9, location: 'Nevatim AB, Israel' },
  { keywords: ['haifa'], lat: 32.8, lng: 35.0, location: 'Haifa, Israel' },
];

// ── Known unit patterns: keywords → unit identification ──
interface UnitPattern {
  id: string;
  keywords: string[];
  unitName: string;
  unitType: string;
  actor: TrackedForce['actor'];
  category: TrackedForce['category'];
  strength: string;
  defaultLat: number;
  defaultLng: number;
  defaultLocation: string;
}

const UNIT_PATTERNS: UnitPattern[] = [
  // ── US CARRIER STRIKE GROUPS ──
  { id: 'uss-lincoln', keywords: ['uss lincoln', 'uss abraham lincoln', 'cvn-72', 'cvn 72', 'lincoln strike group', 'lincoln carrier'],
    unitName: 'CSG — USS Abraham Lincoln (CVN-72)', unitType: 'Carrier Strike Group',
    actor: 'usa', category: 'naval', strength: '~7.500 Personal, CVN + Escorts + Carrier Air Wing',
    defaultLat: 25.0, defaultLng: 55.0, defaultLocation: 'Persischer Golf' },
  { id: 'uss-truman', keywords: ['uss truman', 'uss harry s. truman', 'uss harry truman', 'cvn-75', 'cvn 75', 'truman strike group', 'truman carrier'],
    unitName: 'CSG — USS Harry S. Truman (CVN-75)', unitType: 'Carrier Strike Group',
    actor: 'usa', category: 'naval', strength: '~7.500 Personal, CVN + Escorts + Carrier Air Wing',
    defaultLat: 34.0, defaultLng: 32.0, defaultLocation: 'Mittelmeer' },
  { id: 'uss-eisenhower', keywords: ['uss eisenhower', 'uss dwight d. eisenhower', 'cvn-69', 'cvn 69', 'eisenhower strike group', 'ike strike group'],
    unitName: 'CSG-2 — USS Dwight D. Eisenhower (CVN-69)', unitType: 'Carrier Strike Group',
    actor: 'usa', category: 'naval', strength: '~7.500 Personal, CVN + Escorts + Carrier Air Wing',
    defaultLat: 36.0, defaultLng: -76.0, defaultLocation: 'Norfolk (Heimathafen)' },
  { id: 'uss-ford', keywords: ['uss gerald r. ford', 'uss ford', 'cvn-78', 'cvn 78', 'ford strike group', 'ford carrier'],
    unitName: 'CSG-12 — USS Gerald R. Ford (CVN-78)', unitType: 'Carrier Strike Group',
    actor: 'usa', category: 'naval', strength: '~7.500 Personal, CVN + Escorts + Carrier Air Wing',
    defaultLat: 36.0, defaultLng: -76.0, defaultLocation: 'Norfolk (Heimathafen)' },
  { id: 'uss-reagan', keywords: ['uss reagan', 'uss ronald reagan', 'cvn-76', 'cvn 76'],
    unitName: 'CSG-5 — USS Ronald Reagan (CVN-76)', unitType: 'Carrier Strike Group',
    actor: 'usa', category: 'naval', strength: '~7.500 Personal, CVN + Escorts + Carrier Air Wing',
    defaultLat: 35.3, defaultLng: 139.7, defaultLocation: 'Yokosuka, Japan' },
  { id: 'uss-nimitz', keywords: ['uss nimitz', 'cvn-68', 'cvn 68', 'nimitz strike group'],
    unitName: 'CSG-11 — USS Nimitz (CVN-68)', unitType: 'Carrier Strike Group',
    actor: 'usa', category: 'naval', strength: '~7.500 Personal, CVN + Escorts + Carrier Air Wing',
    defaultLat: 32.7, defaultLng: -117.2, defaultLocation: 'San Diego (Heimathafen)' },
  { id: 'uss-vinson', keywords: ['uss carl vinson', 'uss vinson', 'cvn-70', 'cvn 70', 'vinson strike group'],
    unitName: 'CSG-1 — USS Carl Vinson (CVN-70)', unitType: 'Carrier Strike Group',
    actor: 'usa', category: 'naval', strength: '~7.500 Personal, CVN + Escorts + Carrier Air Wing',
    defaultLat: 32.7, defaultLng: -117.2, defaultLocation: 'San Diego (Heimathafen)' },
  { id: 'uss-stennis', keywords: ['uss stennis', 'uss john c. stennis', 'cvn-74', 'cvn 74'],
    unitName: 'CSG-3 — USS John C. Stennis (CVN-74)', unitType: 'Carrier Strike Group',
    actor: 'usa', category: 'naval', strength: '~7.500 Personal, CVN + Escorts + Carrier Air Wing',
    defaultLat: 47.6, defaultLng: -122.6, defaultLocation: 'Bremerton (Heimathafen)' },
  { id: 'uss-washington', keywords: ['uss george washington', 'cvn-73', 'cvn 73'],
    unitName: 'CSG-5 — USS George Washington (CVN-73)', unitType: 'Carrier Strike Group',
    actor: 'usa', category: 'naval', strength: '~7.500 Personal, CVN + Escorts + Carrier Air Wing',
    defaultLat: 35.3, defaultLng: 139.7, defaultLocation: 'Yokosuka, Japan' },

  // ── US Amphibious Ready Groups / MEUs ──
  { id: 'bataan-arg', keywords: ['uss bataan', 'bataan amphibious', 'bataan arg'],
    unitName: 'ARG — USS Bataan (LHD-5)', unitType: 'Amphibious Ready Group + 26th MEU',
    actor: 'usa', category: 'naval', strength: '~4.500 Marines + Navy, LHD + 2 escorts',
    defaultLat: 26.0, defaultLng: 50.0, defaultLocation: 'Persischer Golf' },
  { id: 'wasp-arg', keywords: ['uss wasp', 'wasp amphibious', 'wasp arg'],
    unitName: 'ARG — USS Wasp (LHD-1)', unitType: 'Amphibious Ready Group + MEU',
    actor: 'usa', category: 'naval', strength: '~4.500 Marines + Navy, LHD + 2 escorts',
    defaultLat: 34.0, defaultLng: 33.0, defaultLocation: 'Mittelmeer' },

  // ── US Air Assets ──
  { id: 'b-52-deploy', keywords: ['b-52', 'b52', 'stratofortress', 'bomber task force'],
    unitName: 'B-52H Stratofortress Bomber Task Force', unitType: 'Strategic Bomber Deployment',
    actor: 'usa', category: 'air', strength: '2-4 B-52H + Tanker-Unterstützung',
    defaultLat: 25.1, defaultLng: 51.3, defaultLocation: 'Al-Udeid AB / Diego Garcia' },
  { id: 'b-1b-deploy', keywords: ['b-1b', 'b-1 lancer', 'lancer bomber'],
    unitName: 'B-1B Lancer Bomber Task Force', unitType: 'Strategic Bomber Deployment',
    actor: 'usa', category: 'air', strength: '2-4 B-1B Lancer + Tanker',
    defaultLat: 25.1, defaultLng: 51.3, defaultLocation: 'Al-Udeid AB / Naher Osten' },
  { id: 'f-35-deploy', keywords: ['f-35 deploy', 'f-35 fighter', 'f-35 squadron', 'f-35a middle east', 'f-35 gulf'],
    unitName: 'F-35A Lightning II Deployment', unitType: 'Stealth Fighter Squadron',
    actor: 'usa', category: 'air', strength: '12-24 F-35A',
    defaultLat: 24.3, defaultLng: 54.6, defaultLocation: 'Al-Dhafra AB, VAE' },
  { id: 'f-22-deploy', keywords: ['f-22 deploy', 'f-22 raptor', 'f-22 middle east'],
    unitName: 'F-22 Raptor Deployment', unitType: '5th Gen Air Superiority',
    actor: 'usa', category: 'air', strength: '12+ F-22A Raptor',
    defaultLat: 24.3, defaultLng: 54.6, defaultLocation: 'Al-Dhafra AB, VAE' },

  // ── US Missile Defense ──
  { id: 'thaad-deploy', keywords: ['thaad', 'terminal high altitude'],
    unitName: 'THAAD Batterie', unitType: 'Raketenabwehrsystem',
    actor: 'usa', category: 'missile', strength: '1 THAAD-Batterie, 6 Launcher, AN/TPY-2 Radar',
    defaultLat: 31.0, defaultLng: 34.8, defaultLocation: 'Israel / Golf-Region' },
  { id: 'patriot-deploy', keywords: ['patriot missile', 'patriot battery', 'pac-3', 'patriot air defense'],
    unitName: 'Patriot PAC-3 Batterie', unitType: 'Flugabwehr / Raketenabwehr',
    actor: 'usa', category: 'missile', strength: 'Patriot PAC-3 MSE, AN/MPQ-65 Radar',
    defaultLat: 24.1, defaultLng: 47.6, defaultLocation: 'Saudi-Arabien / Golf' },

  // ── US Naval / Submarine ──
  { id: 'ssgn-ohio', keywords: ['uss ohio', 'uss florida', 'uss georgia', 'uss michigan', 'ssgn', 'guided missile submarine'],
    unitName: 'SSGN Ohio-Klasse', unitType: 'Lenkwaffen-U-Boot (154 Tomahawk)',
    actor: 'usa', category: 'naval', strength: '1 SSGN, 154 TLAM Tomahawk, SOF-Kapazität',
    defaultLat: 26.0, defaultLng: 52.0, defaultLocation: 'Persischer Golf / Arabisches Meer' },

  // ── US CENTCOM / 5th Fleet ──
  { id: 'centcom-hq', keywords: ['centcom', 'central command', 'us central command'],
    unitName: 'US CENTCOM', unitType: 'Unified Combatant Command',
    actor: 'usa', category: 'base', strength: 'Kommando für Nahen Osten, Zentralasien, Ostafrika',
    defaultLat: 25.1, defaultLng: 51.3, defaultLocation: 'Al-Udeid AB, Qatar / MacDill AFB' },
  { id: 'us-5th-fleet', keywords: ['5th fleet', 'fifth fleet', 'navcent', 'naval forces central'],
    unitName: 'US 5th Fleet / NAVCENT', unitType: 'Fleet Command',
    actor: 'usa', category: 'naval', strength: 'CTF 150/151/152/153/154, ~8.000+ Personal',
    defaultLat: 26.2, defaultLng: 50.6, defaultLocation: 'NSA Bahrain' },

  // ── IRAN ──
  { id: 'irgcn', keywords: ['irgc navy', 'irgcn', 'irgc naval', 'iranian fast boat', 'iranian speedboat'],
    unitName: 'IRGCN (IRGC-Marine)', unitType: 'Schnellboot-Flottille / Küstenverteidigung',
    actor: 'iran', category: 'naval', strength: '~20.000 Personal, 200+ Schnellboote, AShM',
    defaultLat: 27.1, defaultLng: 56.3, defaultLocation: 'Bandar Abbas / Hormuz' },
  { id: 'irgc-aerospace', keywords: ['irgc aerospace', 'iranian missile', 'iranian ballistic', 'shahab', 'emad', 'sejjil', 'fattah', 'kheibar shekan'],
    unitName: 'IRGC Aerospace Force', unitType: 'Raketenstreitkräfte',
    actor: 'iran', category: 'missile', strength: 'Shahab-3, Emad, Sejjil-2, Fattah, ~3.000+ Raketen',
    defaultLat: 34.0, defaultLng: 54.4, defaultLocation: 'Zentral-Iran (verteilt)' },
  { id: 'irin', keywords: ['iranian navy', 'irin', 'iran regular navy', 'iranian frigate', 'iranian destroyer', 'kilo class'],
    unitName: 'IRIN (Iranische Marine)', unitType: 'Reguläre Marine',
    actor: 'iran', category: 'naval', strength: '~18.000 Personal, Fregatten, Korvetten, 3 Kilo-U-Boote',
    defaultLat: 25.4, defaultLng: 57.8, defaultLocation: 'Golf von Oman' },
  { id: 'quds-force', keywords: ['quds force', 'irgc quds', 'qods force'],
    unitName: 'IRGC Quds Force', unitType: 'Expeditionäre Spezialkräfte / Proxy-Steuerung',
    actor: 'iran', category: 'troops', strength: '~5.000-15.000 Berater + verbündete Milizen',
    defaultLat: 35.3, defaultLng: 40.2, defaultLocation: 'Syrien / Irak' },

  // ── IRAN PROXIES ──
  { id: 'houthis', keywords: ['houthi', 'ansar allah', 'houthi militia', 'houthi rebel', 'houthi drone', 'houthi missile', 'houthi attack'],
    unitName: 'Ansar Allah (Houthis)', unitType: 'Bewaffnete Bewegung / Iran-Proxy',
    actor: 'proxy-iran', category: 'proxy', strength: '~30.000-50.000, ballistische Raketen, Drohnen, AShM',
    defaultLat: 15.4, defaultLng: 44.2, defaultLocation: 'Nord-Jemen (Sanaa/Hodeidah)' },
  { id: 'hezbollah', keywords: ['hezbollah', 'hizbollah', 'hizballah', 'nasrallah'],
    unitName: 'Hezbollah', unitType: 'Miliz / Politische Partei / Iran-Proxy',
    actor: 'proxy-iran', category: 'proxy', strength: '~30.000-50.000, 130.000-150.000 Raketen',
    defaultLat: 33.5, defaultLng: 35.5, defaultLocation: 'Libanon (Südlibanon/Bekaa)' },
  { id: 'kataib-hezbollah', keywords: ['kataib hezbollah', "kata'ib hezbollah", 'islamic resistance iraq', 'iraqi militia'],
    unitName: 'Kataib Hezbollah / Islamischer Widerstand Irak', unitType: 'Schiitische Miliz / Iran-Proxy',
    actor: 'proxy-iran', category: 'proxy', strength: '~10.000-15.000, Drohnen, Raketen',
    defaultLat: 33.3, defaultLng: 44.4, defaultLocation: 'Irak (Bagdad/Anbar)' },
  { id: 'hamas', keywords: ['hamas', 'al-qassam', 'qassam brigades'],
    unitName: 'Hamas / Al-Qassam-Brigaden', unitType: 'Bewaffnete Bewegung',
    actor: 'proxy-iran', category: 'proxy', strength: '~25.000-40.000 Kämpfer, Raketen, Tunnel',
    defaultLat: 31.5, defaultLng: 34.4, defaultLocation: 'Gaza' },
  { id: 'pij', keywords: ['islamic jihad', 'pij', 'al-quds brigades'],
    unitName: 'Palästinensischer Islamischer Jihad', unitType: 'Miliz / Iran-Proxy',
    actor: 'proxy-iran', category: 'proxy', strength: '~10.000 Kämpfer, Raketen',
    defaultLat: 31.5, defaultLng: 34.5, defaultLocation: 'Gaza' },

  // ── ISRAEL (USA-Alliiert) ──
  { id: 'idf', keywords: ['idf', 'israel defense forces', 'israeli military', 'israeli army', 'israeli air force', 'iaf'],
    unitName: 'IDF (Israel Defense Forces)', unitType: 'Streitkräfte',
    actor: 'proxy-usa', category: 'troops', strength: '~170.000 aktiv, ~465.000 Reserve',
    defaultLat: 31.8, defaultLng: 34.8, defaultLocation: 'Israel' },
  { id: 'iron-dome', keywords: ['iron dome', 'david sling', "david's sling", 'arrow missile'],
    unitName: 'Israelische Luftabwehr (Iron Dome / Arrow)', unitType: 'Multi-Layer Raketenabwehr',
    actor: 'proxy-usa', category: 'missile', strength: 'Iron Dome, David\'s Sling, Arrow-2/3',
    defaultLat: 31.8, defaultLng: 34.8, defaultLocation: 'Israel (landesweit)' },

  // ── US DESTROYERS (Arleigh Burke-class) ──
  { id: 'ddg-gravely', keywords: ['uss gravely', 'ddg-107', 'ddg 107'],
    unitName: 'USS Gravely (DDG-107)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 96 VLS, SM-2/SM-6/Tomahawk',
    defaultLat: 16.5, defaultLng: 40.5, defaultLocation: 'Rotes Meer' },
  { id: 'ddg-mason', keywords: ['uss mason', 'ddg-87', 'ddg 87'],
    unitName: 'USS Mason (DDG-87)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 96 VLS, SM-2/SM-6/Tomahawk',
    defaultLat: 16.5, defaultLng: 40.5, defaultLocation: 'Rotes Meer' },
  { id: 'ddg-carney', keywords: ['uss carney', 'ddg-64', 'ddg 64'],
    unitName: 'USS Carney (DDG-64)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 96 VLS, SM-2/SM-6/Tomahawk',
    defaultLat: 16.5, defaultLng: 40.5, defaultLocation: 'Rotes Meer' },
  { id: 'ddg-laboon', keywords: ['uss laboon', 'ddg-58', 'ddg 58'],
    unitName: 'USS Laboon (DDG-58)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 90 VLS, SM-2/Tomahawk',
    defaultLat: 16.5, defaultLng: 40.5, defaultLocation: 'Rotes Meer' },
  { id: 'ddg-stockdale', keywords: ['uss stockdale', 'ddg-106', 'ddg 106'],
    unitName: 'USS Stockdale (DDG-106)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 96 VLS, SM-2/SM-6/Tomahawk',
    defaultLat: 25.0, defaultLng: 55.0, defaultLocation: 'Persischer Golf' },
  { id: 'ddg-spence', keywords: ['uss spence', 'ddg-111', 'ddg 111'],
    unitName: 'USS Spence (DDG-111)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 96 VLS, SM-2/SM-6/Tomahawk',
    defaultLat: 25.0, defaultLng: 55.0, defaultLocation: 'Persischer Golf' },
  { id: 'ddg-stethem', keywords: ['uss stethem', 'ddg-63', 'ddg 63'],
    unitName: 'USS Stethem (DDG-63)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 90 VLS',
    defaultLat: 26.0, defaultLng: 52.0, defaultLocation: 'Persischer Golf' },
  { id: 'ddg-thomas-hudner', keywords: ['uss thomas hudner', 'ddg-116', 'ddg 116'],
    unitName: 'USS Thomas Hudner (DDG-116)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 96 VLS, SM-2/SM-6/Tomahawk',
    defaultLat: 16.5, defaultLng: 40.5, defaultLocation: 'Rotes Meer' },
  { id: 'ddg-fitzgerald', keywords: ['uss fitzgerald', 'ddg-62', 'ddg 62'],
    unitName: 'USS Fitzgerald (DDG-62)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 90 VLS',
    defaultLat: 25.0, defaultLng: 55.0, defaultLocation: 'Persischer Golf' },
  { id: 'ddg-bulkeley', keywords: ['uss bulkeley', 'ddg-84', 'ddg 84'],
    unitName: 'USS Bulkeley (DDG-84)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 96 VLS',
    defaultLat: 26.0, defaultLng: 52.0, defaultLocation: 'Persischer Golf' },
  { id: 'ddg-cole', keywords: ['uss cole', 'ddg-67', 'ddg 67'],
    unitName: 'USS Cole (DDG-67)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 96 VLS',
    defaultLat: 26.0, defaultLng: 52.0, defaultLocation: 'Persischer Golf' },
  { id: 'ddg-stout', keywords: ['uss stout', 'ddg-55', 'ddg 55'],
    unitName: 'USS Stout (DDG-55)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 90 VLS',
    defaultLat: 34.0, defaultLng: 32.0, defaultLocation: 'Mittelmeer' },
  { id: 'ddg-ramage', keywords: ['uss ramage', 'ddg-61', 'ddg 61'],
    unitName: 'USS Ramage (DDG-61)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 90 VLS',
    defaultLat: 34.0, defaultLng: 32.0, defaultLocation: 'Mittelmeer' },
  { id: 'ddg-truxtun', keywords: ['uss truxtun', 'ddg-103', 'ddg 103'],
    unitName: 'USS Truxtun (DDG-103)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 96 VLS',
    defaultLat: 25.0, defaultLng: 55.0, defaultLocation: 'Persischer Golf' },
  { id: 'ddg-nitze', keywords: ['uss nitze', 'ddg-94', 'ddg 94'],
    unitName: 'USS Nitze (DDG-94)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 96 VLS',
    defaultLat: 26.0, defaultLng: 52.0, defaultLocation: 'Persischer Golf' },
  { id: 'ddg-pinckney', keywords: ['uss pinckney', 'ddg-91', 'ddg 91'],
    unitName: 'USS Pinckney (DDG-91)', unitType: 'Arleigh Burke-class Destroyer',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 96 VLS',
    defaultLat: 25.0, defaultLng: 55.0, defaultLocation: 'Persischer Golf' },

  // ── US CRUISERS (Ticonderoga-class) ──
  { id: 'cg-philippine-sea', keywords: ['uss philippine sea', 'cg-58', 'cg 58'],
    unitName: 'USS Philippine Sea (CG-58)', unitType: 'Ticonderoga-class Cruiser',
    actor: 'usa', category: 'naval', strength: 'Aegis CG, 122 VLS, SM-2/SM-6/Tomahawk, BMD-fähig',
    defaultLat: 25.0, defaultLng: 55.0, defaultLocation: 'Persischer Golf' },
  { id: 'cg-gettysburg', keywords: ['uss gettysburg', 'cg-64', 'cg 64'],
    unitName: 'USS Gettysburg (CG-64)', unitType: 'Ticonderoga-class Cruiser',
    actor: 'usa', category: 'naval', strength: 'Aegis CG, 122 VLS, SM-2/SM-6/Tomahawk, BMD-fähig',
    defaultLat: 34.0, defaultLng: 32.0, defaultLocation: 'Mittelmeer' },
  { id: 'cg-leyte-gulf', keywords: ['uss leyte gulf', 'cg-55', 'cg 55'],
    unitName: 'USS Leyte Gulf (CG-55)', unitType: 'Ticonderoga-class Cruiser',
    actor: 'usa', category: 'naval', strength: 'Aegis CG, 122 VLS, BMD-fähig',
    defaultLat: 26.0, defaultLng: 52.0, defaultLocation: 'Persischer Golf' },
  { id: 'cg-san-jacinto', keywords: ['uss san jacinto', 'cg-56', 'cg 56'],
    unitName: 'USS San Jacinto (CG-56)', unitType: 'Ticonderoga-class Cruiser',
    actor: 'usa', category: 'naval', strength: 'Aegis CG, 122 VLS, BMD-fähig',
    defaultLat: 25.0, defaultLng: 55.0, defaultLocation: 'Persischer Golf' },
  { id: 'cg-normandy', keywords: ['uss normandy', 'cg-60', 'cg 60'],
    unitName: 'USS Normandy (CG-60)', unitType: 'Ticonderoga-class Cruiser',
    actor: 'usa', category: 'naval', strength: 'Aegis CG, 122 VLS, BMD-fähig',
    defaultLat: 34.0, defaultLng: 32.0, defaultLocation: 'Mittelmeer' },

  // ── US AMPHIBIOUS (more LHDs/LPDs) ──
  { id: 'uss-boxer', keywords: ['uss boxer', 'lhd-4', 'lhd 4'],
    unitName: 'ARG — USS Boxer (LHD-4)', unitType: 'Amphibious Ready Group + 13th MEU',
    actor: 'usa', category: 'naval', strength: '~4.500 Marines + Navy, LHD + 2 escorts',
    defaultLat: 26.0, defaultLng: 52.0, defaultLocation: 'Persischer Golf' },
  { id: 'uss-makin-island', keywords: ['uss makin island', 'lhd-8', 'lhd 8'],
    unitName: 'ARG — USS Makin Island (LHD-8)', unitType: 'Amphibious Ready Group',
    actor: 'usa', category: 'naval', strength: '~4.500 Marines + Navy, LHD + 2 escorts',
    defaultLat: 18.0, defaultLng: 62.0, defaultLocation: 'Arabisches Meer' },
  { id: 'uss-iwo-jima', keywords: ['uss iwo jima', 'lhd-7', 'lhd 7'],
    unitName: 'ARG — USS Iwo Jima (LHD-7)', unitType: 'Amphibious Ready Group + 24th MEU',
    actor: 'usa', category: 'naval', strength: '~4.500 Marines + Navy',
    defaultLat: 34.0, defaultLng: 33.0, defaultLocation: 'Mittelmeer' },

  // ── US FIGHTER / ATTACK SQUADRONS ──
  { id: 'f-15e-deploy', keywords: ['f-15e', 'f-15 strike eagle', 'strike eagle deploy', 'f-15 middle east', 'f-15 gulf'],
    unitName: 'F-15E Strike Eagle Deployment', unitType: 'Strike Fighter Squadron',
    actor: 'usa', category: 'air', strength: '24-48 F-15E Strike Eagles',
    defaultLat: 24.3, defaultLng: 54.6, defaultLocation: 'Al-Dhafra AB / Golf-Region' },
  { id: 'f-16-deploy', keywords: ['f-16 deploy', 'f-16 fighting falcon', 'f-16 middle east', 'f-16 gulf', 'f-16 squadron', 'f-16c', 'f-16 viper'],
    unitName: 'F-16 Fighting Falcon Deployment', unitType: 'Multi-Role Fighter Squadron',
    actor: 'usa', category: 'air', strength: '24-48 F-16C/D',
    defaultLat: 29.0, defaultLng: 48.2, defaultLocation: 'Kuwait / Golf-Region' },
  { id: 'a-10-deploy', keywords: ['a-10', 'warthog', 'thunderbolt ii', 'a-10 deploy', 'a-10 middle east'],
    unitName: 'A-10C Thunderbolt II Deployment', unitType: 'Close Air Support Squadron',
    actor: 'usa', category: 'air', strength: '12-24 A-10C Warthog',
    defaultLat: 24.3, defaultLng: 54.6, defaultLocation: 'Al-Dhafra AB / Golf-Region' },
  { id: 'f-18-deploy', keywords: ['f/a-18', 'f-18', 'super hornet', 'hornet deploy', 'vfa-'],
    unitName: 'F/A-18E/F Super Hornet Deployment', unitType: 'Carrier Air Wing Fighters',
    actor: 'usa', category: 'air', strength: '44 F/A-18E/F per Carrier Air Wing',
    defaultLat: 25.0, defaultLng: 55.0, defaultLocation: 'Carrier Air Wing' },

  // ── US STRATEGIC BOMBERS ──
  { id: 'b-2-deploy', keywords: ['b-2 spirit', 'b-2 stealth', 'b-2 bomber', 'stealth bomber deploy'],
    unitName: 'B-2 Spirit Stealth Bomber Task Force', unitType: 'Strategic Stealth Bomber',
    actor: 'usa', category: 'air', strength: '2-3 B-2 Spirit + Tanker-Unterstützung',
    defaultLat: 7.3, defaultLng: 72.4, defaultLocation: 'Diego Garcia / Whiteman AFB forward' },
  { id: 'b-21-deploy', keywords: ['b-21', 'b-21 raider', 'raider bomber'],
    unitName: 'B-21 Raider', unitType: 'Next-Gen Strategic Stealth Bomber',
    actor: 'usa', category: 'air', strength: 'B-21 Raider (6th Gen)',
    defaultLat: 32.9, defaultLng: -118.0, defaultLocation: 'Edwards AFB / Forward' },

  // ── US ISR / SURVEILLANCE ASSETS ──
  { id: 'mq-9-deploy', keywords: ['mq-9', 'mq9', 'reaper drone', 'reaper uav', 'predator b'],
    unitName: 'MQ-9 Reaper ISR/Strike UAS', unitType: 'Bewaffnete Aufklärungsdrohne',
    actor: 'usa', category: 'air', strength: 'MQ-9 Reaper, Hellfire/JDAM-fähig, 27h Flugdauer',
    defaultLat: 11.55, defaultLng: 43.15, defaultLocation: 'Camp Lemonnier / Al-Dhafra / Ali Al Salem' },
  { id: 'rq-4-deploy', keywords: ['rq-4', 'global hawk', 'rq4', 'bams-d', 'triton'],
    unitName: 'RQ-4 Global Hawk / MQ-4C Triton HALE ISR', unitType: 'Strategische Aufklärung',
    actor: 'usa', category: 'air', strength: 'RQ-4B/MQ-4C, 32h Flugdauer, 60.000ft, SIGINT/EO/IR/SAR',
    defaultLat: 24.3, defaultLng: 54.6, defaultLocation: 'Al-Dhafra AB' },
  { id: 'p-8-deploy', keywords: ['p-8', 'p-8a', 'poseidon', 'p8 poseidon', 'maritime patrol'],
    unitName: 'P-8A Poseidon Maritime Patrol', unitType: 'Maritime Patrol / ASW',
    actor: 'usa', category: 'air', strength: 'P-8A Poseidon, ASW + ISR + AShM (Harpoon)',
    defaultLat: 26.2, defaultLng: 50.6, defaultLocation: 'Bahrain / Dschibuti' },
  { id: 'e-3-deploy', keywords: ['e-3', 'awacs', 'e3 sentry', 'e-3 sentry', 'airborne warning'],
    unitName: 'E-3 Sentry AWACS', unitType: 'Airborne Early Warning & Control',
    actor: 'usa', category: 'air', strength: 'E-3B/C Sentry, 360° Radar, 250nm Reichweite',
    defaultLat: 24.06, defaultLng: 47.58, defaultLocation: 'PSAB / Al-Udeid' },
  { id: 'e-2d-deploy', keywords: ['e-2d', 'e-2 hawkeye', 'hawkeye', 'e2d advanced hawkeye'],
    unitName: 'E-2D Advanced Hawkeye', unitType: 'Carrier-based AEW&C',
    actor: 'usa', category: 'air', strength: 'E-2D, AN/APY-9 Radar, Carrier Air Wing AEW',
    defaultLat: 25.0, defaultLng: 55.0, defaultLocation: 'Carrier Air Wing' },
  { id: 'rc-135-deploy', keywords: ['rc-135', 'rivet joint', 'rc135'],
    unitName: 'RC-135V/W Rivet Joint SIGINT', unitType: 'Signals Intelligence Aircraft',
    actor: 'usa', category: 'air', strength: 'RC-135V/W, SIGINT/ELINT, Echtzeit-Aufklärung',
    defaultLat: 25.1, defaultLng: 51.3, defaultLocation: 'Al-Udeid AB' },
  { id: 'ep-3-deploy', keywords: ['ep-3', 'ep3 aries', 'aries ii'],
    unitName: 'EP-3E ARIES II SIGINT', unitType: 'Signals Intelligence Aircraft',
    actor: 'usa', category: 'air', strength: 'EP-3E ARIES II, SIGINT/ELINT',
    defaultLat: 26.2, defaultLng: 50.6, defaultLocation: 'Bahrain' },
  { id: 'u-2-deploy', keywords: ['u-2', 'dragon lady', 'u2 reconnaissance'],
    unitName: 'U-2S Dragon Lady', unitType: 'Strategische Höhenaufklärung',
    actor: 'usa', category: 'air', strength: 'U-2S, 70.000ft, EO/IR/SAR/SIGINT',
    defaultLat: 24.3, defaultLng: 54.6, defaultLocation: 'Al-Dhafra AB' },

  // ── US TANKER / SUPPORT ──
  { id: 'kc-135-deploy', keywords: ['kc-135', 'kc135', 'stratotanker', 'kc-135 tanker'],
    unitName: 'KC-135 Stratotanker', unitType: 'Aerial Refueling',
    actor: 'usa', category: 'air', strength: 'KC-135R, 67.500kg JP-8, Boom + Drogue',
    defaultLat: 25.1, defaultLng: 51.3, defaultLocation: 'Al-Udeid AB' },
  { id: 'kc-46-deploy', keywords: ['kc-46', 'kc46', 'pegasus tanker'],
    unitName: 'KC-46A Pegasus', unitType: 'Next-Gen Aerial Refueling',
    actor: 'usa', category: 'air', strength: 'KC-46A Pegasus, 94.200kg Treibstoff',
    defaultLat: 25.1, defaultLng: 51.3, defaultLocation: 'Al-Udeid AB' },
  { id: 'c-17-deploy', keywords: ['c-17', 'c17 globemaster', 'globemaster'],
    unitName: 'C-17 Globemaster III Airlift', unitType: 'Strategic Airlift',
    actor: 'usa', category: 'air', strength: 'C-17A, 77.500kg Payload, Strategic Airlift',
    defaultLat: 25.1, defaultLng: 51.3, defaultLocation: 'Al-Udeid AB' },

  // ── US SSN Attack Submarines ──
  { id: 'ssn-generic', keywords: ['attack submarine', 'ssn deploy', 'los angeles class', 'virginia class', 'fast attack submarine'],
    unitName: 'US SSN Attack Submarine', unitType: 'Angriffs-U-Boot',
    actor: 'usa', category: 'naval', strength: 'SSN, Tomahawk TLAM + Mk48 ADCAP',
    defaultLat: 26.0, defaultLng: 52.0, defaultLocation: 'Persischer Golf / Arabisches Meer' },

  // ── US GROUND FORCES in Region ──
  { id: '82nd-airborne', keywords: ['82nd airborne', '82nd division'],
    unitName: '82nd Airborne Division (IRF)', unitType: 'Immediate Response Force',
    actor: 'usa', category: 'troops', strength: '~3.500 Fallschirmjäger, Sofort-Einsatz',
    defaultLat: 29.0, defaultLng: 48.2, defaultLocation: 'Kuwait / Fort Liberty' },
  { id: '101st-airborne', keywords: ['101st airborne', 'screaming eagles'],
    unitName: '101st Airborne Division', unitType: 'Air Assault Division',
    actor: 'usa', category: 'troops', strength: '~16.000 Soldaten, Luftlandefähig',
    defaultLat: 29.0, defaultLng: 48.2, defaultLocation: 'Naher Osten / Fort Campbell' },
  { id: '1st-armored', keywords: ['1st armored division', '1st armored'],
    unitName: '1st Armored Division', unitType: 'Armored Division',
    actor: 'usa', category: 'troops', strength: 'M1A2 Abrams, M2 Bradley, ~16.000',
    defaultLat: 29.0, defaultLng: 48.2, defaultLocation: 'Kuwait' },
  { id: 'usmc-meu', keywords: ['marine expeditionary unit', 'meu deploy', '22nd meu', '24th meu', '26th meu', '11th meu', '13th meu', '15th meu', '31st meu'],
    unitName: 'Marine Expeditionary Unit (MEU)', unitType: 'Amphibische Einsatzgruppe',
    actor: 'usa', category: 'troops', strength: '~2.200 Marines, MAGTF, AV-8B/MV-22/AH-1Z',
    defaultLat: 26.0, defaultLng: 52.0, defaultLocation: 'Golf / Rotes Meer' },
  { id: 'delta-jsoc', keywords: ['jsoc', 'delta force', 'seal team', 'special operations', 'spec ops', 'tier 1'],
    unitName: 'USSOCOM / JSOC Forward', unitType: 'Spezialkräfte-Kommando',
    actor: 'usa', category: 'troops', strength: 'JSOC/SOCOM Forward, Delta/DEVGRU/Rangers',
    defaultLat: 33.79, defaultLng: 42.44, defaultLocation: 'Ain al-Assad / Erbil' },

  // ── IRAN — More specific units ──
  { id: 'iran-shahed-drone', keywords: ['shahed', 'shahed-136', 'shahed 136', 'iranian drone', 'shahed drone', 'iranian uav'],
    unitName: 'Shahed-136 / Shahed-129 Drohnenflotte', unitType: 'Loitering Munition / UCAV',
    actor: 'iran', category: 'air', strength: 'Shahed-136 Kamikaze-Drohnen, Shahed-129 ISR/Strike',
    defaultLat: 33.0, defaultLng: 52.0, defaultLocation: 'Iran (Produktion landesweit)' },
  { id: 'iran-s300', keywords: ['s-300', 's300', 'iranian air defense', 'bavar-373', 'bavar 373', 'khordad'],
    unitName: 'Iranische Luftabwehr (S-300/Bavar-373)', unitType: 'Flugabwehr / SAM',
    actor: 'iran', category: 'missile', strength: 'S-300PMU-2, Bavar-373, 3rd Khordad',
    defaultLat: 32.4, defaultLng: 53.7, defaultLocation: 'Iran (verteilt)' },
  { id: 'iran-navy-sub', keywords: ['fateh submarine', 'ghadir submarine', 'iranian submarine', 'iran submarine', 'nahang'],
    unitName: 'Iranische U-Boot-Flotte', unitType: 'U-Boote / Midget-Subs',
    actor: 'iran', category: 'naval', strength: '3 Kilo-Klasse, Fateh-Klasse, 23+ Ghadir-Midgets',
    defaultLat: 27.1, defaultLng: 56.3, defaultLocation: 'Bandar Abbas' },
  { id: 'iran-fast-boats', keywords: ['iranian fast attack', 'fast boat', 'speedboat attack', 'swarm boat', 'boghammar'],
    unitName: 'IRGCN Schnellboot-Schwärme', unitType: 'Asymmetrische Seekriegführung',
    actor: 'iran', category: 'naval', strength: '200+ Schnellboote, RPG/AShM/Minen',
    defaultLat: 26.5, defaultLng: 56.3, defaultLocation: 'Straße von Hormuz' },
  { id: 'iran-tanker-seizure', keywords: ['tanker seiz', 'oil tanker iran', 'iranian seiz', 'iran detain ship', 'iran capture ship'],
    unitName: 'IRGCN Tanker-Operationen', unitType: 'Maritime Interdiction',
    actor: 'iran', category: 'naval', strength: 'Tanker-Beschlagnahmung / Boarding-Ops',
    defaultLat: 26.5, defaultLng: 56.3, defaultLocation: 'Straße von Hormuz' },

  // ── HOUTHI specific weapon systems ──
  { id: 'houthi-ashm', keywords: ['houthi anti-ship', 'houthi missile ship', 'houthi shipping attack', 'houthi red sea attack'],
    unitName: 'Houthi Anti-Ship Missile Ops', unitType: 'AShM / Anti-Schiff-Raketen',
    actor: 'proxy-iran', category: 'missile', strength: 'C-802 Varianten, AShM, Seeminen',
    defaultLat: 14.0, defaultLng: 42.5, defaultLocation: 'Rotes Meer / Bab el-Mandeb' },
  { id: 'houthi-uav', keywords: ['houthi drone', 'houthi uav', 'houthi unmanned', 'samad drone'],
    unitName: 'Houthi UAV / Drohnen-Operationen', unitType: 'UAS / Loitering Munition',
    actor: 'proxy-iran', category: 'air', strength: 'Samad-3, Qasef-2K, Shahed-Varianten',
    defaultLat: 15.0, defaultLng: 43.5, defaultLocation: 'Jemen / Rotes Meer' },
  { id: 'houthi-ballistic', keywords: ['houthi ballistic', 'houthi missile launch', 'houthi long range'],
    unitName: 'Houthi Ballistische Raketen', unitType: 'MRBM / Ballistische Raketen',
    actor: 'proxy-iran', category: 'missile', strength: 'Burkan-2H, Toufan, Zulfiqar-Varianten',
    defaultLat: 15.4, defaultLng: 44.2, defaultLocation: 'Nord-Jemen' },

  // ── HEZBOLLAH specific ──
  { id: 'hezbollah-rockets', keywords: ['hezbollah rocket', 'hezbollah missile', 'hezbollah launch', 'hezbollah fire', 'hezbollah attack israel'],
    unitName: 'Hezbollah Raketenstreitkräfte', unitType: 'Raketenbeschuss / Artillerie',
    actor: 'proxy-iran', category: 'missile', strength: '130.000-150.000 Raketen, Grad/Fajr/Zelzal/Fateh-110',
    defaultLat: 33.3, defaultLng: 35.4, defaultLocation: 'Südlibanon' },
  { id: 'hezbollah-atgm', keywords: ['hezbollah anti-tank', 'hezbollah kornet', 'hezbollah atgm'],
    unitName: 'Hezbollah ATGM Teams', unitType: 'Panzerabwehr',
    actor: 'proxy-iran', category: 'troops', strength: 'Kornet, Konkurs, Metis-M ATGM',
    defaultLat: 33.2, defaultLng: 35.4, defaultLocation: 'Südlibanon' },

  // ── IDF specific systems ──
  { id: 'idf-air-force', keywords: ['israeli f-35', 'iaf f-35', 'israeli f-15', 'israeli air force strike', 'iaf strike', 'iaf airstrike'],
    unitName: 'IAF (Israelische Luftwaffe)', unitType: 'Luftwaffe (F-35I Adir, F-15I Ra\'am)',
    actor: 'proxy-usa', category: 'air', strength: '~600 Kampfflugzeuge, F-35I, F-15I, F-16I',
    defaultLat: 31.2, defaultLng: 34.5, defaultLocation: 'Nevatim / Ramon AB' },
  { id: 'idf-navy', keywords: ['israeli navy', 'israeli corvette', 'saar 6', 'saar 5', 'dolphin submarine'],
    unitName: 'Israelische Marine', unitType: 'Korvetten / U-Boote',
    actor: 'proxy-usa', category: 'naval', strength: 'Sa\'ar 6, Sa\'ar 5, 5 Dolphin-U-Boote',
    defaultLat: 32.8, defaultLng: 34.9, defaultLocation: 'Haifa' },
  { id: 'idf-ground-ops', keywords: ['idf ground operation', 'israeli ground', 'idf troops', 'idf invasion', 'israeli incursion'],
    unitName: 'IDF Bodenoperationen', unitType: 'Bodentruppen / Gepanzerte Division',
    actor: 'proxy-usa', category: 'troops', strength: 'Merkava Mk4, Namer APC, Combat Engineering',
    defaultLat: 31.4, defaultLng: 34.4, defaultLocation: 'Gaza / Grenzgebiet' },

  // ── SAUDI ARABIA ──
  { id: 'rsaf', keywords: ['saudi air force', 'rsaf', 'saudi f-15', 'saudi typhoon', 'saudi tornado'],
    unitName: 'Royal Saudi Air Force (RSAF)', unitType: 'Luftwaffe',
    actor: 'proxy-usa', category: 'air', strength: 'F-15SA, Typhoon, Tornado IDS, ~350 Kampfflugzeuge',
    defaultLat: 24.7, defaultLng: 46.7, defaultLocation: 'Saudi-Arabien' },
  { id: 'saudi-patriot', keywords: ['saudi patriot', 'saudi air defense', 'saudi intercept'],
    unitName: 'Saudi Raketenabwehr', unitType: 'Patriot / THAAD',
    actor: 'proxy-usa', category: 'missile', strength: 'Patriot PAC-3, THAAD',
    defaultLat: 24.0, defaultLng: 45.0, defaultLocation: 'Saudi-Arabien' },

  // ── UK / France ──
  { id: 'uk-navy', keywords: ['royal navy', 'hms', 'type 45', 'type 23', 'uk warship', 'british warship'],
    unitName: 'Royal Navy Deployment', unitType: 'UK Marinekräfte',
    actor: 'usa', category: 'naval', strength: 'Zerstörer / Fregatte',
    defaultLat: 16.0, defaultLng: 42.0, defaultLocation: 'Rotes Meer / Golf' },
  { id: 'hms-diamond', keywords: ['hms diamond', 'hms richmond', 'hms lancaster'],
    unitName: 'HMS Diamond / UK Escort', unitType: 'Type 45 Destroyer',
    actor: 'usa', category: 'naval', strength: 'Type 45 DDG, Sea Viper SAM, 48 VLS',
    defaultLat: 16.0, defaultLng: 41.5, defaultLocation: 'Rotes Meer' },
  { id: 'french-navy', keywords: ['french navy', 'marine nationale', 'charles de gaulle', 'fremm'],
    unitName: 'Marine Nationale Deployment', unitType: 'Französische Marine',
    actor: 'usa', category: 'naval', strength: 'Flugzeugträger / Fregatte',
    defaultLat: 11.6, defaultLng: 43.1, defaultLocation: 'Dschibuti / Indischer Ozean' },

  // ── GENERIC CATCH-ALL PATTERNS ──
  { id: 'us-destroyer-generic', keywords: ['us destroyer', 'navy destroyer', 'arleigh burke', 'guided missile destroyer'],
    unitName: 'US Destroyer (Arleigh Burke-class)', unitType: 'Aegis DDG',
    actor: 'usa', category: 'naval', strength: 'Aegis DDG, 96 VLS, SM-2/SM-6/Tomahawk',
    defaultLat: 26.0, defaultLng: 52.0, defaultLocation: 'Persischer Golf' },
  { id: 'us-cruiser-generic', keywords: ['us cruiser', 'navy cruiser', 'ticonderoga'],
    unitName: 'US Cruiser (Ticonderoga-class)', unitType: 'Aegis CG',
    actor: 'usa', category: 'naval', strength: 'Aegis CG, 122 VLS, BMD-fähig',
    defaultLat: 26.0, defaultLng: 52.0, defaultLocation: 'Persischer Golf' },
  { id: 'us-fighter-generic', keywords: ['us fighter jet', 'us warplane', 'american jet', 'us air force deploy', 'usaf deploy'],
    unitName: 'USAF Fighter Deployment', unitType: 'Kampfflugzeug-Verlegung',
    actor: 'usa', category: 'air', strength: 'Fighter/Attack Squadron',
    defaultLat: 25.1, defaultLng: 51.3, defaultLocation: 'Golf-Region' },
  { id: 'us-troops-generic', keywords: ['us troops deploy', 'american soldiers', 'us forces middle east', 'pentagon deploy troops', 'additional troops'],
    unitName: 'US Truppenverlegung', unitType: 'Bodentruppen-Deployment',
    actor: 'usa', category: 'troops', strength: 'Truppenverlegung in die Region',
    defaultLat: 29.0, defaultLng: 48.2, defaultLocation: 'Kuwait / Golf' },
  { id: 'us-buildup-generic', keywords: ['force buildup', 'military buildup', 'us buildup', 'troop buildup', 'force posture', 'reinforcement'],
    unitName: 'US Force Buildup / Kräfteaufwuchs', unitType: 'Kräfteaufwuchs',
    actor: 'usa', category: 'troops', strength: 'Verstärkung / Umgruppierung',
    defaultLat: 26.0, defaultLng: 52.0, defaultLocation: 'CENTCOM AOR' },
];

// ── GDELT queries specifically for force deployments ──
const FORCE_QUERIES = [
  // US Navy / Carrier movements
  { query: '("carrier strike group" OR "aircraft carrier" OR "USS Lincoln" OR "USS Truman" OR "USS Ford" OR "USS Vinson" OR "USS Nimitz" OR CVN) (deploy OR arrive OR transit OR operate OR patrol OR "Middle East" OR Gulf)', label: 'US Carrier Movements' },
  // US Destroyers / Escorts
  { query: '("USS Mason" OR "USS Gravely" OR "USS Carney" OR "USS Laboon" OR "USS Stockdale" OR "USS Hudner" OR "USS Cole" OR "USS Stout" OR destroyer) ("Red Sea" OR Gulf OR deploy OR intercept OR escort)', label: 'US Destroyer Ops' },
  // US forces general / buildup
  { query: '(CENTCOM OR "5th Fleet" OR Pentagon OR "US military") (deploy OR reinforce OR surge OR buildup OR "additional troops" OR "force posture" OR reposit OR send)', label: 'US Force Posture' },
  // Force buildup specific
  { query: '("force buildup" OR "military buildup" OR "troop buildup" OR "massive deployment" OR "surge" OR "reinforcement") ("Middle East" OR Gulf OR Iran OR "Red Sea")', label: 'Force Buildup Intel' },
  // Air assets — fighters
  { query: '(F-35 OR F-22 OR F-15E OR F-16 OR "strike eagle" OR "fighting falcon" OR A-10 OR "fighter squadron" OR "fighter wing") (deploy OR arrive OR "Middle East" OR Gulf)', label: 'US Fighter Deployments' },
  // Air assets — bombers & heavy
  { query: '(B-52 OR B-1B OR B-2 OR B-21 OR "bomber task force" OR "strategic bomber") (deploy OR "Middle East" OR Gulf OR "Diego Garcia" OR "bomber mission")', label: 'US Bomber Ops' },
  // Air assets — ISR & Support
  { query: '(MQ-9 OR "Global Hawk" OR RQ-4 OR P-8 OR AWACS OR "Rivet Joint" OR RC-135 OR U-2 OR "surveillance" OR KC-135 OR KC-46 OR tanker) ("Middle East" OR Gulf OR deploy OR "Red Sea")', label: 'US ISR/Support Aircraft' },
  // Missile defense
  { query: '(THAAD OR Patriot OR "missile defense" OR "Iron Dome" OR "David Sling" OR Arrow OR "air defense" OR PAC-3) (deploy OR arrive OR position OR intercept)', label: 'Missile Defense' },
  // Submarine / Special
  { query: '(submarine OR SSGN OR "attack submarine" OR "guided missile" OR "special operations" OR JSOC OR "Navy SEAL") ("Middle East" OR Gulf OR "Red Sea" OR Mediterranean)', label: 'US Submarine/SOF' },
  // Amphibious / Marines
  { query: '("amphibious" OR "marine expeditionary" OR MEU OR "USS Bataan" OR "USS Boxer" OR "USS Wasp" OR "USS Makin Island" OR "USS Iwo Jima" OR LHD) (deploy OR "Middle East" OR Mediterranean OR Gulf)', label: 'US Amphibious/Marines' },
  // US Ground Forces
  { query: '("82nd airborne" OR "101st airborne" OR "1st armored" OR "army deploy" OR "troops deploy" OR "soldiers") ("Middle East" OR Kuwait OR Iraq OR Jordan OR "Gulf region")', label: 'US Ground Forces' },
  // Iran forces
  { query: '(IRGC OR "Iranian navy" OR "Iranian military" OR "Revolutionary Guard" OR "Quds Force") (deploy OR exercise OR drill OR launch OR test OR move OR buildup)', label: 'Iran Force Activity' },
  // Iran missiles & drones
  { query: '(Iran OR IRGC) (missile OR ballistic OR "Shahed" OR drone OR "hypersonic" OR "satellite" OR "nuclear" OR "enrichment" OR "Fattah" OR "Kheibar")', label: 'Iran Missile/Drone/Nuclear' },
  // Iran naval / asymmetric
  { query: '("Iranian navy" OR IRGCN OR "fast boat" OR "speedboat" OR "tanker seiz" OR "oil tanker" OR "Strait of Hormuz") (seize OR attack OR board OR intercept OR exercise OR drill)', label: 'Iran Naval/Asymmetric' },
  // Proxies — Houthis
  { query: '(Houthi OR "Ansar Allah") (attack OR launch OR fire OR strike OR missile OR drone OR ship OR "Red Sea" OR "Gulf of Aden" OR intercept)', label: 'Houthi Activity' },
  // Proxies — Lebanon/Iraq
  { query: '(Hezbollah OR "Kataib Hezbollah" OR "Islamic Resistance" OR "Iraqi militia" OR PMF) (attack OR launch OR fire OR strike OR rocket OR deploy)', label: 'Iran Proxy Iraq/Lebanon' },
  // Proxies — Hamas/PIJ
  { query: '(Hamas OR "Islamic Jihad" OR "Al-Qassam") (attack OR launch OR fire OR rocket OR tunnel OR buildup)', label: 'Hamas/PIJ Activity' },
  // Red Sea / shipping security
  { query: '("Red Sea" OR "Bab el-Mandeb" OR "Gulf of Aden") (attack OR intercept OR missile OR drone OR warship OR escort OR patrol OR shipping)', label: 'Red Sea Security' },
  // Israel / IDF
  { query: '(IDF OR "Israeli air force" OR "Israeli navy" OR "Iron Dome" OR "Israeli military") (strike OR deploy OR intercept OR operation OR airstrike)', label: 'IDF Operations' },
  // UK/France/Coalition
  { query: '("Royal Navy" OR HMS OR "Marine Nationale" OR "coalition" OR NATO OR "allied") ("Middle East" OR "Red Sea" OR Gulf OR Mediterranean) (deploy OR patrol OR escort)', label: 'Coalition Partners' },
  // Saudi/UAE
  { query: '("Saudi air force" OR RSAF OR "UAE military" OR "Saudi military" OR "Saudi intercept") (deploy OR strike OR intercept OR exercise)', label: 'Saudi/UAE Military' },
];

// ── Safe JSON parse ──
function safeParseGdelt(text: string): any | null {
  const trimmed = text.trim();
  if (!trimmed || !trimmed.startsWith('{')) return null;
  try { return JSON.parse(trimmed); } catch { return null; }
}

function parseGdeltDate(d: string): string {
  try {
    const m = d.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
    return new Date(d).toISOString();
  } catch { return new Date().toISOString(); }
}

// ── Cache ──
interface ForceCache { forces: TrackedForce[]; articles: NewsArticle[]; fetchedAt: number }
let forceCache: ForceCache | null = null;

// ── Detect location from article text ──
function detectLocation(text: string): { lat: number; lng: number; location: string } | null {
  const lower = text.toLowerCase();
  for (const loc of LOCATION_PATTERNS) {
    if (loc.keywords.some(kw => lower.includes(kw))) {
      // Add small jitter to prevent stacking
      return {
        lat: loc.lat + (Math.random() - 0.5) * 0.5,
        lng: loc.lng + (Math.random() - 0.5) * 0.5,
        location: loc.location,
      };
    }
  }
  return null;
}

// ── Main: fetch and process force deployment intel ──
export async function fetchLiveForces(
  onProgress?: (step: number, total: number, label: string) => void,
): Promise<{ forces: TrackedForce[]; articles: NewsArticle[] }> {
  // Cache for 3 minutes
  if (forceCache && Date.now() - forceCache.fetchedAt < 3 * 60 * 1000) {
    return { forces: forceCache.forces, articles: forceCache.articles };
  }

  const seen = new Set<string>();
  const allArticles: NewsArticle[] = [];

  // Fetch all force-related articles
  for (let qi = 0; qi < FORCE_QUERIES.length; qi++) {
    if (qi > 0) await new Promise(r => setTimeout(r, 1200));
    onProgress?.(qi + 1, FORCE_QUERIES.length, FORCE_QUERIES[qi].label);

    const url = `/api/gdelt/api/v2/doc/doc?query=${encodeURIComponent(FORCE_QUERIES[qi].query)}&mode=artlist&maxrecords=75&format=json&sort=datedesc&timespan=20160`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const text = await resp.text();
      const data = safeParseGdelt(text);
      if (!data) continue;

      for (const a of (data.articles ?? [])) {
        if (!a.url || seen.has(a.url)) continue;
        seen.add(a.url);
        allArticles.push({
          id: `force_${allArticles.length}_${Date.now()}`,
          title: a.title ?? 'Untitled',
          url: a.url ?? '#',
          source: (a.domain ?? 'unknown').replace(/^www\./, ''),
          sourceDomain: a.domain ?? '',
          imageUrl: a.socialimage || undefined,
          publishedAt: a.seendate ? parseGdeltDate(a.seendate) : new Date().toISOString(),
          language: a.language ?? 'English',
          countries: [],
          topics: [],
        });
      }
    } catch { /* continue */ }
  }

  // Sort by date
  allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Match articles to known unit patterns
  const unitMatches = new Map<string, {
    pattern: UnitPattern;
    articles: { title: string; url: string; source: string; date: string }[];
    bestLocation: { lat: number; lng: number; location: string } | null;
    latestDate: string;
  }>();

  for (const article of allArticles) {
    const lower = article.title.toLowerCase();
    for (const pattern of UNIT_PATTERNS) {
      if (pattern.keywords.some(kw => lower.includes(kw))) {
        if (!unitMatches.has(pattern.id)) {
          unitMatches.set(pattern.id, {
            pattern,
            articles: [],
            bestLocation: null,
            latestDate: article.publishedAt,
          });
        }
        const match = unitMatches.get(pattern.id)!;
        match.articles.push({
          title: article.title,
          url: article.url,
          source: article.source,
          date: article.publishedAt,
        });
        // Try to extract location from this article
        if (!match.bestLocation) {
          match.bestLocation = detectLocation(article.title);
        }
        // Update latest date
        if (new Date(article.publishedAt).getTime() > new Date(match.latestDate).getTime()) {
          match.latestDate = article.publishedAt;
        }
      }
    }
  }

  // Build TrackedForce entries
  const forces: TrackedForce[] = [];
  for (const [id, match] of unitMatches) {
    const loc = match.bestLocation ?? {
      lat: match.pattern.defaultLat,
      lng: match.pattern.defaultLng,
      location: match.pattern.defaultLocation,
    };
    const articleCount = match.articles.length;

    forces.push({
      id: `live-force-${id}`,
      unitName: match.pattern.unitName,
      unitType: match.pattern.unitType,
      actor: match.pattern.actor,
      category: match.pattern.category,
      lat: loc.lat,
      lng: loc.lng,
      location: loc.location,
      strength: match.pattern.strength,
      status: articleCount >= 3 ? 'active' : 'deploying',
      since: match.latestDate,
      articles: match.articles.slice(0, 8), // Top 8 most recent
      confidence: articleCount >= 5 ? 'high' : articleCount >= 2 ? 'medium' : 'low',
    });
  }

  // Sort: high confidence first, then by date
  forces.sort((a, b) => {
    const confOrder = { high: 0, medium: 1, low: 2 };
    if (confOrder[a.confidence] !== confOrder[b.confidence]) return confOrder[a.confidence] - confOrder[b.confidence];
    return new Date(b.since).getTime() - new Date(a.since).getTime();
  });

  forceCache = { forces, articles: allArticles, fetchedAt: Date.now() };
  return { forces, articles: allArticles };
}

// ── Get static bases (these don't move) ──
export const STATIC_BASES: TrackedForce[] = [
  { id: 'base-aludeid', unitName: 'Al-Udeid Air Base (CENTCOM Fwd HQ)', unitType: 'Air Base / CAOC',
    actor: 'usa', category: 'base', lat: 25.12, lng: 51.31, location: 'Qatar',
    strength: '~10.000 Personal, CENTCOM Forward, Combined Air Ops Center',
    status: 'active', since: '2003-01-01', articles: [], confidence: 'high' },
  { id: 'base-dhafra', unitName: 'Al-Dhafra Air Base', unitType: 'Air Base',
    actor: 'usa', category: 'base', lat: 24.25, lng: 54.55, location: 'VAE',
    strength: 'F-35A, F-22, MQ-9 Reaper, RQ-4 Global Hawk, ~3.500 Personal',
    status: 'active', since: '2002-01-01', articles: [], confidence: 'high' },
  { id: 'base-arifjan', unitName: 'Camp Arifjan (ARCENT Forward)', unitType: 'Army Forward Base',
    actor: 'usa', category: 'base', lat: 28.98, lng: 48.17, location: 'Kuwait',
    strength: '~13.000 Personal, Logistik-Hub',
    status: 'active', since: '2003-01-01', articles: [], confidence: 'high' },
  { id: 'base-bahrain', unitName: 'NSA Bahrain (5th Fleet HQ)', unitType: 'Naval Base',
    actor: 'usa', category: 'base', lat: 26.23, lng: 50.55, location: 'Bahrain',
    strength: 'Fleet HQ, ~8.000 Personal, CTF 150/151/152',
    status: 'active', since: '1995-01-01', articles: [], confidence: 'high' },
  { id: 'base-lemonnier', unitName: 'Camp Lemonnier', unitType: 'Naval Expeditionary Base',
    actor: 'usa', category: 'base', lat: 11.55, lng: 43.15, location: 'Dschibuti',
    strength: '~2.500 Personal, SOF, ISR, MQ-9',
    status: 'active', since: '2003-01-01', articles: [], confidence: 'high' },
  { id: 'base-psab', unitName: 'Prince Sultan Air Base (PSAB)', unitType: 'Air Base',
    actor: 'usa', category: 'base', lat: 24.06, lng: 47.58, location: 'Saudi-Arabien',
    strength: 'Patriot/THAAD, Fighter-Staffeln',
    status: 'active', since: '2019-01-01', articles: [], confidence: 'high' },
  { id: 'base-ainasad', unitName: 'Ain al-Assad Air Base', unitType: 'Air/SOF Base',
    actor: 'usa', category: 'base', lat: 33.79, lng: 42.44, location: 'Irak (Anbar)',
    strength: 'Marines, SOF, ~2.500 Personal',
    status: 'active', since: '2003-01-01', articles: [], confidence: 'high' },
  // Iran bases
  { id: 'base-bandarabbas', unitName: 'Bandar Abbas Marinebasis', unitType: 'Haupt-Marinestützpunkt',
    actor: 'iran', category: 'base', lat: 27.12, lng: 56.28, location: 'Iran',
    strength: 'IRIN & IRGCN Hauptstützpunkt',
    status: 'active', since: '1979-01-01', articles: [], confidence: 'high' },
  { id: 'base-bushehr', unitName: 'Bushehr', unitType: 'Naval / Nuclear',
    actor: 'iran', category: 'base', lat: 28.91, lng: 50.83, location: 'Iran',
    strength: 'AKW + IRGCN Stützpunkt',
    status: 'active', since: '1979-01-01', articles: [], confidence: 'high' },
  { id: 'base-natanz', unitName: 'Natanz Anreicherungsanlage', unitType: 'Nuclear Facility',
    actor: 'iran', category: 'base', lat: 33.72, lng: 51.72, location: 'Iran',
    strength: 'Urananreicherung, IAEA-überwacht',
    status: 'active', since: '2003-01-01', articles: [], confidence: 'high' },
  { id: 'base-fordow', unitName: 'Fordow (unterirdisch)', unitType: 'Nuclear Facility',
    actor: 'iran', category: 'base', lat: 34.88, lng: 51.59, location: 'Iran',
    strength: 'Unterirdische Anreicherungsanlage',
    status: 'active', since: '2012-01-01', articles: [], confidence: 'high' },
];
