import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MATEUSMUSTE // OS',
  description: 'Interactive brutalist portfolio OS by Mateus Muste. A creative web experience featuring games, apps, and hidden easter eggs.',
  authors: [{ name: 'Mateus Muste' }],
  openGraph: {
    type: 'website',
    url: 'https://mateusmuste.com/',
    title: 'MATEUSMUSTE // OS',
    description: 'Interactive brutalist portfolio OS. A creative web experience featuring games, apps, and hidden easter eggs.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MATEUSMUSTE // OS',
    description: 'Interactive brutalist portfolio OS. A creative web experience featuring games, apps, and hidden easter eggs.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#E8E8E8',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* VT323 font for ASCII art */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
