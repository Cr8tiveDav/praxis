import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Praxis — Todo & Notes Hub',
  description: 'High-performance personal productivity application combining structured tasks, subtasks checklists, priority filters, and contextual notes.',
  keywords: ['todo', 'notes', 'productivity', 'task manager', 'markdown notes'],
  authors: [{ name: 'Praxis Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/*
          Inline script: runs synchronously before first paint.
          Reads the saved theme from localStorage and sets data-theme on <html>
          so there is never a flash of the wrong theme, and zero React state involved.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('praxis-theme');
                  document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
