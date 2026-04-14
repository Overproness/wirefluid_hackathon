import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("=".repeat(70));
  console.log("CricketChain — Finalize DAO Proposal");
  console.log("Deployer:", deployer.address);
  console.log("=".repeat(70));

  // Load deployment data
  if (!fs.existsSync("deployments.json")) {
    console.error("deployments.json not found. Run deploy-testnet.ts first.");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync("deployments.json", "utf-8"));

  const governor = await ethers.getContractAt("PSLGovernor", data.contracts.PSLGovernor);
  const fanIdentity = await ethers.getContractAt("FanIdentity", data.contracts.FanIdentity);
  const fanToken = await ethers.getContractAt("FanToken", data.contracts.FanToken);

  // Check proposal state
  const proposal = await governor.getProposal(1);
  console.log(`\nProposal: "${proposal.title}"`);
  console.log(`End time: ${new Date(Number(proposal.endTime) * 1000).toISOString()}`);
  console.log(`Current time: ${new Date().toISOString()}`);
  console.log(`State: ${["Active", "Succeeded", "Defeated", "Executed"][Number(proposal.state)]}`);
  console.log(`Total votes: ${ethers.formatEther(proposal.totalVotes)} (weighted)`);

  if (proposal.state !== 0n) {
    console.log("\nProposal already finalized.");
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= Number(proposal.endTime)) {
    const remaining = Number(proposal.endTime) - now;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    console.log(`\nVoting period not ended yet. ${mins}m ${secs}s remaining.`);
    console.log("Please wait and run this script again.");
    return;
  }

  // Finalize
  console.log("\nFinalizing proposal...");
  const txFinalize = await governor.finalizeProposal(1);
  const rFinalize = await txFinalize.wait();
  console.log(`  ✓ Finalize tx: ${rFinalize!.hash}`);
  console.log(`  URL: https://wirefluidscan.com/tx/${rFinalize!.hash}`);

  const updatedProposal = await governor.getProposal(1);
  const state = ["Active", "Succeeded", "Defeated", "Executed"][Number(updatedProposal.state)];
  console.log(`  Result: ${state}`);

  // Get winning option
  const [winIdx, winVotes] = await governor.getWinningOption(1);
  console.log(`  Winning option: #${winIdx} with ${ethers.formatEther(winVotes)} votes`);

  // Execute if succeeded
  if (updatedProposal.state === 1n) {
    console.log("\nExecuting proposal...");
    const txExec = await governor.executeProposal(1);
    const rExec = await txExec.wait();
    console.log(`  ✓ Execute tx: ${rExec!.hash}`);
    console.log(`  URL: https://wirefluidscan.com/tx/${rExec!.hash}`);

    // Update deployments.json with new tx hashes
    data.transactions.push({
      step: "Finalize DAO Proposal",
      pillar: "PILLAR4",
      hash: rFinalize!.hash,
      description: `Proposal finalized as ${state}. Winning option: #${winIdx}`,
    });
    data.transactions.push({
      step: "Execute DAO Proposal",
      pillar: "PILLAR4",
      hash: rExec!.hash,
      description: `Proposal executed on-chain — governance decision recorded`,
    });
    fs.writeFileSync("deployments.json", JSON.stringify(data, null, 2));
    console.log("\nUpdated deployments.json with finalize + execute tx hashes.");
  } else {
    data.transactions.push({
      step: "Finalize DAO Proposal",
      pillar: "PILLAR4",
      hash: rFinalize!.hash,
      description: `Proposal finalized as ${state}`,
    });
    fs.writeFileSync("deployments.json", JSON.stringify(data, null, 2));
  }

  // Print final summary
  console.log("\n--- Additional TX Hashes for Submission ---");
  console.log(`Finalize: ${rFinalize!.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
