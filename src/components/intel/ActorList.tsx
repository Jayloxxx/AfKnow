import { useState } from 'react';
import { Plus, Trash2, Edit3, X, Users } from 'lucide-react';
import { useIntelStore } from '../../store/useIntelStore';
import { useStore } from '../../store/useStore';
import { useRegion } from '../../context/RegionContext';
import type { IntelActor, ActorType } from '../../types/intel';

const ACTOR_TYPES: { value: ActorType; label: string }[] = [
  { value: 'state', label: 'Staat' },
  { value: 'military', label: 'Militär' },
  { value: 'militia', label: 'Miliz' },
  { value: 'terrorist', label: 'Terrororganisation' },
  { value: 'political_party', label: 'Partei' },
  { value: 'ngo', label: 'NGO' },
  { value: 'igo', label: 'IGO (UN, AU, etc.)' },
  { value: 'corporation', label: 'Unternehmen' },
  { value: 'individual', label: 'Einzelperson' },
  { value: 'organization', label: 'Organisation' },
  { value: 'other', label: 'Sonstiges' },
];

export default function ActorList() {
  const { actors, actorEventLinks, saveActor, removeActor } = useIntelStore();
  const { user } = useStore();
  const region = useRegion();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IntelActor | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<ActorType>('organization');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');
  const [tags, setTags] = useState('');

  const resetForm = () => { setName(''); setType('organization'); setDescription(''); setCountry(''); setTags(''); setEditing(null); };

  const startEdit = (a: IntelActor) => {
    setEditing(a);
    setName(a.name);
    setType(a.type);
    setDescription(a.description);
    setCountry(a.country);
    setTags(a.tags.join(', '));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user || !name.trim()) return;
    await saveActor(user.id, {
      id: editing?.id ?? crypto.randomUUID(),
      name: name.trim(),
      type,
      description: description.trim(),
      country: country.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    resetForm();
    setShowForm(false);
  };

  const getLinkedEventCount = (actorId: string) =>
    actorEventLinks.filter(l => l.actorId === actorId).length;

  const getTypeLabel = (t: ActorType) => ACTOR_TYPES.find(at => at.value === t)?.label ?? t;

  const inputCls = "w-full px-3 py-1.5 text-[12px] rounded-lg bg-card border border-theme text-main focus:outline-none";
  const labelCls = "text-[11px] font-medium text-muted mb-1 block";

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Akteure ({actors.length})</h3>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all"
          style={{
            background: `color-mix(in srgb, ${region.accentHex} 15%, transparent)`,
            border: `1px solid color-mix(in srgb, ${region.accentHex} 30%, transparent)`,
            color: region.accentHex,
          }}
        >
          {showForm ? <><X size={12} /> Schließen</> : <><Plus size={12} /> Akteur</>}
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="bg-card border border-theme rounded-lg p-3 mb-4 space-y-2 anim-fade-up">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="z.B. RSF, Wagner Group" />
            </div>
            <div>
              <label className={labelCls}>Typ</label>
              <select value={type} onChange={e => setType(e.target.value as ActorType)} className={inputCls}>
                {ACTOR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Land/Basis</label>
              <input value={country} onChange={e => setCountry(e.target.value)} className={inputCls} placeholder="z.B. Sudan" />
            </div>
            <div>
              <label className={labelCls}>Tags</label>
              <input value={tags} onChange={e => setTags(e.target.value)} className={inputCls} placeholder="kommagetrennt" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Beschreibung</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className={inputCls} rows={2} />
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={!name.trim()}
              className="px-3 py-1 text-[11px] rounded-lg font-medium disabled:opacity-40"
              style={{ background: `color-mix(in srgb, ${region.accentHex} 20%, transparent)`, border: `1px solid color-mix(in srgb, ${region.accentHex} 40%, transparent)`, color: region.accentHex }}>
              {editing ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </div>
      )}

      {/* Actor Grid */}
      {actors.length === 0 ? (
        <div className="text-center text-muted text-sm py-12">
          Noch keine Akteure erfasst.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {actors.map(a => {
            const eventCount = getLinkedEventCount(a.id);
            return (
              <div key={a.id} className="bg-card border border-theme rounded-lg p-3 hover:border-opacity-60 transition-all anim-fade-up">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="text-sm font-semibold text-main">{a.name}</h4>
                    <span className="text-[10px] text-muted">{getTypeLabel(a.type)}{a.country ? ` — ${a.country}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(a)} className="p-1 rounded hover:bg-hover text-muted hover:text-main">
                      <Edit3 size={12} />
                    </button>
                    <button onClick={() => { if (confirm('Akteur löschen?')) removeActor(a.id); }}
                      className="p-1 rounded hover:bg-hover text-muted hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {a.description && <p className="text-[10px] text-muted mb-1.5 line-clamp-2">{a.description}</p>}
                <div className="flex items-center gap-2">
                  {eventCount > 0 && (
                    <span className="text-[9px] text-muted flex items-center gap-1">
                      <Users size={10} /> {eventCount} Events
                    </span>
                  )}
                  {a.tags.map(t => (
                    <span key={t} className="text-[9px] px-1 py-0.5 rounded bg-hover text-muted">#{t}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
