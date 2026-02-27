// Administrative divisions (Level 1) for African countries
// Each region: name, approximate center [lon, lat], and simplified boundary coords [lon, lat][]

export interface AdminRegion {
  id: string;
  name: string;
  center: [number, number]; // [lon, lat]
  coords: [number, number][]; // simplified boundary polygon [lon, lat][]
}

export interface CountryRegions {
  countryId: string;
  regions: AdminRegion[];
}

// ── Nigeria (36 States + FCT, grouped into 6 geopolitical zones) ──
const nigeria: CountryRegions = {
  countryId: 'NG',
  regions: [
    { id: 'ng-nw', name: 'Nord-West', center: [6, 11.5], coords: [[3,13.5],[3,10],[7,10],[7,13.5]] },
    { id: 'ng-ne', name: 'Nord-Ost', center: [12, 11], coords: [[7,13.5],[7,10],[14,10],[14,13.5]] },
    { id: 'ng-nc', name: 'Nord-Zentral', center: [7.5, 9], coords: [[3,10],[3,7.5],[7,7.5],[10,7.5],[10,10],[7,10]] },
    { id: 'ng-sw', name: 'Süd-West', center: [3.5, 7], coords: [[2.5,7.5],[2.5,6],[5,6],[5,7.5]] },
    { id: 'ng-se', name: 'Süd-Ost', center: [7.5, 6], coords: [[7,7.5],[7,5.5],[8.5,5.5],[8.5,7.5]] },
    { id: 'ng-ss', name: 'Süd-Süd', center: [6, 5.5], coords: [[5,7.5],[5,4.5],[8,4.5],[8,7.5]] },
  ],
};

// ── Ethiopia (11 regional states) ──
const ethiopia: CountryRegions = {
  countryId: 'ET',
  regions: [
    { id: 'et-tg', name: 'Tigray', center: [39, 13.5], coords: [[36.5,14.5],[36.5,12.5],[40,12.5],[40,14.5]] },
    { id: 'et-am', name: 'Amhara', center: [38, 11.5], coords: [[36,12.5],[36,10],[40,10],[40,12.5]] },
    { id: 'et-or', name: 'Oromia', center: [39, 8], coords: [[35,10],[35,6],[42,6],[42,10]] },
    { id: 'et-sm', name: 'Somali', center: [43, 7], coords: [[42,10],[42,4],[48,4],[48,10]] },
    { id: 'et-af', name: 'Afar', center: [41, 12], coords: [[40,14.5],[40,10],[42,10],[42,14.5]] },
    { id: 'et-sn', name: 'SNNPR', center: [37, 7], coords: [[35,8],[35,5],[38,5],[38,8]] },
    { id: 'et-aa', name: 'Addis Ababa', center: [38.7, 9], coords: [[38.5,9.2],[38.5,8.8],[39,8.8],[39,9.2]] },
  ],
};

// ── DR Congo (26 provinces) ──
const drc: CountryRegions = {
  countryId: 'CD',
  regions: [
    { id: 'cd-ks', name: 'Kinshasa', center: [15.3, -4.3], coords: [[15,-4],[15,-4.6],[15.6,-4.6],[15.6,-4]] },
    { id: 'cd-kt', name: 'Katanga', center: [27, -10], coords: [[25,-6],[25,-13],[30,-13],[30,-6]] },
    { id: 'cd-eq', name: 'Équateur', center: [20, 1], coords: [[17,3],[17,-1],[24,-1],[24,3]] },
    { id: 'cd-or', name: 'Orientale', center: [26, 3], coords: [[24,5],[24,0],[30,0],[30,5]] },
    { id: 'cd-nk', name: 'Nord-Kivu', center: [29, -1], coords: [[28,0],[28,-2.5],[30,-2.5],[30,0]] },
    { id: 'cd-sk', name: 'Süd-Kivu', center: [28.5, -3.5], coords: [[27,-2.5],[27,-5],[29.5,-5],[29.5,-2.5]] },
    { id: 'cd-kw', name: 'Kasai', center: [21, -5], coords: [[19,-3],[19,-7],[23,-7],[23,-3]] },
    { id: 'cd-bc', name: 'Bas-Congo', center: [14, -5.5], coords: [[12,-4.5],[12,-6.5],[15,-6.5],[15,-4.5]] },
  ],
};

// ── Sudan (18 states) ──
const sudan: CountryRegions = {
  countryId: 'SD',
  regions: [
    { id: 'sd-kh', name: 'Khartum', center: [32.5, 15.5], coords: [[32,16],[32,15],[33,15],[33,16]] },
    { id: 'sd-df', name: 'Darfur', center: [24, 13], coords: [[22,16],[22,10],[27,10],[27,16]] },
    { id: 'sd-kr', name: 'Kordofan', center: [30, 12], coords: [[27,14],[27,10],[32,10],[32,14]] },
    { id: 'sd-no', name: 'Nördlich', center: [32, 19], coords: [[30,22],[30,16],[34,16],[34,22]] },
    { id: 'sd-os', name: 'Ostsudan', center: [35, 17], coords: [[33,20],[33,14],[38,14],[38,20]] },
    { id: 'sd-gd', name: 'Gezira', center: [33, 14], coords: [[32,15],[32,13],[34,13],[34,15]] },
  ],
};

// ── Libya (3 historical regions) ──
const libya: CountryRegions = {
  countryId: 'LY',
  regions: [
    { id: 'ly-tr', name: 'Tripolitanien', center: [13, 32.5], coords: [[9,34],[9,30],[16,30],[16,34]] },
    { id: 'ly-cy', name: 'Kyrenaika', center: [22, 31], coords: [[16,33],[16,29],[25,29],[25,33]] },
    { id: 'ly-fz', name: 'Fezzan', center: [14, 27], coords: [[9,30],[9,23],[20,23],[20,30]] },
  ],
};

// ── South Africa (9 provinces) ──
const southAfrica: CountryRegions = {
  countryId: 'ZA',
  regions: [
    { id: 'za-gt', name: 'Gauteng', center: [28, -26], coords: [[27.5,-25.5],[27.5,-26.5],[29,-26.5],[29,-25.5]] },
    { id: 'za-wc', name: 'Westkap', center: [19.5, -33.5], coords: [[17.5,-32],[17.5,-35],[21,-35],[21,-32]] },
    { id: 'za-kz', name: 'KwaZulu-Natal', center: [30, -29], coords: [[28.5,-27],[28.5,-31],[33,-31],[33,-27]] },
    { id: 'za-ec', name: 'Ostkap', center: [27, -32], coords: [[25,-31],[25,-34],[30,-34],[30,-31]] },
    { id: 'za-lp', name: 'Limpopo', center: [29.5, -23.5], coords: [[27,-22.5],[27,-24.5],[31.5,-24.5],[31.5,-22.5]] },
    { id: 'za-mp', name: 'Mpumalanga', center: [30, -25.5], coords: [[28.5,-24.5],[28.5,-26.5],[32,-26.5],[32,-24.5]] },
    { id: 'za-nw', name: 'Nordwest', center: [26, -26], coords: [[24,-25],[24,-27.5],[28,-27.5],[28,-25]] },
    { id: 'za-fs', name: 'Freistaat', center: [27, -29], coords: [[24.5,-27.5],[24.5,-30.5],[29.5,-30.5],[29.5,-27.5]] },
    { id: 'za-nc', name: 'Nordkap', center: [21, -29], coords: [[17,-28],[17,-32],[25,-32],[25,-28]] },
  ],
};

// ── Kenya (47 counties → 8 former provinces) ──
const kenya: CountryRegions = {
  countryId: 'KE',
  regions: [
    { id: 'ke-na', name: 'Nairobi', center: [36.8, -1.3], coords: [[36.6,-1.1],[36.6,-1.5],[37,-1.5],[37,-1.1]] },
    { id: 'ke-co', name: 'Küste', center: [39.5, -3.5], coords: [[38,-1.5],[38,-5],[41,-5],[41,-1.5]] },
    { id: 'ke-ne', name: 'Nord-Ost', center: [40, 1.5], coords: [[38,4],[38,-1],[42,-1],[42,4]] },
    { id: 'ke-ri', name: 'Rift Valley', center: [36, 1], coords: [[34,4],[34,-2],[37,-2],[37,4]] },
    { id: 'ke-ce', name: 'Zentral', center: [37, -0.5], coords: [[36.5,0.5],[36.5,-1.5],[37.5,-1.5],[37.5,0.5]] },
    { id: 'ke-ws', name: 'Western', center: [34.5, 0.5], coords: [[34,1.5],[34,-0.5],[35,-0.5],[35,1.5]] },
    { id: 'ke-ny', name: 'Nyanza', center: [34.5, -0.5], coords: [[34,0],[34,-1.5],[35.5,-1.5],[35.5,0]] },
  ],
};

// ── Egypt (27 governorates → simplified regions) ──
const egypt: CountryRegions = {
  countryId: 'EG',
  regions: [
    { id: 'eg-ca', name: 'Kairo/Delta', center: [31, 30.5], coords: [[29,31.5],[29,29.5],[33,29.5],[33,31.5]] },
    { id: 'eg-al', name: 'Alexandria', center: [29.9, 31.2], coords: [[29,31.5],[29,31],[30.5,31],[30.5,31.5]] },
    { id: 'eg-ue', name: 'Oberägypten', center: [32, 26], coords: [[30,29.5],[30,22],[34,22],[34,29.5]] },
    { id: 'eg-si', name: 'Sinai', center: [33.5, 29.5], coords: [[32.5,31],[32.5,28],[35,28],[35,31]] },
    { id: 'eg-wd', name: 'Westl. Wüste', center: [27, 27], coords: [[25,31],[25,22],[30,22],[30,31]] },
  ],
};

// ── Morocco ──
const morocco: CountryRegions = {
  countryId: 'MA',
  regions: [
    { id: 'ma-cs', name: 'Casablanca-Settat', center: [-7.5, 33], coords: [[-8.5,34],[-8.5,32],[-6.5,32],[-6.5,34]] },
    { id: 'ma-rb', name: 'Rabat-Salé', center: [-6.8, 34], coords: [[-7.5,34.5],[-7.5,33.5],[-6,33.5],[-6,34.5]] },
    { id: 'ma-ma', name: 'Marrakesch', center: [-8, 31.5], coords: [[-9,32.5],[-9,30.5],[-7,30.5],[-7,32.5]] },
    { id: 'ma-fs', name: 'Fès-Meknès', center: [-5, 34], coords: [[-6,35],[-6,33],[-3.5,33],[-3.5,35]] },
    { id: 'ma-sm', name: 'Souss-Massa', center: [-9, 30], coords: [[-10,31],[-10,29],[-8,29],[-8,31]] },
    { id: 'ma-or', name: 'Oriental', center: [-2, 34.5], coords: [[-3.5,35.5],[-3.5,33],[-1.5,33],[-1.5,35.5]] },
  ],
};

// ── Mali ──
const mali: CountryRegions = {
  countryId: 'ML',
  regions: [
    { id: 'ml-bm', name: 'Bamako', center: [-8, 12.6], coords: [[-8.2,12.8],[-8.2,12.4],[-7.8,12.4],[-7.8,12.8]] },
    { id: 'ml-ki', name: 'Kidal', center: [1, 19], coords: [[-1,21],[-1,17],[4,17],[4,21]] },
    { id: 'ml-tb', name: 'Timbuktu', center: [-3, 18], coords: [[-6,20],[-6,16],[0,16],[0,20]] },
    { id: 'ml-ga', name: 'Gao', center: [0, 16], coords: [[-2,17],[-2,14.5],[3,14.5],[3,17]] },
    { id: 'ml-mp', name: 'Mopti', center: [-3.5, 14.5], coords: [[-5,15.5],[-5,13.5],[-2,13.5],[-2,15.5]] },
    { id: 'ml-sg', name: 'Ségou', center: [-5.5, 13], coords: [[-7,14],[-7,12],[-4,12],[-4,14]] },
  ],
};

// ── Algeria ──
const algeria: CountryRegions = {
  countryId: 'DZ',
  regions: [
    { id: 'dz-al', name: 'Algier', center: [3, 36.5], coords: [[2,37],[2,36],[4,36],[4,37]] },
    { id: 'dz-or', name: 'Oran', center: [-0.5, 35.5], coords: [[-1.5,36.5],[-1.5,35],[0.5,35],[0.5,36.5]] },
    { id: 'dz-cn', name: 'Constantine', center: [6.5, 36], coords: [[5,37],[5,35],[8,35],[8,37]] },
    { id: 'dz-sa', name: 'Sahara-Nord', center: [3, 32], coords: [[-2,34],[-2,30],[8,30],[8,34]] },
    { id: 'dz-ss', name: 'Sahara-Süd', center: [3, 25], coords: [[-5,30],[-5,19],[10,19],[10,30]] },
  ],
};

// ── Mozambique ──
const mozambique: CountryRegions = {
  countryId: 'MZ',
  regions: [
    { id: 'mz-no', name: 'Norden', center: [37, -13], coords: [[34,-10.5],[34,-16],[41,-16],[41,-10.5]] },
    { id: 'mz-ce', name: 'Zentral', center: [35, -19], coords: [[33,-16],[33,-22],[37,-22],[37,-16]] },
    { id: 'mz-su', name: 'Süden', center: [33, -24], coords: [[31,-22],[31,-27],[35,-27],[35,-22]] },
  ],
};

// ── Somalia ──
const somalia: CountryRegions = {
  countryId: 'SO',
  regions: [
    { id: 'so-mg', name: 'Mogadischu', center: [45.3, 2], coords: [[45,2.3],[45,1.7],[45.6,1.7],[45.6,2.3]] },
    { id: 'so-sl', name: 'Somaliland', center: [45, 10], coords: [[43,11.5],[43,8],[49,8],[49,11.5]] },
    { id: 'so-pl', name: 'Puntland', center: [49, 8], coords: [[47,11],[47,5],[51,5],[51,11]] },
    { id: 'so-jl', name: 'Jubaland', center: [42, 1], coords: [[40,3],[40,-2],[44,-2],[44,3]] },
    { id: 'so-sw', name: 'Süd-West', center: [44, 3], coords: [[42,5],[42,1],[46,1],[46,5]] },
  ],
};

// ── Sahel countries ──
const burkinaFaso: CountryRegions = {
  countryId: 'BF',
  regions: [
    { id: 'bf-ou', name: 'Ouagadougou', center: [-1.5, 12.4], coords: [[-1.8,12.6],[-1.8,12.2],[-1.2,12.2],[-1.2,12.6]] },
    { id: 'bf-sa', name: 'Sahel', center: [-0.5, 14], coords: [[-2,15],[-2,13.5],[2,13.5],[2,15]] },
    { id: 'bf-es', name: 'Est', center: [0.5, 12], coords: [[-0.5,13],[  -0.5,11],[2,11],[2,13]] },
    { id: 'bf-no', name: 'Nord', center: [-1.5, 13.5], coords: [[-3,14.5],[-3,13],[-0.5,13],[-0.5,14.5]] },
    { id: 'bf-sw', name: 'Süd-West', center: [-3, 11], coords: [[-5.5,12],[-5.5,9.5],[-1,9.5],[-1,12]] },
  ],
};

const niger: CountryRegions = {
  countryId: 'NE',
  regions: [
    { id: 'ne-ny', name: 'Niamey', center: [2.1, 13.5], coords: [[1.9,13.7],[1.9,13.3],[2.3,13.3],[2.3,13.7]] },
    { id: 'ne-ag', name: 'Agadez', center: [8, 18], coords: [[5,23.5],[5,15],[12,15],[12,23.5]] },
    { id: 'ne-df', name: 'Diffa', center: [12.5, 13.5], coords: [[11,14.5],[11,13],[15,13],[15,14.5]] },
    { id: 'ne-tl', name: 'Tillabéri', center: [2, 14.5], coords: [[0,15.5],[0,13],[4,13],[4,15.5]] },
    { id: 'ne-zd', name: 'Zinder', center: [9, 14], coords: [[7,15],[7,13],[12,13],[12,15]] },
    { id: 'ne-ma', name: 'Maradi', center: [7, 13.5], coords: [[5.5,14.5],[5.5,13],[8,13],[8,14.5]] },
  ],
};

const chad: CountryRegions = {
  countryId: 'TD',
  regions: [
    { id: 'td-nd', name: "N'Djamena", center: [15.1, 12.1], coords: [[14.9,12.3],[14.9,11.9],[15.3,11.9],[15.3,12.3]] },
    { id: 'td-bt', name: 'Borkou-Tibesti', center: [18, 20], coords: [[14,23],[14,17],[24,17],[24,23]] },
    { id: 'td-ol', name: 'Ouaddaï-Lac', center: [20, 13], coords: [[17,15],[17,11],[22,11],[22,15]] },
    { id: 'td-ka', name: 'Kanem', center: [15, 14.5], coords: [[13,16],[13,13],[17,13],[17,16]] },
    { id: 'td-su', name: 'Süd-Tschad', center: [17, 9], coords: [[14,11],[14,7.5],[19,7.5],[19,11]] },
  ],
};

// ── Cameroon ──
const cameroon: CountryRegions = {
  countryId: 'CM',
  regions: [
    { id: 'cm-lt', name: 'Littoral', center: [9.7, 4.5], coords: [[9.3,5],[9.3,4],[10.3,4],[10.3,5]] },
    { id: 'cm-en', name: 'Extr.-Nord', center: [14, 11], coords: [[13,13],[13,10],[15.5,10],[15.5,13]] },
    { id: 'cm-no', name: 'Nord', center: [13.5, 9], coords: [[12,10],[12,7.5],[15,7.5],[15,10]] },
    { id: 'cm-ce', name: 'Centre', center: [11.5, 4.5], coords: [[10.5,6],[10.5,3],[13,3],[13,6]] },
    { id: 'cm-nw', name: 'Nord-West', center: [10, 6.5], coords: [[9.5,7],[9.5,6],[10.5,6],[10.5,7]] },
    { id: 'cm-sw', name: 'Süd-West', center: [9.2, 5.5], coords: [[8.5,6],[8.5,4.5],[9.5,4.5],[9.5,6]] },
  ],
};

// ── Tanzania ──
const tanzania: CountryRegions = {
  countryId: 'TZ',
  regions: [
    { id: 'tz-ds', name: 'Dar es Salaam', center: [39.3, -6.8], coords: [[39,-6.5],[39,-7.1],[39.5,-7.1],[39.5,-6.5]] },
    { id: 'tz-no', name: 'Norden', center: [36, -3], coords: [[34,-1],[34,-5],[38,-5],[38,-1]] },
    { id: 'tz-ze', name: 'Zentral', center: [35, -6], coords: [[32,-5],[32,-8],[37,-8],[37,-5]] },
    { id: 'tz-su', name: 'Süden', center: [35, -10], coords: [[32,-8],[32,-11.5],[38,-11.5],[38,-8]] },
    { id: 'tz-ku', name: 'Küste/Ost', center: [39, -8], coords: [[37,-5],[37,-10],[40,-10],[40,-5]] },
    { id: 'tz-zb', name: 'Sansibar', center: [39.3, -6.2], coords: [[39,-5.8],[39,-6.5],[39.6,-6.5],[39.6,-5.8]] },
  ],
};

// ── Uganda ──
const uganda: CountryRegions = {
  countryId: 'UG',
  regions: [
    { id: 'ug-ce', name: 'Zentral', center: [32.5, 0.5], coords: [[32,-0.5],[32,1.5],[33,1.5],[33,-0.5]] },
    { id: 'ug-no', name: 'Norden', center: [33, 3], coords: [[30,4],[30,2],[35,2],[35,4]] },
    { id: 'ug-os', name: 'Osten', center: [34, 1.5], coords: [[33,3],[33,0],[35,0],[35,3]] },
    { id: 'ug-ws', name: 'Westen', center: [30.5, 0.5], coords: [[29.5,2],[29.5,-1],[32,-1],[32,2]] },
  ],
};

// ── Rwanda ──
const rwanda: CountryRegions = {
  countryId: 'RW',
  regions: [
    { id: 'rw-ki', name: 'Kigali', center: [29.9, -1.95], coords: [[29.7,-1.8],[29.7,-2.1],[30.1,-2.1],[30.1,-1.8]] },
    { id: 'rw-no', name: 'Norden', center: [29.6, -1.6], coords: [[29.2,-1.3],[29.2,-1.8],[30,-1.8],[30,-1.3]] },
    { id: 'rw-su', name: 'Süden', center: [29.6, -2.5], coords: [[29,-2.2],[29,-2.8],[30.2,-2.8],[30.2,-2.2]] },
    { id: 'rw-os', name: 'Osten', center: [30.4, -2], coords: [[30,-1.5],[30,-2.5],[30.8,-2.5],[30.8,-1.5]] },
    { id: 'rw-ws', name: 'Westen', center: [29.1, -2], coords: [[28.8,-1.5],[28.8,-2.5],[29.5,-2.5],[29.5,-1.5]] },
  ],
};

// ── Tunisia ──
const tunisia: CountryRegions = {
  countryId: 'TN',
  regions: [
    { id: 'tn-tu', name: 'Tunis', center: [10.2, 36.8], coords: [[9.8,37],[9.8,36.6],[10.5,36.6],[10.5,37]] },
    { id: 'tn-no', name: 'Norden', center: [9, 36.5], coords: [[8,37.2],[8,36],[10,36],[10,37.2]] },
    { id: 'tn-sa', name: 'Sahel', center: [10.5, 35.5], coords: [[9.5,36],[9.5,35],[11.5,35],[11.5,36]] },
    { id: 'tn-su', name: 'Süden', center: [8.5, 34], coords: [[7.5,35],[7.5,33],[10,33],[10,35]] },
  ],
};

// ── Mauritania ──
const mauritania: CountryRegions = {
  countryId: 'MR',
  regions: [
    { id: 'mr-nk', name: 'Nouakchott', center: [-15.9, 18.1], coords: [[-16.1,18.3],[-16.1,17.9],[-15.7,17.9],[-15.7,18.3]] },
    { id: 'mr-no', name: 'Norden', center: [-12, 21], coords: [[-17,25],[-17,18],[-5,18],[-5,25]] },
    { id: 'mr-su', name: 'Süden', center: [-12, 16], coords: [[-17,18],[-17,14.5],[-5,14.5],[-5,18]] },
  ],
};

// ── Senegal ──
const senegal: CountryRegions = {
  countryId: 'SN',
  regions: [
    { id: 'sn-dk', name: 'Dakar', center: [-17.4, 14.7], coords: [[-17.5,14.9],[-17.5,14.5],[-17.2,14.5],[-17.2,14.9]] },
    { id: 'sn-ca', name: 'Casamance', center: [-15, 12.8], coords: [[-16.5,13.5],[-16.5,12.3],[-13.5,12.3],[-13.5,13.5]] },
    { id: 'sn-no', name: 'Norden', center: [-15, 15.5], coords: [[-17,16.5],[-17,14.5],[-13,14.5],[-13,16.5]] },
    { id: 'sn-ce', name: 'Zentral', center: [-14.5, 14], coords: [[-16,14.5],[-16,13.5],[-13,13.5],[-13,14.5]] },
  ],
};

// ── Gambia ──
const gambia: CountryRegions = {
  countryId: 'GM',
  regions: [
    { id: 'gm-ws', name: 'West', center: [-16.4, 13.4], coords: [[-16.8,13.6],[-16.8,13.2],[-15.8,13.2],[-15.8,13.6]] },
    { id: 'gm-os', name: 'Ost', center: [-14.8, 13.5], coords: [[-15.8,13.7],[-15.8,13.3],[-13.8,13.3],[-13.8,13.7]] },
  ],
};

// ── Guinea-Bissau ──
const guineaBissau: CountryRegions = {
  countryId: 'GW',
  regions: [
    { id: 'gw-no', name: 'Norte', center: [-15, 12.3], coords: [[-16,12.7],[-16,11.8],[-14,11.8],[-14,12.7]] },
    { id: 'gw-su', name: 'Sul', center: [-15, 11.5], coords: [[-16,11.8],[-16,11],[-14,11],[-14,11.8]] },
  ],
};

// ── Guinea ──
const guinea: CountryRegions = {
  countryId: 'GN',
  regions: [
    { id: 'gn-ck', name: 'Conakry', center: [-13.7, 9.5], coords: [[-13.9,9.7],[-13.9,9.3],[-13.5,9.3],[-13.5,9.7]] },
    { id: 'gn-hg', name: 'Haute-Guinée', center: [-10, 11], coords: [[-12,12],[-12,10],[-8,10],[-8,12]] },
    { id: 'gn-mg', name: 'Moyenne-Guinée', center: [-12, 11.5], coords: [[-14,12.5],[-14,10.5],[-10,10.5],[-10,12.5]] },
    { id: 'gn-gf', name: 'Guinée forestière', center: [-9, 8], coords: [[-10.5,9],[-10.5,7],[-7.5,7],[-7.5,9]] },
  ],
};

// ── Sierra Leone ──
const sierraLeone: CountryRegions = {
  countryId: 'SL',
  regions: [
    { id: 'sl-ws', name: 'Western', center: [-13.2, 8.5], coords: [[-13.5,8.8],[-13.5,8.2],[-12.8,8.2],[-12.8,8.8]] },
    { id: 'sl-no', name: 'Norden', center: [-12, 9], coords: [[-13,10],[-13,8.5],[-10.5,8.5],[-10.5,10]] },
    { id: 'sl-su', name: 'Süden', center: [-11.5, 7.5], coords: [[-13,8.5],[-13,7],[-10.5,7],[-10.5,8.5]] },
    { id: 'sl-os', name: 'Osten', center: [-11, 8], coords: [[-11.5,9],[-11.5,7],[-10,7],[-10,9]] },
  ],
};

// ── Liberia ──
const liberia: CountryRegions = {
  countryId: 'LR',
  regions: [
    { id: 'lr-mo', name: 'Montserrado', center: [-10.8, 6.3], coords: [[-11,6.6],[-11,6],[-10.5,6],[-10.5,6.6]] },
    { id: 'lr-no', name: 'Norden', center: [-9.5, 7.5], coords: [[-11,8.5],[-11,7],[-8,7],[-8,8.5]] },
    { id: 'lr-su', name: 'Süd-Ost', center: [-8.5, 5.5], coords: [[-10,7],[-10,4.5],[-7.5,4.5],[-7.5,7]] },
  ],
};

// ── Côte d'Ivoire ──
const coteIvoire: CountryRegions = {
  countryId: 'CI',
  regions: [
    { id: 'ci-ab', name: 'Abidjan', center: [-4, 5.3], coords: [[-4.3,5.6],[-4.3,5],[-3.7,5],[-3.7,5.6]] },
    { id: 'ci-no', name: 'Norden', center: [-5.5, 9.5], coords: [[-8,10.5],[-8,8],[-3,8],[-3,10.5]] },
    { id: 'ci-ce', name: 'Zentral', center: [-5.5, 7], coords: [[-8,8],[-8,6],[-3,6],[-3,8]] },
    { id: 'ci-su', name: 'Süden', center: [-5.5, 5.5], coords: [[-8,6],[-8,5],[-3,5],[-3,6]] },
  ],
};

// ── Ghana ──
const ghana: CountryRegions = {
  countryId: 'GH',
  regions: [
    { id: 'gh-ac', name: 'Greater Accra', center: [-0.2, 5.6], coords: [[-0.5,5.8],[-0.5,5.4],[0.2,5.4],[0.2,5.8]] },
    { id: 'gh-as', name: 'Ashanti', center: [-1.6, 6.7], coords: [[-2.5,7.5],[-2.5,6],[-0.5,6],[-0.5,7.5]] },
    { id: 'gh-no', name: 'Norden', center: [-1, 9.5], coords: [[-2.5,11],[-2.5,8.5],[0.5,8.5],[0.5,11]] },
    { id: 'gh-vo', name: 'Volta', center: [0.5, 7], coords: [[0,8],[0,5.5],[1.2,5.5],[1.2,8]] },
  ],
};

// ── Togo ──
const togo: CountryRegions = {
  countryId: 'TG',
  regions: [
    { id: 'tg-ma', name: 'Maritime', center: [1.2, 6.3], coords: [[0.6,6.6],[0.6,6],[1.8,6],[1.8,6.6]] },
    { id: 'tg-ce', name: 'Centrale', center: [1, 8.5], coords: [[0,9.5],[0,7.5],[1.8,7.5],[1.8,9.5]] },
    { id: 'tg-sa', name: 'Savanes', center: [0.5, 10.5], coords: [[-0.2,11.2],[-0.2,10],[1.8,10],[1.8,11.2]] },
  ],
};

// ── Benin ──
const benin: CountryRegions = {
  countryId: 'BJ',
  regions: [
    { id: 'bj-li', name: 'Littoral', center: [2.4, 6.4], coords: [[2.2,6.6],[2.2,6.2],[2.6,6.2],[2.6,6.6]] },
    { id: 'bj-no', name: 'Norden', center: [2.5, 10.5], coords: [[1,12],[1,9],[3.5,9],[3.5,12]] },
    { id: 'bj-su', name: 'Süden', center: [2.3, 7.5], coords: [[1,9],[1,6],[3.5,6],[3.5,9]] },
  ],
};

// ── Western Sahara ──
const westernSahara: CountryRegions = {
  countryId: 'EH',
  regions: [
    { id: 'eh-no', name: 'Norden (MA-kontrolliert)', center: [-14, 25], coords: [[-17,27],[-17,23],[-11,23],[-11,27]] },
    { id: 'eh-su', name: 'Süden (Polisario)', center: [-12, 22], coords: [[-17,23],[-17,21],[-8,21],[-8,23]] },
  ],
};

// ── South Sudan ──
const southSudan: CountryRegions = {
  countryId: 'SS',
  regions: [
    { id: 'ss-ju', name: 'Juba (Central Equatoria)', center: [31.6, 4.9], coords: [[30,5.5],[30,3.5],[33,3.5],[33,5.5]] },
    { id: 'ss-ue', name: 'Upper Nile', center: [32, 9], coords: [[30,10.5],[30,7],[34,7],[34,10.5]] },
    { id: 'ss-bh', name: 'Bahr el Ghazal', center: [28, 8], coords: [[24,10],[24,6],[30,6],[30,10]] },
    { id: 'ss-eq', name: 'Equatoria', center: [30, 4.5], coords: [[27,6],[27,3.5],[33,3.5],[33,6]] },
  ],
};

// ── Eritrea ──
const eritrea: CountryRegions = {
  countryId: 'ER',
  regions: [
    { id: 'er-as', name: 'Asmara (Maekel)', center: [38.9, 15.3], coords: [[38.5,15.6],[38.5,15],[39.3,15],[39.3,15.6]] },
    { id: 'er-ws', name: 'Westen', center: [37, 15.5], coords: [[36,16.5],[36,14.5],[38,14.5],[38,16.5]] },
    { id: 'er-os', name: 'Osten (Küste)', center: [40, 15], coords: [[39,16],[39,13],[42,13],[42,16]] },
  ],
};

// ── Djibouti ──
const djibouti: CountryRegions = {
  countryId: 'DJ',
  regions: [
    { id: 'dj-ci', name: 'Dschibuti-Stadt', center: [43.1, 11.6], coords: [[43,11.7],[43,11.5],[43.2,11.5],[43.2,11.7]] },
    { id: 'dj-no', name: 'Norden', center: [42.5, 11.8], coords: [[41.5,12.5],[41.5,11.5],[43.5,11.5],[43.5,12.5]] },
    { id: 'dj-su', name: 'Süden', center: [42.5, 11.2], coords: [[41.5,11.5],[41.5,10.5],[43.5,10.5],[43.5,11.5]] },
  ],
};

// ── Burundi ──
const burundi: CountryRegions = {
  countryId: 'BI',
  regions: [
    { id: 'bi-bj', name: 'Bujumbura', center: [29.3, -3.4], coords: [[29.1,-3.2],[29.1,-3.6],[29.5,-3.6],[29.5,-3.2]] },
    { id: 'bi-no', name: 'Norden', center: [29.7, -2.8], coords: [[29,-2.3],[29,-3.2],[30.5,-3.2],[30.5,-2.3]] },
    { id: 'bi-su', name: 'Süden', center: [29.8, -3.8], coords: [[29,-3.2],[29,-4.5],[30.5,-4.5],[30.5,-3.2]] },
  ],
};

// ── Central African Republic ──
const car: CountryRegions = {
  countryId: 'CF',
  regions: [
    { id: 'cf-bg', name: 'Bangui', center: [18.6, 4.4], coords: [[18.3,4.6],[18.3,4.2],[18.9,4.2],[18.9,4.6]] },
    { id: 'cf-no', name: 'Norden', center: [20, 8], coords: [[15,10],[15,6],[25,6],[25,10]] },
    { id: 'cf-su', name: 'Süden', center: [19, 4.5], coords: [[15,6],[15,3],[25,3],[25,6]] },
  ],
};

// ── Equatorial Guinea ──
const eqGuinea: CountryRegions = {
  countryId: 'GQ',
  regions: [
    { id: 'gq-co', name: 'Kontinental (Río Muni)', center: [10, 1.5], coords: [[9.3,2.3],[9.3,1],[11.3,1],[11.3,2.3]] },
    { id: 'gq-bi', name: 'Bioko (Insel)', center: [8.8, 3.5], coords: [[8.5,3.8],[8.5,3.2],[9.2,3.2],[9.2,3.8]] },
  ],
};

// ── Gabon ──
const gabon: CountryRegions = {
  countryId: 'GA',
  regions: [
    { id: 'ga-li', name: 'Libreville (Estuaire)', center: [9.5, 0.4], coords: [[9,1],[9,-0.3],[10.2,-0.3],[10.2,1]] },
    { id: 'ga-su', name: 'Süden', center: [12, -2], coords: [[10,-0.5],[10,-4],[14,-4],[14,-0.5]] },
    { id: 'ga-os', name: 'Osten', center: [13.5, 0], coords: [[12,1],[12,-1.5],[14.5,-1.5],[14.5,1]] },
  ],
};

// ── Republic of Congo ──
const repCongo: CountryRegions = {
  countryId: 'CG',
  regions: [
    { id: 'cg-bz', name: 'Brazzaville', center: [15.3, -4.3], coords: [[15,-4],[15,-4.6],[15.6,-4.6],[15.6,-4]] },
    { id: 'cg-pn', name: 'Pointe-Noire', center: [11.8, -4.8], coords: [[11.5,-4.5],[11.5,-5.1],[12.1,-5.1],[12.1,-4.5]] },
    { id: 'cg-no', name: 'Norden', center: [16, 0], coords: [[14,4],[14,-2],[18,-2],[18,4]] },
    { id: 'cg-su', name: 'Süden', center: [14, -4], coords: [[11,-2],[11,-5],[17,-5],[17,-2]] },
  ],
};

// ── Angola ──
const angola: CountryRegions = {
  countryId: 'AO',
  regions: [
    { id: 'ao-lu', name: 'Luanda', center: [13.2, -8.8], coords: [[13,-8.5],[13,-9.1],[13.5,-9.1],[13.5,-8.5]] },
    { id: 'ao-ca', name: 'Cabinda', center: [12.2, -5.2], coords: [[12,-4.5],[12,-5.8],[12.5,-5.8],[12.5,-4.5]] },
    { id: 'ao-no', name: 'Norden', center: [16, -7], coords: [[12,-5.8],[12,-9],[20,-9],[20,-5.8]] },
    { id: 'ao-ce', name: 'Zentral', center: [17, -12], coords: [[12,-9],[12,-15],[22,-15],[22,-9]] },
    { id: 'ao-su', name: 'Süden', center: [16, -16], coords: [[12,-15],[12,-18],[24,-18],[24,-15]] },
  ],
};

// ── Zambia ──
const zambia: CountryRegions = {
  countryId: 'ZM',
  regions: [
    { id: 'zm-lu', name: 'Lusaka', center: [28.3, -15.4], coords: [[28,-15],[28,-15.8],[28.8,-15.8],[28.8,-15]] },
    { id: 'zm-cb', name: 'Copperbelt', center: [28, -12.5], coords: [[27,-11.5],[27,-13.5],[29.5,-13.5],[29.5,-11.5]] },
    { id: 'zm-no', name: 'Norden', center: [30, -10], coords: [[28,-8.5],[28,-12],[33,-12],[33,-8.5]] },
    { id: 'zm-su', name: 'Süden', center: [26, -16.5], coords: [[24,-15],[24,-18],[29,-18],[29,-15]] },
    { id: 'zm-ws', name: 'Westen', center: [24, -15], coords: [[22,-12],[22,-18],[26,-18],[26,-12]] },
  ],
};

// ── Zimbabwe ──
const zimbabwe: CountryRegions = {
  countryId: 'ZW',
  regions: [
    { id: 'zw-ha', name: 'Harare', center: [31, -17.8], coords: [[30.5,-17.4],[30.5,-18.2],[31.5,-18.2],[31.5,-17.4]] },
    { id: 'zw-bu', name: 'Bulawayo', center: [28.6, -20.2], coords: [[28,-19.8],[28,-20.6],[29.2,-20.6],[29.2,-19.8]] },
    { id: 'zw-ma', name: 'Mashonaland', center: [31, -16.5], coords: [[29,-15.5],[29,-18],[33,-18],[33,-15.5]] },
    { id: 'zw-mt', name: 'Matabeleland', center: [28, -20.5], coords: [[25.5,-19],[25.5,-22.5],[30,-22.5],[30,-19]] },
  ],
};

// ── Malawi ──
const malawi: CountryRegions = {
  countryId: 'MW',
  regions: [
    { id: 'mw-no', name: 'Norden', center: [34, -11.5], coords: [[33,-9.5],[33,-13],[35.5,-13],[35.5,-9.5]] },
    { id: 'mw-ce', name: 'Zentral', center: [34, -14], coords: [[33,-13],[33,-15],[35.5,-15],[35.5,-13]] },
    { id: 'mw-su', name: 'Süden', center: [35, -15.5], coords: [[34,-15],[34,-17],[36,-17],[36,-15]] },
  ],
};

// ── Namibia ──
const namibia: CountryRegions = {
  countryId: 'NA',
  regions: [
    { id: 'na-wh', name: 'Windhoek (Khomas)', center: [17.1, -22.6], coords: [[16.5,-22],[16.5,-23.2],[17.8,-23.2],[17.8,-22]] },
    { id: 'na-ca', name: 'Caprivi', center: [23.5, -18], coords: [[21,-17.5],[21,-18.5],[25,-18.5],[25,-17.5]] },
    { id: 'na-no', name: 'Norden', center: [16, -18.5], coords: [[12,-17],[12,-20],[20,-20],[20,-17]] },
    { id: 'na-su', name: 'Süden', center: [18, -26], coords: [[14,-24],[14,-29],[20,-29],[20,-24]] },
    { id: 'na-er', name: 'Erongo (Küste)', center: [14.5, -22], coords: [[12,-20],[12,-24],[16,-24],[16,-20]] },
  ],
};

// ── Botswana ──
const botswana: CountryRegions = {
  countryId: 'BW',
  regions: [
    { id: 'bw-gb', name: 'Gaborone', center: [25.9, -24.7], coords: [[25.5,-24.3],[25.5,-25.1],[26.3,-25.1],[26.3,-24.3]] },
    { id: 'bw-no', name: 'Norden', center: [25, -20], coords: [[20,-18],[20,-22],[28,-22],[28,-18]] },
    { id: 'bw-ka', name: 'Kalahari', center: [23, -24], coords: [[20,-22],[20,-27],[25,-27],[25,-22]] },
    { id: 'bw-su', name: 'Süd-Ost', center: [27, -24], coords: [[25,-22],[25,-26],[29,-26],[29,-22]] },
  ],
};

// ── Lesotho ──
const lesotho: CountryRegions = {
  countryId: 'LS',
  regions: [
    { id: 'ls-ms', name: 'Maseru', center: [27.5, -29.3], coords: [[27.2,-29],[27.2,-29.6],[27.8,-29.6],[27.8,-29]] },
    { id: 'ls-hi', name: 'Hochland', center: [28.8, -29.5], coords: [[28,-29],[28,-30],[30,-30],[30,-29]] },
  ],
};

// ── Eswatini ──
const eswatini: CountryRegions = {
  countryId: 'SZ',
  regions: [
    { id: 'sz-mb', name: 'Hhohho (Mbabane)', center: [31.1, -26.3], coords: [[30.8,-26],[30.8,-26.6],[31.4,-26.6],[31.4,-26]] },
    { id: 'sz-su', name: 'Shiselweni', center: [31.3, -27], coords: [[31,-26.6],[31,-27.4],[31.7,-27.4],[31.7,-26.6]] },
  ],
};

// ── Madagascar ──
const madagascar: CountryRegions = {
  countryId: 'MG',
  regions: [
    { id: 'mg-at', name: 'Antananarivo', center: [47.5, -18.9], coords: [[47,-18.5],[47,-19.3],[48,-19.3],[48,-18.5]] },
    { id: 'mg-no', name: 'Norden', center: [49, -14], coords: [[47,-12],[47,-16],[50,-16],[50,-12]] },
    { id: 'mg-su', name: 'Süden', center: [45.5, -23], coords: [[43,-20],[43,-26],[47,-26],[47,-20]] },
    { id: 'mg-os', name: 'Osten', center: [49, -18], coords: [[48,-16],[48,-22],[50,-22],[50,-16]] },
    { id: 'mg-ws', name: 'Westen', center: [45, -17], coords: [[43,-14],[43,-20],[47,-20],[47,-14]] },
  ],
};

// ── Cabo Verde ──
const caboVerde: CountryRegions = {
  countryId: 'CV',
  regions: [
    { id: 'cv-st', name: 'Santiago (Praia)', center: [-23.5, 15], coords: [[-23.7,15.2],[-23.7,14.8],[-23.3,14.8],[-23.3,15.2]] },
    { id: 'cv-sv', name: 'São Vicente', center: [-25, 16.9], coords: [[-25.2,17.1],[-25.2,16.7],[-24.8,16.7],[-24.8,17.1]] },
  ],
};

// ── São Tomé and Príncipe ──
const saoTome: CountryRegions = {
  countryId: 'ST',
  regions: [
    { id: 'st-st', name: 'São Tomé', center: [6.6, 0.3], coords: [[6.4,0.5],[6.4,0],[6.9,0],[6.9,0.5]] },
    { id: 'st-pr', name: 'Príncipe', center: [7.4, 1.6], coords: [[7.3,1.7],[7.3,1.5],[7.5,1.5],[7.5,1.7]] },
  ],
};

// ── Comoros ──
const comoros: CountryRegions = {
  countryId: 'KM',
  regions: [
    { id: 'km-gc', name: 'Grande Comore', center: [43.3, -11.7], coords: [[43.1,-11.4],[43.1,-12],[43.5,-12],[43.5,-11.4]] },
    { id: 'km-an', name: 'Anjouan', center: [44.3, -12.2], coords: [[44.1,-12],[44.1,-12.4],[44.5,-12.4],[44.5,-12]] },
  ],
};

// Export all
export const COUNTRY_ADMIN_REGIONS: Record<string, CountryRegions> = {
  NG: nigeria, ET: ethiopia, CD: drc, SD: sudan, LY: libya,
  ZA: southAfrica, KE: kenya, EG: egypt, MA: morocco, DZ: algeria,
  MZ: mozambique, SO: somalia, BF: burkinaFaso, NE: niger, TD: chad,
  CM: cameroon, TZ: tanzania, UG: uganda, RW: rwanda, ML: mali,
  TN: tunisia, MR: mauritania, SN: senegal, GM: gambia, GW: guineaBissau,
  GN: guinea, SL: sierraLeone, LR: liberia, CI: coteIvoire, GH: ghana,
  TG: togo, BJ: benin, EH: westernSahara, SS: southSudan, ER: eritrea,
  DJ: djibouti, BI: burundi, CF: car, GQ: eqGuinea, GA: gabon,
  CG: repCongo, AO: angola, ZM: zambia, ZW: zimbabwe, MW: malawi,
  NA: namibia, BW: botswana, LS: lesotho, SZ: eswatini, MG: madagascar,
  CV: caboVerde, ST: saoTome, KM: comoros,
};

// List of country IDs that have sub-region data
export const COUNTRIES_WITH_REGIONS = Object.keys(COUNTRY_ADMIN_REGIONS);
