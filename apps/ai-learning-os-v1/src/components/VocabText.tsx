import type { ReactNode } from "react";

type Term = { term: string; simpleDefinition: string; arabic: string; example: string };

/** Vocabulary assistance: advanced terms get a native tooltip (title) and dotted underline. Pure server-renderable. */
export function VocabText({ text, terms }: { text: string; terms: Term[] }) {
  if (!terms.length) return <>{text}</>;
  const map = new Map(terms.map((t) => [t.term.toLowerCase(), t]));
  const pattern = new RegExp(`\\b(${terms.map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(pattern)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const t = map.get(m[0].toLowerCase())!;
    out.push(<abbr key={i++} title={`${t.simpleDefinition}${t.arabic ? ` · ${t.arabic}` : ""}\nExample: ${t.example}`} className="cursor-help underline decoration-dotted decoration-accent/60 underline-offset-2">{m[0]}</abbr>);
    last = start + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
