import React from "react";

export default function GameFeaturesSummary() {
  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm max-w-sm z-50">
      <h3 className="text-lg font-bold mb-2">✨ VoidEvolve Enhanced!</h3>
      
      <div className="space-y-2">
        <div className="border-b border-gray-600 pb-2">
          <h4 className="font-semibold text-blue-300">🎨 Visual Enhancements</h4>
          <ul className="text-xs space-y-1 mt-1">
            <li>• Metallic/Glass materials with reflections</li>
            <li>• Pulsing glow effects based on shrinkage</li>
            <li>• Color-changing materials when consumed</li>
            <li>• Enhanced lighting with multiple sources</li>
            <li>• Environment cube mapping for reflections</li>
          </ul>
        </div>
        
        <div className="border-b border-gray-600 pb-2">
          <h4 className="font-semibold text-green-300">⚡ Gameplay Features</h4>
          <ul className="text-xs space-y-1 mt-1">
            <li>• Objects 2x smaller, 40% slower shrinking</li>
            <li>• Material-based object properties</li>
            <li>• Orbital mechanics system</li>
            <li>• Advanced power-up system</li>
            <li>• Moving environmental hazards</li>
          </ul>
        </div>
        
        <div className="border-b border-gray-600 pb-2">
          <h4 className="font-semibold text-purple-300">🌟 Advanced Effects</h4>
          <ul className="text-xs space-y-1 mt-1">
            <li>• Reality distortion shader</li>
            <li>• Particle trail system</li>
            <li>• Gravitational lensing</li>
            <li>• Dynamic material responses</li>
            <li>• Environment-specific materials</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-yellow-300">🎯 Material Types</h4>
          <ul className="text-xs space-y-1 mt-1">
            <li>• <span className="text-gray-400">Metal:</span> High reflectivity</li>
            <li>• <span className="text-blue-400">Crystal:</span> Glass-like transparency</li>
            <li>• <span className="text-green-400">Organic:</span> Natural textures</li>
            <li>• <span className="text-red-400">Energy:</span> Glowing plasma</li>
            <li>• <span className="text-purple-400">Neon:</span> Digital aesthetics</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        Objects now respond dynamically to black hole proximity with advanced materials and effects!
      </div>
    </div>
  );
}
