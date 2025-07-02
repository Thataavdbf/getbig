import React from 'react';
import { useDifficulty, DifficultyLevel } from '@/lib/stores/useDifficulty';
import { motion } from 'framer-motion';

export default function DifficultyIndicator() {
  const { currentLevel, adaptiveLevel, setDifficulty } = useDifficulty();
  
  const difficultyColors: Record<DifficultyLevel, string> = {
    easy: 'bg-green-500',
    normal: 'bg-blue-500',
    hard: 'bg-orange-500',
    extreme: 'bg-red-500',
    adaptive: 'bg-purple-500'
  };
  
  const difficultyNames: Record<DifficultyLevel, string> = {
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    extreme: 'Extreme',
    adaptive: 'Adaptive'
  };
  
  const handleChangeDifficulty = (level: DifficultyLevel) => {
    setDifficulty(level);
  };
  
  return (
    <div className="fixed top-4 right-4 bg-black/70 p-3 rounded-lg border border-gray-700">
      <div className="text-white text-sm mb-2 font-medium">Difficulty Level</div>
      
      <div className="flex gap-2">
        {(Object.keys(difficultyNames) as DifficultyLevel[]).map((level) => (
          <button
            key={level}
            className={`text-xs px-2 py-1 rounded ${
              currentLevel === level 
                ? `${difficultyColors[level]} text-white` 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => handleChangeDifficulty(level)}
          >
            {difficultyNames[level]}
          </button>
        ))}
      </div>
      
      {currentLevel === 'adaptive' && (
        <div className="mt-2">
          <div className="text-xs text-gray-300 mb-1">Adaptive Level: {adaptiveLevel}/10</div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-500"
              style={{ width: `${(adaptiveLevel / 10) * 100}%` }}
              animate={{ width: `${(adaptiveLevel / 10) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}