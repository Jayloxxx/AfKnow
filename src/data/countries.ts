import type { CountryData, Region } from '../types';
import { coordsToPath, coordsToCenter, geoToSvg } from '../lib/geoUtils';
import { countryDetailsNorthWest } from './countryDetailsNorthWest';
import { countryDetailsCentralEastSouth } from './countryDetailsCentralEastSouth';

function c(
  id: string, name: string, capital: string, capitalLon: number, capitalLat: number,
  region: Region, flagEmoji: string, population: number, area: number,
  coords: [number, number][], gdp?: number, languages?: string[], currency?: string,
  keyFacts?: { label: string; value: string }[],
): CountryData {
  return {
    id, name, capital, region, flagEmoji, population, area, gdp, languages, currency, keyFacts,
    capitalCoords: geoToSvg(capitalLon, capitalLat),
    path: coordsToPath(coords),
    labelPos: coordsToCenter(coords),
    details: countryDetails[id] ?? countryDetailsNorthWest[id] ?? countryDetailsCentralEastSouth[id] ?? defaultDetails(name),
    airports: countryAirports[id] ?? [],
    majorCities: countryCities[id] ?? [{ name: capital, coords: geoToSvg(capitalLon, capitalLat), population: Math.round(population * 0.1), isCapital: true }],
  };
}

function defaultDetails(name: string) {
  const base = `https://en.wikipedia.org/wiki/${name.replace(/ /g, '_')}`;
  const d = (text: string) => ({ text, source: base, sourceLabel: `Wikipedia – ${name}` });
  return {
    overview: d(`${name} ist ein Staat auf dem afrikanischen Kontinent mit einer vielfältigen Geographie und Kultur.`),
    economy: d(`Die Wirtschaft von ${name} basiert auf einer Mischung aus Landwirtschaft, Rohstoffförderung und Dienstleistungen.`),
    politics: d(`${name} ist eine Republik mit einem Präsidialsystem.`),
    security: d(`Die Sicherheitslage in ${name} variiert je nach Region.`),
    humanitarian: d(`${name} steht vor verschiedenen humanitären Herausforderungen.`),
    infrastructure: d(`Die Infrastruktur in ${name} befindet sich im Ausbau.`),
  };
}

// ── Detailed info for major countries ──────────────────────────

const countryDetails: Record<string, CountryData['details']> = {
  EG: {
    overview: { text: 'Ägypten liegt im Nordosten Afrikas und umfasst die Sinai-Halbinsel. Das Land wird vom Nil durchzogen, der seit Jahrtausenden die Lebensader des Landes bildet. Mit über 104 Millionen Einwohnern ist es das bevölkerungsreichste arabische Land.', source: 'https://en.wikipedia.org/wiki/Egypt', sourceLabel: 'Wikipedia – Egypt' },
    economy: { text: 'Ägyptens Wirtschaft stützt sich auf Tourismus, Erdgas, Suezkanal-Einnahmen und Überweisungen von Auslandsägyptern. Das BIP beträgt ca. 387 Mrd. USD (2023). Die Inflation und Währungsabwertung stellen große Herausforderungen dar.', source: 'https://data.worldbank.org/country/EG', sourceLabel: 'World Bank – Egypt' },
    politics: { text: 'Ägypten ist eine Präsidialrepublik unter Präsident Abdel Fattah el-Sisi seit 2014. Die politische Landschaft ist stark zentralisiert mit eingeschränkter Opposition. Die Verfassung wurde 2019 geändert, um längere Amtszeiten zu ermöglichen.', source: 'https://en.wikipedia.org/wiki/Politics_of_Egypt', sourceLabel: 'Wikipedia – Politics of Egypt' },
    security: { text: 'Ägypten kämpft gegen islamistische Aufständische auf dem Sinai (IS-Ableger Wilayat Sinai). Die Armee führt die Operation Sinai 2018 durch. Im Inland ist die Sicherheitslage stabil, aber mit strenger Überwachung.', source: 'https://en.wikipedia.org/wiki/Sinai_insurgency', sourceLabel: 'Wikipedia – Sinai-Insurgenz' },
    humanitarian: { text: 'Ägypten beherbergt über 300.000 registrierte Flüchtlinge, hauptsächlich aus Sudan, Syrien und Eritrea. Wasserknappheit durch den GERD-Staudamm in Äthiopien ist ein wachsendes Problem.', source: 'https://www.unhcr.org/countries/egypt', sourceLabel: 'UNHCR – Egypt' },
    infrastructure: { text: 'Ägypten investiert massiv in Infrastruktur: die neue Verwaltungshauptstadt östlich von Kairo, der erweiterte Suezkanal und ein nationales Straßennetz. Der Cairo Metro ist das größte U-Bahn-System Afrikas.', source: 'https://en.wikipedia.org/wiki/Transport_in_Egypt', sourceLabel: 'Wikipedia – Transport in Egypt' },
  },
  NG: {
    overview: { text: 'Nigeria ist mit über 223 Millionen Einwohnern das bevölkerungsreichste Land Afrikas. Es liegt am Golf von Guinea und hat eine vielfältige Geographie von Küstenebenen über Savannen bis zum Sahel. Über 250 ethnische Gruppen prägen das Land.', source: 'https://en.wikipedia.org/wiki/Nigeria', sourceLabel: 'Wikipedia – Nigeria' },
    economy: { text: 'Nigeria hat die größte Volkswirtschaft Afrikas mit einem BIP von ca. 477 Mrd. USD. Das Land ist stark von Erdölexporten abhängig (ca. 90% der Exporteinnahmen). Die Diversifizierung der Wirtschaft ist eine zentrale Herausforderung.', source: 'https://data.worldbank.org/country/NG', sourceLabel: 'World Bank – Nigeria' },
    politics: { text: 'Nigeria ist eine föderale Präsidialrepublik mit 36 Bundesstaaten. Präsident Bola Tinubu regiert seit Mai 2023. Die Politik wird oft durch regionale, ethnische und religiöse Spannungen zwischen Nord und Süd geprägt.', source: 'https://en.wikipedia.org/wiki/Politics_of_Nigeria', sourceLabel: 'Wikipedia – Politics of Nigeria' },
    security: { text: 'Boko Haram und ISWAP terrorisieren den Nordosten seit 2009. Banditen und bewaffnete Gruppen operieren im Nordwesten. Im Niger-Delta gibt es Militanz gegen Ölkonzerne. Nigeria hat eine der größten Armeen Westafrikas.', source: 'https://en.wikipedia.org/wiki/Boko_Haram_insurgency', sourceLabel: 'Wikipedia – Boko Haram Insurgenz' },
    humanitarian: { text: 'Über 3 Millionen Binnenvertriebene durch Konflikte im Nordosten. Nahrungsmittelunsicherheit betrifft Millionen. Nigeria ist gleichzeitig Aufnahme- und Herkunftsland für Flüchtlinge.', source: 'https://www.unhcr.org/countries/nigeria', sourceLabel: 'UNHCR – Nigeria' },
    infrastructure: { text: 'Nigeria investiert in neue Schienenverbindungen (Lagos-Ibadan), Dangote-Raffinerie (weltgrößte Einzelraffinerie) und den Lekki Deep Sea Port. Das Stromnetz bleibt eine massive Herausforderung.', source: 'https://en.wikipedia.org/wiki/Transport_in_Nigeria', sourceLabel: 'Wikipedia – Transport in Nigeria' },
  },
  ZA: {
    overview: { text: 'Südafrika liegt an der Südspitze des Kontinents und hat drei Hauptstädte: Pretoria, Kapstadt und Bloemfontein. Das Land ist bekannt für seine Biodiversität, von der Kap-Halbinsel bis zum Kruger-Nationalpark.', source: 'https://en.wikipedia.org/wiki/South_Africa', sourceLabel: 'Wikipedia – South Africa' },
    economy: { text: 'Südafrika hat die am stärksten industrialisierte Volkswirtschaft Afrikas mit einem BIP von ca. 399 Mrd. USD. Bergbau, Finanzdienstleistungen und Tourismus sind Schlüsselsektoren. Die Arbeitslosigkeit liegt bei über 30%.', source: 'https://data.worldbank.org/country/ZA', sourceLabel: 'World Bank – South Africa' },
    politics: { text: 'Südafrika ist eine parlamentarische Republik. Der ANC dominiert seit 1994, verlor aber bei den Wahlen 2024 erstmals die absolute Mehrheit. Präsident Cyril Ramaphosa führt eine Koalitionsregierung.', source: 'https://en.wikipedia.org/wiki/Politics_of_South_Africa', sourceLabel: 'Wikipedia – Politics of South Africa' },
    security: { text: 'Südafrika hat eine hohe Kriminalitätsrate, besonders Gewaltkriminalität. Organisierte Kriminalität und Gang-Aktivitäten sind besonders in Western Cape problematisch. Die SANDF ist professionell, aber unterfinanziert.', source: 'https://en.wikipedia.org/wiki/Crime_in_South_Africa', sourceLabel: 'Wikipedia – Crime in South Africa' },
    humanitarian: { text: 'Südafrika beherbergt über 250.000 Flüchtlinge und Asylsuchende, hauptsächlich aus Simbabwe, Mosambik und der DRK. Xenophobe Gewalt gegen Migranten ist ein wiederkehrendes Problem.', source: 'https://www.unhcr.org/countries/south-africa', sourceLabel: 'UNHCR – South Africa' },
    infrastructure: { text: 'Südafrika hat die beste Infrastruktur Subsahara-Afrikas: Gautrain-Schnellbahn, O.R. Tambo Airport, große Hafenstädte. Die Stromkrise (Loadshedding) durch Eskom ist jedoch ein massives Problem.', source: 'https://en.wikipedia.org/wiki/Transport_in_South_Africa', sourceLabel: 'Wikipedia – Transport in South Africa' },
  },
  KE: {
    overview: { text: 'Kenia liegt in Ostafrika am Indischen Ozean und ist bekannt für seine Wildreservate, den Mount Kenya und das Great Rift Valley. Nairobi ist ein wichtiges wirtschaftliches Zentrum Ostafrikas und Sitz vieler UN-Organisationen.', source: 'https://en.wikipedia.org/wiki/Kenya', sourceLabel: 'Wikipedia – Kenya' },
    economy: { text: 'Kenia hat das größte BIP in Ostafrika mit ca. 113 Mrd. USD. Schlüsselsektoren sind Landwirtschaft (Tee, Blumen), Tourismus, Technologie (M-Pesa) und Logistik über den Hafen Mombasa.', source: 'https://data.worldbank.org/country/KE', sourceLabel: 'World Bank – Kenya' },
    politics: { text: 'Kenia ist eine Präsidialrepublik unter Präsident William Ruto seit 2022. Die Verfassung von 2010 führte ein dezentralisiertes System mit 47 Counties ein. Demokratische Übergänge sind etabliert.', source: 'https://en.wikipedia.org/wiki/Politics_of_Kenya', sourceLabel: 'Wikipedia – Politics of Kenya' },
    security: { text: 'Al-Shabaab aus Somalia stellt die größte Sicherheitsbedrohung dar mit Anschlägen wie dem Westgate-Angriff 2013. Kenia hat Truppen in Somalia als Teil der AMISOM/ATMIS-Mission stationiert.', source: 'https://en.wikipedia.org/wiki/Al-Shabaab_(militant_group)', sourceLabel: 'Wikipedia – Al-Shabaab' },
    humanitarian: { text: 'Kenia beherbergt über 750.000 Flüchtlinge, hauptsächlich aus Somalia (Dadaab-Camp) und Südsudan (Kakuma-Camp). Dürreperioden im Norden führen regelmäßig zu Nahrungsmittelkrisen.', source: 'https://www.unhcr.org/countries/kenya', sourceLabel: 'UNHCR – Kenya' },
    infrastructure: { text: 'Die Standard Gauge Railway (Mombasa-Nairobi) wurde 2017 eröffnet. Der neue Expressway in Nairobi und der Ausbau des Mombasa-Hafens stärken Kenias Rolle als Logistik-Hub Ostafrikas.', source: 'https://en.wikipedia.org/wiki/Transport_in_Kenya', sourceLabel: 'Wikipedia – Transport in Kenya' },
  },
  ET: {
    overview: { text: 'Äthiopien ist das zweitbevölkerungsreichste Land Afrikas mit über 126 Millionen Einwohnern. Es ist das einzige afrikanische Land, das nie kolonisiert wurde. Addis Abeba ist Sitz der Afrikanischen Union.', source: 'https://en.wikipedia.org/wiki/Ethiopia', sourceLabel: 'Wikipedia – Ethiopia' },
    economy: { text: 'Äthiopien war eines der am schnellsten wachsenden Volkswirtschaften weltweit. Landwirtschaft (Kaffee-Ursprungsland), Industrie und Dienstleistungen treiben die Wirtschaft. Der GERD-Staudamm soll die Stromproduktion revolutionieren.', source: 'https://data.worldbank.org/country/ET', sourceLabel: 'World Bank – Ethiopia' },
    politics: { text: 'Premierminister Abiy Ahmed (seit 2018, Friedensnobelpreis 2019) führt eine föderale parlamentarische Republik. Der Tigray-Konflikt (2020-2022) hat das Land schwer belastet. Spannungen zwischen ethnischen Regionen bestehen fort.', source: 'https://en.wikipedia.org/wiki/Politics_of_Ethiopia', sourceLabel: 'Wikipedia – Politics of Ethiopia' },
    security: { text: 'Der Tigray-Krieg endete 2022 mit einem Waffenstillstand. Konflikte in Amhara und Oromia dauern an. Die ENDF ist eine der größten Armeen Afrikas. Ethnische Spannungen bleiben eine Herausforderung.', source: 'https://en.wikipedia.org/wiki/Tigray_War', sourceLabel: 'Wikipedia – Tigray-Krieg' },
    humanitarian: { text: 'Über 4,5 Millionen Binnenvertriebene. 900.000+ Flüchtlinge aus Eritrea, Südsudan und Somalia. Der Tigray-Konflikt löste eine humanitäre Krise aus. Dürreperioden betreffen Millionen im Süden und Osten.', source: 'https://www.unhcr.org/countries/ethiopia', sourceLabel: 'UNHCR – Ethiopia' },
    infrastructure: { text: 'Die Addis Abeba Light Rail ist das erste Stadtbahnsystem Subsahara-Afrikas. Der GERD-Staudamm am Blauen Nil wird einer der größten Afrikas. Die Eisenbahnstrecke nach Dschibuti verbindet das Binnenland mit dem Meer.', source: 'https://en.wikipedia.org/wiki/Transport_in_Ethiopia', sourceLabel: 'Wikipedia – Transport in Ethiopia' },
  },
  CD: {
    overview: { text: 'Die Demokratische Republik Kongo ist flächenmäßig das zweitgrößte Land Afrikas. Der Kongo-Regenwald ist der zweitgrößte tropische Regenwald der Welt. Das Land verfügt über immense Bodenschätze.', source: 'https://en.wikipedia.org/wiki/Democratic_Republic_of_the_Congo', sourceLabel: 'Wikipedia – DR Kongo' },
    economy: { text: 'Die DRK besitzt riesige Vorkommen an Kobalt (70% der Weltproduktion), Kupfer, Diamanten und Coltan. Trotz des Rohstoffreichtums lebt die Mehrheit der Bevölkerung in Armut. Das BIP beträgt ca. 66 Mrd. USD.', source: 'https://data.worldbank.org/country/CD', sourceLabel: 'World Bank – DR Congo' },
    politics: { text: 'Präsident Félix Tshisekedi regiert seit 2019. Die DRK ist eine semi-präsidentielle Republik. Politische Instabilität und schwache Staatsstrukturen, besonders in den östlichen Provinzen, sind chronische Probleme.', source: 'https://en.wikipedia.org/wiki/Politics_of_the_Democratic_Republic_of_the_Congo', sourceLabel: 'Wikipedia – Politics of DR Congo' },
    security: { text: 'Im Osten operieren über 100 bewaffnete Gruppen, darunter M23 (unterstützt von Ruanda), ADF, und verschiedene Mai-Mai-Milizen. MONUSCO ist die größte UN-Friedensmission weltweit. Die Lage in Nord-Kivu bleibt kritisch.', source: 'https://en.wikipedia.org/wiki/Kivu_conflict', sourceLabel: 'Wikipedia – Kivu-Konflikt' },
    humanitarian: { text: 'Über 6,9 Millionen Binnenvertriebene – die größte Binnenvertreibungskrise Afrikas. Ebola-Ausbrüche, Masern-Epidemien und chronische Nahrungsmittelunsicherheit verschärfen die Lage.', source: 'https://www.unhcr.org/countries/democratic-republic-congo', sourceLabel: 'UNHCR – DR Congo' },
    infrastructure: { text: 'Die Infrastruktur ist stark unterentwickelt. Nur ein Bruchteil der Straßen ist asphaltiert. Der Kongo-Fluss dient als Haupttransportweg. Das Inga-Staudamm-Projekt könnte den gesamten Kontinent mit Strom versorgen.', source: 'https://en.wikipedia.org/wiki/Transport_in_the_Democratic_Republic_of_the_Congo', sourceLabel: 'Wikipedia – Transport in DR Congo' },
  },
  DZ: {
    overview: { text: 'Algerien ist flächenmäßig das größte Land Afrikas. Über 80% des Landes wird von der Sahara bedeckt. Die Bevölkerung konzentriert sich entlang der Mittelmeerküste. Arabisch und Berberisch sind Amtssprachen.', source: 'https://en.wikipedia.org/wiki/Algeria', sourceLabel: 'Wikipedia – Algeria' },
    economy: { text: 'Algeriens Wirtschaft basiert stark auf Erdöl und Erdgas (ca. 95% der Exporterlöse). Das BIP beträgt ca. 195 Mrd. USD. Die Diversifizierung der Wirtschaft weg von Kohlenwasserstoffen ist die größte Herausforderung.', source: 'https://data.worldbank.org/country/DZ', sourceLabel: 'World Bank – Algeria' },
    politics: { text: 'Algerien ist eine Präsidialrepublik unter Abdelmadjid Tebboune seit 2019. Das Militär hat traditionell großen Einfluss. Die Hirak-Protestbewegung 2019-2021 führte zum Rücktritt von Langzeitpräsident Bouteflika.', source: 'https://en.wikipedia.org/wiki/Politics_of_Algeria', sourceLabel: 'Wikipedia – Politics of Algeria' },
    security: { text: 'Nach dem Bürgerkrieg der 1990er Jahre hat sich die Sicherheitslage stabilisiert. AQIM operiert in der Sahel-Region im Süden. Die algerische Armee ist eine der stärksten in Nordafrika.', source: 'https://en.wikipedia.org/wiki/Algerian_People%27s_National_Armed_Forces', sourceLabel: 'Wikipedia – Algerian Military' },
    humanitarian: { text: 'Algerien beherbergt über 100.000 Sahrawi-Flüchtlinge in Lagern bei Tindouf seit den 1970er Jahren. Subsahara-afrikanische Migranten nutzen Algerien als Transitland nach Europa.', source: 'https://www.unhcr.org/countries/algeria', sourceLabel: 'UNHCR – Algeria' },
    infrastructure: { text: 'Algerien hat das längste Autobahnnetz Afrikas (Ost-West-Autobahn, 1.216 km). Die Metro von Algier, Straßenbahnsysteme und der neue Hafen El-Hamdania stärken die Infrastruktur.', source: 'https://en.wikipedia.org/wiki/Transport_in_Algeria', sourceLabel: 'Wikipedia – Transport in Algeria' },
  },
  MA: {
    overview: { text: 'Marokko liegt im Nordwesten Afrikas an der Straße von Gibraltar. Das Land bietet eine vielfältige Landschaft vom Atlasgebirge über Wüsten bis zu Atlantik- und Mittelmeerküsten. Es beansprucht die Westsahara.', source: 'https://en.wikipedia.org/wiki/Morocco', sourceLabel: 'Wikipedia – Morocco' },
    economy: { text: 'Marokkos Wirtschaft ist diversifiziert: Phosphatexport (weltgrößte Reserven), Automobilindustrie, Tourismus und Landwirtschaft. Das BIP beträgt ca. 141 Mrd. USD. Die Freihandelszone Tanger Med ist ein Wachstumsmotor.', source: 'https://data.worldbank.org/country/MA', sourceLabel: 'World Bank – Morocco' },
    politics: { text: 'Marokko ist eine konstitutionelle Monarchie unter König Mohammed VI. seit 1999. Der König hat weitreichende exekutive Befugnisse. Das Parlament hat begrenzte legislative Macht.', source: 'https://en.wikipedia.org/wiki/Politics_of_Morocco', sourceLabel: 'Wikipedia – Politics of Morocco' },
    security: { text: 'Marokko hat eine relativ stabile Sicherheitslage. Das Land ist ein wichtiger Partner im Kampf gegen Terrorismus. Der Westsahara-Konflikt mit der Polisario-Front bleibt ungelöst.', source: 'https://en.wikipedia.org/wiki/Western_Sahara_conflict', sourceLabel: 'Wikipedia – Western Sahara conflict' },
    humanitarian: { text: 'Marokko ist zunehmend Ziel- und Transitland für Migranten aus Subsahara-Afrika. Das Erdbeben von Al Haouz 2023 forderte über 2.900 Todesopfer und verursachte massive Schäden.', source: 'https://www.unhcr.org/countries/morocco', sourceLabel: 'UNHCR – Morocco' },
    infrastructure: { text: 'Der Al Boraq ist der erste Hochgeschwindigkeitszug Afrikas (Tanger-Casablanca). Tanger Med ist einer der größten Häfen im Mittelmeer. Noor-Ouarzazate ist eines der weltgrößten Solarkraftwerke.', source: 'https://en.wikipedia.org/wiki/Transport_in_Morocco', sourceLabel: 'Wikipedia – Transport in Morocco' },
  },
  GH: {
    overview: { text: 'Ghana liegt an der Küste Westafrikas am Golf von Guinea. Als erstes subsaharisches Land, das die Unabhängigkeit erlangte (1957), gilt es als Vorreiter der afrikanischen Befreiungsbewegung. Kwame Nkrumah ist Nationalheld.', source: 'https://en.wikipedia.org/wiki/Ghana', sourceLabel: 'Wikipedia – Ghana' },
    economy: { text: 'Ghana ist Afrikas zweitgrößter Goldproduzent und ein bedeutender Kakaoexporteur. Seit der Entdeckung des Jubilee-Ölfelds 2007 ist auch Erdöl wichtig. Das BIP beträgt ca. 76 Mrd. USD.', source: 'https://data.worldbank.org/country/GH', sourceLabel: 'World Bank – Ghana' },
    politics: { text: 'Ghana gilt als eine der stabilsten Demokratien Afrikas mit regelmäßigen friedlichen Machtwechseln. Präsident John Mahama (NDC) regiert seit 2025. NPP und NDC dominieren die Parteienlandschaft.', source: 'https://en.wikipedia.org/wiki/Politics_of_Ghana', sourceLabel: 'Wikipedia – Politics of Ghana' },
    security: { text: 'Ghana hat eine relativ stabile Sicherheitslage, ist aber zunehmend besorgt über die Ausbreitung von Dschihadismus aus dem Sahel. Illegaler Goldabbau (Galamsey) verursacht Umweltzerstörung und soziale Spannungen.', source: 'https://en.wikipedia.org/wiki/Ghana_Armed_Forces', sourceLabel: 'Wikipedia – Ghana Armed Forces' },
    humanitarian: { text: 'Ghana beherbergt ca. 80.000 Flüchtlinge, hauptsächlich aus Togo, Côte d\'Ivoire und Burkina Faso. Periodische Überschwemmungen betreffen vor allem den Norden des Landes.', source: 'https://www.unhcr.org/countries/ghana', sourceLabel: 'UNHCR – Ghana' },
    infrastructure: { text: 'Der Tema-Hafen und Takoradi-Hafen sind die wichtigsten Seehäfen. Der Kotoka International Airport in Accra wurde kürzlich modernisiert. Der Akosombo-Staudamm am Volta versorgt das Land mit Strom.', source: 'https://en.wikipedia.org/wiki/Transport_in_Ghana', sourceLabel: 'Wikipedia – Transport in Ghana' },
  },
  TZ: {
    overview: { text: 'Tansania liegt in Ostafrika und beherbergt den Kilimandscharo, Afrikas höchsten Berg. Die Serengeti und der Ngorongoro-Krater gehören zu den bekanntesten Naturschutzgebieten der Welt. Sansibar ist ein halbautonomer Teilstaat.', source: 'https://en.wikipedia.org/wiki/Tanzania', sourceLabel: 'Wikipedia – Tanzania' },
    economy: { text: 'Tansanias Wirtschaft wächst stetig mit einem BIP von ca. 79 Mrd. USD. Tourismus, Bergbau (Gold, Tansanit), Landwirtschaft und zunehmend Erdgas treiben die Entwicklung.', source: 'https://data.worldbank.org/country/TZ', sourceLabel: 'World Bank – Tanzania' },
    politics: { text: 'Präsidentin Samia Suluhu Hassan (seit 2021) führt das Land nach dem Tod von John Magufuli. Sie hat eine politische Öffnung eingeleitet. Die CCM dominiert seit der Unabhängigkeit die Politik.', source: 'https://en.wikipedia.org/wiki/Politics_of_Tanzania', sourceLabel: 'Wikipedia – Politics of Tanzania' },
    security: { text: 'Tansania ist vergleichsweise stabil. Im Süden gibt es eine Bedrohung durch islamistische Aufständische aus Mosambik (Cabo Delgado). Die TPDF beteiligt sich an regionalen Friedensmissionen.', source: 'https://en.wikipedia.org/wiki/Tanzania_People%27s_Defence_Force', sourceLabel: 'Wikipedia – TPDF' },
    humanitarian: { text: 'Tansania beherbergt über 250.000 Flüchtlinge, hauptsächlich aus Burundi und DR Kongo. Klimawandel-bedingte Dürren und Überschwemmungen betreffen ländliche Gebiete zunehmend.', source: 'https://www.unhcr.org/countries/tanzania', sourceLabel: 'UNHCR – Tanzania' },
    infrastructure: { text: 'Die Standard Gauge Railway (Dar es Salaam – Dodoma – Mwanza) ist ein Megaprojekt. Der Julius Nyerere Hydropower Dam am Rufiji wird einer der größten Afrikas. Dar es Salaam Port wird erweitert.', source: 'https://en.wikipedia.org/wiki/Transport_in_Tanzania', sourceLabel: 'Wikipedia – Transport in Tanzania' },
  },
  SD: {
    overview: { text: 'Sudan liegt im nordöstlichen Afrika und ist nach der Abspaltung des Südsudan 2011 das drittgrößte Land Afrikas. Der Nil und seine Nebenflüsse durchziehen das Land. Khartum liegt am Zusammenfluss von Weißem und Blauem Nil.', source: 'https://en.wikipedia.org/wiki/Sudan', sourceLabel: 'Wikipedia – Sudan' },
    economy: { text: 'Sudans Wirtschaft leidet unter dem Bürgerkrieg seit April 2023. Vor dem Krieg betrug das BIP ca. 26 Mrd. USD. Gold, Viehzucht und Landwirtschaft sind die Hauptsektoren. Internationale Sanktionen wurden teilweise aufgehoben.', source: 'https://data.worldbank.org/country/SD', sourceLabel: 'World Bank – Sudan' },
    politics: { text: 'Seit April 2023 herrscht ein verheerender Bürgerkrieg zwischen der Sudanesischen Armee (SAF) unter al-Burhan und den Rapid Support Forces (RSF) unter Hemedti. Die demokratische Transition nach dem Sturz al-Bashirs 2019 wurde unterbrochen.', source: 'https://en.wikipedia.org/wiki/Sudanese_civil_war_(2023%E2%80%93present)', sourceLabel: 'Wikipedia – Sudan Civil War' },
    security: { text: 'Der Bürgerkrieg zwischen SAF und RSF hat Millionen vertrieben. Darfur erlebt erneute ethnische Gewalt. Der Darfur-Konflikt seit 2003 bleibt ungelöst. Massive Menschenrechtsverletzungen wurden dokumentiert.', source: 'https://en.wikipedia.org/wiki/Sudanese_civil_war_(2023%E2%80%93present)', sourceLabel: 'Wikipedia – Sudanesischer Bürgerkrieg' },
    humanitarian: { text: 'Über 8 Millionen Binnenvertriebene und 1,5 Millionen Flüchtlinge in Nachbarländer seit 2023. Sudan erlebt die größte Vertreibungskrise weltweit. Hunger, Cholera und fehlende medizinische Versorgung verschärfen die Lage.', source: 'https://www.unhcr.org/countries/sudan', sourceLabel: 'UNHCR – Sudan' },
    infrastructure: { text: 'Die Infrastruktur wurde durch den Bürgerkrieg schwer beschädigt. Brücken, Krankenhäuser und Flughäfen wurden zerstört. Port Sudan am Roten Meer ist der wichtigste Seehafen.', source: 'https://en.wikipedia.org/wiki/Transport_in_Sudan', sourceLabel: 'Wikipedia – Transport in Sudan' },
  },
  LY: {
    overview: { text: 'Libyen liegt in Nordafrika zwischen Ägypten und Tunesien. Über 90% des Landes ist Wüste. Die Bevölkerung konzentriert sich auf die Küstenstädte Tripolis und Bengasi. Das Land verfügt über Afrikas größte Ölreserven.', source: 'https://en.wikipedia.org/wiki/Libya', sourceLabel: 'Wikipedia – Libya' },
    economy: { text: 'Libyens Wirtschaft hängt fast vollständig vom Erdöl ab. Das BIP schwankt stark aufgrund von Konflikten und Ölblockaden. Vor dem Bürgerkrieg 2011 hatte Libyen den höchsten HDI Afrikas.', source: 'https://data.worldbank.org/country/LY', sourceLabel: 'World Bank – Libya' },
    politics: { text: 'Libyen ist seit dem Sturz Gaddafis 2011 politisch gespalten. Rivalisierende Regierungen in Tripolis und im Osten konkurrieren um Legitimität. Die geplanten Wahlen werden wiederholt verschoben.', source: 'https://en.wikipedia.org/wiki/Politics_of_Libya', sourceLabel: 'Wikipedia – Politics of Libya' },
    security: { text: 'Milizen kontrollieren große Teile des Landes. Russische Wagner-Gruppe/Afrika Corps ist im Süden präsent. Waffen aus Libyen destabilisieren die gesamte Sahel-Region. Menschenhandel ist ein gravierendes Problem.', source: 'https://en.wikipedia.org/wiki/Second_Libyan_Civil_War', sourceLabel: 'Wikipedia – Libyscher Bürgerkrieg' },
    humanitarian: { text: 'Ca. 300.000 Binnenvertriebene. Libyen ist ein wichtiges Transitland für Migranten nach Europa. Migranten werden in Internierungslagern unter unmenschlichen Bedingungen festgehalten.', source: 'https://www.unhcr.org/countries/libya', sourceLabel: 'UNHCR – Libya' },
    infrastructure: { text: 'Die Infrastruktur wurde durch den Bürgerkrieg schwer beschädigt. Die Küstenautobahn und der Große-Menschengemachte-Fluss (GMMR) sind bemerkenswerte Projekte aus der Gaddafi-Ära.', source: 'https://en.wikipedia.org/wiki/Transport_in_Libya', sourceLabel: 'Wikipedia – Transport in Libya' },
  },
};

// ── Airports ──────────────────────────
const countryAirports: Record<string, CountryData['airports']> = {
  EG: [
    { name: 'Cairo International (CAI)', coords: geoToSvg(31.4, 30.1), type: 'airport' },
    { name: 'Hurghada (HRG)', coords: geoToSvg(33.8, 27.2), type: 'airport' },
    { name: 'Sharm el-Sheikh (SSH)', coords: geoToSvg(34.4, 28.0), type: 'airport' },
  ],
  NG: [
    { name: 'Murtala Muhammed (LOS)', coords: geoToSvg(3.3, 6.6), type: 'airport' },
    { name: 'Nnamdi Azikiwe (ABV)', coords: geoToSvg(7.3, 9.0), type: 'airport' },
    { name: 'Mallam Aminu Kano (KAN)', coords: geoToSvg(8.5, 12.0), type: 'airport' },
  ],
  ZA: [
    { name: 'O.R. Tambo (JNB)', coords: geoToSvg(28.2, -26.1), type: 'airport' },
    { name: 'Cape Town (CPT)', coords: geoToSvg(18.6, -33.9), type: 'airport' },
    { name: 'King Shaka (DUR)', coords: geoToSvg(31.1, -29.6), type: 'airport' },
  ],
  KE: [
    { name: 'Jomo Kenyatta (NBO)', coords: geoToSvg(36.9, -1.3), type: 'airport' },
    { name: 'Moi International (MBA)', coords: geoToSvg(39.6, -4.0), type: 'airport' },
  ],
  ET: [
    { name: 'Bole International (ADD)', coords: geoToSvg(38.8, 8.98), type: 'airport' },
    { name: 'Dire Dawa (DIR)', coords: geoToSvg(41.9, 9.6), type: 'airport' },
  ],
  MA: [
    { name: 'Mohammed V (CMN)', coords: geoToSvg(-7.6, 33.4), type: 'airport' },
    { name: 'Marrakech Menara (RAK)', coords: geoToSvg(-8.0, 31.6), type: 'airport' },
  ],
  DZ: [
    { name: 'Houari Boumediene (ALG)', coords: geoToSvg(3.2, 36.7), type: 'airport' },
    { name: 'Oran Ahmed Ben Bella (ORN)', coords: geoToSvg(-0.6, 35.6), type: 'airport' },
  ],
  GH: [
    { name: 'Kotoka International (ACC)', coords: geoToSvg(-0.2, 5.6), type: 'airport' },
    { name: 'Kumasi (KMS)', coords: geoToSvg(-1.6, 6.7), type: 'airport' },
  ],
  TZ: [
    { name: 'Julius Nyerere (DAR)', coords: geoToSvg(39.2, -6.9), type: 'airport' },
    { name: 'Kilimanjaro (JRO)', coords: geoToSvg(37.1, -3.4), type: 'airport' },
  ],
  CD: [
    { name: 'N\'Djili (FIH)', coords: geoToSvg(15.4, -4.4), type: 'airport' },
    { name: 'Lubumbashi (FBM)', coords: geoToSvg(27.5, -11.6), type: 'airport' },
  ],
  SD: [
    { name: 'Khartoum (KRT)', coords: geoToSvg(32.6, 15.6), type: 'airport' },
    { name: 'Port Sudan (PZU)', coords: geoToSvg(37.2, 19.6), type: 'airport' },
  ],
  LY: [
    { name: 'Mitiga (MJI)', coords: geoToSvg(13.3, 32.9), type: 'airport' },
    { name: 'Benina (BEN)', coords: geoToSvg(20.3, 32.1), type: 'airport' },
  ],
};

// ── Major Cities ──────────────────────────
const countryCities: Record<string, CountryData['majorCities']> = {
  EG: [
    { name: 'Kairo', coords: geoToSvg(31.2, 30.0), population: 21_300_000, isCapital: true },
    { name: 'Alexandria', coords: geoToSvg(29.9, 31.2), population: 5_200_000 },
    { name: 'Giza', coords: geoToSvg(31.2, 30.0), population: 4_200_000 },
    { name: 'Shubra El-Kheima', coords: geoToSvg(31.2, 30.1), population: 1_100_000 },
  ],
  NG: [
    { name: 'Lagos', coords: geoToSvg(3.4, 6.5), population: 16_000_000 },
    { name: 'Kano', coords: geoToSvg(8.5, 12.0), population: 4_100_000 },
    { name: 'Abuja', coords: geoToSvg(7.5, 9.1), population: 3_600_000, isCapital: true },
    { name: 'Ibadan', coords: geoToSvg(3.9, 7.4), population: 3_600_000 },
  ],
  ZA: [
    { name: 'Johannesburg', coords: geoToSvg(28.0, -26.2), population: 5_800_000 },
    { name: 'Kapstadt', coords: geoToSvg(18.4, -33.9), population: 4_600_000 },
    { name: 'Durban', coords: geoToSvg(31.0, -29.9), population: 3_700_000 },
    { name: 'Pretoria', coords: geoToSvg(28.2, -25.7), population: 2_600_000, isCapital: true },
  ],
  KE: [
    { name: 'Nairobi', coords: geoToSvg(36.8, -1.3), population: 4_700_000, isCapital: true },
    { name: 'Mombasa', coords: geoToSvg(39.7, -4.0), population: 1_300_000 },
    { name: 'Kisumu', coords: geoToSvg(34.8, -0.1), population: 610_000 },
  ],
  ET: [
    { name: 'Addis Abeba', coords: geoToSvg(38.7, 9.0), population: 5_200_000, isCapital: true },
    { name: 'Dire Dawa', coords: geoToSvg(41.9, 9.6), population: 500_000 },
    { name: 'Adama', coords: geoToSvg(39.3, 8.5), population: 450_000 },
  ],
  CD: [
    { name: 'Kinshasa', coords: geoToSvg(15.3, -4.3), population: 17_000_000, isCapital: true },
    { name: 'Lubumbashi', coords: geoToSvg(27.5, -11.7), population: 2_800_000 },
    { name: 'Mbuji-Mayi', coords: geoToSvg(23.6, -6.2), population: 2_500_000 },
  ],
  DZ: [
    { name: 'Algier', coords: geoToSvg(3.0, 36.8), population: 3_900_000, isCapital: true },
    { name: 'Oran', coords: geoToSvg(-0.6, 35.7), population: 1_500_000 },
    { name: 'Constantine', coords: geoToSvg(6.6, 36.4), population: 950_000 },
  ],
  MA: [
    { name: 'Casablanca', coords: geoToSvg(-7.6, 33.6), population: 3_700_000 },
    { name: 'Rabat', coords: geoToSvg(-6.8, 34.0), population: 1_900_000, isCapital: true },
    { name: 'Marrakesch', coords: geoToSvg(-8.0, 31.6), population: 1_000_000 },
  ],
  GH: [
    { name: 'Accra', coords: geoToSvg(-0.2, 5.6), population: 2_500_000, isCapital: true },
    { name: 'Kumasi', coords: geoToSvg(-1.6, 6.7), population: 2_000_000 },
    { name: 'Tamale', coords: geoToSvg(-0.8, 9.4), population: 510_000 },
  ],
  TZ: [
    { name: 'Dar es Salaam', coords: geoToSvg(39.3, -6.8), population: 7_400_000 },
    { name: 'Dodoma', coords: geoToSvg(35.7, -6.2), population: 450_000, isCapital: true },
    { name: 'Mwanza', coords: geoToSvg(32.9, -2.5), population: 1_100_000 },
  ],
  SD: [
    { name: 'Khartum', coords: geoToSvg(32.5, 15.6), population: 6_000_000, isCapital: true },
    { name: 'Omdurman', coords: geoToSvg(32.5, 15.6), population: 2_400_000 },
    { name: 'Port Sudan', coords: geoToSvg(37.2, 19.6), population: 500_000 },
  ],
  LY: [
    { name: 'Tripolis', coords: geoToSvg(13.2, 32.9), population: 1_200_000, isCapital: true },
    { name: 'Bengasi', coords: geoToSvg(20.1, 32.1), population: 630_000 },
    { name: 'Misrata', coords: geoToSvg(15.1, 32.4), population: 400_000 },
  ],
};

// ── Country Geographic Coordinates ── All 54 countries ──
const countries: CountryData[] = [
  // ═══ NORTH AFRICA ═══
  c('MA', 'Morocco', 'Rabat', -6.8, 34.0, 'North Africa', '🇲🇦', 37_500_000, 446_550,
    [[-6,35.8],[-4,35.8],[-2,35.1],[-1.7,34.5],[-1.2,32.5],[-1,30],[-1.5,29],[-5,29],[-9,27.8],[-13,27.7],[-12,29.5],[-10,31],[-8,33],[-6.5,34.5]],
    141_000_000_000, ['Arabisch','Berberisch','Französisch'], 'Marokkanischer Dirham (MAD)',
    [{ label: 'HDI', value: '0.683' }, { label: 'Fläche', value: '446.550 km²' }]),

  c('DZ', 'Algeria', 'Algier', 3.0, 36.8, 'North Africa', '🇩🇿', 45_600_000, 2_381_741,
    [[-2,35.1],[0,36.2],[3,37],[6,37],[8,37],[8,34.5],[8.5,33],[9.5,30],[9,28],[7,24],[5.5,24],[3,23.5],[2,20],[0.5,20.5],[-1,21.5],[-4,22],[-5,23.5],[-5,29],[-1.5,29],[-1,30],[-1.2,32.5],[-1.7,34.5]],
    195_000_000_000, ['Arabisch','Berberisch','Französisch'], 'Algerischer Dinar (DZD)'),

  c('TN', 'Tunisia', 'Tunis', 10.2, 36.8, 'North Africa', '🇹🇳', 12_500_000, 163_610,
    [[8,37],[9.5,37.3],[10.5,37.2],[11.5,36.5],[10.5,35],[10,34],[8.5,33],[8,34.5]],
    46_000_000_000, ['Arabisch','Französisch'], 'Tunesischer Dinar (TND)'),

  c('LY', 'Libya', 'Tripolis', 13.2, 32.9, 'North Africa', '🇱🇾', 7_000_000, 1_759_540,
    [[10,34],[13,33],[15,32.5],[20,33],[23,32],[25,31.5],[25,22],[24,20],[16,23.5],[15,23],[12,24],[11.5,24.5],[9.5,30],[8.5,33]],
    42_000_000_000, ['Arabisch'], 'Libyscher Dinar (LYD)'),

  c('EG', 'Egypt', 'Kairo', 31.2, 30.0, 'North Africa', '🇪🇬', 104_000_000, 1_002_450,
    [[25,31.5],[29,31.5],[32,31.2],[34.2,29.5],[34.8,29],[34,27.5],[33,28.5],[33,24],[37,22],[31,22],[25,22]],
    387_000_000_000, ['Arabisch'], 'Ägyptisches Pfund (EGP)',
    [{ label: 'HDI', value: '0.731' }, { label: 'Suezkanal', value: '193 km' }]),

  c('EH', 'Western Sahara', 'Laayoune', -13.2, 27.2, 'North Africa', '🇪🇭', 600_000, 266_000,
    [[-13,27.7],[-9,27.8],[-5,29],[-5,23.5],[-6,21.3],[-8.7,21.3],[-13,21.3],[-17,21],[-17,25.5],[-15,26.5]]),

  // ═══ WEST AFRICA ═══
  c('MR', 'Mauritania', 'Nouakchott', -15.9, 18.1, 'West Africa', '🇲🇷', 4_900_000, 1_030_700,
    [[-17,21],[-13,21.3],[-6,21.3],[-5,23.5],[-4,22],[-4,19.5],[-5,17],[-5.5,15],[-12,14.8],[-16.5,16.5],[-17,16]],
    10_000_000_000, ['Arabisch','Französisch'], 'Ouguiya (MRU)'),

  c('ML', 'Mali', 'Bamako', -8.0, 12.6, 'West Africa', '🇲🇱', 22_600_000, 1_240_192,
    [[-12,24.5],[-5,24.5],[-5,23.5],[-4,22],[-1,21.5],[1,21],[4,20],[4,15],[2.5,14],[1,12],[-2,11],[-5,11],[-5.5,12],[-8.5,11],[-11.5,12.5],[-12,14.8],[-5.5,15],[-5,17],[-4,19.5],[-4,22],[-5,23.5],[-5,24.5]],
    19_000_000_000, ['Französisch','Bambara'], 'CFA-Franc (XOF)'),

  c('SN', 'Senegal', 'Dakar', -17.4, 14.7, 'West Africa', '🇸🇳', 17_700_000, 196_722,
    [[-17.5,14.8],[-16.5,16.5],[-12,14.8],[-11.5,12.5],[-13,12.5],[-15,12],[-16.5,12.5],[-17.5,13]],
    27_000_000_000, ['Französisch','Wolof'], 'CFA-Franc (XOF)'),

  c('GM', 'Gambia', 'Banjul', -16.6, 13.5, 'West Africa', '🇬🇲', 2_500_000, 11_295,
    [[-16.8,13.8],[-14.5,13.8],[-13.8,13.3],[-14.5,13.2],[-16.8,13.3]],
    2_100_000_000, ['Englisch','Mandinka'], 'Dalasi (GMD)'),

  c('GW', 'Guinea-Bissau', 'Bissau', -15.6, 11.9, 'West Africa', '🇬🇼', 2_100_000, 36_125,
    [[-16.5,12.5],[-15,12],[-14,12],[-14,11],[-15,11],[-16.5,11.5]],
    1_600_000_000, ['Portugiesisch','Crioulo'], 'CFA-Franc (XOF)'),

  c('GN', 'Guinea', 'Conakry', -13.7, 9.5, 'West Africa', '🇬🇳', 14_200_000, 245_857,
    [[-15,12],[-13.5,12.5],[-11.5,12.5],[-9,12],[-8.5,11],[-8,9],[-9,7.5],[-10.5,7.5],[-12,8.5],[-13,9.5],[-14.5,10.5],[-15,11],[-14,11],[-14,12]],
    19_000_000_000, ['Französisch','Fulani','Malinke'], 'Guinea-Franc (GNF)'),

  c('SL', 'Sierra Leone', 'Freetown', -13.2, 8.5, 'West Africa', '🇸🇱', 8_600_000, 71_740,
    [[-13,9.5],[-12,9.5],[-11,8.5],[-10.5,7],[-12,7.5],[-13,8.5]],
    4_200_000_000, ['Englisch','Krio'], 'Leone (SLL)'),

  c('LR', 'Liberia', 'Monrovia', -10.8, 6.3, 'West Africa', '🇱🇷', 5_400_000, 111_369,
    [[-11,8.5],[-10,8.5],[-8.5,7],[-7.5,4.5],[-9,5],[-10.5,7.5]],
    4_000_000_000, ['Englisch'], 'Liberianischer Dollar (LRD)'),

  c('CI', "Côte d'Ivoire", 'Yamoussoukro', -5.3, 6.8, 'West Africa', '🇨🇮', 28_200_000, 322_463,
    [[-8.5,10.5],[-6,10],[-4,10],[-3,9.5],[-2.5,8],[-3,5],[-5,5.2],[-7.5,4.5],[-8.5,7],[-9,9]],
    70_000_000_000, ['Französisch'], 'CFA-Franc (XOF)'),

  c('BF', 'Burkina Faso', 'Ouagadougou', -1.5, 12.4, 'West Africa', '🇧🇫', 22_700_000, 274_200,
    [[-5.5,15],[-4,14.5],[-2,14],[0,14.5],[1,12],[2,11],[0.5,11],[-1,10],[-2.5,9.5],[-3.5,10],[-5,10.5],[-5.5,12]],
    19_000_000_000, ['Französisch','Mooré'], 'CFA-Franc (XOF)'),

  c('GH', 'Ghana', 'Accra', -0.2, 5.6, 'West Africa', '🇬🇭', 33_500_000, 238_533,
    [[-3,11],[-1,11],[0.5,11],[1.2,6.1],[0,5.5],[-1,5],[-3,5],[-3,7.5]],
    76_000_000_000, ['Englisch','Akan','Twi'], 'Ghana Cedi (GHS)'),

  c('TG', 'Togo', 'Lomé', 1.2, 6.1, 'West Africa', '🇹🇬', 8_800_000, 56_785,
    [[0.2,11],[1.7,11],[1.7,6.1],[0.2,6.1]],
    8_100_000_000, ['Französisch','Ewe'], 'CFA-Franc (XOF)'),

  c('BJ', 'Benin', 'Porto-Novo', 2.6, 6.5, 'West Africa', '🇧🇯', 13_700_000, 112_622,
    [[1.7,12],[2.8,12],[3.5,11.5],[3.8,9.5],[2.7,6.5],[1.7,6.1],[1.7,11]],
    17_000_000_000, ['Französisch','Fon'], 'CFA-Franc (XOF)'),

  c('NE', 'Niger', 'Niamey', 2.1, 13.5, 'West Africa', '🇳🇪', 26_200_000, 1_267_000,
    [[0,15],[1,21],[2,20],[3,23.5],[5.5,24],[12,24],[15,23],[16,23.5],[15.5,16],[14.5,13],[13,13.5],[9,13.5],[4,14.5],[2.5,14]],
    14_000_000_000, ['Französisch','Hausa'], 'CFA-Franc (XOF)'),

  c('NG', 'Nigeria', 'Abuja', 7.5, 9.1, 'West Africa', '🇳🇬', 223_000_000, 923_768,
    [[3,13.5],[6,13.5],[9,13.5],[13,13.5],[14.5,13],[14,11],[13.5,9],[12,7],[10,6.5],[8,6],[5,4.5],[3,4.5],[2.7,6.5],[3.5,11.5],[2.8,12],[3,13.5]],
    477_000_000_000, ['Englisch','Hausa','Yoruba','Igbo'], 'Naira (NGN)'),

  c('CV', 'Cabo Verde', 'Praia', -23.5, 15.0, 'West Africa', '🇨🇻', 600_000, 4_033,
    [[-24,15.5],[-23.5,16],[-23,15.5],[-23.5,15]],
    2_200_000_000, ['Portugiesisch','Crioulo'], 'Kap-Verde-Escudo (CVE)'),

  // ═══ CENTRAL AFRICA ═══
  c('CM', 'Cameroon', 'Yaoundé', 11.5, 3.9, 'Central Africa', '🇨🇲', 28_600_000, 475_442,
    [[9,12.5],[10,13],[13,13],[15,12],[16,8.5],[16,6],[14,4],[12,2.5],[10,2],[9.5,2.5],[9,4],[8.5,4.5],[9.5,6.5],[10,8]],
    45_000_000_000, ['Französisch','Englisch'], 'CFA-Franc (XAF)'),

  c('TD', 'Chad', 'N\'Djamena', 15.0, 12.1, 'Central Africa', '🇹🇩', 18_300_000, 1_284_000,
    [[14,23],[16,23.5],[22,20.5],[24,20],[24,15],[23,13],[20,13],[16,13],[15,12],[13,13.5],[14,15],[14,23]],
    12_000_000_000, ['Französisch','Arabisch'], 'CFA-Franc (XAF)'),

  c('CF', 'Central African Republic', 'Bangui', 18.6, 4.4, 'Central Africa', '🇨🇫', 5_500_000, 622_984,
    [[15,10.5],[16,11],[18,10],[21,10],[24,10],[27,9],[27,5],[25,5],[22,4],[19,4],[16,4],[15,7],[14.5,8.5]],
    2_500_000_000, ['Französisch','Sango'], 'CFA-Franc (XAF)'),

  c('GQ', 'Equatorial Guinea', 'Malabo', 8.8, 3.8, 'Central Africa', '🇬🇶', 1_700_000, 28_051,
    [[9,2.5],[10,2.5],[11,2],[11,1],[9.5,1]],
    12_000_000_000, ['Spanisch','Französisch'], 'CFA-Franc (XAF)'),

  c('GA', 'Gabon', 'Libreville', 9.5, 0.4, 'Central Africa', '🇬🇦', 2_400_000, 267_668,
    [[9,2.5],[9.5,1],[11,1],[12,0],[14,-1],[14,-4],[12,-4],[11,-3.5],[9.5,-4],[9,-2],[9,0.5]],
    19_000_000_000, ['Französisch'], 'CFA-Franc (XAF)'),

  c('CG', 'Republic of the Congo', 'Brazzaville', 15.3, -4.3, 'Central Africa', '🇨🇬', 6_000_000, 342_000,
    [[11,-3.5],[12,-3],[14,-1],[16,-1],[18,-1],[18,-3],[18,-5],[16,-5.5],[14,-5],[12,-5.8],[11,-5]],
    13_000_000_000, ['Französisch','Lingala','Kituba'], 'CFA-Franc (XAF)'),

  c('CD', 'DR Congo', 'Kinshasa', 15.3, -4.3, 'Central Africa', '🇨🇩', 102_000_000, 2_344_858,
    [[18,-5],[19,-3],[21,-1],[23,0],[25,1],[27,2],[29.5,2],[30.5,0],[30.5,-1],[29.5,-2.5],[30,-4],[31,-8],[29,-8.5],[29,-11],[28.5,-13],[27,-13],[25,-10.5],[24,-8],[21,-5]],
    66_000_000_000, ['Französisch','Lingala','Kiswahili','Tshiluba','Kikongo'], 'Kongolesischer Franc (CDF)'),

  c('ST', 'São Tomé and Príncipe', 'São Tomé', 6.6, 0.3, 'Central Africa', '🇸🇹', 230_000, 964,
    [[6.3,0.5],[7,0.5],[7,-0.1],[6.3,-0.1]],
    500_000_000, ['Portugiesisch'], 'Dobra (STN)'),

  // ═══ EAST AFRICA ═══
  c('SD', 'Sudan', 'Khartum', 32.5, 15.6, 'East Africa', '🇸🇩', 48_000_000, 1_861_484,
    [[22,22],[31,22],[37,22],[37,18],[36.5,15.5],[38,14.5],[36,14.5],[35,12],[33,14.5],[33,10],[32,12],[30,12],[27,12],[24,12],[22.5,13],[22,15],[22,22]],
    26_000_000_000, ['Arabisch','Englisch'], 'Sudanesisches Pfund (SDG)'),

  c('SS', 'South Sudan', 'Juba', 31.6, 4.9, 'East Africa', '🇸🇸', 11_400_000, 619_745,
    [[24,12],[27,12],[30,12],[32,12],[33,10],[35,10],[36,8],[34,5],[33,4],[32,3.5],[30,4],[28,7],[25,8],[24,10]],
    4_000_000_000, ['Englisch','Arabisch'], 'Südsudanesisches Pfund (SSP)'),

  c('ER', 'Eritrea', 'Asmara', 38.9, 15.3, 'East Africa', '🇪🇷', 3_700_000, 117_600,
    [[36.5,15.5],[38,16],[39.5,15],[41,14.5],[42.5,13],[43,12.5],[41.5,12],[40.5,13],[39,14.5],[38,14.5],[36.5,15.5]],
    2_600_000_000, ['Tigrinya','Arabisch'], 'Nakfa (ERN)'),

  c('DJ', 'Djibouti', 'Dschibuti', 43.1, 11.6, 'East Africa', '🇩🇯', 1_100_000, 23_200,
    [[41.5,12],[43,12.5],[43.3,11.5],[43,11],[42,11],[41.5,11.5]],
    3_500_000_000, ['Französisch','Arabisch'], 'Dschibuti-Franc (DJF)'),

  c('ET', 'Ethiopia', 'Addis Abeba', 38.7, 9.0, 'East Africa', '🇪🇹', 126_000_000, 1_104_300,
    [[33,14.5],[36,14.5],[38,14.5],[40.5,13],[42,11],[43,9],[47,8],[48,5],[47,4.5],[44,2],[42,3],[41,4],[39,4.5],[36,5],[35,5.5],[34,6],[33,8],[34,10],[35,12]],
    156_000_000_000, ['Amharisch','Oromo','Tigrinya'], 'Birr (ETB)'),

  c('SO', 'Somalia', 'Mogadischu', 45.3, 2.0, 'East Africa', '🇸🇴', 18_000_000, 637_657,
    [[41,12],[43,12],[47,11.5],[51,11],[50,5],[48,1.5],[44,-1.5],[42,0],[41,2],[42,4.5],[43,9]],
    8_000_000_000, ['Somali','Arabisch'], 'Somalia-Schilling (SOS)'),

  c('KE', 'Kenya', 'Nairobi', 36.8, -1.3, 'East Africa', '🇰🇪', 55_000_000, 580_367,
    [[34,4.5],[36,5],[39,4.5],[41,4],[42,0],[41,-1.5],[40,-3],[39,-4.5],[37,-3],[35,-1],[34,0.5]],
    113_000_000_000, ['Englisch','Kiswahili'], 'Kenia-Schilling (KES)'),

  c('UG', 'Uganda', 'Kampala', 32.6, 0.3, 'East Africa', '🇺🇬', 48_000_000, 241_038,
    [[30,4],[32,4],[34,4],[35,1],[35,-1],[31,-1],[30,-1.5],[29.5,-1],[30,0.5],[30,2]],
    46_000_000_000, ['Englisch','Kiswahili'], 'Uganda-Schilling (UGX)'),

  c('RW', 'Rwanda', 'Kigali', 29.9, -1.9, 'East Africa', '🇷🇼', 14_000_000, 26_338,
    [[29,-1],[30,-1],[30.5,-1.5],[30.5,-2.8],[29,-2.8]],
    13_000_000_000, ['Kinyarwanda','Französisch','Englisch'], 'Ruanda-Franc (RWF)'),

  c('BI', 'Burundi', 'Gitega', 29.9, -3.4, 'East Africa', '🇧🇮', 13_200_000, 27_834,
    [[29,-2.8],[30.5,-2.8],[30.8,-3.5],[30.5,-4.5],[29,-4.5]],
    3_000_000_000, ['Kirundi','Französisch'], 'Burundi-Franc (BIF)'),

  c('TZ', 'Tanzania', 'Dodoma', 35.7, -6.2, 'East Africa', '🇹🇿', 65_000_000, 945_087,
    [[30,-1],[31,-1],[34,-1],[37,-1],[39,-4.5],[40,-7],[40,-10],[37,-11],[34,-11],[31,-10],[30,-8],[29,-4.5],[29.5,-2.8],[30,-1]],
    79_000_000_000, ['Kiswahili','Englisch'], 'Tansania-Schilling (TZS)'),

  // ═══ SOUTHERN AFRICA ═══
  c('AO', 'Angola', 'Luanda', 13.2, -8.8, 'Southern Africa', '🇦🇴', 36_000_000, 1_246_700,
    [[12,-5.8],[13,-5.5],[16,-5.8],[18,-8],[20,-8],[22,-10],[24,-12.5],[24,-17.5],[21,-18],[18,-18],[14,-17.5],[12,-17],[11.5,-16.5],[12,-13]],
    74_000_000_000, ['Portugiesisch'], 'Kwanza (AOA)'),

  c('ZM', 'Zambia', 'Lusaka', 28.3, -15.4, 'Southern Africa', '🇿🇲', 20_500_000, 752_618,
    [[22,-8],[25,-8],[28,-8],[29,-8.5],[30,-8],[33,-9.5],[33,-15],[30,-15],[28.5,-16],[25.5,-18],[25,-18],[22,-16],[22,-13],[24,-10.5]],
    29_000_000_000, ['Englisch'], 'Sambia-Kwacha (ZMW)'),

  c('ZW', 'Zimbabwe', 'Harare', 31.0, -17.8, 'Southern Africa', '🇿🇼', 16_600_000, 390_757,
    [[26,-15.5],[28,-15.5],[30,-15.5],[33,-16],[33,-20],[32,-22.5],[30,-22.5],[28,-22],[26,-22],[25.5,-20],[26,-18]],
    25_000_000_000, ['Englisch','Shona','Ndebele'], 'RTGS-Dollar (ZWL)'),

  c('MW', 'Malawi', 'Lilongwe', 33.8, -13.9, 'Southern Africa', '🇲🇼', 20_400_000, 118_484,
    [[33,-9.5],[34,-10],[35,-11],[35.5,-14],[35,-15.5],[35,-17],[34,-17],[33,-15],[32.5,-13],[33,-11]],
    13_000_000_000, ['Englisch','Chichewa'], 'Malawi-Kwacha (MWK)'),

  c('MZ', 'Mozambique', 'Maputo', 32.6, -25.9, 'Southern Africa', '🇲🇿', 33_000_000, 799_380,
    [[35,-11],[40,-11],[40.5,-15],[40,-17],[37,-20],[35,-23],[34,-25],[33,-26.5],[32,-26.5],[31,-25],[30,-22],[32,-16],[34,-14],[35,-11]],
    19_000_000_000, ['Portugiesisch'], 'Metical (MZN)'),

  c('NA', 'Namibia', 'Windhoek', 17.1, -22.6, 'Southern Africa', '🇳🇦', 2_600_000, 824_292,
    [[12,-17],[14,-17.5],[18,-18],[20,-18],[21,-18],[25,-18],[24,-20],[20,-22],[20,-28.5],[18,-29],[15,-28.5],[12,-25],[12,-22]],
    13_000_000_000, ['Englisch','Afrikaans','Deutsch'], 'Namibia-Dollar (NAD)'),

  c('BW', 'Botswana', 'Gaborone', 25.9, -24.7, 'Southern Africa', '🇧🇼', 2_400_000, 581_730,
    [[20,-18],[25,-18],[25.5,-20],[26,-22],[28,-22],[27.5,-24],[25,-25.5],[22,-26.5],[20,-26.5],[20,-22]],
    19_000_000_000, ['Englisch','Setswana'], 'Pula (BWP)'),

  c('ZA', 'South Africa', 'Pretoria', 28.2, -25.7, 'Southern Africa', '🇿🇦', 60_000_000, 1_221_037,
    [[17,-29],[20,-28.5],[22,-26.5],[25,-25.5],[27.5,-24],[28,-22],[30,-22.5],[32,-22.5],[32.5,-27],[33,-28],[32,-29],[30,-30.5],[28,-33],[26,-34],[22,-34.5],[19,-34],[17.5,-32]],
    399_000_000_000, ['Afrikaans','Englisch','Zulu','Xhosa','+ 7 weitere'], 'Rand (ZAR)',
    [{ label: 'HDI', value: '0.713' }, { label: 'Provinzen', value: '9' }]),

  c('LS', 'Lesotho', 'Maseru', 27.5, -29.3, 'Southern Africa', '🇱🇸', 2_300_000, 30_355,
    [[28,-29],[29.5,-29],[29.5,-30.5],[28,-30.5],[27.5,-30]],
    2_500_000_000, ['Sesotho','Englisch'], 'Loti (LSL)'),

  c('SZ', 'Eswatini', 'Mbabane', 31.1, -26.3, 'Southern Africa', '🇸🇿', 1_200_000, 17_364,
    [[31,-25.5],[32,-25.5],[32,-27.5],[31,-27.5]],
    4_700_000_000, ['Siswati','Englisch'], 'Lilangeni (SZL)'),

  c('MG', 'Madagascar', 'Antananarivo', 47.5, -18.9, 'Southern Africa', '🇲🇬', 30_000_000, 587_041,
    [[49,-12],[50,-15],[49,-19],[47,-21],[45,-24],[44,-25.5],[44,-22],[45,-18],[46.5,-15.5],[48,-13]],
    16_000_000_000, ['Malagasy','Französisch'], 'Ariary (MGA)'),

  c('KM', 'Comoros', 'Moroni', 43.3, -11.7, 'Southern Africa', '🇰🇲', 900_000, 2_235,
    [[43,-11],[44,-11.5],[43.5,-13],[43,-12]],
    1_300_000_000, ['Komorisch','Arabisch','Französisch'], 'Komoren-Franc (KMF)'),

  c('MU', 'Mauritius', 'Port Louis', 57.5, -20.2, 'Southern Africa', '🇲🇺', 1_300_000, 2_040,
    [[57,-19.8],[58,-20],[57.5,-20.8],[57,-20.5]],
    14_000_000_000, ['Englisch','Französisch','Kreolisch'], 'Mauritius-Rupie (MUR)'),

  c('SC', 'Seychelles', 'Victoria', 55.5, -4.6, 'Southern Africa', '🇸🇨', 100_000, 459,
    [[55,-4],[56,-4.5],[55.5,-5],[55,-4.5]],
    1_900_000_000, ['Seychellenkreol','Englisch','Französisch'], 'Seychellen-Rupie (SCR)'),
];

export { countries };
export const countriesById: Record<string, CountryData> = Object.fromEntries(countries.map(c => [c.id, c]));
export const countriesByRegion = countries.reduce((acc, c) => {
  (acc[c.region] ??= []).push(c);
  return acc;
}, {} as Record<Region, CountryData[]>);
