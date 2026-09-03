import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Layers3,
  MessageCircle,
  Pill,
  ShieldCheck,
  Trash2,
  Edit3,
  Plus,
  Layers
} from 'lucide-react';

import { evaluateMedicineStatus } from '../../lib/depletion';
import { getWhatsAppUrl } from '../../lib/whatsapp';
import { RollingStepper } from './RollingStepper';

// -----------------------------------------------------------------------------
// Animation Transitions (Apple Spring Physics)
// -----------------------------------------------------------------------------

const SPRING = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

const TOUCH_SPRING = {
  type: 'spring',
  stiffness: 480,
  damping: 22,
  mass: 0.5,
};

// -----------------------------------------------------------------------------
// Status Gradients (Darker at top, merging to white at bottom)
// -----------------------------------------------------------------------------

const STATUS_THEME = {
  REFILL_NOW: {
    label: 'Refill Needed',
    dotColor: 'bg-[#FF3B30]',
    cardGradient: 'bg-gradient-to-b from-[#FFEBEB] via-[#FFF6F6] to-white',
    cardBorder: 'border-[#FF3B30]/35',
    cardShadow: 'shadow-[0_8px_30px_rgba(255,59,48,0.08),0_1px_3px_rgba(0,0,0,0.02)]',
    iconBg: 'bg-[#FF3B30]/12 text-[#FF3B30]',
    badgeBg: 'bg-[#FF3B30]/10 text-[#D32F2F] border border-[#FF3B30]/25',
    bannerBg: 'bg-[#FFF0F0] border border-[#FF3B30]/25 text-[#991B1B]',
    activeBoxHighlight: 'bg-[#FFF0F0] border border-[#FF3B30]/25 text-[#991B1B]',
  },
  ABANDONMENT_RISK: {
    label: 'Check Active Strip',
    dotColor: 'bg-[#FF9F0A]',
    cardGradient: 'bg-gradient-to-b from-[#FFF2D6] via-[#FFF9ED] to-white',
    cardBorder: 'border-[#FF9F0A]/35',
    cardShadow: 'shadow-[0_8px_30px_rgba(255,159,10,0.08),0_1px_3px_rgba(0,0,0,0.02)]',
    iconBg: 'bg-[#FF9F0A]/15 text-[#D97706]',
    badgeBg: 'bg-[#FF9F0A]/10 text-[#B45309] border border-[#FF9F0A]/25',
    bannerBg: 'bg-[#FFF9EB] border border-[#FF9F0A]/30 text-[#92400E]',
    activeBoxHighlight: 'bg-[#FFF8EB] border border-[#FF9F0A]/30 text-[#92400E]',
  },
  LOW_STOCK: {
    label: 'Running Low',
    dotColor: 'bg-[#FF9F0A]',
    cardGradient: 'bg-gradient-to-b from-[#FFF2D6] via-[#FFF9ED] to-white',
    cardBorder: 'border-[#FF9F0A]/35',
    cardShadow: 'shadow-[0_8px_30px_rgba(255,159,10,0.08),0_1px_3px_rgba(0,0,0,0.02)]',
    iconBg: 'bg-[#FF9F0A]/15 text-[#D97706]',
    badgeBg: 'bg-[#FF9F0A]/10 text-[#B45309] border border-[#FF9F0A]/25',
    bannerBg: 'bg-[#FFF9EB] border border-[#FF9F0A]/30 text-[#92400E]',
    activeBoxHighlight: 'bg-[#FFF8EB] border border-[#FF9F0A]/30 text-[#92400E]',
  },
  SAFE: {
    label: 'On Track',
    dotColor: 'bg-[#34C759]',
    cardGradient: 'bg-gradient-to-b from-[#E8F8ED] via-[#F3FBF6] to-white',
    cardBorder: 'border-[#34C759]/35',
    cardShadow: 'shadow-[0_8px_30px_rgba(52,199,89,0.08),0_1px_3px_rgba(0,0,0,0.02)]',
    iconBg: 'bg-[#34C759]/15 text-[#15803D]',
    badgeBg: 'bg-[#34C759]/10 text-[#15803D] border border-[#34C759]/25',
    bannerBg: 'bg-[#F0FDF4] border border-[#34C759]/25 text-[#166534]',
    activeBoxHighlight: 'bg-[#F0FDF4] border border-[#34C759]/25 text-[#166534]',
  },
};

function formatCount(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0';
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(1);
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function MedicineCard({
  medicine,
  settings,
  onAudit,
  onDelete,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isEditingCount, setIsEditingCount] = useState(false);

  const status = useMemo(() => {
    if (!medicine) return null;
    return evaluateMedicineStatus(medicine);
  }, [medicine]);

  if (!medicine || !status) {
    return null;
  }

  const theme = STATUS_THEME[status.type] || STATUS_THEME.SAFE;

  const tabletsPerStrip =
    Number(medicine.stripConfig?.tabletsPerStrip) ||
    Number(medicine.tabletsPerStrip) ||
    10;

  const abandonmentBuffer =
    Number(medicine.stripConfig?.abandonmentBuffer) ||
    Number(settings?.abandonmentBuffer) ||
    3;

  const pillsOnActiveStrip = Number(status.pillsOnActiveStrip) || 0;
  const fullStripsRemaining = Number(status.fullStripsRemaining) || 0;
  const openStrips = status.openStripsRemaining || [pillsOnActiveStrip];
  const safeDays = Number(status.safeDays) || 0;
  const abandonmentRisk = status.type === 'ABANDONMENT_RISK';
  const critical = status.type === 'REFILL_NOW';
  const hasMultipleOpen = openStrips.length > 1;

  // Local state for Count Adjustment Mode
  const [editOpenStrips, setEditOpenStrips] = useState([...openStrips]);
  const [editFullStrips, setEditFullStrips] = useState(fullStripsRemaining);

  const startEditing = (e) => {
    if (e) e.stopPropagation();
    setEditOpenStrips([...openStrips]);
    setEditFullStrips(fullStripsRemaining);
    setIsEditingCount(true);
  };

  const handleSetStripCount = (stripIdx, count) => {
    setEditOpenStrips(prev => {
      const next = [...prev];
      next[stripIdx] = Math.max(0, Math.min(tabletsPerStrip, count));
      return next;
    });
  };

  const handleAddStrip = () => {
    setEditOpenStrips(prev => [...prev, tabletsPerStrip]);
  };

  const handleRemoveStrip = (stripIdx) => {
    if (editOpenStrips.length <= 1) return;
    setEditOpenStrips(prev => prev.filter((_, idx) => idx !== stripIdx));
  };

  const handleSaveCountAdjusted = async () => {
    if (!onAudit || isAuditing) return;
    setIsAuditing(true);
    try {
      await onAudit(medicine, 'COUNT_ADJUSTED', {
        openStrips: editOpenStrips,
        fullStripsDelivered: editFullStrips,
      });
      setIsEditingCount(false);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAudit = async (outcome) => {
    if (!onAudit || isAuditing) return;
    setIsAuditing(true);
    try {
      await onAudit(medicine, outcome);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleWhatsApp = (e) => {
    if (e) e.stopPropagation();
    if (!medicine) return;
    const url = getWhatsAppUrl(medicine, status, settings);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.article
      layout
      transition={SPRING}
      className={`
        overflow-hidden rounded-[26px]
        border ${theme.cardBorder}
        ${theme.cardGradient}
        ${theme.cardShadow}
        transition-all duration-300
      `}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Outer Card Header (Tinted at top, merges to white at bottom) */}
      {/* ------------------------------------------------------------------ */}

      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* Top Row: Squircle Pill Icon + Name + Status Pill */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${theme.iconBg} shadow-xs`}>
              <Pill size={19} strokeWidth={2.2} />
            </div>

            <h3 className="truncate text-[17px] font-bold tracking-tight text-[#1C1C1E]">
              {medicine.name}
            </h3>
          </div>

          {/* Frosted Apple Status Pill */}
          <div className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 ${theme.badgeBg} text-xs font-bold shadow-xs`}>
            <span className={`w-2 h-2 rounded-full ${theme.dotColor}`} />
            <span>{theme.label}</span>
          </div>
        </div>

        {/* Short Message Banner with Status Tint */}
        {status.warningLine ? (
          <div className={`rounded-xl ${theme.bannerBg} px-3.5 py-2 text-[12px] font-medium leading-snug flex items-center gap-2 shadow-2xs`}>
            <AlertCircle size={15} className={`shrink-0 ${critical ? 'text-[#FF3B30]' : 'text-[#FF9F0A]'}`} />
            <span>{status.warningLine}</span>
          </div>
        ) : (
          <div className={`rounded-xl ${theme.bannerBg} px-3.5 py-2 text-[12px] font-medium leading-snug flex items-center gap-2 shadow-2xs`}>
            <Check size={15} className="shrink-0 text-[#34C759] stroke-[2.5]" />
            <span>Safe supply on track: <strong>{safeDays} days</strong> remaining.</span>
          </div>
        )}

        {/* Action Row: WhatsApp & Single Unified Expand Toggle (White surface) */}
        <div className="pt-1.5 border-t border-[#E5E5EA]/70 flex items-center justify-between gap-2">
          {/* WhatsApp Pill */}
          <motion.button
            whileTap={{ scale: 0.94, y: 1 }}
            transition={TOUCH_SPRING}
            type="button"
            onClick={handleWhatsApp}
            className="
              inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full
              border border-[#E5E5EA] bg-white hover:bg-[#F8F9FB]
              text-[#1C1C1E] text-[12px] font-semibold transition-colors
              shadow-xs active:shadow-none select-none
            "
          >
            <MessageCircle size={14} strokeWidth={2.2} />
            <span>WhatsApp</span>
          </motion.button>

          {/* Unified Details & Actions Expand Toggle */}
          <motion.button
            whileTap={{ scale: 0.94, y: 1 }}
            transition={TOUCH_SPRING}
            type="button"
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (isExpanded) setIsEditingCount(false);
            }}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full
              border text-[12px] font-semibold transition-all select-none shadow-xs
              ${isExpanded 
                ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]' 
                : 'bg-white hover:bg-[#F8F9FB] text-[#1C1C1E] border-[#E5E5EA]'
              }
            `}
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Hide Details' : 'Details & Actions'}</span>
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={SPRING}
              className="flex items-center"
            >
              <ChevronDown size={14} strokeWidth={2.5} />
            </motion.span>
          </motion.button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Expansion Menu: Professional, Minimalist, Black & White Drawer */}
      {/* ------------------------------------------------------------------ */}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="details-dropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="overflow-hidden border-t border-[#E5E5EA] bg-[#F8F9FB]"
          >
            <div className="p-4 sm:p-5 flex flex-col gap-3">
              
              {/* 1. Metric Summary Pod with Subtle Active Strip Highlight */}
              <div className="rounded-2xl border border-[#E5E5EA] bg-white p-3 shadow-xs">
                <div className="grid grid-cols-3 gap-2 text-center">
                  
                  {/* Highlighted Active Strip Box */}
                  <div className={`p-2.5 rounded-xl ${theme.activeBoxHighlight} flex flex-col justify-center`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-85">
                      {hasMultipleOpen ? 'Open Strips' : 'Active Strip'}
                    </span>
                    <span className="text-[20px] font-bold tabular-nums leading-tight mt-0.5 block">
                      {formatCount(pillsOnActiveStrip)}
                      <span className="text-[11px] font-medium ml-1 opacity-80">
                        {hasMultipleOpen ? `pills (${openStrips.length})` : 'pills'}
                      </span>
                    </span>
                  </div>

                  {/* Unopened: Clean Neutral Apple Black & White */}
                  <div className="p-2.5 rounded-xl bg-[#F8F9FB] border border-[#E5E5EA] flex flex-col justify-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                      Unopened
                    </span>
                    <span className="text-[20px] font-bold text-[#1C1C1E] tabular-nums leading-tight mt-0.5 block">
                      {fullStripsRemaining}
                      <span className="text-[11px] font-normal text-[#8E8E93] ml-1">strips</span>
                    </span>
                  </div>

                  {/* Safe Supply: Clean Neutral Apple Black & White */}
                  <div className="p-2.5 rounded-xl bg-[#F8F9FB] border border-[#E5E5EA] flex flex-col justify-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                      Safe Supply
                    </span>
                    <span className="text-[20px] font-bold text-[#1C1C1E] tabular-nums leading-tight mt-0.5 block">
                      {safeDays}
                      <span className="text-[11px] font-normal text-[#8E8E93] ml-1">days</span>
                    </span>
                  </div>
                </div>

                {/* Tactile Blister Pack "Press-Through" Visualizer */}
                <div className="mt-3.5 pt-3 border-t border-[#F2F2F7] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
                      {hasMultipleOpen ? 'Active Blister Foils in Use' : 'Active Blister Foil'}
                    </span>
                    <span className="text-[11px] text-[#8E8E93] font-medium">
                      {tabletsPerStrip} tabs / foil
                    </span>
                  </div>

                  {openStrips.map((stripPills, sIdx) => {
                    const isDropZone = stripPills <= abandonmentBuffer && stripPills > 0;
                    return (
                      <div
                        key={sIdx}
                        className={`p-3 rounded-xl border flex flex-col gap-2 ${
                          isDropZone 
                            ? 'bg-[#FFFDF5] border-[#FF9F0A]/30' 
                            : 'bg-[#F8F9FB] border-[#E5E5EA]'
                        }`}
                      >
                        {/* Header: Strip info + Low indicator */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-[#1C1C1E]">
                              {hasMultipleOpen ? `Strip #${sIdx + 1}` : 'Current Strip'}
                            </span>
                            <span className="text-[11.5px] text-[#8E8E93]">
                              {stripPills} of {tabletsPerStrip} pills remaining
                            </span>
                          </div>

                          {isDropZone && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#B45309] bg-[#FFF8EB] border border-[#FF9F0A]/35 px-2 py-0.5 rounded-full shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]" />
                              <span>Drop Zone</span>
                            </span>
                          )}
                        </div>

                        {/* Minimalist Apple Blister Pack Visualizer */}
                        <div className="rounded-xl border border-[#E5E5EA] bg-white p-2.5 shadow-2xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {Array.from({ length: tabletsPerStrip }).map((_, pIdx) => {
                              const filled = pIdx < stripPills;
                              const inBuffer = pIdx < abandonmentBuffer;

                              return (
                                <motion.div
                                  key={pIdx}
                                  whileTap={{ scale: 0.85 }}
                                  transition={TOUCH_SPRING}
                                  className={`
                                    h-5.5 w-5.5 rounded-full flex items-center justify-center shrink-0 select-none transition-all
                                    ${filled
                                      ? inBuffer && isDropZone
                                        ? 'bg-[#FFF8EB] border border-[#FF9F0A]/50 text-[#B45309]'
                                        : 'bg-[#F2F2F7] border border-[#E5E5EA] text-[#1C1C1E]'
                                      : 'border border-dashed border-[#D1D1D6] bg-transparent'
                                    }
                                  `}
                                  title={filled ? `Pill #${pIdx + 1} intact` : `Pill #${pIdx + 1} consumed`}
                                >
                                  {filled && (
                                    <div
                                      className={`h-2 w-2 rounded-full ${
                                        inBuffer && isDropZone ? 'bg-[#FF9F0A]' : 'bg-[#1C1C1E]'
                                      }`}
                                    />
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Interactive Match & Reconcile Mode (When Count is Mismatching) */}
              <AnimatePresence initial={false}>
                {isEditingCount ? (
                  <motion.div
                    key="count-editor"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={SPRING}
                    className="rounded-2xl bg-white border border-[#E5E5EA] p-3.5 flex flex-col gap-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-[#F2F2F7] pb-2">
                      <div>
                        <h4 className="text-[13px] font-bold text-[#1C1C1E]">
                          Match Physical Count
                        </h4>
                        <p className="text-[11.5px] text-[#8E8E93]">
                          Tap physical blister bubbles to match your strip:
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingCount(false)}
                        className="text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E]"
                      >
                        Close
                      </button>
                    </div>

                    {/* Interactive Editor for each open strip */}
                    <div className="flex flex-col gap-2.5">
                      {editOpenStrips.map((stripPills, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 bg-[#F8F9FB] rounded-xl border border-[#E5E5EA] flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-[#1C1C1E]">
                              Strip #{sIdx + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-bold text-[#1C1C1E] tabular-nums">
                                {stripPills} / {tabletsPerStrip} pills
                              </span>
                              {editOpenStrips.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStrip(sIdx)}
                                  className="text-[#FF3B30] hover:text-red-700 p-0.5"
                                  title="Remove this strip"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Minimalist Tactile Selector */}
                          <div className="rounded-xl border border-[#E5E5EA] bg-white p-2.5 shadow-2xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              {Array.from({ length: tabletsPerStrip }).map((_, pIdx) => {
                                const filled = pIdx < stripPills;
                                return (
                                  <motion.button
                                    key={pIdx}
                                    type="button"
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() =>
                                      handleSetStripCount(
                                        sIdx,
                                        filled && pIdx === stripPills - 1 ? pIdx : pIdx + 1
                                      )
                                    }
                                    className={`
                                      h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all
                                      ${filled
                                        ? 'bg-[#1C1C1E] text-white shadow-xs'
                                        : 'border border-dashed border-[#D1D1D6] bg-transparent hover:bg-[#F2F2F7]'
                                      }
                                    `}
                                    aria-label={`Set strip ${sIdx + 1} to ${pIdx + 1} pills`}
                                  >
                                    {filled ? (
                                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                                    ) : null}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Found Another Open Strip Button */}
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={handleAddStrip}
                      className="
                        flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl
                        border border-dashed border-[#CBD5E1] bg-[#F8F9FB] text-[#1C1C1E]
                        text-[12px] font-semibold hover:bg-[#F2F2F7] transition-colors
                      "
                    >
                      <Plus size={14} />
                      <span>Found Another Open Strip</span>
                    </motion.button>

                    {/* Unopened Full Strips Stepper */}
                    <div className="p-3 bg-[#F8F9FB] rounded-xl border border-[#E5E5EA] flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[12px] font-bold text-[#1C1C1E] block">
                          Unopened Full Strips
                        </span>
                        <span className="text-[11px] text-[#8E8E93]">
                          Full strips in medicine box
                        </span>
                      </div>
                      <RollingStepper
                        value={editFullStrips}
                        onChange={setEditFullStrips}
                        min={0}
                        max={30}
                        unit="strips"
                      />
                    </div>

                    {/* Save & Reconcile Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingCount(false)}
                        className="px-4 py-2 rounded-full text-xs font-semibold text-[#8E8E93] hover:bg-[#F2F2F7]"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleSaveCountAdjusted}
                        className="px-5 py-2 rounded-full bg-[#1C1C1E] text-white text-xs font-bold shadow-xs active:scale-95"
                      >
                        Save & Match Count
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  /* 3. Professional, Minimalist, Black & White Action Buttons */
                  <div className="grid grid-cols-3 gap-2">
                    {/* Count Matches */}
                    <motion.button
                      whileTap={{ scale: 0.95, y: 1 }}
                      transition={TOUCH_SPRING}
                      type="button"
                      onClick={() => handleAudit('MATCHES_EXPECTED')}
                      disabled={isAuditing}
                      className="
                        min-h-[46px] px-2 py-2 rounded-xl
                        border border-[#E5E5EA] bg-white hover:bg-[#F2F2F7] active:bg-[#E5E5EA]
                        text-[#1C1C1E] text-[12px] font-semibold
                        flex flex-col items-center justify-center gap-1 shadow-xs transition-colors
                      "
                    >
                      <CheckCircle2 size={16} className="text-[#1C1C1E] shrink-0 stroke-[2.2]" />
                      <span>Count Matches</span>
                    </motion.button>

                    {/* Adjust / Match Strips (Fix Mismatch) */}
                    <motion.button
                      whileTap={{ scale: 0.95, y: 1 }}
                      transition={TOUCH_SPRING}
                      type="button"
                      onClick={startEditing}
                      disabled={isAuditing}
                      className="
                        min-h-[46px] px-2 py-2 rounded-xl
                        border border-[#E5E5EA] bg-white hover:bg-[#F2F2F7] active:bg-[#E5E5EA]
                        text-[#1C1C1E] text-[12px] font-semibold
                        flex flex-col items-center justify-center gap-1 shadow-xs transition-colors
                      "
                    >
                      <Edit3 size={16} className="text-[#1C1C1E] shrink-0 stroke-[2.2]" />
                      <span>Match Count</span>
                    </motion.button>

                    {/* Discarded Early */}
                    <motion.button
                      whileTap={{ scale: 0.95, y: 1 }}
                      transition={TOUCH_SPRING}
                      type="button"
                      onClick={() => handleAudit('STRIP_DISCARDED_EARLY')}
                      disabled={isAuditing}
                      className="
                        min-h-[46px] px-2 py-2 rounded-xl
                        border border-[#E5E5EA] bg-white hover:bg-[#F2F2F7] active:bg-[#E5E5EA]
                        text-[#1C1C1E] text-[12px] font-semibold
                        flex flex-col items-center justify-center gap-1 shadow-xs transition-colors
                      "
                    >
                      <AlertCircle size={16} className="text-[#1C1C1E] shrink-0 stroke-[2.2]" />
                      <span>Discarded Early</span>
                    </motion.button>
                  </div>
                )}
              </AnimatePresence>

              {/* Audit Progress Feedback */}
              <AnimatePresence>
                {isAuditing && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center justify-center gap-2 py-1 text-xs text-[#8E8E93]"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="h-3.5 w-3.5 rounded-full border-2 border-[#E5E5EA] border-t-[#1C1C1E]"
                    />
                    <span>Updating inventory…</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 4. Remove Medicine */}
              {onDelete && (
                <div className="pt-1 flex items-center justify-end text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Remove ${medicine.name} from tracked medicines?`)) {
                        onDelete(medicine.id);
                      }
                    }}
                    className="text-[#FF3B30] hover:underline font-semibold flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Delete Medicine</span>
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default MedicineCard;