"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MotionValue, useTransform } from "framer-motion";
import { toothProfile, canalPath } from "./ToothProfile";

type Props = {
  progress: MotionValue<number>;
};

export function ToothScene({ progress }: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 7.5], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 6, 5]} intensity={1.1} castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} color="#8ebccf" />
      <Environment preset="studio" />
      <Tooth progress={progress} />
    </Canvas>
  );
}

function Tooth({ progress }: { progress: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null);
  const enamelRef = useRef<THREE.Mesh>(null);
  const dentinRef = useRef<THREE.Mesh>(null);
  const pulpRef = useRef<THREE.Mesh>(null);
  const canalRef = useRef<THREE.Mesh>(null);

  // Geometries
  const enamelGeom = useMemo(
    () => new THREE.LatheGeometry(toothProfile(1.0), 64),
    []
  );
  const dentinGeom = useMemo(
    () => new THREE.LatheGeometry(toothProfile(0.78), 64),
    []
  );
  const pulpGeom = useMemo(
    () => new THREE.LatheGeometry(toothProfile(0.48), 48),
    []
  );

  const canalGeom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(canalPath());
    return new THREE.TubeGeometry(curve, 80, 0.07, 12, false);
  }, []);

  useEffect(() => {
    return () => {
      enamelGeom.dispose();
      dentinGeom.dispose();
      pulpGeom.dispose();
      canalGeom.dispose();
    };
  }, [enamelGeom, dentinGeom, pulpGeom, canalGeom]);

  // Scroll-driven opacities & rotation
  // progress 0..1 — broken into 3 phases
  const enamelOpacity = useTransform(progress, [0, 0.28, 0.42], [1, 1, 0]);
  const dentinOpacity = useTransform(progress, [0, 0.45, 0.62, 0.72], [1, 1, 1, 0.25]);
  const pulpOpacity = useTransform(progress, [0, 0.55, 0.75], [0.9, 0.95, 1]);
  const canalOpacity = useTransform(progress, [0, 0.55, 0.8], [0, 0.2, 1]);
  const canalEmissive = useTransform(progress, [0.55, 0.85], [0.2, 1.5]);

  const rotY = useTransform(progress, [0, 1], [-0.35, 0.45]);
  const rotX = useTransform(progress, [0, 0.5, 1], [0.1, -0.02, 0.12]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = rotY.get() + Math.sin(t * 0.4) * 0.05;
    group.current.rotation.x = rotX.get() + Math.sin(t * 0.3) * 0.02;
    group.current.position.y = Math.sin(t * 0.5) * 0.08;

    const e = enamelRef.current?.material as THREE.MeshPhysicalMaterial | undefined;
    const d = dentinRef.current?.material as THREE.MeshPhysicalMaterial | undefined;
    const p = pulpRef.current?.material as THREE.MeshPhysicalMaterial | undefined;
    const c = canalRef.current?.material as THREE.MeshStandardMaterial | undefined;

    if (e && enamelRef.current) {
      const op = enamelOpacity.get();
      e.opacity = op;
      enamelRef.current.visible = op > 0.01;
    }
    if (d && dentinRef.current) {
      const op = dentinOpacity.get();
      d.opacity = op;
      dentinRef.current.visible = op > 0.01;
    }
    if (p && pulpRef.current) {
      const op = pulpOpacity.get();
      p.opacity = op;
      pulpRef.current.visible = op > 0.01;
    }
    if (c && canalRef.current) {
      const op = canalOpacity.get();
      c.opacity = op;
      c.emissiveIntensity = canalEmissive.get();
      canalRef.current.visible = op > 0.01;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]} scale={1}>
      {/* Pulp — innermost (render first) */}
      <mesh ref={pulpRef} geometry={pulpGeom} renderOrder={1}>
        <meshPhysicalMaterial
          color="#2e7a99"
          emissive="#2e7a99"
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.2}
          transparent
          opacity={0.9}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Root canal thread — glowing core */}
      <mesh ref={canalRef} geometry={canalGeom} renderOrder={2}>
        <meshStandardMaterial
          color="#f2c744"
          emissive="#c9a227"
          emissiveIntensity={0.8}
          transparent
          depthWrite={false}
          opacity={0}
        />
      </mesh>

      {/* Dentin — middle */}
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

      {/* Enamel — outermost (render last) */}
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
    </group>
  );
}
