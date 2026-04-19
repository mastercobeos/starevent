'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

function buildGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#628b44');
  grad.addColorStop(1, '#486930');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 5500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2.2 + 0.4;
    const h = 70 + Math.random() * 35;
    const s = 28 + Math.random() * 40;
    const l = 22 + Math.random() * 22;
    const a = 0.45 + Math.random() * 0.4;
    ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = `hsla(${80 + Math.random() * 20}, 55%, ${50 + Math.random() * 15}%, ${0.25 + Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.6 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(56, 56);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function Ground() {
  const texture = useMemo(
    () => (typeof document !== 'undefined' ? buildGrassTexture() : null),
    []
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial
        map={texture}
        color="#5f8a44"
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}
