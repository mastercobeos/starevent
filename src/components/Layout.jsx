import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

const getNavLinks = (language) => [
  { name: translations[language].nav.home, page: 'Home' },
  { name: translations[language].nav.rentSupplies, href: 'https://stareventrentaltx.com/rent-supplies/' },
  { name: translations[language].nav.saleSupplies, href: 'https://stareventrentaltx.com/' },
  { name: translations[language].nav.about, page: 'About' },
  { name: translations[language].nav.contact, page: 'Contact' },
];

const socialLinks = {
  instagram: 'https://www.instagram.com/stareventrentaltx/',
  facebook: 'https://www.facebook.com/share/1AX4avuY3b/?mibextid=wwXIfr',
};

export default function Layout({ children }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      
      // Si estamos en el top, siempre mostrar la navbar
      if (currentScrollY < 50) {
        setIsNavbarVisible(true);
      } else {
        // Si scrolleamos hacia abajo, ocultar navbar
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsNavbarVisible(false);
        } 
        // Si scrolleamos hacia arriba, mostrar navbar
        else if (currentScrollY < lastScrollY) {
          setIsNavbarVisible(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isHomePage = location.pathname === '/' || location.pathname === '/Home';

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out backdrop-blur-md ${
          isNavbarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.25) 0%, hsl(var(--navbar) / 0.35) 50%, hsl(var(--navbar) / 0.25) 100%)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 relative">
          <div className="flex items-center justify-between h-16 sm:h-20 md:h-24">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 sm:gap-3 group flex-shrink-0 z-10">
              <img 
                src="/logo.png" 
                alt="Star Event Rental" 
                className="h-10 sm:h-12 md:h-16 lg:h-[5.625rem] w-auto object-contain group-hover:opacity-90 transition-opacity"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2 md:gap-3 lg:gap-4 xl:gap-6 absolute left-1/2 transform -translate-x-1/2">
              {getNavLinks(language).map((link) => {
                if (link.href) {
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-primary transition-all duration-300 text-xs md:text-sm lg:text-base xl:text-lg font-medium inline-block hover:scale-110 hover:translate-x-1 whitespace-nowrap px-1 md:px-2"
                    >
                      {link.name}
                    </a>
                  );
                }
                return (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className="text-muted-foreground hover:text-primary transition-all duration-300 text-xs md:text-sm lg:text-base xl:text-lg font-medium inline-block hover:scale-110 hover:translate-x-1 whitespace-nowrap px-1 md:px-2"
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 md:hidden ml-auto">
              <button
                onClick={toggleLanguage}
                className="flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary/70 border border-border/50 transition-all duration-200 hover:scale-110 overflow-hidden w-10 h-10 sm:w-12 sm:h-12"
                aria-label="Toggle language"
              >
                {language === 'en' ? (
                  <img 
                    src="https://flagcdn.com/w40/us.png" 
                    alt="English" 
                    className="w-6 h-4 sm:w-8 sm:h-6 object-cover rounded"
                  />
                ) : (
                  <img 
                    src="https://flagcdn.com/w40/mx.png" 
                    alt="Español" 
                    className="w-6 h-4 sm:w-8 sm:h-6 object-cover rounded"
                  />
                )}
              </button>
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground w-10 h-10 sm:w-12 sm:h-12">
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[70vw] sm:w-64 backdrop-blur-md border-l border-navbar/30 shadow-2xl">
                  <div className="flex flex-col gap-4 mt-12 pb-8">
                    {getNavLinks(language).map((link, index) => {
                      if (link.href) {
                        return (
                          <a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-white text-base sm:text-lg font-medium hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/10 hover:translate-x-2 border-l-2 border-transparent hover:border-primary"
                          >
                            {link.name}
                          </a>
                        );
                      }
                      return (
                        <Link
                          key={link.page}
                          to={createPageUrl(link.page)}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-white text-base sm:text-lg font-medium hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/10 hover:translate-x-2 border-l-2 border-transparent hover:border-primary"
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
        
        {/* Language Toggle - Positioned fixed to align with social buttons */}
        <button
          onClick={toggleLanguage}
          className="hidden md:flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary/70 border border-border/50 transition-all duration-200 hover:scale-110 overflow-hidden fixed"
          style={{ top: '24px', width: '3.28125rem', height: '3.28125rem', right: '32.75px' }}
          aria-label="Toggle language"
        >
          {language === 'en' ? (
            <img 
              src="https://flagcdn.com/w40/us.png" 
              alt="English" 
              className="w-8 h-6 object-cover rounded"
            />
          ) : (
            <img 
              src="https://flagcdn.com/w40/mx.png" 
              alt="Español" 
              className="w-8 h-6 object-cover rounded"
            />
          )}
        </button>
      </header>

      {/* Social Media Buttons */}
      <div 
        className={`hidden md:flex fixed right-6 top-28 z-40 flex-col gap-4 transition-all duration-500 ease-in-out ${
          isNavbarVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
        }`}
      >
        <a
          href="https://www.facebook.com/share/1AX4avuY3b/?mibextid=wwXIfr"
          target="_blank"
          rel="noopener noreferrer"
          className="w-[4.375rem] h-[4.375rem] rounded-full flex items-center justify-center backdrop-blur-md border border-navbar/20 transition-all duration-300 hover:scale-110 hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.25) 0%, hsl(var(--navbar) / 0.35) 50%, hsl(var(--navbar) / 0.25) 100%)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          }}
          aria-label="Facebook"
        >
          <svg className="w-7 h-7 text-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        <a
          href="https://www.instagram.com/stareventrentaltx/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-[4.375rem] h-[4.375rem] rounded-full flex items-center justify-center backdrop-blur-md border border-navbar/20 transition-all duration-300 hover:scale-110 hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.25) 0%, hsl(var(--navbar) / 0.35) 50%, hsl(var(--navbar) / 0.25) 100%)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          }}
          aria-label="Instagram"
        >
          <svg className="w-7 h-7 text-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
        <a
          href="https://wa.me/12816360615"
          target="_blank"
          rel="noopener noreferrer"
          className="w-[4.375rem] h-[4.375rem] rounded-full flex items-center justify-center backdrop-blur-md border border-navbar/20 transition-all duration-300 hover:scale-110 hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.25) 0%, hsl(var(--navbar) / 0.35) 50%, hsl(var(--navbar) / 0.25) 100%)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          }}
          aria-label="WhatsApp"
        >
          <svg className="w-7 h-7 text-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      </div>

      {/* Main Content */}
      <main className="pt-16 sm:pt-20 md:pt-24">{children}</main>

      {/* Footer */}
      <footer className="bg-background text-muted-foreground py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-border">
            <div>
              <h3 className="text-foreground font-bold text-xl mb-3">Star Event Rental</h3>
              <p className="text-sm">
                {translations[language].footer.companyDesc}
              </p>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-3">{translations[language].footer.quickLinks}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('Home')} className="hover:text-primary transition-colors">{translations[language].nav.home}</Link></li>
                <li><Link to={createPageUrl('Products')} className="hover:text-primary transition-colors">{translations[language].nav.rentSupplies}</Link></li>
                <li><Link to={createPageUrl('About')} className="hover:text-primary transition-colors">{translations[language].nav.about}</Link></li>
                <li><Link to={createPageUrl('Contact')} className="hover:text-primary transition-colors">{translations[language].nav.contact}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-3">{translations[language].footer.getInTouch}</h4>
              <ul className="space-y-2 text-sm">
                <li>📍 Houston 77082, USA</li>
                <li>📞 <a href="tel:2816360615" className="hover:text-primary transition-colors">281-636-0615</a></li>
                <li>✉️ <a href="mailto:info@stareventrentaltx.com" className="hover:text-primary transition-colors">info@stareventrentaltx.com</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-3">{translations[language].footer.newsletter}</h4>
              <p className="text-sm mb-3">{translations[language].footer.newsletterDesc}</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <input
                  type="email"
                  placeholder={translations[language].footer.email}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {translations[language].footer.signUp}
                </Button>
              </form>
            </div>
          </div>
          <div className="text-center text-sm">
            <p>&copy; 2025 Star Event Rental. {translations[language].footer.allRightsReserved}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
