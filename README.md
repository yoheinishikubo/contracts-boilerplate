# Smart Contract Boilerplate for Publishers, Talent Agencies, and Others

This project demonstrates a Hardhat use case, developing, deploying, and operating NFT smart contracts for players like publishers, talent agencies, and others.
The following points are determined because of the characteristics of the businesses above.

1. No ERC721. ERC1155 only.
1. Rinkeby is picked as a testnet because top-tier marketplaces like OpenSea or Rarible have test versions with Rinkeby.
1. The contract can be easily upgraded with UUPS proxy because keeping credits with stable contact addresses is important for the businesses like above. However, the sample for upgrading is not included because it's rare for those contracts to be upgraded actually.
1. A method to transfer tokens to a bunch of recipients at once is added. The method records events on chain when transfers are completed. A serious team can fetch the log from chain and can verify with the internal business system.
1. The royalty from secondary sales is supported with ERC2981. Marketplaces like Rarible support this standard. In addition, the procedure to register the royalty with a custom smart contract without ERC2981 flavor to Rarible is introduced below in this document.

You can see samples on testnet with the following links.

https://rinkeby.etherscan.io/address/0x3c25b95a6d4c5ca30b307b4e1e6108197116924b#code
https://testnets.opensea.io/assets/0x3c25b95a6d4c5ca30b307b4e1e6108197116924b/0
https://rinkeby.rarible.com/token/0x3c25B95A6D4c5ca30b307b4e1E6108197116924B:0

# Development

## Prerequisite

1. Make a wallet with an application like MetaMask and note the private key of that. Never use your main wallet with valued assets.
1. Visit a faucet website for Rinkeby and get some ETH with the wallet.
1. Get an api key from [Etherscan](https://etherscan.io).
1. Get a Rinkeby url from [Alchemy](https://www.alchemy.com).
1. Set up a development environment for NodeJS.
1. Clone this repositry.
1. `yarn install` or `npm install` in the top directory of the cloned repository.

## Edit `.env` file

1. Copy the file named `.env.example` and rename it to `.env`.
1. Replace dummy strings with values you got in Prerequisite 1/3/4.

## Commands

| Action                          | Ethereum Rinkeby                                  | Ethereum Mainnet                  |
| :------------------------------ | :------------------------------------------------ | :-------------------------------- |
| compile                         | `yarn build` or `npm run build`                   | `yarn build` or `npm run build`   |
| clean                           | `yarn clean` or `npm run clean`                   | `yarn clean` or `npm run clean`   |
| test                            | `yarn test` or `npm run test`                     | `yarn test` or `npm run test`     |
| deploy                          | `yarn deploy:rinkeby` or `npm run deploy:rinkeby` | `yarn deploy` or `npm run deploy` |
| mint                            | `yarn mint:rinkeby` or `npm run mint:rinkeby`     | `yarn mint` or `npm run mint`     |
| get uri for the NFT minted next | `yarn uri:rinkeby` or `npm run uri:rinkeby`       | `yarn uri` or `npm run uri`       |

## Post Deploy

1. As you can find in the script `scripts/deploy.ts`, the verification on EtherScan is implemented in it and processed automatically. You can jump to the contract page on EtherScan with the link in the bottom of the command output.
1. It's better to expose the implementation contract in the proxy contract page. It's realized with the link `Is this a proxy?` in the pull down menu located in the right side of the proxy contract page on EtherScan.
1. Click the copy icon on the top of the page to copy the address of the contract.

## Before Minting NFTs

This contract is based on the implementation of OpenZeppelin. With the implementation, ERC1155 has one uri like the following for all tokens.

```
https://foo.bar/{id}.json
```

As the specification, `{id}` will be substituted with the hexadecimaled 64 digit value of the tokenId.
The hexadecimaled value can be calculated like the following for instance in JavaScript.

```javascript
(10000000).toString(16).padStart(64, "0");
// "0000000000000000000000000000000000000000000000000000000000989680"
```

For making it simple, this contract helps you to get the tokenId with this format.
You can get the uri needed for a NFT minted next with the following command.

| Action                          | Ethereum Rinkeby                            | Ethereum Mainnet            |
| :------------------------------ | :------------------------------------------ | :-------------------------- |
| get uri for the NFT minted next | `yarn uri:rinkeby` or `npm run uri:rinkeby` | `yarn uri` or `npm run uri` |

It's better to deploy metadata into the uri shown by this command before the next NFT minted.

## Scripts

### `scripts/deploy.ts`

A script for the deployment called with `yarn deploy`. You should modify some values like NFT name or symbol. EtherScan verification is included in this script. Follow the message of the command when the verification fails.

### `scripts/mint.ts`

A script called with `yarn mint` for minting a NFT, transferring it to a bunch of recipients at once, and tracking logs on chain to verify transfers. You should modify this first to meet your requirements.


# Define Royalties

## OpenSea

A NFT needs a royalty setting in OpenSea. The instruction is skipped because that this procedure is mentioned in many websites.
The url of testnet version of OpenSea is `https://testnets.opensea.io`.

## Rarible

 **Actually, the following procedure is not needed for the contract of this repository.**

The url of Rinkeby version of Rarible is `https://rinkeby.rarible.com`. 

|      Chain       | Address                                                                                            |
| :--------------: | :------------------------------------------------------------------------------------------------- |
| Ethereum Rinkeby | https://rinkeby.etherscan.io/address/0xdA8e7D4cF7BA4D5912a68c1e40d3D89828fA6EE8#writeProxyContract |
| Ethereum Mainnet | https://etherscan.io/address/0xEa90CFad1b8e030B8Fd3E63D22074E0AEb8E0DCD#writeProxyContract         |

1. Go to the contract page with the link above using a browser connected to the wallet used for minting.
2. You can find the procedure in [Setting Up Royalties on an External Collection](https://github.com/rarible/protocol-documentation/blob/master/asset/royalties-on-a-external-collection.md). The value of `collection address` in the document means the value of `proxy address` in this document.

# Notes

1. `.openzeppelin` folder is added in `.gitignore`. However, it's better to remove the line from `.gitignore` to keep this because this file contains important information like deploy logs.
