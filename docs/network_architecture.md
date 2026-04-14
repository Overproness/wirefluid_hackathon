---
title: Network Architecture
description: Comprehensive guide to WireFluid's technical architecture, consensus mechanism, and core components
---

# Network Architecture

WireFluid is a high-performance blockchain built as a standalone Cosmos SDK application chain with an integrated EVM (Ethereum Virtual Machine) execution layer. This unique architecture combines the speed and finality of Cosmos consensus with full Ethereum compatibility, enabling developers to deploy Solidity smart contracts while benefiting from instant finality and cross-chain interoperability.

---

## Architecture Overview

WireFluid operates as a unified blockchain stack with four distinct layers working together seamlessly:

```
                ┌───────────────────────────────────────────────────────────────┐
                │                     APPLICATION LAYER                         │
                │  DeFi Protocols • NFT Marketplaces • Payment Systems • DAOs   │
                └───────────────────────────────────────────────────────────────┘
                                            ↕
                ┌───────────────────────────────────────────────────────────────┐
                │                    EXECUTION LAYER (EVM)                      │
                │  • Solidity Smart Contracts        • Web3 API (JSON-RPC)      │
                │  • Ethereum Opcodes                • MetaMask Compatible      │
                │  • EVM State Machine               • Gas Metering             │
                └───────────────────────────────────────────────────────────────┘
                                            ↕
                ┌───────────────────────────────────────────────────────────────┐
                │                   COSMOS SDK MODULES                          │
                │  • Bank (Token Transfers)          • IBC (Cross-Chain)        │
                │  • Staking (Validator System)      • Governance (On-Chain)    │
                │  • Distribution (Rewards)          • Auth (Account System)    │
                └───────────────────────────────────────────────────────────────┘
                                            ↕
                ┌───────────────────────────────────────────────────────────────┐
                │                    CONSENSUS LAYER                            │
                │  CometBFT (Tendermint) • Instant Finality • BFT Security      │
                └───────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Consensus Layer: CometBFT

CometBFT (formerly Tendermint Core) is the Byzantine Fault Tolerant consensus engine that powers WireFluid's transaction ordering and finality.

#### Key Characteristics

| Feature                 | Description                                       |
| ----------------------- | ------------------------------------------------- |
| **Consensus Algorithm** | Byzantine Fault Tolerant (BFT) Proof-of-Stake     |
| **Block Time**          | Approximately 5 seconds (configurable)            |
| **Finality**            | Immediate economic finality (single-block commit) |
| **Validator Set**       | Stake-weighted, configurable maximum validators   |
| **Fork Resistance**     | No probabilistic finality - guaranteed finality   |

#### How It Works

1. **Block Proposal**: A validator proposes a new block based on stake weight
2. **Pre-Vote**: Validators broadcast pre-votes on the proposed block
3. **Pre-Commit**: If two-thirds or more validators pre-vote, they broadcast pre-commits
4. **Commit**: If two-thirds or more validators pre-commit, the block is finalized
5. **State Update**: All nodes update their state - no rollbacks possible

**Benefits:**

- **No Chain Reorganizations** - Once a block is committed, it's permanent
- **Fast Confirmation** - Transactions are final in approximately 5 seconds
- **Energy Efficient** - No mining, low computational requirements
- **Predictable Gas Fees** - No congestion-based gas spikes like Ethereum

**Key Difference from Ethereum:**  
Ethereum uses probabilistic finality (wait for multiple confirmations). WireFluid transactions are instantly final - once included in a block, they cannot be reversed.

---

### 2. Cosmos SDK Layer

The Cosmos SDK provides the core blockchain infrastructure and native modules that handle fundamental blockchain operations.

#### Core Modules

**Bank Module**

- Manages native token (WIRE) transfers
- Handles balances and accounts
- Supports multi-denomination tokens
- Enables atomic transfers

**Staking Module**

- Validator registration and management
- Delegated Proof-of-Stake (DPoS) implementation
- Slashing for misbehavior
- Validator set rotation

**Governance Module**

- On-chain parameter changes
- Community proposals and voting
- Protocol upgrades without hard forks
- Treasury management

**Distribution Module**

- Block rewards distribution
- Validator commission handling
- Delegator rewards calculation
- Fee distribution mechanism

**Auth Module**

- Account authentication
- Signature verification
- Nonce management
- Multi-signature support

**IBC Module (Inter-Blockchain Communication)**

- Cross-chain token transfers
- Interoperability with IBC-enabled Cosmos chains
- Trustless bridge protocol (light clients)
- Packet routing and verification
- Chain supports IBC-Go and Stargate (from chain config)

#### Module Interaction Flow

```
User Transaction → Auth (Verify) → Module Router
                                       ↓
                    ┌──────────────────┼──────────────────┐
                    ↓                  ↓                  ↓
              Bank Module        Staking Module    Governance Module
                    ↓                  ↓                  ↓
              State Change       State Change       State Change
                    ↓                  ↓                  ↓
                    └──────────────────┴──────────────────┘
                                       ↓
                            CometBFT Consensus
                                       ↓
                              Finalized Block
```

---

### 3. Execution Layer: EVM Integration

WireFluid embeds a full EVM (Ethereum Virtual Machine) that provides high compatibility with Ethereum smart contracts and tooling.

#### EVM Capabilities

**Smart Contract Execution**

- Supports all Solidity versions
- Compatible with Vyper and other EVM languages
- Runs existing Ethereum contracts without modification
- Executes EVM opcodes natively

**State Management**

- EVM account model (balance, nonce, code, storage) is preserved
- State data stored in Cosmos SDK's IAVL+ tree structure
- State transitions follow Ethereum semantics (CREATE, SELFDESTRUCT, SSTORE)
- Merkle proofs compatible with Ethereum light clients

**Storage Backend Architecture:**

- Uses IAVL+ (Cosmos) instead of Patricia Merkle Trie (Ethereum)
- State root calculation differs internally but provides equivalent security guarantees
- No separation between world state and contract storage - unified in IAVL+
- Maintains Ethereum-compatible account and storage semantics

**Gas Metering**

- EVM gas model natively supported
- Internally reconciled with Cosmos SDK gas accounting
- Predictable fee calculation based on computational cost

#### JSON-RPC API

WireFluid exposes standard Ethereum JSON-RPC at **https://evm.wirefluid.com**, making it compatible with Ethereum development tools and wallets (MetaMask, Hardhat, Foundry, etc.).

**Enabled Namespaces:**

- `eth` - Ethereum-compatible methods
- `net` - Network information
- `web3` - Web3 utility methods

```json
Available RPC Methods:
- eth_blockNumber          - Get latest block number
- eth_getBalance          - Get account balance
- eth_sendTransaction     - Send transaction
- eth_call                - Execute contract call
- eth_estimateGas         - Estimate gas usage
- eth_getTransactionReceipt - Get transaction status
- net_version             - Get chain ID
- web3_clientVersion      - Get client version
```

**Compatible Tools:**

- MetaMask, Rabby, Rainbow (Wallets)
- Hardhat, Foundry, Remix (Development)
- Ethers.js, Web3.js (Libraries)

---

### 4. Account System

WireFluid supports dual account formats to accommodate both Cosmos and Ethereum ecosystems.

#### Account Types

| Type                 | Format   | Example          | Use Case                     |
| -------------------- | -------- | ---------------- | ---------------------------- |
| **Cosmos Address**   | Bech32   | `wire1abc...xyz` | Native Cosmos SDK operations |
| **Ethereum Address** | Hex (0x) | `0x1234...5678`  | EVM transactions, MetaMask   |

**Address derivation:**

- Both addresses derive from the same private key (secp256k1)
- Cosmos Bech32 prefix: **wire** (e.g. `wire1...`, `wirevaloper...`)
- Ethereum format: 0x + 20 bytes (Keccak256 of pubkey)
- One account, two representations; compatible with Keplr (eth-secp256k1-cosmos) and MetaMask

**Bech32 prefixes (from chain):** `wire` (account), `wirepub` (account pubkey), `wirevaloper` (validator), `wirevalconspub` (validator consensus pubkey).

#### Technical Address Derivation

```
Private Key (secp256k1)
         ↓
    Public Key (33 bytes compressed)
         ↓
    ┌────────────────────────────┴─────────────────────────────┐
    ↓                                                           ↓
Cosmos Address                                          Ethereum Address
  ↓                                                              ↓
SHA256(pubkey)                                           Keccak256(pubkey[1:])
  ↓                                                              ↓
RIPEMD160(hash)                                          Last 20 bytes
  ↓                                                              ↓
Bech32("wire", bytes)                                    Hex("0x", bytes)
  ↓                                                              ↓
wire1abc...xyz                                           0x1234...5678
```

**Important:** Both addresses control the same account state. Transactions signed with the private key are valid whether sent to the Cosmos or Ethereum address format.

#### Account Structure

```
Private Key (secp256k1)
         ↓
    Public Key
         ↓
    ┌────┴────┐
    ↓         ↓
Cosmos     Ethereum
Address    Address
(Bech32)   (0x...)
```

**Account Contents:**

- Balance (native WIRE and tokens)
- Nonce (transaction counter)
- Code Hash (for smart contracts)
- Storage Root (contract state)

---

## Native Token

WireFluid uses WIRE as its native token for gas fees, staking, and governance.

### Token Specifications

| Attribute             | Value                 |
| --------------------- | --------------------- |
| **Display Name**      | WIRE                  |
| **Base Denomination** | awire                 |
| **Decimals**          | 18                    |
| **Conversion**        | 1 WIRE = 10^18 awire  |
| **Minimum Gas Price** | 10 Gwei (10^10 awire) |

**Note:** The base denomination `awire` is used internally for precision, while `WIRE` is displayed to users in wallets and interfaces. The chain fee market enforces a minimum gas price of 10 Gwei.

### Example Conversions

```
1 WIRE = 1,000,000,000,000,000,000 awire (10^18)
0.001 WIRE = 1,000,000,000,000,000 awire (10^15)
0.000001 WIRE = 1,000,000,000,000 awire (10^12)
```

---

## Gas Model & Fee Structure

WireFluid uses a hybrid gas system that bridges Cosmos SDK gas and EVM gas models.

### Gas Calculation

```
Transaction Fee = Gas Used × Gas Price

Where:
- Gas Used: Computational cost (EVM gas units)
- Gas Price: Cost per gas unit (in awire; minimum 10 Gwei = 10^10 awire)
```

The chain uses an EIP-1559–style fee market: default base fee 1 Gwei, minimum gas price 10 Gwei.

### Gas Limits

| Operation                       | Gas Limit                                                           |
| ------------------------------- | ------------------------------------------------------------------- |
| Standard transfer (native WIRE) | 21,000 gas                                                          |
| ERC-20 transfer                 | ~45,000 gas                                                         |
| Contract deployment             | ~500,000 – 2,000,000 gas (depends on bytecode)                      |
| Complex contract call           | Depends on logic                                                    |
| **eth_call gas cap**            | Configurable at node (default typically high enough for view calls) |

### Gas Price Dynamics

Gas prices on WireFluid are low and stable. The chain enforces a **minimum gas price of 10 Gwei** and uses typical steps aligned with the fee market:

| Network condition   | Typical gas price | Example transfer cost (21k gas) |
| ------------------- | ----------------- | ------------------------------- |
| **Low activity**    | 10 Gwei           | ~0.00021 WIRE                   |
| **Normal activity** | 15 Gwei           | ~0.000315 WIRE                  |
| **High activity**   | 25 Gwei           | ~0.000525 WIRE                  |

### Fee Distribution

Transaction fees are distributed according to governance-controlled parameters. Fee distribution is subject to on-chain governance and may change over time.

**Typical Cosmos Chain Model:**

```
100% of Gas Fees
      ↓
┌─────┴──────────┐
↓                ↓
Validators      Community Pool
(~TBD)          (~TBD%)
      ↓
  ┌───┴────┐
  ↓        ↓
Commission  Delegators
(TBD-TBD%)     (TBD-TBD%)
```

**Note:** Exact percentages are determined by on-chain governance and may differ from the typical model shown above.

---

## Finality & Security Model

### Instant Finality

Unlike Ethereum's probabilistic finality, WireFluid provides instant economic finality.

```
Ethereum (Probabilistic):
Block 1 → Block 2 → Block 3 → ... → Block 12 (Safe) → Block 32 (Finalized)
~6 minutes for safety              ~13 minutes for finality

WireFluid (Instant):
Block N → Committed & Finalized
~5 seconds for absolute finality
```

**Why This Matters:**

- No need to wait for multiple confirmations
- Merchants can accept payments immediately
- DeFi protocols don't need to wait for settlement
- Bridges can transfer assets faster

### Security Guarantees

**Byzantine Fault Tolerance (BFT)**

- Network is secure as long as less than one-third of validators are malicious
- Requires two-thirds or more validators to agree on each block
- Mathematical proof of security under Byzantine conditions

**Slashing Conditions**

Validators are economically penalized for:

- Double signing (signing two blocks at same height)
- Downtime (being offline for extended periods)
- Invalid state transitions

**Economic Security**

```
Total Staked Value = Network Security Budget
Cost to Attack: > 1/3 of total stake
```

The economic cost to attack the network must exceed one-third of the total staked value, making attacks economically infeasible when sufficient value is staked.

---

## Cross-Chain Interoperability (IBC)

WireFluid implements the Inter-Blockchain Communication (IBC) protocol, enabling trustless communication with other IBC-enabled chains.

### IBC Architecture

```
WireFluid                           Other Cosmos Chain
    ↓                                       ↓
IBC Module                           IBC Module
    ↓                                       ↓
Light Client                         Light Client
    ↓                                       ↓
    └────────── IBC Channel ────────────────┘
              (Trustless Bridge)
```

### Supported Operations

**Token Transfers**

- Send WIRE to other chains
- Receive tokens from other chains
- Maintain token provenance
- Automatic wrapping/unwrapping

**Message Passing**

- Cross-chain message passing via IBC middleware and modules
- Data availability verification
- Atomic cross-chain swaps
- Multi-chain applications

### IBC vs Traditional Bridges

| Feature              | IBC                       | Traditional Bridge   |
| -------------------- | ------------------------- | -------------------- |
| **Trust Model**      | Trustless (light clients) | Trusted (multisig)   |
| **Security**         | Mathematical proof        | Economic assumption  |
| **Speed**            | ~30 seconds               | Minutes to hours     |
| **Supported Chains** | TBD                       | Specific chains only |

---

## Transaction Lifecycle

Understanding how a transaction flows through WireFluid:

### 1. Transaction Submission

```javascript
// User submits via MetaMask/Web3
const tx = await contract.transfer(recipient, amount);
```

**Transaction Components:**

- From address (sender)
- To address (recipient/contract)
- Value (amount in WIRE)
- Data (contract call data)
- Gas limit
- Gas price
- Nonce
- Signature (ECDSA)

### 2. Mempool & Validation

```
Transaction → JSON-RPC → Mempool → Validation
                            ↓
                    ┌───────┴───────┐
                    ↓               ↓
            Signature Check    Nonce Check
                    ↓               ↓
            Balance Check      Gas Check
                    ↓               ↓
                Valid Transaction
```

**Validation Checks:**

- Signature is valid
- Nonce matches account nonce
- Sender has sufficient balance
- Gas limit is reasonable
- Transaction format is correct

### 3. Block Proposal

```
Mempool → Validator Selects Txs → Proposes Block
              ↓                        ↓
      Priority: Gas Price      Block Template Created
```

### 4. Consensus & Execution

```
Block Proposal
      ↓
Pre-Vote (2/3+ validators)
      ↓
Pre-Commit (2/3+ validators)
      ↓
Execute Transactions
      ↓
Update State
      ↓
Commit Block (FINAL)
```

### 5. State Finalization

```
EVM State Tree
      ↓
Merkle Root Calculation
      ↓
State Root in Block Header
      ↓
CometBFT Commit
      ↓
FINALIZED (irreversible)
```

---

## State Storage & Data Model

### State Structure

```
WireFluid State Tree
├── Accounts
│   ├── 0x1234... (Ethereum Address)
│   │   ├── Balance: 100 WIRE
│   │   ├── Nonce: 5
│   │   ├── Code: [contract bytecode]
│   │   └── Storage: [key-value pairs]
│   └── wire1abc... (Cosmos Address)
│       ├── Balance: 50 WIRE
│       └── Delegations: [validator stakes]
├── Validators
│   ├── Validator 1
│   │   ├── Stake: Amount
│   │   ├── Commission: Percentage
│   │   └── Voting Power: Percentage
├── Governance Proposals
│   └── Proposal #1: Parameter Change
└── IBC Channels
    └── Channel 0: Connection Info
```

### Storage Mechanism

**Cosmos SDK Storage:**

- IAVL+ Tree (Immutable AVL Tree)
- Merkle proof generation
- Historical state queries
- Efficient state snapshots

**EVM Storage:**

- Ethereum-compatible account and storage model
- Logically equivalent to Ethereum's Patricia Merkle Trie
- Contract storage slots
- Account state trie
- Storage root in account

---

## Network Identifiers

WireFluid Testnet uses the following identifiers and endpoints (from chain configuration):

| Network     | Cosmos Chain ID | EVM Chain ID (EIP-155) | Status |
| ----------- | --------------- | ---------------------- | ------ |
| **Testnet** | wire-1          | 92533                  | Active |

**Endpoints (testnet):**

| Purpose          | URL                       |
| ---------------- | ------------------------- |
| **Cosmos RPC**   | https://rpc.wirefluid.com |
| **Cosmos API**   | https://api.wirefluid.com |
| **EVM JSON-RPC** | https://evm.wirefluid.com |

Use **EVM Chain ID 92533** and **https://evm.wirefluid.com** when adding the network to MetaMask or other EVM wallets. Use **wire-1** and the Cosmos RPC/API for Cosmos SDK tooling (e.g. Keplr, CosmJS).

---

## Comparison with Other Architectures

### WireFluid vs Ethereum

| Feature             | WireFluid                  | Ethereum         |
| ------------------- | -------------------------- | ---------------- |
| **Consensus**       | CometBFT (PoS)             | Gasper (PoS)     |
| **Finality**        | Fast (~5s)                 | ~13 minutes      |
| **TPS**             | ~1000                      | ~15              |
| **Smart Contracts** | EVM (Solidity)             | EVM (Solidity)   |
| **Cross-Chain**     | IBC Native                 | Bridges          |
| **Governance**      | On-chain                   | Off-chain + EIPs |
| **Upgrades**        | Coordinated via governance | Hard Forks       |

### WireFluid vs Other Cosmos Chains

| Feature             | WireFluid         | Osmosis  | Celestia          |
| ------------------- | ----------------- | -------- | ----------------- |
| **EVM Support**     | Native            | No       | No                |
| **Focus**           | General Purpose   | DEX      | Data Availability |
| **Tooling**         | Ethereum + Cosmos | Cosmos   | Cosmos            |
| **Smart Contracts** | Solidity          | CosmWasm | None              |

---

## Technical Specifications Summary

```yaml
Network:
  Name: WireFluid
  Cosmos Chain ID: wire-1 (testnet)
  EVM Chain ID: 92533 (EIP-155)
  Type: Cosmos SDK app chain with EVM

Endpoints (testnet):
  Cosmos RPC: https://rpc.wirefluid.com
  Cosmos API: https://api.wirefluid.com
  EVM JSON-RPC: https://evm.wirefluid.com

Consensus:
  Engine: CometBFT (Tendermint)
  Algorithm: Byzantine Fault Tolerant PoS
  Block Time: ~5 seconds
  Finality: Instant (single-block)

Execution:
  Virtual Machine: Ethereum Virtual Machine (EVM)
  Languages: Solidity, Vyper
  Opcodes: Full Ethereum compatibility
  Gas Model: EVM gas units; fee market (base fee 1 Gwei, min gas price 10 Gwei)

Token:
  Name: WIRE
  Base Denomination: awire
  Decimals: 18
  Min Gas Price: 10 Gwei (10^10 awire)

Accounts:
  Format: Dual (Cosmos Bech32 + Ethereum 0x)
  Prefix: wire (Cosmos addresses)
  Derivation: secp256k1
  HD Path: m/44'/60'/0'/0/0
  Signature: ECDSA

Interoperability:
  Protocol: IBC (Inter-Blockchain Communication)
  Trust Model: Light client verification
  Features: IBC transfer, IBC-Go, Stargate

Governance:
  Type: On-chain
  Proposal Types: Text, Parameter Change, Software Upgrade
  Voting: Stake-weighted
```

---
