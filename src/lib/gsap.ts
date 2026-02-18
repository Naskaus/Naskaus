/**
 * GSAP Plugin Registration
 * Import this file to register all GSAP plugins
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

// Easing presets for consistent animations
export const EASINGS = {
  elastic: 'elastic.out(1, 0.5)',
  bounce: 'bounce.out',
  smooth: 'power2.out',
  smoothIn: 'power2.in',
  smoothInOut: 'power2.inOut',
  spring: 'back.out(1.7)',
  expo: 'expo.out',
} as const;

// Animation duration presets
export const DURATIONS = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  verySlow: 1.2,
} as const;

// ScrollTrigger defaults for pinned sections
export const SCROLL_DEFAULTS = {
  scrub: 1.2,
  pin: true,
  anticipatePin: 1,
} as const;
