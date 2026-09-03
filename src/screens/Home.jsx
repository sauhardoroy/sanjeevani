import React, { useState, useMemo } from 'react';
import { GlassTopBar } from '../components/glass/GlassTopBar';
import { GlassFAB } from '../components/glass/GlassFAB';
import { MedicineCard } from '../components/content/MedicineCard';
import { MedicineDetailDialog } from '../components/content/MedicineDetailDialog';
import { evaluateMedicineStatus } from '../lib/depletion';
import { PlusCircle, Heart } from 'lucide-react';

/**
 * Home Screen — Dashboard for Dad
 * Auto-sorts medicines Red -> Amber -> Green so high-urgency items are at the top.
 * Tapping a card opens a modern, in-page dialog modal using spring animations.
 */
export function Home({ 
  medicines = [], 
  settings, 
  onAudit,
  onDelete,
  onOpenAddSheet 
}) {
  const [activeDialogMedId, setActiveDialogMedId] = useState(null);

  // Sort medicines strictly: Red (1) -> Amber (2) -> Green (3)
  const sortedMedicines = useMemo(() => {
    return [...medicines].sort((a, b) => {
      const statusA = evaluateMedicineStatus(a);
      const statusB = evaluateMedicineStatus(b);
      return statusA.priority - statusB.priority;
    });
  }, [medicines]);

  // Find currently active medicine for dialog
  const activeDialogMedicine = useMemo(() => {
    return medicines.find(m => m.id === activeDialogMedId) || null;
  }, [medicines, activeDialogMedId]);

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = settings?.caregiverName || 'Dad';
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  }, [settings]);

  const activeCount = medicines.length;
  const subtitle = `${activeCount} medicine${activeCount === 1 ? '' : 's'} tracked for ${settings?.grandparentsName || 'Mom & Dad'}`;

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-28">
      {/* Functional Glass Top Bar */}
      <GlassTopBar
        title={greeting}
        subtitle={subtitle}
      />

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Quick Safety Summary Caption */}
        {medicines.length > 0 && (
          <div className="px-1 flex items-center justify-between text-[13px] font-bold text-[#6E6E73] tracking-wide">
            <span>TRACKED MEDICINES</span>
            <span className="text-[11.5px] font-semibold text-[#8E8E93]">Urgent on top</span>
          </div>
        )}

        {/* Modern Expandable Cards List */}
        {sortedMedicines.length > 0 ? (
          <div className="flex flex-col gap-4">
            {sortedMedicines.map((med) => (
              <MedicineCard
                key={med.id}
                medicine={med}
                settings={settings}
                onSelect={(selected) => setActiveDialogMedId(selected.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-[#E5E5EA] shadow-apple-card">
            <div className="w-16 h-16 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] mb-4">
              <PlusCircle className="w-8 h-8" />
            </div>
            <h3 className="text-[20px] font-bold text-[#1C1C1E] mb-1">
              No Medicines Added Yet
            </h3>
            <p className="text-[15px] text-[#6E6E73] max-w-xs mb-6 leading-relaxed">
              Tap the blue <strong>+ button</strong> below to add Mom & Dad's first medicine in under 30 seconds.
            </p>
          </div>
        )}

        {/* Loving Reassurance Note */}
        <div className="mt-2 p-3.5 rounded-2xl bg-[#EBF5FF] border border-[#007AFF]/20 text-center flex items-center justify-center gap-2 text-[13px] text-[#0066CC] font-medium shadow-sm">
          <Heart className="w-4 h-4 fill-[#007AFF] text-[#007AFF] shrink-0" />
          <span>Zero smartphone tech needed for Grandma & Grandpa</span>
        </div>
      </main>

      {/* Floating Glass FAB for instant addition */}
      <GlassFAB onClick={onOpenAddSheet} />

      {/* Modern In-Page Dialog Modal (Same page, spring physics) */}
      <MedicineDetailDialog
        medicine={activeDialogMedicine}
        isOpen={Boolean(activeDialogMedicine)}
        onClose={() => setActiveDialogMedId(null)}
        onAudit={onAudit}
        onDelete={onDelete}
        settings={settings}
      />
    </div>
  );
}
