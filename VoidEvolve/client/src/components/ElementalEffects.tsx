import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useElements } from "@/lib/stores/useElements";
import * as THREE from "three";

const ElementalEffects = () => {
  const { activeElement, elementPower } = useElements();
  const particlesRef = useRef<THREE.Points>(null!);
  
  // Track state changes safely
  const [particles, setParticles] = useState<Array<{
    position: [number, number, number];
    velocity: [number, number, number];
    size: number;
    life: number;
  }>>([]);
  
  // Memoize particle generation
  const generateParticles = useCallback(() => {
    if (!activeElement) return [];
    
    const newParticles = [];
    const count = Math.floor(10 + elementPower * 20);
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        position: [0, 0, 0],
        velocity: [
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ],
        size: Math.random() * 0.5 + 0.1,
        life: Math.random() * 0.5 + 0.5
      });
    }
    
    return newParticles;
  }, [activeElement, elementPower]);
  
  // Update particles when element changes
  useEffect(() => {
    if (activeElement) {
      setParticles(generateParticles());
    } else {
      setParticles([]);
    }
  }, [activeElement, generateParticles]);
  
  // Update particle positions safely
  useFrame((state, delta) => {
    if (particles.length === 0) return;
    
    setParticles(prevParticles => 
      prevParticles
        .map(p => ({
          ...p,
          position: [
            p.position[0] + p.velocity[0],
            p.position[1] + p.velocity[1],
            p.position[2] + p.velocity[2]
          ],
          life: p.life - delta
        }))
        .filter(p => p.life > 0)
    );
  });
  
  // Rest of component
  return null;
};

export default ElementalEffects;