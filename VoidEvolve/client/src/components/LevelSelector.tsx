import React, { useEffect } from 'react';
import { useLevels } from '@/lib/stores/useLevels';
import { useEnvironment } from '@/lib/stores/useEnvironment';
import { motion } from 'framer-motion';

export default function LevelSelector() {
  const { levels, currentLevelId, setCurrentLevel, initializeLevels } = useLevels();
  const { setEnvironment } = useEnvironment();
  
  // Initialize levels if not already done
  useEffect(() => {
    if (levels.length === 0) {
      initializeLevels();
    }
  }, [levels.length, initializeLevels]);
  
  const handleSelectLevel = (levelId: number) => {
    const level = levels.find(l => l.id === levelId);
    if (level && level.unlocked) {
      setCurrentLevel(levelId);
      setEnvironment(level.environment);
    }
  };
  
  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'space': return 'bg-blue-900';
      case 'alien_planet': return 'bg-green-900';
      case 'cybercity': return 'bg-cyan-900';
      case 'ancient_ruins': return 'bg-amber-900';
      case 'time_vortex': return 'bg-purple-900';
      default: return 'bg-gray-900';
    }
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto bg-black/80 p-5 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-4">Select Level</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {levels.map(level => (
          <motion.div
            key={level.id}
            className={`p-4 rounded-lg border cursor-pointer ${
              level.unlocked 
                ? `${getEnvironmentColor(level.environment)} border-white/30 hover:border-white/60` 
                : 'bg-gray-900 border-gray-700 opacity-60 cursor-not-allowed'
            } ${currentLevelId === level.id ? 'ring-2 ring-white' : ''}`}
            onClick={() => level.unlocked && handleSelectLevel(level.id)}
            whileHover={level.unlocked ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white">{level.name}</h3>
              {level.completed && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                  COMPLETED
                </span>
              )}
            </div>
            
            <div className="mt-2 text-sm text-gray-300">
              Environment: {level.environment.replace('_', ' ').charAt(0).toUpperCase() + level.environment.replace('_', ' ').slice(1)}
            </div>
            
            <div className="mt-3">
              <h4 className="text-sm font-medium text-white mb-1">Objectives:</h4>
              <ul className="space-y-1">
                {level.objectives.map(objective => (
                  <li 
                    key={objective.id} 
                    className="text-xs flex items-center"
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      objective.completed ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                    <span className={
                      objective.completed ? 'text-green-300' : 'text-gray-300'
                    }>
                      {objective.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            {!level.unlocked && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                <div className="flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Complete previous level to unlock</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

