import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Stars, Cloud, Sky } from "@react-three/drei";
import { useEnvironment } from "@/lib/stores/useEnvironment";

const DynamicLighting = () => {
  const light = useRef<THREE.PointLight>(null!);

  useFrame(() => {
    light.current.position.set(
      Math.sin(Date.now() * 0.001) * 10,
      Math.cos(Date.now() * 0.001) * 10,
      5
    );
  });

  return <pointLight ref={light} intensity={1} color="white" />;
};

// Add default values for ambientLightIntensity if it's not in the store
export default function Environment() {
  const { 
    currentEnvironment, 
    fogDensity = 0.02, 
    ambientLightIntensity = 0.3 
  } = useEnvironment();
  
  const groupRef = useRef<THREE.Group>(null);

  // Configure fog based on environment
  const fog = useMemo(() => {
    const colors = {
      space: "#0D1B2A",
      alien_planet: "#1A0B2E",
      cybercity: "#000511",
      ancient_ruins: "#2C1B0E",
      time_vortex: "#100030",
    };

    const color = colors[currentEnvironment as keyof typeof colors] || colors.space;
    return new THREE.FogExp2(color, fogDensity);
  }, [currentEnvironment, fogDensity]);

  // Animate environment
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Apply environment-specific animations
    switch (currentEnvironment) {
      case "time_vortex":
        // Rotate the whole environment for time vortex
        groupRef.current.rotation.z += delta * 0.05;
        break;

      case "cybercity":
        // Grid movement for cyber city
        if (groupRef.current.userData.grid) {
          groupRef.current.userData.grid.position.y -= delta * 0.2;
          if (groupRef.current.userData.grid.position.y < -10) {
            groupRef.current.userData.grid.position.y = 0;
          }
        }
        break;

      default:
        // Default animations
        break;
    }
  });

  // Render the appropriate environment
  const renderEnvironment = () => {
    switch (currentEnvironment) {
      case "space":
        return (
          <>
            <Stars radius={100} depth={50} count={5000} factor={4} fade />
            <fog attach="fog" args={["#0D1B2A", 0, 40]} />
          </>
        );

      case "alien_planet":
        return (
          <>
            <Sky
              distance={450000}
              sunPosition={[0, 1, 0]}
              inclination={0.6}
              azimuth={0.1}
              rayleigh={1}
              turbidity={10}
              mieCoefficient={0.004}
              mieDirectionalG={0.8}
            />

            {/* Alien crystals */}
            {Array.from({ length: 30 }).map((_, i) => (
              <mesh
                key={`crystal-${i}`}
                position={[
                  Math.random() * 100 - 50,
                  -2,
                  Math.random() * 100 - 50,
                ]}
                rotation={[0, Math.random() * Math.PI, 0]}
              >
                <coneGeometry args={[0.5, 2, 5]} />
                <meshStandardMaterial
                  color="#9c27b0"
                  emissive="#9c27b0"
                  emissiveIntensity={0.2}
                />
              </mesh>
            ))}

            <fog attach="fog" args={["#1A0B2E", 10, 50]} />
          </>
        );

      case "cybercity":
        return (
          <>
            {/* Grid floor */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -2, 0]}
              ref={(el) => {
                if (el && groupRef.current) {
                  groupRef.current.userData.grid = el;
                }
              }}
            >
              <planeGeometry args={[100, 100, 50, 50]} />
              <meshStandardMaterial
                color="#003366"
                wireframe={true}
                emissive="#00aaff"
                emissiveIntensity={0.2}
              />
            </mesh>

            {/* Digital particles */}
            {Array.from({ length: 100 }).map((_, i) => (
              <mesh
                key={`data-${i}`}
                position={[
                  Math.random() * 80 - 40,
                  Math.random() * 30 - 10,
                  Math.random() * 80 - 40,
                ]}
              >
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial
                  color="#00ffff"
                  emissive="#00ffff"
                  emissiveIntensity={1}
                />
              </mesh>
            ))}

            <fog attach="fog" args={["#000511", 5, 30]} />
          </>
        );

      case "ancient_ruins":
        return (
          <>
            <Sky
              distance={450000}
              sunPosition={[0, 0.1, 0]}
              inclination={0.2}
              azimuth={0.25}
              rayleigh={0.5}
              turbidity={20}
            />

            {/* Ancient columns */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const radius = 20;
              return (
                <mesh
                  key={`column-${i}`}
                  position={[
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius,
                  ]}
                >
                  <cylinderGeometry args={[1, 1, 10, 8]} />
                  <meshStandardMaterial color="#a1887f" />
                </mesh>
              );
            })}

            {/* Desert ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#d2b48c" />
            </mesh>

            <fog attach="fog" args={["#2C1B0E", 10, 40]} />
          </>
        );

      case "time_vortex":
        return (
          <>
            {/* Vortex rings */}
            {Array.from({ length: 5 }).map((_, i) => (
              <mesh
                key={`ring-${i}`}
                position={[0, 0, -i * 5]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <torusGeometry args={[10 + i * 3, 0.5, 16, 100]} />
                <meshStandardMaterial
                  color="#8800ff"
                  emissive="#8800ff"
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            ))}

            {/* Time particles */}
            {Array.from({ length: 200 }).map((_, i) => (
              <mesh
                key={`time-particle-${i}`}
                position={[
                  Math.random() * 40 - 20,
                  Math.random() * 40 - 20,
                  Math.random() * 40 - 20,
                ]}
              >
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial
                  color="#ff00ff"
                  emissive="#ff00ff"
                  emissiveIntensity={1}
                />
              </mesh>
            ))}

            <fog attach="fog" args={["#100030", 5, 25]} />
          </>
        );

      default:
        return (
          <>
            <Stars radius={100} depth={50} count={5000} factor={4} fade />
            <fog attach="fog" args={["#0D1B2A", 0, 40]} />
          </>
        );
    }
  };

  return (
    <group ref={groupRef}>
      <DynamicLighting />
      {renderEnvironment()}
    </group>
  );
}
