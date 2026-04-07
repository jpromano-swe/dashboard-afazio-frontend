import { ArrowLeft } from "lucide-react";
import { ActionButton, DashboardShell } from "@/components/editorial";
import { ReportModuleWorkbench } from "@/components/report-module-workbench";
import { loadReportWorkspace } from "@/lib/report-workspace";

type HasklerSearchParams = {
  periodo?: string | string[];
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePeriodKey(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
}

export default async function HasklerReportPage({
  searchParams,
}: {
  searchParams: Promise<HasklerSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedDate = parsePeriodKey(firstValue(resolvedSearchParams.periodo)) ?? new Date();
  const data = await loadReportWorkspace(
    {
      moduleName: "Módulo Haskler Group",
      consultoraName: "Haskler Group",
      theme: "amber",
    },
    selectedDate,
  );

  return (
    <DashboardShell
      active="reports"
      eyebrow="Reportes / Haskler Group"
      title="Módulo Haskler Group"
      actions={
        <ActionButton href="/reports" variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
          Todos los módulos
        </ActionButton>
      }
    >
      <ReportModuleWorkbench
        data={data}
        title="Paquete de facturación mensual"
        subtitle="Elegí el mes de facturación, revisá el contador de clases, previsualizá el workbook y generá el XLSX antes de redactar el correo."
      />
    </DashboardShell>
  );
}
