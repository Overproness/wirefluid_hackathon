'use client';

import { motion } from 'framer-motion';
import { Ticket, Shield, Film, Vote, Wallet, UserPlus, Star, Trophy, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useTotalFans } from '@/hooks/useProfile';
import { useMatchCount } from '@/hooks/useTickets';
import { useContentCount } from '@/hooks/useContent';
import { useProposalCount } from '@/hooks/useGovernance';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LeaderboardPreview } from '@/components/landing/LeaderboardPreview';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' as const },
  }),
};

const pillars = [
  {
    icon: Shield,
    title: 'Rewards',
    description: 'Stake your $FAN tokens and participate in predictive challenges to earn exclusive memorabilia and real-world stadium experiences.',
    cta: 'VIEW TIERS →',
    href: '/dashboard',
    color: '#F59E0B',
  },
  {
    icon: Vote,
    title: 'Governance',
    description: 'Your voice matters. Vote on pitch songs, match-day themes, and stadium upgrades through our transparent DAO infrastructure.',
    cta: 'ACTIVE VOTES →',
    href: '/governance',
    color: '#38BDF8',
  },
  {
    icon: Ticket,
    title: 'Tickets',
    description: 'Say goodbye to paper. Mint your season passes as secure dynamic NFTs with embedded VIP utility and secondary market proof.',
    cta: 'MINT NOW →',
    href: '/tickets',
    color: '#4edea3',
  },
  {
    icon: Film,
    title: 'Community',
    description: 'Join a global stadium of fans. Share content, create watch-parties, and build your profile as a legendary diamond-tier enthusiast.',
    cta: 'JOIN DISCORD →',
    href: '/content',
    color: '#a78bfa',
  },
];

const steps = [
  { icon: Wallet, num: '01', title: 'Connect Wallet', desc: 'Seamlessly link your Metamask or Phantom to start your journey.' },
  { icon: Star, num: '02', title: 'Claim $FAN Tokens', desc: 'Acquire $FAN on our internal dex to unlock utility across the app.' },
  { icon: Trophy, num: '03', title: 'Participate', desc: 'Predict match outcomes and vote on crucial DAO proposals.' },
  { icon: UserPlus, num: '04', title: 'Level Up', desc: 'Climb the leaderboard to earn Tier Badges and exclusive perks.' },
];

function LiveStatBar() {
  const { totalFans } = useTotalFans();
  const { matchCount } = useMatchCount();
  const { contentCount } = useContentCount();
  const { proposalCount } = useProposalCount();

  const stats = [
    { label: 'FANS REGISTERED', value: totalFans ? Number(totalFans).toLocaleString() : '—' },
    { label: 'MATCHES', value: matchCount ? Number(matchCount).toLocaleString() : '—' },
    { label: 'CONTENT PIECES', value: contentCount ? Number(contentCount).toLocaleString() : '—' },
    { label: 'ACTIVE PROPOSALS', value: proposalCount ? Number(proposalCount).toLocaleString() : '—' },
  ];

  return (
    <div className="glass-card rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className="font-mono text-2xl md:text-3xl font-bold text-[#4edea3]">{stat.value}</p>
          <p className="text-xs font-mono uppercase tracking-widest text-[#bbcabf] mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0 stadium-bokeh" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]" />

        {/* Decorative cricket ball */}
        <motion.div
          className="absolute top-1/4 right-[15%] w-16 h-16 opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-full h-full rounded-full border-2 border-[#4edea3] relative">
            <div className="absolute inset-0 border-t-2 border-[#4edea3] rounded-full rotate-45" />
          </div>
        </motion.div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Cricket icon */}
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center">
              <svg viewBox="0 0 48 48" className="h-16 w-16 text-[#4edea3]" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M24 4L28 20L44 24L28 28L24 44L20 28L4 24L20 20Z" />
              </svg>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-[#dce1fb] leading-none"
          >
            OWN YOUR <span className="text-[#4edea3] text-glow-primary">PSL</span>
            <br />
            EXPERIENCE
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-2xl mx-auto text-[#bbcabf] text-base md:text-lg"
          >
            The first decentralized fan ecosystem built for the electric spirit of Pakistan Super League.
            Governance, Rewards, and Digital Assets.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <ConnectButton />
            <Link href="/tickets">
              <Button
                variant="outline"
                className="border-[rgba(134,148,138,0.3)] text-[#dce1fb] hover:bg-[#191f31] hover:text-[#4edea3] px-6 py-5 rounded-lg"
              >
                Explore Matches
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={4}
            initial="hidden"
            animate="visible"
            className="mt-12"
          >
            <ChevronDown className="mx-auto h-6 w-6 text-[#bbcabf] animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="relative z-10 -mt-12 max-w-5xl mx-auto px-4">
        <LiveStatBar />
      </section>

      {/* The Digital Arena - 4 Pillars */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#dce1fb]">
            The Digital Arena
          </h2>
          <div className="h-1 w-16 bg-[#4edea3] mt-3 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={pillar.href}>
                  <div className="glass-card rounded-xl p-6 h-full hover:bg-[rgba(46,52,71,0.5)] transition-all group cursor-pointer">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${pillar.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: pillar.color }} />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-[#dce1fb] mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[#bbcabf] mb-4">{pillar.description}</p>
                    <span
                      className="font-mono text-xs uppercase tracking-widest group-hover:tracking-[0.2em] transition-all"
                      style={{ color: pillar.color }}
                    >
                      {pillar.cta}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Enter The Arena - How It Works */}
      <section className="bg-[#0c1324] py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-[#dce1fb] uppercase tracking-wide">
              Enter The Arena
            </h2>
            <p className="text-[#bbcabf] mt-3">Follow the path to becoming a Pro Fan</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-full border-2 border-[#4edea3] text-[#4edea3] font-mono text-lg font-bold mb-4">
                    {step.num}
                  </div>
                  <div className="mx-auto h-12 w-12 rounded-lg bg-[#191f31] flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-[#4edea3]" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#dce1fb] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#bbcabf]">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <LeaderboardPreview />
      </section>

      <Footer />
    </div>
  );
}
