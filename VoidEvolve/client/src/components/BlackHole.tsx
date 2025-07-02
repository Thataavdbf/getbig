import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useBlackHole } from "../lib/stores/useBlackHole.tsx";
import { usePowerUps } from "../lib/stores/usePowerUps";

export interface BlackHoleState {
  position: { x: number; y: number; z: number };
  size: number;
  energy: number;
  maxEnergy: number;
}

export default function BlackHole() {
  const { position, size } = useBlackHole();
  const { activePowerUps } = usePowerUps();

  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Handle power-up effects
  const hasSizeBoost = activePowerUps.some((p) => p.type === "size");
  const hasShield = activePowerUps.some((p) => p.type === "shield");

  const effectiveSize = hasSizeBoost ? size * 1.5 : size;

  // Animation loop
  useFrame((state, delta) => {
    if (!meshRef.current || !glowRef.current) return;

    // Update position
    meshRef.current.position.set(position.x, position.y, position.z);
    glowRef.current.position.set(position.x, position.y, position.z);

    // Rotate black hole
    meshRef.current.rotation.y += delta * 0.5;

    // Pulse effect
    const pulse = (Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1) || 1;
    meshRef.current.scale.set(
      effectiveSize * pulse,
      effectiveSize * pulse,
      effectiveSize * pulse
    );

    // Glow size
    glowRef.current.scale.set(
      effectiveSize * 2.5,
      effectiveSize * 2.5,
      effectiveSize * 2.5
    );
  });

  return (
    <>
      {/* Black hole core */}
      <mesh ref={meshRef} position={[position.x, position.y, position.z]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#000000"
          metalness={1}
          roughness={0}
        />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef} position={[position.x, position.y, position.z]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={hasShield ? "#2979ff" : "#9c27b0"}
          emissive={hasShield ? "#2979ff" : "#9c27b0"}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Energy indicator */}
      <mesh
        position={[position.x, position.y + effectiveSize * 2, position.z]}
        scale={[size * 0.5, 0.2, 0.2]}
      >
        <boxGeometry />
        <meshBasicMaterial color="#ffeb3b" />
      </mesh>
    </>
  );
}
