"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBuyResaleTicket,
  useListing,
  useMatch,
  useTicketCategory,
  useTotalListings,
} from "@/hooks/useTickets";
import { formatAddress, formatWire } from "@/lib/utils";

function ResaleListingCard({ listingId }: { listingId: number }) {
  const { listing, isLoading } = useListing(listingId);
  const { buyResaleTicket, isPending } = useBuyResaleTicket();

  const tokenId = listing ? Number(listing.tokenId) : 0;
  const { category } = useTicketCategory(tokenId);
  const matchId = category ? Number(category.matchId) : 0;
  const { match } = useMatch(matchId);

  if (isLoading || !listing) {
    return <Skeleton className="h-40 w-full bg-[#191f31] rounded-xl" />;
  }

  if (!listing.active) return null;

  const handleBuy = () => {
    buyResaleTicket(listingId, listing.price);
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B]">
            {match?.name || `Match #${matchId}`}
          </p>
          <p className="text-sm font-medium text-[#dce1fb] mt-1">
            {category?.categoryName || `Token #${tokenId}`}
          </p>
        </div>
        <span className="text-xs text-[#86948a]">
          by {formatAddress(listing.seller)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-lg font-bold text-[#4edea3]">
            {formatWire(listing.price)}
          </span>
          <span className="text-xs text-[#86948a] ml-2">Qty: 1</span>
        </div>
        <Button
          onClick={handleBuy}
          disabled={isPending}
          size="sm"
          className="primary-gradient text-white text-xs"
        >
          {isPending ? "Buying…" : "Buy Now"}
        </Button>
      </div>
    </div>
  );
}

export function ResaleMarketplace() {
  const { totalListings, isLoading } = useTotalListings();
  const count = totalListings ? Number(totalListings) : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full bg-[#191f31] rounded-xl" />
        ))}
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#86948a]">No resale listings available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ResaleListingCard key={i + 1} listingId={i + 1} />
      ))}
    </div>
  );
}
