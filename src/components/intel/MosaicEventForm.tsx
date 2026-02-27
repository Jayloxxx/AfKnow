import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useIntelStore } from '../../store/useIntelStore';
import { useRegion } from '../../context/RegionContext';
import { CATEGORY_CONFIG, SEVERITY_CONFIG, TREND_CONFIG } from '../../types/intel';
import type { IntelCategory, Severity, TrendDirection, EventStatus } from '../../types/intel';

const EVENT_STATUSES: { value: EventStatus; label: string }[] = [
  { value: 'active', label: 'Aktiv' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'resolved', label: 'Abgeschlossen' },
  { value: 'archived', label: 'Archiviert' },
];

export default function MosaicEventForm({ onClose }: { onClose: () => void }) {
  const { user } = useStore();
  const { editingEvent, saveEvent } = useIntelStore();
  const region = useRegion();
  const isEdit = !!editingEvent;

  const [title, setTitle] = useState(editingEvent?.title ?? '');
  const [description, setDescription] = useState(editingEvent?.description ?? '');
  const [category, setCategory] = useState<IntelCategory>(editingEvent?.category ?? 'security');
  const [status, setStatus] = useState<EventStatus>(editingEvent?.status ?? 'active');
  const [trend, setTrend] = useState<TrendDirection>(editingEvent?.trend ?? 'stable');
  const [severity, setSeverity] = useState<Severity>(editingEvent?.severity ?? 3);
  const [regionField, setRegionField] = useState(editingEvent?.region ?? '');
  const [startedAt, setStartedAt] = useState(editingEvent?.startedAt?.split('T')[0] ?? '');
  const [tags, setTags] = useState(editingEvent?.tags?.join(', ') ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !title.trim()) return;
    setSaving(true);
    await saveEvent(user.id, {
      id: editingEvent?.id ?? crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      trend,
      severity,
      region: regionField.trim(),
      countryIds: [],
      startedAt: startedAt || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setSaving(false);
    onClose();
  };

  const inputCls = "w-full px-3 py-1.5 text-[12px] rounded-lg bg-card border border-theme text-main focus:outline-none";
  const labelCls = "text-[11px] font-medium text-muted mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-surface border border-theme rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col anim-fade-up">
        <div className="flex items-center justify-between px-5 py-3 border-b border-theme">
          <h2 className="font-display font-semibold text-sm text-main">
            {isEdit ? 'Event bearbeiten' : 'Neues Mosaik-Event'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-hover text-muted"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div>
            <label className={labelCls}>Titel *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="z.B. Sudan Civil War" />
          </div>

          <div>
            <label className={labelCls}>Beschreibung</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className={inputCls} rows={3} placeholder="Kontext und Hintergrund..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kategorie</label>
              <select value={category} onChange={e => setCategory(e.target.value as IntelCategory)} className={inputCls}>
                {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as EventStatus)} className={inputCls}>
                {EVENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Trend</label>
              <select value={trend} onChange={e => setTrend(e.target.value as TrendDirection)} className={inputCls}>
                {Object.entries(TREND_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Severity</label>
              <select value={severity} onChange={e => setSeverity(Number(e.target.value) as Severity)} className={inputCls}>
                {([1, 2, 3, 4, 5] as Severity[]).map(s => <option key={s} value={s}>{SEVERITY_CONFIG[s].label} ({s})</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Region</label>
              <input value={regionField} onChange={e => setRegionField(e.target.value)} className={inputCls} placeholder="z.B. Sahel" />
            </div>
            <div>
              <label className={labelCls}>Beginn-Datum</label>
              <input type="date" value={startedAt} onChange={e => setStartedAt(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Tags (kommagetrennt)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} className={inputCls} placeholder="z.B. Bürgerkrieg, RSF, SAF" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-theme">
          <button onClick={onClose} className="px-4 py-1.5 text-[12px] rounded-lg bg-card border border-theme text-muted hover:text-main transition-colors">
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="px-4 py-1.5 text-[12px] rounded-lg font-medium transition-all disabled:opacity-40"
            style={{
              background: `color-mix(in srgb, ${region.accentHex} 20%, transparent)`,
              border: `1px solid color-mix(in srgb, ${region.accentHex} 40%, transparent)`,
              color: region.accentHex,
            }}
          >
            {saving ? 'Speichern...' : isEdit ? 'Aktualisieren' : 'Erstellen'}
          </button>
        </div>
      </div>
    </div>
  );
}
