import React, { useState } from 'react';
import type { Job, JobStatus, JobActivityLog } from '../../types';
import {
  Wrench,
  Plus,
  Search,
  AlertCircle,
  Trash2,
  DollarSign,
  User,
  Phone,
  Truck,
  RotateCcw,
  History,
  Clock,
  CheckCircle2,
  Share2,
  X
} from 'lucide-react';

interface JobsViewProps {
  jobs: Job[];
  onSaveJob: (job: Job) => Promise<void>;
  onDeleteJob: (id: string) => Promise<void>;
  onOpenQuickJob: () => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  onSaveJob,
  onDeleteJob,
  onOpenQuickJob
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collectingJobId, setCollectingJobId] = useState<string | null>(null);
  const [collectionAmount, setCollectionAmount] = useState<string>('');

  // Status Change & Delay Modal State
  const [selectedJobForLogs, setSelectedJobForLogs] = useState<Job | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<Job | null>(null);
  const [newStatus, setNewStatus] = useState<JobStatus>('in_progress');
  const [statusNote, setStatusNote] = useState('');

  const filteredJobs = jobs.filter(j => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.acquisitionSource || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle 1-Tap Collect Payment
  const handleCollectPayment = async (job: Job) => {
    const amount = parseFloat(collectionAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newPaid = (job.paidAmount || 0) + amount;
    let jobStat = job.status;
    if (newPaid >= job.agreedPrice && jobStat !== 'revision_requested') {
      jobStat = 'paid';
    }

    const newLog: JobActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().split('T')[0],
      status: jobStat,
      note: `Payment collected: +${amount} MAD (Total paid: ${newPaid} MAD)`
    };

    const updatedJob: Job = {
      ...job,
      paidAmount: Math.min(newPaid, job.agreedPrice),
      status: jobStat,
      completedDate: jobStat === 'paid' ? new Date().toISOString().split('T')[0] : job.completedDate,
      logs: [newLog, ...(job.logs || [])]
    };

    await onSaveJob(updatedJob);
    setCollectingJobId(null);
    setCollectionAmount('');
  };

  // Handle Changing Job Status (e.g. Waiting Parts from another city, Client Revision)
  const handleUpdateJobStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStatusModal) return;

    const job = showStatusModal;
    const noteText = statusNote.trim() || `Status updated to ${newStatus.replace('_', ' ')}`;

    const newLog: JobActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().split('T')[0],
      status: newStatus,
      note: noteText
    };

    let updatedDaysSpent = job.daysSpent || 1;
    let updatedDaysPaused = job.daysPaused || 0;

    if (newStatus === 'in_progress') updatedDaysSpent += 1;
    if (newStatus === 'waiting_parts') updatedDaysPaused += 1;

    const updatedJob: Job = {
      ...job,
      status: newStatus,
      waitingReason: newStatus === 'waiting_parts' ? noteText : job.waitingReason,
      daysSpent: updatedDaysSpent,
      daysPaused: updatedDaysPaused,
      logs: [newLog, ...(job.logs || [])]
    };

    await onSaveJob(updatedJob);
    setShowStatusModal(null);
    setStatusNote('');
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Jobs & Technical Work</h2>
            <p className="text-xs text-slate-400">
              Track multi-day work, parts delays, client modifications & payment collection
            </p>
          </div>
        </div>

        <button
          onClick={onOpenQuickJob}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          + New Job / Payment
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search title, client, trade, lead source (e.g. Droguerie, Mustapha)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-slate-600"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'in_progress', label: 'En Cours' },
            { id: 'waiting_parts', label: 'Waiting Parts' },
            { id: 'revision_requested', label: 'Revision' },
            { id: 'completed', label: 'Completed' },
            { id: 'paid', label: 'Paid' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                statusFilter === item.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-2xl">
            No jobs found matching criteria.
          </div>
        ) : (
          filteredJobs.map(job => {
            const uncollected = (job.agreedPrice || 0) - (job.paidAmount || 0);

            return (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                {/* Header: Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {job.clientName}
                      </span>
                      {job.clientPhone && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Phone className="w-3 h-3" />
                          {job.clientPhone}
                        </span>
                      )}
                      {job.acquisitionSource && (
                        <span className="flex items-center gap-1 text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 text-[10px]">
                          <Share2 className="w-3 h-3" />
                          {job.acquisitionSource}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                      job.status === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : job.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : job.status === 'waiting_parts'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : job.status === 'revision_requested'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}
                  >
                    {job.status === 'waiting_parts' && <Truck className="w-3 h-3" />}
                    {job.status === 'revision_requested' && <RotateCcw className="w-3 h-3" />}
                    {job.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Waiting Parts Reason Banner if applicable */}
                {job.status === 'waiting_parts' && (
                  <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <strong className="font-bold">Paused (Waiting Equipment):</strong>{' '}
                      {job.waitingReason || 'Sourcing parts from another city'}
                    </div>
                  </div>
                )}

                {/* Client Modification Banner if applicable */}
                {job.status === 'revision_requested' && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <strong className="font-bold">Client Requested Revision:</strong> Re-opened for modifications.
                    </div>
                  </div>
                )}

                {/* Financial Figures Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Agreed Price</span>
                    <strong className="text-amber-400 font-bold text-sm">
                      {job.agreedPrice.toLocaleString('fr-MA')} MAD
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Paid Cash</span>
                    <strong className="text-emerald-400 font-bold text-sm">
                      {job.paidAmount.toLocaleString('fr-MA')} MAD
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Material Cost</span>
                    <strong className="text-slate-400 font-bold text-sm">
                      {job.materialCosts.toLocaleString('fr-MA')} MAD
                    </strong>
                  </div>
                </div>

                {/* Uncollected Alert & Quick Payment Collection */}
                {uncollected > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between text-amber-300 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        Uncollected Balance:
                      </span>
                      <strong className="font-bold text-sm">
                        {uncollected.toLocaleString('fr-MA')} MAD
                      </strong>
                    </div>

                    {collectingJobId === job.id ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          placeholder={`Max ${uncollected}`}
                          value={collectionAmount}
                          onChange={e => setCollectionAmount(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-emerald-500 rounded-lg text-xs font-bold text-emerald-400 focus:outline-none"
                        />
                        <button
                          onClick={() => handleCollectPayment(job)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition"
                        >
                          Collect
                        </button>
                        <button
                          onClick={() => setCollectingJobId(null)}
                          className="px-2 py-1.5 text-slate-400 hover:text-white text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setCollectingJobId(job.id);
                          setCollectionAmount(uncollected.toString());
                        }}
                        className="mt-2 w-full py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 font-bold rounded-lg transition text-xs flex items-center justify-center gap-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        1-Tap Collect Payment ({uncollected} MAD)
                      </button>
                    )}
                  </div>
                )}

                {/* Status & Revision Controls */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      setShowStatusModal(job);
                      setNewStatus('waiting_parts');
                      setStatusNote('');
                    }}
                    className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg font-semibold flex items-center gap-1 transition text-[11px]"
                  >
                    <Truck className="w-3 h-3" />
                    Pause: Waiting Parts
                  </button>

                  <button
                    onClick={() => {
                      setShowStatusModal(job);
                      setNewStatus('revision_requested');
                      setStatusNote('');
                    }}
                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-semibold flex items-center gap-1 transition text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Client Revision
                  </button>

                  {job.status !== 'completed' && job.status !== 'paid' && (
                    <button
                      onClick={() => {
                        setShowStatusModal(job);
                        setNewStatus('completed');
                        setStatusNote('Work completed successfully.');
                      }}
                      className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg font-semibold flex items-center gap-1 transition text-[11px]"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Mark Completed
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedJobForLogs(job)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold flex items-center gap-1 transition text-[11px] ml-auto"
                    title="View activity history log"
                  >
                    <History className="w-3 h-3" />
                    History ({job.logs?.length || 0})
                  </button>
                </div>

                {/* Footer: Date & Delete */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span>Start: {job.startDate}</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Work: {job.daysSpent || 1}d | Paused: {job.daysPaused || 0}d
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete record for "${job.title}"?`)) {
                        onDeleteJob(job.id);
                      }
                    }}
                    className="text-slate-500 hover:text-rose-400 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* UPDATE STATUS MODAL (Waiting Parts / Client Revision / Completion) */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                Update Job Status & Timeline
              </h3>
              <button
                onClick={() => setShowStatusModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateJobStatus} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">TARGET STATUS</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as JobStatus)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-bold"
                >
                  <option value="in_progress">En Cours (Active Work)</option>
                  <option value="waiting_parts">Waiting Parts / Equipment (Another city)</option>
                  <option value="revision_requested">Client Revision Requested</option>
                  <option value="completed">Completed (Work Finished)</option>
                  <option value="paid">Paid & Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {newStatus === 'waiting_parts'
                    ? 'REASON / PARTS SOURCE (e.g. Waiting Dahua camera from Casablanca)'
                    : newStatus === 'revision_requested'
                    ? 'CLIENT MODIFICATION NOTE (e.g. Client requested angle adjustment)'
                    : 'STATUS NOTE'}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the reason or activity update..."
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(null)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVITY HISTORY TIMELINE MODAL */}
      {selectedJobForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 text-slate-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-emerald-400">{selectedJobForLogs.title}</h3>
                <p className="text-xs text-slate-400">Activity History & Modification Log</p>
              </div>
              <button
                onClick={() => setSelectedJobForLogs(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {(!selectedJobForLogs.logs || selectedJobForLogs.logs.length === 0) ? (
                <p className="text-slate-500 text-center py-4">No activity history recorded for this job.</p>
              ) : (
                selectedJobForLogs.logs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold uppercase text-emerald-400">{log.status.replace('_', ' ')}</span>
                      <span className="text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-300 text-xs">{log.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
