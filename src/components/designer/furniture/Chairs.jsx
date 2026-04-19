'use client';

import {
  M,
  G_CHIAVARI_LEG, G_CHIAVARI_SEAT, G_CHIAVARI_BACK_POST, G_CHIAVARI_RUNG, G_CHIAVARI_TOP,
  G_GARDEN_LEG, G_GARDEN_SEAT, G_GARDEN_BACK,
  G_RESIN_LEG, G_RESIN_SEAT, G_RESIN_BACK,
  G_WOOD_LEG, G_WOOD_SEAT, G_WOOD_POST, G_WOOD_RUNG, G_WOOD_TOP,
  CHAIR_LEG_OFFSETS,
} from './shared';

const SEAT_HEIGHT = 1.5;

function ChiavariLegs() {
  return (
    <>
      {CHAIR_LEG_OFFSETS.map(([x, z], i) => (
        <mesh key={i} position={[x, SEAT_HEIGHT / 2, z]} geometry={G_CHIAVARI_LEG} material={M.goldBright} castShadow />
      ))}
    </>
  );
}

function GardenLegs() {
  return (
    <>
      {CHAIR_LEG_OFFSETS.map(([x, z], i) => (
        <mesh key={i} position={[x, SEAT_HEIGHT / 2, z]} geometry={G_GARDEN_LEG} material={M.chairFrame} castShadow />
      ))}
    </>
  );
}

function ResinLegs() {
  return (
    <>
      {CHAIR_LEG_OFFSETS.map(([x, z], i) => (
        <mesh key={i} position={[x, SEAT_HEIGHT / 2, z]} geometry={G_RESIN_LEG} material={M.resin} castShadow />
      ))}
    </>
  );
}

function WoodLegs() {
  return (
    <>
      {CHAIR_LEG_OFFSETS.map(([x, z], i) => (
        <mesh key={i} position={[x, SEAT_HEIGHT / 2, z]} geometry={G_WOOD_LEG} material={M.wood} castShadow />
      ))}
    </>
  );
}

export function ChiavariChair() {
  return (
    <group>
      <ChiavariLegs />
      <mesh position={[0, SEAT_HEIGHT + 0.05, 0]} geometry={G_CHIAVARI_SEAT} material={M.goldBright} castShadow receiveShadow />
      <mesh position={[-0.58, SEAT_HEIGHT + 1.1, -0.58]} geometry={G_CHIAVARI_BACK_POST} material={M.goldBright} castShadow />
      <mesh position={[0.58, SEAT_HEIGHT + 1.1, -0.58]} geometry={G_CHIAVARI_BACK_POST} material={M.goldBright} castShadow />
      {[0.3, 0.75, 1.2, 1.65].map((y, i) => (
        <mesh key={i} position={[0, SEAT_HEIGHT + y, -0.58]} geometry={G_CHIAVARI_RUNG} material={M.goldBright} castShadow />
      ))}
      <mesh position={[0, SEAT_HEIGHT + 2.15, -0.58]} geometry={G_CHIAVARI_TOP} material={M.goldBright} castShadow />
    </group>
  );
}

export function KidChiavariChair() {
  return (
    <group scale={[0.72, 0.72, 0.72]}>
      <ChiavariChair />
    </group>
  );
}

export function GardenChair() {
  return (
    <group>
      <GardenLegs />
      <mesh position={[0, SEAT_HEIGHT + 0.09, 0]} geometry={G_GARDEN_SEAT} material={M.chairPad} castShadow receiveShadow />
      <mesh
        position={[0, SEAT_HEIGHT + 1.15, -0.55]}
        rotation={[-0.08, 0, 0]}
        geometry={G_GARDEN_BACK}
        material={M.chairPad}
        castShadow
      />
    </group>
  );
}

export function ResinChair() {
  return (
    <group>
      <ResinLegs />
      <mesh position={[0, SEAT_HEIGHT + 0.05, 0]} geometry={G_RESIN_SEAT} material={M.resinSeat} castShadow receiveShadow />
      <mesh
        position={[0, SEAT_HEIGHT + 1.0, -0.55]}
        rotation={[-0.1, 0, 0]}
        geometry={G_RESIN_BACK}
        material={M.resinSeat}
        castShadow
      />
    </group>
  );
}

export function WoodenChair() {
  return (
    <group>
      <WoodLegs />
      <mesh position={[0, SEAT_HEIGHT + 0.06, 0]} geometry={G_WOOD_SEAT} material={M.woodDark} castShadow receiveShadow />
      <mesh position={[-0.55, SEAT_HEIGHT + 1.05, -0.58]} geometry={G_WOOD_POST} material={M.wood} castShadow />
      <mesh position={[0.55, SEAT_HEIGHT + 1.05, -0.58]} geometry={G_WOOD_POST} material={M.wood} castShadow />
      {[0.4, 1.05, 1.7].map((y, i) => (
        <mesh key={`s-${i}`} position={[0, SEAT_HEIGHT + y, -0.58]} geometry={G_WOOD_RUNG} material={M.woodDark} castShadow />
      ))}
      <mesh position={[0, SEAT_HEIGHT + 2.1, -0.58]} geometry={G_WOOD_TOP} material={M.wood} castShadow />
    </group>
  );
}
