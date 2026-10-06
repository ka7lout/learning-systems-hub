import Link from "next/link";
import { AuthForm } from "@/components/client";

export default function Register() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Your progress, notes and evidence are private to your account.</p>
      <AuthForm mode="register" />
      <p className="mt-4 text-sm text-muted">Already registered? <Link className="text-accent underline" href="/login">Sign in</Link></p>
    </main>
  );
}
