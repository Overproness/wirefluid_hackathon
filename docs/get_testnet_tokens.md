---
title: Get Testnet Tokens
description: Request free $WIRE tokens to pay for gas on the Testnet
---

# Get Testnet Tokens

To interact with the **WireFluid Testnet**, you need **test WIRE tokens** to pay for gas fees and deploy contracts. These tokens have no monetary value and are available for free.

---

## The WireFluid Faucet

The faucet is a web service that dispenses test tokens to developers. You can use these to deploy smart contracts, test dApp integrations, or transfer assets between accounts.

- **Faucet URL:** [https://faucet.wirefluid.com](https://faucet.wirefluid.com)
- **Limit:** 1 request every 12 hours per address

---

## How to Request Tokens

1.  **Go to the Faucet Page**
    Navigate to [https://faucet.wirefluid.com](https://faucet.wirefluid.com).

2.  **Authenticate**
    Sign in using your Google account to access the faucet.

3.  **Enter Wallet Address**
    Copy your address from MetaMask (starts with `0x...`) and paste it into the input field.

4.  **Request Funds**
    Click the **Request Tokens** button. The system will initiate a transaction to send WIRE to your wallet.

---

## Verify Receipt

Transactions on WireFluid are fast, but may take a few moments to appear in your wallet.

1.  Open **MetaMask**.
2.  Ensure you are connected to **WireFluid Testnet**.
3.  Refresh your balance; you should see your new **WIRE** tokens.

> **🔎 Check on Explorer:**
> You can also verify the transaction by searching your address on the [WireFluid Block Explorer](https://wirefluidscan.com).

---

## Troubleshooting

- **"Insufficient funds" error:** If the faucet is empty, please try again later.
- **Rate Limits:** If you requested tokens recently, you must wait **12 hours** before requesting again.
- **Wrong Network:** Ensure your wallet is configured for **WireFluid Testnet** before checking your balance. Requests sent to the wrong network settings will not be visible.

---

## Next Steps

Your environment is now fully set up! You have Node.js, a configured wallet, and test funds.

- **[Deploy Your First Contract →](/tutorials-examples/beginner-tutorials/your-first-smart-contract)** - Start building on WireFluid.
