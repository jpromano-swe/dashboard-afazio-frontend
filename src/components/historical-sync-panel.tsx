"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarSync, LoaderCircle } from "lucide-react";
import { ActionButton, StatusBadge } from "@/components/editorial";

type HistoricalSyncPanelProps = {
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
  rangeLabel,
  syncUrl,
}: HistoricalSyncPanelProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    tone: "confirmed" | "danger";
    message: string;
  } | null>(null);
  const [isRefreshing, startTransition] = useTransition();
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleSync() {
    setIsSyncing(true);
    setFeedback(null);

    try {
      const response = await fetch(syncUrl, {
        method: "GET",
        credentials: "include",
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

      setFeedback({
        tone: "confirmed",
        message: `Se sincronizaron ${payload.processed ?? 0} evento${
          payload.processed === 1 ? "" : "s"
        } para ${rangeLabel}.`,
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setFeedback({
        tone: "danger",
        message: getErrorMessage(error),
      });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="rounded-[1.3rem] border border-outline-variant/20 bg-surface-container-low px-4 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
            Sincronización del rango
          </p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Sincronizá Google Calendar para {rangeLabel} antes de marcar las clases como dictadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isRefreshing ? (
            <StatusBadge tone="review">Actualizando</StatusBadge>
          ) : null}

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
          >
            Sincronizar este rango
          </ActionButton>
        </div>
      </div>

      {feedback ? (
        <div className="mt-4">
          <StatusBadge tone={feedback.tone}>{feedback.message}</StatusBadge>
        </div>
      ) : null}
    </div>
  );
}
