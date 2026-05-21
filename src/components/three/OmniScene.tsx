"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MotionValue, useTransform } from "framer-motion";
import { toothProfile } from "./ToothProfile";

type Props = { progress: MotionValue<number> };

const ORBITERS = [
  { angle: 0, color: "#2e7a99" },
  { angle: Math.PI / 2, color: "#c9a227" },
  { angle: Math.PI, color: "#589ab6" },
  { angle: (3 * Math.PI) / 2, color: "#e8c97a" },
];

export function OmniScene({ progress }: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 7.5], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 6, 5]} intensity={1.1} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} color="#8ebccf" />
      <Environment preset="studio" />
      <Omni progress={progress} />
    </Canvas>
  );
}

function Omni({ progress }: { progress: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null);
  const enamelRef = useRef<THREE.Mesh>(null);
  const dentinRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const orbiterRefs = useRef<(THREE.Mesh | null)[]>([]);
  const lineRefs = useRef<(THREE.Mesh | null)[]>([]);
  const glowRef = useRef<THREE.Mesh>(null);

  // Tooth shells (same proportions as Endodontie)
  const enamelGeom = useMemo(() => new THREE.LatheGeometry(toothProfile(1.0), 64), []);
  const dentinGeom = useMemo(() => new THREE.LatheGeometry(toothProfile(0.78), 64), []);

  // Core: unified dossier sphere at pulp position
  const coreGeom = useMemo(() => new THREE.IcosahedronGeometry(0.55, 1), []);
  const orbiterGeom = useMemo(() => new THREE.SphereGeometry(0.18, 24, 24), []);
  const lineGeom = useMemo(
    () => new THREE.CylinderGeometry(0.012, 0.012, 1, 8),
    []
  );

  // Reveal timing matches Endodontie exactly
  const enamelOpacity = useTransform(progress, [0, 0.28, 0.42], [1, 1, 0]);
  const dentinOpacity = useTransform(progress, [0, 0.45, 0.62, 0.72], [1, 1, 1, 0.25]);
  const coreOpacity = useTransform(progress, [0, 0.55, 0.75], [0, 0.7, 1]);
  const coreEmissive = useTransform(progress, [0.55, 0.85], [0.4, 1.6]);
  const glowOpacity = useTransform(progress, [0.55, 0.85], [0, 0.4]);

  // Orbiter radius: starts wide (chaos) → narrows (organization) → into core (unified)
  const orbiterRadius = useTransform(progress, [0.1, 0.55, 0.85], [3.0, 2.0, 0.8]);
  const orbiterOpacity = useTransform(progress, [0, 0.15, 0.85, 1.0], [0, 1, 1, 0.4]);
  const lineOpacity = useTransform(progress, [0.3, 0.55, 0.85], [0, 0.5, 0.2]);

  const rotY = useTransform(progress, [0, 1], [-0.35, 0.45]);
  const rotX = useTransform(progress, [0, 0.5, 1], [0.1, -0.02, 0.12]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = rotY.get() + Math.sin(t * 0.4) * 0.05;
    group.current.rotation.x = rotX.get() + Math.sin(t * 0.3) * 0.02;
    group.current.position.y = Math.sin(t * 0.5) * 0.08;

    // Shells
    if (enamelRef.current) {
      const m = enamelRef.current.material as THREE.MeshPhysicalMaterial;
      const op = enamelOpacity.get();
      m.opacity = op;
      enamelRef.current.visible = op > 0.01;
    }
    if (dentinRef.current) {
      const m = dentinRef.current.material as THREE.MeshPhysicalMaterial;
      const op = dentinOpacity.get();
      m.opacity = op;
      dentinRef.current.visible = op > 0.01;
    }

    // Core dossier sphere
    if (coreRef.current) {
      const m = coreRef.current.material as THREE.MeshStandardMaterial;
      const op = coreOpacity.get();
      m.opacity = op;
      m.emissiveIntensity = coreEmissive.get();
      coreRef.current.visible = op > 0.01;
      coreRef.current.rotation.y = t * 0.4;
      coreRef.current.rotation.x = t * 0.25;
    }

    // Convergence glow
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = glowOpacity.get();
    }

    // Orbiters
    const radius = orbiterRadius.get();
    const orbOpacity = orbiterOpacity.get();
    const lnOpacity = lineOpacity.get();

    ORBITERS.forEach((hl, i) => {
      const mesh = orbiterRefs.current[i];
      const line = lineRefs.current[i];
      if (!mesh || !line) return;

      const a = hl.angle + t * 0.25;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      const y = Math.sin(t * 0.5 + i) * 0.3;

      mesh.position.set(x, y, z);
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = orbOpacity;
      mat.emissiveIntensity = 0.9 + Math.sin(t * 2 + i) * 0.3;
      mesh.visible = orbOpacity > 0.02;

      // Connecting line from orbiter to tooth center
      const midX = x * 0.5;
      const midY = y * 0.5;
      const midZ = z * 0.5;
      const dist = Math.sqrt(x * x + y * y + z * z);
      line.position.set(midX, midY, midZ);
      line.scale.set(1, dist, 1);
      line.lookAt(x, y, z);
      line.rotateX(Math.PI / 2);
      const lineMat = line.material as THREE.MeshBasicMaterial;
      lineMat.opacity = lnOpacity;
      line.visible = lnOpacity > 0.02;
    });
  });

  useEffect(() => {
    return () => {
      enamelGeom.dispose();
      dentinGeom.dispose();
      coreGeom.dispose();
      orbiterGeom.dispose();
      lineGeom.dispose();
    };
  }, [enamelGeom, dentinGeom, coreGeom, orbiterGeom, lineGeom]);

  return (
    <group ref={group}>
      {/* Core dossier (inner) */}
      <mesh ref={coreRef} geometry={coreGeom} renderOrder={1}>
        <meshStandardMaterial
          color="#f2c744"
          emissive="#c9a227"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.4}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Inner glow halo */}
      <mesh ref={glowRef} renderOrder={2}>
        <sphereGeometry args={[1.3, 24, 24]} />
        <meshBasicMaterial
          color="#e8c97a"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Dentin (middle) */}
      <mesh ref={dentinRef} geometry={dentinGeom} renderOrder={3}>
        <meshPhysicalMaterial
          color="#e8d9b8"
          roughness={0.55}
          metalness={0}
          transparent
          opacity={1}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Enamel (outer) */}
      <mesh ref={enamelRef} geometry={enamelGeom} renderOrder={4}>
        <meshPhysicalMaterial
          color="#f4efe6"
          roughness={0.25}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          transmission={0.1}
          transparent
          opacity={1}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Orbiters (always on top) */}
      {ORBITERS.map((hl, i) => (
        <group key={i}>
          <mesh
            ref={(el) => {
              orbiterRefs.current[i] = el;
            }}
            geometry={orbiterGeom}
            renderOrder={5}
          >
            <meshStandardMaterial
              color={hl.color}
              emissive={hl.color}
              emissiveIntensity={1}
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
          <mesh
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            geometry={lineGeom}
            renderOrder={4}
          >
            <meshBasicMaterial
              color={hl.color}
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
