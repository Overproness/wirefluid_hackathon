---
title: Overview
description: Your complete guide to building on WireFluid - from setup to deployment
---

# Overview

Welcome to the WireFluid Developer Guide! Whether you're new to blockchain development or an experienced developer, this guide will help you build and deploy applications on WireFluid efficiently.

---

## Getting Started Checklist

Complete these steps to start building on WireFluid:

<input type="checkbox" id="prerequisites" /> <label >**Install Prerequisites** - Set up your development environment</label>  
<input type="checkbox" id="configure-network" /> <label >**Configure Network** - Connect to WireFluid testnet</label>  
<input type="checkbox" id="choose-development-path" /> <label >**Choose Development Path** - Pick the tools that fit your needs</label>  
<input type="checkbox" id="deploy-first-contract" /> <label >**Deploy Your First Contract** - Build something!</label>

> **Total Setup Time:** 10-15 minutes

---

## Guide Structure

> **💡 Quick Start:** If you're using browser-based tools (Remix), you only need MetaMask, network configuration, and testnet tokens!

### 1. Prerequisites

Essential setup before you start coding.

**[Install Node.js & npm →](/developer-guide/prerequisites/install-nodejs)**

- Required for command-line development
- Install JavaScript runtime and package manager
- **Time:** 5-10 minutes

**[Setup MetaMask Wallet →](/developer-guide/prerequisites/setup-metamask-wallet)**

- Manage your wallet and sign transactions
- Essential for all WireFluid interactions
- **Time:** 3-5 minutes

**[Configure WireFluid Network →](/developer-guide/prerequisites/network-config)**

- Add WireFluid to your wallet
- Connect to testnet or mainnet
- **Time:** 2 minutes

**[Get Testnet Tokens →](/developer-guide/prerequisites/testnet-tokens)**

- Request free test WIRE for development
- Required for deploying and testing
- **Time:** 1 minute

---

### 2. Network Configuration

Everything you need to connect to WireFluid.

**[Network Details →](/developer-guide/network-configuration/network-details)**

- RPC endpoints and connection URLs
- Chain ID and network parameters

**[Adding Network to Wallet →](/developer-guide/network-configuration/adding-network-wallet)**

- Add network to MetaMask wallet
- Automatic and manual configuration
- **Time:** 2 minutes

**[Get WireFluid Faucet →](/developer-guide/network-configuration/get-wirefluid-faucet)**

- Request testnet tokens
- Understand faucet limits
- **Time:** 1 minute

---

### 3. Development Paths

Choose the development environment that fits your needs.

**[Browser-Based (Remix IDE) →](/developer-guide/development-paths/browser-based-remix-ide)**

- **Best for:** Beginners, prototyping, learning
- **Setup:** Instant (no installation)
- **Features:** Visual interface, built-in compiler, debugger
- **Start here if:** You're new to blockchain or want quick results

**[Command Line (Hardhat) →](/developer-guide/development-paths/command-line-hardhat)**

- **Best for:** Professional development, production apps
- **Setup:** 5 minutes (requires Node.js)
- **Features:** Automated testing, deployment scripts, team collaboration
- **Start here if:** You're building serious applications

---

## Network Overview

### Testnet vs Mainnet

| Feature      | WireFluid Testnet                              | WireFluid Mainnet       |
| ------------ | ---------------------------------------------- | ----------------------- |
| **Purpose**  | Testing & development                          | Production applications |
| **Tokens**   | Free test WIRE                                 | Real WIRE (has value)   |
| **Explorer** | [wirefluidscan.com](https://wirefluidscan.com) | Coming soon             |
| **RPC**      | https://evm.wirefluid.com                      | TBA                     |
| **Chain ID** | 92533                                          | TBA                     |

> **⚠️ Always test on testnet first!** Never deploy directly to mainnet without thorough testing.

### Network Characteristics

**Fast & Efficient:**

- **Block Time:** ~5 seconds
- **Finality:** Instant (single-block)
- **TPS:** ~1,000 transactions per second

**EVM Compatible:**

- **Languages:** Solidity, Vyper
- **Tools:** Remix, Hardhat, Foundry, Truffle
- **Libraries:** ethers.js, web3.js, web3.py

**Low Cost:**

- **Gas Fees:** 100-1000x cheaper than Ethereum
- **Predictable:** Stable pricing, no gas wars
- **Fast:** Transactions confirm in seconds

---

## Essential Tools

### Development Tools

| Tool                                         | Purpose                   | When to Use           |
| -------------------------------------------- | ------------------------- | --------------------- |
| **[Remix IDE](https://remix.ethereum.org)**  | Browser-based development | Learning, prototyping |
| **[Hardhat](https://hardhat.org)**           | Professional framework    | Production apps       |
| **[VS Code](https://code.visualstudio.com)** | Code editor               | All development       |

### Blockchain Tools

| Tool              | Purpose                      | Link                                                                      |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------- |
| **MetaMask**      | Wallet & transaction signing | [metamask.io](https://metamask.io)                                        |
| **WireScan**      | Block explorer               | [wirefluidscan.com](https://wirefluidscan.com)                            |
| **Faucet**        | Get testnet tokens           | [faucet.wirefluid.com](https://faucet.wirefluid.com)                      |
| **RPC Endpoints** | Network connection           | [Network Details](/developer-guide/network-configuration/network-details) |

### Libraries

| Library          | Purpose                        | Documentation                                          |
| ---------------- | ------------------------------ | ------------------------------------------------------ |
| **ethers.js**    | Ethereum library (recommended) | [docs.ethers.org](https://docs.ethers.org)             |
| **web3.js**      | Alternative Ethereum library   | [web3js.org](https://web3js.org)                       |
| **OpenZeppelin** | Secure contract templates      | [docs.openzeppelin.com](https://docs.openzeppelin.com) |

---

## Best Practices

### Security

**Always:**

- Test on testnet first
- Use audited libraries (OpenZeppelin)
- Verify contracts on WireScan

**Never:**

- Deploy untested code to mainnet
- Expose private keys
- Skip security audits for production
- Ignore compiler warnings

### Development

**Do:**

- Write comprehensive tests
- Document your code
- Use version control (Git)
- Follow naming conventions
- Optimize gas usage

**Don't:**

- Commit private keys
- Skip code reviews
- Ignore errors
- Deploy without testing
- Use deprecated patterns

### Cost Optimization

**Optimize:**

- Batch transactions
- Use events for logs
- Pack storage variables
- Minimize storage writes
- Use view/pure functions

**Avoid:**

- Unnecessary storage
- Redundant computations
- Unbounded loops
- Large arrays on-chain
- Inefficient algorithms

---

## Troubleshooting

### Common Issues

**"Insufficient funds for gas"**

- Get more testnet WIRE from [faucet](https://faucet.wirefluid.com)
- Check you're on the correct network

**"Transaction failed"**

- Check gas limit is sufficient
- Verify contract requirements are met
- Review error message in WireScan

**"Cannot connect to network"**

- Verify [Network Details](/developer-guide/network-configuration/network-details)
- Try resetting MetaMask connection

**"Nonce too high/low"**

- Reset account in MetaMask (Settings → Advanced → Reset Account)
- Don't manually set nonce unless necessary

---

## Next Steps

### By Experience Level

**Beginner (New to Blockchain):**

1. [Setup MetaMask →](/developer-guide/prerequisites/setup-metamask-wallet)
2. [Your First Contract →](/tutorials-examples/beginner-tutorials/your-first-smart-contract)
3. [Understanding Gas →](/tutorials-examples/beginner-tutorials/understanding-gas-transactions)

**Intermediate (Some Experience):**

1. [Install Node.js →](/developer-guide/prerequisites/install-nodejs)
2. [Setup Hardhat →](/developer-guide/development-paths/command-line-hardhat)
3. [Deploy using Hardhat →](/tutorials-examples/intermediate-tutorials/deploy-erc20)

### By Project Type

**Building a Token:**

- [ERC-20 Token (Remix) →](/tutorials-examples/beginner-tutorials/deploy-erc20-using-remix-ide)
- [ERC-20 Token (Hardhat) →](/tutorials-examples/intermediate-tutorials/deploy-erc20)

**Building an NFT:**

- [ERC-721 NFT →](/tutorials-examples/intermediate-tutorials/deploy-erc721)

---

## Resources

### Documentation

- [WireFluid Architecture](/getting-started/wire-architecture/network-architecture)

### Tutorials

- [Beginner Tutorials](/tutorials-examples/beginner-tutorials)
- [Intermediate Tutorials](/tutorials-examples/intermediate-tutorials)

### Tools & References

- [RPC Endpoints](/reference/rpc-endpoints)
- [WireScan Explorer](https://wirefluidscan.com)
- [Network Faucet](https://faucet.wirefluid.com)

---

**Ready to build?** Start with [Prerequisites →](/developer-guide/prerequisites/install-nodejs) or jump straight to [Your First Contract →](/tutorials/beginner/first-contract)!
