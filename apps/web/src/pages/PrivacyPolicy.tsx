import React, { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 relative overflow-x-hidden">
      <Navbar />

      <main className="pt-32 pb-24 relative z-10">
        
        {/* Ambient Glows */}
        <div className="mesh-glow-bg w-[500px] h-[500px] bg-emerald-500/10 top-20 left-10" />
        <div className="mesh-glow-bg w-[400px] h-[400px] bg-brand-500/10 top-96 right-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back link */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Header Card */}
          <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 mb-10 shadow-2xl">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                  Privacy Policy
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Last Updated: November 23, 2026 • Version 1.2
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-sm text-brand-300 leading-relaxed">
              <strong>JebKharch (JaibKharch)</strong> is committed to protecting your privacy. This document outlines what data we collect, how it is secured, and your rights as a player on our mobile gaming platform.
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
            
            {/* Section 1 */}
            <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-brand-400 text-sm font-black">
                  1
                </span>
                <span>Information We Collect</span>
              </h2>

              <p className="mb-4">
                When you download, register, and play on the JebKharch platform, we collect minimal data required to deliver authentic trivia gaming and payout processing:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <strong className="text-white">A. Phone Number:</strong>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Used exclusively for passwordless authentication via One-Time Password (OTP) verification and account security.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <strong className="text-white">B. Financial & Payout Information:</strong>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    When you request a reward disbursement, you provide your EasyPaisa or JazzCash account mobile number. We store this strictly to execute transactions and keep payment records for anti-fraud auditing.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <strong className="text-white">C. Gameplay Activity:</strong>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Questions answered, session accuracy, coins rewarded, city squad affiliations (e.g. Lahore Champions, Karachi Kings), and leaderboard ratings.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <strong className="text-white">D. Device & Anti-Cheat Telemetry:</strong>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Device model, Android OS version, and network identifiers. These are collected to prevent bot manipulation, automated answering scripts, and multi-account abuse.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-brand-400 text-sm font-black">
                  2
                </span>
                <span>Advertising & Google AdMob</span>
              </h2>

              <p className="mb-3">
                JebKharch is free to play and monetized through trusted third-party mobile advertising, specifically <strong>Google AdMob</strong>.
              </p>
              <p className="text-slate-400 text-sm mb-3">
                Google AdMob may collect and process device advertising identifiers (Google Advertising ID / GAID) to serve personalized or non-personalized advertisements, track ad performance, and combat click fraud in compliance with Google Play Developer Policies.
              </p>
              <p className="text-slate-400 text-sm">
                You can manage, reset, or opt out of personalized advertising ID tracking at any time directly through your phone settings:
                <br />
                <code className="text-brand-300 text-xs px-2 py-1 rounded bg-black/40 mt-1 inline-block">
                  Settings &gt; Google &gt; Ads &gt; Delete or Reset Advertising ID
                </code>
              </p>
            </section>

            {/* Section 3 */}
            <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-brand-400 text-sm font-black">
                  3
                </span>
                <span>How We Use Your Data</span>
              </h2>

              <ul className="space-y-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-brand-400 shrink-0 mt-1" />
                  <span>To authenticate and protect your gaming account using secure SMS OTPs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-brand-400 shrink-0 mt-1" />
                  <span>To calculate real-time quiz results, 2× daily multipliers, and city squad ranks.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-brand-400 shrink-0 mt-1" />
                  <span>To disburse cash prize rewards straight to your designated JazzCash or EasyPaisa wallet.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-brand-400 shrink-0 mt-1" />
                  <span>To detect and eliminate cheat engines, rooted bot exploits, and fraudulent duplicate registrations.</span>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-brand-400 text-sm font-black">
                  4
                </span>
                <span>Data Sharing & Third Parties</span>
              </h2>

              <p className="mb-3">
                <strong>We do not sell, barter, or rent your personal information to any third parties for marketing purposes.</strong>
              </p>
              <p className="text-slate-400 text-sm">
                Data is shared strictly with infrastructure service providers required to operate the app:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400 text-sm">
                <li><strong>Telecom & SMS Gateway Providers:</strong> To dispatch OTP codes to Pakistani networks (Jazz, Telenor, Zong, Ufone).</li>
                <li><strong>Mobile Wallet Providers:</strong> For processing payouts to verified EasyPaisa and JazzCash accounts.</li>
                <li><strong>Cloud Infrastructure:</strong> Encrypted backend databases and Redis caching servers.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-brand-400 text-sm font-black">
                  5
                </span>
                <span>User Rights & Account Deletion</span>
              </h2>

              <p className="mb-3">
                Under applicable digital privacy laws and Google Play requirements, you have full ownership of your data:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300 mb-4">
                <li>You may request a copy of the personal information stored in your account.</li>
                <li>You may request permanent deletion of your phone number, gameplay scores, and withdrawal logs.</li>
              </ul>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-white text-sm">Request Account & Data Deletion</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Email us with your registered phone number.
                  </div>
                </div>
                <a
                  href="mailto:support@jaibkharch.com?subject=Account%20Deletion%20Request"
                  className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-colors"
                >
                  Request Deletion
                </a>
              </div>
            </section>

            {/* Section 6 */}
            <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-brand-400 text-sm font-black">
                  6
                </span>
                <span>Contacting Us</span>
              </h2>

              <p className="text-slate-300 mb-4">
                If you have any questions or feedback regarding our privacy practices, our dedicated compliance team is ready to assist:
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex-1">
                  <div className="text-xs text-slate-400">Support Email</div>
                  <div className="text-sm font-bold text-white mt-1">support@jaibkharch.com</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex-1">
                  <div className="text-xs text-slate-400">Location</div>
                  <div className="text-sm font-bold text-white mt-1">Lahore, Pakistan</div>
                </div>
              </div>
            </section>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
