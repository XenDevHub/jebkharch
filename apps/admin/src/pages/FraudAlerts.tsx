import { useState, useEffect } from 'react';
import { adminApi } from '../api/client';
import { AlertOctagon, Check, ShieldAlert, UserX, Info, ChevronLeft, ChevronRight, RefreshCw, Calendar, Phone } from 'lucide-react';

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
      fetchAlerts();
    } catch (err) {
      console.error('Failed to ban user:', err);
      alert('Failed to ban user');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <AlertOctagon className="text-rose-500" size={22} />
            <span>Fraud Detection & Bot Alerts</span>
          </h1>
          <p className="text-xs text-slate-400">Automated telemetry flags for abnormal win rates, multi-accounting & speed-hacks</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="p-2.5 glass-button-secondary rounded-xl text-slate-300 hover:text-white shrink-0"
          title="Refresh alerts"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="glass-card p-8 rounded-2xl text-center text-slate-400 text-xs">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-rose-400" />
            Loading fraud alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center text-slate-400 text-xs">
            No fraud alerts detected. System is secure.
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="glass-card p-4 rounded-2xl space-y-3 border-rose-500/20">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-1.5 font-semibold text-white text-sm">
                    <Phone size={13} className="text-slate-400" />
                    <span>{alert.phone}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">{alert.userId}</p>
                </div>
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold border ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px] tracking-wide uppercase">
                  {alert.type.replace('_', ' ')}
                </span>
                <span className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <Calendar size={11} className="text-slate-500" />
                  <span>{new Date(alert.createdAt).toLocaleString()}</span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs flex items-start gap-2">
                <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-300 leading-relaxed">{alert.details}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  {alert.status === 'PENDING' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <ShieldAlert size={11} className="mr-1" /> Flagged
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Check size={11} className="mr-1" /> Resolved
                    </span>
                  )}
                </div>

                {alert.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(alert.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-xs flex items-center space-x-1"
                    >
                      <Check size={13} />
                      <span>Resolve</span>
                    </button>
                    <button
                      onClick={() => handleBanUser(alert.userId)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center space-x-1"
                    >
                      <UserX size={13} />
                      <span>Ban</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / Tablet Table (>= md) */}
      <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-900/80 border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">User Details</th>
                <th className="p-4">Violation Type</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Details</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading alerts...</td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No fraud alerts detected. System is secure.</td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{alert.phone}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{alert.userId}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-semibold text-xs tracking-wider uppercase block text-slate-200">
                        {alert.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="p-4 text-xs max-w-xs">
                      <div className="flex items-start gap-1.5">
                        <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                        <span className="text-slate-300 leading-relaxed">{alert.details}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {alert.status === 'PENDING' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <ShieldAlert size={12} className="mr-1" /> Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Check size={12} className="mr-1" /> Resolved
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {alert.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleResolve(alert.id, 'RESOLVED')}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                            title="Resolve Alert"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleBanUser(alert.userId)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
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
      </div>

      {/* Pagination Footer */}
      <div className="glass-card p-3.5 sm:p-4 rounded-2xl flex items-center justify-between text-xs text-slate-400">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1.5 rounded-lg glass-button-secondary disabled:opacity-30 flex items-center space-x-1"
        >
          <ChevronLeft size={15} />
          <span>Previous</span>
        </button>
        <span>Page <strong className="text-slate-200">{page}</strong></span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1.5 rounded-lg glass-button-secondary flex items-center space-x-1"
        >
          <span>Next</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
