// Fix export/import issues in custom hooks
import { useEffect, useState, useCallback } from 'react';

// Define proper types
interface AudioOptions {
  volume?: number;
  loop?: boolean;
}

export function useAudioManager() {
  const [sounds, setSounds] = useState<Record<string, HTMLAudioElement>>({});
  
  const loadSound = useCallback((key: string, url: string) => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    
    setSounds(prev => ({ ...prev, [key]: audio }));
    
    // Return a promise that resolves when the sound is loaded
    return new Promise<void>((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => resolve(), { once: true });
      audio.addEventListener('error', reject, { once: true });
    });
  }, []);
  
  const playSound = useCallback((key: string, options?: AudioOptions) => {
    const sound = sounds[key];
    if (!sound) return;
    
    try {
      // Clone sound for overlapping playback
      const soundClone = sound.cloneNode() as HTMLAudioElement;
      
      // Apply options
      if (options?.volume !== undefined) {
        soundClone.volume = options.volume;
      }
      
      if (options?.loop !== undefined) {
        soundClone.loop = options.loop;
      }
      
      return soundClone.play().catch(error => {
        console.warn(`Sound play prevented: ${error.message}`);
      });
    } catch (error) {
      console.error(`Error playing sound ${key}:`, error);
    }
  }, [sounds]);
  
  const stopSound = useCallback((key: string) => {
    const sound = sounds[key];
    if (!sound) return;
    
    sound.pause();
    sound.currentTime = 0;
  }, [sounds]);
  
  // Cleanup all sounds on unmount
  useEffect(() => {
    return () => {
      Object.values(sounds).forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    };
  }, [sounds]);
  
  return { loadSound, playSound, stopSound };
}

export default useAudioManager;