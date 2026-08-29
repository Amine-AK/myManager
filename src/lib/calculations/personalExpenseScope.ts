// ==========================================
// FINANCIAL ENGINE - HOUSEHOLD vs INDIVIDUAL SPENDING SPLIT
// ==========================================

import type { PersonalExpense, PersonalExpenseScope } from '../../types';

const HOUSEHOLD_CATEGORIES = new Set<string>([
  'Food & Groceries (Alimentation)',
  'Housing & Rent (Loyer)',
  'Utilities & Phone (Eau, Électricité, Recharge)',
  'Family & Children (Famille / Enfants)',
  'Healthcare & Medical (Santé)',
  'Other Household Expense'
]);

/**
 * Categorizes a personal expense as shared household/family spending vs
 * spending that's just for you. Derived from category so existing records
 * and the fixed category dropdown never need a separate field to stay in sync.
 */
export function getPersonalExpenseScope(category: string): PersonalExpenseScope {
  return HOUSEHOLD_CATEGORIES.has(category) ? 'household' : 'individual';
}

export function calculateHouseholdSpending(expenses: PersonalExpense[]): number {
  return expenses
    .filter(e => getPersonalExpenseScope(e.category) === 'household')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
}

export function calculateIndividualSpending(expenses: PersonalExpense[]): number {
  return expenses
    .filter(e => getPersonalExpenseScope(e.category) === 'individual')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
}
