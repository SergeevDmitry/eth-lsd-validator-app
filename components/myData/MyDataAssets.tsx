import classNames from "classnames";
import { CustomButton } from "components/common/CustomButton";
import { DataLoading } from "components/common/DataLoading";
import { Icomoon } from "components/icon/Icomoon";
import { ClaimRewardModal } from "components/modal/ClaimRewardModal";
import { getLsdAppUrl } from "config/env";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useMyData } from "hooks/useMyData";
import Image from "next/image";
import { useMemo, useState } from "react";
import { withdrawValidatorEth } from "redux/reducers/ValidatorSlice";
import { RootState } from "redux/store";
import { openLink } from "utils/commonUtils";
import { getLsdTokenName, getTokenName } from "utils/configUtils";
import { getLsdTokenIcon } from "utils/iconUtils";
import { formatNumber } from "utils/numberUtils";

export const MyDataAssets = () => {
  const dispatch = useAppDispatch();
  const {
    selfDepositedToken,
    totalManagedToken,
    myRewardTokenAmount,
    availableExitDeposit,
    ipfsMyRewardInfo,
    myShareAmount,
    mySharePercentage
  } = useMyData();
  const [claimRewardModalVisible, setClaimRewardModalVisible] = useState(false);

  const withdrawLoading = useAppSelector((state: RootState) => state.validator.withdrawLoading);
  const claimRewardsLoading = useAppSelector((state: RootState) => state.validator.claimRewardsLoading);

  const showWithdraw = useMemo(() => {
    return Number(availableExitDeposit) > 0;
  }, [availableExitDeposit]);

  return (
    <div className="g-border-pink mt-[.24rem] rounded-[.3rem] overflow-auto">
      <div className="g-bg-box rounded-[.3rem] min-w-[800px]">
        <div
          className="h-[.7rem] grid items-center font-[500] border-solid border-b-[.01rem] border-white/10"
          style={{
            gridTemplateColumns: "20% 20% 20% 20% 20%"
          }}
        >
          <div className="flex items-center justify-center text-[.16rem] text-color-text2"></div>
          <div className="flex items-center justify-center text-[.16rem] text-[#8771e3] text-center">
            Self-deposited {getTokenName()}
          </div>
          <div className="flex items-center justify-center text-[.16rem] text-[#8771e3] text-center">
            Total Managed {getTokenName()}
          </div>
          <div className="flex items-center justify-center text-[.16rem] text-[#8771e3] text-center">
            My Reward {getTokenName()}
          </div>
          <div className="flex items-center justify-center text-[.16rem] text-[#8771e3] text-center">
            Slashed {getTokenName()}
          </div>
        </div>

        <div
          className={classNames("h-[.74rem] grid items-center")}
          style={{
            gridTemplateColumns: "20% 20% 20% 20% 20%"
          }}
        >
          <div className="flex items-center justify-center text-[.16rem] text-color-text1">
            <div
              className="cursor-pointer mx-[.24rem] flex-1 h-[.42rem] flex items-center justify-between rounded-[.6rem] border-[0.01rem] border-white/30"
              onClick={() => {
                openLink(getLsdAppUrl());
              }}
            >
              <div className="flex items-center">
                <div className="w-[.34rem] h-[.34rem] min-w-[.34rem] relative ml-[.04rem]">
                  <Image src={getLsdTokenIcon()} alt="logo" layout="fill" />
                </div>

                <div className="ml-[.08rem] text-[.16rem] text-color-text1">{getLsdTokenName()}</div>
              </div>

              <div className="mr-[.16rem] -rotate-90">
                <Icomoon icon="arrow-down" size=".1rem" color="white" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center text-[.16rem] text-color-text1">
            {selfDepositedToken === undefined ? (
              <DataLoading height=".16rem" />
            ) : (
              formatNumber(selfDepositedToken, { fixedDecimals: false })
            )}
          </div>
          <div className="flex items-center justify-center text-[.16rem] text-color-text1">
            {totalManagedToken === undefined ? (
              <DataLoading height=".16rem" />
            ) : (
              formatNumber(totalManagedToken, { fixedDecimals: false })
            )}
          </div>
          <div className="flex items-center justify-center text-[.16rem] text-color-text1">
            {myRewardTokenAmount === undefined ? (
              <DataLoading height=".16rem" />
            ) : (
              formatNumber(myRewardTokenAmount, { fixedDecimals: false })
            )}
          </div>
          <div className="flex items-center justify-center text-[.16rem] text-error">--</div>
        </div>

        <div className="py-[.32rem] flex px-[.4rem]">
          <div className="flex-1 mx-[.28rem]">
            <CustomButton
              type="small"
              loading={claimRewardsLoading}
              disabled={!myRewardTokenAmount || Number(myRewardTokenAmount) <= 0}
              onClick={() => {
                setClaimRewardModalVisible(true);
              }}
            >
              Claim Rewards
            </CustomButton>
          </div>

          <div className="flex-1 mx-[.28rem]">
            <CustomButton
              type={"primary"}
              onClick={() => {
                openLink("https://lsaas-docs.stafi.io/docs/developethlsd/validator.html");
              }}
            >
              Exit Staking
            </CustomButton>
          </div>

          {showWithdraw && (
            <div className="flex-1 mx-[.28rem]">
              <CustomButton
                loading={withdrawLoading}
                type="stroke"
                onClick={() => {
                  dispatch(
                    withdrawValidatorEth(
                      ipfsMyRewardInfo,
                      availableExitDeposit || "0",
                      myRewardTokenAmount || "0",
                      false
                    )
                  );
                }}
              >
                Withdraw
              </CustomButton>
            </div>
          )}
        </div>

        <ClaimRewardModal
          ipfsMyRewardInfo={ipfsMyRewardInfo}
          myRewardTokenAmount={myRewardTokenAmount}
          totalManagedAmount={totalManagedToken}
          myShareAmount={myShareAmount}
          mySharePercentage={mySharePercentage}
          visible={claimRewardModalVisible}
          onClose={() => {
            setClaimRewardModalVisible(false);
          }}
        />
      </div>
    </div>
  );
};
