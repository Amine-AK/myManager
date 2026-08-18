// ==========================================
// FINANCIAL ENGINE - ACQUISITION LEAD FUNNEL ANALYTICS
// ==========================================

import type { Job, AcquisitionSummary } from '../../types';

/**
 * Calculates total agreed revenue and cash collected per client acquisition source.
 * Helps the user identify which lead channel (Droguerie, Business Card, Mustapha Alliance, Mestour, Friends)
 * generates the most income.
 */
export function calculateAcquisitionSummaries(jobs: Job[]): AcquisitionSummary[] {
  const map = new Map<string, { jobCount: number; totalAgreed: number; totalCollected: number }>();

  jobs.forEach(j => {
    const source = j.acquisitionSource || 'Direct / Unspecified';
    const current = map.get(source) || { jobCount: 0, totalAgreed: 0, totalCollected: 0 };

    map.set(source, {
      jobCount: current.jobCount + 1,
      totalAgreed: current.totalAgreed + (j.agreedPrice || 0),
      totalCollected: current.totalCollected + (j.paidAmount || 0)
    });
  });

  const result: AcquisitionSummary[] = [];
  map.forEach((val, key) => {
    result.push({
      source: key,
      jobCount: val.jobCount,
      totalAgreed: val.totalAgreed,
      totalCollected: val.totalCollected
    });
  });

  // Sort by highest cash collected first
  return result.sort((a, b) => b.totalCollected - a.totalCollected);
}
