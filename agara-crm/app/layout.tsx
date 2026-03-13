import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Agara Life | Distributor Hub',
  description: 'Grow your wellness community, share your story, and track your momentum.',
  keywords: 'Agara Life, wellness, distributor, health, community',
  openGraph: {
    title: 'Agara Life Distributor Hub',
    description: 'Your personal hub for growing the Agara community.',
    siteName: 'Agara Life',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} tropical-bg min-h-screen`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
