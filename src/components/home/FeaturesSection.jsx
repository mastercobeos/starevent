import { memo } from 'react';
import Image from 'next/image';
import { BackgroundSection } from '../ui/BackgroundSection';
import { GlassCard } from '../ui/GlassCard';

const BG_IMAGE = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=70';

export const FeaturesSection = memo(function FeaturesSection({ t }) {
  const features = [
    { icon: '/casa.png', title: t.familyOwned, desc: t.familyOwnedDesc, iconClass: '' },
    { icon: '/reloj.png', title: t.reliableSetup, desc: t.reliableSetupDesc, iconClass: '-mt-4 sm:-mt-8', titleClass: '-mt-1 sm:-mt-2' },
    { icon: '/silla.png', title: t.eventReady, desc: t.eventReadyDesc, iconClass: '' },
  ];

  return (
    <BackgroundSection imageSrc={BG_IMAGE} className="py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12">
          {features.map((feature, idx) => (
            <GlassCard
              key={idx}
              variant="navbar"
              className={`px-4 sm:px-5 py-12 sm:py-14 md:py-16 rounded-2xl shadow-xl text-center border-2 border-[#C9A84C] hover:-translate-y-3 transition-[transform,box-shadow] duration-300 hover:shadow-2xl backdrop-blur-sm h-auto sm:h-[480px] flex flex-col justify-center w-full max-w-sm sm:max-w-[280px]`}
            >
              <div className={`mb-4 sm:mb-6 flex justify-center items-center ${feature.iconClass}`}>
                <Image src={feature.icon} alt={feature.title} width={120} height={120} className="object-contain mx-auto w-20 h-20 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px]" />
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center ${feature.titleClass || ''}`}>{feature.title}</h3>
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
