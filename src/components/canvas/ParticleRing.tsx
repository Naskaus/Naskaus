'use client';

import { useEffect, useRef, useCallback } from 'react';
import { mulberry32, seededRandom, seededPick } from '@/lib/mulberry32';

// Particle configuration based on Antigravity specs
const PARTICLE_CONFIG = {
  ringRadius: 120,
  ringThickness: 120,
  particleCount: 90,
  particleRows: 35,
  particleSize: 2,
  particleMinAlpha: 0.1,
  particleMaxAlpha: 1.0,
  animationDuration: 6000,
  interactionRadius: 150,
  seed: 42069,
};

// Particle colors for hero section
const PARTICLE_COLORS = [
  'rgba(255,255,255,0.8)',
  'rgba(0,245,160,0.6)',
  'rgba(0,245,160,0.3)',
  'rgba(255,255,255,0.4)',
  'rgba(200,200,200,0.5)',
];

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  angle: number;
  radius: number;
  rippleOffset: number;
  vx: number;
  vy: number;
}

interface ParticleRingProps {
  className?: string;
}

export default function ParticleRing({ className = '' }: ParticleRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const rippleTimeRef = useRef<number>(0);

  // Initialize particles with deterministic placement
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const rng = mulberry32(PARTICLE_CONFIG.seed);
    const centerX = width / 2;
    const centerY = height / 2;

    // Scale based on viewport
    const scale = Math.min(width, height) / 800;
    const scaledRadius = PARTICLE_CONFIG.ringRadius * scale;
    const scaledThickness = PARTICLE_CONFIG.ringThickness * scale;

    // Adjust particle count based on viewport
    const countMultiplier = Math.max(0.35, Math.min(1, width / 1920));
    const particleCount = Math.floor(PARTICLE_CONFIG.particleCount * countMultiplier);
    const particleRows = Math.floor(PARTICLE_CONFIG.particleRows * countMultiplier);

    for (let row = 0; row < particleRows; row++) {
      const rowRadius = scaledRadius + (scaledThickness / particleRows) * row;
      const rowParticleCount = Math.floor(particleCount * (1 + row * 0.1));

      for (let i = 0; i < rowParticleCount; i++) {
        const angle = (Math.PI * 2 * i) / rowParticleCount;
        // Add some randomness to angle
        const angleOffset = seededRandom(rng, -0.05, 0.05);
        const finalAngle = angle + angleOffset;

        // Add randomness to radius
        const radiusOffset = seededRandom(rng, -5, 5) * scale;
        const finalRadius = rowRadius + radiusOffset;

        const x = centerX + Math.cos(finalAngle) * finalRadius;
        const y = centerY + Math.sin(finalAngle) * finalRadius;

        const baseAlpha = seededRandom(
          rng,
          PARTICLE_CONFIG.particleMinAlpha,
          PARTICLE_CONFIG.particleMaxAlpha
        );

        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          size: PARTICLE_CONFIG.particleSize * scale,
          color: seededPick(rng, PARTICLE_COLORS),
          alpha: baseAlpha,
          baseAlpha,
          angle: finalAngle,
          radius: finalRadius,
          rippleOffset: seededRandom(rng, 0, Math.PI * 2),
          vx: 0,
          vy: 0,
        });
      }
    }

    return particles;
  }, []);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { desynchronized: true, alpha: true });
    if (!ctx) return;

    // Disable image smoothing for crisp pixels
    ctx.imageSmoothingEnabled = false;

    // Calculate delta time
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Update ripple time
    rippleTimeRef.current += deltaTime;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;
    const rippleProgress = (rippleTimeRef.current % PARTICLE_CONFIG.animationDuration) / PARTICLE_CONFIG.animationDuration;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Calculate ripple effect
      const ripplePhase = (rippleProgress * Math.PI * 2 + p.rippleOffset) % (Math.PI * 2);
      const rippleIntensity = Math.sin(ripplePhase) * 0.5 + 0.5;

      // Calculate distance from mouse
      const dx = mouse.x - p.baseX;
      const dy = mouse.y - p.baseY;
      const distFromMouse = Math.sqrt(dx * dx + dy * dy);

      // Cursor repulsion
      if (distFromMouse < PARTICLE_CONFIG.interactionRadius) {
        const force = (1 - distFromMouse / PARTICLE_CONFIG.interactionRadius) * 30;
        const angle = Math.atan2(dy, dx);
        p.vx -= Math.cos(angle) * force * 0.1;
        p.vy -= Math.sin(angle) * force * 0.1;
      }

      // Apply velocity with damping
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.92;
      p.vy *= 0.92;

      // Spring back to base position
      const springForce = 0.08;
      p.x += (p.baseX - p.x) * springForce;
      p.y += (p.baseY - p.y) * springForce;

      // Calculate alpha based on ripple
      p.alpha = p.baseAlpha * (0.5 + rippleIntensity * 0.5);

      // Draw particle as crisp square for sharp rendering
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      const size = Math.max(1, Math.round(p.size));

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(px - size / 2, py - size / 2, size, size);
    }

    // Reset alpha
    ctx.globalAlpha = 1;

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d', { desynchronized: true, alpha: true });
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Reinitialize particles with new dimensions
    particlesRef.current = initParticles(rect.width, rect.height);
  }, [initParticles]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initial setup
    handleResize();
    lastTimeRef.current = performance.now();

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleResize, handleMouseMove, handleMouseLeave, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}
