import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ismaili Harvard AI Engineering Learning OS",
  description:
    "A Harvard-informed, learning-science-driven self-study operating system for AI Engineering — mastery, transfer, projects, and evidence. Not a Harvard credential.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
