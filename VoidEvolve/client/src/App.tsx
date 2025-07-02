import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGame } from "./lib/stores/useGame";
import { useAudio } from "./lib/stores/useAudio";
import Game from "./components/Game";
import GameUI from "./components/GameUI";
import ElementSelector from "./components/ElementSelector";
import EnvironmentSelector from "./components/EnvironmentSelector";
import AudioManager from "./components/AudioManager";
import GameFeaturesSummary from "./components/GameFeaturesSummary";
import "@fontsource/inter";

function App() {
  const { phase } = useGame();
  const { toggleMute, isMuted } = useAudio();

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (phase === "ready") {
      useGame.getState().start();
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (phase === "ready") {
        useGame.getState().start();
      } else if (phase === "ended") {
        useGame.getState().restart();
      }
    } else if (e.code === "KeyM") {
      e.preventDefault();
      toggleMute();
    }
  };

  // Add keyboard event listeners
  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [phase]);

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'relative', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1A0B2E 50%, #0D1B2A 100%)',
        touchAction: 'none'
      }}
      onClick={handleCanvasClick}
      onTouchStart={handleCanvasClick}
    >
      <Canvas
        shadows
        camera={{
          position: [0, 10, 10],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false
        }}
        style={{ touchAction: 'none' }}
      >
        <color attach="background" args={["#0D1B2A"]} />
        
        {/* Ambient lighting for cosmic atmosphere */}
        <ambientLight intensity={0.3} color="#00F5FF" />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.8} 
          color="#FF6B35"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <Suspense fallback={null}>
          <Game />
        </Suspense>
      </Canvas>
      
      <GameUI />
      <ElementSelector />
      <EnvironmentSelector />
      
      {/* Enhanced features summary */}
      {phase === "playing" && <GameFeaturesSummary />}
      
      <AudioManager />
      
      {/* Audio toggle button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(26, 11, 46, 0.8)',
          border: '2px solid #00F5FF',
          color: '#00F5FF',
          padding: '10px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '18px',
          zIndex: 1000,
          fontFamily: 'Orbitron, monospace'
        }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

export default App;
