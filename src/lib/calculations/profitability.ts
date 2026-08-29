// ==========================================
// FINANCIAL ENGINE - PROFITABILITY CALCULATIONS
// ==========================================

import type { Job, BusinessExpense } from '../../types';
import { calculateCollectedIncome, calculateTotalBusinessCosts } from './cashflow';

/**
 * FINANCIAL TRUTH: Revenue ≠ Profit
 * Net Business Profit = Collected Income - Total Business Costs (Job materials + Business Expenses)
 */
export function calculateNetBusinessProfit(
  jobs: Job[],
  businessExpenses: BusinessExpense[]
): number {
  const income = calculateCollectedIncome(jobs);
  const costs = calculateTotalBusinessCosts(jobs, businessExpenses);
  return income - costs;
}

/**
 * Calculates profit margin percentage based on collected cash.
 */
export function calculateProfitMarginPercent(
  jobs: Job[],
  businessExpenses: BusinessExpense[]
): number {
  const income = calculateCollectedIncome(jobs);
  if (income <= 0) return 0;
  const netProfit = calculateNetBusinessProfit(jobs, businessExpenses);
  return (netProfit / income) * 100;
}
