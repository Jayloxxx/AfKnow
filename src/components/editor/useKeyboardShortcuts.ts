import { useEffect, useRef } from 'react';
import type { ToolType } from './types';
import type { EditorState } from './useEditorState';
import type { CanvasTransformState } from './useCanvasTransform';
import { TOOLS } from './constants';

const keyToTool = new Map<string, ToolType>();
for (const t of TOOLS) keyToTool.set(t.key.toLowerCase(), t.id);

interface Opts {
  state: EditorState;
  transform: CanvasTransformState;
  activeTool: ToolType;
  setActiveTool: (t: ToolType) => void;
  onSave?: () => void;
  onExport?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleHelp?: () => void;
  onToggleSnap?: () => void;
}

export function useKeyboardShortcuts({
  state,
  transform,
  activeTool,
  setActiveTool,
  onSave,
  onExport,
  onOpenCommandPalette,
  onToggleHelp,
  onToggleSnap,
}: Opts) {
  const spaceHeld = useRef(false);
  const prevTool = useRef<ToolType | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const isMod = e.ctrlKey || e.metaKey;

      // Undo / Redo
      if (isMod && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); state.undo(); return; }
      if (isMod && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); state.redo(); return; }

      // Duplicate
      if (isMod && e.key.toLowerCase() === 'd') { e.preventDefault(); state.duplicateSelected(); return; }

      // Save / Export / Command Palette
      if (isMod && e.key.toLowerCase() === 's') { e.preventDefault(); onSave?.(); return; }
      if (isMod && e.key.toLowerCase() === 'e') { e.preventDefault(); onExport?.(); return; }
      if (isMod && e.key.toLowerCase() === 'k') { e.preventDefault(); onOpenCommandPalette?.(); return; }
      if (e.key === '?' && !isMod && !e.altKey) { e.preventDefault(); onToggleHelp?.(); return; }
      if (e.shiftKey && !isMod && !e.altKey && e.key.toLowerCase() === 's') { e.preventDefault(); onToggleSnap?.(); return; }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') { state.removeSelected(); return; }

      // Escape
      if (e.key === 'Escape') { state.clearSelection(); setActiveTool('select'); return; }

      // Nudge selected elements with arrow keys
      if (state.selectedElementIds.size > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (e.repeat) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        if (dx !== 0 || dy !== 0) state.pushSnapshot();
        for (const id of state.selectedElementIds) {
          const el = state.elements.find((it) => it.id === id);
          if (!el || el.locked) continue;
          state.updateElement(id, { x: el.x + dx, y: el.y + dy });
        }
        return;
      }

      // Space = temporary pan
      if (e.key === ' ' && !spaceHeld.current) {
        e.preventDefault();
        spaceHeld.current = true;
        prevTool.current = activeTool;
        setActiveTool('pan');
        return;
      }

      // Tool shortcuts
      if (isMod || e.altKey) return;
      const tool = keyToTool.get(e.key.toLowerCase());
      if (tool) { setActiveTool(tool); return; }
    };

    const up = (e: KeyboardEvent) => {
      if (e.key === ' ' && spaceHeld.current) {
        spaceHeld.current = false;
        setActiveTool(prevTool.current || 'select');
        prevTool.current = null;
      }
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [state, transform, activeTool, setActiveTool, onSave, onExport, onOpenCommandPalette, onToggleHelp, onToggleSnap]);
}
