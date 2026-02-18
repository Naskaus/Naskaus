'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const ArenaParticles = dynamic(
  () => import('@/components/canvas/ArenaParticles'),
  { ssr: false }
);
const CursorFollower = dynamic(
  () => import('@/components/ui/CursorFollower'),
  { ssr: false }
);
const Navbar = dynamic(
  () => import('@/components/ui/Navbar'),
  { ssr: false }
);
const LoginModal = dynamic(
  () => import('@/components/ui/LoginModal'),
  { ssr: false }
);

export default function ArenaPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#000000' }}>
        <div className="w-full h-screen" />
      </main>
    );
  }

  return (
    <main
      className="relative w-full min-h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-arena)' }}
    >
      <CursorFollower />
      <Navbar showAfterDelay={0} />
      <LoginModal />

      {/* Ambient particles */}
      <div className="fixed inset-0 z-0">
        <ArenaParticles opacity={0.5} />
      </div>

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none scanlines z-[1]" />

      {/* Back arrow */}
      <Link
        href="/"
        className="fixed top-20 left-6 z-50 flex items-center gap-2 font-mono text-sm transition-colors duration-300 interactive"
        style={{ color: 'var(--arena-blue)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        BACK
      </Link>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 max-w-3xl mx-auto">
        <h1
          className="section-title-cinematic title-chromatic text-center mb-12"
          data-text="GAME ARENA"
          style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}
        >
          GAME ARENA
        </h1>

        {/* The4th hero card */}
        <div
          className="relative dark-glass rounded-2xl p-6 md:p-8 w-full scanlines"
          style={{
            border: '1px solid rgba(0,212,255,0.3)',
            boxShadow: '0 0 30px rgba(0,212,255,0.15), 0 0 60px rgba(0,212,255,0.05)',
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-display text-2xl"
                style={{
                  background: 'linear-gradient(135deg, var(--arena-blue), var(--arena-violet))',
                  color: '#fff',
                }}
              >
                4th
              </div>
              <div>
                <h3 className="font-heading text-2xl text-white font-semibold">The4th</h3>
                <p className="font-mono text-sm text-muted">Color Strategy Game</p>
              </div>
            </div>
            <p className="font-body text-base text-text-secondary leading-relaxed mb-6">
              A head-to-head color strategy board game. Claim territory by connecting four in a row.
              Outsmart, outflank, dominate.
            </p>
            <div className="flex gap-8 mb-6">
              <div className="text-center">
                <span className="font-display text-3xl" style={{ color: 'var(--arena-blue)' }}>2</span>
                <p className="font-mono text-sm text-muted mt-1">Players</p>
              </div>
              <div className="text-center">
                <span className="font-display text-3xl" style={{ color: 'var(--arena-violet)' }}>&infin;</span>
                <p className="font-mono text-sm text-muted mt-1">Color Combos</p>
              </div>
            </div>
            <a
              href="https://the4th.naskaus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center py-3 rounded-lg font-body font-semibold text-sm tracking-wider uppercase glitch-hover interactive transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, var(--arena-blue), var(--arena-violet))',
                color: '#fff',
              }}
            >
              PLAY NOW
            </a>
          </div>
        </div>

        {/* Coming soon cards */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          {[
            { name: 'Nosk Rush', desc: 'Endless runner · Coming soon' },
            { name: 'Dragon Chaos', desc: 'Card battler · Coming soon' },
          ].map((game) => (
            <div
              key={game.name}
              className="flex-1 dark-glass rounded-xl p-5 text-center"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <h4 className="font-heading text-base text-muted font-medium mb-1">{game.name}</h4>
              <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {game.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
