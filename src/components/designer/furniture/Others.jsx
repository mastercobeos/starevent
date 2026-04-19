'use client';

import * as THREE from 'three';

// Shared materials for "Others" props
const M_COOLER_BODY = new THREE.MeshStandardMaterial({ color: '#627a93', roughness: 0.55, metalness: 0.25 });
const M_COOLER_LID = new THREE.MeshStandardMaterial({ color: '#3a4a5a', roughness: 0.5, metalness: 0.3 });
const M_COOLER_PANEL = new THREE.MeshStandardMaterial({ color: '#20303c', roughness: 0.9 });
const M_COOLER_SLOT = new THREE.MeshStandardMaterial({ color: '#0a1014', roughness: 1 });
const M_COOLER_WHEEL = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.75, metalness: 0.2 });
const M_COOLER_HANDLE = new THREE.MeshStandardMaterial({ color: '#2a3a4a', roughness: 0.7, metalness: 0.3 });

const M_HEATER_BASE = new THREE.MeshStandardMaterial({ color: '#3f3f44', metalness: 0.7, roughness: 0.45 });
const M_HEATER_POLE = new THREE.MeshStandardMaterial({ color: '#b8b8bc', metalness: 0.85, roughness: 0.3 });
const M_HEATER_HEAD = new THREE.MeshStandardMaterial({ color: '#5a5a5e', metalness: 0.75, roughness: 0.45 });
const M_HEATER_REFLECTOR = new THREE.MeshStandardMaterial({ color: '#cbcbcf', metalness: 0.85, roughness: 0.3, side: THREE.DoubleSide });
const M_HEATER_CAP = new THREE.MeshStandardMaterial({ color: '#4a4a4e', metalness: 0.7, roughness: 0.4 });
const M_HEATER_FLAME = new THREE.MeshStandardMaterial({ color: '#ff8a3b', emissive: '#ff6215', emissiveIntensity: 1.5, toneMapped: false });

const M_BARREL_BODY = new THREE.MeshStandardMaterial({ color: '#2e6aa3', roughness: 0.5, metalness: 0.15 });
const M_BARREL_RIM = new THREE.MeshStandardMaterial({ color: '#1d4f80', roughness: 0.55, metalness: 0.2 });
const M_BARREL_SPOUT = new THREE.MeshStandardMaterial({ color: '#1a1a1a', metalness: 0.4, roughness: 0.6 });
const M_BARREL_BAND = new THREE.MeshStandardMaterial({ color: '#1d4f80', roughness: 0.7, side: THREE.DoubleSide });

const M_TANK_BODY = new THREE.MeshStandardMaterial({ color: '#bcbcc0', metalness: 0.55, roughness: 0.4 });
const M_TANK_RING_BASE = new THREE.MeshStandardMaterial({ color: '#5a5a5e', metalness: 0.5, roughness: 0.5 });
const M_TANK_RING_TOP = new THREE.MeshStandardMaterial({ color: '#4a4a4e', metalness: 0.6, roughness: 0.4 });
const M_TANK_VALVE = new THREE.MeshStandardMaterial({ color: '#a83a2a', metalness: 0.3, roughness: 0.55 });
const M_TANK_STRAP = new THREE.MeshStandardMaterial({ color: '#2d2d30', roughness: 0.8, side: THREE.DoubleSide });

// Shared geometries
const G_COOLER_BODY = new THREE.BoxGeometry(1.9, 3.0, 1.9);
const G_COOLER_LID = new THREE.BoxGeometry(2.0, 0.12, 2.0);
const G_COOLER_PANEL = new THREE.BoxGeometry(1.35, 2.0, 0.06);
const G_COOLER_SLOT = new THREE.BoxGeometry(1.3, 0.06, 0.02);
const G_COOLER_WHEEL = new THREE.CylinderGeometry(0.18, 0.18, 0.14, 14);
const G_COOLER_HANDLE = new THREE.BoxGeometry(0.5, 0.25, 0.1);

const G_HEATER_BASE = new THREE.CylinderGeometry(1.05, 1.1, 0.36, 24);
const G_HEATER_POLE = new THREE.CylinderGeometry(0.08, 0.08, 6.4, 14);
const G_HEATER_HEAD = new THREE.CylinderGeometry(0.38, 0.28, 0.9, 20);
const G_HEATER_REFLECTOR = new THREE.ConeGeometry(1.6, 0.5, 32, 1, true);
const G_HEATER_CAP = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 14);
const G_HEATER_FLAME = new THREE.SphereGeometry(0.1, 10, 10);

const G_BARREL_BODY = new THREE.CylinderGeometry(1.1, 1.1, 2.95, 24);
const G_BARREL_RIM = new THREE.CylinderGeometry(1.15, 1.15, 0.1, 24);
const G_BARREL_SPOUT = new THREE.CylinderGeometry(0.2, 0.2, 0.22, 14);
const G_BARREL_BAND = new THREE.CylinderGeometry(1.12, 1.12, 0.08, 24, 1, true);

const G_TANK_BODY = new THREE.CylinderGeometry(0.5, 0.5, 2.15, 22);
const G_TANK_DOME = new THREE.SphereGeometry(0.5, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2);
const G_TANK_RING_BASE = new THREE.TorusGeometry(0.45, 0.05, 8, 22);
const G_TANK_RING_TOP = new THREE.TorusGeometry(0.28, 0.04, 6, 18);
const G_TANK_VALVE = new THREE.CylinderGeometry(0.1, 0.1, 0.16, 12);
const G_TANK_STRAP = new THREE.CylinderGeometry(0.505, 0.505, 0.18, 22, 1, true);

const COOLER_WHEEL_OFFSETS = [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]];

export function Cooler() {
  return (
    <group>
      <mesh position={[0, 1.55, 0]} geometry={G_COOLER_BODY} material={M_COOLER_BODY} castShadow receiveShadow />
      <mesh position={[0, 3.1, 0]} geometry={G_COOLER_LID} material={M_COOLER_LID} castShadow />
      <mesh position={[0, 1.55, 0.97]} geometry={G_COOLER_PANEL} material={M_COOLER_PANEL} castShadow />
      <mesh position={[0, 1.55, 0.98]} geometry={G_COOLER_SLOT} material={M_COOLER_SLOT} />
      {COOLER_WHEEL_OFFSETS.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.18, z]} rotation={[0, 0, Math.PI / 2]} geometry={G_COOLER_WHEEL} material={M_COOLER_WHEEL} castShadow />
      ))}
      <mesh position={[0.75, 3.3, 0]} geometry={G_COOLER_HANDLE} material={M_COOLER_HANDLE} castShadow />
    </group>
  );
}

export function Heater() {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} geometry={G_HEATER_BASE} material={M_HEATER_BASE} castShadow receiveShadow />
      <mesh position={[0, 3.6, 0]} geometry={G_HEATER_POLE} material={M_HEATER_POLE} castShadow />
      <mesh position={[0, 6.55, 0]} geometry={G_HEATER_HEAD} material={M_HEATER_HEAD} castShadow />
      <mesh position={[0, 7.2, 0]} geometry={G_HEATER_REFLECTOR} material={M_HEATER_REFLECTOR} castShadow />
      <mesh position={[0, 7.48, 0]} geometry={G_HEATER_CAP} material={M_HEATER_CAP} castShadow />
      <mesh position={[0, 6.3, 0.41]} geometry={G_HEATER_FLAME} material={M_HEATER_FLAME} />
    </group>
  );
}

export function WaterBarrel() {
  return (
    <group>
      <mesh position={[0, 1.5, 0]} geometry={G_BARREL_BODY} material={M_BARREL_BODY} castShadow receiveShadow />
      <mesh position={[0, 3.01, 0]} geometry={G_BARREL_RIM} material={M_BARREL_RIM} castShadow />
      <mesh position={[0, 3.17, 0]} geometry={G_BARREL_SPOUT} material={M_BARREL_SPOUT} castShadow />
      <mesh position={[0, 1.0, 0]} geometry={G_BARREL_BAND} material={M_BARREL_BAND} />
      <mesh position={[0, 2.0, 0]} geometry={G_BARREL_BAND} material={M_BARREL_BAND} />
    </group>
  );
}

export function PropaneTank() {
  return (
    <group>
      <mesh position={[0, 1.12, 0]} geometry={G_TANK_BODY} material={M_TANK_BODY} castShadow receiveShadow />
      <mesh position={[0, 2.2, 0]} geometry={G_TANK_DOME} material={M_TANK_BODY} castShadow />
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={G_TANK_RING_BASE} material={M_TANK_RING_BASE} castShadow />
      <mesh position={[0, 2.48, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={G_TANK_RING_TOP} material={M_TANK_RING_TOP} castShadow />
      <mesh position={[0, 2.6, 0]} geometry={G_TANK_VALVE} material={M_TANK_VALVE} castShadow />
      <mesh position={[0, 1.35, 0]} geometry={G_TANK_STRAP} material={M_TANK_STRAP} />
    </group>
  );
}
