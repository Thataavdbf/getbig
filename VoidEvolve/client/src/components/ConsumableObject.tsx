import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ConsumableObjectProps {
  position: THREE.Vector3;
  size: number;
  originalSize: number;
  type: 'cube' | 'sphere' | 'pyramid';
  color: string;
  material: string;
  isBeingConsumed?: boolean;
}

export default function ConsumableObject({ 
  position, 
  size, 
  originalSize, 
  type, 
  color, 
  material,
  isBeingConsumed = false 
}: ConsumableObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Calculate shrinkage percentage for effects
  const shrinkagePercent = (originalSize - size) / originalSize;
  const isShrunken = shrinkagePercent > 0.1;
  
  // Create dynamic materials based on object state and material type
  const materials = useMemo(() => {
    const baseColor = new THREE.Color(color);
    
    // Get material-specific properties
    const getMaterialProps = (matType: string) => {
      switch (matType) {
        case 'metal':
        case 'alloy':
          return { roughness: 0.1, metalness: 0.9, envMapIntensity: 2.0 };
        case 'crystal':
        case 'glass':
          return { roughness: 0.0, metalness: 0.0, transmission: 0.9, ior: 1.5 };
        case 'organic':
        case 'bio':
          return { roughness: 0.6, metalness: 0.1, envMapIntensity: 0.5 };
        case 'stone':
        case 'marble':
          return { roughness: 0.8, metalness: 0.0, envMapIntensity: 0.3 };
        case 'neon':
        case 'digital':
          return { roughness: 0.2, metalness: 0.7, envMapIntensity: 1.5 };
        case 'energy':
        case 'plasma':
        case 'temporal':
          return { roughness: 0.0, metalness: 0.0, envMapIntensity: 3.0 };
        default:
          return { roughness: 0.4, metalness: 0.3, envMapIntensity: 1.0 };
      }
    };

    const matProps = getMaterialProps(material);
    
    // Material type based on shrinkage level and base material
    if (shrinkagePercent > 0.7) {
      // Heavily shrunken - enhanced base properties with transparency
      return {
        main: new THREE.MeshPhysicalMaterial({
          color: baseColor,
          transparent: true,
          opacity: 0.6,
          roughness: Math.max(matProps.roughness * 0.3, 0.05),
          metalness: matProps.metalness,
          transmission: material.includes('crystal') || material.includes('glass') ? 0.9 : 0.5,
          ior: 1.5,
          thickness: 0.5,
          envMapIntensity: matProps.envMapIntensity * 1.5,
        }),
        glow: new THREE.MeshBasicMaterial({
          color: baseColor,
          transparent: true,
          opacity: 0.6,
        })
      };
    } else if (shrinkagePercent > 0.3) {
      // Moderately shrunken - enhanced material properties
      return {
        main: new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: matProps.roughness * 0.5,
          metalness: Math.min(matProps.metalness * 1.3, 1.0),
          envMapIntensity: matProps.envMapIntensity * 1.2,
        }),
        glow: new THREE.MeshBasicMaterial({
          color: baseColor,
          transparent: true,
          opacity: 0.4,
        })
      };
    } else if (isBeingConsumed) {
      // Being consumed - bright glowing material
      const consumeColor = baseColor.clone().lerp(new THREE.Color('#FFFFFF'), 0.5);
      return {
        main: new THREE.MeshStandardMaterial({
          color: consumeColor,
          emissive: consumeColor.clone().multiplyScalar(0.3),
          roughness: matProps.roughness * 0.7,
          metalness: matProps.metalness,
          envMapIntensity: matProps.envMapIntensity * 2.0,
        }),
        glow: new THREE.MeshBasicMaterial({
          color: '#FFFFFF',
          transparent: true,
          opacity: 0.8,
        })
      };
    } else {
      // Normal state - base material properties
      return {
        main: new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: matProps.roughness,
          metalness: matProps.metalness,
          envMapIntensity: matProps.envMapIntensity,
        }),
        glow: new THREE.MeshBasicMaterial({
          color: baseColor,
          transparent: true,
          opacity: 0.1,
        })
      };
    }
  }, [color, material, shrinkagePercent, isBeingConsumed]);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Gentle floating animation
      meshRef.current.position.y = position.y + Math.sin(time * 2 + position.x) * 0.2;
      
      // Dynamic rotation based on shrinkage
      const rotationSpeed = isShrunken ? 1.5 : 0.5;
      meshRef.current.rotation.y = time * rotationSpeed;
      meshRef.current.rotation.x = time * (rotationSpeed * 0.6);
      
      // Pulsing effect for shrunken objects
      if (isShrunken && glowRef.current) {
        const pulse = Math.sin(time * 8) * 0.3 + 0.7;
        glowRef.current.scale.setScalar(1.1 + pulse * shrinkagePercent);
        
        // Update glow opacity based on pulse
        if (materials.glow.opacity !== undefined) {
          const baseOpacity = shrinkagePercent > 0.7 ? 0.6 : 0.4;
          materials.glow.opacity = baseOpacity * pulse;
        }
      }
      
      // Color shifting when being consumed
      if (isBeingConsumed && materials.main instanceof THREE.MeshStandardMaterial) {
        const shimmer = Math.sin(time * 10) * 0.1 + 0.9;
        materials.main.emissive?.multiplyScalar(shimmer);
      }
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
    <group>
      {/* Main object */}
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        castShadow
        receiveShadow
      >
        {renderGeometry()}
        <primitive object={materials.main} />
      </mesh>
      
      {/* Glow effect for shrunken/consumed objects */}
      {(isShrunken || isBeingConsumed) && (
        <mesh
          ref={glowRef}
          position={[position.x, position.y, position.z]}
          scale={1.2}
        >
          {renderGeometry()}
          <primitive object={materials.glow} />
        </mesh>
      )}
    </group>
  );
}
