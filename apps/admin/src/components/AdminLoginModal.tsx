import React, { useState } from 'react';
import { Shield, Lock, Phone, ArrowRight, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://api.jaibkharch.com/api';

interface Props {
  isOpen: boolean;
  onSuccess: () => void;
  onClose?: () => void;
}

export default function AdminLoginModal({ isOpen, onSuccess, onClose }: Props) {
  const [phone, setPhone] = useState('03001234567');
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleRequestOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'LOGIN' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP request failed');
      setOtpSent(true);
      setSuccess('OTP sent successfully (Use 123456 for test/dev)');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Ensure pending OTP record exists in DB for mock mode
      await fetch(`${API}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'LOGIN' }),
      }).catch(() => {});

      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          otpCode: otp,
          deviceId: 'admin-portal',
          platform: 'web',
          deviceModel: 'Admin Web Browser',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('adminToken', data.accessToken);
        localStorage.setItem('admin_token', data.accessToken);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        setSuccess('Logged in successfully!');
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        throw new Error('No access token returned from server');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-card border border-indigo-500/30 bg-slate-900/90 shadow-2xl shadow-indigo-950/50">
        {/* Glow circle */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight">Admin Portal Login</h2>
              <p className="text-xs text-slate-400">Jeb Kharch Management System</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 text-xs">
              <CheckCircle size={15} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Send OTP
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 font-mono tracking-widest text-center"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Tip: Test mode accepts <span className="text-emerald-400 font-mono font-bold">123456</span> for admin phone <span className="font-mono text-slate-300">03001234567</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
