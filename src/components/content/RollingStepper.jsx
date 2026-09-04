import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus } from 'lucide-react';

/**
 * RollingStepper — Apple HIG Tactile Number Stepper
 * Features smooth vertical rolling animation, guaranteed minimum width
 * so digits never clip or disappear, and 40px touch targets.
 */
export function RollingStepper({
  value,
  defaultValue = 0,
  min = 0,
  max = 999,
  unit = '',
  onChange,
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const [direction, setDirection] = useState(1);

  const current = Number(isControlled ? value : internal) || 0;

  const step = (dir) => {
    const next = Math.min(max, Math.max(min, current + dir));
    if (next === current) return;
    setDirection(dir);
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className="inline-flex items-center gap-1.5 bg-[#F2F2F7] rounded-2xl p-1 border border-[#E5E5EA]">
      {/* Minus Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 450, damping: 22 }}
        onClick={() => step(-1)}
        disabled={current <= min}
        aria-label="Decrease value"
        className="
          flex h-9 w-9 shrink-0 items-center justify-center
          rounded-xl bg-white text-[#1C1C1E] border border-[#E5E5EA]
          shadow-xs hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed
          transition-colors select-none
        "
      >
        <Minus className="h-4 w-4 stroke-[2.5]" />
      </motion.button>

      {/* Number Display with Smooth Vertical Roll */}
      <div className="min-w-[48px] px-1 h-8 flex items-center justify-center overflow-hidden relative select-none">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={(dir) => ({
              y: dir > 0 ? 16 : -16,
              opacity: 0,
            })}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={(dir) => ({
              y: dir > 0 ? -16 : 16,
              opacity: 0,
            })}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            className="flex items-center justify-center gap-1 font-bold text-[#1C1C1E] text-[17px] tabular-nums leading-none"
          >
            <span>{current}</span>
            {unit && (
              <span className="text-[11px] font-semibold text-[#8E8E93] lowercase">
                {unit}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Plus Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 450, damping: 22 }}
        onClick={() => step(1)}
        disabled={current >= max}
        aria-label="Increase value"
        className="
          flex h-9 w-9 shrink-0 items-center justify-center
          rounded-xl bg-white text-[#1C1C1E] border border-[#E5E5EA]
          shadow-xs hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed
          transition-colors select-none
        "
      >
        <Plus className="h-4 w-4 stroke-[2.5]" />
      </motion.button>
    </div>
  );
}

export default RollingStepper;
