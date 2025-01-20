import classNames from "classnames";
import { CustomPagination } from "components/common/CustomPagination";
import { EmptyContent } from "components/common/EmptyContent";
import { Icomoon } from "components/icon/Icomoon";
import { robotoBold, robotoSemiBold } from "config/font";
import { useAppSlice } from "hooks/selector";
import { useWalletAccount } from "hooks/useWalletAccount";
import { useState } from "react";
import { openLink } from "utils/commonUtils";
import { getDocLinks, getTokenName } from "utils/configUtils";

export const ValidatorEjection = () => {
  const { darkMode } = useAppSlice();
  const { metaMaskAccount } = useWalletAccount();
  const [page, setPage] = useState(1);

  return (
    <div>
      <div className="mt-[.48rem] flex items-center flex-wrap gap-[.16rem]">
        <div className={classNames(robotoBold.className, "text-[.24rem] text-color-text1")}>Node Election</div>

        <div
          className={classNames("items-center cursor-pointer", getDocLinks().ejectionMechanism ? "flex" : "hidden")}
          onClick={() => {
            openLink(getDocLinks().ejectionMechanism);
          }}
        >
          <div className="text-color-text2 text-[.16rem]">StaFi Ejection Mechanism</div>

          <div className="ml-[.06rem] flex items-center">
            <Icomoon icon="right" size=".1rem" color={"#6c6f77"} />
          </div>
        </div>
      </div>

      <div className="g-border-pink mt-[.24rem] rounded-[.3rem] overflow-auto">
        <div className="g-bg-box rounded-[.3rem] min-w-[800px]">
          <div
            className="h-[.7rem] grid items-center font-[500] border-solid border-b-[.01rem] border-white/10"
            style={{
              gridTemplateColumns: "25% 25% 25% 25%"
            }}
          >
            <div className="flex items-center justify-center text-[.16rem] text-[#8771e3]">Address</div>

            <div className="flex items-center justify-center text-[.16rem] text-[#8771e3]">Chosen Time (UTC)</div>

            <div className="flex items-center justify-center text-[.16rem] text-[#8771e3]">
              {getTokenName()} Rewarded
            </div>

            <div className="flex items-center justify-center text-[.16rem] text-[#8771e3]">Details</div>
          </div>

          <div className="h-[2rem] flex items-center justify-center">
            <EmptyContent />
          </div>

          {/* <NodeElectionItem index={0} />
          <NodeElectionItem index={1} />
          <NodeElectionItem index={2} /> */}

          {/* <div className="my-[.32rem] flex items-center justify-center">
          <CustomPagination page={page} onChange={setPage} totalCount={1} />
        </div> */}
        </div>
      </div>
    </div>
  );
};

interface NodeElectionItemProps {
  index: number;
}

const NodeElectionItem = (props: NodeElectionItemProps) => {
  const { darkMode } = useAppSlice();
  const { index } = props;

  return (
    <div
      className={classNames(
        "h-[.74rem] grid items-center font-[500]",
        index % 2 === 0 ? "bg-bgPage/50 dark:bg-bgPageDark/50" : ""
      )}
      style={{
        gridTemplateColumns: "25% 25% 25% 25%"
      }}
    >
      <div className="flex items-center justify-center text-[.16rem] text-color-text2 cursor-pointer">
        <div
          className="h-[.42rem] w-[1.76rem] px-[.16rem] flex items-center justify-between border-solid border-[1px] border-white dark:border-[#222C3C] rounded-[.3rem] bg-color-bgPage"
          onClick={() => {}}
        >
          <div className="text-color-text1 text-[.16rem]">0x998C…837G</div>

          <div className="ml-[.06rem] rotate-[-90deg]">
            <Icomoon icon="arrow-down" size=".1rem" color="white" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center text-color-text1 text-[.16rem]">
        <div className={classNames(robotoSemiBold.className)}>16 April 23:00</div>
      </div>

      <div className="flex items-center justify-center text-color-text1 text-[.16rem] ">
        <div className={classNames(robotoSemiBold.className)}>24.5</div>
      </div>

      <div className="flex items-center justify-center text-color-text1 text-[.16rem]">
        <div className="flex items-center">
          <div className={classNames(robotoSemiBold.className, "mr-[.06rem]")}>Active</div>

          <Icomoon icon="right1" size=".1rem" color={darkMode ? "#ffffff80" : "white"} />
        </div>
      </div>
    </div>
  );
};
