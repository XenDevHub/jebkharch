import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { StatsBar } from '@/components/StatsBar';
import { Features } from '@/components/Features';
import { CitySquadsShowcase } from '@/components/CitySquadsShowcase';
import { RewardsSection } from '@/components/RewardsSection';
import { HowItWorks } from '@/components/HowItWorks';
import { FAQ } from '@/components/FAQ';
import { DownloadCTA } from '@/components/DownloadCTA';
import { Footer } from '@/components/Footer';

export const Home: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#070B14] text-slate-100 overflow-x-hidden">
      <Navbar />
      
      <main>
        <Hero />
        <StatsBar />
        <Features />
        <CitySquadsShowcase />
        <RewardsSection />
        <HowItWorks />
        <FAQ />
        <DownloadCTA />
      </main>

      <Footer />
    </div>
  );
};
