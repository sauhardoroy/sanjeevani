import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, ChevronRight, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { evaluateMedicineStatus } from '../../lib/depletion';
import { getWhatsAppUrl } from '../../lib/whatsapp';
import { getMedicineImage } from '../../lib/storage';

/**
 * MedicineCard — Modern Expandable Card for Home Dashboard
 * Inspired by Watermelon UI Profile Card: rich visual imagery, smooth hover scaling,
 * dark gradient overlay, and floating traffic-light status pill.
 */
export function MedicineCard({ medicine, onSelect, settings }) {
  const status = evaluateMedicineStatus(medicine);
  const imageSrc = getMedicineImage(medicine);

  const statusThemes = {
    green: {
      bar: 'bg-[#34C759]',
      badgeBg: 'bg-[#34C759]/90 text-white',
      dot: '🟢',
      label: 'Safe'
    },
    amber: {
      bar: 'bg-[#FF9F0A]',
      badgeBg: 'bg-[#FF9F0A]/95 text-white',
      dot: '🟡',
      label: 'Call Grandparents'
    },
    red: {
      bar: 'bg-[#FF3B30]',
      badgeBg: 'bg-[#FF3B30]/95 text-white',
      dot: '🔴',
      label: 'Refill Now'
    }
  };

  const currentTheme = statusThemes[status.color] || statusThemes.green;

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const url = getWhatsAppUrl(medicine, status, settings);
    window.open(url, '_blank');
  };

  const scheduleSummary = Array.isArray(medicine.schedule?.timeOfDay)
    ? medicine.schedule.timeOfDay.map(t => t.charAt(0) + t.slice(1).toLowerCase()).join(' & ')
    : 'Daily';

  return (
    <motion.div
      onClick={() => onSelect(medicine)}
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      className="
        cursor-pointer relative h-60 w-full overflow-hidden
        rounded-2xl border border-black/10 shadow-md group
        transition-all duration-300
      "
    >
      {/* Background Image with Hover Scale */}
      <motion.img
        src={imageSrc}
        alt={medicine.name}
        className="absolute inset-0 h-full w-full object-cover"
        variants={{
          hover: { scale: 1.06 }
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

      {/* Top Bar: 4px Accent Indicator & Status Pill */}
      <div className="absolute top-0 inset-x-0 p-3.5 flex items-center justify-between z-10">
        {/* Traffic Light Status Capsule */}
        <div className={`
          flex items-center gap-1.5 px-3 py-1 rounded-full
          backdrop-blur-md text-xs font-bold tracking-wide shadow-md
          border border-white/25 ${currentTheme.badgeBg}
        `}>
          <span>{currentTheme.dot}</span>
          <span>{status.badgeText}</span>
        </div>

        {/* Quick Stock Indicator Badge */}
        <div className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium">
          {status.fullStripsRemaining} strips • {status.pillsOnActiveStrip} pills
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 w-full z-10 flex flex-col gap-2">
        <div>
          {/* Subtitle / Category */}
          <p className="text-sky-300 text-xs font-bold tracking-wider uppercase mb-0.5 drop-shadow-sm">
            {medicine.purpose || 'Medication'} • {scheduleSummary}
          </p>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug drop-shadow-md">
            {medicine.name}
          </h3>
        </div>

        {/* Warning Badge if Amber or Red */}
        {status.warningLine ? (
          <div className="
            py-1 px-2.5 rounded-lg bg-[#FF9F0A]/25 backdrop-blur-sm border border-[#FF9F0A]/40
            text-amber-200 text-xs font-medium flex items-center gap-1.5
          ">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#FF9F0A]" />
            <span className="truncate">{status.warningLine}</span>
          </div>
        ) : (
          <p className="text-white/70 text-xs">
            Safe supply: {status.safeDays} days remaining
          </p>
        )}

        {/* Action Row */}
        <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2">
          {/* 1-Tap WhatsApp Ping right from card */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
              bg-[#25D366]/90 hover:bg-[#25D366] text-white text-xs font-bold
              backdrop-blur-sm shadow-sm active:scale-95 transition-all
            "
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
            <span>Ping WhatsApp</span>
          </button>

          {/* Tap hint */}
          <div className="flex items-center gap-0.5 text-white/80 group-hover:text-white text-xs font-semibold transition-colors">
            <span>Tap for Audit</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
