import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ContentManager, FanIdentity, FanToken, RevenueSplitter } from "../typechain-types";

describe("ContentManager", function () {
  let fanToken: FanToken;
  let fanIdentity: FanIdentity;
  let revenueSplitter: RevenueSplitter;
  let contentManager: ContentManager;
  let owner: SignerWithAddress;
  let platform: SignerWithAddress;
  let pslTreasury: SignerWithAddress;
  let sponsorPool: SignerWithAddress;
  let creator: SignerWithAddress;
  let nonFan: SignerWithAddress;
  let sponsor: SignerWithAddress;

  beforeEach(async function () {
    [owner, platform, pslTreasury, sponsorPool, creator, nonFan, sponsor] = await ethers.getSigners();

    // Deploy FanToken
    const FanTokenFactory = await ethers.getContractFactory("FanToken");
    fanToken = await FanTokenFactory.deploy();

    // Deploy FanIdentity
    const FanIdentityFactory = await ethers.getContractFactory("FanIdentity");
    fanIdentity = await FanIdentityFactory.deploy(await fanToken.getAddress());

    // Deploy RevenueSplitter
    const RevenueSplitterFactory = await ethers.getContractFactory("RevenueSplitter");
    revenueSplitter = await RevenueSplitterFactory.deploy(
      platform.address, pslTreasury.address, sponsorPool.address
    );

    // Deploy ContentManager
    const ContentManagerFactory = await ethers.getContractFactory("ContentManager");
    contentManager = await ContentManagerFactory.deploy(
      await fanIdentity.getAddress(),
      await revenueSplitter.getAddress(),
      platform.address,
      pslTreasury.address
    );

    // Set up roles
    const MINTER_ROLE = await fanToken.MINTER_ROLE();
    await fanToken.grantRole(MINTER_ROLE, await fanIdentity.getAddress());

    const XP_AWARDER_ROLE = await fanIdentity.XP_AWARDER_ROLE();
    await fanIdentity.grantRole(XP_AWARDER_ROLE, await contentManager.getAddress());

    const MANAGER_ROLE = await revenueSplitter.MANAGER_ROLE();
    await revenueSplitter.grantRole(MANAGER_ROLE, await contentManager.getAddress());

    // Register creator fan
    await fanIdentity.connect(creator).register("ContentCreator");
  });

  it("should allow registered fan to submit content", async function () {
    await contentManager.connect(creator).submitContent("ipfs://QmTest", "My Highlight", "A great match moment");
    const sub = await contentManager.getSubmission(1);
    expect(sub.creator).to.equal(creator.address);
    expect(sub.title).to.equal("My Highlight");
    expect(sub.status).to.equal(0); // Pending
  });

  it("should revert for unregistered user", async function () {
    await expect(
      contentManager.connect(nonFan).submitContent("ipfs://QmTest", "Title", "Desc")
    ).to.be.revertedWith("Must be a registered fan");
  });

  it("should revert with empty metadataURI", async function () {
    await expect(
      contentManager.connect(creator).submitContent("", "Title", "Desc")
    ).to.be.revertedWith("MetadataURI cannot be empty");
  });

  it("should allow moderator to approve content", async function () {
    await contentManager.connect(creator).submitContent("ipfs://QmTest", "Title", "Desc");
    await contentManager.approveContent(1);

    const sub = await contentManager.getSubmission(1);
    expect(sub.status).to.equal(1); // Approved
  });

  it("should mint NFT on approval", async function () {
    await contentManager.connect(creator).submitContent("ipfs://QmTest", "Title", "Desc");
    await contentManager.approveContent(1);

    // NFT minted to the contract itself
    expect(await contentManager.ownerOf(1)).to.equal(await contentManager.getAddress());
  });

  it("should create revenue split on approval", async function () {
    await contentManager.connect(creator).submitContent("ipfs://QmTest", "Title", "Desc");
    await contentManager.approveContent(1);

    const split = await revenueSplitter.splits(1);
    expect(split.creator).to.equal(creator.address);
    expect(split.creatorBPS).to.equal(5000);
  });

  it("should award XP to creator on approval", async function () {
    await contentManager.connect(creator).submitContent("ipfs://QmTest", "Title", "Desc");
    await contentManager.approveContent(1);

    const profile = await fanIdentity.getProfile(creator.address);
    expect(profile.totalXP).to.equal(50);
    expect(profile.contentSubmitted).to.equal(1);
  });

  it("should allow moderator to reject content", async function () {
    await contentManager.connect(creator).submitContent("ipfs://QmTest", "Title", "Desc");
    await contentManager.rejectContent(1);

    const sub = await contentManager.getSubmission(1);
    expect(sub.status).to.equal(2); // Rejected
  });

  it("should not allow approving already reviewed content", async function () {
    await contentManager.connect(creator).submitContent("ipfs://QmTest", "Title", "Desc");
    await contentManager.approveContent(1);

    await expect(contentManager.approveContent(1)).to.be.revertedWith("Content already reviewed");
  });

  it("should not allow rejecting already reviewed content", async function () {
    await contentManager.connect(creator).submitContent("ipfs://QmTest", "Title", "Desc");
    await contentManager.rejectContent(1);

    await expect(contentManager.rejectContent(1)).to.be.revertedWith("Content already reviewed");
  });

  it("should allow anyone to tip approved content", async function () {
    await contentManager.connect(creator).submitContent("ipfs://QmTest", "Title", "Desc");
    await contentManager.approveContent(1);

    const tipAmount = ethers.parseEther("0.5");
    await contentManager.connect(sponsor).tipContent(1, { value: tipAmount });

    const split = await revenueSplitter.splits(1);
    expect(split.totalDeposited).to.equal(tipAmount);
  });

  it("should not allow tipping pending content", async function () {
    await contentManager.connect(creator).submitContent("ipfs://QmTest", "Title", "Desc");

    await expect(
      contentManager.connect(sponsor).tipContent(1, { value: ethers.parseEther("0.1") })
    ).to.be.revertedWith("Content not approved");
  });

  it("should not allow tipping rejected content", async function () {
    await contentManager.connect(creator).submitContent("ipfs://QmTest", "Title", "Desc");
    await contentManager.rejectContent(1);

    await expect(
      contentManager.connect(sponsor).tipContent(1, { value: ethers.parseEther("0.1") })
    ).to.be.revertedWith("Content not approved");
  });

  it("should allow sponsor to fund content", async function () {
    await contentManager.connect(creator).submitContent("ipfs://QmTest", "Title", "Desc");
    await contentManager.approveContent(1);

    const fundAmount = ethers.parseEther("1");
    await contentManager.connect(sponsor).sponsorContent(1, { value: fundAmount });

    const split = await revenueSplitter.splits(1);
    expect(split.totalDeposited).to.equal(fundAmount);
  });

  it("should return pending submissions", async function () {
    await contentManager.connect(creator).submitContent("ipfs://Q1", "Title1", "Desc1");
    await contentManager.connect(creator).submitContent("ipfs://Q2", "Title2", "Desc2");

    const pending = await contentManager.getPendingSubmissions();
    expect(pending.length).to.equal(2);
  });

  it("should remove from pending on approval", async function () {
    await contentManager.connect(creator).submitContent("ipfs://Q1", "Title1", "Desc1");
    await contentManager.connect(creator).submitContent("ipfs://Q2", "Title2", "Desc2");
    await contentManager.approveContent(1);

    const pending = await contentManager.getPendingSubmissions();
    expect(pending.length).to.equal(1);
  });

  it("should allow admin to update default split BPS", async function () {
    await contentManager.updateDefaultSplitBPS(6000, 1500, 1500, 1000);
    expect(await contentManager.defaultCreatorBPS()).to.equal(6000);
  });

  it("should revert updating split BPS that don't sum to 10000", async function () {
    await expect(
      contentManager.updateDefaultSplitBPS(6000, 1500, 1500, 500)
    ).to.be.revertedWith("Must sum to 10000");
  });

  it("should return submissions by creator", async function () {
    await contentManager.connect(creator).submitContent("ipfs://Q1", "Title1", "Desc1");
    await contentManager.connect(creator).submitContent("ipfs://Q2", "Title2", "Desc2");

    const subs = await contentManager.getSubmissionsByCreator(creator.address);
    expect(subs.length).to.equal(2);
  });
});
