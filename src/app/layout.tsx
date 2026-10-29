import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { CartProvider } from "@/hooks/useCart";
import { AuthProvider } from "@/hooks/useAuth";

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
      </body>
    </html>
  );
}
