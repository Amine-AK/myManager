import { neon } from '@neondatabase/serverless';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

let sql = null;
if (connectionString) {
  try {
    sql = neon(connectionString);
    console.log('🐘 Connected to Neon PostgreSQL database!');
  } catch (err) {
    console.error('Neon connection failed, falling back to JSON files:', err.message);
  }
}

// Auto-initialize Neon PostgreSQL tables
export async function initDb() {
  if (!sql) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        client_name TEXT NOT NULL,
        client_phone TEXT,
        category TEXT NOT NULL,
        status TEXT NOT NULL,
        agreed_price NUMERIC NOT NULL,
        paid_amount NUMERIC NOT NULL DEFAULT 0,
        material_costs NUMERIC NOT NULL DEFAULT 0,
        start_date TEXT NOT NULL,
        completed_date TEXT,
        acquisition_source TEXT,
        waiting_reason TEXT,
        days_spent INT DEFAULT 1,
        days_paused INT DEFAULT 0,
        logs JSONB DEFAULT '[]'::jsonb
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS business_expenses (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        job_id TEXT,
        notes TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS personal_expenses (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS debts (
        id VARCHAR(255) PRIMARY KEY,
        creditor TEXT NOT NULL,
        type TEXT NOT NULL,
        total_amount NUMERIC NOT NULL,
        remaining_balance NUMERIC NOT NULL,
        monthly_min_payment NUMERIC,
        due_date TEXT,
        status TEXT NOT NULL,
        notes TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS debt_payments (
        id VARCHAR(255) PRIMARY KEY,
        debt_id TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        date TEXT NOT NULL,
        notes TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        city TEXT,
        acquisition_source TEXT,
        notes TEXT
      );
    `;

    console.log('✅ Neon PostgreSQL tables initialized successfully.');
  } catch (err) {
    console.error('Error initializing Neon DB tables:', err);
  }
}

// Helper functions for JSON disk file fallback
async function readJson(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJson(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// --- JOBS REPOSITORY METHODS ---
export async function getJobsDb() {
  if (sql) {
    const rows = await sql`SELECT * FROM jobs ORDER BY start_date DESC;`;
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      clientName: r.client_name,
      clientPhone: r.client_phone || undefined,
      category: r.category,
      status: r.status,
      agreedPrice: parseFloat(r.agreed_price),
      paidAmount: parseFloat(r.paid_amount),
      materialCosts: parseFloat(r.material_costs),
      startDate: r.start_date,
      completedDate: r.completed_date || undefined,
      acquisitionSource: r.acquisition_source || undefined,
      waitingReason: r.waiting_reason || undefined,
      daysSpent: r.days_spent || 1,
      daysPaused: r.days_paused || 0,
      logs: r.logs || []
    }));
  }
  return await readJson('jobs.json');
}

export async function saveJobDb(job) {
  if (sql) {
    await sql`
      INSERT INTO jobs (
        id, title, client_name, client_phone, category, status,
        agreed_price, paid_amount, material_costs, start_date,
        completed_date, acquisition_source, waiting_reason, days_spent, days_paused, logs
      ) VALUES (
        ${job.id}, ${job.title}, ${job.clientName}, ${job.clientPhone || null}, ${job.category}, ${job.status},
        ${job.agreedPrice}, ${job.paidAmount || 0}, ${job.materialCosts || 0}, ${job.startDate},
        ${job.completedDate || null}, ${job.acquisitionSource || null}, ${job.waitingReason || null},
        ${job.daysSpent || 1}, ${job.daysPaused || 0}, ${JSON.stringify(job.logs || [])}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        client_name = EXCLUDED.client_name,
        client_phone = EXCLUDED.client_phone,
        category = EXCLUDED.category,
        status = EXCLUDED.status,
        agreed_price = EXCLUDED.agreed_price,
        paid_amount = EXCLUDED.paid_amount,
        material_costs = EXCLUDED.material_costs,
        start_date = EXCLUDED.start_date,
        completed_date = EXCLUDED.completed_date,
        acquisition_source = EXCLUDED.acquisition_source,
        waiting_reason = EXCLUDED.waiting_reason,
        days_spent = EXCLUDED.days_spent,
        days_paused = EXCLUDED.days_paused,
        logs = EXCLUDED.logs;
    `;

    // Auto upsert client
    if (job.clientName) {
      await saveClientDb({
        id: `cli-${Date.now()}`,
        name: job.clientName,
        phone: job.clientPhone,
        acquisitionSource: job.acquisitionSource
      });
    }

    return job;
  }

  const jobs = await readJson('jobs.json');
  const index = jobs.findIndex(j => j.id === job.id);
  if (index >= 0) jobs[index] = job;
  else jobs.unshift(job);
  await writeJson('jobs.json', jobs);
  return job;
}

export async function deleteJobDb(id) {
  if (sql) {
    await sql`DELETE FROM jobs WHERE id = ${id};`;
    return true;
  }
  const jobs = await readJson('jobs.json');
  await writeJson('jobs.json', jobs.filter(j => j.id !== id));
  return true;
}

// --- BUSINESS EXPENSES ---
export async function getBusinessExpensesDb() {
  if (sql) {
    const rows = await sql`SELECT * FROM business_expenses ORDER BY date DESC;`;
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      amount: parseFloat(r.amount),
      category: r.category,
      date: r.date,
      jobId: r.job_id || undefined,
      notes: r.notes || undefined
    }));
  }
  return await readJson('business_expenses.json');
}

export async function saveBusinessExpenseDb(exp) {
  if (sql) {
    await sql`
      INSERT INTO business_expenses (id, title, amount, category, date, job_id, notes)
      VALUES (${exp.id}, ${exp.title}, ${exp.amount}, ${exp.category}, ${exp.date}, ${exp.jobId || null}, ${exp.notes || null})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        amount = EXCLUDED.amount,
        category = EXCLUDED.category,
        date = EXCLUDED.date,
        job_id = EXCLUDED.job_id,
        notes = EXCLUDED.notes;
    `;
    return exp;
  }

  const expenses = await readJson('business_expenses.json');
  const index = expenses.findIndex(e => e.id === exp.id);
  if (index >= 0) expenses[index] = exp;
  else expenses.unshift(exp);
  await writeJson('business_expenses.json', expenses);
  return exp;
}

export async function deleteBusinessExpenseDb(id) {
  if (sql) {
    await sql`DELETE FROM business_expenses WHERE id = ${id};`;
    return true;
  }
  const expenses = await readJson('business_expenses.json');
  await writeJson('business_expenses.json', expenses.filter(e => e.id !== id));
  return true;
}

// --- PERSONAL EXPENSES ---
export async function getPersonalExpensesDb() {
  if (sql) {
    const rows = await sql`SELECT * FROM personal_expenses ORDER BY date DESC;`;
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      amount: parseFloat(r.amount),
      category: r.category,
      date: r.date,
      notes: r.notes || undefined
    }));
  }
  return await readJson('personal_expenses.json');
}

export async function savePersonalExpenseDb(exp) {
  if (sql) {
    await sql`
      INSERT INTO personal_expenses (id, title, amount, category, date, notes)
      VALUES (${exp.id}, ${exp.title}, ${exp.amount}, ${exp.category}, ${exp.date}, ${exp.notes || null})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        amount = EXCLUDED.amount,
        category = EXCLUDED.category,
        date = EXCLUDED.date,
        notes = EXCLUDED.notes;
    `;
    return exp;
  }

  const expenses = await readJson('personal_expenses.json');
  const index = expenses.findIndex(e => e.id === exp.id);
  if (index >= 0) expenses[index] = exp;
  else expenses.unshift(exp);
  await writeJson('personal_expenses.json', expenses);
  return exp;
}

export async function deletePersonalExpenseDb(id) {
  if (sql) {
    await sql`DELETE FROM personal_expenses WHERE id = ${id};`;
    return true;
  }
  const expenses = await readJson('personal_expenses.json');
  await writeJson('personal_expenses.json', expenses.filter(e => e.id !== id));
  return true;
}

// --- DEBTS & PAYMENTS ---
export async function getDebtsDb() {
  if (sql) {
    const rows = await sql`SELECT * FROM debts ORDER BY status ASC;`;
    return rows.map(r => ({
      id: r.id,
      creditor: r.creditor,
      type: r.type,
      totalAmount: parseFloat(r.total_amount),
      remainingBalance: parseFloat(r.remaining_balance),
      monthlyMinPayment: r.monthly_min_payment ? parseFloat(r.monthly_min_payment) : undefined,
      dueDate: r.due_date || undefined,
      status: r.status,
      notes: r.notes || undefined
    }));
  }
  return await readJson('debts.json');
}

export async function saveDebtDb(debt) {
  if (sql) {
    await sql`
      INSERT INTO debts (id, creditor, type, total_amount, remaining_balance, monthly_min_payment, due_date, status, notes)
      VALUES (${debt.id}, ${debt.creditor}, ${debt.type}, ${debt.totalAmount}, ${debt.remainingBalance}, ${debt.monthlyMinPayment || null}, ${debt.dueDate || null}, ${debt.status}, ${debt.notes || null})
      ON CONFLICT (id) DO UPDATE SET
        creditor = EXCLUDED.creditor,
        type = EXCLUDED.type,
        total_amount = EXCLUDED.total_amount,
        remaining_balance = EXCLUDED.remaining_balance,
        monthly_min_payment = EXCLUDED.monthly_min_payment,
        due_date = EXCLUDED.due_date,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes;
    `;
    return debt;
  }

  const debts = await readJson('debts.json');
  const index = debts.findIndex(d => d.id === debt.id);
  if (index >= 0) debts[index] = debt;
  else debts.unshift(debt);
  await writeJson('debts.json', debts);
  return debt;
}

export async function deleteDebtDb(id) {
  if (sql) {
    await sql`DELETE FROM debts WHERE id = ${id};`;
    return true;
  }
  const debts = await readJson('debts.json');
  await writeJson('debts.json', debts.filter(d => d.id !== id));
  return true;
}

export async function getDebtPaymentsDb() {
  if (sql) {
    const rows = await sql`SELECT * FROM debt_payments ORDER BY date DESC;`;
    return rows.map(r => ({
      id: r.id,
      debtId: r.debt_id,
      amount: parseFloat(r.amount),
      date: r.date,
      notes: r.notes || undefined
    }));
  }
  return await readJson('debt_payments.json');
}

export async function saveDebtPaymentDb(pay) {
  if (sql) {
    await sql`
      INSERT INTO debt_payments (id, debt_id, amount, date, notes)
      VALUES (${pay.id}, ${pay.debtId}, ${pay.amount}, ${pay.date}, ${pay.notes || null});
    `;

    // Reduce debt remaining balance
    const debtRows = await sql`SELECT * FROM debts WHERE id = ${pay.debtId};`;
    if (debtRows.length > 0) {
      const current = debtRows[0];
      const newBal = Math.max(0, parseFloat(current.remaining_balance) - pay.amount);
      const newStat = newBal === 0 ? 'paid_off' : current.status;
      await sql`UPDATE debts SET remaining_balance = ${newBal}, status = ${newStat} WHERE id = ${pay.debtId};`;
    }
    return pay;
  }

  const payments = await readJson('debt_payments.json');
  payments.unshift(pay);
  await writeJson('debt_payments.json', payments);

  const debts = await readJson('debts.json');
  const debtIndex = debts.findIndex(d => d.id === pay.debtId);
  if (debtIndex >= 0) {
    const debt = debts[debtIndex];
    debt.remainingBalance = Math.max(0, debt.remainingBalance - pay.amount);
    if (debt.remainingBalance === 0) debt.status = 'paid_off';
    debts[debtIndex] = debt;
    await writeJson('debts.json', debts);
  }
  return pay;
}

// --- CLIENTS ---
export async function getClientsDb() {
  if (sql) {
    const rows = await sql`SELECT * FROM clients ORDER BY name ASC;`;
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      phone: r.phone || undefined,
      city: r.city || undefined,
      acquisitionSource: r.acquisition_source || undefined,
      notes: r.notes || undefined
    }));
  }
  return await readJson('clients.json');
}

export async function saveClientDb(client) {
  if (sql) {
    await sql`
      INSERT INTO clients (id, name, phone, city, acquisition_source, notes)
      VALUES (${client.id}, ${client.name}, ${client.phone || null}, ${client.city || null}, ${client.acquisitionSource || null}, ${client.notes || null})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        city = EXCLUDED.city,
        acquisition_source = EXCLUDED.acquisition_source,
        notes = EXCLUDED.notes;
    `;
    return client;
  }

  const clients = await readJson('clients.json');
  const index = clients.findIndex(c => c.id === client.id);
  if (index >= 0) clients[index] = client;
  else clients.unshift(client);
  await writeJson('clients.json', clients);
  return client;
}
