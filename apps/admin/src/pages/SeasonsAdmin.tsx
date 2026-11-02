import { useState, useEffect } from 'react';
import { Calendar, Trophy, Plus, Trash2, Zap, RefreshCw, X, Coins } from 'lucide-react';

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

export default function SeasonsAdmin() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', startDate: '', endDate: '', prizePool: 10000, isActive: false,
  });

  const fetchSeasons = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/seasons');
      setSeasons(Array.isArray(data) ? data : data.data || []);
    } catch {
      // Mock fallback
      setSeasons([
        {
          id: 's-1',
          name: 'Road to 1 Crore — Inaugural Season',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
          prizePool: 1000000,
          isActive: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSeasons(); }, []);

  const createSeason = async () => {
    try {
      await apiFetch('/admin/seasons', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false);
      fetchSeasons();
    } catch {
      alert('Failed to create season.');
    }
  };

  const toggleSeason = async (id: string, isActive: boolean) => {
    try {
      await apiFetch(`/admin/seasons/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !isActive }) });
      fetchSeasons();
    } catch {
      alert('Failed to update season status.');
    }
  };

  const deleteSeason = async (id: string) => {
    if (!confirm('Delete this season?')) return;
    try {
      await apiFetch(`/admin/seasons/${id}`, { method: 'DELETE' });
      fetchSeasons();
    } catch {
      alert('Failed to delete season.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Trophy className="text-amber-400" size={22} />
            <span>Championship Seasons</span>
          </h1>
          <p className="text-xs text-slate-400">Manage prize pools and timelines for nationwide championship tournaments</p>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={fetchSeasons}
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
            <span>{showForm ? 'Close' : 'New Season'}</span>
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-4 sm:p-6 border-indigo-500/30 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="text-amber-400" size={18} />
              <span>Create New Championship Season</span>
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Season Name</label>
              <input
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="e.g. Road to 1 Crore - Season 1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Start Date</label>
              <input
                type="date"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.startDate}
                onChange={e => setForm(f => ({...f, startDate: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">End Date</label>
              <input
                type="date"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.endDate}
                onChange={e => setForm(f => ({...f, endDate: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Prize Pool (Coins)</label>
              <input
                type="number"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.prizePool}
                onChange={e => setForm(f => ({...f, prizePool: +e.target.value}))}
              />
            </div>
            <div className="flex items-center gap-3 pt-2 sm:pt-6">
              <input
                type="checkbox"
                id="active"
                checked={form.isActive}
                onChange={e => setForm(f => ({...f, isActive: e.target.checked}))}
                className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
              />
              <label htmlFor="active" className="text-xs text-slate-200 cursor-pointer">Start as Live Active Season</label>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
            <button
              onClick={createSeason}
              className="w-full sm:w-auto px-5 py-2.5 glass-button-primary text-white rounded-xl font-semibold text-xs"
            >
              Create Season
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

      {/* Seasons List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw size={24} className="animate-spin text-amber-400" />
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {seasons.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-500">
              <Trophy size={40} className="mx-auto mb-3 opacity-30 text-amber-400" />
              <p className="text-sm">No seasons scheduled yet.</p>
            </div>
          )}
          {seasons.map((s: any) => {
            const now = new Date();
            const start = new Date(s.startDate);
            const end = new Date(s.endDate);
            const isUpcoming = now < start;
            const isEnded = now > end;

            return (
              <div
                key={s.id}
                className={`glass-card rounded-2xl p-4 sm:p-5 transition-all ${
                  s.isActive ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-slate-900/40' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 w-full sm:w-auto">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      s.isActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Trophy size={20} className={s.isActive ? 'text-amber-400' : 'text-slate-400'} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate">{s.name}</h3>
                        {s.isActive && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold animate-pulse">
                            <Zap size={10} /> LIVE
                          </span>
                        )}
                        {!s.isActive && isUpcoming && (
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-medium">
                            Upcoming
                          </span>
                        )}
                        {!s.isActive && isEnded && (
                          <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 border border-white/10 rounded-full font-medium">
                            Ended
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-500" />
                          <span>{new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center gap-1 text-amber-300 font-bold">
                          <Coins size={12} className="text-amber-400" />
                          <span>{s.prizePool.toLocaleString()} coins prize</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <button
                      onClick={() => toggleSeason(s.id, s.isActive)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        s.isActive
                          ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                          : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                      }`}
                    >
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteSeason(s.id)}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
                      aria-label="Delete season"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
