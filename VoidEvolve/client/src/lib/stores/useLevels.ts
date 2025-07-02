import { create } from 'zustand';
import { nanoid } from 'nanoid';

export interface Objective {
  id: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  type: string;
}

export interface Level {
  id: number;
  name: string;
  environment: string;
  objectives: Objective[];
  completed: boolean;
  unlocked: boolean;
}

interface LevelState {
  levels: Level[];
  currentLevelId: number | null;
  
  initializeLevels: () => void;
  setCurrentLevel: (id: number) => void;
  updateObjective: (objectiveId: string, progress: number) => boolean; // Returns true if objective completed
  checkLevelCompletion: () => boolean; // Returns true if level completed
  unlockNextLevel: () => void;
  resetLevelProgress: () => void;
}

export const useLevels = create<LevelState>((set, get) => ({
  levels: [],
  currentLevelId: null,
  
  initializeLevels: () => {
    const defaultLevels: Level[] = [
      {
        id: 1,
        name: "Cosmic Beginnings",
        environment: "space",
        objectives: [
          {
            id: nanoid(),
            description: "Consume 10 objects",
            target: 10,
            current: 0,
            completed: false,
            type: "consume"
          },
          {
            id: nanoid(),
            description: "Reach score of 100",
            target: 100,
            current: 0,
            completed: false,
            type: "score"
          }
        ],
        completed: false,
        unlocked: true
      },
      {
        id: 2,
        name: "Alien Ecosystem",
        environment: "alien_planet",
        objectives: [
          {
            id: nanoid(),
            description: "Consume 20 objects",
            target: 20,
            current: 0,
            completed: false,
            type: "consume"
          },
          {
            id: nanoid(),
            description: "Survive for 60 seconds",
            target: 60,
            current: 0,
            completed: false,
            type: "time"
          }
        ],
        completed: false,
        unlocked: false
      },
      {
        id: 3,
        name: "Digital Domain",
        environment: "cybercity",
        objectives: [
          {
            id: nanoid(),
            description: "Reach score of 500",
            target: 500,
            current: 0,
            completed: false,
            type: "score"
          },
          {
            id: nanoid(),
            description: "Protect data core for 45 seconds",
            target: 45,
            current: 0,
            completed: false,
            type: "defend"
          }
        ],
        completed: false,
        unlocked: false
      },
      {
        id: 4,
        name: "Ancient Secrets",
        environment: "ancient_ruins",
        objectives: [
          {
            id: nanoid(),
            description: "Consume 15 artifacts",
            target: 15,
            current: 0,
            completed: false,
            type: "consume"
          },
          {
            id: nanoid(),
            description: "Reach score of 1000",
            target: 1000,
            current: 0,
            completed: false,
            type: "score"
          }
        ],
        completed: false,
        unlocked: false
      },
      {
        id: 5,
        name: "Temporal Collapse",
        environment: "time_vortex",
        objectives: [
          {
            id: nanoid(),
            description: "Survive for 120 seconds",
            target: 120,
            current: 0,
            completed: false,
            type: "time"
          },
          {
            id: nanoid(),
            description: "Reach score of 2000",
            target: 2000,
            current: 0,
            completed: false,
            type: "score"
          }
        ],
        completed: false,
        unlocked: false
      }
    ];
    
    set({ levels: defaultLevels, currentLevelId: 1 });
  },
  
  setCurrentLevel: (id) => {
    set({ currentLevelId: id });
  },
  
  updateObjective: (objectiveId, progress) => {
    let objectiveCompleted = false;
    
    set(state => {
      const { levels, currentLevelId } = state;
      if (currentLevelId === null) return state;
      
      const levelIndex = levels.findIndex(l => l.id === currentLevelId);
      if (levelIndex === -1) return state;
      
      const level = levels[levelIndex];
      const objectiveIndex = level.objectives.findIndex(o => o.id === objectiveId);
      if (objectiveIndex === -1) return state;
      
      const objective = level.objectives[objectiveIndex];
      const newCurrent = Math.min(objective.target, objective.current + progress);
      const newCompleted = newCurrent >= objective.target;
      
      objectiveCompleted = newCompleted && !objective.completed;
      
      const updatedObjective: Objective = {
        ...objective,
        current: newCurrent,
        completed: newCompleted
      };
      
      const updatedObjectives = [...level.objectives];
      updatedObjectives[objectiveIndex] = updatedObjective;
      
      const updatedLevel: Level = {
        ...level,
        objectives: updatedObjectives
      };
      
      const updatedLevels = [...levels];
      updatedLevels[levelIndex] = updatedLevel;
      
      return { levels: updatedLevels };
    });
    
    return objectiveCompleted;
  },
  
  checkLevelCompletion: () => {
    const { levels, currentLevelId } = get();
    if (currentLevelId === null) return false;
    
    const level = levels.find(l => l.id === currentLevelId);
    if (!level) return false;
    
    const allObjectivesComplete = level.objectives.every(o => o.completed);
    
    if (allObjectivesComplete && !level.completed) {
      // Mark level as completed
      set(state => {
        const updatedLevels = state.levels.map(l => 
          l.id === currentLevelId ? { ...l, completed: true } : l
        );
        
        return { levels: updatedLevels };
      });
      
      return true;
    }
    
    return false;
  },
  
  unlockNextLevel: () => {
    set(state => {
      const { levels, currentLevelId } = state;
      if (currentLevelId === null) return state;
      
      const currentLevelIndex = levels.findIndex(l => l.id === currentLevelId);
      if (currentLevelIndex === -1 || currentLevelIndex >= levels.length - 1) return state;
      
      const nextLevelIndex = currentLevelIndex + 1;
      
      const updatedLevels = [...levels];
      updatedLevels[nextLevelIndex] = {
        ...updatedLevels[nextLevelIndex],
        unlocked: true
      };
      
      return { levels: updatedLevels };
    });
  },
  
  resetLevelProgress: () => {
    set(state => {
      const { levels, currentLevelId } = state;
      if (currentLevelId === null) return state;
      
      const levelIndex = levels.findIndex(l => l.id === currentLevelId);
      if (levelIndex === -1) return state;
      
      const level = levels[levelIndex];
      
      const resetObjectives = level.objectives.map(o => ({
        ...o,
        current: 0,
        completed: false
      }));
      
      const updatedLevel: Level = {
        ...level,
        objectives: resetObjectives
      };
      
      const updatedLevels = [...levels];
      updatedLevels[levelIndex] = updatedLevel;
      
      return { levels: updatedLevels };
    });
  }
}));