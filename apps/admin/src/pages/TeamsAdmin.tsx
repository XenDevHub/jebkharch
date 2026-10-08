import { useState, useEffect } from 'react';
import { Users, Trophy, Plus, UserX, RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://109.199.122.238:3000/api';

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  });
  return res.json();
}

export default function TeamsAdmin() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', prizePool: 0 });

  const fetchTeams = async () => {
    setLoading(true);
    const data = await apiFetch('/teams');
    setTeams(Array.isArray(data) ? data : data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTeams(); }, []);

  const createTeam = async () => {
    await apiFetch('/teams', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false);
    fetchTeams();
  };

  const deleteTeam = async (id: string) => {
    if (!confirm('Delete this team? All members will be removed.')) return;
    await apiFetch(`/admin/teams/${id}`, { method: 'DELETE' });
    fetchTeams();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Clans & Teams</h1>
          <p className="text-gray-400 mt-1">Manage player clans, team memberships and scores</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchTeams} className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700">
            <RefreshCw size={16} />Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500">
            <Plus size={16} />New Team
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Total Teams</p>
          <p className="text-3xl font-black text-white mt-1">{teams.length}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Total Members</p>
          <p className="text-3xl font-black text-white mt-1">{teams.reduce((sum, t) => sum + (t._count?.members || 0), 0)}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Avg Members/Team</p>
          <p className="text-3xl font-black text-white mt-1">
            {teams.length ? Math.round(teams.reduce((sum, t) => sum + (t._count?.members || 0), 0) / teams.length) : 0}
          </p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Create Admin Team</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Team Name</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Karachi Kings" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Team tagline" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createTeam} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium">Create Team</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Teams List */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">#</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Team</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Members</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Score</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Created</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {teams.map((t: any, idx: number) => (
                <tr key={t.id} className="bg-gray-800/20 hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-mono">#{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center font-bold text-gray-900">{t.name[0]}</div>
                      <div>
                        <p className="font-semibold text-white">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.description || 'No description'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-300">
                      <Users size={14} className="text-gray-500" />
                      {t._count?.members ?? 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-yellow-400 font-bold">
                      <Trophy size={14} />
                      {t.score ?? 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deleteTeam(t.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <UserX size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teams.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p>No teams yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
