import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. Importamos el proveedor de autenticación y el Header
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. Personalizamos los metadatos de la PWA
export const metadata: Metadata = {
  title: "SocioManager | Consultoría Socioeconómica",
  description: "Plataforma integral de gestión de consultas y entrevistas",
  manifest: "/manifest.json", // Importante para la PWA más adelante
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es" // Cambiado a español
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-slate-900">
        {/* 3. Envolvemos todo con el AuthProvider */}
        <AuthProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          {/* Aquí podrías añadir un Footer global más adelante */}
        </AuthProvider>
      </body>
    </html>
  );
}