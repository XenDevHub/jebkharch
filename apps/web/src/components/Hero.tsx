import React from 'react';
import { Download, ShieldCheck, Zap, Trophy, Play, CheckCircle2 } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="mesh-glow-bg w-[550px] h-[550px] bg-brand-500/15 -top-32 -left-20 animate-pulse-glow" />
      <div className="mesh-glow-bg w-[600px] h-[600px] bg-blue-600/10 top-40 -right-40" />
      <div className="mesh-glow-bg w-[400px] h-[400px] bg-amber-500/10 bottom-10 left-1/3" />

      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border border-brand-500/30 mb-6 shadow-lg shadow-brand-500/10">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                🇵🇰 Pakistan's #1 Real Cash Trivia App
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 2× Coins Live
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.15]">
              Khelain, Jeetain, <br className="hidden sm:block" />
              Aur <span className="text-gradient-emerald">Rozana Kamaain!</span> 💰
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Apni general knowledge ka faida uthain. Rozana quiz khele, 
              <span className="text-brand-400 font-semibold"> 2× Daily Challenge </span> 
              jeetain, verified city squads me shamil hon aur real cash rewards 
              <span className="text-amber-400 font-semibold"> EasyPaisa & JazzCash </span> 
              me foran withdraw karein.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="/jaibkharch.apk"
                download="jaibkharch.apk"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base text-slate-950 bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-400 hover:from-brand-300 hover:to-teal-300 shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
              >
                <Download className="w-5 h-5 text-slate-950" />
                <div className="text-left">
                  <div className="text-[11px] uppercase tracking-wider text-slate-900/80 leading-none">
                    Direct Download
                  </div>
                  <div className="text-base font-extrabold leading-tight">
                    Download APK (v1.0.4)
                  </div>
                </div>
              </a>

              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm text-slate-200 glass-pill hover:bg-white/10 hover:text-white transition-all duration-300 border border-white/10"
              >
                <Play className="w-4 h-4 text-brand-400 fill-brand-400" />
                <span>Explore Game Features</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-y-3 gap-x-6 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>Google Play Protect Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span>No Ads During Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>₨ 2,500,000+ Rewarded</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive CSS Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center relative">
            
            {/* Ambient Backlight behind Phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-96 bg-brand-500/25 rounded-full blur-[80px] pointer-events-none" />

            {/* Phone Container */}
            <div className="relative w-full max-w-[320px] sm:max-w-[340px] rounded-[48px] p-3.5 bg-gradient-to-b from-slate-700/60 via-slate-900/90 to-slate-950 border-[2px] border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-float">
              
              {/* Phone Speaker & Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-800 rounded-full" />
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full ml-3 border border-slate-700/50" />
              </div>

              {/* Inside Screen Content */}
              <div className="relative rounded-[38px] bg-[#070B16] border border-white/5 overflow-hidden p-4 pt-10 text-white min-h-[580px] flex flex-col justify-between select-none">
                
                {/* App Screen Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-300 p-0.5">
                        <img
                          src="/app-icon.png"
                          alt="Avatar"
                          className="w-full h-full object-cover rounded-[10px]"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white">Ahmed R.</span>
                          <span className="text-[10px] text-brand-400 font-extrabold bg-brand-500/10 px-1 rounded">
                            Lvl 14
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Lahore Champions</span>
                      </div>
                    </div>

                    {/* Coins Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">
                      <span className="text-amber-400 text-xs font-bold">🟡 14,850</span>
                    </div>
                  </div>

                  {/* Daily Challenge 2x Banner */}
                  <div className="mt-3 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-brand-500/20 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-amber-500/30">
                        2×
                      </div>
                      <div>
                        <div className="text-[11px] font-extrabold text-amber-300">
                          DAILY CHALLENGE
                        </div>
                        <div className="text-[9px] text-slate-300">
                          Double coins on 10/10 score!
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-brand-400 bg-brand-500/20 px-2 py-0.5 rounded-full animate-pulse">
                      ACTIVE
                    </span>
                  </div>

                  {/* Active Trivia Card Mockup */}
                  <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                        Cricket & PSL • Q 7/10
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                        ⏱️ 08s
                      </span>
                    </div>

                    {/* Timer progress bar */}
                    <div className="w-full h-1 bg-slate-800 rounded-full mb-3 overflow-hidden">
                      <div className="w-3/4 h-full bg-gradient-to-r from-brand-400 to-amber-400 rounded-full" />
                    </div>

                    <p className="text-xs font-bold text-white leading-snug">
                      HBL PSL 2024 ka final match kis team ne jeeta tha?
                    </p>

                    {/* Options list */}
                    <div className="mt-3 space-y-1.5">
                      <div className="p-2 rounded-xl bg-brand-500/20 border border-brand-500 flex items-center justify-between shadow-sm shadow-brand-500/30">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-brand-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                            A
                          </span>
                          <span className="text-xs font-bold text-white">
                            Islamabad United
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-brand-400">
                          +100 Coins ✓
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 opacity-60">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                          B
                        </span>
                        <span className="text-xs text-slate-300">
                          Multan Sultans
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 opacity-60">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                          C
                        </span>
                        <span className="text-xs text-slate-300">
                          Peshawar Zalmi
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom App Navigation Mockup */}
                <div className="pt-2 border-t border-white/10 flex justify-around text-center text-[10px] text-slate-400">
                  <div className="text-brand-400 font-bold flex flex-col items-center">
                    <span>🏠</span>
                    <span>Home</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span>⚔️</span>
                    <span>Squads</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span>🏆</span>
                    <span>Rank</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span>💳</span>
                    <span>Wallet</span>
                  </div>
                </div>
              </div>

              {/* Floating Pill: Instant Payout */}
              <div className="absolute -bottom-5 -left-6 sm:-left-10 p-3 rounded-2xl glass-panel border border-brand-500/40 shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-float-slow">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>₨ 1,500 Cashout</span>
                    <span className="text-[10px] px-1 rounded bg-brand-500/20 text-brand-300 font-extrabold">
                      Instant
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    EasyPaisa • 2 mins ago
                  </div>
                </div>
              </div>

              {/* Floating Pill: Verified Squad */}
              <div className="absolute -top-4 -right-4 sm:-right-8 p-2.5 rounded-2xl glass-panel border border-sky-500/40 shadow-2xl flex items-center gap-2 backdrop-blur-xl">
                <span className="text-base">🛡️</span>
                <div>
                  <div className="text-[11px] font-extrabold text-white flex items-center gap-1">
                    <span>Lahore Champions</span>
                    <span className="text-[9px] text-sky-400 font-bold">✓ Official</span>
                  </div>
                  <div className="text-[9px] text-slate-400">Rank #1 City Squad</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
