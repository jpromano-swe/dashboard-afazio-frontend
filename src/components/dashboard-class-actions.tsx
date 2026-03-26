"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  MoreVertical,
  TriangleAlert,
} from "lucide-react";
import {
  markAllClassesTaughtAction,
  markClassAsTaughtAction,
  updateClassStatusAction,
} from "@/app/actions";
import type { ClaseEstadoDestino } from "@/lib/backend";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/client-toast";

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

const DARK_ACTION_BUTTON =
  "!bg-[#1f2924] !text-[#f8f4ec] hover:!bg-[#0f1713] hover:scale-[1.03] shadow-[0_14px_28px_rgba(8,18,12,0.18)]";

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
    <div
      className="fixed inset-0 z-[1200] grid place-items-center bg-surface/55 px-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[32rem] overflow-hidden rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest shadow-[0_30px_90px_rgba(6,27,14,0.22)]"
        onClick={(event) => event.stopPropagation()}
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
      notifySuccess(
        classIds.length === 1 ? "Clase actualizada" : "Clases actualizadas",
        `${classIds.length} ${classIds.length === 1 ? "clase marcada" : "clases marcadas"} como dictadas.`,
      );
    } catch (error) {
      notifyError(error, "No se pudieron marcar las clases como dictadas.");
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
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition disabled:pointer-events-none disabled:opacity-55 ${DARK_ACTION_BUTTON}`}
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const confirmation = selectedStatus
    ? getStatusConfirmation(selectedStatus, classTitle)
    : null;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

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
        notifySuccess("Clase marcada como dictada", classTitle);
      } else {
        formData.set("estado", selectedStatus);
        await updateClassStatusAction(formData);
        if (selectedStatus === "REPROGRAMADA") {
          notifyWarning("Clase reprogramada", classTitle);
        } else {
          notifyWarning("Clase cancelada", classTitle);
        }
      }

      setSelectedStatus(null);
    } catch (error) {
      notifyError(error, "No se pudo actualizar el estado de la clase.");
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
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition disabled:opacity-45 ${DARK_ACTION_BUTTON}`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Marcar como dictada
        </button>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            disabled={pending}
            aria-label="Más acciones"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/35 bg-surface text-on-surface-variant transition hover:bg-surface-container-high disabled:opacity-45"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-11 z-20 min-w-[180px] rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-2 shadow-[0_20px_40px_rgba(6,27,14,0.12)]">
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("REPROGRAMADA");
                  setMenuOpen(false);
                }}
                disabled={pending}
                className="flex w-full items-center rounded-xl px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8f5a16] transition hover:bg-[#fde9cf] disabled:opacity-45"
              >
                Reprogramar
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("CANCELADA");
                  setMenuOpen(false);
                }}
                disabled={pending}
                className="mt-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-danger transition hover:bg-[#ffdad6] disabled:opacity-45"
              >
                Cancelar
              </button>
            </div>
          ) : null}
        </div>
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
