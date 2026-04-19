'use client';

import * as THREE from 'three';
import { M } from './shared';

// Round table (fixed size) — share geometries across all instances
const G_ROUND_TOP = new THREE.CylinderGeometry(2.5, 2.5, 0.12, 40);
const G_ROUND_TOP_BAND = new THREE.CylinderGeometry(2.45, 2.45, 0.02, 40);
const G_ROUND_POLE = new THREE.CylinderGeometry(0.2, 0.2, 2.4, 14);
const G_ROUND_BASE = new THREE.CylinderGeometry(1.3, 1.5, 0.18, 22);

const G_ROUND_CLOTH_TOP = new THREE.CylinderGeometry(2.5, 2.5, 0.1, 40);
const G_ROUND_CLOTH_SKIRT = new THREE.CylinderGeometry(2.5, 2.7, 2.5 - 0.1, 40, 1, true);
const G_ROUND_CLOTH_DRAPE = new THREE.CylinderGeometry(2.7, 2.7, 0.02, 40);

// Cocktail table
const G_COCKTAIL_TOP = new THREE.CylinderGeometry(1.25, 1.25, 0.08, 32);
const G_COCKTAIL_POLE = new THREE.CylinderGeometry(0.09, 0.09, 3.5, 14);
const G_COCKTAIL_BASE = new THREE.CylinderGeometry(0.85, 0.95, 0.16, 20);
const G_COCKTAIL_CLOTH_TOP = new THREE.CylinderGeometry(1.28, 1.28, 0.1, 32);
const G_COCKTAIL_CLOTH_SKIRT = new THREE.CylinderGeometry(1.28, 1.5, 3.5 - 0.1, 32, 1, true);
const G_COCKTAIL_CLOTH_DRAPE = new THREE.CylinderGeometry(1.5, 1.5, 0.02, 32);

// Rectangular tables — only two fixed sizes (6 and 8 ft), so cache one
// set of geometries per dimension at module load. All rect-table instances
// at the same size share the same GPU buffers.
const RECT_LEG_H = 2.42;
const RECT_LEG_R = 0.06;
const RECT_SHARED_LEG = new THREE.CylinderGeometry(RECT_LEG_R, RECT_LEG_R, RECT_LEG_H, 10);

function makeRectGeoms(width, depth) {
  return {
    top: new THREE.BoxGeometry(width, 0.08, depth),
    leg: RECT_SHARED_LEG,
    brace: new THREE.BoxGeometry(width - 0.8, 0.08, 0.08),
    clothTop: new THREE.BoxGeometry(width, 0.08, depth),
    clothSkirt: new THREE.BoxGeometry(width + 0.1, 2.5 - 0.08, depth + 0.1),
    clothDrape: new THREE.BoxGeometry(width + 0.15, 0.05, depth + 0.15),
  };
}

const RECT_GEOMS = {
  '6x2.5': makeRectGeoms(6, 2.5),
  '8x2.5': makeRectGeoms(8, 2.5),
};

function getRectGeoms(width, depth) {
  const key = `${width}x${depth}`;
  if (!RECT_GEOMS[key]) RECT_GEOMS[key] = makeRectGeoms(width, depth);
  return RECT_GEOMS[key];
}

function RoundTableBare() {
  return (
    <group>
      <mesh position={[0, 2.5, 0]} geometry={G_ROUND_TOP} material={M.woodTop} castShadow receiveShadow />
      <mesh position={[0, 2.4, 0]} geometry={G_ROUND_TOP_BAND} material={M.woodTopDark} receiveShadow />
      <mesh position={[0, 1.22, 0]} geometry={G_ROUND_POLE} material={M.darkPole} castShadow />
      <mesh position={[0, 0.1, 0]} geometry={G_ROUND_BASE} material={M.darkBase} castShadow />
    </group>
  );
}

function RoundTableCloth() {
  return (
    <group>
      <mesh position={[0, 2.5 - 0.05, 0]} geometry={G_ROUND_CLOTH_TOP} material={M.cloth} castShadow receiveShadow />
      <mesh position={[0, (2.5 - 0.1) / 2, 0]} geometry={G_ROUND_CLOTH_SKIRT} material={M.clothDouble} castShadow receiveShadow />
      <mesh position={[0, 0.08, 0]} geometry={G_ROUND_CLOTH_DRAPE} material={M.cloth} receiveShadow />
    </group>
  );
}

export function RoundTable({ tableclothed = false }) {
  return tableclothed ? <RoundTableCloth /> : <RoundTableBare />;
}

function RectTableBare({ width, depth }) {
  const g = getRectGeoms(width, depth);
  const offX = width / 2 - 0.35;
  const offZ = depth / 2 - 0.3;

  return (
    <group>
      <mesh position={[0, 2.5 - 0.04, 0]} geometry={g.top} material={M.plasticTop} castShadow receiveShadow />
      {[
        [-offX, -offZ], [offX, -offZ], [-offX, offZ], [offX, offZ],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, RECT_LEG_H / 2, z]} geometry={g.leg} material={M.metalLeg} castShadow />
      ))}
      <mesh position={[0, 0.6, 0]} geometry={g.brace} material={M.metalLegDark} castShadow />
    </group>
  );
}

function RectTableCloth({ width, depth }) {
  const g = getRectGeoms(width, depth);
  return (
    <group>
      <mesh position={[0, 2.5 - 0.04, 0]} geometry={g.clothTop} material={M.cloth} castShadow receiveShadow />
      <mesh position={[0, (2.5 - 0.08) / 2, 0]} geometry={g.clothSkirt} material={M.cloth} castShadow receiveShadow />
      <mesh position={[0, 0.025, 0]} geometry={g.clothDrape} material={M.cloth} receiveShadow />
    </group>
  );
}

export function RectTable({ tableclothed = false }) {
  return tableclothed
    ? <RectTableCloth width={6} depth={2.5} />
    : <RectTableBare width={6} depth={2.5} />;
}

export function RectTable8ft({ tableclothed = false }) {
  return tableclothed
    ? <RectTableCloth width={8} depth={2.5} />
    : <RectTableBare width={8} depth={2.5} />;
}

function CocktailBare() {
  return (
    <group>
      <mesh position={[0, 3.5, 0]} geometry={G_COCKTAIL_TOP} material={M.darkCocktail} castShadow receiveShadow />
      <mesh position={[0, 1.75, 0]} geometry={G_COCKTAIL_POLE} material={M.metalLegMid} castShadow />
      <mesh position={[0, 0.1, 0]} geometry={G_COCKTAIL_BASE} material={M.darkCocktailBase} castShadow />
    </group>
  );
}

function CocktailCloth() {
  return (
    <group>
      <mesh position={[0, 3.5 - 0.05, 0]} geometry={G_COCKTAIL_CLOTH_TOP} material={M.cloth} castShadow receiveShadow />
      <mesh position={[0, (3.5 - 0.1) / 2, 0]} geometry={G_COCKTAIL_CLOTH_SKIRT} material={M.clothDouble} castShadow receiveShadow />
      <mesh position={[0, 0.06, 0]} geometry={G_COCKTAIL_CLOTH_DRAPE} material={M.cloth} receiveShadow />
    </group>
  );
}

export function CocktailTable({ tableclothed = false }) {
  return tableclothed ? <CocktailCloth /> : <CocktailBare />;
}
