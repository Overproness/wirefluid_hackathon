25 transactions executed on WireFluid Testnet — all successful. Gas cost: only 0.155 WIRE out of your 20.

Deployed Contracts (6)
Contract Address
FanToken (ERC-20) 0x8Ec5cD1A9b0D98429E91F296B0c7acAd329545d3
FanIdentity 0xc94d28025e2123A65f70594b379A79cBaA64AE93
TicketFactory (ERC-1155) 0x5fb18Edd5340EAeB6AeaD2a66B8491B16F71b9dd
RevenueSplitter 0xf2407E277497c0A78cbC544550b76172A1ff163d
ContentManager (ERC-721) 0xB3C42f652639272A6D8d297c8A2894182fC46bAC
PSLGovernor (DAO) 0x1b8b0eA5600354E3e643c52237a4e080aE732DA1
Key Pillar Tx Hashes
Pillar 1 — Anti-Scalp Ticketing:

Create Match: 0xb8ca5b5a...02cad0f
Buy Ticket: 0x4da2d22a...5094e04
List for Resale (110% cap enforced): 0x0fab14a3...fa192c3
Check-In (+100 XP): 0x71147991...12ead8d
Pillar 2 — Fan Identity & Loyalty:

Register: 0x819c7290...551832c
XP accumulates across all pillars (175 XP total)
Pillar 3 — Content Monetization:

Submit Content: 0x41a4e6e9...1238d0e
Approve (mint NFT + revenue split): 0x6ba51563...d5bf4d706cf
Sponsor (0.01 WIRE deposited): 0xb8a51192...6818fe8e3f4
Claim Revenue (0.005 WIRE = 50% share): 0x01db0ad7...f3f43561
Pillar 4 — DAO Governance:

Create MVP Vote Proposal: 0xe938b219...af58a6c137
Cast Vote (Shaheen Afridi): 0x00fd242f...23616d17a54
All data is saved in deployments.json.

One remaining action: After 1 hour from now, run npx hardhat run scripts/finalize-dao.ts --network wirefluidTestnet to finalize and execute the DAO proposal — that will add 1-2 more tx hashes proving the full governance lifecycle.
