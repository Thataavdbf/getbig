import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEnvironment } from "../lib/stores/useEnvironment";

interface DestructionParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export default function DestructionEffects() {
  const { destructionCount, currentEnvironment } = useEnvironment();
  const particlesRef = useRef<THREE.Points>(null);
  const particles = useRef<DestructionParticle[]>([]);
  const lastDestructionCount = useRef(0);

  // Environment-specific particle colors
  const getParticleColors = () => {
    switch (currentEnvironment) {
      case "alien_planet":
        return ["#FF6B35", "#8B00FF", "#00FF7F"];
      case "cybercity":
        return ["#3742FA", "#FF4757", "#00F5FF"];
      case "ancient_ruins":
        return ["#8B4513", "#CD853F", "#A0522D"];
      case "time_vortex":
        return ["#5F27CD", "#9B59B6", "#E74C3C"];
      default:
        return ["#FF6B35", "#FF4757", "#FFA502"];
    }
  };

  // Create new particles when destruction happens
  React.useEffect(() => {
    if (destructionCount > lastDestructionCount.current) {
      const colors = getParticleColors();
      
      // Create burst of particles
      for (let i = 0; i < 12; i++) {
        const particle: DestructionParticle = {
          position: new THREE.Vector3(
            (Math.random() - 0.5) * 100,
            Math.random() * 20,
            (Math.random() - 0.5) * 100
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            Math.random() * 6 + 2,
            (Math.random() - 0.5) * 8
          ),
          life: 1.0,
          maxLife: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 0.5 + Math.random() * 1.0
        };
        particles.current.push(particle);
      }
      
      lastDestructionCount.current = destructionCount;
    }
  }, [destructionCount, currentEnvironment]);

  // Geometry and material for particles
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(300 * 3); // Max 100 particles
    const colors = new Float32Array(300 * 3);
    const sizes = new Float32Array(300);
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame((state, delta) => {
    // Update particle positions and life
    particles.current = particles.current.filter(particle => {
      particle.life -= delta * 2;
      particle.position.add(particle.velocity.clone().multiplyScalar(delta));
      particle.velocity.y -= 9.8 * delta; // Gravity
      particle.velocity.multiplyScalar(0.98); // Air resistance
      
      return particle.life > 0;
    });

    // Update geometry attributes
    if (particlesRef.current && geometry) {
      const positions = geometry.attributes.position.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;
      const sizes = geometry.attributes.size.array as Float32Array;

      particles.current.forEach((particle, i) => {
        const i3 = i * 3;
        
        // Position
        positions[i3] = particle.position.x;
        positions[i3 + 1] = particle.position.y;
        positions[i3 + 2] = particle.position.z;
        
        // Color with fade
        const color = new THREE.Color(particle.color);
        const alpha = particle.life / particle.maxLife;
        colors[i3] = color.r * alpha;
        colors[i3 + 1] = color.g * alpha;
        colors[i3 + 2] = color.b * alpha;
        
        // Size with fade
        sizes[i] = particle.size * alpha;
      });

      // Clear unused positions
      for (let i = particles.current.length; i < 100; i++) {
        const i3 = i * 3;
        positions[i3] = 0;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = 0;
        colors[i3] = 0;
        colors[i3 + 1] = 0;
        colors[i3 + 2] = 0;
        sizes[i] = 0;
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef} geometry={geometry} material={material} />
  );
}