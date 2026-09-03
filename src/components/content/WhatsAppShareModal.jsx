import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MessageCircle, 
  Phone, 
  RotateCcw, 
  Send, 
  Sparkles,
  User,
  Users
} from 'lucide-react';
import { buildReminderMessage, getCustomWhatsAppUrl } from '../../lib/whatsapp';

const SPRING = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

/**
 * WhatsAppShareModal — Customizable WhatsApp Message Composer
 * Allows Dad to edit the text freely, switch between helpful presets, or type any custom note.
 */
export function WhatsAppShareModal({
  isOpen,
  onClose,
  medicine,
  status,
  settings,
}) {
  const [activePreset, setActivePreset] = useState('DEFAULT');
  const [customText, setCustomText] = useState('');
  const [phone, setPhone] = useState(settings?.grandparentsPhone || '');

  // Update text when medicine or preset changes
  useEffect(() => {
    if (medicine && isOpen) {
      setCustomText(buildReminderMessage(medicine, status, settings, activePreset));
      setPhone(settings?.grandparentsPhone || '');
    }
  }, [medicine, status, settings, activePreset, isOpen]);

  if (!isOpen || !medicine) return null;

  const handleSelectPreset = (presetKey) => {
    setActivePreset(presetKey);
    setCustomText(buildReminderMessage(medicine, status, settings, presetKey));
  };

  const handleSend = (e) => {
    e.preventDefault();
    const url = getCustomWhatsAppUrl(phone, customText);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  const recipientLabel = medicine.recipient === 'GRANDFATHER'
    ? (settings?.grandfatherName || 'Grandfather')
    : (settings?.grandmotherName || 'Grandmother');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          transition={SPRING}
          className="
            relative z-10 w-full max-w-md
            rounded-[32px] border border-[#E5E5EA] bg-white
            p-5 sm:p-6 shadow-2xl overflow-hidden
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F2F2F7] pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#25D366]/10 text-[#25D366] shadow-xs">
                <MessageCircle size={20} strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#1C1C1E] tracking-tight">
                  WhatsApp Message
                </h3>
                <p className="text-[11.5px] text-[#8E8E93]">
                  {medicine.name} for {recipientLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
            >
              <X size={16} strokeWidth={2.4} />
            </button>
          </div>

          <form onSubmit={handleSend} className="flex flex-col gap-4">
            {/* Preset Quick Chips */}
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8E8E93] block mb-1.5">
                Quick Template Presets
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('DEFAULT')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    activePreset === 'DEFAULT'
                      ? 'bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-xs'
                      : 'bg-[#F8F9FB] text-[#3A3A3C] border-[#E5E5EA] hover:bg-[#F2F2F7]'
                  }`}
                >
                  Daily Check-in
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('REFILL')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    activePreset === 'REFILL'
                      ? 'bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-xs'
                      : 'bg-[#F8F9FB] text-[#3A3A3C] border-[#E5E5EA] hover:bg-[#F2F2F7]'
                  }`}
                >
                  Refill Alert
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('SIBLING')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    activePreset === 'SIBLING'
                      ? 'bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-xs'
                      : 'bg-[#F8F9FB] text-[#3A3A3C] border-[#E5E5EA] hover:bg-[#F2F2F7]'
                  }`}
                >
                  Ask Sibling to Buy
                </button>
              </div>
            </div>

            {/* Custom Editable Message Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="custom-whatsapp-text" className="text-[10.5px] font-bold uppercase tracking-wider text-[#8E8E93]">
                  Message Content (Fully Editable)
                </label>
                <span className="text-[10.5px] text-[#8E8E93]">
                  {customText.length} chars
                </span>
              </div>
              <textarea
                id="custom-whatsapp-text"
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type your custom message..."
                className="
                  w-full rounded-2xl border border-[#E5E5EA] bg-[#F8F9FB]
                  p-3 text-[13px] text-[#1C1C1E] leading-relaxed
                  focus:bg-white focus:border-[#25D366] focus:outline-none
                  transition-all resize-none shadow-2xs
                "
              />
            </div>

            {/* Optional Recipient Phone Number */}
            <div className="rounded-2xl bg-[#F8F9FB] border border-[#E5E5EA] p-3 flex items-center gap-2.5">
              <Phone size={15} className="text-[#8E8E93] shrink-0" />
              <div className="flex-1 min-w-0">
                <label htmlFor="whatsapp-phone-input" className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] block">
                  Send To (Phone Number or leave blank to pick contact)
                </label>
                <input
                  id="whatsapp-phone-input"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210 (optional)"
                  className="w-full text-xs font-semibold text-[#1C1C1E] bg-transparent focus:outline-none placeholder:text-[#C7C7CC]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-full border border-[#E5E5EA] bg-white text-[#1C1C1E] text-xs font-bold hover:bg-[#F2F2F7] transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="
                  flex-2 py-3 px-5 rounded-full
                  bg-[#25D366] hover:bg-[#1EBE5D] text-white
                  text-xs font-bold shadow-xs flex items-center justify-center gap-2
                  transition-transform active:scale-96
                "
              >
                <Send size={14} />
                <span>Open in WhatsApp</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default WhatsAppShareModal;
