import { describe, it, expect } from 'vitest';
import { computeJobDurations } from '../jobTiming';
import type { Job } from '../../../types';

describe('Job Timing Engine - Elapsed Calendar Days', () => {
  it('derives days spent and paused from dated activity logs instead of click-counters', () => {
    const job: Job = {
      id: 'job-1',
      title: 'CCTV Installation',
      clientName: 'Hassan',
      category: 'CCTV Installation',
      status: 'completed',
      agreedPrice: 2000,
      paidAmount: 2000,
      materialCosts: 500,
      startDate: '2026-08-01',
      completedDate: '2026-08-10',
      logs: [
        // stored newest-first, as the app appends new entries
        { id: 'log-3', timestamp: '2026-08-10', status: 'completed', note: 'Work completed successfully.' },
        { id: 'log-2', timestamp: '2026-08-06', status: 'in_progress', note: 'Parts arrived, resumed work.' },
        { id: 'log-1', timestamp: '2026-08-03', status: 'waiting_parts', note: 'Waiting for NVR from Casablanca.' }
      ]
    };

    // 2026-08-01 -> 08-03 (2 days in_progress) -> 08-06 (3 days waiting_parts) -> 08-10 (4 days in_progress)
    const { daysSpent, daysPaused } = computeJobDurations(job);
    expect(daysSpent).toBe(6);
    expect(daysPaused).toBe(3);
  });

  it('counts a same-day job as 1 day of work with zero pause', () => {
    const job: Job = {
      id: 'job-2',
      title: 'Quick Repair',
      clientName: 'Amine',
      category: 'TV Repair',
      status: 'paid',
      agreedPrice: 300,
      paidAmount: 300,
      materialCosts: 0,
      startDate: '2026-08-15',
      completedDate: '2026-08-15'
    };

    const { daysSpent, daysPaused } = computeJobDurations(job);
    expect(daysSpent).toBe(1);
    expect(daysPaused).toBe(0);
  });
});
