import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ismaili Harvard AI Engineering Learning OS",
  description:
    "A Harvard-informed, research-informed AI Engineering self-study system: curriculum graph, mastery engine, projects, evidence, career mapping and technical English. Not a Harvard credential.",
};

const themeScript = `(function(){try{var s=localStorage.getItem('ihls-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
