"use client";

import { useEffect, useState } from "react";
import { CalendarSync, CheckCircle2, LoaderCircle } from "lucide-react";

const CALENDAR_STATUS_INTERVAL_MS = 10 * 60 * 1000;
const NGROK_SKIP_BROWSER_WARNING_HEADER = {
  "ngrok-skip-browser-warning": "1",
};

type CalendarConnectionActionProps = {
  authUrl: string;
  debugUrl: string;
};

type CalendarStatus = "checking" | "connected" | "disconnected";

async function checkCalendarConnection(debugUrl: string) {
  const response = await fetch(debugUrl, {
    method: "GET",
    credentials: "include",
    headers: NGROK_SKIP_BROWSER_WARNING_HEADER,
  });
  const contentType = response.headers.get("content-type") ?? "";

  if (
    response.redirected ||
    response.status === 401 ||
    response.status === 302 ||
    !response.ok ||
    !contentType.includes("application/json")
  ) {
    return false;
  }

  return true;
}

export function CalendarConnectionAction({
  authUrl,
  debugUrl,
}: CalendarConnectionActionProps) {
  const [status, setStatus] = useState<CalendarStatus>("checking");

  useEffect(() => {
    let active = true;

    async function refreshStatus() {
      try {
        const connected = await checkCalendarConnection(debugUrl);

        if (active) {
          setStatus(connected ? "connected" : "disconnected");
        }
      } catch {
        if (active) {
          setStatus("disconnected");
        }
      }
    }

    void refreshStatus();

    const interval = window.setInterval(refreshStatus, CALENDAR_STATUS_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [debugUrl]);

  if (status === "checking") {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/35 bg-surface-container-lowest px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant/70"
      >
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        Verificando calendario
      </button>
    );
  }

  if (status === "connected") {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-xl border border-[#bcdab8] bg-[#e7f3e5] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f5a2a]"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Calendario conectado
      </button>
    );
  }

  return (
    <a
      href={authUrl}
      className="inline-flex items-center gap-2 rounded-xl border border-[#d77b73]/45 bg-[#ffdad6] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8e1212] transition hover:bg-[#ffc9c4] hover:text-[#730b0b]"
    >
      <CalendarSync className="h-3.5 w-3.5" />
      Conectar calendario
    </a>
  );
}
