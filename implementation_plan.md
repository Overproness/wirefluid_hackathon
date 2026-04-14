# CricketChain — Website Implementation Plan

## Project Overview

A Web3 dApp frontend for the CricketChain smart contract ecosystem. Fans connect their wallets and interact with all four pillars — Anti-Scalp Ticketing, Fan Identity & Loyalty, Content Monetization, and DAO Governance — through a polished, cricket-themed UI.

---

## 1. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR/SSG for SEO, file-based routing, server components |
| **Language** | TypeScript (strict) | Type-safe contract interactions |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid, consistent UI components |
| **Animations** | Framer Motion | Polished micro-interactions, page transitions |
| **Web3 Layer** | wagmi v2 + viem v2 | Best-in-class React hooks for EVM contracts |
| **Wallet UI** | RainbowKit v2 | Supports MetaMask, WalletConnect, Coinbase Wallet |
| **Data Fetching** | TanStack Query v5 | Server state, caching, polling for chain updates |
| **Charts** | Recharts | XP progression charts, revenue analytics |
| **Icons** | Lucide React | Consistent icon set |
| **Notifications** | Sonner | Toast notifications for tx confirmations |
| **Form Validation** | React Hook Form + Zod | Safe form handling for content submission |
| **Package Manager** | pnpm | Fast installs, monorepo-friendly |

---

## 2. Folder Structure

```
website/
├── app/                        ← Next.js App Router
│   ├── layout.tsx              ← Root layout (providers, navbar, footer)
│   ├── page.tsx                ← Landing page
│   ├── dashboard/
│   │   └── page.tsx            ← Fan dashboard (requires wallet)
│   ├── tickets/
│   │   ├── page.tsx            ← Browse all matches + marketplace
│   │   └── [matchId]/
│   │       └── page.tsx        ← Match detail + buy tickets
│   ├── content/
│   │   ├── page.tsx            ← Browse approved content
│   │   ├── submit/
│   │   │   └── page.tsx        ← Submit new content
│   │   └── [contentId]/
│   │       └── page.tsx        ← Content detail (tip/sponsor)
│   ├── governance/
│   │   ├── page.tsx            ← DAO proposals list
│   │   └── [proposalId]/
│   │       └── page.tsx        ← Proposal detail + vote
│   └── profile/
│       └── [address]/
│           └── page.tsx        ← Public fan profile
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   ├── wallet/
│   │   ├── ConnectButton.tsx
│   │   └── WalletGate.tsx      ← HOC: show connect prompt if no wallet
│   ├── profile/
│   │   ├── FanProfileCard.tsx
│   │   ├── XPProgressBar.tsx
│   │   ├── TierBadge.tsx
│   │   └── ActivityFeed.tsx
│   ├── tickets/
│   │   ├── MatchCard.tsx
│   │   ├── TicketCard.tsx
│   │   ├── BuyTicketModal.tsx
│   │   ├── ResaleListingCard.tsx
│   │   └── ListForResaleModal.tsx
│   ├── content/
│   │   ├── ContentCard.tsx
│   │   ├── ContentSubmitForm.tsx
│   │   ├── TipModal.tsx
│   │   └── SponsorModal.tsx
│   ├── governance/
│   │   ├── ProposalCard.tsx
│   │   ├── VoteModal.tsx
│   │   └── CreateProposalModal.tsx
│   └── ui/                     ← shadcn/ui re-exports + custom primitives
│
├── hooks/
│   ├── useProfile.ts           ← Read FanIdentity profile + tier
│   ├── useFanToken.ts          ← FAN token balance, allowance
│   ├── useTickets.ts           ← Matches, categories, listings
│   ├── useContent.ts           ← Content submissions, revenue
│   └── useGovernance.ts        ← Proposals, vote status, weights
│
├── lib/
│   ├── contracts.ts            ← Contract addresses + ABIs
│   ├── wagmi.ts                ← wagmi config + WireFluid chain
│   ├── utils.ts                ← Shared utilities (formatXP, tierColor, etc.)
│   └── constants.ts            ← Tier thresholds, XP rates, BPS values
│
├── public/
│   ├── logo.svg
│   └── cricket-bg.jpg
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Page-by-Page Breakdown

### 3.1 Landing Page (`/`)

**Purpose:** First impression. Convert visitors to registered fans.

**Sections:**
1. **Hero** — Animated headline ("Own Your PSL Experience"), tagline, two CTAs ("Connect Wallet" / "Explore Matches"), animated cricket ball / stadium background
2. **Stats Bar** — Live on-chain stats: Total Fans Registered, Matches Hosted, Content Pieces, Governance Proposals — pulled from contracts
3. **Four Pillars** — Card grid, each pillar with icon, 1-line description, and link to its section
4. **How It Works** — 4-step flow: Connect → Register → Earn XP → Participate
5. **Leaderboard Preview** — Top 5 fans by XP with tier badges
6. **CTA Banner** — "Get your testnet WIRE and join the PSL revolution"
7. **Footer** — Links, contract addresses, explorer links

---

### 3.2 Fan Dashboard (`/dashboard`)

**Purpose:** Personal hub for the connected wallet.

**Requires:** Wallet connected + fan registered. If unregistered, show registration prompt.

**Sections:**
1. **Profile Header** — Username, address (truncated), tier badge, XP progress bar to next tier, FAN token balance
2. **XP Breakdown** — Visual chart: XP from match attendance vs content vs governance vs referrals
3. **Stats Grid** — Matches Attended, Content Submitted, Votes Participated, Revenue Earned
4. **My Tickets** — ERC-1155 tickets the wallet holds, with match details + check-in status
5. **My Content** — Submitted pieces, status (Pending/Approved/Rejected), revenue earned per piece
6. **Active Proposals** — Proposals fan hasn't voted on yet (call-to-action)
7. **Recent Activity Feed** — Timeline of on-chain events (XP awards, ticket purchases, revenue claims)

---

### 3.3 Tickets Page (`/tickets`)

**Purpose:** Browse upcoming matches, buy tickets, access resale marketplace.

**Tabs:**
- **Upcoming Matches** — Cards for each active match with ticket categories and availability
- **Resale Marketplace** — Active listings with seller info, price, enforce-cap badge

**Match Card Shows:** Match name, date/time, venue, ticket categories with prices and remaining supply, "Buy Ticket" button

**Ticket Purchase Flow:**
1. Click "Buy Ticket" → Modal opens
2. Shows ticket category details, price in WIRE
3. "Confirm Purchase" → wagmi sends `buyTicket(tokenId, { value: price })`
4. Wait for tx → success toast with Explorer link
5. Ticket appears in Dashboard

**Anti-Scalp Proof UI:** Resale listings show a "Capped at 110%" badge. If a user tries to list above the cap, a red warning appears before the tx is even sent (frontend validation mirrors contract logic).

---

### 3.4 Match Detail Page (`/tickets/[matchId]`)

**Purpose:** Deep dive on one match — all ticket categories, real-time availability, resale listings for this match.

**Sections:**
- Match hero (name, date, teams)
- Ticket categories in styled cards (price, supply progress bar, "X remaining")
- Resale listings filtered to this match
- Check-in status (if fan holds a ticket for this match)

---

### 3.5 Content Page (`/content`)

**Purpose:** Fan-generated PSL content discovery and monetization hub.

**Tabs:**
- **Browse Approved** — Grid of approved content NFTs, sortable by tips received / newest
- **My Submissions** — Fan's own content with status + revenue stats

**Content Card Shows:** Title, creator (address/username), IPFS thumbnail (if available), tip count, total revenue earned, "Tip" / "Sponsor" action buttons

**Submit Content Button** (requires registration) → navigates to `/content/submit`

---

### 3.6 Content Submit Page (`/content/submit`)

**Purpose:** Form to submit content for moderation.

**Form Fields:**
- Title
- Description
- IPFS Metadata URI (with helper text: "Upload to IPFS first via Pinata/NFT.storage")
- Preview link (optional, display only)

**Flow:** Submit form → `submitContent()` tx → pending toast → success toast → redirect to "My Submissions"

---

### 3.7 Content Detail Page (`/content/[contentId]`)

**Purpose:** Full view of one approved content piece with monetization actions.

**Sections:**
- Content embed (IPFS link / iframe)
- Creator profile link, submission date, approval date
- Revenue breakdown: Total Deposited, Creator Share (claimable), Platform Share, PSL Treasury Share
- "Tip This Creator" button (any amount in WIRE)
- "Sponsor This Content" button (for brands, larger amount)
- "Claim My Revenue" button (appears if connected wallet == creator and has claimable amount)

---

### 3.8 Governance Page (`/governance`)

**Purpose:** PSL DAO voting hub.

**Sections:**
- **Active Proposals** — Cards with voting deadline countdown, top option leading, voter participation bar
- **Past Proposals** — Finalized proposals with outcome and execution status
- **Create Proposal** button (for wallets with PROPOSER_ROLE)

**Proposal Card Shows:** Title, type badge (MVP Vote / Fan Award / Charity / General), options preview, votes cast (weighted), time remaining, user's vote status (voted / not voted)

---

### 3.9 Proposal Detail Page (`/governance/[proposalId]`)

**Purpose:** Cast votes with full context.

**Sections:**
- Proposal title, type, description
- Voting options with current vote tally (bar chart)
- User's current voting power (FAN balance × tier multiplier)
- Total participation vs quorum requirement (progress bar)
- "Vote" modal — select option → tx → +25 XP toast
- End time countdown
- If finalized: outcome card, winning option, execution status

---

### 3.10 Public Profile Page (`/profile/[address]`)

**Purpose:** Public-facing fan profile — shareable.

**Sections:**
- Username, tier badge, join date
- XP progression chart
- Stats: Matches, Content, Votes, Revenue Earned
- Content gallery (approved pieces)
- Recent on-chain activity

---

## 4. Web3 Integration Architecture

### WireFluid Chain Config
```ts
// lib/wagmi.ts
const wirefluidTestnet = {
  id: 92533,
  name: "WireFluid Testnet",
  nativeCurrency: { name: "WIRE", symbol: "WIRE", decimals: 18 },
  rpcUrls: { default: { http: ["https://evm.wirefluid.com"] } },
  blockExplorers: {
    default: { name: "WireScan", url: "https://wirefluidscan.com" }
  },
};
```

### Contract Hooks Pattern
Each hook uses `useReadContract` for reads and `useWriteContract` + `useWaitForTransactionReceipt` for writes:
```ts
// hooks/useProfile.ts
export function useProfile(address?: Address) {
  return useReadContract({
    address: CONTRACTS.FanIdentity,
    abi: FanIdentityABI,
    functionName: "getProfile",
    args: [address!],
    query: { enabled: !!address },
  });
}
```

### Transaction UX Pattern
Every write transaction follows this flow:
1. User clicks action button
2. Modal shows summary + estimated gas
3. "Confirm" → wallet popup
4. Processing state: spinner + "Waiting for confirmation..."
5. Success: toast with "View on WireScan" link
6. Cache invalidated → UI updates automatically

---

## 5. Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--emerald` | `#10B981` | Primary CTA, success states |
| `--cricket-green` | `#166534` | Background accents |
| `--gold` | `#F59E0B` | Gold tier, XP highlights |
| `--platinum` | `#94A3B8` | Platinum tier badges |
| `--diamond` | `#38BDF8` | Diamond tier, special elements |
| `--slate-950` | `#020617` | Main background |
| `--slate-900` | `#0F172A` | Card backgrounds |
| `--slate-800` | `#1E293B` | Input backgrounds, borders |

### Tier Color Scheme
| Tier | Color | Icon |
|---|---|---|
| Bronze | `#CD7F32` | Shield |
| Silver | `#C0C0C0` | Shield+ |
| Gold | `#FFD700` | Crown |
| Platinum | `#E5E4E2` / blue shimmer | Star |
| Diamond | `#B9F2FF` / cyan shimmer | Gem |

### Typography
- **Display:** Bebas Neue or Barlow Condensed (cricket scoreboard feel)
- **Body:** Inter or Geist Sans (clean, readable)
- **Monospace:** JetBrains Mono (for addresses, hashes)

### Reusable Components (shadcn/ui base)
- `<Button>` — 4 variants: default, outline, ghost, destructive
- `<Card>` — Base card with header/content/footer slots
- `<Badge>` — Tier badges, status badges, pillar tags
- `<Dialog>` — All modals (buy ticket, vote, tip, etc.)
- `<Progress>` — XP bars, supply bars, quorum bars
- `<Tabs>` — Section tabs (Upcoming/Resale, Browse/Mine)
- `<Tooltip>` — Explain BPS, tier multipliers, etc. to non-crypto users
- `<Skeleton>` — Loading states while reading from chain

---

## 6. Key User Flows

### New Fan Onboarding
```
Visit landing page
  → "Connect Wallet" → RainbowKit modal (MetaMask / WalletConnect)
  → If unregistered: prompt registration
  → Enter username → confirm tx (~1 FAN awarded)
  → Land on dashboard with tutorial tooltip overlay
```

### Buying a Ticket
```
/tickets → pick match → pick category
  → "Buy Ticket" modal → shows price + max resale price info
  → Confirm → MetaMask → tx confirmed
  → Ticket appears in "My Tickets" on dashboard
  → Success toast: "Ticket purchased! You're going to the match."
```

### Scalp Attempt (Anti-Scalp Demo)
```
/dashboard → My Tickets → "List for Resale"
  → Price input: if over 110% → red warning inline: "Above maximum resale price"
  → Submit button disabled until valid price
  → At valid price: tx goes through, listing appears in marketplace
```

### Claim Revenue
```
/content/[id] → "Claim Revenue" card
  → Shows: "0.005 WIRE claimable (50% of 0.01 WIRE deposited)"
  → "Claim" → single tx → revenue lands in wallet
  → Card updates to "0.00 WIRE remaining"
```

### Vote on Proposal
```
/governance → open proposal → "Vote" button
  → Slide-in panel: shows options, your voting power, time left
  → Select option → "Cast Vote" → tx → +25 XP toast
  → Option bar fills with your vote weight added
```

---

## 7. Performance & UX Requirements

- **Chain reads cached** with TanStack Query: staleTime 30s, refetchInterval 15s (live data feeling)
- **Optimistic updates** on vote and purchase (update UI before tx confirmed)
- **Mobile-first responsive** layout — most PSL fans are on mobile
- **Error boundaries** on every contract read — never show raw error to user
- **Skeleton screens** instead of spinners — improves perceived performance
- **No page reloads** after transactions — wagmi cache invalidation handles updates
- **Gas estimate** shown in modals before confirmation
- **Explorer link** in every success notification

---

## 8. Deployment

| Service | Use |
|---|---|
| **Vercel** | Frontend hosting (auto-deploy from GitHub main) |
| **Environment Variables** | `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_*_CONTRACT_ADDRESS` |
| **Domain** | Custom domain or Vercel subdomain for demo link |

The contract addresses from `deployments.json` are hardcoded into `lib/contracts.ts` for the testnet deployment. No backend required — all reads go directly to the WireFluid RPC.

---

## 9. Out of Scope (v1)

- Real IPFS upload integration (users paste their own IPFS URI)
- Push notifications for proposal deadlines
- Mobile native app
- Multi-chain support
- Backend API / indexer (direct RPC calls only)
- Social login / account abstraction
