const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

describe("ERC721Token", function () {
  async function deployTokenFixture() {
    const accounts = await ethers.getSigners();

    const Erc721Token = await ethers.getContractFactory("Erc721Token");
    const erc721Token = await Erc721Token.deploy();
    await erc721Token.deployed();

    return {
      erc721Token,
      accounts,
    };
  }

  it("should deploy an erc721 token contract", async function () {
    const { erc721Token } = await loadFixture(deployTokenFixture);

    expect(await erc721Token.name()).to.equal("ERC721");

    await expect(erc721Token.tokenURI(1)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
  });

  it("should mint token", async function () {
    const { erc721Token, accounts } = await loadFixture(deployTokenFixture);

    await erc721Token.safeMint(
      accounts[0].address,
      "ipfs://Qmbso1A8KC6Q63hMzXQuQAfXTBuGQ8FjkSe3qgczCDewdq"
    );

    expect(await erc721Token.tokenURI(0)).to.equal(
      "ipfs://Qmbso1A8KC6Q63hMzXQuQAfXTBuGQ8FjkSe3qgczCDewdq"
    );
  });
});
