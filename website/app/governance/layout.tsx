import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DAO Governance",
  description:
    "Vote on MVP awards, fan polls, and charitable initiatives. Tier-weighted voting powered by on-chain XP.",
};

export default function GovernanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
