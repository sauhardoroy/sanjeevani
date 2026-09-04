import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

/**
 * AnimatedText — Staggered spring letter animation for profile names.
 * Features popLayout character exit/entry with blur and scale spring physics.
 */
function AnimatedText({ text, className, delayStep = 0.016 }) {
  const chars = (text || '').split('');

  return (
    <span className={className} style={{ display: 'inline-flex' }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={text}
          style={{ display: 'inline-flex', willChange: 'transform' }}
        >
          {chars.map((char, i) => (
            <motion.span
              key={`${text}-${i}`}
              initial={{
                y: 8,
                opacity: 0,
                scale: 0.6,
                filter: 'blur(3px)',
              }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
              }}
              exit={{
                y: -8,
                opacity: 0,
                scale: 0.6,
                filter: 'blur(3px)',
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 18,
                mass: 1.0,
                delay: i * delayStep,
              }}
              style={{
                display: 'inline-block',
                whiteSpace: char === ' ' ? 'pre' : undefined,
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * ProfilePagerHeader — Unified, perfectly aligned top navigation header.
 * Used across both Home and History screens for a zero-jump layout.
 * Features animated profile names, Prev/Next chevrons, numbered step capsule,
 * and critical refill indicator pips.
 */
export function ProfilePagerHeader({
  profiles = [],
  activeProfile,
  onSelectProfile,
  badgeText = '',
  profileCriticalMap = {},
  onOpenGuide,
  layoutId = 'profile-pager-active',
}) {
  const currentIndex = profiles.findIndex((p) => p.id === activeProfile?.id);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentPerson = profiles[safeIndex] || activeProfile || { name: 'Family' };

  const handlePrev = () => {
    if (profiles.length <= 1) return;
    const newIdx = (safeIndex - 1 + profiles.length) % profiles.length;
    onSelectProfile?.(profiles[newIdx].id);
  };

  const handleNext = () => {
    if (profiles.length <= 1) return;
    const newIdx = (safeIndex + 1) % profiles.length;
    onSelectProfile?.(profiles[newIdx].id);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-3 pb-1 flex flex-col items-center select-none">
      {/* Row 1: Balanced Header with Animated Profile Name | Count & Help Button */}
      <div className="w-full flex items-center justify-between h-9">
        {/* Invisible Left Balance Spacer */}
        <div className="w-9 h-9 shrink-0" />

        {/* Center: Animated Profile Name | Count */}
        <div className="flex items-center justify-center gap-2 overflow-hidden px-2">
          <AnimatedText
            text={currentPerson.name}
            className="text-[19px] sm:text-[21px] font-extrabold tracking-tight text-[#1C1C1E] text-center"
            delayStep={0.016}
          />
          {badgeText && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[#C7C7CC] font-light text-[15px]">|</span>
              <span className="text-[14px] sm:text-[15px] font-semibold text-[#8E8E93] whitespace-nowrap">
                {badgeText}
              </span>
            </div>
          )}
        </div>

        {/* Right: Guide Button or Spacer */}
        {onOpenGuide ? (
          <button
            type="button"
            onClick={onOpenGuide}
            aria-label="How to use Sanjeevani"
            title="How to use Sanjeevani"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-[#E5E5EA] text-[#6E6E73] hover:text-[#1C1C1E] hover:bg-white active:scale-90 transition-all shadow-xs cursor-pointer"
          >
            <HelpCircle size={18} strokeWidth={2} />
          </button>
        ) : (
          <div className="w-9 h-9 shrink-0" />
        )}
      </div>

      {/* Row 2: Stepper Control with ChevronLeft, Numbered Pills Capsule, ChevronRight */}
      <div className="flex items-center justify-center gap-2.5 mt-1.5 mb-1">
        <button
          type="button"
          title="Previous person"
          aria-label="Previous person"
          onClick={handlePrev}
          disabled={profiles.length <= 1}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 border border-[#E5E5EA] text-[#1C1C1E] shadow-xs transition-all duration-200 hover:bg-white active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
        </button>

        {/* Central Numbered Capsule (No scrollbar, compact numbers) */}
        <div className="relative flex items-center justify-center gap-1 rounded-full border-[1.6px] border-[#E5E5EA] bg-white/95 backdrop-blur-3xl px-2 py-1 shadow-xs">
          {profiles.map((profile, index) => {
            const isActive = profile.id === currentPerson.id;
            const hasCritical = profileCriticalMap?.[profile.id];
            const stepNumber = index + 1;

            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => onSelectProfile?.(profile.id)}
                aria-label={`${profile.name} (Person ${stepNumber})`}
                title={`${profile.name} (Person ${stepNumber})`}
                className="group relative flex h-7 min-w-[28px] px-2.5 cursor-pointer items-center justify-center rounded-full transition-all focus:outline-none shrink-0"
              >
                {isActive && (
                  <motion.div
                    layoutId={layoutId}
                    transition={{
                      type: 'spring',
                      stiffness: 340,
                      damping: 28,
                      mass: 0.8,
                    }}
                    className="absolute inset-0 rounded-full bg-[#1C1C1E] shadow-xs"
                  />
                )}

                <span
                  className={`relative z-10 text-[13px] font-bold tracking-tight transition-colors duration-200 flex items-center gap-1 ${
                    isActive
                      ? 'text-white'
                      : 'text-[#8E8E93] hover:text-[#1C1C1E]'
                  }`}
                >
                  <span>{stepNumber}</span>
                  {hasCritical && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-[#FF3B30] shrink-0 ${
                        isActive ? 'ring-1 ring-white' : ''
                      }`}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          title="Next person"
          aria-label="Next person"
          onClick={handleNext}
          disabled={profiles.length <= 1}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 border border-[#E5E5EA] text-[#1C1C1E] shadow-xs transition-all duration-200 hover:bg-white active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          <ChevronRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

export default ProfilePagerHeader;
