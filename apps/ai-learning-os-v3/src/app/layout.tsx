export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ismaili Harvard AI Engineering Learning OS",
  description:
    "A Harvard-informed, research-informed AI Engineering pathway delivered through the Ismaili Harvard Learning Science operating model.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const store = await cookies();
  const theme = store.get("ihls_theme")?.value ?? "light";
  const motion = store.get("ihls_motion")?.value ?? "full";
  const text = store.get("ihls_text")?.value ?? "normal";
  const density = store.get("ihls_density")?.value ?? "normal";

  return (
    <html lang="en" data-theme={theme} data-motion={motion} data-text={text} data-density={density}>
      <body>{children}</body>
    </html>
  );
}
