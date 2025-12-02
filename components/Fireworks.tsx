import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
}

interface FireworksProps {
  trigger: boolean;
  theme: 'classic' | 'neon' | 'gold';
}

export const Fireworks: React.FC<FireworksProps> = ({ trigger, theme }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const getColors = (theme: string) => {
    switch (theme) {
      case 'neon':
        return ['#F012BE', '#01FF70', '#0074D9', '#FF851B', '#7FDBFF', '#B10DC9', '#FFDC00', '#FF4136'];
      case 'gold':
        return ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#D97706', '#B45309', '#92400E', '#78350F'];
      default:
        return ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C', '#9D4EDD', '#F78C6B', '#48C9B0'];
    }
  };

  useEffect(() => {
    if (trigger) {
      const colors = getColors(theme);
      const newParticles: Particle[] = [];
      const particleCount = 60;

      // Create particles from center of screen
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
        const velocity = 4 + Math.random() * 6;
        const color = colors[Math.floor(Math.random() * colors.length)];

        newParticles.push({
          id: i,
          x: 50,
          y: 50,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          color,
          life: 1,
          maxLife: 1,
        });
      }

      particlesRef.current = newParticles;
      setParticles(newParticles);

      // Animation loop
      const animate = () => {
        particlesRef.current = particlesRef.current.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy + 0.15, // gravity
          vy: p.vy + 0.1, // increase downward velocity
          life: p.life - 0.016, // roughly 60fps decay
        })).filter((p) => p.life > 0);

        setParticles([...particlesRef.current]);

        if (particlesRef.current.length > 0) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [trigger, theme]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => {
        const opacity = Math.max(0, particle.life / particle.maxLife);
        const scale = Math.max(0.2, opacity);

        return (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: '8px',
              height: '8px',
              backgroundColor: particle.color,
              opacity: opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              boxShadow: `0 0 15px ${particle.color}, 0 0 25px ${particle.color}`,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </div>
  );
};
