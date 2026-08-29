// ==========================================
// FINANCIAL ENGINE - JOB TIMING (ELAPSED CALENDAR DAYS & LOGGED HOURS)
// ==========================================

import type { Job, JobIntervention, JobStatus } from '../../types';

function diffDays(fromDate: string, toDate: string): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((new Date(toDate).getTime() - new Date(fromDate).getTime()) / MS_PER_DAY);
}

/**
 * Derives actual elapsed calendar days worked vs paused from the job's dated
 * activity log, instead of counting how many times a status button was clicked.
 */
export function computeJobDurations(job: Job): { daysSpent: number; daysPaused: number } {
  const events = (job.logs || [])
    .slice()
    .reverse() // logs are stored newest-first; walk chronologically
    .map(l => ({ date: l.timestamp, status: l.status }));

  const timeline: { date: string; status: JobStatus }[] = [
    { date: job.startDate, status: 'in_progress' },
    ...events
  ];

  const isClosed = job.status === 'completed' || job.status === 'paid';
  const endDate = isClosed
    ? job.completedDate || timeline[timeline.length - 1].date
    : new Date().toISOString().split('T')[0];

  let daysSpent = 0;
  let daysPaused = 0;

  for (let i = 0; i < timeline.length; i++) {
    const segmentEnd = i + 1 < timeline.length ? timeline[i + 1].date : endDate;
    const span = Math.max(0, diffDays(timeline[i].date, segmentEnd));

    if (timeline[i].status === 'waiting_parts') {
      daysPaused += span;
    } else {
      daysSpent += span;
    }
  }

  if (daysSpent === 0 && daysPaused === 0) {
    daysSpent = 1;
  }

  return { daysSpent, daysPaused };
}

/**
 * Sums the actual hands-on hours a technician manually logged for a job:
 * the initial work session plus every revision/callback session worked on
 * it since. Unlike computeJobDurations (elapsed calendar days), this is
 * user-entered labor time, not derived from dates.
 */
export function calculateJobTotalHours(job: Job, jobInterventions: JobIntervention[] = []): number {
  const logHours = (job.logs || []).reduce((sum, log) => sum + (log.hoursSpent || 0), 0);
  const interventionHours = jobInterventions
    .filter(i => i.jobId === job.id)
    .reduce((sum, i) => sum + (i.hoursSpent || 0), 0);

  return logHours + interventionHours;
}
