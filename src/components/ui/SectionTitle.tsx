'use client';

import { forwardRef } from 'react';

type ColorScheme = 'amber' | 'blue-violet' | 'green' | 'blue-gold' | 'white';

interface SectionTitleProps {
  text: string;
  colorScheme: ColorScheme;
  className?: string;
  style?: React.CSSProperties;
}

const COLOR_CLASS_MAP: Record<ColorScheme, string> = {
  'amber': 'title-amber',
  'blue-violet': 'title-chromatic',
  'green': 'title-terminal',
  'blue-gold': 'title-blue-gold',
  'white': '',
};

const SectionTitle = forwardRef<HTMLHeadingElement, SectionTitleProps>(
  ({ text, colorScheme, className = '', style }, ref) => {
    const colorClass = COLOR_CLASS_MAP[colorScheme];

    return (
      <h2
        ref={ref}
        className={`section-title-cinematic ${colorClass} ${className}`}
        data-text={text}
        style={style}
      >
        {text}
      </h2>
    );
  }
);

SectionTitle.displayName = 'SectionTitle';
export default SectionTitle;
