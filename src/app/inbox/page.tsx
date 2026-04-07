import { CircleAlert } from "lucide-react";
import {
  DashboardShell,
  MobileTableHint,
  PageActions,
  SectionFrame,
  StatusBadge,
} from "@/components/editorial";
import {
  PENDING_CLASSIFICATION_COLUMNS,
  PendingClassificationTable,
} from "@/components/pending-classification-table";
import { getConsultoras, isRealConsultora } from "@/lib/backend";
import { getInboxData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const [data, consultoras] = await Promise.all([
    getInboxData(),
    getConsultoras().catch(() => []),
  ]);
  const activeConsultoras = consultoras.filter(isRealConsultora);

  return (
    <DashboardShell
      active="inbox"
      title="Pendientes"
      actions={<PageActions />}
    >
      <div className="space-y-8">
        <div className="grid gap-6">
          <SectionFrame className="bg-surface-container-lowest">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-3xl font-bold text-primary">
                Resumen de pendientes
              </h3>
              <CircleAlert className="h-5 w-5 text-[#ad6e24]" />
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="border-b border-outline-variant/20 pb-4 sm:rounded-[1.1rem] sm:border-b-0 sm:bg-surface-container-low sm:px-8 sm:py-7">
                <span className="block text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Horas pendientes
                </span>
                <span className="mt-3 block font-sans text-5xl font-black tracking-[-0.04em] text-primary">
                  {data.pendingHours}
                </span>
              </div>
              <div className="sm:rounded-[1.1rem] sm:bg-surface-container-low sm:px-8 sm:py-7">
                <span className="block text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Valor facturable estimado
                </span>
                <span className="mt-3 block font-sans text-5xl font-black tracking-[-0.04em] text-primary">
                  {data.estimatedValue}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-[1.2rem] bg-[#fde9cf] p-5 text-sm leading-6 text-[#634010]">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]">
                Consejo de clasificación
              </p>
              <p className="mt-2">{data.classificationTip}</p>
              <p className="mt-3 text-xs leading-5">
                {activeConsultoras.length > 0
                  ? "Elegí primero una consultora. La fila luego carga los cursos activos de esa consultora y te deja asignar un curso existente a esta clase o a toda la serie repetida."
                  : "La búsqueda de consultoras no está disponible en esta solicitud, así que la clasificación por curso no puede iniciar hasta que `/api/consultoras` vuelva a responder."}
              </p>
            </div>

            {data.backendNotice ? (
              <p className="mt-4 text-xs leading-6 text-on-surface-variant">
                {data.backendNotice}
              </p>
            ) : null}
          </SectionFrame>
        </div>

        <SectionFrame className="bg-surface-container-lowest">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-headline text-4xl font-bold text-primary">
                {data.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
                {data.subtitle}
              </p>
            </div>

            <div className="flex gap-2">
              <StatusBadge>Todos los meses</StatusBadge>
              <StatusBadge tone="billable">Sin clasificar</StatusBadge>
            </div>
          </div>

          <MobileTableHint />

          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[820px]">
              <div
                className="grid border-b border-outline-variant/20 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70"
                style={{ gridTemplateColumns: PENDING_CLASSIFICATION_COLUMNS }}
              >
                <div>Título original del calendario</div>
                <div>Fecha y hora</div>
                <div>Duración</div>
                <div>Cliente / empresa</div>
                <div className="text-right">Acciones</div>
              </div>

              <PendingClassificationTable
                sessions={data.sessions}
                consultoras={activeConsultoras}
              />
            </div>
          </div>

          <div className="mt-10 border-t border-outline-variant/20 pt-8">
            <p className="max-w-xl text-sm italic leading-6 text-on-surface-variant">
              Las clases quedan facturables por defecto. Tocá <span className="font-semibold text-primary">Clasificar</span> en cada fila para elegir la consultora y vincular la sesión a un curso existente.
            </p>
          </div>
        </SectionFrame>
      </div>
    </DashboardShell>
  );
}
