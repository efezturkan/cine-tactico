import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineXOX | Sinema & Dizi 3x3 Taktik Düellosu",
  description: "Film ve dizi kültürünün günlük 3x3 XOX oyunu. Yönetmenler, oyuncular ve Oscar'larla 3'lü hat yap, streak'ini koru!",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineXOX",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b0d13",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" style={{ backgroundColor: "#0b0d13", colorScheme: "dark" }}>
      <body
        className="bg-[#0b0d13] text-white antialiased min-h-screen"
        style={{ backgroundColor: "#0b0d13", colorScheme: "dark" }}
      >
        {children}
      </body>
    </html>
  );
}
