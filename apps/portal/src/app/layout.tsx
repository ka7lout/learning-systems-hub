import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learning Systems Hub — AI Engineering Learning OS Collection",
  description:
    "A curated collection of AI Engineering learning systems. Navigate between 12+ learning platforms covering curriculum, mastery, spaced review, projects, career mapping, and AI mentoring.",
  openGraph: {
    title: "Learning Systems Hub",
    description: "12+ AI Engineering Learning Systems in one place",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {/* Animated background orbs */}
        <div className="bg-orb bg-orb-1" aria-hidden="true" />
        <div className="bg-orb bg-orb-2" aria-hidden="true" />
        <div className="bg-orb bg-orb-3" aria-hidden="true" />

        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
