"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft } from "lucide-react";
import {
  BulkTaughtAction,
  ScheduleStatusActions,
} from "@/components/dashboard-class-actions";
import { SectionFrame, StatusBadge } from "@/components/editorial";
import type { ScheduleEntry, WeeklyScheduleDay } from "@/lib/data";

type DashboardScheduleSwitcherProps = {
  view: "today" | "weekly";
  onViewChange: (view: "today" | "weekly") => void;
  weekRangeLabel: string;
  todaySchedule: ScheduleEntry[];
  weeklySchedule: WeeklyScheduleDay[];
};

function getConsultoraTone(consultoraName: string | null | undefined) {
  const normalized = (consultoraName ?? "").trim().toLowerCase();

  if (normalized.includes("haskler")) {
    return {
      row: "bg-[#efe5ff] hover:bg-[#e6d9ff]",
      card: "bg-[#f3ecff] border-[#dfcff8]",
      join: "border-[#37295f] bg-[#37295f] text-[#f7f2ff] hover:bg-[#2f234f]",
    };
  }

  if (normalized.includes("blc")) {
    return {
      row: "bg-[#f8efc8] hover:bg-[#f2e4b0]",
      card: "bg-[#fbf3d8] border-[#e9d79c]",
      join: "border-[#3c3421] bg-[#3c3421] text-[#fff9eb] hover:bg-[#2f2918]",
    };
  }

  if (normalized.includes("independ")) {
    return {
      row: "bg-[#f7ddd5] hover:bg-[#efcfc5]",
      card: "bg-[#fae6e0] border-[#ebc6bc]",
      join: "border-[#4a2f2a] bg-[#4a2f2a] text-[#fff3f0] hover:bg-[#3a2521]",
    };
  }

  return {
    row: "hover:bg-surface-container-low/55",
    card: "bg-surface-container-low border-outline-variant/15",
    join: "border-[#203128] bg-[#203128] text-[#f5f3ed] hover:bg-[#17241d]",
  };
}

function getBadgeLabel(entry: ScheduleEntry) {
  if (entry.classState === "PROGRAMADA") {
    return "Programada";
  }

  if (entry.classState === "DICTADA") {
    return "Dictada";
  }

  if (entry.classState === "CANCELADA") {
    return "Cancelada";
  }

  if (entry.classState === "REPROGRAMADA") {
    return "Reprogramada";
  }

  return entry.action;
}

function getSlideClass(active: boolean, direction: "left" | "right") {
  const hiddenClass = direction === "left" ? "-translate-x-6" : "translate-x-6";

  return active
    ? "pointer-events-auto translate-x-0 opacity-100"
    : `pointer-events-none ${hiddenClass} opacity-0`;
}

export function DashboardScheduleSwitcher({
  view,
  onViewChange,
  weekRangeLabel,
  todaySchedule,
  weeklySchedule,
}: DashboardScheduleSwitcherProps) {
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const todaySizerRef = useRef<HTMLDivElement>(null);
  const weeklySizerRef = useRef<HTMLDivElement>(null);

  const todayClassIds = useMemo(
    () =>
      todaySchedule
        .filter((entry) => entry.classState === "PROGRAMADA" && entry.id)
        .map((entry) => entry.id as number),
    [todaySchedule],
  );
  const weeklyClassCount = useMemo(
    () => weeklySchedule.reduce((total, day) => total + day.entries.length, 0),
    [weeklySchedule],
  );

  const activeSizerRef = view === "today" ? todaySizerRef : weeklySizerRef;

  useLayoutEffect(() => {
    const panel = activeSizerRef.current;

    if (!panel) {
      return;
    }

    setPanelHeight(panel.scrollHeight);
  }, [activeSizerRef, todaySchedule, weeklySchedule, view]);

  useEffect(() => {
    const panel = activeSizerRef.current;

    if (!panel || typeof ResizeObserver === "undefined") {
      return;
    }

    const updateHeight = () => {
      setPanelHeight(panel.scrollHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(panel);

    return () => observer.disconnect();
  }, [activeSizerRef, todaySchedule, weeklySchedule, view]);

  useEffect(() => {
    function handleResize() {
      const panel = activeSizerRef.current;

      if (panel) {
        setPanelHeight(panel.scrollHeight);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [activeSizerRef]);

  return (
    <SectionFrame className="mt-10 p-1">
      <div className="flex flex-col gap-6 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="min-h-[176px] sm:min-h-[136px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant/70">
            {view === "today" ? "Vista de hoy" : weekRangeLabel}
          </p>
          <div className="mt-3 flex min-h-[104px] items-end sm:min-h-[84px]">
            <div
              className="flex translate-x-0 flex-wrap items-center gap-3 opacity-100 transition-all duration-300 ease-out"
            >
              <h2 className="max-w-[12ch] font-headline text-[2.45rem] font-bold leading-[0.96] text-primary sm:max-w-none sm:text-[3.2rem]">
                {view === "today" ? "Agenda de hoy" : "Clases de esta semana"}
              </h2>
              {view === "weekly" ? (
                <StatusBadge tone="confirmed" className="shrink-0 self-center">
                  {String(weeklyClassCount).padStart(2, "0")}
                </StatusBadge>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-sm text-on-surface-variant">
            {view === "today"
              ? "Vista tipo libro de papel de los bloques de clase de hoy."
              : "Clases agrupadas por día durante la semana actual."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {view === "today" ? <BulkTaughtAction classIds={todayClassIds} /> : null}
          <button
            type="button"
            onClick={() => onViewChange(view === "today" ? "weekly" : "today")}
            className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/35 bg-surface px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary transition hover:bg-surface-container-high"
          >
            {view === "today" ? (
              <>
                <CalendarDays className="h-3.5 w-3.5" />
                Ver calendario semanal
              </>
            ) : (
              <>
                <ChevronLeft className="h-3.5 w-3.5" />
                Volver a hoy
              </>
            )}
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-[1.2rem] bg-surface-container-lowest transition-[height] duration-500 ease-out will-change-[height]"
        style={{
          height: panelHeight ? `${panelHeight}px` : undefined,
        }}
      >
        <div
          className={`absolute inset-0 transition-all duration-300 ease-out ${getSlideClass(
            view === "today",
            "left",
          )}`}
        >
          <div ref={todaySizerRef}>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-surface-container-high/65 text-left">
                  <tr>
                    {["Título", "Hora", "Duración", "Estado", "Acciones"].map((label) => (
                      <th
                        key={label}
                        className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {todaySchedule.map((entry) => (
                    (() => {
                      const tone = getConsultoraTone(entry.consultantName);

                      return (
                    <tr
                      key={entry.id ?? entry.googleEventId ?? `${entry.title}-${entry.time}`}
                      className={tone.row}
                    >
                      <td className="px-6 py-5">
                        <div className={entry.muted ? "opacity-55" : undefined}>
                          <p className="font-headline text-xl text-primary">{entry.title}</p>
                          <p className="mt-1 text-sm text-on-surface-variant">
                            {entry.subtitle}
                          </p>
                          {entry.classState === "PROGRAMADA" && entry.meetingUrl ? (
                            <a
                              href={entry.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`mt-3 inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition ${tone.join}`}
                            >
                              Unirse
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-primary">
                        {entry.time}
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">
                        {entry.duration}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge tone={entry.status}>{getBadgeLabel(entry)}</StatusBadge>
                      </td>
                      <td className="px-6 py-5 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                        <div className="flex flex-wrap justify-end gap-3">
                          {entry.classState === "PROGRAMADA" && entry.id ? (
                            <ScheduleStatusActions classId={entry.id} classTitle={entry.title} />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                      );
                    })()
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div
          className={`absolute inset-0 transition-all duration-300 ease-out ${getSlideClass(
            view === "weekly",
            "right",
          )}`}
        >
          <div ref={weeklySizerRef}>
            <div className="px-4 py-5 sm:px-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <StatusBadge tone="confirmed">{weekRangeLabel}</StatusBadge>
                  <span className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                    {weeklyClassCount} clases programadas
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {weeklySchedule.map((day) => (
                  <div
                    key={`${day.label}-${day.dateLabel}`}
                    className="rounded-[1.1rem] border border-outline-variant/18 bg-background/60 p-4 shadow-[0_12px_30px_rgba(6,27,14,0.03)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                          {day.label}
                        </p>
                        <h3 className="mt-2 font-headline text-xl font-bold text-primary">
                          {day.dateLabel}
                        </h3>
                      </div>
                      <StatusBadge tone={day.entries.length > 0 ? "confirmed" : "muted"}>
                        {String(day.entries.length).padStart(2, "0")}
                      </StatusBadge>
                    </div>

                    <div className="mt-4 space-y-3">
                      {day.entries.length > 0 ? (
                        day.entries.map((entry) => (
                          (() => {
                            const tone = getConsultoraTone(entry.consultantName);

                            return (
                          <div
                            key={entry.id ?? entry.googleEventId ?? `${entry.title}-${entry.time}`}
                            className={`rounded-2xl border px-3 py-3 ${tone.card}`}
                          >
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/70">
                              {entry.time}
                            </p>
                            <p className="mt-2 font-semibold text-primary">{entry.title}</p>
                            <p className="mt-1 text-xs text-on-surface-variant">{entry.subtitle}</p>
                            {entry.classState === "PROGRAMADA" && entry.meetingUrl ? (
                              <a
                                href={entry.meetingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`mt-3 inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition ${tone.join}`}
                              >
                                Unirse
                              </a>
                            ) : null}
                            <div className="mt-3">
                              <StatusBadge tone={entry.status}>{getBadgeLabel(entry)}</StatusBadge>
                            </div>
                          </div>
                            );
                          })()
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-outline-variant/20 px-3 py-6 text-sm text-on-surface-variant">
                          No hay clases programadas.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
