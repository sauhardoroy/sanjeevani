import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GlassFAB } from '../components/glass/GlassFAB';
import { MedicineCard } from '../components/content/MedicineCard';
import { evaluateMedicineStatus } from '../lib/depletion';
import { PlusCircle, Heart, Check, Plus, HelpCircle } from 'lucide-react';
import { GrandmotherIcon, GrandfatherIcon } from '../components/icons/GrandparentIcons';

/**
 * Home Screen — Dual-Profile Dashboard (Grandmother & Grandfather)
 * Features a sleek pill dock containing two circular options with distinct
 * black & white flat icons, zero text inside the pill, and horizontal swipe navigation.
 */
export function Home({ 
  medicines = [], 
  settings, 
  onAudit, 
  onDelete, 
  onOpenAddSheet,
  onOpenGuide
}) {
  const [activeProfile, setActiveProfile] = useState('GRANDMOTHER');

  // Separate medicines by recipient
  const { grandmaMeds, grandpaMeds } = useMemo(() => {
    const grandma = [];
    const grandpa = [];
    medicines.forEach((med) => {
      const recipient = med.recipient || (med.name?.toLowerCase().includes('metformin') ? 'GRANDMOTHER' : 'GRANDFATHER');
      if (recipient === 'GRANDMOTHER') {
        grandma.push(med);
      } else {
        grandpa.push(med);
      }
    });
    return { grandmaMeds: grandma, grandpaMeds: grandpa };
  }, [medicines]);

  // Check if either profile has critical medications (for badge dots)
  const grandmaCritical = useMemo(() => {
    return grandmaMeds.some((m) => evaluateMedicineStatus(m).priority === 1);
  }, [grandmaMeds]);

  const grandpaCritical = useMemo(() => {
    return grandpaMeds.some((m) => evaluateMedicineStatus(m).priority === 1);
  }, [grandpaMeds]);

  // Current active profile's medicines & name
  const currentMedicines = activeProfile === 'GRANDMOTHER' ? grandmaMeds : grandpaMeds;
  const currentPersonName = activeProfile === 'GRANDMOTHER' 
    ? (settings?.grandmotherName || 'Grandmother')
    : (settings?.grandfatherName || 'Grandfather');

  // Categorize active profile's medicines into 3 sections
  const { criticalMeds, attentionMeds, allGoodMeds } = useMemo(() => {
    const critical = [];
    const attention = [];
    const allGood = [];

    currentMedicines.forEach((med) => {
      const status = evaluateMedicineStatus(med);
      if (status.type === 'REFILL_NOW' || status.priority === 1) {
        critical.push(med);
      } else if (
        status.type === 'ABANDONMENT_RISK' || 
        status.type === 'LOW_STOCK' || 
        status.priority === 2
      ) {
        attention.push(med);
      } else {
        allGood.push(med);
      }
    });

    return {
      criticalMeds: critical,
      attentionMeds: attention,
      allGoodMeds: allGood,
    };
  }, [currentMedicines]);

  // Handle swipe gestures
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold && activeProfile === 'GRANDMOTHER') {
      // Swiped Left -> Switch to Grandfather
      setActiveProfile('GRANDFATHER');
    } else if (info.offset.x > swipeThreshold && activeProfile === 'GRANDFATHER') {
      // Swiped Right -> Switch to Grandmother
      setActiveProfile('GRANDMOTHER');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-28">
      {/* ------------------------------------------------------------------ */}
      {/* Top Floating Control Bar (Two Circles Inside a Pill + Help Button) */}
      {/* ------------------------------------------------------------------ */}
      <div className="max-w-lg mx-auto w-full px-4 pt-4 pb-2 flex items-center justify-between select-none">
        {/* Invisible left balance spacer */}
        <div className="w-9 h-9" />

        {/* Center: Two Circles Inside a Pill */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex items-center gap-1 rounded-full border-[1.6px] border-[#E5E5EA] bg-white/95 backdrop-blur-3xl p-1 shadow-xs">
          
          {/* Circle Option 1: Grandmother */}
          <button
            type="button"
            onClick={() => setActiveProfile('GRANDMOTHER')}
            aria-label={settings?.grandmotherName || 'Grandmother'}
            title={settings?.grandmotherName || 'Grandmother'}
            className="group relative h-10 w-10 rounded-full flex items-center justify-center outline-none transition-colors focus:outline-none"
          >
            {activeProfile === 'GRANDMOTHER' && (
              <motion.div
                layoutId="active-grandparent-circle"
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
              transition={{ duration: 0.3, ease: 'easeOut' }}
              animate={{
                filter: activeProfile === 'GRANDMOTHER'
                  ? ['blur(0px)', 'blur(4px)', 'blur(0px)']
                  : 'blur(0px)',
              }}
              className="relative z-10 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: activeProfile === 'GRANDMOTHER' ? 1.05 : 1 }}
                transition={{ scale: { type: 'spring', stiffness: 300, damping: 15 } }}
                className="flex items-center justify-center"
              >
                <GrandmotherIcon 
                  size={20} 
                  className={`transition-colors duration-200 ${
                    activeProfile === 'GRANDMOTHER' 
                      ? 'text-white' 
                      : 'text-[#8E8E93] group-hover:text-[#1C1C1E]'
                  }`} 
                />
              </motion.div>
            </motion.div>

            {/* Critical Alert Pip on Circle */}
            {grandmaCritical && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF3B30] ring-2 ring-white z-20" />
            )}
          </button>

          {/* Circle Option 2: Grandfather */}
          <button
            type="button"
            onClick={() => setActiveProfile('GRANDFATHER')}
            aria-label={settings?.grandfatherName || 'Grandfather'}
            title={settings?.grandfatherName || 'Grandfather'}
            className="group relative h-10 w-10 rounded-full flex items-center justify-center outline-none transition-colors focus:outline-none"
          >
            {activeProfile === 'GRANDFATHER' && (
              <motion.div
                layoutId="active-grandparent-circle"
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
              transition={{ duration: 0.3, ease: 'easeOut' }}
              animate={{
                filter: activeProfile === 'GRANDFATHER'
                  ? ['blur(0px)', 'blur(4px)', 'blur(0px)']
                  : 'blur(0px)',
              }}
              className="relative z-10 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: activeProfile === 'GRANDFATHER' ? 1.05 : 1 }}
                transition={{ scale: { type: 'spring', stiffness: 300, damping: 15 } }}
                className="flex items-center justify-center"
              >
                <GrandfatherIcon 
                  size={20} 
                  className={`transition-colors duration-200 ${
                    activeProfile === 'GRANDFATHER' 
                      ? 'text-white' 
                      : 'text-[#8E8E93] group-hover:text-[#1C1C1E]'
                  }`} 
                />
              </motion.div>
            </motion.div>

            {/* Critical Alert Pip on Circle */}
            {grandpaCritical && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF3B30] ring-2 ring-white z-20" />
            )}
          </button>
        </div>

        {/* Quiet Sub-label Indicating Current Profile & Swipe Gesture */}
        <div className="flex items-center gap-2 pt-1.5 text-[11.5px] font-semibold text-[#8E8E93]">
          <span className="text-[#1C1C1E]">{currentPersonName}</span>
          <span>•</span>
          <span className="font-normal">{currentMedicines.length} meds</span>
          <span>•</span>
          <span className="font-normal">Swipe to switch</span>
        </div>
      </div>

      {/* Right: Help Button */}
      {onOpenGuide ? (
        <button
          type="button"
          onClick={onOpenGuide}
          aria-label="App Guide"
          title="How to use Sanjeevani"
          className="
            h-9 w-9 flex items-center justify-center rounded-full
            bg-white hover:bg-[#F2F2F7] text-[#1C1C1E]
            border border-[#E5E5EA] shadow-xs active:scale-92 transition-all
          "
        >
          <HelpCircle size={17} strokeWidth={2.2} />
        </button>
      ) : (
        <div className="w-9 h-9" />
      )}
    </div>

      {/* ------------------------------------------------------------------ */}
      {/* Swipeable Screen Container (Framer Motion Drag & Transitions) */}
      {/* ------------------------------------------------------------------ */}
      <motion.main
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        className="p-4 max-w-lg mx-auto w-full flex-1 flex flex-col touch-pan-y"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeProfile}
            initial={{ opacity: 0, x: activeProfile === 'GRANDFATHER' ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeProfile === 'GRANDFATHER' ? -40 : 40 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="flex flex-col gap-6 w-full"
          >
            {currentMedicines.length > 0 ? (
              <>
                {/* -------------------------------------------------------- */}
                {/* Section 1: Critical */}
                {/* -------------------------------------------------------- */}
                <section className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF3B30]" />
                      <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
                        Critical Refill
                      </h2>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      criticalMeds.length > 0 
                        ? 'bg-[#FF3B30]/10 text-[#D32F2F] border border-[#FF3B30]/20' 
                        : 'bg-[#E5E5EA] text-[#8E8E93]'
                    }`}>
                      {criticalMeds.length}
                    </span>
                  </div>

                  {criticalMeds.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {criticalMeds.map((med) => (
                        <MedicineCard
                          key={med.id}
                          medicine={med}
                          settings={settings}
                          onAudit={onAudit}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-2.5 px-4 rounded-2xl bg-white/70 border border-[#E5E5EA] text-[12px] font-medium text-[#8E8E93] flex items-center justify-center gap-2">
                      <Check size={13} className="text-[#34C759] stroke-[2.5]" />
                      <span>No critical refills needed for {currentPersonName}</span>
                    </div>
                  )}
                </section>

                {/* -------------------------------------------------------- */}
                {/* Section 2: Attention Required */}
                {/* -------------------------------------------------------- */}
                <section className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF9F0A]" />
                      <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
                        Attention Required
                      </h2>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      attentionMeds.length > 0 
                        ? 'bg-[#FF9F0A]/10 text-[#B45309] border border-[#FF9F0A]/20' 
                        : 'bg-[#E5E5EA] text-[#8E8E93]'
                    }`}>
                      {attentionMeds.length}
                    </span>
                  </div>

                  {attentionMeds.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {attentionMeds.map((med) => (
                        <MedicineCard
                          key={med.id}
                          medicine={med}
                          settings={settings}
                          onAudit={onAudit}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-2.5 px-4 rounded-2xl bg-white/70 border border-[#E5E5EA] text-[12px] font-medium text-[#8E8E93] flex items-center justify-center gap-2">
                      <Check size={13} className="text-[#34C759] stroke-[2.5]" />
                      <span>No strips in early discard risk</span>
                    </div>
                  )}
                </section>

                {/* -------------------------------------------------------- */}
                {/* Section 3: All Good */}
                {/* -------------------------------------------------------- */}
                <section className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                      <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
                        All Good
                      </h2>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      allGoodMeds.length > 0 
                        ? 'bg-[#34C759]/10 text-[#15803D] border border-[#34C759]/20' 
                        : 'bg-[#E5E5EA] text-[#8E8E93]'
                    }`}>
                      {allGoodMeds.length}
                    </span>
                  </div>

                  {allGoodMeds.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {allGoodMeds.map((med) => (
                        <MedicineCard
                          key={med.id}
                          medicine={med}
                          settings={settings}
                          onAudit={onAudit}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-2.5 px-4 rounded-2xl bg-white/70 border border-[#E5E5EA] text-[12px] font-medium text-[#8E8E93] flex items-center justify-center gap-2">
                      <span>No medicines currently in safe supply</span>
                    </div>
                  )}
                </section>
              </>
            ) : (
              /* Empty State for This Person */
              <div className="mt-8 flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-[#E5E5EA] shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#F2F2F7] flex items-center justify-center text-[#1C1C1E] mb-4">
                  {activeProfile === 'GRANDMOTHER' ? (
                    <GrandmotherIcon size={28} />
                  ) : (
                    <GrandfatherIcon size={28} />
                  )}
                </div>
                <h3 className="text-[19px] font-bold text-[#1C1C1E] mb-1">
                  No Medicines for {currentPersonName}
                </h3>
                <p className="text-[14px] text-[#6E6E73] max-w-xs mb-6 leading-relaxed">
                  Track prescriptions, doses, and blister strips specifically for {currentPersonName}.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenAddSheet?.(activeProfile)}
                  className="px-5 py-2.5 rounded-full bg-[#1C1C1E] text-white text-xs font-bold shadow-xs hover:bg-black transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add Medicine for {currentPersonName}</span>
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.main>

      {/* Floating Glass FAB for instant addition */}
      <GlassFAB onClick={() => onOpenAddSheet?.(activeProfile)} />
    </div>
  );
}

export default Home;
