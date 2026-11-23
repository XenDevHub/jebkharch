import React from 'react';
import { Wallet, ArrowRight, Zap, Check, Clock } from 'lucide-react';

export const RewardsSection: React.FC = () => {
  return (
    <section id="rewards" className="py-24 relative overflow-hidden">
      {/* Glows */}
      <div className="mesh-glow-bg w-[500px] h-[500px] bg-emerald-500/10 top-1/3 -right-20" />
      <div className="mesh-glow-bg w-[450px] h-[450px] bg-amber-500/10 -bottom-20 left-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: EasyPaisa & JazzCash Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md relative">
              
              {/* Back Card: JazzCash glow */}
              <div className="absolute -top-4 -left-4 w-full h-full rounded-3xl bg-gradient-to-tr from-amber-600/30 to-red-600/20 border border-amber-500/20 blur-sm pointer-events-none" />

              {/* Front Card: Glassmorphic Wallet Dashboard */}
              <div className="relative rounded-3xl p-7 sm:p-8 glass-panel border border-white/15 shadow-2xl">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 p-0.5 shadow-lg shadow-brand-500/30">
                      <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-brand-400" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Player Balance
                      </div>
                      <div className="text-2xl font-display font-extrabold text-white flex items-center gap-2">
                        <span>₨ 2,450.00</span>
                        <span className="text-xs font-bold text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded-full border border-brand-500/20">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-amber-400 font-bold">🟡 24,500 Coins</span>
                  </div>
                </div>

                {/* Instant Withdrawal Channels */}
                <div className="mt-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Supported Instant Payment Methods
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* EasyPaisa Box */}
                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-sm text-emerald-300">EasyPaisa</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <div className="text-[11px] text-slate-400">Direct to Mobile No.</div>
                      <div className="mt-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 2-5 Mins Payout
                      </div>
                    </div>

                    {/* JazzCash Box */}
                    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-sm text-amber-300">JazzCash</span>
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      </div>
                      <div className="text-[11px] text-slate-400">Direct to Mobile No.</div>
                      <div className="mt-2 text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 2-5 Mins Payout
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Cashout Transaction Proof */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-300">Recent Disbursed Payouts</span>
                    <span className="text-slate-500 text-[11px]">Live Network Status</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                          EP
                        </span>
                        <div>
                          <div className="font-semibold text-white">0302-****194</div>
                          <div className="text-[10px] text-slate-400">EasyPaisa • Successful</div>
                        </div>
                      </div>
                      <span className="font-extrabold text-emerald-400">+₨ 500.00</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                          JC
                        </span>
                        <div>
                          <div className="font-semibold text-white">0333-****821</div>
                          <div className="text-[10px] text-slate-400">JazzCash • Successful</div>
                        </div>
                      </div>
                      <span className="font-extrabold text-emerald-400">+₨ 1,200.00</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Copy & Benefits */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-emerald-500/30 mb-4">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                Transparent & Guaranteed Cashouts
              </span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Aapki Mehnat Ka Fal, <br />
              <span className="text-gradient-emerald">Seedha Aapke Pocket Me</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Bina kisi jhanjhat ke apne jeete hue coins ko real Pakistani Rupee (PKR) me convert karein. 
              Hamara automated payout system 24/7 active rehta hai taake aapki kamayi bila rukawat aap tak pohnche.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5 border border-brand-500/30">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Lowest Minimum Withdrawal</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sirf ₨ 100 se withdraw shuru karein. Koi high threshold ya mushkil sharaait nahi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5 border border-brand-500/30">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Zero Hidden Charges</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Jo raqam aap request karte hain, wahi poori aapke account me credit hoti hai.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5 border border-brand-500/30">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">100% Safe & PTA/Local Compliant</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pakistani banking channels aur verified mobile financial services ke zariye processing.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/jaibkharch.apk"
                download="jaibkharch.apk"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-brand-400 hover:bg-brand-300 shadow-lg shadow-brand-500/20 transition-all"
              >
                <span>Start Earning Today</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
