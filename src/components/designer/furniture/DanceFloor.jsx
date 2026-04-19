'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Instances, Instance } from '@react-three/drei';

const M_BASE = new THREE.MeshStandardMaterial({ color: '#1a1208', roughness: 0.7, metalness: 0.1 });
const M_TILE_LIGHT = new THREE.MeshStandardMaterial({ color: '#f1e7c9', roughness: 0.4, metalness: 0.1 });
const M_TILE_DARK = new THREE.MeshStandardMaterial({ color: '#2b1d12', roughness: 0.4, metalness: 0.1 });

export function DanceFloor({ width = 12, depth = 12 }) {
  const { tiles, tileSize, baseGeom, tileGeom } = useMemo(() => {
    const size = width >= 16 ? 2.5 : 2;
    const cols = Math.round(width / size);
    const rows = Math.round(depth / size);
    const light = [];
    const dark = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isLight = (r + c) % 2 === 0;
        const tile = {
          key: `${r}-${c}`,
          position: [
            c * size - (cols * size) / 2 + size / 2,
            0.08,
            r * size - (rows * size) / 2 + size / 2,
          ],
        };
        (isLight ? light : dark).push(tile);
      }
    }
    return {
      tiles: { light, dark },
      tileSize: size,
      baseGeom: new THREE.BoxGeometry(width + 0.3, 0.06, depth + 0.3),
      tileGeom: new THREE.BoxGeometry(size - 0.03, 0.04, size - 0.03),
    };
  }, [width, depth]);

  return (
    <group>
      <mesh position={[0, 0.03, 0]} geometry={baseGeom} material={M_BASE} receiveShadow />

      <Instances geometry={tileGeom} material={M_TILE_LIGHT} limit={tiles.light.length}>
        {tiles.light.map((t) => (
          <Instance key={t.key} position={t.position} />
        ))}
      </Instances>

      <Instances geometry={tileGeom} material={M_TILE_DARK} limit={tiles.dark.length}>
        {tiles.dark.map((t) => (
          <Instance key={t.key} position={t.position} />
        ))}
      </Instances>
    </group>
  );
}
