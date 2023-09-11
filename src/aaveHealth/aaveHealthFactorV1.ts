import axios from "axios";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { v1 } from "@aave/protocol-js";
import { BigNumber } from "bignumber.js";
import { LendingPoolABI } from "../config/abi/aave/LendingPoolABI";

export const aaveHealthV1 = async (
  address: string,
  usdPriceEth: BigNumber,
  lendingPoolAddress: string
) => {
  const poolReservesDataResponse = await poolReservesDataV1(lendingPoolAddress);
  const rawUserReservesResponse = await rawUserReservesV1(address);

  const response = v1.formatUserSummaryData(
    poolReservesDataResponse,
    rawUserReservesResponse,
    address,
    usdPriceEth,
    Math.floor(Date.now() / 1000)
  );
  console.log("Aave Health V1 using SubGraph", response.healthFactor);
};

export const aaveHealthInfuraV1 = async (
  address: string,
  usdPriceEth: BigNumber
) => {
  const web3 = new Web3(process.env.INFURA_LINK || "web3");
  const lpAddressProviderContract = new web3.eth.Contract(
    LendingPoolABI as AbiItem[],
    "0x398eC7346DcD622eDc5ae82352F02bE94C62d119"
  );

  const getUserAccountDataResponse = await lpAddressProviderContract.methods
    .getUserAccountData(address)
    .call();

  const healthF = v1.calculateHealthFactorFromBalances(
    getUserAccountDataResponse.totalCollateralETH,
    getUserAccountDataResponse.totalBorrowsETH,
    usdPriceEth,
    getUserAccountDataResponse.currentLiquidationThreshold
  );

  let bignum = new BigNumber(healthF);
  console.log("Aave Health V1 using Infura", bignum.toNumber());
};

export const overAllLoanTenure = async (address: string) => {
  const rawUserReservesInfoV1Response = await rawUserReservesInfoV1(address);
  for (let i = 0; i < rawUserReservesInfoV1Response.length; i++) {
    const currIndex = rawUserReservesInfoV1Response[i];
    console.log("====", currIndex.borrowHistory.length, "====");
    // for (
    //   let borrowHistoryIndex = 0;
    //   borrowHistoryIndex < currIndex.borrowHistory.length;
    //   borrowHistoryIndex++
    // ) {
    //   console.log(
    //     new Date(currIndex.borrowHistory[borrowHistoryIndex].timestamp * 1000)
    //   );
    // }
    // console.log(rawUserReservesInfoV1Response[i].repayHistory);
  }
};

const poolReservesDataV1 = async (lendingPoolAddress: string) => {
  const response = await axios.post(
    "https://api.thegraph.com/subgraphs/name/aave/protocol-multy-raw",
    {
      query: `query users($address : String!) {
            reserves(where:{pool:$address}){
                id
                underlyingAsset
                name
                symbol
                decimals
                isActive
                isFreezed
                usageAsCollateralEnabled
                borrowingEnabled
                stableBorrowRateEnabled
                baseLTVasCollateral
                optimalUtilisationRate
                stableRateSlope1
                stableRateSlope2
                averageStableBorrowRate
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
                totalBorrows
                totalBorrowsStable
                totalBorrowsVariable
                totalLiquidity
                utilizationRate
                lastUpdateTimestamp
                aToken{
                    id
                }
                price{
                    priceInEth
                }
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

const rawUserReservesV1 = async (address: string) => {
  const response = await axios.post(
    "https://api.thegraph.com/subgraphs/name/aave/protocol-multy-raw",
    {
      query: `query users($address : String!) {
            userReserves(where: { user: $address}) {
              id
              principalATokenBalance
              userBalanceIndex
              redirectedBalance
              interestRedirectionAddress
              usageAsCollateralEnabledOnUser
              borrowRate
              borrowRateMode
              originationFee
              principalBorrows
              variableBorrowIndex
              lastUpdateTimestamp
              reserve {
                  id
                  underlyingAsset
                  name
                  symbol
                  decimals
                  liquidityRate
                  reserveLiquidationBonus
                  lastUpdateTimestamp
                  aToken {
                      id
                  }
              }
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

const rawUserReservesInfoV1 = async (address: string) => {
  const response = await axios.post(
    "https://api.thegraph.com/subgraphs/name/aave/protocol-multy-raw",
    {
      query: `query users($address : String!) {
            reserves(where:{userReserves_:{user:$address}}) {
              id
              symbol
              borrowHistory(where:{user:$address}){
                timestamp
                amount
              }
              repayHistory(where:{user:$address}){
                timestamp
                amountAfterFee
              }
              liquidationCallHistory(where:{user:$address}){
              timestamp
              principalAmount
              collateralAmount
            }
          }
        }
            `,
      variables: {
        address: String(address),
      },
    }
  );

  return response.data.data.reserves;
};
