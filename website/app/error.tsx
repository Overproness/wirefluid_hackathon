"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="glass-card rounded-xl p-8 max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#dce1fb] mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-[#bbcabf] mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset} className="primary-gradient text-white">
          Try Again
        </Button>
      </div>
    </div>
  );
}
