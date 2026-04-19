'use client';

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Shared materials — instantiated once per module load, reused across every
// mesh. React Three Fiber will treat these as stable references so three.js
// can batch identical material/geometry pairs during rendering.
// ---------------------------------------------------------------------------

const mat = (opts) => new THREE.MeshStandardMaterial(opts);

export const M = {
  gold: mat({ color: '#c9a84c', metalness: 0.5, roughness: 0.35 }),
  goldBright: mat({ color: '#c9a84c', metalness: 0.55, roughness: 0.35 }),
  cloth: mat({ color: '#fafafa', roughness: 0.88, metalness: 0 }),
  clothDouble: mat({ color: '#fafafa', roughness: 0.88, side: THREE.DoubleSide, metalness: 0 }),
  chairFrame: mat({ color: '#e8e8ea', metalness: 0.05, roughness: 0.55 }),
  chairPad: mat({ color: '#f4efe6', roughness: 0.85, metalness: 0 }),
  resin: mat({ color: '#f2f2f4', metalness: 0.02, roughness: 0.6 }),
  resinSeat: mat({ color: '#f2f2f4', roughness: 0.55, metalness: 0 }),
  wood: mat({ color: '#8a5e3a', roughness: 0.75, metalness: 0 }),
  woodDark: mat({ color: '#6a4020', roughness: 0.7, metalness: 0 }),
  woodTop: mat({ color: '#5a3f2a', roughness: 0.55, metalness: 0 }),
  woodTopDark: mat({ color: '#4a321f', roughness: 0.5 }),
  plasticTop: mat({ color: '#e8e8e8', roughness: 0.6, metalness: 0.05 }),
  metalLeg: mat({ color: '#b8b8bc', metalness: 0.8, roughness: 0.35 }),
  metalLegMid: mat({ color: '#b8b8bc', metalness: 0.85, roughness: 0.3 }),
  metalLegDark: mat({ color: '#b8b8bc', metalness: 0.75, roughness: 0.4 }),
  darkPole: mat({ color: '#2a2a2a', metalness: 0.55, roughness: 0.4 }),
  darkBase: mat({ color: '#1a1a1a', metalness: 0.5, roughness: 0.55 }),
  darkFoot: mat({ color: '#1e1e1e', metalness: 0.5, roughness: 0.4 }),
  darkCocktail: mat({ color: '#2a2a2a', metalness: 0.35, roughness: 0.55 }),
  darkCocktailBase: mat({ color: '#3a3a3a', metalness: 0.5, roughness: 0.5 }),
};

// ---------------------------------------------------------------------------
// Shared geometries — reused for identical shapes across many instances.
// ---------------------------------------------------------------------------

// Chiavari chair geometries
export const G_CHIAVARI_LEG = new THREE.CylinderGeometry(0.06, 0.051, 1.5, 10);
export const G_CHIAVARI_SEAT = new THREE.BoxGeometry(1.25, 0.1, 1.25);
export const G_CHIAVARI_BACK_POST = new THREE.CylinderGeometry(0.05, 0.05, 2.1, 10);
export const G_CHIAVARI_RUNG = new THREE.BoxGeometry(1.1, 0.09, 0.06);
export const G_CHIAVARI_TOP = new THREE.BoxGeometry(1.25, 0.12, 0.12);

// Garden chair
export const G_GARDEN_LEG = new THREE.CylinderGeometry(0.055, 0.04675, 1.5, 10);
export const G_GARDEN_SEAT = new THREE.BoxGeometry(1.2, 0.18, 1.2);
export const G_GARDEN_BACK = new THREE.BoxGeometry(1.2, 1.8, 0.12);

// Resin chair
export const G_RESIN_LEG = new THREE.CylinderGeometry(0.04, 0.034, 1.5, 10);
export const G_RESIN_SEAT = new THREE.BoxGeometry(1.15, 0.08, 1.15);
export const G_RESIN_BACK = new THREE.BoxGeometry(1.1, 1.7, 0.06);

// Wooden chair
export const G_WOOD_LEG = new THREE.BoxGeometry(0.1, 1.5, 0.1);
export const G_WOOD_SEAT = new THREE.BoxGeometry(1.28, 0.12, 1.28);
export const G_WOOD_POST = new THREE.BoxGeometry(0.1, 2.05, 0.1);
export const G_WOOD_RUNG = new THREE.BoxGeometry(1.1, 0.14, 0.04);
export const G_WOOD_TOP = new THREE.BoxGeometry(1.3, 0.16, 0.14);

// Common leg positions for chairs
export const CHAIR_LEG_OFFSETS = [
  [-0.55, -0.55],
  [0.55, -0.55],
  [-0.55, 0.55],
  [0.55, 0.55],
];
