import { describe, it, expect } from 'vitest';
import { computeFinancialMetrics } from '../index';
import type { Job, BusinessExpense, PersonalExpense, DebtObligation, DebtPayment } from '../../../types';

describe('Financial Calculation Engine - Truth Principles', () => {
  it('correctly calculates available cash and distinguishes Revenue vs Profit vs Personal Spending', () => {
    const mockJobs: Job[] = [
      {
        id: 'job-1',
        title: 'Appartement Wiring',
        clientName: 'Karim',
        category: 'Electricity',
        status: 'paid',
        agreedPrice: 2000,
        paidAmount: 2000,
        materialCosts: 500,
        startDate: '2026-08-01'
      },
      {
        id: 'job-2',
        title: 'Bathroom Plumbing',
        clientName: 'Fatima',
        category: 'Plumbing',
        status: 'completed',
        agreedPrice: 1500,
        paidAmount: 1000, // Uncollected 500 MAD
        materialCosts: 300,
        startDate: '2026-08-05'
      }
    ];

    const mockBusinessExpenses: BusinessExpense[] = [
      {
        id: 'b-exp-1',
        title: 'Diesel Fuel',
        amount: 200,
        category: 'Transport & Fuel',
        date: '2026-08-02'
      }
    ];

    const mockPersonalExpenses: PersonalExpense[] = [
      {
        id: 'p-exp-1',
        title: 'Groceries Bim',
        amount: 400,
        category: 'Food & Groceries',
        date: '2026-08-03'
      }
    ];

    const mockDebts: DebtObligation[] = [
      {
        id: 'debt-1',
        creditor: 'Droguerie Al Amine',
        type: 'business_supplier',
        totalAmount: 1000,
        remainingBalance: 700,
        status: 'active'
      }
    ];

    const mockDebtPayments: DebtPayment[] = [
      {
        id: 'pay-1',
        debtId: 'debt-1',
        amount: 300,
        date: '2026-08-04'
      }
    ];

    const metrics = computeFinancialMetrics(
      mockJobs,
      mockBusinessExpenses,
      mockPersonalExpenses,
      mockDebts,
      mockDebtPayments
    );

    // 1. Earned:
    // Total Agreed = 2000 + 1500 = 3500 MAD
    expect(metrics.totalRevenueAgreed).toBe(3500);
    // Collected Income = 2000 + 1000 = 3000 MAD
    expect(metrics.collectedIncome).toBe(3000);
    // Uncollected Revenue = 1500 - 1000 = 500 MAD
    expect(metrics.uncollectedRevenue).toBe(500);

    // 2. Spent & Costs:
    // Direct Job Costs = 500 + 300 = 800 MAD
    expect(metrics.directJobCosts).toBe(800);
    // Business Overhead = 200 MAD
    expect(metrics.businessOverhead).toBe(200);
    // Total Business Costs = 800 + 200 = 1000 MAD
    expect(metrics.totalBusinessCosts).toBe(1000);

    // 3. Profit:
    // Net Business Profit = Collected Income (3000) - Business Costs (1000) = 2000 MAD
    expect(metrics.netBusinessProfit).toBe(2000);

    // 4. Household & Debt:
    expect(metrics.totalPersonalSpending).toBe(400);
    expect(metrics.totalDebtPaid).toBe(300);

    // 5. Available Cash Position:
    // Available Cash = Income (3000) - Biz Costs (1000) - Personal (400) - Debt Paid (300) = 1300 MAD
    expect(metrics.availableCash).toBe(1300);
    expect(metrics.netCashFlow).toBe(1300);
  });
});
