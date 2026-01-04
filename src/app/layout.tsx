import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'How Early on Base?',
  description: 'Discover how early your wallet was on Base. Check your OG status!',
  openGraph: {
    title: 'How Early on Base?',
    description: 'Discover how early your wallet was on Base.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Early on Base?',
    description: 'Discover how early your wallet was on Base.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
