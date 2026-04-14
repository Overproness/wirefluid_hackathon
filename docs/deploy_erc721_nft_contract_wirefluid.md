# Deploy an ERC-721 NFT Contract on the WireFluid Testnet (Hardhat v3 + Ignition)

## Overview

This guide walks you through deploying a **standard ERC-721 (NFT)** smart contract on the **WireFluid Testnet** using **Hardhat v3** and modern tooling.

You will:

- Initialize a latest Hardhat project
- Create an ERC-721 NFT using OpenZeppelin
- Deploy the NFT contract to WireFluid Testnet

---

## Prerequisites

Make sure you have the following installed and ready:

- **Node.js ≥ 18**
- **npm** or **pnpm**
- **MetaMask** (or any EVM-compatible wallet)
- Test WIRE tokens from the faucet
- Basic understanding of Solidity and NFTs

---

## Step 1: Create a New Hardhat Project

Create and enter a new project directory:

```bash
mkdir test-erc721
cd test-erc721
```

Initialize Hardhat:

```bash
npx hardhat --init
```

Choose the following options:

```bash
✔ Which version of Hardhat would you like to use? · hardhat-3
✔ Where would you like to initialize the project? · .
✔ What type of project would you like to initialize?
✔ A TypeScript Hardhat project using Mocha and Ethers.js
```

## Step 2: Project Structure

After initialization, your project will look like this:

```text
test-erc721/
├── contracts/
│   └── Counter.sol
├── ignition/
│   └── modules/
│       └── Counter.ts
├── test/
├── hardhat.config.ts
├── package.json
├── tsconfig.json
└── README.md

```

Hardhat v3 uses Ignition as the default deployment system.

### Step 2.1: Remove Example Files (Optional)

Remove the example counter contract and related files:

```bash
rm contracts/Counter.sol
rm ignition/modules/Counter.ts
rm test/Counter.ts
```

### Step 2.2: Install OpenZeppelin Contracts

Install OpenZeppelin’s audited NFT contracts:

```bash
npm install @openzeppelin/contracts
```

## Step 3: Create the ERC-721 NFT Contract

Create a new contract file:

```bash
touch contracts/TestNFT.sol
```

Add the following code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    constructor() ERC721("Test NFT", "TNFT") Ownable(msg.sender) {
        _mintInternal(msg.sender);
    }

    function mint(address to) external onlyOwner {
        _mintInternal(to);
    }

    function _mintInternal(address to) internal {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
    }
}
```

> Note: The constructor automatically mints the first NFT (token ID 0) to the deployer's address when the contract is deployed.

NFT Details

- Name: Test NFT
- Symbol: TNFT
- Minting: Owner-only minting
- Standard: ERC-721
- Constructor: Automatically mints the first NFT to the deployer when the contract is deployed.

## Step 4: Create an Ignition Deployment Module

Create a new Ignition module:

```bash
touch ignition/modules/TestNFT.ts
```

Add the following deployment logic:

```bash
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TestNFTModule = buildModule("TestNFTModule", (m) => {
  const testNFT = m.contract("TestNFT");

  return { testNFT };
});

export default TestNFTModule;
```

## Step 5: Configure WireFluid Testnet in Hardhat

Open hardhat.config.js and update it:

```js
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";
import "dotenv/config";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    wirefluidTestnet: {
      type: "http",
      chainType: "l1",
      url: process.env.WIREFLUID_RPC_URL!,
      chainId: 92533,
      accounts: [process.env.PRIVATE_KEY!],
    },
  }
});
```

### Important Notes

- Export your MetaMask private key only for testnet use
- Never commit private keys to version control

## Step 6: Set Environment Variables

Create a `.env` file in the project root:

```env
WIREFLUID_RPC_URL=https://evm.wirefluid.com
PRIVATE_KEY=0xYour_Testnet_Private_Key
```

> ⚠️ Important: Make sure your private key starts with `0x`. Without it, Hardhat will not recognize the key.

### Step 6.1: Install `dotenv`

Install `dotenv` to load environment variables from a `.env` file into your Hardhat configuration.

```bash
npm install dotenv
```

## Step 7: Fund Your Wallet with Testnet $WIRE

To deploy contracts, the wallet used by Hardhat must have sufficient testnet $WIRE.

- Open **MetaMask** and copy the wallet address that corresponds to the **private key configured in your Hardhat `.env` file**
- Switch MetaMask to the **WireFluid Testnet** network
- Visit the faucet and request testnet $WIRE: https://faucet.wirefluid.com/
- Confirm the wallet has enough balance before deploying contracts

## Step 8: Compile the Contracts

Compile the project to ensure everything is correct:

```bash
npx hardhat compile
```

You should see a successful compilation.

## Step 9: Deploy the ERC-721 Contract

Deploy the NFT contract to WireFluid Testnet:

```bash
npx hardhat ignition deploy ignition/modules/TestNFT.ts \
  --network wirefluidTestnet
```

Example output:

```text
Deploying [ TestNFTModule ]

Batch #1
  Executed TestNFTModule#TestNFT

[ TestNFTModule ] successfully deployed 🚀

Deployed Addresses

TestNFTModule#TestNFT - 0x...
```

## Step 10: Verify on WireScan

1. Open https://wirefluidscan.com
1. Search the deployed contract address

1. Confirm:
   - Contract creation
   - Token name and symbol
   - Transactions

## Step 11: View NFT in Wallet

1. Open MetaMask
1. Switch to WireFluid Testnet
1. Import NFT manually:

- Contract Address
- Token ID (0)

Your NFT will appear in the NFTs tab

## Summary

You have successfully: - Initialized a Hardhat v3 project - Created an ERC-721 NFT using OpenZeppelin - Deployed using Hardhat Ignition - Minted and viewed NFTs on MetaMask Wallet - Verified the contract on WireScan

Happy NFT building on **WireFluid**
