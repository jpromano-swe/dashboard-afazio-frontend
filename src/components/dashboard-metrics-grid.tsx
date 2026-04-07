"use client";

import { useMemo } from "react";
import {
  CalendarDays,
  CircleAlert,
  ClipboardCheck,
  Wallet,
} from "lucide-react";
import { MetricCard } from "@/components/editorial";
import type { DashboardMetric } from "@/lib/data";

type DashboardMetricsGridProps = {
  metrics: DashboardMetric[];
  view: "today" | "weekly";
  weeklyCount: number;
};

const metricIcons = {
  calendar: <CalendarDays className="h-5 w-5" />,
  pending: <CircleAlert className="h-5 w-5" />,
  income: <Wallet className="h-5 w-5" />,
  tasks: <ClipboardCheck className="h-5 w-5" />,
};

function shouldHideMetric(metric: DashboardMetric) {
  if (
    metric.label !== "Clasificación pendiente" &&
    metric.label !== "Clases pendientes hoy"
  ) {
    return false;
  }

  const numericValue = Number(metric.value.replace(/[^\d-]/g, ""));

  return Number.isFinite(numericValue) && numericValue === 0;
}

function AnimatedMetricCard({ metric }: { metric: DashboardMetric }) {
  const isIncome = metric.label === "Ingresos mensuales";

  return (
    <div
      className={isIncome ? "opacity-0 lg:col-span-2" : "opacity-0"}
      style={{
        animation: "dashboard-card-in 220ms ease-out forwards",
      }}
    >
      <MetricCard
        label={metric.label}
        value={metric.value}
        icon={metricIcons[metric.icon]}
        helper={metric.helper}
        accent={metric.accent}
        className={
          isIncome
            ? "!bg-[#1b3022] !text-[#ffffff] !px- ring-1 ring-[#132318]/12 shadow-[0_18px_40px_rgba(14,29,19,0.18)]"
            : undefined
        }
        contentClassName={isIncome ? "!mt-3 items-end" : undefined}
        valueClassName={
          isIncome
            ? "!text-white pl-0 text-[clamp(2.15rem,4vw,3.6rem)] leading-none"
            : undefined
        }
        labelClassName={isIncome ? "text-white/72" : undefined}
        helperClassName={isIncome ? "text-white/72" : undefined}
        iconClassName={isIncome ? "bg-white/12 text-white" : undefined}
      />
    </div>
  );
}

function resolveMetric(metric: DashboardMetric, view: "today" | "weekly", weeklyCount: number) {
  if (metric.label === "Clases de hoy") {
    if (view === "weekly") {
      return {
        ...metric,
        label: "Clases de esta semana",
        value: String(weeklyCount).padStart(2, "0"),
      };
    }

    return metric;
  }

  if (metric.label === "Clases pendientes hoy" && view === "weekly") {
    return {
      ...metric,
      label: "Clases semanales pendientes",
    };
  }

  return metric;
}

export function DashboardMetricsGrid({ metrics, view, weeklyCount }: DashboardMetricsGridProps) {
  const visibleMetrics = useMemo(
    () => metrics.filter((metric) => !shouldHideMetric(metric)),
    [metrics],
  );

  return (
    <>
      <style>{`
        @keyframes dashboard-card-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        }}
      >
        {visibleMetrics.map((metric) => {
          const resolvedMetric = resolveMetric(metric, view, weeklyCount);

          return (
            <AnimatedMetricCard
              key={`${metric.label}-${resolvedMetric.label}-${resolvedMetric.value}`}
              metric={resolvedMetric}
            />
          );
        })}
      </div>
    </>
  );
}
