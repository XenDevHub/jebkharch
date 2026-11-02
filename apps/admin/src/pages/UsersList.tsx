import { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle2, ShieldAlert, RefreshCw, ChevronLeft, ChevronRight, UserCheck, Phone, Coins, Award, Calendar } from 'lucide-react';

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

interface User {
  id: string;
  phone: string;
  name?: string;
  coins?: number;
  xp?: number;
  isBanned: boolean;
  isFlagged?: boolean;
  fraudScore?: number;
  createdAt: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/users?page=${page}&pageSize=15&search=${encodeURIComponent(search)}`);
      setUsers(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      // Fallback mock data if server unavailable
      setUsers([
        { id: 'usr-1', phone: '+923001234567', name: 'Zain Ahmed', coins: 14500, xp: 820, isBanned: false, isFlagged: false, fraudScore: 0, createdAt: new Date().toISOString() },
        { id: 'usr-2', phone: '+923129876543', name: 'Tariq Mehmood', coins: 89000, xp: 4500, isBanned: true, isFlagged: true, fraudScore: 85, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: 'usr-3', phone: '+923335557788', name: 'Ayesha Khan', coins: 3200, xp: 210, isBanned: false, isFlagged: false, fraudScore: 5, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Enter reason for banning user:');
    if (!reason) return;
    try {
      await apiFetch(`/admin/users/${userId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      fetchUsers();
    } catch (e) {
      alert('Failed to ban user.');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await apiFetch(`/admin/users/${userId}/unban`, { method: 'POST' });
      fetchUsers();
    } catch (e) {
      alert('Failed to unban user.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">User Management Directory</h1>
          <p className="text-xs text-slate-400">Search, monitor risk scores, and manage player accounts</p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="w-full glass-input text-xs pl-10 pr-4 py-2.5 rounded-xl"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button
            onClick={fetchUsers}
            aria-label="Refresh user list"
            className="p-2.5 glass-button-secondary rounded-xl text-slate-300 hover:text-white shrink-0"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Mobile Card List View (Phones & Small Tablets < md) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="glass-card p-8 rounded-2xl text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-indigo-400" />
            Fetching player list...
          </div>
        ) : users.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center text-slate-400">
            No users matching criteria.
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="glass-card p-4 rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shrink-0">
                    {(u.name || u.phone || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-100 text-sm truncate">{u.name || 'Player'}</h3>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{u.id.slice(0, 14)}...</p>
                  </div>
                </div>

                {u.isBanned ? (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-[10px] shrink-0">
                    <Ban size={10} />
                    <span>Banned</span>
                  </span>
                ) : u.isFlagged ? (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-[10px] shrink-0">
                    <ShieldAlert size={10} />
                    <span>Risk: {u.fraudScore}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[10px] shrink-0">
                    <CheckCircle2 size={10} />
                    <span>Active</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/5">
                <div className="flex items-center space-x-1.5 text-slate-300 font-mono">
                  <Phone size={12} className="text-slate-400" />
                  <span className="truncate">{u.phone}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-amber-300 font-bold justify-end">
                  <Coins size={13} className="text-amber-400" />
                  <span>{(u.coins || 0).toLocaleString()} Coins</span>
                </div>
                <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold">
                  <Award size={13} className="text-indigo-400" />
                  <span>{u.xp || 0} XP</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] justify-end">
                  <Calendar size={12} className="text-slate-500" />
                  <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex justify-end">
                {u.isBanned ? (
                  <button
                    onClick={() => handleUnbanUser(u.id)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 font-semibold text-xs flex items-center justify-center space-x-1.5"
                  >
                    <UserCheck size={14} />
                    <span>Unban Account</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleBanUser(u.id)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-semibold text-xs flex items-center justify-center space-x-1.5"
                  >
                    <Ban size={14} />
                    <span>Ban Account</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / Tablet Table View (>= md) */}
      <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-900/80 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">User Details</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Coin Balance</th>
                <th className="p-4">XP Level</th>
                <th className="p-4">Risk Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-indigo-400" />
                    Fetching player list...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shrink-0">
                          {(u.name || u.phone || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 truncate">{u.name || 'Player'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.id.slice(0, 12)}...</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-300">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-white/5 whitespace-nowrap">
                        <Phone size={12} className="text-slate-400" />
                        <span>{u.phone}</span>
                      </span>
                    </td>

                    <td className="p-4 font-bold text-amber-300 whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1">
                        <Coins size={14} className="text-amber-400" />
                        <span>{(u.coins || 0).toLocaleString()}</span>
                      </span>
                    </td>

                    <td className="p-4 text-indigo-300 font-semibold whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1">
                        <Award size={14} className="text-indigo-400" />
                        <span>{u.xp || 0} XP</span>
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {u.isBanned ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-[11px]">
                          <Ban size={12} />
                          <span>Banned</span>
                        </span>
                      ) : u.isFlagged ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-[11px]">
                          <ShieldAlert size={12} />
                          <span>Flagged ({u.fraudScore})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 size={12} />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      {u.isBanned ? (
                        <button
                          onClick={() => handleUnbanUser(u.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 font-semibold text-[11px] transition-colors inline-flex items-center space-x-1"
                        >
                          <UserCheck size={13} />
                          <span>Unban</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBanUser(u.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-semibold text-[11px] transition-colors inline-flex items-center space-x-1"
                        >
                          <Ban size={13} />
                          <span>Ban Account</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer (shared between views) */}
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
