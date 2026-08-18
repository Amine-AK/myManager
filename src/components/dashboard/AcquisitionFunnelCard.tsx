import React from 'react';
import type { Job } from '../../types';
import { calculateAcquisitionSummaries } from '../../lib/calculations/acquisition';
import { Share2, Users } from 'lucide-react';

interface AcquisitionFunnelCardProps {
  jobs: Job[];
}

export const AcquisitionFunnelCard: React.FC<AcquisitionFunnelCardProps> = ({ jobs }) => {
  const summaries = calculateAcquisitionSummaries(jobs);
  const totalCollected = jobs.reduce((sum, j) => sum + (j.paidAmount || 0), 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Client Acquisition Lead Funnel</h3>
            <p className="text-xs text-slate-400">Cash ROI by referral strategy</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> {jobs.length} Job(s)
        </span>
      </div>

      {summaries.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">
          No job records yet. Lead sources will appear as you log new jobs.
        </p>
      ) : (
        <div className="space-y-3">
          {summaries.map(item => {
            const pct = totalCollected > 0 ? (item.totalCollected / totalCollected) * 100 : 0;

            return (
              <div key={item.source} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{item.source}</span>
                    <span className="text-[10px] text-slate-500">({item.jobCount} jobs)</span>
                  </div>
                  <strong className="text-emerald-400 font-mono">
                    {item.totalCollected.toLocaleString('fr-MA')} MAD
                  </strong>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800/80 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
