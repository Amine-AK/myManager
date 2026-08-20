import { Redis } from '@upstash/redis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

let redis = null;

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (kvUrl && kvToken) {
  try {
    redis = new Redis({
      url: kvUrl,
      token: kvToken
    });
    console.log('🔴 Connected to Vercel KV / Upstash Redis cloud database!');
  } catch (err) {
    console.error('Vercel KV connection error:', err.message);
  }
}

export async function initDb() {
  if (redis) {
    console.log('✅ Vercel KV Database Ready.');
  } else {
    console.log('💻 Running in Local Development mode with JSON files.');
  }
}

// Helper functions for JSON disk file fallback during local development
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

// --- JOBS ---
export async function getJobsDb() {
  if (redis) {
    const data = await redis.get('jobs');
    return data || [];
  }
  return await readJson('jobs.json');
}

export async function saveJobDb(job) {
  if (redis) {
    const jobs = (await redis.get('jobs')) || [];
    const index = jobs.findIndex(j => j.id === job.id);
    if (index >= 0) jobs[index] = job;
    else jobs.unshift(job);
    await redis.set('jobs', jobs);

    if (job.clientName) {
      const clients = (await redis.get('clients')) || [];
      const existing = clients.find(c => c.name.toLowerCase() === job.clientName.toLowerCase());
      if (!existing) {
        clients.unshift({
          id: `cli-${Date.now()}`,
          name: job.clientName,
          phone: job.clientPhone,
          acquisitionSource: job.acquisitionSource
        });
        await redis.set('clients', clients);
      }
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
  if (redis) {
    const jobs = (await redis.get('jobs')) || [];
    const filtered = jobs.filter(j => j.id !== id);
    await redis.set('jobs', filtered);
    return true;
  }

  const jobs = await readJson('jobs.json');
  await writeJson('jobs.json', jobs.filter(j => j.id !== id));
  return true;
}

// --- BUSINESS EXPENSES ---
export async function getBusinessExpensesDb() {
  if (redis) {
    const data = await redis.get('business_expenses');
    return data || [];
  }
  return await readJson('business_expenses.json');
}

export async function saveBusinessExpenseDb(exp) {
  if (redis) {
    const expenses = (await redis.get('business_expenses')) || [];
    const index = expenses.findIndex(e => e.id === exp.id);
    if (index >= 0) expenses[index] = exp;
    else expenses.unshift(exp);
    await redis.set('business_expenses', expenses);
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
  if (redis) {
    const expenses = (await redis.get('business_expenses')) || [];
    const filtered = expenses.filter(e => e.id !== id);
    await redis.set('business_expenses', filtered);
    return true;
  }

  const expenses = await readJson('business_expenses.json');
  await writeJson('business_expenses.json', expenses.filter(e => e.id !== id));
  return true;
}

// --- PERSONAL EXPENSES ---
export async function getPersonalExpensesDb() {
  if (redis) {
    const data = await redis.get('personal_expenses');
    return data || [];
  }
  return await readJson('personal_expenses.json');
}

export async function savePersonalExpenseDb(exp) {
  if (redis) {
    const expenses = (await redis.get('personal_expenses')) || [];
    const index = expenses.findIndex(e => e.id === exp.id);
    if (index >= 0) expenses[index] = exp;
    else expenses.unshift(exp);
    await redis.set('personal_expenses', expenses);
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
  if (redis) {
    const expenses = (await redis.get('personal_expenses')) || [];
    const filtered = expenses.filter(e => e.id !== id);
    await redis.set('personal_expenses', filtered);
    return true;
  }

  const expenses = await readJson('personal_expenses.json');
  await writeJson('personal_expenses.json', expenses.filter(e => e.id !== id));
  return true;
}

// --- DEBTS & PAYMENTS ---
export async function getDebtsDb() {
  if (redis) {
    const data = await redis.get('debts');
    return data || [];
  }
  return await readJson('debts.json');
}

export async function saveDebtDb(debt) {
  if (redis) {
    const debts = (await redis.get('debts')) || [];
    const index = debts.findIndex(d => d.id === debt.id);
    if (index >= 0) debts[index] = debt;
    else debts.unshift(debt);
    await redis.set('debts', debts);
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
  if (redis) {
    const debts = (await redis.get('debts')) || [];
    const filtered = debts.filter(d => d.id !== id);
    await redis.set('debts', filtered);
    return true;
  }

  const debts = await readJson('debts.json');
  await writeJson('debts.json', debts.filter(d => d.id !== id));
  return true;
}

export async function getDebtPaymentsDb() {
  if (redis) {
    const data = await redis.get('debt_payments');
    return data || [];
  }
  return await readJson('debt_payments.json');
}

export async function saveDebtPaymentDb(pay) {
  if (redis) {
    const payments = (await redis.get('debt_payments')) || [];
    payments.unshift(pay);
    await redis.set('debt_payments', payments);

    const debts = (await redis.get('debts')) || [];
    const debtIndex = debts.findIndex(d => d.id === pay.debtId);
    if (debtIndex >= 0) {
      const debt = debts[debtIndex];
      debt.remainingBalance = Math.max(0, debt.remainingBalance - pay.amount);
      if (debt.remainingBalance === 0) debt.status = 'paid_off';
      debts[debtIndex] = debt;
      await redis.set('debts', debts);
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
  if (redis) {
    const data = await redis.get('clients');
    return data || [];
  }
  return await readJson('clients.json');
}

export async function saveClientDb(client) {
  if (redis) {
    const clients = (await redis.get('clients')) || [];
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) clients[index] = client;
    else clients.unshift(client);
    await redis.set('clients', clients);
    return client;
  }

  const clients = await readJson('clients.json');
  const index = clients.findIndex(c => c.id === client.id);
  if (index >= 0) clients[index] = client;
  else clients.unshift(client);
  await writeJson('clients.json', clients);
  return client;
}
