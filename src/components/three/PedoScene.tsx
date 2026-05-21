"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MotionValue, useTransform } from "framer-motion";
import { toothProfile } from "./ToothProfile";

type Props = { progress: MotionValue<number> };

export function PedoScene({ progress }: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 7.5], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 6, 5]} intensity={1.1} />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#f2c4d8" />
      <Environment preset="studio" />
      <Pedo progress={progress} />
    </Canvas>
  );
}

function Pedo({ progress }: { progress: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null);
  const milkRef = useRef<THREE.Mesh>(null);
  const permanentRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const sparklesRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Milk tooth — small, at top
  const milkGeom = useMemo(() => new THREE.LatheGeometry(toothProfile(0.52), 48), []);
  // Permanent tooth — full size
  const permanentGeom = useMemo(() => new THREE.LatheGeometry(toothProfile(1.0), 64), []);
  // Growth core — small glowing heart at pulp position of the permanent tooth
  const coreGeom = useMemo(() => new THREE.SphereGeometry(0.32, 24, 24), []);

  // Sparkle points distributed as a celebratory ring
  const sparkleGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions: number[] = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const r = 1.6 + Math.random() * 0.9;
      positions.push(
        Math.cos(a) * r,
        (Math.random() - 0.4) * 1.5,
        Math.sin(a) * r
      );
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, []);

  // Reveal timing — same 3-phase pattern as Endodontie
  // Phase 1 (outer): milk tooth visible
  // Phase 2 (middle): milk fades while permanent tooth emerges
  // Phase 3 (core): permanent tooth + glowing growth core + sparkles

  // Milk tooth — visible early, fades by end of outer phase (aligned with other scenes)
  const milkOpacity = useTransform(progress, [0, 0.28, 0.42], [1, 1, 0]);
  // Milk tooth drifts/rotates as it "falls"
  const milkY = useTransform(progress, [0, 0.28, 0.52], [1.5, 1.3, -0.5]);
  const milkX = useTransform(progress, [0, 0.28, 0.52], [0, 0, 1.4]);
  const milkRotZ = useTransform(progress, [0, 0.28, 0.52], [0, -0.1, -0.9]);

  // Permanent tooth — rises and fades in during middle phase
  const permanentOpacity = useTransform(progress, [0, 0.35, 0.58, 0.72], [0, 0, 0.8, 1]);
  const permanentY = useTransform(progress, [0, 0.35, 0.7], [-2.5, -1.2, 0]);

  // Growth core — glowing heart inside permanent tooth
  const coreOpacity = useTransform(progress, [0, 0.55, 0.75], [0, 0.5, 1]);
  const coreEmissive = useTransform(progress, [0.55, 0.9], [0.6, 1.8]);

  // Glow halo
  const glowOpacity = useTransform(progress, [0.55, 0.85], [0, 0.35]);

  // Sparkles
  const sparkleOpacity = useTransform(progress, [0.55, 0.85, 1], [0, 0.8, 0.5]);

  const rotY = useTransform(progress, [0, 1], [-0.35, 0.45]);
  const rotX = useTransform(progress, [0, 0.5, 1], [0.1, -0.02, 0.12]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = rotY.get() + Math.sin(t * 0.4) * 0.05;
    group.current.rotation.x = rotX.get() + Math.sin(t * 0.3) * 0.02;
    group.current.position.y = Math.sin(t * 0.5) * 0.08;

    // Milk tooth
    if (milkRef.current) {
      const op = milkOpacity.get();
      milkRef.current.position.x = milkX.get();
      milkRef.current.position.y = milkY.get() + Math.sin(t * 0.5) * 0.05;
      milkRef.current.rotation.z = milkRotZ.get();
      const m = milkRef.current.material as THREE.MeshPhysicalMaterial;
      m.opacity = op;
      milkRef.current.visible = op > 0.01;
    }

    // Permanent tooth
    if (permanentRef.current) {
      const op = permanentOpacity.get();
      permanentRef.current.position.y = permanentY.get();
      const m = permanentRef.current.material as THREE.MeshPhysicalMaterial;
      m.opacity = op;
      permanentRef.current.visible = op > 0.01;
    }

    // Growth core (inside permanent tooth, only visible when permanent is present)
    if (coreRef.current) {
      const op = coreOpacity.get();
      coreRef.current.position.y = permanentY.get() + 0.2;
      coreRef.current.scale.setScalar(0.9 + Math.sin(t * 1.5) * 0.1);
      const m = coreRef.current.material as THREE.MeshStandardMaterial;
      m.opacity = op;
      m.emissiveIntensity = coreEmissive.get();
      coreRef.current.visible = op > 0.01;
    }

    // Glow halo
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = glowOpacity.get();
      glowRef.current.position.y = permanentY.get() + 0.2;
    }

    // Sparkles
    if (sparklesRef.current) {
      sparklesRef.current.rotation.y = t * 0.2;
      const m = sparklesRef.current.material as THREE.PointsMaterial;
      m.opacity = sparkleOpacity.get();
      sparklesRef.current.visible = sparkleOpacity.get() > 0.02;
    }
  });

  useEffect(() => {
    return () => {
      milkGeom.dispose();
      permanentGeom.dispose();
      coreGeom.dispose();
      sparkleGeom.dispose();
    };
  }, [milkGeom, permanentGeom, coreGeom, sparkleGeom]);

  return (
    <group ref={group}>
      {/* Growth core — innermost glow */}
      <mesh ref={coreRef} geometry={coreGeom} renderOrder={1}>
        <meshStandardMaterial
          color="#f9c5d2"
          emissive="#e68aa4"
          emissiveIntensity={0.6}
          roughness={0.4}
          metalness={0.2}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Glow halo */}
      <mesh ref={glowRef} renderOrder={2}>
        <sphereGeometry args={[1.2, 24, 24]} />
        <meshBasicMaterial
          color="#f9c5d2"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Permanent tooth — middle/core reveal */}
      <mesh ref={permanentRef} geometry={permanentGeom} renderOrder={3}>
        <meshPhysicalMaterial
          color="#f4efe6"
          roughness={0.25}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          transmission={0.1}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Milk tooth — outer, fades away */}
      <mesh ref={milkRef} geometry={milkGeom} renderOrder={4}>
        <meshPhysicalMaterial
          color="#fbf6ec"
          roughness={0.3}
          metalness={0.05}
          clearcoat={0.55}
          clearcoatRoughness={0.25}
          transmission={0.12}
          transparent
          opacity={1}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sparkles */}
      <points ref={sparklesRef} geometry={sparkleGeom} renderOrder={5}>
        <pointsMaterial
          color="#f9c5d2"
          size={0.1}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
