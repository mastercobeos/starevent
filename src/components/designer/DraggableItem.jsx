'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Furniture from './furniture/Furniture';
import { getItemHalfBounds, getSelectionRingRadii } from './items';

const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const LERP = 0.45;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_RADIUS = 14;
const DRAG_DEADZONE_PX = 5;
const SCENE_HALF = 150;

function snapValue(v, enabled, step = 0.5) {
  return enabled ? Math.round(v / step) * step : v;
}

function clampToScene(x, z, item) {
  const { w, d } = getItemHalfBounds(item.type);
  const maxR = Math.max(w, d);
  return {
    x: Math.max(-SCENE_HALF + maxR, Math.min(SCENE_HALF - maxR, x)),
    z: Math.max(-SCENE_HALF + maxR, Math.min(SCENE_HALF - maxR, z)),
  };
}

function SelectionRing({ type }) {
  const ref = useRef();
  const { inner, outer } = getSelectionRingRadii(type);

  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = 0.6 + Math.sin(clock.elapsedTime * 3) * 0.35;
      ref.current.material.emissiveIntensity = pulse;
      ref.current.material.opacity = 0.55 + Math.sin(clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[inner, outer, 48]} />
      <meshStandardMaterial
        color="#c9a84c"
        emissive="#c9a84c"
        emissiveIntensity={0.9}
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function DraggableItem({
  item,
  selected,
  onSelect,
  onMoveLive,
  onMoveCommit,
  onStartDrag,
  onEndDrag,
  onDoubleClick,
  snapEnabled,
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();

  const pointerDownRef = useRef(null);
  const hasMovedRef = useRef(false);
  const offsetRef = useRef({ x: 0, z: 0 });
  const targetRef = useRef({ x: item.x, z: item.z });
  const lastTapRef = useRef({ time: 0, x: 0, y: 0 });

  useEffect(() => {
    targetRef.current = { x: item.x, z: item.z };
  }, [item.x, item.z]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(item.x, 0, item.z);
    }
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = targetRef.current;
    const pos = groupRef.current.position;
    const dx = t.x - pos.x;
    const dz = t.z - pos.z;
    // Fast-path: at target, skip math entirely.
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
    const now = performance.now();
    const dx = e.clientX - lastTapRef.current.x;
    const dy = e.clientY - lastTapRef.current.y;
    const tapDist = Math.sqrt(dx * dx + dy * dy);

    if (now - lastTapRef.current.time < DOUBLE_TAP_MS && tapDist < DOUBLE_TAP_RADIUS) {
      lastTapRef.current.time = 0;
      onDoubleClick?.(item);
      return;
    }

    onSelect(item.id);

    const point = new THREE.Vector3();
    if (e.ray.intersectPlane(DRAG_PLANE, point)) {
      offsetRef.current = { x: item.x - point.x, z: item.z - point.z };
    }

    pointerDownRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;

    e.target?.setPointerCapture?.(e.pointerId);
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
    const snappedX = snapValue(rawX, snapEnabled);
    const snappedZ = snapValue(rawZ, snapEnabled);
    const { x, z } = clampToScene(snappedX, snappedZ, item);
    onMoveLive(item.id, x, z);
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
    } else {
      lastTapRef.current = {
        time: performance.now(),
        x: e?.clientX ?? lastTapRef.current.x,
        y: e?.clientY ?? lastTapRef.current.y,
      };
    }

    pointerDownRef.current = null;
    hasMovedRef.current = false;
  };

  return (
    <group
      ref={groupRef}
      rotation={[0, item.rotation || 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endInteraction}
      onPointerCancel={endInteraction}
      onLostPointerCapture={endInteraction}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'grab';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <Furniture item={item} />
      {selected && <SelectionRing type={item.type} />}
    </group>
  );
}
