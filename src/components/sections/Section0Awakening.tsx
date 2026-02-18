'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import TypewriterText from '@/components/ui/TypewriterText';

// Dynamic import for ParticleRing (uses Canvas API)
const ParticleRing = dynamic(() => import('@/components/canvas/ParticleRing'), {
  ssr: false,
});

// Typewriter lines from PRD
const TYPEWRITER_LINES = [
  '"Don\'t believe everything you read on the internet"',
  '— Abraham Lincoln',
];

interface Section0AwakeningProps {
  onAnimationComplete?: () => void;
}

export default function Section0Awakening({ onAnimationComplete }: Section0AwakeningProps) {
  // Animation states
  const [pixelVisible, setPixelVisible] = useState(false);
  const [pixelPulsed, setPixelPulsed] = useState(false);
  const [particlesVisible, setParticlesVisible] = useState(false);
  const [lettersAnimating, setLettersAnimating] = useState(false);
  const [titleComplete, setTitleComplete] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [typewriterStarted, setTypewriterStarted] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Generate random positions once on mount for deterministic letter animation
  const letterPositions = useMemo(() => {
    return 'NASKAUS.'.split('').map(() => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      r: (Math.random() - 0.5) * 360,
    }));
  }, []);

  // Animation sequence
  useEffect(() => {
    // 0.0s - Pixel appears
    const t1 = setTimeout(() => setPixelVisible(true), 0);

    // 0.3s - Pixel pulses
    const t2 = setTimeout(() => setPixelPulsed(true), 300);

    // 0.5s - Particles start materializing
    const t3 = setTimeout(() => setParticlesVisible(true), 500);

    // 1.0s - Letters begin flying in
    const t4 = setTimeout(() => setLettersAnimating(true), 1000);

    // 2.5s - Title complete, start pulse
    const t5 = setTimeout(() => setTitleComplete(true), 2500);

    // 3.0s - Subtitle fades in
    const t6 = setTimeout(() => setSubtitleVisible(true), 3000);

    // 4.0s - Typewriter begins
    const t7 = setTimeout(() => setTypewriterStarted(true), 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, []);

  // Handle typewriter completion
  const handleTypewriterComplete = () => {
    setTimeout(() => {
      setShowScrollIndicator(true);
      onAnimationComplete?.();
    }, 500);
  };

  // Split "NASKAUS." into individual letters for animation
  const titleLetters = 'NASKAUS.'.split('');

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden section-wrapper"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Particle Ring Background */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          particlesVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ParticleRing />
      </div>

      {/* Central Pixel */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full transition-all duration-300 ${
          pixelVisible ? 'opacity-100' : 'opacity-0'
        } ${pixelPulsed ? 'animate-ping' : ''}`}
        style={{
          boxShadow: pixelPulsed ? '0 0 20px rgba(255,255,255,0.8)' : 'none',
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* Title: NASKAUS. */}
        <h1
          ref={titleRef}
          className={`hero-title flex items-center justify-center ${
            titleComplete ? 'animate-pulse-glow' : ''
          }`}
        >
          {titleLetters.map((letter, index) => (
            <span
              key={index}
              className="inline-block transition-all duration-500"
              style={{
                opacity: lettersAnimating ? 1 : 0,
                transform: lettersAnimating
                  ? 'translate(0, 0) rotate(0deg)'
                  : `translate(${letterPositions[index].x}vw, ${letterPositions[index].y}vh) rotate(${letterPositions[index].r}deg)`,
                transitionDelay: `${index * 80}ms`,
                transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // elastic
              }}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-4 font-body text-muted text-lg md:text-xl tracking-widest transition-all duration-700 ${
            subtitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          WebApp Incubator Platform
        </p>

        {/* Typewriter Text */}
        <div
          className={`mt-12 max-w-3xl text-center transition-opacity duration-500 ${
            typewriterStarted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {typewriterStarted && (
            <TypewriterText
              lines={TYPEWRITER_LINES}
              minCharDelay={28}
              maxCharDelay={70}
              typoChance={0.02}
              linePause={420}
              onComplete={handleTypewriterComplete}
              className="typewriter-text"
            />
          )}
        </div>

        {/* Scroll Down Indicator */}
        <div
          className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 transition-all duration-700 ${
            showScrollIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span
            className="font-body text-sm tracking-widest animate-pulse-glow"
            style={{ color: 'var(--accent)' }}
          >
            Scroll down
          </span>

          {/* Bouncing Arrow */}
          <svg
            className="w-6 h-6 animate-bounce-arrow"
            style={{ color: 'var(--accent)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Scroll Progress Bar (left edge) */}
      <div className="scroll-progress">
        <div
          className="scroll-progress-bar"
          style={{
            height: '0%', // Will be controlled by scroll in Phase 2
          }}
        />
      </div>
    </section>
  );
}
