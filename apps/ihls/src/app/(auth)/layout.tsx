import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="min-h-screen grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between border-r border-line p-10 bg-[var(--surface-2)]">
        <div>
          <p className="h-section">Ismaili Harvard</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">AI Engineering Learning OS</h1>
          <p className="mt-4 max-w-md text-ink-2">
            A curriculum graph, a mastery engine, real projects and an evidence trail — built so that progress means
            demonstrated competence, not completed videos.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-ink-2 max-w-md">
          <li>— The original curriculum is preserved in full: 8 modules, 293 topics, 21 projects.</li>
          <li>— Harvard material is mapped and labelled with its verification status, never invented.</li>
          <li>— Mastery comes from evidence: unaided retrieval, transfer, implementation, debugging, projects.</li>
          <li>— Empty states are truthful. Nothing here simulates progress you have not made.</li>
        </ul>
        <p className="text-xs text-ink-3">
          Not affiliated with Harvard University. Course references are mappings to publicly documented offerings.
        </p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {children}
          <p className="mt-8 text-center text-xs text-ink-3">
            <Link href="/" className="underline underline-offset-2">About this system</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
