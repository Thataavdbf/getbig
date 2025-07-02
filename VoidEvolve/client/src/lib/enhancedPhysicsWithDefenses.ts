import * as THREE from 'three';
import { Vector3, EnhancedConsumableObject, DefenseObject } from '@/types';

/**
 * Check collision between defense objects and hazards/enemies
 */
export function checkDefenseCollision(
  defenseObject: DefenseObject,
  hazardPosition: Vector3,
  hazardSize: number
): boolean {
  const defensePos = new THREE.Vector3(
    defenseObject.position.x,
    defenseObject.position.y,
    defenseObject.position.z
  );
  
  const hazardPos = new THREE.Vector3(
    hazardPosition.x,
    hazardPosition.y,
    hazardPosition.z
  );
  
  const distance = defensePos.distanceTo(hazardPos);
  return distance < (defenseObject.size + hazardSize);
}

/**
 * Calculate damage based on collision intensity and hazard type
 */
export function calculateHazardDamage(
  defenseObject: DefenseObject,
  hazardType: string,
  collisionVelocity: number = 1
): number {
  // Base damage depends on hazard type
  const baseDamage: Record<string, number> = {
    asteroid: 10,
    comet: 15,
    alien_plant: 5,
    data_cube: 3,
    circuit: 5,
    drone: 12,
    paradox: 20,
    // Add more hazard types as needed
  };
  
  // Get damage for this hazard type or use default
  const typeDamage = baseDamage[hazardType] || 10;
  
  // Scale damage by collision velocity
  return Math.round(typeDamage * collisionVelocity);
}

/**
 * Generate a defense shield around an object
 */
export function generateDefenseShield(
  centerPosition: Vector3,
  radius: number,
  segments: number = 12
): Array<Vector3> {
  const shieldPoints: Array<Vector3> = [];
  
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    
    shieldPoints.push({
      x: centerPosition.x + Math.cos(angle) * radius,
      y: centerPosition.y + Math.sin(angle) * radius,
      z: centerPosition.z
    });
  }
  
  return shieldPoints;
}

/**
 * Calculate optimal defense object placement
 */
export function calculateDefensePositions(
  centerPosition: Vector3,
  count: number,
  radius: number
): Array<Vector3> {
  const positions: Array<Vector3> = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    
    positions.push({
      x: centerPosition.x + Math.cos(angle) * radius,
      y: centerPosition.y + Math.sin(angle) * radius,
      z: centerPosition.z
    });
  }
  
  return positions;
}

/**
 * Determine if an object is in the line of sight between two positions
 */
export function isInLineOfSight(
  observerPosition: Vector3,
  targetPosition: Vector3,
  obstaclePosition: Vector3,
  obstacleRadius: number
): boolean {
  // Create direction vector from observer to target
  const direction = new THREE.Vector3(
    targetPosition.x - observerPosition.x,
    targetPosition.y - observerPosition.y,
    targetPosition.z - observerPosition.z
  ).normalize();
  
  // Create a ray from observer position in direction of target
  const ray = new THREE.Ray(
    new THREE.Vector3(observerPosition.x, observerPosition.y, observerPosition.z),
    direction
  );
  
  // Calculate closest point on ray to obstacle
  const closestPoint = new THREE.Vector3();
  ray.closestPointToPoint(
    new THREE.Vector3(obstaclePosition.x, obstaclePosition.y, obstaclePosition.z),
    closestPoint
  );
  
  // Calculate distance from closest point to obstacle center
  const distance = closestPoint.distanceTo(
    new THREE.Vector3(obstaclePosition.x, obstaclePosition.y, obstaclePosition.z)
  );
  
  // If distance is less than obstacle radius, the obstacle blocks the line of sight
  return distance < obstacleRadius;
}

/**
 * Calculate angle for defensive fire
 */
export function calculateInterceptAngle(
  defensePosition: Vector3,
  targetPosition: Vector3,
  targetVelocity: Vector3,
  projectileSpeed: number
): number | null {
  // Direction vector from defense to target
  const targetDirection = new THREE.Vector3(
    targetPosition.x - defensePosition.x,
    targetPosition.y - defensePosition.y,
    targetPosition.z - defensePosition.z
  );
  
  const distance = targetDirection.length();
  targetDirection.normalize();
  
  // Create target velocity vector
  const targetVelocityVector = new THREE.Vector3(
    targetVelocity.x,
    targetVelocity.y,
    targetVelocity.z
  );
  
  // Calculate time to intercept
  // This is a quadratic equation: a*t^2 + b*t + c = 0
  const a = targetVelocityVector.lengthSq() - (projectileSpeed * projectileSpeed);
  const b = 2 * targetDirection.dot(targetVelocityVector) * distance;
  const c = distance * distance;
  
  // Check if there's a solution (discriminant >= 0)
  const discriminant = b * b - 4 * a * c;
  
  if (discriminant < 0) {
    // No solution - target is moving too fast for projectile to intercept
    return null;
  }
  
  // Calculate the intercept time (positive solution)
  let interceptTime: number;
  if (Math.abs(a) < 0.0001) {
    // Linear equation when a is very small
    interceptTime = -c / b;
  } else {
    // Quadratic formula, use the smaller positive root
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    
    // Choose the smallest positive time
    if (t1 > 0 && t2 > 0) {
      interceptTime = Math.min(t1, t2);
    } else if (t1 > 0) {
      interceptTime = t1;
    } else if (t2 > 0) {
      interceptTime = t2;
    } else {
      // No positive solutions
      return null;
    }
  }
  
  // Calculate the future position of the target
  const futurePosition = new THREE.Vector3(
    targetPosition.x + targetVelocity.x * interceptTime,
    targetPosition.y + targetVelocity.y * interceptTime,
    targetPosition.z + targetVelocity.z * interceptTime
  );
  
  // Calculate direction to the future position
  const interceptDirection = new THREE.Vector3(
    futurePosition.x - defensePosition.x,
    futurePosition.y - defensePosition.y,
    futurePosition.z - defensePosition.z
  ).normalize();
  
  // Calculate the angle in the XY plane (assuming Z is up)
  const angle = Math.atan2(interceptDirection.y, interceptDirection.x);
  
  return angle;
}