import type { Metadata, Viewport } from "next";
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
  title: "CINE-XOX | Kareyi Seç. Rakibini Oku.",
  description:
    "3×3 taktiksel sinema düellosu. İki ipucu, bir film, 12 saniye. Üçlü hattı kur, kareyi mühürle!",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CINE-XOX",
  },
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
        {children}
        <SalonAtmosphere />
      </body>
    </html>
  );
}
