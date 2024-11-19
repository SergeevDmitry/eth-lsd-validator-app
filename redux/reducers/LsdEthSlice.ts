import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "redux/store";
import {
  decodeBalancesUpdatedLog,
  getErc20AssetBalance,
  getEthWeb3,
} from "utils/web3Utils";
import {
  getLsdEthTokenContract,
  getNetworkBalanceContract,
} from "config/contract";
import { getDefaultApr } from "utils/configUtils";
import {
  getLsdEthTokenContractAbi,
  getNetworkBalanceContractAbi,
} from "config/contractAbi";

export interface LsdEthState {
  balance: string | undefined; // balance of lsdETH
  rate: string | undefined; // rate of lsdETH to ETH
  apr: number | undefined; // lsdETH apr
  price: string | undefined; // price of lsdETH
}

const initialState: LsdEthState = {
  balance: undefined,
  rate: undefined,
  apr: undefined,
  price: undefined,
};

export const lsdEthSlice = createSlice({
  name: "lsdEth",
  initialState,
  reducers: {
    setBalance: (
      state: LsdEthState,
      action: PayloadAction<string | undefined>
    ) => {
      state.balance = action.payload;
    },
    setRate: (state: LsdEthState, action: PayloadAction<string>) => {
      state.rate = action.payload;
    },
    setPrice: (state: LsdEthState, action: PayloadAction<string>) => {
      state.price = action.payload;
    },
    setApr: (state: LsdEthState, action: PayloadAction<number>) => {
      state.apr = action.payload;
    },
  },
});

export const { setBalance, setRate, setPrice, setApr } = lsdEthSlice.actions;

export default lsdEthSlice.reducer;

export const clearLsdEthBalance =
  (): AppThunk => async (dispatch, getState) => {
    dispatch(setBalance(undefined));
  };

/**
 * update lsdEth balance
 */
export const updateLsdEthBalance =
  (): AppThunk => async (dispatch, getState) => {
    try {
      const metaMaskAccount = getState().wallet.metaMaskDisconnected
        ? undefined
        : getState().wallet.metaMaskAccount;

      const tokenAbi = getLsdEthTokenContractAbi();
      const tokenAddress = getLsdEthTokenContract();
      const newBalance = await getErc20AssetBalance(
        metaMaskAccount,
        tokenAbi,
        tokenAddress
      );
      dispatch(setBalance(newBalance));
    } catch (err: unknown) {}
  };

/**
 * query lsdETH to ETH's rate
 */
export const updateLsdEthRate = (): AppThunk => async (dispatch, getState) => {
  try {
    let newRate = "--";

    const web3 = getEthWeb3();
    let contract = new web3.eth.Contract(
      getLsdEthTokenContractAbi(),
      getLsdEthTokenContract()
    );
    const result = await contract.methods.getRate().call();
    newRate = web3.utils.fromWei(result + "", "ether");

    dispatch(setRate(newRate));
  } catch (err: unknown) {}
};

/**
 * query apr of lsd ETH
 */
export const updateApr = (): AppThunk => async (dispatch, getState) => {
  let apr = getDefaultApr();
  try {
    const web3 = getEthWeb3();
    const currentBlock = await web3.eth.getBlockNumber();
    const contract = new web3.eth.Contract(
      getNetworkBalanceContractAbi(),
      getNetworkBalanceContract()
    );
    const topics = web3.utils.sha3(
      "BalancesUpdated(uint256,uint256,uint256,uint256)"
    );
    let fromBlock = currentBlock - Math.floor((1 / 15) * 60 * 60 * 24)
    if (fromBlock < 0) {
      fromBlock = 0
    }
    const events = await contract.getPastEvents("allEvents", {
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: `0x${currentBlock.toString(16)}`,
    });
    let apr = getDefaultApr();
    const balancesUpdatedEvents = events
      .filter((e) => e.raw.topics.length === 1 && e.raw.topics[0] === topics)
      .sort((a, b) => a.blockNumber - b.blockNumber);
    if (balancesUpdatedEvents.length > 1) {
      const beginEvent = balancesUpdatedEvents[0];
      const endEvent = balancesUpdatedEvents[balancesUpdatedEvents.length - 1];
      const beginValues: any = decodeBalancesUpdatedLog(
        beginEvent.raw.data,
        beginEvent.raw.topics
      );
      const endValues: any = decodeBalancesUpdatedLog(
        endEvent.raw.data,
        endEvent.raw.topics
      );
      const beginRate = beginValues.totalEth / beginValues.lsdTokenSupply;
      const endRate = endValues.totalEth / endValues.lsdTokenSupply;
      if (
        !isNaN(beginRate) &&
        isNaN(endRate) &&
        endRate !== 1 &&
        beginRate !== 1
      ) {
        apr = ((endRate - beginRate) / 7) * 365.25 * 100;
      }
    }
    dispatch(setApr(apr));
  } catch (err: any) {
    dispatch(setApr(apr));
  }
};
