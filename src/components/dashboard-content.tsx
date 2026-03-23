"use client";

import { useMemo, useState } from "react";
import { DashboardMetricsGrid } from "@/components/dashboard-metrics-grid";
import { DashboardScheduleSwitcher } from "@/components/dashboard-schedule-switcher";
import type { DashboardData } from "@/lib/data";

type DashboardContentProps = {
  data: DashboardData;
};

export function DashboardContent({ data }: DashboardContentProps) {
  const [view, setView] = useState<"today" | "weekly">("today");

  const weeklyCount = useMemo(
    () => data.weeklySchedule.reduce((total, day) => total + day.entries.length, 0),
    [data.weeklySchedule],
  );

  return (
    <>
      <DashboardMetricsGrid
        metrics={data.metrics}
        view={view}
        weeklyCount={weeklyCount}
      />

      {data.backendNotice ? (
        <div className="mt-6 rounded-[1.2rem] border border-[#e7c88c] bg-[#fde9cf] px-5 py-4 text-sm leading-6 text-[#634010]">
          {data.backendNotice}
        </div>
      ) : null}

      <DashboardScheduleSwitcher
        view={view}
        onViewChange={setView}
        weekRangeLabel={data.weekRangeLabel}
        todaySchedule={data.schedule}
        weeklySchedule={data.weeklySchedule}
      />
    </>
  );
}
