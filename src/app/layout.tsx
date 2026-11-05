import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SalonAtmosphere } from "@/components/SalonAtmosphere";

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
    <html lang="tr" style={{ backgroundColor: "#0B0D12", colorScheme: "dark" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&family=Inter:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,600&display=swap"
          rel="stylesheet"
        />
      </head>
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
