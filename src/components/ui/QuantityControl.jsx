import { ChevronLeft, ChevronRight } from 'lucide-react';

export function QuantityControl({ value, onDecrement, onIncrement }) {
  return (
    <div className="flex items-center justify-center border border-[#C9A84C]/50 rounded-lg overflow-hidden shrink-0">
      <button
        onClick={onDecrement}
        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors"
      >
        <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
      <span className="w-5 sm:w-6 text-center text-white text-[10px] sm:text-xs font-bold">
        {value}
      </span>
      <button
        onClick={onIncrement}
        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors"
      >
        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  );
}
