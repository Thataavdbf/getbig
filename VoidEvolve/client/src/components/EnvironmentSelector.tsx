import React from "react";
import { useEnvironment, EnvironmentType } from "../lib/stores/useEnvironment";
import { useGame } from "../lib/stores/useGame";

export default function EnvironmentSelector() {
  const { phase } = useGame();
  const { currentEnvironment, setEnvironment } = useEnvironment();

  if (phase !== "ready") return null;

  const environments: { type: EnvironmentType; name: string; color: string; description: string }[] = [
    {
      type: "space",
      name: "Deep Space",
      color: "#00F5FF",
      description: "Asteroid fields and cosmic debris"
    },
    {
      type: "alien_planet", 
      name: "Alien World",
      color: "#FF6B35",
      description: "Crystal formations and alien structures"
    },
    {
      type: "cybercity",
      name: "Cyber City",
      color: "#3742FA",
      description: "Neon buildings and tech platforms"
    },
    {
      type: "ancient_ruins",
      name: "Ancient Ruins",
      color: "#8B4513",
      description: "Stone monuments and pillars"
    },
    {
      type: "time_vortex",
      name: "Time Vortex",
      color: "#5F27CD",
      description: "Floating temporal fragments"
    }
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '10px',
      fontFamily: 'Orbitron, monospace',
      pointerEvents: 'auto',
      flexWrap: 'wrap',
      justifyContent: 'center',
      maxWidth: '90vw'
    }}>
      {environments.map((env) => (
        <button
          key={env.type}
          onClick={() => setEnvironment(env.type)}
          style={{
            background: currentEnvironment === env.type 
              ? `linear-gradient(45deg, ${env.color}, #00F5FF)`
              : 'rgba(26, 11, 46, 0.8)',
            border: `2px solid ${env.color}`,
            borderRadius: '8px',
            padding: '8px 12px',
            color: currentEnvironment === env.type ? '#1A0B2E' : env.color,
            cursor: 'pointer',
            fontFamily: 'Orbitron, monospace',
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            minWidth: '70px',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            if (currentEnvironment !== env.type) {
              e.currentTarget.style.background = `rgba(${env.color.slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ')}, 0.2)`;
            }
          }}
          onMouseLeave={(e) => {
            if (currentEnvironment !== env.type) {
              e.currentTarget.style.background = 'rgba(26, 11, 46, 0.8)';
            }
          }}
        >
          <div style={{ marginBottom: '2px' }}>{env.name}</div>
          <div style={{ 
            fontSize: '8px', 
            opacity: 0.8,
            lineHeight: 1.1
          }}>
            {env.description}
          </div>
        </button>
      ))}
    </div>
  );
}