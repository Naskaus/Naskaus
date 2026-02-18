'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { AI_TOOLS } from '@/data/apps';
import SectionTitle from '@/components/ui/SectionTitle';

const ConstellationCanvas = dynamic(
  () => import('@/components/canvas/ConstellationCanvas'),
  { ssr: false }
);

// SVG icons per tool id
const TOOL_ICONS: Record<string, React.ReactNode> = {
  claude: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 110 20 10 10 0 010-20z" /><path d="M8 12h8M12 8v8" />
    </svg>
  ),
  'claude-code': (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  ),
  antigravity: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
  'ai-studio': (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  stitch: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" />
    </svg>
  ),
  gemini: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9" /><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9" /><path d="M12 3v18" />
    </svg>
  ),
  flow: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
};

export default function Section4AITools() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particleWrapRef = useRef<HTMLDivElement>(null);
  const floatAnimsRef = useRef<gsap.core.Tween[]>([]);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    const titleEl = titleRef.current;
    const particleWrap = particleWrapRef.current;

    if (!section || !titleEl || !particleWrap) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

    // Initial states
    gsap.set(titleEl, { opacity: 0, y: 60, scale: 0.92 });
    gsap.set(particleWrap, { opacity: 0 });
    cards.forEach(card => gsap.set(card, { opacity: 0, y: 50 }));

    // Autonomous timeline (~3s)
    const tl = gsap.timeline({ paused: true });

    // Title
    tl.to(titleEl, { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power2.out' }, 0);

    // Particles
    tl.to(particleWrap, { opacity: 1, duration: 1, ease: 'power1.out' }, 0.3);

    // Cards stagger in
    cards.forEach((card, i) => {
      tl.to(card, {
        opacity: 1, y: 0,
        duration: 0.6, ease: 'power2.out',
      }, 1.0 + i * 0.1);
    });

    // Float breathing
    const lastCard = 1.0 + (cards.length - 1) * 0.1 + 0.6;
    tl.call(() => startFloats(cards), [], lastCard + 0.05);

    // ScrollTrigger
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=200%',
        pin: true,
        onUpdate: (self) => {
          if (!hasPlayedRef.current && self.progress > 0) {
            hasPlayedRef.current = true;
            tl.play();
          }
        },
      });
    }, section);

    return () => {
      stopFloats();
      tl.kill();
      ctx.revert();
    };
  }, []);

  function startFloats(cards: HTMLDivElement[]) {
    stopFloats();
    const anims: gsap.core.Tween[] = [];
    cards.forEach((card, i) => {
      anims.push(gsap.to(card, {
        y: 4, duration: 2.6 + i * 0.2,
        ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.15,
      }));
    });
    floatAnimsRef.current = anims;
  }

  function stopFloats() {
    floatAnimsRef.current.forEach(a => a.kill());
    floatAnimsRef.current = [];
  }

  return (
    <section
      ref={sectionRef}
      id="ai-tools"
      className="relative w-full h-screen overflow-hidden section-wrapper"
      style={{ backgroundColor: 'var(--bg-ai)' }}
    >
      <div ref={particleWrapRef} style={{ opacity: 0 }}>
        <ConstellationCanvas opacity={0.6} />
      </div>

      <div className="relative w-full h-full flex flex-col items-center justify-center z-10 px-4">
        {/* Title */}
        <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2">
          <SectionTitle ref={titleRef} text="AI TOOLS" colorScheme="blue-gold" />
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl mt-16">
          {AI_TOOLS.map((tool, i) => (
            <div
              key={tool.id}
              ref={(el) => { cardRefs.current[i] = el; }}
            >
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ai-tool-card block p-5 interactive"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ color: 'var(--ai-blue)' }}>
                    {TOOL_ICONS[tool.id] || (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h0" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-semibold" style={{ color: '#111' }}>
                      {tool.name}
                    </h4>
                    <p className="font-mono text-xs" style={{ color: '#666' }}>
                      {tool.maker}
                    </p>
                  </div>
                </div>
                <p className="font-body text-sm leading-relaxed" style={{ color: '#444' }}>
                  {tool.desc}
                </p>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
