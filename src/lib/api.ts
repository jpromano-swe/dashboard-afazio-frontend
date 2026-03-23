import {
  type ApiErrorResponse,
  BackendConfigError,
  getClasesHoy,
  getClasesPorPeriodo,
  getClasesSemana,
  getClasesPendientesClasificacion,
  getConsultoras,
  getConsultoraSeeds,
  getExcelReportUrl,
  getIngresosPeriodo,
  getTarifasConsultora,
  getTarifaVigente,
  isPendingClassification,
  isRealConsultora,
  isUnclassifiedConsultoraName,
  type ClaseDelDiaResponse,
  type ClasePendienteClasificacionResponse,
  type ConsultoraResponse,
  type TarifaConsultoraResponse,
} from "@/lib/backend";
import {
  dashboardData,
  inboxData,
  incomeData,
  ratesData,
  reportsData,
  type DashboardData,
  type InboxData,
  type IncomeData,
  type RatesData,
  type ReportsData,
  type WeeklyScheduleDay,
} from "@/lib/data";

const DEFAULT_LOCALE = "es-AR";
const DEFAULT_CURRENCY = "ARS";
const DEFAULT_TIME_ZONE = "America/Argentina/Buenos_Aires";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeek(date: Date) {
  const current = new Date(date);
  const dayIndex = (current.getDay() + 6) % 7;

  current.setDate(current.getDate() - dayIndex);
  current.setHours(0, 0, 0, 0);

  return current;
}

function formatShortDate(dateInput: string | Date) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIME_ZONE,
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(dateInput));
}

function formatMonthYear(dateInput: string | Date) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(new Date(dateInput));
}

function formatTime(dateInput: string | Date) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateInput));
}

function formatDateTime(dateInput: string | Date) {
  return `${formatShortDate(dateInput)} · ${formatTime(dateInput)}`;
}

function formatDateRange(from: string | Date, to: string | Date) {
  return `${formatShortDate(from)} - ${formatShortDate(to)}`;
}

function formatWeekdayLabel(dateInput: string | Date) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIME_ZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(dateInput));
}

function toTimeZoneIsoDate(dateInput: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(dateInput));

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return toIsoDate(new Date(dateInput));
  }

  return `${year}-${month}-${day}`;
}

function formatCurrency(value: number, currency = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatHours(minutes: number) {
  const hours = minutes / 60;

  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((total, item) => total + selector(item), 0);
}

function shouldIncludeClassTitle(title: string | null | undefined) {
  const normalized = (title ?? "").trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  if (normalized === "contenido cg") {
    return false;
  }

  if (normalized.includes("cumple")) {
    return false;
  }

  return true;
}

function normalizeConsultoraName(name: string | null | undefined) {
  if (isUnclassifiedConsultoraName(name)) {
    return "Sin clasificar";
  }

  return name?.trim() || "Sin clasificar";
}

function normalizeTitleKey(title: string | null | undefined) {
  return (title ?? "").trim().toLowerCase();
}

function buildAssignmentLabel(
  clase: Pick<ClaseDelDiaResponse, "consultoraNombre" | "empresa" | "grupo" | "sinClasificar">,
) {
  if (isPendingClassification(clase.sinClasificar, clase.consultoraNombre)) {
    return "Sin clasificar";
  }

  const courseParts = [clase.empresa, clase.grupo]
    .map((part) => (part ?? "").trim())
    .filter(Boolean);

  if (courseParts.length > 0) {
    return courseParts.join(" · ");
  }

  return normalizeConsultoraName(clase.consultoraNombre);
}

function buildClassAssignmentLookup(classes: ClaseDelDiaResponse[]) {
  const lookup = new Map<
    string,
    Pick<ClaseDelDiaResponse, "consultoraNombre" | "empresa" | "grupo">
  >();

  classes.forEach((clase) => {
    const key = normalizeTitleKey(clase.titulo);
    const hasAssignment =
      !isPendingClassification(clase.sinClasificar, clase.consultoraNombre) ||
      Boolean(clase.empresa) ||
      Boolean(clase.grupo);

    if (!key || !hasAssignment || lookup.has(key)) {
      return;
    }

    lookup.set(key, {
      consultoraNombre: clase.consultoraNombre,
      empresa: clase.empresa ?? null,
      grupo: clase.grupo ?? null,
    });
  });

  return lookup;
}

function applyAssignmentFallback(
  classes: ClaseDelDiaResponse[],
  assignmentLookup: Map<
    string,
    Pick<ClaseDelDiaResponse, "consultoraNombre" | "empresa" | "grupo">
  >,
) {
  return classes.map((clase) => {
    const alreadyAssigned =
      !isPendingClassification(clase.sinClasificar, clase.consultoraNombre) ||
      Boolean(clase.empresa) ||
      Boolean(clase.grupo);

    if (alreadyAssigned) {
      return clase;
    }

    const fallbackAssignment = assignmentLookup.get(normalizeTitleKey(clase.titulo));

    if (!fallbackAssignment) {
      return clase;
    }

    return {
      ...clase,
      consultoraNombre: fallbackAssignment.consultoraNombre,
      sinClasificar: false,
      empresa: fallbackAssignment.empresa ?? null,
      grupo: fallbackAssignment.grupo ?? null,
    };
  });
}

function getScheduleStatus(clase: ClaseDelDiaResponse) {
  if (clase.estado === "DICTADA") {
    return { status: "billable" as const, action: "Dictada", muted: true };
  }

  if (clase.estado === "CANCELADA") {
    return { status: "danger" as const, action: "Cancelada", muted: true };
  }

  if (clase.estado === "REPROGRAMADA") {
    return { status: "review" as const, action: "Reprogramada", muted: true };
  }

  return { status: "confirmed" as const, action: "Lista", muted: false };
}

function mapClaseToScheduleEntry(clase: ClaseDelDiaResponse) {
  const mappedStatus = getScheduleStatus(clase);
  const assignmentLabel = buildAssignmentLabel(clase);

  return {
    id: clase.id,
    googleEventId: clase.googleEventId,
    meetingUrl: clase.meetingUrl,
    classState: clase.estado,
    title: clase.titulo,
    subtitle: clase.meetingUrl
      ? [assignmentLabel, "Reunión lista"].filter(Boolean).join(" · ")
      : assignmentLabel,
    time: formatTime(clase.fechaInicio),
    duration: `${clase.duracionMinutos} min`,
    status: mappedStatus.status,
    action: mappedStatus.action,
    muted: mappedStatus.muted,
  };
}

function buildWeeklySchedule(classes: ClaseDelDiaResponse[], date = new Date()) {
  const weekStart = startOfWeek(date);

  return Array.from({ length: 5 }, (_, index): WeeklyScheduleDay => {
    const current = new Date(weekStart);
    current.setDate(weekStart.getDate() + index);
    const dayKey = toIsoDate(current);
    const entries = classes
      .filter((clase) => toTimeZoneIsoDate(clase.fechaInicio) === dayKey)
      .filter((clase) => clase.estado === "PROGRAMADA")
      .filter((clase) => shouldIncludeClassTitle(clase.titulo))
      .map(mapClaseToScheduleEntry);

    return {
      label: new Intl.DateTimeFormat(DEFAULT_LOCALE, {
        timeZone: DEFAULT_TIME_ZONE,
        weekday: "long",
      }).format(current),
      dateLabel: formatWeekdayLabel(current),
      entries,
    };
  });
}

function buildInboxConflicts(
  sessions: ClasePendienteClasificacionResponse[],
): InboxData["conflicts"] {
  const conflicts: InboxData["conflicts"] = [];
  const missingConsultora = sessions.filter(
    (session) =>
      !session.consultoraNombre ||
      isPendingClassification(session.sinClasificar, session.consultoraNombre),
  ).length;
  const missingGrouping = sessions.filter(
    (session) => !session.empresa && !session.grupo,
  ).length;

  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime(),
  );
  let overlaps = 0;

  for (let index = 1; index < sorted.length; index += 1) {
    const previousEnd = new Date(sorted[index - 1].fechaFin).getTime();
    const currentStart = new Date(sorted[index].fechaInicio).getTime();
    const sameDay =
      new Date(sorted[index - 1].fechaInicio).toDateString() ===
      new Date(sorted[index].fechaInicio).toDateString();

    if (sameDay && currentStart < previousEnd) {
      overlaps += 1;
    }
  }

  if (overlaps > 0) {
    conflicts.push({
      title: "Doble reserva",
      detail: `Se detect${overlaps > 1 ? "aron" : "ó"} ${overlaps} solapamiento${
        overlaps > 1 ? "s" : ""
      } en la cola importada.`,
      tone: "danger",
    });
  }

  if (missingConsultora > 0) {
    conflicts.push({
      title: "Falta consultora",
      detail: `${missingConsultora} sesión${
        missingConsultora > 1 ? "es" : ""
      } todavía necesita asignación de consultora antes de confirmarse.`,
      tone: "pending",
    });
  }

  if (missingGrouping > 0) {
    conflicts.push({
      title: "Falta empresa / grupo",
      detail: `${missingGrouping} sesión${
        missingGrouping > 1 ? "es" : ""
      } llegó sin metadatos de empresa o grupo.`,
      tone: "pending",
    });
  }

  return conflicts.length > 0 ? conflicts : inboxData.conflicts;
}

function findConsultoraIdByName(
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

  if (matchedConsultora) {
    return matchedConsultora.id;
  }

  const matchedSeed = getConsultoraSeeds().find(
    (seed) => seed.nombre.trim().toLowerCase() === normalizedName,
  );

  return matchedSeed?.id ?? null;
}

function getRateTone(index: number) {
  if (index % 3 === 0) {
    return "secondary" as const;
  }

  if (index % 3 === 1) {
    return "amber" as const;
  }

  return "neutral" as const;
}

function getApiErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as ApiErrorResponse | Error).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return null;
}

function isRateActive(rate: TarifaConsultoraResponse, todayIso: string) {
  if (rate.vigenteHasta && rate.vigenteHasta < todayIso) {
    return false;
  }

  return rate.vigenteDesde <= todayIso;
}

async function withFallback<T>(label: string, fallback: T, loader: () => Promise<T>) {
  try {
    return await loader();
  } catch (error) {
    if (error instanceof BackendConfigError) {
      console.warn(`Using mock ${label} data because BACKEND_BASE_URL is not configured.`);
      return fallback;
    }

    console.warn(`Falling back to mock ${label} data`, error);
    return fallback;
  }
}

export async function getDashboardData(date = new Date()): Promise<DashboardData> {
  return withFallback("dashboard", dashboardData, async () => {
    const monthStart = toIsoDate(startOfMonth(date));
    const monthEnd = toIsoDate(endOfMonth(date));
    const weekStartDate = startOfWeek(date);
    const weekStart = toIsoDate(weekStartDate);
    const todayIso = toIsoDate(date);

    const [
      rawTodayClasses,
      rawWeeklyClasses,
      rawPendingClasses,
      classifiedMonthClasses,
      incomeResult,
    ] = await Promise.all([
      getClasesHoy(todayIso),
      getClasesSemana(weekStart),
      getClasesPendientesClasificacion(),
      getClasesPorPeriodo(monthStart, monthEnd, { soloClasificadas: true }).catch(() => []),
      getIngresosPeriodo(monthStart, monthEnd)
        .then((value) => ({ value, error: null }))
        .catch((error) => ({ value: null, error })),
    ]);
    const assignmentLookup = buildClassAssignmentLookup(classifiedMonthClasses);
    const todayClasses = applyAssignmentFallback(rawTodayClasses, assignmentLookup).filter((clase) =>
      shouldIncludeClassTitle(clase.titulo),
    );
    const weeklyClasses = applyAssignmentFallback(rawWeeklyClasses, assignmentLookup).filter(
      (clase) => shouldIncludeClassTitle(clase.titulo),
    );
    const pendingClasses = rawPendingClasses.filter((session) =>
      shouldIncludeClassTitle(session.titulo),
    );
    const incomeErrorMessage = incomeResult.error
      ? getApiErrorMessage(incomeResult.error)
      : null;

    return {
      ...dashboardData,
      weekRangeLabel: formatDateRange(weekStartDate, new Date(weekStartDate.getTime() + 4 * 24 * 60 * 60 * 1000)),
      metrics: [
        {
          label: "Clases de hoy",
          value: String(todayClasses.length).padStart(2, "0"),
          icon: "calendar",
        },
        {
          label: "Clasificación pendiente",
          value: String(pendingClasses.length).padStart(2, "0"),
          icon: "pending",
          accent: "amber",
        },
        {
          label: "Ingresos mensuales",
          value: incomeResult.value
            ? formatCurrency(incomeResult.value.total)
            : "No disponible",
          icon: "income",
          helper: incomeErrorMessage ? "Revisá el solapamiento de tarifas activas" : undefined,
        },
        {
          label: "Próximas tareas",
          value: String(
            todayClasses.filter((clase) => clase.estado === "PROGRAMADA").length,
          ).padStart(2, "0"),
          icon: "tasks",
        },
      ],
      schedule: todayClasses.map(mapClaseToScheduleEntry),
      weeklySchedule: buildWeeklySchedule(weeklyClasses, date),
      backendNotice: incomeErrorMessage
        ? `Los ingresos del dashboard no están disponibles ahora: ${incomeErrorMessage}`
        : undefined,
    };
  });
}

export async function getInboxData(): Promise<InboxData> {
  return withFallback("inbox", inboxData, async () => {
    const [rawSessions, consultoras] = await Promise.all([
      getClasesPendientesClasificacion(),
      getConsultoras().catch(() => []),
    ]);
    const realConsultoras = consultoras.filter(isRealConsultora);
    const sessions = rawSessions.filter((session) =>
      shouldIncludeClassTitle(session.titulo),
    );
    const totalMinutes = sumBy(sessions, (session) => session.duracionMinutos);
    const missingConsultora = sessions.filter(
      (session) =>
        !session.consultoraNombre ||
        isPendingClassification(session.sinClasificar, session.consultoraNombre),
    ).length;

    return {
      ...inboxData,
      subtitle: `Se encontraron ${sessions.length} entr${
        sessions.length === 1 ? "ada" : "adas"
      } sin clasificar en tu calendario de Google.`,
      sessions: sessions.map((session) => ({
        id: session.id,
        cursoId: session.cursoId,
        googleEventId: session.googleEventId,
        meetingUrl: session.meetingUrl,
        title: session.titulo,
        date: formatDateTime(session.fechaInicio),
        duration: `${session.duracionMinutos} min`,
        client: isPendingClassification(session.sinClasificar, session.consultoraNombre)
          ? "Sin clasificar"
          : normalizeConsultoraName(session.consultoraNombre),
        company: session.empresa ?? session.grupo ?? "Grupo sin clasificar",
        billable: session.facturable,
        sinClasificar: session.sinClasificar ?? false,
        consultoraId: findConsultoraIdByName(session.consultoraNombre, realConsultoras),
        consultoraNombre: session.consultoraNombre,
        empresa: session.empresa,
        grupo: session.grupo,
        issue:
          !session.consultoraNombre ||
          isPendingClassification(session.sinClasificar, session.consultoraNombre) ||
          (!session.empresa && !session.grupo)
            ? "Sin revisar"
            : undefined,
      })),
      pendingHours: formatHours(totalMinutes),
      estimatedValue: "ARS --",
      classificationTip:
        missingConsultora > 0
          ? `${missingConsultora} sesión${missingConsultora > 1 ? "es" : ""} importada${
              missingConsultora > 1 ? "s" : ""
            } todavía carece de asignación de consultora. Elegí una consultora primero y luego vinculá la fila a un curso existente.`
          : "Elegí una consultora y luego asigná un curso existente antes de confirmar.",
      conflicts: buildInboxConflicts(sessions),
      backendNotice:
        "El valor facturable estimado se omite a propósito mientras la clasificación por curso y la semántica de tarifas se terminan de estabilizar en el backend.",
    };
  });
}

export async function getRatesData(date = new Date()): Promise<RatesData> {
  return withFallback("rates", ratesData, async () => {
    const liveConsultoras = (await getConsultoras().catch(() => [])).filter(isRealConsultora);
    const consultoraSeeds = getConsultoraSeeds();
    const consultoraSources =
      liveConsultoras.length > 0
        ? liveConsultoras.map((consultora) => ({
            id: consultora.id,
            nombre: consultora.nombre,
            descripcion: consultora.descripcion,
            requiereReporteExcel: consultora.requiereReporteExcel,
          }))
        : consultoraSeeds;

    if (consultoraSources.length === 0) {
      return {
        ...ratesData,
        backendNotice:
          "No hay registros de consultoras. Configurá CONSULTORA_SEEDS_JSON solo como fallback temporal si /api/consultoras no está disponible.",
      };
    }

    const todayIso = toIsoDate(date);
    const settled = await Promise.all(
      consultoraSources.map(async (seed) => {
        const history = await getTarifasConsultora(seed.id);
        const current = await getTarifaVigente(seed.id, todayIso).catch(() => null);

        return { seed, history, current };
      }),
    );

    const cards = settled
      .filter((result) => result.history.length > 0)
      .map(({ seed, history, current }, index) => {
        const sortedHistory = [...history].sort((left, right) =>
          right.vigenteDesde.localeCompare(left.vigenteDesde),
        );
        const activeRate =
          current ??
          sortedHistory.find((rate) => isRateActive(rate, todayIso)) ??
          sortedHistory[0];

        return {
          name: seed.nombre,
          subtitle: seed.descripcion ?? "Consultora precargada del front",
          status:
            activeRate && isRateActive(activeRate, todayIso)
              ? ("Activa" as const)
              : ("Revisión pendiente" as const),
          tone: getRateTone(index),
          currentRate: formatCurrency(activeRate.montoPorHora, activeRate.moneda),
          effectiveSince: formatShortDate(activeRate.vigenteDesde),
          history: sortedHistory.map((rate, historyIndex) => ({
            value: formatCurrency(rate.montoPorHora, rate.moneda),
            note:
              rate.observaciones ??
              (historyIndex === 0 ? "Actual" : "Histórica"),
            range: `${formatShortDate(rate.vigenteDesde)} — ${
              rate.vigenteHasta ? formatShortDate(rate.vigenteHasta) : "Actual"
            }`,
          })),
        };
      });

    if (cards.length === 0) {
      return {
        ...ratesData,
        backendNotice:
          "Ningún ID de consultora precargado devolvió historial de tarifas. Verificá CONSULTORA_SEEDS_JSON contra los IDs de tu backend.",
      };
    }

    const currentValues = settled
      .filter((result) => result.history.length > 0)
      .map(({ history, current }) => current ?? history[0])
      .filter(Boolean);

    const averageRate =
      currentValues.length > 0
        ? sumBy(currentValues, (rate) => rate.montoPorHora) / currentValues.length
        : 0;

    return {
      eyebrow: "Administración de consultoras",
      headline: "Libro de tarifas",
      cards,
      averageRate:
        averageRate > 0
          ? `${formatCurrency(averageRate, currentValues[0]?.moneda ?? DEFAULT_CURRENCY)} / h`
          : ratesData.averageRate,
      billableUnits: `${cards.reduce((total, card) => total + card.history.length, 0)} filas de tarifa`,
      syncNote: `Se cargaron ${cards.length} libro${cards.length > 1 ? "s" : ""} de consultora desde los endpoints estables de tarifas.`,
      backendNotice: liveConsultoras.length > 0
        ? "Definí la tarifa de las clases para cada consultora."
        : "La lista de consultoras usó seeds del frontend porque /api/consultoras no estuvo disponible durante esta solicitud.",
    };
  });
}

export async function getIncomeData(
  options?: {
    from?: string;
    to?: string;
    consultoraId?: number;
  },
): Promise<IncomeData> {
  const from = options?.from ?? toIsoDate(startOfMonth(new Date()));
  const to = options?.to ?? toIsoDate(endOfMonth(new Date()));
  const consultoraId = options?.consultoraId;
  const consultoraFilterLabel = consultoraId ? "Consultora seleccionada" : "Todas las consultoras";
  const emptyIncomeData: IncomeData = {
    ...incomeData,
    period: formatDateRange(from, to),
    entity: consultoraFilterLabel,
    status: consultoraId ? "Vista filtrada" : "Todas las consultoras",
    estimatedIncome: formatCurrency(0),
    billedIncome: formatCurrency(0),
    billedRatio: "0 clases",
    pendingApproval: "00",
    pendingRatio: "Limpio",
    ledgerRows: [],
    subtotal: formatCurrency(0),
    recordsFound: "0 registros facturables",
  };

  try {
    const incomePeriod = await getIngresosPeriodo(from, to, {
      consultoraId,
    });
    const pendingEntries = incomePeriod.detalle.filter((entry) =>
      isPendingClassification(entry.sinClasificar, entry.consultoraNombre),
    );
    const billableEntries = incomePeriod.detalle.filter(
      (entry) => !isPendingClassification(entry.sinClasificar, entry.consultoraNombre),
    );
    const billableTotal = sumBy(billableEntries, (entry) => entry.importeCalculado);

    return {
      ...incomeData,
      period: formatDateRange(incomePeriod.from, incomePeriod.to),
      entity: consultoraFilterLabel,
      status: consultoraId ? "Vista filtrada" : "Todas las consultoras",
      estimatedIncome: formatCurrency(billableTotal),
      billedIncome: formatCurrency(billableTotal),
      billedRatio: `${billableEntries.length} clases`,
      pendingApproval: String(pendingEntries.length).padStart(2, "0"),
      pendingRatio:
        pendingEntries.length > 0 ? `${pendingEntries.length} pendientes` : "Limpio",
      ledgerRows: incomePeriod.detalle.map((entry) => {
        const pending = isPendingClassification(entry.sinClasificar, entry.consultoraNombre);

        return {
          date: formatShortDate(entry.fechaClase),
          title: entry.tituloClase,
          code: `CL-${entry.claseId}`,
          entity: pending ? "Pendiente" : entry.consultoraNombre,
          consultant: pending ? "Sin clasificar" : entry.consultoraNombre,
          hours: (entry.duracionMinutos / 60).toFixed(1),
          status: pending ? "pendiente" : "facturable",
          amount: pending ? "Pendiente" : formatCurrency(entry.importeCalculado, entry.moneda),
        };
      }),
      subtotal: formatCurrency(billableTotal),
      recordsFound: `${billableEntries.length} registro${billableEntries.length === 1 ? "" : "s"} facturable${billableEntries.length === 1 ? "" : "s"}`,
      backendNotice:
        consultoraId
          ? "Los totales de ingresos se filtran por la consultora seleccionada. Las filas marcadas como Sin clasificar quedan fuera del total facturable."
          : "Los totales de ingresos excluyen las filas marcadas como Sin clasificar para mantener limpia la vista facturable.",
    };
  } catch (error) {
    const message =
      error instanceof BackendConfigError
        ? "BACKEND_BASE_URL no está configurado."
        : getApiErrorMessage(error) ?? "No se pudieron cargar los ingresos.";

    return {
      ...emptyIncomeData,
      backendNotice: `No se pudieron cargar los ingresos: ${message}`,
    };
  }
}

export async function getReportsData(date = new Date()): Promise<ReportsData> {
  return withFallback("reports", reportsData, async () => {
    const fromDate = startOfMonth(date);
    const toDate = endOfMonth(date);
    const from = toIsoDate(fromDate);
    const to = toIsoDate(toDate);
    const periodKey = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
    const [incomePeriod, consultoras] = await Promise.all([
      getIngresosPeriodo(from, to),
      getConsultoras().catch(() => []),
    ]);
    const realConsultoras = consultoras.filter(isRealConsultora);
    const totalHours = sumBy(incomePeriod.detalle, (entry) => entry.duracionMinutos) / 60;
    const firstExcelConsultoraId =
      Number(process.env.DEFAULT_REPORT_CONSULTORA_ID) ||
      realConsultoras.find((consultora) => consultora.requiereReporteExcel)?.id ||
      getConsultoraSeeds().find((seed) => seed.requiereReporteExcel)?.id;

    return {
      ...reportsData,
      monthLabel: formatMonthYear(date),
      summary:
        incomePeriod.cantidadClases > 0
          ? `Se preparó el período de exportación desde ${formatShortDate(
              incomePeriod.from,
            )} hasta ${formatShortDate(
              incomePeriod.to,
            )} con ${incomePeriod.cantidadClases} clases registradas.`
          : reportsData.summary,
      syncLabel:
        "La exportación a Excel ya está conectada. La sincronización de Google sigue siendo una acción operativa mientras el contrato OAuth continúa provisional.",
      insights: [
        { label: "Horas facturables totales", value: formatHours(totalHours * 60) },
        {
          label: "Clases registradas",
          value: String(incomePeriod.cantidadClases),
        },
        {
          label: "Ingresos estimados",
          value: formatCurrency(incomePeriod.total),
        },
      ],
      excelExportUrl: firstExcelConsultoraId
        ? getExcelReportUrl(firstExcelConsultoraId, periodKey)
        : null,
      backendNotice: firstExcelConsultoraId
        ? "La descarga de Excel ya funciona contra /api/reportes/excel. Las filas históricas siguen siendo placeholders del frontend hasta que el backend exponga metadatos de archivo."
        : "Definí DEFAULT_REPORT_CONSULTORA_ID o CONSULTORA_SEEDS_JSON para habilitar el botón de exportación Excel en vivo.",
    };
  });
}
