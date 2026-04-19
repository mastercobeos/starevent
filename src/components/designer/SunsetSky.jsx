'use client';

import { useMemo, useEffect } from 'react';
import * as THREE from 'three';

const VERTEX = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FRAGMENT = `
  uniform vec3 topColor;
  uniform vec3 midColor;
  uniform vec3 bottomColor;
  uniform vec3 horizonColor;
  uniform vec3 sunDir;
  uniform float sunIntensity;
  uniform float haloIntensity;
  varying vec3 vWorldPosition;
  void main() {
    vec3 viewDir = normalize(vWorldPosition);
    float h = viewDir.y;
    float t = clamp((h + 0.2) / 1.2, 0.0, 1.0);
    vec3 color;
    if (t < 0.22) {
      color = mix(horizonColor, bottomColor, t / 0.22);
    } else if (t < 0.55) {
      color = mix(bottomColor, midColor, (t - 0.22) / 0.33);
    } else {
      color = mix(midColor, topColor, (t - 0.55) / 0.45);
    }
    float sunDot = max(0.0, dot(viewDir, normalize(sunDir)));
    float sunBright = pow(sunDot, 180.0);
    color = mix(color, vec3(1.0, 0.98, 0.92), sunBright * sunIntensity);
    float halo = pow(sunDot, 20.0);
    color = mix(color, vec3(1.0, 0.97, 0.88), halo * haloIntensity);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const DAY_PALETTE = {
  topColor: '#3e89d0',
  midColor: '#7cb4e4',
  bottomColor: '#c4defa',
  horizonColor: '#e8f4fc',
  sunIntensity: 0.75,
  haloIntensity: 0.15,
};

const NIGHT_PALETTE = {
  topColor: '#030614',
  midColor: '#061128',
  bottomColor: '#0a1e3e',
  horizonColor: '#1a2850',
  sunIntensity: 0.0,
  haloIntensity: 0.0,
};

export default function SunsetSky({ mode = 'day' }) {
  const material = useMemo(() => {
    const p = mode === 'night' ? NIGHT_PALETTE : DAY_PALETTE;
    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(p.topColor) },
        midColor: { value: new THREE.Color(p.midColor) },
        bottomColor: { value: new THREE.Color(p.bottomColor) },
        horizonColor: { value: new THREE.Color(p.horizonColor) },
        sunDir: { value: new THREE.Vector3(40, 60, 30).normalize() },
        sunIntensity: { value: p.sunIntensity },
        haloIntensity: { value: p.haloIntensity },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
  }, []);

  useEffect(() => {
    const p = mode === 'night' ? NIGHT_PALETTE : DAY_PALETTE;
    material.uniforms.topColor.value.set(p.topColor);
    material.uniforms.midColor.value.set(p.midColor);
    material.uniforms.bottomColor.value.set(p.bottomColor);
    material.uniforms.horizonColor.value.set(p.horizonColor);
    material.uniforms.sunIntensity.value = p.sunIntensity;
    material.uniforms.haloIntensity.value = p.haloIntensity;
  }, [mode, material]);

  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  );
}
