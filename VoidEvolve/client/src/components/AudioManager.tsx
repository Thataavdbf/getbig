import React, { useEffect } from "react";
import { useAudio } from "../lib/stores/useAudio";
import { useGame } from "../lib/stores/useGame";

export default function AudioManager() {
  const { 
    backgroundMusic, 
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound, 
    isMuted,
    toggleMute 
  } = useAudio();
  const { phase } = useGame();

  // Initialize audio files
  useEffect(() => {
    // Create audio elements
    const bgMusic = new Audio('/sounds/background.mp3');
    const hitSfx = new Audio('/sounds/hit.mp3');
    const successSfx = new Audio('/sounds/success.mp3');

    // Configure background music
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    // Configure sound effects
    hitSfx.volume = 0.5;
    successSfx.volume = 0.4;

    // Store in state
    setBackgroundMusic(bgMusic);
    setHitSound(hitSfx);
    setSuccessSound(successSfx);

    console.log('Audio files initialized');

    return () => {
      // Cleanup
      bgMusic.pause();
      bgMusic.src = '';
      hitSfx.src = '';
      successSfx.src = '';
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  // Handle background music based on game phase and mute state
  useEffect(() => {
    if (!backgroundMusic) return;

    const playMusic = async () => {
      if (phase === "playing" && !isMuted) {
        try {
          await backgroundMusic.play();
          console.log('Background music started');
        } catch (error) {
          console.log('Background music play prevented:', error);
          // Auto-unmute after user interaction
          const handleInteraction = async () => {
            try {
              await backgroundMusic.play();
              document.removeEventListener('click', handleInteraction);
              document.removeEventListener('keydown', handleInteraction);
            } catch (e) {
              console.log('Still unable to play audio:', e);
            }
          };
          document.addEventListener('click', handleInteraction);
          document.addEventListener('keydown', handleInteraction);
        }
      } else {
        backgroundMusic.pause();
        console.log('Background music paused');
      }
    };

    playMusic();
  }, [backgroundMusic, phase, isMuted]);

  // Auto-unmute when game starts for better UX
  useEffect(() => {
    if (phase === "playing" && isMuted) {
      // Give user a moment to hear the game, then they can mute if desired
      console.log('Game started - unmuting audio for better experience');
      toggleMute();
    }
  }, [phase]); // Removed toggleMute and isMuted from deps to avoid loops

  return null; // This component doesn't render anything
}
