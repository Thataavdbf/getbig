import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useElements } from "../lib/stores/useElements.tsx";
import * as THREE from "three";

const ElementalEffects = () => {
  const { currentElement, elementEnergy } = useElements();
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
    if (!currentElement || currentElement === "none") return [];
    
    const newParticles = [];
    const count = Math.floor(10 + elementEnergy * 0.2);
    
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
  }, [currentElement, elementEnergy]);
  
  // Update particles when element changes
  useEffect(() => {
    if (currentElement && currentElement !== "none") {
      setParticles(generateParticles());
    } else {
      setParticles([]);
    }
  }, [currentElement, generateParticles]);
  
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