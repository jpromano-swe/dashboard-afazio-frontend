import { DashboardShell, PageActions } from "@/components/editorial";
import { DashboardContent } from "@/components/dashboard-content";
import { getDashboardData } from "@/lib/api";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const data = await getDashboardData();
  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <DashboardShell
      active="dashboard"
      eyebrow={formattedDate}
      title={data.headerTitle}
      actions={<PageActions />}
    >
      <DashboardContent data={data} />
    </DashboardShell>
  );
}
