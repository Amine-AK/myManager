import React, { useState } from 'react';
import { X, Pencil, Check, Share2 } from 'lucide-react';
import type { Job, JobActivityLog } from '../../types';
import { CATEGORIES, DEFAULT_SOURCES } from '../../lib/jobOptions';

interface EditJobModalProps {
  job: Job;
  onClose: () => void;
  onSaveJob: (job: Job) => Promise<void>;
}

/**
 * Mount with a `key={job.id}` from the parent so switching jobs remounts this
 * component with fresh initial state, instead of syncing props via an effect.
 */
export const EditJobModal: React.FC<EditJobModalProps> = ({ job, onClose, onSaveJob }) => {
  const knownSource = DEFAULT_SOURCES.includes(job.acquisitionSource || '');

  const [title, setTitle] = useState(job.title);
  const [clientName, setClientName] = useState(job.clientName);
  const [clientPhone, setClientPhone] = useState(job.clientPhone || '');
  const [category, setCategory] = useState<string>(job.category);
  const [agreedPrice, setAgreedPrice] = useState(job.agreedPrice.toString());
  const [materialCosts, setMaterialCosts] = useState(job.materialCosts.toString());
  const [startDate, setStartDate] = useState(job.startDate);
  const [acquisitionSource, setAcquisitionSource] = useState<string>(
    knownSource ? job.acquisitionSource! : 'Custom'
  );
  const [customSource, setCustomSource] = useState(knownSource ? '' : job.acquisitionSource || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(agreedPrice);
    const materialNum = parseFloat(materialCosts) || 0;

    if (isNaN(priceNum) || priceNum <= 0) return;
    if (priceNum < job.paidAmount) {
      setError(`Agreed price can't be less than the ${job.paidAmount.toLocaleString('fr-MA')} MAD already collected.`);
      return;
    }
    setError('');

    const finalSource = acquisitionSource === 'Custom' ? customSource.trim() || 'Direct' : acquisitionSource;

    const editLog: JobActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().split('T')[0],
      status: job.status,
      note: 'Job details edited.'
    };

    const updatedJob: Job = {
      ...job,
      title: title.trim() || job.title,
      clientName: clientName.trim() || job.clientName,
      clientPhone: clientPhone.trim() || undefined,
      category,
      agreedPrice: priceNum,
      materialCosts: materialNum,
      startDate,
      acquisitionSource: finalSource,
      logs: [editLog, ...(job.logs || [])]
    };

    setSubmitting(true);
    try {
      await onSaveJob(updatedJob);
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
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Edit Job Details</h2>
              <p className="text-xs text-slate-400">Status, cash collected & history are unaffected</p>
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
          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Agreed Price & Material Cost Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-amber-400 mb-1">
                AGREED PRICE (MAD) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={agreedPrice}
                onChange={e => setAgreedPrice(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-lg font-bold text-amber-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                MATERIAL COSTS (MAD)
              </label>
              <input
                type="number"
                step="any"
                value={materialCosts}
                onChange={e => setMaterialCosts(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-lg font-bold text-slate-100 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              JOB TITLE / WORK DESCRIPTION
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Client Name & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                CLIENT NAME
              </label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                CLIENT PHONE
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {/* Trade Category */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              TRADE CATEGORY
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-slate-500"
            >
              {category && !CATEGORIES.includes(category as (typeof CATEGORIES)[number]) && (
                <option value={category}>{category}</option>
              )}
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Lead Source */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              Lead Source
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_SOURCES.map(src => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setAcquisitionSource(src)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    acquisitionSource === src
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {src}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAcquisitionSource('Custom')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  acquisitionSource === 'Custom'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                + Custom Source
              </button>
            </div>

            {acquisitionSource === 'Custom' && (
              <input
                type="text"
                placeholder="e.g. Facebook, WhatsApp group, flyer..."
                value={customSource}
                onChange={e => setCustomSource(e.target.value)}
                className="w-full mt-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none"
              />
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              START DATE
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !agreedPrice}
              className="w-1/2 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition"
            >
              <Check className="w-4 h-4" />
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
