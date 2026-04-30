'use client';

/**
 * Number input for tent wall panels add-on. $2.00 per panel.
 * Used on every surface that renders a tent card.
 */
export function WallsInput({ itemId, value, onChange, isEs, variant = 'default' }) {
  const inputClasses = variant === 'modal'
    ? 'w-full bg-white/10 border border-white/20 rounded-md px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary'
    : 'w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary';

  return (
    <div className="mt-3">
      <label
        htmlFor={`walls-${itemId}`}
        className="block text-white/80 text-xs font-medium mb-1"
      >
        {isEs ? 'Paredes (+$2.00 c/u)' : 'Walls (+$2.00 each)'}
      </label>
      <input
        id={`walls-${itemId}`}
        type="number"
        min="0"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={inputClasses}
      />
    </div>
  );
}
