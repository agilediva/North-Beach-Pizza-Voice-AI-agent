import React from 'react';

interface VisualizerProps {
  isActive: boolean;
  volume: number;
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, volume }) => {
  const bars = 5;
  
  return (
    <div className="flex items-center justify-center space-x-1 h-12 w-24">
      {Array.from({ length: bars }).map((_, i) => {
        // Calculate height based on volume, randomized slightly for effect
        const height = isActive 
          ? Math.max(10, Math.min(100, volume * 400 * (Math.random() * 0.5 + 0.8))) 
          : 10;
        
        return (
          <div
            key={i}
            className={`w-3 rounded-full transition-all duration-75 ${isActive ? 'bg-red-600' : 'bg-stone-300'}`}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
};

export default Visualizer;