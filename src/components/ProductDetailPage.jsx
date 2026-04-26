'use client';

import { memo, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { translations } from '../translations';
import { BackgroundSection } from './ui/BackgroundSection';
import { Button } from './ui/button';

const RELATED_BG = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=70';

export const ProductDetailPage = memo(function ProductDetailPage({ category, item }) {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const isEs = language === 'es';
  const tc = translations[language].cart;
  const prefix = isEs ? '/es' : '';

  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [added, setAdded] = useState(false);

  const toggleAddon = useCallback((addonId) => {
    setSelectedAddons((prev) => ({ ...prev, [addonId]: !prev[addonId] }));
  }, []);

  const finalPrice = item.addons
    ? item.addons.reduce((total, addon) => total + (selectedAddons[addon.id] ? addon.price : 0), item.price)
    : item.price;

  const handleQtyChange = (value) => {
    if (value === '') return setQuantity('');
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 1) return;
    setQuantity(num);
  };

  const handleAdd = useCallback(() => {
    const parsed = parseInt(quantity, 10);
    const safeQty = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
    const addonNames = item.addons
      ? item.addons.filter((a) => selectedAddons[a.id]).map((a) => (isEs ? a.nameEs : a.name))
      : [];
    const itemId = item.id + (addonNames.length ? '-with-addons' : '');
    const itemName = addonNames.length ? `${item.name} + ${addonNames.join(', ')}` : item.name;
    const itemNameEs = addonNames.length ? `${item.nameEs} + ${addonNames.join(', ')}` : item.nameEs;
    addItem({ ...item, id: itemId, name: itemName, nameEs: itemNameEs, price: finalPrice }, safeQty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }, [addItem, finalPrice, isEs, item, quantity, selectedAddons]);

  const itemName = isEs ? item.nameEs || item.name : item.name;
  const itemDesc = isEs ? item.descEs || item.desc : item.desc;
  const categoryName = isEs ? category.nameEs : category.name;
  const relatedItems = category.items.filter((i) => i.id !== item.id).slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <BackgroundSection imageSrc={category.image} className="py-20 sm:py-28 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-primary text-sm sm:text-base font-semibold mb-3 uppercase tracking-wider">
            {categoryName}
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            {itemName}
          </h1>
          <p className="text-2xl sm:text-3xl md:text-4xl text-primary font-bold">
            ${item.price.toFixed(2)}
            {item.price < 100 && (
              <span className="text-base sm:text-lg text-white/70 font-normal ml-1">
                {isEs ? '/ unidad' : '/ each'}
              </span>
            )}
          </p>
        </div>
      </BackgroundSection>

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="bg-slate-950 pt-6 pb-0">
        <ol className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-2 text-sm text-white/50">
          <li>
            <Link href={`${prefix}/`} className="hover:text-primary transition-colors">
              {isEs ? 'Inicio' : 'Home'}
            </Link>
          </li>
          <li><span className="mx-1">/</span></li>
          <li>
            <Link href={`${prefix}/products/${category.slug}`} className="hover:text-primary transition-colors">
              {categoryName}
            </Link>
          </li>
          <li><span className="mx-1">/</span></li>
          <li>
            <span className="text-white/80">{itemName}</span>
          </li>
        </ol>
      </nav>

      {/* Main product detail */}
      <section className="py-12 sm:py-16 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 items-start">
            {/* Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C9A84C] bg-slate-900">
              <Image
                src={item.image}
                alt={isEs ? `${itemName} para renta en Houston TX - Star Event Rental` : `${itemName} for rent in Houston TX - Star Event Rental`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
                priority
                quality={85}
              />
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {itemName}
              </h2>
              <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-6">
                {itemDesc}
              </p>

              <div className="border-t border-white/10 pt-6 mb-6">
                <p className="text-3xl sm:text-4xl font-bold text-primary">
                  ${finalPrice.toFixed(2)}
                  {item.price < 100 && (
                    <span className="text-base text-white/70 font-normal ml-1">
                      {isEs ? '/ unidad' : '/ each'}
                    </span>
                  )}
                </p>
                <p className="text-white/50 text-xs mt-1">
                  {isEs ? '+ impuestos y envío' : '+ tax & delivery'}
                </p>
              </div>

              {/* Addons */}
              {item.addons && item.addons.length > 0 && (
                <div className="mb-6 space-y-2">
                  <p className="text-white/80 text-sm font-medium mb-2">
                    {isEs ? 'Extras opcionales:' : 'Optional add-ons:'}
                  </p>
                  {item.addons.map((addon) => (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`flex items-center gap-2 w-full text-left rounded-lg px-3 py-2 transition-all text-sm border ${
                        selectedAddons[addon.id]
                          ? 'border-primary bg-primary/15 text-white'
                          : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded border transition-all shrink-0 ${
                          selectedAddons[addon.id] ? 'bg-primary border-primary text-black' : 'border-white/40'
                        }`}
                      >
                        {selectedAddons[addon.id] && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="flex-1">{isEs ? addon.nameEs : addon.name}</span>
                      <span className="font-semibold text-primary">+${addon.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Quantity + Add to cart */}
              <div className="mb-4">
                <label htmlFor="qty" className="block text-white/80 text-sm font-medium mb-2">
                  {isEs ? 'Cantidad' : 'Quantity'}
                </label>
                <input
                  id="qty"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => handleQtyChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={added}
                className={`w-full font-bold py-4 px-6 rounded-lg transition-colors text-base sm:text-lg shadow-lg ${
                  added
                    ? 'bg-green-600 text-white cursor-default'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {added ? tc.addedToCart : tc.addToCart}
              </button>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Link href={`${prefix}/contact`} className="flex-1">
                  <Button variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground py-3 font-semibold">
                    {isEs ? 'Cotización Gratis' : 'Free Quote'}
                  </Button>
                </Link>
                <a href="tel:+12816360615" className="flex-1">
                  <Button variant="outline" className="w-full border-2 border-white/50 text-white hover:bg-white/10 py-3 font-semibold">
                    {isEs ? 'Llamar' : 'Call Us'}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related items */}
      {relatedItems.length > 0 && (
        <BackgroundSection imageSrc={RELATED_BG} className="py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-4xl font-bold text-white text-center mb-8 sm:mb-12">
              {isEs ? `Más en ${categoryName}` : `More in ${categoryName}`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedItems.map((rel) => (
                <Link
                  key={rel.id}
                  href={`${prefix}/products/${category.slug}/${rel.id}`}
                  className="rounded-2xl overflow-hidden shadow-xl border-2 border-[#C9A84C] group flex flex-col bg-slate-900 hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <Image
                      src={rel.image}
                      alt={isEs ? `${rel.nameEs || rel.name} para renta en Houston TX` : `${rel.name} for rent in Houston TX`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                  <div
                    className="px-4 py-4 flex flex-col flex-1"
                    style={{
                      background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)',
                    }}
                  >
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {isEs ? rel.nameEs || rel.name : rel.name}
                    </h3>
                    <p className="text-primary font-semibold text-base mt-1">
                      ${rel.price.toFixed(2)}
                      {rel.price < 100 ? (isEs ? ' / unidad' : ' / each') : ''}
                    </p>
                    <span className="mt-2 text-primary text-sm font-semibold">
                      {isEs ? 'Ver detalles →' : 'See details →'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href={`${prefix}/products/${category.slug}`}>
                <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-4 font-semibold">
                  {isEs ? `Ver todos en ${categoryName} →` : `View all ${categoryName} →`}
                </Button>
              </Link>
            </div>
          </div>
        </BackgroundSection>
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
