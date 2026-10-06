import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PlannerClient from "../_components/PlannerClient";

export const dynamic = "force-dynamic";

export default async function PlannerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <PlannerClient />;
}
