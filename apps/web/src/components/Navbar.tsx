import React, { useState, useEffect } from 'react';
import { Download, Menu, X, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070B14]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-[2px] shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
              <div className="w-full h-full rounded-[14px] bg-[#0A1224] flex items-center justify-center overflow-hidden">
                <img
                  src="/app-icon.png"
                  alt="JebKharch Logo"
                  className="w-10 h-10 object-contain transform group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-400 rounded-full border-2 border-[#070B14] animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-400 rounded-full border-2 border-[#070B14]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                Jeb<span className="text-brand-400">Kharch</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                PK
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium tracking-wide">
              Khelain, Jeetain, Kamaain
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 glass-pill px-4 py-1.5 rounded-full border border-white/10">
          {isHomePage ? (
            <>
              <a
                href="#features"
                className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full transition-colors hover:bg-white/5"
              >
                Features
              </a>
              <a
                href="#squads"
                className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full transition-colors hover:bg-white/5 flex items-center gap-1.5"
              >
                <span>City Squads</span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              </a>
              <a
                href="#rewards"
                className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full transition-colors hover:bg-white/5"
              >
                Rewards & Payouts
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full transition-colors hover:bg-white/5"
              >
                How It Works
              </a>
              <a
                href="#faq"
                className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full transition-colors hover:bg-white/5"
              >
                FAQ
              </a>
            </>
          ) : (
            <Link
              to="/"
              className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full transition-colors hover:bg-white/5"
            >
              ← Back to Home
            </Link>
          )}

          <Link
            to="/privacy"
            className="text-sm font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-full transition-colors hover:bg-white/5"
          >
            Privacy
          </Link>
        </nav>

        {/* Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="/jaibkharch.apk"
            download="jaibkharch.apk"
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-400 hover:from-brand-300 hover:to-teal-300 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            <span>Download APK</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded bg-black/15 font-bold tracking-tight">
              v1.0.4
            </span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 mx-4 p-5 rounded-2xl bg-[#0B1324]/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col gap-3">
            {isHomePage ? (
              <>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium text-sm"
                >
                  Features & Game Modes
                </a>
                <a
                  href="#squads"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium text-sm flex items-center justify-between"
                >
                  <span>⚔️ Verified City Squads</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-bold">
                    Official
                  </span>
                </a>
                <a
                  href="#rewards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium text-sm"
                >
                  💰 Rewards & Instant Withdrawals
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium text-sm"
                >
                  How It Works
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium text-sm"
                >
                  Frequently Asked Questions
                </a>
              </>
            ) : (
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium text-sm"
              >
                ← Back to Home
              </Link>
            )}

            <div className="h-px bg-white/10 my-1" />

            <Link
              to="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy Policy</span>
            </Link>

            <a
              href="/jaibkharch.apk"
              download="jaibkharch.apk"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-brand-400 to-teal-400 shadow-lg shadow-brand-500/30"
            >
              <Download className="w-4 h-4" />
              <span>Download APK for Android (38 MB)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
