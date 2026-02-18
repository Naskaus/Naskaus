# CLAUDE.md — naskaus.com Project Instructions

## MANDATORY: Read at EVERY session start

At the beginning of EVERY Claude Code session working on this project, you MUST:

1. **Read `PROMPT_PRD.md`** — This is the complete Product Requirements Document.
   It contains all design specs, component specs, data, auth rules, and constraints.
   `cat PROMPT_PRD.md` — Read it entirely. Do not skip sections.

2. **Read `CHECKPOINT.md`** (if it exists) — Shows which phases are complete and
   what was last tested. Never redo completed phases.

3. **Announce your state**: Before any work, say:
   "✅ PRD loaded. Checkpoint: [last phase]. Ready for Phase [next]."

4. **Never assume context from conversation history** — Always re-read the files.
   The files are the truth. Conversation may be incomplete or from a previous session.

## Key constraints (quick reference):
- Stack: Next.js 14 + TypeScript + Tailwind + GSAP + Canvas 2D
- Particles: Canvas 2D ring system (2px particles — NOT large blobs)
- Three.js: ONLY for Digital Shadow Matrix rain shader
- Font: Bebas Neue for NASKAUS. title (MASSIVE size)
- Cursor: Circle (28px, 2px stroke) + inner dot (6px solid)
- Auth: JWT httpOnly cookies, proxy through Next.js API routes
- DO NOT touch: staff.naskaus.com backend, any sub-site, PostgreSQL DB
- Phases: Build → npm run dev → write CHECKPOINT.md → wait for approval

## Project location: C:\Users\sebab\Coding\Rasberry\Naskaus2.0
## Local URL: http://localhost:3000
## Production: https://naskaus.com (via Cloudflare tunnel)

## Quick Commands
```bash
npm install      # Install dependencies
npm run dev      # Development server
npm run build    # Production build
npm start        # Start production server
npx tsc --noEmit # Type check
```

## File Structure (Phase 2 Complete)
```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Landing page with all sections
│   └── globals.css         # Design system tokens + animations
├── components/
│   ├── canvas/
│   │   └── ParticleRing.tsx    # Canvas 2D particle system (crisp 2px)
│   ├── sections/
│   │   ├── Section0Awakening.tsx   # Hero with particles + typewriter
│   │   ├── Section0_5IconWave.tsx  # Tech stack marquee (real SVG logos)
│   │   └── Section1Lab.tsx         # Lab section with app showcase
│   └── ui/
│       ├── AppBall.tsx         # App showcase cards
│       ├── CursorFollower.tsx  # Custom cursor (ring + dot)
│       ├── Navbar.tsx          # Top navigation
│       ├── ScrollDots.tsx      # Section navigation dots
│       ├── SectionCard.tsx     # Frosted glass cards with orbiting dots
│       └── TypewriterText.tsx  # Typing effect with typo simulation
├── data/
│   └── apps.ts             # LAB_APPS, SHADOW_NODES, AI_TOOLS registries
├── hooks/
│   ├── useScrollSection.ts # Scroll progress tracking
│   └── useTypewriter.ts    # Typewriter hook
└── lib/
    ├── api.ts              # API client setup
    ├── gsap.ts             # GSAP + ScrollTrigger registration
    └── mulberry32.ts       # Seeded PRNG for deterministic particles
```

## Technical Notes

### Particle System (ParticleRing.tsx)
- **CRITICAL:** Use `fillRect()` NOT `arc()` for crisp particles
- Always round coords: `Math.round(p.x)`, `Math.round(p.y)`
- Disable smoothing: `ctx.imageSmoothingEnabled = false`
- Uses mulberry32 PRNG for deterministic spawning

### TypewriterText
- Uses setTimeout chain with isCancelled flag (NOT setInterval)
- Includes typo simulation with backspace correction
- Speed params: minCharDelay=28, maxCharDelay=70, linePause=420

### Icon Wave (Section0_5IconWave.tsx)
- Real SVG logos in monochrome (#9AB8A7 grey-green)
- CSS-only marquee + sinusoidal wave animation (±50px)
- 12 icons: Next.js, Python, Docker, FastAPI, Cloudflare, Claude, PostgreSQL, React, GSAP, Tailwind, Gemini, Canvas

### Lab Section (Section1Lab.tsx)
- ScrollTrigger pinned (200vh scroll distance)
- 4 apps revealed on scroll: Marifah, Meet Beyond, Aperi Pommes, PantiesFan
- Progress-based reveals at 15%, 35%, 55%, 75% scroll progress

### Dynamic Imports
- All browser-dependent components use `dynamic()` with `ssr: false`
- Prevents hydration mismatches with canvas/window APIs

## Design Tokens
```css
--bg-hero: #080808
--bg-lab: #0A0A0F
--accent-green: #00F5A0
--lab-amber: #FF9500
--arena-blue: #00D4FF
--shadow-green: #00FF41
--ai-gold: #FFD700
```

## Phase Progress

- [x] **Phase 1:** Foundation + Hero (particles, typewriter, cursor)
- [x] **Phase 2:** Scroll Engine + Lab + Icon Wave
- [ ] **Phase 3:** Arena + Shadow + Auth
- [ ] **Phase 4:** AI Tools + Finale + Section Pages
- [ ] **Phase 5:** Admin Panel + Polish
- [ ] **Phase 6:** Production Deployment

## Next Phase (3) Requirements
- Section2Arena with The4th game showcase
- Section3Shadow with Matrix rain (Three.js GLSL shader)
- MatrixRain.tsx shader component
- Login modal and auth system
- Zustand auth store
- Next.js API proxy routes to staff.naskaus.com

---

## Session Log: February 2026

**Phase 2 Complete.** All features working:
- Hero: crisp particles + elastic letter fly-in + typewriter (1.4x speed)
- Icon Wave: 12 real SVG logos in monochrome, sinusoidal wave animation
- Lab: ScrollTrigger pinned section, 4 app balls with scroll-triggered reveals
- Placeholder sections: Arena, Shadow, AI Tools, Finale

Ready for Phase 3 on next session.
