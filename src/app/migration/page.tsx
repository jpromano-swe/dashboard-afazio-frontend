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

export const dynamic = "force-dynamic";

export default async function MigrationPage() {
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const from = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, "0")}-${String(periodStart.getDate()).padStart(2, "0")}`;
  const to = `${periodEnd.getFullYear()}-${String(periodEnd.getMonth() + 1).padStart(2, "0")}-${String(periodEnd.getDate()).padStart(2, "0")}`;
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
  const monthLabelEs = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(today);
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
            Historial de {monthLabelEs}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant">
            Revisá el mes seleccionado, sincronizá el rango del calendario y corregí estados o clasificaciones sobre la base histórica.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <HistoricalSyncPanel rangeLabel={`${from} a ${to}`} syncUrl={syncUrl} />
      </div>

      <MigrationHistoryTable
        classes={migrationClasses}
        consultoras={activeConsultoras}
      />
    </DashboardShell>
  );
}
