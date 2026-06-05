import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import { EditorProvider } from "@/lib/editor";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { BookingModal } from "@/components/booking/BookingModal";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { GTM_ID } from "@/lib/analytics";
import { copy } from "@/lib/copy";
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
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--color-accent-300:${copy.theme.accent.light};--color-accent-500:${copy.theme.accent.base};--color-accent-700:${copy.theme.accent.dark};}`,
          }}
        />
        <Script id="dataLayer-init" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
// Consent Mode v2 — denied by default until user opts in
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});`}
        </Script>
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </head>
      <body className="min-h-full bg-canvas text-ink font-sans selection:bg-brand-200 selection:text-brand-900">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Suspense fallback={null}>
          <EditorProvider>
            <BookingProvider>
              {children}
              <BookingModal />
              <ConsentBanner />
            </BookingProvider>
          </EditorProvider>
        </Suspense>
      </body>
    </html>
  );
}
