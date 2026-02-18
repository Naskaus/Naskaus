'use client';

import { useEffect, useRef, useCallback } from 'react';
import { mulberry32, seededRandom, seededRandomInt } from '@/lib/mulberry32';

const CONFIG = {
  particleCount: 180,
  symbolSize: 14,
  glowSize: 16,
  glowAlpha: 0.15,
  cursorRadius: 180,
  cursorForce: 0.3,
  driftSpeed: 0.0006,
  driftAmplitude: 30,
  rotationSpeed: 0.0003,
  springForce: 0.012,
  damping: 0.96,
  seed: 33333,
};

const COLORS = [
  'rgba(0,212,255,0.8)',
  'rgba(189,0,255,0.7)',
  'rgba(0,170,220,0.5)',
  'rgba(150,0,200,0.5)',
  'rgba(255,255,255,0.6)',
];

// Shape types: 0=cross, 1=square, 2=triangle, 3=circle
type ShapeType = 0 | 1 | 2 | 3;

interface ArenaParticle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  shape: ShapeType;
  rotation: number;
  rotationPhase: number;
  driftPhase: number;
  driftAmpX: number;
  driftAmpY: number;
}

interface ArenaParticlesProps {
  className?: string;
  opacity?: number;
}

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const half = size * 0.5;
  ctx.beginPath();
  ctx.moveTo(-half, -half);
  ctx.lineTo(half, half);
  ctx.moveTo(half, -half);
  ctx.lineTo(-half, half);
  ctx.stroke();
  ctx.restore();
}

function drawSquare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const half = size * 0.45;
  ctx.strokeRect(-half, -half, half * 2, half * 2);
  ctx.restore();
}

function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const r = size * 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.866, r * 0.5);
  ctx.lineTo(-r * 0.866, r * 0.5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
  ctx.stroke();
}

const DRAW_FNS = [drawCross, drawSquare, drawTriangle, drawCircle] as const;

export default function ArenaParticles({ className = '', opacity = 1 }: ArenaParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ArenaParticle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: ArenaParticle[] = [];
    const rng = mulberry32(CONFIG.seed);
    const countMul = Math.max(0.35, Math.min(1, width / 1920));
    const count = Math.floor(CONFIG.particleCount * countMul);

    for (let i = 0; i < count; i++) {
      const x = seededRandom(rng, 40, width - 40);
      const y = seededRandom(rng, 40, height - 40);
      const baseAlpha = seededRandom(rng, 0.4, 0.9);
      const sizeVariance = seededRandom(rng, 0.6, 1.4);
      const colorIdx = Math.floor(seededRandom(rng, 0, COLORS.length));
      const shape = seededRandomInt(rng, 0, 3) as ShapeType;

      particles.push({
        x, y,
        baseX: x,
        baseY: y,
        vx: 0, vy: 0,
        size: CONFIG.symbolSize * sizeVariance,
        color: COLORS[colorIdx],
        baseAlpha,
        alpha: baseAlpha,
        shape,
        rotation: 0,
        rotationPhase: seededRandom(rng, 0, Math.PI * 2),
        driftPhase: seededRandom(rng, 0, Math.PI * 2),
        driftAmpX: seededRandom(rng, CONFIG.driftAmplitude * 0.5, CONFIG.driftAmplitude),
        driftAmpY: seededRandom(rng, CONFIG.driftAmplitude * 0.5, CONFIG.driftAmplitude),
      });
    }
    return particles;
  }, []);

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
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

      // Sine-wave idle drift
      const driftX = Math.sin(t * CONFIG.driftSpeed + p.driftPhase) * p.driftAmpX;
      const driftY = Math.cos(t * CONFIG.driftSpeed * 0.7 + p.driftPhase + 1.3) * p.driftAmpY;
      const targetX = p.baseX + driftX;
      const targetY = p.baseY + driftY;

      // Cursor REPULSION (opposite of Lab's attraction)
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
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

      // Rotation
      p.rotation = (t * CONFIG.rotationSpeed + p.rotationPhase);

      // Breathing alpha
      const breath = Math.sin(t * 0.0015 + p.driftPhase);
      p.alpha = p.baseAlpha * (0.7 + breath * 0.3);
    }

    // Draw particles — glow halo then stroked symbol
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Glow halo
      ctx.globalAlpha = p.alpha * CONFIG.glowAlpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, CONFIG.glowSize, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Stroked symbol
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.5;

      if (p.shape === 3) {
        // Circle doesn't need rotation
        drawCircle(ctx, p.x, p.y, p.size);
      } else {
        DRAW_FNS[p.shape](ctx, p.x, p.y, p.size, p.rotation);
      }
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

    const ctx = canvas.getContext('2d', { alpha: true });
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
