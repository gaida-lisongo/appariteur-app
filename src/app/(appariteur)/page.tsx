"use client";

import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { StudentOverview } from "@/components/Charts/student-overview";
import { UsedDevices } from "@/components/Charts/used-devices";
import { WeeksProfit } from "@/components/Charts/weeks-profit";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopMinervales } from "@/components/Tables/top-minervales";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import React, { Suspense, useEffect, useState, use } from "react";
import { ChatsCard } from "./_components/chats-card";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { RegionLabels } from "./_components/region-labels";
import useUserStore from "@/store/useUserStore";
import { Loader } from "lucide-react";

// Composant de chargement
function HomeLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="animate-spin h-8 w-8 text-primary" />
    </div>
  );
}

// Contenu principal qui utilise useSearchParams
function HomeContent() {
  const searchParams = useSearchParams();
  const selected_time_frame = searchParams.get('selected_time_frame') ?? undefined;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);
  const { promotions, fetchEtudiants, etudiants, isLoading } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [allStudentsResults, setAllStudentsResults] = useState<any[]>([]);

  useEffect(() => {
    async function loadStudentData() {
      if (promotions && promotions.length > 0) {
        setLoading(true);
        const promises = promotions.map(promotion => fetchEtudiants(promotion._id));
        try {
          const results = await Promise.all(promises);
          
          let studentResults: any[] = [];
          results.forEach((result) => {
            if (result) {
              studentResults = [...studentResults, ...result];
            }
          });
          
          setAllStudentsResults(studentResults);
        } catch (error) {
          console.error('Error loading student data:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    loadStudentData();
  }, [promotions, fetchEtudiants]);

  if (isLoading || loading) {
    return <HomeLoading />;
  }

  return (
    <>
      <OverviewCardsGroup />

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <StudentOverview
          className="col-span-12 xl:col-span-12"
          key={extractTimeFrame("student_overview")}
          timeFrame={extractTimeFrame("student_overview")?.split(":")[1]}
        />

        {/* <div className="col-span-12 grid xl:col-span-6">
          <TopChannels />
        </div> */}
        
        {/* <div className="col-span-12 grid xl:col-span-12">
          <TopMinervales />
        </div> */}
      </div>
    </>
  );
}

// Composant principal qui utilise Suspense
export default function Home() {
  return (
    <Suspense fallback={
      <>
        <OverviewCardsSkeleton />
        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
          <div className="col-span-12 xl:col-span-12 h-96 animate-pulse bg-gray-200 rounded-lg dark:bg-boxdark"></div>
        </div>
      </>
    }>
      <HomeContent />
    </Suspense>
  );
}
