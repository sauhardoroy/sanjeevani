import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * GlassSheet — Functional Layer (Glass Bottom Sheet Modal)
 * Slides up from bottom with 28px concentric top corners and scrim overlay.
 */
export function GlassSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Scrim Overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 scrim-backdrop animate-fade-in transition-opacity"
        aria-hidden="true"
      />

      {/* Glass Modal Sheet Container */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal Sheet'}
        className="
          relative z-10 w-full max-w-lg mx-auto
          glass-surface rounded-t-[28px]
          border-t border-x border-white/70
          shadow-apple-sheet
          max-h-[92vh] flex flex-col
          animate-slide-up
        "
      >
        {/* iOS Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="w-10 h-1.5 rounded-full bg-[#8E8E93]/40" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-2 flex items-center justify-between border-b border-[#E5E5EA]/40">
          <h2 className="text-[20px] font-bold text-[#1C1C1E] tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sheet"
            className="
              w-10 h-10 -mr-2 flex items-center justify-center
              rounded-full bg-[#E5E5EA]/60 active:bg-[#D1D1D6]
              text-[#8E8E93] hover:text-[#1C1C1E]
              transition-colors
            "
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Content (Flat forms inside) */}
        <div className="p-5 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
