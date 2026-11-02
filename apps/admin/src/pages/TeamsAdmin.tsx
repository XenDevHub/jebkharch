import { useState, useEffect } from 'react';
import { Users, Trophy, Plus, UserX, RefreshCw, X, Shield, Calendar } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://109.199.122.238:3000/api';

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('token') || localStorage.getItem('admin_token') || '';
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  });
  if (!res.ok) throw new Error('API fetch failed');
  return res.json();
}

export default function TeamsAdmin() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', prizePool: 0 });

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/teams');
      setTeams(Array.isArray(data) ? data : data.data || []);
    } catch {
      // Mock fallback
      setTeams([
        { id: 't-1', name: 'Karachi Kings', description: 'Top quiz squad in Sindh', score: 1420, createdAt: new Date().toISOString(), _count: { members: 8 } },
        { id: 't-2', name: 'Lahore Qalandars', description: 'Master trivia masters', score: 980, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), _count: { members: 6 } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  const createTeam = async () => {
    try {
      await apiFetch('/teams', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false);
      setForm({ name: '', description: '', prizePool: 0 });
      fetchTeams();
    } catch {
      alert('Failed to create team.');
    }
  };

  const deleteTeam = async (id: string) => {
    if (!confirm('Delete this team? All members will be removed.')) return;
    try {
      await apiFetch(`/admin/teams/${id}`, { method: 'DELETE' });
      fetchTeams();
    } catch {
      alert('Failed to delete team.');
    }
  };

  const totalMembers = teams.reduce((sum, t) => sum + (t._count?.members || 0), 0);
  const avgMembers = teams.length ? Math.round(totalMembers / teams.length) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Shield className="text-teal-400" size={22} />
            <span>Clans & Guild Teams</span>
          </h1>
          <p className="text-xs text-slate-400">Manage clan rosters, team leaderboards, and membership metrics</p>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={fetchTeams}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 glass-button-secondary rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 glass-button-primary rounded-xl text-xs font-semibold text-white shadow-lg shadow-indigo-600/30"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            <span>{showForm ? 'Close' : 'New Team'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        <div className="glass-card rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-400">Total Active Teams</p>
          <p className="text-xl sm:text-3xl font-black text-white mt-1">{teams.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-400">Total Enrolled Members</p>
          <p className="text-xl sm:text-3xl font-black text-emerald-400 mt-1">{totalMembers}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-400">Avg Members / Team</p>
          <p className="text-xl sm:text-3xl font-black text-cyan-400 mt-1">{avgMembers}</p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-4 sm:p-6 border-indigo-500/30 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="text-teal-400" size={18} />
              <span>Create Official Admin Team</span>
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Team Name</label>
              <input
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="e.g. Islamabad United"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tagline / Description</label>
              <input
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.description}
                onChange={e => setForm(f => ({...f, description: e.target.value}))}
                placeholder="Team motto or tagline"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
            <button
              onClick={createTeam}
              className="w-full sm:w-auto px-5 py-2.5 glass-button-primary text-white rounded-xl font-semibold text-xs"
            >
              Create Team
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="w-full sm:w-auto px-5 py-2.5 glass-button-secondary text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mobile Card View (< md) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="glass-card p-8 rounded-2xl text-center text-slate-400 text-xs">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-teal-400" />
            Loading team data...
          </div>
        ) : teams.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center text-slate-400 text-xs">
            No teams established yet.
          </div>
        ) : (
          teams.map((t: any, idx: number) => (
            <div key={t.id} className="glass-card p-4 rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md shrink-0">
                    {t.name ? t.name[0].toUpperCase() : 'T'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-400 font-bold">#{idx + 1}</span>
                      <h3 className="font-semibold text-slate-100 text-sm truncate">{t.name}</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{t.description || 'No description'}</p>
                  </div>
                </div>

                <button
                  onClick={() => deleteTeam(t.id)}
                  aria-label="Delete team"
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                >
                  <UserX size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/5">
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Users size={13} className="text-slate-400" />
                  <span>{t._count?.members ?? 0} Members</span>
                </div>
                <div className="flex items-center space-x-1.5 text-yellow-400 font-bold justify-end">
                  <Trophy size={13} />
                  <span>{t.score ?? 0} pts</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                <span className="flex items-center space-x-1">
                  <Calendar size={11} className="text-slate-500" />
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / Tablet Table View (>= md) */}
      <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-900/80 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4"># Rank</th>
                <th className="p-4">Team</th>
                <th className="p-4">Members</th>
                <th className="p-4">Score</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading teams...</td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No teams created yet.</td>
                </tr>
              ) : (
                teams.map((t: any, idx: number) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-slate-400 font-bold">#{idx + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md shrink-0">
                          {t.name ? t.name[0].toUpperCase() : 'T'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{t.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{t.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Users size={13} className="text-slate-400" />
                        <span>{t._count?.members ?? 0}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                        <Trophy size={13} />
                        <span>{t.score ?? 0}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteTeam(t.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete team"
                      >
                        <UserX size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
