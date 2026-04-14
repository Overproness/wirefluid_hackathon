import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { FanIdentity, FanToken } from "../typechain-types";

describe("FanIdentity", function () {
  let fanToken: FanToken;
  let fanIdentity: FanIdentity;
  let owner: SignerWithAddress;
  let awarder: SignerWithAddress;
  let fan1: SignerWithAddress;
  let fan2: SignerWithAddress;
  let XP_AWARDER_ROLE: string;
  let MINTER_ROLE: string;

  beforeEach(async function () {
    [owner, awarder, fan1, fan2] = await ethers.getSigners();

    const FanTokenFactory = await ethers.getContractFactory("FanToken");
    fanToken = await FanTokenFactory.deploy();

    const FanIdentityFactory = await ethers.getContractFactory("FanIdentity");
    fanIdentity = await FanIdentityFactory.deploy(await fanToken.getAddress());

    XP_AWARDER_ROLE = await fanIdentity.XP_AWARDER_ROLE();
    MINTER_ROLE = await fanToken.MINTER_ROLE();

    // Grant MINTER_ROLE on FanToken to FanIdentity so it can mint tokens on XP award
    await fanToken.grantRole(MINTER_ROLE, await fanIdentity.getAddress());
    // Grant XP_AWARDER_ROLE to the awarder account
    await fanIdentity.grantRole(XP_AWARDER_ROLE, awarder.address);
  });

  it("should register a new fan", async function () {
    await fanIdentity.connect(fan1).register("CricketFan1");
    const profile = await fanIdentity.getProfile(fan1.address);
    expect(profile.username).to.equal("CricketFan1");
    expect(profile.exists).to.be.true;
    expect(profile.totalXP).to.equal(0);
  });

  it("should not allow registering twice", async function () {
    await fanIdentity.connect(fan1).register("CricketFan1");
    await expect(
      fanIdentity.connect(fan1).register("AnotherName")
    ).to.be.revertedWith("Already registered");
  });

  it("should not allow empty username", async function () {
    await expect(
      fanIdentity.connect(fan1).register("")
    ).to.be.revertedWith("Username cannot be empty");
  });

  it("should allow XP_AWARDER to award XP", async function () {
    await fanIdentity.connect(fan1).register("CricketFan1");
    await fanIdentity.connect(awarder).awardXP(fan1.address, 100, "Match Attendance");
    const profile = await fanIdentity.getProfile(fan1.address);
    expect(profile.totalXP).to.equal(100);
  });

  it("should not allow non-XP_AWARDER to award XP", async function () {
    await fanIdentity.connect(fan1).register("CricketFan1");
    await expect(
      fanIdentity.connect(fan1).awardXP(fan1.address, 100, "Cheating")
    ).to.be.reverted;
  });

  it("should mint FanTokens when XP is awarded", async function () {
    await fanIdentity.connect(fan1).register("CricketFan1");
    await fanIdentity.connect(awarder).awardXP(fan1.address, 100, "Match Attendance");
    // 1 XP = 1e18 FanToken
    expect(await fanToken.balanceOf(fan1.address)).to.equal(ethers.parseEther("100"));
  });

  it("should calculate tier correctly at each boundary", async function () {
    await fanIdentity.connect(fan1).register("CricketFan1");

    // Bronze: 0 XP
    expect(await fanIdentity.getTier(fan1.address)).to.equal(0); // Bronze

    // Silver: 500 XP
    await fanIdentity.connect(awarder).awardXP(fan1.address, 500, "test");
    expect(await fanIdentity.getTier(fan1.address)).to.equal(1); // Silver

    // Gold: 2000 XP (already has 500, add 1500)
    await fanIdentity.connect(awarder).awardXP(fan1.address, 1500, "test");
    expect(await fanIdentity.getTier(fan1.address)).to.equal(2); // Gold

    // Platinum: 5000 XP (already has 2000, add 3000)
    await fanIdentity.connect(awarder).awardXP(fan1.address, 3000, "test");
    expect(await fanIdentity.getTier(fan1.address)).to.equal(3); // Platinum

    // Diamond: 15000 XP (already has 5000, add 10000)
    await fanIdentity.connect(awarder).awardXP(fan1.address, 10000, "test");
    expect(await fanIdentity.getTier(fan1.address)).to.equal(4); // Diamond
  });

  it("should return correct tier multiplier values", async function () {
    await fanIdentity.connect(fan1).register("CricketFan1");
    expect(await fanIdentity.getTierMultiplier(fan1.address)).to.equal(100); // Bronze

    await fanIdentity.connect(awarder).awardXP(fan1.address, 500, "test");
    expect(await fanIdentity.getTierMultiplier(fan1.address)).to.equal(120); // Silver

    await fanIdentity.connect(awarder).awardXP(fan1.address, 1500, "test");
    expect(await fanIdentity.getTierMultiplier(fan1.address)).to.equal(150); // Gold

    await fanIdentity.connect(awarder).awardXP(fan1.address, 3000, "test");
    expect(await fanIdentity.getTierMultiplier(fan1.address)).to.equal(200); // Platinum

    await fanIdentity.connect(awarder).awardXP(fan1.address, 10000, "test");
    expect(await fanIdentity.getTierMultiplier(fan1.address)).to.equal(300); // Diamond
  });

  it("should calculate vote weight = token balance * tier multiplier / 100", async function () {
    await fanIdentity.connect(fan1).register("CricketFan1");
    await fanIdentity.connect(awarder).awardXP(fan1.address, 500, "test"); // Silver tier (120 multiplier)
    // Token balance = 500 * 1e18
    // Vote weight = 500e18 * 120 / 100 = 600e18
    const expectedWeight = ethers.parseEther("600");
    expect(await fanIdentity.getVoteWeight(fan1.address)).to.equal(expectedWeight);
  });

  it("should update profile data correctly", async function () {
    await fanIdentity.connect(fan1).register("CricketFan1");
    await fanIdentity.connect(awarder).incrementMatchesAttended(fan1.address);
    await fanIdentity.connect(awarder).incrementVotesParticipated(fan1.address);
    await fanIdentity.connect(awarder).incrementContentSubmitted(fan1.address);

    const profile = await fanIdentity.getProfile(fan1.address);
    expect(profile.matchesAttended).to.equal(1);
    expect(profile.votesParticipated).to.equal(1);
    expect(profile.contentSubmitted).to.equal(1);
  });

  it("should increment totalFans on registration", async function () {
    expect(await fanIdentity.totalFans()).to.equal(0);
    await fanIdentity.connect(fan1).register("Fan1");
    expect(await fanIdentity.totalFans()).to.equal(1);
    await fanIdentity.connect(fan2).register("Fan2");
    expect(await fanIdentity.totalFans()).to.equal(2);
  });
});
