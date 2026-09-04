import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MedicineCard } from '../components/content/MedicineCard';
import { ProfilePagerHeader } from '../components/navigation/ProfilePagerHeader';
import { evaluateMedicineStatus } from '../lib/depletion';
import { Check, Plus, User } from 'lucide-react';

/**
 * Home Screen — Dynamic Multi-Profile Dashboard
 * Features an Apple-style segmented pill dock displaying profile names with
 * real-time critical alert pips and fluid horizontal swipe gestures to switch between people.
 */
export function Home({ 
  medicines = [], 
  settings, 
  profiles = [],
  activeProfileId,
  onSelectProfile,
  onAudit, 
  onDelete, 
  onOpenAddSheet,
  onOpenGuide
}) {
  // Ensure we have at least one active profile
  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0] || { id: 'prof-default', name: 'Family' };
  }, [profiles, activeProfileId]);

  const currentPersonName = activeProfile.name;

  // Filter medicines strictly for active profile
  const currentMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const recipientId = med.recipient || med.profileId;
      return recipientId === activeProfile.id;
    });
  }, [medicines, activeProfile.id]);

  // Check which profiles have critical refills for alert pips on tabs
  const profileCriticalMap = useMemo(() => {
    const map = {};
    profiles.forEach((profile) => {
      const pMeds = medicines.filter((m) => (m.recipient || m.profileId) === profile.id);
      map[profile.id] = pMeds.some((m) => evaluateMedicineStatus(m).priority === 1);
    });
    return map;
  }, [profiles, medicines]);

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

  // Handle swipe gestures between profiles
  const currentIndex = profiles.findIndex((p) => p.id === activeProfile.id);

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold && currentIndex < profiles.length - 1) {
      // Swiped Left -> Next Profile
      onSelectProfile?.(profiles[currentIndex + 1].id);
    } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
      // Swiped Right -> Previous Profile
      onSelectProfile?.(profiles[currentIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-28">
      {/* ------------------------------------------------------------------ */}
      {/* Top Profile Pager Bar: Animated Name, Chevrons, Numbered Capsule   */}
      {/* ------------------------------------------------------------------ */}
      <ProfilePagerHeader
        profiles={profiles}
        activeProfile={activeProfile}
        onSelectProfile={onSelectProfile}
        badgeText={`${currentMedicines.length} meds`}
        profileCriticalMap={profileCriticalMap}
        onOpenGuide={onOpenGuide}
        layoutId="home-active-profile-step"
      />

      {/* ------------------------------------------------------------------ */}
      {/* Swipeable Screen Container (Framer Motion Drag & Transitions)      */}
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
            key={activeProfile.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="flex flex-col gap-6 w-full"
          >
            {currentMedicines.length > 0 ? (
              <>
                {/* -------------------------------------------------------- */}
                {/* Section 1: Critical                                      */}
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
                          profiles={profiles}
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
                {/* Section 2: Attention Required                            */}
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
                          profiles={profiles}
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
                {/* Section 3: All Good                                      */}
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
                          profiles={profiles}
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
              /* Empty State for This Profile */
              <div className="mt-8 flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-[#E5E5EA] shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#F2F2F7] flex items-center justify-center text-[#1C1C1E] mb-4">
                  <User size={28} strokeWidth={2.2} />
                </div>
                <h3 className="text-[19px] font-bold text-[#1C1C1E] mb-1">
                  No Medicines for {currentPersonName}
                </h3>
                <p className="text-[14px] text-[#6E6E73] max-w-xs mb-6 leading-relaxed">
                  Track prescriptions, doses, and blister strips specifically for {currentPersonName}.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenAddSheet?.(activeProfile.id)}
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
    </div>
  );
}

export default Home;
