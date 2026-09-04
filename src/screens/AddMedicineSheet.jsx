import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Pill, 
  Sunrise, 
  Sun, 
  Moon, 
  User
} from 'lucide-react';
import { RollingStepper } from '../components/content/RollingStepper';

const SPRING_CONFIG = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

const TAB_SPRING = {
  type: 'spring',
  bounce: 0.15,
  duration: 0.45,
};

/**
 * AddMedicineSheet — Dynamic Multi-Profile Prescription Modal Dialog
 * Features 3D rolling steppers, Apple toggle switches, sliding segmented pill tabs,
 * and concentric rounded geometry.
 */
export function AddMedicineSheet({ 
  isOpen, 
  onClose, 
  onSave, 
  profiles = [],
  initialRecipient 
}) {
  const [recipient, setRecipient] = useState(() => {
    if (initialRecipient && profiles.some(p => p.id === initialRecipient)) return initialRecipient;
    return profiles[0]?.id || 'prof-grandmother';
  });
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');

  // Sync recipient with active profile
  useEffect(() => {
    if (initialRecipient && profiles.some(p => p.id === initialRecipient)) {
      setRecipient(initialRecipient);
    } else if (profiles.length > 0 && !profiles.some(p => p.id === recipient)) {
      setRecipient(profiles[0].id);
    }
  }, [initialRecipient, isOpen, profiles, recipient]);

  // Daily Schedule Slots (Apple Toggle Switches)
  const [slots, setSlots] = useState({
    MORNING: { enabled: true, label: 'Morning', icon: Sunrise, time: '8:00 AM' },
    AFTERNOON: { enabled: false, label: 'Afternoon', icon: Sun, time: '1:00 PM' },
    NIGHT: { enabled: true, label: 'Night', icon: Moon, time: '8:00 PM' },
  });

  // Food Relation (Segmented Sliding Tab)
  const [foodRelation, setFoodRelation] = useState('AFTER_MEAL');
  const foodOptions = [
    { id: 'AFTER_MEAL', label: 'After meal' },
    { id: 'BEFORE_MEAL', label: 'Before meal' },
    { id: 'WITH_FOOD', label: 'With food' },
  ];

  // Pack Size (Segmented Sliding Tab + Custom)
  const [packSizeOption, setPackSizeOption] = useState('10');
  const [customPackSize, setCustomPackSize] = useState(10);
  const packSizeOptions = ['10', '14', '15', 'CUSTOM'];

  // Starting Inventory (Rolling 3D Steppers)
  const [fullStrips, setFullStrips] = useState(2);
  const [activePills, setActivePills] = useState(10);

  const toggleSlot = (key) => {
    setSlots(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled }
    }));
  };

  const handlePackSizeChange = (opt) => {
    setPackSizeOption(opt);
    if (opt !== 'CUSTOM') {
      const num = parseInt(opt, 10);
      setActivePills(num);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Build active timeOfDay array
    const activeTimes = Object.keys(slots).filter(k => slots[k].enabled);
    const timeOfDay = activeTimes.length > 0 ? activeTimes : ['MORNING'];

    const tabletsPerStrip = packSizeOption === 'CUSTOM'
      ? Number(customPackSize) || 10
      : parseInt(packSizeOption, 10);

    const newMed = {
      id: 'med-' + Date.now(),
      name: name.trim(),
      recipient,
      profileId: recipient,
      purpose: purpose.trim(),
      schedule: {
        timeOfDay,
        pillsPerDose: 1.0,
        foodRelation
      },
      stripConfig: {
        tabletsPerStrip,
        abandonmentBuffer: 3
      },
      stock: {
        fullStripsDelivered: Number(fullStrips) || 0,
        currentStripPillsLeft: Math.min(Number(activePills) || 0, tabletsPerStrip),
        lastAuditDate: new Date().toISOString().split('T')[0]
      }
    };

    onSave(newMed);

    // Reset Form
    setName('');
    setPurpose('');
    setSlots({
      MORNING: { enabled: true, label: 'Morning', icon: Sunrise, time: '8:00 AM' },
      AFTERNOON: { enabled: false, label: 'Afternoon', icon: Sun, time: '1:00 PM' },
      NIGHT: { enabled: true, label: 'Night', icon: Moon, time: '8:00 PM' },
    });
    setFoodRelation('AFTER_MEAL');
    setPackSizeOption('10');
    setFullStrips(2);
    setActivePills(10);
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
          {/* Subtle Dimming Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={SPRING_CONFIG}
            style={{ borderRadius: 32 }}
            className="
              relative w-full max-w-lg bg-white overflow-hidden
              border border-[#E5E5EA] shadow-2xl z-10 flex flex-col my-auto max-h-[92vh]
            "
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-[#F2F2F7] flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#F2F2F7] flex items-center justify-center shrink-0 text-[#1C1C1E]">
                  <Pill className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1C1C1E]">
                    Add Medicine
                  </h2>
                  <p className="text-[13px] text-[#8E8E93] mt-0.5 leading-snug">
                    Track blister strips and refill safety for Mom & Dad.
                  </p>
                </div>
              </div>

              {/* Minimalist Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="
                  flex h-8 w-8 items-center justify-center shrink-0
                  bg-[#F2F2F7] hover:bg-[#E5E5EA] active:scale-90
                  rounded-full text-[#6E6E73] hover:text-[#1C1C1E]
                  transition-all
                "
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto overscroll-contain flex flex-col gap-5">
              {/* Profile Recipient Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                  Prescription For *
                </label>
                <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[#F2F2F7] border border-[#E5E5EA]">
                  {profiles.map((prof) => {
                    const isSelected = recipient === prof.id;
                    return (
                      <button
                        key={prof.id}
                        type="button"
                        onClick={() => setRecipient(prof.id)}
                        className={`
                          relative flex-1 min-w-[100px] py-2 px-3 rounded-xl
                          flex items-center justify-center gap-2
                          text-xs font-bold transition-all focus:outline-none
                          ${isSelected ? 'text-[#1C1C1E]' : 'text-[#8E8E93] hover:text-[#1C1C1E]'}
                        `}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="addRecipientSegment"
                            transition={TAB_SPRING}
                            className="absolute inset-0 rounded-xl bg-white shadow-xs border border-[#E5E5EA]"
                          />
                        )}
                        <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                          isSelected ? 'bg-[#1C1C1E] text-white' : 'bg-[#E5E5EA] text-[#6E6E73]'
                        }`}>
                          {prof.name ? prof.name.charAt(0).toUpperCase() : <User className="w-3 h-3 text-[#6E6E73]" />}
                        </div>
                        <span className="relative z-10 truncate max-w-[120px]">{prof.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 1: Medicine Identity */}
              <div className="flex flex-col gap-3.5">
                <div>
                  <label htmlFor="med-name" className="text-[13px] font-bold text-[#1C1C1E] uppercase tracking-wider block mb-1.5">
                    Medicine Name *
                  </label>
                  <input
                    id="med-name"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Metformin 500mg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="
                      w-full min-h-[48px] px-4 py-2.5
                      rounded-2xl bg-[#F8F9FB] border border-[#E5E5EA]
                      text-[16px] font-semibold text-[#1C1C1E] placeholder:text-[#8E8E93]
                      focus:bg-white focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/15
                      transition-all shadow-xs
                    "
                  />
                </div>

                <div>
                  <label htmlFor="med-purpose" className="text-[13px] font-bold text-[#1C1C1E] uppercase tracking-wider block mb-1.5">
                    What is it for? <span className="font-normal text-[#8E8E93] text-xs lowercase">(optional)</span>
                  </label>
                  <input
                    id="med-purpose"
                    type="text"
                    placeholder="e.g. Sugar / Diabetes, Blood Pressure"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="
                      w-full min-h-[48px] px-4 py-2.5
                      rounded-2xl bg-[#F8F9FB] border border-[#E5E5EA]
                      text-[16px] font-semibold text-[#1C1C1E] placeholder:text-[#8E8E93]
                      focus:bg-white focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/15
                      transition-all shadow-xs
                    "
                  />
                </div>
              </div>

              {/* Section 2: Daily Schedule (Apple Toggle Switches) */}
              <div className="rounded-2xl bg-[#F8F9FB] border border-[#E5E5EA] p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#1C1C1E] uppercase tracking-wider">
                    Daily Schedule
                  </span>
                  <span className="text-xs text-[#8E8E93]">
                    Toggle times
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {Object.entries(slots).map(([key, slot]) => {
                    const SlotIcon = slot.icon;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E5E5EA]/70 shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${slot.enabled ? 'bg-[#EBF5FF] text-[#007AFF]' : 'bg-[#F2F2F7] text-[#8E8E93]'}
                            transition-colors
                          `}>
                            <SlotIcon className="w-4 h-4 stroke-[2.2]" />
                          </div>
                          <div>
                            <span className="text-[14px] font-bold text-[#1C1C1E] block leading-tight">
                              {slot.label}
                            </span>
                            <span className="text-[11.5px] text-[#8E8E93] leading-tight">
                              Typical: {slot.time}
                            </span>
                          </div>
                        </div>

                        {/* Apple Switch */}
                        <button
                          type="button"
                          onClick={() => toggleSlot(key)}
                          aria-label={`Toggle ${slot.label}`}
                          className={`
                            relative w-12 h-7 rounded-full transition-colors duration-300 p-0.5
                            ${slot.enabled ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}
                          `}
                        >
                          <motion.div
                            animate={{ x: slot.enabled ? 20 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="w-6 h-6 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Food Relation (Sliding Segmented Tab) */}
                <div className="pt-2 border-t border-[#E5E5EA]/80">
                  <span className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider block mb-2">
                    Food timing
                  </span>
                  <div className="grid grid-cols-3 bg-[#E5E5EA]/60 rounded-full p-1 relative border border-[#E5E5EA]">
                    {foodOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFoodRelation(opt.id)}
                        className={`
                          relative z-10 py-1.5 text-[12px] font-bold tracking-tight rounded-full transition-colors duration-200
                          ${foodRelation === opt.id ? 'text-[#1C1C1E]' : 'text-[#8E8E93] hover:text-[#1C1C1E]'}
                        `}
                      >
                        {opt.label}
                        {foodRelation === opt.id && (
                          <motion.div
                            layoutId="activeFoodTab"
                            className="absolute inset-0 rounded-full -z-10 bg-white shadow-xs border border-black/5"
                            transition={TAB_SPRING}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Pack Size (Sliding Segmented Tab) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-[#1C1C1E] uppercase tracking-wider">
                    Pills in 1 Strip
                  </label>
                  <span className="text-xs text-[#8E8E93]">
                    Standard Indian foil pack
                  </span>
                </div>

                <div className="grid grid-cols-4 bg-[#F2F2F7] rounded-full p-1 relative border border-[#E5E5EA]">
                  {packSizeOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handlePackSizeChange(opt)}
                      className={`
                        relative z-10 py-2 text-[12.5px] font-bold tracking-tight rounded-full transition-colors duration-200
                        ${packSizeOption === opt ? 'text-[#1C1C1E]' : 'text-[#8E8E93] hover:text-[#1C1C1E]'}
                      `}
                    >
                      {opt === 'CUSTOM' ? 'Other' : `${opt} tabs`}
                      {packSizeOption === opt && (
                        <motion.div
                          layoutId="activeStripTab"
                          className="absolute inset-0 rounded-full -z-10 bg-white shadow-xs border border-black/5"
                          transition={TAB_SPRING}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Pack Size Stepper if Selected */}
                {packSizeOption === 'CUSTOM' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2"
                  >
                    <RollingStepper
                      value={customPackSize}
                      onChange={(val) => {
                        setCustomPackSize(val);
                        setActivePills(val);
                      }}
                      min={1}
                      max={60}
                      unit="tablets"
                    />
                  </motion.div>
                )}
              </div>

              {/* Section 4: Starting Stock (Rolling 3D Steppers) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Unopened Strips */}
                <div className="p-3.5 rounded-2xl bg-[#F8F9FB] border border-[#E5E5EA] flex flex-col gap-2">
                  <div>
                    <span className="text-[12.5px] font-bold text-[#1C1C1E] block">
                      Full Strips Given
                    </span>
                    <span className="text-[11px] text-[#8E8E93]">
                      Unopened strips in medicine box
                    </span>
                  </div>
                  <RollingStepper
                    value={fullStrips}
                    onChange={setFullStrips}
                    min={0}
                    max={30}
                    unit="strips"
                  />
                </div>

                {/* Pills on Active Strip */}
                <div className="p-3.5 rounded-2xl bg-[#F8F9FB] border border-[#E5E5EA] flex flex-col gap-2">
                  <div>
                    <span className="text-[12.5px] font-bold text-[#1C1C1E] block">
                      Active Strip Pills
                    </span>
                    <span className="text-[11px] text-[#8E8E93]">
                      Remaining in current open strip
                    </span>
                  </div>
                  <RollingStepper
                    value={activePills}
                    onChange={setActivePills}
                    min={0}
                    max={packSizeOption === 'CUSTOM' ? customPackSize : parseInt(packSizeOption, 10)}
                    unit="pills"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-[#F2F2F7] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    px-6 py-3 rounded-full text-sm font-semibold text-[#6E6E73]
                    border border-[#E5E5EA] hover:bg-[#F2F2F7] active:scale-95 transition-all
                  "
                >
                  Cancel
                </button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={!name.trim()}
                  className="
                    px-8 py-3.5 rounded-full text-sm font-bold text-white
                    bg-[#1C1C1E] hover:bg-[#2C2C2E] disabled:opacity-40 disabled:cursor-not-allowed
                    shadow-md transition-all
                  "
                >
                  Save Medicine
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AddMedicineSheet;
