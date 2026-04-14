import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { FanToken, FanIdentity, PSLGovernor } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PSLGovernor", function () {
  let fanToken: FanToken;
  let fanIdentity: FanIdentity;
  let governor: PSLGovernor;
  let owner: SignerWithAddress;
  let fan1: SignerWithAddress;
  let fan2: SignerWithAddress;
  let fan3: SignerWithAddress;
  let nonFan: SignerWithAddress;

  const ONE_HOUR = 3600;
  const ONE_DAY = 86400;

  beforeEach(async function () {
    [owner, fan1, fan2, fan3, nonFan] = await ethers.getSigners();

    // Deploy FanToken
    const FanTokenFactory = await ethers.getContractFactory("FanToken");
    fanToken = await FanTokenFactory.deploy();

    // Deploy FanIdentity
    const FanIdentityFactory = await ethers.getContractFactory("FanIdentity");
    fanIdentity = await FanIdentityFactory.deploy(await fanToken.getAddress());

    // Deploy PSLGovernor
    const PSLGovernorFactory = await ethers.getContractFactory("PSLGovernor");
    governor = await PSLGovernorFactory.deploy(
      await fanToken.getAddress(),
      await fanIdentity.getAddress()
    );

    // Set up roles
    const MINTER_ROLE = await fanToken.MINTER_ROLE();
    await fanToken.grantRole(MINTER_ROLE, await fanIdentity.getAddress());

    const XP_AWARDER_ROLE = await fanIdentity.XP_AWARDER_ROLE();
    await fanIdentity.grantRole(XP_AWARDER_ROLE, await governor.getAddress());
    await fanIdentity.grantRole(XP_AWARDER_ROLE, owner.address); // for setup

    // Register fans and give them some tokens
    await fanIdentity.connect(fan1).register("Fan1");
    await fanIdentity.connect(fan2).register("Fan2");
    await fanIdentity.connect(fan3).register("Fan3");

    // Give fans some XP (and thus FanTokens)
    await fanIdentity.awardXP(fan1.address, 1000, "setup");
    await fanIdentity.awardXP(fan2.address, 500, "setup");
    await fanIdentity.awardXP(fan3.address, 200, "setup");
  });

  async function createDefaultProposal() {
    await governor.createProposal(
      0, // MVP_VOTE
      "Best Player - Match 5",
      "Vote for MVP",
      ["Shaheen Afridi", "Babar Azam", "Shadab Khan"],
      ONE_DAY
    );
    return 1; // proposalId
  }

  it("should allow proposer to create proposal with valid options", async function () {
    await createDefaultProposal();
    const proposal = await governor.getProposal(1);
    expect(proposal.title).to.equal("Best Player - Match 5");
    expect(proposal.options.length).to.equal(3);
    expect(proposal.state).to.equal(0); // Active
  });

  it("should revert with < 2 options", async function () {
    await expect(
      governor.createProposal(0, "Title", "Desc", ["Only One"], ONE_DAY)
    ).to.be.revertedWith("Need at least 2 options");
  });

  it("should revert with invalid duration (too short)", async function () {
    await expect(
      governor.createProposal(0, "Title", "Desc", ["A", "B"], 60) // 1 minute
    ).to.be.revertedWith("Duration too short");
  });

  it("should revert with invalid duration (too long)", async function () {
    await expect(
      governor.createProposal(0, "Title", "Desc", ["A", "B"], 8 * ONE_DAY)
    ).to.be.revertedWith("Duration too long");
  });

  it("should allow registered fan to vote", async function () {
    await createDefaultProposal();
    await governor.connect(fan1).vote(1, 0); // Vote for option 0

    expect(await governor.hasUserVoted(1, fan1.address)).to.be.true;
    // fan1 has 1000 XP, Silver tier (multiplier 120), balance = 1000e18
    // getVoteWeight = 1000e18 * 120 / 100 = 1200e18
    const votes = await governor.getOptionVotes(1, 0);
    expect(votes).to.equal(ethers.parseEther("1200"));
  });

  it("should revert for unregistered user voting", async function () {
    await createDefaultProposal();
    await expect(
      governor.connect(nonFan).vote(1, 0)
    ).to.be.revertedWith("Must be registered fan");
  });

  it("should revert on double voting", async function () {
    await createDefaultProposal();
    await governor.connect(fan1).vote(1, 0);
    await expect(
      governor.connect(fan1).vote(1, 1)
    ).to.be.revertedWith("Already voted");
  });

  it("should reflect vote weight with tier multiplier", async function () {
    await createDefaultProposal();
    // fan2 has 500 XP = Silver tier (multiplier 120)
    // tokens = 500e18
    // weight = 500e18 * 120 / 100 = 600e18
    await governor.connect(fan2).vote(1, 1);
    const votes = await governor.getOptionVotes(1, 1);
    expect(votes).to.equal(ethers.parseEther("600"));
  });

  it("should revert voting after endTime", async function () {
    await createDefaultProposal();
    await time.increase(ONE_DAY + 1);
    await expect(
      governor.connect(fan1).vote(1, 0)
    ).to.be.revertedWith("Voting ended");
  });

  it("should allow admin to finalize after endTime", async function () {
    await createDefaultProposal();
    // Set low quorum for testing
    await governor.setQuorum(100); // 1%

    await governor.connect(fan1).vote(1, 0);
    await time.increase(ONE_DAY + 1);
    await governor.finalizeProposal(1);

    const proposal = await governor.getProposal(1);
    expect(proposal.state).to.equal(1); // Succeeded
  });

  it("should revert finalizing before endTime", async function () {
    await createDefaultProposal();
    await expect(
      governor.finalizeProposal(1)
    ).to.be.revertedWith("Voting not ended");
  });

  it("should succeed if quorum met", async function () {
    await createDefaultProposal();
    await governor.setQuorum(100); // 1%

    await governor.connect(fan1).vote(1, 0);
    await time.increase(ONE_DAY + 1);
    await governor.finalizeProposal(1);

    const proposal = await governor.getProposal(1);
    expect(proposal.state).to.equal(1); // Succeeded
  });

  it("should defeat if quorum not met", async function () {
    // Give a LOT of tokens to someone who won't vote
    await fanIdentity.awardXP(fan3.address, 100000, "big tokens");
    // fan3 now has huge supply, but won't vote

    await createDefaultProposal();
    // Only fan2 with tiny balance votes — won't meet 10% quorum
    await governor.connect(fan2).vote(1, 0);
    await time.increase(ONE_DAY + 1);
    await governor.finalizeProposal(1);

    const proposal = await governor.getProposal(1);
    expect(proposal.state).to.equal(2); // Defeated
  });

  it("should allow executing succeeded proposal", async function () {
    await createDefaultProposal();
    await governor.setQuorum(100);

    await governor.connect(fan1).vote(1, 0);
    await time.increase(ONE_DAY + 1);
    await governor.finalizeProposal(1);
    await governor.executeProposal(1);

    const proposal = await governor.getProposal(1);
    expect(proposal.state).to.equal(3); // Executed
  });

  it("should revert executing defeated proposal", async function () {
    await fanIdentity.awardXP(fan3.address, 100000, "big tokens");
    await createDefaultProposal();
    await governor.connect(fan2).vote(1, 0);
    await time.increase(ONE_DAY + 1);
    await governor.finalizeProposal(1);

    await expect(governor.executeProposal(1)).to.be.revertedWith("Not succeeded");
  });

  it("should award XP for voting", async function () {
    await createDefaultProposal();
    const profileBefore = await fanIdentity.getProfile(fan1.address);
    await governor.connect(fan1).vote(1, 0);
    const profileAfter = await fanIdentity.getProfile(fan1.address);

    expect(profileAfter.totalXP - profileBefore.totalXP).to.equal(25);
    expect(profileAfter.votesParticipated - profileBefore.votesParticipated).to.equal(1);
  });

  it("should return correct winning option", async function () {
    await createDefaultProposal();
    await governor.setQuorum(100);

    await governor.connect(fan1).vote(1, 2); // Shadab Khan (idx 2) - 1500 weight
    await governor.connect(fan2).vote(1, 0); // Shaheen (idx 0) - 600 weight

    const [winIdx] = await governor.getWinningOption(1);
    expect(winIdx).to.equal(2); // Shadab Khan wins
  });
});
