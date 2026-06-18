import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import AppLayout from "@/components/AppLayout";
import NotificationListener from "@/components/NotificationListener";
import FloatingChat from "@/components/FloatingChat";

const font = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PinjemLur — Nggak Perlu Beli, PinjemLur Aja!",
  description:
    "Platform penyewaan barang #1 di Indonesia. Nggak Perlu Beli, PinjemLur Aja! Sewa kamera, alat camping, konsol game, dan ribuan barang lainnya dengan mudah, aman, dan terjangkau.",
  keywords: "sewa barang, rental, pinjem, kamera, camping, konsol game, sewa murah",
  openGraph: {
    type: "website",
    url: "https://PinjemLur.com",
    title: "PinjemLur — Nggak Perlu Beli, PinjemLur Aja!",
    description: "Nggak Perlu Beli, PinjemLur Aja! Platform penyewaan barang #1 di Indonesia.",
    siteName: "PinjemLur",
  },
  icons: {
    icon: "/ikon-web.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${font.variable} h-full antialiased`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" style={{ minHeight: "100vh" }} suppressHydrationWarning>
        <ThemeProvider>
          <WishlistProvider>
            <NotificationListener />
            <FloatingChat />
            <AppLayout>{children}</AppLayout>
          </WishlistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
