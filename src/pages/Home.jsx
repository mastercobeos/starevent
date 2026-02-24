import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

const heroImages = [
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Event table setting
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Wedding reception
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Quinceañera celebration
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Party event
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Celebration
];

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language].home;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 2000); // Cambia cada 2 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center text-foreground overflow-hidden -mt-16 sm:-mt-20">
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.65)), url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          ))}
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 mt-20">
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
            <a href="https://stareventrentaltx.com/rent-supplies/" target="_blank" rel="noreferrer">
              <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold transition-transform duration-300 hover:scale-110 w-full sm:w-auto">
                {t.reserve}
              </Button>
            </a>
            <Link to={createPageUrl('Contact')}>
              <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold transition-transform duration-300 hover:scale-110 w-full sm:w-auto">
                {t.requestQuote}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.65)), url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12">
          <div 
            className="px-4 sm:px-5 py-12 sm:py-14 md:py-16 rounded-2xl shadow-xl text-center border border-navbar/20 hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl backdrop-blur-md h-auto sm:h-[480px] flex flex-col justify-center w-full max-w-[280px]"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.25) 0%, hsl(var(--navbar) / 0.35) 50%, hsl(var(--navbar) / 0.25) 100%)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            }}
          >
            <div className="mb-4 sm:mb-6 flex justify-center items-center w-full">
              <img src="/casa.png" alt="Family Owned" className="object-contain mx-auto w-20 h-20 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">{t.familyOwned}</h3>
            <p className="text-white/90 leading-relaxed text-center text-sm sm:text-base md:text-lg">
              {t.familyOwnedDesc}
            </p>
          </div>
          <div 
            className="px-4 sm:px-5 py-12 sm:py-14 md:py-16 rounded-2xl shadow-xl text-center border border-navbar/20 hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl backdrop-blur-md h-auto sm:h-[480px] flex flex-col justify-center w-full max-w-[280px]"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.25) 0%, hsl(var(--navbar) / 0.35) 50%, hsl(var(--navbar) / 0.25) 100%)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            }}
          >
            <div className="mb-4 sm:mb-6 flex justify-center items-center -mt-4 sm:-mt-8">
              <img src="/reloj.png" alt="Reliable Setup" className="object-contain w-20 h-20 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center -mt-1 sm:-mt-2">{t.reliableSetup}</h3>
            <p className="text-white/90 leading-relaxed text-center text-sm sm:text-base md:text-lg">
              {t.reliableSetupDesc}
            </p>
          </div>
          <div 
            className="px-4 sm:px-5 py-12 sm:py-14 md:py-16 rounded-2xl shadow-xl text-center border border-navbar/20 hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl backdrop-blur-md h-auto sm:h-[480px] flex flex-col justify-center w-full max-w-[280px]"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.25) 0%, hsl(var(--navbar) / 0.35) 50%, hsl(var(--navbar) / 0.25) 100%)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            }}
          >
            <div className="mb-4 sm:mb-6 flex justify-center items-center">
              <img src="/silla.png" alt="Event Ready" className="object-contain w-20 h-20 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">{t.eventReady}</h3>
            <p className="text-white/90 leading-relaxed text-center text-sm sm:text-base md:text-lg">
              {t.eventReadyDesc}
            </p>
          </div>
        </div>
        </div>
      </section>

      {/* Packages Preview Section */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.65)), url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">{t.ourPackages}</h2>
            <p className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
              {t.packagesDesc}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              { 
                badge: 'Delux', 
                price: '$749', 
                title: 'Tent 20 X 20 With Draping', 
                featured: true,
                image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                includes: [
                  '30 Garden Chairs',
                  '3 Rectangular Table +8ft',
                  'Garden Lights- Walls',
                  '1 chandelier',
                  '3 Table cloths',
                  'plus delivery and Tax'
                ]
              },
              { 
                badge: 'Basic', 
                price: '$399', 
                title: 'Tent 20x20 Without Draping', 
                featured: false,
                image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                includes: [
                  '30 Garden Chairs',
                  '3 Rectangular Table +8ft',
                  '3 Table cloths',
                  'Garden Light and walls',
                  'plus delivery and Tax'
                ]
              },
              { 
                badge: 'Basic', 
                price: '$849', 
                title: 'Tent 20x40 Without Draping', 
                featured: false,
                image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                includes: [
                  '70 Garden Chairs',
                  '7 Rectangular Table +8ft',
                  '7 Table Cloths',
                  'Garden lights',
                  'walls',
                  'plus delivery and tax'
                ]
              },
              { 
                badge: 'Delux', 
                price: '$1,299', 
                title: 'Tent 20x40 With Draping', 
                featured: true,
                image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                includes: [
                  '70 Garden Chairs',
                  '7 Rectangular Table +8ft',
                  'Garden Lights',
                  '7 Table cloths',
                  '2 chandelier',
                  'plus delivery and Tax'
                ]
              },
            ].map((pkg, idx) => (
              <div 
                key={idx}
                className={`bg-card rounded-2xl shadow-xl hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl overflow-hidden flex flex-col ${
                  pkg.featured ? 'border-2 border-primary bg-gradient-to-br from-primary/20 via-primary/10 to-card ring-2 ring-primary/20' : 'border border-border'
                }`}
              >
                <div 
                  className="h-48 bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url(${pkg.image})` }}
                />
                <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-grow">
                  <div className={`inline-block px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 ${
                    pkg.featured ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                  }`}>
                    {pkg.badge}
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3">{pkg.price}</div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-3 sm:mb-4 min-h-[3rem]">{pkg.title}</h3>
                  <ul className="mb-4 sm:mb-6 space-y-1.5 sm:space-y-2 text-left flex-grow">
                    {pkg.includes.map((item, i) => (
                      <li key={i} className="text-xs sm:text-sm text-white/90 flex items-start gap-2">
                        <span className="text-primary mt-0.5 sm:mt-1 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={createPageUrl('Products')} className="block mt-auto">
                    <Button className="w-full font-semibold py-4 sm:py-5 md:py-6 text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl">
                      {t.bookNow}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <Link to={createPageUrl('Products')}>
              <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
                {t.viewAllPackages}
              </Button>
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* CTA Section with Text Block */}
      <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-white text-lg sm:text-2xl md:text-3xl font-medium mb-6 sm:mb-8 leading-relaxed px-4">
                {t.ctaTitle}
              </p>
              <div className="flex justify-center">
                <Link to={createPageUrl('About')}>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-md shadow-lg hover:shadow-xl transition-all">
                    {t.learnMore}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div 
          className="absolute inset-0 z-10 backdrop-blur-md py-8 sm:py-12 md:py-16" 
          style={{
            background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.25) 0%, hsl(var(--navbar) / 0.35) 50%, hsl(var(--navbar) / 0.25) 100%)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          }}
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 sm:mb-2">1K+</div>
              <div className="text-xs sm:text-sm md:text-lg lg:text-xl text-white/90">{t.eventInHouston}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 sm:mb-2">2K+</div>
              <div className="text-xs sm:text-sm md:text-lg lg:text-xl text-white/90">{t.happyCustomer}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 sm:mb-2">4.7</div>
              <div className="text-xs sm:text-sm md:text-lg lg:text-xl text-white/90">{t.companyRating}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 sm:mb-2">3+</div>
              <div className="text-xs sm:text-sm md:text-lg lg:text-xl text-white/90">{t.yearsExperience}</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
