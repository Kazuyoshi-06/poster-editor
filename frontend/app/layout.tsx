import type { Metadata } from 'next';
import { Inter, Bebas_Neue, Oswald, Montserrat } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Polices disponibles dans l'éditeur (chargées globalement)
const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Poster Editor',
  description: "Éditeur d'affiches professionnel — Aegyo Show & Événements",
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${bebasNeue.variable} ${oswald.variable} ${montserrat.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="h-full bg-[#0f0f0f] text-white antialiased">
        <TooltipProvider>
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
