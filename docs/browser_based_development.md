---
title: Browser-Based Development (Remix IDE)
description: Learn smart contract development using Remix IDE - no installation required, perfect for beginners and rapid prototyping
---

# Browser-Based Development with Remix IDE

Remix IDE is a powerful, browser-based development environment that lets you write, compile, deploy, and test smart contracts without installing anything on your computer. It's the fastest way to start building on WireFluid.

> **Best For:** Beginners, quick prototyping, learning Solidity, testing ideas  
> **Setup Time:** 0 minutes (instant)  
> **Requirements:** Modern web browser only

---

## Development Path Overview

WireFluid offers two development paths to suit different needs and experience levels:

```
Development Paths
│
├─ Browser-Based (Remix IDE) ← You are here
│  ├─ No installation needed
│  ├─ Visual interface
│  ├─ Perfect for learning
│  └─ Great for prototyping
│
├─ Command Line (Hardhat)
│  ├─ Professional development
│  ├─ Automated testing
│  ├─ CI/CD integration
│  └─ Team collaboration

```

**This guide covers the Browser-Based path.** For other path, see:

- [Command Line Development (Hardhat) →](/developer-guide/development-paths/command-line-hardhat)

---

## When to Use Remix IDE

### Perfect For:

**Learning & Education**

- Just starting with smart contracts
- Learning Solidity syntax
- Understanding blockchain concepts
- Teaching or demonstrating code

**Rapid Prototyping**

- Testing ideas quickly
- Building proof of concepts
- Experimenting with contracts
- Sharing code snippets

**Simple Projects**

- Single-contract deployments
- Basic token creation
- Simple dApps
- Personal projects

**Code Review & Auditing**

- Reviewing contract code
- Testing contract interactions
- Debugging issues
- Analyzing gas usage

### Not Ideal For:

**Complex Projects**

- Multi-contract systems
- Large codebases
- Team collaboration
- Version control workflows

**Production Deployments**

- Enterprise applications
- High-value contracts
- Automated testing requirements
- CI/CD pipelines

**Advanced Features**

- Automated test suites
- Custom deployment scripts
- Gas optimization profiling
- Integration testing

> **💡 Tip:** Start with Remix to learn, then graduate to [Hardhat](/developer-guide/development-paths/command-line-hardhat) for production projects!

---

## Getting Started with Remix

### Step 1: Open Remix IDE

1. Open your web browser (Chrome, Brave, or Firefox recommended)
2. Visit **[remix.ethereum.org](https://remix.ethereum.org)**
3. Wait for the interface to load (~5 seconds)

**No download. No installation. No configuration.**

### Step 2: Understand the Interface

Remix has three main sections:

```
┌─────────────────────────────────────────────────┐
│             Remix IDE Interface                 │
├──────────────┬──────────────────┬───────────────┤
│              │                  │               │
│  Left Panel  │   Code Editor    │  Right Panel  │
│              │                  │               │
│  • File      │   Your smart     │  • RemixAI    │
│    Explorer  │   contract code  │               │
│  • Search    │   appears here   │               │
│  • Plugins   │                  │               │
│              │                  │               │
├──────────────┴──────────────────┴───────────────┤
│              Terminal (Bottom)                  │
│  Logs, errors, transaction details              │
└─────────────────────────────────────────────────┘
```

### Step 3: Create Your First File

1. In the **File Explorer** (left panel), find the "contracts" folder
2. Right-click on "contracts"
3. Select **"New File"**
4. Name it `HelloWireFluid.sol`
5. Press Enter

---

## Key Features

### 1. Built-in Solidity Compiler

**No installation needed** - Remix includes multiple Solidity compiler versions.

**How to compile:**

1. Click the **"Solidity Compiler"** icon (left sidebar)
2. Select compiler version (0.8.20+ recommended)
3. Click **"Compile"**
4. Check for errors/warnings

**Auto-compile option:**

- Enable "Auto compile" to compile on every save
- Useful for instant feedback while coding

### 2. Integrated Debugger

**Step through transactions** to find bugs:

1. Deploy your contract
2. Execute a function
3. Click the transaction in the terminal
4. Click **"Debug"**
5. Step through execution line-by-line

**Debugger features:**

- View variable values at each step
- See gas consumption
- Identify revert reasons
- Analyze state changes

### 3. Multiple Deployment Environments

Remix supports different execution environments:

| Environment           | Use Case                                 | Cost |
| --------------------- | ---------------------------------------- | ---- |
| **JavaScript VM**     | Testing locally (browser only)           | FREE |
| **Injected Provider** | Deploy to WireFluid Testnet via MetaMask | FREE |

**For WireFluid, use:**

- **Injected Provider (MetaMask)** for deployment

### 4. Plugin System

Extend Remix functionality with plugins:

**Essential Plugins:**

- **Solidity Unit Testing** - Write and run tests
- **Debugger** - Debug transactions
- **Gas Profiler** - Analyze gas usage
- **Flattener** - Flatten contract files

**How to activate:**

1. Click the **Plugin Manager** icon
2. Search for the plugin
3. Click **"Activate"**

### 5. File Management

**Local file system:**

- Files saved in browser storage
- Persist between sessions
- Export/import functionality

**Import from GitHub:**

```solidity
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
```

**Import from npm:**

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
```

---

## Remix Workflow

### Standard Development Flow

```
1. Write Code
   ↓
2. Compile
   ↓
3. Test Locally (JS VM)
   ↓
4. Debug if Needed
   ↓
5. Deploy to WireFluid Testnet via MetaMask
   ↓
6. Verify on WireScan
   ↓
7. Interact & Test
   ↓
8. Deploy to Mainnet (when ready)
```

### Example: Complete Workflow

**Step 1: Write Your Contract**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private storedData;

    event DataUpdated(uint256 newValue);

    function set(uint256 x) public {
        storedData = x;
        emit DataUpdated(x);
    }

    function get() public view returns (uint256) {
        return storedData;
    }
}
```

**Step 2: Compile**

1. Click **Solidity Compiler** icon
2. Select compiler version: **0.8.20**
3. Click **"Compile SimpleStorage.sol"**
4. Check for green checkmark (success)

**Step 3: Test Locally**

1. Click **Deploy & Run** icon
2. Set Environment: **JavaScript VM (London)**
3. Click **Deploy**
4. Test the `set()` and `get()` functions

**Step 4: Deploy to WireFluid**

1. Switch Environment to: **Injected Provider - MetaMask**
2. MetaMask will pop up - click **Connect**
3. Ensure MetaMask is on **WireFluid Testnet**
4. Click **Deploy**
5. Confirm transaction in MetaMask
6. Wait for confirmation

**Step 5: Interact**

1. Contract appears under "Deployed Contracts"
2. Expand to see all functions
3. Call `set(42)` - orange button (costs gas)
4. Call `get()` - blue button (free)
5. View results below

---

## Connecting to WireFluid

### Prerequisites

1. **MetaMask setup** - [Setup MetaMask Wallet](/developer-guide/prerequisites/setup-metamask-wallet)
2. **WireFluid testnet added** - [Setup guide](/developer-guide/prerequisites/network-config)
3. **Testnet WIRE tokens** - [Get from faucet](https://faucet.wirefluid.com)

### Connection Steps

**1. Open Remix**
Visit [remix.ethereum.org](https://remix.ethereum.org)

**2. Navigate to Deploy & Run**
Click the **Ethereum logo** icon in left sidebar

**3. Select Injected Provider**
In the "Environment" dropdown, select **"Injected Provider - MetaMask"**

**4. Approve Connection**
MetaMask will pop up:

- Click **"Next"**
- Click **"Connect"**
- Remix can now access your wallet

**5. Verify Network**
Check that MetaMask shows:

```
Network: WireFluid Testnet
Chain ID: 92533
Balance: X.XX WIRE
```

**6. Deploy Your Contract**

- Select your contract from the dropdown
- Enter constructor parameters (if any)
- Click **"Deploy"** (orange button)
- Confirm in MetaMask
- Wait for confirmation

---

## Best Practices for Remix

### Code Organization

**Use folders for structure:**

```
contracts/
├── core/
│   ├── Token.sol
│   └── Staking.sol
├── interfaces/
│   └── IToken.sol
├── libraries/
│   └── SafeMath.sol
└── tests/
    └── Token.test.sol
```

**Naming conventions:**

- Contracts: `PascalCase.sol`
- Interfaces: `IContractName.sol`
- Libraries: `LibraryName.sol`
- Tests: `ContractName.test.sol`

### Testing Strategy

**1. Local Testing First**

```
Always test with JavaScript VM before deploying:
Faster (no blockchain wait times)
Free (no gas costs)
Easy debugging
Quick iterations
```

**2. Write Unit Tests**

```solidity
// In contracts/tests/SimpleStorage.test.sol
import "remix_tests.sol";
import "../SimpleStorage.sol";

contract SimpleStorageTest {
    SimpleStorage storage;

    function beforeAll() public {
        storage = new SimpleStorage();
    }

    function testSetAndGet() public {
        storage.set(42);
        Assert.equal(storage.get(), 42, "Value should be 42");
    }
}
```

**3. Test on Testnet**
Before mainnet deployment:

- Deploy to WireFluid testnet
- Test all functions
- Monitor gas costs
- Check edge cases

### Security Considerations

**Before deploying to mainnet:**

1. **Use Latest Compiler**
   - Select Solidity 0.8.20 or higher
   - Enable optimizer (200 runs)
   - Check for warnings

2. **Import Audited Code**

```solidity
// Good: Use OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Bad: Write everything from scratch
contract MyToken { /* reinventing the wheel */ }
```

3. **Enable Security Plugins**
   - **Slither** - Static analysis
   - **MythX** - Security scanning
   - Activate via Plugin Manager

4. **Test Edge Cases**
   - Zero values
   - Maximum values
   - Unauthorized access
   - Reentrancy scenarios

---

## Tips & Tricks

### Keyboard Shortcuts

```
Ctrl/Cmd + S        Save file
Ctrl/Cmd + F        Find
Ctrl/Cmd + H        Find and replace
Ctrl/Cmd + /        Toggle comment
Ctrl/Cmd + D        Duplicate line
Alt + Up/Down       Move line up/down
```

### Quick Actions

**Fast compilation:**

- Enable "Auto compile" for instant feedback
- Use "Solidity" language mode for syntax highlighting

**Efficient testing:**

- Pin frequently used contracts
- Use JavaScript VM for rapid testing
- Keep terminal visible for quick feedback

**Smart deployment:**

- Set gas limit before deploying
- Test constructor parameters locally first
- Copy contract address immediately after deployment

### Useful Settings

**Solidity Compiler:**

```
Enable optimization: ON
   Runs: 200 (balanced)

Auto compile: ON (for rapid development)

Hide warnings: OFF (catch potential issues)
```

**Deploy & Run:**

```
Gas limit: 3000000 (sufficient for most contracts)

Value: 0 (unless sending WIRE with deployment)
```

---

## Common Workflows

### Workflow 1: Learning Solidity

```
1. Start with examples:
   - File > Load > Select example contracts

2. Modify and experiment:
   - Change values
   - Add functions
   - Break things (safely!)

3. Test immediately:
   - JavaScript VM for instant feedback

4. Read error messages:
   - Learn from mistakes
   - Understand compiler warnings
```

### Workflow 2: Building a Token

```
1. Import OpenZeppelin:
   import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

2. Create your token:
   contract MyToken is ERC20 {
       constructor() ERC20("MyToken", "MTK") {
           _mint(msg.sender, 1000000 * 10**18);
       }
   }

3. Test locally (JavaScript VM)

4. Deploy to WireFluid Testnet

5. Add to MetaMask

6. Test transfers
```

### Workflow 3: Testing Contract Interactions

```
1. Deploy multiple contracts:
   - Contract A
   - Contract B (uses Contract A)

2. Copy Contract A address

3. Deploy Contract B with A's address

4. Test interactions

5. Debug if needed
```

---

## Comparison: Remix vs Other Tools

| Feature             | Remix     | Hardhat     | Foundry        |
| ------------------- | --------- | ----------- | -------------- |
| **Setup Time**      | Instant   | ~5 minutes  | ~10 minutes    |
| **Installation**    | None      | Node.js     | Rust + Foundry |
| **Learning Curve**  | Easy      | Moderate    | Steep          |
| **UI**              | Visual    | CLI         | CLI            |
| **Testing**         | Basic     | Advanced    | Advanced       |
| **Debugging**       | Built-in  | Via plugins | Via traces     |
| **Version Control** | Manual    | Native Git  | Native Git     |
| **Team Work**       | Difficult | Easy        | Easy           |
| **Best For**        | Learning  | Production  | Performance    |

---

## Resources

### Official Documentation

- [Remix Documentation](https://remix-ide.readthedocs.io)

### Tutorials Using Remix

- [Your First Smart Contract →](/tutorials-examples/beginner-tutorials/your-first-smart-contract)
- [Deploy ERC-20 Token →](/tutorials-examples/beginner-tutorials/deploy-erc20-using-remix-ide)

### Advanced Topics

- [Remix Plugins Development](https://remix-plugin-docs.readthedocs.io)

---

## Next Steps

### Continue with Remix

**Master the basics:**

- [Your First Smart Contract →](/tutorials-examples/beginner-tutorials/your-first-smart-contract)
- [Understanding Gas →](tutorials-examples/beginner-tutorials/understanding-gas-transactions)
- [Deploy ERC-20 Token →](/tutorials-examples/beginner-tutorials/deploy-erc20-using-remix-ide)

### Explore Other Paths

**Ready for professional development?**

- [Command Line with Hardhat →](/developer-guide/development-paths/command-line-hardhat)

---

## Common Questions

**Q: How do I save my work?**
A: Remix auto-saves to browser storage. For backups, export your workspace regularly.

**Q: Can I deploy to mainnet with Remix?**
A: Yes, and we recommend testing thoroughly on testnet first and considering [Hardhat](/developer-guide/development-paths/command-line-hardhat) for high-value contracts.

**Q: Is Remix secure?**
A: Remix is open-source and audited, and always verify contract addresses for mainnet deployments.

---

**Ready to start building?** Open [Remix IDE](https://remix.ethereum.org) and deploy your first contract to WireFluid in minutes!
