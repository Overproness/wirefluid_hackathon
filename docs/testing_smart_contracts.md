---
title: Testing Smart Contracts
description: Learn to write comprehensive tests for your smart contracts using Hardhat v3, Mocha, and Chai
---

# Testing Smart Contracts

Testing is critical for smart contract development. Unlike traditional apps, bugs in smart contracts can't be easily fixed after deployment and may result in permanent loss of funds. This tutorial teaches you to write professional-grade tests using Hardhat v3.

> **Time Required:** ~35 minutes  
> **Tools:** Node.js, Hardhat v3, VS Code  
> **Prerequisites:** [Deploy ERC-20 with Hardhat](/tutorials-examples/intermediate-tutorials/deploy-erc20)

---

## What You'll Learn

By the end of this tutorial:

- Why testing is crucial for smart contracts
- How to set up Hardhat testing environment
- Write unit tests with Mocha and Chai
- Test contract deployment and functionality
- Handle errors and edge cases
- Check code coverage
- Best practices for smart contract testing

---

## Why Test Smart Contracts?

### The Stakes Are High

```
Traditional App Bug:
Deploy → Bug Found → Fix → Redeploy

Smart Contract Bug:
Deploy → Bug Found → Funds Lost
```

**Real-World Consequences:**

- **The DAO Hack (2016):** $60 million lost due to reentrancy bug
- **Parity Wallet (2017):** $280 million locked forever
- **Poly Network (2021):** $600 million stolen (later returned)

### Benefits of Testing

**1. Catch Bugs Early**

```javascript
// Without tests: Deploy → Users may lose money
// With tests: Test fails → Fix → Deploy safely
```

**2. Prevent Regressions**

```javascript
// Change code → Run tests → Immediately know if you broke something
```

**3. Documentation**

```javascript
// Tests show how the contract should behave
// Better than comments that might be outdated
```

**4. Confidence**

```javascript
// 100% code coverage = Sleep well at night
```

---

## Prerequisites Check

Before starting, ensure you have:

### Required

- [ ] **Node.js v18+** - [Install guide](/developer-guide/prerequisites/install-nodejs)
- [ ] **Hardhat project** - [Setup guide](/tutorials-examples/intermediate-tutorials/deploy-erc20)
- [ ] **Basic JavaScript** knowledge
- [ ] **Understanding of smart contracts** - [Beginner tutorials](/tutorials-examples/beginner-tutorials/your-first-smart-contract#what-is-a-smart-contract)

### Verify Setup

```bash
# Check Node.js version
node --version
# Should show: v18.0.0 or higher

# Check npm version
npm --version
# Should show: 9.0.0 or higher
```

---

## Project Setup

### Step 1: Create New Hardhat Project

```bash
# Create project directory
mkdir token-testing-tutorial
cd token-testing-tutorial
```

### Step 2: Initialize Hardhat

```bash
npx hardhat --init
```

**Select these options:**

```
✔ Which version of Hardhat would you like to use? · hardhat-3
✔ Where would you like to initialize the project? · .
✔ What type of project would you like to initialize?
  › A TypeScript Hardhat project using Mocha and Ethers.js
```

### Step 3: Install Dependencies

```bash
# Testing libraries (included in Hardhat 3)
# Chai assertions and Mocha test framework are built-in

# Install OpenZeppelin contracts
npm install @openzeppelin/contracts
```

### Step 4: Project Structure

Your project should look like this:

```
token-testing-tutorial/
├── contracts/
│   └── Counter.sol (example - we'll replace)
├── ignition/
│   └── modules/
│       └── Counter.ts
├── test/
│   └── Counter.ts (example - we'll replace)
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

---

## Create the Token Contract

### Step 1: Remove Example Files

```bash
rm contracts/Counter.sol
rm test/Counter.ts
rm ignition/modules/Counter.ts
```

### Step 2: Create Token Contract

Create `contracts/MyToken.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev ERC20 token with minting capability
 */
contract MyToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18; // 1 million tokens

    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 100_000 * 10**18); // 100k tokens
    }

    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to receive tokens
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
}
```

### Step 3: Compile Contract

```bash
npx hardhat compile
```

**Expected output:**

```
Compiled 1 Solidity file successfully
```

---

## Writing Your First Test

### Test Structure

Create `test/MyToken.test.ts`:

```typescript
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("MyToken", function () {
  // Contract
  let token: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  // Deploy fresh contract before each test
  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract using the new deployContract method
    token = await ethers.deployContract("MyToken");
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should assign the initial supply to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      const initialSupply = ethers.parseEther("100000");
      expect(ownerBalance).to.equal(initialSupply);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await token.name()).to.equal("MyToken");
      expect(await token.symbol()).to.equal("MTK");
    });

    it("Should set the correct max supply", async function () {
      const maxSupply = ethers.parseEther("1000000");
      expect(await token.MAX_SUPPLY()).to.equal(maxSupply);
    });
  });
});
```

### Run Your First Test

```bash
npx hardhat test
```

**Expected output:**

```
  MyToken
    Deployment
      ✔ Should set the right owner
      ✔ Should assign the initial supply to the owner
      ✔ Should set the correct name and symbol
      ✔ Should set the correct max supply

  4 passing (2s)
```

---

## Testing Token Transfers

Add to `test/MyToken.test.ts`:

```typescript
describe("Transfers", function () {
  it("Should transfer tokens between accounts", async function () {
    const amount = ethers.parseEther("100");

    // Transfer from owner to addr1
    await token.transfer(addr1.address, amount);
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(amount);
  });

  it("Should fail if sender doesn't have enough tokens", async function () {
    const initialBalance = await token.balanceOf(owner.address);
    const tooMuch = initialBalance + 1n;

    // Try to transfer more than balance
    await expect(
      token.connect(addr1).transfer(owner.address, tooMuch),
    ).to.be.revert(ethers);
  });

  it("Should update balances after transfers", async function () {
    const amount = ethers.parseEther("100");
    const initialOwnerBalance = await token.balanceOf(owner.address);

    // Transfer tokens
    await token.transfer(addr1.address, amount);
    await token.transfer(addr2.address, amount);

    // Check final balances
    const finalOwnerBalance = await token.balanceOf(owner.address);
    expect(finalOwnerBalance).to.equal(initialOwnerBalance - amount * 2n);

    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(amount);

    const addr2Balance = await token.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(amount);
  });
});
```

### Run Transfer Tests

```bash
npx hardhat test
```

---

## Testing Minting Functionality

Add to `test/MyToken.test.ts`:

```typescript
describe("Minting", function () {
  it("Should allow owner to mint tokens", async function () {
    const amount = ethers.parseEther("1000");
    const initialSupply = await token.totalSupply();

    // Mint tokens
    await token.mint(addr1.address, amount);

    // Check balance increased
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(amount);

    // Check total supply increased
    const newSupply = await token.totalSupply();
    expect(newSupply).to.equal(initialSupply + amount);
  });

  it("Should prevent non-owner from minting", async function () {
    const amount = ethers.parseEther("1000");

    // Try to mint as non-owner
    await expect(
      token.connect(addr1).mint(addr2.address, amount),
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });

  it("Should prevent minting above max supply", async function () {
    const maxSupply = await token.MAX_SUPPLY();
    const currentSupply = await token.totalSupply();
    const tooMuch = maxSupply - currentSupply + 1n;

    // Try to mint too many tokens
    await expect(token.mint(addr1.address, tooMuch)).to.be.revertedWith(
      "Exceeds max supply",
    );
  });

  it("Should emit TokensMinted event", async function () {
    const amount = ethers.parseEther("1000");

    // Check event emission
    await expect(token.mint(addr1.address, amount))
      .to.emit(token, "TokensMinted")
      .withArgs(addr1.address, amount);
  });
});
```

---

## Testing Burning Functionality

Add to `test/MyToken.test.ts`:

```typescript
describe("Burning", function () {
  beforeEach(async function () {
    // Give addr1 some tokens to burn
    const amount = ethers.parseEther("1000");
    await token.transfer(addr1.address, amount);
  });

  it("Should allow users to burn their tokens", async function () {
    const burnAmount = ethers.parseEther("500");
    const initialBalance = await token.balanceOf(addr1.address);
    const initialSupply = await token.totalSupply();

    // Burn tokens
    await token.connect(addr1).burn(burnAmount);

    // Check balance decreased
    const finalBalance = await token.balanceOf(addr1.address);
    expect(finalBalance).to.equal(initialBalance - burnAmount);

    // Check total supply decreased
    const finalSupply = await token.totalSupply();
    expect(finalSupply).to.equal(initialSupply - burnAmount);
  });

  it("Should fail if trying to burn more than balance", async function () {
    const balance = await token.balanceOf(addr1.address);
    const tooMuch = balance + 1n;

    // Try to burn more than owned
    await expect(token.connect(addr1).burn(tooMuch)).to.be.reverted;
  });

  it("Should emit TokensBurned event", async function () {
    const burnAmount = ethers.parseEther("500");

    // Check event emission
    await expect(token.connect(addr1).burn(burnAmount))
      .to.emit(token, "TokensBurned")
      .withArgs(addr1.address, burnAmount);
  });
});
```

---

## Advanced Testing Techniques

### Testing with Multiple Accounts

```typescript
describe("Advanced Scenarios", function () {
  it("Should handle multiple transfers correctly", async function () {
    const amount = ethers.parseEther("100");

    // Create a transfer chain: owner -> addr1 -> addr2
    await token.transfer(addr1.address, amount);
    await token.connect(addr1).transfer(addr2.address, amount);

    // Verify final state
    expect(await token.balanceOf(addr1.address)).to.equal(0);
    expect(await token.balanceOf(addr2.address)).to.equal(amount);
  });

  it("Should handle concurrent operations", async function () {
    const amount = ethers.parseEther("100");

    // Perform multiple operations
    await Promise.all([
      token.transfer(addr1.address, amount),
      token.transfer(addr2.address, amount),
      token.mint(owner.address, amount),
    ]);

    // Verify all succeeded
    expect(await token.balanceOf(addr1.address)).to.equal(amount);
    expect(await token.balanceOf(addr2.address)).to.equal(amount);
  });
});
```

### Testing Edge Cases

```typescript
describe("Edge Cases", function () {
  it("Should handle zero amount transfers", async function () {
    const initialBalance = await token.balanceOf(owner.address);

    await token.transfer(addr1.address, 0);

    // Balance should not change
    expect(await token.balanceOf(owner.address)).to.equal(initialBalance);
  });

  it("Should handle transfer to self", async function () {
    const amount = ethers.parseEther("100");
    const initialBalance = await token.balanceOf(owner.address);

    await token.transfer(owner.address, amount);

    // Balance should remain the same
    expect(await token.balanceOf(owner.address)).to.equal(initialBalance);
  });

  it("Should handle maximum uint256 calculations", async function () {
    // Test that contract handles large numbers correctly
    const maxSupply = await token.MAX_SUPPLY();
    expect(maxSupply).to.be.gt(0);
  });
});
```

---

## Running Tests

### Run All Tests

```bash
npx hardhat test
```

### Run Specific Test File

```bash
npx hardhat test test/MyToken.test.ts
```

### Run Tests Matching Pattern

```bash
npx hardhat test --grep "Deployment"
```

### Run with Gas Reporting

```bash
REPORT_GAS=true npx hardhat test
```

---

## Code Coverage

### Install Coverage Plugin

Coverage is built into Hardhat 3:

```bash
npx hardhat test --coverage
```

Get combined coverage for both Solidity and TypeScript tests

### Understanding Coverage Report

```
| Coverage Report       |        |             |                 |
| --------------------- | ------ | ----------- | --------------- |
| File Path             | Line % | Statement % | Uncovered Lines |
| contracts/MyToken.sol | 66.67  | 66.67       | 38-39           |
```

**Coverage Metrics:**

- **File Path:** contracts/MyToken.sol
- **Line %:** 66.67% (Line coverage)
- **Statement %:** 66.67% (Statement coverage)
- **Uncovered Lines:** (Lines not covered by tests)

---

## Best Practices

### 1. Test Organization

```typescript
describe("ContractName", function () {
  describe("FunctionName", function () {
    it("Should do something specific", async function () {
      // Test implementation
    });

    it("Should fail when...", async function () {
      // Error test
    });
  });
});
```

### 2. Use Meaningful Test Names

```typescript
// Bad
it("Test 1", async function () { ... });

// Good
it("Should prevent non-owner from minting tokens", async function () { ... });
```

### 3. Test One Thing Per Test

```typescript
// Bad - Testing multiple things
it("Should work", async function () {
  await token.mint(...);
  await token.burn(...);
  await token.transfer(...);
});

// Good - One assertion per test
it("Should mint tokens correctly", async function () {
  await token.mint(addr1.address, amount);
  expect(await token.balanceOf(addr1.address)).to.equal(amount);
});
```

### 4. Use beforeEach for Setup

```typescript
describe("MyToken", function () {
  beforeEach(async function () {
    // Fresh contract for each test
    token = await MyTokenFactory.deploy();
  });

  // Tests use clean state
});
```

### 5. Test Errors Properly

```typescript
// Test with specific error message
await expect(
  token.connect(addr1).mint(addr2.address, amount),
).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");

// Test with require message
await expect(token.mint(addr1.address, tooMuch)).to.be.revertedWith(
  "Exceeds max supply",
);
```

### 6. Test Events

```typescript
await expect(token.mint(addr1.address, amount))
  .to.emit(token, "TokensMinted")
  .withArgs(addr1.address, amount);
```

### 7. Test Edge Cases

```typescript
// Zero values
it("Should handle zero transfers", ...);

// Maximum values
it("Should handle max supply", ...);

// Boundary conditions
it("Should fail at supply limit + 1", ...);
```

---

## Common Testing Patterns

### Pattern 1: State Verification

```typescript
it("Should update state correctly", async function () {
  const before = await token.balanceOf(addr1.address);

  await token.transfer(addr1.address, amount);

  const after = await token.balanceOf(addr1.address);
  expect(after).to.equal(before + amount);
});
```

### Pattern 2: Error Testing

```typescript
it("Should revert with proper error", async function () {
  await expect(token.someFunction()).to.be.revertedWith("Error message");
});
```

### Pattern 3: Event Testing

```typescript
it("Should emit correct event", async function () {
  await expect(token.someFunction())
    .to.emit(token, "EventName")
    .withArgs(arg1, arg2);
});
```

### Pattern 4: Multiple Assertions

```typescript
it("Should update multiple states", async function () {
  await token.someFunction();

  expect(await token.stateA()).to.equal(valueA);
  expect(await token.stateB()).to.equal(valueB);
  expect(await token.stateC()).to.equal(valueC);
});
```

---

## Troubleshooting

### Common Issues

**Tests fail to compile:**

```bash
# Clear cache and recompile
npx hardhat clean
npx hardhat compile
```

**"Module not found" errors:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Tests timeout:**

```typescript
// Increase timeout in test
it("Long test", async function () {
  this.timeout(60000); // 60 seconds
  // Test code
});
```

**Gas estimation errors:**

```typescript
// Manually set gas limit
await token.mint(addr1.address, amount, {
  gasLimit: 500000,
});
```

---

## Next Steps

### Enhance Your Testing

**Add more test files:**

```bash
test/
├── MyToken.test.ts
├── MyToken.integration.test.ts
├── MyToken.security.test.ts
└── helpers/
    └── utils.ts
```

**Learn advanced testing:**

- [Contract Verification →](/tutorials-examples/intermediate-tutorials/contract-verification)

### Deploy with Confidence

Now that you have tests:

1. Run full test suite: `npx hardhat test`
2. Check coverage: `npx hardhat coverage`
3. Deploy to testnet: [Deploy ERC-20 Guide](/tutorials-examples/intermediate-tutorials/deploy-erc20)
4. Verify contract: [Verification Guide](/tutorials-examples/intermediate-tutorials/contract-verification)

---

## Additional Resources

### Documentation

- [Hardhat Testing Guide](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Chai Assertion Library](https://www.chaijs.com/api/bdd/)

---

**Congratulations!** You can now write professional-grade tests for smart contracts. Never deploy untested code again!
