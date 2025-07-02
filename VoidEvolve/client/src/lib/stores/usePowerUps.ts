import { create } from 'zustand';
import * as THREE from 'three';

export type PowerUpType = 'speed' | 'size' | 'energy' | 'shield' | 'magnet' | 'time_slow';

interface PowerUp {
  id: string;
  type: PowerUpType;
  position: THREE.Vector3;
  duration: number;
  strength: number;
  active: boolean;
  timeRemaining?: number;
}

interface PowerUpsState {
  powerUps: PowerUp[];
  activePowerUps: PowerUp[];
  
  addPowerUp: (type: PowerUpType, position: THREE.Vector3, duration: number, strength: number) => void;
  collectPowerUp: (id: string) => void;
  updatePowerUps: (delta: number) => void;
  resetPowerUps: () => void;
}

export const usePowerUps = create<PowerUpsState>((set) => ({
  powerUps: [],
  activePowerUps: [],
  
  addPowerUp: (type, position, duration, strength) => {
    const id = `powerup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newPowerUp: PowerUp = {
      id,
      type,
      position: position.clone(),
      duration,
      strength,
      active: false
    };
    
    set(state => ({
      powerUps: [...state.powerUps, newPowerUp]
    }));
  },
  
  collectPowerUp: (id) => {
    set(state => {
      const powerUp = state.powerUps.find(p => p.id === id);
      
      if (!powerUp) return state;
      
      const activatedPowerUp: PowerUp = {
        ...powerUp,
        active: true,
        timeRemaining: powerUp.duration
      };
      
      return {
        powerUps: state.powerUps.filter(p => p.id !== id),
        activePowerUps: [...state.activePowerUps, activatedPowerUp]
      };
    });
  },
  
  updatePowerUps: (delta) => {
    set(state => {
      const updatedActivePowerUps = state.activePowerUps
        .map(powerUp => ({
          ...powerUp,
          timeRemaining: (powerUp.timeRemaining || 0) - delta
        }))
        .filter(powerUp => (powerUp.timeRemaining || 0) > 0);
      
      return {
        activePowerUps: updatedActivePowerUps
      };
    });
  },
  
  resetPowerUps: () => {
    set({
      powerUps: [],
      activePowerUps: []
    });
  }
}));