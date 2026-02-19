'use client';

import { useRef, useCallback } from 'react';
import { gsap } from '@/lib/gsap';
import type { LabApp } from '@/data/apps';

interface LabCardProps {
  app: LabApp;
  className?: string;
}

export default function LabCard({ app, className = '' }: LabCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const isTouchRef = useRef(false);

  // Detect touch device once on first interaction
  const checkTouch = useCallback(() => {
    if (typeof window !== 'undefined' && !isTouchRef.current) {
      isTouchRef.current = !window.matchMedia('(hover: hover)').matches;
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    checkTouch();
    if (isTouchRef.current) return; // Skip 3D tilt on touch devices
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

    gsap.set(card, { rotateX, rotateY, y: -12, scale: 1.02, transformPerspective: 800 });

    // Move glow to cursor position
    glow.style.opacity = '1';
    glow.style.background = `radial-gradient(300px circle at ${x}px ${y}px, ${app.color}25, transparent 70%)`;
  }, [app.color]);

  const handleMouseLeave = useCallback(() => {
    if (isTouchRef.current) return;
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, scale: 1, transformPerspective: 800, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    glow.style.opacity = '0';
  }, []);

  const handleVisit = useCallback(() => {
    window.open(app.url, '_blank', 'noopener,noreferrer');
  }, [app.url]);

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl overflow-hidden interactive ${className}`}
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
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '2/1' }}>
        <img
          src={app.image}
          alt={`${app.name} screenshot`}
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />

        {/* Gradient overlay on image bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-8 sm:h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
          }}
        />

        {/* Badge */}
        {app.badge && (
          <div
            className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold z-20"
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
      <div className="relative z-20 px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-3">
        {/* App name */}
        <h4
          className="font-heading text-sm sm:text-base md:text-lg font-semibold mb-0.5"
          style={{ color: app.color }}
        >
          {app.name}
        </h4>

        {/* Description */}
        <p className="text-[11px] sm:text-xs md:text-sm mb-1 sm:mb-1.5 leading-snug line-clamp-2 sm:line-clamp-none" style={{ color: 'var(--text-secondary)' }}>
          {app.desc}
        </p>

        {/* Tech tags — hidden on mobile */}
        <div className="hidden sm:flex flex-wrap gap-1 mb-2">
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

        {/* CTA — hidden on mobile */}
        <div
          className="hidden sm:flex group items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300"
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
