'use client';

import { RotateCcw, RotateCw, Trash2, X, Layers, Copy } from 'lucide-react';
import { isTableType } from './furniture/Furniture';

export default function SelectionHud({
  t, visible, selectedItem,
  onRotate, onDelete, onDeselect, onToggleCloth, onDuplicate,
}) {
  if (!visible) return null;

  const showCloth = selectedItem && isTableType(selectedItem.type);
  const cloth = !!selectedItem?.tableclothed;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 bottom-6 z-20 flex items-center gap-1.5 rounded-full px-2 py-2 shadow-2xl border border-white/15"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(20, 30, 55, 0.95) 50%, rgba(15, 23, 42, 0.92) 100%)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      }}
    >
      <button
        onClick={() => onRotate(-Math.PI / 8)}
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label={t.rotateLeft}
        title={t.rotateLeft}
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        onClick={() => onRotate(Math.PI / 8)}
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label={t.rotateRight}
        title={t.rotateRight}
      >
        <RotateCw className="w-4 h-4" />
      </button>

      <button
        onClick={onDuplicate}
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label={t.duplicate}
        title={t.duplicate}
      >
        <Copy className="w-4 h-4" />
      </button>

      {showCloth && (
        <>
          <div className="w-px h-6 bg-white/15 mx-1" />
          <button
            onClick={onToggleCloth}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              cloth
                ? 'bg-primary/70 hover:bg-primary text-primary-foreground'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            aria-label={cloth ? t.removeCloth : t.addCloth}
            title={cloth ? t.removeCloth : t.addCloth}
            aria-pressed={cloth}
          >
            <Layers className="w-4 h-4" />
          </button>
        </>
      )}

      <div className="w-px h-6 bg-white/15 mx-1" />
      <button
        onClick={onDelete}
        className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-200 transition-colors"
        aria-label={t.deleteItem}
        title={t.deleteItem}
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <button
        onClick={onDeselect}
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
        aria-label={t.deselect}
        title={t.deselect}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
