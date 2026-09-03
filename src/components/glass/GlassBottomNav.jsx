import React from 'react';
import { motion } from 'motion/react';
import { Home, ClipboardList, Settings, Plus } from 'lucide-react';

/**
 * GlassBottomNav — Bottom Dock Architecture
 * Features the Navigation Bar on the left side and the Input/Add Medicine button on the right side,
 * positioned close together as a unified ergonomic dock with slightly larger touch targets.
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
      className="fixed bottom-5 inset-x-0 z-40 mx-auto w-fit flex items-center justify-center gap-2.5 sm:gap-3 pointer-events-none select-none px-3"
    >
      {/* Navigation Bar on the Left Side */}
      <nav aria-label="Main navigation" className="pointer-events-auto">
        <div className="relative flex items-center gap-1 rounded-full border-[1.6px] border-white/80 bg-white/75 backdrop-blur-2xl p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.03)]">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab?.(tab.id)}
                className="group relative rounded-full px-4 py-2.5 outline-none sm:px-4.5 sm:py-3 transition-colors focus:outline-none"
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
                    animate={{ scale: isActive ? 1.04 : 1 }}
                    transition={{
                      scale: { type: 'spring', stiffness: 300, damping: 15 },
                    }}
                    className="flex shrink-0 items-center justify-center"
                  >
                    <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>

                  <span className="text-[13.5px] tracking-tight whitespace-nowrap sm:text-[14px]">
                    {tab.label}
                  </span>
                </motion.div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Input / Add Medicine Button on the Right Side */}
      {onAddMedicine && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          type="button"
          onClick={onAddMedicine}
          aria-label="Add new medicine"
          title="Add new medicine"
          className="
            pointer-events-auto
            h-[49px] w-[49px] sm:h-[53px] sm:w-[53px] rounded-full
            bg-[#1C1C1E] hover:bg-black active:bg-[#2C2C2E]
            text-white shadow-[0_12px_36px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.04)]
            border-[1.6px] border-white/80
            flex items-center justify-center shrink-0
            transition-colors
          "
        >
          <Plus size={23} strokeWidth={2.7} />
        </motion.button>
      )}
    </div>
  );
}

export default GlassBottomNav;
