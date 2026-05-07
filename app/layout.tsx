import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ALIBEL · Detección automática de emergencias médicas súbitas en cabina',
  description:
    'ALIBEL es una solución de monitoreo que detecta automáticamente emergencias médicas súbitas (EMS) en operadores de maquinaria pesada dentro de cabinas de faenas industriales y mineras. Prueba de concepto — Artefacto 6.',
  keywords: ['ALIBEL', 'EMS', 'emergencia médica', 'maquinaria pesada', 'seguridad industrial', 'monitoreo'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
