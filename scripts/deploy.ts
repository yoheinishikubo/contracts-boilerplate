// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre, { ethers, upgrades } from "hardhat";

import { constants } from "./constants";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const { name: networkName } = await ethers.provider.getNetwork();

  const { etherScanHost } = constants[networkName];

  // TODO: Name, symbol, and uri should be changed for your own contract.
  const args = [
    "ERC1155 Sample NFT",
    "S1155",
    "https://dummy-metadata.appspot.com/{id}.json",
  ];
  const ERC1155Sample = await ethers.getContractFactory("ERC1155Sample");

  const erc1155Sample = await upgrades.deployProxy(ERC1155Sample, args, {
    initializer: "__ERC1155Sample_init",
    kind: "uups",
  });

  const deployed = await erc1155Sample.deployed();

  const implAddress = await upgrades.erc1967.getImplementationAddress(
    deployed.address
  );

  console.log(
    `The implementation contract code can be shown on https://${etherScanHost}/address/${implAddress}#code`
  );

  await new Promise((resolve) => setTimeout(resolve, 30000));

  const maxErrors = 5;
  let errors = [];

  // https://github.com/OpenZeppelin/openzeppelin-upgrades/blob/master/packages/core/scripts/verify.js

  const verifyImpl = async (address: any, constructorArguments: any) => {
    while (errors.length < maxErrors) {
      try {
        await hre.run("verify:verify", {
          address,
          constructorArguments,
        });
        break;
      } catch (e: any) {
        if (e.message.includes("Contract source code already verified")) {
          break;
        } else {
          errors.push(e);
        }
      }
      console.log("contract not yet deployed. waiting...");
      await new Promise((resolve) => setTimeout(resolve, 8000));
    }

    if (errors.length === maxErrors) {
      console.log(
        `The verification was failed. It has already been verified or some issues are there.
        https://${etherScanHost}/address/${implAddress}#code
        Try the following command.
        npx hardhat verify --network ${networkName} ${implAddress}`
      );
    }
  };

  await verifyImpl(implAddress, "");

  errors = [];

  await hre
    .run("verify:verify", {
      address: deployed.address,
      constructorArguments: args,
    })
    .catch(() => {
      console.log(
        "The verification was failed. It has already been verified or some issues are there."
      );
    });

  console.log(
    `The proxy contract code can be shown on https://${etherScanHost}/address/${deployed.address}#code`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
