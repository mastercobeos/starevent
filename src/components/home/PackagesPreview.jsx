'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BackgroundSection } from '../ui/BackgroundSection';

const BG_IMAGE = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=70';

const previewCards = [
  { badge: 'Deluxe', image: '/tentdeluxe1.webp' },
  { badge: 'Basic', image: '/basic1.webp' },
];

export const PackagesPreview = memo(function PackagesPreview({ t, onSelectPackage, language }) {
  const isEs = language === 'es';
  const prefix = isEs ? '/es' : '';

  return (
    <BackgroundSection imageSrc={BG_IMAGE} id="packages" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">{t.ourPackages}</h2>
            <p className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
              {t.packagesDesc}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto">
            {previewCards.map((pkg, idx) => (
              <div key={idx} onClick={() => onSelectPackage(pkg.badge)}>
                <div className="relative rounded-2xl shadow-xl hover:-translate-y-3 transition-[transform,box-shadow] duration-300 hover:shadow-2xl overflow-hidden h-[280px] sm:h-[350px] md:h-[400px] group cursor-pointer">
                  <Image src={pkg.image} alt={`${pkg.badge} event rental package - tents, tables & chairs in Houston TX`} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover object-center transition-transform duration-500 group-hover:scale-110" loading="lazy" quality={75} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      pkg.badge === 'Deluxe' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                    }`}>
                      {pkg.badge}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 sm:mt-12 flex justify-center">
            <Link
              href={`${prefix}/customize`}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full backdrop-blur-sm border-2 border-[#C9A84C] text-foreground font-bold text-base sm:text-lg transition-[transform,box-shadow] duration-300 hover:scale-110 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)',
                backdropFilter: 'blur(8px) saturate(180%)',
                WebkitBackdropFilter: 'blur(8px) saturate(180%)',
              }}
            >
              {isEs ? 'Personalizar' : 'Customize'}
            </Link>
          </div>
        </div>
      </div>
    </BackgroundSection>
  );
});
