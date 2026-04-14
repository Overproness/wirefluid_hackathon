"use client";

import { ContentFeed } from "@/components/content/ContentFeed";
import { ContentSubmitForm } from "@/components/content/ContentSubmitForm";
import { MyCreatorContent } from "@/components/content/MyCreatorContent";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletGate } from "@/components/wallet/WalletGate";
import { Film, Upload, User } from "lucide-react";

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-[#dce1fb] uppercase">
            Content Hub
          </h1>
          <p className="text-[#bbcabf] mt-2">
            Fan-created content with on-chain tipping, sponsorships, and
            automated revenue splits.
          </p>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="bg-[#191f31] border-0 mb-6">
            <TabsTrigger
              value="browse"
              className="data-[state=active]:bg-[#10b981]/10 data-[state=active]:text-[#4edea3] text-[#bbcabf]"
            >
              <Film className="h-4 w-4 mr-2" /> Browse
            </TabsTrigger>
            <TabsTrigger
              value="submit"
              className="data-[state=active]:bg-[#10b981]/10 data-[state=active]:text-[#4edea3] text-[#bbcabf]"
            >
              <Upload className="h-4 w-4 mr-2" /> Submit
            </TabsTrigger>
            <TabsTrigger
              value="my-content"
              className="data-[state=active]:bg-[#10b981]/10 data-[state=active]:text-[#4edea3] text-[#bbcabf]"
            >
              <User className="h-4 w-4 mr-2" /> My Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <ContentFeed />
          </TabsContent>

          <TabsContent value="submit">
            <WalletGate requireRegistration>
              <ContentSubmitForm />
            </WalletGate>
          </TabsContent>

          <TabsContent value="my-content">
            <WalletGate requireRegistration>
              <MyCreatorContent />
            </WalletGate>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
