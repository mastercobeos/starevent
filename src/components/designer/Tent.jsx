'use client';

import { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const EAVE_HEIGHT = 8;
const RETRACT_LERP = 0.12;
const RETRACT_MIN = 0.001;

let _stripedFabricMap = null;
let _fabricNormalMap = null;

function createStripedFabricTexture() {
  const canvas = document.createElement('canvas');
  const W = 512;
  const H = 1024;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f6f8fb';
  ctx.fillRect(0, 0, W, H);

  const stripeWidth = 64;
  ctx.fillStyle = '#5c8fc2';
  for (let x = 0; x < W; x += stripeWidth * 2) {
    ctx.fillRect(x, 0, stripeWidth, H);
  }

  const img = ctx.getImageData(0, 0, W, H);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 20;
    data[i] = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y + (Math.random() - 0.5));
    ctx.lineTo(W, y + (Math.random() - 0.5));
    ctx.stroke();
  }
  ctx.globalAlpha = 0.05;
  for (let x = 0; x < W; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x + (Math.random() - 0.5), 0);
    ctx.lineTo(x + (Math.random() - 0.5), H);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createFabricNormalMap() {
  const canvas = document.createElement('canvas');
  const W = 256;
  const H = 256;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgb(128,128,255)';
  ctx.fillRect(0, 0, W, H);

  const img = ctx.getImageData(0, 0, W, H);
  const data = img.data;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const weave = Math.sin((x + y) * Math.PI * 0.25) * 8;
      data[i] = 128 + weave;
      data[i + 1] = 128 + Math.sin((x - y) * Math.PI * 0.25) * 8;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function getStripedFabricMap() {
  if (_stripedFabricMap) return _stripedFabricMap;
  if (typeof document === 'undefined') return null;
  _stripedFabricMap = createStripedFabricTexture();
  return _stripedFabricMap;
}

function getFabricNormalMap() {
  if (_fabricNormalMap) return _fabricNormalMap;
  if (typeof document === 'undefined') return null;
  _fabricNormalMap = createFabricNormalMap();
  return _fabricNormalMap;
}

const VARIANTS = {
  'frame': {
    peakRise: 4,
    roofColor: '#ffffff',
    roofOpacity: 1,
    roofRoughness: 0.8,
    roofEmissive: '#ffffff',
    roofEmissiveIntensity: 0.02,
    gableOpacity: 1,
    wallColor: '#ffffff',
    wallOpacity: 1,
    wallRoughness: 0.95,
    wallMetalness: 0,
    wallsEnabled: true,
    centerPoles: true,
    tieBack: true,
    tieBackColor: '#4d6b91',
    striped: true,
    wallHasWindows: false,
  },
  'clear': {
    peakRise: 4,
    roofColor: '#eaf2ff',
    roofOpacity: 0.32,
    roofRoughness: 0.15,
    roofEmissive: '#c4dcff',
    roofEmissiveIntensity: 0.06,
    gableOpacity: 0.28,
    wallColor: '#ffffff',
    wallOpacity: 1,
    wallRoughness: 0.95,
    wallMetalness: 0,
    wallsEnabled: true,
    centerPoles: true,
    tieBack: true,
    tieBackColor: '#4d6b91',
    striped: true,
    wallHasWindows: false,
  },
  'high-peak': {
    peakRise: 12,
    roofColor: '#fafafa',
    roofOpacity: 1,
    roofRoughness: 0.78,
    roofEmissive: '#ffffff',
    roofEmissiveIntensity: 0.02,
    gableOpacity: 0.92,
    wallsEnabled: false,
    centerPoles: false,
    multiPeak: true,
    tieBack: false,
  },
};

function Pole({
  position, height, radius = 0.12, color = '#d8d8d8',
  metalness = 0.85, roughness = 0.35,
  emissive = '#000000', emissiveIntensity = 0,
}) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[radius, radius, height, 16]} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

const GOLD_COLOR = '#dcc25a';
const GOLD_EMISSIVE = '#7a5a20';
const SILVER_COLOR = '#b5b5ba';

function PitchedRoofPanel({ side, width, length, peakHeight, eaveHeight, variant, onPointerDown }) {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const halfW = width / 2;
    const halfL = length / 2;
    const sx = side === 'left' ? -halfW : halfW;
    const vertices = new Float32Array([
      sx, eaveHeight, -halfL,
      sx, eaveHeight, halfL,
      0, peakHeight, halfL,
      sx, eaveHeight, -halfL,
      0, peakHeight, halfL,
      0, peakHeight, -halfL,
    ]);
    g.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]), 2));
    g.computeVertexNormals();
    return g;
  }, [side, width, length, peakHeight, eaveHeight]);

  const isTransparent = variant.roofOpacity < 1;

  return (
    <mesh geometry={geom} castShadow={!isTransparent} receiveShadow={!isTransparent} onPointerDown={onPointerDown}>
      <meshStandardMaterial
        color={variant.roofColor}
        side={THREE.DoubleSide}
        roughness={variant.roofRoughness}
        metalness={isTransparent ? 0.1 : 0}
        emissive={variant.roofEmissive}
        emissiveIntensity={variant.roofEmissiveIntensity}
        transparent={isTransparent}
        opacity={variant.roofOpacity}
      />
    </mesh>
  );
}

function MultiPeakRoof({ width, length, peakHeight, eaveHeight, variant }) {
  const { geom, sections } = useMemo(() => {
    const n = Math.max(1, Math.round(length / 20));
    const secLen = length / n;
    const halfW = width / 2;
    const halfL = length / 2;
    const v = [];

    for (let i = 0; i < n; i++) {
      const zStart = -halfL + i * secLen;
      const zEnd = zStart + secLen;
      const zC = (zStart + zEnd) / 2;

      // Front triangular panel (toward -Z)
      v.push(-halfW, eaveHeight, zStart,  halfW, eaveHeight, zStart,  0, peakHeight, zC);
      // Back triangular panel (toward +Z)
      v.push(halfW, eaveHeight, zEnd,  -halfW, eaveHeight, zEnd,  0, peakHeight, zC);
      // Left panel (toward -X)
      v.push(-halfW, eaveHeight, zEnd,  -halfW, eaveHeight, zStart,  0, peakHeight, zC);
      // Right panel (toward +X)
      v.push(halfW, eaveHeight, zStart,  halfW, eaveHeight, zEnd,  0, peakHeight, zC);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3));
    g.computeVertexNormals();
    return { geom: g, sections: n };
  }, [width, length, peakHeight, eaveHeight]);

  return (
    <mesh geometry={geom} castShadow receiveShadow>
      <meshStandardMaterial
        color={variant.roofColor}
        side={THREE.DoubleSide}
        roughness={variant.roofRoughness}
        emissive={variant.roofEmissive}
        emissiveIntensity={variant.roofEmissiveIntensity}
      />
    </mesh>
  );
}

function PeakFinials({ width, length, peakHeight, eaveHeight }) {
  const peakZs = useMemo(() => {
    const n = Math.max(1, Math.round(length / 20));
    const secLen = length / n;
    const halfL = length / 2;
    const list = [];
    for (let i = 0; i < n; i++) {
      list.push(-halfL + i * secLen + secLen / 2);
    }
    return list;
  }, [length]);

  return (
    <>
      {peakZs.map((z) => (
        <mesh key={`finial-${z}`} position={[0, peakHeight + 0.15, z]} castShadow>
          <coneGeometry args={[0.15, 0.7, 8]} />
          <meshStandardMaterial color="#9a9a9e" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </>
  );
}

function Gable({ front, width, length, peakHeight, eaveHeight, variant }) {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const halfW = width / 2;
    const halfL = length / 2;
    const z = front ? halfL : -halfL;
    const normalZ = front ? 1 : -1;
    const vertices = new Float32Array([
      -halfW, eaveHeight, z,
      halfW, eaveHeight, z,
      0, peakHeight, z,
    ]);
    const normals = new Float32Array([0, 0, normalZ, 0, 0, normalZ, 0, 0, normalZ]);
    g.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0.5, 1]), 2));
    return g;
  }, [front, width, length, peakHeight, eaveHeight]);

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color={variant.roofColor}
        side={THREE.DoubleSide}
        roughness={variant.roofRoughness}
        transparent
        opacity={variant.gableOpacity}
      />
    </mesh>
  );
}

function Window({ cx, cy, width: ww, height: wh, color, opacity }) {
  const archR = ww / 2;
  return (
    <group position={[cx, cy, 0]}>
      {/* Rectangular body */}
      <mesh position={[0, -wh / 4, 0]}>
        <planeGeometry args={[ww, wh / 2]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.08}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Arched top — approximated with a half-disc */}
      <mesh position={[0, wh / 4 + archR / 2, 0]} rotation={[0, 0, 0]}>
        <circleGeometry args={[archR, 24, 0, Math.PI]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.08}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Frame outline — rectangle border */}
      {[
        { x: -ww / 2, y: -wh / 4, w: 0.04, h: wh / 2 },
        { x: ww / 2, y: -wh / 4, w: 0.04, h: wh / 2 },
        { x: 0, y: -wh / 2 + 0.02, w: ww, h: 0.04 },
      ].map((seg, i) => (
        <mesh key={`frame-${i}`} position={[seg.x, seg.y, 0.005]}>
          <planeGeometry args={[seg.w, seg.h]} />
          <meshStandardMaterial color="#d0d0d0" side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Mullions — vertical (2) + horizontal (2) */}
      {[-ww / 6, ww / 6].map((x, i) => (
        <mesh key={`mv-${i}`} position={[x, -wh / 4, 0.005]}>
          <planeGeometry args={[0.03, wh / 2]} />
          <meshStandardMaterial color="#d8d8d8" side={THREE.DoubleSide} />
        </mesh>
      ))}
      {[-wh / 6, wh / 12].map((y, i) => (
        <mesh key={`mh-${i}`} position={[0, y, 0.005]}>
          <planeGeometry args={[ww, 0.03]} />
          <meshStandardMaterial color="#d8d8d8" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

const PLEAT_CYCLES = 10;
const PLEAT_AMP = 0.38;

function useWallRetract(retracted, opts = {}) {
  const { geomRef, tieBackRef, wallLength = 20, anchorSide = 'right' } = opts;
  const progressRef = useRef(retracted ? 1 : 0);
  const originalPosRef = useRef(null);
  const wasAnimatingRef = useRef(true);

  useFrame(() => {
    const target = retracted ? 1 : 0;
    const diff = target - progressRef.current;
    const animating = Math.abs(diff) >= RETRACT_MIN;

    // Skip all per-vertex work if idle at target and we've already written the final state once.
    if (!animating && !wasAnimatingRef.current && originalPosRef.current) {
      return;
    }

    if (animating) progressRef.current += diff * RETRACT_LERP;
    else progressRef.current = target;

    const p = progressRef.current;

    if (tieBackRef?.current) {
      tieBackRef.current.visible = p > 0.1;
      const s = Math.min(1, Math.max(0, (p - 0.1) / 0.5));
      tieBackRef.current.scale.setScalar(Math.max(0.001, s));
    }

    if (geomRef?.current?.attributes?.position) {
      const posAttr = geomRef.current.attributes.position;
      const firstTime = !originalPosRef.current;
      if (firstTime || originalPosRef.current.length !== posAttr.array.length) {
        originalPosRef.current = new Float32Array(posAttr.array);
      }
      const orig = originalPosRef.current;
      const halfLen = wallLength / 2;
      const halfH = EAVE_HEIGHT / 2;
      const count = posAttr.count;

      const gatherFactor = 1 - p * 0.82;
      const pleatAmp = PLEAT_AMP * p;
      const anchorSign = anchorSide === 'right' ? 1 : -1;
      const anchorX = halfLen * anchorSign;

      for (let i = 0; i < count; i++) {
        const ox = orig[i * 3];
        const oy = orig[i * 3 + 1];

        const normY = oy / halfH;
        const topness = Math.max(0, normY);
        const topRelief = topness * topness * 0.55 * p;
        const localGather = Math.min(1, gatherFactor + topRelief);

        let newX = anchorX - (anchorX - ox) * localGather;

        const effectiveDist = normY > 0 ? normY : 0;
        const middleness = Math.max(0, 1 - effectiveDist * 1.35);
        const pinchAmount = 0.55 * p * middleness;
        newX = anchorX - (anchorX - newX) * (1 - pinchAmount);

        const phase = (ox / halfLen) * PLEAT_CYCLES * Math.PI;
        const topFan = 1 + topness * 0.5;
        const zOffset = Math.sin(phase) * pleatAmp * topFan;

        posAttr.array[i * 3] = newX;
        posAttr.array[i * 3 + 2] = zOffset;
      }
      posAttr.needsUpdate = true;
      if (animating || wasAnimatingRef.current || firstTime) {
        geomRef.current.computeVertexNormals();
      }
    }

    wasAnimatingRef.current = animating;
  });

  return { progressRef };
}

function TieBack({ color, tieBackRef }) {
  return (
    <group ref={tieBackRef} visible={false}>
      {/* Thin elegant ribbon wrapping around */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.85, 0.035, 4, 32]} />
        <meshStandardMaterial color={color} roughness={0.92} metalness={0.02} />
      </mesh>

      {/* Small knot at the front */}
      <mesh position={[0, 0, 0.88]} castShadow>
        <boxGeometry args={[0.1, 0.14, 0.11]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>

      {/* Elegant slim tails hanging down */}
      <mesh position={[0.04, -0.55, 0.9]} rotation={[0, 0, -0.18]} castShadow>
        <boxGeometry args={[0.03, 1.1, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[-0.04, -0.6, 0.88]} rotation={[0, 0, 0.12]} castShadow>
        <boxGeometry args={[0.03, 1.2, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}

const TOP_FLARE = 0.22;
const BOTTOM_PINCH = 0.06;

function CurtainPanel({ length, centerX, anchorSide, variant, retracted }) {
  const geomRef = useRef();
  const tieBackRef = useRef();

  useLayoutEffect(() => {
    const geom = geomRef.current;
    if (!geom?.attributes?.position) return;
    const pos = geom.attributes.position;
    const halfH = EAVE_HEIGHT / 2;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.array[i * 3 + 1];
      const normY = Math.max(-1, Math.min(1, y / halfH));
      const t = (normY + 1) / 2;
      const widthFactor = (1 - BOTTOM_PINCH) + t * (TOP_FLARE + BOTTOM_PINCH);
      pos.array[i * 3] *= widthFactor;
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  }, [length]);

  useWallRetract(retracted, { geomRef, tieBackRef, wallLength: length, anchorSide });

  const segs = Math.max(28, Math.round(length * 4));
  const halfLen = length / 2;
  const tieBackLocalX =
    anchorSide === 'right' ? halfLen - 0.45 : -halfLen + 0.45;

  const fabricMap = useMemo(() => {
    if (!variant.striped) return null;
    const base = getStripedFabricMap();
    if (!base) return null;
    const tex = base.clone();
    tex.needsUpdate = true;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(Math.max(1, length / 4), 1);
    return tex;
  }, [variant.striped, length]);

  const normalMap = useMemo(() => {
    if (!variant.striped) return null;
    const base = getFabricNormalMap();
    if (!base) return null;
    const tex = base.clone();
    tex.needsUpdate = true;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(Math.max(4, length * 1.5), 8);
    return tex;
  }, [variant.striped, length]);

  return (
    <>
      <mesh
        position={[centerX, EAVE_HEIGHT / 2, 0]}
        castShadow={variant.wallOpacity > 0.6}
        receiveShadow={variant.wallOpacity > 0.6}
      >
        <planeGeometry ref={geomRef} args={[length, EAVE_HEIGHT, segs, 10]} />
        <meshStandardMaterial
          color={variant.wallColor}
          map={fabricMap || undefined}
          normalMap={normalMap || undefined}
          normalScale={normalMap ? new THREE.Vector2(0.4, 0.4) : undefined}
          side={THREE.DoubleSide}
          transparent={variant.wallOpacity < 1}
          opacity={variant.wallOpacity}
          roughness={variant.wallRoughness}
          metalness={variant.wallMetalness}
        />
      </mesh>

      {variant.tieBack && (
        <group position={[centerX + tieBackLocalX, EAVE_HEIGHT / 2, 0]}>
          <TieBack color={variant.tieBackColor} tieBackRef={tieBackRef} />
        </group>
      )}
    </>
  );
}

function WallSections({ boundaries, variant, retracted }) {
  const sections = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    sections.push({
      key: `sec-${i}`,
      center: (start + end) / 2,
      length: end - start,
    });
  }
  return (
    <>
      {sections.map((sec) => {
        const panelLength = sec.length / 2;
        const panelHalf = panelLength / 2;
        return (
          <group key={sec.key} position={[sec.center, 0, 0]}>
            <CurtainPanel
              length={panelLength}
              centerX={-panelHalf}
              anchorSide="left"
              variant={variant}
              retracted={retracted}
            />
            <CurtainPanel
              length={panelLength}
              centerX={panelHalf}
              anchorSide="right"
              variant={variant}
              retracted={retracted}
            />
          </group>
        );
      })}
    </>
  );
}

function SideWall({ side, width, length, variant, retracted, polePositions }) {
  const x = side === 'left' ? -width / 2 : width / 2;
  const rotY = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
  const boundaries = polePositions && polePositions.length >= 2
    ? polePositions
    : [-length / 2, length / 2];

  return (
    <group position={[x, 0, 0]} rotation={[0, rotY, 0]}>
      <WallSections boundaries={boundaries} variant={variant} retracted={retracted} />
    </group>
  );
}

function FrontWall({ width, length, variant, isBack, retracted, hasCenterPole }) {
  const z = isBack ? -length / 2 : length / 2;
  const rotY = isBack ? 0 : Math.PI;
  const halfW = width / 2;
  const boundaries = hasCenterPole ? [-halfW, 0, halfW] : [-halfW, halfW];

  return (
    <group position={[0, 0, z]} rotation={[0, rotY, 0]}>
      <WallSections boundaries={boundaries} variant={variant} retracted={retracted} />
    </group>
  );
}

function RidgeBeam({ length, height }) {
  return (
    <mesh position={[0, height, 0]} castShadow>
      <boxGeometry args={[0.25, 0.18, length]} />
      <meshStandardMaterial color="#c9c9c9" metalness={0.8} roughness={0.35} />
    </mesh>
  );
}

function EaveBeam({ x, length, height }) {
  return (
    <mesh position={[x, height, 0]} castShadow>
      <boxGeometry args={[0.22, 0.18, length]} />
      <meshStandardMaterial color="#c9c9c9" metalness={0.8} roughness={0.35} />
    </mesh>
  );
}

function Floor({ width, length }) {
  return (
    <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color="#d4c09a" roughness={0.95} metalness={0} />
    </mesh>
  );
}

export default function Tent({ width = 20, length = 40, variant = 'frame', wallsRetracted = false, onRoofPointerDown }) {
  const v = VARIANTS[variant] || VARIANTS.frame;
  const peakHeight = EAVE_HEIGHT + v.peakRise;
  const halfL = length / 2;
  const halfW = width / 2;

  const polePositions = useMemo(() => {
    const spacing = v.multiPeak ? 20 : 10;
    const count = Math.max(2, Math.round(length / spacing) + 1);
    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push(-halfL + i * (length / (count - 1)));
    }
    return positions;
  }, [length, halfL, v.multiPeak]);

  return (
    <group>
      <Floor width={width} length={length} />

      {/* Corner + perimeter posts — middle ones between curtains get gold */}
      {polePositions.map((z, i) => {
        const isCorner = i === 0 || i === polePositions.length - 1;
        const isMiddleBetweenCurtains = !isCorner && v.wallsEnabled && !v.multiPeak;
        const poleRadius = v.multiPeak ? 0.07 : (isMiddleBetweenCurtains ? 0.18 : 0.12);
        const poleColor = v.multiPeak ? '#c8c8cc' : (isMiddleBetweenCurtains ? GOLD_COLOR : SILVER_COLOR);
        const poleEmissive = isMiddleBetweenCurtains ? GOLD_EMISSIVE : '#000000';
        const poleEmissiveI = isMiddleBetweenCurtains ? 0.22 : 0;
        const poleMetalness = isMiddleBetweenCurtains ? 0.92 : 0.85;
        const poleRoughness = isMiddleBetweenCurtains ? 0.22 : 0.35;
        return (
          <group key={`pair-${z}`}>
            <Pole
              position={[-halfW, EAVE_HEIGHT / 2, z]}
              height={EAVE_HEIGHT}
              radius={poleRadius}
              color={poleColor}
              metalness={poleMetalness}
              roughness={poleRoughness}
              emissive={poleEmissive}
              emissiveIntensity={poleEmissiveI}
            />
            <Pole
              position={[halfW, EAVE_HEIGHT / 2, z]}
              height={EAVE_HEIGHT}
              radius={poleRadius}
              color={poleColor}
              metalness={poleMetalness}
              roughness={poleRoughness}
              emissive={poleEmissive}
              emissiveIntensity={poleEmissiveI}
            />
          </group>
        );
      })}

      {/* Center ridge poles — end ones (at front/back walls) get gold */}
      {v.centerPoles && polePositions.map((z, i) => {
        const isWallMiddle = (i === 0 || i === polePositions.length - 1) && v.wallsEnabled;
        const cpRadius = isWallMiddle ? 0.14 : 0.1;
        const cpColor = isWallMiddle ? GOLD_COLOR : SILVER_COLOR;
        const cpEmissive = isWallMiddle ? GOLD_EMISSIVE : '#000000';
        const cpEmissiveI = isWallMiddle ? 0.22 : 0;
        const cpMetalness = isWallMiddle ? 0.92 : 0.85;
        const cpRoughness = isWallMiddle ? 0.22 : 0.35;
        return (
          <Pole
            key={`c${z}`}
            position={[0, peakHeight / 2, z]}
            height={peakHeight}
            radius={cpRadius}
            color={cpColor}
            metalness={cpMetalness}
            roughness={cpRoughness}
            emissive={cpEmissive}
            emissiveIntensity={cpEmissiveI}
          />
        );
      })}

      {/* Structural beams (frame/clear only) */}
      {!v.multiPeak && (
        <>
          <EaveBeam x={-halfW} length={length} height={EAVE_HEIGHT} />
          <EaveBeam x={halfW} length={length} height={EAVE_HEIGHT} />
          <RidgeBeam length={length} height={peakHeight} />
        </>
      )}

      {/* Roof */}
      {v.multiPeak ? (
        <>
          <MultiPeakRoof width={width} length={length} peakHeight={peakHeight} eaveHeight={EAVE_HEIGHT} variant={v} />
          <PeakFinials width={width} length={length} peakHeight={peakHeight} eaveHeight={EAVE_HEIGHT} />
        </>
      ) : (
        <>
          <PitchedRoofPanel side="left" width={width} length={length} peakHeight={peakHeight} eaveHeight={EAVE_HEIGHT} variant={v} onPointerDown={onRoofPointerDown} />
          <PitchedRoofPanel side="right" width={width} length={length} peakHeight={peakHeight} eaveHeight={EAVE_HEIGHT} variant={v} onPointerDown={onRoofPointerDown} />
          <Gable front width={width} length={length} peakHeight={peakHeight} eaveHeight={EAVE_HEIGHT} variant={v} />
          <Gable front={false} width={width} length={length} peakHeight={peakHeight} eaveHeight={EAVE_HEIGHT} variant={v} />
        </>
      )}

      {/* Side walls with windows (frame + clear) */}
      {v.wallsEnabled && (
        <>
          <SideWall side="left" width={width} length={length} variant={v} retracted={wallsRetracted} polePositions={polePositions} />
          <SideWall side="right" width={width} length={length} variant={v} retracted={wallsRetracted} polePositions={polePositions} />
          <FrontWall width={width} length={length} variant={v} isBack={false} retracted={wallsRetracted} hasCenterPole={v.centerPoles} />
          <FrontWall width={width} length={length} variant={v} isBack retracted={wallsRetracted} hasCenterPole={v.centerPoles} />
        </>
      )}
    </group>
  );
}

export function getTentPeakHeight(variant = 'frame') {
  const v = VARIANTS[variant] || VARIANTS.frame;
  return EAVE_HEIGHT + v.peakRise;
}
