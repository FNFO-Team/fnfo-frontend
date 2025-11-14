import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Friday Night Funkin' Multiplayer",
  description: "Versión multijugador del juego Friday Night Funkin'",
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
