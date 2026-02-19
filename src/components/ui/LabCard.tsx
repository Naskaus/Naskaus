'use client';

import { useRef, useCallback } from 'react';
import type { LabApp } from '@/data/apps';

interface LabCardProps {
  app: LabApp;
  className?: string;
}

export default function LabCard({ app, className = '' }: LabCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 3D tilt: max 8 degrees
    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = ((centerY - y) / centerY) * 8;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.02)`;

    // Move glow to cursor position
    glow.style.opacity = '1';
    glow.style.background = `radial-gradient(300px circle at ${x}px ${y}px, ${app.color}25, transparent 70%)`;
  }, [app.color]);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    card.style.transform = '';
    glow.style.opacity = '0';
  }, []);

  const handleVisit = useCallback(() => {
    window.open(app.url, '_blank', 'noopener,noreferrer');
  }, [app.url]);

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl overflow-hidden transition-transform duration-300 ease-out interactive ${className}`}
      style={{
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${app.color}30`,
        boxShadow: `0 4px 30px rgba(0,0,0,0.4)`,
        willChange: 'transform',
        cursor: 'pointer',
      }}
      onClick={handleVisit}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hover glow overlay */}
      <div
        ref={glowRef}
        className="absolute inset-0 z-10 pointer-events-none rounded-2xl transition-opacity duration-300"
        style={{ opacity: 0 }}
      />

      {/* Screenshot */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src={app.image}
          alt={`${app.name} screenshot`}
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />

        {/* Gradient overlay on image bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
          }}
        />

        {/* Badge */}
        {app.badge && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold z-20"
            style={{
              background: app.color,
              color: 'white',
              boxShadow: `0 0 12px ${app.color}80`,
            }}
          >
            {app.badge}
          </div>
        )}
      </div>

      {/* Content panel */}
      <div className="relative z-20 px-4 py-3 md:px-5 md:py-4">
        {/* App name */}
        <h4
          className="font-heading text-base md:text-lg font-semibold mb-1"
          style={{ color: app.color }}
        >
          {app.name}
        </h4>

        {/* Description */}
        <p className="text-xs md:text-sm mb-2.5 leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {app.desc}
        </p>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {app.techTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[10px] font-mono"
              style={{
                background: `${app.color}15`,
                color: `${app.color}cc`,
                border: `1px solid ${app.color}30`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div
          className="group flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300"
          style={{
            background: `${app.color}20`,
            color: app.color,
            border: `1px solid ${app.color}40`,
            pointerEvents: 'none',
          }}
        >
          VISIT APP
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>

      {/* Hover edge glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300"
        style={{
          boxShadow: `inset 0 0 0 1px ${app.color}60, 0 0 30px ${app.color}20`,
        }}
      />

      <style jsx>{`
        div:hover > div:last-child {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
