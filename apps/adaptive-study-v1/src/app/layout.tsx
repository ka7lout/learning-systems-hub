export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "IUG Adaptive Study OS",
  description: "Personal University Learning Operating System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
