'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

// Shared bulb resources — every bulb (~30+ per tent) reuses these.
const G_BULB = new THREE.SphereGeometry(0.15, 10, 10);
const G_SOCKET = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8);

const M_BULB = new THREE.MeshStandardMaterial({
  color: '#fff6c8',
  emissive: '#ffd66b',
  emissiveIntensity: 3.2,
  toneMapped: false,
});
const M_SOCKET = new THREE.MeshStandardMaterial({
  color: '#1a1a1a',
  metalness: 0.3,
  roughness: 0.6,
});

function Bulb({ position }) {
  return (
    <group position={position}>
      <mesh geometry={G_BULB} material={M_BULB} />
      <mesh position={[0, 0.15, 0]} geometry={G_SOCKET} material={M_SOCKET} />
    </group>
  );
}

const EAVE_HEIGHT = 8;
const EDGE_DROP = 0.4;
const SAG = 0.35;

function EdgeStrand({ x, length, count }) {
  const bulbs = useMemo(() => {
    const actualSpacing = length / count;
    const start = -length / 2 + actualSpacing / 2;
    const baseY = EAVE_HEIGHT - EDGE_DROP;
    const list = [];
    for (let i = 0; i < count; i++) {
      const z = start + i * actualSpacing;
      const t = count > 1 ? i / (count - 1) : 0.5;
      const sag = Math.sin(t * Math.PI) * SAG;
      list.push({ key: `bulb-${x}-${i}`, position: [x, baseY - sag, z] });
    }
    return list;
  }, [x, length, count]);

  return (
    <>
      {bulbs.map((b) => (
        <Bulb key={b.key} position={b.position} />
      ))}
    </>
  );
}

export default function StringLights({ width = 20, length, enabled }) {
  if (!enabled) return null;

  const spacing = 2;
  const count = Math.max(2, Math.floor(length / spacing));
  const halfW = width / 2;
  const innerHeight = EAVE_HEIGHT - 1;

  // Number of fill pointLights scales with tent length so long tents stay evenly lit.
  const fillCount = Math.max(2, Math.round(length / 15));
  const fillPositions = useMemo(() => {
    const list = [];
    const step = length / fillCount;
    for (let i = 0; i < fillCount; i++) {
      const z = -length / 2 + step / 2 + i * step;
      list.push(z);
    }
    return list;
  }, [length, fillCount]);

  return (
    <group>
      <EdgeStrand x={-halfW} length={length} count={count} />
      <EdgeStrand x={halfW} length={length} count={count} />

      {/* Warm fill lights along the ridge — carry the glow down to tables/chairs */}
      {fillPositions.map((z, i) => (
        <pointLight
          key={`fill-${i}`}
          position={[0, innerHeight, z]}
          intensity={2.2}
          distance={20}
          decay={1.6}
          color="#ffd89a"
        />
      ))}

      {/* Extra perimeter glow right at the bulb lines */}
      <pointLight position={[-halfW, innerHeight + 0.5, 0]} intensity={1.2} distance={14} decay={1.8} color="#ffd89a" />
      <pointLight position={[halfW, innerHeight + 0.5, 0]} intensity={1.2} distance={14} decay={1.8} color="#ffd89a" />
    </group>
  );
}
