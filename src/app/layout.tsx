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

import { settingsService } from "@/lib/firebase/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await settingsService.getSettings();
  
  const title = settings?.seoTitle || "Label Eric | Étiquettes de Qualité Premium en Afrique";
  const description = settings?.seoDescription || "Personnalisez vos étiquettes en cuir, satin et métal. Fabrication express et livraison dans toute l'Afrique.";
  const keywords = settings?.seoKeywords || "étiquettes, personnalisation, cuir, satin, textile, afrique";
  const url = settings?.domain || "https://labeleric.com";
  const shareImage = settings?.ogImage || "/og-image.jpg";
  
  return {
    title,
    description,
    keywords,
    metadataBase: new URL(url.startsWith('http') ? url : `https://${url}`),
    icons: {
      icon: settings?.favicon || '/favicon.ico',
      shortcut: settings?.favicon || '/favicon.ico',
      apple: settings?.favicon || '/favicon.ico',
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Label Eric',
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [shareImage],
    },
  };
}

import { WhatsAppContact } from "@/components/ui/WhatsAppContact";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Footer />
        <WhatsAppContact />
      </body>
    </html>
  );
}
