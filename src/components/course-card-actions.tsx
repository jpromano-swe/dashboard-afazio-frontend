"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { updateCourseAction, type MutationActionState } from "@/app/actions";
import { type ConsultoraResponse, type CursoResponse } from "@/lib/backend";
import { ActionButton, StatusBadge } from "@/components/editorial";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/client-toast";

type CourseCardActionsProps = {
  curso: CursoResponse;
  consultoras: ConsultoraResponse[];
  backendUnavailable: boolean;
};

const INITIAL_MUTATION_STATE: MutationActionState = {
  status: "idle",
  message: null,
};

function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 px-4 py-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[460px] rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
              Curso
            </p>
            <h3 className="mt-3 font-headline text-4xl font-bold text-primary">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-outline-variant/30 p-2 text-on-surface-variant transition hover:bg-surface-container-high"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function CourseCardActions({
  curso,
  consultoras,
  backendUnavailable,
}: CourseCardActionsProps) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    startTransition(async () => {
      const state = await updateCourseAction(
        INITIAL_MUTATION_STATE,
        new FormData(form),
      );

      if (state.status === "success") {
        notifySuccess("Curso actualizado", state.message);
        setOpenEdit(false);
        return;
      }

      notifyError(state.message ?? "No se pudo actualizar el curso.");
    });
  }

  return (
    <>
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpenEdit(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 bg-surface text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
          aria-label={`Editar curso ${curso.id}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setOpenDelete(true);
            notifyWarning(
              "El borrado de cursos todavía no está disponible.",
              "El backend aún no expone DELETE /api/cursos/{id}.",
            );
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 bg-surface text-on-surface-variant transition hover:bg-[#ffe5e5] hover:text-[#b42318]"
          aria-label={`Eliminar curso ${curso.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <Modal
        open={openEdit}
        title="Editar curso"
        subtitle="Actualizá la consultora, empresa, grupo o el estado activo de este curso."
        onClose={() => setOpenEdit(false)}
      >
        <form
          onSubmit={handleUpdateSubmit}
          className="space-y-4"
        >
          <input type="hidden" name="cursoId" value={curso.id} />
          <div>
            <label
              htmlFor={`course-edit-consultora-${curso.id}`}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant"
            >
              Consultora
            </label>
            <select
              id={`course-edit-consultora-${curso.id}`}
              name="consultoraId"
              defaultValue={curso.consultoraId}
              disabled={backendUnavailable || consultoras.length === 0}
              className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none disabled:opacity-60"
            >
              {consultoras.map((consultora) => (
                <option key={consultora.id} value={consultora.id}>
                  {consultora.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`course-edit-empresa-${curso.id}`}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant"
            >
              Empresa
            </label>
            <input
              id={`course-edit-empresa-${curso.id}`}
              name="empresa"
              defaultValue={curso.empresa}
              className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none"
            />
          </div>

          <div>
            <label
              htmlFor={`course-edit-grupo-${curso.id}`}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant"
            >
              Grupo
            </label>
            <input
              id={`course-edit-grupo-${curso.id}`}
              name="grupo"
              defaultValue={curso.grupo ?? ""}
              className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none"
            />
          </div>

          <label className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                Activo
                </span>
                <span className="mt-1 block text-sm text-on-surface-variant">
                Mantené el curso disponible para clasificar clases pendientes.
                </span>
              </span>
            <input
              type="checkbox"
              name="activa"
              defaultChecked={curso.activa}
              value="true"
              className="h-4 w-4 rounded-sm border-outline-variant text-primary"
            />
          </label>

          <div className="rounded-xl bg-surface-container-low px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Fuente de verdad del curso
            </p>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              Editar este curso actualiza el registro y mantiene consistentes las
              clases vinculadas.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <StatusBadge tone="confirmed">PUT /api/cursos/{curso.id}</StatusBadge>
            <ActionButton
              type="submit"
              variant="primary"
              icon={<Pencil className="h-4 w-4" />}
              className="justify-center"
              disabled={backendUnavailable || consultoras.length === 0 || pending}
            >
              {pending ? "Guardando..." : "Guardar cambios"}
            </ActionButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={openDelete}
        title="Eliminar curso"
        subtitle="La eliminación todavía no está conectada porque el backend no expone un endpoint de borrado."
        onClose={() => setOpenDelete(false)}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-outline-variant/45 bg-surface-container-low px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Curso #{curso.id}
            </p>
            <p className="mt-2 text-sm font-semibold text-primary">
              {curso.empresa}
              {curso.grupo ? ` - ${curso.grupo}` : ""}
            </p>
          </div>

          <p className="text-sm leading-6 text-on-surface-variant">
            Puedo conectar una confirmación destructiva cuando el backend exponga
            <code className="font-mono">DELETE /api/cursos/:id</code>.
          </p>

          <div className="flex items-center justify-between gap-3">
            <StatusBadge tone="danger">Contrato pendiente</StatusBadge>
            <button
              type="button"
              disabled
              className="rounded-full bg-[#b42318]/20 px-5 py-3 text-sm font-semibold text-[#b42318]/60"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
