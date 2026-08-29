// ==========================================
// FINANCIAL ENGINE - OBJECTIVE FACTUAL INSIGHTS
// ==========================================

import type { FinancialMetrics, FactualInsight, Job, DebtObligation } from '../../types';
import { calculateMonthlyDebtCommitments } from './debt';

/**
 * Generates non-emotional, purely factual observations based on calculations.
 * STRICT POLICY: Zero emotional fluff ("Good job!", "You're a champion!").
 * Only data-driven observations.
 */
export function generateFactualInsights(
  metrics: FinancialMetrics,
  jobs: Job[],
  debts: DebtObligation[]
): FactualInsight[] {
  const insights: FactualInsight[] = [];

  // 1. Revision Requested Alert
  const revisionJobs = jobs.filter(j => j.status === 'revision_requested');
  if (revisionJobs.length > 0) {
    insights.push({
      id: 'revision_requested_alert',
      type: 'warning',
      title: 'Client Revision Requested',
      message: `${revisionJobs.length} job(s) re-opened following client modification request.`,
      metric: `${revisionJobs.length} Job(s)`
    });
  }

  // 2. Waiting Parts Alert (Parts from another city)
  const waitingPartsJobs = jobs.filter(j => j.status === 'waiting_parts');
  if (waitingPartsJobs.length > 0) {
    insights.push({
      id: 'waiting_parts_alert',
      type: 'info',
      title: 'Paused: Waiting for Equipment/Parts',
      message: `${waitingPartsJobs.length} job(s) paused while sourcing equipment or parts from another city.`,
      metric: `${waitingPartsJobs.length} Paused`
    });
  }

  // 3. Uncollected Revenue Insight
  if (metrics.uncollectedRevenue > 0) {
    const uncollectedCount = jobs.filter(
      j => (j.agreedPrice || 0) > (j.paidAmount || 0)
    ).length;
    insights.push({
      id: 'uncollected_cash',
      type: 'warning',
      title: 'Uncollected Client Payments',
      message: `${metrics.uncollectedRevenue.toLocaleString('fr-MA')} MAD owed across ${uncollectedCount} job(s).`,
      metric: `${metrics.uncollectedRevenue.toLocaleString('fr-MA')} MAD`
    });
  }

  // 4. Available Cash vs Monthly Debt Obligations
  const minMonthlyDebt = calculateMonthlyDebtCommitments(debts);

  if (minMonthlyDebt > 0 && metrics.availableCash < minMonthlyDebt) {
    const deficit = minMonthlyDebt - metrics.availableCash;
    insights.push({
      id: 'debt_coverage_warning',
      type: 'warning',
      title: 'Monthly Debt Coverage Shortfall',
      message: `Available cash (${metrics.availableCash.toLocaleString('fr-MA')} MAD) is below monthly minimum debt obligations (${minMonthlyDebt.toLocaleString('fr-MA')} MAD). Deficit: ${deficit.toLocaleString('fr-MA')} MAD.`,
      metric: `-${deficit.toLocaleString('fr-MA')} MAD`
    });
  }

  // 5. Profit Margin Observation
  if (metrics.collectedIncome > 0) {
    insights.push({
      id: 'net_profit_margin',
      type: metrics.profitMarginPercent >= 40 ? 'positive' : 'info',
      title: 'Net Profit Margin Rate',
      message: `Net profit represents ${metrics.profitMarginPercent.toFixed(1)}% of total collected cash income.`,
      metric: `${metrics.profitMarginPercent.toFixed(1)}%`
    });
  }

  // 6. Quote Conversion Observation
  if (metrics.quoteLostCount > 0) {
    insights.push({
      id: 'quote_conversion_rate',
      type: metrics.quoteConversionRatePercent >= 50 ? 'positive' : 'info',
      title: 'Quote Conversion Rate',
      message: `${metrics.quoteConversionRatePercent.toFixed(0)}% of quoted jobs were won. ${metrics.quoteLostCount} quote(s) declined by the client.`,
      metric: `${metrics.quoteConversionRatePercent.toFixed(0)}%`
    });
  }

  // 7. Unresolved Client Callback Observation
  if (metrics.unresolvedInterventionsCount > 0) {
    insights.push({
      id: 'unresolved_callbacks',
      type: 'warning',
      title: 'Open Client Callbacks',
      message: `${metrics.unresolvedInterventionsCount} client-requested follow-up visit(s) still unresolved across ${metrics.jobsWithInterventionsCount} job(s).`,
      metric: `${metrics.unresolvedInterventionsCount} Open`
    });
  }

  // 8. Active Debt Load Observation
  if (metrics.totalDebtOutstanding > 0) {
    insights.push({
      id: 'debt_burden',
      type: 'info',
      title: 'Total Debt Obligation Load',
      message: `Remaining total debt balance is ${metrics.totalDebtOutstanding.toLocaleString('fr-MA')} MAD across ${metrics.activeDebtCount} creditor(s).`,
      metric: `${metrics.totalDebtOutstanding.toLocaleString('fr-MA')} MAD`
    });
  }

  return insights;
}
