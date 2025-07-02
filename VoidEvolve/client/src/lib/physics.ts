import * as THREE from "three";

// AABB collision detection
export function checkCollision(
  pos1: THREE.Vector3,
  size1: number,
  pos2: THREE.Vector3,
  size2: number
): boolean {
  const distance = pos1.distanceTo(pos2);
  const combinedRadius = (size1 + size2) * 0.5;
  return distance < combinedRadius;
}

// Generate random consumable objects with environment variations
export function generateConsumableObjects(count: number, environment: string = "space") {
  const objects = [];
  
  // Base type for all environment configs
  type ObjectType = 'cube' | 'sphere' | 'pyramid';
  
  // Environment-specific configurations with material properties
  const getEnvironmentConfig = (env: string) => {
    switch (env) {
      case 'alien_planet':
        return {
          types: ['sphere', 'pyramid'] as ObjectType[],
          colors: ['#FF6B35', '#8B00FF', '#00FF7F'],
          materials: ['organic', 'crystal', 'bio'],
          sizeRange: [9.0, 24.0], // 2x smaller: was 18.0-48.0, now 9.0-24.0
          heightRange: [0.5, 4]
        };
      case 'cybercity':
        return {
          types: ['cube', 'pyramid'] as ObjectType[],
          colors: ['#3742FA', '#FF4757', '#00F5FF'],
          materials: ['metal', 'neon', 'digital'],
          sizeRange: [7.5, 18.0], // 2x smaller: was 15.0-36.0, now 7.5-18.0
          heightRange: [2, 8]
        };
      case 'ancient_ruins':
        return {
          types: ['cube', 'sphere'] as ObjectType[],
          colors: ['#8B4513', '#CD853F', '#A0522D'],
          materials: ['stone', 'marble', 'ancient'],
          sizeRange: [8.4, 21.0], // 2x smaller: was 16.8-42.0, now 8.4-21.0
          heightRange: [0.5, 2]
        };
      case 'time_vortex':
        return {
          types: ['sphere', 'pyramid'] as ObjectType[],
          colors: ['#5F27CD', '#9B59B6', '#E74C3C'],
          materials: ['energy', 'plasma', 'temporal'],
          sizeRange: [6.0, 15.0], // 2x smaller: was 12.0-30.0, now 6.0-15.0
          heightRange: [0.5, 15]
        };
      default: // space
        return {
          types: ['cube', 'sphere', 'pyramid'] as ObjectType[],
          colors: ['#FF6B35', '#00F5FF', '#5F27CD', '#FF4757'],
          materials: ['metal', 'crystal', 'alloy'],
          sizeRange: [6.0, 18.0], // 2x smaller: was 12.0-36.0, now 6.0-18.0
          heightRange: [0.5, 3]
        };
    }
  };
  
  const config = getEnvironmentConfig(environment);
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 37.5 + Math.random() * 225; // 50% farther: was 25-175, now 37.5-262.5
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = config.heightRange[0] + Math.random() * (config.heightRange[1] - config.heightRange[0]);
    
    const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
    const type = config.types[Math.floor(Math.random() * config.types.length)];
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    const material = config.materials[Math.floor(Math.random() * config.materials.length)];
    
    objects.push({
      id: `obj-${Date.now()}-${i}`,
      position: new THREE.Vector3(x, y, z),
      size,
      originalSize: size, // Store original size for shrinking mechanic
      type,
      color,
      material, // Add material property for enhanced visuals
      points: Math.floor(size * 10),
      timeNearBlackHole: 0, // Initialize proximity timer
      hasExploded: false // Initialize explosion flag
    });
  }
  
  return objects;
}

// Calculate object attraction towards black hole (for future gravity effects)
export function calculateAttraction(
  objectPos: THREE.Vector3,
  blackHolePos: THREE.Vector3,
  blackHoleSize: number,
  objectMass: number = 1
): THREE.Vector3 {
  const direction = blackHolePos.clone().sub(objectPos);
  const distance = direction.length();
  
  if (distance === 0) return new THREE.Vector3(0, 0, 0);
  
  direction.normalize();
  
  // Simple gravity-like force
  const force = (blackHoleSize * objectMass) / (distance * distance);
  return direction.multiplyScalar(Math.min(force, 0.1)); // Cap the force
}

// Check collision with environment objects
export function checkEnvironmentCollision(
  blackHolePos: THREE.Vector3,
  blackHoleSize: number,
  envObject: {position: [number, number, number]} // Properly type the envObject parameter
): boolean {
  // Create a proper Vector3 from array
  const envPos = new THREE.Vector3(
    envObject.position[0],
    envObject.position[1],
    envObject.position[2]
  );
  const distance = blackHolePos.distanceTo(envPos);
  return distance < (blackHoleSize + 2); // Environment objects are larger
}

// Create destruction effect particles
export function createDestructionEffect(position: THREE.Vector3) {
  const particles = [];
  for (let i = 0; i < 8; i++) {
    particles.push({
      position: position.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3,
        (Math.random() - 0.5) * 4
      )),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        Math.random() * 3 + 2,
        (Math.random() - 0.5) * 5
      ),
      life: 1.0,
      color: ['#FF6B35', '#FF4757', '#FFA502'][Math.floor(Math.random() * 3)]
    });
  }
  return particles;
}
