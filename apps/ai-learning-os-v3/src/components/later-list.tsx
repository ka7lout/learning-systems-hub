"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { resolveLater } from "@/app/actions";

export function ResolveLaterButton({ id }: { id: number }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn"
      disabled={pending}
      aria-label="Mark parked thought as handled"
      onClick={() => start(() => void resolveLater(id))}
    >
      <Check size={12} /> Done
    </button>
  );
}
