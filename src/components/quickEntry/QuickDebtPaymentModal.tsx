import React, { useState } from 'react';
import { X, CreditCard, Check } from 'lucide-react';
import type { DebtObligation, DebtPayment } from '../../types';

interface QuickDebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: DebtObligation[];
  onSaveDebtPayment: (payment: DebtPayment) => Promise<void>;
}

export const QuickDebtPaymentModal: React.FC<QuickDebtPaymentModalProps> = ({
  isOpen,
  onClose,
  debts,
  onSaveDebtPayment
}) => {
  const activeDebts = debts.filter(d => d.status === 'active');
  const [selectedDebtId, setSelectedDebtId] = useState<string>(activeDebts[0]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentDebt = activeDebts.find(d => d.id === selectedDebtId) || activeDebts[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!currentDebt || isNaN(numAmount) || numAmount <= 0) return;

    setSubmitting(true);
    try {
      await onSaveDebtPayment({
        id: `dpay-${Date.now()}`,
        debtId: currentDebt.id,
        amount: numAmount,
        date,
        notes: notes.trim() || undefined
      });

      setAmount('');
      setNotes('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Record Debt Payment</h2>
              <p className="text-xs text-slate-400">Target entry time: &lt; 15 seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Select Debt Obligation */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              SELECT CREDITOR / DEBT *
            </label>
            {activeDebts.length === 0 ? (
              <p className="text-sm text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                No active debt obligations found.
              </p>
            ) : (
              <select
                value={selectedDebtId}
                onChange={e => setSelectedDebtId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-slate-500 font-medium"
              >
                {activeDebts.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.creditor} — Balance: {d.remainingBalance.toLocaleString('fr-MA')} MAD
                  </option>
                ))}
              </select>
            )}
          </div>

          {currentDebt && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex justify-between items-center">
              <div>
                <span className="text-slate-400">Remaining Balance:</span>{' '}
                <strong className="text-rose-400 font-bold">
                  {currentDebt.remainingBalance.toLocaleString('fr-MA')} MAD
                </strong>
              </div>
              {currentDebt.monthlyMinPayment && (
                <div>
                  <span className="text-slate-400">Monthly Min:</span>{' '}
                  <strong>{currentDebt.monthlyMinPayment.toLocaleString('fr-MA')} MAD</strong>
                </div>
              )}
            </div>
          )}

          {/* Amount Paid */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              PAYMENT AMOUNT (MAD) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-4 pr-16 py-3.5 bg-slate-950 border border-slate-700 rounded-xl text-2xl font-bold text-rose-400 focus:outline-none focus:border-rose-500 placeholder-slate-600"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                MAD
              </span>
            </div>

            {/* Quick Fill Button */}
            {currentDebt?.monthlyMinPayment && (
              <button
                type="button"
                onClick={() => setAmount(currentDebt.monthlyMinPayment!.toString())}
                className="mt-2 text-xs text-slate-400 hover:text-slate-200 underline font-medium"
              >
                Set to Monthly Min ({currentDebt.monthlyMinPayment} MAD)
              </button>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              PAYMENT DATE
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              NOTES / PAYMENT METHOD
            </label>
            <input
              type="text"
              placeholder="e.g. Cash payment at Droguerie, Bank transfer"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !amount || !currentDebt}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition"
            >
              <Check className="w-5 h-5" />
              {submitting ? 'Saving...' : 'Record Payment (< 15s)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
