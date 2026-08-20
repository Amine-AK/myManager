// ==========================================
// FINANCIAL ENGINE - WEEKLY & DAILY SPENDING / SAVINGS REWARD TRACKER
// ==========================================

import type { Job, BusinessExpense, PersonalExpense } from '../../types';

export interface DailySpendingPoint {
  dayName: string;      // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  dateStr: string;      // YYYY-MM-DD
  workSpent: number;    // Business expenses (MAD)
  personalSpent: number;// Household & personal (Café, Gaming, Groceries) (MAD)
  totalSpent: number;   // Work + Personal
  cashCollected: number;// Job cash collected on that day
}

export interface WeeklyTrackerSummary {
  weekLabel: string;        // e.g. "Week of Aug 17 - Aug 23, 2026"
  startDate: string;        // Monday YYYY-MM-DD
  endDate: string;          // Sunday YYYY-MM-DD
  days: DailySpendingPoint[];
  totalWeeklySpent: number;
  totalPersonalSpent: number;
  totalWorkSpent: number;
  totalWeeklyIncome: number;
  netWeeklySurplus: number; // Factual Cash Reward Saved
  dailyAverageSpent: number;
  isCurrentWeek: boolean;
}

/**
 * Gets Monday and Sunday dates for a given ISO date.
 */
function getWeekRange(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sun, 1 is Mon...
  const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diffToMon));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    monday: monday.toISOString().split('T')[0],
    sunday: sunday.toISOString().split('T')[0]
  };
}

/**
 * Calculates daily spending breakdown and weekly cash surplus reward for a specific week offset (0 = current week, -1 = last week).
 */
export function calculateWeeklyTracker(
  jobs: Job[],
  businessExpenses: BusinessExpense[],
  personalExpenses: PersonalExpense[],
  weekOffset: number = 0
): WeeklyTrackerSummary {
  const today = new Date();
  today.setDate(today.getDate() + weekOffset * 7);

  const { monday: monStr, sunday: sunStr } = getWeekRange(today);
  const mondayDate = new Date(monStr);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days: DailySpendingPoint[] = [];

  for (let i = 0; i < 7; i++) {
    const curDate = new Date(mondayDate);
    curDate.setDate(mondayDate.getDate() + i);
    const curDateStr = curDate.toISOString().split('T')[0];

    const workSpent = businessExpenses
      .filter(e => e.date === curDateStr)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const personalSpent = personalExpenses
      .filter(e => e.date === curDateStr)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const cashCollected = jobs
      .filter(j => j.startDate === curDateStr)
      .reduce((sum, j) => sum + (j.paidAmount || 0), 0);

    days.push({
      dayName: dayNames[i],
      dateStr: curDateStr,
      workSpent,
      personalSpent,
      totalSpent: workSpent + personalSpent,
      cashCollected
    });
  }

  const totalPersonalSpent = days.reduce((sum, d) => sum + d.personalSpent, 0);
  const totalWorkSpent = days.reduce((sum, d) => sum + d.workSpent, 0);
  const totalWeeklySpent = totalPersonalSpent + totalWorkSpent;
  const totalWeeklyIncome = days.reduce((sum, d) => sum + d.cashCollected, 0);

  // Factual Reward / Savings Surplus = Cash Collected - Total Spent
  const netWeeklySurplus = Math.max(0, totalWeeklyIncome - totalWeeklySpent);
  const dailyAverageSpent = totalWeeklySpent / 7;

  const currentMonStr = getWeekRange(new Date()).monday;

  return {
    weekLabel: `Week (${monStr} to ${sunStr})`,
    startDate: monStr,
    endDate: sunStr,
    days,
    totalWeeklySpent,
    totalPersonalSpent,
    totalWorkSpent,
    totalWeeklyIncome,
    netWeeklySurplus,
    dailyAverageSpent,
    isCurrentWeek: monStr === currentMonStr
  };
}
