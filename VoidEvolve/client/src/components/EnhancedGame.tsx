import React, { useState, useEffect } from 'react';
// WRONG: This is a circular import
// import EnhancedGame from './EnhancedGame';

// CORRECT: Import components that EnhancedGame depends on
import { Interface } from './ui/interface';
import { useEnvironment } from '../lib/stores/useEnvironment';
import BlackHole from './BlackHole';
import PowerUpIndicator from './PowerUpIndicator';
import ComboSystem from './ComboSystem';
// import ObjectiveTracker from './ObjectiveTracker';
import DifficultyIndicator from './DifficultyIndicator';
// import DefendedObject from './DefendedObject';

// Rename the function to avoid confusion
export default function EnhancedGameWrapper() {
  const [showMenu, setShowMenu] = useState(true);
  const { currentEnvironment } = useEnvironment();
  
  // Music tracks for different environments
  const musicTracks: Record<string, string> = {
    space: '/sounds/space_ambient.mp3',
    alien_planet: '/sounds/alien_ambient.mp3',
    cybercity: '/sounds/cyber_ambient.mp3',
    ancient_ruins: '/sounds/ruins_ambient.mp3',
    time_vortex: '/sounds/vortex_ambient.mp3',
  };
  
  // Preload audio files
  useEffect(() => {
    const audio = new Audio();
    Object.values(musicTracks).forEach(src => {
      audio.src = src;
      audio.load();
    });
  }, [musicTracks]);
  
  return (
    <>
      {showMenu ? (
        <div className="game-menu">
          {/* Your menu UI here */}
          <button 
            onClick={() => setShowMenu(false)}
            className="play-button"
          >
            Play Game
          </button>
        </div>
      ) : (
        <>
          {/* <EnhancedGame /> */}
          <Interface />
          <BlackHole />
          <PowerUpIndicator />
          <ComboSystem />
          {/* <ObjectiveTracker /> */}
          <DifficultyIndicator />
          {/* <DefendedObject /> */}
          {/* <BackgroundMusic url={musicTracks[currentEnvironment] || musicTracks.space} /> */}
        </>
      )}
    </>
  );
}