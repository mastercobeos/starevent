import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { GlassCard } from '../ui/GlassCard';
import { CarouselArrow } from '../ui/CarouselArrow';
import { PaginationDots } from '../ui/PaginationDots';
import { useResponsiveCount } from '../../hooks/useResponsiveCount';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useSwipe } from '../../hooks/useSwipe';
import { translations } from '../../translations';
import { deluxePackages, basicPackages } from '../../data/homeData';

export function PackagesModal({ showModal, setShowModal, modalType, language, addItem, tc, t, quantities, getQty, setQty, addedFeedback, setAddedFeedback }) {
  const [sliderIndex, setSliderIndex] = useState(0);
  const modalRef = useRef(null);
  const tCommon = translations[language].common;

  // Focus trap
  useEffect(() => {
    if (!showModal || !modalRef.current) return;
    const modal = modalRef.current;
    const previousFocus = document.activeElement;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();

    const handleTab = (e) => {
      if (e.key !== 'Tab' || !focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    modal.addEventListener('keydown', handleTab);
    return () => { modal.removeEventListener('keydown', handleTab); previousFocus?.focus(); };
  }, [showModal]);

  const visiblePackages = useResponsiveCount(
    [[640, 1], [1024, 2], [Infinity, 3]],
    useCallback(() => setSliderIndex(0), [])
  );

  const activePackages = modalType === 'Deluxe' ? deluxePackages : basicPackages;
  const perPage = visiblePackages;
  const totalPages = Math.ceil(activePackages.length / perPage);

  const closeModal = useCallback(() => setShowModal(false), [setShowModal]);
  const goNext = useCallback(() => setSliderIndex((prev) => (prev + 1) % totalPages), [totalPages]);
  const goPrev = useCallback(() => setSliderIndex((prev) => (prev - 1 + totalPages) % totalPages), [totalPages]);
  const swipe = useSwipe(goNext, goPrev);

  useEscapeKey(showModal, closeModal);

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={() => setShowModal(false)}
      role="dialog"
      aria-modal="true"
      aria-label={t.ourPackages}
      ref={modalRef}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-[60rem] px-2 sm:px-4">
        <div className="flex items-center justify-center mb-4 sm:mb-6 relative">
          <h3 className="text-2xl sm:text-3xl font-bold text-white text-center drop-shadow-lg">
            {t.ourPackages}
          </h3>
          <button
            onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
            className="absolute right-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-lg font-light transition-[background-color,color] backdrop-blur-sm"
            aria-label="Close packages modal"
          >
            ✕
          </button>
        </div>
        <div className="relative flex items-center gap-2 sm:gap-4" {...swipe}>
          <CarouselArrow
            direction="left"
            onClick={(e) => { e.stopPropagation(); setSliderIndex((prev) => (prev - 1 + totalPages) % totalPages); }}
            ariaLabel="Previous packages"
          />
          <div className="overflow-hidden w-full">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${sliderIndex * 100}%)` }}
            >
              {Array.from({ length: totalPages }).map((_, pageIdx) => (
                <div key={pageIdx} className="w-full shrink-0 px-2">
                  <div className={`grid gap-2 sm:gap-4 ${perPage === 1 ? 'grid-cols-1 max-w-sm mx-auto' : perPage === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {activePackages.slice(pageIdx * perPage, pageIdx * perPage + perPage).map((sub, i) => (
                      <GlassCard
                        key={i}
                        variant="navbar"
                        className="rounded-xl sm:rounded-2xl border-2 border-[#C9A84C] shadow-2xl flex flex-col h-full backdrop-blur-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {sub.image && (
                          <div className="relative w-full h-24 sm:h-32 md:h-36">
                            <Image src={sub.image} alt={language === 'en' ? sub.title : sub.titleEs} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover object-center" loading="lazy" quality={75} />
                          </div>
                        )}
                        <div className="p-2 sm:p-4 md:p-6 flex flex-col flex-grow text-center items-center">
                          <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold mb-1.5 sm:mb-3 w-fit ${
                            sub.badge === 'Deluxe' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                          }`}>
                            {sub.badge}
                          </span>
                          <div className="text-lg sm:text-2xl md:text-4xl font-bold text-white mb-0">{sub.price}</div>
                          <p className="text-white/50 text-[9px] sm:text-xs mb-0.5 sm:mb-1">{tCommon.taxAndDelivery}</p>
                          <h4 className="text-xs sm:text-sm md:text-base font-semibold text-white mb-1.5 sm:mb-3">{language === 'en' ? sub.title : sub.titleEs}</h4>
                          <div className="w-fit mx-auto flex-grow flex flex-col justify-end">
                            <ul className="space-y-0.5 sm:space-y-1.5 mb-2 sm:mb-4 text-left">
                              {(language === 'es' && sub.includesEs ? sub.includesEs : sub.includes).map((item, j) => (
                                <li key={j} className="text-[10px] sm:text-xs md:text-sm text-white/90 flex items-start gap-1">
                                  <span className="text-primary mt-0.5 font-bold text-[10px] sm:text-xs">✓</span>
                                  <span className="leading-tight">{item}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              className="font-semibold py-1 sm:py-1.5 px-3 sm:px-4 text-[10px] sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
                              onClick={() => {
                                const qty = getQty(sub.id);
                                addItem({ id: sub.id, name: sub.title, nameEs: sub.titleEs, price: sub.priceNum, image: '', type: 'package', checkoutLink: sub.checkoutLink }, qty);
                                setAddedFeedback(sub.id);
                                setTimeout(() => setAddedFeedback(null), 1500);
                                setQty(sub.id, 1);
                              }}
                            >
                              {addedFeedback === sub.id ? tc.addedToCart : tc.addToCart}
                            </Button>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <CarouselArrow
            direction="right"
            onClick={(e) => { e.stopPropagation(); setSliderIndex((prev) => (prev + 1) % totalPages); }}
            ariaLabel="Next packages"
          />
        </div>
        <PaginationDots total={totalPages} current={sliderIndex} onChange={setSliderIndex} className="mt-4" stopPropagation />
      </div>
    </div>
  );
}
