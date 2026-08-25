import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { ImeRPProvider } from '@/context/ImeRPContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';

export const metadata: Metadata = {
  title: 'MarszLive - IME Roleplay Multi-Stream Hub',
  description: 'Nonton livestream server IME Roleplay GTA V (#imeroleplay #imerp) dari berbagai gang (Vagabond, KZN, 4Blood, Olsen, Police/PD, dll.) secara langsung dalam 1 klik dengan mode Multi-View.',
  keywords: 'imeroleplay live, imerp stream, vagabond live, kzn live, 4blood live, olsen live, gta roleplay indonesia live, multistream imerp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <ImeRPProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5">
              {children}
            </main>
            <Footer />
            <CookieConsentBanner />
          </ImeRPProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
