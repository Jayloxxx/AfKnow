export type ReligionType = 'islam_sunni' | 'islam_shia' | 'christianity_catholic' | 'christianity_protestant' | 'christianity_orthodox' | 'traditional' | 'mixed';

export interface CountryReligion {
  countryId: string;
  dominant: ReligionType;
  percentage: number;  // of dominant
  secondary?: ReligionType;
  secondaryPercentage?: number;
  notes?: string;
}

export const RELIGION_CONFIG: Record<ReligionType, { label: string; color: string; pattern?: string }> = {
  islam_sunni:              { label: 'Islam (Sunni)',        color: '#16a34a' },
  islam_shia:               { label: 'Islam (Schia)',        color: '#059669' },
  christianity_catholic:    { label: 'Christentum (Kath.)',  color: '#2563eb' },
  christianity_protestant:  { label: 'Christentum (Prot.)',  color: '#3b82f6' },
  christianity_orthodox:    { label: 'Christentum (Orth.)',  color: '#1d4ed8' },
  traditional:              { label: 'Traditionelle Rel.',   color: '#a855f7' },
  mixed:                    { label: 'Gemischt',             color: '#f59e0b' },
};

export const countryReligions: CountryReligion[] = [
  // ═══ NORDAFRIKA (fast komplett sunnitisch-muslimisch) ═══
  { countryId: 'MA', dominant: 'islam_sunni', percentage: 99, notes: 'Malikitisch' },
  { countryId: 'DZ', dominant: 'islam_sunni', percentage: 99, notes: 'Malikitisch' },
  { countryId: 'TN', dominant: 'islam_sunni', percentage: 98 },
  { countryId: 'LY', dominant: 'islam_sunni', percentage: 97 },
  { countryId: 'EG', dominant: 'islam_sunni', percentage: 90, secondary: 'christianity_orthodox', secondaryPercentage: 10, notes: 'Koptische Christen' },
  { countryId: 'MR', dominant: 'islam_sunni', percentage: 99 },

  // ═══ SAHEL (muslimisch dominant, christliche Minderheiten im Süden) ═══
  { countryId: 'ML', dominant: 'islam_sunni', percentage: 95 },
  { countryId: 'NE', dominant: 'islam_sunni', percentage: 98 },
  { countryId: 'TD', dominant: 'islam_sunni', percentage: 55, secondary: 'christianity_catholic', secondaryPercentage: 23, notes: 'Norden muslimisch, Süden christlich' },
  { countryId: 'SD', dominant: 'islam_sunni', percentage: 91, notes: 'Sufi-Traditionen stark' },
  { countryId: 'BF', dominant: 'islam_sunni', percentage: 62, secondary: 'christianity_catholic', secondaryPercentage: 23 },
  { countryId: 'SN', dominant: 'islam_sunni', percentage: 96, notes: 'Sufi-Bruderschaften (Mouridiyya, Tijaniyya)' },
  { countryId: 'GM', dominant: 'islam_sunni', percentage: 96 },
  { countryId: 'GW', dominant: 'islam_sunni', percentage: 45, secondary: 'traditional', secondaryPercentage: 30 },
  { countryId: 'GN', dominant: 'islam_sunni', percentage: 85 },
  { countryId: 'SL', dominant: 'islam_sunni', percentage: 78, secondary: 'christianity_protestant', secondaryPercentage: 20 },

  // ═══ WESTAFRIKA (gemischt) ═══
  { countryId: 'NG', dominant: 'islam_sunni', percentage: 50, secondary: 'christianity_protestant', secondaryPercentage: 40, notes: 'Norden muslimisch, Süden christlich – Hauptspannungslinie' },
  { countryId: 'GH', dominant: 'christianity_protestant', percentage: 47, secondary: 'islam_sunni', secondaryPercentage: 20 },
  { countryId: 'CI', dominant: 'islam_sunni', percentage: 43, secondary: 'christianity_catholic', secondaryPercentage: 33, notes: 'Norden/Süden gespalten' },
  { countryId: 'TG', dominant: 'traditional', percentage: 33, secondary: 'christianity_catholic', secondaryPercentage: 29 },
  { countryId: 'BJ', dominant: 'christianity_catholic', percentage: 26, secondary: 'islam_sunni', secondaryPercentage: 24, notes: 'Vodun-Ursprungsland' },
  { countryId: 'LR', dominant: 'christianity_protestant', percentage: 85 },
  { countryId: 'CV', dominant: 'christianity_catholic', percentage: 77 },

  // ═══ ZENTRALAFRIKA (christlich dominant) ═══
  { countryId: 'CM', dominant: 'christianity_catholic', percentage: 38, secondary: 'islam_sunni', secondaryPercentage: 24, notes: 'Norden muslimisch, Süden christlich' },
  { countryId: 'CF', dominant: 'christianity_protestant', percentage: 50, secondary: 'islam_sunni', secondaryPercentage: 15, notes: 'Séléka (musl.) vs Anti-Balaka (christl.) Konflikt' },
  { countryId: 'GA', dominant: 'christianity_catholic', percentage: 42 },
  { countryId: 'CG', dominant: 'christianity_catholic', percentage: 33 },
  { countryId: 'CD', dominant: 'christianity_catholic', percentage: 29, secondary: 'christianity_protestant', secondaryPercentage: 27 },
  { countryId: 'GQ', dominant: 'christianity_catholic', percentage: 88 },
  { countryId: 'ST', dominant: 'christianity_catholic', percentage: 55 },

  // ═══ OSTAFRIKA ═══
  { countryId: 'ET', dominant: 'christianity_orthodox', percentage: 44, secondary: 'islam_sunni', secondaryPercentage: 34, notes: 'Äthiopisch-Orthodox, eine der ältesten christlichen Kirchen' },
  { countryId: 'ER', dominant: 'christianity_orthodox', percentage: 50, secondary: 'islam_sunni', secondaryPercentage: 48 },
  { countryId: 'DJ', dominant: 'islam_sunni', percentage: 94 },
  { countryId: 'SO', dominant: 'islam_sunni', percentage: 99 },
  { countryId: 'KE', dominant: 'christianity_protestant', percentage: 48, secondary: 'christianity_catholic', secondaryPercentage: 23, notes: 'Küste & Nordosten muslimisch (11%)' },
  { countryId: 'UG', dominant: 'christianity_catholic', percentage: 39, secondary: 'christianity_protestant', secondaryPercentage: 32, notes: '14% Muslim' },
  { countryId: 'TZ', dominant: 'christianity_catholic', percentage: 30, secondary: 'islam_sunni', secondaryPercentage: 35, notes: 'Sansibar fast vollständig muslimisch' },
  { countryId: 'RW', dominant: 'christianity_catholic', percentage: 44, secondary: 'christianity_protestant', secondaryPercentage: 38 },
  { countryId: 'BI', dominant: 'christianity_catholic', percentage: 62 },
  { countryId: 'SS', dominant: 'christianity_catholic', percentage: 37, secondary: 'traditional', secondaryPercentage: 33 },

  // ═══ SÜDLICHES AFRIKA (christlich dominant) ═══
  { countryId: 'ZA', dominant: 'christianity_protestant', percentage: 80, notes: 'Zion Christian Church, Dutch Reformed, etc.' },
  { countryId: 'MZ', dominant: 'christianity_catholic', percentage: 28, secondary: 'islam_sunni', secondaryPercentage: 18, notes: 'Norden muslimisch (Cabo Delgado)' },
  { countryId: 'ZW', dominant: 'christianity_protestant', percentage: 74 },
  { countryId: 'ZM', dominant: 'christianity_protestant', percentage: 75 },
  { countryId: 'MW', dominant: 'christianity_protestant', percentage: 58, secondary: 'islam_sunni', secondaryPercentage: 14 },
  { countryId: 'AO', dominant: 'christianity_catholic', percentage: 41, secondary: 'christianity_protestant', secondaryPercentage: 38 },
  { countryId: 'NA', dominant: 'christianity_protestant', percentage: 80 },
  { countryId: 'BW', dominant: 'christianity_protestant', percentage: 79 },
  { countryId: 'SZ', dominant: 'christianity_protestant', percentage: 40, secondary: 'christianity_catholic', secondaryPercentage: 20 },
  { countryId: 'LS', dominant: 'christianity_catholic', percentage: 40, secondary: 'christianity_protestant', secondaryPercentage: 30 },
  { countryId: 'MG', dominant: 'christianity_catholic', percentage: 34, secondary: 'traditional', secondaryPercentage: 27 },
  { countryId: 'MU', dominant: 'christianity_catholic', percentage: 26, notes: 'Hindu 25%, Muslim 17%' },
  { countryId: 'SC', dominant: 'christianity_catholic', percentage: 76 },
  { countryId: 'KM', dominant: 'islam_sunni', percentage: 98, notes: 'Komoren' },
];
