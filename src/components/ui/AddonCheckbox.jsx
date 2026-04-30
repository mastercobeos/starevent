'use client';

/**
 * Single addon checkbox row — a button styled as a checkbox.
 * Reused by every surface that renders a product card with addons:
 * home modal, category page, detail page, customize page.
 *
 * Variants only tweak typography/padding to match each surface's existing
 * card density. Visual parity with pre-refactor code is preserved.
 */
export function AddonCheckbox({ addon, label, checked, onToggle, variant = 'default' }) {
  const sizeClasses = variant === 'modal'
    ? 'px-2 py-1.5 mb-1.5 text-[11px] sm:text-xs'
    : variant === 'compact'
    ? 'px-2 py-1.5 text-xs'
    : 'px-3 py-2 mt-2 text-xs sm:text-sm';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 w-full text-left rounded-lg transition-all border ${sizeClasses} ${
        checked
          ? 'border-primary bg-primary/15 text-white'
          : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
      }`}
    >
      <span
        className={`flex items-center justify-center w-4 h-4 rounded border transition-all shrink-0 ${
          checked ? 'bg-primary border-primary text-black' : 'border-white/40'
        }`}
      >
        {checked && (
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className="flex-1">{label}</span>
      <span className="font-semibold text-primary">+${addon.price.toFixed(2)}</span>
    </button>
  );
}
