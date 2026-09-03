import React, { useState } from 'react';
import { GlassTopBar } from '../components/glass/GlassTopBar';
import { PrimaryButton, SecondaryButton, TextButton } from '../components/content/Buttons';
import { evaluateMedicineStatus } from '../lib/depletion';
import { WhatsAppShareModal } from '../components/content/WhatsAppShareModal';
import { 
  CheckCircle2, 
  AlertTriangle, 
  MessageCircle, 
  Trash2, 
  Calendar, 
  Layers, 
  Pill,
  Clock
} from 'lucide-react';

/**
 * MedicineDetail — Deep-dive inspection & weekend reconciliation audit
 * Features one-tap count verification and custom WhatsApp composer.
 */
export function MedicineDetail({ 
  medicine, 
  settings, 
  onBack, 
  onAudit, 
  onDelete 
}) {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  if (!medicine) return null;

  const status = evaluateMedicineStatus(medicine);

  const handleWhatsApp = () => {
    setIsWhatsAppOpen(true);
  };

  const scheduleText = Array.isArray(medicine.schedule?.timeOfDay)
    ? medicine.schedule.timeOfDay.map(t => t.charAt(0) + t.slice(1).toLowerCase()).join(' & ')
    : 'Daily';

  const statusThemes = {
    green: {
      heroBg: 'bg-[#EBF9EE]',
      heroBorder: 'border-[#34C759]/30',
      text: 'text-[#15803D]',
      dot: '🟢',
      label: 'Safe Supply'
    },
    amber: {
      heroBg: 'bg-[#FFF8EB]',
      heroBorder: 'border-[#FF9F0A]/30',
      text: 'text-[#B45309]',
      dot: '🟡',
      label: 'Needs Attention'
    },
    red: {
      heroBg: 'bg-[#FEEFEF]',
      heroBorder: 'border-[#FF3B30]/30',
      text: 'text-[#B91C1C]',
      dot: '🔴',
      label: 'Refill Required'
    }
  };

  const theme = statusThemes[status.color] || statusThemes.green;

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-28">
      <GlassTopBar
        title={medicine.name}
        subtitle={medicine.purpose || 'Medicine Details'}
        onBack={onBack}
        rightAction={
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to remove ${medicine.name}?`)) {
                onDelete(medicine.id);
              }
            }}
            aria-label="Delete medicine"
            className="w-10 h-10 flex items-center justify-center rounded-[10px] text-[#FF3B30] active:bg-[#FF3B30]/10"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        }
      />

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Status Hero Card */}
        <div className={`
          p-5 rounded-[20px] border shadow-apple-card
          ${theme.heroBg} ${theme.heroBorder}
          flex flex-col items-center text-center gap-1.5
        `}>
          <span className="text-[28px]">{theme.dot}</span>
          <h2 className={`text-[24px] font-bold ${theme.text} tracking-tight`}>
            {status.badgeText}
          </h2>
          <span className="text-[14px] font-semibold text-[#6E6E73]">
            {theme.label} • {status.totalRawTablets} total pills available
          </span>

          {status.warningLine && (
            <div className="mt-3 p-3 rounded-[14px] bg-white/80 border border-[#FF9F0A]/30 text-[14px] text-[#92400E] font-medium leading-relaxed text-left flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
              <span>{status.warningLine}</span>
            </div>
          )}
        </div>

        {/* Current Inventory Summary */}
        <div className="bg-white rounded-[20px] border border-[#E5E5EA] p-5 shadow-apple-card flex flex-col gap-3">
          <h3 className="text-[16px] font-bold text-[#1C1C1E] border-b border-[#F2F2F7] pb-2">
            Current Physical Stock
          </h3>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-3 p-3 bg-[#F2F2F7] rounded-[14px]">
              <Layers className="w-5 h-5 text-[#007AFF] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[12px] font-medium text-[#6E6E73]">Full Strips</span>
                <strong className="text-[18px] text-[#1C1C1E]">{status.fullStripsRemaining} unopened</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#F2F2F7] rounded-[14px]">
              <Pill className="w-5 h-5 text-[#34C759] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[12px] font-medium text-[#6E6E73]">Active Strip</span>
                <strong className="text-[18px] text-[#1C1C1E]">{status.pillsOnActiveStrip} pills left</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[14px] text-[#6E6E73] pt-2 border-t border-[#F2F2F7]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#8E8E93]" />
              Schedule: <strong className="text-[#1C1C1E]">{scheduleText}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#8E8E93]" />
              Last audit: <strong className="text-[#1C1C1E]">{medicine.stock?.lastAuditDate || 'Today'}</strong>
            </span>
          </div>
        </div>

        {/* Weekend Rapid Audit Section */}
        <div className="bg-white rounded-[20px] border border-[#E5E5EA] p-5 shadow-apple-card flex flex-col gap-3">
          <div>
            <h3 className="text-[17px] font-bold text-[#1C1C1E]">
              Weekend Rapid Audit
            </h3>
            <p className="text-[14px] text-[#6E6E73] mt-0.5">
              Visiting or on call with Mom/Dad? Verify the active strip count in 1 tap:
            </p>
          </div>

          {/* Two Equal-Weight Audit Buttons */}
          <div className="flex flex-col gap-2.5 pt-1">
            <SecondaryButton
              variant="default"
              onClick={() => onAudit(medicine, 'MATCHES_EXPECTED')}
              fullWidth
              className="justify-start px-4"
            >
              <CheckCircle2 className="w-5 h-5 text-[#007AFF] shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[15px] font-bold text-[#007AFF]">Matches Expected Count</span>
                <span className="text-[12px] font-normal text-[#6E6E73]">Reaffirms current numbers and updates audit date</span>
              </div>
            </SecondaryButton>

          </div>
        </div>

        {/* WhatsApp Action */}
        <div className="pt-2">
          <PrimaryButton
            onClick={handleWhatsApp}
            fullWidth
            className="!bg-[#25D366] hover:!bg-[#20BA5A] active:!bg-[#1CA750]"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span>Send WhatsApp Reminder</span>
          </PrimaryButton>
        </div>
      </main>

      {/* Customizable WhatsApp Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        medicine={medicine}
        status={status}
        settings={settings}
      />
    </div>
  );
}
