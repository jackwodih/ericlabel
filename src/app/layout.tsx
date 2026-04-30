import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Label Eric | Étiquettes de Qualité Premium en Afrique",
  description: "Personnalisez vos étiquettes en cuir, satin et métal. Fabrication express et livraison dans toute l'Afrique.",
};

import { WhatsAppContact } from "@/components/ui/WhatsAppContact";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <WhatsAppContact />
      </body>
    </html>
  );
}
