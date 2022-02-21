import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, assert } from "chai";
import { BigNumber, BigNumberish, Contract } from "ethers";
import { ethers, upgrades } from "hardhat";

import { Constant, Constants, Transfer, Transfers } from "../scripts/types";

describe("ERC1155Sample", async function () {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;
  let deployed: Contract;
  let transfers: Transfers;

  beforeEach(async function () {
    const accounts = await ethers.getSigners();
    [owner, addr1, addr2, addr3] = accounts;
    transfers = [addr1, addr2, addr3].map((signer, i) => {
      return {
        id: BigNumber.from(i),
        to: signer.address,
        amount: BigNumber.from(1),
      };
    });
    const args = [
      "ERC1155 Sample Token",
      "S1155",
      "https://raw.githubusercontent.com/yoheinishikubo/contracts-boilerplate/main/metadata/{id}.json",
    ];
    const ERC1155Sample = await ethers.getContractFactory("ERC1155Sample");

    const erc1155Sample = await upgrades.deployProxy(ERC1155Sample, args, {
      initializer: "__ERC1155Sample_init",
      kind: "uups",
    });

    deployed = await erc1155Sample.deployed();
    await Promise.all(
      // 20 tokens with 3 editions are minted.
      [...new Array(15)].map(async () => {
        const mintTx = await deployed.mint(owner.address, 3, 1000);
        const receipt = await mintTx.wait();
      })
    );
  });

  it("Shoud be minted properly.", async function () {
    expect(await deployed.balanceOf(owner.address, 0)).equals(3);
  });

  it("Should be transfered to recipients.", async function () {
    const transferTx = await deployed.transferToRecipients(0, transfers);
    const receiptOfTransferTx = await transferTx.wait();

    await Promise.all(
      transfers.map(async ({ id, to, amount }) => {
        expect(await deployed.balanceOf(to, 0)).equals(amount);
      })
    );
  });

  it("Should fail if the amount of token is not enough for transfers.", async function () {
    await deployed.burn(owner.address, 0, 1);
    deployed
      .transferToRecipients(0, transfers)
      .then(() => {
        assert.fail();
      })
      .catch(() => {});
  });

  it("Should the padded hexadecimal next id matches the value calculated with JS.", async function () {
    expect(await deployed.nextIdForFilename()).equals(
      (15).toString(16).padStart(64, "0")
    );
  });
});
