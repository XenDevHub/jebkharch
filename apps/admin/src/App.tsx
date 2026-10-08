import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Users, LayoutDashboard, Database, ShieldAlert, CreditCard,
  Target, Trophy, Bell, Shield, Search, Activity, Sparkles, LogOut, ChevronRight
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/UsersList';
import Withdrawals from './pages/Withdrawals';
import ContentModeration from './pages/ContentModeration';
import FraudAlerts from './pages/FraudAlerts';
import MissionsAdmin from './pages/MissionsAdmin';
import TeamsAdmin from './pages/TeamsAdmin';
import SeasonsAdmin from './pages/SeasonsAdmin';
import NotificationsAdmin from './pages/NotificationsAdmin';

export default function App() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard, section: 'core' },
    { path: '/users', label: 'User Directory', icon: Users, section: 'core' },
    { path: '/withdrawals', label: 'Withdrawals', icon: CreditCard, section: 'core', badge: 'Pending' },
    { path: '/content', label: 'Question Bank', icon: Database, section: 'core' },
    { path: '/fraud', label: 'Fraud Monitor', icon: ShieldAlert, section: 'core', highlight: true },
    { path: '/missions', label: 'Daily Missions', icon: Target, section: 'gamification' },
    { path: '/teams', label: 'Clans & Teams', icon: Shield, section: 'gamification' },
    { path: '/seasons', label: 'Championships', icon: Trophy, section: 'gamification' },
    { path: '/notifications', label: 'Push Broadcast', icon: Bell, section: 'tools' },
  ];

  const coreNav = navItems.filter(i => i.section === 'core');
  const gamificationNav = navItems.filter(i => i.section === 'gamification');
  const toolsNav = navItems.filter(i => i.section === 'tools');

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-lg shadow-indigo-950/40'
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-110 ${
            isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800/80 text-slate-400 group-hover:text-indigo-400'
          }`}>
            <Icon size={18} />
          </div>
          <span className="font-medium text-sm tracking-wide">{item.label}</span>
        </div>

        {item.badge && (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
            {item.badge}
          </span>
        )}
        {isActive && (
          <ChevronRight size={14} className="text-indigo-400 transform translate-x-0 transition-transform" />
        )}
      </Link>
    );
  };

  const getPageTitle = () => {
    const matched = navItems.find(i => i.path === location.pathname);
    return matched ? matched.label : 'Dashboard';
  };

  return (
    <div className="relative flex h-screen bg-[#070A12] text-slate-100 overflow-hidden font-sans">
      {/* Background Ambient Orbs */}
      <div className="ambient-orb-1" />
      <div className="ambient-orb-2" />
      <div className="ambient-orb-3" />

      {/* Sidebar */}
      <aside className="relative z-20 w-64 glass-sidebar flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse-glow">
                <Sparkles size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-gradient-indigo tracking-wider">
                  JEB KHARCH
                </h1>
                <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">Pro Admin Control</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Core Management</p>
              <div className="space-y-1">
                {coreNav.map(item => <NavLink key={item.path} item={item} />)}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Gamification</p>
              <div className="space-y-1">
                {gamificationNav.map(item => <NavLink key={item.path} item={item} />)}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">System & Broadcast</p>
              <div className="space-y-1">
                {toolsNav.map(item => <NavLink key={item.path} item={item} />)}
              </div>
            </div>
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-white/5 bg-slate-950/40 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
                  A
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Super Admin</p>
                <p className="text-[10px] text-slate-400">admin@jebkharch.pk</p>
              </div>
            </div>
            <button className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 glass-header px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">{getPageTitle()}</h2>
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>System Live • API v1.0</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Global Search Bar */}
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search users, transactions..."
                className="w-full glass-input text-xs pl-9 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Notifications Button */}
            <button className="relative p-2 rounded-xl glass-button-secondary text-slate-300 hover:text-white">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
            </button>

            {/* Activity Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-white/5 text-xs text-slate-300">
              <Activity size={14} className="text-cyan-400 animate-pulse" />
              <span className="font-mono">99.9% Uptime</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/withdrawals" element={<Withdrawals />} />
            <Route path="/content" element={<ContentModeration />} />
            <Route path="/fraud" element={<FraudAlerts />} />
            <Route path="/missions" element={<MissionsAdmin />} />
            <Route path="/teams" element={<TeamsAdmin />} />
            <Route path="/seasons" element={<SeasonsAdmin />} />
            <Route path="/notifications" element={<NotificationsAdmin />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
