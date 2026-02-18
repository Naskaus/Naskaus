'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { LAB_APPS } from '@/data/apps';
import SectionCard from '@/components/ui/SectionCard';
import AppBall from '@/components/ui/AppBall';

export default function Section1Lab() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [activeAppIndex, setActiveAppIndex] = useState(-1);
  const [showCard, setShowCard] = useState(false);
  const appRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    const container = containerRef.current;
    const card = cardRef.current;
    const label = labelRef.current;

    if (!section || !container || !card || !label) return;

    // Create main timeline
    const ctx = gsap.context(() => {
      // Pin the section
      const scrollTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1.2,
        onUpdate: (self) => {
          const progress = self.progress;

          // 0-15%: Label and card appear
          if (progress < 0.15) {
            const p = progress / 0.15;
            gsap.set(label, { opacity: p, y: 20 * (1 - p) });
            if (p > 0.5 && !showCard) setShowCard(true);
          } else {
            gsap.set(label, { opacity: 1, y: 0 });
          }

          // Determine which app to show based on progress
          // 15-35%: App 0, 35-55%: App 1, 55-75%: App 2, 75-90%: App 3
          if (progress >= 0.15 && progress < 0.35) {
            setActiveAppIndex(0);
          } else if (progress >= 0.35 && progress < 0.55) {
            setActiveAppIndex(1);
          } else if (progress >= 0.55 && progress < 0.75) {
            setActiveAppIndex(2);
          } else if (progress >= 0.75 && progress < 0.90) {
            setActiveAppIndex(3);
          } else if (progress >= 0.90) {
            setActiveAppIndex(-1);
          } else {
            setActiveAppIndex(-1);
          }

          // 90-100%: Everything lifts up
          if (progress >= 0.90) {
            const exitProgress = (progress - 0.90) / 0.10;
            gsap.set(container, {
              y: -100 * exitProgress + 'vh',
              opacity: 1 - exitProgress,
            });
          } else {
            gsap.set(container, { y: 0, opacity: 1 });
          }
        },
      });

      return () => scrollTrigger.kill();
    }, section);

    return () => ctx.revert();
  }, [showCard]);

  return (
    <section
      ref={sectionRef}
      id="lab"
      className="relative w-full h-screen overflow-hidden section-wrapper"
      style={{
        backgroundColor: 'var(--bg-lab)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF9500' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      <div ref={containerRef} className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Section Label */}
        <div
          ref={labelRef}
          className="absolute top-20 left-1/2 -translate-x-1/2 opacity-0"
        >
          <span
            className="section-label"
            style={{ color: 'var(--lab-amber)' }}
          >
            THE LAB
          </span>
        </div>

        {/* Section Card (center) */}
        <div
          ref={cardRef}
          className={`transition-all duration-500 ${
            showCard && activeAppIndex === -1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <SectionCard title="THE LAB" accentColor="#FF9500" animate={showCard} />
        </div>

        {/* App Balls */}
        {LAB_APPS.map((app, index) => (
          <div
            key={app.id}
            ref={(el) => (appRefs.current[index] = el)}
            className={`absolute transition-all duration-700 ${
              activeAppIndex === index
                ? 'opacity-100 scale-100 z-20'
                : 'opacity-0 scale-0 z-10'
            }`}
            style={{
              left: '50%',
              top: '50%',
              transform: activeAppIndex === index
                ? 'translate(-50%, -50%)'
                : 'translate(-50%, -50%) scale(0)',
            }}
          >
            <AppBall
              app={app}
              isExpanded={activeAppIndex === index}
            />
          </div>
        ))}

        {/* Progress indicator for current app */}
        {activeAppIndex >= 0 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3">
            {LAB_APPS.map((app, index) => (
              <div
                key={app.id}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: index === activeAppIndex ? app.color : 'rgba(255,255,255,0.3)',
                  boxShadow: index === activeAppIndex ? `0 0 10px ${app.color}` : 'none',
                  transform: index === activeAppIndex ? 'scale(1.5)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        )}

        {/* Scroll hint when card is shown */}
        {showCard && activeAppIndex === -1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-muted text-sm font-mono">Scroll to explore</span>
            <svg
              className="w-5 h-5 animate-bounce-arrow text-lab-amber"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
