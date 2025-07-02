import { create } from 'zustand';
import * as THREE from 'three';

interface BlackHoleState {
  position: THREE.Vector3;
  size: number;
  mass: number;
  energy: number;
  maxEnergy: number;
  score: number;
  consumed: number;
  
  setPosition: (position: THREE.Vector3) => void;
  grow: (amount: number) => void;
  shrink: (amount: number) => void;
  addEnergy: (amount: number) => void;
  useEnergy: (amount: number) => boolean;
  addScore: (points: number) => void;
  reset: () => void;
}

const initialState = {
  position: new THREE.Vector3(0, 0, 0),
  size: 1,
  mass: 10,
  energy: 100,
  maxEnergy: 100,
  score: 0,
  consumed: 0
};

export const useBlackHole = create<BlackHoleState>((set) => ({
  ...initialState,
  
  setPosition: (position) => {
    set({ position });
  },
  
  grow: (amount) => {
    set((state) => ({
      size: Math.min(10, state.size + amount),
      mass: state.mass + amount * 10,
      consumed: state.consumed + 1
    }));
  },
  
  shrink: (amount) => {
    set((state) => ({
      size: Math.max(0.5, state.size - amount),
      mass: Math.max(5, state.mass - amount * 10)
    }));
  },
  
  addEnergy: (amount) => {
    set((state) => ({
      energy: Math.min(state.maxEnergy, state.energy + amount)
    }));
  },
  
  useEnergy: (amount) => {
    let success = false;
    
    set((state) => {
      if (state.energy >= amount) {
        success = true;
        return { energy: state.energy - amount };
      }
      return state;
    });
    
    return success;
  },
  
  addScore: (points) => {
    set((state) => ({
      score: state.score + points
    }));
  },
  
  reset: () => {
    set(initialState);
  }
}));