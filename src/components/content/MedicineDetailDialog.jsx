import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  MessageCircle, 
  Trash2, 
  Clock, 
  Calendar, 
  Layers, 
  Pill,
  ShieldCheck
} from 'lucide-react';
import { evaluateMedicineStatus } from '../../lib/depletion';
import { getWhatsAppUrl } from '../../lib/whatsapp';
import { getMedicineImage } from '../../lib/storage';

const spring = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
  mass: 0.7,
};

/**
 * MedicineDetailDialog — Modern In-Page Animated Modal
 * Features concentric rounded geometry, rich visual hero, tactile audit options,
 * and 1-tap WhatsApp deep link on the same page.
 */
export function MedicineDetailDialog({ 
  medicine, 
  isOpen, 
  onClose, 
  onAudit, 
  onDelete, 
  settings 
}) {
  if (!medicine) return null;

  const status = evaluateMedicineStatus(medicine);
  const imageUrl = getMedicineImage(medicine);

  const handleWhatsApp = () => {
    const url = getWhatsAppUrl(medicine, status, settings);
    window.open(url, '_blank');
  };

  const scheduleText = Array.isArray(medicine.schedule?.timeOfDay)
    ? medicine.schedule.timeOfDay.map(t => t.charAt(0) + t.slice(1).toLowerCase()).join(' & ')
    : 'Daily';

  const statusThemes = {
    green: {
      badgeBg: 'bg-[#34C759]',
      text: 'text-[#15803D]',
      dot: '🟢',
      label: 'Safe Supply'
    },
    amber: {
      badgeBg: 'bg-[#FF9F0A]',
      text: 'text-[#B45309]',
      dot: '🟡',
      label: 'Drop-Zone Alert'
    },
    red: {
      badgeBg: 'bg-[#FF3B30]',
      text: 'text-[#B91C1C]',
      dot: '🔴',
      label: 'Refill Required'
    }
  };

  const currentTheme = statusThemes[status.color] || statusThemes.green;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Scrim with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Dialog Container (Concentric 24px/28px radius) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={spring}
            className="
              relative w-full max-w-lg bg-white rounded-3xl overflow-hidden
              border border-black/10 shadow-2xl z-10 flex flex-col my-auto max-h-[90vh]
            "
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="
                absolute top-3.5 right-3.5 z-30
                flex h-9 w-9 items-center justify-center
                bg-black/50 hover:bg-black/75 active:scale-90
                rounded-full border border-white/20 text-white
                backdrop-blur-md transition-all
              "
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Visual Image Header */}
            <div className="relative h-44 sm:h-48 w-full shrink-0 overflow-hidden bg-slate-900">
              <motion.img
                src={imageUrl}
                alt={medicine.name}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

              {/* Floating Top Badge */}
              <div className="absolute top-3.5 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
                <span>{currentTheme.dot}</span>
                <span>{status.badgeText}</span>
              </div>

              {/* Title & Subtitle Overlaid on Image */}
              <div className="absolute bottom-3.5 left-5 right-5">
                <p className="text-[#007AFF] bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-md inline-block text-[11px] font-bold tracking-wider uppercase mb-1 shadow-sm">
                  {medicine.purpose || 'Medication'} • {scheduleText}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  {medicine.name}
                </h2>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex flex-col gap-4">
              {/* Drop-Zone Warning Banner (if Amber or Red) */}
              {status.warningLine && (
                <div className="
                  p-3.5 rounded-2xl
                  bg-[#FFF8EB] border border-[#FF9F0A]/30
                  text-[13.5px] text-[#92400E] font-medium leading-relaxed
                  flex items-start gap-2.5 shadow-sm
                ">
                  <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#B45309] block mb-0.5">Caregiver Notice</span>
                    <span>{status.warningLine}</span>
                  </div>
                </div>
              )}

              {/* Modern Cohesive Stock Cards (Concentric 2-column) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F8F9FB] border border-[#E5E5EA] flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center gap-1.5 text-[#6E6E73] text-[12px] font-medium">
                    <Layers className="w-4 h-4 text-[#007AFF]" />
                    <span>Full Strips</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#1C1C1E] tracking-tight">
                      {status.fullStripsRemaining}
                    </span>
                    <span className="text-xs text-[#6E6E73]">unopened</span>
                  </div>
                  <span className="text-[11.5px] text-[#8E8E93]">
                    {medicine.stripConfig?.tabletsPerStrip || 10} tabs / strip
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FB] border border-[#E5E5EA] flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center gap-1.5 text-[#6E6E73] text-[12px] font-medium">
                    <Pill className="w-4 h-4 text-[#34C759]" />
                    <span>Active Strip</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#1C1C1E] tracking-tight">
                      {status.pillsOnActiveStrip}
                    </span>
                    <span className="text-xs text-[#6E6E73]">pills left</span>
                  </div>
                  <span className="text-[11.5px] text-[#8E8E93]">
                    {status.totalRawTablets} total pills left
                  </span>
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-[#E5E5EA] my-1" />

              {/* Weekend Rapid Audit Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-[#1C1C1E] uppercase tracking-wider">
                    Weekend Rapid Audit
                  </p>
                  <span className="text-[11.5px] text-[#8E8E93] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Last: {medicine.stock?.lastAuditDate || 'Today'}
                  </span>
                </div>
                <p className="text-[13px] text-[#6E6E73] -mt-1 mb-1">
                  On a phone check or visiting Dad? Tap one button to update reality:
                </p>

                {/* Audit Buttons with Spring Tap Animation */}
                <div className="grid grid-cols-1 gap-2.5">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onAudit(medicine, 'MATCHES_EXPECTED');
                      onClose();
                    }}
                    className="
                      p-3 rounded-xl border border-[#007AFF]/30 bg-[#F0F7FF]
                      hover:bg-[#E0EFFF] active:bg-[#D0E5FF]
                      flex items-center gap-3 text-left transition-colors shadow-sm
                    "
                  >
                    <div className="w-8 h-8 rounded-full bg-[#007AFF]/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#007AFF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-bold text-[#007AFF] block leading-snug">
                        Matches Expected Count
                      </span>
                      <span className="text-[12px] text-[#6E6E73] block leading-tight">
                        Pills match schedule. Updates audit timestamp.
                      </span>
                    </div>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onAudit(medicine, 'STRIP_DISCARDED_EARLY');
                      onClose();
                    }}
                    className="
                      p-3 rounded-xl border border-[#FF9F0A]/40 bg-[#FFFBEB]
                      hover:bg-[#FEF3C7] active:bg-[#FDE68A]
                      flex items-center gap-3 text-left transition-colors shadow-sm
                    "
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FF9F0A]/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-bold text-[#B45309] block leading-snug">
                        Strip Discarded Early
                      </span>
                      <span className="text-[12px] text-[#6E6E73] block leading-tight">
                        Logs remaining {status.pillsOnActiveStrip} pills lost; opens fresh strip.
                      </span>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* 1-Tap WhatsApp Reminder Button */}
              <div className="pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={spring}
                  onClick={handleWhatsApp}
                  className="
                    w-full min-h-[48px] px-5 py-3 rounded-xl
                    bg-gradient-to-r from-[#25D366] to-[#128C7E]
                    text-white font-semibold text-[15px] shadow-md
                    flex items-center justify-center gap-2
                    hover:opacity-95 transition-all
                  "
                >
                  <MessageCircle className="w-5 h-5 fill-white/20 stroke-[2.2]" />
                  <span>Send WhatsApp Reminder to {settings?.grandparentsName || 'Mom & Dad'}</span>
                </motion.button>
              </div>

              {/* Footer: Delete Option */}
              <div className="pt-1 flex items-center justify-between text-xs text-[#8E8E93]">
                <span>Project Sanjeevani</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete ${medicine.name} from tracked medicines?`)) {
                      onDelete(medicine.id);
                      onClose();
                    }
                  }}
                  className="text-[#FF3B30] hover:underline flex items-center gap-1 font-medium p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Medicine</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
