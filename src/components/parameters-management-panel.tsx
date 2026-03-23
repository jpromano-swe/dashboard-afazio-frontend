"use client";

import { useState, type ReactNode } from "react";
import { CirclePlus, Building2, X } from "lucide-react";
import {
  createConsultoraAction,
  createCourseAction,
} from "@/app/actions";
import { ActionButton } from "@/components/editorial";
import { type ConsultoraResponse } from "@/lib/backend";

type ParametersManagementPanelProps = {
  consultoras: ConsultoraResponse[];
  backendUnavailable: boolean;
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
        className="w-full max-w-[430px] rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
              Consultoras
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

export function ParametersManagementPanel({
  consultoras,
  backendUnavailable,
}: ParametersManagementPanelProps) {
  const [openConsultora, setOpenConsultora] = useState(false);
  const [openCourse, setOpenCourse] = useState(false);
  const activeConsultoras = consultoras.filter((consultora) => consultora.activa);

  return (
    <>
      <div className="mt-8 space-y-4">
        <button
          type="button"
          onClick={() => setOpenConsultora(true)}
          disabled={backendUnavailable}
          className="group flex min-h-[160px] w-full flex-col justify-between rounded-[1.4rem] border border-outline-variant/20 bg-surface-container-low px-6 py-6 text-left transition hover:-translate-y-0.5 hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-55"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/70">
              Agregar consultora
            </p>
            <h3 className="mt-4 font-headline text-4xl font-bold text-primary">
              Agregar Consultora
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-on-surface-variant">
              Creá una nueva consultora con su indicador de reporte y notas descriptivas.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setOpenCourse(true)}
          disabled={backendUnavailable}
          className="group flex min-h-[160px] w-full flex-col justify-between rounded-[1.4rem] border border-outline-variant/20 bg-surface-container-low px-6 py-6 text-left transition hover:-translate-y-0.5 hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-55"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/70">
              Agregar curso
            </p>
            <h3 className="mt-4 font-headline text-4xl font-bold text-primary">
              Agregar Curso
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-on-surface-variant">
              Elegí una consultora existente y luego agregá un curso con empresa y grupo.
            </p>
          </div>
        </button>
      </div>

      <Modal
        open={openConsultora}
        title="Nueva consultora"
        subtitle="Escribe directamente en `POST /api/consultoras`."
        onClose={() => setOpenConsultora(false)}
      >
        <form action={createConsultoraAction} className="space-y-4">
          <div>
            <label
              htmlFor="consultora-nombre"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant"
            >
              Nombre
            </label>
            <input
              id="consultora-nombre"
              name="nombre"
              required
              placeholder="Nombre de la consultora"
              className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none placeholder:text-on-surface-variant/60"
            />
          </div>

          <div>
            <label
              htmlFor="consultora-descripcion"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant"
            >
              Descripción
            </label>
            <textarea
              id="consultora-descripcion"
              name="descripcion"
              placeholder="Consultora / división / notas operativas"
              className="mt-2 min-h-28 w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none placeholder:text-on-surface-variant/60"
            />
          </div>

          <label className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                Reporte en Excel
              </span>
              <span className="mt-1 block text-sm text-on-surface-variant">
                Habilita esta consultora para exportes XLSX.
              </span>
            </span>
            <input
              type="checkbox"
              name="requiereReporteExcel"
              value="true"
              className="h-4 w-4 rounded-sm border-outline-variant text-primary"
            />
          </label>

          <ActionButton
            type="submit"
            variant="primary"
            icon={<CirclePlus className="h-4 w-4" />}
            disabled={backendUnavailable}
            className="w-full justify-center"
          >
            Crear consultora
          </ActionButton>
        </form>
      </Modal>

      <Modal
        open={openCourse}
        title="Nuevo curso"
        subtitle="Elegí una consultora activa y luego creá un curso con empresa y grupo."
        onClose={() => setOpenCourse(false)}
      >
        <form action={createCourseAction} className="space-y-4">
          <div>
            <label
              htmlFor="course-consultora"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant"
            >
              Consultora
            </label>
            <select
              id="course-consultora"
              name="consultoraId"
              required
              defaultValue=""
              disabled={backendUnavailable || activeConsultoras.length === 0}
              className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none disabled:opacity-60"
            >
              <option value="">Seleccioná una consultora</option>
              {activeConsultoras.map((consultora) => (
                <option key={consultora.id} value={consultora.id}>
                  {consultora.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="course-empresa"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant"
            >
              Empresa
            </label>
            <input
              id="course-empresa"
              name="empresa"
              required
              placeholder="Empresa"
              className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none placeholder:text-on-surface-variant/60"
            />
          </div>

          <div>
            <label
              htmlFor="course-grupo"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant"
            >
              Grupo
            </label>
            <input
              id="course-grupo"
              name="grupo"
              placeholder="Grupo"
              className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none placeholder:text-on-surface-variant/60"
            />
          </div>

          <div className="rounded-xl bg-surface-container-low px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              El curso queda persistido
            </p>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              La consultora se deriva del curso seleccionado después de guardar.
            </p>
          </div>

          <ActionButton
            type="submit"
            variant="primary"
            icon={<Building2 className="h-4 w-4" />}
            disabled={backendUnavailable || activeConsultoras.length === 0}
            className="w-full justify-center"
          >
            Crear curso
          </ActionButton>
        </form>
      </Modal>
    </>
  );
}
