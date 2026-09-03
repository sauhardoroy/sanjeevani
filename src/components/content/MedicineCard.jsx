import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pill, 
  MessageCircle, 
  ChevronDown, 
  AlertCircle, 
  CheckCircle2,
  Trash2,
  Calendar,
  Layers,
  Info
} from 'lucide-react';
import { evaluateMedicineStatus } from '../../lib/depletion';
import { getWhatsAppUrl } from '../../lib/whatsapp';

/**
 * MedicineCard — Modern Minimalist Apple HIG Card with Inline Accordion
 * Displays all details and caregiver actions directly inside the card when expanded.
 * No modal dialog needed.
 */
export function MedicineCard({ 
  medicine, 
  settings, 
  onAudit, 
  onDelete 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = evaluateMedicineStatus(medicine);

  const statusThemes = {
    green: {
      dotColor: 'bg-[#34C759]',
      badgeBg: 'bg-[#EBF9EE]',
      badgeBorder: 'border-[#34C759]/25',
      badgeText: 'text-[#15803D]',
      label: 'Safe Supply'
    },
    amber: {
      dotColor: 'bg-[#FF9F0A]',
      badgeBg: 'bg-[#FFF8EB]',
      badgeBorder: 'border-[#FF9F0A]/30',
      badgeText: 'text-[#B45309]',
      label: 'Drop-Zone'
    },
    red: {
      dotColor: 'bg-[#FF3B30]',
      badgeBg: 'bg-[#FEEFEF]',
      badgeBorder: 'border-[#FF3B30]/30',
      badgeText: 'text-[#B91C1C]',
      label: 'Refill Now'
    }
  };

  const currentTheme = statusThemes[status.color] || statusThemes.green;

  const handleWhatsApp = (e) => {
    if (e) e.stopPropagation();
    const url = getWhatsAppUrl(medicine, status, settings);
    window.open(url, '_blank');
  };

  const scheduleSummary = Array.isArray(medicine.schedule?.timeOfDay)
    ? medicine.schedule.timeOfDay.map(t => t.charAt(0) + t.slice(1).toLowerCase()).join(' & ')
    : 'Daily';

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.3, type: 'spring', bounce: 0.1 } }}
      className="
        w-full bg-white rounded-[24px]
        border border-[#E5E5EA]
        shadow-[0_2px_12px_rgba(0,0,0,0.04)]
        overflow-hidden transition-all
      "
    >
      {/* Top Header Area (Clickable to toggle accordion) */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 pb-3.5 cursor-pointer flex flex-col gap-3.5"
      >
        {/* Row 1: Icon + Title & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Apple Squircle Icon Container */}
            <div className="
              w-11 h-11 rounded-2xl bg-[#F2F2F7]
              flex items-center justify-center shrink-0 text-[#1C1C1E]
            ">
              <Pill className="w-5 h-5 stroke-[2]" />
            </div>

            <div className="flex flex-col min-w-0">
              <h3 className="text-[19px] font-bold tracking-tight text-[#1C1C1E] leading-snug truncate">
                {medicine.name}
              </h3>
              <p className="text-[13px] font-medium text-[#8E8E93] truncate mt-0.5">
                {medicine.purpose || 'Medication'} • {scheduleSummary}
              </p>
            </div>
          </div>

          {/* Restrained Apple Status Badge */}
          <div className={`
            shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full
            border ${currentTheme.badgeBg} ${currentTheme.badgeBorder}
          `}>
            <span className={`w-2 h-2 rounded-full ${currentTheme.dotColor}`} />
            <span className={`text-[12.5px] font-bold ${currentTheme.badgeText} leading-none`}>
              {status.badgeText}
            </span>
          </div>
        </div>

        {/* Warning Notice if in Drop Zone or Refill */}
        {status.warningLine && (
          <div className="
            px-3.5 py-2.5 rounded-xl bg-[#FFF8EB] border border-[#FF9F0A]/25
            text-[12.5px] text-[#92400E] font-medium leading-relaxed
            flex items-center gap-2
          ">
            <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 stroke-[2]" />
            <span className="truncate">{status.warningLine}</span>
          </div>
        )}

        {/* Apple Health Metric Strip */}
        <div className="grid grid-cols-3 gap-2 bg-[#F8F9FB] rounded-2xl p-3 border border-[#E5E5EA]/60">
          <div className="flex flex-col items-center text-center">
            <span className="text-[10.5px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              Full Strips
            </span>
            <span className="text-[18px] font-bold text-[#1C1C1E] tabular-nums tracking-tight mt-0.5">
              {status.fullStripsRemaining}
            </span>
            <span className="text-[10.5px] text-[#8E8E93]">unopened</span>
          </div>

          <div className="flex flex-col items-center text-center border-x border-[#E5E5EA]">
            <span className="text-[10.5px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              Active Strip
            </span>
            <span className="text-[18px] font-bold text-[#1C1C1E] tabular-nums tracking-tight mt-0.5">
              {status.pillsOnActiveStrip}
            </span>
            <span className="text-[10.5px] text-[#8E8E93]">pills left</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-[10.5px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              Safe Supply
            </span>
            <span className="text-[18px] font-bold text-[#1C1C1E] tabular-nums tracking-tight mt-0.5">
              {status.safeDays}d
            </span>
            <span className="text-[10.5px] text-[#8E8E93]">remaining</span>
          </div>
        </div>

        {/* Footer Toggle Bar */}
        <div className="pt-2 border-t border-[#F2F2F7] flex items-center justify-between gap-2">
          {/* 1-Tap WhatsApp Ping */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
              bg-[#F0FDF4] hover:bg-[#DCFCE7] active:bg-[#BBF7D0]
              border border-[#25D366]/30 text-[#128C7E] text-[12px] font-semibold
              transition-colors
            "
          >
            <MessageCircle className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Ping WhatsApp</span>
          </button>

          {/* Accordion Trigger with Down Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-full
              text-[#007AFF] hover:bg-[#F2F2F7] text-[13px] font-semibold
              transition-colors
            "
          >
            <span>{isExpanded ? 'Hide Actions' : 'Actions & Details'}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex items-center"
            >
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Accordion Expandable Details & Actions Area */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="accordion-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-[#E5E5EA] bg-[#F8F9FB]"
          >
            <div className="p-5 flex flex-col gap-4">
              {/* Caregiver Actions Title */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#6E6E73] uppercase tracking-wider">
                  Caregiver Rapid Audit
                </span>
                <span className="text-[11.5px] text-[#8E8E93] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Last: {medicine.stock?.lastAuditDate || 'Today'}
                </span>
              </div>

              {/* 3 Inline Apple Action Items */}
              <div className="grid grid-cols-3 gap-2">
                {/* Action 1: Matches Expected */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAudit && onAudit(medicine, 'MATCHES_EXPECTED')}
                  className="
                    flex flex-col items-center justify-center gap-1.5
                    p-3 rounded-2xl bg-white border border-[#E5E5EA]
                    hover:border-[#34C759]/50 hover:bg-[#F0FDF4]
                    active:bg-[#DCFCE7] shadow-sm transition-all text-center
                  "
                >
                  <div className="w-9 h-9 rounded-full bg-[#EBF9EE] flex items-center justify-center text-[#15803D]">
                    <CheckCircle2 className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[12.5px] font-bold text-[#1C1C1E] leading-tight">
                    Matches Count
                  </span>
                  <span className="text-[10.5px] text-[#8E8E93] leading-tight">
                    Stock on track
                  </span>
                </motion.button>

                {/* Action 2: Discarded Early */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAudit && onAudit(medicine, 'STRIP_DISCARDED_EARLY')}
                  className="
                    flex flex-col items-center justify-center gap-1.5
                    p-3 rounded-2xl bg-white border border-[#E5E5EA]
                    hover:border-[#FF9F0A]/50 hover:bg-[#FFFBEB]
                    active:bg-[#FEF3C7] shadow-sm transition-all text-center
                  "
                >
                  <div className="w-9 h-9 rounded-full bg-[#FFF8EB] flex items-center justify-center text-[#B45309]">
                    <AlertCircle className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[12.5px] font-bold text-[#1C1C1E] leading-tight">
                    Discarded Early
                  </span>
                  <span className="text-[10.5px] text-[#8E8E93] leading-tight">
                    Log {status.pillsOnActiveStrip} lost
                  </span>
                </motion.button>

                {/* Action 3: Send Message */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWhatsApp}
                  className="
                    flex flex-col items-center justify-center gap-1.5
                    p-3 rounded-2xl bg-white border border-[#E5E5EA]
                    hover:border-[#25D366]/50 hover:bg-[#F0FDF4]
                    active:bg-[#DCFCE7] shadow-sm transition-all text-center
                  "
                >
                  <div className="w-9 h-9 rounded-full bg-[#EBF9EE] flex items-center justify-center text-[#128C7E]">
                    <MessageCircle className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[12.5px] font-bold text-[#1C1C1E] leading-tight">
                    Send Message
                  </span>
                  <span className="text-[10.5px] text-[#8E8E93] leading-tight">
                    WhatsApp Dad/Mom
                  </span>
                </motion.button>
              </div>

              {/* Extended Details Grid */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5EA] flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between text-[#6E6E73]">
                  <span>Total Available Pills:</span>
                  <span className="font-bold text-[#1C1C1E]">{status.totalRawTablets} pills</span>
                </div>
                <div className="flex items-center justify-between text-[#6E6E73]">
                  <span>Pack Size:</span>
                  <span className="font-bold text-[#1C1C1E]">{medicine.stripConfig?.tabletsPerStrip || 10} tablets / strip</span>
                </div>
                <div className="flex items-center justify-between text-[#6E6E73]">
                  <span>Abandonment Buffer:</span>
                  <span className="font-bold text-[#1C1C1E]">Safety margin: 3 pills</span>
                </div>
              </div>

              {/* Remove Medicine Option */}
              <div className="flex items-center justify-between text-xs text-[#8E8E93] pt-1">
                <span>Course: Ongoing</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Remove ${medicine.name} from tracked medicines?`)) {
                      if (onDelete) onDelete(medicine.id);
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
        )}
      </AnimatePresence>
    </motion.div>
  );
}
