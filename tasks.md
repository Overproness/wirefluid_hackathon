# CricketChain Website — Step-by-Step Task List

Complete tasks in order within each phase. Each task is concrete and actionable.

---

## Phase 0: Project Scaffolding

### Task 0.1 — Initialize Next.js Project

```bash
cd d:\GitHub\wirefluid_hackathon
pnpm create next-app@latest website -- --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd website
```

### Task 0.2 — Install Core Dependencies

```bash
# Web3
pnpm add wagmi viem @rainbow-me/rainbowkit @tanstack/react-query

# UI Components
pnpm add @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-tooltip
pnpm add @radix-ui/react-progress @radix-ui/react-badge @radix-ui/react-dropdown-menu
pnpm add class-variance-authority clsx tailwind-merge lucide-react

# Forms & Validation
pnpm add react-hook-form zod @hookform/resolvers

# Animations
pnpm add framer-motion

# Charts
pnpm add recharts

# Notifications
pnpm add sonner

# Fonts
pnpm add @fontsource/inter
```

### Task 0.3 — Install shadcn/ui CLI and Init

```bash
pnpm dlx shadcn@latest init
# Select: New York style, Slate base color, CSS variables: yes
```

### Task 0.4 — Add shadcn/ui Components

```bash
pnpm dlx shadcn@latest add button card badge dialog tabs progress tooltip
pnpm dlx shadcn@latest add input textarea label select skeleton separator
pnpm dlx shadcn@latest add dropdown-menu sheet alert avatar
```

### Task 0.5 — Set Up Contract Addresses and ABIs

```
1. Copy contract ABIs from cricketchain/artifacts/contracts/
   - FanToken.json → website/lib/abis/FanToken.ts
   - FanIdentity.json → website/lib/abis/FanIdentity.ts
   - TicketFactory.json → website/lib/abis/TicketFactory.ts
   - RevenueSplitter.json → website/lib/abis/RevenueSplitter.ts
   - ContentManager.json → website/lib/abis/ContentManager.ts
   - PSLGovernor.json → website/lib/abis/PSLGovernor.ts

2. Create website/lib/contracts.ts with all deployed addresses from deployments.json
```

### Task 0.6 — Configure wagmi with WireFluid Chain

```
File: lib/wagmi.ts

- Define wirefluidTestnet chain (chainId 92533, RPC https://evm.wirefluid.com)
- Create wagmiConfig with RainbowKit connectors
- Export config + WireFluid chain definition
```

### Task 0.7 — Set Up Root Providers

```
File: app/providers.tsx (client component)

- WagmiProvider
- QueryClientProvider (TanStack Query)
- RainbowKitProvider
- Toaster (Sonner)

Wrap app/layout.tsx children with <Providers>
```

### Task 0.8 — Configure Tailwind Theme

```
File: tailwind.config.ts

Add custom colors:
- cricket-green: #166534
- emerald (override default)
- gold: #F59E0B
- tier-bronze: #CD7F32
- tier-silver: #C0C0C0
- tier-gold: #FFD700
- tier-diamond: #38BDF8

Add custom fonts: Inter (body), Bebas Neue (display)
```

### Task 0.9 — Create Global Utilities

```
File: lib/utils.ts
- cn() — merge Tailwind classes (clsx + twMerge)
- formatAddress(address) — "0xabcd...1234"
- formatXP(xp) — "1,250 XP"
- getTierName(tierEnum) — "Gold"
- getTierColor(tierEnum) — Tailwind color class
- formatWire(bigint) — "0.005 WIRE"
- formatFAN(bigint) — "175 FAN"

File: lib/constants.ts
- CONTRACT_ADDRESSES
- TIER_THRESHOLDS: { Bronze: 0, Silver: 500, Gold: 2000, Platinum: 5000, Diamond: 15000 }
- TIER_MULTIPLIERS: { Bronze: 100, Silver: 120, Gold: 150, Platinum: 200, Diamond: 300 }
- XP_PER_ACTION: { MATCH_ATTENDANCE: 100, VOTE: 25, CONTENT_APPROVED: 50 }
- RESALE_ROYALTY_BPS: 700
- MAX_RESALE_BPS: 11000
```

---

## Phase 1: Layout & Navigation

### Task 1.1 — Build Navbar

```
File: components/layout/Navbar.tsx

Elements:
- CricketChain logo (left)
- Nav links: Tickets | Content | Governance
- ConnectButton (RainbowKit, right)
- Dashboard link (icon, visible only when connected)
- Mobile hamburger menu trigger

Behavior:
- Sticky on scroll
- Blur backdrop effect (glass morphism)
- Active link indicator
- Shows truncated address + tier badge when connected
```

### Task 1.2 — Build Footer

```
File: components/layout/Footer.tsx

Elements:
- Logo + tagline
- Links: GitHub, WireScan Explorer, Smart Contracts
- Contract address list (truncated, copyable)
- Built on WireFluid badge
```

### Task 1.3 — Build Mobile Navigation Drawer

```
File: components/layout/MobileNav.tsx

- Slide-in Sheet component
- All nav links with icons
- Wallet connect button
- Fan profile preview if connected
```

### Task 1.4 — Build WalletGate Component

```
File: components/wallet/WalletGate.tsx

Props: { children, requireRegistration?: boolean, fallback?: ReactNode }

Logic:
- If no wallet: show "Connect your wallet to continue" card with ConnectButton
- If connected but unregistered (and requireRegistration=true): show registration prompt
- Otherwise: render children
```

### Task 1.5 — Build RegistrationPrompt Component

```
File: components/wallet/RegistrationPrompt.tsx

- Explains fan registration (1 tx, free, earn XP)
- Username input form
- "Register" button → calls fanIdentity.register()
- Tx pending state + success redirect to dashboard
```

---

## Phase 2: Custom React Hooks

### Task 2.1 — useProfile Hook

```
File: hooks/useProfile.ts

Functions:
- useProfile(address?) — reads getProfile(), getTier(), getVoteWeight()
- useRegister() — write hook for register()
- useIsRegistered(address?) — boolean shortcut
```

### Task 2.2 — useFanToken Hook

```
File: hooks/useFanToken.ts

Functions:
- useFanTokenBalance(address?) — reads balanceOf()
- useFanTokenTotalSupply() — reads totalSupply()
```

### Task 2.3 — useTickets Hook

```
File: hooks/useTickets.ts

Functions:
- useMatch(matchId) — reads matches mapping
- useMatchCount() — reads matchCount
- useTicketCategory(tokenId) — reads categories mapping
- useTicketBalance(tokenId, address) — reads balanceOf(address, tokenId)
- useListings(count?) — reads listings array
- useBuyTicket() — write hook wrapping buyTicket()
- useListForResale() — write hook wrapping listForResale()
- useBuyResaleTicket() — write hook wrapping buyResaleTicket()
- useCancelListing() — write hook wrapping cancelListing()
- useCheckIn() — write hook wrapping checkIn()
- useIsCheckedIn(tokenId, address) — reads checkedIn mapping
```

### Task 2.4 — useContent Hook

```
File: hooks/useContent.ts

Functions:
- useContentCount() — reads contentCount
- useSubmission(contentId) — reads submissions mapping
- usePendingSubmissions() — reads getPendingSubmissions()
- useCreatorSubmissions(address) — reads getSubmissionsByCreator()
- useRevenue(contentId, address) — reads getClaimable() from RevenueSplitter
- useSubmitContent() — write hook
- useApproveContent() — write hook (moderator)
- useTipContent() — write hook
- useSponsorContent() — write hook
- useClaimRevenue() — write hook
```

### Task 2.5 — useGovernance Hook

```
File: hooks/useGovernance.ts

Functions:
- useProposalCount() — reads proposalCount
- useProposal(proposalId) — reads getProposal()
- useOptionVotes(proposalId, optionIndex) — reads optionVotes
- useHasVoted(proposalId, address) — reads hasVoted
- useVoteWeight(address) — reads getVoteWeight via FanIdentity
- useCreateProposal() — write hook
- useVote() — write hook
- useFinalizeProposal() — write hook (admin)
```

### Task 2.6 — useTransaction Helper Hook

```
File: hooks/useTransaction.ts

Generic hook that wraps useWriteContract + useWaitForTransactionReceipt:
- Handles pending → success → error states
- Auto-shows sonner toast on each state change
- Returns { write, isPending, isSuccess, error, txHash }
```

---

## Phase 3: Landing Page

### Task 3.1 — Build Hero Section

```
File: app/page.tsx (section: Hero)

Elements:
- Animated background: cricket stadium gradient or particle field
- Headline: "Own Your PSL Experience" (display font, large)
- Subheading: "Anti-scalp tickets. Fan-owned content. DAO governance. All on WireFluid."
- Two CTAs: "Connect Wallet" (primary, green), "Explore Matches" (outline)
- Animated cricket ball SVG (Framer Motion: rotate + bounce)
- Scroll indicator arrow

Animation: headline fades in + slides up with stagger
```

### Task 3.2 — Build Live Stats Bar

```
Elements:
- "X Fans Registered" — reads fanIdentity.totalFans()
- "X Matches Hosted" — reads ticketFactory.matchCount()
- "X Content Pieces" — reads contentManager.contentCount()
- "X Proposals Active" — reads governor.proposalCount()
- Each stat animated counting up on mount
```

### Task 3.3 — Build Four Pillars Section

```
4-column grid (2x2 on mobile) with card for each pillar:

Card 1 — Anti-Scalp Ticketing
  Icon: Ticket
  Color: Green
  Headline: "Tickets That Can't Be Scalped"
  Body: "Smart contracts enforce a maximum 110% resale price. No bots. No scalpers."

Card 2 — Fan Identity & Loyalty
  Icon: User/Shield
  Color: Gold
  Headline: "Your On-Chain Cricket Identity"
  Body: "Earn XP, level up from Bronze to Diamond, unlock early access and bigger votes."

Card 3 — Content Monetization
  Icon: Play/Film
  Color: Blue
  Headline: "Get Paid for Your Cricket Content"
  Body: "Submit highlights. Get approved. Earn 50% of all revenue your content generates."

Card 4 — DAO Governance
  Icon: Vote/Landmark
  Color: Purple
  Headline: "Your Vote Matters in PSL"
  Body: "Vote for Man of the Match, fan awards, and charity allocations. Weighted by your tier."
```

### Task 3.4 — Build How It Works Section

```
4-step horizontal stepper:
1. Connect Wallet (Wallet icon)
2. Register as a Fan (User+ icon)
3. Earn XP & FAN Tokens (Star icon)
4. Vote, Buy Tickets, Earn Revenue (Trophy icon)

Each step: number circle, icon, headline, 1-line description
Connecting arrows between steps on desktop
```

### Task 3.5 — Build Leaderboard Preview Section

```
"Top PSL Fans" — top 5 fans by XP (read from allFans array + getProfile)

Row format: rank, truncated address, username, tier badge, XP bar
"View Full Leaderboard" link
```

---

## Phase 4: Dashboard

### Task 4.1 — Build Profile Header Component

```
File: components/profile/FanProfileCard.tsx

Shows:
- Avatar (Jazzicon or gradient based on address)
- Username + address badge
- Tier badge with animated shimmer for Gold+
- XP: current / next-tier threshold (progress bar)
- FAN Token balance
- "Edit Profile" (future) and "Share Profile" buttons
```

### Task 4.2 — Build XP Breakdown Chart

```
File: components/profile/XPBreakdownChart.tsx

Pie or donut chart (Recharts) showing:
- Match Attendance XP
- Content Approval XP
- Governance Voting XP

Tooltip shows exact XP per category
```

### Task 4.3 — Build Stats Grid

```
4 stat cards:
- Matches Attended (with stadium icon)
- Content Submitted (with video icon)
- Votes Cast (with ballot icon)
- Total Revenue Earned in WIRE (sum across all content)
```

### Task 4.4 — Build My Tickets Section

```
- Reads held tickets (iterate tokenIdCounter, check balanceOf)
- Shows ticket card: match name, category, date, check-in status
- "List for Resale" button (opens modal)
```

### Task 4.5 — Build My Content Section

```
- Reads creatorSubmissions(address)
- Shows each: title, status badge (Pending/Approved/Rejected), revenue earned, "View" link
```

### Task 4.6 — Build Active Proposals CTA

```
- Shows proposals where hasVoted(id, address) == false and state == Active
- "You haven't voted on X proposals yet" callout card
- Links to /governance
```

### Task 4.7 — Wire Dashboard Page

```
File: app/dashboard/page.tsx

- WalletGate wrapper (requireRegistration=true)
- Compose all components
- Registration flow if no profile
```

---

## Phase 5: Tickets

### Task 5.1 — Build MatchCard Component

```
File: components/tickets/MatchCard.tsx

Shows:
- Match name (e.g., "Lahore Qalandars vs Islamabad United")
- Date/time formatted nicely
- Team logos / color strips (left vs right)
- Ticket categories with price tags
- "View Tickets" button
- Active/Sold Out badge
```

### Task 5.2 — Build BuyTicketModal

```
File: components/tickets/BuyTicketModal.tsx

- Shows category name, price in WIRE, max resale price
- "Note: Resale is limited to 0.0011 WIRE (110% max)" info box
- Wallet balance check (warn if insufficient)
- "Confirm Purchase" → useBuyTicket() → tx flow
```

### Task 5.3 — Build ResaleListingCard

```
File: components/tickets/ResaleListingCard.tsx

- Match name, category, seller (truncated)
- Price with "Capped" badge showing it's ≤ max resale
- "Buy Now" → useBuyResaleTicket() → tx flow
```

### Task 5.4 — Build ListForResaleModal

```
File: components/tickets/ListForResaleModal.tsx

- Shows owned ticket info
- Price input with real-time validation:
  - Below original price: yellow warning "Selling below original"
  - Above max: red error "Exceeds 110% resale cap — contract will reject"
  - Valid: green check
- "List Ticket" button (disabled if price invalid)
```

### Task 5.5 — Build Tickets Page

```
File: app/tickets/page.tsx

- Tabs: "Upcoming Matches" | "Resale Marketplace"
- Iterate matchCount, render MatchCards
- Iterate listings, render ResaleListingCards
- Filter: Active only
```

### Task 5.6 — Build Match Detail Page

```
File: app/tickets/[matchId]/page.tsx

- Match hero section
- Ticket categories with supply progress bars
- Resale listings for this matchId
- Fan's tickets for this match (if connected)
```

---

## Phase 6: Content

### Task 6.1 — Build ContentCard Component

```
File: components/content/ContentCard.tsx

- Title, creator username/address
- Status badge
- If approved: tip count, revenue earned, "Tip" button
- IPFS link (external)
- Approved date
```

### Task 6.2 — Build ContentSubmitForm

```
File: components/content/ContentSubmitForm.tsx

- Title input
- Description textarea
- Metadata URI input (validation: must start with ipfs:// or https://)
- "What is IPFS?" tooltip explaining the workflow
- Submit button → useSubmitContent() → tx flow
- Success: "Content submitted! A moderator will review within 24 hours."
```

### Task 6.3 — Build TipModal

```
File: components/content/TipModal.tsx

- Amount input in WIRE (min 0.0001)
- Revenue split preview: "50% → creator, 20% → platform, 15% → PSL, 15% → sponsors"
- "Send Tip" → useTipContent() → tx flow
```

### Task 6.4 — Build SponsorModal

```
Similar to TipModal but:
- Larger default amounts (0.01, 0.1, 0.5 WIRE quick-select)
- "Sponsor" label instead of "Tip"
- Emits SponsorFunded event (different analytics tracking)
```

### Task 6.5 — Build Content Page and Detail Page

```
File: app/content/page.tsx — grid of approved ContentCards + "Submit Content" CTA
File: app/content/submit/page.tsx — ContentSubmitForm wrapped in WalletGate
File: app/content/[contentId]/page.tsx — full detail + tip/sponsor/claim actions
```

---

## Phase 7: Governance

### Task 7.1 — Build ProposalCard Component

```
File: components/governance/ProposalCard.tsx

- Title, type badge (MVP VOTE / FAN AWARD / CHARITY / GENERAL)
- Leading option (name + vote bar)
- Participation: X% voted (vs quorum needed)
- Time remaining countdown
- Status badge: Active / Succeeded / Defeated / Executed
- "Vote" CTA (if active + not voted)
- "Voted" badge (if already voted)
```

### Task 7.2 — Build VoteModal

```
File: components/governance/VoteModal.tsx

- Proposal title + description
- Option list with radio select
- Current vote tally per option (bars, live from chain)
- User's voting power: "Your weight: 175 FAN × 1.0x (Bronze) = 175"
- "Cast Vote" → useVote() → tx flow → +25 XP toast
```

### Task 7.3 — Build CreateProposalModal

```
File: components/governance/CreateProposalModal.tsx

- Type selector (dropdown: MVP Vote, Fan Award, Charity, General)
- Title input
- Description textarea
- Options: dynamic add/remove (min 2, max 6)
- Duration: 1h, 6h, 12h, 24h, 3d, 7d (dropdown)
- "Create Proposal" → useCreateProposal() → tx flow
```

### Task 7.4 — Build Governance Page and Detail Page

```
File: app/governance/page.tsx

- "Active Proposals" and "Past Proposals" tabs
- Iterate proposalCount, render ProposalCards
- "Create Proposal" button (only shown if PROPOSER_ROLE — check via hasRole)

File: app/governance/[proposalId]/page.tsx

- Full proposal detail
- VoteModal trigger
- Bar chart showing option votes (Recharts)
- Quorum progress bar
- Countdown timer
- If finalized: outcome card with winner
```

---

## Phase 8: Public Profile Page

### Task 8.1 — Build Profile Page

```
File: app/profile/[address]/page.tsx

Sections:
- Profile header (username, tier badge, join date)
- XP stats (total, breakdown)
- Content gallery (approved pieces)
- Match attendance history
- Governance participation rate

All read-only, no wallet required
```

---

## Phase 9: Polish & Production

### Task 9.1 — Loading States

```
- Add <Skeleton> to every component that reads from chain
- Create LoadingMatchCard, LoadingProposalCard, LoadingProfileCard skeleton variants
- Show skeleton on initial load, real data after resolution
```

### Task 9.2 — Error Handling

```
- Add ErrorBoundary around each major section
- Show friendly error cards (not raw contract errors)
- Map common revert reasons to user-friendly messages:
  - "Must be a registered fan" → "Please register your fan profile first"
  - "Price exceeds max resale price" → "Price is above the 110% resale cap"
  - "Already voted" → "You've already voted on this proposal"
  - "Voting ended" → "This proposal's voting period has closed"
```

### Task 9.3 — Transaction History

```
File: components/wallet/TxHistory.tsx

- Store last 10 tx hashes in localStorage
- Show in wallet dropdown with WireScan links
- Status: Pending / Success / Failed
```

### Task 9.4 — Mobile Responsiveness Audit

```
Test and fix on:
- 375px (iPhone SE)
- 390px (iPhone 15)
- 768px (iPad)
- 1280px (laptop)
- 1920px (desktop)

Key responsive patterns:
- Cards: 1 col mobile, 2 col tablet, 3-4 col desktop
- Modals: full-screen on mobile, centered dialog on desktop
- Navbar: hamburger menu on < 768px
```

### Task 9.5 — SEO and Meta Tags

```
File: app/layout.tsx

- Title: "CricketChain — Fan-Owned PSL Experience"
- Description: "Anti-scalp ticketing, fan loyalty rewards, content monetization, and DAO governance for PSL fans on WireFluid."
- OG image: cricket stadium with CricketChain branding
- Per-page titles via generateMetadata()
```

### Task 9.6 — Environment Configuration

```
File: .env.local

NEXT_PUBLIC_CHAIN_ID=92533
NEXT_PUBLIC_FANTOKEN_ADDRESS=0x8Ec5cD1A9b0D98429E91F296B0c7acAd329545d3
NEXT_PUBLIC_FANIDENTITY_ADDRESS=0xc94d28025e2123A65f70594b379A79cBaA64AE93
NEXT_PUBLIC_TICKETFACTORY_ADDRESS=0x5fb18Edd5340EAeB6AeaD2a66B8491B16F71b9dd
NEXT_PUBLIC_REVENUESPLITTER_ADDRESS=0xf2407E277497c0A78cbC544550b76172A1ff163d
NEXT_PUBLIC_CONTENTMANAGER_ADDRESS=0xB3C42f652639272A6D8d297c8A2894182fC46bAC
NEXT_PUBLIC_PSLGOVERNOR_ADDRESS=0x1b8b0eA5600354E3e643c52237a4e080aE732DA1
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-wc-project-id>
```

### Task 9.7 — Deploy to Vercel

```bash
# From website/ directory
vercel --prod

# Set env variables in Vercel dashboard
# Connect to GitHub repo for auto-deploys
```

---

## Phase 10: Testing

### Task 10.1 — Smoke Test All User Flows

```
Checklist on testnet:
□ Connect wallet (MetaMask)
□ Register fan profile
□ Browse matches page — match cards load
□ Buy a ticket — tx goes through, ticket appears in dashboard
□ List ticket for resale — valid price accepted
□ Try scalp price — blocked by frontend validation
□ Submit content — tx goes through, appears as Pending
□ Approve content (as moderator) — status updates to Approved
□ Tip approved content — revenue deposited
□ Claim revenue — WIRE received
□ Browse governance — proposals load
□ Vote on proposal — tx confirmed, +25 XP shown
□ View public profile page
□ All loading/skeleton states shown correctly
□ Error states shown for unregistered wallet
□ Mobile layout works on 375px
```

---

## Quick Reference: Development Commands

```bash
cd website

# Start dev server
pnpm dev

# Type check
pnpm tsc --noEmit

# Build for production
pnpm build

# Deploy to Vercel
vercel --prod
```

---

## Dependency Graph

```
Phase 0 → All other phases depend on this
Phase 1 → Phases 3-8 all use layout
Phase 2 → Phases 3-8 all use hooks
Phase 3 → No dependencies on 4-8
Phase 4 → Phase 2 (hooks)
Phase 5 → Phases 1, 2
Phase 6 → Phases 1, 2
Phase 7 → Phases 1, 2
Phase 8 → Phases 1, 2
Phase 9 → All phases
Phase 10 → All phases complete
```
