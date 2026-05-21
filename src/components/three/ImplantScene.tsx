"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MotionValue, useTransform } from "framer-motion";
import { toothProfile } from "./ToothProfile";

type Props = { progress: MotionValue<number> };

// Gum/tissue profile — slightly larger than a tooth, rounded
function gumProfile(): THREE.Vector2[] {
  const pts: [number, number][] = [
    [0.0, 2.35],
    [0.7, 2.3],
    [1.3, 2.05],
    [1.6, 1.6],
    [1.7, 1.0],
    [1.6, 0.4],
    [1.4, -0.2],
    [1.2, -0.8],
    [1.0, -1.5],
    [0.75, -2.1],
    [0.35, -2.35],
    [0.0, -2.4],
  ];
  return pts.map(([x, y]) => new THREE.Vector2(x, y));
}

// Bone profile — slightly smaller than gum
function boneProfile(): THREE.Vector2[] {
  const pts: [number, number][] = [
    [0.0, 2.2],
    [0.55, 2.15],
    [1.08, 1.9],
    [1.38, 1.5],
    [1.45, 0.95],
    [1.35, 0.35],
    [1.15, -0.2],
    [1.0, -0.8],
    [0.82, -1.45],
    [0.55, -2.0],
    [0.25, -2.25],
    [0.0, -2.3],
  ];
  return pts.map(([x, y]) => new THREE.Vector2(x, y));
}

export function ImplantScene({ progress }: Props) {
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
      <Implant progress={progress} />
    </Canvas>
  );
}

function Implant({ progress }: { progress: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null);
  const gumRef = useRef<THREE.Mesh>(null);
  const boneRef = useRef<THREE.Mesh>(null);
  const crownRef = useRef<THREE.Mesh>(null);
  const screwGroupRef = useRef<THREE.Group>(null);
  const screwMatsRef = useRef<THREE.MeshPhysicalMaterial[] | null>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Geometries
  const gumGeom = useMemo(() => new THREE.LatheGeometry(gumProfile(), 64), []);
  const boneGeom = useMemo(() => new THREE.LatheGeometry(boneProfile(), 64), []);
  const crownGeom = useMemo(
    () => new THREE.LatheGeometry(toothProfile(0.6), 48),
    []
  );
  const screwBodyGeom = useMemo(
    () => new THREE.CylinderGeometry(0.28, 0.22, 2.4, 24),
    []
  );
  const threadGeom = useMemo(
    () => new THREE.TorusGeometry(0.32, 0.04, 8, 24),
    []
  );
  const screwTipGeom = useMemo(
    () => new THREE.ConeGeometry(0.22, 0.3, 24),
    []
  );
  const abutmentGeom = useMemo(
    () => new THREE.CylinderGeometry(0.22, 0.28, 0.35, 20),
    []
  );

  // Thread ring positions (along the screw body from -1.2 to 0.5)
  const threadRings = useMemo(() => {
    const positions: number[] = [];
    for (let y = -1.8; y <= 0.25; y += 0.28) positions.push(y);
    return positions;
  }, []);

  // Reveal logic — same timing windows as Endodontie
  const gumOpacity = useTransform(progress, [0, 0.28, 0.42], [1, 1, 0]);
  const boneOpacity = useTransform(progress, [0, 0.45, 0.62, 0.72], [1, 1, 1, 0.25]);
  const implantOpacity = useTransform(progress, [0, 0.55, 0.75], [0, 0.9, 1]);
  const crownOpacity = useTransform(progress, [0, 0.55, 0.8], [0, 0.3, 1]);
  const glowIntensity = useTransform(progress, [0.55, 0.85], [0.2, 1.3]);

  const rotY = useTransform(progress, [0, 1], [-0.35, 0.45]);
  const rotX = useTransform(progress, [0, 0.5, 1], [0.1, -0.02, 0.12]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = rotY.get() + Math.sin(t * 0.4) * 0.05;
    group.current.rotation.x = rotX.get() + Math.sin(t * 0.3) * 0.02;
    group.current.position.y = Math.sin(t * 0.5) * 0.08;

    // Gum
    if (gumRef.current) {
      const mat = gumRef.current.material as THREE.MeshPhysicalMaterial;
      const op = gumOpacity.get();
      mat.opacity = op;
      gumRef.current.visible = op > 0.01;
    }

    // Bone
    if (boneRef.current) {
      const mat = boneRef.current.material as THREE.MeshPhysicalMaterial;
      const op = boneOpacity.get();
      mat.opacity = op;
      boneRef.current.visible = op > 0.01;
    }

    // Crown
    if (crownRef.current) {
      const mat = crownRef.current.material as THREE.MeshPhysicalMaterial;
      const op = crownOpacity.get();
      mat.opacity = op;
      crownRef.current.visible = op > 0.01;
    }

    // Screw (group of metallic meshes — cached list of materials)
    if (screwGroupRef.current) {
      const op = implantOpacity.get();
      screwGroupRef.current.visible = op > 0.01;
      if (!screwMatsRef.current) {
        const mats: THREE.MeshPhysicalMaterial[] = [];
        screwGroupRef.current.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            mats.push(obj.material as THREE.MeshPhysicalMaterial);
          }
        });
        screwMatsRef.current = mats;
      }
      for (const m of screwMatsRef.current) m.opacity = op;
    }

    // Glow
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = glowIntensity.get() * 0.3;
    }
  });

  useEffect(() => {
    return () => {
      gumGeom.dispose();
      boneGeom.dispose();
      crownGeom.dispose();
      screwBodyGeom.dispose();
      threadGeom.dispose();
      screwTipGeom.dispose();
      abutmentGeom.dispose();
    };
  }, [gumGeom, boneGeom, crownGeom, screwBodyGeom, threadGeom, screwTipGeom, abutmentGeom]);

  return (
    <group ref={group} scale={0.78}>
      {/* Implant core (rendered first, inside) */}
      <group ref={screwGroupRef} renderOrder={1}>
        {/* Screw body */}
        <mesh geometry={screwBodyGeom} position={[0, -0.8, 0]}>
          <meshPhysicalMaterial
            color="#c8cdd4"
            roughness={0.25}
            metalness={0.95}
            clearcoat={0.7}
            clearcoatRoughness={0.1}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        {/* Apical cone */}
        <mesh geometry={screwTipGeom} position={[0, -2.15, 0]} rotation={[Math.PI, 0, 0]}>
          <meshPhysicalMaterial
            color="#b8bec6"
            roughness={0.3}
            metalness={0.9}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        {/* Threads */}
        {threadRings.map((y, i) => (
          <mesh
            key={i}
            geometry={threadGeom}
            position={[0, y, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshPhysicalMaterial
              color="#9fa5ad"
              roughness={0.4}
              metalness={0.85}
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
        ))}
        {/* Abutment */}
        <mesh geometry={abutmentGeom} position={[0, 0.58, 0]}>
          <meshPhysicalMaterial
            color="#d4d8dd"
            roughness={0.35}
            metalness={0.8}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Osseointegration glow */}
      <mesh ref={glowRef} renderOrder={2}>
        <sphereGeometry args={[1.6, 24, 24]} />
        <meshBasicMaterial
          color="#f2c744"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Crown (ceramic tooth on top of abutment) */}
      <mesh ref={crownRef} geometry={crownGeom} position={[0, 1.4, 0]} renderOrder={3}>
        <meshPhysicalMaterial
          color="#faf5ea"
          roughness={0.2}
          metalness={0.05}
          clearcoat={0.7}
          clearcoatRoughness={0.15}
          transmission={0.15}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bone (middle layer) */}
      <mesh ref={boneRef} geometry={boneGeom} renderOrder={4}>
        <meshPhysicalMaterial
          color="#ede4d3"
          roughness={0.75}
          metalness={0}
          sheen={0.3}
          sheenColor="#f7ecd6"
          transparent
          opacity={1}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Gum (outermost) */}
      <mesh ref={gumRef} geometry={gumGeom} renderOrder={5}>
        <meshPhysicalMaterial
          color="#e8a4a0"
          roughness={0.55}
          metalness={0}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
          sheen={0.4}
          sheenColor="#f2bcb8"
          transparent
          opacity={1}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
