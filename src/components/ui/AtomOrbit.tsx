'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { gsap } from '@/lib/gsap';

export interface AtomOrbitHandle {
  play: () => void;
}

const VIEW_ANGLE = 0.3; // ~17° elevation
const TRAIL_LENGTH = 24; // ~400ms at 60fps
const RING_SEGMENTS = 100;

interface RingDef {
  tilt: number;
  speed: number;
  color: string;
}

const RINGS: RingDef[] = [
  { tilt: 0, speed: 4, color: '#00F5A0' },                   // equatorial
  { tilt: Math.PI / 3, speed: 5.5, color: '#00D4FF' },       // 60°
  { tilt: (2 * Math.PI) / 3, speed: 7, color: '#FFD700' },   // 120°
];

interface TrailPoint {
  px: number;
  py: number;
  depth: number;
}

// Pre-compute view trig
const cosV = Math.cos(VIEW_ANGLE);
const sinV = Math.sin(VIEW_ANGLE);

function project(theta: number, tilt: number, R: number) {
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const sinTilt = Math.sin(tilt);
  const cosTilt = Math.cos(tilt);

  const x3d = R * cosT;
  const y3d = -R * sinT * sinTilt;
  const z3d = R * sinT * cosTilt;

  return {
    px: x3d,
    py: y3d * cosV - z3d * sinV,
    depth: y3d * sinV + z3d * cosV,
  };
}

function drawElectron(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  px: number,
  py: number,
  depthFactor: number,
  color: string,
  alpha: number,
) {
  const sz = 4 * depthFactor;

  // Outer glow
  const g = ctx.createRadialGradient(cx + px, cy + py, 0, cx + px, cy + py, sz * 4);
  g.addColorStop(0, color + '80');
  g.addColorStop(1, color + '00');
  ctx.globalAlpha = depthFactor * alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx + px, cy + py, sz * 4, 0, Math.PI * 2);
  ctx.fill();

  // Core
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx + px, cy + py, sz, 0, Math.PI * 2);
  ctx.fill();

  // Bright center
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.9 * depthFactor * alpha;
  ctx.beginPath();
  ctx.arc(cx + px, cy + py, sz * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

const AtomOrbit = forwardRef<AtomOrbitHandle>(function AtomOrbit(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef(0);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const orbitTweensRef = useRef<gsap.core.Tween[]>([]);
  const dimsRef = useRef({ w: 0, h: 0, R: 0 });

  const proxyRef = useRef({ opacity: 0, ringProgress: 0 });
  const electronsRef = useRef(
    RINGS.map((_, i) => ({
      angle: (i / RINGS.length) * Math.PI * 2,
      trail: [] as TrailPoint[],
      orbiting: false,
    }))
  );

  useImperativeHandle(ref, () => ({
    play: () => {
      // Reset state
      electronsRef.current.forEach((e, i) => {
        e.angle = (i / RINGS.length) * Math.PI * 2;
        e.trail = [];
        e.orbiting = false;
      });
      proxyRef.current.opacity = 0;
      proxyRef.current.ringProgress = 0;
      tlRef.current?.play(0);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dims = dimsRef.current;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      dims.w = rect.width;
      dims.h = rect.height;
      dims.R = Math.min(rect.width * 0.22, rect.height * 0.42);
      canvas.width = dims.w * dpr;
      canvas.height = dims.h * dpr;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctxRef.current = ctx;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // GSAP timeline
    const proxy = proxyRef.current;
    const tl = gsap.timeline({ paused: true });

    // Phase 1: fade in + ring draw-on (0–1.5s)
    tl.to(proxy, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0);
    tl.to(proxy, { ringProgress: 1, duration: 1.3, ease: 'power2.inOut' }, 0.1);

    // Phase 2: start continuous orbits (1.5s)
    tl.call(() => {
      const R = dims.R;
      const tweens: gsap.core.Tween[] = [];
      RINGS.forEach((ring, i) => {
        const el = electronsRef.current[i];
        el.orbiting = true;
        const startAngle = el.angle;
        const ep = { angle: startAngle };
        tweens.push(gsap.to(ep, {
          angle: startAngle + Math.PI * 2,
          duration: ring.speed,
          ease: 'none',
          repeat: -1,
          onUpdate: () => {
            el.angle = ep.angle;
            const pt = project(ep.angle, ring.tilt, R);
            el.trail.push(pt);
            if (el.trail.length > TRAIL_LENGTH) el.trail.shift();
          },
        }));
      });
      orbitTweensRef.current = tweens;
    }, [], 1.5);

    // Phase 3: stop orbits + fade out (8s)
    tl.call(() => {
      orbitTweensRef.current.forEach(t => t.kill());
      orbitTweensRef.current = [];
      electronsRef.current.forEach(e => { e.orbiting = false; });
    }, [], 8);
    tl.to(proxy, { opacity: 0, duration: 1.5, ease: 'power2.in' }, 8);

    tlRef.current = tl;

    // --- RAF draw loop ---
    const draw = () => {
      const ctx = ctxRef.current;
      const { w, h, R } = dims;

      if (!ctx || w === 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      const masterAlpha = proxy.opacity;
      if (masterAlpha < 0.001) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const cx = w / 2;
      const cy = h / 2;
      const progress = proxy.ringProgress;

      // ── Orbital ring paths ──
      RINGS.forEach((ring, ri) => {
        const ringP = Math.max(0, Math.min(1, progress * 1.4 - ri * 0.2));
        if (ringP <= 0) return;

        const maxTheta = Math.PI * 2 * ringP;
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1;

        // Two passes: back half (depth ≤ 0) then front half (depth > 0)
        for (let pass = 0; pass < 2; pass++) {
          const isBack = pass === 0;
          ctx.globalAlpha = (isBack ? 0.08 : 0.2) * masterAlpha;
          ctx.beginPath();
          let penDown = false;

          for (let s = 0; s <= RING_SEGMENTS; s++) {
            const theta = (s / RING_SEGMENTS) * maxTheta;
            const { px, py, depth } = project(theta, ring.tilt, R);
            const wantDraw = isBack ? depth <= 0 : depth > 0;

            if (wantDraw) {
              if (!penDown) {
                ctx.moveTo(cx + px, cy + py);
                penDown = true;
              } else {
                ctx.lineTo(cx + px, cy + py);
              }
            } else if (penDown) {
              ctx.stroke();
              ctx.beginPath();
              penDown = false;
            }
          }
          if (penDown) ctx.stroke();
        }

        // ── Static electron during draw-on phase ──
        const el = electronsRef.current[ri];
        if (!el.orbiting && ringP > 0.6) {
          const fadeIn = Math.min(1, (ringP - 0.6) / 0.4);
          const { px, py, depth } = project(el.angle, ring.tilt, R);
          const nd = depth / (R || 1);
          const df = 0.6 + 0.4 * (nd + 1) / 2;
          drawElectron(ctx, cx, cy, px, py, df, ring.color, fadeIn * masterAlpha);
        }
      });

      // ── Trails + orbiting electrons ──
      const electrons = electronsRef.current;
      RINGS.forEach((ring, i) => {
        const el = electrons[i];
        if (!el.orbiting && el.trail.length === 0) return;

        // Trail dots
        const trail = el.trail;
        for (let t = 0; t < trail.length; t++) {
          const pt = trail[t];
          const age = t / trail.length; // 0 = oldest, 1 = newest
          const nd = pt.depth / (R || 1);
          const df = 0.6 + 0.4 * (nd + 1) / 2;
          const sz = (0.5 + 2.5 * age) * df;

          ctx.beginPath();
          ctx.arc(cx + pt.px, cy + pt.py, Math.max(0.3, sz), 0, Math.PI * 2);
          ctx.fillStyle = ring.color;
          ctx.globalAlpha = age * 0.5 * df * masterAlpha;
          ctx.fill();
        }

        // Electron orb
        if (el.orbiting) {
          const { px, py, depth } = project(el.angle, ring.tilt, R);
          const nd = depth / (R || 1);
          const df = 0.6 + 0.4 * (nd + 1) / 2;
          drawElectron(ctx, cx, cy, px, py, df, ring.color, masterAlpha);
        }
      });

      // ── Nucleus glow ──
      const pulseT = performance.now() * 0.001;
      const pulse = 0.12 + 0.08 * Math.sin(pulseT * 1.5);
      const ng = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.45);
      ng.addColorStop(0, `rgba(0, 245, 160, ${pulse})`);
      ng.addColorStop(1, 'rgba(0, 245, 160, 0)');
      ctx.globalAlpha = masterAlpha;
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      orbitTweensRef.current.forEach(t => t.kill());
      orbitTweensRef.current = [];
      tl.kill();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
});

export default AtomOrbit;
