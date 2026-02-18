'use client';

import { useEffect, useRef, useCallback } from 'react';
import { mulberry32, seededRandom, seededPick } from '@/lib/mulberry32';

const CONFIG = {
  particleCount: 220,
  particleSize: 2.8,
  glowSize: 8,
  connectionDistance: 140,
  connectionAlpha: 0.35,
  cursorRadius: 200,
  cursorForce: 0.5,
  driftSpeed: 0.0008,
  driftAmplitude: 25,
  breathSpeed: 0.0015,
  breathRange: 0.45,
  springForce: 0.015,
  damping: 0.97,
  seed: 77701,
};

const COLORS = [
  'rgba(255,165,0,1)',
  'rgba(255,149,0,0.9)',
  'rgba(255,200,80,0.85)',
  'rgba(255,220,130,0.7)',
  'rgba(255,255,255,0.6)',
];

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  baseAlpha: number;
  alpha: number;
  driftPhase: number;
  driftAmpX: number;
  driftAmpY: number;
  breathPhase: number;
}

interface LabConstellationProps {
  className?: string;
  opacity?: number;
}

export default function LabConstellation({ className = '', opacity = 1 }: LabConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const rng = mulberry32(CONFIG.seed);
    const countMul = Math.max(0.35, Math.min(1, width / 1920));
    const count = Math.floor(CONFIG.particleCount * countMul);

    for (let i = 0; i < count; i++) {
      const x = seededRandom(rng, 40, width - 40);
      const y = seededRandom(rng, 40, height - 40);
      const baseAlpha = seededRandom(rng, 0.5, 1.0);

      particles.push({
        x, y,
        baseX: x,
        baseY: y,
        vx: 0, vy: 0,
        size: CONFIG.particleSize * (seededRandom(rng, 0.8, 1.4)),
        color: seededPick(rng, COLORS),
        baseAlpha,
        alpha: baseAlpha,
        driftPhase: seededRandom(rng, 0, Math.PI * 2),
        driftAmpX: seededRandom(rng, CONFIG.driftAmplitude * 0.5, CONFIG.driftAmplitude),
        driftAmpY: seededRandom(rng, CONFIG.driftAmplitude * 0.5, CONFIG.driftAmplitude),
        breathPhase: seededRandom(rng, 0, Math.PI * 2),
      });
    }

    return particles;
  }, []);

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { desynchronized: true, alpha: true });
    if (!ctx) return;

    const dt = Math.min(timestamp - lastTimeRef.current, 50);
    lastTimeRef.current = timestamp;
    elapsedRef.current += dt;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;
    const t = elapsedRef.current;

    // Update particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Sine-wave idle drift
      const driftX = Math.sin(t * CONFIG.driftSpeed + p.driftPhase) * p.driftAmpX;
      const driftY = Math.cos(t * CONFIG.driftSpeed * 0.7 + p.driftPhase + 1.3) * p.driftAmpY;
      const targetX = p.baseX + driftX;
      const targetY = p.baseY + driftY;

      // Cursor attraction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.cursorRadius && dist > 1) {
        const force = (1 - dist / CONFIG.cursorRadius) * CONFIG.cursorForce;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Spring toward drift target
      p.vx += (targetX - p.x) * CONFIG.springForce;
      p.vy += (targetY - p.y) * CONFIG.springForce;

      // Damping
      p.vx *= CONFIG.damping;
      p.vy *= CONFIG.damping;

      p.x += p.vx;
      p.y += p.vy;

      // Breathing alpha — always stays visible
      const breath = Math.sin(t * CONFIG.breathSpeed + p.breathPhase);
      p.alpha = p.baseAlpha * (0.65 + breath * CONFIG.breathRange);
    }

    // Draw connections first (behind particles)
    const maxDist = CONFIG.connectionDistance;
    const maxDistSq = maxDist * maxDist;

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const lineAlpha = (1 - dist / maxDist) * CONFIG.connectionAlpha;

          // Brighten near cursor
          const midX = (a.x + b.x) * 0.5;
          const midY = (a.y + b.y) * 0.5;
          const cursorDx = mouse.x - midX;
          const cursorDy = mouse.y - midY;
          const cursorDist = Math.sqrt(cursorDx * cursorDx + cursorDy * cursorDy);
          const cursorBoost = cursorDist < CONFIG.cursorRadius
            ? (1 - cursorDist / CONFIG.cursorRadius) * 0.3
            : 0;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,180,60,${lineAlpha + cursorBoost})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw particles — glow halo then crisp core
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const px = p.x;
      const py = p.y;
      const size = Math.max(1, p.size);

      // Soft glow halo
      ctx.globalAlpha = p.alpha * 0.25;
      ctx.beginPath();
      ctx.arc(px, py, CONFIG.glowSize, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Crisp core dot
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d', { desynchronized: true, alpha: true });
    if (ctx) ctx.scale(dpr, dpr);

    particlesRef.current = initParticles(rect.width, rect.height);
  }, [initParticles]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    handleResize();
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleResize, handleMouseMove, handleMouseLeave, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none', opacity }}
    />
  );
}
