export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import "./globals.css";
import { getUser, getSettings } from "@/lib/auth";

export const metadata: Metadata = {
  title: "IHLS — Ismaili Harvard AI Engineering Learning OS",
  description: "A Harvard-informed (not Harvard-affiliated) AI engineering self-study system built on retrieval, spacing, transfer and evidence.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let theme = "system", text = "base", motion = "full", lang = "en";
  try {
    const u = await getUser();
    if (u) { const s = (await getSettings(u.id)).data; theme = s.theme; text = s.textSize; motion = s.reducedMotion ? "reduce" : "full"; lang = s.uiLanguage; }
  } catch { /* DB unavailable: render with defaults */ }
  return (
    <html lang={lang} data-theme={theme} data-text={text} data-motion={motion}>
      <body className="min-h-screen bg-bg text-ink">{children}</body>
    </html>
  );
}
