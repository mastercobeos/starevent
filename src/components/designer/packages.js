function genId(type, i) {
  return `${type}-${Date.now().toString(36)}-${i}`;
}

function placeChairsAroundRound(tx, tz, count, radius, chairType) {
  const chairs = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    chairs.push({
      type: chairType,
      x: tx + Math.cos(angle) * radius,
      z: tz + Math.sin(angle) * radius,
      rotation: angle + Math.PI / 2,
    });
  }
  return chairs;
}

function placeChairsAlongRect(tx, tz, sideOffset, chairType) {
  const zOffsets = [-2.25, -0.75, 0.75, 2.25];
  const chairs = [];
  for (const zo of zOffsets) {
    chairs.push({ type: chairType, x: tx - sideOffset, z: tz + zo, rotation: Math.PI / 2 });
    chairs.push({ type: chairType, x: tx + sideOffset, z: tz + zo, rotation: -Math.PI / 2 });
  }
  return chairs;
}

function buildItems(raw) {
  let counter = 0;
  return raw.map((it) => ({
    id: genId(it.type, counter++),
    type: it.type,
    x: it.x,
    z: it.z,
    rotation: it.rotation || 0,
    tableclothed: it.tableclothed || false,
  }));
}

export function applyRoundReception() {
  const raw = [];
  const cols = [-6, 0, 6];
  const rows = [-10, 10];
  for (const tz of rows) {
    for (const tx of cols) {
      raw.push({ type: 'round-table', x: tx, z: tz, tableclothed: true });
      raw.push(...placeChairsAroundRound(tx, tz, 8, 3.4, 'resin'));
    }
  }
  return buildItems(raw);
}

export function applyBanquetDeluxe() {
  const raw = [];
  const tableZs = [-15, -9, -3, 3, 9, 15];
  for (const tz of tableZs) {
    raw.push({ type: 'rect-table', x: 0, z: tz, rotation: Math.PI / 2, tableclothed: true });
    raw.push(...placeChairsAlongRect(0, tz, 2.3, 'chiavari'));
  }
  return buildItems(raw);
}

export function applyDanceParty() {
  const raw = [];
  raw.push({ type: 'dance-floor', x: 0, z: 0 });
  const corners = [
    [-6, -13], [6, -13], [-6, 13], [6, 13],
  ];
  for (const [tx, tz] of corners) {
    raw.push({ type: 'round-table', x: tx, z: tz, tableclothed: true });
    raw.push(...placeChairsAroundRound(tx, tz, 8, 3.4, 'chiavari'));
  }
  return buildItems(raw);
}

export const PACKAGES = [
  {
    id: 'pkg-round-reception',
    nameEn: 'Round Reception',
    nameEs: 'Recepción Clásica',
    descEn: '6 round tables · 48 resin chairs',
    descEs: '6 mesas redondas · 48 sillas resina',
    image: '/tentdeluxe.webp',
    apply: applyRoundReception,
  },
  {
    id: 'pkg-banquet-deluxe',
    nameEn: 'Banquet Deluxe',
    nameEs: 'Banquete Deluxe',
    descEn: '6 rectangular tables · 48 Chiavari chairs',
    descEs: '6 mesas rectangulares · 48 sillas Chiavari',
    image: '/tent20x40.webp',
    apply: applyBanquetDeluxe,
  },
  {
    id: 'pkg-dance-party',
    nameEn: 'Dance Party',
    nameEs: 'Fiesta con Pista',
    descEn: '4 round tables · 32 Chiavari · dance floor',
    descEs: '4 mesas redondas · 32 Chiavari · pista de baile',
    image: '/tent20x2040.webp',
    apply: applyDanceParty,
  },
];
