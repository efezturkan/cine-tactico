import type { Metadata, Viewport } from "next";
import { BRAND_NAME, SITE_URL, ENTITY_SENTENCE } from "@/config/brand";
import { Inter, Newsreader, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { SalonAtmosphere } from "@/components/SalonAtmosphere";

// Yazı tipleri derleme sırasında indirilip uygulamaya gömülür (çevrimdışı çalışır, çalışma anında ağ isteği yok).
// latin-ext: Türkçe karakterler (ğ, ş, İ, ı) için gerekli.
const fontSans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
const fontSerif = Newsreader({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
  adjustFontFallback: false,
});
const fontDisplay = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${BRAND_NAME}: Movie Trivia Game for iPhone | Film Bilgi Yarışması`,
  description:
    "Crosscut is a free offline movie trivia game. Name a film that fits two clues, beat bots in 12 seconds, and play one shared Daily Reel puzzle. Crosscut, ücretsiz çevrimdışı film bilgi oyunu: iki ipucunun kesiştiği filmi bul.",
  applicationName: BRAND_NAME,
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    title: `${BRAND_NAME}: Movie Trivia Game for iPhone`,
    description: ENTITY_SENTENCE,
    url: SITE_URL,
    locale: "en_US",
    alternateLocale: ["tr_TR"],
  },
  twitter: { card: "summary", title: `${BRAND_NAME}: Movie Trivia Game`, description: ENTITY_SENTENCE },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND_NAME,
  },
};

// Yapılandırılmış veri (SEO/GEO): yalnızca doğru olanlar. Puan/yorum, indirme bağlantısı ve sameAs, gerçekleşince eklenecek.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": ["SoftwareApplication", "VideoGame"],
  name: BRAND_NAME,
  url: SITE_URL,
  description: ENTITY_SENTENCE,
  applicationCategory: "GameApplication",
  operatingSystem: "iOS",
  gamePlatform: "iOS",
  genre: ["Trivia", "Puzzle", "Strategy"],
  inLanguage: ["en", "tr"],
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0B0D12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${fontSans.variable} ${fontSerif.variable} ${fontDisplay.variable}`} style={{ backgroundColor: "#0B0D12", colorScheme: "dark" }}>
      <body
        className="bg-[#0B0D12] text-[#E8E6E1] antialiased min-h-screen"
        style={{ backgroundColor: "#0B0D12", colorScheme: "dark" }}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        {children}
        <SalonAtmosphere />
      </body>
    </html>
  );
}
