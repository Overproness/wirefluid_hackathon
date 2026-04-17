# CricketChain — Web3 Fan Portal

A decentralized fan engagement platform built on the **WireFluid Testnet** for PSL (Pakistan Super League) cricket. CricketChain gives fans ownership over their experience through NFT ticketing, on-chain loyalty rewards, content monetization, and DAO governance.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
  - [Deployed Addresses](#deployed-addresses)
  - [Contract Descriptions](#contract-descriptions)
- [Frontend](#frontend)
  - [Pages & Features](#pages--features)
  - [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Smart Contracts (Hardhat)](#smart-contracts-hardhat)
  - [Website (Next.js)](#website-nextjs)
- [Network Details](#network-details)
- [Project Structure](#project-structure)

---

## Overview

CricketChain is built around four core pillars:

| Pillar                     | Description                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------- |
| **Anti-Scalp Ticketing**   | ERC-1155 NFT tickets with hard price caps, a 7% resale royalty, and on-chain check-in |
| **Fan Identity & Loyalty** | XP-based tier system (Bronze → Diamond) backed by the `$FAN` ERC-20 token             |
| **Content Monetization**   | Fan-submitted content minted as ERC-721 NFTs with on-chain revenue splitting          |
| **DAO Governance**         | Token-weighted voting on MVP awards, charity allocations, and stadium decisions       |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Next.js Frontend                   │
│  (wagmi + RainbowKit + TanStack Query + Framer Motion) │
└────────────────────┬────────────────────────────────┘
                     │ EVM JSON-RPC
┌────────────────────▼────────────────────────────────┐
│              WireFluid Testnet  (chainId 92533)      │
│                                                     │
│  FanToken ──────► FanIdentity ◄──── PSLGovernor     │
│                       ▲                             │
│  TicketFactory ───────┤                             │
│  ContentManager ──────┤                             │
│  RevenueSplitter ─────┘                             │
└─────────────────────────────────────────────────────┘
```

---

## Smart Contracts

### Deployed Addresses

> Network: **WireFluid Testnet** | Chain ID: `92533` | Deployed: `2026-04-14`

| Contract                 | Address                                      |
| ------------------------ | -------------------------------------------- |
| FanToken (ERC-20)        | `0x8Ec5cD1A9b0D98429E91F296B0c7acAd329545d3` |
| FanIdentity              | `0xc94d28025e2123A65f70594b379A79cBaA64AE93` |
| TicketFactory (ERC-1155) | `0x5fb18Edd5340EAeB6AeaD2a66B8491B16F71b9dd` |
| RevenueSplitter          | `0xf2407E277497c0A78cbC544550b76172A1ff163d` |
| ContentManager (ERC-721) | `0xB3C42f652639272A6D8d297c8A2894182fC46bAC` |
| PSLGovernor              | `0x1b8b0eA5600354E3e643c52237a4e080aE732DA1` |

View all contracts on [WireScan Explorer](https://wirescan.bonk.credit).

### Contract Descriptions

#### `FanToken` (ERC-20)

The `$FAN` utility token. Role-gated minting via `MINTER_ROLE`. Used for voting weight in the DAO and awarded as XP converts to tokens at a 1:1 ratio (1 XP = 1e18 FAN wei).

#### `FanIdentity`

On-chain fan profiles with an XP engine. Fans register a username and accumulate XP for actions (match attendance, votes, approved content). XP unlocks loyalty tiers:

| Tier     | XP Required |
| -------- | ----------- |
| Bronze   | 0           |
| Silver   | 500         |
| Gold     | 2,000       |
| Platinum | 5,000       |
| Diamond  | 15,000      |

#### `TicketFactory` (ERC-1155)

Creates matches and ticket categories. Enforces a hard `maxResalePrice` cap and charges a **7% royalty** on secondary sales routed to the treasury. Includes on-chain check-in that awards XP to the fan.

#### `RevenueSplitter`

Splits deposited revenue (in WIRE) across four parties — `creator`, `platform`, `pslTreasury`, and `sponsorPool` — using basis-point (BPS) percentages that must sum to 10,000.

#### `ContentManager` (ERC-721)

Fans submit content (as metadata URIs). Moderators approve or reject. Each approved piece is minted into an NFT for the creator and a corresponding revenue split is registered in `RevenueSplitter`.

#### `PSLGovernor`

Four proposal types: `MVP_VOTE`, `FAN_AWARD`, `CHARITY`, `GENERAL`. Vote weight combines `$FAN` token balance with on-chain XP tier multipliers. Voting earns XP.

---

## Frontend

### Pages & Features

| Route         | Feature                                                                |
| ------------- | ---------------------------------------------------------------------- |
| `/`           | Landing page — hero, platform pillars, live stats, leaderboard preview |
| `/dashboard`  | Fan profile, XP / tier status, `$FAN` balance, activity history        |
| `/tickets`    | Browse matches, buy NFT tickets, peer-to-peer resale marketplace       |
| `/content`    | Browse approved fan content, submit new content (form + IPFS URI)      |
| `/governance` | DAO proposal list, create proposals, cast weighted votes               |
| `/profile`    | Public fan profile viewer                                              |

### Tech Stack

| Layer           | Technology                                             |
| --------------- | ------------------------------------------------------ |
| Framework       | Next.js (App Router)                                   |
| Language        | TypeScript                                             |
| Styling         | Tailwind CSS v4 + shadcn/ui                            |
| Animations      | Framer Motion                                          |
| Web3            | wagmi v2 + viem v2                                     |
| Wallet UI       | RainbowKit v2 (MetaMask, OKX, Coinbase, WalletConnect) |
| Data Fetching   | TanStack Query v5                                      |
| Charts          | Recharts                                               |
| Icons           | Lucide React                                           |
| Notifications   | Sonner                                                 |
| Forms           | React Hook Form + Zod                                  |
| Package Manager | pnpm                                                   |

**Design system — Stadium Nocturne (dark theme)**

- Background: `#0c1324` / Surface: `#191f31`
- Primary (emerald): `#4edea3` / `#10b981`
- Secondary (amber/gold): `#ffb95f` / `#F59E0B`
- Tertiary (sky blue): `#7bd0ff` / `#38BDF8`
- Glass panels: `rgba(46,52,71,0.4)` + `backdrop-blur(20px)`
- Fonts: Space Grotesk (headlines), Inter (body), JetBrains Mono (data), Bebas Neue (display)

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- MetaMask or another EVM wallet pointed at WireFluid Testnet
- WIRE test tokens — get them from the [WireFluid Faucet](https://docs.wirefluid.com)

### Smart Contracts (Hardhat)

```bash
cd cricketchain

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to WireFluid Testnet (requires .env with PRIVATE_KEY)
npx hardhat run scripts/deploy-testnet.ts --network wirefluidTestnet
```

Create a `.env` file in `cricketchain/`:

```
PRIVATE_KEY=your_wallet_private_key
```

### Website (Next.js)

```bash
cd website

# Install dependencies
pnpm install

# Create environment file
cp .env.local.example .env.local
# Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
# Build for production
pnpm build
pnpm start
```

---

## Network Details

| Property       | Value                        |
| -------------- | ---------------------------- |
| Network Name   | WireFluid Testnet            |
| Chain ID       | `92533`                      |
| RPC URL        | `https://evm.wirefluid.com`  |
| Native Token   | WIRE                         |
| Block Explorer | https://wirescan.bonk.credit |

Add the network to MetaMask manually using the values above, or follow the [official guide](https://docs.wirefluid.com/adding-network-to-wallet).

---

## Project Structure

```
wirefluid_hackathon/
├── cricketchain/               # Hardhat smart contract project
│   ├── contracts/
│   │   ├── FanToken.sol        # ERC-20 $FAN token
│   │   ├── FanIdentity.sol     # Fan profiles + XP engine
│   │   ├── TicketFactory.sol   # ERC-1155 anti-scalp tickets
│   │   ├── RevenueSplitter.sol # On-chain revenue distribution
│   │   ├── ContentManager.sol  # ERC-721 fan content NFTs
│   │   └── PSLGovernor.sol     # DAO voting
│   ├── scripts/
│   │   ├── deploy-testnet.ts
│   │   ├── demo.ts
│   │   └── finalize-dao.ts
│   ├── test/                   # Hardhat tests for all contracts
│   ├── deployments.json        # Live contract addresses
│   └── hardhat.config.ts
├── website/                    # Next.js frontend
│   ├── app/                    # App Router pages
│   ├── components/             # React components
│   ├── hooks/                  # wagmi contract hooks
│   ├── lib/
│   │   ├── abis/               # Contract ABIs
│   │   ├── contracts.ts        # Contract instances
│   │   ├── constants.ts        # Tiers, XP thresholds, chain config
│   │   └── wagmi.ts            # Chain + wallet config
│   └── public/
├── designs/                    # UI design mockups (HTML)
├── documentation/              # WireFluid network docs
└── plans/                      # Implementation plans + task tracking
```

---

## License

MIT
