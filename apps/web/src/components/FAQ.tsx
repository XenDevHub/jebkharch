import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Kya JebKharch app bilkul free hai?',
      a: 'Jee haan! JebKharch 100% free app hai. Kisi bhi user se koi registration fees ya entry fees nahi li jaati. Aap baghair kisi kharche ke app download kar ke quiz khel sakte hain aur real cash rewards jeet sakte hain.',
    },
    {
      q: 'Daily Challenge me 2× Coins kaise milte hain?',
      a: 'Rozana app me ek 10-sawalat ka Daily Challenge milta hai. Agar aap us challenge ko complete karte hain toh us session ke base coins par automated 2× multiplier lagta hai, jis se aapki rozana ki earning double ho jaati hai.',
    },
    {
      q: 'EasyPaisa ya JazzCash me minimum kitna withdraw kar sakte hain?',
      a: 'Minimum withdrawal limit sirf ₨ 100 hai. Jaise hi aapke wallet me required coins jama hotay hain, aap Wallet screen me ja kar apna EasyPaisa ya JazzCash number daal kar foran withdrawal request submit kar sakte hain.',
    },
    {
      q: 'City Squads me Verified Badge kaise milta hai?',
      a: 'Har shehar ke authentic squads (jaise Lahore Champions, Karachi Kings, Islamabad United) ko administrative review ke baad official verified badge (✓ Official) diya jaata hai. Verified squads weekly city championship tournaments me participate kar sakte hain.',
    },
    {
      q: 'Kya mera mobile number aur data mehfooz hai?',
      a: 'Aapka data 100% encrypted aur safe hai. Hum aapka phone number sirf OTP verification aur payment disbursement ke liye istemal karte hain. Hamari strict Privacy Policy ke tehat kisi bhi 3rd-party ko aapka personal data sell ya share nahi kiya jaata.',
    },
    {
      q: 'Agar withdrawal me koi masla aaye toh support se kaise contact karein?',
      a: 'Aap direct app ke andar Help section se ya hamari official support email support@jaibkharch.com par 24/7 contact kar sakte hain. Hamari team 2 ghante ke andar response faraham karti hai.',
    },
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-brand-500/30 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
              Got Questions?
            </span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Aksar Pooche Jane Wale <br />
            <span className="text-gradient-emerald">Sawal Aur Jawabat</span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            JebKharch ke mutaliq tamaam bunyadi maloomat yahan daryaft karein.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-base sm:text-lg text-white">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-brand-500/20 text-brand-400' : 'text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
