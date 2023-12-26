const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const idoABI = require("../artifacts/contracts/IDO/IDO.sol/IDO.json").abi;
const { ethers } = require("hardhat");

describe("IDOFactory", function () {
  const memeTokenPrice = 0.0001;
  const tokenTotalSupply = 1000000;
  const idoTokenPercent = 10;
  const minimumMemeTokens = 100;
  const minMemeTokenToParticipate = 10;
  const idoStartTime = Math.floor(Date.now() / 1000 + 1000); // Start in 1000 seconds
  const idoBFATime = idoStartTime + 500; // 500 seconds after start
  const idoEndTime = idoStartTime + 2000; // 2000 seconds after start
  const claimableTime = idoEndTime + 1000; // 1000 seconds after end
  const idoTokenRequired = (idoTokenPercent * tokenTotalSupply) / 100;

  async function deployTokenFixture() {
    const accounts = await ethers.getSigners();

    const IDOFactory = await ethers.getContractFactory("IDOFactory");
    const MemeToken = await ethers.getContractFactory("memeToken");
    const IdoToken = await ethers.getContractFactory("erc20Token");

    const idoFactory = await IDOFactory.deploy();
    const memeToken = await MemeToken.deploy(100000);
    const idoToken = await IdoToken.deploy(
      "TEST TOKEN",
      "TT",
      100000,
      100000,
      accounts[0].address
    );

    await idoFactory.deployed();
    await memeToken.deployed();
    await idoToken.deployed();

    await idoFactory
      .connect(accounts[0])
      .createIDO(
        accounts[0].address,
        ethers.utils.parseEther(tokenTotalSupply.toString()),
        idoTokenPercent,
        ethers.utils.parseEther(minimumMemeTokens.toString()),
        ethers.utils.parseEther(minMemeTokenToParticipate.toString()),
        idoToken.address,
        memeToken.address,
        idoStartTime,
        idoBFATime,
        idoEndTime,
        claimableTime
      );

    const ownerIDOs = await idoFactory.getIdos(accounts[0].address);

    const idoContract = new ethers.Contract(ownerIDOs[0], idoABI, accounts[0]);

    await idoToken
      .connect(accounts[0])
      .approve(
        idoContract.address,
        ethers.utils.parseEther(idoTokenRequired.toString())
      );

    await memeToken.connect(accounts[1]).buy(ethers.utils.parseEther("10"), {
      value: BigInt(ethers.utils.parseEther("10") * memeTokenPrice),
    });
    await memeToken.connect(accounts[2]).buy(ethers.utils.parseEther("20"), {
      value: ethers.utils.parseEther("20") * memeTokenPrice,
    });

    expect(await memeToken.balanceOf(accounts[1].address)).to.equal(
      ethers.utils.parseEther("10")
    );
    expect(await memeToken.balanceOf(accounts[2].address)).to.equal(
      ethers.utils.parseEther("20")
    );

    return {
      memeToken,
      idoToken,
      idoContract,
      accounts,
    };
  }

  it("Should deploy the contracts correctly", async function () {
    const { memeToken, idoToken } = await loadFixture(deployTokenFixture);

    expect(await idoToken.totalSupply()).to.equal(
      ethers.utils.parseEther("100000")
    );
    expect(await memeToken.totalSupply()).to.equal(
      ethers.utils.parseEther("100000")
    );
  });

  it("Should start contract", async function () {
    const { idoContract, accounts, idoToken } = await loadFixture(
      deployTokenFixture
    );

    await ethers.provider.send("evm_increaseTime", [1000]);
    await idoContract.connect(accounts[0]).startIDO();

    expect(await idoToken.balanceOf(idoContract.address)).to.equal(
      ethers.utils.parseEther(idoTokenRequired.toString())
    );
    expect(await idoContract.idoState()).to.equal(1);
  });

  it("should participate and claim ido tokens", async function () {
    const { idoContract, accounts, memeToken, idoToken } = await loadFixture(
      deployTokenFixture
    );

    // Start ido
    await ethers.provider.send("evm_increaseTime", [1000]);
    await idoContract.connect(accounts[0]).startIDO();

    const balanceBefore = await idoToken.balanceOf(idoContract.address);

    // Participate in ido
    await memeToken
      .connect(accounts[1])
      .approve(idoContract.address, ethers.utils.parseEther("10"));
    await idoContract
      .connect(accounts[1])
      .participate(ethers.utils.parseEther("10"));

    await memeToken
      .connect(accounts[2])
      .approve(idoContract.address, ethers.utils.parseEther("11"));
    await idoContract
      .connect(accounts[2])
      .participate(ethers.utils.parseEther("11"));

    const memeTokensSentByAddress1 = await idoContract.participants(
      accounts[1].address
    );
    const memeTokensSentByAddress2 = await idoContract.participants(
      accounts[2].address
    );
    expect(memeTokensSentByAddress1.memeTokensSent).to.equal(
      ethers.utils.parseEther("10")
    );
    expect(memeTokensSentByAddress2.memeTokensSent).to.equal(
      ethers.utils.parseEther("11")
    );

    // Claim ido tokens
    await ethers.provider.send("evm_increaseTime", [3000]);
    await idoContract.endIDO();
    await idoContract.cliamableIDO();

    await idoContract.connect(accounts[1]).claimIDOToken();
    await idoContract.connect(accounts[2]).claimIDOToken();

    const balanceAfter = await idoToken.balanceOf(idoContract.address);

    expect(balanceAfter).to.equal(
      balanceBefore.sub(ethers.utils.parseEther("21"))
    );
  });

  it("should participate in ido and withdraw their memetoken after ido will be cancel", async function () {
    const { idoContract, accounts, memeToken, idoToken } = await loadFixture(
      deployTokenFixture
    );

    // Start ido
    await ethers.provider.send("evm_increaseTime", [1000]);
    await idoContract.connect(accounts[0]).startIDO();

    // Participate in ido
    await memeToken
      .connect(accounts[1])
      .approve(idoContract.address, ethers.utils.parseEther("10"));
    await idoContract
      .connect(accounts[1])
      .participate(ethers.utils.parseEther("10"));

    await memeToken
      .connect(accounts[2])
      .approve(idoContract.address, ethers.utils.parseEther("11"));
    await idoContract
      .connect(accounts[2])
      .participate(ethers.utils.parseEther("11"));

    const memeTokensSentByAddress1 = await idoContract.participants(
      accounts[1].address
    );
    const memeTokensSentByAddress2 = await idoContract.participants(
      accounts[2].address
    );
    expect(memeTokensSentByAddress1.memeTokensSent).to.equal(
      ethers.utils.parseEther("10")
    );
    expect(memeTokensSentByAddress2.memeTokensSent).to.equal(
      ethers.utils.parseEther("11")
    );

    // Cancel ido and withdraw memetokens
    await ethers.provider.send("evm_increaseTime", [3000]);
    await idoContract.cancelIDO();

    expect(await idoContract.idoState()).to.equal(4);

    await memeToken
      .connect(accounts[0])
      .approve(idoContract.address, ethers.utils.parseEther("21"));

    await idoContract.connect(accounts[1]).withdraw();
    await idoContract.connect(accounts[2]).withdraw();

    expect(await memeToken.balanceOf(accounts[0].address)).to.equal(0);
  });

  it("Should end ido", async function () {
    const { idoContract, accounts } = await loadFixture(deployTokenFixture);

    await ethers.provider.send("evm_increaseTime", [3000]);
    await idoContract.connect(accounts[0]).startIDO();
    await idoContract.connect(accounts[0]).endIDO();

    expect(await idoContract.idoState()).to.equal(3);
  });

  it("should not start ido before time", async function () {
    const { idoContract, accounts } = await loadFixture(deployTokenFixture);

    await expect(
      idoContract.connect(accounts[0]).startIDO()
    ).to.be.revertedWith("IDO: IDO cannot start now");
  });

  it("should not end ido before time", async function () {
    const { idoContract, accounts } = await loadFixture(deployTokenFixture);

    await ethers.provider.send("evm_increaseTime", [1000]);
    await idoContract.connect(accounts[0]).startIDO();

    await expect(idoContract.connect(accounts[0]).endIDO()).to.be.revertedWith(
      "IDO: Invalid request for change IDO state"
    );
  });

  it("should not claim ido before time", async function () {
    const { idoContract, accounts } = await loadFixture(deployTokenFixture);

    await ethers.provider.send("evm_increaseTime", [1000]);
    await idoContract.connect(accounts[0]).startIDO();

    await expect(
      idoContract.connect(accounts[0]).cliamableIDO()
    ).to.be.revertedWith("IDO: Invalid request for change IDO state");

    await ethers.provider.send("evm_increaseTime", [3000]);

    await expect(
      idoContract.connect(accounts[0]).cliamableIDO()
    ).to.be.revertedWith("IDO: IDO has not ended yet");

    await idoContract.connect(accounts[0]).endIDO();
    await idoContract.connect(accounts[0]).cliamableIDO();

    expect(await idoContract.idoState()).to.equal(2);
  });

  it("should complete ido", async function () {
    const { idoContract } = await loadFixture(deployTokenFixture);

    await ethers.provider.send("evm_increaseTime", [1000]);
    await idoContract.startIDO();

    await ethers.provider.send("evm_increaseTime", [3000]);
    await idoContract.endIDO();
    await idoContract.cliamableIDO();

    await ethers.provider.send("evm_increaseTime", [2000]);
    await idoContract.completeIDO();

    expect(await idoContract.idoState()).to.equal(5);
  });
});
