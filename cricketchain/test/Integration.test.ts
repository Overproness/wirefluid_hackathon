import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import {
  FanToken, FanIdentity, TicketFactory,
  RevenueSplitter, ContentManager, PSLGovernor
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Integration — Full CricketChain E2E", function () {
  let fanToken: FanToken;
  let fanIdentity: FanIdentity;
  let ticketFactory: TicketFactory;
  let revenueSplitter: RevenueSplitter;
  let contentManager: ContentManager;
  let governor: PSLGovernor;

  let admin: SignerWithAddress;
  let treasury: SignerWithAddress;
  let platform: SignerWithAddress;
  let sponsorPool: SignerWithAddress;
  let fanA: SignerWithAddress;
  let fanB: SignerWithAddress;
  let fanC: SignerWithAddress;
  let sponsor: SignerWithAddress;

  const TICKET_PRICE_GENERAL = ethers.parseEther("0.1");
  const TICKET_PRICE_VIP = ethers.parseEther("0.5");
  const ONE_DAY = 86400;

  before(async function () {
    [admin, treasury, platform, sponsorPool, fanA, fanB, fanC, sponsor] = await ethers.getSigners();

    // ==================== STEP 1: Deploy all 6 contracts ====================
    const FanTokenFactory = await ethers.getContractFactory("FanToken");
    fanToken = await FanTokenFactory.deploy();

    const FanIdentityFactory = await ethers.getContractFactory("FanIdentity");
    fanIdentity = await FanIdentityFactory.deploy(await fanToken.getAddress());

    const TicketFactoryFactory = await ethers.getContractFactory("TicketFactory");
    ticketFactory = await TicketFactoryFactory.deploy(
      await fanIdentity.getAddress(),
      treasury.address
    );

    const RevenueSplitterFactory = await ethers.getContractFactory("RevenueSplitter");
    revenueSplitter = await RevenueSplitterFactory.deploy(
      platform.address, treasury.address, sponsorPool.address
    );

    const ContentManagerFactory = await ethers.getContractFactory("ContentManager");
    contentManager = await ContentManagerFactory.deploy(
      await fanIdentity.getAddress(),
      await revenueSplitter.getAddress(),
      platform.address,
      treasury.address
    );

    const PSLGovernorFactory = await ethers.getContractFactory("PSLGovernor");
    governor = await PSLGovernorFactory.deploy(
      await fanToken.getAddress(),
      await fanIdentity.getAddress()
    );

    // ==================== STEP 2: Set up roles ====================
    const MINTER_ROLE = await fanToken.MINTER_ROLE();
    await fanToken.grantRole(MINTER_ROLE, await fanIdentity.getAddress());

    const XP_AWARDER_ROLE = await fanIdentity.XP_AWARDER_ROLE();
    await fanIdentity.grantRole(XP_AWARDER_ROLE, await ticketFactory.getAddress());
    await fanIdentity.grantRole(XP_AWARDER_ROLE, await contentManager.getAddress());
    await fanIdentity.grantRole(XP_AWARDER_ROLE, await governor.getAddress());

    const MANAGER_ROLE = await revenueSplitter.MANAGER_ROLE();
    await revenueSplitter.grantRole(MANAGER_ROLE, await contentManager.getAddress());
  });

  it("Step 3: Register 3 fans", async function () {
    await fanIdentity.connect(fanA).register("LahoreQalandarsFan");
    await fanIdentity.connect(fanB).register("IslamabadFanatic");
    await fanIdentity.connect(fanC).register("KarachiKingpin");

    expect(await fanIdentity.totalFans()).to.equal(3);

    const profileA = await fanIdentity.getProfile(fanA.address);
    expect(profileA.username).to.equal("LahoreQalandarsFan");
    expect(profileA.exists).to.be.true;
  });

  it("Step 4: Create PSL match + ticket categories", async function () {
    const matchDate = Math.floor(Date.now() / 1000) + ONE_DAY;
    await ticketFactory.createMatch("Lahore Qalandars vs Islamabad United", matchDate);

    // General: 0.1 WIRE, max resale 110%, 100 tickets
    await ticketFactory.createTicketCategory(1, "General", TICKET_PRICE_GENERAL, 11000, 100);
    // VIP: 0.5 WIRE, max resale 110%, 20 tickets
    await ticketFactory.createTicketCategory(1, "VIP", TICKET_PRICE_VIP, 11000, 20);

    const match = await ticketFactory.getMatch(1);
    expect(match.name).to.equal("Lahore Qalandars vs Islamabad United");
    expect(match.active).to.be.true;
  });

  it("Step 5: Fans buy tickets", async function () {
    // Fan A buys General ticket (tokenId 1)
    await ticketFactory.connect(fanA).buyTicket(1, { value: TICKET_PRICE_GENERAL });
    expect(await ticketFactory.balanceOf(fanA.address, 1)).to.equal(1);

    // Fan B buys VIP ticket (tokenId 2)
    await ticketFactory.connect(fanB).buyTicket(2, { value: TICKET_PRICE_VIP });
    expect(await ticketFactory.balanceOf(fanB.address, 2)).to.equal(1);

    // Fan C buys General ticket
    await ticketFactory.connect(fanC).buyTicket(1, { value: TICKET_PRICE_GENERAL });
    expect(await ticketFactory.balanceOf(fanC.address, 1)).to.equal(1);
  });

  it("Step 6: Attempt scalping — BLOCKED", async function () {
    // Fan A tries to sell General ticket at 3x price via direct transfer
    await expect(
      ticketFactory.connect(fanA).safeTransferFrom(fanA.address, fanB.address, 1, 1, "0x")
    ).to.be.revertedWith("Direct transfers blocked: use marketplace");

    // Fan A tries to list at 3x price via marketplace
    await expect(
      ticketFactory.connect(fanA).listForResale(1, ethers.parseEther("0.3"))
    ).to.be.revertedWith("Price exceeds max resale price");

    // Valid resale at 110% works
    const maxResale = ethers.parseEther("0.11");
    await ticketFactory.connect(fanA).listForResale(1, maxResale);
    const listing = await ticketFactory.getListing(0);
    expect(listing.active).to.be.true;

    // Cancel it so fan A keeps the ticket for check-in
    await ticketFactory.connect(fanA).cancelListing(0);
    expect(await ticketFactory.balanceOf(fanA.address, 1)).to.equal(1);
  });

  it("Step 7: Check in fans at match → XP awarded, tiers updated", async function () {
    // Check in all 3 fans
    await ticketFactory.checkIn(1, fanA.address);
    await ticketFactory.checkIn(2, fanB.address);
    await ticketFactory.checkIn(1, fanC.address);

    // Each fan should have 100 XP from attendance
    const profileA = await fanIdentity.getProfile(fanA.address);
    expect(profileA.totalXP).to.equal(100);
    expect(profileA.matchesAttended).to.equal(1);

    // Verify FanTokens minted
    expect(await fanToken.balanceOf(fanA.address)).to.equal(ethers.parseEther("100"));
  });

  it("Step 8: Fan submits content → moderator approves → XP awarded", async function () {
    await contentManager.connect(fanA).submitContent(
      "ipfs://QmHighlightClip123",
      "Shaheen's Hat-trick Highlights",
      "Amazing bowling spell from match 1"
    );

    const pending = await contentManager.getPendingSubmissions();
    expect(pending.length).to.equal(1);

    // Moderator (admin) approves
    await contentManager.approveContent(1);

    const sub = await contentManager.getSubmission(1);
    expect(sub.status).to.equal(1); // Approved

    // Fan A got 50 XP for content = 100 (attendance) + 50 = 150 total
    const profileA = await fanIdentity.getProfile(fanA.address);
    expect(profileA.totalXP).to.equal(150);
    expect(profileA.contentSubmitted).to.equal(1);
  });

  it("Step 9: Sponsor funds content → revenue deposited", async function () {
    await contentManager.connect(sponsor).sponsorContent(1, { value: ethers.parseEther("1") });

    const split = await revenueSplitter.splits(1);
    expect(split.totalDeposited).to.equal(ethers.parseEther("1"));
  });

  it("Step 10: Creator claims revenue share", async function () {
    // Creator (fanA) should get 50% of 1 WIRE = 0.5 WIRE
    const claimable = await revenueSplitter.getClaimable(1, fanA.address);
    expect(claimable).to.equal(ethers.parseEther("0.5"));

    const before = await ethers.provider.getBalance(fanA.address);
    const tx = await revenueSplitter.connect(fanA).claimRevenue(1);
    const receipt = await tx.wait();
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
    const after = await ethers.provider.getBalance(fanA.address);

    expect(after - before + gasUsed).to.equal(ethers.parseEther("0.5"));
  });

  it("Step 11: Create MVP vote proposal", async function () {
    await governor.createProposal(
      0, // MVP_VOTE
      "Man of the Match - LQ vs IU",
      "Vote for the best player",
      ["Shaheen Afridi", "Babar Azam", "Shadab Khan"],
      ONE_DAY
    );

    const proposal = await governor.getProposal(1);
    expect(proposal.title).to.equal("Man of the Match - LQ vs IU");
    expect(proposal.state).to.equal(0); // Active
  });

  it("Step 12: All fans vote", async function () {
    // Set low quorum for demo
    await governor.setQuorum(100); // 1%

    await governor.connect(fanA).vote(1, 0); // Shaheen
    await governor.connect(fanB).vote(1, 2); // Shadab
    await governor.connect(fanC).vote(1, 0); // Shaheen

    expect(await governor.hasUserVoted(1, fanA.address)).to.be.true;
    expect(await governor.hasUserVoted(1, fanB.address)).to.be.true;
    expect(await governor.hasUserVoted(1, fanC.address)).to.be.true;
  });

  it("Step 13: Finalize proposal → verify winner", async function () {
    await time.increase(ONE_DAY + 1);
    await governor.finalizeProposal(1);

    const proposal = await governor.getProposal(1);
    expect(proposal.state).to.equal(1); // Succeeded

    const [winIdx] = await governor.getWinningOption(1);
    expect(winIdx).to.equal(0); // Shaheen Afridi (got 2 votes)
  });

  it("Step 14: Verify all XP, FanTokens, and tiers across the journey", async function () {
    // Fan A: 100 (attendance) + 50 (content) + 25 (vote) = 175 XP
    const profileA = await fanIdentity.getProfile(fanA.address);
    expect(profileA.totalXP).to.equal(175);
    expect(profileA.matchesAttended).to.equal(1);
    expect(profileA.contentSubmitted).to.equal(1);
    expect(profileA.votesParticipated).to.equal(1);
    expect(await fanToken.balanceOf(fanA.address)).to.equal(ethers.parseEther("175"));
    expect(await fanIdentity.getTier(fanA.address)).to.equal(0); // Bronze (175 < 500)

    // Fan B: 100 (attendance) + 25 (vote) = 125 XP
    const profileB = await fanIdentity.getProfile(fanB.address);
    expect(profileB.totalXP).to.equal(125);
    expect(profileB.matchesAttended).to.equal(1);
    expect(profileB.votesParticipated).to.equal(1);
    expect(await fanToken.balanceOf(fanB.address)).to.equal(ethers.parseEther("125"));

    // Fan C: 100 (attendance) + 25 (vote) = 125 XP
    const profileC = await fanIdentity.getProfile(fanC.address);
    expect(profileC.totalXP).to.equal(125);
    expect(profileC.matchesAttended).to.equal(1);
    expect(profileC.votesParticipated).to.equal(1);
    expect(await fanToken.balanceOf(fanC.address)).to.equal(ethers.parseEther("125"));

    // Total FanToken supply = 175 + 125 + 125 = 425
    expect(await fanToken.totalSupply()).to.equal(ethers.parseEther("425"));
  });
});
