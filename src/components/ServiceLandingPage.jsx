'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { BackgroundSection } from './ui/BackgroundSection';
import { Button } from './ui/button';
import { ReviewsSection } from './home/ReviewsSection';
import { translations } from '../translations';

export const ServiceLandingPage = memo(function ServiceLandingPage({ service }) {
  const { language } = useLanguage();
  const t = translations[language].home;
  const isEs = language === 'es';

  const prefix = isEs ? '/es' : '';
  const h1 = isEs ? service.h1Es : service.h1;
  const subtitle = isEs ? service.heroSubtitleEs : service.heroSubtitle;
  const intro = isEs ? service.introEs : service.intro;
  const faq = service.faq;

  // Get products to display: either specific items or full categories
  const products = service.specificItems || (service.productCategories || []).flatMap((cat) =>
    cat.items.map((item) => ({ ...item, categoryName: isEs ? cat.nameEs : cat.name }))
  );

  return (
    <main>
      {/* Hero Section */}
      <BackgroundSection imageSrc={service.heroImage} className="py-24 sm:py-32 md:py-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {h1}
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href={`${prefix}/contact`}>
              <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-5 text-lg font-semibold transition-transform duration-300 hover:scale-110 w-full sm:w-auto">
                {isEs ? 'Cotización Gratis' : 'Free Quote'}
              </Button>
            </Link>
            <a href="tel:+12816360615">
              <Button variant="outline" className="border-2 border-white/50 text-white hover:bg-white/10 px-8 py-5 text-lg font-semibold transition-transform duration-300 hover:scale-110 w-full sm:w-auto">
                {isEs ? 'Llamar: 281-636-0615' : 'Call: 281-636-0615'}
              </Button>
            </a>
          </div>
        </div>
      </BackgroundSection>

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="bg-slate-950 pt-6 pb-0">
        <ol className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-sm text-white/50">
          <li>
            <Link href={`${prefix}/`} className="hover:text-primary transition-colors">
              {isEs ? 'Inicio' : 'Home'}
            </Link>
          </li>
          <li><span className="mx-1">/</span></li>
          <li>
            <span className="text-white/80">{h1}</span>
          </li>
        </ol>
      </nav>

      {/* Introduction / Description Section */}
      <section className="py-12 sm:py-16 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-white/90 text-base sm:text-lg leading-relaxed text-center">
            {intro}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      {service.contentSections && service.contentSections.length > 0 && (
        <section className="py-12 sm:py-16 bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
            {service.contentSections.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                  {isEs ? section.titleEs : section.title}
                </h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                  {isEs ? section.textEs : section.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <BackgroundSection
          imageSrc="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=70"
          className="py-16 sm:py-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-10 sm:mb-14">
              {isEs ? 'Nuestros Productos' : 'Our Products'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl overflow-hidden shadow-xl border-2 border-[#C9A84C] group"
                >
                  <div className="relative h-56 sm:h-64 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={isEs ? `${item.nameEs || item.name} para renta en Houston TX - Star Event Rental` : `${item.name} for rent in Houston TX - Star Event Rental`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                  <div className="px-4 py-3 backdrop-blur-md" style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)',
                  }}>
                    <h3 className="text-lg font-bold text-white">
                      {isEs ? (item.nameEs || item.name) : item.name}
                    </h3>
                    <p className="text-primary font-semibold text-sm">
                      ${item.price?.toFixed(2)}
                      {item.price < 100 ? (isEs ? ' / unidad' : ' / each') : ''}
                    </p>
                    <p className="text-white/70 text-xs mt-1 line-clamp-2">
                      {isEs ? (item.descEs || item.desc) : item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {(service.productCategories || []).map((cat) => (
                <Link key={cat.slug} href={`${prefix}/products/${cat.slug}`}>
                  <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-4 text-base font-semibold">
                    {isEs ? cat.nameEs : cat.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </BackgroundSection>
      )}

      {/* FAQ Section */}
      {faq && faq.length > 0 && (
        <section className="py-12 sm:py-16 bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-4xl font-bold text-white text-center mb-8 sm:mb-12">
              {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-6">
              {faq.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-5 sm:p-6 border border-white/15"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                  }}
                >
                  <h3 className="text-base sm:text-lg font-bold text-primary mb-2">
                    {isEs ? item.qEs : item.q}
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                    {isEs ? item.aEs : item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Service Areas */}
      <section className="py-10 sm:py-12 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            {isEs ? 'Áreas de Servicio' : 'Service Areas'}
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            Houston, Katy, Cypress, Richmond, Rosenberg, Sugar Land, The Woodlands, Baytown, Tomball, Spring, Humble, Pearland
          </p>
        </div>
      </section>

      {/* Reviews */}
      <ReviewsSection t={t} />

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {isEs ? '¿Listo para Reservar?' : 'Ready to Book?'}
          </h2>
          <p className="text-white/80 mb-8 text-sm sm:text-base">
            {isEs
              ? 'Contáctanos hoy para una cotización gratis. Entrega e instalación profesional incluida.'
              : 'Contact us today for a free quote. Professional delivery and setup included.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`${prefix}/contact`}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-5 text-lg font-bold rounded-lg border-2 border-[#C9A84C] w-full sm:w-auto">
                {isEs ? 'Solicitar Cotización' : 'Request a Quote'}
              </Button>
            </Link>
            <a href="https://wa.me/12816360615" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-2 border-green-500 text-green-400 hover:bg-green-500/10 px-8 py-5 text-lg font-semibold w-full sm:w-auto">
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
});
