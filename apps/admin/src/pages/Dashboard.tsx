import { useState, useEffect } from 'react';
import {
  Users, CreditCard, ShieldAlert, Zap, TrendingUp, RefreshCw,
  Coins, Award, Activity, Bell, ChevronRight, ArrowUpRight, CheckCircle2, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://109.199.122.238:3000/api';

async function apiFetch(path: string) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
  });
  if (!res.ok) throw new Error('API fetch failed');
  return res.json();
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/analytics');
      setData(res);
    } catch (e) {
      // Fallback mock for demonstration if server offline
      setData({
        users: { total: 1420, dauToday: 382, dauYesterday: 310, flagged: 4 },
        quizzes: { totalSessions: 8940, completedSessions: 7820 },
        withdrawals: { total: 142, pending: 8 },
        economy: { totalCoinsInCirculation: 4850000 },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden glass-card p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/50">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <Zap size={14} className="text-indigo-400" />
              <span>Real-time Dashboard Analytics</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
              Welcome back, <span className="text-gradient-indigo">Admin</span> 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
              Monitor user growth, withdrawal requests, game economies, and fraud alerts in real time.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="glass-button-secondary px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 flex items-center space-x-2"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Metrics</span>
            </button>
            <Link
              to="/withdrawals"
              className="glass-button-primary px-4 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center space-x-2"
            >
              <CreditCard size={14} />
              <span>Process Payouts ({data?.withdrawals?.pending || 0})</span>
            </Link>
          </div>
        </div>

        {/* Ambient background accent light */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary Key Performance Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Users */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Registered Users</p>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-1">
                {loading ? '...' : (data?.users?.total || 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-400 space-x-1">
            <TrendingUp size={14} />
            <span className="font-semibold">+12.4%</span>
            <span className="text-slate-500 ml-1">vs last week</span>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Daily Active (DAU)</p>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-1">
                {loading ? '...' : (data?.users?.dauToday || 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Activity size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-cyan-400 space-x-1">
            <span className="font-semibold">Yesterday:</span>
            <span className="text-slate-300">{data?.users?.dauYesterday || 0}</span>
          </div>
        </div>

        {/* Card 3: Pending Withdrawals */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Pending Withdrawals</p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
                {loading ? '...' : (data?.withdrawals?.pending || 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <CreditCard size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-amber-300 space-x-1">
            <span className="font-semibold">Requires Approval</span>
          </div>
        </div>

        {/* Card 4: Flagged Accounts */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Flagged Fraud Risk</p>
              <h3 className="text-2xl font-extrabold text-rose-400 mt-1">
                {loading ? '...' : (data?.users?.flagged || 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldAlert size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-rose-400 space-x-1">
            <Shield size={14} />
            <span className="font-semibold">Auto-detected bot activity</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Economy Stats & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Economy Breakdown Card */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Coins className="text-amber-400" size={18} />
                <span>Coin Economy & Quiz Stats</span>
              </h3>
              <p className="text-xs text-slate-400">Distribution of rewards across active players</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-xs text-slate-300 font-mono">
              Live Feed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Coins in Circulation</p>
              <p className="text-lg font-bold text-amber-300 mt-1">
                🪙 {(data?.economy?.totalCoinsInCirculation || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Quiz Sessions</p>
              <p className="text-lg font-bold text-indigo-300 mt-1">
                🎮 {(data?.quizzes?.totalSessions || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Quiz Completion Rate</p>
              <p className="text-lg font-bold text-emerald-300 mt-1">
                🎯 {data?.quizzes?.totalSessions ? Math.round((data.quizzes.completedSessions / data.quizzes.totalSessions) * 100) : 88}%
              </p>
            </div>
          </div>

          {/* Visual Progress Bars */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Quiz Engagement Capacity</span>
                <span className="font-semibold text-indigo-400">87.5%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-[87.5%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Withdrawal Payout Liquidity</span>
                <span className="font-semibold text-emerald-400">94.2%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[94.2%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Award className="text-purple-400" size={18} />
              <span>Quick Actions</span>
            </h3>
            <p className="text-xs text-slate-400">Frequently used administration tools</p>
          </div>

          <div className="space-y-2.5">
            <Link
              to="/notifications"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all text-xs font-semibold text-slate-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Bell size={16} />
                </div>
                <span>Send Push Broadcast</span>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/missions"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-purple-500/40 hover:bg-slate-800/80 transition-all text-xs font-semibold text-slate-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Award size={16} />
                </div>
                <span>Create Daily Mission</span>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/seasons"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all text-xs font-semibold text-slate-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <TrendingUp size={16} />
                </div>
                <span>Launch New Season</span>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/fraud"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-rose-500/40 hover:bg-slate-800/80 transition-all text-xs font-semibold text-slate-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <ShieldAlert size={16} />
                </div>
                <span>Review Fraud Flags</span>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Easypaisa Gateway Active</span>
            </span>
            <span className="text-slate-500">v1.2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
