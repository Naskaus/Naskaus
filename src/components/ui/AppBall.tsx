'use client';

import { forwardRef } from 'react';
import type { LabApp } from '@/data/apps';

interface AppBallProps {
  app: LabApp;
  isExpanded?: boolean;
  className?: string;
  onVisit?: () => void;
}

const AppBall = forwardRef<HTMLDivElement, AppBallProps>(
  ({ app, isExpanded = false, className = '', onVisit }, ref) => {
    const handleVisit = () => {
      window.open(app.url, '_blank', 'noopener,noreferrer');
      onVisit?.();
    };

    return (
      <div
        ref={ref}
        className={`relative transition-all duration-500 ${className}`}
        style={{
          width: isExpanded ? 'min(50vw, 600px)' : '200px',
          height: isExpanded ? 'auto' : '200px',
        }}
      >
        {/* Ball / Collapsed state */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 ${
            isExpanded ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
          }`}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${app.color}dd, ${app.color}88)`,
            boxShadow: `0 0 60px ${app.color}40, inset 0 0 30px rgba(255,255,255,0.1)`,
          }}
        >
          {/* App name on ball */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-xl text-white text-center px-4 drop-shadow-lg">
              {app.name}
            </span>
          </div>

          {/* Badge if exists */}
          {app.badge && (
            <div
              className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold"
              style={{
                background: app.color,
                color: 'white',
              }}
            >
              {app.badge}
            </div>
          )}
        </div>

        {/* Expanded showcase panel */}
        <div
          className={`transition-all duration-500 ${
            isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(12px)',
              border: `2px solid ${app.color}40`,
            }}
          >
            {/* Header with color accent */}
            <div
              className="h-2"
              style={{ background: app.color }}
            />

            <div className="p-6 md:p-8">
              {/* App name and badge */}
              <div className="flex items-center gap-3 mb-4">
                <h4
                  className="font-heading text-3xl md:text-4xl"
                  style={{ color: app.color }}
                >
                  {app.name}
                </h4>
                {app.badge && (
                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      background: `${app.color}30`,
                      color: app.color,
                      border: `1px solid ${app.color}`,
                    }}
                  >
                    {app.badge}
                  </span>
                )}
              </div>

              {/* Screenshot placeholder */}
              <div
                className="w-full h-48 md:h-64 rounded-lg mb-6 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${app.color}20, ${app.color}05)`,
                  border: `1px solid ${app.color}30`,
                }}
              >
                <span className="text-6xl opacity-50">
                  {app.id === 'marifah' && '🍜'}
                  {app.id === 'meetbeyond' && '✈️'}
                  {app.id === 'aperipommes' && '🍎'}
                  {app.id === 'pantiesfan' && '🔒'}
                </span>
              </div>

              {/* Description */}
              <p className="text-text-secondary text-lg mb-6">
                {app.desc}
              </p>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {app.techTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm font-mono"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'var(--text-secondary)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={handleVisit}
                className="group flex items-center gap-2 px-6 py-3 rounded-lg font-body font-semibold transition-all duration-300 interactive"
                style={{
                  background: app.color,
                  color: '#000',
                }}
              >
                VISIT APP
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Radial pulse effect when expanding */}
        {isExpanded && (
          <div
            className="absolute inset-0 rounded-full animate-ping pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${app.color}40, transparent 70%)`,
              animationDuration: '1s',
              animationIterationCount: '1',
            }}
          />
        )}
      </div>
    );
  }
);

AppBall.displayName = 'AppBall';

export default AppBall;
