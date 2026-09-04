// ==========================================
// DATA INTEGRITY - RECONCILIATION CHECK
// Read-only comparison of stored values against their source ledgers.
// Never auto-repairs data; only reports discrepancies for manual review.
// ==========================================

import type {
  Job,
  JobPayment,
  JobIntervention,
  DebtObligation,
  DebtPayment,
  BusinessExpense,
  PersonalExpense,
  Client,
  DataHealthIssue,
  DataHealthReport
} from '../../types';

const EPSILON = 0.01; // Tolerance for floating-point comparison of MAD amounts

export function computeDataHealthReport(
  jobs: Job[],
  jobPayments: JobPayment[],
  jobInterventions: JobIntervention[],
  debts: DebtObligation[],
  debtPayments: DebtPayment[],
  businessExpenses: BusinessExpense[],
  personalExpenses: PersonalExpense[],
  clients: Client[]
): DataHealthReport {
  const issues: DataHealthIssue[] = [];

  // 1. Job paidAmount should equal min(agreedPrice, SUM(job_payments for that job))
  for (const job of jobs) {
    const ledgerTotal = jobPayments
      .filter(p => p.jobId === job.id)
      .reduce((sum, p) => sum + p.amount, 0);
    const expected = Math.min(job.agreedPrice, ledgerTotal);

    if (Math.abs(expected - job.paidAmount) > EPSILON) {
      issues.push({
        type: 'job_paid_amount_mismatch',
        severity: 'error',
        recordId: job.id,
        message: `Job "${job.title}" shows ${job.paidAmount.toLocaleString('fr-MA')} MAD paid, but its payment ledger sums to ${ledgerTotal.toLocaleString('fr-MA')} MAD (expected ${expected.toLocaleString('fr-MA')} MAD).`
      });
    }

    if (job.paidAmount > job.agreedPrice + EPSILON) {
      issues.push({
        type: 'job_overpaid',
        severity: 'warning',
        recordId: job.id,
        message: `Job "${job.title}" has paidAmount (${job.paidAmount.toLocaleString('fr-MA')} MAD) greater than its agreedPrice (${job.agreedPrice.toLocaleString('fr-MA')} MAD).`
      });
    }
  }

  // 2. Every job_payment must reference an existing job
  const jobIds = new Set(jobs.map(j => j.id));
  for (const payment of jobPayments) {
    if (!jobIds.has(payment.jobId)) {
      issues.push({
        type: 'orphaned_job_payment',
        severity: 'error',
        recordId: payment.id,
        message: `Payment of ${payment.amount.toLocaleString('fr-MA')} MAD dated ${payment.date} references a job that no longer exists.`
      });
    }
  }

  // 3. Every job_intervention must reference an existing job
  for (const intervention of jobInterventions) {
    if (!jobIds.has(intervention.jobId)) {
      issues.push({
        type: 'orphaned_job_intervention',
        severity: 'error',
        recordId: intervention.id,
        message: `Client callback dated ${intervention.date} references a job that no longer exists.`
      });
    }
  }

  // 4. Debt remainingBalance should equal max(0, totalAmount - SUM(debt_payments))
  for (const debt of debts) {
    const ledgerTotal = debtPayments
      .filter(p => p.debtId === debt.id)
      .reduce((sum, p) => sum + p.amount, 0);
    const expected = Math.max(0, debt.totalAmount - ledgerTotal);

    if (Math.abs(expected - debt.remainingBalance) > EPSILON) {
      issues.push({
        type: 'debt_balance_mismatch',
        severity: 'error',
        recordId: debt.id,
        message: `Debt "${debt.creditor}" shows ${debt.remainingBalance.toLocaleString('fr-MA')} MAD remaining, but total (${debt.totalAmount.toLocaleString('fr-MA')} MAD) minus payments (${ledgerTotal.toLocaleString('fr-MA')} MAD) is ${expected.toLocaleString('fr-MA')} MAD.`
      });
    }

    if (ledgerTotal > debt.totalAmount + EPSILON) {
      issues.push({
        type: 'debt_overpaid',
        severity: 'warning',
        recordId: debt.id,
        message: `Debt "${debt.creditor}" has received ${ledgerTotal.toLocaleString('fr-MA')} MAD in payments, more than its original amount (${debt.totalAmount.toLocaleString('fr-MA')} MAD).`
      });
    }
  }

  // 5. Every debt_payment must reference an existing debt
  const debtIds = new Set(debts.map(d => d.id));
  for (const payment of debtPayments) {
    if (!debtIds.has(payment.debtId)) {
      issues.push({
        type: 'orphaned_debt_payment',
        severity: 'error',
        recordId: payment.id,
        message: `Debt payment of ${payment.amount.toLocaleString('fr-MA')} MAD dated ${payment.date} references a debt that no longer exists.`
      });
    }
  }

  // 6. Duplicate clients (same name, case-insensitive)
  const nameCounts = new Map<string, number>();
  for (const client of clients) {
    const key = client.name.trim().toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
  }
  for (const [name, count] of nameCounts) {
    if (count > 1) {
      issues.push({
        type: 'duplicate_client',
        severity: 'warning',
        recordId: name,
        message: `${count} client records share the name "${name}".`
      });
    }
  }

  // 7. Non-positive expense amounts (blocked going forward by server validation;
  // this catches records that predate it)
  for (const exp of businessExpenses) {
    if (exp.amount <= 0) {
      issues.push({
        type: 'non_positive_amount',
        severity: 'warning',
        recordId: exp.id,
        message: `Business expense "${exp.title}" has a non-positive amount (${exp.amount} MAD).`
      });
    }
  }
  for (const exp of personalExpenses) {
    if (exp.amount <= 0) {
      issues.push({
        type: 'non_positive_amount',
        severity: 'warning',
        recordId: exp.id,
        message: `Personal expense "${exp.title}" has a non-positive amount (${exp.amount} MAD).`
      });
    }
  }

  const recordsChecked =
    jobs.length +
    jobPayments.length +
    jobInterventions.length +
    debts.length +
    debtPayments.length +
    businessExpenses.length +
    personalExpenses.length +
    clients.length;

  return {
    checkedAt: new Date().toISOString(),
    recordsChecked,
    issues
  };
}
