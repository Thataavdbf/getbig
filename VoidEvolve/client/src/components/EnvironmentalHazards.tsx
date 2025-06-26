import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEnvironment } from "../lib/stores/useEnvironment";
import { useBlackHole } from "../lib/stores/useBlackHole";

interface Hazard {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  type: string;
  active: boolean;
}

export default function EnvironmentalHazards() {
  const { currentEnvironment } = useEnvironment();
  const { position: blackHolePos, size: blackHoleSize } = useBlackHole();
  const hazards = useRef<Hazard[]>([]);
  const lastSpawn = useRef(0);

  // Generate environment-specific hazards
  const spawnHazard = (environment: string) => {
    const hazardTypes = {
      alien_planet: {
        type: "crystal_storm",
        color: "#8B00FF",
        speed: 3,
        size: 1.5
      },
      cybercity: {
        type: "data_stream",
        color: "#00F5FF", 
        speed: 5,
        size: 0.8
      },
      ancient_ruins: {
        type: "stone_guardian",
        color: "#8B4513",
        speed: 2,
        size: 2.5
      },
      time_vortex: {
        type: "temporal_rift",
        color: "#5F27CD",
        speed: 4,
        size: 2.0
      },
      space: {
        type: "asteroid",
        color: "#696969",
        speed: 1.5,
        size: 1.8
      }
    };

    const config = hazardTypes[environment as keyof typeof hazardTypes] || hazardTypes.space;
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 40;
    
    return {
      id: `hazard-${Date.now()}-${Math.random()}`,
      position: new THREE.Vector3(
        Math.cos(angle) * distance,
        Math.random() * 10,
        Math.sin(angle) * distance
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * config.speed,
        0,
        (Math.random() - 0.5) * config.speed
      ),
      size: config.size,
      type: config.type,
      active: true
    };
  };

  // Hazard behaviors by environment
  const updateHazardBehavior = (hazard: Hazard, delta: number) => {
    switch (currentEnvironment) {
      case "alien_planet":
        // Crystal storms move in waves
        hazard.velocity.x = Math.sin(Date.now() * 0.001) * 3;
        hazard.velocity.z = Math.cos(Date.now() * 0.001) * 3;
        break;
        
      case "cybercity":
        // Data streams follow grid patterns
        hazard.velocity.x = Math.round(hazard.velocity.x / 2) * 2;
        hazard.velocity.z = Math.round(hazard.velocity.z / 2) * 2;
        break;
        
      case "ancient_ruins":
        // Stone guardians patrol in circles
        const centerDistance = hazard.position.length();
        if (centerDistance < 50) {
          const angle = Math.atan2(hazard.position.z, hazard.position.x);
          hazard.velocity.x = -Math.sin(angle) * 2;
          hazard.velocity.z = Math.cos(angle) * 2;
        }
        break;
        
      case "time_vortex":
        // Temporal rifts teleport randomly
        if (Math.random() < 0.001) {
          hazard.position.set(
            (Math.random() - 0.5) * 80,
            Math.random() * 15,
            (Math.random() - 0.5) * 80
          );
        }
        break;
    }
  };

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Spawn hazards periodically
    if (time - lastSpawn.current > 8 && hazards.current.length < 6) {
      hazards.current.push(spawnHazard(currentEnvironment));
      lastSpawn.current = time;
    }

    // Update hazard positions and behaviors
    hazards.current.forEach(hazard => {
      if (!hazard.active) return;
      
      updateHazardBehavior(hazard, delta);
      hazard.position.add(hazard.velocity.clone().multiplyScalar(delta));
      
      // Remove hazards that are too far
      if (hazard.position.length() > 120) {
        hazard.active = false;
      }
      
      // Check collision with black hole (hazards damage the player)
      const distance = hazard.position.distanceTo(blackHolePos);
      if (distance < (hazard.size + blackHoleSize * 0.5)) {
        // Different hazard effects by environment
        switch (currentEnvironment) {
          case "alien_planet":
            // Crystal storms slow down the black hole
            useBlackHole.getState().setVelocity(
              useBlackHole.getState().velocity.multiplyScalar(0.7)
            );
            break;
            
          case "cybercity":
            // Data streams cause temporary size reduction
            useBlackHole.getState().grow(-0.2);
            break;
            
          case "time_vortex":
            // Temporal rifts cause score reduction
            useBlackHole.getState().addScore(-25);
            break;
        }
        
        hazard.active = false;
        
        // Haptic feedback for hazard collision
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    });

    // Clean up inactive hazards
    hazards.current = hazards.current.filter(h => h.active);
  });

  const renderHazard = (hazard: Hazard, index: number) => {
    const getHazardGeometry = () => {
      switch (hazard.type) {
        case "crystal_storm":
          return <octahedronGeometry args={[hazard.size]} />;
        case "data_stream":
          return <boxGeometry args={[0.5, 3, 0.5]} />;
        case "stone_guardian":
          return <dodecahedronGeometry args={[hazard.size]} />;
        case "temporal_rift":
          return <torusGeometry args={[hazard.size, 0.3, 8, 16]} />;
        default:
          return <sphereGeometry args={[hazard.size]} />;
      }
    };

    const getHazardColor = () => {
      const colors = {
        crystal_storm: "#8B00FF",
        data_stream: "#00F5FF",
        stone_guardian: "#8B4513", 
        temporal_rift: "#5F27CD",
        asteroid: "#696969"
      };
      return colors[hazard.type as keyof typeof colors] || "#FF4757";
    };

    return (
      <mesh
        key={hazard.id}
        position={hazard.position}
        rotation={[
          Date.now() * 0.001,
          Date.now() * 0.0015,
          Date.now() * 0.0008
        ]}
      >
        {getHazardGeometry()}
        <meshBasicMaterial
          color={getHazardColor()}
          transparent
          opacity={0.8}
          wireframe={hazard.type === "temporal_rift"}
        />
      </mesh>
    );
  };

  if (currentEnvironment === "space") {
    return null; // Space has no special hazards
  }

  return (
    <>
      {hazards.current.map((hazard, index) => 
        hazard.active ? renderHazard(hazard, index) : null
      )}
    </>
  );
}