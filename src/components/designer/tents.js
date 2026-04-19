export const TENTS = [
  {
    id: 'tent-20x20',
    width: 20,
    length: 20,
    variant: 'frame',
    image: '/tent20x20.webp',
    labelEn: 'Frame Tent 20×20',
    labelEs: 'Carpa 20×20',
    descEn: 'Compact frame tent, up to 32 guests',
    descEs: 'Carpa compacta, hasta 32 invitados',
  },
  {
    id: 'tent-20x32',
    width: 20,
    length: 32,
    variant: 'frame',
    image: '/tent20x32.webp',
    labelEn: 'Frame Tent 20×32',
    labelEs: 'Carpa 20×32',
    descEn: 'Mid-size frame tent, up to 50 guests',
    descEs: 'Carpa mediana, hasta 50 invitados',
  },
  {
    id: 'tent-20x40',
    width: 20,
    length: 40,
    variant: 'frame',
    image: '/tent20x40.webp',
    labelEn: 'Frame Tent 20×40',
    labelEs: 'Carpa 20×40',
    descEn: 'Our most popular size, up to 80 guests',
    descEs: 'Nuestro tamaño más popular, hasta 80 invitados',
  },
  {
    id: 'tent-20x60',
    width: 20,
    length: 60,
    variant: 'frame',
    image: '/tent20x60.webp',
    labelEn: 'Frame Tent 20×60',
    labelEs: 'Carpa 20×60',
    descEn: 'Large frame tent, up to 120 guests',
    descEs: 'Carpa grande, hasta 120 invitados',
  },
  {
    id: 'tent-clear-20x40',
    width: 20,
    length: 40,
    variant: 'clear',
    image: '/cleartent1.webp',
    labelEn: 'Clear Top 20×40',
    labelEs: 'Carpa Transparente 20×40',
    descEn: 'Transparent roof for starry-night weddings',
    descEs: 'Techo transparente para bodas bajo las estrellas',
  },
  {
    id: 'tent-hp-20x40',
    width: 20,
    length: 40,
    variant: 'high-peak',
    image: '/tent20x40highpeak.webp',
    labelEn: 'High-Peak 20×40',
    labelEs: 'Carpa High-Peak 20×40',
    descEn: 'Dramatic tall peak, premium look',
    descEs: 'Pico alto dramático, estilo premium',
  },
];

export function getTentById(id) {
  return TENTS.find((t) => t.id === id) || TENTS[2];
}

export function getSeatedCapacity(tent) {
  return Math.round((tent.width * tent.length) / 10);
}

export function resolveTent(placed) {
  const type = getTentById(placed.typeId);
  return {
    ...type,
    instanceId: placed.instanceId,
    typeId: placed.typeId,
    x: placed.x,
    z: placed.z,
    rotation: placed.rotation || 0,
  };
}

export function getNextTentPosition(existingTents, newTypeId = 'tent-20x40') {
  if (existingTents.length === 0) return { x: 0, z: 0 };
  const rightmost = existingTents.reduce((max, t) => (t.x > max.x ? t : max), existingTents[0]);
  const rightmostType = getTentById(rightmost.typeId);
  const newType = getTentById(newTypeId);
  const gap = 10;
  return {
    x: rightmost.x + rightmostType.width / 2 + newType.width / 2 + gap,
    z: rightmost.z,
  };
}
