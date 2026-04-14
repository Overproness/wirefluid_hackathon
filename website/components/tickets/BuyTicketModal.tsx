'use client';

import { useTicketCategory, useBuyTicket } from '@/hooks/useTickets';
import { useMatch } from '@/hooks/useTickets';
import { formatWire } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface BuyTicketModalProps {
  tokenId: number;
  open: boolean;
  onClose: () => void;
}

export function BuyTicketModal({ tokenId, open, onClose }: BuyTicketModalProps) {
  const { category } = useTicketCategory(tokenId);
  const matchId = category ? Number(category.matchId) : 0;
  const { match } = useMatch(matchId);
  const { buyTicket, isPending } = useBuyTicket();
  const [qty, setQty] = useState(1);

  if (!category || !match) return null;

  const price = category.price;
  const totalPrice = BigInt(qty) * price;
  const remaining = Number(category.totalSupply) - Number(category.sold);

  const handleBuy = () => {
    buyTicket(tokenId, totalPrice);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0c1324] border-[rgba(134,148,138,0.08)] text-[#dce1fb]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Buy Ticket</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="glass-card rounded-lg p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B] mb-1">{match.name}</p>
            <p className="text-lg font-bold">{category.categoryName}</p>
            <p className="text-xs text-[#86948a] mt-1">
              {new Date(Number(match.date) * 1000).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[#bbcabf]">Price per ticket</span>
            <span className="font-mono text-[#4edea3]">{formatWire(price)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[#bbcabf]">Quantity</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-8 w-8 rounded bg-[#191f31] text-[#dce1fb]">-</button>
              <span className="font-mono w-8 text-center">{qty}</span>
              <button onClick={() => setQty(Math.min(remaining, qty + 1))} className="h-8 w-8 rounded bg-[#191f31] text-[#dce1fb]">+</button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[rgba(134,148,138,0.08)] pt-3">
            <span className="text-sm font-bold text-[#dce1fb]">Total</span>
            <span className="font-mono text-lg font-bold text-[#4edea3]">{formatWire(totalPrice)}</span>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 border-[rgba(134,148,138,0.15)] text-[#bbcabf]">
              Cancel
            </Button>
            <Button onClick={handleBuy} disabled={isPending} className="flex-1 primary-gradient text-white">
              {isPending ? 'Confirming…' : 'Confirm Purchase'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
