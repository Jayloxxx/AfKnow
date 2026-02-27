import type { Scenario } from '../lib/scenarioEngine';

export const SCENARIO_TEMPLATES: Scenario[] = [
  // ─── SAHEL ───
  {
    id: 'tpl-wagner-withdrawal',
    name: 'Wagner/Afrika-Korps zieht ab',
    description: 'Russland zieht seine Söldner aus Mali, Burkina Faso und der Sahelzone ab. Was passiert mit der Sicherheitslage?',
    actions: [
      {
        id: 'tpl-a1', entryId: 'af-wagner', actionType: 'remove-actor',
        params: { description: 'Vollständiger Abzug der Wagner/Afrika-Korps-Kräfte aus der Sahelzone' },
        label: 'Wagner zieht aus Sahel ab',
      },
    ],
    createdAt: '2025-01-01', updatedAt: '2025-01-01',
    isTemplate: true, templateCategory: 'sahel',
  },
  {
    id: 'tpl-ecowas-intervention',
    name: 'ECOWAS-Militärintervention',
    description: 'ECOWAS setzt seine Drohung um und interveniert militärisch im Sahel zur Wiederherstellung der Verfassungsordnung.',
    actions: [
      {
        id: 'tpl-a2', entryId: 'af-ecowas', actionType: 'intervention',
        params: { description: 'Militärische Intervention durch ECOWAS-Standby-Force' },
        label: 'ECOWAS interveniert militärisch',
      },
      {
        id: 'tpl-a3', entryId: 'af-sahel-crisis', actionType: 'escalation',
        params: { severityDelta: 1, description: 'Eskalation durch zwischenstaatlichen Konflikt' },
        label: 'Sahelkrise eskaliert durch Intervention',
      },
    ],
    createdAt: '2025-01-01', updatedAt: '2025-01-01',
    isTemplate: true, templateCategory: 'sahel',
  },
  {
    id: 'tpl-aes-collapse',
    name: 'AES zerfällt',
    description: 'Die Allianz der Sahelstaaten (Mali, Burkina Faso, Niger) bricht auseinander. Welche Folgen hat dies?',
    actions: [
      {
        id: 'tpl-a4', entryId: 'af-aes', actionType: 'entry-remove',
        params: { description: 'Allianz der Sahelstaaten löst sich auf — interne Differenzen unüberbrückbar' },
        label: 'AES löst sich auf',
      },
    ],
    createdAt: '2025-01-01', updatedAt: '2025-01-01',
    isTemplate: true, templateCategory: 'sahel',
  },

  // ─── MIDDLE EAST ───
  {
    id: 'tpl-iran-deal',
    name: 'Neues Iran-Atomabkommen',
    description: 'Iran und der Westen einigen sich auf ein neues Nuklearabkommen mit Sanktionserleichterungen. Wie verändert sich die Proxy-Landschaft?',
    actions: [
      {
        id: 'tpl-a5', entryId: 'me-iran', actionType: 'status-change',
        params: { newStatus: 'frozen', description: 'Nuklearprogramm eingefroren, Sanktionserleichterungen' },
        label: 'Iran: Nuklear-Deal & Deeskalation',
      },
      {
        id: 'tpl-a6', entryId: 'me-iran', actionType: 'severity-change',
        params: { newSeverity: 2, description: 'Geringere geopolitische Bedrohungslage' },
        label: 'Iran: Schweregrad sinkt auf 2',
      },
    ],
    createdAt: '2025-01-01', updatedAt: '2025-01-01',
    isTemplate: true, templateCategory: 'middle-east',
  },
  {
    id: 'tpl-gaza-ceasefire',
    name: 'Gaza-Waffenstillstand',
    description: 'Dauerhafter Waffenstillstand im Gaza-Konflikt. Welche Auswirkungen auf Rotes Meer, Libanon, Iran-Achse?',
    actions: [
      {
        id: 'tpl-a7', entryId: 'me-israel-palestine', actionType: 'status-change',
        params: { newStatus: 'frozen', description: 'Waffenstillstand und Geisel-Deal' },
        label: 'Gaza: Waffenruhe tritt in Kraft',
      },
      {
        id: 'tpl-a8', entryId: 'me-israel-palestine', actionType: 'severity-change',
        params: { newSeverity: 3, description: 'Reduzierte aber ungelöste Spannungen' },
        label: 'Gaza: Schweregrad sinkt auf 3',
      },
    ],
    createdAt: '2025-01-01', updatedAt: '2025-01-01',
    isTemplate: true, templateCategory: 'middle-east',
  },
  {
    id: 'tpl-hezbollah-collapse',
    name: 'Hisbollah-Schwächung',
    description: 'Hisbollah wird nach israelischen Operationen und internem Druck massiv geschwächt. Folgen für Libanon, Iran-Achse.',
    actions: [
      {
        id: 'tpl-a9', entryId: 'me-hezbollah', actionType: 'severity-change',
        params: { newSeverity: 2, description: 'Massive Schwächung durch Führungsverluste und Entwaffnung' },
        label: 'Hisbollah: Kapazität sinkt drastisch',
      },
    ],
    createdAt: '2025-01-01', updatedAt: '2025-01-01',
    isTemplate: true, templateCategory: 'middle-east',
  },

  // ─── CROSS-REGIONAL ───
  {
    id: 'tpl-libya-stabilization',
    name: 'Libyen-Stabilisierung',
    description: 'Einigung auf vereinte Regierung in Libyen, Abzug ausländischer Kämpfer. Auswirkungen auf Sahel und Mittelmeerroute.',
    actions: [
      {
        id: 'tpl-a10', entryId: 'af-libya-conflict', actionType: 'status-change',
        params: { newStatus: 'resolved', description: 'Politische Einigung auf Einheitsregierung' },
        label: 'Libyen: Politische Einigung',
      },
      {
        id: 'tpl-a11', entryId: 'af-libya-conflict', actionType: 'severity-change',
        params: { newSeverity: 2, description: 'Deutlich reduzierte Gewalt' },
        label: 'Libyen: Schweregrad sinkt auf 2',
      },
    ],
    createdAt: '2025-01-01', updatedAt: '2025-01-01',
    isTemplate: true, templateCategory: 'cross-regional',
  },
];
