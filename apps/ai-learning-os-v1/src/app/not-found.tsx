import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-muted">This page or record does not exist, or it belongs to another account.</p>
      <Link href="/dashboard" className="btn btn-primary mt-4">Back to dashboard</Link>
    </main>
  );
}
