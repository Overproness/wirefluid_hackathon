import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("=".repeat(70));
  console.log("CricketChain — Full Demo Script");
  console.log("Deployer:", deployer.address);
  console.log("=".repeat(70));

  // ==================== DEPLOY ALL CONTRACTS ====================
  console.log("\n--- Deploying Contracts ---");

  const FanTokenFactory = await ethers.getContractFactory("FanToken");
  const fanToken = await FanTokenFactory.deploy();
  await fanToken.waitForDeployment();
  console.log("FanToken deployed to:", await fanToken.getAddress());

  const FanIdentityFactory = await ethers.getContractFactory("FanIdentity");
  const fanIdentity = await FanIdentityFactory.deploy(await fanToken.getAddress());
  await fanIdentity.waitForDeployment();
  console.log("FanIdentity deployed to:", await fanIdentity.getAddress());

  const treasury = deployer.address; // Use deployer as treasury for demo
  const TicketFactoryFactory = await ethers.getContractFactory("TicketFactory");
  const ticketFactory = await TicketFactoryFactory.deploy(await fanIdentity.getAddress(), treasury);
  await ticketFactory.waitForDeployment();
  console.log("TicketFactory deployed to:", await ticketFactory.getAddress());

  const platform = deployer.address;
  const sponsorPool = deployer.address;
  const RevenueSplitterFactory = await ethers.getContractFactory("RevenueSplitter");
  const revenueSplitter = await RevenueSplitterFactory.deploy(platform, treasury, sponsorPool);
  await revenueSplitter.waitForDeployment();
  console.log("RevenueSplitter deployed to:", await revenueSplitter.getAddress());

  const ContentManagerFactory = await ethers.getContractFactory("ContentManager");
  const contentManager = await ContentManagerFactory.deploy(
    await fanIdentity.getAddress(), await revenueSplitter.getAddress(), platform, treasury
  );
  await contentManager.waitForDeployment();
  console.log("ContentManager deployed to:", await contentManager.getAddress());

  const PSLGovernorFactory = await ethers.getContractFactory("PSLGovernor");
  const governor = await PSLGovernorFactory.deploy(
    await fanToken.getAddress(), await fanIdentity.getAddress()
  );
  await governor.waitForDeployment();
  console.log("PSLGovernor deployed to:", await governor.getAddress());

  // ==================== SETUP ROLES ====================
  console.log("\n--- Setting Up Roles ---");

  const MINTER_ROLE = await fanToken.MINTER_ROLE();
  await (await fanToken.grantRole(MINTER_ROLE, await fanIdentity.getAddress())).wait();
  console.log("Granted MINTER_ROLE to FanIdentity");

  const XP_AWARDER_ROLE = await fanIdentity.XP_AWARDER_ROLE();
  await (await fanIdentity.grantRole(XP_AWARDER_ROLE, await ticketFactory.getAddress())).wait();
  await (await fanIdentity.grantRole(XP_AWARDER_ROLE, await contentManager.getAddress())).wait();
  await (await fanIdentity.grantRole(XP_AWARDER_ROLE, await governor.getAddress())).wait();
  console.log("Granted XP_AWARDER_ROLE to TicketFactory, ContentManager, PSLGovernor");

  const MANAGER_ROLE = await revenueSplitter.MANAGER_ROLE();
  await (await revenueSplitter.grantRole(MANAGER_ROLE, await contentManager.getAddress())).wait();
  console.log("Granted MANAGER_ROLE to ContentManager");

  // ==================== DEMO FLOW ====================
  console.log("\n--- Demo: Registering Fan ---");
  await (await fanIdentity.register("DemoFan_PSLRocks")).wait();
  const profile = await fanIdentity.getProfile(deployer.address);
  console.log(`Registered: ${profile.username} | XP: ${profile.totalXP}`);

  console.log("\n--- Demo: Creating PSL Match ---");
  const matchDate = Math.floor(Date.now() / 1000) + 86400;
  await (await ticketFactory.createMatch("Lahore Qalandars vs Islamabad United", matchDate)).wait();
  console.log("Match created: Lahore Qalandars vs Islamabad United");

  console.log("\n--- Demo: Creating Ticket Categories ---");
  await (await ticketFactory.createTicketCategory(1, "General", ethers.parseEther("0.01"), 11000, 100)).wait();
  await (await ticketFactory.createTicketCategory(1, "VIP", ethers.parseEther("0.05"), 11000, 20)).wait();
  console.log("General tickets: 0.01 WIRE x 100");
  console.log("VIP tickets: 0.05 WIRE x 20");

  console.log("\n--- Demo: Buying Ticket ---");
  await (await ticketFactory.buyTicket(1, { value: ethers.parseEther("0.01") })).wait();
  console.log("Purchased General ticket!");

  console.log("\n--- Demo: Check-In at Match ---");
  await (await ticketFactory.checkIn(1, deployer.address)).wait();
  const profileAfterCheckIn = await fanIdentity.getProfile(deployer.address);
  console.log(`Check-in complete! XP: ${profileAfterCheckIn.totalXP} | Matches: ${profileAfterCheckIn.matchesAttended}`);

  console.log("\n--- Demo: Submitting Content ---");
  await (await contentManager.submitContent(
    "ipfs://QmShaheenHatTrick2024",
    "Shaheen's Hat-trick Highlights",
    "Amazing bowling spell - 3 wickets in 3 balls!"
  )).wait();
  console.log("Content submitted: Shaheen's Hat-trick Highlights");

  console.log("\n--- Demo: Approving Content ---");
  await (await contentManager.approveContent(1)).wait();
  const profileAfterContent = await fanIdentity.getProfile(deployer.address);
  console.log(`Content approved! XP: ${profileAfterContent.totalXP} | Content: ${profileAfterContent.contentSubmitted}`);

  console.log("\n--- Demo: Sponsoring Content ---");
  await (await contentManager.sponsorContent(1, { value: ethers.parseEther("0.1") })).wait();
  console.log("Sponsor funded content with 0.1 WIRE");

  console.log("\n--- Demo: Claiming Revenue ---");
  const claimable = await revenueSplitter.getClaimable(1, deployer.address);
  console.log(`Claimable revenue: ${ethers.formatEther(claimable)} WIRE`);
  if (claimable > 0n) {
    await (await revenueSplitter.claimRevenue(1)).wait();
    console.log("Revenue claimed!");
  }

  console.log("\n--- Demo: Creating DAO Proposal ---");
  await (await governor.createProposal(
    0, // MVP_VOTE
    "Man of the Match - LQ vs IU",
    "Vote for the best player of the match",
    ["Shaheen Afridi", "Babar Azam", "Shadab Khan"],
    3600 // 1 hour for demo
  )).wait();
  console.log("Proposal created: Man of the Match - LQ vs IU");

  console.log("\n--- Demo: Voting ---");
  await (await governor.vote(1, 0)).wait(); // Vote for Shaheen
  const profileAfterVote = await fanIdentity.getProfile(deployer.address);
  console.log(`Voted for Shaheen Afridi! XP: ${profileAfterVote.totalXP}`);

  // ==================== FINAL SUMMARY ====================
  console.log("\n" + "=".repeat(70));
  console.log("FINAL STATE SUMMARY");
  console.log("=".repeat(70));
  const finalProfile = await fanIdentity.getProfile(deployer.address);
  console.log(`Fan: ${finalProfile.username}`);
  console.log(`Total XP: ${finalProfile.totalXP}`);
  console.log(`Matches Attended: ${finalProfile.matchesAttended}`);
  console.log(`Content Submitted: ${finalProfile.contentSubmitted}`);
  console.log(`Votes Participated: ${finalProfile.votesParticipated}`);
  console.log(`FanToken Balance: ${ethers.formatEther(await fanToken.balanceOf(deployer.address))} FAN`);
  console.log(`Tier: ${["Bronze", "Silver", "Gold", "Platinum", "Diamond"][Number(await fanIdentity.getTier(deployer.address))]}`);
  console.log(`Total FanToken Supply: ${ethers.formatEther(await fanToken.totalSupply())} FAN`);
  console.log("=".repeat(70));
  console.log("\nDeployed Contract Addresses:");
  console.log(`  FanToken:        ${await fanToken.getAddress()}`);
  console.log(`  FanIdentity:     ${await fanIdentity.getAddress()}`);
  console.log(`  TicketFactory:   ${await ticketFactory.getAddress()}`);
  console.log(`  RevenueSplitter: ${await revenueSplitter.getAddress()}`);
  console.log(`  ContentManager:  ${await contentManager.getAddress()}`);
  console.log(`  PSLGovernor:     ${await governor.getAddress()}`);
  console.log("=".repeat(70));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
