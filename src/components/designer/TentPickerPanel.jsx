'use client';

import Image from 'next/image';
import { X, Plus, Users } from 'lucide-react';
import { getSeatedCapacity } from './tents';

export default function TentPickerPanel({
  t, language, open, tentCatalog, onClose, onPick,
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="absolute inset-0 z-20 bg-black/30 md:bg-transparent md:pointer-events-none"
        onClick={onClose}
      />

      <aside
        className="
          absolute z-30 left-3 md:left-[5.25rem] top-[4.5rem] bottom-4
          w-[15rem] max-h-[calc(100vh-6.5rem)] rounded-2xl overflow-hidden
          border border-white/15 shadow-2xl
          flex flex-col
        "
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 55, 0.97) 50%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        }}
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
          <h3 className="text-white text-sm font-bold truncate">{t.pickTentTitle || 'Choose a tent'}</h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 text-white/80 flex items-center justify-center transition-colors"
            aria-label={t.close || 'Close'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain p-2.5 space-y-2">
          {tentCatalog.map((tent) => {
            const capacity = getSeatedCapacity(tent);
            const label = language === 'es' ? tent.labelEs : tent.labelEn;
            return (
              <button
                key={tent.id}
                type="button"
                onClick={() => onPick(tent.id)}
                className="
                  group w-full rounded-lg overflow-hidden border border-white/10
                  bg-white/5 hover:bg-white/10 hover:border-[#C9A84C]/60
                  transition-colors text-left
                "
              >
                <div className="relative w-full aspect-[4/3] bg-black/40">
                  {tent.image ? (
                    <Image
                      src={tent.image}
                      alt={label}
                      fill
                      sizes="220px"
                      className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  ) : null}
                  <div className="absolute top-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-white border border-white/15">
                    {tent.width}×{tent.length}
                  </div>
                </div>
                <div className="px-2.5 py-2">
                  <div className="text-white text-[12px] font-semibold leading-tight truncate">{label}</div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-white/55 text-[10px]">
                      <Users className="w-3 h-3" />
                      {capacity}
                    </div>
                    <div className="flex items-center gap-0.5 text-[10px] font-semibold text-[#C9A84C] group-hover:text-[#e0c060]">
                      <Plus className="w-3 h-3" />
                      {t.addToScene || 'Add'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
