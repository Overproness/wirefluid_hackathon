# Command Line Development with Hardhat

Hardhat is a professional development environment for building, testing, and deploying smart contracts on WireFluid. It's the tool of choice for production-ready applications.

> **Best For:** Production applications, team development, complex projects, automated testing  
> **Setup Time:** ~5-10 minutes  
> **Requirements:** Node.js ≥ 18, basic command-line familiarity

## Development Path Overview

WireFluid offers two complementary development paths:

```text
Development Paths
│
├── Browser-Based (Remix IDE)
│   ├── No installation needed
│   ├── Visual interface
│   ├── Perfect for learning
│   └── Great for prototyping
│
└── Command Line (Hardhat) ← You are here
    ├── Professional development
    ├── Automated testing
    ├── CI/CD integration
    └── Team collaboration
```

## When to Use Hardhat

### Perfect For:

**Production Applications**

- Enterprise-grade smart contracts
- High-value deployments
- Multi-contract systems
- Integration with existing codebases

**Team Development**

- Version control (Git) workflows
- Code reviews and collaboration
- Standardized development processes
- Consistent environments across teams

**Advanced Features**

- Comprehensive automated testing
- Custom deployment pipelines
- Gas optimization and profiling
- Integration with CI/CD systems
- Custom scripts and automation

**Complex Projects**

- Large codebases with multiple contracts
- Dependency management
- Upgradeable contract patterns
- Off-chain integration

### Not Ideal For:

**Quick Prototyping** - Remix IDE is faster for simple tests  
**Absolute Beginners** - Some command-line experience needed  
**Single Simple Contract** - Overkill for very basic projects

> 💡 **Tip**: Start with Remix IDE to learn the basics, then graduate to Hardhat when you're ready for production development!

## Getting Started with Hardhat

### Step 1: Project Initialization

Create and initialize a new Hardhat project:

```bash
mkdir my-hardhat-project
cd my-hardhat-project
npx hardhat --init
```

During initialization, select these recommended options:

- **Hardhat version**: hardhat-3
- **Project location**: . (current directory)
- **Project type**: A TypeScript Hardhat project using Mocha and Ethers.js

### Step 2: Project Structure (Hardhat v3)

After initialization, your project will have this structure:

```text
my-hardhat-project/
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

**Directory Overview:**

- `contracts/` - All Solidity smart contract source files
- `ignition/` - Deployment modules using Hardhat Ignition (new in v3)
- `scripts/` - Custom automation and interaction scripts
- `test/` - Unit and integration tests
- `hardhat.config.ts` - Main configuration file

### Step 3: Install Dependencies

For an ERC-20 token project, install OpenZeppelin contracts:

```bash
npm install @openzeppelin/contracts
```

Clean up example files (optional):

```bash
rm contracts/Counter.sol
rm ignition/modules/Counter.ts
rm test/Counter.ts
```

## Hardhat v3 Configuration for WireFluid

### Basic Configuration

Update `hardhat.config.ts` with WireFluid network settings:

```typescript
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
  },
});
```

> **Note**: At the time of writing, 0.8.33 is the latest Solidity version. Check the [Solidity releases page](https://github.com/ethereum/solidity/releases) for the current version.

### Environment Setup

Create a `.env` file in your project root:

```bash
WIREFLUID_RPC_URL=https://evm.wirefluid.com
PRIVATE_KEY=0xYour_Testnet_Private_Key
```

Install `dotenv` to load environment variables:

```bash
npm install dotenv
```

> ⚠️ **IMPORTANT**: Never commit your `.env` file or private keys to version control. Add `.env` to your `.gitignore` file immediately.

## Key Features of Hardhat

### 1. Automated Testing Framework

Hardhat provides a comprehensive testing environment:

```typescript
// Example test for an ERC-20 token
import { expect } from "chai";
import { ethers } from "hardhat";
import { TestToken } from "../typechain-types";

describe("TestToken", function () {
  let testToken: TestToken;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const TestTokenFactory = await ethers.getContractFactory("TestToken");
    testToken = await TestTokenFactory.deploy(1000000);
    await testToken.waitForDeployment();
  });

  it("Should assign total supply to owner", async function () {
    const ownerBalance = await testToken.balanceOf(owner.address);
    expect(await testToken.totalSupply()).to.equal(ownerBalance);
  });

  it("Should transfer tokens between accounts", async function () {
    await testToken.transfer(addr1.address, 50);
    const addr1Balance = await testToken.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(50);
  });
});
```

### 2. Hardhat Ignition (Deployment System)

Hardhat v3 uses Ignition for structured deployments:

```typescript
// ignition/modules/TestToken.ts
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

### 3. Built-in Console and Debugging

Access an interactive JavaScript console with your contracts:

```bash
npx hardhat console --network wirefluidTestnet
```

```javascript
// Inside the Hardhat console
const TestToken = await ethers.getContractFactory("TestToken");
const token = await TestToken.deploy(1000000);
await token.deployed();
console.log("Token deployed at:", token.address);
```

### 4. Network Management

Hardhat supports multiple networks simultaneously:

```typescript
// Additional network configurations
networks: {
  hardhat: {
    // Local development network
  },
  wirefluidTestnet: {
    url: process.env.WIREFLUID_RPC_URL!,
    chainId: 92533,
    accounts: [process.env.PRIVATE_KEY!],
  },
  wirefluidMainnet: {
    url: process.env.WIREFLUID_MAINNET_RPC_URL!,
    chainId: 12345, // Mainnet chain ID
    accounts: [process.env.PRIVATE_KEY!],
  }
}
```

### 5. Plugin Ecosystem

Extend Hardhat with popular plugins:

```bash
# Common Hardhat plugins
npm install @nomicfoundation/hardhat-verify --save-dev
npm install hardhat-gas-reporter --save-dev
npm install solidity-coverage --save-dev
```

## Complete Development Workflow

### Step 1: Create Your Contract

```solidity
// contracts/TestToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("TestToken", "TST") {
        _mint(msg.sender, initialSupply);
    }
}
```

### Step 2: Compile Contracts

```bash
npx hardhat compile
```

### Step 3: Write Tests

```bash
# Create test file
touch test/TestToken.test.ts
```

### Step 4: Run Tests

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/TestToken.test.ts

# Run tests with gas reporting
npx hardhat test --gas
```

### Step 5: Prepare for Deployment

1. **Fund your wallet** with testnet WIRE tokens from the [faucet](https://faucet.wirefluid.com/)
2. **Verify your environment variables** are correctly set

### Step 6: Deploy with Ignition

```bash
npx hardhat ignition deploy ignition/modules/TestToken.ts \
  --network wirefluidTestnet
```

### Step 7: Verify on WireScan

After deployment, verify your contract on [WireScan](https://wirefluidscan.com/):

1. Paste the deployed contract address
2. View transaction details and token information

### Step 8: Interact with Deployed Contract

Create interaction scripts in the `scripts/` directory:

```typescript
// scripts/interact.ts
import { ethers } from "hardhat";

async function main() {
  const tokenAddress = "0x..."; // Your deployed address
  const TestToken = await ethers.getContractFactory("TestToken");
  const token = TestToken.attach(tokenAddress);

  const balance = await token.balanceOf(await ethers.getSigners()[0].address);
  console.log("Owner balance:", balance.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Run the script:

```bash
npx hardhat run scripts/interact.ts --network wirefluidTestnet
```

## Best Practices

### Project Organization

```text
contracts/
├── tokens/
│   ├── TestToken.sol
│   └── TokenSale.sol
├── governance/
│   └── DAO.sol
├── interfaces/
│   └── IToken.sol
├── libraries/
│   └── MathUtils.sol
└── utils/
    └── AddressHelper.sol

ignition/
├── modules/
│   ├── TokenDeployment.ts
│   └── DAODeployment.ts
└── plans/
    └── FullDeployment.ts

test/
├── unit/
│   └── TestToken.test.ts
├── integration/
│   └── TokenSale.test.ts
└── fixtures/
    └── common.ts

scripts/
├── deploy.ts
├── verify.ts
└── tasks/
    └── mint-tokens.ts
```

### Security Considerations

1. **Use audited libraries**: Leverage OpenZeppelin for standard implementations
2. **Comprehensive testing**: Aim for high test coverage, especially for critical functions
3. **Code reviews**: Always have contracts reviewed before mainnet deployment
4. **Upgradeability**: Consider upgrade patterns for long-term maintenance
5. **Gas optimization**: Profile and optimize gas usage for frequently called functions

### Testing Strategy

```typescript
// Comprehensive test structure
describe("Contract Tests", function () {
  describe("Unit Tests", function () {
    // Test individual functions in isolation
  });

  describe("Integration Tests", function () {
    // Test interactions between contracts
  });

  describe("Edge Cases", function () {
    // Test boundary conditions and error cases
  });

  describe("Gas Profiling", function () {
    // Monitor and optimize gas usage
  });
});
```

## Comparison: Hardhat vs Remix IDE

| Feature             | Hardhat                     | Remix IDE                |
| ------------------- | --------------------------- | ------------------------ |
| **Setup Time**      | ~5-10 minutes               | Instant                  |
| **Installation**    | Node.js required            | Browser only             |
| **Learning Curve**  | Moderate                    | Easy                     |
| **Interface**       | Command Line                | Visual                   |
| **Testing**         | Advanced frameworks         | Basic testing            |
| **Debugging**       | Console & traces            | Built-in visual debugger |
| **Version Control** | Native Git integration      | Manual export/import     |
| **Team Work**       | Excellent for collaboration | Difficult for teams      |
| **Production Use**  | Ideal for production        | Best for prototyping     |

## Common Workflows

### Workflow 1: Daily Development Cycle

```bash
# 1. Write/update contract code
# 2. Compile to check for errors
npx hardhat compile

# 3. Run tests
npx hardhat test

# 4. If tests pass, deploy to testnet
npx hardhat ignition deploy ignition/modules/MyModule.ts --network wirefluidTestnet

# 5. Verify on WireScan
# 6. Run integration tests against deployed contract
```

### Workflow 2: CI/CD Pipeline

```yaml
# Example GitHub Actions workflow
name: Smart Contract CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npx hardhat compile
      - run: npx hardhat test

  deploy-testnet:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx hardhat ignition deploy ignition/modules/MyModule.ts --network wirefluidTestnet
        env:
          PRIVATE_KEY: ${{ secrets.DEPLOYER_PRIVATE_KEY }}
          WIREFLUID_RPC_URL: ${{ secrets.WIREFLUID_RPC_URL }}
```

### Workflow 3: Multi-Contract Deployment

```typescript
// Complex deployment with dependencies
const DeploymentModule = buildModule("FullDeployment", (m) => {
  // Deploy token first
  const token = m.contract("TestToken", [1_000_000n * 10n ** 18n]);

  // Deploy staking contract that uses the token
  const staking = m.contract("Staking", [token]);

  // Deploy governance contract that uses both
  const governance = m.contract("Governance", [token, staking]);

  return { token, staking, governance };
});
```

## Troubleshooting

### Common Issues and Solutions

1. **"ProviderError: insufficient funds"**
   - Ensure your wallet has testnet WIRE tokens from the faucet
   - Check that you're using the correct private key in your `.env` file

2. **"Error HH8: There's one or more errors in your config file"**
   - Verify your `hardhat.config.ts` syntax
   - Ensure all required imports are present

3. **Contract verification fails on WireScan**
   - Make sure you're using the exact same compiler version and settings
   - Verify all constructor arguments are correct

4. **Tests pass locally but fail on testnet**
   - Check network configuration
   - Ensure testnet has been mined sufficiently for state changes

## Next Steps

### Deepen Your Hardhat Knowledge

- Explore [Hardhat's official documentation](https://hardhat.org/docs)
- Learn about [Hardhat Ignition](https://hardhat.org/ignition) for advanced deployments
- Study [plugin development](https://hardhat.org/plugins) to extend Hardhat's capabilities

### WireFluid-Specific Resources

- [WireFluid Testnet Faucet](https://faucet.wirefluid.com/)
- [WireScan Block Explorer](https://wirefluidscan.com/)

---

Hardhat provides the professional tooling needed for serious WireFluid development. While it requires more setup than Remix IDE, it pays off with robust testing, reliable deployments, and scalable project structures perfect for production applications.

Ready to build? Initialize your Hardhat project and deploy your contract to WireFluid today!
