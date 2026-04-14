import { expect } from "chai";
import { ethers } from "hardhat";
import { FanToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FanToken", function () {
  let fanToken: FanToken;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let user: SignerWithAddress;
  let MINTER_ROLE: string;

  beforeEach(async function () {
    [owner, minter, user] = await ethers.getSigners();
    const FanTokenFactory = await ethers.getContractFactory("FanToken");
    fanToken = await FanTokenFactory.deploy();
    MINTER_ROLE = await fanToken.MINTER_ROLE();
  });

  it("should have correct name and symbol", async function () {
    expect(await fanToken.name()).to.equal("PSL Fan Token");
    expect(await fanToken.symbol()).to.equal("FAN");
  });

  it("should grant DEFAULT_ADMIN_ROLE to deployer", async function () {
    const DEFAULT_ADMIN_ROLE = await fanToken.DEFAULT_ADMIN_ROLE();
    expect(await fanToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
  });

  it("should allow MINTER_ROLE to mint tokens", async function () {
    await fanToken.grantRole(MINTER_ROLE, minter.address);
    await fanToken.connect(minter).mint(user.address, ethers.parseEther("100"));
    expect(await fanToken.balanceOf(user.address)).to.equal(ethers.parseEther("100"));
  });

  it("should revert when non-MINTER tries to mint", async function () {
    await expect(
      fanToken.connect(user).mint(user.address, ethers.parseEther("100"))
    ).to.be.reverted;
  });

  it("should allow users to burn their own tokens", async function () {
    await fanToken.grantRole(MINTER_ROLE, owner.address);
    await fanToken.mint(user.address, ethers.parseEther("100"));
    await fanToken.connect(user).burn(ethers.parseEther("30"));
    expect(await fanToken.balanceOf(user.address)).to.equal(ethers.parseEther("70"));
  });

  it("should update total supply correctly on mint and burn", async function () {
    await fanToken.grantRole(MINTER_ROLE, owner.address);
    await fanToken.mint(user.address, ethers.parseEther("1000"));
    expect(await fanToken.totalSupply()).to.equal(ethers.parseEther("1000"));

    await fanToken.connect(user).burn(ethers.parseEther("400"));
    expect(await fanToken.totalSupply()).to.equal(ethers.parseEther("600"));
  });
});
