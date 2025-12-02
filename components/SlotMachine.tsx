import React, { useEffect, useState, useRef } from 'react';
import { WheelItem, VisualTheme } from '../types';
import { playWinSound } from '../services/soundService';

interface SlotMachineProps {
  items: WheelItem[];
  isSpinning: boolean;
  onSpinComplete: () => void;
  duration: number;
  theme: VisualTheme;
}

const SLOT_HEIGHT = 120; // height of one item in pixels

export const SlotMachine: React.FC<SlotMachineProps> = ({ 
  items, 
  isSpinning, 
  onSpinComplete,
  duration,
  theme
}) => {
  // We will have 3 reels
  const [reelOffsets, setReelOffsets] = useState([0, 0, 0]);
  const reelsRef = useRef<number[]>([0, 0, 0]);
  // Fixed: Initialize useRef with 0 to satisfy TypeScript requirement for an argument
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  // Extend items to create a loop illusion
  const extendedItems = [...items, ...items, ...items, ...items];

  // Theme styles
  const getContainerStyle = () => {
    switch (theme) {
      case 'neon':
        return 'border-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.3)] bg-black';
      case 'gold':
        return 'border-yellow-600 shadow-[0_0_30px_rgba(202,138,4,0.3)] bg-slate-900';
      default:
        return 'border-slate-700 shadow-2xl bg-slate-800';
    }
  };

  const getWindowStyle = () => {
    switch (theme) {
      case 'neon': return 'bg-slate-900/80 border-cyan-500/30';
      case 'gold': return 'bg-slate-800 border-yellow-500/30';
      default: return 'bg-white/5 border-slate-600';
    }
  };

  useEffect(() => {
    if (isSpinning) {
      startTimeRef.current = performance.now();
      
      const animate = (time: number) => {
        if (!startTimeRef.current) return;
        const elapsed = (time - startTimeRef.current) / 1000; // seconds

        if (elapsed < duration) {
          // Calculate speed based on elapsed time (ease out)
          // Speed starts high and decays
          
          const newOffsets = reelsRef.current.map((offset, index) => {
            // Stagger stop times slightly
            const reelDuration = duration - ((2 - index) * 0.5); 
            
            if (elapsed > reelDuration) {
              // Snap to nearest item if finished
              const itemHeight = 100 / extendedItems.length;
              const snap = Math.round(offset / itemHeight) * itemHeight;
              return snap;
            }

            // Spin speed
            const speed = Math.max(0, 100 * (1 - (elapsed / (duration + 1))));
            return offset + speed;
          });

          reelsRef.current = newOffsets;
          setReelOffsets([...newOffsets]);
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Finished - play win sound
          playWinSound();
          onSpinComplete();
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isSpinning, duration, onSpinComplete, extendedItems.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`
      relative w-full max-w-[400px] aspect-[4/3] mx-auto rounded-3xl border-8 p-6 flex gap-4 overflow-hidden
      ${getContainerStyle()}
    `}>
      {/* Decorative Lights */}
      <div className="absolute top-2 left-2 right-2 h-2 flex justify-between px-2">
        {[...Array(6)].map((_, i) => (
           <div key={i} className={`w-2 h-2 rounded-full ${isSpinning ? 'animate-pulse bg-yellow-400' : 'bg-slate-600'}`}></div>
        ))}
      </div>

      {[0, 1, 2].map((reelIndex) => (
        <div key={reelIndex} className={`
          flex-1 h-full rounded-xl overflow-hidden relative border-2
          ${getWindowStyle()}
        `}>
          {/* Reel Strip */}
          <div 
            className="w-full flex flex-col items-center"
            style={{
              transform: `translateY(-${reelsRef.current[reelIndex] % (items.length * 100)}%)`,
              filter: isSpinning && (performance.now() - (startTimeRef.current || 0)) < (duration * 1000 - 1000) ? 'blur(2px)' : 'none'
            }}
          >
            {/* Repeat items many times for loop illusion */}
            {[...Array(20)].map((_, i) => (
              <React.Fragment key={i}>
                {items.map((item, itemIdx) => (
                   <div 
                      key={`${i}-${itemIdx}`} 
                      className="h-full w-full aspect-[2/3] flex items-center justify-center text-4xl"
                      style={{ height: '120px', flexShrink: 0 }} // fixed height matches calculation logic
                   >
                     <span style={{ 
                        color: theme === 'neon' ? item.color : (theme === 'gold' ? '#F59E0B' : item.color),
                        textShadow: theme === 'neon' ? `0 0 10px ${item.color}` : 'none'
                     }}>
                       {item.label}
                     </span>
                   </div>
                ))}
              </React.Fragment>
            ))}
          </div>
          
          {/* Shine/Glass Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none"></div>
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-red-500/50 -translate-y-1/2 z-10"></div>
        </div>
      ))}

      {/* Decorative Bottom */}
      <div className="absolute bottom-2 left-2 right-2 h-2 flex justify-between px-2">
        {[...Array(6)].map((_, i) => (
           <div key={i} className={`w-2 h-2 rounded-full ${isSpinning ? 'animate-pulse bg-yellow-400' : 'bg-slate-600'}`}></div>
        ))}
      </div>
    </div>
  );
};