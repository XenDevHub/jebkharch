import { useState, useEffect } from 'react';
import { Target, CheckCircle, Clock, Plus, Trash2, RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://109.199.122.238:3000/api';

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  });
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
    const data = await apiFetch('/admin/missions');
    setMissions(Array.isArray(data) ? data : data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMissions(); }, []);

  const createMission = async () => {
    await apiFetch('/admin/missions', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ title: '', description: '', icon: '🎯', type: 'DAILY', targetValue: 5, rewardCoins: 50, rewardXp: 20, rewardTickets: 0 });
    fetchMissions();
  };

  const deleteMission = async (id: string) => {
    if (!confirm('Delete this mission?')) return;
    await apiFetch(`/admin/missions/${id}`, { method: 'DELETE' });
    fetchMissions();
  };

  const typeColors: Record<string, string> = {
    DAILY: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    WEEKLY: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    SPECIAL: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Missions & Achievements</h1>
          <p className="text-gray-400 mt-1">Manage daily/weekly missions and achievement criteria</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchMissions} className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700">
            <RefreshCw size={16} />Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500">
            <Plus size={16} />New Mission
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Create New Mission</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Play 5 quizzes" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="SPECIAL">Special</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="e.g. Play 5 quiz sessions today" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Value</label>
              <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.targetValue} onChange={e => setForm(f => ({...f, targetValue: +e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Icon (Emoji)</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Reward Coins</label>
              <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.rewardCoins} onChange={e => setForm(f => ({...f, rewardCoins: +e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Reward Tickets</label>
              <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.rewardTickets} onChange={e => setForm(f => ({...f, rewardTickets: +e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createMission} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium">Create Mission</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Missions List */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid gap-4">
          {missions.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Target size={48} className="mx-auto mb-4 opacity-30" />
              <p>No missions yet. Create the first one!</p>
            </div>
          ) : missions.map((m: any) => (
            <div key={m.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center gap-4">
              <div className="text-3xl w-12 h-12 flex items-center justify-center bg-gray-700 rounded-xl">{m.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-white text-lg">{m.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[m.type] || 'bg-gray-700 text-gray-400 border-gray-600'}`}>{m.type}</span>
                  {m.isActive ? <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle size={12} />Active</span> : <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={12} />Inactive</span>}
                </div>
                <p className="text-gray-400 text-sm mb-2">{m.description}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>🎯 Target: <strong className="text-gray-300">{m.targetValue}</strong></span>
                  <span>🪙 Reward: <strong className="text-emerald-400">{m.rewardCoins} coins</strong></span>
                  {m.rewardTickets > 0 && <span>🎟️ Tickets: <strong className="text-yellow-400">{m.rewardTickets}</strong></span>}
                </div>
              </div>
              <button onClick={() => deleteMission(m.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
