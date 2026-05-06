// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "SocioManager",
  description: "Consultoría Socioeconómica",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      {/* Añadimos suppressHydrationWarning para que las extensiones del navegador 
        no rompan el ciclo de vida de React al inyectar atributos.
      */}
      <body className="min-h-full flex flex-col bg-gray-50" suppressHydrationWarning>
        <AuthProvider>
          <Header />
          <main className="flex-grow">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}