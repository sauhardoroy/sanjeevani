import React from 'react';
import { MessageCircle, ChevronRight, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { SecondaryButton, TextButton } from './Buttons';
import { evaluateMedicineStatus } from '../../lib/depletion';
import { getWhatsAppUrl } from '../../lib/whatsapp';

/**
 * MedicineCard — Content Layer (Strictly Flat)
 * Features 4px color indicator bar, traffic-light badge, clear typography, and 1-tap actions.
 */
export function MedicineCard({ medicine, onSelect, settings }) {
  const status = evaluateMedicineStatus(medicine);

  const statusColors = {
    green: {
      bar: 'bg-[#34C759]',
      badgeBg: 'bg-[#EBF9EE]',
      badgeText: 'text-[#15803D]',
      badgeBorder: 'border-[#34C759]/30',
      icon: <ShieldCheck className="w-4 h-4 text-[#34C759]" />,
      dot: '🟢'
    },
    amber: {
      bar: 'bg-[#FF9F0A]',
      badgeBg: 'bg-[#FFF8EB]',
      badgeText: 'text-[#B45309]',
      badgeBorder: 'border-[#FF9F0A]/30',
      icon: <AlertTriangle className="w-4 h-4 text-[#FF9F0A]" />,
      dot: '🟡'
    },
    red: {
      bar: 'bg-[#FF3B30]',
      badgeBg: 'bg-[#FEEFEF]',
      badgeText: 'text-[#B91C1C]',
      badgeBorder: 'border-[#FF3B30]/30',
      icon: <Clock className="w-4 h-4 text-[#FF3B30]" />,
      dot: '🔴'
    }
  };

  const currentTheme = statusColors[status.color] || statusColors.green;

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const url = getWhatsAppUrl(medicine, status, settings);
    window.open(url, '_blank');
  };

  const scheduleSummary = Array.isArray(medicine.schedule?.timeOfDay)
    ? medicine.schedule.timeOfDay.map(t => t.charAt(0) + t.slice(1).toLowerCase()).join(' & ')
    : 'Daily';

  return (
    <div 
      onClick={() => onSelect(medicine)}
      className="
        relative overflow-hidden
        bg-white rounded-[20px]
        border border-[#E5E5EA]
        shadow-apple-card
        transition-all duration-150 active:scale-[0.99]
        cursor-pointer
      "
    >
      {/* 4px Solid Traffic-Light Indicator Bar on Left Edge */}
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${currentTheme.bar}`} />

      <div className="pl-5 pr-4 py-4.5 flex flex-col gap-3">
        {/* Card Header: Title & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-[20px] font-semibold text-[#1C1C1E] tracking-tight leading-snug truncate">
              {medicine.name}
            </h3>
            {medicine.purpose && (
              <p className="text-[14px] text-[#6E6E73] font-normal mt-0.5 truncate">
                {medicine.purpose} • {scheduleSummary}
              </p>
            )}
          </div>

          {/* Traffic-Light Status Badge */}
          <div className={`
            shrink-0 flex items-center gap-1.5 px-3 py-1.5
            rounded-[10px] border ${currentTheme.badgeBg} ${currentTheme.badgeBorder}
          `}>
            <span className="text-[12px]">{currentTheme.dot}</span>
            <div className="flex flex-col text-right">
              <span className={`text-[14px] font-bold leading-tight ${currentTheme.badgeText}`}>
                {status.badgeText}
              </span>
              <span className="text-[11px] font-medium text-[#6E6E73] leading-none">
                {status.badgeSubtext}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Stock Info & Warning Line */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[14px] text-[#48484A] font-medium">
            📦 {status.fullStripsRemaining} full strip{status.fullStripsRemaining === 1 ? '' : 's'} + {status.pillsOnActiveStrip} pills in active strip
          </p>

          {status.warningLine && (
            <div className="
              p-2.5 rounded-[12px]
              bg-[#FFF8EB] border border-[#FF9F0A]/20
              text-[13.5px] text-[#92400E] font-medium leading-relaxed
              flex items-start gap-2
            ">
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <span>{status.warningLine}</span>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 border-t border-[#F2F2F7] flex items-center justify-between gap-2">
          <SecondaryButton
            variant="whatsapp"
            onClick={handleWhatsApp}
            className="!min-h-[42px] !py-2 !px-3.5 !text-[15px]"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Ping WhatsApp</span>
          </SecondaryButton>

          <TextButton
            onClick={() => onSelect(medicine)}
            className="!min-h-[42px] !py-2 !px-3 !text-[15px] font-semibold"
          >
            <span>Details</span>
            <ChevronRight className="w-4 h-4" />
          </TextButton>
        </div>
      </div>
    </div>
  );
}
