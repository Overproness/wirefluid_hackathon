"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTipContent } from "@/hooks/useContent";
import { useState } from "react";
import { parseEther } from "viem";

interface TipModalProps {
  contentId: number;
  open: boolean;
  onClose: () => void;
}

const TIP_PRESETS = ["0.01", "0.05", "0.1", "0.5"];

export function TipModal({ contentId, open, onClose }: TipModalProps) {
  const { tipContent, isPending } = useTipContent();
  const [amount, setAmount] = useState("0.05");

  const handleTip = () => {
    const value = parseEther(amount);
    tipContent(contentId, value);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0c1324] border-[rgba(134,148,138,0.08)] text-[#dce1fb]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Tip Creator ❤️
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-[#bbcabf]">
            50% goes to the creator, 30% to the revenue pool, 20% to the
            platform.
          </p>

          <div className="grid grid-cols-4 gap-2">
            {TIP_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className={`py-2 rounded-lg font-mono text-sm transition-colors ${
                  amount === preset
                    ? "bg-[#10b981]/20 text-[#4edea3] ring-1 ring-[#10b981]"
                    : "bg-[#191f31] text-[#bbcabf] hover:bg-[#191f31]/80"
                }`}
              >
                {preset} WIRE
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[rgba(134,148,138,0.15)] text-[#bbcabf]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTip}
              disabled={isPending}
              className="flex-1 primary-gradient text-white"
            >
              {isPending ? "Sending…" : `Tip ${amount} WIRE`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
