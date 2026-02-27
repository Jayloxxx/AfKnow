// ═══════════════════════════════════════════════════════════════════
// AfKnow — Szenario-Engine
// Deterministic cascade algorithm for "Was wäre wenn" analysis
// Every prediction is fully traceable via relationship chains
// ═══════════════════════════════════════════════════════════════════

import type { KBEntry, KBCrossLink, KBCategory, KBStatus, KBSeverity } from '../data/knowledgeBase';

// ─── Types ───

export type ScenarioActionType =
  | 'remove-actor'
  | 'status-change'
  | 'severity-change'
  | 'alliance-break'
  | 'alliance-form'
  | 'opposition-resolve'
  | 'new-opposition'
  | 'entry-remove'
  | 'escalation'
  | 'intervention';

export interface ScenarioActionParams {
  newStatus?: KBStatus;
  newSeverity?: KBSeverity;
  targetEntryId?: string;
  severityDelta?: number;
  description?: string;
}

export interface ScenarioAction {
  id: string;
  entryId: string;
  actionType: ScenarioActionType;
  params: ScenarioActionParams;
  label: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  actions: ScenarioAction[];
  createdAt: string;
  updatedAt: string;
  isTemplate: boolean;
  templateCategory?: string;
}

export type CascadeImpactType =
  | 'status-shift'
  | 'severity-shift'
  | 'destabilization'
  | 'stabilization'
  | 'actor-vacuum'
  | 'spillover'
  | 'alliance-shift';

export interface CascadeChainLink {
  fromEntryId: string;
  fromEntryTitle: string;
  toEntryId: string;
  toEntryTitle: string;
  relationship: KBCrossLink['relationship'];
  relationshipLabel: string;
  attenuationFactor: number;
}

export interface CascadeImpact {
  entryId: string;
  entryTitle: string;
  entryCategory: KBCategory;
  impactType: CascadeImpactType;
  predictedEffect: string;
  magnitude: number;        // 0.0–1.0
  confidence: number;       // 0.0–1.0
  degree: 1 | 2 | 3;
  chain: CascadeChainLink[];
  reasoning: string;
  isInverse: boolean;       // true if opponent weakening = strengthening
}

export interface CascadeResult {
  impacts: CascadeImpact[];
  affectedEntryIds: string[];
  totalConfidenceScore: number;
  seedEntryIds: string[];
}

// ─── Constants (all public for methodology panel) ───

export const RELATIONSHIP_WEIGHTS: Record<string, number> = {
  cause: 0.9,
  effect: 0.9,
  'part-of': 0.85,
  'actor-in': 0.7,
  allied: 0.65,
  opposed: 0.6,
  successor: 0.5,
  predecessor: 0.5,
  related: 0.3,
};

export const DEGREE_ATTENUATION: Record<number, number> = {
  1: 1.0,
  2: 0.5,
  3: 0.2,
};

export const NOISE_THRESHOLD = 0.05;

export const RELATION_LABELS_DE: Record<string, string> = {
  cause: 'Ursache von',
  effect: 'Folge von',
  'actor-in': 'Akteur in',
  'part-of': 'Teil von',
  allied: 'Verbündet mit',
  opposed: 'Gegner von',
  related: 'Verwandt mit',
  successor: 'Nachfolger von',
  predecessor: 'Vorgänger von',
};

export const ACTION_TYPE_CONFIG: Record<ScenarioActionType, { label: string; icon: string; color: string; description: string }> = {
  'remove-actor':       { label: 'Akteur entfernen',       icon: '🚫', color: '#ef4444', description: 'Ein Akteur zieht sich zurück oder wird neutralisiert' },
  'status-change':      { label: 'Status ändern',          icon: '🔄', color: '#3b82f6', description: 'Status eines Eintrags ändert sich (z.B. aktiv → eingefroren)' },
  'severity-change':    { label: 'Schweregrad ändern',     icon: '📊', color: '#f59e0b', description: 'Schweregrad eines Konflikts/Akteurs ändert sich' },
  'alliance-break':     { label: 'Allianz brechen',        icon: '💔', color: '#ef4444', description: 'Eine bestehende Allianz zerfällt' },
  'alliance-form':      { label: 'Allianz bilden',         icon: '🤝', color: '#22c55e', description: 'Neue Allianz oder Kooperation entsteht' },
  'opposition-resolve': { label: 'Gegnerschaft lösen',     icon: '🕊️', color: '#22c55e', description: 'Feindschaft wird beigelegt' },
  'new-opposition':     { label: 'Neue Gegnerschaft',      icon: '⚔️', color: '#ef4444', description: 'Neue Rivalität oder Konfrontation entsteht' },
  'entry-remove':       { label: 'Eintrag aufgelöst',      icon: '❌', color: '#6b7280', description: 'Organisation aufgelöst, Konflikt beendet' },
  'escalation':         { label: 'Eskalation',             icon: '📈', color: '#dc2626', description: 'Konflikt eskaliert (Schweregrad steigt)' },
  'intervention':       { label: 'Intervention',           icon: '🎯', color: '#8b5cf6', description: 'Externe Intervention in einen Konflikt' },
};

export const CONFIDENCE_LEVELS = {
  high:   { min: 0.7, label: 'Hoch',   color: '#22c55e', description: 'Direkte Kausalbeziehung (1. Grad), starke Evidenz im Wissensgraph' },
  medium: { min: 0.4, label: 'Mittel', color: '#f59e0b', description: 'Sekundäreffekt (2. Grad), strukturell plausibel aber indirekt' },
  low:    { min: 0.0, label: 'Gering', color: '#ef4444', description: 'Tertiäreffekt (3. Grad), hohe Unsicherheit — nur als Hinweis zu werten' },
} as const;

export function getConfidenceLevel(confidence: number) {
  if (confidence >= CONFIDENCE_LEVELS.high.min) return CONFIDENCE_LEVELS.high;
  if (confidence >= CONFIDENCE_LEVELS.medium.min) return CONFIDENCE_LEVELS.medium;
  return CONFIDENCE_LEVELS.low;
}

// ─── Graph Building ───

interface GraphEdge {
  targetId: string;
  relationship: string;
  label: string;
  isReverse: boolean;
}

function reverseRelationship(rel: string): string {
  switch (rel) {
    case 'cause': return 'effect';
    case 'effect': return 'cause';
    case 'successor': return 'predecessor';
    case 'predecessor': return 'successor';
    default: return rel;
  }
}

function buildAdjacencyGraph(entries: KBEntry[]): Map<string, GraphEdge[]> {
  const graph = new Map<string, GraphEdge[]>();

  const ensure = (id: string) => { if (!graph.has(id)) graph.set(id, []); };

  for (const entry of entries) {
    ensure(entry.id);
    for (const link of entry.crossLinks) {
      // Check target exists
      if (!entries.some(e => e.id === link.targetId)) continue;

      ensure(link.targetId);

      // Forward edge
      graph.get(entry.id)!.push({
        targetId: link.targetId,
        relationship: link.relationship,
        label: link.label,
        isReverse: false,
      });

      // Reverse edge (for bidirectional traversal)
      graph.get(link.targetId)!.push({
        targetId: entry.id,
        relationship: reverseRelationship(link.relationship),
        label: `← ${entry.title}`,
        isReverse: true,
      });
    }
  }

  return graph;
}

// ─── Impact Derivation ───

function isInverseRelationship(relationship: string): boolean {
  return relationship === 'opposed';
}

function deriveImpactType(
  sourceType: string,
  relationship: string,
  isInverse: boolean
): CascadeImpactType {
  if (isInverse) {
    // Opponent weakened → potential stabilization for the other side
    if (sourceType === 'destabilization' || sourceType === 'escalation' || sourceType === 'severity-shift') {
      return 'stabilization';
    }
    if (sourceType === 'stabilization') return 'destabilization';
    return 'alliance-shift';
  }

  if (relationship === 'actor-in' && (sourceType === 'remove-actor' || sourceType === 'actor-vacuum')) {
    return 'actor-vacuum';
  }

  if (relationship === 'cause' || relationship === 'effect') {
    if (sourceType === 'destabilization' || sourceType === 'escalation') return 'spillover';
    if (sourceType === 'stabilization') return 'stabilization';
    return 'severity-shift';
  }

  if (relationship === 'part-of') {
    return sourceType === 'stabilization' ? 'stabilization' : 'destabilization';
  }

  if (relationship === 'allied') return 'alliance-shift';

  return 'spillover';
}

function generatePredictedEffect(
  impactType: CascadeImpactType,
  magnitude: number,
  isInverse: boolean,
  entry: KBEntry
): string {
  const strength = magnitude >= 0.6 ? 'stark' : magnitude >= 0.3 ? 'moderat' : 'leicht';

  const effectMap: Record<CascadeImpactType, string> = {
    'status-shift': `Status von "${entry.title}" könnte sich ${isInverse ? 'verbessern' : 'verschlechtern'} (${strength}er Effekt)`,
    'severity-shift': `Schweregrad von "${entry.title}" wird ${isInverse ? 'wahrscheinlich sinken' : 'wahrscheinlich steigen'} (${strength})`,
    'destabilization': `"${entry.title}" wird ${strength} destabilisiert — erhöhte Unsicherheit erwartet`,
    'stabilization': `"${entry.title}" könnte sich ${strength} stabilisieren — reduziertes Eskalationsrisiko`,
    'actor-vacuum': `Machtvakuum in "${entry.title}" — konkurrierende Kräfte könnten Lücke füllen (${strength}er Effekt)`,
    'spillover': `Spillover-Effekt auf "${entry.title}" — regionale Dynamiken betroffen (${strength})`,
    'alliance-shift': `Allianz-Dynamik um "${entry.title}" verschiebt sich (${strength}er Effekt)`,
  };

  return effectMap[impactType] ?? `"${entry.title}" ist ${strength} betroffen`;
}

function generateReasoning(chain: CascadeChainLink[]): string {
  return chain.map(link =>
    `${link.fromEntryTitle} →[${link.relationshipLabel}]→ ${link.toEntryTitle}`
  ).join(' → ');
}

function computeConfidence(degree: number, chain: CascadeChainLink[]): number {
  const degreeBase: Record<number, number> = { 1: 0.9, 2: 0.6, 3: 0.3 };
  const base = degreeBase[degree] ?? 0.3;
  const chainStrength = chain.reduce((prod, link) =>
    prod * (RELATIONSHIP_WEIGHTS[link.relationship] ?? 0.3), 1);
  return Math.min(0.95, base * (0.5 + 0.5 * chainStrength));
}

function computeStatusDelta(from: KBStatus, to: KBStatus): number {
  const order: Record<KBStatus, number> = {
    resolved: 0, historical: 1, frozen: 2, active: 3, escalating: 4,
  };
  return Math.abs((order[to] ?? 2) - (order[from] ?? 2)) / 4;
}

// ─── Main Cascade Algorithm ───

interface QueueItem {
  entryId: string;
  degree: number;
  chain: CascadeChainLink[];
  magnitude: number;
  impactType: string;
  isInverse: boolean;
}

export function computeCascade(
  actions: ScenarioAction[],
  allEntries: KBEntry[]
): CascadeResult {
  if (actions.length === 0) {
    return { impacts: [], affectedEntryIds: [], totalConfidenceScore: 0, seedEntryIds: [] };
  }

  const entryMap = new Map(allEntries.map(e => [e.id, e]));
  const graph = buildAdjacencyGraph(allEntries);

  // Step 1: Compute initial seeds from actions
  const seeds = new Map<string, { magnitude: number; type: string; action: ScenarioAction }>();

  for (const action of actions) {
    const entry = entryMap.get(action.entryId);
    if (!entry) continue;

    let magnitude = 0.8; // default
    let type = 'destabilization';

    switch (action.actionType) {
      case 'remove-actor':
        magnitude = 1.0;
        type = 'actor-vacuum';
        break;
      case 'status-change':
        magnitude = action.params.newStatus
          ? computeStatusDelta(entry.status, action.params.newStatus)
          : 0.5;
        type = 'status-shift';
        break;
      case 'severity-change': {
        const delta = Math.abs(entry.severity - (action.params.newSeverity ?? entry.severity)) / 5;
        magnitude = Math.max(0.2, delta);
        type = (action.params.newSeverity ?? entry.severity) < entry.severity ? 'stabilization' : 'destabilization';
        break;
      }
      case 'alliance-break':
        magnitude = 0.7;
        type = 'alliance-shift';
        break;
      case 'alliance-form':
        magnitude = 0.6;
        type = 'stabilization';
        break;
      case 'opposition-resolve':
        magnitude = 0.7;
        type = 'stabilization';
        break;
      case 'new-opposition':
        magnitude = 0.7;
        type = 'destabilization';
        break;
      case 'entry-remove':
        magnitude = 1.0;
        type = 'actor-vacuum';
        break;
      case 'escalation':
        magnitude = Math.min(1.0, (action.params.severityDelta ?? 1) / 5 + 0.3);
        type = 'destabilization';
        break;
      case 'intervention':
        magnitude = 0.8;
        type = 'destabilization';
        break;
    }

    // If multiple actions target the same entry, take the highest magnitude
    const existing = seeds.get(action.entryId);
    if (!existing || existing.magnitude < magnitude) {
      seeds.set(action.entryId, { magnitude, type, action });
    }
  }

  // Step 2: BFS propagation
  const impacts: CascadeImpact[] = [];
  const visited = new Set<string>([...seeds.keys()]);
  const queue: QueueItem[] = [];

  // Seed degree-1 neighbors
  for (const [seedId, seedData] of seeds) {
    const neighbors = graph.get(seedId) ?? [];
    for (const neighbor of neighbors) {
      if (seeds.has(neighbor.targetId)) continue;

      const weight = RELATIONSHIP_WEIGHTS[neighbor.relationship] ?? 0.3;
      const inverse = isInverseRelationship(neighbor.relationship);
      const magnitude = seedData.magnitude * weight * DEGREE_ATTENUATION[1];

      if (magnitude < NOISE_THRESHOLD) continue;

      const seedEntry = entryMap.get(seedId)!;
      const targetEntry = entryMap.get(neighbor.targetId);
      if (!targetEntry) continue;

      queue.push({
        entryId: neighbor.targetId,
        degree: 1,
        chain: [{
          fromEntryId: seedId,
          fromEntryTitle: seedEntry.title,
          toEntryId: neighbor.targetId,
          toEntryTitle: targetEntry.title,
          relationship: neighbor.relationship as KBCrossLink['relationship'],
          relationshipLabel: RELATION_LABELS_DE[neighbor.relationship] ?? neighbor.relationship,
          attenuationFactor: weight,
        }],
        magnitude,
        impactType: deriveImpactType(seedData.type, neighbor.relationship, inverse),
        isInverse: inverse,
      });
    }
  }

  // Process queue
  while (queue.length > 0) {
    const item = queue.shift()!;
    const entry = entryMap.get(item.entryId);
    if (!entry) continue;

    impacts.push({
      entryId: item.entryId,
      entryTitle: entry.title,
      entryCategory: entry.category,
      impactType: item.impactType as CascadeImpactType,
      predictedEffect: generatePredictedEffect(
        item.impactType as CascadeImpactType,
        item.magnitude,
        item.isInverse,
        entry
      ),
      magnitude: item.magnitude,
      confidence: computeConfidence(item.degree, item.chain),
      degree: item.degree as 1 | 2 | 3,
      chain: item.chain,
      reasoning: generateReasoning(item.chain),
      isInverse: item.isInverse,
    });

    // Continue propagation
    if (item.degree < 3) {
      visited.add(item.entryId);
      const neighbors = graph.get(item.entryId) ?? [];

      for (const neighbor of neighbors) {
        if (visited.has(neighbor.targetId)) continue;
        if (seeds.has(neighbor.targetId)) continue;

        const weight = RELATIONSHIP_WEIGHTS[neighbor.relationship] ?? 0.3;
        const nextDegree = (item.degree + 1) as 1 | 2 | 3;
        const attenuation = DEGREE_ATTENUATION[nextDegree];
        const magnitude = item.magnitude * weight * attenuation;

        if (magnitude < NOISE_THRESHOLD) continue;

        const targetEntry = entryMap.get(neighbor.targetId);
        if (!targetEntry) continue;

        const inverse = isInverseRelationship(neighbor.relationship);

        queue.push({
          entryId: neighbor.targetId,
          degree: nextDegree,
          chain: [...item.chain, {
            fromEntryId: item.entryId,
            fromEntryTitle: entry.title,
            toEntryId: neighbor.targetId,
            toEntryTitle: targetEntry.title,
            relationship: neighbor.relationship as KBCrossLink['relationship'],
            relationshipLabel: RELATION_LABELS_DE[neighbor.relationship] ?? neighbor.relationship,
            attenuationFactor: weight,
          }],
          magnitude,
          impactType: deriveImpactType(item.impactType, neighbor.relationship, inverse),
          isInverse: item.isInverse !== inverse ? !item.isInverse : item.isInverse, // double-inverse = positive
        });
      }
    }
  }

  // Step 3: Deduplicate — keep highest magnitude per entry
  const bestMap = new Map<string, CascadeImpact>();
  for (const impact of impacts) {
    const existing = bestMap.get(impact.entryId);
    if (!existing || existing.magnitude < impact.magnitude) {
      bestMap.set(impact.entryId, impact);
    }
  }

  const deduped = [...bestMap.values()].sort((a, b) => b.magnitude - a.magnitude);

  return {
    impacts: deduped,
    affectedEntryIds: deduped.map(i => i.entryId),
    totalConfidenceScore: deduped.length > 0
      ? deduped.reduce((sum, i) => sum + i.confidence, 0) / deduped.length
      : 0,
    seedEntryIds: [...seeds.keys()],
  };
}
