import { useState, useEffect } from 'react';
import { adminApi } from '../api/client';
import { Search, Ban, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  phone: string;
  balance: number;
  isBanned: boolean;
  createdAt: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = () => {
    setLoading(true);
    adminApi.users.getList(page, search)
      .then((res) => {
        // Assume API returns { data: User[], meta: { total, page } } or similar.
        // For now, we handle an array directly if it returns that.
        setUsers(res.data.data || res.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch users:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Enter reason for banning this user:');
    if (!reason) return;

    try {
      await adminApi.users.ban(userId, reason);
      // Refresh list
      fetchUsers();
    } catch (err) {
      console.error('Failed to ban user:', err);
      alert('Failed to ban user');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by phone..."
            className="bg-gray-800 text-white px-4 py-2 pl-10 rounded-lg border border-gray-700 focus:outline-none focus:border-emerald-500 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="p-4 font-medium">ID / Phone</th>
                <th className="p-4 font-medium">Balance</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="p-4">
                      <div className="font-medium text-white">{user.phone}</div>
                      <div className="text-xs text-gray-500">{user.id}</div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">{user.balance}</td>
                    <td className="p-4">
                      {user.isBanned ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                          <Ban size={12} className="mr-1" /> Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                          <CheckCircle size={12} className="mr-1" /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {!user.isBanned && (
                        <button
                          onClick={() => handleBanUser(user.id)}
                          className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                        >
                          Ban User
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple Pagination controls */}
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
