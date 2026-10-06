import { getCurrentUser } from "@/lib/auth";
import { getDiagnosticDone } from "@/lib/queries";
import { redirect } from "next/navigation";
import Diagnostic from "../_components/Diagnostic";

export const dynamic = "force-dynamic";

export default async function DiagnosticPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const done = await getDiagnosticDone(user.id);
  return <Diagnostic alreadyDone={done} />;
}
