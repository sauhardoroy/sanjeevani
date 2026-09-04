import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Edit3,
  User 
} from 'lucide-react';
import { ProfilePagerHeader } from '../components/navigation/ProfilePagerHeader';
import { evaluateMedicineStatus } from '../lib/depletion';

/**
 * History Screen — Dynamic Multi-Profile Verification Logs
 * Filtered by tracked profile with fluid horizontal swipe gestures and profile name tabs.
 */
export function History({ 
  auditLogs = [], 
  medicines = [],
  profiles = [], 
  activeProfileId, 
  onSelectProfile,
  onOpenGuide 
}) {
  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0] || { id: 'prof-default', name: 'Family' };
  }, [profiles, activeProfileId]);

  // Check which profiles have critical refills for alert pips on tabs
  const profileCriticalMap = useMemo(() => {
    const map = {};
    profiles.forEach((profile) => {
      const pMeds = medicines.filter((m) => (m.recipient || m.profileId) === profile.id);
      map[profile.id] = pMeds.some((m) => evaluateMedicineStatus(m).priority === 1);
    });
    return map;
  }, [profiles, medicines]);

  const currentPersonName = activeProfile.name;

  // Filter logs strictly for active profile
  const currentLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      return log.recipient === activeProfile.id;
    });
  }, [auditLogs, activeProfile.id]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    const d = new Date(isoString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const time = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) return `Today at ${time}`;

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Compute stats for the active profile
  const { matchedCount, anomaliesCount } = useMemo(() => {
    let matched = 0;
    let anomalies = 0;
    currentLogs.forEach((log) => {
      if (log.outcome === 'MATCHES_EXPECTED') matched += 1;
      else anomalies += 1;
    });
    return { matchedCount: matched, anomaliesCount: anomalies };
  }, [currentLogs]);

  // Handle swipe gestures between profiles
  const currentIndex = profiles.findIndex((p) => p.id === activeProfile.id);

  const handleDragEnd = (_, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold && currentIndex < profiles.length - 1) {
      onSelectProfile?.(profiles[currentIndex + 1].id);
    } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
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
        badgeText={`${currentLogs.length} logs`}
        profileCriticalMap={profileCriticalMap}
        onOpenGuide={onOpenGuide}
        layoutId="history-active-profile-step"
      />

      {/* ------------------------------------------------------------------ */}
      {/* Swipeable Screen Content                                           */}
      {/* ------------------------------------------------------------------ */}
      <motion.main
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        className="p-4 max-w-lg mx-auto w-full flex-1 flex flex-col gap-5 touch-pan-y"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeProfile.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="flex flex-col gap-5 w-full"
          >
            {/* 1. Apple 3-Column Metric Pod for Current Profile */}
            <div className="rounded-[26px] border border-[#E5E5EA] bg-white p-4 shadow-xs">
              <div className="grid grid-cols-3 divide-x divide-[#E5E5EA] text-center">
                <div className="px-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                    Total Logs
                  </span>
                  <span className="text-[19px] font-bold text-[#1C1C1E] tabular-nums mt-0.5 block">
                    {currentLogs.length}
                  </span>
                </div>

                <div className="px-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                    Count Matched
                  </span>
                  <span className="text-[19px] font-bold text-[#1C1C1E] tabular-nums mt-0.5 block">
                    {matchedCount}
                  </span>
                </div>

                <div className="px-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                    Adjusted
                  </span>
                  <span className="text-[19px] font-bold text-[#1C1C1E] tabular-nums mt-0.5 block">
                    {anomaliesCount}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Section Header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
                {currentPersonName}'s Verifications
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E5E5EA] text-[#1C1C1E]">
                {currentLogs.length}
              </span>
            </div>

            {/* 3. Logged Cards */}
            {currentLogs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {currentLogs.map((log) => {
                  const isMatched = log.outcome === 'MATCHES_EXPECTED';
                  const isAdjusted = log.outcome === 'COUNT_ADJUSTED';

                  return (
                    <div
                      key={log.id}
                      className="
                        rounded-[26px] border border-[#E5E5EA] bg-white p-4 sm:p-5
                        shadow-xs flex flex-col gap-3
                      "
                    >
                      {/* Top Row: Squircle Icon + Medicine Name + Outcome Badge */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] shadow-xs">
                            {isMatched && <CheckCircle2 size={18} strokeWidth={2} />}
                            {isAdjusted && <Edit3 size={18} strokeWidth={2} />}
                            {!isMatched && !isAdjusted && <AlertTriangle size={18} strokeWidth={2} />}
                          </div>

                          <div className="min-w-0">
                            <h4 className="truncate text-[16px] font-bold tracking-tight text-[#1C1C1E]">
                              {log.medicineName}
                            </h4>
                            <span className="text-[11px] font-medium text-[#8E8E93] flex items-center gap-1 mt-0.5">
                              <Clock size={11} />
                              <span>{formatDate(log.timestamp)}</span>
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 bg-[#F8F9FB] border border-[#E5E5EA] text-[#1C1C1E] text-xs font-semibold shadow-xs">
                          <span className={`w-2 h-2 rounded-full ${
                            isMatched ? 'bg-[#34C759]' : isAdjusted ? 'bg-[#007AFF]' : 'bg-[#FF9F0A]'
                          }`} />
                          <span>
                            {isMatched 
                              ? 'Count Matched' 
                              : isAdjusted 
                              ? 'Count Adjusted' 
                              : 'Discarded Early'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Detail Note */}
                      {log.note && (
                        <div className="rounded-xl bg-[#F8F9FB] border border-[#E5E5EA] px-3.5 py-2.5 text-[12px] text-[#1C1C1E] leading-relaxed">
                          {log.note}
                        </div>
                      )}

                      {/* Inventory snapshot row */}
                      {(log.fullStripsRemaining !== undefined || log.pillsOnActiveStrip !== undefined) && (
                        <div className="pt-1.5 border-t border-[#F2F2F7] flex items-center justify-between text-[11px] text-[#8E8E93]">
                          <span>
                            Active: <strong className="text-[#1C1C1E]">{log.pillsOnActiveStrip ?? 0} pills</strong>
                          </span>
                          <span>
                            Unopened: <strong className="text-[#1C1C1E]">{log.fullStripsRemaining ?? 0} full strips</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State for this Profile */
              <div className="mt-8 flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-[#E5E5EA] shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#F2F2F7] flex items-center justify-center text-[#1C1C1E] mb-3">
                  <User size={28} strokeWidth={2.2} />
                </div>
                <h3 className="text-[18px] font-bold text-[#1C1C1E] mb-1">
                  No Audit Logs for {currentPersonName}
                </h3>
                <p className="text-[13.5px] text-[#6E6E73] max-w-xs leading-relaxed">
                  When you visit {currentPersonName} and verify physical pill counts, records will appear here.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  );
}

export default History;
