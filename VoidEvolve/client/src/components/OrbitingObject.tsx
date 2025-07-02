import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OrbitingObjectProps {
  centerPosition: THREE.Vector3;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
  color: string;
  material: string;
  bonusPoints: number;
  onCollect: () => void;
}

export default function OrbitingObject({
  centerPosition,
  orbitRadius,
  orbitSpeed,
  size,
  color,
  material,
  bonusPoints,
  onCollect
}: OrbitingObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const trailPoints = useRef<THREE.Vector3[]>([]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Update orbital position
      angleRef.current += orbitSpeed * delta;
      
      const x = centerPosition.x + Math.cos(angleRef.current) * orbitRadius;
      const z = centerPosition.z + Math.sin(angleRef.current) * orbitRadius;
      const y = centerPosition.y + Math.sin(angleRef.current * 2) * 0.5; // Slight vertical wobble
      
      meshRef.current.position.set(x, y, z);
      
      // Add to trail
      trailPoints.current.push(new THREE.Vector3(x, y, z));
      if (trailPoints.current.length > 20) {
        trailPoints.current.shift();
      }
      
      // Gentle rotation
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.rotation.x += delta * 1.5;
    }
  });

  const getMaterialProps = () => {
    switch (material) {
      case 'energy':
        return {
          main: new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3,
            roughness: 0.1,
            metalness: 0.9,
          }),
          glow: new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4,
          })
        };
      case 'crystal':
        return {
          main: new THREE.MeshPhysicalMaterial({
            color: color,
            transmission: 0.8,
            opacity: 0.8,
            transparent: true,
            roughness: 0.05,
            ior: 1.5,
            thickness: 0.5,
          }),
          glow: new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
          })
        };
      default:
        return {
          main: new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.2,
            metalness: 0.8,
            envMapIntensity: 2.0,
          }),
          glow: new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
          })
        };
    }
  };

  const materials = getMaterialProps();

  return (
    <group>
      {/* Main orbiting object */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[size / 2, 16, 16]} />
        <primitive object={materials.main} />
      </mesh>
      
      {/* Glowing outer shell */}
      <mesh ref={meshRef} scale={1.2}>
        <sphereGeometry args={[size / 2, 8, 8]} />
        <primitive object={materials.glow} />
      </mesh>
      
      {/* Orbit path visualization */}
      <mesh position={centerPosition} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.1, orbitRadius + 0.1, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.1} 
        />
      </mesh>
    </group>
  );
}
