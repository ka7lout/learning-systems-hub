import { signInAction } from "@/lib/actions";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="surface w-full max-w-md p-8">
        <p className="text-xs uppercase tracking-[0.18em] brand">IUG Adaptive Study OS</p>
        <h1 className="mt-2 text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 muted text-sm">
          Sign in to see exactly what you should study next.
        </p>
        {sp.error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            Email or password was not recognised.
          </p>
        )}
        <form action={signInAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm muted">Email</label>
            <input name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <label className="mb-1 block text-sm muted">Password</label>
            <input name="password" type="password" required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Sign in
          </button>
        </form>
        <p className="mt-5 text-sm muted">
          No account?{" "}
          <Link href="/signup" className="brand hover:underline">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
