import { describe, it, expect } from 'vitest';
import { computeJobDurations, calculateJobTotalHours } from '../jobTiming';
import type { Job, JobIntervention } from '../../../types';

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

describe('Job Timing Engine - Total Logged Hours', () => {
  it('sums hours worked across the initial job plus every revision session (7h install + 2x1h revisions = 9h)', () => {
    const job: Job = {
      id: 'job-3',
      title: 'CCTV System Installation',
      clientName: 'Karim',
      category: 'CCTV Installation',
      status: 'paid',
      agreedPrice: 3000,
      paidAmount: 3000,
      materialCosts: 800,
      startDate: '2026-08-01',
      logs: [
        // stored newest-first, as the app appends new entries
        { id: 'log-3', timestamp: '2026-08-05', status: 'paid', note: 'Second revision resolved.', hoursSpent: 1 },
        { id: 'log-2', timestamp: '2026-08-03', status: 'revision_requested', note: 'First revision resolved.', hoursSpent: 1 },
        { id: 'log-1', timestamp: '2026-08-01', status: 'completed', note: 'Initial installation done.', hoursSpent: 7 }
      ]
    };

    expect(calculateJobTotalHours(job)).toBe(9);
  });

  it('includes hours logged on resolved client callbacks for the same job', () => {
    const job: Job = {
      id: 'job-4',
      title: 'IP Camera Installation',
      clientName: 'Fatima',
      category: 'IP Camera Installation',
      status: 'paid',
      agreedPrice: 1500,
      paidAmount: 1500,
      materialCosts: 300,
      startDate: '2026-08-01',
      logs: [{ id: 'log-1', timestamp: '2026-08-01', status: 'paid', note: 'Job done.', hoursSpent: 5 }]
    };

    const interventions: JobIntervention[] = [
      { id: 'int-1', jobId: 'job-4', date: '2026-08-10', reason: 'Camera offline', resolved: true, hoursSpent: 1.5 },
      { id: 'int-2', jobId: 'job-4', date: '2026-08-15', reason: 'Still investigating', resolved: false },
      { id: 'int-3', jobId: 'other-job', date: '2026-08-11', reason: 'Unrelated job', resolved: true, hoursSpent: 4 }
    ];

    expect(calculateJobTotalHours(job, interventions)).toBe(6.5);
  });
});
