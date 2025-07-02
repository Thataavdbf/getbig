import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type HazardType = 'asteroid' | 'solar_flare' | 'wormhole' | 'gravity_well' | 'nebula';

interface MovingHazardProps {
  position: THREE.Vector3;
  type: HazardType;
  size: number;
  velocity: THREE.Vector3;
  onPlayerCollision: (position: THREE.Vector3, type: HazardType) => void;
}

export default function MovingHazard({ 
  position, 
  type, 
  size, 
  velocity,
  onPlayerCollision 
}: MovingHazardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const currentPosition = useRef(position.clone());

  const getHazardConfig = () => {
    switch (type) {
      case 'asteroid':
        return {
          color: '#8B4513',
          emissive: '#2D1810',
          geometry: 'dodecahedron',
          particles: 20,
          particleColor: '#CD853F',
          effect: 'Damages black hole',
          dangerous: true
        };
      case 'solar_flare':
        return {
          color: '#FF4500',
          emissive: '#FF6347',
          geometry: 'cone',
          particles: 50,
          particleColor: '#FFA500',
          effect: 'Speed boost but scatters objects',
          dangerous: false
        };
      case 'wormhole':
        return {
          color: '#4B0082',
          emissive: '#8A2BE2',
          geometry: 'torus',
          particles: 30,
          particleColor: '#9370DB',
          effect: 'Teleports to random location',
          dangerous: false
        };
      case 'gravity_well':
        return {
          color: '#191970',
          emissive: '#000080',
          geometry: 'sphere',
          particles: 40,
          particleColor: '#4169E1',
          effect: 'Pulls objects together',
          dangerous: false
        };
      case 'nebula':
        return {
          color: '#FF69B4',
          emissive: '#FF1493',
          geometry: 'cloud',
          particles: 60,
          particleColor: '#FFB6C1',
          effect: 'Reduces visibility but hides bonuses',
          dangerous: false
        };
    }
  };

  const config = getHazardConfig();

  // Create particle system for hazard effects
  React.useMemo(() => {
    if (particlesRef.current) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(config.particles * 3);
      const colors = new Float32Array(config.particles * 3);
      const velocities = new Float32Array(config.particles * 3);
      
      for (let i = 0; i < config.particles; i++) {
        const idx = i * 3;
        
        // Random positions around hazard
        positions[idx] = (Math.random() - 0.5) * size * 2;
        positions[idx + 1] = (Math.random() - 0.5) * size * 2;
        positions[idx + 2] = (Math.random() - 0.5) * size * 2;
        
        // Random velocities
        velocities[idx] = (Math.random() - 0.5) * 2;
        velocities[idx + 1] = (Math.random() - 0.5) * 2;
        velocities[idx + 2] = (Math.random() - 0.5) * 2;
        
        const color = new THREE.Color(config.particleColor);
        colors[idx] = color.r;
        colors[idx + 1] = color.g;
        colors[idx + 2] = color.b;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    }
  }, [config.particles, config.particleColor, size]);

  const getGeometry = () => {
    switch (config.geometry) {
      case 'dodecahedron':
        return <dodecahedronGeometry args={[size, 0]} />;
      case 'cone':
        return <coneGeometry args={[size, size * 2, 8]} />;
      case 'torus':
        return <torusGeometry args={[size, size * 0.3, 16, 32]} />;
      case 'sphere':
        return <sphereGeometry args={[size, 16, 16]} />;
      case 'cloud':
        return <sphereGeometry args={[size * 1.5, 8, 8]} />;
      default:
        return <boxGeometry args={[size, size, size]} />;
    }
  };

  useFrame((state, delta) => {
    if (meshRef.current && particlesRef.current) {
      const time = state.clock.elapsedTime;
      
      // Move hazard
      currentPosition.current.add(velocity.clone().multiplyScalar(delta));
      meshRef.current.position.copy(currentPosition.current);
      
      // Wrap around play area
      if (currentPosition.current.x > 300) currentPosition.current.x = -300;
      if (currentPosition.current.x < -300) currentPosition.current.x = 300;
      if (currentPosition.current.z > 300) currentPosition.current.z = -300;
      if (currentPosition.current.z < -300) currentPosition.current.z = 300;
      
      // Type-specific animations
      switch (type) {
        case 'asteroid':
          meshRef.current.rotation.x += delta * 0.5;
          meshRef.current.rotation.y += delta * 0.3;
          break;
        case 'solar_flare':
          meshRef.current.rotation.z += delta * 2;
          meshRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.2);
          break;
        case 'wormhole':
          meshRef.current.rotation.y += delta * 1.5;
          meshRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.1);
          break;
        case 'gravity_well':
          const pulse = Math.sin(time * 2) * 0.3 + 1;
          meshRef.current.scale.setScalar(pulse);
          break;
        case 'nebula':
          meshRef.current.rotation.x += delta * 0.1;
          meshRef.current.rotation.y += delta * 0.15;
          meshRef.current.rotation.z += delta * 0.05;
          break;
      }
      
      // Animate particles
      const positions = particlesRef.current.geometry.attributes.position;
      const velocities = particlesRef.current.geometry.attributes.velocity;
      
      for (let i = 0; i < config.particles; i++) {
        const idx = i * 3;
        
        // Update particle positions
        positions.array[idx] += velocities.array[idx] * delta;
        positions.array[idx + 1] += velocities.array[idx + 1] * delta;
        positions.array[idx + 2] += velocities.array[idx + 2] * delta;
        
        // Reset particles that go too far
        const distance = Math.sqrt(
          positions.array[idx] ** 2 + 
          positions.array[idx + 1] ** 2 + 
          positions.array[idx + 2] ** 2
        );
        
        if (distance > size * 3) {
          positions.array[idx] = (Math.random() - 0.5) * size;
          positions.array[idx + 1] = (Math.random() - 0.5) * size;
          positions.array[idx + 2] = (Math.random() - 0.5) * size;
        }
      }
      
      positions.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Main hazard mesh */}
      <mesh 
        ref={meshRef} 
        castShadow 
        receiveShadow
        onClick={() => onPlayerCollision(currentPosition.current, type)}
      >
        {getGeometry()}
        <meshStandardMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={0.3}
          roughness={0.7}
          metalness={0.3}
          transparent={type === 'nebula'}
          opacity={type === 'nebula' ? 0.6 : 1.0}
        />
      </mesh>
      
      {/* Particle effects */}
      <points ref={particlesRef}>
        <bufferGeometry />
        <pointsMaterial
          size={0.2}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Warning glow for dangerous hazards */}
      {config.dangerous && (
        <mesh scale={1.5}>
          {getGeometry()}
          <meshBasicMaterial
            color="#FF0000"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}
