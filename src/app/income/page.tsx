import { CalendarDays, Filter, Landmark } from "lucide-react";
import {
  ActionButton,
  DashboardShell,
  MobileTableHint,
  PageActions,
  SectionFrame,
  StatusBadge,
} from "@/components/editorial";
import { getIncomeData } from "@/lib/api";
import { getConsultoras, isRealConsultora } from "@/lib/backend";

export const dynamic = "force-dynamic";

type IncomeSearchParams = {
  from?: string | string[];
  to?: string | string[];
  consultoraId?: string | string[];
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

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

function isIsoDate(value: string | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function getIncomeStatusTone(status: string) {
  if (status === "confirmado") {
    return "confirmed" as const;
  }

  if (status === "pendiente") {
    return "pending" as const;
  }

  if (status === "facturable") {
    return "billable" as const;
  }

  return "muted" as const;
}

function getIncomeStatusLabel(status: string) {
  if (status === "confirmado") {
    return "Confirmado";
  }

  if (status === "pendiente") {
    return "Pendiente";
  }

  if (status === "facturable") {
    return "Facturable";
  }

  return status;
}

export default async function IncomePage({
  searchParams,
}: {
  searchParams?: Promise<IncomeSearchParams>;
}) {
  const today = new Date();
  const defaultFrom = toIsoDate(startOfMonth(today));
  const defaultTo = toIsoDate(endOfMonth(today));
  const resolvedSearchParams = (await searchParams) ?? {};

  const fromParam = firstValue(resolvedSearchParams.from);
  const toParam = firstValue(resolvedSearchParams.to);
  const consultoraIdParam = firstValue(resolvedSearchParams.consultoraId);

  const from = isIsoDate(fromParam) ? fromParam : defaultFrom;
  const to = isIsoDate(toParam) ? toParam : defaultTo;
  const parsedConsultoraId = consultoraIdParam ? Number(consultoraIdParam) : NaN;
  const consultoraId =
    Number.isFinite(parsedConsultoraId) && parsedConsultoraId > 0
      ? parsedConsultoraId
      : undefined;

  const [data, consultoras] = await Promise.all([
    getIncomeData({ from, to, consultoraId }),
    getConsultoras().catch(() => []),
  ]);

  const activeConsultoras = consultoras
    .filter(isRealConsultora)
    .slice()
    .sort((left, right) => left.nombre.localeCompare(right.nombre));
  const selectedConsultora = consultoraId
    ? activeConsultoras.find((consultora) => consultora.id === consultoraId) ?? null
    : null;
  const entityLabel = selectedConsultora?.nombre ?? (consultoraId ? "Consultora seleccionada" : "Todas las consultoras");
  const periodLabel = `${from} a ${to}`;
  const view = {
    ...data,
    entity: entityLabel,
    status: consultoraId ? "Vista filtrada" : "Todas las consultoras",
  };

  return (
    <DashboardShell
      active="income"
      title="Ingresos"
      actions={<PageActions />}
    >
      {view.backendNotice ? (
        <p className="mb-6 max-w-4xl text-sm leading-6 text-on-surface-variant">
          {view.backendNotice}
        </p>
      ) : null}

      <SectionFrame className="bg-surface-container-lowest">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-on-surface-variant/70">
              Filtros de consulta
            </p>
            <h2 className="mt-3 font-headline text-4xl font-bold tracking-tight text-primary">
              Rango de período y consultora
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant">
              Filtrá el libro de ingresos por rango de fechas y, opcionalmente, por
              una sola consultora activa.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={consultoraId ? "review" : "confirmed"}>
              {consultoraId ? entityLabel : "Todas las consultoras"}
            </StatusBadge>
            <StatusBadge tone="billable">{periodLabel}</StatusBadge>
          </div>
        </div>

        <form
          method="get"
          className="mt-8 grid gap-4 rounded-[1.3rem] bg-surface-container-low p-4 md:grid-cols-2 xl:grid-cols-[repeat(3,minmax(0,1fr))_auto]"
        >
          <label className="space-y-2">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              <CalendarDays className="h-4 w-4" />
              Rango de período
            </span>
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              <CalendarDays className="h-4 w-4" />
              Hasta
            </span>
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              <Landmark className="h-4 w-4" />
              Consultora
            </span>
            <select
              name="consultoraId"
              defaultValue={consultoraId ? String(consultoraId) : ""}
              className="w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-sm text-primary outline-none"
            >
              <option value="">Todas las consultoras</option>
              {activeConsultoras.map((consultora) => (
                <option key={consultora.id} value={consultora.id}>
                  {consultora.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <ActionButton
              type="submit"
              variant="primary"
              icon={<Filter className="h-4 w-4" />}
              className="h-[50px] w-full justify-center"
            >
              Aplicar filtros
            </ActionButton>
          </div>
        </form>
      </SectionFrame>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="paper-panel rounded-[1.4rem] bg-primary-container p-8 text-on-primary">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c3d4c6]">
            Ingreso total estimado
          </p>
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <p className="font-headline text-5xl font-bold tracking-tight">
                {view.estimatedIncome}
              </p>
              <p className="mt-3 text-sm text-[#b4cdb8]">
                Ganancias proyectadas para el rango seleccionado.
              </p>
            </div>
            <CalendarDays className="mt-1 h-6 w-6 text-[#b4cdb8]" />
          </div>
        </div>

        <div className="paper-panel rounded-[1.4rem] bg-surface-container-lowest p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-on-surface-variant/70">
            Total facturado
          </p>
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <p className="font-headline text-5xl font-bold tracking-tight text-primary">
                {view.billedIncome}
              </p>
              <p className="mt-3 text-sm text-on-surface-variant">
                Horas ya validadas e incluidas en este filtro.
              </p>
            </div>
            <StatusBadge tone="archived">{view.billedRatio}</StatusBadge>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-headline text-4xl font-bold text-primary">
              Libro facturable
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Detalle de sesiones y honorarios por consultora.
            </p>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant/70">
            {view.recordsFound}
          </p>
        </div>

        <SectionFrame className="mt-6 bg-surface-container-lowest p-0">
          <MobileTableHint />
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-surface-container-high/60 text-left">
                <tr>
                  {[
                    "Fecha",
                    "Clase / descripción",
                    "Entidad",
                    "Consultora",
                    "Horas",
                    "Estado",
                    "Importe",
                  ].map((label) => (
                    <th
                      key={label}
                      className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {view.ledgerRows.length > 0 ? (
                  view.ledgerRows.map((row) => (
                    <tr key={`${row.date}-${row.title}`} className="hover:bg-surface-container-low/60">
                      <td className="px-6 py-5 font-headline text-lg text-primary">
                        {row.date}
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-primary">{row.title}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-on-surface-variant">
                          {row.code}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">{row.entity}</td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">
                        {row.consultant}
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">{row.hours}</td>
                      <td className="px-6 py-5">
                        <StatusBadge tone={getIncomeStatusTone(row.status)}>
                          {getIncomeStatusLabel(row.status)}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-5 text-right font-headline text-2xl font-bold text-primary">
                        {row.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-sm leading-6 text-on-surface-variant"
                    >
                      {view.backendNotice
                        ? "No se pudieron mostrar ingresos para este rango. Revisá el aviso superior."
                        : "No hay clases facturables para este rango todavía."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant/15 px-6 py-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
              Subtotal de la vista actual
            </span>
            <span className="font-headline text-3xl font-bold text-primary">
              {view.subtotal}
            </span>
          </div>
        </SectionFrame>
      </section>
    </DashboardShell>
  );
}
