# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session Start Protocol

1. Read `PROMPT_PRD.md` — the complete product requirements document (design specs, component specs, data, auth rules, constraints)
2. Read `CHECKPOINT.md` — shows which phases are complete and what was last tested
3. Announce: "PRD loaded. Checkpoint: [last phase]. Ready for Phase [next]."
4. Never assume context from prior sessions — the files are the source of truth

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (must pass with zero errors before deploy)
npm run start        # Run production build
npm run lint         # ESLint
```

Production deployment (Raspberry Pi 5):
```bash
pm2 start npm --name "naskaus" -- start
pm2 save
```

## Architecture

This is a scroll-driven immersive portfolio site built with **Next.js 14 App Router**, **TypeScript strict**, **Tailwind CSS**, **GSAP 3 + ScrollTrigger**, and **Canvas 2D** particle systems.

### Scroll-as-Trigger Architecture (Critical Pattern)

Sections use **trigger-based** animations, NOT scrub-based. ScrollTrigger pins sections but animations are **autonomous GSAP timelines** that fire once on scroll entry and play to completion regardless of scroll direction. This is the core architecture decision — do not revert to scrub-based.

```typescript
// The pattern used in ALL sections (Lab, Arena, Shadow, AI Tools):
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
- **No exit animations** — sections scroll away naturally (like the hero)
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

### Auth System

JWT httpOnly cookies proxied through Next.js API routes to FastAPI backend at `staff.naskaus.com`. Three roles: GUEST (public), USER (unlocks some Shadow nodes), ADMIN (full access). Auth state managed via Zustand store (`useAuthStore`).

Dev-mode bypass (development only): `admin@naskaus.dev` / `admin` in login route, `dev-admin-token` recognized in me route.

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
- Section pages share: ambient particles, back arrow (top-left), Navbar with `showAfterDelay={0}`, CursorFollower, LoginModal

### Design System

- **Fonts:** Bebas Neue (hero/section titles, MASSIVE), Outfit (headings), DM Sans (body), JetBrains Mono (code/terminal) — all preloaded via Google Fonts CDN in `layout.tsx`
- **Colors:** CSS custom properties in `globals.css` (`--accent: #00F5A0`, `--lab-amber: #FF9500`, `--arena-blue: #00D4FF`, `--shadow-green: #00FF41`, `--ai-blue: #0066FF`, `--ai-gold: #FFD700`)
- **Typography:** Always `clamp()` for responsive sizing, never fixed px for display text
- **Custom cursor:** 28px ring + 6px dot, accent color, lerp 0.15 lag, scales on hover over `.interactive`/`<a>`/`<button>`

### Data

`src/data/apps.ts` is the single source of truth for `LAB_APPS`, `SHADOW_NODES`, and `AI_TOOLS` registries with TypeScript interfaces (`LabApp`, `ShadowNode`, `AITool`).

## Hard Boundaries

- Do NOT modify the FastAPI backend (`staff.naskaus.com`)
- Do NOT modify the PostgreSQL database schema
- Do NOT touch any sub-site codebase (marifah, meetbeyond, aperipommes, pantiesfan, the4th, agency, tasks, etc.)
- Do NOT use Three.js anywhere except the Matrix rain shader in Digital Shadow
- Do NOT use tsparticles — use Canvas 2D with the mulberry32 PRNG pattern
- Do NOT use scrub-based scroll animations — use trigger-based (fire-once) timelines
- Do NOT use React state in scroll handlers — use refs + direct DOM manipulation
- `overflow-x: hidden` on html, body, and every section wrapper — no horizontal scroll at any viewport

## Phase Workflow

Work is divided into 6 phases. After completing a phase: run `npm run build` (must pass zero errors), update `CHECKPOINT.md` with test URLs and a visual feature checklist, then stop and wait for Nosk's explicit approval before proceeding.

**Completed:** Phase 1 (Foundation + Hero), Phase 2 (Scroll + Lab + Icon Wave), Phase 3 (Arena + Shadow + Auth + Cinematic Redesign), Phase 4 (AI Tools + Finale + Section Pages)
**Next:** Phase 5 (Admin Panel + Polish)
