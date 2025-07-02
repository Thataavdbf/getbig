import React, { useRef, useMemo } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

// Custom shader material for reality distortion
const RealityDistortionMaterial = shaderMaterial(
  {
    uTime: 0,
    uBlackHolePosition: new THREE.Vector3(0, 0, 0),
    uBlackHoleSize: 1.0,
    uDistortionStrength: 0.5,
    uColorShift: 0.2,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform vec3 uBlackHolePosition;
    uniform float uBlackHoleSize;
    uniform float uDistortionStrength;
    uniform float uColorShift;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      vec3 blackHoleDir = vWorldPosition - uBlackHolePosition;
      float distanceToBlackHole = length(blackHoleDir);
      
      // Calculate gravitational lensing effect
      float influence = uBlackHoleSize / (distanceToBlackHole + 0.1);
      influence = clamp(influence, 0.0, 1.0);
      
      // Space-time distortion
      vec2 distortedUv = vUv;
      float angle = atan(blackHoleDir.z, blackHoleDir.x);
      float spiral = sin(angle * 3.0 + uTime * 2.0) * influence * uDistortionStrength;
      
      distortedUv.x += spiral * 0.1;
      distortedUv.y += cos(angle * 2.0 + uTime) * influence * uDistortionStrength * 0.05;
      
      // Chromatic aberration near black hole
      vec3 color = vec3(0.0);
      float aberration = influence * uColorShift;
      
      color.r = sin(distortedUv.x * 10.0 + uTime) * 0.5 + 0.5;
      color.g = sin(distortedUv.y * 8.0 + uTime * 1.3) * 0.5 + 0.5;
      color.b = sin((distortedUv.x + distortedUv.y) * 6.0 + uTime * 0.8) * 0.5 + 0.5;
      
      // Add red shift near black hole
      color.r += influence * 0.3;
      color.g *= (1.0 - influence * 0.5);
      color.b *= (1.0 - influence * 0.7);
      
      // Time dilation visual effect
      float timeDistortion = influence * sin(uTime * 5.0) * 0.1;
      color *= (1.0 + timeDistortion);
      
      // Event horizon darkness
      if (distanceToBlackHole < uBlackHoleSize * 1.2) {
        float darkness = 1.0 - (distanceToBlackHole / (uBlackHoleSize * 1.2));
        color *= (1.0 - darkness * 0.8);
      }
      
      gl_FragColor = vec4(color, 0.1 + influence * 0.3);
    }
  `
);

// Extend THREE namespace with proper typing
declare global {
  namespace JSX {
    interface IntrinsicElements {
      realityDistortionMaterial: any;
    }
  }
}

extend({ RealityDistortionMaterial });

interface RealityDistortionProps {
  blackHolePosition: THREE.Vector3;
  blackHoleSize: number;
}

export default function RealityDistortion({ blackHolePosition, blackHoleSize }: RealityDistortionProps) {
  const materialRef = useRef<any>();
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      materialRef.current.uBlackHolePosition = blackHolePosition;
      materialRef.current.uBlackHoleSize = blackHoleSize;
      materialRef.current.uDistortionStrength = Math.min(blackHoleSize * 0.1, 1.0);
    }
  });
  
  return (
    <mesh position={[0, 0, 0]} scale={[200, 200, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <realityDistortionMaterial
        ref={materialRef}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
