---
title: Understanding Gas & Transactions
description: Learn how blockchain transactions work, what gas is, and how to optimize your costs on WireFluid
---

# Understanding Gas & Transactions

Every action on the blockchain is a transaction - from sending tokens to deploying smart contracts. Understanding how transactions work and what you're paying for is essential to becoming an effective blockchain developer.

> **Time Required:** ~12 minutes  
> **Prerequisites:** [Your First Smart Contract](tutorials-examples/beginner-tutorials/your-first-smart-contract) (recommended)

---

## What You'll Learn

By the end of this tutorial, you'll understand:

- What transactions are and how they work
- What gas is and why you pay it
- How to estimate and optimize gas costs
- The lifecycle of a transaction
- How to troubleshoot failed transactions
- Best practices for managing transaction fees

---

## What is a Transaction?

A **transaction** is any action that changes the state of the blockchain. Think of it as writing to a permanent, global database that everyone can verify.

### Types of Transactions

```
📝 State-Changing (Costs Gas):
├── Send WIRE tokens to someone
├── Deploy a smart contract
├── Call a function that writes data
├── Mint/burn tokens
└── Update contract storage

👀 Read-Only (FREE):
├── Check your balance
├── Read contract data
├── View transaction history
└── Query blockchain state
```

### Transaction Analogy

Think of the blockchain as a **global ledger in a town square**:

```
Traditional Bank:
You → 🏦 Bank → ⏳ Processing → ✅ Recorded (Private ledger)

Blockchain Transaction:
You → 📢 Broadcast → 🌐 Network → ⛓️ Miners/Validators → ✅ Block (Public ledger)
```

**Key Differences:**

- **Public**: Everyone can see all transactions
- **Permanent**: Cannot be deleted or hidden
- **Trustless**: No bank needed - math verifies everything
- **Global**: Works anywhere in the world instantly

---

## Understanding Gas

### What is Gas?

**Gas** is the unit that measures computational work on the blockchain. Every operation costs a specific amount of gas.

Think of gas like fuel for your car:

```
🚗 Car Journey:
Distance × Fuel Price = Trip Cost
100 km × $2/liter = $200

⛓️ Blockchain Transaction:
Gas Used × Gas Price = Transaction Fee
50,000 gas × 0.01 Gwei = Fee in WIRE
```

### Why Does Gas Exist?

Gas serves three critical purposes:

**1. Prevents Infinite Loops**

```solidity
// Without gas, this would run forever and crash the network
function badFunction() public {
    while(true) {
        // Do something
    }
}

// With gas: After ~30M gas, transaction fails and stops
```

**2. Compensates Validators**

```
Validators provide:
├── Computing power (run transactions)
├── Storage (store blockchain data)
├── Network bandwidth (broadcast blocks)
└── Security (stake their tokens)

They deserve payment for their work!
```

**3. Prevents Spam**

```
Without fees:
Someone could send millions of transactions → Network crashes

With fees:
Spamming costs real money → Network stays healthy
```

---

## Gas calculation on WireFluid

WireFluid uses the native token **WIRE** (Cosmos denom **awire**, 18 decimals) for gas. The chain runs an EIP-1559–style fee market with a default base fee of 1 Gwei and a minimum gas price of 10 Gwei.

### The gas formula

```
Total Transaction Fee = Gas Used × Gas Price
```

Breakdown of each part:

### 1. Gas Used

**Gas used** is how much computational work your transaction requires.

| Operation               | Gas Cost                 | Example                |
| ----------------------- | ------------------------ | ---------------------- |
| **Simple transfer**     | 21,000 gas               | Send WIRE to a friend  |
| **ERC-20 transfer**     | ~45,000 gas              | Send tokens            |
| **ERC-721 mint**        | ~80,000 gas              | Mint an NFT            |
| **Contract deployment** | ~500,000 - 2,000,000 gas | Deploy smart contract  |
| **Complex DeFi swap**   | ~150,000 gas             | Swap tokens on DEX     |
| **Storage write**       | 20,000 gas per word      | Store data in contract |

> **💡 Key Point:** Gas used depends on what your transaction does, not on the value you're sending. Sending 1 WIRE costs the same gas as sending 1,000,000 WIRE!

### 2. Gas Price

**Gas price** is how much you pay per unit of gas, measured in **Gwei**. On WireFluid, fees are paid in **WIRE** (native denom; base unit **awire**, 18 decimals).

**Unit breakdown (WireFluid):**

```
1 WIRE = 1,000,000,000 Gwei (1 billion)
1 Gwei = 0.000000001 WIRE

Think of it like:
1 Dollar = 100 Cents
1 WIRE = 1,000,000,000 Gwei
```

**WireFluid fee market (from chain):**

- **Default base fee:** 1 Gwei
- **Minimum gas price:** 10 Gwei
- **Typical gas price steps:** 10 Gwei (low), 15 Gwei (average), 25 Gwei (high)

### Real Cost Examples

Using WireFluid’s typical gas price (10 Gwei):

**Example 1: Send WIRE to a Friend**

```
Gas Used:    21,000 gas
Gas Price:   10 Gwei (chain minimum)
Cost:        21,000 × 10 = 210,000 Gwei = 0.00021 WIRE
```

**Example 2: Deploy ERC-20 Token**

```
Gas Used:    1,200,000 gas
Gas Price:   10 Gwei
Cost:        1,200,000 × 10 = 12,000,000 Gwei = 0.012 WIRE
```

**Example 3: Swap Tokens on DEX**

```
Gas Used:    150,000 gas
Gas Price:   10 Gwei
Cost:        150,000 × 10 = 1,500,000 Gwei = 0.0015 WIRE
```

---

## WireFluid vs Ethereum: Cost Comparison

Let's compare the same operations on different networks:

| Operation                       | WireFluid (10 Gwei) | Ethereum L1 | Savings      |
| ------------------------------- | ------------------- | ----------- | ------------ |
| **Send tokens** (21k gas)       | ~0.00021 WIRE       | $5–$50      | Much cheaper |
| **Deploy contract** (~1.2M gas) | ~0.012 WIRE         | $100–$500   | Much cheaper |
| **NFT mint** (~80k gas)         | ~0.0008 WIRE        | $20–$100    | Much cheaper |
| **DeFi swap** (~150k gas)       | ~0.0015 WIRE        | $10–$200    | Much cheaper |

_WireFluid fees are in WIRE; compare in USD using current WIRE price if needed._

**Why is WireFluid cheaper?**

1. **Faster blocks** — ~5 second block time (vs ~12 seconds on Ethereum L1)
2. **Higher throughput** — built for scale vs legacy L1 limits
3. **Efficient consensus** — Cosmos-based consensus with EIP-1559-style fee market (base fee 1 Gwei, minimum gas price 10 Gwei)

---

## Transaction Anatomy

Let's dissect what's actually in a transaction:

### Transaction Components

```javascript
{
  "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "to": "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
  "value": "1000000000000000000",  // 1 WIRE (18 decimals, base unit awire)
  "data": "0x",
  "gas": "21000",
  "gasPrice": "10000000000",  // 10 Gwei (WireFluid typical minimum)
  "nonce": "5",
  "chainId": "92533",
  "v": "0x1b",
  "r": "0x...",
  "s": "0x..."
}
```

**Field explanations:**

| Field        | Purpose                         | Example                          |
| ------------ | ------------------------------- | -------------------------------- |
| **from**     | Sender's address                | Your wallet address              |
| **to**       | Recipient address               | Friend's wallet or contract      |
| **value**    | Amount of WIRE to send (in wei) | 1 WIRE = 10^18 base units        |
| **data**     | Contract function call data     | Function parameters              |
| **gas**      | Maximum gas willing to use      | 50,000                           |
| **gasPrice** | Price per gas unit (wei)        | 10 Gwei = 10^10 wei on WireFluid |
| **nonce**    | Transaction counter             | Prevents replay attacks          |
| **chainId**  | EIP-155 chain ID                | 92533 = WireFluid Testnet        |
| **v, r, s**  | Signature components            | Proves you authorized this       |

### Understanding Nonce

The **nonce** is a transaction counter that ensures transactions are processed in order.

```
Your Account:
├── Nonce 0: Deploy contract ✅ Confirmed
├── Nonce 1: Send 10 WIRE ✅ Confirmed
├── Nonce 2: Update contract ⏳ Pending
└── Nonce 3: Send 5 WIRE ⏸️ Waiting (can't process until nonce 2 confirms)
```

**Important Rules:**

- Nonces must be sequential (0, 1, 2, 3...)
- You can't skip a nonce
- Each nonce can only be used once
- Transactions with the same nonce will conflict

---

## Transaction Lifecycle

Understanding what happens when you send a transaction:

### The Journey of a Transaction

```
Step 1: Creation
👤 You → Sign transaction with private key
         ↓
Step 2: Broadcast
📡 Wallet → Send to WireFluid RPC node
         ↓
Step 3: Mempool
🎯 Node → Add to mempool (pending transactions)
         ↓
Step 4: Selection
⚖️ Validator → Pick transactions for next block
         ↓
Step 5: Execution
⚡ EVM → Run transaction code
         ↓
Step 6: Validation
🔍 Validators → Verify results
         ↓
Step 7: Block Creation
📦 Block → Transaction included in block
         ↓
Step 8: Finalization
✅ Network → Block finalized (PERMANENT)
         ↓
Step 9: Confirmation
📧 You → Receive confirmation in wallet
```

### Time at each stage

| Stage               | Time on WireFluid       | Time on Ethereum |
| ------------------- | ----------------------- | ---------------- |
| **Mempool wait**    | 0–5 seconds             | 0–30 seconds     |
| **Block inclusion** | ~5 seconds (block time) | ~12 seconds      |
| **Finalization**    | Fast                    | ~13 minutes      |
| **Total**           | ~5 seconds typical      | ~13–15 minutes   |

---

## Transaction States

Your transaction can be in different states:

### Pending

```
Status: Waiting to be included in a block
What to do: Wait patiently (usually 2-5 seconds)
Can you cancel? Yes, by sending a new transaction with same nonce and higher gas
```

### Confirmed

```
Status: Included in a block and finalized
What to do: Nothing - it's done!
Can you cancel? No - it's permanent
```

### Failed

```
Status: Transaction was processed but reverted
What to do: Check error message, fix issue, try again
Common causes:
- Out of gas
- Contract reverted (require statement failed)
- Insufficient balance
- Invalid input
```

### Dropped

```
Status: Removed from mempool without processing
What to do: Resubmit the transaction
Common causes:
- Gas price too low
- Nonce already used
- Replaced by another transaction
```

---

## Gas Estimation

How do you know how much gas to use?

### Automatic Estimation

Most wallets and tools estimate gas for you:

```javascript
// Using ethers.js
const estimatedGas = await contract.transfer.estimateGas(recipient, amount);
console.log(`Estimated gas: ${estimatedGas}`);

// Add 10-20% buffer for safety
const gasLimit = estimatedGas * 1.2;
```

**MetaMask estimation:**

```
When you send a transaction, MetaMask shows:
┌─────────────────────────────┐
│ Estimated gas: 50,000       │
│ Gas price: 10 Gwei          │
│ Max fee: 0.0005 WIRE        │
│                             │
│ [Edit] [Confirm]            │
└─────────────────────────────┘
```

### Manual Estimation

You can also estimate manually by understanding operation costs:

**Basic Operations:**

```
Addition (a + b):           3 gas
Multiplication (a × b):     5 gas
Storage write (256 bits):   20,000 gas
Storage read:               200 gas
Create new account:         25,000 gas
Transfer tokens:            ~9,000 gas
Call external contract:     ~2,600 gas + function cost
```

**Example Calculation:**

```solidity
function transfer(address to, uint256 amount) public {
    // Read sender balance:        200 gas
    // Read recipient balance:     200 gas
    // Subtract from sender:       20,000 gas (storage write)
    // Add to recipient:           20,000 gas (storage write)
    // Emit event:                 ~1,000 gas
    // ────────────────────────────────────
    // Total:                      ~41,400 gas
    // Base transaction cost:      +21,000 gas
    // ────────────────────────────────────
    // Estimated total:            ~62,400 gas
}
```

---

## Gas Limit vs Gas Used

Understanding the difference between these two concepts:

### Gas Limit

**What it is:** Maximum gas you're willing to spend

```
Think of it like giving someone $100:
"Here's $100, do the job, and give me back what you don't use"

Gas Limit = $100 (maximum you're willing to pay)
```

**Setting Gas Limit:**

- Too low: Transaction fails, you lose gas
- Too high: Extra gas is refunded, no problem
- **Best practice:** Set 10-20% above estimate

### Gas Used

**What it is:** Actual gas consumed by the transaction

```
The job only costs $65:
"Here's your $65 payment, and here's your $35 change"

Gas Used = $65 (actual cost)
Refund = $35 (unused gas returned)
```

### Example Scenario

```javascript
// You set gas limit to 100,000
const tx = await contract.transfer(recipient, amount, {
  gasLimit: 100000,
});

// Transaction uses 62,400 gas
// You pay for: 62,400 gas
// Refunded: 37,600 gas
// You're not charged for unused gas!
```

**Important:**

```
If Gas Used < Gas Limit → Success! Unused gas refunded
If Gas Used > Gas Limit → Transaction fails, gas consumed
```

---

## Why Transactions Fail

Common reasons and how to fix them:

### 1. Out of Gas

**Error:** `Transaction ran out of gas`

**What happened:**

```
Your transaction needed 100,000 gas
You only provided 50,000 gas
Transaction stopped halfway and failed
```

**Solution:**

- Increase gas limit
- Use estimation tools
- Add 20% buffer above estimate

**Example Fix:**

```javascript
// Too low
const tx = await contract.deploy({ gasLimit: 50000 });

// Sufficient
const estimated = await contract.deploy.estimateGas();
const tx = await contract.deploy({ gasLimit: estimated * 1.2 });
```

### 2. Insufficient Balance

**Error:** `Insufficient funds for gas * price + value`

**What happened:**

```
Your balance: 1 WIRE
Transaction cost: 0.5 WIRE (gas)
Sending amount: 0.7 WIRE
Total needed: 1.2 WIRE
You're 0.2 WIRE short!
```

**Solution:**

- Add more WIRE to your wallet
- Reduce the amount you're sending
- Wait for incoming transfers to confirm

### 3. Contract Revert

**Error:** `Transaction reverted` or `require statement failed`

**What happened:**

```solidity
function withdraw(uint256 amount) public {
    require(balance[msg.sender] >= amount, "Insufficient balance");
    // ↑ This check failed!
    // Transaction stopped and reverted
}
```

**Solution:**

- Read the error message carefully
- Check contract requirements
- Verify you meet all conditions
- Test with smaller amounts first

### 4. Nonce Too Low

**Error:** `Nonce too low`

**What happened:**

```
Your account nonce: 10
Transaction nonce: 8
This nonce was already used!
```

**Solution:**

- Refresh your wallet
- Use the current nonce
- Don't manually set nonce unless needed

### 5. Gas price too low

**Error:** `Transaction underpriced` or stuck pending

**What happened:**

```
Network minimum: 10 Gwei (WireFluid)
Your gas price: 1 Gwei
Validators won't process it!
```

**Solution:**

- Use at least 10 Gwei on WireFluid (minimum gas price)
- Use the wallet’s recommended gas price (e.g. 10–25 Gwei)
- Check current network gas price via RPC or explorer

---

## Optimizing Gas Costs

Smart ways to reduce your transaction fees:

### 1. Batch Transactions

Instead of multiple small transactions, combine them:

**Inefficient:**

```solidity
// 3 separate transactions = 63,000 gas
transfer(alice, 10);    // 21,000 gas
transfer(bob, 10);      // 21,000 gas
transfer(charlie, 10);  // 21,000 gas
```

**Efficient:**

```solidity
// 1 transaction = ~35,000 gas
function batchTransfer(address[] memory recipients, uint256 amount) public {
    for(uint i = 0; i < recipients.length; i++) {
        transfer(recipients[i], amount);
    }
}
```

**Savings:** 28,000 gas (44% cheaper!)

### 2. Optimize Storage

Storage is the most expensive operation:

**Expensive:**

```solidity
// Writing to storage: 20,000 gas per write
function updateUser(string memory name, uint256 age) public {
    userName[msg.sender] = name;       // 20,000 gas
    userAge[msg.sender] = age;         // 20,000 gas
    userUpdated[msg.sender] = true;    // 20,000 gas
    // Total: 60,000 gas
}
```

**Cheaper:**

```solidity
// Struct packing: single storage slot
struct User {
    uint128 age;      // Pack multiple values
    uint128 score;    // in one storage slot
}

function updateUser(uint128 age, uint128 score) public {
    users[msg.sender] = User(age, score);  // 20,000 gas
    // Savings: 40,000 gas!
}
```

### 3. Use Events Instead of Storage

For data you don't need to query on-chain:

**Expensive:**

```solidity
// Store every transaction: 20,000+ gas each
mapping(uint => Transaction) public transactions;

function recordTransaction(uint id, uint amount) public {
    transactions[id] = Transaction(msg.sender, amount, block.timestamp);
}
```

**Cheaper:**

```solidity
// Emit event: ~1,500 gas
event TransactionRecorded(uint indexed id, address indexed user, uint amount, uint timestamp);

function recordTransaction(uint id, uint amount) public {
    emit TransactionRecorded(id, msg.sender, amount, block.timestamp);
}
```

---

## Monitoring Gas Prices

### RPC query

Check current gas price programmatically against WireFluid’s EVM RPC:

```javascript
const provider = new ethers.JsonRpcProvider("https://evm.wirefluid.com");
const gasPrice = await provider.getGasPrice();
console.log(`Current gas price: ${ethers.formatUnits(gasPrice, "gwei")} Gwei`);
```

On WireFluid, the default base fee is 1 Gwei and the minimum gas price is 10 Gwei; the chain may return at least 10 Gwei when the fee market is active.

---

## Advanced: Understanding EIP-1559

WireFluid supports EIP-1559–style transactions via its fee market module:

### Traditional gas model

```
Transaction Fee = Gas Used × Gas Price
```

### EIP-1559 model (WireFluid)

```
Transaction Fee = Gas Used × (Base Fee + Priority Fee)
```

**WireFluid fee market (from chain):**

- **Base fee:** 1 Gwei default; can change with demand
- **Minimum gas price:** 10 Gwei
- **Priority fee (tip):** Optional; goes to validators

**Benefits:**

- More predictable fees
- Better wallet UX
- Fee market can adjust base fee over time

---

## Best Practices

### For Users

**Always keep extra WIRE** for gas fees  
**Use gas estimation** tools before sending  
**Set gas limit 10-20% above** estimate  
**Check network status** before important transactions  
**Save gas by batching** when possible  
**Use events instead of storage** for historical data

### For Developers

**Optimize storage usage** in contracts  
**Pack variables** into single storage slots  
**Use uint256** unless smaller types save storage  
**Emit events** for off-chain indexing  
**Test gas costs** in development  
**Provide gas estimates** to users  
**Handle failed transactions** gracefully

### Red Flags

**Never send transactions without gas estimation**  
**Don't set arbitrary gas limits** without testing  
**Don't ignore failed transaction errors**  
**Don't store unnecessary data** on-chain  
**Don't use unbounded loops** in contracts

---

## Troubleshooting Guide

### Transaction Stuck Pending

**Symptoms:**

- Transaction shows "Pending" for 5+ minutes
- Not appearing in blockchain explorer

**Solutions:**

1. **Speed up** the transaction (increase gas price)
2. **Cancel** the transaction (send 0 WIRE to yourself with same nonce)
3. **Wait** - sometimes the network is just busy

**How to Speed Up (MetaMask):**

```
1. Click the pending transaction
2. Click "Speed Up"
3. Set higher gas price
4. Confirm
```

### Transaction Failed but Fee Charged

**Why this happens:**

```
1. Transaction was included in block
2. Code executed but hit an error
3. Validator work was done (deserves payment)
4. You pay for gas used, even if it failed
```

**Prevention:**

- Test on testnet first
- Use try-catch in contracts
- Validate inputs before sending
- Check contract requirements

### Nonce Issues

**Symptom:** "Nonce too high" or "Nonce too low"

**Solution:**

```javascript
// Reset your MetaMask nonce
Settings → Advanced → Reset Account

// Or get current nonce programmatically
const nonce = await provider.getTransactionCount(address, "pending");
```

---

## Gas vs Network Fees Comparison

Understanding the total cost ecosystem:

| Component        | What It Is                                             | Who Gets It         | Can You Avoid It? |
| ---------------- | ------------------------------------------------------ | ------------------- | ----------------- |
| **Gas fee**      | Computational cost (paid in WIRE)                      | Validators          | No                |
| **Base fee**     | EIP-1559 base fee (WireFluid default 1 Gwei)           | Fee market / burned | No                |
| **Priority fee** | Tip to validators (min 10 Gwei effective on WireFluid) | Validators          | Yes (but slower)  |

---

## Key Takeaways

### Remember These Fundamentals

**Gas is Not Evil**

- It protects the network from spam
- Compensates validators for their work
- Makes blockchain sustainable

**Gas is Predictable**

- You can estimate costs before sending
- Unused gas is refunded
- Costs are transparent and verifiable

**Gas is Optimizable**

- Batch transactions to save costs
- Use efficient code patterns
- Time transactions for lower prices

**Gas on WireFluid is cheap**

- Fees in WIRE (denom **awire**, 18 decimals); minimum gas price 10 Gwei
- Much cheaper than Ethereum L1; typical fees ~0.0002–0.012 WIRE per tx
- Fast finality (~5 s block time) = quick confirmation

---

## Next Steps

### Continue Learning

**[Deploy ERC-20 Token →](/tutorials-examples/beginner-tutorials/deploy-erc20-using-remix-ide)**

- Create your own token
- Understand token standards

### Advanced Topics

**[Testing Smart Contracts →](/tutorials-examples/intermediate-tutorials/testing-smart-contracts)**

- Write unit tests
- Test edge cases
- Ensure contract security

---

**Congratulations!** You now understand how gas and transactions work on WireFluid. This knowledge will help you build more efficient, cost-effective applications!
