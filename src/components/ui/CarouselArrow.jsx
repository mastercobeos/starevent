export function CarouselArrow({ direction, onClick, ariaLabel }) {
  const isLeft = direction === 'left';
  return (
    <button
      onClick={onClick}
      className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[1.5px] border-[#C9A84C] bg-transparent text-white transition-[transform,background-color] hover:scale-110 hover:bg-[#C9A84C]/15 flex items-center justify-center"
      aria-label={ariaLabel}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={isLeft ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
      </svg>
    </button>
  );
}
