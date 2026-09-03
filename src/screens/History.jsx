import React, { useMemo } from 'react';
import { GlassTopBar } from '../components/glass/GlassTopBar';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Heart, 
  Edit3, 
  Clock 
} from 'lucide-react';

/**
 * History Screen — Minimalist Apple HIG Architecture
 * Clean monochrome surfaces with restrained, quiet semantic accents.
 */
export function History({ auditLogs = [] }) {
  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    const d = new Date(isoString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const time = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) return `Today at ${time}`;

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Compute summary stats
  const { matchedCount, anomaliesCount } = useMemo(() => {
    let matched = 0;
    let anomalies = 0;
    auditLogs.forEach((log) => {
      if (log.outcome === 'MATCHES_EXPECTED') matched += 1;
      else anomalies += 1;
    });
    return { matchedCount: matched, anomaliesCount: anomalies };
  }, [auditLogs]);

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-28">
      <GlassTopBar
        title="Audit History"
        subtitle="Past weekend checks and reconciliation logs"
      />

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-5">
        {/* 1. Apple 3-Column Metric Pod (Restrained Monochrome) */}
        <div className="rounded-[26px] border border-[#E5E5EA] bg-white p-4 shadow-xs">
          <div className="grid grid-cols-3 divide-x divide-[#E5E5EA] text-center">
            <div className="px-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                Total Logs
              </span>
              <span className="text-[19px] font-bold text-[#1C1C1E] tabular-nums mt-0.5 block">
                {auditLogs.length}
              </span>
            </div>

            <div className="px-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                Count Matched
              </span>
              <span className="text-[19px] font-bold text-[#1C1C1E] tabular-nums mt-0.5 block">
                {matchedCount}
              </span>
            </div>

            <div className="px-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                Adjusted / Early
              </span>
              <span className="text-[19px] font-bold text-[#1C1C1E] tabular-nums mt-0.5 block">
                {anomaliesCount}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Section Header (Clean Apple Text) */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1C1C1E]">
            Logged Verifications
          </h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E5E5EA] text-[#1C1C1E]">
            {auditLogs.length}
          </span>
        </div>

        {/* 3. Logged Cards */}
        {auditLogs.length > 0 ? (
          <div className="flex flex-col gap-3">
            {auditLogs.map((log) => {
              const isMatched = log.outcome === 'MATCHES_EXPECTED';
              const isAdjusted = log.outcome === 'COUNT_ADJUSTED';

              return (
                <div
                  key={log.id}
                  className="
                    rounded-[26px] border border-[#E5E5EA] bg-white p-4 sm:p-5
                    shadow-xs flex flex-col gap-3
                  "
                >
                  {/* Top Row: Squircle Icon + Medicine Name + Outcome Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Quiet Monochrome Icon Container */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] shadow-xs">
                        {isMatched && <CheckCircle2 size={18} strokeWidth={2} />}
                        {isAdjusted && <Edit3 size={18} strokeWidth={2} />}
                        {!isMatched && !isAdjusted && <AlertTriangle size={18} strokeWidth={2} />}
                      </div>

                      <div className="min-w-0">
                        <h4 className="truncate text-[16px] font-bold tracking-tight text-[#1C1C1E]">
                          {log.medicineName}
                        </h4>
                        <span className="text-[11px] font-medium text-[#8E8E93] flex items-center gap-1 mt-0.5">
                          <Clock size={11} />
                          <span>{formatDate(log.timestamp)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Apple Status Badge with Quiet Dot */}
                    <div className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 bg-[#F8F9FB] border border-[#E5E5EA] text-[#1C1C1E] text-xs font-semibold shadow-xs">
                      <span className={`w-2 h-2 rounded-full ${
                        isMatched ? 'bg-[#34C759]' : isAdjusted ? 'bg-[#007AFF]' : 'bg-[#FF9F0A]'
                      }`} />
                      <span>
                        {isMatched 
                          ? 'Count Matched' 
                          : isAdjusted 
                          ? 'Count Adjusted' 
                          : 'Discarded Early'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Inset Detail Pod */}
                  {log.note && (
                    <div className="rounded-xl bg-[#F8F9FB] border border-[#E5E5EA] px-3.5 py-2.5 text-[12px] text-[#1C1C1E] leading-relaxed">
                      {log.note}
                    </div>
                  )}

                  {/* Inventory snapshot row */}
                  {(log.fullStripsRemaining !== undefined || log.pillsOnActiveStrip !== undefined) && (
                    <div className="pt-1.5 border-t border-[#F2F2F7] flex items-center justify-between text-[11px] text-[#8E8E93]">
                      <span>
                        Active: <strong className="text-[#1C1C1E]">{log.pillsOnActiveStrip ?? 0} pills</strong>
                      </span>
                      <span>
                        Unopened: <strong className="text-[#1C1C1E]">{log.fullStripsRemaining ?? 0} full strips</strong>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-[#E5E5EA] shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#F2F2F7] flex items-center justify-center text-[#1C1C1E] mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-[18px] font-bold text-[#1C1C1E] mb-1">
              No Audit Logs Yet
            </h3>
            <p className="text-[13.5px] text-[#6E6E73] max-w-xs leading-relaxed">
              When you visit Mom & Dad and verify counts, records will appear here.
            </p>
          </div>
        )}

        {/* Minimalist Loving Reassurance Note */}
        <div className="mt-2 p-3 rounded-2xl bg-white/60 border border-[#E5E5EA] text-center flex items-center justify-center gap-2 text-[12.5px] text-[#6E6E73] font-medium">
          <Heart className="w-3.5 h-3.5 fill-[#8E8E93] text-[#8E8E93] shrink-0" />
          <span>Zero smartphone tech needed for Grandma & Grandpa</span>
        </div>
      </main>
    </div>
  );
}

export default History;
