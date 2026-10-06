import { getCurrentUser } from "@/lib/auth";
import { getUserStats } from "@/lib/queries";
import { redirect } from "next/navigation";
import Shell from "./_components/Shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const stats = await getUserStats(user.id);
  return (
    <Shell
      user={{ id: user.id, email: user.email, displayName: user.displayName }}
      stats={{
        xp: stats.xp,
        level: stats.level,
        streak: stats.streak,
        reviewDue: stats.reviewDue,
      }}
    >
      {children}
    </Shell>
  );
}
