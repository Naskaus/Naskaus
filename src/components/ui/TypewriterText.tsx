'use client';

import { useEffect, useState } from 'react';

// Common typos - maps correct char to possible typo
const TYPO_MAP: Record<string, string[]> = {
  a: ['s', 'q'], b: ['v', 'n'], c: ['x', 'v'], d: ['s', 'f'],
  e: ['w', 'r'], f: ['d', 'g'], g: ['f', 'h'], h: ['g', 'j'],
  i: ['u', 'o'], j: ['h', 'k'], k: ['j', 'l'], l: ['k', ';'],
  m: ['n', ','], n: ['b', 'm'], o: ['i', 'p'], p: ['o', '['],
  q: ['w', 'a'], r: ['e', 't'], s: ['a', 'd'], t: ['r', 'y'],
  u: ['y', 'i'], v: ['c', 'b'], w: ['q', 'e'], x: ['z', 'c'],
  y: ['t', 'u'], z: ['x', 'a'],
};

interface TypewriterTextProps {
  lines: string[];
  minCharDelay?: number;
  maxCharDelay?: number;
  typoChance?: number;
  linePause?: number;
  onComplete?: () => void;
  className?: string;
}

export default function TypewriterText({
  lines,
  minCharDelay = 40,
  maxCharDelay = 120,
  typoChance = 0.03,
  linePause = 800,
  onComplete,
  className = '',
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    let currentText = '';
    let lineIndex = 0;
    let charIndex = 0;

    const getRandomDelay = () =>
      Math.floor(Math.random() * (maxCharDelay - minCharDelay) + minCharDelay);

    const typeNextChar = () => {
      if (isCancelled) return;

      // Check if we're done with all lines
      if (lineIndex >= lines.length) {
        setIsComplete(true);
        setShowCursor(false);
        onComplete?.();
        return;
      }

      const line = lines[lineIndex];

      // Check if we're done with current line
      if (charIndex >= line.length) {
        lineIndex++;
        charIndex = 0;

        if (lineIndex < lines.length) {
          currentText += '\n';
          setDisplayText(currentText);
          setTimeout(typeNextChar, linePause);
        } else {
          setIsComplete(true);
          setShowCursor(false);
          onComplete?.();
        }
        return;
      }

      const char = line[charIndex];
      const lowerChar = char.toLowerCase();

      // Check for typo (3% chance, not on first char)
      if (TYPO_MAP[lowerChar] && Math.random() < typoChance && charIndex > 0) {
        const typos = TYPO_MAP[lowerChar];
        const typoChar = char === lowerChar
          ? typos[Math.floor(Math.random() * typos.length)]
          : typos[Math.floor(Math.random() * typos.length)].toUpperCase();

        // Type typo
        currentText += typoChar;
        setDisplayText(currentText);

        // Backspace after short delay
        setTimeout(() => {
          if (isCancelled) return;
          currentText = currentText.slice(0, -1);
          setDisplayText(currentText);

          // Type correct char
          setTimeout(() => {
            if (isCancelled) return;
            currentText += char;
            charIndex++;
            setDisplayText(currentText);
            setTimeout(typeNextChar, getRandomDelay());
          }, 80);
        }, 120);
        return;
      }

      // Type normal character
      currentText += char;
      charIndex++;
      setDisplayText(currentText);

      // Determine delay (scaled 1.4x faster)
      let delay = getRandomDelay();
      if (['.', '!', '?'].includes(char)) {
        delay = 280;
      } else if (char === ',') {
        delay = 140;
      } else if (char === ' ') {
        delay = Math.floor(delay * 0.5);
      }

      setTimeout(typeNextChar, delay);
    };

    // Start typing immediately
    typeNextChar();

    return () => {
      isCancelled = true;
    };
  }, [lines, minCharDelay, maxCharDelay, typoChance, linePause, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <span
          className="inline-block w-[3px] h-[1.1em] ml-1 align-middle"
          style={{
            backgroundColor: 'var(--accent)',
            animation: 'blink 0.8s step-end infinite'
          }}
        />
      )}
    </span>
  );
}
