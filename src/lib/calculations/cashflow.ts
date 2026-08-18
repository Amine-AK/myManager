// ==========================================
// FINANCIAL ENGINE - CASH FLOW CALCULATIONS
// ==========================================

import type { Job, BusinessExpense, PersonalExpense, DebtPayment } from '../../types';

/**
 * Calculates total cash collected from job payments.
 * Only money actually received counts towards available cash.
 */
export function calculateCollectedIncome(jobs: Job[]): number {
  return jobs.reduce((sum, job) => sum + (job.paidAmount || 0), 0);
}

/**
 * Calculates total agreed revenue across jobs.
 * This represents revenue target, not necessarily cash in bank.
 */
export function calculateTotalRevenueAgreed(jobs: Job[]): number {
  return jobs.reduce((sum, job) => sum + (job.agreedPrice || 0), 0);
}

/**
 * Calculates uncollected revenue (money owed by clients).
 */
export function calculateUncollectedRevenue(jobs: Job[]): number {
  return jobs.reduce((sum, job) => {
    const pending = (job.agreedPrice || 0) - (job.paidAmount || 0);
    return sum + (pending > 0 ? pending : 0);
  }, 0);
}

/**
 * Calculates direct material/subcontractor costs tied to jobs.
 */
export function calculateDirectJobCosts(jobs: Job[]): number {
  return jobs.reduce((sum, job) => sum + (job.materialCosts || 0), 0);
}

/**
 * Calculates overhead business expenses (tools, fuel, transport, permits).
 */
export function calculateBusinessOverhead(expenses: BusinessExpense[]): number {
  return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
}

/**
 * Total Business Costs = Direct Job Materials + Business Overhead
 */
export function calculateTotalBusinessCosts(jobs: Job[], expenses: BusinessExpense[]): number {
  return calculateDirectJobCosts(jobs) + calculateBusinessOverhead(expenses);
}

/**
 * Calculates household & personal spending.
 */
export function calculatePersonalSpending(expenses: PersonalExpense[]): number {
  return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
}

/**
 * Calculates total cash spent on debt repayments in the period.
 */
export function calculateTotalDebtPaid(payments: DebtPayment[]): number {
  return payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
}

/**
 * PRIMARY FINANCIAL METRIC: Available Cash Position
 * Current Available Cash = Collected Income - Total Business Costs - Personal Spending - Debt Payments
 */
export function calculateAvailableCash(
  jobs: Job[],
  businessExpenses: BusinessExpense[],
  personalExpenses: PersonalExpense[],
  debtPayments: DebtPayment[]
): number {
  const income = calculateCollectedIncome(jobs);
  const bizCosts = calculateTotalBusinessCosts(jobs, businessExpenses);
  const personalSpent = calculatePersonalSpending(personalExpenses);
  const debtPaid = calculateTotalDebtPaid(debtPayments);

  return income - bizCosts - personalSpent - debtPaid;
}
