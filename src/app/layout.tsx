import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'How Early on Base? | Check Your Wallet',
  description: 'Discover how early your wallet was on Base and mint a soulbound NFT badge to prove it.',
  openGraph: {
    title: 'How Early on Base?',
    description: 'Check how early your wallet was on Base and mint your badge!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Early on Base?',
    description: 'Check how early your wallet was on Base and mint your badge!',
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
