import { useState, useEffect } from 'react';
import { Target, CheckCircle, Clock, Plus, Trash2, RefreshCw, X, Coins, Ticket } from 'lucide-react';

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

export default function MissionsAdmin() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', icon: '🎯', type: 'DAILY',
    targetValue: 5, rewardCoins: 50, rewardXp: 20, rewardTickets: 0,
  });

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/missions');
      setMissions(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      // Mock fallback
      setMissions([
        { id: 'm-1', title: 'Play 5 Quizzes', description: 'Complete 5 quiz matches today', icon: '🎮', type: 'DAILY', targetValue: 5, rewardCoins: 100, rewardTickets: 1, isActive: true },
        { id: 'm-2', title: 'Weekend Champion', description: 'Win 3 tournaments this week', icon: '🏆', type: 'WEEKLY', targetValue: 3, rewardCoins: 500, rewardTickets: 2, isActive: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMissions(); }, []);

  const createMission = async () => {
    try {
      await apiFetch('/admin/missions', { method: 'POST', body: JSON.stringify(form) });
      setShowForm(false);
      setForm({ title: '', description: '', icon: '🎯', type: 'DAILY', targetValue: 5, rewardCoins: 50, rewardXp: 20, rewardTickets: 0 });
      fetchMissions();
    } catch {
      alert('Failed to create mission.');
    }
  };

  const deleteMission = async (id: string) => {
    if (!confirm('Delete this mission?')) return;
    try {
      await apiFetch(`/admin/missions/${id}`, { method: 'DELETE' });
      fetchMissions();
    } catch {
      alert('Failed to delete mission.');
    }
  };

  const typeColors: Record<string, string> = {
    DAILY: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    WEEKLY: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    SPECIAL: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Target className="text-indigo-400" size={22} />
            <span>Missions & Daily Quests</span>
          </h1>
          <p className="text-xs text-slate-400">Configure daily, weekly and special challenge reward missions</p>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={fetchMissions}
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
            <span>{showForm ? 'Close' : 'New Mission'}</span>
          </button>
        </div>
      </div>

      {/* Create Form Drawer / Box */}
      {showForm && (
        <div className="glass-card rounded-2xl p-4 sm:p-6 border-indigo-500/30 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="text-indigo-400" size={18} />
              <span>Create New Mission</span>
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
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Mission Title</label>
              <input
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.title}
                onChange={e => setForm(f => ({...f, title: e.target.value}))}
                placeholder="e.g. Play 5 quizzes"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Mission Type</label>
              <select
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.type}
                onChange={e => setForm(f => ({...f, type: e.target.value}))}
              >
                <option value="DAILY" className="bg-slate-900 text-slate-200">Daily</option>
                <option value="WEEKLY" className="bg-slate-900 text-slate-200">Weekly</option>
                <option value="SPECIAL" className="bg-slate-900 text-slate-200">Special Event</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
              <input
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.description}
                onChange={e => setForm(f => ({...f, description: e.target.value}))}
                placeholder="e.g. Play 5 quiz sessions today to win extra coin rewards"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Value (Count)</label>
              <input
                type="number"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.targetValue}
                onChange={e => setForm(f => ({...f, targetValue: +e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Icon (Emoji or Icon)</label>
              <input
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.icon}
                onChange={e => setForm(f => ({...f, icon: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Reward Coins</label>
              <input
                type="number"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.rewardCoins}
                onChange={e => setForm(f => ({...f, rewardCoins: +e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Reward Tournament Tickets</label>
              <input
                type="number"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                value={form.rewardTickets}
                onChange={e => setForm(f => ({...f, rewardTickets: +e.target.value}))}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
            <button
              onClick={createMission}
              className="w-full sm:w-auto px-5 py-2.5 glass-button-primary text-white rounded-xl font-semibold text-xs"
            >
              Create Mission
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

      {/* Missions List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw size={24} className="animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {missions.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-500">
              <Target size={40} className="mx-auto mb-3 opacity-30 text-indigo-400" />
              <p className="text-sm">No missions defined. Create the first one!</p>
            </div>
          ) : (
            missions.map((m: any) => (
              <div
                key={m.id}
                className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 w-full sm:w-auto">
                  <div className="text-2xl sm:text-3xl w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-800/80 rounded-2xl border border-white/5 shrink-0">
                    {m.icon || '🎯'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm sm:text-base truncate">{m.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${typeColors[m.type] || 'bg-slate-800 text-slate-400 border-white/10'}`}>
                        {m.type}
                      </span>
                      {m.isActive ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle size={10} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                          <Clock size={10} /> Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{m.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                      <span>🎯 Target: <strong className="text-slate-200">{m.targetValue}</strong></span>
                      <span className="flex items-center gap-1 text-amber-300 font-semibold">
                        <Coins size={12} className="text-amber-400" />
                        <span>{m.rewardCoins} Coins</span>
                      </span>
                      {m.rewardTickets > 0 && (
                        <span className="flex items-center gap-1 text-yellow-300 font-semibold">
                          <Ticket size={12} className="text-yellow-400" />
                          <span>{m.rewardTickets} Ticket(s)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 w-full sm:w-auto flex justify-end">
                  <button
                    onClick={() => deleteMission(m.id)}
                    aria-label="Delete mission"
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
