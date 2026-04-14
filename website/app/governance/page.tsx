'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProposalsList } from '@/components/governance/ProposalsList';
import { CreateProposalModal } from '@/components/governance/CreateProposalModal';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { WalletGate } from '@/components/wallet/WalletGate';
import { Plus } from 'lucide-react';

export default function GovernancePage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-[#dce1fb] uppercase">
              DAO Governance
            </h1>
            <p className="text-[#bbcabf] mt-2">
              Vote on MVP awards, fan polls, and charitable initiatives. Tier-weighted voting powered by on-chain XP.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="primary-gradient text-white hidden sm:inline-flex"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Proposal
          </Button>
        </div>

        <ProposalsList />

        {/* Mobile create button */}
        <Button
          onClick={() => setCreateOpen(true)}
          className="primary-gradient text-white fixed bottom-6 right-6 rounded-full h-14 w-14 p-0 shadow-lg sm:hidden z-50"
        >
          <Plus className="h-6 w-6" />
        </Button>

        <CreateProposalModal open={createOpen} onClose={() => setCreateOpen(false)} />
      </main>
      <Footer />
    </div>
  );
}
