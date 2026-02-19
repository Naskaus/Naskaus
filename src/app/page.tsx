'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/useAuthStore';

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
const LoginModal = dynamic(() => import('@/components/ui/LoginModal'), {
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
const Section2Arena = dynamic(
  () => import('@/components/sections/Section2Arena'),
  { ssr: false }
);
const Section3Shadow = dynamic(
  () => import('@/components/sections/Section3Shadow'),
  { ssr: false }
);
const Section4AITools = dynamic(
  () => import('@/components/sections/Section4AITools'),
  { ssr: false }
);
const Section5Finale = dynamic(
  () => import('@/components/sections/Section5Finale'),
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

  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    setIsMounted(true);
    // Hydrate auth state on mount
    fetchMe();
  }, [fetchMe]);

  // Track scroll position to update active section
  useEffect(() => {
    if (!isMounted) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Section detection — account for pinned sections
      const heroEnd = windowHeight;
      const iconWaveEnd = heroEnd + windowHeight * 0.6;
      const labEnd = iconWaveEnd + windowHeight * 2.2; // Lab pinned for 120%
      const arenaEnd = labEnd + windowHeight * 2.1; // Arena pinned for 110%
      const shadowEnd = arenaEnd + windowHeight * 2.3; // Shadow pinned for 130%
      const aiToolsEnd = shadowEnd + windowHeight * 2; // AI Tools pinned for 100%
      const finaleStart = aiToolsEnd;

      if (scrollY < heroEnd) {
        setActiveSection(0);
      } else if (scrollY < labEnd) {
        setActiveSection(1);
      } else if (scrollY < arenaEnd) {
        setActiveSection(2);
      } else if (scrollY < shadowEnd) {
        setActiveSection(3);
      } else if (scrollY < aiToolsEnd) {
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

      {/* Login Modal */}
      <LoginModal />

      {/* Section 0: The Awakening / Hero */}
      <div id="hero">
        <Section0Awakening onAnimationComplete={() => setHeroComplete(true)} />
      </div>

      {/* Section 0.5: Icon Wave (transition) */}
      <Section0_5IconWave />

      {/* Section 1: The Lab */}
      <Section1Lab />

      {/* Section 2: Game Arena */}
      <Section2Arena />

      {/* Section 3: Digital Shadow */}
      <Section3Shadow />

      {/* Section 4: AI Tools */}
      <Section4AITools />

      {/* Section 5: Finale */}
      <Section5Finale />
    </main>
  );
}
