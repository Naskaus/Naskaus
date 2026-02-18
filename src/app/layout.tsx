import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NASKAUS. | WebApp Incubator Platform',
  description: 'Personal WebApp Incubator by Nosk. Where operations meets intelligence.',
  keywords: ['webapp', 'incubator', 'development', 'AI', 'automation'],
  authors: [{ name: 'Nosk' }],
  openGraph: {
    title: 'NASKAUS.',
    description: 'Personal WebApp Incubator by Nosk',
    url: 'https://naskaus.com',
    siteName: 'NASKAUS.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Load all 4 fonts with display=swap */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="custom-cursor-active">
        {children}
      </body>
    </html>
  );
}
