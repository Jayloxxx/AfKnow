import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useIntelStore } from '../../store/useIntelStore';
import { useRegion } from '../../context/RegionContext';
import { CATEGORY_CONFIG, VERIFICATION_CONFIG, SEVERITY_CONFIG, SOURCE_TYPES } from '../../types/intel';
import type { IntelCategory, VerificationStatus, Severity, SourceType } from '../../types/intel';

export default function IntelReportForm({ onClose }: { onClose: () => void }) {
  const { user } = useStore();
  const { editingReport, saveReport } = useIntelStore();
  const region = useRegion();
  const isEdit = !!editingReport;

  const [title, setTitle] = useState(editingReport?.title ?? '');
  const [content, setContent] = useState(editingReport?.content ?? '');
  const [sourceType, setSourceType] = useState<SourceType>(editingReport?.sourceType ?? 'manual');
  const [sourceName, setSourceName] = useState(editingReport?.sourceName ?? '');
  const [sourceUrl, setSourceUrl] = useState(editingReport?.sourceUrl ?? '');
  const [category, setCategory] = useState<IntelCategory>(editingReport?.category ?? 'security');
  const [severity, setSeverity] = useState<Severity>(editingReport?.severity ?? 3);
  const [verification, setVerification] = useState<VerificationStatus>(editingReport?.verificationStatus ?? 'unconfirmed');
  const [regionField, setRegionField] = useState(editingReport?.region ?? '');
  const [locationLabel, setLocationLabel] = useState(editingReport?.locationLabel ?? '');
  const [latitude, setLatitude] = useState(editingReport?.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(editingReport?.longitude?.toString() ?? '');
  const [tags, setTags] = useState(editingReport?.tags?.join(', ') ?? '');
  const [analystNotes, setAnalystNotes] = useState(editingReport?.analystNotes ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !title.trim() || !content.trim()) return;
    setSaving(true);
    await saveReport(user.id, {
      id: editingReport?.id ?? crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      sourceType,
      sourceName: sourceName.trim(),
      sourceUrl: sourceUrl.trim(),
      category,
      severity,
      verificationStatus: verification,
      region: regionField.trim(),
      countryIds: [],
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      locationLabel: locationLabel.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      analystNotes: analystNotes.trim(),
    });
    setSaving(false);
    onClose();
  };

  const inputCls = "w-full px-3 py-1.5 text-[12px] rounded-lg bg-card border border-theme text-main focus:outline-none focus:border-opacity-80";
  const labelCls = "text-[11px] font-medium text-muted mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-surface border border-theme rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col anim-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-theme">
          <h2 className="font-display font-semibold text-sm text-main">
            {isEdit ? 'Report bearbeiten' : 'Neuer Intel Report'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-hover text-muted"><X size={16} /></button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div>
            <label className={labelCls}>Titel *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="Kurze Beschreibung der Meldung" />
          </div>

          <div>
            <label className={labelCls}>Inhalt *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} className={inputCls} rows={4} placeholder="Detaillierte Beschreibung..." />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Kategorie</label>
              <select value={category} onChange={e => setCategory(e.target.value as IntelCategory)} className={inputCls}>
                {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Severity</label>
              <select value={severity} onChange={e => setSeverity(Number(e.target.value) as Severity)} className={inputCls}>
                {([1, 2, 3, 4, 5] as Severity[]).map(s => <option key={s} value={s}>{SEVERITY_CONFIG[s].label} ({s})</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Verifikation</label>
              <select value={verification} onChange={e => setVerification(e.target.value as VerificationStatus)} className={inputCls}>
                {Object.entries(VERIFICATION_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Quellentyp</label>
              <select value={sourceType} onChange={e => setSourceType(e.target.value as SourceType)} className={inputCls}>
                {SOURCE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Quellenname</label>
              <input value={sourceName} onChange={e => setSourceName(e.target.value)} className={inputCls} placeholder="z.B. @user, Reuters" />
            </div>
            <div>
              <label className={labelCls}>Quellen-URL</label>
              <input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} className={inputCls} placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Region</label>
              <input value={regionField} onChange={e => setRegionField(e.target.value)} className={inputCls} placeholder="z.B. Sahel, Horn of Africa" />
            </div>
            <div>
              <label className={labelCls}>Ort</label>
              <input value={locationLabel} onChange={e => setLocationLabel(e.target.value)} className={inputCls} placeholder="z.B. Khartoum, Sudan" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Breitengrad</label>
              <input value={latitude} onChange={e => setLatitude(e.target.value)} className={inputCls} placeholder="z.B. 15.5007" type="number" step="any" />
            </div>
            <div>
              <label className={labelCls}>Längengrad</label>
              <input value={longitude} onChange={e => setLongitude(e.target.value)} className={inputCls} placeholder="z.B. 32.5599" type="number" step="any" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Tags (kommagetrennt)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} className={inputCls} placeholder="z.B. RSF, Wagner, Coup" />
          </div>

          <div>
            <label className={labelCls}>Analysten-Notiz</label>
            <textarea value={analystNotes} onChange={e => setAnalystNotes(e.target.value)} className={inputCls} rows={2} placeholder="Eigene Bewertung, Kontext..." />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-theme">
          <button onClick={onClose} className="px-4 py-1.5 text-[12px] rounded-lg bg-card border border-theme text-muted hover:text-main transition-colors">
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim() || saving}
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
