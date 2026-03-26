import Link from "next/link";
import { ArrowRight, FileSpreadsheet, ScrollText } from "lucide-react";
import { DashboardShell, SectionFrame } from "@/components/editorial";

const MODULES = [
  {
    href: "/reports/haskler-group",
    tag: "Haskler Group",
    title: "Módulo Haskler Group",
    description:
      "Flujo mensual de facturación, generación de Excel, vista previa del workbook y envío de correo simulado.",
    accent:
      "bg-[#f6e6a8] text-[#302400] border-[#dcc56f]",
    button:
      "bg-[#f2dd91] text-[#5b4700] hover:bg-[#ead47c]",
    icon: <FileSpreadsheet className="h-6 w-6" />,
  },
  {
    href: "/reports/blc-consulting",
    tag: "BLC Consulting",
    title: "Módulo BLC Consulting",
    description:
      "Segundo módulo de facturación con el mismo flujo de exportación, adaptado al reporte de BLC.",
    accent:
      "bg-[#d8cff3] text-[#32245f] border-[#c2b2ea]",
    button:
      "bg-[#efe9ff] text-[#5b46ab] hover:bg-[#e2d8fb]",
    icon: <ScrollText className="h-6 w-6" />,
  },
] as const;

export default function ReportsPage() {
  return (
    <DashboardShell active="reports" eyebrow="Módulos de facturación" title="Reportes">
      <SectionFrame className="bg-surface-container-lowest p-3 sm:p-4">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-10 flex flex-col items-center gap-3 px-3 pt-6 text-center sm:px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/70">
              Consultoras disponibles
            </p>
            <h2 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              Elegí un módulo de reporte
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-on-surface-variant">
              Entrá al módulo de cada consultora para elegir el período, revisar las clases facturables y generar el archivo correspondiente.
            </p>
          </div>

          <div className="grid justify-center gap-8 p-4 md:grid-cols-2">
            {MODULES.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className={`group mx-auto flex min-h-[270px] w-full max-w-[420px] flex-col justify-between rounded-[1.75rem] border p-7 shadow-[0_18px_36px_rgba(6,27,14,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(6,27,14,0.12)] ${module.accent}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] opacity-70">
                      {module.tag}
                    </p>
                    <h2 className="mt-4 font-headline text-4xl font-bold tracking-tight">
                      {module.title}
                    </h2>
                    <p className="mt-4 max-w-sm text-sm leading-7 opacity-90">
                      {module.description}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/8">
                    {module.icon}
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-between gap-4">
                  <span />
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${module.button}`}
                  >
                    Abrir
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </SectionFrame>
    </DashboardShell>
  );
}
