import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Wallet, 
  Trophy, 
  Flame, 
  Sparkles,
  Smartphone
} from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      badge: 'DOUBLE REWARDS',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      title: '⚡ 2× Daily Challenge Coins',
      description:
        'Har din naya challenge! Complete the 10-question sprint with high accuracy and get your coin payout doubled instantly. Har roz kamaane ka sunahri mauka.',
      icon: Zap,
      glow: 'group-hover:border-amber-500/40',
      accent: 'from-amber-500/20 to-orange-500/5',
    },
    {
      badge: 'NEW CITY CLANS',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      title: '⚔️ Verified City Squads',
      description:
        'Apne shehar ka naam roshan karein! Join officially verified squads like Lahore Champions, Karachi Kings, and Islamabad United with exclusive verified badges.',
      icon: ShieldCheck,
      glow: 'group-hover:border-sky-500/40',
      accent: 'from-sky-500/20 to-blue-500/5',
    },
    {
      badge: 'INSTANT CASHOUT',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: '📲 EasyPaisa & JazzCash Payouts',
      description:
        'Coins jama karein aur direct PKR cash apne mobile wallet me transfer karein. No unnecessary delays, completely transparent and secure.',
      icon: Wallet,
      glow: 'group-hover:border-brand-500/40',
      accent: 'from-emerald-500/20 to-brand-500/5',
    },
    {
      badge: 'COMPETITIVE GAMING',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      title: '🏆 Weekly Leaderboard Jackpots',
      description:
        'Top 10 players win big every Sunday night. Climb from Bronze to Grandmaster leagues and unlock special multiplier perks.',
      icon: Trophy,
      glow: 'group-hover:border-purple-500/40',
      accent: 'from-purple-500/20 to-pink-500/5',
    },
    {
      badge: 'INTERESTING TOPICS',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      title: '🎯 Pakistan & World Trivia Categories',
      description:
        'Cricket (PSL, World Cups), Islamic History, General Knowledge, Pakistan Geography, Urdu Literature, Science & Current Affairs.',
      icon: Flame,
      glow: 'group-hover:border-rose-500/40',
      accent: 'from-rose-500/20 to-red-500/5',
    },
    {
      badge: '100% FAIR PLAY',
      badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      title: '🛡️ Anti-Cheat & Fast OTP Login',
      description:
        'Zero bots allowed. Powered by real-time randomized question banks and device-level anti-fraud verification for a clean gaming experience.',
      icon: Smartphone,
      glow: 'group-hover:border-teal-500/40',
      accent: 'from-teal-500/20 to-emerald-500/5',
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-brand-500/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
              Why Pakistan Loves JebKharch
            </span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Gaming Aur Earning Ka <br />
            <span className="text-gradient-emerald">Behtareen Sangam</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            JebKharch sirf ek quiz app nahi, ek competitive gaming platform hai jahan har sawal ka sahi jawab aapko real cash rewards deta hai.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`group relative rounded-3xl p-7 glass-card transition-all duration-300 border border-white/10 hover:-translate-y-1 ${feat.glow}`}
              >
                {/* Subtle gradient hover highlight */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feat.accent} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Top row: badge + icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-[10px] font-extrabold tracking-wider px-2.5 py-1 rounded-full border ${feat.badgeColor}`}>
                        {feat.badge}
                      </span>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-500/10 transition-all duration-300">
                        <Icon className="w-6 h-6 text-brand-400" />
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-xl text-white group-hover:text-brand-300 transition-colors">
                      {feat.title}
                    </h3>

                    <p className="mt-3 text-sm text-slate-300 leading-relaxed font-normal">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs font-semibold text-brand-400 group-hover:translate-x-1 transition-transform">
                    <span>Learn how it works</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
