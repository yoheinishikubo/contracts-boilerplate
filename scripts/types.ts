import { BigNumberish } from "ethers";

export type Constant = {
  etherScanHost: string;
};
export interface Constants {
  [index: string]: Constant;
}

export interface Transfer {
  id: BigNumberish;
  to: string;
  amount: BigNumberish;
}
export type Transfers = Transfer[];
