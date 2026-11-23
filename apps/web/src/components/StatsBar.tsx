import React from 'react';
import { Users, Coins, Trophy, Star } from 'lucide-react';

export const StatsBar: React.FC = () => {
  const stats = [
    {
      icon: Users,
      value: '50,000+',
      label: 'Active Pakistani Players',
      sub: 'Lahore, Karachi, Islamabad & more',
      color: 'text-brand-400',
      bg: 'bg-brand-500/10',
    },
    {
      icon: Coins,
      value: '₨ 2.5M+',
      label: 'Cash Prizes Distributed',
      sub: 'Via EasyPaisa & JazzCash',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Trophy,
      value: '250,000+',
      label: 'Daily Quiz Battles',
      sub: '2× Multiplier Challenges Won',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
    },
    {
      icon: Star,
      value: '4.8 / 5.0',
      label: 'Player Rating',
      sub: 'Across 12,000+ reviews',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <section className="relative z-10 -mt-6 sm:-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center border border-white/5`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <span className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
                      {stat.value}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-200">
                    {stat.label}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    {stat.sub}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
