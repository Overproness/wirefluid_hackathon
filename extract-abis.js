const fs = require("fs");
const path = require("path");

const contracts = [
  "FanToken",
  "FanIdentity",
  "TicketFactory",
  "ContentManager",
  "RevenueSplitter",
  "PSLGovernor",
];
const abiDir = path.join(__dirname, "website", "lib", "abis");
fs.mkdirSync(abiDir, { recursive: true });

contracts.forEach((c) => {
  const artifactPath = path.join(
    __dirname,
    "cricketchain",
    "artifacts",
    "contracts",
    c + ".sol",
    c + ".json",
  );
  const data = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = JSON.stringify(data.abi, null, 2);
  const outPath = path.join(abiDir, c + ".ts");
  fs.writeFileSync(
    outPath,
    "export const " + c + "ABI = " + abi + " as const;\n",
  );
  console.log(c + " ABI extracted: " + data.abi.length + " entries");
});
