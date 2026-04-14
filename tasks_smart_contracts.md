# CricketChain — Step-by-Step Task List

Each task is a concrete, actionable step. Complete them in order.

---

## Phase 0: Project Setup

### Task 0.1 — Initialize Hardhat v3 Project

```
1. Create project directory: mkdir cricketchain && cd cricketchain
2. Run: npx hardhat --init
3. Select: hardhat-3 → . (current dir) → TypeScript + Mocha + Ethers.js
4. Verify structure: contracts/, ignition/modules/, test/, hardhat.config.ts
```

### Task 0.2 — Install Dependencies

```
npm install @openzeppelin/contracts
npm install dotenv
```

### Task 0.3 — Configure Hardhat for WireFluid

Edit `hardhat.config.ts`:

- Add wirefluidTestnet network:
  - type: "http"
  - chainType: "l1"
  - url: process.env.WIREFLUID_RPC_URL (https://evm.wirefluid.com)
  - chainId: 92533
  - accounts: [process.env.PRIVATE_KEY]
- Set solidity version: 0.8.20
- Enable optimizer: runs 200

### Task 0.4 — Create .env File

```
WIREFLUID_RPC_URL=https://evm.wirefluid.com
PRIVATE_KEY=<your-testnet-private-key>
```

Add `.env` to `.gitignore`.

### Task 0.5 — Clean Up Boilerplate

```
Remove contracts/Counter.sol
Remove ignition/modules/Counter.ts
Remove test/Counter.ts
```

### Task 0.6 — Create Directory Structure

```
contracts/
├── FanToken.sol
├── FanIdentity.sol
├── TicketFactory.sol
├── ContentManager.sol
├── RevenueSplitter.sol
└── PSLGovernor.sol

test/
├── FanToken.test.ts
├── FanIdentity.test.ts
├── TicketFactory.test.ts
├── ContentManager.test.ts
├── RevenueSplitter.test.ts
├── PSLGovernor.test.ts
└── Integration.test.ts

ignition/modules/
└── CricketChain.ts

scripts/
└── demo.ts
```

---

## Phase 1: FanToken (ERC-20)

### Task 1.1 — Write FanToken.sol

```solidity
Contract: FanToken
Inherits: ERC20, AccessControl

State:
- MINTER_ROLE (bytes32)

Constructor:
- name: "PSL Fan Token"
- symbol: "FAN"
- Grant DEFAULT_ADMIN_ROLE to deployer

Functions:
- mint(address to, uint256 amount) → onlyRole(MINTER_ROLE)
- burn(uint256 amount) → public (anyone can burn their own)
```

### Task 1.2 — Write FanToken Tests

```
Test cases:
- Deployment sets correct name and symbol
- Deployer has DEFAULT_ADMIN_ROLE
- MINTER_ROLE can mint tokens
- Non-MINTER cannot mint (should revert)
- Users can burn their own tokens
- Total supply updates correctly on mint/burn
```

### Task 1.3 — Compile and Run Tests

```
npx hardhat compile
npx hardhat test test/FanToken.test.ts
```

---

## Phase 2: FanIdentity (Profile + XP + Tiers)

### Task 2.1 — Write FanIdentity.sol

```solidity
Contract: FanIdentity
Inherits: AccessControl

Structs:
- FanProfile {
    string username;
    uint256 totalXP;
    uint256 matchesAttended;
    uint256 votesParticipated;
    uint256 contentSubmitted;
    uint256 registeredAt;
    bool exists;
  }

Enums:
- Tier { Bronze, Silver, Gold, Platinum, Diamond }

State:
- XP_AWARDER_ROLE (bytes32)
- fanTokenAddress (address, immutable)
- mapping(address => FanProfile) profiles
- address[] allFans (for enumeration)
- Tier thresholds: Bronze=0, Silver=500, Gold=2000, Platinum=5000, Diamond=15000
- XP-to-token ratio: 1 XP = 1e18 FanToken (1:1, adjustable)

Constructor:
- Takes FanToken contract address
- Grant DEFAULT_ADMIN_ROLE to deployer

Functions:
- register(string username)
    → Require: not already registered, username not empty
    → Create FanProfile, push to allFans array
    → Emit FanRegistered(address, username)

- awardXP(address fan, uint256 amount, string reason) → onlyRole(XP_AWARDER_ROLE)
    → Require: fan is registered
    → Increment totalXP
    → Mint corresponding FanTokens via FanToken.mint()
    → Emit XPAwarded(address, amount, reason)

- getProfile(address fan) → view, returns FanProfile
- getTier(address fan) → view, returns Tier enum
- getTierMultiplier(address fan) → view, returns uint256
    → Bronze: 100 (1x), Silver: 120 (1.2x), Gold: 150, Platinum: 200, Diamond: 300
    → Returned as basis points (100 = 1x) for integer math

- getVoteWeight(address fan) → view
    → Returns: FanToken.balanceOf(fan) * getTierMultiplier(fan) / 100

- incrementMatchesAttended(address fan) → onlyRole(XP_AWARDER_ROLE)
- incrementVotesParticipated(address fan) → onlyRole(XP_AWARDER_ROLE)
- incrementContentSubmitted(address fan) → onlyRole(XP_AWARDER_ROLE)

- totalFans() → view, returns allFans.length
```

### Task 2.2 — Write FanIdentity Tests

```
Test cases:
- Can register a new fan
- Cannot register twice
- Cannot register with empty username
- XP_AWARDER can award XP
- Non-XP_AWARDER cannot award XP
- FanTokens are minted when XP is awarded
- Tier calculation is correct at each boundary
- Tier multiplier returns correct values
- Vote weight = token balance * tier multiplier / 100
- Profile data is updated correctly
- totalFans() increments on registration
```

### Task 2.3 — Compile and Run Tests

```
npx hardhat compile
npx hardhat test test/FanIdentity.test.ts
```

---

## Phase 3: TicketFactory (Anti-Scalp ERC-1155)

### Task 3.1 — Write TicketFactory.sol

```solidity
Contract: TicketFactory
Inherits: ERC1155, AccessControl, ReentrancyGuard

Structs:
- Match {
    uint256 matchId;
    string name;           // e.g., "LQ vs IU - Match 5"
    uint256 date;          // unix timestamp
    bool active;
  }

- TicketCategory {
    uint256 tokenId;       // ERC-1155 token ID
    uint256 matchId;
    string categoryName;   // e.g., "General", "Enclosure", "VIP"
    uint256 price;         // in wei (WIRE)
    uint256 maxResalePrice;// enforced ceiling (e.g., 110% of price)
    uint256 totalSupply;
    uint256 sold;
  }

- Listing {
    address seller;
    uint256 tokenId;
    uint256 price;
    bool active;
  }

State:
- ORGANIZER_ROLE (bytes32)
- fanIdentityAddress (address, immutable)
- matchCount (uint256)
- tokenIdCounter (uint256)
- mapping(uint256 => Match) matches
- mapping(uint256 => TicketCategory) categories  // tokenId → category
- mapping(uint256 => mapping(address => bool)) checkedIn  // tokenId → address → bool
- Listing[] listings
- mapping(uint256 => uint256) listingByTokenAndSeller  // for lookup
- uint256 constant RESALE_ROYALTY_BPS = 700  // 7% total royalty on resale
- address treasury  // receives royalties

Constructor:
- Takes FanIdentity address, treasury address
- URI: "" (metadata not critical for hackathon)
- Grant DEFAULT_ADMIN_ROLE and ORGANIZER_ROLE to deployer

Functions:
- createMatch(string name, uint256 date) → onlyRole(ORGANIZER_ROLE)
    → Creates Match struct, increments matchCount
    → Emit MatchCreated(matchId, name, date)

- createTicketCategory(
    uint256 matchId, string categoryName, uint256 price,
    uint256 maxResalePriceBPS, uint256 supply
  ) → onlyRole(ORGANIZER_ROLE)
    → maxResalePrice = price * maxResalePriceBPS / 10000
    → Creates TicketCategory, mints `supply` tokens to the CONTRACT itself
    → Emit CategoryCreated(tokenId, matchId, categoryName, price, supply)

- buyTicket(uint256 tokenId) → payable, nonReentrant
    → Require: msg.value == category.price, tickets available (sold < totalSupply)
    → Transfer 1 token from contract to buyer
    → Increment sold counter
    → Send WIRE to treasury
    → Emit TicketPurchased(tokenId, buyer, price)

- listForResale(uint256 tokenId, uint256 price) → nonReentrant
    → Require: caller owns at least 1 of tokenId
    → Require: price <= category.maxResalePrice
    → Require: not already listed
    → Transfer token from seller to contract (escrow)
    → Create Listing
    → Emit TicketListed(listingId, tokenId, seller, price)

- buyResaleTicket(uint256 listingId) → payable, nonReentrant
    → Require: msg.value == listing.price, listing.active
    → Calculate royalty: price * RESALE_ROYALTY_BPS / 10000
    → Send (price - royalty) to seller
    → Send royalty to treasury
    → Transfer token from contract to buyer
    → Mark listing inactive
    → Emit TicketResold(listingId, tokenId, buyer, price)

- cancelListing(uint256 listingId) → nonReentrant
    → Require: caller is original seller, listing active
    → Return token to seller, mark listing inactive

- checkIn(uint256 tokenId, address fan) → onlyRole(ORGANIZER_ROLE)
    → Require: fan owns token, not already checked in
    → Mark checked in
    → Call FanIdentity.awardXP(fan, 100, "Match Attendance")
    → Call FanIdentity.incrementMatchesAttended(fan)
    → Emit CheckedIn(tokenId, fan)

- Override _update (ERC1155 hook):
    → Block direct transfers between non-zero addresses (peer-to-peer)
    → Only allow: mint (from=0), contract escrow transfers, burn
    → This forces all resales through the marketplace

Helpers:
- getMatch(uint256 matchId) → view
- getCategory(uint256 tokenId) → view
- getListing(uint256 listingId) → view
- isCheckedIn(uint256 tokenId, address fan) → view
```

### Task 3.2 — Write TicketFactory Tests

```
Test cases:
- Organizer can create a match
- Organizer can create ticket categories for a match
- Fan can buy a ticket at the correct price
- Wrong price reverts
- Sold-out tickets revert
- Direct token transfer between users is BLOCKED
- Fan can list ticket for resale at ≤ maxResalePrice
- Listing above maxResalePrice reverts
- Buyer can purchase resale ticket
- Royalty is correctly split on resale
- Seller receives (price - royalty) on resale
- Seller can cancel listing and get ticket back
- Organizer can check in a fan
- Check-in awards XP via FanIdentity
- Check-in for non-ticket-holder reverts
- Double check-in reverts
```

### Task 3.3 — Compile and Run Tests

```
npx hardhat compile
npx hardhat test test/TicketFactory.test.ts
```

---

## Phase 4: RevenueSplitter

### Task 4.1 — Write RevenueSplitter.sol

```solidity
Contract: RevenueSplitter
Inherits: AccessControl, ReentrancyGuard

Structs:
- Split {
    uint256 contentId;     // links to ContentManager NFT token ID
    address creator;
    address platform;      // Walee
    address pslTreasury;
    uint256 creatorBPS;    // e.g., 5000 = 50%
    uint256 platformBPS;   // e.g., 2000 = 20%
    uint256 pslBPS;        // e.g., 1500 = 15%
    uint256 sponsorPoolBPS;// e.g., 1500 = 15%
    uint256 totalDeposited;
  }

State:
- MANAGER_ROLE (bytes32) — only ContentManager can create splits
- mapping(uint256 => Split) splits  // contentId → Split
- mapping(uint256 => mapping(address => uint256)) claimed  // contentId → address → amount claimed
- address sponsorPool  // address that receives sponsor pool share
- uint256 constant BPS_DENOMINATOR = 10000

Constructor:
- Takes platform address, pslTreasury address, sponsorPool address
- Grant DEFAULT_ADMIN_ROLE to deployer

Functions:
- createSplit(
    uint256 contentId, address creator,
    uint256 creatorBPS, uint256 platformBPS, uint256 pslBPS, uint256 sponsorPoolBPS
  ) → onlyRole(MANAGER_ROLE)
    → Require: creatorBPS + platformBPS + pslBPS + sponsorPoolBPS == 10000
    → Store Split
    → Emit SplitCreated(contentId, creator)

- depositRevenue(uint256 contentId) → payable
    → Require: split exists, msg.value > 0
    → Increment totalDeposited
    → Emit RevenueDeposited(contentId, msg.sender, msg.value)

- getClaimable(uint256 contentId, address claimant) → view
    → Calculate: totalDeposited * claimantBPS / BPS_DENOMINATOR - claimed
    → Return claimable amount

- claimRevenue(uint256 contentId) → nonReentrant
    → Calculate claimable for msg.sender (check if they're creator, platform, pslTreasury, or sponsorPool)
    → Require: claimable > 0
    → Update claimed mapping
    → Transfer WIRE to msg.sender
    → Emit RevenueClaimed(contentId, msg.sender, amount)

- getContentRevenue(uint256 contentId) → view
    → Returns Split details + totalDeposited + claimed by each party
```

### Task 4.2 — Write RevenueSplitter Tests

```
Test cases:
- Manager can create a split
- BPS must sum to 10000
- Anyone can deposit revenue for a content ID
- Creator can claim their share
- Platform can claim their share
- PSL treasury can claim share
- Sponsor pool can claim share
- Cannot claim more than entitled
- Cannot claim with zero balance
- Multiple deposits accumulate correctly
- Partial claims work (deposit, claim half events, deposit more, claim rest)
```

### Task 4.3 — Compile and Run Tests

```
npx hardhat compile
npx hardhat test test/RevenueSplitter.test.ts
```

---

## Phase 5: ContentManager (ERC-721 + Pipeline)

### Task 5.1 — Write ContentManager.sol

```solidity
Contract: ContentManager
Inherits: ERC721, AccessControl, ReentrancyGuard

Enums:
- ContentStatus { Pending, Approved, Rejected }

Structs:
- ContentSubmission {
    uint256 contentId;
    address creator;
    string metadataURI;    // IPFS hash
    string title;
    string description;
    ContentStatus status;
    uint256 submittedAt;
    uint256 reviewedAt;
  }

State:
- MODERATOR_ROLE (bytes32)
- fanIdentityAddress (address, immutable)
- revenueSplitterAddress (address, immutable)
- contentCount (uint256)
- mapping(uint256 => ContentSubmission) submissions
- Default split BPS: creator=5000, platform=2000, psl=1500, sponsor=1500

Constructor:
- Takes FanIdentity address, RevenueSplitter address
- name: "PSL Content", symbol: "PSLC"
- Grant DEFAULT_ADMIN_ROLE and MODERATOR_ROLE to deployer

Functions:
- submitContent(string metadataURI, string title, string description)
    → Require: caller is registered fan (check FanIdentity)
    → Require: metadataURI not empty
    → Create ContentSubmission with status = Pending
    → Increment contentCount
    → Emit ContentSubmitted(contentId, creator, title)

- approveContent(uint256 contentId) → onlyRole(MODERATOR_ROLE)
    → Require: status == Pending
    → Set status = Approved, set reviewedAt
    → Mint ERC-721 NFT (tokenId = contentId) to the contract itself (platform holds it)
    → Create revenue split via RevenueSplitter.createSplit()
    → Award XP: FanIdentity.awardXP(creator, 50, "Content Approved")
    → Increment FanIdentity.incrementContentSubmitted(creator)
    → Emit ContentApproved(contentId, creator)

- rejectContent(uint256 contentId) → onlyRole(MODERATOR_ROLE)
    → Require: status == Pending
    → Set status = Rejected, set reviewedAt
    → Emit ContentRejected(contentId, creator)

- tipContent(uint256 contentId) → payable, nonReentrant
    → Require: status == Approved, msg.value > 0
    → Forward msg.value to RevenueSplitter.depositRevenue(contentId)
    → Emit ContentTipped(contentId, msg.sender, msg.value)

- sponsorContent(uint256 contentId) → payable, nonReentrant
    → Same as tip but emits SponsorFunded event (for analytics)
    → Forward to RevenueSplitter

- getSubmission(uint256 contentId) → view
- getSubmissionsByCreator(address creator) → view (return array of content IDs)
- getPendingSubmissions() → view (for moderator dashboard)

- updateDefaultSplitBPS(
    uint256 creatorBPS, uint256 platformBPS, uint256 pslBPS, uint256 sponsorBPS
  ) → onlyRole(DEFAULT_ADMIN_ROLE)
    → Require: sum == 10000
    → Update default split percentages
```

### Task 5.2 — Write ContentManager Tests

```
Test cases:
- Registered fan can submit content
- Unregistered user cannot submit
- Empty metadataURI reverts
- Moderator can approve content
- Approval mints an NFT
- Approval creates a revenue split
- Approval awards XP to creator
- Moderator can reject content
- Cannot approve/reject already reviewed content
- Anyone can tip approved content
- Tip funds reach RevenueSplitter
- Cannot tip pending/rejected content
- Sponsor can fund content
- getPendingSubmissions returns correct IDs
- Admin can update default split BPS
```

### Task 5.3 — Compile and Run Tests

```
npx hardhat compile
npx hardhat test test/ContentManager.test.ts
```

---

## Phase 6: PSLGovernor (DAO)

### Task 6.1 — Write PSLGovernor.sol

```solidity
Contract: PSLGovernor
Inherits: AccessControl

Enums:
- ProposalType { MVP_VOTE, FAN_AWARD, CHARITY, GENERAL }
- ProposalState { Active, Succeeded, Defeated, Executed }

Structs:
- Proposal {
    uint256 proposalId;
    ProposalType proposalType;
    string title;
    string description;
    string[] options;          // e.g., ["Shaheen Afridi", "Babar Azam", "Shadab Khan"]
    uint256 startTime;
    uint256 endTime;
    address proposer;
    ProposalState state;
    uint256 totalVotes;
  }

State:
- PROPOSER_ROLE (bytes32)
- fanTokenAddress (address, immutable)
- fanIdentityAddress (address, immutable)
- proposalCount (uint256)
- mapping(uint256 => Proposal) proposals
- mapping(uint256 => mapping(uint256 => uint256)) optionVotes  // proposalId → optionIndex → vote weight
- mapping(uint256 => mapping(address => bool)) hasVoted         // proposalId → voter → voted?
- mapping(uint256 => mapping(address => uint256)) voterSnapshots // proposalId → voter → balance at creation
- uint256 constant VOTING_PERIOD = 1 days  // configurable
- uint256 quorumBPS = 1000  // 10% of total supply must participate

Constructor:
- Takes FanToken address, FanIdentity address
- Grant DEFAULT_ADMIN_ROLE and PROPOSER_ROLE to deployer

Functions:
- createProposal(
    ProposalType proposalType, string title, string description,
    string[] options, uint256 duration
  ) → onlyRole(PROPOSER_ROLE)
    → Require: options.length >= 2
    → Require: duration >= 1 hour, <= 7 days
    → Create Proposal, state = Active
    → startTime = block.timestamp, endTime = startTime + duration
    → Emit ProposalCreated(proposalId, title, proposalType, options)

- vote(uint256 proposalId, uint256 optionIndex) → nonReentrant
    → Require: proposal is Active
    → Require: block.timestamp between startTime and endTime
    → Require: caller has not voted
    → Require: caller is registered fan
    → Calculate vote weight using FanIdentity.getVoteWeight(msg.sender)
    → Require: weight > 0
    → Record vote: optionVotes[proposalId][optionIndex] += weight
    → Mark hasVoted
    → Increment totalVotes by weight
    → Award XP: FanIdentity.awardXP(msg.sender, 25, "DAO Vote")
    → Increment FanIdentity.incrementVotesParticipated(msg.sender)
    → Emit Voted(proposalId, voter, optionIndex, weight)

- finalizeProposal(uint256 proposalId) → onlyRole(DEFAULT_ADMIN_ROLE)
    → Require: block.timestamp > endTime
    → Require: state == Active
    → Check quorum: totalVotes >= FanToken.totalSupply() * quorumBPS / 10000
    → If quorum met: state = Succeeded, else: state = Defeated
    → Emit ProposalFinalized(proposalId, state, winningOption, winningVotes)

- executeProposal(uint256 proposalId) → onlyRole(DEFAULT_ADMIN_ROLE)
    → Require: state == Succeeded
    → Set state = Executed
    → Emit ProposalExecuted(proposalId)
    → (No on-chain action — results are informational for hackathon scope)

- getProposal(uint256 proposalId) → view
- getOptionVotes(uint256 proposalId, uint256 optionIndex) → view
- getWinningOption(uint256 proposalId) → view
    → Returns index of option with most votes
- hasUserVoted(uint256 proposalId, address voter) → view
- setQuorum(uint256 newQuorumBPS) → onlyRole(DEFAULT_ADMIN_ROLE)
```

### Task 6.2 — Write PSLGovernor Tests

```
Test cases:
- Proposer can create proposal with valid options
- Cannot create with < 2 options
- Cannot create with invalid duration
- Registered fan can vote
- Unregistered user cannot vote
- Cannot vote twice on same proposal
- Vote weight reflects FanToken balance * tier multiplier
- Cannot vote after endTime
- Admin can finalize after endTime
- Cannot finalize before endTime
- Proposal succeeds if quorum met
- Proposal defeated if quorum not met
- Admin can execute succeeded proposal
- Cannot execute defeated proposal
- Voting awards XP
- getWinningOption returns correct winner
```

### Task 6.3 — Compile and Run Tests

```
npx hardhat compile
npx hardhat test test/PSLGovernor.test.ts
```

---

## Phase 7: Integration Testing

### Task 7.1 — Write Full Integration Test

```
Test file: test/Integration.test.ts

End-to-end scenario:
1. Deploy all 6 contracts
2. Set up roles (MINTER_ROLE, XP_AWARDER_ROLE, MANAGER_ROLE)
3. Register 3 fans
4. Create a PSL match + ticket categories
5. Fans buy tickets
6. Attempt scalping (verify it fails)
7. Check in fans at match
8. Verify XP awarded, tiers updated
9. Fan submits content → moderator approves
10. Sponsor funds content → revenue deposited
11. Creator claims revenue share
12. Create MVP vote proposal
13. All fans vote
14. Finalize proposal → verify winner
15. Verify all XP, FanTokens, and tiers across the journey
```

### Task 7.2 — Run Full Test Suite

```
npx hardhat test
```

---

## Phase 8: Deployment

### Task 8.1 — Write Ignition Module

```
File: ignition/modules/CricketChain.ts

Deploy order:
1. FanToken
2. FanIdentity (param: FanToken address)
3. TicketFactory (param: FanIdentity address, treasury address)
4. RevenueSplitter (param: platform address, pslTreasury address, sponsorPool address)
5. ContentManager (param: FanIdentity address, RevenueSplitter address)
6. PSLGovernor (param: FanToken address, FanIdentity address)

Post-deploy calls (via afterDeploy or separate script):
- FanToken.grantRole(MINTER_ROLE, FanIdentity.address)
- FanIdentity.grantRole(XP_AWARDER_ROLE, TicketFactory.address)
- FanIdentity.grantRole(XP_AWARDER_ROLE, ContentManager.address)
- FanIdentity.grantRole(XP_AWARDER_ROLE, PSLGovernor.address)
- RevenueSplitter.grantRole(MANAGER_ROLE, ContentManager.address)
```

### Task 8.2 — Deploy to WireFluid Testnet

```
npx hardhat ignition deploy ignition/modules/CricketChain.ts --network wirefluidTestnet
```

### Task 8.3 — Record Deployed Addresses

Save all contract addresses in a `deployments.json` or note them down for verification.

---

## Phase 9: Post-Deployment Setup & Verification

### Task 9.1 — Run Post-Deployment Role Setup Script

```
File: scripts/setup-roles.ts

Execute the role grants listed in Task 8.1 against the deployed contracts.
```

### Task 9.2 — Write Demo Script

```
File: scripts/demo.ts

Automate the full demo flow:
1. Register fans
2. Create match + tickets
3. Buy tickets
4. Check in
5. Submit + approve content
6. Fund content
7. Claim revenue
8. Create + vote on MVP proposal
9. Finalize proposal
10. Print summary of all state

This script serves as both the demo and a live testnet integration test.
```

### Task 9.3 — Run Demo on Testnet

```
npx hardhat run scripts/demo.ts --network wirefluidTestnet
```

### Task 9.4 — Verify Contracts on WireScan

```
Flatten each contract (if needed):
npx hardhat flatten contracts/FanToken.sol > flat/FanToken.flat.sol

Submit to https://wirefluidscan.com for verification:
- Upload source or flattened file
- Set compiler version 0.8.20
- Set optimizer runs 200
- Provide constructor args (ABI-encoded)
```

---

## Phase 10: Polish (If Time Permits)

### Task 10.1 — Gas Optimization Review

- Check gas reports: `npx hardhat test --gas`
- Optimize hot paths (buyTicket, vote, claimRevenue)
- Consider packing struct fields for storage optimization

### Task 10.2 — Event Coverage

- Ensure every state change emits an event
- Events are critical for any future frontend or indexer

### Task 10.3 — Edge Case Hardening

- Test with zero values, max uint values
- Test reentrancy scenarios
- Test with expired matches / ended proposals

---

## Quick Reference: Compilation Order

When making changes, recompile with:

```
npx hardhat compile
```

Run specific tests:

```
npx hardhat test test/FanToken.test.ts
npx hardhat test test/FanIdentity.test.ts
npx hardhat test test/TicketFactory.test.ts
npx hardhat test test/RevenueSplitter.test.ts
npx hardhat test test/ContentManager.test.ts
npx hardhat test test/PSLGovernor.test.ts
npx hardhat test test/Integration.test.ts
```

Run all tests:

```
npx hardhat test
```

---

## Dependency Chain Summary

```
Task 0.x → Setup (do first)
Task 1.x → FanToken (no deps)
Task 2.x → FanIdentity (needs FanToken)
Task 3.x → TicketFactory (needs FanIdentity)
Task 4.x → RevenueSplitter (no contract deps, but designed for ContentManager)
Task 5.x → ContentManager (needs FanIdentity + RevenueSplitter)
Task 6.x → PSLGovernor (needs FanToken + FanIdentity)
Task 7.x → Integration (needs all)
Task 8.x → Deployment (needs all compiled + tested)
Task 9.x → Testnet verification (needs deployment)
Task 10.x → Polish (if time allows)
```
