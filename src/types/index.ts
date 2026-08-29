// ==========================================
// MOROCCAN HANDYMAN DECISION-SUPPORT SYSTEM
// Core Entity Schemas & Type Definitions
// ==========================================

export type JobStatus =
  | 'quoted'             // Price quoted / Devis envoyé
  | 'quote_lost'         // Client declined the quote / lead did not convert
  | 'in_progress'        // Active work
  | 'waiting_parts'      // Waiting for parts/equipment from another city
  | 'completed'          // Finished work
  | 'revision_requested' // Client requested modifications
  | 'paid';              // Paid & Closed

export type JobCategory =
  | 'CCTV Installation'
  | 'IP Camera Installation'
  | 'Camera Error / Repair'
  | 'Satellite Dish (Parabole)'
  | 'Câblage (Network & Cable)'
  | 'TV Repair'
  | 'Printer Repair & Maintenance'
  | 'Informatique (IT & Hardware)'
  | 'Fiber Sharing (Partage Fibre)';

export type BusinessExpenseCategory =
  | 'Tools & Equipment (Outillage)'
  | 'Transport & Fuel (Carburant)'
  | 'Materials & droguerie (Fournitures)'
  | 'Licenses & Permits (Patente)'
  | 'Workshop & Storage (Atelier)'
  | 'Other Business Expense';

export type PersonalExpenseCategory =
  // Household (shared family spending)
  | 'Food & Groceries (Alimentation)'
  | 'Housing & Rent (Loyer)'
  | 'Utilities & Phone (Eau, Électricité, Recharge)'
  | 'Family & Children (Famille / Enfants)'
  | 'Healthcare & Medical (Santé)'
  | 'Other Household Expense'
  // Personal (just for you)
  | 'Café & Snacks (Café / Thé / Snacks)'
  | 'Gaming & Entertainment (Gaming / Loisirs)'
  | 'Personal Pocket Money (Loisirs & Sorties)'
  | 'Other Personal Expense';

export type PersonalExpenseScope = 'household' | 'individual';

export type DebtType =
  | 'business_supplier' // e.g. Droguerie credit line
  | 'personal_loan'     // e.g. Bank / Microfinance
  | 'family_friend'     // e.g. Family member loan
  | 'equipment_finance';// e.g. Van/motorcycle payment

export type AcquisitionSource =
  | 'Friend (Recommandation)'
  | 'Business Card (Carte de visite)'
  | 'Droguerie (Recommandation)'
  | 'Mustapha Alliance'
  | 'Mestour'
  | string;

export interface JobActivityLog {
  id: string;
  timestamp: string;     // ISO Date or Time string
  status: JobStatus;
  note: string;          // e.g. "Waiting for Dahua NVR part from Casablanca"
}

export interface Job {
  id: string;
  title: string;
  clientName: string;
  clientPhone?: string;
  category: JobCategory | string;
  status: JobStatus;
  agreedPrice: number;     // Revenue agreed upon (MAD)
  paidAmount: number;      // Actual cash collected for this job so far (MAD)
  materialCosts: number;   // Material / subcontractor expenses for job (MAD)
  startDate: string;       // ISO date YYYY-MM-DD
  completedDate?: string;
  acquisitionSource?: AcquisitionSource; // Lead source channel
  waitingReason?: string;  // e.g. "Waiting for NVR parts from Rabat"
  daysSpent?: number;      // Hands-on work days
  daysPaused?: number;     // Days blocked waiting for parts/client
  logs?: JobActivityLog[]; // Timeline activity history
  notes?: string;
}

export interface BusinessExpense {
  id: string;
  title: string;
  amount: number;          // MAD
  category: BusinessExpenseCategory | string;
  date: string;            // ISO date YYYY-MM-DD
  jobId?: string;          // Optional link to specific job
  notes?: string;
}

export interface PersonalExpense {
  id: string;
  title: string;
  amount: number;          // MAD
  category: PersonalExpenseCategory | string;
  date: string;            // ISO date YYYY-MM-DD
  notes?: string;
}

export interface DebtObligation {
  id: string;
  creditor: string;        // e.g. "Droguerie Al Amine", "Banque Populaire Micro"
  type: DebtType;
  totalAmount: number;     // Original debt (MAD)
  remainingBalance: number;// Current unpaid balance (MAD)
  monthlyMinPayment?: number;
  dueDate?: string;        // Next payment due date YYYY-MM-DD
  status: 'active' | 'paid_off';
  notes?: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;          // MAD
  date: string;            // ISO date YYYY-MM-DD
  notes?: string;
}

export interface JobPayment {
  id: string;
  jobId: string;
  amount: number;          // MAD, cash actually received on this date
  date: string;            // ISO date YYYY-MM-DD
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  city?: string;
  acquisitionSource?: AcquisitionSource;
  notes?: string;
}

export interface AcquisitionSummary {
  source: string;
  jobCount: number;
  totalAgreed: number;
  totalCollected: number;
}

// ------------------------------------------
// COMPUTED FINANCIAL ENGINE METRICS
// ------------------------------------------

export interface FinancialMetrics {
  // 1. Earned
  totalRevenueAgreed: number;   // Total value of all completed/paid jobs
  collectedIncome: number;      // Real cash collected in hand
  uncollectedRevenue: number;   // Agreed money still owed by clients

  // 2. Spent
  directJobCosts: number;       // Materials for jobs
  businessOverhead: number;     // Fuel, tools, workshop expenses
  totalBusinessCosts: number;   // directJobCosts + businessOverhead
  totalPersonalSpending: number;// Food, rent, family, medical
  householdSpending: number;    // Family/shared personal spending (rent, groceries, kids, health...)
  individualSpending: number;   // Just-for-you personal spending (café, gaming, pocket money...)
  totalDebtPaid: number;        // Principal & interest paid to loans/suppliers

  // Financial Truth Indicators
  netBusinessProfit: number;    // Collected Income - Total Business Costs
  netCashFlow: number;          // Collected Income - Business Costs - Personal Spending - Debt Payments
  availableCash: number;        // Total net cash remaining available right now

  // Debt Overview
  totalDebtOutstanding: number; // Remaining sum across all active debt obligations
  activeDebtCount: number;

  // Key Ratios
  profitMarginPercent: number;  // (Net Business Profit / Collected Income) * 100
  uncollectedRatioPercent: number; // (Uncollected Revenue / Total Revenue) * 100

  // Job Status Counters
  waitingPartsCount: number;
  revisionRequestedCount: number;
  quoteLostCount: number;
  quoteConversionRatePercent: number; // Won jobs / (Won + Lost quotes) * 100
}

export interface FactualInsight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  title: string;
  message: string;
  metric?: string;
}
