// ==========================================
// STORAGE LAYER - LOCAL REPOSITORY IMPLEMENTATION
// Fast, resilient browser-based persistence
// ==========================================

import type { IDataRepository } from './repository';
import type { Job, BusinessExpense, PersonalExpense, DebtObligation, DebtPayment, Client } from '../../types';
import {
  INITIAL_JOBS,
  INITIAL_BUSINESS_EXPENSES,
  INITIAL_PERSONAL_EXPENSES,
  INITIAL_DEBTS,
  INITIAL_DEBT_PAYMENTS,
  INITIAL_CLIENTS
} from './seedData';

const KEYS = {
  JOBS: 'mh_jobs_v2',
  BUSINESS_EXPENSES: 'mh_biz_expenses_v2',
  PERSONAL_EXPENSES: 'mh_personal_expenses_v2',
  DEBTS: 'mh_debts_v2',
  DEBT_PAYMENTS: 'mh_debt_payments_v2',
  CLIENTS: 'mh_clients_v2'
};

export class LocalRepository implements IDataRepository {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!localStorage.getItem(KEYS.JOBS)) {
      localStorage.setItem(KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
    }
    if (!localStorage.getItem(KEYS.BUSINESS_EXPENSES)) {
      localStorage.setItem(KEYS.BUSINESS_EXPENSES, JSON.stringify(INITIAL_BUSINESS_EXPENSES));
    }
    if (!localStorage.getItem(KEYS.PERSONAL_EXPENSES)) {
      localStorage.setItem(KEYS.PERSONAL_EXPENSES, JSON.stringify(INITIAL_PERSONAL_EXPENSES));
    }
    if (!localStorage.getItem(KEYS.DEBTS)) {
      localStorage.setItem(KEYS.DEBTS, JSON.stringify(INITIAL_DEBTS));
    }
    if (!localStorage.getItem(KEYS.DEBT_PAYMENTS)) {
      localStorage.setItem(KEYS.DEBT_PAYMENTS, JSON.stringify(INITIAL_DEBT_PAYMENTS));
    }
    if (!localStorage.getItem(KEYS.CLIENTS)) {
      localStorage.setItem(KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    }
  }

  // --- JOBS ---
  async getJobs(): Promise<Job[]> {
    const raw = localStorage.getItem(KEYS.JOBS);
    return raw ? JSON.parse(raw) : [];
  }

  async saveJob(job: Job): Promise<Job> {
    const jobs = await this.getJobs();
    const index = jobs.findIndex(j => j.id === job.id);
    if (index >= 0) {
      jobs[index] = job;
    } else {
      jobs.unshift(job);
    }
    localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));

    // Auto-upsert client if name provided
    if (job.clientName) {
      await this.autoRegisterClient(job.clientName, job.clientPhone);
    }
    return job;
  }

  async deleteJob(id: string): Promise<boolean> {
    const jobs = await this.getJobs();
    const filtered = jobs.filter(j => j.id !== id);
    localStorage.setItem(KEYS.JOBS, JSON.stringify(filtered));
    return true;
  }

  // --- BUSINESS EXPENSES ---
  async getBusinessExpenses(): Promise<BusinessExpense[]> {
    const raw = localStorage.getItem(KEYS.BUSINESS_EXPENSES);
    return raw ? JSON.parse(raw) : [];
  }

  async saveBusinessExpense(expense: BusinessExpense): Promise<BusinessExpense> {
    const expenses = await this.getBusinessExpenses();
    const index = expenses.findIndex(e => e.id === expense.id);
    if (index >= 0) {
      expenses[index] = expense;
    } else {
      expenses.unshift(expense);
    }
    localStorage.setItem(KEYS.BUSINESS_EXPENSES, JSON.stringify(expenses));
    return expense;
  }

  async deleteBusinessExpense(id: string): Promise<boolean> {
    const expenses = await this.getBusinessExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    localStorage.setItem(KEYS.BUSINESS_EXPENSES, JSON.stringify(filtered));
    return true;
  }

  // --- PERSONAL EXPENSES ---
  async getPersonalExpenses(): Promise<PersonalExpense[]> {
    const raw = localStorage.getItem(KEYS.PERSONAL_EXPENSES);
    return raw ? JSON.parse(raw) : [];
  }

  async savePersonalExpense(expense: PersonalExpense): Promise<PersonalExpense> {
    const expenses = await this.getPersonalExpenses();
    const index = expenses.findIndex(e => e.id === expense.id);
    if (index >= 0) {
      expenses[index] = expense;
    } else {
      expenses.unshift(expense);
    }
    localStorage.setItem(KEYS.PERSONAL_EXPENSES, JSON.stringify(expenses));
    return expense;
  }

  async deletePersonalExpense(id: string): Promise<boolean> {
    const expenses = await this.getPersonalExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    localStorage.setItem(KEYS.PERSONAL_EXPENSES, JSON.stringify(filtered));
    return true;
  }

  // --- DEBTS & PAYMENTS ---
  async getDebtObligations(): Promise<DebtObligation[]> {
    const raw = localStorage.getItem(KEYS.DEBTS);
    return raw ? JSON.parse(raw) : [];
  }

  async saveDebtObligation(debt: DebtObligation): Promise<DebtObligation> {
    const debts = await this.getDebtObligations();
    const index = debts.findIndex(d => d.id === debt.id);
    if (index >= 0) {
      debts[index] = debt;
    } else {
      debts.unshift(debt);
    }
    localStorage.setItem(KEYS.DEBTS, JSON.stringify(debts));
    return debt;
  }

  async deleteDebtObligation(id: string): Promise<boolean> {
    const debts = await this.getDebtObligations();
    const filtered = debts.filter(d => d.id !== id);
    localStorage.setItem(KEYS.DEBTS, JSON.stringify(filtered));
    return true;
  }

  async getDebtPayments(): Promise<DebtPayment[]> {
    const raw = localStorage.getItem(KEYS.DEBT_PAYMENTS);
    return raw ? JSON.parse(raw) : [];
  }

  async saveDebtPayment(payment: DebtPayment): Promise<DebtPayment> {
    const payments = await this.getDebtPayments();
    payments.unshift(payment);
    localStorage.setItem(KEYS.DEBT_PAYMENTS, JSON.stringify(payments));

    // Update remaining balance on debt entity automatically
    const debts = await this.getDebtObligations();
    const debtIndex = debts.findIndex(d => d.id === payment.debtId);
    if (debtIndex >= 0) {
      const debt = debts[debtIndex];
      debt.remainingBalance = Math.max(0, debt.remainingBalance - payment.amount);
      if (debt.remainingBalance === 0) {
        debt.status = 'paid_off';
      }
      debts[debtIndex] = debt;
      localStorage.setItem(KEYS.DEBTS, JSON.stringify(debts));
    }

    return payment;
  }

  // --- CLIENTS ---
  async getClients(): Promise<Client[]> {
    const raw = localStorage.getItem(KEYS.CLIENTS);
    return raw ? JSON.parse(raw) : [];
  }

  async saveClient(client: Client): Promise<Client> {
    const clients = await this.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) {
      clients[index] = client;
    } else {
      clients.unshift(client);
    }
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
    return client;
  }

  private async autoRegisterClient(name: string, phone?: string) {
    const clients = await this.getClients();
    const existing = clients.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (!existing) {
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        name,
        phone
      };
      await this.saveClient(newClient);
    }
  }

  // --- BACKUP / RESTORE ---
  async exportAllData(): Promise<string> {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      jobs: await this.getJobs(),
      businessExpenses: await this.getBusinessExpenses(),
      personalExpenses: await this.getPersonalExpenses(),
      debts: await this.getDebtObligations(),
      debtPayments: await this.getDebtPayments(),
      clients: await this.getClients()
    };
    return JSON.stringify(dump, null, 2);
  }

  async importAllData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data.jobs) localStorage.setItem(KEYS.JOBS, JSON.stringify(data.jobs));
      if (data.businessExpenses) localStorage.setItem(KEYS.BUSINESS_EXPENSES, JSON.stringify(data.businessExpenses));
      if (data.personalExpenses) localStorage.setItem(KEYS.PERSONAL_EXPENSES, JSON.stringify(data.personalExpenses));
      if (data.debts) localStorage.setItem(KEYS.DEBTS, JSON.stringify(data.debts));
      if (data.debtPayments) localStorage.setItem(KEYS.DEBT_PAYMENTS, JSON.stringify(data.debtPayments));
      if (data.clients) localStorage.setItem(KEYS.CLIENTS, JSON.stringify(data.clients));
      return true;
    } catch {
      return false;
    }
  }

  async resetToSeedData(): Promise<void> {
    localStorage.setItem(KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
    localStorage.setItem(KEYS.BUSINESS_EXPENSES, JSON.stringify(INITIAL_BUSINESS_EXPENSES));
    localStorage.setItem(KEYS.PERSONAL_EXPENSES, JSON.stringify(INITIAL_PERSONAL_EXPENSES));
    localStorage.setItem(KEYS.DEBTS, JSON.stringify(INITIAL_DEBTS));
    localStorage.setItem(KEYS.DEBT_PAYMENTS, JSON.stringify(INITIAL_DEBT_PAYMENTS));
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
  }
}

export const repository = new LocalRepository();
