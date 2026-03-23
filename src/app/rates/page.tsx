import { Building2, UserRound } from "lucide-react";
import {
  DashboardShell,
  PageActions,
  SectionFrame,
  StatusBadge,
} from "@/components/editorial";
import { RateCreateForm } from "@/components/rate-create-form";
import { getConsultoras, isRealConsultora } from "@/lib/backend";
import { getRatesData } from "@/lib/api";

export default async function RatesPage() {
  const [data, consultoras] = await Promise.all([
    getRatesData(),
    getConsultoras().catch(() => []),
  ]);
  const activeConsultoras = consultoras.filter(isRealConsultora);

  return (
    <DashboardShell
      active="rates"
      eyebrow={data.eyebrow}
      title="Tarifas"
      actions={<PageActions />}
    >
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-on-surface-variant/70">
            {data.eyebrow}
          </p>
          <h2 className="mt-3 font-headline text-5xl font-bold tracking-tight text-primary">
            {data.headline}
          </h2>
          {data.backendNotice ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant">
              {data.backendNotice}
            </p>
          ) : null}
        </div>

      </div>

      <section id="create-rate-form" className="mb-8">
        <SectionFrame className="bg-surface-container-lowest">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant/70">
                Tarifa
              </p>
              <h3 className="mt-2 font-headline text-3xl font-bold text-primary">
                Tarifa
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
                {activeConsultoras.length > 0
                  ? "Agregar o actualizar una tarifa de una consultora."
                  : "La búsqueda de consultoras no está disponible en esta solicitud, así que este formulario vuelve a la entrada manual de `consultoraId`."}
              </p>
            </div>
          </div>

          <RateCreateForm activeConsultoras={activeConsultoras} />
        </SectionFrame>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {data.cards.map((card, index) => (
          <SectionFrame key={card.name} className="bg-surface-container-lowest">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                    card.tone === "secondary"
                      ? "bg-secondary-container text-on-secondary-container"
                      : card.tone === "amber"
                        ? "bg-[#fde9cf] text-[#8f5a16]"
                        : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {index === 0 ? (
                    <Building2 className="h-6 w-6" />
                  ) : index === 1 ? (
                    <UserRound className="h-6 w-6" />
                  ) : (
                    <UserRound className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-headline text-3xl font-bold text-primary">
                    {card.name}
                  </h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {card.subtitle}
                  </p>
                </div>
              </div>

              <StatusBadge tone={card.status === "Activa" ? "confirmed" : "review"}>
                {card.status}
              </StatusBadge>
            </div>

            <div className="mt-8 grid gap-4 rounded-[1.2rem] bg-surface-container-low p-6 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                  Tarifa horaria actual
                </p>
                <p className="mt-3 inline-flex flex-wrap items-baseline gap-x-1 whitespace-nowrap font-headline text-[2.5rem] font-bold leading-none tracking-tight text-primary">
                  <span className="whitespace-nowrap">{card.currentRate}</span>
                  <span className="font-sans text-xs font-medium text-on-surface-variant">
                    por hora
                  </span>
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                  Vigente desde
                </p>
                <p className="mt-3 text-lg font-semibold text-primary">
                  {card.effectiveSince}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <p className="border-b border-outline-variant/15 pb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                Historial de tarifas
              </p>
              <div className="mt-4 space-y-4">
                {card.history.map((entry) => (
                  <div
                    key={`${entry.value}-${entry.range}`}
                    className="flex flex-col gap-2 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p>
                      <span className="font-headline text-xl text-primary">
                        {entry.value}
                      </span>
                      <span className="ml-2 text-[11px] uppercase tracking-[0.14em]">
                        {entry.note}
                      </span>
                    </p>
                    <p>{entry.range}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionFrame>
        ))}

      </div>

      <div className="mt-12 flex flex-col gap-6 border-t border-outline-variant/20 pt-8 text-sm text-on-surface-variant md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">
              Tarifa promedio global
            </p>
            <p className="mt-2 font-headline text-3xl text-primary">
              {data.averageRate}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">
              Filas cargadas
            </p>
            <p className="mt-2 font-headline text-3xl text-primary">
              {data.billableUnits}
            </p>
          </div>
        </div>
        <p className="text-[11px] uppercase tracking-[0.18em]">{data.syncNote}</p>
      </div>
    </DashboardShell>
  );
}
