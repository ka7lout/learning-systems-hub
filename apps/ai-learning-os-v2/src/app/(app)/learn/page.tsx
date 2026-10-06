import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { nextBestTask } from "@/lib/dal";

export default async function LearnIndex() {
  const u = await requireUser();
  const t = await nextBestTask(u.id);
  redirect(t ? `/learn/${t.nodeId}` : "/curriculum");
}
