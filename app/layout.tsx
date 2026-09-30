import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Montserrat } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/landing/Kit";
import { MotionProvider } from "@/components/Motion";
import { WhatsAppFloat } from "@/components/WhatsAppButton";
import { site } from "@/content/site";
import { waMessages } from "@/lib/whatsapp";
import "./globals.css";

const display = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const body = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Reduzen — Mesoterapia & Spa en Torreón | Faciales, corporales y láser",
    template: "%s | Reduzen Spa Torreón",
  },
  description: site.description,
  keywords: [
    "spa Torreón",
    "mesoterapia Torreón",
    "Hydrafacial Torreón",
    "faciales Torreón",
    "depilación láser Torreón",
    "Bubble Oxygen Facial",
    "microneedling Torreón",
    "uñas y pedicure Torreón",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: site.fullName,
    title: "Reduzen — Mesoterapia & Spa en Torreón",
    description: "Este es tu momento. Desconecta, renueva tu energía y florece desde adentro. Agenda por WhatsApp.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Reduzen — Mesoterapia & Spa, Torreón" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reduzen — Mesoterapia & Spa en Torreón",
    description: "Faciales, corporales, uñas, pedicure y depilación láser. Agenda por WhatsApp.",
    images: ["/og-image.jpg"],
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ec",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["DaySpa", "BeautySalon"],
  "@id": `${site.url}/#negocio`,
  name: site.fullName,
  alternateName: "Reduzen Spa",
  description: site.description,
  url: site.url,
  image: `${site.url}/og-image.jpg`,
  logo: `${site.url}/logo.png`,
  telephone: site.phoneE164,
  email: site.email,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  areaServed: { "@type": "City", name: "Torreón" },
  sameAs: [site.social.facebook, site.social.instagram].filter(Boolean),
  // PLACEHOLDER: agregar "geo" (lat/lng) y "openingHoursSpecification" cuando se confirmen.
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios Reduzen",
    itemListElement: [
      "Tratamientos faciales",
      "Tratamientos corporales",
      "Uñas",
      "Pedicure",
      "Depilación láser",
    ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-MX" className={`${display.variable} ${body.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <MotionProvider>
          <SiteHeader />
          <main id="contenido">{children}</main>
          <SiteFooter />
          <WhatsAppFloat message={waMessages.floating} />
        </MotionProvider>
      </body>
    </html>
  );
}
