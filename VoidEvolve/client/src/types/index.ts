// Add more precise typing for Three.js integration
import * as THREE from 'three';

// Enhanced Vector3 type compatible with THREE.Vector3
export type Vector3Type = {
  x: number;
  y: number;
  z: number;
} | THREE.Vector3;

// ThreeElements extension for proper JSX typing
declare global {
  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: any;
      shaderMaterial: any;
      blackHoleMaterial: any;
    }
  }
}

// Precise event types for input handlers
export interface GameInputEvent {
  clientX: number;
  clientY: number;
  preventDefault: () => void;
}

// Make component props explicit
export interface HazardProps {
  position: [number, number, number];
  type: string;
  size: number;
  rotation: number;
}

// Vector types
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Game object types
export interface ConsumableObject {
  id: string;
  position: Vector3;
  size: number;
  type: string;
  destructible: boolean;
  color?: string;
  points?: number;
}

// Enhanced ConsumableObject with new features
export interface EnhancedConsumableObject extends ConsumableObject {
  value?: number; // Make value optional
  behavior?: 'static' | 'floating' | 'orbiting' | 'fleeing';
  effectType?: ElementType;
  effectStrength?: number;
  isRare?: boolean;
  isPowerUp?: boolean;
  powerUpType?: PowerUpType;
}

// Element and PowerUp types
export type ElementType = 'fire' | 'ice' | 'gravity' | 'time' | 'void';

export type PowerUpType = 'speed' | 'size' | 'energy' | 'shield' | 'magnet' | 'time_slow';

// Environment types
export type Environment = 
  | 'space' 
  | 'alien_planet' 
  | 'cybercity' 
  | 'ancient_ruins' 
  | 'time_vortex';

// Game mechanic types
export interface ComboState {
  count: number;
  timer: number;
  multiplier: number;
  score: number;
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: Vector3;
  duration: number;
  strength: number;
  active: boolean;
  timeRemaining?: number;
}

// Update the BlackHoleState interface to include energy and maxEnergy properties

export interface BlackHoleState {
  position: Vector3;
  size: number;
  mass: number;
  energy: number;
  maxEnergy: number;
  score: number;
  consumed: number;
  
  setPosition: (position: Vector3) => void;
  grow: (amount: number) => void;
  shrink: (amount: number) => void;
  addEnergy: (amount: number) => void;
  useEnergy: (amount: number) => boolean;
  addScore: (points: number) => void;
  reset: () => void;
}