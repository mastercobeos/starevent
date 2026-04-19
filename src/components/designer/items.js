export const CATALOG = [
  {
    id: 'round-table-60',
    type: 'round-table',
    category: 'tables',
    nameEn: 'Round Table 60"',
    nameEs: 'Mesa Redonda 60"',
    footprintR: 2.5,
    capacity: 8,
  },
  {
    id: 'rect-table-6ft',
    type: 'rect-table',
    category: 'tables',
    nameEn: 'Rectangular Table 6ft',
    nameEs: 'Mesa Rectangular 6ft',
    footprintW: 6,
    footprintD: 2.5,
    capacity: 6,
  },
  {
    id: 'rect-table-8ft',
    type: 'rect-table-8ft',
    category: 'tables',
    nameEn: 'Rectangular Table 8ft',
    nameEs: 'Mesa Rectangular 8ft',
    footprintW: 8,
    footprintD: 2.5,
    capacity: 8,
  },
  {
    id: 'cocktail-table',
    type: 'cocktail-table',
    category: 'tables',
    nameEn: 'Cocktail Table',
    nameEs: 'Mesa Cocktail',
    footprintR: 1.3,
    capacity: 4,
  },
  {
    id: 'chiavari',
    type: 'chiavari',
    category: 'chairs',
    nameEn: 'Chiavari Chair',
    nameEs: 'Silla Chiavari',
    footprintR: 0.9,
  },
  {
    id: 'kid-chiavari',
    type: 'kid-chiavari',
    category: 'chairs',
    nameEn: 'Kid Chiavari Chair',
    nameEs: 'Silla Chiavari Niños',
    footprintR: 0.65,
  },
  {
    id: 'wooden-chair',
    type: 'wooden',
    category: 'chairs',
    nameEn: 'Wooden Chair',
    nameEs: 'Silla de Madera',
    footprintR: 0.9,
  },
  {
    id: 'garden-chair',
    type: 'garden',
    category: 'chairs',
    nameEn: 'Garden Chair',
    nameEs: 'Silla Garden',
    footprintR: 0.9,
  },
  {
    id: 'resin-chair',
    type: 'resin',
    category: 'chairs',
    nameEn: 'White Resin Chair',
    nameEs: 'Silla Resina Blanca',
    footprintR: 0.9,
  },
  {
    id: 'dance-floor-12',
    type: 'dance-floor',
    category: 'others',
    nameEn: 'Dance Floor 12×12',
    nameEs: 'Pista de Baile 12×12',
    footprintW: 12,
    footprintD: 12,
    unique: true,
  },
  {
    id: 'dance-floor-16',
    type: 'dance-floor-16',
    category: 'others',
    nameEn: 'Dance Floor 16×16',
    nameEs: 'Pista de Baile 16×16',
    footprintW: 16,
    footprintD: 16,
    unique: true,
  },
  {
    id: 'proposal-arch',
    type: 'proposal-arch',
    category: 'others',
    nameEn: 'Proposal Arch',
    nameEs: 'Arco de Propuesta',
    footprintR: 3.3,
  },
  {
    id: 'cooler',
    type: 'cooler',
    category: 'others',
    nameEn: 'Cooler',
    nameEs: 'Enfriador',
    footprintR: 1.1,
  },
  {
    id: 'heater',
    type: 'heater',
    category: 'others',
    nameEn: 'Patio Heater',
    nameEs: 'Calentador',
    footprintR: 1.6,
  },
  {
    id: 'water-barrel',
    type: 'water-barrel',
    category: 'others',
    nameEn: 'Water Barrel',
    nameEs: 'Barril de Agua',
    footprintR: 1.2,
  },
  {
    id: 'propane-tank',
    type: 'propane-tank',
    category: 'others',
    nameEn: 'Propane Tank',
    nameEs: 'Tanque de Propano',
    footprintR: 0.55,
  },
];

export function getCatalogItem(type) {
  return CATALOG.find((c) => c.type === type);
}

export function getItemHalfBounds(type) {
  switch (type) {
    case 'round-table': return { w: 2.7, d: 2.7 };
    case 'rect-table': return { w: 3.1, d: 1.35 };
    case 'rect-table-8ft': return { w: 4.1, d: 1.35 };
    case 'cocktail-table': return { w: 1.55, d: 1.55 };
    case 'chiavari':
    case 'garden':
    case 'resin':
    case 'wooden': return { w: 0.7, d: 0.7 };
    case 'kid-chiavari': return { w: 0.5, d: 0.5 };
    case 'dance-floor': return { w: 6.15, d: 6.15 };
    case 'dance-floor-16': return { w: 8.15, d: 8.15 };
    case 'proposal-arch': return { w: 3.3, d: 0.6 };
    case 'cooler': return { w: 1.1, d: 1.1 };
    case 'heater': return { w: 1.6, d: 1.6 };
    case 'water-barrel': return { w: 1.2, d: 1.2 };
    case 'propane-tank': return { w: 0.55, d: 0.55 };
    default: return { w: 0.5, d: 0.5 };
  }
}

export const SCENE_HALF_BOUND = 150;

export function clampItemsToScene(items) {
  return items.map((it) => {
    const { w, d } = getItemHalfBounds(it.type);
    const maxR = Math.max(w, d);
    return {
      ...it,
      x: Math.max(-SCENE_HALF_BOUND + maxR, Math.min(SCENE_HALF_BOUND - maxR, it.x)),
      z: Math.max(-SCENE_HALF_BOUND + maxR, Math.min(SCENE_HALF_BOUND - maxR, it.z)),
    };
  });
}

export function clampItemsToTent(items, tent) {
  return clampItemsToScene(items);
}

export function getSelectionRingRadii(type) {
  switch (type) {
    case 'round-table': return { inner: 2.85, outer: 3.05 };
    case 'rect-table': return { inner: 3.4, outer: 3.6 };
    case 'rect-table-8ft': return { inner: 4.4, outer: 4.6 };
    case 'cocktail-table': return { inner: 1.7, outer: 1.85 };
    case 'chiavari':
    case 'garden':
    case 'resin':
    case 'wooden': return { inner: 1.0, outer: 1.15 };
    case 'kid-chiavari': return { inner: 0.8, outer: 0.93 };
    case 'dance-floor': return { inner: 8.8, outer: 9.0 };
    case 'dance-floor-16': return { inner: 11.6, outer: 11.85 };
    case 'proposal-arch': return { inner: 3.45, outer: 3.65 };
    case 'cooler': return { inner: 1.55, outer: 1.7 };
    case 'heater': return { inner: 2.25, outer: 2.45 };
    case 'water-barrel': return { inner: 1.75, outer: 1.9 };
    case 'propane-tank': return { inner: 0.8, outer: 0.95 };
    default: return { inner: 1.0, outer: 1.15 };
  }
}

export function getSpawnPosition(items, tent, type) {
  const anchorX = tent.x || 0;
  const anchorZ = tent.z || 0;
  const sameType = items.filter((it) => it.type === type);
  const count = sameType.length;
  const tentHalfW = tent.width / 2 - 1.5;
  const tentHalfL = tent.length / 2 - 1.5;

  if (type === 'dance-floor' || type === 'dance-floor-16') {
    return { x: anchorX, z: anchorZ };
  }

  if (type === 'proposal-arch') {
    return { x: anchorX, z: anchorZ - tentHalfL + 2 };
  }

  if (type === 'heater' || type === 'cooler') {
    const corners = [
      [-tentHalfW + 0.5, -tentHalfL + 0.5],
      [tentHalfW - 0.5, -tentHalfL + 0.5],
      [-tentHalfW + 0.5, tentHalfL - 0.5],
      [tentHalfW - 0.5, tentHalfL - 0.5],
    ];
    return { x: anchorX + corners[count % 4][0], z: anchorZ + corners[count % 4][1] };
  }

  if (type === 'water-barrel' || type === 'propane-tank') {
    const slots = [
      [-tentHalfW, -tentHalfL + 3],
      [-tentHalfW, 0],
      [-tentHalfW, tentHalfL - 3],
      [tentHalfW, -tentHalfL + 3],
      [tentHalfW, 0],
      [tentHalfW, tentHalfL - 3],
    ];
    return { x: anchorX + slots[count % 6][0], z: anchorZ + slots[count % 6][1] };
  }

  if (type === 'round-table' || type === 'cocktail-table') {
    const perRow = Math.max(1, Math.floor(tentHalfW / 3));
    const row = Math.floor(count / perRow);
    const col = count % perRow;
    const x = (col - (perRow - 1) / 2) * 6;
    const z = (row - 1) * 7 - tentHalfL + 4;
    return { x: anchorX + x, z: anchorZ + z };
  }

  if (type === 'rect-table' || type === 'rect-table-8ft') {
    const row = count;
    return { x: anchorX - tentHalfW + 4, z: anchorZ + (row - 2) * 4 };
  }

  const gridSize = 8;
  const row = Math.floor(count / gridSize);
  const col = count % gridSize;
  const x = (col - (gridSize - 1) / 2) * 2;
  const z = -tentHalfL + 2 + row * 2.5;
  return { x: anchorX + x, z: anchorZ + z };
}
