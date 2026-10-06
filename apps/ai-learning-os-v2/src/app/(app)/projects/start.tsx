"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartProject({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <button className="btn" disabled={busy} onClick={async () => {
        setBusy(true); setErr(null);
        const r = await fetch("/api/me", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ op: "startProject", catalogId: id }) });
        const j = await r.json().catch(() => ({}));
        setBusy(false);
        if (!r.ok) return setErr(j.error ?? "Could not start project");
        router.push(`/projects/${j.id}`);
      }}>{busy ? "Starting…" : "Start project"}</button>
      {err && <p role="alert" className="mt-1 text-xs text-bad">{err}</p>}
    </>
  );
}
