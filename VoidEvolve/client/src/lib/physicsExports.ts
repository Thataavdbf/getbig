/**
 * Export all physics functions for easy importing
 */

// Base physics
export { 
  checkCollision
} from './physics';

// Enhanced physics with objects
export {
  generateEnhancedConsumableObjects,
  checkCollision as checkEnhancedCollision
} from './enhancedPhysics';

// Adaptive physics
export {
  calculateAdaptiveDifficulty,
  generateAdaptiveConsumableObjects
} from './adaptivePhysics';

// Physics with defenses
export {
  checkDefenseCollision,
  calculateHazardDamage,
  generateDefenseShield,
  calculateDefensePositions,
  isInLineOfSight,
  calculateInterceptAngle
} from './enhancedPhysicsWithDefenses';

/**
 * Utility function to calculate velocity needed to reach a target
 */
export function calculateVelocityToTarget(
  currentPosition: { x: number, y: number, z: number },
  targetPosition: { x: number, y: number, z: number },
  speed: number
): { x: number, y: number, z: number } {
  // Calculate direction vector
  const dx = targetPosition.x - currentPosition.x;
  const dy = targetPosition.y - currentPosition.y;
  const dz = targetPosition.z - currentPosition.z;
  
  // Calculate magnitude of the direction vector
  const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  // Normalize and scale by speed
  return {
    x: (dx / magnitude) * speed,
    y: (dy / magnitude) * speed,
    z: (dz / magnitude) * speed
  };
}

/**
 * Utility function to predict position after a certain time
 */
export function predictFuturePosition(
  position: { x: number, y: number, z: number },
  velocity: { x: number, y: number, z: number },
  timeSeconds: number
): { x: number, y: number, z: number } {
  return {
    x: position.x + velocity.x * timeSeconds,
    y: position.y + velocity.y * timeSeconds,
    z: position.z + velocity.z * timeSeconds
  };
}

/**
 * Function to check if objects are in a specified area
 */
export function isInArea(
  position: { x: number, y: number, z: number },
  areaCenter: { x: number, y: number, z: number },
  areaRadius: number
): boolean {
  const dx = position.x - areaCenter.x;
  const dy = position.y - areaCenter.y;
  const dz = position.z - areaCenter.z;
  
  const distanceSquared = dx * dx + dy * dy + dz * dz;
  return distanceSquared <= areaRadius * areaRadius;
}

/**
 * Function to calculate rebound angle after collision
 */
export function calculateReboundVelocity(
  velocity: { x: number, y: number, z: number },
  normal: { x: number, y: number, z: number },
  elasticity: number = 0.8
): { x: number, y: number, z: number } {
  // Calculate dot product of velocity and normal
  const dot = velocity.x * normal.x + velocity.y * normal.y + velocity.z * normal.z;
  
  // Calculate reflection vector and apply elasticity
  return {
    x: velocity.x - (2 * dot * normal.x) * elasticity,
    y: velocity.y - (2 * dot * normal.y) * elasticity,
    z: velocity.z - (2 * dot * normal.z) * elasticity
  };
}