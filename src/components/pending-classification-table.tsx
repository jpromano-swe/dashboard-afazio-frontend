"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  LoaderCircle,
  Pencil,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  assignExistingCourseAction,
  assignExistingCourseSeriesAction,
  excludeClassificationAction,
} from "@/app/actions";
import {
  findConsultoraIdByName,
  isPendingClassification,
  type ConsultoraResponse,
  type CursoResponse,
} from "@/lib/backend";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/client-toast";
import type { ImportedSession } from "@/lib/data";

type PendingClassificationTableProps = {
  sessions: ImportedSession[];
  consultoras: ConsultoraResponse[];
};

export const PENDING_CLASSIFICATION_COLUMNS =
  "minmax(220px, 1.05fr) minmax(150px, 0.78fr) minmax(76px, 0.38fr) minmax(170px, 0.76fr) minmax(300px, 1.32fr)";

function getCourseLabel(course: CursoResponse) {
  return course.grupo ? `${course.empresa} - ${course.grupo}` : course.empresa;
}

function ClassificationSubmitButtons({
  onSaveSeries,
  onExclude,
  canSubmit,
  canExclude,
  pending,
}: {
  onSaveSeries: () => void | Promise<void>;
  onExclude: () => void | Promise<void>;
  canSubmit: boolean;
  canExclude: boolean;
  pending: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <button
        type="button"
        onClick={onSaveSeries}
        disabled={!canSubmit || pending}
        className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-on-primary transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45 sm:col-span-2"
      >
        {pending ? "Guardando..." : "Guardar serie"}
      </button>
      <button
        type="button"
        onClick={onExclude}
        disabled={!canExclude || pending}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/35 px-3 py-2 text-xs font-semibold text-on-surface-variant transition hover:border-danger/30 hover:bg-danger/5 hover:text-danger disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Trash2 className="h-4 w-4" />
        Excluir ítem
      </button>
    </div>
  );
}

function PendingClassificationRow({
  session,
  consultoras,
  sameTitleIds,
}: {
  session: ImportedSession;
  consultoras: ConsultoraResponse[];
  sameTitleIds: number[];
}) {
  const isUnclassified = isPendingClassification(
    session.sinClasificar,
    session.consultoraNombre,
  );
  const initialConsultoraId = useMemo(() => {
    if (session.consultoraId) {
      return String(session.consultoraId);
    }

    const matchedConsultoraId = findConsultoraIdByName(session.consultoraNombre, consultoras);
    return matchedConsultoraId ? String(matchedConsultoraId) : "";
  }, [consultoras, session.consultoraId, session.consultoraNombre]);
  const [consultoraId, setConsultoraId] = useState(initialConsultoraId);
  const [availableCursos, setAvailableCursos] = useState<CursoResponse[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(
    session.cursoId ? String(session.cursoId) : "",
  );
  const router = useRouter();

  useEffect(() => {
    if (!consultoraId) {
      setAvailableCursos([]);
      setSelectedCourseId("");
      return;
    }

    let cancelled = false;

    async function loadCursos() {
      setLoadingCursos(true);

      try {
        const response = await fetch(`/api/cursos?consultoraId=${consultoraId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar los cursos.");
        }

        const cursos = (await response.json()) as CursoResponse[];

        if (cancelled) {
          return;
        }

        setAvailableCursos(cursos);
      } catch {
        if (!cancelled) {
          setAvailableCursos([]);
          setSelectedCourseId("");
          notifyWarning(
            "No se pudieron cargar los cursos.",
            "Probá nuevamente o revisá la conexión con el backend.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCursos(false);
        }
      }
    }

    void loadCursos();

    return () => {
      cancelled = true;
    };
  }, [consultoraId]);

  useEffect(() => {
    if (
      selectedCourseId &&
      !availableCursos.some((course) => String(course.id) === selectedCourseId)
    ) {
      setSelectedCourseId("");
    }
  }, [availableCursos, selectedCourseId]);

  const selectedCourse = useMemo(
    () =>
      availableCursos.find((course) => String(course.id) === selectedCourseId) ?? null,
    [availableCursos, selectedCourseId],
  );
  const persistedCourseLabel = useMemo(() => {
    if (selectedCourse) {
      return getCourseLabel(selectedCourse);
    }

    const persistedParts = [session.empresa, session.grupo]
      .map((part) => (part ?? "").trim())
      .filter(Boolean);

    return persistedParts.length > 0 ? persistedParts.join(" - ") : "Curso asignado";
  }, [selectedCourse, session.empresa, session.grupo]);

  useEffect(() => {
    if (!consultoraId || selectedCourseId || availableCursos.length === 0) {
      return;
    }

    const persistedEmpresa = (session.empresa ?? "").trim().toLowerCase();
    const persistedGrupo = (session.grupo ?? "").trim().toLowerCase();

    const matchedCourse = availableCursos.find((course) => {
      const courseEmpresa = course.empresa.trim().toLowerCase();
      const courseGrupo = (course.grupo ?? "").trim().toLowerCase();

      if (!persistedEmpresa) {
        return false;
      }

      return courseEmpresa === persistedEmpresa && courseGrupo === persistedGrupo;
    });

    if (matchedCourse) {
      setSelectedCourseId(String(matchedCourse.id));
    }
  }, [availableCursos, consultoraId, selectedCourseId, session.empresa, session.grupo]);

  const hasClassId = Boolean(session.id);
  const canAssignExisting = hasClassId && Boolean(consultoraId) && Boolean(selectedCourseId);
  const canExclude = hasClassId && Boolean(consultoraId);
  const [isEditing, setIsEditing] = useState(!session.cursoId);
  const [savingMode, setSavingMode] = useState<"series" | "exclude" | null>(null);

  async function saveClassification(mode: "series" | "exclude") {
    if (!session.id || !consultoraId) {
      return;
    }

    if (mode !== "exclude" && !selectedCourseId) {
      return;
    }

    setSavingMode(mode);

    try {
      const formData = new FormData();
      const normalizedSameTitleIds = Array.from(
        new Set(sameTitleIds.filter((id) => typeof id === "number" && id > 0)),
      );

      formData.set("classId", String(session.id));
      formData.set("consultoraId", consultoraId);
      formData.set("facturable", mode === "exclude" ? "false" : "true");

      if (mode !== "exclude") {
        formData.set("cursoId", selectedCourseId);
      }

      if (mode === "series") {
        const processed = await assignExistingCourseSeriesAction(formData);

        if (processed <= 1 && normalizedSameTitleIds.length > 1) {
          await Promise.all(
            normalizedSameTitleIds
              .filter((classId) => classId !== session.id)
              .map(async (classId) => {
                const fallbackFormData = new FormData();

                fallbackFormData.set("classId", String(classId));
                fallbackFormData.set("cursoId", selectedCourseId);
                fallbackFormData.set("facturable", "true");

                await assignExistingCourseAction(fallbackFormData);
              }),
          );

          notifyWarning(
            "Serie aplicada con refuerzo local",
            "El backend no propagó toda la serie y se completó sobre las clases visibles.",
          );
        }

        notifySuccess(
          "Clasificación guardada",
          processed > 1
            ? `Se aplicó a ${processed} clases relacionadas.`
            : "Se guardó la clasificación de la clase.",
        );
      } else {
        await excludeClassificationAction(formData);
        notifyWarning("Clase excluida", "La clase quedó marcada como no facturable.");
      }

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      notifyError(error, "No se pudo guardar la clasificación.");
    } finally {
      setSavingMode(null);
    }
  }

  return (
    <div
      className="grid items-start gap-4 px-4 py-5 hover:bg-surface-container-low/60"
      style={{ gridTemplateColumns: PENDING_CLASSIFICATION_COLUMNS }}
    >
      <div className="flex items-start gap-3 pt-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fde9cf] text-[#ad6e24]">
          <MoreHorizontal className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="max-w-[16ch] text-balance text-[clamp(1.02rem,1.35vw,1.18rem)] font-medium leading-tight text-primary">
            {session.title}
          </p>
          <p className="mt-1 max-w-[18ch] text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
            {session.company}
          </p>
        </div>
      </div>

      <div className="max-w-[16ch] pt-1 text-sm leading-6 text-on-surface-variant">
        {session.date}
      </div>
      <div className="pt-1 text-sm text-on-surface-variant">{session.duration}</div>

      <div className="min-w-0 pt-1">
        <p className="max-w-[15ch] text-sm font-medium leading-6 text-primary">
          {session.client}
        </p>
        <p
          className={`mt-1 text-[10px] uppercase tracking-[0.14em] ${
            session.issue ? "text-danger" : "text-on-surface-variant"
          }`}
        >
          {isUnclassified ? "Sin clasificar" : session.consultoraNombre ?? "Sin consultora"}
        </p>
        {isUnclassified ? (
          <p className="mt-1 max-w-[18ch] text-[10px] font-medium leading-5 text-on-surface-variant/70">
            Elegí una consultora activa antes de guardar.
          </p>
        ) : null}
      </div>

      <div className="min-w-0 pt-1">
        {isEditing ? (
          <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-2.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                {selectedCourse ? "Editar asignación" : "Asignar curso"}
              </p>
              {selectedCourse ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant transition hover:bg-surface-container-high"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Contraer
                </button>
              ) : null}
            </div>

            <div className="mt-3 grid gap-2.5 xl:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Consultora
                </span>
                <select
                  name="consultoraId"
                  required
                  value={consultoraId}
                  onChange={(event) => {
                    setConsultoraId(event.target.value);
                    setSelectedCourseId("");
                    setIsEditing(true);
                  }}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface px-2.5 py-2 text-xs text-primary outline-none"
                >
                  <option value="">Seleccioná una consultora</option>
                  {consultoras.map((consultora) => (
                    <option key={consultora.id} value={consultora.id}>
                      {consultora.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  <span>Curso existente</span>
                  {loadingCursos ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin text-on-surface-variant" />
                  ) : null}
                </span>
                <select
                  name="cursoId"
                  value={selectedCourseId}
                  onChange={(event) => setSelectedCourseId(event.target.value)}
                  disabled={!consultoraId || loadingCursos}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface px-2.5 py-2 text-xs text-primary outline-none disabled:opacity-60"
                >
                  <option value="">Elegí un curso existente</option>
                  {availableCursos.map((course) => (
                    <option key={course.id} value={course.id}>
                      {getCourseLabel(course)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedCourse ? (
              <div className="mt-3 rounded-xl bg-secondary-container/70 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] text-on-secondary-container">
                <p className="font-bold">Usando un curso del catálogo</p>
                <p className="mt-1 text-[11px] leading-4 normal-case tracking-normal">
                  {getCourseLabel(selectedCourse)}
                </p>
              </div>
            ) : (
              <div className="mt-3 rounded-xl bg-surface-container-low px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
                <p className="font-bold">Elegí un curso existente</p>
                <p className="mt-1 text-[11px] leading-4 normal-case tracking-normal">
                  Elegí una consultora y después uno de sus cursos activos.
                </p>
              </div>
            )}

            <div className="mt-3 rounded-xl border border-outline-variant/25 bg-surface-container-low px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                    Guardar clasificación
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-on-surface-variant">
                    El cambio se aplica a todas las clases con este mismo nombre.
                  </p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-3">
                <ClassificationSubmitButtons
                  onSaveSeries={() => saveClassification("series")}
                  onExclude={() => saveClassification("exclude")}
                  canSubmit={canAssignExisting}
                  canExclude={canExclude}
                  pending={savingMode !== null}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-outline-variant/25 bg-secondary-container/50 px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-secondary-container/80">
                  Curso asignado
                </p>
                <p className="mt-1 font-medium text-primary">{persistedCourseLabel}</p>
                <p className="mt-1 text-[11px] text-on-surface-variant">
                  {selectedCourse
                    ? `Consultora: ${selectedCourse.consultoraNombre}`
                    : "Clasificación guardada"}
              </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/30 bg-surface text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
                aria-label="Editar clasificación"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PendingClassificationTable({
  sessions,
  consultoras,
}: PendingClassificationTableProps) {
  const sameTitleIdsByKey = useMemo(() => {
    const groups = new Map<string, number[]>();

    sessions.forEach((session) => {
      if (!session.id) {
        return;
      }

      const key = session.title.trim().toLowerCase();
      const group = groups.get(key) ?? [];
      group.push(session.id);
      groups.set(key, group);
    });

    return groups;
  }, [sessions]);

  return (
    <div className="divide-y divide-outline-variant/15">
      {sessions.map((session) => (
        <PendingClassificationRow
          key={session.id ?? session.googleEventId ?? `${session.title}-${session.date}`}
          session={session}
          consultoras={consultoras}
          sameTitleIds={sameTitleIdsByKey.get(session.title.trim().toLowerCase()) ?? []}
        />
      ))}
    </div>
  );
}
