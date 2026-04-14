'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Menu, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileNav } from './MobileNav';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/content', label: 'Content' },
  { href: '/governance', label: 'Governance' },
];

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#020617]/80 border-b border-[rgba(134,148,138,0.1)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg primary-gradient flex items-center justify-center">
            <span className="text-white font-bold text-sm">CC</span>
          </div>
          <span className="font-heading text-xl font-bold text-[#4edea3]">
            CricketChain
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            // Only show Dashboard if connected
            if (link.href === '/dashboard' && !isConnected) return null;
            const isActive = pathname === link.href || 
              (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors rounded-lg',
                  isActive
                    ? 'text-[#4edea3] border-b-2 border-[#4edea3]'
                    : 'text-[#bbcabf] hover:text-[#4edea3]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isConnected && (
            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-1 text-[#bbcabf] hover:text-[#4edea3] transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          )}
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
          />
          <button
            className="md:hidden p-2 text-[#bbcabf] hover:text-[#4edea3]"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
