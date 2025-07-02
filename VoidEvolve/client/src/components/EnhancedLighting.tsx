import React from "react";
import * as THREE from "three";

export default function EnhancedLighting() {
  return (
    <>
      {/* Main directional light for general illumination */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.3} />
      
      {/* Point lights for dramatic metallic reflections */}
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#FFE135" />
      <pointLight position={[-5, 5, -5]} intensity={0.6} color="#35A7FF" />
      <pointLight position={[0, -5, 5]} intensity={0.4} color="#FF3565" />
      
      {/* Hemisphere light for realistic environment lighting */}
      <hemisphereLight
        args={["#87CEEB", "#8B4513", 0.4]}
      />
      
      {/* Spotlight for dramatic effect */}
      <spotLight
        position={[0, 15, 0]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={0.8}
        castShadow
        color="#FFFFFF"
      />
    </>
  );
}
