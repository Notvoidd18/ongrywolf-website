import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getCurrentSession } from '@/lib/auth';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { NightSkyBackground } from '@/components/NightSkyBackground';

export const metadata: Metadata = {
  title: 'Ongrywolf — Official Startup Website & Systems',
  description:
    'Minecraft creations, powerful Discord bots, custom clients, and builds made with purpose. Built for worlds beyond ordinary.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen flex flex-col bg-transparent text-slate-100 font-sans antialiased selection:bg-brand-600 selection:text-white">
        <NightSkyBackground />
        <SmoothScrollProvider>
          <Navbar session={session} />
          <main className="flex-1 flex flex-col relative">{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
