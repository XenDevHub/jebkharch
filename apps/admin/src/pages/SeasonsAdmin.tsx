import { useState, useEffect } from 'react';
import { Calendar, Trophy, Plus, Trash2, Zap, RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://109.199.122.238:3000/api';

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  });
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
    const data = await apiFetch('/admin/seasons');
    setSeasons(Array.isArray(data) ? data : data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSeasons(); }, []);

  const createSeason = async () => {
    await apiFetch('/admin/seasons', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false);
    fetchSeasons();
  };

  const toggleSeason = async (id: string, isActive: boolean) => {
    await apiFetch(`/admin/seasons/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !isActive }) });
    fetchSeasons();
  };

  const deleteSeason = async (id: string) => {
    if (!confirm('Delete this season?')) return;
    await apiFetch(`/admin/seasons/${id}`, { method: 'DELETE' });
    fetchSeasons();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Championship Seasons</h1>
          <p className="text-gray-400 mt-1">Manage "Road to 1 Crore" style championship seasons</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchSeasons} className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700">
            <RefreshCw size={16} />Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500">
            <Plus size={16} />New Season
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Create New Season</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Season Name</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Road to 1 Crore - Season 1" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Date</label>
              <input type="date" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Date</label>
              <input type="date" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Prize Pool (Coins)</label>
              <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.prizePool} onChange={e => setForm(f => ({...f, prizePool: +e.target.value}))} />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="active" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive: e.target.checked}))} className="w-4 h-4 accent-emerald-500" />
              <label htmlFor="active" className="text-sm text-gray-300">Start as Active Season</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createSeason} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium">Create Season</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Seasons List */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid gap-4">
          {seasons.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <Trophy size={48} className="mx-auto mb-4 opacity-30" />
              <p>No seasons yet. Create the first championship!</p>
            </div>
          )}
          {seasons.map((s: any) => {
            const now = new Date();
            const start = new Date(s.startDate);
            const end = new Date(s.endDate);
            const isRunning = now >= start && now <= end;
            const isUpcoming = now < start;
            const isEnded = now > end;
            return (
              <div key={s.id} className={`bg-gray-800 border rounded-2xl p-6 ${s.isActive ? 'border-emerald-500/50' : 'border-gray-700'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.isActive ? 'bg-emerald-500/20' : 'bg-gray-700'}`}>
                      <Trophy size={22} className={s.isActive ? 'text-emerald-400' : 'text-gray-500'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-xl">{s.name}</h3>
                        {s.isActive && <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full"><Zap size={10} />LIVE</span>}
                        {!s.isActive && isUpcoming && <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">Upcoming</span>}
                        {!s.isActive && isEnded && <span className="text-xs px-2 py-0.5 bg-gray-500/20 text-gray-400 border border-gray-600 rounded-full">Ended</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><Calendar size={12} />{new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}</span>
                        <span className="text-yellow-400 font-bold">🪙 {s.prizePool.toLocaleString()} coins prize</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSeason(s.id, s.isActive)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${s.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                    >
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => deleteSeason(s.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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
