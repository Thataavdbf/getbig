import { create } from "zustand";
import * as THREE from "three";

interface BlackHoleState {
  position: THREE.Vector3;
  size: number;
  score: number;
  velocity: THREE.Vector3;
  
  // Actions
  setPosition: (position: THREE.Vector3) => void;
  setVelocity: (velocity: THREE.Vector3) => void;
  grow: (amount: number) => void;
  addScore: (points: number) => void;
  reset: () => void;
}

export const useBlackHole = create<BlackHoleState>((set) => ({
  position: new THREE.Vector3(0, 1, 0),
  size: 1,
  score: 0,
  velocity: new THREE.Vector3(0, 0, 0),
  
  setPosition: (position) => set({ position: position.clone() }),
  setVelocity: (velocity) => set({ velocity: velocity.clone() }),
  
  grow: (amount) => set((state) => ({ 
    size: Math.min(state.size + amount, 6) // Reduced max size to prevent camera issues
  })),
  
  addScore: (points) => set((state) => ({ 
    score: state.score + points 
  })),
  
  reset: () => set({
    position: new THREE.Vector3(0, 1, 0),
    size: 1,
    score: 0,
    velocity: new THREE.Vector3(0, 0, 0)
  })
}));
