import React from 'react';
import { Minus, Plus } from 'lucide-react';

/**
 * StepperInput — Apple-style numeric control with 48px touch targets
 * Avoids on-screen keyboard friction for a non-power user like Dad.
 */
export function StepperInput({ 
  label, 
  value = 0, 
  onChange, 
  min = 0, 
  max = 999, 
  step = 1,
  unit = '',
  helper = ''
}) {
  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(Math.round((value - step) * 10) / 10);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      onChange(Math.round((value + step) * 10) / 10);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <span className="text-[15px] font-semibold text-[#1C1C1E]">
          {label}
        </span>
      )}
      
      <div className="flex items-center justify-between bg-white border border-[#E5E5EA] rounded-[14px] p-1.5 shadow-sm">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label={`Decrease ${label || 'value'}`}
          className="
            w-12 h-12 flex items-center justify-center
            rounded-[10px] bg-[#F2F2F7] active:bg-[#E5E5EA]
            text-[#1C1C1E] disabled:text-[#AEAEB2] disabled:opacity-40
            transition-colors duration-150
          "
        >
          <Minus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="flex flex-col items-center justify-center px-4">
          <span className="text-[20px] font-bold text-[#1C1C1E] tabular-nums tracking-tight">
            {value} {unit && <span className="text-[14px] font-normal text-[#6E6E73]">{unit}</span>}
          </span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={`Increase ${label || 'value'}`}
          className="
            w-12 h-12 flex items-center justify-center
            rounded-[10px] bg-[#F2F2F7] active:bg-[#E5E5EA]
            text-[#1C1C1E] disabled:text-[#AEAEB2] disabled:opacity-40
            transition-colors duration-150
          "
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {helper && (
        <span className="text-[13px] text-[#6E6E73] px-1">
          {helper}
        </span>
      )}
    </div>
  );
}
