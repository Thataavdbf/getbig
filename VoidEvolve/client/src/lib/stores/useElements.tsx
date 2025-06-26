import { create } from "zustand";

export type ElementType = "fire" | "ice" | "gravity" | "none";

interface ElementState {
  currentElement: ElementType;
  elementLevel: number;
  elementEnergy: number;
  maxEnergy: number;
  
  // Actions
  setElement: (element: ElementType) => void;
  upgradeElement: () => void;
  useElementPower: (cost: number) => boolean;
  rechargeEnergy: (amount: number) => void;
  reset: () => void;
}

export const useElements = create<ElementState>((set, get) => ({
  currentElement: "none",
  elementLevel: 1,
  elementEnergy: 100,
  maxEnergy: 100,
  
  setElement: (element) => set({ 
    currentElement: element,
    elementEnergy: 100,
    elementLevel: 1
  }),
  
  upgradeElement: () => set((state) => ({
    elementLevel: Math.min(state.elementLevel + 1, 5),
    maxEnergy: state.maxEnergy + 20,
    elementEnergy: state.maxEnergy + 20
  })),
  
  useElementPower: (cost) => {
    const state = get();
    if (state.elementEnergy >= cost) {
      set({ elementEnergy: state.elementEnergy - cost });
      return true;
    }
    return false;
  },
  
  rechargeEnergy: (amount) => set((state) => ({
    elementEnergy: Math.min(state.elementEnergy + amount, state.maxEnergy)
  })),
  
  reset: () => set({
    currentElement: "none",
    elementLevel: 1,
    elementEnergy: 100,
    maxEnergy: 100
  })
}));