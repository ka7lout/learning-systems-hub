import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  let user = null;
  try { user = await getUser(); } catch { /* fall through to public page */ }
  if (user) redirect("/dashboard");
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium text-accent">Ismaili Harvard Learning Science</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">An AI engineering curriculum that measures what you can do, not what you watched.</h1>
      <p className="mt-4 text-muted">A Harvard-informed, research-informed self-study pathway — from Python and linear algebra to RAG, agents and production ML. Every topic is learned through attempt, retrieval, transfer and real project evidence. This is not a Harvard program and grants no Harvard credential.</p>
      <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
        <li className="card p-3">All 8 original modules preserved, plus labelled Harvard College, Harvard Extension, industry and research layers.</li>
        <li className="card p-3">Attempt-first AI mentor with hints, checks and guardrails against dependency.</li>
        <li className="card p-3">Spaced review that adapts to failures and transfer performance.</li>
        <li className="card p-3">Skill and career gaps computed only from your evidence.</li>
      </ul>
      <div className="mt-8 flex gap-3"><Link href="/register" className="btn btn-primary">Create account</Link><Link href="/login" className="btn">Sign in</Link></div>
    </main>
  );
}
