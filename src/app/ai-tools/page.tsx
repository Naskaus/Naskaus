'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AI_TOOLS } from '@/data/apps';

const ConstellationCanvas = dynamic(
  () => import('@/components/canvas/ConstellationCanvas'),
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

const TOOL_ICONS: Record<string, React.ReactNode> = {
  claude: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 110 20 10 10 0 010-20z" /><path d="M8 12h8M12 8v8" />
    </svg>
  ),
  'claude-code': (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  ),
  antigravity: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
  'ai-studio': (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  stitch: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" />
    </svg>
  ),
  gemini: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9" /><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9" /><path d="M12 3v18" />
    </svg>
  ),
  flow: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
};

export default function AIToolsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="w-full h-screen" />
      </main>
    );
  }

  return (
    <main
      className="relative w-full min-h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-ai)' }}
    >
      <CursorFollower />
      <Navbar showAfterDelay={0} />
      <LoginModal />

      {/* Ambient constellation */}
      <div className="fixed inset-0 z-0">
        <ConstellationCanvas opacity={0.4} />
      </div>

      {/* Back arrow */}
      <Link
        href="/"
        className="fixed top-20 left-6 z-50 flex items-center gap-2 font-mono text-sm transition-colors duration-300 interactive"
        style={{ color: 'var(--ai-blue)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        BACK
      </Link>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
        <h1
          className="section-title-cinematic title-blue-gold text-center mb-4"
          style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}
        >
          AI TOOLS
        </h1>
        <p className="text-center font-body text-lg mb-12" style={{ color: '#666' }}>
          The AI stack powering Naskaus
        </p>

        {/* 3-column tool grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AI_TOOLS.map((tool) => (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ai-tool-card block p-6 interactive"
            >
              <div className="flex justify-center mb-4" style={{ color: 'var(--ai-blue)' }}>
                {TOOL_ICONS[tool.id] || (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h0" />
                  </svg>
                )}
              </div>
              <h4 className="font-heading text-base font-semibold text-center mb-1" style={{ color: '#111' }}>
                {tool.name}
              </h4>
              <p className="font-mono text-xs text-center mb-2" style={{ color: '#888' }}>
                {tool.maker}
              </p>
              <p className="font-body text-sm text-center leading-relaxed" style={{ color: '#555' }}>
                {tool.desc}
              </p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
