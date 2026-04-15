import { WIRESCAN_URL } from "@/lib/constants";
import { CONTRACTS } from "@/lib/contracts";
import { formatAddress } from "@/lib/utils";
import Link from "next/link";

const contractLinks = [
  { name: "FanToken", address: CONTRACTS.FanToken.address },
  { name: "FanIdentity", address: CONTRACTS.FanIdentity.address },
  { name: "TicketFactory", address: CONTRACTS.TicketFactory.address },
  { name: "ContentManager", address: CONTRACTS.ContentManager.address },
  { name: "PSLGovernor", address: CONTRACTS.PSLGovernor.address },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-[rgba(134,148,138,0.1)] bg-[#020617]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & tagline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg primary-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="font-heading text-lg font-bold text-[#4edea3]">
                CricketChain
              </span>
            </div>
            <p className="text-sm text-[#bbcabf]">
              The first decentralized fan ecosystem built for Pakistan Super
              League.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#191f31] text-xs text-[#bbcabf]">
              <span className="h-2 w-2 rounded-full bg-[#4edea3] animate-pulse" />
              Built on WireFluid
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-[#dce1fb] uppercase tracking-widest mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/tickets"
                  className="text-[#bbcabf] hover:text-[#4edea3] transition-colors"
                >
                  Tickets
                </Link>
              </li>
              <li>
                <Link
                  href="/content"
                  className="text-[#bbcabf] hover:text-[#4edea3] transition-colors"
                >
                  Content
                </Link>
              </li>
              <li>
                <Link
                  href="/governance"
                  className="text-[#bbcabf] hover:text-[#4edea3] transition-colors"
                >
                  Governance
                </Link>
              </li>
              <li>
                <a
                  href={WIRESCAN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#bbcabf] hover:text-[#38BDF8] transition-colors"
                >
                  WireScan Explorer ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Contracts */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-[#dce1fb] uppercase tracking-widest mb-4">
              Smart Contracts
            </h4>
            <ul className="space-y-2 text-sm">
              {contractLinks.map((c) => (
                <li key={c.name} className="flex items-center justify-between">
                  <span className="text-[#bbcabf]">{c.name}</span>
                  <a
                    href={`${WIRESCAN_URL}/address/${c.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[#38BDF8] hover:text-[#7bd0ff] transition-colors"
                  >
                    {formatAddress(c.address)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[rgba(134,148,138,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#bbcabf] font-mono uppercase tracking-widest">
            © 2026 CricketChain Arena. Verified Contract: 0xStadium...Nocturne
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4edea3]" />
            <span className="text-xs text-[#bbcabf] font-mono uppercase tracking-widest">
              Mainnet Status: Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
