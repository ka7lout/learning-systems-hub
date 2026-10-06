import type { Metadata } from "next";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "IH AI Engineering — Learning OS",
  description: "Ismaili Harvard AI Engineering curriculum: a Harvard-informed, state-adaptive learning operating system for AI engineers.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
