import { useState, useEffect } from 'react';
import { Check, X, CreditCard, Wallet, ShieldCheck, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle, Calendar, Copy, CheckCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://109.199.122.238:3000/api';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token') || '';
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error('API call failed');
  return res.json();
}

interface Withdrawal {
  id: string;
  userId: string;
  phone?: string;
  coins?: number;
  amount?: number;
  easypaisaNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user?: { name?: string; phone?: string; fraudScore?: number };
}

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/withdrawals?status=${statusFilter}&page=${page}&pageSize=12`);
      setWithdrawals(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      // Fallback mock if API offline
      setWithdrawals([
        {
          id: 'w-101',
          userId: 'usr-1',
          easypaisaNumber: '03001234567',
          coins: 5000,
          amount: 50,
          status: statusFilter,
          createdAt: new Date().toISOString(),
          user: { name: 'Zain Ahmed', phone: '03001234567', fraudScore: 0 },
        },
        {
          id: 'w-102',
          userId: 'usr-2',
          easypaisaNumber: '03129876543',
          coins: 20000,
          amount: 200,
          status: statusFilter,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          user: { name: 'Tariq Mehmood', phone: '03129876543', fraudScore: 45 },
        },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter, page]);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve withdrawal and trigger Easypaisa payout?')) return;
    try {
      await apiFetch(`/admin/withdrawals/${id}/approve`, { method: 'POST' });
      fetchWithdrawals();
    } catch (err) {
      alert('Failed to approve withdrawal.');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason (will refund coins to player):');
    if (!reason) return;
    try {
      await apiFetch(`/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      fetchWithdrawals();
    } catch (err) {
      alert('Failed to reject withdrawal.');
    }
  };

  const copyNumber = (num: string, id: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <CreditCard className="text-emerald-400" size={22} />
            <span>Withdrawals & Payouts</span>
          </h1>
          <p className="text-xs text-slate-400">Process Easypaisa requests and review high-value transactions</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-white/5 w-full sm:w-auto">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-center ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
          <button
            onClick={fetchWithdrawals}
            aria-label="Refresh withdrawals"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white shrink-0"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="glass-card p-8 rounded-2xl text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-400" />
            Loading withdrawal requests...
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center text-slate-400">
            No {statusFilter.toLowerCase()} withdrawals found.
          </div>
        ) : (
          withdrawals.map((w) => {
            const coinVal = w.coins || (w.amount ? w.amount * 100 : 0);
            const pkrVal = w.amount || coinVal / 100;
            const isHighValue = pkrVal >= 500;
            const isRisk = (w.user?.fraudScore || 0) > 30;

            return (
              <div key={w.id} className="glass-card p-4 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-100 text-sm">{w.user?.name || 'Player'}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{w.user?.phone || w.userId}</p>
                  </div>
                  <div>
                    {isRisk ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-semibold border border-rose-500/20">
                        <AlertTriangle size={11} />
                        <span>Risk: {w.user?.fraudScore}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                        <ShieldCheck size={11} />
                        <span>Clean</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wallet size={16} className="text-emerald-400" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Easypaisa Mobile</p>
                      <p className="font-mono font-bold text-emerald-300 text-xs sm:text-sm">{w.easypaisaNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyNumber(w.easypaisaNumber, w.id)}
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs flex items-center space-x-1"
                    title="Copy number"
                  >
                    {copiedId === w.id ? <CheckCheck size={13} /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <p className="text-[10px] text-slate-400">Amount (PKR)</p>
                    <p className="font-extrabold text-slate-100 text-base">
                      Rs. {pkrVal.toLocaleString()}
                      {isHighValue && (
                        <span className="ml-1.5 inline-block text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          High
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Coins Deducted</p>
                    <p className="font-bold text-amber-300 text-xs mt-0.5">🪙 {coinVal.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <span className="flex items-center space-x-1">
                    <Calendar size={11} className="text-slate-500" />
                    <span>{new Date(w.createdAt).toLocaleString()}</span>
                  </span>
                </div>

                {statusFilter === 'PENDING' ? (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                    <button
                      onClick={() => handleApprove(w.id)}
                      className="py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Check size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(w.id)}
                      className="py-2 px-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <X size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/5 text-right">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Status: {w.status}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop / Tablet Table (>= md) */}
      <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-900/80 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">User Details</th>
                <th className="p-4">Easypaisa Number</th>
                <th className="p-4">Coins Requested</th>
                <th className="p-4">PKR Value</th>
                <th className="p-4">Risk Evaluation</th>
                <th className="p-4">Requested At</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-400" />
                    Loading withdrawal requests...
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No {statusFilter.toLowerCase()} withdrawals found.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => {
                  const coinVal = w.coins || (w.amount ? w.amount * 100 : 0);
                  const pkrVal = w.amount || coinVal / 100;
                  const isHighValue = pkrVal >= 500;
                  const isRisk = (w.user?.fraudScore || 0) > 30;

                  return (
                    <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-100">{w.user?.name || 'Player'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{w.user?.phone || w.userId}</div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold whitespace-nowrap">
                          <Wallet size={13} />
                          <span>{w.easypaisaNumber}</span>
                        </span>
                      </td>

                      <td className="p-4 font-bold text-amber-300 whitespace-nowrap">
                        🪙 {coinVal.toLocaleString()} Coins
                      </td>

                      <td className="p-4 font-extrabold text-slate-100 text-sm whitespace-nowrap">
                        Rs. {pkrVal.toLocaleString()}
                        {isHighValue && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">
                            High Value
                          </span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {isRisk ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-semibold border border-rose-500/20">
                            <AlertTriangle size={12} />
                            <span>Risk Score: {w.user?.fraudScore}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                            <ShieldCheck size={12} />
                            <span>Clean Account</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(w.createdAt).toLocaleString()}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        {statusFilter === 'PENDING' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleApprove(w.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-semibold transition-all flex items-center space-x-1"
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(w.id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 font-semibold transition-all flex items-center space-x-1"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] uppercase font-semibold tracking-wider">
                            {w.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="glass-card p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <span>Showing Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong></span>
        <div className="flex items-center space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg glass-button-secondary disabled:opacity-30 flex items-center space-x-1"
          >
            <ChevronLeft size={15} />
            <span>Prev</span>
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg glass-button-secondary disabled:opacity-30 flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
