'use client';

const HANG_HEIGHT = 56;
const HOUSING_R = 1.15;
const HOUSING_H = 2.2;

const BLACK_METAL = '#0c0c0e';
const DARK_METAL = '#1e1e22';
const TRIM_METAL = '#2f2f34';
const LENS_ON = '#ffffff';
const LENS_OFF = '#2a2826';

export default function TheaterLight({ enabled = true, intensity = 1 }) {
  const f = Math.max(0, intensity);
  return (
    <group position={[0, HANG_HEIGHT, 0]}>
      <mesh position={[-0.6, 28, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 56, 6]} />
        <meshStandardMaterial color={BLACK_METAL} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0.6, 28, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 56, 6]} />
        <meshStandardMaterial color={BLACK_METAL} metalness={0.3} roughness={0.7} />
      </mesh>

      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[2.8, 0.15, 0.22]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[-1.35, 0.05, 0]} rotation={[0, 0, Math.PI / 14]} castShadow>
        <boxGeometry args={[0.18, 2.0, 0.22]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[1.35, 0.05, 0]} rotation={[0, 0, -Math.PI / 14]} castShadow>
        <boxGeometry args={[0.18, 2.0, 0.22]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.7} roughness={0.35} />
      </mesh>

      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[HOUSING_R * 1.02, HOUSING_R * 1.02, 0.45, 28]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.65} roughness={0.5} />
      </mesh>

      <mesh position={[0, -0.55, 0]} castShadow>
        <cylinderGeometry args={[HOUSING_R, HOUSING_R, HOUSING_H, 28]} />
        <meshStandardMaterial color={BLACK_METAL} metalness={0.55} roughness={0.55} />
      </mesh>

      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={`vent-${i}`}
            position={[Math.cos(angle) * (HOUSING_R + 0.01), 0.2, Math.sin(angle) * (HOUSING_R + 0.01)]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.2, 0.55, 0.03]} />
            <meshStandardMaterial color="#050505" roughness={0.9} />
          </mesh>
        );
      })}

      <mesh position={[0, -1.68, 0]} castShadow>
        <cylinderGeometry args={[HOUSING_R + 0.12, HOUSING_R + 0.12, 0.2, 32]} />
        <meshStandardMaterial color={TRIM_METAL} metalness={0.75} roughness={0.35} />
      </mesh>

      <mesh position={[0, -1.76, 0]}>
        <cylinderGeometry args={[HOUSING_R, HOUSING_R, 0.08, 40]} />
        <meshStandardMaterial
          color={enabled ? LENS_ON : LENS_OFF}
          emissive={enabled ? LENS_ON : '#000000'}
          emissiveIntensity={enabled ? 3.5 * f : 0}
          roughness={enabled ? 0.3 : 0.6}
          metalness={enabled ? 0 : 0.2}
          toneMapped={false}
        />
      </mesh>

      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((rot, i) => {
        const tilt = 0.55;
        const offset = HOUSING_R + 0.4;
        return (
          <mesh
            key={`barn-${i}`}
            position={[Math.cos(rot) * offset, -1.6, Math.sin(rot) * offset]}
            rotation={[0, -rot, tilt]}
            castShadow
          >
            <boxGeometry args={[0.04, 1.1, 1.3]} />
            <meshStandardMaterial color={BLACK_METAL} metalness={0.5} roughness={0.6} />
          </mesh>
        );
      })}

      {enabled && f > 0 && (
        <>
          <spotLight
            position={[0, -1.5, 0]}
            angle={Math.PI * 0.28}
            penumbra={0.55}
            intensity={450 * f}
            distance={180}
            decay={1.2}
            color="#ffffff"
          />
          <pointLight
            position={[0, -1.9, 0]}
            intensity={2 * f}
            distance={7}
            decay={2}
            color="#ffffff"
          />
          <mesh position={[0, -1.8, 0]}>
            <sphereGeometry args={[2.1, 18, 18]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={Math.min(0.25, 0.08 * f)}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
