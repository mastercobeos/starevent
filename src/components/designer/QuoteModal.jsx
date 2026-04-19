'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { CATALOG } from './items';
import { getTentById } from './tents';

export default function QuoteModal({
  open, onClose, t, language,
  tents, items, onTakeSnapshot,
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    address: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.dataset.modalOpen = 'true';
    } else {
      delete document.body.dataset.modalOpen;
    }
    return () => { delete document.body.dataset.modalOpen; };
  }, [open]);

  const counts = useMemo(() => {
    const map = {};
    for (const it of items) map[it.type] = (map[it.type] || 0) + 1;
    return map;
  }, [items]);

  const breakdown = useMemo(() => {
    return CATALOG
      .filter((c) => counts[c.type])
      .map((c) => ({
        label: language === 'es' ? c.nameEs : c.nameEn,
        count: counts[c.type],
      }));
  }, [counts, language]);

  const isValid = form.name.trim() && form.email.trim() && form.phone.trim() && form.eventDate;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      const layoutImage = onTakeSnapshot?.() || null;

      const tentsPayload = tents.map((placed) => {
        const type = getTentById(placed.typeId);
        return {
          id: placed.typeId,
          labelEn: type.labelEn,
          labelEs: type.labelEs,
          width: type.width,
          length: type.length,
          x: Math.round(placed.x * 100) / 100,
          z: Math.round(placed.z * 100) / 100,
        };
      });

      const res = await fetch('/api/designer/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          language,
          tents: tentsPayload,
          tent: tentsPayload[0],
          items: items.map((it) => ({
            type: it.type,
            x: Math.round(it.x * 100) / 100,
            z: Math.round(it.z * 100) / 100,
            rotation: Math.round((it.rotation || 0) * 1000) / 1000,
          })),
          layoutImage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      toast(t.quoteSuccess, 'success', 6000);
      setForm({ name: '', email: '', phone: '', eventDate: '', address: '', notes: '' });
      onClose();
    } catch (err) {
      toast(err.message || t.quoteError, 'error', 6000);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(20, 30, 55, 0.98) 50%, rgba(15, 23, 42, 0.97) 100%)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10" style={{ background: 'inherit' }}>
          <h2 className="text-white text-lg font-bold">{t.quoteTitle}</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label={t.closePanel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-white/70 text-xs leading-relaxed">
            {t.quoteSubtitle}
          </p>

          <div className="rounded-xl border border-[#C9A84C]/30 bg-white/5 p-3">
            <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">{t.yourLayout}</div>
            <ul className="text-white text-sm font-medium mb-2 space-y-0.5">
              {tents.map((placed) => {
                const type = getTentById(placed.typeId);
                return (
                  <li key={placed.instanceId}>
                    · {language === 'es' ? type.labelEs : type.labelEn}
                  </li>
                );
              })}
            </ul>
            {breakdown.length > 0 ? (
              <ul className="text-white/70 text-xs space-y-0.5">
                {breakdown.map((b) => (
                  <li key={b.label}>· {b.count}× {b.label}</li>
                ))}
              </ul>
            ) : (
              <div className="text-white/50 text-xs italic">{t.emptyLayout}</div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Field label={t.fullName} required>
              <input
                type="text"
                value={form.name}
                onChange={update('name')}
                className="input-field"
                maxLength={100}
                required
              />
            </Field>

            <Field label={t.email} required>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                className="input-field"
                maxLength={254}
                required
              />
            </Field>

            <Field label={t.phone} required>
              <input
                type="tel"
                value={form.phone}
                onChange={update('phone')}
                className="input-field"
                maxLength={25}
                required
              />
            </Field>

            <Field label={t.eventDate} required>
              <input
                type="date"
                value={form.eventDate}
                onChange={update('eventDate')}
                className="input-field"
                required
              />
            </Field>

            <Field label={t.address} optional={t.optional}>
              <input
                type="text"
                value={form.address}
                onChange={update('address')}
                className="input-field"
                maxLength={200}
                placeholder={t.addressPlaceholder}
              />
            </Field>

            <Field label={t.notes} optional={t.optional}>
              <textarea
                value={form.notes}
                onChange={update('notes')}
                className="input-field min-h-[80px] resize-none"
                maxLength={1000}
                rows={3}
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full rounded-xl bg-primary hover:bg-primary/90 disabled:bg-primary/40 disabled:cursor-not-allowed text-primary-foreground font-bold py-3 text-sm shadow-lg flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t.sending}</>
            ) : (
              <><Send className="w-4 h-4" /> {t.sendQuote}</>
            )}
          </button>
        </form>

        <style jsx>{`
          .input-field {
            width: 100%;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 0.5rem;
            padding: 0.6rem 0.75rem;
            color: white;
            font-size: 0.875rem;
            transition: border-color 0.15s, background-color 0.15s;
          }
          .input-field:focus {
            outline: none;
            border-color: #C9A84C;
            background: rgba(255,255,255,0.08);
          }
          .input-field::placeholder {
            color: rgba(255,255,255,0.35);
          }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, required, optional, children }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-white/80 text-xs font-medium">
          {label} {required && <span className="text-primary">*</span>}
        </span>
        {optional && <span className="text-white/40 text-[10px]">{optional}</span>}
      </div>
      {children}
    </label>
  );
}
