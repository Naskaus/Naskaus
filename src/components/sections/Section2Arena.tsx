'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import SectionTitle from '@/components/ui/SectionTitle';

const ArenaParticles = dynamic(
  () => import('@/components/canvas/ArenaParticles'),
  { ssr: false }
);

export default function Section2Arena() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const sparkRef = useRef<SVGPathElement>(null);
  const comingSoonRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particleWrapRef = useRef<HTMLDivElement>(null);
  const impactGlowRef = useRef<HTMLDivElement>(null);
  const floatAnimsRef = useRef<gsap.core.Tween[]>([]);
  const sparkAnimRef = useRef<gsap.core.Tween | null>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    const titleEl = titleRef.current;
    const mainCard = mainCardRef.current;
    const spark = sparkRef.current;
    const particleWrap = particleWrapRef.current;
    const impactGlow = impactGlowRef.current;
    const subCards = comingSoonRefs.current.filter(Boolean) as HTMLDivElement[];

    if (!section || !titleEl || !mainCard || !particleWrap) return;

    // --- Initial states ---
    gsap.set(titleEl, { opacity: 0, y: 60, scale: 0.92 });
    gsap.set(particleWrap, { opacity: 0 });
    gsap.set(mainCard, {
      opacity: 0, y: '-100vh',
      rotateX: -20, rotateZ: -8, scale: 0.8,
      transformPerspective: 800,
    });
    subCards.forEach((card, i) => {
      gsap.set(card, {
        opacity: 0,
        x: i === 0 ? '-60vw' : '60vw',
        rotateY: i === 0 ? 15 : -15,
        transformPerspective: 800,
      });
    });
    if (impactGlow) gsap.set(impactGlow, { opacity: 0 });

    // --- Autonomous timeline (~3.5s, ~12% faster) ---
    const tl = gsap.timeline({ paused: true });

    // Title
    tl.to(titleEl, { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power2.out' }, 0);

    // Particles behind
    tl.to(particleWrap, { opacity: 1, duration: 1, ease: 'power1.out' }, 0.25);

    // The4th card tumbles down — cinematic, deterministic
    tl.to(mainCard, {
      opacity: 1, y: 0,
      rotateX: 0, rotateZ: 0, scale: 1,
      transformPerspective: 800,
      duration: 1.3, ease: 'back.out(1.4)',
    }, 0.85);

    // Impact glow flash
    if (impactGlow) {
      tl.to(impactGlow, { opacity: 0.5, duration: 0.12, ease: 'power2.out' }, 2.0);
      tl.to(impactGlow, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 2.12);
    }

    // SVG spark ignites
    if (spark) {
      tl.to(spark, { strokeDashoffset: 0, duration: 1, ease: 'power1.inOut' }, 2.0);
      tl.call(() => {
        sparkAnimRef.current = gsap.to(spark, {
          strokeDashoffset: -600, duration: 8,
          ease: 'none', repeat: -1,
        });
      }, [], 3.0);
    }

    // Coming-soon cards slide from sides
    subCards.forEach((card, i) => {
      tl.to(card, {
        opacity: 1, x: 0, rotateY: 0,
        transformPerspective: 800,
        duration: 0.7, ease: 'back.out(1.4)',
      }, 2.3 + i * 0.26);
    });

    // Float breathing
    const settled = 2.3 + (subCards.length - 1) * 0.26 + 0.7;
    tl.call(() => startFloatAnimations(mainCard, subCards), [], settled + 0.05);

    // --- ScrollTrigger: pin + fade out ---
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=110%',
        pin: true,
        onUpdate: (self) => {
          if (!hasPlayedRef.current && self.progress > 0) {
            hasPlayedRef.current = true;
            tl.play();
          }
          // Fade out in the last 20% of pin
          if (self.progress > 0.8) {
            const fade = 1 - (self.progress - 0.8) / 0.2;
            section.style.opacity = String(fade);
          } else {
            section.style.opacity = '1';
          }
        },
      });
    }, section);

    return () => {
      stopFloatAnimations();
      sparkAnimRef.current?.kill();
      tl.kill();
      ctx.revert();
    };
  }, []);

  function startFloatAnimations(mainCard: HTMLDivElement, subCards: HTMLDivElement[]) {
    stopFloatAnimations();
    const anims: gsap.core.Tween[] = [];
    anims.push(gsap.to(mainCard, {
      y: 5, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true,
    }));
    subCards.forEach((card, i) => {
      anims.push(gsap.to(card, {
        y: 4, duration: 2.8 + i * 0.3,
        ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.4,
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
      id="arena"
      className="relative w-full h-screen overflow-hidden section-wrapper"
      style={{ backgroundColor: 'var(--bg-arena)' }}
    >
      <div ref={particleWrapRef} style={{ opacity: 0 }}>
        <ArenaParticles opacity={1} />
      </div>

      <div
        ref={impactGlowRef}
        className="absolute inset-0 pointer-events-none z-5"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,212,255,0.3) 0%, transparent 60%)',
          opacity: 0,
        }}
      />

      <div className="relative w-full h-full flex flex-col items-center justify-center z-10 px-4">
        <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2">
          <SectionTitle ref={titleRef} text="GAME ARENA" colorScheme="blue-violet" />
        </div>

        <div
          ref={mainCardRef}
          className="relative dark-glass rounded-2xl p-6 md:p-8 w-full max-w-lg scanlines"
          style={{
            border: '1px solid rgba(0,212,255,0.3)',
            boxShadow: '0 0 30px rgba(0,212,255,0.15), 0 0 60px rgba(0,212,255,0.05)',
          }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
            <path
              ref={sparkRef}
              d="M20,10 L380,10 L390,20 L390,280 L380,290 L20,290 L10,280 L10,20 Z"
              fill="none" stroke="var(--arena-blue)" strokeWidth="1.5"
              strokeDasharray="8 12" strokeDashoffset="600" opacity="0.6"
            />
          </svg>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-xl" style={{ background: 'linear-gradient(135deg, var(--arena-blue), var(--arena-violet))', color: '#fff' }}>4th</div>
              <div>
                <h3 className="font-heading text-xl text-white font-semibold">The4th</h3>
                <p className="font-mono text-xs text-muted">Color Strategy Game</p>
              </div>
            </div>
            <p className="font-body text-sm text-text-secondary leading-relaxed mb-5">A head-to-head color strategy board game. Claim territory by connecting four in a row. Outsmart, outflank, dominate.</p>
            <div className="flex gap-6 mb-6">
              <div className="text-center">
                <span className="font-display text-2xl" style={{ color: 'var(--arena-blue)' }}>2</span>
                <p className="font-mono text-xs text-muted mt-1">Players</p>
              </div>
              <div className="text-center">
                <span className="font-display text-2xl" style={{ color: 'var(--arena-violet)' }}>&infin;</span>
                <p className="font-mono text-xs text-muted mt-1">Color Combos</p>
              </div>
            </div>
            <a href="https://the4th.naskaus.com" target="_blank" rel="noopener noreferrer" className="inline-block w-full text-center py-3 rounded-lg font-body font-semibold text-sm tracking-wider uppercase glitch-hover interactive transition-all duration-300" style={{ background: 'linear-gradient(135deg, var(--arena-blue), var(--arena-violet))', color: '#fff' }}>PLAY NOW</a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-6 w-full max-w-lg">
          {[
            { name: 'Nosk Rush', desc: 'Endless runner · Coming soon' },
            { name: 'Dragon Chaos', desc: 'Card battler · Coming soon' },
          ].map((game, i) => (
            <div key={game.name} ref={(el) => { comingSoonRefs.current[i] = el; }} className="flex-1 dark-glass rounded-xl p-4 text-center" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 className="font-heading text-sm text-muted font-medium mb-1">{game.name}</h4>
              <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{game.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
