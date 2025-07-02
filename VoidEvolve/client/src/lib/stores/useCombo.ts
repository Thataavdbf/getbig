import { create } from 'zustand';
import { ComboState } from '../../types';
import { GAME } from '../constants';

interface ComboSystemState extends ComboState {
  incrementCombo: (points: number) => void;
  updateComboTimer: (delta: number) => void;
  resetCombo: () => void;
  getMultiplier: () => number;
}

export const useCombo = create<ComboSystemState>((set, get) => ({
  count: 0,
  timer: 0,
  multiplier: 1,
  score: 0,
  
  incrementCombo: (points) => {
    set(state => {
      const newCount = state.count + 1;
      let newMultiplier = 1;
      
      // Calculate new multiplier based on combo count
      if (newCount >= GAME.COMBO.THRESHOLD.x5) {
        newMultiplier = 5;
      } else if (newCount >= GAME.COMBO.THRESHOLD.x4) {
        newMultiplier = 4;
      } else if (newCount >= GAME.COMBO.THRESHOLD.x3) {
        newMultiplier = 3;
      } else if (newCount >= GAME.COMBO.THRESHOLD.x2) {
        newMultiplier = 2;
      }
      
      return {
        count: newCount,
        timer: GAME.COMBO.TIME_WINDOW,
        multiplier: newMultiplier,
        score: state.score + points * newMultiplier
      };
    });
  },
  
  updateComboTimer: (delta) => {
    set(state => {
      // Decrement timer
      const newTimer = Math.max(0, state.timer - delta);
      
      // Reset combo if timer reaches zero
      if (newTimer === 0 && state.count > 0) {
        return {
          count: 0,
          timer: 0,
          multiplier: 1,
          // Keep score unchanged
          score: state.score
        };
      }
      
      return {
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