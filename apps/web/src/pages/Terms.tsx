import React, { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 relative overflow-x-hidden">
      <Navbar />

      <main className="pt-32 pb-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 mb-10 shadow-2xl">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                  Terms of Service
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Effective Date: November 2026 • JebKharch PK
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Welcome to JebKharch. By creating an account or accessing the mobile app and website, you agree to comply with the terms below.
            </p>
          </div>

          <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
            <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="font-display font-bold text-lg text-white mb-3">1. Eligibility</h2>
              <p>
                JebKharch is available to residents of Pakistan holding a valid Pakistani mobile number (Jazz, Telenor, Zong, Ufone) capable of receiving SMS OTP authentication codes.
              </p>
            </section>

            <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="font-display font-bold text-lg text-white mb-3">2. Fair Play & Anti-Cheating</h2>
              <p className="mb-2">
                We maintain zero tolerance toward cheating. The following actions result in immediate, permanent account ban and forfeiture of coins:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400 text-sm">
                <li>Using automated scripts, bots, or emulators to answer trivia questions.</li>
                <li>Creating multiple fake accounts to exploit referral or daily challenge bonuses.</li>
                <li>Attempting to reverse-engineer API communication or manipulate server scores.</li>
              </ul>
            </section>

            <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="font-display font-bold text-lg text-white mb-3">3. Coin Rewards & Cashout Policy</h2>
              <p className="mb-2">
                In-game coins are awarded for successful trivia gameplay and daily challenges. Coins can be converted and withdrawn to registered EasyPaisa or JazzCash accounts subject to minimum threshold guidelines (minimum ₨ 100).
              </p>
              <p className="text-slate-400 text-sm">
                Withdrawals are reviewed by our automated verification system to safeguard against fraudulent transactions.
              </p>
            </section>

            <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="font-display font-bold text-lg text-white mb-3">4. Intellectual Property</h2>
              <p>
                All trademarks, logos, game designs, question sets, and graphics are the exclusive property of JebKharch.
              </p>
            </section>

            <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <h2 className="font-display font-bold text-lg text-white mb-3">5. Contact</h2>
              <p>
                For legal inquiries or dispute resolutions, please write to{' '}
                <a href="mailto:support@jaibkharch.com" className="text-brand-400 font-bold hover:underline">
                  support@jaibkharch.com
                </a>.
              </p>
            </section>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
