import { create } from 'zustand';

export type Environment = 
  | 'space' 
  | 'alien_planet' 
  | 'cybercity' 
  | 'ancient_ruins' 
  | 'time_vortex';

interface EnvironmentState {
  currentEnvironment: Environment;
  fogDensity: number;
  ambientLightIntensity: number;
  particleDensity: number;
  backgroundMusic: string;
  
  setEnvironment: (environment: Environment) => void;
  updateEnvironmentProperties: () => void;
  getEnvironmentColor: () => string;
  getGridColor: () => string;
}

export const useEnvironment = create<EnvironmentState>((set, get) => ({
  currentEnvironment: 'space',
  fogDensity: 0.02,
  ambientLightIntensity: 0.3,
  particleDensity: 100,
  backgroundMusic: '/sounds/space_ambient.mp3',
  
  setEnvironment: (environment) => {
    set({ currentEnvironment: environment });
    get().updateEnvironmentProperties();
  },
  
  updateEnvironmentProperties: () => {
    const { currentEnvironment } = get();
    
    switch (currentEnvironment) {
      case 'space':
        set({
          fogDensity: 0.02,
          ambientLightIntensity: 0.3,
          particleDensity: 100,
          backgroundMusic: '/sounds/space_ambient.mp3'
        });
        break;
        
      case 'alien_planet':
        set({
          fogDensity: 0.05,
          ambientLightIntensity: 0.4,
          particleDensity: 150,
          backgroundMusic: '/sounds/alien_ambient.mp3'
        });
        break;
        
      case 'cybercity':
        set({
          fogDensity: 0.03,
          ambientLightIntensity: 0.5,
          particleDensity: 200,
          backgroundMusic: '/sounds/cyber_ambient.mp3'
        });
        break;
        
      case 'ancient_ruins':
        set({
          fogDensity: 0.04,
          ambientLightIntensity: 0.25,
          particleDensity: 80,
          backgroundMusic: '/sounds/ruins_ambient.mp3'
        });
        break;
        
      case 'time_vortex':
        set({
          fogDensity: 0.06,
          ambientLightIntensity: 0.35,
          particleDensity: 300,
          backgroundMusic: '/sounds/vortex_ambient.mp3'
        });
        break;
        
      default:
        set({
          fogDensity: 0.02,
          ambientLightIntensity: 0.3,
          particleDensity: 100,
          backgroundMusic: '/sounds/space_ambient.mp3'
        });
    }
  },
  
  getEnvironmentColor: () => {
    const colors = {
      'space': '#0D1B2A',
      'alien_planet': '#1A0B2E',
      'cybercity': '#000511',
      'ancient_ruins': '#2C1B0E',
      'time_vortex': '#100030'
    };
    
    return colors[get().currentEnvironment] || colors.space;
  },
  
  getGridColor: () => {
    const colors = {
      'space': '#00F5FF',
      'alien_planet': '#FF00FF',
      'cybercity': '#00FFAA',
      'ancient_ruins': '#BB8C5F',
      'time_vortex': '#8800FF'
    };
    
    return colors[get().currentEnvironment] || colors.space;
  }
}));