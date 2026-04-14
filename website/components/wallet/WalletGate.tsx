"use client";

import { useIsRegistered } from "@/hooks/useProfile";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { useAccount } from "wagmi";
import { RegistrationPrompt } from "./RegistrationPrompt";

interface WalletGateProps {
  children: React.ReactNode;
  requireRegistration?: boolean;
  fallback?: React.ReactNode;
}

export function WalletGate({
  children,
  requireRegistration = false,
  fallback,
}: WalletGateProps) {
  const { isConnected } = useAccount();
  const { isRegistered, isLoading } = useIsRegistered();

  if (!isConnected) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="glass-card rounded-xl p-8 max-w-md w-full text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-[#4edea3]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#dce1fb] mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-[#bbcabf] text-sm mb-6">
              Connect your wallet to access the CricketChain arena. MetaMask,
              WalletConnect, and more supported.
            </p>
            <ConnectButton />
          </div>
        </div>
      )
    );
  }

  if (requireRegistration && !isLoading && !isRegistered) {
    return <RegistrationPrompt />;
  }

  return <>{children}</>;
}
