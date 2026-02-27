import { useState } from 'react';
import { Trash2, Edit3, Calendar, Layers, Download, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function SavedMaps() {
  const { savedMaps, removeSavedMap, setEditorElements, setActiveTab } = useStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const mapToDelete = deleteConfirmId ? savedMaps.find(m => m.id === deleteConfirmId) : null;

  const handleLoad = (map: typeof savedMaps[0]) => {
    setEditorElements(map.elements);
    setActiveTab('editor');
  };

  const handleExportPng = (map: typeof savedMaps[0]) => {
    if (!map.thumbnail) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * 2;
      canvas.height = img.naturalHeight * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = `${map.name}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = map.thumbnail;
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      removeSavedMap(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  if (savedMaps.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
            <Layers size={28} className="text-accent-400" />
          </div>
          <h2 className="font-display font-bold text-xl text-main mb-2">Keine gespeicherten Karten</h2>
          <p className="text-sm text-muted mb-6">
            Erstelle deine erste Karte im Karten-Editor und speichere sie hier.
          </p>
          <button
            onClick={() => setActiveTab('editor')}
            className="px-5 py-2.5 rounded-xl bg-accent-500text-white text-sm font-semibold hover:bg-accent-600 transition-colors"
          >
            Zum Karten-Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-main">Meine Karten</h2>
            <p className="text-sm text-muted mt-1">{savedMaps.length} gespeicherte Karten</p>
          </div>
          <button
            onClick={() => setActiveTab('editor')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-500/15 text-accent-400 text-sm font-medium hover:bg-accent-500/25 transition-colors"
          >
            <Edit3 size={14} /> Neue Karte
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedMaps.map((map) => (
            <div
              key={map.id}
              className="bg-surface border border-theme rounded-2xl overflow-hidden hover:border-accent-500/30 transition-all group"
            >
              {/* Preview Area */}
              <div className="aspect-[4/3] bg-card relative overflow-hidden">
                {map.thumbnail ? (
                  <img
                    src={map.thumbnail}
                    alt={map.name}
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ background: 'var(--card)' }}
                  />
                ) : (
                  <>
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`grid-${map.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.3" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#grid-${map.id})`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Layers size={32} className="text-accent-400/40 mx-auto mb-2" />
                        <span className="text-xs text-muted">{map.elements.length} Elemente</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-display font-semibold text-sm text-main truncate">{map.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-muted">
                    <Calendar size={10} />
                    {new Date(map.updatedAt || map.createdAt).toLocaleDateString('de-DE')}
                  </span>
                  <span className="text-[10px] text-muted">{map.elements.length} Elemente</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-3">
                  <button
                    onClick={() => handleLoad(map)}
                    className="flex-1 py-1.5 rounded-lg bg-accent-500/15 text-accent-400 text-xs font-medium hover:bg-accent-500/25 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit3 size={11} /> Bearbeiten
                  </button>
                  {map.thumbnail && (
                    <button
                      onClick={() => handleExportPng(map)}
                      className="w-8 h-8 rounded-lg bg-card border border-theme flex items-center justify-center text-muted hover:text-accent-400 hover:border-accent-500/30 transition-colors"
                      title="Als PNG herunterladen"
                    >
                      <Download size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirmId(map.id)}
                    className="w-8 h-8 rounded-lg bg-card border border-theme flex items-center justify-center text-muted hover:text-terra-400 hover:border-terra-500/30 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && mapToDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)', zIndex: 200 }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="bg-surface border border-theme rounded-2xl p-6 text-center"
            style={{ width: 360, maxWidth: '90vw', boxShadow: '0 16px 50px rgba(0,0,0,0.35)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-terra-500/15 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} className="text-terra-400" />
            </div>
            <h3 className="font-display font-bold text-base text-main mb-1">Karte löschen?</h3>
            <p className="text-sm text-muted mb-5 leading-relaxed">
              Möchtest du die Karte <strong className="text-main">"{mapToDelete.name}"</strong> wirklich unwiderruflich löschen?
              <br />Dieser Vorgang kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-card border border-theme text-sm text-muted hover:text-main transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-terra-500 text-white text-sm font-semibold hover:bg-terra-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} /> Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
