import { create } from 'zustand';
import { DefenseObject, Vector3 } from '@/types';
import { nanoid } from 'nanoid';

interface DefensesState {
  defenseObjects: DefenseObject[];
  
  addDefense: (position: Vector3, type: string, health: number, size: number) => string;
  damageDefense: (id: string, amount: number) => boolean; // Returns true if object was destroyed
  updateDefenses: () => void;
  clearDefenses: () => void;
}

export const useDefenses = create<DefensesState>((set, get) => ({
  defenseObjects: [],
  
  addDefense: (position, type, health, size) => {
    const defense: DefenseObject = {
      id: nanoid(),
      position,
      health,
      maxHealth: health,
      size,
      type
    };
    
    set(state => ({
      defenseObjects: [...state.defenseObjects, defense]
    }));
    
    return defense.id;
  },
  
  damageDefense: (id, amount) => {
    let destroyed = false;
    
    set(state => {
      const defenseIndex = state.defenseObjects.findIndex(d => d.id === id);
      if (defenseIndex === -1) return state;
      
      const defense = state.defenseObjects[defenseIndex];
      const newHealth = Math.max(0, defense.health - amount);
      
      if (newHealth <= 0) {
        destroyed = true;
        return {
          defenseObjects: state.defenseObjects.filter(d => d.id !== id)
        };
      }
      
      const updatedDefenses = [...state.defenseObjects];
      updatedDefenses[defenseIndex] = {
        ...defense,
        health: newHealth
      };
      
      return { defenseObjects: updatedDefenses };
    });
    
    return destroyed;
  },
  
  updateDefenses: () => {
    // Implement any time-based effects on defenses here
    // For example, health regeneration or position updates
  },
  
  clearDefenses: () => {
    set({ defenseObjects: [] });
  }
}));