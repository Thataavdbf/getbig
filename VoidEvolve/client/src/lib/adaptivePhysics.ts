import * as THREE from 'three';
import { Vector3, EnhancedConsumableObject } from '@/types';
import { useDifficulty } from './stores/useDifficulty';

/**
 * Adaptive physics system that adjusts based on player performance
 */
export function calculateAdaptiveDifficulty(
  score: number,
  timeElapsed: number,
  consumptionRate: number
): number {
  // Base difficulty is 5 (middle of 1-10 scale)
  let adaptiveLevel = 5;
  
  // Calculate expected score based on time elapsed
  const expectedScorePerMinute = 500; // baseline
  const expectedScore = (expectedScorePerMinute * timeElapsed) / 60;
  
  // Adjust difficulty based on score relative to expected
  if (score > expectedScore * 1.5) {
    // Player is doing very well, increase difficulty significantly
    adaptiveLevel = Math.min(10, adaptiveLevel + 2);
  } else if (score > expectedScore * 1.2) {
    // Player is doing well, increase difficulty
    adaptiveLevel = Math.min(10, adaptiveLevel + 1);
  } else if (score < expectedScore * 0.5) {
    // Player is struggling, decrease difficulty significantly
    adaptiveLevel = Math.max(1, adaptiveLevel - 2);
  } else if (score < expectedScore * 0.8) {
    // Player is behind, decrease difficulty
    adaptiveLevel = Math.max(1, adaptiveLevel - 1);
  }
  
  // Adjust based on consumption rate (objects consumed per second)
  const expectedConsumptionRate = 1; // baseline
  if (consumptionRate > expectedConsumptionRate * 1.5) {
    adaptiveLevel = Math.min(10, adaptiveLevel + 1);
  } else if (consumptionRate < expectedConsumptionRate * 0.5) {
    adaptiveLevel = Math.max(1, adaptiveLevel - 1);
  }
  
  return adaptiveLevel;
}

/**
 * Generate consumable objects with difficulty-adjusted properties
 */
export function generateAdaptiveConsumableObjects(
  count: number,
  environment: string,
  blackHolePosition: Vector3,
  blackHoleSize: number
): EnhancedConsumableObject[] {
  // Get the current difficulty settings
  const difficultySettings = useDifficulty.getState().settings;
  const difficultyMultiplier = useDifficulty.getState().getDifficultyMultiplier();
  
  const objects: EnhancedConsumableObject[] = [];
  const minDistanceFromBlackHole = blackHoleSize * 5;
  
  // Adjust spawn parameters based on difficulty
  const rareChance = 0.05 * difficultyMultiplier;
  const powerUpChance = Math.max(0.01, 0.05 / difficultyMultiplier); // Inverse - harder gets fewer powerups
  
  for (let i = 0; i < count; i++) {
    // Generate position away from black hole
    const angle = Math.random() * Math.PI * 2;
    const distance = minDistanceFromBlackHole + Math.random() * 30;
    
    const position = {
      x: blackHolePosition.x + Math.cos(angle) * distance,
      y: blackHolePosition.y + Math.sin(angle) * distance,
      z: blackHolePosition.z
    };
    
    // Determine object properties based on difficulty
    const isRare = Math.random() < rareChance;
    const isPowerUp = Math.random() < powerUpChance;
    
    // Adjust size based on difficulty (smaller objects at higher difficulty)
    const baseSize = isRare ? 1.5 : 0.8;
    const sizeVariation = isRare ? 0.5 : 0.3;
    const size = baseSize * (1 - 0.3 * (difficultyMultiplier - 1)) + Math.random() * sizeVariation;
    
    // Adjust value based on difficulty
    const baseValue = isRare ? 15 : 5;
    const value = Math.round(baseValue * (0.8 + 0.4 * difficultyMultiplier));
    
    // Determine behavior with difficulty-adjusted probabilities
    const behaviors: Array<'static' | 'floating' | 'orbiting' | 'fleeing'> = ['static', 'floating', 'orbiting', 'fleeing'];
    
    // Higher difficulty increases chances of more dynamic behaviors
    const behaviorWeights = [
      0.7 - (difficultyMultiplier * 0.05), // static - less common at higher difficulties
      0.1 + (difficultyMultiplier * 0.02), // floating - slightly more common
      0.1 + (difficultyMultiplier * 0.01), // orbiting - slightly more common
      0.1 + (difficultyMultiplier * 0.02)  // fleeing - more common at higher difficulties
    ];
    
    // Select behavior based on weights
    const behaviorRoll = Math.random();
    let behaviorIndex = 0;
    let cumulativeWeight = 0;
    
    for (let j = 0; j < behaviorWeights.length; j++) {
      cumulativeWeight += behaviorWeights[j];
      if (behaviorRoll <= cumulativeWeight) {
        behaviorIndex = j;
        break;
      }
    }
    
    const behavior = behaviors[behaviorIndex];
    
    // Determine object type based on environment
    const type = getObjectTypeForEnvironment(environment);
    
    // Create the object
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
      isPowerUp
    };
    
    // Add power-up specific properties
    if (isPowerUp) {
      object.powerUpType = getRandomPowerUpType();
      object.color = getPowerUpColor(object.powerUpType);
    }
    
    objects.push(object);
  }
  
  return objects;
}

// Helper functions
function getObjectTypeForEnvironment(environment: string): string {
  const environmentObjects: Record<string, string[]> = {
    space: ['asteroid', 'comet', 'star_fragment', 'space_dust'],
    alien_planet: ['crystal', 'alien_plant', 'meteorite', 'alien_artifact'],
    cybercity: ['data_cube', 'circuit', 'hologram', 'drone'],
    ancient_ruins: ['artifact', 'statue', 'relic', 'tablet'],
    time_vortex: ['clock', 'hourglass', 'time_crystal', 'paradox']
  };
  
  const objectTypes = environmentObjects[environment] || environmentObjects.space;
  return objectTypes[Math.floor(Math.random() * objectTypes.length)];
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

function getRandomPowerUpType(): 'speed' | 'size' | 'energy' | 'shield' | 'magnet' | 'time_slow' {
  const types: ('speed' | 'size' | 'energy' | 'shield' | 'magnet' | 'time_slow')[] = [
    'speed', 'size', 'energy', 'shield', 'magnet', 'time_slow'
  ];
  
  return types[Math.floor(Math.random() * types.length)];
}

function getPowerUpColor(type?: string): string {
  const colors: Record<string, string> = {
    speed: '#76ff03',    // Bright green
    size: '#ff3d00',     // Orange-red
    energy: '#ffea00',   // Bright yellow
    shield: '#2979ff',   // Bright blue
    magnet: '#d500f9',   // Bright purple
    time_slow: '#00e5ff' // Cyan
  };
  
  return colors[type || ''] || '#ffffff';
}