import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ConsumableObjectProps {
  position: THREE.Vector3;
  size: number;
  type: 'cube' | 'sphere' | 'pyramid';
  color: string;
}

export default function ConsumableObject({ position, size, type, color }: ConsumableObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Gentle floating animation
      meshRef.current.position.y = position.y + Math.sin(time * 2 + position.x) * 0.2;
      // Slow rotation
      meshRef.current.rotation.y = time * 0.5;
      meshRef.current.rotation.x = time * 0.3;
    }
  });

  const renderGeometry = () => {
    switch (type) {
      case 'cube':
        return <boxGeometry args={[size, size, size]} />;
      case 'sphere':
        return <sphereGeometry args={[size / 2, 8, 8]} />;
      case 'pyramid':
        return <coneGeometry args={[size / 2, size, 4]} />;
      default:
        return <boxGeometry args={[size, size, size]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      castShadow
      receiveShadow
    >
      {renderGeometry()}
      <meshBasicMaterial
        color={color}
      />
    </mesh>
  );
}
