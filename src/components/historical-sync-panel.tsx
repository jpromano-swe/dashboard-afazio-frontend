"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarSync, LoaderCircle, TriangleAlert } from "lucide-react";
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
  classCount: number;
  rangeSelected: boolean;
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
  classCount,
  rangeSelected,
}: HistoricalSyncPanelProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <div className="rounded-[1.3rem] border border-outline-variant/20 bg-surface-container-low px-4 py-4">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                Sincronización del rango
              </p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                Elegí el período, seleccioná el rango y confirmá la sincronización antes de modificar las clases importadas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge tone="archived">{rangeLabel}</StatusBadge>
              <StatusBadge tone="muted">
                {classCount} {classCount === 1 ? "clase" : "clases"}
              </StatusBadge>
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
                variant="outline"
                className="h-[50px] w-full justify-center"
              >
                Seleccionar rango
              </ActionButton>
            </div>

            {rangeSelected ? (
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
                onClick={() => setConfirmOpen(true)}
                disabled={isSyncing || isRefreshing}
                  className="h-[50px] w-full justify-center border-[#c28532]/35 bg-[#fde9cf] text-[#7a4a12] hover:bg-[#f7d8ae] hover:text-[#5f390d]"
              >
                Sincronizar rango
              </ActionButton>
              </div>
            ) : null}
          </form>
        </div>
      </div>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-[1200] grid place-items-center bg-surface/55 px-4 backdrop-blur-[2px]"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-[34rem] overflow-hidden rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest shadow-[0_30px_90px_rgba(6,27,14,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-[#c28532]/85" />
            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#c28532] text-white">
                  <TriangleAlert className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                    Confirmación
                  </p>
                  <h3 className="mt-1 font-headline text-2xl font-bold leading-tight text-primary sm:text-[2rem]">
                    ¿Seguro que querés sincronizar este rango?
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                    Se reiniciará{classCount === 1 ? "" : "n"} {classCount} {classCount === 1 ? "clase" : "clases"} del rango {rangeLabel}.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={isSyncing}
                  className="rounded-xl border border-outline-variant/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant transition hover:bg-surface-container-high disabled:opacity-45"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c28532] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-95 disabled:opacity-45"
                >
                  {isSyncing ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CalendarSync className="h-3.5 w-3.5" />
                  )}
                  {isSyncing ? "Sincronizando..." : "Confirmar sincronización"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
