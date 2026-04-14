"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Film, Home, LayoutDashboard, Ticket, Vote } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/content", label: "Content", icon: Film },
  { href: "/governance", label: "Governance", icon: Vote },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className="w-72 bg-[#0c1324] border-r border-[rgba(134,148,138,0.1)] p-0"
      >
        <SheetHeader className="p-4 border-b border-[rgba(134,148,138,0.1)]">
          <SheetTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg primary-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-heading text-lg font-bold text-[#4edea3]">
              CricketChain
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col p-4 gap-1">
          {navLinks.map((link) => {
            if (link.href === "/dashboard" && !isConnected) return null;
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#10b981]/10 text-[#4edea3] border-r-4 border-[#10b981]"
                    : "text-[#bbcabf] hover:text-[#4edea3] hover:bg-[#191f31]",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-[rgba(134,148,138,0.1)]">
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus="full"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
