export const productCards = [
  {
    name: 'Chairs',
    nameEs: 'Sillas',
    slug: 'chairs',
    image: '/chiavariportada.webp',
    items: [
      { id: 'chair-chiavari', name: 'Chiavari Chair', nameEs: 'Silla Chiavari', price: 5.00, desc: 'Elegant gold Chiavari chairs with white cushion, perfect for weddings and upscale events.', descEs: 'Elegantes sillas Chiavari doradas con cojín blanco, perfectas para bodas y eventos de gala.', image: '/chiavari.webp', checkoutLink: '#' },
      { id: 'chair-kid-chiavari', name: 'Kid Chiavari Chair', nameEs: 'Silla Chiavari para Niños', price: 5.00, desc: 'Beautiful kid-sized Chiavari chairs, perfect for children ages 2 to 6 years at weddings and special events.', descEs: 'Hermosas sillas Chiavari para niños de 2 a 6 años, perfectas para los pequeños en bodas y eventos especiales.', image: '/kidchiavari.webp', checkoutLink: '#' },
      { id: 'chair-wood', name: 'Wooden Chair', nameEs: 'Silla de Madera', price: 4.00, desc: 'Classic wooden chairs that bring warmth and elegance to any event setting.', descEs: 'Sillas de madera clásicas que aportan calidez y elegancia a cualquier evento.', image: '/woodchair.webp', checkoutLink: '#' },
      { id: 'chair-resin', name: 'Resin Garden Chair', nameEs: 'Silla de Resina de Jardín', price: 3.00, desc: 'Elegant white resin garden chairs, perfect for weddings and formal events.', descEs: 'Elegantes sillas de resina de jardín blanca, perfectas para bodas y eventos formales.', image: '/gardenchair.webp', checkoutLink: '#' },
    ],
  },
  {
    name: 'Tables',
    nameEs: 'Mesas',
    slug: 'tables',
    image: '/tablesportada.webp',
    items: [
      { id: 'table-cocktail', name: 'Cocktail Table', nameEs: 'Mesa Cocktail', price: 15.00, desc: 'Elegant cocktail tables perfect for standing receptions and social events.', descEs: 'Elegantes mesas cocktail perfectas para recepciones de pie y eventos sociales.', image: '/cocktailtable.webp', checkoutLink: '#' },
      { id: 'table-round', name: '60" Round Table', nameEs: 'Mesa Redonda de 60"', price: 12.00, desc: '60-inch round folding tables, perfect for banquet-style seating.', descEs: 'Mesas redondas plegables de 60 pulgadas, perfectas para disposición tipo banquete.', image: '/roundtable.webp', checkoutLink: '#' },
      { id: 'table-8ft', name: '8 FT Rectangular Table', nameEs: 'Mesa Rectangular de 8 pies', price: 10.00, desc: 'Sturdy 8-foot plastic folding tables built for versatility and strength.', descEs: 'Resistentes mesas plegables de plástico de 8 pies, construidas para versatilidad y fuerza.', image: '/8ft.webp', checkoutLink: '#' },
      { id: 'table-6ft', name: '6 FT Rectangular Table', nameEs: 'Mesa Rectangular de 6 pies', price: 8.00, desc: 'Versatile 6-foot folding tables, great for smaller setups and buffets.', descEs: 'Versátiles mesas plegables de 6 pies, ideales para montajes pequeños y buffets.', image: '/6ft.webp', checkoutLink: '#' },
    ],
  },
  {
    name: 'Tablecloths',
    nameEs: 'Manteles',
    slug: 'tablecloths',
    image: '/tableclothsportada.webp',
    items: [
      { id: 'cloth-color', name: 'Colored Tablecloth', nameEs: 'Mantel de Color', price: 12.00, desc: 'Available in various colors to match your event theme and decoration.', descEs: 'Disponibles en varios colores para combinar con el tema y decoración de tu evento.', image: '/colorcloths.webp', checkoutLink: '#' },
      { id: 'cloth-white', name: 'White Tablecloth', nameEs: 'Mantel Blanco', price: 10.00, desc: 'Elegant white tablecloths that add a clean, sophisticated touch to any event.', descEs: 'Elegantes manteles blancos que agregan un toque limpio y sofisticado a cualquier evento.', image: '/whitecloths.webp', checkoutLink: '#' },
    ],
  },
  {
    name: 'Tents',
    nameEs: 'Carpas',
    slug: 'tents',
    image: '/tentsportada.webp',
    items: [
      { id: 'tent-popup-10x20', name: 'Pop Up Tent 10x20', nameEs: 'Carpa Pop Up 10x20', price: 150.00, desc: 'Compact 10x20 pop-up tent — quick setup, seats up to 16 guests. Includes garden lights. Perfect for small backyard gatherings and intimate events.', descEs: 'Carpa pop-up 10x20 compacta — montaje rápido, acomoda hasta 16 invitados. Incluye luces de jardín. Perfecta para reuniones pequeñas en patio y celebraciones íntimas.', image: '/tent10x20.webp', checkoutLink: '#', addons: [{ id: 'draping-bundle', name: 'With Draping + Chandelier', nameEs: 'Con Drapeado + Candelabro', price: 350.00 }] },
      { id: 'tent-10x30', name: 'Tent 10x30', nameEs: 'Carpa 10x30', price: 180.00, desc: 'Frame tent 10x30, seats up to 24 guests. Includes garden lights. Ideal for medium gatherings and outdoor parties.', descEs: 'Carpa frame 10x30, acomoda hasta 24 invitados. Incluye luces de jardín. Ideal para reuniones medianas y fiestas al aire libre.', image: '/tent10x30.webp', checkoutLink: '#', addons: [{ id: 'draping-bundle', name: 'With Draping + Chandelier', nameEs: 'Con Drapeado + Candelabro', price: 520.00 }] },
      { id: 'tent-10x40', name: 'Tent 10x40', nameEs: 'Carpa 10x40', price: 250.00, desc: 'Frame tent 10x40, seats up to 32 guests. Includes garden lights. Great for larger backyard events and celebrations.', descEs: 'Carpa frame 10x40, acomoda hasta 32 invitados. Incluye luces de jardín. Ideal para eventos más grandes en patio y celebraciones.', image: '/tent10x40.webp', checkoutLink: '#', addons: [{ id: 'draping-bundle', name: 'With Draping + Chandelier', nameEs: 'Con Drapeado + Candelabro', price: 600.00 }] },
      { id: 'tent-20x20', name: 'Tent 20x20', nameEs: 'Carpa 20x20', price: 250.00, desc: 'Perfect for intimate gatherings of up to 30 guests. Includes garden lights.', descEs: 'Perfecta para reuniones íntimas de hasta 30 invitados. Incluye luces de jardín.', image: '/tent20x2040.webp', checkoutLink: '#', addons: [{ id: 'draping-bundle', name: 'With Draping + Chandelier', nameEs: 'Con Drapeado + Candelabro', price: 400.00 }] },
      { id: 'tent-hp-20x20', name: 'High Peak 20x20', nameEs: 'High Peak 20x20', price: 550.00, desc: 'High peak premium heavy duty tent 20x20 for a stunning visual impact.', descEs: 'Carpa high peak premium heavy duty 20x20 para un impacto visual impresionante.', image: '/tent20x20.webp', checkoutLink: '#' },
      { id: 'tent-20x32', name: 'Tent 20x32', nameEs: 'Carpa 20x32', price: 350.00, desc: '70 people seated in chairs, 50 seated at tables. Fire proof. Includes garden lights.', descEs: '70 personas sentadas en sillas, 50 personas en mesas. A prueba de fuego. Incluye luces de jardín.', image: '/tent20x32.webp', checkoutLink: '#', addons: [{ id: 'draping-bundle', name: 'With Draping + Chandelier', nameEs: 'Con Drapeado + Candelabro', price: 400.00 }] },
      { id: 'tent-20x40', name: 'Tent 20x40', nameEs: 'Carpa 20x40', price: 450.00, desc: '100 people in chairs, 70 seated at tables. Fire proof. Includes garden lights.', descEs: '100 personas en sillas, 70 en mesas ubicadas. A prueba de fuego. Incluye luces de jardín.', image: '/tent20x40.webp', checkoutLink: '#', addons: [{ id: 'draping-bundle', name: 'With Draping + Chandelier', nameEs: 'Con Drapeado + Candelabro', price: 450.00 }] },
      { id: 'tent-hp-20x40', name: 'High Peak 20x40', nameEs: 'High Peak 20x40', price: 1200.00, desc: 'High peak premium heavy duty tent 20x40 for grand events and weddings.', descEs: 'Carpa high peak premium heavy duty 20x40 para grandes eventos y bodas.', image: '/tent20x40highpeak.webp', checkoutLink: '#' },
      { id: 'tent-clear-20x40', name: 'Clear Tent 20x40', nameEs: 'Carpa Transparente 20x40', price: 750.00, desc: 'Stunning transparent 20x40 tent for an elegant open-sky experience at your event.', descEs: 'Impresionante carpa transparente 20x40 para una elegante experiencia a cielo abierto en tu evento.', image: '/cleartent1.webp', checkoutLink: '#' },
      { id: 'tent-20x60', name: 'Tent 20x60', nameEs: 'Carpa 20x60', price: 700.00, desc: 'Extra large tent for big events and celebrations. Includes garden lights.', descEs: 'Carpa extra grande para grandes eventos y celebraciones. Incluye luces de jardín.', image: '/tent20x60.webp', checkoutLink: '#' },
      { id: 'tent-wc-40x40', name: 'West Coast 40x40', nameEs: 'West Coast 40x40', price: 1946.00, desc: 'Large 40x40 West Coast frame tent for up to 150 guests. Includes garden lights and water barrels.', descEs: 'Gran carpa West Coast 40x40 para hasta 150 invitados. Incluye luces de jardín y barriles de agua.', image: '/40x40wescoast.webp', checkoutLink: '#' },
    ],
  },
  {
    name: 'Others',
    nameEs: 'Otros',
    slug: 'others',
    image: '/proposal-arch.webp',
    items: [
      { id: 'dancefloor-16x16', name: 'Dance Floor 16x16', nameEs: 'Pista de Baile 16x16', price: 750.00, desc: 'Elegant 16x16 dance floor to make your event unforgettable.', descEs: 'Elegante pista de baile 16x16 para hacer tu evento inolvidable.', image: '/pista16x16.webp', checkoutLink: '#' },
      { id: 'proposal-arch-decor', name: 'Proposal Arch Decor', nameEs: 'Decoración Arco de Propuesta', price: 650.00, desc: 'Complete proposal arch decor package. Includes candles, rose arch, "Will You Marry Me?" neon sign, and cold sparklers. Plus tax and delivery.', descEs: 'Paquete completo de decoración de arco para propuesta. Incluye velas, arco de rosas, letrero de neón "¿Te casarías conmigo?", y chispas frías. Más impuestos y entrega.', image: '/proposal-arch.webp', checkoutLink: '#', addons: [{ id: 'cold-sparklers-2', name: '2 Machine Cold Sparkling', nameEs: '2 Máquinas de Chispas Frías', price: 150.00 }] },
      { id: 'dancefloor-12x12', name: 'Dance Floor 12x12', nameEs: 'Pista de Baile 12x12', price: 500.00, desc: 'Compact 12x12 dance floor, perfect for smaller venues and gatherings.', descEs: 'Pista de baile compacta 12x12, perfecta para espacios y reuniones más pequeñas.', image: '/dancefloor.webp', checkoutLink: '#' },
      { id: 'cooler', name: 'Cooler', nameEs: 'Enfriador', price: 120.00, desc: 'Hessaire 3,100 CFM 3-Speed Portable Evaporative Cooler (Swamp Cooler) for 950 sq. ft.', descEs: 'Hessaire 3,100 CFM Enfriador Evaporativo Portátil de 3 Velocidades (Swamp Cooler) para 950 pies cuadrados.', image: '/cooler.webp', checkoutLink: '#' },
      { id: 'heater', name: 'Heater', nameEs: 'Calentador', price: 65.00, desc: 'Outdoor heaters to keep your guests warm and cozy during cold weather events. 200 sq ft heating space.', descEs: 'Calentadores exteriores para mantener a tus invitados cálidos y cómodos durante eventos en clima frío. 200 pies cuadrados de espacio de calefacción.', image: '/heater.webp', checkoutLink: '#' },
      { id: 'garden-lights', name: 'Garden Lights (48 ft)', nameEs: 'Luces de Jardín (48 pies)', price: 50.00, desc: '48 feet of beautiful garden lights to illuminate your event.', descEs: '48 pies de hermosas luces de jardín para iluminar tu evento.', image: '/gardenlights.webp', checkoutLink: '#' },
      { id: 'water-barrel', name: 'Water Barrel', nameEs: 'Barril de Agua', price: 30.00, desc: 'Heavy-duty water barrel for tent anchoring and stabilization.', descEs: 'Barril de agua resistente para anclaje y estabilización de carpas.', image: '/waterbarrel.webp', checkoutLink: '#' },
      { id: 'gas-propane', name: 'Gas Propane', nameEs: 'Gas Propano', price: 20.00, desc: 'Propane gas tanks for heaters and outdoor cooking equipment.', descEs: 'Tanques de gas propano para calentadores y equipos de cocina al aire libre.', image: '/gaspropano.webp', checkoutLink: '#' },
      { id: 'plates', name: 'Plates', nameEs: 'Platos', price: 2.00, desc: 'Quality plates for your event table settings.', descEs: 'Platos de calidad para la mesa de tu evento.', image: '/plate.webp', checkoutLink: '#' },
    ],
  },
];

export const deluxePackages = [
  { id: 'pkg-deluxe-20x20', badge: 'Deluxe', price: '$789', priceNum: 789, title: 'Tent 20x20', titleEs: 'Carpa 20x20', image: '/20x20packagedelux.webp', includes: ['Draping color in stock', '1 Chandelier', '3 Rectangular Tables', '3 Tablecloths white or black', '30 Garden Chairs white', 'Garden Lights', '1 Table cake'], includesEs: ['Drapeado color en stock', '1 Candelabro', '3 Mesas Rectangulares', '3 Manteles blancos o negros', '30 Sillas de Jardín blancas', 'Luces de Jardín', '1 Mesa para pastel'], checkoutLink: '#' },
  { id: 'pkg-deluxe-20x32', badge: 'Deluxe', price: '$1,100', priceNum: 1100, title: 'Tent 20x32', titleEs: 'Carpa 20x32', image: '/tentdeluxe.webp', includes: ['Draping color in stock', '1 Chandelier', '6 Round Tables', '6 Tablecloths white or black', '48 Garden Chairs white', 'Garden Lights', '1 Table cake'], includesEs: ['Drapeado color en stock', '1 Candelabro', '6 Mesas Redondas', '6 Manteles blancos o negros', '48 Sillas de Jardín blancas', 'Luces de Jardín', '1 Mesa para pastel'], checkoutLink: '#' },
  { id: 'pkg-deluxe-20x40', badge: 'Deluxe', price: '$1,299', priceNum: 1299, title: 'Tent 20x40', titleEs: 'Carpa 20x40', image: '/20x40delux.webp', includes: ['Draping color in stock', '2 Chandeliers', '7 Rectangular Tables', '7 Tablecloths white or black', '70 Garden Chairs white', 'Garden Lights', '1 Table cake'], includesEs: ['Drapeado color en stock', '2 Candelabros', '7 Mesas Rectangulares', '7 Manteles blancos o negros', '70 Sillas de Jardín blancas', 'Luces de Jardín', '1 Mesa para pastel'], checkoutLink: '#' },
  { id: 'pkg-deluxe-20x60-premium', badge: 'Deluxe', price: '$2,119', priceNum: 2119, title: 'Tent 20x60', titleEs: 'Carpa 20x60', image: '/tent20x60deluxe.webp', includes: ['Chandeliers', 'Draping color in stock', 'Garden Lights', 'Walls', '120 Garden Chairs white', '15 Round Tables', '15 Tablecloths white or black', '1 Table cake'], includesEs: ['Candelabros', 'Drapeado color en stock', 'Luces de Jardín', 'Paredes', '120 Sillas de Jardín blancas', '15 Mesas Redondas', '15 Manteles blancos o negros', '1 Mesa para pastel'], checkoutLink: '#' },
];

export const basicPackages = [
  { id: 'pkg-basic-20x20', badge: 'Basic', price: '$399', priceNum: 399, title: 'Tent 20x20', titleEs: 'Carpa 20x20', image: '/20x20basic.webp', includes: ['3 Rectangular Tables', '3 Tablecloths white or black', '30 Garden Chairs white', 'Garden Lights', '1 Table cake'], includesEs: ['3 Mesas Rectangulares', '3 Manteles blancos o negros', '30 Sillas de Jardín blancas', 'Luces de Jardín', '1 Mesa para pastel'], checkoutLink: '#' },
  { id: 'pkg-basic-20x32', badge: 'Basic', price: '$599', priceNum: 599, title: 'Tent 20x32', titleEs: 'Carpa 20x32', image: '/basic20x32.webp', includes: ['6 Round Tables', '6 Tablecloths white or black', '48 Garden Chairs white', 'Garden Lights', '1 Table cake'], includesEs: ['6 Mesas Redondas', '6 Manteles blancos o negros', '48 Sillas de Jardín blancas', 'Luces de Jardín', '1 Mesa para pastel'], checkoutLink: '#' },
  { id: 'pkg-basic-20x40', badge: 'Basic', price: '$849', priceNum: 849, title: 'Tent 20x40', titleEs: 'Carpa 20x40', image: '/20x40packagebasic.webp', includes: ['7 Rectangular Tables', '7 Tablecloths white or black', '70 Garden Chairs white', 'Garden Lights', '1 Table cake'], includesEs: ['7 Mesas Rectangulares', '7 Manteles blancos o negros', '70 Sillas de Jardín blancas', 'Luces de Jardín', '1 Mesa para pastel'], checkoutLink: '#' },
  { id: 'pkg-basic-20x60', badge: 'Basic', price: '$1,370', priceNum: 1370, title: 'Tent 20x60', titleEs: 'Carpa 20x60', image: '/20x60delux.webp', includes: ['Garden Lights', 'Walls', '120 Garden Chairs white', '15 Round Tables', '15 Tablecloths white or black', '1 Table cake'], includesEs: ['Luces de Jardín', 'Paredes', '120 Sillas de Jardín blancas', '15 Mesas Redondas', '15 Manteles blancos o negros', '1 Mesa para pastel'], checkoutLink: '#' },
  { id: 'pkg-basic-40x40', badge: 'Basic', price: '$2,939', priceNum: 2939, title: 'Tent 40x40', titleEs: 'Carpa 40x40', image: '/40x40wescoast.webp', includes: ['150 Garden Chairs white', '19 Round Tables', '19 Tablecloths white or black', '2 Food Tables 8ft', 'Water Barrels', 'Garden Lights'], includesEs: ['150 Sillas de Jardín blancas', '19 Mesas Redondas', '19 Manteles blancos o negros', '2 Mesas de Comida 8 pies', 'Barriles de Agua', 'Luces de Jardín'], checkoutLink: '#' },
];

export const heroImages = [
  '/fondo1.webp',
  '/fondo2.webp',
  '/fondo3.webp',
  '/fondo4.webp',
];

export const googleReviews = [
  { author: 'Maria G.', rating: 5, text: 'Excellent service! They delivered everything on time and the setup was perfect for our quinceañera. Highly recommend Star Event Rental!' },
  { author: 'Carlos R.', rating: 5, text: 'We rented tables, chairs, and a tent for our family reunion. Everything was clean and in great condition. The team was very professional.' },
  { author: 'Jessica L.', rating: 5, text: 'Amazing experience from start to finish. They helped us choose the right package for our wedding and the prices were very reasonable.' },
  { author: 'Roberto M.', rating: 5, text: 'Very reliable and punctual. They set up everything before the event and picked up the next day without any issues. Will use again!' },
  { author: 'Ana S.', rating: 5, text: 'Star Event Rental made our baby shower look beautiful. The linens and chairs were elegant and the staff was so friendly. Thank you!' },
];
