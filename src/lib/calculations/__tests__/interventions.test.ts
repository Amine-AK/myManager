import { describe, it, expect } from 'vitest';
import { calculateInterventionSummary } from '../interventions';
import { computeFinancialMetrics } from '../index';
import type { JobIntervention } from '../../../types';

describe('Post-Completion Client Callback Tracking', () => {
  const mockInterventions: JobIntervention[] = [
    { id: 'int-1', jobId: 'job-1', date: '2026-08-10', reason: 'Camera stopped recording', resolved: false },
    { id: 'int-2', jobId: 'job-1', date: '2026-08-15', reason: 'Cable came loose again', resolved: true, resolvedDate: '2026-08-16' },
    { id: 'int-3', jobId: 'job-2', date: '2026-08-12', reason: 'NVR error code', resolved: false }
  ];

  it('summarizes total, unresolved, and distinct-job callback counts', () => {
    const summary = calculateInterventionSummary(mockInterventions);
    expect(summary.totalInterventions).toBe(3);
    expect(summary.unresolvedInterventionsCount).toBe(2);
    expect(summary.jobsWithInterventionsCount).toBe(2); // job-1 and job-2
  });

  it('surfaces the callback summary through FinancialMetrics', () => {
    const metrics = computeFinancialMetrics([], [], [], [], [], mockInterventions);
    expect(metrics.totalInterventions).toBe(3);
    expect(metrics.unresolvedInterventionsCount).toBe(2);
    expect(metrics.jobsWithInterventionsCount).toBe(2);
  });

  it('defaults to zero callbacks when none are passed', () => {
    const metrics = computeFinancialMetrics([], [], [], [], []);
    expect(metrics.totalInterventions).toBe(0);
    expect(metrics.unresolvedInterventionsCount).toBe(0);
    expect(metrics.jobsWithInterventionsCount).toBe(0);
  });
});
