import { LearningApp } from "@/components/learning-app";
import { ensureCurriculumSeeded } from "@/lib/curriculum/seed";
import { getCurrentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureCurriculumSeeded();
  const session = await getCurrentSession();
  const user = session?.user ? { name: session.user.name, email: session.user.email } : null;
  return <LearningApp user={user} />;
}
