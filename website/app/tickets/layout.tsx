import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Tickets",
  description:
    "Buy anti-scalp protected NFT tickets for PSL matches. On-chain enforced maximum resale prices.",
};

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
