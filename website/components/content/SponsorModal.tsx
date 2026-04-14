'use client';

import { useSponsorContent } from '@/hooks/useContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { parseEther } from 'viem';

interface SponsorModalProps {
  contentId: number;
  open: boolean;
  onClose: () => void;
}

export function SponsorModal({ contentId, open, onClose }: SponsorModalProps) {
  const { sponsorContent, isPending } = useSponsorContent();
  const [amount, setAmount] = useState('1');

  const handleSponsor = () => {
    const value = parseEther(amount);
    sponsorContent(contentId, value);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0c1324] border-[rgba(134,148,138,0.08)] text-[#dce1fb]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Sponsor Content 💎</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-[#bbcabf]">
            Sponsorships support quality cricket content. Revenue is split between the creator, pool, and platform.
          </p>

          <div>
            <Label className="text-sm text-[#bbcabf]">Amount (WIRE)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#191f31] border-[rgba(134,148,138,0.15)] text-[#dce1fb] mt-1 font-mono"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 border-[rgba(134,148,138,0.15)] text-[#bbcabf]">
              Cancel
            </Button>
            <Button onClick={handleSponsor} disabled={isPending} className="flex-1 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black">
              {isPending ? 'Sponsoring…' : `Sponsor ${amount} WIRE`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
