import { useState } from 'react';
import { X, Trash2, Image as ImageIcon } from 'lucide-react';
import type { EditorElement } from './types';

interface Props {
  element: EditorElement;
  onClose: () => void;
  onUpdate: (id: string, changes: Partial<EditorElement>) => void;
  onDelete: (id: string) => void;
}

export default function ImagePinModal({ element, onClose, onUpdate, onDelete }: Props) {
  const [caption, setCaption] = useState(element.content || '');

  const handleSave = () => {
    onUpdate(element.id, { content: caption });
    onClose();
  };

  const handleDelete = () => {
    onDelete(element.id);
    onClose();
  };

  const handleReplace = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const dataUrl = await compressImage(file, 1200);
      onUpdate(element.id, { imageDataUrl: dataUrl });
    };
    input.click();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--ed-panel)', border: '1px solid var(--ed-border-strong)',
        borderRadius: 16, padding: 0, maxWidth: '90vw', maxHeight: '90vh',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', width: 600,
      }} onClick={e => e.stopPropagation()}>
        {/* Image */}
        <div style={{ position: 'relative', background: '#111' }}>
          {element.imageDataUrl ? (
            <img src={element.imageDataUrl} alt={element.content || 'Foto'}
              style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', display: 'block' }} />
          ) : (
            <div style={{
              height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ed-text-muted)', flexDirection: 'column', gap: 8,
            }}>
              <ImageIcon size={32} />
              <span style={{ fontSize: 12 }}>Kein Bild</span>
            </div>
          )}
          <button onClick={onClose} style={{
            position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)',
            border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} style={{ color: 'white' }} />
          </button>
        </div>

        {/* Controls */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--ed-text-muted)', display: 'block', marginBottom: 4 }}>Beschriftung</label>
            <input value={caption} onChange={e => setCaption(e.target.value)}
              placeholder="Bildbeschreibung..."
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--ed-input-border)',
                background: 'var(--ed-input)', color: 'var(--ed-text)', fontSize: 12, outline: 'none',
                fontFamily: 'var(--font-body)', boxSizing: 'border-box',
              }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleReplace} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--ed-border-strong)',
              background: 'var(--ed-btn)', color: 'var(--ed-text-muted)', fontSize: 11,
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <ImageIcon size={13} /> Bild ersetzen
            </button>
            <button onClick={handleSave} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))', color: 'white',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              Speichern
            </button>
            <button onClick={handleDelete} style={{
              padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,.3)',
              background: 'rgba(239,68,68,.1)', color: '#f87171', fontSize: 11,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compress an image file to a max dimension, return base64 data URL */
export async function compressImage(file: File, maxDim: number): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
