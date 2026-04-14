'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WalletGate } from '@/components/wallet/WalletGate';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WalletGate requireRegistration>
          <DashboardContent />
        </WalletGate>
      </main>
      <Footer />
    </div>
  );
}
