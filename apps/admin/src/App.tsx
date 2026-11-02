import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Users, LayoutDashboard, Database, ShieldAlert, CreditCard,
  Target, Trophy, Bell, Shield, Search, Activity, Sparkles, LogOut, ChevronRight,
  Menu, X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

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

  const NavLink = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClick}
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

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Logo Brand Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse-glow shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-gradient-indigo tracking-wider">
                JEB KHARCH
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 tracking-widest uppercase font-semibold">Pro Admin Control</p>
            </div>
          </div>

          {onNavigate && (
            <button
              onClick={onNavigate}
              aria-label="Close sidebar"
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(100dvh-150px)] touch-scroll">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Core Management</p>
            <div className="space-y-1">
              {coreNav.map(item => <NavLink key={item.path} item={item} onClick={onNavigate} />)}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Gamification</p>
            <div className="space-y-1">
              {gamificationNav.map(item => <NavLink key={item.path} item={item} onClick={onNavigate} />)}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">System & Broadcast</p>
            <div className="space-y-1">
              {toolsNav.map(item => <NavLink key={item.path} item={item} onClick={onNavigate} />)}
            </div>
          </div>
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-3.5 sm:p-4 border-t border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-slate-950 text-xs sm:text-sm shadow-md">
                A
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            </div>
            <div className="min-w-0 truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">Super Admin</p>
              <p className="text-[10px] text-slate-400 truncate">admin@jebkharch.pk</p>
            </div>
          </div>
          <button
            title="Sign out"
            aria-label="Sign out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex h-[100dvh] bg-[#070A12] text-slate-100 overflow-hidden font-sans">
      {/* Background Ambient Orbs */}
      <div className="ambient-orb-1 opacity-70 sm:opacity-100" />
      <div className="ambient-orb-2 opacity-70 sm:opacity-100" />
      <div className="ambient-orb-3 opacity-60 sm:opacity-100 hidden sm:block" />

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close Navigation Backdrop"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-fade-in"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] glass-sidebar flex flex-col justify-between transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="relative z-20 hidden lg:flex w-64 xl:w-72 glass-sidebar flex-col justify-between shrink-0">
        <SidebarContent />
      </aside>

      {/* Main App Container */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 sm:h-16 glass-header px-3.5 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
            {/* Hamburger Button for Mobile & Tablet */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="p-2 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 lg:hidden shrink-0 transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0 truncate">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-100 tracking-tight truncate">
                {getPageTitle()}
              </h2>
            </div>

            <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Live • v1.0</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 rounded-xl glass-button-secondary text-slate-300 hover:text-white"
              aria-label="Search"
            >
              <Search size={16} />
            </button>

            {/* Desktop Global Search Bar */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search portal..."
                className="w-full glass-input text-xs pl-9 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Notifications Button */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl glass-button-secondary text-slate-300 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            </Link>

            {/* Activity Indicator (Desktop / Tablet) */}
            <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-800/50 border border-white/5 text-xs text-slate-300">
              <Activity size={13} className="text-cyan-400 animate-pulse" />
              <span className="font-mono text-[11px]">99.9% Up</span>
            </div>
          </div>
        </header>

        {/* Mobile Expandable Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden glass-header px-3.5 py-2.5 border-b border-white/10 animate-fade-in">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                autoFocus
                placeholder="Search users, transactions..."
                className="w-full glass-input text-xs pl-9 pr-8 py-2 rounded-xl"
              />
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Content Area with dynamic touch-friendly responsive scrolling */}
        <main className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 lg:p-8 pb-24 lg:pb-8 animate-fade-in touch-scroll">
          <div className="max-w-7xl mx-auto">
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
          </div>
        </main>

        {/* Bottom Mobile Navigation Bar for One-Thumb Ergonomics */}
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass-header border-t border-white/10 px-2 py-1.5 flex items-center justify-around backdrop-blur-xl bg-slate-950/85"
        >
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              location.pathname === '/' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[10px] font-semibold mt-0.5">Overview</span>
          </Link>

          <Link
            to="/users"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              location.pathname === '/users' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={18} />
            <span className="text-[10px] font-semibold mt-0.5">Users</span>
          </Link>

          <Link
            to="/withdrawals"
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              location.pathname === '/withdrawals' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard size={18} />
            <span className="text-[10px] font-semibold mt-0.5">Payouts</span>
            <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </Link>

          <Link
            to="/fraud"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              location.pathname === '/fraud' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert size={18} />
            <span className="text-[10px] font-semibold mt-0.5">Fraud</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Menu size={18} />
            <span className="text-[10px] font-semibold mt-0.5">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
