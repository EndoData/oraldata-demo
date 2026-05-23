import type { Metadata } from "next";
import { Suspense } from "react";
import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import { EditorProvider } from "@/lib/editor";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { BookingModal } from "@/components/booking/BookingModal";
import "./globals.css";

const sans = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "OralData — Logiciel clinique dentaire",
  description:
    "Retrouvez votre temps. Maîtrisez votre cabinet. OralData centralise vos dossiers, vos radios et vos protocoles cliniques — pensé pour tout type de praticien.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "OralData — Retrouvez votre temps",
    description:
      "Un logiciel clinique pensé par des praticiens, pour les praticiens. Centralisez vos dossiers, vos radios et vos protocoles — et récupérez des heures chaque jour.",
    type: "website",
    locale: "fr_FR",
    siteName: "OralData",
  },
  twitter: {
    card: "summary_large_image",
    title: "OralData — Retrouvez votre temps",
    description:
      "Un logiciel clinique pensé par des praticiens, pour les praticiens.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ink font-sans selection:bg-brand-200 selection:text-brand-900">
        <Suspense fallback={null}>
          <EditorProvider>
            <BookingProvider>
              {children}
              <BookingModal />
            </BookingProvider>
          </EditorProvider>
        </Suspense>
      </body>
    </html>
  );
}
