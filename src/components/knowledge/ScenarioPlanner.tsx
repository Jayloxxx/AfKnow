import { useState, useMemo, useCallback } from 'react';
import {
  Zap, Plus, Trash2, Search, ChevronDown, ChevronUp,
  Play, Save, FolderOpen, Info, AlertTriangle, TrendingUp, TrendingDown,
  Shield, Users, Globe, BarChart3, BookOpen, Crosshair
} from 'lucide-react';
import { useRegion } from '../../context/RegionContext';
import { useKnowledgeStore } from '../../store/useKnowledgeStore';
import {
  getEntriesForRegion, KB_CATEGORY_CONFIG, KB_STATUS_CONFIG, KB_SEVERITY_CONFIG,
  KNOWLEDGE_BASE_ENTRIES,
  type KBEntry, type KBStatus,
} from '../../data/knowledgeBase';
import {
  computeCascade,
  ACTION_TYPE_CONFIG, RELATIONSHIP_WEIGHTS, DEGREE_ATTENUATION, NOISE_THRESHOLD,
  CONFIDENCE_LEVELS, getConfidenceLevel, RELATION_LABELS_DE,
  type ScenarioAction, type ScenarioActionType, type ScenarioActionParams,
  type CascadeImpact,
} from '../../lib/scenarioEngine';
import { SCENARIO_TEMPLATES } from '../../data/scenarioTemplates';

// ═══ Entry Selector (reused pattern) ═══
function EntrySelector({ entries, selectedId, onSelect, accentHex, label }: {
  entries: KBEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  accentHex: string;
  label: string;
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const selected = selectedId ? entries.find(e => e.id === selectedId) : null;
  const filtered = search
    ? entries.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
    : entries;

  return (
    <div className="relative">
      <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">{label}</div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-card border border-theme hover:border-theme transition-all text-left"
        style={selected ? { borderColor: `color-mix(in srgb, ${accentHex} 40%, transparent)` } : undefined}
      >
        {selected ? (
          <>
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: KB_CATEGORY_CONFIG[selected.category].color }} />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold text-main truncate">{selected.title}</div>
              <div className="text-[8px] text-muted">{KB_CATEGORY_CONFIG[selected.category].label} · Schwere {selected.severity}/5</div>
            </div>
          </>
        ) : (
          <span className="text-[10px] text-muted flex-1">Eintrag auswählen...</span>
        )}
        <ChevronDown size={11} className="text-muted shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[49]" onClick={() => { setOpen(false); setSearch(''); }} />
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface border border-theme rounded-xl shadow-xl max-h-64 overflow-hidden">
            <div className="p-2 border-b border-theme">
              <div className="relative">
                <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Suchen..." autoFocus
                  className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-card border border-theme text-[10px] text-main focus:outline-none" />
              </div>
            </div>
            <div className="overflow-y-auto max-h-48">
              {filtered.map(e => (
                <button key={e.id} onClick={() => { onSelect(e.id); setOpen(false); setSearch(''); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-hover/50 transition-colors border-b border-theme/20">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: KB_CATEGORY_CONFIG[e.category].color }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold text-main truncate">{e.title}</div>
                    <div className="text-[8px] text-muted">{KB_CATEGORY_CONFIG[e.category].label} · {KB_STATUS_CONFIG[e.status].label} · Schwere {e.severity}/5</div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && <div className="p-3 text-[10px] text-muted text-center">Keine Einträge gefunden</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══ Impact Card ═══
function ImpactCard({ impact, accentHex, onNavigate }: {
  impact: CascadeImpact;
  accentHex: string;
  onNavigate: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const conf = getConfidenceLevel(impact.confidence);
  const catCfg = KB_CATEGORY_CONFIG[impact.entryCategory];

  const impactIcons: Record<string, typeof TrendingUp> = {
    'destabilization': TrendingUp,
    'stabilization': TrendingDown,
    'actor-vacuum': Users,
    'spillover': Globe,
    'severity-shift': BarChart3,
    'status-shift': Shield,
    'alliance-shift': Crosshair,
  };
  const ImpactIcon = impactIcons[impact.impactType] ?? AlertTriangle;

  const impactLabels: Record<string, string> = {
    'destabilization': 'Destabilisierung',
    'stabilization': 'Stabilisierung',
    'actor-vacuum': 'Machtvakuum',
    'spillover': 'Spillover',
    'severity-shift': 'Schweregrad-Verschiebung',
    'status-shift': 'Status-Verschiebung',
    'alliance-shift': 'Allianz-Verschiebung',
  };

  return (
    <div
      className="p-3 rounded-xl border transition-all hover:shadow-md"
      style={{
        borderColor: `color-mix(in srgb, ${conf.color} 25%, var(--border))`,
        borderLeftWidth: '3px',
        borderLeftColor: conf.color,
        background: `color-mix(in srgb, ${conf.color} 3%, var(--card))`,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${catCfg.color} 15%, transparent)`, color: catCfg.color }}>
          <ImpactIcon size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <button onClick={() => onNavigate(impact.entryId)}
              className="text-[11px] font-bold text-main hover:underline truncate" style={{ color: accentHex }}>
              {impact.entryTitle}
            </button>
            <span className="text-[8px] px-1.5 py-0.5 rounded font-bold shrink-0"
              style={{ background: `color-mix(in srgb, ${catCfg.color} 12%, transparent)`, color: catCfg.color }}>
              {catCfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-medium"
              style={{ background: `color-mix(in srgb, ${conf.color} 12%, transparent)`, color: conf.color }}>
              {impactLabels[impact.impactType] ?? impact.impactType}
            </span>
            <span className="text-[9px] font-mono" style={{ color: conf.color }}>
              {impact.degree}. Grad
            </span>
          </div>
          <p className="text-[10px] text-main leading-relaxed">{impact.predictedEffect}</p>
        </div>
      </div>

      {/* Magnitude & Confidence */}
      <div className="flex items-center gap-3 mt-2">
        {/* Magnitude bar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[8px] text-muted font-medium">Stärke</span>
            <span className="text-[9px] font-mono font-bold" style={{ color: conf.color }}>{Math.round(impact.magnitude * 100)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-hover/50 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{
              width: `${impact.magnitude * 100}%`,
              background: `linear-gradient(90deg, ${conf.color}, color-mix(in srgb, ${conf.color} 60%, transparent))`,
            }} />
          </div>
        </div>
        {/* Confidence badge */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
          style={{ background: `color-mix(in srgb, ${conf.color} 10%, transparent)` }}>
          <div className="w-2 h-2 rounded-full" style={{ background: conf.color }} />
          <span className="text-[9px] font-bold" style={{ color: conf.color }}>
            Konfidenz: {conf.label}
          </span>
        </div>
      </div>

      {/* Chain (expandable) */}
      <button onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 mt-2 text-[9px] text-muted hover:text-main transition-colors">
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        Kausalkette anzeigen ({impact.chain.length} Schritte)
      </button>
      {expanded && (
        <div className="mt-2 p-2.5 rounded-lg bg-hover/30 border border-theme/30 space-y-1.5">
          <div className="text-[8px] font-bold text-muted uppercase tracking-wider mb-1">Ableitungskette</div>
          {impact.chain.map((link, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[9px]">
              <span className="font-semibold text-main truncate max-w-[120px]">{link.fromEntryTitle}</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold shrink-0"
                style={{ background: `color-mix(in srgb, ${accentHex} 12%, transparent)`, color: accentHex }}>
                →[{link.relationshipLabel}]→
              </span>
              <span className="font-semibold text-main truncate max-w-[120px]">{link.toEntryTitle}</span>
              <span className="text-[8px] font-mono text-muted ml-auto shrink-0">
                ×{link.attenuationFactor.toFixed(2)}
              </span>
            </div>
          ))}
          <div className="pt-1.5 border-t border-theme/30 text-[8px] text-muted font-mono">
            Endstärke: {impact.chain.map(l => l.attenuationFactor.toFixed(2)).join(' × ')} = {impact.magnitude.toFixed(3)}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ MAIN COMPONENT ═══
export default function ScenarioPlanner() {
  const region = useRegion();
  const store = useKnowledgeStore();
  const entries = useMemo(() => getEntriesForRegion(region.id), [region.id]);
  const allEntries = useMemo(() => KNOWLEDGE_BASE_ENTRIES, []);

  // Action builder state
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<ScenarioActionType>('remove-actor');
  const [params, setParams] = useState<ScenarioActionParams>({});
  const [actionLabel, setActionLabel] = useState('');

  // UI state
  const [showMethodology, setShowMethodology] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');

  const selectedEntry = selectedEntryId ? entries.find(e => e.id === selectedEntryId) ?? null : null;

  // Compute cascade
  const handleRunScenario = useCallback(() => {
    if (store.scenarioActions.length === 0) return;
    const result = computeCascade(store.scenarioActions, allEntries);
    store.setCascadeResult(result);
  }, [store, allEntries]);

  // Add action
  const handleAddAction = useCallback(() => {
    if (!selectedEntryId || !actionLabel.trim()) return;
    const action: ScenarioAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      entryId: selectedEntryId,
      actionType,
      params: { ...params },
      label: actionLabel.trim(),
    };
    store.addScenarioAction(action);
    setSelectedEntryId(null);
    setActionLabel('');
    setParams({});
    store.setCascadeResult(null); // invalidate old result
  }, [selectedEntryId, actionType, params, actionLabel, store]);

  // Navigate to entry
  const handleNavigate = useCallback((id: string) => {
    store.selectEntry(id);
    store.setViewMode('entries');
  }, [store]);

  // Template categories for current region
  const allTemplates = SCENARIO_TEMPLATES;

  // Impact stats
  const stats = useMemo(() => {
    const r = store.cascadeResult;
    if (!r || r.impacts.length === 0) return null;
    const d1 = r.impacts.filter(i => i.degree === 1).length;
    const d2 = r.impacts.filter(i => i.degree === 2).length;
    const d3 = r.impacts.filter(i => i.degree === 3).length;
    const stab = r.impacts.filter(i => i.impactType === 'stabilization').length;
    const destab = r.impacts.filter(i => i.impactType === 'destabilization' || i.impactType === 'spillover' || i.impactType === 'actor-vacuum').length;
    return { total: r.impacts.length, d1, d2, d3, stab, destab, avgConf: r.totalConfidenceScore };
  }, [store.cascadeResult]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-main">
      {/* ═══ TOOLBAR ═══ */}
      <div className="flex items-center gap-2 p-3 border-b border-theme bg-surface shrink-0">
        <Zap size={14} style={{ color: region.accentHex }} />
        <h2 className="font-display font-bold text-sm text-main">Szenario-Planer</h2>
        <span className="text-[9px] font-mono text-muted px-2 py-0.5 rounded bg-card border border-theme">
          "Was wäre wenn..."
        </span>

        <div className="flex-1" />

        {/* Template button */}
        <div className="relative">
          <button onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-card border border-theme text-muted hover:text-main transition-all">
            <FolderOpen size={11} />
            Vorlagen ({allTemplates.length})
          </button>
          {showTemplates && (
            <>
              <div className="fixed inset-0 z-[49]" onClick={() => setShowTemplates(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-theme rounded-xl shadow-xl w-80 max-h-80 overflow-hidden">
                <div className="p-2.5 border-b border-theme">
                  <div className="text-[10px] font-bold text-main">Szenario-Vorlagen</div>
                  <div className="text-[9px] text-muted">Vorgefertigte Szenarien zum Sofort-Testen</div>
                </div>
                <div className="overflow-y-auto max-h-60">
                  {allTemplates.map(tpl => (
                    <button key={tpl.id} onClick={() => { store.loadScenario(tpl); setShowTemplates(false); store.setCascadeResult(null); }}
                      className="w-full text-left px-3 py-2.5 border-b border-theme/20 hover:bg-hover/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-main">{tpl.name}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-card border border-theme/50 text-muted font-mono">
                          {tpl.templateCategory}
                        </span>
                      </div>
                      <p className="text-[9px] text-muted mt-0.5 line-clamp-2">{tpl.description}</p>
                      <div className="text-[8px] text-muted mt-0.5">{tpl.actions.length} Aktion(en)</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Save button */}
        {store.scenarioActions.length > 0 && (
          <button onClick={() => setSaveModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium text-white transition-all"
            style={{ background: region.accentHex }}>
            <Save size={11} /> Speichern
          </button>
        )}

        {/* Methodology button */}
        <button onClick={() => setShowMethodology(!showMethodology)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${showMethodology ? 'text-white' : 'text-muted border-theme hover:text-main'}`}
          style={showMethodology ? { background: region.accentHex, borderColor: region.accentHex } : undefined}>
          <Info size={11} /> Methodik
        </button>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT: Scenario Builder ─── */}
        <div className="w-80 shrink-0 border-r border-theme bg-surface overflow-y-auto p-3 space-y-3">
          <div className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={10} style={{ color: region.accentHex }} />
            Szenario erstellen
          </div>

          {/* Entry selector */}
          <EntrySelector entries={entries} selectedId={selectedEntryId} onSelect={setSelectedEntryId} accentHex={region.accentHex} label="Betroffener Eintrag" />

          {/* Action type */}
          {selectedEntryId && (
            <>
              <div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Aktion</div>
                <div className="grid grid-cols-2 gap-1">
                  {(Object.entries(ACTION_TYPE_CONFIG) as [ScenarioActionType, typeof ACTION_TYPE_CONFIG[ScenarioActionType]][]).map(([key, cfg]) => (
                    <button key={key} onClick={() => setActionType(key)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-medium border transition-all text-left ${actionType === key ? 'text-white' : 'text-muted border-theme/50 hover:border-theme'}`}
                      style={actionType === key ? { background: cfg.color, borderColor: cfg.color } : undefined}>
                      <span>{cfg.icon}</span>
                      <span className="truncate">{cfg.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-muted mt-1.5 leading-relaxed">{ACTION_TYPE_CONFIG[actionType].description}</p>
              </div>

              {/* Parameters */}
              <div className="space-y-2">
                {(actionType === 'status-change') && (
                  <div>
                    <div className="text-[9px] font-medium text-muted mb-1">Neuer Status</div>
                    <select value={params.newStatus ?? ''} onChange={e => setParams({ ...params, newStatus: e.target.value as KBStatus })}
                      className="w-full text-[10px] px-2 py-1.5 rounded-lg bg-card border border-theme text-main">
                      <option value="">Auswählen...</option>
                      {(['active', 'escalating', 'frozen', 'resolved', 'historical'] as KBStatus[]).map(s => (
                        <option key={s} value={s}>{KB_STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(actionType === 'severity-change') && (
                  <div>
                    <div className="text-[9px] font-medium text-muted mb-1">
                      Neuer Schweregrad {selectedEntry && <span className="font-mono">(aktuell: {selectedEntry.severity}/5)</span>}
                    </div>
                    <div className="flex gap-1">
                      {([1, 2, 3, 4, 5] as const).map(s => (
                        <button key={s} onClick={() => setParams({ ...params, newSeverity: s })}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all"
                          style={params.newSeverity === s
                            ? { background: KB_SEVERITY_CONFIG[s].color, borderColor: KB_SEVERITY_CONFIG[s].color, color: 'white' }
                            : { borderColor: 'var(--border)', color: KB_SEVERITY_CONFIG[s].color }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(actionType === 'escalation') && (
                  <div>
                    <div className="text-[9px] font-medium text-muted mb-1">Eskalation um</div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(d => (
                        <button key={d} onClick={() => setParams({ ...params, severityDelta: d })}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all"
                          style={params.severityDelta === d
                            ? { background: '#ef4444', borderColor: '#ef4444', color: 'white' }
                            : { borderColor: 'var(--border)', color: '#ef4444' }}>
                          +{d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Label */}
                <div>
                  <div className="text-[9px] font-medium text-muted mb-1">Beschreibung der Aktion</div>
                  <input value={actionLabel} onChange={e => setActionLabel(e.target.value)}
                    placeholder="z.B. 'Wagner zieht aus Mali ab'"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-theme text-[10px] text-main placeholder:text-muted focus:outline-none"
                    style={{ borderColor: actionLabel ? `color-mix(in srgb, ${region.accentHex} 40%, var(--border))` : undefined }} />
                </div>

                {/* Add button */}
                <button onClick={handleAddAction}
                  disabled={!actionLabel.trim()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-medium text-white disabled:opacity-40 transition-all"
                  style={{ background: region.accentHex }}>
                  <Plus size={11} /> Aktion hinzufügen
                </button>
              </div>
            </>
          )}

          {/* Current actions list */}
          {store.scenarioActions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Aktionen ({store.scenarioActions.length})</span>
                <button onClick={() => store.clearScenarioActions()} className="text-[9px] text-red-400 hover:text-red-300">
                  Alle löschen
                </button>
              </div>
              <div className="space-y-1.5">
                {store.scenarioActions.map((action) => {
                  const cfg = ACTION_TYPE_CONFIG[action.actionType];
                  const entry = entries.find(e => e.id === action.entryId);
                  return (
                    <div key={action.id} className="flex items-start gap-2 p-2 rounded-lg border border-theme/50 bg-card/50 group">
                      <span className="text-sm mt-0.5">{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-main">{action.label}</div>
                        <div className="text-[8px] text-muted">
                          {entry?.title ?? action.entryId} · {cfg.label}
                        </div>
                      </div>
                      <button onClick={() => { store.removeScenarioAction(action.id); store.setCascadeResult(null); }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all shrink-0">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Run button */}
              <button onClick={handleRunScenario}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold text-white mt-3 transition-all hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${region.accentHex}, color-mix(in srgb, ${region.accentHex} 80%, #000))` }}>
                <Play size={13} />
                Szenario berechnen
              </button>
            </div>
          )}

          {/* Saved scenarios */}
          {store.savedScenarios.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Gespeicherte Szenarien</div>
              <div className="space-y-1">
                {store.savedScenarios.map(sc => (
                  <div key={sc.id} className="flex items-center gap-2 p-2 rounded-lg border border-theme/50 bg-card/50 group">
                    <BookOpen size={11} className="text-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <button onClick={() => { store.loadScenario(sc); store.setCascadeResult(null); }}
                        className="text-[10px] font-semibold text-main hover:underline truncate block">{sc.name}</button>
                      <div className="text-[8px] text-muted">{sc.actions.length} Aktionen</div>
                    </div>
                    <button onClick={() => store.deleteScenario(sc.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all shrink-0">
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── CENTER: Impact Cascade ─── */}
        <div className="flex-1 overflow-y-auto p-4">
          {store.cascadeResult && store.cascadeResult.impacts.length > 0 ? (
            <div className="space-y-3 max-w-3xl">
              {/* Result header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${region.accentHex} 15%, transparent)` }}>
                  <Zap size={18} style={{ color: region.accentHex }} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-main">Kaskadenanalyse</h3>
                  <p className="text-[10px] text-muted">
                    {store.cascadeResult.impacts.length} prognostizierte Auswirkungen aus {store.scenarioActions.length} Aktion(en)
                  </p>
                </div>
              </div>

              {/* Impact cards */}
              {store.cascadeResult.impacts.map(impact => (
                <ImpactCard key={impact.entryId} impact={impact} accentHex={region.accentHex} onNavigate={handleNavigate} />
              ))}
            </div>
          ) : store.cascadeResult && store.cascadeResult.impacts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <Shield size={40} className="mx-auto mb-3 opacity-20 text-muted" />
                <h3 className="font-display font-bold text-sm text-main mb-1">Keine Kaskadeneffekte</h3>
                <p className="text-[10px] text-muted leading-relaxed">
                  Die gewählten Aktionen erzeugen keine messbaren Auswirkungen auf andere Einträge im Wissensgraph.
                  Dies kann an fehlenden Querverweisen oder zu geringer Signalstärke liegen.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <Zap size={48} className="mx-auto mb-4 opacity-15 text-muted" />
                <h3 className="font-display font-bold text-base text-main mb-2">Szenario-Planer</h3>
                <p className="text-xs text-muted leading-relaxed mb-4">
                  Erstelle ein "Was wäre wenn"-Szenario: Wähle Einträge aus, definiere hypothetische Änderungen
                  und berechne die Kaskadeneffekte über den Wissensgraph.
                </p>
                <p className="text-[10px] text-muted leading-relaxed mb-4">
                  Jede Vorhersage ist vollständig transparent — du siehst die exakte Kausalkette,
                  Gewichtung und Konfidenzbewertung hinter jedem prognostizierten Effekt.
                </p>
                <div className="flex items-center justify-center gap-3 text-[10px] text-muted">
                  <span className="flex items-center gap-1"><Zap size={10} /> Aktionen definieren</span>
                  <span>→</span>
                  <span className="flex items-center gap-1"><Play size={10} /> Berechnen</span>
                  <span>→</span>
                  <span className="flex items-center gap-1"><BarChart3 size={10} /> Kaskaden sehen</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: Summary & Methodology ─── */}
        <div className="w-64 shrink-0 border-l border-theme bg-surface overflow-y-auto p-3 space-y-3">
          {/* Stats */}
          {stats && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Ergebnis-Übersicht</div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-2 rounded-lg bg-card/50 border border-theme/50 text-center">
                  <div className="text-lg font-bold font-mono" style={{ color: region.accentHex }}>{stats.total}</div>
                  <div className="text-[8px] text-muted">Effekte gesamt</div>
                </div>
                <div className="p-2 rounded-lg bg-card/50 border border-theme/50 text-center">
                  <div className="text-lg font-bold font-mono" style={{ color: getConfidenceLevel(stats.avgConf).color }}>
                    {Math.round(stats.avgConf * 100)}%
                  </div>
                  <div className="text-[8px] text-muted">⌀ Konfidenz</div>
                </div>
              </div>

              {/* By degree */}
              <div className="p-2.5 rounded-xl bg-card/50 border border-theme/50">
                <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-2">Nach Grad</div>
                {[
                  { label: '1. Grad (Direkt)', count: stats.d1, color: '#22c55e' },
                  { label: '2. Grad (Sekundär)', count: stats.d2, color: '#f59e0b' },
                  { label: '3. Grad (Tertiär)', count: stats.d3, color: '#ef4444' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: row.color }} />
                      <span className="text-[9px] text-muted">{row.label}</span>
                    </div>
                    <span className="text-[10px] font-bold font-mono" style={{ color: row.color }}>{row.count}</span>
                  </div>
                ))}
              </div>

              {/* Stab vs destab */}
              <div className="p-2.5 rounded-xl bg-card/50 border border-theme/50">
                <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-2">Richtung</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-center p-1.5 rounded-lg bg-red-500/8 border border-red-500/15">
                    <TrendingUp size={14} className="mx-auto text-red-400 mb-0.5" />
                    <div className="text-sm font-bold font-mono text-red-400">{stats.destab}</div>
                    <div className="text-[8px] text-muted">Negativ</div>
                  </div>
                  <div className="flex-1 text-center p-1.5 rounded-lg bg-green-500/8 border border-green-500/15">
                    <TrendingDown size={14} className="mx-auto text-green-400 mb-0.5" />
                    <div className="text-sm font-bold font-mono text-green-400">{stats.stab}</div>
                    <div className="text-[8px] text-muted">Positiv</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confidence legend */}
          <div className="p-2.5 rounded-xl bg-card/50 border border-theme/50">
            <div className="text-[9px] font-bold text-muted uppercase tracking-wider mb-2">Konfidenz-Legende</div>
            {Object.entries(CONFIDENCE_LEVELS).map(([key, lvl]) => (
              <div key={key} className="flex items-start gap-2 py-1">
                <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: lvl.color }} />
                <div>
                  <div className="text-[9px] font-bold" style={{ color: lvl.color }}>{lvl.label} (≥{Math.round(lvl.min * 100)}%)</div>
                  <div className="text-[8px] text-muted leading-relaxed">{lvl.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Methodology */}
          {showMethodology && (
            <div className="p-2.5 rounded-xl bg-card/50 border border-theme/50 space-y-3 anim-fade-up">
              <div className="text-[10px] font-bold text-main flex items-center gap-1.5">
                <Info size={11} style={{ color: region.accentHex }} />
                Methodik
              </div>

              <div>
                <div className="text-[8px] font-bold text-muted uppercase tracking-wider mb-1">Algorithmus</div>
                <p className="text-[9px] text-muted leading-relaxed">
                  Gewichtete Breitensuche (BFS) auf dem Querverweisungs-Graph der Wissensdatenbank.
                  Maximal 3 Propagationsstufen. Rauschfilter bei {NOISE_THRESHOLD * 100}% Mindeststärke.
                </p>
              </div>

              <div>
                <div className="text-[8px] font-bold text-muted uppercase tracking-wider mb-1">Beziehungs-Gewichte</div>
                <div className="space-y-0.5">
                  {Object.entries(RELATIONSHIP_WEIGHTS).sort(([, a], [, b]) => b - a).map(([rel, w]) => (
                    <div key={rel} className="flex items-center justify-between">
                      <span className="text-[9px] text-muted">{RELATION_LABELS_DE[rel] ?? rel}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 rounded-full bg-hover/50 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${w * 100}%`, background: region.accentHex }} />
                        </div>
                        <span className="text-[8px] font-mono font-bold text-muted w-6 text-right">{w.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[8px] font-bold text-muted uppercase tracking-wider mb-1">Abschwächung nach Grad</div>
                <div className="space-y-0.5">
                  {Object.entries(DEGREE_ATTENUATION).map(([deg, att]) => (
                    <div key={deg} className="flex items-center justify-between">
                      <span className="text-[9px] text-muted">{deg}. Grad</span>
                      <span className="text-[9px] font-mono font-bold" style={{ color: region.accentHex }}>×{att.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[8px] font-bold text-muted uppercase tracking-wider mb-1">Konfidenz-Formel</div>
                <p className="text-[9px] text-muted leading-relaxed font-mono">
                  conf = degreeBase × (0.5 + 0.5 × Π(chainWeights))
                </p>
                <p className="text-[8px] text-muted mt-0.5">
                  Grad-Basis: 1.=0.9, 2.=0.6, 3.=0.3. Multipliziert mit der durchschnittlichen Kettengewichtung.
                </p>
              </div>

              <div>
                <div className="text-[8px] font-bold text-muted uppercase tracking-wider mb-1">Gegnerschafts-Logik</div>
                <p className="text-[9px] text-muted leading-relaxed">
                  "Opposed"-Beziehungen erzeugen inverse Effekte: Die Schwächung einer Seite wird als potentielle Stärkung der Gegenseite propagiert.
                </p>
              </div>

              <div className="pt-2 border-t border-theme/30">
                <p className="text-[8px] text-muted leading-relaxed italic">
                  Hinweis: Diese Analyse basiert ausschließlich auf den dokumentierten Querverweisen in der Wissensdatenbank.
                  Nicht erfasste Beziehungen werden nicht berücksichtigt. Alle Gewichte sind deterministisch und transparent.
                </p>
              </div>
            </div>
          )}

          {!stats && !showMethodology && (
            <div className="text-center py-6">
              <Info size={20} className="mx-auto mb-2 opacity-20 text-muted" />
              <p className="text-[10px] text-muted leading-relaxed">
                Erstelle ein Szenario und berechne die Kaskadeneffekte um hier eine Übersicht zu sehen.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ SAVE MODAL ═══ */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60" onClick={() => setSaveModalOpen(false)}>
          <div className="bg-surface border border-theme rounded-2xl p-5 w-[420px] max-w-[90vw] anim-fade-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-sm mb-3">Szenario speichern</h3>
            <div className="space-y-3">
              <input value={saveName} onChange={e => setSaveName(e.target.value)}
                placeholder="Szenario-Name..."
                className="w-full px-3 py-2 rounded-lg bg-card border border-theme text-xs text-main placeholder:text-muted focus:outline-none" />
              <textarea value={saveDesc} onChange={e => setSaveDesc(e.target.value)}
                placeholder="Beschreibung (optional)..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-card border border-theme text-xs text-main placeholder:text-muted focus:outline-none resize-none" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setSaveModalOpen(false)} className="px-3 py-1.5 rounded-lg text-xs text-muted hover:text-main">Abbrechen</button>
              <button onClick={() => {
                if (saveName.trim()) {
                  store.saveScenario(saveName.trim(), saveDesc.trim());
                  setSaveModalOpen(false);
                  setSaveName('');
                  setSaveDesc('');
                }
              }}
                disabled={!saveName.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40"
                style={{ background: region.accentHex }}>
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
