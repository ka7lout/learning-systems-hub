"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addNoteAction } from "@/lib/actions";

export default function AddNote() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!body.trim()) return;
    setBusy(true);
    await addNoteAction({ body: body.trim(), type: "short" });
    setBody("");
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="surface p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide muted">New note</h3>
      <textarea
        className="mt-2"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a keyword, formula, or question — keep it short."
      />
      <button className="btn btn-primary mt-3" disabled={busy} onClick={save}>
        {busy ? "Saving…" : "Save note"}
      </button>
    </div>
  );
}
