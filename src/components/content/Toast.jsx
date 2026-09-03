import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

/**
 * Toast — Floating confirmation pill for one-tap feedback
 */
export function Toast({ message, type = 'success', duration = 3000, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#34C759] shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-[#FF9F0A] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#007AFF] shrink-0" />
  };

  return (
    <div className="fixed top-20 inset-x-4 z-50 flex justify-center pointer-events-none animate-slide-up">
      <div className="
        pointer-events-auto
        flex items-center gap-2.5
        px-5 py-3.5
        bg-[#1C1C1E]/95 text-white
        backdrop-blur-md
        rounded-[18px]
        shadow-2xl border border-white/10
        max-w-md w-full
      ">
        {icons[type] || icons.success}
        <span className="text-[15px] font-medium leading-snug">
          {message}
        </span>
      </div>
    </div>
  );
}
