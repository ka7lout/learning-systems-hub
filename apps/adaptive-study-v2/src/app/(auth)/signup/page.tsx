import { signUpAction } from "@/lib/actions";
import Link from "next/link";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="surface w-full max-w-md p-8">
        <p className="text-xs uppercase tracking-[0.18em] brand">IUG Adaptive Study OS</p>
        <h1 className="mt-2 text-2xl font-semibold">Create your account</h1>
        <p className="mt-2 muted text-sm">
          Your progress, mistakes and reviews are stored privately and tied to your account.
        </p>
        {sp.error === "invalid" && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            Enter a valid email and a password of at least 6 characters.
          </p>
        )}
        {sp.error === "exists" && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            An account with that email already exists.
          </p>
        )}
        <form action={signUpAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm muted">Name (optional)</label>
            <input name="name" autoComplete="name" />
          </div>
          <div>
            <label className="mb-1 block text-sm muted">Email</label>
            <input name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <label className="mb-1 block text-sm muted">Password</label>
            <input name="password" type="password" required autoComplete="new-password" minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Create account
          </button>
        </form>
        <p className="mt-5 text-sm muted">
          Already have an account?{" "}
          <Link href="/login" className="brand hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
