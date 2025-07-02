import React, { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "../lib/stores/useGame";
import { useBlackHole } from "../lib/stores/useBlackHole.tsx";
import { useAudio } from "../lib/stores/useAudio";
import { useElements } from "../lib/stores/useElements.tsx";
import { useEnvironment } from "../lib/stores/useEnvironment.tsx";
import { checkCollision, generateConsumableObjects, checkEnvironmentCollision } from "../lib/physics";
import BlackHole from "./BlackHole";
import ConsumableObject from "./ConsumableObject";
import Environment from "./Environment";
import ParticleSystem from "./ParticleSystem";
import ElementalEffects from "./ElementalEffects";
import DestructionEffects from "./DestructionEffects";
import EnvironmentalHazards from "./EnvironmentalHazards";
import ExplosionEffect from "./ExplosionEffect";
import EnhancedLighting from "./EnhancedLighting";
import EnvironmentCubeMap from "./EnvironmentCubeMap";
import { ObjectPool } from "../lib/objectPool";

interface ConsumableObj {
  id: string;
  position: THREE.Vector3;
  size: number;
  originalSize: number; // Track original size for shrinking mechanic
  type: 'cube' | 'sphere' | 'pyramid';
  color: string;
  material: string; // Add material property for enhanced visuals
  points: number;
  timeNearBlackHole: number; // Track how long black hole has been near
  hasExploded: boolean; // Track if object has had its 90% explosion
}

interface ActiveExplosion {
  id: string;
  position: THREE.Vector3;
  intensity: number;
  type: 'explosion' | 'vacuum';
}

const consumablePool = new ObjectPool(() => ({
  position: new THREE.Vector3(),
  size: 1,
}), { maxSize: 50 });

function spawnConsumable() {
  const obj = consumablePool.get();
  // Set position and size dynamically
  obj.position.set(Math.random() * 10, Math.random() * 10, Math.random() * 10);
  obj.size = Math.random() * 2;
  return obj;
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
  const lastMousePosition = useRef(new THREE.Vector2());
  const movementSpeed = useRef(0);
  const turnIntensity = useRef(0);
  const consumableObjects = useRef<ConsumableObj[]>([]);
  const consumedObjects = useRef<string[]>([]);
  const explosions = useRef<ActiveExplosion[]>([]);
  const lastSpawnTime = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize consumable objects
  React.useEffect(() => {
    if (phase === "playing" && consumableObjects.current.length === 0) {
      consumableObjects.current = generateConsumableObjects(50); // Increased from 20 to 50
    }
  }, [phase]);

  // Touch and mouse movement tracking
  const updatePosition = useCallback((clientX: number, clientY: number) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mousePosition.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mousePosition.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
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

  // Clean up event listeners properly
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (phase !== "playing") return;
      updatePosition(event.clientX, event.clientY);
    };

    const handleGlobalTouchMove = (event: TouchEvent) => {
      if (phase !== "playing") return;
      event.preventDefault();
      
      if (event.touches.length > 0) {
        updatePosition(event.touches[0].clientX, event.touches[0].clientY);
      }
    };
    
    // Add listeners to document instead of canvas
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [phase, updatePosition]);

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
          
          // Graduated speed based on black hole size - start slow, get faster
          const baseSpeed = 2 + (size - 1) * 1.2; // Start at 2, increase by 1.2 per size unit
          const maxSpeed = 8; // Cap the speed
          const graduatedSpeed = Math.min(baseSpeed, maxSpeed);
          
          const sizeMultiplier = Math.max(0.4, 1 - (size - 1) * 0.02); // Gentler size penalty
          const speed = graduatedSpeed * sizeMultiplier;
          
          const newVelocity = direction.multiplyScalar(speed * delta * 6);
          setVelocity(newVelocity);
          
          const newPosition = position.clone().add(newVelocity);
          setPosition(newPosition);
        }
      }
    }

    // Calculate movement and turn intensity for dynamic camera
    const mouseDelta = mousePosition.current.clone().sub(lastMousePosition.current);
    const mouseMovement = mouseDelta.length();
    movementSpeed.current = THREE.MathUtils.lerp(movementSpeed.current, mouseMovement, 0.1);
    turnIntensity.current = THREE.MathUtils.lerp(turnIntensity.current, mouseMovement * 10, 0.15);
    lastMousePosition.current.copy(mousePosition.current);

    // Camera follow black hole with dynamic distance based on movement
    const baseCameraDistance = Math.min(size * 4, 40); // Increased for bigger objects
    const turnDistanceBoost = Math.min(turnIntensity.current * 12, 25); // More pull-back for bigger objects
    const speedDistanceBoost = Math.min(movementSpeed.current * 30, 15); // More pull-back during fast movement
    const dynamicCameraDistance = baseCameraDistance + turnDistanceBoost + speedDistanceBoost;
    
    const cameraHeight = Math.min(20 + size * 3, 60) + turnDistanceBoost * 0.5; // Higher camera for bigger objects
    
    const idealCameraPosition = new THREE.Vector3(
      position.x,
      position.y + cameraHeight,
      position.z + 18 + dynamicCameraDistance // Increased base distance for bigger objects
    );
    
    // Smoother camera movement with distance-based interpolation
    const lerpSpeed = Math.max(delta * 1.5, 0.02); // Minimum lerp speed
    camera.position.lerp(idealCameraPosition, lerpSpeed);
    camera.lookAt(position);

    // Collision detection and object shrinking mechanics
    const activeObjects = consumableObjects.current.filter(obj => 
      !consumedObjects.current.includes(obj.id)
    );

    // Update object sizes based on proximity to black hole
    activeObjects.forEach(obj => {
      const distance = position.distanceTo(obj.position);
      const proximityThreshold = Math.max(size * 12, obj.originalSize * 2); // Larger threshold for massive objects
      
      if (distance < proximityThreshold) {
        // Black hole is near - start shrinking timer (40% slower)
        obj.timeNearBlackHole += delta;
        
        // Calculate shrink rate: faster shrinking when closer and longer exposure
        const proximityFactor = 1 - (distance / proximityThreshold); // 0 to 1, higher when closer
        const timeFactor = Math.min(obj.timeNearBlackHole / 5, 1); // 0 to 1 over 5 seconds (was 3, now slower)
        const shrinkRate = proximityFactor * timeFactor * 0.48; // Max 48% shrinkage per second (was 0.8, now 40% slower)
        
        // Apply shrinking
        const shrinkAmount = obj.originalSize * shrinkRate * delta;
        obj.size = Math.max(obj.size - shrinkAmount, obj.originalSize * 0.1); // Can shrink to 10% now
        
        // Check for 90% shrinkage explosion
        const shrinkPercent = (obj.originalSize - obj.size) / obj.originalSize;
        if (shrinkPercent >= 0.9 && !obj.hasExploded) {
          obj.hasExploded = true;
          explosions.current.push({
            id: `explosion-${obj.id}`,
            position: obj.position.clone(),
            intensity: obj.originalSize * 0.1,
            type: 'explosion'
          });
        }
      } else {
        // Black hole is far - slowly restore original size
        obj.timeNearBlackHole = Math.max(0, obj.timeNearBlackHole - delta * 0.5);
        if (obj.size < obj.originalSize) {
          const restoreRate = obj.originalSize * 0.3; // Restore at 30% per second
          obj.size = Math.min(obj.size + restoreRate * delta, obj.originalSize);
        }
      }
    });

    activeObjects.forEach(obj => {
      if (checkCollision(position, size, obj.position, obj.size)) {
        // Calculate consumption efficiency based on element and shrinkage
        let consumptionMultiplier = 1;
        
        // Base consumption uses current (potentially shrunken) size, not original size
        let canConsume = size >= obj.size * 0.5; // More forgiving since objects are much bigger now
        
        // Bonus for consuming objects that have been shrunk significantly
        const shrinkage = (obj.originalSize - obj.size) / obj.originalSize;
        if (shrinkage > 0.3) { // If object has shrunk by more than 30%
          consumptionMultiplier += shrinkage * 0.5; // Bonus based on how much it shrunk
          canConsume = size >= obj.size * 0.6; // Easier to consume shrunken objects
        }
        
        // Apply elemental effects
        if (currentElement === "fire" && useElementPower(10)) {
          consumptionMultiplier *= 1.5; // Fire burns faster
          canConsume = size >= obj.size * 0.6; // Can consume smaller objects
        } else if (currentElement === "ice" && useElementPower(15)) {
          // Ice effect - object becomes easier to consume
          canConsume = size >= obj.size * 0.7;
          consumptionMultiplier *= 1.2;
        } else if (currentElement === "gravity" && useElementPower(8)) {
          // Gravity pulls objects closer, making them easier to consume
          canConsume = size >= obj.size * 0.75;
          consumptionMultiplier *= 1.3;
        }
        
        if (canConsume) {
          // Add vacuum effect when consuming
          explosions.current.push({
            id: `vacuum-${obj.id}`,
            position: obj.position.clone(),
            intensity: obj.size * 0.15,
            type: 'vacuum'
          });
          
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
    const spawnRate = currentEnvironment === "time_vortex" ? 3 : 4; // Faster spawning for larger area
    const maxObjects = currentEnvironment === "cybercity" ? 80 : 70; // Much more objects for larger area
    
    if (currentTime - lastSpawnTime.current > spawnRate && activeObjects.length < maxObjects) {
      const spawnCount = currentEnvironment === "alien_planet" ? 8 : 6; // More spawning for larger area
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
      {/* Invisible plane to capture mouse events */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={(e) => {
          if (phase !== "playing") return;
          const { x, y } = e.point;
          const newPosition = new THREE.Vector3(x, 1, y); // Keep y=1 for black hole height
          setPosition(newPosition);
        }}
        visible={false}
      >
        <planeGeometry args={[800, 800]} />
        <meshBasicMaterial />
      </mesh>
      
      <Environment />
      <EnvironmentCubeMap />
      <EnhancedLighting />
      <BlackHole />
      <ElementalEffects />
      <ParticleSystem />
      <DestructionEffects />
      <EnvironmentalHazards />
      
      {/* Render explosion effects */}
      {explosions.current.map(explosion => (
        <ExplosionEffect
          key={explosion.id}
          position={explosion.position}
          intensity={explosion.intensity}
          type={explosion.type}
          onComplete={() => {
            explosions.current = explosions.current.filter(e => e.id !== explosion.id);
          }}
        />
      ))}
      
      {activeObjects.map(obj => (
        <ConsumableObject
          key={obj.id}
          position={obj.position}
          size={obj.size}
          originalSize={obj.originalSize}
          type={obj.type}
          color={obj.color}
          material={obj.material}
          isBeingConsumed={checkCollision(position, size, obj.position, obj.size)}
        />
      ))}
    </>
  );
}
