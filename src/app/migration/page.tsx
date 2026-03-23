import {
  DashboardShell,
  PageActions,
  SectionFrame,
} from "@/components/editorial";
import { HistoricalSyncPanel } from "@/components/historical-sync-panel";
import { MigrationClassRow } from "@/components/migration-class-row";
import {
  getClasesPorPeriodo,
  getGoogleSyncUrl,
  getConsultoras,
  isRealConsultora,
} from "@/lib/backend";

export const dynamic = "force-dynamic";

function getTitleGroupKey(title: string) {
  return title.trim().toLowerCase();
}

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
  const sameTitleIdsByKey = new Map<string, number[]>();

  migrationClasses.forEach((clase) => {
    const key = getTitleGroupKey(clase.titulo);
    const group = sameTitleIdsByKey.get(key) ?? [];
    group.push(clase.id);
    sameTitleIdsByKey.set(key, group);
  });

  const syncUrl = getGoogleSyncUrl(
    `${from}T00:00:00-03:00`,
    `${to}T23:59:59-03:00`,
  );

  return (
    <DashboardShell
      active="migration"
      title="Migración"
      actions={<PageActions />}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-on-surface-variant/70">
            Carga histórica
          </p>
          <h2 className="mt-3 font-headline text-5xl font-bold tracking-tight text-primary">
            Migración de {monthLabelEs}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant">
            Revisá el mes seleccionado, sincronizá el rango del calendario y
            clasificá cada clase con el mismo flujo de cursos usados en Bandeja.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <HistoricalSyncPanel rangeLabel={`${from} a ${to}`} syncUrl={syncUrl} />
      </div>

      <SectionFrame className="mt-6 bg-surface-container-lowest p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-surface-container-high/60 text-left">
              <tr>
                {["Fecha", "Clase", "Consultora", "Estado", "Acciones"].map((label) => (
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
              {migrationClasses.map((clase) => (
                <MigrationClassRow
                  key={clase.id}
                  clase={clase}
                  consultoras={activeConsultoras}
                  sameTitleIds={sameTitleIdsByKey.get(getTitleGroupKey(clase.titulo)) ?? []}
                />
              ))}
            </tbody>
          </table>
        </div>

        {migrationClasses.length === 0 ? (
          <div className="px-6 py-8 text-sm text-on-surface-variant">
            No se encontraron clases para este período de migración.
          </div>
        ) : null}
      </SectionFrame>
    </DashboardShell>
  );
}
