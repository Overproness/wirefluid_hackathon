---
title: Configure WireFluid Network
description: Connect your MetaMask wallet to the WireFluid Testnet
---

# Configure WireFluid Network

To develop on **WireFluid**, your wallet needs to communicate with the WireFluid nodes instead of the Ethereum Mainnet. This section will guide you through adding the network manually.

> **ℹ️ Quick Info**  
> **Network Name:** WireFluid Testnet  
> **Chain ID:** 92533  
> **Currency:** WIRE

---

## Network Connection Details

Use the following parameters to configure your wallet or deployment tools (like Hardhat/Foundry).

| Parameter           | Value                       |
| :------------------ | :-------------------------- |
| **Network Name**    | WireFluid Testnet           |
| **RPC URL**         | `https://evm.wirefluid.com` |
| **Chain ID**        | `92533`                     |
| **Currency Symbol** | WIRE                        |
| **Block Explorer**  | https://wirefluidscan.com   |

---

## How to Add to MetaMask

Follow these steps to add WireFluid to your browser extension:

1. **Open MetaMask** and click the network dropdown button at the top-left (usually says "Ethereum Mainnet").
2. Click **"Add network"**.
3. At the bottom of the list, click **"Add a network manually"**.
4. Copy and paste the **Network Connection Details** from the table above into the corresponding fields.
5. Click **"Save"**.
6. **Switch to WireFluid Testnet** when prompted.

---

## Verification

To confirm you are connected:

- Open MetaMask.
- Look for the **"WireFluid Testnet"** badge at the top of the window.
- Your balance should show **0 WIRE** (unless you have already used the faucet).

---

## Next Steps

Now that your wallet is connected, you need funds to pay for transaction fees.

- **[Get Testnet Tokens →](/developer-guide/prerequisites/testnet-tokens)** - Fund your wallet using the Faucet.
