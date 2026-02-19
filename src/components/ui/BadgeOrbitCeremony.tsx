'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { gsap } from '@/lib/gsap';

const BADGES = [
  { label: 'Next.js', color: '#ffffff' },
  { label: 'React', color: '#61DAFB' },
  { label: 'TypeScript', color: '#3178C6' },
  { label: 'Tailwind', color: '#06B6D4' },
  { label: 'GSAP', color: '#88CE02' },
  { label: 'Python', color: '#3776AB' },
  { label: 'FastAPI', color: '#009688' },
  { label: 'Claude', color: '#D97757' },
];

export interface BadgeOrbitHandle {
  play: () => void;
}

const BadgeOrbitCeremony = forwardRef<BadgeOrbitHandle>(function BadgeOrbitCeremony(_, ref) {
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const orbitTweensRef = useRef<gsap.core.Tween[]>([]);

  useImperativeHandle(ref, () => ({
    play: () => {
      tlRef.current?.play(0);
    },
  }));

  useEffect(() => {
    const badges = badgeRefs.current.filter(Boolean) as HTMLDivElement[];
    if (badges.length === 0) return;

    // Responsive scaling
    const vScale = Math.min(1, window.innerWidth / 768);
    const baseRadius = 80 * vScale;
    const radiusStep = 20 * vScale;
    const scatterX = 350 * vScale;
    const scatterY = 200 * vScale;
    const scatterOutX = 400 * vScale;
    const scatterOutY = 250 * vScale;

    // Initial: hidden, scattered at edges
    badges.forEach((badge, i) => {
      const angle = (i / badges.length) * Math.PI * 2;
      gsap.set(badge, {
        opacity: 0,
        x: Math.cos(angle) * scatterX,
        y: Math.sin(angle) * scatterY,
        scale: 0.3,
      });
    });

    const tl = gsap.timeline({ paused: true });

    // Phase 1: Gather (0–1.5s) — badges fly from edges to orbit positions
    badges.forEach((badge, i) => {
      const startAngle = (i / badges.length) * Math.PI * 2;
      const radius = baseRadius + (i % 3) * radiusStep;
      tl.to(badge, {
        opacity: 1,
        x: Math.cos(startAngle) * radius,
        y: Math.sin(startAngle) * radius * 0.4,
        scale: 0.7 + Math.sin(startAngle) * 0.15,
        duration: 1.2,
        ease: 'power3.out',
      }, 0.06 * i);
    });

    // Phase 2: Start orbit (at 1.5s)
    tl.call(() => {
      const tweens: gsap.core.Tween[] = [];
      badges.forEach((badge, i) => {
        const radius = baseRadius + (i % 3) * radiusStep;
        const speed = 6 + i * 0.8;
        const startAngle = (i / badges.length) * Math.PI * 2;
        const proxy = { angle: startAngle };
        tweens.push(gsap.to(proxy, {
          angle: startAngle + Math.PI * 2,
          duration: speed,
          ease: 'none',
          repeat: -1,
          onUpdate: () => {
            const x = Math.cos(proxy.angle) * radius;
            const y = Math.sin(proxy.angle) * radius * 0.4;
            const z = Math.sin(proxy.angle);
            const s = 0.65 + (z + 1) * 0.2;
            gsap.set(badge, {
              x, y, scale: s,
              opacity: 0.4 + (z + 1) * 0.3,
              zIndex: z > 0 ? 5 : 1,
            });
          },
        }));
      });
      orbitTweensRef.current = tweens;
    }, [], 1.5);

    // Phase 3: Scatter and fade (at ~8s)
    tl.call(() => {
      orbitTweensRef.current.forEach(t => t.kill());
      orbitTweensRef.current = [];
    }, [], 8);

    badges.forEach((badge, i) => {
      const angle = (i / badges.length) * Math.PI * 2;
      tl.to(badge, {
        x: Math.cos(angle) * scatterOutX,
        y: Math.sin(angle) * scatterOutY,
        opacity: 0,
        scale: 0.2,
        duration: 1.5,
        ease: 'power2.in',
      }, 8.05 + 0.06 * i);
    });

    tlRef.current = tl;

    return () => {
      orbitTweensRef.current.forEach(t => t.kill());
      orbitTweensRef.current = [];
      tl.kill();
    };
  }, []);

  return (
    <>
      {BADGES.map((badge, i) => (
        <div
          key={badge.label}
          ref={(el) => { badgeRefs.current[i] = el; }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full font-mono text-[9px] font-medium tracking-wider whitespace-nowrap"
          style={{
            background: `${badge.color}15`,
            border: `1px solid ${badge.color}40`,
            color: badge.color,
            opacity: 0,
          }}
        >
          {badge.label}
        </div>
      ))}
    </>
  );
});

export default BadgeOrbitCeremony;
