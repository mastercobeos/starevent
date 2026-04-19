'use client';

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, ShoppingCart, Plus, Minus, Trash2, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { translations } from '../translations';

const CheckoutForm = lazy(() => import('./CheckoutForm'));

const getNavLinks = (language) => {
  const prefix = language === 'es' ? '/es' : '';
  return [
    { name: translations[language].nav.home, href: `${prefix}/` },
    { name: translations[language].nav.packages, anchor: '#packages' },
    { name: translations[language].nav.products, anchor: '#products' },
    { name: translations[language].nav.about, anchor: '#about' },
    { name: translations[language].nav.contact, href: `${prefix}/contact` },
  ];
};

export default function Layout({ children }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const rafRef = useRef(null);
  const { language, toggleLanguage } = useLanguage();
  const { items, removeItem, updateQuantity, clearCart, getTotal, getTotalItems } = useCart();
  const pathname = usePathname();
  const tc = translations[language].cart;

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const previousScrollY = lastScrollYRef.current;
        setIsScrolled(currentScrollY > 50);
        if (currentScrollY < 50) {
          setIsNavbarVisible(true);
        } else if (currentScrollY > previousScrollY && currentScrollY > 100) {
          setIsNavbarVisible(false);
        } else if (currentScrollY < previousScrollY) {
          setIsNavbarVisible(true);
        }
        lastScrollYRef.current = currentScrollY;
        rafRef.current = null;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsAnyModalOpen(document.body.dataset.modalOpen === 'true');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-modal-open'] });
    return () => observer.disconnect();
  }, []);

  const prefix = language === 'es' ? '/es' : '';
  const isHomePage = pathname === '/' || pathname === '/es' || pathname === '/en';
  const isDesignerPage = pathname === '/designer' || pathname === '/es/designer' || pathname === '/en/designer';
  const totalItems = getTotalItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-[opacity,transform] duration-500 ease-in-out backdrop-blur-sm ${
          isNavbarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)',
          backdropFilter: 'blur(8px) saturate(180%)',
          WebkitBackdropFilter: 'blur(8px) saturate(180%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 relative">
          <div className="flex items-center justify-between h-[3.2rem] sm:h-16 md:h-[4.8rem]">
            {/* Logo */}
            <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 sm:gap-3 group flex-shrink-0 z-10">
              <Image
                src="/logo.png"
                alt="Star Event Rental - Event Rentals in Houston TX"
                width={180}
                height={72}
                className="h-8 sm:h-10 md:h-[3.2rem] lg:h-[4.5rem] w-auto object-contain group-hover:opacity-90 transition-opacity"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2 md:gap-3 lg:gap-4 xl:gap-6 absolute left-1/2 transform -translate-x-1/2">
              {getNavLinks(language).map((link) => {
                if (link.anchor) {
                  return (
                    <a
                      key={link.name}
                      href={isHomePage ? link.anchor : `${prefix}/${link.anchor}`}
                      className="text-muted-foreground hover:text-primary transition-[color,transform] duration-300 text-xs md:text-sm lg:text-base xl:text-lg font-medium inline-block hover:scale-110 hover:translate-x-1 whitespace-nowrap px-1 md:px-2 cursor-pointer"
                    >
                      {link.name}
                    </a>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={link.href === '/' ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : undefined}
                    className="text-muted-foreground hover:text-primary transition-[color,transform] duration-300 text-xs md:text-sm lg:text-base xl:text-lg font-medium inline-block hover:scale-110 hover:translate-x-1 whitespace-nowrap px-1 md:px-2"
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 md:hidden ml-auto">
              {/* Mobile Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary/50 hover:bg-secondary/70 border-2 border-[#C9A84C] transition-[background-color,transform] duration-200 hover:scale-110"
                aria-label="Cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={toggleLanguage}
                className="flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary/70 border-2 border-[#C9A84C] transition-[background-color,transform] duration-200 hover:scale-110 overflow-hidden w-8 h-8 sm:w-10 sm:h-10"
                aria-label="Toggle language"
              >
                {language === 'en' ? (
                  <Image
                    src="https://flagcdn.com/w40/us.png"
                    alt="Switch to English"
                    width={40}
                    height={30}
                    className="w-6 h-4 sm:w-8 sm:h-6 object-cover rounded"
                  />
                ) : (
                  <Image
                    src="https://flagcdn.com/w40/mx.png"
                    alt="Cambiar a Español"
                    width={40}
                    height={30}
                    className="w-6 h-4 sm:w-8 sm:h-6 object-cover rounded"
                  />
                )}
              </button>
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground w-8 h-8 sm:w-10 sm:h-10">
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[70vw] sm:w-64 backdrop-blur-md border-l border-navbar/30 shadow-2xl">
                  <div className="flex flex-col gap-4 mt-12 pb-8">
                    {getNavLinks(language).map((link) => {
                      if (link.anchor) {
                        return (
                          <a
                            key={link.name}
                            href={isHomePage ? link.anchor : `${prefix}/${link.anchor}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-white text-base sm:text-lg font-medium hover:text-primary transition-[color,background-color,transform,border-color] duration-300 py-3 px-4 rounded-lg hover:bg-white/10 hover:translate-x-2 border-l-2 border-transparent hover:border-primary"
                          >
                            {link.name}
                          </a>
                        );
                      }
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => { setIsMobileMenuOpen(false); if (link.href === '/') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="text-white text-base sm:text-lg font-medium hover:text-primary transition-[color,background-color,transform,border-color] duration-300 py-3 px-4 rounded-lg hover:bg-white/10 hover:translate-x-2 border-l-2 border-transparent hover:border-primary"
                        >
                          {link.name}
                        </Link>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Desktop: Cart + Language Toggle */}
        <div className="hidden md:flex items-center gap-8 fixed z-50" style={{ top: '18px', right: '32px' }}>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary/70 border-2 border-[#C9A84C] transition-[background-color,transform] duration-200 hover:scale-110"
            style={{ width: '2.35rem', height: '2.35rem' }}
            aria-label="Cart"
          >
            <ShoppingCart className="w-4 h-4 text-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary/70 border-2 border-[#C9A84C] transition-[background-color,transform] duration-200 hover:scale-110 overflow-hidden"
            style={{ width: '2.35rem', height: '2.35rem' }}
            aria-label="Toggle language"
          >
            {language === 'en' ? (
              <Image
                src="https://flagcdn.com/w40/us.png"
                alt="Switch to English"
                width={40}
                height={30}
                className="w-8 h-6 object-cover rounded"
              />
            ) : (
              <Image
                src="https://flagcdn.com/w40/mx.png"
                alt="Cambiar a Español"
                width={40}
                height={30}
                className="w-8 h-6 object-cover rounded"
              />
            )}
          </button>
        </div>
      </header>

      {/* Cart Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[80]" onClick={() => { setIsCartOpen(false); setShowCheckout(false); }}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md shadow-2xl overflow-y-auto border-l border-white/15"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.45) 0%, rgba(20, 30, 55, 0.40) 50%, rgba(15, 23, 42, 0.45) 100%)',
              backdropFilter: 'blur(24px) saturate(200%)',
              WebkitBackdropFilter: 'blur(24px) saturate(200%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {showCheckout ? (
                <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                  <CheckoutForm onBack={() => setShowCheckout(false)} />
                </Suspense>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      {tc.cartTitle}
                    </h2>
                    <button
                      onClick={() => { setIsCartOpen(false); setShowCheckout(false); }}
                      className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60 text-lg">{tc.emptyCart}</p>
                    </div>
                  ) : (
                    <>
                      {/* Items List */}
                      <div className="space-y-4 mb-6">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-[#C9A84C]/30 bg-white/5">
                            {item.image && (
                              <div
                                className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0"
                                style={{ backgroundImage: `url(${item.image})` }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white text-sm font-semibold truncate">
                                {language === 'en' ? item.name : (item.nameEs || item.name)}
                              </h4>
                              <p className="text-primary text-sm font-bold">${item.price.toFixed(2)}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-6 h-6 rounded-full border border-[#C9A84C]/50 flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-white text-sm font-medium w-6 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 rounded-full border border-[#C9A84C]/50 flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <span className="text-white/60 text-xs ml-auto">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-white/40 hover:text-red-400 transition-colors shrink-0 self-start"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="border-t border-[#C9A84C]/30 pt-4 mb-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span className="text-white">{tc.total}</span>
                          <span className="text-primary">${getTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Info message */}
                      <p className="text-white/50 text-xs mb-4 leading-relaxed">
                        {tc.contactForCustom}
                      </p>

                      {/* Actions */}
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base shadow-lg"
                          onClick={() => setShowCheckout(true)}
                        >
                          {tc.checkout}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-[#C9A84C]/50 text-white hover:bg-white/10"
                          onClick={clearCart}
                        >
                          {tc.clearCart}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Social Media Buttons - Responsive: same position, proportional sizes */}
      {!isDesignerPage && (
      <div
        className={`flex fixed right-3 sm:right-4 md:right-6 top-[3.8rem] sm:top-[4.5rem] md:top-[5.5rem] z-[9999] flex-col gap-2 sm:gap-3 md:gap-4 transition-[opacity,transform] duration-500 ease-in-out ${
          isNavbarVisible && !isCartOpen && !isMobileMenuOpen && !isAnyModalOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
        }`}
      >
        <a
          href="https://www.facebook.com/people/Star-Event-Rental-supplies/61561128338857/?mibextid=wwXIfr&rdid=lodi0zYh5ukwrWZL&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AX4avuY3b%2F%3Fmibextid%3DwwXIfr"
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 sm:w-9 sm:h-9 md:w-[2.77rem] md:h-[2.77rem] rounded-full flex items-center justify-center backdrop-blur-sm border-[1.5px] sm:border-2 border-[#C9A84C] transition-[transform,box-shadow] duration-300 hover:scale-110 hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)',
            backdropFilter: 'blur(8px) saturate(180%)',
            WebkitBackdropFilter: 'blur(8px) saturate(180%)',
          }}
          aria-label="Facebook"
        >
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-[1.24rem] md:h-[1.24rem] text-foreground pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        <a
          href="https://www.instagram.com/stareventrentaltx?igsh=YWE0YTZ4Ym04MnNp&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 sm:w-9 sm:h-9 md:w-[2.77rem] md:h-[2.77rem] rounded-full flex items-center justify-center backdrop-blur-sm border-[1.5px] sm:border-2 border-[#C9A84C] transition-[transform,box-shadow] duration-300 hover:scale-110 hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)',
            backdropFilter: 'blur(8px) saturate(180%)',
            WebkitBackdropFilter: 'blur(8px) saturate(180%)',
          }}
          aria-label="Instagram"
        >
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-[1.24rem] md:h-[1.24rem] text-foreground pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
        <a
          href="https://wa.me/12816360615"
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 sm:w-9 sm:h-9 md:w-[2.77rem] md:h-[2.77rem] rounded-full flex items-center justify-center backdrop-blur-sm border-[1.5px] sm:border-2 border-[#C9A84C] transition-[transform,box-shadow] duration-300 hover:scale-110 hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)',
            backdropFilter: 'blur(8px) saturate(180%)',
            WebkitBackdropFilter: 'blur(8px) saturate(180%)',
          }}
          aria-label="WhatsApp"
        >
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-[1.24rem] md:h-[1.24rem] text-foreground pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
        <a
          href="tel:+12816360615"
          className="w-7 h-7 sm:w-9 sm:h-9 md:w-[2.77rem] md:h-[2.77rem] rounded-full flex items-center justify-center backdrop-blur-sm border-[1.5px] sm:border-2 border-[#C9A84C] transition-[transform,box-shadow] duration-300 hover:scale-110 hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)',
            backdropFilter: 'blur(8px) saturate(180%)',
            WebkitBackdropFilter: 'blur(8px) saturate(180%)',
          }}
          aria-label="Call us"
        >
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-[1.24rem] md:h-[1.24rem] text-foreground pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </a>
      </div>
      )}

      {/* Main Content */}
      <main className="pt-[3.2rem] sm:pt-16 md:pt-[4.8rem]">{children}</main>

      {/* Footer */}
      <footer className="bg-background text-muted-foreground py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-8 mb-8 pb-8 border-b border-border">
            <div>
              <h3 className="text-foreground font-bold text-xl mb-3">Star Event Rental</h3>
              <p className="text-sm">
                {translations[language].footer.companyDesc}
              </p>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-3">{translations[language].footer.quickLinks}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={`${prefix}/`} className="hover:text-primary transition-colors">{translations[language].nav.home}</Link></li>
                <li><a href={`${prefix}/#packages`} className="hover:text-primary transition-colors">{translations[language].nav.packages}</a></li>
                <li><a href={`${prefix}/#products`} className="hover:text-primary transition-colors">{translations[language].nav.products}</a></li>
                <li><a href={`${prefix}/#about`} className="hover:text-primary transition-colors">{translations[language].nav.about}</a></li>
                <li><Link href={`${prefix}/contact`} className="hover:text-primary transition-colors">{translations[language].nav.contact}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-3">{language === 'en' ? 'Products' : 'Productos'}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={`${prefix}/products/chairs`} className="hover:text-primary transition-colors">{language === 'en' ? 'Chairs' : 'Sillas'}</Link></li>
                <li><Link href={`${prefix}/products/tables`} className="hover:text-primary transition-colors">{language === 'en' ? 'Tables' : 'Mesas'}</Link></li>
                <li><Link href={`${prefix}/products/tablecloths`} className="hover:text-primary transition-colors">{language === 'en' ? 'Tablecloths' : 'Manteles'}</Link></li>
                <li><Link href={`${prefix}/products/tents`} className="hover:text-primary transition-colors">{language === 'en' ? 'Tents' : 'Carpas'}</Link></li>
                <li><Link href={`${prefix}/products/others`} className="hover:text-primary transition-colors">{language === 'en' ? 'Equipment' : 'Equipo'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-3">{language === 'en' ? 'Services' : 'Servicios'}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={`${prefix}/services/tent-rental-houston`} className="hover:text-primary transition-colors">{language === 'en' ? 'Tent Rental Houston' : 'Renta de Carpas Houston'}</Link></li>
                <li><Link href={`${prefix}/services/corporate-event-rentals-houston`} className="hover:text-primary transition-colors">{language === 'en' ? 'Corporate Events' : 'Eventos Corporativos'}</Link></li>
                <li><Link href={`${prefix}/services/party-rentals-katy-tx`} className="hover:text-primary transition-colors">{language === 'en' ? 'Party Rentals Katy TX' : 'Fiestas en Katy TX'}</Link></li>
                <li><Link href={`${prefix}/services/dance-floor-rental-houston`} className="hover:text-primary transition-colors">{language === 'en' ? 'Dance Floor Rental' : 'Pista de Baile'}</Link></li>
                <li><Link href={`${prefix}/services/wedding-rental-tomball`} className="hover:text-primary transition-colors">{language === 'en' ? 'Wedding Rental Tomball' : 'Bodas en Tomball'}</Link></li>
                <li><Link href={`${prefix}/services/graduation-party-rental-houston`} className="hover:text-primary transition-colors">{language === 'en' ? 'Graduation Party' : 'Fiesta de Graduación'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-3">{language === 'en' ? 'Service Areas' : 'Áreas de Servicio'}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={`${prefix}/services/event-rentals-cypress-tx`} className="hover:text-primary transition-colors">{language === 'en' ? 'Event Rentals Cypress' : 'Eventos en Cypress'}</Link></li>
                <li><Link href={`${prefix}/services/event-rentals-sugar-land-tx`} className="hover:text-primary transition-colors">{language === 'en' ? 'Event Rentals Sugar Land' : 'Eventos en Sugar Land'}</Link></li>
                <li><Link href={`${prefix}/services/tent-rental-the-woodlands-tx`} className="hover:text-primary transition-colors">{language === 'en' ? 'Tent Rental The Woodlands' : 'Carpas en The Woodlands'}</Link></li>
                <li><Link href={`${prefix}/services/tent-rental-baytown-tx`} className="hover:text-primary transition-colors">{language === 'en' ? 'Tent Rental Baytown' : 'Carpas en Baytown'}</Link></li>
                <li><Link href={`${prefix}/services/event-rentals-spring-tx`} className="hover:text-primary transition-colors">{language === 'en' ? 'Event Rentals Spring' : 'Eventos en Spring'}</Link></li>
                <li><Link href={`${prefix}/services/party-rentals-pearland-tx`} className="hover:text-primary transition-colors">{language === 'en' ? 'Party Rentals Pearland' : 'Fiestas en Pearland'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-3">{translations[language].footer.getInTouch}</h4>
              <ul className="space-y-2 text-sm">
                <li>📍 3730 Redwood Falls Dr, Houston, TX 77082</li>
                <li>📞 <a href="tel:2816360615" className="hover:text-primary transition-colors">281-636-0615</a></li>
                <li>✉️ <a href="mailto:info@stareventrentaltx.com" className="hover:text-primary transition-colors">info@stareventrentaltx.com</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm space-y-2">
            <p>&copy; {new Date().getFullYear()} Star Event Rental. {translations[language].footer.allRightsReserved}</p>
            <p>
              <Link href={`${prefix}/privacy-policy`} className="hover:text-primary transition-colors">{translations[language].footer.privacyPolicy}</Link>
              {' | '}
              <Link href={`${prefix}/terms-of-service`} className="hover:text-primary transition-colors">{translations[language].footer.termsOfService}</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
