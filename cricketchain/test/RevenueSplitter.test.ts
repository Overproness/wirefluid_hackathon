import { expect } from "chai";
import { ethers } from "hardhat";
import { RevenueSplitter } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RevenueSplitter", function () {
  let revenueSplitter: RevenueSplitter;
  let owner: SignerWithAddress;
  let manager: SignerWithAddress;
  let creator: SignerWithAddress;
  let platform: SignerWithAddress;
  let pslTreasury: SignerWithAddress;
  let sponsorPool: SignerWithAddress;
  let depositor: SignerWithAddress;
  let MANAGER_ROLE: string;

  const CONTENT_ID = 1;
  const CREATOR_BPS = 5000;  // 50%
  const PLATFORM_BPS = 2000; // 20%
  const PSL_BPS = 1500;      // 15%
  const SPONSOR_BPS = 1500;  // 15%

  beforeEach(async function () {
    [owner, manager, creator, platform, pslTreasury, sponsorPool, depositor] = await ethers.getSigners();

    const RevenueSplitterFactory = await ethers.getContractFactory("RevenueSplitter");
    revenueSplitter = await RevenueSplitterFactory.deploy(
      platform.address,
      pslTreasury.address,
      sponsorPool.address
    );

    MANAGER_ROLE = await revenueSplitter.MANAGER_ROLE();
    await revenueSplitter.grantRole(MANAGER_ROLE, manager.address);
  });

  async function createDefaultSplit() {
    await revenueSplitter.connect(manager).createSplit(
      CONTENT_ID,
      creator.address,
      platform.address,
      pslTreasury.address,
      CREATOR_BPS,
      PLATFORM_BPS,
      PSL_BPS,
      SPONSOR_BPS
    );
  }

  it("should allow manager to create a split", async function () {
    await createDefaultSplit();
    const split = await revenueSplitter.splits(CONTENT_ID);
    expect(split.creator).to.equal(creator.address);
    expect(split.creatorBPS).to.equal(CREATOR_BPS);
  });

  it("should revert if BPS don't sum to 10000", async function () {
    await expect(
      revenueSplitter.connect(manager).createSplit(
        CONTENT_ID, creator.address, platform.address, pslTreasury.address,
        5000, 2000, 1500, 1000 // = 9500
      )
    ).to.be.revertedWith("BPS must sum to 10000");
  });

  it("should allow anyone to deposit revenue", async function () {
    await createDefaultSplit();
    const amount = ethers.parseEther("1");
    await revenueSplitter.connect(depositor).depositRevenue(CONTENT_ID, { value: amount });
    const split = await revenueSplitter.splits(CONTENT_ID);
    expect(split.totalDeposited).to.equal(amount);
  });

  it("should allow creator to claim their share", async function () {
    await createDefaultSplit();
    const deposit = ethers.parseEther("1");
    await revenueSplitter.connect(depositor).depositRevenue(CONTENT_ID, { value: deposit });

    const claimable = await revenueSplitter.getClaimable(CONTENT_ID, creator.address);
    expect(claimable).to.equal(ethers.parseEther("0.5")); // 50%

    const before = await ethers.provider.getBalance(creator.address);
    const tx = await revenueSplitter.connect(creator).claimRevenue(CONTENT_ID);
    const receipt = await tx.wait();
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
    const after = await ethers.provider.getBalance(creator.address);

    expect(after - before + gasUsed).to.equal(ethers.parseEther("0.5"));
  });

  it("should allow platform to claim their share", async function () {
    await createDefaultSplit();
    await revenueSplitter.connect(depositor).depositRevenue(CONTENT_ID, { value: ethers.parseEther("1") });

    const claimable = await revenueSplitter.getClaimable(CONTENT_ID, platform.address);
    expect(claimable).to.equal(ethers.parseEther("0.2")); // 20%
  });

  it("should allow PSL treasury to claim share", async function () {
    await createDefaultSplit();
    await revenueSplitter.connect(depositor).depositRevenue(CONTENT_ID, { value: ethers.parseEther("1") });

    const claimable = await revenueSplitter.getClaimable(CONTENT_ID, pslTreasury.address);
    expect(claimable).to.equal(ethers.parseEther("0.15")); // 15%
  });

  it("should allow sponsor pool to claim share", async function () {
    await createDefaultSplit();
    await revenueSplitter.connect(depositor).depositRevenue(CONTENT_ID, { value: ethers.parseEther("1") });

    const claimable = await revenueSplitter.getClaimable(CONTENT_ID, sponsorPool.address);
    expect(claimable).to.equal(ethers.parseEther("0.15")); // 15%
  });

  it("should not allow claiming more than entitled", async function () {
    await createDefaultSplit();
    await revenueSplitter.connect(depositor).depositRevenue(CONTENT_ID, { value: ethers.parseEther("1") });
    await revenueSplitter.connect(creator).claimRevenue(CONTENT_ID);

    // Second claim should revert - nothing left
    await expect(
      revenueSplitter.connect(creator).claimRevenue(CONTENT_ID)
    ).to.be.revertedWith("Nothing to claim");
  });

  it("should not allow claiming with zero balance", async function () {
    await createDefaultSplit();
    await expect(
      revenueSplitter.connect(creator).claimRevenue(CONTENT_ID)
    ).to.be.revertedWith("Nothing to claim");
  });

  it("should accumulate multiple deposits correctly", async function () {
    await createDefaultSplit();
    await revenueSplitter.connect(depositor).depositRevenue(CONTENT_ID, { value: ethers.parseEther("1") });
    await revenueSplitter.connect(depositor).depositRevenue(CONTENT_ID, { value: ethers.parseEther("1") });

    // Total deposited = 2 ETH, creator gets 50% = 1 ETH
    const claimable = await revenueSplitter.getClaimable(CONTENT_ID, creator.address);
    expect(claimable).to.equal(ethers.parseEther("1"));
  });

  it("should handle partial claims correctly", async function () {
    await createDefaultSplit();

    // First deposit
    await revenueSplitter.connect(depositor).depositRevenue(CONTENT_ID, { value: ethers.parseEther("1") });
    // Creator claims 0.5 ETH
    await revenueSplitter.connect(creator).claimRevenue(CONTENT_ID);

    // Second deposit
    await revenueSplitter.connect(depositor).depositRevenue(CONTENT_ID, { value: ethers.parseEther("1") });
    // Creator should be able to claim 0.5 more
    const claimable = await revenueSplitter.getClaimable(CONTENT_ID, creator.address);
    expect(claimable).to.equal(ethers.parseEther("0.5"));
  });

  it("should return content revenue details", async function () {
    await createDefaultSplit();
    await revenueSplitter.connect(depositor).depositRevenue(CONTENT_ID, { value: ethers.parseEther("2") });
    await revenueSplitter.connect(creator).claimRevenue(CONTENT_ID);

    const revenue = await revenueSplitter.getContentRevenue(CONTENT_ID);
    expect(revenue.totalDeposited).to.equal(ethers.parseEther("2"));
    expect(revenue.creatorClaimed).to.equal(ethers.parseEther("1")); // 50% of 2
  });
});
