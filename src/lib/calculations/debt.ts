// ==========================================
// FINANCIAL ENGINE - DEBT OBLIGATION CALCULATIONS
// ==========================================

import type { DebtObligation } from '../../types';

/**
 * Calculates total active outstanding debt burden.
 */
export function calculateTotalDebtOutstanding(debts: DebtObligation[]): number {
  return debts
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + (d.remainingBalance || 0), 0);
}

/**
 * Counts active debt obligations.
 */
export function countActiveDebts(debts: DebtObligation[]): number {
  return debts.filter(d => d.status === 'active' && d.remainingBalance > 0).length;
}

/**
 * Calculates total minimum monthly debt commitments.
 */
export function calculateMonthlyDebtCommitments(debts: DebtObligation[]): number {
  return debts
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + (d.monthlyMinPayment || 0), 0);
}
