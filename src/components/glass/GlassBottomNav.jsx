import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Home, ClipboardList, Settings } from 'lucide-react';

/**
 * GlassBottomNav — DiscreteTabs Architecture
 * Expanding active pill with spring animation, 
 * sweeping light shine effect, and frosted Apple glass container.
 */
export function GlassBottomNav({ currentTab, onSelectTab }) {
  const [shine, setShine] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShine(true), 400);
    return () => {
      clearTimeout(timer);
      setShine(false);
    };
  }, [currentTab]);

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home size={18} strokeWidth={2.3} />,
      activeColor: 'text-white',
    },
    {
      id: 'history',
      label: 'History',
      icon: <ClipboardList size={18} strokeWidth={2.3} />,
      activeColor: 'text-white',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={18} strokeWidth={2.3} />,
      activeColor: 'text-white',
    },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-5 inset-x-0 z-40 mx-auto w-fit flex items-center justify-center pointer-events-auto"
    >
      <motion.div
        layout
        className="
          flex items-center justify-center gap-1.5 p-1.5
          rounded-2xl bg-white/85 backdrop-blur-2xl
          border border-white/80
          shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]
        "
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab?.(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTab?.(tab.id);
                }
              }}
              className="relative focus:outline-none select-none"
            >
              <motion.div
                layout="position"
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 22,
                  mass: 0.9,
                }}
                className="flex h-11 items-center justify-center"
              >
                <div
                  className={`
                    flex h-10 cursor-pointer items-center justify-center rounded-xl px-3.5
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-[#1C1C1E] text-white shadow-xs'
                        : 'bg-transparent text-[#8E8E93] hover:bg-[#F2F2F7] hover:text-[#1C1C1E]'
                    }
                  `}
                  tabIndex={0}
                >
                  <motion.div
                    className={`flex items-center justify-center transition-colors duration-200 ${
                      isActive ? tab.activeColor : 'text-[#8E8E93]'
                    }`}
                  >
                    {tab.icon}
                  </motion.div>

                  <motion.span
                    animate={{
                      width: isActive ? 'auto' : 0,
                      opacity: isActive ? 1 : 0,
                      marginLeft: isActive ? 8 : 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 22,
                      mass: 0.9,
                    }}
                    className={`
                      relative overflow-hidden text-[13px] font-bold tracking-tight whitespace-nowrap transition-colors duration-200
                      ${isActive ? tab.activeColor : 'text-[#8E8E93]'}
                    `}
                  >
                    {tab.label}

                    <AnimatePresence>
                      {isActive && shine && (
                        <motion.span
                          initial={{ left: '-120%' }}
                          animate={{ left: '120%' }}
                          transition={{
                            duration: 0.6,
                            ease: 'linear',
                          }}
                          className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none"
                        />
                      )}
                    </AnimatePresence>
                  </motion.span>
                </div>
              </motion.div>
            </button>
          );
        })}
      </motion.div>
    </nav>
  );
}

export default GlassBottomNav;
