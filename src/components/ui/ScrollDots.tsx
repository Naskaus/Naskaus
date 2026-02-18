'use client';

import { useEffect, useState } from 'react';

interface Section {
  id: string;
  label: string;
  color: string;
}

interface ScrollDotsProps {
  sections?: Section[];
  activeSection?: number;
  onSectionClick?: (index: number) => void;
}

const DEFAULT_SECTIONS: Section[] = [
  { id: 'hero', label: 'Hero', color: '#00F5A0' },
  { id: 'lab', label: 'The Lab', color: '#FF9500' },
  { id: 'arena', label: 'Arena', color: '#00D4FF' },
  { id: 'shadow', label: 'Shadow', color: '#00FF41' },
  { id: 'ai-tools', label: 'AI Tools', color: '#FFD700' },
  { id: 'finale', label: 'Finale', color: '#00F5A0' },
];

export default function ScrollDots({
  sections = DEFAULT_SECTIONS,
  activeSection = 0,
  onSectionClick,
}: ScrollDotsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show dots after hero animation completes
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = (index: number) => {
    if (onSectionClick) {
      onSectionClick(index);
    } else {
      // Default scroll behavior
      const section = sections[index];
      const element = document.getElementById(section.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* Desktop: Right edge */}
      <div
        className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3 transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      >
        {sections.map((section, index) => {
          const isActive = index === activeSection;

          return (
            <button
              key={section.id}
              onClick={() => handleClick(index)}
              className="group relative w-3 h-3 rounded-full transition-all duration-300 focus:outline-none interactive"
              style={{
                backgroundColor: isActive ? section.color : 'rgba(255,255,255,0.2)',
                boxShadow: isActive ? `0 0 10px ${section.color}` : 'none',
                transform: isActive ? 'scale(1.3)' : 'scale(1)',
              }}
              aria-label={`Go to ${section.label} section`}
            >
              {/* Tooltip */}
              <span
                className="absolute right-6 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-mono uppercase tracking-wider whitespace-nowrap rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  backgroundColor: 'rgba(30,30,46,0.9)',
                  color: section.color,
                  border: `1px solid ${section.color}`,
                }}
              >
                {section.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile: Bottom center */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex md:hidden gap-2 transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      >
        {sections.map((section, index) => {
          const isActive = index === activeSection;

          return (
            <button
              key={section.id}
              onClick={() => handleClick(index)}
              className="w-2 h-2 rounded-full transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: isActive ? section.color : 'rgba(255,255,255,0.3)',
                boxShadow: isActive ? `0 0 8px ${section.color}` : 'none',
                transform: isActive ? 'scale(1.5)' : 'scale(1)',
              }}
              aria-label={`Go to ${section.label} section`}
            />
          );
        })}
      </div>
    </>
  );
}
