'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR issues with browser APIs
const CursorFollower = dynamic(() => import('@/components/ui/CursorFollower'), {
  ssr: false,
});
const Navbar = dynamic(() => import('@/components/ui/Navbar'), {
  ssr: false,
});
const ScrollDots = dynamic(() => import('@/components/ui/ScrollDots'), {
  ssr: false,
});
const Section0Awakening = dynamic(
  () => import('@/components/sections/Section0Awakening'),
  { ssr: false }
);
const Section0_5IconWave = dynamic(
  () => import('@/components/sections/Section0_5IconWave'),
  { ssr: false }
);
const Section1Lab = dynamic(
  () => import('@/components/sections/Section1Lab'),
  { ssr: false }
);

// Section definitions for ScrollDots
const SECTIONS = [
  { id: 'hero', label: 'Hero', color: '#00F5A0' },
  { id: 'lab', label: 'The Lab', color: '#FF9500' },
  { id: 'arena', label: 'Arena', color: '#00D4FF' },
  { id: 'shadow', label: 'Shadow', color: '#00FF41' },
  { id: 'ai-tools', label: 'AI Tools', color: '#FFD700' },
  { id: 'finale', label: 'Finale', color: '#00F5A0' },
];

export default function Home() {
  const [heroComplete, setHeroComplete] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track scroll position to update active section
  useEffect(() => {
    if (!isMounted) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Simple section detection based on scroll position
      const heroEnd = windowHeight;
      const iconWaveEnd = heroEnd + windowHeight * 0.6;
      const labEnd = iconWaveEnd + windowHeight * 3; // Lab is pinned for 200vh
      const arenaStart = labEnd;
      const shadowStart = arenaStart + windowHeight;
      const aiToolsStart = shadowStart + windowHeight;
      const finaleStart = aiToolsStart + windowHeight;

      if (scrollY < heroEnd) {
        setActiveSection(0);
      } else if (scrollY < labEnd) {
        setActiveSection(1);
      } else if (scrollY < shadowStart) {
        setActiveSection(2);
      } else if (scrollY < aiToolsStart) {
        setActiveSection(3);
      } else if (scrollY < finaleStart) {
        setActiveSection(4);
      } else {
        setActiveSection(5);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  if (!isMounted) {
    // SSR placeholder - black screen
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#080808' }}>
        <div className="w-full h-screen" />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Custom Cursor */}
      <CursorFollower />

      {/* Navigation */}
      <Navbar showAfterDelay={3500} />

      {/* Scroll Dots - right edge */}
      <ScrollDots sections={SECTIONS} activeSection={activeSection} />

      {/* Section 0: The Awakening / Hero */}
      <div id="hero">
        <Section0Awakening onAnimationComplete={() => setHeroComplete(true)} />
      </div>

      {/* Section 0.5: Icon Wave (transition) */}
      <Section0_5IconWave />

      {/* Section 1: The Lab */}
      <Section1Lab />

      {/* Placeholder sections for scroll - will be built in Phase 3+ */}
      <section
        id="arena"
        className="relative w-full h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-arena)' }}
      >
        <div className="text-center">
          <span className="section-label" style={{ color: 'var(--arena-blue)' }}>
            GAME ARENA
          </span>
          <p className="text-muted font-mono text-sm mt-4">
            [Coming in Phase 3]
          </p>
        </div>
      </section>

      <section
        id="shadow"
        className="relative w-full h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-shadow)' }}
      >
        <div className="text-center">
          <span className="section-label" style={{ color: 'var(--shadow-green)' }}>
            DIGITAL SHADOW
          </span>
          <p className="text-muted font-mono text-sm mt-4">
            [Coming in Phase 3]
          </p>
        </div>
      </section>

      <section
        id="ai-tools"
        className="relative w-full h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-ai)' }}
      >
        <div className="text-center">
          <span className="section-label" style={{ color: 'var(--ai-blue)' }}>
            AI TOOLS
          </span>
          <p className="text-muted font-mono text-sm mt-4" style={{ color: '#333' }}>
            [Coming in Phase 4]
          </p>
        </div>
      </section>

      <section
        id="finale"
        className="relative w-full h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(180deg, #000000 0%, #0a0a1a 50%, #0d0d20 100%)',
        }}
      >
        <div className="text-center">
          <h2 className="font-display text-6xl md:text-8xl text-white mb-4">
            NASKAUS.
          </h2>
          <p className="text-muted font-body text-lg">
            Built by one. Powered by many.
          </p>
          <p className="text-muted font-mono text-sm mt-8">
            [Full Finale coming in Phase 4]
          </p>
        </div>
      </section>
    </main>
  );
}
