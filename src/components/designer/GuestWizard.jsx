'use client';

import { useState } from 'react';
import { Wand2, Users } from 'lucide-react';
import { TENTS } from './tents';

const SQ_FT_PER_GUEST = 12;
const CHAIRS_PER_ROUND = 8;

function suggestSetup(count) {
  const sqFtNeeded = count * SQ_FT_PER_GUEST;
  const frameTents = TENTS.filter((t) => t.variant === 'frame');
  const tent =
    frameTents.find((t) => t.width * t.length >= sqFtNeeded) ||
    frameTents[frameTents.length - 1];
  const tables = Math.ceil(count / CHAIRS_PER_ROUND);
  const chairs = count;
  return { tent, tables, chairs };
}

function generateLayout(tent, tables, chairs, chairType = 'resin') {
  const items = [];
  let counter = 0;
  const tentW = tent.width - 4;
  const cols = Math.max(1, Math.min(3, Math.floor(tentW / 6)));
  const rows = Math.ceil(tables / cols);
  const colGap = 6;
  const rowGap = tent.length / Math.max(rows, 1);

  for (let t = 0; t < tables; t++) {
    const col = t % cols;
    const row = Math.floor(t / cols);
    const x = (col - (cols - 1) / 2) * colGap;
    const z = (row - (rows - 1) / 2) * Math.min(8, rowGap - 1);

    items.push({
      id: `round-table-wiz-${counter++}`,
      type: 'round-table',
      x,
      z,
      rotation: 0,
      tableclothed: true,
    });

    const chairsThisTable = Math.min(
      CHAIRS_PER_ROUND,
      chairs - t * CHAIRS_PER_ROUND
    );
    for (let i = 0; i < chairsThisTable; i++) {
      const angle = (i / CHAIRS_PER_ROUND) * Math.PI * 2;
      items.push({
        id: `${chairType}-wiz-${counter++}`,
        type: chairType,
        x: x + Math.cos(angle) * 3.4,
        z: z + Math.sin(angle) * 3.4,
        rotation: angle + Math.PI / 2,
      });
    }
  }
  return items;
}

export default function GuestWizard({ t, language, onApply }) {
  const [count, setCount] = useState('');
  const [expanded, setExpanded] = useState(false);

  const parsed = parseInt(count, 10);
  const isValid = !Number.isNaN(parsed) && parsed >= 4 && parsed <= 200;
  const preview = isValid ? suggestSetup(parsed) : null;

  const handleApply = () => {
    if (!preview) return;
    const items = generateLayout(preview.tent, preview.tables, preview.chairs);
    onApply({ tent: preview.tent, items });
    setExpanded(false);
    setCount('');
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-white text-xs font-semibold py-2.5 transition-colors"
      >
        <Wand2 className="w-4 h-4 text-primary" />
        {t.wizardCta}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-primary/40 bg-white/5 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-primary" />
        <div className="text-white text-sm font-semibold">{t.wizardTitle}</div>
      </div>

      <div>
        <label className="block text-white/70 text-[11px] font-medium mb-1">
          {t.wizardGuestCount}
        </label>
        <div className="relative">
          <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="number"
            min="4"
            max="200"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="40"
            autoFocus
            className="w-full rounded-md bg-white/10 border border-white/15 text-white text-sm py-2 pl-9 pr-3 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {preview && (
        <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[11px] text-white/80 leading-relaxed space-y-1">
          <div className="font-semibold text-white">{t.wizardSuggestion}</div>
          <div>· {language === 'es' ? preview.tent.labelEs : preview.tent.labelEn}</div>
          <div>· {preview.tables} {language === 'es' ? 'mesas redondas' : 'round tables'}</div>
          <div>· {preview.chairs} {language === 'es' ? 'sillas (resina blanca)' : 'chairs (white resin)'}</div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleApply}
          disabled={!isValid}
          className="flex-1 rounded-md bg-primary hover:bg-primary/90 disabled:bg-primary/30 disabled:cursor-not-allowed text-primary-foreground text-xs font-semibold py-2 transition-colors"
        >
          {t.wizardApply}
        </button>
        <button
          onClick={() => { setExpanded(false); setCount(''); }}
          className="flex-1 rounded-md bg-white/5 hover:bg-white/15 text-white/80 text-xs font-medium py-2 transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
}
