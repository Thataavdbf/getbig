import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEnvironment } from "../lib/stores/useEnvironment.tsx";

interface EnvironmentObjectProps {
  object: any;
  onDestroy?: () => void;
}

function EnvironmentObject({ object, onDestroy }: EnvironmentObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [destroyed, setDestroyed] = React.useState(false);
  
  useFrame((state) => {
    if (meshRef.current && !destroyed) {
      const time = state.clock.elapsedTime;
      
      // Animate based on object type
      switch (object.type) {
        case "crystal":
          meshRef.current.rotation.y = time * 0.5;
          meshRef.current.position.y = object.position[1] + Math.sin(time * 2 + object.position[0]) * 0.3;
          break;
        case "building":
          // Subtle building sway
          meshRef.current.rotation.z = Math.sin(time * 0.3) * 0.02;
          break;
        case "fragment":
          // Floating temporal fragments
          meshRef.current.rotation.x = time * 0.8;
          meshRef.current.rotation.y = time * 0.6;
          meshRef.current.position.y = object.position[1] + Math.sin(time + object.position[0]) * 2;
          break;
        case "asteroid":
          // Slow asteroid rotation
          meshRef.current.rotation.x = time * 0.1;
          meshRef.current.rotation.z = time * 0.15;
          break;
      }
    }
  });

  const renderGeometry = () => {
    switch (object.type) {
      case "crystal":
        return <coneGeometry args={[1, 3, 6]} />;
      case "building":
        return <boxGeometry args={[2, 8, 2]} />;
      case "pillar":
        return <cylinderGeometry args={[0.8, 1.2, 6, 8]} />;
      case "fragment":
        return <octahedronGeometry args={[1.5]} />;
      case "asteroid":
        return <dodecahedronGeometry args={[2]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  if (destroyed) return null;

  return (
    <mesh
      ref={meshRef}
      position={object.position}
      onClick={() => {
        if (object.destructible && onDestroy) {
          setDestroyed(true);
          onDestroy();
        }
      }}
    >
      {renderGeometry()}
      <meshBasicMaterial
        color={object.color}
        transparent={object.type === "fragment"}
        opacity={object.type === "fragment" ? 0.7 : 1}
      />
    </mesh>
  );
}

export default function DynamicEnvironment() {
  const { currentEnvironment, environmentObjects, addDestruction, generateEnvironmentObjects } = useEnvironment();
  
  // Generate environment objects when environment changes
  React.useEffect(() => {
    generateEnvironmentObjects();
  }, [currentEnvironment, generateEnvironmentObjects]);

  // Environment-specific ground and atmosphere
  const environmentSettings = useMemo(() => {
    switch (currentEnvironment) {
      case "alien_planet":
        return {
          groundColor: "#4A0E4E",
          fogColor: "#8B00FF",
          ambientColor: "#FF6B35"
        };
      case "cybercity":
        return {
          groundColor: "#0D1B2A",
          fogColor: "#1A1A2E",
          ambientColor: "#3742FA"
        };
      case "ancient_ruins":
        return {
          groundColor: "#2F1B14",
          fogColor: "#8B4513",
          ambientColor: "#CD853F"
        };
      case "time_vortex":
        return {
          groundColor: "#1A0B2E",
          fogColor: "#5F27CD",
          ambientColor: "#5F27CD"
        };
      default: // space
        return {
          groundColor: "#1A0B2E",
          fogColor: "#0D1B2A",
          ambientColor: "#00F5FF"
        };
    }
  }, [currentEnvironment]);

  return (
    <>
      {/* Dynamic ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color={environmentSettings.groundColor}
          transparent
          opacity={0.8}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Environment-specific grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial
          color={environmentSettings.ambientColor}
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
      
      {/* Dynamic fog */}
      <fog attach="fog" args={[environmentSettings.fogColor, 30, 100]} />
      
      {/* Environment-specific ambient lighting */}
      <ambientLight intensity={0.3} color={environmentSettings.ambientColor} />
      
      {/* Environment objects */}
      {environmentObjects.map(obj => (
        <EnvironmentObject
          key={obj.id}
          object={obj}
          onDestroy={() => addDestruction()}
        />
      ))}
      
      {/* Environment-specific atmospheric effects */}
      {currentEnvironment === "time_vortex" && (
        <mesh>
          <torusGeometry args={[50, 2, 8, 32]} />
          <meshBasicMaterial
            color="#5F27CD"
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>
      )}
      
      {currentEnvironment === "cybercity" && (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh key={`neon-${i}`} position={[(i - 1.5) * 30, 15, -40]}>
              <boxGeometry args={[0.2, 20, 0.2]} />
              <meshBasicMaterial
                color="#3742FA"
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </>
      )}
    </>
  );
}