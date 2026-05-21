import './globals.css';

export const metadata = {
  title: 'Vector Store — Diseños Deportivos Premium',
  description: 'Encuentra más de 12.000 vectores de camisetas deportivas para tu equipo. Diseños únicos de fútbol, motocross, básquet y más.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
