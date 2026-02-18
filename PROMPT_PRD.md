# NASKAUS.COM — MASTER PROMPT + PRD
**Version: 3.0 (Synthesized) | February 2026 | Author: Nosk / GEM**
**Synthesized by: Claude — Senior Prompt Engineer**

---

## 🔴 MANDATORY READING PROTOCOL

**THIS FILE IS YOUR BIBLE FOR THIS PROJECT.**

At the start of EVERY session working on naskaus.com, you MUST:

1. Read this entire file (`PROMPT_PRD.md`) before writing a single line of code
2. Check `CHECKPOINT.md` (if it exists) to understand what phases are done
3. Announce: "✅ PRD loaded. Last checkpoint: [X]. Starting Phase [Y]."
4. Never assume prior context — always re-read this file

This is not optional. This is your operating system for this project.

---

## 🧠 WHO YOU ARE

You are a **Senior Full-Stack Engineer + Creative Director** with mastery of:

- Next.js 14 App Router, React 18, TypeScript (strict mode)
- GSAP 3 + ScrollTrigger (advanced pinning, scrubbing, timelines)
- Canvas 2D API with `requestAnimationFrame` physics loops
- Three.js r160+ (ONLY for Matrix rain shader in Digital Shadow — use Canvas 2D everywhere else)
- Tailwind CSS + CSS custom properties
- JWT authentication with httpOnly cookies (SSR-safe, Next.js middleware)
- FastAPI REST integration via Next.js API proxy routes
- Production deployment: Raspberry Pi 5, PM2, Cloudflare Tunnels

You build **complete, production-ready, running code**. No TODOs. No placeholders. No "implement this later". If a feature requires something you cannot build (e.g. real video files don't exist yet), you build a working placeholder that is visually correct and explain exactly what asset needs replacing.

---

## 🏗️ PROJECT CONTEXT

**Platform:** naskaus.com — Personal WebApp Incubator for Nosk  
**Infrastructure:** Raspberry Pi 5 (16GB) · Debian · Cloudflare Tunnels · Docker  
**New service:** Next.js on port 3000 → add to Cloudflare tunnel  
**Backend (EXISTING — DO NOT TOUCH):** FastAPI at `https://staff.naskaus.com` (port 8001)  
**Database (EXISTING — DO NOT TOUCH):** PostgreSQL 17 (system) — used by Digital Shadow  
**Deployment:** PM2 or Docker in `/var/www/naskaus/` on Pi 5  

### ⛔ HARD BOUNDARIES — NEVER CROSS
- Do NOT touch, modify, or connect to any sub-site codebase (marifah, meetbeyond, aperipommes, pantiesfan, the4th, agency, tasks, etc.)
- Do NOT modify the FastAPI backend (`staff.naskaus.com`)
- Do NOT modify the PostgreSQL database schema
- Do NOT touch any Docker containers other than the naskaus.com Next.js app
- naskaus.com ONLY reads from the existing auth API — it does not own or rebuild it

### Workflow with Nosk
- Work is divided into **6 phases maximum**
- After each phase: run `npm run dev`, write `CHECKPOINT.md` with exact browser URLs to test + visual feature checklist
- Nosk tests visually, gives feedback, you start next phase
- Never move to next phase without Nosk's explicit "OK, continue"

---

## ⚙️ TECH STACK (LOCKED — DO NOT DEVIATE)

```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript (strict)",
  "styling": "Tailwind CSS + CSS Modules for per-section overrides",
  "particles_hero": "Canvas 2D API (requestAnimationFrame) — NOT Three.js, NOT tsparticles",
  "particles_section": "Canvas 2D API — per-section color/behavior via lerp",
  "particles_matrix": "Three.js GLSL shader — ONLY for Digital Shadow section",
  "scroll_animation": "GSAP 3 + ScrollTrigger + SplitText",
  "state": "Zustand",
  "auth": "JWT httpOnly cookies via Next.js API routes proxying FastAPI",
  "http": "Axios",
  "fonts": "Google Fonts CDN (preloaded)"
}
```

**WHY Canvas 2D for particles (not Three.js/tsparticles):** The Antigravity-style ring effect uses Canvas 2D with mulberry32 PRNG for deterministic particle placement, `requestAnimationFrame` with delta-time, `desynchronized: true`, and auto-scaling for HiDPI. This is lighter, more controllable, and matches the reference aesthetic exactly. Use this pattern everywhere except the Matrix rain (which needs GLSL).

---

## 🎨 DESIGN SYSTEM (NON-NEGOTIABLE)

### Typography

```css
/* Google Fonts — preload all 4 in layout.tsx <head> */
--font-display: 'Bebas Neue', sans-serif;     /* NASKAUS. wordmark — fat, modern, impactful */
--font-heading: 'Outfit', sans-serif;          /* Section titles — clean geometric */
--font-body: 'DM Sans', sans-serif;            /* Body, UI elements */
--font-mono: 'JetBrains Mono', monospace;     /* Code, Digital Shadow, terminal */
```

**WHY Bebas Neue for NASKAUS.:** Fat, tall, condensed, 100% modern and bold. Zero old-school serif energy. Instantly recognizable. Think streetwear × tech.

### Font Sizes — HERO MUST BE MASSIVE

```css
/* NASKAUS. hero title */
font-size: clamp(5rem, 18vw, 14rem);   /* MASSIVE — like Antigravity's hero */
letter-spacing: 0.05em;

/* Typewriter text — must be large and readable */
font-size: clamp(1.4rem, 3.5vw, 2.8rem);
line-height: 1.6;

/* Section headings */
font-size: clamp(2.5rem, 6vw, 5rem);
```

### Color Tokens

```css
:root {
  /* Backgrounds */
  --bg: #080808;                    /* Hero/Awakening — near black */
  --bg-lab: #0D0D0D;               /* Lab section — dark charcoal */
  --bg-arena: #000000;             /* Game Arena — pure black */
  --bg-shadow: #050505;            /* Digital Shadow — pure black */
  --bg-ai: #F9FAFB;               /* AI Tools — light (intentional contrast) */
  --surface: #1e1e2e;             /* Cards, nav bar, elevated panels */

  /* Text */
  --text-primary: #FFFFFF;         /* Headings, hero text */
  --text-secondary: #E8EAED;      /* Body copy, descriptions */
  --muted: #9AA0A6;               /* Tertiary labels, captions */

  /* Section Accents */
  --accent: #00F5A0;              /* Brand primary — neon green CTAs, borders */
  --lab-amber: #FF9500;          /* Lab section */
  --arena-blue: #00D4FF;         /* Game Arena */
  --arena-violet: #BD00FF;       /* Game Arena secondary */
  --shadow-green: #00FF41;       /* Digital Shadow / Matrix */
  --ai-blue: #0066FF;            /* AI Tools */
  --ai-gold: #FFD700;            /* AI Tools secondary */

  /* Particle colors per section (used in Canvas lerp) */
  --particle-hero: rgba(255,255,255,0.8);
  --particle-hero-accent: rgba(0,245,160,0.6);
}
```

### Custom Cursor

```css
/* Custom cursor — circle + inner dot */
/* Outer ring: 28px, 2px stroke, var(--accent) color */
/* Inner dot: 6px solid, var(--accent) color */
/* Cursor follows mouse with slight lag (lerp 0.15) */
/* On hover over interactive elements: outer ring scales to 48px */
```

---

## 🌀 ANTIGRAVITY PARTICLE SYSTEM — EXACT SPECS TO REPLICATE

*Based on DevTools inspection of antigravity.google and the research document.*

### Hero Ring Particle System (Canvas 2D)

```javascript
const PARTICLE_CONFIG = {
  ringRadius: 120,         // inner radius px
  ringThickness: 120,      // band width px
  particleCount: 90,       // particles per row
  particleRows: 35,        // concentric ring layers
  particleSize: 2,         // px radius — TINY. NOT 20PX.
  particleMinAlpha: 0.1,
  particleMaxAlpha: 1.0,
  animationDuration: 6000, // ms for ripple cycle
  interactionRadius: 150,  // px cursor repulsion radius
  prng: 'mulberry32',      // deterministic seeding
  canvasOptions: { desynchronized: true, alpha: true }
};
```

### NASKAUS Hero Particle Colors (adapted from Antigravity)

```javascript
const NASKAUS_PARTICLE_COLORS = [
  'rgba(255,255,255,0.8)',   // primary white
  'rgba(0,245,160,0.6)',     // accent green
  'rgba(0,245,160,0.3)',     // faint green
  'rgba(255,255,255,0.4)',   // dim white
  'rgba(200,200,200,0.5)',   // silver
];
```

### Per-Section Particle Color Lerp (change on section transition)
- **Hero (Section 0):** white/silver + accent green (above)
- **Lab (Section 1):** amber `#FF9500` variants
- **Arena (Section 2):** electric blue `#00D4FF` + violet `#BD00FF`
- **Shadow (Section 3):** matrix green `#00FF41` + dark green (Three.js shader takes over)
- **AI Tools (Section 4):** gold `#FFD700` + blue `#0066FF`

### Canvas Architecture Notes
- `desynchronized: true` on all Canvas 2D contexts
- DPR scaling: `canvas.width = rect.width * window.devicePixelRatio`
- Delta-time in all RAF loops (speed independent of frame rate)
- Particle count scales with viewport: `Math.floor(base * (viewport/1920))`
- mulberry32 PRNG for deterministic particle placement (same layout on every load)

---

## 📋 INFORMATION ARCHITECTURE

### Routes

| Route | Page Type | Auth Required | Description |
|---|---|---|---|
| `/` | Landing (Scroll) | None | Full immersive scrolling experience |
| `/lab` | Section Page (Fixed) | None | The Lab — web prototypes showcase |
| `/arena` | Section Page (Fixed) | None | Game Arena — game projects showcase |
| `/shadow` | Section Page (Fixed) | User/Admin | Digital Shadow — operational apps |
| `/ai-tools` | Section Page (Fixed) | None | AI Tools — developer resources |
| `/admin` | Admin Panel | Admin only | User CRUD, system management |

### Auth Flow (Proxied — DO NOT REBUILD BACKEND)

```
Next.js /api/auth/login  →  POST https://staff.naskaus.com/auth/login
Next.js /api/auth/me     →  GET  https://staff.naskaus.com/auth/me
Next.js /api/auth/logout →  POST https://staff.naskaus.com/auth/logout
```

- Cookie name: `naskaus_token` (httpOnly, secure, sameSite: strict)
- Backend base: `process.env.BACKEND_URL` (= https://staff.naskaus.com)
- On login success: set httpOnly cookie, return `{ user, role }`
- On fail: return 401 `{ error: 'Invalid credentials' }`

---

## 🎬 THE SCROLL EXPERIENCE — FULL SPEC

### Architecture

```
Landing page scroll total: ~1200vh (desktop) / ~800vh (mobile)
Each section: pinned via GSAP ScrollTrigger, scrub: 1.2
Scroll dot indicators: right edge (desktop), bottom-center (mobile)
Section transitions: particle color cross-fade 400ms, no hard cuts
```

---

### SECTION 0 — THE AWAKENING (Auto-plays, no scroll)

**Font:** Bebas Neue — `clamp(5rem, 18vw, 14rem)` — MASSIVE  
**Color:** Pure white  
**Background:** `#080808`  
**Particle mood:** White/silver ring system (Canvas 2D, Antigravity params above)

#### Animation Sequence (auto-plays on page load)

```
0.0s  — Screen is black. A single white pixel appears center-screen.
0.3s  — Pixel pulses once. Particles begin materializing, drifting in from off-screen.
1.0s  — Letters begin arriving from all directions (GSAP SplitText).
        Each letter of "NASKAUS." flies in from a random off-screen position,
        snaps into place with elastic easing. 80ms stagger between letters.
2.5s  — "NASKAUS." fully formed. Subtle scale-pulse: 1.0 → 1.03 → 1.0
3.0s  — Below title, smaller text fades in letter by letter:
        "WebApp Incubator Platform" (DM Sans, muted color)
3.5s  — Navbar fades in from top.
4.0s  — Typewriter sequence begins (see below).
```

#### Typewriter Dialogue

Custom React hook `useTypewriter(text, speed, onComplete)`. Random keystroke delays 40–120ms. Occasional typo + backspace for realism.

| Beat | Typed Text |
|---|---|
| Line 1 | Hello, I'm Nosk. |
| Line 2 | Creator of naskaus.com |
| Line 3 | I work in Business Intelligence and Operations... |
| Line 4 | 20+ years building systems that actually work. |
| Line 5 | Then AI stormed humanity. |
| Line 6 | It felt like being handed superpowers. |
| Line 7 | So I started building. |
| Line 8 | And building. And building. |
| Line 9 | What you're about to see... is what happens when operations meets intelligence. |
| Line 10 | Scroll down. ↓ |

"Scroll down. ↓" pulses gently. Particle ring ripple accelerates slightly. SVG down-arrow bounces below typewriter. Scroll progress bar appears on left edge.

#### Scroll Down Arrow

```css
@keyframes bounce-arrow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}
animation: bounce-arrow 1.8s ease-in-out infinite;
color: var(--accent);
```

---

### SECTION 0.5 — ICON WAVE (Between Hero and Lab, no pin)

Transition section. **60vh height. Not pinned. Normal scroll.**  
Icon marquee strip (see Icon Wave spec below).  
Background gradient: `#080808` → `#0D0D0D`.  
Particles continue from Section 0, slowly shifting to amber.

#### Icon Wave / Marquee

```tsx
// Horizontal auto-scrolling strip — CSS animation only (no JS scroll)
// Single row of SVG icons, duplicated 3x for seamless loop
// Animation: translateX(0) → translateX(-33.333%) infinite
// Duration: 30s (desktop) / 20s (mobile) linear

const ICON_WAVE_ITEMS = [
  { icon: '⚡', label: 'Next.js' },
  { icon: '🐍', label: 'Python' },
  { icon: '🐳', label: 'Docker' },
  { icon: '🍓', label: 'Raspberry Pi' },
  { icon: '⚡', label: 'FastAPI' },
  { icon: '☁️', label: 'Cloudflare' },
  { icon: '🤖', label: 'Claude AI' },
  { icon: '🎮', label: 'Canvas API' },
  { icon: '🗄️', label: 'PostgreSQL' },
  { icon: '⚛️', label: 'React' },
  { icon: '🎯', label: 'GSAP' },
  { icon: '🌐', label: 'Tailwind' },
  // Use actual SVG logos where possible (react-icons or inline SVG)
];

// CSS: @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }
// Wrapper: overflow: hidden, width: 100%
// Track: display: flex, width: fit-content
```

---

### SECTION 1 — THE LAB (Pinned, 200vh scroll)

**Particle mood:** Amber (`#FF9500`) ring particles, hex-cluster formation on entry  
**Background:** `#0D0D0D` with faint circuit-board SVG pattern (CSS background-image, 3% opacity)

```
Scroll 0–15%:
  "THE LAB" label fades in: var(--font-heading), 0.85rem, var(--lab-amber), ALL CAPS, letter-spacing: 0.3em
  SectionCard materializes:
    - 540px × 340px frosted glass card
    - background: rgba(255,251,240,0.04)
    - backdrop-filter: blur(16px)
    - border: 1px solid rgba(255,149,0,0.3)
    - border-image: animated SVG stroke (dashOffset keyframe, amber)
    - Scale: 0.1 → 1.0 + rotateZ: 360→0 simultaneously
    - Elastic ease, 0.8s
  Inside card: 4 small "planet" orbs orbiting in CSS keyframe animation

Scroll 15–35%: APP BALL #1 — Marifah
  - Ball (200px) bursts from card center: scale 0.1→1.0, 0.5s spring ease
  - Expands to 50vw wide showcase panel (desktop), 90vw (mobile)
  - Green (#4ADE80) radial pulse sweeps from ball center outward
  - Content slides in: screenshot | labels | tech tags | CTA
  - Labels: "Thai Restaurant · Meyrin, Geneva · Bilingual FR/EN"
  - Tech tags: React · Tailwind · Supabase
  - CTA: "VISIT APP →" → marifah.naskaus.com (new tab)
  - Ball shrinks back at 35%

Scroll 35–55%: APP BALL #2 — Meet Beyond
  - Coral (#FF6B6B) accent
  - Labels: "Travel Voucher App · Thailand DMC Partners · Works Offline"
  - Tech tags: PWA · Vanilla JS · Offline-first · QR Vouchers
  - Link: meetbeyond.naskaus.com

Scroll 55–75%: APP BALL #3 — Aperi Pommes
  - Kraft brown (#8B5E3C) + cream accent
  - Labels: "Swiss Made · 100% Fruit · Artisan Craft · Multilingual FR/DE/EN"
  - Tech tags: Vue.js · i18n · Admin CMS · SEO
  - Link: aperipommes.naskaus.com

Scroll 75–90%: APP BALL #4 — PantiesFan
  - Crimson (#DC143C) accent
  - "18+ Platform" badge (red pill)
  - Small ASCII wink typed: "yeah... niche markets need love too 😉"
  - Labels: "Niche Auction Platform · Adults Only · Real-Time Bidding"
  - Tech tags: HTML · CSS · JS · Custom Auction Engine · Admin Panel
  - Link: pantiesfan.com (guest viewable — keep tasteful, use dark luxury UI screenshot)
  - Keep professional and slightly playful. No explicit imagery.

Scroll 90–100%: Lab exit
  - All balls + card lift upward (y: 0→-100vh, 400ms)
  - Particles shift amber→electric blue (lerp over 600ms)
  - Background gains scanline overlay (CSS repeating-linear-gradient, 3% opacity)
```

---

### SECTION 2 — GAME ARENA (Pinned, 150vh scroll)

**Particle mood:** Electric blue (`#00D4FF`) + violet (`#BD00FF`), morphing into ✕ ○ □ △ shapes  
**Background:** Pure black (`#000000`), CSS scanlines overlay  
**Atmosphere:** Neon grid floor perspective (CSS 3D transform on SVG grid)

```
Scroll 0–20%:
  "GAME ARENA" label fades in: var(--arena-color), var(--font-heading)
  GAME ARENA card drops from top:
    - fromY: -200px → 0, ease: "bounce.out", duration: 0.8s
    - Dark glass card, border: 2px solid var(--arena-blue)
    - Neon glow: box-shadow: 0 0 30px rgba(0,212,255,0.4)
    - CSS scanlines overlay inside card
    - Electric spark: SVG path with dashOffset animation traces border

Scroll 20–65%: THE FOURTH showcase
  - Ball bursts out: electric blue accent
  - Content: game description + animated canvas demo (mini Connect-4 board)
  - GSAP number counters: "2 Players · ∞ Color Combos"
  - CTA: "PLAY NOW" button with glitch effect on hover:
    /* Glitch: clip-path animation cycling 3 variants every 0.1s on hover */
  - Link: the4th.naskaus.com

Scroll 65–90%: Coming Soon cards
  - "Nosk Rush" card: pixel-art background, "IN DEVELOPMENT" badge (var(--arena-color))
  - "Dragon Chaos" card: dragon emoji + "CONCEPT" badge
  - Cards float in from left/right with stagger
  - Hover: translateY(-8px) + glow deepens

Scroll 90–100%: Arena exit
  - Everything lifts up
  - Screen darkens: background-color transitions from #000 to #050505
  - Matrix green characters begin raining in from top (Three.js shader init)
```

---

### SECTION 3 — DIGITAL SHADOW (Pinned, 250vh scroll)

**Particle mood:** Matrix green characters rain (Three.js GLSL shader)  
**Background:** Pure black with full Matrix character rain  
**Atmosphere:** Classified, CRT scanline flicker, faint red "CLASSIFIED" watermark

```
Scroll 0–20%:
  "DIGITAL SHADOW" label: var(--shadow-color), var(--font-mono), ALL CAPS
  Card decloaks from matrix: characters swirl inward and form card shape
  Card content:
    - "DIGITAL SHADOW" in JetBrains Mono, var(--shadow-color)
    - Blinking "● CLEARANCE REQUIRED" badge (CSS blink animation, 1s)
    - Inside: 6 hex-shaped app nodes in honeycomb layout

Scroll 20–95%: App nodes fly out one by one (6 nodes × ~12% each)
  Each node: hexagonal clip-path, icon, name, description
  AUTH-AWARE rendering (check Zustand role):
  
  GUEST:
    - Frosted overlay: backdrop-filter blur(8px), rgba(0,0,0,0.6)
    - Lock SVG icon (var(--shadow-color))
    - "LOGIN TO ACCESS" text (JetBrains Mono, 0.8rem)
    - Clicking anywhere on locked node → openLoginModal()
  
  USER:
    - Agency App, Tasks, Party Planner nodes: UNLOCKED (green glow)
    - Purchase, Workflows, Moltbot: still locked
  
  ADMIN:
    - All 6 unlocked + 7th "ADMIN PANEL" node appears (var(--accent) glow)

App nodes data:
  { id: 'agency',    name: 'Agency Performance',  icon: '📊',
    desc: 'Staff records. Bonus payroll calculator.',
    url: 'https://agency.naskaus.com', role: 'user' }
  { id: 'tasks',     name: 'CEO/COO Tasks',        icon: '📋',
    desc: 'Executive task & schedule management.',
    url: 'https://tasks.naskaus.com', role: 'user' }
  { id: 'party',     name: 'Party Planner',         icon: '🎉',
    desc: 'Team event planning & coordination.',
    url: 'https://tasks.naskaus.com/party', role: 'user' }
  { id: 'purchase',  name: 'Purchase Manager',      icon: '🛒',
    desc: 'Procurement tracking & expense validation.',
    url: 'https://naskaus.pythonanywhere.com/login', role: 'admin' }
  { id: 'workflows', name: 'AI Workflows',           icon: '⚡',
    desc: 'n8n automation pipelines. Tailscale VPN required.',
    url: 'https://digital-shadow.tailf44989.ts.net/home/workflows', role: 'admin',
    warning: 'Internal network only — requires Tailscale VPN' }
  { id: 'moltbot',   name: 'Moltbot Agent',          icon: '🤖',
    desc: 'Personal AI. Slack · Telegram · Google. Runs 24/7.',
    url: 'http://127.0.0.1:18789/chat', role: 'admin',
    warning: 'Server local — admin terminal only' }

Scroll 95–100%:
  Matrix rain slows (uTime rate multiplied by 0.1 over 1s)
  Characters dissolve upward (y velocity reversal)
  White radial light floods from bottom center
  Particles cross-fade to gold/blue (AI Tools palette)
```

---

### SECTION 4 — AI TOOLS (Pinned, 150vh scroll)

**Particle mood:** Blue (`#0066FF`) + gold (`#FFD700`) constellation — connected graph lines  
**Background:** `#F9FAFB` (LIGHT — jarring contrast after dark Shadow section, intentional)

```
Scroll 0–20%:
  "AI TOOLS" label fades in
  Tool grid materializes (7 cards, staggered: 0.1s each)
  Cards float in: y: 60→0, opacity: 0→1, GSAP fromTo

Tool cards data:
  { name: 'Claude / Anthropic Console', maker: 'Anthropic',
    desc: 'The AI backbone of all Naskaus apps', url: 'https://platform.claude.com' }
  { name: 'Claude Code', maker: 'Anthropic',
    desc: 'Agentic AI coding in the terminal', url: 'https://claude.ai/code' }
  { name: 'Google Antigravity', maker: 'Google',
    desc: 'Next-gen development IDE', url: 'https://antigravity.google' }
  { name: 'Google AI Studio', maker: 'Google',
    desc: 'Rapid prototyping with Gemini', url: 'https://aistudio.google.com' }
  { name: 'Google Stitch', maker: 'Google',
    desc: 'AI-powered design-to-code', url: 'https://stitch.withgoogle.com' }
  { name: 'Gemini', maker: 'Google',
    desc: 'Multimodal AI assistant', url: 'https://gemini.google.com' }
  { name: 'Google Flow (Veo 3.1)', maker: 'Google Labs',
    desc: 'AI video and image generation', url: 'https://labs.google/flow' }

Card hover behavior:
  - Card lifts 8px, drop shadow deepens
  - Logo spins 360° once (CSS transform)
  - Click: opens URL in new tab
  - All AI Tools cards: guest accessible

Scroll 80–100%: AI Tools exit → transition to Finale
```

---

### SECTION 5 — THE FINALE: Atomic Orbit (Pinned, 100vh scroll)

**Mood:** Grand reveal. Cosmos of Naskaus in one image. Awe-inspiring.  
**Background:** Deep space gradient — black → dark navy → hints of deep purple. 1000+ star particles, very slow drift.

```
Sequence:
  1. All 4 main section cards (Lab, Arena, Shadow, AI Tools) animate in from their positions
  2. "NASKAUS." appears at absolute center — large, bold, glowing white — the nucleus
     Text-shadow pulsing glow animation
  3. The 4 section cards become "electron cards" orbiting the nucleus
     Each card: different radius, different speed, 3D tilt as they move (z-axis)
     Canvas 2D handles orbital math
  4. Orbital trail follows each card (semi-transparent line)
     Cards glow with section accent colors:
       Lab: amber #FF9500
       Arena: electric blue #00D4FF
       Shadow: matrix green #00FF41
       AI Tools: gold #FFD700
  5. Below atom: "Built by one. Powered by many." fades in (DM Sans, 1.2rem, muted)
  6. Call-to-action section appears:
     - Contact button (opens email link — no form in v1)
     - Section links: THE LAB · GAME ARENA · DIGITAL SHADOW · AI TOOLS
```

---

## 📺 VIDEO MODAL BEHAVIOR

```tsx
// The "never stopped" video illusion:
// 1. Video element always exists in DOM (never unmounted)
// 2. Video element positioned in modal when modal is OPEN
// 3. When modal CLOSES: video moves to an off-screen "holding div"
//    (position: fixed, left: -9999px, width: 1px, height: 1px)
//    Video does NOT pause — it keeps playing
// 4. When modal REOPENS: video moves back into modal —
//    appears to continue from where it left off
// 5. Intersection Observer on the video element:
//    if video enters viewport → ensure playing
//    if video exits viewport (somehow) → do nothing (keep playing)

// Implementation:
// - useRef to hold the <video> element
// - useRef for the "holding div" (fixed, off-screen)
// - On modal open: appendChild(videoRef.current) into modal container
// - On modal close: appendChild(videoRef.current) into holdingDivRef.current
// - NO pause/play calls except on initial user click to start

// For Phase 1: use a placeholder <video> with a color card showing app name
// Real demo videos will be added later by Nosk
```

---

## 🔐 AUTH SYSTEM

### Roles

```
GUEST  → No login needed. Sees everything public. Digital Shadow nodes show lock overlay.
USER   → Login required. Unlocks: Agency, Tasks, Party Planner nodes.
ADMIN  → Full access. All nodes unlocked. Admin panel accessible.
```

### Zustand Store

```typescript
interface AuthStore {
  user: null | { id: string; name: string; email: string; role: 'USER' | 'ADMIN' };
  loginModalOpen: boolean;
  loginRedirect: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  openLoginModal: (redirect?: string) => void;
  closeLoginModal: () => void;
}
```

### Login Modal UX

```
Position: fixed, inset-0, z-index: 9999
Background: rgba(0,0,0,0.85), backdrop-filter: blur(12px)
Panel: slides up from bottom (y: 100%→0, spring ease, 450ms)
  Width: 420px, centered
  Background: var(--surface)
  Border-top: 2px solid var(--accent)
  Border-radius: 16px 16px 0 0 (top corners only)

Content:
  "NASKAUS." in Bebas Neue, 2.5rem, white, centered
  "ACCESS REQUIRED" in JetBrains Mono, 0.7rem, var(--shadow-color), tracking: 0.3em
  Email input + Password input (dark, var(--accent) focus ring, 1px border)
  "LOGIN" button: var(--accent) bg, var(--bg) text, full width, 48px height
  Footer text: "Accounts are created by admin only." — 0.75rem, var(--muted)
  X close button: top-right corner

Error state: inputs shake (translateX keyframe: -8→8→-4→4→0px)
Success state:
  - var(--accent) particle burst from button (12 particles, Canvas)
  - Modal slides down and closes (y: 0→100%, 400ms)
  - If loginRedirect set: setTimeout 200ms → open URL in new tab
```

### Next.js API Routes (proxy to FastAPI)

```typescript
// All routes at /api/auth/* and /api/admin/*
// Cookie name: 'naskaus_token' (httpOnly, secure, sameSite: strict)
// Backend base: process.env.BACKEND_URL (= https://staff.naskaus.com)

// POST /api/auth/login  → POST {BACKEND}/auth/login
//   Body: { email, password }
//   On success: set httpOnly cookie, return { user, role }
//   On fail: return 401 { error: 'Invalid credentials' }

// GET  /api/auth/me     → GET {BACKEND}/auth/me (forwards cookie as Bearer)
//   Returns: { user, role } or 401

// POST /api/auth/logout → clears cookie, calls {BACKEND}/auth/logout

// GET  /api/admin/users      → GET  {BACKEND}/admin/users (Admin only)
// POST /api/admin/users      → POST {BACKEND}/admin/users (Admin only)
// PUT  /api/admin/users/[id] → PUT  {BACKEND}/admin/users/[id] (Admin only)
// DELETE /api/admin/users/[id] → DELETE {BACKEND}/admin/users/[id] (Admin only)
// POST /api/admin/users/[id]/reset-password (Admin only)
```

---

## 📱 MOBILE RULES (NON-NEGOTIABLE)

```css
/* globals.css — FIRST RULE, NO EXCEPTIONS */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}
```

### Breakpoints

| Name | Width | Key differences |
|---|---|---|
| xs | < 480px | 1 column, simplified animations, largest fonts |
| sm | 480–768px | 1 column, standard |
| md | 768–1024px | 2 columns, some 3D reduced |
| lg | 1024–1440px | full experience |
| xl | > 1440px | max-width container |

### Mobile Animation Budget
- Canvas particles: ×0.35 count (mobile)
- GSAP scrub: same values
- Card flips: tap-to-flip instead of hover
- Orbital cards: 2D only (no rotateX tilt)
- App balls: 90vw instead of 50vw
- Video modal: 95vw × auto height

All display text: `clamp()` — NEVER fixed px for large type  
Touch events: all hover behaviors have touchstart equivalent

---

## 🧭 NAVBAR

### Desktop
- Left: NASKAUS. logo (Bebas Neue, animated shimmer on hover)
- Center: nav links — THE LAB · GAME ARENA · DIGITAL SHADOW · AI TOOLS
- Right: User avatar / login button. If logged in: initials + dropdown (Profile, Admin Panel if admin, Logout)
- Active section: animated underline in section accent color
- Initially hidden — fades in after hero intro completes (~3.5s)
- Style: transparent, `backdrop-filter: blur(12px)`, subtle border-bottom

### Mobile
- Hamburger icon (animated morph to X on open)
- Full-screen overlay menu, large typography
- Same 4 section links + Login status at bottom

---

## 📄 SECTION PAGES (Fixed, No Scroll)

All 4 section pages share:
- `overflow: hidden`, viewport-locked
- Ambient particle canvas (reduced count, no scroll interaction)
- Back arrow (top-left) → returns to `/` landing page
- Page-specific mood (see below)

### /lab — The Lab Page
- Background: `#FFFBF0` with subtle amber particle ambient
- Layout: 2-column app card grid (desktop), 1-column (mobile)
- Each card ~420px × 320px
- Front: screenshot/logo + name + description
- Hover: Y-axis 3D flip to reveal back face
- Back: tech stack tags + full description + CTA
- Border: SVG stroke dashOffset animation on hover
- Click: opens app in new tab

### /arena — Game Arena Page
- Background: black + scanlines + neon grid floor
- Hero: The4th full-width card with embedded demo (autoplay, muted, loop)
- Stats: "Players: ∞ · Games Played: [counter] · Combos: [counter]"
- CTA: "PLAY NOW" — glitch effect on hover → the4th.naskaus.com
- Below: "Nosk Rush" + "Dragon Chaos" coming soon cards

### /shadow — Digital Shadow Page
- Background: Matrix rain live (Three.js shader)
- Layout: hexagonal grid of app tiles on dark glass panel
- Same auth-aware behavior as landing page Section 3
- GUEST: all tiles visible but locked (frosted + lock icon)
- USER: Agency/Tasks/Party unlock (green glow)
- ADMIN: all unlocked + 7th Admin Panel tile

### /ai-tools — AI Tools Page
- Background: white with animated neural network SVG
- Layout: 3-column card grid (desktop), 1-column (mobile)
- Each card: 300px square, clean white, subtle border
- Top: official tool logo (large, centered)
- Middle: tool name + maker + tagline
- Bottom: screenshot thumbnail + link
- Hover: scale 1.04, logo spins 360°, constellation particle burst

---

## 🔧 ADMIN PANEL (/admin)

Admin only. Next.js middleware redirects to login if not authenticated.

### Layout
- Sidebar (240px): "ADMIN PANEL" header in JetBrains Mono, nav: Users | System Info
- Main content area

### UserTable
- Columns: Avatar | Name | Email | Role | Created | Last Login | Status | Actions
- Actions per row: ✏️ Edit | 🔑 Reset PW | 🗑️ Delete (soft-delete: status=inactive)
- Role badge: USER (blue pill) / ADMIN (green pill)

### Create User
- Button top-right → opens UserFormModal
- Fields: Full Name, Email, Password, Role (select: User/Admin)
- Submit → POST /api/admin/users

### System Info tile
- Shows: Server, Database status, Last backup date (static text Phase 1)

---

## ⚡ PERFORMANCE & QUALITY RULES

1. **NO PLACEHOLDERS.** Every component runs. Every import resolves.  
   Exception: video files → use placeholder `<div>` colored cards in Phase 1

2. **SSR SAFETY:**
   - `'use client'` on all animation components
   - `typeof window !== 'undefined'` guards
   - `next/dynamic` with `{ ssr: false }` for Canvas components

3. **GSAP CLEANUP:**
   ```javascript
   const ctx = gsap.context(() => { ... })
   return () => ctx.revert()
   ```

4. **THREE.JS CLEANUP:**
   `geometry.dispose()` + `material.dispose()` + `renderer.dispose()`  
   Called in useEffect cleanup and on scene transitions

5. **SCROLL PERFORMANCE:**
   - All scroll handlers: `passive: true`
   - RAF-throttle cursor tracking (60fps max)
   - `will-change: transform` on animated elements ONLY
   - NO width/height in animation loops (use transform/opacity only)

6. **CANVAS PERFORMANCE:**
   - `desynchronized: true` on all Canvas 2D contexts
   - DPR scaling: `canvas.width = rect.width * window.devicePixelRatio`
   - Delta-time in all RAF loops
   - Particle count scales with viewport: `Math.floor(base * (viewport/1920))`

7. **GPU DETECTION:**
   - Try WebGL2 context on init
   - If fail → fallback mode: CSS-only animations, no Canvas, no Three.js
   - FPS monitor: if FPS < 28 for 3s → auto-downgrade to fallback

8. **FONTS:**
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
   ```
   All 4 fonts preloaded in `layout.tsx <head>`. `font-display: swap` on all `@font-face`

9. **MOBILE OVERFLOW:**
   `overflow-x: hidden` on html, body AND every section wrapper  
   Test: no horizontal scroll at any viewport width

10. **AUTH HYDRATION:**
    Next.js middleware reads cookie → pre-populates auth state  
    No flash of unauthenticated content on protected pages

---

## 📂 COMPLETE FILE STRUCTURE

```
/var/www/naskaus/                    (on Pi 5)
├── PROMPT_PRD.md                    (THIS FILE — source of truth)
├── CLAUDE.md                        (instructs Claude Code to read PROMPT_PRD.md)
├── CHECKPOINT.md                    (updated after each phase)
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.local
│
└── src/
    └── app/
        ├── layout.tsx               # Root: fonts, CursorFollower, Providers, Navbar
        ├── page.tsx                 # Landing page — scroll container
        ├── globals.css
        │
        ├── lab/page.tsx
        ├── arena/page.tsx
        ├── shadow/page.tsx
        ├── ai-tools/page.tsx
        │
        ├── admin/
        │   └── page.tsx
        │       ├── UserTable.tsx
        │       ├── UserFormModal.tsx
        │       └── SystemInfo.tsx
        │
        ├── api/
        │   └── auth/
        │       ├── login/route.ts
        │       ├── me/route.ts
        │       ├── logout/route.ts
        │       └── admin/users/[...route]/route.ts
        │
        └── (components)/
            ├── canvas/
            │   ├── ParticleRing.tsx         # Hero Canvas 2D ring (Antigravity params)
            │   ├── MatrixRain.tsx           # Three.js GLSL — Digital Shadow ONLY
            │   └── ConstellationCanvas.tsx  # AI Tools graph lines
            │
            ├── sections/
            │   ├── Section0Awakening.tsx
            │   ├── Section0_5IconWave.tsx
            │   ├── Section1Lab.tsx
            │   ├── Section2Arena.tsx
            │   ├── Section3Shadow.tsx
            │   ├── Section4AITools.tsx
            │   └── Section5Finale.tsx
            │
            ├── ui/
            │   ├── Navbar.tsx
            │   ├── SectionCard.tsx
            │   ├── AppBall.tsx
            │   ├── LoginModal.tsx
            │   ├── VideoModal.tsx
            │   ├── ScrollDots.tsx
            │   ├── CursorFollower.tsx
            │   └── TypewriterText.tsx
            │
            ├── store/
            │   └── useAuthStore.ts
            │
            ├── lib/
            │   ├── auth.ts              # Cookie helpers
            │   ├── api.ts               # Axios instance
            │   ├── gsap.ts              # Plugin registration
            │   └── mulberry32.ts        # PRNG for particle determinism
            │
            ├── hooks/
            │   ├── useTypewriter.ts
            │   ├── useScrollSection.ts
            │   └── useFpsMonitor.ts
            │
            └── data/
                ├── apps.ts              # App registry (Lab balls, Shadow nodes)
                └── aiTools.ts           # AI Tools card data
```

---

## 📋 APP REGISTRY (Source of Truth)

```typescript
// src/data/apps.ts

export const LAB_APPS = [
  {
    id: 'marifah',
    name: 'Marifah',
    desc: 'Thai Restaurant · Meyrin, Geneva · Bilingual FR/EN',
    techTags: ['React', 'Tailwind', 'Supabase'],
    color: '#4ADE80',
    url: 'https://marifah.naskaus.com',
    accessLevel: 'guest',
  },
  {
    id: 'meetbeyond',
    name: 'Meet Beyond',
    desc: 'Travel Voucher App · Thailand DMC Partners · Works Offline',
    techTags: ['PWA', 'Vanilla JS', 'Offline-first', 'QR Vouchers'],
    color: '#FF6B6B',
    url: 'https://meetbeyond.naskaus.com',
    accessLevel: 'guest',
  },
  {
    id: 'aperipommes',
    name: 'Aperi Pommes',
    desc: 'Swiss Made · 100% Fruit · Artisan Craft · Multilingual FR/DE/EN',
    techTags: ['Vue.js', 'i18n', 'Admin CMS', 'SEO'],
    color: '#8B5E3C',
    url: 'https://aperipommes.naskaus.com',
    accessLevel: 'guest',
  },
  {
    id: 'pantiesfan',
    name: 'PantiesFan',
    desc: 'Niche Auction Platform · Adults Only · Real-Time Bidding',
    techTags: ['HTML', 'CSS', 'JS', 'Custom Auction Engine'],
    color: '#DC143C',
    url: 'https://pantiesfan.com',
    accessLevel: 'guest',
    badge: '18+',
  },
];

export const SHADOW_NODES = [
  { id: 'agency',    name: 'Agency Performance',  icon: '📊',
    desc: 'Staff records. Bonus payroll calculator.',
    url: 'https://agency.naskaus.com', role: 'user' },
  { id: 'tasks',     name: 'CEO/COO Tasks',        icon: '📋',
    desc: 'Executive task & schedule management.',
    url: 'https://tasks.naskaus.com', role: 'user' },
  { id: 'party',     name: 'Party Planner',         icon: '🎉',
    desc: 'Team event planning & coordination.',
    url: 'https://tasks.naskaus.com/party', role: 'user' },
  { id: 'purchase',  name: 'Purchase Manager',      icon: '🛒',
    desc: 'Procurement tracking & expense validation.',
    url: 'https://naskaus.pythonanywhere.com/login', role: 'admin' },
  { id: 'workflows', name: 'AI Workflows',           icon: '⚡',
    desc: 'n8n automation pipelines.',
    url: 'https://digital-shadow.tailf44989.ts.net/home/workflows',
    role: 'admin', warning: 'Internal network only — requires Tailscale VPN' },
  { id: 'moltbot',   name: 'Moltbot Agent',          icon: '🤖',
    desc: 'Personal AI. Slack · Telegram · Google. Runs 24/7.',
    url: 'http://127.0.0.1:18789/chat',
    role: 'admin', warning: 'Server local — admin terminal only' },
];
```

---

## 🚀 PHASED BUILD PLAN (6 Phases — LOCKED)

### How phases work
1. Complete a phase fully
2. Run: `npm run dev` (or `npm run build && npm start` if dev has issues)
3. Write `CHECKPOINT.md` with:
   - ✅ What was built this phase
   - 🌐 Exact URLs to open in browser for testing
   - 📋 Checklist of features to verify (checkboxes)
   - ⚠️ Known limitations or assets needed from Nosk
4. Stop. Tell Nosk: "Phase X complete. Please review CHECKPOINT.md and test."

---

### PHASE 1 — FOUNDATION + HERO (Visual output: Hero section fully animated)

**Goal:** Nosk can see the NASKAUS. hero with particle ring, typewriter, and animated title on localhost:3000

**Deliverables:**
- Next.js 14 project scaffold: TypeScript strict, Tailwind, GSAP, Three.js, Zustand
- `globals.css`: design tokens, overflow rules, font-face declarations
- `layout.tsx`: 4 Google Fonts preloaded, CursorFollower, Providers
- `mulberry32.ts` PRNG utility
- `ParticleRing.tsx`: Full Canvas 2D Antigravity ring system (exact params from spec above)
- `CursorFollower.tsx`: 28px ring + 6px dot, accent color, lag lerp
- `Section0Awakening.tsx`: Full animation sequence (pixel → letters → typewriter)
- `useTypewriter.ts` hook with realistic delays and typo simulation
- `Navbar.tsx`: hidden initially, fades in at 3.5s, desktop + mobile hamburger
- `ScrollDots.tsx`: right edge indicator (not yet wired to sections, just visible)
- `.env.local` template with `BACKEND_URL` placeholder
- `CLAUDE.md` written to project root

**Test URLs:**
- `http://localhost:3000` — Full hero animation auto-plays
- `http://localhost:3000` — Particle ring visible, cursor repulsion works
- `http://localhost:3000` — Typewriter types all 10 lines with realistic delays

---

### PHASE 2 — SCROLL ENGINE + LAB + ICON WAVE (Visual output: scrolling works, Lab section live)

**Goal:** Nosk can scroll from Hero through Icon Wave into The Lab and see all 4 app balls

**Deliverables:**
- GSAP ScrollTrigger infrastructure: pin-based sections, scrub: 1.2
- `gsap.ts` lib: plugin registration (ScrollTrigger, SplitText, TextPlugin)
- `useScrollSection.ts` hook: tracks active section, broadcasts to ScrollDots
- `Section0_5IconWave.tsx`: marquee strip, 60vh, CSS-only animation
- `Section1Lab.tsx`: SectionCard + 4 AppBall components, full scroll sequence
- `SectionCard.tsx`: frosted glass, SVG stroke animation, elastic scale-in
- `AppBall.tsx`: burst animation, showcase panel, screenshot placeholder (colored divs for now), tech tags
- `data/apps.ts`: LAB_APPS registry
- Particle color lerp: white/green → amber as user enters Lab
- ScrollDots wired to active section

**Test URLs:**
- `http://localhost:3000` → scroll down → Icon Wave marquee scrolls smoothly
- `http://localhost:3000` → scroll to Lab → SectionCard appears with elastic animation
- `http://localhost:3000` → scroll through Lab → all 4 app balls burst and reveal

---

### PHASE 3 — ARENA + SHADOW + AUTH (Visual output: all dark sections + login works)

**Goal:** Nosk can scroll through Arena and Digital Shadow, and login modal works against the real backend

**Deliverables:**
- `Section2Arena.tsx`: Arena card bounce-in, The4th ball showcase, coming soon cards, glitch CTA
- `Section3Shadow.tsx`: MatrixRain Three.js shader, card decloaks, 6 hex nodes, auth-aware
- `MatrixRain.tsx`: Three.js GLSL shader (column-based character rain, green)
- `useAuthStore.ts` Zustand store: full interface, fetchMe on mount
- `LoginModal.tsx`: full UX (slide up, particle burst on success, shake on error)
- All Next.js API proxy routes: `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`
- Next.js middleware: cookie check → pre-populate auth state
- Auth-aware node rendering in Section3 (GUEST/USER/ADMIN states)
- Particle lerp: amber → electric blue (Arena) → matrix green (Shadow)

**Test URLs:**
- `http://localhost:3000` → scroll to Arena → card drops with bounce
- `http://localhost:3000` → scroll to Shadow → Matrix rain active
- `http://localhost:3000` → click locked node → Login Modal opens
- `http://localhost:3000` → login with real credentials → nodes unlock appropriately

---

### PHASE 4 — AI TOOLS + FINALE + SECTION PAGES (Visual output: full landing page + 4 section pages)

**Goal:** Complete landing page experience end-to-end, all 4 section pages navigable

**Deliverables:**
- `Section4AITools.tsx`: 7 tool cards, constellation particles, light background
- `Section5Finale.tsx`: orbital atom animation, 4 electron cards, closing copy + CTAs
- `ConstellationCanvas.tsx`: Canvas 2D connected graph particle system
- `/lab` page: full card grid with 3D flip, SVG stroke hover, amber particles
- `/arena` page: The4th hero card + coming soon + video placeholder
- `/shadow` page: Matrix rain live, hex tile grid, auth-aware (same logic as landing)
- `/ai-tools` page: 3-column tool grid, neural network SVG background
- `VideoModal.tsx`: full "never stopped" behavior (DOM move pattern)
- Particle lerp: gold+blue for AI Tools, space starfield for Finale

**Test URLs:**
- `http://localhost:3000` → full scroll from Hero to Finale works
- `http://localhost:3000/lab` → app cards flip on hover
- `http://localhost:3000/arena` → The4th hero card visible
- `http://localhost:3000/shadow` → Matrix rain live
- `http://localhost:3000/ai-tools` → tool grid loads

---

### PHASE 5 — ADMIN PANEL + POLISH (Visual output: admin CRUD works, animations refined)

**Goal:** Admin panel functional, all visual polish complete, no rough edges

**Deliverables:**
- `/admin` page: full UserTable with Avatar/Name/Email/Role/Actions columns
- `UserFormModal.tsx`: Create + Edit user forms
- `SystemInfo.tsx`: static server/DB status tile (Phase 1 content)
- All admin API proxy routes: GET/POST/PUT/DELETE/reset-password
- Next.js middleware: admin role gate on `/admin` route
- Polish pass:
  - All GSAP transitions reviewed for smoothness
  - Mobile: all breakpoints tested, overflow rules verified
  - Cursor follower refined (hover states on interactive elements)
  - Section accent underline in Navbar wired to scroll position
  - `useFpsMonitor.ts`: FPS < 28 → fallback mode (CSS-only particles)
  - GPU detection: WebGL2 check on init
  - `prefers-reduced-motion`: all animations disabled, clean static layout

**Test URLs:**
- `http://localhost:3000/admin` → redirect to login if not admin
- `http://localhost:3000/admin` (logged in as admin) → user table loads
- `http://localhost:3000/admin` → create/edit/delete user works

---

### PHASE 6 — PRODUCTION DEPLOYMENT (Output: live at naskaus.com)

**Goal:** Site live on Raspberry Pi 5 via Cloudflare, PM2, all env vars set

**Deliverables:**
- `.env.local` production values: `BACKEND_URL=https://staff.naskaus.com`
- `npm run build` passes with zero errors
- `next.config.js` production settings (image domains, headers, etc.)
- PM2 setup: `pm2 start npm --name "naskaus" -- start` + `pm2 save`
- Cloudflare tunnel entry added: `hostname: naskaus.com → service: http://localhost:3000`
- `CLAUDE.md` final version written to `/var/www/naskaus/`
- Mobile final test on real device (Pi serving to phone on local network)
- SEO: `layout.tsx` meta tags, Open Graph, description, robots
- Backup script updated to include `/var/www/naskaus/` build

**Deployment commands:**
```bash
cd /var/www/naskaus
npm install
npm run build
pm2 start npm --name "naskaus" -- start
pm2 save

# Add to ~/.cloudflared/config.yml:
# - hostname: naskaus.com
#   service: http://localhost:3000
# (add BEFORE the catch-all rule)
```

**Test URLs:**
- `https://naskaus.com` → full site live
- `https://naskaus.com` → HTTPS/SSL confirmed
- `https://naskaus.com` → login works against staff.naskaus.com backend

---

## 🔧 CLAUDE.MD CONTENT (Write this to CLAUDE.md at Phase 1 start)

```markdown
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

## Project location: /var/www/naskaus/
## Local URL: http://localhost:3000
## Production: https://naskaus.com (via Cloudflare tunnel)
```

---

## ✅ DEFINITION OF DONE (Final acceptance criteria)

Before calling the project complete, ALL of these must pass:

- [ ] Full scroll from Hero to Finale with no jank on desktop
- [ ] Full scroll on mobile (iPhone or mid-tier Android) — no horizontal scroll, no overflow
- [ ] Particle ring visible on hero with cursor repulsion
- [ ] Typewriter types all 10 lines with realistic delays
- [ ] All 4 Lab app balls burst and reveal on scroll
- [ ] Arena card drops with bounce, The4th showcase visible
- [ ] Matrix rain renders in Digital Shadow section
- [ ] Login modal opens on clicking locked node
- [ ] Login works with real credentials from staff.naskaus.com
- [ ] Nodes unlock correctly based on role (GUEST/USER/ADMIN)
- [ ] All 4 section pages load and are navigable
- [ ] Admin panel: create/edit/delete user all work
- [ ] FPS monitor auto-degrades on low-power devices
- [ ] `prefers-reduced-motion` disables all animations cleanly
- [ ] Site live at https://naskaus.com via Cloudflare tunnel
- [ ] HTTPS confirmed, no mixed content warnings
- [ ] No console errors in production build

---

*NASKAUS.COM — PROMPT_PRD.md v3.0 — February 2026*  
*"Built by one. Powered by many."*