import {
  Building2,
  CalendarRange,
  FileSpreadsheet,
} from "lucide-react";
import {
  DashboardShell,
  SectionFrame,
  StatusBadge,
} from "@/components/editorial";
import { CourseCardActions } from "@/components/course-card-actions";
import { ParametersManagementPanel } from "@/components/parameters-management-panel";
import { getConsultoras, getCursos, isRealConsultora } from "@/lib/backend";

export default async function ParametersPage() {
  let backendUnavailable = false;
  let consultoras = [] as Awaited<ReturnType<typeof getConsultoras>>;

  try {
    consultoras = (await getConsultoras())
      .filter(isRealConsultora)
      .slice()
      .sort((left, right) => left.nombre.localeCompare(right.nombre));
  } catch {
    backendUnavailable = true;
  }

  const consultorasWithCursos = await Promise.all(
    consultoras.map(async (consultora) => ({
      consultora,
      cursos: await getCursos(consultora.id).catch(() => []),
    })),
  );

  const activeCount = consultoras.filter((consultora) => consultora.activa).length;
  const excelEnabledCount = consultoras.filter(
    (consultora) => consultora.requiereReporteExcel,
  ).length;
  const totalCursos = consultorasWithCursos.reduce(
    (total, entry) => total + entry.cursos.length,
    0,
  );

  return (
    <DashboardShell
      active="parameters"
      eyebrow="Catálogo operativo"
      title="Consultoras"
    >
      {backendUnavailable ? (
        <p className="mb-6 max-w-4xl text-sm leading-6 text-on-surface-variant">
          Consultoras está funcionando temporalmente sin datos en vivo porque no se
          pudo acceder al servicio de consultoras. La página sigue disponible, pero el
          registro y los formularios deben tratarse como offline hasta que el backend
          responda nuevamente.
        </p>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <SectionFrame className="bg-surface-container-lowest">
          <div className="max-w-2xl">
              <StatusBadge tone="archived">Consultoras</StatusBadge>
              <h2 className="mt-5 font-headline text-5xl font-bold tracking-tight text-primary">
                Gestionar consultoras y cursos
              </h2>
              <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                Esta sección centraliza la configuración de consultoras y te muestra
                en vivo el catálogo de cursos de cada una.
              </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.2rem] bg-surface-container-low px-5 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/70">
                Consultoras activas
              </p>
              <p className="mt-3 font-headline text-4xl font-bold text-primary">
                {activeCount}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-[#fde9cf] px-5 py-5 text-[#6f4310]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b6220]">
                Excel habilitado
              </p>
              <p className="mt-3 font-headline text-4xl font-bold">
                {excelEnabledCount}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-surface-container-high px-5 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/70">
                Cursos registrados
              </p>
              <p className="mt-3 font-headline text-4xl font-bold text-primary">
                {totalCursos}
              </p>
            </div>
          </div>
        </SectionFrame>

        <SectionFrame className="bg-surface-container-lowest xl:self-start">
          <div>
            <StatusBadge tone="review">Acciones rápidas</StatusBadge>
            <h3 className="mt-4 font-headline text-4xl font-bold text-primary">
              Agregar registros
            </h3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Abrí los formularios de consultoras y cursos sin salir de la página.
            </p>
          </div>

          <ParametersManagementPanel
            consultoras={consultoras}
            backendUnavailable={backendUnavailable}
          />
        </SectionFrame>

      </div>

      <section className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-headline text-4xl font-bold text-primary">
              Registro de consultoras
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Resumen de cada consultora con sus respectivos cursos
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.2rem] border border-outline-variant/18 bg-surface-container-low px-5 py-4 text-sm leading-6 text-on-surface-variant">
          Los cursos se administran desde esta sección y después quedan disponibles para clasificar clases pendientes e históricas.
        </div>

        {consultoras.length > 0 ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            {consultorasWithCursos.map(({ consultora, cursos }) => (
              <SectionFrame
                key={consultora.id}
                className="relative bg-surface-container-lowest"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-headline text-3xl font-bold text-primary">
                        {consultora.nombre}
                      </h4>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {consultora.descripcion ?? "Todavía no hay descripción."}
                      </p>
                    </div>
                  </div>

                  <StatusBadge tone={consultora.activa ? "confirmed" : "danger"}>
                    {consultora.activa ? "Activa" : "Inactiva"}
                  </StatusBadge>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.1rem] bg-surface-container-low px-5 py-4">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                        Reporte
                      </span>
                    </div>
                <p className="mt-3 text-lg font-semibold text-primary">
                  {consultora.requiereReporteExcel ? "Excel habilitado" : "Excel deshabilitado"}
                </p>
              </div>
                </div>

                <div className="mt-8 rounded-[1.2rem] border border-dashed border-outline-variant/45 bg-surface-container-low p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <CalendarRange className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                          Cursos
                        </span>
                      </div>
                      <p className="mt-3 text-lg font-semibold text-primary">
                        {cursos.length > 0
                          ? `${cursos.length} curso${cursos.length === 1 ? "" : "s"} registrado${cursos.length === 1 ? "" : "s"}`
                          : "Todavía no hay cursos registrados"}
                      </p>
                    </div>
                    <CalendarRange className="hidden h-6 w-6 text-on-surface-variant/60 sm:block" />
                  </div>

                  {cursos.length > 0 ? (
                    <div className="mt-5 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {cursos.slice(0, 4).map((curso) => (
                          <div
                            key={curso.id}
                            className="group/course relative rounded-xl bg-surface px-4 py-3 pr-24"
                          >
                            <CourseCardActions
                              curso={curso}
                              consultoras={consultoras}
                              backendUnavailable={backendUnavailable}
                            />
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                              Curso #{curso.id}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-primary">
                              {curso.empresa}
                              {curso.grupo ? ` - ${curso.grupo}` : ""}
                            </p>
                            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                              {curso.activa ? "Activa" : "Inactiva"}
                            </p>
                          </div>
                        ))}
                      </div>

                      {cursos.length > 4 ? (
                        <div
                          className="rounded-xl border border-outline-variant/18 bg-surface px-4 py-3"
                        >
                          <details>
                            <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                              Ver los {cursos.length} cursos
                            </summary>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {cursos.slice(4).map((curso) => (
                                <div
                                  key={curso.id}
                                  className="group/course relative rounded-xl bg-surface-container-low px-4 py-3 pr-24"
                                >
                                  <CourseCardActions
                                    curso={curso}
                                    consultoras={consultoras}
                                    backendUnavailable={backendUnavailable}
                                  />
                                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                                    Curso #{curso.id}
                                  </p>
                                  <p className="mt-2 text-sm font-semibold text-primary">
                                    {curso.empresa}
                                    {curso.grupo ? ` - ${curso.grupo}` : ""}
                                  </p>
                                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                                    {curso.activa ? "Activa" : "Inactiva"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-xl bg-surface px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        Estado del catálogo
                      </p>
                      <p className="mt-2 text-sm font-medium text-primary">
                        Todavía no hay cursos para esta consultora.
                      </p>
                    </div>
                  )}
                </div>
              </SectionFrame>
            ))}
          </div>
        ) : (
          <SectionFrame className="mt-6 bg-surface-container-lowest text-center">
            <div className="mx-auto flex max-w-xl flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-container-high text-on-surface-variant">
                <Building2 className="h-7 w-7" />
              </div>
              <h4 className="mt-6 font-headline text-4xl font-bold text-primary">
                Todavía no hay consultoras
              </h4>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                Creá la primera consultora desde el formulario de arriba para empezar
                a gestionar los indicadores de reporte y los mapeos de cursos.
              </p>
            </div>
          </SectionFrame>
        )}
      </section>
    </DashboardShell>
  );
}
