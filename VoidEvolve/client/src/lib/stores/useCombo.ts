import { create } from 'zustand';

// Define the state interface
interface ComboState {
  count: number;
  timer: number;
  multiplier: number;
  score: number;
}

// Define the store interface with state and actions
interface ComboStore extends ComboState {
  incrementCombo: (points: number) => void;
  updateComboTimer: (delta: number) => void;
  resetCombo: () => void;
  getMultiplier: () => number;
}

// Create and export the store
export const useCombo = create<ComboStore>((set, get) => ({
  // Initial state
  count: 0,
  timer: 0,
  multiplier: 1,
  score: 0,
  
  // Actions
  incrementCombo: (points) => {
    set(state => {
      const newCount = state.count + 1;
      let newMultiplier = 1;
      
      // Calculate multiplier based on combo count
      if (newCount >= 20) {
        newMultiplier = 5;
      } else if (newCount >= 12) {
        newMultiplier = 4;
      } else if (newCount >= 7) {
        newMultiplier = 3;
      } else if (newCount >= 3) {
        newMultiplier = 2;
      }
      
      return {
        count: newCount,
        timer: 3, // Reset timer to 3 seconds
        multiplier: newMultiplier,
        score: state.score + points * newMultiplier
      };
    });
  },
  
  updateComboTimer: (delta) => {
    set(state => {
      const newTimer = Math.max(0, state.timer - delta);
      
      // Reset combo if timer reaches zero
      if (newTimer === 0 && state.count > 0) {
        return {
          count: 0,
          timer: 0,
          multiplier: 1,
          score: state.score // Keep score unchanged
        };
      }
      
      return {
        ...state,
        timer: newTimer
      };
    });
  },
  
  resetCombo: () => {
    set({
      count: 0,
      timer: 0,
      multiplier: 1,
      score: 0
    });
  },
  
  getMultiplier: () => {
    return get().multiplier;
  }
}));