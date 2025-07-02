import * as THREE from 'three';
import { EnhancedConsumableObject, PowerUp, Vector3 } from '@/types';

export function checkCollision(
  position1: Vector3 | THREE.Vector3,
  size1: number,
  position2: Vector3 | THREE.Vector3,
  size2: number
): boolean {
  const pos1 = position1 instanceof THREE.Vector3 
    ? position1 
    : new THREE.Vector3(position1.x, position1.y, position1.z);
    
  const pos2 = position2 instanceof THREE.Vector3 
    ? position2 
    : new THREE.Vector3(position2.x, position2.y, position2.z);
    
  const distance = pos1.distanceTo(pos2);
  return distance < (size1 + size2);
}

export function generateEnhancedConsumableObjects(
  count: number,
  environment: string,
  blackHolePosition: Vector3,
  blackHoleSize: number,
  difficultyLevel: number = 1
): EnhancedConsumableObject[] {
  const objects: EnhancedConsumableObject[] = [];
  const minDistanceFromBlackHole = blackHoleSize * 5;
  
  // Base rarity chance increases with difficulty
  const rareChance = 0.05 + (difficultyLevel * 0.01);
  const powerUpChance = 0.02 + (difficultyLevel * 0.005);
  
  for (let i = 0; i < count; i++) {
    // Generate random position away from black hole
    const position = generateRandomPositionAwayFrom(blackHolePosition, minDistanceFromBlackHole, 50);
    
    // Determine if this object is rare or a power-up
    const isRare = Math.random() < rareChance;
    const isPowerUp = Math.random() < powerUpChance;
    
    // Determine behavior and other properties based on environment
    const behavior = selectBehaviorForEnvironment(environment);
    const type = selectObjectTypeForEnvironment(environment);
    const size = isRare ? 1.5 + Math.random() : 0.5 + Math.random();
    const value = isRare ? Math.floor(10 + Math.random() * 20) : Math.floor(1 + Math.random() * 5);
    
    // Create the consumable object
    const object: EnhancedConsumableObject = {
      id: `obj-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      position,
      size,
      type,
      destructible: true,
      color: getColorForObjectType(type, isRare),
      points: value,
      value,
      behavior,
      isRare,
      isPowerUp,
    };
    
    // If it's a power-up, add power-up specific properties
    if (isPowerUp) {
      object.powerUpType = selectRandomPowerUpType();
      object.color = getPowerUpColor(object.powerUpType);
    }
    
    objects.push(object);
  }
  
  return objects;
}

function generateRandomPositionAwayFrom(
  centerPosition: Vector3,
  minDistance: number,
  maxDistance: number
): Vector3 {
  let position: Vector3;
  let distance = 0;
  
  // Keep generating until we find a position far enough from center
  do {
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI * 2;
    const radius = minDistance + Math.random() * (maxDistance - minDistance);
    
    position = {
      x: centerPosition.x + radius * Math.cos(angle1) * Math.sin(angle2),
      y: centerPosition.y + radius * Math.sin(angle1) * Math.sin(angle2),
      z: centerPosition.z + radius * Math.cos(angle2)
    };
    
    // Calculate distance from center position
    const dx = position.x - centerPosition.x;
    const dy = position.y - centerPosition.y;
    const dz = position.z - centerPosition.z;
    distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  } while (distance < minDistance);
  
  return position;
}

function selectBehaviorForEnvironment(environment: string): 'static' | 'floating' | 'orbiting' | 'fleeing' {
  const behaviors: ('static' | 'floating' | 'orbiting' | 'fleeing')[] = ['static', 'floating', 'orbiting', 'fleeing'];
  const weights = {
    space: [0.4, 0.3, 0.2, 0.1],
    alien_planet: [0.3, 0.4, 0.2, 0.1],
    cybercity: [0.5, 0.1, 0.3, 0.1],
    ancient_ruins: [0.7, 0.1, 0.1, 0.1],
    time_vortex: [0.1, 0.3, 0.5, 0.1]
  };
  
  const environmentWeights = weights[environment as keyof typeof weights] || weights.space;
  
  // Select behavior based on weights
  const random = Math.random();
  let sum = 0;
  
  for (let i = 0; i < environmentWeights.length; i++) {
    sum += environmentWeights[i];
    if (random < sum) {
      return behaviors[i];
    }
  }
  
  return 'static';
}

function selectObjectTypeForEnvironment(environment: string): string {
  switch (environment) {
    case 'alien_planet':
      return ['crystal', 'alien_plant', 'meteorite', 'alien_artifact'][Math.floor(Math.random() * 4)];
    case 'cybercity':
      return ['data_cube', 'circuit', 'hologram', 'drone'][Math.floor(Math.random() * 4)];
    case 'ancient_ruins':
      return ['artifact', 'statue', 'relic', 'tablet'][Math.floor(Math.random() * 4)];
    case 'time_vortex':
      return ['clock', 'hourglass', 'time_crystal', 'paradox'][Math.floor(Math.random() * 4)];
    default: // space
      return ['asteroid', 'comet', 'star_fragment', 'space_dust'][Math.floor(Math.random() * 4)];
  }
}

function getColorForObjectType(type: string, isRare: boolean): string {
  const baseColors: Record<string, string> = {
    // Space objects
    asteroid: '#8c8c8c',
    comet: '#64b5f6',
    star_fragment: '#ffeb3b',
    space_dust: '#b39ddb',
    
    // Alien planet objects
    crystal: '#9c27b0',
    alien_plant: '#4caf50',
    meteorite: '#795548',
    alien_artifact: '#7e57c2',
    
    // Cyber city objects
    data_cube: '#00bcd4',
    circuit: '#4caf50',
    hologram: '#2196f3',
    drone: '#607d8b',
    
    // Ancient ruins objects
    artifact: '#ffc107',
    statue: '#a1887f',
    relic: '#ffeb3b',
    tablet: '#bcaaa4',
    
    // Time vortex objects
    clock: '#9e9e9e',
    hourglass: '#ffca28',
    time_crystal: '#ab47bc',
    paradox: '#e91e63'
  };
  
  const color = baseColors[type] || '#ffffff';
  
  if (isRare) {
    // Make rare objects more vibrant/glowing
    return color.replace('#', '#ff');
  }
  
  return color;
}

function selectRandomPowerUpType(): 'speed' | 'size' | 'energy' | 'shield' | 'magnet' | 'time_slow' {
  const types: ('speed' | 'size' | 'energy' | 'shield' | 'magnet' | 'time_slow')[] = [
    'speed', 'size', 'energy', 'shield', 'magnet', 'time_slow'
  ];
  
  return types[Math.floor(Math.random() * types.length)];
}

function getPowerUpColor(type: string): string {
  const colors: Record<string, string> = {
    speed: '#76ff03',    // Bright green
    size: '#ff3d00',     // Orange-red
    energy: '#ffea00',   // Bright yellow
    shield: '#2979ff',   // Bright blue
    magnet: '#d500f9',   // Bright purple
    time_slow: '#00e5ff' // Cyan
  };
  
  return colors[type] || '#ffffff';
}