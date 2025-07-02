import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ObstacleProps {
  position: [number, number, number];
  size?: number;
  type: string;
  rotationSpeed?: number;
  color?: string;
  destructible?: boolean;
  health?: number;
  onDestroy?: () => void;
}

export default function Obstacle({
  position,
  size = 1,
  type,
  rotationSpeed = 0.01,
  color = '#808080',
  destructible = false,
  health = 100,
  onDestroy
}: ObstacleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const healthRef = useRef(health);
  
  // Update rotation each frame
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Different rotation patterns based on type
    switch (type) {
      case 'asteroid':
        meshRef.current.rotation.x += rotationSpeed * delta;
        meshRef.current.rotation.y += rotationSpeed * 0.7 * delta;
        break;
      case 'barrier':
        meshRef.current.rotation.z += rotationSpeed * delta;
        break;
      case 'turret':
        // Turrets rotate to face player (would be implemented with player position)
        meshRef.current.rotation.y += rotationSpeed * 0.5 * delta;
        break;
      case 'mine':
        // Mines pulse slightly
        meshRef.current.scale.x = size * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
        meshRef.current.scale.y = size * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
        meshRef.current.scale.z = size * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
        break;
      default:
        // Default rotation
        meshRef.current.rotation.y += rotationSpeed * delta;
    }
  });
  
  // Handle taking damage
  const takeDamage = (amount: number) => {
    if (!destructible) return false;
    
    healthRef.current -= amount;
    
    if (healthRef.current <= 0) {
      onDestroy?.();
      return true;
    }
    
    return false;
  };
  
  // Get geometry based on obstacle type
  const getGeometry = () => {
    switch (type) {
      case 'asteroid':
        return (
          <icosahedronGeometry args={[size, 1]} />
        );
      case 'barrier':
        return (
          <boxGeometry args={[size * 4, size, size]} />
        );
      case 'turret':
        return (
          <group>
            <cylinderGeometry args={[size * 0.5, size * 0.7, size, 8]} />
            <boxGeometry args={[size * 0.3, size * 0.3, size * 1.5]} />
          </group>
        );
      case 'mine':
        return (
          <sphereGeometry args={[size, 16, 16]} />
        );
      case 'gate':
        return (
          <torusGeometry args={[size * 2, size * 0.3, 16, 32]} />
        );
      default:
        return (
          <sphereGeometry args={[size, 16, 16]} />
        );
    }
  };
  
  // Define obstacle material based on type and destructible status
  const getMaterial = () => {
    if (destructible) {
      // Show a material that can indicate damage
      const healthPercent = healthRef.current / health;
      const damageColor = new THREE.Color(color).lerp(new THREE.Color('#ff0000'), 1 - healthPercent);
      
      return (
        <meshStandardMaterial 
          color={damageColor} 
          roughness={0.7}
          metalness={0.3}
        />
      );
    }
    
    // Non-destructible obstacles can have special materials
    switch (type) {
      case 'barrier':
        return (
          <meshStandardMaterial 
            color={color} 
            transparent
            opacity={0.7}
            emissive={color}
            emissiveIntensity={0.3}
          />
        );
      case 'mine':
        return (
          <meshStandardMaterial 
            color={color}
            emissive="#ff0000"
            emissiveIntensity={0.7 + Math.sin(Date.now() * 0.005) * 0.3}
          />
        );
      default:
        return (
          <meshStandardMaterial 
            color={color} 
            roughness={0.6}
            metalness={0.4}
          />
        );
    }
  };
  
  // Add the component to the mesh instance to allow calling from outside
  React.useImperativeHandle(
    meshRef,
    () => Object.assign(meshRef.current as THREE.Mesh, { takeDamage })
  );
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
    >
      {getGeometry()}
      {getMaterial()}
    </mesh>
  );
}