import React from 'react';
import { GlassTopBar } from '../components/glass/GlassTopBar';
import { CheckCircle2, AlertTriangle, Calendar, FileText } from 'lucide-react';

/**
 * History Screen — Flat, read-only audit log
 * Differentiated visually from Home: uses clean iOS-style grouped rows with hairline separators.
 */
export function History({ auditLogs = [] }) {
  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col pb-28">
      <GlassTopBar
        title="Audit History"
        subtitle="Past weekend checks and reconciliation logs"
      />

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {auditLogs.length > 0 ? (
          <div className="bg-white rounded-[20px] border border-[#E5E5EA] shadow-apple-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E5EA] bg-[#FAFAFC]">
              <span className="text-[13px] font-bold text-[#6E6E73] uppercase tracking-wider">
                Logged Audits ({auditLogs.length})
              </span>
            </div>

            <div className="divide-y divide-[#E5E5EA]">
              {auditLogs.map((log) => {
                const isMatched = log.outcome === 'MATCHES_EXPECTED';

                return (
                  <div key={log.id} className="p-4.5 flex items-start gap-3.5 hover:bg-[#F9F9FB] transition-colors">
                    <div className="mt-0.5 shrink-0">
                      {isMatched ? (
                        <div className="w-9 h-9 rounded-full bg-[#EBF9EE] flex items-center justify-center text-[#34C759]">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#FFF8EB] flex items-center justify-center text-[#FF9F0A]">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[16px] font-semibold text-[#1C1C1E] truncate">
                          {log.medicineName}
                        </h4>
                        <span className="text-[12px] font-medium text-[#8E8E93] shrink-0">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <span className={`
                          inline-block px-2 py-0.5 rounded-[6px] text-[12px] font-bold
                          ${isMatched ? 'bg-[#EBF9EE] text-[#15803D]' : 'bg-[#FFF8EB] text-[#B45309]'}
                        `}>
                          {isMatched ? 'Count Matched' : 'Strip Discarded Early'}
                        </span>

                        {!isMatched && log.wastedPillsCount > 0 && (
                          <span className="text-[12px] font-medium text-[#B45309]">
                            ({log.wastedPillsCount} pills discarded)
                          </span>
                        )}
                      </div>

                      {log.note && (
                        <p className="mt-1.5 text-[13.5px] text-[#6E6E73] leading-relaxed">
                          {log.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center text-center p-8 bg-white rounded-[20px] border border-[#E5E5EA] shadow-apple-card">
            <div className="w-14 h-14 rounded-full bg-[#F2F2F7] flex items-center justify-center text-[#8E8E93] mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-[18px] font-bold text-[#1C1C1E] mb-1">
              No Audit Logs Yet
            </h3>
            <p className="text-[14px] text-[#6E6E73] max-w-xs leading-relaxed">
              When you visit or call Mom & Dad, open any medicine card and tap a Weekend Rapid Audit button to log the outcome.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
