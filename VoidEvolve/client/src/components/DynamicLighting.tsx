import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useEnvironment } from '@/lib/stores/useEnvironment';

export function DynamicLighting() {
  const { currentEnvironment } = useEnvironment();
  const pointLight = useRef<THREE.PointLight>(null!);
  const ambientLight = useRef<THREE.AmbientLight>(null!);
  
  // Environment-specific lighting configurations
  const lightConfigs = {
    deep_space: {
      point: { color: '#4cc9f0', intensity: 1.5 },
      ambient: { color: '#1b1b3a', intensity: 0.5 },
      animation: 'slow_pulse'
    },
    alien_planet: {
      point: { color: '#bf00ff', intensity: 1.8 },
      ambient: { color: '#301934', intensity: 0.6 },
      animation: 'colorshift'
    },
    cybercity: {
      point: { color: '#00faff', intensity: 2.0 },
      ambient: { color: '#060c21', intensity: 0.4 },
      animation: 'techpulse'
    },
    ancient_ruins: {
      point: { color: '#ffd700', intensity: 1.4 },
      ambient: { color: '#382b22', intensity: 0.7 },
      animation: 'sunlight'
    },
    time_vortex: {
      point: { color: '#c300ff', intensity: 1.7 },
      ambient: { color: '#120021', intensity: 0.4 },
      animation: 'vortex'
    }
  };
  
  useFrame((state, delta) => {
    if (!pointLight.current || !ambientLight.current) return;
    
    const config = lightConfigs[currentEnvironment as keyof typeof lightConfigs] || 
                   lightConfigs.deep_space;
    
    // Update colors
    pointLight.current.color.set(config.point.color);
    pointLight.current.intensity = config.point.intensity;
    ambientLight.current.color.set(config.ambient.color);
    ambientLight.current.intensity = config.ambient.intensity;
    
    // Animate based on environment
    switch (config.animation) {
      case 'slow_pulse':
        pointLight.current.intensity = config.point.intensity * 
          (0.8 + 0.2 * Math.sin(state.clock.elapsedTime * 0.5));
        break;
      case 'colorshift':
        const hue = (state.clock.elapsedTime * 0.1) % 1;
        pointLight.current.color.setHSL(hue, 0.7, 0.5);
        break;
      case 'techpulse':
        pointLight.current.intensity = config.point.intensity * 
          (0.7 + 0.3 * Math.sin(state.clock.elapsedTime * 2));
        pointLight.current.position.x = Math.sin(state.clock.elapsedTime) * 10;
        break;
      case 'sunlight':
        pointLight.current.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 15;
        pointLight.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 0.1)) * 10 + 5;
        break;
      case 'vortex':
        pointLight.current.position.x = Math.sin(state.clock.elapsedTime) * 8;
        pointLight.current.position.z = Math.cos(state.clock.elapsedTime) * 8;
        pointLight.current.intensity = config.point.intensity * 
          (0.6 + 0.4 * Math.sin(state.clock.elapsedTime * 3));
        break;
    }
  });
  
  return (
    <>
      <ambientLight ref={ambientLight} />
      <pointLight ref={pointLight} position={[0, 10, 0]} castShadow />
    </>
  );
}