'use client';

import { useEffect, useState, useCallback } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export interface SectionConfig {
  id: string;
  trigger: string; // CSS selector
  color?: string;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'hero', trigger: '#hero', color: '#00F5A0' },
  { id: 'icon-wave', trigger: '#icon-wave', color: '#00F5A0' },
  { id: 'lab', trigger: '#lab', color: '#FF9500' },
  { id: 'arena', trigger: '#arena', color: '#00D4FF' },
  { id: 'shadow', trigger: '#shadow', color: '#00FF41' },
  { id: 'ai-tools', trigger: '#ai-tools', color: '#FFD700' },
  { id: 'finale', trigger: '#finale', color: '#00F5A0' },
];

export function useScrollSection(sections: SectionConfig[] = DEFAULT_SECTIONS) {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create scroll triggers for each section
    const triggers: ScrollTrigger[] = [];

    sections.forEach((section, index) => {
      const element = document.querySelector(section.trigger);
      if (!element) return;

      const trigger = ScrollTrigger.create({
        trigger: element,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveSection(index),
        onEnterBack: () => setActiveSection(index),
      });

      triggers.push(trigger);
    });

    // Overall scroll progress
    const progressTrigger = ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => setScrollProgress(self.progress),
    });

    return () => {
      triggers.forEach((t) => t.kill());
      progressTrigger.kill();
    };
  }, [sections]);

  const scrollToSection = useCallback((index: number) => {
    const section = sections[index];
    if (!section) return;

    const element = document.querySelector(section.trigger);
    if (!element) return;

    gsap.to(window, {
      scrollTo: { y: element, offsetY: 0 },
      duration: 1,
      ease: 'power2.inOut',
    });
  }, [sections]);

  return {
    activeSection,
    scrollProgress,
    scrollToSection,
    sectionCount: sections.length,
    currentSectionId: sections[activeSection]?.id || 'hero',
    currentSectionColor: sections[activeSection]?.color || '#00F5A0',
  };
}

// Simple hook just for tracking scroll progress percentage
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}
