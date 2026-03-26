"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, LoaderCircle, Pencil } from "lucide-react";
import {
  assignExistingCourseAction,
  assignExistingCourseSeriesAction,
  markClassAsTaughtAction,
  updateClassStatusAction,
} from "@/app/actions";
import { StatusBadge } from "@/components/editorial";
import {
  findConsultoraIdByName,
  isPendingClassification,
  type ConsultoraResponse,
  type ClaseDelDiaResponse,
  type CursoResponse,
} from "@/lib/backend";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/client-toast";

function getCourseLabel(course: CursoResponse) {
  return course.grupo ? `${course.empresa} - ${course.grupo}` : course.empresa;
}

function MigrationSubmitButtons({
  canSubmit,
  onSaveSeries,
  pending,
}: {
  canSubmit: boolean;
  onSaveSeries: () => void | Promise<void>;
  pending: boolean;
}) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onSaveSeries}
        disabled={!canSubmit || pending}
        className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-on-primary transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {pending ? "Guardando..." : "Guardar y aplicar al mismo nombre"}
      </button>
    </div>
  );
}

export function MigrationClassRow({
  clase,
  consultoras,
  sameTitleIds,
}: {
  clase: ClaseDelDiaResponse;
  consultoras: ConsultoraResponse[];
  sameTitleIds: number[];
}) {
  const [consultoraId, setConsultoraId] = useState("");
  const [availableCursos, setAvailableCursos] = useState<CursoResponse[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [facturable, setFacturable] = useState(true);
  const router = useRouter();

  const isUnclassified = isPendingClassification(
    clase.sinClasificar,
    clase.consultoraNombre,
  );
  const initialConsultoraId = useMemo(() => {
    const matchedConsultoraId = findConsultoraIdByName(clase.consultoraNombre, consultoras);
    return matchedConsultoraId ? String(matchedConsultoraId) : "";
  }, [clase.consultoraNombre, consultoras]);

  useEffect(() => {
    if (!consultoraId && initialConsultoraId) {
      setConsultoraId(initialConsultoraId);
    }
  }, [consultoraId, initialConsultoraId]);

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

        if (!cancelled) {
          setAvailableCursos(cursos);
        }
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

  useEffect(() => {
    if (!consultoraId || selectedCourseId || availableCursos.length === 0) {
      return;
    }

    const persistedEmpresa = (clase.empresa ?? "").trim().toLowerCase();
    const persistedGrupo = (clase.grupo ?? "").trim().toLowerCase();

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
  }, [availableCursos, clase.empresa, clase.grupo, consultoraId, selectedCourseId]);

  const selectedCourse = useMemo(
    () =>
      availableCursos.find((course) => String(course.id) === selectedCourseId) ?? null,
    [availableCursos, selectedCourseId],
  );
  const persistedCourseLabel = useMemo(() => {
    if (selectedCourse) {
      return getCourseLabel(selectedCourse);
    }

    const persistedParts = [clase.empresa, clase.grupo]
      .map((part) => (part ?? "").trim())
      .filter(Boolean);

    return persistedParts.length > 0 ? persistedParts.join(" - ") : "Curso asignado";
  }, [clase.empresa, clase.grupo, selectedCourse]);

  const [isEditing, setIsEditing] = useState(isUnclassified);
  const [savingMode, setSavingMode] = useState<"series" | null>(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const canAssignExisting = Boolean(consultoraId) && Boolean(selectedCourseId);

  async function updateInlineStatus(nextStatus: "DICTADA" | "CANCELADA" | "REPROGRAMADA") {
    setStatusUpdating(true);

    try {
      const formData = new FormData();
      formData.set("classId", String(clase.id));

      if (nextStatus === "DICTADA") {
        await markClassAsTaughtAction(formData);
      } else {
        formData.set("estado", nextStatus);
        await updateClassStatusAction(formData);
      }

      notifySuccess("Estado actualizado", `La clase quedó marcada como ${nextStatus.toLowerCase()}.`);
      setStatusMenuOpen(false);
      router.refresh();
    } catch (error) {
      notifyError(error, "No se pudo actualizar el estado.");
    } finally {
      setStatusUpdating(false);
    }
  }

  async function saveClassification(mode: "series") {
    if (!clase.id || !consultoraId || !selectedCourseId) {
      return;
    }

    setSavingMode(mode);

    try {
      const formData = new FormData();
      const normalizedSameTitleIds = Array.from(
        new Set(sameTitleIds.filter((id) => typeof id === "number" && id > 0)),
      );

      formData.set("classId", String(clase.id));
      formData.set("consultoraId", consultoraId);
      formData.set("cursoId", selectedCourseId);
      formData.set("facturable", String(facturable));

      const processed = await assignExistingCourseSeriesAction(formData);

      if (processed <= 1 && normalizedSameTitleIds.length > 1) {
        await Promise.all(
          normalizedSameTitleIds
            .filter((classId) => classId !== clase.id)
            .map(async (classId) => {
              const fallbackFormData = new FormData();

              fallbackFormData.set("classId", String(classId));
              fallbackFormData.set("cursoId", String(selectedCourseId));
              fallbackFormData.set("facturable", String(facturable));

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
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      notifyError(error, "No se pudo guardar la clasificación.");
    } finally {
      setSavingMode(null);
    }
  }

  return (
    <tr className="hover:bg-surface-container-low/60">
      <td className="px-6 py-5 font-headline text-lg text-primary">
        {new Intl.DateTimeFormat("es-AR", {
          timeZone: "America/Argentina/Buenos_Aires",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(clase.fechaInicio))}
      </td>
      <td className="px-6 py-5">
        <p className="font-semibold text-primary">{clase.titulo}</p>
        {clase.estado === "PROGRAMADA" && clase.meetingUrl ? (
          <a
            href={clase.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex text-[11px] font-bold uppercase tracking-[0.16em] text-primary hover:opacity-80"
          >
            Unirse
          </a>
        ) : null}
      </td>
      <td className="px-6 py-5">
        {isEditing ? (
          <div className="space-y-2">
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

            <select
              name="consultoraId"
              required
              value={consultoraId}
              onChange={(event) => {
                setConsultoraId(event.target.value);
                setSelectedCourseId("");
                setIsEditing(true);
              }}
              className="w-full rounded-xl border border-outline-variant/40 bg-surface px-3 py-2 text-xs text-primary outline-none"
            >
              <option value="">Seleccioná una consultora</option>
              {consultoras.map((consultora) => (
                <option key={consultora.id} value={consultora.id}>
                  {consultora.nombre}
                </option>
              ))}
            </select>

            <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Curso existente
                </p>
                {loadingCursos ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin text-on-surface-variant" />
                ) : null}
              </div>
              <select
                name="cursoId"
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                disabled={!consultoraId || loadingCursos}
                className="mt-2 w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-xs text-primary outline-none disabled:opacity-60"
              >
                <option value="">Elegí un curso existente</option>
                {availableCursos.map((course) => (
                  <option key={course.id} value={course.id}>
                    {getCourseLabel(course)}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse ? (
              <div className="rounded-xl bg-secondary-container/70 px-3 py-3 text-[10px] uppercase tracking-[0.16em] text-on-secondary-container">
                <p className="font-bold">Usando un curso del catálogo</p>
                <p className="mt-1 text-[11px] normal-case tracking-normal">
                  {getCourseLabel(selectedCourse)}
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-surface-container-low px-3 py-3 text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
                <p className="font-bold">Elegí un curso existente</p>
                <p className="mt-1 text-[11px] normal-case tracking-normal">
                  Seleccioná una consultora y luego elegí uno de sus cursos activos.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/25 bg-surface-container-low px-3 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Facturable
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Persisted as part of the class classification.
                </p>
              </div>
              <input
                type="checkbox"
                checked={facturable}
                onChange={(event) => setFacturable(event.target.checked)}
                className="h-4 w-4 rounded-sm border-outline-variant text-primary"
              />
            </div>

            <div className="space-y-2 rounded-xl border border-outline-variant/25 bg-surface-container-low px-3 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Guardar clasificación
                </p>
                <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                  Guardá solo esta clase o aplicá el mismo curso a la serie repetida.
                </p>
              </div>
              <MigrationSubmitButtons
                canSubmit={canAssignExisting}
                onSaveSeries={() => saveClassification("series")}
                pending={savingMode !== null}
              />
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
                    : clase.consultoraNombre && !isUnclassified
                      ? `Consultora: ${clase.consultoraNombre}`
                      : "Clasificación guardada"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/30 bg-surface text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
                aria-label="Edit classification"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </td>
      <td className="px-6 py-5">
        {clase.estado === "PROGRAMADA" ? (
          <div className="relative inline-flex">
            <button
              type="button"
              onClick={() => setStatusMenuOpen((value) => !value)}
              className="rounded-full"
              disabled={statusUpdating}
            >
              <StatusBadge tone={isUnclassified ? "review" : "confirmed"}>
                {statusUpdating ? "Actualizando..." : isUnclassified ? "Sin clasificar" : "Programada"}
              </StatusBadge>
            </button>

            {statusMenuOpen ? (
              <div className="absolute left-0 top-[calc(100%+0.5rem)] z-10 min-w-48 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-2 shadow-[0_20px_40px_rgba(6,27,14,0.12)]">
                <button
                  type="button"
                  onClick={() => updateInlineStatus("DICTADA")}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-primary transition hover:bg-surface-container-high"
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar como dictada
                </button>
                <button
                  type="button"
                  onClick={() => updateInlineStatus("REPROGRAMADA")}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-primary transition hover:bg-surface-container-high"
                >
                  Reprogramar
                </button>
                <button
                  type="button"
                  onClick={() => updateInlineStatus("CANCELADA")}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-danger transition hover:bg-danger/5"
                >
                  Cancelar
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <StatusBadge
            tone={
              isUnclassified
                ? "review"
                : clase.estado === "DICTADA"
                  ? "billable"
                  : clase.estado === "CANCELADA"
                    ? "danger"
                    : clase.estado === "REPROGRAMADA"
                      ? "review"
                      : "confirmed"
            }
          >
            {isUnclassified ? "Sin clasificar" : clase.estado}
          </StatusBadge>
        )}
      </td>
      <td className="px-6 py-5 text-right">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/60">
          {clase.estado === "PROGRAMADA" ? "Tocá el estado para editar" : clase.estado}
        </span>
      </td>
    </tr>
  );
}
