import type { ClaseEstado } from "@/lib/backend";

export type DashboardMetric = {
  label: string;
  value: string;
  helper?: string;
  icon: "calendar" | "pending" | "income" | "tasks";
  accent?: "default" | "amber";
};

export type ScheduleEntry = {
  id?: number;
  googleEventId?: string | null;
  meetingUrl?: string | null;
  classState?: ClaseEstado;
  consultantName?: string | null;
  title: string;
  subtitle: string;
  time: string;
  duration: string;
  status: "confirmed" | "pending" | "billable" | "danger" | "review" | "muted";
  action: string;
  muted?: boolean;
};

export type WeeklyScheduleDay = {
  label: string;
  dateLabel: string;
  entries: ScheduleEntry[];
};

export type MaterialEntry = {
  name: string;
  meta: string;
  actions: string[];
};

export type StudentAlert = {
  initials: string;
  name: string;
  note: string;
  tone: "danger" | "confirmed";
};

export type DashboardData = {
  headerTitle: string;
  weekRangeLabel: string;
  metrics: DashboardMetric[];
  schedule: ScheduleEntry[];
  weeklySchedule: WeeklyScheduleDay[];
  materials: MaterialEntry[];
  alerts: StudentAlert[];
  backendNotice?: string;
};

export type ImportedSession = {
  id?: number;
  cursoId?: number | null;
  googleEventId?: string | null;
  meetingUrl?: string | null;
  sinClasificar?: boolean;
  title: string;
  date: string;
  duration: string;
  client: string;
  company: string;
  billable: boolean;
  consultoraId?: number | null;
  consultoraNombre?: string | null;
  empresa?: string | null;
  grupo?: string | null;
  issue?: string;
};

export type InboxData = {
  title: string;
  subtitle: string;
  sessions: ImportedSession[];
  pendingHours: string;
  estimatedValue: string;
  classificationTip: string;
  conflicts: Array<{ title: string; detail: string; tone: "danger" | "pending" }>;
  backendNotice?: string;
};

export type RateCard = {
  name: string;
  subtitle: string;
  status: "Activa" | "Revisión pendiente";
  tone: "secondary" | "amber" | "neutral";
  currentRate: string;
  effectiveSince: string;
  history: Array<{ value: string; note: string; range: string }>;
};

export type RatesData = {
  eyebrow: string;
  headline: string;
  cards: RateCard[];
  averageRate: string;
  billableUnits: string;
  syncNote: string;
  backendNotice?: string;
};

export type IncomeRow = {
  date: string;
  title: string;
  code: string;
  entity: string;
  consultant: string;
  hours: string;
  status: "confirmado" | "pendiente" | "facturable";
  amount: string;
};

export type IncomeData = {
  period: string;
  entity: string;
  status: string;
  estimatedIncome: string;
  billedIncome: string;
  billedRatio: string;
  billedHours: string;
  pendingApproval: string;
  pendingRatio: string;
  ledgerRows: IncomeRow[];
  subtotal: string;
  recordsFound: string;
  backendNotice?: string;
};

export type ExportEntry = {
  periodName: string;
  description: string;
  generatedDate: string;
  status: "archivado" | "revisión";
  formats: string[];
  action: string;
};

export type ReportsData = {
  monthLabel: string;
  summary: string;
  syncLabel: string;
  insights: Array<{ label: string; value: string }>;
  exports: ExportEntry[];
  excelExportUrl?: string | null;
  backendNotice?: string;
};

export const dashboardData: DashboardData = {
  headerTitle: "Backoffice académico",
  weekRangeLabel: "Esta semana",
  metrics: [
    { label: "Clases de hoy", value: "06", icon: "calendar" },
    {
      label: "Clasificación pendiente",
      value: "03",
      icon: "pending",
      accent: "amber",
    },
    { label: "Ingresos mensuales", value: "ARS 4.820", icon: "income" },
    { label: "Próximas tareas", value: "12", icon: "tasks" },
  ],
  schedule: [
    {
      title: "Fonética y dicción avanzada",
      subtitle: "Grupo A · Nivel inicial",
      time: "09:00 AM",
      duration: "90 min",
      status: "confirmed",
      action: "Marcar asistencia",
    },
    {
      title: "Seminario de literatura victoriana",
      subtitle: "Particular · Emily Bronte (sesión 4)",
      time: "11:30 AM",
      duration: "60 min",
      status: "pending",
      action: "Marcar asistencia",
    },
    {
      title: "Introducción a la redacción",
      subtitle: "Nivel secundario · Segundo cuatrimestre",
      time: "02:00 PM",
      duration: "45 min",
      status: "billable",
      action: "Ver resumen",
      muted: true,
    },
    {
      title: "Taller de escritura creativa",
      subtitle: "Clase nocturna para adultos",
      time: "05:30 PM",
      duration: "120 min",
      status: "confirmed",
      action: "Marcar asistencia",
    },
  ],
  weeklySchedule: [
    { label: "Lunes", dateLabel: "Lun", entries: [] },
    { label: "Martes", dateLabel: "Mar", entries: [] },
    { label: "Miércoles", dateLabel: "Mié", entries: [] },
    { label: "Jueves", dateLabel: "Jue", entries: [] },
    { label: "Viernes", dateLabel: "Vie", entries: [] },
  ],
  materials: [
    {
      name: "Diapositivas_fonetica_V2.pdf",
      meta: "Subido hace 2 horas · 4.2 MB",
      actions: ["Compartir con la clase", "Anotar"],
    },
    {
      name: "Rúbrica_evaluación_taller.xlsx",
      meta: "Actualizado ayer · 1.1 MB",
      actions: ["Abrir libro", "Duplicar"],
    },
  ],
  alerts: [
    {
      initials: "JB",
      name: "Julian Barnes",
      note: "Asistencia baja",
      tone: "danger",
    },
    {
      initials: "AW",
      name: "Alice Walker",
      note: "Racha destacada",
      tone: "confirmed",
    },
  ],
};

export const inboxData: InboxData = {
  title: "Pendientes",
  subtitle: "Se encontraron 12 clases sin clasificar desde tu calendario de Google.",
  sessions: [
    {
      title: "Fonética avanzada - Sección B",
      date: "12 oct 2023 · 09:00",
      duration: "90 min",
      client: "Dra. Elena Rossi",
      company: "Departamento de lingüística",
      billable: true,
    },
    {
      title: "Tutoría particular: preparación IELTS",
      date: "12 oct 2023 · 14:30",
      duration: "60 min",
      client: "Mark J.",
      company: "Particular",
      billable: true,
    },
    {
      title: "Seminario: poesía moderna",
      date: "13 oct 2023 · 11:00",
      duration: "120 min",
      client: "No detectado",
      company: "Grupo desconocido",
      billable: false,
      issue: "Grupo desconocido",
    },
  ],
  pendingHours: "14.5",
  estimatedValue: "$942.00",
  classificationTip:
    "La mayoría de las clases sin clasificar coincide con patrones del Departamento de lingüística. Podés aplicar esas reglas automáticamente a entradas similares cuando el backend esté conectado.",
  conflicts: [
    {
      title: "Reserva duplicada",
      detail: "14 oct · IELTS Prep se superpone con Reunión de equipo.",
      tone: "danger",
    },
    {
      title: "Faltan tarifas",
      detail: "3 clases con “Nuevo centro académico” no tienen tarifa definida.",
      tone: "pending",
    },
  ],
};

export const ratesData: RatesData = {
  eyebrow: "Administración de consultoras",
  headline: "Libro de tarifas",
  cards: [
    {
      name: "Haskler Group",
      subtitle: "Socio académico premium",
      status: "Activa",
      tone: "secondary",
      currentRate: "$185.00",
      effectiveSince: "12 ene 2024",
      history: [
        { value: "$170.00", note: "Estándar", range: "Mar 2023 — Ene 2024" },
        { value: "$155.00", note: "Alta inicial", range: "Ago 2022 — Mar 2023" },
      ],
    },
    {
      name: "BLC Consultant",
      subtitle: "Firma de análisis literario",
      status: "Activa",
      tone: "amber",
      currentRate: "$210.00",
      effectiveSince: "05 nov 2023",
      history: [
        { value: "$195.00", note: "Estándar", range: "Ene 2023 — Nov 2023" },
        {
          value: "$180.00",
          note: "Introductoria",
          range: "Sep 2022 — Ene 2023",
        },
      ],
    },
    {
      name: "PLS",
      subtitle: "División de servicios lingüísticos",
      status: "Revisión pendiente",
      tone: "neutral",
      currentRate: "$145.00",
      effectiveSince: "14 feb 2023",
      history: [{ value: "$130.00", note: "Histórica", range: "Ago 2021 — Feb 2023" }],
    },
  ],
  averageRate: "$180.00",
  billableUnits: "124 h esta semana",
  syncNote: "Última actualización: 24 oct 2024 a las 09:15",
};

export const incomeData: IncomeData = {
  period: "01 oct 2023 - 31 dic 2023",
  entity: "Todas las entidades",
  status: "Todos los estados",
  estimatedIncome: "$12,450.00",
  billedIncome: "$8,120.00",
  billedRatio: "65% del total",
  billedHours: "24.5 horas",
  pendingApproval: "$4,330.00",
  pendingRatio: "40%",
  ledgerRows: [
    {
      date: "12 dic 2023",
      title: "Taller de fonética avanzada",
      code: "ED-772",
      entity: "Haskler Group",
      consultant: "Dra. Elena Rossi",
      hours: "4.5",
      status: "confirmado",
      amount: "$675.00",
    },
    {
      date: "10 dic 2023",
      title: "Revisión de literatura",
      code: "LT-910",
      entity: "BLC Consultant",
      consultant: "Marcus Thorne",
      hours: "2.0",
      status: "pendiente",
      amount: "$300.00",
    },
    {
      date: "08 dic 2023",
      title: "Consulta de diseño curricular",
      code: "ADM-101",
      entity: "Particular",
      consultant: "Dr. Henderson",
      hours: "12.0",
      status: "facturable",
      amount: "$2,160.00",
    },
    {
      date: "05 dic 2023",
      title: "Redacción en inglés II - Sección B",
      code: "ENG-202",
      entity: "PLS",
      consultant: "Dra. Elena Rossi",
      hours: "3.0",
      status: "confirmado",
      amount: "$450.00",
    },
  ],
  subtotal: "$3,585.00",
  recordsFound: "14 registros encontrados",
};

export const reportsData: ReportsData = {
  monthLabel: "Octubre 2023",
  summary:
    "Todas las horas de clase y los hitos de facturación ya fueron verificados para este ciclo.",
  syncLabel: "Última sincronización: hace 2 horas",
  insights: [
    { label: "Horas facturables totales", value: "142.5" },
    { label: "Entregas de estudiantes", value: "89" },
    { label: "Ingresos estimados", value: "ARS 4.820,00" },
  ],
  exports: [
    {
      periodName: "Septiembre 2023",
      description: "Resumen de cierre de período",
      generatedDate: "02 oct 2023",
      status: "archivado",
      formats: ["Excel", "PDF"],
      action: "Descargar paquete",
    },
    {
      periodName: "Agosto 2023",
      description: "Mensual estándar",
      generatedDate: "01 sep 2023",
      status: "archivado",
      formats: ["Excel"],
      action: "Descargar paquete",
    },
    {
      periodName: "Julio 2023",
      description: "Sesión de verano",
      generatedDate: "03 ago 2023",
      status: "revisión",
      formats: ["PDF"],
      action: "Revisar exportación",
    },
  ],
};
