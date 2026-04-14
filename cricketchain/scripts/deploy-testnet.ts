import { ethers } from "hardhat";

interface TxRecord {
  step: string;
  pillar: string;
  hash: string;
  description: string;
}

const txLog: TxRecord[] = [];

function log(step: string, pillar: string, hash: string, description: string) {
  txLog.push({ step, pillar, hash, description });
  console.log(`  ✓ [${pillar}] ${step}: ${hash}`);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("=".repeat(70));
  console.log("CricketChain — WireFluid Testnet Deployment & Pillar Testing");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "WIRE");
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId.toString());
  console.log("=".repeat(70));

  // ==================== PHASE 1: DEPLOY ALL CONTRACTS ====================
  console.log("\n=== PHASE 1: Deploying 6 Contracts ===\n");

  // 1. FanToken
  console.log("Deploying FanToken...");
  const FanTokenFactory = await ethers.getContractFactory("FanToken");
  const fanToken = await FanTokenFactory.deploy();
  const fanTokenReceipt = await fanToken.deploymentTransaction()!.wait();
  const fanTokenAddr = await fanToken.getAddress();
  log("Deploy FanToken (ERC-20)", "CORE", fanTokenReceipt!.hash, `FanToken deployed at ${fanTokenAddr}`);

  // 2. FanIdentity
  console.log("Deploying FanIdentity...");
  const FanIdentityFactory = await ethers.getContractFactory("FanIdentity");
  const fanIdentity = await FanIdentityFactory.deploy(fanTokenAddr);
  const fanIdentityReceipt = await fanIdentity.deploymentTransaction()!.wait();
  const fanIdentityAddr = await fanIdentity.getAddress();
  log("Deploy FanIdentity (Profile+XP)", "CORE", fanIdentityReceipt!.hash, `FanIdentity deployed at ${fanIdentityAddr}`);

  // 3. TicketFactory
  console.log("Deploying TicketFactory...");
  const treasury = deployer.address;
  const TicketFactoryFactory = await ethers.getContractFactory("TicketFactory");
  const ticketFactory = await TicketFactoryFactory.deploy(fanIdentityAddr, treasury);
  const ticketFactoryReceipt = await ticketFactory.deploymentTransaction()!.wait();
  const ticketFactoryAddr = await ticketFactory.getAddress();
  log("Deploy TicketFactory (ERC-1155)", "PILLAR1", ticketFactoryReceipt!.hash, `TicketFactory deployed at ${ticketFactoryAddr}`);

  // 4. RevenueSplitter
  console.log("Deploying RevenueSplitter...");
  const platform = deployer.address;
  const sponsorPool = deployer.address;
  const RevenueSplitterFactory = await ethers.getContractFactory("RevenueSplitter");
  const revenueSplitter = await RevenueSplitterFactory.deploy(platform, treasury, sponsorPool);
  const revenueSplitterReceipt = await revenueSplitter.deploymentTransaction()!.wait();
  const revenueSplitterAddr = await revenueSplitter.getAddress();
  log("Deploy RevenueSplitter", "PILLAR3", revenueSplitterReceipt!.hash, `RevenueSplitter deployed at ${revenueSplitterAddr}`);

  // 5. ContentManager
  console.log("Deploying ContentManager...");
  const ContentManagerFactory = await ethers.getContractFactory("ContentManager");
  const contentManager = await ContentManagerFactory.deploy(fanIdentityAddr, revenueSplitterAddr, platform, treasury);
  const contentManagerReceipt = await contentManager.deploymentTransaction()!.wait();
  const contentManagerAddr = await contentManager.getAddress();
  log("Deploy ContentManager (ERC-721)", "PILLAR3", contentManagerReceipt!.hash, `ContentManager deployed at ${contentManagerAddr}`);

  // 6. PSLGovernor
  console.log("Deploying PSLGovernor...");
  const PSLGovernorFactory = await ethers.getContractFactory("PSLGovernor");
  const governor = await PSLGovernorFactory.deploy(fanTokenAddr, fanIdentityAddr);
  const governorReceipt = await governor.deploymentTransaction()!.wait();
  const governorAddr = await governor.getAddress();
  log("Deploy PSLGovernor (DAO)", "PILLAR4", governorReceipt!.hash, `PSLGovernor deployed at ${governorAddr}`);

  // ==================== PHASE 2: ROLE SETUP ====================
  console.log("\n=== PHASE 2: Setting Up Access Control Roles ===\n");

  const MINTER_ROLE = await fanToken.MINTER_ROLE();
  const tx1 = await fanToken.grantRole(MINTER_ROLE, fanIdentityAddr);
  const r1 = await tx1.wait();
  log("Grant MINTER_ROLE to FanIdentity", "CORE", r1!.hash, "FanIdentity can now mint FanTokens when XP is awarded");

  const XP_AWARDER_ROLE = await fanIdentity.XP_AWARDER_ROLE();
  const tx2 = await fanIdentity.grantRole(XP_AWARDER_ROLE, ticketFactoryAddr);
  const r2 = await tx2.wait();
  log("Grant XP_AWARDER to TicketFactory", "PILLAR1", r2!.hash, "TicketFactory can award XP on check-in");

  const tx3 = await fanIdentity.grantRole(XP_AWARDER_ROLE, contentManagerAddr);
  const r3 = await tx3.wait();
  log("Grant XP_AWARDER to ContentManager", "PILLAR3", r3!.hash, "ContentManager can award XP on content approval");

  const tx4 = await fanIdentity.grantRole(XP_AWARDER_ROLE, governorAddr);
  const r4 = await tx4.wait();
  log("Grant XP_AWARDER to PSLGovernor", "PILLAR4", r4!.hash, "PSLGovernor can award XP on vote");

  const MANAGER_ROLE = await revenueSplitter.MANAGER_ROLE();
  const tx5 = await revenueSplitter.grantRole(MANAGER_ROLE, contentManagerAddr);
  const r5 = await tx5.wait();
  log("Grant MANAGER_ROLE to ContentManager", "PILLAR3", r5!.hash, "ContentManager can create revenue splits");

  // ==================== PHASE 3: PILLAR 2 — FAN IDENTITY ====================
  console.log("\n=== PHASE 3: Testing PILLAR 2 — Fan Identity & Loyalty ===\n");

  const txReg = await fanIdentity.register("CricketChain_PSLFan");
  const rReg = await txReg.wait();
  log("Register Fan Profile", "PILLAR2", rReg!.hash, 'Registered "CricketChain_PSLFan" — on-chain fan identity created');

  let profile = await fanIdentity.getProfile(deployer.address);
  console.log(`  Profile: ${profile.username} | XP: ${profile.totalXP} | Tier: Bronze`);

  // ==================== PHASE 4: PILLAR 1 — ANTI-SCALP TICKETING ====================
  console.log("\n=== PHASE 4: Testing PILLAR 1 — Anti-Scalp Ticketing ===\n");

  const matchDate = Math.floor(Date.now() / 1000) + 86400;
  const txMatch = await ticketFactory.createMatch("Lahore Qalandars vs Islamabad United - PSL Final", matchDate);
  const rMatch = await txMatch.wait();
  log("Create PSL Match", "PILLAR1", rMatch!.hash, "Created match: Lahore Qalandars vs Islamabad United - PSL Final");

  // Create General ticket: 0.001 WIRE, max resale at 110% (11000 BPS), 50 supply
  const txCat1 = await ticketFactory.createTicketCategory(1, "General Enclosure", ethers.parseEther("0.001"), 11000, 50);
  const rCat1 = await txCat1.wait();
  log("Create Ticket Category: General", "PILLAR1", rCat1!.hash, "General Enclosure: 0.001 WIRE, max resale 110%, 50 tickets");

  // Create VIP ticket: 0.005 WIRE, max resale at 110%, 10 supply
  const txCat2 = await ticketFactory.createTicketCategory(1, "VIP Box", ethers.parseEther("0.005"), 11000, 10);
  const rCat2 = await txCat2.wait();
  log("Create Ticket Category: VIP", "PILLAR1", rCat2!.hash, "VIP Box: 0.005 WIRE, max resale 110%, 10 tickets");

  // Buy a General ticket
  const txBuy = await ticketFactory.buyTicket(1, { value: ethers.parseEther("0.001") });
  const rBuy = await txBuy.wait();
  log("Buy General Ticket", "PILLAR1", rBuy!.hash, "Fan purchased General ticket for 0.001 WIRE — ticket NFT (ERC-1155) transferred");

  // Verify anti-scalp: try to list above max price (should fail)
  console.log("  Testing anti-scalp enforcement...");
  try {
    const txScalp = await ticketFactory.listForResale(1, ethers.parseEther("0.01")); // 10x price
    await txScalp.wait();
    console.log("  ✗ ANTI-SCALP FAILED — listing above max price was allowed!");
  } catch (e: any) {
    console.log("  ✓ Anti-scalp WORKS — contract rejected listing above max resale price (110% of original)");
  }

  // List ticket at valid resale price (<= 110% of 0.001 = 0.0011)
  const txList = await ticketFactory.listForResale(1, ethers.parseEther("0.0011"));
  const rList = await txList.wait();
  log("List Ticket for Resale (valid price)", "PILLAR1", rList!.hash, "Listed General ticket for resale at 0.0011 WIRE (110% cap enforced)");

  // Cancel listing to get ticket back (we need it for check-in)
  const txCancel = await ticketFactory.cancelListing(0);
  const rCancel = await txCancel.wait();
  log("Cancel Listing (get ticket back)", "PILLAR1", rCancel!.hash, "Seller cancelled resale listing, ticket returned");

  // Check in at match
  const txCheckIn = await ticketFactory.checkIn(1, deployer.address);
  const rCheckIn = await txCheckIn.wait();
  log("Check-In at Match", "PILLAR1+2", rCheckIn!.hash, "Fan checked in at venue — +100 XP awarded, matchesAttended incremented (Pillar 1→2 integration)");

  profile = await fanIdentity.getProfile(deployer.address);
  console.log(`  After check-in: XP=${profile.totalXP}, Matches=${profile.matchesAttended}, Tier=${["Bronze","Silver","Gold","Platinum","Diamond"][Number(await fanIdentity.getTier(deployer.address))]}`);

  // ==================== PHASE 5: PILLAR 3 — CONTENT MONETIZATION ====================
  console.log("\n=== PHASE 5: Testing PILLAR 3 — Content Monetization & Revenue Splitting ===\n");

  const txSubmit = await contentManager.submitContent(
    "ipfs://QmShaheenHatTrick2024Finals",
    "Shaheen's Hat-trick in PSL Final",
    "Amazing bowling spell — 3 wickets in 3 balls in the PSL Final!"
  );
  const rSubmit = await txSubmit.wait();
  log("Submit Content", "PILLAR3", rSubmit!.hash, "Fan submitted cricket highlight content (IPFS metadata)");

  const txApprove = await contentManager.approveContent(1);
  const rApprove = await txApprove.wait();
  log("Approve Content (mint NFT + split)", "PILLAR3+2", rApprove!.hash, "Moderator approved content — ERC-721 NFT minted, revenue split created (50/20/15/15 BPS), +50 XP to creator");

  profile = await fanIdentity.getProfile(deployer.address);
  console.log(`  After content approval: XP=${profile.totalXP}, Content=${profile.contentSubmitted}`);

  // Sponsor content
  const txSponsor = await contentManager.sponsorContent(1, { value: ethers.parseEther("0.01") });
  const rSponsor = await txSponsor.wait();
  log("Sponsor Content (revenue deposit)", "PILLAR3", rSponsor!.hash, "Brand sponsored content with 0.01 WIRE — funds deposited to RevenueSplitter for auto-distribution");

  // Check claimable amounts
  const claimable = await revenueSplitter.getClaimable(1, deployer.address);
  console.log(`  Creator claimable: ${ethers.formatEther(claimable)} WIRE (50% of 0.01 = 0.005)`);

  // Claim revenue
  if (claimable > 0n) {
    const txClaim = await revenueSplitter.claimRevenue(1);
    const rClaim = await txClaim.wait();
    log("Claim Revenue (creator share)", "PILLAR3", rClaim!.hash, `Creator claimed ${ethers.formatEther(claimable)} WIRE — 50% revenue share from sponsored content`);
  }

  // ==================== PHASE 6: PILLAR 4 — DAO GOVERNANCE ====================
  console.log("\n=== PHASE 6: Testing PILLAR 4 — PSL DAO Governance ===\n");

  const txProposal = await governor.createProposal(
    0, // MVP_VOTE
    "Man of the Match — PSL Final: LQ vs IU",
    "Vote for the best player of the PSL Final match",
    ["Shaheen Afridi", "Babar Azam", "Shadab Khan"],
    3600 // 1 hour voting period (minimum allowed)
  );
  const rProposal = await txProposal.wait();
  log("Create DAO Proposal (MVP Vote)", "PILLAR4", rProposal!.hash, "Created Man of the Match proposal with 3 options, 1-hour voting period");

  // Vote
  const txVote = await governor.vote(1, 0); // Vote for Shaheen
  const rVote = await txVote.wait();
  log("Cast DAO Vote", "PILLAR4+2", rVote!.hash, "Fan voted for Shaheen Afridi — vote weighted by FanToken balance × tier multiplier, +25 XP awarded (Pillar 4→2 integration)");

  profile = await fanIdentity.getProfile(deployer.address);
  console.log(`  After vote: XP=${profile.totalXP}, Votes=${profile.votesParticipated}`);

  const fanTokenBalance = await fanToken.balanceOf(deployer.address);
  const tier = await fanIdentity.getTier(deployer.address);
  const voteWeight = await fanIdentity.getVoteWeight(deployer.address);
  console.log(`  FanToken balance: ${ethers.formatEther(fanTokenBalance)} FAN`);
  console.log(`  Tier: ${["Bronze","Silver","Gold","Platinum","Diamond"][Number(tier)]}`);
  console.log(`  Vote weight: ${ethers.formatEther(voteWeight)}`);
  console.log(`  \nNote: Proposal can be finalized after 1 hour. Run: npx hardhat run scripts/finalize-dao.ts --network wirefluidTestnet`);

  // ==================== FINAL SUMMARY ====================
  const finalBalance = await ethers.provider.getBalance(deployer.address);
  const gasSpent = balance - finalBalance;

  console.log("\n" + "=".repeat(70));
  console.log("DEPLOYMENT & TESTING COMPLETE");
  console.log("=".repeat(70));

  console.log("\n--- Deployed Contract Addresses ---");
  console.log(`  FanToken (ERC-20):        ${fanTokenAddr}`);
  console.log(`  FanIdentity:              ${fanIdentityAddr}`);
  console.log(`  TicketFactory (ERC-1155):  ${ticketFactoryAddr}`);
  console.log(`  RevenueSplitter:          ${revenueSplitterAddr}`);
  console.log(`  ContentManager (ERC-721): ${contentManagerAddr}`);
  console.log(`  PSLGovernor (DAO):        ${governorAddr}`);

  console.log("\n--- Final Fan Profile ---");
  const finalProfile = await fanIdentity.getProfile(deployer.address);
  console.log(`  Username: ${finalProfile.username}`);
  console.log(`  Total XP: ${finalProfile.totalXP}`);
  console.log(`  Matches Attended: ${finalProfile.matchesAttended}`);
  console.log(`  Content Submitted: ${finalProfile.contentSubmitted}`);
  console.log(`  Votes Participated: ${finalProfile.votesParticipated}`);
  console.log(`  FanToken Balance: ${ethers.formatEther(await fanToken.balanceOf(deployer.address))} FAN`);
  console.log(`  Tier: ${["Bronze","Silver","Gold","Platinum","Diamond"][Number(await fanIdentity.getTier(deployer.address))]}`);

  console.log(`\n--- Gas Usage ---`);
  console.log(`  Starting balance: ${ethers.formatEther(balance)} WIRE`);
  console.log(`  Ending balance:   ${ethers.formatEther(finalBalance)} WIRE`);
  console.log(`  Total gas spent:  ${ethers.formatEther(gasSpent)} WIRE`);

  console.log("\n" + "=".repeat(70));
  console.log("ALL TRANSACTION HASHES FOR HACKATHON SUBMISSION");
  console.log("=".repeat(70));
  console.log(`\nExplorer: https://wirefluidscan.com\n`);

  for (const tx of txLog) {
    console.log(`[${tx.pillar}] ${tx.step}`);
    console.log(`  Hash: ${tx.hash}`);
    console.log(`  URL:  https://wirefluidscan.com/tx/${tx.hash}`);
    console.log(`  What: ${tx.description}`);
    console.log();
  }

  console.log(`Total transactions: ${txLog.length}`);
  console.log("\n--- Contract Addresses for Verification ---");
  console.log(`FanToken:        https://wirefluidscan.com/address/${fanTokenAddr}`);
  console.log(`FanIdentity:     https://wirefluidscan.com/address/${fanIdentityAddr}`);
  console.log(`TicketFactory:   https://wirefluidscan.com/address/${ticketFactoryAddr}`);
  console.log(`RevenueSplitter: https://wirefluidscan.com/address/${revenueSplitterAddr}`);
  console.log(`ContentManager:  https://wirefluidscan.com/address/${contentManagerAddr}`);
  console.log(`PSLGovernor:     https://wirefluidscan.com/address/${governorAddr}`);

  // Save addresses for finalize script
  const fs = require("fs");
  const deployData = {
    network: "wirefluidTestnet",
    chainId: 92533,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      FanToken: fanTokenAddr,
      FanIdentity: fanIdentityAddr,
      TicketFactory: ticketFactoryAddr,
      RevenueSplitter: revenueSplitterAddr,
      ContentManager: contentManagerAddr,
      PSLGovernor: governorAddr,
    },
    transactions: txLog,
  };
  fs.writeFileSync("deployments.json", JSON.stringify(deployData, null, 2));
  console.log("\nSaved deployment data to deployments.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
