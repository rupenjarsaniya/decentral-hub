const hre = require("hardhat");

async function main() {
  const totalSupply = 100000;
  // {
  //   const tokenFactory = await hre.ethers.deployContract("tokenFactory");
  //   await tokenFactory.deployed();
  //   console.log(
  //     `Token factory contract deployed to => ${tokenFactory.address}`
  //   );
  // }
  // {
  //   const memeToken = await hre.ethers.deployContract("memeToken", [
  //     totalSupply,
  //   ]);
  //   await memeToken.deployed();
  //   console.log(`Meme token contract deployed to => ${memeToken.address}`);
  // }
  // {
  //   const IDOFactory = await hre.ethers.deployContract("IDOFactory");
  //   await IDOFactory.deployed();
  //   console.log(`IDO factory contract deployed to => ${IDOFactory.address}`);
  // }
  {
    const StakingFactory = await hre.ethers.deployContract("StakingFactory");
    await StakingFactory.deployed();
    console.log(
      `StakingFactory contract deployed to => ${StakingFactory.address}`
    );
  }
  {
    const Erc721Token = await hre.ethers.deployContract("Erc721Token");
    await Erc721Token.deployed();
    console.log(`Erc721 Token contract deployed to => ${Erc721Token.address}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Token factory contract deployed to => 0x3509AD16122B0483C15Cc4E8677EAC3D8CfD6DEb
// Meme token contract deployed to => 0xF847aDaa604e01F04d7697845B228e6E080707b5
// IDO factory contract deployed to => 0xd9e8050B33282ee89897Ab0Bb59343c925eAc8b1
