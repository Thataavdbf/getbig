import React from "react";
import { useElements, ElementType } from "../lib/stores/useElements";
import { useGame } from "../lib/stores/useGame";

export default function ElementSelector() {
  const { phase } = useGame();
  const { currentElement, elementLevel, elementEnergy, maxEnergy, setElement } = useElements();

  if (phase !== "ready") return null;

  const elements: { type: ElementType; name: string; color: string; description: string }[] = [
    {
      type: "fire",
      name: "Fire",
      color: "#FF4757",
      description: "Burns through objects faster"
    },
    {
      type: "ice", 
      name: "Ice",
      color: "#3742FA",
      description: "Freezes objects in place"
    },
    {
      type: "gravity",
      name: "Gravity", 
      color: "#5F27CD",
      description: "Pulls objects from distance"
    }
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '15px',
      fontFamily: 'Orbitron, monospace',
      pointerEvents: 'auto'
    }}>
      {elements.map((element) => (
        <button
          key={element.type}
          onClick={() => setElement(element.type)}
          style={{
            background: currentElement === element.type 
              ? `linear-gradient(45deg, ${element.color}, #00F5FF)`
              : 'rgba(26, 11, 46, 0.8)',
            border: `2px solid ${element.color}`,
            borderRadius: '10px',
            padding: '12px 16px',
            color: currentElement === element.type ? '#1A0B2E' : element.color,
            cursor: 'pointer',
            fontFamily: 'Orbitron, monospace',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            minWidth: '80px',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            if (currentElement !== element.type) {
              e.currentTarget.style.background = `rgba(${element.color.slice(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ')}, 0.2)`;
            }
          }}
          onMouseLeave={(e) => {
            if (currentElement !== element.type) {
              e.currentTarget.style.background = 'rgba(26, 11, 46, 0.8)';
            }
          }}
        >
          <div style={{ marginBottom: '4px' }}>{element.name}</div>
          <div style={{ 
            fontSize: '10px', 
            opacity: 0.8,
            lineHeight: 1.2
          }}>
            {element.description}
          </div>
        </button>
      ))}
    </div>
  );
}