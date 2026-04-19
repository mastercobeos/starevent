'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import {
  OrbitControls, ContactShadows, Environment, Lightformer,
  Cloud, Clouds, Stars,
} from '@react-three/drei';
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing';
import * as THREE from 'three';
import Ground from './Ground';
import DraggableItem from './DraggableItem';
import StringLights from './StringLights';
import SunsetSky from './SunsetSky';
import PlacedTent from './PlacedTent';

const IS_TOUCH = typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// Mobile tier only when BOTH the viewport is narrow AND the pointer is coarse.
// Using pointer:coarse alone mis-classified desktop touchscreens as mobile
// (which killed Bloom / made night scenes look flat).
const IS_MOBILE = typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(max-width: 820px)').matches &&
  window.matchMedia('(pointer: coarse)').matches;

// Device-tier quality — chosen ONCE at mount based on device hints, then
// frozen for the rest of the session to avoid mid-render tree reconstruction
// (which caused shadow/environment flashes during camera orbit).
const QUALITY_DESKTOP = {
  shadowMapSize: 1536,
  contactShadowRes: 768,
  envRes: 256,
  ssaoSamples: 8,
  bloomEnabled: true,
  cloudCount: 10,
  starCount: 2500,
  softShadows: true,
  dpr: 2,
};

const QUALITY_MOBILE = {
  shadowMapSize: 768,
  contactShadowRes: 384,
  envRes: 128,
  ssaoSamples: 0,
  bloomEnabled: false,
  cloudCount: 4,
  starCount: 1200,
  softShadows: false,
  dpr: 1.5,
};

function SnapshotBinder({ snapshotRef }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (!snapshotRef) return;
    snapshotRef.current = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL('image/png');
    };
    return () => {
      if (snapshotRef.current) snapshotRef.current = null;
    };
  }, [gl, scene, camera, snapshotRef]);
  return null;
}

function CameraFocuser({ focusRef, controlsRef }) {
  useFrame(() => {
    const focus = focusRef.current;
    const controls = controlsRef.current;
    if (!focus || !controls) return;
    const now = performance.now();
    const dt = Math.min(1, (now - focus.startTime) / 650);
    const ease = 1 - Math.pow(1 - dt, 3);
    controls.target.set(
      focus.fromX + (focus.toX - focus.fromX) * ease,
      4,
      focus.fromZ + (focus.toZ - focus.fromZ) * ease
    );
    controls.update();
    if (dt >= 1) focusRef.current = null;
  });
  return null;
}

export default function DesignerCanvas({
  tents, selectedTentInstanceId, items, selectedId, snapEnabled,
  lightsEnabled, theaterLightEnabled, theaterLightIntensity = 1, mode = 'day',
  onSelect, onSelectTent, onMoveLive, onMoveCommit,
  onMoveTentLive, onMoveTentCommit, onDoubleClickItem, onDoubleClickTent, snapshotRef,
}) {
  const isNight = mode === 'night';
  const [dragging, setDragging] = useState(false);
  const focusRef = useRef(null);
  const controlsRef = useRef(null);

  // Pick quality preset ONCE per mount — do NOT change it after mount or
  // Three.js will rebuild shadow maps, environment, and the post-processing
  // composer mid-render, which flashes the canvas to black on camera move.
  const quality = useMemo(() => (IS_MOBILE ? QUALITY_MOBILE : QUALITY_DESKTOP), []);

  const handleDoubleClickItem = (clickedItem) => {
    if (!controlsRef.current) return;
    focusRef.current = {
      fromX: controlsRef.current.target.x,
      fromZ: controlsRef.current.target.z,
      toX: clickedItem.x,
      toZ: clickedItem.z,
      startTime: performance.now(),
    };
    onDoubleClickItem?.(clickedItem);
  };

  const clouds = useMemo(() => {
    const all = [
      { seed: 1, position: [-40, 38, -50], scale: 2.5, volume: 10, bounds: [14, 3, 5], color: '#b8d8f0', fade: 400, opacity: 0.85 },
      { seed: 2, position: [30, 45, -60], scale: 2.2, volume: 9, bounds: [12, 3, 5], color: '#a8cfec', fade: 400, opacity: 0.82 },
      { seed: 3, position: [10, 55, 20], scale: 2.6, volume: 11, bounds: [14, 3, 5], color: '#c0deef', fade: 400, opacity: 0.82 },
      { seed: 4, position: [-25, 60, 50], scale: 2.3, volume: 9, bounds: [12, 3, 5], color: '#bcd8f0', fade: 400, opacity: 0.8 },
      { seed: 10, position: [-95, 16, -75], scale: 3.5, volume: 8, bounds: [22, 4, 6], color: '#d8e4ec', fade: 500, opacity: 0.88 },
      { seed: 11, position: [-20, 18, -110], scale: 3.8, volume: 9, bounds: [26, 4, 6], color: '#c4d8e8', fade: 500, opacity: 0.9 },
      { seed: 12, position: [75, 17, -95], scale: 3.6, volume: 8, bounds: [24, 4, 6], color: '#d4dfed', fade: 500, opacity: 0.88 },
      { seed: 13, position: [115, 20, -10], scale: 3.4, volume: 8, bounds: [22, 4, 6], color: '#e8d4c4', fade: 500, opacity: 0.9 },
      { seed: 14, position: [95, 18, 75], scale: 3.5, volume: 8, bounds: [22, 4, 6], color: '#b8d0e6', fade: 500, opacity: 0.85 },
      { seed: 15, position: [15, 22, 115], scale: 3.7, volume: 9, bounds: [24, 4, 6], color: '#a8c8e4', fade: 500, opacity: 0.82 },
      { seed: 16, position: [-80, 18, 100], scale: 3.5, volume: 8, bounds: [22, 4, 6], color: '#b0cee4', fade: 500, opacity: 0.82 },
      { seed: 17, position: [-120, 19, 25], scale: 3.6, volume: 8, bounds: [22, 4, 6], color: '#c8d8e8', fade: 500, opacity: 0.85 },
    ];
    return all.slice(0, quality.cloudCount);
  }, [quality.cloudCount]);

  return (
    <Canvas
      shadows={quality.softShadows ? 'soft' : true}
      dpr={[1, quality.dpr]}
      gl={{
        antialias: !IS_MOBILE,
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1.0,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      }}
      camera={{ position: [35, 22, 35], fov: 45, near: 0.1, far: 500 }}
      onPointerMissed={() => onSelect(null)}
    >
      <SnapshotBinder snapshotRef={snapshotRef} />
      <CameraFocuser focusRef={focusRef} controlsRef={controlsRef} />

      <SunsetSky mode={mode} />

      {isNight && (
        <Stars
          radius={220}
          depth={80}
          count={quality.starCount}
          factor={5}
          saturation={0}
          fade
          speed={0.3}
        />
      )}

      {!isNight && clouds.length > 0 && (
        <Clouds material={THREE.MeshLambertMaterial} limit={Math.max(100, clouds.length * 12)}>
          {clouds.map((c) => (
            <Cloud
              key={c.seed}
              seed={c.seed}
              position={c.position}
              scale={c.scale}
              volume={c.volume}
              bounds={c.bounds}
              color={c.color}
              fade={c.fade}
              opacity={c.opacity}
              speed={0}
            />
          ))}
        </Clouds>
      )}

      {!isNight && (
        <Environment resolution={quality.envRes} background={false} environmentIntensity={0.55}>
          <Lightformer position={[0, 12, 0]} rotation-x={-Math.PI / 2} scale={[30, 30, 1]} intensity={1.4} color="#ffffff" />
          <Lightformer position={[40, 20, 30]} rotation-y={-Math.PI / 2.5} scale={[18, 12, 1]} intensity={2.4} color="#fff5dc" />
          <Lightformer position={[-30, 6, -10]} rotation-y={Math.PI / 2.3} scale={[16, 8, 1]} intensity={0.8} color="#cce4f2" />
          <Lightformer position={[0, 8, 20]} rotation-y={Math.PI} scale={[20, 10, 1]} intensity={0.8} color="#b8d4e8" />
          <Lightformer position={[18, 4, 10]} rotation-y={-Math.PI / 2} scale={[10, 6, 1]} intensity={0.5} color="#d8e8f2" />
        </Environment>
      )}

      {isNight && (
        <Environment resolution={Math.min(quality.envRes, 128)} background={false} environmentIntensity={0.12}>
          <Lightformer position={[0, 18, 0]} rotation-x={-Math.PI / 2} scale={[30, 30, 1]} intensity={0.4} color="#3a5580" />
          <Lightformer position={[0, 6, 0]} rotation-x={-Math.PI / 2} scale={[50, 50, 1]} intensity={0.25} color="#1a2440" />
        </Environment>
      )}

      <ambientLight intensity={isNight ? 0.28 : 0.45} color={isNight ? '#6a84b0' : '#ffffff'} />
      <hemisphereLight
        args={isNight ? ['#4a6088', '#1a2238', 0.55] : ['#a4c8e4', '#6a8055', 0.7]}
      />

      <directionalLight
        position={isNight ? [-30, 55, -20] : [40, 60, 30]}
        intensity={isNight ? 0.75 : 2.4}
        color={isNight ? '#a8bcd8' : '#fff4d6'}
        castShadow
        shadow-mapSize-width={quality.shadowMapSize}
        shadow-mapSize-height={quality.shadowMapSize}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-near={0.1}
        shadow-camera-far={220}
        shadow-bias={-0.0005}
      />

      <Ground />

      {tents.map((placed) => (
        <PlacedTent
          key={placed.instanceId}
          placed={placed}
          selected={placed.instanceId === selectedTentInstanceId}
          theaterLightEnabled={theaterLightEnabled}
          theaterLightIntensity={theaterLightIntensity}
          onSelect={onSelectTent}
          onMoveLive={onMoveTentLive}
          onMoveCommit={onMoveTentCommit}
          onStartDrag={() => setDragging(true)}
          onEndDrag={() => setDragging(false)}
          onDoubleClick={onDoubleClickTent}
        />
      ))}

      {lightsEnabled && tents.map((placed) => {
        const tentLength = (placed.typeId.includes('20x60')) ? 60 :
          placed.typeId.includes('20x40') ? 40 :
          placed.typeId.includes('20x32') ? 32 : 20;
        return (
          <group key={`lights-${placed.instanceId}`} position={[placed.x, 0, placed.z]} rotation={[0, placed.rotation, 0]}>
            <StringLights width={20} length={tentLength} enabled />
          </group>
        );
      })}

      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={isNight ? 0.35 : 0.55}
        scale={160}
        blur={2.4}
        far={20}
        resolution={quality.contactShadowRes}
        color="#0a0a0a"
      />

      {items.map((item) => (
        <DraggableItem
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          onSelect={onSelect}
          onMoveLive={onMoveLive}
          onMoveCommit={onMoveCommit}
          onStartDrag={() => setDragging(true)}
          onEndDrag={() => setDragging(false)}
          onDoubleClick={handleDoubleClickItem}
          snapEnabled={snapEnabled}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        target={[0, 4, 0]}
        enabled={!dragging}
        enablePan
        enableZoom
        enableRotate
        minDistance={8}
        maxDistance={150}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minPolarAngle={0.15}
        dampingFactor={0.14}
        rotateSpeed={IS_TOUCH ? 0.4 : 0.5}
        zoomSpeed={IS_TOUCH ? 0.5 : 0.6}
        panSpeed={IS_TOUCH ? 0.6 : 0.7}
        enableDamping
      />

      {(quality.ssaoSamples > 0 || quality.bloomEnabled) && (
        <EffectComposer enableNormalPass={quality.ssaoSamples > 0} multisampling={0}>
          {quality.ssaoSamples > 0 ? (
            <SSAO
              samples={quality.ssaoSamples}
              radius={0.25}
              intensity={18}
              luminanceInfluence={0.6}
              color="#000000"
              worldDistanceThreshold={16}
              worldDistanceFalloff={0.5}
              worldProximityThreshold={6}
              worldProximityFalloff={1}
            />
          ) : null}
          {quality.bloomEnabled ? (
            <Bloom
              intensity={0.4}
              luminanceThreshold={0.96}
              luminanceSmoothing={0.25}
              mipmapBlur
            />
          ) : null}
        </EffectComposer>
      )}
    </Canvas>
  );
}
