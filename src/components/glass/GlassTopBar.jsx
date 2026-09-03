import React from 'react';
import { ChevronLeft } from 'lucide-react';

/**
 * GlassTopBar — Functional Layer (Glassmorphism)
 * Sticky header with frosted blur, large title, greeting, and optional back navigation.
 */
export function GlassTopBar({ 
  title, 
  subtitle, 
  onBack, 
  rightAction 
}) {
  return (
    <header className="
      sticky top-0 z-30
      glass-surface
      border-b border-[#E5E5EA]/60
      px-5 pt-3 pb-3.5
      transition-all duration-200
    ">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="
                w-10 h-10 -ml-2 flex items-center justify-center
                rounded-[10px] text-[#007AFF] active:bg-[#007AFF]/10
                transition-colors
              "
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
          )}

          <div className="flex flex-col min-w-0">
            <h1 className="text-[26px] font-bold text-[#1C1C1E] tracking-tight leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[14px] font-medium text-[#6E6E73] truncate leading-none mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {rightAction && (
          <div className="shrink-0 flex items-center">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
}
