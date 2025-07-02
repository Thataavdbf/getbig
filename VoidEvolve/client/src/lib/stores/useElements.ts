import { create } from 'zustand';
import * as THREE from 'three';

export type ElementType = 'fire' | 'ice' | 'gravity' | 'time' | 'void';

interface ElementEffect {
  id: string;
  type: ElementType;
  position: THREE.Vector3;
  strength: number;
  duration: number;
  timeRemaining: number;
}

interface ElementsState {
  activeEffects: ElementEffect[];
  
  addEffect: (type: ElementType, position: THREE.Vector3, strength: number, duration: number) => void;
  updateEffects: (delta: number) => void;
  removeEffect: (id: string) => void;
  clearEffects: () => void;
}

export const useElements = create<ElementsState>((set) => ({
  activeEffects: [],
  
  addEffect: (type, position, strength, duration) => {
    const id = `effect-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    set(state => ({
      activeEffects: [
        ...state.activeEffects,
        {
          id,
          type,
          position: position.clone(),
          strength,
          duration,
          timeRemaining: duration
        }
      ]
    }));
    
    return id;
  },
  
  updateEffects: (delta) => {
    set(state => ({
      activeEffects: state.activeEffects
        .map(effect => ({
          ...effect,
          timeRemaining: effect.timeRemaining - delta
        }))
        .filter(effect => effect.timeRemaining > 0)
    }));
  },
  
  removeEffect: (id) => {
    set(state => ({
      activeEffects: state.activeEffects.filter(effect => effect.id !== id)
    }));
  },
  
  clearEffects: () => {
    set({ activeEffects: [] });
  }
}));