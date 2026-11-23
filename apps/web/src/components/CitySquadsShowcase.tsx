import React from 'react';
import { Users, Flame, CheckCircle, ArrowRight } from 'lucide-react';

export const CitySquadsShowcase: React.FC = () => {
  const verifiedSquads = [
    {
      name: 'Lahore Champions',
      city: 'Lahore, Punjab',
      badge: '✓ Official Squad',
      verified: true,
      members: '1,420 members',
      score: '842,500 XP',
      rank: '#1 in Pakistan',
      icon: '🏰',
      color: 'border-brand-500/30 group-hover:border-brand-500/60',
      bannerBg: 'from-emerald-600/30 via-brand-500/10 to-transparent',
    },
    {
      name: 'Karachi Kings',
      city: 'Karachi, Sindh',
      badge: '✓ Official Squad',
      verified: true,
      members: '1,280 members',
      score: '789,100 XP',
      rank: '#2 in Pakistan',
      icon: '🌊',
      color: 'border-blue-500/30 group-hover:border-blue-500/60',
      bannerBg: 'from-blue-600/30 via-sky-500/10 to-transparent',
    },
    {
      name: 'Islamabad United',
      city: 'Islamabad Capital',
      badge: '✓ Official Squad',
      verified: true,
      members: '980 members',
      score: '695,400 XP',
      rank: '#3 in Pakistan',
      icon: '🦁',
      color: 'border-red-500/30 group-hover:border-red-500/60',
      bannerBg: 'from-red-600/30 via-orange-500/10 to-transparent',
    },
    {
      name: 'Lahore Legends',
      city: 'Lahore Division',
      badge: '✓ Official Squad',
      verified: true,
      members: '750 members',
      score: '530,200 XP',
      rank: '#4 in Pakistan',
      icon: '⚡',
      color: 'border-amber-500/30 group-hover:border-amber-500/60',
      bannerBg: 'from-amber-600/30 via-yellow-500/10 to-transparent',
    },
  ];

  return (
    <section id="squads" className="py-24 relative overflow-hidden bg-slate-950/40">
      {/* Background ambient lighting */}
      <div className="mesh-glow-bg w-[500px] h-[500px] bg-sky-500/10 top-1/2 -left-32 -translate-y-1/2" />
      <div className="mesh-glow-bg w-[400px] h-[400px] bg-brand-500/10 bottom-0 right-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-sky-500/30 mb-4">
              <span className="text-sky-400 font-bold text-xs uppercase tracking-wider">
                🛡️ Verified City Clans
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 text-xs">Official Squad System</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Apne Shehar Ki Squad Ko <br />
              <span className="text-gradient-emerald">Champion Banao!</span>
            </h2>
            <p className="mt-4 text-slate-300 text-base max-w-xl">
              Ab JebKharch par officially verified city squads maujood hain. 
              Top players ke sath mil kar clan battles jeetain aur weekly squad prize pools earn karein.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 max-w-sm">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <div className="text-xs font-bold text-white">
                Admin Verified Badge Guarantee
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Only authentic, active city squads receive the sky-blue verification badge to ensure genuine competitive gaming.
            </p>
          </div>
        </div>

        {/* Squad Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {verifiedSquads.map((squad, idx) => (
            <div
              key={idx}
              className={`group relative rounded-3xl p-6 glass-card border transition-all duration-300 hover:-translate-y-2 ${squad.color}`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${squad.bannerBg} opacity-40 pointer-events-none`} />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  {/* Top Rank Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-white/10 text-white backdrop-blur-md">
                      {squad.rank}
                    </span>
                    <span className="text-3xl">{squad.icon}</span>
                  </div>

                  {/* Squad Name & Verified Badge */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-display font-bold text-lg text-white">
                      {squad.name}
                    </h3>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 fill-sky-400 text-slate-950" />
                      <span>{squad.badge}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">{squad.city}</span>
                  </div>

                  {/* Stats list */}
                  <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> Members
                      </span>
                      <span className="font-semibold text-slate-200">{squad.members}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> Total Squad XP
                      </span>
                      <span className="font-bold text-amber-400">{squad.score}</span>
                    </div>
                  </div>
                </div>

                {/* Join CTA inside card */}
                <div className="mt-6">
                  <a
                    href="/jaibkharch.apk"
                    download="jaibkharch.apk"
                    className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Join in App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
