import { describe, it, expect } from 'vitest';
import { calculateWeeklyTracker } from '../weeklyTracker';
import type { JobPayment, BusinessExpense, PersonalExpense } from '../../../types';

describe('Weekly & Daily Spending Tracker Engine', () => {
  it('correctly groups daily spending and computes net weekly cash surplus reward', () => {
    const mockJobPayments: JobPayment[] = [
      {
        id: 'jpay-1',
        jobId: 'j-1',
        amount: 2000,
        date: new Date().toISOString().split('T')[0] // today
      }
    ];

    const mockBusinessExpenses: BusinessExpense[] = [
      {
        id: 'b-1',
        title: 'Fuel',
        amount: 150,
        category: 'Transport & Fuel (Carburant)',
        date: new Date().toISOString().split('T')[0]
      }
    ];

    const mockPersonalExpenses: PersonalExpense[] = [
      {
        id: 'p-1',
        title: 'Café & Snacks',
        amount: 30,
        category: 'Café & Snacks (Café / Thé / Snacks)',
        date: new Date().toISOString().split('T')[0]
      }
    ];

    const summary = calculateWeeklyTracker(mockJobPayments, mockBusinessExpenses, mockPersonalExpenses, 0);

    expect(summary.totalWeeklyIncome).toBe(2000);
    expect(summary.totalWorkSpent).toBe(150);
    expect(summary.totalPersonalSpent).toBe(30);
    expect(summary.totalWeeklySpent).toBe(180);
    expect(summary.netWeeklySurplus).toBe(1820); // 2000 - 180
    expect(summary.isCurrentWeek).toBe(true);
  });
});
