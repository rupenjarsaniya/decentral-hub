const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

describe("IDOFactory", function () {
  async function deployTokenFixture() {
    const accounts = await ethers.getSigners();

    const Token = await ethers.getContractFactory("erc20Token");
    const Staking = await ethers.getContractFactory("Staking");

    const token = await Token.deploy(
      "TEST TOKEN",
      "TT",
      100000,
      100000,
      accounts[0].address
    );
    const staking = await Staking.deploy(token.address, 5, accounts[0].address);

    await token.deployed();
    await staking.deployed();

    return {
      token,
      staking,
      accounts,
    };
  }

  it("Should deploy the contracts correctly", async function () {
    const { staking } = await loadFixture(deployTokenFixture);

    expect(await staking.name()).to.equal("vested Staking");
  });

  it("Should stake correctly", async function () {
    const { staking, token, accounts } = await loadFixture(deployTokenFixture);

    await token.connect(accounts[0]).approve(staking.address, 1000);
    await staking.connect(accounts[0]).stakeToken(1000);

    await token.connect(accounts[0]).transfer(accounts[1].address, 1000);
    await token.connect(accounts[1]).approve(staking.address, 1000);
    await staking.connect(accounts[1]).stakeToken(1000);

    expect(await staking.balanceOf(accounts[0].address)).to.equal(1000);
    expect(await staking.balanceOf(accounts[1].address)).to.equal(1000);
    expect(await token.balanceOf(staking.address)).to.equal(2000);
  });

  it("should claim rewards correctly", async function () {
    const { staking, token, accounts } = await loadFixture(deployTokenFixture);

    await token.approve(staking.address, 1000);
    await staking.stakeToken(1000);

    await token.transfer(accounts[1].address, 1000);
    await token.connect(accounts[1]).approve(staking.address, 1000);
    await staking.connect(accounts[1]).stakeToken(1000);

    await ethers.provider.send("evm_increaseTime", [1000]);
    const balanceBefore = await token.balanceOf(accounts[0].address);
    await staking.connect(accounts[0]).claimReward(100, 0);

    const stakeInfo = await staking.stakeInfos(accounts[0].address, 0);
    expect(stakeInfo.claimed).to.equal(100);

    await expect(
      staking.connect(accounts[0]).claimReward(1000, 0)
    ).to.be.revertedWith("Staking: Invalid amount");

    expect(await token.balanceOf(accounts[0].address)).to.equal(
      balanceBefore.add(105)
    );
  });

  it("should update interest rate correctly", async function () {
    const { staking } = await loadFixture(deployTokenFixture);

    await staking.updateInterestRate(10);

    expect(await staking.interestRate()).to.equal(10);
  });

  it("should pause and unpause correctly", async function () {
    const { staking, token } = await loadFixture(deployTokenFixture);

    await staking.pause();
    await token.approve(staking.address, 1000);
    await expect(staking.stakeToken(1000)).to.be.revertedWith(
      "Pausable: paused"
    );

    await staking.unpause();
    await staking.stakeToken(1000);
  });

  it("should end staking correctly", async function () {
    const { staking, token, accounts } = await loadFixture(deployTokenFixture);

    await token.approve(staking.address, 1000);
    await staking.stakeToken(1000);

    await token.transfer(accounts[1].address, 1000);
    await token.connect(accounts[1]).approve(staking.address, 1000);
    await staking.connect(accounts[1]).stakeToken(1000);

    await ethers.provider.send("evm_increaseTime", [1000]);
    await staking.connect(accounts[0]).claimReward(100, 0);
    await staking.connect(accounts[1]).claimReward(100, 0);

    await staking.endStaking();

    expect(await token.balanceOf(staking.address)).to.equal(2000 - 210);

    await expect(staking.stakeToken(1000)).to.be.revertedWith(
      "Staking: Not available"
    );
  });
});
