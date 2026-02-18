'use client';

import { useEffect, useRef, useCallback } from 'react';
import { mulberry32, seededRandom, seededPick } from '@/lib/mulberry32';

const CONFIG = {
  particleCount: 120,
  particleSize: 2.4,
  glowSize: 6,
  connectionDistance: 160,
  connectionAlpha: 0.2,
  cursorRadius: 180,
  cursorForce: 0.4,
  driftSpeed: 0.0006,
  driftAmplitude: 20,
  breathSpeed: 0.0012,
  breathRange: 0.4,
  springForce: 0.012,
  damping: 0.96,
  seed: 44444,
};

const COLORS = [
  'rgba(0,102,255,0.9)',
  'rgba(0,102,255,0.7)',
  'rgba(255,215,0,0.85)',
  'rgba(255,215,0,0.65)',
  'rgba(100,140,220,0.6)',
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

interface ConstellationCanvasProps {
  className?: string;
  opacity?: number;
}

export default function ConstellationCanvas({ className = '', opacity = 1 }: ConstellationCanvasProps) {
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
      const baseAlpha = seededRandom(rng, 0.4, 0.9);

      particles.push({
        x, y,
        baseX: x,
        baseY: y,
        vx: 0, vy: 0,
        size: CONFIG.particleSize * seededRandom(rng, 0.7, 1.3),
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

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      const driftX = Math.sin(t * CONFIG.driftSpeed + p.driftPhase) * p.driftAmpX;
      const driftY = Math.cos(t * CONFIG.driftSpeed * 0.7 + p.driftPhase + 1.3) * p.driftAmpY;
      const targetX = p.baseX + driftX;
      const targetY = p.baseY + driftY;

      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.cursorRadius && dist > 1) {
        const force = (1 - dist / CONFIG.cursorRadius) * CONFIG.cursorForce;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      p.vx += (targetX - p.x) * CONFIG.springForce;
      p.vy += (targetY - p.y) * CONFIG.springForce;
      p.vx *= CONFIG.damping;
      p.vy *= CONFIG.damping;
      p.x += p.vx;
      p.y += p.vy;

      const breath = Math.sin(t * CONFIG.breathSpeed + p.breathPhase);
      p.alpha = p.baseAlpha * (0.65 + breath * CONFIG.breathRange);
    }

    // Draw connections
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

          const midX = (a.x + b.x) * 0.5;
          const midY = (a.y + b.y) * 0.5;
          const cursorDx = mouse.x - midX;
          const cursorDy = mouse.y - midY;
          const cursorDist = Math.sqrt(cursorDx * cursorDx + cursorDy * cursorDy);
          const cursorBoost = cursorDist < CONFIG.cursorRadius
            ? (1 - cursorDist / CONFIG.cursorRadius) * 0.25
            : 0;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(80,120,200,${lineAlpha + cursorBoost})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      ctx.globalAlpha = p.alpha * 0.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, CONFIG.glowSize, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
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
