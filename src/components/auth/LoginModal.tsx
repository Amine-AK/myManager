import React, { useState } from 'react';
import { Lock, User, Key, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    // Case-insensitive username check for AMINEAK and exact password match
    const validUsername = username.trim().toUpperCase() === 'AMINEAK';
    const validPassword = password === '+Thugstools1?';

    if (validUsername && validPassword) {
      localStorage.setItem('handyman_authenticated', 'true');
      localStorage.setItem('handyman_auth_user', 'AMINEAK');
      onLoginSuccess();
    } else {
      setError(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">Private Handyman Engine</h2>
          <p className="text-xs text-slate-400">
            Secure decision-support portal for Amine AK
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Invalid username or password. Please try again.</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Username */}
          <div>
            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
              USERNAME
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                autoFocus
                placeholder="USERNAME"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  setError(false);
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
              PASSWORD
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !username || !password}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {submitting ? 'Authenticating...' : 'Sign In to Private Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};
