import React, { useState } from 'react';
import type { Job, BusinessExpense, PersonalExpense } from '../../types';
import { calculateWeeklyTracker } from '../../lib/calculations/weeklyTracker';
import {
  Calendar,
  Award,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Coffee
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

interface WeeklySpendingTrackerCardProps {
  jobs: Job[];
  businessExpenses: BusinessExpense[];
  personalExpenses: PersonalExpense[];
}

export const WeeklySpendingTrackerCard: React.FC<WeeklySpendingTrackerCardProps> = ({
  jobs,
  businessExpenses,
  personalExpenses
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const summary = calculateWeeklyTracker(jobs, businessExpenses, personalExpenses, weekOffset);

  const chartData = summary.days.map(d => ({
    day: d.dayName,
    Personal: d.personalSpent,
    Work: d.workSpent,
    Total: d.totalSpent,
    Collected: d.cashCollected
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header & Week Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">Daily Spending & Cash Surplus Line Tracker</h3>
              {summary.isCurrentWeek && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold rounded-md border border-emerald-500/30 uppercase">
                  Live Week
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Resets visually every week • All historical data preserved
            </p>
          </div>
        </div>

        {/* Week Selector Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-300 px-2 flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            {summary.startDate} ➔ {summary.endDate}
          </span>
          <button
            onClick={() => setWeekOffset(prev => Math.min(0, prev + 1))}
            disabled={summary.isCurrentWeek}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800 transition"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Highlights: Factual Cash Reward & Daily Average */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Factual Weekly Cash Reward (Surplus) */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Weekly Cash Savings Reward
            </span>
            <strong className="text-emerald-400 font-extrabold text-lg font-mono">
              +{summary.netWeeklySurplus.toLocaleString('fr-MA')} MAD
            </strong>
            <span className="text-[10px] text-slate-500 block">Factual net cash retained</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Spent This Week */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Total Spent (7 Days)
            </span>
            <strong className="text-amber-400 font-extrabold text-lg font-mono">
              {summary.totalWeeklySpent.toLocaleString('fr-MA')} MAD
            </strong>
            <span className="text-[10px] text-slate-500 block">
              Pers: {summary.totalPersonalSpent} MAD | Work: {summary.totalWorkSpent} MAD
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Daily Average Spending */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Daily Average Spent
            </span>
            <strong className="text-slate-200 font-extrabold text-lg font-mono">
              {summary.dailyAverageSpent.toFixed(0)} MAD / day
            </strong>
            <span className="text-[10px] text-slate-500 block">7-day average rate</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Coffee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Live Weekly Line Chart Visualizer */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Daily Spending & Income Trends (Mon - Sun)
        </h4>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="Personal"
                name="Personal (Café, Gaming...)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4, fill: '#f59e0b' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Work"
                name="Work Overhead"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Collected"
                name="Cash Income Collected"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
