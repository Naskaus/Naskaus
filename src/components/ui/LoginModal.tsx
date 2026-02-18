'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginModal() {
  const { loginModalOpen, closeLoginModal, login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Animate in when modal opens
  useEffect(() => {
    if (loginModalOpen) {
      setError('');
      setEmail('');
      setPassword('');
      // Small delay for DOM paint before animating
      requestAnimationFrame(() => {
        setAnimateIn(true);
      });
      // Focus email input after animation
      setTimeout(() => emailRef.current?.focus(), 500);
    } else {
      setAnimateIn(false);
    }
  }, [loginModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch {
      setError('Invalid credentials. Try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => closeLoginModal(), 350);
  };

  if (!loginModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={panelRef}
        className={`w-full max-w-[420px] rounded-2xl p-8 relative transition-all ${shake ? 'animate-shake' : ''}`}
        style={{
          background: 'rgba(20,20,30,0.95)',
          border: '1px solid rgba(0,245,160,0.2)',
          boxShadow: '0 0 60px rgba(0,245,160,0.1)',
          transform: animateIn ? 'translateY(0)' : 'translateY(100px)',
          opacity: animateIn ? 1 : 0,
          transition: 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 350ms ease',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted hover:text-white transition-colors interactive"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-display text-4xl tracking-wider text-white mb-2">
            NASKAUS.
          </h2>
          <span
            className="font-mono text-xs tracking-[0.3em] uppercase"
            style={{ color: 'var(--accent)' }}
          >
            ACCESS REQUIRED
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              ref={emailRef}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg font-body text-sm text-white placeholder:text-muted bg-transparent outline-none transition-all duration-200"
              style={{
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.boxShadow = '0 0 0 2px rgba(0,245,160,0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg font-body text-sm text-white placeholder:text-muted bg-transparent outline-none transition-all duration-200"
              style={{
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.boxShadow = '0 0 0 2px rgba(0,245,160,0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-400 text-sm font-mono text-center">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-lg font-body font-semibold text-sm tracking-wider uppercase transition-all duration-300 interactive"
            style={{
              background: isLoading ? 'rgba(0,245,160,0.5)' : 'var(--accent)',
              color: 'var(--bg)',
            }}
          >
            {isLoading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-muted text-xs font-mono mt-6">
          Accounts are created by admin only.
        </p>
      </div>
    </div>
  );
}
