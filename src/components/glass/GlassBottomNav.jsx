import React from 'react';
import { Home, ClipboardList, Settings } from 'lucide-react';

/**
 * GlassBottomNav — Functional Layer (Glassmorphism)
 * Floats ~12px above screen bottom with 24px rounded corners and always-visible labels.
 */
export function GlassBottomNav({ currentTab, onSelectTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'History', icon: ClipboardList },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav 
      aria-label="Main navigation"
      className="
        fixed bottom-3 inset-x-4 z-40 max-w-md mx-auto
        glass-surface rounded-[24px]
        p-1.5 shadow-apple-glass
        border border-white/60
      "
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`
                flex-1 min-h-[48px] py-1.5 px-3
                flex flex-col items-center justify-center gap-1
                rounded-[18px] transition-all duration-200
                ${
                  isActive
                    ? 'bg-[#007AFF]/12 text-[#007AFF] font-semibold'
                    : 'text-[#6E6E73] hover:text-[#1C1C1E] active:scale-95'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-[#007AFF]' : 'stroke-[2]'}`} />
              <span className="text-[12px] tracking-tight leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
