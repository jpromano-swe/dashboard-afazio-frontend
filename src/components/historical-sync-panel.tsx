"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarSync, LoaderCircle } from "lucide-react";
import { ActionButton, StatusBadge } from "@/components/editorial";
import { notifyError, notifySuccess } from "@/lib/client-toast";

const NGROK_SKIP_BROWSER_WARNING_HEADER = {
  "ngrok-skip-browser-warning": "1",
};

type HistoricalSyncPanelProps = {
  from: string;
  to: string;
  rangeLabel: string;
  syncUrl: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "La sincronización falló. Verificá tu sesión de Google e intentá de nuevo.";
}

export function HistoricalSyncPanel({
  from,
  to,
  rangeLabel,
  syncUrl,
}: HistoricalSyncPanelProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleSync() {
    setIsSyncing(true);

    try {
      const response = await fetch(syncUrl, {
        method: "GET",
        credentials: "include",
        headers: NGROK_SKIP_BROWSER_WARNING_HEADER,
      });
      const contentType = response.headers.get("content-type") ?? "";

      if (
        response.redirected ||
        response.url.includes("/oauth2/authorization/google") ||
        !contentType.includes("application/json")
      ) {
        throw new Error("Se requiere sesión de Google para sincronizar este rango.");
      }

      if (!response.ok) {
        throw new Error(`La sincronización falló con HTTP ${response.status}.`);
      }

      const payload = (await response.json()) as { processed?: number };

      notifySuccess(
        "Sincronización completa",
        `Se sincronizaron ${payload.processed ?? 0} evento${
          payload.processed === 1 ? "" : "s"
        } para ${rangeLabel}.`,
      );

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      notifyError(error, getErrorMessage(error));
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="rounded-[1.3rem] border border-outline-variant/20 bg-surface-container-low px-4 py-4">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
              Sincronización del rango
            </p>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              Ajustá el período que querés revisar y sincronizá Google Calendar antes de marcar las clases como dictadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="archived">{rangeLabel}</StatusBadge>
            {isRefreshing ? (
              <StatusBadge tone="review">Actualizando</StatusBadge>
            ) : null}
          </div>
        </div>

        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
          <label className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Desde
            </span>
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="w-full rounded-xl border border-outline-variant/35 bg-surface px-4 py-3 text-sm text-primary outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Hasta
            </span>
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="w-full rounded-xl border border-outline-variant/35 bg-surface px-4 py-3 text-sm text-primary outline-none"
            />
          </label>

          <div className="flex items-end">
            <ActionButton
              type="submit"
              variant="secondary"
              className="h-[50px] w-full justify-center"
            >
              Actualizar rango
            </ActionButton>
          </div>

          <div className="flex items-end">
            <ActionButton
              type="button"
              variant="secondary"
              icon={
                isSyncing ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CalendarSync className="h-3.5 w-3.5" />
                )
              }
              onClick={handleSync}
              disabled={isSyncing || isRefreshing}
              className="h-[50px] w-full justify-center"
            >
              Sincronizar este rango
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
