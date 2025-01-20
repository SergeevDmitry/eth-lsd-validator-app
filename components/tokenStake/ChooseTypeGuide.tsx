import classNames from "classnames";
import { Icomoon } from "components/icon/Icomoon";
import { getValidatorTotalDepositAmount } from "config/env";
import { robotoBold } from "config/font";
import { useAppSlice } from "hooks/selector";
import { useSoloNodeDepositAmount } from "hooks/useSoloNodeDepositAmount";
import { getTokenName } from "utils/configUtils";
import { formatNumber } from "utils/numberUtils";

export const ChooseTypeGuide = () => {
  const { darkMode } = useAppSlice();

  const { soloNodeDepositAmount } = useSoloNodeDepositAmount();

  return (
    <div className="w-full">
      <a
        className="text-[.24rem] text-color-text1 inline-flex items-center"
        href="https://lsaas-docs.stafi.io/docs/developethlsd/validator.html"
        target="_blank"
        rel="noreferrer"
      >
        <div className="mr-[.16rem]">Guide</div>

        <Icomoon icon="right" color={"#fff"} size=".11rem" />
      </a>

      <div className="mt-[.12rem] rounded-[.16rem] g-bg-box border border-white/5 p-[.2rem] h-[3.67rem]">
        <div className={classNames("text-color-text2 text-[.16rem]", robotoBold.className)}>Nodes Comparison</div>

        <div className="text-color-text2 text-[.14rem] py-[.1rem] mt-[.16rem] leading-normal">
          {soloNodeDepositAmount && Number(soloNodeDepositAmount) > 0 && (
            <>
              Deposit{" "}
              <span className={robotoBold.className}>
                {formatNumber(soloNodeDepositAmount, { fixedDecimals: false })} {getTokenName()}
              </span>{" "}
              to register as a Solo validator on StaFi; StaFi will match{" "}
              <span className={robotoBold.className}>
                {formatNumber(getValidatorTotalDepositAmount() - Number(soloNodeDepositAmount), {
                  fixedDecimals: false
                })}{" "}
                {getTokenName()}
              </span>{" "}
              to your node so that it can meet the validator conditions of {getTokenName()}.
              <div className="mt-[.1rem]" />
            </>
          )}
          If you are a <span className={robotoBold.className}>trusted validator</span>, you don't need to deposit{" "}
          {getTokenName()} yourself.
        </div>
      </div>
    </div>
  );
};
