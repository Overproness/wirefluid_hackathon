---
title: Your First Smart Contract
description: Deploy your first smart contract on WireFluid in just 10 minutes using Remix IDE
---

# Your First Smart Contract

Welcome to your first smart contract deployment! In this tutorial, you'll create, deploy, and interact with a simple smart contract on WireFluid's testnet. No prior blockchain experience required - we'll guide you through every step.

> **Time Required:** ~10 minutes  
> **Network:** WireFluid Testnet
> **Tools:** Web browser only (no installation needed)

---

## What You'll Learn

By the end of this tutorial, you'll understand:

- What a smart contract is and how it works
- How to write a simple Solidity contract
- How to deploy a contract to WireFluid Testnet
- How to interact with your deployed contract
- How to verify your contract on the blockchain

---

## What is a Smart Contract?

A **smart contract** is a program that runs on the blockchain. Think of it as a vending machine:

```
Traditional Contract:
👤 Person → 📄 Agreement → 👤 Person → ⏳ Wait → ✅ Execution

Smart Contract:
👤 Person → 🤖 Code → ⚡ Automatic → ✅ Instant Execution
```

**Key Properties:**

- **Immutable**: Once deployed, the code cannot be changed
- **Transparent**: Everyone can see the code and verify it
- **Trustless**: No middleman needed - code is the law

---

## The Contract We'll Build

We'll create a **Message Board** contract that:

- Stores a public message
- Allows anyone to read the message
- Allows anyone to update the message
- Records who last updated the message

**Real-World Use Cases:**

- Community bulletin boards
- Public announcements
- Guestbooks
- Status updates

---

## Prerequisites Setup

Before we begin, make sure you have:

### 1. MetaMask Wallet Installed

<details>
<summary><strong>Click here if you don't have MetaMask</strong></summary>

**Step 1:** Visit [metamask.io](https://metamask.io) and install the browser extension

**Step 2:** Click "Create a new wallet" and follow the setup wizard

**Step 3:** **IMPORTANT:** Write down your seed phrase and store it safely!

> **⚠️ Security Warning:** Never share your seed phrase with anyone. It's like your master password - anyone with it can access your funds.

</details>

### 2. WireFluid Testnet Connected

<details>
<summary><strong>Click here if you haven't added WireFluid testnet</strong></summary>

**Step 1:** Open MetaMask and click the network dropdown

**Step 2:** Click "Add Network" → "Add a network manually"

**Step 3:** Enter these details:

```
Network Name: WireFluid Testnet
RPC URL: https://evm.wirefluid.com
Chain ID: 92533
Currency Symbol: WIRE
Block Explorer: https://wirefluidscan.com
```

**Step 4:** Click "Save"

</details>

### 3. Testnet Tokens

<details>
<summary><strong>Click here to get free testnet tokens</strong></summary>

**Step 1:** Make sure MetaMask is connected to WireFluid Testnet

**Step 2:** Copy your wallet address (click the address to copy)

**Step 3:** Visit the [WireFluid Faucet](https://faucet.wirefluid.com)

**Step 4:** Paste your address and click "Request Tokens"

**Step 5:** Wait ~30 seconds and check your MetaMask balance

You should see **1.0 WIRE** (or similar) in your wallet.

</details>

> **Quick Check:** Before continuing, verify that:
>
> - MetaMask shows "WireFluid Testnet" in the network dropdown
> - Your wallet has a balance of testnet WIRE tokens

---

## Step 1: Open Remix IDE

**Remix IDE** is a web-based tool for writing and deploying smart contracts. No installation needed!

1. Open your web browser
2. Visit **[remix.ethereum.org](https://remix.ethereum.org)**
3. Wait for the interface to load

You should see:

```
┌─────────────────────────────────────────┐
│ File Explorer (left sidebar)            │
│ Code Editor (center)                    │
│ Terminal (bottom)                       │
└─────────────────────────────────────────┘
```

> **💡 Tip:** Remix works best in Chrome or Brave browsers. Make sure pop-ups are enabled for the site.

---

## Step 2: Create Your Contract File

Let's create a new file for our smart contract.

### Create the File

1. In the **File Explorer** (left sidebar), look for the "contracts" folder
2. Right-click on "contracts" folder
3. Select **"New File"**
4. Name it: `MessageBoard.sol`
5. Press Enter

> **📝 Note:** The `.sol` extension stands for Solidity, the programming language for Ethereum smart contracts.

---

## Step 3: Write the Smart Contract

Copy and paste this code into your `MessageBoard.sol` file:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MessageBoard
 * @dev A simple smart contract that stores and updates a public message
 */
contract MessageBoard {
    // State variables (stored on blockchain)
    string public message;
    address public lastUpdater;
    uint256 public updateCount;

    // Event emitted when message is updated
    event MessageUpdated(
        address indexed updater,
        string newMessage,
        uint256 timestamp
    );

    /**
     * @dev Constructor - runs once when contract is deployed
     * @param initialMessage The first message to store
     */
    constructor(string memory initialMessage) {
        message = initialMessage;
        lastUpdater = msg.sender;
        updateCount = 0;
    }

    /**
     * @dev Update the message
     * @param newMessage The new message to store
     */
    function updateMessage(string memory newMessage) public {
        message = newMessage;
        lastUpdater = msg.sender;
        updateCount += 1;

        emit MessageUpdated(msg.sender, newMessage, block.timestamp);
    }

    /**
     * @dev Get the current message
     * @return The current stored message
     */
    function getMessage() public view returns (string memory) {
        return message;
    }

    /**
     * @dev Get contract information
     * @return currentMessage The current message
     * @return updater The address of the last updater
     * @return count The number of times the message was updated
     */
    function getInfo() public view returns (
        string memory currentMessage,
        address updater,
        uint256 count
    ) {
        return (message, lastUpdater, updateCount);
    }
}
```

### Understanding the Code

Let's break down what each part does:

**Line 1: License Identifier**

```solidity
// SPDX-License-Identifier: MIT
```

- Specifies the license (MIT = open source)
- Required for all Solidity contracts

**Line 2: Solidity Version**

```solidity
pragma solidity ^0.8.20;
```

- Tells the compiler which version to use
- `^0.8.20` means "0.8.20 or higher"

**Lines 8-10: State Variables**

```solidity
string public message;
address public lastUpdater;
uint256 public updateCount;
```

- **message**: Stores the current text message
- **lastUpdater**: Stores the address of who last updated it
- **updateCount**: Counts how many times the message was updated
- **public**: Anyone can read these values

**Lines 13-17: Event**

```solidity
event MessageUpdated(
    address indexed updater,
    string newMessage,
    uint256 timestamp
);
```

- Events are like notifications
- Recorded in transaction logs
- Can be listened to by frontend apps

**Lines 23-27: Constructor**

```solidity
constructor(string memory initialMessage) {
    message = initialMessage;
    lastUpdater = msg.sender;
    updateCount = 0;
}
```

- Runs once when contract is deployed
- Sets the initial message
- `msg.sender` = address that deployed the contract

**Lines 33-40: updateMessage Function**

```solidity
function updateMessage(string memory newMessage) public {
    message = newMessage;
    lastUpdater = msg.sender;
    updateCount += 1;
    emit MessageUpdated(msg.sender, newMessage, block.timestamp);
}
```

- **public**: Anyone can call this function
- Updates the message
- Records who updated it
- Increments the counter
- Emits an event

**Lines 46-48: getMessage Function**

```solidity
function getMessage() public view returns (string memory) {
    return message;
}
```

- **view**: Reads data but doesn't change it
- Returns the current message
- No gas cost (it's just reading)

**Lines 54-62: getInfo Function**

```solidity
function getInfo() public view returns (
    string memory currentMessage,
    address updater,
    uint256 count
) {
    return (message, lastUpdater, updateCount);
}
```

- Returns all information at once
- Returns multiple values (tuple)

---

## Step 4: Compile the Contract

Now let's compile the contract to check for errors.

### Compilation Steps

1. Click the **"Solidity Compiler"** icon in the left sidebar (looks like a paper with an arrow)
2. Make sure the compiler version is **0.8.20 or higher**
3. Click the big blue **"Compile MessageBoard.sol"** button
4. Wait for compilation to complete

**Success Indicators:**

- ✅ Green checkmark appears on the Solidity Compiler icon
- "Compilation successful" message in the terminal
- No red error messages

**If you see errors:**

- Check that you copied the code exactly
- Make sure there are no extra spaces or missing characters
- Check the compiler version is 0.8.20+

---

## Step 5: Connect MetaMask to Remix

Before deploying, we need to connect Remix to your MetaMask wallet.

### Connection Steps

1. Click the **"Deploy & Run Transactions"** icon in the left sidebar (looks like an Ethereum logo)
2. Open the **Environment** dropdown.  
   Hover over **Browser extension**, then click **Injected Provider – MetaMask** to connect Remix with your MetaMask wallet.
3. MetaMask will pop up asking to connect
4. Click **"Next"** → **"Connect"**
5. Verify that Remix now shows your wallet address

You should see:

```
Environment: Injected Provider - MetaMask
Account: 0x1234...5678 (your address)
Balance: 1.0 WIRE
```

> **⚠️ Double-Check:** Make sure MetaMask shows "WireFluid Testnet" - not Ethereum Mainnet!

---

## Step 6: Deploy Your Contract

Time to deploy your contract to the blockchain!

### Deployment Steps

**Step 1: Select the contract**

- In the "Contract" dropdown, select **"MessageBoard - MessageBoard.sol"**

**Step 2: Set the initial message**

- You'll see a text box next to the Deploy button
- Type your initial message, for example: `"Hello WireFluid!"`
- Make sure to include the quotes

**Step 3: Deploy**

- Click the orange **"Deploy"** button
- MetaMask will pop up asking you to confirm the transaction

**Step 4: Confirm in MetaMask**

- Review the transaction details:
  - **Network:** WireFluid Testnet ✓
  - **Gas Fee:** Should be very small (e.g., 0.001 WIRE)
- Click **"Confirm"**

**Step 5: Wait for confirmation**

- You'll see a "pending" message in Remix
- Wait ~2-5 seconds for the transaction to complete
- Once complete, you'll see your deployed contract appear under "Deployed Contracts"

**Success!** 🎉

- You've just deployed your first smart contract!
- The contract now lives on the blockchain forever
- It has its own unique address

---

## Step 7: Interact with Your Contract

Now let's use the contract!

### Understanding the Interface

After deployment, you'll see your contract with colored buttons:

- 🔵 **Blue buttons** = Read functions (free, no gas)
- 🟠 **Orange buttons** = Write functions (cost gas)

### Reading the Message

1. Find the **blue "message"** button
2. Click it
3. You should see your initial message displayed below

Try the other blue buttons:

- **lastUpdater**: Shows your wallet address (you deployed it)
- **updateCount**: Shows `0` (no updates yet)
- **getMessage**: Returns the current message
- **getInfo**: Returns all information at once

> **💡 Tip:** Blue (view) functions are free because they just read data - they don't change the blockchain.

### Updating the Message

1. Find the **orange "updateMessage"** function
2. Click the dropdown arrow next to it to expand
3. You'll see a text input box
4. Type a new message (with quotes): `"My second message!"`
5. Click the orange **"transact"** button
6. MetaMask will ask you to confirm - click **"Confirm"**
7. Wait ~2-5 seconds

**Check the results:**

- Click the blue **"message"** button again
- You should see your new message!
- Click **"updateCount"** - it should now show `1`

### Try These Experiments

**Experiment 1: Update multiple times**

- Update the message 2-3 more times
- Check the `updateCount` after each update
- Notice how it increases each time

**Experiment 2: Check the info**

- Click the blue **"getInfo"** button
- See all the information returned at once:
  ```
  0: string: Your current message
  1: address: Your wallet address
  2: uint256: Number of updates
  ```

**Experiment 3: Check the event**

- Look at the terminal at the bottom of Remix
- Click on the transaction that updated your message
- Expand the "logs" section
- See the `MessageUpdated` event with all the details!

---

## Step 8: Verify Your Contract on WireScan

Let's verify that your contract is actually on the blockchain!

### Find Your Contract

1. In Remix, under "Deployed Contracts", find your contract address
2. Click the **copy icon** to copy the address (it looks like `0x1234...`)
3. Open a new browser tab
4. Go to **[wirefluidscan.com](https://wirefluidscan.com)**
5. Paste your contract address in the search bar
6. Press Enter

### What You'll See

On WireScan, you can explore:

**Contract Tab:**

- Contract address
- Creator (your wallet address)
- Creation transaction
- Balance (should be 0)

**Transactions Tab:**

- Your deployment transaction
- All updateMessage transactions
- Gas used for each transaction

**Events Tab:**

- All `MessageUpdated` events
- Timestamps
- Who updated the message

**Code Tab:**

- Shows "[Contract not verified]"
- Don't worry - we'll cover verification in the intermediate tutorials!

> **💡 Fun Fact:** Your contract is now permanently on the blockchain! Even if you close Remix, the contract will remain and anyone can interact with it using its address.

---

## Understanding Gas Fees

You may have noticed MetaMask asking you to pay "gas fees". Let's understand what that means.

### What is Gas?

**Gas** is the fee you pay to use the blockchain. Think of it like:

- 🚗 **Gas for a car** = Fuel to make it run
- ⛽ **Gas for blockchain** = Fee to execute transactions

### Why Do We Pay Gas?

1. **Compensates validators** who process transactions
2. **Prevents spam** (otherwise people could flood the network)
3. **Prioritizes transactions** (higher gas = faster processing)

### Gas Costs in This Tutorial

```
Deployment:        ~1,200,000 gas  ≈ $0.01-0.05
Update Message:    ~50,000 gas     ≈ $0.001-0.01
Read Message:      0 gas           ≈ FREE!
```

> **Cost Comparison:**  
> The same operations on Ethereum mainnet would cost $50-200+  
> WireFluid is **1000x cheaper**!

### Types of Operations

| Operation          | Gas Cost  | Example                           |
| ------------------ | --------- | --------------------------------- |
| **Reading data**   | FREE      | Calling `message`, `getMessage()` |
| **Writing data**   | COSTS GAS | Calling `updateMessage()`         |
| **Deploying**      | COSTS GAS | Deploying the contract            |
| **Sending tokens** | COSTS GAS | Transferring WIRE                 |

---

## Common Issues & Solutions

### Issue 1: "Insufficient funds"

**Problem:** MetaMask shows "Insufficient funds for gas"

**Solutions:**

- Make sure you're on WireFluid Testnet (not mainnet!)
- Get more testnet tokens from the [faucet](https://faucet.wirefluid.com)
- Wait a few minutes and try again

### Issue 2: "Transaction failed"

**Problem:** Transaction shows as failed in MetaMask

**Solutions:**

- Check that you included quotes around your message: `"Hello"`
- Make sure your message isn't too long (keep it under 1000 characters)
- Try refreshing Remix and reconnecting MetaMask

### Issue 3: "Cannot read properties"

**Problem:** Clicking a button shows an error

**Solutions:**

- Make sure the contract is deployed (check under "Deployed Contracts")
- Try re-deploying the contract
- Refresh the Remix page and reconnect MetaMask

### Issue 4: "Wrong network"

**Problem:** MetaMask is on the wrong network

**Solutions:**

- Click the MetaMask network dropdown
- Select "WireFluid Testnet"
- Refresh the Remix page
- Reconnect MetaMask to Remix

---

## What You've Accomplished!

Congratulations! You've just:

**Written your first smart contract** in Solidity  
**Compiled and deployed** to WireFluid testnet  
**Interacted with your contract** by reading and writing data  
**Verified your contract** on the blockchain explorer  
**Understood gas fees** and how blockchain transactions work

---

## Key Concepts Learned

### Smart Contract Basics

- Contracts are programs that run on the blockchain
- They have state variables that store data
- Functions allow you to interact with the contract
- Events record important actions

### Blockchain Transactions

- Writing data costs gas (paid in WIRE)
- Reading data is free
- Transactions are permanent and can't be reversed
- Everything is transparent and verifiable

### Development Tools

- **Remix IDE**: Write and deploy contracts
- **MetaMask**: Manage your wallet and sign transactions
- **WireScan**: Explore the blockchain

---

## Challenge Yourself!

Ready to practice? Try modifying the contract:

### Challenge 1: Add a Like Counter

Add a function that lets people "like" the message:

```solidity
uint256 public likes;

function likeMessage() public {
    likes += 1;
}
```

### Challenge 2: Limit Message Length

Prevent messages longer than 280 characters:

```solidity
function updateMessage(string memory newMessage) public {
    require(bytes(newMessage).length <= 280, "Message too long!");
    message = newMessage;
    lastUpdater = msg.sender;
    updateCount += 1;
}
```

### Challenge 3: Add a Reset Function

Allow only the deployer to reset the message:

```solidity
address public owner;

constructor(string memory initialMessage) {
    message = initialMessage;
    lastUpdater = msg.sender;
    updateCount = 0;
    owner = msg.sender;
}

function reset() public {
    require(msg.sender == owner, "Only owner can reset");
    message = "Message board reset";
    updateCount = 0;
}
```

> **💡 Tip:** After making changes, you need to compile and deploy a new contract. The old one will still exist on the blockchain!

---

## Next Steps

Now that you've deployed your first contract, here's what to learn next:

### Continue Beginner Path

**[Deploy ERC-20 Token →](/tutorials-examples/beginner-tutorials/deploy-erc20-using-remix-ide)**

- Create your own cryptocurrency
- Understand token standards

**[Understanding Gas & Transactions →](/tutorials-examples/beginner-tutorials/understanding-gas-transactions)**

- Deep dive into gas mechanics
- Optimize transaction costs
- Understand transaction lifecycle

### Ready for More?

**[Deploy with Hardhat →](/tutorials-examples/intermediate-tutorials/deploy-erc20)**

- Professional development environment
- Use command-line tools

**[Testing Smart Contracts →](/tutorials-examples/intermediate-tutorials/testing-smart-contracts)**

- Write unit tests
- Test edge cases
- Ensure contract security

---

## Additional Resources

### Learning Resources

- [Solidity Documentation](https://docs.soliditylang.org) - Official Solidity docs
- [Remix Documentation](https://remix-ide.readthedocs.io) - Learn more about Remix
- [OpenZeppelin Contracts](https://docs.openzeppelin.com) - Secure contract library

### WireFluid Resources

- [Developer Guide](/developer-guide/prerequisites/install-nodejs) - Set up your environment
- [Network Details](/developer-guide/network-configuration/network-details) - RPC endpoints and parameters
- [WireScan Explorer](https://wirefluidscan.com) - Explore transactions

### Practice More

- [Solidity by Example](https://solidity-by-example.org) - Code examples

---

**Congratulations again on deploying your first smart contract!**

You're now part of the blockchain revolution. Keep learning, keep building, and welcome to the WireFluid community!
