import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SEO Keyword Analyzer',
    template: '%s | SEO Keyword Analyzer',
  },
  description: 'Analyze your text to identify keyword density and combinations. Find top keywords, track word frequency, and discover keyword combinations for SEO optimization.',
  keywords: ['SEO', 'keyword analyzer', 'keyword density', 'text analysis', 'SEO tools', 'content optimization'],
  authors: [{ name: 'SEO Analyzer Team' }],
  creator: 'SEO Analyzer',
  publisher: 'SEO Analyzer',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://seo-analyzer.vercel.app'),
  openGraph: {
    title: 'SEO Keyword Analyzer',
    description: 'Analyze your text to identify keyword density and combinations for SEO optimization.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'SEO Keyword Analyzer',
    description: 'Analyze your text to identify keyword density and combinations for SEO optimization.',
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
      <body>{children}</body>
    </html>
  );
}
