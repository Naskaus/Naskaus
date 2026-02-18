'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NavbarProps {
  showAfterDelay?: number;
}

const NAV_LINKS = [
  { href: '#lab', label: 'THE LAB', color: '#FF9500' },
  { href: '#arena', label: 'GAME ARENA', color: '#00D4FF' },
  { href: '#shadow', label: 'DIGITAL SHADOW', color: '#00FF41' },
  { href: '#ai-tools', label: 'AI TOOLS', color: '#FFD700' },
];

export default function Navbar({ showAfterDelay = 3500 }: NavbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, showAfterDelay);

    return () => clearTimeout(timer);
  }, [showAfterDelay]);

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[9990] transition-all duration-500 ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        style={{
          background: 'rgba(8,8,8,0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-2xl tracking-wider text-white hover:text-accent transition-colors duration-300 interactive"
          >
            NASKAUS.
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative font-heading text-sm tracking-widest text-text-secondary hover:text-white transition-colors duration-300 interactive"
                style={{
                  color: activeSection === link.href.slice(1) ? link.color : undefined,
                }}
              >
                {link.label}
                {/* Active underline */}
                {activeSection === link.href.slice(1) && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-0.5"
                    style={{ backgroundColor: link.color }}
                  />
                )}
              </a>
            ))}
          </div>

          {/* Login Button (placeholder for now) */}
          <div className="hidden md:block">
            <button className="font-body text-sm px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent hover:text-bg transition-all duration-300 interactive">
              LOGIN
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden w-8 h-8 flex flex-col justify-center items-center gap-1.5 interactive"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[9989] md:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'rgba(8,8,8,0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {NAV_LINKS.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className="font-heading text-2xl tracking-widest transition-colors duration-300"
              style={{
                color: link.color,
                transitionDelay: `${index * 100}ms`,
                transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                opacity: isMobileMenuOpen ? 1 : 0,
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}

          {/* Login in mobile menu */}
          <button
            className="mt-8 font-body text-lg px-6 py-3 rounded-lg border border-accent text-accent hover:bg-accent hover:text-bg transition-all duration-300"
            style={{
              transitionDelay: `${NAV_LINKS.length * 100}ms`,
              transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
              opacity: isMobileMenuOpen ? 1 : 0,
            }}
          >
            LOGIN
          </button>
        </div>
      </div>
    </>
  );
}
