import React from 'react';
import { motion } from 'motion/react';
import { Home, ClipboardList, Settings, Plus } from 'lucide-react';

/**
 * GlassBottomNav — Unified Capsule Bottom Dock Architecture
 * Houses both the navigation tabs (Home, History, Settings) and the Add Medicine (+) action
 * inside a single, beautifully centered glass capsule.
 * Designed with responsive sizing to guarantee it never overflows on mobile screens.
 */
export function GlassBottomNav({ currentTab, onSelectTab, onAddMedicine }) {
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
    <div
      aria-label="Bottom Navigation and Actions Dock"
      className="fixed bottom-4 sm:bottom-5 inset-x-0 z-40 mx-auto w-fit max-w-[calc(100vw-1.5rem)] flex items-center justify-center pointer-events-none select-none px-2"
    >
      <nav
        aria-label="Main navigation"
        className="
          pointer-events-auto
          relative flex items-center gap-1 sm:gap-1.5
          rounded-full border-[1.6px] border-white/80 bg-white/85 backdrop-blur-2xl
          p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.04)]
        "
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab?.(tab.id)}
              className="group relative rounded-full px-3 py-2 sm:px-4 sm:py-2.5 outline-none transition-colors focus:outline-none flex items-center justify-center min-h-[40px]"
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 26,
                    mass: 0.8,
                  }}
                  className="absolute inset-0 rounded-full bg-[#1C1C1E] shadow-xs"
                />
              )}

              <motion.div
                transition={{
                  duration: 0.25,
                  ease: 'easeOut',
                }}
                animate={{
                  filter: isActive
                    ? ['blur(0px)', 'blur(2px)', 'blur(0px)']
                    : 'blur(0px)',
                }}
                className={`relative z-10 flex items-center gap-1.5 sm:gap-2 transition-colors duration-200 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E] font-semibold'
                }`}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{
                    scale: { type: 'spring', stiffness: 300, damping: 15 },
                  }}
                  className="flex shrink-0 items-center justify-center"
                >
                  <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>

                <span className="text-[12.5px] sm:text-[13.5px] tracking-tight whitespace-nowrap">
                  {tab.label}
                </span>
              </motion.div>
            </button>
          );
        })}

        {/* Subtle Divider before Add Button */}
        {onAddMedicine && (
          <>
            <div className="w-[1px] h-5 bg-[#E5E5EA] mx-0.5 shrink-0" aria-hidden="true" />

            {/* Integrated Add Medicine Button */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.90 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              type="button"
              onClick={onAddMedicine}
              aria-label="Add new medicine"
              title="Add new medicine"
              className="
                relative h-9 w-9 sm:h-10 sm:w-10 rounded-full
                bg-[#1C1C1E] hover:bg-black active:bg-[#2C2C2E]
                text-white shadow-xs
                flex items-center justify-center shrink-0
                outline-none focus:outline-none transition-colors
              "
            >
              <Plus size={19} strokeWidth={2.6} />
            </motion.button>
          </>
        )}
      </nav>
    </div>
  );
}

export default GlassBottomNav;
