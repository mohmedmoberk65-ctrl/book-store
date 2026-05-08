import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";
import ParticlesBackground from "@/components/ParticlesBackground";

export const metadata: Metadata = {
  title: {
    default: "سنتر الأوائل - احجز كتبك الجامعية الآن",
    template: "%s | سنتر الأوائل",
  },
  description:
    "سنتر الأوائل - احجز كتبك الجامعية الآن! الكمية محدودة. اختار سنتك الدراسية واحصل على كتبك بسهولة مع خدمة الدفع الإلكتروني.",
  keywords: [
    "كتب جامعية",
    "سنتر الأوائل",
    "شراء كتب",
    "كتب السنة الأولى",
    "كتب السنة الثانية",
    "كتب السنة الثالثة",
    "كتب السنة الرابعة",
    "كتب السنة الخامسة",
    "حجز كتب",
    "منصة كتب",
  ],
  authors: [{ name: "سنتر الأوائل" }],
  creator: "سنتر الأوائل",
  publisher: "سنتر الأوائل",
  openGraph: {
    type: "website",
    locale: "ar_AR",
    siteName: "سنتر الأوائل",
    title: "سنتر الأوائل - احجز كتبك الجامعية الآن",
    description:
      "احجز كتبك الجامعية من سنتر الأوائل. الكمية محدودة! سارع بالحجز.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "سنتر الأوائل",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "سنتر الأوائل - احجز كتبك الجامعية الآن",
    description:
      "احجز كتبك الجامعية من سنتر الأوائل. الكمية محدودة!",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen animated-gradient">
        <Providers>
          <ParticlesBackground />
          <main className="relative z-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
