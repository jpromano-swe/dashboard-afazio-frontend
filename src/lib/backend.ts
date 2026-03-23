export type AsistenciaEstado =
  | "PENDIENTE"
  | "ASISTIO"
  | "AUSENTE"
  | "REPROGRAMADA";

export type ClaseEstado =
  | "PROGRAMADA"
  | "DICTADA"
  | "CANCELADA"
  | "REPROGRAMADA";

export type ClaseEstadoDestino = Exclude<ClaseEstado, "PROGRAMADA">;

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface ConsultoraResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  requiereReporteExcel: boolean;
  googleCalendarId: string | null;
}

export function isUnclassifiedConsultoraName(name: string | null | undefined) {
  return (name ?? "").trim().toLowerCase() === "sin clasificar";
}

export function isPendingClassification(
  sinClasificar: boolean | null | undefined,
  consultoraNombre?: string | null,
) {
  return sinClasificar === true || isUnclassifiedConsultoraName(consultoraNombre);
}

export function isRealConsultora(consultora: ConsultoraResponse) {
  return consultora.activa && !isUnclassifiedConsultoraName(consultora.nombre);
}

export function findConsultoraIdByName(
  name: string | null | undefined,
  consultoras: ConsultoraResponse[],
) {
  if (!name || isUnclassifiedConsultoraName(name)) {
    return null;
  }

  const normalizedName = name.trim().toLowerCase();
  const matchedConsultora = consultoras.find(
    (consultora) => consultora.nombre.trim().toLowerCase() === normalizedName,
  );

  return matchedConsultora?.id ?? null;
}

export interface CrearConsultoraCommand {
  nombre: string;
  descripcion: string | null;
  requiereReporteExcel: boolean;
  googleCalendarId: string | null;
}

export interface ClaseDelDiaResponse {
  id: number;
  consultoraNombre: string;
  sinClasificar?: boolean;
  titulo: string;
  descripcion: string | null;
  meetingUrl: string | null;
  empresa?: string | null;
  grupo?: string | null;
  clasificacionConfirmada?: boolean | null;
  fechaInicio: string;
  fechaFin: string;
  duracionMinutos: number;
  estado: ClaseEstado;
  googleEventId: string | null;
  asistenciaEstado: AsistenciaEstado | null;
  asistenciaObservacion: string | null;
  asistenciaMarcadaEn: string | null;
}

export interface ClasePendienteClasificacionResponse {
  id: number;
  cursoId: number | null;
  titulo: string;
  descripcion: string | null;
  meetingUrl: string | null;
  sinClasificar?: boolean;
  empresa: string | null;
  grupo: string | null;
  facturable: boolean;
  clasificacionConfirmada: boolean;
  consultoraNombre: string | null;
  fechaInicio: string;
  fechaFin: string;
  duracionMinutos: number;
  estado: ClaseEstado;
  googleEventId: string | null;
}

export interface ActualizarClasificacionClaseCommand {
  cursoId: number | null;
  consultoraId: number | null;
  empresa: string | null;
  grupo: string | null;
  facturable: boolean;
  clasificacionConfirmada: boolean;
}

export interface ActualizarClasificacionMismoTituloResponse {
  titulo: string;
  processed: number;
  cursoId: number | null;
  consultoraNombre: string | null;
  sinClasificar?: boolean;
  empresa: string | null;
  grupo: string | null;
  facturable: boolean;
  clasificacionConfirmada: boolean;
}

export interface ActualizarEstadoClaseCommand {
  estado: ClaseEstadoDestino;
}

export interface ActualizarEstadoClaseResponse {
  id: number;
  titulo: string;
  estadoAnterior: ClaseEstado;
  estadoActual: ClaseEstado;
}

export interface CursoResponse {
  id: number;
  consultoraId: number;
  consultoraNombre: string;
  empresa: string;
  grupo: string | null;
  activa: boolean;
}

export interface CrearCursoCommand {
  consultoraId: number;
  empresa: string;
  grupo: string | null;
  activa: boolean;
}

export interface ActualizarCursoCommand {
  consultoraId: number;
  empresa: string;
  grupo: string | null;
  activa: boolean;
}

export interface MarcarAsistenciaCommand {
  claseId: number;
  estado: AsistenciaEstado;
  observacion: string | null;
}

export interface AsistenciaResponse {
  id: number;
  claseId: number;
  estado: AsistenciaEstado;
  observacion: string | null;
  marcadaEn: string;
}

export interface CrearTarifaConsultoraCommand {
  consultoraId: number;
  montoPorHora: number;
  moneda: string;
  vigenteDesde: string;
  vigenteHasta: string | null;
  fechaUltimoAumento: string | null;
  observaciones: string | null;
}

export interface TarifaConsultoraResponse {
  id: number;
  consultoraId: number;
  consultoraNombre: string;
  montoPorHora: number;
  moneda: string;
  vigenteDesde: string;
  vigenteHasta: string | null;
  fechaUltimoAumento: string | null;
  observaciones: string | null;
}

export interface IngresoPorClaseResponse {
  claseId: number;
  consultoraNombre: string;
  sinClasificar?: boolean;
  tituloClase: string;
  fechaClase: string;
  duracionMinutos: number;
  montoPorHora: number;
  moneda: string;
  importeCalculado: number;
}

export interface IngresoDetalleResponse {
  claseId: number;
  cursoId: number | null;
  consultoraNombre: string;
  sinClasificar?: boolean;
  tituloClase: string;
  fechaClase: string;
  duracionMinutos: number;
  empresa: string | null;
  grupo: string | null;
  montoPorHora: number;
  moneda: string;
  facturable: boolean;
  importeCalculado: number;
}

export interface IngresoPeriodoResponse {
  from: string;
  to: string;
  cantidadClases: number;
  total: number;
  detalle: IngresoDetalleResponse[];
}

export interface GoogleSyncResponse {
  processed: number;
  from: string;
  to: string;
}

export type FrontendConsultoraSeed = {
  id: number;
  nombre: string;
  descripcion: string | null;
  requiereReporteExcel: boolean;
};

const BACKEND_BASE_URL = (
  process.env.BACKEND_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  ""
).replace(/\/$/, "");

const BASIC_AUTH_USERNAME = process.env.BACKEND_BASIC_AUTH_USERNAME ?? "admin";
const BASIC_AUTH_PASSWORD = process.env.BACKEND_BASIC_AUTH_PASSWORD ?? "admin123";

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export const basicAuth = `Basic ${Buffer.from(
  `${BASIC_AUTH_USERNAME}:${BASIC_AUTH_PASSWORD}`,
).toString("base64")}`;

export const NGROK_SKIP_BROWSER_WARNING_HEADER = {
  "ngrok-skip-browser-warning": "1",
};

export class BackendConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendConfigError";
  }
}

function buildBackendUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (BACKEND_BASE_URL) {
    return `${BACKEND_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  }

  return null;
}

export function getBackendRequestHeaders(
  body?: BodyInit | null,
  headers?: HeadersInit,
): HeadersInit {
  return {
    Authorization: basicAuth,
    Accept: "application/json",
    ...NGROK_SKIP_BROWSER_WARNING_HEADER,
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(headers ?? {}),
  };
}

export async function apiFetch<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const url = buildBackendUrl(input);

  if (!url) {
    throw new BackendConfigError(
      "BACKEND_BASE_URL is not configured. Server-side API calls need an absolute backend origin.",
    );
  }

  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: getBackendRequestHeaders(init?.body, init?.headers),
  });

  if (!response.ok) {
    let error: ApiErrorResponse | null = null;

    try {
      error = (await response.json()) as ApiErrorResponse;
    } catch {
      error = null;
    }

    throw error ?? new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getGoogleSyncUrl(from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  const path = `/google/calendar/sync?${params.toString()}`;

  return buildBackendUrl(path) ?? path;
}

export function getGoogleCalendarAuthUrl() {
  return buildBackendUrl("/oauth2/authorization/google") ?? "/oauth2/authorization/google";
}

export function getGoogleSyncRangeForMonth(date = new Date(), utcOffset = "-03:00") {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const monthPart = padDatePart(month);

  return {
    from: `${year}-${monthPart}-01T00:00:00${utcOffset}`,
    to: `${year}-${monthPart}-${padDatePart(lastDayOfMonth)}T23:59:59${utcOffset}`,
  };
}

export function getBackendExcelReportUrl(consultoraId: number, periodo: string) {
  const params = new URLSearchParams({
    consultoraId: String(consultoraId),
    periodo,
  });
  const path = `/api/reportes/excel?${params.toString()}`;

  return buildBackendUrl(path) ?? path;
}

export function getExcelReportUrl(consultoraId: number, periodo: string) {
  const params = new URLSearchParams({
    consultoraId: String(consultoraId),
    periodo,
  });

  return `/api/reportes/excel?${params.toString()}`;
}

export function getConsultoraSeeds(): FrontendConsultoraSeed[] {
  const raw = process.env.CONSULTORA_SEEDS_JSON;

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as FrontendConsultoraSeed[];

    return parsed.filter(
      (item) =>
        typeof item.id === "number" &&
        typeof item.nombre === "string" &&
        typeof item.requiereReporteExcel === "boolean",
    );
  } catch (error) {
    console.warn("Invalid CONSULTORA_SEEDS_JSON value", error);
    return [];
  }
}

export const queryKeys = {
  consultoras: () => ["consultoras"] as const,
  cursos: (consultoraId?: number) =>
    ["cursos", consultoraId ?? "all"] as const,
  clasesHoy: (fecha?: string) => ["clases", "hoy", fecha ?? "today"] as const,
  clasesPendientes: () => ["clases", "pendientes-clasificacion"] as const,
  tarifasConsultora: (consultoraId: number) =>
    ["tarifas", "consultora", consultoraId] as const,
  tarifaVigente: (consultoraId: number, fecha: string) =>
    ["tarifas", "vigente", consultoraId, fecha] as const,
  ingresoClase: (claseId: number) => ["ingresos", "clase", claseId] as const,
  ingresosPeriodo: (from: string, to: string) =>
    ["ingresos", "periodo", from, to] as const,
  googleSync: (from: string, to: string) =>
    ["google", "calendar", "sync", from, to] as const,
};

export async function getConsultoras() {
  return apiFetch<ConsultoraResponse[]>("/api/consultoras");
}

export async function crearConsultora(payload: CrearConsultoraCommand) {
  return apiFetch<ConsultoraResponse>("/api/consultoras", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCursos(consultoraId?: number) {
  const params = new URLSearchParams();

  if (typeof consultoraId === "number") {
    params.set("consultoraId", String(consultoraId));
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : "";

  return apiFetch<CursoResponse[]>(`/api/cursos${suffix}`);
}

export async function crearCurso(payload: CrearCursoCommand) {
  return apiFetch<CursoResponse>("/api/cursos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarCurso(id: number, payload: ActualizarCursoCommand) {
  return apiFetch<CursoResponse>(`/api/cursos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getClasesHoy(fecha: string) {
  const params = new URLSearchParams({ fecha });

  return apiFetch<ClaseDelDiaResponse[]>(`/api/clases/hoy?${params.toString()}`);
}

export async function getClasesSemana(
  desde: string,
  options?: { soloClasificadas?: boolean },
) {
  const params = new URLSearchParams({ desde });

  if (options?.soloClasificadas) {
    params.set("soloClasificadas", "true");
  }

  return apiFetch<ClaseDelDiaResponse[]>(`/api/clases/semana?${params.toString()}`);
}

export async function getClasesPorPeriodo(
  from: string,
  to: string,
  options?: { soloClasificadas?: boolean },
) {
  const params = new URLSearchParams({ from, to });

  if (options?.soloClasificadas) {
    params.set("soloClasificadas", "true");
  }

  return apiFetch<ClaseDelDiaResponse[]>(`/api/clases?${params.toString()}`);
}

export async function getClasesPendientesClasificacion() {
  return apiFetch<ClasePendienteClasificacionResponse[]>(
    "/api/clases/pendientes-clasificacion",
  );
}

export async function actualizarClasificacionClase(
  claseId: number,
  payload: ActualizarClasificacionClaseCommand,
) {
  return apiFetch<ClasePendienteClasificacionResponse>(
    `/api/clases/${claseId}/clasificacion`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function actualizarClasificacionClaseMismoTitulo(
  claseId: number,
  payload: ActualizarClasificacionClaseCommand,
) {
  return apiFetch<ActualizarClasificacionMismoTituloResponse>(
    `/api/clases/${claseId}/clasificacion/mismo-titulo`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function actualizarEstadoClase(
  claseId: number,
  payload: ActualizarEstadoClaseCommand,
) {
  return apiFetch<ActualizarEstadoClaseResponse>(`/api/clases/${claseId}/estado`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function marcarClaseDictada(claseId: number) {
  return apiFetch<ActualizarEstadoClaseResponse>(`/api/clases/${claseId}/dictada`, {
    method: "PUT",
  });
}

export async function marcarAsistencia(payload: MarcarAsistenciaCommand) {
  return apiFetch<AsistenciaResponse>("/api/asistencias", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function crearTarifa(payload: CrearTarifaConsultoraCommand) {
  return apiFetch<TarifaConsultoraResponse>("/api/tarifas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTarifasConsultora(consultoraId: number) {
  return apiFetch<TarifaConsultoraResponse[]>(
    `/api/tarifas/consultoras/${consultoraId}`,
  );
}

export async function getTarifaVigente(consultoraId: number, fecha: string) {
  const params = new URLSearchParams({
    consultoraId: String(consultoraId),
    fecha,
  });

  return apiFetch<TarifaConsultoraResponse>(`/api/tarifas/vigente?${params.toString()}`);
}

export async function getIngresoClase(claseId: number) {
  return apiFetch<IngresoPorClaseResponse>(`/api/ingresos/clases/${claseId}`);
}

export async function getIngresosPeriodo(
  from: string,
  to: string,
  options?: {
    consultoraId?: number;
    cursoId?: number;
  },
) {
  const params = new URLSearchParams({ from, to });

  if (typeof options?.consultoraId === "number") {
    params.set("consultoraId", String(options.consultoraId));
  }

  if (typeof options?.cursoId === "number") {
    params.set("cursoId", String(options.cursoId));
  }

  return apiFetch<IngresoPeriodoResponse>(`/api/ingresos?${params.toString()}`);
}
