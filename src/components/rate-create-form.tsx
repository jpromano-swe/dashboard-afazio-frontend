"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { createRateAction, type MutationActionState } from "@/app/actions";
import { ActionButton } from "@/components/editorial";
import type { ConsultoraResponse } from "@/lib/backend";
import { notifyError, notifySuccess } from "@/lib/client-toast";

type RateCreateFormProps = {
  activeConsultoras: ConsultoraResponse[];
  onSuccess?: () => void;
};

const INITIAL_STATE: MutationActionState = {
  status: "idle",
  message: null,
};

export function RateCreateForm({ activeConsultoras, onSuccess }: RateCreateFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createRateAction, INITIAL_STATE);

  useEffect(() => {
    if (state.status === "success") {
      notifySuccess("Tarifa guardada", state.message);
      formRef.current?.reset();
      onSuccess?.();
      return;
    }

    if (state.status === "error") {
      notifyError(state.message ?? "No se pudo crear la tarifa.");
    }
  }, [onSuccess, state]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Consultora
        </label>
        {activeConsultoras.length > 0 ? (
          <select
            name="consultoraId"
            required
            defaultValue=""
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
            placeholder="ID de consultora"
            className="w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none placeholder:text-on-surface-variant/60"
          />
        )}
        <p className="text-xs leading-5 text-on-surface-variant">
          Elegí la consultora activa que tendrá esta tarifa.
        </p>
      </div>

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
          placeholder="Observaciones"
          className="min-h-24 w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none placeholder:text-on-surface-variant/60"
        />
      </div>

      <ActionButton
        type="submit"
        variant="primary"
        icon={<Plus className="h-4 w-4" />}
        className="justify-center md:col-span-2"
        disabled={pending}
      >
        {pending ? "Guardando..." : "Guardar tarifa"}
      </ActionButton>
    </form>
  );
}
