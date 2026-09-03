import React from 'react';
import { motion } from 'motion/react';
import { Home, ClipboardList, Settings } from 'lucide-react';

/**
 * GlassBottomNav — FluidTabs Architecture
 * Floating pill with spring sliding active indicator, blur-pulse animation,
 * and high-opacity frosted Apple glass.
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
      <div className="relative flex items-center gap-1 rounded-full border-[1.6px] border-white/80 bg-white/75 backdrop-blur-2xl px-1.5 py-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.03)] sm:gap-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab?.(tab.id)}
              className="group relative rounded-full px-3.5 py-2 outline-none sm:px-4 sm:py-2.5 transition-colors focus:outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 25,
                    mass: 0.8,
                  }}
                  className="absolute inset-0 rounded-full bg-[#1C1C1E] shadow-xs"
                />
              )}

              <motion.div
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                }}
                animate={{
                  filter: isActive
                    ? ['blur(0px)', 'blur(4px)', 'blur(0px)']
                    : 'blur(0px)',
                }}
                className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E] font-semibold'
                }`}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.03 : 1 }}
                  transition={{
                    scale: { type: 'spring', stiffness: 300, damping: 15 },
                  }}
                  className="flex shrink-0 items-center justify-center"
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>

                <span className="text-[13px] tracking-tight whitespace-nowrap sm:text-sm">
                  {tab.label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default GlassBottomNav;
