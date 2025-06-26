import { create } from "zustand";

export type EnvironmentType = "space" | "alien_planet" | "cybercity" | "ancient_ruins" | "time_vortex";

interface EnvironmentState {
  currentEnvironment: EnvironmentType;
  environmentLevel: number;
  destructionCount: number;
  environmentObjects: any[];
  
  // Actions
  setEnvironment: (env: EnvironmentType) => void;
  addDestruction: () => void;
  generateEnvironmentObjects: () => void;
  reset: () => void;
}

export const useEnvironment = create<EnvironmentState>((set, get) => ({
  currentEnvironment: "space",
  environmentLevel: 1,
  destructionCount: 0,
  environmentObjects: [],
  
  setEnvironment: (env) => set({ 
    currentEnvironment: env,
    destructionCount: 0,
    environmentLevel: 1
  }),
  
  addDestruction: () => set((state) => ({
    destructionCount: state.destructionCount + 1
  })),
  
  generateEnvironmentObjects: () => {
    const { currentEnvironment } = get();
    const objects = [];
    
    // Generate environment-specific objects
    switch (currentEnvironment) {
      case "alien_planet":
        // Alien crystals and structures
        for (let i = 0; i < 12; i++) {
          objects.push({
            id: `alien-${i}`,
            type: "crystal",
            position: [(Math.random() - 0.5) * 80, 0, (Math.random() - 0.5) * 80],
            color: ["#FF6B35", "#00F5FF", "#5F27CD"][Math.floor(Math.random() * 3)],
            destructible: true
          });
        }
        break;
        
      case "cybercity":
        // Neon buildings and platforms
        for (let i = 0; i < 8; i++) {
          objects.push({
            id: `building-${i}`,
            type: "building",
            position: [(Math.random() - 0.5) * 60, Math.random() * 15, (Math.random() - 0.5) * 60],
            color: ["#FF4757", "#3742FA", "#00F5FF"][Math.floor(Math.random() * 3)],
            destructible: true
          });
        }
        break;
        
      case "ancient_ruins":
        // Stone pillars and monuments
        for (let i = 0; i < 10; i++) {
          objects.push({
            id: `ruin-${i}`,
            type: "pillar",
            position: [(Math.random() - 0.5) * 70, 0, (Math.random() - 0.5) * 70],
            color: "#8B4513",
            destructible: true
          });
        }
        break;
        
      case "time_vortex":
        // Floating temporal fragments
        for (let i = 0; i < 15; i++) {
          objects.push({
            id: `fragment-${i}`,
            type: "fragment",
            position: [(Math.random() - 0.5) * 90, Math.random() * 20, (Math.random() - 0.5) * 90],
            color: "#5F27CD",
            destructible: true
          });
        }
        break;
        
      default: // space
        // Asteroids and space debris
        for (let i = 0; i < 6; i++) {
          objects.push({
            id: `asteroid-${i}`,
            type: "asteroid",
            position: [(Math.random() - 0.5) * 100, Math.random() * 10, (Math.random() - 0.5) * 100],
            color: "#696969",
            destructible: false // Space debris floats
          });
        }
        break;
    }
    
    set({ environmentObjects: objects });
  },
  
  reset: () => set({
    currentEnvironment: "space",
    environmentLevel: 1,
    destructionCount: 0,
    environmentObjects: []
  })
}));