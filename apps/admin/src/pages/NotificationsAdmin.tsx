import { useState, useEffect } from 'react';
import { Bell, Send, Users, RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://109.199.122.238:3000/api';

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  });
  return res.json();
}

export default function NotificationsAdmin() {
  const [stats, setStats] = useState({ totalTokens: 0 });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');
  const [form, setForm] = useState({
    title: '', body: '', target: 'all',
  });

  useEffect(() => {
    apiFetch('/admin/notifications/stats').then(d => setStats(d)).catch(() => {});
  }, []);

  const sendNotification = async () => {
    if (!form.title || !form.body) return alert('Title and body required');
    setSending(true);
    try {
      const data = await apiFetch('/admin/notifications/send', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setResult(`✅ Sent to ${data.sent || '?'} devices`);
    } catch {
      setResult('❌ Failed to send');
    } finally {
      setSending(false);
    }
  };

  const templates = [
    { title: '🔥 Don\'t Break Your Streak!', body: 'You haven\'t played today! Play now to keep your streak going.' },
    { title: '🏆 Tournament Starting Soon!', body: 'A new tournament begins in 1 hour. Use your ticket to join!' },
    { title: '🎁 Daily Spin Available!', body: 'Your free daily spin is ready. Win coins, tickets & more!' },
    { title: '🎯 New Missions Available!', body: 'Fresh missions are waiting for you. Complete them to earn big rewards!' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Push Notifications</h1>
          <p className="text-gray-400 mt-1">Send push notifications to all users or specific segments</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Registered Devices</p>
          <p className="text-3xl font-black text-white mt-1">{stats.totalTokens}</p>
          <p className="text-xs text-gray-500 mt-1">Users with push tokens</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Last Campaign</p>
          <p className="text-xl font-black text-white mt-1">—</p>
          <p className="text-xs text-gray-500 mt-1">No campaigns sent yet</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Avg Open Rate</p>
          <p className="text-3xl font-black text-emerald-400 mt-1">—%</p>
          <p className="text-xs text-gray-500 mt-1">Coming soon</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Send Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Send size={18} className="text-emerald-400" />Send Notification
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Audience</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.target} onChange={e => setForm(f => ({...f, target: e.target.value}))}>
                <option value="all">All Users</option>
                <option value="active">Active Users (last 7 days)</option>
                <option value="inactive">Inactive Users</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Notification title..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Message Body</label>
              <textarea rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white resize-none" value={form.body} onChange={e => setForm(f => ({...f, body: e.target.value}))} placeholder="Notification message..." />
            </div>

            {result && (
              <div className={`p-3 rounded-lg text-sm ${result.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {result}
              </div>
            )}

            <button
              onClick={sendNotification}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Bell size={16} />}
              {sending ? 'Sending...' : 'Send Push Notification'}
            </button>
          </div>
        </div>

        {/* Templates */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-blue-400" />Quick Templates
          </h2>
          <div className="space-y-3">
            {templates.map((t, i) => (
              <button
                key={i}
                onClick={() => setForm(f => ({...f, title: t.title, body: t.body}))}
                className="w-full text-left p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-emerald-500/50 hover:bg-gray-800/80 transition-all"
              >
                <p className="font-semibold text-white text-sm">{t.title}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{t.body}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
