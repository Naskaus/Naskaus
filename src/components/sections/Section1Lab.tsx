'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { LAB_APPS } from '@/data/apps';
import LabCard from '@/components/ui/LabCard';
import SectionTitle from '@/components/ui/SectionTitle';
import { mulberry32, seededRandom } from '@/lib/mulberry32';

const LabConstellation = dynamic(
  () => import('@/components/canvas/LabConstellation'),
  { ssr: false }
);

const rng = mulberry32(55555);

interface FlightOrigin {
  x: number; y: number;
  rotX: number; rotY: number; rotZ: number;
  scale: number;
}

const FLIGHT_ORIGINS: FlightOrigin[] = LAB_APPS.map(() => {
  const edge = Math.floor(seededRandom(rng, 0, 4));
  let x = 0, y = 0;
  switch (edge) {
    case 0: x = seededRandom(rng, -40, 40); y = seededRandom(rng, -120, -80); break;
    case 1: x = seededRandom(rng, 80, 130); y = seededRandom(rng, -40, 40); break;
    case 2: x = seededRandom(rng, -40, 40); y = seededRandom(rng, 80, 120); break;
    case 3: x = seededRandom(rng, -130, -80); y = seededRandom(rng, -40, 40); break;
  }
  return {
    x, y,
    rotX: seededRandom(rng, -60, 60),
    rotY: seededRandom(rng, -60, 60),
    rotZ: seededRandom(rng, -30, 30),
    scale: seededRandom(rng, 0.3, 0.6),
  };
});

export default function Section1Lab() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particleWrapRef = useRef<HTMLDivElement>(null);
  const floatAnimsRef = useRef<gsap.core.Tween[]>([]);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    const titleWrap = titleWrapRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const particleWrap = particleWrapRef.current;

    if (!section || !titleWrap || !title || !subtitle || !particleWrap) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

    // --- Initial states ---
    gsap.set(title, { opacity: 0, y: 60, scale: 0.92 });
    gsap.set(subtitle, { opacity: 0, y: 20 });
    gsap.set(particleWrap, { opacity: 0 });
    cards.forEach((card, i) => {
      const o = FLIGHT_ORIGINS[i];
      gsap.set(card, {
        opacity: 0,
        x: o.x + 'vw', y: o.y + 'vh',
        rotateX: o.rotX, rotateY: o.rotY, rotateZ: o.rotZ,
        scale: o.scale, transformPerspective: 800,
      });
    });

    // --- Autonomous timeline (~3.5s, ~12% faster) ---
    const tl = gsap.timeline({ paused: true });

    // Title fades up center-screen
    tl.to(title, { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power2.out' }, 0);

    // Title moves to top, above card grid
    tl.to(titleWrap, { y: '-30vh', duration: 0.7, ease: 'power2.inOut' }, 0.85);

    // Subtitle
    tl.to(subtitle, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.0);

    // Constellation particles
    tl.to(particleWrap, { opacity: 1, duration: 1, ease: 'power1.out' }, 0.7);

    // Cards fly in, staggered
    cards.forEach((card, i) => {
      tl.to(card, {
        opacity: 1, x: 0, y: 0,
        rotateX: 0, rotateY: 0, rotateZ: 0,
        scale: 1, transformPerspective: 800,
        duration: 0.78, ease: 'power3.out',
      }, 1.3 + i * 0.26);
    });

    // Start float breathing after last card lands
    const lastCard = 1.3 + (cards.length - 1) * 0.26 + 0.78;
    tl.call(() => startFloatAnimations(cards), [], lastCard + 0.05);

    // --- ScrollTrigger: pin + trigger once ---
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=300%',
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
      stopFloatAnimations();
      tl.kill();
      ctx.revert();
    };
  }, []);

  function startFloatAnimations(cards: HTMLDivElement[]) {
    stopFloatAnimations();
    const anims: gsap.core.Tween[] = [];
    cards.forEach((card, i) => {
      anims.push(gsap.to(card, {
        y: 8, rotateX: 1.5,
        duration: 2.4 + i * 0.4,
        ease: 'sine.inOut', repeat: -1, yoyo: true,
        delay: i * 0.5,
      }));
    });
    floatAnimsRef.current = anims;
  }

  function stopFloatAnimations() {
    floatAnimsRef.current.forEach(a => a.kill());
    floatAnimsRef.current = [];
  }

  return (
    <section
      ref={sectionRef}
      id="lab"
      className="relative w-full h-screen overflow-hidden section-wrapper"
      style={{ backgroundColor: 'var(--bg-lab)' }}
    >
      {/* Constellation */}
      <div ref={particleWrapRef} style={{ opacity: 0 }}>
        <LabConstellation opacity={1} />
      </div>

      {/* Circuit overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF9500' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
        {/* Title — starts centered, moves above card grid, z-20 to stay on top */}
        <div
          ref={titleWrapRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 pointer-events-none"
        >
          <SectionTitle ref={titleRef} text="THE LAB" colorScheme="amber" />
          <div
            ref={subtitleRef}
            className="mt-4 font-body text-lg md:text-xl"
            style={{ color: 'var(--muted)', opacity: 0 }}
          >
            where ideas become apps
          </div>
        </div>

        {/* Card Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 px-4 md:px-8 w-full max-w-3xl mt-24 z-10"
          style={{ perspective: '1200px' }}
        >
          {LAB_APPS.map((app, index) => (
            <div
              key={app.id}
              ref={(el) => { cardRefs.current[index] = el; }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <LabCard app={app} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
