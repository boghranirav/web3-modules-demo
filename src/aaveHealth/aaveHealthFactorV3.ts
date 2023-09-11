import axios from "axios";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { v1 } from "@aave/protocol-js";
import { BigNumber } from "bignumber.js";
import { LendingPoolABIV3 } from "../config/abi/aave/LendingPoolABIV3";

export const aaveHealthInfuraV3 = async (
  address: string,
  usdPriceEth: BigNumber
) => {
  const web3 = new Web3(process.env.INFURA_LINK || "web3");
  const lpAddressProviderContract = new web3.eth.Contract(
    LendingPoolABIV3 as AbiItem[],
    "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"
  );

  const getPoolAddressesProviderDataResponse =
    await lpAddressProviderContract.methods.getUserAccountData(address).call();

  const healthF = v1.calculateHealthFactorFromBalances(
    getPoolAddressesProviderDataResponse.totalCollateralBase,
    getPoolAddressesProviderDataResponse.totalDebtBase,
    usdPriceEth,
    getPoolAddressesProviderDataResponse.currentLiquidationThreshold
  );

  let bignum = new BigNumber(healthF);
  console.log("Aave Health V3 using Infura", bignum.toNumber());
};
