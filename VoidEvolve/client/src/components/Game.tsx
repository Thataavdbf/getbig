import React, { useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "../lib/stores/useGame";
import { useBlackHole } from "../lib/stores/useBlackHole";
import { useAudio } from "../lib/stores/useAudio";
import { useElements } from "../lib/stores/useElements";
import { useEnvironment } from "../lib/stores/useEnvironment";
import { checkCollision, generateConsumableObjects, checkEnvironmentCollision } from "../lib/physics";
import BlackHole from "./BlackHole";
import ConsumableObject from "./ConsumableObject";
import Environment from "./Environment";
import ParticleSystem from "./ParticleSystem";
import ElementalEffects from "./ElementalEffects";
import DestructionEffects from "./DestructionEffects";
import EnvironmentalHazards from "./EnvironmentalHazards";

interface ConsumableObj {
  id: string;
  position: THREE.Vector3;
  size: number;
  type: 'cube' | 'sphere' | 'pyramid';
  color: string;
  points: number;
}

export default function Game() {
  const { phase } = useGame();
  const { 
    position, 
    size, 
    score, 
    velocity,
    setPosition, 
    grow, 
    addScore,
    setVelocity 
  } = useBlackHole();
  const { playHit, playSuccess } = useAudio();
  const { currentElement, elementLevel, useElementPower, rechargeEnergy } = useElements();
  const { currentEnvironment, environmentObjects, addDestruction } = useEnvironment();
  
  const cameraRef = useRef<THREE.Camera>();
  const mousePosition = useRef(new THREE.Vector2());
  const consumableObjects = useRef<ConsumableObj[]>([]);
  const consumedObjects = useRef<string[]>([]);
  const lastSpawnTime = useRef(0);

  // Initialize consumable objects
  React.useEffect(() => {
    if (phase === "playing" && consumableObjects.current.length === 0) {
      consumableObjects.current = generateConsumableObjects(20);
    }
  }, [phase]);

  // Touch and mouse movement tracking
  const updatePosition = useCallback((clientX: number, clientY: number) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mousePosition.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mousePosition.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    // Removed console.log for performance
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (phase !== "playing") return;
    event.preventDefault();
    
    if (event.touches.length > 0) {
      updatePosition(event.touches[0].clientX, event.touches[0].clientY);
    }
  }, [phase, updatePosition]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (phase !== "playing") return;
    updatePosition(event.clientX, event.clientY);
  }, [phase, updatePosition]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (phase !== "playing") return;
    updatePosition(event.clientX, event.clientY);
  }, [phase, updatePosition]);

  React.useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Add event listeners with proper types
      canvas.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
      canvas.addEventListener('mousemove', handleMouseMove as EventListener);
      canvas.addEventListener('pointermove', handlePointerMove as EventListener);
      
      return () => {
        canvas.removeEventListener('touchmove', handleTouchMove as EventListener);
        canvas.removeEventListener('mousemove', handleMouseMove as EventListener);
        canvas.removeEventListener('pointermove', handlePointerMove as EventListener);
      };
    }
  }, [handleTouchMove, handleMouseMove, handlePointerMove]);

  useFrame((state, delta) => {
    if (phase !== "playing") return;

    const camera = state.camera;
    cameraRef.current = camera;

    // Black hole movement towards mouse
    if (mousePosition.current) {
      const targetPosition = new THREE.Vector3();
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mousePosition.current, camera);
      
      // Cast ray to ground plane (y = 0)
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      
      if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
        targetPosition.copy(intersectionPoint);
        
        // Smooth movement with proper damping
        const direction = targetPosition.sub(position);
        const distance = direction.length();
        
        // Only move if we're far enough from target to avoid jittery movement
        if (distance > 0.5) {
          direction.normalize();
          const baseSpeed = 4; // Much more conservative base speed
          const sizeMultiplier = Math.max(0.4, 1 - (size - 1) * 0.05); // Gentler size scaling
          const speed = baseSpeed * sizeMultiplier;
          
          const newVelocity = direction.multiplyScalar(speed * delta * 6);
          setVelocity(newVelocity);
          
          const newPosition = position.clone().add(newVelocity);
          setPosition(newPosition);
        }
      }
    }

    // Camera follow black hole with size limits to prevent glitching
    const cameraDistance = Math.min(size * 2, 15); // Cap camera distance
    const cameraHeight = Math.min(10 + size * 1.5, 25); // Cap camera height
    
    const idealCameraPosition = new THREE.Vector3(
      position.x,
      position.y + cameraHeight,
      position.z + 8 + cameraDistance
    );
    
    // Smoother camera movement with distance-based interpolation
    const lerpSpeed = Math.max(delta * 1.5, 0.02); // Minimum lerp speed
    camera.position.lerp(idealCameraPosition, lerpSpeed);
    camera.lookAt(position);

    // Collision detection and consumption
    const activeObjects = consumableObjects.current.filter(obj => 
      !consumedObjects.current.includes(obj.id)
    );

    activeObjects.forEach(obj => {
      if (checkCollision(position, size, obj.position, obj.size)) {
        // Calculate consumption efficiency based on element
        let consumptionMultiplier = 1;
        let canConsume = size >= obj.size * 0.8;
        
        // Apply elemental effects
        if (currentElement === "fire" && useElementPower(10)) {
          consumptionMultiplier = 1.5; // Fire burns faster
          canConsume = size >= obj.size * 0.6; // Can consume smaller objects
        } else if (currentElement === "ice" && useElementPower(15)) {
          // Ice effect - object becomes easier to consume
          canConsume = size >= obj.size * 0.7;
          consumptionMultiplier = 1.2;
        } else if (currentElement === "gravity" && useElementPower(8)) {
          // Gravity pulls objects closer, making them easier to consume
          canConsume = size >= obj.size * 0.75;
          consumptionMultiplier = 1.3;
        }
        
        if (canConsume) {
          consumedObjects.current.push(obj.id);
          grow(obj.size * 0.1 * consumptionMultiplier);
          addScore(Math.floor(obj.points * consumptionMultiplier));
          playSuccess();
          
          // Add haptic feedback for mobile
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        } else {
          playHit();
          
          // Different vibration for failed consumption
          if ('vibrate' in navigator) {
            navigator.vibrate([30, 30, 30]);
          }
        }
      }
    });

    // Check collisions with environment objects
    environmentObjects.forEach((envObj, index) => {
      if (envObj.destructible && checkEnvironmentCollision(position, size, envObj)) {
        // Environment destruction gives bonus points
        const bonusPoints = currentEnvironment === "cybercity" ? 50 : 30;
        addScore(bonusPoints);
        grow(0.3); // Smaller growth from environment objects
        addDestruction();
        playHit();
        
        // Apply elemental effects to destruction
        if (currentElement === "fire" && useElementPower(10)) {
          // Fire spreads destruction to nearby objects
          environmentObjects.forEach(nearby => {
            const nearbyPos = new THREE.Vector3(...nearby.position);
            const envPos = new THREE.Vector3(...envObj.position);
            if (nearbyPos.distanceTo(envPos) < 8 && nearby.destructible) {
              addDestruction();
              addScore(15);
            }
          });
        }
      }
    });

    // Recharge element energy over time
    rechargeEnergy(delta * 20);

    // Spawn new objects periodically but limit total count - vary by environment
    const currentTime = state.clock.elapsedTime;
    const spawnRate = currentEnvironment === "time_vortex" ? 4 : 5; // Faster spawning in time vortex
    const maxObjects = currentEnvironment === "cybercity" ? 35 : 30; // More objects in dense city
    
    if (currentTime - lastSpawnTime.current > spawnRate && activeObjects.length < maxObjects) {
      const spawnCount = currentEnvironment === "alien_planet" ? 4 : 3; // More on alien world
      const newObjects = generateConsumableObjects(spawnCount, currentEnvironment);
      consumableObjects.current.push(...newObjects);
      lastSpawnTime.current = currentTime;
    }

    // End game if score reaches 1000
    if (score >= 1000) {
      useGame.getState().end();
    }
  });

  if (phase !== "playing") return null;

  const activeObjects = consumableObjects.current.filter(obj => 
    !consumedObjects.current.includes(obj.id)
  );

  return (
    <>
      <Environment />
      <BlackHole />
      <ElementalEffects isActive={currentElement !== "none"} />
      <ParticleSystem />
      <DestructionEffects />
      <EnvironmentalHazards />
      
      {activeObjects.map(obj => (
        <ConsumableObject
          key={obj.id}
          position={obj.position}
          size={obj.size}
          type={obj.type}
          color={obj.color}
        />
      ))}
    </>
  );
}
