import DashboardApp from "@/app/components/dashboard-app";
import { getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getDashboardData();
  return <DashboardApp initialData={data} />;
}
