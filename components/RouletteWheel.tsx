import React, { useEffect, useState, useRef } from 'react';
import { WheelItem, VisualTheme } from '../types';
import { playWinSound } from '../services/soundService';

interface RouletteWheelProps {
  items: WheelItem[];
  winningIndex: number | null;
  isSpinning: boolean;
  onSpinComplete: () => void;
  duration: number;
  theme: VisualTheme;
}

const getColors = (theme: VisualTheme) => {
  switch (theme) {
    case 'neon':
      return [
        '#F012BE', // Neon Pink
        '#01FF70', // Neon Green
        '#0074D9', // Neon Blue
        '#FF851B', // Neon Orange
        '#7FDBFF', // Neon Cyan
        '#B10DC9', // Neon Purple
        '#FFDC00', // Neon Yellow
        '#FF4136', // Neon Red
      ];
    case 'gold':
      return [
        '#B45309', // Dark Amber
        '#F59E0B', // Amber
        '#78350F', // Very Dark Amber
        '#D97706', // Dark Yellow
        '#1F2937', // Grey 800
        '#FCD34D', // Light Amber
        '#000000', // Black
        '#92400E', // Brown
      ];
    default: // Classic
      return [
        '#EF476F', // Pink
        '#FFD166', // Yellow
        '#06D6A0', // Green
        '#118AB2', // Blue
        '#073B4C', // Dark Blue
        '#9D4EDD', // Purple
        '#F78C6B', // Orange
        '#48C9B0', // Teal
      ];
  }
};

export const RouletteWheel: React.FC<RouletteWheelProps> = ({ 
  items, 
  winningIndex, 
  isSpinning, 
  onSpinComplete,
  duration,
  theme
}) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<SVGSVGElement>(null);
  
  // Calculate slice path
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const numItems = items.length;
  const sliceAngle = 360 / numItems;
  const colors = getColors(theme);

  useEffect(() => {
    if (isSpinning && winningIndex !== null) {
      const extraSpins = 5; 
      const randomOffset = Math.random() * (sliceAngle * 0.8) - (sliceAngle * 0.4); 
      
      const winningSliceAngle = (winningIndex + 0.5) * sliceAngle;
      
      const targetRotation = 270 - winningSliceAngle + (extraSpins * 360) + randomOffset;
      
      const currentRotationMod = rotation % 360;
      const finalRotation = rotation + (targetRotation - currentRotationMod) + (360 * extraSpins);

      setRotation(finalRotation);

      const timeout = setTimeout(() => {
        playWinSound();
        onSpinComplete();
      }, duration * 1000); 

      return () => clearTimeout(timeout);
    }
  }, [isSpinning, winningIndex, items.length, onSpinComplete, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine pointer color
  const pointerColor = theme === 'neon' ? '#01FF70' : theme === 'gold' ? '#F59E0B' : '#E11D48';
  // Determine border color
  const borderColor = theme === 'neon' ? 'border-fuchsia-600' : theme === 'gold' ? 'border-yellow-600' : 'border-slate-700';
  // Determine bg color
  const bgColor = theme === 'neon' ? 'bg-black' : 'bg-slate-800';

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto">
      {/* Pointer */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 pointer-shadow ${isSpinning ? 'animate-tick' : ''}`}>
        <svg width="40" height="50" viewBox="0 0 40 50">
          <path d="M20 50 L0 0 L40 0 Z" fill={pointerColor} stroke="#FFF" strokeWidth="2" />
        </svg>
      </div>

      {/* Wheel */}
      <div 
        className={`w-full h-full rounded-full overflow-hidden border-8 shadow-2xl ${borderColor} ${bgColor}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? `transform ${duration}s cubic-bezier(0.1, 0, 0.1, 1)` : 'none',
          boxShadow: theme === 'neon' ? '0 0 40px rgba(240, 18, 190, 0.4)' : ''
        }}
      >
        <svg 
          ref={wheelRef}
          viewBox="-1 -1 2 2" 
          className="w-full h-full transform -rotate-0" 
          style={{ overflow: 'visible' }}
        >
          {items.map((item, index) => {
            const startAngle = index / numItems;
            const endAngle = (index + 1) / numItems;
            
            const [startX, startY] = getCoordinatesForPercent(startAngle);
            const [endX, endY] = getCoordinatesForPercent(endAngle);
            
            const largeArcFlag = 1 / numItems > 0.5 ? 1 : 0;
            
            const pathData = [
              `M 0 0`,
              `L ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `Z`
            ].join(' ');

            const midAngle = startAngle + (0.5 / numItems);
            const rotationAngle = midAngle * 360; 
            const flipText = rotationAngle > 90 && rotationAngle < 270;

            const sliceColor = colors[index % colors.length];

            return (
              <g key={item.value}>
                <path 
                    d={pathData} 
                    fill={sliceColor} 
                    stroke={theme === 'neon' ? 'black' : '#1E293B'} 
                    strokeWidth="0.01" 
                />
                <g transform={`rotate(${rotationAngle}) translate(0.6, 0)`}>
                   <text 
                    x="0" 
                    y="0" 
                    fill={theme === 'gold' ? '#FDE68A' : 'white'}
                    fontSize="0.2" 
                    fontWeight="bold" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    transform={flipText ? "rotate(180)" : ""}
                    style={{
                         textShadow: theme === 'neon' ? '0 0 2px black' : 'none'
                    }}
                  >
                    {item.label}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Center Cap */}
      <div className={`
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-10 border-4 
        ${theme === 'neon' ? 'bg-black border-cyan-500' : theme === 'gold' ? 'bg-yellow-900 border-yellow-400' : 'bg-white border-slate-200'}
      `}>
        <span className={`text-xl ${theme === 'neon' ? 'text-cyan-400' : theme === 'gold' ? 'text-yellow-400' : 'text-slate-900'}`}>★</span>
      </div>
    </div>
  );
};