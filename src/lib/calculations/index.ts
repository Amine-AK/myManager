// ==========================================
// CENTRALIZED FINANCIAL ENGINE - SINGLE SOURCE OF TRUTH
// ==========================================

import type { Job, BusinessExpense, PersonalExpense, DebtObligation, DebtPayment, FinancialMetrics } from '../../types';
import {
  calculateCollectedIncome,
  calculateTotalRevenueAgreed,
  calculateUncollectedRevenue,
  calculateDirectJobCosts,
  calculateBusinessOverhead,
  calculateTotalBusinessCosts,
  calculatePersonalSpending,
  calculateTotalDebtPaid,
  calculateAvailableCash
} from './cashflow';
import { calculateNetBusinessProfit, calculateProfitMarginPercent } from './profitability';
import { calculateTotalDebtOutstanding, countActiveDebts } from './debt';

export * from './cashflow';
export * from './profitability';
export * from './debt';
export * from './insights';
export * from './acquisition';
export * from './weeklyTracker';

/**
 * SINGLE SOURCE OF TRUTH FOR ALL FINANCIAL CALCULATIONS.
 * UI components must call this function and consume computed FinancialMetrics.
 * UI components must NEVER recreate or duplicate mathematical formulas.
 */
export function computeFinancialMetrics(
  jobs: Job[],
  businessExpenses: BusinessExpense[],
  personalExpenses: PersonalExpense[],
  debts: DebtObligation[],
  debtPayments: DebtPayment[]
): FinancialMetrics {
  const totalRevenueAgreed = calculateTotalRevenueAgreed(jobs);
  const collectedIncome = calculateCollectedIncome(jobs);
  const uncollectedRevenue = calculateUncollectedRevenue(jobs);

  const directJobCosts = calculateDirectJobCosts(jobs);
  const businessOverhead = calculateBusinessOverhead(businessExpenses);
  const totalBusinessCosts = calculateTotalBusinessCosts(jobs, businessExpenses);

  const totalPersonalSpending = calculatePersonalSpending(personalExpenses);
  const totalDebtPaid = calculateTotalDebtPaid(debtPayments);

  const netBusinessProfit = calculateNetBusinessProfit(jobs, businessExpenses);
  const availableCash = calculateAvailableCash(jobs, businessExpenses, personalExpenses, debtPayments);
  const netCashFlow = collectedIncome - totalBusinessCosts - totalPersonalSpending - totalDebtPaid;

  const totalDebtOutstanding = calculateTotalDebtOutstanding(debts);
  const activeDebtCount = countActiveDebts(debts);

  const profitMarginPercent = calculateProfitMarginPercent(jobs, businessExpenses);
  const uncollectedRatioPercent = totalRevenueAgreed > 0 ? (uncollectedRevenue / totalRevenueAgreed) * 100 : 0;

  const waitingPartsCount = jobs.filter(j => j.status === 'waiting_parts').length;
  const revisionRequestedCount = jobs.filter(j => j.status === 'revision_requested').length;

  return {
    totalRevenueAgreed,
    collectedIncome,
    uncollectedRevenue,
    directJobCosts,
    businessOverhead,
    totalBusinessCosts,
    totalPersonalSpending,
    totalDebtPaid,
    netBusinessProfit,
    netCashFlow,
    availableCash,
    totalDebtOutstanding,
    activeDebtCount,
    profitMarginPercent,
    uncollectedRatioPercent,
    waitingPartsCount,
    revisionRequestedCount
  };
}
