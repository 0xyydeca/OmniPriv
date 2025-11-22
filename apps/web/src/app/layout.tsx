import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { CDPProvider } from '@/components/CDPProvider';
import { ModalBackdropFix } from '@/components/ModalBackdropFix';
import { ToastProvider } from '@/components/Toast';

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
        <CDPProvider>
          <Providers>
            <ToastProvider>
              <ModalBackdropFix />
              {children}
            </ToastProvider>
          </Providers>
        </CDPProvider>
      </body>
    </html>
  );
}

