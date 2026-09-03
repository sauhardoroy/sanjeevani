import React, { useMemo } from 'react';
import { GlassTopBar } from '../components/glass/GlassTopBar';
import { GlassFAB } from '../components/glass/GlassFAB';
import { MedicineCard } from '../components/content/MedicineCard';
import { evaluateMedicineStatus } from '../lib/depletion';
import { PlusCircle, Heart, Check } from 'lucide-react';

/**
 * Home Screen — Dashboard for Dad
 * Ultra-minimalist Apple HIG aesthetic with restrained semantic accents:
 * 1. Critical (Subtle red dot)
 * 2. Attention Required (Subtle amber dot)
 * 3. All Good (Subtle green dot)
 */
export function Home({ 
  medicines = [], 
  settings, 
  onAudit, 
  onDelete, 
  onOpenAddSheet 
}) {
  // Categorize medicines into the 3 distinct sections
  const { criticalMeds, attentionMeds, allGoodMeds } = useMemo(() => {
    const critical = [];
    const attention = [];
    const allGood = [];

    medicines.forEach((med) => {
      const status = evaluateMedicineStatus(med);
      if (status.type === 'REFILL_NOW' || status.priority === 1) {
        critical.push(med);
      } else if (
        status.type === 'ABANDONMENT_RISK' || 
        status.type === 'LOW_STOCK' || 
        status.priority === 2
      ) {
        attention.push(med);
      } else {
        allGood.push(med);
      }
    });

    return {
      criticalMeds: critical,
      attentionMeds: attention,
      allGoodMeds: allGood,
    };
  }, [medicines]);

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

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-6">
        {medicines.length > 0 ? (
          <>
            {/* ------------------------------------------------------------ */}
            {/* Section 1: Critical */}
            {/* ------------------------------------------------------------ */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF3B30]" />
                  <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
                    Critical Refill
                  </h2>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  criticalMeds.length > 0 
                    ? 'bg-[#FF3B30]/10 text-[#D32F2F] border border-[#FF3B30]/20' 
                    : 'bg-[#E5E5EA] text-[#8E8E93]'
                }`}>
                  {criticalMeds.length}
                </span>
              </div>

              {criticalMeds.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {criticalMeds.map((med) => (
                    <MedicineCard
                      key={med.id}
                      medicine={med}
                      settings={settings}
                      onAudit={onAudit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-2.5 px-4 rounded-2xl bg-white/70 border border-[#E5E5EA] text-[12px] font-medium text-[#8E8E93] flex items-center justify-center gap-2">
                  <Check size={13} className="text-[#34C759] stroke-[2.5]" />
                  <span>No critical refills needed</span>
                </div>
              )}
            </section>

            {/* ------------------------------------------------------------ */}
            {/* Section 2: Attention Required */}
            {/* ------------------------------------------------------------ */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF9F0A]" />
                  <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
                    Attention Required
                  </h2>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  attentionMeds.length > 0 
                    ? 'bg-[#FF9F0A]/10 text-[#B45309] border border-[#FF9F0A]/20' 
                    : 'bg-[#E5E5EA] text-[#8E8E93]'
                }`}>
                  {attentionMeds.length}
                </span>
              </div>

              {attentionMeds.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {attentionMeds.map((med) => (
                    <MedicineCard
                      key={med.id}
                      medicine={med}
                      settings={settings}
                      onAudit={onAudit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-2.5 px-4 rounded-2xl bg-white/70 border border-[#E5E5EA] text-[12px] font-medium text-[#8E8E93] flex items-center justify-center gap-2">
                  <Check size={13} className="text-[#34C759] stroke-[2.5]" />
                  <span>No strips in early discard risk</span>
                </div>
              )}
            </section>

            {/* ------------------------------------------------------------ */}
            {/* Section 3: All Good */}
            {/* ------------------------------------------------------------ */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                  <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
                    All Good
                  </h2>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  allGoodMeds.length > 0 
                    ? 'bg-[#34C759]/10 text-[#15803D] border border-[#34C759]/20' 
                    : 'bg-[#E5E5EA] text-[#8E8E93]'
                }`}>
                  {allGoodMeds.length}
                </span>
              </div>

              {allGoodMeds.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {allGoodMeds.map((med) => (
                    <MedicineCard
                      key={med.id}
                      medicine={med}
                      settings={settings}
                      onAudit={onAudit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-2.5 px-4 rounded-2xl bg-white/70 border border-[#E5E5EA] text-[12px] font-medium text-[#8E8E93] flex items-center justify-center gap-2">
                  <span>No medicines currently in safe supply</span>
                </div>
              )}
            </section>
          </>
        ) : (
          /* Empty State */
          <div className="mt-12 flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-[#E5E5EA] shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#F2F2F7] flex items-center justify-center text-[#1C1C1E] mb-4">
              <PlusCircle className="w-7 h-7" />
            </div>
            <h3 className="text-[19px] font-bold text-[#1C1C1E] mb-1">
              No Medicines Added Yet
            </h3>
            <p className="text-[14px] text-[#6E6E73] max-w-xs mb-6 leading-relaxed">
              Tap the <strong>+ button</strong> below to add Mom & Dad's first medicine.
            </p>
          </div>
        )}

        {/* Minimalist Loving Reassurance Note */}
        <div className="mt-2 p-3 rounded-2xl bg-white/60 border border-[#E5E5EA] text-center flex items-center justify-center gap-2 text-[12.5px] text-[#6E6E73] font-medium">
          <Heart className="w-3.5 h-3.5 fill-[#8E8E93] text-[#8E8E93] shrink-0" />
          <span>Zero smartphone tech needed for Grandma & Grandpa</span>
        </div>
      </main>

      {/* Floating Glass FAB for instant addition */}
      <GlassFAB onClick={onOpenAddSheet} />
    </div>
  );
}

export default Home;
