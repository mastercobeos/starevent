import { memo } from 'react';
import Image from 'next/image';
import { BackgroundSection } from '../ui/BackgroundSection';
import { GlassCard } from '../ui/GlassCard';
import { translations } from '../../translations';
import { productCards } from '../../data/homeData';

const BG_IMAGE = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=70';

export const ProductsSection = memo(function ProductsSection({ language, onSelectProduct }) {
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
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-5xl mx-auto">
          {productCards.map((product, idx) => (
            <div
              key={idx}
              className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] rounded-2xl overflow-hidden shadow-xl hover:-translate-y-3 transition-[transform,box-shadow] duration-300 hover:shadow-2xl group cursor-pointer border-2 border-[#C9A84C]"
              onClick={() => onSelectProduct(idx)}
            >
              <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden">
                <Image
                  src={product.image}
                  alt={language === 'en' ? product.name : product.nameEs}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`object-cover transition-transform duration-500 group-hover:scale-110 ${product.name === 'Tablecloths' || product.name === 'Tents' ? 'object-bottom' : 'object-center'}`}
                  loading="lazy"
                  quality={75}
                />
              </div>
              <GlassCard variant="dark" className="px-4 py-2 sm:px-5 sm:py-2.5 backdrop-blur-md">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {language === 'en' ? product.name : product.nameEs}
                </h3>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </BackgroundSection>
  );
});
