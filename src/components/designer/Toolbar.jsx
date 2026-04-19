'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Package, Armchair, Send, Sparkles,
  Plus, Minus, Trash2, Undo2, Redo2, Grid3x3, Keyboard, Check,
  Download, Lightbulb, Users, AlertTriangle, RotateCcw as ResetIcon,
  Spotlight as SpotlightIcon,
} from 'lucide-react';
import { CATALOG } from './items';
import { PACKAGES } from './packages';
import GuestWizard from './GuestWizard';

function ItemRow({ item, count, label, onAdd, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="text-white text-sm font-medium truncate">{label}</div>
        {item.capacity && (
          <div className="text-white/40 text-[11px]">
            {item.capacity} {item.capacity === 1 ? 'seat' : 'seats'}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onRemove(item.type)}
          disabled={count === 0}
          className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white/80 transition-colors"
          aria-label="Remove one"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-white text-sm font-semibold w-6 text-center">{count}</span>
        <button
          onClick={() => onAdd(item.type)}
          disabled={item.unique && count > 0}
          className="w-7 h-7 rounded-md bg-primary/70 hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-primary-foreground transition-colors"
          aria-label="Add one"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function PackageCard({ pkg, language, onApply, hasItems, t }) {
  const [confirming, setConfirming] = useState(false);

  const name = language === 'es' ? pkg.nameEs : pkg.nameEn;
  const desc = language === 'es' ? pkg.descEs : pkg.descEn;

  const handleClick = () => {
    if (hasItems && !confirming) {
      setConfirming(true);
      return;
    }
    onApply(pkg.apply());
    setConfirming(false);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {pkg.image && (
        <div className="relative h-20 w-full overflow-hidden bg-black/40">
          <Image
            src={pkg.image}
            alt={name}
            fill
            sizes="360px"
            className="object-cover opacity-85"
          />
        </div>
      )}
      <div className="p-3">
        <div className="text-white text-sm font-semibold mb-0.5">{name}</div>
        <div className="text-white/60 text-[11px] leading-relaxed mb-2.5">{desc}</div>

        {confirming ? (
          <div className="flex gap-1.5">
            <button
              onClick={handleClick}
              className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-semibold py-1.5 flex items-center justify-center gap-1 transition-colors"
            >
              <Check className="w-3 h-3" /> {t.confirmReplace}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-md bg-white/5 hover:bg-white/15 text-white/80 text-[11px] font-medium py-1.5 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        ) : (
          <button
            onClick={handleClick}
            className="w-full rounded-md bg-primary/70 hover:bg-primary text-primary-foreground text-[11px] font-semibold py-1.5 transition-colors"
          >
            {t.applyLayout}
          </button>
        )}
      </div>
    </div>
  );
}

function TentListItem({
  placed, isSelected, canRemove, tentCatalog, language,
  onSelect, onChangeType, onRemove,
}) {
  const type = tentCatalog.find((tt) => tt.id === placed.typeId) || tentCatalog[0];
  return (
    <div
      className={`rounded-xl border transition-colors cursor-pointer ${
        isSelected
          ? 'border-[#C9A84C] bg-[#C9A84C]/10'
          : 'border-white/10 bg-white/5 hover:border-white/25'
      }`}
      onClick={() => onSelect(placed.instanceId)}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">
              {language === 'es' ? type.labelEs : type.labelEn}
            </div>
            <div className="text-white/50 text-[11px]">
              {type.width} × {type.length} ft
              {(placed.x !== 0 || placed.z !== 0) && (
                <> · @ ({Math.round(placed.x)}, {Math.round(placed.z)})</>
              )}
            </div>
          </div>
          {canRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(placed.instanceId); }}
              className="shrink-0 w-6 h-6 rounded-md bg-red-500/10 hover:bg-red-500/25 border border-red-400/30 text-red-200 text-xs flex items-center justify-center transition-colors"
              aria-label="Remove tent"
            >
              ×
            </button>
          )}
        </div>
        <select
          value={placed.typeId}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onChangeType(placed.instanceId, e.target.value)}
          className="w-full rounded-md bg-white/10 hover:bg-white/15 border border-white/15 text-white text-[11px] py-1 px-2 focus:outline-none focus:border-primary transition-colors"
        >
          {tentCatalog.map((tt) => (
            <option key={tt.id} value={tt.id} className="bg-slate-900 text-white">
              {language === 'es' ? tt.labelEs : tt.labelEn}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function CapacityBadge({ t, chairs, capacity, isOver }) {
  const pct = Math.min(100, Math.round((chairs / Math.max(capacity, 1)) * 100));
  return (
    <div className={`rounded-lg border px-3 py-2 ${
      isOver ? 'border-red-400/40 bg-red-500/10' : 'border-white/10 bg-white/5'
    }`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-white text-xs font-medium">
          <Users className="w-3.5 h-3.5" />
          {t.capacity}
        </div>
        <div className={`text-xs font-bold ${isOver ? 'text-red-200' : 'text-white'}`}>
          {chairs} / {capacity}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full transition-all ${isOver ? 'bg-red-400' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isOver && (
        <div className="flex items-start gap-1 mt-1.5 text-red-200 text-[10px] leading-relaxed">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          <span>{t.overCapacity}</span>
        </div>
      )}
    </div>
  );
}

export default function Toolbar({
  t, language, tent, tents, selectedTentInstanceId, tentCatalog, items,
  snapEnabled, lightsEnabled, theaterLightEnabled, canUndo, canRedo,
  chairsInLayout, tentCapacity, isOverCapacity,
  onAdd, onRemoveType, onClearAll, onResetSaved, onApplyPackage, onApplyWizard,
  onSelectTent, onAddTent, onRemoveTent, onChangeTentType,
  onToggleSnap, onToggleLights, onToggleTheaterLight,
  onUndo, onRedo, onOpenQuote, onDownload,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const counts = useMemo(() => {
    const map = {};
    for (const it of items) map[it.type] = (map[it.type] || 0) + 1;
    return map;
  }, [items]);

  const grouped = useMemo(() => {
    const g = { tables: [], chairs: [], others: [] };
    for (const c of CATALOG) {
      if (g[c.category]) g[c.category].push(c);
    }
    return g;
  }, []);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="
            absolute z-20 bg-primary hover:bg-primary/90 text-primary-foreground
            rounded-full flex items-center justify-center shadow-lg
            transition-transform hover:scale-110
            bottom-5 right-5 w-12 h-12
            md:bottom-auto md:top-20 md:right-4 md:w-10 md:h-10
          "
          aria-label={t.openPanel}
        >
          <ChevronUp className="w-5 h-5 md:hidden" />
          <ChevronLeft className="w-5 h-5 hidden md:block" />
        </button>
      )}

      <aside
        className={`
          fixed z-30 transition-transform duration-300 will-change-transform
          left-0 right-0 bottom-0 h-[78vh] rounded-t-2xl
          md:absolute md:left-auto md:right-0 md:top-0 md:bottom-0 md:h-full
          md:w-[380px] md:rounded-none
          ${isOpen
            ? 'translate-y-0 md:translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }
        `}
      >
        <div
          className="
            h-full overflow-y-auto overscroll-contain shadow-2xl
            border-t border-white/15 rounded-t-2xl
            md:border-t-0 md:border-l md:rounded-none
          "
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(20, 30, 55, 0.95) 50%, rgba(15, 23, 42, 0.92) 100%)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          }}
        >
          <div className="md:hidden sticky top-0 z-10 flex flex-col items-center pt-2 pb-1"
               style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.7) 100%)' }}>
            <button
              onClick={() => setIsOpen(false)}
              className="flex flex-col items-center py-1 px-4 group"
              aria-label={t.closePanel}
            >
              <div className="w-10 h-1 rounded-full bg-white/30 group-hover:bg-white/50 transition-colors" />
            </button>
          </div>

          <div className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {t.designerTitle}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label={t.closePanel}
              >
                <ChevronDown className="w-5 h-5 md:hidden" />
                <ChevronRight className="w-5 h-5 hidden md:block" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 mb-4">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-medium py-2 transition-colors"
                title={t.undo}
              >
                <Undo2 className="w-3.5 h-3.5" />
                {t.undo}
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-medium py-2 transition-colors"
                title={t.redo}
              >
                <Redo2 className="w-3.5 h-3.5" />
                {t.redo}
              </button>
              <button
                onClick={onToggleSnap}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors border ${
                  snapEnabled
                    ? 'bg-primary/60 hover:bg-primary/80 border-primary/60 text-primary-foreground'
                    : 'bg-white/5 hover:bg-white/15 border-white/10 text-white/60'
                }`}
                title={t.snapToGrid}
                aria-pressed={snapEnabled}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowShortcuts((s) => !s)}
                className="hidden md:flex w-9 h-9 rounded-lg items-center justify-center transition-colors border bg-white/5 hover:bg-white/15 border-white/10 text-white/70"
                title={t.keyboardShortcuts}
                aria-pressed={showShortcuts}
              >
                <Keyboard className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-3">
              <button
                onClick={onToggleLights}
                className={`flex items-center justify-center gap-1.5 rounded-lg border text-xs font-medium py-2 transition-colors ${
                  lightsEnabled
                    ? 'bg-primary/60 hover:bg-primary/80 border-primary/60 text-primary-foreground'
                    : 'bg-white/5 hover:bg-white/15 border-white/10 text-white/80'
                }`}
                title={t.stringLights}
                aria-pressed={lightsEnabled}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                {t.stringLights}
              </button>
              <button
                onClick={onToggleTheaterLight}
                className={`flex items-center justify-center gap-1.5 rounded-lg border text-xs font-medium py-2 transition-colors ${
                  theaterLightEnabled
                    ? 'bg-primary/60 hover:bg-primary/80 border-primary/60 text-primary-foreground'
                    : 'bg-white/5 hover:bg-white/15 border-white/10 text-white/80'
                }`}
                title={t.theaterLight}
                aria-pressed={theaterLightEnabled}
              >
                <SpotlightIcon className="w-3.5 h-3.5" />
                {t.theaterLight}
              </button>
            </div>

            <div className="flex items-center gap-1.5 mb-5">
              <button
                onClick={onDownload}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-white text-xs font-medium py-2 transition-colors"
                title={t.downloadImage}
              >
                <Download className="w-3.5 h-3.5" />
                {t.download}
              </button>
            </div>

            {showShortcuts && (
              <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] text-white/70 space-y-1.5">
                <div className="font-semibold text-white/90 mb-1">{t.keyboardShortcuts}</div>
                <div className="flex justify-between"><span>{t.kbdSelect}</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-mono">Click</kbd></div>
                <div className="flex justify-between"><span>{t.kbdMove}</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-mono">Drag</kbd></div>
                <div className="flex justify-between"><span>{t.kbdRotate}</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-mono">R</kbd></div>
                <div className="flex justify-between"><span>{t.kbdRotateBack}</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-mono">Shift+R</kbd></div>
                <div className="flex justify-between"><span>{t.kbdCloth}</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-mono">C</kbd></div>
                <div className="flex justify-between"><span>{t.kbdDuplicate}</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-mono">Ctrl+D</kbd></div>
                <div className="flex justify-between"><span>{t.kbdNudge}</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-mono">↑↓←→</kbd></div>
                <div className="flex justify-between"><span>{t.kbdFocus}</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-mono">Dbl-Click</kbd></div>
                <div className="flex justify-between"><span>{t.kbdDelete}</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-mono">Del</kbd></div>
                <div className="flex justify-between"><span>{t.kbdDeselect}</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-mono">Esc</kbd></div>
                <div className="flex justify-between"><span>{t.undo}</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-mono">Ctrl+Z</kbd></div>
                <div className="flex justify-between"><span>{t.redo}</span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 font-mono">Ctrl+Shift+Z</kbd></div>
              </div>
            )}

            <section className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                  {t.tentsLabel} ({tents.length})
                </h3>
                <button
                  onClick={onAddTent}
                  className="flex items-center gap-1 rounded-md bg-primary/70 hover:bg-primary text-primary-foreground text-[11px] font-semibold px-2 py-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {t.addTent}
                </button>
              </div>
              <div className="space-y-2">
                {tents.map((placed) => (
                  <TentListItem
                    key={placed.instanceId}
                    placed={placed}
                    isSelected={placed.instanceId === selectedTentInstanceId}
                    canRemove={tents.length > 1}
                    tentCatalog={tentCatalog}
                    language={language}
                    onSelect={onSelectTent}
                    onChangeType={onChangeTentType}
                    onRemove={onRemoveTent}
                  />
                ))}
              </div>
              <div className="mt-2 text-white/40 text-[10px] leading-relaxed">
                {t.dragTentHint}
              </div>
            </section>

            <section className="mb-5">
              <CapacityBadge
                t={t}
                chairs={chairsInLayout}
                capacity={tentCapacity}
                isOver={isOverCapacity}
              />
            </section>

            <section className="mb-5">
              <GuestWizard t={t} language={language} onApply={onApplyWizard} />
            </section>

            <section className="mb-5">
              <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Package className="w-3.5 h-3.5" />
                {t.packages}
              </h3>
              <div className="grid gap-2">
                {PACKAGES.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    language={language}
                    onApply={onApplyPackage}
                    hasItems={items.length > 0}
                    t={t}
                  />
                ))}
              </div>
            </section>

            <section className="mb-5">
              <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">
                {t.tables}
              </h3>
              <div className="space-y-2">
                {grouped.tables.map((c) => (
                  <ItemRow
                    key={c.id}
                    item={c}
                    count={counts[c.type] || 0}
                    label={language === 'es' ? c.nameEs : c.nameEn}
                    onAdd={onAdd}
                    onRemove={onRemoveType}
                  />
                ))}
              </div>
            </section>

            <section className="mb-5">
              <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Armchair className="w-3.5 h-3.5" />
                {t.chairs}
              </h3>
              <div className="space-y-2">
                {grouped.chairs.map((c) => (
                  <ItemRow
                    key={c.id}
                    item={c}
                    count={counts[c.type] || 0}
                    label={language === 'es' ? c.nameEs : c.nameEn}
                    onAdd={onAdd}
                    onRemove={onRemoveType}
                  />
                ))}
              </div>
            </section>

            <section className="mb-5">
              <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">
                {t.others}
              </h3>
              <div className="space-y-2">
                {grouped.others.map((c) => (
                  <ItemRow
                    key={c.id}
                    item={c}
                    count={counts[c.type] || 0}
                    label={language === 'es' ? c.nameEs : c.nameEn}
                    onAdd={onAdd}
                    onRemove={onRemoveType}
                  />
                ))}
              </div>
            </section>

            {items.length > 0 && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={onClearAll}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-400/40 bg-red-500/10 hover:bg-red-500/20 text-red-200 text-xs font-semibold py-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.clearAll} ({items.length})
                </button>
                <button
                  onClick={onResetSaved}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/15 text-white/70 text-xs font-medium py-2 px-3 transition-colors"
                  title={t.resetSavedTitle}
                >
                  <ResetIcon className="w-3.5 h-3.5" />
                  {t.resetSaved}
                </button>
              </div>
            )}

            <div className="sticky bottom-0 pt-3 -mx-5 md:-mx-6 px-5 md:px-6 pb-4 md:pb-2"
                 style={{ background: 'linear-gradient(0deg, rgba(15,23,42,1) 40%, rgba(15,23,42,0.7) 100%)' }}>
              <button
                onClick={onOpenQuote}
                disabled={items.length === 0}
                className="w-full rounded-xl bg-primary hover:bg-primary/90 disabled:bg-primary/40 disabled:cursor-not-allowed text-primary-foreground font-bold py-3 text-sm shadow-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                {t.sendQuote}
              </button>
              {items.length === 0 && (
                <p className="text-white/40 text-[10px] text-center mt-2">
                  {t.addItemsToQuote}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
