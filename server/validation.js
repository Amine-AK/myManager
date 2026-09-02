import { z } from 'zod';

// ==========================================
// SERVER-SIDE VALIDATION SCHEMAS
// Every write route validates its body here before it reaches the database.
// Client-side checks (React forms) are a UX convenience, not a trust boundary.
// ==========================================

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected an ISO date (YYYY-MM-DD)');
const id = z.string().min(1);
const money = z.number().finite().min(0);

const JOB_STATUSES = ['quoted', 'quote_lost', 'in_progress', 'waiting_parts', 'completed', 'revision_requested', 'paid'];

const jobActivityLogSchema = z.object({
  id: id,
  timestamp: isoDate,
  status: z.enum(JOB_STATUSES),
  note: z.string(),
  hoursSpent: z.number().finite().min(0).optional()
});

export const jobSchema = z.object({
  id: id,
  title: z.string().min(1),
  clientName: z.string().min(1),
  clientPhone: z.string().optional(),
  category: z.string().min(1),
  status: z.enum(JOB_STATUSES),
  agreedPrice: money.refine(v => v > 0, 'agreedPrice must be greater than 0'),
  paidAmount: money,
  materialCosts: money,
  startDate: isoDate,
  completedDate: isoDate.optional(),
  acquisitionSource: z.string().optional(),
  waitingReason: z.string().optional(),
  daysSpent: z.number().int().optional(),
  daysPaused: z.number().int().optional(),
  logs: z.array(jobActivityLogSchema).optional(),
  notes: z.string().optional()
});

export const jobPaymentSchema = z.object({
  id: id,
  jobId: id,
  amount: money.refine(v => v > 0, 'amount must be greater than 0'),
  date: isoDate,
  notes: z.string().optional()
});

export const collectJobPaymentSchema = z.object({
  payment: z.object({
    id: id,
    amount: money.refine(v => v > 0, 'amount must be greater than 0'),
    date: isoDate,
    notes: z.string().optional()
  }),
  jobUpdate: z.object({
    status: z.enum(JOB_STATUSES),
    completedDate: isoDate.optional(),
    logEntry: jobActivityLogSchema
  })
});

export const jobInterventionSchema = z.object({
  id: id,
  jobId: id,
  date: isoDate,
  reason: z.string().min(1),
  resolved: z.boolean(),
  resolvedDate: isoDate.optional(),
  hoursSpent: z.number().finite().min(0).optional(),
  notes: z.string().optional()
});

export const businessExpenseSchema = z.object({
  id: id,
  title: z.string().min(1),
  amount: money.refine(v => v > 0, 'amount must be greater than 0'),
  category: z.string().min(1),
  date: isoDate,
  notes: z.string().optional()
});

export const personalExpenseSchema = z.object({
  id: id,
  title: z.string().min(1),
  amount: money.refine(v => v > 0, 'amount must be greater than 0'),
  category: z.string().min(1),
  date: isoDate,
  notes: z.string().optional()
});

export const debtSchema = z.object({
  id: id,
  creditor: z.string().min(1),
  type: z.enum(['business_supplier', 'personal_loan', 'family_friend', 'equipment_finance']),
  totalAmount: money.refine(v => v > 0, 'totalAmount must be greater than 0'),
  remainingBalance: money,
  monthlyMinPayment: money.optional(),
  dueDate: isoDate.optional(),
  status: z.enum(['active', 'paid_off']),
  notes: z.string().optional()
});

export const debtPaymentSchema = z.object({
  id: id,
  debtId: id,
  amount: money.refine(v => v > 0, 'amount must be greater than 0'),
  date: isoDate,
  notes: z.string().optional()
});

export const clientSchema = z.object({
  id: id,
  name: z.string().min(1),
  phone: z.string().optional(),
  city: z.string().optional(),
  acquisitionSource: z.string().optional(),
  notes: z.string().optional()
});

/**
 * Express middleware factory: validates req.body against `schema`,
 * replaces req.body with the parsed (typed, defaulted) result, or
 * responds 400 with the first validation issue.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return res.status(400).json({
        error: `Invalid ${firstIssue.path.join('.') || 'request body'}: ${firstIssue.message}`
      });
    }
    req.body = result.data;
    next();
  };
}
