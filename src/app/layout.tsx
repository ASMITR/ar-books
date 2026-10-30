import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Asmit Rajaramkar — Author & eBook Store",
    template: "%s | Asmit Rajaramkar",
  },
  description:
    "Explore and purchase original eBooks by Asmit Rajaramkar — business, personal development, fiction, and more.",
  openGraph: {
    siteName: "AR Books",
    type: "website",
    images: [{ url: "/Main_Logo.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAF9F6] antialiased">
        <AuthProvider>
          <CartProvider>
            <PublicShell>{children}</PublicShell>
          </CartProvider>
        </AuthProvider>

        {/* ── Google Analytics 4 ─────────────────────────────────────────── */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
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
