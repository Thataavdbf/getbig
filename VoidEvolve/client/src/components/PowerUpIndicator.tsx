import React from 'react';
import { usePowerUps } from '../lib/stores/usePowerUps';

const PowerUpIndicator: React.FC = () => {
  const { activePowerUps } = usePowerUps();
  
  if (activePowerUps.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2">
      {activePowerUps.map(powerUp => (
        <div 
          key={powerUp.id}
          className="bg-black bg-opacity-50 p-2 rounded flex items-center"
        >
          <div 
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: getPowerUpColor(powerUp.type) }}
          />
          <span className="text-white text-sm">
            {powerUp.type.charAt(0).toUpperCase() + powerUp.type.slice(1)}
            {powerUp.timeRemaining ? ` (${Math.ceil(powerUp.timeRemaining)}s)` : ''}
          </span>
        </div>
      ))}
    </div>
  );
};

// Helper function to get color based on power-up type
function getPowerUpColor(type: string): string {
  const colors: Record<string, string> = {
    speed: '#76ff03',    // Bright green
    size: '#ff3d00',     // Orange-red
    energy: '#ffea00',   // Bright yellow
    shield: '#2979ff',   // Bright blue
    magnet: '#d500f9',   // Bright purple
    time_slow: '#00e5ff' // Cyan
  };
  
  return colors[type] || '#ffffff';
}

export default PowerUpIndicator;