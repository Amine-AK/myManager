import React, { useState } from 'react';
import type { BusinessExpense, PersonalExpense } from '../../types';
import {
  Receipt,
  Briefcase,
  Home,
  Plus,
  Trash2,
  Calendar,
  Tag
} from 'lucide-react';

interface ExpensesViewProps {
  businessExpenses: BusinessExpense[];
  personalExpenses: PersonalExpense[];
  onDeleteBusinessExpense: (id: string) => Promise<void>;
  onDeletePersonalExpense: (id: string) => Promise<void>;
  onOpenQuickExpense: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  businessExpenses,
  personalExpenses,
  onDeleteBusinessExpense,
  onDeletePersonalExpense,
  onOpenQuickExpense
}) => {
  const [activeTab, setActiveTab] = useState<'business' | 'personal'>('business');

  const totalBiz = businessExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalPersonal = personalExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Expenses & Outflows</h2>
            <p className="text-xs text-slate-400">
              Financial Truth Principle: Work Expenses ≠ Household Spending
            </p>
          </div>
        </div>

        <button
          onClick={onOpenQuickExpense}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          + Log Expense (&lt;10s)
        </button>
      </div>

      {/* Financial Separation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Work Expenses Box */}
        <button
          onClick={() => setActiveTab('business')}
          className={`p-5 rounded-2xl border text-left transition ${
            activeTab === 'business'
              ? 'bg-amber-500/10 border-amber-500/50 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Briefcase className="w-4 h-4" /> Work Expenses (Business Overhead)
            </div>
            <span className="text-xs font-bold text-slate-400">{businessExpenses.length} items</span>
          </div>
          <div className="text-3xl font-black text-amber-400 mt-2">
            {totalBiz.toLocaleString('fr-MA')} MAD
          </div>
          <p className="text-xs text-slate-400 mt-1">Tools, Fuel, Workshop, Permits & Droguerie</p>
        </button>

        {/* Household Expenses Box */}
        <button
          onClick={() => setActiveTab('personal')}
          className={`p-5 rounded-2xl border text-left transition ${
            activeTab === 'personal'
              ? 'bg-rose-500/10 border-rose-500/50 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <Home className="w-4 h-4" /> Household & Personal Spending
            </div>
            <span className="text-xs font-bold text-slate-400">{personalExpenses.length} items</span>
          </div>
          <div className="text-3xl font-black text-rose-400 mt-2">
            {totalPersonal.toLocaleString('fr-MA')} MAD
          </div>
          <p className="text-xs text-slate-400 mt-1">Café, Gaming, Groceries, Rent, Utilities & Leisure</p>
        </button>
      </div>

      {/* Active Expense List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            {activeTab === 'business' ? (
              <Briefcase className="w-4 h-4 text-amber-400" />
            ) : (
              <Home className="w-4 h-4 text-rose-400" />
            )}
            {activeTab === 'business' ? 'Business Expense History' : 'Personal Spending History'}
          </h3>
        </div>

        {activeTab === 'business' ? (
          <div className="space-y-2">
            {businessExpenses.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No business expenses recorded.</p>
            ) : (
              businessExpenses.map(exp => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div>
                    <strong className="text-slate-200 text-sm font-semibold block">{exp.title}</strong>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Tag className="w-3 h-3" /> {exp.category}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3" /> {exp.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-extrabold text-amber-400 font-mono">
                      -{exp.amount.toLocaleString('fr-MA')} MAD
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete expense "${exp.title}"?`)) {
                          onDeleteBusinessExpense(exp.id);
                        }
                      }}
                      className="text-slate-600 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {personalExpenses.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No personal expenses recorded.</p>
            ) : (
              personalExpenses.map(exp => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div>
                    <strong className="text-slate-200 text-sm font-semibold block">{exp.title}</strong>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Tag className="w-3 h-3" /> {exp.category}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3" /> {exp.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-extrabold text-rose-400 font-mono">
                      -{exp.amount.toLocaleString('fr-MA')} MAD
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete expense "${exp.title}"?`)) {
                          onDeletePersonalExpense(exp.id);
                        }
                      }}
                      className="text-slate-600 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
