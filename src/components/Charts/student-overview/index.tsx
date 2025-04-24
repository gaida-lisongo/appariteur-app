"use client";

import { PeriodPicker } from "@/components/period-picker";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { StudentOverviewChart } from "./chart";
import useUserStore from "@/store/useUserStore";
import { useEffect, useState } from "react";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

type ChartDataPoint = {
  x: string;  // Label for promotion
  y: number;  // Number of students
};

export function StudentOverview({
  timeFrame = "monthly",
  className,
}: PropsType) {
  const { promotions, etudiants, fetchEtudiants } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<{
    total: ChartDataPoint[];
    male: ChartDataPoint[];
    female: ChartDataPoint[];
  }>({
    total: [],
    male: [],
    female: []
  });
  
  useEffect(() => {
    const loadStudentData = async () => {
      if (!promotions || promotions.length === 0) {
        return;
      }
      
      setIsLoading(true);
      
      // Fetch students for each promotion if not already loaded
      for (const promotion of promotions) {
        if (!etudiants?.find(e => e.promotionId === promotion._id)) {
          await fetchEtudiants(promotion._id);
        }
      }

      setIsLoading(false);
    };
    
    loadStudentData();
  }, [promotions, etudiants, fetchEtudiants]);

  // Calculate chart data when promotions or students change
  useEffect(() => {
    if (!promotions || !etudiants) return;

    const totalData: ChartDataPoint[] = [];
    const maleData: ChartDataPoint[] = [];
    const femaleData: ChartDataPoint[] = [];

    promotions.forEach(promotion => {
      const promotionStudents = etudiants.find(e => e.promotionId === promotion._id);
      if (promotionStudents) {
        const label = `${promotion.niveau} ${promotion?.orientation ? promotion.orientation : ""}`;
        console.log("Current label : ", label);
        const totalCount = promotionStudents.inscrits.length;
        
        // Count students by gender
        let maleCount = 0;
        let femaleCount = 0;
        
        promotionStudents.inscrits.forEach(student => {
          const sexe = student.sexe?.toLowerCase();
          if (sexe === 'm' || sexe === 'masculin') {
            maleCount++;
          } else if (sexe === 'f' || sexe === 'féminin') {
            femaleCount++;
          }
        });
        
        totalData.push({ x: label, y: totalCount });
        maleData.push({ x: label, y: maleCount });
        femaleData.push({ x: label, y: femaleCount });
      }
    });

    setChartData({
      total: totalData,
      male: maleData,
      female: femaleData
    });
  }, [isLoading, promotions]);

  // Calculate totals
  const totalStudents = chartData.total.reduce((acc, { y }) => acc + y, 0);
  const maleStudents = chartData.male.reduce((acc, { y }) => acc + y, 0);
  const femaleStudents = chartData.female.reduce((acc, { y }) => acc + y, 0);

  return (
    <div
      className={cn(
        "grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Effectifs par promotion
        </h2>

        {/* Remplacer le period picker par une légende simple */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary"></div>
            <span className="text-sm font-medium">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium">Hommes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-pink-500"></div>
            <span className="text-sm font-medium">Femmes</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <span className="ml-2">Chargement...</span>
        </div>
      ) : chartData.total.length > 0 ? (
        <StudentOverviewChart 
          data={{
            total: chartData.total,
            male: chartData.male,
            female: chartData.female
          }} 
        />
      ) : (
        <div className="flex h-64 items-center justify-center">
          <p className="text-center text-gray-500">
            Aucune donnée disponible
          </p>
        </div>
      )}

      <dl className="grid divide-stroke text-center dark:divide-dark-3 sm:grid-cols-3 sm:divide-x [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1">
        <div className="dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3">
          <dt className="text-xl font-bold text-dark dark:text-white">
            {standardFormat(totalStudents)}
          </dt>
          <dd className="font-medium dark:text-dark-6">Total Étudiants</dd>
        </div>

        <div className="dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3">
          <dt className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {standardFormat(maleStudents)}
          </dt>
          <dd className="font-medium dark:text-dark-6">Hommes</dd>
        </div>

        <div>
          <dt className="text-xl font-bold text-pink-600 dark:text-pink-400">
            {standardFormat(femaleStudents)}
          </dt>
          <dd className="font-medium dark:text-dark-6">Femmes</dd>
        </div>
      </dl>
    </div>
  );
}