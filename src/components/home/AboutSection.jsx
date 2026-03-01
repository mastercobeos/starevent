import { memo } from 'react';
import Image from 'next/image';
import { BackgroundSection } from '../ui/BackgroundSection';
import { translations } from '../../translations';

const BG_IMAGE = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=70';

export const AboutSection = memo(function AboutSection({ language }) {
  const about = translations[language].about;

  const benefits = [
    { icon: '/diamante.png', isImage: true, filter: 'invert(70%) sepia(60%) saturate(500%) hue-rotate(10deg) brightness(90%) contrast(90%)', imgStyle: { transform: 'scale(0.85)' }, title: about.personalizedService, desc: about.personalizedServiceDesc },
    { icon: '/reloj.png', isImage: true, filter: 'invert(75%) sepia(80%) saturate(600%) hue-rotate(10deg) brightness(110%) contrast(100%)', imgStyle: { transform: 'scale(1.3)' }, title: about.punctuality, desc: about.punctualityDesc },
    { icon: '/quality.png', isImage: true, filter: 'invert(70%) sepia(60%) saturate(500%) hue-rotate(10deg) brightness(90%) contrast(90%)', title: about.quality, desc: about.qualityDesc },
    { icon: '/casa.png', isImage: true, filter: 'invert(75%) sepia(80%) saturate(600%) hue-rotate(10deg) brightness(110%) contrast(100%)', title: about.familyBusiness, desc: about.familyBusinessDesc },
  ];

  return (
    <BackgroundSection imageSrc={BG_IMAGE} id="about" className="py-16 sm:py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <Image
              src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="Star Event Rental professional event setup with elegant table decorations in Houston TX"
              width={800}
              height={533}
              className="rounded-2xl shadow-lg w-full"
            />
          </div>
          <div>
            <h4 className="text-primary uppercase text-xs sm:text-sm font-bold tracking-wider mb-2">
              {about.whyChoose}
            </h4>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
              {about.inspire}
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex gap-3 sm:gap-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 flex items-center justify-center overflow-hidden group/icon"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
                      backdropFilter: 'blur(12px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                    }}
                  >
                    <div className="transition-transform duration-300 group-hover/icon:scale-125">
                      <Image
                        src={benefit.icon}
                        alt={benefit.title}
                        width={48}
                        height={48}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                        style={{ ...(benefit.filter ? { filter: benefit.filter } : {}), ...(benefit.imgStyle || {}) }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">{benefit.title}</h3>
                    <p className="text-white/80 text-sm sm:text-base leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BackgroundSection>
  );
});
