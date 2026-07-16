import { useState, useEffect } from 'react';
import { adminApi } from '../api/client';

export default function Dashboard() {
  const [data, setData] = useState({
    totalUsers: 0,
    activeSessions: 0,
    pendingWithdrawals: 0,
    flaggedUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.analytics.getDashboard()
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        <div className="text-gray-400">Loading metrics...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-3xl font-bold text-white mt-2">{data.totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-sm">Active Sessions</p>
          <p className="text-3xl font-bold text-white mt-2">{data.activeSessions.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-sm">Pending Withdrawals</p>
          <p className="text-3xl font-bold text-amber-500 mt-2">{data.pendingWithdrawals.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-sm">Flagged Users</p>
          <p className="text-3xl font-bold text-red-500 mt-2">{data.flaggedUsers.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
