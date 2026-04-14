"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const WalletProviders = dynamic(
  () => import("./wallet-providers").then((m) => m.WalletProviders),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <WalletProviders>
        {children}
      </WalletProviders>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(25, 31, 49, 0.9)",
            border: "1px solid rgba(78, 222, 163, 0.2)",
            color: "#dce1fb",
          },
        }}
      />
    </TooltipProvider>
  );
}
