# Deploy an ERC-20 Token on the WireFluid Testnet Using Remix IDE

This tutorial shows you how to deploy a custom **ERC-20 token** on the WireFluid Testnet using **Remix IDE** and **MetaMask**, no local development environment or build tools required.

---

## Prerequisites

Before you begin, make sure you have:

- A modern browser (Chrome, Brave, Firefox)
- **MetaMask** wallet installed
- WireFluid Testnet added to MetaMask
- Some test WIRE in your wallet (from the WireFluid Faucet)

---

## Remix IDE

**Remix IDE** is a browser-based tool for writing, compiling, deploying, and interacting with Ethereum-compatible smart contracts. It runs entirely in the browser and requires no local setup, making it easy to get started.

Remix is ideal for **beginners and quick prototyping** because it offers a visual interface and direct integration with wallets like MetaMask. For **production and automated workflows**, developers typically use frameworks like **Hardhat**, which provide more control, testing, and deployment automation.

## 1. Open Remix IDE

1. Navigate to [Remix IDE](https://remix.ethereum.org) in your web browser.
2. Remix IDE will open in a new tab, ready for use.

---

## 2. Create the ERC-20 Contract

1. In the Remix sidebar, click the **file explorer icon**
2. Click **New File**
3. Name it `TestToken.sol`

4. Paste the following Solidity code:

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

This contract will:

- Create a token called TestToken
- With symbol TST
- Mint the initial supply to the deployer’s address

## 3. Compile the Contract

1. Click the Solidity Compiler icon in the Remix sidebar
1. Select a compatible compiler version (e.g., 0.8.20)
1. Click Compile TestToken.sol

If compilation succeeds, you should see a green check mark.

## 4. Connect MetaMask

Before deploying, you must connect Remix to your MetaMask wallet:

1. In Remix, go to **Deploy & Run Transactions** (Ethereum icon)

2. Set **ENVIRONMENT** to **Injected Provider - MetaMask**

   This makes Remix use your MetaMask wallet and the currently selected network.

3. MetaMask will open and prompt you to connect
   **Click Next → Connect**.

> ⚠️ Make sure MetaMask is set to **WireFluid Testnet**.

## 5. Deploy the Contract

Once your wallet is connected and the contract is compiled, you’re ready to deploy the ERC-20 token to the WireFluid Testnet.

1. Open the **Deploy & Run Transactions** panel in Remix.
2. Ensure the **Environment** is set to **Injected Provider - MetaMask**.
3. Select the `TestToken` contract from the **Contract** dropdown.
4. In the **Constructor Arguments** field, enter the initial token supply.
   > **Note:** ERC-20 tokens use 18 decimal places by default.  
   > To mint 1,000,000 tokens, you need to multiply by 10^18.  
   > **Example:** For 1 million tokens, enter: 1000000000000000000000000
   > _(That’s 1,000,000 followed by 18 zeros.)_
5. Click **Deploy**.
6. MetaMask will prompt you to confirm the transaction - review the details and approve it.
7. Wait for the transaction to be confirmed on the WireFluid Testnet.

## 6. View the Deployed Contract

Once the transaction confirms:

1. You’ll see the deployed contract in Remix under Deployed Contracts

1. Use the Copy icon to copy the contract address

1. You can inspect it on **[WireScan](https://wirefluidscan.com)**

## 7. Add the Token to MetaMask

To view your newly deployed token:

1. Open MetaMask

1. Go to the Assets tab

1. Click Import Tokens

1. Paste the contract address

1. The token symbol should auto-fill (TST)

1. Click Add

You’ll now see your TST balance in MetaMask.

## 8. Interact with Your Token

Once deployed:

- Use Remix or MetaMask to transfer tokens
- Explore functions like balanceOf(address) or transfer(address,uint256)
- Use WireScan to view token transfers and holder balances

## Summary

You have successfully:

- Written a custom ERC-20 contract
- Compiled it in Remix
- Connected to WireFluid Testnet via MetaMask
- Deployed your token
- Added it to MetaMask
- Viewed it on WireScan

Happy building on **WireFluid**
