"use server";

import { revalidatePath } from "next/cache";
import {
  actualizarClasificacionClase,
  actualizarClasificacionClaseMismoTitulo,
  actualizarEstadoClase,
  actualizarCurso,
  crearConsultora,
  crearCurso,
  crearTarifa,
  marcarClaseDictada,
  marcarAsistencia,
  type AsistenciaEstado,
  type ClaseEstadoDestino,
} from "@/lib/backend";

const ATTENDANCE_STATES = new Set<AsistenciaEstado>([
  "PENDIENTE",
  "ASISTIO",
  "AUSENTE",
  "REPROGRAMADA",
]);

const CLASS_STATUS_UPDATES = new Set<ClaseEstadoDestino>([
  "CANCELADA",
  "REPROGRAMADA",
]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getNullableString(formData: FormData, key: string) {
  const value = getString(formData, key);

  return value ? value : null;
}

function getRequiredNumber(formData: FormData, key: string) {
  const value = Number(getString(formData, key));

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${key} must be a positive number.`);
  }

  return value;
}

function getBoolean(formData: FormData, key: string) {
  const value = getString(formData, key).toLowerCase();

  return value === "true" || value === "1" || value === "on";
}

function isNoPendingRelatedClassesError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";

  return message.includes("No hay clases pendientes relacionadas");
}

function revalidateOperationalViews() {
  revalidatePath("/dashboard");
  revalidatePath("/inbox");
  revalidatePath("/rates");
  revalidatePath("/income");
  revalidatePath("/migration");
  revalidatePath("/reports");
  revalidatePath("/parameters");
}

export type RateActionState = {
  error: string | null;
  success: string | null;
};

function getActionErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "").trim();

    if (message) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "No se pudo crear la tarifa.";
}

export async function markAttendanceAction(formData: FormData) {
  const claseId = getRequiredNumber(formData, "classId");
  const estado = getString(formData, "estado") as AsistenciaEstado;

  if (!ATTENDANCE_STATES.has(estado)) {
    throw new Error("Estado de asistencia inválido.");
  }

  await marcarAsistencia({
    claseId,
    estado,
    observacion: getNullableString(formData, "observacion"),
  });

  revalidateOperationalViews();
}

export async function markAllAttendanceAction(formData: FormData) {
  const classIds = formData
    .getAll("classId")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  await Promise.all(
    classIds.map((claseId) =>
      marcarAsistencia({
        claseId,
        estado: "ASISTIO",
        observacion: null,
      }),
    ),
  );

  revalidateOperationalViews();
}

export async function updateClassStatusAction(formData: FormData) {
  const claseId = getRequiredNumber(formData, "classId");
  const estado = getString(formData, "estado") as ClaseEstadoDestino;

  if (!CLASS_STATUS_UPDATES.has(estado)) {
    throw new Error("Transición de estado de clase inválida.");
  }

  await actualizarEstadoClase(claseId, { estado });

  revalidateOperationalViews();
}

export async function markClassAsTaughtAction(formData: FormData) {
  const claseId = getRequiredNumber(formData, "classId");

  await marcarClaseDictada(claseId);

  revalidateOperationalViews();
}

export async function markAllClassesTaughtAction(formData: FormData) {
  const classIds = formData
    .getAll("classId")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  await Promise.all(classIds.map((claseId) => marcarClaseDictada(claseId)));

  revalidateOperationalViews();
}

export async function confirmClassificationAction(formData: FormData) {
  const claseId = getRequiredNumber(formData, "classId");
  const consultoraId = getRequiredNumber(formData, "consultoraId");

  await actualizarClasificacionClase(claseId, {
    cursoId: null,
    consultoraId,
    empresa: getNullableString(formData, "empresa"),
    grupo: getNullableString(formData, "grupo"),
    facturable: getBoolean(formData, "facturable"),
    clasificacionConfirmada: true,
  });

  revalidateOperationalViews();
}

export async function confirmClassificationSeriesAction(formData: FormData) {
  const claseId = getRequiredNumber(formData, "classId");
  const consultoraId = getRequiredNumber(formData, "consultoraId");
  const payload = {
    cursoId: null,
    consultoraId,
    empresa: getNullableString(formData, "empresa"),
    grupo: getNullableString(formData, "grupo"),
    facturable: getBoolean(formData, "facturable"),
    clasificacionConfirmada: true,
  };

  try {
    await actualizarClasificacionClaseMismoTitulo(claseId, payload);
  } catch (error) {
    if (!isNoPendingRelatedClassesError(error)) {
      throw error;
    }

    await actualizarClasificacionClase(claseId, payload);
  }

  revalidateOperationalViews();
}

export async function applyMigrationSeriesAction(formData: FormData) {
  const classId = getRequiredNumber(formData, "classId");
  const consultoraId = getRequiredNumber(formData, "consultoraId");
  const classIds = Array.from(
    new Set(
      [
        classId,
        ...formData
          .getAll("seriesClassId")
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value > 0),
      ],
    ),
  );
  const payload = {
    cursoId: null,
    consultoraId,
    empresa: getNullableString(formData, "empresa"),
    grupo: getNullableString(formData, "grupo"),
    facturable: getBoolean(formData, "facturable"),
    clasificacionConfirmada: true,
  };

  await Promise.all(
    classIds.map((claseId) => actualizarClasificacionClase(claseId, payload)),
  );

  revalidateOperationalViews();
}

export async function excludeClassificationAction(formData: FormData) {
  const claseId = getRequiredNumber(formData, "classId");
  const consultoraId = getRequiredNumber(formData, "consultoraId");

  await actualizarClasificacionClase(claseId, {
    cursoId: null,
    consultoraId,
    empresa: null,
    grupo: null,
    facturable: false,
    clasificacionConfirmada: true,
  });

  revalidateOperationalViews();
}

export async function assignExistingCourseAction(formData: FormData) {
  const claseId = getRequiredNumber(formData, "classId");
  const cursoId = getRequiredNumber(formData, "cursoId");

  await actualizarClasificacionClase(claseId, {
    cursoId,
    consultoraId: null,
    empresa: null,
    grupo: null,
    facturable: getBoolean(formData, "facturable"),
    clasificacionConfirmada: true,
  });

  revalidateOperationalViews();
}

export async function assignExistingCourseSeriesAction(formData: FormData) {
  const claseId = getRequiredNumber(formData, "classId");
  const cursoId = getRequiredNumber(formData, "cursoId");
  const payload = {
    cursoId,
    consultoraId: null,
    empresa: null,
    grupo: null,
    facturable: getBoolean(formData, "facturable"),
    clasificacionConfirmada: true,
  };

  try {
    const response = await actualizarClasificacionClaseMismoTitulo(claseId, payload);
    revalidateOperationalViews();
    return response.processed;
  } catch (error) {
    if (!isNoPendingRelatedClassesError(error)) {
      throw error;
    }

    await actualizarClasificacionClase(claseId, payload);
    revalidateOperationalViews();
    return 1;
  }
}

export async function createRateAction(
  _previousState: RateActionState,
  formData: FormData,
): Promise<RateActionState> {
  try {
    await crearTarifa({
      consultoraId: getRequiredNumber(formData, "consultoraId"),
      montoPorHora: getRequiredNumber(formData, "montoPorHora"),
      moneda: "ARS",
      vigenteDesde: getString(formData, "vigenteDesde"),
      vigenteHasta: getNullableString(formData, "vigenteHasta"),
      fechaUltimoAumento: getNullableString(formData, "fechaUltimoAumento"),
      observaciones: getNullableString(formData, "observaciones"),
    });

    revalidateOperationalViews();

    return {
      error: null,
      success: "Tarifa creada correctamente.",
    };
  } catch (error) {
    return {
      error: getActionErrorMessage(error),
      success: null,
    };
  }
}

export async function createConsultoraAction(formData: FormData) {
  await crearConsultora({
    nombre: getString(formData, "nombre"),
    descripcion: getNullableString(formData, "descripcion"),
    requiereReporteExcel: getBoolean(formData, "requiereReporteExcel"),
    googleCalendarId: null,
  });

  revalidateOperationalViews();
}

export async function createCourseAction(formData: FormData) {
  await crearCurso({
    consultoraId: getRequiredNumber(formData, "consultoraId"),
    empresa: getString(formData, "empresa"),
    grupo: getNullableString(formData, "grupo"),
    activa: true,
  });

  revalidateOperationalViews();
}

export async function updateCourseAction(formData: FormData) {
  const cursoId = getRequiredNumber(formData, "cursoId");

  await actualizarCurso(cursoId, {
    consultoraId: getRequiredNumber(formData, "consultoraId"),
    empresa: getString(formData, "empresa"),
    grupo: getNullableString(formData, "grupo"),
    activa: getBoolean(formData, "activa"),
  });

  revalidateOperationalViews();
}
