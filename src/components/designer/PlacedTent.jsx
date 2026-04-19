'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Tent from './Tent';
import TheaterLight from './TheaterLight';
import { getTentById } from './tents';

const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const LERP = 0.45;
const DRAG_DEADZONE_PX = 6;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_RADIUS = 16;
const SCENE_HALF = 150;

function clampTent(x, z, width, length) {
  const halfW = width / 2;
  const halfL = length / 2;
  return {
    x: Math.max(-SCENE_HALF + halfW, Math.min(SCENE_HALF - halfW, x)),
    z: Math.max(-SCENE_HALF + halfL, Math.min(SCENE_HALF - halfL, z)),
  };
}

function SelectionFrame({ width, length }) {
  const materialsRef = useRef([]);

  useFrame(({ clock }) => {
    const pulse = 0.55 + Math.sin(clock.elapsedTime * 2.5) * 0.3;
    for (const mat of materialsRef.current) {
      if (mat) mat.opacity = pulse;
    }
  });

  const halfW = width / 2 + 0.3;
  const halfL = length / 2 + 0.3;
  const thickness = 0.18;

  const registerMat = (i) => (mat) => {
    materialsRef.current[i] = mat;
  };

  return (
    <group position={[0, 0.05, 0]}>
      <mesh position={[0, 0, -halfL]}>
        <boxGeometry args={[halfW * 2, 0.08, thickness]} />
        <meshStandardMaterial ref={registerMat(0)} color="#c9a84c" emissive="#c9a84c" emissiveIntensity={1} transparent opacity={0.7} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, halfL]}>
        <boxGeometry args={[halfW * 2, 0.08, thickness]} />
        <meshStandardMaterial ref={registerMat(1)} color="#c9a84c" emissive="#c9a84c" emissiveIntensity={1} transparent opacity={0.7} depthWrite={false} />
      </mesh>
      <mesh position={[-halfW, 0, 0]}>
        <boxGeometry args={[thickness, 0.08, halfL * 2]} />
        <meshStandardMaterial ref={registerMat(2)} color="#c9a84c" emissive="#c9a84c" emissiveIntensity={1} transparent opacity={0.7} depthWrite={false} />
      </mesh>
      <mesh position={[halfW, 0, 0]}>
        <boxGeometry args={[thickness, 0.08, halfL * 2]} />
        <meshStandardMaterial ref={registerMat(3)} color="#c9a84c" emissive="#c9a84c" emissiveIntensity={1} transparent opacity={0.7} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function PlacedTent({
  placed, selected, theaterLightEnabled, theaterLightIntensity = 1,
  onSelect, onMoveLive, onMoveCommit, onStartDrag, onEndDrag, onDoubleClick,
}) {
  const type = getTentById(placed.typeId);
  const groupRef = useRef();
  const pointerDownRef = useRef(null);
  const hasMovedRef = useRef(false);
  const offsetRef = useRef({ x: 0, z: 0 });
  const targetRef = useRef({ x: placed.x, z: placed.z });
  const roofTapRef = useRef({ time: 0, x: 0, y: 0 });

  useEffect(() => {
    targetRef.current = { x: placed.x, z: placed.z };
  }, [placed.x, placed.z]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(placed.x, 0, placed.z);
    }
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = targetRef.current;
    const pos = groupRef.current.position;
    const dx = t.x - pos.x;
    const dz = t.z - pos.z;
    if (dx === 0 && dz === 0) return;
    if (Math.abs(dx) < 0.003 && Math.abs(dz) < 0.003) {
      pos.x = t.x;
      pos.z = t.z;
    } else {
      pos.x += dx * LERP;
      pos.z += dz * LERP;
    }
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();

    onSelect(placed.instanceId);

    const point = new THREE.Vector3();
    if (e.ray.intersectPlane(DRAG_PLANE, point)) {
      offsetRef.current = { x: placed.x - point.x, z: placed.z - point.z };
    }

    pointerDownRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;
    e.target?.setPointerCapture?.(e.pointerId);
  };

  const handleRoofPointerDown = (e) => {
    const now = performance.now();
    const dx = e.clientX - roofTapRef.current.x;
    const dy = e.clientY - roofTapRef.current.y;
    const tapDist = Math.sqrt(dx * dx + dy * dy);

    if (now - roofTapRef.current.time < DOUBLE_TAP_MS && tapDist < DOUBLE_TAP_RADIUS) {
      roofTapRef.current.time = 0;
      e.stopPropagation();
      onDoubleClick?.(placed);
      return;
    }

    roofTapRef.current = { time: now, x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    const down = pointerDownRef.current;
    if (!down) return;
    e.stopPropagation();

    if (!hasMovedRef.current) {
      const dx = e.clientX - down.x;
      const dy = e.clientY - down.y;
      if (dx * dx + dy * dy < DRAG_DEADZONE_PX * DRAG_DEADZONE_PX) return;
      hasMovedRef.current = true;
      onStartDrag();
    }

    const point = new THREE.Vector3();
    if (!e.ray.intersectPlane(DRAG_PLANE, point)) return;
    const rawX = point.x + offsetRef.current.x;
    const rawZ = point.z + offsetRef.current.z;
    const { x, z } = clampTent(rawX, rawZ, type.width, type.length);
    onMoveLive(placed.instanceId, x, z);
  };

  const endInteraction = (e) => {
    const down = pointerDownRef.current;
    if (!down) return;

    try {
      e?.target?.releasePointerCapture?.(down.pointerId);
    } catch {}

    if (hasMovedRef.current) {
      onMoveCommit();
      onEndDrag();
    }

    pointerDownRef.current = null;
    hasMovedRef.current = false;
  };

  return (
    <group
      ref={groupRef}
      rotation={[0, placed.rotation || 0, 0]}
    >
      <Tent
        width={type.width}
        length={type.length}
        variant={type.variant}
        wallsRetracted={!!placed.wallsRetracted}
        onRoofPointerDown={handleRoofPointerDown}
      />
      <TheaterLight enabled={theaterLightEnabled} intensity={theaterLightIntensity} />

      <mesh
        position={[0, 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
        onLostPointerCapture={endInteraction}
        visible={false}
      >
        <planeGeometry args={[type.width, type.length]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {selected && <SelectionFrame width={type.width} length={type.length} />}
    </group>
  );
}
