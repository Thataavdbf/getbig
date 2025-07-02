import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleTrailProps {
  sourcePosition: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
  intensity: number;
  trailLength?: number;
}

export default function ParticleTrail({ 
  sourcePosition, 
  velocity, 
  color, 
  intensity,
  trailLength = 20 
}: ParticleTrailProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const trailPoints = useRef<THREE.Vector3[]>([]);
  const trailOpacities = useRef<number[]>([]);

  // Create trail geometry
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(trailLength * 3);
    const colors = new Float32Array(trailLength * 3);
    const sizes = new Float32Array(trailLength);
    
    // Initialize with source position
    for (let i = 0; i < trailLength; i++) {
      const idx = i * 3;
      positions[idx] = sourcePosition.x;
      positions[idx + 1] = sourcePosition.y;
      positions[idx + 2] = sourcePosition.z;
      
      const trailColor = new THREE.Color(color);
      colors[idx] = trailColor.r;
      colors[idx + 1] = trailColor.g;
      colors[idx + 2] = trailColor.b;
      
      sizes[i] = (i / trailLength) * intensity * 2;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const mat = new THREE.PointsMaterial({
      size: 0.5,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });
    
    return { geometry: geo, material: mat };
  }, [sourcePosition, color, intensity, trailLength]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const speed = velocity.length();
    
    // Only create trail if moving fast enough
    if (speed > 0.1) {
      // Add new position to trail
      trailPoints.current.unshift(sourcePosition.clone());
      trailOpacities.current.unshift(1.0);
      
      // Limit trail length
      if (trailPoints.current.length > trailLength) {
        trailPoints.current.pop();
        trailOpacities.current.pop();
      }
      
      // Update trail positions and fade
      const positions = geometry.attributes.position;
      const sizes = geometry.attributes.size;
      
      for (let i = 0; i < trailPoints.current.length; i++) {
        const idx = i * 3;
        const point = trailPoints.current[i];
        
        positions.array[idx] = point.x;
        positions.array[idx + 1] = point.y;
        positions.array[idx + 2] = point.z;
        
        // Fade trail based on age and add speed-based stretching
        const ageRatio = i / trailLength;
        trailOpacities.current[i] *= 0.95; // Fade over time
        sizes.array[i] = (1 - ageRatio) * intensity * Math.min(speed * 2, 3);
      }
      
      positions.needsUpdate = true;
      sizes.needsUpdate = true;
      
      // Update material opacity based on speed
      material.opacity = Math.min(speed * 0.5, 1.0) * intensity;
    } else {
      // Fade existing trail when not moving
      const sizes = geometry.attributes.size;
      for (let i = 0; i < sizes.array.length; i++) {
        sizes.array[i] *= 0.9;
      }
      sizes.needsUpdate = true;
      material.opacity *= 0.9;
    }
  });

  return (
    <points ref={pointsRef}>
      <primitive object={geometry} />
      <primitive object={material} />
    </points>
  );
}
