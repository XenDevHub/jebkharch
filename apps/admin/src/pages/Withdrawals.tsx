import { useState, useEffect } from 'react';
import { adminApi } from '../api/client';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';

interface Withdrawal {
  id: string;
  userId: string;
  phone: string;
  amount: number;
  easypaisaNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  requiresManualReview?: boolean;
}

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);

  const fetchWithdrawals = () => {
    setLoading(true);
    adminApi.withdrawals.getList(statusFilter, page)
      .then((res) => {
        setWithdrawals(res.data.data || res.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch withdrawals:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter, page]);

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this withdrawal?')) return;
    try {
      await adminApi.withdrawals.approve(id);
      fetchWithdrawals();
    } catch (err) {
      console.error('Failed to approve:', err);
      alert('Failed to approve withdrawal');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await adminApi.withdrawals.reject(id, reason);
      fetchWithdrawals();
    } catch (err) {
      console.error('Failed to reject:', err);
      alert('Failed to reject withdrawal');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Easypaisa #</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">No {statusFilter.toLowerCase()} withdrawals.</td>
                </tr>
              ) : (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="p-4">
                      <div className="font-medium text-white">{withdrawal.phone}</div>
                      <div className="text-xs text-gray-500">{withdrawal.userId}</div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      {withdrawal.amount}
                      {withdrawal.amount > 1000 && (
                        <span title="Large withdrawal requires review">
                          <AlertTriangle size={14} className="inline ml-2 text-amber-500" />
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-sm">{withdrawal.easypaisaNumber}</td>
                    <td className="p-4 text-sm text-gray-400">{new Date(withdrawal.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      {withdrawal.status === 'PENDING' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500">
                          <Clock size={12} className="mr-1" /> Pending
                        </span>
                      )}
                      {withdrawal.status === 'APPROVED' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                          <Check size={12} className="mr-1" /> Approved
                        </span>
                      )}
                      {withdrawal.status === 'REJECTED' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                          <X size={12} className="mr-1" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {withdrawal.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(withdrawal.id)}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(withdrawal.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            title="Reject"
                          >
                            <X size={16} />
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
