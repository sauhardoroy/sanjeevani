import React from 'react';
import { Plus } from 'lucide-react';

/**
 * GlassFAB — Functional Layer (Floating Action Button)
 * Positioned on Home screen only, bottom-right, thumb-reachable.
 */
export function GlassFAB({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add a new medicine"
      className="
        fixed bottom-22 right-5 z-40
        w-14 h-14 rounded-full
        bg-[#007AFF] hover:bg-[#0066D6] active:scale-95
        text-white shadow-apple-fab
        flex items-center justify-center
        transition-all duration-200
        border border-white/20
      "
    >
      <Plus className="w-7 h-7 stroke-[2.5]" />
    </button>
  );
}
