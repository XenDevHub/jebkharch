import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, LayoutDashboard, Database, ShieldAlert, CreditCard } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/UsersList';
import Withdrawals from './pages/Withdrawals';
import ContentModeration from './pages/ContentModeration';
import FraudAlerts from './pages/FraudAlerts';

export default function App() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/withdrawals', label: 'Withdrawals', icon: CreditCard },
    { path: '/content', label: 'Content', icon: Database },
    { path: '/fraud', label: 'Fraud Alerts', icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            JEB KHARCH
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-gray-900">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-500">admin@jebkharch.pk</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/withdrawals" element={<Withdrawals />} />
          <Route path="/content" element={<ContentModeration />} />
          <Route path="/fraud" element={<FraudAlerts />} />
        </Routes>
      </main>
    </div>
  );
}
