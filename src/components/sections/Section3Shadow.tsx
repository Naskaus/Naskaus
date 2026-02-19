'use client';

import { useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { SHADOW_NODES } from '@/data/apps';
import { useAuthStore } from '@/store/useAuthStore';

const MatrixRain = dynamic(
  () => import('@/components/canvas/MatrixRain'),
  { ssr: false }
);

const ADMIN_NODE = {
  id: 'admin-panel',
  name: 'Admin Panel',
  icon: 'wrench',
  desc: 'Full system administration.',
  url: 'https://staff.naskaus.com/admin',
  role: 'admin' as const,
};

const TITLE_TEXT = 'DIGITAL SHADOW';

// Monochrome SVG icons keyed by node id
const NODE_ICONS: Record<string, React.ReactNode> = {
  agency: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M17.5 14v7M14 17.5h7" />
    </svg>
  ),
  tasks: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  party: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M4.93 19.07l2.83-2.83M12 18v4M16.24 16.24l2.83 2.83M18 12h4M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  purchase: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  workflows: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  moltbot: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" /><path d="M12 2v4M7 7h10M8 15h0M16 15h0M10 18h4" />
    </svg>
  ),
  'admin-panel': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
};

export default function Section3Shadow() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const matrixWrapRef = useRef<HTMLDivElement>(null);
  const floatAnimsRef = useRef<gsap.core.Tween[]>([]);
  const flickerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasPlayedRef = useRef(false);

  const { user, openLoginModal } = useAuthStore();
  const userRole = user?.role ?? 'guest';

  const visibleNodes = userRole === 'admin'
    ? [...SHADOW_NODES, ADMIN_NODE]
    : SHADOW_NODES;

  const isNodeUnlocked = (nodeRole: string) => {
    if (userRole === 'admin') return true;
    if (userRole === 'user' && nodeRole === 'user') return true;
    return false;
  };

  const startDataFlicker = useCallback((nodes: HTMLDivElement[]) => {
    if (flickerIntervalRef.current) return;
    flickerIntervalRef.current = setInterval(() => {
      const idx = Math.floor(Math.random() * nodes.length);
      const inner = nodes[idx]?.querySelector('.node-card') as HTMLElement;
      if (!inner) return;
      inner.style.borderColor = 'rgba(0,255,65,0.8)';
      inner.style.boxShadow = '0 0 30px rgba(0,255,65,0.4)';
      setTimeout(() => { inner.style.borderColor = ''; inner.style.boxShadow = ''; }, 300);
    }, 5000);
  }, []);

  const stopDataFlicker = useCallback(() => {
    if (flickerIntervalRef.current) { clearInterval(flickerIntervalRef.current); flickerIntervalRef.current = null; }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    const titleEl = titleRef.current;
    const badge = badgeRef.current;
    const matrixWrap = matrixWrapRef.current;

    if (!section || !titleEl || !badge || !matrixWrap) return;

    const nodes = nodeRefs.current.filter(Boolean) as HTMLDivElement[];

    // --- Initial states ---
    gsap.set(titleEl, { opacity: 0 });
    gsap.set(badge, { opacity: 0 });
    gsap.set(matrixWrap, { opacity: 0 });
    nodes.forEach(node => gsap.set(node, { opacity: 0, scale: 0.4, filter: 'blur(4px)' }));

    // --- Autonomous timeline (~4.5s, ~12% faster) ---
    const tl = gsap.timeline({ paused: true });

    // Matrix rain
    tl.to(matrixWrap, { opacity: 1, duration: 1.3, ease: 'power1.out' }, 0);

    // Title types char-by-char (autonomous, like hero)
    titleEl.textContent = '';
    gsap.set(titleEl, { opacity: 1 });
    const typeProxy = { chars: 0 };
    tl.to(typeProxy, {
      chars: TITLE_TEXT.length,
      duration: 1.75,
      ease: 'none',
      onUpdate: () => {
        const c = Math.round(typeProxy.chars);
        titleEl.textContent = TITLE_TEXT.slice(0, c) + (c < TITLE_TEXT.length ? '_' : '');
      },
    }, 0.17);

    // Badge blinks in
    tl.to(badge, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 1.9);

    // Nodes spring in with blur→focus
    nodes.forEach((node, i) => {
      tl.to(node, {
        opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 0.52, ease: 'back.out(1.7)',
      }, 2.15 + i * 0.22);
    });

    // Floats + flicker
    const lastNode = 2.15 + (nodes.length - 1) * 0.22 + 0.52;
    tl.call(() => { startNodeFloats(nodes); startDataFlicker(nodes); }, [], lastNode + 0.05);

    // --- ScrollTrigger: pin + fade out ---
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=130%',
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
      stopNodeFloats();
      stopDataFlicker();
      tl.kill();
      ctx.revert();
    };
  }, [visibleNodes.length, startDataFlicker, stopDataFlicker]);

  function startNodeFloats(nodes: HTMLDivElement[]) {
    floatAnimsRef.current.forEach(a => a.kill());
    const anims: gsap.core.Tween[] = [];
    nodes.forEach((node, i) => {
      anims.push(gsap.to(node, {
        y: 4, duration: 2.6 + i * 0.3,
        ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.3,
      }));
    });
    floatAnimsRef.current = anims;
  }

  function stopNodeFloats() {
    floatAnimsRef.current.forEach(a => a.kill());
    floatAnimsRef.current = [];
  }

  return (
    <section
      ref={sectionRef}
      id="shadow"
      className="relative w-full h-screen overflow-hidden section-wrapper"
      style={{ backgroundColor: 'var(--bg-shadow)' }}
    >
      <div ref={matrixWrapRef} style={{ opacity: 0 }}>
        <MatrixRain speedMultiplier={1.0} />
      </div>

      <div className="relative w-full h-full flex flex-col items-center justify-center z-10 px-4">
        {/* Terminal title */}
        <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 text-center">
          <h2 ref={titleRef} className="section-title-cinematic title-terminal font-mono" style={{ opacity: 0, whiteSpace: 'nowrap' }} />
        </div>

        {/* Badge */}
        <div ref={badgeRef} className="absolute top-32 md:top-36 left-1/2 -translate-x-1/2">
          <span className="font-mono text-xs tracking-[0.2em] uppercase animate-blink px-3 py-1 rounded" style={{ color: 'var(--shadow-green)', border: '1px solid rgba(0,255,65,0.3)', background: 'rgba(0,255,65,0.05)' }}>
            CLEARANCE REQUIRED
          </span>
        </div>

        {/* Node grid — monochrome icons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-5 w-full max-w-2xl mt-8">
          {visibleNodes.map((node, i) => {
            const unlocked = isNodeUnlocked(node.role);
            return (
              <div key={node.id} ref={(el) => { nodeRefs.current[i] = el; }} className="relative">
                <div
                  className={`node-card relative dark-glass rounded-xl p-4 text-center transition-colors duration-300 ${unlocked ? 'interactive' : ''}`}
                  style={{
                    border: unlocked ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: unlocked ? '0 0 20px rgba(0,255,65,0.15)' : 'none',
                    cursor: unlocked ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (unlocked) window.open(node.url, '_blank', 'noopener,noreferrer');
                    else if (userRole === 'guest') openLoginModal();
                  }}
                >
                  {/* Monochrome icon */}
                  <div className="flex justify-center mb-2" style={{ color: unlocked ? 'var(--shadow-green)' : 'var(--muted)' }}>
                    {NODE_ICONS[node.id] || (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h0" />
                      </svg>
                    )}
                  </div>
                  <h4 className="font-heading text-sm font-medium mb-1" style={{ color: unlocked ? 'var(--shadow-green)' : 'var(--muted)' }}>
                    {node.name}
                  </h4>
                  <p className="font-mono text-xs text-muted leading-relaxed">{node.desc}</p>

                  {!unlocked && (
                    <div
                      className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-2"
                      style={{ background: 'rgba(5,5,5,0.75)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', cursor: userRole === 'guest' ? 'pointer' : 'default' }}
                      onClick={(e) => { e.stopPropagation(); if (userRole === 'guest') openLoginModal(); }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="4" y="9" width="12" height="9" rx="2" stroke="var(--muted)" strokeWidth="1.5" />
                        <path d="M7 9V6a3 3 0 116 0v3" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      {userRole === 'guest' && <span className="font-mono text-xs text-muted">LOGIN TO ACCESS</span>}
                      {userRole === 'user' && <span className="font-mono text-xs text-muted">ADMIN ONLY</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
