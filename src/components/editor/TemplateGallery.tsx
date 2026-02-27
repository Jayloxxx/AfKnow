import { X, Map as MapIcon, Compass, Target, Crosshair, FileX, Trash2 } from 'lucide-react';
import { BUILTIN_TEMPLATES, TEMPLATE_CATEGORY_LABELS, type MapTemplate } from './templates';

interface Props {
  onClose: () => void;
  onSelect: (template: MapTemplate) => void;
  userTemplates: MapTemplate[];
  onDeleteUserTemplate?: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, typeof MapIcon> = {
  situation: MapIcon,
  movement: Compass,
  recon: Target,
  planning: Crosshair,
  blank: FileX,
  user: MapIcon,
};

const CATEGORY_COLORS: Record<string, string> = {
  situation: '#22c55e',
  movement: '#ef4444',
  recon: '#f59e0b',
  planning: '#8b5cf6',
  blank: '#6b7280',
  user: '#3b82f6',
};

export default function TemplateGallery({ onClose, onSelect, userTemplates, onDeleteUserTemplate }: Props) {
  const allTemplates = [...BUILTIN_TEMPLATES, ...userTemplates];
  const categories = [...new Set(allTemplates.map(t => t.category))];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
        borderRadius: 16, padding: 0, width: 640, maxWidth: '90vw', maxHeight: '80vh',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--ed-border)',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ed-text)', fontFamily: 'var(--font-display)', margin: 0 }}>
            Kartenvorlage wählen
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ed-text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {categories.map(cat => {
            const templates = allTemplates.filter(t => t.category === cat);
            if (templates.length === 0) return null;
            const Icon = CATEGORY_ICONS[cat] || MapIcon;
            const color = CATEGORY_COLORS[cat] || '#6b7280';
            return (
              <div key={cat} style={{ marginBottom: 20 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
                }}>
                  <Icon size={12} style={{ color }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {TEMPLATE_CATEGORY_LABELS[cat] || cat}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
                  {templates.map(tpl => (
                    <button key={tpl.id} onClick={() => onSelect(tpl)}
                      style={{
                        background: 'var(--ed-bg)', border: '1px solid var(--ed-border-strong)',
                        borderRadius: 10, padding: 12, cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s', position: 'relative',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = color;
                        (e.currentTarget as HTMLButtonElement).style.background = `color-mix(in srgb, ${color} 5%, var(--ed-bg))`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-border-strong)';
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--ed-bg)';
                      }}>
                      {/* Thumbnail or icon */}
                      {tpl.thumbnail ? (
                        <img src={tpl.thumbnail} alt={tpl.name}
                          style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />
                      ) : (
                        <div style={{
                          width: '100%', height: 70, borderRadius: 6, marginBottom: 8,
                          background: `linear-gradient(135deg, color-mix(in srgb, ${color} 15%, var(--ed-bg)), color-mix(in srgb, ${color} 5%, var(--ed-bg)))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={24} style={{ color, opacity: 0.4 }} />
                        </div>
                      )}
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ed-text)', marginBottom: 2, fontFamily: 'var(--font-display)' }}>
                        {tpl.name}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--ed-text-muted)', lineHeight: 1.4 }}>
                        {tpl.description}
                      </div>
                      {/* Delete button for user templates */}
                      {tpl.category === 'user' && onDeleteUserTemplate && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteUserTemplate(tpl.id); }}
                          style={{
                            position: 'absolute', top: 6, right: 6, background: 'rgba(239,68,68,.15)',
                            border: '1px solid rgba(239,68,68,.3)', borderRadius: 4,
                            padding: 3, cursor: 'pointer', display: 'flex',
                          }}
                          title="Vorlage löschen">
                          <Trash2 size={10} style={{ color: '#f87171' }} />
                        </button>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
