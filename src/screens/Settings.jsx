import React, { useState } from 'react';
import { GlassTopBar } from '../components/glass/GlassTopBar';
import { PrimaryButton, SecondaryButton } from '../components/content/Buttons';
import { User, Phone, Users, RotateCcw, Smartphone, Shield } from 'lucide-react';

/**
 * Settings Screen — Content Layer (Flat iOS Grouped Style)
 * Houses Dad's caregiver preferences, WhatsApp configuration, and demo reset.
 */
export function Settings({ 
  settings, 
  onUpdateSettings, 
  onResetData, 
  onShowToast 
}) {
  const [caregiverName, setCaregiverName] = useState(settings?.caregiverName || 'Dad');
  const [grandparentsName, setGrandparentsName] = useState(settings?.grandparentsName || 'Mom & Dad');
  const [grandparentsPhone, setGrandparentsPhone] = useState(settings?.grandparentsPhone || '');

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateSettings({
      caregiverName: caregiverName.trim() || 'Dad',
      grandparentsName: grandparentsName.trim() || 'Mom & Dad',
      grandparentsPhone: grandparentsPhone.trim()
    });
    onShowToast('Settings updated successfully');
  };

  const handleReset = () => {
    if (window.confirm('Reset all medicines and audit logs back to initial demo data?')) {
      onResetData();
      setCaregiverName('Dad');
      setGrandparentsName('Mom & Dad');
      setGrandparentsPhone('+91 98765 43210');
      onShowToast('Restored demo data');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-28">
      <GlassTopBar
        title="Settings"
        subtitle="Caregiver preferences & WhatsApp link"
      />

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-5">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Group 1: Profile & Family Names */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold text-[#6E6E73] uppercase tracking-wider px-2">
              Family & Greetings
            </span>
            <div className="bg-white rounded-[20px] border border-[#E5E5EA] shadow-apple-card overflow-hidden divide-y divide-[#E5E5EA]">
              {/* Caregiver Name */}
              <div className="p-4 flex items-center gap-3">
                <User className="w-5 h-5 text-[#007AFF] shrink-0" />
                <div className="flex-1">
                  <label htmlFor="caregiver-name" className="text-[12px] font-medium text-[#8E8E93] block">
                    Your Name (Caregiver)
                  </label>
                  <input
                    id="caregiver-name"
                    type="text"
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    placeholder="Dad"
                    className="w-full text-[16px] text-[#1C1C1E] font-semibold bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Grandparents' Label */}
              <div className="p-4 flex items-center gap-3">
                <Users className="w-5 h-5 text-[#34C759] shrink-0" />
                <div className="flex-1">
                  <label htmlFor="grandparents-name" className="text-[12px] font-medium text-[#8E8E93] block">
                    Grandparents' Calling Name
                  </label>
                  <input
                    id="grandparents-name"
                    type="text"
                    value={grandparentsName}
                    onChange={(e) => setGrandparentsName(e.target.value)}
                    placeholder="Mom & Dad"
                    className="w-full text-[16px] text-[#1C1C1E] font-semibold bg-transparent focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: WhatsApp Number */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold text-[#6E6E73] uppercase tracking-wider px-2">
              WhatsApp Deep Link
            </span>
            <div className="bg-white rounded-[20px] border border-[#E5E5EA] shadow-apple-card p-4 flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#25D366] shrink-0" />
              <div className="flex-1">
                <label htmlFor="phone-number" className="text-[12px] font-medium text-[#8E8E93] block">
                  Grandparents' / Caretaker Phone Number
                </label>
                <input
                  id="phone-number"
                  type="tel"
                  value={grandparentsPhone}
                  onChange={(e) => setGrandparentsPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-[16px] text-[#1C1C1E] font-semibold bg-transparent focus:outline-none"
                />
              </div>
            </div>
            <span className="text-[13px] text-[#6E6E73] px-2">
              Include country code (e.g. +91) for 1-tap WhatsApp messaging.
            </span>
          </div>

          {/* Save Button */}
          <div>
            <PrimaryButton type="submit" fullWidth>
              Save Preferences
            </PrimaryButton>
          </div>
        </form>

        {/* Group 3: App Status & Reset */}
        <div className="flex flex-col gap-1.5 mt-2">
          <span className="text-[13px] font-bold text-[#6E6E73] uppercase tracking-wider px-2">
            App & Storage
          </span>
          <div className="bg-white rounded-[20px] border border-[#E5E5EA] shadow-apple-card p-4.5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[#8E8E93] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-[#1C1C1E]">
                  Offline Progressive Web App
                </span>
                <span className="text-[13px] text-[#6E6E73]">
                  Data is saved 100% locally on your phone. No logins or accounts required.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F2F2F7]">
              <SecondaryButton
                variant="default"
                onClick={handleReset}
                fullWidth
                className="!text-[#FF3B30] !border-[#FF3B30]/30 hover:!bg-[#FEEFEF]"
              >
                <RotateCcw className="w-4 h-4 text-[#FF3B30]" />
                <span>Reset to Sample Medicines</span>
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[12px] text-[#8E8E93] pt-4">
          Project Sanjeevani • Phase 1 Core MVP<br />
          Built with Apple Human Interface Guidelines
        </div>
      </main>
    </div>
  );
}
