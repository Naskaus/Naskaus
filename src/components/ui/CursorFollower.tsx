'use client';

import { useEffect, useRef, useState } from 'react';

interface CursorFollowerProps {
  color?: string;
  ringSize?: number;
  dotSize?: number;
  lag?: number;
}

export default function CursorFollower({
  color = '#00F5A0',
  ringSize = 28,
  dotSize = 6,
  lag = 0.15,
}: CursorFollowerProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const animationRef = useRef<number>(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show cursor on desktop (pointer devices)
    if (typeof window === 'undefined') return;

    const hasPointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasPointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Check for interactive elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.classList.contains('interactive');

      setIsHovering(!!isInteractive);
    };

    // Animation loop with lerp
    const animate = () => {
      const ring = ringRef.current;
      const dot = dotRef.current;

      if (ring && dot) {
        // Lerp position
        positionRef.current.x += (targetRef.current.x - positionRef.current.x) * lag;
        positionRef.current.y += (targetRef.current.y - positionRef.current.y) * lag;

        const x = positionRef.current.x;
        const y = positionRef.current.y;

        // Ring follows with lag
        ring.style.transform = `translate(${x - ringSize / 2}px, ${y - ringSize / 2}px)`;

        // Dot follows target directly (no lag) for precision
        dot.style.transform = `translate(${targetRef.current.x - dotSize / 2}px, ${targetRef.current.y - dotSize / 2}px)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleElementHover);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleElementHover);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [lag, ringSize, dotSize, isVisible]);

  // Don't render on SSR
  if (typeof window === 'undefined') return null;

  const ringStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: isHovering ? 48 : ringSize,
    height: isHovering ? 48 : ringSize,
    border: `2px solid ${color}`,
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 99999,
    opacity: isVisible ? 1 : 0,
    transition: 'width 0.2s ease, height 0.2s ease, opacity 0.3s ease',
    willChange: 'transform',
  };

  const dotStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: dotSize,
    height: dotSize,
    backgroundColor: color,
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 99999,
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.3s ease',
    willChange: 'transform',
  };

  return (
    <>
      <div ref={ringRef} style={ringStyles} />
      <div ref={dotRef} style={dotStyles} />
    </>
  );
}
