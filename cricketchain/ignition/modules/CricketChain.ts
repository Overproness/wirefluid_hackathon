import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CricketChainModule = buildModule("CricketChain", (m) => {
  // Parameters for addresses (set via ignition params or use deployer defaults)
  const treasury = m.getParameter("treasury", "0x0000000000000000000000000000000000000001");
  const platform = m.getParameter("platform", "0x0000000000000000000000000000000000000002");
  const sponsorPool = m.getParameter("sponsorPool", "0x0000000000000000000000000000000000000003");

  // 1. Deploy FanToken (no dependencies)
  const fanToken = m.contract("FanToken");

  // 2. Deploy FanIdentity (needs FanToken)
  const fanIdentity = m.contract("FanIdentity", [fanToken]);

  // 3. Deploy TicketFactory (needs FanIdentity + treasury)
  const ticketFactory = m.contract("TicketFactory", [fanIdentity, treasury]);

  // 4. Deploy RevenueSplitter (needs platform, treasury, sponsorPool)
  const revenueSplitter = m.contract("RevenueSplitter", [platform, treasury, sponsorPool]);

  // 5. Deploy ContentManager (needs FanIdentity + RevenueSplitter + platform + treasury)
  const contentManager = m.contract("ContentManager", [fanIdentity, revenueSplitter, platform, treasury]);

  // 6. Deploy PSLGovernor (needs FanToken + FanIdentity)
  const governor = m.contract("PSLGovernor", [fanToken, fanIdentity]);

  return { fanToken, fanIdentity, ticketFactory, revenueSplitter, contentManager, governor };
});

export default CricketChainModule;
