import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#050811] border-t border-white/10 pt-16 pb-12 overflow-hidden text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-5">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 p-[2px]">
                <div className="w-full h-full rounded-[14px] bg-[#0A1224] flex items-center justify-center overflow-hidden">
                  <img src="/app-icon.png" alt="JebKharch Logo" className="w-9 h-9 object-contain" />
                </div>
              </div>
              <span className="font-display font-extrabold text-2xl text-white">
                Jeb<span className="text-brand-400">Kharch</span>
              </span>
            </Link>

            <p className="mt-4 text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Pakistan's trusted trivia and competitive gaming platform. Play quiz battles, represent verified city clans, and cash out real PKR to EasyPaisa and JazzCash.
            </p>

            <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white font-semibold">
                🇵🇰 Proudly Made for Pakistan
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">
              Explore Game
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#features" className="hover:text-brand-400 transition-colors">
                  Daily 2× Challenge
                </a>
              </li>
              <li>
                <a href="#squads" className="hover:text-brand-400 transition-colors">
                  Verified City Squads
                </a>
              </li>
              <li>
                <a href="#rewards" className="hover:text-brand-400 transition-colors">
                  EasyPaisa & JazzCash Withdrawals
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-brand-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-brand-400 transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Policy */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <a
                  href="/privacy-policy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-200 transition-colors flex items-center gap-1"
                >
                  <span>Raw Privacy HTML</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link to="/terms" className="hover:text-slate-200 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Google Play Compliant</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">
              Help & Support
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:support@jaibkharch.com" className="hover:text-white transition-colors truncate">
                  support@jaibkharch.com
                </a>
              </li>
              <li className="text-xs text-slate-500">
                Response time: Within 2 hours
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} JebKharch (JaibKharch PK). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <a href="https://admin.jaibkharch.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
              Admin Portal
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
