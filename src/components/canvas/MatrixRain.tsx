'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MatrixRainProps {
  speedMultiplier?: number;
}

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uSpeed;

  // Pseudo-random hash
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Character-like pattern
  float charPattern(vec2 uv, float seed) {
    vec2 grid = floor(uv * 5.0);
    float h = hash(grid + seed);
    return step(0.5, h);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;

    // Column parameters
    float columns = floor(uResolution.x / 14.0);
    float col = floor(uv.x * columns);
    float colFrac = fract(uv.x * columns);

    // Row parameters
    float rows = floor(uResolution.y / 20.0);
    float row = floor(uv.y * rows);
    float rowFrac = fract(uv.y * rows);

    // Per-column randomness
    float colSeed = hash(vec2(col, 0.0));
    float speed = (0.5 + colSeed * 1.5) * uSpeed;
    float offset = colSeed * 100.0;

    // Scrolling position
    float scrollPos = uTime * speed + offset;
    float currentRow = row + floor(scrollPos);

    // Character hash for this cell
    float charSeed = hash(vec2(col, currentRow));

    // Character change interval (flickering)
    float flickerRate = 2.0 + colSeed * 4.0;
    float flickerPhase = floor(uTime * flickerRate + charSeed * 10.0);
    float finalCharSeed = hash(vec2(charSeed, flickerPhase));

    // Character shape (simplified block pattern)
    float charVisible = charPattern(vec2(colFrac, rowFrac), finalCharSeed);

    // Padding - don't draw at column edges
    float padX = step(0.1, colFrac) * step(colFrac, 0.9);
    float padY = step(0.1, rowFrac) * step(rowFrac, 0.85);
    charVisible *= padX * padY;

    // Drop trail: brightness falls off behind the head
    float trailLength = 15.0 + colSeed * 20.0;
    float headPos = fract(scrollPos / rows) * rows;
    float dist = mod(row - headPos, rows);

    // Brightness: head is brightest, fades down the trail
    float brightness = 0.0;
    if (dist < 1.5) {
      // Head of the drop - bright white-green
      brightness = 1.0;
    } else if (dist < trailLength) {
      // Trail
      brightness = 1.0 - (dist - 1.5) / (trailLength - 1.5);
      brightness = brightness * brightness; // Quadratic falloff
    }

    // Random visibility per drop
    float dropActive = step(0.3, hash(vec2(col, floor(scrollPos * 0.1))));
    brightness *= dropActive;

    // Apply character visibility
    float finalAlpha = charVisible * brightness;

    // Color: bright green, with the head being whiter
    vec3 green = vec3(0.0, 1.0, 0.255); // #00FF41
    vec3 white = vec3(0.7, 1.0, 0.85);
    vec3 color = mix(green, white, smoothstep(0.7, 1.0, brightness));

    // Dim the overall effect slightly
    finalAlpha *= 0.7;

    // Vignette: fade edges
    float vignette = 1.0 - length((uv - 0.5) * 1.4);
    vignette = clamp(vignette, 0.0, 1.0);
    finalAlpha *= vignette;

    gl_FragColor = vec4(color * finalAlpha, finalAlpha);
  }
`;

export default function MatrixRain({ speedMultiplier = 1.0 }: MatrixRainProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const speedRef = useRef(speedMultiplier);

  // Keep speed ref in sync
  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    // Uniforms
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uSpeed: { value: speedMultiplier },
    };

    // Full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Resize handler
    const handleResize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      const dpr = Math.min(window.devicePixelRatio, 2);
      renderer.setSize(w, h);
      renderer.setPixelRatio(dpr);
      uniforms.uResolution.value.set(w * dpr, h * dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation loop
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uSpeed.value = speedRef.current;
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
