import type { CountryMilitaryData, InternationalMission } from '../../types';

// Placeholder — full data will be populated
export const meMilitaryData: Record<string, CountryMilitaryData> = {};

export const internationalMissionsME: InternationalMission[] = [];

export function getMECountryMilitaryData(countryId: string): CountryMilitaryData | null {
  return meMilitaryData[countryId] ?? null;
}

export function getMEMissionsForCountry(countryId: string): InternationalMission[] {
  const countryMissions = meMilitaryData[countryId]?.missions ?? [];
  const globalMissions = internationalMissionsME.filter(m => m.countries.includes(countryId));
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
