import classNames from "classnames";
import { CustomTag } from "components/common/CustomTag";
import { DataLoading } from "components/common/DataLoading";
import { PageTitleContainer } from "components/common/PageTitleContainer";
import { DelegateElection } from "components/pool/DelegateElection";
import { PoolAssets } from "components/pool/PoolAssets";
import { UnstakingPoolStatus } from "components/pool/UnstakingPoolStatus";
import { ValidatorEjection } from "components/pool/ValidatorEjection";
import { robotoBold } from "config/font";
import { useAppSlice } from "hooks/selector";
import { useApr } from "hooks/useApr";
import Image from "next/image";
import { useRouter } from "next/router";
import { getLsdTokenName } from "utils/configUtils";
import { getLsdTokenIcon } from "utils/iconUtils";
import { formatNumber } from "utils/numberUtils";

const PoolDataPage = () => {
  const { darkMode } = useAppSlice();
  const router = useRouter();

  const { apr } = useApr();

  return (
    <div>
      <PageTitleContainer>
        <div className="h-full flex items-center w-full max-w-[1280px] max-[800px]:justify-center max-[500px]:flex-col gap-[.12rem]">
          <div className="w-[.68rem] h-[.68rem] relative">
            <Image src={getLsdTokenIcon()} layout="fill" alt="icon" />
          </div>

          <div>
            <div className="flex items-center  max-[500px]:flex-col">
              <div className={classNames(robotoBold.className, "text-[.34rem] text-color-text1")}>
                {getLsdTokenName()} Pool
              </div>

              <CustomTag type="apr" ml=".12rem">
                {apr === undefined ? <DataLoading height=".12rem" /> : `${formatNumber(apr, { decimals: 2 })}%`}
                <span className="ml-[.06rem]"> APR</span>
              </CustomTag>
            </div>

            <div className="mt-[.12rem] text-[.12rem] text-color-text2 cursor-pointer">
              <div className="flex items-center">
                <div className="mr-[.06rem]">Take part in rPool programs, earn tokens easily.</div>
              </div>
            </div>
          </div>
        </div>
      </PageTitleContainer>

      <div className="w-full max-w-[1280px] mx-auto px-[.1rem]">
        <PoolAssets />

        <UnstakingPoolStatus />

        <ValidatorEjection />

        <DelegateElection />
      </div>
    </div>
  );
};

export default PoolDataPage;
