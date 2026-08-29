import React, { useRef } from 'react';
import type { FinancialMetrics, Job, BusinessExpense, PersonalExpense, DebtObligation, DebtPayment } from '../../types';
import { Printer, Download, Upload, FileSpreadsheet, ShieldCheck } from 'lucide-react';

interface PrintStatementViewProps {
  metrics: FinancialMetrics;
  jobs: Job[];
  businessExpenses: BusinessExpense[];
  personalExpenses: PersonalExpense[];
  debts: DebtObligation[];
  debtPayments?: DebtPayment[];
  onExportData: () => Promise<void>;
  onImportData: (jsonStr: string) => Promise<boolean>;
}

export const PrintStatementView: React.FC<PrintStatementViewProps> = ({
  metrics,
  jobs,
  businessExpenses,
  personalExpenses,
  debts,
  debtPayments = [],
  onExportData,
  onImportData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const success = await onImportData(text);
    if (success) {
      alert('Data imported successfully!');
    } else {
      alert('Invalid JSON data format.');
    }
  };

  // CSV Export Generator
  const handleExportCSV = () => {
    let csv = 'Type,ID,Title/Creditor,Category,Agreed/Total Amount,Paid/Spent Amount,Date\n';

    jobs.forEach(j => {
      csv += `Job,${j.id},"${j.title}","${j.category}",${j.agreedPrice},${j.paidAmount},${j.startDate}\n`;
    });

    businessExpenses.forEach(b => {
      csv += `BusinessExpense,${b.id},"${b.title}","${b.category}",${b.amount},${b.amount},${b.date}\n`;
    });

    personalExpenses.forEach(p => {
      csv += `PersonalExpense,${p.id},"${p.title}","${p.category}",${p.amount},${p.amount},${p.date}\n`;
    });

    debts.forEach(d => {
      csv += `DebtObligation,${d.id},"${d.creditor}","${d.type}",${d.totalAmount},${d.remainingBalance},${d.dueDate || ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `artisan_financial_statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Controls Header (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg no-print">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Financial Statement & Backup</h2>
            <p className="text-xs text-slate-400">Print formal report or backup offline database</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>

          <button
            onClick={onExportData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition"
          >
            <Download className="w-4 h-4 text-blue-400" />
            Backup JSON
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            Restore JSON
          </button>
        </div>
      </div>

      {/* FORMAL PRINTABLE REPORT CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 print-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100">
        {/* Statement Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-xl font-black tracking-tight text-emerald-400">
              STATEMENT OF FINANCIAL POSITION
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Moroccan Self-Employed Artisan Activity Report
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Generated: {new Date().toLocaleDateString('fr-FR')} | Repayments logged: {debtPayments.length} | Currency: MAD (Moroccan Dirham)
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg">
              <ShieldCheck className="w-4 h-4" /> Calculated & Verified
            </div>
          </div>
        </div>

        {/* Core Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Collected Income</span>
            <strong className="text-lg font-black text-emerald-400">
              {metrics.collectedIncome.toLocaleString('fr-MA')} MAD
            </strong>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Business Costs</span>
            <strong className="text-lg font-black text-amber-400">
              {metrics.totalBusinessCosts.toLocaleString('fr-MA')} MAD
            </strong>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Net Business Profit</span>
            <strong className="text-lg font-black text-blue-400">
              {metrics.netBusinessProfit.toLocaleString('fr-MA')} MAD
            </strong>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Available Cash Position</span>
            <strong className="text-lg font-black text-emerald-400">
              {metrics.availableCash.toLocaleString('fr-MA')} MAD
            </strong>
          </div>
        </div>

        {/* Detailed Financial Tables */}
        <div className="space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">
            1. Completed & Active Jobs (Revenue & Cash)
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                <th className="py-2">Job Title</th>
                <th className="py-2">Client</th>
                <th className="py-2 text-right">Agreed Price</th>
                <th className="py-2 text-right">Paid Amount</th>
                <th className="py-2 text-right">Material Cost</th>
                <th className="py-2 text-right">Uncollected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {jobs.map(j => (
                <tr key={j.id} className="hover:bg-slate-800/30">
                  <td className="py-2 font-medium">{j.title}</td>
                  <td className="py-2 text-slate-400">{j.clientName}</td>
                  <td className="py-2 text-right font-mono">{j.agreedPrice.toLocaleString('fr-MA')} MAD</td>
                  <td className="py-2 text-right font-mono text-emerald-400">{j.paidAmount.toLocaleString('fr-MA')} MAD</td>
                  <td className="py-2 text-right font-mono text-slate-400">{j.materialCosts.toLocaleString('fr-MA')} MAD</td>
                  <td className="py-2 text-right font-mono text-amber-400">
                    {(j.agreedPrice - j.paidAmount).toLocaleString('fr-MA')} MAD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Debt Obligations Table */}
        <div className="space-y-4 text-xs pt-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">
            2. Active Creditors & Debt Obligations
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                <th className="py-2">Creditor</th>
                <th className="py-2">Type</th>
                <th className="py-2 text-right">Original Amount</th>
                <th className="py-2 text-right">Remaining Balance</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {debts.map(d => (
                <tr key={d.id} className="hover:bg-slate-800/30">
                  <td className="py-2 font-medium">{d.creditor}</td>
                  <td className="py-2 text-slate-400 capitalize">{d.type.replace('_', ' ')}</td>
                  <td className="py-2 text-right font-mono">{d.totalAmount.toLocaleString('fr-MA')} MAD</td>
                  <td className="py-2 text-right font-mono text-purple-400">{d.remainingBalance.toLocaleString('fr-MA')} MAD</td>
                  <td className="py-2 text-right font-semibold capitalize text-slate-300">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
