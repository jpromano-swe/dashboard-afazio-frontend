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
  if (metric.label !== "Clasificación pendiente" && metric.label !== "Próximas tareas") {
    return false;
  }

  const numericValue = Number(metric.value.replace(/[^\d-]/g, ""));

  return Number.isFinite(numericValue) && numericValue === 0;
}

function AnimatedMetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <div
      className="opacity-0"
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
      />
    </div>
  );
}

function resolveMetric(metric: DashboardMetric, view: "today" | "weekly", weeklyCount: number) {
  if (metric.label !== "Clases de hoy") {
    return metric;
  }

  if (view === "weekly") {
    return {
      ...metric,
      label: "Clases de esta semana",
      value: String(weeklyCount).padStart(2, "0"),
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
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
