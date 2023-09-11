import axios from "axios";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { v1, v2 } from "@aave/protocol-js";
import { BigNumber } from "bignumber.js";
import { LendingPoolABIV2 } from "../config/abi/aave/LendingPoolABIV2";

export const aaveHealthInfuraV2 = async (
  address: string,
  usdPriceEth: BigNumber
) => {
  const web3 = new Web3(process.env.INFURA_LINK || "web3");
  const lpAddressProviderContract = new web3.eth.Contract(
    LendingPoolABIV2 as AbiItem[],
    "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"
  );
  const getUserAccountDataResponse = await lpAddressProviderContract.methods
    .getUserAccountData(address)
    .call();

  const healthF = v1.calculateHealthFactorFromBalances(
    getUserAccountDataResponse.totalCollateralETH,
    getUserAccountDataResponse.totalDebtETH,
    usdPriceEth,
    getUserAccountDataResponse.currentLiquidationThreshold
  );

  // console.log(healthF);

  let bignum = new BigNumber(healthF);
  console.log("Aave Health V2 using Infura", bignum.toNumber());
};

export const aaveHealthV2 = async (
  address: string,
  usdPriceEth: BigNumber,
  lendingPoolAddress: string
) => {
  const poolReservesDataResponse = await poolReservesDataV2(lendingPoolAddress);
  const rawUserReservesResponse = await rawUserReservesV2(address);

  const response = v2.formatUserSummaryData(
    poolReservesDataResponse,
    rawUserReservesResponse,
    address,
    usdPriceEth,
    Math.floor(Date.now() / 1000),
    {
      rewardTokenPriceEth: usdPriceEth.toString(),
      rewardTokenAddress: address,
      rewardTokenDecimals: 18,
      incentivePrecision: 1,
      emissionEndTimestamp: 1653238828,
    }
  );
  console.log("Aave Health V2 using SubGraph", response.healthFactor);
};

const poolReservesDataV2 = async (lendingPoolAddress: string) => {
  const response = await axios.post(
    "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
    {
      query: `query users($address : String!) {
            reserves(where:{pool:$address}){
                id
                underlyingAsset
                name
                symbol
                decimals
                isActive
                isFrozen
                usageAsCollateralEnabled
                borrowingEnabled
                stableBorrowRateEnabled
                reserveFactor
                baseLTVasCollateral
                optimalUtilisationRate
                stableRateSlope1
                stableRateSlope2
                averageStableRate
                stableDebtLastUpdateTimestamp
                baseVariableBorrowRate
                variableRateSlope1
                variableRateSlope2
                liquidityIndex
                reserveLiquidationThreshold
                reserveLiquidationBonus
                variableBorrowIndex
                variableBorrowRate
                availableLiquidity
                stableBorrowRate
                liquidityRate
                totalPrincipalStableDebt
                totalScaledVariableDebt
                lastUpdateTimestamp
                price {
                    priceInEth
                }
                aEmissionPerSecond
                vEmissionPerSecond
                sEmissionPerSecond
                aIncentivesLastUpdateTimestamp
                vIncentivesLastUpdateTimestamp
                sIncentivesLastUpdateTimestamp
                aTokenIncentivesIndex
                vTokenIncentivesIndex
                sTokenIncentivesIndex
              }
          }
            `,
      variables: {
        address: String(lendingPoolAddress),
      },
    }
  );

  return response.data.data.reserves;
};

const rawUserReservesV2 = async (address: string) => {
  const response = await axios.post(
    "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
    {
      query: `query users($address : String!) {
            userReserves(where: { user: $address}) {
              scaledATokenBalance
              usageAsCollateralEnabledOnUser
              scaledVariableDebt
              variableBorrowIndex
              stableBorrowRate
              principalStableDebt
              stableBorrowLastUpdateTimestamp
              reserve{
                  id
                  underlyingAsset
                  name
                  symbol
                  decimals
                  reserveLiquidationBonus
                  lastUpdateTimestamp
              }
              aTokenincentivesUserIndex
              vTokenincentivesUserIndex
              sTokenincentivesUserIndex
            }
          }
            `,
      variables: {
        address: String(address),
      },
    }
  );

  return response.data.data.userReserves;
};
