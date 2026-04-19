'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Instances, Instance } from '@react-three/drei';

const ROSE_COLORS = [
  '#c82f48',
  '#d84a5f',
  '#a8243a',
  '#e8a0b5',
  '#f5cfd8',
  '#ffffff',
  '#b82e4a',
  '#ee8ea4',
];

const LEAF_COLORS = ['#3e6a3e', '#4a7a4a', '#305a30'];

// Shared geometries (module-level)
const G_FOOT = new THREE.CylinderGeometry(0.5, 0.55, 0.16, 20);
const G_POST = new THREE.CylinderGeometry(0.07, 0.07, 8.4, 14);
const G_FINIAL = new THREE.SphereGeometry(0.12, 14, 14);
const G_ROD = new THREE.CylinderGeometry(0.015, 0.015, 2.2, 6);
const G_FLOWER = new THREE.SphereGeometry(1, 10, 10); // unit sphere, scale per-instance

// Shared materials
const M_FOOT = new THREE.MeshStandardMaterial({ color: '#1e1e1e', metalness: 0.5, roughness: 0.4 });
const M_POST = new THREE.MeshStandardMaterial({ color: '#c9a84c', metalness: 0.75, roughness: 0.3 });
const M_FINIAL = new THREE.MeshStandardMaterial({ color: '#c9a84c', metalness: 0.8, roughness: 0.25 });
const M_ROD = new THREE.MeshStandardMaterial({ color: '#1e1e1e', roughness: 0.9 });
const M_PETAL = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.75, metalness: 0 });
const M_LEAF = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, metalness: 0 });

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function heartXY(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return { x, y };
}

const HEART_SCALE = 0.22;
const HEART_CENTER_Y = 5.2;

function buildFlowers() {
  const rand = seededRandom(73);
  const petals = [];
  const leaves = [];

  const mainCount = 140;
  for (let i = 0; i < mainCount; i++) {
    const t = (i / mainCount) * Math.PI * 2;
    const jitterT = (rand() - 0.5) * 0.08;
    const { x: jx, y: jy } = heartXY(t + jitterT);
    const offX = (rand() - 0.5) * 0.18;
    const offY = (rand() - 0.5) * 0.18;
    const offZ = (rand() - 0.5) * 0.55;
    const color = ROSE_COLORS[Math.floor(rand() * ROSE_COLORS.length)];
    petals.push({
      key: `rim-${i}`,
      x: jx * HEART_SCALE + offX,
      y: jy * HEART_SCALE + HEART_CENTER_Y + offY,
      z: offZ,
      color,
      size: 0.16 + rand() * 0.11,
    });
  }

  const innerCount = 80;
  for (let i = 0; i < innerCount; i++) {
    const t = (i / innerCount) * Math.PI * 2;
    const { x: hx, y: hy } = heartXY(t);
    const shrink = 0.82 + rand() * 0.08;
    const color = ROSE_COLORS[Math.floor(rand() * ROSE_COLORS.length)];
    petals.push({
      key: `inner-${i}`,
      x: hx * HEART_SCALE * shrink + (rand() - 0.5) * 0.22,
      y: hy * HEART_SCALE * shrink + HEART_CENTER_Y + (rand() - 0.5) * 0.22,
      z: (rand() - 0.5) * 0.5 - 0.15,
      color,
      size: 0.13 + rand() * 0.09,
    });
  }

  const leafCount = 35;
  for (let i = 0; i < leafCount; i++) {
    const t = rand() * Math.PI * 2;
    const { x: hx, y: hy } = heartXY(t);
    const offX = (rand() - 0.5) * 0.5;
    const offY = (rand() - 0.5) * 0.5;
    leaves.push({
      key: `leaf-${i}`,
      x: hx * HEART_SCALE + offX,
      y: hy * HEART_SCALE + HEART_CENTER_Y + offY,
      z: (rand() - 0.5) * 0.55 - 0.05,
      color: LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)],
      size: 0.12 + rand() * 0.06,
    });
  }

  const accentCount = 45;
  for (let i = 0; i < accentCount; i++) {
    const t = rand() * Math.PI * 2;
    const { x: hx, y: hy } = heartXY(t);
    petals.push({
      key: `accent-${i}`,
      x: hx * HEART_SCALE + (rand() - 0.5) * 0.3,
      y: hy * HEART_SCALE + HEART_CENTER_Y + (rand() - 0.5) * 0.3,
      z: 0.25 + rand() * 0.25,
      color: ROSE_COLORS[Math.floor(rand() * ROSE_COLORS.length)],
      size: 0.11 + rand() * 0.08,
    });
  }

  return { petals, leaves };
}

const TOP_Y = 13 * HEART_SCALE + HEART_CENTER_Y;

export function ProposalArch() {
  const { petals, leaves } = useMemo(() => buildFlowers(), []);

  return (
    <group>
      {/* Arch structure */}
      <mesh position={[-3.4, 0.08, 0]} geometry={G_FOOT} material={M_FOOT} castShadow />
      <mesh position={[3.4, 0.08, 0]} geometry={G_FOOT} material={M_FOOT} castShadow />
      <mesh position={[-3.4, 4.2, 0]} geometry={G_POST} material={M_POST} castShadow />
      <mesh position={[3.4, 4.2, 0]} geometry={G_POST} material={M_POST} castShadow />
      <mesh position={[-3.4, 8.45, 0]} geometry={G_FINIAL} material={M_FINIAL} castShadow />
      <mesh position={[3.4, 8.45, 0]} geometry={G_FINIAL} material={M_FINIAL} castShadow />
      <mesh position={[-2.35, TOP_Y - 0.2, 0]} rotation={[0, 0, -Math.PI / 8]} geometry={G_ROD} material={M_ROD} />
      <mesh position={[2.35, TOP_Y - 0.2, 0]} rotation={[0, 0, Math.PI / 8]} geometry={G_ROD} material={M_ROD} />

      {/* Flower instances — all share one sphere geometry + one material per group */}
      <Instances geometry={G_FLOWER} material={M_PETAL} limit={petals.length}>
        {petals.map((f) => (
          <Instance
            key={f.key}
            position={[f.x, f.y, f.z]}
            scale={f.size}
            color={f.color}
          />
        ))}
      </Instances>

      <Instances geometry={G_FLOWER} material={M_LEAF} limit={leaves.length}>
        {leaves.map((f) => (
          <Instance
            key={f.key}
            position={[f.x, f.y, f.z]}
            scale={f.size}
            color={f.color}
          />
        ))}
      </Instances>
    </group>
  );
}
