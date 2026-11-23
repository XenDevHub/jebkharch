import React from 'react';
import { Download, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';

export const DownloadCTA: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="mesh-glow-bg w-[650px] h-[650px] bg-brand-500/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl sm:rounded-4xl p-8 sm:p-12 lg:p-16 glass-panel border border-brand-500/30 overflow-hidden shadow-2xl">
          
          {/* Subtle diagonal background sheen */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-emerald-600/5 to-teal-500/10 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: CTA Pitch */}
            <div className="lg:col-span-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-brand-500/30 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                  Ready to Win Real Cash?
                </span>
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                Abhi JebKharch Download Karein <br />
                <span className="text-gradient-emerald">Aur Khelna Shuru Karein!</span>
              </h2>

              <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl font-normal">
                Join 50,000+ players across Pakistan. Play your first quiz in seconds and claim your daily welcome bonuses.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="/jaibkharch.apk"
                  download="jaibkharch.apk"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-extrabold text-base text-slate-950 bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-400 hover:from-brand-300 hover:to-teal-300 shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <Download className="w-5 h-5 text-slate-950" />
                  <span>Download APK (v1.0.4 - 38MB)</span>
                </a>

                <div className="text-xs text-slate-400 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>100% Virus-Free & Secure</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-400" /> Instant OTP Login
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-400" /> EasyPaisa & JazzCash Ready
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-400" /> Compatible with Android 8.0+
                </span>
              </div>
            </div>

            {/* Right Column: Scan to download QR mockup */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="glass-card p-6 rounded-3xl border border-white/10 text-center max-w-[260px] shadow-2xl">
                <div className="w-44 h-44 mx-auto rounded-2xl bg-white p-3 flex items-center justify-center shadow-lg">
                  {/* Stylized QR Code image representation pointing to APK */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://jaibkharch.com/jaibkharch.apk&color=050811`}
                    alt="Scan to Download JebKharch APK"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-4 font-bold text-xs text-white">
                  📱 Mobile Se Scan Karein
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Direct phone me APK download ho jayegi
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
