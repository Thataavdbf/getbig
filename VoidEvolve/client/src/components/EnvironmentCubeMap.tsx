import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export default function EnvironmentCubeMap() {
  const { scene } = useThree();
  
  // Create a simple environment cube map for reflections
  const envMap = useMemo(() => {
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
    
    // Create a gradient environment
    const geometry = new THREE.SphereGeometry(500, 32, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vWorldPosition;
        void main() {
          vec3 color1 = vec3(0.1, 0.1, 0.3); // Deep space blue
          vec3 color2 = vec3(0.3, 0.1, 0.5); // Purple
          vec3 color3 = vec3(0.05, 0.05, 0.15); // Very dark blue
          
          float gradient = dot(normalize(vWorldPosition), vec3(0.0, 1.0, 0.0));
          vec3 color = mix(color3, mix(color1, color2, sin(time * 0.1) * 0.5 + 0.5), gradient * 0.5 + 0.5);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide
    });
    
    const envSphere = new THREE.Mesh(geometry, material);
    
    // Update the environment map
    cubeCamera.position.set(0, 0, 0);
    scene.add(envSphere);
    cubeCamera.update(scene as any, scene as any);
    scene.remove(envSphere);
    
    return cubeRenderTarget.texture;
  }, [scene]);
  
  // Apply environment map to scene
  React.useEffect(() => {
    if (scene && envMap) {
      scene.environment = envMap;
    }
  }, [scene, envMap]);
  
  return null;
}
