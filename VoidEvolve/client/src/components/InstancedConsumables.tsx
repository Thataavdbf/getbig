import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EnhancedConsumableObject } from '@/types';

interface InstancedConsumablesProps {
  objects: EnhancedConsumableObject[];
  onUpdate: (updatedObjects: EnhancedConsumableObject[]) => void;
}

export default function InstancedConsumables({ objects, onUpdate }: InstancedConsumablesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Group objects by type to render in batches
  const objectsByType = useMemo(() => {
    const grouped: Record<string, EnhancedConsumableObject[]> = {};
    
    objects.forEach(obj => {
      if (!grouped[obj.type]) {
        grouped[obj.type] = [];
      }
      grouped[obj.type].push(obj);
    });
    
    return grouped;
  }, [objects]);
  
  // Update instance matrices
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Update positions, rotations, etc.
    objects.forEach((obj, i) => {
      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
      const scale = new THREE.Vector3(obj.size, obj.size, obj.size);
      
      matrix.compose(
        position,
        new THREE.Quaternion(),
        scale
      );
      
      meshRef.current?.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <>
      {Object.entries(objectsByType).map(([type, typeObjects]) => (
        <instancedMesh
          key={type}
          ref={meshRef}
          args={[undefined, undefined, typeObjects.length]}
        >
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial 
            color={typeObjects[0]?.color || "#ffffff"}
          />
        </instancedMesh>
      ))}
    </>
  );
}