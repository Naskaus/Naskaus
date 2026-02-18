'use client';

import { useEffect, useRef, forwardRef } from 'react';
import { gsap } from '@/lib/gsap';

interface SectionCardProps {
  title: string;
  accentColor?: string;
  className?: string;
  children?: React.ReactNode;
  animate?: boolean;
}

const SectionCard = forwardRef<HTMLDivElement, SectionCardProps>(
  ({ title, accentColor = '#FF9500', className = '', children, animate = true }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const borderRef = useRef<SVGRectElement>(null);

    useEffect(() => {
      if (!animate || !cardRef.current) return;

      // Initial state
      gsap.set(cardRef.current, {
        scale: 0.1,
        rotation: 360,
        opacity: 0,
      });

      // Animate in
      gsap.to(cardRef.current, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.2,
      });
    }, [animate]);

    // SVG border animation
    useEffect(() => {
      if (!borderRef.current) return;

      const length = borderRef.current.getTotalLength();
      gsap.set(borderRef.current, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      gsap.to(borderRef.current, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut',
        delay: 0.5,
        repeat: -1,
        yoyo: true,
      });
    }, []);

    return (
      <div
        ref={(node) => {
          (cardRef as any).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`relative ${className}`}
        style={{
          width: '540px',
          maxWidth: '90vw',
          height: '340px',
        }}
      >
        {/* Glass background */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'rgba(255, 251, 240, 0.04)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        />

        {/* Animated SVG border */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ borderRadius: '16px' }}
        >
          <rect
            ref={borderRef}
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="16"
            ry="16"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            strokeOpacity="0.5"
          />
        </svg>

        {/* Static border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            border: `1px solid ${accentColor}30`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
          {/* Title */}
          <h3
            className="font-heading text-2xl tracking-widest mb-6"
            style={{ color: accentColor }}
          >
            {title}
          </h3>

          {/* Children / Orbiting planets placeholder */}
          {children || (
            <div className="relative w-32 h-32">
              {/* Orbiting dots */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    background: accentColor,
                    boxShadow: `0 0 10px ${accentColor}`,
                    animation: `orbit ${3 + i * 0.5}s linear infinite`,
                    animationDelay: `${i * 0.25}s`,
                    left: '50%',
                    top: '50%',
                    transformOrigin: `${20 + i * 10}px 0`,
                  }}
                />
              ))}
              {/* Center dot */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                style={{
                  background: 'white',
                  boxShadow: '0 0 20px rgba(255,255,255,0.5)',
                }}
              />
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes orbit {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }
);

SectionCard.displayName = 'SectionCard';

export default SectionCard;
