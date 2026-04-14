---
title: RPC Endpoints
description: Connect to WireFluid network using these RPC endpoints for development, testing, and production
---

# RPC Endpoints

RPC (Remote Procedure Call) endpoints allow your applications, wallets, and development tools to communicate with the WireFluid blockchain. Use these endpoints to send transactions, query data, and interact with smart contracts.

---

## Quick Reference

### WireFluid Testnet

```bash
# EVM JSON-RPC (MetaMask, Hardhat, ethers.js)
https://evm.wirefluid.com

# WebSocket (Real-time events)
wss://ws.wirefluid.com

# Cosmos REST API
TBD

# Cosmos RPC
TBD
```

### Network Information

| Parameter           | Value                     |
| ------------------- | ------------------------- |
| **Network Name**    | WireFluid Testnet         |
| **Chain ID**        | 92533                     |
| **Currency Symbol** | WIRE                      |
| **Block Explorer**  | https://wirefluidscan.com |

---

## EVM JSON-RPC Endpoints

The EVM JSON-RPC API provides Ethereum-compatible endpoints for interacting with WireFluid.

### Primary Endpoint

```
https://evm.wirefluid.com
```

**Use for:**

- MetaMask and other wallets
- Hardhat, Foundry, Remix deployments
- ethers.js, web3.js applications
- Smart contract interactions

### Configuration Examples

**MetaMask:**

```
Network Name: WireFluid Testnet
RPC URL: https://evm.wirefluid.com
Chain ID: 92533
Currency Symbol: WIRE
Block Explorer URL: https://wirefluidscan.com
```

**Hardhat (hardhat.config.js):**

```javascript
networks: {
  wirefluidTestnet: {
    url: "https://evm.wirefluid.com",
    chainId: 92533,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

**ethers.js:**

```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://evm.wirefluid.com");

// Get block number
const blockNumber = await provider.getBlockNumber();
console.log(`Current block: ${blockNumber}`);
```

**web3.js:**

```javascript
import Web3 from "web3";

const web3 = new Web3("https://evm.wirefluid.com");

// Get gas price
const gasPrice = await web3.eth.getGasPrice();
console.log(`Gas price: ${gasPrice}`);
```

---

## Supported RPC Methods

### Standard Ethereum JSON-RPC Methods

WireFluid supports all standard Ethereum JSON-RPC methods:

**Network Methods:**

- `net_version` - Get network/chain ID
- `net_listening` - Check if client is listening
- `net_peerCount` - Get number of peers

**Blockchain Methods:**

- `eth_blockNumber` - Get latest block number
- `eth_getBlockByNumber` - Get block by number
- `eth_getBlockByHash` - Get block by hash
- `eth_getBlockTransactionCountByNumber` - Get tx count in block

**Account Methods:**

- `eth_accounts` - List available accounts
- `eth_getBalance` - Get account balance
- `eth_getTransactionCount` - Get account nonce
- `eth_getCode` - Get contract code

**Transaction Methods:**

- `eth_sendRawTransaction` - Send signed transaction
- `eth_sendTransaction` - Send transaction (requires unlocked account)
- `eth_getTransactionByHash` - Get transaction by hash
- `eth_getTransactionReceipt` - Get transaction receipt
- `eth_estimateGas` - Estimate gas for transaction

**Contract Methods:**

- `eth_call` - Execute contract call (read-only)
- `eth_getLogs` - Get event logs
- `eth_newFilter` - Create event filter
- `eth_getFilterLogs` - Get filter logs

**Gas Methods:**

- `eth_gasPrice` - Get current gas price
- `eth_feeHistory` - Get historical gas prices
- `eth_maxPriorityFeePerGas` - Get max priority fee

---

## Best Practices

**Optimize Your Requests:**

```javascript
// Bad: Multiple calls for same data
const balance1 = await provider.getBalance(address1);
const balance2 = await provider.getBalance(address2);
const balance3 = await provider.getBalance(address3);

// Good: Batch multiple calls
const provider = new ethers.JsonRpcProvider("https://evm.wirefluid.com");
const balances = await Promise.all([
  provider.getBalance(address1),
  provider.getBalance(address2),
  provider.getBalance(address3),
]);
```

**Cache Responses:**

```javascript
// Cache block data that won't change
const cache = new Map();

async function getBlock(blockNumber) {
  if (cache.has(blockNumber)) {
    return cache.get(blockNumber);
  }

  const block = await provider.getBlock(blockNumber);
  cache.set(blockNumber, block);
  return block;
}
```

---

## Connection Testing

### Test EVM Connection

```javascript
import { ethers } from "ethers";

async function testConnection() {
  try {
    const provider = new ethers.JsonRpcProvider("https://evm.wirefluid.com");

    // Get network info
    const network = await provider.getNetwork();
    console.log(`Connected to chain ID: ${network.chainId}`);

    // Get latest block
    const blockNumber = await provider.getBlockNumber();
    console.log(`Latest block: ${blockNumber}`);
  } catch (error) {
    console.error("Connection failed:", error.message);
  }
}

testConnection();
```

---

## Troubleshooting

### Common Issues

**Timeout Errors**

```
Error: Timeout exceeded
```

**Solutions:**

- Increase timeout in your configuration
- Retry with exponential backoff

**Rate Limit Exceeded**

```
Error: 429 Too Many Requests
```

**Solutions:**

- Implement request throttling
- Add delays between requests
- Cache responses when possible
- Use batch requests

**Invalid Chain ID**

```
Error: Chain ID mismatch
```

**Solutions:**

- Verify you're using chain ID `92533`
- Clear wallet cache and reconnect
- Check MetaMask network configuration

### Example: Robust Connection with Retry

```javascript
import { ethers } from "ethers";

class RobustProvider {
  constructor(url, maxRetries = 3) {
    this.url = url;
    this.maxRetries = maxRetries;
    this.provider = new ethers.JsonRpcProvider(url);
  }

  async callWithRetry(method, params = []) {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await this.provider.send(method, params);
      } catch (error) {
        if (i === this.maxRetries - 1) throw error;

        // Exponential backoff
        const delay = Math.pow(2, i) * 1000;
        console.log(`Retry ${i + 1}/${this.maxRetries} after ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}

// Usage
const provider = new RobustProvider("https://evm.wirefluid.com");
const blockNumber = await provider.callWithRetry("eth_blockNumber");
```

---

## Security Best Practices

### Endpoint Security

**1. Never Expose Private Keys**

```javascript
// NEVER DO THIS
const privateKey = "0x1234..."; // Hardcoded private key
const wallet = new ethers.Wallet(privateKey, provider);

// Use environment variables
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
```

**2. Use HTTPS Only**

```javascript
// Insecure
const provider = new ethers.JsonRpcProvider("http://evm.wirefluid.com");

// Secure
const provider = new ethers.JsonRpcProvider("https://evm.wirefluid.com");
```

**3. Validate Chain ID**

```javascript
const provider = new ethers.JsonRpcProvider("https://evm.wirefluid.com");
const network = await provider.getNetwork();

if (network.chainId !== 92533n) {
  throw new Error("Wrong network! Expected WireFluid Testnet");
}
```

**4. Implement Timeouts**

```javascript
const provider = new ethers.JsonRpcProvider(
  "https://evm.wirefluid.com",
  undefined,
  { timeout: 30000 }, // 30 second timeout
);
```

---

## Quick Links

**Network Connection:**

- [Add to MetaMask](/developer-guide/prerequisites/network-config)
- [Configure Hardhat](/tutorials-examples/intermediate-tutorials/deploy-erc20)
- [Setup Development Environment](/developer-guide/prerequisites/install-nodejs)

**Explorer & Tools:**

- [WireScan Block Explorer](https://wirefluidscan.com)
- [Network Faucet](https://faucet.wirefluid.com)
