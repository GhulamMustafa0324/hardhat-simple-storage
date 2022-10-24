// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, run, network } = require("hardhat");

async function main() {
  const simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("deploying contract...");
  const simpleStorage = await simpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log(simpleStorage.address);
  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    console.log(`waiting for block txes`)
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.address, []);
  }
  const currentValue = await simpleStorage.retrieve();
  console.log(`Current value is ${currentValue}`);

  //updating current value
  const transactionResponse = await simpleStorage.store(69);
  await transactionResponse.wait(1);
  const updateValue = await simpleStorage.retrieve();
  console.log(`updated value is ${updateValue}`);
}

async function verify(contractAddress, args) {
  console.log("verifying contract....");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(e);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
