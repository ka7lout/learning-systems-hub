import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ismaili Harvard AI Engineering Learning OS",
  description: "A Harvard-informed, research-informed AI Engineering pathway delivered through the Ismaili Harvard Learning Science method.",
};

const themeScript = `(function(){try{var t=localStorage.getItem('ihl-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);if(localStorage.getItem('ihl-text')==='large')document.documentElement.classList.add('text-large');if(localStorage.getItem('ihl-motion')==='reduce')document.documentElement.classList.add('reduce-motion');}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
