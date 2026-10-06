export const dynamic = 'force-dynamic';
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ismaili Harvard AI Engineering Learning OS",
  description:
    "A learning system for AI engineering: curriculum graph, mastery engine, projects, evidence, career mapping and technical English.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#141820" },
  ],
};

/** Theme is applied before paint to avoid a flash; it reads the saved preference only. */
const THEME_SCRIPT = `(function(){try{
  var p=localStorage.getItem('ihls.prefs');var s=p?JSON.parse(p):{};
  var t=s.theme||'system';
  var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  if(dark)document.documentElement.classList.add('dark');
  if(s.textSize)document.documentElement.setAttribute('data-text-size',s.textSize);
  if(s.readingDensity)document.documentElement.setAttribute('data-density',s.readingDensity);
  if(s.reducedMotion)document.documentElement.setAttribute('data-reduced-motion','true');
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-[var(--accent)] focus:px-3 focus:py-2 focus:text-[var(--accent-ink)]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
