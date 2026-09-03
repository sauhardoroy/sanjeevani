import React from 'react';

/**
 * Project Sanjeevani — Apple Button Hierarchy (Strictly 3 weights)
 * All buttons enforce min 48px touch height and 14px concentric radius.
 */

export function PrimaryButton({ children, onClick, disabled = false, className = '', fullWidth = false, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        min-h-[48px] px-6 py-3
        rounded-[14px]
        bg-[#007AFF] hover:bg-[#0066D6] active:bg-[#0055B8] active:scale-[0.98]
        text-white font-semibold text-[17px]
        shadow-sm transition-all duration-150
        disabled:opacity-40 disabled:pointer-events-none
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, disabled = false, className = '', fullWidth = false, type = 'button', variant = 'default' }) {
  const variantStyles = variant === 'whatsapp' 
    ? 'border-[#25D366] text-[#128C7E] hover:bg-[#F0FDF4] active:bg-[#DCFCE7]'
    : variant === 'amber'
    ? 'border-[#FF9F0A] text-[#B45309] hover:bg-[#FFFBEB] active:bg-[#FEF3C7]'
    : 'border-[#007AFF] text-[#007AFF] hover:bg-[#F0F7FF] active:bg-[#E0F0FF]';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        min-h-[48px] px-5 py-3
        rounded-[14px]
        border-[1.5px] bg-white
        font-semibold text-[16px]
        active:scale-[0.98] transition-all duration-150
        disabled:opacity-40 disabled:pointer-events-none
        ${variantStyles}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function TextButton({ children, onClick, disabled = false, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-1.5
        min-h-[48px] px-3 py-2
        text-[#007AFF] hover:text-[#0055B8] active:opacity-60
        font-medium text-[16px]
        transition-opacity duration-150
        disabled:opacity-40 disabled:pointer-events-none
        ${className}
      `}
    >
      {children}
    </button>
  );
}
