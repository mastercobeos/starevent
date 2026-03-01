import { useState, useCallback, useEffect, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useSwipe } from '../../hooks/useSwipe';
import { heroImages } from '../../data/homeData';

export const HeroSection = memo(function HeroSection({ t }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goNext = useCallback(() => setCurrentImageIndex((prev) => (prev + 1) % heroImages.length), []);
  const goPrev = useCallback(() => setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length), []);
  const swipe = useSwipe(goNext, goPrev);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-center text-foreground overflow-hidden -mt-[3.2rem] sm:-mt-16"
      {...swipe}
    >
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => {
          const isVisible = index === currentImageIndex;
          const isNext = index === (currentImageIndex + 1) % heroImages.length;
          if (!isVisible && !isNext) return (
            <div key={index} className="absolute inset-0 opacity-0" aria-hidden="true" />
          );
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden={!isVisible}
            >
              <Image
                src={image}
                alt={`Star Event Rental - Event setup ${index + 1}`}
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority={index === 0}
                quality={75}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 to-slate-900/65" />
            </div>
          );
        })}
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 mt-[50px]">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            {t.welcome} <br />
            <span className="text-primary italic">{t.companyName}</span> {t.location}
          </h1>
          <p className="text-base sm:text-xl md:text-2xl mb-3 sm:mb-4 text-foreground font-light">
            {t.subtitle}
          </p>
          <p className="text-sm sm:text-lg md:text-xl mb-8 sm:mb-10 text-foreground max-w-3xl mx-auto">
            {t.description}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <a href="#products">
            <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold transition-transform duration-300 hover:scale-110 w-full sm:w-auto">
              {t.reserve}
            </Button>
          </a>
          <Link href="/contact">
            <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold transition-transform duration-300 hover:scale-110 w-full sm:w-auto">
              {t.requestQuote}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});
