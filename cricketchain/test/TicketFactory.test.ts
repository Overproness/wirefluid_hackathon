import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { FanIdentity, FanToken, TicketFactory } from "../typechain-types";

describe("TicketFactory", function () {
  let fanToken: FanToken;
  let fanIdentity: FanIdentity;
  let ticketFactory: TicketFactory;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let fan1: SignerWithAddress;
  let fan2: SignerWithAddress;
  let fan3: SignerWithAddress;

  const TICKET_PRICE = ethers.parseEther("0.1");
  const MATCH_DATE = Math.floor(Date.now() / 1000) + 86400; // tomorrow

  beforeEach(async function () {
    [owner, treasury, fan1, fan2, fan3] = await ethers.getSigners();

    // Deploy FanToken
    const FanTokenFactory = await ethers.getContractFactory("FanToken");
    fanToken = await FanTokenFactory.deploy();

    // Deploy FanIdentity
    const FanIdentityFactory = await ethers.getContractFactory("FanIdentity");
    fanIdentity = await FanIdentityFactory.deploy(await fanToken.getAddress());

    // Deploy TicketFactory
    const TicketFactoryFactory = await ethers.getContractFactory("TicketFactory");
    ticketFactory = await TicketFactoryFactory.deploy(
      await fanIdentity.getAddress(),
      treasury.address
    );

    // Set up roles
    const MINTER_ROLE = await fanToken.MINTER_ROLE();
    await fanToken.grantRole(MINTER_ROLE, await fanIdentity.getAddress());

    const XP_AWARDER_ROLE = await fanIdentity.XP_AWARDER_ROLE();
    await fanIdentity.grantRole(XP_AWARDER_ROLE, await ticketFactory.getAddress());

    // Register fans
    await fanIdentity.connect(fan1).register("Fan1");
    await fanIdentity.connect(fan2).register("Fan2");
  });

  async function createMatchAndCategory() {
    await ticketFactory.createMatch("LQ vs IU - Match 5", MATCH_DATE);
    // 11000 BPS = 110% of original price for max resale
    await ticketFactory.createTicketCategory(1, "General", TICKET_PRICE, 11000, 10);
    return 1; // tokenId
  }

  it("should allow organizer to create a match", async function () {
    await ticketFactory.createMatch("LQ vs IU", MATCH_DATE);
    const match = await ticketFactory.getMatch(1);
    expect(match.name).to.equal("LQ vs IU");
    expect(match.active).to.be.true;
  });

  it("should allow organizer to create ticket categories", async function () {
    await createMatchAndCategory();
    const cat = await ticketFactory.getCategory(1);
    expect(cat.categoryName).to.equal("General");
    expect(cat.price).to.equal(TICKET_PRICE);
    expect(cat.totalSupply).to.equal(10);
    expect(cat.sold).to.equal(0);
    // maxResalePrice = 0.1 ETH * 11000 / 10000 = 0.11 ETH
    expect(cat.maxResalePrice).to.equal(ethers.parseEther("0.11"));
  });

  it("should allow fan to buy a ticket at correct price", async function () {
    await createMatchAndCategory();
    await ticketFactory.connect(fan1).buyTicket(1, { value: TICKET_PRICE });
    expect(await ticketFactory.balanceOf(fan1.address, 1)).to.equal(1);
  });

  it("should revert on wrong price", async function () {
    await createMatchAndCategory();
    await expect(
      ticketFactory.connect(fan1).buyTicket(1, { value: ethers.parseEther("0.05") })
    ).to.be.revertedWith("Incorrect price");
  });

  it("should revert when sold out", async function () {
    await ticketFactory.createMatch("LQ vs IU", MATCH_DATE);
    await ticketFactory.createTicketCategory(1, "VIP", TICKET_PRICE, 11000, 1);

    await ticketFactory.connect(fan1).buyTicket(1, { value: TICKET_PRICE });
    await expect(
      ticketFactory.connect(fan2).buyTicket(1, { value: TICKET_PRICE })
    ).to.be.revertedWith("Sold out");
  });

  it("should BLOCK direct token transfers between users", async function () {
    await createMatchAndCategory();
    await ticketFactory.connect(fan1).buyTicket(1, { value: TICKET_PRICE });

    await expect(
      ticketFactory.connect(fan1).safeTransferFrom(fan1.address, fan2.address, 1, 1, "0x")
    ).to.be.revertedWith("Direct transfers blocked: use marketplace");
  });

  it("should allow listing ticket for resale at <= maxResalePrice", async function () {
    await createMatchAndCategory();
    await ticketFactory.connect(fan1).buyTicket(1, { value: TICKET_PRICE });

    const resalePrice = ethers.parseEther("0.11"); // max allowed
    await ticketFactory.connect(fan1).listForResale(1, resalePrice);

    const listing = await ticketFactory.getListing(0);
    expect(listing.seller).to.equal(fan1.address);
    expect(listing.price).to.equal(resalePrice);
    expect(listing.active).to.be.true;
  });

  it("should revert listing above maxResalePrice", async function () {
    await createMatchAndCategory();
    await ticketFactory.connect(fan1).buyTicket(1, { value: TICKET_PRICE });

    await expect(
      ticketFactory.connect(fan1).listForResale(1, ethers.parseEther("0.5"))
    ).to.be.revertedWith("Price exceeds max resale price");
  });

  it("should allow buying resale ticket with correct royalty split", async function () {
    await createMatchAndCategory();
    await ticketFactory.connect(fan1).buyTicket(1, { value: TICKET_PRICE });

    const resalePrice = ethers.parseEther("0.11");
    await ticketFactory.connect(fan1).listForResale(1, resalePrice);

    const sellerBefore = await ethers.provider.getBalance(fan1.address);
    const treasuryBefore = await ethers.provider.getBalance(treasury.address);

    await ticketFactory.connect(fan2).buyResaleTicket(0, { value: resalePrice });

    expect(await ticketFactory.balanceOf(fan2.address, 1)).to.equal(1);

    // Royalty = 0.11 * 700 / 10000 = 0.0077
    const royalty = resalePrice * 700n / 10000n;
    const sellerProceeds = resalePrice - royalty;

    const sellerAfter = await ethers.provider.getBalance(fan1.address);
    const treasuryAfter = await ethers.provider.getBalance(treasury.address);

    expect(sellerAfter - sellerBefore).to.equal(sellerProceeds);
    expect(treasuryAfter - treasuryBefore).to.equal(royalty);
  });

  it("should allow seller to cancel listing and get ticket back", async function () {
    await createMatchAndCategory();
    await ticketFactory.connect(fan1).buyTicket(1, { value: TICKET_PRICE });
    await ticketFactory.connect(fan1).listForResale(1, ethers.parseEther("0.11"));

    expect(await ticketFactory.balanceOf(fan1.address, 1)).to.equal(0); // in escrow
    await ticketFactory.connect(fan1).cancelListing(0);
    expect(await ticketFactory.balanceOf(fan1.address, 1)).to.equal(1); // returned
  });

  it("should allow organizer to check in a fan", async function () {
    await createMatchAndCategory();
    await ticketFactory.connect(fan1).buyTicket(1, { value: TICKET_PRICE });

    await ticketFactory.checkIn(1, fan1.address);
    expect(await ticketFactory.isCheckedIn(1, fan1.address)).to.be.true;
  });

  it("should award XP on check-in via FanIdentity", async function () {
    await createMatchAndCategory();
    await ticketFactory.connect(fan1).buyTicket(1, { value: TICKET_PRICE });

    await ticketFactory.checkIn(1, fan1.address);

    const profile = await fanIdentity.getProfile(fan1.address);
    expect(profile.totalXP).to.equal(100);
    expect(profile.matchesAttended).to.equal(1);
  });

  it("should revert check-in for non-ticket-holder", async function () {
    await createMatchAndCategory();
    await expect(
      ticketFactory.checkIn(1, fan2.address)
    ).to.be.revertedWith("Fan does not hold ticket");
  });

  it("should revert double check-in", async function () {
    await createMatchAndCategory();
    await ticketFactory.connect(fan1).buyTicket(1, { value: TICKET_PRICE });
    await ticketFactory.checkIn(1, fan1.address);

    await expect(
      ticketFactory.checkIn(1, fan1.address)
    ).to.be.revertedWith("Already checked in");
  });

  it("should send ticket payment to treasury", async function () {
    await createMatchAndCategory();
    const treasuryBefore = await ethers.provider.getBalance(treasury.address);
    await ticketFactory.connect(fan1).buyTicket(1, { value: TICKET_PRICE });
    const treasuryAfter = await ethers.provider.getBalance(treasury.address);
    expect(treasuryAfter - treasuryBefore).to.equal(TICKET_PRICE);
  });
});
