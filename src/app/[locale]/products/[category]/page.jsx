import { ProductCategoryPage } from '../../../../components/ProductCategoryPage';
import { productCards } from '../../../../data/homeData';
import { notFound } from 'next/navigation';

const baseUrl = 'https://stareventrentaltx.com';

const categoryMeta = {
  chairs: {
    title: 'Chair Rental Houston TX - Event Chairs from $3',
    titleEs: 'Renta de Sillas Houston TX - Sillas para Eventos desde $3',
    description: 'Chair rental Houston TX. Resin garden ($3), wooden ($4) & gold Chiavari ($5) chairs for weddings, quinceañeras & corporate events. Call 281-636-0615 for a free quote!',
    descriptionEs: 'Renta de sillas Houston TX. Resina ($3), madera ($4) y Chiavari dorada ($5) para bodas, quinceañeras y eventos corporativos. Llama al 281-636-0615 para cotización gratis.',
    keywords: ['chair rental Houston', 'Chiavari chair rental', 'event chairs Houston', 'wedding chair rental Houston TX', 'renta de sillas Houston', 'sillas para eventos Houston', 'alquiler de sillas para bodas Houston'],
  },
  tables: {
    title: 'Table Rental Houston TX - Event Tables from $8',
    titleEs: 'Renta de Mesas Houston TX - Mesas para Eventos desde $8',
    description: 'Table rental Houston TX. 6ft ($8), 8ft ($10), 60" round ($12) & cocktail tables ($15) for weddings & events. Call 281-636-0615 for a free quote!',
    descriptionEs: 'Renta de mesas Houston TX. 6 pies ($8), 8 pies ($10), redondas 60" ($12) y cocktail ($15) para bodas y eventos. Llama al 281-636-0615 para cotización gratis.',
    keywords: ['table rental Houston', 'round table rental Houston', 'cocktail table rental Houston', 'event tables Houston TX', 'renta de mesas Houston', 'mesas para eventos Houston', 'alquiler de mesas para bodas Houston'],
  },
  tablecloths: {
    title: 'Tablecloth Rental Houston TX - White & Colored Linens from $10',
    titleEs: 'Renta de Manteles Houston TX - Manteles Blancos y de Color desde $10',
    description: 'Tablecloth rental Houston TX. Elegant white ($10) & colored ($12) linens for weddings, quinceañeras & corporate events. Call 281-636-0615 for a free quote!',
    descriptionEs: 'Renta de manteles Houston TX. Manteles blancos ($10) y de colores ($12) para bodas, quinceañeras y eventos corporativos. Llama al 281-636-0615 para cotización gratis.',
    keywords: ['tablecloth rental Houston', 'linen rental Houston', 'event tablecloths Houston TX', 'wedding linens Houston', 'renta de manteles Houston', 'manteles para eventos Houston', 'alquiler de manteles para bodas'],
  },
  tents: {
    title: 'Tent Rental Houston TX - Wedding & Event Tents from $250',
    titleEs: 'Renta de Carpas Houston TX - Carpas para Bodas y Eventos desde $250',
    description: 'Tent rental Houston TX. Standard ($250+), high peak ($550+) & clear tents ($750). 20x20 to 20x60 with lights & walls. Call 281-636-0615 for a free quote!',
    descriptionEs: 'Renta de carpas Houston TX. Estándar ($250+), high peak ($550+) y transparentes ($750). De 20x20 a 20x60 con luces y paredes. Llama al 281-636-0615 para cotización gratis.',
    keywords: ['tent rental Houston', 'wedding tent rental Houston TX', 'high peak tent Houston', 'clear tent rental Houston', 'renta de carpas Houston', 'carpas para bodas Houston', 'alquiler de carpas para eventos Houston'],
  },
  others: {
    title: 'Event Equipment Rental Houston TX - Dance Floors, Heaters & More',
    titleEs: 'Renta de Equipo para Eventos Houston TX - Pistas de Baile, Calentadores y Más',
    description: 'Event equipment rental Houston TX. Dance floors ($500-$750), heaters ($65), coolers ($120) & garden lights ($50). Call 281-636-0615 for a free quote!',
    descriptionEs: 'Renta de equipo para eventos Houston TX. Pistas de baile ($500-$750), calentadores ($65), enfriadores ($120) y luces ($50). Llama al 281-636-0615 para cotización gratis.',
    keywords: ['dance floor rental Houston', 'event equipment rental Houston TX', 'heater rental Houston', 'party equipment Houston', 'renta de equipo para eventos Houston', 'pista de baile Houston', 'alquiler de equipo para fiestas Houston'],
  },
};

export function generateStaticParams() {
  const locales = ['en', 'es'];
  return locales.flatMap((locale) =>
    productCards.map((cat) => ({ locale, category: cat.slug }))
  );
}

export async function generateMetadata({ params }) {
  const { locale, category: slug } = await params;
  const meta = categoryMeta[slug];
  if (!meta) return {};

  const isEs = locale === 'es';
  const title = isEs ? meta.titleEs : meta.title;
  const description = isEs ? meta.descriptionEs : meta.description;
  const url = isEs
    ? `${baseUrl}/es/products/${slug}`
    : `${baseUrl}/products/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: '/logo.png', width: 1200, height: 630, alt: title }],
    },
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/products/${slug}`,
        es: `${baseUrl}/es/products/${slug}`,
      },
    },
  };
}

const categoryContent = {
  chairs: {
    intro: 'At Star Event Rental, we offer a curated selection of high-quality event chairs for every occasion in Houston, TX. From resin garden chairs at $3 each to elegant gold Chiavari chairs at $5, our inventory covers weddings, quinceañeras, corporate galas, and backyard celebrations. Contact us at 281-636-0615 for a free quote.',
    introEs: 'En Star Event Rental ofrecemos una selección de sillas de alta calidad para todo tipo de evento en Houston, TX. Desde sillas de resina de jardín a $3 hasta elegantes sillas Chiavari doradas a $5, nuestro inventario cubre bodas, quinceañeras, eventos corporativos y celebraciones en casa. Llámanos al 281-636-0615 para una cotización gratis.',
    contentSections: [
      {
        title: 'How to Choose the Right Event Chair',
        titleEs: 'Cómo Elegir la Silla Correcta para tu Evento',
        text: 'The right chair sets the tone for your entire event. Resin garden chairs are ideal for outdoor celebrations — they\'re lightweight, weather-resistant, and easy to arrange for large guest counts. Wooden chairs bring a rustic warmth perfect for barn-style weddings or garden parties. For formal weddings and upscale galas, gold Chiavari chairs with white cushions create an elegant, sophisticated atmosphere. We also carry kid-sized Chiavari chairs so the youngest guests sit comfortably at your celebration.',
        textEs: 'La silla correcta establece el tono de todo tu evento. Las sillas de resina son ideales para celebraciones al aire libre — son ligeras, resistentes al clima y fáciles de organizar para grupos grandes. Las sillas de madera aportan una calidez rústica perfecta para bodas estilo rancho o fiestas de jardín. Para bodas formales y galas elegantes, las sillas Chiavari doradas con cojín blanco crean una atmósfera sofisticada. También tenemos sillas Chiavari para niños para que los más pequeños se sienten cómodamente.',
      },
      {
        title: 'Save with Our Event Packages',
        titleEs: 'Ahorra con Nuestros Paquetes de Evento',
        text: 'Need chairs with tables, tablecloths, or a tent? Our complete event packages start at $399 and bundle everything together for significant savings. Call us at 281-636-0615 or visit our contact page to get a personalized quote for your event.',
        textEs: '¿Necesitas sillas con mesas, manteles o carpa? Nuestros paquetes completos de evento comienzan desde $399 y combinan todo para un ahorro significativo. Llámanos al 281-636-0615 o visita nuestra página de contacto para obtener una cotización personalizada.',
      },
    ],
    faq: [
      { q: 'How much does it cost to rent chairs in Houston?', qEs: '¿Cuánto cuesta rentar sillas en Houston?', a: 'Our chair rentals start at $3 per chair for resin garden chairs, $4 for wooden chairs, and $5 for gold Chiavari chairs. Call 281-636-0615 for a free quote.', aEs: 'Nuestras rentas de sillas comienzan en $3 por silla de resina de jardín, $4 por silla de madera y $5 por silla Chiavari dorada. Llama al 281-636-0615 para una cotización gratis.' },
      { q: 'What areas do you serve?', qEs: '¿Qué áreas cubren?', a: 'We serve Houston, Katy, Cypress, Sugar Land, Richmond, Rosenberg, Tomball, Spring, The Woodlands, Humble, Baytown, and Pearland.', aEs: 'Servimos a Houston, Katy, Cypress, Sugar Land, Richmond, Rosenberg, Tomball, Spring, The Woodlands, Humble, Baytown y Pearland.' },
      { q: 'What types of chairs do you offer for weddings?', qEs: '¿Qué tipos de sillas ofrecen para bodas?', a: 'For weddings, our most popular options are gold Chiavari chairs ($5 each) for an elegant look, and white resin garden chairs ($3 each) for outdoor ceremonies.', aEs: 'Para bodas, nuestras opciones más populares son las sillas Chiavari doradas ($5 cada una) para un look elegante, y las sillas de resina blanca ($3 cada una) para ceremonias al aire libre.' },
      { q: 'Do you have chairs for children?', qEs: '¿Tienen sillas para niños?', a: 'Yes! We offer kid-sized Chiavari chairs at $5 each, perfect for children ages 2 to 6. They match our adult Chiavari chairs for a cohesive look at weddings and family celebrations.', aEs: '¡Sí! Ofrecemos sillas Chiavari para niños a $5 cada una, perfectas para niños de 2 a 6 años. Combinan con nuestras sillas Chiavari para adultos para un look uniforme en bodas y celebraciones familiares.' },
      { q: 'Can I combine chairs with other rentals?', qEs: '¿Puedo combinar sillas con otras rentas?', a: 'Absolutely! You can rent chairs individually or save with our event packages starting at $399 that include tent, tables, tablecloths, chairs, and garden lights.', aEs: '¡Por supuesto! Puedes rentar sillas individualmente o ahorrar con nuestros paquetes de evento desde $399 que incluyen carpa, mesas, manteles, sillas y luces de jardín.' },
      { q: 'How do I get a quote for my event?', qEs: '¿Cómo obtengo una cotización para mi evento?', a: 'Call us at 281-636-0615, send a WhatsApp message, or fill out the contact form on our website. Let us know your event date, guest count, and what you need — we\'ll send you a personalized quote.', aEs: 'Llámanos al 281-636-0615, envía un mensaje por WhatsApp, o llena el formulario de contacto en nuestro sitio. Dinos la fecha de tu evento, número de invitados y lo que necesitas — te enviaremos una cotización personalizada.' },
    ],
  },
  tables: {
    intro: 'Star Event Rental offers a complete range of event tables for rent in Houston, TX. Whether you need 6-foot rectangular tables for a buffet, 8-foot tables for banquet seating, 60-inch round tables for wedding receptions, or cocktail tables for standing receptions — we have you covered. Contact us at 281-636-0615 for a free quote.',
    introEs: 'Star Event Rental ofrece una gama completa de mesas para eventos en Houston, TX. Ya sea que necesites mesas rectangulares de 6 pies para buffet, mesas de 8 pies para banquete, mesas redondas de 60 pulgadas para recepciones de boda o mesas cocktail para recepciones de pie — tenemos lo que necesitas. Llámanos al 281-636-0615 para una cotización gratis.',
    contentSections: [
      {
        title: 'Table Size Guide: How Many Guests Per Table?',
        titleEs: 'Guía de Tamaños de Mesa: ¿Cuántos Invitados por Mesa?',
        text: 'Choosing the right table size is essential for guest comfort. A 6-foot rectangular table seats 6-8 guests and is great for family-style dining or buffet setups. An 8-foot rectangular table seats 8-10 guests comfortably. A 60-inch round table is the most popular for weddings, seating 8-10 guests with room for centerpieces. Cocktail tables (standing height) work best for cocktail hours and social mixers where guests mingle freely.',
        textEs: 'Elegir el tamaño correcto de mesa es esencial para la comodidad de los invitados. Una mesa rectangular de 6 pies acomoda 6-8 personas y es ideal para comidas familiares o buffets. Una mesa de 8 pies acomoda 8-10 personas cómodamente. Una mesa redonda de 60 pulgadas es la más popular para bodas, sentando 8-10 personas con espacio para centros de mesa. Las mesas cocktail (altura de pie) funcionan mejor para horas de cocteles y eventos sociales.',
      },
      {
        title: 'Table & Chair Combinations for Events',
        titleEs: 'Combinaciones de Mesas y Sillas para Eventos',
        text: 'Planning table and chair quantities can be tricky. Here\'s a quick guide: For 50 guests, you\'ll need approximately 7 round tables or 7 rectangular 8ft tables with 50 chairs. For 100 guests, plan for 13 round tables or 13 rectangular tables with 100 chairs. Save money by choosing one of our complete event packages — our Basic package starts at $399 and includes a tent, tables, tablecloths, chairs, and garden lights.',
        textEs: 'Planificar cantidades de mesas y sillas puede ser complicado. Aquí una guía rápida: Para 50 invitados, necesitarás aproximadamente 7 mesas redondas o 7 mesas rectangulares de 8 pies con 50 sillas. Para 100 invitados, planea 13 mesas redondas o rectangulares con 100 sillas. Ahorra dinero eligiendo uno de nuestros paquetes completos — nuestro paquete Básico desde $399 incluye carpa, mesas, manteles, sillas y luces de jardín.',
      },
    ],
    faq: [
      { q: 'How much does table rental cost in Houston?', qEs: '¿Cuánto cuesta la renta de mesas en Houston?', a: 'Our table rental prices start at $8 for a 6ft rectangular table, $10 for an 8ft table, $12 for a 60" round table, and $15 for a cocktail table. Call 281-636-0615 for details.', aEs: 'Nuestros precios de renta de mesas comienzan en $8 por mesa rectangular de 6 pies, $10 por mesa de 8 pies, $12 por mesa redonda de 60" y $15 por mesa cocktail. Llama al 281-636-0615 para detalles.' },
      { q: 'What size table do I need for my event?', qEs: '¿Qué tamaño de mesa necesito para mi evento?', a: 'For seated dinner, round 60" tables seat 8-10 guests each. Rectangular 6ft tables seat 6-8, and 8ft tables seat 8-10. For a buffet setup, one 8ft table per 30-40 guests works well. Contact us and we can help you plan the layout.', aEs: 'Para cena sentada, las mesas redondas de 60" sientan 8-10 personas. Las rectangulares de 6 pies sientan 6-8, y las de 8 pies sientan 8-10. Para buffet, una mesa de 8 pies por cada 30-40 invitados funciona bien. Contáctanos y te ayudamos a planificar la distribución.' },
      { q: 'Do you rent cocktail tables for standing receptions?', qEs: '¿Rentan mesas cocktail para recepciones de pie?', a: 'Yes! Our cocktail tables are $15 each and are perfect for cocktail hours, networking events, and standing receptions.', aEs: '¡Sí! Nuestras mesas cocktail cuestan $15 cada una y son perfectas para horas de cocteles, eventos de networking y recepciones de pie.' },
      { q: 'Can I rent tables without chairs?', qEs: '¿Puedo rentar mesas sin sillas?', a: 'Yes! You can rent tables, chairs, or any combination. Our event packages (starting at $399) bundle tables, chairs, tablecloths, tent, and lights together for the best value.', aEs: '¡Sí! Puedes rentar mesas, sillas o cualquier combinación. Nuestros paquetes de eventos (desde $399) combinan mesas, sillas, manteles, carpa y luces para el mejor valor.' },
      { q: 'How many tables do I need for 100 guests?', qEs: '¿Cuántas mesas necesito para 100 invitados?', a: 'For 100 guests seated at dinner, you\'ll need approximately 13 round tables (60") or 13 rectangular tables (8ft). You may also want extra tables for gifts, cake, and a DJ setup.', aEs: 'Para 100 invitados sentados a cenar, necesitarás aproximadamente 13 mesas redondas (60") o 13 mesas rectangulares (8 pies). También puedes querer mesas extra para regalos, pastel y DJ.' },
      { q: 'Do tables come with tablecloths?', qEs: '¿Las mesas vienen con manteles?', a: 'Tables and tablecloths are rented separately. White tablecloths are $10 each and colored tablecloths are $12. Or choose one of our packages that includes both tables and tablecloths.', aEs: 'Las mesas y los manteles se rentan por separado. Los manteles blancos cuestan $10 y los de color $12. O elige uno de nuestros paquetes que incluyen mesas y manteles.' },
    ],
  },
  tablecloths: {
    intro: 'Complete your event\'s look with elegant tablecloth rentals from Star Event Rental in Houston, TX. We offer white linens at $10 each and colored tablecloths at $12 each, fitting all standard event table sizes. Perfect for weddings, quinceañeras, corporate dinners, and more. Call 281-636-0615 for a free quote.',
    introEs: 'Completa el look de tu evento con elegantes manteles de Star Event Rental en Houston, TX. Ofrecemos manteles blancos a $10 cada uno y manteles de colores a $12, ajustándose a todos los tamaños estándar de mesa. Perfectos para bodas, quinceañeras, cenas corporativas y más. Llama al 281-636-0615 para una cotización gratis.',
    contentSections: [
      {
        title: 'Choosing the Perfect Tablecloth for Your Event',
        titleEs: 'Cómo Elegir el Mantel Perfecto para tu Evento',
        text: 'White tablecloths are timeless and work for virtually every occasion — from elegant weddings to corporate galas. They create a clean, classic backdrop that lets your centerpieces and decorations shine. Colored tablecloths add personality and help establish your event\'s color scheme. Popular choices include black for formal corporate events, burgundy or navy for fall celebrations, and pastels for baby showers and spring events.',
        textEs: 'Los manteles blancos son atemporales y funcionan para prácticamente toda ocasión — desde bodas elegantes hasta galas corporativas. Crean un fondo limpio y clásico que permite que tus centros de mesa y decoraciones brillen. Los manteles de color agregan personalidad y ayudan a establecer la paleta de colores de tu evento. Las opciones populares incluyen negro para eventos corporativos formales, vino o azul marino para celebraciones de otoño, y pasteles para baby showers y eventos de primavera.',
      },
      {
        title: 'Tablecloth Sizing Guide',
        titleEs: 'Guía de Tamaños de Manteles',
        text: 'Our tablecloths fit 6ft rectangular tables, 8ft rectangular tables, and 60" round tables. Just tell us your table quantities and types, and we\'ll provide the matching tablecloths. Contact us at 281-636-0615 to discuss your specific needs.',
        textEs: 'Nuestros manteles se ajustan a mesas rectangulares de 6 pies, mesas de 8 pies y mesas redondas de 60". Solo dinos las cantidades y tipos de mesas y te proporcionaremos los manteles correspondientes. Contáctanos al 281-636-0615 para discutir tus necesidades específicas.',
      },
    ],
    faq: [
      { q: 'How much does tablecloth rental cost?', qEs: '¿Cuánto cuesta la renta de manteles?', a: 'White tablecloths are $10 each and colored tablecloths are $12 each. Call 281-636-0615 for a quote.', aEs: 'Los manteles blancos cuestan $10 cada uno y los manteles de color $12 cada uno. Llama al 281-636-0615 para una cotización.' },
      { q: 'What colors are available for tablecloths?', qEs: '¿Qué colores de manteles están disponibles?', a: 'We offer white and colored tablecloths. Contact us to check availability for your specific color preference.', aEs: 'Ofrecemos manteles blancos y de colores. Contáctanos para verificar disponibilidad de tu color preferido.' },
      { q: 'Do your tablecloths fit round and rectangular tables?', qEs: '¿Sus manteles se ajustan a mesas redondas y rectangulares?', a: 'Yes! Our tablecloths fit our rental table sizes — 6ft rectangular, 8ft rectangular, and 60" round tables.', aEs: '¡Sí! Nuestros manteles se ajustan a nuestros tamaños de mesas — rectangulares de 6 pies, 8 pies y redondas de 60".' },
      { q: 'Can I rent tablecloths without renting tables?', qEs: '¿Puedo rentar manteles sin rentar mesas?', a: 'Yes, you can rent tablecloths separately. Our event packages also bundle tables and tablecloths together for better value.', aEs: 'Sí, puedes rentar manteles por separado. Nuestros paquetes de evento también combinan mesas y manteles para un mejor valor.' },
      { q: 'How many tablecloths do I need for my event?', qEs: '¿Cuántos manteles necesito para mi evento?', a: 'One tablecloth per table. If you\'re having a buffet, you may want extra tablecloths for food and drink stations. Contact us and we\'ll help you calculate the right quantity.', aEs: 'Un mantel por mesa. Si vas a tener buffet, puedes querer manteles extra para estaciones de comida y bebida. Contáctanos y te ayudamos a calcular la cantidad correcta.' },
    ],
  },
  tents: {
    intro: 'Star Event Rental offers tent rentals in Houston, TX. We have standard frame tents from 20x20 ($250) to 20x60 ($700), premium high peak tents ($550-$1,200), and clear tents ($750). Our tents include garden lights and walls. Whether it\'s a backyard wedding in Katy, a quinceañera in Cypress, or a corporate event in The Woodlands — call 281-636-0615 for a free quote.',
    introEs: 'Star Event Rental ofrece renta de carpas en Houston, TX. Tenemos carpas estándar desde 20x20 ($250) hasta 20x60 ($700), carpas premium high peak ($550-$1,200) y carpas transparentes ($750). Nuestras carpas incluyen luces de jardín y paredes. Ya sea una boda en Katy, una quinceañera en Cypress o un evento corporativo en The Woodlands — llama al 281-636-0615 para una cotización gratis.',
    contentSections: [
      {
        title: 'Tent Size Guide: How Many Guests Can You Fit?',
        titleEs: 'Guía de Tamaños de Carpas: ¿Cuántos Invitados Caben?',
        text: 'Choosing the right tent size depends on your guest count and layout. A 20x20 tent fits up to 30 seated guests — perfect for intimate celebrations. A 20x32 accommodates 50 at tables or 70 in chairs. Our popular 20x40 handles 70 at tables or 100 in chairs, making it ideal for mid-sized weddings. The 20x60 is our largest, fitting 120+ guests for grand celebrations. All tents come with walls and garden lights.',
        textEs: 'Elegir el tamaño correcto de carpa depende de tu número de invitados y la distribución. Una carpa 20x20 acomoda hasta 30 invitados sentados — perfecta para celebraciones íntimas. Una 20x32 acomoda 50 en mesas o 70 en sillas. Nuestra popular 20x40 maneja 70 en mesas o 100 en sillas, ideal para bodas medianas. La 20x60 es la más grande, con capacidad para 120+ invitados. Todas las carpas incluyen paredes y luces de jardín.',
      },
      {
        title: 'Standard vs. High Peak vs. Clear Tents',
        titleEs: 'Carpas Estándar vs. High Peak vs. Transparentes',
        text: 'Standard frame tents are our most affordable option, starting at $250. High peak tents ($550+) feature dramatic peaked rooflines that create a striking visual — they\'re a popular choice for weddings and upscale events. Clear tents ($750) offer a unique transparent experience, perfect for evening events under the stars. All our tents are fire-proof rated.',
        textEs: 'Las carpas estándar son nuestra opción más accesible, desde $250. Las carpas high peak ($550+) tienen techos con picos dramáticos que crean un visual impresionante — son una opción popular para bodas y eventos de lujo. Las carpas transparentes ($750) ofrecen una experiencia única, perfectas para eventos nocturnos bajo las estrellas. Todas nuestras carpas son a prueba de fuego.',
      },
    ],
    faq: [
      { q: 'How much does a tent rental cost in Houston?', qEs: '¿Cuánto cuesta rentar una carpa en Houston?', a: 'Our tent rentals range from $250 (20x20 standard) to $1,200 (20x40 high peak). Clear tents start at $750. Tents include garden lights and walls. Call 281-636-0615 for a quote.', aEs: 'Nuestras rentas de carpas van desde $250 (20x20 estándar) hasta $1,200 (20x40 high peak). Las carpas transparentes desde $750. Las carpas incluyen luces de jardín y paredes. Llama al 281-636-0615 para una cotización.' },
      { q: 'What size tent do I need for 100 guests?', qEs: '¿Qué tamaño de carpa necesito para 100 invitados?', a: 'For 100 guests seated at round tables, a 20x40 tent is a great fit. If your guests will be in chairs only (like a ceremony), a 20x32 could work. For 100 guests with a dance floor, consider a 20x60. Contact us for personalized recommendations.', aEs: 'Para 100 invitados sentados en mesas redondas, una carpa 20x40 es ideal. Si solo usarás sillas (como una ceremonia), una 20x32 podría funcionar. Para 100 invitados con pista de baile, considera una 20x60. Contáctanos para recomendaciones personalizadas.' },
      { q: 'Can I put a tent on concrete or a driveway?', qEs: '¿Puedo poner una carpa en concreto o entrada de autos?', a: 'Our frame tents can be installed on grass, concrete, driveways, and patios. We use water barrels ($30 each) for anchoring on hard surfaces.', aEs: 'Nuestras carpas de marco se pueden instalar en pasto, concreto, entradas y patios. Usamos barriles de agua ($30 cada uno) para anclaje en superficies duras.' },
      { q: 'Are your tents fire-proof?', qEs: '¿Sus carpas son a prueba de fuego?', a: 'Yes, all our tents are fire-proof rated.', aEs: 'Sí, todas nuestras carpas son a prueba de fuego.' },
      { q: 'What is the difference between a standard and high peak tent?', qEs: '¿Cuál es la diferencia entre carpa estándar y high peak?', a: 'Standard tents have a flat or low-slope roofline and are our most budget-friendly option. High peak tents feature dramatic peaked rooflines (like a cathedral), creating a more elegant and spacious feel.', aEs: 'Las carpas estándar tienen techo plano o de pendiente baja y son la opción más económica. Las carpas high peak tienen techos con picos dramáticos (como una catedral), creando una sensación más elegante y espaciosa.' },
      { q: 'What areas do you serve for tent rental?', qEs: '¿En qué áreas ofrecen renta de carpas?', a: 'We serve Houston, Katy, Cypress, Sugar Land, Richmond, Rosenberg, Tomball, Spring, The Woodlands, Humble, Baytown, and Pearland. Call 281-636-0615 for availability in your area.', aEs: 'Servimos a Houston, Katy, Cypress, Sugar Land, Richmond, Rosenberg, Tomball, Spring, The Woodlands, Humble, Baytown y Pearland. Llama al 281-636-0615 para disponibilidad en tu área.' },
    ],
  },
  others: {
    intro: 'Beyond tents, tables, and chairs, Star Event Rental offers event equipment to make your Houston celebration complete. Dance floors ($500-$750), outdoor heaters ($65), evaporative coolers ($120), garden lights ($50), plates ($2 each), and more. Call 281-636-0615 for a free quote.',
    introEs: 'Además de carpas, mesas y sillas, Star Event Rental ofrece equipo para completar tu celebración en Houston. Pistas de baile ($500-$750), calentadores exteriores ($65), enfriadores evaporativos ($120), luces de jardín ($50), platos ($2 cada uno) y más. Llama al 281-636-0615 para una cotización gratis.',
    contentSections: [
      {
        title: 'Dance Floor Rental: Make Your Event Unforgettable',
        titleEs: 'Renta de Pista de Baile: Haz tu Evento Inolvidable',
        text: 'Our dance floors transform any tent or outdoor space into a party venue. The 12x12 dance floor ($500) is great for smaller gatherings, while the 16x16 ($750) is suited for larger events. Both pair well with our tent and lighting options for a complete entertainment area.',
        textEs: 'Nuestras pistas de baile transforman cualquier carpa o espacio exterior en un lugar de fiesta. La pista de 12x12 ($500) es ideal para reuniones más pequeñas, mientras que la de 16x16 ($750) es adecuada para eventos más grandes. Ambas combinan bien con nuestras carpas e iluminación para un área de entretenimiento completa.',
      },
      {
        title: 'Climate Control: Heaters & Coolers for Houston Weather',
        titleEs: 'Control de Clima: Calentadores y Enfriadores para el Clima de Houston',
        text: 'Houston weather can be unpredictable. Our outdoor heaters ($65 each) cover 200 sq ft of heating space. Our Hessaire evaporative coolers ($120) cover 950 sq ft — great for Houston\'s hot months. Propane gas tanks ($20) are available for heaters and cooking equipment. Contact us to plan climate control for your event.',
        textEs: 'El clima de Houston puede ser impredecible. Nuestros calentadores exteriores ($65 cada uno) cubren 200 pies cuadrados de calefacción. Nuestros enfriadores evaporativos Hessaire ($120) cubren 950 pies cuadrados — ideales para los meses calurosos de Houston. Tanques de gas propano ($20) disponibles para calentadores y equipo de cocina. Contáctanos para planificar el control de clima de tu evento.',
      },
    ],
    faq: [
      { q: 'How much does dance floor rental cost in Houston?', qEs: '¿Cuánto cuesta rentar una pista de baile en Houston?', a: 'Our 12x12 dance floor is $500 and our 16x16 dance floor is $750. Call 281-636-0615 for a quote.', aEs: 'Nuestra pista de baile 12x12 cuesta $500 y la de 16x16 cuesta $750. Llama al 281-636-0615 para una cotización.' },
      { q: 'Do you rent heaters for outdoor events?', qEs: '¿Rentan calentadores para eventos al aire libre?', a: 'Yes! Our outdoor heaters are $65 each and cover approximately 200 sq ft of heating space. Propane gas tanks are available for $20 each.', aEs: '¡Sí! Nuestros calentadores exteriores cuestan $65 cada uno y cubren aproximadamente 200 pies cuadrados. Los tanques de propano están disponibles por $20 cada uno.' },
      { q: 'Do you rent garden lights separately?', qEs: '¿Rentan luces de jardín por separado?', a: 'Yes! Our 48-foot garden light strings are $50 each and create beautiful ambient lighting for any outdoor event.', aEs: '¡Sí! Nuestras cadenas de luces de jardín de 48 pies cuestan $50 cada una y crean hermosa iluminación ambiental para cualquier evento al aire libre.' },
      { q: 'Can I use a cooler inside a tent?', qEs: '¿Puedo usar un enfriador dentro de una carpa?', a: 'Our Hessaire evaporative coolers (950 sq ft coverage) can be used with tents. Contact us at 281-636-0615 to discuss the best setup for your event.', aEs: 'Nuestros enfriadores evaporativos Hessaire (cobertura de 950 pies cuadrados) se pueden usar con carpas. Contáctanos al 281-636-0615 para discutir la mejor configuración para tu evento.' },
      { q: 'Do you rent plates?', qEs: '¿Rentan platos?', a: 'Yes, we offer plates at $2 each. Contact us for availability.', aEs: 'Sí, ofrecemos platos a $2 cada uno. Contáctanos para disponibilidad.' },
      { q: 'What areas do you serve?', qEs: '¿Qué áreas cubren?', a: 'We serve Houston, Katy, Cypress, Sugar Land, Richmond, Rosenberg, Tomball, Spring, The Woodlands, Humble, Baytown, and Pearland.', aEs: 'Servimos a Houston, Katy, Cypress, Sugar Land, Richmond, Rosenberg, Tomball, Spring, The Woodlands, Humble, Baytown y Pearland.' },
    ],
  },
};

export default async function Page({ params }) {
  const { locale, category: slug } = await params;
  const category = productCards.find((c) => c.slug === slug);
  if (!category) notFound();

  const isEs = locale === 'es';
  const categoryName = isEs ? category.nameEs : category.name;
  const content = categoryContent[slug];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: isEs ? `Renta de ${categoryName}` : `${categoryName} Rental`,
      description: isEs
        ? categoryMeta[slug]?.descriptionEs
        : categoryMeta[slug]?.description,
      numberOfItems: category.items.length,
      itemListElement: category.items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Product',
          name: isEs ? (item.nameEs || item.name) : item.name,
          description: isEs ? (item.descEs || item.desc) : item.desc,
          image: `${baseUrl}${item.image}`,
          offers: {
            '@type': 'Offer',
            price: item.price.toFixed(2),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'LocalBusiness',
              name: 'Star Event Rental',
            },
          },
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: isEs ? `${baseUrl}/es` : baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: isEs ? 'Productos' : 'Products',
          item: isEs ? `${baseUrl}/es/products/${slug}` : `${baseUrl}/products/${slug}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: categoryName,
          item: isEs
            ? `${baseUrl}/es/products/${slug}`
            : `${baseUrl}/products/${slug}`,
        },
      ],
    },
  ];

  // Add FAQPage schema if category has FAQ content
  if (content?.faq?.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: content.faq.map((item) => ({
        '@type': 'Question',
        name: isEs ? item.qEs : item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: isEs ? item.aEs : item.a,
        },
      })),
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductCategoryPage category={category} content={content} />
    </>
  );
}
