import { StudentOverview } from "@/components/Charts/student-overview";
import { UsedDevices } from "@/components/Charts/used-devices";
import { WeeksProfit } from "@/components/Charts/weeks-profit";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopMinervales } from "@/components/Tables/top-minervales";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Suspense } from "react";
import { ChatsCard } from "./_components/chats-card";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { RegionLabels } from "./_components/region-labels";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <StudentOverview
          className="col-span-12 xl:col-span-12"
          key={extractTimeFrame("student_overview")}
          timeFrame={extractTimeFrame("student_overview")?.split(":")[1]}
        />

        {/* <div className="col-span-12 grid xl:col-span-6">
          <Suspense fallback={<TopChannelsSkeleton />}>
            <TopChannels />
          </Suspense>
        </div> */}
        
        {/* <div className="col-span-12 grid xl:col-span-12">
          <TopMinervales />
        </div> */}
      </div>
    </>
  );
}
