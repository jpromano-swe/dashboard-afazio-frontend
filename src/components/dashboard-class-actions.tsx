"use client";

import { useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  TriangleAlert,
} from "lucide-react";
import {
  markAllClassesTaughtAction,
  markClassAsTaughtAction,
  updateClassStatusAction,
} from "@/app/actions";
import type { ClaseEstadoDestino } from "@/lib/backend";

type ConfirmationConfig = {
  title: string;
  description: string;
  confirmLabel: string;
  tone: "primary" | "warning" | "danger";
  icon: typeof CheckCircle2;
};

const TONE_STYLES = {
  primary: {
    trigger:
      "text-primary hover:bg-surface-container-high",
    confirm:
      "bg-primary text-on-primary hover:opacity-95",
    accent: "bg-primary/85",
  },
  warning: {
    trigger:
      "text-[#8f5a16] hover:bg-[#fde9cf]",
    confirm:
      "bg-[#c28532] text-white hover:opacity-95",
    accent: "bg-[#c28532]/85",
  },
  danger: {
    trigger:
      "text-danger hover:bg-[#ffdad6]",
    confirm:
      "bg-danger text-white hover:opacity-95",
    accent: "bg-danger/85",
  },
} as const;

function getStatusConfirmation(
  status: ClaseEstadoDestino,
  classTitle: string,
): ConfirmationConfig {
  if (status === "DICTADA") {
    return {
      title: "¿Marcar como dictada?",
      description: `Esto marcará "${classTitle}" como dictada. Todavía podés seguir editando antes de guardar.`,
      confirmLabel: "Confirmar dictada",
      tone: "primary",
      icon: CheckCircle2,
    };
  }

  if (status === "REPROGRAMADA") {
    return {
      title: "¿Reprogramar clase?",
      description: `Esto marcará "${classTitle}" como reprogramada.`,
      confirmLabel: "Confirmar reprogramación",
      tone: "warning",
      icon: CalendarClock,
    };
  }

  return {
    title: "¿Cancelar clase?",
    description: `Esto marcará "${classTitle}" como cancelada.`,
    confirmLabel: "Confirmar cancelación",
    tone: "danger",
    icon: TriangleAlert,
  };
}

function ConfirmationModal({
  open,
  pending,
  title,
  description,
  confirmLabel,
  tone,
  icon: Icon,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  pending: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone: "primary" | "warning" | "danger";
  icon: typeof CheckCircle2;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1200] grid place-items-center bg-surface/55 px-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[32rem] overflow-hidden rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest shadow-[0_30px_90px_rgba(6,27,14,0.22)]"
      >
        <div className={`h-1.5 w-full ${TONE_STYLES[tone].accent}`} />
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${TONE_STYLES[tone].confirm}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                Confirmación
              </p>
              <h3 className="mt-1 font-headline text-2xl font-bold leading-tight text-primary sm:text-[2rem]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="rounded-xl border border-outline-variant/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant transition hover:bg-surface-container-high disabled:opacity-45"
            >
              Seguir editando
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              className={`rounded-xl px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition disabled:opacity-45 ${TONE_STYLES[tone].confirm}`}
            >
              {pending ? "Guardando..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BulkTaughtAction({
  classIds,
}: {
  classIds: number[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);

    try {
      const formData = new FormData();

      classIds.forEach((classId) => formData.append("classId", String(classId)));

      await markAllClassesTaughtAction(formData);
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={classIds.length === 0 || pending}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-primary shadow-[0_16px_28px_rgb(6_27_14_/_0.14)] transition hover:opacity-92 disabled:pointer-events-none disabled:opacity-55"
      >
        Marcar todas como dictadas
      </button>

      <ConfirmationModal
        open={open}
        pending={pending}
        title="¿Marcar todas como dictadas?"
        description={`Esto marcará ${classIds.length} ${classIds.length === 1 ? "clase programada" : "clases programadas"} como dictadas.`}
        confirmLabel="Confirmar todo"
        tone="primary"
        icon={CheckCircle2}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export function ScheduleStatusActions({
  classId,
  classTitle,
}: {
  classId: number;
  classTitle: string;
}) {
  const [selectedStatus, setSelectedStatus] = useState<ClaseEstadoDestino | null>(null);
  const [pending, setPending] = useState(false);

  const confirmation = selectedStatus
    ? getStatusConfirmation(selectedStatus, classTitle)
    : null;

  async function handleConfirm() {
    if (!selectedStatus) {
      return;
    }

    setPending(true);

    try {
      const formData = new FormData();

      formData.set("classId", String(classId));

      if (selectedStatus === "DICTADA") {
        await markClassAsTaughtAction(formData);
      } else {
        formData.set("estado", selectedStatus);
        await updateClassStatusAction(formData);
      }

      setSelectedStatus(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => setSelectedStatus("DICTADA")}
          disabled={pending}
          className={`rounded-xl px-0 py-0 text-[11px] font-bold uppercase tracking-[0.18em] transition disabled:opacity-45 ${TONE_STYLES.primary.trigger}`}
        >
          Marcar como dictada
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus("REPROGRAMADA")}
          disabled={pending}
          className={`rounded-xl px-0 py-0 text-[11px] font-bold uppercase tracking-[0.18em] transition disabled:opacity-45 ${TONE_STYLES.warning.trigger}`}
        >
          Reprogramar
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus("CANCELADA")}
          disabled={pending}
          className={`rounded-xl px-0 py-0 text-[11px] font-bold uppercase tracking-[0.18em] transition disabled:opacity-45 ${TONE_STYLES.danger.trigger}`}
        >
          Cancelar
        </button>
      </div>

      <ConfirmationModal
        open={Boolean(confirmation)}
        pending={pending}
        title={confirmation?.title ?? ""}
        description={confirmation?.description ?? ""}
        confirmLabel={confirmation?.confirmLabel ?? "Confirm"}
        tone={confirmation?.tone ?? "primary"}
        icon={confirmation?.icon ?? CheckCircle2}
        onCancel={() => setSelectedStatus(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
