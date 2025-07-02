import { useState, useEffect, useCallback, useRef } from 'react';
import { create } from 'zustand';
import React from 'react';
import { AUDIO } from '../constants';

// Audio settings store
interface AudioSettings {
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMute: () => void;
}

export const useAudioSettings = create<AudioSettings>((set) => ({
  musicVolume: AUDIO.VOLUME.MUSIC_DEFAULT,
  sfxVolume: AUDIO.VOLUME.SFX_DEFAULT,
  isMuted: false,
  
  setMusicVolume: (volume) => set({ musicVolume: volume }),
  setSfxVolume: (volume) => set({ sfxVolume: volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted }))
}));

// Background music component
export const BackgroundMusic: React.FC<{ url: string }> = ({ url }) => {
  const { musicVolume, isMuted } = useAudioSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.loop = true;
    } else {
      audioRef.current.src = url;
    }
    
    audioRef.current.volume = isMuted ? 0 : musicVolume;
    
    // Play with user interaction handling
    const audio = audioRef.current;
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Auto-play was prevented
        // Show UI to let the user manually start playback
        console.log("Audio playback was prevented. User interaction required.");
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [url, musicVolume, isMuted]);
  
  return null;
};

// Sound effect hook
export const useAudio = () => {
  const { sfxVolume, isMuted, toggleMute } = useAudioSettings();
  const soundCache = useRef<Record<string, HTMLAudioElement>>({});
  
  // Preload common sound effects
  useEffect(() => {
    const sounds = AUDIO.SOUND_EFFECTS;
    
    Object.entries(sounds).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.load();
      soundCache.current[key] = audio;
    });
    
    return () => {
      // Clean up audio elements
      Object.values(soundCache.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      soundCache.current = {};
    };
  }, []);
  
  // Play sound effect function
  const playSound = useCallback((soundName: string) => {
    if (isMuted) return;
    
    const sound = soundCache.current[soundName];
    if (sound) {
      sound.volume = sfxVolume;
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Handle play failure silently
      });
    }
  }, [sfxVolume, isMuted]);
  
  // Specific sound functions
  const playConsume = useCallback(() => playSound('CONSUME'), [playSound]);
  const playPowerUp = useCallback(() => playSound('POWER_UP'), [playSound]);
  const playSuccess = useCallback(() => playSound('LEVEL_COMPLETE'), [playSound]);
  const playHit = useCallback(() => playSound('DAMAGE'), [playSound]);
  
  return {
    playSound,
    playConsume,
    playPowerUp,
    playSuccess,
    playHit,
    isMuted,
    toggleMute
  };
};