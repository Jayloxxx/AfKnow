import { useState } from 'react';
import { Plus, Trash2, Edit3, ChevronRight, Calendar } from 'lucide-react';
import { useIntelStore } from '../../store/useIntelStore';
import { useStore } from '../../store/useStore';
import { useRegion } from '../../context/RegionContext';
import type { DailyBriefing } from '../../types/intel';

export default function BriefingList() {
  const { briefings, saveBriefing, removeBriefing } = useIntelStore();
  const { user } = useStore();
  const region = useRegion();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleNew = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const existing = briefings.find(b => b.date === today);
    if (existing) {
      setEditingId(existing.id);
      setExpandedId(existing.id);
      return;
    }
    const id = crypto.randomUUID();
    await saveBriefing(user.id, {
      id,
      date: today,
      title: `Lagebriefing ${new Date().toLocaleDateString('de-DE')}`,
      priorityAlerts: '',
      situationUpdates: '',
      trendAnalysis: '',
      mosaicUpdates: '',
      forecast: '',
    });
    setEditingId(id);
    setExpandedId(id);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Daily Briefings ({briefings.length})</h3>
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all"
          style={{
            background: `color-mix(in srgb, ${region.accentHex} 15%, transparent)`,
            border: `1px solid color-mix(in srgb, ${region.accentHex} 30%, transparent)`,
            color: region.accentHex,
          }}
        >
          <Plus size={12} /> Heutiges Briefing
        </button>
      </div>

      {briefings.length === 0 ? (
        <div className="text-center text-muted text-sm py-12">
          Noch keine Briefings. Erstelle das erste tägliche Lagebriefing!
        </div>
      ) : (
        <div className="space-y-2">
          {briefings.map(b => (
            <BriefingCard
              key={b.id}
              briefing={b}
              region={region}
              isExpanded={expandedId === b.id}
              isEditing={editingId === b.id}
              onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)}
              onEdit={() => setEditingId(editingId === b.id ? null : b.id)}
              onSave={async (updated) => {
                if (user) await saveBriefing(user.id, updated);
                setEditingId(null);
              }}
              onDelete={() => { if (confirm('Briefing löschen?')) removeBriefing(b.id); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BriefingCard({ briefing, region, isExpanded, isEditing, onToggle, onEdit, onSave, onDelete }: {
  briefing: DailyBriefing;
  region: any;
  isExpanded: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onSave: (b: Partial<DailyBriefing> & { id: string }) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(briefing.title);
  const [priorityAlerts, setPriorityAlerts] = useState(briefing.priorityAlerts);
  const [situationUpdates, setSituationUpdates] = useState(briefing.situationUpdates);
  const [trendAnalysis, setTrendAnalysis] = useState(briefing.trendAnalysis);
  const [mosaicUpdates, setMosaicUpdates] = useState(briefing.mosaicUpdates);
  const [forecast, setForecast] = useState(briefing.forecast);

  const inputCls = "w-full px-3 py-1.5 text-[12px] rounded-lg bg-card border border-theme text-main focus:outline-none";
  const labelCls = "text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block";

  const handleSave = () => {
    onSave({ id: briefing.id, date: briefing.date, title, priorityAlerts, situationUpdates, trendAnalysis, mosaicUpdates, forecast });
  };

  return (
    <div className="bg-card border border-theme rounded-lg overflow-hidden anim-fade-up">
      <div className="p-3 cursor-pointer flex items-center gap-3" onClick={onToggle}>
        <Calendar size={14} style={{ color: region.accentHex }} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-main truncate">{briefing.title || briefing.date}</h4>
          <span className="text-[10px] text-muted">{new Date(briefing.date).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={e => { e.stopPropagation(); onEdit(); }} className="p-1 rounded hover:bg-hover text-muted hover:text-main">
            <Edit3 size={13} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1 rounded hover:bg-hover text-muted hover:text-red-400">
            <Trash2 size={13} />
          </button>
          <ChevronRight size={14} className={`text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-theme p-3 bg-surface space-y-3">
          {isEditing ? (
            <>
              <div>
                <label className={labelCls}>Titel</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Priority Alerts (Severity 4-5)</label>
                <textarea value={priorityAlerts} onChange={e => setPriorityAlerts(e.target.value)} className={inputCls} rows={3} placeholder="Kritische Meldungen..." />
              </div>
              <div>
                <label className={labelCls}>Situation Updates</label>
                <textarea value={situationUpdates} onChange={e => setSituationUpdates(e.target.value)} className={inputCls} rows={4} placeholder="Regionale Entwicklungen..." />
              </div>
              <div>
                <label className={labelCls}>Trend-Analyse</label>
                <textarea value={trendAnalysis} onChange={e => setTrendAnalysis(e.target.value)} className={inputCls} rows={3} placeholder="Eskalierend / De-eskalierend..." />
              </div>
              <div>
                <label className={labelCls}>Mosaik-Updates</label>
                <textarea value={mosaicUpdates} onChange={e => setMosaicUpdates(e.target.value)} className={inputCls} rows={3} placeholder="Welche Events wurden aktualisiert..." />
              </div>
              <div>
                <label className={labelCls}>Forecast (7-Tage)</label>
                <textarea value={forecast} onChange={e => setForecast(e.target.value)} className={inputCls} rows={3} placeholder="Ausblick..." />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => onEdit()} className="px-3 py-1 text-[11px] rounded-lg bg-card border border-theme text-muted">Abbrechen</button>
                <button onClick={handleSave} className="px-3 py-1 text-[11px] rounded-lg font-medium"
                  style={{ background: `color-mix(in srgb, ${region.accentHex} 20%, transparent)`, border: `1px solid color-mix(in srgb, ${region.accentHex} 40%, transparent)`, color: region.accentHex }}>
                  Speichern
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3 text-[11px]">
              {briefing.priorityAlerts && (
                <div>
                  <h5 className={labelCls} style={{ color: '#ef4444' }}>Priority Alerts</h5>
                  <p className="text-main whitespace-pre-wrap">{briefing.priorityAlerts}</p>
                </div>
              )}
              {briefing.situationUpdates && (
                <div>
                  <h5 className={labelCls}>Situation Updates</h5>
                  <p className="text-main whitespace-pre-wrap">{briefing.situationUpdates}</p>
                </div>
              )}
              {briefing.trendAnalysis && (
                <div>
                  <h5 className={labelCls}>Trend-Analyse</h5>
                  <p className="text-main whitespace-pre-wrap">{briefing.trendAnalysis}</p>
                </div>
              )}
              {briefing.mosaicUpdates && (
                <div>
                  <h5 className={labelCls}>Mosaik-Updates</h5>
                  <p className="text-main whitespace-pre-wrap">{briefing.mosaicUpdates}</p>
                </div>
              )}
              {briefing.forecast && (
                <div>
                  <h5 className={labelCls}>Forecast</h5>
                  <p className="text-main whitespace-pre-wrap">{briefing.forecast}</p>
                </div>
              )}
              {!briefing.priorityAlerts && !briefing.situationUpdates && !briefing.trendAnalysis && (
                <p className="text-muted italic">Noch kein Inhalt. Klicke auf Bearbeiten.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
