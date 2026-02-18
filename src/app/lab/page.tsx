'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { LAB_APPS } from '@/data/apps';
import LabCard from '@/components/ui/LabCard';

const LabConstellation = dynamic(
  () => import('@/components/canvas/LabConstellation'),
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

export default function LabPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
        <div className="w-full h-screen" />
      </main>
    );
  }

  return (
    <main
      className="relative w-full min-h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-lab)' }}
    >
      <CursorFollower />
      <Navbar showAfterDelay={0} />
      <LoginModal />

      {/* Ambient particles */}
      <LabConstellation opacity={0.4} />

      {/* Back arrow */}
      <Link
        href="/"
        className="fixed top-20 left-6 z-50 flex items-center gap-2 font-mono text-sm transition-colors duration-300 interactive"
        style={{ color: 'var(--lab-amber)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        BACK
      </Link>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
        <h1
          className="section-title-cinematic title-amber text-center mb-4"
          style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}
        >
          THE LAB
        </h1>
        <p className="text-center font-body text-lg mb-12" style={{ color: 'var(--muted)' }}>
          where ideas become apps
        </p>

        {/* Card grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          style={{ perspective: '1200px' }}
        >
          {LAB_APPS.map((app) => (
            <LabCard key={app.id} app={app} />
          ))}
        </div>
      </div>
    </main>
  );
}
