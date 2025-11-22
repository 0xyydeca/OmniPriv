import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
// TODO: Enable CDP when wallet integration is ready
// import { CDPProvider } from '@/components/CDPProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OmniPriv - Privacy-Preserving Cross-Chain Identity',
  description: 'Verify user attributes (KYC/age/country) without doxxing users or fragmenting identity across chains',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        {/* TODO: Wrap with CDPProvider when wallet integration is ready */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

