import Link from "next/link";
import { AuthForm } from "@/components/client";

export default function Login() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Continue where you left off.</p>
      <AuthForm mode="login" />
      <p className="mt-4 text-sm text-muted">No account? <Link className="text-accent underline" href="/register">Create one</Link></p>
    </main>
  );
}
