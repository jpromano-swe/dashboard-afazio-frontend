"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertTriangle, Pencil, Plus } from "lucide-react";
import {
  createRateAction,
  type MutationActionState,
  updateRateAction,
} from "@/app/actions";
import { ActionButton, StatusBadge } from "@/components/editorial";
import type { ConsultoraResponse } from "@/lib/backend";
import { notifyError, notifySuccess } from "@/lib/client-toast";

type CurrentRateHint = {
  consultoraId: number;
  consultoraNombre: string;
  vigenteDesde: string;
  vigenteHasta: string | null;
};

type EditingRate = {
  tarifaId: number;
  consultoraId: number;
  consultoraNombre: string;
  montoPorHora: number;
  vigenteDesde: string;
  vigenteHasta: string | null;
  fechaUltimoAumento: string | null;
  observaciones: string | null;
};

type RateCreateFormProps = {
  activeConsultoras: ConsultoraResponse[];
  currentRates?: CurrentRateHint[];
  mode?: "create" | "edit";
  editingRate?: EditingRate;
  onSuccess?: () => void;
};

const INITIAL_STATE: MutationActionState = {
  status: "idle",
  message: null,
};

export function RateCreateForm({
  activeConsultoras,
  currentRates = [],
  mode = "create",
  editingRate,
  onSuccess,
}: RateCreateFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = mode === "edit" ? updateRateAction : createRateAction;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const [selectedConsultoraId, setSelectedConsultoraId] = useState(
    editingRate ? String(editingRate.consultoraId) : "",
  );
  const [vigenteDesde, setVigenteDesde] = useState(editingRate?.vigenteDesde ?? "");

  useEffect(() => {
    if (state.status === "success") {
      notifySuccess(
        mode === "edit" ? "Tarifa actualizada" : "Tarifa guardada",
        state.message,
      );

      if (mode === "create") {
        formRef.current?.reset();
        setSelectedConsultoraId("");
        setVigenteDesde("");
      }

      onSuccess?.();
      return;
    }

    if (state.status === "error") {
      notifyError(
        state.message ?? `No se pudo ${mode === "edit" ? "actualizar" : "crear"} la tarifa.`,
      );
    }
  }, [mode, onSuccess, state]);

  const selectedConsultoraNumber = Number(selectedConsultoraId);
  const currentRateForConsultora = Number.isFinite(selectedConsultoraNumber)
    ? currentRates.find((rate) => rate.consultoraId === selectedConsultoraNumber) ?? null
    : null;
  const shouldWarnAboutOpenRate =
    mode === "create" &&
    currentRateForConsultora &&
    currentRateForConsultora.vigenteHasta === null;

  return (
    <form ref={formRef} action={formAction} className="mt-6 grid gap-4 md:grid-cols-2">
      {mode === "edit" && editingRate ? (
        <input type="hidden" name="tarifaId" value={editingRate.tarifaId} />
      ) : null}

      <div className="space-y-2 md:col-span-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Consultora
        </label>
        {activeConsultoras.length > 0 ? (
          <select
            name="consultoraId"
            required
            value={selectedConsultoraId}
            onChange={(event) => setSelectedConsultoraId(event.target.value)}
            className="w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none"
          >
            <option value="">Seleccioná una consultora</option>
            {activeConsultoras.map((consultora) => (
              <option key={consultora.id} value={consultora.id}>
                {consultora.nombre}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            name="consultoraId"
            min="1"
            required
            defaultValue={editingRate?.consultoraId}
            placeholder="ID de consultora"
            onChange={(event) => setSelectedConsultoraId(event.target.value)}
            className="w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none placeholder:text-on-surface-variant/60"
          />
        )}
        <p className="text-xs leading-5 text-on-surface-variant">
          Elegí la consultora activa que tendrá esta tarifa.
        </p>
      </div>

      {shouldWarnAboutOpenRate ? (
        <div className="rounded-2xl border border-[#e4c37c] bg-[#fff3cf] px-4 py-3 md:col-span-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#9b6b14]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b6b14]">
                Tarifa abierta detectada
              </p>
              <p className="mt-1 text-sm leading-6 text-[#7a5714]">
                {currentRateForConsultora.consultoraNombre} tiene una tarifa vigente sin fecha de cierre.
                Cerrá o ajustá <span className="font-semibold">Vigente hasta</span> antes de crear una nueva.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-2 md:col-span-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Tarifa por hora
        </label>
        <div className="relative">
          <input
            type="number"
            name="montoPorHora"
            min="0.01"
            step="0.01"
            required
            defaultValue={editingRate?.montoPorHora}
            placeholder="0.00"
            className="w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 pr-16 text-sm text-primary outline-none placeholder:text-on-surface-variant/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            ARS
          </span>
        </div>
        <p className="text-xs leading-5 text-on-surface-variant">
          La tarifa siempre se guarda en pesos argentinos.
        </p>
      </div>

      <input type="hidden" name="moneda" value="ARS" />

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Vigente desde
        </label>
        <input
          type="date"
          name="vigenteDesde"
          required
          defaultValue={editingRate?.vigenteDesde}
          onChange={(event) => setVigenteDesde(event.target.value)}
          className="w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none"
        />
        <p className="text-xs leading-5 text-on-surface-variant">
          Aplica desde esta fecha inclusive.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Vigente hasta
        </label>
        <input
          type="date"
          name="vigenteHasta"
          defaultValue={editingRate?.vigenteHasta ?? ""}
          min={vigenteDesde || undefined}
          className="w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none"
        />
        <p className="text-xs leading-5 text-on-surface-variant">
          Opcional. Si queda vacío, la tarifa sigue vigente hasta nuevo aviso.
        </p>
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Fecha del último aumento
        </label>
        <input
          type="date"
          name="fechaUltimoAumento"
          defaultValue={editingRate?.fechaUltimoAumento ?? ""}
          className="w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none"
        />
        <p className="text-xs leading-5 text-on-surface-variant">
          Solo informativa. No afecta la vigencia de la tarifa.
        </p>
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Observaciones
        </label>
        <textarea
          name="observaciones"
          defaultValue={editingRate?.observaciones ?? ""}
          placeholder="Observaciones"
          className="min-h-24 w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none placeholder:text-on-surface-variant/60"
        />
      </div>

      {mode === "edit" && editingRate ? (
        <div className="md:col-span-2">
          <StatusBadge tone="review">
            Editando tarifa actual de {editingRate.consultoraNombre}
          </StatusBadge>
        </div>
      ) : null}

      <ActionButton
        type="submit"
        variant="primary"
        icon={
          mode === "edit" ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />
        }
        className="justify-center md:col-span-2"
        disabled={pending}
      >
        {pending
          ? "Guardando..."
          : mode === "edit"
            ? "Guardar cambios"
            : "Guardar tarifa"}
      </ActionButton>
    </form>
  );
}
