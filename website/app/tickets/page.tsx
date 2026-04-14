"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { MatchesList } from "@/components/tickets/MatchesList";
import { ResaleMarketplace } from "@/components/tickets/ResaleMarketplace";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";

export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-[#dce1fb] uppercase">
            Match Tickets
          </h1>
          <p className="text-[#bbcabf] mt-2">
            Anti-scalp protected NFT tickets. Maximum resale price enforced
            on-chain.
          </p>
        </div>

        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="bg-[#191f31] border-0 mb-6">
            <TabsTrigger
              value="matches"
              className="data-[state=active]:bg-[#10b981]/10 data-[state=active]:text-[#4edea3] text-[#bbcabf]"
            >
              Upcoming Matches
            </TabsTrigger>
            <TabsTrigger
              value="resale"
              className="data-[state=active]:bg-[#10b981]/10 data-[state=active]:text-[#4edea3] text-[#bbcabf]"
            >
              Resale Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <MatchesList />
          </TabsContent>

          <TabsContent value="resale">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-4 w-4 text-[#4edea3]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#4edea3]">
                Anti-Scalp Protocol Active
              </span>
            </div>
            <ResaleMarketplace />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
