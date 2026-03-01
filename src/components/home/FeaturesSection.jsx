import { memo } from 'react';
import Image from 'next/image';
import { BackgroundSection } from '../ui/BackgroundSection';
import { GlassCard } from '../ui/GlassCard';

const BG_IMAGE = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=70';

export const FeaturesSection = memo(function FeaturesSection({ t }) {
  const goldFilter = 'invert(75%) sepia(80%) saturate(600%) hue-rotate(10deg) brightness(110%) contrast(100%)';
  const features = [
    { icon: '/casa.png', filter: goldFilter, size: 56, title: t.familyOwned, desc: t.familyOwnedDesc },
    { icon: '/reloj.png', filter: goldFilter, size: 56, title: t.reliableSetup, desc: t.reliableSetupDesc },
    { icon: '/silla.png', filter: goldFilter, size: 56, title: t.eventReady, desc: t.eventReadyDesc },
  ];

  return (
    <BackgroundSection imageSrc={BG_IMAGE} className="py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12">
          {features.map((feature, idx) => (
            <GlassCard
              key={idx}
              variant="navbar"
              className={`px-4 sm:px-5 pt-10 sm:pt-12 md:pt-14 pb-12 sm:pb-14 md:pb-16 rounded-2xl shadow-xl text-center border-2 border-[#C9A84C] hover:-translate-y-3 transition-[transform,box-shadow] duration-300 hover:shadow-2xl backdrop-blur-sm h-auto sm:h-[480px] flex flex-col items-center w-full max-w-sm sm:max-w-[280px]`}
            >
              <div className="mb-4 sm:mb-6 flex justify-center items-center h-14 sm:h-16 md:h-[72px]">
                <Image src={feature.icon} alt={feature.title} width={feature.size} height={feature.size} className="object-contain mx-auto w-auto" style={{ filter: feature.filter, maxHeight: feature.size }} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">{feature.title}</h3>
              <p className="text-white/90 leading-relaxed text-center text-sm sm:text-base md:text-lg">
                {feature.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </BackgroundSection>
  );
});
