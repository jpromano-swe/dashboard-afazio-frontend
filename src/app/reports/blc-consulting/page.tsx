import { ArrowLeft } from "lucide-react";
import { ActionButton, DashboardShell } from "@/components/editorial";
import { ReportModuleWorkbench } from "@/components/report-module-workbench";
import { loadReportWorkspace } from "@/lib/report-workspace";

type BLCSearchParams = {
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

  return new Date(year, month - 1, 1);
}

export default async function BLCReportPage({
  searchParams,
}: {
  searchParams: Promise<BLCSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedDate = parsePeriodKey(firstValue(resolvedSearchParams.periodo)) ?? new Date();
  const data = await loadReportWorkspace(
    {
      moduleName: "Módulo BLC Consulting",
      consultoraName: "BLC Consulting",
      theme: "purple",
    },
    selectedDate,
  );

  return (
    <DashboardShell
      active="reports"
      eyebrow="Reportes / BLC Consulting"
      title="Módulo BLC Consulting"
      actions={
        <ActionButton href="/reports" variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
          Todos los módulos
        </ActionButton>
      }
    >
      <ReportModuleWorkbench
        data={data}
        title="Espacio de facturación"
        subtitle="Usá el mismo flujo de facturación que Haskler, pero con la plantilla y el tono de BLC."
      />
    </DashboardShell>
  );
}
