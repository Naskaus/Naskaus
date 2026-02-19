# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Key Reference Files

- `PROMPT_PRD.md` — Complete product requirements (design specs, component specs, data, auth rules, constraints). Read before any major work.
- `CHECKPOINT.md` — Current phase status and what was last tested. Check before starting work.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (TypeScript strict — must pass with zero errors)
npm run start        # Run production build
npm run lint         # ESLint (Next.js config)
```

No test framework is configured yet.

## Architecture

Next.js 14 App Router + TypeScript strict + Tailwind CSS + GSAP 3 + Canvas 2D particle systems. Scroll-driven immersive portfolio site.

Path alias: `@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Scroll-as-Trigger Architecture (Critical Pattern)

Sections use **trigger-based** animations, NOT scrub-based. ScrollTrigger pins sections but animations are **autonomous GSAP timelines** that fire once on scroll entry and play to completion regardless of scroll direction. This is the core architecture decision — do not revert to scrub-based.

```typescript
const tl = gsap.timeline({ paused: true });
// ... build timeline with absolute time offsets ...

ScrollTrigger.create({
  trigger: section,
  start: 'top top',
  end: '+=300%',     // pin duration
  pin: true,
  onUpdate: (self) => {
    if (!hasPlayedRef.current && self.progress > 0) {
      hasPlayedRef.current = true;
      tl.play();     // fire once, plays autonomously
    }
  },
});
```

Key rules:
- **Zero React state changes in scroll handlers** — use refs + direct DOM manipulation
- **No exit animations** — sections scroll away naturally
- **Fire-and-forget** — once triggered, animation completes regardless of scroll
- Pin durations: Lab 300%, Arena 280%, Shadow 320%, AI Tools 200%

### Cinematic Title System

All sections use `SectionTitle` component with `.section-title-cinematic` CSS class. Color schemes: `amber` (Lab), `blue-violet` (Arena), `green` (Shadow), `blue-gold` (AI Tools), `white` (default). Titles always appear first in the animation timeline before any content.

### Particle Systems (Canvas 2D)

Five particle systems, all following the same pattern (mulberry32 PRNG, delta-time, HiDPI, RAF loop):

| Component | Section | Behavior | Seed |
|-----------|---------|----------|------|
| `ParticleRing.tsx` | Hero | Antigravity ring, cursor repulsion | — |
| `LabConstellation.tsx` | Lab | Amber dots + connections, cursor attraction | 77701 |
| `ArenaParticles.tsx` | Arena | PlayStation shapes (cross/square/triangle/circle), cursor repulsion | 33333 |
| `ConstellationCanvas.tsx` | AI Tools | Blue+gold dots + connections, cursor attraction | 44444 |
| Star field (inline) | Finale | Twinkling white dots | 99999 |

Three.js is used ONLY for `MatrixRain.tsx` (Digital Shadow GLSL shader).

Canvas specs: `desynchronized: true`, DPR scaling (`width = rect.width * dpr`), particle count scales with viewport (`base * (viewport / 1920)`).

### Auth System

JWT httpOnly cookies proxied through Next.js API routes to FastAPI backend at `staff.naskaus.com`. Three roles: GUEST (public), USER (unlocks some Shadow nodes), ADMIN (full access). Auth state managed via Zustand store (`useAuthStore`).

Dev-mode bypass (development only): `admin@naskaus.dev` / `admin` in login route, `dev-admin-token` recognized in me route.

### Auth Proxy Details

- Frontend sends `{ email, password }` → proxy converts to `{ username: email, password }` for backend
- Backend URL prefix is `/api` (e.g., `${BACKEND_URL}/api/auth/login`, not `/auth/login`)
- Backend `ADMIN`/`VIEWER` roles normalize to `admin`/`user` for frontend
- Token stored as `naskaus_token` httpOnly cookie

### Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Landing (scroll) | Full immersive scroll: Hero → Icon Wave → Lab → Arena → Shadow → AI Tools → Finale |
| `/lab` | Section page | Lab apps card grid with LabConstellation particles |
| `/arena` | Section page | The4th hero card with ArenaParticles |
| `/shadow` | Section page | Matrix rain + auth-aware node grid |
| `/ai-tools` | Section page | AI tool cards with ConstellationCanvas |

### Component Conventions

- All interactive/animated components use `'use client'`
- Canvas and browser-API components are dynamically imported with `{ ssr: false }`
- SSR guards: `if (typeof window === 'undefined') return` or `isMounted` state pattern
- `forwardRef` used on components that receive GSAP animation refs (SectionTitle)
- GSAP cleanup: always use `gsap.context()` with `.revert()` in useEffect cleanup
- Three.js cleanup: dispose geometry, material, and renderer
- Section pages share: ambient particles, back arrow (top-left), Navbar with `showAfterDelay={0}`, CursorFollower, LoginModal

### Data

`src/data/apps.ts` is the single source of truth for `LAB_APPS`, `SHADOW_NODES`, and `AI_TOOLS` registries with TypeScript interfaces (`LabApp`, `ShadowNode`, `AITool`).

### Design System

- **Fonts:** Bebas Neue (hero/section titles, MASSIVE), Outfit (headings), DM Sans (body), JetBrains Mono (code/terminal) — all preloaded via Google Fonts CDN in `layout.tsx`
- **Colors:** CSS custom properties in `globals.css` (`--accent: #00F5A0`, `--lab-amber: #FF9500`, `--arena-blue: #00D4FF`, `--shadow-green: #00FF41`, `--ai-blue: #0066FF`, `--ai-gold: #FFD700`)
- **Typography:** Always `clamp()` for responsive sizing, never fixed px for display text
- **Custom cursor:** 28px ring + 6px dot, accent color, lerp 0.15 lag, scales on hover over `.interactive`/`<a>`/`<button>`

## Hard Boundaries

- DO NOT modify FastAPI backend (`staff.naskaus.com`) or PostgreSQL schema
- DO NOT touch sub-site codebases (marifah, meetbeyond, aperipommes, pantiesfan, the4th, agency, tasks, etc.)
- Tech stack is locked — see `PROMPT_PRD.md` for the full list

## Production Deployment

Raspberry Pi 5 via Tailscale (`seb@100.119.245.18`):
- Site: `https://naskaus.com` (Cloudflare tunnel → port 3000)
- Deploy path: `/var/www/naskaus/`
- Process: PM2 (`pm2 start naskaus`)

```bash
npm run build                          # local validation
tar -czf deploy.tar.gz --exclude=node_modules --exclude=.next --exclude=.git --exclude=.env.local -C Naskaus2.0 .
scp deploy.tar.gz seb@100.119.245.18:~/
ssh seb@100.119.245.18                 # then: pm2 stop naskaus, extract, npm install, npm run build, pm2 start naskaus
```

## Phase Workflow

Work is divided into phases. After completing a phase: run `npm run build` (must pass zero errors), update `CHECKPOINT.md` with test URLs and a visual feature checklist, then stop and wait for Nosk's explicit approval before proceeding. Check `CHECKPOINT.md` for current phase status.
