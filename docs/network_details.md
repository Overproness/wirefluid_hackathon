---
title: Network Details
description: Technical specifications and connection parameters for the WireFluid Testnet
---

# Network Details

This section provides the essential network configuration required for developers to connect wallets, applications, and developer tooling to the **WireFluid Testnet**.

---

## Network Parameters

Use these values to configure your EVM-compatible wallet or deployment environment.

| Parameter           | Value                                                  |
| :------------------ | :----------------------------------------------------- |
| **Network Name**    | WireFluid Testnet                                      |
| **RPC URL**         | `https://evm.wirefluid.com`                            |
| **Chain ID**        | `92533`                                                |
| **Currency Symbol** | WIRE                                                   |
| **Block Explorer**  | [https://wirefluidscan.com](https://wirefluidscan.com) |
| **Network Type**    | Testnet                                                |

---

## RPC Endpoints

For high-volume applications or production-grade reliability, you can use any of the following RPC endpoints for **WireFluid Testnet**:

- `https://evm.wirefluid.com`
- `https://evm2.wirefluid.com`
- `https://evm3.wirefluid.com`
- `https://evm4.wirefluid.com`
- `https://evm5.wirefluid.com`

> **Note:** Public RPCs are subject to rate limiting. For heavy indexing or dApp usage, consider load-balancing across these endpoints and implement retry logic.

---

## Compatibility

WireFluid is fully **EVM-compatible**. This enables developers to deploy and interact with smart contracts using standard Ethereum tooling without any modification, including:

- **Wallets:** MetaMask, Rabby, Coinbase Wallet
- **Frameworks:** Hardhat, Foundry, Truffle
- **IDEs:** Remix, Visual Studio Code
