import type { Metadata } from 'next';
import { Fraunces, Geist_Mono, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { AuthProvider } from '@/context/AuthContext';
import ServiceWorkerCleaner from '@/components/ServiceWorkerCleaner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const headingFont = localFont({
  src: '../../public/fonts/mistical-spring.ttf',
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'e-Voting',
  description: 'Secure, verifiable electronic voting platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${fraunces.variable} ${headingFont.variable}`}
    >
      <body suppressHydrationWarning className="min-h-screen bg-canvas font-sans text-ink antialiased">
        <ServiceWorkerCleaner />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
