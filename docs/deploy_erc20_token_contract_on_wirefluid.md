# Deploy an ERC-20 Token Contract on the WireFluid Testnet (Hardhat v3 + Ignition)

## Overview

This guide walks you through deploying a standard **ERC-20 token** on the **WireFluid Testnet** using the **latest Hardhat v3** tooling with **Ignition** for deployments.

You will:

- Initialize a modern Hardhat v3 project
- Create an ERC-20 token using OpenZeppelin
- Deploy using Hardhat Ignition
- Verify and interact with your token on WireScan

---

## Prerequisites

Before starting, ensure you have:

- **Node.js ≥ 18**
- **npm** or **pnpm**
- **MetaMask** installed
- WireFluid Testnet RPC & funded test account
- Basic Solidity knowledge

---

## Step 1: Create a New Hardhat Project

Create a new directory for your project:

```bash
mkdir testtoken-erc20
cd testtoken-erc20
```

Initialize Hardhat:

```bash
npx hardhat --init
```

> **Note:** `npx` is a Node.js package runner that allows you to execute Hardhat without installing it globally.  
> It downloads and runs the required version of Hardhat for your project, ensuring compatibility and avoiding global dependency conflicts.

### Step 1.1: Select the Correct Hardhat Options

During initialization, Hardhat will prompt you with several options.

**Select the following recommended configuration:**

- Hardhat version:
  - `hardhat-3`
- Project location:
  - `.` (current directory)
- Project type:
  - `A TypeScript Hardhat project using Mocha and Ethers.js`

This setup provides:

- Full TypeScript support
- Ethers.js integration
- Mocha-based testing
- Best compatibility with modern EVM networks like WireFluid

## Step 2: Project Structure (Hardhat v3)

After initializing Hardhat, your project directory will look like this:

```text
testtoken-erc20/
├── contracts/
│   └── Counter.sol
├── ignition/
│   └── modules/
│       └── Counter.ts
├── scripts/
├── test/
│   └── Counter.ts
├── hardhat.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Directory Overview

- **contracts/** -
  Contains all Solidity smart contract source files such as ERC-20 and ERC-721 contracts. This is where your core blockchain logic lives.

- **ignition/** -
  Holds deployment modules powered by Hardhat Ignition. These modules define how contracts are deployed in a safe, repeatable, and deterministic way.

- **scripts/** -
  Used for custom automation scripts such as minting tokens, transferring assets, or interacting with deployed contracts.

- **test/** -
  Includes unit and integration tests to verify your smart contracts behave as expected before deployment.

- **hardhat.config.ts** -
  The main Hardhat configuration file where you define networks (including WireFluid), compiler versions, and plugins.

- **package.json** -
  Manages project dependencies and npm scripts required to run Hardhat commands.

- **tsconfig.json** -
  TypeScript configuration used by Hardhat, Ignition, and custom scripts.

- **README.md** -
  Project documentation describing setup, usage, and deployment instructions.

Hardhat v3 uses Ignition as the default deployment engine, providing structured, reliable, and repeatable deployments for WireFluid and other EVM-compatible networks.

### Step 2.1: Clean Up Example Files (Optional)

```bash
rm contracts/Counter.sol
rm ignition/modules/Counter.ts
rm test/Counter.ts
```

### Step 2.2: Install Dependencies

Install OpenZeppelin contracts for ERC-20 implementation:

```bash
npm install @openzeppelin/contracts
```

## Step 3: Create the ERC-20 Token Contract

Create a new Solidity file:

```bash
touch contracts/TestToken.sol
```

Add the following code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("TestToken", "TST") {
        _mint(msg.sender, initialSupply);
    }
}
```

This contract:

- Creates an ERC-20 token named TestToken
- Uses symbol TST
- Mints the initial supply to the deployer

## Step 4: Create an Ignition Deployment Module

```bash
touch ignition/modules/TestToken.ts
```

Add the following code in the `TestToken.ts` file:

```ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TestTokenModule = buildModule("TestTokenModule", (m) => {
  const initialSupply = m.getParameter(
    "initialSupply",
    1_000_000n * 10n ** 18n,
  );

  const testToken = m.contract("TestToken", [initialSupply]);

  return { testToken };
});

export default TestTokenModule;
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
        version: "0.8.33",
      },
      production: {
        version: "0.8.33",
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

> Note: At the time of writing, 0.8.33 is the latest version. Check the Solidity releases page for the current version.

## Step 6: Environment Variables

> ⚠️ IMPORTANT: Never commit your .env file or private keys to version control. Add .env to your .gitignore file immediately.
> Make sure your private key starts with `0x`. Without it, Hardhat will not recognize the key.
> Create a `.env` file in the project root:

```env
WIREFLUID_RPC_URL=https://evm.wirefluid.com
PRIVATE_KEY=0xYour_Testnet_Private_Key
```

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

## Step 9: Deploy Using Ignition

Deploy the ERC-20 token to WireFluid Testnet:

```bash
npx hardhat ignition deploy ignition/modules/TestToken.ts \
  --network wirefluidTestnet
```

Example output:

```
Deploying [ TestTokenModule ]
Batch #1
  Executed TestTokenModule#TestToken
[ TestTokenModule ] successfully deployed 🚀
Deployed Addresses
TestTokenModule#TestToken - 0x...
```

## Step 10: Verify Deployment on WireScan

1. Open https://wirefluidscan.com/
1. Paste the deployed contract address
1. View:
   - Contract creation transaction
   - Token supply
   - Holder address

## Step 11: Import Token into MetaMask

1. Open MetaMask
1. Switch to WireFluid Testnet network
1. Click Import Token
1. Paste the contract address
1. Confirm token details
   Your TST balance should now be visible.

## Summary

- You have successfully:
- Set up a Hardhat project
- Created an ERC-20 token using OpenZeppelin
- Connected Hardhat to WireFluid Testnet
- Deployed and verified a smart contract

Happy building on **WireFluid**
