import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';

// Display font for headings and UI labels — bold, industrial
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Body font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ALIBEL · Detección automática de emergencias médicas súbitas en cabina',
  description:
    'ALIBEL detecta automáticamente emergencias médicas súbitas (EMS) en operadores de maquinaria pesada dentro de cabinas industriales. Prueba de concepto — Artefacto 6.',
  keywords: ['ALIBEL', 'EMS', 'emergencia médica', 'maquinaria pesada', 'seguridad industrial', 'monitoreo'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-display antialiased">{children}</body>
    </html>
  );
}
