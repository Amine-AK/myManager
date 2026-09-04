import { describe, it, expect } from 'vitest';
import { computeDataHealthReport } from '../dataHealth';
import type { Job, JobPayment, DebtObligation, DebtPayment, Client } from '../../../types';

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    title: 'CCTV Installation',
    clientName: 'Karim',
    category: 'CCTV Installation',
    status: 'paid',
    agreedPrice: 1000,
    paidAmount: 1000,
    materialCosts: 200,
    startDate: '2026-08-01',
    ...overrides
  };
}

function makeDebt(overrides: Partial<DebtObligation> = {}): DebtObligation {
  return {
    id: 'debt-1',
    creditor: 'Droguerie Al Amine',
    type: 'business_supplier',
    totalAmount: 2000,
    remainingBalance: 1200,
    status: 'active',
    ...overrides
  };
}

describe('Data Health Reconciliation', () => {
  it('reports no issues when paidAmount and remainingBalance match their ledgers', () => {
    const jobs = [makeJob({ paidAmount: 800 })];
    const jobPayments: JobPayment[] = [{ id: 'jp-1', jobId: 'job-1', amount: 800, date: '2026-08-02' }];
    const debts = [makeDebt({ remainingBalance: 1200 })];
    const debtPayments: DebtPayment[] = [{ id: 'dp-1', debtId: 'debt-1', amount: 800, date: '2026-08-02' }];

    const report = computeDataHealthReport(jobs, jobPayments, [], debts, debtPayments, [], [], []);
    expect(report.issues).toHaveLength(0);
    expect(report.recordsChecked).toBe(4);
  });

  it('flags a job whose paidAmount has drifted from its payment ledger', () => {
    const jobs = [makeJob({ paidAmount: 500 })]; // stale/incorrect
    const jobPayments: JobPayment[] = [{ id: 'jp-1', jobId: 'job-1', amount: 800, date: '2026-08-02' }];

    const report = computeDataHealthReport(jobs, jobPayments, [], [], [], [], [], []);
    expect(report.issues).toHaveLength(1);
    expect(report.issues[0].type).toBe('job_paid_amount_mismatch');
    expect(report.issues[0].severity).toBe('error');
  });

  it('flags a job payment orphaned from a deleted job', () => {
    const jobPayments: JobPayment[] = [{ id: 'jp-1', jobId: 'job-deleted', amount: 300, date: '2026-08-02' }];

    const report = computeDataHealthReport([], jobPayments, [], [], [], [], [], []);
    expect(report.issues).toHaveLength(1);
    expect(report.issues[0].type).toBe('orphaned_job_payment');
  });

  it('flags a debt whose remainingBalance has drifted from its payment ledger', () => {
    const debts = [makeDebt({ totalAmount: 2000, remainingBalance: 1500 })]; // stale/incorrect
    const debtPayments: DebtPayment[] = [{ id: 'dp-1', debtId: 'debt-1', amount: 800, date: '2026-08-02' }];

    const report = computeDataHealthReport([], [], [], debts, debtPayments, [], [], []);
    expect(report.issues).toHaveLength(1);
    expect(report.issues[0].type).toBe('debt_balance_mismatch');
  });

  it('flags duplicate clients by case-insensitive name', () => {
    const clients: Client[] = [
      { id: 'c-1', name: 'Hassan El Amrani' },
      { id: 'c-2', name: 'hassan el amrani' }
    ];

    const report = computeDataHealthReport([], [], [], [], [], [], [], clients);
    expect(report.issues).toHaveLength(1);
    expect(report.issues[0].type).toBe('duplicate_client');
  });

  it('flags a job overpaid beyond its agreed price', () => {
    const jobs = [makeJob({ agreedPrice: 500, paidAmount: 600 })];

    const report = computeDataHealthReport(jobs, [], [], [], [], [], [], []);
    expect(report.issues.some(i => i.type === 'job_overpaid')).toBe(true);
  });
});
