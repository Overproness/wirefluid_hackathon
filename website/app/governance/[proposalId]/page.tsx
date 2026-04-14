"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useHasVoted,
  useOptionVotes,
  useProposal,
  useVote,
  useVoteWeight,
  useWinningOption,
} from "@/hooks/useGovernance";
import { PROPOSAL_STATES, PROPOSAL_TYPES } from "@/lib/constants";
import { formatAddress, formatVotes } from "@/lib/utils";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { useAccount } from "wagmi";

function OptionBar({
  proposalId,
  optionIndex,
  label,
  totalVotes,
  isWinner,
}: {
  proposalId: number;
  optionIndex: number;
  label: string;
  totalVotes: bigint;
  isWinner: boolean;
}) {
  const { votes } = useOptionVotes(proposalId, optionIndex);
  const optionVotes = votes ? Number(votes) : 0;
  const total = Number(totalVotes);
  const pct = total > 0 ? Math.round((optionVotes / total) * 100) : 0;

  return (
    <div
      className={`rounded-lg p-3 ${isWinner ? "ring-1 ring-[#4edea3]" : ""}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-[#dce1fb] flex items-center gap-2">
          {label}
          {isWinner && <CheckCircle className="h-4 w-4 text-[#4edea3]" />}
        </span>
        <span className="font-mono text-sm text-[#bbcabf]">
          {pct}% ({formatVotes(votes || BigInt(0))})
        </span>
      </div>
      <div className="h-2 bg-[#191f31] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isWinner ? "bg-gradient-to-r from-[#10b981] to-[#4edea3]" : "bg-[#38BDF8]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId: id } = use(params);
  const proposalId = parseInt(id);
  const { address } = useAccount();
  const { proposal, isLoading } = useProposal(proposalId);
  const { hasVoted, refetch: refetchVoted } = useHasVoted(proposalId, address);
  const { vote, isPending: votePending } = useVote();
  const { voteWeight } = useVoteWeight();
  const { winningIndex } = useWinningOption(proposalId);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const now = Math.floor(Date.now() / 1000);
  const isActive = proposal ? now < Number(proposal.endTime) : false;

  const handleVote = () => {
    if (selectedOption === null) return;
    vote(proposalId, selectedOption);
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/governance"
          className="inline-flex items-center gap-2 text-sm text-[#bbcabf] hover:text-[#4edea3] mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Governance
        </Link>

        {isLoading || !proposal ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3 bg-[#191f31]" />
            <Skeleton className="h-64 w-full bg-[#191f31] rounded-xl" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B]">
                  {PROPOSAL_TYPES[proposal.proposalType] || "General"}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${isActive ? "bg-[#4edea3]/20 text-[#4edea3]" : "bg-[#191f31] text-[#86948a]"}`}
                >
                  {isActive ? "Active" : PROPOSAL_STATES[proposal.state]}
                </span>
              </div>
              <h1 className="font-heading text-3xl font-bold text-[#dce1fb]">
                {proposal.title}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-xs text-[#86948a]">
                <span>by {formatAddress(proposal.proposer)}</span>
                <span>•</span>
                <span>{formatVotes(proposal.totalVotes)} total votes</span>
                {isActive && (
                  <>
                    <span>•</span>
                    <span>
                      Ends{" "}
                      {new Date(
                        Number(proposal.endTime) * 1000,
                      ).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="glass-card rounded-xl p-6">
              <p className="text-[#bbcabf] leading-relaxed">
                {proposal.description}
              </p>
            </div>

            {/* Results */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-heading text-lg font-bold text-[#dce1fb] mb-4">
                {isActive ? "Current Results" : "Final Results"}
              </h3>
              <div className="space-y-3">
                {proposal.options.map((opt, i) => (
                  <OptionBar
                    key={i}
                    proposalId={proposalId}
                    optionIndex={i}
                    label={opt}
                    totalVotes={proposal.totalVotes}
                    isWinner={
                      winningIndex !== undefined && Number(winningIndex) === i
                    }
                  />
                ))}
              </div>
            </div>

            {/* Voting */}
            {isActive && !hasVoted && address && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-heading text-lg font-bold text-[#dce1fb] mb-2">
                  Cast Your Vote
                </h3>
                {voteWeight && (
                  <p className="text-xs text-[#bbcabf] mb-4">
                    Your vote weight:{" "}
                    <span className="font-mono text-[#4edea3]">
                      {Number(voteWeight)}
                    </span>{" "}
                    (based on your tier)
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {proposal.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(i)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedOption === i
                          ? "bg-[#10b981]/20 ring-1 ring-[#10b981] text-[#4edea3]"
                          : "bg-[#191f31] text-[#bbcabf] hover:bg-[#191f31]/80"
                      }`}
                    >
                      <span className="text-sm font-medium">{opt}</span>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleVote}
                  disabled={selectedOption === null || votePending}
                  className="w-full primary-gradient text-white"
                >
                  {votePending
                    ? "Submitting…"
                    : selectedOption !== null
                      ? `Vote for "${proposal.options[selectedOption]}"`
                      : "Select an option"}
                </Button>
              </div>
            )}

            {hasVoted && (
              <div className="glass-card rounded-xl p-4 flex items-center gap-3 border-l-4 border-[#4edea3]">
                <CheckCircle className="h-5 w-5 text-[#4edea3]" />
                <p className="text-sm text-[#bbcabf]">
                  You&apos;ve already voted on this proposal. +25 XP earned!
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
