export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "IHLS — AI Engineering Learning OS",
  description: "A human-centered, evidence-first AI Engineering learning environment.",
  applicationName: "IHLS Learning System",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
