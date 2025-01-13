import {
  getLsdEthTokenContract,
  getNetworkWithdrawContract,
  getNodeDepositContract,
} from "config/contract";
import { useCallback, useEffect, useMemo, useState } from "react";
import chunk from 'lodash/chunk'
import { getEthWeb3 } from "utils/web3Utils";
import { useWalletAccount } from "./useWalletAccount";
import Web3 from "web3";
import {
  ChainPubkeyStatus,
  IpfsRewardItem,
  RewardJsonResponse,
} from "interfaces/common";
import { useAppSlice } from "./selector";
import {
  getNetworkWithdrawContractAbi,
  getNodeDepositContractAbi,
} from "config/contractAbi";
import { useUserPubkeys } from "./useUserPubkeys";
import { getEthereumChainId, getValidatorTotalDepositAmount } from "config/env";
import { formatScientificNumber, removeDecimals } from "utils/numberUtils";
import { fetchPubkeyStatus } from "utils/apiUtils";
import { isPubkeyStillValid } from "utils/commonUtils";

export function useMyData() {
  const { updateFlag } = useAppSlice();
  const { metaMaskAccount } = useWalletAccount();

  const [selfDepositedToken, setSelfDepositedToken] = useState<string>();
  // const [totalManagedToken, setTotalManagedToken] = useState<string>();
  const [myRewardTokenAmount, setMyRewardTokenAmount] = useState<string>();
  const [ipfsMyRewardInfo, setIpfsMyRewardInfo] = useState<IpfsRewardItem>();
  const [availableExitDeposit, setAvailableExitDeposit] = useState<string>();
  const [pubkeysOfNode, setPubkeysOfNode] = useState<string[]>([]);
  const [myShareAmount, setMyShareAmount] = useState<string>();
  const [mySharePercentage, setMySharePercentage] = useState<string>();

  const { nodePubkeys } = useUserPubkeys();

  const totalManagedToken = useMemo(() => {
    if (!nodePubkeys) {
      return undefined;
    }

    let totalManagedToken = 0;
    nodePubkeys.forEach((item) => {
      if (
        item._status === ChainPubkeyStatus.Staked &&
        isPubkeyStillValid(item.beaconApiStatus)
      ) {
        totalManagedToken += getValidatorTotalDepositAmount();
      }
    });

    return totalManagedToken + "";
  }, [nodePubkeys]);

  const updateData = useCallback(async () => {
    if (!metaMaskAccount) {
      setSelfDepositedToken("--");
      setMyRewardTokenAmount("--");
      return;
    }

    const userAddress = metaMaskAccount;

    try {
      const web3 = getEthWeb3();
      const networkWithdrawContract = new web3.eth.Contract(
        getNetworkWithdrawContractAbi(),
        getNetworkWithdrawContract(),
        {
          from: userAddress,
        }
      );

      const nodeRewardsFileCid = await networkWithdrawContract.methods
        .nodeRewardsFileCid()
        .call()
        .catch((err: any) => {
          console.log({ err });
        });
      const latestMerkleRootEpoch = await networkWithdrawContract.methods
        .latestMerkleRootEpoch()
        .call()
        .catch((err: any) => {
          console.log({ err });
        });
      const totalClaimedRewardOfNode = await networkWithdrawContract.methods
        .totalClaimedRewardOfNode(userAddress)
        .call()
        .catch((err: any) => {
          console.log({ err });
        });
      const totalClaimedDepositOfNode = await networkWithdrawContract.methods
        .totalClaimedDepositOfNode(userAddress)
        .call()
        .catch((err: any) => {
          console.log({ err });
        });

      const response = await fetch(
        `https://${nodeRewardsFileCid}.ipfs.dweb.link/${getLsdEthTokenContract().toLowerCase()}-rewards-${getEthereumChainId()}-${latestMerkleRootEpoch}.json`,
        {
          method: "GET",
          headers: {},
        }
      );
      const resText = await response.text();
      var JSONbig = require("json-bigint");
      const resTextJson = JSONbig.parse(resText);

      const list: IpfsRewardItem[] = resTextJson.List?.map((item: any) => {
        return {
          ...item,
          totalRewardAmount: removeDecimals(item.totalRewardAmount.toFixed()),
          totalDepositAmount: removeDecimals(item.totalDepositAmount.toFixed()),
          totalExitDepositAmount: removeDecimals(
            item.totalExitDepositAmount.toFixed()
          ),
        };
      });

      const myRewardInfo = list?.find((item) => item.address === userAddress);
      setIpfsMyRewardInfo(myRewardInfo);

      const myTotalRewardAmount = myRewardInfo?.totalRewardAmount || "0";

      const availableExitDeposit = !myRewardInfo
        ? 0
        : Math.max(
            0,
            Number(myRewardInfo?.totalExitDepositAmount) -
              Number(totalClaimedDepositOfNode)
          );

      setAvailableExitDeposit(
        Web3.utils.fromWei(formatScientificNumber(availableExitDeposit))
      );

      const nodeDepositContract = new web3.eth.Contract(
        getNodeDepositContractAbi(),
        getNodeDepositContract(),
        {
          from: userAddress,
        }
      );

      const pubkeysOfNode = await nodeDepositContract.methods
        .getPubkeysOfNode(userAddress)
        .call()
        .catch((err: any) => {
          console.log({ err });
        });
      setPubkeysOfNode(pubkeysOfNode);

      const myRewardEth = Web3.utils.fromWei(
        formatScientificNumber(
          Number(myTotalRewardAmount) - Number(totalClaimedRewardOfNode)
        ) + ""
      );

      setMyRewardTokenAmount(myRewardEth);
    } catch (err: any) {
      console.log({ err });
    }
  }, [metaMaskAccount]);

  useEffect(() => {
    updateData();
  }, [updateData, updateFlag]);

  const updateNodeData = useCallback(async () => {
    try {
      if (!metaMaskAccount) {
        return;
      }
      const userAddress = metaMaskAccount;

      const web3 = getEthWeb3();
      const nodeDepositContract = new web3.eth.Contract(
        getNodeDepositContractAbi(),
        getNodeDepositContract(),
        {}
      );
      const networkWithdrawContract = new web3.eth.Contract(
        getNetworkWithdrawContractAbi(),
        getNetworkWithdrawContract(),
        {}
      );

      const requests = pubkeysOfNode.map((pubkeyAddress) => {
        return (async () => {
          const pubkeyInfo = await nodeDepositContract.methods
            .pubkeyInfoOf(pubkeyAddress)
            .call()
            .catch((err: any) => {
              console.log({ err });
            });

          return pubkeyInfo;
        })();
      });

      const pubekyInfos = await Promise.all(requests);
      let myShareAmount = 0;
      let selfDepositAmount = 0;

      let totalNodeDepositAmount = 0;

      const beaconStatusResJson = await Promise.all(chunk(pubkeysOfNode, 50).map(pubkeys => fetchPubkeyStatus(pubkeys.join(','))))
        .then(results => 
          results.reduce((r, cur) => ({
            execution_optimistic: cur.execution_optimistic,
            finalized: cur.finalized,
            data: [...(r.data || []), ...cur.data],
          }), {})
        )

      pubekyInfos.forEach((pubkeyInfo, index) => {
        const matchedBeaconData = beaconStatusResJson.data?.find(
          (item: any) => item.validator?.pubkey === pubkeysOfNode[index]
        );

        if (isPubkeyStillValid(matchedBeaconData.status)) {
          totalNodeDepositAmount += Number(pubkeyInfo._nodeDepositAmount);
          myShareAmount += Number(pubkeyInfo._nodeDepositAmount);
        }
      });

      myShareAmount = Math.max(
        0,
        myShareAmount -
          (ipfsMyRewardInfo ? ipfsMyRewardInfo?.totalExitDepositAmount : 0)
      );

      const totalClaimedDepositOfNode = await networkWithdrawContract.methods
        .totalClaimedDepositOfNode(userAddress)
        .call()
        .catch((err: any) => {
          console.log({ err });
        });
      // console.log({ totalNodeDepositAmount });
      // console.log({ totalClaimedDepositOfNode });

      selfDepositAmount = Math.max(0, totalNodeDepositAmount);
      setMyShareAmount(
        Web3.utils.fromWei(formatScientificNumber(myShareAmount))
      );

      setMySharePercentage(
        Number(Web3.utils.fromWei(formatScientificNumber(myShareAmount))) /
          Number(totalManagedToken) +
          ""
      );

      setSelfDepositedToken(
        Web3.utils.fromWei(formatScientificNumber(selfDepositAmount) + "")
      );
    } catch (err: any) {
      console.log({ err });
    }
  }, [pubkeysOfNode, ipfsMyRewardInfo, totalManagedToken, metaMaskAccount]);

  useEffect(() => {
    updateNodeData();
  }, [updateNodeData, updateFlag]);

  return {
    selfDepositedToken,
    totalManagedToken,
    myRewardTokenAmount,
    ipfsMyRewardInfo,
    availableExitDeposit,
    myShareAmount,
    mySharePercentage,
  };
}
