'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { mulberry32, seededRandom } from '@/lib/mulberry32';
import BadgeOrbitCeremony from '@/components/ui/BadgeOrbitCeremony';
import type { BadgeOrbitHandle } from '@/components/ui/BadgeOrbitCeremony';

const ORBIT_CARDS = [
  { label: 'THE LAB', color: '#FF9500', href: '#lab' },
  { label: 'GAME ARENA', color: '#00D4FF', href: '#arena' },
  { label: 'DIGITAL SHADOW', color: '#00FF41', href: '#shadow' },
  { label: 'AI TOOLS', color: '#FFD700', href: '#ai-tools' },
];

const STAR_COUNT = 400;
const STAR_SEED = 99999;

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export default function Section5Finale() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const orbitCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const hasPlayedRef = useRef(false);
  const orbitAnimRef = useRef<gsap.core.Tween | null>(null);
  const ceremonyRef = useRef<BadgeOrbitHandle>(null);

  const initStars = useCallback((width: number, height: number) => {
    const rng = mulberry32(STAR_SEED);
    const countMul = Math.max(0.35, Math.min(1, width / 1920));
    const count = Math.floor(STAR_COUNT * countMul);
    const stars: Star[] = [];

    for (let i = 0; i < count; i++) {
      stars.push({
        x: seededRandom(rng, 0, width),
        y: seededRandom(rng, 0, height),
        size: seededRandom(rng, 0.5, 2),
        alpha: seededRandom(rng, 0.3, 1),
        twinkleSpeed: seededRandom(rng, 0.0008, 0.003),
        twinklePhase: seededRandom(rng, 0, Math.PI * 2),
      });
    }

    return stars;
  }, []);

  const animateCanvas = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { desynchronized: true, alpha: true });
    if (!ctx) return;

    const dt = Math.min(timestamp - lastTimeRef.current, 50);
    lastTimeRef.current = timestamp;
    elapsedRef.current += dt;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const stars = starsRef.current;
    const t = elapsedRef.current;

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const twinkle = Math.sin(t * s.twinkleSpeed + s.twinklePhase);
      const alpha = s.alpha * (0.5 + twinkle * 0.5);

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    animFrameRef.current = requestAnimationFrame(animateCanvas);
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d', { desynchronized: true, alpha: true });
    if (ctx) ctx.scale(dpr, dpr);

    starsRef.current = initStars(rect.width, rect.height);
  }, [initStars]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const titleEl = titleRef.current;
    const tagline = taglineRef.current;
    const links = linksRef.current;

    if (!section || !canvas || !titleEl || !tagline || !links) return;

    const orbitCards = orbitCardRefs.current.filter(Boolean) as HTMLDivElement[];

    // Init canvas
    handleResize();
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(animateCanvas);
    window.addEventListener('resize', handleResize);

    // Initial states
    gsap.set(titleEl, { opacity: 0, scale: 0.8 });
    gsap.set(tagline, { opacity: 0, y: 20 });
    gsap.set(links, { opacity: 0, y: 20 });
    orbitCards.forEach(card => gsap.set(card, { opacity: 0, scale: 0.5 }));

    // Autonomous timeline (~4s)
    const tl = gsap.timeline({ paused: true });

    // Title scales in
    tl.to(titleEl, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 0);

    // Orbit cards appear
    orbitCards.forEach((card, i) => {
      tl.to(card, {
        opacity: 1, scale: 1,
        duration: 0.6, ease: 'back.out(1.4)',
      }, 0.8 + i * 0.15);
    });

    // Start orbital motion
    const orbitStart = 0.8 + (orbitCards.length - 1) * 0.15 + 0.6;
    tl.call(() => startOrbit(orbitCards), [], orbitStart + 0.05);

    // Badge orbit ceremony (inner ring of tech badges)
    tl.call(() => ceremonyRef.current?.play(), [], orbitStart + 0.3);

    // Tagline
    tl.to(tagline, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, orbitStart + 0.2);

    // Links
    tl.to(links, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, orbitStart + 0.5);

    // ScrollTrigger (no pin — last section scrolls naturally)
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        onEnter: () => {
          if (!hasPlayedRef.current) {
            hasPlayedRef.current = true;
            tl.play();
          }
        },
      });
    }, section);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      orbitAnimRef.current?.kill();
      tl.kill();
      ctx.revert();
    };
  }, [handleResize, animateCanvas]);

  function startOrbit(cards: HTMLDivElement[]) {
    const radii = [140, 160, 180, 200];
    const speeds = [12, 16, 20, 14];
    const startAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

    cards.forEach((card, i) => {
      const radius = radii[i];
      const speed = speeds[i];
      const startAngle = startAngles[i];

      // Set initial position
      gsap.set(card, {
        x: Math.cos(startAngle) * radius,
        y: Math.sin(startAngle) * radius * 0.4,
      });

      // Continuous orbit using a proxy angle
      const proxy = { angle: startAngle };
      gsap.to(proxy, {
        angle: startAngle + Math.PI * 2,
        duration: speed,
        ease: 'none',
        repeat: -1,
        onUpdate: () => {
          const x = Math.cos(proxy.angle) * radius;
          const y = Math.sin(proxy.angle) * radius * 0.4;
          const z = Math.sin(proxy.angle);
          const s = 0.7 + (z + 1) * 0.15;
          gsap.set(card, {
            x, y,
            scale: s,
            zIndex: z > 0 ? 2 : 0,
            opacity: 0.6 + (z + 1) * 0.2,
          });
        },
      });
    });
  }

  return (
    <section
      ref={sectionRef}
      id="finale"
      className="relative w-full h-screen overflow-hidden section-wrapper"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0a0a1a 50%, #0d0d20 100%)',
      }}
    >
      {/* Star field */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
        {/* Orbit zone */}
        <div className="relative" style={{ width: '400px', height: '200px' }}>
          {/* Nucleus title */}
          <h2
            ref={titleRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-white nucleus-glow whitespace-nowrap"
            style={{
              fontSize: 'clamp(3rem, 10vw, 8rem)',
              letterSpacing: '0.05em',
            }}
          >
            NASKAUS.
          </h2>

          {/* Badge orbit ceremony (inner ring) */}
          <BadgeOrbitCeremony ref={ceremonyRef} />

          {/* Orbit cards */}
          {ORBIT_CARDS.map((card, i) => (
            <div
              key={card.label}
              ref={(el) => { orbitCardRefs.current[i] = el; }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg font-mono text-xs font-medium tracking-wider whitespace-nowrap"
              style={{
                background: `${card.color}22`,
                border: `1px solid ${card.color}66`,
                color: card.color,
                boxShadow: `0 0 12px ${card.color}33`,
              }}
            >
              {card.label}
            </div>
          ))}
        </div>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="font-body text-lg md:text-xl mt-12"
          style={{ color: 'var(--muted)', opacity: 0 }}
        >
          Built by one. Powered by many.
        </p>

        {/* CTA */}
        <div ref={linksRef} className="mt-10 flex flex-col items-center gap-6" style={{ opacity: 0 }}>
          <a
            href="mailto:nosk@naskaus.com"
            className="mt-2 px-6 py-3 rounded-lg font-body text-sm font-semibold tracking-wider uppercase transition-all duration-300 interactive"
            style={{
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
            }}
          >
            GET IN TOUCH
          </a>

          <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            naskaus.com &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </section>
  );
}
