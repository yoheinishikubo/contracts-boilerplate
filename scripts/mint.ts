// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract, ContractReceipt } from "@ethersproject/contracts";
import { ethers } from "hardhat";

import { Transfers } from "./types";

import { constants } from "./constants";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [signer] = await ethers.getSigners();

  // TODO change this to the creator address.
  const creatorAddress = signer.address;
  const amount = 1000;
  const royalty = 1000; // means 10%

  // TODO change this to the transfers you want.
  const recipients = [
    "0x21f7b536391B2f4BB2C6d668D84B0de63d3C86B0",
    "0xa7199Ae438Ce3CD8e4E4F1C49A6279402ac43943",
    "0x7A990521d7597c09448aB64483273AaEB1596ee6",
    "0xc7d701D42856317ca2FB3e328572E522Bc2c7931",
    "0x9A562e1Aa9534f5F199ceEdbCffED41952638358",
    "0xeeA123A7A75764235eD640c7b8688057B0654D82",
    "0x34CF1d679E071b95bD8D7c1A845d38d4a2a45932",
    "0x25fb8230113fF7AE95220b060abEbCf3EDAa2c6D",
    "0xA03251eE41c0f64A0C915A56aE2d36818b104B79",
    "0x57eD4ea7C6d122AAb0c3EB84C96390807eF353D7",
  ];

  const transfers: Transfers = await Promise.all(
    recipients.map(async (to, i) => {
      // `id` means transfer id defined by your system.
      return {
        id: BigNumber.from(i),
        to,
        amount: BigNumber.from(10),
      };
    })
  );

  const { name: networkName } = await ethers.provider.getNetwork();
  const { etherScanHost } = constants[networkName];

  let proxyAddress: string = "";
  try {
    const { proxies } = require(`../.openzeppelin/${networkName}.json`);
    const { address: existingAddress } = proxies[proxies.length - 1];
    proxyAddress = existingAddress;
  } catch (e) {}

  const ERC1155Sample = await ethers.getContractFactory("ERC1155Sample");
  const deployed: Contract = await ERC1155Sample.attach(proxyAddress);
  const mintTx: TransactionResponse = await deployed.mint(
    creatorAddress,
    amount,
    royalty
  );
  const { hash: transactionHash } = mintTx;
  console.log(
    `You can check the mint transaction at https://${etherScanHost}/tx/${transactionHash}`
  );
  const receipt: ContractReceipt = await mintTx.wait();

  let tokenId: number | undefined;
  if (receipt.events) {
    [tokenId] = receipt.events
      .filter(({ event }) => event === "TransferSingle")
      .map(({ args = [] }) => {
        const tokenIdBN: BigNumber = args[3];
        return tokenIdBN.toNumber();
      });
  }

  console.log(`Minted tokenId: ${tokenId}`);

  if (tokenId !== undefined) {
    const transferTx: TransactionResponse = await deployed.transferToRecipients(
      tokenId,
      transfers
    );
    console.log(
      `You can check the transfer transaction at https://${etherScanHost}/tx/${transferTx.hash}`
    );
    const transferReceipt: ContractReceipt = await transferTx.wait();
    if (transferReceipt.events !== undefined) {
      // TODO transfered logs can be used for verifications.
      const transfered = transferReceipt.events
        .filter(({ event }) => event === "TransferedToRecipient")
        .map(({ args = [] }) => {
          const tokenIdBN: BigNumber = args[0];
          const transferIdBN: BigNumber = args[1];
          const recipientAddress = args[2];
          const amountBN: BigNumber = args[3];
          return {
            tokenId: tokenIdBN.toNumber(),
            transferId: transferIdBN.toNumber(),
            recipientAddress,
            amount: amountBN.toNumber(),
          };
        });
      console.log(transfered);
    }
  }

  console.log("done!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
