import express from 'express';
import cors from 'cors';
import {
  initDb,
  getJobsDb,
  saveJobDb,
  deleteJobDb,
  getBusinessExpensesDb,
  saveBusinessExpenseDb,
  deleteBusinessExpenseDb,
  getPersonalExpensesDb,
  savePersonalExpenseDb,
  deletePersonalExpenseDb,
  getDebtsDb,
  saveDebtDb,
  deleteDebtDb,
  getDebtPaymentsDb,
  saveDebtPaymentDb,
  getClientsDb,
  saveClientDb
} from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize DB tables if Neon DATABASE_URL is set
initDb();

// --- JOBS ---
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await getJobsDb();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const job = await saveJobDb(req.body);
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await deleteJobDb(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BUSINESS EXPENSES ---
app.get('/api/business-expenses', async (req, res) => {
  try {
    const expenses = await getBusinessExpensesDb();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/business-expenses', async (req, res) => {
  try {
    const exp = await saveBusinessExpenseDb(req.body);
    res.json(exp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/business-expenses/:id', async (req, res) => {
  try {
    await deleteBusinessExpenseDb(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PERSONAL EXPENSES ---
app.get('/api/personal-expenses', async (req, res) => {
  try {
    const expenses = await getPersonalExpensesDb();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/personal-expenses', async (req, res) => {
  try {
    const exp = await savePersonalExpenseDb(req.body);
    res.json(exp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/personal-expenses/:id', async (req, res) => {
  try {
    await deletePersonalExpenseDb(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DEBTS & PAYMENTS ---
app.get('/api/debts', async (req, res) => {
  try {
    const debts = await getDebtsDb();
    res.json(debts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/debts', async (req, res) => {
  try {
    const debt = await saveDebtDb(req.body);
    res.json(debt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/debts/:id', async (req, res) => {
  try {
    await deleteDebtDb(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/debt-payments', async (req, res) => {
  try {
    const payments = await getDebtPaymentsDb();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/debt-payments', async (req, res) => {
  try {
    const payment = await saveDebtPaymentDb(req.body);
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CLIENTS ---
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await getClientsDb();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const client = await saveClientDb(req.body);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BACKUP & RESTORE ---
app.get('/api/export', async (req, res) => {
  try {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      jobs: await getJobsDb(),
      businessExpenses: await getBusinessExpensesDb(),
      personalExpenses: await getPersonalExpensesDb(),
      debts: await getDebtsDb(),
      debtPayments: await getDebtPaymentsDb(),
      clients: await getClientsDb()
    };
    res.json(dump);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/import', async (req, res) => {
  try {
    const data = req.body;
    if (data.jobs) {
      for (const j of data.jobs) await saveJobDb(j);
    }
    if (data.businessExpenses) {
      for (const e of data.businessExpenses) await saveBusinessExpenseDb(e);
    }
    if (data.personalExpenses) {
      for (const e of data.personalExpenses) await savePersonalExpenseDb(e);
    }
    if (data.debts) {
      for (const d of data.debts) await saveDebtDb(d);
    }
    if (data.debtPayments) {
      for (const p of data.debtPayments) await saveDebtPaymentDb(p);
    }
    if (data.clients) {
      for (const c of data.clients) await saveClientDb(c);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Server running on port ${PORT}`);
});

export default app;
