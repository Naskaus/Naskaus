'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { SHADOW_NODES } from '@/data/apps';
import { useAuthStore } from '@/store/useAuthStore';

const MatrixRain = dynamic(
  () => import('@/components/canvas/MatrixRain'),
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

const ADMIN_NODE = {
  id: 'admin-panel',
  name: 'Admin Panel',
  icon: 'wrench',
  desc: 'Full system administration.',
  url: 'https://staff.naskaus.com/admin',
  role: 'admin' as const,
};

const NODE_ICONS: Record<string, React.ReactNode> = {
  agency: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M17.5 14v7M14 17.5h7" />
    </svg>
  ),
  tasks: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  party: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M4.93 19.07l2.83-2.83M12 18v4M16.24 16.24l2.83 2.83M18 12h4M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  purchase: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  workflows: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  moltbot: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" /><path d="M12 2v4M7 7h10M8 15h0M16 15h0M10 18h4" />
    </svg>
  ),
  'admin-panel': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
};

export default function ShadowPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { user, openLoginModal, fetchMe } = useAuthStore();
  const userRole = user?.role ?? 'guest';

  useEffect(() => {
    setIsMounted(true);
    fetchMe();
  }, [fetchMe]);

  const visibleNodes = userRole === 'admin'
    ? [...SHADOW_NODES, ADMIN_NODE]
    : SHADOW_NODES;

  const isNodeUnlocked = (nodeRole: string) => {
    if (userRole === 'admin') return true;
    if (userRole === 'user' && nodeRole === 'user') return true;
    return false;
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#050505' }}>
        <div className="w-full h-screen" />
      </main>
    );
  }

  return (
    <main
      className="relative w-full min-h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-shadow)' }}
    >
      <CursorFollower />
      <Navbar showAfterDelay={0} />
      <LoginModal />

      {/* Matrix rain background */}
      <div className="fixed inset-0 z-0" style={{ opacity: 0.6 }}>
        <MatrixRain speedMultiplier={1.0} />
      </div>

      {/* Back arrow */}
      <Link
        href="/"
        className="fixed top-20 left-6 z-50 flex items-center gap-2 font-mono text-sm transition-colors duration-300 interactive"
        style={{ color: 'var(--shadow-green)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        BACK
      </Link>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 max-w-3xl mx-auto">
        <h1
          className="section-title-cinematic title-terminal text-center mb-4"
          style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}
        >
          DIGITAL SHADOW
        </h1>

        <div className="text-center mb-10">
          <span
            className="font-mono text-xs tracking-[0.2em] uppercase animate-blink px-3 py-1 rounded"
            style={{
              color: 'var(--shadow-green)',
              border: '1px solid rgba(0,255,65,0.3)',
              background: 'rgba(0,255,65,0.05)',
            }}
          >
            CLEARANCE REQUIRED
          </span>
        </div>

        {/* Node grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {visibleNodes.map((node) => {
            const unlocked = isNodeUnlocked(node.role);
            return (
              <div key={node.id} className="relative">
                <div
                  className={`node-card relative dark-glass rounded-xl p-5 text-center transition-colors duration-300 ${unlocked ? 'interactive' : ''}`}
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
                  <div className="flex justify-center mb-3" style={{ color: unlocked ? 'var(--shadow-green)' : 'var(--muted)' }}>
                    {NODE_ICONS[node.id] || (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                      style={{
                        background: 'rgba(5,5,5,0.75)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        cursor: userRole === 'guest' ? 'pointer' : 'default',
                      }}
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
    </main>
  );
}
