import React from 'react';

/**
 * ChipSelect — Apple-style single and multi-select pill controls
 * Used for dosage schedule (Morning/Night) and strip packaging size (10/14/15).
 */
export function ChipSelect({ 
  label, 
  options = [], 
  value, 
  onChange, 
  isMulti = false,
  helper = '' 
}) {
  const isSelected = (optVal) => {
    if (isMulti) {
      return Array.isArray(value) && value.includes(optVal);
    }
    return value === optVal;
  };

  const handleSelect = (optVal) => {
    if (isMulti) {
      const current = Array.isArray(value) ? [...value] : [];
      if (current.includes(optVal)) {
        // Ensure at least one selection remains
        if (current.length > 1) {
          onChange(current.filter(v => v !== optVal));
        }
      } else {
        onChange([...current, optVal]);
      }
    } else {
      onChange(optVal);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <span className="text-[15px] font-semibold text-[#1C1C1E]">
          {label}
        </span>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = isSelected(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`
                flex-1 min-w-[70px] min-h-[48px] px-4 py-2.5
                rounded-[10px] text-[15px] font-semibold
                border transition-all duration-150 flex items-center justify-center gap-1.5
                ${
                  selected
                    ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-sm'
                    : 'bg-white text-[#1C1C1E] border-[#E5E5EA] hover:bg-[#F2F2F7] active:bg-[#E5E5EA]'
                }
              `}
            >
              {opt.icon && <span className="text-[16px]">{opt.icon}</span>}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {helper && (
        <span className="text-[13px] text-[#6E6E73] px-1">
          {helper}
        </span>
      )}
    </div>
  );
}
