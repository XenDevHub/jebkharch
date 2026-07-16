import { useState, useEffect } from 'react';
import { adminApi } from '../api/client';
import { AlertOctagon, Check, ShieldAlert, UserX, Info } from 'lucide-react';

interface FraudAlert {
  id: string;
  userId: string;
  phone: string;
  type: 'MULTIPLE_ACCOUNTS' | 'SPEED_HACK' | 'ABNORMAL_WIN_RATE' | 'SUSPICIOUS_WITHDRAWAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
}

export default function FraudAlerts() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchAlerts = () => {
    setLoading(true);
    adminApi.fraud.getAlerts(page)
      .then((res) => {
        setAlerts(res.data.data || res.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch fraud alerts:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, [page]);

  const handleResolve = async (alertId: string, action: string) => {
    if (!confirm(`Are you sure you want to mark this alert as ${action}?`)) return;
    try {
      await adminApi.fraud.resolve(alertId, action);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
      alert('Failed to resolve alert');
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Enter reason for banning user associated with this alert:');
    if (!reason) return;
    try {
      await adminApi.users.ban(userId, reason);
      alert('User banned successfully');
      fetchAlerts(); // Refresh to see update
    } catch (err) {
      console.error('Failed to ban user:', err);
      alert('Failed to ban user');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-500 border border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-500 border border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
      default:
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/30';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <AlertOctagon className="text-red-500" size={24} />
        Fraud Detection & Alerts
      </h1>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Severity</th>
                <th className="p-4 font-medium">Details</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">Loading alerts...</td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">No fraud alerts detected. System is secure.</td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="p-4">
                      <div className="font-semibold text-white">{alert.phone}</div>
                      <div className="text-xs text-gray-500">{alert.userId}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-xs tracking-wider uppercase block">
                        {alert.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded font-bold ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="p-4 text-sm max-w-xs">
                      <div className="flex items-start gap-1">
                        <Info size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{alert.details}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {alert.status === 'PENDING' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <ShieldAlert size={12} className="mr-1" /> Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Check size={12} className="mr-1" /> Resolved
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {alert.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleResolve(alert.id, 'RESOLVED')}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                            title="Resolve Alert"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleBanUser(alert.userId)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            title="Ban Associated User"
                          >
                            <UserX size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-between items-center text-sm text-gray-400">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-700 rounded-md"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
