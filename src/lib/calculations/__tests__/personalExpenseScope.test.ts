import { describe, it, expect } from 'vitest';
import {
  getPersonalExpenseScope,
  calculateHouseholdSpending,
  calculateIndividualSpending
} from '../personalExpenseScope';
import { computeFinancialMetrics } from '../index';
import type { PersonalExpense } from '../../../types';

describe('Household vs Personal (Just Me) Spending Split', () => {
  const mockExpenses: PersonalExpense[] = [
    { id: 'p-1', title: 'Rent', amount: 2000, category: 'Housing & Rent (Loyer)', date: '2026-08-01' },
    { id: 'p-2', title: 'Groceries', amount: 400, category: 'Food & Groceries (Alimentation)', date: '2026-08-02' },
    { id: 'p-3', title: 'Café', amount: 15, category: 'Café & Snacks (Café / Thé / Snacks)', date: '2026-08-03' },
    { id: 'p-4', title: 'Gaming', amount: 50, category: 'Gaming & Entertainment (Gaming / Loisirs)', date: '2026-08-04' }
  ];

  it('classifies each category into household or individual scope', () => {
    expect(getPersonalExpenseScope('Housing & Rent (Loyer)')).toBe('household');
    expect(getPersonalExpenseScope('Family & Children (Famille / Enfants)')).toBe('household');
    expect(getPersonalExpenseScope('Other Household Expense')).toBe('household');
    expect(getPersonalExpenseScope('Café & Snacks (Café / Thé / Snacks)')).toBe('individual');
    expect(getPersonalExpenseScope('Other Personal Expense')).toBe('individual');
  });

  it('sums household and individual spending independently', () => {
    expect(calculateHouseholdSpending(mockExpenses)).toBe(2400); // Rent + Groceries
    expect(calculateIndividualSpending(mockExpenses)).toBe(65); // Café + Gaming
  });

  it('surfaces the split through FinancialMetrics and it adds up to the total', () => {
    const metrics = computeFinancialMetrics([], [], mockExpenses, [], []);
    expect(metrics.householdSpending).toBe(2400);
    expect(metrics.individualSpending).toBe(65);
    expect(metrics.householdSpending + metrics.individualSpending).toBe(metrics.totalPersonalSpending);
  });
});
