import React from 'react';
import { Download, Zap, Wallet, Trophy } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'App Download Karein',
      desc: 'Free APK download karein aur apne mobile number ke zariye sirf 10 seconds me OTP se sign up karein.',
      icon: Download,
      accent: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    },
    {
      step: '02',
      title: 'Daily Challenge & Quiz Khele',
      desc: 'Rozana 2× Daily Challenge active karein ya apni pasandeeda category (Cricket, GK, History) me sawalat ke jawab dein.',
      icon: Zap,
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      step: '03',
      title: 'Coins & Cash Points Jama Karein',
      desc: 'Har sahi jawab par coins kamaain. City Squads me contribute karke weekly leaderboards me top rank hasil karein.',
      icon: Trophy,
      accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      step: '04',
      title: 'Instant Cashout Hasil Karein',
      desc: 'Apne EasyPaisa ya JazzCash number par foran raqam transfer karein. Safe, quick, aur guaranteed.',
      icon: Wallet,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-brand-500/30 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
              Simple 4-Step Process
            </span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Kaise Shuru Karein? <br />
            <span className="text-gradient-emerald">Chand Minute Ka Khel</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Koi mushkil process nahi. Har koi asaani se khel sakta hai aur rozana jeet sakta hai.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-3xl p-6 glass-card border border-white/10 hover:border-brand-500/40 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display font-black text-3xl text-slate-700/80">
                    {item.step}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
