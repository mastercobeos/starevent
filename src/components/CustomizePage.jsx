'use client';

import { memo, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { productCards } from '../data/homeData';
import { translations } from '../translations';
import { Button } from './ui/button';

const FIXED_BG = '/fondo1.webp';

export const CustomizePage = memo(function CustomizePage() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const isEs = language === 'es';
  const tc = translations[language].cart;
  const prefix = isEs ? '/es' : '';

  const [quantities, setQuantities] = useState({});
  const [adding, setAdding] = useState(null);

  const handleQtyChange = useCallback((id, value) => {
    if (value === '') {
      setQuantities((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 1) return;
    setQuantities((prev) => ({ ...prev, [id]: num }));
  }, []);

  const handleAdd = useCallback(
    (item) => {
      const raw = quantities[item.id];
      const parsed = parseInt(raw, 10);
      const safeQty = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
      addItem(item, safeQty);
      setAdding(item.id);
      setTimeout(() => setAdding((curr) => (curr === item.id ? null : curr)), 1500);
    },
    [addItem, quantities]
  );

  return (
    <main className="relative">
      {/* Fixed background — stays static while content scrolls (AHOME pattern) */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <Image
          src={FIXED_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/55 to-slate-900/75" />
      </div>

      {/* Content layered above the fixed background */}
      <div className="relative z-10">
        {/* Hero */}
        <section className="py-24 sm:py-32 md:py-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              {isEs ? 'Arma tu Renta Personalizada' : 'Build Your Custom Rental'}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto">
              {isEs
                ? 'Elige los productos y cantidades exactas que necesitas para tu evento en Houston, TX. Carpas, mesas, sillas, manteles, pistas de baile y más.'
                : 'Choose the exact products and quantities you need for your event in Houston, TX. Tents, tables, chairs, linens, dance floors and more.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href={`${prefix}/contact`}>
                <Button
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-5 text-lg font-semibold transition-transform duration-300 hover:scale-110 w-full sm:w-auto"
                >
                  {isEs ? 'Cotización Gratis' : 'Free Quote'}
                </Button>
              </Link>
              <a href="tel:+12816360615">
                <Button
                  variant="outline"
                  className="border-2 border-white/50 text-white hover:bg-white/10 px-8 py-5 text-lg font-semibold transition-transform duration-300 hover:scale-110 w-full sm:w-auto"
                >
                  {isEs ? 'Llamar: 281-636-0615' : 'Call: 281-636-0615'}
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="pt-2 pb-0">
          <ol className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-sm text-white/60">
            <li>
              <Link href={`${prefix}/`} className="hover:text-primary transition-colors">
                {isEs ? 'Inicio' : 'Home'}
              </Link>
            </li>
            <li>
              <span className="mx-1">/</span>
            </li>
            <li>
              <span className="text-white/85">{isEs ? 'Arma tu Propio Paquete' : 'Build your own Package'}</span>
            </li>
          </ol>
        </nav>

        {/* Intro */}
        <section className="py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-white/90 text-base sm:text-lg leading-relaxed">
              {isEs
                ? 'Ingresa la cantidad que necesitas en cada producto y agrégalos a tu carrito. Combina carpas, mesas, sillas, manteles y extras para armar la renta perfecta para tu evento.'
                : 'Enter the quantity you need for each product and add it to your cart. Combine tents, tables, chairs, linens and extras to build the perfect rental for your event.'}
            </p>
          </div>
        </section>

        {/* Products Grid (grouped by category) */}
        <section className="py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16 sm:space-y-20">
            {productCards.map((category) => (
              <section key={category.slug} aria-labelledby={`cat-${category.slug}`}>
                <div className="text-center mb-8 sm:mb-10">
                  <h2
                    id={`cat-${category.slug}`}
                    className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3"
                  >
                    {isEs ? category.nameEs : category.name}
                  </h2>
                  <Link
                    href={`${prefix}/products/${category.slug}`}
                    className="text-primary text-sm hover:underline inline-block"
                  >
                    {isEs ? 'Ver detalles de la categoría →' : 'See category details →'}
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item) => {
                    const isAdded = adding === item.id;
                    const qtyVal = quantities[item.id] ?? 1;
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl overflow-hidden shadow-xl border-2 border-[#C9A84C] group flex flex-col"
                      >
                        <div className="relative h-36 sm:h-44 md:h-52 overflow-hidden">
                          <Image
                            src={item.image}
                            alt={
                              isEs
                                ? `${item.nameEs || item.name} para renta en Houston TX - Star Event Rental`
                                : `${item.name} for rent in Houston TX - Star Event Rental`
                            }
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            quality={75}
                          />
                        </div>
                        <div
                          className="px-4 py-4 backdrop-blur-md flex flex-col flex-1"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)',
                          }}
                        >
                          <h3 className="text-lg font-bold text-white">
                            {isEs ? item.nameEs || item.name : item.name}
                          </h3>
                          <p className="text-primary font-semibold text-base mt-1">
                            ${item.price.toFixed(2)}
                            {item.price < 100 ? (isEs ? ' / unidad' : ' / each') : ''}
                          </p>
                          <p className="text-white/70 text-sm mt-2 leading-relaxed flex-1">
                            {isEs ? item.descEs || item.desc : item.desc}
                          </p>
                          <div className="mt-3">
                            <label
                              htmlFor={`qty-${item.id}`}
                              className="block text-white/80 text-xs font-medium mb-1"
                            >
                              {isEs ? 'Cantidad' : 'Quantity'}
                            </label>
                            <input
                              id={`qty-${item.id}`}
                              type="number"
                              min="1"
                              inputMode="numeric"
                              value={qtyVal}
                              onChange={(e) => handleQtyChange(item.id, e.target.value)}
                              placeholder={isEs ? 'Ej: 150' : 'e.g. 150'}
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAdd(item)}
                            disabled={isAdded}
                            className={`mt-3 w-full font-semibold py-2 px-4 rounded-lg transition-colors text-sm ${
                              isAdded
                                ? 'bg-green-600 text-white cursor-default'
                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            }`}
                          >
                            {isAdded ? tc.addedToCart : tc.addToCart}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {isEs ? '¿Listo para Reservar?' : 'Ready to Book?'}
            </h2>
            <p className="text-white/80 mb-8 text-sm sm:text-base">
              {isEs
                ? 'Revisa tu carrito en la parte superior y procede al pago para confirmar tu reservación. Entrega e instalación profesional incluida.'
                : 'Review your cart at the top and proceed to checkout to confirm your reservation. Professional delivery and setup included.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`${prefix}/contact`}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-5 text-lg font-bold rounded-lg border-2 border-[#C9A84C] w-full sm:w-auto">
                  {isEs ? 'Solicitar Cotización' : 'Request a Quote'}
                </Button>
              </Link>
              <a href="https://wa.me/12816360615" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="border-2 border-green-500 text-green-400 hover:bg-green-500/10 px-8 py-5 text-lg font-semibold w-full sm:w-auto"
                >
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
});
