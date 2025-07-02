import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ExplosionEffectProps {
  position: THREE.Vector3;
  intensity: number;
  onComplete: () => void;
  type: 'explosion' | 'vacuum';
}

export default function ExplosionEffect({ position, intensity, onComplete, type }: ExplosionEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points[]>([]);
  const timeRef = useRef(0);
  const duration = type === 'explosion' ? 1.5 : 2.0; // Vacuum effect lasts longer

  useEffect(() => {
    if (!groupRef.current) return;

    // Create multiple particle systems for dramatic effect
    const particleCount = type === 'explosion' ? 100 : 150;
    const systems = type === 'explosion' ? 3 : 2;

    for (let s = 0; s < systems; s++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        
        // Starting positions
        positions[idx] = position.x + (Math.random() - 0.5) * 2;
        positions[idx + 1] = position.y + (Math.random() - 0.5) * 2;
        positions[idx + 2] = position.z + (Math.random() - 0.5) * 2;

        if (type === 'explosion') {
          // Explosion - particles move outward
          const speed = 10 + Math.random() * 20;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          
          velocities[idx] = Math.sin(phi) * Math.cos(theta) * speed;
          velocities[idx + 1] = Math.cos(phi) * speed;
          velocities[idx + 2] = Math.sin(phi) * Math.sin(theta) * speed;

          // Explosion colors (orange/red/yellow)
          colors[idx] = 1.0; // R
          colors[idx + 1] = 0.3 + Math.random() * 0.7; // G
          colors[idx + 2] = 0.0; // B
        } else {
          // Vacuum - particles move inward
          const speed = 15 + Math.random() * 25;
          const dx = position.x - positions[idx];
          const dy = position.y - positions[idx + 1];
          const dz = position.z - positions[idx + 2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          velocities[idx] = (dx / distance) * speed;
          velocities[idx + 1] = (dy / distance) * speed;
          velocities[idx + 2] = (dz / distance) * speed;

          // Vacuum colors (blue/cyan/white)
          colors[idx] = 0.0; // R
          colors[idx + 1] = 0.5 + Math.random() * 0.5; // G
          colors[idx + 2] = 1.0; // B
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: intensity * 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
      });

      const points = new THREE.Points(geometry, material);
      groupRef.current.add(points);
      particlesRef.current.push(points);
    }
  }, [position, intensity, type]);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const progress = timeRef.current / duration;

    if (progress >= 1.0) {
      onComplete();
      return;
    }

    particlesRef.current.forEach(points => {
      const geometry = points.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const velocities = geometry.attributes.velocity.array as Float32Array;
      const material = points.material as THREE.PointsMaterial;

      // Update particle positions
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * delta;
        positions[i + 1] += velocities[i + 1] * delta;
        positions[i + 2] += velocities[i + 2] * delta;

        if (type === 'vacuum') {
          // Add some gravity effect for vacuum
          velocities[i] *= 1.1;
          velocities[i + 1] *= 1.1;
          velocities[i + 2] *= 1.1;
        }
      }

      geometry.attributes.position.needsUpdate = true;

      // Fade out over time
      if (type === 'explosion') {
        material.opacity = 1.0 - progress;
        material.size = intensity * 0.5 * (1.0 + progress * 2);
      } else {
        material.opacity = Math.max(0, 1.0 - progress * 1.5);
        material.size = intensity * 0.3 * (2.0 - progress);
      }
    });
  });

  return <group ref={groupRef} />;
}
