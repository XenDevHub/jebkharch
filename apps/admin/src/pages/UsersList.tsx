import { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle2, ShieldAlert, RefreshCw, ChevronLeft, ChevronRight, UserCheck, Phone, Coins, Award } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">User Management Directory</h1>
          <p className="text-xs text-slate-400">Search, monitor risk scores, and manage player accounts</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
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
            className="p-2.5 glass-button-secondary rounded-xl text-slate-300 hover:text-white"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Glass Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
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
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                          {(u.name || u.phone || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{u.name || 'Player'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.id.slice(0, 12)}...</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-300">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-white/5">
                        <Phone size={12} className="text-slate-400" />
                        <span>{u.phone}</span>
                      </span>
                    </td>

                    <td className="p-4 font-bold text-amber-300">
                      <span className="inline-flex items-center space-x-1">
                        <Coins size={14} className="text-amber-400" />
                        <span>{(u.coins || 0).toLocaleString()}</span>
                      </span>
                    </td>

                    <td className="p-4 text-indigo-300 font-semibold">
                      <span className="inline-flex items-center space-x-1">
                        <Award size={14} className="text-indigo-400" />
                        <span>{u.xp || 0} XP</span>
                      </span>
                    </td>

                    <td className="p-4">
                      {u.isBanned ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-[11px]">
                          <Ban size={12} />
                          <span>Banned</span>
                        </span>
                      ) : u.isFlagged ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-[11px]">
                          <ShieldAlert size={12} />
                          <span>Flagged (Score: {u.fraudScore})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 size={12} />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      {u.isBanned ? (
                        <button
                          onClick={() => handleUnbanUser(u.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 font-semibold text-[11px] transition-colors"
                        >
                          <UserCheck size={13} className="inline mr-1" /> Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBanUser(u.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-semibold text-[11px] transition-colors"
                        >
                          <Ban size={13} className="inline mr-1" /> Ban Account
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-900/60 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2 rounded-lg glass-button-secondary disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg glass-button-secondary disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
