import Link from "next/link";
import { ArrowRight, FileSpreadsheet, ScrollText } from "lucide-react";
import { DashboardShell, SectionFrame, StatusBadge } from "@/components/editorial";

const MODULES = [
  {
    href: "/reports/haskler-group",
    tag: "Haskler Group",
    title: "Módulo Haskler Group",
    description:
      "Flujo mensual de facturación, generación de Excel, vista previa del workbook y envío de correo simulado.",
    accent:
      "bg-gradient-to-br from-[#fffbe8] via-[#f8edc8] to-[#efd87d] text-[#302400] border-[#e0cf79]",
    button:
      "bg-[#f5e9b8] text-[#5b4700] hover:bg-[#efe0a3]",
    icon: <FileSpreadsheet className="h-6 w-6" />,
  },
  {
    href: "/reports/blc-consulting",
    tag: "BLC Consulting",
    title: "Módulo BLC Consulting",
    description:
      "Segundo módulo de facturación con el mismo flujo de exportación, adaptado al reporte de BLC.",
    accent:
      "bg-gradient-to-br from-[#f4f0ff] via-[#e3dbff] to-[#cdbff3] text-[#32245f] border-[#cbbef0]",
    button:
      "bg-[#ede7ff] text-[#5b46ab] hover:bg-[#e3dbff]",
    icon: <ScrollText className="h-6 w-6" />,
  },
] as const;

export default function ReportsPage() {
  return (
    <DashboardShell active="reports" eyebrow="Módulos de facturación" title="Reportes">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <SectionFrame className="p-1">
          <div className="grid gap-5 p-5 md:grid-cols-2">
            {MODULES.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className={`group flex min-h-[230px] flex-col justify-between rounded-[1.6rem] border p-6 transition hover:-translate-y-0.5 ${module.accent}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] opacity-70">
                      {module.tag}
                    </p>
                    <h2 className="mt-4 font-headline text-4xl font-bold tracking-tight">
                      {module.title}
                    </h2>
                    <p className="mt-3 max-w-sm text-sm leading-6 opacity-90">
                      {module.description}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/10">
                    {module.icon}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <StatusBadge tone="confirmed">Abrir módulo</StatusBadge>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${module.button}`}
                  >
                    Abrir
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </SectionFrame>

        <SectionFrame className="bg-surface-container-lowest">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/70">
            Configuración del módulo
          </p>
          <h3 className="mt-5 font-headline text-5xl font-bold tracking-tight text-primary">
            Dos consultoras. Dos flujos de reporte.
          </h3>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            Haskler tiene el espacio completo de facturación: selección de período,
            contador de clases, generación de XLSX, vista previa del workbook y
            envío de correo simulado. BLC usa el mismo patrón y puede extenderse con
            su propio contrato sin cambiar la navegación principal.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-[1.1rem] border border-outline-variant/15 bg-surface-container-low px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                Herramienta de exportación
              </p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                La generación de XLSX ya está conectada al endpoint de reportes del backend.
              </p>
            </div>
            <div className="rounded-[1.1rem] border border-outline-variant/15 bg-surface-container-low px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                Vista previa
              </p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                La vista previa del workbook se muestra como tabla de facturación
                antes de descargar el archivo.
              </p>
            </div>
            <div className="rounded-[1.1rem] border border-outline-variant/15 bg-surface-container-low px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                Correo
              </p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                El envío se simula en la UI hasta que esté listo el contrato de correo del backend.
              </p>
            </div>
          </div>
        </SectionFrame>
      </div>
    </DashboardShell>
  );
}
