---
title: Get WireFluid Faucet
description: Service specifications and access details for the WireFluid Testnet Faucet
---

# Get WireFluid Faucet

The **WireFluid Faucet** is the official web service that dispenses **testnet WIRE tokens** to developers and testers. These tokens allow you to pay for gas fees and deploy smart contracts on the network without any cost.

> **Note:** Testnet WIRE tokens have **no monetary value** and function identically to mainnet WIRE for development purposes.

---

## Service Specifications

| Feature            | Details                                                      |
| :----------------- | :----------------------------------------------------------- |
| **Service URL**    | [https://faucet.wirefluid.com](https://faucet.wirefluid.com) |
| **Rate Limit**     | 1 request per address every **12 hours**                     |
| **Authentication** | Google Account required                                      |
| **Network**        | WireFluid Testnet (Chain ID 92533)                           |

---

## Usage Requirements

To successfully receive tokens, ensure your environment meets the following criteria:

- **Google Authentication:** You must sign in with a valid Google account to prevent spam.
- **Correct Network:** Your wallet should be configured for **WireFluid Testnet**. Faucet requests may fail if verified against the wrong network.
- **Valid Address:** Ensure you paste a valid EVM-compatible address (starting with `0x...`).

---

## Troubleshooting

If you encounter issues receiving funds:

- **Rate Limits:** If you see an error, check if you have requested tokens within the last 12 hours.
- **Service Empty:** If the faucet reports "Insufficient funds," the pool may be temporarily empty. Please try again later.
- **Verification:** You can confirm receipt of funds by searching your address on [WireScan](https://wirefluidscan.com).

---

## Related Guides

- **[Get Testnet Tokens (Tutorial)](/developer-guide/prerequisites/testnet-tokens)** – A step-by-step walkthrough for beginners.
- **[Network Details](/developer-guide/network-configuration/network-details)** – Full connection parameters for the testnet.
