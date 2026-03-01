export function PaginationDots({ total, current, onChange, className = '', stopPropagation = false }) {
  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={(e) => { if (stopPropagation) e.stopPropagation(); onChange(i); }}
          className={`w-2.5 h-2.5 rounded-full transition-[transform,background-color] ${
            i === current ? 'bg-primary scale-125' : 'bg-white/40 hover:bg-white/60'
          }`}
          aria-label={`Go to page ${i + 1}`}
        />
      ))}
    </div>
  );
}
