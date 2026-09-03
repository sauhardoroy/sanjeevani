import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GlassTopBar } from '../components/glass/GlassTopBar';
import { 
  User, 
  Users, 
  Phone, 
  RotateCcw, 
  Check, 
  MessageCircle, 
  Heart, 
  Database 
} from 'lucide-react';

const TOUCH_SPRING = {
  type: 'spring',
  stiffness: 460,
  damping: 24,
  mass: 0.6,
};

/**
 * Settings Screen — Minimalist Apple HIG Architecture
 * Monochrome form inputs with clean hairline dividers and quiet typography.
 */
export function Settings({ 
  settings, 
  onUpdateSettings, 
  onResetData, 
  onShowToast 
}) {
  const [caregiverName, setCaregiverName] = useState(settings?.caregiverName || 'Dad');
  const [grandparentsName, setGrandparentsName] = useState(settings?.grandparentsName || 'Mom & Dad');
  const [grandparentsPhone, setGrandparentsPhone] = useState(settings?.grandparentsPhone || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateSettings({
      caregiverName: caregiverName.trim() || 'Dad',
      grandparentsName: grandparentsName.trim() || 'Mom & Dad',
      grandparentsPhone: grandparentsPhone.trim()
    });
    setIsSaved(true);
    onShowToast?.('Settings updated');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all medicines and audit logs back to initial demo data?')) {
      onResetData();
      setCaregiverName('Dad');
      setGrandparentsName('Mom & Dad');
      setGrandparentsPhone('+91 98765 43210');
      onShowToast?.('Restored demo data');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-28">
      <GlassTopBar
        title="Settings"
        subtitle="Caregiver preferences & WhatsApp link"
      />

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-6">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* ------------------------------------------------------------ */}
          {/* Section 1: Family & Profile */}
          {/* ------------------------------------------------------------ */}
          <section className="flex flex-col gap-2.5">
            <div className="px-1">
              <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
                Family & Greetings
              </h2>
            </div>

            <div className="rounded-[26px] border border-[#E5E5EA] bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-4">
              {/* Caregiver Name Row */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] shadow-xs">
                  <User size={18} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="caregiver-name" className="text-[10.5px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                    Your Name (Caregiver)
                  </label>
                  <input
                    id="caregiver-name"
                    type="text"
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    placeholder="Dad"
                    className="w-full text-[16px] text-[#1C1C1E] font-bold bg-transparent focus:outline-none placeholder:text-[#C7C7CC]"
                  />
                </div>
              </div>

              <div className="h-px bg-[#F2F2F7]" />

              {/* Grandparents' Calling Name Row */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] shadow-xs">
                  <Users size={18} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="grandparents-name" className="text-[10.5px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                    Grandparents' Calling Name
                  </label>
                  <input
                    id="grandparents-name"
                    type="text"
                    value={grandparentsName}
                    onChange={(e) => setGrandparentsName(e.target.value)}
                    placeholder="Mom & Dad"
                    className="w-full text-[16px] text-[#1C1C1E] font-bold bg-transparent focus:outline-none placeholder:text-[#C7C7CC]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* Section 2: WhatsApp Link */}
          {/* ------------------------------------------------------------ */}
          <section className="flex flex-col gap-2.5">
            <div className="px-1">
              <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
                WhatsApp Integration
              </h2>
            </div>

            <div className="rounded-[26px] border border-[#E5E5EA] bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] shadow-xs">
                  <Phone size={18} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="grandparents-phone" className="text-[10.5px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                    Grandparents' WhatsApp Number
                  </label>
                  <input
                    id="grandparents-phone"
                    type="tel"
                    value={grandparentsPhone}
                    onChange={(e) => setGrandparentsPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-[16px] text-[#1C1C1E] font-bold bg-transparent focus:outline-none placeholder:text-[#C7C7CC]"
                  />
                </div>
              </div>

              {/* Inset WhatsApp Feature Pod */}
              <div className="mt-1 rounded-xl bg-[#F8F9FB] border border-[#E5E5EA] p-3 text-[12px] text-[#1C1C1E] flex items-center gap-2.5">
                <MessageCircle size={16} className="text-[#1C1C1E] shrink-0 stroke-[2]" />
                <span className="leading-snug text-[#6E6E73]">
                  Tapping <strong>WhatsApp</strong> on any medicine opens a pre-composed message in Hindi / English for quick check-ins.
                </span>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* Section 3: Data & Storage */}
          {/* ------------------------------------------------------------ */}
          <section className="flex flex-col gap-2.5">
            <div className="px-1">
              <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
                Storage & Demo
              </h2>
            </div>

            <div className="rounded-[26px] border border-[#E5E5EA] bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] shadow-xs">
                  <Database size={18} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-[#1C1C1E]">
                    Zero Login Direct Storage
                  </h4>
                  <p className="text-[11.5px] text-[#8E8E93] mt-0.5 leading-relaxed">
                    All inventory and audit history are stored safely on this phone in local browser storage.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F2F2F7] flex items-center justify-between">
                <span className="text-[11.5px] font-medium text-[#8E8E93]">
                  Reset Demo Medicines
                </span>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  transition={TOUCH_SPRING}
                  type="button"
                  onClick={handleReset}
                  className="
                    px-3.5 py-1.5 rounded-full
                    border border-[#E5E5EA] bg-[#F8F9FB] hover:bg-[#F2F2F7]
                    text-[#FF3B30] text-[11.5px] font-semibold
                    flex items-center gap-1.5 shadow-xs transition-colors
                  "
                >
                  <RotateCcw size={12} />
                  <span>Restore Demo Data</span>
                </motion.button>
              </div>
            </div>
          </section>

          {/* Save Button (Apple Black Pill) */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={TOUCH_SPRING}
            type="submit"
            className="
              w-full h-12 rounded-2xl
              bg-[#1C1C1E] hover:bg-black active:bg-[#2C2C2E]
              text-white text-[14.5px] font-bold tracking-tight
              flex items-center justify-center gap-2 shadow-xs transition-colors
            "
          >
            {isSaved ? (
              <>
                <Check size={17} className="text-[#34C759] stroke-[2.5]" />
                <span>Preferences Saved</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </motion.button>
        </form>

        {/* Minimalist Loving Reassurance Note */}
        <div className="mt-2 p-3 rounded-2xl bg-white/60 border border-[#E5E5EA] text-center flex items-center justify-center gap-2 text-[12.5px] text-[#6E6E73] font-medium">
          <Heart className="w-3.5 h-3.5 fill-[#8E8E93] text-[#8E8E93] shrink-0" />
          <span>Zero smartphone tech needed for Grandma & Grandpa</span>
        </div>
      </main>
    </div>
  );
}

export default Settings;
