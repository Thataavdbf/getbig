import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBlackHole } from "../lib/stores/useBlackHole";

export default function BlackHole() {
  const { position, size } = useBlackHole();
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Rotate the black hole
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 2;
      meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
    }
    
    // Rotate rings in opposite directions
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y = -time * 3;
      innerRingRef.current.rotation.z = Math.sin(time) * 0.05;
    }
    
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = time * 1.5;
      outerRingRef.current.rotation.z = Math.cos(time * 0.7) * 0.03;
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Main black hole sphere */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#1A0B2E"
          emissiveIntensity={0.3}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Inner accretion ring */}
      <mesh ref={innerRingRef} position={[0, 0.1, 0]}>
        <ringGeometry args={[size * 1.2, size * 1.8, 32]} />
        <meshStandardMaterial
          color="#FF6B35"
          emissive="#FF6B35"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Outer energy ring */}
      <mesh ref={outerRingRef} position={[0, -0.1, 0]}>
        <ringGeometry args={[size * 2, size * 2.5, 32]} />
        <meshStandardMaterial
          color="#00F5FF"
          emissive="#00F5FF"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Gravitational distortion effect */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[size * 3, 16, 16]} />
        <meshStandardMaterial
          color="#1A0B2E"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
      
      {/* Point light for glow effect */}
      <pointLight
        color="#00F5FF"
        intensity={size * 0.5}
        distance={size * 10}
        decay={2}
      />
    </group>
  );
}
