import { CalendarDays, Filter, Landmark } from "lucide-react";
import {
  ActionButton,
  DashboardShell,
  PageActions,
  SectionFrame,
  StatusBadge,
} from "@/components/editorial";
import { IncomeLedger } from "@/components/income-ledger";
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
  const showDistinctTotals = view.estimatedIncome !== view.billedIncome;

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

      <div className={`mt-10 grid gap-6 ${showDistinctTotals ? "lg:grid-cols-2" : "lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]"}`}>
        <div className="paper-panel rounded-[1.4rem] bg-primary-container p-8 text-on-primary">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c3d4c6]">
            Total facturable del período
          </p>
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-5xl font-black tracking-[-0.05em]">
                {showDistinctTotals ? view.estimatedIncome : view.billedIncome}
              </p>
              <p className="mt-3 text-sm text-[#b4cdb8]">
                {showDistinctTotals
                  ? "Ganancias proyectadas para el rango seleccionado."
                  : "Total listo para leer y conciliar en el rango seleccionado."}
              </p>
            </div>
            <CalendarDays className="mt-1 h-6 w-6 text-[#b4cdb8]" />
          </div>
        </div>

        <div className="paper-panel rounded-[1.4rem] bg-surface-container-lowest p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-on-surface-variant/70">
            {showDistinctTotals ? "Total facturado" : "Registros incluidos"}
          </p>
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-5xl font-black tracking-[-0.05em] text-primary">
                {showDistinctTotals ? view.billedIncome : view.billedRatio}
              </p>
              <p className="mt-3 text-sm text-on-surface-variant">
                {showDistinctTotals
                  ? "Horas ya validadas e incluidas en este filtro."
                  : `${view.pendingRatio}. ${view.status}.`}
              </p>
            </div>
            {showDistinctTotals ? (
              <StatusBadge tone="archived">{view.billedRatio}</StatusBadge>
            ) : null}
          </div>
        </div>
      </div>

      <IncomeLedger
        rows={view.ledgerRows}
        subtotal={view.subtotal}
        backendNotice={view.backendNotice}
      />
    </DashboardShell>
  );
}
