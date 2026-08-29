// ==========================================
// STORAGE LAYER - REPOSITORY PATTERN INTERFACE
// Ready for local browser storage & future Vercel Postgres / Supabase cloud sync
// ==========================================

import type { Job, BusinessExpense, PersonalExpense, DebtObligation, DebtPayment, JobPayment, Client } from '../../types';

export interface IDataRepository {
  // Jobs
  getJobs(): Promise<Job[]>;
  saveJob(job: Job): Promise<Job>;
  deleteJob(id: string): Promise<boolean>;
  getJobPayments(): Promise<JobPayment[]>;
  saveJobPayment(payment: JobPayment): Promise<JobPayment>;

  // Business Expenses
  getBusinessExpenses(): Promise<BusinessExpense[]>;
  saveBusinessExpense(expense: BusinessExpense): Promise<BusinessExpense>;
  deleteBusinessExpense(id: string): Promise<boolean>;

  // Personal Expenses
  getPersonalExpenses(): Promise<PersonalExpense[]>;
  savePersonalExpense(expense: PersonalExpense): Promise<PersonalExpense>;
  deletePersonalExpense(id: string): Promise<boolean>;

  // Debts & Payments
  getDebtObligations(): Promise<DebtObligation[]>;
  saveDebtObligation(debt: DebtObligation): Promise<DebtObligation>;
  deleteDebtObligation(id: string): Promise<boolean>;
  getDebtPayments(): Promise<DebtPayment[]>;
  saveDebtPayment(payment: DebtPayment): Promise<DebtPayment>;

  // Clients
  getClients(): Promise<Client[]>;
  saveClient(client: Client): Promise<Client>;

  // Backup & Import/Export
  exportAllData(): Promise<string>; // Returns JSON string
  importAllData(jsonString: string): Promise<boolean>;
  clearAllData(): Promise<boolean>;
}
