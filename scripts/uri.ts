// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const { name: networkName } = await ethers.provider.getNetwork();

  let proxyAddress: string = "";
  try {
    const { proxies } = require(`../.openzeppelin/${networkName}.json`);
    const { address: existingAddress } = proxies[proxies.length - 1];
    proxyAddress = existingAddress;
  } catch (e) {}

  const ERC1155Sample = await ethers.getContractFactory("ERC1155Sample");
  const deployed = await ERC1155Sample.attach(proxyAddress);

  // any tokenId returns the same uri.
  const uriBase = await deployed.uri(0);
  const paddedTokenId = await deployed.nextIdForFilename();
  const uri = uriBase.replace("{id}", paddedTokenId);
  console.log(uri);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
