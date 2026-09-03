import React from 'react';
import { motion } from 'motion/react';
import { Home, ClipboardList, Settings } from 'lucide-react';

const DROPLET_SPRING = {
  type: 'spring',
  stiffness: 460,
  damping: 30,
  mass: 0.8,
};

/**
 * GlassBottomNav — Pill-Shaped Liquid Droplet Architecture
 * - 100% stable fixed dock dimensions (zero jumping or shifting)
 * - Ultra-high opacity Apple frosted glass material (bg-white/95)
 * - Fluid liquid droplet indicator that slides smoothly between tabs via layoutId
 * - Clean pill shape with zero distracting gloss sweep
 */
export function GlassBottomNav({ currentTab, onSelectTab }) {
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'history',
      label: 'History',
      icon: ClipboardList,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-5 inset-x-0 z-40 mx-auto w-fit flex items-center justify-center pointer-events-auto select-none"
    >
      {/* Pill-Shaped Frosted Glass Panel (Increased Opacity & Hairline Border) */}
      <div
        className="
          relative flex items-center justify-center gap-1 p-1.5
          rounded-full bg-white/95 backdrop-blur-3xl
          border border-white/90
          shadow-[0_12px_36px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04)]
        "
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelectTab?.(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTab?.(tab.id);
                }
              }}
              className={`
                relative h-10 px-4 rounded-full
                flex items-center justify-center gap-2
                text-[13px] font-bold tracking-tight
                transition-colors duration-200 focus:outline-none
                ${isActive ? 'text-white' : 'text-[#8E8E93] hover:text-[#1C1C1E]'}
              `}
            >
              {/* Fluid Liquid Droplet Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNavDroplet"
                  transition={DROPLET_SPRING}
                  className="
                    absolute inset-0 rounded-full
                    bg-[#1C1C1E]
                    shadow-[0_2px_8px_rgba(0,0,0,0.18)]
                  "
                />
              )}

              {/* Tab Icon (Elevated above droplet) */}
              <span className="relative z-10 flex items-center justify-center">
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
              </span>

              {/* Tab Label (Elevated above droplet) */}
              <span className="relative z-10 font-bold whitespace-nowrap">
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

export default GlassBottomNav;
