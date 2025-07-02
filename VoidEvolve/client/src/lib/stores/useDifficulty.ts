import { create } from 'zustand';

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'extreme' | 'adaptive';

interface DifficultySettings {
  objectSpawnRate: number;      // Objects per second
  objectSpeed: number;          // Base movement speed
  objectValue: number;          // Base point value
  hazardSpawnRate: number;      // Hazards per minute
  hazardDamage: number;         // Damage multiplier
  powerUpChance: number;        // 0-1 probability
  blackHoleEnergyUsage: number; // Energy consumption rate
  blackHoleSizeDecay: number;   // Size reduction over time
}

interface DifficultyState {
  currentLevel: DifficultyLevel;
  adaptiveLevel: number;         // 1-10 for adaptive difficulty
  settings: DifficultySettings;
  
  setDifficulty: (level: DifficultyLevel) => void;
  increaseAdaptiveDifficulty: () => void;
  decreaseAdaptiveDifficulty: () => void;
  getDifficultyMultiplier: () => number;
}

const difficultyPresets: Record<DifficultyLevel, DifficultySettings> = {
  easy: {
    objectSpawnRate: 2,
    objectSpeed: 0.8,
    objectValue: 1.2,
    hazardSpawnRate: 2,
    hazardDamage: 0.7,
    powerUpChance: 0.08,
    blackHoleEnergyUsage: 0.7,
    blackHoleSizeDecay: 0.05
  },
  normal: {
    objectSpawnRate: 3,
    objectSpeed: 1.0,
    objectValue: 1.0,
    hazardSpawnRate: 4,
    hazardDamage: 1.0,
    powerUpChance: 0.05,
    blackHoleEnergyUsage: 1.0,
    blackHoleSizeDecay: 0.1
  },
  hard: {
    objectSpawnRate: 4,
    objectSpeed: 1.3,
    objectValue: 0.8,
    hazardSpawnRate: 6,
    hazardDamage: 1.5,
    powerUpChance: 0.03,
    blackHoleEnergyUsage: 1.3,
    blackHoleSizeDecay: 0.15
  },
  extreme: {
    objectSpawnRate: 5,
    objectSpeed: 1.6,
    objectValue: 0.6,
    hazardSpawnRate: 8,
    hazardDamage: 2.0,
    powerUpChance: 0.02,
    blackHoleEnergyUsage: 1.6,
    blackHoleSizeDecay: 0.2
  },
  adaptive: {
    objectSpawnRate: 3,
    objectSpeed: 1.0,
    objectValue: 1.0,
    hazardSpawnRate: 4,
    hazardDamage: 1.0,
    powerUpChance: 0.05,
    blackHoleEnergyUsage: 1.0,
    blackHoleSizeDecay: 0.1
  }
};

export const useDifficulty = create<DifficultyState>((set, get) => ({
  currentLevel: 'normal',
  adaptiveLevel: 5, // Middle of 1-10 scale
  settings: difficultyPresets.normal,
  
  setDifficulty: (level) => {
    set({
      currentLevel: level,
      settings: difficultyPresets[level]
    });
  },
  
  increaseAdaptiveDifficulty: () => {
    set(state => {
      const newLevel = Math.min(10, state.adaptiveLevel + 1);
      
      // Calculate how far we are between normal and extreme (5 is normal, 10 is extreme)
      const normalToExtreme = (newLevel - 5) / 5;
      
      if (state.currentLevel === 'adaptive') {
        // Interpolate settings between normal and extreme
        const newSettings = {...state.settings};
        
        for (const key in newSettings) {
          if (Object.prototype.hasOwnProperty.call(newSettings, key)) {
            const normalValue = difficultyPresets.normal[key as keyof DifficultySettings];
            const extremeValue = difficultyPresets.extreme[key as keyof DifficultySettings];
            
            // Linear interpolation
            newSettings[key as keyof DifficultySettings] = normalValue + 
              (extremeValue - normalValue) * normalToExtreme;
          }
        }
        
        return {
          adaptiveLevel: newLevel,
          settings: newSettings
        };
      }
      
      return { adaptiveLevel: newLevel };
    });
  },
  
  decreaseAdaptiveDifficulty: () => {
    set(state => {
      const newLevel = Math.max(1, state.adaptiveLevel - 1);
      
      // Calculate how far we are between easy and normal (1 is easy, 5 is normal)
      const easyToNormal = (newLevel - 1) / 4;
      
      if (state.currentLevel === 'adaptive') {
        // Interpolate settings between easy and normal
        const newSettings = {...state.settings};
        
        for (const key in newSettings) {
          if (Object.prototype.hasOwnProperty.call(newSettings, key)) {
            const easyValue = difficultyPresets.easy[key as keyof DifficultySettings];
            const normalValue = difficultyPresets.normal[key as keyof DifficultySettings];
            
            // Linear interpolation
            newSettings[key as keyof DifficultySettings] = easyValue + 
              (normalValue - easyValue) * easyToNormal;
          }
        }
        
        return {
          adaptiveLevel: newLevel,
          settings: newSettings
        };
      }
      
      return { adaptiveLevel: newLevel };
    });
  },
  
  getDifficultyMultiplier: () => {
    const { currentLevel, adaptiveLevel } = get();
    
    if (currentLevel === 'adaptive') {
      // Return 0.5 to 1.5 based on adaptive level
      return 0.5 + (adaptiveLevel - 1) / 9;
    }
    
    const multipliers = {
      easy: 0.5,
      normal: 1.0,
      hard: 1.5,
      extreme: 2.0,
      adaptive: 1.0
    };
    
    return multipliers[currentLevel];
  }
}));