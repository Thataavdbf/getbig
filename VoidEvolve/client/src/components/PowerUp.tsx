import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PowerUpType } from '@/types';

interface PowerUpProps {
  position: [number, number, number];
  type: PowerUpType;
  size?: number;
  onCollect?: () => void;
}

export default function PowerUp({
  position,
  type,
  size = 1,
  onCollect
}: PowerUpProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Define colors for different power-up types
  const colors: Record<PowerUpType, string> = {
    speed: '#76ff03',    // Bright green
    size: '#ff3d00',     // Orange-red
    energy: '#ffea00',   // Bright yellow
    shield: '#2979ff',   // Bright blue
    magnet: '#d500f9',   // Bright purple
    time_slow: '#00e5ff' // Cyan
  };
  
  const color = colors[type] || '#ffffff';
  
  // Animate the power-up
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Hover effect
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    
    // Rotation effect
    meshRef.current.rotation.y += 0.02;
    meshRef.current.rotation.x += 0.01;
  });
  
  // Different geometries for different power-up types
  const getGeometry = () => {
    switch (type) {
      case 'speed':
        return <octahedronGeometry args={[size * 0.6, 0]} />;
      case 'size':
        return <boxGeometry args={[size * 0.8, size * 0.8, size * 0.8]} />;
      case 'energy':
        return <tetrahedronGeometry args={[size * 0.7, 0]} />;
      case 'shield':
        return <sphereGeometry args={[size * 0.6, 16, 16]} />;
      case 'magnet':
        return <torusGeometry args={[size * 0.4, size * 0.2, 16, 32]} />;
      case 'time_slow':
        return <dodecahedronGeometry args={[size * 0.6, 0]} />;
      default:
        return <sphereGeometry args={[size * 0.6, 16, 16]} />;
    }
  };
  
  return (
    <mesh 
      ref={meshRef}
      position={position}
      onClick={onCollect}
    >
      {getGeometry()}
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}