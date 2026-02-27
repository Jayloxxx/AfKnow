import type { CountryData } from '../../types';
import type { MERegion } from '../../types';
import { meGeoToSvg, meCoordsToPath, meCoordsToCenter } from '../../lib/meGeoUtils';

function c(
  id: string, name: string, capital: string, capitalLon: number, capitalLat: number,
  region: MERegion, flagEmoji: string, population: number, area: number,
  coords: [number, number][], gdp?: number, languages?: string[], currency?: string,
  keyFacts?: { label: string; value: string }[],
): CountryData {
  return {
    id, name, capital, region: region as any, flagEmoji, population, area, gdp, languages, currency, keyFacts,
    capitalCoords: meGeoToSvg(capitalLon, capitalLat),
    path: meCoordsToPath(coords),
    labelPos: meCoordsToCenter(coords),
    details: countryDetails[id] ?? defaultDetails(name),
    airports: countryAirports[id] ?? [],
    majorCities: countryCities[id] ?? [{ name: capital, coords: meGeoToSvg(capitalLon, capitalLat), population: Math.round(population * 0.1), isCapital: true }],
  };
}

function defaultDetails(name: string) {
  const base = `https://en.wikipedia.org/wiki/${name.replace(/ /g, '_')}`;
  const d = (text: string) => ({ text, source: base, sourceLabel: `Wikipedia – ${name}` });
  return {
    overview: d(`${name} ist ein Staat im Nahen und Mittleren Osten mit einer vielfältigen Geographie und Kultur.`),
    economy: d(`Die Wirtschaft von ${name} basiert auf einer Mischung aus Rohstoffförderung, Landwirtschaft und Dienstleistungen.`),
    politics: d(`${name} hat ein komplexes politisches System, das von regionalen und internationalen Faktoren beeinflusst wird.`),
    security: d(`Die Sicherheitslage in ${name} variiert je nach Region und geopolitischem Kontext.`),
    humanitarian: d(`${name} steht vor verschiedenen humanitären Herausforderungen.`),
    infrastructure: d(`Die Infrastruktur in ${name} befindet sich im Ausbau und Modernisierung.`),
  };
}

// ── Detailed info for all 20 countries ──────────────────────────

const countryDetails: Record<string, CountryData['details']> = {
  TR: {
    overview: { text: 'Die Türkei liegt an der Schnittstelle von Europa und Asien und erstreckt sich über Anatolien und Ostthrakien. Mit über 85 Millionen Einwohnern ist sie das bevölkerungsreichste Land der Region. Istanbul am Bosporus ist die größte Stadt und das wirtschaftliche Zentrum. Die Türkei verfügt über eine reiche Geschichte von den Hethitern über Byzanz bis zum Osmanischen Reich.', source: 'https://en.wikipedia.org/wiki/Turkey', sourceLabel: 'Wikipedia – Türkei' },
    economy: { text: 'Die Türkei hat die 19.-größte Volkswirtschaft der Welt mit einem BIP von ca. 906 Mrd. USD (2023). Schlüsselsektoren sind Automobilproduktion, Textilien, Elektronik, Tourismus und Landwirtschaft. Chronisch hohe Inflation (über 60% in 2023) und Währungsabwertung der Lira stellen massive Herausforderungen dar. Das Land ist G20-Mitglied.', source: 'https://data.worldbank.org/country/TR', sourceLabel: 'World Bank – Türkei' },
    politics: { text: 'Die Türkei ist seit 2018 eine Präsidialrepublik unter Recep Tayyip Erdogan, der seit 2003 regiert (zunächst als Premierminister). Die AKP dominiert die Politik. Die Opposition unter der CHP gewinnt an Stärke, besonders nach den Kommunalwahlen 2024. Pressefreiheit und Rechtsstaatlichkeit stehen international in der Kritik.', source: 'https://en.wikipedia.org/wiki/Politics_of_Turkey', sourceLabel: 'Wikipedia – Politik der Türkei' },
    security: { text: 'Die Türkei hat die zweitgrößte Armee der NATO. Der Kurdenkonflikt mit der PKK dauert seit 1984 an. Militäroperationen in Nordsyrien und Nordirak richten sich gegen PKK/YPG. Die Türkei kontrolliert Teile Nordsyriens. Spannungen mit Griechenland in der Ägäis und im östlichen Mittelmeer bestehen fort.', source: 'https://en.wikipedia.org/wiki/Turkish_Armed_Forces', sourceLabel: 'Wikipedia – Türkische Streitkräfte' },
    humanitarian: { text: 'Die Türkei beherbergt mit über 3,5 Millionen syrischen Flüchtlingen die größte Flüchtlingspopulation weltweit. Das Erdbeben im Februar 2023 in Südostanatolien forderte über 50.000 Todesopfer und verursachte massive Zerstörungen in 11 Provinzen. Die Rückführungsdebatte syrischer Flüchtlinge ist politisch brisant.', source: 'https://www.unhcr.org/countries/turkey', sourceLabel: 'UNHCR – Türkei' },
    infrastructure: { text: 'Die Türkei investiert massiv in Infrastruktur: der neue Flughafen Istanbul (IGA) ist einer der größten weltweit, der Marmaray-Tunnel verbindet Europa und Asien unter dem Bosporus, und Hochgeschwindigkeitszüge verbinden Ankara mit Istanbul und Konya. Der Istanbul-Kanal ist ein umstrittenes Megaprojekt.', source: 'https://en.wikipedia.org/wiki/Transport_in_Turkey', sourceLabel: 'Wikipedia – Verkehr in der Türkei' },
  },
  SY: {
    overview: { text: 'Syrien liegt an der östlichen Mittelmeerküste und umfasst fruchtbare Küstenebenen, die Syrische Wüste und den Euphrat. Damaskus gilt als eine der ältesten durchgehend bewohnten Städte der Welt. Das Land ist seit 2011 von einem verheerenden Bürgerkrieg gezeichnet, der zu massiver Zerstörung und Vertreibung führte.', source: 'https://en.wikipedia.org/wiki/Syria', sourceLabel: 'Wikipedia – Syrien' },
    economy: { text: 'Syriens Wirtschaft wurde durch den Bürgerkrieg weitgehend zerstört. Das BIP fiel von ca. 60 Mrd. USD (2010) auf geschätzt 9 Mrd. USD. Die Infrastruktur ist großflächig zerstört. Internationale Sanktionen erschweren den Wiederaufbau. Die syrische Lira hat massiv an Wert verloren. Schmuggel und Kriegsökonomie dominieren.', source: 'https://data.worldbank.org/country/SY', sourceLabel: 'World Bank – Syrien' },
    politics: { text: 'Das Assad-Regime wurde im Dezember 2024 gestürzt. Zuvor regierte die Baath-Partei unter der Familie Assad seit 1970. Verschiedene Oppositionsgruppen, kurdische Selbstverwaltung in Nordostsyrien und islamistische Fraktionen konkurrieren um Einfluss. Der politische Übergangsprozess bleibt fragil und unsicher.', source: 'https://en.wikipedia.org/wiki/Syrian_civil_war', sourceLabel: 'Wikipedia – Syrischer Bürgerkrieg' },
    security: { text: 'Der syrische Bürgerkrieg seit 2011 hat über 500.000 Todesopfer gefordert. Russland und der Iran unterstützten das Assad-Regime, die USA und die Türkei verschiedene Rebellengruppen. Die SDF kontrolliert den Nordosten. Israel führt regelmäßig Luftangriffe gegen iranische Positionen durch. Die Sicherheitslage bleibt extrem instabil.', source: 'https://en.wikipedia.org/wiki/Syrian_civil_war', sourceLabel: 'Wikipedia – Syrischer Bürgerkrieg' },
    humanitarian: { text: 'Über 14 Millionen Syrer wurden vertrieben – 6,8 Millionen intern und über 6 Millionen in Nachbarländer. Es ist die größte Flüchtlingskrise seit dem Zweiten Weltkrieg. 90% der Bevölkerung leben unter der Armutsgrenze. Cholera, fehlende medizinische Versorgung und Nahrungsmittelunsicherheit sind allgegenwärtig.', source: 'https://www.unhcr.org/countries/syria', sourceLabel: 'UNHCR – Syrien' },
    infrastructure: { text: 'Die Infrastruktur wurde durch den Krieg massiv zerstört. Aleppo, Homs und Raqqa liegen in Trümmern. Wasser- und Stromversorgung sind in weiten Teilen zusammengebrochen. Der Wiederaufbau wird auf über 400 Mrd. USD geschätzt. Straßen, Brücken und Krankenhäuser müssen großflächig neu errichtet werden.', source: 'https://en.wikipedia.org/wiki/Reconstruction_of_Syria', sourceLabel: 'Wikipedia – Wiederaufbau Syriens' },
  },
  LB: {
    overview: { text: 'Der Libanon ist ein kleiner Staat an der östlichen Mittelmeerküste, geprägt durch das Libanongebirge und das fruchtbare Bekaa-Tal. Beirut war einst als „Paris des Nahen Ostens" bekannt. Das Land ist ein Mosaik aus 18 anerkannten Religionsgemeinschaften und leidet seit 2019 unter einer schweren Wirtschafts- und Staatskrise.', source: 'https://en.wikipedia.org/wiki/Lebanon', sourceLabel: 'Wikipedia – Libanon' },
    economy: { text: 'Der Libanon erlebt seit 2019 die schwerste Wirtschaftskrise seiner Geschichte. Das BIP fiel von 55 Mrd. USD (2018) auf ca. 18 Mrd. USD. Das Bankensystem ist kollabiert, die Libanesische Lira verlor über 98% ihres Wertes. Die Weltbank bezeichnete die Krise als eine der schlimmsten weltweit seit dem 19. Jahrhundert.', source: 'https://data.worldbank.org/country/LB', sourceLabel: 'World Bank – Libanon' },
    politics: { text: 'Der Libanon ist eine parlamentarische Republik mit konfessionellem Proporzsystem: der Präsident muss Maronit sein, der Premier Sunnit, der Parlamentspräsident Schiit. Das Land war über zwei Jahre ohne Präsidenten (2022-2025). Die Hisbollah dominiert die politische Landschaft und verfügt über eine eigene Armee.', source: 'https://en.wikipedia.org/wiki/Politics_of_Lebanon', sourceLabel: 'Wikipedia – Politik des Libanon' },
    security: { text: 'Die Hisbollah ist die mächtigste militärische Kraft im Land, stärker als die reguläre Armee. Im Oktober 2023 eskalierte der Konflikt mit Israel massiv nach dem Hamas-Angriff. Israel führte ab September 2024 eine intensive Luftkampagne und Bodenoffensive im Südlibanon. Die Hisbollah-Führung wurde weitgehend ausgeschaltet.', source: 'https://en.wikipedia.org/wiki/Hezbollah', sourceLabel: 'Wikipedia – Hisbollah' },
    humanitarian: { text: 'Der Libanon beherbergt ca. 1,5 Millionen syrische Flüchtlinge – die höchste Pro-Kopf-Flüchtlingsdichte weltweit. Dazu kommen palästinensische Flüchtlinge in 12 Lagern. Die Explosion im Hafen von Beirut 2020 zerstörte weite Teile der Stadt und tötete über 200 Menschen. Armut betrifft über 80% der Bevölkerung.', source: 'https://www.unhcr.org/countries/lebanon', sourceLabel: 'UNHCR – Libanon' },
    infrastructure: { text: 'Die Infrastruktur des Libanon ist marode. Stromausfälle von 20+ Stunden täglich sind normal. Die Explosion im Hafen von Beirut 2020 zerstörte den wichtigsten Seehafen. Wasserversorgung und Abwassersysteme sind veraltet. Der Rafik-Hariri-Flughafen ist das einzige internationale Gateway.', source: 'https://en.wikipedia.org/wiki/Transport_in_Lebanon', sourceLabel: 'Wikipedia – Verkehr im Libanon' },
  },
  JO: {
    overview: { text: 'Jordanien liegt östlich des Jordan und des Toten Meeres und ist größtenteils von Wüste bedeckt. Das Haschemitische Königreich ist ein Stabilitätsanker in einer turbulenten Region. Petra, eine der antiken Weltwunder, und das Tote Meer sind weltberühmt. Amman ist eine moderne Hauptstadt mit über 4 Millionen Einwohnern.', source: 'https://en.wikipedia.org/wiki/Jordan', sourceLabel: 'Wikipedia – Jordanien' },
    economy: { text: 'Jordanien ist ein rohstoffarmes Land mit begrenzten Wasserressourcen. Das BIP beträgt ca. 47 Mrd. USD (2023). Die Wirtschaft stützt sich auf Phosphatexport, Tourismus, Überweisungen von Auslandsjordaniern und internationale Hilfe. Die Arbeitslosigkeit liegt bei über 22%, bei Jugendlichen deutlich höher.', source: 'https://data.worldbank.org/country/JO', sourceLabel: 'World Bank – Jordanien' },
    politics: { text: 'Jordanien ist eine konstitutionelle Monarchie unter König Abdullah II. seit 1999. Der König hat weitreichende exekutive Befugnisse und ernennt den Premierminister. Politische Reformen verlaufen langsam. Das Land pflegt diplomatische Beziehungen sowohl zu Israel als auch zu arabischen Staaten.', source: 'https://en.wikipedia.org/wiki/Politics_of_Jordan', sourceLabel: 'Wikipedia – Politik Jordaniens' },
    security: { text: 'Jordanien ist ein wichtiger Sicherheitspartner des Westens. Die jordanischen Streitkräfte sind gut ausgebildet und kooperieren eng mit den USA. Das Land beteiligt sich an der Anti-IS-Koalition. An der syrischen und irakischen Grenze bestehen Sicherheitsrisiken durch Schmuggler und militante Gruppen.', source: 'https://en.wikipedia.org/wiki/Jordanian_Armed_Forces', sourceLabel: 'Wikipedia – Jordanische Streitkräfte' },
    humanitarian: { text: 'Jordanien beherbergt über 750.000 registrierte syrische Flüchtlinge (geschätzt 1,3 Millionen insgesamt). Das Lager Zaatari war zeitweise die viertgrößte Stadt Jordaniens. Dazu kommen über 2 Millionen palästinensische Flüchtlinge (UNRWA). Wasserknappheit ist ein chronisches Problem.', source: 'https://www.unhcr.org/countries/jordan', sourceLabel: 'UNHCR – Jordanien' },
    infrastructure: { text: 'Jordanien investiert in erneuerbare Energien und hat eines der größten Solarkraftwerke der Region. Der Queen Alia International Airport in Amman wurde modernisiert. Der Hafen von Aqaba ist Jordaniens einziger Seehafen. Die Autobahn Amman-Aqaba ist die wichtigste Verkehrsader.', source: 'https://en.wikipedia.org/wiki/Transport_in_Jordan', sourceLabel: 'Wikipedia – Verkehr in Jordanien' },
  },
  IL: {
    overview: { text: 'Israel liegt an der südöstlichen Mittelmeerküste und erstreckt sich vom Libanon im Norden bis zum Golf von Aqaba. Das Land ist als Heiliges Land für Judentum, Christentum und Islam von einzigartiger religiöser Bedeutung. Mit ca. 9,8 Millionen Einwohnern ist es ein Hochtechnologieland mit starker Wirtschaft.', source: 'https://en.wikipedia.org/wiki/Israel', sourceLabel: 'Wikipedia – Israel' },
    economy: { text: 'Israel hat eine hochentwickelte Wirtschaft mit einem BIP von ca. 525 Mrd. USD (2023). Das Land ist weltführend in Hochtechnologie, Cybersicherheit und Start-ups („Start-up Nation"). Schlüsselsektoren sind IT, Diamantenverarbeitung, Pharma und Rüstungsindustrie. Das Pro-Kopf-BIP ist das höchste in der Region.', source: 'https://data.worldbank.org/country/IL', sourceLabel: 'World Bank – Israel' },
    politics: { text: 'Israel ist eine parlamentarische Demokratie mit Verhältniswahlrecht. Die Knesset hat 120 Sitze. Premierminister Benjamin Netanjahu führt seit 2022 die rechteste Koalition in Israels Geschichte. Die Justizreform 2023 löste massive Proteste aus. Der Palästinakonflikt dominiert die innen- und außenpolitische Agenda.', source: 'https://en.wikipedia.org/wiki/Politics_of_Israel', sourceLabel: 'Wikipedia – Politik Israels' },
    security: { text: 'Die IDF (Zahal) gehört zu den stärksten Armeen der Welt. Israel verfügt mutmaßlich über Atomwaffen. Der Hamas-Angriff vom 7. Oktober 2023 mit über 1.200 Toten war der tödlichste Tag in Israels Geschichte. Die anschließende Militäroperation in Gaza und die Eskalation mit der Hisbollah dominieren die Sicherheitslage.', source: 'https://en.wikipedia.org/wiki/Israel_Defense_Forces', sourceLabel: 'Wikipedia – IDF' },
    humanitarian: { text: 'Der Gaza-Krieg seit Oktober 2023 hat eine massive humanitäre Krise ausgelöst. Über 40.000 Palästinenser wurden getötet, 1,9 Millionen vertrieben. In Israel wurden über 1.200 Menschen beim Hamas-Angriff getötet und über 250 als Geiseln genommen. Die Zivilbevölkerung auf beiden Seiten leidet schwer.', source: 'https://www.ochaopt.org/', sourceLabel: 'UN OCHA – Palästina' },
    infrastructure: { text: 'Israel hat eine hochmoderne Infrastruktur. Die Schnellzugverbindung Jerusalem-Tel Aviv, das Iron-Dome-Raketenabwehrsystem und Entsalzungsanlagen sind technologische Meisterleistungen. Der Ben-Gurion-Flughafen ist ein internationaler Hub. Israel produziert über 80% seines Trinkwassers durch Entsalzung.', source: 'https://en.wikipedia.org/wiki/Transport_in_Israel', sourceLabel: 'Wikipedia – Verkehr in Israel' },
  },
  PS: {
    overview: { text: 'Die palästinensischen Gebiete umfassen das Westjordanland und den Gazastreifen. Das Westjordanland ist von israelischen Siedlungen und Checkpoints durchzogen. Der Gazastreifen ist einer der am dichtesten besiedelten Gebiete der Welt mit ca. 2,3 Millionen Einwohnern auf 365 km². Ramallah dient als Verwaltungssitz.', source: 'https://en.wikipedia.org/wiki/State_of_Palestine', sourceLabel: 'Wikipedia – Palästina' },
    economy: { text: 'Die palästinensische Wirtschaft ist stark von Israel abhängig und durch die Besatzung eingeschränkt. Das BIP betrug ca. 19 Mrd. USD vor dem Gaza-Krieg 2023. Die Wirtschaft in Gaza ist durch die jahrelange Blockade und den Krieg seit 2023 weitgehend zerstört. Arbeitslosigkeit im Gazastreifen lag vor dem Krieg bei über 45%.', source: 'https://data.worldbank.org/country/PS', sourceLabel: 'World Bank – Palästina' },
    politics: { text: 'Die Palästinensische Autonomiebehörde (PA) unter Präsident Mahmoud Abbas kontrolliert Teile des Westjordanlands. Die Hamas kontrollierte den Gazastreifen seit 2007. Die innerpalästinensische Spaltung zwischen Fatah und Hamas besteht seit 2007. Seit 2006 fanden keine palästinensischen Wahlen mehr statt.', source: 'https://en.wikipedia.org/wiki/Palestinian_National_Authority', sourceLabel: 'Wikipedia – Palästinensische Autonomiebehörde' },
    security: { text: 'Der Gazastreifen erlebt seit Oktober 2023 eine massive israelische Militäroperation nach dem Hamas-Angriff. Im Westjordanland nehmen israelische Militäroperationen und Siedlergewalt zu. Die PA-Sicherheitskräfte kooperieren teilweise mit Israel. Bewaffnete Gruppen operieren in mehreren Städten des Westjordanlands.', source: 'https://en.wikipedia.org/wiki/Israeli%E2%80%93Palestinian_conflict', sourceLabel: 'Wikipedia – Nahostkonflikt' },
    humanitarian: { text: 'Gaza erlebt seit Oktober 2023 eine beispiellose humanitäre Katastrophe. Über 85% der Bevölkerung wurde vertrieben, massive Zerstörung der Infrastruktur, akute Hungersnot und Zusammenbruch des Gesundheitssystems. UNRWA betreut über 5,9 Millionen palästinensische Flüchtlinge in der gesamten Region.', source: 'https://www.unrwa.org/', sourceLabel: 'UNRWA' },
    infrastructure: { text: 'Die Infrastruktur in Gaza wurde durch wiederholte Konflikte und die Blockade seit 2007 massiv beschädigt. Der Krieg seit 2023 hat über 70% der Wohngebäude zerstört. Im Westjordanland behindern israelische Checkpoints und die Sperranlage den Verkehr. Wasser- und Stromversorgung sind in Gaza zusammengebrochen.', source: 'https://en.wikipedia.org/wiki/Infrastructure_of_Palestine', sourceLabel: 'Wikipedia – Infrastruktur Palästinas' },
  },
  CY: {
    overview: { text: 'Zypern ist die drittgrößte Mittelmeerinsel und liegt südlich der Türkei. Die Insel ist seit 1974 geteilt: die Republik Zypern im Süden (EU-Mitglied) und die nur von der Türkei anerkannte Türkische Republik Nordzypern. Nikosia ist die letzte geteilte Hauptstadt der Welt.', source: 'https://en.wikipedia.org/wiki/Cyprus', sourceLabel: 'Wikipedia – Zypern' },
    economy: { text: 'Die Wirtschaft der Republik Zypern basiert auf Dienstleistungen, Tourismus und Schifffahrt. Das BIP beträgt ca. 30 Mrd. USD (2023). Nach der Finanzkrise 2013 hat sich die Wirtschaft erholt. Zypern hat Erdgasvorkommen im östlichen Mittelmeer entdeckt, deren Ausbeutung geopolitisch umstritten ist.', source: 'https://data.worldbank.org/country/CY', sourceLabel: 'World Bank – Zypern' },
    politics: { text: 'Die Republik Zypern ist eine Präsidialrepublik und EU-Mitglied seit 2004. Die Zypernfrage (Wiedervereinigung) bleibt ungelöst. Friedensverhandlungen unter UN-Vermittlung scheiterten 2017. Präsident Nikos Christodoulides regiert seit 2023. Nordzypern wird international nicht anerkannt.', source: 'https://en.wikipedia.org/wiki/Politics_of_Cyprus', sourceLabel: 'Wikipedia – Politik Zyperns' },
    security: { text: 'Die Teilung der Insel wird durch die UN-Pufferzone (Green Line) und ca. 30.000 türkische Soldaten im Norden aufrechterhalten. UNFICYP ist seit 1964 auf der Insel stationiert. Zypern nutzt britische Militärbasen (Akrotiri und Dekelia) als strategische Stützpunkte. Spannungen um Erdgasbohrungen bestehen mit der Türkei.', source: 'https://en.wikipedia.org/wiki/United_Nations_Peacekeeping_Force_in_Cyprus', sourceLabel: 'Wikipedia – UNFICYP' },
    humanitarian: { text: 'Die Teilung hat zu Vertreibung auf beiden Seiten geführt: ca. 200.000 griechische Zyprioten flohen 1974 aus dem Norden, ca. 50.000 türkische Zyprioten aus dem Süden. Zypern erlebt zunehmend irreguläre Migration über die Pufferzone. Das Land hat eine der höchsten Asylbewerberquoten pro Kopf in der EU.', source: 'https://www.unhcr.org/countries/cyprus', sourceLabel: 'UNHCR – Zypern' },
    infrastructure: { text: 'Die Republik Zypern verfügt über moderne Infrastruktur. Die Flughäfen Larnaka und Paphos sind internationale Gateways. Das Straßennetz ist gut ausgebaut. Der Hafen Limassol ist ein wichtiger Umschlagplatz im östlichen Mittelmeer. Im Norden ist die Infrastruktur weniger entwickelt.', source: 'https://en.wikipedia.org/wiki/Transport_in_Cyprus', sourceLabel: 'Wikipedia – Verkehr auf Zypern' },
  },
  IQ: {
    overview: { text: 'Der Irak liegt im Herzen Mesopotamiens zwischen Euphrat und Tigris – der Wiege der Zivilisation. Bagdad war das Zentrum des Abbasidenreichs. Das Land verfügt über die fünftgrößten Ölreserven der Welt. Nach Jahrzehnten von Kriegen und Instabilität ringt der Irak um Stabilität und Wiederaufbau.', source: 'https://en.wikipedia.org/wiki/Iraq', sourceLabel: 'Wikipedia – Irak' },
    economy: { text: 'Der Irak hat ein BIP von ca. 264 Mrd. USD (2023) und ist stark ölabhängig (95% der Staatseinnahmen). Die Ölproduktion beträgt ca. 4,5 Mio. Barrel pro Tag. Korruption, schwache Diversifizierung und hohe Jugendarbeitslosigkeit sind zentrale Herausforderungen. Die autonome Region Kurdistan hat eine eigene Wirtschaftspolitik.', source: 'https://data.worldbank.org/country/IQ', sourceLabel: 'World Bank – Irak' },
    politics: { text: 'Der Irak ist eine föderale parlamentarische Republik. Das politische System ist konfessionell geprägt: Premierminister (Schiit), Präsident (Kurde), Parlamentspräsident (Sunnit). Die Kurdistan-Region hat weitgehende Autonomie. Iranischer Einfluss über schiitische Milizen ist stark. Premierminister al-Sudani regiert seit 2022.', source: 'https://en.wikipedia.org/wiki/Politics_of_Iraq', sourceLabel: 'Wikipedia – Politik des Irak' },
    security: { text: 'Der IS wurde 2017 territorial besiegt, führt aber Guerillaangriffe durch. Die Volksmobilisierungskräfte (PMF/Hashd al-Shaabi) sind mächtige, Iran-nahe Milizen. Die Autonome Region Kurdistan hat eigene Peschmerga-Streitkräfte. US-Truppen sind weiterhin präsent. Die Sicherheitslage hat sich seit 2020 deutlich verbessert.', source: 'https://en.wikipedia.org/wiki/Iraqi_conflict', sourceLabel: 'Wikipedia – Irak-Konflikt' },
    humanitarian: { text: 'Der Krieg gegen den IS vertrieb über 6 Millionen Iraker. Über 1 Million sind noch immer Binnenvertriebene, hauptsächlich aus Mossul, Anbar und Saladin. Die Rückkehr wird durch zerstörte Infrastruktur und Sicherheitsbedenken erschwert. Wasserknappheit durch türkische Staudämme am Euphrat und Tigris ist ein wachsendes Problem.', source: 'https://www.unhcr.org/countries/iraq', sourceLabel: 'UNHCR – Irak' },
    infrastructure: { text: 'Die Infrastruktur wurde durch Kriege (1991, 2003, IS) schwer beschädigt. Stromversorgung ist unzuverlässig – Generatoren sind allgegenwärtig. Der Wiederaufbau von Mossul schreitet langsam voran. Der Große Faw-Hafen am Persischen Golf ist ein Megaprojekt. Basra ist das Zentrum der Ölindustrie.', source: 'https://en.wikipedia.org/wiki/Transport_in_Iraq', sourceLabel: 'Wikipedia – Verkehr im Irak' },
  },
  IR: {
    overview: { text: 'Der Iran ist das zweitgrößte Land des Nahen Ostens und erstreckt sich vom Kaspischen Meer bis zum Persischen Golf. Das Land ist Erbe des Persischen Reiches mit über 2.500 Jahren Geschichte. Teheran ist mit über 9 Millionen Einwohnern eine der größten Städte der Region. Der Iran ist ethnisch vielfältig mit Persern, Aserbaidschanern, Kurden und Arabern.', source: 'https://en.wikipedia.org/wiki/Iran', sourceLabel: 'Wikipedia – Iran' },
    economy: { text: 'Der Iran hat ein BIP von ca. 368 Mrd. USD (2023). Erdöl und Erdgas dominieren die Wirtschaft (die viertgrößten Öl- und zweitgrößten Gasreserven der Welt). Internationale Sanktionen, insbesondere der USA, belasten die Wirtschaft schwer. Inflation und Währungsverfall des Rial sind chronische Probleme. Die Schattenwirtschaft ist bedeutend.', source: 'https://data.worldbank.org/country/IR', sourceLabel: 'World Bank – Iran' },
    politics: { text: 'Die Islamische Republik Iran ist eine theokratische Republik unter dem Obersten Führer Ayatollah Khamenei (seit 1989). Der Präsident wird gewählt, untersteht aber dem Obersten Führer. Die Revolutionsgarden (IRGC) haben enormen politischen und wirtschaftlichen Einfluss. Die Proteste „Frau, Leben, Freiheit" 2022-2023 wurden gewaltsam niedergeschlagen.', source: 'https://en.wikipedia.org/wiki/Politics_of_Iran', sourceLabel: 'Wikipedia – Politik des Iran' },
    security: { text: 'Der Iran ist eine Regionalmacht mit Einfluss über die „Achse des Widerstands": Hisbollah, Hamas, Huthis und irakische Milizen. Das Atomprogramm ist international umstritten. Die IRGC und ihre Quds-Brigaden operieren in der gesamten Region. Spannungen mit Israel und Saudi-Arabien prägen die Sicherheitslage, obwohl 2023 eine Annäherung an Riad erfolgte.', source: 'https://en.wikipedia.org/wiki/Islamic_Revolutionary_Guard_Corps', sourceLabel: 'Wikipedia – Revolutionsgarden' },
    humanitarian: { text: 'Der Iran beherbergt eine der größten Flüchtlingspopulationen weltweit: über 3 Millionen Afghanen (ca. 800.000 registriert). Wasserknappheit durch Klimawandel und Misswirtschaft führt zum Austrocknen des Urmia-Sees. Umweltkatastrophen wie Überschwemmungen und Dürren nehmen zu. Die Menschenrechtslage wird international scharf kritisiert.', source: 'https://www.unhcr.org/countries/iran', sourceLabel: 'UNHCR – Iran' },
    infrastructure: { text: 'Der Iran hat ein ausgedehntes Straßen- und Schienennetz. Die Teheraner Metro ist eines der größten U-Bahn-Systeme der Region. Der Imam Khomeini International Airport ist der größte Flughafen. Die South-Pars-Gasfelder im Persischen Golf sind das größte Gasfeld der Welt. Die Petrochemie ist ein wichtiger Industriezweig.', source: 'https://en.wikipedia.org/wiki/Transport_in_Iran', sourceLabel: 'Wikipedia – Verkehr im Iran' },
  },
  SA: {
    overview: { text: 'Saudi-Arabien ist das größte Land der Arabischen Halbinsel und Hüter der zwei heiligsten Stätten des Islam (Mekka und Medina). Das Königreich verfügt über die zweitgrößten Ölreserven der Welt. Die Vision 2030 unter Kronprinz Mohammed bin Salman zielt auf eine wirtschaftliche Diversifizierung und gesellschaftliche Öffnung ab.', source: 'https://en.wikipedia.org/wiki/Saudi_Arabia', sourceLabel: 'Wikipedia – Saudi-Arabien' },
    economy: { text: 'Saudi-Arabien hat ein BIP von ca. 1.069 Mrd. USD (2023) und ist die größte Volkswirtschaft der arabischen Welt. Saudi Aramco ist das profitabelste Unternehmen der Welt. Die Vision 2030 fördert Tourismus, Unterhaltung und Technologie. NEOM, eine futuristische Megastadt, ist das ambitionierteste Projekt. Das Land ist OPEC-Führungsmacht.', source: 'https://data.worldbank.org/country/SA', sourceLabel: 'World Bank – Saudi-Arabien' },
    politics: { text: 'Saudi-Arabien ist eine absolute Monarchie unter König Salman bin Abdulaziz. Kronprinz Mohammed bin Salman (MBS) ist de facto Regent und treibt die Modernisierung voran. Politische Parteien sind verboten. Reformen umfassen Frauenfahrrecht (2018), Kinos und Unterhaltung, aber Dissidenten werden verfolgt (Khashoggi-Mord 2018).', source: 'https://en.wikipedia.org/wiki/Politics_of_Saudi_Arabia', sourceLabel: 'Wikipedia – Politik Saudi-Arabiens' },
    security: { text: 'Saudi-Arabien hat eines der höchsten Militärbudgets weltweit. Der Jemen-Krieg (seit 2015 gegen die Huthis) ist der verlustreichste Konflikt. Huthis griffen Saudi-Arabien mit Drohnen und Raketen an (Aramco-Angriff 2019). Die Annäherung an den Iran (2023, vermittelt durch China) war ein diplomatischer Wendepunkt. Die Abraham Accords werden angestrebt.', source: 'https://en.wikipedia.org/wiki/Saudi_Arabian_Armed_Forces', sourceLabel: 'Wikipedia – Saudi-Streitkräfte' },
    humanitarian: { text: 'Saudi-Arabien beherbergt keine offiziellen Flüchtlinge laut UNHCR, hat aber Millionen von Arbeitsmigranten, die teilweise unter schwierigen Bedingungen leben (Kafala-System). Im Jemen-Krieg hat die saudische Koalition zur humanitären Krise beigetragen. Reformen unter Vision 2030 verbessern schrittweise die Rechte von Frauen und Arbeitern.', source: 'https://www.hrw.org/middle-east/n-africa/saudi-arabia', sourceLabel: 'HRW – Saudi-Arabien' },
    infrastructure: { text: 'Saudi-Arabien investiert hunderte Milliarden in Megaprojekte: NEOM (500 Mrd. USD), The Line (170 km lineare Stadt), Jeddah Tower, der Haramain-Hochgeschwindigkeitszug (Mekka-Medina) und die Riad-Metro (6 Linien, 176 km). King Abdulaziz International Airport wurde massiv erweitert.', source: 'https://en.wikipedia.org/wiki/Transport_in_Saudi_Arabia', sourceLabel: 'Wikipedia – Verkehr in Saudi-Arabien' },
  },
  AE: {
    overview: { text: 'Die Vereinigten Arabischen Emirate sind eine Föderation aus sieben Emiraten am Persischen Golf, angeführt von Abu Dhabi und Dubai. In nur 50 Jahren wandelten sich die Emirate von Fischerdörfern zu einer der wohlhabendsten Nationen der Welt. Dubai ist ein globales Handels- und Tourismuszentrum. Abu Dhabi verwaltet den Großteil der Ölreserven.', source: 'https://en.wikipedia.org/wiki/United_Arab_Emirates', sourceLabel: 'Wikipedia – VAE' },
    economy: { text: 'Die VAE haben ein BIP von ca. 509 Mrd. USD (2023) und das höchste BIP pro Kopf in der arabischen Welt. Dubai hat sich als Handels-, Finanz- und Tourismuszentrum diversifiziert. Abu Dhabi bleibt ölabhängig. Jebel Ali ist der größte Hafen der Region. Die Expo 2020 (durchgeführt 2021-22) stärkte Dubais globales Profil.', source: 'https://data.worldbank.org/country/AE', sourceLabel: 'World Bank – VAE' },
    politics: { text: 'Die VAE sind eine föderale Erbmonarchie. Präsident Mohammed bin Zayed Al Nahyan (Abu Dhabi) und Premierminister Mohammed bin Rashid Al Maktoum (Dubai) sind die Schlüsselfiguren. Politische Parteien existieren nicht. Die VAE verfolgen eine assertive Außenpolitik und sind in Konflikten in Jemen und Libyen engagiert.', source: 'https://en.wikipedia.org/wiki/Politics_of_the_United_Arab_Emirates', sourceLabel: 'Wikipedia – Politik der VAE' },
    security: { text: 'Die VAE haben eine der modernsten Armeen der Region und kooperieren eng mit den USA (Al-Dhafra Air Base). Die Abraham Accords 2020 mit Israel waren ein diplomatischer Meilenstein. Die VAE waren im Jemen-Krieg aktiv und unterstützen den Südübergangsrat. Cybersicherheit und Drohnentechnologie sind Schwerpunkte.', source: 'https://en.wikipedia.org/wiki/United_Arab_Emirates_Armed_Forces', sourceLabel: 'Wikipedia – Streitkräfte der VAE' },
    humanitarian: { text: 'Die VAE haben über 8 Millionen ausländische Arbeitnehmer (ca. 88% der Bevölkerung). Arbeitsbedingungen, besonders im Bausektor, stehen in der Kritik. Die VAE leisten erhebliche humanitäre Hilfe im Jemen und weltweit. Die COP28-Klimakonferenz 2023 in Dubai rückte Klimagerechtigkeit in den Fokus.', source: 'https://www.hrw.org/middle-east/n-africa/united-arab-emirates', sourceLabel: 'HRW – VAE' },
    infrastructure: { text: 'Dubai und Abu Dhabi haben Weltklasse-Infrastruktur. Der Burj Khalifa (828m) ist das höchste Gebäude der Welt. Dubai International Airport ist einer der verkehrsreichsten weltweit. Die Etihad Rail verbindet alle sieben Emirate. Palm Jumeirah und die künstlichen Inseln sind ikonische Projekte. Die Dubai Metro ist die längste fahrerlose Metro der Welt.', source: 'https://en.wikipedia.org/wiki/Transport_in_the_United_Arab_Emirates', sourceLabel: 'Wikipedia – Verkehr in den VAE' },
  },
  QA: {
    overview: { text: 'Katar ist eine kleine Halbinsel am Persischen Golf, die vom Festland Saudi-Arabiens in den Golf ragt. Das Emirat hat dank seiner Erdgas- und Ölvorkommen eines der höchsten Pro-Kopf-Einkommen weltweit. Doha, die Hauptstadt, hat sich zu einem internationalen Medienzentrum (Al Jazeera) und diplomatischen Vermittler entwickelt.', source: 'https://en.wikipedia.org/wiki/Qatar', sourceLabel: 'Wikipedia – Katar' },
    economy: { text: 'Katar hat ein BIP von ca. 236 Mrd. USD (2023) und das höchste Pro-Kopf-BIP der Welt. Das North Field ist das größte Gasfeld der Welt. Katar ist der weltgrößte LNG-Exporteur. Die Qatar Investment Authority (QIA) investiert global. Die Fußball-WM 2022 kostete über 220 Mrd. USD an Investitionen in Infrastruktur.', source: 'https://data.worldbank.org/country/QA', sourceLabel: 'World Bank – Katar' },
    politics: { text: 'Katar ist eine absolute Monarchie unter Emir Tamim bin Hamad Al Thani (seit 2013). Es gibt einen beratenden Schura-Rat, aber keine politischen Parteien. Katar verfolgt eine eigenständige Außenpolitik und vermittelt in internationalen Konflikten (Taliban, Hamas-Israel). Die Blockade durch Saudi-Arabien, VAE und andere (2017-2021) endete mit dem Al-Ula-Abkommen.', source: 'https://en.wikipedia.org/wiki/Politics_of_Qatar', sourceLabel: 'Wikipedia – Politik Katars' },
    security: { text: 'Katar beherbergt die Al-Udeid Air Base, den größten US-Militärstützpunkt im Nahen Osten. Die eigenen Streitkräfte sind klein aber modern. Katar spielte eine Schlüsselrolle bei den Geiselverhandlungen zwischen Israel und Hamas. Die türkische Militärbasis in Katar wurde 2019 erweitert.', source: 'https://en.wikipedia.org/wiki/Qatar_Armed_Forces', sourceLabel: 'Wikipedia – Katarische Streitkräfte' },
    humanitarian: { text: 'Katar hat über 2 Millionen ausländische Arbeitnehmer (ca. 88% der Bevölkerung). Das Kafala-System wurde reformiert (2020), aber Arbeitsbedingungen bleiben in der Kritik, besonders nach den WM-Bauprojekten. Katar leistet erhebliche humanitäre Hilfe, insbesondere in Gaza und Afghanistan.', source: 'https://www.hrw.org/middle-east/n-africa/qatar', sourceLabel: 'HRW – Katar' },
    infrastructure: { text: 'Die FIFA WM 2022 trieb massive Infrastrukturinvestitionen: die Doha Metro, Lusail-Stadt, acht Stadien und der neue Hamad International Airport. Lusail ist eine komplett neue Stadt für 450.000 Einwohner. Der Hamad Port ist einer der modernsten Häfen der Region. Die North Field Expansion wird die LNG-Kapazität verdoppeln.', source: 'https://en.wikipedia.org/wiki/Transport_in_Qatar', sourceLabel: 'Wikipedia – Verkehr in Katar' },
  },
  BH: {
    overview: { text: 'Bahrain ist ein kleiner Inselstaat im Persischen Golf, verbunden mit Saudi-Arabien durch den King-Fahd-Damm. Das Archipel umfasst über 30 Inseln. Bahrain war das erste Golfland, das Öl förderte (1932), und hat sich als Finanzzentrum der Region etabliert. Die Bevölkerung ist mehrheitlich schiitisch, die Herrscherfamilie sunnitisch.', source: 'https://en.wikipedia.org/wiki/Bahrain', sourceLabel: 'Wikipedia – Bahrain' },
    economy: { text: 'Bahrains BIP beträgt ca. 44 Mrd. USD (2023). Die Ölreserven sind begrenzt, weshalb das Land auf Finanzdienstleistungen, Aluminium (ALBA-Schmelzwerk), Tourismus und Logistik setzt. Bahrain ist ein wichtiges Finanzzentrum mit islamischem Bankwesen. Die Formel-1-Rennstrecke bringt internationales Prestige.', source: 'https://data.worldbank.org/country/BH', sourceLabel: 'World Bank – Bahrain' },
    politics: { text: 'Bahrain ist eine konstitutionelle Monarchie unter König Hamad bin Isa Al Khalifa (seit 2002). Der Arabische Frühling 2011 führte zu massiven Protesten der schiitischen Mehrheit, die mit saudischer Militärhilfe niedergeschlagen wurden. Die Opposition ist weitgehend verboten. 2020 normalisierte Bahrain die Beziehungen zu Israel (Abraham Accords).', source: 'https://en.wikipedia.org/wiki/Politics_of_Bahrain', sourceLabel: 'Wikipedia – Politik Bahrains' },
    security: { text: 'Bahrain beherbergt die 5. US-Flotte (Naval Support Activity Bahrain), einen der wichtigsten Marinestützpunkte der USA im Nahen Osten. Saudi-Arabien unterstützt Bahrain militärisch (Peninsula Shield Force 2011). Schiitisch-sunnitische Spannungen und iranischer Einfluss sind Sicherheitsbedenken. Die BDF sind klein aber gut ausgerüstet.', source: 'https://en.wikipedia.org/wiki/Bahrain_Defence_Force', sourceLabel: 'Wikipedia – Bahrainische Streitkräfte' },
    humanitarian: { text: 'Bahrain steht wegen der Unterdrückung der schiitischen Opposition in der Kritik. Hunderte politische Gefangene wurden nach 2011 inhaftiert. Die Staatsbürgerschaft wurde entzogen als politisches Instrument. Arbeitsmigranten, hauptsächlich aus Südasien, stellen über 50% der Bevölkerung und arbeiten unter teils schwierigen Bedingungen.', source: 'https://www.hrw.org/middle-east/n-africa/bahrain', sourceLabel: 'HRW – Bahrain' },
    infrastructure: { text: 'Der King-Fahd-Damm (25 km) verbindet Bahrain mit Saudi-Arabien. Ein zweiter Damm ist geplant mit integrierter Eisenbahn. Der Bahrain International Airport wurde 2021 mit einem neuen Terminal modernisiert. Der Khalifa-Bin-Salman-Hafen und Mina Salman sind die wichtigsten Häfen. Der Bahrain World Trade Center hat integrierte Windturbinen.', source: 'https://en.wikipedia.org/wiki/Transport_in_Bahrain', sourceLabel: 'Wikipedia – Verkehr in Bahrain' },
  },
  KW: {
    overview: { text: 'Kuwait liegt am nordwestlichen Ende des Persischen Golfs zwischen Irak und Saudi-Arabien. Das kleine Emirat verfügt über ca. 6% der weltweiten Ölreserven. Die irakische Invasion 1990 und die Befreiung 1991 im Zweiten Golfkrieg prägten das Land nachhaltig. Kuwait hat eines der großzügigsten Sozialsysteme der Golfregion.', source: 'https://en.wikipedia.org/wiki/Kuwait', sourceLabel: 'Wikipedia – Kuwait' },
    economy: { text: 'Kuwait hat ein BIP von ca. 164 Mrd. USD (2023). Erdöl macht über 90% der Staatseinnahmen und 95% der Exporterlöse aus. Der Kuwait Investment Authority (KIA) ist einer der ältesten Staatsfonds der Welt. Die Vision 2035 („New Kuwait") zielt auf Diversifizierung ab, schreitet aber langsam voran.', source: 'https://data.worldbank.org/country/KW', sourceLabel: 'World Bank – Kuwait' },
    politics: { text: 'Kuwait ist eine konstitutionelle Erbmonarchie mit dem aktivsten Parlament am Golf. Die Nationalversammlung kann Minister befragen und absetzen. Konflikte zwischen Regierung und Parlament führen regelmäßig zu Auflösungen. Emir Nawaf wurde 2023 von Emir Mishal bin Ahmad Al Jaber Al Sabah abgelöst. Frauen haben seit 2005 Wahlrecht.', source: 'https://en.wikipedia.org/wiki/Politics_of_Kuwait', sourceLabel: 'Wikipedia – Politik Kuwaits' },
    security: { text: 'Kuwait kooperiert eng mit den USA (Camp Arifjan, Ali Al Salem Air Base). Die Erfahrung der irakischen Invasion 1990 prägt die Sicherheitspolitik. Kuwait unterhält moderate Streitkräfte und setzt auf Bündnispartner. Die Beziehungen zum Irak haben sich normalisiert, aber Grenzfragen bleiben sensibel.', source: 'https://en.wikipedia.org/wiki/Kuwait_Military_Forces', sourceLabel: 'Wikipedia – Kuwaitische Streitkräfte' },
    humanitarian: { text: 'Kuwait beherbergt über 100.000 Bidun (Staatenlose), denen Grundrechte wie Bildung und Gesundheitsversorgung teilweise verwehrt werden. Ausländische Arbeiter (ca. 70% der Bevölkerung) arbeiten unter dem Kafala-System. Kuwait ist ein bedeutender humanitärer Geber, insbesondere für Syrien und den Jemen.', source: 'https://www.hrw.org/middle-east/n-africa/kuwait', sourceLabel: 'HRW – Kuwait' },
    infrastructure: { text: 'Kuwait investiert in Megaprojekte: Silk City (Madinat al-Hareer) mit einem 1001-Meter-Turm, der Mubarak-al-Kabeer-Hafen auf Bubiyan-Insel und die Kuwait Metro (geplant). Der Kuwait International Airport wird massiv erweitert (Terminal 2 von Foster+Partners). Die Sheikh Jaber Al Ahmad Brücke (36 km) ist eine der längsten der Welt.', source: 'https://en.wikipedia.org/wiki/Transport_in_Kuwait', sourceLabel: 'Wikipedia – Verkehr in Kuwait' },
  },
  YE: {
    overview: { text: 'Der Jemen liegt an der Südspitze der Arabischen Halbinsel am Roten Meer und Golf von Aden. Das „glückliche Arabien" (Arabia Felix) der Antike ist heute das ärmste arabische Land. Seit 2014 herrscht ein verheerender Bürgerkrieg. Die strategische Lage an der Meerenge Bab al-Mandab macht den Jemen geopolitisch bedeutsam.', source: 'https://en.wikipedia.org/wiki/Yemen', sourceLabel: 'Wikipedia – Jemen' },
    economy: { text: 'Die Wirtschaft des Jemen ist durch den Bürgerkrieg weitgehend zerstört. Das BIP wird auf ca. 21 Mrd. USD geschätzt. Die Ölproduktion ist drastisch gefallen. Zwei rivalisierende Zentralbanken (Aden und Sanaa) operieren parallel. Die Rial hat massiv an Wert verloren. Über 80% der Bevölkerung sind auf humanitäre Hilfe angewiesen.', source: 'https://data.worldbank.org/country/YE', sourceLabel: 'World Bank – Jemen' },
    politics: { text: 'Der Jemen ist seit 2014 gespalten: die Huthi-Bewegung (Ansar Allah) kontrolliert den Norden einschließlich Sanaa, die international anerkannte Regierung unter dem Präsidialrat operiert von Aden. Der Südübergangsrat strebt die Unabhängigkeit des Südjemen an. Ein Friedensabkommen bleibt trotz Waffenstillstand schwer erreichbar.', source: 'https://en.wikipedia.org/wiki/Yemeni_civil_war_(2014%E2%80%93present)', sourceLabel: 'Wikipedia – Jemenitischer Bürgerkrieg' },
    security: { text: 'Der Bürgerkrieg seit 2014 hat über 150.000 Tote gefordert. Die saudisch-emiratische Koalition intervenierte 2015. Die Huthis griffen seit Oktober 2023 Handelsschiffe im Roten Meer an, was US-/UK-Militärschläge auslöste. AQAP (Al-Qaida auf der Arabischen Halbinsel) operiert im Süden und Osten. Die Fragmentierung der Sicherheitslage ist extrem.', source: 'https://en.wikipedia.org/wiki/Yemeni_civil_war_(2014%E2%80%93present)', sourceLabel: 'Wikipedia – Jemenitischer Bürgerkrieg' },
    humanitarian: { text: 'Der Jemen erlebt die schlimmste humanitäre Krise der Welt laut UN. Über 21 Millionen Menschen benötigen humanitäre Hilfe. 4,5 Millionen sind intern vertrieben. Cholera-Epidemien, Hungersnot und der Zusammenbruch des Gesundheitssystems sind verheerend. Die Blockade von Häfen verschärft die Lage dramatisch.', source: 'https://www.unhcr.org/countries/yemen', sourceLabel: 'UNHCR – Jemen' },
    infrastructure: { text: 'Die Infrastruktur des Jemen wurde durch den Krieg weitgehend zerstört. Straßen, Brücken, Krankenhäuser und Schulen sind beschädigt. Der Hafen von Hodeidah, ein lebenswichtiges Tor für Hilfslieferungen, war Schauplatz heftiger Kämpfe. Der Flughafen Sanaa war jahrelang geschlossen. Strom- und Wasserversorgung sind zusammengebrochen.', source: 'https://en.wikipedia.org/wiki/Transport_in_Yemen', sourceLabel: 'Wikipedia – Verkehr im Jemen' },
  },
  OM: {
    overview: { text: 'Oman liegt an der Südostecke der Arabischen Halbinsel und grenzt an die Straße von Hormuz, durch die ein Drittel des weltweiten Öltransports fließt. Das Sultanat ist bekannt für seine moderate Außenpolitik, die Fjorde von Musandam, die Wüste Rub al-Khali und die historische Seefahrertradition.', source: 'https://en.wikipedia.org/wiki/Oman', sourceLabel: 'Wikipedia – Oman' },
    economy: { text: 'Oman hat ein BIP von ca. 105 Mrd. USD (2023). Erdöl und Erdgas dominieren (ca. 60% der Staatseinnahmen). Die Vision 2040 fördert Diversifizierung in Tourismus, Logistik, Bergbau und Fischerei. Der Hafen Duqm wird als Alternative zu Hormuz entwickelt. Oman hat weniger Ölreserven als seine Nachbarn und diversifiziert aktiver.', source: 'https://data.worldbank.org/country/OM', sourceLabel: 'World Bank – Oman' },
    politics: { text: 'Oman ist eine absolute Monarchie unter Sultan Haitham bin Tarik (seit 2020), Nachfolger des legendären Sultan Qaboos (regierte 1970-2020). Das Land verfolgt eine neutrale Außenpolitik und vermittelt zwischen regionalen Rivalen. Es gibt einen beratenden Schura-Rat, aber keine politischen Parteien. Omans Diplomatie ist in der Region hoch angesehen.', source: 'https://en.wikipedia.org/wiki/Politics_of_Oman', sourceLabel: 'Wikipedia – Politik Omans' },
    security: { text: 'Oman verfolgt eine strikte Neutralitätspolitik und unterhält gute Beziehungen zu allen Nachbarn, einschließlich Iran. Das Land beherbergt keine ausländischen Militärbasen, kooperiert aber mit den USA und Großbritannien. Die Straße von Hormuz macht Oman strategisch bedeutsam. Die Streitkräfte sind modern, aber klein.', source: 'https://en.wikipedia.org/wiki/Sultan_of_Oman%27s_Armed_Forces', sourceLabel: 'Wikipedia – Omanische Streitkräfte' },
    humanitarian: { text: 'Oman hat eine relativ kleine ausländische Arbeitsbevölkerung im Vergleich zu anderen Golfstaaten (ca. 40%). Die Arbeitsbedingungen sind besser als in manchen Nachbarländern. Oman nimmt keine größeren Flüchtlingsgruppen auf, leistet aber humanitäre Hilfe im Jemen und vermittelt bei Geiselfreilassungen.', source: 'https://www.hrw.org/middle-east/n-africa/oman', sourceLabel: 'HRW – Oman' },
    infrastructure: { text: 'Oman investiert in den Hafen und die Sonderwirtschaftszone Duqm als Alternative zur Straße von Hormuz. Der Muscat International Airport wurde 2018 modernisiert. Ein nationales Eisenbahnnetz ist geplant (Oman-Etihad Rail). Die Autobahn Muscat-Salalah (ca. 1.000 km) durchquert die Wüste.', source: 'https://en.wikipedia.org/wiki/Transport_in_Oman', sourceLabel: 'Wikipedia – Verkehr in Oman' },
  },
  AF: {
    overview: { text: 'Afghanistan ist ein gebirgiges Binnenland am Hindukusch, Kreuzungspunkt von Zentral- und Südasien. Das Land blickt auf Jahrtausende Geschichte zurück und war Teil der Seidenstraße. Nach über 40 Jahren Krieg übernahmen die Taliban im August 2021 erneut die Macht. Kabul hat über 4 Millionen Einwohner.', source: 'https://en.wikipedia.org/wiki/Afghanistan', sourceLabel: 'Wikipedia – Afghanistan' },
    economy: { text: 'Afghanistan ist eines der ärmsten Länder der Welt mit einem geschätzten BIP von ca. 14 Mrd. USD. Die Wirtschaft brach nach der Taliban-Übernahme 2021 und dem Einfrieren von Zentralbankreserven (ca. 9 Mrd. USD) ein. Opiumproduktion (bis zum Taliban-Verbot 2022), Landwirtschaft und Bergbau (unerschlossene Bodenschätze im Billionenwert) sind die Hauptsektoren.', source: 'https://data.worldbank.org/country/AF', sourceLabel: 'World Bank – Afghanistan' },
    politics: { text: 'Die Taliban regieren seit August 2021 als „Islamisches Emirat Afghanistan" unter Hibatullah Akhundzada. Internationale Anerkennung fehlt. Frauen und Mädchen sind von Bildung und Berufsleben weitgehend ausgeschlossen. Der IS-Ableger ISKP (IS-Khorasan) führt Anschläge durch. Die internationale Gemeinschaft ist im Umgang mit dem Regime gespalten.', source: 'https://en.wikipedia.org/wiki/Islamic_Emirate_of_Afghanistan', sourceLabel: 'Wikipedia – Islamisches Emirat Afghanistan' },
    security: { text: 'Die Taliban kontrollieren das gesamte Territorium, sehen sich aber Angriffen des ISKP ausgesetzt, der Anschläge auf schiitische Hazara und Taliban-Vertreter verübt. Der Nationale Widerstandsfront (NRF) im Pandschirtal hat begrenzten Einfluss. Landminen und Blindgänger aus Jahrzehnten des Krieges fordern weiterhin Opfer. Der Opiumhandel finanziert Netzwerke.', source: 'https://en.wikipedia.org/wiki/War_in_Afghanistan', sourceLabel: 'Wikipedia – Krieg in Afghanistan' },
    humanitarian: { text: 'Über 28 Millionen Afghanen (zwei Drittel der Bevölkerung) benötigen humanitäre Hilfe. 6,3 Millionen sind intern vertrieben. Millionen Afghanen leben als Flüchtlinge in Pakistan und Iran. Das Erdbeben in Herat (Oktober 2023) tötete über 1.400 Menschen. Das Bildungsverbot für Mädchen ist eine beispiellose humanitäre Krise.', source: 'https://www.unhcr.org/countries/afghanistan', sourceLabel: 'UNHCR – Afghanistan' },
    infrastructure: { text: 'Die Infrastruktur ist nach Jahrzehnten des Krieges stark unterentwickelt. Die Ring Road (Highway 1) verbindet die Hauptstädte, ist aber teilweise unsicher. Der Kabul International Airport wurde nach dem US-Abzug reaktiviert. China plant die Kupfermine Mes Aynak und den Wakhan-Korridor-Zugang. Strom wird größtenteils aus Nachbarländern importiert.', source: 'https://en.wikipedia.org/wiki/Transport_in_Afghanistan', sourceLabel: 'Wikipedia – Verkehr in Afghanistan' },
  },
  PK: {
    overview: { text: 'Pakistan liegt am Übergang von Süd- zu Zentralasien und erstreckt sich vom Karakorum und Hindukusch im Norden bis zur Küste des Arabischen Meeres. Mit über 230 Millionen Einwohnern ist es das fünftbevölkerungsreichste Land der Welt. Der Indus ist die Lebensader des Landes. Pakistan ist Atommacht und verfügt über reiche kulturelle Vielfalt.', source: 'https://en.wikipedia.org/wiki/Pakistan', sourceLabel: 'Wikipedia – Pakistan' },
    economy: { text: 'Pakistan hat ein BIP von ca. 340 Mrd. USD (2023), kämpft aber mit chronischen Wirtschaftsproblemen. Hohe Inflation, Schuldenlast und IWF-Abhängigkeit prägen die Ökonomie. Textilien, Landwirtschaft und Überweisungen von Auslandspakistanern sind Schlüsselsektoren. Der China-Pakistan Economic Corridor (CPEC) ist das größte Infrastrukturprojekt.', source: 'https://data.worldbank.org/country/PK', sourceLabel: 'World Bank – Pakistan' },
    politics: { text: 'Pakistan ist eine föderale parlamentarische Republik. Das Militär hat enormen politischen Einfluss und hat mehrfach geputscht. Ex-Premierminister Imran Khan wurde 2022 abgesetzt und verhaftet. Die Wahlen 2024 waren umstritten. Die Beziehungen zu Indien, Afghanistan und die Rolle der Geheimdienste (ISI) dominieren die Politik.', source: 'https://en.wikipedia.org/wiki/Politics_of_Pakistan', sourceLabel: 'Wikipedia – Politik Pakistans' },
    security: { text: 'Pakistan kämpft gegen die Tehrik-i-Taliban Pakistan (TTP) und andere militante Gruppen, besonders in den ehemaligen FATA-Gebieten und Belutschistan. Die Kaschmir-Frage mit Indien bleibt der zentrale Konflikt. Pakistan ist Atommacht mit ca. 170 Sprengköpfen. Die Beziehungen zu den afghanischen Taliban sind komplex.', source: 'https://en.wikipedia.org/wiki/Pakistan_Armed_Forces', sourceLabel: 'Wikipedia – Pakistanische Streitkräfte' },
    humanitarian: { text: 'Die Flutkatastrophe 2022 betraf ein Drittel des Landes und vertrieb 33 Millionen Menschen. Pakistan beherbergte jahrzehntelang die größte Flüchtlingspopulation der Welt (Afghanen). 2023 begannen Massenabschiebungen undokumentierter Afghanen. Armut, Analphabetismus und Kindersterblichkeit sind besonders im Süden und Westen hoch.', source: 'https://www.unhcr.org/countries/pakistan', sourceLabel: 'UNHCR – Pakistan' },
    infrastructure: { text: 'Der CPEC (China-Pakistan Economic Corridor) umfasst Straßen, Eisenbahnen, Pipelines und den Tiefseehafen Gwadar am Arabischen Meer (62 Mrd. USD). Der Karakorum Highway verbindet Pakistan mit China. Der Lahore Metro Bus und die Orange Line sind moderne ÖPNV-Projekte. Der neue Islamabad International Airport wurde 2018 eröffnet.', source: 'https://en.wikipedia.org/wiki/Transport_in_Pakistan', sourceLabel: 'Wikipedia – Verkehr in Pakistan' },
  },
  EG: {
    overview: { text: 'Ägypten liegt im Nordosten Afrikas und umfasst die Sinai-Halbinsel, die in Asien liegt. Das Land wird vom Nil durchzogen, der seit Jahrtausenden die Lebensader des Landes bildet. Mit über 104 Millionen Einwohnern ist es das bevölkerungsreichste arabische Land. Die Pyramiden von Gizeh und die antike Zivilisation machen Ägypten zu einem kulturellen Zentrum.', source: 'https://en.wikipedia.org/wiki/Egypt', sourceLabel: 'Wikipedia – Ägypten' },
    economy: { text: 'Ägyptens Wirtschaft stützt sich auf Tourismus, Erdgas, Suezkanal-Einnahmen und Überweisungen von Auslandsägyptern. Das BIP beträgt ca. 387 Mrd. USD (2023). Die Inflation und massive Währungsabwertung des Ägyptischen Pfundes stellen große Herausforderungen dar. Der IWF gewährte 2023 ein Kreditpaket über 3 Mrd. USD.', source: 'https://data.worldbank.org/country/EG', sourceLabel: 'World Bank – Ägypten' },
    politics: { text: 'Ägypten ist eine Präsidialrepublik unter Präsident Abdel Fattah el-Sisi seit 2014. Die politische Landschaft ist stark zentralisiert mit eingeschränkter Opposition. Die Verfassung wurde 2019 geändert, um längere Amtszeiten zu ermöglichen. Ägypten spielt eine Schlüsselrolle als Vermittler im Nahostkonflikt.', source: 'https://en.wikipedia.org/wiki/Politics_of_Egypt', sourceLabel: 'Wikipedia – Politik Ägyptens' },
    security: { text: 'Ägypten hat die größte Armee der arabischen Welt und Afrikas. Auf dem Sinai kämpft die Armee gegen IS-Ableger (Wilayat Sinai). Ägypten kontrolliert den Grenzübergang Rafah nach Gaza und spielt eine zentrale Rolle im Gaza-Konflikt. Die Beziehung zu Äthiopien wegen des GERD-Staudamms ist angespannt.', source: 'https://en.wikipedia.org/wiki/Egyptian_Armed_Forces', sourceLabel: 'Wikipedia – Ägyptische Streitkräfte' },
    humanitarian: { text: 'Ägypten beherbergt über 500.000 registrierte Flüchtlinge, hauptsächlich aus Sudan (nach dem Bürgerkrieg 2023), Syrien und Eritrea. Wasserknappheit durch den GERD-Staudamm in Äthiopien bedroht die Lebensgrundlage. Die Bevölkerung wächst schnell bei begrenzten Ressourcen.', source: 'https://www.unhcr.org/countries/egypt', sourceLabel: 'UNHCR – Ägypten' },
    infrastructure: { text: 'Ägypten investiert massiv in Infrastruktur: die Neue Verwaltungshauptstadt östlich von Kairo, der erweiterte Suezkanal (2015), das nationale Straßennetz und ein Hochgeschwindigkeitszug (Ain Sokhna-Alamein-Marsa Matruh). Die Cairo Metro ist das größte U-Bahn-System Afrikas und des Nahen Ostens.', source: 'https://en.wikipedia.org/wiki/Transport_in_Egypt', sourceLabel: 'Wikipedia – Verkehr in Ägypten' },
  },
  LY: {
    overview: { text: 'Libyen liegt in Nordafrika zwischen Ägypten und Tunesien und erstreckt sich tief in die Sahara. Über 90% des Landes ist Wüste. Die Bevölkerung konzentriert sich auf die Küstenstädte Tripolis und Bengasi. Das Land verfügt über die größten Ölreserven Afrikas und die neuntgrößten weltweit.', source: 'https://en.wikipedia.org/wiki/Libya', sourceLabel: 'Wikipedia – Libyen' },
    economy: { text: 'Libyens Wirtschaft hängt fast vollständig vom Erdöl ab (95% der Exporterlöse). Die Ölproduktion schwankt stark aufgrund von Konflikten und Blockaden zwischen 0,2 und 1,2 Mio. Barrel pro Tag. Vor dem Bürgerkrieg 2011 hatte Libyen den höchsten HDI Afrikas. Zwei rivalisierende Regierungen kontrollieren verschiedene Ölfelder und Zentralbankreserven.', source: 'https://data.worldbank.org/country/LY', sourceLabel: 'World Bank – Libyen' },
    politics: { text: 'Libyen ist seit dem Sturz Gaddafis 2011 politisch gespalten. Die international anerkannte Regierung in Tripolis (GNU unter Dbeibah) und die Regierung im Osten (unter dem Parlament in Tobruk/Haftar) konkurrieren um Legitimität. Wahlen werden wiederholt verschoben. Die UN-Vermittlung (UNSMIL) hat bisher keine Einigung erzielt.', source: 'https://en.wikipedia.org/wiki/Politics_of_Libya', sourceLabel: 'Wikipedia – Politik Libyens' },
    security: { text: 'Milizen kontrollieren große Teile des Landes. Khalifa Haftar dominiert den Osten mit der LNA (Libysche Nationalarmee). Russische Wagner-Gruppe/Afrika Corps ist im Süden aktiv. Türkische Truppen unterstützen die Regierung in Tripolis. Waffen aus Libyen destabilisieren die gesamte Sahel-Region. Menschenhandel und Schleuserkriminalität sind gravierend.', source: 'https://en.wikipedia.org/wiki/Libyan_civil_war', sourceLabel: 'Wikipedia – Libyscher Bürgerkrieg' },
    humanitarian: { text: 'Ca. 300.000 Binnenvertriebene und über 600.000 Migranten und Flüchtlinge im Land. Libyen ist ein wichtiges Transitland für Migranten nach Europa. Migranten werden in Internierungslagern unter unmenschlichen Bedingungen festgehalten. Die Flutkatastrophe in Derna (September 2023) tötete über 11.000 Menschen nach dem Bruch zweier Staudämme.', source: 'https://www.unhcr.org/countries/libya', sourceLabel: 'UNHCR – Libyen' },
    infrastructure: { text: 'Die Infrastruktur wurde durch den Bürgerkrieg schwer beschädigt. Die Küstenautobahn verbindet Tripolis mit Bengasi. Der Große Menschengemachte Fluss (GMMR) ist ein Wasserversorgungsprojekt aus der Gaddafi-Ära, das Grundwasser aus der Sahara an die Küste transportiert. Ölinfrastruktur ist zentral für die Wirtschaft.', source: 'https://en.wikipedia.org/wiki/Transport_in_Libya', sourceLabel: 'Wikipedia – Verkehr in Libyen' },
  },
};

// ── Airports ──────────────────────────
const countryAirports: Record<string, CountryData['airports']> = {
  TR: [
    { name: 'Istanbul Airport (IST)', coords: meGeoToSvg(28.7, 41.3), type: 'airport' },
    { name: 'Sabiha Gökçen (SAW)', coords: meGeoToSvg(29.3, 40.9), type: 'airport' },
    { name: 'Ankara Esenboğa (ESB)', coords: meGeoToSvg(33.0, 40.1), type: 'airport' },
    { name: 'Antalya (AYT)', coords: meGeoToSvg(30.8, 36.9), type: 'airport' },
  ],
  SY: [
    { name: 'Damascus International (DAM)', coords: meGeoToSvg(36.5, 33.4), type: 'airport' },
    { name: 'Aleppo International (ALP)', coords: meGeoToSvg(37.2, 36.2), type: 'airport' },
  ],
  LB: [
    { name: 'Rafik Hariri International (BEY)', coords: meGeoToSvg(35.5, 33.8), type: 'airport' },
  ],
  JO: [
    { name: 'Queen Alia International (AMM)', coords: meGeoToSvg(35.9, 31.7), type: 'airport' },
    { name: 'King Hussein (AQJ)', coords: meGeoToSvg(35.0, 29.6), type: 'airport' },
  ],
  IL: [
    { name: 'Ben Gurion International (TLV)', coords: meGeoToSvg(34.9, 32.0), type: 'airport' },
    { name: 'Ramon Airport (ETM)', coords: meGeoToSvg(35.0, 29.7), type: 'airport' },
  ],
  PS: [
    { name: 'Yasser Arafat International (geschlossen)', coords: meGeoToSvg(34.3, 31.2), type: 'airport' },
  ],
  CY: [
    { name: 'Larnaca International (LCA)', coords: meGeoToSvg(33.6, 34.9), type: 'airport' },
    { name: 'Paphos International (PFO)', coords: meGeoToSvg(32.5, 34.7), type: 'airport' },
  ],
  IQ: [
    { name: 'Baghdad International (BGW)', coords: meGeoToSvg(44.2, 33.3), type: 'airport' },
    { name: 'Erbil International (EBL)', coords: meGeoToSvg(44.0, 36.2), type: 'airport' },
    { name: 'Basra International (BSR)', coords: meGeoToSvg(47.7, 30.5), type: 'airport' },
  ],
  IR: [
    { name: 'Imam Khomeini International (IKA)', coords: meGeoToSvg(51.2, 35.4), type: 'airport' },
    { name: 'Mehrabad (THR)', coords: meGeoToSvg(51.3, 35.7), type: 'airport' },
    { name: 'Isfahan (IFN)', coords: meGeoToSvg(51.9, 32.8), type: 'airport' },
    { name: 'Shiraz (SYZ)', coords: meGeoToSvg(52.6, 29.5), type: 'airport' },
  ],
  SA: [
    { name: 'King Abdulaziz International (JED)', coords: meGeoToSvg(39.2, 21.7), type: 'airport' },
    { name: 'King Khalid International (RUH)', coords: meGeoToSvg(46.7, 24.9), type: 'airport' },
    { name: 'King Fahd International (DMM)', coords: meGeoToSvg(49.8, 26.5), type: 'airport' },
  ],
  AE: [
    { name: 'Dubai International (DXB)', coords: meGeoToSvg(55.4, 25.3), type: 'airport' },
    { name: 'Abu Dhabi International (AUH)', coords: meGeoToSvg(54.7, 24.4), type: 'airport' },
    { name: 'Al Maktoum International (DWC)', coords: meGeoToSvg(55.2, 24.9), type: 'airport' },
  ],
  QA: [
    { name: 'Hamad International (DOH)', coords: meGeoToSvg(51.6, 25.3), type: 'airport' },
  ],
  BH: [
    { name: 'Bahrain International (BAH)', coords: meGeoToSvg(50.6, 26.3), type: 'airport' },
  ],
  KW: [
    { name: 'Kuwait International (KWI)', coords: meGeoToSvg(47.9, 29.2), type: 'airport' },
  ],
  YE: [
    { name: 'Sanaa International (SAH)', coords: meGeoToSvg(44.2, 15.5), type: 'airport' },
    { name: 'Aden International (ADE)', coords: meGeoToSvg(45.0, 12.8), type: 'airport' },
  ],
  OM: [
    { name: 'Muscat International (MCT)', coords: meGeoToSvg(58.3, 23.6), type: 'airport' },
    { name: 'Salalah Airport (SLL)', coords: meGeoToSvg(54.1, 17.0), type: 'airport' },
  ],
  AF: [
    { name: 'Kabul International (KBL)', coords: meGeoToSvg(69.2, 34.6), type: 'airport' },
    { name: 'Kandahar (KDH)', coords: meGeoToSvg(65.8, 31.5), type: 'airport' },
    { name: 'Mazar-i-Sharif (MZR)', coords: meGeoToSvg(67.2, 36.7), type: 'airport' },
  ],
  PK: [
    { name: 'Jinnah International (KHI)', coords: meGeoToSvg(67.2, 24.9), type: 'airport' },
    { name: 'Islamabad International (ISB)', coords: meGeoToSvg(72.8, 33.6), type: 'airport' },
    { name: 'Allama Iqbal (LHE)', coords: meGeoToSvg(74.4, 31.5), type: 'airport' },
  ],
  EG: [
    { name: 'Cairo International (CAI)', coords: meGeoToSvg(31.4, 30.1), type: 'airport' },
    { name: 'Hurghada (HRG)', coords: meGeoToSvg(33.8, 27.2), type: 'airport' },
    { name: 'Sharm el-Sheikh (SSH)', coords: meGeoToSvg(34.4, 28.0), type: 'airport' },
  ],
  LY: [
    { name: 'Mitiga International (MJI)', coords: meGeoToSvg(13.3, 32.9), type: 'airport' },
    { name: 'Benina International (BEN)', coords: meGeoToSvg(20.3, 32.1), type: 'airport' },
  ],
};

// ── Major Cities ──────────────────────────
const countryCities: Record<string, CountryData['majorCities']> = {
  TR: [
    { name: 'Istanbul', coords: meGeoToSvg(29.0, 41.0), population: 15_800_000 },
    { name: 'Ankara', coords: meGeoToSvg(32.9, 39.9), population: 5_700_000, isCapital: true },
    { name: 'Izmir', coords: meGeoToSvg(27.1, 38.4), population: 4_400_000 },
    { name: 'Bursa', coords: meGeoToSvg(29.1, 40.2), population: 3_100_000 },
    { name: 'Antalya', coords: meGeoToSvg(30.7, 36.9), population: 2_600_000 },
  ],
  SY: [
    { name: 'Damaskus', coords: meGeoToSvg(36.3, 33.5), population: 2_500_000, isCapital: true },
    { name: 'Aleppo', coords: meGeoToSvg(37.2, 36.2), population: 1_800_000 },
    { name: 'Homs', coords: meGeoToSvg(36.7, 34.7), population: 800_000 },
    { name: 'Latakia', coords: meGeoToSvg(35.8, 35.5), population: 400_000 },
  ],
  LB: [
    { name: 'Beirut', coords: meGeoToSvg(35.5, 33.9), population: 2_400_000, isCapital: true },
    { name: 'Tripoli', coords: meGeoToSvg(35.8, 34.4), population: 500_000 },
    { name: 'Sidon', coords: meGeoToSvg(35.4, 33.6), population: 200_000 },
  ],
  JO: [
    { name: 'Amman', coords: meGeoToSvg(35.9, 31.9), population: 4_200_000, isCapital: true },
    { name: 'Zarqa', coords: meGeoToSvg(36.1, 32.1), population: 1_400_000 },
    { name: 'Irbid', coords: meGeoToSvg(35.9, 32.6), population: 700_000 },
    { name: 'Aqaba', coords: meGeoToSvg(35.0, 29.5), population: 200_000 },
  ],
  IL: [
    { name: 'Jerusalem', coords: meGeoToSvg(35.2, 31.8), population: 970_000, isCapital: true },
    { name: 'Tel Aviv', coords: meGeoToSvg(34.8, 32.1), population: 4_100_000 },
    { name: 'Haifa', coords: meGeoToSvg(35.0, 32.8), population: 280_000 },
    { name: 'Beer Sheva', coords: meGeoToSvg(34.8, 31.3), population: 210_000 },
  ],
  PS: [
    { name: 'Ramallah', coords: meGeoToSvg(35.2, 31.9), population: 75_000, isCapital: true },
    { name: 'Gaza-Stadt', coords: meGeoToSvg(34.5, 31.5), population: 600_000 },
    { name: 'Hebron', coords: meGeoToSvg(35.1, 31.5), population: 220_000 },
    { name: 'Nablus', coords: meGeoToSvg(35.3, 32.2), population: 150_000 },
  ],
  CY: [
    { name: 'Nikosia', coords: meGeoToSvg(33.4, 35.2), population: 340_000, isCapital: true },
    { name: 'Limassol', coords: meGeoToSvg(33.0, 34.7), population: 240_000 },
    { name: 'Larnaka', coords: meGeoToSvg(33.6, 34.9), population: 145_000 },
  ],
  IQ: [
    { name: 'Bagdad', coords: meGeoToSvg(44.4, 33.3), population: 8_100_000, isCapital: true },
    { name: 'Basra', coords: meGeoToSvg(47.8, 30.5), population: 2_800_000 },
    { name: 'Erbil', coords: meGeoToSvg(44.0, 36.2), population: 1_500_000 },
    { name: 'Mossul', coords: meGeoToSvg(43.1, 36.3), population: 1_800_000 },
    { name: 'Sulaimaniyya', coords: meGeoToSvg(45.4, 35.6), population: 900_000 },
  ],
  IR: [
    { name: 'Teheran', coords: meGeoToSvg(51.4, 35.7), population: 9_100_000, isCapital: true },
    { name: 'Mashhad', coords: meGeoToSvg(59.6, 36.3), population: 3_400_000 },
    { name: 'Isfahan', coords: meGeoToSvg(51.7, 32.7), population: 2_200_000 },
    { name: 'Karadsch', coords: meGeoToSvg(51.0, 35.8), population: 1_900_000 },
    { name: 'Schiras', coords: meGeoToSvg(52.5, 29.6), population: 1_900_000 },
    { name: 'Tabriz', coords: meGeoToSvg(46.3, 38.1), population: 1_700_000 },
  ],
  SA: [
    { name: 'Riad', coords: meGeoToSvg(46.7, 24.7), population: 7_700_000, isCapital: true },
    { name: 'Dschidda', coords: meGeoToSvg(39.2, 21.5), population: 4_600_000 },
    { name: 'Mekka', coords: meGeoToSvg(39.8, 21.4), population: 2_000_000 },
    { name: 'Medina', coords: meGeoToSvg(39.6, 24.5), population: 1_500_000 },
    { name: 'Dammam', coords: meGeoToSvg(50.1, 26.4), population: 1_300_000 },
  ],
  AE: [
    { name: 'Dubai', coords: meGeoToSvg(55.3, 25.3), population: 3_500_000 },
    { name: 'Abu Dhabi', coords: meGeoToSvg(54.4, 24.5), population: 1_500_000, isCapital: true },
    { name: 'Schardscha', coords: meGeoToSvg(55.4, 25.4), population: 1_400_000 },
    { name: 'Al Ain', coords: meGeoToSvg(55.8, 24.2), population: 800_000 },
  ],
  QA: [
    { name: 'Doha', coords: meGeoToSvg(51.5, 25.3), population: 2_400_000, isCapital: true },
    { name: 'Al Wakrah', coords: meGeoToSvg(51.6, 25.2), population: 300_000 },
    { name: 'Al Khor', coords: meGeoToSvg(51.5, 25.7), population: 200_000 },
  ],
  BH: [
    { name: 'Manama', coords: meGeoToSvg(50.6, 26.2), population: 410_000, isCapital: true },
    { name: 'Riffa', coords: meGeoToSvg(50.6, 26.1), population: 195_000 },
    { name: 'Muharraq', coords: meGeoToSvg(50.6, 26.3), population: 180_000 },
  ],
  KW: [
    { name: 'Kuwait-Stadt', coords: meGeoToSvg(47.9, 29.4), population: 3_100_000, isCapital: true },
    { name: 'Hawalli', coords: meGeoToSvg(48.0, 29.3), population: 850_000 },
    { name: 'Ahmadi', coords: meGeoToSvg(48.1, 29.1), population: 640_000 },
  ],
  YE: [
    { name: 'Sanaa', coords: meGeoToSvg(44.2, 15.4), population: 3_900_000, isCapital: true },
    { name: 'Aden', coords: meGeoToSvg(45.0, 12.8), population: 1_000_000 },
    { name: 'Taiz', coords: meGeoToSvg(44.0, 13.6), population: 680_000 },
    { name: 'Hodeidah', coords: meGeoToSvg(42.9, 14.8), population: 600_000 },
  ],
  OM: [
    { name: 'Maskat', coords: meGeoToSvg(58.5, 23.6), population: 1_500_000, isCapital: true },
    { name: 'Salalah', coords: meGeoToSvg(54.1, 17.0), population: 340_000 },
    { name: 'Sohar', coords: meGeoToSvg(56.7, 24.4), population: 140_000 },
  ],
  AF: [
    { name: 'Kabul', coords: meGeoToSvg(69.2, 34.5), population: 4_400_000, isCapital: true },
    { name: 'Herat', coords: meGeoToSvg(62.2, 34.3), population: 600_000 },
    { name: 'Mazar-i-Sharif', coords: meGeoToSvg(67.1, 36.7), population: 500_000 },
    { name: 'Kandahar', coords: meGeoToSvg(65.7, 31.6), population: 615_000 },
  ],
  PK: [
    { name: 'Karatschi', coords: meGeoToSvg(67.0, 24.9), population: 16_500_000 },
    { name: 'Lahore', coords: meGeoToSvg(74.3, 31.5), population: 13_000_000 },
    { name: 'Islamabad', coords: meGeoToSvg(73.0, 33.7), population: 1_200_000, isCapital: true },
    { name: 'Rawalpindi', coords: meGeoToSvg(73.0, 33.6), population: 2_100_000 },
    { name: 'Faisalabad', coords: meGeoToSvg(73.1, 31.4), population: 3_200_000 },
    { name: 'Peschawar', coords: meGeoToSvg(71.6, 34.0), population: 2_000_000 },
  ],
  EG: [
    { name: 'Kairo', coords: meGeoToSvg(31.2, 30.0), population: 21_300_000, isCapital: true },
    { name: 'Alexandria', coords: meGeoToSvg(29.9, 31.2), population: 5_200_000 },
    { name: 'Giza', coords: meGeoToSvg(31.2, 30.0), population: 4_200_000 },
    { name: 'Port Said', coords: meGeoToSvg(32.3, 31.3), population: 750_000 },
  ],
  LY: [
    { name: 'Tripolis', coords: meGeoToSvg(13.2, 32.9), population: 1_200_000, isCapital: true },
    { name: 'Bengasi', coords: meGeoToSvg(20.1, 32.1), population: 630_000 },
    { name: 'Misrata', coords: meGeoToSvg(15.1, 32.4), population: 400_000 },
  ],
};

// ── Country Geographic Coordinates ── All 20 Middle East countries ──
const meCountries: CountryData[] = [
  // ═══ LEVANT ═══
  c('SY', 'Syria', 'Damaskus', 36.3, 33.5, 'Levant', '🇸🇾', 22_100_000, 185_180,
    [[36,37.5],[37.5,37],[38.5,36.8],[40,37],[42,37.3],[42.5,35.5],[42,35],[41,34.5],[41,33],[40,33.5],[39,32.5],[38,33],[36.5,34.5],[36,34.5],[35.8,35.5],[35.7,36],[36,36.5]],
    9_000_000_000, ['Arabisch','Kurdisch'], 'Syrisches Pfund (SYP)',
    [{ label: 'HDI', value: '0.577' }, { label: 'Bürgerkrieg seit', value: '2011' }]),

  c('LB', 'Lebanon', 'Beirut', 35.5, 33.9, 'Levant', '🇱🇧', 5_500_000, 10_452,
    [[35.1,33.1],[35.8,33.1],[36.6,34.6],[36.4,34.7],[36.0,34.5],[35.5,34.5],[35.1,33.8]],
    18_000_000_000, ['Arabisch','Französisch'], 'Libanesisches Pfund (LBP)',
    [{ label: 'HDI', value: '0.706' }, { label: 'Religionsgruppen', value: '18' }]),

  c('JO', 'Jordan', 'Amman', 35.9, 31.9, 'Levant', '🇯🇴', 11_300_000, 89_342,
    [[35.5,32.5],[36,33],[37,33],[38,33],[39,32],[37,30],[37,29],[35,29.5],[35,30.5],[35.5,31.5]],
    47_000_000_000, ['Arabisch'], 'Jordanischer Dinar (JOD)',
    [{ label: 'HDI', value: '0.736' }, { label: 'Flüchtlinge', value: '~2,5 Mio.' }]),

  c('IL', 'Israel', 'Jerusalem', 35.2, 31.8, 'Levant', '🇮🇱', 9_800_000, 22_072,
    [[34.3,31.3],[34.5,31.5],[35.1,33.1],[35.5,33.3],[35.7,33.1],[35.7,32.8],[35.5,31.5],[35,30.5],[35,29.5],[34.9,29.5],[34.3,31.3]],
    525_000_000_000, ['Hebräisch','Arabisch'], 'Neuer Israelischer Schekel (ILS)',
    [{ label: 'HDI', value: '0.919' }, { label: 'Gründung', value: '1948' }]),

  c('PS', 'Palestine', 'Ramallah', 35.2, 31.9, 'Levant', '🇵🇸', 5_400_000, 6_020,
    [[34.2,31.6],[34.5,31.6],[34.6,31.2],[34.2,31.2]],
    19_000_000_000, ['Arabisch'], 'Israelischer Schekel / Jordanischer Dinar',
    [{ label: 'Status', value: 'Beobachterstaat (UN)' }, { label: 'Gebiete', value: 'Westjordanland & Gaza' }]),

  c('CY', 'Cyprus', 'Nikosia', 33.4, 35.2, 'Levant', '🇨🇾', 1_300_000, 9_251,
    [[32.3,34.6],[33.0,34.6],[33.9,35.0],[34.6,35.6],[34.1,35.7],[33.3,35.4],[32.3,35.2]],
    30_000_000_000, ['Griechisch','Türkisch'], 'Euro (EUR)',
    [{ label: 'HDI', value: '0.896' }, { label: 'EU-Beitritt', value: '2004' }]),

  // ═══ GOLFSTAATEN ═══
  c('AE', 'United Arab Emirates', 'Abu Dhabi', 54.4, 24.5, 'Golfstaaten', '🇦🇪', 9_900_000, 83_600,
    [[51.6,24.0],[52.0,24.2],[54.0,24.2],[55.0,24.5],[56.0,25.3],[56.4,26.1],[56.0,26.1],[55.0,25.5],[54.0,24.5],[53.0,24.3],[51.6,24.2]],
    509_000_000_000, ['Arabisch','Englisch'], 'VAE-Dirham (AED)',
    [{ label: 'HDI', value: '0.911' }, { label: 'Emirate', value: '7' }]),

  c('QA', 'Qatar', 'Doha', 51.5, 25.3, 'Golfstaaten', '🇶🇦', 2_700_000, 11_586,
    [[50.8,24.6],[51.0,24.5],[51.6,24.6],[51.6,25.4],[51.7,26.2],[51.3,26.2],[50.8,25.5]],
    236_000_000_000, ['Arabisch'], 'Katar-Riyal (QAR)',
    [{ label: 'HDI', value: '0.875' }, { label: 'WM 2022', value: 'Austragungsort' }]),

  c('BH', 'Bahrain', 'Manama', 50.6, 26.2, 'Golfstaaten', '🇧🇭', 1_500_000, 778,
    [[50.4,25.8],[50.7,25.8],[50.8,26.3],[50.5,26.4],[50.3,26.1]],
    44_000_000_000, ['Arabisch'], 'Bahrain-Dinar (BHD)',
    [{ label: 'HDI', value: '0.875' }, { label: 'Fläche', value: '778 km²' }]),

  c('KW', 'Kuwait', 'Kuwait-Stadt', 47.9, 29.4, 'Golfstaaten', '🇰🇼', 4_300_000, 17_818,
    [[46.6,29.0],[47.5,28.5],[48.4,29.4],[48.4,30.1],[47.7,30.1],[47.0,29.5]],
    164_000_000_000, ['Arabisch'], 'Kuwait-Dinar (KWD)',
    [{ label: 'HDI', value: '0.831' }, { label: 'Ölreserven', value: '~6% weltweit' }]),

  // ═══ MESOPOTAMIEN ═══
  c('IQ', 'Iraq', 'Bagdad', 44.4, 33.3, 'Mesopotamien', '🇮🇶', 43_500_000, 438_317,
    [[39,33],[39,32.5],[40,33.5],[41,34.5],[42,35],[42.5,35.5],[42,37.3],[43.5,37.1],[44.5,37.2],[45.5,36],[46,34],[47.5,31],[48,30.5],[48.5,30],[48,29.5],[46.5,29],[44.5,29.5],[42.5,31],[40,31.5]],
    264_000_000_000, ['Arabisch','Kurdisch'], 'Irakischer Dinar (IQD)',
    [{ label: 'HDI', value: '0.686' }, { label: 'Ölreserven', value: '5.-größte weltweit' }]),

  // ═══ PERSISCH ═══
  c('IR', 'Iran', 'Teheran', 51.4, 35.7, 'Persisch', '🇮🇷', 87_600_000, 1_648_195,
    [[44.5,39.5],[45,39],[45.5,38],[46,38],[47,37.5],[48.5,38.5],[48.8,38.5],[50,37.5],[51,36.5],[53,37],[54,37.5],[55.5,38],[57.5,37.5],[60.5,36.5],[61,36],[61,34],[60.5,33.5],[60.5,31],[61.5,28.5],[61.5,27],[60,26.5],[58,25.5],[57,25.5],[56.5,26.5],[55.5,26.5],[54,27],[52,27],[51.5,28],[50.5,28.5],[50,29.5],[49.5,30],[48.5,30],[48,30.5],[47.5,31],[46,34],[45.5,36]],
    368_000_000_000, ['Persisch','Aserbaidschanisch','Kurdisch'], 'Iranischer Rial (IRR)',
    [{ label: 'HDI', value: '0.774' }, { label: 'Gasreserven', value: '2.-größte weltweit' }]),

  c('AF', 'Afghanistan', 'Kabul', 69.2, 34.5, 'Persisch', '🇦🇫', 40_000_000, 652_230,
    [[61,36],[64.5,36.5],[66,37.5],[67,37.5],[68.5,37.5],[70,37],[71,36.5],[71.5,36],[71,35.5],[71.5,35],[71,34],[70.5,33.5],[69.5,34],[69,34],[68.5,33.5],[67,31],[66.5,31],[66,30],[64.5,29.5],[62,29.5],[61.5,28.5],[61.5,31],[60.5,31],[60.5,33.5],[61,34]],
    14_000_000_000, ['Dari','Paschtu'], 'Afghani (AFN)',
    [{ label: 'HDI', value: '0.462' }, { label: 'Taliban-Herrschaft seit', value: '2021' }]),

  c('PK', 'Pakistan', 'Islamabad', 73.0, 33.7, 'Persisch', '🇵🇰', 231_000_000, 881_913,
    [[61.5,27],[62,28],[62,29.5],[64.5,29.5],[66,30],[66.5,31],[67,31],[68.5,33.5],[69,34],[69.5,34],[70.5,33.5],[71,34],[71.5,35],[71.5,36],[74,37],[75.5,36.5],[76,35.5],[75.5,35],[75,34.5],[74,33],[74.5,32],[74,31],[74,30],[72.5,28.5],[71,28],[70.5,27.5],[70,26],[69,26.5],[68,26.5],[67,25.5],[66.5,25],[65,25],[62,25.5]],
    340_000_000_000, ['Urdu','Englisch','Pandschabi','Sindhi','Paschtu'], 'Pakistanische Rupie (PKR)',
    [{ label: 'HDI', value: '0.544' }, { label: 'Atomwaffen', value: 'Ja (~170)' }]),

  // ═══ ARABISCHE HALBINSEL ═══
  c('SA', 'Saudi Arabia', 'Riad', 46.7, 24.7, 'Arabische Halbinsel', '🇸🇦', 36_400_000, 2_149_690,
    [[36.5,29],[37,28],[38,27],[39,26],[39,22],[39.5,20.5],[41,19.5],[42,17],[43,17],[43.5,14],[44.5,13],[45,13.5],[46,15.5],[47,16.5],[48,18],[49.5,18.5],[50,19.5],[51.5,22.5],[51.5,24],[51.6,24.2],[52,24.2],[54,24.2],[55,24.5],[55.5,24],[55.5,22.5],[55,22],[55,20],[52,17],[51,17.5],[50,19],[48,18],[46.5,17],[44.5,17],[43.5,17],[42,19],[40,20],[39.5,21.5],[39,22.5],[38,24],[37,27],[36.5,28]],
    1_069_000_000_000, ['Arabisch'], 'Saudi-Riyal (SAR)',
    [{ label: 'HDI', value: '0.875' }, { label: 'Ölreserven', value: '2.-größte weltweit' }]),

  c('OM', 'Oman', 'Maskat', 58.5, 23.6, 'Arabische Halbinsel', '🇴🇲', 4_600_000, 309_500,
    [[56.4,26.1],[56.5,26.4],[56.3,26.5],[56.5,26.6],[57,26.5],[57,24.5],[58,23.5],[59,22.5],[59.5,21],[58,20.5],[57,19.5],[55,18],[54.5,17],[54,17],[53,16.5],[52,17],[55,20],[55,22],[55.5,22.5],[55.5,24],[55,24.5],[56,25.3]],
    105_000_000_000, ['Arabisch'], 'Omanischer Rial (OMR)',
    [{ label: 'HDI', value: '0.816' }, { label: 'Straße von Hormuz', value: 'Anrainerstaat' }]),

  c('YE', 'Yemen', 'Sanaa', 44.2, 15.4, 'Arabische Halbinsel', '🇾🇪', 33_700_000, 527_968,
    [[42.5,16.5],[43,17],[43.5,14],[44.5,13],[45,13.5],[46,15.5],[47,16.5],[48,18],[49.5,18.5],[50,19.5],[51.5,22.5],[51.5,19],[52,17],[52,15.5],[50.5,15],[49,14],[48,13.5],[46,13],[44.5,12.5],[43.5,12.5],[43,12.5]],
    21_000_000_000, ['Arabisch'], 'Jemenitischer Rial (YER)',
    [{ label: 'HDI', value: '0.455' }, { label: 'Bürgerkrieg seit', value: '2014' }]),

  // ═══ ERWEITERT ═══
  c('TR', 'Turkey', 'Ankara', 32.9, 39.9, 'Erweitert', '🇹🇷', 85_300_000, 783_562,
    [[26,41.7],[28,41.7],[29,41.2],[30,41.5],[33,42],[34.5,42],[36,41.8],[38.5,41.2],[40.5,41.5],[42,41.5],[43.5,41.1],[44.5,39.5],[44,38.5],[44,37.5],[42.5,37.5],[42,37.3],[40,37],[38.5,36.8],[37.5,37],[36,37.5],[36,36.5],[35.7,36],[33,36.3],[32.5,36.5],[30.8,36.7],[29,36.5],[27,37],[26.5,38],[26,39.5],[26.5,40.5]],
    906_000_000_000, ['Türkisch','Kurdisch'], 'Türkische Lira (TRY)',
    [{ label: 'HDI', value: '0.838' }, { label: 'NATO-Mitglied seit', value: '1952' }]),

  c('EG', 'Egypt', 'Kairo', 31.2, 30.0, 'Erweitert', '🇪🇬', 104_000_000, 1_002_450,
    [[25,31.5],[29,31.5],[31,31.5],[32,31.2],[34.2,29.5],[34.8,29],[34,27.5],[33,28.5],[33,24],[37,22],[35,22],[31,22],[25,22]],
    387_000_000_000, ['Arabisch'], 'Ägyptisches Pfund (EGP)',
    [{ label: 'HDI', value: '0.731' }, { label: 'Suezkanal', value: '193 km' }]),

  c('LY', 'Libya', 'Tripolis', 13.2, 32.9, 'Erweitert', '🇱🇾', 7_000_000, 1_759_540,
    [[10,34],[11.5,33],[13,33],[15,32.5],[20,33],[23,32],[25,31.5],[25,22],[24,20],[16,23.5],[15,23],[12,24],[11.5,24.5],[9.5,30],[8.5,33],[10,34]],
    42_000_000_000, ['Arabisch'], 'Libyscher Dinar (LYD)',
    [{ label: 'HDI', value: '0.718' }, { label: 'Ölreserven', value: 'Größte in Afrika' }]),
];

export { meCountries };
export const meCountriesById: Record<string, CountryData> = Object.fromEntries(meCountries.map(c => [c.id, c]));
