// ==========================================
// FINANCIAL ENGINE - POST-COMPLETION CLIENT CALLBACKS
// ==========================================

import type { JobIntervention } from '../../types';

export interface InterventionSummary {
  totalInterventions: number;
  unresolvedInterventionsCount: number;
  jobsWithInterventionsCount: number;
}

/**
 * Summarizes client-requested follow-up visits logged against already
 * delivered jobs (camera stopped working, cable came loose, etc.) -
 * separate from mid-work revisions, which happen before a job is closed.
 */
export function calculateInterventionSummary(interventions: JobIntervention[]): InterventionSummary {
  const totalInterventions = interventions.length;
  const unresolvedInterventionsCount = interventions.filter(i => !i.resolved).length;
  const jobsWithInterventionsCount = new Set(interventions.map(i => i.jobId)).size;

  return {
    totalInterventions,
    unresolvedInterventionsCount,
    jobsWithInterventionsCount
  };
}
