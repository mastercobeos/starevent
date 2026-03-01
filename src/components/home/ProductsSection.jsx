import { useState, useCallback, memo } from 'react';
import Image from 'next/image';
import { BackgroundSection } from '../ui/BackgroundSection';
import { GlassCard } from '../ui/GlassCard';
import { CarouselArrow } from '../ui/CarouselArrow';
import { PaginationDots } from '../ui/PaginationDots';
import { useResponsiveCount } from '../../hooks/useResponsiveCount';
import { useSwipe } from '../../hooks/useSwipe';
import { translations } from '../../translations';
import { productCards } from '../../data/homeData';

const BG_IMAGE = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=70';

export const ProductsSection = memo(function ProductsSection({ language, onSelectProduct }) {
  const [productIndex, setProductIndex] = useState(0);

  const visibleProducts = useResponsiveCount(
    [[640, 1], [768, 2], [Infinity, 3]],
    useCallback((v) => setProductIndex((prev) => Math.min(prev, productCards.length - v)), [])
  );

  const totalDots = Math.max(1, productCards.length - visibleProducts + 1);

  const goNext = useCallback(() => setProductIndex((prev) => prev >= productCards.length - visibleProducts ? 0 : prev + 1), [visibleProducts]);
  const goPrev = useCallback(() => setProductIndex((prev) => prev <= 0 ? productCards.length - visibleProducts : prev - 1), [visibleProducts]);
  const swipe = useSwipe(goNext, goPrev);

  return (
    <BackgroundSection imageSrc={BG_IMAGE} id="products" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
            {translations[language].products.productsWeOffer}
          </h2>
          <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto">
            {translations[language].products.qualityRental}
          </p>
        </div>
        <div className="relative flex items-center gap-2 sm:gap-4 max-w-5xl mx-auto" {...swipe}>
          <CarouselArrow
            direction="left"
            onClick={() => setProductIndex((prev) => prev <= 0 ? productCards.length - visibleProducts : prev - 1)}
            ariaLabel="Previous products"
          />
          <div className="overflow-hidden w-full">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${productIndex * (100 / visibleProducts)}%)` }}
            >
              {productCards.map((product, idx) => (
                <div key={idx} className="shrink-0 px-2 sm:px-3" style={{ width: `${100 / visibleProducts}%` }}>
                  <div
                    className="rounded-2xl overflow-hidden shadow-xl hover:-translate-y-3 transition-[transform,box-shadow] duration-300 hover:shadow-2xl group cursor-pointer border-2 border-[#C9A84C]"
                    onClick={() => onSelectProduct(idx)}
                  >
                    <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden">
                      <Image src={product.image} alt={language === 'en' ? product.name : product.nameEs} fill sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" className="object-cover object-center transition-transform duration-500 group-hover:scale-110" loading="lazy" quality={75} />
                    </div>
                    <GlassCard variant="dark" className="px-4 py-2 sm:px-5 sm:py-2.5 backdrop-blur-md">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                        {language === 'en' ? product.name : product.nameEs}
                      </h3>
                    </GlassCard>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <CarouselArrow
            direction="right"
            onClick={() => setProductIndex((prev) => prev >= productCards.length - visibleProducts ? 0 : prev + 1)}
            ariaLabel="Next products"
          />
        </div>
        <PaginationDots total={totalDots} current={productIndex} onChange={setProductIndex} className="mt-6" />
      </div>
    </BackgroundSection>
  );
});
