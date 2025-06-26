import React from "react";
import { useGame } from "../lib/stores/useGame";
import { useBlackHole } from "../lib/stores/useBlackHole";
import { useElements } from "../lib/stores/useElements";
import { useEnvironment } from "../lib/stores/useEnvironment";

export default function GameUI() {
  const { phase } = useGame();
  const { size, score } = useBlackHole();
  const { currentElement, elementLevel, elementEnergy, maxEnergy } = useElements();
  const { currentEnvironment, destructionCount } = useEnvironment();

  const getElementColor = (element: string) => {
    switch (element) {
      case "fire": return "#FF4757";
      case "ice": return "#3742FA";
      case "gravity": return "#5F27CD";
      default: return "#00F5FF";
    }
  };

  const handleStart = () => {
    if (phase === "ready") {
      useGame.getState().start();
    }
  };

  const handleRestart = () => {
    if (phase === "ended") {
      useGame.getState().restart();
      useBlackHole.getState().reset();
      useElements.getState().reset();
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 100,
      fontFamily: 'Orbitron, monospace'
    }}>
      {/* Game Stats (always visible during gameplay) */}
      {phase === "playing" && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(26, 11, 46, 0.9)',
          border: '2px solid #00F5FF',
          borderRadius: '10px',
          padding: '12px',
          color: '#00F5FF',
          minWidth: '180px',
          fontSize: '14px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
            VOIDSPAWN
          </div>
          <div style={{ fontSize: '14px', marginBottom: '5px' }}>
            Score: {score.toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', marginBottom: '5px' }}>
            Size: {size.toFixed(1)}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.8 }}>
            Environment: {currentEnvironment.replace('_', ' ').toUpperCase()}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.8 }}>
            Destruction: {destructionCount}
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#1A0B2E',
            borderRadius: '4px',
            marginTop: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, (score / 1000) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #FF6B35, #00F5FF)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.8 }}>
            Target: 1000 points
          </div>
        </div>
      )}

      {/* Element Power Status */}
      {phase === "playing" && currentElement !== "none" && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(26, 11, 46, 0.9)',
          border: `2px solid ${getElementColor(currentElement)}`,
          borderRadius: '10px',
          padding: '12px',
          color: getElementColor(currentElement),
          minWidth: '140px',
          fontSize: '14px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
            {currentElement.toUpperCase()} LV.{elementLevel}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '5px' }}>
            Energy: {Math.floor(elementEnergy)}/{maxEnergy}
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: '#1A0B2E',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(elementEnergy / maxEnergy) * 100}%`,
              height: '100%',
              background: getElementColor(currentElement),
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Start Screen */}
      {phase === "ready" && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#00F5FF',
          pointerEvents: 'auto'
        }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '900',
            marginBottom: '20px',
            background: 'linear-gradient(45deg, #FF6B35, #00F5FF, #FF6B35)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(0, 245, 255, 0.5)'
          }}>
            VOIDSPAWN
          </h1>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '30px',
            fontFamily: 'Exo 2, sans-serif',
            opacity: 0.9
          }}>
            Control the cosmic void and consume everything in your path
          </p>
          <button
            onClick={handleStart}
            style={{
              background: 'linear-gradient(45deg, #FF6B35, #00F5FF)',
              border: 'none',
              color: '#1A0B2E',
              padding: '15px 30px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '10px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 245, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 245, 255, 0.3)';
            }}
          >
            Enter the Void
          </button>
          <div style={{
            marginTop: '30px',
            fontSize: '0.9rem',
            opacity: 0.7,
            fontFamily: 'Exo 2, sans-serif',
            textAlign: 'center'
          }}>
            <p>Touch and drag to control the black hole</p>
            <p>Choose an elemental power below</p>
            <p>Consume objects to grow larger</p>
            <p>Tap M for sound | Tap Space to start</p>
          </div>
        </div>
      )}

      {/* End Screen */}
      {phase === "ended" && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#00F5FF',
          pointerEvents: 'auto'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '900',
            marginBottom: '20px',
            color: '#FF6B35',
            textShadow: '0 0 30px rgba(255, 107, 53, 0.5)'
          }}>
            VOID MASTERY
          </h1>
          <p style={{
            fontSize: '1.5rem',
            marginBottom: '20px',
            fontFamily: 'Exo 2, sans-serif'
          }}>
            Final Score: {score.toLocaleString()}
          </p>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '30px',
            fontFamily: 'Exo 2, sans-serif',
            opacity: 0.8
          }}>
            Maximum Size: {size.toFixed(1)}
          </p>
          <button
            onClick={handleRestart}
            style={{
              background: 'linear-gradient(45deg, #FF6B35, #00F5FF)',
              border: 'none',
              color: '#1A0B2E',
              padding: '15px 30px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '10px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 245, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 245, 255, 0.3)';
            }}
          >
            Restart Void
          </button>
          <div style={{
            marginTop: '30px',
            fontSize: '0.9rem',
            opacity: 0.7,
            fontFamily: 'Exo 2, sans-serif'
          }}>
            Press Space to restart
          </div>
        </div>
      )}
    </div>
  );
}
