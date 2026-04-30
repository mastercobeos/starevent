import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { CarouselArrow } from '../ui/CarouselArrow';
import { PaginationDots } from '../ui/PaginationDots';
import { QuantityControl } from '../ui/QuantityControl';
import { AddonCheckbox } from '../ui/AddonCheckbox';
import { WallsInput } from '../ui/WallsInput';
import { useResponsiveCount } from '../../hooks/useResponsiveCount';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useSwipe } from '../../hooks/useSwipe';
import { useAddonCart, WALL_PRODUCT } from '../../hooks/useAddonCart';
import { translations } from '../../translations';
import { productCards } from '../../data/homeData';

export function ProductModal({ productModal, setProductModal, language, addItem, tc, quantities, getQty, setQty, addedFeedback, setAddedFeedback, initialItemId, onItemVisible }) {
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const modalRef = useRef(null);
  const initializedRef = useRef(false);
  const tCommon = translations[language].common;
  const isEs = language === 'es';

  const {
    isAddonSelected,
    toggleAddon,
    getItemPrice,
    getWallsQty,
    setWallsQty,
    buildCartPayload,
  } = useAddonCart();

  // Focus trap
  useEffect(() => {
    if (productModal === null || !modalRef.current) return;
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
  }, [productModal]);

  const visibleProductItems = useResponsiveCount(
    [[640, 1], [1024, 2], [Infinity, 3]],
    useCallback(() => setSelectedItemIdx(0), [])
  );

  const modalItems = productModal !== null ? productCards[productModal].items : [];
  const perItemPage = visibleProductItems;
  const totalItemPages = productModal !== null ? Math.ceil(modalItems.length / perItemPage) : 1;

  // Navigate to the page containing initialItemId on first render
  useEffect(() => {
    if (initialItemId && productModal !== null && !initializedRef.current) {
      const itemIdx = modalItems.findIndex(item => item.id === initialItemId);
      if (itemIdx !== -1) {
        const pageIdx = Math.floor(itemIdx / perItemPage);
        setSelectedItemIdx(pageIdx);
      }
      initializedRef.current = true;
    }
  }, [initialItemId, productModal, modalItems, perItemPage]);

  // Notify parent of the first visible item when page changes (for URL update)
  useEffect(() => {
    if (productModal !== null && onItemVisible && modalItems.length > 0) {
      const firstVisibleItem = modalItems[selectedItemIdx * perItemPage];
      if (firstVisibleItem) {
        onItemVisible(firstVisibleItem.id);
      }
    }
  }, [selectedItemIdx, productModal, onItemVisible, modalItems, perItemPage]);

  const closeModal = useCallback(() => setProductModal(null), [setProductModal]);
  const goNext = useCallback(() => setSelectedItemIdx((prev) => (prev + 1) % totalItemPages), [totalItemPages]);
  const goPrev = useCallback(() => setSelectedItemIdx((prev) => (prev - 1 + totalItemPages) % totalItemPages), [totalItemPages]);
  const swipe = useSwipe(goNext, goPrev);

  useEscapeKey(productModal !== null, closeModal);

  if (productModal === null) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={() => setProductModal(null)}
      role="dialog"
      aria-modal="true"
      aria-label={language === 'en' ? productCards[productModal].name : productCards[productModal].nameEs}
      ref={modalRef}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-[60rem] px-2 sm:px-4">
        <div className="flex items-center justify-center mb-4 sm:mb-6 relative">
          <h3 className="text-2xl sm:text-3xl font-bold text-white text-center drop-shadow-lg">
            {language === 'en' ? productCards[productModal].name : productCards[productModal].nameEs}
          </h3>
          <button
            onClick={(e) => { e.stopPropagation(); setProductModal(null); }}
            className="absolute right-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-lg font-light transition-[background-color,color] backdrop-blur-sm"
            aria-label="Close product details"
          >
            ✕
          </button>
        </div>
        <div className="relative flex items-center gap-2 sm:gap-4" {...swipe}>
          <CarouselArrow
            direction="left"
            onClick={(e) => { e.stopPropagation(); setSelectedItemIdx((prev) => (prev - 1 + totalItemPages) % totalItemPages); }}
            ariaLabel="Previous products"
          />
          <div className="overflow-hidden w-full">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${selectedItemIdx * 100}%)` }}
            >
              {Array.from({ length: totalItemPages }).map((_, pageIdx) => (
                <div key={pageIdx} className="w-full shrink-0 px-2">
                  <div className={`grid gap-2 sm:gap-4 ${perItemPage === 1 ? 'grid-cols-1 max-w-sm mx-auto' : perItemPage === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {modalItems.slice(pageIdx * perItemPage, pageIdx * perItemPage + perItemPage).map((item, i) => (
                      <div
                        key={i}
                        className="rounded-xl sm:rounded-2xl border-2 border-[#C9A84C] shadow-2xl flex flex-col h-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: 'rgba(0, 0, 0, 0.35)',
                          backdropFilter: 'blur(8px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(8px) saturate(180%)',
                        }}
                      >
                        <div className="relative w-full h-36 sm:h-44 md:h-52">
                          <Image src={item.image} alt={language === 'en' ? item.name : item.nameEs} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain object-top" loading="lazy" quality={75} />
                        </div>
                        <div className="p-2 sm:p-4 md:p-5 flex flex-col flex-grow">
                          <h4 className="text-sm sm:text-base md:text-lg font-bold text-white mb-0.5">
                            {language === 'en' ? item.name : item.nameEs}
                          </h4>
                          <span className="text-[10px] sm:text-xs text-white/60 mb-1.5">{tCommon.duration24h}</span>
                          <p className="text-white/85 text-[11px] sm:text-xs md:text-sm leading-relaxed mb-3 flex-grow line-clamp-3">
                            {language === 'en' ? item.desc : item.descEs}
                          </p>
                          {item.addons && item.addons.map(addon => (
                            <AddonCheckbox
                              key={addon.id}
                              addon={addon}
                              label={isEs ? addon.nameEs : addon.name}
                              checked={isAddonSelected(item.id, addon.id)}
                              onToggle={() => toggleAddon(item.id, addon.id)}
                              variant="modal"
                            />
                          ))}
                          {productCards[productModal]?.slug === 'tents' && (
                            <WallsInput
                              itemId={item.id}
                              value={getWallsQty(item.id)}
                              onChange={(v) => setWallsQty(item.id, v)}
                              isEs={isEs}
                              variant="modal"
                            />
                          )}
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-0 mt-2">${getItemPrice(item).toFixed(2)}</div>
                          <p className="text-white/50 text-[9px] sm:text-xs mb-2">{tCommon.taxAndDelivery}</p>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
                            <QuantityControl
                              value={getQty(item.id)}
                              onDecrement={() => setQty(item.id, getQty(item.id) - 1)}
                              onIncrement={() => setQty(item.id, getQty(item.id) + 1)}
                            />
                            <Button
                              className="flex-1 font-semibold py-1.5 sm:py-2 px-2 sm:px-3 text-[10px] sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
                              onClick={() => {
                                const qty = getQty(item.id);
                                const { item: cartItem, walls: wallsQty } = buildCartPayload(item, { isEs });
                                addItem({ ...cartItem, type: 'product' }, qty);
                                if (wallsQty > 0) addItem(WALL_PRODUCT, wallsQty);
                                setAddedFeedback(item.id);
                                setTimeout(() => setAddedFeedback(null), 1500);
                                setQty(item.id, 1);
                              }}
                            >
                              {addedFeedback === item.id ? tc.addedToCart : tc.addToCart}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <CarouselArrow
            direction="right"
            onClick={(e) => { e.stopPropagation(); setSelectedItemIdx((prev) => (prev + 1) % totalItemPages); }}
            ariaLabel="Next products"
          />
        </div>
        <PaginationDots total={totalItemPages} current={selectedItemIdx} onChange={setSelectedItemIdx} className="mt-4" stopPropagation />
      </div>
    </div>
  );
}
