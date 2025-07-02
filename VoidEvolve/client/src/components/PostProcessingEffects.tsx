import React from 'react';
import { 
  EffectComposer, 
  Bloom, 
  ChromaticAberration,
  Vignette
} from '@react-three/postprocessing';
import { useEnvironment } from '@/lib/stores/useEnvironment';
import * as THREE from 'three';

export default function PostProcessingEffects() {
  const { currentEnvironment } = useEnvironment();
  
  // Environment-specific effect settings
  const bloomSettings = {
    space: { intensity: 0.3, luminanceThreshold: 0.2 },
    alien_planet: { intensity: 0.5, luminanceThreshold: 0.1 },
    cybercity: { intensity: 0.6, luminanceThreshold: 0.3 },
    ancient_ruins: { intensity: 0.2, luminanceThreshold: 0.4 },
    time_vortex: { intensity: 0.7, luminanceThreshold: 0.1 }
  };
  
  const settings = bloomSettings[currentEnvironment as keyof typeof bloomSettings] || 
                   bloomSettings.space;
  
  return (
    <EffectComposer>
      <Bloom 
        intensity={settings.intensity} 
        luminanceThreshold={settings.luminanceThreshold}
        luminanceSmoothing={0.9}
      />
      <ChromaticAberration 
        offset={new THREE.Vector2(0.002, 0.002)} 
        radialModulation={true}
        modulationOffset={0.5}
      />
      
      <Vignette 
        eskil={false} 
        offset={0.1} 
        darkness={1.1}
      />
    </EffectComposer>
  );
}