import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { translations } from '../translations';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const productCards = [
  {
    name: 'Chairs',
    nameEs: 'Sillas',
    image: '/sillas.jpg',
    items: [
      { id: 'chair-resin', name: 'Resin Chair', nameEs: 'Silla de Resina', price: 2.50, desc: 'Elegant white resin folding chairs, perfect for weddings and formal events.', descEs: 'Elegantes sillas plegables de resina blanca, perfectas para bodas y eventos formales.', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
      { id: 'chair-wood', name: 'Wooden Chair', nameEs: 'Silla de Madera', price: 3.00, desc: 'Classic wooden chairs that bring warmth and elegance to any event setting.', descEs: 'Sillas de madera clásicas que aportan calidez y elegancia a cualquier evento.', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
      { id: 'chair-garden', name: 'Garden Chair', nameEs: 'Silla de Jardín', price: 2.00, desc: 'Comfortable garden chairs ideal for outdoor celebrations and gatherings.', descEs: 'Cómodas sillas de jardín ideales para celebraciones y reuniones al aire libre.', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
      { id: 'chair-chiavari', name: 'Chiavari Chair', nameEs: 'Silla Chiavari', price: 5.00, desc: 'Elegant gold Chiavari chairs with white cushion, perfect for weddings and upscale events.', descEs: 'Elegantes sillas Chiavari doradas con cojín blanco, perfectas para bodas y eventos de gala.', image: '/chiavari.png', checkoutLink: '#' },
    ],
  },
  {
    name: 'Tables',
    nameEs: 'Mesas',
    image: '/mesas.jpg',
    items: [
      { id: 'table-8ft', name: '8 FT Rectangular Table', nameEs: 'Mesa Rectangular de 8 pies', price: 12.00, desc: 'Sturdy 8-foot plastic folding tables built for versatility and strength.', descEs: 'Resistentes mesas plegables de plástico de 8 pies, construidas para versatilidad y fuerza.', image: 'https://images.unsplash.com/photo-1519225468359-2996bc017a1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
      { id: 'table-6ft', name: '6 FT Rectangular Table', nameEs: 'Mesa Rectangular de 6 pies', price: 10.00, desc: 'Versatile 6-foot folding tables, great for smaller setups and buffets.', descEs: 'Versátiles mesas plegables de 6 pies, ideales para montajes pequeños y buffets.', image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
      { id: 'table-round', name: '60" Round Table', nameEs: 'Mesa Redonda de 60"', price: 12.00, desc: '60-inch round folding tables, perfect for banquet-style seating.', descEs: 'Mesas redondas plegables de 60 pulgadas, perfectas para disposición tipo banquete.', image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
    ],
  },
  {
    name: 'Tablecloths',
    nameEs: 'Manteles',
    image: '/manteles.jpg',
    items: [
      { id: 'cloth-white', name: 'White Tablecloth', nameEs: 'Mantel Blanco', price: 8.00, desc: 'Elegant white tablecloths that add a clean, sophisticated touch to any event.', descEs: 'Elegantes manteles blancos que agregan un toque limpio y sofisticado a cualquier evento.', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
      { id: 'cloth-color', name: 'Colored Tablecloth', nameEs: 'Mantel de Color', price: 10.00, desc: 'Available in various colors to match your event theme and decoration.', descEs: 'Disponibles en varios colores para combinar con el tema y decoración de tu evento.', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
    ],
  },
  {
    name: 'Tents',
    nameEs: 'Carpas',
    image: '/tent.jpg',
    items: [
      { id: 'tent-20x20', name: 'Tent 20x20', nameEs: 'Carpa 20x20', price: 350.00, desc: 'Perfect for intimate gatherings of up to 30 guests with optional draping.', descEs: 'Perfecta para reuniones íntimas de hasta 30 invitados con drapeado opcional.', image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
      { id: 'tent-20x40', name: 'Tent 20x40', nameEs: 'Carpa 20x40', price: 600.00, desc: 'Spacious tent for larger events up to 70 guests with elegant draping options.', descEs: 'Carpa espaciosa para eventos más grandes de hasta 70 invitados con opciones de drapeado elegante.', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
    ],
  },
  {
    name: 'Others',
    nameEs: 'Otros',
    image: '/others.jpg',
    items: [
      { id: 'chandelier', name: 'Chandelier', nameEs: 'Candelabro', price: 50.00, desc: 'Beautiful chandeliers to add a touch of elegance and ambient lighting.', descEs: 'Hermosos candelabros para agregar un toque de elegancia e iluminación ambiental.', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
      { id: 'garden-lights', name: 'Garden Lights', nameEs: 'Luces de Jardín', price: 25.00, desc: 'String lights and garden lighting to create a magical outdoor atmosphere.', descEs: 'Luces de cadena e iluminación de jardín para crear una atmósfera mágica al aire libre.', image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
      { id: 'walls-draping', name: 'Walls & Draping', nameEs: 'Paredes y Drapeado', price: 75.00, desc: 'Tent walls and draping to enhance privacy and create stunning backdrops.', descEs: 'Paredes de carpa y drapeado para mejorar la privacidad y crear fondos impresionantes.', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
      { id: 'cooler', name: 'Cooler', nameEs: 'Enfriador', price: 40.00, desc: 'Portable coolers to keep your guests comfortable during warm weather events.', descEs: 'Enfriadores portátiles para mantener a tus invitados cómodos durante eventos en clima cálido.', image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
      { id: 'heater', name: 'Heater', nameEs: 'Calentador', price: 45.00, desc: 'Outdoor heaters to keep your guests warm and cozy during cold weather events.', descEs: 'Calentadores exteriores para mantener a tus invitados cálidos y cómodos durante eventos en clima frío.', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', checkoutLink: '#' },
      { id: 'dancefloor-16x16', name: 'Dance Floor 16x16', nameEs: 'Pista de Baile 16x16', price: 750.00, desc: 'Elegant 16x16 dance floor to make your event unforgettable.', descEs: 'Elegante pista de baile 16x16 para hacer tu evento inolvidable.', image: '/dancefloor.png', checkoutLink: '#' },
      { id: 'dancefloor-12x12', name: 'Dance Floor 12x12', nameEs: 'Pista de Baile 12x12', price: 500.00, desc: 'Compact 12x12 dance floor, perfect for smaller venues and gatherings.', descEs: 'Pista de baile compacta 12x12, perfecta para espacios y reuniones más pequeñas.', image: '/dancefloor.png', checkoutLink: '#' },
    ],
  },
];

const allPackages = [
  { id: 'pkg-deluxe-20x20', badge: 'Deluxe', price: '$749', priceNum: 749, title: 'Tent 20x20 with draping', titleEs: 'Carpa 20x20 con drapeado', includes: ['30 Garden Chairs', '3 Rectangular Table 8ft', 'Garden Lights - Walls', '1 Chandelier', '3 Table cloths', 'Delivery and Tax included'], checkoutLink: '#' },
  { id: 'pkg-basic-20x20', badge: 'Basic', price: '$399', priceNum: 399, title: 'Tent 20x20 without draping', titleEs: 'Carpa 20x20 sin drapeado', includes: ['30 Garden Chairs', '3 Rectangular Table 8ft', '3 Table cloths', 'Garden Light and walls', 'Delivery and Tax included'], checkoutLink: '#' },
  { id: 'pkg-deluxe-20x40', badge: 'Deluxe', price: '$1,299', priceNum: 1299, title: 'Tent 20x40 with draping', titleEs: 'Carpa 20x40 con drapeado', includes: ['70 Garden Chairs', '7 Rectangular Table 8ft', 'Garden Lights', '7 Table cloths', '2 Chandeliers', 'Delivery and Tax included'], checkoutLink: '#' },
  { id: 'pkg-basic-20x40', badge: 'Basic', price: '$849', priceNum: 849, title: 'Tent 20x40 without draping', titleEs: 'Carpa 20x40 sin drapeado', includes: ['70 Garden Chairs', '7 Rectangular Table 8ft', '7 Table Cloths', 'Garden lights', 'Walls', 'Delivery and Tax included'], checkoutLink: '#' },
];
const totalPages = Math.ceil(allPackages.length / 2);

const heroImages = [
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Event table setting
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Wedding reception
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Quinceañera celebration
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Party event
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Celebration
];

const googleReviews = [
  { author: 'Maria G.', rating: 5, text: 'Excellent service! They delivered everything on time and the setup was perfect for our quinceañera. Highly recommend Star Event Rental!' },
  { author: 'Carlos R.', rating: 5, text: 'We rented tables, chairs, and a tent for our family reunion. Everything was clean and in great condition. The team was very professional.' },
  { author: 'Jessica L.', rating: 5, text: 'Amazing experience from start to finish. They helped us choose the right package for our wedding and the prices were very reasonable.' },
  { author: 'Roberto M.', rating: 5, text: 'Very reliable and punctual. They set up everything before the event and picked up the next day without any issues. Will use again!' },
  { author: 'Ana S.', rating: 5, text: 'Star Event Rental made our baby shower look beautiful. The linens and chairs were elegant and the staff was so friendly. Thank you!' },
];

export default function Home() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const t = translations[language].home;
  const tc = translations[language].cart;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [productIndex, setProductIndex] = useState(0);
  const [productModal, setProductModal] = useState(null); // index of selected category
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(null); // id of item just added
  const [quantities, setQuantities] = useState({}); // { itemId: quantity }
  const [reviewIndex, setReviewIndex] = useState(0);

  const getQty = (id) => quantities[id] || 1;
  const setQty = (id, val) => setQuantities((prev) => ({ ...prev, [id]: Math.max(1, val) }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 2000); // Cambia cada 2 segundos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % Math.ceil(googleReviews.length / 2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const timer = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % totalPages);
    }, 3000);
    return () => clearInterval(timer);
  }, [showModal]);

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  useEffect(() => {
    if (productModal === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setProductModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [productModal]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center text-foreground overflow-hidden -mt-[3.2rem] sm:-mt-16">
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
            className="px-4 sm:px-5 py-12 sm:py-14 md:py-16 rounded-2xl shadow-xl text-center border-2 border-[#C9A84C] hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl backdrop-blur-md h-auto sm:h-[480px] flex flex-col justify-center w-full max-w-[280px]"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)',
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
            className="px-4 sm:px-5 py-12 sm:py-14 md:py-16 rounded-2xl shadow-xl text-center border-2 border-[#C9A84C] hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl backdrop-blur-md h-auto sm:h-[480px] flex flex-col justify-center w-full max-w-[280px]"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)',
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
            className="px-4 sm:px-5 py-12 sm:py-14 md:py-16 rounded-2xl shadow-xl text-center border-2 border-[#C9A84C] hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl backdrop-blur-md h-auto sm:h-[480px] flex flex-col justify-center w-full max-w-[280px]"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)',
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
      <section id="packages" className="relative py-24 overflow-hidden">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto">
            {[
              {
                badge: 'Deluxe',
                image: '/tarjeta.jpg',
              },
              {
                badge: 'Basic',
                image: '/tarjeto.jpg',
              },
            ].map((pkg, idx) => (
              <div key={idx} onClick={() => { setShowModal(true); setSliderIndex(0); }}>
                <div className="relative rounded-2xl shadow-xl hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl overflow-hidden h-[350px] sm:h-[400px] group cursor-pointer">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${pkg.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      pkg.badge === 'Deluxe' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                    }`}>
                      {pkg.badge}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="relative py-16 sm:py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.65)), url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
              {language === 'en' ? 'Products We Offer' : 'Productos que Ofrecemos'}
            </h2>
            <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto">
              {language === 'en' ? 'Quality rental equipment for your special events' : 'Equipo de alquiler de calidad para tus eventos especiales'}
            </p>
          </div>
          <div className="relative flex items-center gap-2 sm:gap-4 max-w-5xl mx-auto">
            <button
              onClick={() => setProductIndex((prev) => prev <= 0 ? productCards.length - 3 : prev - 1)}
              className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[1.5px] border-[#C9A84C] bg-transparent text-white transition-all hover:scale-110 hover:bg-[#C9A84C]/15 flex items-center justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="overflow-hidden w-full">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${productIndex * (100 / 3)}%)` }}
              >
                {productCards.map((product, idx) => (
                  <div key={idx} className="w-1/3 shrink-0 px-2 sm:px-3">
                    <div
                      className="bg-card rounded-2xl overflow-hidden shadow-xl hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl group cursor-pointer"
                      onClick={() => { setProductModal(idx); setSelectedItemIdx(0); }}
                    >
                      <div
                        className="h-56 sm:h-72 md:h-80 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${product.image})` }}
                      />
                      <div className="px-4 py-2 sm:px-5 sm:py-2.5">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-card-foreground">
                          {language === 'en' ? product.name : product.nameEs}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setProductIndex((prev) => prev >= productCards.length - 3 ? 0 : prev + 1)}
              className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[1.5px] border-[#C9A84C] bg-transparent text-white transition-all hover:scale-110 hover:bg-[#C9A84C]/15 flex items-center justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: productCards.length - 2 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setProductIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === productIndex ? 'bg-primary scale-125' : 'bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.65)), url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Event Setup"
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
            <div>
              <h4 className="text-primary uppercase text-xs sm:text-sm font-bold tracking-wider mb-2">
                {translations[language].about.whyChoose}
              </h4>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
                {translations[language].about.inspire}
              </h2>
              <div className="space-y-4 sm:space-y-6">
                {[
                  { icon: '/diamante.png', isImage: true, filter: 'invert(70%) sepia(60%) saturate(500%) hue-rotate(10deg) brightness(90%) contrast(90%)', imgStyle: { transform: 'scale(0.85)' }, title: translations[language].about.personalizedService, desc: translations[language].about.personalizedServiceDesc },
                  { icon: '/reloj.png', isImage: true, imgStyle: { transform: 'scale(1.3)' }, title: translations[language].about.punctuality, desc: translations[language].about.punctualityDesc },
                  { icon: '/quality.png', isImage: true, filter: 'invert(70%) sepia(60%) saturate(500%) hue-rotate(10deg) brightness(90%) contrast(90%)', title: translations[language].about.quality, desc: translations[language].about.qualityDesc },
                  { icon: '/casa.png', isImage: true, imgStyle: { opacity: 0.75 }, title: translations[language].about.familyBusiness, desc: translations[language].about.familyBusinessDesc },
                ].map((benefit, idx) => (
                  <div key={idx} className="flex gap-3 sm:gap-4">
                    <div
                      className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 flex items-center justify-center overflow-hidden group/icon"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
                        backdropFilter: 'blur(12px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                      }}
                    >
                      {benefit.isImage
                        ? <div className="transition-transform duration-300 group-hover/icon:scale-125"><img src={benefit.icon} alt={benefit.title} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" style={{ ...(benefit.filter ? { filter: benefit.filter } : {}), ...(benefit.imgStyle || {}) }} /></div>
                        : benefit.icon}
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
      </section>

      {/* CTA Section + Reviews */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.65)), url(https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-white text-lg sm:text-2xl md:text-3xl font-medium mb-6 leading-relaxed px-4">
              {t.ctaTitle}
            </p>
            <a href="#about">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-7 text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-[#C9A84C]">
                {t.learnMore}
              </Button>
            </a>
          </div>

          {/* Reviews Slider */}
          <div className="border-t border-white/20 pt-6 sm:pt-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <h2 className="text-base sm:text-lg font-bold text-white">{t.reviewsTitle}</h2>
              <div className="flex items-center gap-0.5 ml-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
                <span className="text-white/60 text-xs ml-1">4.7</span>
              </div>
            </div>

            <div className="relative">
              {/* Previous Button */}
              <button
                onClick={() => setReviewIndex((prev) => (prev - 1 + Math.ceil(googleReviews.length / 2)) % Math.ceil(googleReviews.length / 2))}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Next Button */}
              <button
                onClick={() => setReviewIndex((prev) => (prev + 1) % Math.ceil(googleReviews.length / 2))}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="overflow-hidden mx-6 sm:mx-8">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${reviewIndex * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(googleReviews.length / 2) }).map((_, pageIdx) => (
                    <div key={pageIdx} className="w-full shrink-0 px-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {googleReviews.slice(pageIdx * 2, pageIdx * 2 + 2).map((review, i) => (
                          <div
                            key={i}
                            className="rounded-xl p-4 border border-white/15 backdrop-blur-md"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                              backdropFilter: 'blur(12px) saturate(150%)',
                              WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                            }}
                          >
                            <div className="flex items-center gap-0.5 mb-2">
                              {[...Array(review.rating)].map((_, j) => (
                                <svg key={j} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                              ))}
                            </div>
                            <p className="text-white/85 text-xs sm:text-sm italic leading-relaxed mb-2">
                              "{review.text}"
                            </p>
                            <p className="text-primary font-semibold text-xs sm:text-sm">{review.author}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-1.5 mt-4">
                {Array.from({ length: Math.ceil(googleReviews.length / 2) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setReviewIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      reviewIndex === idx ? 'bg-primary w-5' : 'bg-white/30 w-1.5 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Details Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-[45rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div />
              <h3 className="text-2xl sm:text-3xl font-bold text-white text-center">
                {t.ourPackages}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white text-2xl font-light transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="relative flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSliderIndex((prev) => (prev - 1 + totalPages) % totalPages)}
                className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[1.5px] border-[#C9A84C] bg-transparent text-white transition-all hover:scale-110 hover:bg-[#C9A84C]/15 flex items-center justify-center"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div className="overflow-hidden w-full">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${sliderIndex * 100}%)` }}
                >
                  {Array.from({ length: totalPages }).map((_, pageIdx) => (
                    <div key={pageIdx} className="w-full shrink-0 px-2">
                      <div className="grid grid-cols-2 gap-4">
                        {allPackages.slice(pageIdx * 2, pageIdx * 2 + 2).map((sub, i) => (
                          <div key={i} className="rounded-2xl p-4 sm:p-6 border-2 border-[#C9A84C] shadow-2xl flex flex-col h-full backdrop-blur-md" style={{ background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)', backdropFilter: 'blur(12px) saturate(180%)', WebkitBackdropFilter: 'blur(12px) saturate(180%)' }}>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 w-fit ${
                              sub.badge === 'Deluxe' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                            }`}>
                              {sub.badge}
                            </span>
                            <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{sub.price}</div>
                            <h4 className="text-sm sm:text-base font-semibold text-white mb-3">{sub.title}</h4>
                            <ul className="space-y-1.5 mb-4 flex-grow">
                              {sub.includes.map((item, j) => (
                                <li key={j} className="text-xs sm:text-sm text-white/90 flex items-start gap-1.5">
                                  <span className="text-primary mt-0.5 font-bold">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-[#C9A84C]/50 rounded-lg overflow-hidden shrink-0">
                                <button
                                  onClick={() => setQty(sub.id, getQty(sub.id) - 1)}
                                  className="w-7 h-7 flex items-center justify-center text-white/80 hover:bg-white/10 transition-all"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-6 text-center text-white text-xs font-bold">
                                  {getQty(sub.id)}
                                </span>
                                <button
                                  onClick={() => setQty(sub.id, getQty(sub.id) + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-white/80 hover:bg-white/10 transition-all"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <Button
                                className="flex-1 font-semibold py-2 px-3 text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
                                onClick={() => {
                                  const qty = getQty(sub.id);
                                  addItem({ id: sub.id, name: sub.title, nameEs: sub.titleEs, price: sub.priceNum, image: '', type: 'package', checkoutLink: sub.checkoutLink }, qty);
                                  setAddedFeedback(sub.id);
                                  setTimeout(() => setAddedFeedback(null), 1500);
                                  setQty(sub.id, 1);
                                }}
                              >
                                {addedFeedback === sub.id ? tc.addedToCart : tc.addToCart}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSliderIndex((prev) => (prev + 1) % totalPages)}
                className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[1.5px] border-[#C9A84C] bg-transparent text-white transition-all hover:scale-110 hover:bg-[#C9A84C]/15 flex items-center justify-center"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSliderIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === sliderIndex ? 'bg-primary scale-125' : 'bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {productModal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setProductModal(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-[45rem] max-h-[85vh] rounded-2xl border-2 border-[#C9A84C] shadow-2xl overflow-y-auto"
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setProductModal(null)}
              className="absolute top-1.5 right-1.5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-lg font-light transition-all z-10"
            >
              ✕
            </button>
            <div className="flex flex-col md:flex-row h-full">
              {/* Left side - Item list */}
              <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-[#C9A84C]/30 p-4 sm:p-6 overflow-y-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                  {language === 'en' ? productCards[productModal].name : productCards[productModal].nameEs}
                </h3>
                <ul className="space-y-1">
                  {productCards[productModal].items.map((item, i) => (
                    <li key={i}>
                      <button
                        onClick={() => setSelectedItemIdx(i)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm sm:text-base ${
                          i === selectedItemIdx
                            ? 'bg-[#C9A84C]/20 text-[#C9A84C] font-semibold border border-[#C9A84C]/40'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {language === 'en' ? item.name : item.nameEs}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right side - Photo + Description */}
              <div className="w-full md:w-1/2 p-4 sm:p-5 overflow-y-auto">
                <div
                  className="w-full h-40 sm:h-48 md:h-52 rounded-xl bg-contain bg-center bg-no-repeat mb-3 sm:mb-4"
                  style={{ backgroundImage: `url(${productCards[productModal].items[selectedItemIdx].image})` }}
                />
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {language === 'en'
                      ? productCards[productModal].items[selectedItemIdx].name
                      : productCards[productModal].items[selectedItemIdx].nameEs}
                  </h4>
                  <span className="text-xs sm:text-sm text-white/60">| {language === 'en' ? 'Duration: 24 hours' : 'Duración: 24 horas'}</span>
                </div>
                <p className="text-white/85 text-sm leading-relaxed mb-3">
                  {language === 'en'
                    ? productCards[productModal].items[selectedItemIdx].desc
                    : productCards[productModal].items[selectedItemIdx].descEs}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-primary font-bold text-lg">
                    ${productCards[productModal].items[selectedItemIdx].price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#C9A84C]/50 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQty(productCards[productModal].items[selectedItemIdx].id, getQty(productCards[productModal].items[selectedItemIdx].id) - 1)}
                        className="w-8 h-8 flex items-center justify-center text-white/80 hover:bg-white/10 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-white text-sm font-bold">
                        {getQty(productCards[productModal].items[selectedItemIdx].id)}
                      </span>
                      <button
                        onClick={() => setQty(productCards[productModal].items[selectedItemIdx].id, getQty(productCards[productModal].items[selectedItemIdx].id) + 1)}
                        className="w-8 h-8 flex items-center justify-center text-white/80 hover:bg-white/10 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 shadow-lg hover:shadow-xl text-sm"
                      onClick={() => {
                        const item = productCards[productModal].items[selectedItemIdx];
                        const qty = getQty(item.id);
                        addItem({ id: item.id, name: item.name, nameEs: item.nameEs, price: item.price, image: item.image, type: 'product', checkoutLink: item.checkoutLink }, qty);
                        setAddedFeedback(item.id);
                        setTimeout(() => setAddedFeedback(null), 1500);
                        setQty(item.id, 1);
                      }}
                    >
                      {addedFeedback === productCards[productModal].items[selectedItemIdx].id ? tc.addedToCart : tc.addToCart}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
