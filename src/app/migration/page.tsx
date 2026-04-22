import {
  DashboardShell,
  PageActions,
} from "@/components/editorial";
import { HistoricalSyncPanel } from "@/components/historical-sync-panel";
import { MigrationHistoryTable } from "@/components/migration-history-table";
import {
  getClasesPorPeriodo,
  getGoogleSyncUrl,
  getConsultoras,
  isRealConsultora,
} from "@/lib/backend";
import {
  endOfMonth,
  formatShortDate,
  startOfMonth,
  toIsoDate,
  toTimeZoneCalendarDate,
} from "@/lib/date-time";

export const dynamic = "force-dynamic";

type MigrationSearchParams = {
  from?: string | string[];
  to?: string | string[];
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isIsoDate(value: string | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function resolveDateParam(value: string | undefined, fallback: string) {
  return value && isIsoDate(value) ? value : fallback;
}

function formatRangeDate(value: string) {
  return formatShortDate(value);
}

export default async function MigrationPage({
  searchParams,
}: {
  searchParams?: Promise<MigrationSearchParams>;
}) {
  const today = toTimeZoneCalendarDate();
  const defaultFrom = toIsoDate(startOfMonth(today));
  const defaultTo = toIsoDate(endOfMonth(today));
  const resolvedSearchParams = (await searchParams) ?? {};
  const fromParam = firstValue(resolvedSearchParams.from);
  const toParam = firstValue(resolvedSearchParams.to);
  const rangeSelected = isIsoDate(fromParam) && isIsoDate(toParam);
  const from = resolveDateParam(fromParam, defaultFrom);
  const to = resolveDateParam(toParam, defaultTo);
  const [migrationClasses, consultoras] = await Promise.all([
    getClasesPorPeriodo(from, to, {
      soloClasificadas: true,
    }).catch(() => []),
    getConsultoras().catch(() => []),
  ]);
  const activeConsultoras = consultoras
    .filter(isRealConsultora)
    .slice()
    .sort((left, right) => left.nombre.localeCompare(right.nombre));
  const selectedRangeLabel = `${formatRangeDate(from)} a ${formatRangeDate(to)}`;
  const syncUrl = getGoogleSyncUrl(
    `${from}T00:00:00-03:00`,
    `${to}T23:59:59-03:00`,
  );

  return (
    <DashboardShell
      active="migration"
      title="Historial"
      actions={<PageActions />}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-on-surface-variant/70">
            Carga histórica
          </p>
          <h2 className="mt-3 font-headline text-5xl font-bold tracking-tight text-primary">
            Historial
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant">
            Revisá {selectedRangeLabel}, sincronizá el rango del calendario y corregí estados o clasificaciones sobre la base histórica.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <HistoricalSyncPanel
          from={from}
          to={to}
          rangeLabel={`${from} a ${to}`}
          syncUrl={syncUrl}
          classCount={migrationClasses.length}
          rangeSelected={rangeSelected}
        />
      </div>

      <MigrationHistoryTable
        classes={migrationClasses}
        consultoras={activeConsultoras}
        rangeLabel={selectedRangeLabel}
      />
    </DashboardShell>
  );
}
