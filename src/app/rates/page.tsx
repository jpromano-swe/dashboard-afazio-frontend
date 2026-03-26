import { Building2, UserRound } from "lucide-react";
import {
  DashboardShell,
  PageActions,
  SectionFrame,
  StatusBadge,
} from "@/components/editorial";
import { RateCreateModal } from "@/components/rate-create-modal";
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
        <RateCreateModal activeConsultoras={activeConsultoras} />
      </div>

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
                <p className="mt-3 font-sans text-[2.2rem] font-black leading-none tracking-[-0.05em] text-primary">
                  {card.currentRate}
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
                {card.history.slice(0, 2).map((entry) => (
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
                {card.history.length > 2 ? (
                  <details className="rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-3">
                    <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                      Ver historial completo
                    </summary>
                    <div className="mt-4 space-y-4">
                      {card.history.slice(2).map((entry) => (
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
                  </details>
                ) : null}
              </div>
            </div>
          </SectionFrame>
        ))}

      </div>

      <div className="sticky bottom-6 mt-12 flex flex-col gap-6 rounded-[1.35rem] border border-outline-variant/20 bg-surface-container-lowest/88 px-6 py-5 text-sm text-on-surface-variant shadow-[0_18px_40px_rgba(6,27,14,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
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
        <p className="max-w-md text-[11px] uppercase tracking-[0.18em]">{data.syncNote}</p>
      </div>
    </DashboardShell>
  );
}
