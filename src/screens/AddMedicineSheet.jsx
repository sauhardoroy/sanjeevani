import React, { useState } from 'react';
import { GlassSheet } from '../components/glass/GlassSheet';
import { StepperInput } from '../components/content/StepperInput';
import { ChipSelect } from '../components/content/ChipSelect';
import { PrimaryButton } from '../components/content/Buttons';

/**
 * AddMedicineSheet — Guided setup taking under 30 seconds
 * Uses steppers and chips to eliminate typing friction.
 */
export function AddMedicineSheet({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [timeOfDay, setTimeOfDay] = useState(['MORNING']);
  const [stripSize, setStripSize] = useState('10');
  const [customStripSize, setCustomStripSize] = useState(10);
  const [fullStrips, setFullStrips] = useState(2);
  const [activePills, setActivePills] = useState(10);

  const timeOptions = [
    { value: 'MORNING', label: 'Morning', icon: '🌅' },
    { value: 'AFTERNOON', label: 'Afternoon', icon: '☀️' },
    { value: 'NIGHT', label: 'Night', icon: '🌙' },
  ];

  const stripSizeOptions = [
    { value: '10', label: '10 pills' },
    { value: '14', label: '14 pills' },
    { value: '15', label: '15 pills' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleStripSizeChange = (val) => {
    setStripSize(val);
    if (val !== 'OTHER') {
      const num = parseInt(val, 10);
      setActivePills(num);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tabletsPerStrip = stripSize === 'OTHER' 
      ? Number(customStripSize) || 10 
      : parseInt(stripSize, 10);

    const newMed = {
      id: 'med-' + Date.now(),
      name: name.trim(),
      purpose: purpose.trim(),
      schedule: {
        timeOfDay,
        pillsPerDose: 1.0,
        foodRelation: 'AFTER_MEAL'
      },
      stripConfig: {
        tabletsPerStrip,
        abandonmentBuffer: 3
      },
      stock: {
        fullStripsDelivered: fullStrips,
        currentStripPillsLeft: Math.min(activePills, tabletsPerStrip),
        lastAuditDate: new Date().toISOString().split('T')[0]
      }
    };

    onSave(newMed);
    // Reset form
    setName('');
    setPurpose('');
    setTimeOfDay(['MORNING']);
    setStripSize('10');
    setFullStrips(2);
    setActivePills(10);
    onClose();
  };

  return (
    <GlassSheet isOpen={isOpen} onClose={onClose} title="Add a Medicine">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Medicine Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="med-name" className="text-[15px] font-semibold text-[#1C1C1E]">
            Medicine name *
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
              min-h-[48px] px-4 py-3
              rounded-[14px] bg-white border border-[#E5E5EA]
              text-[17px] text-[#1C1C1E] placeholder:text-[#8E8E93]
              focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20
              shadow-sm
            "
          />
        </div>

        {/* What's it for */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="med-purpose" className="text-[15px] font-semibold text-[#1C1C1E]">
            What is it for? <span className="font-normal text-[#8E8E93]">(optional)</span>
          </label>
          <input
            id="med-purpose"
            type="text"
            placeholder="e.g. Sugar / Diabetes, Blood Pressure"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="
              min-h-[48px] px-4 py-3
              rounded-[14px] bg-white border border-[#E5E5EA]
              text-[17px] text-[#1C1C1E] placeholder:text-[#8E8E93]
              focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20
              shadow-sm
            "
          />
        </div>

        {/* When is it taken */}
        <ChipSelect
          label="When is it taken?"
          options={timeOptions}
          value={timeOfDay}
          onChange={setTimeOfDay}
          isMulti={true}
          helper="Select all times that apply"
        />

        {/* Pills per strip */}
        <ChipSelect
          label="Pills in 1 strip"
          options={stripSizeOptions}
          value={stripSize}
          onChange={handleStripSizeChange}
          isMulti={false}
        />

        {stripSize === 'OTHER' && (
          <StepperInput
            label="Custom pills per strip"
            value={customStripSize}
            onChange={setCustomStripSize}
            min={1}
            max={30}
            unit="tablets"
          />
        )}

        {/* Full strips given */}
        <StepperInput
          label="Full unopened strips given to Mom/Dad"
          value={fullStrips}
          onChange={setFullStrips}
          min={0}
          max={50}
          unit="strips"
        />

        {/* Pills left on active strip */}
        <StepperInput
          label="Pills left on current open strip"
          value={activePills}
          onChange={setActivePills}
          min={0}
          max={stripSize === 'OTHER' ? customStripSize : parseInt(stripSize, 10)}
          unit="pills"
          helper="If they just started a new strip, leave this at full"
        />

        {/* Submit */}
        <div className="pt-3">
          <PrimaryButton type="submit" fullWidth disabled={!name.trim()}>
            Save Medicine
          </PrimaryButton>
        </div>
      </form>
    </GlassSheet>
  );
}
