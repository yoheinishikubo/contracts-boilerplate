// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { Contract } from "@ethersproject/contracts";
import hre, { ethers, upgrades } from "hardhat";

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
    const history = require(`../.openzeppelin/${networkName}.json`);
    const {
      proxies: [{ address: existingAddress }],
    } = history;
    proxyAddress = existingAddress;
  } catch (e) {}

  const args = ["W80 Token", "W80"];
  const W80Token = await ethers.getContractFactory("W80Token");

  let w80Token: Contract;
  // if (proxyAddress === "") {
  w80Token = await upgrades.deployProxy(W80Token, args, {
    initializer: "__W80Token_init",
    kind: "uups",
  });
  // } else {
  //   w80Token = await upgrades.upgradeProxy(proxyAddress, W80Token);
  // }

  const deployed = await w80Token.deployed();
  await new Promise((resolve) => setTimeout(resolve, 30000));

  const implAddress = await upgrades.erc1967.getImplementationAddress(
    deployed.address
  );

  await hre
    .run("verify:verify", {
      address: implAddress,
    })
    .catch((err) => {
      // console.log(err);
      console.log(
        "The verification was failed. It has already been verified or some issues are there."
      );
    });

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
    `The contract code can be shown on https://rinkeby.etherscan.io/address/${deployed.address}#code`
  );

  // // We get the contract to deploy
  // const args = ["Hello, Hardhat!"];
  // const Greeter = await ethers.getContractFactory("Greeter");
  // const greeter = await Greeter.deploy(args[0]);
  // await greeter.deployed();
  // await new Promise((resolve) => setTimeout(resolve, 30000));
  // await hre
  //   .run("verify:verify", {
  //     address: greeter.address,
  //     constructorArguments: args,
  //   })
  //   .catch(() => {
  //     console.log(
  //       "The verification was failed. It has already been verified or some issues are there."
  //     );
  //   });
  // console.log(
  //   `The contract code can be shown on https://rinkeby.etherscan.io/address/${greeter.address}#code`
  // );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
