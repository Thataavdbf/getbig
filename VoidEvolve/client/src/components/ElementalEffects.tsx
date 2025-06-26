import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useElements, ElementType } from "../lib/stores/useElements";
import { useBlackHole } from "../lib/stores/useBlackHole";

interface ElementalEffectsProps {
  isActive: boolean;
}

export default function ElementalEffects({ isActive }: ElementalEffectsProps) {
  const { currentElement, elementLevel } = useElements();
  const { position, size } = useBlackHole();
  
  const fireParticlesRef = useRef<THREE.Points>(null);
  const iceParticlesRef = useRef<THREE.Points>(null);
  const gravityRingRef = useRef<THREE.Mesh>(null);

  // Generate particle systems for each element
  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  
  React.useMemo(() => {
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * size * 4;
      positions[i3 + 1] = (Math.random() - 0.5) * size * 4;
      positions[i3 + 2] = (Math.random() - 0.5) * size * 4;
      
      velocities[i3] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
    }
  }, [size]);

  useFrame((state) => {
    if (!isActive) return;
    
    const time = state.clock.elapsedTime;
    
    // Fire effect - swirling particles
    if (currentElement === "fire" && fireParticlesRef.current) {
      const positions = fireParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const angle = time * 2 + i * 0.1;
        const radius = size * (1 + Math.sin(time + i) * 0.3);
        
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = Math.sin(time * 3 + i) * size * 0.5;
        positions[i3 + 2] = Math.sin(angle) * radius;
      }
      fireParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Ice effect - crystalline formations
    if (currentElement === "ice" && iceParticlesRef.current) {
      const positions = iceParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const angle = (i / particleCount) * Math.PI * 2;
        const layer = Math.floor(i / 10);
        const radius = size * (1.5 + layer * 0.3);
        
        positions[i3] = Math.cos(angle + time * 0.5) * radius;
        positions[i3 + 1] = (layer - 2.5) * size * 0.3 + Math.sin(time * 2) * 0.1;
        positions[i3 + 2] = Math.sin(angle + time * 0.5) * radius;
      }
      iceParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Gravity effect - pulsing rings
    if (currentElement === "gravity" && gravityRingRef.current) {
      const scale = 1 + Math.sin(time * 4) * 0.2;
      gravityRingRef.current.scale.setScalar(scale);
      gravityRingRef.current.rotation.z = time;
    }
  });

  if (!isActive || currentElement === "none") return null;

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Fire Element Effects */}
      {currentElement === "fire" && (
        <>
          <points ref={fireParticlesRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={particleCount}
                array={positions}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.3}
              color="#FF4757"
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </points>
          <pointLight
            color="#FF4757"
            intensity={elementLevel * 2}
            distance={size * 8}
            decay={2}
          />
        </>
      )}

      {/* Ice Element Effects */}
      {currentElement === "ice" && (
        <>
          <points ref={iceParticlesRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={particleCount}
                array={positions}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.4}
              color="#3742FA"
              transparent
              opacity={0.9}
            />
          </points>
          <mesh>
            <ringGeometry args={[size * 2, size * 2.5, 6]} />
            <meshBasicMaterial
              color="#3742FA"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* Gravity Element Effects */}
      {currentElement === "gravity" && (
        <>
          <mesh ref={gravityRingRef}>
            <ringGeometry args={[size * 3, size * 3.5, 32]} />
            <meshBasicMaterial
              color="#5F27CD"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[size * 4, size * 4.5, 32]} />
            <meshBasicMaterial
              color="#5F27CD"
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
    </group>
  );
}