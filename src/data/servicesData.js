import { productCards } from './homeData';

// Helper to get products by category slugs
const getProductsByCategories = (...slugs) =>
  productCards.filter((c) => slugs.includes(c.slug));

// Helper to get specific items by ID from any category
const getItemsByIds = (...ids) => {
  const items = [];
  for (const cat of productCards) {
    for (const item of cat.items) {
      if (ids.includes(item.id)) items.push(item);
    }
  }
  return items;
};

export const servicesData = [
  {
    slug: 'tent-rental-houston',
    title: 'Tent Rental Houston TX - Wedding & Event Tents',
    titleEs: 'Renta de Carpas Houston TX - Carpas para Bodas y Eventos',
    description: 'Tent rental in Houston TX. Wedding tents, high peak tents & party tents for any event. Setup & delivery included. Serving Houston, Baytown & surrounding areas. Free quotes!',
    descriptionEs: 'Renta de carpas en Houston TX. Carpas para bodas, carpas high peak y carpas para fiestas. Instalación y entrega incluida. Servimos Houston, Baytown y áreas cercanas.',
    keywords: ['tent rental Houston', 'wedding tent rental Houston', 'high peak tent Baytown', 'party tent rental Houston', 'tent rental near me', 'renta de carpas Houston'],
    heroImage: '/tentsportada.jpg',
    h1: 'Tent Rental Houston TX',
    h1Es: 'Renta de Carpas Houston TX',
    heroSubtitle: 'Wedding Tents, High Peak Tents & Party Tents for Every Occasion',
    heroSubtitleEs: 'Carpas para Bodas, Carpas High Peak y Carpas para Fiestas',
    intro: 'Star Event Rental offers premium tent rentals in Houston, TX and surrounding areas including Baytown, Katy, and The Woodlands. Whether you need a wedding tent, a high peak tent for a corporate gala, or a simple party tent for a backyard celebration, we have the perfect solution. All our tents are fire-proof, include garden lights and walls, and come with professional setup and delivery.',
    introEs: 'Star Event Rental ofrece renta de carpas premium en Houston, TX y áreas cercanas incluyendo Baytown, Katy y The Woodlands. Ya sea que necesites una carpa para boda, una carpa high peak para una gala corporativa, o una carpa sencilla para una celebración en el patio, tenemos la solución perfecta. Todas nuestras carpas son a prueba de fuego, incluyen luces de jardín y paredes, y vienen con instalación y entrega profesional.',
    productCategories: getProductsByCategories('tents'),
    faq: [
      {
        q: 'How much does a tent rental cost in Houston?',
        qEs: '¿Cuánto cuesta rentar una carpa en Houston?',
        a: 'Our tent rentals start at $250 for a 20x20 tent (up to 30 guests) and go up to $1,200 for a High Peak 20x40. Prices include garden lights and walls. Contact us for a free quote!',
        aEs: 'Nuestra renta de carpas comienza desde $250 para una carpa 20x20 (hasta 30 invitados) y llega hasta $1,200 para una High Peak 20x40. Los precios incluyen luces de jardín y paredes. ¡Contáctanos para una cotización gratis!',
      },
      {
        q: 'What tent sizes do you offer?',
        qEs: '¿Qué tamaños de carpas ofrecen?',
        a: 'We offer tents in 20x20, 20x32, 20x40, and 20x60 sizes in standard, high peak, and clear tent styles. Our largest tent fits up to 120 guests seated at tables.',
        aEs: 'Ofrecemos carpas en tamaños 20x20, 20x32, 20x40 y 20x60 en estilos estándar, high peak y transparente. Nuestra carpa más grande tiene capacidad para hasta 120 invitados sentados en mesas.',
      },
      {
        q: 'Do you deliver and set up tents in Baytown?',
        qEs: '¿Entregan e instalan carpas en Baytown?',
        a: 'Yes! We deliver and set up tents in Baytown, Houston, Katy, The Woodlands, and surrounding areas. Delivery and professional setup are included in our service.',
        aEs: '¡Sí! Entregamos e instalamos carpas en Baytown, Houston, Katy, The Woodlands y áreas cercanas. La entrega e instalación profesional están incluidas en nuestro servicio.',
      },
      {
        q: 'What is a high peak tent?',
        qEs: '¿Qué es una carpa high peak?',
        a: 'A high peak tent features dramatic peaked tops that create a stunning visual impact. Our high peak tents are premium heavy-duty structures available in 20x20 ($550) and 20x40 ($1,200) sizes, perfect for weddings and upscale events.',
        aEs: 'Una carpa high peak presenta picos dramáticos que crean un impacto visual impresionante. Nuestras carpas high peak son estructuras premium de alta resistencia disponibles en tamaños 20x20 ($550) y 20x40 ($1,200), perfectas para bodas y eventos de alta categoría.',
      },
    ],
  },
  {
    slug: 'corporate-event-rentals-houston',
    title: 'Corporate Event Rentals Houston - Tents, Tables & Chairs',
    titleEs: 'Renta para Eventos Corporativos Houston - Carpas, Mesas y Sillas',
    description: 'Corporate event rentals in Houston TX. Tent, table & chair rental for company events, corporate parties & business gatherings. Professional setup. Free quotes!',
    descriptionEs: 'Renta para eventos corporativos en Houston TX. Renta de carpas, mesas y sillas para eventos empresariales, fiestas corporativas y reuniones de negocios.',
    keywords: ['corporate event rentals Houston', 'corporate event tent rental Houston', 'company event rentals Houston', 'corporate party rentals Houston', 'event rentals for companies Houston', 'eventos corporativos Houston'],
    heroImage: '/fondo2.jpg',
    h1: 'Corporate Event Rentals Houston',
    h1Es: 'Renta para Eventos Corporativos Houston',
    heroSubtitle: 'Professional Tent, Table & Chair Rentals for Your Company Events',
    heroSubtitleEs: 'Renta Profesional de Carpas, Mesas y Sillas para Eventos Empresariales',
    intro: 'Star Event Rental provides professional corporate event rental services in Houston, TX. From company picnics and team-building events to holiday parties and product launches, we supply tents, tables, chairs, linens, and more. Our reliable setup team ensures everything is in place before your event starts, so you can focus on your business. We serve all of Houston, Katy, The Woodlands, Sugar Land, and surrounding areas.',
    introEs: 'Star Event Rental ofrece servicios profesionales de renta para eventos corporativos en Houston, TX. Desde picnics empresariales y eventos de team-building hasta fiestas navideñas y lanzamientos de productos, suministramos carpas, mesas, sillas, manteles y más. Nuestro equipo de instalación confiable asegura que todo esté en su lugar antes de que comience su evento, para que pueda enfocarse en su negocio.',
    productCategories: getProductsByCategories('tents', 'tables', 'chairs'),
    faq: [
      {
        q: 'Do you offer rentals for corporate events in Houston?',
        qEs: '¿Ofrecen renta para eventos corporativos en Houston?',
        a: 'Yes! We specialize in corporate event rentals including tents, tables, chairs, and linens for company events of all sizes in Houston and surrounding areas.',
        aEs: '¡Sí! Nos especializamos en renta para eventos corporativos incluyendo carpas, mesas, sillas y manteles para eventos empresariales de todos los tamaños en Houston y áreas cercanas.',
      },
      {
        q: 'Can you accommodate large corporate events?',
        qEs: '¿Pueden acomodar eventos corporativos grandes?',
        a: 'Absolutely. Our largest tent (20x60) seats up to 120 guests at tables, and we can combine multiple tents for larger events. Contact us for custom corporate event packages.',
        aEs: 'Absolutamente. Nuestra carpa más grande (20x60) tiene capacidad para hasta 120 invitados en mesas, y podemos combinar múltiples carpas para eventos más grandes. Contáctenos para paquetes corporativos personalizados.',
      },
      {
        q: 'Do you handle delivery and setup for corporate events?',
        qEs: '¿Manejan la entrega e instalación para eventos corporativos?',
        a: 'Yes, we provide complete delivery, professional setup, and pickup for all corporate events. Our team arrives on time to ensure everything is ready before your event.',
        aEs: 'Sí, proporcionamos entrega completa, instalación profesional y recolección para todos los eventos corporativos. Nuestro equipo llega a tiempo para asegurar que todo esté listo.',
      },
    ],
  },
  {
    slug: 'party-rentals-katy-tx',
    title: 'Party Rentals Katy TX - Tents, Tables, Chairs & More',
    titleEs: 'Renta para Fiestas en Katy TX - Carpas, Mesas, Sillas y Más',
    description: 'Party rentals in Katy TX. Tents, tables, chairs, tablecloths & more for birthdays, quinceañeras, baby showers & celebrations. Delivery included. Free quotes!',
    descriptionEs: 'Renta para fiestas en Katy TX. Carpas, mesas, sillas, manteles y más para cumpleaños, quinceañeras, baby showers y celebraciones. Entrega incluida.',
    keywords: ['party rentals katy tx', 'party rentals Katy Texas', 'tent rental Katy', 'event rentals Katy TX', 'renta para fiestas Katy TX'],
    heroImage: '/fondo3.jpg',
    h1: 'Party Rentals Katy TX',
    h1Es: 'Renta para Fiestas en Katy TX',
    heroSubtitle: 'Tents, Tables, Chairs & Everything You Need for Your Party',
    heroSubtitleEs: 'Carpas, Mesas, Sillas y Todo lo que Necesitas para tu Fiesta',
    intro: 'Looking for party rentals in Katy, TX? Star Event Rental is your trusted local provider for tents, tables, chairs, tablecloths, and more. We deliver and set up everything for birthdays, quinceañeras, baby showers, graduation parties, and any celebration in Katy and surrounding areas including Houston, Cypress, and Sugar Land. Family-owned and committed to making your event perfect.',
    introEs: '¿Buscas renta para fiestas en Katy, TX? Star Event Rental es tu proveedor local de confianza para carpas, mesas, sillas, manteles y más. Entregamos e instalamos todo para cumpleaños, quinceañeras, baby showers, fiestas de graduación y cualquier celebración en Katy y áreas cercanas incluyendo Houston, Cypress y Sugar Land. Negocio familiar comprometido con hacer tu evento perfecto.',
    productCategories: getProductsByCategories('tents', 'tables', 'chairs', 'tablecloths'),
    faq: [
      {
        q: 'Do you deliver party rentals to Katy TX?',
        qEs: '¿Entregan renta para fiestas en Katy TX?',
        a: 'Yes! We deliver and set up all party rental equipment directly to your event location in Katy, TX. Delivery and professional setup are included in our service.',
        aEs: '¡Sí! Entregamos e instalamos todo el equipo de renta para fiestas directamente en tu ubicación en Katy, TX. La entrega e instalación profesional están incluidas.',
      },
      {
        q: 'What types of parties do you serve in Katy?',
        qEs: '¿Qué tipos de fiestas atienden en Katy?',
        a: 'We serve all types of events in Katy: birthday parties, quinceañeras, baby showers, graduation parties, wedding receptions, family reunions, and more.',
        aEs: 'Atendemos todo tipo de eventos en Katy: fiestas de cumpleaños, quinceañeras, baby showers, fiestas de graduación, recepciones de boda, reuniones familiares y más.',
      },
      {
        q: 'How much do party rentals cost in Katy TX?',
        qEs: '¿Cuánto cuestan las rentas para fiestas en Katy TX?',
        a: 'Our prices start at $3 per chair, $8 per table, and $250 for tents. We also offer complete packages starting at $399 that include tent, tables, chairs, tablecloths, and lights. Contact us for a free quote!',
        aEs: 'Nuestros precios comienzan desde $3 por silla, $8 por mesa y $250 por carpa. También ofrecemos paquetes completos desde $399 que incluyen carpa, mesas, sillas, manteles y luces. ¡Contáctanos para una cotización gratis!',
      },
    ],
  },
  {
    slug: 'dance-floor-rental-houston',
    title: 'Dance Floor Rental Houston & The Woodlands TX',
    titleEs: 'Renta de Pista de Baile Houston y The Woodlands TX',
    description: 'Dance floor rental in Houston & The Woodlands TX. White dance floors in 12x12 and 16x16 sizes for weddings, quinceañeras & events. Setup included. Free quotes!',
    descriptionEs: 'Renta de pista de baile en Houston y The Woodlands TX. Pistas de baile blancas en tamaños 12x12 y 16x16 para bodas, quinceañeras y eventos.',
    keywords: ['dance floor rental Houston', 'dance floor white Houston', 'dance floor in the woodlands', 'dance floor rental near me', 'pista de baile Houston', 'pista de baile The Woodlands'],
    heroImage: '/fondo1.webp',
    h1: 'Dance Floor Rental Houston & The Woodlands',
    h1Es: 'Renta de Pista de Baile Houston y The Woodlands',
    heroSubtitle: 'Elegant White Dance Floors for Weddings, Quinceañeras & Special Events',
    heroSubtitleEs: 'Pistas de Baile Blancas Elegantes para Bodas, Quinceañeras y Eventos Especiales',
    intro: 'Make your event unforgettable with a beautiful dance floor from Star Event Rental. We offer elegant white dance floors in two sizes: 12x12 ($500) and 16x16 ($750), perfect for weddings, quinceañeras, and any special celebration. We deliver and set up dance floors throughout Houston, The Woodlands, Katy, and surrounding areas. Our dance floors are clean, sturdy, and designed to make your event shine.',
    introEs: 'Haz tu evento inolvidable con una hermosa pista de baile de Star Event Rental. Ofrecemos elegantes pistas de baile blancas en dos tamaños: 12x12 ($500) y 16x16 ($750), perfectas para bodas, quinceañeras y cualquier celebración especial. Entregamos e instalamos pistas de baile en todo Houston, The Woodlands, Katy y áreas cercanas. Nuestras pistas de baile están limpias, son resistentes y diseñadas para hacer brillar tu evento.',
    specificItems: getItemsByIds('dancefloor-16x16', 'dancefloor-12x12'),
    faq: [
      {
        q: 'What size dance floors do you offer?',
        qEs: '¿Qué tamaños de pistas de baile ofrecen?',
        a: 'We offer two sizes: a 12x12 dance floor ($500) perfect for smaller venues, and a 16x16 dance floor ($750) ideal for larger events and weddings.',
        aEs: 'Ofrecemos dos tamaños: pista de baile 12x12 ($500) perfecta para espacios pequeños, y pista de baile 16x16 ($750) ideal para eventos grandes y bodas.',
      },
      {
        q: 'Do you deliver dance floors to The Woodlands?',
        qEs: '¿Entregan pistas de baile en The Woodlands?',
        a: 'Yes! We deliver and set up dance floors in The Woodlands, Houston, Katy, Spring, and all surrounding areas. Professional setup is included.',
        aEs: '¡Sí! Entregamos e instalamos pistas de baile en The Woodlands, Houston, Katy, Spring y todas las áreas cercanas. La instalación profesional está incluida.',
      },
      {
        q: 'Can the dance floor be used outdoors?',
        qEs: '¿Se puede usar la pista de baile al aire libre?',
        a: 'Yes, our dance floors can be installed both indoors and outdoors on flat surfaces. For outdoor events, we recommend pairing them with one of our tents for weather protection.',
        aEs: 'Sí, nuestras pistas de baile se pueden instalar tanto en interiores como en exteriores sobre superficies planas. Para eventos al aire libre, recomendamos combinarlas con una de nuestras carpas.',
      },
    ],
  },
  {
    slug: 'wedding-rental-tomball',
    title: 'Wedding Rental Tomball TX - Elegant Event Rentals',
    titleEs: 'Renta para Bodas en Tomball TX - Renta Elegante para Eventos',
    description: 'Wedding rentals in Tomball TX. Elegant tents, Chiavari chairs, tables & linens for your dream wedding. Professional setup & delivery. Free quotes!',
    descriptionEs: 'Renta para bodas en Tomball TX. Carpas elegantes, sillas Chiavari, mesas y manteles para la boda de tus sueños. Instalación y entrega profesional.',
    keywords: ['wedding rental Tomball', 'wedding rental Tomball TX', 'wedding tent Tomball', 'event rentals Tomball', 'renta para bodas Tomball'],
    heroImage: '/fondo4.png',
    h1: 'Wedding Rental Tomball TX',
    h1Es: 'Renta para Bodas en Tomball TX',
    heroSubtitle: 'Elegant Tents, Chiavari Chairs & Linens for Your Dream Wedding',
    heroSubtitleEs: 'Carpas Elegantes, Sillas Chiavari y Manteles para la Boda de tus Sueños',
    intro: 'Planning a wedding in Tomball, TX? Star Event Rental provides everything you need to create an elegant and memorable celebration. From beautiful tents and Chiavari chairs to pristine tablecloths and garden lights, we offer complete wedding rental packages. Our family-owned business delivers personalized service, on-time setup, and professional quality that will make your special day truly unforgettable.',
    introEs: '¿Estás planeando una boda en Tomball, TX? Star Event Rental proporciona todo lo que necesitas para crear una celebración elegante y memorable. Desde hermosas carpas y sillas Chiavari hasta manteles impecables y luces de jardín, ofrecemos paquetes completos de renta para bodas. Nuestro negocio familiar ofrece servicio personalizado, instalación puntual y calidad profesional.',
    productCategories: getProductsByCategories('tents', 'chairs', 'tablecloths'),
    faq: [
      {
        q: 'Do you deliver wedding rentals to Tomball TX?',
        qEs: '¿Entregan renta para bodas en Tomball TX?',
        a: 'Yes! We deliver and set up all wedding rental equipment in Tomball, TX and surrounding areas including Spring, The Woodlands, and Houston. Delivery and setup are included.',
        aEs: '¡Sí! Entregamos e instalamos todo el equipo de renta para bodas en Tomball, TX y áreas cercanas incluyendo Spring, The Woodlands y Houston.',
      },
      {
        q: 'What wedding rental packages do you offer?',
        qEs: '¿Qué paquetes de renta para bodas ofrecen?',
        a: 'We offer Basic packages starting at $399 and Deluxe packages starting at $789 that include tents, chairs, tables, tablecloths, garden lights, and more. Our Deluxe packages also include chandeliers and draping.',
        aEs: 'Ofrecemos paquetes Básicos desde $399 y paquetes Deluxe desde $789 que incluyen carpas, sillas, mesas, manteles, luces de jardín y más. Nuestros paquetes Deluxe también incluyen candelabros y drapeado.',
      },
      {
        q: 'Do you offer Chiavari chairs for weddings?',
        qEs: '¿Ofrecen sillas Chiavari para bodas?',
        a: 'Yes! We have elegant gold Chiavari chairs with white cushions at $5 each, perfect for weddings and upscale events. We also offer kid-sized Chiavari chairs for young guests.',
        aEs: '¡Sí! Tenemos elegantes sillas Chiavari doradas con cojín blanco a $5 cada una, perfectas para bodas y eventos elegantes. También ofrecemos sillas Chiavari tamaño infantil.',
      },
    ],
  },
  {
    slug: 'graduation-party-rental-houston',
    title: 'Graduation Party Rental Houston TX',
    titleEs: 'Renta para Fiesta de Graduación Houston TX',
    description: 'Graduation party rentals in Houston TX. Tents, tables, chairs & more for your grad celebration. Affordable packages. Delivery & setup included. Free quotes!',
    descriptionEs: 'Renta para fiestas de graduación en Houston TX. Carpas, mesas, sillas y más para tu celebración de graduación. Paquetes accesibles. Entrega e instalación incluida.',
    keywords: ['graduation party rental Houston', 'graduate party rental', 'grad party rentals Houston TX', 'graduation celebration rental', 'renta para graduación Houston'],
    heroImage: '/fondo3.jpg',
    h1: 'Graduation Party Rental Houston TX',
    h1Es: 'Renta para Fiesta de Graduación Houston TX',
    heroSubtitle: 'Celebrate Your Graduate with Tents, Tables & Chairs',
    heroSubtitleEs: 'Celebra a tu Graduado con Carpas, Mesas y Sillas',
    intro: 'Celebrate your graduate in style with Star Event Rental! We provide complete party rental packages for graduation celebrations in Houston, TX and surrounding areas. From backyard grad parties to larger celebrations, we have tents, tables, chairs, and linens to make the day special. Our affordable packages start at just $399 and include everything you need for a memorable graduation party.',
    introEs: '¡Celebra a tu graduado con estilo con Star Event Rental! Proporcionamos paquetes completos de renta para celebraciones de graduación en Houston, TX y áreas cercanas. Desde fiestas de graduación en el patio hasta celebraciones más grandes, tenemos carpas, mesas, sillas y manteles para hacer el día especial. Nuestros paquetes accesibles comienzan desde solo $399.',
    productCategories: getProductsByCategories('tents', 'tables', 'chairs'),
    faq: [
      {
        q: 'How much does a graduation party rental cost?',
        qEs: '¿Cuánto cuesta la renta para una fiesta de graduación?',
        a: 'Our graduation party rentals start at $3 per chair, $8 per table, and $250 for tents. Complete packages start at $399 and include tent, tables, chairs, tablecloths, and lights.',
        aEs: 'Nuestra renta para fiestas de graduación comienza desde $3 por silla, $8 por mesa y $250 por carpa. Paquetes completos desde $399 incluyen carpa, mesas, sillas, manteles y luces.',
      },
      {
        q: 'Can you set up for a backyard graduation party?',
        qEs: '¿Pueden instalar para una fiesta de graduación en el patio?',
        a: 'Absolutely! Backyard graduation parties are one of our specialties. We set up tents on grass or concrete, and handle all delivery and pickup.',
        aEs: '¡Absolutamente! Las fiestas de graduación en el patio son una de nuestras especialidades. Instalamos carpas en césped o concreto, y nos encargamos de la entrega y recolección.',
      },
      {
        q: 'How far in advance should I book for a graduation party?',
        qEs: '¿Con cuánta anticipación debo reservar para una fiesta de graduación?',
        a: 'We recommend booking at least 2 weeks in advance, especially during graduation season (May-June). However, we do our best to accommodate last-minute requests.',
        aEs: 'Recomendamos reservar al menos 2 semanas de anticipación, especialmente durante temporada de graduaciones (mayo-junio). Sin embargo, hacemos lo posible por acomodar solicitudes de último momento.',
      },
    ],
  },
];
