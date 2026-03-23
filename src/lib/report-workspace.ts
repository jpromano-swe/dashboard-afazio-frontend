import {
  getConsultoras,
  getConsultoraSeeds,
  getExcelReportUrl,
  getIngresosPeriodo,
  isPendingClassification,
  isRealConsultora,
} from "@/lib/backend";

const DEFAULT_TIME_ZONE = "America/Argentina/Buenos_Aires";

type ReportTheme = "amber" | "purple";

type ReportModuleConfig = {
  moduleName: string;
  consultoraName: string;
  theme: ReportTheme;
};

type BillingPeriod = {
  key: string;
  from: string;
  to: string;
  label: string;
};

export type ReportPreviewRow = {
  classId: number;
  date: string;
  title: string;
  company: string;
  group: string;
  time: string;
  duration: string;
  rate: string;
  amount: string;
  status: "Listo" | "Tarifa faltante";
};

export type ReportWorkspaceData = BillingPeriod & {
  moduleName: string;
  consultoraName: string;
  consultoraId: number | null;
  theme: ReportTheme;
  totalClasses: number;
  totalHours: string;
  totalAmount: string | null;
  excelHref: string | null;
  emptyStateMessage: string | null;
  warnings: string[];
  rows: ReportPreviewRow[];
  emailSubject: string;
  emailBody: string;
};

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

function formatShortDate(dateInput: string | Date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: DEFAULT_TIME_ZONE,
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(dateInput));
}

function formatMonthYear(dateInput: string | Date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: DEFAULT_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(new Date(dateInput));
}

function formatTime(dateInput: string | Date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: DEFAULT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateInput));
}

function formatLooseAmount(value: string | number, currency: string) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return `Pendiente ${currency}`;
  }

  return `${currency} ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)}`;
}

function formatHours(minutes: number) {
  const hours = minutes / 60;

  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

function includeClassTitle(title: string | null | undefined) {
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

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function buildPeriod(date = new Date()): BillingPeriod {
  const periodDate = new Date(date.getFullYear(), date.getMonth(), 1);

  return {
    key: `${periodDate.getFullYear()}-${pad(periodDate.getMonth() + 1)}`,
    from: toIsoDate(startOfMonth(periodDate)),
    to: toIsoDate(endOfMonth(periodDate)),
    label: formatMonthYear(periodDate),
  };
}

function resolveConsultoraSeed(config: ReportModuleConfig) {
  const moduleName = normalize(config.consultoraName);

  return getConsultoraSeeds().find((seed) => normalize(seed.nombre) === moduleName) ?? null;
}

function getReportThemePrefix(theme: ReportTheme) {
  return theme === "amber" ? "Haskler" : "BLC";
}

function isNoDictatedClassesMessage(error: unknown) {
  if (typeof error !== "object" || error === null || !("message" in error)) {
    return false;
  }

  const message = String((error as { message?: unknown }).message ?? "").toLowerCase();

  return message.includes("no se encontraron clases dictadas");
}

export async function loadReportWorkspace(
  config: ReportModuleConfig,
  date = new Date(),
): Promise<ReportWorkspaceData> {
  const period = buildPeriod(date);
  const moduleName = normalize(config.consultoraName);
  const liveConsultoras = (await getConsultoras().catch(() => [])).filter(isRealConsultora);
  const liveConsultora = liveConsultoras.find((consultora) => normalize(consultora.nombre) === moduleName) ?? null;
  const seedConsultora = liveConsultora ? null : resolveConsultoraSeed(config);
  const consultoraId = liveConsultora?.id ?? seedConsultora?.id ?? null;

  const incomeResult = consultoraId
    ? await getIngresosPeriodo(period.from, period.to, { consultoraId })
        .then((value) => ({ value, error: null as unknown }))
        .catch((error) => ({ value: null, error }))
    : { value: null, error: null as unknown };

  const detailRows = incomeResult.value?.detalle ?? [];
  const rows = detailRows
    .filter((entry) => includeClassTitle(entry.tituloClase))
    .map((entry) => {
      const hours = Number(entry.duracionMinutos) / 60;
      const formattedHours = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
      const pending = isPendingClassification(entry.sinClasificar, entry.consultoraNombre);

      return {
        classId: entry.claseId,
        date: formatShortDate(entry.fechaClase),
        title: entry.tituloClase,
        company: pending ? "Sin clasificar" : entry.empresa ?? "Sin clasificar",
        group: entry.grupo ?? "Sin clasificar",
        time: formatTime(entry.fechaClase),
        duration: `${formattedHours} h${formattedHours === "1" ? "" : "s"}`,
        rate: pending ? "—" : formatLooseAmount(entry.montoPorHora, entry.moneda),
        amount: pending ? "—" : formatLooseAmount(entry.importeCalculado, entry.moneda),
        status: pending ? ("Tarifa faltante" as const) : ("Listo" as const),
      };
    });

  const totalMinutes = detailRows.reduce((total, entry) => total + entry.duracionMinutos, 0);
  const totalAmount = incomeResult.value ? formatLooseAmount(incomeResult.value.total, detailRows[0]?.moneda ?? "ARS") : null;
  const warnings: string[] = [];
  let emptyStateMessage: string | null = null;

  if (!consultoraId) {
    warnings.push(
      `${config.consultoraName} todavía no está mapeada a una consultora real. Revisá /api/consultoras antes de exportar.`,
    );
  }

  if (incomeResult.error && isNoDictatedClassesMessage(incomeResult.error)) {
    emptyStateMessage = "No se encontraron clases dictadas en este período.";
  } else if (incomeResult.error) {
    const message =
      typeof incomeResult.error === "object" &&
      incomeResult.error !== null &&
      "message" in incomeResult.error
        ? String((incomeResult.error as { message?: unknown }).message ?? "")
        : "Error de exportación desconocido";

    warnings.push(
      message.trim()
        ? `La vista previa de Excel es parcial porque el endpoint de facturación rechazó el período: ${message}`
        : "La vista previa de Excel es parcial porque el endpoint de facturación rechazó el período.",
    );
  }

  if (rows.length === 0 && !emptyStateMessage) {
    emptyStateMessage = "No se encontraron clases dictadas en este período.";
  }

  if (rows.length > 9) {
    warnings.push("Se superó el límite de plantillas: el Excel se rompe después de 9 filas.");
  }

  const themePrefix = getReportThemePrefix(config.theme);

  return {
    ...period,
    moduleName: config.moduleName,
    consultoraName: config.consultoraName,
    consultoraId,
    theme: config.theme,
    totalClasses: incomeResult.value?.cantidadClases ?? rows.length,
    totalHours: formatHours(totalMinutes),
    totalAmount,
    excelHref: consultoraId ? getExcelReportUrl(consultoraId, period.key) : null,
    emptyStateMessage,
    warnings,
    rows,
    emailSubject: `${config.consultoraName} - paquete de facturación - ${period.label}`,
    emailBody:
      `Hola,\n\nAdjunto el paquete de facturación de ${config.consultoraName} para ${period.label}. ` +
      `La vista previa actual muestra ${rows.length} clases y ${totalAmount ?? "pendiente"} de ingreso total.\n\n` +
      `Saludos,\n${themePrefix} backoffice académico`,
  };
}

export type { ReportModuleConfig, ReportTheme };
