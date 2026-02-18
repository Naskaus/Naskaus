'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TypewriterOptions {
  minDelay?: number;
  maxDelay?: number;
  typoChance?: number;
  pauseOnPunctuation?: boolean;
  punctuationPause?: number;
}

interface TypewriterState {
  displayText: string;
  isTyping: boolean;
  isComplete: boolean;
  currentLineIndex: number;
}

const DEFAULT_OPTIONS: TypewriterOptions = {
  minDelay: 40,
  maxDelay: 120,
  typoChance: 0.03, // 3% chance of typo
  pauseOnPunctuation: true,
  punctuationPause: 400,
};

// Common typos - maps correct char to possible typo
const TYPO_MAP: Record<string, string[]> = {
  a: ['s', 'q'],
  b: ['v', 'n'],
  c: ['x', 'v'],
  d: ['s', 'f'],
  e: ['w', 'r'],
  f: ['d', 'g'],
  g: ['f', 'h'],
  h: ['g', 'j'],
  i: ['u', 'o'],
  j: ['h', 'k'],
  k: ['j', 'l'],
  l: ['k', ';'],
  m: ['n', ','],
  n: ['b', 'm'],
  o: ['i', 'p'],
  p: ['o', '['],
  q: ['w', 'a'],
  r: ['e', 't'],
  s: ['a', 'd'],
  t: ['r', 'y'],
  u: ['y', 'i'],
  v: ['c', 'b'],
  w: ['q', 'e'],
  x: ['z', 'c'],
  y: ['t', 'u'],
  z: ['x', 'a'],
};

export function useTypewriter(
  lines: string[],
  options: TypewriterOptions = {}
): TypewriterState & { restart: () => void } {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<TypewriterState>({
    displayText: '',
    isTyping: false,
    isComplete: false,
    currentLineIndex: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const getRandomDelay = useCallback(() => {
    return Math.floor(Math.random() * (opts.maxDelay! - opts.minDelay!) + opts.minDelay!);
  }, [opts.minDelay, opts.maxDelay]);

  const getTypo = useCallback((char: string): string | null => {
    const lowerChar = char.toLowerCase();
    if (TYPO_MAP[lowerChar] && Math.random() < opts.typoChance!) {
      const typos = TYPO_MAP[lowerChar];
      return char === lowerChar
        ? typos[Math.floor(Math.random() * typos.length)]
        : typos[Math.floor(Math.random() * typos.length)].toUpperCase();
    }
    return null;
  }, [opts.typoChance]);

  const typeText = useCallback(async () => {
    if (isTypingRef.current) return;
    isTypingRef.current = true;

    setState((prev) => ({ ...prev, isTyping: true }));

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const linePrefix = lineIndex > 0 ? '\n' : '';

      setState((prev) => ({
        ...prev,
        currentLineIndex: lineIndex,
      }));

      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        if (!isTypingRef.current) return;

        const char = line[charIndex];
        const typo = getTypo(char);

        // Type the character (or typo)
        const charToType = typo || char;

        await new Promise<void>((resolve) => {
          timeoutRef.current = setTimeout(() => {
            setState((prev) => ({
              ...prev,
              displayText:
                prev.displayText +
                (charIndex === 0 && lineIndex > 0 ? linePrefix : '') +
                charToType,
            }));
            resolve();
          }, getRandomDelay());
        });

        // If we made a typo, backspace and correct it
        if (typo) {
          await new Promise<void>((resolve) => {
            timeoutRef.current = setTimeout(() => {
              setState((prev) => ({
                ...prev,
                displayText: prev.displayText.slice(0, -1),
              }));
              resolve();
            }, 150);
          });

          await new Promise<void>((resolve) => {
            timeoutRef.current = setTimeout(() => {
              setState((prev) => ({
                ...prev,
                displayText: prev.displayText + char,
              }));
              resolve();
            }, 100);
          });
        }

        // Pause on punctuation
        if (opts.pauseOnPunctuation && ['.', ',', '!', '?', '...'].includes(char)) {
          await new Promise<void>((resolve) => {
            timeoutRef.current = setTimeout(resolve, opts.punctuationPause);
          });
        }
      }

      // Pause between lines
      if (lineIndex < lines.length - 1) {
        await new Promise<void>((resolve) => {
          timeoutRef.current = setTimeout(resolve, 800);
        });
      }
    }

    setState((prev) => ({
      ...prev,
      isTyping: false,
      isComplete: true,
    }));
    isTypingRef.current = false;
  }, [lines, getRandomDelay, getTypo, opts.pauseOnPunctuation, opts.punctuationPause]);

  const restart = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    isTypingRef.current = false;
    setState({
      displayText: '',
      isTyping: false,
      isComplete: false,
      currentLineIndex: 0,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      isTypingRef.current = false;
    };
  }, []);

  return { ...state, restart, typeText } as TypewriterState & { restart: () => void; typeText: () => void };
}

// Simpler hook that auto-starts
export function useAutoTypewriter(
  lines: string[],
  startDelay: number = 0,
  options: TypewriterOptions = {}
): TypewriterState {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<TypewriterState>({
    displayText: '',
    isTyping: false,
    isComplete: false,
    currentLineIndex: 0,
  });

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const startTimeout = setTimeout(() => {
      let currentText = '';
      let lineIndex = 0;
      let charIndex = 0;
      let isBackspacing = false;
      let typoChar: string | null = null;

      setState((prev) => ({ ...prev, isTyping: true }));

      const getRandomDelay = () =>
        Math.floor(Math.random() * (opts.maxDelay! - opts.minDelay!) + opts.minDelay!);

      const type = () => {
        if (lineIndex >= lines.length) {
          setState((prev) => ({ ...prev, isTyping: false, isComplete: true }));
          return;
        }

        const line = lines[lineIndex];

        if (isBackspacing) {
          // Remove the typo
          currentText = currentText.slice(0, -1);
          setState((prev) => ({ ...prev, displayText: currentText }));
          isBackspacing = false;

          // Type the correct character
          setTimeout(() => {
            currentText += line[charIndex];
            charIndex++;
            setState((prev) => ({ ...prev, displayText: currentText }));
            setTimeout(type, getRandomDelay());
          }, 100);
          return;
        }

        if (charIndex >= line.length) {
          // Move to next line
          lineIndex++;
          charIndex = 0;
          setState((prev) => ({ ...prev, currentLineIndex: lineIndex }));

          if (lineIndex < lines.length) {
            currentText += '\n';
            setTimeout(type, 800);
          } else {
            setState((prev) => ({ ...prev, isTyping: false, isComplete: true }));
          }
          return;
        }

        const char = line[charIndex];

        // Check for typo
        const lowerChar = char.toLowerCase();
        if (
          TYPO_MAP[lowerChar] &&
          Math.random() < opts.typoChance! &&
          charIndex > 0 // Don't typo first char
        ) {
          const typos = TYPO_MAP[lowerChar];
          typoChar =
            char === lowerChar
              ? typos[Math.floor(Math.random() * typos.length)]
              : typos[Math.floor(Math.random() * typos.length)].toUpperCase();

          currentText += typoChar;
          setState((prev) => ({ ...prev, displayText: currentText }));
          isBackspacing = true;
          setTimeout(type, 150);
          return;
        }

        currentText += char;
        charIndex++;
        setState((prev) => ({ ...prev, displayText: currentText }));

        // Extra pause on punctuation
        const delay =
          opts.pauseOnPunctuation && ['.', '!', '?'].includes(char)
            ? opts.punctuationPause!
            : char === ','
            ? 200
            : getRandomDelay();

        setTimeout(type, delay);
      };

      type();
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, [lines, startDelay, opts]);

  return state;
}
