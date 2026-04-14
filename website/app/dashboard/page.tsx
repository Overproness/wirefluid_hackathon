"use client";

import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { WalletGate } from "@/components/wallet/WalletGate";

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
