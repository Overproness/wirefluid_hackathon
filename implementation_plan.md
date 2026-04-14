# PSL SuperApp — Implementation Plan

## Project Name: **CricketChain** (working title)

A unified on-chain PSL fan ecosystem combining anti-scalp ticketing, fan identity/loyalty, content monetization with revenue splitting, and fan governance (DAO). All deployed on WireFluid Testnet.

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CricketChain Ecosystem                        │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │  Ticketing   │  │ Fan Identity │  │  Content    │  │    DAO    │ │
│  │  (Anti-     │  │  & Loyalty   │  │ Monetization│  │ (Fan Gov) │ │
│  │   Scalp)    │  │   System     │  │  & Revenue  │  │           │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘  └─────┬─────┘ │
│         │                │                  │               │       │
│         └────────────────┼──────────────────┼───────────────┘       │
│                          │                  │                       │
│                   ┌──────┴──────┐    ┌──────┴──────┐                │
│                   │  FanToken   │    │  Treasury   │                │
│                   │  (ERC-20)   │    │  Contract   │                │
│                   └─────────────┘    └─────────────┘                │
│                                                                      │
│  Chain: WireFluid Testnet | Chain ID: 92533 | Solidity ^0.8.20      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Four Pillars

### Pillar 1: Anti-Scalp Ticketing System

**Problem:** PSL ticket scalping is rampant. Tickets are resold at 3-10x original price.

**Solution:** NFT-based tickets with enforced resale rules at the smart contract level.

**Core Mechanics:**
- Match organizers (admin role) create ticket batches per match (ERC-1155, since tickets within a category are fungible — e.g., "Enclosure A, Match 5")
- Each ticket has: `matchId`, `category`, `originalPrice`, `maxResalePrice` (e.g., 110% of original)
- Resale is ONLY possible through the contract's built-in marketplace — direct ERC-1155 transfers are blocked for ticket tokens (override `_update` to enforce)
- On resale, the contract enforces: price <= maxResalePrice, royalty split (e.g., 5% to PSL treasury, 2% to platform)
- Tickets can be "checked in" (burned or marked used) at the venue — only the contract admin can mark attendance
- Checking in earns loyalty points (ties into Pillar 2)

**Why ERC-1155 over ERC-721:**
- Multiple tickets of the same category are fungible (same metadata)
- Gas efficient for batch minting (a single match can have 30,000+ tickets)
- Still supports unique token IDs per category

**Contracts:**
- `TicketFactory.sol` — Creates ticket batches, enforces resale rules, handles marketplace
- Inherits: OpenZeppelin ERC1155, AccessControl, ReentrancyGuard

---

### Pillar 2: Fan Identity & Loyalty System

**Problem:** No unified fan identity across PSL — engagement is siloed across apps, stadiums, social media.

**Solution:** On-chain fan profiles with a points/XP system backed by an ERC-20 "FanToken."

**Core Mechanics:**
- Each fan registers once → gets an on-chain profile (mapping address → FanProfile struct)
- FanProfile stores: `username`, `totalXP`, `matchesAttended`, `votesParticipated`, `contentSubmitted`, `reputationTier` (Bronze/Silver/Gold/Platinum/Diamond)
- XP is earned by:
  - Attending a match (ticket check-in via Pillar 1) → 100 XP
  - Voting in DAO proposals (Pillar 4) → 25 XP per vote
  - Submitting approved content (Pillar 3) → 50 XP
  - Referring new fans → 10 XP
- FanToken (ERC-20) is distributed proportionally to XP — controlled mint by the system
- FanToken is governance weight in the DAO (Pillar 4)
- Tier thresholds: Bronze (0), Silver (500), Gold (2000), Platinum (5000), Diamond (15000)
- Higher tiers unlock: early ticket access, larger DAO vote weight multiplier, higher content revenue share

**Contracts:**
- `FanIdentity.sol` — Profile registry, XP tracking, tier calculation
- `FanToken.sol` — ERC-20 token, minted by FanIdentity based on XP events
- Inherits: OpenZeppelin ERC20, AccessControl

**Integration with Pillar 1:** When a ticket is checked in, TicketFactory calls FanIdentity to award XP.
**Integration with Pillar 4:** FanToken balance = voting power in DAO.

---

### Pillar 3: Content Monetization & Revenue Splitting

**Problem:** Fan-generated PSL content (highlights, edits, analysis) generates massive engagement but fans see zero revenue. Official accounts repost without credit.

**Solution:** A content submission and approval pipeline where approved content is minted as NFTs with automated revenue splitting.

**Core Mechanics:**
- Fans submit content (metadata: IPFS hash of video/image, title, description, tags) → stored on-chain as a `ContentSubmission`
- Moderators (PSL/Walee role) review and approve/reject submissions
- On approval:
  - Content is minted as an ERC-721 NFT owned by the platform treasury
  - A `RevenueSplit` is registered: e.g., 50% creator, 20% platform (Walee), 15% PSL, 15% ad sponsor pool
  - The NFT tracks total revenue earned
- Revenue flows in:
  - When brands/sponsors pay to feature content (sponsor pays WIRE to the NFT's revenue contract)
  - When the content is "tipped" by fans
  - Potential: ad insertion fees (Walee inserts sponsor branding → pays into the pool)
- Revenue is claimable by each party based on their split percentage
- The creator's FanIdentity gets XP for each approved submission (ties into Pillar 2)

**Revenue Split Model:**
```
Content Revenue (WIRE)
    │
    ├── 50% → Creator (fan who made the content)
    ├── 20% → Platform (Walee)
    ├── 15% → PSL Treasury
    └── 15% → Ad Sponsor Pool (redistributed to sponsors or burned)
```

**Contracts:**
- `ContentManager.sol` — Submission pipeline, approval flow, NFT minting
- `RevenueSplitter.sol` — Holds funds, tracks splits, allows claims
- Inherits: OpenZeppelin ERC721, AccessControl, ReentrancyGuard

**Integration with Pillar 2:** Approved content → XP to creator.

---

### Pillar 4: PSL DAO (Fan Governance)

**Problem:** Fans have no voice in PSL decisions. Awards are decided by panels, charity allocations are opaque.

**Solution:** A lightweight DAO where FanToken holders vote on proposals.

**Core Mechanics:**
- Proposal types:
  - `MVP_VOTE` — Vote for Man of the Match after each game
  - `FAN_AWARD` — Nominate and vote for fan awards (best crowd moment, best fan content, etc.)
  - `CHARITY` — Allocate a portion of treasury funds to verified charities
  - `GENERAL` — Open proposals (feature requests, sponsorship decisions, etc.)
- Proposal lifecycle: `Created → Active (voting open) → Succeeded/Defeated → Executed`
- Voting power = FanToken balance at proposal creation snapshot (prevents flash-loan attacks)
- Tier multiplier from Pillar 2 (Gold fans get 1.5x vote weight, Platinum 2x, Diamond 3x)
- Quorum: Configurable per proposal type (e.g., MVP votes need 10% of total supply participating)
- Execution: Admin executes successful proposals (initially centralized, can be made trustless later)
- Voting earns XP (ties back to Pillar 2)

**Contracts:**
- `PSLGovernor.sol` — Proposal creation, voting, execution
- Uses FanToken for vote weight + FanIdentity for tier multiplier
- Inherits: OpenZeppelin Governor pattern (simplified), AccessControl

**Integration with Pillar 2:** Voting → XP. Tier → vote multiplier.

---

## 3. Contract Architecture (Dependency Graph)

```
                    ┌──────────────┐
                    │   FanToken   │  (ERC-20)
                    │  (FanToken   │
                    │    .sol)     │
                    └──────┬───────┘
                           │ minted by
                           │
                    ┌──────┴───────┐
                    │ FanIdentity  │  (Registry + XP)
                    │ (FanIdentity │
                    │    .sol)     │
                    └──┬───┬───┬───┘
                       │   │   │
          ┌────────────┘   │   └────────────┐
          │ awards XP      │ awards XP      │ awards XP
          │ on check-in    │ on approval    │ on vote
          │                │                │
   ┌──────┴──────┐  ┌─────┴────────┐  ┌───┴──────────┐
   │TicketFactory│  │ContentManager│  │ PSLGovernor  │
   │   (ERC-1155 │  │  (ERC-721 +  │  │  (Governor   │
   │  + Market)  │  │   Pipeline)  │  │   + Voting)  │
   └─────────────┘  └──────┬───────┘  └──────────────┘
                           │
                    ┌──────┴───────┐
                    │RevenueSplit- │
                    │   ter.sol    │
                    └──────────────┘
```

---

## 4. Access Control Roles

| Role | Who | Permissions |
|------|-----|-------------|
| `DEFAULT_ADMIN_ROLE` | Deployer / Multisig | Full admin, role management |
| `ORGANIZER_ROLE` | PSL / Match organizers | Create ticket batches, check-in tickets |
| `MODERATOR_ROLE` | Walee / PSL content team | Approve/reject content submissions |
| `SPONSOR_ROLE` | Brand sponsors | Fund content revenue, create ad campaigns |
| `MINTER_ROLE` | FanIdentity contract | Mint FanTokens (only FanIdentity can call) |
| `GOVERNOR_ROLE` | PSLGovernor contract | Execute governance decisions |

---

## 5. Tech Stack

| Component | Technology |
|-----------|-----------|
| **Smart Contracts** | Solidity ^0.8.20 |
| **Framework** | Hardhat v3 + Ignition |
| **Testing** | Mocha + Chai + Hardhat Network |
| **Libraries** | OpenZeppelin Contracts v5 |
| **Chain** | WireFluid Testnet (Chain ID: 92533) |
| **RPC** | https://evm.wirefluid.com |
| **Explorer** | https://wirefluidscan.com |
| **Token Standard** | ERC-20 (FanToken), ERC-1155 (Tickets), ERC-721 (Content NFTs) |
| **Package Manager** | npm |
| **Language** | TypeScript (config, tests, scripts) |
| **Metadata Storage** | IPFS (content hashes stored on-chain) |

---

## 6. Contract Summary

| Contract | Standard | Purpose | Key Functions |
|----------|----------|---------|---------------|
| `FanToken.sol` | ERC-20 | Governance + reward token | `mint`, `burn`, `balanceOf` |
| `FanIdentity.sol` | Custom | Fan profiles, XP, tiers | `register`, `awardXP`, `getTier`, `getProfile` |
| `TicketFactory.sol` | ERC-1155 | Anti-scalp tickets + marketplace | `createMatch`, `mintTickets`, `buyTicket`, `resellTicket`, `checkIn` |
| `ContentManager.sol` | ERC-721 | Content submission + approval + NFT | `submitContent`, `approveContent`, `rejectContent` |
| `RevenueSplitter.sol` | Custom | Revenue distribution | `depositRevenue`, `claimRevenue`, `getClaimable` |
| `PSLGovernor.sol` | Custom | Fan governance / DAO | `createProposal`, `vote`, `executeProposal` |

**Total: 6 contracts**

---

## 7. Deployment Order

Contracts must be deployed in dependency order:

```
1. FanToken.sol           ← no dependencies
2. FanIdentity.sol        ← needs FanToken address (to mint tokens)
3. TicketFactory.sol      ← needs FanIdentity address (to award XP on check-in)
4. RevenueSplitter.sol    ← no dependencies (standalone)
5. ContentManager.sol     ← needs FanIdentity address + RevenueSplitter address
6. PSLGovernor.sol        ← needs FanToken + FanIdentity address

Post-deployment setup:
- Grant MINTER_ROLE on FanToken to FanIdentity contract
- Grant XP_AWARDER_ROLE on FanIdentity to TicketFactory, ContentManager, PSLGovernor
- Grant GOVERNOR_ROLE on relevant contracts to PSLGovernor
```

---

## 8. Key Design Decisions

### Why not Soulbound Tokens (SBTs) for tickets?
SBTs can't be resold at all. We WANT controlled resale — the anti-scalping mechanic is the enforced price ceiling, not transfer prohibition. Controlled resale is more realistic and user-friendly.

### Why ERC-1155 for tickets instead of ERC-721?
Tickets within the same category (e.g., "General Stand, Match 12") are functionally identical. ERC-1155 allows batch minting of 10,000 identical tickets in one transaction. ERC-721 would require 10,000 individual mints — prohibitively expensive.

### Why a separate RevenueSplitter contract?
Separation of concerns. ContentManager handles the content pipeline and NFT logic. RevenueSplitter handles money. This makes each contract simpler, more auditable, and upgradeable independently.

### Why snapshot-based voting instead of live balance?
Prevents governance attacks where someone buys tokens, votes, then sells. The snapshot captures balances at proposal creation time.

### Why not use OpenZeppelin Governor directly?
OZ Governor is heavyweight and designed for protocol governance. Our DAO is lightweight (fan votes, not treasury management). A simplified governor keeps gas costs low and code auditable within hackathon timeframe.

---

## 9. PSL / Hackathon Alignment

| Hackathon Feature | How We Hit It |
|-------------------|---------------|
| **PSL Focus (3x multiplier)** | Every feature is PSL-specific: match tickets, player MVPs, cricket highlights |
| **WireFluid Testnet usage** | All contracts deployed and demoed on WireFluid testnet |
| **Fast Transactions** | Revenue claims, ticket purchases, and votes all leverage ~5s finality |
| **Low Fees** | Batch minting (ERC-1155), minimal storage writes, optimized gas |
| **Frictionless Monetization** | Content → Approval → Revenue split — fully automated on-chain |
| **Licensing** | Content NFTs represent licensed fan content with enforced splits |
| **Local Payments** | WIRE-denominated ticket purchases and content tips |
| **Creator Economy (Walee)** | Walee is built into the revenue split as the platform layer |

---

## 10. Demo Flow (Hackathon Pitch)

```
1. Admin creates a PSL match: "Lahore Qalandars vs Islamabad United"
2. Admin mints 100 tickets (General: 0.1 WIRE, VIP: 0.5 WIRE)
3. Fan A registers on FanIdentity → gets profile
4. Fan A buys a ticket → WIRE transferred, ticket minted to their wallet
5. Fan B tries to scalp at 3x price → CONTRACT REJECTS (max 110%)
6. Fan A attends match → organizer checks them in → +100 XP → tier upgrade
7. Fan A submits a highlight clip (IPFS hash) → moderator approves
8. Content minted as NFT → revenue split registered
9. Sponsor funds the content with 1 WIRE → auto-split to creator/platform/PSL
10. Fan A claims their 50% share → 0.5 WIRE received
11. After match: DAO proposal "MVP Vote: Shaheen or Babar?"
12. Fans vote with FanTokens (weighted by tier)
13. Proposal passes → result recorded on-chain
14. Fan A earned: ticket, XP, FanTokens, content revenue, DAO participation
```

---

## 11. Scope Boundaries (What We're NOT Building)

- **No frontend** (for now — scripts and tests demonstrate all functionality)
- **No real IPFS pinning** (we'll use mock IPFS hashes in tests, can add Pinata later)
- **No real oracle for match data** (admin inputs match results manually)
- **No upgradeable proxies** (unnecessary complexity for hackathon)
- **No cross-chain IBC** (WireFluid IBC is TBD per their docs)
- **No token sale/ICO mechanics** (FanToken is earned, not bought)
