import { CircleAlert } from "lucide-react";
import {
  ActionButton,
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

export default async function InboxPage() {
  const [data, consultoras] = await Promise.all([
    getInboxData(),
    getConsultoras().catch(() => []),
  ]);
  const activeConsultoras = consultoras.filter(isRealConsultora);

  return (
    <DashboardShell
      active="inbox"
      title="Clases Pendientes"
      actions={<PageActions />}
    >
      <div className="space-y-8">
        <div className="grid gap-6">
          <SectionFrame className="bg-surface-container-lowest">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-3xl font-bold text-primary">
                Resumen pendiente
              </h3>
              <CircleAlert className="h-5 w-5 text-[#ad6e24]" />
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 sm:block sm:border-b-0 sm:rounded-[1.1rem] sm:bg-surface-container-low sm:p-5">
                <span className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Horas sin clasificar
                </span>
                <span className="font-headline text-4xl font-bold text-primary">
                  {data.pendingHours}
                </span>
              </div>
              <div className="flex items-center justify-between sm:block sm:rounded-[1.1rem] sm:bg-surface-container-low sm:p-5">
                <span className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Valor facturable estimado
                </span>
                <span className="font-headline text-4xl font-bold text-primary">
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
            <div className="min-w-[920px]">
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

          <div className="mt-10 flex flex-col gap-4 border-t border-outline-variant/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-sm italic text-on-surface-variant">
              Consejo: las clases quedan facturables por defecto. Solo necesitás elegir
              la consultora y el curso correcto para guardarlas.
            </p>
            <div className="flex flex-wrap gap-3">
              <ActionButton variant="outline" disabled>
                Descartar seleccionadas
              </ActionButton>
              <ActionButton variant="primary" disabled>
                Confirmar clasificación
              </ActionButton>
            </div>
          </div>
        </SectionFrame>
      </div>
    </DashboardShell>
  );
}
