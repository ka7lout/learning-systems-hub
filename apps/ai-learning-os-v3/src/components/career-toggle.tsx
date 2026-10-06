"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { toggleCareerTarget } from "@/app/actions";

export function TargetToggle({ roleId, active }: { roleId: string; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn"
      disabled={pending}
      aria-pressed={active}
      style={active ? { borderColor: "var(--accent)", background: "var(--accent-soft)", color: "var(--accent)" } : undefined}
      onClick={() => start(() => void toggleCareerTarget(roleId))}
    >
      <Star size={13} /> {active ? "Target role" : "Set as target"}
    </button>
  );
}
