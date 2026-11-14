import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { ContentProtection } from "@/components/shared/ContentProtection";
import { CartProvider } from "@/hooks/useCart";
import { AuthProvider } from "@/hooks/useAuth";

const GA_ID = process.env.NEXT_PUBLIC_FB_MEASUREMENT_ID ?? "G-1GQS036EF5";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.asmitrajaramkarbooks.store")
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  ),
  title: {
    default: "Asmit Rajaramkar — Author & eBook Store",
    template: "%s | Asmit Rajaramkar",
  },
  description:
    "Explore and purchase original eBooks by Asmit Rajaramkar — business, personal development, fiction, and more.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/icon.png",
  },
  openGraph: {
    siteName: "AR Books",
    type: "website",
    images: [{
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.asmitrajaramkarbooks.store"}/og-image.png`,
      width: 1200,
      height: 630,
      alt: "Asmit Rajaramkar Books — Official eBook Store",
    }],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.asmitrajaramkarbooks.store"}/og-image.png`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF9F6] antialiased select-none">
        <ContentProtection />
        <AuthProvider>
          <CartProvider>
            <PublicShell>{children}</PublicShell>
          </CartProvider>
        </AuthProvider>

        {/* ── Google Analytics 4 ─────────────────────────────────────────── */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="lazyOnload"
        />
        <Script id="ga4-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { send_page_view: true });
          `}
        </Script>
      </body>
    </html>
  );
}
